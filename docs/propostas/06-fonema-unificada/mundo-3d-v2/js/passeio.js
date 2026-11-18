// FONEMA · Mundo 3D v2 — PASSEIO EM 3ª PESSOA: a criança anda pela vila com o próprio boneco.
//
//   const mundo = await criarMundo(palco, { passeio: true, ... });
//   const passeio = criarPasseio(mundo, { aoPerto, aoEntrar, aoTrancado, aoConversar, aoAviso });
//   passeio.usarAvatar(pacote)   // avatar da criança (pacote vindo do app)
//
// Controles (os três aparelhos):
//  - PC: setinhas ou WASD andam (Shift corre), arrastar o mouse gira a câmera, roda = zoom, espaço pula,
//    T acena, Enter entra/conversa. Clique no chão = ir até lá.
//  - Celular/tablet: dedo à ESQUERDA = joystick (aparece onde o dedo encosta), dedo à DIREITA = gira a câmera,
//    pinça = zoom, botões grandes de Pular, Tchau e Entrar/Conversar (HUD da página).
//  - Para os pequenos: tocar no chão (ou num lugar, ou num boneco) e o boneco vai sozinho até lá.
// Área limitada (js/colisao.js): ruas e praças; prédios, árvores, cercas e o meio do rio não deixam passar; a mata
// fica fora da cerca da vila (bonita de longe). Beira do rio: água rasa, o boneco nada.
import * as THREE from 'three';
import { criarColisao, LIMITE } from './colisao.js';
import { Boneco, bonecoReserva, malhaDoPacote } from './boneco.js';
import { criarNpcs, ELENCO, girarPara } from './npcs.js';
import { rotulo } from './personagens.js';
import { clamp, lerp, radialTex, M } from './kit.js';

/** Portas da vila. `id` casa com o destino que o app dá (Passeio3D.tsx). pos = onde a criança para; raio = alcance. */
export const LUGARES = [
  { id: 'escola', nome: 'Escola', sub: 'Missão', icone: '🏫', pos: [0, -17.4], raio: 3.2, alto: 3.6 },
  { id: 'biblioteca', nome: 'Biblioteca', sub: 'Cantinho da Leitura', icone: '📚', pos: [-15.4, -5], raio: 3.2, alto: 3.4 },
  { id: 'campinho', nome: 'Campinho', sub: 'Brincar com sons', icone: '⚽', pos: [-33.5, 22.5], raio: 3.6, alto: 3.2 },
  { id: 'padaria', nome: 'Padaria', sub: 'Lojinha', icone: '🛍️', pos: [18.8, -6.6], raio: 3.0, alto: 3.4 },
  { id: 'casa', nome: 'Casa da Sofia', sub: 'Escrever do seu jeito', icone: '✏️', pos: [-5.2, 20], raio: 2.8, alto: 3.2 },
  { id: 'coreto', nome: 'Coreto', sub: 'Ler mais ligeiro', icone: '⚡', pos: [0, 8.8], raio: 2.8, alto: 3.0 },
  { id: 'barco', nome: 'Barquinho', sub: 'Em breve na Lojinha', icone: '⛵', pos: [40.4, 12.6], raio: 4.2, alto: 2.6, emBreve: true },
];

const PARTIDA = { x: 0, z: 19.5, giro: Math.PI }; // na entrada da praça, de frente para o coreto (a Sofia passeia ali)
const ALTURA = 1.5; // a criança no mundo (m)
// velocidades de criança (m/s): a passada das pernas acompanha (js/boneco.js), então o pé não escorrega
const ANDAR = 1.5, CORRER = 3.7, TECLADO = 2.6, PULO = 6.4, GRAVIDADE = 20;
const NADA = 0.5; // água mais funda que isto (m) = nada; mais rasa = anda com a água pela cintura (o boneco de 1,5 m tem a virilha a 0,4 m)

