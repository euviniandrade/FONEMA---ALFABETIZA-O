// FONEMA · Mundo 3D v2 — natureza: árvores, flores, capim e bichinhos, com INSTANCING
// (uma draw call por tipo, centenas de cópias). Copas com vento e brilho de borda.
import * as THREE from 'three';
import { G, M, rng, canopyGeo, blobGeo, addWind, addRim, mergeGeos, Lote } from './kit.js';

const _m = new THREE.Matrix4(), _c = new THREE.Color();

/** Coletor de instâncias -> InstancedMesh com cor por instância. */
export class Instancias {
  constructor(geo, mat, { cast = true, receive = true } = {}) { this.geo = geo; this.mat = mat; this.l = []; this.cast = cast; this.receive = receive; }
  add(m, c) { this.l.push([m, c]); return this; }
  build(fator = 1) {
    const n = Math.max(1, Math.floor(this.l.length * fator));
    const im = new THREE.InstancedMesh(this.geo, this.mat, n);
    const passo = this.l.length / n;
    for (let i = 0; i < n; i++) { const [m, c] = this.l[Math.floor(i * passo)]; im.setMatrixAt(i, m); im.setColorAt(i, _c.set(c)); }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = this.cast; im.receiveShadow = this.receive; im.computeBoundingSphere();
    return im;
  }
}

export const VERDES = ['#4FA25A', '#5DB060', '#3F8F4F', '#6CBB5E', '#46985A', '#7CC266'];

/** Floresta/arvoredo: troncos e 3 formatos de copa instanciados. */
export function criarArvores(U, q) {
  const folha = addRim(addWind(new THREE.MeshStandardMaterial({ roughness: 0.82, color: '#fff' }), U, 0.022, 2.0), '#FFF0B8', 0.32, 2.4);
  const tronco = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.9 });
  const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 1, 9).translate(0, 0.5, 0);
  const copas = [0, 1, 2].map((i) => new Instancias(canopyGeo(10 + i * 3, 5 + i, 1), folha));
  const troncos = new Instancias(trunkGeo, tronco);
  const r = rng(77);
  return {
    folha,
    /** árvore redonda: x,z, altura do chão y, escala s, cor da copa */
    add(x, y, z, s = 1, cor) {
      const k = Math.floor(r() * 3), h = 2.2 * s, cs = 3.6 * s * (0.85 + r() * 0.3);
      troncos.add(M(x, y - 0.2, z, (r() - 0.5) * 0.12, r() * 6, (r() - 0.5) * 0.12, s * 0.9, h + 0.6, s * 0.9), '#8A5A3A');
      copas[k].add(M(x, y + h + cs * 0.32, z, 0, r() * 6, 0, cs, cs * (0.8 + r() * 0.2), cs), cor || VERDES[Math.floor(r() * VERDES.length)]);
    },
    build(grupo, fator = 1) { [troncos, ...copas].forEach((c) => { if (c.l.length) grupo.add(c.build(fator)); }); },
  };
}

