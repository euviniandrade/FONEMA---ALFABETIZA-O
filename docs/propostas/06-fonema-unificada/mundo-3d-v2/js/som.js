// FONEMA · Mundo 3D v2 — trilha e sons do passeio, TODOS feitos aqui no código (Web Audio): nenhum arquivo de áudio,
// nenhuma música de terceiros. Composição original do projeto (melodia, acordes e levadas abaixo, em notas MIDI).
//  - Trilha de AVENTURA (pedido do dono, 18/11: "mais aventura, mais energia, mais detalhes"): Dó maior, 120 batidas/min,
//    ciclo de 32 compassos em 4 partes de 8 (A = levada e riff, B = tema heroico, C = pergunta e resposta, D = ponte que
//    sobe) e camadas que entram e saem a cada 8/16 compassos: bumbo e caixa suaves, chocalho, baixo marcado em colcheias,
//    "cordas" em pizzicato, metais macios na melodia, sininho (glockenspiel) nas respostas, viradas de tom no fim das frases.
//  - Três intensidades: 'calmo' (embaixo d'água: sem bateria, kalimba e colchão, tudo abafado), 'normal' (passeio) e
//    'aventura' (caça ao tesouro e barco: bateria cheia, chocalho em semicolcheias, metais dobrados, viradas).
//  - Ambiente por lugar: passarinhos (praça e árvores), água (perto do rio), vento (no alto/de longe),
//    e embaixo d'água tudo fica abafado, com um ronco grave e bolhinhas.
//  - Volume baixo; botão de mudo (🔊/🔇, tecla M) que fica salvo; "menos movimento" = trilha mais baixa e mais leve
//    (sem chocalho nem viradas), menos passarinhos. A trilha abaixa sozinha quando há fala: cartão aberto no passeio ou
//    o canal de voz do app ocupado (`window.parent.FONEMA_CANAL_OCUPADO()`, servicos/canal-audio.ts).
// O áudio só começa no primeiro toque/tecla (regra dos navegadores).

