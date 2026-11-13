// FONEMA · Mundo 3D — protótipo navegável (arquipélago + vila)
// Parâmetros de URL: ?view=arquipelago|voo|vila|vila34|praca|biblioteca|entardecer|noite|<id da ilha>
//   &tod=0|1|2 (dia/entardecer/noite) &q=alto|medio|leve &hud=0|1 &painel=0|1 &capture=1 &t=segundos
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Merger, lerp, clamp, ease, smooth } from './util.js';
import { loadFonts, svgSprite, pinTexture, radialTexture, SOFIA_SVG, BOLOTA_SVG, SOFIA_BUST_SVG } from './art.js';
import { ISLANDS, makeSky, makeSea, buildIslands, buildRoutes, makeClouds, makeBoat, makeBalloon, makeBirds, ctxPins, EXTRA_ISLETS } from './world.js';
import { buildVila, VILA } from './vila.js';
import { WorldAudio } from './audio.js';

const P = new URLSearchParams(location.search);
const CAPTURE = P.has('capture');
let Q = P.get('q') || autoQuality();
const $ = (s) => document.querySelector(s);

function autoQuality() {
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  if (mem <= 2 || cores <= 4 && /Android/i.test(navigator.userAgent)) return 'leve';
  if (mem <= 4) return 'medio';
  return 'alto';
}
const QCFG = {
  alto: { dpr: 2, shadow: 2048, post: 'full', petals: 700, flies: 260, confetti: 500, clouds: 16, detail: true },
  medio: { dpr: 1.5, shadow: 1024, post: 'bloom', petals: 260, flies: 110, confetti: 220, clouds: 12, detail: true },
  leve: { dpr: 1, shadow: 0, post: 'none', petals: 80, flies: 40, confetti: 90, clouds: 7, detail: false },
};

await loadFonts();

// ---------------- RENDERER / CENA ----------------
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: CAPTURE, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#FCEBCB', 200, 900);
const camera = new THREE.PerspectiveCamera(38, 16 / 10, 0.5, 6000);
camera.position.set(40, 300, 260);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 7; controls.maxDistance = 560; controls.maxPolarAngle = 1.36; controls.screenSpacePanning = false;
controls.target.set(20, 0, -95);

const U = { time: { value: 0 } };
const world = new THREE.Group(); scene.add(world);

