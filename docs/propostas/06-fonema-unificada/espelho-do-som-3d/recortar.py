#!/usr/bin/env python3
"""Prepara as imagens do Espelho do Som (Pillow + numpy). Uso: python3 recortar.py

1. Raio-X híbrido: nas bases v2-raio-x-*.png o exterior (cabeça de vidro, cabelo, estrelas) é ótimo, mas o
   interior da boca (dentes de dentadura, língua) não é confiável. Aqui "apagamos" a boca e a garganta:
   o buraco é preenchido por difusão a partir da borda (tom do vidro), com borda suave e um leve
   escurecimento. Por cima, o boneco animado (espelho-svg.js) desenha as posições corretas.
2. Rostos de frente: recorta cada retrato das pranchas e um close da boca (zoom 3x).
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
IMG, OUT = os.path.join(AQUI, 'imagens'), os.path.join(AQUI, 'recortes')
os.makedirs(OUT, exist_ok=True)

# região a apagar (boca, dentes, língua, garganta) em pixels da imagem 1376×768
APAGAR = {
    'sofia': ('v2-raio-x-sofia.png', [
        [(632, 338), (700, 322), (800, 318), (870, 326), (906, 350), (912, 410), (900, 460), (862, 498), (780, 508), (690, 496), (648, 462), (630, 410)],
        [(905, 400), (950, 395), (1000, 430), (1005, 620), (940, 630), (912, 520)]]),
    'tales': ('v2-raio-x-tales-L.png', [
        [(520, 382), (560, 366), (650, 362), (712, 376), (726, 430), (716, 484), (680, 504), (600, 508), (545, 498), (522, 462), (516, 420)],
        [(690, 500), (770, 505), (780, 585), (700, 590)]]),
}


def apaga(nome, arq, polis):
    im = Image.open(os.path.join(IMG, arq)).convert('RGB')
    W, H = im.size
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    for p in polis:
        d.polygon(p, fill=255)
    m = m.filter(ImageFilter.MaxFilter(9))
    a = np.asarray(im).astype(np.float32)
    mk = np.asarray(m) > 0
    # difusão: preenche o buraco com as cores da borda (várias passadas de desfoque em escala reduzida)
    f = 4
    peq = a[::f, ::f].copy()
    mp = mk[::f, ::f]
    peq[mp] = peq[~mp].mean(axis=0)
    for _ in range(220):
        b = np.asarray(Image.fromarray(peq.astype(np.uint8)).filter(ImageFilter.BoxBlur(2))).astype(np.float32)
        peq[mp] = b[mp]
    cheio = np.asarray(Image.fromarray(peq.astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
    # tom de "vidro" um pouco mais escuro e azulado dentro da boca
    cheio = cheio * 0.86 + np.array([8, 18, 40], np.float32) * 0.14
    suave = np.asarray(m.filter(ImageFilter.GaussianBlur(10))).astype(np.float32)[..., None] / 255.0
    out = a * (1 - suave) + cheio * suave
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, f'raiox-{nome}-limpo.jpg'), quality=90)
    print('raio-X limpo:', nome)


for nome, (arq, polis) in APAGAR.items():
    apaga(nome, arq, polis)

# rostos de frente: (arquivo, caixa do retrato, centro da boca)
ROSTOS = {
    'sofia-M': ('sofia-bocas-M-A-O-S.png', (0, 0, 684, 382), (355, 220)),
    'sofia-A': ('sofia-bocas-M-A-O-S.png', (692, 0, 1376, 382), (1033, 224)),
    'sofia-O': ('sofia-bocas-M-A-O-S.png', (0, 388, 684, 768), (355, 608)),
    'sofia-S': ('sofia-bocas-M-A-O-S.png', (692, 388, 1376, 768), (1033, 606)),
    'sofia-F': ('v2-sofia-bocas-F-L-CH-E.png', (0, 0, 688, 384), (357, 224)),
    'sofia-L': ('v2-sofia-bocas-F-L-CH-E.png', (688, 0, 1376, 384), (1022, 228)),
    'sofia-CH': ('v2-sofia-bocas-F-L-CH-E.png', (0, 384, 688, 768), (356, 616)),
    'sofia-E': ('v2-sofia-bocas-F-L-CH-E.png', (688, 384, 1376, 768), (1029, 617)),
    'tales-M': ('v2-tales-bocas-M-U-I-K.png', (0, 0, 344, 384), (172, 243)),
    'tales-U': ('v2-tales-bocas-M-U-I-K.png', (688, 0, 1032, 384), (859, 255)),
    'tales-I': ('v2-tales-bocas-M-U-I-K.png', (0, 384, 344, 768), (172, 633)),
    'tales-E': ('v2-tales-bocas-M-U-I-K.png', (688, 384, 1032, 768), (860, 637)),
    'tales-A': ('v2-tales-bocas-M-U-I-K.png', (1032, 384, 1376, 768), (1203, 640)),
    'tales-O': ('v2-tales-bocas-M-U-I-K.png', (344, 0, 688, 384), (516, 254)),
}
for nome, (arq, caixa, (cx, cy)) in ROSTOS.items():
    im = Image.open(os.path.join(IMG, arq)).convert('RGB')
    im.crop(caixa).save(os.path.join(OUT, f'rosto-{nome}.jpg'), quality=90)
    w, h = 132, 96
    b = im.crop((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)).resize((w * 3, h * 3), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 70, 2))
    b.save(os.path.join(OUT, f'boca-{nome}.jpg'), quality=92)
print('rostos e bocas:', len(ROSTOS))

# ---------------------------------------------------------------------------------------------
# 3. Estilos escolhidos pelo dono (D020): "Boca gigante" (frente) e "3D fofinho" (lado)
from collections import deque
OPC = os.path.join(AQUI, 'estilos-opcoes')


def boca_gigante():
    """Camada da FRENTE com a cavidade da boca vazada (alfa 0): a língua animada fica entre o fundo e
    esta camada, então dentes e lábios da ilustração ficam sempre na frente da língua."""
    im = Image.open(os.path.join(OPC, 'base-frente-boca-vazia.png')).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    H, W = a.shape[:2]
    br, sat = a.min(axis=2), a.max(axis=2) - a.min(axis=2)
    dente = (br > 175) & (sat < 60)                     # branco/cinza claro dos dentes
    yy, xx = np.mgrid[0:H, 0:W]
    elipse = ((xx - 695) / 214.0) ** 2 + ((yy - 362) / 228.0) ** 2 <= 1
    ok = elipse & ~dente
    vis = np.zeros((H, W), bool); q = deque([(380, 690)]); vis[380, 690] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < H and 0 <= nx < W and ok[ny, nx] and not vis[ny, nx]:
                vis[ny, nx] = True; q.append((ny, nx))
    # tapa os buraquinhos (úvula, brilhos) dentro da cavidade: o que não se alcança por fora é cavidade
    fora = np.zeros((H, W), bool); q = deque([(0, 0)]); fora[0, 0] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < H and 0 <= nx < W and not vis[ny, nx] and not fora[ny, nx]:
                fora[ny, nx] = True; q.append((ny, nx))
    vis = ~fora & elipse | vis
    vis = vis & ~(dente & ~np.asarray(Image.fromarray((vis * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(15))).astype(bool))
    m = Image.fromarray((vis * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.convert('RGBA'); rgba.putalpha(Image.eval(m, lambda v: 255 - v))
    rgba.save(os.path.join(OUT, 'frente-camada.png'), optimize=True)
    im.save(os.path.join(OUT, 'frente-fundo.jpg'), quality=92)
    print('boca gigante: camada da frente com a cavidade vazada')


def lado_3d():
    """Janelinha da bochecha da Sofia 3D: apaga os dentes de IA e as notinhas do pescoço (difusão
    suave a partir da borda). O boneco fiel (espelho-svg.js, personagem 'lado3d') é desenhado por cima."""
    arq = 'base-lado-3d-vazia.png'
    polis = [[(610, 215), (660, 182), (760, 168), (880, 168), (960, 196), (985, 250), (990, 330), (975, 400), (930, 450), (840, 472), (720, 466), (640, 430), (606, 360), (600, 280)],
             [(565, 538), (705, 538), (705, 628), (565, 628)],
             [(985, 258), (1040, 258), (1072, 286), (1070, 318), (1062, 348), (1028, 358), (992, 350)]]  # lábios (o boneco desenha os seus)
    im = Image.open(os.path.join(OPC, arq)).convert('RGB')
    W, H = im.size
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for p in polis:
        d.polygon(p, fill=255)
    a = np.asarray(im).astype(np.float32); mk = np.asarray(m) > 0
    f = 4; peq = a[::f, ::f].copy(); mp = mk[::f, ::f]
    peq[mp] = peq[~mp].mean(axis=0)
    for _ in range(220):
        b = np.asarray(Image.fromarray(peq.astype(np.uint8)).filter(ImageFilter.BoxBlur(2))).astype(np.float32)
        peq[mp] = b[mp]
    cheio = np.asarray(Image.fromarray(peq.astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(5))).astype(np.float32)
    # dentro da janela: rosa macio com profundidade (mais escuro no fundo da boca)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.clip(np.sqrt(((xx - 760) / 260.0) ** 2 + ((yy - 320) / 170.0) ** 2), 0, 1)[..., None]
    rosa = np.array([150, 62, 92], np.float32) * (1 - r) + np.array([236, 168, 180], np.float32) * r
    janela = np.zeros((H, W), np.uint8); ImageDraw.Draw(Image.fromarray(janela)); mj = Image.new('L', (W, H), 0); ImageDraw.Draw(mj).polygon(polis[0], fill=255)
    pj = np.asarray(mj.filter(ImageFilter.GaussianBlur(14))).astype(np.float32)[..., None] / 255.0
    cheio = cheio * (1 - pj) + rosa * pj
    suave = np.asarray(m.filter(ImageFilter.GaussianBlur(6))).astype(np.float32)[..., None] / 255.0
    out = a * (1 - suave) + cheio * suave
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, 'lado3d-sofia-limpo.jpg'), quality=92)
    print('3D fofinho: janela limpa')


boca_gigante()
lado_3d()
