// FONEMA · Mundo 3D v2 — CENA 1: Vila das Letras / Quintal da Sofia (R0).
// Praça com coreto, escola com portão de madeira, biblioteca, padaria, casas coloniais,
// ipês-amarelos, mata nas colinas, horta, campinho, rio com reflexo, cais e barquinho, ponte,
// varais de livros, postes, bancos, flores, pássaros, borboletas, Sofia, Tales, Bolota e Zum-Zum.
import * as THREE from 'three';
import { Lote, rbox, G, M, F, rng, fbm, smooth, lerp, clamp, canvasTex, placaTex, addRim, addWind, matStd, blobGeo, radialTex } from './kit.js';
import { P, CASAS, casa, poste, banco, coreto, escola, biblioteca, padaria, cerca } from './predios.js';
import { Instancias, criarArvores, ipe, coqueiro, bananeira, criarBichinhos } from './natureza.js';
import { criarRio } from './agua.js';
import { criarSprite, criarBolota, criarZumZum, criarPortal, rotulo } from './personagens.js';

// ---------- rio e relevo ----------
const RIO = new THREE.CatmullRomCurve3([[60, -200], [56, -110], [47, -55], [43, -10], [46, 25], [52, 60], [46, 110], [54, 200]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
const RIO2D = new THREE.SplineCurve(RIO.points.map((p) => new THREE.Vector2(p.x, p.z)));
const RIO_PTS = RIO2D.getSpacedPoints(400);
const RIO_W = 12, NIVEL_AGUA = -0.42;
function distRio(x, z) { let d = 1e9; for (const p of RIO_PTS) { const dx = p.x - x, dz = p.y - z, q = dx * dx + dz * dz; if (q < d) d = q; } return Math.sqrt(d); }
export function altura(x, z) {
  const r = Math.hypot(x * 0.95, (z - 4) * 0.85);
  let h = smooth(clamp((r - 58) / 70, 0, 1)) * (7 + 20 * fbm(x * 0.017 + 3, z * 0.017 - 1, 4));
  h += (fbm(x * 0.06, z * 0.06, 3) - 0.5) * 0.9 * smooth(clamp((r - 36) / 30, 0, 1));
  if (x > 40) h += smooth(clamp((x - 62) / 40, 0, 1)) * 9 * fbm(x * 0.03, z * 0.03, 3);
  const d = distRio(x, z);
  const banco = smooth(clamp((d - RIO_W / 2 + 1.5) / 7, 0, 1));
  h = lerp(-1.7, h, banco);
  return h;
}

// ---------- pontos de interesse (câmera) ----------
export const POIS = [
  { id: 'praca', nome: 'Praça do Coreto', icone: '🎪', alvo: [0, 2.5, 2], cam: [15, 9.5, 27] },
  { id: 'escola', nome: 'Escola', icone: '🏫', alvo: [0, 4.5, -27], cam: [7, 6.5, -5] },
  { id: 'biblioteca', nome: 'Biblioteca', icone: '📚', alvo: [-25, 4.5, -5], cam: [-8, 7, 6] },
  { id: 'padaria', nome: 'Padaria', icone: '🥖', alvo: [24, 3, -6], cam: [9, 5.5, 5] },
  { id: 'casa', nome: 'Casa da Sofia', icone: '🏡', alvo: [-12, 2.5, 21], cam: [4, 6, 30] },
  { id: 'rua', nome: 'Rua das Casas', icone: '🏘️', alvo: [0, 2.5, 34], cam: [7, 4.2, 60] },
  { id: 'horta', nome: 'Horta', icone: '🥕', alvo: [23, 1, 19], cam: [33, 9, 34] },
  { id: 'campinho', nome: 'Campinho', icone: '⚽', alvo: [-29, 1, 21], cam: [-12, 10, 38] },
  { id: 'cais', nome: 'Rio e Cais', icone: '⛵', alvo: [44, 0.5, 8], cam: [30, 5, 24] },
  { id: 'ponte', nome: 'Ponte', icone: '🌉', alvo: [46, 2, -45], cam: [28, 8, -26] },
  { id: 'mirante', nome: 'Vista do alto', icone: '🦅', alvo: [4, 0, 4], cam: [62, 64, 96] },
];

// fases de R0 (jogo-completo/02-regioes-R0-R2.md) e onde fica o portal de cada uma
export const FASES_R0 = [
  { id: 'R0-F01', nome: 'O som do meu nome', letra: '★', pos: [-4.3, 0, 22.5] },
  { id: 'R0-F02', nome: 'Rimas do quintal', letra: '♪', pos: [-21, 0, 17] },
  { id: 'R0-F03', nome: 'Palmas das sílabas', letra: '👏', pos: [-9, 0, 4] },
  { id: 'R0-F04', nome: 'O primeiro som', letra: 'S', pos: [15.5, 0, 14] },
  { id: 'R0-F05', nome: 'Juntar sons', letra: 'M', pos: [-20, 0, 29] },
  { id: 'R0-F06', nome: 'Festa das Rimas', letra: '🏆', pos: [5.5, 0, 9.5] },
];

// ---------- chão pintado (caminhos, praça em pedra portuguesa, campinho, sombras de contato) ----------
const EXT = 90; // o chão texturizado cobre [-EXT, EXT]
function pintarChao(S) {
  const k = S / (EXT * 2), X = (x) => (x + EXT) * k, Z = (z) => (z + EXT) * k;
  return canvasTex(S, S, (g) => {
    const r = rng(12);
    g.fillStyle = '#7CBE54'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      const x = r() * S, y = r() * S, rr = (2 + r() * 9) * k, c = ['#72B24B', '#8CC95E', '#84C258', '#97CF66', '#6CAA48'][i % 5];
      const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, c); gr.addColorStop(1, c + '00'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    // margens do rio (areia)
    g.lineCap = 'round'; g.lineJoin = 'round';
    const rio = () => { g.beginPath(); RIO_PTS.forEach((p, i) => (i ? g.lineTo(X(p.x), Z(p.y)) : g.moveTo(X(p.x), Z(p.y)))); };
    rio(); g.strokeStyle = '#D9C391'; g.lineWidth = (RIO_W + 7) * k; g.stroke();
    rio(); g.strokeStyle = '#E9D6A8'; g.lineWidth = (RIO_W + 4) * k; g.stroke();
    // sombras de contato pintadas (prédios), suaves
    g.filter = `blur(${Math.round(1.2 * k)}px)`; g.fillStyle = 'rgba(40,60,30,0.35)';
    const somb = (x, z, w, d, rot = 0) => { g.save(); g.translate(X(x), Z(z)); g.rotate(-rot); g.fillRect(-w * k / 2, -d * k / 2, w * k, d * k); g.restore(); };
    somb(0, -30, 22, 11); somb(-25, -5, 13, 13, Math.PI / 2); somb(24, -6, 10, 8.5, -Math.PI / 2);
    for (const z of [20, 29, 38, 47]) { somb(-10, z, 7.5, 8.5, Math.PI / 2); somb(10, z, 7.5, 8.5, -Math.PI / 2); }
    somb(-19, -19, 8, 8, 0.6); somb(19, -19, 8, 8, -0.6);
    g.filter = 'none';
    // caminhos de terra batida: borda + miolo + pedrinhas
    const caminhos = [
      [[0, 12], [0, 70]], [[0, -12], [0, -24]], [[-12, -3], [-17, -4]], [[12, -3], [17, -5]],
      [[11, 5], [24, 7], [37, 7]], [[-9, 9], [-18, 15], [-24, 18]], [[9, 9], [16, 15]],
      [[-7, 26], [-24, 26]], [[-36, 34], [36, 34]], [[0, -12], [-10, -18], [-17, -20]], [[0, -12], [10, -18], [17, -20]],
      [[37, 7], [40, 7]], [[13, -4], [30, -20], [38, -40], [40, -46]],
    ];
    for (const [w, c] of [[4.4, '#D4B888'], [3.4, '#E8D3A8']]) for (const cm of caminhos) {
      g.beginPath(); cm.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.strokeStyle = c; g.lineWidth = w * k; g.stroke();
    }
    for (let i = 0; i < 2200; i++) { const cm = caminhos[i % caminhos.length], a = cm[0], b = cm[cm.length - 1], t = r(); const x = lerp(a[0], b[0], t) + (r() - 0.5) * 3, z = lerp(a[1], b[1], t) + (r() - 0.5) * 3; g.fillStyle = r() < 0.5 ? 'rgba(170,140,100,0.35)' : 'rgba(255,248,230,0.5)'; g.beginPath(); g.arc(X(x), Z(z), (0.08 + r() * 0.12) * k, 0, 7); g.fill(); }
    // pátio da escola (pedra clara)
    g.fillStyle = '#E6DCCB'; g.fillRect(X(-10.5), Z(-25.5), 21 * k, 7 * k);
    // PRAÇA: pedra portuguesa em ondas (creme + azul-marinho acinzentado = 2 cores)
    const cx = X(0), cz = Z(1), R = 14 * k;
    g.save(); g.beginPath(); g.arc(cx, cz, R, 0, 7); g.clip();
    g.fillStyle = '#F1E6D0'; g.fillRect(cx - R, cz - R, R * 2, R * 2);
    g.strokeStyle = '#8E9BB8'; g.lineWidth = 0.32 * k;
    for (let row = -16; row <= 16; row += 2.1) {
      g.beginPath();
      for (let xx = -15; xx <= 15; xx += 0.3) { const yy = row + Math.sin(xx * 0.55) * 0.9; xx === -15 ? g.moveTo(X(xx), Z(1 + yy)) : g.lineTo(X(xx), Z(1 + yy)); }
      g.stroke();
    }
    g.restore();
    g.strokeStyle = '#B9AC98'; g.lineWidth = 0.7 * k; g.beginPath(); g.arc(cx, cz, R - 0.35 * k, 0, 7); g.stroke();
    // CAMPINHO
    g.save(); g.translate(X(-29), Z(21));
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7EC25F' : '#8DCD6A'; g.fillRect((-12 + i * 3) * k, -8 * k, 3 * k, 16 * k); }
    g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineWidth = 0.22 * k;
    g.strokeRect(-11 * k, -7 * k, 22 * k, 14 * k); g.beginPath(); g.moveTo(0, -7 * k); g.lineTo(0, 7 * k); g.stroke();
    g.beginPath(); g.arc(0, 0, 2.4 * k, 0, 7); g.stroke();
    for (const s of [-1, 1]) g.strokeRect(s > 0 ? 7.5 * k : -11 * k, -3.5 * k, 3.5 * k, 7 * k);
    g.restore();
    // quintal da Sofia: terra do varal e canteiro
    g.fillStyle = '#C9A77A'; g.beginPath(); g.ellipse(X(-21), Z(22), 4 * k, 2.4 * k, 0, 0, 7); g.fill();
    // horta: corredores de terra
    g.fillStyle = '#B98F62'; g.fillRect(X(15), Z(13), 16 * k, 12 * k);
  }, { aniso: 8 });
}

export async function criarVila({ U, q, renderer, estados = {} }) {
  const grupo = new THREE.Group(); grupo.name = 'vila';
  const r = rng(2024);
  const matCorpo = addRim(matStd(), '#FFE4BE', 0.22, 3.0);
  const matFolha = addRim(addWind(matStd({ roughness: 0.82 }), U, 0.018, 2.5), '#FFF2B0', 0.3, 2.4);
  const matJanela = matStd({ roughness: 0.25, metalness: 0.1, emissive: new THREE.Color('#FFB866'), emissiveIntensity: 0 });
  const matLuz = matStd({ emissive: new THREE.Color('#FFD08A'), emissiveIntensity: 0.15, roughness: 0.3 });
  const ctx = { C: new Lote(1), J: new Lote(2), Fo: new Lote(3), Lz: new Lote(4), flores: [], arbustos: [], petalas: [] };
  const alturaQ = (x, z) => altura(x, z);

  // ---------- terreno ----------
  const S = q === 'baixo' ? 1024 : 2048;
  const chaoTex = pintarChao(S);
  const segIn = q === 'baixo' ? 120 : 220;
  const gIn = new THREE.PlaneGeometry(EXT * 2, EXT * 2, segIn, segIn).rotateX(-Math.PI / 2);
  const cIn = [];
  { const p = gIn.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = alturaQ(x, z); p.setY(i, h); const f = h < -0.3 ? 0.78 : 1 - clamp(h / 30, 0, 0.25); cIn.push(f, f, f); } }
  gIn.setAttribute('color', new THREE.Float32BufferAttribute(cIn, 3)); gIn.computeVertexNormals();
  const terreno = new THREE.Mesh(gIn, new THREE.MeshStandardMaterial({ map: chaoTex, vertexColors: true, roughness: 0.95 }));
  terreno.receiveShadow = true; grupo.add(terreno);
  // anel externo (colinas da mata), cor por altura
  const gOut = new THREE.PlaneGeometry(1000, 1000, q === 'baixo' ? 90 : 170, q === 'baixo' ? 90 : 170).rotateX(-Math.PI / 2);
  { const p = gOut.attributes.position, col = []; const c = new THREE.Color(), cg = new THREE.Color('#74B556'), cf = new THREE.Color('#4C8F4E'), cs = new THREE.Color('#D9C391');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const far = Math.max(Math.abs(x), Math.abs(z)) > EXT - 2; let h = alturaQ(x, z); if (!far) h -= 0.08; const fall = smooth(clamp((Math.hypot(x, z) - 300) / 200, 0, 1)); h = lerp(h, h * 0.4 - 4, fall); p.setY(i, h); c.copy(cg).lerp(cf, clamp(h / 18, 0, 1)); if (h < -0.6) c.copy(cs); col.push(c.r, c.g, c.b); }
    gOut.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gOut.computeVertexNormals(); }
  const anel = new THREE.Mesh(gOut, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); anel.receiveShadow = true; grupo.add(anel);

  // ---------- rio ----------
  const rio = criarRio({ curva: RIO2D, largura: RIO_W, y: NIVEL_AGUA, U, reflexo: q !== 'baixo', resolucao: q === 'alto' ? 1024 : 512 });
  grupo.add(rio);

  // ---------- praça ----------
  coreto(ctx, 0, 1);
  const postes = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; postes.push(poste(ctx, Math.cos(a) * 12.6, 1 + Math.sin(a) * 12.6, -a + Math.PI)); }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.25; if (Math.abs(Math.sin(a) - 1) < 0.15) continue; banco(ctx, Math.cos(a) * 10.4, 1 + Math.sin(a) * 10.4, -a - Math.PI / 2); }
  // meio-fio e canteiros redondos
  ctx.C.add(new THREE.TorusGeometry(14, 0.22, 8, 96), P.pedra, M(0, 0.05, 1, Math.PI / 2, 0, 0, 1, 1, 0.6));
  for (const [x, z] of [[-9.5, -6], [9.5, -6], [-9.5, 9], [9.5, 9]]) {
    ctx.C.add(new THREE.CylinderGeometry(2.2, 2.3, 0.5, 28), P.pedra, M(x, 0.25, z));
    ctx.C.add(new THREE.CylinderGeometry(2.0, 2.0, 0.1, 28), '#6B4A33', M(x, 0.5, z));
    for (let k = 0; k < 40; k++) { const a = r() * 7, d = Math.sqrt(r()) * 1.8; ctx.flores.push({ m: M(x + Math.cos(a) * d, 0.62 + r() * 0.15, z + Math.sin(a) * d, 0, 0, 0, 0.2 + r() * 0.08), c: [P.ipe, '#FFFFFF', '#F59E4C'][k % 3] }); }
    for (let k = 0; k < 6; k++) { const a = k * 1.05; ctx.arbustos.push({ m: M(x + Math.cos(a) * 1.2, 0.6, z + Math.sin(a) * 1.2, 0, a, 0, 0.9, 0.7, 0.9), c: '#4E9A50' }); }
  }
  // varais de livros entre os postes (catenária + livrinhos em 2 cores alternadas)
  const livrosVaral = [];
  for (let i = 0; i < 8; i += 2) {
    const a = postes[i], b = postes[(i + 1) % 8];
    for (const [pa, pb] of [[a, b], [b, postes[(i + 2) % 8]]]) {
      const pts = []; for (let t = 0; t <= 1.0001; t += 0.05) { const p = new THREE.Vector3().lerpVectors(pa, pb, t); p.y += 0.25 - Math.sin(t * Math.PI) * 1.1; pts.push(p); }
      ctx.C.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.025, 5), '#F7F0E0', new THREE.Matrix4());
      for (let t = 0.12; t < 0.9; t += 0.11) {
        const p = new THREE.Vector3().lerpVectors(pa, pb, t); p.y += 0.25 - Math.sin(t * Math.PI) * 1.1 - 0.42;
        const ang = Math.atan2(pb.x - pa.x, pb.z - pa.z) + Math.PI / 2, capa = Math.round(t * 9) % 2 ? P.marinho : P.ipe;
        for (const s of [-1, 1]) ctx.Fo.add(rbox(0.34, 0.44, 0.04, 0.015), capa, M(p.x + Math.sin(ang + s * 0.5) * 0.15, p.y, p.z + Math.cos(ang + s * 0.5) * 0.15, 0, ang + s * 0.5 + Math.PI / 2, 0), { jit: 0.04 });
        livrosVaral.push(p);
      }
    }
  }

  // ---------- prédios ----------
  const esc = escola(ctx, 0, -31, 0);
  const bib = biblioteca(ctx, -26, -5, Math.PI / 2);
  const pad = padaria(ctx, 25, -6, -Math.PI / 2);
  const casas = [];
  let ci = 0;
  for (const z of [20, 29, 38, 47]) {
    for (const s of [-1, 1]) {
      const sofia = s < 0 && z === 20;
      const c = casa(ctx, s * 10, z, s < 0 ? Math.PI / 2 : -Math.PI / 2, { cores: sofia ? { parede: '#F6CD62', det: P.marinho } : CASAS[(ci++ + 1) % CASAS.length], seed: 30 + ci, andares: !sofia && r() < 0.35 ? 2 : 1, quatroAguas: r() < 0.3, chamine: r() < 0.3, portaX: sofia ? -0.2 : undefined });
      casas.push(c);
    }
  }
  casa(ctx, -19, -20, 0.75, { cores: CASAS[5], seed: 71, andares: 2 });
  casa(ctx, 19, -20, -0.75, { cores: CASAS[1], seed: 72, quatroAguas: true });
  casa(ctx, -33, 6, Math.PI / 2, { cores: CASAS[3], seed: 73 });
  casa(ctx, 33, -26, -Math.PI / 2 - 0.4, { cores: CASAS[6], seed: 74, chamine: true });
  // quintal da Sofia: varal de roupas e livros, casinha do Paçoca, cerquinha
  cerca(ctx, -14, 15.5, -27, 15.5); cerca(ctx, -27, 15.5, -27, 31); cerca(ctx, -27, 31, -14, 31);
  for (const x of [-24.5, -17.5]) ctx.C.add(rbox(0.18, 2.4, 0.18, 0.05), P.madeira, M(x, 1.2, 21));
  { const pts = [new THREE.Vector3(-24.5, 2.3, 21), new THREE.Vector3(-21, 1.95, 21), new THREE.Vector3(-17.5, 2.3, 21)];
    ctx.C.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.025, 5), '#FFFFFF', new THREE.Matrix4());
    [P.azulClaro, '#FFFFFF', P.ipe, '#FFFFFF'].forEach((c, i) => ctx.Fo.add(rbox(0.9, 1.0, 0.04, 0.03), c, M(-23.4 + i * 1.6, 1.55, 21)));
  }
  { // casinha do Paçoca
    const L = F(-21, 0, 28.5, 0.2);
    ctx.C.add(rbox(1.8, 1.3, 1.6, 0.1), P.azulClaro, L(0, 0.65, 0)); ctx.C.add(rbox(0.7, 0.8, 0.1, 0.1), '#3A2A22', L(0, 0.5, 0.78));
    ctx.C.add(new THREE.CylinderGeometry(0.02, 1.4, 0.9, 4).rotateY(Math.PI / 4), P.telha, L(0, 1.75, 0, 0, 0, 0, 1, 1, 0.9));
    // Paçoca, cachorro caramelo
    const D = F(-19.3, 0, 29.6, -0.6);
    ctx.C.add(G.capsule, '#D79A55', D(0, 0.55, 0, Math.PI / 2, 0, 0, 0.45, 0.55, 0.42)); ctx.C.add(G.sph, '#D79A55', D(0, 0.95, 0.55, 0, 0, 0, 0.5));
    ctx.C.add(G.sph, '#F3D9B5', D(0, 0.86, 0.82, 0, 0, 0, 0.26, 0.2, 0.26)); ctx.C.add(G.sph, '#3A2A22', D(0, 0.92, 0.95, 0, 0, 0, 0.08));
    for (const s of [-1, 1]) { ctx.C.add(G.sph, '#B87A3E', D(s * 0.22, 1.12, 0.5, 0, 0, s * 0.5, 0.14, 0.3, 0.1)); ctx.C.add(G.sph, '#2B1E16', D(s * 0.1, 1.02, 0.77, 0, 0, 0, 0.07)); for (const z of [-0.3, 0.3]) ctx.C.add(G.capsule, '#D79A55', D(s * 0.16, 0.2, z, 0, 0, 0, 0.13, 0.28, 0.13)); }
    ctx.C.add(G.capsule, '#D79A55', D(0, 0.75, -0.48, -0.9, 0, 0, 0.08, 0.35, 0.08));
  }

  // ---------- horta ----------
  for (let i = 0; i < 4; i++) {
    const bx = 17 + i * 3.6, bz = 19;
    ctx.C.add(rbox(2.4, 0.55, 8.5, 0.08), P.madeira, M(bx, 0.27, bz), { grad: 0.3 });
    ctx.C.add(rbox(2.1, 0.12, 8.2, 0.05), '#6B4A33', M(bx, 0.55, bz));
    for (let k = 0; k < 8; k++) {
      const pz = bz - 3.6 + k * 1.03;
      if (i === 0) ctx.Fo.add(blobGeo(k, 2, 0.35), k % 2 ? '#7CC253' : '#93D063', M(bx + (k % 2 ? 0.4 : -0.4), 0.78, pz, 0, k, 0, 0.75, 0.55, 0.75));
      if (i === 1) { ctx.C.add(G.cone, '#F08A2E', M(bx + (k % 2 ? 0.4 : -0.4), 0.58, pz, Math.PI, 0, 0, 0.2, 0.3, 0.2)); for (let f = 0; f < 3; f++) ctx.Fo.add(G.cone, '#5FAE48', M(bx + (k % 2 ? 0.4 : -0.4), 0.95, pz, (f - 1) * 0.35, 0, 0, 0.12, 0.6, 0.12)); }
      if (i === 2 && k % 2 === 0) { ctx.C.add(G.cyl10, P.madeiraClara, M(bx, 1.3, pz, 0, 0, 0, 0.06, 1.6, 0.06)); ctx.Fo.add(blobGeo(k + 9, 2, 0.3), '#4E9A47', M(bx, 1.25, pz, 0, k, 0, 0.8, 1.3, 0.8)); for (let f = 0; f < 4; f++) ctx.C.add(G.sph, '#E2483A', M(bx + Math.cos(f * 1.7) * 0.35, 0.9 + f * 0.22, pz + Math.sin(f * 1.7) * 0.35, 0, 0, 0, 0.22)); }
      if (i === 3) ctx.Fo.add(blobGeo(k + 20, 2, 0.4), '#3F8A52', M(bx + (k % 2 ? 0.35 : -0.35), 0.85, pz, 0, k, 0, 0.95, 0.7, 0.95));
    }
  }
  cerca(ctx, 14.5, 13.5, 30.5, 13.5, P.madeiraClara, 0.8); cerca(ctx, 30.5, 13.5, 30.5, 24.5, P.madeiraClara, 0.8); cerca(ctx, 30.5, 24.5, 14.5, 24.5, P.madeiraClara, 0.8);
  { const L = F(29, 0, 15.2, -0.4); ctx.C.add(G.cylTaper, '#5E8FB8', L(0, 0.35, 0, Math.PI, 0, 0, 0.6, 0.7, 0.6)); ctx.C.add(G.cyl10, '#5E8FB8', L(0.5, 0.55, 0, 0, 0, -1.0, 0.1, 0.8, 0.1)); ctx.C.add(G.torus, '#5E8FB8', L(-0.15, 0.85, 0, 0, Math.PI / 2, 0, 0.5, 0.5, 0.5)); }

  // ---------- campinho ----------
  for (const s of [-1, 1]) {
    const L = F(-29 + s * 11, 0, 21, s > 0 ? -Math.PI / 2 : Math.PI / 2);
    for (const x of [-1.8, 1.8]) ctx.C.add(G.cyl10, '#FFFFFF', L(x, 1.0, 0, 0, 0, 0, 0.14, 2.0, 0.14));
    ctx.C.add(G.cyl10, '#FFFFFF', L(0, 2.0, 0, 0, 0, Math.PI / 2, 0.14, 3.75, 0.14));
    for (let k = 0; k <= 8; k++) ctx.C.add(G.cyl10, '#E9EEF2', L(-1.8 + k * 0.45, 1.0, -0.6, 0.29, 0, 0, 0.02, 2.1, 0.02));
    for (let k = 0; k <= 4; k++) ctx.C.add(G.cyl10, '#E9EEF2', L(0, 0.4 + k * 0.4, -0.6 + k * 0.0, 0, 0, Math.PI / 2, 0.02, 3.6, 0.02));
  }
  ctx.C.add(G.sph, '#FFFFFF', M(-25, 0.32, 19.5, 0, 0, 0, 0.6));
  for (let k = 0; k < 6; k++) { const a = k * 1.2; ctx.C.add(G.sph, P.marinho, M(-25 + Math.cos(a) * 0.26, 0.32 + Math.sin(a * 2) * 0.2, 19.5 + Math.sin(a) * 0.26, 0, 0, 0, 0.18)); }
  for (const x of [-34, -24]) { const L = F(x, 0, 30.5, Math.PI); for (let k = 0; k < 2; k++) ctx.C.add(rbox(4.5, 0.18, 0.7, 0.06), P.madeiraClara, L(0, 0.5 + k * 0.5, k * 0.6)); for (const s of [-2, 0, 2]) ctx.C.add(rbox(0.14, 1.0, 1.4, 0.05), P.madeira, L(s, 0.45, 0.3)); }

  // ---------- cais, barquinho e ponte ----------
  { const L = F(39.5, 0, 7.5, Math.PI / 2);
    for (let k = 0; k < 18; k++) ctx.C.add(rbox(3.2, 0.16, 0.5, 0.05), k % 3 ? P.madeiraClara : P.madeira, L(0, 0.55, -1 + k * 0.52), { jit: 0.08 });
    for (const x of [-1.5, 1.5]) for (let k = 0; k < 4; k++) ctx.C.add(G.cyl10, P.madeiraEsc, L(x, -0.2, -0.8 + k * 2.8, 0, 0, 0, 0.28, 1.8, 0.28));
    for (const x of [-1.5, 1.5]) ctx.C.add(G.cyl10, P.madeiraEsc, L(x, 1.0, 8.2, 0, 0, 0, 0.24, 1.0, 0.24));
    ctx.C.add(G.torus, '#E8D7B4', L(1.5, 1.1, 7.6, Math.PI / 2, 0, 0, 0.5, 0.5, 0.5));
  }
  const barco = (() => {
    const L2 = new Lote(88);
    const s = new THREE.Shape(); s.moveTo(-2.4, 0.5); s.quadraticCurveTo(-2.2, -0.45, -0.6, -0.55); s.lineTo(1.0, -0.55); s.quadraticCurveTo(2.4, -0.4, 2.8, 0.7); s.lineTo(-2.4, 0.5);
    const hull = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.22, bevelSegments: 4, curveSegments: 16 }); hull.translate(0, 0, -0.8);
    const hp = hull.attributes.position; for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), t = clamp((x + 2.4) / 5.2, 0, 1); const pinch = 1 - Math.pow(Math.abs(t - 0.45) / 0.55, 2.2) * 0.75; hp.setZ(i, hp.getZ(i) * Math.max(0.15, pinch)); }
    hull.computeVertexNormals();
    L2.add(hull, P.madeira, M(0, 0, 0), { top: P.madeiraClara });
    L2.add(rbox(3.6, 0.1, 1.1, 0.04), P.madeiraClara, M(0.1, 0.45, 0));
    L2.add(rbox(0.22, 0.22, 1.5, 0.08), P.marinho, M(-1.2, 0.62, 0));
    L2.add(G.cyl10, P.madeiraEsc, M(0.3, 2.4, 0, 0, 0, 0, 0.1, 4.0, 0.1));
    const vela = new THREE.Shape(); vela.moveTo(0, 0); vela.lineTo(0, 3.4); vela.quadraticCurveTo(1.0, 1.6, 2.1, 0.05); vela.lineTo(0, 0);
    const vg = new THREE.ExtrudeGeometry(vela, { depth: 0.04, bevelEnabled: false, curveSegments: 12 });
    L2.add(vg, '#FFFFFF', M(0.42, 0.9, 0)); L2.add(rbox(2.0, 0.28, 0.06, 0.02), P.marinho, M(1.4, 1.05, 0.02));
    const m = L2.build(matCorpo); const g = new THREE.Group(); g.add(m); g.position.set(46.5, NIVEL_AGUA + 0.25, 12); g.rotation.y = -1.25; g.scale.setScalar(0.9); return g;
  })();
  grupo.add(barco);
  { // ponte em arco sobre o rio
    const z0 = -46, x0 = 37, x1 = 57;
    for (let k = 0; k <= 34; k++) { const t = k / 34, x = lerp(x0, x1, t), y = 0.4 + Math.sin(t * Math.PI) * 2.4, dy = Math.cos(t * Math.PI) * 2.4 * Math.PI / (x1 - x0);
      ctx.C.add(rbox(0.62, 0.18, 3.4, 0.05), k % 4 ? P.madeiraClara : P.madeira, M(x, y, z0, 0, 0, Math.atan(dy)), { jit: 0.08 });
      if (k % 4 === 0) for (const s of [-1, 1]) { ctx.C.add(G.cyl10, P.madeiraEsc, M(x, y + 0.6, z0 + s * 1.6, 0, 0, 0, 0.14, 1.2, 0.14)); if (k > 0 && k < 34) ctx.C.add(G.cyl10, P.madeiraEsc, M(x, y - 1.6, z0 + s * 1.45, 0, 0, 0, 0.25, 3.6, 0.25)); }
    }
    for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push(new THREE.Vector3(lerp(x0, x1, t), 0.4 + Math.sin(t * Math.PI) * 2.4 + 1.15, z0 + s * 1.6)); } ctx.C.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.09, 6), P.madeira, new THREE.Matrix4()); }
  }

  // ---------- postes nas ruas e mais bancos ----------
  const postesRua = [];
  for (const z of [16, 25, 34, 43, 52]) postesRua.push(poste(ctx, z % 2 ? 3.2 : -3.2, z, z % 2 ? 0 : Math.PI));
  for (const [x, z, a] of [[-4, -16, 0], [4, -16, Math.PI], [20, 6, Math.PI / 2], [-14, 6, 0], [36, 4, -Math.PI / 2], [30, 9, 0]]) postesRua.push(poste(ctx, x, z, a));
  banco(ctx, 36, 12, -Math.PI / 2 - 0.3); banco(ctx, -22, 10, 0.4);

  // ---------- vegetação ----------
  ipe(ctx, -9.5, 0.55, -6, 0.95, 3); ipe(ctx, 9.5, 0.55, -6, 0.9, 7); ipe(ctx, -9.5, 0.55, 9, 0.85, 11); ipe(ctx, 9.5, 0.55, 9, 0.92, 5);
  ipe(ctx, 30, altura(30, 30), 30, 1.1, 13); ipe(ctx, -36, altura(-36, -14), -14, 1.2, 17); ipe(ctx, 16, altura(16, 60), 60, 1.1, 19);
  ipe(ctx, -40, altura(-40, 40), 40, 1.05, 23, '#E58AA6', '#F2B2C6'); // ipê-rosa ao longe (2 tons)
  for (const [x, z, s] of [[38, 16, 1], [36, -2, 1.1], [35.5, 25, 0.9], [-16, 36, 0.95], [16, -32, 1.05], [-14, -32, 1.0]]) coqueiro(ctx, x, altura(x, z), z, s, x * 3 + z);
  for (const [x, z] of [[-26, 25], [-12, 45], [15, 30], [27, 30], [-30, -26], [13, -38]]) bananeira(ctx, x, altura(x, z), z, 1, x + z * 7);
  const arv = criarArvores(U, q);
  const livre = (x, z) => {
    if (Math.hypot(x, z - 1) < 17) return false; // praça
    if (Math.abs(x) < 6 && z > -26) return false; // avenida/rua
    if (x > -13 && x < 13 && z > 12 && z < 60) return false; // casas da rua
    if (x > -40 && x < -16 && z > 12 && z < 33) return false; // campinho/quintal
    if (x > 13 && x < 32 && z > 11 && z < 27) return false; // horta
    if (x > -14 && x < 14 && z < -22 && z > -40) return false; // escola
    if (x > -34 && x < -17 && z > -14 && z < 4) return false; // biblioteca
    if (x > 17 && x < 32 && z > -14 && z < 2) return false; // padaria
    if (Math.abs(x + 19) < 6 && Math.abs(z + 20) < 6) return false;
    if (Math.abs(x - 19) < 6 && Math.abs(z + 20) < 6) return false;
    if (Math.abs(x + 33) < 6 && Math.abs(z - 6) < 6) return false;
    if (Math.abs(x - 33) < 6 && Math.abs(z + 26) < 6) return false;
    if (x > 34 && x < 44 && z > -2 && z < 18) return false; // cais
    if (Math.abs(z + 46) < 5 && x > 30 && x < 64) return false; // ponte
    if (x > 8 && x < 40 && z > -48 && z < -2 && Math.abs((z + 4) + (x - 13) * 1.0) < 4) return false; // estrada da ponte
    if (Math.abs(z - 34) < 3.5 && Math.abs(x) < 38) return false;
    if (distRio(x, z) < RIO_W / 2 + 2.5) return false;
    return true;
  };
  const nArv = q === 'alto' ? 1700 : q === 'medio' ? 1100 : 500;
  let tent = 0, postas = 0;
  while (postas < nArv && tent < nArv * 12) {
    tent++;
    const a = r() * Math.PI * 2, d = 18 + Math.pow(r(), 0.7) * 230, x = Math.cos(a) * d, z = Math.sin(a) * d + 4;
    if (!livre(x, z)) continue;
    const h = altura(x, z);
    const dens = d < 50 ? 0.12 : d < 70 ? 0.55 : 1.0;
    if (r() > dens) continue;
    arv.add(x, h, z, (d < 60 ? 0.8 : 1.0) + r() * 0.5 + (d > 120 ? 0.4 : 0), undefined, d > 110);
    postas++;
  }
  arv.build(grupo);
  // arbustos espalhados e ao pé das casas
  for (let i = 0; i < (q === 'baixo' ? 120 : 320); i++) { const a = r() * 7, d = 15 + r() * 60, x = Math.cos(a) * d, z = Math.sin(a) * d + 4; if (!livre(x, z) && r() < 0.8) continue; ctx.arbustos.push({ m: M(x, altura(x, z) + 0.2, z, 0, r() * 6, 0, 1 + r() * 1.3, 0.8 + r() * 0.6, 1 + r() * 1.3), c: ['#5AA858', '#4E9A50', '#69B45C'][i % 3] }); }
  for (const c of casas) for (const s of [-1, 1]) ctx.arbustos.push({ m: c.L(s * (c.w / 2 + 0.6), 0.4, c.d / 2 - 0.4, 0, 0, 0, 1.3, 1.0, 1.1), c: '#4E9A50' });
  // flores silvestres e capim
  for (let i = 0; i < (q === 'baixo' ? 500 : 1800); i++) { const a = r() * 7, d = 14 + r() * 62, x = Math.cos(a) * d, z = Math.sin(a) * d + 4; if (distRio(x, z) < RIO_W / 2 + 1) continue; const cc = r(); ctx.flores.push({ m: M(x, altura(x, z) + 0.14, z, 0, 0, 0, 0.13 + r() * 0.08), c: cc < 0.4 ? '#FFFFFF' : cc < 0.75 ? P.ipe : '#B9A6E8' }); }
  const capim = new Instancias(new THREE.ConeGeometry(0.06, 0.6, 4).translate(0, 0.3, 0), addWind(new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.9 }), U, 0.18, -1), { cast: false });
  if (q !== 'baixo') for (let i = 0; i < 2600; i++) { const a = r() * 7, d = 14 + r() * 66, x = Math.cos(a) * d, z = Math.sin(a) * d + 4; if (!livre(x, z) && r() < 0.9) continue; const h = altura(x, z); for (let k = 0; k < 3; k++) capim.add(M(x + (r() - 0.5) * 0.3, h, z + (r() - 0.5) * 0.3, (r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5, 1, 0.6 + r() * 0.9, 1), r() < 0.5 ? '#6DB451' : '#86C35E'); }
  if (capim.l.length) grupo.add(capim.build());
  const flor = new Instancias(blobGeo(3, 0, 0.2), new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.6, emissive: '#fff', emissiveIntensity: 0.06 }), { cast: false });
  ctx.flores.forEach((f) => flor.add(f.m, f.c)); grupo.add(flor.build());
  const matArb = addRim(addWind(new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.85 }), U, 0.02, 0), '#FFF2B0', 0.28, 2.4);
  const arb = new Instancias(blobGeo(8, 1, 0.3), matArb); ctx.arbustos.forEach((f) => arb.add(f.m, f.c)); grupo.add(arb.build());
  const pet = new Instancias(new THREE.CircleGeometry(0.5, 6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.8 }), { cast: false }); ctx.petalas.forEach((f) => pet.add(f.m, f.c)); grupo.add(pet.build());

  // ---------- placas (palavras decodificáveis, Andika) ----------
  const placas = [
    [placaTex('ESCOLA', { icone: '✏️' }), esc.placa, 0, 4.4],
    [placaTex('LIVRO', { icone: '📖' }), bib.placa, Math.PI / 2, 4.0],
    [placaTex('PÃO', { icone: '🥖' }), pad.placa, -Math.PI / 2, 3.2],
  ];
  const matsPlaca = [];
  for (const [tex, p, ry, w] of placas) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 200 / 512), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: '#FFFFFF', emissiveMap: tex, emissiveIntensity: 0.05 })); m.position.copy(p); m.rotation.y = ry; grupo.add(m); matsPlaca.push(m.material); }
  { const L = F(14.6, 0, 13.0, -0.6); ctx.C.add(rbox(0.16, 1.6, 0.16, 0.05), P.madeira, L(0, 0.8, 0)); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.8), new THREE.MeshStandardMaterial({ map: placaTex('HORTA', { icone: '🥕' }), roughness: 0.6 })); m.position.copy(L.pt(0, 1.75, 0.1)); m.rotation.y = -0.6; grupo.add(m); }

  // ---------- montar lotes ----------
  const corpo = ctx.C.build(matCorpo); grupo.add(corpo);
  const folhas = ctx.Fo.build(matFolha); grupo.add(folhas);
  const janelas = ctx.J.build(matJanela, { cast: false }); grupo.add(janelas);
  const luzes = ctx.Lz.build(matLuz, { cast: false }); grupo.add(luzes);

  // fumaça da padaria
  const fumTex = radialTex('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
  const fumaca = [];
  for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumTex, transparent: true, depthWrite: false, opacity: 0.5 })); grupo.add(s); fumaca.push(s); }

  // ---------- personagens ----------
  const dupla = await criarSprite('dupla.png', 1.95, { fase: 0 }); dupla.position.set(-1.6, 0.05, 14.2); grupo.add(dupla);
  const sofia = await criarSprite('sofia.png', 1.8, { fase: 1.3 }); sofia.position.set(-2.6, 0.05, -18.2); grupo.add(sofia);
  const tales = await criarSprite('tales.png', 1.85, { fase: 2.1 }); tales.position.set(-24.2, 0.05, 22.6); grupo.add(tales);
  const bolota = criarBolota(); bolota.position.set(0.9, 0.05, 14.6); bolota.rotation.y = -2.0; grupo.add(bolota);
  const zum = criarZumZum(); grupo.add(zum);
  const bichos = criarBichinhos(grupo, { passaros: q === 'baixo' ? 4 : 10, borboletas: q === 'baixo' ? 5 : 14, centros: [new THREE.Vector3(-9.5, 0.6, -6), new THREE.Vector3(9.5, 0.6, 9), new THREE.Vector3(22, 0.6, 19), new THREE.Vector3(-21, 0.4, 22), new THREE.Vector3(-9.5, 0.6, 9)] });

  // ---------- portais de missão ----------
  const portais = [];
  for (const f of FASES_R0) {
    const p = criarPortal({ id: f.id, nome: f.nome, letra: f.letra, estado: estados[f.id] || 'bloqueada' });
    p.position.set(f.pos[0], altura(f.pos[0], f.pos[2]) + 0.02, f.pos[2]);
    p.userData.fase = f; grupo.add(p); portais.push(p);
  }

  // luzes pontuais da praça (só alto, só ao entardecer)
  const pontuais = [];
  if (q === 'alto') for (const p of [postes[1], postes[3], postes[5], postes[7]]) { const l = new THREE.PointLight('#FFC27A', 0, 16, 1.6); l.position.copy(p); grupo.add(l); pontuais.push(l); }

  const centroZum = new THREE.Vector3(0, 0, 1);
  const tint = new THREE.Color();
  return {
    grupo, POIS, portais, rio, altura,
    sprites: [dupla, sofia, tales],
    tick(t, cam, hora) {
      for (const s of [dupla, sofia, tales]) s.userData.tick(t, cam, tint.setRGB(1, lerp(1, 0.9, hora), lerp(1, 0.8, hora)));
      bolota.userData.tick(t); zum.userData.tick(t, centroZum); bichos.tick(t);
      for (const p of portais) p.userData.tick(t);
      barco.position.y = NIVEL_AGUA + 0.25 + Math.sin(t * 1.3) * 0.06; barco.rotation.z = Math.sin(t * 0.9) * 0.03; barco.rotation.x = Math.sin(t * 1.1) * 0.02;
      fumaca.forEach((s, i) => { const k = ((t * 0.12 + i / fumaca.length) % 1); s.position.set(pad.chamine.x + Math.sin(k * 6 + i) * 0.4 + k * 1.5, pad.chamine.y + k * 6, pad.chamine.z + k * 0.8); s.scale.setScalar(0.8 + k * 3.2); s.material.opacity = (1 - k) * 0.45 * smooth(Math.min(1, k * 6)); });
      // entardecer: janelas e postes acendem
      matJanela.emissiveIntensity = smooth(clamp((hora - 0.35) / 0.65, 0, 1)) * 1.6;
      matLuz.emissiveIntensity = 0.15 + smooth(clamp((hora - 0.3) / 0.7, 0, 1)) * 3.2;
      for (const l of pontuais) l.intensity = smooth(clamp((hora - 0.4) / 0.6, 0, 1)) * 26;
    },
  };
}
