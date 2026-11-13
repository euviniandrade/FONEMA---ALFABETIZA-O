/* FONEMA · Espelho do Som — RAIO-X HÍBRIDO (de lado), com a cara da Sofia ou do Tales.
 *
 * Fundo: a cabeça de "vidro" da Sofia/Tales (imagens/v2-raio-x-*.png) com a boca e a garganta apagadas
 * por recortar.py (recortes/raiox-*-limpo.jpg). Por cima, alinhado ao perfil, este boneco 2D animado e fiel.
 * Arte (alvo: imagens/referencia-estilo-raiox-bonito.png): dentes com silhueta de verdade (incisivo em pá,
 * canino, molares de 2 cúspides) em branco→marfim com brilho, gengiva rosa-clara fina; língua gordinha com
 * gradiente coral, brilho longo no dorso, sulco sutil e sombra interna; boca rosa-escura com profundidade;
 * lábios volumosos com brilho; céu da boca rosa-pálido; véu com gradiente; voz dourada com brilho; ar em
 * setinhas translúcidas. As POSIÇÕES vêm de fonemas.js (FonemasPT) — simplificadas, VALIDAR COM FONOAUDIÓLOGA.
 * Também é a versão usada sem WebGL ou em file:// (não depende de módulos ES).
 *
 *   const rx = EspelhoSVG.criar(div, { fonema: 'm', personagem: 'sofia' });
 *   rx.fonema('a'); rx.personagem('tales'); rx.lento(true); rx.rotulos(false); rx.onToque(({ zona }) => …);
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');

  // Encaixe do boneco (unidades ≈ cm, rosto para +z) em cada imagem (pixels de 1376×768)
  const PERS = {
    sofia: { img: 'recortes/raiox-sofia-limpo.jpg', x0: 638, y0: 385, k: 54.5, gar: 0.45, vb: [430, 150, 760, 490],
      rot: { nariz: [530, 255], labios: [520, 440], dentes: [525, 345], palato: [760, 228], veu: [990, 300], lingua: [985, 470], garganta: [1060, 565] } },
    tales: { img: 'recortes/raiox-tales-limpo.jpg', x0: 530, y0: 432, k: 36.7, gar: 0.5, vb: [372, 228, 690, 445],
      rot: { nariz: [440, 335], labios: [432, 485], dentes: [432, 412], palato: [610, 312], veu: [800, 368], lingua: [800, 505], garganta: [845, 565] } },
    // "3D fofinho" (D020): Sofia de perfil olhando para a DIREITA, com a janelinha na bochecha
    lado3d: { img: 'recortes/lado3d-sofia-limpo.jpg', x0: 982, y0: 309, k: 68, gar: 0.5, vb: [430, 70, 830, 535], dir: -1, lar: [512, 572], labEsc: 1.32, labDz: 0.32,
      semLabios: true, // os lábios da ilustração ficam; a vista de frente mostra o movimento dos lábios
      janela: [[612, 212], [662, 180], [760, 166], [880, 166], [958, 192], [982, 245], [990, 330], [974, 398], [930, 448], [840, 470], [720, 464], [642, 428], [608, 360], [602, 280]],
      rot: { nariz: [1140, 120], labios: [1150, 380], dentes: [1145, 250], palato: [800, 120], veu: [540, 175], lingua: [760, 520], garganta: [610, 640] } }
  };
  const ROTULOS = { nariz: 'nariz', labios: 'lábios', dentes: 'dentes', palato: 'céu da boca', veu: 'véu (céu mole)', lingua: 'língua', garganta: 'garganta (voz)' };

  function suave(pts, fechada) {
    const n = pts.length; if (n < 2) return '';
    const q = (i) => pts[fechada ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < (fechada ? n : n - 1); i++) {
      const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (fechada ? 'Z' : '');
  }

  // Dentes de perfil: [z da gengiva, largura, altura, tipo, y da gengiva] (de cima: crescem para baixo; de baixo: para cima)
  const CIMA = [[-0.27, 0.34, 0.64, 'i', 0.6], [-0.6, 0.33, 0.56, 'i', 0.58], [-0.93, 0.34, 0.56, 'c', 0.58], [-1.3, 0.4, 0.47, 'm', 0.58], [-1.74, 0.46, 0.44, 'm', 0.57], [-2.21, 0.46, 0.42, 'm', 0.56]];
  const BAIXO = [[-0.43, 0.3, 0.6, 'i', -0.6], [-0.74, 0.3, 0.55, 'i', -0.58], [-1.05, 0.32, 0.54, 'c', -0.54], [-1.41, 0.38, 0.5, 'm', -0.44], [-1.84, 0.46, 0.47, 'm', -0.39], [-2.3, 0.46, 0.45, 'm', -0.37]];
  // silhueta de um dente apontando para BAIXO, gengiva em y=0 (w, h em pixels)
  function formaDente(t, w, h) {
    // coroas gordinhas e arredondadas (estilo brinquedo), sem pontas
    const a = w / 2, r = a * (t === 'm' ? 0.75 : 0.95), e = t === 'i' ? 0.12 : 0;
    if (t === 'm') return `M${-a},0 L${-a},${h - r} Q${-a},${h} ${-a + r},${h} Q0,${h * 0.94} ${a - r},${h} Q${a},${h} ${a},${h - r} L${a},0 Z`;
    return `M${-a * (1 - e)},0 C${-a * 1.04},${h * 0.35} ${-a},${h - r} ${-a + r * 0.15},${h - r * 0.35} Q${-a + r * 0.55},${h} 0,${h} Q${a - r * 0.55},${h} ${a - r * 0.15},${h - r * 0.35} C${a},${h - r} ${a * 1.04},${h * 0.35} ${a * (1 - e)},0 Z`;
  }

  function criar(container, opts = {}) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'esp-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-label', 'Raio-X de lado: lábios, dentes, língua, céu da boca, véu, nariz e garganta');
    container.appendChild(svg);
    const ouvintes = [];
    let C = null, X, Y, u;

    function monta(nome) {
      C = PERS[nome] || PERS.sofia; u = C.k / 92;
      const dir = C.dir || 1;
      X = (z) => C.x0 + (0.2 - z) * C.k * dir;
      Y = (y) => (y >= -2 ? C.y0 - y * C.k : C.y0 + 2 * C.k + (-2 - y) * C.k * C.gar);
      svg.setAttribute('viewBox', C.vb.join(' '));
      const s = (v) => (v * u).toFixed(2);
      const dente = (cls, [z, w, h, t]) => {
        const W = w * C.k, H = h * C.k;
        return `<g class="${cls}"><path d="${formaDente(t, W, H)}" fill="url(#eDente)" stroke="#C7D3E3" stroke-width="${s(1.2)}"/>
          <path d="${formaDente(t, W * 0.42, H * 0.62)}" transform="translate(${(-W * 0.18).toFixed(1)},${(H * 0.14).toFixed(1)})" fill="url(#eDenteBrilho)"/>
          <ellipse cx="${(-W * 0.2).toFixed(1)}" cy="${(H * 0.42).toFixed(1)}" rx="${(W * 0.08).toFixed(1)}" ry="${(H * 0.16).toFixed(1)}" fill="#fff" opacity=".95"/></g>`;
      };
      svg.innerHTML = `
      <defs>
        <radialGradient id="eLing" cx="45%" cy="25%" r="78%"><stop offset="0" stop-color="#FFA494"/><stop offset=".3" stop-color="#FF8A7A"/><stop offset=".68" stop-color="#F26B5B"/><stop offset="1" stop-color="#D9534F"/></radialGradient>
        <linearGradient id="eDente" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1E8D8"/><stop offset=".28" stop-color="#FFFDF8"/><stop offset=".8" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EEF9"/></linearGradient>
        <linearGradient id="eDenteBrilho" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="eLab" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${(C.labCor || [])[0] || '#FFC0C4'}"/><stop offset=".45" stop-color="${(C.labCor || [])[1] || '#F49AA3'}"/><stop offset="1" stop-color="${(C.labCor || [])[2] || '#D2697A'}"/></radialGradient>
        <linearGradient id="ePele" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B9775B"/><stop offset=".7" stop-color="#D39276"/><stop offset="1" stop-color="#E0A387"/></linearGradient>
        ${C.janela ? `<clipPath id="eJanela"><path d="${suave(C.janela, true)}"/></clipPath>` : ''}
        <radialGradient id="eBoca" cx="55%" cy="45%" r="62%"><stop offset="0" stop-color="#4A1630" stop-opacity=".92"/><stop offset=".7" stop-color="#7A2E4E" stop-opacity=".82"/><stop offset="1" stop-color="#9C4766" stop-opacity=".55"/></radialGradient>
        <linearGradient id="eVeu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBC2CF"/><stop offset="1" stop-color="#E37D97"/></linearGradient>
        <linearGradient id="eChao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3A6B5"/><stop offset="1" stop-color="#C9677F"/></linearGradient>
        <radialGradient id="eVozBrilho"><stop offset="0" stop-color="#FFE38A" stop-opacity=".95"/><stop offset=".45" stop-color="#FFC94A" stop-opacity=".45"/><stop offset="1" stop-color="#FFC94A" stop-opacity="0"/></radialGradient>
        <filter id="eSuave"><feGaussianBlur stdDeviation="${s(6)}"/></filter>
        <filter id="eBorrao"><feGaussianBlur stdDeviation="${s(2.2)}"/></filter>
        <filter id="eBrilho" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${s(3.5)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="eSombraIn" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${s(7)}" result="b"/>
          <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="borda"/>
          <feFlood flood-color="#A9343F" flood-opacity=".8"/><feComposite in2="borda" operator="in" result="sombra"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sombra"/></feMerge></filter>
        <filter id="eContato" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${s(1.5)}" stdDeviation="${s(1.6)}" flood-color="#5A1E35" flood-opacity=".45"/></filter>
        <marker id="eSeta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.6" markerHeight="2.6" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9 Q3,5 1,1 z" fill="#E4F9FF" fill-opacity=".85"/></marker>
      </defs>
      <image href="${BASE}${C.img}" x="0" y="0" width="1376" height="768"/>
      <g ${C.janela ? 'clip-path="url(#eJanela)"' : ''}>
      <path class="e-boca-fundo" fill="url(#eBoca)" filter="url(#eSuave)"/>
      <path class="e-ceu" fill="none" stroke="#F9CCD6" stroke-width="${s(24)}" stroke-linecap="round"/>
      <path class="e-ceu-luz" fill="none" stroke="#FFE7EC" stroke-width="${s(6)}" stroke-linecap="round" opacity=".8"/>
      <path class="e-osso" fill="none" stroke="#FBEAD0" stroke-width="${s(9)}" stroke-linecap="round"/>
      <path class="e-veu" fill="url(#eVeu)"/>
      <g class="e-cima" filter="url(#eContato)">${CIMA.map((d) => dente('e-dc', d)).join('')}</g>
      <path class="e-gengiva-c" fill="none" stroke="#F8BFCB" stroke-width="${s(14)}" stroke-linecap="round"/>
      <path class="e-chao" fill="url(#eChao)" opacity=".85"/>
      <g class="e-lingua-g" filter="url(#eSombraIn)"><path class="e-lingua" fill="url(#eLing)"/></g>
      <path class="e-lingua-sulco" fill="none" stroke="#D45A5E" stroke-opacity=".35" stroke-width="${s(2.5)}" stroke-linecap="round"/>
      <path class="e-lingua-brilho" fill="none" stroke="#FFF3EE" stroke-opacity=".8" stroke-width="${s(9)}" stroke-linecap="round" filter="url(#eBorrao)"/>
      <g class="e-baixo" filter="url(#eContato)">${BAIXO.map((d) => dente('e-db', d)).join('')}</g>
      <path class="e-gengiva-b" fill="none" stroke="#F4AFBE" stroke-width="${s(14)}" stroke-linecap="round"/>
      </g>
      ${C.pele ? '<path class="e-pele" fill="url(#ePele)"/>' : ''}
      <g class="e-labios" ${C.semLabios ? 'display="none"' : ''}><path class="e-labio-c" fill="url(#eLab)"/><path class="e-labio-b" fill="url(#eLab)"/>
      <ellipse class="e-labio-luz" fill="#fff" opacity=".7" filter="url(#eBorrao)"/></g>
      <path class="e-ar-boca" fill="none" stroke="#E4F9FF" stroke-opacity=".7" stroke-width="${s(7)}" stroke-linecap="round" stroke-dasharray="${s(20)} ${s(26)}" marker-end="url(#eSeta)"/>
      <path class="e-ar-nariz" fill="none" stroke="#E4F9FF" stroke-opacity=".7" stroke-width="${s(7)}" stroke-linecap="round" stroke-dasharray="${s(20)} ${s(26)}" marker-end="url(#eSeta)"/>
      <g class="e-laringe"><ellipse class="e-voz-brilho" rx="${s(90)}" ry="${s(70)}" fill="url(#eVozBrilho)"/>
        <ellipse rx="${s(26)}" ry="${s(9)}" fill="none" stroke="#F6B3C0" stroke-width="${s(7)}"/>
        <path class="e-pregas" d="M${s(-18)},0 Q0,${s(-8)} ${s(18)},0 M${s(-18)},0 Q0,${s(8)} ${s(18)},0" stroke="#FFF0F3" stroke-width="${s(4)}" fill="none"/>
        <g class="e-ondas" stroke="#FFD458" stroke-width="${s(5)}" fill="none" stroke-linecap="round" filter="url(#eBrilho)">
        ${[0, 1, 2].map((i) => `<path class="e-onda" style="--i:${i}" d="M${s(40 + i * 20)},${s(-22)} q${s(16)},${s(22)} 0,${s(44)}"/><path class="e-onda" style="--i:${i}" d="M${s(-40 - i * 20)},${s(-22)} q${s(-16)},${s(22)} 0,${s(44)}"/>`).join('')}</g></g>
      <circle class="e-marca" r="${s(34)}" fill="rgba(255,224,138,.65)" opacity="0" filter="url(#eBrilho)"/>
      <text class="e-lateral" font-family="Fredoka,sans-serif" font-weight="700" font-size="${s(22)}" fill="#E4F9FF" opacity="0">↕ ar pelos lados</text>
      <g class="e-rotulos">${Object.entries(C.rot).map(([z, [x, y]]) => `<g class="e-rot" data-zona="${z}" transform="translate(${x},${y})"><line/><circle class="e-rot-p" r="${s(3.5)}"/><rect y="${s(-15)}" height="${s(30)}" rx="${s(15)}"/><text text-anchor="middle" y="${s(6)}" font-size="${s(17)}">${ROTULOS[z]}</text></g>`).join('')}</g>
      <g class="e-alvos"></g>`;
      svg.querySelectorAll('.e-rot').forEach((g) => { const w = ROTULOS[g.dataset.zona].length * 8.6 * u + 24 * u, r = g.querySelector('rect'); r.setAttribute('x', -w / 2); r.setAttribute('width', w); });
      const ALV = { labios: [0.35, -0.05, 44], dentes: [-0.32, 0.22, 30], alveolo: [-0.85, 0.55, 30], palato: [-2.2, 1.25, 50], veu: [-4.25, 1.25, 42], garganta: [-5.0, -1.0, 50], nariz: [0.9, 1.5, 44], lingua: [-2.6, 0.0, 66], pregas: [-4.9, -4.2, 44], baixo: [-1.6, -0.6, 40] };
      const g = svg.querySelector('.e-alvos');
      for (const [z, [zz, y, r]] of Object.entries(ALV)) {
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', X(zz)); c.setAttribute('cy', Y(y)); c.setAttribute('r', r * u);
        c.setAttribute('fill', 'transparent'); c.dataset.zona = z; c.style.cursor = 'pointer'; g.appendChild(c);
      }
      svg._alv = ALV;
      const anc = { nariz: [0.9, 1.4], labios: [0.35, -0.3], dentes: [-0.28, 0.25], palato: [-2.2, 1.38], veu: [-4.3, 1.3], lingua: [-2.4, 0.15], garganta: [-4.9, -4.2] };
      svg.querySelectorAll('.e-rot').forEach((gr) => {
        const [x, y] = C.rot[gr.dataset.zona], [az, ay] = anc[gr.dataset.zona], l = gr.querySelector('line'), p = gr.querySelector('.e-rot-p');
        l.setAttribute('x1', 0); l.setAttribute('y1', 0); l.setAttribute('x2', X(az) - x); l.setAttribute('y2', Y(ay) - y); p.setAttribute('cx', X(az) - x); p.setAttribute('cy', Y(ay) - y);
      });
    }
    svg.addEventListener('click', (e) => { const el = e.target.closest('[data-zona]'); if (el) ouvintes.forEach((cb) => cb({ zona: el.dataset.zona, rotulo: el.classList.contains('e-rot') })); });
    monta(opts.personagem || 'sofia');
    const $ = (s) => svg.querySelector(s), $$ = (s) => svg.querySelectorAll(s);

    let de = P.pose(opts.fonema || 'a'), para = de, atual = de, id = opts.fonema || 'a', t0 = 0, dur = 0.5, tempo = 0, lento = false, congel = null, parado = false, marcaT = -9;
    let ultimo = performance.now();
    const reduz = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
    const scr = ([z, y]) => [X(z), Y(y)];
    // desloca uma linha de pontos (z,y) ao longo da normal "para dentro" da língua
    const desloca = (pts, d) => pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tz, ty) || 1;
      return [p[0] - (ty / L) * d, p[1] + (tz / L) * d];
    });

    function desenha() {
      if (parado) return;
      if (!svg.isConnected) { parado = true; return; } // a tela mudou: para de animar
      const agora = performance.now(), dt = Math.min(0.1, (agora - ultimo) / 1000); ultimo = agora; tempo += dt;
      const k = congel ? (congel._k ?? 1) : Math.min(1, (tempo - t0) / dur);
      const o = congel || P.mistura(de, para, P.suave(k)); if (!congel) atual = o;
      const f = P.F[id], vel = lento ? 0.4 : 1, pronto = k > 0.7 ? 1 : 0, rz = reduz();
      const lin = o.lin.map((p) => p.slice());
      if (f.modo === 'tepe' && !rz) { const ph = ((tempo * vel) % 0.9) / 0.9, b = Math.exp(-Math.pow((ph - 0.35) / 0.075, 2)) * pronto; lin[0][1] += (0.5 - lin[0][1]) * b; lin[0][0] += (-0.8 - lin[0][0]) * b; lin[1][1] += 0.18 * b; }
      let solta = 0;
      if (f.modo === 'plosiva' && !rz) { const ph = ((tempo * vel) % 1.8) / 1.8; solta = ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) * pronto : 0; if (['t', 'd'].includes(id)) { lin[0][1] -= 0.45 * solta; lin[1][1] -= 0.25 * solta; } if (['k', 'g'].includes(id)) { lin[3][1] -= 0.5 * solta; lin[2][1] -= 0.15 * solta; } }
      if (f.modo === 'vibrante' && !rz) lin[4][1] += Math.sin(tempo * 55 * vel) * 0.035 * pronto;
      const jaw = o.jaw + (f.modo === 'plosiva' ? 2.5 * solta : 0);
      const gj = (p) => P.giraMand(p, jaw);
      // língua: superfície de cima + corpo para dentro, ponta redondinha
      const sup = lin.map((p) => { const g = gj(p); return [p[0] + (g[0] - p[0]) * o.tj, p[1] + (g[1] - p[1]) * o.tj]; });
      sup[5] = [sup[5][0] + 0.1, Math.max(sup[5][1], -1.25)];
      sup.push(P.giraMand([-4.05, -1.75], jaw * 0.5));
      const D = [0.42, 0.85, 1.25, 1.45, 1.1, 0.7, 0.35], baixo = [];
      for (let i = sup.length - 1; i >= 0; i--) {
        const a = sup[Math.max(0, i - 1)], b = sup[Math.min(sup.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tz, ty) || 1;
        baixo.push([sup[i][0] - (ty / L) * D[i], sup[i][1] + (tz / L) * D[i]]);
      }
      const t0p = sup[0], t1p = baixo[baixo.length - 1];
      const ponta = [[t0p[0] + 0.12, t0p[1] - 0.08], [(t0p[0] + t1p[0]) / 2 + 0.2, (t0p[1] + t1p[1]) / 2], [t1p[0] + 0.12, t1p[1] + 0.08]];
      $('.e-lingua').setAttribute('d', suave([...ponta.slice(0, 2), ...sup, ...baixo, ponta[2]].map(scr), true));
      $('.e-lingua-brilho').setAttribute('d', suave(desloca(sup.slice(1, 4), 0.2).map(scr)));
      $('.e-lingua-sulco').setAttribute('d', suave(desloca(sup.slice(1, 5), 0.42).map(scr)));
      // céu da boca e véu
      $('.e-ceu').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z, y + 0.08]))));
      $('.e-ceu-luz').setAttribute('d', suave(P.CEU.slice(2).map(([z, y]) => scr([z, y + 0.02]))));
      $('.e-osso').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z - 0.04, y + 0.25]))));
      const v = o.vel, uv = f.modo === 'vibrante' && !rz ? Math.sin(tempo * 50 * vel) * 0.06 : 0;
      const A = [[-3.72, 1.32], [-4.38, 1.52], [-4.98, 1.47]], B = [[-3.72, 1.32], [-4.22, 1.06], [-4.5, 0.58]];
      const vp = A.map((a, i) => [a[0] + (B[i][0] - a[0]) * v, a[1] + (B[i][1] - a[1]) * v + (i === 2 ? uv : 0)]);
      const vb = vp.map(([z, y], i) => [z + (i ? 0.1 : 0), y - [0.36, 0.38, 0.2][i]]).reverse();
      $('.e-veu').setAttribute('d', suave([...vp, [vp[2][0] - 0.14, vp[2][1] - 0.16], ...vb].map(scr), true));
      $('.e-boca-fundo').setAttribute('d', suave([[-0.45, 0.25], ...P.CEU.slice(1), [-4.4, 1.38], [-5.0, 0.9], [-5.05, -1.8], [-4.6, -2.3], ...baixo.slice(0, 4), gj([-1.0, -1.0]), gj([-0.3, -0.7])].map(scr), true));
      // dentes de cima (fixos) e de baixo (giram com a mandíbula) + gengivas
      $$('.e-dc').forEach((g, i) => { const [z, , , t, gy] = CIMA[i]; g.setAttribute('transform', `translate(${X(z).toFixed(1)},${Y(gy).toFixed(1)}) scale(${C.dir || 1},1)${t === 'i' ? ' rotate(-12)' : ''}`); });
      $$('.e-db').forEach((g, i) => { const [z, , , t, gy] = BAIXO[i], p = gj([z, gy]); g.setAttribute('transform', `translate(${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}) scale(${C.dir || 1},1) rotate(${(180 - jaw + (t === 'i' ? 12 : 0)).toFixed(1)})`); });
      $('.e-gengiva-c').setAttribute('d', suave([[-0.08, 0.66], ...CIMA.map(([z, , , , gy]) => [z, gy + 0.04]), [-2.42, 0.6]].map(scr)));
      const gb = [[-0.25, -0.66], ...BAIXO.map(([z, , , , gy]) => [z, gy - 0.04]), [-2.5, -0.42]].map(gj);
      $('.e-gengiva-b').setAttribute('d', suave(gb.map(scr)));
      $('.e-chao').setAttribute('d', suave([...gb, gj([-2.7, -0.9]), gj([-1.6, -1.15]), gj([-0.5, -1.0]), gj([-0.15, -0.8])].map(scr), true));
      // lábios volumosos (contorno de "gomo"), o de baixo acompanha a mandíbula
      const ab = o.ab + (['p', 'b'].includes(id) ? 0.42 * solta : 0), zb = 0.24 + o.arr * 0.4 + (C.labDz || 0);
      let uIn = 0.05 + ab * 0.3, lIn = gj([0.15, -0.06])[1] - ab * 0.22;
      const junta = 1 - Math.min(1, ab / 0.14), m = (uIn + lIn) / 2; uIn += (m - uIn) * junta; lIn += (m - lIn) * junta;
      let zL = zb; if (o.ld > 0) { lIn += (-0.06 - lIn) * o.ld; zL += (-0.12 - zL) * o.ld; }
      const pr = 1 + o.arr * 0.35;
      $('.e-labio-c').setAttribute('d', suave([[zb - 0.85, uIn + 0.12], [zb - 0.25, uIn - 0.03], [zb + 0.14 * pr, uIn + 0.04], [zb + 0.25 * pr, uIn + 0.26], [zb + 0.1, uIn + 0.48], [zb - 0.35, uIn + 0.46]].map(scr), true));
      $('.e-labio-b').setAttribute('d', suave([[zL - 0.85, lIn - 0.14], [zL - 0.25, lIn + 0.03], [zL + 0.16 * pr, lIn - 0.05], [zL + 0.27 * pr, lIn - 0.3], [zL + 0.1, lIn - 0.55], [zL - 0.35, lIn - 0.52]].map(scr), true));
      if (C.labEsc) { const [ax, ay] = scr([zb - 0.3, (uIn + lIn) / 2]); $('.e-labios').setAttribute('transform', `translate(${ax},${ay}) scale(${C.labEsc}) translate(${-ax},${-ay})`);
        if (C.pele) { // pele que liga os lábios ao nariz e ao queixo (o rosto acompanha a boca)
          const e = C.labEsc, tr = ([x, y]) => [ax + (x - ax) * e, ay + (y - ay) * e];
          const lc = tr(scr([zb + 0.05, uIn + 0.46])), lb = tr(scr([zL + 0.06, lIn - 0.54])), fc = tr(scr([zb - 0.2, uIn + 0.2])), fb = tr(scr([zL - 0.2, lIn - 0.25]));
          $('.e-pele').setAttribute('d', suave([C.pele.cima, lc, fc, fb, lb, C.pele.baixo, ...C.pele.dentro], true));
        } }
      const ll = $('.e-labio-luz'); ll.setAttribute('cx', X(zb + 0.12 * pr)); ll.setAttribute('cy', Y(uIn + 0.26)); ll.setAttribute('rx', 0.05 * C.k); ll.setAttribute('ry', 0.1 * C.k);
      // voz e ar
      const lar = C.lar || [X(-4.9), Y(-4.2)]; $('.e-laringe').setAttribute('transform', `translate(${lar[0]},${lar[1]})`);
      const voz = o.voz > 0.5 && k > 0.5;
      svg.classList.toggle('com-voz', voz); svg.classList.toggle('lento', lento);
      $('.e-voz-brilho').setAttribute('opacity', voz ? (0.55 + 0.35 * Math.abs(Math.sin(tempo * (lento ? 2 : 5)))).toFixed(2) : 0);
      $('.e-pregas').setAttribute('transform', voz && !rz ? `scale(1,${(0.4 + 0.6 * Math.abs(Math.sin(tempo * (lento ? 12 : 30)))).toFixed(2)})` : 'scale(1,.15)');
      const ar = k > 0.6 ? f.ar : 'nenhum', meio = (i) => [sup[i][0], (sup[i][1] + Math.max(P.ceuY(sup[i][0]), sup[i][1] + 0.05)) / 2 + 0.05];
      const yb = (uIn + lIn) / 2;
      const boca = ['oral', 'oral+nasal', 'lateral'].includes(ar) && !(f.modo === 'plosiva' && solta < 0.05);
      const nariz = ar === 'nasal' || ar === 'oral+nasal';
      $('.e-ar-boca').setAttribute('d', suave([[-4.85, -1.2], [-4.82, 0.4], meio(3), meio(2), meio(1), [-0.3, yb], [0.9, yb], [2.0, yb - 0.2]].map(scr)));
      $('.e-ar-nariz').setAttribute('d', suave([[-4.95, -1.2], [-5.0, 1.0], [-4.7, 1.75], [-3.4, 2.15], [-1.6, 2.15], [0.0, 1.75], [0.85, 1.15], [1.8, 0.85]].map(scr)));
      $('.e-ar-boca').style.opacity = boca ? 1 : 0; $('.e-ar-nariz').style.opacity = nariz ? 1 : 0;
      const off = -(tempo * (lento ? 25 : 70) * (f.modo === 'fricativa' ? 1.8 : 1) * u * (solta > 0.05 ? 3 : 1));
      $('.e-ar-boca').style.strokeDashoffset = off; $('.e-ar-nariz').style.strokeDashoffset = off;
      const lt = $('.e-lateral'); lt.setAttribute('x', X(-1.6)); lt.setAttribute('y', Y(-1.15)); lt.setAttribute('opacity', ar === 'lateral' ? 1 : 0);
      const mt = tempo - marcaT; $('.e-marca').setAttribute('opacity', mt < 2.2 ? (1 - mt / 2.2) : 0);
      requestAnimationFrame(desenha);
    }
    requestAnimationFrame(desenha);

    return {
      tipo: 'svg',
      fonema(n, { instantaneo = false } = {}) { if (!P.F[n]) return; de = atual; para = P.pose(n); id = n; t0 = tempo; dur = instantaneo ? 0.0001 : (lento ? 1.7 : 0.55); congel = null; },
      personagem(p) { monta(p); },
      modo() {}, get modoAtual() { return 'lado'; }, get fonemaAtual() { return id; },
      lento(v) { lento = !!v; }, girar() {}, rotulos(v) { svg.classList.toggle('sem-rotulos', !v); },
      destacar(zona, ok = true) { const a = svg._alv[zona]; if (!a) return; const c = $('.e-marca'); c.setAttribute('cx', X(a[0])); c.setAttribute('cy', Y(a[1])); c.setAttribute('fill', ok ? 'rgba(255,224,138,.75)' : 'rgba(168,213,242,.75)'); marcaT = tempo; },
      onToque(cb) { ouvintes.push(cb); },
      pose(a, b, f) { id = b; congel = Object.assign(P.mistura(P.pose(a), P.pose(b), P.suave(f)), { _k: f }); },
      solta() { congel = null; },
      destruir() { parado = true; svg.remove(); }
    };
  }
  global.EspelhoSVG = { criar, PERS };
})(window);
