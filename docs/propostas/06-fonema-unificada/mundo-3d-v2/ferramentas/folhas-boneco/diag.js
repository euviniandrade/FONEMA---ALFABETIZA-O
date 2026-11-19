// Diagnóstico do boneco do passeio (só na cópia de teste): folhas quadro a quadro.
import * as THREE from 'three';

function palco(cor = '#cfd8e3') {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(cor);
  cena.add(new THREE.HemisphereLight('#ffffff', '#8a7a66', 1.4));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2); sol.position.set(3, 6, 4); cena.add(sol);
  // chão com linhas a cada 10 cm (para ver o pé escorregar) e a cada 50 cm mais grossas
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
  g.fillStyle = '#e9e3d3'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#9a8f78';
  for (let i = 0; i <= 10; i++) { g.lineWidth = i % 5 === 0 ? 5 : 1.5; g.beginPath(); g.moveTo(0, i * 51.2); g.lineTo(512, i * 51.2); g.stroke(); g.beginPath(); g.moveTo(i * 51.2, 0); g.lineTo(i * 51.2, 512); g.stroke(); }
  const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(40, 40); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tx, roughness: 1 }));
  cena.add(chao);
  return cena;
}

function folha(cols, n, w, h, rotulo) {
  const cv = document.createElement('canvas'); cv.width = cols * w; cv.height = Math.ceil(n / cols) * h + 30;
  const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#222'; g.font = 'bold 20px sans-serif'; g.fillText(rotulo, 8, 22);
  return { cv, g, pos: (i) => [(i % cols) * w, 30 + Math.floor(i / cols) * h] };
}

/** Folha do boneco de verdade andando/correndo, sem o mundo (palco neutro). vista: 'lado' | 'tras' | 'tresq'. */
export function folhaBoneco(P, renderer, { vel = 1.5, vista = 'lado', n = 24, dt = 1 / 30, cols = 8, w = 220, h = 300, rotulo = '', aquecer = 2, alturaCam = 0.8, dist = 5.2 } = {}) {
  const eu = P.boneco, pai = eu.raiz.parent;
  const cena = palco();
  const guarda = { pos: eu.raiz.position.clone(), rot: eu.raiz.rotation.y };
  cena.add(eu.raiz);
  eu.raiz.position.set(0, 0, -6); eu.raiz.rotation.y = 0;
  const cam = new THREE.PerspectiveCamera(22, w / h, 0.1, 100);
  const tam = renderer.getSize(new THREE.Vector2());
  renderer.setSize(w, h, false);
  const f = folha(cols, n, w, h, rotulo);
  const passo = (d) => { eu.tick(d, { vel, correr: 3.7 }); eu.raiz.position.z += vel * d; };
  for (let t = 0; t < aquecer; t += dt) passo(dt);
  const medidas = [];
  const _v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    passo(dt);
    const z = eu.raiz.position.z;
    if (vista === 'lado') cam.position.set(dist, alturaCam, z); else if (vista === 'tras') cam.position.set(0, alturaCam + 0.3, z - dist); else cam.position.set(dist * 0.7, alturaCam + 0.6, z - dist * 0.7);
    cam.lookAt(0, 0.72, z);
    eu.raiz.updateMatrixWorld(true);
    const r = eu.rig?.ossos;
    let sola = null;
    if (r && eu.anim?.sola?.E) { sola = 9; for (const L of ['E', 'D']) for (const p of eu.anim.sola[L]) sola = Math.min(sola, _v.copy(p).applyMatrix4(r['pe' + L].matrixWorld).y); }
    if (r) medidas.push({ cab: +(r.cabeca.getWorldPosition(_v).y).toFixed(3), quad: +(r.quadril.getWorldPosition(_v).y).toFixed(3), sola: sola == null ? null : +sola.toFixed(3) });
    renderer.render(cena, cam);
    const [x, y] = f.pos(i); f.g.drawImage(renderer.domElement, x, y, w, h);
    f.g.fillStyle = '#333'; f.g.font = '12px sans-serif'; f.g.fillText(String(i), x + 4, y + 14);
  }
  // devolve o boneco
  pai.add(eu.raiz); eu.raiz.position.copy(guarda.pos); eu.raiz.rotation.y = guarda.rot;
  renderer.setSize(tam.x, tam.y, false);
  return { url: f.cv.toDataURL('image/jpeg', 0.88), medidas };
}

let ual = null;
async function carregarUal() {
  if (ual) return ual;
  const { GLTFLoader } = await import('./vendor/loaders/GLTFLoader.js');
  const gltf = await new Promise((ok, erro) => new GLTFLoader().load('/ual/AnimationLibrary_Godot_Standard.gltf', ok, undefined, erro));
  ual = gltf; return gltf;
}

