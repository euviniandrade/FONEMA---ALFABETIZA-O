/**
 * FOTO → 3D, CAMINHO GRÁTIS E SEM SERVIDOR (fila do dono nº 19): "relevo inflado".
 *
 * A partir da foto de um OBJETO, figura ou personagem desenhado (nunca de pessoa: LGPD), o navegador:
 *  1. separa o objeto do fundo (`recortarFundo`): usa a transparência do PNG, se houver; senão a cor do fundo, medida
 *     na borda da foto, e tudo o que encosta na borda com essa cor sai;
 *  2. "infla" a silhueta como uma almofada (`montarRelevo`): mais alto no meio, fino na borda; a frente leva a foto e o
 *     verso também (como um biscoito pintado dos dois lados). Não é uma reconstrução 3D de verdade (o verso não é
 *     inventado), mas gira 360° bonito e fica pronto na hora, sem gastar nada;
 *  3. grava um GLB (`escreverGLB`) com malha + textura, que o app carrega como os outros modelos.
 * O "3D completo" (modelo inteiro, com o verso de verdade) depende de um serviço gratuito na internet: a ferramenta
 * gera um pedido e app/scripts/foto-para-3d.ts faz o resto (ver app/docs/como-transformar-foto-em-3d.md).
 *
 * Tudo aqui é cálculo puro (sem DOM): roda no navegador, no Node (script) e nos testes.
 */

export interface Mascara { w: number; h: number; /** 1 = objeto, 0 = fundo */ px: Uint8Array }

