// FONEMA · Mundo 3D v2 — COLISÃO do passeio (grade 2D vista de cima, montada uma vez).
//
// A vila é feita de "lotes" (kit.js › Lote): cada peça é uma geometria + matriz. Aqui cada peça vira uma pegada no chão:
// se ela ocupa a faixa do corpo do boneco (de 0,45 m a 1,6 m acima do chão), a célula fica BLOQUEADA (paredes, muros,
// cercas, bancos, postes, troncos, canteiros, coreto). Telhados, copas, varais e fios passam por cima e não bloqueiam.
// Em outra grade fica a ALTURA do que está em cima de cada célula: a câmera usa para não atravessar casas.
// Água: o rio é raso na beira (o boneco nada) e fundo no meio (não passa). A mata fica fora do LIMITE da vila.
import * as THREE from 'three';

const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

/** Elipse da área andável (a mesma forma do relevo: o morro da mata começa logo depois). */
export const LIMITE = { cx: 0, cz: 4, rx: 50 / 0.95, rz: 50 / 0.85 };
export const foraDoLimite = (x, z) => ((x - LIMITE.cx) / LIMITE.rx) ** 2 + ((z - LIMITE.cz) / LIMITE.rz) ** 2 > 1;

export function criarColisao(vila, { celula = 0.25, ext = 90, corpo = [0.45, 1.6] } = {}) {
  const N = Math.round((ext * 2) / celula);
  const bloq = new Uint8Array(N * N); // 1 = obstáculo
  const topo = new Float32Array(N * N).fill(-99); // altura do que está em cima (câmera)
  const altura = vila.altura;
  const ci = (x) => Math.floor((x + ext) / celula);
  const cx = (i) => -ext + (i + 0.5) * celula;

  /** Marca a pegada de uma peça (geometria + matriz). */
  function peca(geo, m, { soTopo = false } = {}) {
    if (!geo.boundingBox) geo.computeBoundingBox();
    const bb = geo.boundingBox;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < 8; k++) {
      _v.set(k & 1 ? bb.max.x : bb.min.x, k & 2 ? bb.max.y : bb.min.y, k & 4 ? bb.max.z : bb.min.z).applyMatrix4(m);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y); z0 = Math.min(z0, _v.z); z1 = Math.max(z1, _v.z);
    }
    if (x1 - x0 > 60 || z1 - z0 > 60) return; // nada tão grande é parede
    const g = altura((x0 + x1) / 2, (z0 + z1) / 2);
    const bloqueia = !soTopo && y0 < g + corpo[1] && y1 > g + corpo[0];
    // câmera: só o que desce até perto do chão (paredes, muros, troncos); fio e varal (pegada enganosa) ficam de fora
    const cobre = y1 > g + corpo[0] && y0 < g + 2.5;
    if (!bloqueia && !cobre) return;
    _m.copy(m).invert();
    const e = _m.elements, yT = clamp(g + 1.0, y0, y1);
    const i0 = Math.max(0, ci(x0)), i1 = Math.min(N - 1, ci(x1)), j0 = Math.max(0, ci(z0)), j1 = Math.min(N - 1, ci(z1));
    // pegada fina (fio, vareta) ganha meia célula de folga para não escapar entre as células
    const folga = celula * 0.5;
    _s.setFromMatrixScale(m);
    const fx = folga / Math.max(1e-3, _s.x), fz = folga / Math.max(1e-3, _s.z);
    for (let j = j0; j <= j1; j++) {
      const z = cx(j);
      for (let i = i0; i <= i1; i++) {
        const x = cx(i);
        // ponto do mundo → espaço da peça
        const lx = e[0] * x + e[4] * yT + e[8] * z + e[12], lz = e[2] * x + e[6] * yT + e[10] * z + e[14];
        if (lx < bb.min.x - fx || lx > bb.max.x + fx || lz < bb.min.z - fz || lz > bb.max.z + fz) continue;
        const c = j * N + i;
        if (bloqueia) bloq[c] = 1;
        if (cobre && y1 > topo[c]) topo[c] = y1;
      }
    }
  }
  /** Círculo bloqueado (tronco, arbusto). */
  function circulo(x, z, r, alto = 3) {
    const i0 = Math.max(0, ci(x - r)), i1 = Math.min(N - 1, ci(x + r)), j0 = Math.max(0, ci(z - r)), j1 = Math.min(N - 1, ci(z + r));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if ((cx(i) - x) ** 2 + (cx(j) - z) ** 2 > r * r) continue;
      const c = j * N + i; bloq[c] = 1; topo[c] = Math.max(topo[c], altura(x, z) + alto);
    }
  }

  const t0 = performance.now();
  const [corpoLote] = vila.pecas(); // folhas (lote Fo) ficam de fora: a câmera pode passar pelas copas
  for (const p of corpoLote) peca(p.geo, p.m);
  for (const [m] of vila.troncos) { _v.setFromMatrixPosition(m); _s.setFromMatrixScale(m); circulo(_v.x, _v.z, Math.max(0.4, 0.42 * _s.x) + 0.08, _s.y + 3); }
  for (const a of vila.arbustos) { _v.setFromMatrixPosition(a.m); _s.setFromMatrixScale(a.m); if (_s.x > 0.6) circulo(_v.x, _v.z, 0.55 * _s.x, 0.6); }
  const ms = performance.now() - t0;

  const idx = (x, z) => { const i = ci(x), j = ci(z); return i < 0 || j < 0 || i >= N || j >= N ? -1 : j * N + i; };
  const { distRio, NIVEL_AGUA, RIO_W } = vila;

  /** Profundidade da água no ponto (0 = seco). */
  function agua(x, z) {
    if (distRio(x, z) > RIO_W / 2 + 1.0) return 0;
    return Math.max(0, NIVEL_AGUA - altura(x, z));
  }

  return {
    N, celula, ext, ms, NIVEL_AGUA,
    altura,
    agua,
    /** O boneco (raio r) cabe em (x, z)? Motivo quando não cabe: 'parede' | 'fundo' | 'limite'. */
    livre(x, z, r = 0.3) {
      if (foraDoLimite(x, z)) return 'limite';
      if (distRio(x, z) < 3.2) return 'fundo';
      for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) {
        const c = idx(x + dx, z + dz);
        if (c < 0 || bloq[c]) return 'parede';
      }
      return null;
    },
    /** Altura do que cobre o ponto (telhado, copa) ou -99. */
    topo(x, z) { const c = idx(x, z); return c < 0 ? -99 : topo[c]; },
    bloqueado(x, z) { const c = idx(x, z); return c < 0 || bloq[c] === 1; },
    /** Para depurar: imagem da grade (vermelho = bloqueado). */
    imagem() {
      const cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); const im = g.createImageData(N, N);
      for (let c = 0; c < N * N; c++) { const b = bloq[c]; im.data.set(b ? [220, 60, 60, 255] : topo[c] > -50 ? [120, 140, 220, 255] : [240, 240, 230, 255], c * 4); }
      g.putImageData(im, 0, 0); return cv.toDataURL();
    },
  };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
