// FONEMA · Mundo 3D v2 — trilha e sons do passeio, TODOS feitos aqui no código (Web Audio): nenhum arquivo de áudio,
// nenhuma música de terceiros. Composição original do projeto (melodia e acordes abaixo, em notas MIDI).
//  - Trilha: calminha e alegre (Dó maior, 88 batidas/min, 16 compassos que se repetem com pequenas variações):
//    kalimba na melodia (às vezes uma flautinha), colchão de acordes, baixo macio e um chocalho bem baixinho.
//  - Ambiente por lugar: passarinhos (praça e árvores), água (perto do rio), vento (no alto/de longe),
//    e embaixo d'água tudo fica abafado, com um ronco grave e bolhinhas.
//  - Volume baixo; botão de mudo (🔊/🔇, tecla M) que fica salvo; "menos movimento" = trilha mais baixa, sem chocalho,
//    menos passarinhos. A trilha abaixa sozinha quando há um cartão aberto (as falas do app tocam por cima).
// O áudio só começa no primeiro toque/tecla (regra dos navegadores).

const BPM = 88, BATIDA = 60 / BPM, COLCHEIA = BATIDA / 2, COMPASSO = BATIDA * 4;
const _ = null;
// acordes: [baixo, notas do colchão]
const AC = {
  C: [48, [60, 64, 67]], Am: [45, [57, 60, 64]], F: [41, [57, 60, 65]], G: [43, [55, 59, 62]], Dm: [38, [57, 62, 65]], Em: [40, [55, 59, 64]],
};
const FORMA = ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
// melodia em colcheias (8 por compasso); _ = pausa
const MELODIA = [
  [76, _, 79, _, 81, 79, 76, _], [72, _, 76, _, 74, 72, 69, _], [69, _, 72, _, 77, _, 76, 72], [74, _, _, _, 71, _, 67, _],
  [76, _, 79, _, 84, _, 79, 76], [81, _, 79, _, 76, _, 72, _], [74, _, 77, _, 81, 79, 77, 74], [79, _, _, _, _, _, _, _],
  [72, _, 69, _, 72, _, 77, _], [74, _, 71, _, 74, _, 79, _], [76, _, 79, _, 83, _, 79, _], [81, _, _, 79, 76, _, 72, _],
  [77, _, 76, _, 74, _, 72, _], [74, _, 76, _, 77, _, 74, _], [76, _, 74, _, 72, _, _, _], [67, _, 72, _, 76, _, _, _],
];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
function rngS(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function ruido(ctx, seg = 2) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seg), ctx.sampleRate), d = b.getChannelData(0);
  let ult = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; ult = ult * 0.6 + w * 0.4; d[i] = w * 0.6 + ult * 0.4; }
  return b;
}
function reverb(ctx, seg = 2.2) {
  const n = Math.floor(ctx.sampleRate * seg), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2) * (i < ctx.sampleRate * 0.012 ? i / (ctx.sampleRate * 0.012) : 1); }
  const cv = ctx.createConvolver(); cv.buffer = b; return cv;
}

/** Instrumentos da trilha (servem para o contexto ao vivo e para o de teste, sem som). */
function instrumentos(ctx, saida, eco) {
  const env = (g, t, a, pico, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pico, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  return {
    kalimba(t, m, v = 1) {
      const f = hz(m), g = ctx.createGain(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o1.type = 'sine'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 5.95; // "dente" de metal, some logo
      env(g, t, 0.004, 0.22 * v, 1.5); env(g2, t, 0.002, 0.05 * v, 0.09);
      o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(saida); g.connect(eco);
      o1.start(t); o2.start(t); o1.stop(t + 1.7); o2.stop(t + 0.2);
    },
    flauta(t, m, dur, v = 1) {
      const f = hz(m), o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f; lfo.frequency.value = 5.2; lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency);
      lp.type = 'lowpass'; lp.frequency.value = 2400;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09 * v, t + 0.08); g.gain.setTargetAtTime(0.0001, t + dur * 0.85, 0.12);
      o.connect(lp); lp.connect(g); g.connect(saida); g.connect(eco);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.8); lfo.stop(t + dur + 0.8);
    },
    colchao(t, notas, dur) {
      const lp = ctx.createBiquadFilter(), g = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 820; lp.Q.value = 0.4;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.028, t + 0.9); g.gain.setValueAtTime(0.028, t + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.0);
      lp.connect(g); g.connect(saida); g.connect(eco);
      for (const m of notas) for (const d of [-5, 5]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 1.1); }
    },
    baixo(t, m, dur = 0.9) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = hz(m);
      env(g, t, 0.02, 0.17, dur); o.connect(g); g.connect(saida); o.start(t); o.stop(t + dur + 0.1);
    },
    chocalho(t, v, buf) {
      const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 6500; env(g, t, 0.003, 0.03 * v, 0.06);
      s.connect(hp); hp.connect(g); g.connect(saida); s.start(t, Math.random()); s.stop(t + 0.12);
    },
  };
}

