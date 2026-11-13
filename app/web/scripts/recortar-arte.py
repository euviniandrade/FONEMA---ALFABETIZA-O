#!/usr/bin/env python3
"""Recorta figuras 3D de uma folha com fundo claro (ícones e figuras das atividades) e salva WebP com transparência.

Uso:
  python3 scripts/recortar-arte.py folha.png COLUNASxLINHAS saida_dir nome1,nome2,...  [tamanho]
Cada célula é recortada, o fundo claro ligado à borda (inclusive a sombra) vira transparente, a figura é
aparada e centralizada num quadrado. Nomes vazios ou "-" são ignorados.
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def recortar(cel: Image.Image, tamanho: int) -> Image.Image:
    rgb = np.asarray(cel.convert('RGB')).astype(np.float32)
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    # modo padrão: tira o fundo e a sombra; RECORTE=estrito: só o branco puro (figuras brancas ficam inteiras;
    # a sombra suave fica, para figuras usadas sempre sobre cartão branco)
    fundo = (sat < 0.03) & (mx > 244) if os.environ.get('RECORTE') == 'estrito' else (sat < 0.085) & (mx > 178)
    m = Image.fromarray((fundo * 255).astype(np.uint8), 'L')
    g = Image.new('L', (m.width + 2, m.height + 2), 255)
    g.paste(m, (1, 1))
    ImageDraw.floodfill(g, (0, 0), 128)
    fora = np.asarray(g.crop((1, 1, m.width + 1, m.height + 1))) == 128
    alfa = Image.fromarray(((~fora) * 255).astype(np.uint8), 'L')
    alfa = alfa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(alfa).astype(np.float32) / 255
    # tira a contaminação do branco nas bordas
    aa = np.maximum(a, 0.05)[..., None]
    cor = np.clip((rgb - (1 - aa) * 250) / aa, 0, 255)
    out = Image.fromarray(np.dstack([cor, a[..., None] * 255]).astype(np.uint8), 'RGBA')
    # mantém só o que importa: caixa do conteúdo
    caixa = Image.fromarray((a > 0.1).astype(np.uint8) * 255).getbbox()
    if caixa:
        out = out.crop(caixa)
    lado = int(max(out.size) * 1.06)
    q = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    q.paste(out, ((lado - out.width) // 2, (lado - out.height) // 2))
    return q.resize((tamanho, tamanho), Image.LANCZOS)


def main():
    folha, grade, saida, nomes = sys.argv[1:5]
    tamanho = int(sys.argv[5]) if len(sys.argv) > 5 else 256
    col, lin = map(int, grade.lower().split('x'))
    im = Image.open(folha).convert('RGB')
    os.makedirs(saida, exist_ok=True)
    cw, ch = im.width / col, im.height / lin
    for i, nome in enumerate(nomes.split(',')):
        nome = nome.strip()
        if not nome or nome == '-':
            continue
        x, y = i % col, i // col
        m = 0.025  # margem: tira eventuais linhas da grade
        cel = im.crop((round((x + m) * cw), round((y + m) * ch), round((x + 1 - m) * cw), round((y + 1 - m) * ch)))
        recortar(cel, tamanho).save(os.path.join(saida, nome + '.webp'), quality=88, method=6)
        print('ok', nome)


if __name__ == '__main__':
    main()