// ---------------- MATERIAIS ----------------
function addWind(mat, amp) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.time; sh.uniforms.uWind = { value: amp };
    sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { vec4 wp = modelMatrix * vec4(transformed, 1.0); float h = max(0.0, wp.y - 2.4);
        float s = sin(uTime*1.6 + wp.x*0.33 + wp.z*0.21) + 0.45*sin(uTime*2.7 + wp.x*0.9 + wp.z*0.6);
        transformed.x += s * h * uWind; transformed.z += cos(uTime*1.25 + wp.z*0.31) * h * uWind * 0.6; }`);
  };
  mat.customProgramCacheKey = () => 'wind' + amp;
  return mat;
}
const std = (o = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, flatShading: true, ...o });
const MAT = {
  main: std(),
  foliage: addWind(std({ roughness: 0.8 }), 0.014),
  detail: addWind(std(), 0.02),
  thin: addWind(std({ side: THREE.DoubleSide }), 0.03),
  win: std({ emissive: new THREE.Color('#FFB35A'), emissiveIntensity: 0, roughness: 0.4 }),
  flag: std({ side: THREE.DoubleSide }),
  cloud: std({ emissive: new THREE.Color('#FFFFFF'), emissiveIntensity: 0.12, roughness: 1 }),
};
const signMats = [];

// ---------------- CONSTRUÇÃO ----------------
const dyn = { flags: [], windmills: [], flagMat: MAT.flag };
const labelSprites = [];
const detailMeshes = [];
function layerSet(seed) { return { m: new Merger(seed), d: new Merger(seed + 1), f: new Merger(seed + 2), w: new Merger(seed + 3), thin: new Merger(seed + 4) }; }
function flush(L, name) {
  const out = [];
  const add = (mg, mat, opt, isDetail) => { if (!mg.tris) return; const me = mg.build(mat, opt); me.name = name; world.add(me); out.push(me); if (isDetail) detailMeshes.push(me); };
  add(L.m, MAT.main); add(L.f, MAT.foliage); add(L.d, MAT.detail, { cast: false }, true); add(L.w, MAT.win, { cast: false }); add(L.thin, MAT.thin, { cast: false });
  return out;
}
// Vila (ilha inicial) — camadas próprias (culling separado do resto do arquipélago)
const LV = layerSet(100);
const { islandTerrain } = await import('./nature.js');
islandTerrain(LV.m, { ...VILA, seed: 11, grass: '#7CC46A', grass2: '#69B35B', flat: true });
const V = buildVila({ ...LV, group: world, renderer, signMats });
flush(LV, 'vila');
// Demais ilhas
const LA = layerSet(200);
buildIslands({ ...LA, group: world, renderer, dyn, labelSprites, flagMat: MAT.flag });
buildRoutes(LA.m, LA.d);
flush(LA, 'arquipelago');

// céu, mar, estrelas
const sky = makeSky(); scene.add(sky.mesh);
const sea = makeSea([...ISLANDS, ...EXTRA_ISLETS]); scene.add(sea.mesh);
const stars = (() => {
  const n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = Math.random(), v = Math.random() * 0.9 + 0.08, th = u * Math.PI * 2, ph = Math.asin(v); pos.set([Math.cos(th) * Math.cos(ph) * 2000, Math.sin(ph) * 2000, Math.sin(th) * Math.cos(ph) * 2000], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: '#FFF4D6', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
})();
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,250,235,1)', 'rgba(255,250,235,0)'), color: '#FFF6E0', transparent: true, opacity: 0, fog: false, depthWrite: false }));
moon.scale.set(160, 160, 1); scene.add(moon);

// luzes
const hemi = new THREE.HemisphereLight('#CFE6FF', '#E8C9A0', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#FFF0D8', 2.6); sun.castShadow = true; scene.add(sun); scene.add(sun.target);
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
const praçaLights = [[0, 6, 2], [-8, 5, -8], [8, 5, -8]].map(([x, y, z]) => { const l = new THREE.PointLight('#FFB35A', 0, 26, 1.6); l.position.set(x, y, z); scene.add(l); return l; });

// nuvens, barco, balão, pássaros
const clouds = makeClouds(MAT.cloud, 16); clouds.forEach((c) => scene.add(c));
const boat = makeBoat(MAT.main); scene.add(boat);
const boat2 = makeBoat(MAT.main); boat2.scale.setScalar(0.8); scene.add(boat2);
const balloon = makeBalloon(MAT.main); scene.add(balloon);
const birds = makeBirds(MAT.flag, 7); birds.forEach((b) => scene.add(b));

// ---------------- PERSONAGENS 2D (billboards ilustrados) ----------------
const blobTex = radialTexture('rgba(40,22,10,0.42)', 'rgba(40,22,10,0)');
function blob(x, y, z, sx, sz) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, y + 0.14, z); m.renderOrder = 1; world.add(m); return m; }
const charSprites = [];
async function character(svg, pos, height, scale = 1) {
  const t = await svgSprite(svg, renderer, { scale, outline: 12 });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, alphaTest: 0.5, transparent: false }));
  s.center.set(0.5, 0.02); s.scale.set(height * t.userData.aspect, height, 1); s.position.copy(pos);
  s.userData.h = height; world.add(s); charSprites.push(s); return s;
}
const sofia = await character(SOFIA_SVG, V.sofia, 2.15, 1.2);
const bolota = await character(BOLOTA_SVG, V.bolota, 0.95, 0.9);
blob(V.sofia.x, V.sofia.y, V.sofia.z, 1.9, 1.0); blob(V.bolota.x, V.bolota.y, V.bolota.z, 1.6, 0.8);
// pino "você está aqui" na ilha atual
const pinT = await pinTexture(renderer);
const pins = ctxPins.map((p) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pinT, depthTest: true })); s.center.set(0.5, 0); s.scale.set(9 * pinT.userData.aspect, 9, 1); s.position.copy(p).add(new THREE.Vector3(0, 1, 0)); s.userData.base = s.position.y; scene.add(s); charSprites.push(s); return s; });
$('#avatar').innerHTML = SOFIA_BUST_SVG;

// ---------------- PARTÍCULAS ("4D") ----------------
const PU = { uTime: U.time, uScale: { value: 800 }, uNight: { value: 0 }, uCel: { value: -100 }, uDay: { value: 1 } };
function points(n, attrs, vs, fs, opts = {}) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  for (const [k, sz, fn] of attrs) { const a = new Float32Array(n * sz); for (let i = 0; i < n; i++) a.set(fn(i), i * sz); g.setAttribute(k, new THREE.BufferAttribute(a, sz)); }
  fs = fs.replace(/}\s*$/, '\n#include <colorspace_fragment>\n}');
  const m = new THREE.ShaderMaterial({ uniforms: PU, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, ...opts });
  const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
}
const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const ptsFrag = `varying vec3 vCol; varying float vA;
  void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float a = smoothstep(0.5, 0.25, d) * vA; gl_FragColor = vec4(vCol, a); }`;
const petalPts = (n) => points(n,
  [['seed', 4, () => [R() * 2 - 1, R() * 2 - 1, R(), R()]], ['col', 3, (i) => (i % 2 ? [0.93, 0.5, 0.7] : [0.97, 0.8, 0.3])]],
  `attribute vec4 seed; attribute vec3 col; uniform float uTime, uScale; varying vec3 vCol; varying float vA;
   void main(){ float t = uTime*0.35 + seed.z*20.0; float fall = fract(t*0.08 + seed.w);
     vec3 p = vec3(seed.x*34.0 + sin(t*1.3+seed.w*9.)*2.5 + fall*14.0, 2.6 + (1.0-fall)*11.0, seed.y*34.0 + cos(t*1.1+seed.z*7.)*2.0 + fall*6.0);
     vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(0.32*uScale/-mv.z, 1.0, 22.0);
     vCol = col; vA = smoothstep(0.0,0.08,fall)*smoothstep(1.0,0.9,fall); }`, ptsFrag);
const fireflyPts = (n) => points(n,
  [['seed', 4, () => [R() * 2 - 1, R() * 2 - 1, R(), R()]]],
  `attribute vec4 seed; uniform float uTime, uScale, uNight; varying vec3 vCol; varying float vA;
   void main(){ float t = uTime*0.5 + seed.w*30.0; float rr = 8.0 + seed.z*30.0; float a = atan(seed.y, seed.x)*3.0;
     vec3 p = vec3(cos(a)*rr + sin(t*0.7)*2.0, 3.0 + seed.z*3.5 + sin(t*1.3+seed.x*5.)*0.8, sin(a)*rr + cos(t*0.6)*2.0);
     vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(0.55*uScale/-mv.z, 1.5, 30.0);
     vCol = vec3(1.0, 0.92, 0.45)*3.0; vA = uNight * (0.35 + 0.65*pow(0.5+0.5*sin(t*3.1+seed.x*20.), 3.0)); }`, ptsFrag, { blending: THREE.AdditiveBlending });
const lampPts = points(V.lampTops.length,
  [['p0', 3, (i) => V.lampTops[i].toArray()]],
  `attribute vec3 p0; uniform float uScale, uNight; varying vec3 vCol; varying float vA;
   void main(){ vec4 mv = modelViewMatrix*vec4(p0,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(4.5*uScale/-mv.z, 2.0, 220.0); vCol = vec3(1.0,0.72,0.35)*1.6; vA = uNight*0.55; }`,
  `varying vec3 vCol; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = pow(max(0.0,1.0-d*2.0),2.2)*vA; gl_FragColor = vec4(vCol, a); }`, { blending: THREE.AdditiveBlending });
const smokePts = points(10,
  [['seed', 1, (i) => [i / 10]]],
  `attribute float seed; uniform float uTime, uScale; varying vec3 vCol; varying float vA;
   void main(){ float f = fract(uTime*0.12 + seed); vec3 p = vec3(${V.chimney.x.toFixed(2)} + f*3.5 + sin(f*6.0+seed*9.)*0.5, ${V.chimney.y.toFixed(2)} + f*9.0, ${V.chimney.z.toFixed(2)} + f*1.5);
     vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp((0.9+f*2.6)*uScale/-mv.z, 1.0, 400.0); vCol = vec3(0.98,0.96,0.93); vA = 0.55*smoothstep(0.0,0.1,f)*(1.0-f); }`,
  `varying vec3 vCol; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(vCol, smoothstep(0.5,0.2,d)*vA); }`);
const confettiPts = (n) => points(n,
  [['seed', 4, () => [R() * 2 - 1, R() * 2 - 1, R(), R()]], ['col', 3, (i) => [[0.95, 0.7, 0.24], [0.7, 0.24, 0.38], [0.12, 0.43, 0.51], [0.18, 0.54, 0.29], [0.42, 0.36, 0.66], [1, 0.98, 0.95]][i % 6]]],
  `attribute vec4 seed; attribute vec3 col; uniform float uTime, uScale, uCel; varying vec3 vCol; varying float vA;
   void main(){ float t = uTime - uCel; vec3 v = normalize(vec3(seed.x, 1.6 + seed.z, seed.y)) * (9.0 + seed.w*7.0);
     vec3 p = vec3(${V.PC.x.toFixed(2)}, ${(V.PC.y + 7.5).toFixed(2)}, ${V.PC.z.toFixed(2)}) + v*t*0.85 + vec3(0.0, -6.5, 0.0)*t*t + vec3(sin(t*4.0+seed.w*20.)*0.6, 0.0, cos(t*3.0+seed.z*20.)*0.6)*t;
     p.y = max(p.y, 2.75);
     vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(0.45*uScale/-mv.z*(0.6+0.4*abs(sin(t*8.0+seed.w*30.))), 1.0, 40.0);
     vCol = col; vA = (t > 0.0 && t < 5.0) ? smoothstep(5.0, 3.5, t) : 0.0; }`,
  `varying vec3 vCol; varying float vA; void main(){ vec2 c = abs(gl_PointCoord-0.5); if(max(c.x,c.y)>0.5) discard; gl_FragColor = vec4(vCol, vA); }`);
let petals, flies, confetti;
function buildParticles() {
  [petals, flies, confetti].forEach((p) => p && scene.remove(p));
  const c = QCFG[Q]; petals = petalPts(c.petals); flies = fireflyPts(c.flies); confetti = confettiPts(c.confetti);
}
buildParticles();

// ---------------- COLISORES (clique numa ilha) ----------------
const colliders = ISLANDS.map((I) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(I.r * 1.15, I.r * 1.15, 14, 16), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(I.x, I.H, I.z); m.userData.island = I; scene.add(m); return m; });

// ---------------- PÓS-PROCESSAMENTO ----------------
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uWarm: { value: 0.04 }, uVig: { value: 0.28 }, uSat: { value: 1.06 }, uTime: U.time, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uWarm, uVig, uSat; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;
      float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, uSat);
      col *= vec3(1.0 + uWarm, 1.0 + uWarm*0.35, 1.0 - uWarm*0.6);
      vec2 q = vUv - 0.5; q.x *= uRes.x/uRes.y; float v = smoothstep(0.35, 1.05, length(q)*1.15);
      col = mix(col, col*vec3(0.62,0.5,0.42), v*uVig);
      col *= 1.0 + (h(floor(vUv*uRes/2.0)) - 0.5)*0.025; // grão de papel, estático
      gl_FragColor = vec4(col, c.a); }`,
};
let composer = null, passes = {};
function setupPost() {
  composer = null; passes = {};
  const cfg = QCFG[Q];
  document.body.classList.toggle('leve', cfg.post === 'none');
  if (cfg.post === 'none') { renderer.toneMapping = THREE.ACESFilmicToneMapping; return; }
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  composer = new EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));
  const hideFor = (pass) => { const orig = pass.render.bind(pass); pass.render = (...a) => { const hidden = [sea.mesh, sky.mesh, stars, moon, ...labelSprites, ...charSprites, petals, flies, confetti, lampPts, smokePts]; const vis = hidden.map((o) => o.visible); hidden.forEach((o) => (o.visible = false)); orig(...a); hidden.forEach((o, i) => (o.visible = vis[i])); }; };
  if (cfg.post === 'full') {
    const ao = new GTAOPass(scene, camera, Math.round(size.x / 2), Math.round(size.y / 2));
    ao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 12 });
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    ao.blendIntensity = 0.75; hideFor(ao); composer.addPass(ao); passes.ao = ao;
    const dof = new BokehPass(scene, camera, { focus: 30, aperture: 0.0005, maxblur: 0.0045 });
    hideFor(dof); dof.enabled = false; composer.addPass(dof); passes.dof = dof;
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / (cfg.post === 'full' ? 1 : 2), size.y / (cfg.post === 'full' ? 1 : 2)), 0.32, 0.55, 0.88);
  composer.addPass(bloom); passes.bloom = bloom;
  const grade = new ShaderPass(GradeShader); grade.uniforms.uRes.value.set(size.x, size.y); composer.addPass(grade); passes.grade = grade;
  composer.addPass(new OutputPass());
}

