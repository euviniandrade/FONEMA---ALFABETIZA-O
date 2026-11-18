// FONEMA · Mundo 3D v2 — prepara as ANIMAÇÕES DE CAPTURA DE MOVIMENTO do passeio (fila do dono nº 21 e 24).
//
// Fonte: "Universal Animation Library" (versão Standard, gratuita) de Quaternius, licença CC0 1.0 (domínio público),
// cópia em glTF de https://github.com/J-Ponzo/gltf-universal-animation-library (baixada do itch.io do autor em 2025-06-10).
// Registro da licença: assets/animacoes/LEIAME.md.
//
// O que faz: lê o glTF (manequim com esqueleto Rigify + 46 animações), toca as animações que o passeio usa e grava, quadro
// a quadro (30 por segundo), a POSIÇÃO de cada junta (quadril, coluna, pescoço, ombro, cotovelo, mão, coxa, joelho, pé,
// ponta do pé) e a ROTAÇÃO do quadril, do tronco, do peito e da cabeça, já com o boneco de frente para +Z e em
// "pernas": 1 = altura do quadril em pé. O passeio (js/animacoes.js) reaplica isso no esqueleto automático de cada boneco
// (js/esqueleto.js) pelas DIREÇÕES dos ossos — assim serve para qualquer proporção (cabeção, perninha curta).
//
// Uso:  node ferramentas/animacoes-ual.mjs <pasta-do-repositorio-clonado>   (grava assets/animacoes/ual.json)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// o carregador do three.js usa ProgressEvent (do navegador)
globalThis.ProgressEvent ??= class extends Event { constructor(t, o = {}) { super(t); Object.assign(this, o); } };

const aqui = dirname(fileURLToPath(import.meta.url));
const origem = resolve(process.argv[2] || '.');
const gltfPath = join(origem, 'glTF/AnimationLibrary_Godot_Standard.gltf');
const json = JSON.parse(readFileSync(gltfPath, 'utf8'));
for (const b of json.buffers) b.uri = 'data:application/octet-stream;base64,' + readFileSync(join(dirname(gltfPath), b.uri)).toString('base64');
for (const im of json.images || []) delete im.uri;
delete json.textures; delete json.images; delete json.samplers;
for (const m of json.materials || []) { delete m.pbrMetallicRoughness?.baseColorTexture; delete m.normalTexture; delete m.occlusionTexture; delete m.emissiveTexture; delete m.pbrMetallicRoughness?.metallicRoughnessTexture; }

const CLIPES = {
  parado: 'Idle_Loop', andar: 'Walk_Loop', trotar: 'Jog_Fwd_Loop', correr: 'Sprint_Loop',
  puloSobe: 'Jump_Start', puloAr: 'Jump_Loop', puloCai: 'Jump_Land',
  nadar: 'Swim_Fwd_Loop', boiar: 'Swim_Idle_Loop', falar: 'Idle_Talking_Loop',
};
const JUNTAS = {
  quadril: 'DEF-hips', tronco: 'DEF-spine.001', peito: 'DEF-spine.003', pescoco: 'DEF-neck', cabeca: 'DEF-head',
  ombroE: 'DEF-upper_arm.L', cotoveloE: 'DEF-forearm.L', maoE: 'DEF-hand.L', dedoE: 'DEF-f_middle.01.L',
  ombroD: 'DEF-upper_arm.R', cotoveloD: 'DEF-forearm.R', maoD: 'DEF-hand.R', dedoD: 'DEF-f_middle.01.R',
  coxaE: 'DEF-thigh.L', joelhoE: 'DEF-shin.L', peE: 'DEF-foot.L', pontaE: 'DEF-toe.L',
  coxaD: 'DEF-thigh.R', joelhoD: 'DEF-shin.R', peD: 'DEF-foot.R', pontaD: 'DEF-toe.R',
};
const GIROS = ['quadril', 'tronco', 'peito', 'cabeca'];
const FPS = 30;

const gltf = await new Promise((ok, erro) => new GLTFLoader().parse(JSON.stringify(json), '', ok, erro));
const cena = gltf.scene;
const no = {}; for (const [k, n] of Object.entries(JUNTAS)) { no[k] = cena.getObjectByName(n) || cena.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(n)); if (!no[k]) throw new Error('junta não achada: ' + n); }
cena.updateMatrixWorld(true);
const v = new THREE.Vector3(), q = new THREE.Quaternion();

