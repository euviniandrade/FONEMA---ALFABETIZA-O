/* FONEMA · Espelho do Som 3D (Three.js) — boneco articulatório fofo, controlável por fonema.
 *
 * Tudo é geometria procedural (sem modelos nem imagens): dentinhos como blocos brancos arredondados e
 * brilhantes, língua coral lisa e gordinha (malha "loft" recalculada a cada quadro = morph suave),
 * lábios macios (tubos), céu da boca e véu rosados, garganta como túnel suave com ondinhas douradas.
 * Câmeras: "frente" (close da boca), "lado" (raio-X), "dentro" (voo para dentro da boca), "corpo"
 * (do pulmão até a boca) e órbita 360° livre (OrbitControls).
 *
 * As posições vêm de fonemas.js (FonemasPT) — simplificadas, VALIDAR COM FONOAUDIÓLOGA.
 * Uso:  const esp = criar(divContainer, { fonema: 'm', modo: 'frente' });  esp.fonema('a');  esp.modo('lado');
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const P = window.FonemasPT;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const DOBRA = P.DOBRA; // articulação da mandíbula [z, y]

/* ------------------------------------------------------------------ materiais */
function fresnel(cor, forca = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { cor: { value: new THREE.Color(cor) }, opac: { value: 1 }, forca: { value: forca } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 cor; uniform float opac; uniform float forca; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
        gl_FragColor = vec4(cor * (0.10 + f * 1.25) * forca, 1.0) * opac; }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
}
const fisico = (cor, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: cor, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 }, o));

/* ------------------------------------------------------------------ geometrias */
function caixaRedonda(w, h, d, r, seg = 6) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    c.set(THREE.MathUtils.clamp(v.x, -hx, hx), THREE.MathUtils.clamp(v.y, -hy, hy), THREE.MathUtils.clamp(v.z, -hz, hz));
    v.sub(c).normalize().multiplyScalar(r).add(c);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