function applyQuality(q) {
  Q = q; const cfg = QCFG[q];
  renderer.setPixelRatio(CAPTURE ? (window.devicePixelRatio || 1) : Math.min(window.devicePixelRatio || 1, cfg.dpr));
  renderer.shadowMap.enabled = cfg.shadow > 0; sun.castShadow = cfg.shadow > 0;
  const sm = CAPTURE && cfg.shadow ? 4096 : cfg.shadow || 512;
  if (sun.shadow.mapSize.x !== sm) { sun.shadow.mapSize.set(sm, sm); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  detailMeshes.forEach((m) => (m.visible = cfg.detail));
  clouds.forEach((c, i) => (c.visible = i < cfg.clouds));
  praçaLights.forEach((l) => (l.visible = q !== 'leve'));
  scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  buildParticles(); resize(); setupPost();
  document.querySelectorAll('#g-q button').forEach((b) => b.classList.toggle('on', b.dataset.q === q));
  audio.setQuality(q);
}

// ---------------- DIA / ENTARDECER / NOITE ----------------
const TOD = [
  { top: '#4EA6DF', mid: '#A2D5EE', hor: '#FCEBCB', sun: [-0.52, 0.72, 0.46], sunCol: '#FFF0D6', sunI: 2.7, glow: 0.35, hemiS: '#D2E8FF', hemiG: '#E9CDA4', hemiI: 1.15, fog: '#F6E6CC',
    deep: '#1B8DB3', mid2: '#2BB0C6', shallow: '#73DED3', foam: '#F4FFF8', win: 0.0, night: 0, exp: 1.0, tint: '#FFFFFF', warm: 0.035, glint: 1 },
  { top: '#5468A8', mid: '#E39AA0', hor: '#FFB46E', sun: [-0.86, 0.2, -0.12], sunCol: '#FF9E5E', sunI: 2.2, glow: 0.9, hemiS: '#9DA2DA', hemiG: '#D49070', hemiI: 0.95, fog: '#F2AE86',
    deep: '#35609A', mid2: '#5E86B0', shallow: '#E9A485', foam: '#FFE8D2', win: 1.4, night: 0.45, exp: 1.02, tint: '#FFE2CC', warm: 0.07, glint: 1.2 },
  { top: '#0D1838', mid: '#22305E', hor: '#4A4C7A', sun: [0.35, 0.62, -0.5], sunCol: '#BFD0FF', sunI: 0.55, glow: 0.15, hemiS: '#3A4C8A', hemiG: '#2E2A40', hemiI: 0.55, fog: '#2A3258',
    deep: '#0F2848', mid2: '#173A60', shallow: '#2F6C84', foam: '#B9D6F0', win: 2.4, night: 1, exp: 1.08, tint: '#B9C4F0', warm: -0.01, glint: 0.4 },
];
let todNow = Number(P.get('tod') || 0), todTarget = todNow;
const _ca = new THREE.Color(), _cb = new THREE.Color();
const mixC = (a, b, t) => _ca.set(a).lerp(_cb.set(b), t).clone();
function applyTOD(v) {
  const i = Math.min(1, Math.floor(v)), t = clamp(v - i, 0, 1), A = TOD[i], B = TOD[i + 1];
  const c = (k) => mixC(A[k], B[k], t), n = (k) => lerp(A[k], B[k], t);
  sky.u.top.value.copy(c('top')); sky.u.mid.value.copy(c('mid')); sky.u.hor.value.copy(c('hor'));
  const sd = new THREE.Vector3(...A.sun).lerp(new THREE.Vector3(...B.sun), t).normalize();
  sky.u.sunDir.value.copy(sd); sky.u.sunCol.value.copy(c('sunCol')); sky.u.sunGlow.value = n('glow') * (1 - smooth(clamp((v - 1.3) / 0.7, 0, 1)));
  sun.color.copy(c('sunCol')); sun.intensity = n('sunI'); sun.userData.dir = sd;
  hemi.color.copy(c('hemiS')); hemi.groundColor.copy(c('hemiG')); hemi.intensity = n('hemiI');
  scene.fog.color.copy(c('fog')); sea.u.uFogColor.value.copy(c('fog'));
  sea.u.uDeep.value.copy(c('deep')); sea.u.uMid.value.copy(c('mid2')); sea.u.uShallow.value.copy(c('shallow')); sea.u.uFoam.value.copy(c('foam'));
  sea.u.uSunDir.value.copy(sd); sea.u.uSunCol.value.copy(c('sunCol')); sea.u.uGlint.value = n('glint');
  const night = n('night');
  MAT.win.emissiveIntensity = n('win'); PU.uNight.value = night;
  signMats.forEach((m) => (m.emissiveIntensity = 0.06 + night * 0.4));
  MAT.cloud.emissiveIntensity = 0.12 * (1 - night) + 0.03;
  stars.material.opacity = smooth(clamp((v - 1.2) / 0.8, 0, 1));
  moon.material.opacity = stars.material.opacity; moon.position.copy(sd).multiplyScalar(1800);
  praçaLights.forEach((l) => (l.intensity = night * 60));
  renderer.toneMappingExposure = n('exp');
  charSprites.forEach((s) => s.material.color.copy(c('tint')));
  if (passes.grade) passes.grade.uniforms.uWarm.value = n('warm');
  if (passes.bloom) { passes.bloom.strength = 0.3 + night * 0.45; passes.bloom.threshold = 0.88 - night * 0.2; }
  document.querySelectorAll('#g-tod button').forEach((b) => b.classList.toggle('on', Math.round(v) === Number(b.dataset.tod)));
}

// ---------------- CÂMERA: vistas e voos ----------------
const VIEWS = {
  arquipelago: { pos: [38, 255, 175], target: [24, 0, -92] },
  voo: { pos: [44, 44, 30], target: [112, 6, -38] },
  vila: { pos: [64, 50, 80], target: [0, 1, -3] },
  vila34: { pos: [-56, 27, 46], target: [2, 3, -5] },
  praca: { pos: [13.5, 8.5, 25], target: [0.5, 3.8, 2.5] },
  biblioteca: { pos: [10.5, 6.2, -2.5], target: [-0.5, 5.2, -18.5] },
  entardecer: { pos: [52, 24, 54], target: [0, 3, -6], tod: 1 },
  noite: { pos: [30, 15, 36], target: [0, 4, -2], tod: 2 },
};
for (const I of ISLANDS) if (!VILA_ID(I)) VIEWS[I.id] = { pos: [I.x + I.r * 0.9, I.H + I.r * 1.3 + 10, I.z + I.r * 1.9 + 12], target: [I.x, I.H + 1, I.z] };
function VILA_ID(I) { return I.id === 'vila'; }
let flight = null;
function setView(name, instant = false, dur) {
  const v = VIEWS[name]; if (!v) return;
  if (v.tod !== undefined) todTarget = v.tod;
  const to = { pos: new THREE.Vector3(...v.pos), target: new THREE.Vector3(...v.target) };
  if (instant) { camera.position.copy(to.pos); controls.target.copy(to.target); controls.update(); flight = null; return; }
  const from = { pos: camera.position.clone(), target: controls.target.clone() };
  const dist = from.pos.distanceTo(to.pos);
  flight = { from, to, t0: performance.now(), dur: dur || clamp(900 + dist * 6, 1200, 2600), arc: Math.min(60, dist * 0.18) };
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('ativo', b.dataset.view === name));
}
function stepFlight(now) {
  if (!flight) return;
  const k = clamp((now - flight.t0) / flight.dur, 0, 1), e = ease(k);
  controls.target.lerpVectors(flight.from.target, flight.to.target, e);
  camera.position.lerpVectors(flight.from.pos, flight.to.pos, e); camera.position.y += Math.sin(Math.PI * e) * flight.arc;
  if (k >= 1) flight = null;
}

