/* FONEMA · Espelho do Som (v3) — MODELO 3D da cabeça e da boca, todo procedural (sem imagens).
 *
 * Um único modelo articulado, montado duas vezes:
 *   modo 'frente' → pele opaca, lábios brilhantes, dentes, língua e o fundo escuro da boca (close de animação);
 *   modo 'lado'   → a MESMA cabeça em "gelatina" translúcida, com as peças coloridas por dentro: céu da boca,
 *                   véu, língua, dentes, caminho do ar (boca e nariz) e a caixinha da voz na garganta.
 * As duas vistas recebem a mesma pose a cada quadro, por isso andam sempre juntas.
 *
 * Coordenadas (as de fonemas.js): rosto olhando para +z, y para cima, x para os lados; unidade ≈ 1 cm de criança.
 * Origem = meio da boca, entre os lábios.
 */
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const gauss = (d, s) => Math.exp(-(d * d) / (s * s));

export const CORES = {
  sofia: { pele: 0xd39e78, peleSombra: 0xa9704f, labio: 0xdb5f72, blush: 0xe8857c },
  tales: { pele: 0xf2c3a2, peleSombra: 0xd99c7c, labio: 0xe8707f, blush: 0xf59a94 },
  lingua: 0xf2607c, linguaPonta: 0xff8fa0, gengiva: 0xf58a9c, ceu: 0xf7a48f, veu: 0xd9508a, dente: 0xfffdf6,
  fundo: 0x4a1024, fundoBorda: 0x8c2a3e, via: 0xf2fbff, voz: 0xffb629, vozOff: 0xb9c2d6,
  vidro: 0xcfeaff, vidroBorda: 0x4aa8ee
};

/* ---------- formato da cabeça: elipsoide com nariz, bochechas e queixo ---------- */
const C = [0, 2.2, -5.0]; // centro da cabeça (cabeça pequena para a boca ficar grande: proporção de desenho animado)
export const PESC = { z: -4.9, yTopo: -2.4, r0: 2.15, r1: 2.6, alt: 7 }; // pescoço
const R0 = Math.hypot(C[1], C[2]);
const D0 = [0, -C[1] / R0, -C[2] / R0]; // do centro para a boca
const E1 = [1, 0, 0];
const E2 = [0, D0[2], -D0[1]]; // "para cima" sobre a superfície
const RX = 5.3, RY = 5.9, RZ = 5.7;
const ELIP0 = 1 / Math.sqrt((D0[1] / RY) ** 2 + (D0[2] / RZ) ** 2);
const ESC = (R0 + 0.14) / ELIP0; // a pele passa 0,14 à frente da origem (os lábios ficam à frente dos dentes)

// direção (a partir do centro) de um ponto (u,v) em cm sobre a pele, medido a partir da boca
function direcao(u, v, o) {
  const r = Math.hypot(u, v), a = r / R0, ca = Math.cos(a), sa = r > 1e-6 ? Math.sin(a) / r : 0;
  o[0] = ca * D0[0] + sa * (u * E1[0] + v * E2[0]);
  o[1] = ca * D0[1] + sa * (u * E1[1] + v * E2[1]);
  o[2] = ca * D0[2] + sa * (u * E1[2] + v * E2[2]);
  return o;
}
const dirDe = (u, v) => direcao(u, v, [0, 0, 0]);
const NARIZ = dirDe(0, 1.72), NARIZ2 = dirDe(0, 2.5), QUEIXO = [0, 0, 0], BOCH_E = dirDe(-2.75, 0.6), BOCH_D = dirDe(2.75, 0.6);
const NAR_E = dirDe(-0.5, 1.42), NAR_D = dirDe(0.5, 1.42);
const ang2 = (d, e) => { const c = clamp(d[0] * e[0] + d[1] * e[1] + d[2] * e[2], -1, 1); return 2 * (1 - c); }; // ≈ ângulo²

function raio(d, queixo) {
  // mandíbula mais estreita embaixo (rosto de criança): encolhe o raio em x conforme desce
  const baixo = sm((-d[1] - 0.05) / 0.8);
  const rx = RX * (1 - 0.1 * baixo);
  let r = ESC / Math.sqrt((d[0] / rx) ** 2 + (d[1] / RY) ** 2 + (d[2] / RZ) ** 2);
  r += 0.92 * Math.exp(-ang2(d, NARIZ) / 0.016) + 0.22 * Math.exp(-ang2(d, NARIZ2) / 0.03);
  r += 0.22 * (Math.exp(-ang2(d, NAR_E) / 0.008) + Math.exp(-ang2(d, NAR_D) / 0.008));
  r += 0.34 * (Math.exp(-ang2(d, BOCH_E) / 0.16) + Math.exp(-ang2(d, BOCH_D) / 0.16));
  r += 0.85 * Math.exp(-ang2(d, queixo) / 0.11);
  return r;
}

/** Abertura dos lábios no meio: quanto o de cima sobe (hu) e o de baixo desce (hl), em cm. O de baixo acompanha a mandíbula. */
export function abertura(p) {
  const J = 5.4 * Math.sin((p.jaw * Math.PI) / 180);
  const hu = mix(Math.min(0.36 * p.ab, 0.5), 0.46, p.ld);
  const hl = mix(p.ab < 0.02 ? 0.64 * p.ab : Math.max(0.64 * p.ab, Math.min(J - 0.28, p.ab * 1.1)), -0.15, p.ld);
  return { hu, hl, J, dy: -(p.dy || 0) };
}

