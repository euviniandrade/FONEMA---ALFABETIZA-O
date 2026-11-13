// FONEMA · Mundo 3D v2 — prédios e mobiliário da Vila das Letras (procedural, "de brinquedo").
// Regra de arte (D009): 2–3 cores por objeto + telha/madeira naturais. Sem arco-íris.
import * as THREE from 'three';
import { rbox, G, F, M, roofGeo, hipRoof, rng } from './kit.js';

export const P = {
  telha: '#D2693F', telhaEsc: '#B4502E', creme: '#FFF4DE', branco: '#FCF8F0', marinho: '#2E4374', azulClaro: '#8EC5E8',
  ipe: '#F2B33D', verdeMata: '#3E8E4E', verdeEsc: '#2F6E3E', madeira: '#9A6640', madeiraClara: '#C9965F', madeiraEsc: '#6E4528',
  pedra: '#D9CEBD', pedraEsc: '#B9AC98', vidro: '#4E6F96', terracota: '#C8643B', lilas: '#8F7FC8', ferro: '#3B3F4A',
};
// paredes das casas coloniais (uma cor por casa) e a cor de detalhe que combina
export const CASAS = [
  { parede: '#F6CD62', det: P.marinho }, { parede: '#9FD0EA', det: P.branco, jan: P.marinho }, { parede: '#F2A884', det: P.verdeMata },
  { parede: '#BFE2A5', det: P.marinho }, { parede: '#FFF1D6', det: P.verdeMata }, { parede: '#EDB9C8', det: P.marinho },
  { parede: '#F7DE9A', det: P.terracota }, { parede: '#B9D7F0', det: P.terracota },
];

/** Janela colonial: moldura branca, vidro (lote de janelas, acende ao entardecer), venezianas coloridas e peitoril. */
export function janela(ctx, L, x, y, z, { w = 1.0, h = 1.35, cor = P.marinho, moldura = P.branco, venez = true, arco = false } = {}) {
  const { C, J } = ctx;
  C.add(rbox(w + 0.3, h + 0.3, 0.16, 0.06), moldura, L(x, y, z + 0.02));
  J.add(rbox(w, h, 0.1, 0.03), P.vidro, L(x, y, z + 0.06));
  C.add(rbox(0.06, h, 0.06, 0.02), moldura, L(x, y, z + 0.13));
  C.add(rbox(w, 0.06, 0.06, 0.02), moldura, L(x, y + h * 0.12, z + 0.13));
  C.add(rbox(w + 0.5, 0.14, 0.32, 0.05), moldura, L(x, y - h / 2 - 0.16, z + 0.12));
  if (arco) C.add(G.cyl, moldura, L(x, y + h / 2 + 0.05, z + 0.02, Math.PI / 2, 0, 0, w + 0.3, 0.16, 0.5 * (w + 0.3)), { jit: 0 });
  if (venez) for (const s of [-1, 1]) {
    C.add(rbox(w * 0.55, h + 0.1, 0.1, 0.04), cor, L(x + s * (w / 2 + 0.38), y, z + 0.08, 0, s * 0.35, 0));
    for (let k = -2; k <= 2; k++) C.add(rbox(w * 0.45, 0.04, 0.04, 0.015), cor, L(x + s * (w / 2 + 0.38), y + k * h * 0.17, z + 0.15, 0, s * 0.35, 0), { jit: 0.08 });
  }
}
export function porta(ctx, L, x, y0, z, { w = 1.3, h = 2.3, cor = P.madeira, moldura = P.branco } = {}) {
  const { C, J } = ctx;
  C.add(rbox(w + 0.36, h + 0.2, 0.18, 0.06), moldura, L(x, y0 + h / 2 + 0.05, z + 0.02));
  C.add(G.cyl, moldura, L(x, y0 + h + 0.1, z + 0.02, Math.PI / 2, 0, 0, w + 0.36, 0.18, (w + 0.36) * 0.5));
  C.add(rbox(w, h, 0.14, 0.05), cor, L(x, y0 + h / 2, z + 0.06), { grad: 0.25 });
  J.add(G.cyl, P.vidro, L(x, y0 + h - 0.02, z + 0.1, Math.PI / 2, 0, 0, w * 0.8, 0.06, w * 0.4));
  for (const s of [-1, 1]) C.add(rbox(w * 0.36, h * 0.34, 0.06, 0.03), cor, L(x + s * w * 0.22, y0 + h * 0.3, z + 0.13), { jit: 0.1 });
  C.add(G.sph, P.ipe, L(x + w * 0.36, y0 + h * 0.48, z + 0.2, 0, 0, 0, 0.11));
  C.add(rbox(w + 0.8, 0.18, 0.9, 0.06), P.pedra, L(x, y0 + 0.09, z + 0.45));
}