// Roteiro do vídeo (sobrevoo -> aproximação -> vila -> giro na praça -> biblioteca)
const SCRIPT = [
  [0, [150, 230, 150], [20, 0, -100]],
  [3.5, [60, 215, 205], [15, 0, -90]],
  [7, [-20, 150, 190], [0, 0, -50]],
  [10.5, [-40, 80, 110], [0, 2, -6]],
  [13.5, [-30, 34, 58], [0, 3, -2]],
  [16, [0, 16, 36], [0, 3.5, 2]],
  [18, [20, 11, 22], [0.5, 3.8, 2]],
  [20, [21, 10, -8], [0, 4, 0]],
  [22, [6, 9, -1], [0, 4.6, -10]],
  [24.5, [9.5, 6.4, -3.5], [-0.5, 5.2, -18]],
  [26, [9.0, 6.3, -4.6], [-0.5, 5.2, -18.5]],
];
const curP = new THREE.CatmullRomCurve3(SCRIPT.map((s) => new THREE.Vector3(...s[1])), false, 'centripetal');
const curT = new THREE.CatmullRomCurve3(SCRIPT.map((s) => new THREE.Vector3(...s[2])), false, 'centripetal');
function scriptAt(t) {
  t = clamp(t, 0, SCRIPT[SCRIPT.length - 1][0]);
  let i = 0; while (i < SCRIPT.length - 2 && t > SCRIPT[i + 1][0]) i++;
  const f = (t - SCRIPT[i][0]) / (SCRIPT[i + 1][0] - SCRIPT[i][0]);
  const u = (i + smooth(f) * 0.0 + f) / (SCRIPT.length - 1);
  return { pos: curP.getPoint(u), target: curT.getPoint(u) };
}