const BPM = 120, BATIDA = 60 / BPM, COLCHEIA = BATIDA / 2, SEMI = BATIDA / 4, COMPASSO = BATIDA * 4;
const _ = null;
// acordes: [baixo, notas do colchão]
const AC = {
  C: [36, [60, 64, 67]], G: [43, [59, 62, 67]], Am: [45, [60, 64, 69]], F: [41, [60, 65, 69]], Em: [40, [59, 64, 67]],
  Dm: [38, [62, 65, 69]], Bb: [46, [62, 65, 70]],
};
// as 4 partes (8 compassos cada): acordes, melodia em colcheias (_ = pausa) e quais compassos são "resposta" (sininho)
const PARTES = {
  A: { ac: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
    mel: [[_, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [_, _, _, _, 84, _, 81, 84],
      [_, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [86, _, 83, _, 79, _, 86, _]],
    resp: [0, 0, 0, 1, 0, 0, 0, 1] },
  B: { ac: ['C', 'Em', 'F', 'G', 'C', 'Em', 'F', 'G'],
    mel: [[67, _, 72, _, _, 74, 76, _], [79, _, _, 76, _, _, 71, _], [72, _, 77, _, 76, _, 74, 72], [74, _, _, _, 67, _, 71, 74],
      [67, _, 72, _, _, 74, 76, _], [79, _, _, 83, _, 81, 79, 76], [77, _, 76, _, 74, _, 72, _], [74, _, _, 76, 74, _, 71, _]],
    resp: [0, 0, 0, 0, 0, 0, 0, 0] },
  C: { ac: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Bb', 'G'],
    mel: [[76, _, 76, 77, 79, _, 76, _], [_, _, _, _, 84, 81, 77, _], [76, _, 76, 77, 79, _, 84, _], [_, _, _, _, 83, 79, 74, _],
      [81, _, 79, _, 76, _, 72, _], [77, _, 76, _, 72, _, 69, _], [70, _, 74, _, 77, _, 82, _], [79, _, _, _, 74, _, 79, _]],
    resp: [0, 1, 0, 1, 0, 0, 0, 0] },
  D: { ac: ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'Bb', 'G'],
    mel: [[77, _, _, _, _, _, 76, _], [74, _, _, _, 79, _, _, _], [79, _, _, _, _, _, 76, _], [76, _, _, _, 72, _, _, _],
      [74, _, _, _, 77, _, 81, _], [79, _, _, _, _, _, 74, _], [77, _, _, _, 74, _, 70, _], [74, _, _, _, 71, _, 74, 79]],
    resp: [0, 0, 0, 0, 0, 0, 0, 0] },
};
// ordem das partes em cada volta de 32 compassos (a 1ª volta começa só com a levada)
const FORMAS = [['A', 'B', 'C', 'B'], ['B', 'C', 'D', 'B'], ['A', 'C', 'D', 'B']];
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
function instrumentos(ctx, saida, eco, buf) {
  const env = (g, t, a, pico, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pico, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  const pan = (v) => { const p = ctx.createStereoPanner(); p.pan.value = v; p.connect(saida); return p; };
  const esq = pan(-0.35), dir = pan(0.35), meio = saida;
  const ruidoEm = (t, dur, filtro, freq, q, g) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(); s.buffer = buf; f.type = filtro; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g); s.start(t, Math.random() * 1.5); s.stop(t + dur); };
  return {
    kalimba(t, m, v = 1) {
      const f = hz(m), g = ctx.createGain(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o1.type = 'sine'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 5.95; // "dente" de metal, some logo
      env(g, t, 0.004, 0.2 * v, 1.4); env(g2, t, 0.002, 0.05 * v, 0.09);
      o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(meio); g.connect(eco);
      o1.start(t); o2.start(t); o1.stop(t + 1.6); o2.stop(t + 0.2);
    },
    /** Sininho (glockenspiel): parciais de barra de metal, curtinho e brilhante — as "respostas". */
    sino(t, m, v = 1) {
      const f = hz(m), g = ctx.createGain();
      for (const [k, a, d] of [[1, 0.1, 0.9], [2.76, 0.035, 0.35], [5.4, 0.015, 0.12]]) {
        const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * k; env(gg, t, 0.002, a * v, d); o.connect(gg); gg.connect(g); o.start(t); o.stop(t + d + 0.05);
      }
      g.connect(dir); g.connect(eco);
    },
    /** Metais macios (melodia heroica): dois serrotes desafinadinhos com filtro que abre no ataque. */
    metais(t, m, dur, v = 1) {
      const f = hz(m), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 1.2;
      lp.frequency.setValueAtTime(700, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.05); lp.frequency.setTargetAtTime(1500, t + 0.06, 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06 * v, t + 0.03); g.gain.setTargetAtTime(0.045 * v, t + 0.05, 0.1);
      g.gain.setTargetAtTime(0.0001, t + dur * 0.92, 0.06);
      for (const d of [-7, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.5); }
      lp.connect(g); g.connect(meio); g.connect(eco);
    },
    flauta(t, m, dur, v = 1) {
      const f = hz(m), o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f; lfo.frequency.value = 5.2; lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency);
      lp.type = 'lowpass'; lp.frequency.value = 2400;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.085 * v, t + 0.06); g.gain.setTargetAtTime(0.0001, t + dur * 0.85, 0.1);
      o.connect(lp); lp.connect(g); g.connect(esq); g.connect(eco);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.6); lfo.stop(t + dur + 0.6);
    },
    /** Cordas em pizzicato (o riff da levada). */
    pizz(t, m, v = 1, lado = esq) {
      const f = hz(m), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sawtooth'; o2.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 1800;
      const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp); o.connect(lp);
      env(g, t, 0.004, 0.07 * v, 0.2); lp.connect(g); g.connect(lado); g.connect(eco);
      o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.3);
    },
    colchao(t, notas, dur, v = 1) {
      const lp = ctx.createBiquadFilter(), g = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022 * v, t + 0.5); g.gain.setValueAtTime(0.022 * v, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
      lp.connect(g); g.connect(saida); g.connect(eco);
      for (const m of notas) for (const d of [-6, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.7); }
    },
    /** Baixo marcado: triângulo + seno (corpo) com ataque curto. */
    baixo(t, m, dur = 0.22, v = 1) {
      const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      for (const [tipo, a] of [['triangle', 1], ['sine', 0.8]]) { const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = hz(m); const gg = ctx.createGain(); gg.gain.value = a; o.connect(gg); gg.connect(lp); o.start(t); o.stop(t + dur + 0.08); }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16 * v, t + 0.008); g.gain.setTargetAtTime(0.09 * v, t + 0.02, 0.06); g.gain.setTargetAtTime(0.0001, t + dur * 0.8, 0.03);
      lp.connect(g); g.connect(meio);
    },
    /** Bumbo suave (seno que desce). */
    bumbo(t, v = 1) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
      env(g, t, 0.003, 0.32 * v, 0.24); o.connect(g); g.connect(meio); o.start(t); o.stop(t + 0.3);
    },
    /** Caixa suave: ruído em faixa + corpinho. */
    caixa(t, v = 1) {
      const g = ctx.createGain(); env(g, t, 0.002, 0.07 * v, 0.13); g.connect(meio); g.connect(eco);
      ruidoEm(t, 0.18, 'bandpass', 2000, 0.7, g);
      const o = ctx.createOscillator(), go = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.06);
      env(go, t, 0.002, 0.05 * v, 0.07); o.connect(go); go.connect(meio); o.start(t); o.stop(t + 0.1);
    },
    /** Tom (viradas no fim das frases). */
    tom(t, f0 = 170, v = 1) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.66, t + 0.2);
      env(g, t, 0.003, 0.16 * v, 0.24); o.connect(g); g.connect(meio); g.connect(eco); o.start(t); o.stop(t + 0.3);
    },
    chocalho(t, v = 1) {
      const g = ctx.createGain(); env(g, t, 0.003, 0.028 * v, 0.05); g.connect(dir);
      ruidoEm(t, 0.09, 'highpass', 6500, 0.7, g);
    },
    /** Prato que cresce (entrada de parte nova), bem baixinho. */
    subida(t, dur) {
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
      g.connect(saida); g.connect(eco); ruidoEm(t, dur + 0.1, 'highpass', 5000, 0.5, g);
    },
  };
}