/** Folha do manequim da biblioteca (a referência), tocando a animação `clip` e andando na velocidade natural dela. */
export async function folhaReferencia(renderer, { clip = 'Walk_Loop', vel = 0, vista = 'lado', n = 24, dt = 1 / 30, cols = 8, w = 220, h = 300, rotulo = '' } = {}) {
  const gltf = await carregarUal();
  const cena = palco();
  const m = gltf.scene; cena.add(m);
  m.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  const mixer = new THREE.AnimationMixer(m);
  const ac = mixer.clipAction(gltf.animations.find((a) => a.name === clip)); ac.play();
  const cam = new THREE.PerspectiveCamera(22, w / h, 0.1, 100);
  const tam = renderer.getSize(new THREE.Vector2());
  renderer.setSize(w, h, false);
  const f = folha(cols, n, w, h, rotulo);
  // altura do manequim
  mixer.setTime(0); m.updateMatrixWorld(true);
  const caixa = new THREE.Box3().setFromObject(m); const H = caixa.max.y - caixa.min.y;
  let t = 0;
  for (let i = 0; i < n; i++) {
    t += dt; mixer.setTime(t); m.position.z = vel * t; m.updateMatrixWorld(true);
    const z = m.position.z, d = H * 3.4;
    if (vista === 'lado') cam.position.set(d, H * 0.55, z); else cam.position.set(0, H * 0.75, z - d);
    cam.lookAt(0, H * 0.48, z);
    renderer.render(cena, cam);
    const [x, y] = f.pos(i); f.g.drawImage(renderer.domElement, x, y, w, h);
    f.g.fillStyle = '#333'; f.g.font = '12px sans-serif'; f.g.fillText(String(i), x + 4, y + 14);
  }
  cena.remove(m);
  renderer.setSize(tam.x, tam.y, false);
  return { url: f.cv.toDataURL('image/jpeg', 0.88), H };
}

/** Girar a câmera em volta da menina NO MUNDO (com grama, luz, pós): para ver o "fantasminha". */
export async function folhaGiro(M, P, { n = 12, cols = 6, w = 300, h = 300, dist = 3.2, alto = 1.3, x = 0, z = 19.5, rotulo = '', t0 = 10 } = {}) {
  P.teleportar(x, z, Math.PI); P.simular(0.5);
  const eu = P.boneco; const p = eu.raiz.position;
  const f = folha(cols, n, w, h, rotulo);
  const cv = M.renderer.domElement;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const cam = [p.x + Math.sin(a) * dist, p.y + alto, p.z + Math.cos(a) * dist];
    await M.renderAt(t0 + i * 0.05, { cam, alvo: [p.x, p.y + 0.8, p.z] });
    // recorta o centro quadrado
    const s = Math.min(cv.width, cv.height) * 0.8;
    const [px, py] = f.pos(i); f.g.drawImage(cv, (cv.width - s) / 2, (cv.height - s) / 2, s, s, px, py, w, h);
    f.g.fillStyle = '#fff'; f.g.font = '12px sans-serif'; f.g.fillText(String(Math.round(a * 180 / Math.PI)) + '°', px + 4, py + 14);
  }
  return f.cv.toDataURL('image/jpeg', 0.9);
}

/** Experimentos de material no boneco isolado (cabeça de perto, 4 ângulos por variante). */
export function folhaMateriais(P, renderer, { w = 260, h = 260 } = {}) {
  const eu = P.boneco, pai = eu.raiz.parent;
  const cena = palco();
  const guarda = { pos: eu.raiz.position.clone(), rot: eu.raiz.rotation.y };
  cena.add(eu.raiz); eu.raiz.position.set(0, 0, 0); eu.raiz.rotation.y = 0;
  eu.tick(0.05, { vel: 0 }); eu.raiz.updateMatrixWorld(true);
  const malhas = []; eu.modelo.traverse((o) => { if (o.isMesh && !eu.silhuetas.includes(o)) malhas.push(o); });
  const orig = malhas.map((o) => ({ side: o.material.side, rim: o.material.userData.rim?.uRimF.value }));
  const variantes = [
    ['como está', () => {}],
    ['sem silhueta', () => eu.silhuetas.forEach((o) => { o.visible = false; })],
    ['sem rim', () => malhas.forEach((o) => { if (o.material.userData.rim) o.material.userData.rim.uRimF.value = 0; })],
    ['dois lados', () => malhas.forEach((o) => { o.material.side = THREE.DoubleSide; o.material.needsUpdate = true; })],
    ['verso (BackSide)', () => malhas.forEach((o) => { o.material.side = THREE.BackSide; o.material.needsUpdate = true; })],
  ];
  const angs = [0, 60, 120, 180, 240, 300];
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.05, 50);
  const tam = renderer.getSize(new THREE.Vector2()); renderer.setSize(w, h, false);
  const f = folha(angs.length, variantes.length * angs.length, w, h, 'materiais: ' + variantes.map((v) => v[0]).join(' | '));
  let i = 0;
  for (const [nome, fazer] of variantes) {
    malhas.forEach((o, k) => { o.material.side = orig[k].side; if (o.material.userData.rim) o.material.userData.rim.uRimF.value = orig[k].rim; o.material.needsUpdate = true; });
    eu.silhuetas.forEach((o) => { o.visible = true; });
    fazer();
    for (const a of angs) {
      const r = a * Math.PI / 180; cam.position.set(Math.sin(r) * 1.6, 1.3, Math.cos(r) * 1.6); cam.lookAt(0, 1.05, 0);
      renderer.render(cena, cam);
      const [x, y] = f.pos(i++); f.g.drawImage(renderer.domElement, x, y, w, h);
      f.g.fillStyle = '#111'; f.g.font = '12px sans-serif'; f.g.fillText(`${nome} ${a}°`, x + 4, y + 14);
    }
  }
  eu.silhuetas.forEach((o) => { o.visible = true; });
  malhas.forEach((o, k) => { o.material.side = orig[k].side; if (o.material.userData.rim) o.material.userData.rim.uRimF.value = orig[k].rim; o.material.needsUpdate = true; });
  pai.add(eu.raiz); eu.raiz.position.copy(guarda.pos); eu.raiz.rotation.y = guarda.rot;
  renderer.setSize(tam.x, tam.y, false);
  return f.cv.toDataURL('image/jpeg', 0.9);
}