// ---------------- ANIMAÇÃO DO MUNDO (determinística por t) ----------------
const _v = new THREE.Vector3();
function animateWorld(t) {
  U.time.value = t; sea.u.uTime.value = t;
  clouds.forEach((c) => { const d = c.userData; c.position.set(((d.x0 + t * d.v + 300) % 620) - 300, d.y, d.z0); });
  { const a = t * 0.05; boat.position.set(Math.cos(a) * 68 + 10, 0.1, Math.sin(a) * 68 - 5); boat.rotation.set(Math.sin(t * 1.3) * 0.05, -a, Math.sin(t) * 0.06); }
  { const a = -t * 0.04 + 2; boat2.position.set(Math.cos(a) * 30 - 6, 0.1, Math.sin(a) * 30 - 214); boat2.rotation.set(0, -a + Math.PI, Math.sin(t * 1.1) * 0.06); }
  balloon.position.set(70 + Math.sin(t * 0.1) * 12, 48 + Math.sin(t * 0.7) * 1.5, -10 + Math.cos(t * 0.08) * 8); balloon.rotation.y = t * 0.1;
  birds.forEach((b) => { const d = b.userData, a = t * 0.35 + d.ph; b.position.set(Math.cos(a) * d.r + 4, d.h + Math.sin(t * 2 + d.ph) * 0.8, Math.sin(a) * d.r - 2); b.rotation.set(0, -a, Math.sin(t * 9 + d.ph) * 0.35); b.scale.setScalar(1); });
  dyn.windmills.forEach((w) => (w.rotation.z = t * 1.2));
  dyn.flags.forEach((f, i) => (f.rotation.y = Math.sin(t * 1.4 + i) * 0.25));
  sofia.scale.y = sofia.userData.h * (1 + Math.sin(t * 2.2) * 0.012);
  bolota.position.y = V.bolota.y + Math.abs(Math.sin(t * 2.4)) * 0.12;
  pins.forEach((p) => (p.position.y = p.userData.base + 2 + Math.sin(t * 2) * 0.6));
}

