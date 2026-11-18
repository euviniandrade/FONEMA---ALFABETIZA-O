/**
 * PENTEADOS EM PEÇA SEPARADA (pedido do dono de 18/11: "não tem vários tipos de cabelo").
 *
 * O avatar é um modelo pronto de malha única: o cabelo vem pintado nele. Para trocar o penteado sem um modelo novo
 * por tipo, o cabelo do modelo é cortado rente ao crânio (avatarGlb.ts › cabeloRente) e a peça de cabelo é montada
 * aqui, em código, apoiada nesse crânio (um elipsoide medido em cada modelo). Tudo é geometria leve feita na hora:
 *  - mechas: tubos achatados e afinando na ponta, que seguem a cabeça e caem pela gravidade (liso, ondulado, franja,
 *    rabo de cavalo, topete);
 *  - cachos: molas (hélices) e "C" curtos;
 *  - crespo: volume macio com relevo miúdo, que deixa o rosto livre (black power, puffs);
 *  - tranças e twists: tubos com gomos que giram.
 * As mesmas peças servem ao passeio 3D (vão no pacote do boneco: pacote.ts) e a qualquer modelo que tenha o crânio
 * medido. A cor vem da escolha da criança (a mesma do cabelo rente e das sobrancelhas).
 */
import * as THREE from 'three';
import type { Genero } from '@fonema/conteudo';
import type { Cranio } from './avatarGlb.ts';

export interface ContextoPenteado {
  sexo: Genero;
  cranio: Cranio;
  olhos: { centro: THREE.Vector3; raioIris: number; raioOlho: number }[];
  /** cor do cabelo (hex sRGB) */
  cor: string;
}

/* ------------------------------------------------------------------ utilidades */

/** Sorteio repetível (o mesmo penteado sai sempre igual). */
function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const suave = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Ponto na superfície do crânio: `az` 0 = frente, π/2 = lado esquerdo do boneco (+X), π = nuca; `el` = altura (rad). */
function noCranio(c: Cranio, az: number, el: number, k = 1): THREE.Vector3 {
  const ry = el >= 0 ? c.raios.y : c.baixo;
  return new THREE.Vector3(
    c.centro.x + c.raios.x * k * Math.cos(el) * Math.sin(az),
    c.centro.y + ry * k * Math.sin(el),
    c.centro.z + c.raios.z * k * Math.cos(el) * Math.cos(az)
  );
}
/** "Raio" elipsoidal de um ponto (1 = na superfície do crânio). */
function rho(c: Cranio, p: THREE.Vector3): number {
  const ry = p.y >= c.centro.y ? c.raios.y : c.baixo;
  return Math.hypot((p.x - c.centro.x) / c.raios.x, (p.y - c.centro.y) / ry, (p.z - c.centro.z) / c.raios.z);
}
/** Empurra o ponto para fora do crânio (com folga `k`). */
function paraFora(c: Cranio, p: THREE.Vector3, k: number): THREE.Vector3 {
  const r = rho(c, p);
  if (r >= k) return p;
  return p.sub(c.centro).multiplyScalar(k / Math.max(r, 1e-4)).add(c.centro);
}

