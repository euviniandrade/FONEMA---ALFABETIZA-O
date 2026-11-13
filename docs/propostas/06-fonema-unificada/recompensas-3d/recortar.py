#!/usr/bin/env python3
"""Recorta selos e objetos das pranchas em imagens/ -> recortes/*.png (fundo transparente).

Uso: python3 recortar.py   (a partir desta pasta; precisa de Pillow e numpy)
1. Fundo: pixels quase brancos ligados à borda (flood fill com tolerância) viram transparentes.
   O branco de dentro (páginas do livro, brilhos) fica, porque não toca a borda.
2. Borda suave: na faixa de 3 px junto ao fundo, a opacidade vem da "distância do branco"
   e a cor é des-misturada do branco (sem halo claro).
3. Pranchas com vários itens: componentes conexos na máscara reduzida (1/4), com caixas.
"""
import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
TOL = 34          # distância máxima do branco para ser candidato a fundo
FAIXA = 3         # px de borda suave


def mascara_fundo(rgb):
    dist = 255 - rgb.min(axis=2).astype(np.int16)           # 0 = branco puro
    sat = rgb.max(axis=2).astype(np.int16) - rgb.min(axis=2)
    cand = (dist < TOL) & (sat < 26)
    fundo = np.zeros_like(cand)
    fundo[0, :] = cand[0, :]; fundo[-1, :] = cand[-1, :]; fundo[:, 0] = cand[:, 0]; fundo[:, -1] = cand[:, -1]
    while True:
        d = fundo.copy()
        d[1:, :] |= fundo[:-1, :]; d[:-1, :] |= fundo[1:, :]; d[:, 1:] |= fundo[:, :-1]; d[:, :-1] |= fundo[:, 1:]
        d &= cand
        if (d == fundo).all():
            return fundo, dist
        fundo = d


def dilata(m, n):
    for _ in range(n):
        d = m.copy()
        d[1:, :] |= m[:-1, :]; d[:-1, :] |= m[1:, :]; d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m


def recorta_rgba(img):
    rgb = np.asarray(img.convert('RGB')).astype(np.float32)
    fundo, dist = mascara_fundo(rgb.astype(np.uint8))
    alfa = np.where(fundo, 0.0, 1.0)
    faixa = dilata(fundo, FAIXA) & ~fundo
    alfa = np.where(faixa, np.clip(dist / 70.0, 0, 1), alfa)
    a = Image.fromarray((alfa * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    alfa = np.asarray(a).astype(np.float32) / 255.0
    alfa[fundo & ~dilata(~fundo, 1)] = 0
    # des-mistura do branco: c = (c - (1-a)*255) / a
    am = np.maximum(alfa, 0.05)[..., None]
    cor = np.clip((rgb - (1 - am) * 255) / am, 0, 255)
    cor = np.where(alfa[..., None] > 0.98, rgb, cor)
    out = np.dstack([cor, alfa * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), ~fundo


def componentes(fg, escala=4, minimo=400):
    h, w = fg.shape
    p = fg[: h - h % escala, : w - w % escala].reshape(h // escala, escala, w // escala, escala).any(axis=(1, 3))
    H, W = p.shape
    vis = np.zeros_like(p)
    rot = np.zeros(p.shape, np.int32)
    caixas = []
    for y in range(H):
        for x in range(W):
            if p[y, x] and not vis[y, x]:
                q = deque([(y, x)]); vis[y, x] = True; n = 0; idc = len(caixas) + 1
                y0 = y1 = y; x0 = x1 = x
                while q:
                    cy, cx = q.popleft(); n += 1; rot[cy, cx] = idc
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for ny in (cy - 1, cy, cy + 1):
                        for nx in (cx - 1, cx, cx + 1):
                            if 0 <= ny < H and 0 <= nx < W and p[ny, nx] and not vis[ny, nx]:
                                vis[ny, nx] = True; q.append((ny, nx))
                caixas.append([x0 * escala, y0 * escala, (x1 + 1) * escala, (y1 + 1) * escala, n, idc])
    caixas = [c for c in caixas if c[4] * escala * escala >= minimo * 16]
    return caixas, rot


def salva(rgba, caixa, nome, rot, escala=4, margem=6):
    x0, y0, x1, y1 = caixa[:4]
    W, H = rgba.size
    # só o componente deste item (sem pedaços de vizinhos nem pontinhos soltos)
    m = np.kron(rot == caixa[5], np.ones((escala, escala), bool))
    m = np.pad(m, ((0, H - m.shape[0]), (0, W - m.shape[1])))
    m = dilata(m, 2)
    arr = np.asarray(rgba).copy(); arr[..., 3] = np.where(m, arr[..., 3], 0)
    rgba = Image.fromarray(arr, 'RGBA')
    c = rgba.crop((max(0, x0 - margem), max(0, y0 - margem), min(W, x1 + margem), min(H, y1 + margem)))
    bb = c.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if bb:
        c = c.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), min(c.width, bb[2] + 2), min(c.height, bb[3] + 2)))
    c.save(os.path.join(AQUI, 'recortes', nome + '.png'), optimize=True)
    print(f'{nome}.png  {c.size}  (caixa na prancha: {x0},{y0},{x1},{y1})')


def prancha(arquivo, nomes, ordem):
    img = Image.open(os.path.join(AQUI, 'imagens', arquivo))
    rgba, fg = recorta_rgba(img)
    caixas, rot = componentes(fg)
    cx = sorted(caixas, key=lambda c: -c[4])[: len(nomes)]
    cx = sorted(cx, key=ordem)
    for c, n in zip(cx, nomes):
        salva(rgba, c, n, rot)


os.makedirs(os.path.join(AQUI, 'recortes'), exist_ok=True)
linha_coluna = lambda c: (round(c[1] / 320), c[0])  # ordem de leitura (linhas de ~320 px)
prancha('selo-meu-nome.png', ['selo-meu-nome'], linha_coluna)
prancha('selo-guardiao-niveis.png', ['guardiao-bronze', 'guardiao-prata', 'guardiao-ouro', 'guardiao-diamante'], lambda c: c[0])
prancha('selos-colecao-6.png', ['mestre-do-som', 'cacador-de-silabas', 'amigo-que-inclui',
                                'leitor-gentil', 'cuidador-dos-animais', 'craque-do-fair-play'], linha_coluna)
prancha('moedas-cofrinho-trofeu-bau.png', ['moeda', 'moedas-pilha', 'moeda-voando', 'cofrinho-tatu',
                                         'trofeu-mestre-leitor', 'bau-livros'], linha_coluna)