/** Casa colonial térrea ou sobrado, frente = +z local. */
export function casa(ctx, x, z, ry, o = {}) {
  const r = rng(o.seed || 1);
  const { parede, det, jan } = o.cores || CASAS[0];
  const w = o.w || 6.4, d = o.d || 5.6, h = o.h || 3.6, and = o.andares || 1, H = h * and;
  const L = F(x, 0, z, ry);
  const { C } = ctx;
  // embasamento (barrado) e corpo
  C.add(rbox(w + 0.3, 0.7, d + 0.3, 0.12), det === P.branco ? P.marinho : det, L(0, 0.3, 0), { grad: 0.3 });
  C.add(rbox(w, H, d, 0.14), parede, L(0, H / 2 + 0.25, 0), { grad: 0.18 });
  // cunhais (pilastras de canto) e cimalha
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) C.add(rbox(0.42, H + 0.1, 0.42, 0.08), P.branco, L(sx * w / 2, H / 2 + 0.3, sz * d / 2));
  C.add(rbox(w + 0.5, 0.32, d + 0.5, 0.1), P.branco, L(0, H + 0.36, 0));
  if (and > 1) C.add(rbox(w + 0.2, 0.18, d + 0.2, 0.06), P.branco, L(0, h + 0.3, 0));
  // telhado
  const rh = o.rh || 2.0;
  const roof = o.quatroAguas ? hipRoof(w, rh, d, 0.45) : roofGeo(d + 0.2, rh, w + 0.2, 0.45);
  C.add(roof, r() < 0.5 ? P.telha : P.telhaEsc, L(0, H + 0.5, 0, 0, o.quatroAguas ? 0 : Math.PI / 2, 0), { grad: 0.22, jit: 0.05 });
  if (!o.quatroAguas) for (const s of [-1, 1]) C.add(rbox(0.25, rh * 0.2, d + 1.1, 0.08), P.branco, L(s * (w / 2 + 0.05), H + 0.5, 0, 0, 0, 0)); // empena
  // chaminé
  if (o.chamine) { C.add(rbox(0.8, 1.8, 0.8, 0.1), P.creme, L(w * 0.28, H + 1.6, -d * 0.15)); C.add(rbox(1.0, 0.2, 1.0, 0.06), P.telhaEsc, L(w * 0.28, H + 2.5, -d * 0.15)); }
  // porta e janelas na frente
  const px = o.portaX ?? (r() < 0.5 ? -w * 0.22 : w * 0.22);
  porta(ctx, L, px, 0.6, d / 2, { cor: o.portaCor || (r() < 0.5 ? P.madeira : det === P.branco ? P.marinho : det) });
  const nj = Math.max(1, Math.round((w - 2) / 2.6));
  for (let i = 0; i < nj; i++) {
    const jx = -w / 2 + (i + 0.5) * w / nj;
    if (Math.abs(jx - px) < 1.4 && and === 1) continue;
    janela(ctx, L, jx, 2.35, d / 2, { cor: jan || det });
  }
  for (let a = 1; a < and; a++) for (let i = 0; i < nj; i++) janela(ctx, L, -w / 2 + (i + 0.5) * w / nj, 2.35 + h * a, d / 2, { cor: jan || det, arco: true });
  // janelas laterais
  for (const s of [-1, 1]) janela(ctx, F(x, 0, z, ry + s * Math.PI / 2), 0, 2.35, w / 2, { cor: jan || det });
  // floreira e vasos
  if (o.vasos !== false) for (const s of [-1, 1]) {
    const vx = px + s * 1.25;
    C.add(G.cylTaper, P.terracota, L(vx, 0.95, d / 2 + 0.55, Math.PI, 0, 0, 0.5, 0.55, 0.5));
    ctx.arbustos.push({ m: L(vx, 1.35, d / 2 + 0.55, 0, r() * 6, 0, 0.75, 0.6, 0.75), c: '#4E9A50' });
    for (let k = 0; k < 5; k++) ctx.flores.push({ m: L(vx + (r() - 0.5) * 0.5, 1.55 + r() * 0.15, d / 2 + 0.55 + (r() - 0.5) * 0.5, 0, 0, 0, 0.14), c: [P.ipe, '#FFFFFF', '#E86A5C'][k % 3] });
  }
  return { L, w, d, H };
}

