#!/usr/bin/env python3
"""Deixa as capturas leves (PNG com paleta de 256 cores). Uso: python3 ferramentas/comprimir.py [arquivos…]
Sem argumentos, comprime tudo o que capturar.js gera em capturas/ (pula o que já tem paleta)."""
import glob, os, sys
from PIL import Image
AQUI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'capturas')
arqs = sys.argv[1:] or [f for p in ('0*.png', '1[4-9]-*.png', '2[01]-*.png', 'transicao-*.png', 'celular/*.png', 'transicoes/*.png') for f in glob.glob(os.path.join(AQUI, p))]
for f in arqs:
    im = Image.open(f)
    if im.mode == 'P':
        continue
    im.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(f, optimize=True)
print(len(arqs), 'capturas comprimidas')
