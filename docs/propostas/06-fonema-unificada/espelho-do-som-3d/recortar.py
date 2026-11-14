#!/usr/bin/env python3
"""Prepara as imagens do Espelho do Som (Pillow + numpy). Uso: python3 recortar.py

1. Rostos de frente (exercício "Imite"): recorta cada retrato das pranchas e um close da boca (zoom 3x).
2. "Boca gigante" (frente): camada da frente com a cavidade vazada, para a língua passar por trás dos dentes.
3. Perfil 3D (lado): recorte alinhado da Sofia e do Tales.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
IMG, OUT = os.path.join(AQUI, 'imagens'), os.path.join(AQUI, 'recortes')
os.makedirs(OUT, exist_ok=True)

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
    rgba.crop((480, 120, 920, 680)).save(os.path.join(OUT, 'frente-camada.png'), optimize=True)  # só a região da boca: x 480–920, y 120–680
    im.save(os.path.join(OUT, 'frente-fundo.jpg'), quality=92)
    for v in 'UOMFI':  # as outras bocas (visemas) em JPG leve
        Image.open(os.path.join(OPC, f'base-frente-{v}.png')).convert('RGB').save(os.path.join(OUT, f'frente-{v}.jpg'), quality=90)
    print('boca gigante: camada da frente com a cavidade vazada')


def lado_perfil():
    """Perfil 3D (Sofia e Tales) para a vista DE LADO: recorta a cabeça de modo que o meio dos lábios caia
    sempre no mesmo ponto (1130, 760) de uma imagem 1800×1200. A janelinha e a boca por dentro são
    desenhadas por código (espelho-lado.js) por cima."""
    # meio dos lábios em pixels da base 2752×1536
    for nome, (lx, ly) in {'sofia': (1686, 771), 'tales': (1710, 892)}.items():
        im = Image.open(os.path.join(OPC, f'base-lado-{nome}-perfil.jpg')).convert('RGB')
        f = 1.376 / 2  # pixels da base por pixel do recorte
        x0, y0 = lx - 1130 * f, ly - 760 * f
        c = im.crop((round(x0), round(y0), round(x0 + 1800 * f), round(y0 + 1200 * f))).resize((1800, 1200), Image.LANCZOS)
        c.save(os.path.join(OUT, f'lado-{nome}.jpg'), quality=88)
        print('perfil de lado:', nome)


boca_gigante()
lado_perfil()