/** Textura de fios: listras claras e escuras ao longo da mecha (u = comprimento, v = volta). */
let texFios: THREE.CanvasTexture | null = null;
function fios(): THREE.CanvasTexture {
  if (texFios) return texFios;
  const L = 256, A = 64;
  const cv = document.createElement('canvas');
  cv.width = L; cv.height = A;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(L, A);
  const rnd = sorteio(7);
  const linhas = Array.from({ length: A }, () => 0.86 + 0.14 * rnd());
  for (let y = 0; y < A; y++) {
    const base = linhas[y] * 0.6 + linhas[(y + 1) % A] * 0.25 + linhas[(y + A - 1) % A] * 0.15;
    for (let x = 0; x < L; x++) {
      const v = Math.round(255 * Math.min(1, base * (0.97 + 0.03 * Math.sin(x * 0.11 + y))));
      const i = (y * L + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  texFios = new THREE.CanvasTexture(cv);
  texFios.wrapS = texFios.wrapT = THREE.RepeatWrapping;
  texFios.colorSpace = THREE.SRGBColorSpace;
  texFios.userData.compartilhada = true;
  return texFios;
}

/** Textura do crespo: miúdo, sem direção. */
let texCrespo: THREE.CanvasTexture | null = null;
function crespo(): THREE.CanvasTexture {
  if (texCrespo) return texCrespo;
  const L = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = L;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#e6e6e6'; g.fillRect(0, 0, L, L);
  const rnd = sorteio(11);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * L, y = rnd() * L, r = 1.5 + rnd() * 3.5, v = Math.round(170 + rnd() * 85);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  texCrespo = new THREE.CanvasTexture(cv);
  texCrespo.wrapS = texCrespo.wrapT = THREE.RepeatWrapping;
  texCrespo.colorSpace = THREE.SRGBColorSpace;
  texCrespo.userData.compartilhada = true;
  return texCrespo;
}

function material(cor: string, tipo: 'fios' | 'crespo', repetir = 1): THREE.MeshStandardMaterial {
  const map = (tipo === 'fios' ? fios() : crespo()).clone();
  map.userData.compartilhada = false;
  map.repeat.set(tipo === 'fios' ? 1 : repetir, tipo === 'fios' ? repetir : repetir);
  map.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(cor), map, roughness: tipo === 'fios' ? 0.55 : 0.85, metalness: 0 });
}

/**
 * Mecha: tubo achatado ao longo de `pts`, com largura `larg(t)` e espessura `esp(t)` (t de 0 na raiz a 1 na ponta).
 * O lado chato fica virado para fora da cabeça (`fora(p)` dá a direção "de fora" em cada ponto). `giro(t)` gira a
 * seção (tranças).
 */
function mecha(pts: THREE.Vector3[], larg: (t: number) => number, esp: (t: number) => number, fora: (p: THREE.Vector3) => THREE.Vector3, segs = 28, voltas = 8, giro?: (t: number) => number): THREE.BufferGeometry {
  const curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const n = segs + 1, m = voltas + 1;
  const pos = new Float32Array(n * m * 3), uv = new Float32Array(n * m * 2);
  const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const t = i / segs;
    curva.getPointAt(t, P);
    curva.getTangentAt(t, T);
    N.copy(fora(P)).addScaledVector(T, -fora(P).dot(T)).normalize();
    if (N.lengthSq() < 0.5) N.set(0, 0, 1).cross(T).normalize();
    B.crossVectors(T, N).normalize();
    const w = larg(t), h = esp(t), a0 = giro ? giro(t) : 0;
    for (let j = 0; j < m; j++) {
      const a = (j / voltas) * Math.PI * 2 + a0;
      q.copy(P).addScaledVector(N, Math.cos(a) * h).addScaledVector(B, Math.sin(a) * w);
      const k = (i * m + j) * 3;
      pos[k] = q.x; pos[k + 1] = q.y; pos[k + 2] = q.z;
      uv[(i * m + j) * 2] = t; uv[(i * m + j) * 2 + 1] = j / voltas;
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < segs; i++) for (let j = 0; j < voltas; j++) {
    const a = i * m + j, b = a + m;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Junta várias geometrias (mesmos atributos) numa só: menos chamadas de desenho. */
function juntar(gs: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let nv = 0, ni = 0;
  for (const g of gs) { nv += g.getAttribute('position').count; ni += g.index!.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const g of gs) {
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), u = g.getAttribute('uv');
    pos.set(p.array as Float32Array, ov * 3); nor.set(n.array as Float32Array, ov * 3); uv.set(u.array as Float32Array, ov * 2);
    const ix = g.index!.array;
    for (let i = 0; i < ix.length; i++) idx[oi + i] = ix[i] + ov;
    ov += p.count; oi += ix.length;
    g.dispose();
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  r.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  r.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  r.setIndex(new THREE.BufferAttribute(idx, 1));
  return r;
}

/* ------------------------------------------------------------------ caminhos das mechas */

interface Caminho { az: number; el: number; /** altura onde a ponta para (m) */ ate: number; folga?: number; onda?: number; ondas?: number; frente?: number }

/**
 * Caminho de uma mecha que nasce no crânio em (az, el), desce colada à cabeça e, depois da altura da orelha, cai reta
 * até `ate`. `onda` (m) faz o ondulado; `frente` empurra a ponta para a frente (mechas que emolduram o rosto).
 */
function caminhoCaindo(c: Cranio, k: Caminho): THREE.Vector3[] {
  const folga = k.folga ?? 1.05;
  const pts: THREE.Vector3[] = [noCranio(c, k.az, k.el, 0.96)];
  const passos = 10;
  let ultimo = pts[0];
  // pela cabeça: a elevação desce até a altura da orelha (um pouco abaixo do centro do crânio)
  const elFim = Math.min(k.el, -0.25);
  for (let i = 1; i <= passos; i++) {
    const el = k.el + (elFim - k.el) * (i / passos);
    ultimo = noCranio(c, k.az, el, folga + 0.03 * (i / passos));
    if (ultimo.y < k.ate) break;
    pts.push(ultimo);
  }
  // queda livre: reta para baixo, abrindo um pouco
  const topo = pts[pts.length - 1].clone();
  const dir = new THREE.Vector3(topo.x - c.centro.x, 0, topo.z - c.centro.z).normalize();
  const queda = topo.y - k.ate;
  if (queda > 0.01) {
    const n = Math.max(2, Math.round(queda / 0.03));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const p = topo.clone().addScaledVector(dir, 0.02 * t);
      p.y = topo.y - queda * t;
      if (k.frente) p.z += k.frente * t;
      pts.push(p);
    }
  }
  if (k.onda) {
    const ondas = k.ondas ?? 2.5;
    const lado = new THREE.Vector3(-dir.z, 0, dir.x);
    const total = pts.length - 1;
    pts.forEach((p, i) => { if (i > 1) p.addScaledVector(lado, Math.sin((i / total) * Math.PI * 2 * ondas) * k.onda! * (i / total)).addScaledVector(dir, Math.abs(Math.cos((i / total) * Math.PI * 2 * ondas)) * k.onda! * 0.6 * (i / total)); });
  }
  return pts;
}

const ponta = (raiz: number, fim = 0.15) => (t: number) => raiz * (t < 0.08 ? 0.7 + 0.3 * (t / 0.08) : 1 - (1 - fim) * Math.pow(Math.max(0, t - 0.25) / 0.75, 1.6));

/** Direção "de fora" a partir do eixo vertical da cabeça (para mechas compridas) ou do centro (curtas). */
const foraDoEixo = (c: Cranio) => (p: THREE.Vector3) => new THREE.Vector3(p.x - c.centro.x, p.y > c.centro.y ? (p.y - c.centro.y) * 0.6 : 0, p.z - c.centro.z).normalize();

/* ------------------------------------------------------------------ peças */

/** Camada de cima: mechas que saem do redemoinho / risca e cobrem o alto da cabeça, descendo até `elFim`. */
function camadaDeCima(c: Cranio, rnd: () => number, o: { n: number; elFim: number; larg: number; folga?: number; risca?: number; franja?: boolean }): THREE.BufferGeometry[] {
  const gs: THREE.BufferGeometry[] = [];
  const risca = o.risca ?? 0.25; // risca de lado (az do topo)
  for (let i = 0; i < o.n; i++) {
    const az = (i / o.n) * Math.PI * 2 + rnd() * 0.12;
    // na frente, sem franja, as mechas vão para o lado (penteado para trás da risca)
    const frente = Math.cos(az) > 0.35;
    if (frente && !o.franja) continue;
    const pts: THREE.Vector3[] = [];
    const el0 = 1.5;
    const elF = frente ? o.elFim + 0.05 : o.elFim;
    for (let s = 0; s <= 8; s++) {
      const t = s / 8;
      const el = el0 + (elF - el0) * t;
      const azT = az + risca * Math.sin(az) * (1 - t) * 0.3;
      pts.push(noCranio(c, azT, el, (o.folga ?? 1.035) + 0.01 * Math.sin(t * Math.PI)));
    }
    gs.push(mecha(pts, ponta(o.larg * (0.85 + 0.3 * rnd()), 0.45), ponta(0.013, 0.6), (p) => p.clone().sub(c.centro).normalize(), 16, 8));
  }
  return gs;
}

/** Franja: mechas da frente do alto da cabeça até a testa (acima das sobrancelhas). */
function franja(c: Cranio, olhoY: number, rnd: () => number, o: { n: number; largura: number; altura: number; larg: number }): THREE.BufferGeometry[] {
  const gs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < o.n; i++) {
    const s = o.n === 1 ? 0 : i / (o.n - 1) - 0.5;
    const az = s * o.largura + (rnd() - 0.5) * 0.06;
    const fimY = olhoY + o.altura + (rnd() - 0.5) * 0.01 - Math.abs(s) * 0.02;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      const el = 1.25 + (0.35 - 1.25) * t;
      const p = noCranio(c, az * (0.6 + 0.4 * t), el, 1.03 + 0.03 * t);
      pts.push(p);
    }
    // da linha do cabelo até a testa: desce rente e um pouco para a frente
    const ult = pts[pts.length - 1];
    for (let k = 1; k <= 4; k++) {
      const t = k / 4;
      const p = ult.clone();
      p.y = ult.y + (fimY - ult.y) * t;
      p.z += 0.012 * t;
      pts.push(paraFora(c, p, 1.04));
    }
    gs.push(mecha(pts, ponta(o.larg * (0.9 + 0.2 * rnd()), 0.4), ponta(0.012, 0.55), (p) => p.clone().sub(c.centro).setY(0).normalize(), 22, 8));
  }
  return gs;
}