/** Poste colonial curvado com lanterna (lote de luzes acende ao entardecer). */
export function poste(ctx, x, z, ry = 0) {
  const L = F(x, 0, z, ry), { C, Lz } = ctx;
  C.add(G.cyl, P.ferro, L(0, 0.25, 0, 0, 0, 0, 0.5, 0.5, 0.5));
  C.add(G.cyl10, P.ferro, L(0, 2.0, 0, 0, 0, 0, 0.16, 3.6, 0.16));
  C.add(G.torus, P.ferro, L(0.38, 3.85, 0, 0, 0, 0, 0.8, 0.8, 0.8));
  C.add(G.cone8, P.ferro, L(0.75, 3.95, 0, 0, 0, 0, 0.62, 0.32, 0.62));
  Lz.add(G.sph, '#FFE7B0', L(0.75, 3.55, 0, 0, 0, 0, 0.42, 0.55, 0.42));
  C.add(G.cyl10, P.ferro, L(0.75, 3.22, 0, 0, 0, 0, 0.3, 0.1, 0.3));
  return L.pt(0.75, 3.55, 0);
}
export function banco(ctx, x, z, ry = 0) {
  const L = F(x, 0, z, ry), { C } = ctx;
  for (let i = 0; i < 4; i++) C.add(rbox(2.2, 0.1, 0.16, 0.04), P.madeiraClara, L(0, 0.55, -0.22 + i * 0.15), { jit: 0.06 });
  for (let i = 0; i < 3; i++) C.add(rbox(2.2, 0.14, 0.08, 0.04), P.madeiraClara, L(0, 0.8 + i * 0.18, -0.36, -0.2, 0, 0), { jit: 0.06 });
  for (const s of [-1, 1]) { C.add(rbox(0.12, 0.6, 0.6, 0.04), P.ferro, L(s * 0.95, 0.3, -0.05)); C.add(rbox(0.1, 0.7, 0.1, 0.04), P.ferro, L(s * 0.95, 0.85, -0.38, -0.2, 0, 0)); }
}

