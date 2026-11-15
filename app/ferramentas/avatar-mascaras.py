#!/usr/bin/env python3
"""
FONEMA · máscaras de região dos avatares 3D (D029 §7).

Os avatares padrão vêm de uma plataforma de 3D como UMA malha com UMA textura (não são kit de peças). Para a
criança mudar as cores sem trocar de modelo, este script descobre, texel por texel, a que parte do boneco
cada ponto da textura pertence e grava:

  <saida>/<nome>.mascara.png   R = região (0 nada · 1 pele · 2 cabelo/sobrancelha · 3 íris · 4 camiseta · 5 calça · 6 calçado)
                               G = peso (0–255); na íris, G = distância ao centro da íris (0 centro · 255 borda)
  <saida>/<nome>.cor.webp      textura de cor original, já em 1024 px (é a que o app recolore)
  <saida>/avatares.json        lista dos modelos + médias de cor de cada região + âncoras (olhos, cabeça, frente)

Como decide: cor do texel (matiz/saturação/valor) + posição 3D do triângulo que usa aquele texel
(altura: cabeça / tronco / pernas / pés; distância aos olhos). A letra "A", o branco dos olhos, o brilho da
íris, a linha dos cílios e a sola do tênis ficam FORA das máscaras: nunca mudam de cor.

Uso (na raiz do repositório):
  python3 app/ferramentas/avatar-mascaras.py                # todos os avatar-*.glb de docs/.../padrao/modelos
  python3 app/ferramentas/avatar-mascaras.py --conferir DIR  # grava também imagens de conferência em DIR

Depende de: numpy, Pillow, pygltflib  (pip install numpy pillow pygltflib)
"""
import argparse
import colorsys
import io
import json
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
import pygltflib

RAIZ = Path(__file__).resolve().parents[2]
ORIGEM = RAIZ / 'docs/propostas/06-fonema-unificada/avatar-3d/padrao/modelos'
SAIDA = RAIZ / 'app/web/public/assets/modelos3d'
LADO = 1024
REGIOES = {'pele': 1, 'cabelo': 2, 'iris': 3, 'camisa': 4, 'calca': 5, 'calcado': 6}
CORES_CONFERENCIA = {0: (40, 40, 40), 1: (240, 170, 120), 2: (150, 60, 200), 3: (0, 220, 255), 4: (240, 60, 60), 5: (60, 200, 80), 6: (250, 220, 40)}


def ler_acessor(g, blob, i):
    a = g.accessors[i]
    bv = g.bufferViews[a.bufferView]
    tipos = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}
    comps = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a.type]
    dt = np.dtype('<' + tipos[a.componentType])
    ini = (bv.byteOffset or 0) + (a.byteOffset or 0)
    passo = bv.byteStride or dt.itemsize * comps
    bruto = np.frombuffer(blob, dtype=np.uint8, count=passo * (a.count - 1) + dt.itemsize * comps, offset=ini)
    if passo == dt.itemsize * comps:
        return np.frombuffer(bruto.tobytes(), dtype=dt).reshape(a.count, comps)
    return np.stack([np.frombuffer(bruto[k * passo:k * passo + dt.itemsize * comps].tobytes(), dtype=dt) for k in range(a.count)])


def carregar(caminho):
    g = pygltflib.GLTF2().load(str(caminho))
    blob = g.binary_blob()
    prim = g.meshes[0].primitives[0]
    pos = ler_acessor(g, blob, prim.attributes.POSITION).astype(np.float64)
    uv = ler_acessor(g, blob, prim.attributes.TEXCOORD_0).astype(np.float64)
    idx = ler_acessor(g, blob, prim.indices).reshape(-1, 3).astype(np.int64)
    mat = g.materials[prim.material]
    img = g.images[g.textures[mat.pbrMetallicRoughness.baseColorTexture.index].source]
    bv = g.bufferViews[img.bufferView]
    cor = Image.open(io.BytesIO(blob[bv.byteOffset:bv.byteOffset + bv.byteLength])).convert('RGB').resize((LADO, LADO), Image.LANCZOS)
    return pos, uv, idx, cor


