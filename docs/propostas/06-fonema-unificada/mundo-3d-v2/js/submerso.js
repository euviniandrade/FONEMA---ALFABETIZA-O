// FONEMA · Mundo 3D v2 — o fundo do rio: peixinhos em cardume (boids simples), uma tartaruga, plantas que balançam
// com a correnteza, pedras, aguapés na beira e, quando a câmera mergulha, raios de luz e partículas na água.
// Tudo instanciado (uma malha por tipo). Os peixes nadam em "coordenadas do rio" (s = ao longo, u = de lado, y = altura),
// então nunca saem da água nem atravessam a margem, mesmo com o rio fazendo curva.
import * as THREE from 'three';
import { Lote, G, M, rng, blobGeo, clamp, lerp, smooth, radialTex } from './kit.js';
import { addCausticas } from './materiais.js';

const Q_SUB = {
  alto: { cardumes: 4, peixes: 16, plantas: 620, pedras: 150, raios: 12, part: 320 },
  medio: { cardumes: 3, peixes: 12, plantas: 360, pedras: 100, raios: 8, part: 200 },
  baixo: { cardumes: 2, peixes: 9, plantas: 160, pedras: 60, raios: 0, part: 90 },
};
const CORES_PEIXE = [['#B9D3E2', '#F2B33D'], ['#F4A340', '#F7D36A'], ['#9FC7A8', '#E8E8D8'], ['#D8C4F0', '#9FD0EA']];

/** Rio "esticado": ponto, tangente e lado a partir do comprimento s. */
function canal(pts) {
  const n = pts.length, acc = new Float32Array(n);
  for (let i = 1; i < n; i++) acc[i] = acc[i - 1] + pts[i].distanceTo(pts[i - 1]);
  const L = acc[n - 1], ds = L / (n - 1);
  const _t = new THREE.Vector2();
  function quadro(s, out) {
    const f = clamp(s / ds, 0, n - 1.001), i = Math.floor(f), k = f - i;
    const a = pts[i], b = pts[i + 1];
    out.x = lerp(a.x, b.x, k); out.z = lerp(a.y, b.y, k);
    _t.set(b.x - a.x, b.y - a.y).normalize(); out.tx = _t.x; out.tz = _t.y; out.nx = -_t.y; out.nz = _t.x;
    return out;
  }
  let dica = 0;
  /** mundo (x, z) -> { s, u } (busca local a partir da última resposta). */
  function paraCanal(x, z) {
    let best = dica, bd = 1e18;
    const busca = (i0, i1) => { for (let i = Math.max(0, i0); i <= Math.min(n - 1, i1); i++) { const dx = pts[i].x - x, dz = pts[i].y - z, q = dx * dx + dz * dz; if (q < bd) { bd = q; best = i; } } };
    busca(dica - 12, dica + 12); if (best === dica - 12 || best === dica + 12 || bd > 400) busca(0, n - 1);
    dica = best; const q = quadro(best * ds, {}); return { s: best * ds + (x - q.x) * q.tx + (z - q.z) * q.tz, u: (x - q.x) * q.nx + (z - q.z) * q.nz, d2: bd };
  }
  /** s onde o rio passa mais perto do ponto z (para escolher o trecho visitável). */
  function sEmZ(z) { let bi = 0, bd = 1e9; for (let i = 0; i < n; i++) { const d = Math.abs(pts[i].y - z); if (d < bd) { bd = d; bi = i; } } return bi * ds; }
  return { L, ds, quadro, paraCanal, sEmZ };
}

