/* FONEMA · Espelho do Som — VISTA DE LADO, estilo "3D fofinho" (D020).
 *
 * Fundo: a Sofia (ou o Tales) de perfil, em 3D de filme de animação (recortes/lado-<quem>.jpg). Por cima,
 * uma JANELINHA translúcida na bochecha mostra a boca por dentro, desenhada por código nas posições de
 * fonemas.js: dentes de perfil, céu da boca, véu que sobe e desce, língua coral com volume, lábios, ar
 * (boca/nariz) e ondinhas de voz. Brilho no ponto de contato e seta amarela na parte que se mexe.
 *
 * Coordenadas (as de fonemas.js): corte do meio da cabeça, rosto olhando para a direita; z = frente(+),
 * y = cima(+); origem = meio da boca, entre os lábios. px = O + (z, −y)·S.
 * POSIÇÕES SIMPLIFICADAS — VALIDAR COM FONOAUDIÓLOGA.
 *
 *   const ld = EspelhoLado.criar(div, { fonema: 'l', quem: 'sofia' });  ld.fonema('k');  ld.quem('tales');
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  let nInst = 0;

  const OX = 1130, OY = 760; // meio dos lábios na imagem 1800×1200 (recortar.py alinha as duas crianças)
  // por personagem: escala (px por unidade), cores da pele/lábios e o contorno do nariz e do queixo
  const PERS = {
    sofia: { img: 'recortes/lado-sofia.jpg', S: 92, pele: '#C28A63', peleLuz: '#DBA57E', labio: '#C4635F', labioLuz: '#EBA79A', ceu: '#EEF7FF',
      nariz: [[0.52, 2.6], [0.6, 1.98], [0.98, 1.38], [0.78, 1.04], [0.36, 0.8]],
      queixo: [[0.12, -0.98], [0.16, -1.42], [-0.18, -1.9], [-0.9, -2.14], [-3.2, -2.42]] },
    tales: { img: 'recortes/lado-tales.jpg', S: 100, pele: '#EDBE9F', peleLuz: '#FBDCC6', labio: '#E08C86', labioLuz: '#F8C2B8', ceu: '#EEF7FF',
      nariz: [[0.5, 2.6], [0.6, 2.0], [1.0, 1.42], [0.8, 1.06], [0.36, 0.8]],
      queixo: [[0.12, -0.98], [0.2, -1.45], [-0.15, -1.95], [-0.9, -2.2], [-3.2, -2.5]] }
  };
  const JAN = { z0: -5.7, z1: 1.3, y0: -2.55, y1: 2.2, r: 1.05 }; // a janelinha, em unidades

  // onde encosta (ou quase) e que parte ganha a seta
  const TOQUE = {
    p: ['labios', 1], b: ['labios', 1], m: ['labios', 1], f: ['dentes', 1], v: ['dentes', 1],
    t: ['ponta', 1], d: ['ponta', 1], n: ['ponta', 1], l: ['ponta', 1], r: ['ponta', 1], s: ['ponta', 0.5], z: ['ponta', 0.5],
    x: ['lamina', 0.5], j: ['lamina', 0.5], nh: ['meio', 1], lh: ['meio', 1], k: ['dorso', 1], g: ['dorso', 1], rr: ['raiz', 0.5],
    i: ['meio', 0], 'i~': ['meio', 0], e: ['meio', 0], 'e~': ['meio', 0], u: ['dorso', 0], 'u~': ['dorso', 0], o: ['dorso', 0], 'o~': ['dorso', 0], O: ['dorso', 0]
  };
  const ROTULOS = [ // zona, texto, ponto (z,y), etiqueta (z,y)
    ['nariz', 'nariz', [0.1, 1.72], [2.25, 2.0]], ['labios', 'lábios', [0.62, 0.3], [2.35, 0.75]], ['dentes', 'dentes', [-0.26, 0.2], [2.35, -0.45]],
    ['palato', 'céu da boca', [-2.3, 1.36], [-2.0, 2.72]], ['veu', 'véu', [-4.35, 1.3], [-4.7, 2.72]],
    ['lingua', 'língua', null, [-7.0, -0.75]], ['pregas', 'voz', [-4.95, -2.0], [-7.0, -1.95]]
  ];

  // Catmull-Rom → Bézier (pontos em px)
  function curva(p, fechada) {
    const n = p.length, g = (i) => (fechada ? p[(i + n) % n] : p[clamp(i, 0, n - 1)]);
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < (fechada ? n : n - 1); i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (fechada ? 'Z' : '');
  }

  function criar(container, opts = {}) {
    const u = 'l' + (++nInst);
    let quem = PERS[opts.quem] ? opts.quem : 'sofia', C = PERS[quem], S = C.S;
    const X = (z) => OX + z * S, Y = (y) => OY - y * S, px = (p) => [X(p[0]), Y(p[1])];
    const cv = (pts, fechada) => curva(pts.map(px), fechada);
    const caixa = document.createElement('div'); caixa.className = 'esp-vista esp-vista-lado';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'esp-svg esp-lado'); svg.setAttribute('role', 'img');
    svg.setAttribute('viewBox', opts.viewBox || '300 372 1230 768'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const frase = document.createElement('p'); frase.className = 'esp-frase'; frase.setAttribute('aria-live', 'polite');
    caixa.appendChild(svg); caixa.appendChild(frase); container.appendChild(caixa);
    const $ = (s) => svg.querySelector(s);
    const ouvintes = [];
    svg.addEventListener('click', (e) => { const el = e.target.closest('[data-zona]'); if (el) ouvintes.forEach((cb) => cb({ zona: el.dataset.zona })); });

    function monta() {
      C = PERS[quem]; S = C.S;
      svg.setAttribute('aria-label', `${quem === 'sofia' ? 'A Sofia' : 'O Tales'} de lado, com uma janelinha mostrando a boca por dentro`);
      const jx = X(JAN.z0), jy = Y(JAN.y1), jw = (JAN.z1 - JAN.z0) * S, jh = (JAN.y1 - JAN.y0) * S, jr = JAN.r * S;
      const jan = `x="${jx}" y="${jy}" width="${jw}" height="${jh}" rx="${jr}"`;
      const ceu = [[-0.62, 0.42], [-0.8, 0.5], [-1.2, 0.95], [-2.0, 1.25], [-3.0, 1.32], [-3.8, 1.25]];
      svg.innerHTML = `
      <defs>
        <clipPath id="${u}Jan"><rect ${jan}/></clipPath>
        <linearGradient id="${u}Cav" gradientUnits="userSpaceOnUse" x1="${X(-5.3)}" y1="0" x2="${X(0.15)}" y2="0">
          <stop offset="0" stop-color="#C26C88"/><stop offset=".45" stop-color="#D98A9C"/><stop offset=".8" stop-color="#EBABB5"/><stop offset=".9" stop-color="#EDB0B8" stop-opacity=".8"/><stop offset="1" stop-color="#F2BCC2" stop-opacity="0"/></linearGradient>
        <linearGradient id="${u}Tec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCDDD3"/><stop offset="1" stop-color="#F6C3BC"/></linearGradient>
        <radialGradient id="${u}Ling" gradientUnits="userSpaceOnUse" cx="${X(-2.2)}" cy="${Y(0.9)}" r="${3.4 * S}"><stop offset="0" stop-color="#FFB3A4"/><stop offset=".35" stop-color="#FD8D7E"/><stop offset=".75" stop-color="#EF6B66"/><stop offset="1" stop-color="#D64F5A"/></radialGradient>
        <linearGradient id="${u}Dente" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F7FAFF"/><stop offset="1" stop-color="#D9E5F4"/></linearGradient>
        <linearGradient id="${u}Geng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9AEB0"/><stop offset="1" stop-color="#EC8D96"/></linearGradient>
        <linearGradient id="${u}Lab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.labioLuz}"/><stop offset="1" stop-color="${C.labio}"/></linearGradient>
        <radialGradient id="${u}Toque"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".35" stop-color="#FFE98A" stop-opacity=".95"/><stop offset="1" stop-color="#FFD23F" stop-opacity="0"/></radialGradient>
        <linearGradient id="${u}Vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <filter id="${u}Dentro" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${S * 0.1}" result="b"/><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="borda"/>
          <feFlood flood-color="#B33E4C" flood-opacity=".7"/><feComposite in2="borda" operator="in" result="s"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
        <filter id="${u}DentroCl" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${S * 0.045}" result="b"/><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="borda"/>
          <feFlood flood-color="#8FA6C4" flood-opacity=".55"/><feComposite in2="borda" operator="in" result="s"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
        <filter id="${u}B3"><feGaussianBlur stdDeviation="3"/></filter><filter id="${u}B6" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="${u}SJ" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#3A2A4A" flood-opacity=".35"/></filter>
        <filter id="${u}Sombra" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#7A3A10" flood-opacity=".35"/></filter>
        <marker id="${u}Seta" viewBox="0 0 10 10" refX="3.5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0,0.4 L10,5 L0,9.6 Q2.8,5 0,0.4z" fill="#F7B92E" stroke="#fff" stroke-width=".7" stroke-linejoin="round"/></marker>
        <marker id="${u}SetaAr" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse"><path d="M0,0.6 L10,5 L0,9.4 Q2.6,5 0,0.6z" fill="#4FAEEA" stroke="#fff" stroke-width=".9" stroke-linejoin="round"/></marker>
      </defs>
      <image href="${BASE}${C.img}" x="0" y="0" width="1800" height="1200"/>
      <rect ${jan} fill="#fff" filter="url(#${u}SJ)"/>
      <g clip-path="url(#${u}Jan)">
        <rect ${jan} fill="${C.ceu}"/>
        <path fill="url(#${u}Tec)" d="${cv(C.nariz)} L${X(0.3)},${Y(0.62)} L${X(0)},${Y(0.42)} L${X(-8)},${Y(0.42)} L${X(-8)},${Y(4)} L${X(0.5)},${Y(4)} Z"/>
        <rect x="${X(-8)}" y="${Y(4)}" width="${2.78 * S}" height="${8 * S}" fill="url(#${u}Tec)"/>
        <path fill="url(#${u}Cav)" d="${cv(ceu)} L${X(-4.4)},${Y(1.7)} L${X(-5.22)},${Y(1.9)} L${X(-5.22)},${Y(-4)} L${X(0.2)},${Y(-4)} L${X(0.2)},${Y(0.42)} Z"/>
        <path fill="none" stroke="#DC9BAA" stroke-width="${0.4 * S}" stroke-linecap="round" stroke-linejoin="round" d="${cv([[0.56, 1.13], [0.26, 1.5], [-0.5, 1.84], [-2.5, 1.88], [-4.2, 1.86], [-4.95, 1.6], [-5.0, 1.0]])}"/>
        <path fill="none" stroke="#FFE9E3" stroke-width="${0.09 * S}" stroke-linecap="round" opacity=".9" d="${cv(ceu.slice(1).map((p) => [p[0], p[1] + 0.07]))}"/>
        <path class="l-veu" fill="url(#${u}Geng)"/><path class="l-veu-luz" fill="none" stroke="#FFDCD8" stroke-width="${0.08 * S}" stroke-linecap="round" opacity=".8"/>
        <path class="l-mand" fill="url(#${u}Tec)"/>
        <g class="l-voz"></g>
        <path class="l-lingua-sombra" fill="#8E2F4A" opacity=".28" filter="url(#${u}B6)"/>
        <g filter="url(#${u}Dentro)"><path class="l-lingua" fill="url(#${u}Ling)"/></g>
        <path class="l-lingua-luz" fill="none" stroke="#FFF1EC" stroke-width="${0.15 * S}" stroke-linecap="round" opacity=".7" filter="url(#${u}B3)"/>
        <ellipse class="l-lingua-ponto" rx="${0.13 * S}" ry="${0.06 * S}" fill="#fff" opacity=".85" filter="url(#${u}B3)"/>
        <path class="l-geng-b" fill="url(#${u}Geng)"/>
        <g filter="url(#${u}DentroCl)"><path class="l-dente-b" fill="url(#${u}Dente)" stroke="#C9D7EA" stroke-width="1.5"/></g>
        <path class="l-dente-b-luz" fill="none" stroke="#fff" stroke-width="${0.06 * S}" stroke-linecap="round" opacity=".95"/>
        <path fill="url(#${u}Geng)" d="${cv([[0.02, 0.62], [-0.3, 0.5], [-0.62, 0.46], [-0.86, 0.6], [-0.82, 0.92], [-0.3, 0.98], [0.02, 0.88]], true)}"/>
        <path fill="none" stroke="#FFD3D0" stroke-width="${0.07 * S}" stroke-linecap="round" opacity=".8" d="${cv([[-0.7, 0.64], [-0.4, 0.62], [-0.1, 0.7]])}"/>
        <g filter="url(#${u}DentroCl)"><path fill="url(#${u}Dente)" stroke="#C9D7EA" stroke-width="1.5" d="${cv([[-0.04, 0.7], [-0.05, 0.32], [-0.13, 0.04], [-0.29, -0.07], [-0.45, 0.03], [-0.56, 0.32], [-0.6, 0.68]], true)}"/></g>
        <path fill="none" stroke="#fff" stroke-width="${0.06 * S}" stroke-linecap="round" opacity=".95" d="${cv([[-0.17, 0.52], [-0.19, 0.3], [-0.24, 0.12]])}"/>
        <path class="l-lab-c" fill="url(#${u}Tec)"/><path class="l-lab-b" fill="url(#${u}Tec)"/>
        <path class="l-pele-c" fill="none" stroke="${C.pele}" stroke-width="${0.24 * S}" stroke-linecap="round" stroke-linejoin="round"/><path class="l-pele-c2" fill="none" stroke="${C.peleLuz}" stroke-width="${0.07 * S}" stroke-linecap="round" stroke-linejoin="round" opacity=".3"/>
        <path class="l-pele-b" fill="none" stroke="${C.pele}" stroke-width="${0.24 * S}" stroke-linecap="round" stroke-linejoin="round"/><path class="l-pele-b2" fill="none" stroke="${C.peleLuz}" stroke-width="${0.07 * S}" stroke-linecap="round" stroke-linejoin="round" opacity=".3"/>
        <ellipse class="l-verm-c" fill="url(#${u}Lab)"/><ellipse class="l-verm-b" fill="url(#${u}Lab)"/>
        <ellipse class="l-verm-luz-c" rx="${0.1 * S}" ry="${0.05 * S}" fill="#fff" opacity=".55" filter="url(#${u}B3)"/><ellipse class="l-verm-luz-b" rx="${0.11 * S}" ry="${0.05 * S}" fill="#fff" opacity=".55" filter="url(#${u}B3)"/>
        <g class="l-ar" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path class="l-ar-b0" stroke="#fff" stroke-width="${0.24 * S}" opacity=".35"/><path class="l-ar-b" stroke="#fff" stroke-width="${0.1 * S}" marker-end="url(#${u}SetaAr)"/>
          <path class="l-ar-n0" stroke="#fff" stroke-width="${0.24 * S}" opacity=".35"/><path class="l-ar-n" stroke="#fff" stroke-width="${0.1 * S}" marker-end="url(#${u}SetaAr)"/></g>
        <circle class="l-toque" r="${0.38 * S}" fill="url(#${u}Toque)" opacity="0"/>
        <rect ${jan} fill="url(#${u}Vidro)" pointer-events="none"/>
      </g>
      <rect ${jan} fill="none" stroke="#9FD4F5" stroke-width="16" opacity=".85"/><rect ${jan} fill="none" stroke="#fff" stroke-width="7"/>
      <g class="l-setas" filter="url(#${u}Sombra)">${[1, 2].map((i) => `<path class="l-s${i}w" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round" opacity=".9"/><path class="l-s${i}" fill="none" stroke="#F7B92E" stroke-width="10" stroke-linecap="round" marker-end="url(#${u}Seta)"/>`).join('')}</g>
      <g class="l-rotulos" font-family="Fredoka,Andika,Nunito,sans-serif" font-weight="600" font-size="27">${ROTULOS.map(([z, t]) => `<g data-r="${z}"><path fill="none" stroke="#F3C969" stroke-width="3" stroke-linecap="round"/><circle r="6" fill="#fff" stroke="#F3C969" stroke-width="3"/><rect height="44" rx="22" fill="#fff" stroke="#F3C969" stroke-width="3"/><text text-anchor="middle" fill="#1B3160">${t}</text></g>`).join('')}</g>
      <circle class="l-marca" r="${0.6 * S}" fill="rgba(255,224,138,.7)" opacity="0"/>
      <g class="l-alvos" fill="transparent">
        <ellipse data-zona="lingua" rx="${1.6 * S}" ry="${0.75 * S}"/>
        <ellipse data-zona="garganta" cx="${X(-4.95)}" cy="${Y(-0.5)}" rx="${0.45 * S}" ry="${0.95 * S}"/>
        <ellipse data-zona="pregas" cx="${X(-4.95)}" cy="${Y(-2.0)}" rx="${0.55 * S}" ry="${0.5 * S}"/>
        <ellipse data-zona="nariz" cx="${X(-0.6)}" cy="${Y(1.75)}" rx="${1.9 * S}" ry="${0.36 * S}"/>
        <ellipse data-zona="palato" cx="${X(-2.4)}" cy="${Y(1.28)}" rx="${1.1 * S}" ry="${0.34 * S}"/>
        <ellipse data-zona="veu" cx="${X(-4.4)}" cy="${Y(1.15)}" rx="${0.6 * S}" ry="${0.55 * S}"/>
        <ellipse data-zona="alveolo" cx="${X(-0.95)}" cy="${Y(0.62)}" rx="${0.36 * S}" ry="${0.36 * S}"/>
        <ellipse data-zona="dentes" cx="${X(-0.3)}" cy="${Y(0.2)}" rx="${0.3 * S}" ry="${0.42 * S}"/>
        <ellipse data-zona="labios" cx="${X(0.55)}" cy="${Y(-0.05)}" rx="${0.5 * S}" ry="${0.7 * S}"/>
      </g>`;
      // etiquetas (fixas)
      ROTULOS.forEach(([zona, txt, , et]) => {
        const g = $(`.l-rotulos [data-r=${zona}]`), w = txt.length * 14.5 + 34, r = g.querySelector('rect'), t = g.querySelector('text');
        r.setAttribute('x', X(et[0]) - w / 2); r.setAttribute('y', Y(et[1]) - 22); r.setAttribute('width', w); t.setAttribute('x', X(et[0])); t.setAttribute('y', Y(et[1]) + 9);
      });
      $('.l-rotulos').style.display = rot ? '' : 'none';
    }

    let id = P.F[opts.fonema] ? opts.fonema : 'a', lento = false, parado = false, congel = null, rot = opts.rotulos !== false;
    let tempo = 0, t0 = 0, marcaT = -9, ultimo = performance.now();
    let de = P.pose(id), para = de, atual = de;
    const reduz = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
    monta();
    const set = (s, d) => $(s).setAttribute('d', d);

    function desenha() {
      if (parado) return;
      if (!svg.isConnected) { parado = true; return; }
      const agora = performance.now(), dtr = Math.min(0.1, (agora - ultimo) / 1000); ultimo = agora; tempo += dtr;
      const rz = reduz(), vel = lento ? 0.4 : 1;
      const k = congel ? 1 : Math.min(1, (tempo - t0) / (lento ? 1.6 : 0.5));
      const o = congel || P.mistura(de, para, P.suave(k)); if (!congel) atual = o;
      const f = P.F[id], pronto = congel ? 0 : k > 0.8 ? 1 : 0, tq = TOQUE[id];
      const lin = o.lin.map((p) => p.slice());
      let jaw = o.jaw, ab = o.ab, solta = 0, fechaAr = false;
      // movimentos próprios de cada modo
      if (f.modo === 'tepe' && !rz && pronto) { const ph = ((tempo * vel) % 1.0) / 1.0, b = Math.exp(-Math.pow((ph - 0.4) / 0.09, 2)); lin[0] = mix(lin[0], [-0.8, 0.5], b); lin[1] = mix(lin[1], [-1.25, 0.5], b * 0.7); }
      if (f.modo === 'plosiva') {
        const ph = ((tempo * vel) % 2.0) / 2.0; solta = !rz && pronto && ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) : 0; fechaAr = solta < 0.15;
        if (tq[0] === 'ponta') { lin[0][1] -= 0.5 * solta; lin[1][1] -= 0.4 * solta; lin[2][1] -= 0.2 * solta; }
        if (tq[0] === 'dorso') { lin[3][1] -= 0.55 * solta; lin[2][1] -= 0.25 * solta; }
        if (tq[0] === 'labios') { ab += 0.45 * solta; jaw += 3 * solta; }
      }
      if (f.modo === 'vibrante' && !rz && pronto) { lin[4][0] += Math.sin(tempo * 40) * 0.035; lin[3][1] += Math.sin(tempo * 40) * 0.03; }
      const R = (p, w = 1) => (w ? mix(p, P.giraMand(p, jaw), w) : p); // gira com a mandíbula
      const T = lin.map((p) => R(p, o.tj));

      // véu: levantado (fecha o nariz) ↔ abaixado (o ar passa para o nariz)
      const vA = [[-3.72, 1.66], [-4.4, 1.66], [-5.0, 1.5], [-5.16, 1.18], [-4.82, 1.0], [-4.3, 1.12], [-3.8, 1.24]];
      const vB = [[-3.72, 1.66], [-4.2, 1.5], [-4.52, 1.0], [-4.86, 0.3], [-4.56, 0.16], [-4.3, 0.76], [-3.8, 1.24]];
      const veu = vA.map((p, i) => mix(p, vB[i], clamp(o.vel, 0, 1)));
      set('.l-veu', cv(veu, true)); set('.l-veu-luz', cv([mix(veu[5], veu[2], 0.3), mix(veu[4], veu[3], 0.45)]));

      // mandíbula, gengiva e dente de baixo (giram juntos)
      const q = C.queixo.map((p) => R(p));
      set('.l-mand', cv([R([-0.28, -0.82]), R([0.1, -0.9]), ...q, R([-4.7, -2.9]), R([-4.38, -2.3]), R([-2.6, -1.86]), R([-1.3, -1.4]), R([-0.84, -0.9])], true));
      set('.l-geng-b', cv([[-0.24, -0.84], [-0.56, -0.74], [-0.88, -0.86], [-0.92, -1.14], [-0.58, -1.24], [-0.22, -1.1]].map((p) => R(p)), true));
      set('.l-dente-b', cv([[-0.33, -0.94], [-0.35, -0.54], [-0.42, -0.26], [-0.55, -0.17], [-0.68, -0.26], [-0.76, -0.54], [-0.8, -0.94]].map((p) => R(p)), true));
      set('.l-dente-b-luz', cv([[-0.46, -0.76], [-0.47, -0.54], [-0.5, -0.38]].map((p) => R(p))));

      // língua: superfície de cima (6 pontos) + ponta gordinha + parte de baixo presa ao chão da boca
      const A = R([-1.3, -1.34]), B = R([-2.8, -1.92]), Cc = [-4.5, -2.6];
      const Tf = [T[0][0] + 0.13, T[0][1] - 0.15], U0 = [T[0][0] + 0.02, Math.max(T[0][1] - 0.42, A[1] + 0.2)];
      const U1 = [Math.min(T[1][0] + 0.12, U0[0] - 0.2), Math.max(T[1][1] - 0.78, A[1] + 0.16)];
      const corpo = [T[0], T[1], T[2], T[3], T[4], T[5], Cc, B, A, U1, U0, Tf];
      const dl = cv(corpo, true); set('.l-lingua', dl); set('.l-lingua-sombra', dl);
      $('.l-lingua-sombra').setAttribute('transform', `translate(0,${0.12 * S})`);
      set('.l-lingua-luz', cv([[T[1][0] - 0.1, T[1][1] - 0.2], [T[2][0], T[2][1] - 0.2], [T[3][0] + 0.2, T[3][1] - 0.22]]));
      const lp = $('.l-lingua-ponto'); lp.setAttribute('cx', X(T[1][0] + 0.12)); lp.setAttribute('cy', Y(T[1][1] - 0.2));
      const alvoL = $('.l-alvos [data-zona=lingua]'); alvoL.setAttribute('cx', X(T[2][0])); alvoL.setAttribute('cy', Y(T[2][1] - 0.7));

      // lábios (corte): o de cima desce um pouquinho; o de baixo vem com a mandíbula, fecha, faz bico ou encosta nos dentes
      const pr = 0.34 * o.arr, fecha = 1 - clamp(ab / 0.14, 0, 1), c = 0.05 * fecha + 0.04 * o.arr;
      const labC = [[0.36, 0.82], [0.54 + pr, 0.58], [0.66 + pr, 0.32 - c], [0.52 + pr, 0.03 - c], [0.18 + pr * 0.6, 0.0 - c], [-0.02, 0.2], [-0.06, 0.5], [0.06, 0.82]];
      set('.l-lab-c', cv(labC, true));
      const elip = (sel, p, rx, ry, ang) => { const e = $(sel); e.setAttribute('cx', X(p[0])); e.setAttribute('cy', Y(p[1])); e.setAttribute('rx', rx * S); e.setAttribute('ry', ry * S); e.setAttribute('transform', `rotate(${ang} ${X(p[0])} ${Y(p[1])})`); };
      elip('.l-verm-c', [0.5 + pr, 0.26 - c], 0.25 + 0.04 * o.arr, 0.32, 18);
      { const d = cv([...C.nariz, [0.42 + pr * 0.4, 0.7], [0.52 + pr, 0.56]]); set('.l-pele-c', d); set('.l-pele-c2', d); }
      const yNat = R([0.3, -0.05])[1], sobe = fecha * ((-0.03 - c) - yNat + 0.02) + o.arr * 0.5 * Math.max(0, (-0.5 - yNat)), yLd = o.ld * ((-0.16) - yNat);
      const Lb = (p, w = 1) => { const r = R(p); return [r[0] + w * (pr - 0.36 * o.ld), r[1] + w * (sobe + yLd)]; };
      const labB = [Lb([-0.06, -0.52], 0.7), Lb([0.1, -0.1]), Lb([0.42, -0.06]), Lb([0.6, -0.3]), Lb([0.5, -0.6], 0.9), Lb([0.26, -0.8], 0.5), Lb([0.1, -0.98], 0.1), Lb([-0.1, -0.8], 0.3)];
      set('.l-lab-b', cv(labB, true));
      elip('.l-verm-b', Lb([0.44, -0.36]), 0.26 + 0.04 * o.arr, 0.33, -18);
      { const d = cv([Lb([0.44, -0.66], 0.9), Lb([0.27, -0.84], 0.5), ...q]); set('.l-pele-b', d); set('.l-pele-b2', d); }
      const lc = $('.l-verm-luz-c'), lb = $('.l-verm-luz-b'), pB = Lb([0.53, -0.28]);
      lc.setAttribute('cx', X(0.58 + pr)); lc.setAttribute('cy', Y(0.32 - c)); lb.setAttribute('cx', X(pB[0])); lb.setAttribute('cy', Y(pB[1]));

      // ponto de contato (brilho) e seta amarela na parte que se mexe
      const pulso = rz ? 1 : 0.85 + 0.15 * Math.sin(tempo * 6);
      let pt = null, s1 = '', s2 = '';
      const sobeEm = (p, dz = 0.35, h = 1.15) => `M${X(p[0] + dz)},${Y(p[1] - h)} Q${X(p[0] + dz * 1.4)},${Y(p[1] - h * 0.5)} ${X(p[0] + 0.04)},${Y(p[1] - 0.34)}`;
      if (tq) {
        const [onde] = tq;
        if (onde === 'ponta') { pt = [T[0][0] + 0.02, T[0][1] + 0.04]; s1 = `M${X(T[0][0] - 0.75)},${Y(T[0][1] - 1.1)} Q${X(T[0][0] - 0.1)},${Y(T[0][1] - 1.0)} ${X(T[0][0] - 0.06)},${Y(T[0][1] - 0.42)}`; }
        else if (onde === 'lamina') { pt = [T[1][0] - 0.2, T[1][1] + 0.1]; s1 = sobeEm(T[1], -0.5); }
        else if (onde === 'meio') { pt = [T[2][0], T[2][1] + 0.04]; s1 = sobeEm(T[2]); }
        else if (onde === 'dorso') { pt = [T[3][0], T[3][1] + 0.04]; s1 = sobeEm(T[3]); }
        else if (onde === 'raiz') { pt = [T[4][0] - 0.12, T[4][1] + 0.1]; s1 = `M${X(T[3][0] + 0.5)},${Y(T[3][1] - 1.0)} Q${X(T[4][0] + 0.5)},${Y(T[4][1] - 0.8)} ${X(T[4][0] + 0.12)},${Y(T[4][1] - 0.22)}`; }
        else if (onde === 'labios') { pt = [0.4 + pr, -0.04 - c]; s1 = `M${X(1.5)},${Y(0.95)} Q${X(1.05)},${Y(0.9)} ${X(0.84)},${Y(0.36)}`; s2 = `M${X(1.5)},${Y(-1.05)} Q${X(1.05)},${Y(-1.0)} ${X(0.84)},${Y(-0.44)}`; }
        else if (onde === 'dentes') { pt = [-0.26, -0.1]; s1 = `M${X(1.35)},${Y(-1.15)} Q${X(0.75)},${Y(-1.2)} ${X(0.42)},${Y(-0.62)}`; }
        if (!tq[1]) pt = null; // vogais: só a seta
      } else if (f.modo === 'vogal') s1 = `M${X(T[2][0])},${Y(T[2][1] + 1.0)} Q${X(T[2][0] - 0.25)},${Y(T[2][1] + 0.6)} ${X(T[2][0])},${Y(T[2][1] + 0.2)}`; // A, É: a língua desce
      if (o.arr > 0.5 && f.modo === 'vogal') s2 = `M${X(0.2)},${Y(-1.5)} Q${X(0.9)},${Y(-1.55)} ${X(1.12 + pr)},${Y(-0.82)}`; // biquinho: lábios para a frente
      [[1, s1], [2, s2]].forEach(([i, d]) => { set(`.l-s${i}`, d); set(`.l-s${i}w`, d); });
      $('.l-setas').setAttribute('opacity', rz || congel ? 1 : clamp((tempo - t0 - 0.25) * 4, 0, 1) * (0.86 + 0.14 * Math.sin(tempo * 3.2)));
      const g = $('.l-toque');
      if (pt) { const forca = tq[1] * (f.modo === 'plosiva' ? 1 - solta : 1) * (f.modo === 'tepe' ? clamp((T[0][1] - 0.2) / 0.3, 0.15, 1) : 1);
        g.setAttribute('cx', X(pt[0])); g.setAttribute('cy', Y(pt[1])); g.setAttribute('opacity', 0.9 * (congel ? 1 : k) * forca * pulso); g.setAttribute('r', S * 0.4 * (0.9 + 0.2 * pulso)); } else g.setAttribute('opacity', 0);

      // ar: pela boca (por cima da língua) e/ou pelo nariz (por trás do véu)
      const topo = (z) => { for (let i = 1; i < T.length; i++) if (z >= T[i][0]) { const a = T[i - 1], b = T[i]; return lerp(b[1], a[1], (z - b[0]) / (a[0] - b[0] || 1)); } return T[T.length - 1][1]; };
      const meio = (z) => (topo(z) + P.ceuY(z)) / 2;
      const yD = (-0.06 + R([-0.55, -0.17])[1]) / 2, yLb = ((0.0 - c) + Lb([0.3, -0.05])[1]) / 2;
      const boca = [[-4.95, -2.5], [-4.98, -0.9], [-4.72, Math.max(T[4][1] + 0.3, 0.2)], [-3.4, meio(-3.4)], [-2.2, meio(-2.2)], [-1.3, meio(-1.3)], [-0.42, yD], [0.5 + pr, yLb], [1.75 + pr, yLb]];
      const nariz = [[-4.95, -2.5], [-5.0, 0.0], [-4.98, 1.3], [-4.3, 1.84], [-2.4, 1.88], [-0.5, 1.84], [0.24, 1.5], [0.6, 1.06], [1.5, 0.62]];
      const oral = (f.ar === 'oral' || f.ar === 'lateral' || f.ar === 'oral+nasal') && !(f.modo === 'plosiva' && fechaAr);
      const nasal = f.ar === 'nasal' || f.ar === 'oral+nasal';
      const fino = f.modo === 'fricativa' || f.modo === 'vibrante', trac = S * (fino ? 0.12 : 0.17), off = -((tempo * vel * S * (fino ? 3.4 : 2.2)) % (trac * 2));
      [['b', boca, oral], ['n', nariz, nasal]].forEach(([n, pts, on]) => {
        const p = $(`.l-ar-${n}`), p0 = $(`.l-ar-${n}0`), d = on ? cv(pts) : '';
        p.setAttribute('d', d); p0.setAttribute('d', d);
        p.setAttribute('stroke-width', S * (fino ? 0.05 : 0.075)); p0.setAttribute('stroke-width', S * (fino ? 0.12 : 0.2));
        p.style.strokeDasharray = `${trac} ${trac}`; p.style.strokeDashoffset = rz ? 0 : off;
        const a = f.modo === 'plosiva' ? clamp(solta * 2, 0, 1) : congel ? 1 : k; p.setAttribute('opacity', a); p0.setAttribute('opacity', 0.22 * a);
      });

      // voz: ondinhas douradas na garganta quando as pregas vibram
      const vz = o.voz > 0.5, cxv = X(-4.95), cyv = Y(-2.0);
      $('.l-voz').innerHTML = vz ? [0, 1, 2].map((i) => { const a = rz ? (i + 1) / 3 : ((tempo * 1.6 + i / 3) % 1); return `<circle cx="${cxv}" cy="${cyv}" r="${S * (0.12 + 0.42 * a)}" fill="none" stroke="#F5B62A" stroke-width="${S * 0.06}" opacity="${0.95 * (1 - a)}"/>`; }).join('') + `<circle cx="${cxv}" cy="${cyv}" r="${S * 0.11}" fill="#F7C23C"/>`
        : `<circle cx="${cxv}" cy="${cyv}" r="${S * 0.1}" fill="#fff" opacity=".7"/>`;

      // etiquetas
      if (rot) ROTULOS.forEach(([zona, , pto, et]) => {
        const gR = $(`.l-rotulos [data-r=${zona}]`), a = pto || [T[2][0] + 0.3, T[2][1] - 0.7], b = Math.abs(et[0] - a[0]) > 1.6 ? [et[0] + (et[0] > a[0] ? -0.5 : 0.5), et[1]] : [et[0], et[1] + (et[1] > a[1] ? -0.24 : 0.24)];
        gR.querySelector('path').setAttribute('d', `M${X(a[0])},${Y(a[1])} L${X(b[0])},${Y(b[1])}`); const ci = gR.querySelector('circle'); ci.setAttribute('cx', X(a[0])); ci.setAttribute('cy', Y(a[1]));
      });
      if (frase.textContent !== f.frase) frase.textContent = f.frase;
      const mt = tempo - marcaT; $('.l-marca').setAttribute('opacity', mt < 2 ? 1 - mt / 2 : 0);
      requestAnimationFrame(desenha);
    }
    requestAnimationFrame(desenha);

    return {
      tipo: 'lado', el: caixa,
      fonema(n, { instantaneo = false } = {}) { if (!P.F[n]) return; de = atual; para = P.pose(n); id = n; t0 = tempo; congel = null; if (instantaneo) { de = para; t0 = tempo - 9; } },
      lento(v) { lento = !!v; },
      rotulos(v) { rot = !!v; $('.l-rotulos').style.display = rot ? '' : 'none'; },
      quem(p) { if (!PERS[p] || p === quem) return; quem = p; monta(); },
      destacar(zona, ok = true) {
        const el = $(`.l-alvos [data-zona=${zona === 'baixo' ? 'lingua' : zona}]`); if (!el) return; const c = $('.l-marca');
        c.setAttribute('cx', el.getAttribute('cx')); c.setAttribute('cy', el.getAttribute('cy')); c.setAttribute('fill', ok ? 'rgba(255,224,138,.75)' : 'rgba(168,213,242,.75)'); marcaT = tempo;
      },
      onToque(cb) { ouvintes.push(cb); },
      pose(a, b, fr) { id = fr > 0.5 ? b : a; congel = P.mistura(P.pose(a), P.pose(b), P.suave(clamp(fr, 0, 1))); t0 = tempo - 9; },
      solta() { congel = null; },
      destruir() { parado = true; caixa.remove(); }
    };
  }
  global.EspelhoLado = { criar, PERS };
})(window);
