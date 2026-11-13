// FONEMA · Mundo 3D — natureza low-poly estilizada (terreno, árvores, bichos, pessoas)
import * as THREE from 'three';
import { G, M, rng, radialNoise, jitterRadial } from './util.js';

const C = (h) => new THREE.Color(h);

// ---------- Terreno de ilha (praia + falésia em camadas + gramado facetado) ----------
export function islandTerrain(m, { x, z, r, H, seed, grass, grass2, sand = '#F3DCA8', dirt = '#A5683F', dirt2 = '#C58A55', flat = false, beach = 1.15 }) {
  const f = radialNoise(seed, 1.2);
  const seg = Math.max(16, Math.round(r * 1.1));
  const g1 = C(grass), g2 = C(grass2);
  const nz = rng(seed + 7);
  const blobs = Array.from({ length: 7 }, () => [(nz() * 2 - 1) * r * 0.7, (nz() * 2 - 1) * r * 0.7, r * (0.18 + nz() * 0.25)]);
  const fcGrass = (cx, cy, cz) => {
    let k = 0; for (const [bx, bz, br] of blobs) k = Math.max(k, 1 - Math.hypot(cx - x - bx, cz - z - bz) / br);
    return g1.clone().lerp(g2, Math.min(1, k * 1.4));
  };
  // praia
  const sandG = jitterRadial(new THREE.CylinderGeometry(r * beach, r * (beach + 0.12), 2.4, seg, 1), f);
  m.add(sandG, sand, M(x, -0.9, z), { jitter: 0.04 });
  // falésia em 2 camadas (barro escuro embaixo, claro em cima)
  const lo = jitterRadial(new THREE.CylinderGeometry(r * 1.0, r * 1.03, H * 0.55, seg, 1), f);
  m.add(lo, dirt, M(x, H * 0.275 + 0.1, z), { jitter: 0.06 });
  const hi = jitterRadial(new THREE.CylinderGeometry(r * 0.985, r * 0.99, H * 0.5, seg, 1), f);
  m.add(hi, dirt2, M(x, H * 0.7, z), { jitter: 0.06 });
  // borda de grama (lábio)
  const lip = jitterRadial(new THREE.CylinderGeometry(r * 1.012, r * 0.995, 0.5, seg, 1, true), f);
  m.add(lip, grass, M(x, H - 0.2, z), { jitter: 0.05 });
  // topo facetado
  const top = new THREE.RingGeometry(0, r * 1.012, seg, Math.max(4, Math.round(r / 4.5)));
  top.rotateX(-Math.PI / 2); jitterRadial(top, f);
  const p = top.attributes.position, rr = rng(seed + 3);
  for (let i = 0; i < p.count; i++) {
    const d = Math.hypot(p.getX(i), p.getZ(i)) / r;
    if (d < 0.98) p.setY(i, flat ? (rr() * 0.08) : (rr() * 0.22 + (1 - d) * 0.35));
    else p.setY(i, 0.03);
  }
  m.add(top, grass, M(x, H, z), { jitter: 0.045, fc: fcGrass });
}