function peixeGeo() {
  const L = new Lote(9);
  L.add(G.sph, '#FFFFFF', M(0, 0, 0, 0, 0, 0, 0.085, 0.12, 0.3), { top: '#5E6A78', jit: 0 });
  L.add(G.cone, '#C8C8C8', M(0, 0, -0.2, Math.PI / 2, 0, 0, 0.018, 0.13, 0.17), { jit: 0 });
  L.add(G.cone, '#9AA0A8', M(0, 0.07, -0.02, 0.5, 0, 0, 0.012, 0.09, 0.08), { jit: 0 });
  for (const s of [-1, 1]) L.add(G.sphLo, '#151515', M(s * 0.034, 0.018, 0.095, 0, 0, 0, 0.024), { jit: 0 });
  return L.geometry();
}
function tartaruga() {
  const L = new Lote(4);
  L.add(G.sph, '#56663A', M(0, 0.06, 0, 0, 0, 0, 0.56, 0.24, 0.7), { top: '#7C8C4E', jit: 0 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; L.add(G.sphLo, '#8E9C5C', M(Math.cos(a) * 0.15, 0.16, Math.sin(a) * 0.19, 0, 0, 0, 0.14, 0.05, 0.14), { jit: 0.06 }); }
  L.add(G.sph, '#D9C98C', M(0, -0.02, 0, 0, 0, 0, 0.5, 0.09, 0.62), { jit: 0 });
  L.add(G.sph, '#7C8A50', M(0, 0.04, 0.42, 0, 0, 0, 0.18, 0.15, 0.22), { jit: 0 });
  L.add(G.sph, '#E7D9A0', M(0, -0.01, 0.43, 0, 0, 0, 0.13, 0.08, 0.17), { jit: 0 });
  for (const s of [-1, 1]) L.add(G.sphLo, '#151515', M(s * 0.06, 0.08, 0.5, 0, 0, 0, 0.035), { jit: 0 });
  L.add(G.cone, '#7C8A50', M(0, 0.02, -0.4, -Math.PI / 2, 0, 0, 0.06, 0.12, 0.05), { jit: 0 });
  return L;
}
function aguapeGeo() { return new THREE.CircleGeometry(0.5, 18, 0.25, Math.PI * 2 - 0.5).rotateX(-Math.PI / 2); }
function florAguaGeo() {
  const L = new Lote(6);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; L.add(G.sphLo, '#FFFFFF', M(Math.cos(a) * 0.2, 0.1, Math.sin(a) * 0.2, 0, -a, 0.75, 0.32, 0.08, 0.15), { top: '#F6C6DA', jit: 0 }); }
  L.add(G.sphLo, '#F7C948', M(0, 0.1, 0, 0, 0, 0, 0.16, 0.1, 0.16), { jit: 0 });
  return L.geometry();
}