/** Agenda um compasso da trilha (n = número do compasso desde o começo). */
function compasso(I, t, n, { menos, buf }) {
  const i = n % 16, volta = Math.floor(n / 16), r = rngS(volta * 977 + i * 31 + 7);
  const [baixo, notas] = AC[FORMA[i]];
  I.colchao(t, notas, COMPASSO);
  I.baixo(t, baixo, 0.9); I.baixo(t + BATIDA * 2, baixo + (r() < 0.5 ? 7 : 12), 0.7);
  const flauta = volta % 3 === 2 && i < 8; // de vez em quando a flautinha canta a parte A
  const oitava = volta % 4 === 3 ? -12 : 0;
  const mel = MELODIA[i];
  for (let k = 0; k < 8; k++) {
    const m = mel[k]; if (m == null) continue;
    if (volta > 0 && !flauta && r() < 0.12 && k > 0) continue; // variação: às vezes uma nota fica de fora
    const tk = t + k * COLCHEIA + (k % 2 ? 0.012 : 0); // levíssimo balanço
    if (flauta) { let dur = COLCHEIA; for (let j = k + 1; j < 8 && mel[j] == null; j++) dur += COLCHEIA; I.flauta(tk, m + oitava, Math.min(dur, BATIDA * 2)); }
    else I.kalimba(tk, m + oitava, k % 2 ? 0.8 : 1);
  }
  if (!menos && volta > 0) for (let k = 0; k < 8; k++) I.chocalho(t + k * COLCHEIA, k % 2 ? 1 : 0.45, buf);
}