/** Coreto: plataforma octogonal, colunas finas, guarda-corpo e cobertura em sino (torno). */
export function coreto(ctx, x, z) {
  const L = F(x, 0, z, 0), { C } = ctx;
  const R = 4.6;
  C.add(new THREE.CylinderGeometry(R + 0.4, R + 0.6, 1.0, 8), P.pedra, L(0, 0.5, 0, 0, Math.PI / 8, 0), { grad: 0.35 });
  C.add(new THREE.CylinderGeometry(R + 0.55, R + 0.55, 0.2, 8), P.branco, L(0, 1.05, 0, 0, Math.PI / 8, 0));
  for (let s = 0; s < 3; s++) C.add(rbox(2.6, 0.3, 0.7, 0.06), P.pedra, L(0, 0.15 + s * 0.3, R + 1.6 - s * 0.5));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8, cx = Math.cos(a) * R, cz = Math.sin(a) * R;
    C.add(G.cyl, P.branco, L(cx, 3.0, cz, 0, 0, 0, 0.26, 3.9, 0.26));
    C.add(rbox(0.5, 0.25, 0.5, 0.06), P.branco, L(cx, 4.95, cz));
    C.add(rbox(0.5, 0.25, 0.5, 0.06), P.branco, L(cx, 1.2, cz));
    // guarda-corpo entre colunas (menos na frente da escada)
    const a2 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8, mx = (cx + Math.cos(a2) * R) / 2, mz = (cz + Math.sin(a2) * R) / 2;
    const isFront = Math.abs(Math.atan2(mz, mx) - Math.PI / 2) < 0.3;
    if (!isFront) {
      const len = 2 * R * Math.sin(Math.PI / 8), ang = -Math.atan2(mz, mx) + Math.PI / 2;
      C.add(rbox(len, 0.12, 0.14, 0.05), P.marinho, L(mx, 2.05, mz, 0, ang, 0));
      for (let k = -2; k <= 2; k++) C.add(G.cyl10, P.branco, L(mx + Math.cos(-ang) * k * len * 0.18, 1.6, mz + Math.sin(-ang) * k * len * 0.18, 0, 0, 0, 0.08, 0.9, 0.08));
    }
  }
  // cobertura em sino: perfil suave pelo torno (LatheGeometry)
  const pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(new THREE.Vector2((R + 1.1) * (1 - t) ** 1.6 + 0.05, 5.0 + 3.1 * Math.sin(t * Math.PI / 2) ** 0.8)); }
  pts.unshift(new THREE.Vector2(R + 1.05, 4.95));
  C.add(new THREE.LatheGeometry(pts, 8).rotateY(Math.PI / 8), P.telha, L(0, 0.2, 0), { grad: 0.3 });
  C.add(new THREE.CylinderGeometry(R + 1.25, R + 1.25, 0.35, 8), P.branco, L(0, 5.15, 0, 0, Math.PI / 8, 0));
  C.add(G.sph, P.ipe, L(0, 8.55, 0, 0, 0, 0, 0.55));
  C.add(G.cyl10, P.ipe, L(0, 9.1, 0, 0, 0, 0, 0.08, 0.9, 0.08));
  return L;
}

