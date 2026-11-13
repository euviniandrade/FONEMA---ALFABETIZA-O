// FONEMA · Mundo 3D — A VILA (ilha inicial / Quintal da Sofia)
// Tudo que é estático vai para Mergers (1 malha por camada). Letreiros e placas usam
// texturas de canvas com palavras decodificáveis (PÃO, LIVRO, BOLA, CASA...).
import * as THREE from 'three';
import { G, M, F, rng } from './util.js';
import * as N from './nature.js';
import { signTexture, ICONS, calcadaTexture, emotionTexture, PAL } from './art.js';

export const VILA = { x: 0, z: 0, r: 44, H: 2.5 };
const GY = VILA.H;

export function buildVila(ctx) {
  const { m, d, f, w, thin, group, renderer, signMats } = ctx;
  const rnd = rng(42);
  const occ = []; // áreas ocupadas (x, z, raio)
  const lampTops = [];
  const occupy = (x, z, r) => occ.push([x, z, r]);
  const free = (x, z, r) => Math.hypot(x, z) < VILA.r - 3 - r && occ.every(([a, b, c]) => Math.hypot(x - a, z - b) > c + r);

  // ---------- letreiro ----------
  function sign(word, icon, mat4, bw = 3.2, bh = 1.3, accent = PAL.terracota) {
    m.add(G.box, '#8A5A3B', mat4.clone().multiply(M(0, 0, -0.02, 0, 0, 0, bw + 0.25, bh + 0.25, 0.2)));
    const t = signTexture(word, renderer, { icon: icon ? ICONS[icon] : null, accent });
    const mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.06 });
    signMats.push(mat);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat);
    p.applyMatrix4(mat4.clone().multiply(M(0, 0, 0.13)));
    p.receiveShadow = true; group.add(p);
  }
  function standingSign(word, icon, x, z, ry, accent) {
    const L = F(x, GY, z, ry);
    m.add(G.cyl6, '#7A4B2E', L(-1.3, 1.0, 0, 0, 0, 0, 0.2, 2.0, 0.2));
    m.add(G.cyl6, '#7A4B2E', L(1.3, 1.0, 0, 0, 0, 0, 0.2, 2.0, 0.2));
    sign(word, icon, L(0, 2.0, 0.12), 3.0, 1.25, accent);
    occupy(x, z, 1.8);
  }

  // ---------- janela (no referencial de uma face) ----------
  function windowAt(L, lx, ly, lz, ry, { trim = '#FFF4E2', shutter = null, ww = 1.1, wh = 1.25, box = true } = {}) {
    const S = (a, b, c, ...r) => L(lx, ly, lz, 0, ry, 0).multiply(M(a, b, c, ...r));
    m.add(G.box, trim, S(0, 0, 0.02, 0, 0, 0, ww + 0.36, wh + 0.36, 0.14));
    w.add(G.box, '#F7D38A', S(0, 0, 0.08, 0, 0, 0, ww, wh, 0.06));
    m.add(G.box, trim, S(0, 0, 0.12, 0, 0, 0, 0.08, wh, 0.05));
    m.add(G.box, trim, S(0, 0, 0.12, 0, 0, 0, ww, 0.08, 0.05));
    m.add(G.box, trim, S(0, -wh / 2 - 0.22, 0.14, 0, 0, 0, ww + 0.6, 0.14, 0.3));
    if (shutter) { m.add(G.box, shutter, S(-ww / 2 - 0.42, 0, 0.1, 0, 0, 0, 0.5, wh + 0.2, 0.08)); m.add(G.box, shutter, S(ww / 2 + 0.42, 0, 0.1, 0, 0, 0, 0.5, wh + 0.2, 0.08)); }
    if (box) {
      d.add(G.box, '#9A5B36', S(0, -wh / 2 - 0.45, 0.3, 0, 0, 0, ww + 0.2, 0.32, 0.36));
      for (let i = 0; i < 5; i++) d.add(G.ico0, ['#E8547A', '#F2B33D', '#F7F0E0', '#E8547A', '#A797D6'][i], S(-ww / 2 + 0.1 + i * (ww - 0.2) / 4, -wh / 2 - 0.22, 0.32, rnd(), rnd(), 0, 0.28));
    }
  }

  // ---------- prédio genérico ----------
  function building(o) {
    const { x, z, wdt, dep, hgt, wall, roof, trim = '#FFF4E2', door = '#1F6E82', shutter = null, roofType = 'gable', roofH = 2.3, side = true, floors = 1 } = o;
    const ry = o.ry ?? Math.atan2(-x, -z);
    const L = F(x, GY, z, ry);
    m.add(G.box, '#CDB9A0', L(0, 0.2, 0, 0, 0, 0, wdt + 0.6, 0.45, dep + 0.6));
    m.add(G.box, wall, L(0, 0.4 + hgt / 2, 0, 0, 0, 0, wdt, hgt, dep), { grad: 0.12, jitter: 0.03 });
    m.add(G.box, wall, L(0, 0.55, 0, 0, 0, 0, wdt + 0.06, 0.3, dep + 0.06), { jitter: 0 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.box, trim, L(sx * wdt / 2, 0.4 + hgt / 2, sz * dep / 2, 0, 0, 0, 0.34, hgt, 0.34));
    m.add(G.box, trim, L(0, 0.45 + hgt, 0, 0, 0, 0, wdt + 0.4, 0.32, dep + 0.4));
    const ytop = 0.6 + hgt;
    if (roofType === 'gable') {
      m.add(G.prism, roof, L(0, ytop, 0, 0, Math.PI / 2, 0, dep + 1.3, roofH, wdt + 1.4), { grad: 0.2 });
      m.add(G.box, '#8E3A22', L(0, ytop + roofH, 0, 0, 0, 0, wdt + 1.5, 0.22, 0.3));
      // oitões (paredes triangulares nas laterais)
      m.add(G.prism, wall, L(wdt / 2 - 0.02, ytop - 0.02, 0, 0, Math.PI / 2, 0, dep, roofH * 0.93, 0.05));
      m.add(G.prism, wall, L(-wdt / 2 + 0.02, ytop - 0.02, 0, 0, Math.PI / 2, 0, dep, roofH * 0.93, 0.05));
    } else if (roofType === 'front') {
      m.add(G.prism, roof, L(0, ytop, 0, 0, 0, 0, wdt + 1.3, roofH, dep + 1.4), { grad: 0.2 });
      m.add(G.prism, trim, L(0, ytop + 0.05, dep / 2 + 0.72, 0, 0, 0, wdt + 0.6, roofH * 0.82, 0.08));
    } else if (roofType === 'hip') {
      m.add(G.pyr, roof, L(0, ytop + roofH / 2, 0, 0, 0, 0, (wdt + 1.4) / 0.707, roofH, (dep + 1.4) / 0.707), { grad: 0.2 });
    }
    // porta
    m.add(G.box, trim, L(0, 0.4 + 1.3, dep / 2 + 0.04, 0, 0, 0, 1.9, 2.6, 0.14));
    m.add(G.box, door, L(0, 0.4 + 1.2, dep / 2 + 0.1, 0, 0, 0, 1.4, 2.35, 0.1));
    m.add(G.box, '#F2B33D', L(0.45, 0.4 + 1.15, dep / 2 + 0.18, 0, 0, 0, 0.12, 0.12, 0.08));
    m.add(G.box, '#CDB9A0', L(0, 0.12, dep / 2 + 0.75, 0, 0, 0, 2.4, 0.24, 1.0));
    // janelas
    const yW = 0.4 + Math.min(hgt * 0.5, 1.7);
    const fx = wdt / 2 - 1.35;
    if (wdt > 5.5) { windowAt(L, -fx, yW, dep / 2, 0, { trim, shutter }); windowAt(L, fx, yW, dep / 2, 0, { trim, shutter }); }
    if (side) { windowAt(L, wdt / 2, yW, 0, Math.PI / 2, { trim, shutter, box: false }); windowAt(L, -wdt / 2, yW, 0, -Math.PI / 2, { trim, shutter, box: false }); }
    if (floors > 1) { const y2 = 0.4 + hgt - 1.25; [-fx, 0, fx].forEach((xx) => windowAt(L, xx, y2, dep / 2, 0, { trim, shutter, box: false, wh: 1.0 })); }
    // sombra de contato
    occupy(x, z, Math.hypot(wdt, dep) / 2 + 0.6);
    return { L, ry, front: L.pt(0, 0, dep / 2 + 1.4), dep, wdt, hgt, ytop };
  }

  // ---------- caminhos ----------
  function path(a, b, wdt = 2.3) {
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
    m.add(G.box, '#E8D2A6', M((a.x + b.x) / 2, GY + 0.06, (a.z + b.z) / 2, 0, ang, 0, wdt, 0.12, len), { jitter: 0.03 });
    const n = Math.floor(len / 0.95);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      for (const side of [-0.45, 0.45]) {
        const ox = Math.cos(ang) * side * wdt * 0.7 + (rnd() - 0.5) * 0.25, oz = -Math.sin(ang) * side * wdt * 0.7 + (rnd() - 0.5) * 0.25;
        d.add(G.cyl6, ['#D8C7AE', '#CBB89C', '#E3D5BF'][i % 3], M(a.x + dx * t + ox, GY + 0.13, a.z + dz * t + oz, 0, rnd() * 3, 0, 0.55 + rnd() * 0.25, 0.1, 0.5 + rnd() * 0.2), { jitter: 0.06 });
      }
    }
  }

  // ---------- poste com luz ----------
  function lamp(x, z) {
    m.add(G.cyl8, '#3E4A52', M(x, GY + 0.15, z, 0, 0, 0, 0.5, 0.3, 0.5));
    m.add(G.cyl6, '#3E4A52', M(x, GY + 1.8, z, 0, 0, 0, 0.16, 3.4, 0.16));
    m.add(G.cone4, '#3E4A52', M(x, GY + 3.95, z, 0, Math.PI / 4, 0, 0.7, 0.35, 0.7));
    w.add(G.box, '#FFE3A0', M(x, GY + 3.6, z, 0, Math.PI / 4, 0, 0.36, 0.5, 0.36), { jitter: 0 });
    m.add(G.box, '#3E4A52', M(x, GY + 3.33, z, 0, Math.PI / 4, 0, 0.5, 0.08, 0.5));
    lampTops.push(new THREE.Vector3(x, GY + 3.6, z));
    occupy(x, z, 0.6);
  }

  // =========== PRAÇA DAS EMOÇÕES + CORETO ===========
  const PC = new THREE.Vector3(0, GY, 2);
  occupy(PC.x, PC.z, 10.2);
  const cal = new THREE.Mesh(new THREE.CircleGeometry(9.6, 48), new THREE.MeshStandardMaterial({ map: calcadaTexture(renderer), roughness: 0.95 }));
  cal.rotation.x = -Math.PI / 2; cal.position.set(PC.x, GY + 0.1, PC.z); cal.receiveShadow = true; group.add(cal);
  m.add(G.cyl24, '#C9A27C', M(PC.x, GY + 0.04, PC.z, 0, 0, 0, 20.2, 0.1, 20.2), { jitter: 0.02 });
  // coreto
  const cy = GY + 0.1;
  m.add(G.cyl8, '#F4E9D6', M(PC.x, cy + 0.45, PC.z, 0, Math.PI / 8, 0, 7.0, 0.9, 7.0));
  m.add(G.cyl8, '#A9472A', M(PC.x, cy + 0.05, PC.z, 0, Math.PI / 8, 0, 7.4, 0.2, 7.4));
  m.add(G.cyl8, '#E9DCC4', M(PC.x, cy + 0.93, PC.z, 0, Math.PI / 8, 0, 6.9, 0.08, 6.9));
  for (let i = 0; i < 3; i++) m.add(G.box, '#E9DCC4', M(PC.x, cy + 0.15 + i * 0.28, PC.z + 3.5 + (2 - i) * 0.4, 0, 0, 0, 2.2, 0.3, 0.45));
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8, px = PC.x + Math.cos(a) * 3.1, pz = PC.z + Math.sin(a) * 3.1;
    m.add(G.cyl8, '#FFFBF4', M(px, cy + 2.4, pz, 0, 0, 0, 0.26, 3.0, 0.26));
    const a2 = a + Math.PI / 8;
    const front = Math.abs(Math.sin(a2) - 1) < 0.2; // abertura da escada
    if (!front) m.add(G.box, '#FFFBF4', M(PC.x + Math.cos(a2) * 2.95, cy + 1.45, PC.z + Math.sin(a2) * 2.95, 0, -a2 + Math.PI / 2, 0, 2.3, 0.12, 0.12));
    if (!front) for (let k = -2; k <= 2; k++) m.add(G.box, '#FFFBF4', M(PC.x + Math.cos(a2) * 2.95 + Math.cos(a2 + Math.PI / 2) * k * 0.42, cy + 1.2, PC.z + Math.sin(a2) * 2.95 + Math.sin(a2 + Math.PI / 2) * k * 0.42, 0, -a2 + Math.PI / 2, 0, 0.08, 0.55, 0.08));
  }
  m.add(G.cyl8, '#FFFBF4', M(PC.x, cy + 3.95, PC.z, 0, Math.PI / 8, 0, 7.6, 0.35, 7.6));
  m.add(G.cone8, '#C2552F', M(PC.x, cy + 5.1, PC.z, 0, Math.PI / 8, 0, 8.2, 2.0, 8.2), { grad: 0.25 });
  m.add(G.cone8, '#D9693D', M(PC.x, cy + 6.3, PC.z, 0, Math.PI / 8, 0, 3.0, 1.2, 3.0));
  m.add(G.ico1, '#F2B33D', M(PC.x, cy + 7.05, PC.z, 0, 0, 0, 0.5));
  // bandeirolas de festa (do coreto aos postes)
  const flagCols = ['#F2B33D', '#B23C62', '#1F6E82', '#2F8A49', '#6B5BA8', '#E07F62', '#FFFBF4'];
  function bunting(a, b, sag = 0.9) {
    const len = a.distanceTo(b), n = Math.floor(len / 0.62);
    let prev = a.clone();
    for (let i = 1; i <= n; i++) {
      const t = i / n, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * sag;
      const mid = prev.clone().add(p).multiplyScalar(0.5), seg = p.clone().sub(prev);
      thin.add(G.box, '#6E5D52', new THREE.Matrix4().compose(mid, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), seg.clone().normalize()), new THREE.Vector3(seg.length(), 0.03, 0.03)), { jitter: 0 });
      if (i < n) {
        const ang = Math.atan2(-(b.z - a.z), b.x - a.x);
        thin.add(G.tri, flagCols[(i + Math.floor(a.x)) % flagCols.length], M(p.x, p.y, p.z, 0, ang, 0, 0.42, 0.5, 1), { jitter: 0.04 });
      }
      prev = p;
    }
  }
  // postes da praça
  const ringLamps = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8 + 0.2;
    const px = PC.x + Math.cos(a) * 10.6, pz = PC.z + Math.sin(a) * 10.6;
    lamp(px, pz); ringLamps.push(new THREE.Vector3(px, GY + 3.85, pz));
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8;
    const top = new THREE.Vector3(PC.x + Math.cos(a) * 3.6, cy + 4.05, PC.z + Math.sin(a) * 3.6);
    bunting(top, ringLamps[i], 0.75);
  }
  // placas das emoções + bancos + canteiros
  const emos = ['alegria', 'calma', 'tristeza', 'medo', 'raiva'];
  emos.forEach((e, i) => {
    const a = Math.PI * 0.5 + (i - 2) * 0.62 + Math.PI; // arco ao fundo da praça
    const px = PC.x + Math.cos(a) * 7.6, pz = PC.z + Math.sin(a) * 7.6;
    const ry = Math.atan2(PC.x - px, PC.z - pz);
    m.add(G.cyl6, '#7A4B2E', M(px, GY + 0.9, pz, 0, 0, 0, 0.16, 1.8, 0.16));
    m.add(G.cyl24, '#FFFBF4', F(px, GY + 2.15, pz, ry)(0, 0, 0, Math.PI / 2, 0, 0, 1.6, 0.14, 1.6), { jitter: 0 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), new THREE.MeshStandardMaterial({ map: emotionTexture(e, renderer), roughness: 0.8, emissive: 0xffffff, emissiveIntensity: 0.06 }));
    disc.material.emissiveMap = disc.material.map; signMats.push(disc.material);
    disc.position.set(px + Math.sin(ry) * 0.09, GY + 2.15, pz + Math.cos(ry) * 0.09); disc.rotation.y = ry; group.add(disc);
    const disc2 = disc.clone(); disc2.rotation.y = ry + Math.PI; disc2.position.set(px - Math.sin(ry) * 0.09, GY + 2.15, pz - Math.cos(ry) * 0.09); group.add(disc2);
  });
  // a placa usa cilindro "deitado": corrige orientação
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4;
    const px = PC.x + Math.cos(a) * 8.4, pz = PC.z + Math.sin(a) * 8.4, ry = Math.atan2(PC.x - px, PC.z - pz);
    const B = F(px, GY + 0.1, pz, ry);
    m.add(G.box, '#B9773F', B(0, 0.62, 0, 0, 0, 0, 2.4, 0.14, 0.7));
    m.add(G.box, '#B9773F', B(0, 1.05, -0.33, -0.15, 0, 0, 2.4, 0.5, 0.1));
    m.add(G.box, '#3E4A52', B(-1, 0.3, 0, 0, 0, 0, 0.12, 0.62, 0.62));
    m.add(G.box, '#3E4A52', B(1, 0.3, 0, 0, 0, 0, 0.12, 0.62, 0.62));
  }
  // canteiros floridos em volta da praça (meia-lua)
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.25) continue;
    const rr = 9.95 + (rnd() - 0.5) * 0.3;
    N.flower(d, PC.x + Math.cos(a) * rr, GY + 0.05, PC.z + Math.sin(a) * rr, ['#E8547A', '#F2B33D', '#FFFBF4', '#A797D6', '#F28B5B'][i % 5], rnd, 1.15);
  }

  // =========== PRÉDIOS ===========
  // BIBLIOTECA (destaque: colunas, frontão, cúpula, livros gigantes)
  const bib = building({ x: 0, z: -22, ry: 0, wdt: 13, dep: 9, hgt: 6.4, wall: '#F6E3C6', roof: '#1F6E82', trim: '#FFFBF4', door: '#B23C62', roofType: 'none', floors: 1 });
  {
    const L = bib.L; const top = bib.ytop;
    m.add(G.box, '#FFFBF4', L(0, top - 0.05, 0, 0, 0, 0, 13.8, 0.5, 9.8));
    m.add(G.box, '#E9D8BC', L(0, top + 0.45, 0, 0, 0, 0, 12.4, 0.5, 8.4));
    m.add(G.cyl12, '#FFFBF4', L(0, top + 1.0, -0.5, 0, 0, 0, 5.4, 0.7, 5.4));
    m.add(G.hemi, '#1F6E82', L(0, top + 1.3, -0.5, 0, 0, 0, 5.6, 4.4, 5.6), { grad: 0.25 });
    m.add(G.cyl8, '#FFFBF4', L(0, top + 3.6, -0.5, 0, 0, 0, 0.9, 0.5, 0.9));
    m.add(G.cone8, '#F2B33D', L(0, top + 4.2, -0.5, 0, 0, 0, 0.9, 0.8, 0.9));
    // pórtico
    const pz = bib.dep / 2 + 1.6;
    m.add(G.box, '#E9DCC4', L(0, 0.25, pz - 0.2, 0, 0, 0, 9.4, 0.5, 3.8));
    for (let i = 0; i < 3; i++) m.add(G.box, '#E9DCC4', L(0, 0.08 + i * 0.0, pz + 1.9 + i * 0.45, 0, 0, 0, 7 - i * 0.6, 0.5 - i * 0.16, 0.5));
    [-4.3, -2.5, 2.5, 4.3].forEach((xx) => { m.add(G.cyl12, '#FFFBF4', L(xx, 0.5 + 2.6, pz + 0.9, 0, 0, 0, 0.62, 5.2, 0.62)); m.add(G.box, '#FFFBF4', L(xx, 5.85, pz + 0.9, 0, 0, 0, 0.9, 0.3, 0.9)); m.add(G.box, '#FFFBF4', L(xx, 0.62, pz + 0.9, 0, 0, 0, 0.9, 0.3, 0.9)); });
    m.add(G.box, '#FFFBF4', L(0, 6.2, pz + 0.2, 0, 0, 0, 9.4, 0.5, 3.6));
    m.add(G.prism, '#1F6E82', L(0, 6.45, pz + 0.2, 0, 0, 0, 9.8, 1.9, 3.8), { grad: 0.2 });
    m.add(G.prism, '#FFFBF4', L(0, 6.5, pz + 2.12, 0, 0, 0, 8.6, 1.55, 0.08));
    sign('LIVRO', 'livro', L(0, 4.55, bib.dep / 2 + 0.12), 4.4, 1.5, PAL.mar);
    // janela redonda no frontão
    w.add(G.cyl16, '#F7D38A', L(0, 7.15, pz + 2.17, Math.PI / 2, 0, 0, 1.0, 0.06, 1.0), { jitter: 0 });
    // pilhas de livros gigantes (escultura) + cantinho de leitura
    const bookCols = ['#B23C62', '#1F6E82', '#F2B33D', '#2F8A49', '#6B5BA8', '#E07F62'];
    [[-6.8, 0.9], [6.8, 0.9]].forEach(([bx, s0], k) => {
      for (let i = 0; i < 4; i++) {
        const bwid = 2.1 - i * 0.15, ang = (rnd() - 0.5) * 0.5;
        m.add(G.box, bookCols[(i + k * 2) % 6], L(bx, 0.3 + i * 0.5, pz + 2.6, 0, ang, 0, bwid, 0.48, 1.5));
        m.add(G.box, '#FFF4E2', L(bx + 0.06, 0.3 + i * 0.5, pz + 2.6, 0, ang, 0, bwid - 0.15, 0.36, 1.53));
      }
    });
    // tapete de leitura + almofadas + crianças lendo
    m.add(G.cyl16, '#E8B04A', L(-5.2, 0.05, pz + 5.4, 0, 0, 0, 4.4, 0.06, 3.4));
    m.add(G.cyl16, '#C9553A', L(-5.2, 0.07, pz + 5.4, 0, 0, 0, 3.4, 0.06, 2.4));
    [[-6.4, 5.0, '#6B5BA8'], [-4.0, 5.9, '#2F8A6B'], [-5.5, 6.3, '#F2B33D']].forEach(([a, b, c]) => m.add(G.ico1, c, L(a, 0.32, pz + b - 0.2, 0, 0, 0, 0.9, 0.5, 0.9)));
    occupy(L.pt(-5.2, 0, pz + 5.4).x, L.pt(-5.2, 0, pz + 5.4).z, 2.4);
    const kid = (lx, lz, ry, o) => { const p = L.pt(lx, 0, pz + lz); N.person(m, p.x, GY + 0.05, p.z, ry, rnd, { s: 0.72, ...o }); };
    kid(-6.2, 5.0, 0.6, { shirt: '#F2B33D', curly: true, skin: '#6A4330' });
    kid(-4.2, 5.7, -0.7, { shirt: '#B23C62', dress: true, skin: '#E2B48C' });
    // livrinhos abertos nas mãos (placas)
    [[-5.85, 5.45], [-4.55, 6.15]].forEach(([a, b]) => { m.add(G.box, '#FFFBF4', L(a, 1.0, pz + b, -0.6, 0, 0, 0.62, 0.04, 0.42)); });
    // estante externa (mini biblioteca livre)
    const sx = 6.0, sz = pz + 5.0;
    m.add(G.box, '#8A5A3B', L(sx, 1.0, sz, 0, -0.4, 0, 1.8, 2.0, 0.7));
    m.add(G.prism, '#A9472A', L(sx, 2.0, sz, 0, -0.4, 0, 2.2, 0.7, 1.0));
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) m.add(G.box, bookCols[(i + r) % 6], L(sx - 0.62 + i * 0.25, 0.45 + r * 0.55, sz + 0.12, 0, -0.4, 0, 0.2, 0.42, 0.42));
    occupy(L.pt(sx, 0, sz).x, L.pt(sx, 0, sz).z, 1.4);
    N.person(m, L.pt(sx - 1.6, 0, sz + 0.9).x, GY, L.pt(sx - 1.6, 0, sz + 0.9).z, 2.4, rnd, { hair: '#D8D2C8', shirt: '#6B5BA8', dress: true });
  }

  // ESCOLA (sino, mastro e bandeira)
  const esc = building({ x: -21, z: -14, wdt: 11, dep: 7, hgt: 5.2, wall: '#FBEBD0', roof: '#A9472A', trim: '#1F6E82', door: '#F2B33D', shutter: '#1F6E82', roofType: 'gable', roofH: 2.6, floors: 1 });
  {
    const L = esc.L;
    m.add(G.box, '#FBEBD0', L(0, esc.ytop + 2.8, -0.3, 0, 0, 0, 1.7, 2.4, 1.7));
    m.add(G.box, '#1F6E82', L(0, esc.ytop + 3.0, -0.3, 0, 0, 0, 1.1, 1.2, 1.75));
    m.add(G.box, '#FFFBF4', L(0, esc.ytop + 4.05, -0.3, 0, 0, 0, 2.0, 0.2, 2.0));
    m.add(G.pyr, '#A9472A', L(0, esc.ytop + 4.85, -0.3, 0, 0, 0, 2.9, 1.5, 2.9));
    m.add(G.cone8, '#F2B33D', L(0, esc.ytop + 2.95, 0.55, 0, 0, 0, 0.75, 0.8, 0.75));
    sign('ESCOLA', 'escola', L(0, 4.25, esc.dep / 2 + 0.12), 4.2, 1.3, PAL.mar);
    const fp = L.pt(6.8, 0, 3.4);
    m.add(G.cyl6, '#E9DCC4', M(fp.x, GY + 3.2, fp.z, 0, 0, 0, 0.14, 6.4, 0.14));
    thin.add(G.box, '#F2B33D', M(fp.x + 0.9, GY + 5.8, fp.z, 0, esc.ry, 0, 1.8, 1.1, 0.04));
    thin.add(G.box, '#2F8A49', M(fp.x + 0.9, GY + 5.8, fp.z, 0, esc.ry, 0, 0.7, 0.5, 0.06));
    // amarelinha no chão
    for (let i = 0; i < 5; i++) { const p = L.pt(-3.2, 0, esc.dep / 2 + 2.4 + i * 0.9); m.add(G.box, ['#F2B33D', '#B23C62', '#1F6E82', '#2F8A49', '#6B5BA8'][i], M(p.x, GY + 0.08, p.z, 0, esc.ry, 0, 0.8, 0.04, 0.8), { jitter: 0 }); }
    N.person(m, L.pt(2.8, 0, esc.dep / 2 + 2.2).x, GY, L.pt(2.8, 0, esc.dep / 2 + 2.2).z, esc.ry, rnd, { shirt: '#1F6E82', hair: '#2A1A12' });
  }

  // PADARIA (toldo listrado, pães, chaminé)
  const pad = building({ x: 20, z: -14, wdt: 8, dep: 6.5, hgt: 4.2, wall: '#F4C3A8', roof: '#B5502C', trim: '#FFFBF4', door: '#7A4B2E', roofType: 'gable', roofH: 2.2 });
  let chimney;
  {
    const L = pad.L;
    for (let i = 0; i < 8; i++) m.add(G.box, i % 2 ? '#FFFBF4' : '#C9553A', L(-3.5 + i + 0.5, 3.45, pad.dep / 2 + 0.8, 0.5, 0, 0, 1.0, 0.1, 1.9), { jitter: 0.02 });
    sign('PÃO', 'pao', L(0, 4.05, pad.dep / 2 + 0.12), 3.2, 1.15);
    m.add(G.box, '#C08A5E', L(2.6, 2.6, -1.0, 0, 0, 0, 1.0, 9, 1.0));
    m.add(G.box, '#8E5A3B', L(2.6, 7.1, -1.0, 0, 0, 0, 1.25, 0.3, 1.25));
    chimney = L.pt(2.6, 7.5, -1.0);
    // vitrine/banca com pães
    const tb = (lx, lz) => {
      m.add(G.box, '#A86F3F', L(lx, 0.9, lz, 0, 0, 0, 2.2, 0.15, 1.1));
      m.add(G.box, '#7A4B2E', L(lx, 0.45, lz, 0, 0, 0, 2.0, 0.9, 0.9));
      for (let i = 0; i < 4; i++) m.add(G.ico1, '#D9934A', L(lx - 0.7 + i * 0.46, 1.1, lz + (i % 2) * 0.2 - 0.1, 0, 0.4, 0, 0.42, 0.26, 0.66));
    };
    tb(-2.6, pad.dep / 2 + 1.6); tb(2.6, pad.dep / 2 + 1.6);
    // mesinha com guarda-sol
    const tp = L.pt(-1, 0, pad.dep / 2 + 5.0);
    m.add(G.cyl12, '#FFFBF4', M(tp.x, GY + 0.95, tp.z, 0, 0, 0, 1.5, 0.1, 1.5));
    m.add(G.cyl6, '#6E5D52', M(tp.x, GY + 1.8, tp.z, 0, 0, 0, 0.1, 3.6, 0.1));
    m.add(G.cone8, '#F2B33D', M(tp.x, GY + 3.6, tp.z, 0, 0.2, 0, 3.8, 0.9, 3.8));
    m.add(G.cone8, '#C9553A', M(tp.x, GY + 3.61, tp.z, 0, 0.2 + Math.PI / 8, 0, 3.7, 0.88, 3.7));
    occupy(tp.x, tp.z, 1.8);
    N.person(m, L.pt(0.6, 0, pad.dep / 2 + 2.5).x, GY, L.pt(0.6, 0, pad.dep / 2 + 2.5).z, pad.ry, rnd, { shirt: '#FFFBF4', hat: '#FFFBF4', pants: '#6E5D52' });
    N.person(m, L.pt(-1.8, 0, pad.dep / 2 + 3.3).x, GY, L.pt(-1.8, 0, pad.dep / 2 + 3.3).z, pad.ry + Math.PI, rnd, { shirt: '#6B5BA8', dress: true, curly: true });
  }

  // CASA DA SOFIA (amarela, rede na varanda, cerca, cachorro caramelo)
  const casa = building({ x: -23, z: 11, wdt: 8.5, dep: 6.5, hgt: 4.0, wall: '#F6C453', roof: '#A9472A', trim: '#FFFBF4', door: '#1F6E82', shutter: '#1F6E82', roofType: 'gable', roofH: 2.5 });
  {
    const L = casa.L, dz = casa.dep / 2;
    // varanda
    m.add(G.box, '#B9773F', L(0, 0.3, dz + 1.5, 0, 0, 0, 8.6, 0.25, 3.0));
    [-4.1, 4.1].forEach((xx) => m.add(G.cyl6, '#FFFBF4', L(xx, 2.2, dz + 2.8, 0, 0, 0, 0.22, 3.8, 0.22)));
    m.add(G.box, '#B5502C', L(0, 4.0, dz + 1.6, 0.22, 0, 0, 9.4, 0.22, 3.6));
    m.add(G.cyl6, '#FFFBF4', L(-0.4, 2.2, dz + 2.8, 0, 0, 0, 0.22, 3.8, 0.22));
    // rede
    const a = L.pt(-3.9, 2.0, dz + 2.7), b = L.pt(-0.6, 2.0, dz + 2.7);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * 0.9;
      thin.add(G.box, ['#B23C62', '#F2B33D', '#1F6E82'][i % 3], M(p.x, p.y, p.z, 0, casa.ry, 0, 0.3, 0.06, 0.9), { jitter: 0.02 });
    }
    // cerquinha (quintal)
    const fence = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(len / 0.7), ang = Math.atan2(x1 - x0, z1 - z0);
      for (let i = 0; i <= n; i++) { const p = L.pt(x0 + (x1 - x0) * i / n, 0, z0 + (z1 - z0) * i / n); m.add(G.box, '#FFFBF4', M(p.x, GY + 0.55, p.z, 0, ang + casa.ry, 0, 0.16, 1.1, 0.12)); m.add(G.cone4, '#FFFBF4', M(p.x, GY + 1.18, p.z, 0, ang + casa.ry + Math.PI / 4, 0, 0.16, 0.2, 0.16)); }
      const pm = L.pt((x0 + x1) / 2, 0, (z0 + z1) / 2);
      m.add(G.box, '#FFFBF4', M(pm.x, GY + 0.75, pm.z, 0, ang + casa.ry, 0, 0.08, 0.12, len));
      m.add(G.box, '#FFFBF4', M(pm.x, GY + 0.35, pm.z, 0, ang + casa.ry, 0, 0.08, 0.12, len));
    };
    fence(-6, dz + 4.4, -1.4, dz + 4.4); fence(1.4, dz + 4.4, 6, dz + 4.4); fence(-6, dz + 4.4, -6, -dz - 1); fence(6, dz + 4.4, 6, -dz - 1);
    // caixa de correio
    { const sp = L.pt(-3.4, 0, dz + 5.6); standingSign('CASA', 'casa', sp.x, sp.z, casa.ry); }
    const cp = L.pt(2.0, 0, dz + 4.9);
    m.add(G.cyl6, '#7A4B2E', M(cp.x, GY + 0.6, cp.z, 0, 0, 0, 0.12, 1.2, 0.12));
    m.add(G.box, '#B23C62', M(cp.x, GY + 1.3, cp.z, 0, casa.ry, 0, 0.5, 0.4, 0.7));
    N.dog(m, L.pt(1.6, 0, dz + 2.6).x, GY + 0.35, L.pt(1.6, 0, dz + 2.6).z, casa.ry + 0.8);
    N.cat(m, L.pt(3.5, 0, dz + 0.4).x, GY + 0.5, L.pt(3.5, 0, dz + 0.4).z, casa.ry - 0.6);
    const mt = L.pt(-8.2, 0, 1.0); N.treeFruit(f, mt.x, GY, mt.z, 1.35, '#F28B2E', rnd); occupy(mt.x, mt.z, 2.6);
    const mt2 = L.pt(8.4, 0, -1.0); N.banana(f, mt2.x, GY, mt2.z, 1.3, rnd); occupy(mt2.x, mt2.z, 1.8);
    for (let i = 0; i < 14; i++) { const p = L.pt(-5.4 + rnd() * 1.4, 0, dz + 0.6 + rnd() * 3.4); N.flower(d, p.x, GY, p.z, ['#E8547A', '#F2B33D', '#FFFBF4'][i % 3], rnd, 1.1); }
    occupy(L.pt(0, 0, dz + 2.2).x, L.pt(0, 0, dz + 2.2).z, 5.5);
  }

  // HORTA (canteiros, espantalho, galinhas)
  {
    const hx = 21, hz = 15, ry = Math.atan2(-hx, -hz) ;
    const L = F(hx, GY, hz, ry);
    occupy(hx, hz, 6.8);
    for (let r = 0; r < 4; r++) {
      const z0 = -3 + r * 2.0;
      m.add(G.box, '#8A5A3B', L(0, 0.22, z0, 0, 0, 0, 8.6, 0.45, 1.5));
      m.add(G.box, '#5E3B26', L(0, 0.46, z0, 0, 0, 0, 8.3, 0.06, 1.25), { jitter: 0.08 });
      for (let i = 0; i < 9; i++) {
        const lx = -3.8 + i * 0.95;
        const kind = r % 4;
        if (kind === 0) d.add(G.ico1, '#7CC456', L(lx, 0.7, z0, rnd(), rnd(), 0, 0.7, 0.5, 0.7));
        if (kind === 1) { d.add(G.cone4, '#E8892F', L(lx, 0.55, z0, Math.PI, 0, 0, 0.22, 0.3, 0.22)); d.add(G.cone3, '#4FA35A', L(lx, 0.85, z0, 0, rnd(), 0, 0.3, 0.5, 0.3)); }
        if (kind === 2) { d.add(G.cyl5, '#8A5A3B', L(lx, 1.0, z0, 0, 0, 0, 0.06, 1.1, 0.06)); d.add(G.ico1, '#4F9A48', L(lx, 1.15, z0, 0, 0, 0, 0.55, 0.7, 0.55)); d.add(G.ico0, '#E04A3A', L(lx + 0.15, 1.0, z0 + 0.2, 0, 0, 0, 0.22)); d.add(G.ico0, '#E04A3A', L(lx - 0.18, 1.3, z0 + 0.1, 0, 0, 0, 0.2)); }
        if (kind === 3 && i % 2 === 0) { d.add(G.sph, '#F08A24', L(lx, 0.7, z0, 0, 0, 0, 0.75, 0.52, 0.75)); d.add(G.cyl5, '#5E8A3A', L(lx, 1.0, z0, 0, 0, 0, 0.06, 0.2, 0.06)); }
      }
    }
    // espantalho
    m.add(G.cyl5, '#8A5A3B', L(4.9, 1.2, -4.4, 0, 0, 0, 0.14, 2.4, 0.14));
    m.add(G.cyl5, '#8A5A3B', L(4.9, 1.9, -4.4, 0, 0, Math.PI / 2, 0.12, 1.8, 0.12));
    m.add(G.box, '#B23C62', L(4.9, 1.6, -4.4, 0, 0, 0, 0.8, 0.9, 0.4));
    m.add(G.ico1, '#F3DDBF', L(4.9, 2.45, -4.4, 0, 0, 0, 0.6));
    m.add(G.cyl12, '#E3C548', L(4.9, 2.72, -4.4, 0, 0, 0, 1.1, 0.06, 1.1)); m.add(G.cone8, '#E3C548', L(4.9, 2.9, -4.4, 0, 0, 0, 0.55, 0.4, 0.55));
    // cerca rústica
    for (const [x0, z0, x1, z1] of [[-5, -4.8, 5.4, -4.8], [-5, 4.8, 5.4, 4.8], [-5, -4.8, -5, 4.8], [5.4, -4.8, 5.4, 4.8]]) {
      const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(x1 - x0, z1 - z0), n = Math.round(len / 1.6);
      for (let i = 0; i <= n; i++) m.add(G.cyl5, '#8A5A3B', L(x0 + (x1 - x0) * i / n, 0.5, z0 + (z1 - z0) * i / n, 0, 0, 0, 0.16, 1.0, 0.16));
      m.add(G.box, '#A86F3F', L((x0 + x1) / 2, 0.75, (z0 + z1) / 2, 0, ang, 0, 0.1, 0.12, len));
    }
    const sp = L.pt(-1.2, 0, 6.6); standingSign('HORTA', 'horta', sp.x, sp.z, ry, PAL.folha);
    for (let i = 0; i < 4; i++) { const p = L.pt(-6.6 - rnd() * 1.6, 0, -2 + i * 1.3); N.chicken(m, p.x, GY, p.z, rnd() * 6); }
    const pp = L.pt(1.4, 0, 5.9); N.person(m, pp.x, GY, pp.z, ry + 2.6, rnd, { hat: '#E3C548', shirt: '#2F8A6B' });
    const wc = L.pt(-4, 0, 5.6); m.add(G.cyl8, '#1F6E82', M(wc.x, GY + 0.35, wc.z, 0, 0, 0, 0.6, 0.7, 0.6)); m.add(G.cyl5, '#1F6E82', M(wc.x + 0.45, GY + 0.6, wc.z, 0, 0, -0.8, 0.1, 0.7, 0.1));
  }

  // OFICINA DE ROBÔS (galpão, engrenagem, robozinho)
  const ofi = building({ x: 31, z: -1, wdt: 7.5, dep: 6.2, hgt: 4.0, wall: '#8FB7C2', roof: '#5F7F8C', trim: '#F2B33D', door: '#E07F62', roofType: 'none', side: true });
  let robotEye;
  {
    const L = ofi.L;
    m.add(G.halfcyl, '#E07F62', L(0, ofi.ytop - 0.05, 0, 0, 0, Math.PI / 2, 4.6, 8.4, 7.3).multiply(M(0, 0, 0, 0, 0, 0)), { grad: 0.2 });
    // engrenagem na fachada
    const gp = (a, b) => L(0, ofi.ytop + 1.0, ofi.dep / 2 + 0.6).multiply(M(a, b, 0));
    m.add(G.cyl12, '#F2B33D', L(0, ofi.ytop + 1.0, ofi.dep / 2 + 0.75, Math.PI / 2, 0, 0, 1.9, 0.3, 1.9));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; m.add(G.box, '#F2B33D', L(Math.cos(a) * 1.05, ofi.ytop + 1.0 + Math.sin(a) * 1.05, ofi.dep / 2 + 0.75, 0, 0, a, 0.45, 0.45, 0.3)); }
    m.add(G.cyl8, '#8E5A3B', L(0, ofi.ytop + 1.0, ofi.dep / 2 + 0.92, Math.PI / 2, 0, 0, 0.6, 0.1, 0.6));
    sign('ROBÔ', 'robo', L(0, 3.55, ofi.dep / 2 + 0.12), 3.0, 1.05, PAL.mar);
    // robozinho
    const rp = L.pt(2.6, 0, ofi.dep / 2 + 2.8), rr = ofi.ry - 0.5;
    const R = F(rp.x, GY, rp.z, rr);
    m.add(G.box, '#5F7F8C', R(-0.3, 0.35, 0, 0, 0, 0, 0.32, 0.7, 0.4)); m.add(G.box, '#5F7F8C', R(0.3, 0.35, 0, 0, 0, 0, 0.32, 0.7, 0.4));
    m.add(G.box, '#D9E6EA', R(0, 1.1, 0, 0, 0, 0, 1.1, 0.95, 0.8));
    m.add(G.cyl12, '#F2B33D', R(0, 1.15, 0.41, Math.PI / 2, 0, 0, 0.42, 0.04, 0.42));
    m.add(G.box, '#D9E6EA', R(0, 1.95, 0, 0, 0, 0, 0.95, 0.65, 0.75));
    w.add(G.box, '#6FE3F0', R(-0.2, 2.0, 0.38, 0, 0, 0, 0.18, 0.16, 0.04));
    w.add(G.box, '#6FE3F0', R(0.2, 2.0, 0.38, 0, 0, 0, 0.18, 0.16, 0.04));
    m.add(G.cyl5, '#5F7F8C', R(0, 2.45, 0, 0, 0, 0, 0.05, 0.4, 0.05));
    w.add(G.ico0, '#FF8A5C', R(0, 2.7, 0, 0, 0, 0, 0.2));
    m.add(G.cyl6, '#D9E6EA', R(-0.7, 1.25, 0.1, 0, 0, 0.9, 0.15, 0.8, 0.15)); m.add(G.cyl6, '#D9E6EA', R(0.72, 1.0, 0.2, 0.4, 0, -0.2, 0.15, 0.8, 0.15));
    robotEye = rp;
    occupy(rp.x, rp.z, 1.0);
    // bancada + caixotes
    m.add(G.box, '#A86F3F', L(-2.4, 0.95, ofi.dep / 2 + 1.9, 0, 0, 0, 2.4, 0.15, 1.0));
    m.add(G.box, '#7A4B2E', L(-2.4, 0.45, ofi.dep / 2 + 1.9, 0, 0, 0, 2.2, 0.9, 0.8));
    m.add(G.box, '#5F7F8C', L(-2.9, 1.2, ofi.dep / 2 + 1.9, 0, 0.4, 0, 0.5, 0.35, 0.35));
    m.add(G.torus, '#F2B33D', L(-1.9, 1.2, ofi.dep / 2 + 1.9, Math.PI / 2, 0, 0, 0.7));
    [[4.6, 1.0], [4.4, -1.3], [4.7, 1.0, 1]].forEach(([a, b, up]) => m.add(G.box, '#B9773F', L(a, up ? 1.35 : 0.45, b, 0, rnd(), 0, 0.9, 0.9, 0.9)));
    N.person(m, L.pt(-0.6, 0, ofi.dep / 2 + 3.2).x, GY, L.pt(-0.6, 0, ofi.dep / 2 + 3.2).z, ofi.ry, rnd, { shirt: '#3B4F6B', hair: '#1D1410', curly: true });
  }

  // BANCO / COFRINHO (porquinho gigante)
  const ban = building({ x: -32, z: -2, wdt: 7, dep: 6, hgt: 4.4, wall: '#CFE5D2', roof: '#2F8A6B', trim: '#FFFBF4', door: '#A9472A', roofType: 'front', roofH: 1.8 });
  {
    const L = ban.L;
    [-2.6, 2.6].forEach((xx) => m.add(G.cyl12, '#FFFBF4', L(xx, 2.6, ban.dep / 2 + 0.5, 0, 0, 0, 0.55, 4.4, 0.55)));
    sign('BANCO', 'cofre', L(0, 3.75, ban.dep / 2 + 0.12), 3.2, 1.05, '#2F8A6B');
    const pg = L.pt(4.6, 0, ban.dep / 2 + 2.2), P = F(pg.x, GY, pg.z, ban.ry - 0.9);
    m.add(G.ico1, '#E58FA4', P(0, 1.45, 0, 0, 0, 0, 2.1, 1.8, 2.6), { grad: 0.2 });
    m.add(G.cyl12, '#E07F95', P(0, 1.45, 1.35, Math.PI / 2, 0, 0, 0.75, 0.3, 0.6));
    m.add(G.box, '#7A2E3E', P(-0.15, 1.45, 1.52, 0, 0, 0, 0.1, 0.18, 0.04)); m.add(G.box, '#7A2E3E', P(0.15, 1.45, 1.52, 0, 0, 0, 0.1, 0.18, 0.04));
    m.add(G.cone4, '#E58FA4', P(-0.55, 2.4, 0.75, 0.3, 0, 0, 0.45, 0.6, 0.3)); m.add(G.cone4, '#E58FA4', P(0.55, 2.4, 0.75, 0.3, 0, 0, 0.45, 0.6, 0.3));
    m.add(G.box, '#2B1B12', P(-0.42, 1.85, 1.15, 0, 0, 0, 0.14, 0.18, 0.1)); m.add(G.box, '#2B1B12', P(0.42, 1.85, 1.15, 0, 0, 0, 0.14, 0.18, 0.1));
    [[-0.6, 0.7], [0.6, 0.7], [-0.6, -0.8], [0.6, -0.8]].forEach(([a, b]) => m.add(G.cyl8, '#D87990', P(a, 0.3, b, 0, 0, 0, 0.5, 0.6, 0.5)));
    m.add(G.box, '#7A2E3E', P(0, 2.32, -0.1, 0, 0, 0, 0.12, 0.05, 0.8));
    m.add(G.cyl16, '#F2B33D', P(0, 2.95, -0.1, Math.PI / 2, 0, 0, 0.9, 0.16, 0.9));
    m.add(G.cyl16, '#E39B1B', P(0, 2.95, -0.1, Math.PI / 2, 0, 0, 0.6, 0.18, 0.6));
    occupy(pg.x, pg.z, 2.0);
  }

  // POÇO
  {
    const px = 9.5, pz = 13.5; occupy(px, pz, 1.8);
    m.add(G.cyl12, '#C9B8A0', M(px, GY + 0.55, pz, 0, 0, 0, 2.3, 1.1, 2.3), { jitter: 0.08 });
    m.add(G.cyl12, '#B5A48A', M(px, GY + 1.12, pz, 0, 0, 0, 2.5, 0.16, 2.5));
    m.add(G.cyl12, '#2A5D78', M(px, GY + 1.0, pz, 0, 0, 0, 1.8, 0.1, 1.8), { jitter: 0 });
    [-1, 1].forEach((s) => m.add(G.box, '#7A4B2E', M(px + s * 1.05, GY + 1.9, pz, 0, 0, 0, 0.18, 2.2, 0.18)));
    m.add(G.prism, '#A9472A', M(px, GY + 2.9, pz, 0, 0, 0, 2.8, 0.9, 1.9));
    m.add(G.cyl6, '#7A4B2E', M(px, GY + 2.2, pz, 0, 0, Math.PI / 2, 0.12, 2.0, 0.12));
    m.add(G.cyl8, '#8E8478', M(px, GY + 1.55, pz, 0, 0, 0, 0.45, 0.45, 0.45));
  }

  // CAMPINHO (BOLA) — ao sul da praça
  {
    const cx = -2, cz = 25.5; occupy(cx, cz, 7.2);
    m.add(G.box, '#8ED06E', M(cx, GY + 0.06, cz, 0, 0.05, 0, 13, 0.1, 8.4), { jitter: 0.02 });
    const line = (a, b, ww, dd) => m.add(G.box, '#FFFBF4', M(cx + a, GY + 0.12, cz + b, 0, 0.05, 0, ww, 0.03, dd), { jitter: 0 });
    line(0, -3.9, 12.2, 0.12); line(0, 3.9, 12.2, 0.12); line(-6.05, 0, 0.12, 7.9); line(6.05, 0, 0.12, 7.9); line(0, 0, 0.12, 7.9);
    m.add(G.torus, '#FFFBF4', M(cx, GY + 0.12, cz, Math.PI / 2, 0, 0.05, 2.6, 2.6, 0.2), { jitter: 0 });
    [-6.2, 6.2].forEach((gx) => {
      const s = Math.sign(gx);
      m.add(G.cyl6, '#FFFBF4', M(cx + gx, GY + 0.75, cz - 1.3, 0, 0, 0, 0.14, 1.5, 0.14));
      m.add(G.cyl6, '#FFFBF4', M(cx + gx, GY + 0.75, cz + 1.3, 0, 0, 0, 0.14, 1.5, 0.14));
      m.add(G.cyl6, '#FFFBF4', M(cx + gx, GY + 1.5, cz, Math.PI / 2, 0, 0, 0.14, 2.7, 0.14));
      thin.add(G.box, '#E9E2D4', M(cx + gx + s * 0.5, GY + 0.75, cz, 0, 0, s * 0.5, 0.04, 1.6, 2.6));
    });
    m.add(G.ico1, '#FFFBF4', M(cx + 1.3, GY + 0.42, cz + 0.6, 0, 0, 0, 0.6)); m.add(G.ico0, '#2B1B12', M(cx + 1.3, GY + 0.46, cz + 0.6, 0.3, 0.4, 0, 0.45));
    N.person(m, cx + 3, GY, cz - 0.4, -1.8, rnd, { s: 0.75, shirt: '#F2B33D', curly: true, skin: '#6A4330' });
    N.person(m, cx - 0.4, GY, cz + 1.6, 1.3, rnd, { s: 0.75, shirt: '#1F6E82' });
    N.person(m, cx - 4.6, GY, cz - 0.2, 1.5, rnd, { s: 0.75, shirt: '#2F8A49', dress: true, skin: '#E2B48C' });
    standingSign('BOLA', 'bola', cx - 8.4, cz - 3.5, 0.35);
  }

  // LAGUINHO DO SAPO
  {
    const lx = -17, lz = 27; occupy(lx, lz, 4.8);
    m.add(G.cyl16, '#C9B8A0', M(lx, GY + 0.05, lz, 0, 0, 0, 8.6, 0.16, 6.6), { jitter: 0.06 });
    m.add(G.cyl16, '#4FB3C0', M(lx, GY + 0.1, lz, 0, 0.2, 0, 7.6, 0.14, 5.7), { jitter: 0.03 });
    for (let i = 0; i < 6; i++) { const a = rnd() * 6.28, rr = rnd() * 2.2; d.add(G.cyl8, '#5DAA4E', M(lx + Math.cos(a) * rr, GY + 0.19, lz + Math.sin(a) * rr * 0.7, 0, rnd() * 3, 0, 0.9, 0.04, 0.9)); }
    d.add(G.ico0, '#F7A6C1', M(lx + 1, GY + 0.3, lz - 0.5, 0, 0, 0, 0.3));
    const fx = lx - 1.2, fz = lz + 0.8;
    m.add(G.ico1, '#5DAA4E', M(fx, GY + 0.45, fz, 0, 0, 0, 0.7, 0.45, 0.6));
    m.add(G.ico0, '#5DAA4E', M(fx - 0.2, GY + 0.72, fz + 0.15, 0, 0, 0, 0.26)); m.add(G.ico0, '#5DAA4E', M(fx + 0.2, GY + 0.72, fz + 0.15, 0, 0, 0, 0.26));
    m.add(G.ico0, '#2B1B12', M(fx - 0.2, GY + 0.78, fz + 0.26, 0, 0, 0, 0.1)); m.add(G.ico0, '#2B1B12', M(fx + 0.2, GY + 0.78, fz + 0.26, 0, 0, 0, 0.1));
    standingSign('SAPO', 'sapo', lx + 4.3, lz - 4.5, 0.4, PAL.folha);
    for (let i = 0; i < 10; i++) { const a = rnd() * 6.28; N.tuft(d, lx + Math.cos(a) * 4.3, GY, lz + Math.sin(a) * 3.3, 1.2, '#4E9A48', rnd); }
  }

  // ---------- caminhos (praça -> portas) ----------
  const praçaEdge = (p) => { const v = new THREE.Vector3(p.x - PC.x, 0, p.z - PC.z).normalize(); return new THREE.Vector3(PC.x + v.x * 9.8, 0, PC.z + v.z * 9.8); };
  [bib.front, esc.front, pad.front, casa.L.pt(0, 0, casa.dep / 2 + 4.6), ofi.front, ban.front, new THREE.Vector3(18, 0, 9), new THREE.Vector3(-2, 0, 21), new THREE.Vector3(12, 0, 40)].forEach((f) => path(praçaEdge(f), f));
  path(new THREE.Vector3(-2, 0, 21.2), new THREE.Vector3(-12, 0, 23));

  // ---------- postes nos caminhos ----------
  [[-9.5, -14], [9.5, -15], [-15, 3], [16, 3.5], [6, 26], [-12, 17], [24, -5], [-27, 4]].forEach(([x, z]) => lamp(x, z));

  // ---------- cais ao sul + barquinho ----------
  {
    const a = new THREE.Vector3(12.5, 0, 40.5), b = new THREE.Vector3(15.5, 0, 56);
    const len = a.distanceTo(b), ang = Math.atan2(b.x - a.x, b.z - a.z), n = Math.floor(len / 0.55);
    for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, i / n); m.add(G.box, i % 2 ? '#B9773F' : '#A86A38', M(p.x, 1.3 - Math.min(1, i / 6) * 0.65, p.z, 0, ang, 0, 2.6, 0.18, 0.5), { jitter: 0.05 }); }
    for (let i = 0; i <= 4; i++) { const p = a.clone().lerp(b, 0.25 + i * 0.19); [-1.3, 1.3].forEach((s) => m.add(G.cyl6, '#7A4B2E', M(p.x + Math.cos(ang) * s, 0.2, p.z - Math.sin(ang) * s, 0, 0, 0, 0.3, 2.2, 0.3))); }
  }

  // ---------- natureza: frutíferas, ipês, arbustos, flores ----------
  const trees = [
    ['ipeRosa', -10.5, -6.5, 1.25], ['ipeAmarelo', 11.5, -6, 1.2], ['ipeRosa', 13, 25, 1.1],
    ['laranja', 31.5, 13, 1.1], ['manga', 30, 22, 1.3], ['caju', 14, 30, 1.0], ['banana', 29, 6, 1.1],
    ['manga', -12, -30, 1.4], ['laranja', 13, -30, 1.2], ['palm', 24, 32, 1.3], ['palm', -30, 22, 1.4], ['palm', 33, -18, 1.4],
    ['round', -36, 12, 1.3], ['round', -38, -14, 1.4], ['round', 37, 12, 1.2], ['round', -26, -27, 1.3], ['round', 27, -27, 1.3],
    ['palm', -7, 37, 1.25], ['ipeAmarelo', -36, 8, 1.1], ['banana', -16, 16, 1.0],
  ];
  for (const [k, x, z, s] of trees) {
    if (k === 'ipeRosa') { N.treeIpe(f, x, GY, z, s, '#E77FB0', rnd); N.petals(d, x, GY, z, s, '#F2A5C8', rnd); }
    else if (k === 'ipeAmarelo') { N.treeIpe(f, x, GY, z, s, '#F6C945', rnd); N.petals(d, x, GY, z, s, '#F8D86A', rnd); }
    else if (k === 'laranja') N.treeFruit(f, x, GY, z, s, '#F28B2E', rnd);
    else if (k === 'manga') N.treeFruit(f, x, GY, z, s, '#F2C14A', rnd);
    else if (k === 'caju') N.treeFruit(f, x, GY, z, s, '#E04A3A', rnd);
    else if (k === 'banana') N.banana(f, x, GY, z, s, rnd);
    else if (k === 'palm') N.palm(f, x, GY, z, s, rnd, 0.3);
    else N.treeRound(f, x, GY, z, s, '#5DAE57', '#4C9A4A', rnd);
    occupy(x, z, 1.6 * s);
  }
  // árvores extras na borda + arbustos + flores + pedras (detalhe)
  let placed = 0;
  for (let i = 0; i < 400 && placed < 22; i++) {
    const a = rnd() * 6.28, rr = VILA.r * (0.8 + rnd() * 0.13), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (z > 30 && Math.abs(x - 13) < 6) continue;
    if (Math.abs(Math.atan2(22, 62) - a) < 0.15) continue; // ponte
    if (!free(x, z, 1.8)) continue;
    const s = 0.9 + rnd() * 0.5;
    if (rnd() < 0.3) N.palm(f, x, GY, z, s, rnd, 0.35); else N.treeRound(f, x, GY, z, s, ['#5DAE57', '#68B85C', '#4FA350'][placed % 3], '#4C9A4A', rnd);
    occupy(x, z, 1.8 * s); placed++;
  }
  for (let i = 0; i < 700; i++) {
    const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * (VILA.r - 2.5), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (!free(x, z, 0.5)) continue;
    const t = rnd();
    if (t < 0.18) N.bush(d, x, GY, z, 0.7 + rnd() * 0.5, ['#5AA851', '#4E9A48', '#6CB85E'][i % 3], rnd);
    else if (t < 0.6) N.flower(d, x, GY, z, ['#E8547A', '#F2B33D', '#F28B5B', '#A797D6', '#E8547A'][i % 5], rnd, 0.9 + rnd() * 0.4);
    else if (t < 0.92) N.tuft(d, x, GY, z, 0.9 + rnd() * 0.5, '#5DAA4E', rnd);
    else N.rock(d, x, GY, z, 0.5 + rnd() * 0.5, '#C9BBA6', rnd);
  }
  // pedras na praia
  for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, rr = VILA.r * (1.04 + rnd() * 0.1); N.rock(m, Math.cos(a) * rr, 0.1, Math.sin(a) * rr, 0.8 + rnd() * 1.2, '#CDBFA8', rnd); }

  // moradores na praça
  N.person(m, 6.5, GY + 0.1, -3.2, -2.2, rnd, { shirt: '#E07F62', dress: true, hair: '#4A2E1E', curly: true });
  N.person(m, -6.8, GY + 0.1, 6.5, 2.4, rnd, { shirt: '#2F5A70', hat: '#E3C548', hair: '#D8D2C8' });
  N.person(m, -4.0, GY + 0.1, -5.5, 0.4, rnd, { s: 0.75, shirt: '#B23C62', dress: true });
  N.dog(m, 7.6, GY + 0.45, 6.3, -0.6, '#C98A4A');

  return {
    PC, chimney, robotEye, lampTops, bibFront: bib.front, bib,
    sofia: new THREE.Vector3(3.2, GY + 0.1, 10.6), bolota: new THREE.Vector3(5.0, GY + 0.1, 11.3),
    edgeToward: (tx, tz) => { const v = new THREE.Vector2(tx, tz).normalize(); return new THREE.Vector3(v.x * (VILA.r - 0.5), GY, v.y * (VILA.r - 0.5)); },
  };
}