export function criarSom({ menos = false, chave = 'fonema.passeio.som' } = {}) {
  let ligado = true; try { ligado = localStorage.getItem(chave) !== '0'; } catch (e) { /* sem armazenamento */ }
  let ctx = null, N = {}, compN = 0, proxT = 0, timer = 0, iniciado = false;
  const alvo = { rio: 0, praca: 0, vento: 0.3, sub: false, falando: false };
  const botoes = new Set();

  function montar() {
    const AC0 = window.AudioContext || window.webkitAudioContext; if (!AC0) return false;
    ctx = new AC0();
    const buf = ruido(ctx);
    const master = ctx.createGain(); master.gain.value = 0;
    const abafa = ctx.createBiquadFilter(); abafa.type = 'lowpass'; abafa.frequency.value = 18000; abafa.Q.value = 0.5;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(abafa); abafa.connect(comp); comp.connect(ctx.destination);
    const musica = ctx.createGain(); musica.gain.value = menos ? 0.45 : 0.7; musica.connect(master);
    const eco = reverb(ctx), ecoG = ctx.createGain(); ecoG.gain.value = 0.3; eco.connect(ecoG); ecoG.connect(musica);
    const amb = ctx.createGain(); amb.gain.value = 0.55; amb.connect(master);
    const fonte = (lp) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = 0; s.connect(lp); s.start(0, Math.random() * 1.5); return s; };
    // água: dois filtros em faixas, o de cima "borbulha" (ganho mexido a cada pouco)
    const aguaG = ctx.createGain(); aguaG.gain.value = 0; aguaG.connect(amb);
    const bp1 = ctx.createBiquadFilter(); bp1.type = 'bandpass'; bp1.frequency.value = 520; bp1.Q.value = 0.8; fonte(bp1); bp1.connect(aguaG);
    const bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 1500; bp2.Q.value = 2.2; const bg2 = ctx.createGain(); bg2.gain.value = 0.3; fonte(bp2); bp2.connect(bg2); bg2.connect(aguaG);
    // vento: grave, com respiração lenta
    const ventoG = ctx.createGain(); ventoG.gain.value = 0; ventoG.connect(amb);
    const lpV = ctx.createBiquadFilter(); lpV.type = 'lowpass'; lpV.frequency.value = 420; fonte(lpV);
    const respira = ctx.createGain(); respira.gain.value = 0.6; lpV.connect(respira); respira.connect(ventoG);
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.08; lfoG.gain.value = 0.4; lfo.connect(lfoG); lfoG.connect(respira.gain); lfo.start();
    // embaixo d'água: ronco grave
    const subG = ctx.createGain(); subG.gain.value = 0; subG.connect(amb);
    const lpS = ctx.createBiquadFilter(); lpS.type = 'lowpass'; lpS.frequency.value = 170; fonte(lpS); lpS.connect(subG);
    N = { buf, master, abafa, musica, amb, eco, aguaG, bg2, ventoG, subG, I: instrumentos(ctx, musica, eco) };
    return true;
  }

  // ---------- passarinhos e bolhas (sintetizados) ----------
  function piado(t, pan, tipo, v = 1) {
    const g = ctx.createGain(), p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(N.amb);
    const notas = tipo === 0 ? [[3200, 4200, 0.07], [3300, 4300, 0.07], [3100, 2500, 0.16]]
      : tipo === 1 ? [[2600, 3400, 0.09], [3600, 2900, 0.12]]
        : [[4200, 4600, 0.04], [4300, 4700, 0.04], [4250, 4650, 0.04], [4300, 4700, 0.04]];
    let tt = t;
    for (const [f0, f1, d] of notas) {
      const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f1, tt + d);
      gg.gain.setValueAtTime(0.0001, tt); gg.gain.linearRampToValueAtTime(0.05 * v, tt + 0.012); gg.gain.exponentialRampToValueAtTime(0.0001, tt + d);
      o.connect(gg); gg.connect(g); o.start(tt); o.stop(tt + d + 0.02); tt += d + 0.05 + Math.random() * 0.04;
    }
  }
  function bolha(t) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    const f = 260 + Math.random() * 380; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.6, t + 0.07);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(N.amb); o.start(t); o.stop(t + 0.12);
  }

  let proxPiado = 0, proxBolha = 0, proxBorbulha = 0;
  function laco() {
    if (!ctx || ctx.state !== 'running') return;
    const agora = ctx.currentTime;
    if (proxT < agora) proxT = agora + 0.1;
    while (proxT < agora + 0.6) { compasso(N.I, proxT, compN++, { menos, buf: N.buf }); proxT += COMPASSO; }
    // ambiente
    if (!alvo.sub && alvo.praca > 0.05 && agora > proxPiado) { piado(agora + 0.05, Math.random() * 1.4 - 0.7, Math.floor(Math.random() * 3), 0.5 + alvo.praca * 0.5); proxPiado = agora + (menos ? 6 : 2.2) + Math.random() * (menos ? 8 : 5) / Math.max(0.3, alvo.praca); }
    if (alvo.sub && agora > proxBolha) { bolha(agora + 0.02); if (Math.random() < 0.4) bolha(agora + 0.1); proxBolha = agora + 0.5 + Math.random() * 1.6; }
    if (agora > proxBorbulha) { N.bg2.gain.setTargetAtTime(0.1 + Math.random() * 0.6, agora, 0.04); proxBorbulha = agora + 0.07 + Math.random() * 0.1; }
  }
  function aplicar(rapido = false) {
    if (!ctx) return;
    const t = ctx.currentTime, k = rapido ? 0.05 : 0.6;
    N.master.gain.setTargetAtTime(ligado ? 0.55 : 0, t, rapido ? 0.05 : 0.4);
    N.musica.gain.setTargetAtTime((menos ? 0.45 : 0.7) * (alvo.falando ? 0.3 : 1) * (alvo.sub ? 0.65 : 1), t, k);
    N.amb.gain.setTargetAtTime(alvo.falando ? 0.3 : 0.55, t, k);
    N.aguaG.gain.setTargetAtTime(alvo.sub ? 0.0 : alvo.rio * 0.22, t, k);
    N.ventoG.gain.setTargetAtTime(alvo.sub ? 0 : 0.05 + alvo.vento * 0.16, t, k);
    N.subG.gain.setTargetAtTime(alvo.sub ? 0.5 : 0, t, 0.25);
    N.abafa.frequency.setTargetAtTime(alvo.sub ? 520 : 18000, t, 0.18);
  }

  function iniciar() {
    if (iniciado || !ligado) { if (ctx && ctx.state === 'suspended' && ligado && !document.hidden) ctx.resume(); return; }
    if (!montar()) return;
    iniciado = true; proxT = ctx.currentTime + 0.3;
    timer = setInterval(laco, 100);
    aplicar();
  }
  const gesto = () => iniciar();
  window.addEventListener('pointerdown', gesto, true); window.addEventListener('keydown', gesto, true);
  const vis = () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (ligado) ctx.resume(); };
  document.addEventListener('visibilitychange', vis);
  const tecla = (e) => { if ((e.key === 'm' || e.key === 'M') && !e.repeat) api.alternar(); };
  window.addEventListener('keydown', tecla);

  function pintar() { for (const b of botoes) { b.querySelector('.ic').textContent = ligado ? '🔊' : '🔇'; b.setAttribute('aria-label', ligado ? 'Desligar o som' : 'Ligar o som'); b.title = ligado ? 'Som ligado (M)' : 'Som desligado (M)'; b.setAttribute('aria-pressed', String(!ligado)); } }

  const api = {
    get ligado() { return ligado; },
    ligar(on) {
      ligado = !!on; try { localStorage.setItem(chave, ligado ? '1' : '0'); } catch (e) { /* ok */ }
      if (ligado) iniciar();
      if (ctx) { aplicar(true); if (ligado && ctx.state === 'suspended') ctx.resume(); }
      pintar(); return ligado;
    },
    alternar() { return api.ligar(!ligado); },
    definirMenos(v) { menos = !!v; aplicar(); },
    /** A cada quadro (ou menos): quanto de rio/praça/vento há em volta e se a câmera está embaixo d'água. */
    atualizar(p) {
      const antes = alvo.sub, antesF = alvo.falando;
      Object.assign(alvo, p);
      if (!ctx) return;
      if (antes !== alvo.sub || antesF !== alvo.falando) aplicar(); else if ((api._n = (api._n || 0) + 1) % 15 === 0) aplicar();
    },
    /** Botão redondo 🔊/🔇 (mesmo estilo dos botões do passeio). */
    criarBotao(onde, classe = 'bt redondo') {
      const b = document.createElement('button'); b.className = classe; b.id = 'btSom'; b.dataset.testid = 'passeio-som';
      b.innerHTML = '<span class="ic">🔊</span>'; b.onclick = (e) => { e.stopPropagation(); api.alternar(); };
      b.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });
      onde.appendChild(b); botoes.add(b); pintar(); return b;
    },
    estado() { return { ligado, contexto: ctx ? ctx.state : 'nenhum', compassos: compN, sub: alvo.sub, rio: +alvo.rio.toFixed(2), praca: +alvo.praca.toFixed(2), menos }; },
    destruir() {
      clearInterval(timer); window.removeEventListener('pointerdown', gesto, true); window.removeEventListener('keydown', gesto, true);
      window.removeEventListener('keydown', tecla); document.removeEventListener('visibilitychange', vis);
      for (const b of botoes) b.remove(); if (ctx) ctx.close();
    },
  };
  return api;
}

/**
 * Teste sem som (OfflineAudioContext): grava `seg` segundos da trilha e devolve o pico e o volume médio (RMS),
 * para conferir que toca, não estoura e fica baixinha. Ex.: await medirTrilha(22).
 */
export async function medirTrilha(seg = 22, { menos = false } = {}) {
  const sr = 22050, ctx = new OfflineAudioContext(2, Math.ceil(sr * seg), sr);
  const g = ctx.createGain(); g.gain.value = 0.55 * (menos ? 0.45 : 0.7); g.connect(ctx.destination);
  const eco = reverb(ctx), eg = ctx.createGain(); eg.gain.value = 0.3; eco.connect(eg); eg.connect(g);
  const I = instrumentos(ctx, g, eco), buf = ruido(ctx);
  for (let n = 0, t = 0.05; t < seg; n++, t += COMPASSO) compasso(I, t, n + 16, { menos, buf });
  const out = await ctx.startRendering(), d = out.getChannelData(0);
  let pico = 0, s2 = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pico) pico = v; s2 += v * v; }
  return { pico: +pico.toFixed(3), rms: +Math.sqrt(s2 / d.length).toFixed(4), seg, compassoSeg: +COMPASSO.toFixed(3) };
}
