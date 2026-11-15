#!/usr/bin/env python3
"""
Gera as artes dos SELOS 3D (D025/D029) a partir da prancha aprovada de bases em branco
(docs/propostas/06-fonema-unificada/recompensas-3d/imagens/bases-selo-em-branco.png):

  public/assets/recompensas/bases/<forma>.webp                 base em OURO (frente), recortada sem fundo
  public/assets/recompensas/bases/<forma>-<metal>.webp         bronze, prata, diamante e bloqueado (cinza)
  public/assets/recompensas/bases/<forma>-verso[-<metal>].webp VERSO liso de metal (a faixa continua azul)
  public/assets/recompensas/<premio>-verso.webp                verso de moeda, troféu e baú (sem letras espelhadas)
  src/componentes/selos-geometria.json                         centro, curva da faixa e contorno (para o giro 360°)

Os metais NÃO são filtro por cima: só as áreas douradas são remapeadas (luminância → rampa do metal);
o azul-marinho do centro e da faixa fica como está.

Uso:  python3 scripts/gerar-selos.py        (a partir de app/web)
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

AQUI = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(WEB))
PRANCHA = os.path.join(RAIZ, 'docs/propostas/06-fonema-unificada/recompensas-3d/imagens/bases-selo-em-branco.png')
SAIDA = os.path.join(WEB, 'public/assets/recompensas')
GEO = os.path.join(WEB, 'src/componentes/selos-geometria.json')
ALTURA = 640
FORMAS = [('estrela', 0, 0), ('escudo', 1, 0), ('medalha', 0, 1), ('hexagono', 1, 1)]

# rampas de metal: luminância normalizada do ouro (0 sombra … 1 brilho) → cor
RAMPAS = {
    'bronze': [(0, (46, 20, 8)), (.28, (118, 58, 24)), (.55, (186, 104, 52)), (.8, (232, 160, 104)), (1, (255, 232, 206))],
    'prata': [(0, (40, 46, 58)), (.28, (104, 114, 130)), (.55, (166, 177, 192)), (.8, (224, 230, 238)), (1, (255, 255, 255))],
    'diamante': [(0, (14, 50, 104)), (.28, (36, 108, 184)), (.55, (98, 176, 236)), (.8, (188, 232, 255)), (1, (255, 255, 255))],
}
PLACA = {  # tom médio do verso (placa lisa)
    'ouro': [(0, (120, 70, 6)), (.5, (232, 172, 52)), (1, (255, 236, 160))],
    'bronze': [(0, (88, 40, 14)), (.5, (176, 98, 50)), (1, (240, 180, 130))],
    'prata': [(0, (78, 88, 104)), (.5, (160, 171, 186)), (1, (236, 240, 246))],
    'diamante': [(0, (26, 84, 150)), (.5, (92, 168, 230)), (1, (214, 240, 255))],
}


def hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = m & (mx == r)
    gg = m & (mx == g) & ~rr
    bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6
    h[gg] = (b - r)[gg] / d[gg] + 2
    h[bb] = (r - g)[bb] / d[bb] + 4
    return h * 60, s, mx


def lum(rgb):
    return rgb[..., 0] * .299 + rgb[..., 1] * .587 + rgb[..., 2] * .114


def rampa(t, pontos):
    xs = [p[0] for p in pontos]
    return np.stack([np.interp(t, xs, [p[1][c] for p in pontos]) for c in range(3)], -1) / 255.0


def maior(mask):
    rot, n = ndi.label(mask)
    if n == 0:
        return mask
    tam = ndi.sum(mask, rot, range(1, n + 1))
    return rot == (1 + int(np.argmax(tam)))


def recortar(quad):
    """Tira o fundo claro (inclusive as ilhas brancas presas entre a base e a faixa) e devolve RGBA float."""
    rgb = quad[..., :3]
    h, s, v = hsv(rgb)
    frente = (s > .22) | (v < .5)
    frente = ndi.binary_opening(frente, iterations=1)
    fundo = ~frente
    rot, n = ndi.label(fundo)
    borda = set(np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))) - {0}
    tam = ndi.sum(fundo, rot, range(1, n + 1))
    tirar = np.zeros_like(fundo)
    for i in range(1, n + 1):
        if i in borda:
            tirar |= rot == i
    # ilhas NEUTRAS (cinza/branco, sem amarelo) presas entre a base e a faixa = fundo e sombra do fundo;
    # o brilho especular do ouro é creme (tem saturação) ou pequeno, e fica
    neutro = (s < .1) & (v > .55)
    neutro = ndi.binary_dilation(ndi.binary_opening(neutro, iterations=2), iterations=3) & ((s < .2) & (v > .5))
    # só na ZONA entre a base e a faixa: ali o fundo pega um reflexo creme do ouro (não é neutro);
    # o que o separa do brilho especular é a LARGURA da mancha
    Hq, Wq = s.shape
    zona = np.zeros_like(neutro)
    zona[int(Hq * .745):int(Hq * .85), int(Wq * .2):int(Wq * .8)] = True
    palido = (s < .34) & (v > .6) & zona
    miolo = ndi.binary_opening(palido, iterations=5)
    neutro |= ndi.binary_dilation(miolo, iterations=14, mask=palido)
    rot2, n2 = ndi.label(neutro)
    tam2 = ndi.sum(neutro, rot2, range(1, n2 + 1))
    for i in range(1, n2 + 1):
        if tam2[i - 1] > 700:
            tirar |= rot2 == i
    m = maior(~tirar)
    m = ndi.binary_erosion(m, iterations=2)
    # cor da borda: copia do interior (sem franja branca)
    dentro = ndi.binary_erosion(m, iterations=2)
    _, idx = ndi.distance_transform_edt(~dentro, return_indices=True)
    cor = rgb[idx[0], idx[1]]
    cor = np.where(dentro[..., None], rgb, cor)
    a = np.clip(ndi.gaussian_filter(m.astype(float), 1.0) * 1.15 - .05, 0, 1)
    return np.dstack([cor, a]), m


def mascaras(rgba, m):
    rgb = rgba[..., :3]
    h, s, v = hsv(rgb)
    azul = m & (((h > 195) & (h < 265) & (s > .25)) | (v < .2))
    azul = ndi.binary_opening(azul, iterations=1)
    ouro = m & ~azul & ~((v < .24))
    centro = ndi.binary_fill_holes(maior(ndi.binary_opening(azul, iterations=3)))
    resto = azul & ~ndi.binary_dilation(centro, iterations=4)
    faixa = ndi.binary_fill_holes(maior(ndi.binary_opening(resto, iterations=2)))
    return ouro, azul, centro, faixa


def metal(rgba, ouro, nome):
    rgb = rgba[..., :3]
    L = lum(rgb)
    p2, p98 = np.percentile(L[ouro], [1.5, 99.2])
    t = np.clip((L - p2) / (p98 - p2), 0, 1)
    t = t * t * (3 - 2 * t) * .35 + t * .65  # contraste de metal polido
    if nome == 'diamante':
        # cristal lapidado: o metal vira um mosaico de FACETAS (células de Voronoi), cada uma com a sua luz,
        # e um fio de brilho nas arestas entre elas
        H, W = L.shape
        rng = np.random.default_rng(11)
        n = max(60, (H * W) // 2600)
        pts = np.column_stack([rng.uniform(0, H, n), rng.uniform(0, W, n)])
        from scipy.spatial import cKDTree
        yy, xx = np.mgrid[0:H, 0:W]
        d, idx = cKDTree(pts).query(np.column_stack([yy.ravel(), xx.ravel()]), k=2)
        cel = idx[:, 0].reshape(H, W)
        aresta = np.clip(1 - (d[:, 1] - d[:, 0]).reshape(H, W) / 2.2, 0, 1)
        luz = rng.uniform(-.2, .2, n)[cel]
        inc = rng.uniform(-1, 1, (n, 2))
        rampinha = ((yy - pts[cel, 0]) * inc[cel, 0] + (xx - pts[cel, 1]) * inc[cel, 1]) / 60 * .1
        t = np.clip(t * .82 + .1 + luz + rampinha + aresta * .28, 0, 1)
    novo = rampa(t, RAMPAS[nome])
    if nome == 'diamante':
        # cristal: reflexo frio mais marcado nas zonas claras
        novo = np.clip(novo + (t[..., None] ** 3) * np.array([.05, .03, 0]), 0, 1)
    w = ndi.gaussian_filter(ouro.astype(float), .8)[..., None]
    return np.dstack([rgb * (1 - w) + novo * w, rgba[..., 3]])


def bloqueado(rgba, ouro, azul):
    rgb = rgba[..., :3]
    L = lum(rgb)
    p2, p98 = np.percentile(L[ouro], [1.5, 99.2])
    t = np.clip((L - p2) / (p98 - p2), 0, 1)
    c_ouro = rampa(t, [(0, (120, 130, 146)), (.5, (188, 197, 209)), (1, (244, 247, 250))])
    tb = np.clip(L / .35, 0, 1)
    c_azul = rampa(tb, [(0, (108, 119, 135)), (.5, (146, 157, 172)), (1, (196, 205, 216))])
    w = ndi.gaussian_filter(ouro.astype(float), .8)[..., None]
    return np.dstack([c_azul * (1 - w) + c_ouro * w, rgba[..., 3]])


def verso(base, centro, nome, semente):
    """Verso: a placa do centro vira metal liso (escovado); o aro e a faixa ficam como na frente."""
    rgb = base[..., :3]
    L = ndi.median_filter(lum(np.clip(rgb, 0, 1)), 7)  # some com as estrelinhas
    cen = ndi.binary_dilation(centro, iterations=1)
    Lc = L[cen]
    t = .5 + (L - np.median(Lc)) / (np.percentile(Lc, 99) - np.percentile(Lc, 1) + 1e-6) * .55
    H, W = L.shape
    yy = np.linspace(.12, -.12, H)[:, None]
    rng = np.random.default_rng(semente)
    escova = ndi.gaussian_filter(rng.normal(0, 1, (H, W)), (0.6, 22)) * .9
    t = np.clip(t + yy + escova, 0, 1)
    placa = rampa(t, PLACA[nome])
    w = ndi.gaussian_filter(cen.astype(float), 1.2)[..., None]
    return np.dstack([rgb * (1 - w) + placa * w, base[..., 3]])


def contorno(m, erosao):
    """Contorno externo (Moore) da silhueta fechada e levemente encolhida; devolve pontos (x, y) em pixels."""
    f = ndi.binary_closing(np.pad(m, 12), iterations=5)[12:-12, 12:-12]
    f = ndi.binary_fill_holes(f)
    f = maior(ndi.binary_erosion(f, iterations=erosao))
    f = ndi.binary_opening(f, iterations=2)
    f = maior(f)
    H, W = f.shape
    p = np.pad(f, 1)
    ys, xs = np.nonzero(p)
    y0 = ys.min()
    x0 = xs[ys == y0].min()
    viz = [(0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1)]  # (dy,dx) horário a partir de oeste
    pts = [(x0, y0)]
    cur = (y0, x0)
    d = 0
    for _ in range(200000):
        achou = False
        for k in range(8):
            i = (d + k) % 8
            ny, nx = cur[0] + viz[i][0], cur[1] + viz[i][1]
            if p[ny, nx]:
                cur = (ny, nx)
                d = (i + 5) % 8
                achou = True
                break
        if not achou or (cur == (y0, x0) and len(pts) > 2):
            break
        pts.append((cur[1], cur[0]))
    return np.array(pts, float) - 1


def simplificar(pts, eps):
    """Douglas–Peucker iterativo em polígono fechado."""
    n = len(pts)
    longe = int(np.argmax(((pts - pts[0]) ** 2).sum(1)))
    manter = np.zeros(n, bool)
    manter[[0, longe]] = True
    pilha = [(0, longe), (longe, n - 1)]
    manter[n - 1] = True
    while pilha:
        a, b = pilha.pop()
        if b <= a + 1:
            continue
        seg = pts[b] - pts[a]
        comp = np.hypot(*seg) or 1e-9
        rel = pts[a + 1:b] - pts[a]
        dist = np.abs(rel[:, 0] * seg[1] - rel[:, 1] * seg[0]) / comp
        i = int(np.argmax(dist))
        if dist[i] > eps:
            k = a + 1 + i
            manter[k] = True
            pilha += [(a, k), (k, b)]
    return pts[manter]


def salvar(rgba, caminho, q=88):
    im = Image.fromarray((np.clip(rgba, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA')
    im.save(caminho, 'WEBP', quality=q, method=6)
    return os.path.getsize(caminho)


def reduzir(rgba, altura):
    H, W = rgba.shape[:2]
    w = round(W * altura / H)
    # pré-multiplica para não vazar cor de fundo
    pm = rgba.copy()
    pm[..., :3] *= pm[..., 3:4]
    canais = [np.asarray(Image.fromarray(pm[..., c].astype(np.float32), 'F').resize((w, altura), Image.LANCZOS)) for c in range(4)]
    a = np.clip(canais[3], 0, 1)
    out = np.dstack([np.clip(canais[c] / np.maximum(a, 1e-4), 0, 1) for c in range(3)] + [a])
    return out


def geometria(m_peq, centro_peq, faixa_peq):
    H, W = m_peq.shape
    dist = ndi.distance_transform_edt(centro_peq)
    cy, cx = np.unravel_index(int(np.argmax(dist)), dist.shape)
    r = float(dist.max())
    my, mx = ndi.center_of_mass(centro_peq)
    ys, xs = np.nonzero(faixa_peq)
    x0, x1 = max(xs.min(), round(W * .125)), min(xs.max(), round(W * .845))  # só a frente da faixa (sem as pontas)
    cols, meios, alts = [], [], []
    for x in range(x0 + 6, x1 - 5):
        col = np.nonzero(faixa_peq[:, x])[0]
        if len(col) < 8:
            continue
        cols.append(x)
        meios.append((col.min() + col.max()) / 2)
        alts.append(col.max() - col.min() + 1)
    a, b, c = np.polyfit(np.array(cols), np.array(meios), 2)
    cont = simplificar(contorno(m_peq, max(3, round(H * .012))), .9)
    return {
        'w': W, 'h': H,
        'centro': {'x': round(float(mx), 1), 'y': round(float(my), 1), 'cx': int(cx), 'cy': int(cy), 'r': round(r, 1)},
        'faixa': {'x0': int(x0), 'x1': int(x1), 'a': float(a), 'b': float(b), 'c': float(c), 'altura': round(float(np.median(alts)), 1)},
        'contorno': [[round(float(x) / W, 4), round(float(y) / H, 4)] for x, y in cont],
    }


def premio(nome, geo):
    """Moeda, troféu e baú: contorno para o giro e um verso sem letras espelhadas (borrado e um pouco mais escuro)."""
    cam = os.path.join(SAIDA, f'{nome}.webp')
    im = np.asarray(Image.open(cam).convert('RGBA')).astype(float) / 255
    a = im[..., 3]
    m = maior(a > .6)
    H, W = a.shape
    sig = H * (.085 if nome == 'moeda' else .022)
    pm = im[..., :3] * a[..., None]
    bl = np.dstack([ndi.gaussian_filter(pm[..., c], sig) for c in range(3)]) / np.maximum(ndi.gaussian_filter(a, sig), 1e-3)[..., None]
    nit = im[..., :3]
    # mantém o desenho das bordas (silhueta nítida) e apaga os detalhes do miolo
    dentro = np.clip(ndi.distance_transform_edt(m) / (H * .05), 0, 1)[..., None]
    v = (nit * (1 - dentro) + bl * dentro) * .9
    salvar(np.dstack([np.clip(v, 0, 1), a])[:, ::-1], os.path.join(SAIDA, f'{nome}-verso.webp'), 86)
    cont = simplificar(contorno(m, max(2, round(H * .012))), .7)
    geo[nome] = {'w': W, 'h': H, 'contorno': [[round(float(x) / W, 4), round(float(y) / H, 4)] for x, y in cont]}


def main():
    prancha = np.asarray(Image.open(PRANCHA).convert('RGB')).astype(float) / 255
    Q = prancha.shape[0] // 2
    os.makedirs(os.path.join(SAIDA, 'bases'), exist_ok=True)
    geo = {}
    total = 0
    for k, (nome, qx, qy) in enumerate(FORMAS):
        quad = prancha[qy * Q:(qy + 1) * Q, qx * Q:(qx + 1) * Q]
        rgba, m = recortar(quad)
        ys, xs = np.nonzero(m)
        y0, y1, x0, x1 = max(ys.min() - 10, 0), min(ys.max() + 11, Q), max(xs.min() - 10, 0), min(xs.max() + 11, Q)
        rgba, m = rgba[y0:y1, x0:x1], m[y0:y1, x0:x1]
        ouro, azul, centro, faixa = mascaras(rgba, m)
        variantes = {'': rgba, '-bronze': metal(rgba, ouro, 'bronze'), '-prata': metal(rgba, ouro, 'prata'),
                     '-diamante': metal(rgba, ouro, 'diamante'), '-bloqueado': bloqueado(rgba, ouro, azul)}
        for suf, arr in variantes.items():
            total += salvar(reduzir(arr, ALTURA), os.path.join(SAIDA, 'bases', f'{nome}{suf}.webp'))
        for suf, met in (('', 'ouro'), ('-bronze', 'bronze'), ('-prata', 'prata'), ('-diamante', 'diamante')):
            v = verso(variantes[suf], centro, met, 7 + k)
            total += salvar(reduzir(v, 512), os.path.join(SAIDA, 'bases', f'{nome}-verso{suf}.webp'), 84)
        peq = reduzir(np.dstack([m, centro, faixa, m]).astype(float), ALTURA)
        geo[nome] = geometria(peq[..., 0] > .5, peq[..., 1] > .5, peq[..., 2] > .5)
        print(nome, geo[nome]['w'], geo[nome]['h'], geo[nome]['centro'], {k2: (round(v2, 5) if isinstance(v2, float) else v2) for k2, v2 in geo[nome]['faixa'].items()}, len(geo[nome]['contorno']), 'pontos')
    for nome in ('moeda',):  # troféu e baú agora são modelos 3D (GLB): não precisam de contorno nem de verso
        premio(nome, geo)
        print(nome, len(geo[nome]['contorno']), 'pontos')
    with open(GEO, 'w') as f:
        json.dump(geo, f, separators=(',', ':'))
    print('bases:', round(total / 1024), 'KB;', GEO)


if __name__ == '__main__':
    sys.exit(main())
