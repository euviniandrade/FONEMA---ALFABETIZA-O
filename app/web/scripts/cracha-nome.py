"""Crachá de nome (letras de nomes: W e Y) desenhado por código, no tom das figuras 3D. Uso: cracha.py Nome saida.webp"""
import sys, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont
nome, saida, fonte = sys.argv[1], sys.argv[2], sys.argv[3]
t = TTFont(fonte); t.flavor = None; buf = io.BytesIO(); t.save(buf); buf.seek(0)
S = 4; W = 220 * S
im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
def rr(box, r, **k): d.rounded_rectangle([v * S for v in box], r * S, **k)
# cordão azul (V) e presilha
for a, b in (((60, 6), (104, 62)), ((160, 6), (116, 62))):
    d.line([a[0] * S, a[1] * S, b[0] * S, b[1] * S], fill=(22, 41, 90, 255), width=15 * S)
    d.line([a[0] * S, a[1] * S, b[0] * S, b[1] * S], fill=(61, 124, 196, 255), width=10 * S)
rr((96, 52, 124, 78), 7, fill=(125, 138, 153, 255)); rr((100, 56, 120, 74), 5, fill=(201, 211, 222, 255))
# sombra
sombra = Image.new('RGBA', (W, W), (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
ds.rounded_rectangle([14 * S, 80 * S, 206 * S, 206 * S], 22 * S, fill=(12, 26, 64, 90)); sombra = sombra.filter(ImageFilter.GaussianBlur(5 * S))
im = Image.alpha_composite(sombra, im); d = ImageDraw.Draw(im)
# cartão: borda ipê com "espessura" e miolo branco
rr((12, 76, 208, 200), 24, fill=(185, 119, 7, 255))
rr((12, 70, 208, 194), 24, fill=(246, 169, 27, 255))
rr((14, 70, 206, 150), 22, fill=(255, 214, 82, 255))
rr((24, 82, 196, 182), 14, fill=(255, 255, 255, 255))
rr((24, 82, 196, 108), 14, fill=(38, 69, 140, 255)); d.rectangle([24 * S, 98 * S, 196 * S, 108 * S], fill=(38, 69, 140, 255))
f1 = ImageFont.truetype(io.BytesIO(buf.getvalue()), 15 * S)
d.text((110 * S, 95 * S), 'MEU NOME É', font=f1, fill=(255, 255, 255, 255), anchor='mm')
tam = 46
while True:
    f2 = ImageFont.truetype(io.BytesIO(buf.getvalue()), tam * S)
    if d.textlength(nome, font=f2) <= 160 * S or tam < 20: break
    tam -= 2
d.text((110 * S, 146 * S), nome, font=f2, fill=(22, 41, 90, 255), anchor='mm')
d.text((110 * S - d.textlength(nome, font=f2) / 2, 146 * S), nome[0], font=f2, fill=(185, 119, 7, 255), anchor='lm')
# brilho
rr((30, 74, 120, 79), 3, fill=(255, 255, 255, 150))
im.resize((220, 220), Image.LANCZOS).save(saida, quality=90, method=6)