/** Em que parte e em que compasso dela está o compasso n (ciclos de 32). */
export function parteDo(n) {
  const volta = Math.floor(n / 32), forma = FORMAS[volta === 0 ? 0 : 1 + ((volta - 1) % 2)];
  const k = n % 32, nome = forma[Math.floor(k / 8)];
  return { volta, nome, i: k % 8, parte: PARTES[nome], frase: Math.floor(k / 8), proxNome: forma[(Math.floor(k / 8) + 1) % 4] };
}

/**
 * Agenda um compasso da trilha (n = número do compasso desde o começo).
 * nivel: 'calmo' | 'normal' | 'aventura'; menos = "menos movimento" (mais leve).
 */
function compasso(I, t, n, { nivel = 'normal', menos = false }) {
  const { volta, nome, i, parte } = parteDo(n), r = rngS(volta * 977 + n * 31 + 7);
  const [baixo, notas] = AC[parte.ac[i]], mel = parte.mel[i], resp = parte.resp[i];
  const forte = nivel === 'aventura', calmo = nivel === 'calmo';
  const fimFrase = i === 7, comeco = n < 2; // os 2 primeiros compassos: só a levada aparece
  const bat = calmo ? 0 : menos ? 0.6 : forte ? 1.1 : 0.85;

  // colchão (sempre; mais presente no calmo e na ponte)
  I.colchao(t, notas, COMPASSO, calmo || nome === 'D' ? 1.3 : 0.8);

  // baixo
  if (calmo) { I.baixo(t, baixo, BATIDA * 1.8, 0.7); I.baixo(t + BATIDA * 2, baixo + 7, BATIDA * 1.8, 0.6); }
  else {
    const padrao = nome === 'D' ? [0, _, 0, _, 12, _, 7, _] : forte || nome === 'C' ? [0, 0, 12, 0, 7, 0, 12, 7] : [0, _, 12, 0, 7, _, 12, 0];
    padrao.forEach((d, k) => { if (d != null) I.baixo(t + k * COLCHEIA, baixo + d, COLCHEIA * 0.9, k % 2 ? 0.75 : 1); });
  }

  // riff de cordas em pizzicato (arpejo do acorde): em todas as partes menos a ponte; no calmo, só a cada 2 tempos
  if (nome !== 'D' || forte) {
    const arp = [notas[0], notas[1], notas[2], notas[1] + 12 > 84 ? notas[1] : notas[1] + 12];
    const ordem = (volta + Math.floor(n / 8)) % 2 ? [0, 2, 1, 2, 3, 2, 1, 2] : [0, 1, 2, 3, 2, 1, 2, 1];
    ordem.forEach((j, k) => { if (calmo && k % 4) return; if (menos && k % 2) return; I.pizz(t + k * COLCHEIA, arp[j] - 12, k % 2 ? 0.7 : 1); });
  }

  // bateria
  if (bat > 0 && !comeco) {
    const kicks = forte ? [0, 3, 4, 7] : nome === 'D' ? [0, 4] : [0, 3, 4];
    for (const k of kicks) I.bumbo(t + k * COLCHEIA, bat);
    if (!(nome === 'A' && volta === 0 && i < 4)) for (const k of [2, 6]) I.caixa(t + k * COLCHEIA, bat * (k === 6 && fimFrase ? 1.2 : 1));
    if (!menos) { const passos = forte ? 16 : 8, d = forte ? SEMI : COLCHEIA; for (let k = 0; k < passos; k++) I.chocalho(t + k * d, (k % 2 ? 1 : 0.5) * (forte ? 1 : 0.8)); }
    // virada no fim da frase (tom descendo) e prato que cresce antes da próxima parte
    if (fimFrase && !menos && (forte || r() < 0.7)) { [210, 180, 150, 120].forEach((f, k) => I.tom(t + BATIDA * 3 + k * SEMI, f, bat)); I.subida(t + BATIDA * 2, BATIDA * 2); }
  }

  // melodia: metais (tema), sininho nas respostas; no calmo, kalimba; às vezes a flautinha dobra a ponte
  const durDe = (k) => { let d = COLCHEIA; for (let j = k + 1; j < 8 && mel[j] == null; j++) d += COLCHEIA; return Math.min(d, BATIDA * 2); };
  const oitava = calmo ? 0 : volta >= 2 && nome === 'B' && i >= 4 ? 12 : 0;
  for (let k = 0; k < 8; k++) {
    const m = mel[k]; if (m == null) continue;
    const tk = t + k * COLCHEIA;
    if (calmo) { I.kalimba(tk, m, k % 2 ? 0.8 : 1); continue; }
    if (resp || nome === 'A') { I.sino(tk, m + (m < 79 ? 12 : 0), 1); continue; }
    I.metais(tk, m + oitava - (oitava && m > 80 ? 12 : 0), durDe(k), forte ? 1.05 : 0.9);
    if (forte && nome === 'B') I.metais(tk, m - 12, durDe(k), 0.5); // dobra uma oitava abaixo na aventura
    if (nome === 'D' && volta % 2 === 0) I.flauta(tk, m + 12, durDe(k), 0.7);
  }
  // resposta do sininho por cima do tema na aventura (eco da última nota do compasso)
  if (forte && nome === 'B' && i % 2 === 1) { const ult = [...mel].reverse().find((x) => x != null); if (ult) I.sino(t + BATIDA * 3.5, ult + 12, 0.7); }
}