function liso(c: Cranio, olhoY: number, rnd: () => number, o: { ate: number; onda?: number; nTras?: number; franja?: boolean; folga?: number; laterais?: number }): THREE.BufferGeometry[] {
  const gs: THREE.BufferGeometry[] = [];
  const n = o.nTras ?? 26;
  const lat = o.laterais ?? 1.05; // até onde as mechas vêm para a frente (rad a partir da nuca... frente = π)
  for (let i = 0; i < n; i++) {
    const az = Math.PI + (i / (n - 1) - 0.5) * 2 * (Math.PI - lat) + (rnd() - 0.5) * 0.05;
    for (const camada of [0, 1]) {
      const el = camada ? 0.9 + rnd() * 0.25 : 0.3 + rnd() * 0.3;
      const ate = o.ate + (rnd() - 0.3) * 0.025 + (Math.abs(Math.cos(az)) < 0.5 ? 0.02 : 0);
      const pts = caminhoCaindo(c, { az, el, ate, folga: (o.folga ?? 1.04) + camada * 0.025, onda: o.onda ? o.onda * (0.8 + 0.4 * rnd()) : 0, ondas: 2 + rnd() });
      gs.push(mecha(pts, ponta(0.04 + 0.01 * rnd(), 0.3), ponta(0.014, 0.45), foraDoEixo(c), 30, 8));
    }
  }
  gs.push(...camadaDeCima(c, rnd, { n: 22, elFim: 0.25, larg: 0.045, franja: false }));
  if (o.franja) gs.push(...franja(c, olhoY, rnd, { n: 9, largura: 1.5, altura: 0.075, larg: 0.024 }));
  // mechas que emolduram o rosto (na frente da orelha), quando o cabelo é comprido
  for (const lado of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const az = lado * (0.95 + 0.12 * i);
      const pts = caminhoCaindo(c, { az, el: 0.85, ate: Math.max(o.ate + 0.04, olhoY - 0.2), folga: 1.05, onda: o.onda ? o.onda * 0.7 : 0, frente: 0.0 });
      gs.push(mecha(pts, ponta(0.026, 0.2), ponta(0.011, 0.4), foraDoEixo(c), 30, 6));
    }
  }
  return gs;
}

