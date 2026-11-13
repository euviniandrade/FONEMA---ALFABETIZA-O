# Recorta a dupla Sofia e Tales da arte-base 3D (Decisão 007: personagens-3d/dupla-opcao-1.png,
# fundo azul em gradiente) e a Sofia de frente da folha-modelo 3D -> PNG com alfa (assets/).
# Método: crescimento de região a partir da borda com continuidade de cor (aguenta o gradiente do fundo).
# Uso (na pasta mundo-3d-v2): python3 ferramentas/recortar.py
import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
P3D = os.path.join(AQUI, '..', '..', 'personagens-3d')
OUT = os.path.join(AQUI, '..', 'assets')

def recorta(src, box, nome, passo=7, lim=70, escala=1.0):
    im = np.asarray(Image.open(os.path.join(P3D, src)).convert('RGB')).astype(np.int16)
    x0, y0, x1, y1 = box
    c = im[y0:y1, x0:x1]
    h, w, _ = c.shape
    ref = np.median(np.concatenate([c[:4].reshape(-1, 3), c[:, :4].reshape(-1, 3), c[:, -4:].reshape(-1, 3)]), axis=0)
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        q.append((0, x)); q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0)); q.append((y, w - 1))
    for (y, x) in q: bg[y, x] = True
    # azul do fundo: o canal B domina; personagens (pele, cabelo, branco, marinho escuro) não
    blue = (c[:, :, 2] - np.maximum(c[:, :, 0], c[:, :, 1]) * 0.55 > 60) & (c[:, :, 2] > 150)
    while q:
        y, x = q.popleft()
        cy = c[y, x]
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                d = np.abs(c[ny, nx] - cy).max()
                if (d < passo and blue[ny, nx]) or (blue[ny, nx] and np.abs(c[ny, nx] - ref).max() < lim):
                    bg[ny, nx] = True; q.append((ny, nx))
    # buracos azuis fechados e grandes (vão entre os dois na cintura); os frisos azul-claro do uniforme são finos e ficam
    from PIL import ImageDraw
    hol = Image.fromarray((((~bg) & blue & (c[:, :, 0] < 135)) * 255).astype(np.uint8)).copy()
    ys, xs = np.nonzero(np.asarray(hol) == 255)
    for y, x in zip(ys[::7], xs[::7]):
        if hol.getpixel((int(x), int(y))) != 255: continue
        ImageDraw.floodfill(hol, (int(x), int(y)), 100)
        a2 = np.asarray(hol); comp = a2 == 100
        if comp.sum() > 150:
            yy = np.nonzero(comp.any(axis=1))[0]
            if comp.sum() / (yy[-1] - yy[0] + 1) > 11: bg |= comp  # largo (vão), não fino (friso)
        hol = Image.fromarray(np.where(comp, 50, a2).astype(np.uint8)).copy()
    a = Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    al = np.asarray(a).astype(np.float32) / 255
    # tira o "halo" azul das bordas (despill)
    rgb = c.astype(np.float32)
    edge = (al < 0.98)[..., None]
    lim_b = np.maximum(rgb[:, :, 0], rgb[:, :, 1])[..., None]
    rgb = np.where(edge & (rgb[:, :, 2:3] > lim_b), np.concatenate([rgb[:, :, :2], np.minimum(rgb[:, :, 2:3], lim_b * 1.05)], 2), rgb)
    out = Image.fromarray(np.dstack([rgb, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
    out = out.crop(out.getbbox())
    if escala != 1: out = out.resize((round(out.width * escala), round(out.height * escala)), Image.LANCZOS)
    out.save(os.path.join(OUT, nome + '.png'), optimize=True)
    print(nome, out.size)

recorta('dupla-opcao-1.png', (330, 0, 905, 712), 'dupla', escala=1.4)
recorta('01-folha-modelo.png', (95, 15, 450, 745), 'sofia', escala=1.4)

# Tales sozinho: metade direita da dupla (o cabelo da Sofia atrás do ombro dele é apagado com degradê)
d = Image.open(os.path.join(OUT, 'dupla.png'))
x0 = int(d.width * 0.535)
t = np.asarray(d.crop((x0, 0, d.width, d.height))).astype(np.float32)
rgb = t[:, :, :3]
hair = (rgb.mean(axis=2) < 95) & (rgb[:, :, 0] > rgb[:, :, 2] + 8)  # castanho escuro (cabelo da Sofia)
hair[:, 60:] = False; hair[:int(rgb.shape[0] * 0.17)] = False
a = t[:, :, 3]; a[hair] = 0
H = t.shape[0]; R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
keep = ((R < 90) & (B > R + 25) & (rgb.mean(axis=2) < 125)) | ((R > 150) & (R > B + 30)) | (rgb.min(axis=2) > 200) | ((R > 120) & (R > B + 25) & (G > B + 10))
zona = np.zeros_like(keep); zona[int(H * 0.17):int(H * 0.45), :70] = True
a[zona & ~keep] = 0
pele = (R > 150) & (R > B + 30)
for (ya, yb, xb) in ((0.18, 0.27, 45), (0.37, 0.46, 32)):
    z = np.zeros_like(keep); z[int(H * ya):int(H * yb), :xb] = True; a[z & ~pele] = 0
t[:, :, 3] = a
ti = Image.fromarray(t.clip(0, 255).astype(np.uint8), 'RGBA')
ti = ti.crop(ti.getbbox()); ti.save(os.path.join(OUT, 'tales.png'), optimize=True); print('tales', ti.size)