/* ---------- contorno da boca (u,v em cm) para um ângulo th: borda de dentro, borda de fora e volume do lábio ---------- */
function contorno(p, th, o, A) {
  const c = Math.cos(th), s = Math.sin(th), ac = Math.abs(c), as = Math.abs(s), cima = s >= 0, sg = clamp(s * 9, -1, 1);
  const arr = p.arr, ld = p.ld;
  const { hu, hl, dy } = A; // F/V: o lábio de baixo sobe até os dentes de cima
  const w = Math.max(0.2, p.lg);
  const pb = mix(1.75, 1.0, arr);
  const sorriso = (0.05 + 0.2 * clamp((p.lg - 1.02) / 0.3)) * (1 - arr);
  const vin = (cima ? hu : -hl) * Math.pow(as, pb) + sorriso * Math.pow(ac, 2.6) - 0.15 * sorriso + dy;
  const cai = mix(Math.pow(as, 0.72), 1, 0.5 * arr);
  const estica = Math.pow(1.05 / w, 0.12) * (1 + 0.12 * arr);
  let T;
  if (cima) T = 0.4 * estica * ((1 - 0.24 * gauss(c, 0.15)) + 0.12 * gauss(ac - 0.34, 0.17));
  else T = 0.55 * estica * (1 - 0.3 * ld);
  T = T * cai + 0.035;
  o.ui = w * c; o.vi = vin;
  o.uo = (w + 0.11 + arr * 0.42) * c; o.vo = vin + sg * T * (1 - 0.25 * arr * ac);
  o.B = (cima ? 0.3 : 0.38) * (1 + 0.55 * arr) * (0.22 + 0.78 * cai);
  o.cima = cima; o.cai = cai;
  return o;
}

/* ---------- geometria utilitária ---------- */
// "caixa macia": superelipsoide (dente, peças arredondadas)
function superelipsoide(THREE, a, b, c, e = 0.6, sw = 18, sh = 12) {
  const g = new THREE.SphereGeometry(1, sw, sh), P = g.attributes.position, N = g.attributes.normal;
  const f = (v) => Math.sign(v) * Math.pow(Math.abs(v), e), fn = (v) => Math.sign(v) * Math.pow(Math.abs(v), 2 - e);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    P.setXYZ(i, a * f(x), b * f(y), c * f(z));
    const nx = fn(x) / a, ny = fn(y) / b, nz = fn(z) / c, l = Math.hypot(nx, ny, nz) || 1;
    N.setXYZ(i, nx / l, ny / l, nz / l);
  }
  return g;
}

// Catmull-Rom 2D (z,y) uniforme, com pontas repetidas
function spline2(pts, n, out) {
  const m = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * m, k = Math.min(m - 1, Math.floor(t)), f = t - k;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(m, k + 2)];
    const f2 = f * f, f3 = f2 * f;
    for (let d = 0; d < 2; d++) {
      out[i * 2 + d] = 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * f + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * f2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * f3);
    }
  }
  return out;
}

// tubo ao longo de uma curva no plano do meio (z,y), com seção oval (meia-largura em x, meia-espessura no plano)
function criaFita(THREE, n, k) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * k * 3 + 6), 3));
  const idx = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < k; j++) {
    const a = i * k + j, b = i * k + ((j + 1) % k), c = a + k, d = b + k;
    idx.push(a, c, b, b, c, d);
  }
  const t0 = n * k, t1 = n * k + 1; // tampas
  for (let j = 0; j < k; j++) { idx.push(t0, j, (j + 1) % k); idx.push(t1, (n - 1) * k + ((j + 1) % k), (n - 1) * k + j); }
  g.setIndex(idx);
  return g;
}
function atualizaFita(g, linha, n, k, largura, espessura, exp = 0.7) {
  const P = g.attributes.position.array;
  for (let i = 0; i < n; i++) {
    const z = linha[i * 2], y = linha[i * 2 + 1];
    const ia = Math.max(0, i - 1), ib = Math.min(n - 1, i + 1);
    let tz = linha[ib * 2] - linha[ia * 2], ty = linha[ib * 2 + 1] - linha[ia * 2 + 1];
    const l = Math.hypot(tz, ty) || 1; tz /= l; ty /= l;
    const nz = -ty, ny = tz; // normal no plano (para "cima" quando a curva vai para trás… o sinal não importa)
    const f = i / (n - 1), w = largura(f), e = espessura(f);
    for (let j = 0; j < k; j++) {
      const a = (j / k) * TAU, ca = Math.cos(a), sa = Math.sin(a);
      const x = w * Math.sign(ca) * Math.pow(Math.abs(ca), exp), q = e * Math.sign(sa) * Math.pow(Math.abs(sa), exp);
      const o = (i * k + j) * 3;
      P[o] = x; P[o + 1] = y + ny * q; P[o + 2] = z + nz * q;
    }
  }
  let o = n * k * 3;
  P[o] = 0; P[o + 1] = linha[1]; P[o + 2] = linha[0];
  P[o + 3] = 0; P[o + 4] = linha[(n - 1) * 2 + 1]; P[o + 5] = linha[(n - 1) * 2];
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
}