// ---------- Árvores ----------
export function treeRound(m, x, y, z, s = 1, c1 = '#5DAE57', c2 = '#4C9A4A', rnd = Math.random) {
  m.add(G.taper6, '#8A5A3B', M(x, y + 0.9 * s, z, 0, rnd() * 3, 0, 0.42 * s, 1.8 * s, 0.42 * s), { grad: 0.3 });
  const k = [[0, 2.3, 0, 2.1], [0.6, 2.0, 0.35, 1.5], [-0.55, 2.15, -0.3, 1.45], [0.1, 2.95, -0.1, 1.35]];
  k.forEach(([a, b, c, d], i) => m.add(G.ico1, i % 2 ? c2 : c1, M(x + a * s, y + b * s, z + c * s, rnd(), rnd(), 0, d * s, d * s * 0.88, d * s), { grad: 0.35, jitter: 0.06 }));
}
export function treeFruit(m, x, y, z, s, fruit, rnd) {
  treeRound(m, x, y, z, s, '#4FA350', '#3F8F45', rnd);
  for (let i = 0; i < 9; i++) {
    const a = rnd() * 6.28, h = 1.7 + rnd() * 1.3;
    const rad = 1.05 + (h > 2.6 ? -0.25 : 0.05);
    m.add(G.ico0, fruit, M(x + Math.cos(a) * rad * s, y + h * s, z + Math.sin(a) * rad * s, 0, 0, 0, 0.32 * s));
  }
}
export function treeIpe(m, x, y, z, s, color, rnd) {
  m.add(G.taper6, '#6E4A35', M(x, y + 0.8 * s, z, 0.12, 0, 0.1, 0.36 * s, 1.7 * s, 0.36 * s), { grad: 0.3 });
  m.add(G.cyl5, '#6E4A35', M(x + 0.35 * s, y + 1.9 * s, z, 0, 0, -0.6, 0.2 * s, 1.2 * s, 0.2 * s));
  m.add(G.cyl5, '#6E4A35', M(x - 0.3 * s, y + 1.9 * s, z + 0.1 * s, 0.2, 0, 0.6, 0.2 * s, 1.1 * s, 0.2 * s));
  const k = [[0, 2.6, 0, 1.9], [0.85, 2.4, 0.1, 1.4], [-0.8, 2.45, 0.2, 1.35], [0.1, 3.15, -0.3, 1.3], [0.2, 2.3, 0.8, 1.2]];
  const cc = C(color), cd = cc.clone().multiplyScalar(0.84);
  k.forEach(([a, b, c, d], i) => m.add(G.ico1, i % 2 ? cd : cc, M(x + a * s, y + b * s, z + c * s, rnd(), rnd(), 0, d * s, d * s * 0.8, d * s), { grad: 0.25, jitter: 0.07 }));
}
export function petals(m, x, y, z, s, color, rnd, n = 14) {
  for (let i = 0; i < n; i++) { const a = rnd() * 6.28, d = rnd() * 2.2 * s; m.add(G.cyl5, color, M(x + Math.cos(a) * d, y + 0.03, z + Math.sin(a) * d, 0, rnd() * 3, 0, 0.22, 0.03, 0.22), { jitter: 0.1 }); }
}
export function pine(m, x, y, z, s, c = '#3E8E5A', rnd = Math.random) {
  m.add(G.cyl5, '#7A4E36', M(x, y + 0.6 * s, z, 0, 0, 0, 0.3 * s, 1.2 * s, 0.3 * s));
  [[1.6, 2.2, 1.3], [2.5, 1.8, 1.0], [3.3, 1.3, 0.8]].forEach(([h, r, hh], i) => m.add(G.cone6, c, M(x, y + h * s, z, 0, rnd() * 3, 0, r * s * 1.1, hh * s * 1.6, r * s * 1.1), { grad: 0.3 }));
}
export function araucaria(m, x, y, z, s, rnd) {
  m.add(G.cyl5, '#7A4E36', M(x, y + 2.2 * s, z, 0, 0, 0, 0.24 * s, 4.4 * s, 0.24 * s));
  m.add(G.cyl8, '#3B7F4E', M(x, y + 4.3 * s, z, 0, rnd(), 0, 3.4 * s, 0.45 * s, 3.4 * s), { grad: 0.4 });
  m.add(G.cone8, '#468F57', M(x, y + 4.7 * s, z, 0, rnd(), 0, 3.0 * s, 0.7 * s, 3.0 * s), { grad: 0.3 });
  m.add(G.cyl8, '#3B7F4E', M(x, y + 3.5 * s, z, 0, rnd(), 0, 2.4 * s, 0.35 * s, 2.4 * s), { grad: 0.4 });
}
export function palm(m, x, y, z, s, rnd, lean = 0.25) {
  const ang = rnd() * 6.28; let px = x, py = y, pz = z;
  const dx = Math.cos(ang), dz = Math.sin(ang);
  for (let i = 0; i < 5; i++) {
    const t = i / 5, l = 0.95 * s, tilt = lean * (0.4 + t);
    const cx = px + dx * Math.sin(tilt) * l / 2, cy = py + Math.cos(tilt) * l / 2, cz = pz + dz * Math.sin(tilt) * l / 2;
    const e = new THREE.Euler(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx * Math.sin(tilt), Math.cos(tilt), dz * Math.sin(tilt)));
    const mm = new THREE.Matrix4().compose(new THREE.Vector3(cx, cy, cz), q, new THREE.Vector3(0.3 * s * (1 - t * 0.3), l * 1.05, 0.3 * s * (1 - t * 0.3)));
    m.add(G.cyl6, i % 2 ? '#9B7350' : '#8A6444', mm);
    px += dx * Math.sin(tilt) * l; py += Math.cos(tilt) * l; pz += dz * Math.sin(tilt) * l;
  }
  const leafM = (cx, cy, cz, d, wid, len, th) => {
    const w = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
    const n = new THREE.Vector3().crossVectors(w, d).normalize();
    return new THREE.Matrix4().makeBasis(w, d, n).scale(new THREE.Vector3(wid, len, th)).setPosition(cx, cy, cz);
  };
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.28 + rnd() * 0.35, ca = Math.cos(a), sa = Math.sin(a), col = i % 2 ? '#4E9F4B' : '#62B657';
    const up = 0.2 + rnd() * 0.2, dn = -0.7 - rnd() * 0.25, L1 = 1.35 * s, L2 = 1.55 * s;
    const d1 = new THREE.Vector3(ca * Math.cos(up), Math.sin(up), sa * Math.cos(up));
    const d2 = new THREE.Vector3(ca * Math.cos(dn), Math.sin(dn), sa * Math.cos(dn));
    m.add(G.box, col, leafM(px + d1.x * L1 / 2, py + d1.y * L1 / 2, pz + d1.z * L1 / 2, d1, 0.8 * s, L1, 0.06 * s), { jitter: 0.04 });
    const ex = px + d1.x * L1, ey = py + d1.y * L1, ez = pz + d1.z * L1;
    m.add(G.cone4, col, leafM(ex + d2.x * L2 / 2, ey + d2.y * L2 / 2, ez + d2.z * L2 / 2, d2, 1.1 * s, L2, 0.08 * s), { jitter: 0.04 });
  }
  for (let i = 0; i < 3; i++) m.add(G.ico0, '#7A5230', M(px + (rnd() - 0.5) * 0.4 * s, py - 0.3 * s, pz + (rnd() - 0.5) * 0.4 * s, 0, 0, 0, 0.32 * s));
}
export function banana(m, x, y, z, s, rnd) {
  m.add(G.taper6, '#8DA35A', M(x, y + 0.9 * s, z, 0, 0, 0, 0.38 * s, 1.8 * s, 0.38 * s));
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.28 + rnd() * 0.4;
    m.add(G.cone4, '#6DBB50', M(x + Math.cos(a) * 0.9 * s, y + 2.0 * s, z + Math.sin(a) * 0.9 * s, 0, -a, Math.PI / 2 - 0.5, 0.8 * s, 2.2 * s, 0.1 * s));
  }
  m.add(G.cyl6, '#E3C548', M(x + 0.3 * s, y + 1.5 * s, z, 0, 0, 0.3, 0.32 * s, 0.6 * s, 0.32 * s));
}
export function cactus(m, x, y, z, s, rnd) {
  const c = '#4E9A62', c2 = '#5FAE70';
  m.add(G.cyl8, c, M(x, y + 1.6 * s, z, 0, rnd(), 0, 0.62 * s, 3.2 * s, 0.62 * s), { grad: 0.25 });
  m.add(G.hemi, c, M(x, y + 3.2 * s, z, 0, 0, 0, 0.62 * s, 0.5 * s, 0.62 * s));
  const arms = 1 + Math.floor(rnd() * 2.5);
  for (let i = 0; i < arms; i++) {
    const a = rnd() * 6.28 + i * 2, h = (1.1 + rnd() * 0.9) * s, L = 0.75 * s;
    m.add(G.cyl8, c2, M(x + Math.cos(a) * L / 2, y + h, z + Math.sin(a) * L / 2, 0, -a, Math.PI / 2, 0.42 * s, L, 0.42 * s));
    const up = (0.9 + rnd() * 0.8) * s;
    m.add(G.cyl8, c2, M(x + Math.cos(a) * L, y + h + up / 2, z + Math.sin(a) * L, 0, 0, 0, 0.42 * s, up + 0.2 * s, 0.42 * s));
    m.add(G.hemi, c2, M(x + Math.cos(a) * L, y + h + up + 0.1 * s, z + Math.sin(a) * L, 0, 0, 0, 0.42 * s, 0.35 * s, 0.42 * s));
  }
  if (rnd() < 0.6) m.add(G.ico0, '#E86A8C', M(x, y + 3.45 * s, z, 0, 0, 0, 0.3 * s));
}
export function dryTree(m, x, y, z, s, rnd) {
  m.add(G.cyl5, '#8C7A6B', M(x, y + 0.9 * s, z, 0, 0, 0.1, 0.25 * s, 1.8 * s, 0.25 * s));
  for (let i = 0; i < 4; i++) { const a = rnd() * 6.28; m.add(G.cyl5, '#8C7A6B', M(x + Math.cos(a) * 0.4 * s, y + 2.1 * s, z + Math.sin(a) * 0.4 * s, Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7, 0.12 * s, 1.3 * s, 0.12 * s)); }
  m.add(G.ico0, '#B7B25A', M(x, y + 2.6 * s, z, 0, 0, 0, 1.6 * s, 0.7 * s, 1.6 * s), { jitter: 0.1 });
}
export function bigTree(m, x, y, z, s, rnd, c1 = '#2F8A49', c2 = '#3B9A52') {
  m.add(G.taper6, '#6B4A33', M(x, y + 2 * s, z, 0, rnd(), 0, 0.55 * s, 4 * s, 0.55 * s), { grad: 0.3 });
  [[0, 4.4, 0, 3.4], [1.1, 4.0, 0.6, 2.4], [-1.0, 4.1, -0.5, 2.4], [0.2, 5.2, 0.2, 2.2]].forEach(([a, b, c, d], i) =>
    m.add(G.ico1, i % 2 ? c2 : c1, M(x + a * s, y + b * s, z + c * s, rnd(), rnd(), 0, d * s, d * s * 0.62, d * s), { grad: 0.35, jitter: 0.07 }));
}
export function bush(m, x, y, z, s, c = '#5AA851', rnd = Math.random) {
  m.add(G.ico1, c, M(x, y + 0.35 * s, z, rnd(), rnd(), 0, 1.1 * s, 0.8 * s, 1.1 * s), { grad: 0.35, jitter: 0.07 });
}
export function rock(m, x, y, z, s, c = '#B8AC9C', rnd = Math.random) {
  m.add(G.dode, c, M(x, y + 0.2 * s, z, rnd() * 3, rnd() * 3, rnd() * 3, s * (0.9 + rnd() * 0.5), s * 0.7, s * (0.9 + rnd() * 0.4)), { grad: 0.3 });
}
export function flower(m, x, y, z, color, rnd = Math.random, s = 1) {
  m.add(G.cyl5, '#4F9A48', M(x, y + 0.18 * s, z, 0, 0, 0, 0.05 * s, 0.36 * s, 0.05 * s), { jitter: 0 });
  m.add(G.ico0, color, M(x, y + 0.4 * s, z, rnd(), rnd(), 0, 0.26 * s, 0.18 * s, 0.26 * s), { jitter: 0.08 });
}
export function tuft(m, x, y, z, s = 1, c = '#5DAA4E', rnd = Math.random) {
  for (let i = 0; i < 3; i++) m.add(G.cone3, c, M(x + (rnd() - 0.5) * 0.3, y + 0.25 * s, z + (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.4, 0.14 * s, 0.6 * s, 0.14 * s));
}

// ---------- Pessoas e bichos (simples, simpáticos) ----------
const SKINS = ['#8A5A3C', '#B97A52', '#E2B48C', '#6A4330', '#C98F66', '#F0C9A6'];
export function person(m, x, y, z, ry, rnd, o = {}) {
  const skin = o.skin || SKINS[Math.floor(rnd() * SKINS.length)];
  const shirt = o.shirt || ['#E07F62', '#1F6E82', '#F2B33D', '#6B5BA8', '#B23C62', '#2F8A6B'][Math.floor(rnd() * 6)];
  const pants = o.pants || ['#3B4F6B', '#6E5D52', '#2F5A70', '#7A4B2E'][Math.floor(rnd() * 4)];
  const hair = o.hair || ['#2A1A12', '#4A2E1E', '#1D1410', '#7A5232', '#D8D2C8'][Math.floor(rnd() * 5)];
  const s = o.s || 1;
  const L = (a, b, c, ...r) => { const v = new THREE.Vector3(a, b, c).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); return M(x + v.x * s, y + v.y * s, z + v.z * s, ...r); };
  m.add(G.cyl6, pants, L(-0.16, 0.4, 0, 0, ry, 0, 0.24 * s, 0.8 * s, 0.24 * s));
  m.add(G.cyl6, pants, L(0.16, 0.4, 0, 0, ry, 0, 0.24 * s, 0.8 * s, 0.24 * s));
  m.add(G.box, '#4A3428', L(-0.16, 0.05, 0.06, 0, ry, 0, 0.26 * s, 0.12 * s, 0.38 * s));
  m.add(G.box, '#4A3428', L(0.16, 0.05, 0.06, 0, ry, 0, 0.26 * s, 0.12 * s, 0.38 * s));
  if (o.dress) m.add(G.cone8, shirt, L(0, 1.05, 0, 0, ry, 0, 0.95 * s, 1.1 * s, 0.95 * s));
  else m.add(G.taper6, shirt, L(0, 1.15, 0, Math.PI, ry, 0, 0.62 * s, 0.85 * s, 0.5 * s));
  m.add(G.cyl6, shirt, L(-0.38, 1.18, 0, 0, ry, 0.25, 0.16 * s, 0.6 * s, 0.16 * s));
  m.add(G.cyl6, shirt, L(0.38, 1.18, 0, 0, ry, -0.25, 0.16 * s, 0.6 * s, 0.16 * s));
  m.add(G.ico0, skin, L(-0.45, 0.86, 0, 0, 0, 0, 0.16 * s));
  m.add(G.ico0, skin, L(0.45, 0.86, 0, 0, 0, 0, 0.16 * s));
  m.add(G.cyl6, skin, L(0, 1.62, 0, 0, 0, 0, 0.16 * s, 0.2 * s, 0.16 * s));
  m.add(G.ico1, skin, L(0, 1.92, 0, 0, ry, 0, 0.58 * s, 0.62 * s, 0.56 * s), { jitter: 0.02 });
  m.add(G.hemi, hair, L(0, 1.98, -0.04, -0.25, ry, 0, 0.64 * s, 0.6 * s, 0.62 * s), { jitter: 0.03 });
  if (o.curly) for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; m.add(G.ico0, hair, L(Math.cos(a) * 0.3, 2.12 + Math.sin(i) * 0.05, Math.sin(a) * 0.28 - 0.05, 0, 0, 0, 0.3 * s)); }
  if (o.hat) { m.add(G.cyl12, o.hat, L(0, 2.2, 0, 0, 0, 0, 0.95 * s, 0.06 * s, 0.95 * s)); m.add(G.cyl12, o.hat, L(0, 2.34, 0, 0, 0, 0, 0.52 * s, 0.3 * s, 0.52 * s)); }
}
export function dog(m, x, y, z, ry, c = '#D79A55') {
  const L = (a, b, cc, ...r) => { const v = new THREE.Vector3(a, b, cc).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); return M(x + v.x, y + v.y, z + v.z, ...r); };
  m.add(G.box, c, L(0, 0.55, 0, 0, ry, 0, 0.45, 0.42, 0.95));
  [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]].forEach(([a, b]) => m.add(G.cyl5, c, L(a, 0.2, b, 0, 0, 0, 0.13, 0.42, 0.13)));
  m.add(G.box, c, L(0, 0.88, 0.55, 0, ry, 0, 0.42, 0.4, 0.42));
  m.add(G.box, '#F3DDBF', L(0, 0.78, 0.8, 0, ry, 0, 0.24, 0.18, 0.2));
  m.add(G.box, '#2B1B12', L(0, 0.85, 0.9, 0, ry, 0, 0.09, 0.07, 0.05));
  m.add(G.box, '#A86A35', L(-0.2, 1.06, 0.5, 0, ry, 0.5, 0.08, 0.26, 0.16));
  m.add(G.box, '#A86A35', L(0.2, 1.06, 0.5, 0, ry, -0.5, 0.08, 0.26, 0.16));
  m.add(G.cyl5, c, L(0, 0.85, -0.55, -0.7, ry, 0, 0.08, 0.45, 0.08));
}
export function cat(m, x, y, z, ry, c = '#E3924A') {
  const L = (a, b, cc, ...r) => { const v = new THREE.Vector3(a, b, cc).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); return M(x + v.x, y + v.y, z + v.z, ...r); };
  m.add(G.ico1, c, L(0, 0.25, 0, 0, ry, 0, 0.45, 0.4, 0.7));
  m.add(G.ico1, c, L(0, 0.5, 0.32, 0, ry, 0, 0.36, 0.32, 0.32));
  m.add(G.cone3, c, L(-0.1, 0.7, 0.32, 0, ry, 0, 0.12, 0.16, 0.08));
  m.add(G.cone3, c, L(0.1, 0.7, 0.32, 0, ry, 0, 0.12, 0.16, 0.08));
  m.add(G.cyl5, c, L(0.15, 0.32, -0.42, 0.5, ry, -0.6, 0.07, 0.5, 0.07));
}
export function chicken(m, x, y, z, ry, c = '#FFF6E8') {
  const L = (a, b, cc, ...r) => { const v = new THREE.Vector3(a, b, cc).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); return M(x + v.x, y + v.y, z + v.z, ...r); };
  m.add(G.ico1, c, L(0, 0.35, 0, 0, ry, 0, 0.42, 0.4, 0.55));
  m.add(G.ico0, c, L(0, 0.62, 0.2, 0, ry, 0, 0.26));
  m.add(G.box, '#D9483A', L(0, 0.78, 0.2, 0, ry, 0, 0.05, 0.12, 0.14));
  m.add(G.cone4, '#F2B33D', L(0, 0.6, 0.36, Math.PI / 2, ry, 0, 0.08, 0.12, 0.08));
  m.add(G.cone4, c, L(0, 0.48, -0.3, -0.9, ry, 0, 0.2, 0.3, 0.12));
  m.add(G.cyl5, '#E8A33A', L(-0.07, 0.08, 0, 0, 0, 0, 0.04, 0.18, 0.04));
  m.add(G.cyl5, '#E8A33A', L(0.07, 0.08, 0, 0, 0, 0, 0.04, 0.18, 0.04));
}
export function sheep(m, x, y, z, ry, rnd) {
  m.add(G.ico1, '#FBF6EC', M(x, y + 0.6, z, rnd(), ry, 0, 1.0, 0.8, 1.3), { jitter: 0.04 });
  const v = new THREE.Vector3(0, 0, 0.7).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  m.add(G.box, '#3B2A20', M(x + v.x, y + 0.75, z + v.z, 0, ry, 0, 0.32, 0.38, 0.4));
  [[-0.25, 0.3], [0.25, 0.3], [-0.25, -0.3], [0.25, -0.3]].forEach(([a, b]) => { const w = new THREE.Vector3(a, 0, b).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); m.add(G.cyl5, '#3B2A20', M(x + w.x, y + 0.15, z + w.z, 0, 0, 0, 0.1, 0.32, 0.1)); });
}
export function tuiuiu(m, x, y, z, ry) {
  const v = (a, b, c) => new THREE.Vector3(a, b, c).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  m.add(G.ico1, '#FBF6EC', M(x, y + 1.2, z, 0, ry, 0, 0.6, 0.55, 0.9));
  let p = v(0, 1.75, 0.35); m.add(G.cyl5, '#2B1B12', M(x + p.x, y + p.y, z + p.z, 0.35, ry, 0, 0.14, 0.8, 0.14));
  p = v(0, 1.75, 0.3); m.add(G.cyl5, '#D9483A', M(x + p.x, y + 1.55, z + p.z, 0.35, ry, 0, 0.17, 0.2, 0.17));
  p = v(0, 2.15, 0.5); m.add(G.ico0, '#2B1B12', M(x + p.x, y + 2.15, z + p.z, 0, 0, 0, 0.2));
  p = v(0, 2.05, 0.85); m.add(G.cone4, '#2B1B12', M(x + p.x, y + 2.05, z + p.z, Math.PI / 2 + 0.4, ry, 0, 0.1, 0.65, 0.1));
  [-0.15, 0.15].forEach((a) => { const w = v(a, 0, 0); m.add(G.cyl5, '#2B1B12', M(x + w.x, y + 0.45, z + w.z, 0, 0, 0, 0.05, 0.9, 0.05)); });
}
export function capybara(m, x, y, z, ry) {
  const v = (a, b, c) => new THREE.Vector3(a, b, c).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  m.add(G.ico1, '#9C6B45', M(x, y + 0.45, z, 0, ry, 0, 0.7, 0.6, 1.1));
  const p = v(0, 0, 0.55); m.add(G.box, '#8A5D3B', M(x + p.x, y + 0.62, z + p.z, 0, ry, 0, 0.42, 0.42, 0.55));
}