export function criarSom({ menos = false, chave = 'fonema.passeio.som' } = {}) {
  let ligado = true; try { ligado = localStorage.getItem(chave) !== '0'; } catch (e) { /* sem armazenamento */ }
  let ctx = null, N = {}, compN = 0, proxT = 0, timer = 0, iniciado = false;
  const alvo = { rio: 0, praca: 0, vento: 0.3, sub: false, falando: false, caca: false };
  let falaApp = false; // canal de voz do app (pai do iframe) ocupado
  const botoes = new Set();

  function montar() {
    const AC0 = window.AudioContext || window.webkitAudioContext; if (!AC0) return false;
    ctx = new AC0();
    const buf = ruido(ctx);
    const master = ctx.createGain(); master.gain.value = 0;
    const abafa = ctx.createBiquadFilter(); abafa.type = 'lowpass'; abafa.frequency.value = 18000; abafa.Q.value = 0.5;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(abafa); abafa.connect(comp); comp.connect(ctx.destination);
    const musica = ctx.createGain(); musica.gain.value = menos ? 0.36 : 0.56; musica.connect(master);
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
    N = { buf, master, abafa, musica, amb, eco, aguaG, bg2, ventoG, subG, I: instrumentos(ctx, musica, eco, buf) };
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
    while (proxT < agora + 0.6) { compasso(N.I, proxT, compN++, { menos, nivel: nivelAgora() }); proxT += COMPASSO; }
    // fala do app tocando (canal único de áudio do app, mesmo site): a trilha abaixa
    let f = false; try { f = !!window.parent?.FONEMA_CANAL_OCUPADO?.(); } catch (e) { /* outro site */ }
    if (f !== falaApp) { falaApp = f; aplicar(); }
    // ambiente
    if (!alvo.sub && alvo.praca > 0.05 && agora > proxPiado) { piado(agora + 0.05, Math.random() * 1.4 - 0.7, Math.floor(Math.random() * 3), 0.5 + alvo.praca * 0.5); proxPiado = agora + (menos ? 6 : 2.2) + Math.random() * (menos ? 8 : 5) / Math.max(0.3, alvo.praca); }
    if (alvo.sub && agora > proxBolha) { bolha(agora + 0.02); if (Math.random() < 0.4) bolha(agora + 0.1); proxBolha = agora + 0.5 + Math.random() * 1.6; }
    if (agora > proxBorbulha) { N.bg2.gain.setTargetAtTime(0.1 + Math.random() * 0.6, agora, 0.04); proxBorbulha = agora + 0.07 + Math.random() * 0.1; }
  }
  const nivelAgora = () => (alvo.sub ? 'calmo' : alvo.caca ? 'aventura' : 'normal');
  function aplicar(rapido = false) {
    if (!ctx) return;
    const t = ctx.currentTime, k = rapido ? 0.05 : 0.6;
    N.master.gain.setTargetAtTime(ligado ? 0.55 : 0, t, rapido ? 0.05 : 0.4);
    const falando = alvo.falando || falaApp;
    N.musica.gain.setTargetAtTime((menos ? 0.36 : 0.56) * (falando ? 0.28 : 1) * (alvo.sub ? 0.75 : alvo.caca ? 1.08 : 1), t, falando ? 0.08 : k);
    N.amb.gain.setTargetAtTime(falando ? 0.3 : 0.55, t, k);
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
      const antes = alvo.sub, antesF = alvo.falando, antesC = alvo.caca;
      Object.assign(alvo, p);
      if (!ctx) return;
      if (antes !== alvo.sub || antesF !== alvo.falando || antesC !== alvo.caca) aplicar(); else if ((api._n = (api._n || 0) + 1) % 15 === 0) aplicar();
    },
    /** Botão redondo 🔊/🔇 (mesmo estilo dos botões do passeio). */
    criarBotao(onde, classe = 'bt redondo') {
      const b = document.createElement('button'); b.className = classe; b.id = 'btSom'; b.dataset.testid = 'passeio-som';
      b.innerHTML = '<span class="ic">🔊</span>'; b.onclick = (e) => { e.stopPropagation(); api.alternar(); };
      b.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });
      onde.appendChild(b); botoes.add(b); pintar(); return b;
    },
    estado() { return { ligado, contexto: ctx ? ctx.state : 'nenhum', compassos: compN, nivel: nivelAgora(), parte: compN ? parteDo(compN - 1).nome : null, falando: alvo.falando || falaApp, sub: alvo.sub, rio: +alvo.rio.toFixed(2), praca: +alvo.praca.toFixed(2), menos }; },
    destruir() {
      clearInterval(timer); window.removeEventListener('pointerdown', gesto, true); window.removeEventListener('keydown', gesto, true);
      window.removeEventListener('keydown', tecla); document.removeEventListener('visibilitychange', vis);
      for (const b of botoes) b.remove(); if (ctx) ctx.close();
    },
  };
  return api;
}