def mapa_de_posicao(pos, uv, idx):
    """Para cada texel coberto por um triângulo, a posição 3D daquele ponto da malha."""
    mapa = np.zeros((LADO, LADO, 3))
    coberto = np.zeros((LADO, LADO), bool)
    P = uv * LADO - 0.5  # centro do texel
    for a, b, c in idx:
        pa, pb, pc = P[a], P[b], P[c]
        x0, x1 = int(np.floor(min(pa[0], pb[0], pc[0]))) - 1, int(np.ceil(max(pa[0], pb[0], pc[0]))) + 1
        y0, y1 = int(np.floor(min(pa[1], pb[1], pc[1]))) - 1, int(np.ceil(max(pa[1], pb[1], pc[1]))) + 1
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, LADO - 1), min(y1, LADO - 1)
        if x1 < x0 or y1 < y0:
            continue
        den = (pb[1] - pc[1]) * (pa[0] - pc[0]) + (pc[0] - pb[0]) * (pa[1] - pc[1])
        if abs(den) < 1e-12:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        w0 = ((pb[1] - pc[1]) * (xs - pc[0]) + (pc[0] - pb[0]) * (ys - pc[1])) / den
        w1 = ((pc[1] - pa[1]) * (xs - pc[0]) + (pa[0] - pc[0]) * (ys - pc[1])) / den
        w2 = 1 - w0 - w1
        e = -0.35  # folga: cobre também a borda do triângulo (evita falhas nas emendas)
        dentro = (w0 >= e) & (w1 >= e) & (w2 >= e)
        if not dentro.any():
            continue
        exato = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        alvo = dentro & (exato | ~coberto[y0:y1 + 1, x0:x1 + 1])
        p3 = w0[..., None] * pos[a] + w1[..., None] * pos[b] + w2[..., None] * pos[c]
        mapa[y0:y1 + 1, x0:x1 + 1][alvo] = p3[alvo]
        coberto[y0:y1 + 1, x0:x1 + 1] |= dentro
    return mapa, coberto


def hsv(rgb):
    r, g, b = [rgb[..., i] / 255.0 for i in range(3)]
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = m & (mx == r)
    gg = m & (mx == g) & ~rr
    bb = m & ~rr & ~gg
    h[rr] = ((g[rr] - b[rr]) / d[rr]) % 6
    h[gg] = (b[gg] - r[gg]) / d[gg] + 2
    h[bb] = (r[bb] - g[bb]) / d[bb] + 4
    return h * 60, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx


def vale_mais_escuro(valores, alturas, de, ate, passos=60):
    """Altura (entre `de` e `ate`) onde a roupa branca fica mais escura: é a sombra da barra (camiseta sobre a calça, calça sobre o tênis)."""
    bordas = np.linspace(de, ate, passos + 1)
    medias = []
    for i in range(passos):
        m = (alturas >= bordas[i]) & (alturas < bordas[i + 1])
        medias.append(np.percentile(valores[m], 12) if m.sum() > 30 else 1.0)
    medias = np.convolve(np.array(medias), np.ones(3) / 3, mode='same')
    k = int(np.argmin(medias[1:-1])) + 1
    return float((bordas[k] + bordas[k + 1]) / 2)