// "Loft": corpo arredondado ao longo de uma linha (z,y) com largura w e espessura d. Usado na língua e no véu.
class Loft {
  constructor(nAm = 44, nAnel = 26) {
    this.nAm = nAm; this.nAnel = nAnel;
    const nv = nAm * nAnel + 2;
    this.pos = new Float32Array(nv * 3);
    const idx = [];
    for (let i = 0; i < nAm - 1; i++) for (let j = 0; j < nAnel; j++) {
      const a = i * nAnel + j, b = i * nAnel + ((j + 1) % nAnel), c = a + nAnel, d = b + nAnel;
      idx.push(a, c, b, b, c, d);
    }
    const t0 = nAm * nAnel, t1 = t0 + 1, last = (nAm - 1) * nAnel;
    for (let j = 0; j < nAnel; j++) { idx.push(t0, j, (j + 1) % nAnel); idx.push(t1, last + ((j + 1) % nAnel), last + j); }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setIndex(idx);
  }
  // ctrl: [{z,y,w,d}], superfície de cima; o corpo fica "para dentro" (normal à esquerda da tangente)
  atualiza(ctrl) {
    const n = ctrl.length, am = [], A = this.nAm;
    const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
    for (let i = 0; i < A; i++) {
      const u = (i / (A - 1)) * (n - 1), k = Math.min(Math.floor(u), n - 2), t = u - k;
      const q = (o) => ctrl[Math.max(0, Math.min(n - 1, o))];
      const p0 = q(k - 1), p1 = q(k), p2 = q(k + 1), p3 = q(k + 2);
      am.push({ z: cr(p0.z, p1.z, p2.z, p3.z, t), y: cr(p0.y, p1.y, p2.y, p3.y, t), w: Math.max(0.02, cr(p0.w, p1.w, p2.w, p3.w, t)), d: Math.max(0.02, cr(p0.d, p1.d, p2.d, p3.d, t)) });
    }
    const R = this.nAnel, pos = this.pos;
    const sp = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
    for (let i = 0; i < A; i++) {
      const a = am[Math.max(0, i - 1)], b = am[Math.min(A - 1, i + 1)];
      let tz = b.z - a.z, ty = b.y - a.y; const L = Math.hypot(tz, ty) || 1; tz /= L; ty /= L;
      const nz = -ty, ny = tz; // normal "para dentro"
      const s = am[i], hd = s.d / 2, cz = s.z + nz * hd, cy = s.y + ny * hd;
      // perto das pontas, arredonda (ovinho)
      const f = Math.min(1, Math.min(i, A - 1 - i) / 3 + 0.35);
      for (let j = 0; j < R; j++) {
        const ph = (j / R) * Math.PI * 2, c = sp(Math.cos(ph), 0.72), sn = sp(Math.sin(ph), 0.72);
        const o = (i * R + j) * 3;
        pos[o] = s.w * sn * f;
        pos[o + 1] = cy - ny * hd * c * f;
        pos[o + 2] = cz - nz * hd * c * f;
      }
      if (i === 0 || i === A - 1) {
        const o = (A * R + (i === 0 ? 0 : 1)) * 3, sgn = i === 0 ? -1 : 1;
        pos[o] = 0; pos[o + 1] = cy + ty * sgn * hd * 0.6; pos[o + 2] = cz + tz * sgn * hd * 0.6;
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.computeVertexNormals();
    this.geo.computeBoundingSphere();
  }
}


/* Cabeça cartunesca "inflada" a partir do perfil de lado: em cada altura y, um corte oval entre a frente
   (testa, nariz, boca, queixo) e a nuca. O queixo acompanha a mandíbula. Material fresnel = brilho de raio-X. */
const FRENTE = [[6.7, -2.9], [6.2, -1.3], [5.2, 0.1], [3.8, 0.8], [2.7, 0.85], [2.0, 1.12], [1.45, 1.55], [1.15, 1.25], [0.9, 0.6], [0.5, 0.52],
  [0.0, 0.42], [-0.5, 0.45], [-1.0, 0.6], [-1.45, 0.45], [-1.85, -0.4], [-2.2, -1.6], [-2.6, -2.05], [-4.0, -2.1], [-7.5, -2.0]];
const NUCA = [[6.7, -2.9], [6.2, -4.6], [5.0, -6.1], [3.0, -6.7], [1.0, -6.3], [-0.5, -5.7], [-1.8, -5.3], [-4.0, -5.3], [-7.5, -5.3]];
const LARG = [[6.7, 0.2], [6.2, 2.4], [4.5, 3.5], [2.5, 3.7], [0.5, 3.3], [-1.0, 2.7], [-2.0, 2.0], [-2.6, 1.75], [-7.5, 1.75]];
function perfil(tab, y) {
  for (let i = 1; i < tab.length; i++) if (y >= tab[i][0]) { const [y0, a] = tab[i - 1], [y1, b] = tab[i], t = (y - y0) / (y1 - y0), k = t * t * (3 - 2 * t); return a + (b - a) * (0.5 * t + 0.5 * k); }
  return tab[tab.length - 1][1];
}
function cascaCabeca() {
  const NY = 90, NA = 56, base = [], pos = new Float32Array((NY + 1) * NA * 3), idx = [];
  for (let i = 0; i <= NY; i++) {
    const y = 6.69 - (14.1 * i) / NY, f = perfil(FRENTE, y), n = perfil(NUCA, y), w = perfil(LARG, y), zc = (f + n) / 2, hd = (f - n) / 2;
    const nariz = y > 0.8 && y < 2.1 ? 0.72 : (y > -1.9 && y <= 0.8 ? 0.42 : 0.15);
    for (let j = 0; j < NA; j++) {
      const a = (j / NA) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const estreita = c > 0 ? 1 - nariz * Math.pow(c, 6) : 1;
      base.push([w * s * estreita, y, zc + hd * c]);
    }
  }
  for (let i = 0; i < NY; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = a + NA, d = b + NA; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const mesh = new THREE.Mesh(g, null);
  let ultimo = null;
  function atualiza(jaw) {
    if (ultimo !== null && Math.abs(ultimo - jaw) < 0.01) return; ultimo = jaw;
    base.forEach(([x, y, z], i) => {
      const w = Math.min(1, Math.max(0, (-y - 0.15) / 1.1)) * Math.min(1, Math.max(0, (z + 3.4) / 2.2));
      let yy = y, zz = z;
      if (w > 0 && y > -3.2) { const r = window.FonemasPT.giraMand([z, y], jaw * w); zz = r[0]; yy = r[1]; }
      pos[i * 3] = x; pos[i * 3 + 1] = yy; pos[i * 3 + 2] = zz;
    });
    g.attributes.position.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
  }
  atualiza(0);
  return { mesh, atualiza };
}

/* textura de bolinha para as partículas de ar */
function texBolinha() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ------------------------------------------------------------------ câmeras */
const CAMS = {
  frente: { pos: V3(0, 0.02, 5.4), alvo: V3(0, -0.12, 0), fov: 30 },
  lado: { pos: V3(15.2, -0.6, -2.3), alvo: V3(0, -0.75, -2.3), fov: 32 },
  dentro: { pos: V3(0.05, 1.04, -3.05), alvo: V3(0, 0.25, -0.5), fov: 74 },
  corpo: { pos: V3(31, -5.6, -2.8), alvo: V3(0, -5.6, -2.8), fov: 32 }
};
// quanto cada camada aparece em cada modo
const CAMADAS = {
  frente: { dentro: 0, rosto: 1, casca: 0, cavidade: 1, tubos: 0, corpo: 0, rotulos: 0 },
  lado: { dentro: 0, rosto: 0, casca: 1, cavidade: 0, tubos: 1, corpo: 0, rotulos: 1 },
  dentro: { dentro: 1, rosto: 0, casca: 0, cavidade: 1, tubos: 0.25, corpo: 0, rotulos: 0 },
  corpo: { dentro: 0, rosto: 0, casca: 1, cavidade: 0, tubos: 1, corpo: 1, rotulos: 1 }
};

export function criar(container, opts = {}) {
  const W0 = () => Math.max(50, container.clientWidth), H0 = () => Math.max(50, container.clientHeight);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.capturas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W0(), H0());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  const corte = new THREE.Plane(V3(-1, 0, 0), 9); // no modo "dentro", corta a metade de perto da língua
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.domElement.className = 'esp3d-canvas';
  container.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, W0() / H0(), 0.03, 300);
  const ctl = new OrbitControls(cam, renderer.domElement);
  ctl.enableDamping = true; ctl.dampingFactor = 0.08; ctl.enablePan = false; ctl.minDistance = 0.6; ctl.maxDistance = 45; ctl.autoRotateSpeed = 3.2;

  /* luzes macias de estúdio de animação */
  cena.add(new THREE.HemisphereLight(0xe8f3ff, 0x34306a, 1.25));
  const chave = new THREE.DirectionalLight(0xfff4e6, 2.3); chave.position.set(6, 9, 11); cena.add(chave);
  const recorte = new THREE.DirectionalLight(0xa9d8ff, 1.3); recorte.position.set(-9, 4, -7); cena.add(recorte);
  const lado = new THREE.DirectionalLight(0xffffff, 1.1); lado.position.set(12, 2, 0); cena.add(lado);
  const luzBoca = new THREE.PointLight(0xfff0e6, 9, 9, 1.6); luzBoca.position.set(0, 0.25, 3.0); cena.add(luzBoca);
  const luzDentro = new THREE.PointLight(0xffd6e0, 4, 6, 1.4); luzDentro.position.set(0.5, 0.7, -1.6); cena.add(luzDentro);

  const M = {
    dente: fisico(0xfdfdff, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.3, sheenColor: new THREE.Color(0xdff1ff) }),
    lingua: fisico(0xff7f8c, { roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.28, sheen: 0.6, sheenColor: new THREE.Color(0xffd3da), side: THREE.DoubleSide }),
    labio: fisico(0xd8636f, { roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color(0xffc9cf) }),
    ceu: fisico(0xf6a9bd, { roughness: 0.55, clearcoat: 0.3, side: THREE.DoubleSide }),
    osso: fisico(0xf8e5c4, { roughness: 0.5, clearcoat: 0.4 }),
    veu: fisico(0xf28ca6, { roughness: 0.45, clearcoat: 0.5, side: THREE.DoubleSide }),
    cavidade: new THREE.MeshStandardMaterial({ color: 0x8a3157, roughness: 0.85, side: THREE.BackSide, emissive: 0x3a0d22, emissiveIntensity: 0.6 }),
    pele: fisico(0xb87855, { roughness: 0.55, clearcoat: 0.15, sheen: 0.7, sheenColor: new THREE.Color(0xffd6bf) }),
    bochecha: new THREE.MeshBasicMaterial({ color: 0xff8a8a, transparent: true, opacity: 0.22, depthWrite: false }),
    narina: new THREE.MeshStandardMaterial({ color: 0x8a4a33, roughness: 0.9 }),
    olhoB: fisico(0xffffff, { roughness: 0.2, clearcoat: 1 }),
    olhoI: fisico(0x3a2418, { roughness: 0.25, clearcoat: 1 }),
    brilho: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    laringe: fisico(0xf3a0b0, { roughness: 0.5, clearcoat: 0.5 }),
    prega: fisico(0xfff0f3, { roughness: 0.35, clearcoat: 0.8 }),
    pulmao: fisico(0xf59aac, { roughness: 0.5, clearcoat: 0.5, transparent: true, opacity: 0.92, sheen: 0.6, sheenColor: new THREE.Color(0xffe0e6) }),
    onda: new THREE.MeshBasicMaterial({ color: 0xffd860, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    alvo: new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    pick: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
  };
  const casca = fresnel(0x6fb8ff, 1.0), cabelo = fresnel(0x3f6fd8, 0.75), tuboNariz = fresnel(0xc7a6ff, 1.0), tuboGarg = fresnel(0xff9fc0, 0.9), torso = fresnel(0x6fb8ff, 0.8);

  /* -------- grupos -------- */
  const raiz = new THREE.Group(); cena.add(raiz);
  const mand = new THREE.Group(); mand.position.set(0, DOBRA[1], DOBRA[0]); raiz.add(mand); // mandíbula (gira em x)
  const noMand = (obj, x, y, z) => { obj.position.set(x, y - DOBRA[1], z - DOBRA[0]); mand.add(obj); return obj; };
  const grupos = { rosto: new THREE.Group(), casca: new THREE.Group(), cavidade: new THREE.Group(), tubos: new THREE.Group(), corpo: new THREE.Group() };
  Object.values(grupos).forEach((g) => raiz.add(g));
  const cascaMand = new THREE.Group(); noMand(cascaMand, 0, 0, 0);

  /* -------- casca raio-X (cabeça cartunesca translúcida) -------- */
  const esf = (r, s = 48) => new THREE.SphereGeometry(r, s, Math.round(s * 0.75));
  const add = (g, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); g.add(m); return m; };
  const cabeca = cascaCabeca(); cabeca.mesh.material = casca; grupos.casca.add(cabeca.mesh);
  [-1, 1].forEach((s) => add(grupos.casca, esf(1), casca, 3.4 * s, 1.7, -5.3, 0.4, 0.9, 0.62));
  // olhinhos fofos (aparecem no raio-X e de frente)
  const olhos = new THREE.Group(); raiz.add(olhos);
  [-1, 1].forEach((s) => {
    const o = new THREE.Group(); o.position.set(1.25 * s, 2.6, 0.55); o.userData.s = s; olhos.add(o);
    add(o, esf(0.46, 32), M.olhoB, 0, 0, 0, 1, 1.12, 0.8);
    add(o, esf(0.27, 32), M.olhoI, 0.03 * s, -0.02, 0.24, 1, 1.15, 0.7);
    add(o, esf(0.08, 16), M.brilho, 0.1 * s, 0.12, 0.42);
  });

  /* -------- tubos: cavidade nasal e garganta (túnel suave) -------- */
  const tubo = (pts, r, mat, g) => { const c = new THREE.CatmullRomCurve3(pts.map((p) => V3(0, p[1], p[0]))); return add(g, new THREE.TubeGeometry(c, 64, r, 20, false), mat, 0, 0, 0); };
  const NARIZ = [[-4.85, 1.55], [-4.2, 2.08], [-2.6, 2.28], [-1.0, 2.12], [0.15, 1.7], [0.78, 1.18]];
  const GARG = [[-4.72, 2.0], [-5.02, 1.2], [-5.05, -0.6], [-4.95, -2.6], [-4.88, -4.0]];
  tubo(NARIZ, 0.42, tuboNariz, grupos.tubos);
  tubo(GARG, 0.46, tuboGarg, grupos.tubos);

  /* -------- laringe e pregas vocais (vibram com a voz) + ondinhas douradas -------- */
  const laringe = new THREE.Group(); laringe.position.set(0, -4.2, -4.9); raiz.add(laringe);
  add(laringe, new THREE.TorusGeometry(0.44, 0.13, 20, 48), M.laringe, 0, 0, 0).rotation.x = Math.PI / 2;
  const pregas = [-1, 1].map((s) => { const m = add(laringe, esf(1, 24), M.prega, 0.17 * s, 0, 0, 0.13, 0.08, 0.36); m.userData.s = s; return m; });
  const ondas = [];
  [1, -1].forEach((lado) => {
    for (let i = 0; i < 3; i++) {
      const g = new THREE.TorusGeometry(1, 0.07, 12, 40, Math.PI / 2.2);
      const m = new THREE.Mesh(g, M.onda.clone()); m.rotation.z = -Math.PI / 4.4; const piv = new THREE.Group();
      piv.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; piv.add(m); laringe.add(piv); ondas.push({ m, i });
    }
  });

  /* -------- corpo: traqueia e pulmões (modo "corpo") -------- */
  tubo([[-4.88, -4.4], [-4.6, -6.5], [-4.2, -9.0]], 0.3, tuboGarg, grupos.corpo);
  add(grupos.corpo, new THREE.CapsuleGeometry(2.9, 6.5, 12, 32), torso, 0, -11.3, -3.4, 1.25, 1, 0.75);
  const pulmoes = [-1, 1].map((s) => add(grupos.corpo, esf(1, 40), M.pulmao, 1.6 * s, -11.6, -3.7, 1.25, 2.1, 1.1));
  [-1, 1].forEach((s) => tubo([[-4.2, -9.0], [-3.9, -10.0]].map(([z, y]) => [z, y]), 0.16, tuboGarg, grupos.corpo).position.x = 0.6 * s);

  /* -------- rosto de frente (pele com o buraco da boca), nariz, bochechas -------- */
  const mascara = new THREE.Mesh(new THREE.BufferGeometry(), M.pele); M.pele.side = THREE.DoubleSide; grupos.rosto.add(mascara);
  add(grupos.rosto, esf(1, 40), M.pele, 0, 1.42, 0.52, 0.56, 0.44, 0.48);
  [-1, 1].forEach((s) => add(grupos.rosto, esf(0.1, 16), M.narina, 0.2 * s, 1.16, 0.84, 1.3, 0.7, 0.8));
  [-1, 1].forEach((s) => { const b = add(grupos.rosto, new THREE.CircleGeometry(0.62, 40), M.bochecha, 2.0 * s, 0.75, -0.18); b.rotation.y = 0.5 * s; });

  /* -------- cavidade da boca (paredes macias por dentro) -------- */
  add(grupos.cavidade, esf(1, 48), M.cavidade, 0, -0.25, -2.5, 1.6, 1.95, 3.1);

  /* -------- céu da boca (metade do fundo, para o raio-X não esconder a língua) + "ossinho" do meio -------- */
  const arcoX = (z) => THREE.MathUtils.clamp(0.25 + Math.sqrt(Math.max(0, -z - 0.2)) * 0.68, 0.25, 1.25);
  {
    const NZ = 30, NX = 14, pos = [], idx = [];
    for (let i = 0; i <= NZ; i++) {
      const z = -0.48 - (3.35 * i) / NZ, yc = P.ceuY(z), ys = Math.min(0.58, yc), w = arcoX(z) + 0.05;
      for (let j = 0; j <= NX; j++) { const x = -w + (w + 0.06) * (j / NX), u = Math.min(1, Math.abs(x) / w); pos.push(x, yc - (yc - ys) * Math.pow(u, 2.2), z); }
    }
    for (let i = 0; i < NZ; i++) for (let j = 0; j < NX; j++) { const a = i * (NX + 1) + j, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    add(raiz, g, M.ceu, 0, 0, 0).renderOrder = 2;
    tubo(P.CEU.map(([z, y]) => [z, y + 0.2]), 0.1, M.osso, raiz);
    tubo(P.CEU.map(([z, y]) => [z, y + 0.06]), 0.11, M.veu, raiz);
  }

  /* -------- dentinhos (blocos brancos arredondados), arco de cima fixo, de baixo na mandíbula -------- */
  const ARCO = [[0.18, -0.27], [0.5, -0.4], [0.79, -0.68], [1.0, -1.08], [1.13, -1.62], [1.2, -2.25]];
  const TAM = [[0.34, 0.6, 0.2], [0.3, 0.52, 0.2], [0.3, 0.56, 0.26], [0.36, 0.44, 0.42], [0.42, 0.42, 0.5], [0.44, 0.4, 0.52]];
  const PONTA_C = [-0.05, 0.0, -0.02, 0.12, 0.15, 0.16], PONTA_B = [0.02, 0.03, 0.06, 0.1, 0.12, 0.12];
  const dentes = { cima: { '-1': [], 0: [], 1: [] }, baixo: { '-1': [], 0: [], 1: [] } };
  const matDente = { '-1': M.dente.clone(), 0: M.dente, 1: M.dente.clone() };
  const geoDente = TAM.map(([w, h, d]) => caixaRedonda(w, h, d, Math.min(w, d) * 0.42));
  [-1, 1].forEach((s) => ARCO.forEach(([x, z], i) => {
    const prox = ARCO[Math.min(5, i + 1)], ant = ARCO[Math.max(0, i - 1)];
    const ang = Math.atan2(prox[0] - ant[0], -(prox[1] - ant[1])); // gira o dente ao longo do arco
    const lado = i < 2 ? 0 : s;
    const c = new THREE.Mesh(geoDente[i], matDente[String(lado)]); c.position.set(x * s, PONTA_C[i] + TAM[i][1] / 2, z); c.rotation.y = s * (Math.PI / 2 - ang) * 0.9; raiz.add(c);
    c.userData.zona = 'dentes'; dentes.cima[lado].push(c);
    const b = new THREE.Mesh(geoDente[i], matDente[String(lado)]); b.scale.set(0.9, 0.92, 0.95);
    noMand(b, x * s * 0.9, PONTA_B[i] - (TAM[i][1] * 0.92) / 2 - (i < 2 ? 0.02 : 0), z - (i < 3 ? 0.17 : 0.05)); b.rotation.y = c.rotation.y; dentes.baixo[lado].push(b);
  }));

  /* -------- língua (loft) e véu (loft) -------- */
  M.lingua.clippingPlanes = [corte];
  const lingua = new Loft(46, 28); const mLingua = new THREE.Mesh(lingua.geo, M.lingua); raiz.add(mLingua);
  const veu = new Loft(22, 20); const mVeu = new THREE.Mesh(veu.geo, M.veu); raiz.add(mVeu);
  const LW = [0.46, 0.88, 1.08, 1.1, 0.96, 0.74, 0.5], LD = [0.4, 0.8, 1.25, 1.5, 1.2, 0.75, 0.4];

  /* -------- lábios (tubos macios) -------- */
  const mLabC = new THREE.Mesh(new THREE.BufferGeometry(), M.labio), mLabB = new THREE.Mesh(new THREE.BufferGeometry(), M.labio);
  raiz.add(mLabC, mLabB);
  const cantos = [-1, 1].map(() => { const m = new THREE.Mesh(esf(0.15, 20), M.labio); raiz.add(m); return m; });

  /* -------- ar (partículas) -------- */
  const NP = 90;
  const geoAr = new THREE.BufferGeometry(); const posAr = new Float32Array(NP * 3), corAr = new Float32Array(NP * 3);
  geoAr.setAttribute('position', new THREE.BufferAttribute(posAr, 3)); geoAr.setAttribute('color', new THREE.BufferAttribute(corAr, 3));
  const matAr = new THREE.PointsMaterial({ size: 0.26, map: texBolinha(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pontosAr = new THREE.Points(geoAr, matAr); pontosAr.frustumCulled = false; raiz.add(pontosAr);
  const part = Array.from({ length: NP }, (_, i) => ({ t: Math.random(), cam: i % 4, v: 0.75 + Math.random() * 0.5, j: (Math.random() - 0.5) * 0.18 }));

  /* -------- alvos invisíveis para tocar (exercícios) + marcador -------- */
  const ALVOS = { labios: [0, -0.05, 0.3, 0.55], dentes: [0, 0.2, -0.32, 0.34], alveolo: [0, 0.55, -0.85, 0.36], palato: [0, 1.25, -2.2, 0.62],
    veu: [0, 1.25, -4.25, 0.5], garganta: [0, -1.0, -5.0, 0.62], nariz: [0, 1.6, 0.4, 0.55], lingua: [0, 0.1, -2.6, 0.8], baixo: [0, -0.6, -1.6, 0.55],
    pregas: [0, -4.2, -4.9, 0.55], pulmoes: [0, -11.6, -3.7, 2.4] };
  const pegaveis = [];
  for (const [z, [x, y, zz, r]] of Object.entries(ALVOS)) { const m = add(raiz, esf(r, 16), M.pick, x, y, zz); m.userData.zona = z; pegaveis.push(m); }
  const marcador = add(raiz, esf(0.32, 32), M.alvo, 0, 0, 0);

  /* ------------------------------------------------------------------ estado */
  let atual = P.pose(opts.fonema || 'a'), de = atual, para = atual, idPara = opts.fonema || 'a', tIni = 0, dur = 0.5;
  let lento = false, congelada = null, modoAtual = opts.modo || 'frente', camVoo = null;
  const vis = Object.assign({}, CAMADAS[modoAtual]);
  let tempo = 0, ultimo = performance.now(), parado = false, rotulosOn = opts.rotulos !== false;
  let marcaT = -10, marcaOk = true;

  function fonema(id, { instantaneo = false } = {}) {
    if (!P.F[id]) return;
    de = atual; para = P.pose(id); idPara = id; tIni = tempo; dur = instantaneo ? 0.0001 : (lento ? 1.7 : 0.55); congelada = null;
  }
  function modo(m, { instantaneo = false } = {}) {
    if (!CAMS[m]) return;
    const fim = CAMS[m], ini = { pos: cam.position.clone(), alvo: ctl.target.clone(), fov: cam.fov };
    let via = null;
    if (m === 'dentro' && modoAtual !== 'dentro') via = [V3(0.0, 0.1, 3.4), V3(0.0, 0.1, 1.1), V3(0.0, 0.55, -0.7), V3(0.03, 0.95, -1.9)];
    if (modoAtual === 'dentro' && m !== 'dentro') via = [V3(0.03, 0.95, -1.9), V3(0.0, 0.55, -0.7), V3(0.0, 0.1, 1.4)];
    camVoo = { ini, fim, via, t0: tempo, dur: instantaneo ? 0.0001 : (via ? 3.0 : 1.5) };
    modoAtual = m;
    ctl.minDistance = m === 'dentro' ? 0.2 : 0.6;
  }

  /* -------- montagem a cada quadro -------- */
  const lab = { yC: 0, W: 1, z: 0.2 };
  function poseAgora() {
    if (congelada) return congelada;
    const k = Math.min(1, (tempo - tIni) / dur);
    atual = P.mistura(de, para, P.suave(k));
    const f = P.F[idPara], o = JSON.parse(JSON.stringify(atual)), vel = lento ? 0.4 : 1;
    // animações próprias de cada som (depois que a boca chegou na posição)
    const pronto = THREE.MathUtils.smoothstep(k, 0.7, 1);
    if (f.modo === 'tepe') { // "r" fraco: a ponta bate rapidinho no alvéolo
      const ph = ((tempo * vel) % 0.9) / 0.9, b = Math.exp(-Math.pow((ph - 0.35) / 0.075, 2)) * pronto;
      o.lin[0][1] += (0.5 - o.lin[0][1]) * b; o.lin[0][0] += (-0.8 - o.lin[0][0]) * b; o.lin[1][1] += 0.18 * b;
    }
    if (f.modo === 'plosiva') { // fecha… e solta de uma vez
      const ph = ((tempo * vel) % 1.8) / 1.8, r = ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) * pronto : 0;
      if (['p', 'b'].includes(f.id)) { o.ab += 0.42 * r; o.jaw += 3 * r; }
      if (['t', 'd'].includes(f.id)) { o.lin[0][1] -= 0.45 * r; o.lin[1][1] -= 0.25 * r; o.jaw += 2 * r; }
      if (['k', 'g'].includes(f.id)) { o.lin[3][1] -= 0.5 * r; o.lin[2][1] -= 0.15 * r; o.jaw += 2 * r; }
      o._solta = r; o._fase = ph;
    }
    if (f.modo === 'vibrante') { const v = Math.sin(tempo * 55 * vel) * 0.035 * pronto; o.lin[4][1] += v; o._uvula = v; }
    o._k = k;
    return o;
  }

  function montaLingua(o) {
    const pts = o.lin.map((p) => {
      const g = P.giraMand(p, o.jaw);
      return [p[0] + (g[0] - p[0]) * o.tj, p[1] + (g[1] - p[1]) * o.tj];
    });
    const raizP = P.giraMand([-4.35, -2.15], o.jaw * 0.5);
    pts.push(raizP);
    const ctrl = pts.map(([z, y], i) => ({ z, y, w: LW[i] * (i < 3 ? THREE.MathUtils.lerp(1, o.larg, i === 2 ? 0.5 : 1) : 1), d: LD[i] }));
    lingua.atualiza(ctrl);
    return pts;
  }
  function montaVeu(o) {
    const v = o.vel, uv = o._uvula || 0;
    const A = [[-3.72, 1.3], [-4.38, 1.52], [-4.98, 1.47]], B = [[-3.72, 1.3], [-4.22, 1.06], [-4.5, 0.58]];
    const ctrl = A.map((a, i) => ({ z: a[0] + (B[i][0] - a[0]) * v, y: a[1] + (B[i][1] - a[1]) * v + (i === 2 ? uv * 3 : 0), w: [1.0, 0.75, 0.24][i], d: [0.34, 0.36, 0.34][i] }));
    veu.atualiza(ctrl);
  }
  const curva = (pts) => new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  function montaLabios(o) {
    // Um anel macio só (tubo fechado) em volta da abertura: lábio de cima + lábio de baixo, cantinhos redondos.
    // abertura no meio (ab); o lábio de baixo acompanha a mandíbula; arredondar (arr) projeta e estreita;
    // "ld" = lábio de baixo sobe e encosta nos dentes de cima (f, v).
    const R = 0.23, W = o.lg * 1.0, zb = 0.22 + o.arr * 0.4;
    let yU = 0.05 + o.ab * 0.3;
    let yL = P.giraMand([0.15, -0.06], o.jaw)[1] - o.ab * 0.22;
    const junta = 1 - THREE.MathUtils.smoothstep(o.ab, 0.0, 0.14);       // lábios fechados se encostam
    const meio = (yU + yL) / 2; yU += (meio - yU) * junta; yL += (meio - yL) * junta;
    const ldY = -0.05 - 0.02;                                             // ponta dos dentes de cima
    if (o.ld > 0) yL += (ldY - yL) * o.ld;
    const yC = THREE.MathUtils.lerp(yU, yL, 0.55);
    const N = 15, cima = [], baixo = [], furo = [];
    for (let i = 0; i < N; i++) {
      const u = -1 + (2 * i) / (N - 1), m = Math.pow(Math.max(0, 1 - u * u), 0.6), x = W * u;
      const z = zb - 0.32 * u * u - o.arr * 0.15 * u * u;
      const yiU = yC + (yU - yC) * m - 0.035 * Math.exp(-u * u * 30) * (1 - o.arr);  // arco do cupido
      const yiL = yC + (yL - yC) * m;
      const g = 0.25 + 0.75 * Math.sqrt(Math.max(0, 1 - u * u));                      // mais fino nos cantos
      cima.push(V3(x, yiU + R * g, z));
      const zl = z + 0.03 - o.ld * m * (z + 0.06);                                    // lábio de baixo vai para trás no f/v
      baixo.push(V3(x * (1 - 0.06 * o.ld), yiL - R * g * 1.08, zl));
      furo.push([x, yiU, yiL]);
    }
    const anel = [...cima, ...baixo.slice(1, -1).reverse()];
    mLabC.geometry.dispose();
    mLabC.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(anel, true, 'centripetal'), 120, R, 22, true);
    mLabB.visible = false; cantos.forEach((c) => (c.visible = false));
    lab.yC = yC; lab.W = W; lab.z = zb; lab.yU = yU; lab.yL = yL;
    // pele com o buraco da boca: malha em anéis, do contorno do lábio (dentro) até um oval grande (fora)
    const NA = 72, NR = 16, borda = new THREE.CatmullRomCurve3(anel, true, 'centripetal').getSpacedPoints(NA);
    const pos = new Float32Array(NA * (NR + 1) * 3), yBaixo = yL - R * 2;
    for (let i = 0; i < NA; i++) {
      const p = borda[i], th = Math.atan2(p.y - yC, p.x);
      const fx = 4.2 * Math.cos(th), fy = yC + 3.6 * Math.sin(th);
      for (let r = 0; r <= NR; r++) {
        const t = Math.pow(r / NR, 1.6), x = p.x + (fx - p.x) * t, y = p.y + (fy - p.y) * t;
        let z = 0.08 - 0.1 * x * x - 0.04 * (y - 0.3) * (y - 0.3) + 0.1 * Math.exp(-(x * x) / 0.9 - Math.pow(y - 0.85, 2) / 0.3);
        z = z + (p.z - 0.12 - z) * Math.pow(1 - t, 3);            // junto do lábio, a pele encosta atrás dele
        let yy = y, zz = z;
        const w = THREE.MathUtils.clamp((yBaixo - y) / 1.4, 0, 1) * THREE.MathUtils.clamp(1 - Math.abs(x) / 3.8, 0, 1);
        if (w > 0) { const q = P.giraMand([z, y], o.jaw * w * 0.8); zz = q[0]; yy = q[1]; }
        const k = (i * (NR + 1) + r) * 3; pos[k] = x; pos[k + 1] = yy; pos[k + 2] = zz;
      }
    }
    if (!mascara.geometry.index) {
      const idx = [];
      for (let i = 0; i < NA; i++) for (let r = 0; r < NR; r++) { const a = i * (NR + 1) + r, b = ((i + 1) % NA) * (NR + 1) + r; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g0 = new THREE.BufferGeometry(); g0.setIndex(idx); g0.setAttribute('position', new THREE.BufferAttribute(pos, 3)); mascara.geometry.dispose(); mascara.geometry = g0;
    } else { mascara.geometry.attributes.position.array.set(pos); mascara.geometry.attributes.position.needsUpdate = true; }
    mascara.geometry.computeVertexNormals(); mascara.geometry.computeBoundingSphere();

  }

  function caminhoAr(o, ptsL) {
    // ar pela boca: sobe pela garganta, passa entre a língua e o céu da boca, sai entre os lábios
    const meio = (i) => { const [z, y] = ptsL[i]; return V3(0, (y + Math.max(P.ceuY(z), y + 0.05)) / 2 + 0.05, z); };
    const oral = [V3(0, -4.0, -4.9), V3(0, -1.6, -4.98), V3(0, 0.55, -4.9), meio(3), meio(2), meio(1), V3(0, Math.max(lab.yC, -0.2), -0.25), V3(0, lab.yC, 0.55), V3(0, lab.yC - 0.15, 2.2)];
    const nasal = [V3(0, -4.0, -4.9), V3(0, -1.6, -5.0), V3(0, 1.05, -5.0), ...NARIZ.map(([z, y]) => V3(0, y, z)), V3(0, 0.95, 1.9)];
    return { oral: curva(oral), nasal: curva(nasal) };
  }

  const tmp = new THREE.Vector3();
  function atualizaAr(o, ptsL, dt) {
    const f = P.F[idPara], k = o._k;
    const ar = k > 0.6 ? f.ar : 'nenhum';
    const { oral, nasal } = caminhoAr(o, ptsL);
    const vel = (lento ? 0.35 : 1) * (f.modo === 'fricativa' ? 0.75 : 0.42);
    const fechaT = { p: 0.9, b: 0.9, t: 0.8, d: 0.8, k: 0.5, g: 0.5 }[f.id];
    const segura = f.modo === 'plosiva' && !(o._solta > 0.05);
    for (let i = 0; i < NP; i++) {
      const p = part[i];
      let curvaP = null, x = 0, ativo = false;
      if (p.cam < 2 && (ar === 'oral' || ar === 'oral+nasal' || ar === 'lateral')) { curvaP = oral; ativo = true; if (ar === 'lateral') x = p.cam ? 0.62 : -0.62; }
      if (p.cam >= 2 && (ar === 'nasal' || ar === 'oral+nasal')) { curvaP = nasal; ativo = true; }
      if (p.cam >= 2 && ar === 'oral') { curvaP = oral; ativo = true; }
      if (f.modo === 'plosiva' && p.cam >= 2) { curvaP = oral; ativo = true; }
      p.t += dt * vel * p.v * (f.modo === 'plosiva' && o._solta > 0.05 ? 3.2 : 1);
      if (segura && fechaT && p.t > fechaT) p.t = fechaT - Math.random() * 0.04;
      if (p.t > 1) p.t -= 1;
      const o3 = i * 3;
      if (!ativo || !curvaP) { posAr[o3 + 1] = -999; continue; }
      curvaP.getPointAt(Math.min(0.999, p.t), tmp);
      // lateral: o ar desvia pelos lados da língua na frente
      const lat = ar === 'lateral' && p.t > 0.45 && p.t < 0.86 ? Math.sin(((p.t - 0.45) / 0.41) * Math.PI) : 0;
      posAr[o3] = tmp.x + x * lat + p.j * 0.6; posAr[o3 + 1] = tmp.y + p.j * 0.5 - lat * 0.18; posAr[o3 + 2] = tmp.z;
      const fade = Math.min(1, p.t * 6, (1 - p.t) * 5) * (f.modo === 'fricativa' ? 1.15 : 0.9);
      corAr[o3] = 0.62 * fade; corAr[o3 + 1] = 0.93 * fade; corAr[o3 + 2] = 1.0 * fade;
    }
    geoAr.attributes.position.needsUpdate = true; geoAr.attributes.color.needsUpdate = true;
    matAr.size = f.modo === 'fricativa' ? 0.19 : 0.26;
  }

  function aplicaCamadas(dt) {
    const alvo = CAMADAS[modoAtual], k = Math.min(1, dt * 3.2);
    for (const c in vis) vis[c] += (alvo[c] - vis[c]) * k;
    const op = (mat, v) => { mat.opacity = v; mat.transparent = v < 0.999; mat.depthWrite = v > 0.6; };
    grupos.rosto.visible = vis.rosto > 0.02; op(M.pele, vis.rosto); op(M.narina, vis.rosto); M.bochecha.opacity = 0.22 * vis.rosto;
    grupos.casca.visible = cascaMand.visible = vis.casca > 0.02; casca.uniforms.opac.value = vis.casca * 0.9; cabelo.uniforms.opac.value = vis.casca * 0.55;
    grupos.cavidade.visible = vis.cavidade > 0.02; op(M.cavidade, vis.cavidade);
    grupos.tubos.visible = vis.tubos > 0.02; tuboNariz.uniforms.opac.value = vis.tubos * 0.8; tuboGarg.uniforms.opac.value = vis.tubos * 0.7;
    grupos.corpo.visible = vis.corpo > 0.02; torso.uniforms.opac.value = vis.corpo * 0.6; M.pulmao.opacity = vis.corpo * 0.92;
    { const v = Math.max(vis.rosto, vis.cavidade); M.ceu.opacity = v; M.ceu.transparent = v < 0.999; M.ceu.depthWrite = v > 0.9; M.ceu.visible = v > 0.05; }
    olhos.visible = vis.casca > 0.3 || modoAtual === 'frente';
    olhos.children.forEach((o) => { o.visible = tmp.copy(cam.position).sub(ctl.target).normalize().x * o.userData.s > -0.5; });
    // dentes do lado de perto da câmera somem quando a câmera está de lado (para ver a língua)
    const dir = tmp.copy(cam.position).sub(ctl.target).normalize();
    [-1, 1].forEach((s) => { const v = THREE.MathUtils.clamp(1 - (dir.x * s - 0.25) / 0.35, 0, 1); const m = matDente[String(s)]; m.opacity = v; m.transparent = v < 0.999; m.depthWrite = v > 0.5; m.visible = v > 0.03; });
  }

  function voaCamera() {
    if (!camVoo) return;
    const { ini, fim, via, t0, dur: d } = camVoo, k = P.suave(Math.min(1, (tempo - t0) / d));
    if (via) {
      const c = curva([ini.pos, ...via, fim.pos]); c.getPoint(k, cam.position);
    } else cam.position.lerpVectors(ini.pos, fim.pos, k);
    ctl.target.lerpVectors(ini.alvo, fim.alvo, k);
    cam.fov = THREE.MathUtils.lerp(ini.fov, fim.fov, k); cam.updateProjectionMatrix();
    if (k >= 1) camVoo = null;
  }

  /* -------- rótulos HTML (projeção 3D → tela) -------- */
  const camadaRot = document.createElement('div'); camadaRot.className = 'esp3d-rotulos'; container.appendChild(camadaRot);
  const svgLinhas = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svgLinhas.setAttribute('class', 'esp3d-linhas'); camadaRot.appendChild(svgLinhas);
  const ROT = [
    ['nariz', 'nariz', () => V3(0, 1.3, 0.85), [-150, -40]], ['labios', 'lábios', () => V3(0, lab.yC - 0.25, lab.z + 0.2), [-150, 40]],
    ['dentes', 'dentes', () => V3(0, 0.25, -0.3), [-150, -6]], ['palato', 'céu da boca', () => V3(0, P.ceuY(-2.2) + 0.05, -2.2), [70, -125]],
    ['veu', 'véu (céu mole)', () => V3(0, 1.35, -4.35), [120, -70]], ['lingua', 'língua', () => V3(0, 0.0, -2.6), [150, 40]],
    ['garganta', 'garganta (voz)', () => V3(0, -4.2, -4.9), [140, 10]], ['pulmoes', 'pulmões (ar)', () => V3(1.6, -11.6, -3.7), [130, 0], 'corpo'],
    ['pregas', 'pregas vocais', () => V3(0, -4.2, -4.9), [-170, 40], 'corpo']
  ].map(([id, nome, ancora, off, so]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esp3d-rot'; b.textContent = nome; b.dataset.zona = id;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); svgLinhas.appendChild(l); camadaRot.appendChild(b);
    b.addEventListener('click', (e) => { e.stopPropagation(); ouvintes.forEach((cb) => cb({ zona: id, rotulo: true })); });
    return { id, b, l, ancora, off, so };
  });
  function atualizaRotulos() {
    const w = W0(), h = H0(), op = rotulosOn ? vis.rotulos : 0;
    camadaRot.style.opacity = op; camadaRot.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
    svgLinhas.setAttribute('viewBox', `0 0 ${w} ${h}`);
    ROT.forEach((r) => {
      const so = r.so === 'corpo' ? vis.corpo : 1;
      const p = r.ancora().project(cam), x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h;
      const esc = Math.min(1, w / 900), lx = x + r.off[0] * esc, ly = y + r.off[1] * esc;
      const fora = p.z > 1 || so < 0.3;
      r.b.style.display = r.l.style.display = fora ? 'none' : '';
      r.b.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;
      r.l.setAttribute('x1', x); r.l.setAttribute('y1', y); r.l.setAttribute('x2', lx); r.l.setAttribute('y2', ly);
    });
  }

  /* -------- toque (exercícios) -------- */
  const ouvintes = [];
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let baixo = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { baixo = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!baixo || Math.hypot(e.clientX - baixo[0], e.clientY - baixo[1]) > 7) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const vis2 = pegaveis.filter((m) => m.userData.zona !== 'pulmoes' || vis.corpo > 0.5);
    const hit = ray.intersectObjects(vis2, false);
    // o menor alvo atingido vence (o raio passa por vários)
    hit.sort((a, b) => a.object.geometry.parameters.radius - b.object.geometry.parameters.radius);
    if (hit.length) ouvintes.forEach((cb) => cb({ zona: hit[0].object.userData.zona, ponto: hit[0].point }));
  });
  function destacar(zona, ok = true) {
    const a = ALVOS[zona]; if (!a) return;
    marcador.position.set(a[0], a[1], a[2]); marcador.scale.setScalar(a[3] / 0.32 * 0.8); marcaT = tempo; marcaOk = ok;
    M.alvo.color.set(ok ? 0xffe08a : 0xa8d5f2);
  }

  /* ------------------------------------------------------------------ laço */
  function quadro() {
    if (parado) return;
    const agora = performance.now(), dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora; tempo += dt;
    const o = poseAgora();
    mand.rotation.x = THREE.MathUtils.degToRad(o.jaw); if (vis.casca > 0.02) cabeca.atualiza(o.jaw);
    const ptsL = montaLingua(o); montaVeu(o); montaLabios(o);
    // voz: pregas vibram e as ondinhas douradas saem da garganta
    const voz = o.voz * THREE.MathUtils.smoothstep(o._k, 0.5, 1), vf = lento ? 6 : 16;
    pregas.forEach((m) => { m.position.x = m.userData.s * (0.17 - 0.05 * voz * (0.5 + 0.5 * Math.sin(tempo * vf * Math.PI * 2))); });
    ondas.forEach(({ m, i }) => { const ph = (tempo * (lento ? 0.4 : 1.1) + i / 3) % 1; m.scale.setScalar(0.65 + ph * 1.1); m.material.opacity = voz * Math.min(1, (1 - ph) * 1.6); m.visible = voz > 0.02; });
    pulmoes.forEach((p, i) => { p.scale.set(1.25, 2.1, 1.1).multiplyScalar(1 + 0.05 * Math.sin(tempo * 1.6)); });
    atualizaAr(o, ptsL, dt);
    // marcador do exercício
    const mt = tempo - marcaT; M.alvo.opacity = mt < 2.2 ? (1 - mt / 2.2) * (0.55 + 0.25 * Math.sin(mt * 12)) : 0;
    aplicaCamadas(dt); voaCamera(); ctl.update(dt);
    renderer.render(cena, cam);
    atualizaRotulos();
    requestAnimationFrame(quadro);
  }

  const ro = new ResizeObserver(() => { renderer.setSize(W0(), H0()); cam.aspect = W0() / H0(); cam.updateProjectionMatrix(); });
  ro.observe(container);
  // começa já no lugar
  { const c = CAMS[modoAtual]; cam.position.copy(c.pos); ctl.target.copy(c.alvo); cam.fov = c.fov; cam.updateProjectionMatrix(); }
  quadro();

  return {
    tipo: '3d',
    fonema, modo,
    get modoAtual() { return modoAtual; },
    get fonemaAtual() { return idPara; },
    lento(v) { lento = !!v; },
    girar(v) { ctl.autoRotate = !!v; },
    rotulos(v) { rotulosOn = !!v; },
    destacar,
    onToque(cb) { ouvintes.push(cb); },
    // congela uma pose intermediária (para capturas de quadro a quadro): mistura de a para b em f (0–1)
    pose(a, b, f) { idPara = b; congelada = Object.assign(P.mistura(P.pose(a), P.pose(b), P.suave(f)), { _k: f }); atual = congelada; },
    solta() { congelada = null; },
    destruir() { parado = true; ro.disconnect(); renderer.dispose(); container.innerHTML = ''; }
  };
}