// sombras, névoa, rótulos e DOF acompanham a câmera
function updateCameraDeps() {
  const tgt = controls.target, dist = camera.position.distanceTo(tgt);
  const S = clamp(dist * 0.85, 30, 300);
  const sd = sun.userData.dir || new THREE.Vector3(-0.5, 0.7, 0.4);
  const center = dist > 150 ? new THREE.Vector3(30, 0, -95) : tgt;
  const S2 = dist > 150 ? 270 : S;
  sun.position.copy(center).addScaledVector(sd, 400); sun.target.position.copy(center);
  const sc = sun.shadow.camera; sc.left = -S2; sc.right = S2; sc.top = S2; sc.bottom = -S2; sc.near = 50; sc.far = 900; sc.updateProjectionMatrix();
  scene.fog.near = dist * 1.1 + 60; scene.fog.far = dist * 3.4 + 520; sea.u.uFogNear.value = scene.fog.near; sea.u.uFogFar.value = scene.fog.far;
  const lab = smooth(clamp((dist - 110) / 60, 0, 1)); labelSprites.forEach((s) => { s.material.opacity = lab; s.visible = lab > 0.01; });
  pins.forEach((p) => (p.visible = dist > 60));
  if (passes.dof) { const close = dist < 45; passes.dof.enabled = close; if (close) { passes.dof.uniforms.focus.value = dist; passes.dof.uniforms.aperture.value = 0.0009 * (30 / Math.max(12, dist)); } }
  PU.uScale.value = renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  sky.mesh.position.copy(camera.position);
}