/* ---------- material de gelatina (vista de lado) ---------- */
function materialVidro(THREE, lado, alfa) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: lado,
    uniforms: { uCorta: { value: 0 }, uPesc: { value: new THREE.Vector3(0, PESC.yTopo - PESC.alt / 2, PESC.z) }, uCentro: { value: new THREE.Vector3(C[0], C[1], C[2]) }, uR: { value: new THREE.Vector4(PESC.r0, PESC.r1, PESC.yTopo, PESC.alt) }, uElip: { value: new THREE.Vector3(ESC * RX, ESC * RY, ESC * RZ) }, uCor: { value: new THREE.Color(CORES.vidro) }, uBorda: { value: new THREE.Color(CORES.vidroBorda) }, uAlfa: { value: alfa }, uLuz: { value: new THREE.Vector3(0.35, 0.8, 0.5).normalize() } },
    vertexShader: `attribute vec3 color; attribute float lab; varying vec3 vN; varying vec3 vV; varying vec3 vC; varying float vL; varying vec3 vP;
      void main(){ vP = (modelMatrix * vec4(position,1.0)).xyz; vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vC = color; vL = lab; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCor; uniform vec3 uBorda; uniform float uAlfa; uniform vec3 uLuz; uniform float uCorta; uniform vec3 uElip; uniform vec3 uPesc; uniform vec3 uCentro; uniform vec4 uR; varying vec3 vN; varying vec3 vV; varying vec3 vC; varying float vL; varying vec3 vP;
      void main(){
        if (uCorta > 0.5 && uCorta < 1.5) { vec3 q = (vP + uPesc - uCentro) / uElip; if (dot(q,q) < 1.0) discard; }
        if (uCorta > 1.5) { float ry = mix(uR.x, uR.y, clamp((uR.z - vP.y) / uR.w, 0.0, 1.0)); if (vP.y < uR.z && length(vec2(vP.x, vP.z - uPesc.z)) < ry) discard; }
        vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; float nv = clamp(dot(n, normalize(vV)), 0.0, 1.0);
        float f = pow(1.0 - nv, 2.4);
        vec3 h = normalize(uLuz + normalize(vV)); float esp = pow(max(dot(n,h),0.0), 70.0);
        float dif = 0.86 + 0.2 * max(dot(n, uLuz), 0.0);
        vec3 cor = mix(uCor, uBorda, smoothstep(0.0, 0.85, f));
        float a = mix(0.075, 0.92, f) * uAlfa;
        vec3 corL = vC * dif * 1.12 + vec3(0.3) * pow(1.0 - nv, 2.0);
        cor = mix(cor, corL, vL); a = mix(a, 0.97 * min(1.0, uAlfa * 1.6), vL);
        cor += vec3(1.0) * esp * 0.9; a = min(1.0, a + esp * 0.8);
        gl_FragColor = vec4(cor, a);
        #include <colorspace_fragment>
      }`
  });
}

/* =====================================================================================================
 * criarCabeca(THREE, { modo: 'frente'|'lado', quem: 'sofia'|'tales' })
 *   → { grupo, atualizar(pose, extra), pontos, liberar() }
 *   pose  = FonemasPT.pose() / mistura()  (jaw, tj, ab, lg, arr, ld, vel, larg, lin, voz)
 *   extra = { voz: 0..1 (vibração da caixinha da voz), tempo (s), bochecha: 0..1 (pressão antes do estouro) }
 * ===================================================================================================== */
