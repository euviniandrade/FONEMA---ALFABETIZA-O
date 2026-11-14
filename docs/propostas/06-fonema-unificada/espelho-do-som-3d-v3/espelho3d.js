/* FONEMA · Espelho do Som (v3) — componente 3D em tempo real: FRENTE e LADO (por dentro) na mesma tela.
 *
 *   import { montar } from './espelho3d.js';
 *   const e = await montar(div, { fonema: 'm', quem: 'sofia', compacto: true, sons: '../audio/sons/mapa.json' });
 *   e.fonema('l')   e.repetir()   e.lento(true)   e.falando(true|false, duracaoEmSegundos?)   e.ouvir()   e.destruir()
 *
 * Um canvas só (duas janelas de recorte), pixelRatio limitado, pausa quando sai da tela ou a aba fica oculta,
 * respeita "menos movimento" e cai para um desenho 2D quando não há WebGL (reserva2d.js).
 * Não tem dependência externa além do three.js local (vendor do Mundo 3D).
 */
import { criarCabeca, ZONAS3D, CORES } from './modelo.js';
import { criarAr, criarMarcador, caminhos } from './ar.js';
import { desenhar2D } from './reserva2d.js';

const P = globalThis.FonemasPT;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };

const APELIDOS = { ch: 'x', c: 'k', q: 'k', 'é': 'E', 'ê': 'e', 'ó': 'O', 'ô': 'o', 'ã': 'a~', 'õ': 'o~', an: 'a~', on: 'o~', 'r-forte': 'rr', 'c/k': 'k', 'ch/x': 'x', y: 'i', w: 'u' };
export function idFonema(f) {
  if (f == null) return null; f = String(f).trim();
  if (P.F[f]) return f;
  const m = f.toLowerCase();
  return P.F[APELIDOS[m]] ? APELIDOS[m] : P.F[m] ? m : null;
}

/* ---------- poses de apoio ---------- */
function poseRepouso() { const p = P.pose('h'); p.ab = 0.03; p.lg = 1.06; p.jaw = 1; return p; }
function poseAberta() { // boca meio aberta depois do estouro (um "a" curtinho de apoio)
  const p = P.pose('a'); p.jaw = 7; p.ab = 0.62; p.lg = 1.04; p.voz = 1; return p;
}
// R fraco: a ponta da língua bate atrás dos dentes de cima
const BATIDA = [[-0.8, 0.5], [-1.26, 0.6]];

/* ---------- linha do tempo de cada tipo de som: devolve o estado no instante t (s) do ciclo ----------
 * { w: 0 repouso → 1 pose do som, abre: 0..1 (depois do estouro), ar, voz, bate: 0..1 (tremor), aperta: 0..1, marca: 0..1, fase } */