/** Mola (cacho): hélice ao longo de um eixo, com o tubo fino. */
function mola(base: THREE.Vector3, eixo: THREE.Vector3, comp: number, raio: number, voltas: number, grossura: number, fase: number): THREE.BufferGeometry {
  const e = eixo.clone().normalize();
  const u = new THREE.Vector3(0, 1, 0).cross(e);
  if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
  u.normalize();
  const v = e.clone().cross(u).normalize();
  const pts: THREE.Vector3[] = [];
  const n = Math.max(12, Math.round(voltas * 10));
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = fase + t * voltas * Math.PI * 2, r = raio * (0.55 + 0.45 * Math.min(1, t * 4));
    pts.push(base.clone().addScaledVector(e, comp * t).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r));
  }
  return mecha(pts, ponta(grossura, 0.45), ponta(grossura * 0.85, 0.45), (p) => p.clone().sub(base).addScaledVector(e, -p.clone().sub(base).dot(e)).normalize(), n * 2, 6);
}

function cacheado(c: Cranio, olhoY: number, rnd: () => number, o: { ate: number; raio: number; n: number; topo: number }): THREE.BufferGeometry[] {
  const gs: THREE.BufferGeometry[] = [];
  // cachos do alto: "C" curtinhos cobrindo a cabeça
  for (let i = 0; i < o.topo; i++) {
    const az = rnd() * Math.PI * 2;
    const el = 0.15 + Math.acos(1 - rnd()) * 0.9;
    if (Math.cos(az) > 0.55 && el < 0.75) continue; // testa livre
    const base = noCranio(c, az, el, 1.0);
    const fora = base.clone().sub(c.centro).normalize();
    const eixo = fora.clone().multiplyScalar(0.6).add(new THREE.Vector3(0, -0.5, 0));
    gs.push(mola(base, eixo, 0.03 + 0.015 * rnd(), o.raio * (0.9 + 0.3 * rnd()), 1.1 + rnd() * 0.5, 0.0085, rnd() * 6.28));
  }
  // cachos que caem (lados e nuca)
  for (let i = 0; i < o.n; i++) {
    const az = Math.PI + (rnd() - 0.5) * 2 * (Math.PI - 1.15);
    const el = -0.1 + rnd() * 0.7;
    const base = noCranio(c, az, el, 1.02);
    const ate = o.ate + (rnd() - 0.4) * 0.04;
    const comp = Math.max(0.04, base.y - ate);
    const fora = new THREE.Vector3(base.x - c.centro.x, 0, base.z - c.centro.z).normalize();
    gs.push(mola(base.addScaledVector(fora, 0.01), new THREE.Vector3(0, -1, 0).addScaledVector(fora, 0.25), comp, o.raio * (0.9 + 0.4 * rnd()), comp / 0.045, 0.0095, rnd() * 6.28));
  }
  // franjinha de cachos na testa
  for (let i = 0; i < 7; i++) {
    const az = (i / 6 - 0.5) * 1.5;
    const base = noCranio(c, az, 0.82, 1.02);
    gs.push(mola(base, new THREE.Vector3(0, -1, 0.45), Math.max(0.03, base.y - (olhoY + 0.085)), o.raio * 0.9, 1.3, 0.0085, rnd() * 6.28));
  }
  return gs;
}

