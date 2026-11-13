// FONEMA · Mundo 3D v2 — núcleo embutível.
//
//   import { criarMundo } from './js/mundo.js';
//   const mundo = await criarMundo(document.querySelector('#palco'), {
//     cena: 'vila' | 'arquipelago', regiaoAtual: 'R0', faseAtual: 'R0-F03', fasesFeitas: ['R0-F01','R0-F02'],
//     qualidade: 'auto' | 'alto' | 'medio' | 'baixo', hora: 0 (dia) … 1 (entardecer),
//     aoEntrarMissao: ({ id, nome, regiao }) => app.abrirFase(id),
//   });
//   mundo.irPara('escola'); mundo.passeio(true); mundo.voar(+1); mundo.trocarCena('arquipelago');
//   window.addEventListener('fonema:missao', (e) => console.log(e.detail.id));
//
// Eventos (no container E na window): fonema:pronto, fonema:lugar, fonema:missao, fonema:regiao, fonema:cena, fonema:qualidade.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { carregarFontes, clamp, lerp, easeInOut, smooth } from './kit.js';
import { criarCeu, criarNuvens } from './ceu.js';
import { criarVila, POIS, FASES_R0 } from './vila.js';
import { criarArquipelago, REGIOES } from './arquipelago.js';

export { POIS, FASES_R0, REGIOES };

export const QUALIDADES = {
  alto: { dpr: 2, sombra: 2048, ao: true, bloom: true, msaa: 4, nuvens: 16 },
  medio: { dpr: 1.5, sombra: 1024, ao: false, bloom: true, msaa: 2, nuvens: 11 },
  baixo: { dpr: 1, sombra: 0, ao: false, bloom: false, msaa: 0, nuvens: 6 },
};

export function temWebGL() {
  try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl'); } catch (e) { return false; }
}
export function qualidadeAuto() {
  const ua = navigator.userAgent, mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  const movel = /Android|iPhone|iPad|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/.test(ua));
  if (mem <= 2 || cores <= 2) return 'baixo';
  if (movel || mem <= 4 || cores <= 4) return 'medio';
  return 'alto';
}

// ---------- vistas prontas (capturas, botões e vídeo) ----------
export const VISTAS = {
  aerea: { cena: 'vila', cam: [64, 58, 92], alvo: [3, 0, 2] },
  praca: { cena: 'vila', cam: [8.5, 1.65, 17.5], alvo: [-1, 3.2, 1] },
  escola: { cena: 'vila', cam: [7.5, 3.2, -7], alvo: [0, 5.2, -29] },
  rio: { cena: 'vila', cam: [29, 3.0, 24], alvo: [45, 1.2, 5] },
  campinho: { cena: 'vila', cam: [-11, 7.5, 37], alvo: [-27, 0.5, 20] },
  entardecer: { cena: 'vila', cam: [26, 13, 34], alvo: [0, 3, 1], hora: 1 },
  rua: { cena: 'vila', cam: [6, 4.2, 62], alvo: [0, 2.6, 30] },
  horta: { cena: 'vila', cam: [33, 9, 34], alvo: [23, 1, 19] },
  arquipelago: { cena: 'arquipelago', cam: [70, 210, 250], alvo: [18, 0, -46] },
  voo: { cena: 'arquipelago', cam: [34, 42, 128], alvo: [0, 2, 66] },
};