/**
 * Teste sem som (OfflineAudioContext): grava `seg` segundos da trilha (a partir do compasso `de`) e devolve o pico e o
 * volume médio (RMS) em dB, para conferir que toca, não estoura e fica baixinha. Ex.: await medirTrilha(30, { nivel: 'aventura' }).
 * Com `buffer: true` devolve também o áudio (AudioBuffer) para salvar em WAV.
 */
export async function medirTrilha(seg = 22, { menos = false, nivel = 'normal', de = 32, buffer = false, sr = 22050 } = {}) {
  const ctx = new OfflineAudioContext(2, Math.ceil(sr * seg), sr);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0.55 * (menos ? 0.36 : 0.56) * (nivel === 'calmo' ? 0.75 : nivel === 'aventura' ? 1.08 : 1); g.connect(comp);
  const eco = reverb(ctx), eg = ctx.createGain(); eg.gain.value = 0.3; eco.connect(eg); eg.connect(g);
  const I = instrumentos(ctx, g, eco, ruido(ctx));
  for (let n = 0, t = 0.05; t < seg; n++, t += COMPASSO) compasso(I, t, n + de, { menos, nivel });
  const out = await ctx.startRendering(), d = out.getChannelData(0);
  let pico = 0, s2 = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pico) pico = v; s2 += v * v; }
  const rms = Math.sqrt(s2 / d.length), dB = (x) => +(20 * Math.log10(Math.max(x, 1e-9))).toFixed(1);
  const r = { nivel, menos, pico: +pico.toFixed(3), rms: +rms.toFixed(4), picoDb: dB(pico), rmsDb: dB(rms), seg, bpm: BPM, compassoSeg: +COMPASSO.toFixed(3) };
  if (buffer) r.audio = out;
  return r;
}