/** Volume crespo (black power, puffs): esfera deformada com relevo; o rosto fica livre. */
function volumeCrespo(c: Cranio, o: { aumento: number; altura: number; tras: number; centro?: THREE.Vector3; raio?: number; relevo?: number }): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 72, 54);
  const p = g.getAttribute('position');
  const v = new THREE.Vector3();
  const rel = o.relevo ?? 0.009;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let q: THREE.Vector3;
    if (o.centro && o.raio) {
      q = o.centro.clone().addScaledVector(v, o.raio);
    } else {
      const az = Math.atan2(v.x, v.z), el = Math.asin(Math.max(-1, Math.min(1, v.y)));
      // volume redondo em volta da cabeça (um pouco para cima e para trás); no rosto e na nuca ele encosta no crânio
      const centro = c.centro.clone().add(new THREE.Vector3(0, o.altura, -o.tras));
      const R = new THREE.Vector3(c.raios.x * (1 + o.aumento), c.raios.y * (1 + o.aumento * 0.8), c.raios.z * (1 + o.aumento * 0.85));
      const grande = centro.clone().add(v.clone().multiply(R));
      const rente = noCranio(c, az, el, 1.02);
      const face = suave(0.3, 0.62, Math.cos(az)) * (1 - suave(0.4, 0.72, el));
      const nuca = 1 - suave(-0.55, 0.15, el);
      const w = Math.max(face, nuca);
      q = grande.lerp(rente, w);
      if (face > 0) q.lerp(noCranio(c, az, el, 0.55), face * face);
    }
    // relevo miúdo (tufinhos)
    const n = Math.sin(v.x * 23 + v.y * 7) * Math.sin(v.y * 19 - v.z * 5) * Math.sin(v.z * 21 + v.x * 3);
    q.addScaledVector(v, rel * n);
    p.setXYZ(i, q.x, q.y, q.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Trança ou twist: tubo com gomos que giram. */
function tranca(pts: THREE.Vector3[], grossura: number, gomos: number, fora: (p: THREE.Vector3) => THREE.Vector3, afinar = 0.6): THREE.BufferGeometry {
  return mecha(pts, (t) => grossura * (1 - afinar * t) * (0.72 + 0.28 * Math.abs(Math.sin(t * gomos * Math.PI))), (t) => grossura * 0.8 * (1 - afinar * t) * (0.72 + 0.28 * Math.abs(Math.cos(t * gomos * Math.PI))), fora, Math.max(24, gomos * 6), 8, (t) => t * gomos * Math.PI);
}

function elastico(centro: THREE.Vector3, eixo: THREE.Vector3, raio: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.TorusGeometry(raio, raio * 0.28, 8, 24), new THREE.MeshStandardMaterial({ color: '#22407A', roughness: 0.5 }));
  m.position.copy(centro);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), eixo.clone().normalize());
  return m;
}

