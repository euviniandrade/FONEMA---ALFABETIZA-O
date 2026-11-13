"""Recorta as pranchas 3D (avatar-3d/*.png e personagens-3d/*.png) em peças individuais.
Uso: python3 recortar.py   (gera avatar-3d/pecas/*.png)
Remoção de fundo simples: modelo quadrático do fundo + preenchimento a partir das bordas."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
AV = os.path.normpath(os.path.join(AQUI, '..', '..'))
PE = os.path.normpath(os.path.join(AV, '..', 'personagens-3d'))
OUT = os.path.join(AV, 'pecas'); os.makedirs(OUT, exist_ok=True)

def _feats(xs, ys, w, h, grau=4):
    u, v = xs / w, ys / h
    return np.stack([u**i * v**j for i in range(grau+1) for j in range(grau+1-i)], -1)

def modelo_fundo(a, amostras, grau=4):
    h, w, _ = a.shape
    ys, xs = np.nonzero(amostras)
    sel = np.arange(len(xs)); np.random.default_rng(0).shuffle(sel); sel = sel[:60000]
    X = _feats(xs[sel].astype(float), ys[sel].astype(float), w, h, grau)
    yy, xx = np.mgrid[0:h, 0:w]
    F = _feats(xx.astype(float), yy.astype(float), w, h, grau)
    m = np.zeros(a.shape, float)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(X, a[ys[sel], xs[sel], c].astype(float), rcond=None)
        m[..., c] = F @ coef
    return m

def tirar_fundo(img, thr=30, seeds_bottom=True, ceu=True, ilha=17):
    """fundo azul-céu em gradiente: 1) classifica 'céu' por cor; 2) ajusta modelo suave; 3) flood a partir das bordas."""
    a = np.asarray(img.convert('RGB')).astype(int)
    h, w, _ = a.shape
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if ceu == 'claro':
        am = (b > 225) & (g > 185) & ((b - r) > 35) & ((b - g) > 12)
    elif ceu:
        am = (b > 185) & (g > 105) & ((b - r) > 95)
    else:
        am = np.zeros((h, w), bool); am[:8, :] = True; am[:, :8] = True; am[:, -8:] = True
    m = modelo_fundo(a, am)
    d = np.sqrt(((a - m)**2).sum(-1))
    bgl = Image.fromarray(np.where(d < thr, 255, 0).astype(np.uint8)).copy()
    seeds = [(x, 0) for x in range(0, w, 5)] + [(0, y) for y in range(0, h, 5)] + [(w-1, y) for y in range(0, h, 5)]
    if seeds_bottom: seeds += [(x, h-1) for x in range(0, w, 5)]
    for s_ in seeds:
        if bgl.getpixel(s_) == 255: ImageDraw.floodfill(bgl, s_, 128)
    fundo = (np.asarray(bgl) == 128) | (d < ilha)
    alpha = Image.fromarray(np.where(fundo, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.1))
    out = img.convert('RGBA'); out.putalpha(alpha)
    return out

def aparar(im, pad=6):
    bb = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if not bb: return im
    l, t, r, b = bb
    return im.crop((max(0, l-pad), max(0, t-pad), min(im.width, r+pad), min(im.height, b+pad)))

def so_maior(im, frac=0.06):
    """mantém o maior blob (e blobs grandes), tirando pedaços de vizinhos que entram no recorte."""
    al = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).copy()
    arr = np.asarray(al).copy()
    ys, xs = np.nonzero(arr)
    val = 0
    for y, x in zip(ys[::53], xs[::53]):
        if al.getpixel((int(x), int(y))) == 255 and val < 250:
            val += 1; ImageDraw.floodfill(al, (int(x), int(y)), val)
    lab = np.asarray(al)
    if val == 0: return im
    tam = np.bincount(lab[lab < 251].ravel(), minlength=251)[1:val+1]
    maior = tam.max()
    keep = np.isin(lab, [i+1 for i, t in enumerate(tam) if t > frac*maior])
    keep_img = Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    a = np.minimum(np.asarray(im.getchannel('A')), np.asarray(keep_img))
    im = im.copy(); im.putalpha(Image.fromarray(a.astype(np.uint8)))
    return im

def salvar(im, nome):
    im.save(os.path.join(OUT, nome)); print('ok', nome, im.size)

# ---------- 1. crianças-base (diversidade) ----------
DIV = {
 'diversidade-a.png': [('crianca-01-crespo-curto', 40, 192), ('crianca-02-trancas', 186, 330), ('crianca-03-coque', 312, 450),
   ('crianca-04-ruiva-ondulada', 444, 604), ('crianca-05-chanel-liso', 604, 732), ('crianca-06-liso-longo-pintura', 735, 884),
   ('crianca-07-black-power-alto', 884, 1022), ('crianca-08-oculos-aparelho', 1018, 1150, [(1098, 330, 1150, 768)]), ('crianca-09-cadeira-de-rodas', 1080, 1362, [(1080, 60, 1150, 470), (1080, 60, 1102, 600)])],
 'diversidade-b.png': [('crianca-b01-crespo-curto', 42, 210), ('crianca-b02-trancas', 200, 356), ('crianca-b03-coque', 355, 506),
   ('crianca-b04-ruiva-ondulada', 505, 670), ('crianca-b05-chanel-liso', 668, 820), ('crianca-b06-liso-longo-pintura', 818, 975),
   ('crianca-b07-black-power-alto', 955, 1115), ('crianca-b08-oculos-aparelho-cadeira', 1045, 1360, [(1045, 60, 1122, 520), (1045, 60, 1060, 700)])],
}
for arq, lst in DIV.items():
    full = tirar_fundo(Image.open(os.path.join(AV, arq)), thr=36, seeds_bottom=True)
    for nome, x0, x1, *apagar in lst:
        c = full.copy()
        for (a0, b0, a1, b1) in (apagar[0] if apagar else []):
            ImageDraw.Draw(c).rectangle((a0, b0, a1, b1), fill=(0, 0, 0, 0))
        salvar(aparar(so_maior(c.crop((x0, 60, x1, 768)), 0.35)), nome + '.png')

# ---------- 2. roupas (mesmo menino, 8 roupas) ----------
ROUPAS_B = ['uniforme', 'blusao-capuz', 'explorador', 'capa-de-chuva', 'verao-camiseta-verde', 'pijama', 'festa-junina-xadrez', 'esporte']
full = tirar_fundo(Image.open(os.path.join(AV, 'roupas-b.png')), thr=36)
xs = [20, 188, 360, 528, 700, 862, 1030, 1198, 1370]
for i, n in enumerate(ROUPAS_B):
    salvar(aparar(so_maior(full.crop((xs[i], 70, xs[i+1], 768)))), f'roupa-{i+1:02d}-{n}.png')
# roupas-a: a camiseta listrada multicolorida (col. 5) NÃO é recortada (Decisão 009)
ROUPAS_A = ['uniforme', 'blusao-capuz', 'explorador', 'capa-de-chuva', None, 'pijama', 'festa-junina-xadrez', 'esporte']
full = tirar_fundo(Image.open(os.path.join(AV, 'roupas-a.png')), thr=22, ceu='claro', ilha=11)
xs = [30, 192, 362, 528, 700, 862, 1024, 1190, 1360]
for i, n in enumerate(ROUPAS_A):
    if n: salvar(aparar(so_maior(full.crop((xs[i], 150, xs[i+1], 768)))), f'roupa-a{i+1:02d}-{n}.png')

# ---------- 3. cabelos (tiles arredondados) ----------
def tile(img, box, raio=34):
    t = img.crop(box).convert('RGBA')
    m = Image.new('L', t.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, t.width-1, t.height-1), raio, fill=255)
    t.putalpha(m); return t
CA = ['crespo-curto', 'puff-afro-alto', 'cacheado-longo', 'cacheado-medio', 'duas-trancas-ondulado', 'nago-curto',
      'duas-trancas', 'nago-trancinhas', 'box-braids', 'coque-alto', 'rabo-de-cavalo', 'ondulado-ruivo',
      'raspado', 'crespo-baixo', 'chanel-liso', 'liso-curto-topete', 'arrepiado', 'cacheado-curto-loiro']
img = Image.open(os.path.join(AV, 'cabelos-a.png'))
cx = [16, 244, 472, 700, 927, 1155]; cy = [16, 268, 525]
k = 0
for r in range(3):
    for c in range(6):
        salvar(tile(img, (cx[c], cy[r], cx[c]+206, cy[r]+228)), f'cabelo-a{k+1:02d}-{CA[k]}.png'); k += 1
CB = ['crespo-curto', 'dois-puffs', 'cacheado-longo', 'cacheado-ruivo', 'duas-trancas-nago', 'nago-curto', 'box-braids-longas', 'coque-alto',
      'rabo-lateral', 'chanel-loiro', 'liso-longo', 'ondulado-ruivo', 'raspado', 'liso-curto-topete', 'arrepiado', 'cacheado-curto-loiro']
img = Image.open(os.path.join(AV, 'cabelos-b.png'))
bx = [30, 366, 702, 1038]; by = [14, 205, 397, 588]
k = 0
for r in range(4):
    for c in range(4):
        salvar(tile(img, (bx[c], by[r], bx[c]+308, by[r]+168), 26), f'cabelo-b{k+1:02d}-{CB[k]}.png'); k += 1

# ---------- 4. utensílios (tile + objeto sem fundo) ----------
def objeto(img, box, thr=26):
    t = img.crop(box).convert('RGB')
    a = np.asarray(t).astype(int); h, w, _ = a.shape
    # cor do tile = mediana de faixas junto às bordas (sem os cantos arredondados)
    faixas = np.concatenate([a[3:9, 30:w-30].reshape(-1, 3), a[h-9:h-3, 30:w-30].reshape(-1, 3),
                             a[30:h-30, 3:9].reshape(-1, 3), a[30:h-30, w-9:w-3].reshape(-1, 3)])
    cor = np.median(faixas, 0)
    canto = Image.new('L', (w, h), 0); ImageDraw.Draw(canto).rounded_rectangle((0, 0, w-1, h-1), 22, fill=255)
    a = np.where(np.asarray(canto)[..., None] > 0, a, cor.astype(int))
    t = Image.fromarray(a.astype(np.uint8))
    d = np.sqrt(((a - cor)**2).sum(-1))
    bgl = Image.fromarray(np.where(d < thr, 255, 0).astype(np.uint8)).copy()
    for s in [(x, 2) for x in range(10, w-10, 6)] + [(2, y) for y in range(10, h-10, 6)] + [(w-3, y) for y in range(10, h-10, 6)] + [(x, h-3) for x in range(10, w-10, 6)]:
        if bgl.getpixel(s) == 255: ImageDraw.floodfill(bgl, s, 128)
    al = Image.fromarray(np.where(np.asarray(bgl) == 128, 0, 255).astype(np.uint8))
    al = al.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    o = t.convert('RGBA'); o.putalpha(al)
    return aparar(o, 4)
UA = ['mochila', 'lupa', 'binoculo', 'lanterna', 'caderno', None, 'mapa', 'kit-de-ciencias', 'regador', None, 'bola', None,
      'violao', 'pandeiro', None, 'capa-de-chuva', 'galocha', 'chapeu-explorador', 'chapeu-de-palha', 'balde-de-praia', 'patinete',
      'telescopio', 'telescopio-2', 'vaso-com-muda']
img = Image.open(os.path.join(AV, 'utensilios-a.png'))
ux = [76, 286, 497, 707, 917, 1127]; uy = [28, 212, 396, 580]
k = 0
for r in range(4):
    for c in range(6):
        n = UA[k]; k += 1
        if not n: continue  # repetidos ou fora da paleta (pipa, xilofone: Decisão 009)
        box = (ux[c]+6, uy[r]+6, ux[c]+168, uy[r]+154)
        salvar(tile(img, (ux[c], uy[r], ux[c]+174, uy[r]+160), 26), f'utensilio-a-tile-{n}.png')
        salvar(objeto(img, box), f'utensilio-a-{n}.png')
UB = ['mochila', 'lupa', 'binoculo', 'lanterna', 'caderno', 'mapa', 'kit-de-ciencias', 'regador', None, 'bola',
      'violao', 'pandeiro', None, 'capa-e-galocha', 'chapeu-explorador', 'chapeu-de-sol', 'balde-de-praia', 'patinete', 'telescopio', 'vaso-com-muda']
img = Image.open(os.path.join(AV, 'utensilios-b.png'))
vx = [206, 405, 604, 803, 1002]; vy = [26, 211, 396, 581]
k = 0
for r in range(4):
    for c in range(5):
        n = UB[k]; k += 1
        if not n: continue
        salvar(tile(img, (vx[c], vy[r], vx[c]+168, vy[r]+165), 26), f'utensilio-b-tile-{n}.png')
        salvar(objeto(img, (vx[c]+7, vy[r]+7, vx[c]+161, vy[r]+156)), f'utensilio-b-{n}.png')

# ---------- 5. dupla Sofia e Tales ----------
img = Image.open(os.path.join(PE, '02-expressoes.png'))
ex = [14, 250, 474, 696, 918, 1142]
for i, emo in enumerate(['alegre', 'curiosa', 'pensando', 'surpresa', 'joinha', 'confiante']):
    o = tirar_fundo(img.crop((ex[i], 40, ex[i]+222, 352)), thr=22, seeds_bottom=False, ceu=False)
    salvar(aparar(o), f'sofia-busto-{emo}.png')
ex2 = [30, 254, 478, 700, 918, 1140]
for i, emo in enumerate(['alegre', 'curioso', 'pensando', 'surpreso', 'joinha', 'confiante']):
    o = tirar_fundo(img.crop((ex2[i], 410, ex2[i]+222, 722)), thr=22, seeds_bottom=False, ceu=False)
    salvar(aparar(o), f'tales-busto-{emo}.png')
full = tirar_fundo(Image.open(os.path.join(PE, 'dupla-opcao-1.png')), thr=40)
salvar(aparar(so_maior(full)), 'dupla-sofia-tales-corpo.png')
