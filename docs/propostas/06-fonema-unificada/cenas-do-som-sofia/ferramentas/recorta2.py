"""Recorte por chave de cor sobre o fundo creme (modelo de fundo local) + rembg só para guiar o modelo do fundo.
Uso: recorta2.py  (lê escolhas.txt: bruto nome)"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
def recorte(im):
    a = np.asarray(im.convert('RGB')).astype(float)
    h, w, _ = a.shape
    borda = np.zeros((h, w), bool); borda[:12] = borda[-12:] = True; borda[:, :12] = borda[:, -12:] = True
    med = np.median(a[borda], 0)
    d0 = np.sqrt(((a - med) ** 2).sum(2))
    semente = d0 < 45
    # modelo de fundo local: média ponderada dos pixels de fundo prováveis
    lbl, n = nd.label(semente); ids = np.unique(lbl[borda & semente]); fundo0 = np.isin(lbl, ids[ids > 0])
    wgt = nd.gaussian_filter(fundo0.astype(float), 40); bg = np.stack([nd.gaussian_filter(a[..., c] * fundo0, 40) for c in range(3)], 2) / np.maximum(wgt, 1e-3)[..., None]
    d = np.sqrt(((a - bg) ** 2).sum(2))
    key = np.clip((d - 10) / 22, 0, 1)
    duro = key > 0.5
    lbl, n = nd.label(~duro); ids = np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))
    externo = np.isin(lbl, ids[ids > 0])
    tam = nd.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    buraco_grande = np.isin(lbl, [k + 1 for k, t in enumerate(tam) if t > 900]) & ~externo
    global _s
    from rembg import remove, new_session
    if '_s' not in globals(): _s = new_session('isnet-general-use')
    rb = np.asarray(remove(im.convert('RGB'), session=_s))[..., 3] > 128
    nucleo = nd.binary_erosion(rb, iterations=12)
    buraco_grande &= ~nucleo
    alpha = np.where(externo | buraco_grande, key, 1.0)
    lum = a.mean(2); perto_cabelo = nd.binary_dilation(lum < 90, iterations=7)
    firme = nd.binary_erosion(rb, iterations=3) & ~perto_cabelo
    alpha = np.where(firme, 1.0, alpha)
    # solta migalhas
    m = alpha > 0.15; lbl, n = nd.label(m)
    if n > 1:
        tam = nd.sum(m, lbl, range(1, n + 1)); alpha *= np.isin(lbl, [k + 1 for k, t in enumerate(tam) if t > tam.max() * 0.02])
    # tira o creme das bordas semitransparentes (despill)
    al = alpha[..., None]; cor = np.where(al > 0.02, (a - (1 - al) * bg) / np.maximum(al, 0.02), a); cor = np.clip(cor, 0, 255)
    out = Image.fromarray(np.dstack([cor, alpha * 255]).astype('uint8'), 'RGBA')
    return out.crop(Image.fromarray(((alpha > 0.15) * 255).astype('uint8')).getbbox())
if __name__ == '__main__':
    for l in open(sys.argv[1] if len(sys.argv) > 1 else 'escolhas.txt'):
        if not l.strip(): continue
        bruto, nome = l.split()
        fig = recorte(Image.open(f'brutos/{bruto}.jpg'))
        fig.thumbnail((208, 208), Image.LANCZOS)
        tela = Image.new('RGBA', (220, 220), (0, 0, 0, 0)); tela.alpha_composite(fig, ((220 - fig.width) // 2, (220 - fig.height) // 2))
        tela.save(f'recortes/{nome}.webp', quality=92); print(nome)