/** Ipê-amarelo: tronco torto (tubo) e copa de flores amarelas + pétalas no chão. Volta Lotes. */
export function ipe(ctx, x, y, z, s = 1, seed = 1, cor = '#F5C033', cor2 = '#F9D864') {
  const r = rng(seed), { C, Fo } = ctx;
  const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 1.5, 0.1), new THREE.Vector3(-0.2, 3.0, 0.3), new THREE.Vector3(0.25, 4.3, -0.1)].map((p) => p.multiplyScalar(s));
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.TubeGeometry(curve, 16, 0.32 * s, 9, false);
  const tp = tube.attributes.position;
  for (let i = 0; i < tp.count; i++) { const yy = tp.getY(i) / (4.3 * s); const k = 1.25 - yy * 0.55; const c = curve.getPointAt(Math.min(1, Math.max(0, yy))); tp.setX(i, c.x + (tp.getX(i) - c.x) * k); tp.setZ(i, c.z + (tp.getZ(i) - c.z) * k); }
  tube.computeVertexNormals();
  C.add(tube, '#7C5236', M(x, y - 0.1, z));
  // galhos
  for (let i = 0; i < 4; i++) { const a = i * 1.6 + r(); C.add(G.cylTaper, '#7C5236', M(x + Math.cos(a) * 0.9 * s, y + 4.2 * s, z + Math.sin(a) * 0.9 * s, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9, 0.22 * s, 2.0 * s, 0.22 * s)); }
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + r(), rr = i ? 1.9 * s : 0;
    const sc = (i ? 2.6 : 3.4) * s * (0.85 + r() * 0.3);
    Fo.add(blobGeo(seed * 5 + i, 3, 0.28), i % 3 === 0 ? cor2 : cor, M(x + Math.cos(a) * rr, y + 5.6 * s + (i ? -0.3 + r() * 0.9 : 0.6), z + Math.sin(a) * rr, 0, r() * 6, 0, sc, sc * 0.82, sc), { grad: 0.35 });
  }
  // flores caídas
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 4.2 * s; ctx.petalas.push({ m: M(x + Math.cos(a) * d, y + 0.04, z + Math.sin(a) * d, 0, r() * 6, 0, 0.16 + r() * 0.1), c: r() < 0.5 ? cor : cor2 }); }
}

/** Coqueiro: tronco curvo em anéis + folhas arqueadas (geometria de fita). */
export function coqueiro(ctx, x, y, z, s = 1, seed = 1) {
  const r = rng(seed), { C, Fo } = ctx;
  const lean = r() * Math.PI * 2, bend = 1.4 + r() * 1.2;
  const top = new THREE.Vector3(Math.cos(lean) * bend * s, 7.5 * s, Math.sin(lean) * bend * s);
  for (let i = 0; i < 14; i++) {
    const t = i / 13, px = top.x * t * t, pz = top.z * t * t, py = top.y * t;
    C.add(G.cyl10, i % 2 ? '#9C7552' : '#B08660', M(x + px, y + py, z + pz, Math.sin(lean) * t * 0.35, 0, -Math.cos(lean) * t * 0.35, (0.55 - t * 0.18) * s, 0.62 * s, (0.55 - t * 0.18) * s), { jit: 0.04 });
  }
  for (let i = 0; i < 3; i++) C.add(G.sph, '#7A5A2E', M(x + top.x + Math.cos(i * 2.1) * 0.35 * s, y + top.y - 0.4 * s, z + top.z + Math.sin(i * 2.1) * 0.35 * s, 0, 0, 0, 0.55 * s));
  for (let i = 0; i < 9; i++) Fo.add(folhaPalmeira(), i % 2 ? '#5DAA4E' : '#4C9A45', M(x + top.x, y + top.y, z + top.z, 0, i / 9 * Math.PI * 2 + r() * 0.3, 0, s * (0.9 + r() * 0.25)), { grad: 0.3 });
}
let _folhaP = null;
function folhaPalmeira() {
  if (_folhaP) return _folhaP;
  // fita arqueada com folíolos (borda serrilhada em zigue-zague), 4,6 m
  const pos = [], idx = [], N = 18;
  for (let i = 0; i <= N; i++) {
    const t = i / N, L = 4.6 * t, y = Math.sin(t * Math.PI * 0.85) * 1.1 - t * t * 2.0, w = Math.sin(t * Math.PI) * 0.75 * (i % 2 ? 1.0 : 0.7);
    pos.push(L, y, 0, L + 0.15, y - 0.25, w, L + 0.15, y - 0.25, -w);
    if (i < N) { const a = i * 3, b = a + 3; idx.push(a, b, a + 1, a + 1, b, b + 1, a, a + 2, b, a + 2, b + 2, b); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  // duas faces (espessura mínima) para sombrear dos dois lados
  const g2 = g.clone(); g2.translate(0, -0.05, 0); const ix = g2.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = t; }
  _folhaP = mergeGeos([g, g2]); _folhaP.computeVertexNormals();
  return _folhaP;
}

/** Bananeira: pseudo-caule e folhas largas. */
export function bananeira(ctx, x, y, z, s = 1, seed = 1) {
  const r = rng(seed), { C, Fo } = ctx;
  C.add(G.cylTaper, '#8DA454', M(x, y + 1.3 * s, z, 0, 0, 0, 0.55 * s, 2.6 * s, 0.55 * s));
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + r();
    Fo.add(blobGeo(seed + i, 2, 0.1), i % 2 ? '#79B84F' : '#6AAA48', M(x + Math.cos(a) * 1.3 * s, y + 3.0 * s, z + Math.sin(a) * 1.3 * s, 0, -a, 0.7, 2.6 * s, 0.12 * s, 0.9 * s));
  }
}

