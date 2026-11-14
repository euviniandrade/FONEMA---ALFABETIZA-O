#!/usr/bin/env python3
"""Gera figuras 3D pela API da MiniMax (modelo image-01, o mais econômico) e recorta o fundo.
A chave é injetada pelo proxy do ambiente (nunca fica em código). Uso:
  gerar-figura-minimax.py <saida.webp> "<descrição em inglês do objeto>" [--tamanho 220] [--bruto pasta]
O estilo e o fundo branco são acrescentados aqui, para todas as figuras saírem no mesmo padrão."""
import base64, json, os, sys, urllib.request
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as nd

ESTILO = (", single object, stylized 3D animated family film render, soft rounded shapes, glossy clean materials, "
          "cheerful saturated colors, soft studio lighting, centered, whole object visible with margin, "
          "isolated on a plain flat pure white background, no text, no letters, no people")

def gerar(prompt):
    req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
        headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
        data=json.dumps({'model': 'image-01', 'prompt': prompt + ESTILO, 'aspect_ratio': '1:1', 'response_format': 'base64', 'n': 1}).encode())
    d = json.load(urllib.request.urlopen(req, timeout=240))
    if d.get('base_resp', {}).get('status_code') != 0: sys.exit(f"MiniMax: {d.get('base_resp')}")
    return base64.b64decode(d['data']['image_base64'][0])

def recortar(im):
    a = np.asarray(im.convert('RGB')).astype(int)
    claro = (a.min(2) > 232) & ((a.max(2) - a.min(2)) < 14)          # branco do fundo
    rot, _ = nd.label(claro)
    borda = set(np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))) - {0}
    fundo = np.isin(rot, list(borda))                                  # só o branco ligado à borda
    fg = nd.binary_opening(~fundo, iterations=2)
    rot2, n = nd.label(fg)
    if n > 1:
        tam = nd.sum(fg, rot2, range(1, n + 1)); fg = np.isin(rot2, [i + 1 for i, t in enumerate(tam) if t > tam.max() * 0.03])
    alfa = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.3))
    out = im.convert('RGBA'); out.putalpha(alfa)
    return out.crop(out.getbbox())

if __name__ == '__main__':
    saida, prompt = sys.argv[1], sys.argv[2]
    tam = int(sys.argv[sys.argv.index('--tamanho') + 1]) if '--tamanho' in sys.argv else 220
    bruto = sys.argv[sys.argv.index('--bruto') + 1] if '--bruto' in sys.argv else None
    dados = gerar(prompt)
    if bruto:
        os.makedirs(bruto, exist_ok=True); open(os.path.join(bruto, os.path.basename(saida).rsplit('.', 1)[0] + '.jpg'), 'wb').write(dados)
    import io
    fig = recortar(Image.open(io.BytesIO(dados)))
    fig.thumbnail((tam - 12, tam - 12), Image.LANCZOS)
    tela = Image.new('RGBA', (tam, tam), (0, 0, 0, 0)); tela.alpha_composite(fig, ((tam - fig.width) // 2, (tam - fig.height) // 2))
    tela.save(saida, quality=92); print('ok', saida)
