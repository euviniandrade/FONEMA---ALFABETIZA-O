/* FONEMA · Espelho do Som — VISTA DE FRENTE, estilo "Boca gigante" (D020).
 *
 * A forma dos lábios vem de 6 ILUSTRAÇÕES por visema (estilos-opcoes/base-frente-*.png), todas com o mesmo
 * enquadramento da dupla: A (boca aberta), U, O, M (lábios fechados), F (dentes no lábio), I (sorriso).
 * Troca com crossfade (~180 ms) e um "squash & stretch" pequeno só na região da boca (a dupla não se mexe).
 * NENHUM lábio é desenhado por código. Só na base aberta aparece a LÍNGUA animada (coral, gordinha, com
 * brilho e sulco), desenhada ENTRE o fundo e a camada da frente (recortes/frente-camada.png, com a cavidade
 * vazada por recortar.py): ela sempre passa por trás dos dentes e dos lábios da ilustração.
 * Por cima: setas amarelas curvas, brilho no ponto de contato, ar (risquinhos) e uma frase curta.
 * POSIÇÕES SIMPLIFICADAS — VALIDAR COM FONOAUDIÓLOGA.
 *
 *   const fr = EspelhoFrente.criar(div, { fonema: 'a' });  fr.fonema('t');  fr.lento(true);
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');
  const CX = 697;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  let nInst = 0;

  // visema (ilustração da boca) de cada som
  const VISEMA = { U: 'u u~', O: 'o o~ O x j', M: 'p b m', F: 'f v', I: 'i i~ e e~ s z' };
  function visema(id) { for (const [v, ids] of Object.entries(VISEMA)) if (ids.split(' ').includes(id)) return v; return 'A'; }

  /* Língua na boca aberta, vista de frente. yF = topo da parte da frente; yB = topo do fundo (dorso);
   * ponta = quanto a ponta sobe (0–1); wt = meia-largura da ponta; toque = onde brilha. */
  const BAIXA = { yF: 468, yB: 452, ponta: 0, wt: 80 };
  const LINGUA = {
    a: BAIXA, 'a~': BAIXA, E: { yF: 452, yB: 428, ponta: 0, wt: 80 },
    t: { yF: 440, yB: 418, ponta: 1, wt: 88, toque: 'ponta' }, d: { yF: 440, yB: 418, ponta: 1, wt: 88, toque: 'ponta' },
    n: { yF: 440, yB: 418, ponta: 1, wt: 88, toque: 'ponta' },
    l: { yF: 486, yB: 476, ponta: 1, wt: 70, toque: 'ponta', lateral: 1 },
    r: { yF: 446, yB: 424, ponta: 0.3, wt: 72, toque: 'ponta', bate: 1 },
    k: { yF: 482, yB: 296, ponta: 0, wt: 80, toque: 'fundo' }, g: { yF: 482, yB: 296, ponta: 0, wt: 80, toque: 'fundo' },
    nh: { yF: 318, yB: 300, ponta: 0, wt: 80, toque: 'meio' }, lh: { yF: 318, yB: 300, ponta: 0, wt: 80, toque: 'meio', lateral: 1 },
    rr: { yF: 482, yB: 348, ponta: 0, wt: 80, toque: 'raspa' }
  };

  function criar(container, opts = {}) {
    const u = 'f' + (++nInst);
    const caixa = document.createElement('div'); caixa.className = 'esp-vista esp-vista-frente';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'esp-svg esp-frente'); svg.setAttribute('role', 'img');
    svg.setAttribute('viewBox', opts.viewBox || '96 0 1184 768'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-label', 'Boca gigante de frente, mostrando como os lábios e a língua fazem o som');
    const img = (href, extra = '') => `<image href="${BASE}${href}" x="0" y="0" width="1376" height="768" ${extra}/>`;
    const lingua = `
      <g class="f-lingua">
        <g filter="url(#${u}Dentro)"><path class="f-fundo" fill="url(#${u}Fundo)"/></g>
        <path class="f-fundo-luz" fill="none" stroke="#FFD9D2" stroke-width="12" stroke-linecap="round" opacity=".5" filter="url(#${u}B6)"/>
        <ellipse class="f-chao" cx="${CX}" cy="560" rx="150" ry="44" fill="#B8445A" opacity=".35" filter="url(#${u}B10)"/>
        <g filter="url(#${u}Dentro)"><path class="f-corpo" fill="url(#${u}Ling)"/></g>
        <path class="f-sulco" fill="none" stroke="#D2545C" stroke-width="5" stroke-linecap="round" opacity=".4"/>
        <path class="f-brilho" fill="none" stroke="#FFF3EE" stroke-width="15" stroke-linecap="round" opacity=".75" filter="url(#${u}B4)"/>
        <ellipse class="f-ponto" rx="13" ry="7" fill="#fff" opacity=".8" filter="url(#${u}B2)"/>
        <ellipse class="f-ponta-sombra" cx="${CX}" rx="120" ry="30" fill="#A93C52" opacity="0" filter="url(#${u}B10)"/>
        <g filter="url(#${u}Dentro)"><path class="f-ponta" fill="url(#${u}Baixo)"/></g>
        <path class="f-freio" fill="none" stroke="#DE6B70" stroke-width="5" stroke-linecap="round"/>
        <path class="f-ponta-luz" fill="none" stroke="#FFF3EE" stroke-width="13" stroke-linecap="round" opacity=".7" filter="url(#${u}B4)"/>
      </g>`;
    svg.innerHTML = `
      <defs>
        <radialGradient id="${u}Ling" cx="50%" cy="22%" r="85%"><stop offset="0" stop-color="#FFB0A2"/><stop offset=".4" stop-color="#FC8B7C"/><stop offset=".8" stop-color="#EF6A64"/><stop offset="1" stop-color="#DB5158"/></radialGradient>
        <radialGradient id="${u}Fundo" cx="45%" cy="18%" r="80%"><stop offset="0" stop-color="#FF9C8E"/><stop offset=".45" stop-color="#F0766E"/><stop offset="1" stop-color="#D0505A"/></radialGradient>
        <linearGradient id="${u}Baixo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC0B4"/><stop offset=".3" stop-color="#FFA193"/><stop offset=".75" stop-color="#F6837A"/><stop offset="1" stop-color="#E8686A"/></linearGradient>
        <radialGradient id="${u}Toque"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".35" stop-color="#FFE98A" stop-opacity=".9"/><stop offset="1" stop-color="#FFD23F" stop-opacity="0"/></radialGradient>
        <radialGradient id="${u}Masc" gradientUnits="userSpaceOnUse" cx="${CX}" cy="372" r="350"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
        <mask id="${u}M" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768"><rect width="1376" height="768" fill="url(#${u}Masc)"/></mask>
        <filter id="${u}Dentro" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b"/><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="borda"/>
          <feFlood flood-color="#B33E4C" flood-opacity=".75"/><feComposite in2="borda" operator="in" result="s"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
        <filter id="${u}B2"><feGaussianBlur stdDeviation="2"/></filter><filter id="${u}B4"><feGaussianBlur stdDeviation="4"/></filter>
        <filter id="${u}B6"><feGaussianBlur stdDeviation="6"/></filter><filter id="${u}B10" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
        <filter id="${u}Sombra" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#7A3A10" flood-opacity=".35"/></filter>
        <marker id="${u}Seta" viewBox="0 0 10 10" refX="3.5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0,0.4 L10,5 L0,9.6 Q2.8,5 0,0.4z" fill="#F7B92E" stroke="#fff" stroke-width=".7" stroke-linejoin="round"/></marker>
      </defs>
      <g class="f-bases">
        <g class="f-base" data-v="A">${img('recortes/frente-fundo.jpg')}
          <g mask="url(#${u}M)"><g class="f-sq">${img('recortes/frente-fundo.jpg')}${lingua}<image href="${BASE}recortes/frente-camada.png" x="480" y="120" width="440" height="560"/></g></g></g>
        ${['U', 'O', 'M', 'F', 'I'].map((v) => `<g class="f-base" data-v="${v}" opacity="0">${img(`recortes/frente-${v}.jpg`)}
          <g mask="url(#${u}M)"><g class="f-sq">${img(`recortes/frente-${v}.jpg`)}</g></g></g>`).join('')}
      </g>
      <circle class="f-toque" r="46" fill="url(#${u}Toque)" opacity="0"/>
      <g class="f-ar" fill="none" stroke-linecap="round"></g>
      <g class="f-setas" filter="url(#${u}Sombra)">${[1, 2].map((i) => `<path class="f-s${i}w" fill="none" stroke="#fff" stroke-width="19" stroke-linecap="round" opacity=".9"/><path class="f-s${i}" fill="none" stroke="#F7B92E" stroke-width="11" stroke-linecap="round" marker-end="url(#${u}Seta)"/>`).join('')}</g>
      <g class="f-nariz" opacity="0"><rect x="${CX + 22}" y="30" width="236" height="46" rx="23" fill="#fff" stroke="#BFE0F5" stroke-width="2"/>
        <text x="${CX + 140}" y="62" text-anchor="middle" font-family="Fredoka,Andika,Nunito,sans-serif" font-weight="700" font-size="25" fill="#1B3160">ar pelo nariz</text></g>
      <circle class="f-marca" r="50" fill="rgba(255,224,138,.65)" opacity="0"/>
      <g class="f-alvos"><ellipse data-zona="lingua" cx="${CX}" cy="455" rx="165" ry="95" fill="transparent"/><ellipse data-zona="dentes" cx="${CX}" cy="180" rx="190" ry="48" fill="transparent"/><ellipse data-zona="labios" cx="${CX}" cy="648" rx="230" ry="36" fill="transparent"/></g>`;
    const frase = document.createElement('p'); frase.className = 'esp-frase'; frase.setAttribute('aria-live', 'polite');
    caixa.appendChild(svg); caixa.appendChild(frase); container.appendChild(caixa);
    const $ = (s) => svg.querySelector(s);
    const bases = {}; svg.querySelectorAll('.f-base').forEach((b) => { bases[b.dataset.v] = b; });
    const ouvintes = [];
    svg.addEventListener('click', (e) => { const el = e.target.closest('[data-zona]'); if (el) ouvintes.forEach((cb) => cb({ zona: el.dataset.zona })); });

    let id = P.F[opts.fonema] ? opts.fonema : 'a', lento = false, parado = false, congel = null;
    let tempo = 0, t0 = 0, marcaT = -9, ultimo = performance.now();
    let visDe = visema(id), visPara = visDe, trocaT = -9;
    const reduz = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
    const S = {}, V = {}; // estado da língua, com mola

    function mostraBases(de, para, a) {
      for (const v in bases) bases[v].setAttribute('opacity', v === para ? a : v === de ? 1 : 0);
      if (bases[para].nextSibling) bases[para].parentNode.appendChild(bases[para]); // a que entra fica por cima
    }
    function alvoLingua(f) {
      const L = LINGUA[f.id] || BAIXA, vel = lento ? 0.4 : 1, rz = reduz();
      let { yF, yB, ponta } = L;
      if (L.bate && !rz) { const ph = ((tempo * vel) % 1.0) / 1.0; ponta = lerp(ponta, 1, Math.exp(-Math.pow((ph - 0.4) / 0.09, 2))); }
      if (f.modo === 'plosiva' && !rz) { // fecha… e solta
        const ph = ((tempo * vel) % 2.0) / 2.0, solta = ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) : 0;
        if (L.toque === 'ponta') ponta -= 0.6 * solta; if (L.toque === 'fundo') yB += 105 * solta;
      }
      if (L.toque === 'raspa' && !rz) yB += Math.sin(tempo * 38) * 5;
      return { yF, yB, ponta, wt: L.wt, lateral: L.lateral ? 1 : 0 };
    }
    const seta = (i, d) => { $(`.f-s${i}`).setAttribute('d', d); $(`.f-s${i}w`).setAttribute('d', d); };

    function desenha() {
      if (parado) return;
      if (!svg.isConnected) { parado = true; return; }
      const agora = performance.now(), dtr = Math.min(0.1, (agora - ultimo) / 1000); ultimo = agora; tempo += dtr;
      const dt = dtr * (lento ? 0.45 : 1), rz = reduz(), f = P.F[id];

      // 1. ilustração do visema: crossfade ~180 ms + squash & stretch só na boca
      if (congel) mostraBases(visema(congel.a), visema(congel.b), clamp((congel.f - 0.3) / 0.4, 0, 1));
      else {
        const a = rz ? 1 : clamp((tempo - trocaT) / (lento ? 0.4 : 0.18), 0, 1);
        mostraBases(visDe, visPara, a);
        const dtc = tempo - trocaT, sq = rz || dtc > 0.9 ? 0 : Math.exp(-dtc * 6.5) * Math.sin(dtc * 21) * 0.022;
        const tr = sq ? `translate(${CX},372) scale(${(1 - sq).toFixed(4)},${(1 + sq).toFixed(4)}) translate(${-CX},-372)` : '';
        bases[visPara].querySelector('.f-sq').setAttribute('transform', tr);
      }
      const vis = congel ? (congel.f > 0.5 ? visema(congel.b) : visema(congel.a)) : visPara;

      // 2. língua (só na boca aberta)
      const T = congel ? congel.T : alvoLingua(f);
      for (const c in T) {
        if (S[c] === undefined || congel || rz) { S[c] = T[c]; V[c] = 0; continue; }
        const kk = c === 'ponta' ? 300 : 140, am = 2 * Math.sqrt(kk) * 0.7;
        V[c] += (kk * (T[c] - S[c]) - am * V[c]) * dt; S[c] += V[c] * dt;
      }
      const yF = S.yF, yB = S.yB, ponta = clamp(S.ponta, 0, 1.05), wt = S.wt, lat = S.lateral;
      const w = 160 - 14 * lat, wB = 138;
      // fundo (dorso): um morro mais escuro lá atrás
      $('.f-fundo').setAttribute('d', `M${CX - wB},620 C${CX - wB - 12},${yB + 175} ${CX - wB * 0.6},${yB - 4} ${CX},${yB - 4} C${CX + wB * 0.6},${yB - 4} ${CX + wB + 12},${yB + 175} ${CX + wB},620 Z`);
      $('.f-fundo-luz').setAttribute('d', `M${CX - 62},${yB + 34} Q${CX - 10},${yB + 16} ${CX + 40},${yB + 24}`);
      $('.f-fundo-luz').setAttribute('opacity', clamp((yF - yB - 30) / 80, 0, 0.6));
      // frente: almofada gordinha (lados caem no "l" e no "lh")
      const yLado = yF + 46 + 40 * lat;
      $('.f-corpo').setAttribute('d', `M${CX - w - 6},625 C${CX - w - 14},${yLado + 70} ${CX - w * 0.86},${yLado - 8} ${CX - w * 0.5},${yF + 8} C${CX - w * 0.24},${yF - 5} ${CX + w * 0.24},${yF - 5} ${CX + w * 0.5},${yF + 8} C${CX + w * 0.86},${yLado - 8} ${CX + w + 14},${yLado + 70} ${CX + w + 6},625 Z`);
      $('.f-sulco').setAttribute('d', ponta > 0.45 ? '' : `M${CX},${yF + 20} Q${CX - 4},${yF + 62} ${CX},${yF + 104}`);
      $('.f-brilho').setAttribute('d', `M${CX - w * 0.55},${yF + 40} Q${CX - w * 0.3},${yF + 16} ${CX - w * 0.05},${yF + 18}`);
      $('.f-brilho').setAttribute('opacity', ponta > 0.45 ? 0 : 0.75);
      const pt = $('.f-ponto'); pt.setAttribute('cx', CX + w * 0.32); pt.setAttribute('cy', yF + 30); pt.setAttribute('opacity', ponta > 0.45 ? 0 : 0.7);
      // ponta que sobe: vê-se a parte de baixo da língua (mais clara), com o freio no meio
      const yT = lerp(yF + 30, 214, ponta), mostra = clamp((ponta - 0.08) * 3, 0, 1), wb = w * 0.9;
      if (mostra > 0) {
        const yBase = yF + 62;
        $('.f-ponta').setAttribute('d', `M${CX - wb},625 L${CX - wb},${yBase + 40} C${CX - wb},${yBase - 30} ${CX - wt - 26},${lerp(yBase, yT, 0.45)} ${CX - wt - 6},${yT + 74} C${CX - wt + 2},${yT + 6} ${CX - wt * 0.55},${yT - 6} ${CX},${yT - 8} C${CX + wt * 0.55},${yT - 6} ${CX + wt - 2},${yT + 6} ${CX + wt + 6},${yT + 74} C${CX + wt + 26},${lerp(yBase, yT, 0.45)} ${CX + wb},${yBase - 30} ${CX + wb},${yBase + 40} L${CX + wb},625 Z`);
        $('.f-freio').setAttribute('d', `M${CX},${lerp(yBase, yT, 0.12)} Q${CX - 6},${lerp(yBase, yT, 0.4)} ${CX},${lerp(yBase, yT, 0.62)}`);
        $('.f-ponta-luz').setAttribute('d', `M${CX - wt * 0.62},${yT + 44} Q${CX - wt * 0.5},${yT + 16} ${CX - wt * 0.1},${yT + 14}`);
        const ps = $('.f-ponta-sombra'); ps.setAttribute('cy', yF + 96); ps.setAttribute('opacity', 0.4 * mostra);
      } else { $('.f-ponta').setAttribute('d', ''); $('.f-freio').setAttribute('d', ''); $('.f-ponta-luz').setAttribute('d', ''); $('.f-ponta-sombra').setAttribute('opacity', 0); }
      ['.f-ponta', '.f-freio', '.f-ponta-luz'].forEach((s) => $(s).setAttribute('opacity', s === '.f-freio' ? 0.55 * mostra : s === '.f-ponta-luz' ? 0.7 * mostra : mostra));

      // 3. brilho no ponto de contato, setas, ar e frase
      const L = LINGUA[id] || BAIXA, pulso = rz ? 1 : 0.85 + 0.15 * Math.sin(tempo * 6);
      let tq = null, s1 = '', s2 = '', ar = [];
      if (vis === 'A') {
        if (L.toque === 'ponta') { tq = [CX, yT + 6, ponta > 0.85 ? 1 : 0]; s1 = `M${CX + 205},${yF + 60} Q${CX + 190},${yT + 60} ${CX + wt + 34},${yT + 22}`; }
        else if (L.toque === 'fundo') { tq = [CX, yB + 4, yB < 320 ? 1 : 0]; s1 = `M${CX + 196},${yB + 190} Q${CX + 186},${yB + 60} ${CX + 92},${yB + 26}`; }
        else if (L.toque === 'meio') { tq = [CX, yF + 2, 1]; s1 = `M${CX + 205},${yF + 170} Q${CX + 200},${yF + 60} ${CX + 110},${yF + 22}`; }
        else if (L.toque === 'raspa') { tq = [CX, yB - 8, 0.6]; s1 = `M${CX + 196},${yB + 170} Q${CX + 186},${yB + 50} ${CX + 92},${yB + 16}`; }
        else s1 = `M${CX + 150},${yF - 150} Q${CX + 180},${yF - 60} ${CX + 105},${yF - 2}`; // vogal aberta: a língua desce
        if (L.lateral) { s2 = `M${CX - 96},${yF + 10} Q${CX - 170},${yF + 30} ${CX - 196},${yF + 96}`; s1 = `M${CX + 96},${yF + 10} Q${CX + 170},${yF + 30} ${CX + 196},${yF + 96}`; }
        if (f.vel > 0.5) s2 = `M${CX - 30},130 Q${CX - 40},92 ${CX + 14},70`;
      } else if (vis === 'M') {
        s1 = `M${CX + 150},226 Q${CX + 176},290 ${CX + 118},326`; s2 = `M${CX + 150},470 Q${CX + 176},404 ${CX + 118},368`;
        if (f.ar === 'nasal') { s1 = `M${CX + 150},470 Q${CX + 176},404 ${CX + 118},368`; s2 = `M${CX},236 Q${CX - 40},150 ${CX + 40},100`; }
        tq = [CX, 346, f.modo === 'plosiva' ? 0.5 : 0.8];
      } else if (vis === 'F') {
        s1 = `M${CX + 190},486 Q${CX + 200},404 ${CX + 96},380`; tq = [CX, 366, 0.8];
        ar = [[CX - 60, 392, -34, 62], [CX, 398, 0, 70], [CX + 60, 392, 34, 62]];
      } else if (vis === 'I') {
        const zs = id === 's' || id === 'z';
        s1 = `M${CX + 205},505 Q${CX + 300},508 ${CX + 322},418`; s2 = `M${CX - 205},505 Q${CX - 300},508 ${CX - 322},418`;
        if (zs) { ar = [[CX - 46, 420, -30, 66], [CX, 424, 0, 76], [CX + 46, 420, 30, 66]]; tq = [CX, 410, 0.45]; }
      } else { // U e O: biquinho (os lados vêm para o meio)
        const cy = vis === 'U' ? 392 : 412, dx = vis === 'U' ? 250 : 262;
        s1 = `M${CX + dx + 70},${cy - 96} Q${CX + dx + 30},${cy - 22} ${CX + dx - 62},${cy - 4}`; s2 = `M${CX - dx - 70},${cy - 96} Q${CX - dx - 30},${cy - 22} ${CX - dx + 62},${cy - 4}`;
        if (id === 'x' || id === 'j') ar = [[CX - 30, cy + 6, -22, 70], [CX, cy + 10, 0, 80], [CX + 30, cy + 6, 22, 70]];
      }
      seta(1, s1); seta(2, s2);
      $('.f-setas').setAttribute('opacity', rz || congel ? 1 : clamp((tempo - t0 - 0.25) * 4, 0, 1) * (0.86 + 0.14 * Math.sin(tempo * 3.2)));
      const g = $('.f-toque');
      if (tq) { g.setAttribute('cx', tq[0]); g.setAttribute('cy', tq[1]); g.setAttribute('opacity', tq[2] * pulso); g.setAttribute('r', 44 * (0.9 + 0.2 * pulso)); } else g.setAttribute('opacity', 0);
      $('.f-nariz').setAttribute('opacity', f.ar === 'nasal' || f.ar === 'oral+nasal' ? 1 : 0);
      const ph = rz ? 0.5 : (tempo * (lento ? 0.5 : 1.1)) % 1;
      $('.f-ar').innerHTML = ar.map(([x, y, dx, dy], i) => { const a = (ph + i * 0.21) % 1, b = Math.min(1, a + 0.34);
        return `<line x1="${x + dx * a}" y1="${y + dy * a}" x2="${x + dx * b}" y2="${y + dy * b}" stroke="#fff" stroke-width="9" opacity="${0.95 * Math.sin(a * Math.PI)}"/><line x1="${x + dx * a}" y1="${y + dy * a}" x2="${x + dx * b}" y2="${y + dy * b}" stroke="#8FD0F7" stroke-width="5" opacity="${Math.sin(a * Math.PI)}"/>`; }).join('');
      if (frase.textContent !== f.frase) frase.textContent = f.frase;
      const mt = tempo - marcaT; $('.f-marca').setAttribute('opacity', mt < 2 ? 1 - mt / 2 : 0);
      requestAnimationFrame(desenha);
    }
    requestAnimationFrame(desenha);

    return {
      tipo: 'frente', el: caixa,
      fonema(n, { instantaneo = false } = {}) {
        if (!P.F[n]) return; congel = null;
        const v = visema(n);
        if (v !== visPara) { visDe = visPara; visPara = v; trocaT = instantaneo ? -9 : tempo; }
        id = n; t0 = tempo; if (instantaneo) for (const c in S) delete S[c];
      },
      lento(v) { lento = !!v; }, rotulos() {}, quem() {},
      destacar(zona, ok = true) { const el = $(`.f-alvos [data-zona=${zona}]`); if (!el) return; const c = $('.f-marca'); c.setAttribute('cx', el.getAttribute('cx')); c.setAttribute('cy', el.getAttribute('cy')); c.setAttribute('fill', ok ? 'rgba(255,224,138,.7)' : 'rgba(168,213,242,.7)'); marcaT = tempo; },
      onToque(cb) { ouvintes.push(cb); },
      // quadro parado entre dois sons (para as tiras de transição): f de 0 a 1
      pose(a, b, fr) {
        const A = LINGUA[a] || BAIXA, B = LINGUA[b] || BAIXA, k = P.suave(clamp(fr, 0, 1));
        id = fr > 0.5 ? b : a; t0 = tempo - 9;
        congel = { a, b, f: fr, T: { yF: lerp(A.yF, B.yF, k), yB: lerp(A.yB, B.yB, k), ponta: lerp(A.ponta, B.ponta, k), wt: lerp(A.wt, B.wt, k), lateral: lerp(A.lateral ? 1 : 0, B.lateral ? 1 : 0, k) } };
      },
      solta() { congel = null; },
      destruir() { parado = true; caixa.remove(); }
    };
  }
  global.EspelhoFrente = { criar, visema };
})(window);