/** Escola: sobrado colonial com torre do sino, muro baixo e PORTÃO DE MADEIRA. Frente = +z. */
export function escola(ctx, x, z, ry, sinoTex) {
  const L = F(x, 0, z, ry), { C } = ctx;
  const w = 20, d = 9, h = 3.8;
  C.add(rbox(w + 0.4, 0.8, d + 0.4, 0.12), P.marinho, L(0, 0.35, 0));
  C.add(rbox(w, h * 2, d, 0.16), P.branco, L(0, h + 0.3, 0), { grad: 0.12 });
  C.add(rbox(w + 0.2, 0.25, d + 0.2, 0.08), P.azulClaro, L(0, h + 0.4, 0));
  for (const sx of [-1, -0.33, 0.33, 1]) C.add(rbox(0.5, h * 2 + 0.1, 0.5, 0.1), P.azulClaro, L(sx * w / 2, h + 0.35, d / 2));
  C.add(rbox(w + 0.6, 0.35, d + 0.6, 0.1), P.azulClaro, L(0, h * 2 + 0.45, 0));
  C.add(roofGeo(d + 0.3, 2.6, w + 0.3, 0.5), P.telha, L(0, h * 2 + 0.6, 0, 0, Math.PI / 2, 0), { grad: 0.2 });
  // corpo central avançado com frontão
  const cw = 6.5;
  C.add(rbox(cw, h * 2 + 1.2, 1.6, 0.14), P.branco, L(0, h + 0.9, d / 2 + 0.6));
  const fr = new THREE.Shape(); fr.moveTo(-cw / 2 - 0.4, 0); fr.lineTo(cw / 2 + 0.4, 0); fr.lineTo(0, 2.0); fr.lineTo(-cw / 2 - 0.4, 0);
  C.add(new THREE.ExtrudeGeometry(fr, { depth: 1.8, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 2 }), P.azulClaro, L(0, h * 2 + 1.5, d / 2 - 0.3));
  // torre do sino
  C.add(rbox(3.0, 3.4, 3.0, 0.14), P.branco, L(0, h * 2 + 3.6, 0));
  C.add(rbox(3.3, 0.3, 3.3, 0.08), P.azulClaro, L(0, h * 2 + 5.4, 0));
  for (const s of [-1, 1]) for (const t of [-1, 1]) C.add(rbox(0.5, 2.0, 0.5, 0.1), P.branco, L(s * 1.25, h * 2 + 6.5, t * 1.25));
  C.add(hipRoof(3.0, 2.0, 3.0, 0.4), P.telha, L(0, h * 2 + 7.5, 0), { grad: 0.2 });
  C.add(G.sph, P.ipe, L(0, h * 2 + 6.4, 0, 0, 0, 0, 1.0, 1.1, 1.0)); // sino
  C.add(G.cyl10, P.ipe, L(0, h * 2 + 9.8, 0, 0, 0, 0, 0.1, 1.0, 0.1));
  // portas e janelas
  porta(ctx, L, 0, 0.75, d / 2 + 1.4, { w: 2.2, h: 3.0, cor: P.marinho });
  for (let i = 0; i < 6; i++) {
    const jx = -w / 2 + 1.6 + i * (w - 3.2) / 5;
    if (Math.abs(jx) < cw / 2 + 0.5) continue;
    janela(ctx, L, jx, 2.4, d / 2, { cor: P.marinho, w: 1.2, h: 1.6 });
    janela(ctx, L, jx, 2.4 + h, d / 2, { cor: P.marinho, w: 1.2, h: 1.6, arco: true });
  }
  janela(ctx, L, -1.6, 2.6 + h, d / 2 + 1.4, { cor: P.marinho, w: 1.0, h: 1.6, arco: true });
  janela(ctx, L, 1.6, 2.6 + h, d / 2 + 1.4, { cor: P.marinho, w: 1.0, h: 1.6, arco: true });
  // muro baixo com gradil e o portão de madeira
  const mz = d / 2 + 6.5;
  for (const s of [-1, 1]) {
    C.add(rbox(w / 2 - 1.8, 1.0, 0.5, 0.12), P.branco, L(s * (w / 4 + 0.9), 0.5, mz), { grad: 0.2 });
    C.add(rbox(w / 2 - 1.8, 0.16, 0.62, 0.06), P.azulClaro, L(s * (w / 4 + 0.9), 1.05, mz));
    for (let k = 0; k < 14; k++) C.add(G.cyl10, P.marinho, L(s * (2.2 + k * 0.58), 1.6, mz, 0, 0, 0, 0.06, 1.1, 0.06));
    C.add(rbox(0.9, 2.6, 0.9, 0.12), P.branco, L(s * 1.85, 1.3, mz));
    C.add(G.sph, P.azulClaro, L(s * 1.85, 2.85, mz, 0, 0, 0, 0.6));
    // laterais do muro
    C.add(rbox(0.5, 1.0, mz + d / 2 - 0.5, 0.12), P.branco, L(s * (w / 2 + 0.4), 0.5, (mz - d / 2) / 2 + 0.1));
  }
  // portão de madeira (duas folhas entreabertas, tábuas com travessa em Z)
  for (const s of [-1, 1]) {
    const G2 = F(...L.pt(s * 1.4, 0, mz).toArray(), ry + s * 0.55);
    for (let k = 0; k < 4; k++) C.add(rbox(0.3, 1.7 + (k === 0 || k === 3 ? 0 : 0.15), 0.1, 0.05), P.madeira, G2(-s * (0.18 + k * 0.32), 1.05, 0), { jit: 0.08 });
    C.add(rbox(1.35, 0.14, 0.08, 0.04), P.madeiraEsc, G2(-s * 0.66, 0.6, 0.07));
    C.add(rbox(1.35, 0.14, 0.08, 0.04), P.madeiraEsc, G2(-s * 0.66, 1.55, 0.07));
    C.add(rbox(1.6, 0.12, 0.08, 0.04), P.madeiraEsc, G2(-s * 0.66, 1.08, 0.08, 0, 0, s * 0.62));
  }
  // pátio com chão de pedra
  return { L, frente: L.pt(0, 0, mz + 2), placa: L.pt(0, h * 2 + 2.2, d / 2 + 1.45), placaRy: ry };
}

