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