// O arquivo segue o glTF: +Y para cima e o boneco de frente para +Z (conferido nas capturas). "pernas" = altura do quadril
// em pé na pose de descanso (sem animação), com o chão na sola do pé.
const mixer = new THREE.AnimationMixer(cena);
const pos = (k) => no[k].getWorldPosition(new THREE.Vector3());
const base = new THREE.Matrix4(), qBase = new THREE.Quaternion();
const chao = Math.min(pos('peE').y, pos('peD').y) - 0.5 * Math.abs(pos('pontaE').y - pos('peE').y) - 0.02 * pos('cabeca').y;
const pernas = pos('coxaE').y - chao;
const frente = pos('pontaE').sub(pos('peE')), cima = pos('cabeca').sub(pos('quadril'));
console.log('frente', frente.toArray().map((x) => x.toFixed(2)), 'cima', cima.toArray().map((x) => x.toFixed(2)), 'pernas', pernas.toFixed(3));
mixer.stopAllAction();

// pose de descanso (sem animação) para as rotações do tronco
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const saida = { fonte: 'Quaternius — Universal Animation Library (Standard), CC0 1.0', fps: FPS, juntas: Object.keys(JUNTAS), giros: GIROS, clipes: {} };
// pose de descanso (sem animação): referência das rotações do tronco
{
  const P = [], R = [];
  for (const k of saida.juntas) { no[k].getWorldPosition(v).applyMatrix4(base); P.push(r4(v.x / pernas), r4((v.y - chao) / pernas), r4(v.z / pernas)); }
  for (const k of GIROS) { no[k].getWorldQuaternion(q).premultiply(qBase); R.push(r4(q.x), r4(q.y), r4(q.z), r4(q.w)); }
  saida.repouso = { P, R };
}
for (const [nome, arq] of Object.entries(CLIPES)) {
  const clip = gltf.animations.find((a) => a.name === arq);
  if (!clip) throw new Error('animação não achada: ' + arq);
  mixer.stopAllAction(); const ac = mixer.clipAction(clip); ac.play();
  const n = Math.max(2, Math.round(clip.duration * FPS));
  const P = [], R = [];
  for (let i = 0; i < n; i++) {
    mixer.setTime((i / n) * clip.duration); cena.updateMatrixWorld(true);
    for (const k of saida.juntas) { no[k].getWorldPosition(v).applyMatrix4(base); P.push(r4(v.x / pernas), r4((v.y - chao) / pernas), r4(v.z / pernas)); }
    for (const k of GIROS) { no[k].getWorldQuaternion(q).premultiply(qBase); R.push(r4(q.x), r4(q.y), r4(q.z), r4(q.w)); }
  }
  // velocidade natural (em "pernas" por segundo): o pé de apoio (o mais baixo) anda para trás na velocidade do corpo
  let vel = 0;
  if (/andar|trotar|correr/.test(nome)) {
    const J = saida.juntas.length, iE = saida.juntas.indexOf('peE'), iD = saida.juntas.indexOf('peD');
    const vs = [];
    let minY = 1e9; for (let i = 0; i < n; i++) minY = Math.min(minY, P[(i * J + iE) * 3 + 1], P[(i * J + iD) * 3 + 1]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, a = P[(i * J + iE) * 3 + 1] < P[(i * J + iD) * 3 + 1] ? iE : iD;
      if (P[(i * J + a) * 3 + 1] > minY + 0.06) continue; // só com o pé no chão (na corrida há instantes no ar)
      vs.push(-(P[(j * J + a) * 3 + 2] - P[(i * J + a) * 3 + 2]) * FPS);
    }
    vs.sort((a, b) => a - b); vel = vs[Math.floor(vs.length / 2)];
  }
  saida.clipes[nome] = { arquivo: arq, duracao: r4(clip.duration), quadros: n, vel: r4(vel), loop: /Loop$/.test(arq), P, R };
  console.log(nome.padEnd(9), arq.padEnd(18), `${clip.duration.toFixed(2)} s`, `${n} quadros`, vel ? `vel ${vel.toFixed(2)} pernas/s` : '');
}
const dest = join(aqui, '../assets/animacoes/ual.json');
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(saida));
console.log('gravado', dest, (JSON.stringify(saida).length / 1024).toFixed(0), 'KB');