function render() {
  updateCameraDeps();
  if (composer) composer.render(); else renderer.render(scene, camera);
}

// ---------------- REDIMENSIONAR ----------------
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (composer) { const s = renderer.getDrawingBufferSize(new THREE.Vector2()); composer.setSize(s.x, s.y); passes.grade?.uniforms.uRes.value.set(s.x, s.y); }
}
window.addEventListener('resize', () => { resize(); setupPost(); applyTOD(todNow); });

// ---------------- INTERAÇÃO ----------------
const audio = new WorldAudio(Q);
const ray = new THREE.Raycaster(); let downAt = null;
canvas.addEventListener('pointerdown', (e) => (downAt = [e.clientX, e.clientY]));
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(colliders)[0];
  if (hit) { const I = hit.object.userData.island; setView(I.id === 'vila' ? 'vila' : I.id); navigator.vibrate?.(20); }
});
document.querySelectorAll('#nav button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
$('#casa').addEventListener('click', () => setView('arquipelago'));
document.querySelectorAll('#g-tod button').forEach((b) => b.addEventListener('click', () => (todTarget = Number(b.dataset.tod))));
document.querySelectorAll('#g-q button').forEach((b) => b.addEventListener('click', () => { applyQuality(b.dataset.q); applyTOD(todNow); }));
$('#b-hud').addEventListener('click', () => toggleHUD());
$('#b-som').addEventListener('click', async (e) => { if (audio.on) { audio.stop(); e.target.classList.remove('on'); } else { await audio.start(); e.target.classList.add('on'); } });
$('#b-festa').addEventListener('click', () => { PU.uCel.value = U.time.value; navigator.vibrate?.([30, 40, 30, 40, 80]); });
function toggleHUD(v) { const h = $('#hud'); const show = v ?? h.classList.contains('oculto'); h.classList.toggle('oculto', !show); $('#b-hud').classList.toggle('on', show); }
window.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') toggleHUD();
  const keys = { 1: 'arquipelago', 2: 'voo', 3: 'vila', 4: 'vila34', 5: 'praca', 6: 'biblioteca', 7: 'entardecer', 8: 'noite' };
  if (keys[e.key]) setView(keys[e.key]);
  if (e.key === 'c' || e.key === 'C') PU.uCel.value = U.time.value;
});

