// FONEMA · Mundo 3D v2 — CAÇA AO TESOURO DAS PALAVRAS (fila do dono nº 25; nome do projeto).
//
// Esta página só DESENHA e AVISA: baús com círculo no chão, letra/figura flutuando, faixa da palavra no topo, painel de escolha,
// seta de dica, moedinhas de enfeite e o barquinho. Quem decide o que entra, o que é certo e o que conta é o app
// (web/src/telas/crianca/caca/useCacaTesouro.ts, regras em packages/motor/src/caca-tesouro.ts). Conversa por postMessage:
//  - app → página: fonema:caca-niveis {niveis, abrir, barco, falaBarco} · fonema:caca-baus {baus, charada?, apresenta?, titulo}
//    · fonema:caca-bau {id, estado: 'certo'|'tentado'|'sumir', voa?: índice da faixa} · fonema:caca-faixa {letras: (string|null)[]}
//    · fonema:caca-escolher {titulo, opcoes, marcadas, brilha} · fonema:caca-fechar-painel · fonema:caca-seta {id|null, lugar?}
//    · fonema:caca-fim {texto} · fonema:caca-parar
//  - página → app: fonema:caca-pronta · fonema:caca-comecar {nivel} · fonema:caca-chegou {id} · fonema:caca-escolha {id, pos}
//    · fonema:caca-ouvir · fonema:caca-dica · fonema:caca-sair
// Chegar = ficar (quase parado) dentro do círculo por um instante: passar correndo por cima de um baú não responde (o 1º baú em que
// a criança PARA é a escolha). Fundo do rio: mergulhando, perto do baú. Debaixo da ponte / outra margem: de barco, perto do baú.
// A chegada é conferida em `passeio.noQuadro` (roda também no `simular()` dos testes, sem depender de quadros por segundo).
import * as THREE from 'three';
import { canvasTex, radialTex, rbox } from './kit.js';
import { criarBarco, PIER } from './barco.js';

const RAIO = 1.25, PARADO = 0.55, VEL_PARADO = 0.45;