/** Mergulho fundo NO MUNDO, com a câmera do jogo: superfície → segura Descer → nada lá embaixo → segura Subir. */
export async function folhaMergulho(M, P, { cols = 6, w = 300, h = 240 } = {}) {
  P.teleportar(36, 20, Math.PI / 2); P.irPara(47, 20);
  for (let i = 0; i < 60 && !(P.posicao.nadando && P.posicao.x > 41); i++) P.simular(0.1);
  const passos = [];
  const quadro = async (rot) => { const c = M.camera; await M.renderAt(50 + passos.length * 0.1, { cam: c.position.toArray(), alvo: M.controls.target.toArray() }); passos.push(rot); return snap(); };
  const imgs = [];
  const cv = M.renderer.domElement;
  const snap = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const s = Math.min(cv.width / w, cv.height / h); c.getContext('2d').drawImage(cv, (cv.width - w * s) / 2, (cv.height - h * s) / 2, w * s, h * s, 0, 0, w, h); imgs.push(c); };
  const info = () => { const p = P.posicao; return `prof ${p.profundidade.toFixed(1)}/${p.profundidadeMax.toFixed(1)} m x ${p.x.toFixed(1)}`; };
  await quadro('superfície ' + info());
  P.segurar('descer', true);
  for (let i = 0; i < 9; i++) { P.simular(0.3); await quadro('segura Descer ' + info()); }
  P.segurar('descer', false);
  P.teclar('arrowup', true);
  for (let i = 0; i < 7; i++) { P.simular(0.4); await quadro('nada lá embaixo ' + info()); }
  P.teclar('arrowup', false); P.teclar('arrowleft', true);
  for (let i = 0; i < 3; i++) { P.simular(0.4); await quadro('vira ' + info()); }
  P.teclar('arrowleft', false);
  P.segurar('subir', true);
  for (let i = 0; i < 4; i++) { P.simular(0.35); await quadro('segura Subir ' + info()); }
  P.segurar('subir', false);
  const f = folha(cols, imgs.length, w, h, 'mergulho livre (câmera do jogo)');
  imgs.forEach((c, i) => { const [x, y] = f.pos(i); f.g.drawImage(c, x, y); f.g.fillStyle = 'rgba(0,0,0,.55)'; f.g.fillRect(x, y, w, 18); f.g.fillStyle = '#fff'; f.g.font = '12px sans-serif'; f.g.fillText(`${i} ${passos[i]}`, x + 4, y + 13); });
  return f.cv.toDataURL('image/jpeg', 0.88);
}

export function depurarFundo(M, P) {
  P.teleportar(36, 20, Math.PI / 2); P.irPara(47, 20);
  for (let i = 0; i < 60 && !(P.posicao.nadando && P.posicao.x > 41); i++) P.simular(0.1);
  P.segurar('descer', true); P.simular(4); P.segurar('descer', false); P.simular(1);
  const eu = P.boneco, c = M.camera, cab = new THREE.Vector3(); eu.rig.ossos.cabeca.getWorldPosition(cab);
  const col = P.colisao;
  const ray = new THREE.Raycaster(c.position.clone(), cab.clone().sub(c.position).normalize(), 0, c.position.distanceTo(cab));
  ray.camera = c;
  const hits = ray.intersectObjects(M.scene.children, true).filter((h) => !eu.raiz.getObjectById(h.object.id)).slice(0, 5).map((h) => ({ nome: h.object.name || h.object.type, pai: h.object.parent?.name, d: +h.distance.toFixed(2), y: +h.point.y.toFixed(2), chao: +col.altura(h.point.x, h.point.z).toFixed(2) }));
  const ossos = {}; for (const nm of ['cabeca', 'quadril', 'peE', 'peD']) ossos[nm] = +eu.rig.ossos[nm].getWorldPosition(new THREE.Vector3()).y.toFixed(2);
  return { pos: P.posicao, cab: cab.toArray().map((v) => +v.toFixed(2)), chaoBoneco: +col.altura(P.posicao.x, P.posicao.z).toFixed(2), cam: c.position.toArray().map((v) => +v.toFixed(2)), chaoCam: +col.altura(c.position.x, c.position.z).toFixed(2), ossos, hits, N: col.NIVEL_AGUA };
}