export function criarPasseio(mundo, h = {}) {
  const { scene, camera, renderer } = mundo;
  const canvas = renderer.domElement;
  const vila = mundo.vila;
  const menos = !!h.menosMovimento;
  const movel = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1;
  const colisao = criarColisao(vila);
  const grupo = new THREE.Group(); grupo.name = 'passeio'; scene.add(grupo);
  camera.far = 900; camera.near = 0.15; camera.updateProjectionMatrix();

  // ---------- a criança ----------
  const eu = new Boneco({ altura: ALTURA, nome: 'crianca', menosMovimento: menos, silhueta: true });
  eu.usarModelo(bonecoReserva(h.cores || {}), 1.1);
  grupo.add(eu.raiz);
  const pos = new THREE.Vector3(PARTIDA.x, colisao.altura(PARTIDA.x, PARTIDA.z), PARTIDA.z);
  let giro = PARTIDA.giro, velX = 0, velZ = 0, vy = 0, yPe = 0, noAr = false, nadando = false;

  // ---------- outros bonecos ----------
  const npcs = criarNpcs({ grupo, colisao, menosMovimento: menos });
  for (const def of ELENCO) npcs.adicionar(def);
  const rotasRuins = npcs.conferirRotas();

  // ---------- portas (anel no chão + plaquinha flutuante) ----------
  const estadoLugar = Object.fromEntries(LUGARES.map((l) => [l.id, { aberto: !l.emBreve, falta: l.emBreve ? l.sub : '' }]));
  const marcas = [];
  const brilhoTex = radialTex('rgba(255,236,170,0.95)', 'rgba(255,214,107,0)');
  function montarMarca(l) {
    const g = new THREE.Group();
    const [x, z] = l.pos; g.position.set(x, colisao.altura(x, z) + 0.04, z);
    const st = estadoLugar[l.id];
    const cor = st.aberto ? '#FFD66B' : '#A8A8B4';
    const anel = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 40), new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: st.aberto ? 1.8 : 0.2, roughness: 0.4 }));
    anel.rotation.x = Math.PI / 2; g.add(anel);
    const chao = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: brilhoTex, color: cor, transparent: true, opacity: st.aberto ? 0.55 : 0.25, depthWrite: false, fog: false }));
    chao.position.y = 0.01; g.add(chao);
    const placa = rotulo(`${l.nome}${st.aberto ? '' : ' 🔒'}`, { icone: l.icone, escala: 0.62, fundo: st.aberto ? 'rgba(255,250,240,0.95)' : 'rgba(225,228,236,0.95)' });
    placa.position.y = l.alto; g.add(placa);
    g.userData = { lugar: l, anel, placa, chao };
    grupo.add(g); return g;
  }
  function remontarMarcas() { for (const m of marcas) { grupo.remove(m); m.traverse((o) => { if (o.material) { o.material.map?.dispose?.(); o.material.dispose(); } o.geometry?.dispose(); }); } marcas.length = 0; for (const l of LUGARES) marcas.push(montarMarca(l)); }
  remontarMarcas();

  // ---------- cerca baixa de madeira no limite da vila (a mata fica do outro lado) ----------
  {
    const postes = [], travessas = [];
    const passos = 220;
    for (let i = 0; i < passos; i++) {
      const a = (i / passos) * Math.PI * 2, b = ((i + 1) / passos) * Math.PI * 2;
      const x0 = LIMITE.cx + Math.cos(a) * (LIMITE.rx + 0.6), z0 = LIMITE.cz + Math.sin(a) * (LIMITE.rz + 0.6);
      const x1 = LIMITE.cx + Math.cos(b) * (LIMITE.rx + 0.6), z1 = LIMITE.cz + Math.sin(b) * (LIMITE.rz + 0.6);
      const y0 = colisao.altura(x0, z0), y1 = colisao.altura(x1, z1);
      if (y0 < colisao.NIVEL_AGUA + 0.1 || y1 < colisao.NIVEL_AGUA + 0.1) continue; // o rio já é o limite
      postes.push(M(x0, y0 + 0.45, z0, 0, -a, 0, 0.14, 0.9, 0.14));
      const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(x1 - x0, z1 - z0);
      for (const hh of [0.4, 0.75]) travessas.push(M((x0 + x1) / 2, (y0 + y1) / 2 + hh, (z0 + z1) / 2, 0, ang, 0, 0.07, 0.1, len));
    }
    const mat = new THREE.MeshStandardMaterial({ color: '#B98450', roughness: 0.85 });
    const ip = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 7), mat, postes.length);
    postes.forEach((m, i) => ip.setMatrixAt(i, m)); ip.castShadow = true; ip.receiveShadow = true; grupo.add(ip);
    const it = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, travessas.length);
    travessas.forEach((m, i) => it.setMatrixAt(i, m)); it.castShadow = true; grupo.add(it);
  }

  // ---------- marcador do "ir até lá" ----------
  const destinoMarca = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#FFF3C4', transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
  destinoMarca.visible = false; grupo.add(destinoMarca);

  // ---------- câmera ----------
  const cam = { giro: PARTIDA.giro + Math.PI, incl: movel ? 0.34 : 0.3, dist: movel ? 6.6 : 6.0, distReal: 6, alto: false };
  const LIM_DIST = [2.6, 15];
  let arrastouEm = 0;
  const alvoCam = new THREE.Vector3(), desejada = new THREE.Vector3();

  // ---------- entrada ----------
  const teclas = new Set();
  const joy = { x: 0, y: 0, ativo: false };
  let destino = null, destinoParado = 0, pulou = false;
  const ptrs = new Map();
  let pinca = null;
  const elJoy = h.joystick || null; // { base, bola } (DOM) — a página desenha

  const cliente = () => canvas.getBoundingClientRect();
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    canvas.focus?.();
    const r = cliente(), x = e.clientX - r.left, y = e.clientY - r.top;
    let tipo = 'mouse';
    if (e.pointerType !== 'mouse') tipo = x < r.width * 0.45 && y > r.height * 0.3 && ![...ptrs.values()].some((p) => p.tipo === 'joy') ? 'joy' : 'cam';
    ptrs.set(e.pointerId, { tipo, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: e.timeStamp, mov: 0 }); // hora do evento (aparelho lento: o desenho entre o toque e a soltura não conta)
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ok */ }
    if (tipo === 'joy') { joy.ativo = true; joy.cx = e.clientX; joy.cy = e.clientY; mostrarJoy(e.clientX, e.clientY, 0, 0); }
    const cams = [...ptrs.values()].filter((p) => p.tipo === 'cam');
    if (cams.length === 2) pinca = { d: Math.hypot(cams[0].x - cams[1].x, cams[0].y - cams[1].y), dist: cam.dist };
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; p.mov = Math.max(p.mov, Math.hypot(p.x - p.x0, p.y - p.y0));
    if (p.tipo === 'joy') {
      const R = 62; let jx = (p.x - joy.cx) / R, jy = (p.y - joy.cy) / R; const l = Math.hypot(jx, jy); if (l > 1) { jx /= l; jy /= l; }
      joy.x = jx; joy.y = jy; mostrarJoy(joy.cx, joy.cy, jx, jy);
      if (p.mov > 8) destino = null;
      return;
    }
    const cams = [...ptrs.values()].filter((q) => q.tipo === 'cam');
    if (pinca && cams.length === 2) { const d = Math.hypot(cams[0].x - cams[1].x, cams[0].y - cams[1].y); cam.dist = clamp(pinca.dist * pinca.d / Math.max(20, d), LIM_DIST[0], LIM_DIST[1]); return; }
    if (p.mov > 6) { cam.giro -= dx * 0.0062; cam.incl = clamp(cam.incl + dy * 0.0045, 0.06, 1.25); arrastouEm = performance.now(); }
  });
  const soltar = (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    ptrs.delete(e.pointerId);
    if (p.tipo === 'joy') { joy.ativo = false; joy.x = joy.y = 0; esconderJoy(); }
    if (ptrs.size < 2) pinca = null;
    if (e.type === 'pointerup' && p.mov < 10 && e.timeStamp - p.t0 < 450) tocar(e.clientX, e.clientY);
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = clamp(cam.dist * (1 + clamp(e.deltaY, -200, 200) * 0.0012), LIM_DIST[0], LIM_DIST[1]); }, { passive: false });
  const TECLAS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift']);
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (TECLAS.has(k)) { teclas.add(k); destino = null; e.preventDefault(); }
    if (k === ' ' || e.code === 'Space') { e.preventDefault(); pular(); }
    if (k === 't' && !e.repeat) acenar();
    if ((k === 'enter' || k === 'e') && !e.repeat) interagir();
  });
  window.addEventListener('keyup', (e) => teclas.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => teclas.clear());

  function mostrarJoy(cx, cy, jx, jy) {
    if (!elJoy) return;
    const r = cliente();
    elJoy.base.style.transform = `translate(${cx - r.left - 70}px, ${cy - r.top - 70}px)`;
    elJoy.base.classList.add('ativo');
    elJoy.bola.style.transform = `translate(${jx * 52}px, ${jy * 52}px)`;
  }
  function esconderJoy() { if (elJoy) { elJoy.base.classList.remove('ativo'); elJoy.bola.style.transform = ''; } }

  // ---------- tocar: num boneco, numa porta ou no chão ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _p = new THREE.Vector3(), _c = new THREE.Vector3();
  function raioEsfera(c, r) {
    _c.copy(c).sub(ray.ray.origin); const t = _c.dot(ray.ray.direction); if (t < 0) return -1;
    const d2 = _c.lengthSq() - t * t; return d2 <= r * r ? t : -1;
  }
  function tocar(cx, cy) {
    const r = cliente(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    let melhor = null, mt = 1e9;
    for (const n of npcs.lista) { const t = raioEsfera(_p.copy(n.boneco.raiz.position).setY(n.boneco.raiz.position.y + n.altura * 0.5), Math.max(0.6, n.altura * 0.45)); if (t > 0 && t < mt) { mt = t; melhor = { x: n.boneco.raiz.position.x, z: n.boneco.raiz.position.z, perto: 1.6 }; } }
    for (const m of marcas) { const t = raioEsfera(_p.copy(m.position).setY(m.position.y + m.userData.lugar.alto), 1.6); if (t > 0 && t < mt) { mt = t; melhor = { x: m.position.x, z: m.position.z, perto: 0.6 }; } }
    if (!melhor) {
      // chão: anda pelo raio até passar por baixo do relevo
      const o = ray.ray.origin, d = ray.ray.direction; let s = 0, achou = false;
      for (; s < 160; s += 0.5) { _p.copy(o).addScaledVector(d, s); if (_p.y < Math.max(colisao.altura(_p.x, _p.z), colisao.NIVEL_AGUA)) { achou = true; break; } }
      if (!achou) return;
      let a = Math.max(0, s - 0.5), b = s;
      for (let i = 0; i < 12; i++) { const m = (a + b) / 2; _p.copy(o).addScaledVector(d, m); if (_p.y < Math.max(colisao.altura(_p.x, _p.z), colisao.NIVEL_AGUA)) b = m; else a = m; }
      _p.copy(o).addScaledVector(d, b);
      melhor = { x: _p.x, z: _p.z, perto: 0.35 };
    }
    destino = melhor; destinoParado = 0;
    destinoMarca.position.set(melhor.x, Math.max(colisao.altura(melhor.x, melhor.z), colisao.NIVEL_AGUA) + 0.06, melhor.z);
    destinoMarca.visible = true; destinoMarca.userData.t = 0;
    h.aoToque?.(melhor);
  }

  // ---------- ações ----------
  function pular() {
    if (nadando) { mergulhar(); return; } // na água funda o botão Pular vira Mergulhar
    if (noAr || bloqueado()) return;
    vy = PULO; noAr = true; eu.impulso(); pulou = true;
    npcs.puloPerto(pos.x, pos.z);
  }
  // ---------- mergulho: na água funda, desce ~4 s (a câmera vai junto) e volta para respirar ----------
  let mergulho = 0, mergulhoT = 0;
  function mergulhar(on = !mergulho) {
    if (bloqueado() || (on && !nadando)) return;
    mergulho = on ? 1 : 0; mergulhoT = on ? 4.2 : 0;
    h.aoMergulho?.(!!mergulho);
  }
  let acenando = 0;
  function acenar() {
    if (bloqueado()) return;
    eu.acenar(); acenando = 1.6; npcs.tchauPerto(pos.x, pos.z);
    h.aoTchau?.();
  }
  let perto = null, conversa = null, entrando = null;
  function interagir() {
    if (!perto || entrando) return;
    if (perto.tipo === 'npc') return conversar(perto.npc);
    const l = perto.lugar, st = estadoLugar[l.id];
    if (!st.aberto) { h.aoTrancado?.(l, st); return; }
    entrando = { l, t: 0 };
    h.aoEntrando?.(l);
  }
  async function conversar(n) {
    if (conversa) return;
    conversa = n;
    const r = await npcs.conversar(n, { nome: h.nome?.() || '', primeiraMissao: !!h.primeiraMissao?.(), lugares: estadoLugar });
    h.aoConversar?.(n, r);
  }
  function fimConversa() { npcs.fimConversa(conversa); conversa = null; }
  const bloqueado = () => !!entrando || !!h.pausado?.();

  // ---------- quadro ----------
  const _f = new THREE.Vector3(), _d = new THREE.Vector3();
  let sub = 0, camSub = false; // 0..1: quanto a câmera acompanha o mergulho · câmera embaixo d'água
  let avisoT = 0, tempoParado = 0, travado = 0, encaixar = false;
  function aviso(tipo) { if (performance.now() - avisoT > 2600) { avisoT = performance.now(); h.aoAviso?.(tipo); } }

  function mover(dx, dz) {
    const tenta = (x, z) => { const m = colisao.livre(x, z, 0.3); if (m) return m; if (npcs.colide(x, z, 0.3)) return 'npc'; return null; };
    let m = tenta(pos.x + dx, pos.z + dz);
    if (!m) { pos.x += dx; pos.z += dz; return true; }
    const motivo = m;
    // desliza na parede
    if (Math.abs(dx) > 1e-4 && !tenta(pos.x + dx, pos.z)) { pos.x += dx; return true; }
    if (Math.abs(dz) > 1e-4 && !tenta(pos.x, pos.z + dz)) { pos.z += dz; return true; }
    if (motivo === 'limite') aviso('limite'); else if (motivo === 'fundo') aviso('fundo');
    return false;
  }

  function tick(dtMundo, t, bruto = dtMundo) {
    // aparelho lento: o passo do boneco usa o tempo real (até 0,1 s), para não andar em câmera lenta
    const dt = Math.min(0.1, Math.max(dtMundo, bruto || 0));
    // direção pedida (relativa à câmera)
    const fx = -Math.sin(cam.giro), fz = -Math.cos(cam.giro), rx = Math.cos(cam.giro), rz = -Math.sin(cam.giro);
    let ix = 0, iz = 0, vMax = 0;
    const tk = (a, b) => teclas.has(a) || teclas.has(b);
    const kf = (tk('arrowup', 'w') ? 1 : 0) - (tk('arrowdown', 's') ? 1 : 0), kr = (tk('arrowright', 'd') ? 1 : 0) - (tk('arrowleft', 'a') ? 1 : 0);
    if (kf || kr) { ix = fx * kf + rx * kr; iz = fz * kf + rz * kr; vMax = teclas.has('shift') ? CORRER : TECLADO; }
    else if (joy.ativo && Math.hypot(joy.x, joy.y) > 0.12) {
      const m = Math.hypot(joy.x, joy.y); ix = fx * -joy.y + rx * joy.x; iz = fz * -joy.y + rz * joy.x;
      vMax = m > 0.8 ? CORRER : ANDAR * clamp(m / 0.8, 0.35, 1);
    } else if (destino) {
      const dx = destino.x - pos.x, dz = destino.z - pos.z, d = Math.hypot(dx, dz);
      if (d < destino.perto) { destino = null; destinoMarca.visible = false; }
      else { ix = dx; iz = dz; vMax = d > 6 ? TECLADO : clamp(d * 0.9, 1.4, TECLADO); }
    }
    if (bloqueado() || conversa) { ix = iz = 0; vMax = 0; }
    const il = Math.hypot(ix, iz); if (il > 1e-4) { ix /= il; iz /= il; }
    const naAgua = colisao.agua(pos.x, pos.z);
    if (naAgua > 0.25) vMax *= 0.6;
    // aceleração suave
    const ac = 1 - Math.exp(-dt * (il > 1e-4 ? 9 : 12));
    velX = lerp(velX, ix * vMax, ac); velZ = lerp(velZ, iz * vMax, ac);
    let vel = Math.hypot(velX, velZ);
    if (entrando) {
      // anda até o centro da porta e some num brilho
      const [lx, lz] = entrando.l.pos; entrando.t += dt;
      const dx = lx - pos.x, dz = lz - pos.z, d = Math.hypot(dx, dz);
      if (d > 0.15) { pos.x += (dx / d) * Math.min(d, 2.2 * dt); pos.z += (dz / d) * Math.min(d, 2.2 * dt); giro = girarPara(giro, Math.atan2(dx, dz), dt * 8); vel = 2.2; }
      if (entrando.t > 0.75 && !entrando.avisado) { entrando.avisado = true; h.aoEntrar?.(entrando.l); }
    } else if (vel > 0.02) {
      const passos = Math.ceil((vel * dt) / 0.2);
      let andou = false;
      for (let i = 0; i < passos; i++) andou = mover((velX * dt) / passos, (velZ * dt) / passos) || andou;
      if (!andou) { velX *= 0.5; velZ *= 0.5; }
      if (destino) { travado = andou ? 0 : travado + dt; if (travado > 0.7) { destino = null; destinoMarca.visible = false; travado = 0; } }
      if (il > 1e-4) giro = girarPara(giro, Math.atan2(ix, iz), dt * 10);
    }
    if (acenando > 0) { acenando -= dt; if (vel < 0.3) giro = girarPara(giro, cam.giro, dt * 6); }
    // altura: chão, água e pulo
    const chao = colisao.altura(pos.x, pos.z);
    const nada = naAgua > NADA;
    if (nada !== nadando) { nadando = nada; if (nada) h.aoAviso?.('agua'); h.aoNadando?.(nadando); if (!nada && mergulho) mergulhar(false); }
    if (mergulho && (mergulhoT -= dt) <= 0) mergulhar(false);
    const fundura = clamp(naAgua - 0.75, 0.2, 0.55); // até onde a cabeça desce (o corpo deitado não bate no fundo)
    // nadando: o ponto em que o corpo deita fica na superfície (costas e cabeça para fora); andando: pés no chão (ou no degrau)
    const base = nadando ? colisao.NIVEL_AGUA + eu.baseNado : Math.max(chao, colisao.piso(pos.x, pos.z));
    if (noAr) {
      vy -= GRAVIDADE * dt; yPe += vy * dt;
      if (yPe <= 0) { eu.pousar(vy); yPe = 0; vy = 0; noAr = false; }
    }
    // sobe e desce suave (entrar na água, subir um degrau)
    pos.y = Math.abs(base - pos.y) > 1.2 ? base : lerp(pos.y, base, 1 - Math.exp(-dt * (nadando ? 5 : 16)));
    eu.raiz.position.set(pos.x, pos.y + yPe, pos.z);
    eu.raiz.rotation.y = giro;
    eu.tick(dt, { vel, correr: CORRER, noAr, vy, nadando, vau: nadando ? 0 : clamp(naAgua / NADA, 0, 1), mergulho, fundura });
    sub = lerp(sub, mergulho && nadando ? 1 : 0, 1 - Math.exp(-dt * 2.5));
    eu.sombraEm(yPe, nadando || naAgua > 0.05);
    if (vel > 0.2 || noAr) tempoParado = 0; else tempoParado += dt;

    // outros bonecos
    npcs.tick(dt, t, pos);

    // perto de quê?
    let novo = null;
    const n = npcs.maisPerto(pos.x, pos.z, 2.6);
    if (n) novo = { tipo: 'npc', id: n.id, npc: n };
    else for (const l of LUGARES) { if (Math.hypot(l.pos[0] - pos.x, l.pos[1] - pos.z) < l.raio) { novo = { tipo: 'lugar', id: l.id, lugar: l, aberto: estadoLugar[l.id].aberto }; break; } }
    if ((novo?.id ?? null) !== (perto?.id ?? null)) { perto = novo; h.aoPerto?.(perto); }
    if (conversa && Math.hypot(conversa.boneco.raiz.position.x - pos.x, conversa.boneco.raiz.position.z - pos.z) > 4) { h.aoFimConversa?.(); fimConversa(); }

    // marcas pulsando
    for (const m of marcas) {
      const ud = m.userData, aberto = estadoLugar[ud.lugar.id].aberto;
      ud.placa.position.y = ud.lugar.alto + (menos ? 0 : Math.sin(t * 1.6 + m.position.x) * 0.08);
      ud.anel.material.emissiveIntensity = aberto ? 1.3 + (menos ? 0 : Math.sin(t * 3) * 0.5) : 0.2;
      ud.placa.visible = perto?.id !== ud.lugar.id && !camSub; // de perto quem mostra o nome é o HUD; embaixo d'água, nada de placa
      m.visible = !camSub; // anel e placa são da superfície
      const s = perto?.id === ud.lugar.id ? 1.15 : 1; ud.anel.scale.setScalar(lerp(ud.anel.scale.x, s, 0.15));
    }
    if (destinoMarca.visible) { destinoMarca.userData.t += dt; destinoMarca.scale.setScalar(1 + (menos ? 0 : Math.sin(destinoMarca.userData.t * 6) * 0.12)); }

    // câmera
    const moveu = vel > 0.6;
    const ocioso = performance.now() - arrastouEm > 1400;
    if (!menos && !cam.alto && moveu && ocioso && !destino && il > 1e-4) {
      // segue por trás devagar (só quando a criança anda para a frente ou de lado)
      const atras = giro + Math.PI; let dif = atras - cam.giro; while (dif > Math.PI) dif -= Math.PI * 2; while (dif < -Math.PI) dif += Math.PI * 2;
      if (Math.abs(dif) < 1.9) cam.giro += dif * clamp(dt * 0.9 * (vel / CORRER + 0.3), 0, 1);
    }
    const distAlvo = cam.alto ? 34 : lerp(cam.dist, 3.6, sub), inclAlvo = cam.alto ? 0.95 : lerp(cam.incl, 0.12, sub);
    alvoCam.set(pos.x, pos.y + yPe * 0.35 + ALTURA * (cam.alto ? 0.2 : 0.82), pos.z);
    // mergulhando: a câmera desce atrás do boneco, embaixo d'água
    if (sub > 0.01) alvoCam.y = lerp(alvoCam.y, eu.cabecaY() ?? alvoCam.y, sub);
    const ci = Math.cos(inclAlvo), si = Math.sin(inclAlvo);
    _d.set(Math.sin(cam.giro) * ci, si, Math.cos(cam.giro) * ci);
    // não atravessa prédios: anda do alvo para trás e para antes de entrar em algo mais alto que a câmera
    let livre = distAlvo;
    for (let s = 0.6; s <= distAlvo; s += 0.3) {
      _f.copy(alvoCam).addScaledVector(_d, s);
      if (colisao.topo(_f.x, _f.z) > _f.y - 0.25 || _f.y < colisao.altura(_f.x, _f.z) + 0.5) { livre = Math.max(1.2, s - 0.45); break; }
    }
    cam.distReal = livre < cam.distReal ? lerp(cam.distReal, livre, 1 - Math.exp(-dt * 18)) : lerp(cam.distReal, livre, 1 - Math.exp(-dt * (cam.alto ? 2.5 : 4)));
    desejada.copy(alvoCam).addScaledVector(_d, cam.distReal);
    desejada.y = Math.max(desejada.y, colisao.altura(desejada.x, desejada.z) + lerp(1.25, 0.35, sub));
    if (sub > 0.5) desejada.y = Math.min(desejada.y, colisao.NIVEL_AGUA - 0.15); // fica embaixo d'água junto do boneco
    // a câmera está embaixo da linha d'água: no mergulho (mesmo perto da margem) ou dentro do rio
    const submersa = camera.position.y < colisao.NIVEL_AGUA - 0.02 && (sub > 0.2 || colisao.agua(camera.position.x, camera.position.z) > 0);
    if (submersa !== camSub) { camSub = submersa; h.aoSubmerso?.(submersa); }
    if (encaixar) { encaixar = false; cam.distReal = livre; desejada.copy(alvoCam).addScaledVector(_d, livre); camera.position.copy(desejada); }
    else camera.position.lerp(desejada, menos ? 1 - Math.exp(-dt * 6) : 1 - Math.exp(-dt * 14));
    camera.lookAt(alvoCam);
    mundo.controls.target.copy(alvoCam);
    enquadrar(dt);
    // embaixo d'água: sem placas, balões e marcador de destino (voltam ao subir)
    if (camSub !== subAntes) { subAntes = camSub; for (const n of npcs.lista) n.boneco.raiz.visible = !camSub || Math.hypot(n.boneco.raiz.position.x - pos.x, n.boneco.raiz.position.z - pos.z) < 12; if (camSub) destinoMarca.visible = false; }
    if (camSub) for (const n of npcs.lista) n.boneco.balao.visible = false;
    // o fundo do rio (submerso.js) sabe onde está o corpo da criança: os peixinhos nadam em volta no mergulho
    pePeixes.x = pos.x; pePeixes.z = pos.z; pePeixes.y = nadando ? (eu.cabecaY() ?? pos.y) - 0.35 : pos.y;
  }
  let subAntes = false;
  const pePeixes = { x: 0, y: 0, z: 0 };
  mundo.pe = pePeixes;

  // ---------- cartão aberto (conversa, porta trancada): a imagem sobe para o boneco não ficar atrás dele ----------
  let limiteCartao = null, desloca = 0;
  const _pe = new THREE.Vector3();
  function enquadrar(dt) {
    const w = canvas.clientWidth || 1, hh = canvas.clientHeight || 1;
    let alvo = 0;
    if (limiteCartao != null) {
      camera.updateMatrixWorld();
      // os pés do boneco na tela (sem o deslocamento atual)
      _pe.set(pos.x, pos.y + yPe, pos.z).project(camera);
      const yTela = (-_pe.y * 0.5 + 0.5) * hh + desloca;
      alvo = clamp(yTela - (limiteCartao - 18), 0, hh * 0.42);
    }
    desloca = lerp(desloca, alvo, 1 - Math.exp(-dt * 8));
    if (desloca > 0.5) camera.setViewOffset(w, hh, 0, desloca, w, hh);
    else if (camera.view?.enabled) { desloca = 0; camera.clearViewOffset(); }
  }

  let tSim = 1000;
  mundo.usarControlador({ tick });
  // começa já atrás do boneco (sem voo)
  tick(0.016, 0);
  camera.position.copy(desejada);

  return {
    colisao, npcs, rotasRuins, LUGARES,
    get posicao() { return { x: pos.x, y: pos.y, z: pos.z, giro, nadando, noAr, mergulhando: !!mergulho, cameraSubmersa: camSub }; },
    mergulhar,
    get camera() { return { ...cam }; },
    get perto() { return perto; },
    usarAvatar(pacote) { eu.usarModelo(malhaDoPacote(pacote), pacote.altura || 1.1); },
    /** O boneco da criança (testes: ossos, cabeça, silhueta). */
    get boneco() { return eu; },
    usarModeloNpc(id, pacote) { npcs.usarModelo(id, malhaDoPacote(pacote), pacote.altura || 1.1); },
    /** Estado das portas vindo do app: { id: { aberto, falta } }. */
    definirLugares(estados) { for (const [id, st] of Object.entries(estados || {})) if (estadoLugar[id]) estadoLugar[id] = { ...estadoLugar[id], ...st }; remontarMarcas(); perto = null; },
    pular, acenar, interagir, conversar, fimConversa,
    cancelarEntrada() { entrando = null; },
    /** Há um cartão na tela começando em `yTopo` px (do topo da página): a imagem sobe para o boneco aparecer acima dele. null = sem cartão. */
    reservarEmbaixo(yTopo) { limiteCartao = yTopo; },
    /** Joystick/teclas vindos de fora (testes, botões da página). */
    teclar(k, on) { if (on) teclas.add(k); else teclas.delete(k); },
    girarCamera(da) { cam.giro += da; arrastouEm = performance.now(); },
    zoom(f) { cam.dist = clamp(cam.dist * f, LIM_DIST[0], LIM_DIST[1]); },
    verDoAlto(on = !cam.alto) { cam.alto = on; return on; },
    irPara(x, z) { destino = { x, z, perto: 0.4 }; },
    /** Para onde o boneco está indo sozinho (tocar no chão / irPara), ou null. */
    get destino() { return destino ? { x: destino.x, z: destino.z } : null; },
    /**
     * Testes e aparelho sem placa de vídeo: avança a simulação `seg` segundos em passos fixos, sem desenhar.
     * Assim o teste confere o que acontece (andou, pulou, chegou na porta) sem depender de quantos quadros por segundo saem.
     */
    simular(seg, passo = 0.05) { const n = Math.round(seg / passo); for (let k = 0; k < n; k++) { tSim += passo; tick(passo, tSim, passo); } return { x: pos.x, z: pos.z, noAr }; },
    teleportar(x, z, g = giro) { pos.x = x; pos.z = z; giro = g; velX = velZ = 0; destino = null; encaixar = true; },
  };
}