/* ------------------------------------------------------------------ catálogo */

type Montador = (c: Cranio, olhoY: number, rnd: () => number, cor: string) => THREE.Object3D[];

const malha = (g: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(g, mat); m.castShadow = true; return m; };

const PENTEADOS: Record<string, Montador> = {
  /** Bem curtinho / raspado: só o cabelo do modelo cortado rente. */
  raspado: () => [],
  /** Liso curto (joãozinho / curtinho com a frente para o lado). */
  'liso-curto': (c, olhoY, rnd, cor) => [malha(juntar([...camadaDeCima(c, rnd, { n: 26, elFim: -0.2, larg: 0.05, franja: false, folga: 1.025 }), ...franja(c, olhoY, rnd, { n: 6, largura: 1.1, altura: 0.12, larg: 0.034 })]), material(cor, 'fios', 1))],
  /** Liso comprido (até o meio das costas). */
  'liso-comprido': (c, olhoY, rnd, cor) => [malha(juntar(liso(c, olhoY, rnd, { ate: 0.5 })), material(cor, 'fios', 3))],
  /** Liso no ombro com franja. */
  franja: (c, olhoY, rnd, cor) => [malha(juntar(liso(c, olhoY, rnd, { ate: 0.66, franja: true })), material(cor, 'fios', 3))],
  /** Franjinha de menino (liso curto com franja reta). */
  'franja-curta': (c, olhoY, rnd, cor) => [malha(juntar([...camadaDeCima(c, rnd, { n: 26, elFim: -0.25, larg: 0.05, franja: false, folga: 1.025 }), ...franja(c, olhoY, rnd, { n: 9, largura: 1.7, altura: 0.075, larg: 0.034 })]), material(cor, 'fios', 1))],
  /** Ondulado (até o ombro / meio das costas). */
  ondulado: (c, olhoY, rnd, cor) => [malha(juntar(liso(c, olhoY, rnd, { ate: 0.56, onda: 0.022 })), material(cor, 'fios', 3))],
  /** Ondulado curto (menino): mechas até a nuca. */
  'ondulado-curto': (c, olhoY, rnd, cor) => [malha(juntar([...liso(c, olhoY, rnd, { ate: olhoY - 0.1, onda: 0.012, nTras: 22, laterais: 1.25 }), ...franja(c, olhoY, rnd, { n: 6, largura: 1.2, altura: 0.11, larg: 0.03 })]), material(cor, 'fios', 2))],
  /** Cacheado (molinhas até o ombro). */
  cacheado: (c, olhoY, rnd, cor) => [malha(juntar(cacheado(c, olhoY, rnd, { ate: 0.62, raio: 0.016, n: 70, topo: 90 })), material(cor, 'fios', 2))],
  /** Cacheado curto (menino). */
  'cacheado-curto': (c, olhoY, rnd, cor) => [malha(juntar(cacheado(c, olhoY, rnd, { ate: olhoY - 0.06, raio: 0.014, n: 30, topo: 110 })), material(cor, 'fios', 2))],
  /** Crespo: black power. */
  black: (c, _o, _r, cor) => [malha(volumeCrespo(c, { aumento: 0.55, altura: 0.05, tras: 0.02 }), material(cor, 'crespo', 6))],
  /** Crespo curtinho (black power pequeno). */
  'black-pequeno': (c, _o, _r, cor) => [malha(volumeCrespo(c, { aumento: 0.2, altura: 0.02, tras: 0.008, relevo: 0.006 }), material(cor, 'crespo', 7))],
  /** Dois puffs crespos no alto da cabeça. */
  puffs: (c, _o, _r, cor) => {
    const mat = material(cor, 'crespo', 4);
    const objs: THREE.Object3D[] = [malha(volumeCrespo(c, { aumento: 0.04, altura: 0, tras: 0, relevo: 0.004 }), mat)];
    for (const lado of [-1, 1]) {
      const centro = noCranio(c, lado * 1.25, 0.95, 1.18);
      objs.push(malha(volumeCrespo(c, { aumento: 0, altura: 0, tras: 0, centro, raio: 0.085, relevo: 0.008 }), mat));
      objs.push(elastico(noCranio(c, lado * 1.25, 0.95, 1.0), centro.clone().sub(c.centro), 0.035));
    }
    return objs;
  },
  /** Tranças (box braids) caindo até o ombro, crespo trançado. */
  trancas: (c, _o, rnd, cor) => {
    const gs: THREE.BufferGeometry[] = [];
    const fora = foraDoEixo(c);
    // tranças soltas que caem da nuca e dos lados
    for (const camada of [0, 1]) {
      const n = camada ? 16 : 22;
      for (let i = 0; i < n; i++) {
        const az = Math.PI + (i / (n - 1) - 0.5) * 2 * (Math.PI - 1.15) + (camada ? 0.08 : 0);
        const pts = caminhoCaindo(c, { az, el: camada ? 0.75 : 0.1, ate: 0.5 + rnd() * 0.06, folga: 1.05 + camada * 0.03 });
        gs.push(tranca(pts, 0.013, 14, fora, 0.3));
      }
    }
    return [malha(volumeCrespo(c, { aumento: 0.03, altura: 0, tras: 0, relevo: 0.003 }), material(cor, 'crespo', 7)), malha(juntar(gs), material(cor, 'fios', 2))];
  },
  /** Twists curtinhos (menino crespo com tranças/twists). */
  twists: (c, _o, rnd, cor) => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 120; i++) {
      const az = rnd() * Math.PI * 2;
      const el = -0.1 + Math.acos(1 - rnd()) * 1.05;
      if (Math.cos(az) > 0.45 && el < 0.72) continue;
      const base = noCranio(c, az, el, 0.99);
      const fora = base.clone().sub(c.centro).normalize();
      const dir = fora.clone().add(new THREE.Vector3(0, -0.9, 0)).normalize();
      const comp = 0.04 + 0.025 * rnd();
      const pts = [base, base.clone().addScaledVector(fora, 0.012).addScaledVector(dir, comp * 0.4), paraFora(c, base.clone().addScaledVector(fora, 0.008).addScaledVector(dir, comp), 1.03)];
      gs.push(tranca(pts, 0.015, 4, () => fora, 0.3));
    }
    return [malha(volumeCrespo(c, { aumento: 0.03, altura: 0, tras: 0, relevo: 0.003 }), material(cor, 'crespo', 7)), malha(juntar(gs), material(cor, 'fios', 1))];
  },
  /** Rabo de cavalo. */
  rabo: (c, olhoY, rnd, cor) => {
    const gs = camadaDeCima(c, rnd, { n: 28, elFim: -0.3, larg: 0.048, franja: false, folga: 1.025 });
    // as mechas do alto vão todas para a nuca, onde fica o elástico
    const no = noCranio(c, Math.PI, 0.45, 1.06);
    const fora = new THREE.Vector3(0, 0.2, -1).normalize();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const off = new THREE.Vector3(Math.cos(a) * 0.018, Math.sin(a) * 0.018, 0);
      const pts = [no.clone().add(off), no.clone().add(off).add(new THREE.Vector3(0, 0.0, -0.05)), no.clone().add(off.clone().multiplyScalar(1.6)).add(new THREE.Vector3(0, -0.08, -0.09)), no.clone().add(off.clone().multiplyScalar(1.4)).add(new THREE.Vector3(0, -0.2, -0.085)), no.clone().add(off.clone().multiplyScalar(0.6)).add(new THREE.Vector3(0.01 * (rnd() - 0.5), -0.3 - 0.03 * rnd(), -0.06))];
      gs.push(mecha(pts, ponta(0.03, 0.2), ponta(0.018, 0.35), () => new THREE.Vector3(Math.cos(a), Math.sin(a), 0), 24, 8));
    }
    gs.push(...franja(c, olhoY, rnd, { n: 5, largura: 0.9, altura: 0.11, larg: 0.03 }));
    return [malha(juntar(gs), material(cor, 'fios', 2)), elastico(no.clone().add(new THREE.Vector3(0, 0, -0.012)), fora, 0.026)];
  },
  /** Coque no alto da cabeça. */
  coque: (c, olhoY, rnd, cor) => {
    const gs = camadaDeCima(c, rnd, { n: 28, elFim: -0.3, larg: 0.048, franja: false, folga: 1.025 });
    const no = noCranio(c, Math.PI * 0.92, 1.05, 1.0);
    const eixo = no.clone().sub(c.centro).normalize();
    const meio = no.clone().addScaledVector(eixo, 0.06);
    // o coque: mechas enroladas em espiral numa bola
    for (let i = 0; i < 10; i++) {
      const pts: THREE.Vector3[] = [];
      const fase = (i / 10) * Math.PI * 2;
      for (let k = 0; k <= 14; k++) {
        const t = k / 14, a = fase + t * Math.PI * 1.6, h = (t - 0.5) * 0.07 + (i % 2 ? 0.01 : -0.01);
        const r = 0.055 * Math.sqrt(Math.max(0.05, 1 - Math.pow(h / 0.06, 2)));
        const u = new THREE.Vector3(1, 0, 0).cross(eixo).normalize(), v = eixo.clone().cross(u).normalize();
        pts.push(meio.clone().addScaledVector(eixo, h).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r));
      }
      gs.push(mecha(pts, ponta(0.03, 0.3), ponta(0.016, 0.4), (p) => p.clone().sub(meio).normalize(), 24, 6));
    }
    gs.push(...franja(c, olhoY, rnd, { n: 5, largura: 0.9, altura: 0.11, larg: 0.03 }));
    return [malha(juntar(gs), material(cor, 'fios', 2)), elastico(no.clone().addScaledVector(eixo, 0.012), eixo, 0.03)];
  },
  /** Topete (frente para cima e para trás). */
  topete: (c, _o, rnd, cor) => {
    const gs = camadaDeCima(c, rnd, { n: 26, elFim: -0.25, larg: 0.05, franja: false, folga: 1.025 });
    for (let i = 0; i < 9; i++) {
      const s = i / 8 - 0.5;
      const az = s * 1.3;
      const base = noCranio(c, az, 0.62, 0.99);
      const pts = [base, noCranio(c, az * 0.9, 0.72, 1.12), noCranio(c, az * 0.7, 0.95, 1.2 - Math.abs(s) * 0.1), noCranio(c, az * 0.5, 1.2, 1.1)];
      gs.push(mecha(pts, ponta(0.034, 0.3), ponta(0.014, 0.4), (p) => p.clone().sub(c.centro).normalize(), 20, 6));
    }
    return [malha(juntar(gs), material(cor, 'fios', 2))];
  }
};

/** Monta a peça de cabelo `id` no crânio do boneco (espaço da cena). `null` se o id não existe. */
export function criarPenteado(id: string, ctx: ContextoPenteado): THREE.Group | null {
  const montar = PENTEADOS[id];
  if (!montar) return null;
  const olhoY = ctx.olhos.length ? ctx.olhos.reduce((s, o) => s + o.centro.y, 0) / ctx.olhos.length : ctx.cranio.centro.y;
  const g = new THREE.Group();
  g.name = `penteado-${id}`;
  let semente = 0;
  for (const ch of id) semente = (semente * 31 + ch.charCodeAt(0)) >>> 0;
  for (const o of montar(ctx.cranio, olhoY, sorteio(semente), ctx.cor)) g.add(o);
  return g;
}

export const PENTEADOS_EXISTENTES = Object.keys(PENTEADOS);
