"""alinhar.py base.jpg saida_dir cand1.jpg ... : alinha cada candidato à base pela faixa dos olhos (multi-escala) e cola só a boca."""
import sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from skimage.feature import match_template
base_p, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
base = Image.open(base_p).convert('RGB'); W, H = base.size
FX0, FY0, FX1, FY1 = 120, 330, 830, 640   # faixa olhos + nariz na base (1024)
BOCA = (480, 715); RB = (190, 130)          # centro e raios da região da boca na base
D = 4
def cinza(im, f=D): return np.asarray(im.convert('L').resize((im.width//f, im.height//f), Image.LANCZOS)).astype(np.float32)/255
tpl = cinza(base.crop((FX0, FY0, FX1, FY1)))
def el(c, r, pena, tam):
    m = Image.new('L', tam, 0); ImageDraw.Draw(m).ellipse((c[0]-r[0], c[1]-r[1], c[0]+r[0], c[1]+r[1]), fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(pena))).astype(np.float32)/255
B = np.asarray(base).astype(np.float32)
for p in sys.argv[3:]:
    im = Image.open(p).convert('RGB'); best = (-1, 1, 0, 0)
    for s in np.arange(0.55, 1.75, 0.025):
        g = cinza(im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS))
        if g.shape[0] < tpl.shape[0] or g.shape[1] < tpl.shape[1]: continue
        r = match_template(g, tpl); i = np.unravel_index(np.argmax(r), r.shape)
        if r[i] > best[0]: best = (r[i], s, i[1]*D - FX0, i[0]*D - FY0)
    sc, s, dx, dy = best
    g = im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
    lay = Image.new('RGB', (W, H), (128, 128, 128)); lay.paste(g, (-dx, -dy)); L = np.asarray(lay).astype(np.float32)
    m = el(BOCA, RB, 18, (W, H))[..., None]
    anel = np.clip(el(BOCA, (RB[0]+14, RB[1]+14), 4, (W, H)) - el(BOCA, (RB[0]-10, RB[1]-10), 4, (W, H)), 0, 1)[..., None]
    L = L + ((B - L)*anel).sum((0, 1))/anel.sum()
    o = B*(1-m) + L*m
    nome = os.path.basename(p)
    Image.fromarray(np.clip(o, 0, 255).astype('uint8')).save(f'{out}/{nome}', quality=92)
    print(nome, 'corr', round(float(sc), 3), 'escala', round(float(s), 3), dx, dy)