export function criarCabeca(THREE, P, { modo = 'frente', quem = 'sofia' } = {}) {
  const frente = modo === 'frente';
  const cq = CORES[quem] || CORES.sofia;
  const grupo = new THREE.Group();
  const lixo = [];
  const guarda = (x) => { lixo.push(x); return x; };

  /* ----- materiais ----- */
  const mat = {};
  if (frente) {
    mat.pele = guarda(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xffd9c2), clearcoat: 0.08, clearcoatRoughness: 0.6 }));
    mat.labio = guarda(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, metalness: 0, clearcoat: 0.75, clearcoatRoughness: 0.22, sheen: 0.3, sheenColor: new THREE.Color(0xffc4cc) }));
    mat.fundo = guarda(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  } else {
    mat.vidroTras = guarda(materialVidro(THREE, THREE.BackSide, 0.32));
    mat.vidro = guarda(materialVidro(THREE, THREE.FrontSide, 1));
    mat.vidroTras.uniforms.uCorta.value = 2; mat.vidro.uniforms.uCorta.value = 2;
    mat.pescTras = guarda(materialVidro(THREE, THREE.BackSide, 0.32)); mat.pesc = guarda(materialVidro(THREE, THREE.FrontSide, 1));
    mat.pescTras.uniforms.uCorta.value = 1; mat.pesc.uniforms.uCorta.value = 1;
    mat.via = guarda(new THREE.MeshBasicMaterial({ color: CORES.via, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }));
  }
  const fosco = frente ? 0 : 0.1;
  mat.dente = guarda(new THREE.MeshPhysicalMaterial({ color: CORES.dente, roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.12, emissive: 0xfff4e6, emissiveIntensity: frente ? 0.1 : 0.2 }));
  mat.lingua = guarda(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42 + fosco, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.5, sheenColor: new THREE.Color(0xffb3c0), emissive: 0x5a0a1a, emissiveIntensity: frente ? 0.12 : 0.3 }));
  mat.gengiva = guarda(new THREE.MeshPhysicalMaterial({ color: CORES.gengiva, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: 0x5a1020, emissiveIntensity: frente ? 0.05 : 0.25 }));
  mat.ceu = guarda(new THREE.MeshPhysicalMaterial({ color: CORES.ceu, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4, emissive: 0x602010, emissiveIntensity: frente ? 0.02 : 0.22 }));
  mat.veu = guarda(new THREE.MeshPhysicalMaterial({ color: CORES.veu, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: 0x500a30, emissiveIntensity: frente ? 0.02 : 0.25 }));

  /* ----- pele + lábios: uma malha só, em anéis em volta da boca ----- */
  const NT = frente ? 112 : 96; // pontos por anel
  // anéis: [tipo, parâmetro]; 'l' = lábio (s de −0.5 a 1), 'p' = pele (afastamento em cm a partir da borda do lábio)
  const aneis = [];
  [-0.55, -0.28, 0, 0.14, 0.3, 0.47, 0.64, 0.8, 0.92, 1].forEach((s) => aneis.push(['l', s]));
  const nLab = aneis.length;
  let d = 0.07;
  while (d < Math.PI * R0 - 1.2) { aneis.push(['p', d]); d += Math.min(0.9, 0.07 + d * 0.3); }
  const NA = aneis.length, NV = NA * NT + 1;
  const gPele = guarda(new THREE.BufferGeometry());
  const pos = new Float32Array(NV * 3), cor = new Float32Array(NV * 3), lab = new Float32Array(NV);
  gPele.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gPele.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  gPele.setAttribute('lab', new THREE.BufferAttribute(lab, 1));
  gPele.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(NV * 3), 3));
  {
    const idx = [];
    for (let a = 0; a < NA - 1; a++) for (let j = 0; j < NT; j++) {
      const p0 = a * NT + j, p1 = a * NT + ((j + 1) % NT), q0 = p0 + NT, q1 = p1 + NT;
      idx.push(p0, q0, p1, p1, q0, q1);
    }
    const nLabIdx = (nLab - 1) * NT * 6;
    for (let j = 0; j < NT; j++) idx.push((NA - 1) * NT + j, NV - 1, (NA - 1) * NT + ((j + 1) % NT));
    gPele.setIndex(idx);
    gPele.addGroup(0, nLabIdx, 0); gPele.addGroup(nLabIdx, idx.length - nLabIdx, 1);
  }
  // cores por vértice (fixas): lábio, pele, blush nas bochechas e no nariz
  const cPele = new THREE.Color(cq.pele), cSombra = new THREE.Color(cq.peleSombra), cLab = new THREE.Color(cq.labio), cBlush = new THREE.Color(cq.blush), cDentro = new THREE.Color(cq.labio).multiplyScalar(0.62);
  const tmpC = new THREE.Color(), cBranco = new THREE.Color(0xffffff);
  const ctRep = P.pose('h'); ctRep.ab = 0.05; ctRep.lg = 1.05; const abRep = abertura(ctRep); // boca de referência para os anéis distantes
  const co = {};
  for (let a = 0; a < NA; a++) for (let j = 0; j < NT; j++) {
    const i = a * NT + j, [tipo, s] = aneis[a], th = (j / NT) * TAU;
    if (tipo === 'l') {
      tmpC.copy(cLab);
      if (s < 0) tmpC.lerp(cDentro, clamp(-s / 0.5));
      else { const luz = Math.sin(Math.PI * clamp(s)) * 0.12; tmpC.lerp(new THREE.Color(0xffffff), luz); if (s > 0.9) tmpC.lerp(cPele, (s - 0.9) / 0.1 * 0.5); }
      lab[i] = 1;
    } else {
      contorno(ctRep, th, co, abRep);
      const u = co.uo + s * Math.cos(th), v = co.vo + s * Math.sin(th);
      tmpC.copy(cPele);
      if (s < 0.14) tmpC.lerp(cLab, 0.4 * (1 - s / 0.14));
      const bl = 0.6 * (gauss(Math.hypot(u - 2.85, v - 0.75), 1.15) + gauss(Math.hypot(u + 2.85, v - 0.75), 1.15)) + 0.22 * gauss(Math.hypot(u, v - 1.75), 0.55);
      tmpC.lerp(cBlush, clamp(bl));
      tmpC.lerp(cBranco, 0.26 * gauss(Math.hypot(u, v - 1.9), 0.38)); // brilho na ponta do nariz
      tmpC.lerp(cSombra, 0.7 * (gauss(Math.hypot((u - 0.34) / 1.4, v - 1.14), 0.1) + gauss(Math.hypot((u + 0.34) / 1.4, v - 1.14), 0.1))); // narinas
      tmpC.lerp(cSombra, 0.35 * sm((Math.hypot(u, v) - 5) / 6)); // escurece de leve para os lados
      lab[i] = s < 0.12 ? 0.5 * (1 - s / 0.12) : 0;
    }
    cor[i * 3] = tmpC.r; cor[i * 3 + 1] = tmpC.g; cor[i * 3 + 2] = tmpC.b;
  }
  cor[(NV - 1) * 3] = cSombra.r; cor[(NV - 1) * 3 + 1] = cSombra.g; cor[(NV - 1) * 3 + 2] = cSombra.b;
  if (frente) {
    const m = new THREE.Mesh(gPele, [mat.labio, mat.pele]); m.castShadow = true; m.receiveShadow = true; grupo.add(m);
  } else {
    const f = new THREE.Mesh(gPele, mat.vidro); f.renderOrder = 6; grupo.add(f);
  }

  /* ----- pescoço ----- */
  {
    const g = guarda(new THREE.CylinderGeometry(PESC.r0, PESC.r1, PESC.alt, 40, 6, true));
    const Pn = g.attributes.position, cn = new Float32Array(Pn.count * 3), ln = new Float32Array(Pn.count);
    for (let i = 0; i < Pn.count; i++) { cn[i * 3] = cSombra.r * 0.5 + cPele.r * 0.5; cn[i * 3 + 1] = cSombra.g * 0.5 + cPele.g * 0.5; cn[i * 3 + 2] = cSombra.b * 0.5 + cPele.b * 0.5; }
    g.setAttribute('color', new THREE.BufferAttribute(cn, 3)); g.setAttribute('lab', new THREE.BufferAttribute(ln, 1));
    const add = (m, ro) => { const n = new THREE.Mesh(g, m); n.position.set(0, PESC.yTopo - PESC.alt / 2, PESC.z); n.renderOrder = ro; grupo.add(n); return n; };
    if (frente) add(mat.pele, 0); else { add(mat.pesc, 6); }
  }

  /* ----- fundo escuro da boca (só de frente): um saco que começa na borda de dentro dos lábios ----- */
  let gFundo = null; const NF = 9;
  if (frente) {
    gFundo = guarda(new THREE.BufferGeometry());
    const n = NF * NT + 1, cf = new Float32Array(n * 3), idx = [];
    gFundo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const c0 = new THREE.Color(CORES.fundoBorda), c1 = new THREE.Color(CORES.fundo);
    for (let a = 0; a < NF; a++) for (let j = 0; j < NT; j++) { tmpC.copy(c0).lerp(c1, sm(a / 4)); cf.set([tmpC.r, tmpC.g, tmpC.b], (a * NT + j) * 3); }
    cf.set([c1.r * 0.8, c1.g * 0.8, c1.b * 0.8], (n - 1) * 3);
    gFundo.setAttribute('color', new THREE.BufferAttribute(cf, 3));
    for (let a = 0; a < NF - 1; a++) for (let j = 0; j < NT; j++) { const p0 = a * NT + j, p1 = a * NT + ((j + 1) % NT); idx.push(p0, p1, p0 + NT, p1, p1 + NT, p0 + NT); }
    for (let j = 0; j < NT; j++) idx.push((NF - 1) * NT + j, (NF - 1) * NT + ((j + 1) % NT), n - 1);
    gFundo.setIndex(idx);
    grupo.add(new THREE.Mesh(gFundo, mat.fundo));
  }

  /* ----- dentes e gengivas ----- */
  const HINGE = P.DOBRA; // [z, y]
  const mand = new THREE.Group(); mand.position.set(0, HINGE[1], HINGE[0]); grupo.add(mand); // gira com a mandíbula
  const mandIn = new THREE.Group(); mandIn.position.set(0, -HINGE[1], -HINGE[0]); mand.add(mandIn);
  const dentes = [];
  function arcada(pai, { a, b, z0, yPonta, sentido, larg, alt, prof }) {
    const pt = (t) => [a * Math.sin(t), z0 - b * (1 - Math.cos(t))];
    const comp = (t0, t1) => { let l = 0, q = pt(t0); for (let k = 1; k <= 12; k++) { const r = pt(t0 + (t1 - t0) * k / 12); l += Math.hypot(r[0] - q[0], r[1] - q[1]); q = r; } return l; };
    const avanca = (t0, dist) => { let lo = t0, hi = t0 + 1.6; for (let k = 0; k < 22; k++) { const m2 = (lo + hi) / 2; if (comp(t0, m2) < dist) lo = m2; else hi = m2; } return lo; };
    for (const ladoX of [1, -1]) {
      let t = 0;
      for (let k = 0; k < larg.length; k++) {
        const tc = avanca(t, larg[k] / 2); t = avanca(t, larg[k]);
        if (!frente && ladoX > 0 && k > 0) continue; // de lado: o lado de cá fica aberto para ver a língua
        const [x, z] = pt(tc), g = guarda(superelipsoide(THREE, larg[k] * 0.47, alt[k] / 2, prof[k] / 2, k < 3 ? 0.62 : 0.7));
        const m = new THREE.Mesh(g, mat.dente);
        m.position.set(ladoX * x, yPonta + sentido * alt[k] / 2, z - prof[k] / 2 * Math.cos(tc));
        m.rotation.y = ladoX * tc; m.castShadow = frente; m.receiveShadow = frente;
        pai.add(m); dentes.push(m);
      }
    }
    // gengiva: fita arredondada sobre a raiz dos dentes
    const pts = [], t1 = avanca(0, larg.reduce((s, v) => s + v, 0) + 0.1);
    const tIni = frente ? -t1 : -t1, tFim = frente ? t1 : 0.16;
    for (let k = 0; k <= 30; k++) { const tt = mix(tIni, tFim, k / 30), [x, z] = pt(tt); pts.push(new THREE.Vector3(x, yPonta + sentido * (alt[0] + 0.2), z - 0.34 * Math.cos(tt))); }
    const gg = guarda(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.26, 10, false));
    gg.scale(1, 1.4, 1); gg.translate(0, -(yPonta + sentido * (alt[0] + 0.2)) * 0.4, 0);
    const mg = new THREE.Mesh(gg, mat.gengiva); mg.receiveShadow = frente; pai.add(mg);
    for (const e of [pts[0], pts[pts.length - 1]]) { const s = new THREE.Mesh(guarda(new THREE.SphereGeometry(0.26, 12, 10)), mat.gengiva); s.position.copy(e); s.scale.y = 1.4; pai.add(s); }
  }
  arcada(grupo, { a: 2.0, b: 2.45, z0: -0.16, yPonta: -0.05, sentido: 1, larg: [0.56, 0.48, 0.48, 0.6, 0.64], alt: [0.66, 0.58, 0.6, 0.5, 0.5], prof: [0.28, 0.28, 0.36, 0.52, 0.56] });
  arcada(mandIn, { a: 1.78, b: 2.25, z0: -0.5, yPonta: 0.0, sentido: -1, larg: [0.44, 0.44, 0.46, 0.58, 0.62], alt: [0.52, 0.52, 0.54, 0.46, 0.46], prof: [0.24, 0.24, 0.32, 0.5, 0.54] });

  /* ----- céu da boca (duro): fita grossa que segue a linha do meio ----- */
  const NC = 22, KC = 14;
  {
    const linha = spline2([[-0.38, 0.62], [-0.62, 0.66], [-0.86, 0.78], [-1.25, 1.2], [-2.0, 1.5], [-3.0, 1.57], [-3.8, 1.5]], NC, new Float32Array(NC * 2));
    // a face de baixo da fita fica exatamente na linha do céu da boca (CEU): centro = CEU + meia espessura
    const g = guarda(criaFita(THREE, NC, KC));
    atualizaFita(g, linha, NC, KC, (f) => mix(1.5, 2.25, sm(f * 2.2)) * (frente ? 1 : 1), () => 0.25, 0.6);
    const m = new THREE.Mesh(g, mat.ceu); m.receiveShadow = frente; grupo.add(m);
  }

  /* ----- véu (céu mole): sobe e fecha o nariz, ou desce e deixa o ar passar ----- */
  const NVe = 12, KVe = 12;
  const gVeu = guarda(criaFita(THREE, NVe, KVe)), linhaVeu = new Float32Array(NVe * 2);
  { const m = new THREE.Mesh(gVeu, mat.veu); grupo.add(m); }
  function poeVeu(vel, treme) {
    // levantado: encosta na parede de trás; abaixado: pende para baixo e para a frente
    const a = [[-3.75, 1.5], [-4.25, 1.52], [-4.75, 1.4], [-5.08, 1.12]], b = [[-3.75, 1.5], [-4.2, 1.2], [-4.42, 0.7], [-4.4, 0.18]];
    const pts = a.map((p, i) => [mix(p[0], b[i][0], vel) + (i === 3 ? treme : 0), mix(p[1], b[i][1], vel)]);
    spline2(pts, NVe, linhaVeu);
    atualizaFita(gVeu, linhaVeu, NVe, KVe, (f) => mix(1.5, 0.5, sm(f * 1.1)), (f) => mix(0.26, 0.2, f) + 0.07 * gauss(f - 0.9, 0.12), 0.75);
  }

  /* ----- língua ----- */
  const NL = 34, KL = 22;
  const gLing = guarda(new THREE.BufferGeometry());
  {
    const n = NL * KL + 2, cl = new Float32Array(n * 3), idx = [];
    gLing.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const c0 = new THREE.Color(CORES.linguaPonta), c1 = new THREE.Color(CORES.lingua), c2 = new THREE.Color(CORES.lingua).multiplyScalar(0.8);
    for (let i = 0; i < NL; i++) for (let j = 0; j < KL; j++) {
      const f = i / (NL - 1), topo = Math.sin((j / KL) * TAU);
      tmpC.copy(c0).lerp(c1, sm(f * 1.6)); if (topo < 0) tmpC.lerp(c2, -topo * 0.6);
      cl.set([tmpC.r, tmpC.g, tmpC.b], (i * KL + j) * 3);
    }
    cl.set([c0.r, c0.g, c0.b], NL * KL * 3); cl.set([c2.r, c2.g, c2.b], (NL * KL + 1) * 3);
    gLing.setAttribute('color', new THREE.BufferAttribute(cl, 3));
    for (let i = 0; i < NL - 1; i++) for (let j = 0; j < KL; j++) { const a = i * KL + j, b = i * KL + ((j + 1) % KL); idx.push(a, a + KL, b, b, a + KL, b + KL); }
    for (let j = 0; j < KL; j++) { idx.push(NL * KL, j, (j + 1) % KL); idx.push(NL * KL + 1, (NL - 1) * KL + ((j + 1) % KL), (NL - 1) * KL + j); }
    gLing.setIndex(idx);
    const m = new THREE.Mesh(gLing, mat.lingua); m.castShadow = frente; m.receiveShadow = frente; grupo.add(m);
  }
  const topoL = new Float32Array(NL * 2), ctrl = [];
  function poeLingua(p) {
    const jaw = p.jaw, R = (q) => P.giraMand(q, jaw);
    ctrl.length = 0;
    for (const q of p.lin) { const g = R(q); ctrl.push([mix(q[0], g[0], p.tj), mix(q[1], g[1], p.tj)]); }
    spline2(ctrl, NL, topoL);
    const f0 = R([-1.15, -1.3]), f1 = R([-4.35, -3.0]); // assoalho da boca (vai com a mandíbula)
    const A = gLing.attributes.position.array;
    for (let i = 0; i < NL; i++) {
      const f = i / (NL - 1), tz = topoL[i * 2], ty = topoL[i * 2 + 1];
      const ponta = Math.sqrt(clamp(1 - (1 - clamp(f / 0.1)) ** 2)) * Math.sqrt(clamp(1 - (1 - clamp((1 - f) / 0.12)) ** 2) * 0.75 + 0.25); // arredonda a pontinha e o fim
      const livre = 0.3 + 0.2 * sm(f / 0.25);
      const preso = sm((f - 0.1) / 0.34);
      const bz = mix(tz - 0.02, mix(f0[0], f1[0], f), preso), by = mix(ty - 2 * livre * ponta, mix(f0[1], f1[1], f), preso);
      const cz = (tz + bz) / 2, cy = (ty + by) / 2, hz = (tz - bz) / 2, hy = (ty - by) / 2;
      let w = mix(0.62, 1.42, sm(f / 0.3)) * mix(1, 0.93, sm((f - 0.7) / 0.3)) * (0.25 + 0.75 * ponta);
      w *= mix(p.larg, 1, sm((f - 0.25) / 0.4));
      for (let j = 0; j < KL; j++) {
        const a = (j / KL) * TAU, ca = Math.cos(a), sa = Math.sin(a), cimaL = sa > 0;
        const x = w * Math.sign(ca) * Math.pow(Math.abs(ca), 0.8);
        let q = Math.sign(sa) * Math.pow(Math.abs(sa), cimaL ? 0.5 : 0.85);
        if (cimaL) q -= 0.07 * gauss(x, 0.3) * sm(f / 0.2) / Math.max(0.3, Math.hypot(hz, hy)); // sulco do meio
        const o = (i * KL + j) * 3;
        A[o] = x; A[o + 1] = cy + hy * q; A[o + 2] = cz + hz * q;
      }
    }
    let o = NL * KL * 3;
    A[o] = 0; A[o + 1] = topoL[1] - 0.02; A[o + 2] = topoL[0];
    const fz = topoL[(NL - 1) * 2], fy = topoL[(NL - 1) * 2 + 1];
    A[o + 3] = 0; A[o + 4] = (fy + f1[1]) / 2; A[o + 5] = (fz + f1[0]) / 2 - 0.25;
    gLing.attributes.position.needsUpdate = true;
    gLing.computeVertexNormals();
  }

  /* ----- só de lado: caminho do ar (garganta + nariz) e a caixinha da voz ----- */
  let caixa = null, ondas = [], nucleo = null;
  if (!frente) {
    const tubo = (pts, r) => { const g = guarda(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(0, q[1], q[0]))), 48, r, 14, false)); const m = new THREE.Mesh(g, mat.via); m.renderOrder = 2; grupo.add(m); return m; };
    tubo(VIA_GARGANTA, 0.5); tubo(VIA_NARIZ, 0.4);
    // caixinha da voz: um "botão" na garganta que acende e treme quando o som tem voz
    caixa = new THREE.Group(); caixa.position.set(0, P_VOZ[1], P_VOZ[0]); grupo.add(caixa);
    const mCaixa = guarda(new THREE.MeshPhysicalMaterial({ color: CORES.vozOff, roughness: 0.3, clearcoat: 0.8, emissive: CORES.voz, emissiveIntensity: 0 }));
    nucleo = new THREE.Mesh(guarda(superelipsoide(THREE, 0.95, 0.5, 0.78, 0.75, 24, 16)), mCaixa); caixa.add(nucleo);
    nucleo.userData.mat = mCaixa;
    const mOnda = () => guarda(new THREE.MeshBasicMaterial({ color: CORES.voz, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(guarda(new THREE.TorusGeometry(1, 0.075, 8, 48)), mOnda()); o.rotation.y = Math.PI / 2; o.renderOrder = 8; caixa.add(o); ondas.push(o); }
  }

  /* ----- atualização por quadro ----- */
  const dd = [0, 0, 0], qx = [0, 0, 0];
  const cEs = [], cDi = [];
  function atualizar(p, extra = {}) {
    const jawRad = (p.jaw * Math.PI) / 180, AB = abertura(p), J = AB.J;
    mand.rotation.x = jawRad;
    // queixo desce com a mandíbula
    direcao(0, -2.3 - J * 0.95, qx);
    const bochecha = extra.bochecha || 0;
    // contorno da boca nesta pose
    for (let j = 0; j < NT; j++) { cEs[j] = contorno(p, (j / NT) * TAU, cEs[j] || {}, AB); if (!cDi[j]) cDi[j] = contorno(ctRep, (j / NT) * TAU, {}, abRep); }
    for (let a = 0; a < NA; a++) {
      const [tipo, s] = aneis[a];
      if (tipo === 'p' && s > 5.2 && atualizar.feito) continue; // longe da boca: não muda
      for (let j = 0; j < NT; j++) {
        const th = (j / NT) * TAU, k = cEs[j];
        let u, v, h;
        if (tipo === 'l') {
          const t = s < 0 ? mix(0, 0.42, -s / 0.55) : s; // por dentro o lábio dobra e volta para fora
          u = mix(k.ui, k.uo, t); v = mix(k.vi, k.vo, t);
          if (s < 0) h = mix(-0.1, -0.3, -s / 0.55);
          else h = k.B * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.8) - 0.1 * (1 - s) ** 3;
          if (!k.cima) h -= 0.42 * p.ld * k.cai * (s < 0 ? 1 : 1 - 0.75 * s);
        } else {
          const r0 = cDi[j], g = sm(s / 5.2);
          u = mix(k.uo, r0.uo, g) + s * Math.cos(th); v = mix(k.vo, r0.vo, g) + s * Math.sin(th);
          h = 0;
          if (!k.cima) h -= 0.1 * gauss(s - 0.45, 0.32) * k.cai; // dobrinha embaixo do lábio
          else h -= 0.05 * gauss(s - 0.3, 0.3) * gauss(Math.cos(th), 0.2); // filtro (covinha em cima do lábio)
        }
        const r = Math.hypot(u, v);
        h += p.arr * 0.5 * gauss(r, 1.7) + bochecha * 0.28 * gauss(Math.hypot(Math.abs(u) - 2.2, v + 0.1), 1.3);
        direcao(u, v, dd);
        const rr = raio(dd, qx) + h, i = (a * NT + j) * 3;
        pos[i] = C[0] + dd[0] * rr; pos[i + 1] = C[1] + dd[1] * rr; pos[i + 2] = C[2] + dd[2] * rr;
      }
    }
    if (!atualizar.feito) { direcao(0, Math.PI * R0, dd); /* polo de trás */ const rr = raio([-D0[0], -D0[1], -D0[2]], qx); pos[(NV - 1) * 3] = C[0] - D0[0] * rr; pos[(NV - 1) * 3 + 1] = C[1] - D0[1] * rr; pos[(NV - 1) * 3 + 2] = C[2] - D0[2] * rr; }
    atualizar.feito = true;
    gPele.attributes.position.needsUpdate = true;
    gPele.computeVertexNormals();

    if (gFundo) {
      const A = gFundo.attributes.position.array;
      for (let a = 0; a < NF; a++) {
        const f = a / (NF - 1), g = sm((f - 0.1) / 0.55);
        for (let j = 0; j < NT; j++) {
          const th = (j / NT) * TAU, o = (a * NT + j) * 3, b = j * 3; // parte do anel de dentro do lábio (anel 0 da pele)
          const ex = 2.5 * Math.cos(th), ey = Math.sin(th) > 0 ? 1.9 * Math.sin(th) : (1.7 + J) * Math.sin(th);
          const fecha = Math.cos(sm((f - 0.6) / 0.4) * 1.45);
          A[o] = mix(pos[b], ex * fecha, g); A[o + 1] = mix(pos[b + 1], ey * fecha - 0.3, g); A[o + 2] = pos[b + 2] - 0.06 - 4.4 * f;
        }
      }
      A.set([0, -0.4, -4.6], NF * NT * 3);
      gFundo.attributes.position.needsUpdate = true;
    }

    // vogais redondas (O, U): de frente os dentes ficam escondidos atrás do biquinho
    if (frente) { const ve = !(p.dy > 0.02); if (dentes[0].visible !== ve) for (const d of dentes) d.visible = ve; }
    poeLingua(p);
    poeVeu(p.vel, (extra.raspa || 0) * 0.07 * Math.sin((extra.tempo || 0) * 70));

    if (caixa) {
      const v = clamp(extra.voz || 0), t = extra.tempo || 0, m = nucleo.userData.mat;
      m.emissiveIntensity = 0.95 * v; m.color.set(CORES.vozOff).lerp(new THREE.Color(CORES.voz), v);
      const tr = v * 0.05 * Math.sin(t * 62);
      nucleo.position.set(0, tr, tr * 0.6); nucleo.scale.setScalar(1 + v * 0.07 * Math.sin(t * 31));
      ondas.forEach((o, k) => { const f = (t * 0.9 + k / 3) % 1; o.scale.setScalar(0.9 + f * 1.9); o.material.opacity = v * 0.75 * (1 - f) ** 1.5; });
    }
  }

  return { grupo, atualizar, mat, topo: () => topoL, nTopo: NL, liberar() { lixo.forEach((x) => x.dispose && x.dispose()); } };
}

/* ---------- pontos de referência usados pelo ar e pelos marcadores ("o som nasce aqui") ---------- */
export const P_VOZ = [-4.9, -3.8]; // [z, y] caixinha da voz
export const VIA_GARGANTA = [[-4.95, -8.2], [-4.9, -6], [-4.9, -3.8], [-4.85, -2.4], [-4.75, -0.6], [-4.72, 0.6]];
export const VIA_NARIZ = [[-4.72, 0.6], [-4.7, 1.55], [-4.3, 2.3], [-3.2, 2.55], [-1.8, 2.5], [-0.6, 2.2], [0.15, 1.65], [0.48, 1.3]];
export const ZONAS3D = { // [x, y, z]
  labios: [0, 0, 0.55], dentes: [0, -0.02, 0.2], alveolo: [0, 0.5, -0.8], palato: [0, 1.2, -2.1], veu: [0, 1.25, -3.7], garganta: [0, 0.75, -4.75], nariz: [0, 1.5, 0.9]
};