const DUR = { descanso: 0.55, prepara: 0.6, faz: 1.8, solta: 0.5 };
function linhaDoTempo(f, t, segura) {
  const e = { w: 0, abre: 0, ar: 0, voz: 0, bate: 0, aperta: 0, marca: 0, fase: 'descanso', fim: false };
  const voz = f.voz ? 1 : 0;
  if (f.anim === 'silencio') { e.fase = 'faz'; e.marca = 0; e.fim = t > 3; return e; }
  if (f.anim === 'estouro') {
    // três vezes: fecha → aperta (o ar se junta) → solta de uma vez
    const fecha = 0.3, aperta = 0.36, solta = 0.09, aberto = 0.3, rep = fecha + aperta + solta + aberto;
    let x = t - DUR.descanso;
    if (x < 0) return e;
    const k = Math.floor(x / rep);
    if (k < 3) {
      x -= k * rep;
      e.marca = 1;
      if (x < fecha) { e.fase = 'prepara'; e.w = 1; e.abre = k === 0 ? 0 : 1 - sm(x / fecha); if (k === 0) e.w = sm(x / fecha); e.voz = 0; }
      else if (x < fecha + aperta) { e.fase = 'prepara'; e.w = 1; e.aperta = sm((x - fecha) / aperta); e.ar = 0.9; e.voz = voz * 0.45; }
      else if (x < fecha + aperta + solta) { e.fase = 'faz'; e.w = 1; e.abre = sm((x - fecha - aperta) / solta); e.ar = 1; e.voz = voz; e.aperta = 1 - e.abre; }
      else { e.fase = 'faz'; e.w = 1; e.abre = 1; const y = (x - fecha - aperta - solta) / aberto; e.ar = 1 - sm(y * 1.4); e.voz = voz * (1 - sm(y * 1.2)); }
      return e;
    }
    x -= 3 * rep; e.fase = 'solta';
    if (x < DUR.solta) { e.w = 1 - sm(x / DUR.solta); e.abre = 1; e.w = 1; e.solta = sm(x / DUR.solta); return e; }
    e.solta = 1; e.w = 1; e.abre = 1; e.fim = x > DUR.solta + 0.5;
    return e;
  }
  // sustentado e tremor: prepara → faz (segura) → solta
  const faz = segura || (f.anim === 'tremor' ? 1.5 : DUR.faz);
  let x = t - DUR.descanso;
  if (x < 0) return e;
  if (x < DUR.prepara) { e.fase = 'prepara'; e.w = sm(x / DUR.prepara); e.marca = e.w; return e; }
  x -= DUR.prepara;
  if (x < faz) {
    e.fase = 'faz'; e.w = 1; e.marca = 1;
    const sobe = sm(x / 0.14), desce = 1 - sm((x - faz + 0.16) / 0.16);
    e.ar = Math.min(sobe, desce); e.voz = voz * e.ar;
    if (f.anim === 'tremor') e.bate = 1;
    return e;
  }
  x -= faz; e.fase = 'solta';
  if (x < DUR.solta) { e.w = 1 - sm(x / DUR.solta); e.marca = e.w; return e; }
  e.fim = x > DUR.solta + 0.35;
  return e;
}

/* ---------- ícones (SVG, sem emoji) ---------- */
const IC = {
  voz: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="11" y="9" width="10" height="14" rx="5" fill="currentColor"/><path class="onda" d="M6.5 11c-2 3-2 7 0 10M25.5 11c2 3 2 7 0 10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path class="onda o2" d="M2.6 8c-2.6 5-2.6 11 0 16M29.4 8c2.6 5 2.6 11 0 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".55"/></svg>',
  nariz: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M14 4c0 7-6 11-6 16 0 3 2.4 5 5.2 5 1.6 0 2.4-.8 3.8-.8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path class="onda" d="M20 20h7M20 25h5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  ar: '<svg viewBox="0 0 32 32" aria-hidden="true"><path class="v1" d="M4 16h14a4 4 0 1 0-4-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path class="v2" d="M4 22h19a3.6 3.6 0 1 1-3.6 3.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path class="v3" d="M4 10h5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  repetir: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M25 16a9 9 0 1 1-3-6.7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><path d="M23.5 3.5v7h-7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lento: '<svg viewBox="0 0 36 32" aria-hidden="true"><path d="M7 21c0-7 5-12 11.5-12S30 14 30 21z" fill="currentColor"/><path d="M12.5 14.5l3 6M18.5 12.5v8M24.5 14.5l-3 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><circle cx="32" cy="17.5" r="3.4" fill="currentColor"/><path d="M9 21v4.5M26 21v4.5M4 22.5l3.5-1.5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>',
  som: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z" fill="currentColor"/><path d="M21.5 11.5a6.5 6.5 0 0 1 0 9M25 8a11.5 11.5 0 0 1 0 16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>'
};

async function carregaThree(caminho) {
  const cands = caminho ? [caminho] : ['./vendor/three.module.js', '../mundo3d/vendor/three.module.js', '../mundo-3d-v2/vendor/three.module.js'];
  for (const c of cands) { try { const m = await import(new URL(c, import.meta.url).href); if (m && m.WebGLRenderer) return m; } catch (e) { /* tenta o próximo */ } }
  return null;
}