def segmentar(nome, pos, uv, idx, cor, conferir=None):
    rgb = np.asarray(cor).astype(np.float64)
    mapa, coberto = mapa_de_posicao(pos, uv, idx)
    H, S, V = hsv(rgb)
    ymin, ymax = pos[:, 1].min(), pos[:, 1].max()
    alt = (mapa[..., 1] - ymin) / (ymax - ymin)  # 0 = sola · 1 = topo do cabelo
    escala = ymax - ymin

    branco = (S < 0.2) & (V > 0.33)
    quente = ((H < 48) | (H > 335)) & (S >= 0.2)
    pele_cor = quente & (V > 0.5)
    escuro = (V < 0.5) & ~((H > 185) & (H < 265) & (S > 0.25))
    azul = (H > 185) & (H < 265) & (S > 0.22)

    # ---- olhos: o branco do olho é o único branco "puro" na altura da cabeça
    esclera = coberto & (S < 0.16) & (V > 0.72) & (alt > 0.72) & (alt < 0.93)
    if esclera.sum() < 40:
        raise SystemExit(f'{nome}: não achei o branco dos olhos')
    pe = mapa[esclera]
    frente = pe[:, [0, 2]].mean(axis=0)
    frente /= np.linalg.norm(frente)                       # direção para onde o rosto olha (plano XZ)
    lado = np.array([frente[1], -frente[0]])               # +lado = esquerda do boneco
    coord_lado = mapa[..., 0] * lado[0] + mapa[..., 2] * lado[1]
    coord_frente = mapa[..., 0] * frente[0] + mapa[..., 2] * frente[1]
    olhos = []
    zona_olho = np.zeros((LADO, LADO), bool)
    iris = np.zeros((LADO, LADO), bool)
    raio_norm = np.zeros((LADO, LADO))
    for sinal in (-1, 1):
        m = esclera & (np.sign(coord_lado) == sinal)
        centro = np.median(mapa[m], axis=0)
        for _ in range(3):  # aparado: ignora brancos soltos longe do olho (brilhos, dentes)
            d = np.linalg.norm(mapa - centro, axis=-1)
            m = m & (d < 0.07 * escala)
            centro = np.median(mapa[m], axis=0)
        d = np.linalg.norm(mapa - centro, axis=-1)
        raio = np.percentile(d[m], 95)
        perto = coberto & (d < raio * 1.15)
        # a íris é o disco escuro dentro do olho
        nucleo = perto & (V < 0.5)
        c_iris = np.median(mapa[nucleo], axis=0)
        di = np.linalg.norm(mapa - c_iris, axis=-1)
        r_iris = np.percentile(di[nucleo & (di < raio)], 88)
        disco = coberto & (di <= r_iris * 1.04) & ~((S < 0.2) & (V > 0.62))  # tira o branco e o brilho
        iris |= disco
        raio_norm[disco] = np.clip(di[disco] / (r_iris * 1.04), 0, 1)
        zona_olho |= coberto & (d < raio * 1.45)
        olhos.append({'centro': c_iris.tolist(), 'raioIris': float(r_iris), 'raioOlho': float(raio)})
    altura_olhos = np.mean([o['centro'][1] for o in olhos])
    alt_olhos = (altura_olhos - ymin) / escala
    raio_olho = np.mean([o['raioOlho'] for o in olhos])

    # ---- pescoço: a cabeça começa onde acaba a gola (primeira altura, descendo dos olhos, com muito branco)
    faixa = np.linspace(alt_olhos, 0.4, 80)
    alt_gola = 0.6
    for i in range(len(faixa) - 1):
        m = coberto & (alt <= faixa[i]) & (alt > faixa[i + 1])
        if m.sum() > 50 and (branco & m).sum() / m.sum() > 0.45:
            alt_gola = float(faixa[i])
            break

    cabeca = alt > alt_gola
    # boca, nariz e queixo: só o miolo do rosto (entre os olhos, um pouco além) — o cabelo que emoldura o rosto fica de fora
    meia_distancia = abs(np.dot(np.array(olhos[1]['centro'])[[0, 2]] - np.array(olhos[0]['centro'])[[0, 2]], lado)) / 2
    rosto_baixo = cabeca & (alt < alt_olhos - 0.6 * raio_olho / escala) & (coord_frente > 0) & (np.abs(coord_lado) < meia_distancia + 1.1 * raio_olho)

    regiao = np.zeros((LADO, LADO), np.uint8)
    peso = np.zeros((LADO, LADO), np.uint8)

    # pele: tom quente (inclui o corado e a boca, que acompanham o tom) — menos o que é olho
    pele = coberto & (pele_cor | (quente & rosto_baixo)) & ~iris
    # cabelo e sobrancelha: escuro na cabeça, fora dos olhos e fora da parte de baixo do rosto
    cabelo = coberto & escuro & cabeca & ~zona_olho & ~rosto_baixo & ~pele
    # pontas do cabelo comprido que descem abaixo da gola: marrom-escuro (a sombra da roupa é cinza, sem matiz)
    cabelo |= coberto & escuro & quente & (alt > alt_gola - 0.09) & ~cabeca & ~pele
    # escuro perto do olho que não é íris (cílios, contorno): fica como está
    # roupa: branco/cinza abaixo da gola
    roupa = coberto & ~cabeca & ~pele & ~azul & (S < 0.26)
    v_roupa = V[roupa]
    a_roupa = alt[roupa]
    meio = np.abs(coord_lado[roupa]) < 0.07 * escala                     # só o tronco e as pernas, sem os braços
    # barra da camiseta: a camiseta cai por cima da calça, então o tronco "engrossa" de repente nessa altura
    f_meio, a_meio = coord_frente[roupa][meio], a_roupa[meio]
    bordas = np.linspace(0.24, 0.46, 45)
    esp = np.array([np.ptp(f_meio[(a_meio >= bordas[i]) & (a_meio < bordas[i + 1])]) if ((a_meio >= bordas[i]) & (a_meio < bordas[i + 1])).sum() > 5 else 0 for i in range(44)])
    salto = int(np.argmax(esp[1:] - esp[:-1])) + 1
    alt_barra = float(bordas[salto])
    alt_tornozelo = vale_mais_escuro(v_roupa, a_roupa, 0.045, 0.14)         # barra da calça sobre o tênis
    # se aparece pele entre a calça e o tênis (calça curta, barra dobrada), o tornozelo é a fronteira
    canela = pele & (alt > 0.04) & (alt < 0.2) & (np.abs(coord_lado) < 0.12 * escala)
    if canela.sum() > 300:
        alt_tornozelo = float(np.median(alt[canela]))
    alt_sola = 0.022

    regiao[pele] = REGIOES['pele']
    regiao[cabelo] = REGIOES['cabelo']
    regiao[roupa & (alt >= alt_barra)] = REGIOES['camisa']
    regiao[roupa & (alt < alt_barra) & (alt >= alt_tornozelo)] = REGIOES['calca']
    regiao[roupa & (alt < alt_tornozelo) & (alt >= alt_sola)] = REGIOES['calcado']
    regiao[iris] = REGIOES['iris']
    # a letra A (e a borda suavizada dela) nunca muda
    letra = coberto & azul & ~cabeca
    letra_larga = np.asarray(Image.fromarray((letra * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    regiao[letra_larga & (S > 0.1)] = 0
    regiao[letra] = 0
    peso[regiao > 0] = 255
    peso[iris] = np.round(raio_norm[iris] * 255).astype(np.uint8)

    # ---- preenche a folga em volta de cada ilha da textura (os filtros da placa leem texels vizinhos)
    for _ in range(10):
        vazio = ~coberto
        if not vazio.any():
            break
        viz_r = np.asarray(Image.fromarray(regiao).filter(ImageFilter.MaxFilter(3)))
        viz_c = np.asarray(Image.fromarray((coberto * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
        novo = vazio & viz_c
        # só herda a região se a cor do texel de folga combina com ela (não inventa cor na borda de outra ilha)
        combina = np.zeros_like(novo)
        combina |= (viz_r == 1) & quente
        combina |= (viz_r == 2) & escuro
        combina |= (viz_r >= 4) & (S < 0.26)
        ok = novo & combina
        regiao[ok] = viz_r[ok]
        peso[ok] = 255
        coberto = coberto | novo

    def media(m):
        return [round(float(x), 1) for x in rgb[m].mean(axis=0)] if m.any() else [0, 0, 0]

    centro_cabeca = mapa[(regiao <= 2) & cabeca & (peso > 0)].mean(axis=0)
    info = {
        'medias': {
            'pele': media(regiao == 1), 'cabelo': media(regiao == 2), 'iris': media(regiao == 3),
            'roupa': [round(float(np.percentile(V[regiao >= 4], 90) * 255), 1)] * 3
        },
        'alturas': {'gola': round(alt_gola, 4), 'barraCamiseta': round(alt_barra, 4), 'tornozelo': round(alt_tornozelo, 4), 'olhos': round(float(alt_olhos), 4)},
        'frente': [round(float(frente[0]), 5), round(float(frente[1]), 5)],
        'caixa': {'min': pos.min(axis=0).round(5).tolist(), 'max': pos.max(axis=0).round(5).tolist()},
        'olhos': olhos,
        'cabeca': {'centro': centro_cabeca.round(5).tolist()},
        'cobertura': {k: int((regiao == v).sum()) for k, v in REGIOES.items()}
    }

    masc = np.zeros((LADO, LADO, 3), np.uint8)
    masc[..., 0] = regiao
    masc[..., 1] = peso

    if conferir:
        conferir.mkdir(parents=True, exist_ok=True)
        pal = np.array([CORES_CONFERENCIA[i] for i in range(7)], np.uint8)
        over = (0.45 * rgb + 0.55 * pal[regiao]).astype(np.uint8)
        Image.fromarray(over).save(conferir / f'{nome}-regioes-na-textura.png')
        # vistas de frente / lado / costas, com cada vértice na cor da sua região
        vu = np.clip((uv * LADO).astype(int), 0, LADO - 1)
        rv = regiao[vu[:, 1], vu[:, 0]]
        cv = rgb[vu[:, 1], vu[:, 0]]
        f = pos[:, 0] * frente[0] + pos[:, 2] * frente[1]
        l = pos[:, 0] * lado[0] + pos[:, 2] * lado[1]
        tela = Image.new('RGB', (1200, 620), (30, 60, 120))
        px = tela.load()
        for k, (hx, prof, sinal) in enumerate([(l, f, 1), (f, -l, 1), (-l, -f, 1)]):
            ordem = np.argsort(prof)
            for usar_regiao, dx in ((False, 0), (True, 200)):
                for i in ordem:
                    x = int(100 + k * 400 + dx + hx[i] * 560)
                    y = int(600 - (pos[i, 1] - ymin) / escala * 580)
                    c = tuple(int(v) for v in (pal[rv[i]] if usar_regiao else cv[i]))
                    for ox in (0, 1):
                        for oy in (0, 1):
                            if 0 <= x + ox < 1200 and 0 <= y + oy < 620:
                                px[x + ox, y + oy] = c
        tela.save(conferir / f'{nome}-regioes-no-boneco.png')
    return Image.fromarray(masc), info


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--origem', type=Path, default=ORIGEM)
    ap.add_argument('--saida', type=Path, default=SAIDA)
    ap.add_argument('--conferir', type=Path)
    a = ap.parse_args()
    arquivos = sorted(a.origem.glob('avatar-*.glb'))
    if not arquivos:
        sys.exit(f'nenhum avatar-*.glb em {a.origem}')
    manifesto_caminho = a.saida / 'avatares.json'
    manifesto = {'versao': 1, 'modelos': {}}
    for arq in arquivos:
        nome = arq.stem                      # avatar-menino-padrao
        chave = nome.replace('avatar-', '')  # menino-padrao
        pos, uv, idx, cor = carregar(arq)
        masc, info = segmentar(nome, pos, uv, idx, cor, a.conferir)
        masc.save(a.saida / f'{nome}.mascara.png', optimize=True)
        cor.save(a.saida / f'{nome}.cor.webp', quality=90, method=6)
        manifesto['modelos'][chave] = {'arquivo': f'{nome}.glb', 'cor': f'{nome}.cor.webp', 'mascara': f'{nome}.mascara.png', **info}
        print(f'{nome}: alturas {info["alturas"]} · cobertura {info["cobertura"]}')
    manifesto_caminho.write_text(json.dumps(manifesto, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    print(f'→ {manifesto_caminho}')


if __name__ == '__main__':
    main()
