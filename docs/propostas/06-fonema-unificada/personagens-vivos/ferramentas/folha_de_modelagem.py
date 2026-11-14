#!/usr/bin/env python3
"""
Folha de modelagem (vistas do giro) para o artista 3D / serviço de imagem→3D.
Pega 8 vistas igualmente espaçadas do vídeo de giro (0°, 45°, … 315°), em resolução cheia, sobre fundo branco.

  python3 folha_de_modelagem.py giro.mp4 giro.json saida.png "Nome" [--cor verde|magenta]
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from recortar import ler, chave, caixa

video, meta, saida, nome = sys.argv[1:5]
cor = sys.argv[6] if len(sys.argv) > 6 else 'verde'
idx = json.load(open(meta))['indices']; n = len(idx)
bruto, _ = ler(video)
vistas = [chave(bruto[idx[(k * n) // 8]], cor) for k in range(8)]
x0, y0, x1, y1 = caixa(vistas, 6)
vistas = [Image.fromarray(v[y0:y1, x0:x1]) for v in vistas]
w, h = vistas[0].size; esc = 620 / h; w2, h2 = int(w * esc), 620
M = 40; folha = Image.new('RGB', (M + 4 * (w2 + M), 110 + 2 * (h2 + 70)), 'white'); d = ImageDraw.Draw(folha)
try: fonte = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26); grande = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 40)
except OSError: fonte = grande = ImageFont.load_default()
d.text((M, 30), f'{nome} · vistas do giro', fill=(20, 38, 77), font=grande)
rot = ['0° frente', '45°', '90° lado', '135°', '180° costas', '225°', '270° lado', '315°']
for k, v in enumerate(vistas):
    x = M + (k % 4) * (w2 + M); y = 110 + (k // 4) * (h2 + 70)
    d.line([(x, y + h2), (x + w2, y + h2)], fill=(200, 210, 225), width=2)   # linha do chão
    folha.paste(v.resize((w2, h2), Image.LANCZOS), (x, y), v.resize((w2, h2), Image.LANCZOS))
    d.text((x + w2 // 2, y + h2 + 14), rot[k], fill=(60, 80, 120), font=fonte, anchor='ma')
folha.save(saida, optimize=True); print(saida, folha.size)
