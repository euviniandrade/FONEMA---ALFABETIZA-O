// FONEMA · Mundo 3D v2 — GUIA DO PRÓXIMO PASSO, MINIMAPA, TRILHA DE MOEDAS E LEMBRETE DA MISSÃO (fila do dono nº 29, pontos 2–5).
//
// Pedido do dono (18/11): "muito amador ainda, profissionalizar": mapa na tela, trilha de moedas até o próximo objetivo, "próximo
// passo" sempre visível (seta 3D + faixa no topo, falada só quando muda) e, no passeio livre, um lembrete "Vamos continuar a missão?".
//  - `guia.definir(obj)`: { chave, x, z, texto, icone, fala?, trilha?, marcador?, parar? } ou null. A chave muda = objetivo novo
//    (faixa e fala só nessa hora). `trilha`: moedas no chão pelo caminho andável (busca na grade de colisão); `marcador`: seta e
//    coluna de luz sobre o destino; `parar`: a trilha termina a N m do destino (caça: leva à ÁREA dos baús, nunca ao baú certo, regra 3).
//  - `guia.marcas = [{ x, z, cor }]`: o que aparece no minimapa além das portas (baús da caça, todos iguais).
//  - Fora da caça o objetivo é a MISSÃO DE HOJE (porta da Escola), que o app manda (fonema:guia {missao}).
//  - `guia.objetivoExtra(obj|null)` (fila nº 30): um objetivo que passa na frente da missão só nesta visita (ex.: "use a chave no
//    píer" logo depois de ganhar a chave do barquinho); quem pôs tira (a caça tira ao embarcar). Depois volta a ser a missão.
//  - Lembrete: depois de ~3,5 min no passeio livre, a Sofia/Tales pergunta "Vamos continuar a missão?"; "Vamos!" entra na Escola,
//    "Mais um pouquinho" adia 2 min. Na caça, no barco ou com cartão aberto o relógio não anda.
// Tudo roda em `passeio.noQuadro` (também no `simular()` dos testes). Moedinhas da trilha são enfeite (não ficam guardadas).
import * as THREE from 'three';
import { canvasTex } from './kit.js';
import { foraDoLimite } from './colisao.js';

const LEMBRETE_S = 210, ADIA_S = 120;