/** Pássaros (bando que circula) e borboletas (batem as asas perto das flores). */
export function criarBichinhos(grupo, { passaros = 9, borboletas = 14, centros = [], seed = 3 } = {}) {
  const r = rng(seed), out = [];
  const matB = new THREE.MeshStandardMaterial({ color: '#3B3F55', roughness: 0.7, side: THREE.DoubleSide });
  const asa = new THREE.BufferGeometry(); asa.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.18, 0, 0, 0.18, 0.9, 0.05, 0.05], 3)); asa.computeVertexNormals();
  for (let i = 0; i < passaros; i++) {
    const g = new THREE.Group(), corpo = new THREE.Mesh(G.sphLo, matB); corpo.scale.set(0.5, 0.28, 0.28); g.add(corpo);
    const a1 = new THREE.Mesh(asa, matB), a2 = new THREE.Mesh(asa, matB); a2.scale.x = -1; g.add(a1, a2);
    g.userData = { tipo: 'p', a1, a2, R: 30 + r() * 40, h: 22 + r() * 14, v: 0.12 + r() * 0.06, f: r() * 6, cx: (r() - 0.5) * 30, cz: (r() - 0.5) * 30 };
    g.scale.setScalar(1.3); grupo.add(g); out.push(g);
  }
  const coresB = ['#F4C430', '#FFFFFF', '#6FA8DC', '#F4C430', '#F59E4C'];
  const asaB = new THREE.CircleGeometry(0.22, 12).translate(0.2, 0, 0).rotateX(-Math.PI / 2);
  for (let i = 0; i < borboletas; i++) {
    const c = centros[i % Math.max(1, centros.length)] || new THREE.Vector3();
    const mat = new THREE.MeshStandardMaterial({ color: coresB[i % coresB.length], roughness: 0.6, side: THREE.DoubleSide, emissive: coresB[i % coresB.length], emissiveIntensity: 0.15 });
    const g = new THREE.Group(), a1 = new THREE.Mesh(asaB, mat), a2 = new THREE.Mesh(asaB, mat); a2.scale.x = -1;
    const corpo = new THREE.Mesh(G.sphLo, matB); corpo.scale.set(0.06, 0.06, 0.3);
    g.add(a1, a2, corpo); g.userData = { tipo: 'b', a1, a2, c: c.clone(), f: r() * 10, R: 1.5 + r() * 3, v: 0.4 + r() * 0.5 };
    g.scale.setScalar(1.3); grupo.add(g); out.push(g);
  }
  return {
    tick(t) {
      for (const g of out) {
        const u = g.userData;
        if (u.tipo === 'p') {
          const a = t * u.v + u.f;
          g.position.set(u.cx + Math.cos(a) * u.R, u.h + Math.sin(t * 0.7 + u.f) * 2, u.cz + Math.sin(a) * u.R);
          g.rotation.y = -a; const fl = Math.sin(t * 9 + u.f) * 0.7; u.a1.rotation.z = fl; u.a2.rotation.z = -fl;
        } else {
          const a = t * u.v + u.f;
          g.position.set(u.c.x + Math.cos(a) * u.R + Math.sin(a * 2.3) * 0.6, u.c.y + 1.0 + Math.sin(a * 3.1) * 0.5 + 0.4, u.c.z + Math.sin(a * 1.3) * u.R);
          g.rotation.y = -a * 1.3; const fl = Math.sin(t * 16 + u.f) * 1.1; u.a1.rotation.z = fl; u.a2.rotation.z = -fl;
        }
      }
    },
  };
}