// ---------------- INÍCIO ----------------
toggleHUD(P.get('hud') !== '0');
if (P.get('painel') === '0') $('#painel').classList.add('oculto');
applyQuality(Q);
setView(P.get('view') || 'arquipelago', true);
if (P.has('tod')) todNow = todTarget = Number(P.get('tod')); else if (VIEWS[P.get('view')]?.tod !== undefined) todNow = todTarget = VIEWS[P.get('view')].tod;
applyTOD(todNow);
animateWorld(Number(P.get('t') || 3));
render();
$('#carregando').classList.add('fora');

const stat = $('#stat');
let last = performance.now(), simT = Number(P.get('t') || 3), fpsAcc = 0, fpsN = 0, frameMs = 16;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; simT += dt;
  if (Math.abs(todTarget - todNow) > 0.001) { todNow += clamp(todTarget - todNow, -dt * 0.8, dt * 0.8); applyTOD(todNow); }
  stepFlight(now);
  controls.enabled = !flight; if (!flight) controls.update();
  animateWorld(simT);
  render();
  audio.update(camera);
  fpsAcc += dt; fpsN++; frameMs = lerp(frameMs, dt * 1000, 0.05);
  if (fpsAcc > 0.5) { const i = renderer.info.render; stat.textContent = `${Math.round(fpsN / fpsAcc)} fps · ${i.calls} draws · ${(i.triangles / 1000).toFixed(0)}k tri · ${Q}`; fpsAcc = 0; fpsN = 0; }
  requestAnimationFrame(loop);
}
if (!CAPTURE) {
  requestAnimationFrame(loop);
  const dica = $('#dica'); setTimeout(() => dica.classList.remove('oculto'), 1200); setTimeout(() => dica.classList.add('oculto'), 7000);
}

// ---------------- API para captura determinística ----------------
window.FONEMA = {
  ready: true,
  info: () => { const i = renderer.info; return { calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, q: Q }; },
  renderAt(t, view, tod) {
    if (view) setView(view, true);
    if (tod !== undefined) { todNow = todTarget = tod; applyTOD(tod); }
    animateWorld(t); render(); return this.info();
  },
  videoAt(t, opts = {}) {
    const s = scriptAt(t); camera.position.copy(s.pos); controls.target.copy(s.target); camera.lookAt(s.target);
    if (opts.celebrate !== undefined) PU.uCel.value = opts.celebrate;
    animateWorld(t + 3); render();
  },
  celebrate(t0) { PU.uCel.value = t0; },
  setQuality(q) { applyQuality(q); applyTOD(todNow); },
  setCamera(pos, target) { camera.position.set(...pos); controls.target.set(...target); controls.update(); },
};