export async function criarMundo(container, opts = {}) {
  if (!temWebGL()) { const e = new Error('Sem WebGL'); e.semWebGL = true; throw e; }
  const o = { cena: 'vila', regiaoAtual: 'R0', faseAtual: 'R0-F03', fasesFeitas: ['R0-F01', 'R0-F02'], qualidade: 'auto', hora: 0, captura: false, ...opts };
  let nivel = o.qualidade === 'auto' ? qualidadeAuto() : o.qualidade;
  let Q = QUALIDADES[nivel];
  const emitir = (nome, detail) => { const ev = new CustomEvent(nome, { detail }); container.dispatchEvent(ev); window.dispatchEvent(new CustomEvent(nome, { detail })); };

  await carregarFontes();

  // ---------- renderizador ----------
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: Q.msaa === 0, powerPreference: 'high-performance', preserveDrawingBuffer: !!o.captura });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = Q.sombra > 0; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.3, 4000);
  const U = { time: { value: 0 } };
  camera.layers.enable(1); // camada 1 = sprites, partículas e recortes (fora do AO)

  const ceu = criarCeu(scene);
  ceu.sun.shadow.mapSize.set(Q.sombra || 512, Q.sombra || 512);
  ceu.sun.shadow.camera.layers.enable(1);
  let hora = o.hora; ceu.aplicar(hora, renderer);
  ceu.ambiente(renderer, scene);
  const nuvens = criarNuvens(scene, Q.nuvens, 430, [55, 110]);

  // ---------- cenas ----------
  const estados = {};
  const idxAtual = FASES_R0.findIndex((f) => f.id === o.faseAtual);
  FASES_R0.forEach((f, i) => { estados[f.id] = o.fasesFeitas.includes(f.id) ? 'feita' : f.id === o.faseAtual ? 'atual' : i < idxAtual ? 'feita' : 'bloqueada'; });
  const cenas = {};
  async function obter(nome) {
    if (!cenas[nome]) cenas[nome] = nome === 'vila' ? await criarVila({ U, q: nivel, renderer, estados }) : await criarArquipelago({ U, q: nivel, regiaoAtual: o.regiaoAtual });
    return cenas[nome];
  }
  let cenaAtual = null, C = null;
  const LIMITES = {
    vila: { min: 4, max: 190, polar: 1.48, caixa: 140, alvoY: [0, 45] },
    arquipelago: { min: 20, max: 520, polar: 1.25, caixa: 260, alvoY: [0, 60] },
  };

  // ---------- controles (órbita, zoom, pan, voar) ----------
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.075;
  controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.9; controls.panSpeed = 0.9;
  controls.screenSpacePanning = false; controls.zoomToCursor = true;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
  controls.listenToKeyEvents(window);

  async function trocarCena(nome, { cam, alvo } = {}) {
    const c = await obter(nome);
    if (C) scene.remove(C.grupo);
    C = c; cenaAtual = nome; scene.add(C.grupo);
    C.grupo.traverse((m) => { if (m.isSprite || m.isPoints || m.userData.camada1) m.layers.set(1); });
    const L = LIMITES[nome];
    controls.minDistance = L.min; controls.maxDistance = L.max; controls.maxPolarAngle = L.polar;
    const v = VISTAS[nome === 'vila' ? 'aerea' : 'arquipelago'];
    camera.position.set(...(cam || v.cam)); controls.target.set(...(alvo || v.alvo)); controls.update();
    camera.far = nome === 'vila' ? 2600 : 4000; camera.updateProjectionMatrix();
    ceu.dome.scale.setScalar(1);
    emitir('fonema:cena', { cena: nome });
    return C;
  }

  // ---------- pós-processamento ----------
  const GRADE = {
    uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTilt: { value: 0 }, uVig: { value: 0.32 }, uSat: { value: 1.08 }, uFoco: { value: 0.5 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTilt, uVig, uSat, uFoco; varying vec2 vUv;
      void main(){
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        if (uTilt > 0.0) {
          float b = smoothstep(0.08, 0.42, abs(vUv.y - uFoco)) * uTilt;
          if (b > 0.01) { vec3 acc = c; float n = 1.0;
            for (int i = 1; i < 16; i++) { float a = float(i) * 2.39996; float r = sqrt(float(i)) / 4.0; vec2 o = vec2(cos(a), sin(a)) * r * b * 9.0 / uRes; acc += texture2D(tDiffuse, vUv + o).rgb; n += 1.0; }
            c = acc / n; }
        }
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(vec3(l), c, uSat);
        c *= vec3(1.025, 1.0, 0.965);
        vec2 q = vUv - 0.5; float v = 1.0 - dot(q, q) * uVig * 1.6;
        c *= mix(vec3(0.82, 0.74, 0.86), vec3(1.0), clamp(v, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
      }`,
  };
  let composer = null, passes = {};
  function montarPos() {
    if (composer) { composer.dispose(); composer = null; }
    const w = container.clientWidth || 1280, h = container.clientHeight || 800;
    if (!Q.bloom && !Q.ao) { renderer.toneMapping = THREE.ACESFilmicToneMapping; return; }
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: Q.msaa });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    passes.render = new RenderPass(scene, camera); composer.addPass(passes.render);
    if (Q.ao) { passes.ao = new GTAOPass(scene, camera, w, h); passes.ao.output = GTAOPass.OUTPUT.Default; passes.ao.blendIntensity = 0.9; passes.ao.updateGtaoMaterial({ radius: 1.4, distanceExponent: 1.4, thickness: 1.6, scale: 1.0, samples: 16 }); passes.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); const aoRender = passes.ao.render.bind(passes.ao); passes.ao.render = (...a) => { camera.layers.disable(1); aoRender(...a); camera.layers.enable(1); }; composer.addPass(passes.ao); }
    if (Q.bloom) { passes.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.32, 0.55, 0.92); composer.addPass(passes.bloom); }
    passes.grade = new ShaderPass(GRADE); composer.addPass(passes.grade);
    composer.addPass(new OutputPass());
  }
  function aplicarQualidade(n) {
    nivel = n; Q = QUALIDADES[n];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.dpr));
    renderer.shadowMap.enabled = Q.sombra > 0;
    if (Q.sombra) { ceu.sun.shadow.mapSize.set(Q.sombra, Q.sombra); if (ceu.sun.shadow.map) { ceu.sun.shadow.map.dispose(); ceu.sun.shadow.map = null; } }
    scene.traverse((m) => { if (m.material) m.material.needsUpdate = true; });
    montarPos(); redimensionar();
    emitir('fonema:qualidade', { nivel: n });
  }

  function redimensionar() {
    const w = container.clientWidth || 1280, h = container.clientHeight || 800;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    if (passes.grade) passes.grade.uniforms.uRes.value.set(w, h);
  }
  const ro = new ResizeObserver(redimensionar); ro.observe(container);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.dpr));
  montarPos();

  // ---------- voo de câmera ----------
  let voo = null, passeioAtivo = false, passeioT = 0;
  function voarPara(cam, alvo, dur = 2.2, depois) {
    const c0 = camera.position.clone(), a0 = controls.target.clone(), c1 = new THREE.Vector3(...cam), a1 = new THREE.Vector3(...alvo);
    const dist = c0.distanceTo(c1), arco = Math.min(40, dist * 0.18);
    dur = Math.max(1.0, Math.min(dur, 0.9 + dist / 45));
    voo = { c0, a0, c1, a1, arco, t: 0, dur, depois };
  }
  function passoVoo(dt) {
    if (!voo) return;
    voo.t += dt; const k = easeInOut(clamp(voo.t / voo.dur, 0, 1));
    camera.position.lerpVectors(voo.c0, voo.c1, k); camera.position.y += Math.sin(k * Math.PI) * voo.arco;
    controls.target.lerpVectors(voo.a0, voo.a1, k);
    if (voo.t >= voo.dur) { const f = voo.depois; voo = null; f && f(); }
  }
  function irPara(id) {
    if (cenaAtual !== 'vila') return trocarCena('vila').then(() => irPara(id));
    const p = POIS.find((x) => x.id === id) || POIS[0];
    passeioAtivo = false; voarPara(p.cam, p.alvo, 2.4, () => emitir('fonema:lugar', { id: p.id, nome: p.nome, icone: p.icone }));
    emitir('fonema:lugar', { id: p.id, nome: p.nome, icone: p.icone, chegando: true });
  }
  /** Sobe/desce a câmera e o alvo juntos ("voar"). dir = +1 / -1. */
  function voar(dir = 1, passo = 6) {
    const L = LIMITES[cenaAtual], ty = clamp(controls.target.y + dir * passo, L.alvoY[0], L.alvoY[1]), d = ty - controls.target.y;
    voarPara(camera.position.clone().add(new THREE.Vector3(0, d, 0)).toArray(), controls.target.clone().setY(ty).toArray(), 0.9);
  }
  /** Desliza para os lados/frente relativo à câmera. */
  function deslizar(dx, dz, passo = 10) {
    const f = new THREE.Vector3(); camera.getWorldDirection(f); f.y = 0; f.normalize();
    const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0));
    const mv = r.multiplyScalar(dx * passo).add(f.multiplyScalar(dz * passo));
    voarPara(camera.position.clone().add(mv).toArray(), controls.target.clone().add(mv).toArray(), 0.8);
  }
  function orbitar(ang) { const off = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang); voarPara(controls.target.clone().add(off).toArray(), controls.target.toArray(), 0.8); }
  function focar(x, z) { const off = camera.position.clone().sub(controls.target), a = new THREE.Vector3(x, cenaAtual === 'vila' ? 1 : 0, z); voarPara(a.clone().add(off).toArray(), a.toArray(), 1.4); }
  function zoom(f) { const d = camera.position.clone().sub(controls.target); d.multiplyScalar(f); const L = LIMITES[cenaAtual]; d.setLength(clamp(d.length(), L.min, L.max)); voarPara(controls.target.clone().add(d).toArray(), controls.target.toArray(), 0.7); }

  // passeio guiado: spline cinematográfica pelos pontos de interesse
  const ROTEIRO = ['mirante', 'praca', 'escola', 'biblioteca', 'casa', 'campinho', 'rua', 'horta', 'cais', 'ponte', 'padaria', 'praca'];
  const tour = (() => {
    const cams = [], alvos = [];
    for (const id of ROTEIRO) { const p = POIS.find((x) => x.id === id); cams.push(new THREE.Vector3(...p.cam)); alvos.push(new THREE.Vector3(...p.alvo)); }
    const cc = new THREE.CatmullRomCurve3(cams, false, 'centripetal', 0.5), ca = new THREE.CatmullRomCurve3(alvos, false, 'centripetal', 0.5);
    return { cc, ca, dur: ROTEIRO.length * 5.5 };
  })();
  function tourAt(t) {
    const u = clamp(t / tour.dur, 0, 1), k = smooth(u) * 0.15 + u * 0.85;
    const cp = tour.cc.getPoint(k), ap = tour.ca.getPoint(k);
    const chao = cenas.vila ? cenas.vila.altura(cp.x, cp.z) + 1.4 : 1.4; if (cp.y < chao) cp.y = chao;
    return { cam: cp, alvo: ap, idx: Math.min(ROTEIRO.length - 1, Math.round(u * (ROTEIRO.length - 1))) };
  }
  let ultimoLugar = -1;
  function passeio(on = true) {
    if (on && cenaAtual !== 'vila') { trocarCena('vila').then(() => passeio(true)); return; }
    passeioAtivo = on;
    if (on) { const s = tourAt(0); voarPara(s.cam.toArray(), s.alvo.toArray(), 2.0, () => { passeioT = 0; }); passeioT = -1e9; }
  }

  // ---------- toque em objetos ----------
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; if (passeioAtivo) { passeioAtivo = false; emitir('fonema:passeio', { ativo: false }); } voo = null; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return; const mov = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (mov > 10 || dt > 600) return;
    const rc = canvas.getBoundingClientRect(); ptr.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    tocar(ray);
  });
  function tocar(ray) {
    if (cenaAtual === 'vila') {
      const hits = ray.intersectObjects(C.portais.map((p) => p.userData.hit), false);
      if (hits.length) { const p = hits[0].object.parent; abrirPortal(p); return; }
      // toque em prédio/lugar: o ponto de interesse mais próximo do ponto tocado
      const chao = ray.intersectObject(C.grupo, true)[0];
      if (chao) { let best = null, bd = 1e9; for (const p of POIS) { if (p.id === 'mirante') continue; const d = Math.hypot(p.alvo[0] - chao.point.x, p.alvo[2] - chao.point.z); if (d < bd) { bd = d; best = p; } } if (best && bd < 9) irPara(best.id); }
    } else {
      const h = ray.intersectObjects(C.hits, false)[0];
      if (h) escolherRegiao(h.object.userData.regiao);
    }
  }
  function abrirPortal(p) {
    const { id, nome, estado } = p.userData, pos = p.position;
    const dir = new THREE.Vector3(camera.position.x - pos.x, 0, camera.position.z - pos.z).normalize();
    voarPara([pos.x + dir.x * 7.5, pos.y + 3.6, pos.z + dir.z * 7.5], [pos.x, pos.y + 2.2, pos.z], 1.6, () => emitir('fonema:portal', { id, nome, estado, regiao: 'R0' }));
    if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) { /* ok */ }
  }
  function entrarMissao(id) {
    const f = FASES_R0.find((x) => x.id === id); if (!f) return false;
    const det = { id, nome: f.nome, regiao: id.split('-')[0], estado: estados[id] };
    if (det.estado === 'bloqueada') { emitir('fonema:bloqueada', det); return false; }
    emitir('fonema:missao', det); o.aoEntrarMissao && o.aoEntrarMissao(det);
    return true;
  }
  function escolherRegiao(R) {
    emitir('fonema:regiao', { id: R.id, nome: R.nome, estado: R.estado });
    if (R.estado === 'bloqueada') { voarPara([R.x + 40, 70, R.z + 80], [R.x, 0, R.z], 1.8); return; }
    if (R.id === 'R0') { vooParaVila(); return; }
    voarPara([R.x + 30, 38, R.z + 56], [R.x, 2, R.z], 2.0);
  }
  /** Voo do arquipélago até a vila: mergulho na ilha R0, fade e chegada pelo alto. */
  let fade = 0, fadeAlvo = 0;
  const veu = document.createElement('div');
  veu.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:#FFF8EC;opacity:0;transition:none';
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  container.appendChild(veu);
  function vooParaVila() {
    const R = REGIOES[0];
    voarPara([R.x + 6, 14, R.z + 22], [R.x, 1, R.z], 2.6, async () => {
      fadeAlvo = 1;
      setTimeout(async () => {
        await trocarCena('vila', { cam: [80, 110, 150], alvo: [0, 0, 0] });
        fadeAlvo = 0; irPara('praca');
      }, 450);
    });
  }

  // ---------- laço ----------
  const clock = new THREE.Timer();
  let tempo = 0, fpsAcc = 0, fpsN = 0, lentoDesde = 0, ciclo = false;
  function atualizar(t, dt) {
    U.time.value = t;
    if (ciclo) { hora = 0.5 - 0.5 * Math.cos(t * 0.05); ceu.aplicar(hora, renderer); }
    C.tick(t, camera, hora);
    nuvens.tick(t, ceu.st);
    // limites: câmera acima do chão e dentro da área
    const L = LIMITES[cenaAtual];
    controls.target.x = clamp(controls.target.x, -L.caixa, L.caixa); controls.target.z = clamp(controls.target.z, -L.caixa, L.caixa);
    controls.target.y = clamp(controls.target.y, L.alvoY[0], L.alvoY[1]);
    const chao = cenaAtual === 'vila' ? C.altura(camera.position.x, camera.position.z) + 1.2 : 3;
    if (camera.position.y < chao) camera.position.y = chao;
    const dist = camera.position.distanceTo(controls.target);
    ceu.seguir(controls.target, clamp(dist * 0.85, 22, cenaAtual === 'vila' ? 110 : 260));
    if (passes.grade) passes.grade.uniforms.uTilt.value = o.tiltShift ? clamp((dist - 30) / 120, 0, 1) * 0.9 : 0;
    // nome do lugar mais próximo (HUD)
    if (cenaAtual === 'vila' && !voo) { let best = 0, bd = 1e9; POIS.forEach((p, i) => { const d = Math.hypot(p.alvo[0] - controls.target.x, p.alvo[2] - controls.target.z); if (d < bd) { bd = d; best = i; } }); if (best !== ultimoLugar && bd < 14) { ultimoLugar = best; const p = POIS[best]; emitir('fonema:lugar', { id: p.id, nome: p.nome, icone: p.icone }); } }
  }
  function render() { if (composer) composer.render(); else renderer.render(scene, camera); }
  function quadro() {
    if (destruido) return;
    requestAnimationFrame(quadro);
    clock.update(); const dt = Math.min(0.05, clock.getDelta()); tempo += dt;
    if (passeioAtivo) {
      if (!voo) { passeioT += dt; const s = tourAt(passeioT); camera.position.copy(s.cam); controls.target.copy(s.alvo); if (passeioT > tour.dur) { passeioAtivo = false; emitir('fonema:passeio', { ativo: false }); } }
    }
    passoVoo(dt);
    if (!voo && !passeioAtivo) controls.update(); else camera.lookAt(controls.target);
    atualizar(tempo, dt);
    fade += (fadeAlvo - fade) * Math.min(1, dt * 7); veu.style.opacity = fade.toFixed(3);
    render();
    // medidor: se o quadro passar de 45 ms por 3 s, desce um degrau de qualidade
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 1) { const ms = (fpsAcc / fpsN) * 1000; fpsAcc = 0; fpsN = 0; info.ms = ms;
      if (o.qualidade === 'auto' && ms > 45) { lentoDesde += 1; if (lentoDesde >= 3 && nivel !== 'baixo') { lentoDesde = 0; aplicarQualidade(nivel === 'alto' ? 'medio' : 'baixo'); } } else lentoDesde = 0; }
  }
  const info = { ms: 0 };
  let destruido = false;

  await trocarCena(o.cena);
  if (o.vista && VISTAS[o.vista]) aplicarVista(o.vista);
  // mini-mapa (vista ortográfica de cima, gerada uma vez por cena)
  const mapas = {};
  function miniMapa(nome = cenaAtual, tam = 512) {
    if (mapas[nome]) return mapas[nome];
    const ext = nome === 'vila' ? 80 : 220, cz = nome === 'vila' ? 6 : -50, cx = nome === 'vila' ? 4 : 20;
    const cam = new THREE.OrthographicCamera(-ext, ext, ext, -ext, 1, 1000); cam.position.set(cx, 400, cz); cam.lookAt(cx, 0, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, 0, cz);
    const rt = new THREE.WebGLRenderTarget(tam, tam, { samples: 0 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    const fog = scene.fog; scene.fog = null; const vis = []; nuvens.meshes.forEach((m) => { vis.push(m.visible); m.visible = false; });
    const prevShadow = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null);
    renderer.shadowMap.enabled = prevShadow; scene.fog = fog; nuvens.meshes.forEach((m, i) => { m.visible = vis[i]; });
    const px = new Uint8Array(tam * tam * 4); renderer.readRenderTargetPixels(rt, 0, 0, tam, tam, px);
    const cv = document.createElement('canvas'); cv.width = cv.height = tam; const g = cv.getContext('2d'); const id = g.createImageData(tam, tam);
    for (let y = 0; y < tam; y++) id.data.set(px.subarray((tam - 1 - y) * tam * 4, (tam - y) * tam * 4), y * tam * 4);
    g.putImageData(id, 0, 0); rt.dispose();
    const m = { url: cv.toDataURL('image/jpeg', 0.85), ext, cx, cz };
    mapas[nome] = m; return m;
  }
  function aplicarVista(nome) {
    const v = VISTAS[nome]; if (!v) return;
    camera.position.set(...v.cam); controls.target.set(...v.alvo); camera.lookAt(controls.target); controls.update();
    if (v.hora !== undefined) { hora = v.hora; ceu.aplicar(hora, renderer); }
  }

  if (!o.captura) quadro();
  emitir('fonema:pronto', { cena: cenaAtual, qualidade: nivel });

  const api = {
    renderer, scene, camera, controls, POIS, FASES_R0, REGIOES, VISTAS,
    get cena() { return cenaAtual; }, get qualidade() { return nivel; }, get hora() { return hora; }, info,
    estadoFases: estados,
    irPara, voar, deslizar, zoom, orbitar, focar, passeio, entrarMissao, trocarCena: async (n) => { if (n === 'vila' && cenaAtual === 'arquipelago') { vooParaVila(); return; } await trocarCena(n); },
    vooParaVila, miniMapa,
    abrirPortalPorId(id) { const p = C.portais && C.portais.find((x) => x.userData.id === id); if (p) abrirPortal(p); },
    definirHora(t) { ciclo = false; hora = clamp(t, 0, 1); ceu.aplicar(hora, renderer); },
    cicloDoDia(on = true) { ciclo = on; },
    tiltShift(on = true) { o.tiltShift = on; },
    definirQualidade: aplicarQualidade,
    estado() { return { cena: cenaAtual, cam: camera.position.toArray(), alvo: controls.target.toArray(), qualidade: nivel, passeio: passeioAtivo, hora }; },
    /** Quadro determinístico (capturas/vídeo): tempo t e uma vista nomeada ou {cam, alvo}. */
    async renderAt(t, vista, extra = {}) {
      if (typeof vista === 'string') vista = VISTAS[vista];
      if (vista && vista.cena && vista.cena !== cenaAtual) await trocarCena(vista.cena);
      if (vista) { camera.position.set(...vista.cam); controls.target.set(...vista.alvo); }
      { const h = (vista && vista.hora !== undefined) ? vista.hora : extra.hora !== undefined ? extra.hora : o.hora; if (h !== hora) { hora = h; ceu.aplicar(hora, renderer); } }
      if (extra.tilt !== undefined) o.tiltShift = extra.tilt;
      camera.lookAt(controls.target); controls.update();
      atualizar(t, 1 / 30); render();
      return { cena: cenaAtual, calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
    },
    /** Roteiro do vídeo: arquipélago → mergulho → vila → passeio. */
    async videoAt(t) {
      let fadeV = 0;
      if (t < 6.5) {
        if (cenaAtual !== 'arquipelago') await trocarCena('arquipelago');
        const k = easeInOut(clamp(t / 6.5, 0, 1)), R = REGIOES[0];
        const a = 0.9 - k * 0.9;
        const c0 = new THREE.Vector3(Math.sin(a) * 300 + 20, 230, Math.cos(a) * 300 - 40), c1 = new THREE.Vector3(R.x + 6, 16, R.z + 24);
        const cam = c0.clone().lerp(c1, k * k); const alvo = new THREE.Vector3(18, 0, -46).lerp(new THREE.Vector3(R.x, 1, R.z), smooth(k));
        camera.position.copy(cam); controls.target.copy(alvo); fadeV = smooth(clamp((t - 5.9) / 0.6, 0, 1));
      } else {
        if (cenaAtual !== 'vila') await trocarCena('vila');
        const tv = t - 6.5;
        if (tv < 3.5) { const k = easeInOut(tv / 3.5), s = tourAt(0); camera.position.copy(new THREE.Vector3(80, 110, 150).lerp(s.cam, k)); controls.target.copy(new THREE.Vector3(0, 0, 0).lerp(s.alvo, k)); fadeV = 1 - smooth(clamp(tv / 0.7, 0, 1)); }
        else { const s = tourAt((tv - 3.5) * 1.55); camera.position.copy(s.cam); controls.target.copy(s.alvo); }
      }
      camera.lookAt(controls.target);
      atualizar(t, 1 / 30); render();
      veu.style.opacity = fadeV.toFixed(3);
      return { cena: cenaAtual, fade: fadeV };
    },
    tourDur: tour.dur,
    /** Medição: um render direto (sem pós) e os números do renderizador (sombras incluídas). */
    stats() { renderer.info.autoReset = false; renderer.info.reset(); renderer.render(scene, camera); const i = renderer.info; const r = { calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, tex: i.memory.textures }; renderer.info.autoReset = true; return r; },
    destruir() { destruido = true; ro.disconnect(); controls.dispose(); renderer.dispose(); canvas.remove(); veu.remove(); },
  };
  return api;
}
