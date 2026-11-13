/* FONEMA · Espelho do Som — VISTA DE FRENTE no estilo "Boca gigante" (D020).
 *
 * Fundo: estilos-opcoes/base-frente-boca-vazia.png (boca grande e fofa, Sofia e Tales apontando).
 * recortar.py gera a camada da frente com a cavidade vazada (recortes/frente-camada.png): a língua animada é
 * desenhada ENTRE o fundo e essa camada, então dentes e lábios da ilustração ficam sempre na frente dela.
 * Por cima: lábios animados (fecham no M/P/B, biquinho no U/O, lábio de baixo nos dentes no F/V), seta amarela
 * curva e uma frase curtinha ("A língua sobe!"). Transições com mola (spring); a ponta do "r" bate rapidinho.
 * As posições vêm de fonemas.js (FonemasPT): a vista de frente é uma leitura simplificada da posição de lado.
 * POSIÇÕES SIMPLIFICADAS — VALIDAR COM FONOAUDIÓLOGA.
 *
 *   const fr = EspelhoFrente.criar(div, { fonema: 'a' });  fr.fonema('t');  fr.lento(true);
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');
  const CX = 697, CY = 357, IRX = 236, IRY = 246; // centro e raios da borda de dentro dos lábios (pixels da imagem)
  const VOGAL = (f) => f.modo === 'vogal';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // frase e seta de cada som
  function dica(f) {
    const id = f.id.replace('~', '');
    if (['p', 'b', 'm'].includes(id)) return ['labios', id === 'm' ? 'Os lábios fecham, e o som sai pelo nariz!' : 'Os lábios fecham… e abrem!'];
    if (['f', 'v'].includes(id)) return ['ld', 'Dentes de cima no lábio de baixo!'];
    if (id === 'r') return ['sobe', 'A pontinha bate rapidinho!'];
    if (['t', 'd', 'n', 'l'].includes(id)) return ['sobe', id === 'l' ? 'A língua sobe! O ar passa pelos ladinhos.' : 'A ponta da língua sobe!'];
    if (['s', 'z'].includes(id)) return ['sorri', 'Dentes juntinhos… e o ar sai fininho!'];
    if (['x', 'j'].includes(id)) return ['bico', 'Biquinho, e a língua sobe um pouco!'];
    if (['nh', 'lh'].includes(id)) return ['meio', 'O meio da língua sobe!'];
    if (['k', 'g'].includes(id)) return ['fundo', 'O fundo da língua sobe lá atrás!'];
    if (id === 'rr') return ['garganta', 'O som raspa lá no fundo!'];
    if (['u', 'o', 'O'].includes(id)) return ['bico', id === 'u' ? 'Biquinho bem fechadinho!' : 'Boca redondinha!'];
    if (['i', 'e'].includes(id)) return ['sorri', 'Sorriso! A língua sobe na frente.'];
    if (f.vel > 0.5) return ['nariz', 'O som sai pela boca e pelo nariz!'];
    return ['deita', 'Boca aberta, a língua deitadinha!'];
  }

  // forma dos lábios (visema) → ilustração: A = boca aberta (com a língua animada); U, O, M, F, I = bases prontas
  const VISEMA = { U: 'u u~', O: 'o o~ O x j', M: 'p b m', F: 'f v', I: 'i i~ e e~ s z' };
  function visema(id) { for (const [v, ids] of Object.entries(VISEMA)) if (ids.split(' ').includes(id)) return v; return 'A'; }

  function criar(container, opts = {}) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'esp-svg esp-frente'); svg.setAttribute('role', 'img');
    svg.setAttribute('viewBox', opts.viewBox || '96 0 1184 768'); svg.setAttribute('preserveAspectRatio', opts.viewBox ? 'xMidYMid meet' : 'xMidYMid slice');
    svg.setAttribute('aria-label', 'Boca gigante de frente, com a língua mostrando a posição do som');
    svg.innerHTML = `
      <defs>
        <radialGradient id="fLing" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#FFA79B"/><stop offset=".45" stop-color="#FB8576"/><stop offset=".85" stop-color="#EE6A60"/><stop offset="1" stop-color="#D9534F"/></radialGradient>
        <linearGradient id="fBaixo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB2A8"/><stop offset=".35" stop-color="#FC9183"/><stop offset="1" stop-color="#F3786C"/></linearGradient>
        <radialGradient id="fLabC" cx="50%" cy="92%" r="75%"><stop offset="0" stop-color="#FBB7B2"/><stop offset=".45" stop-color="#F29C98"/><stop offset="1" stop-color="#DE7B7E"/></radialGradient>
        <radialGradient id="fLabB" cx="50%" cy="10%" r="75%"><stop offset="0" stop-color="#FCBDB8"/><stop offset=".45" stop-color="#F4A19D"/><stop offset="1" stop-color="#DE7B7E"/></radialGradient>
        <clipPath id="fBoca"><ellipse class="f-clip" cx="${CX}" cy="${CY}" rx="${IRX}" ry="${IRY}"/></clipPath>
        <radialGradient id="fCanto"><stop offset="0" stop-color="#B9525E" stop-opacity=".55"/><stop offset="1" stop-color="#B9525E" stop-opacity="0"/></radialGradient>
        <radialGradient id="fLuz"><stop offset="0" stop-color="#FFF1EE" stop-opacity=".85"/><stop offset="1" stop-color="#FFF1EE" stop-opacity="0"/></radialGradient>
        <filter id="fSombraIn" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="borda"/>
          <feFlood flood-color="#B8424A" flood-opacity=".7"/><feComposite in2="borda" operator="in" result="s"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
        <filter id="fBorrao"><feGaussianBlur stdDeviation="4"/></filter>
        <filter id="fSombra" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#7A3A10" flood-opacity=".35"/></filter>
        <marker id="fPonta" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Q3,5 0,0z" fill="#F7B92E" stroke="#fff" stroke-width=".8"/></marker>
      </defs>
      <g class="f-boca">
      <g class="f-base" data-v="A">
      <image href="${BASE}recortes/frente-fundo.jpg" x="0" y="0" width="1376" height="768"/>
      <g class="f-lingua" filter="url(#fSombraIn)"><path class="f-corpo" fill="url(#fLing)"/><path class="f-ponta" fill="url(#fBaixo)"/></g>
      <path class="f-freio" fill="none" stroke="#E07070" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <path class="f-sulco" fill="none" stroke="#D45A5E" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <path class="f-brilho" fill="none" stroke="#FFF1EC" stroke-width="16" stroke-linecap="round" opacity=".7" filter="url(#fBorrao)"/>
      <image href="${BASE}recortes/frente-camada.png" x="0" y="0" width="1376" height="768"/>
      </g>
      ${['U', 'O', 'M', 'F', 'I'].map((v) => `<image class="f-base" data-v="${v}" href="${BASE}estilos-opcoes/base-frente-${v}.png" x="0" y="0" width="1376" height="768"/>`).join('')}
      </g>
      <g clip-path="url(#fBoca)" display="none">
        <path class="f-anel" fill="url(#fLabC)" fill-rule="evenodd"/>
        <path class="f-lab-c" fill="url(#fLabC)"/><path class="f-lab-c-borda" fill="none" stroke="#C9606A" stroke-width="5" stroke-linecap="round"/>
        <path class="f-lab-b" fill="url(#fLabB)"/><path class="f-lab-b-borda" fill="none" stroke="#C9606A" stroke-width="5" stroke-linecap="round"/>
        <path class="f-lab-luz" fill="none" stroke="#FFD9D6" stroke-width="10" stroke-linecap="round" opacity=".7" filter="url(#fBorrao)"/>
        <g class="f-fechada"><path class="f-contato-sombra" fill="none" stroke="#B4505C" stroke-width="22" stroke-linecap="round" opacity=".35" filter="url(#fBorrao)"/>
          <path class="f-contato" fill="none" stroke="#B4505C" stroke-width="7" stroke-linecap="round"/>
          <ellipse class="f-canto-e" rx="90" ry="120" fill="url(#fCanto)"/><ellipse class="f-canto-d" rx="90" ry="120" fill="url(#fCanto)"/>
          <ellipse class="f-luz-c" rx="120" ry="34" fill="url(#fLuz)"/><ellipse class="f-luz-b" rx="130" ry="44" fill="url(#fLuz)"/></g>
      </g>
      <g class="f-setas" filter="url(#fSombra)"><path class="f-seta1" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" opacity=".85"/><path class="f-seta1b" fill="none" stroke="#F7B92E" stroke-width="12" stroke-linecap="round" marker-end="url(#fPonta)"/>
        <path class="f-seta2" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" opacity=".85"/><path class="f-seta2b" fill="none" stroke="#F7B92E" stroke-width="12" stroke-linecap="round" marker-end="url(#fPonta)"/></g>
      <text class="f-nariz-txt" x="${CX + 70}" y="40" font-family="Fredoka,Andika,sans-serif" font-weight="700" font-size="28" fill="#1B3160" stroke="#fff" stroke-width="6" paint-order="stroke">👃 ar pelo nariz</text>
      <g class="f-frase" transform="translate(${CX},716)"><rect rx="26" y="-26" height="52" fill="#FFF3EE" stroke="#F4C9C0" stroke-width="2"/><text text-anchor="middle" y="11" font-family="Fredoka,Andika,sans-serif" font-weight="700" font-size="30" fill="#1B3160"></text></g>
      <circle class="f-marca" r="46" fill="rgba(255,224,138,.65)" opacity="0"/>
      <g class="f-alvos"><ellipse data-zona="lingua" cx="${CX}" cy="430" rx="170" ry="110" fill="transparent"/><ellipse data-zona="dentes" cx="${CX}" cy="175" rx="190" ry="45" fill="transparent"/><ellipse data-zona="labios" cx="${CX}" cy="640" rx="230" ry="35" fill="transparent"/></g>`;
    container.appendChild(svg);
    const $ = (s) => svg.querySelector(s);
    const ouvintes = [];
    svg.addEventListener('click', (e) => { const el = e.target.closest('[data-zona]'); if (el) ouvintes.forEach((cb) => cb({ zona: el.dataset.zona })); });

    let visAtual = null, trocaT = -9;
    let id = opts.fonema || 'a', lento = false, parado = false, congel = null, tempo = 0, t0 = 0, marcaT = -9, ultimo = performance.now();
    let de = P.pose(id), para = de, atual = de;
    const reduz = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
    // estado com mola
    const S = {}, V = {};
    function alvo(o, f) {
      const lin = o.lin.map((p) => p.slice()), vel = lento ? 0.4 : 1, rz = reduz(), pronto = (o._k ?? 1) > 0.7 ? 1 : 0;
      let solta = 0;
      if (f.modo === 'tepe' && !rz) { const ph = ((tempo * vel) % 0.9) / 0.9, b = Math.exp(-Math.pow((ph - 0.35) / 0.075, 2)) * pronto; lin[0][1] += (0.5 - lin[0][1]) * b; }
      if (f.modo === 'plosiva' && !rz) { const ph = ((tempo * vel) % 1.8) / 1.8; solta = ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) * pronto : 0; if (['t', 'd'].includes(f.id)) lin[0][1] -= 0.55 * solta; if (['k', 'g'].includes(f.id)) lin[3][1] -= 0.6 * solta; }
      const sup = lin; // de frente a abertura da ilustração é fixa: usa a posição da língua sem girar a mandíbula
      const tipY = sup[0][1], frontY = Math.max(sup[1][1], sup[2][1]), backY = sup[3][1];
      const yb = 505 - clamp(Math.max(frontY * 0.9, backY) + 0.45, 0, 1.75) * 132;
      const sobe = clamp((tipY + 0.1) / 0.6, 0, 1);
      const yT = lerp(yb + 40, 218, sobe);
      const hw = 172 * (VOGAL(f) && o.arr > 0.5 ? 0.92 : 1) * (f.id === 'a' || f.id === 'a~' ? 1.06 : 1);
      const lado = f.ar === 'lateral' ? 70 : 18;
      const ab = o.ab + (['p', 'b'].includes(f.id) ? 0.5 * solta : 0);
      const fecha = 1 - clamp(ab / 0.14, 0, 1);
      const abF = VOGAL(f) ? ab : Math.max(ab, 0.62);
      let yL = lerp(616, 410, 1 - clamp(abF, 0, 1));
      yL = lerp(yL, 226, o.ld);
      const yU = lerp(104, CY - 2, fecha); yL = lerp(yL, CY + 2, fecha);
      const bico = clamp(o.arr, 0, 1);
      return { yb, yT, sobe, hw, lado, yU, yL, bico, fundo: clamp((backY - frontY) / 0.6, 0, 1), solta, fecha };
    }

    function desenha() {
      if (parado) return;
      if (!svg.isConnected) { parado = true; return; }
      const agora = performance.now(), dtr = Math.min(0.1, (agora - ultimo) / 1000); ultimo = agora; tempo += dtr;
      const dt = dtr * (lento ? 0.4 : 1);
      const k = congel ? (congel._k ?? 1) : Math.min(1, (tempo - t0) / (lento ? 1.7 : 0.55));
      const o = congel || P.mistura(de, para, P.suave(k)); if (!congel) atual = o; o._k = k;
      const f = P.F[id], T = alvo(o, f);
      // VISEMA: troca a ilustração da boca (crossfade ~180 ms) com um "squash & stretch" pequenininho
      const vis = visema(id);
      if (vis !== visAtual) { visAtual = vis; trocaT = tempo; svg.querySelectorAll('.f-base').forEach((b) => b.classList.toggle('on', b.dataset.v === vis)); }
      { const dtc = tempo - trocaT, a = reduz() ? 0 : Math.exp(-dtc * 7) * Math.sin(dtc * 22) * 0.035;
        $('.f-boca').setAttribute('transform', `translate(${CX},${CY}) scale(${(1 - a).toFixed(4)},${(1 + a).toFixed(4)}) translate(${-CX},${-CY})`); }
      // molas: suaves e com um quique pequenininho; a ponta do "r" é mais rápida
      for (const c in T) {
        if (S[c] === undefined || congel || reduz()) { S[c] = T[c]; V[c] = 0; continue; }
        const kk = c === 'yT' ? 320 : 150, amort = 2 * Math.sqrt(kk) * 0.72;
        V[c] += (kk * (T[c] - S[c]) - amort * V[c]) * dt; S[c] += V[c] * dt;
      }
      const { yb, yT, sobe, hw, lado, yU, yL, bico, fundo, fecha } = S;
      const lc = 30 * (1 - fecha), lb = 34 * (1 - fecha);
      // corpo da língua (visto de frente): domo gordinho; lados mais baixos no "l"
      const yS = yb + lado + 30, base = 640;
      $('.f-corpo').setAttribute('d', `M${CX - hw - 20},${base} C${CX - hw - 25},${yS + 60} ${CX - hw * 0.8},${yS - 4} ${CX - hw * 0.45},${yb + 8} C${CX - hw * 0.2},${yb - 4} ${CX + hw * 0.2},${yb - 4} ${CX + hw * 0.45},${yb + 8} C${CX + hw * 0.8},${yS - 4} ${CX + hw + 25},${yS + 60} ${CX + hw + 20},${base} Z`);
      // ponta que sobe (vê-se a parte de baixo, mais clarinha, com o "freio")
      const wb = hw * 0.86, wt = 58;
      if (sobe > 0.04) {
        const baseP = yb + 46, mid = lerp(baseP, yT, 0.55);
        // a ponta sobe afinando (lados curvos), como uma gota de cabeça para cima
        $('.f-ponta').setAttribute('d', `M${CX - wb},640 L${CX - wb},${baseP + 30} C${CX - wb * 0.62},${baseP - 4} ${CX - wt - 24},${mid + 20} ${CX - wt},${yT + 26} Q${CX - wt + 4},${yT - 10} ${CX},${yT - 12} Q${CX + wt - 4},${yT - 10} ${CX + wt},${yT + 26} C${CX + wt + 24},${mid + 20} ${CX + wb * 0.62},${baseP - 4} ${CX + wb},${baseP + 30} L${CX + wb},640 Z`);
        $('.f-ponta').setAttribute('opacity', clamp(sobe * 2, 0, 1));
        $('.f-freio').setAttribute('d', `M${CX},${baseP + 10} Q${CX - 5},${lerp(baseP, yT, 0.4)} ${CX},${lerp(baseP, yT, 0.6)}`); $('.f-freio').setAttribute('opacity', 0.5 * clamp(sobe * 2, 0, 1));
      } else { $('.f-ponta').setAttribute('d', ''); $('.f-freio').setAttribute('d', ''); }
      $('.f-sulco').setAttribute('d', sobe > 0.5 ? '' : `M${CX},${yb + 20} Q${CX - 4},${yb + 70} ${CX},${yb + 120}`);
      $('.f-brilho').setAttribute('d', `M${CX - hw * 0.5},${yb + 34} Q${CX - hw * 0.15},${yb + 14} ${CX + hw * 0.1},${yb + 18}`);
      $('.f-brilho').setAttribute('opacity', 0.75 - fundo * 0.3);
      // lábios: cortina de cima, de baixo e o anel do biquinho (recortados pela borda da boca)
      const curva = 14;
      $('.f-lab-c').setAttribute('d', `M${CX - IRX - 10},0 L${CX + IRX + 10},0 L${CX + IRX + 10},${yU - lc - 30 * fecha} Q${CX},${yU + curva * (1 - fecha) + 30 * fecha} ${CX - IRX - 10},${yU - lc - 30 * fecha} Z`);
      $('.f-lab-c-borda').setAttribute('d', yU > 120 && fecha < 0.6 ? `M${CX - IRX},${yU - lc} Q${CX},${yU + curva * (1 - fecha)} ${CX + IRX},${yU - lc}` : '');
      $('.f-lab-b').setAttribute('d', `M${CX - IRX - 10},768 L${CX + IRX + 10},768 L${CX + IRX + 10},${yL + lb - 30 * fecha} Q${CX},${yL - curva * (1 - fecha) + 30 * fecha} ${CX - IRX - 10},${yL + lb - 30 * fecha} Z`);
      $('.f-lab-b-borda').setAttribute('d', yL < 600 && fecha < 0.6 ? `M${CX - IRX},${yL + lb} Q${CX},${yL - curva * (1 - fecha)} ${CX + IRX},${yL + lb}` : '');
      $('.f-lab-luz').setAttribute('d', yL < 600 ? `M${CX - 90},${yL + 24} Q${CX},${yL + 2} ${CX + 70},${yL + 22}` : '');
      { // lábios fechados: linha de contato sorridente, volume e brilho
        const g = $('.f-fechada'); g.setAttribute('opacity', clamp((fecha - 0.4) / 0.6, 0, 1));
        const yc = (yU + yL) / 2, smile = `M${CX - IRX},${yc - 30} Q${CX},${yc + 30} ${CX + IRX},${yc - 30}`;
        $('.f-contato').setAttribute('d', smile); $('.f-contato-sombra').setAttribute('d', `M${CX - 180},${yc - 6} Q${CX},${yc + 60} ${CX + 180},${yc - 6}`);
        const at = (sel, x, y) => { $(sel).setAttribute('cx', x); $(sel).setAttribute('cy', y); };
        at('.f-luz-c', CX - 30, yc - 70); at('.f-luz-b', CX - 10, yc + 105); at('.f-canto-e', CX - IRX + 40, yc - 20); at('.f-canto-d', CX + IRX - 40, yc - 20);
        $('.f-clip').setAttribute('rx', IRX + 18 * fecha); $('.f-clip').setAttribute('ry', IRY + 14 * fecha);
        $('.f-lab-luz').setAttribute('opacity', 0.7 * (1 - fecha));
      }
      $('.f-nariz-txt').setAttribute('opacity', (f.ar === 'nasal' || f.ar === 'oral+nasal') ? 1 : 0);
      const hrx = IRX * (1 - 0.6 * bico), hry = IRY * (1 - 0.5 * bico), hcy = lerp(CY, (yU + yL) / 2, 0.5);
      $('.f-anel').setAttribute('d', bico > 0.03 ? `M${CX - IRX - 20},${CY} a${IRX + 20},${IRY + 20} 0 1,0 ${2 * IRX + 40},0 a${IRX + 20},${IRY + 20} 0 1,0 ${-2 * IRX - 40},0 Z M${CX - hrx},${hcy} a${hrx},${hry} 0 1,0 ${2 * hrx},0 a${hrx},${hry} 0 1,0 ${-2 * hrx},0 Z` : '');
      // seta amarela e frase
      const [tipo, frase] = dica(f);
      const s1 = $('.f-seta1'), s1b = $('.f-seta1b'), s2 = $('.f-seta2'), s2b = $('.f-seta2b');
      let a1 = '', a2 = '';
      if (tipo === 'sobe' || tipo === 'meio') a1 = `M${CX + 190},${yb + 70} Q${CX + 150},${yT - 30} ${CX + wt + 30},${(tipo === 'meio' ? yb : yT) + 6}`;
      if (tipo === 'fundo' || tipo === 'garganta') a1 = `M${CX + 150},${yb + 110} Q${CX + 130},${yb - 10} ${CX + 40},${yb - 30}`;
      if (tipo === 'deita') a1 = `M${CX + 120},${yb - 110} Q${CX + 150},${yb - 40} ${CX + 90},${yb - 4}`;
      if (tipo === 'sorri') { a1 = `M${CX + 330},${CY + 60} Q${CX + 330},${CY - 30} ${CX + 270},${CY - 40}`; a2 = `M${CX - 330},${CY + 60} Q${CX - 330},${CY - 30} ${CX - 270},${CY - 40}`; }
      if (tipo === 'labios') { a1 = `M${CX + 250},${CY - 120} Q${CX + 270},${CY - 50} ${CX + 220},${CY - 14}`; a2 = f.ar === 'nasal' ? `M${CX - 20},${CY - 110} Q${CX - 70},${CY - 230} ${CX + 20},${40}` : `M${CX + 250},${CY + 120} Q${CX + 270},${CY + 50} ${CX + 220},${CY + 14}`; }
      if (tipo === 'ld') a1 = `M${CX + 250},${CY + 150} Q${CX + 270},${CY + 40} ${CX + 120},${CY + 10}`;
      if (tipo === 'bico') { a1 = `M${CX + 300},${CY - 30} Q${CX + 260},${CY - 70} ${CX + 160},${CY - 20}`; a2 = `M${CX - 300},${CY - 30} Q${CX - 260},${CY - 70} ${CX - 160},${CY - 20}`; }
      if (tipo === 'nariz') a1 = `M${CX + 40},${yb - 60} Q${CX - 60},${140} ${CX + 20},${30}`;
      [[s1, s1b, a1], [s2, s2b, a2]].forEach(([w, y, d]) => { w.setAttribute('d', d); y.setAttribute('d', d); });
      const dash = 900, prog = reduz() ? 1 : clamp(((tempo - t0) * (lento ? 0.5 : 1.3)) % 2.4, 0, 1);
      [s1, s1b, s2, s2b].forEach((p) => { p.style.strokeDasharray = dash; p.style.strokeDashoffset = dash * (1 - P.suave(prog)); });
      const tx = $('.f-frase text'); if (tx.textContent !== frase) { tx.textContent = frase; const w = frase.length * 15.5 + 50; const r = $('.f-frase rect'); r.setAttribute('x', -w / 2); r.setAttribute('width', w); }
      const mt = tempo - marcaT; $('.f-marca').setAttribute('opacity', mt < 2 ? 1 - mt / 2 : 0);
      requestAnimationFrame(desenha);
    }
    requestAnimationFrame(desenha);

    return {
      tipo: 'frente',
      fonema(n, { instantaneo = false } = {}) { if (!P.F[n]) return; de = atual; para = P.pose(n); id = n; t0 = tempo; congel = null; if (instantaneo) { de = para; for (const c in S) delete S[c]; } },
      lento(v) { lento = !!v; }, rotulos() {}, girar() {}, modo() {}, personagem() {},
      destacar(zona, ok = true) { const el = $(`.f-alvos [data-zona=${zona}]`); if (!el) return; const c = $('.f-marca'); c.setAttribute('cx', el.getAttribute('cx')); c.setAttribute('cy', el.getAttribute('cy')); c.setAttribute('fill', ok ? 'rgba(255,224,138,.7)' : 'rgba(168,213,242,.7)'); marcaT = tempo; },
      onToque(cb) { ouvintes.push(cb); },
      pose(a, b, f) { id = b; congel = Object.assign(P.mistura(P.pose(a), P.pose(b), P.suave(f)), { _k: f }); t0 = tempo - 1; },
      solta() { congel = null; },
      destruir() { parado = true; svg.remove(); }
    };
  }
  global.EspelhoFrente = { criar };
})(window);