export function ligarCaca({ mundo, passeio, avisar }) {
  const { scene } = mundo;
  const colisao = passeio.colisao;
  const N = colisao.NIVEL_AGUA;
  const $ = (s) => document.querySelector(s);
  const grupo = new THREE.Group(); grupo.name = 'caca-tesouro'; scene.add(grupo);
  const menos = document.body.classList.contains('menos') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- HUD (DOM) ----------------------------------------------------------------
  const css = document.createElement('style');
  css.textContent = `
  #btMapa .ic { font-size: 34px; }
  #cacaBarra { left: max(14px, env(safe-area-inset-left)); top: calc(var(--topo) + 12px); display: none; flex-direction: column; gap: 12px; }
  body.caca #cacaBarra { display: flex; }
  #cacaBarra .bt { width: 64px; height: 64px; }
  #cacaFaixa { left: 50%; transform: translateX(-50%); top: calc(var(--topo) + 64px); display: none; gap: 8px; padding: 8px 12px; background: rgba(255,248,236,.95); border-radius: 22px; box-shadow: var(--sombra); pointer-events: none; }
  #cacaFaixa.on { display: flex; }
  #cacaFaixa i { width: 54px; height: 64px; border-radius: 14px; background: #EFE4D0; display: grid; place-items: center; font: 700 44px Andika, sans-serif; font-style: normal; color: var(--tinta); }
  #cacaFaixa i.cheia { background: #fff; box-shadow: inset 0 0 0 3px var(--sol); }
  .caca-voa { position: fixed; z-index: 12; font: 700 52px Andika, sans-serif; color: var(--tinta); background: #fff; border-radius: 14px; padding: 2px 14px; box-shadow: var(--sombra); transition: transform .8s cubic-bezier(.3,.8,.3,1), opacity .2s; pointer-events: none; }
  #cacaAviso { left: 50%; transform: translateX(-50%); bottom: max(150px, calc(env(safe-area-inset-bottom) + 150px)); max-width: min(560px, calc(100vw - 24px)); background: rgba(255,248,236,.96); border-radius: 26px; box-shadow: var(--sombra); padding: 10px 18px; font: 700 19px Andika, sans-serif; display: none; align-items: center; gap: 12px; pointer-events: none; }
  #cacaAviso.on { display: flex; }
  #cacaAviso b { font-size: 34px; }
  #cacaPainel, #cacaMenu { position: fixed; z-index: 9; left: 50%; bottom: max(140px, calc(env(safe-area-inset-bottom) + 140px)); transform: translateX(-50%); background: var(--papel); border-radius: 30px; box-shadow: 0 20px 60px rgba(40,30,60,.4); padding: 16px 20px; text-align: center; width: min(560px, calc(100vw - 20px)); display: none; }
  #cacaPainel.on, #cacaMenu.on { display: block; }
  #cacaPainel h3, #cacaMenu h3 { margin: 2px 0 10px; font-size: 24px; }
  #cacaPainel .ops { display: flex; gap: 14px; justify-content: center; }
  #cacaPainel .op { width: 110px; height: 110px; border-radius: 24px; font: 700 66px Andika, sans-serif; padding: 0; }
  #cacaPainel .op img { width: 92px; height: 92px; object-fit: contain; }
  #cacaPainel .op.tentado { opacity: .38; }
  #cacaPainel .op.brilha { box-shadow: 0 0 0 6px #fff, 0 0 26px 10px #FFD66B; }
  #cacaPainel .palavra { font: 700 54px Andika, sans-serif; letter-spacing: 4px; margin: 0 0 10px; }
  #cacaMenu .niveis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  #cacaMenu .bt { width: 100%; min-height: 76px; flex-direction: column; gap: 2px; font-size: 18px; }
  #cacaMenu .bt.trancado { background: #E1E4EC; }
  #cacaMenu .bt small { font: 700 13px Andika, sans-serif; opacity: .8; }
  #cacaMenu .fechar { margin-top: 10px; width: auto; min-height: 56px; }
  #cacaMoedas { left: max(90px, calc(env(safe-area-inset-left) + 90px)); top: calc(var(--topo) + 18px); background: rgba(255,248,236,.95); border-radius: 22px; padding: 6px 14px; font-size: 22px; box-shadow: var(--sombra); display: none; pointer-events: none; }
  body.caca #cacaMoedas.on { display: block; }
  #btDescer { position: fixed; z-index: 6; right: max(16px, env(safe-area-inset-right)); bottom: max(250px, calc(env(safe-area-inset-bottom) + 250px)); display: none; background: var(--sol); }
  body.no-barco #btDescer { display: inline-flex; }
  @media (max-width: 700px) {
    #cacaBarra .bt { width: 54px; height: 54px; } #cacaBarra .bt .ic { font-size: 26px; }
    #cacaFaixa i { width: 40px; height: 50px; font-size: 34px; }
    #cacaPainel .op { width: 92px; height: 92px; font-size: 54px; } #cacaPainel .op img { width: 76px; height: 76px; }
    #cacaAviso { font-size: 16px; bottom: 210px; }
    #cacaPainel, #cacaMenu { bottom: 200px; }
    #cacaMoedas { left: 76px; }
  }`;
  document.head.appendChild(css);
  const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };
  const bt = (ic, rot, fn, cls = '', testid = '') => { const b = el('button', { className: `bt ${cls}`, onclick: fn }, `<span class="ic">${ic}</span>${rot}`); if (testid) b.dataset.testid = testid; b.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); }); return b; };

  const btMapa = bt('🗺️', '', () => abrirMenu(), 'redondo', 'caca-mapa'); btMapa.title = 'Caça ao tesouro'; btMapa.setAttribute('aria-label', 'Caça ao tesouro'); btMapa.id = 'btMapa';
  $('#topoDir')?.appendChild(btMapa);
  const barra = el('div', { id: 'cacaBarra', className: 'hud' });
  barra.append(
    bt('👂', '', () => avisar('fonema:caca-ouvir'), 'redondo', 'caca-ouvir'),
    bt('💡', '', () => avisar('fonema:caca-dica'), 'redondo', 'caca-dica'),
    bt('✖️', '', () => sair(), 'redondo', 'caca-sair'));
  barra.children[0].setAttribute('aria-label', 'Ouvir de novo'); barra.children[1].setAttribute('aria-label', 'Dica'); barra.children[2].setAttribute('aria-label', 'Sair da caça');
  const faixa = el('div', { id: 'cacaFaixa', className: 'hud' }); faixa.dataset.testid = 'caca-faixa';
  const aviso = el('div', { id: 'cacaAviso', className: 'hud', role: 'status' });
  const painel = el('div', { id: 'cacaPainel', role: 'dialog' }); painel.dataset.testid = 'caca-painel';
  const menu = el('div', { id: 'cacaMenu', role: 'dialog' }); menu.dataset.testid = 'caca-menu';
  const moedasEl = el('div', { id: 'cacaMoedas', className: 'hud', textContent: '🪙 0' });
  const btDescer = bt('⚓', 'Descer do barco', () => descer(), '', 'barco-descer'); btDescer.id = 'btDescer';
  document.body.append(barra, faixa, aviso, painel, menu, moedasEl, btDescer);
  let toastT = 0;
  function mostrarAviso(ic, txt, ms = 6000) { aviso.innerHTML = ''; aviso.append(el('b', {}, ic), el('span', { textContent: txt })); aviso.classList.add('on'); clearTimeout(toastT); if (ms) toastT = setTimeout(() => aviso.classList.remove('on'), ms); }

  // ---------------------------------------------------------------- baús (3D) ----------------------------------------------------------------
  const brilho = radialTex('rgba(255,236,170,0.95)', 'rgba(255,214,107,0)');
  const matMadeira = new THREE.MeshStandardMaterial({ color: '#9A5B2E', roughness: 0.7 });
  const matOuro = new THREE.MeshStandardMaterial({ color: '#F2B33D', emissive: '#7A5200', emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.4 });
  function placa(b) {
    const tex = canvasTex(256, 256, (g, w, h) => {
      g.beginPath(); g.arc(w / 2, h / 2, 118, 0, 7); g.fillStyle = '#FFFFFF'; g.shadowColor = 'rgba(40,30,60,.35)'; g.shadowBlur = 12; g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = 10; g.strokeStyle = '#F2B33D'; g.stroke();
      g.fillStyle = '#2E4374'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (b.letra) { g.font = '700 170px Andika, Fredoka, sans-serif'; g.fillText(b.letra, w / 2, h / 2 + 8); }
      else if (!b.figura) { g.font = '700 150px Fredoka, sans-serif'; g.fillText('?', w / 2, h / 2 + 6); }
    });
    if (b.figura) {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => { const g = tex.image.getContext('2d'); g.save(); g.beginPath(); g.arc(128, 128, 104, 0, 7); g.clip(); g.drawImage(im, 34, 34, 188, 188); g.restore(); tex.needsUpdate = true; };
      im.src = b.figura;
    }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, fog: false, toneMapped: false }));
    s.scale.set(1.9, 1.9, 1); s.renderOrder = 6; return s;
  }
  /** Ponto alcançável: se cair numa parede, procura o lugar livre mais perto (até 5 m). */
  function livreMaisPerto(x, z) {
    if (!colisao.livre(x, z, 0.55)) return [x, z];
    for (let r = 0.5; r <= 5; r += 0.5) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (!colisao.livre(px, pz, 0.55)) return [px, pz]; }
    return [x, z];
  }
  const baus = new Map(); // id → { def, g, tampa, sinal, anel, estado, espera, parado }
  function criarBau(def) {
    let { x, z } = def;
    const modo = def.modo || 'terra';
    if (modo === 'terra' || modo === 'agua') [x, z] = livreMaisPerto(x, z);
    if (modo === 'barco') {
      // de barco: o baú fica na beira da água funda (o barco vai até ~4,7 m do meio do rio e alcança a ~4,2 m)
      const v = mundo.vila;
      for (let i = 0; i < 80 && v.distRio(x, z) > 4.9; i++) {
        let mx = 0, mz = 0, md = 1e9; for (const q of v.RIO_PTS) { const dd = (q.x - x) ** 2 + (q.y - z) ** 2; if (dd < md) { md = dd; mx = q.x; mz = q.y; } }
        const l = Math.hypot(mx - x, mz - z) || 1; x += ((mx - x) / l) * 0.2; z += ((mz - z) / l) * 0.2;
      }
    }
    const chao = colisao.altura(x, z);
    const y = modo === 'mergulho' ? chao : modo === 'barco' ? Math.max(chao, N) : modo === 'agua' ? Math.max(chao, N - 0.05) : chao;
    const g = new THREE.Group(); g.position.set(x, y, z);
    const corpo = new THREE.Mesh(rbox(0.9, 0.55, 0.62, 0.08), matMadeira); corpo.position.y = 0.3; corpo.castShadow = true; g.add(corpo);
    const faixaM = new THREE.Mesh(rbox(0.95, 0.12, 0.66, 0.04), matOuro); faixaM.position.y = 0.42; g.add(faixaM);
    const tampa = new THREE.Group(); tampa.position.set(0, 0.58, -0.31); g.add(tampa);
    const tm = new THREE.Mesh(rbox(0.92, 0.2, 0.64, 0.09), matMadeira); tm.position.set(0, 0.06, 0.31); tm.castShadow = true; tampa.add(tm);
    const fecho = new THREE.Mesh(rbox(0.16, 0.18, 0.06, 0.03), matOuro); fecho.position.set(0, 0.0, 0.64); tampa.add(fecho);
    if (modo === 'barco' && chao < N) { const boia = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.18, 20), new THREE.MeshStandardMaterial({ color: '#C98D55', roughness: 0.8 })); boia.position.y = 0.0; g.add(boia); }
    const anel = new THREE.Mesh(new THREE.TorusGeometry(RAIO, 0.07, 8, 40), new THREE.MeshStandardMaterial({ color: '#FFD66B', emissive: '#FFD66B', emissiveIntensity: 1.6, roughness: 0.4 }));
    anel.rotation.x = Math.PI / 2; anel.position.y = 0.05; g.add(anel);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(RAIO, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: brilho, color: '#FFD66B', transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
    disco.position.y = 0.06; g.add(disco);
    const sinal = placa(def); sinal.position.y = 2.1; g.add(sinal);
    // fundo do rio: bolhinhas na superfície mostram onde mergulhar
    let bolhas = null;
    if (modo === 'mergulho') { bolhas = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.75, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#E8FBFF', transparent: true, opacity: 0.7, depthWrite: false })); bolhas.position.set(x, N + 0.03, z); grupo.add(bolhas); }
    grupo.add(g);
    const b = { def: { ...def, x, z, modo }, g, tampa, sinal, anel, disco, bolhas, estado: 'fechado', espera: false, parado: 0, abre: 0 };
    baus.set(def.id, b);
    return b;
  }
  function limparBaus() {
    for (const b of baus.values()) { grupo.remove(b.g); if (b.bolhas) grupo.remove(b.bolhas); b.sinal.material.map?.dispose(); b.sinal.material.dispose(); }
    baus.clear(); mostrarSeta(null);
  }

  // seta de dica (conta como ajuda no app) e coluna de luz que se vê de longe
  const seta = new THREE.Group();
  { const m = new THREE.MeshStandardMaterial({ color: '#FF7A45', emissive: '#FF5A1F', emissiveIntensity: 0.8 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 18), m); cone.rotation.x = Math.PI; seta.add(cone);
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), m); haste.position.y = 0.7; seta.add(haste);
    const luz = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 14, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE8A0', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    luz.position.y = 7; seta.add(luz); seta.visible = false; grupo.add(seta); }
  let setaAlvo = null;
  function mostrarSeta(alvo) { setaAlvo = alvo; seta.visible = !!alvo; if (alvo) seta.position.set(alvo.x, alvo.y + 2.9, alvo.z); }

  // moedinhas de enfeite (não ficam guardadas; nada disso conta)
  const moedas = [];
  let nMoedas = 0;
  const moedaTex = canvasTex(64, 64, (g) => { g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fillStyle = '#F2B33D'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#C98A10'; g.stroke(); g.fillStyle = '#FFF2C4'; g.font = '700 30px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', 32, 34); });
  function espalharMoedas(defs) {
    for (const m of moedas) grupo.remove(m); moedas.length = 0;
    for (const d of defs) {
      if ((d.modo || 'terra') !== 'terra') continue;
      for (let k = 0; k < 2; k++) {
        const a = Math.random() * Math.PI * 2, r = 2.2 + Math.random() * 1.5;
        const [x, z] = livreMaisPerto(d.x + Math.cos(a) * r, d.z + Math.sin(a) * r);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: moedaTex, transparent: true, fog: false })); s.scale.setScalar(0.5);
        s.position.set(x, colisao.altura(x, z) + 0.7, z); grupo.add(s); moedas.push(s);
      }
    }
  }

  // ---------------------------------------------------------------- barco ----------------------------------------------------------------
  let falaBarco = null;
  const barco = criarBarco(mundo, passeio, {
    aoEmbarcar() {
      document.body.classList.add('no-barco');
      let visto = false; try { visto = localStorage.getItem('fonema-barco-visto') === '1'; localStorage.setItem('fonema-barco-visto', '1'); } catch { /* sem armazenamento */ }
      if (!visto) { mostrarAviso('⛵', falaBarco?.texto || 'Arraste o dedo ou use as setinhas para remar. Para descer, volte ao píer.', 9000); if (falaBarco) avisar('fonema:falar', { falas: [falaBarco] }); }
      avisar('fonema:caca-barco', { on: true });
    },
    aoDesembarcar() { document.body.classList.remove('no-barco'); avisar('fonema:caca-barco', { on: false }); },
    aoMargem() { if (performance.now() - margemT > 2600) { margemT = performance.now(); mostrarAviso('🌿', 'Aqui é a margem: o barco vira para o rio.', 2500); } },
  });
  let margemT = 0;
  function descer() {
    if (barco.desembarcar()) { mostrarSeta(null); return; }
    mostrarAviso('⚓', 'Volte ao píer para descer do barco.', 4000);
    mostrarSeta({ x: PIER.x + 3.5, y: N, z: PIER.z - 0.6 });
  }
  let barcoAberto = false;
  function abrirBarco() {
    if (barcoAberto) return;
    barcoAberto = true;
    const l = passeio.LUGARES.find((x) => x.id === 'barco');
    if (l) { l.sub = 'Passear de barco'; l.emBreve = false; }
    passeio.definirLugares({ barco: { aberto: true, falta: '' } });
  }

  // ---------------------------------------------------------------- estado da caça ----------------------------------------------------------------
  let niveis = [], emCaca = false;
  function abrirMenu() {
    menu.innerHTML = '';
    menu.append(el('h3', { textContent: '🗺️ Caça ao tesouro' }));
    const grade = el('div', { className: 'niveis' });
    if (!niveis.length) grade.append(el('p', { textContent: 'A caça abre pelo app.' }));
    for (const n of niveis) {
      const b = bt(n.aberto ? n.icone : '🔒', `${n.nome}${n.aberto ? '' : `<small>${n.falta || ''}</small>`}`, () => { if (!n.aberto) return; fecharMenu(); avisar('fonema:caca-comecar', { nivel: n.nivel }); }, n.aberto ? 'sol' : 'trancado', `caca-nivel-${n.nivel}`);
      b.dataset.aberto = n.aberto ? '1' : '0';
      grade.append(b);
    }
    menu.append(grade, bt('👍', 'Agora não', () => fecharMenu(), 'fechar'));
    menu.classList.add('on');
  }
  function fecharMenu() { menu.classList.remove('on'); }
  function sair() {
    emCaca = false; document.body.classList.remove('caca'); limparBaus(); fecharPainel(); faixa.classList.remove('on'); aviso.classList.remove('on');
    for (const m of moedas) grupo.remove(m); moedas.length = 0;
    avisar('fonema:caca-sair');
  }
  function fecharPainel() { painel.classList.remove('on'); painel.innerHTML = ''; }

  function desenharFaixa(letras) {
    if (!letras) { faixa.classList.remove('on'); return; }
    faixa.innerHTML = '';
    letras.forEach((l, i) => { const c = el('i', { textContent: l || '' }); if (l) c.classList.add('cheia'); c.dataset.i = i; faixa.append(c); });
    faixa.classList.add('on');
  }
  const _v = new THREE.Vector3();
  function voar(b, i) {
    const slot = faixa.children[i]; if (!slot) return;
    _v.copy(b.g.position); _v.y += 2.1; _v.project(mundo.camera);
    const r = mundo.renderer.domElement.getBoundingClientRect();
    const sx = r.left + (_v.x * 0.5 + 0.5) * r.width, sy = r.top + (-_v.y * 0.5 + 0.5) * r.height;
    const t = slot.getBoundingClientRect();
    const v = el('div', { className: 'caca-voa', textContent: b.def.letra || '' });
    v.style.left = `${sx - 25}px`; v.style.top = `${sy - 30}px`; document.body.append(v);
    requestAnimationFrame(() => { v.style.transform = `translate(${t.left - sx + 25}px, ${t.top - sy + 30}px)`; });
    setTimeout(() => { slot.textContent = b.def.letra || ''; slot.classList.add('cheia'); v.remove(); }, menos ? 50 : 850);
  }

  function apresentar(ap) {
    if (!ap) return;
    let vistos = []; try { vistos = JSON.parse(localStorage.getItem('fonema-caca-lugares') || '[]'); } catch { /* ok */ }
    if (vistos.includes(ap.lugar)) return false;
    vistos.push(ap.lugar); try { localStorage.setItem('fonema-caca-lugares', JSON.stringify(vistos)); } catch { /* ok */ }
    return true;
  }

  window.addEventListener('message', (ev) => {
    const m = ev.data; if (!m || typeof m !== 'object' || typeof m.tipo !== 'string' || !m.tipo.startsWith('fonema:caca')) return;
    const d = m.detalhe || {};
    switch (m.tipo) {
      case 'fonema:caca-niveis':
        niveis = d.niveis || [];
        if (d.falaBarco) falaBarco = d.falaBarco;
        if (d.barco) abrirBarco();
        btMapa.dataset.aberto = niveis.some((n) => n.aberto) ? '1' : '0';
        if (d.abrir) abrirMenu(); else if (menu.classList.contains('on')) abrirMenu();
        break;
      case 'fonema:caca-baus': {
        emCaca = true; document.body.classList.add('caca'); fecharMenu(); fecharPainel();
        limparBaus();
        for (const b of d.baus || []) criarBau(b);
        if (d.moedas) { espalharMoedas(d.baus || []); moedasEl.classList.add('on'); }
        if (d.charada) {
          const novo = d.apresenta && apresentar(d.apresenta);
          mostrarAviso(d.charada.icone || '🗺️', novo ? `${d.apresenta.texto} ${d.charada.texto}` : d.charada.texto, 9000);
        } else if (d.titulo) mostrarAviso('🗺️', d.titulo, 4500);
        break;
      }
      case 'fonema:caca-bau': {
        const b = baus.get(d.id); if (!b) break;
        b.espera = false;
        if (d.estado === 'certo') { b.estado = 'certo'; b.abre = 0.001; if (d.voa != null) voar(b, d.voa); }
        if (d.estado === 'tentado') { b.estado = 'tentado'; b.sinal.material.opacity = 0.4; b.anel.material.emissiveIntensity = 0.15; b.disco.material.opacity = 0.15; b.treme = 0.6; }
        if (d.estado === 'sumir') { b.estado = 'sumir'; b.some = 1; }
        if (d.estado === 'fechado') { b.estado = 'fechado'; b.parado = 0; b.sinal.material.opacity = 1; b.anel.material.emissiveIntensity = 1.6; b.disco.material.opacity = 0.55; }
        if (setaAlvo && setaAlvo.id === d.id) mostrarSeta(null);
        break;
      }
      case 'fonema:caca-faixa': desenharFaixa(d.letras || null); break;
      case 'fonema:caca-escolher': {
        painel.innerHTML = '';
        if (d.palavra) painel.append(el('div', { className: 'palavra', textContent: d.palavra }));
        painel.append(el('h3', { textContent: d.titulo || '' }));
        const ops = el('div', { className: 'ops' });
        (d.opcoes || []).forEach((o, k) => {
          const b = el('button', { className: 'bt op', onclick: () => { if (b.classList.contains('tentado')) return; avisar('fonema:caca-escolha', { id: o.id, pos: k }); } });
          b.dataset.testid = `caca-opcao-${k}`; b.dataset.id = o.id;
          if (o.figura) { const im = el('img', { src: o.figura, alt: '' }); b.append(im); b.setAttribute('aria-label', 'Figura'); } else b.textContent = o.letra;
          if ((d.marcadas || []).includes(o.id)) b.classList.add('tentado');
          if (d.brilha === o.id) b.classList.add('brilha');
          ops.append(b);
        });
        painel.append(ops); painel.classList.add('on');
        break;
      }
      case 'fonema:caca-fechar-painel': fecharPainel(); break;
      case 'fonema:caca-seta': {
        if (!d.id && !d.ponto) { mostrarSeta(null); break; }
        const b = d.id ? baus.get(d.id) : null;
        mostrarSeta(b ? { id: d.id, x: b.g.position.x, y: b.g.position.y, z: b.g.position.z } : { x: d.ponto[0], y: colisao.altura(d.ponto[0], d.ponto[1]), z: d.ponto[1] });
        break;
      }
      case 'fonema:caca-aviso': mostrarAviso(d.icone || '🗺️', d.texto || '', d.ms ?? 5000); break;
      case 'fonema:caca-fim':
        emCaca = false; fecharPainel(); mostrarSeta(null);
        mostrarAviso('🏆', d.texto || 'Tesouro encontrado!', 5000);
        setTimeout(() => { if (!emCaca) { limparBaus(); faixa.classList.remove('on'); document.body.classList.remove('caca'); for (const mm of moedas) grupo.remove(mm); moedas.length = 0; } }, 2500);
        break;
      case 'fonema:caca-parar': sair(); break;
      default: break;
    }
  });

  // ---------------------------------------------------------------- a cada passo ----------------------------------------------------------------
  let ant = null, tAnim = 0;
  passeio.noQuadro((dt, t, pos) => {
    tAnim += dt;
    const vel = ant ? Math.hypot(pos.x - ant.x, pos.z - ant.z) / Math.max(dt, 1e-3) : 0;
    ant = { x: pos.x, z: pos.z };
    const st = passeio.posicao;
    for (const [id, b] of baus) {
      // animação: placa boiando, tampa abrindo, tremida do errado, sumir
      b.sinal.position.y = 2.1 + (menos ? 0 : Math.sin(tAnim * 2 + b.g.position.x) * 0.1);
      if (b.abre > 0 && b.abre < 1) { b.abre = Math.min(1, b.abre + dt * 2.5); b.tampa.rotation.x = -1.9 * b.abre; b.sinal.position.y += b.abre * 0.6; }
      if (b.treme > 0) { b.treme -= dt; b.g.rotation.y = Math.sin(b.treme * 40) * 0.12 * b.treme; }
      if (b.some > 0) { b.some -= dt * 1.5; b.g.scale.setScalar(Math.max(0.01, b.some)); if (b.some <= 0) { grupo.remove(b.g); if (b.bolhas) grupo.remove(b.bolhas); baus.delete(id); continue; } }
      if (b.bolhas) b.bolhas.scale.setScalar(1 + (menos ? 0 : Math.sin(tAnim * 4) * 0.15));
      if (!emCaca || b.estado !== 'fechado' || b.espera) continue;
      const dx = b.g.position.x - pos.x, dz = b.g.position.z - pos.z, d = Math.hypot(dx, dz);
      const modo = b.def.modo;
      let chegou = false;
      if (modo === 'mergulho') chegou = st.mergulhando && d < 2.3;
      else if (modo === 'barco') chegou = barco.ativo && Math.hypot(b.g.position.x - barco.pos.x, b.g.position.z - barco.pos.z) < 4.2;
      else {
        // é preciso PARAR no círculo (passar correndo por cima não responde)
        if (d < RAIO && vel < VEL_PARADO && !barco.ativo) b.parado += dt; else b.parado = 0;
        chegou = b.parado > PARADO;
      }
      if (chegou) { b.espera = true; b.parado = 0; console.info('[caca] chegou', id); avisar('fonema:caca-chegou', { id }); }
    }
    // moedinhas de enfeite
    for (let i = moedas.length - 1; i >= 0; i--) {
      const s = moedas[i];
      if (!menos) s.position.y += Math.sin(tAnim * 3 + i) * 0.003;
      if (Math.hypot(s.position.x - pos.x, s.position.z - pos.z) < 0.9) { grupo.remove(s); moedas.splice(i, 1); nMoedas++; moedasEl.textContent = `🪙 ${nMoedas}`; }
    }
    if (seta.visible) seta.children[0].position.y = menos ? 0 : Math.abs(Math.sin(tAnim * 3)) * 0.4;
  });

  const api = {
    /** passeio.html › aoEntrar: a porta do barquinho embarca aqui (devolve true = a página não navega). */
    aoEntrar(l) { if (l.id !== 'barco') return false; abrirBarco(); passeio.cancelarEntrada(); barco.embarcar(); return true; },
    embarcar: () => { abrirBarco(); passeio.cancelarEntrada(); return barco.embarcar(); },
    descer: (forcar) => barco.desembarcar(forcar),
    barco,
    get baus() { return [...baus.values()].map((b) => ({ id: b.def.id, x: b.g.position.x, y: b.g.position.y, z: b.g.position.z, modo: b.def.modo, estado: b.estado, letra: b.def.letra, figura: !!b.def.figura, lugar: b.def.lugar })); },
    get emCaca() { return emCaca; },
    get niveis() { return niveis; },
    get seta() { return seta.visible ? { ...setaAlvo } : null; },
    get moedas() { return nMoedas; },
    abrirMenu,
  };
  window.FONEMA_CACA = api;
  avisar('fonema:caca-pronta');
  return api;
}