/** Separa o objeto do fundo. `sensibilidade` (5–120): distância de cor até a qual um pixel ainda é "fundo". */
export function recortarFundo(rgba: Uint8Array | Uint8ClampedArray, w: number, h: number, sensibilidade = 40): Mascara {
  const n = w * h;
  const px = new Uint8Array(n);
  // 1) PNG com transparência de verdade: vale o canal alfa
  let transparentes = 0;
  for (let i = 0; i < n; i++) if (rgba[i * 4 + 3] < 128) transparentes++;
  if (transparentes > n * 0.02) {
    for (let i = 0; i < n; i++) px[i] = rgba[i * 4 + 3] >= 128 ? 1 : 0;
    return limpar({ w, h, px });
  }
  // 2) cor do fundo: mediana da borda
  const borda: number[][] = [];
  for (let x = 0; x < w; x++) { borda.push(cor(rgba, x, 0, w), cor(rgba, x, h - 1, w)); }
  for (let y = 0; y < h; y++) { borda.push(cor(rgba, 0, y, w), cor(rgba, w - 1, y, w)); }
  const fundo = [0, 1, 2].map((k) => mediana(borda.map((c) => c[k])));
  const limiar2 = sensibilidade * sensibilidade;
  const pareceFundo = (i: number) => {
    const dr = rgba[i * 4] - fundo[0], dg = rgba[i * 4 + 1] - fundo[1], db = rgba[i * 4 + 2] - fundo[2];
    return dr * dr + dg * dg + db * db <= limiar2;
  };
  // inundação a partir da borda: só é fundo o que tem a cor do fundo E encosta na borda por um caminho dessa cor
  const ehFundo = new Uint8Array(n);
  const fila: number[] = [];
  const semear = (i: number) => { if (!ehFundo[i] && pareceFundo(i)) { ehFundo[i] = 1; fila.push(i); } };
  for (let x = 0; x < w; x++) { semear(x); semear((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { semear(y * w); semear(y * w + w - 1); }
  while (fila.length) {
    const i = fila.pop()!;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) semear(i - 1);
    if (x < w - 1) semear(i + 1);
    if (y > 0) semear(i - w);
    if (y < h - 1) semear(i + w);
  }
  for (let i = 0; i < n; i++) px[i] = ehFundo[i] ? 0 : 1;
  return limpar({ w, h, px });
}

function cor(rgba: ArrayLike<number>, x: number, y: number, w: number): number[] { const i = (y * w + x) * 4; return [rgba[i], rgba[i + 1], rgba[i + 2]]; }
function mediana(v: number[]): number { const s = [...v].sort((a, b) => a - b); return s[s.length >> 1] ?? 0; }

/** Fica só o maior pedaço (sujeirinhas somem) e os buracos dentro dele são tapados. */
function limpar(m: Mascara): Mascara {
  const { w, h, px } = m;
  const rot = new Int32Array(w * h).fill(-1);
  let maior = -1, tamMaior = 0, rotulo = 0;
  for (let s = 0; s < w * h; s++) {
    if (!px[s] || rot[s] >= 0) continue;
    const pilha = [s];
    rot[s] = rotulo;
    let tam = 0;
    while (pilha.length) {
      const i = pilha.pop()!;
      tam++;
      const x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j >= 0 && px[j] && rot[j] < 0) { rot[j] = rotulo; pilha.push(j); }
      }
    }
    if (tam > tamMaior) { tamMaior = tam; maior = rotulo; }
    rotulo++;
  }
  const out = new Uint8Array(w * h);
  if (maior < 0) return { w, h, px: out };
  for (let i = 0; i < w * h; i++) out[i] = rot[i] === maior ? 1 : 0;
  // tapa buracos: o que não é objeto e não alcança a borda vira objeto
  const fora = new Uint8Array(w * h);
  const fila: number[] = [];
  const semear = (i: number) => { if (!out[i] && !fora[i]) { fora[i] = 1; fila.push(i); } };
  for (let x = 0; x < w; x++) { semear(x); semear((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { semear(y * w); semear(y * w + w - 1); }
  while (fila.length) {
    const i = fila.pop()!;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) semear(i - 1);
    if (x < w - 1) semear(i + 1);
    if (y > 0) semear(i - w);
    if (y < h - 1) semear(i + w);
  }
  for (let i = 0; i < w * h; i++) if (!fora[i]) out[i] = 1;
  return { w, h, px: out };
}

/** Caixa do objeto na máscara (em pixels). */
export function caixaDaMascara(m: Mascara): { x: number; y: number; w: number; h: number } | null {
  let x0 = m.w, y0 = m.h, x1 = -1, y1 = -1;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.px[y * m.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export interface Malha { pos: Float32Array; nor: Float32Array; uv: Float32Array; idx: Uint32Array }

/**
 * Infla a silhueta. A malha sai com altura 1 (pés em y = 0), centrada em x e z, de frente para +Z.
 * `espessura`: meia-espessura máxima em relação à altura (0,04–0,3). `celulas`: resolução da grade no lado maior.
 * As coordenadas de textura (u, v) cobrem a CAIXA do objeto na máscara (a textura deve ser a foto recortada nela).
 */
export function montarRelevo(m: Mascara, o: { espessura?: number; celulas?: number } = {}): Malha {
  const caixa = caixaDaMascara(m);
  if (!caixa) throw new Error('Não achei o objeto na foto.');
  const N = Math.max(16, Math.min(160, o.celulas ?? 96));
  const passo = Math.max(caixa.w, caixa.h) / N;
  const gw = Math.max(2, Math.round(caixa.w / passo)), gh = Math.max(2, Math.round(caixa.h / passo));
  // célula está cheia se o pixel do meio dela é objeto
  const cheia = new Uint8Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const x = Math.min(m.w - 1, Math.floor(caixa.x + (i + 0.5) * caixa.w / gw)), y = Math.min(m.h - 1, Math.floor(caixa.y + (j + 0.5) * caixa.h / gh));
    cheia[j * gw + i] = m.px[y * m.w + x];
  }
  // vértices da grade: (gw+1) × (gh+1); dentro = todas as 4 células em volta cheias; borda = alguma cheia e alguma vazia
  const VW = gw + 1, VH = gh + 1;
  const usado = new Uint8Array(VW * VH), borda = new Uint8Array(VW * VH);
  const celula = (i: number, j: number) => (i >= 0 && j >= 0 && i < gw && j < gh ? cheia[j * gw + i] : 0);
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
    const c = celula(i - 1, j - 1) + celula(i, j - 1) + celula(i - 1, j) + celula(i, j);
    if (c > 0) usado[j * VW + i] = 1;
    if (c > 0 && c < 4) borda[j * VW + i] = 1;
  }
  // distância de cada vértice até a borda (chanfro 3-4, duas passadas)
  const INF = 1e9;
  const dist = new Float64Array(VW * VH);
  for (let k = 0; k < VW * VH; k++) dist[k] = !usado[k] ? 0 : borda[k] ? 0 : INF;
  const relaxar = (k: number, k2: number, custo: number) => { if (dist[k2] + custo < dist[k]) dist[k] = dist[k2] + custo; };
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
    const k = j * VW + i;
    if (!usado[k] || borda[k]) continue;
    if (i > 0) relaxar(k, k - 1, 3);
    if (j > 0) relaxar(k, k - VW, 3);
    if (i > 0 && j > 0) relaxar(k, k - VW - 1, 4);
    if (i < VW - 1 && j > 0) relaxar(k, k - VW + 1, 4);
  }
  for (let j = VH - 1; j >= 0; j--) for (let i = VW - 1; i >= 0; i--) {
    const k = j * VW + i;
    if (!usado[k] || borda[k]) continue;
    if (i < VW - 1) relaxar(k, k + 1, 3);
    if (j < VH - 1) relaxar(k, k + VW, 3);
    if (i < VW - 1 && j < VH - 1) relaxar(k, k + VW + 1, 4);
    if (i > 0 && j < VH - 1) relaxar(k, k + VW - 1, 4);
  }
  let dmax = 1;
  for (let k = 0; k < VW * VH; k++) if (usado[k] && dist[k] > dmax) dmax = dist[k];
  // posições: altura = 1 (y para cima), largura proporcional; borda alisada (sem degraus da grade)
  const esc = 1 / gh;
  const px = new Float64Array(VW * VH), py = new Float64Array(VW * VH);
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) { const k = j * VW + i; px[k] = (i - gw / 2) * esc; py[k] = (gh - j) * esc; }
  for (let it = 0; it < 3; it++) {
    const nx = Float64Array.from(px), ny = Float64Array.from(py);
    for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
      const k = j * VW + i;
      if (!borda[k]) continue;
      let sx = 0, sy = 0, c = 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const i2 = i + di, j2 = j + dj;
        if (i2 < 0 || j2 < 0 || i2 >= VW || j2 >= VH) continue;
        const k2 = j2 * VW + i2;
        if (borda[k2]) { sx += px[k2]; sy += py[k2]; c++; }
      }
      if (c >= 2) { nx[k] = 0.5 * px[k] + 0.5 * sx / c; ny[k] = 0.5 * py[k] + 0.5 * sy / c; }
    }
    px.set(nx); py.set(ny);
  }
  const larguraMeia = (o.espessura ?? 0.12);
  const altura = (k: number) => larguraMeia * Math.sqrt(Math.min(1, dist[k] / dmax)) * (0.35 + 0.65 * Math.min(1, dist[k] / dmax));
  // frente e verso: vértices separados (normais e textura próprias); a borda (altura 0) é a mesma posição nos dois
  const indice = new Int32Array(VW * VH).fill(-1);
  const pos: number[] = [], uv: number[] = [];
  let nv = 0;
  for (let k = 0; k < VW * VH; k++) {
    if (!usado[k]) continue;
    indice[k] = nv++;
    const i = k % VW, j = (k / VW) | 0;
    pos.push(px[k], py[k], altura(k));
    uv.push(i / gw, j / gh);
  }
  const base = nv;
  for (let k = 0; k < VW * VH; k++) {
    if (!usado[k]) continue;
    const i = k % VW, j = (k / VW) | 0;
    pos.push(px[k], py[k], -altura(k));
    uv.push(i / gw, j / gh);
  }
  const idx: number[] = [];
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    if (!cheia[j * gw + i]) continue;
    const a = indice[j * VW + i], b = indice[j * VW + i + 1], c = indice[(j + 1) * VW + i], d = indice[(j + 1) * VW + i + 1];
    // y cresce para cima e j para baixo: (a, c, b) fica de frente para +Z
    idx.push(a, c, b, b, c, d);
    idx.push(base + a, base + b, base + c, base + b, base + d, base + c);
  }
  const P = Float32Array.from(pos);
  return { pos: P, nor: normais(P, idx), uv: Float32Array.from(uv), idx: Uint32Array.from(idx) };
}