export function criarGuia({ mundo, passeio, avisar }) {
  const { scene } = mundo;
  const colisao = passeio.colisao;
  const N = colisao.NIVEL_AGUA;
  const menos = document.body.classList.contains('menos') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grupo = new THREE.Group(); grupo.name = 'guia-passos'; scene.add(grupo);
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };

  // ---------------------------------------------------------------- DOM ----------------------------------------------------------------
  const css = document.createElement('style');
  css.textContent = `
  #guiaFaixa { left: 50%; transform: translateX(-50%); top: calc(var(--topo) + 66px); display: none; align-items: center; gap: 10px; max-width: min(620px, calc(100vw - 300px));
    background: rgba(46,67,116,.92); color: #fff; border-radius: 26px; padding: 8px 18px 8px 10px; font: 700 19px Andika, sans-serif; box-shadow: var(--sombra); pointer-events: none; }
  #guiaFaixa.on { display: flex; }
  #guiaFaixa b { font-size: 28px; background: #FFF8EC; border-radius: 50%; width: 42px; height: 42px; display: grid; place-items: center; flex: none; }
  #guiaFaixa.nova { animation: guiaNova .6s ease-out; }
  @keyframes guiaNova { 0% { transform: translateX(-50%) scale(.85); opacity: 0 } 100% { transform: translateX(-50%) scale(1); opacity: 1 } }
  #miniMapa { left: max(14px, env(safe-area-inset-left)); top: calc(var(--topo) + 12px); width: 132px; height: 132px; border-radius: 50%; border: 5px solid #FFF8EC; box-shadow: var(--sombra);
    overflow: hidden; cursor: pointer; padding: 0; background: #8CC95E; }
  #miniMapa canvas { width: 100%; height: 100%; display: block; }
  body.caca #cacaBarra { top: calc(var(--topo) + 158px); }
  #mapaGrande { position: fixed; inset: 0; z-index: 11; background: rgba(20,30,50,.55); display: none; place-items: center; }
  #mapaGrande.on { display: grid; }
  #mapaGrande .caixa { background: #FFF8EC; border-radius: 30px; padding: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.4); text-align: center; }
  #mapaGrande canvas { width: min(78vh, 86vw); height: min(78vh, 86vw); border-radius: 22px; display: block; }
  #mapaGrande .bt { margin-top: 10px; }
  #lembrete { position: fixed; z-index: 10; left: 50%; top: calc(var(--topo) + 150px); transform: translateX(-50%); width: min(540px, calc(100vw - 20px));
    background: var(--papel); border-radius: 32px; box-shadow: 0 20px 60px rgba(40,30,60,.4); padding: 18px 22px; text-align: center; display: none; }
  #lembrete.on { display: block; }
  #lembrete h3 { margin: 4px 0 12px; font-size: 26px; }
  #lembrete .acoes { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  #lembrete .bt.grande { min-height: 84px; font-size: 26px; padding: 12px 30px; }
  @media (max-width: 700px) {
    #miniMapa { width: 104px; height: 104px; border-width: 4px; }
    body.caca #cacaBarra { top: calc(var(--topo) + 126px); }
    #guiaFaixa { top: calc(var(--topo) + 62px); max-width: calc(100vw - 210px); font-size: 15px; padding: 6px 12px 6px 6px; left: calc(50% - 6px); }
    #guiaFaixa b { width: 34px; height: 34px; font-size: 22px; }
    /* celular: no meio da tela, entre a coluna de botões de cima e os botões de baixo (Entrar, Pular/Mergulhar, Tchau, joystick) */
    #lembrete { top: calc(var(--topo) + 318px); width: calc(100vw - 24px); padding: 12px 14px; border-radius: 26px; }
    #lembrete .ic { font-size: 34px !important; }
    #lembrete h3 { font-size: 21px; margin: 2px 0 8px; }
    #lembrete .acoes { flex-wrap: nowrap; gap: 10px; }
    #lembrete .bt.grande { min-height: 64px; font-size: 20px; padding: 8px 16px; }
    #lembrete .bt { min-height: 64px; font-size: 16px; padding: 8px 12px; }
  }`;
  document.head.appendChild(css);
  const faixa = el('div', { id: 'guiaFaixa', className: 'hud', role: 'status' }); faixa.dataset.testid = 'guia-faixa';
  const mini = el('button', { id: 'miniMapa', className: 'hud', title: 'Mapa da vila', ariaLabel: 'Abrir o mapa da vila' }); mini.dataset.testid = 'minimapa';
  const cvMini = el('canvas', { width: 240, height: 240 }); mini.append(cvMini);
  const grande = el('div', { id: 'mapaGrande', role: 'dialog' }); grande.dataset.testid = 'mapa-grande';
  const cvGrande = el('canvas', { width: 720, height: 720 });
  const fechar = el('button', { className: 'bt sol', onclick: () => grande.classList.remove('on') }, '<span class="ic">👍</span>Voltar ao passeio');
  fechar.dataset.testid = 'mapa-fechar';
  const caixaG = el('div', { className: 'caixa' }); caixaG.append(cvGrande, fechar); grande.append(caixaG);
  grande.addEventListener('click', (e) => { if (e.target === grande) grande.classList.remove('on'); });
  mini.onclick = () => { desenharGrande(); grande.classList.add('on'); };
  const lembrete = el('div', { id: 'lembrete', role: 'dialog' }); lembrete.dataset.testid = 'lembrete';
  document.body.append(faixa, mini, grande, lembrete);
  for (const b of [mini, fechar]) b.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });

  // ---------------------------------------------------------------- mapa (base desenhada uma vez) ----------------------------------------------------------------
  const EXT = 62; // metros mostrados a partir do centro da vila no mapa grande
  const CX = 4, CZ = 6; // centro do mapa grande
  const base = document.createElement('canvas'); base.width = base.height = 360;
  {
    const g = base.getContext('2d'), im = g.createImageData(360, 360);
    const { distRio, RIO_W } = mundo.vila;
    for (let j = 0; j < 360; j++) for (let i = 0; i < 360; i++) {
      const x = CX - EXT + (i / 360) * EXT * 2, z = CZ - EXT + (j / 360) * EXT * 2;
      let c;
      if (foraDoLimite(x, z)) c = [74, 128, 70];
      else if (x > 25 && distRio(x, z) < RIO_W / 2 + 0.6) c = [92, 170, 214];
      else if (colisao.bloqueado(x, z)) c = [214, 186, 146];
      else c = [150, 205, 112];
      im.data.set([...c, 255], (j * 360 + i) * 4);
    }
    g.putImageData(im, 0, 0);
    // rio fora do limite também (a ponte e a outra margem)
    g.strokeStyle = 'rgba(92,170,214,1)'; g.lineWidth = (RIO_W * 0.85 / (EXT * 2)) * 360; g.lineCap = 'round';
    g.globalCompositeOperation = 'destination-over';
    g.beginPath(); mundo.vila.RIO_PTS.forEach((p, k) => { const u = ((p.x - CX + EXT) / (EXT * 2)) * 360, v = ((p.y - CZ + EXT) / (EXT * 2)) * 360; k ? g.lineTo(u, v) : g.moveTo(u, v); }); g.stroke();
    g.globalCompositeOperation = 'source-over';
  }
  const paraMapa = (x, z, S) => [((x - CX + EXT) / (EXT * 2)) * S, ((z - CZ + EXT) / (EXT * 2)) * S];
  function marcadores(g, S, px, giroBoneco, rot) {
    const ic = (txt, x, z, tam) => { const [u, v] = paraMapa(x, z, S); g.save(); g.translate(u, v); g.rotate(-rot); g.font = `${tam}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 0); g.restore(); };
    for (const l of passeio.LUGARES) ic(l.icone, l.pos[0], l.pos[1], S * 0.045);
    for (const m of api.marcas) { const [u, v] = paraMapa(m.x, m.z, S); g.beginPath(); g.arc(u, v, S * 0.022, 0, 7); g.fillStyle = m.cor || '#F2B33D'; g.fill(); g.lineWidth = S * 0.007; g.strokeStyle = '#7A4A2A'; g.stroke(); }
    if (obj && (obj.marcador || obj.noMapa)) ic('⭐', obj.x, obj.z, S * 0.06);
    // a criança: setinha na direção em que o boneco olha
    const [u, v] = paraMapa(px.x, px.z, S);
    g.save(); g.translate(u, v); g.rotate(-giroBoneco + Math.PI); g.beginPath(); const r = S * 0.03; g.moveTo(0, -r * 1.3); g.lineTo(r, r); g.lineTo(0, r * 0.4); g.lineTo(-r, r); g.closePath();
    g.fillStyle = '#E8513A'; g.fill(); g.lineWidth = S * 0.008; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  }
  function desenharMini(px) {
    const g = cvMini.getContext('2d'), S = 240, Z = 3.0; // zoom: o minimapa mostra ~40 m em volta
    const rot = passeio.camera.giro; // gira o mapa para a frente da câmera ficar para cima
    g.save(); g.clearRect(0, 0, S, S); g.fillStyle = '#4A8046'; g.fillRect(0, 0, S, S);
    g.translate(S / 2, S / 2); g.rotate(rot); g.scale(Z, Z);
    const [u, v] = paraMapa(px.x, px.z, S); g.translate(-u, -v);
    g.drawImage(base, 0, 0, S, S);
    marcadores(g, S, px, passeio.posicao.giro, rot);
    g.restore();
  }
  function desenharGrande() {
    const g = cvGrande.getContext('2d'), S = 720;
    g.clearRect(0, 0, S, S); g.drawImage(base, 0, 0, S, S);
    marcadores(g, S, passeio.posicao, passeio.posicao.giro, 0);
  }

  // ---------------------------------------------------------------- caminho (busca na grade andável) ----------------------------------------------------------------
  const PASSO = 1.0;
  const andavel = new Map();
  const livre = (i, j) => { const k = i * 1000 + j; let v = andavel.get(k); if (v === undefined) { const m = colisao.livre(i * PASSO, j * PASSO, 0.3); v = !m; andavel.set(k, v); } return v; };
  function caminho(ax, az, bx, bz) {
    const si = Math.round(ax / PASSO), sj = Math.round(az / PASSO), ti = Math.round(bx / PASSO), tj = Math.round(bz / PASSO);
    const key = (i, j) => `${i},${j}`;
    const veio = new Map([[key(si, sj), null]]);
    let fila = [[si, sj]], achou = null, n = 0, melhor = [si, sj], md = Infinity;
    while (fila.length && n < 9000 && !achou) {
      const prox = [];
      for (const [i, j] of fila) {
        n++;
        const d = Math.hypot(i - ti, j - tj); if (d < md) { md = d; melhor = [i, j]; }
        if (d <= 1.5) { achou = [i, j]; break; }
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
          const a = i + di, b = j + dj, k = key(a, b);
          if (veio.has(k) || !livre(a, b)) continue;
          veio.set(k, [i, j]); prox.push([a, b]);
        }
      }
      fila = prox;
    }
    let c = achou || melhor; const out = [];
    while (c) { out.push([c[0] * PASSO, c[1] * PASSO]); c = veio.get(key(c[0], c[1])); }
    return out.reverse();
  }

  // ---------------------------------------------------------------- moedas da trilha e marcador ----------------------------------------------------------------
  const moedaTex = canvasTex(64, 64, (g) => { g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fillStyle = '#FFC93C'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#D9921A'; g.stroke(); g.fillStyle = '#FFF4C8'; g.font = '700 30px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', 32, 34); });
  const moedas = [];
  let nMoedas = 0;
  function limparTrilha() { for (const s of moedas) grupo.remove(s); moedas.length = 0; }
  function montarTrilha(pos) {
    limparTrilha();
    if (!obj?.trilha) return;
    const parar = obj.parar ?? 1.2;
    const naAgua = passeio.veiculo || colisao.agua(obj.x, obj.z) > 0.5 || foraDoLimite(obj.x, obj.z);
    let pts;
    if (naAgua) { pts = []; const d = Math.hypot(obj.x - pos.x, obj.z - pos.z); for (let s = 0; s <= d; s += 1) pts.push([pos.x + ((obj.x - pos.x) * s) / d, pos.z + ((obj.z - pos.z) * s) / d]); }
    else pts = caminho(pos.x, pos.z, obj.x, obj.z);
    let acum = 0;
    for (let k = 1; k < pts.length && moedas.length < 45; k++) {
      const [x, z] = pts[k], [x0, z0] = pts[k - 1];
      acum += Math.hypot(x - x0, z - z0);
      if (acum < 1.6) continue; acum = 0;
      if (Math.hypot(x - pos.x, z - pos.z) < 1.8 || Math.hypot(x - obj.x, z - obj.z) < parar) continue;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: moedaTex, transparent: true, fog: false, depthWrite: false }));
      s.scale.setScalar(0.42); s.position.set(x, Math.max(colisao.altura(x, z), N) + 0.45, z); s.userData.f = moedas.length * 0.4;
      grupo.add(s); moedas.push(s);
    }
    trilhaDe = { x: pos.x, z: pos.z };
  }
  const marcador = new THREE.Group();
  { const m = new THREE.MeshStandardMaterial({ color: '#FFB020', emissive: '#FF8A00', emissiveIntensity: 0.9 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 20), m); cone.rotation.x = Math.PI; marcador.add(cone);
    const luz = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 18, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE8A0', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    luz.position.y = 9; marcador.add(luz); marcador.visible = false; grupo.add(marcador); }

  // ---------------------------------------------------------------- objetivo ----------------------------------------------------------------
  let obj = null, chave = null, trilhaDe = null, refazer = 0;
  let missao = null; // objetivo do passeio livre (vem do app)
  let extra = null; // fila nº 30: objetivo que passa na frente da missão nesta visita (chave → píer)
  let livreT = 0, lembreteAberto = false, falouLivre = false;
  function mostrarFaixa() {
    if (!obj?.texto) { faixa.classList.remove('on'); return; }
    faixa.innerHTML = ''; faixa.append(el('b', { textContent: obj.icone || '➡️' }), el('span', { textContent: obj.texto }));
    faixa.classList.remove('nova'); void faixa.offsetWidth; faixa.classList.add('on', 'nova');
  }
  function definir(o) {
    const nova = (o?.chave ?? null) !== chave;
    obj = o; chave = o?.chave ?? null;
    if (o) { marcador.visible = !!o.marcador; marcador.position.set(o.x, Math.max(colisao.altura(o.x, o.z), N) + 3.2, o.z); } else marcador.visible = false;
    if (nova) { mostrarFaixa(); refazer = 0; trilhaDe = null; limparTrilha(); if (o?.fala) avisar('fonema:falar', { falas: [o.fala] }); }
  }
  /** Volta ao objetivo do passeio livre (a missão de hoje). */
  function objetivoLivre() {
    if (extra) { definir(extra); return; }
    if (!missao) { definir(null); return; }
    const l = passeio.LUGARES.find((x) => x.id === 'escola');
    definir({ chave: 'missao', x: l.pos[0], z: l.pos[1], texto: missao.texto, icone: '🏫', trilha: true, marcador: true, fala: falouLivre ? undefined : missao.fala });
    falouLivre = true;
  }

  // ---------------------------------------------------------------- lembrete "Vamos continuar a missão?" ----------------------------------------------------------------
  const bt = (ic, rot, fn, cls, id) => { const b = el('button', { className: `bt ${cls}`, onclick: fn }, `<span class="ic">${ic}</span>${rot}`); b.dataset.testid = id; return b; };
  function abrirLembrete() {
    lembreteAberto = true;
    lembrete.innerHTML = '';
    lembrete.append(el('div', { className: 'ic', textContent: '🏫', style: 'font-size:50px' }), el('h3', { textContent: 'Vamos continuar a missão?' }));
    const ac = el('div', { className: 'acoes' });
    ac.append(
      bt('▶️', 'Vamos!', () => { fecharLembrete(); avisar('fonema:entrar', { id: 'escola' }); document.querySelector('#veu')?.classList.add('on'); }, 'sol grande', 'lembrete-vamos'),
      bt('⏳', 'Mais um pouquinho', () => { fecharLembrete(); livreT = LEMBRETE_S - ADIA_S; }, '', 'lembrete-depois'));
    lembrete.append(ac); lembrete.classList.add('on');
    if (missao?.lembrete) avisar('fonema:falar', { falas: [missao.lembrete] });
  }
  function fecharLembrete() { lembreteAberto = false; lembrete.classList.remove('on'); livreT = 0; }

  // ---------------------------------------------------------------- a cada passo ----------------------------------------------------------------
  let t = 0, quadros = 0;
  passeio.noQuadro((dt, _t, pos) => {
    t += dt; quadros++;
    // relógio do passeio livre (fora da caça, fora do barco, sem cartão aberto)
    const emCaca = document.body.classList.contains('caca');
    if (!emCaca && !passeio.veiculo && !lembreteAberto && missao && !document.querySelector('#cartao.aberto')) { livreT += dt; if (livreT >= LEMBRETE_S) abrirLembrete(); }
    if (obj) {
      const d = Math.hypot(obj.x - pos.x, obj.z - pos.z);
      // trilha: refeita quando o objetivo muda ou a criança se afasta do começo dela
      refazer -= dt;
      if (obj.trilha && d > (obj.parar ?? 1.2) + 2.5 && (!trilhaDe || (refazer <= 0 && Math.hypot(trilhaDe.x - pos.x, trilhaDe.z - pos.z) > 5))) { montarTrilha(pos); refazer = 2; }
      if (d < (obj.parar ?? 1.2) + 2 && moedas.length) limparTrilha();
      marcador.children[0].position.y = menos ? 0 : Math.abs(Math.sin(t * 3)) * 0.5;
      marcador.visible = !!obj.marcador && !passeio.posicao.cameraSubmersa && d > 2;
    }
    for (let i = moedas.length - 1; i >= 0; i--) {
      const s = moedas[i];
      if (!menos) s.material.rotation = Math.sin(t * 3 + s.userData.f) * 0.5;
      if (Math.hypot(s.position.x - pos.x, s.position.z - pos.z) < 0.9) { grupo.remove(s); moedas.splice(i, 1); nMoedas++; api.aoMoeda?.(nMoedas); }
    }
    if (quadros % 3 === 0) desenharMini(pos);
  });

  window.addEventListener('message', (ev) => {
    const m = ev.data; if (!m || m.tipo !== 'fonema:guia') return;
    const d = m.detalhe || {};
    missao = d.missao || null;
    if (!document.body.classList.contains('caca')) objetivoLivre();
  });

  const api = {
    definir, objetivoLivre, marcas: [],
    /** Fila nº 30: objetivo que passa na frente da missão (null tira). Fora da caça já aparece; na caça, quando ela acabar. */
    objetivoExtra(o) { extra = o || null; if (!document.body.classList.contains('caca')) objetivoLivre(); },
    get extra() { return extra ? { ...extra } : null; },
    get objetivo() { return obj ? { ...obj } : null; },
    get moedasTrilha() { return moedas.map((s) => ({ x: s.position.x, z: s.position.z })); },
    get moedas() { return nMoedas; },
    get livreS() { return livreT; },
    get lembreteAberto() { return lembreteAberto; },
    aoMoeda: null,
  };
  window.FONEMA_GUIA = api;
  return api;
}
