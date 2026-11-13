/* FONEMA · Espelho do Som — RAIO-X HÍBRIDO (de lado), com a cara da Sofia ou do Tales.
 *
 * Fundo: a cabeça de "vidro" da Sofia/Tales (imagens/v2-raio-x-*.png) com a boca e a garganta apagadas
 * por recortar.py (recortes/raiox-*-limpo.jpg). Por cima, alinhado ao perfil, este boneco 2D animado e fiel:
 * língua coral lisa e gordinha, poucos dentes brancos arredondados em 2 fileiras, lábios macios, céu da boca
 * e véu, setinhas de ar (boca/nariz) e ondinhas douradas de voz na garganta.
 * As posições vêm de fonemas.js (FonemasPT) — simplificadas, VALIDAR COM FONOAUDIÓLOGA.
 * Também é a versão usada sem WebGL ou em file:// (não depende de módulos ES).
 *
 *   const rx = EspelhoSVG.criar(div, { fonema: 'm', personagem: 'sofia' });
 *   rx.fonema('a'); rx.personagem('tales'); rx.lento(true); rx.onToque(({ zona }) => …); rx.destacar('alveolo');
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  const BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^/]*$/, '');

  // Encaixe do boneco (unidades ≈ cm, rosto para +z) em cada imagem (pixels de 1376×768)
  const PERS = {
    sofia: { img: 'recortes/raiox-sofia-limpo.jpg', x0: 638, y0: 385, k: 54.5, gar: 0.45, vb: [430, 150, 760, 490],
      rot: { nariz: [520, 250], labios: [520, 420], dentes: [520, 335], palato: [745, 225], veu: [990, 300], lingua: [985, 455], garganta: [1060, 560] } },
    tales: { img: 'recortes/raiox-tales-limpo.jpg', x0: 530, y0: 432, k: 36.7, gar: 0.5, vb: [372, 228, 690, 445],
      rot: { nariz: [430, 330], labios: [425, 470], dentes: [425, 405], palato: [600, 305], veu: [800, 360], lingua: [790, 500], garganta: [840, 560] } }
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

  // dentes laterais (fora do meio): ficam atrás da língua, um pouco transparentes
  const LATERAIS = [[-0.74, 0.36, 0.46, 0.0], [-1.16, 0.4, 0.44, 0.08], [-1.64, 0.5, 0.42, 0.14], [-2.2, 0.54, 0.42, 0.16]]; // z, largura, altura, ponta

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
      X = (z) => C.x0 + (0.2 - z) * C.k;
      Y = (y) => (y >= -2 ? C.y0 - y * C.k : C.y0 + 2 * C.k + (-2 - y) * C.k * C.gar);
      svg.setAttribute('viewBox', C.vb.join(' '));
      const s = (v) => (v * u).toFixed(1);
      const lat = (cls) => LATERAIS.map(() => `<rect class="${cls}" rx="${s(14)}" fill="url(#eDente)" stroke="#BCD3EA" stroke-width="${s(2)}"/>`).join('');
      svg.innerHTML = `
      <defs>
        <radialGradient id="eLing" cx="42%" cy="28%" r="80%"><stop offset="0" stop-color="#FFC2B5"/><stop offset=".45" stop-color="#FF8A72"/><stop offset="1" stop-color="#E9606A"/></radialGradient>
        <linearGradient id="eDente" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F3F8FF"/><stop offset="1" stop-color="#D5E5F7"/></linearGradient>
        <radialGradient id="eLab" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F7A2A6"/><stop offset="1" stop-color="#D2646F"/></radialGradient>
        <radialGradient id="eBoca" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#5E2A4E" stop-opacity=".75"/><stop offset="1" stop-color="#3B2A5E" stop-opacity=".35"/></radialGradient>
        <filter id="eSuave"><feGaussianBlur stdDeviation="${s(5)}"/></filter>
        <filter id="eBrilho" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${s(3)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="eSeta" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#C8F4FF"/></marker>
      </defs>
      <image href="${BASE}${C.img}" x="0" y="0" width="1376" height="768"/>
      <path class="e-boca-fundo" fill="url(#eBoca)" filter="url(#eSuave)"/>
      <g class="e-lat-c" opacity=".55">${lat('e-lc')}</g><g class="e-lat-b" opacity=".55">${lat('e-lb')}</g>
      <path class="e-ceu" fill="none" stroke="#F6A9BD" stroke-width="${s(22)}" stroke-linecap="round"/>
      <path class="e-osso" fill="none" stroke="#FBEAD0" stroke-width="${s(12)}" stroke-linecap="round"/>
      <path class="e-veu" fill="#F28CA6" stroke="#E07090" stroke-width="${s(2)}"/>
      <path class="e-lingua" fill="url(#eLing)" stroke="#E0606E" stroke-width="${s(2.5)}"/>
      <path class="e-lingua-brilho" fill="none" stroke="#FFE3DC" stroke-opacity=".75" stroke-width="${s(7)}" stroke-linecap="round"/>
      <rect class="e-dente-c" width="${s(34)}" height="${s(56)}" rx="${s(15)}" fill="url(#eDente)" stroke="#BCD3EA" stroke-width="${s(2)}"/>
      <rect class="e-dente-b" width="${s(30)}" height="${s(50)}" rx="${s(14)}" fill="url(#eDente)" stroke="#BCD3EA" stroke-width="${s(2)}"/>
      <ellipse class="e-labio-c" fill="url(#eLab)"/><ellipse class="e-labio-b" fill="url(#eLab)"/>
      <path class="e-ar-boca" fill="none" stroke="#C8F4FF" stroke-width="${s(9)}" stroke-linecap="round" stroke-dasharray="${s(26)} ${s(22)}" marker-end="url(#eSeta)" filter="url(#eBrilho)"/>
      <path class="e-ar-nariz" fill="none" stroke="#C8F4FF" stroke-width="${s(9)}" stroke-linecap="round" stroke-dasharray="${s(26)} ${s(22)}" marker-end="url(#eSeta)" filter="url(#eBrilho)"/>
      <g class="e-laringe"><ellipse rx="${s(30)}" ry="${s(11)}" fill="none" stroke="#F3A0B0" stroke-width="${s(9)}"/>
        <path class="e-pregas" d="M${s(-22)},0 Q0,${s(-9)} ${s(22)},0 M${s(-22)},0 Q0,${s(9)} ${s(22)},0" stroke="#FFF0F3" stroke-width="${s(5)}" fill="none"/>
        <g class="e-ondas" stroke="#FFD04A" stroke-width="${s(7)}" fill="none" stroke-linecap="round" filter="url(#eBrilho)">
        ${[0, 1, 2].map((i) => `<path class="e-onda" style="--i:${i}" d="M${s(48 + i * 24)},${s(-26)} q${s(20)},${s(26)} 0,${s(52)}"/><path class="e-onda" style="--i:${i}" d="M${s(-48 - i * 24)},${s(-26)} q${s(-20)},${s(26)} 0,${s(52)}"/>`).join('')}</g></g>
      <circle class="e-marca" r="${s(36)}" fill="rgba(255,224,138,.65)" opacity="0" filter="url(#eBrilho)"/>
      <text class="e-lateral" font-family="Fredoka,sans-serif" font-weight="700" font-size="${s(26)}" fill="#C8F4FF" opacity="0">↕ ar pelos lados</text>
      <g class="e-rotulos">${Object.entries(C.rot).map(([z, [x, y]]) => `<g class="e-rot" data-zona="${z}" transform="translate(${x},${y})"><line class="e-rot-l"/><rect x="${s(-80)}" y="${s(-22)}" width="${s(160)}" height="${s(44)}" rx="${s(14)}"/><text text-anchor="middle" y="${s(9)}" font-size="${s(24)}">${ROTULOS[z]}</text></g>`).join('')}</g>
      <g class="e-alvos"></g>`;
      // rótulos com largura do texto
      svg.querySelectorAll('.e-rot').forEach((g) => { const t = g.querySelector('text'), w = ROTULOS[g.dataset.zona].length * 12.5 * u + 30 * u; const r = g.querySelector('rect'); r.setAttribute('x', -w / 2); r.setAttribute('width', w); });
      const ALV = { labios: [0.35, -0.05, 44], dentes: [-0.32, 0.22, 30], alveolo: [-0.85, 0.55, 30], palato: [-2.2, 1.25, 50], veu: [-4.25, 1.25, 42], garganta: [-5.0, -1.0, 50], nariz: [0.9, 1.5, 44], lingua: [-2.6, 0.0, 66], pregas: [-4.9, -4.2, 44], baixo: [-1.6, -0.6, 40] };
      const g = svg.querySelector('.e-alvos');
      for (const [z, [zz, y, r]] of Object.entries(ALV)) {
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', X(zz)); c.setAttribute('cy', Y(y)); c.setAttribute('r', r * u);
        c.setAttribute('fill', 'transparent'); c.dataset.zona = z; c.style.cursor = 'pointer'; g.appendChild(c);
      }
      svg._alv = ALV;
      // linhas dos rótulos até a parte
      const anc = { nariz: [0.9, 1.4], labios: [0.3, -0.25], dentes: [-0.3, 0.2], palato: [-2.2, 1.35], veu: [-4.3, 1.3], lingua: [-2.4, 0.1], garganta: [-4.9, -4.2] };
      svg.querySelectorAll('.e-rot').forEach((gr) => { const [x, y] = C.rot[gr.dataset.zona], [az, ay] = anc[gr.dataset.zona], l = gr.querySelector('line'); l.setAttribute('x1', 0); l.setAttribute('y1', 0); l.setAttribute('x2', X(az) - x); l.setAttribute('y2', Y(ay) - y); });
    }
    svg.addEventListener('click', (e) => { const el = e.target.closest('[data-zona]'); if (el) ouvintes.forEach((cb) => cb({ zona: el.dataset.zona, rotulo: el.classList.contains('e-rot') })); });
    monta(opts.personagem || 'sofia');
    const $ = (s) => svg.querySelector(s), $$ = (s) => svg.querySelectorAll(s);

    let de = P.pose(opts.fonema || 'a'), para = de, atual = de, id = opts.fonema || 'a', t0 = 0, dur = 0.5, tempo = 0, lento = false, congel = null, parado = false, marcaT = -9;
    let ultimo = performance.now();
    const reduz = () => (global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('calmo');
    const scr = ([z, y]) => [X(z), Y(y)];

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
      // língua: superfície de cima + corpo para dentro
      const sup = lin.map((p) => { const g = P.giraMand(p, jaw); return [p[0] + (g[0] - p[0]) * o.tj, p[1] + (g[1] - p[1]) * o.tj]; });
      sup[5] = [sup[5][0] + 0.1, Math.max(sup[5][1], -1.25)];
      sup.push(P.giraMand([-4.05, -1.75], jaw * 0.5));
      const D = [0.42, 0.85, 1.25, 1.45, 1.1, 0.7, 0.35], baixo = [];
      for (let i = sup.length - 1; i >= 0; i--) {
        const a = sup[Math.max(0, i - 1)], b = sup[Math.min(sup.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tz, ty) || 1;
        baixo.push([sup[i][0] - (ty / L) * D[i], sup[i][1] + (tz / L) * D[i]]);
      }
      const ponta = [sup[0][0] + 0.13, sup[0][1] - 0.13];
      $('.e-lingua').setAttribute('d', suave([ponta, ...sup, ...baixo].map(scr), true));
      $('.e-lingua-brilho').setAttribute('d', suave(sup.slice(1, 4).map(([z, y]) => scr([z, y - 0.16]))));
      // céu da boca e véu
      $('.e-ceu').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z, y + 0.06]))));
      $('.e-osso').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z - 0.04, y + 0.22]))));
      const v = o.vel, uv = f.modo === 'vibrante' && !rz ? Math.sin(tempo * 50 * vel) * 0.06 : 0;
      const A = [[-3.72, 1.3], [-4.38, 1.52], [-4.98, 1.47]], B = [[-3.72, 1.3], [-4.22, 1.06], [-4.5, 0.58]];
      const vp = A.map((a, i) => [a[0] + (B[i][0] - a[0]) * v, a[1] + (B[i][1] - a[1]) * v + (i === 2 ? uv : 0)]);
      const vb = vp.map(([z, y], i) => [z + (i ? 0.1 : 0), y - [0.34, 0.36, 0.2][i]]).reverse();
      $('.e-veu').setAttribute('d', suave([...vp, [vp[2][0] - 0.12, vp[2][1] - 0.15], ...vb].map(scr), true));
      $('.e-boca-fundo').setAttribute('d', suave([[-0.5, 0.2], ...P.CEU.slice(1), [-4.4, 1.35], [-5.0, 0.9], [-5.05, -1.8], [-4.6, -2.3], ...baixo.slice(0, 4), [-0.5, -0.4]].map(scr), true));
      // dentes: incisivos (no meio, opacos) e laterais (atrás)
      const ic = [X(-0.27), Y(0.24)], dc = $('.e-dente-c');
      dc.setAttribute('x', ic[0] - 17 * u); dc.setAttribute('y', Y(0.58)); dc.setAttribute('transform', `rotate(-10 ${ic[0]} ${ic[1]})`);
      const li = P.giraMand([-0.45, -0.12], jaw), db = $('.e-dente-b');
      db.setAttribute('x', X(li[0]) - 15 * u); db.setAttribute('y', Y(li[1])); db.setAttribute('transform', `rotate(${10 + jaw} ${X(li[0])} ${Y(li[1])})`);
      $$('.e-lc').forEach((r, i) => { const [z, w, h, pt] = LATERAIS[i]; r.setAttribute('x', X(z) - (w * C.k) / 2); r.setAttribute('y', Y(pt + h)); r.setAttribute('width', w * C.k * 0.92); r.setAttribute('height', h * C.k); });
      $$('.e-lb').forEach((r, i) => { const [z, w, h, pt] = LATERAIS[i], p = P.giraMand([z, pt - 0.1], jaw); r.setAttribute('x', X(p[0]) - (w * C.k) / 2); r.setAttribute('y', Y(p[1])); r.setAttribute('width', w * C.k * 0.92); r.setAttribute('height', h * C.k * 0.9); r.setAttribute('transform', `rotate(${jaw} ${X(p[0])} ${Y(p[1])})`); });
      // lábios
      const ab = o.ab + (['p', 'b'].includes(id) ? 0.42 * solta : 0), zb = 0.22 + o.arr * 0.4;
      let yU = 0.05 + ab * 0.3 + 0.28, yL = P.giraMand([0.15, -0.06], jaw)[1] - ab * 0.22 - 0.31;
      const junta = 1 - Math.min(1, ab / 0.14), m = (yU - 0.28 + yL + 0.31) / 2; yU += (m + 0.28 - yU) * junta; yL += (m - 0.31 - yL) * junta;
      let zL = zb; if (o.ld > 0) { yL += (-0.36 - yL) * o.ld; zL += (-0.1 - zL) * o.ld; }
      const lc = $('.e-labio-c'), lb = $('.e-labio-b');
      lc.setAttribute('cx', X(zb)); lc.setAttribute('cy', Y(yU)); lc.setAttribute('rx', (0.3 + o.arr * 0.12) * C.k); lc.setAttribute('ry', 0.3 * C.k);
      lb.setAttribute('cx', X(zL)); lb.setAttribute('cy', Y(yL)); lb.setAttribute('rx', (0.32 + o.arr * 0.12) * C.k); lb.setAttribute('ry', 0.33 * C.k);
      // voz e ar
      const lar = [X(-4.9), Y(-4.2)]; $('.e-laringe').setAttribute('transform', `translate(${lar[0]},${lar[1]})`);
      const voz = o.voz > 0.5 && k > 0.5;
      svg.classList.toggle('com-voz', voz); svg.classList.toggle('lento', lento);
      $('.e-pregas').setAttribute('transform', voz && !rz ? `scale(1,${(0.4 + 0.6 * Math.abs(Math.sin(tempo * (lento ? 12 : 30)))).toFixed(2)})` : 'scale(1,.15)');
      const ar = k > 0.6 ? f.ar : 'nenhum', meio = (i) => [sup[i][0], (sup[i][1] + Math.max(P.ceuY(sup[i][0]), sup[i][1] + 0.05)) / 2 + 0.05];
      const yb = (yU - 0.28 + yL + 0.31) / 2;
      const boca = ['oral', 'oral+nasal', 'lateral'].includes(ar) && !(f.modo === 'plosiva' && solta < 0.05);
      const nariz = ar === 'nasal' || ar === 'oral+nasal';
      $('.e-ar-boca').setAttribute('d', suave([[-4.85, -1.2], [-4.82, 0.4], meio(3), meio(2), meio(1), [-0.3, yb], [0.9, yb], [2.0, yb - 0.2]].map(scr)));
      $('.e-ar-nariz').setAttribute('d', suave([[-4.95, -1.2], [-5.0, 1.0], [-4.7, 1.75], [-3.4, 2.15], [-1.6, 2.15], [0.0, 1.75], [0.85, 1.15], [1.8, 0.85]].map(scr)));
      $('.e-ar-boca').style.opacity = boca ? 1 : 0; $('.e-ar-nariz').style.opacity = nariz ? 1 : 0;
      const off = -(tempo * (lento ? 25 : 70) * (f.modo === 'fricativa' ? 1.8 : 1) * u * (solta > 0.05 ? 3 : 1));
      $('.e-ar-boca').style.strokeDashoffset = off; $('.e-ar-nariz').style.strokeDashoffset = off;
      const lt = $('.e-lateral'); lt.setAttribute('x', X(-1.6)); lt.setAttribute('y', Y(-1.05)); lt.setAttribute('opacity', ar === 'lateral' ? 1 : 0);
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