function normais(pos: Float32Array, idx: number[]): Float32Array {
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const p of [a, b, c]) { n[p] += nx; n[p + 1] += ny; n[p + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

/**
 * Grava um GLB (glTF 2.0 binário) com uma malha e a textura de cor (JPEG ou PNG já codificado). `olharParaX`: gira o
 * objeto para olhar para +X, como os modelos 3D do projeto (o palco dos prêmios e o passeio contam com isso).
 */
export function escreverGLB(m: Malha, textura: Uint8Array, mime: 'image/jpeg' | 'image/png', nome = 'objeto', olharParaX = false): Uint8Array {
  const alinhar = (x: number) => (x + 3) & ~3;
  const partes: { dados: Uint8Array; alvo?: number }[] = [
    { dados: new Uint8Array(m.pos.buffer, m.pos.byteOffset, m.pos.byteLength), alvo: 34962 },
    { dados: new Uint8Array(m.nor.buffer, m.nor.byteOffset, m.nor.byteLength), alvo: 34962 },
    { dados: new Uint8Array(m.uv.buffer, m.uv.byteOffset, m.uv.byteLength), alvo: 34962 },
    { dados: new Uint8Array(m.idx.buffer, m.idx.byteOffset, m.idx.byteLength), alvo: 34963 },
    { dados: textura }
  ];
  let total = 0;
  const vistas = partes.map((p) => { const v = { buffer: 0, byteOffset: total, byteLength: p.dados.length, ...(p.alvo ? { target: p.alvo } : {}) }; total = alinhar(total + p.dados.length); return v; });
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m.pos.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], m.pos[i + k]); max[k] = Math.max(max[k], m.pos[i + k]); }
  const nv = m.pos.length / 3;
  const gltf = {
    asset: { version: '2.0', generator: 'FONEMA foto-3d (relevo)' },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: nome, ...(olharParaX ? { rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2] } : {}) }],
    meshes: [{ name: nome, primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{ name: nome, pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.75 } }],
    textures: [{ source: 0, sampler: 0 }], samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
    images: [{ bufferView: 4, mimeType: mime }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: nv, type: 'VEC3', min, max },
      { bufferView: 1, componentType: 5126, count: nv, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: nv, type: 'VEC2' },
      { bufferView: 3, componentType: 5125, count: m.idx.length, type: 'SCALAR' }
    ],
    bufferViews: vistas, buffers: [{ byteLength: total }]
  };
  let json = new TextEncoder().encode(JSON.stringify(gltf));
  const jl = alinhar(json.length);
  if (jl !== json.length) { const j2 = new Uint8Array(jl).fill(0x20); j2.set(json); json = j2; }
  const out = new Uint8Array(12 + 8 + jl + 8 + total);
  const v = new DataView(out.buffer);
  v.setUint32(0, 0x46546c67, true); v.setUint32(4, 2, true); v.setUint32(8, out.length, true);
  v.setUint32(12, jl, true); v.setUint32(16, 0x4e4f534a, true); out.set(json, 20);
  const b0 = 20 + jl;
  v.setUint32(b0, total, true); v.setUint32(b0 + 4, 0x004e4942, true);
  partes.forEach((p, i) => out.set(p.dados, b0 + 8 + vistas[i].byteOffset));
  return out;
}

/** Nome de arquivo seguro a partir do nome do item ("Carrinho Azul" → "carrinho-azul"). */
export function slugItem(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'objeto';
}