function mapaAmbiente(THREE, renderer) {
  // estúdio macio feito em código: céu claro em degradê + duas "janelas" de luz para o brilho dos lábios e dos dentes
  const cena = new THREE.Scene();
  const g = new THREE.SphereGeometry(20, 32, 16), cor = new Float32Array(g.attributes.position.count * 3);
  const ca = new THREE.Color(1.5, 1.45, 1.4), cb = new THREE.Color(1.0, 0.86, 0.8), cc = new THREE.Color(0.5, 0.38, 0.4), t = new THREE.Color();
  for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 20; if (y > 0) t.copy(cb).lerp(ca, y); else t.copy(cb).lerp(cc, -y); cor.set([t.r, t.g, t.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  cena.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const painel = (x, y, z, w, h, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i * 0.96), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); cena.add(m); };
  painel(-7, 9, 9, 9, 6, 7); painel(9, 3, 7, 4, 7, 3.2); painel(0, -6, 8, 10, 3, 1.2); painel(0, 12, -4, 10, 6, 3);
  const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(cena, 0.05);
  pm.dispose(); cena.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return rt;
}

/* =====================================================================================================
 * montar(el, opções) → Promise<api>
 * ===================================================================================================== */
export async function montar(el, o = {}) {
  let f = idFonema(o.fonema) || 'a';
  let lento = !!o.lento, quem = o.quem === 'tales' ? 'tales' : 'sofia', rot = o.rotulos === undefined ? true : !!o.rotulos;
  const aoMudar = o.aoMudar || (() => {}), aoAudio = o.aoAudio || (() => {});
  const menosMov = o.menosMovimento !== undefined ? !!o.menosMovimento : (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  el.innerHTML = `<div class="eds3${o.compacto ? ' compacto' : ''}" data-fonema="${f}">
    <div class="eds3-palco">
      <section class="eds3-vista frente" aria-label="A boca de frente"><span class="eds3-nome">De frente</span></section>
      <section class="eds3-vista lado" aria-label="A boca por dentro, de lado"><span class="eds3-nome">Por dentro</span>
        <div class="eds3-sinais" role="group" aria-label="Como o som sai">
          <span class="eds3-sinal voz" role="img">${IC.voz}<i>voz</i></span>
          <span class="eds3-sinal nariz" role="img">${IC.nariz}<i>nariz</i></span>
          <span class="eds3-sinal ar" role="img">${IC.ar}<i>ar</i></span>
        </div>
        <div class="eds3-botoes">
          <button type="button" class="eds3-b ouvir" title="Ouvir o som" aria-label="Ouvir o som" hidden>${IC.som}</button>
          <button type="button" class="eds3-b repetir" title="Repetir" aria-label="Repetir">${IC.repetir}</button>
          <button type="button" class="eds3-b lento" title="Câmera lenta" aria-label="Câmera lenta" aria-pressed="false">${IC.lento}</button>
        </div>
      </section>
      <canvas class="eds3-tela" aria-hidden="true"></canvas>
    </div>
    <p class="eds3-frase" aria-live="polite"></p>
  </div>`;
  const raiz = el.firstElementChild, $ = (s) => raiz.querySelector(s);
  const palco = $('.eds3-palco'), tela = $('.eds3-tela'), vF = $('.eds3-vista.frente'), vL = $('.eds3-vista.lado');

  /* ----- áudio próprio (opcional): mapa fonema → arquivo. O app também pode tocar por conta própria e avisar com falando() ----- */
  let mapaSons = {}, baseSons = '', tocando = null;
  const prontoSons = (o.sons && typeof fetch === 'function' ? fetch(o.sons).then((r) => (r.ok ? r.json() : null)).catch(() => null) : Promise.resolve(null)).then((m) => {
    if (m && typeof m === 'object') { mapaSons = m.sons || m.fonemas || m; baseSons = new URL(m.base || '.', new URL(o.sons, location.href)).href; }
    pintaUI();
  });
  function arquivoSom(id) {
    const fo = P.F[id]; let v = mapaSons[id];
    if (v == null && fo) v = mapaSons[fo.letra] ?? mapaSons[fo.letra.toLowerCase()] ?? mapaSons[fo.letra.split('/')[0]] ?? mapaSons[fo.letra.split('/')[0].toLowerCase()];
    if (v == null) return null;
    if (Array.isArray(v)) v = v[0];
    const arq = typeof v === 'string' ? v : v.arquivo || v.url || v.src || v.mp3;
    if (!arq) return null;
    return { url: new URL(arq, baseSons || location.href).href, duracao: typeof v === 'object' ? v.duracao || v.duracaoS || (v.duracaoMs ? v.duracaoMs / 1000 : null) : null };
  }
  function pararSom() { if (tocando) { try { tocando.pause(); } catch (e) { /* nada */ } tocando = null; } }
  function ouvir() {
    pararSom();
    const a = arquivoSom(f);
    if (!a || typeof Audio === 'undefined') { repetir(); return Promise.resolve(false); }
    return new Promise((ok) => {
      const au = new Audio(a.url); tocando = au; au.playbackRate = lento ? 0.8 : 1;
      const comeca = () => falando(true, (a.duracao || au.duration || 0) / au.playbackRate);
      au.onplaying = comeca;
      au.onended = () => { falando(false); aoAudio({ f, tocou: true }); ok(true); };
      au.onerror = () => { repetir(); aoAudio({ f, tocou: false }); ok(false); };
      const pr = au.play(); if (pr && pr.catch) pr.catch(() => { repetir(); aoAudio({ f, tocou: false }); ok(false); });
    });
  }

  /* ----- estado da animação ----- */
  let aquece = false, tCiclo = 0, segura = 0, externo = false, rodando = true, congelado = null, umaVez = false;
  const repouso = poseRepouso(), aberta = poseAberta();
  let alvo = P.pose(f), poseAtual = repouso, estado = linhaDoTempo(P.F[f], 0, 0);
  // transição suave entre sons: guarda a pose mostrada e mistura por um instante
  let poseDe = null, tTroca = 1;
  function calculaPose(dtReal) {
    const fo = P.F[f], e = estado;
    let p = P.mistura(repouso, alvo, e.w);
    if (e.bate) {
      const b = 0.5 + 0.5 * Math.sin(tBate * 6.2832); // a ponta sobe e desce
      p.lin[0] = [mix(p.lin[0][0], BATIDA[0][0], b), mix(p.lin[0][1], BATIDA[0][1], b)];
      p.lin[1] = [mix(p.lin[1][0], BATIDA[1][0], b), mix(p.lin[1][1], BATIDA[1][1], b)];
    }
    if (e.abre) p = P.mistura(p, aberta, e.abre * (fo.modo === 'plosiva' ? 1 : 0));
    if (e.solta) p = P.mistura(p, repouso, e.solta);
    if (tTroca < 1 && poseDe) { tTroca = Math.min(1, tTroca + dtReal / 0.28); p = P.mistura(poseDe, p, sm(tTroca)); }
    return p;
  }
  let tBate = 0;

  function pintaUI() {
    const fo = P.F[f];
    raiz.dataset.fonema = f;
    $('.eds3-frase').textContent = rot ? fo.frase : '';
    $('.eds3-frase').hidden = !rot || !fo.frase;
    const sv = $('.eds3-sinal.voz'), sn = $('.eds3-sinal.nariz'), sa = $('.eds3-sinal.ar');
    sv.classList.toggle('ligado', !!fo.voz); sv.setAttribute('aria-label', fo.voz ? 'Voz ligada: a garganta vibra' : 'Voz desligada');
    const nas = fo.vel > 0.5;
    sn.classList.toggle('ligado', nas); sn.setAttribute('aria-label', nas ? 'O ar sai pelo nariz' : 'O ar não sai pelo nariz');
    sa.dataset.forca = fo.forca; sa.classList.toggle('ligado', fo.forca > 0);
    sa.setAttribute('aria-label', ['Sem ar', 'Ar fraquinho', 'Ar médio', 'Ar forte'][fo.forca]);
    [sv, sn, sa].forEach((s) => { s.title = s.getAttribute('aria-label'); });
    $('.eds3-b.lento').setAttribute('aria-pressed', lento);
    $('.eds3-b.ouvir').hidden = !arquivoSom(f);
  }

  function repetir() { tCiclo = DUR.descanso * 0.6; segura = 0; externo = false; umaVez = true; congelado = null; acorda(); }
  /** O app avisa quando a voz começa/termina de fazer o som: a boca recomeça junto e segura enquanto durar. */
  function falando(ativo, duracao) {
    const fo = P.F[f];
    if (ativo) {
      tCiclo = DUR.descanso - 0.02; congelado = null; umaVez = true;
      if (fo.anim === 'sustentado' || fo.anim === 'tremor') {
        if (duracao && isFinite(duracao) && duracao > 0.2) { segura = clamp(duracao - 0.35, 0.7, 6); externo = false; }
        else { segura = 60; externo = true; }
      } else { segura = 0; externo = false; }
      acorda();
    } else if (externo) { // solta agora
      externo = false;
      const jaFez = tCiclo - DUR.descanso - DUR.prepara;
      segura = Math.max(0.5, jaFez + 0.12);
    }
  }

  const api = {
    fonema(n, op = {}) {
      const id = idFonema(n); if (!id) return false;
      if (id !== f || op.reinicia) {
        poseDe = poseAtual; tTroca = op.instantaneo ? 1 : 0;
        f = id; alvo = P.pose(f); tCiclo = DUR.descanso * 0.5; segura = 0; externo = false; congelado = null; pararSom();
        estado = linhaDoTempo(P.F[f], tCiclo, 0);
      }
      pintaUI(); aoMudar({ f, quem }); acorda(); return true;
    },
    repetir, falando, ouvir,
    lento(v) { lento = !!v; pintaUI(); acorda(); },
    rotulos(v) { rot = !!v; pintaUI(); },
    quem(q) { if (q !== 'sofia' && q !== 'tales' || q === quem) return; quem = q; if (refaz) refaz(); aoMudar({ f, quem }); },
    temAudio: (n) => !!arquivoSom(idFonema(n) || f),
    estado: () => ({ f, quem, lento, rotulos: rot, fase: estado.fase, webgl: !!renderer }),
    /** Para capturas e testes: para a animação num ponto. fase = 'repouso' | 'prepara' | 'faz' | 'solta' (ou segundos do ciclo). */
    congelar(fase = 'faz') {
      const fo = P.F[f];
      const tt = typeof fase === 'number' ? fase : fase === 'repouso' ? 0 : fase === 'prepara' ? DUR.descanso + (fo.anim === 'estouro' ? 0.5 : DUR.prepara * 0.6)
        : fase === 'solta' ? 99   : DUR.descanso + (fo.anim === 'estouro' ? 0.3 + 0.3 : DUR.prepara + 0.75);
      congelado = tt; tTroca = 1; aquece = true; acorda();
    },
    prontoSons, destruir
  };

  $('.eds3-b.repetir').addEventListener('click', () => { if (arquivoSom(f)) ouvir(); else repetir(); });
  $('.eds3-b.ouvir').addEventListener('click', () => ouvir());
  $('.eds3-b.lento').addEventListener('click', () => api.lento(!lento));

  /* ----- 3D ----- */
  let renderer = null, refaz = null, quadro = 0, visivel = true, morto = false;
  const THREE = o.semWebGL ? null : await carregaThree(o.three);
  let limpa3D = () => {};
  try {
    if (!THREE) throw new Error('three.js não carregou');
    renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }

  let acorda = () => {};
  if (!renderer) {
    /* ----- reserva sem WebGL: desenho 2D das duas vistas, com a mesma pose ----- */
    raiz.classList.add('sem-webgl');
    const ctx = tela.getContext('2d');
    let ultimo = performance.now();
    const passo = (agora) => {
      if (morto) return;
      const dtReal = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000)); ultimo = agora;
      avanca(dtReal * (lento ? 0.45 : 1), dtReal);
      const r = palco.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      if (tela.width !== Math.round(r.width * dpr) || tela.height !== Math.round(r.height * dpr)) { tela.width = Math.round(r.width * dpr); tela.height = Math.round(r.height * dpr); }
      if (ctx) desenhar2D(ctx, P, poseAtual, estado, P.F[f], [vF, vL].map((v) => { const b = v.getBoundingClientRect(); return { x: (b.left - r.left) * dpr, y: (b.top - r.top) * dpr, w: b.width * dpr, h: b.height * dpr }; }), quem, agora / 1000);
      if (!menosMov || umaVez) quadro = requestAnimationFrame(passo); else quadro = 0;
    };
    acorda = () => { if (!quadro && !morto) { ultimo = performance.now(); quadro = requestAnimationFrame(passo); } };
    limpa3D = () => cancelAnimationFrame(quadro);
  } else {
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.autoClear = false;
    const sombras = !!o.sombras; // desligadas por padrão: mais leve no celular e a pele fica limpa
    renderer.shadowMap.enabled = sombras; renderer.shadowMap.type = THREE.PCFShadowMap;
    const amb = mapaAmbiente(THREE, renderer);

    const cenaF = new THREE.Scene(), cenaL = new THREE.Scene();
    cenaF.environment = amb.texture; cenaF.environmentIntensity = 0.4;
    cenaL.environment = amb.texture; cenaL.environmentIntensity = 0.7;
    // luzes — frente: luz principal quente de cima (com sombra macia dentro da boca), preenchimento frio e contraluz
    cenaF.add(new THREE.HemisphereLight(0xfff6ee, 0xd89a86, 0.5));
    const chave = new THREE.DirectionalLight(0xfff0de, 2.7); chave.position.set(-7, 8, 9); cenaF.add(chave); cenaF.add(chave.target);
    if (sombras) { chave.castShadow = true; chave.shadow.mapSize.set(1024, 1024); const c = chave.shadow.camera; c.left = -5; c.right = 5; c.top = 5; c.bottom = -5; c.near = 2; c.far = 30; chave.shadow.bias = -0.0015; chave.shadow.normalBias = 0.03; chave.shadow.radius = 5; }
    const frio = new THREE.DirectionalLight(0xcfe6ff, 0.65); frio.position.set(7, 1, 6); cenaF.add(frio);
    const contra = new THREE.DirectionalLight(0xffd7c4, 0.8); contra.position.set(-6, 4, -6); cenaF.add(contra);
    cenaL.add(new THREE.HemisphereLight(0xffffff, 0xffd9cc, 1.15));
    const chaveL = new THREE.DirectionalLight(0xffffff, 1.9); chaveL.position.set(9, 8, 4); cenaL.add(chaveL);
    const frioL = new THREE.DirectionalLight(0xd6ecff, 0.7); frioL.position.set(6, -3, -6); cenaL.add(frioL);

    const camF = new THREE.PerspectiveCamera(24, 1, 1, 200), camL = new THREE.PerspectiveCamera(24, 1, 1, 200);
    const giroF = new THREE.Group(), giroL = new THREE.Group(); cenaF.add(giroF); cenaL.add(giroL);
    let cabF, cabL, arF, arL, marF, marL;
    const monta = () => {
      cabF = criarCabeca(THREE, P, { modo: 'frente', quem }); cabL = criarCabeca(THREE, P, { modo: 'lado', quem });
      giroF.add(cabF.grupo); giroL.add(cabL.grupo);
      arL = criarAr(THREE, { n: 120, tamanho: 0.3, ordem: 4 });
      giroL.add(arL.pontos);
      marF = criarMarcador(THREE); marL = criarMarcador(THREE); giroF.add(marF.sprite); giroL.add(marL.sprite);
    };
    const desmonta = () => { for (const x of [cabF, cabL, arL, marF, marL]) x.liberar(); giroF.clear(); giroL.clear(); };
    monta();
    refaz = () => { desmonta(); monta(); acorda(); };

    // enquadramento: cada vista mostra uma caixa do modelo inteira, seja a janela larga ou alta
    const CX_F = { c: [0, 0.1, 0], mw: 3.1, mh: 3.1 }, CX_L = { c: [0, -0.45, -1.7], mw: 4.9, mh: 4.9 };
    function enquadra(cam, cx, aspecto, deLado) {
      const tg = Math.tan((cam.fov * Math.PI) / 360), dist = Math.max(cx.mh, cx.mw / aspecto) / tg;
      cam.aspect = aspecto;
      if (deLado) cam.position.set(cx.c[0] + dist, cx.c[1], cx.c[2]); else cam.position.set(cx.c[0], cx.c[1], cx.c[2] + dist + 2);
      cam.lookAt(cx.c[0], cx.c[1], cx.c[2]); cam.near = Math.max(1, dist - 16); cam.far = dist + 30; cam.updateProjectionMatrix();
      return dist;
    }

    // arrastar gira um pouco as duas vistas (com limite) e elas voltam sozinhas
    let gy = 0, gx = 0, ay = 0, ax = 0, arrasta = null;
    const baixa = (ev) => { if (ev.target.closest('button')) return; arrasta = { x: ev.clientX, y: ev.clientY, gy, gx, id: ev.pointerId }; palco.classList.add('girando'); try { palco.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ } acorda(); };
    const move = (ev) => { if (!arrasta) return; gy = clamp(arrasta.gy + (ev.clientX - arrasta.x) * 0.006, -0.5, 0.5); gx = clamp(arrasta.gx + (ev.clientY - arrasta.y) * 0.004, -0.22, 0.22); };
    const sobe = () => { arrasta = null; palco.classList.remove('girando'); };
    palco.addEventListener('pointerdown', baixa); palco.addEventListener('pointermove', move); palco.addEventListener('pointerup', sobe); palco.addEventListener('pointercancel', sobe);

    let larg = 0, alt = 0, dpr = 1;
    function ajusta() {
      const r = palco.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
      let d = Math.min(o.pixelRatio || 2, window.devicePixelRatio || 1);
      if (w * h * d * d > 2.4e6) d = Math.max(1, Math.sqrt(2.4e6 / (w * h)));
      if (w !== larg || h !== alt || d !== dpr) { larg = w; alt = h; dpr = d; renderer.setPixelRatio(d); renderer.setSize(w, h, false); }
      return r;
    }

    let ultimo = performance.now(), tempo = 0;
    const vz = new THREE.Vector3();
    function desenha(agora) {
      quadro = 0; if (morto) return;
      const dtReal = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000)); ultimo = agora;
      const dt = dtReal * (lento ? 0.42 : 1);
      tempo += dtReal;
      avanca(dt, dtReal);
      const fo = P.F[f], e = estado, p = poseAtual;
      // volta do giro
      if (!arrasta) { gy += (0 - gy) * Math.min(1, dtReal * 3.2); gx += (0 - gx) * Math.min(1, dtReal * 3.2); }
      ay += (gy - ay) * Math.min(1, dtReal * 12); ax += (gx - ax) * Math.min(1, dtReal * 12);
      const balanco = menosMov ? 0 : Math.sin(tempo * 0.7) * 0.025;
      giroF.rotation.set(ax + 0.02, ay + balanco, 0);
      giroL.position.set(0, 0, -2.0); cabL.grupo.position.set(0, 0, 2.0); arL.pontos.position.set(0, 0, 2.0);
      giroL.rotation.set(0, 0.2 + ay * 0.9 + balanco, -ax * 0.6);

      const extra = { voz: e.voz, tempo, bochecha: (fo.zona === 'labios' ? 1 : 0.25) * e.aperta, raspa: f === 'rr' ? e.ar : 0 };
      cabF.atualizar(p, extra); cabL.atualizar(p, extra);
      // ar
      const cam = caminhos(P, p, cabL.topo(), cabL.nTopo);
      const nasal = p.vel > 0.5 ? (cam.bloqueio !== null ? 1 : 0.5) : 0;
      const arAgora = fo.ar === 'nenhum' ? 0 : e.ar;
      const dtAr = menosMov && !umaVez ? 0 : dt;
      const oAr = { ar: arAgora, forca: fo.forca, nasal, tempo };
      if (aquece) { aquece = false; arL.aquecer(cam, oAr); }
      arL.atualizar(dtAr, cam, oAr);
      // marcador "o som nasce aqui"
      const zona = fo.modo === 'vogal' || fo.modo === 'mudo' ? null : ZONAS3D[fo.zona];
      const mz = zona ? [zona[0], zona[1], zona[2]] : null;
      marL.atualizar(dtReal, mz && [0, mz[1], mz[2] + 2.0], zona ? e.marca : 0, tempo, 1.25);
      marF.atualizar(dtReal, mz && [mz[0], mz[2] < -1 ? 0 : Math.min(mz[1], 0.3), Math.max(mz[2], 0.4)], zona ? e.marca : 0, tempo, 0.95);

      // desenha as duas janelas
      const r = ajusta();
      renderer.setScissorTest(false); renderer.clear(true, true, true); renderer.setScissorTest(true);
      for (const [v, cena, camx, cx, deLado, ar] of [[vF, cenaF, camF, CX_F, false, null], [vL, cenaL, camL, CX_L, true, arL]]) {
        const b = v.getBoundingClientRect();
        const x = b.left - r.left, y = r.bottom - b.bottom, w = b.width, h = b.height;
        if (w < 4 || h < 4) continue;
        renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h);
        enquadra(camx, cx, w / h, deLado);
        if (ar) ar.escala(h * dpr / (2 * Math.tan((camx.fov * Math.PI) / 360)));
        renderer.clearDepth();
        renderer.render(cena, camx);
      }
      raiz.dataset.fase = e.fase;
      raiz.classList.toggle('soando', e.ar > 0.3 || e.voz > 0.3);
      // continua? (com "menos movimento" a boca fica parada na pose do som, e só anima quando pedem para repetir)
      const parado = (menosMov && !umaVez && !arrasta && Math.abs(gy) < 0.002 && tTroca >= 1) || (congelado !== null && !arrasta && Math.abs(gy) < 0.002 && quadrosCong++ > 3);
      if (visivel && !parado) quadro = requestAnimationFrame(desenha);
    }
    let quadrosCong = 0;
    acorda = () => { quadrosCong = 0; if (!quadro && !morto && visivel) { ultimo = performance.now(); quadro = requestAnimationFrame(desenha); } };

    // pausa fora da tela / aba oculta
    const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => { visivel = es[0].isIntersecting && !document.hidden; if (visivel) acorda(); }) : null;
    if (io) io.observe(raiz);
    const aoVis = () => { visivel = !document.hidden; if (visivel) acorda(); };
    document.addEventListener('visibilitychange', aoVis);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => acorda()) : null;
    if (ro) ro.observe(palco);
    tela.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); });
    tela.addEventListener('webglcontextrestored', () => acorda());
    limpa3D = () => {
      cancelAnimationFrame(quadro); if (io) io.disconnect(); if (ro) ro.disconnect(); document.removeEventListener('visibilitychange', aoVis);
      desmonta(); amb.dispose(); renderer.dispose();
    };
    api.three = { THREE, renderer, cenaF, cenaL, camF, camL, pecas: () => ({ cabF, cabL, arL }) };
  }

  /* avança a linha do tempo e calcula a pose do quadro */
  function avanca(dt, dtReal) {
    const fo = P.F[f];
    if (congelado !== null) tCiclo = congelado;
    else if (menosMov && !umaVez) tCiclo = DUR.descanso + (fo.anim === 'estouro' ? 0.5 : DUR.prepara + 0.75); // parado na pose do som
    else tCiclo += dt;
    tBate += dt * 5.5;
    estado = linhaDoTempo(fo, tCiclo, segura);
    if (congelado === null && estado.fim) { tCiclo = 0; segura = 0; externo = false; umaVez = false; estado = linhaDoTempo(fo, 0, 0); }
    poseAtual = calculaPose(dtReal);
  }

  function destruir() { morto = true; pararSom(); limpa3D(); el.innerHTML = ''; }

  pintaUI();
  acorda();
  return api;
}

export { CORES };