/** Biblioteca: pórtico com colunas, cúpula azul e pilha de livros gigantes. Frente = +z. */
export function biblioteca(ctx, x, z, ry) {
  const L = F(x, 0, z, ry), { C } = ctx;
  const w = 11, d = 10, h = 6;
  C.add(rbox(w + 0.6, 1.0, d + 0.6, 0.14), P.pedra, L(0, 0.45, 0), { grad: 0.3 });
  C.add(rbox(w, h, d, 0.16), P.creme, L(0, h / 2 + 0.8, 0), { grad: 0.15 });
  C.add(rbox(w + 0.6, 0.45, d + 0.6, 0.12), P.branco, L(0, h + 0.95, 0));
  C.add(new THREE.CylinderGeometry(3.6, 3.9, 1.4, 24), P.branco, L(0, h + 1.85, -0.5));
  C.add(new THREE.SphereGeometry(3.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), P.marinho, L(0, h + 2.5, -0.5), { grad: 0.25 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; C.add(rbox(0.16, 2.5, 0.2, 0.06), P.azulClaro, L(Math.cos(a) * 3.0, h + 3.4, -0.5 + Math.sin(a) * 3.0, Math.sin(a) * 0.55, -a, -Math.cos(a) * 0.55)); }
  C.add(G.sph, P.ipe, L(0, h + 6.2, -0.5, 0, 0, 0, 0.8));
  // pórtico
  for (let i = 0; i < 4; i++) {
    const cx = -3.6 + i * 2.4;
    C.add(G.cyl, P.branco, L(cx, h / 2 + 1.0, d / 2 + 1.6, 0, 0, 0, 0.62, h - 0.2, 0.62));
    C.add(rbox(0.95, 0.35, 0.95, 0.08), P.branco, L(cx, h + 0.75, d / 2 + 1.6));
    C.add(rbox(0.95, 0.35, 0.95, 0.08), P.branco, L(cx, 1.05, d / 2 + 1.6));
  }
  C.add(rbox(9.2, 0.6, 2.8, 0.14), P.branco, L(0, h + 1.15, d / 2 + 1.2));
  const fr = new THREE.Shape(); fr.moveTo(-4.8, 0); fr.lineTo(4.8, 0); fr.lineTo(0, 2.2); fr.lineTo(-4.8, 0);
  C.add(new THREE.ExtrudeGeometry(fr, { depth: 2.6, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 }), P.creme, L(0, h + 1.45, d / 2 - 0.1));
  for (let s = 0; s < 3; s++) C.add(rbox(10, 0.3, 0.8, 0.06), P.pedra, L(0, 0.15 + s * 0.3, d / 2 + 4.0 - s * 0.6));
  porta(ctx, L, 0, 0.95, d / 2, { w: 2.0, h: 3.2, cor: P.marinho });
  for (const s of [-1, 1]) { janela(ctx, L, s * 3.7, 3.4, d / 2, { cor: P.marinho, w: 1.3, h: 2.4, arco: true, venez: false }); janela(ctx, F(x, 0, z, ry + s * Math.PI / 2), -2, 3.4, w / 2, { cor: P.marinho, w: 1.3, h: 2.4, arco: true, venez: false }); janela(ctx, F(x, 0, z, ry + s * Math.PI / 2), 2, 3.4, w / 2, { cor: P.marinho, w: 1.3, h: 2.4, arco: true, venez: false }); }
  // pilha de livros gigantes ao lado da escada (capas em 2 tons por livro, sem sequência arco-íris)
  const capas = [[P.marinho, P.creme], [P.terracota, P.creme], [P.verdeMata, P.creme], [P.ipe, P.creme], [P.marinho, P.creme]];
  capas.forEach(([c1, c2], i) => {
    const bx = 6.6, bz = d / 2 + 3.2, by = 0.35 + i * 0.62, rot = (i % 2 ? 0.2 : -0.15) + i * 0.08;
    C.add(rbox(2.6 - i * 0.12, 0.6, 1.9 - i * 0.06, 0.1), c1, L(bx, by, bz, 0, rot, 0));
    C.add(rbox(2.45 - i * 0.12, 0.44, 1.85 - i * 0.06, 0.04), c2, L(bx + 0.08, by, bz, 0, rot, 0));
  });
  return { L, placa: L.pt(0, h + 1.15, d / 2 + 2.62) };
}

/** Padaria: casa amarela com toldo listrado (2 cores), chaminé com fumaça e cestos de pão. Frente = +z. */
export function padaria(ctx, x, z, ry) {
  const c = casa(ctx, x, z, ry, { cores: { parede: '#F6CD62', det: P.terracota }, w: 8, d: 6.5, h: 4.2, chamine: true, vasos: false, portaX: 0, seed: 9 });
  const { L } = c, { C } = ctx;
  // toldo em arco com listras creme/terracota
  for (let i = 0; i < 8; i++) {
    const tx = -3.5 + i;
    C.add(new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, true, 0, Math.PI / 2), i % 2 ? P.creme : P.terracota, L(tx, 3.55, 3.55, 0, 0, Math.PI / 2, 1.0, 1.0, 2.6), { jit: 0.02 });
  }
  for (let i = 0; i < 8; i++) C.add(G.sph, i % 2 ? P.creme : P.terracota, L(-3.5 + i, 3.0, 4.2, 0, 0, 0, 0.5, 0.35, 0.3));
  // bancada com pães
  C.add(rbox(3.0, 0.9, 1.1, 0.1), P.madeira, L(2.4, 0.45, 4.2));
  for (let i = 0; i < 3; i++) {
    C.add(G.cylTaper, P.madeiraClara, L(1.5 + i * 0.9, 1.05, 4.2, Math.PI, 0, 0, 0.75, 0.32, 0.75));
    for (let k = 0; k < 3; k++) C.add(G.capsule, '#E2A24E', L(1.35 + i * 0.9 + k * 0.15, 1.28, 4.1 + k * 0.1, Math.PI / 2, 0.3 * k, Math.PI / 2, 0.16, 0.22, 0.16));
  }
  return { ...c, placa: L.pt(0, 4.6, 3.35), chamine: L.pt(8 * 0.28, 4.2 + 3.1, -6.5 * 0.15) };
}

/** Cerquinha de madeira (piquetes arredondados). */
export function cerca(ctx, x0, z0, x1, z1, cor = P.branco, alt = 1.0) {
  const { C } = ctx, len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(len / 0.45)), ang = Math.atan2(x1 - x0, z1 - z0);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    C.add(rbox(0.16, alt, 0.08, 0.04), cor, M(x, alt / 2, z, 0, ang + Math.PI / 2, 0), { jit: 0.05 });
  }
  for (const y of [alt * 0.35, alt * 0.75]) C.add(rbox(0.06, 0.1, len, 0.03), cor, M((x0 + x1) / 2, y, (z0 + z1) / 2, 0, ang, 0));
}