export function criarSubmerso({ vila, U, q = 'medio', menos = false }) {
  const { RIO_PTS, RIO_W, NIVEL_AGUA: NIVEL, fundoRio } = vila;
  const C = canal(RIO_PTS);
  const QM = Q_SUB.alto, r = rng(321);
  const grupo = new THREE.Group(); grupo.name = 'submerso';
  // trecho visitável do rio (da ponte até depois do cais)
  const s0 = Math.min(C.sEmZ(-58), C.sEmZ(62)), s1 = Math.max(C.sEmZ(-58), C.sEmZ(62));
  const UMAX = 4.1; // até onde os peixes vão de lado (a beirinha rasa fica para o boneco)
  const prof = (u) => NIVEL - fundoRio(u);
  const _q = {}, _o = new THREE.Object3D(), _d = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1);
  const mundoDe = (s, u, y, out = new THREE.Vector3()) => { C.quadro(s, _q); return out.set(_q.x + _q.nx * u, y, _q.z + _q.nz * u); };
  const proibido = (x, z) => (x < 50 && z > 3.5 && z < 15.5) || Math.abs(z + 46) < 3.2; // cais, barquinho e ponte

  // ---------- pedras e plantas do fundo ----------
  const matPedra = addCausticas(new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.92 }), U);
  const pedras = new THREE.InstancedMesh(blobGeo(41, 1, 0.38), matPedra, QM.pedras);
  const CORES_PEDRA = ['#8C8577', '#7A7468', '#A59C8A', '#6B6E62', '#958B78'];
  for (let i = 0; i < QM.pedras; i++) {
    const s = lerp(s0, s1, r()), u = (r() * 2 - 1) * (r() < 0.7 ? 4.4 : 2.5), sc = 0.12 + Math.pow(r(), 2.2) * 0.75;
    const p = mundoDe(s, u, fundoRio(u) + sc * 0.12);
    _o.position.copy(p); _o.rotation.set(r() * 0.5, r() * 6, r() * 0.5); _o.scale.set(sc * (1 + r() * 0.6), sc * (0.5 + r() * 0.4), sc * (1 + r() * 0.5)); _o.updateMatrix();
    pedras.setMatrixAt(i, _o.matrix); pedras.setColorAt(i, new THREE.Color(CORES_PEDRA[i % CORES_PEDRA.length]));
  }
  pedras.receiveShadow = true; pedras.castShadow = false; pedras.computeBoundingSphere(); grupo.add(pedras);

  const fita = new THREE.PlaneGeometry(0.07, 1, 1, 6).translate(0, 0.5, 0);
  const matPlanta = addCausticas(new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.75, side: THREE.DoubleSide }), U);
  { const prev = matPlanta.onBeforeCompile;
    matPlanta.onBeforeCompile = (sh, rr) => { prev(sh, rr); sh.uniforms.uTempoP = U.time;
      sh.vertexShader = 'uniform float uTempoP;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        { float k = position.y; float fi = float(gl_InstanceID) * 0.73;
          transformed.x += (sin(uTempoP * 1.25 + fi + k * 2.2) * 0.16 + sin(uTempoP * 2.7 + fi * 1.7) * 0.04) * k * k;
          transformed.z += cos(uTempoP * 0.95 + fi * 1.3 + k * 1.6) * 0.1 * k * k; }`); };
    const k0 = matPlanta.customProgramCacheKey(); matPlanta.customProgramCacheKey = () => k0 + 'plantaSub'; }
  const plantas = new THREE.InstancedMesh(fita, matPlanta, QM.plantas);
  const VERDES = ['#4E9A47', '#5DAA4E', '#3F8A52', '#6FB65A', '#7DBE5C', '#4C8F6E'];
  { let i = 0;
    while (i < QM.plantas) {
      const sC = lerp(s0, s1, r()), uC = (r() * 2 - 1) * 4.3, nT = 6 + Math.floor(r() * 14);
      for (let k = 0; k < nT && i < QM.plantas; k++, i++) {
        const s = sC + (r() - 0.5) * 1.6, u = clamp(uC + (r() - 0.5) * 1.2, -4.5, 4.5);
        const p = mundoDe(s, u, fundoRio(u) - 0.05), H = Math.min(prof(u) - 0.3, 0.45 + r() * 1.5);
        if (proibido(p.x, p.z) || H < 0.25) { k--; i--; continue; }
        _o.position.copy(p); _o.rotation.set((r() - 0.5) * 0.25, r() * 6, (r() - 0.5) * 0.25); _o.scale.set(0.7 + r() * 0.9, H, 1); _o.updateMatrix();
        plantas.setMatrixAt(i, _o.matrix); plantas.setColorAt(i, new THREE.Color(VERDES[(i * 7) % VERDES.length]));
      }
    }
  }
  plantas.frustumCulled = false; plantas.receiveShadow = true; grupo.add(plantas);

  // ---------- aguapés na beira (com algumas flores) ----------
  const matAguape = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.55, side: THREE.DoubleSide });
  const NAG = 70, aguapes = new THREE.InstancedMesh(aguapeGeo(), matAguape, NAG), flAg = [];
  { let i = 0, tent = 0;
    while (i < NAG && tent++ < 2000) {
      const sC = lerp(s0, s1, r()), lado = r() < 0.5 ? -1 : 1, n = 3 + Math.floor(r() * 5);
      for (let k = 0; k < n && i < NAG; k++) {
        const s = sC + (r() - 0.5) * 2.2, u = lado * (4.7 + r() * 0.9), p = mundoDe(s, u, NIVEL + 0.012 + r() * 0.006);
        if (proibido(p.x, p.z)) continue;
        const sc = 0.45 + r() * 0.5; _o.position.copy(p); _o.rotation.set(0, r() * 6, 0); _o.scale.set(sc, 1, sc); _o.updateMatrix();
        aguapes.setMatrixAt(i, _o.matrix); aguapes.setColorAt(i, new THREE.Color(r() < 0.5 ? '#5FA84E' : '#6FB65A'));
        if (r() < 0.22) flAg.push({ p: p.clone(), sc: 0.5 + r() * 0.3, a: r() * 6 });
        i++;
      }
    }
    aguapes.count = i;
  }
  aguapes.receiveShadow = true; aguapes.computeBoundingSphere(); grupo.add(aguapes);
  const flores = new THREE.InstancedMesh(florAguaGeo(), new THREE.MeshStandardMaterial({ color: '#fff', vertexColors: true, roughness: 0.5, emissive: '#fff', emissiveIntensity: 0.05 }), Math.max(1, flAg.length));
  flAg.forEach((f, i) => { _o.position.copy(f.p).setY(NIVEL + 0.02); _o.rotation.set(0, f.a, 0); _o.scale.setScalar(f.sc); _o.updateMatrix(); flores.setMatrixAt(i, _o.matrix); });
  flores.count = flAg.length; flores.computeBoundingSphere(); grupo.add(flores);

  // ---------- peixinhos ----------
  const matPeixe = addCausticas(new THREE.MeshStandardMaterial({ color: '#fff', vertexColors: true, roughness: 0.32, metalness: 0.28 }), U);
  { const prev = matPeixe.onBeforeCompile;
    matPeixe.onBeforeCompile = (sh, rr) => { prev(sh, rr); sh.uniforms.uTempoF = U.time;
      sh.vertexShader = 'uniform float uTempoF;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        { float rabo = smoothstep(0.08, -0.3, position.z);
          transformed.x += sin(uTempoF * 12.0 + float(gl_InstanceID) * 1.9 - position.z * 9.0) * (0.012 + 0.05 * rabo); }`); };
    const k0 = matPeixe.customProgramCacheKey(); matPeixe.customProgramCacheKey = () => k0 + 'peixe'; }
  const NMAX = QM.cardumes * QM.peixes;
  const peixes = new THREE.InstancedMesh(peixeGeo(), matPeixe, NMAX);
  peixes.frustumCulled = false; peixes.castShadow = false; grupo.add(peixes);
  const cardumes = [], bichos = [];
  for (let c = 0; c < QM.cardumes; c++) {
    const sc = lerp(s0 + 8, s1 - 8, (c + 0.5) / QM.cardumes);
    const cd = { s: sc, u: 0, y: NIVEL - prof(0) * 0.55, vs: (r() < 0.5 ? -1 : 1) * 0.5, fase: r() * 10, cor: CORES_PEIXE[c % CORES_PEIXE.length], tam: 0.8 + r() * 0.5 };
    cardumes.push(cd);
    for (let k = 0; k < QM.peixes; k++) {
      const b = { c, s: cd.s + (r() - 0.5) * 2, u: (r() - 0.5) * 2, y: cd.y + (r() - 0.5) * 0.6, vs: cd.vs, vu: 0, vy: 0, tam: cd.tam * (0.75 + r() * 0.5) };
      bichos.push(b); peixes.setColorAt(bichos.length - 1, new THREE.Color(k % 5 === 0 ? cd.cor[1] : cd.cor[0]));
    }
  }

  // ---------- tartaruga ----------
  const matTart = addCausticas(new THREE.MeshStandardMaterial({ color: '#fff', vertexColors: true, roughness: 0.6 }), U);
  const tart = new THREE.Group(); tart.add(tartaruga().build(matTart, { cast: false }));
  const nadadeiras = [];
  for (const [x, z, f] of [[-0.3, 0.22, 1], [0.3, 0.22, 1], [-0.24, -0.26, 0.6], [0.24, -0.26, 0.6]]) {
    const piv = new THREE.Group(); piv.position.set(x, 0, z);
    const m = new THREE.Mesh(G.sphLo, matTart); m.scale.set(0.34 * f, 0.05, 0.15 * f); m.position.x = Math.sign(x) * 0.15 * f;
    const cor = new THREE.BufferAttribute(new Float32Array(G.sphLo.attributes.position.count * 3).fill(0.42), 3);
    const g2 = G.sphLo.clone(); g2.setAttribute('color', cor); m.geometry = g2;
    piv.add(m); tart.add(piv); nadadeiras.push(piv);
  }
  tart.scale.setScalar(1.15); grupo.add(tart);
  const tartS = { s: lerp(s0, s1, 0.42), dir: 1 };

  // ---------- só quando a câmera mergulha: raios de luz, partículas e bolhas ----------
  const matRaio = new THREE.ShaderMaterial({
    uniforms: { uTime: U.time, uCor: { value: new THREE.Color('#E8FFF6') }, uForca: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; varying float vDist; void main(){ vUv = uv; vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); vDist = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform float uTime, uForca; uniform vec3 uCor; varying vec2 vUv; varying float vDist;
      void main(){ float lado = 1.0 - abs(vUv.x - 0.5) * 2.0; float a = pow(lado, 2.2) * smoothstep(0.0, 0.85, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
        a *= 0.55 + 0.45 * sin(vUv.x * 9.0 + uTime * 0.8) * sin(vUv.x * 4.0 - uTime * 0.5);
        a *= smoothstep(16.0, 4.0, vDist) * smoothstep(0.3, 1.5, vDist) * uForca;
        gl_FragColor = vec4(uCor * a * 0.22, 1.0); }`,
  });
  const raios = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 1, 1, 1).translate(0, 0.5, 0), matRaio, QM.raios * 2);
  raios.frustumCulled = false; raios.visible = false; raios.renderOrder = 3; raios.userData.camada1 = true; grupo.add(raios);
  const raiosPos = []; let raiosCentro = null;

  const NP = QM.part, ppos = new Float32Array(NP * 3), pBase = [];
  for (let i = 0; i < NP; i++) pBase.push([r(), r(), r(), r()]);
  const geoP = new THREE.BufferGeometry(); geoP.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  const matP = new THREE.PointsMaterial({ map: radialTex('rgba(240,255,250,0.9)', 'rgba(240,255,250,0)', 64), size: 0.06, transparent: true, depthWrite: false, opacity: 0.7, color: '#DDF6EE' });
  const part = new THREE.Points(geoP, matP); part.frustumCulled = false; part.visible = false; part.renderOrder = 4;
  const NB = 26, bpos = new Float32Array(NB * 3), bolhas = [];
  for (let i = 0; i < NB; i++) bolhas.push({ t: r() * 3, dx: (r() - 0.5) * 0.25, dz: (r() - 0.5) * 0.25, v: 0.5 + r() * 0.5 });
  const geoB = new THREE.BufferGeometry(); geoB.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
  const bol = new THREE.Points(geoB, new THREE.PointsMaterial({ map: radialTex('rgba(255,255,255,0.0)', 'rgba(255,255,255,0.95)', 64), size: 0.09, transparent: true, depthWrite: false, color: '#F2FFFF' }));
  bol.frustumCulled = false; bol.visible = false; bol.renderOrder = 4;
  grupo.add(part, bol);
  grupo.traverse((m) => { if (m.isPoints) m.userData.camada1 = true; });

  // ---------- quantos de cada (qualidade) ----------
  let Qn = Q_SUB[q] || Q_SUB.medio;
  function qualidade(nq) {
    Qn = Q_SUB[nq] || Q_SUB.medio; q = nq;
    plantas.count = Qn.plantas; pedras.count = Qn.pedras;
    peixes.count = Math.min(NMAX, Qn.cardumes * QM.peixes);
    raios.count = Qn.raios * 2;
    geoP.setDrawRange(0, Qn.part);
  }
  qualidade(q);

  // ---------- boids ----------
  const _w = new THREE.Vector3(), _v = new THREE.Vector3();
  let fugir = null;
  function passoPeixes(dt, t) {
    const nPeixes = peixes.count;
    for (const cd of cardumes) { // o cardume passeia rio acima e abaixo, de um lado para o outro e em alturas diferentes
      cd.s += cd.vs * dt; if (cd.s < s0 + 6) cd.vs = Math.abs(cd.vs); if (cd.s > s1 - 6) cd.vs = -Math.abs(cd.vs);
      cd.u = Math.sin(t * 0.13 + cd.fase) * 2.6;
      cd.y = NIVEL - prof(cd.u) * (0.45 + 0.2 * Math.sin(t * 0.21 + cd.fase));
    }
    for (let i = 0; i < nPeixes; i++) {
      const b = bichos[i], cd = cardumes[b.c];
      let as = 0, au = 0, ay = 0, ss = 0, su = 0, sy = 0, cs = 0, cu = 0, cy = 0, n = 0;
      const ini = b.c * QM.peixes, fim = Math.min(nPeixes, ini + QM.peixes);
      for (let j = ini; j < fim; j++) {
        if (j === i) continue; const o = bichos[j];
        const ds = o.s - b.s, du = o.u - b.u, dy = o.y - b.y, d2 = ds * ds + du * du + dy * dy;
        if (d2 > 2.2) continue;
        n++; as += o.vs; au += o.vu; ay += o.vy; cs += ds; cu += du; cy += dy;
        if (d2 < 0.09) { const k = 1 / Math.max(d2, 0.004); ss -= ds * k; su -= du * k; sy -= dy * k; }
      }
      let fs = (cd.s - b.s) * 0.35 + cd.vs * 0.6, fu = (cd.u - b.u) * 0.6, fy = (cd.y - b.y) * 0.9;
      if (n) { fs += (as / n - b.vs) * 1.2 + cs / n * 0.5 + ss * 0.012; fu += (au / n - b.vu) * 1.2 + cu / n * 0.5 + su * 0.012; fy += (ay / n - b.vy) * 0.8 + cy / n * 0.3 + sy * 0.008; }
      // paredes do rio: margem, fundo e superfície
      const lim = UMAX; if (b.u > lim) fu -= (b.u - lim) * 6; if (b.u < -lim) fu -= (b.u + lim) * 6;
      const chao = fundoRio(b.u) + 0.28, teto = NIVEL - 0.22;
      if (b.y < chao + 0.2) fy += (chao + 0.2 - b.y) * 6; if (b.y > teto - 0.15) fy -= (b.y - teto + 0.15) * 6;
      // a criança chegou perto: o cardume se espalha e volta depois
      if (fugir) { const ds = b.s - fugir.s, du = b.u - fugir.u, dy = b.y - fugir.y, d2 = ds * ds + du * du + dy * dy; if (d2 < 4.5) { const k = (4.5 - d2) * 1.6 / Math.sqrt(d2 + 0.05); fs += ds * k; fu += du * k; fy += dy * k * 0.5; } }
      b.vs += fs * dt; b.vu += fu * dt; b.vy += fy * dt;
      const sp = Math.hypot(b.vs, b.vu, b.vy), vmax = fugir ? 2.4 : 1.5, vmin = 0.35;
      if (sp > vmax) { const k = vmax / sp; b.vs *= k; b.vu *= k; b.vy *= k; } else if (sp < vmin && sp > 1e-4) { const k = vmin / sp; b.vs *= k; b.vu *= k; b.vy *= k; }
      b.s += b.vs * dt; b.u += b.vu * dt; b.y += b.vy * dt;
      b.u = clamp(b.u, -4.6, 4.6); b.y = clamp(b.y, fundoRio(b.u) + 0.12, NIVEL - 0.12);
      // matriz no mundo
      C.quadro(b.s, _q);
      _w.set(_q.x + _q.nx * b.u, b.y, _q.z + _q.nz * b.u);
      _v.set(_q.tx * b.vs + _q.nx * b.vu, b.vy * 0.6, _q.tz * b.vs + _q.nz * b.vu).normalize();
      _o.position.copy(_w); _o.quaternion.setFromUnitVectors(_z, _v); _o.scale.setScalar(b.tam); _o.updateMatrix();
      peixes.setMatrixAt(i, _o.matrix);
    }
    peixes.instanceMatrix.needsUpdate = true;
  }
  function passoTartaruga(dt, t) {
    tartS.s += tartS.dir * dt * 0.32; if (tartS.s > s1 - 10) tartS.dir = -1; if (tartS.s < s0 + 10) tartS.dir = 1;
    const u = Math.sin(t * 0.07) * 2.2, y = fundoRio(u) + 0.55 + Math.sin(t * 0.5) * 0.18;
    mundoDe(tartS.s, u, y, tart.position);
    C.quadro(tartS.s, _q); const du = Math.cos(t * 0.07) * 2.2 * 0.07;
    _v.set(_q.tx * tartS.dir * 0.32 + _q.nx * du, Math.cos(t * 0.5) * 0.09 * 0.5, _q.tz * tartS.dir * 0.32 + _q.nz * du).normalize();
    tart.quaternion.setFromUnitVectors(_z, _v);
    const bat = menos ? 0.1 : Math.sin(t * 1.6);
    nadadeiras.forEach((p, i) => { const s = i % 2 ? 1 : -1, tras = i > 1; p.rotation.z = s * (tras ? 0.15 : 0.45) * bat; p.rotation.y = s * (tras ? 0.2 : 0.35) * bat; });
  }

  // ---------- raios e partículas em volta da câmera ----------
  function posicionarRaios(cam) {
    const pc = C.paraCanal(cam.x, cam.z);
    raiosCentro = cam.clone(); raiosPos.length = 0;
    for (let i = 0; i < Qn.raios; i++) {
      const s = pc.s + (r() - 0.5) * 22, u = (r() * 2 - 1) * 3.8, fy = fundoRio(u);
      raiosPos.push({ p: mundoDe(s, u, fy), h: NIVEL - fy + 0.05, larg: 0.6 + r() * 1.6, a: r() * 3 });
    }
    raiosPos.forEach((rp, i) => {
      for (let k = 0; k < 2; k++) {
        _o.position.copy(rp.p); _o.rotation.set(0.18, rp.a + k * Math.PI / 2, 0.12); _o.scale.set(rp.larg, rp.h * 1.06, 1); _o.updateMatrix();
        raios.setMatrixAt(i * 2 + k, _o.matrix);
      }
    });
    raios.instanceMatrix.needsUpdate = true;
  }
  function passoParticulas(dt, t, cam, pe) {
    const T = 9, base = [cam.x - T / 2, cam.y - T / 2, cam.z - T / 2];
    for (let i = 0; i < Qn.part; i++) {
      const b = pBase[i];
      const x = base[0] + (((b[0] * T + t * 0.05 * (b[3] - 0.5) - base[0]) % T) + T) % T;
      const y = base[1] + (((b[1] * T + t * 0.04 * b[3] - base[1]) % T) + T) % T;
      const z = base[2] + (((b[2] * T + t * 0.03 - base[2]) % T) + T) % T;
      ppos[i * 3] = x; ppos[i * 3 + 1] = Math.min(y, NIVEL - 0.05); ppos[i * 3 + 2] = z;
    }
    geoP.attributes.position.needsUpdate = true;
    if (pe) {
      for (let i = 0; i < NB; i++) {
        const b = bolhas[i]; b.t += dt * b.v; const ciclo = 2.6; if (b.t > ciclo) b.t -= ciclo;
        const y = pe.y + b.t * 0.9; const vis = y < NIVEL - 0.02;
        bpos[i * 3] = pe.x + b.dx + Math.sin(b.t * 7 + i) * 0.05; bpos[i * 3 + 1] = vis ? y : -999; bpos[i * 3 + 2] = pe.z + b.dz;
      }
      geoB.attributes.position.needsUpdate = true;
    }
  }

  let visivel = true, submerso = false, forcaRaios = 0;
  return {
    grupo, nivel: NIVEL, canal: C,
    qualidade,
    /** Liga/desliga o que só existe com a câmera dentro d'água. */
    definirSubmerso(on) { submerso = on; part.visible = on; bol.visible = on; },
    /** dentro do rio? (x, z) -> distância lateral ao meio (m) e s; útil para o mergulho */
    noCanal: (x, z) => C.paraCanal(x, z),
    tick(dt, t, camera, pe) {
      // longe do rio não desenha nem calcula nada
      const pc = C.paraCanal(camera.position.x, camera.position.z);
      const perto = Math.abs(pc.u) < 60 && pc.s > s0 - 50 && pc.s < s1 + 50;
      if (perto !== visivel) { visivel = perto; grupo.visible = perto; }
      if (!visivel) return;
      if (pe) { const pp = C.paraCanal(pe.x, pe.z); fugir = Math.abs(pp.u) < RIO_W / 2 + 0.5 && pe.y < NIVEL + 0.4 ? { s: pp.s, u: pp.u, y: pe.y } : null; } else fugir = null;
      passoPeixes(Math.min(dt, 0.05), t); passoTartaruga(Math.min(dt, 0.05), t);
      // aguapés boiando
      aguapes.position.y = Math.sin(t * 1.1) * 0.012; flores.position.y = aguapes.position.y;
      forcaRaios = lerp(forcaRaios, submerso ? 1 : 0, Math.min(1, dt * 3));
      raios.visible = forcaRaios > 0.02 && Qn.raios > 0; matRaio.uniforms.uForca.value = forcaRaios;
      if (raios.visible && (!raiosCentro || raiosCentro.distanceTo(camera.position) > 7)) posicionarRaios(camera.position);
      if (submerso) passoParticulas(dt, t, camera.position, pe && pe.y < NIVEL ? pe : null);
    },
  };
}
