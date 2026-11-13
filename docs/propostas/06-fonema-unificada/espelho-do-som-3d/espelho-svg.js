/* FONEMA · Espelho do Som — versão 2D (SVG) do raio-X de lado.
 * Usada quando não há WebGL ou quando a página é aberta direto do disco (file://, onde módulos ES não carregam).
 * Mesmas posições de fonemas.js (FonemasPT), mesmo estilo fofo: dentinhos brancos arredondados, língua coral lisa,
 * céu da boca rosado, véu que sobe e desce, ondinhas douradas de voz e bolinhas de ar.
 * API compatível com espelho3d.js (fonema, modo, lento, destacar, onToque, pose, solta, destruir).
 */
(function (global) {
  'use strict';
  const P = global.FonemasPT;
  const NS = 'http://www.w3.org/2000/svg';
  // (z, y) → tela: rosto olhando para a esquerda
  const X = (z) => 170 + (1.7 - z) * 92, Y = (y) => 330 - y * 92;
  const pt = ([z, y]) => `${X(z).toFixed(1)},${Y(y).toFixed(1)}`;
  const FRENTE = [[4.2, 0.85], [2.7, 0.85], [2.0, 1.12], [1.45, 1.55], [1.15, 1.25], [0.9, 0.6], [0.5, 0.52], [0.0, 0.42], [-0.5, 0.45], [-1.0, 0.6], [-1.45, 0.45], [-1.85, -0.4], [-2.2, -1.6], [-2.6, -2.05], [-3.4, -2.1], [-5.6, -2.0]];
  const NUCA = [[-5.6, -5.3], [-1.8, -5.3], [-0.5, -5.7], [1.0, -6.3], [3.0, -6.7], [4.2, -6.6]];

  // curva suave (Catmull-Rom → Bézier) por pontos de tela
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
  const scr = ([z, y]) => [X(z), Y(y)];

  function criar(container, opts = {}) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 900 760'); svg.setAttribute('class', 'esp-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Raio-X de lado da boca: lábios, dentes, língua, céu da boca, nariz e garganta');
    const cabeca = suave([...FRENTE.map(([y, z]) => scr([z, y])), ...NUCA.map(([y, z]) => scr([z, y]))], false);
    svg.innerHTML = `
      <defs>
        <radialGradient id="eLing" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#FFB3B8"/><stop offset=".55" stop-color="#FF7F8C"/><stop offset="1" stop-color="#E8607A"/></radialGradient>
        <linearGradient id="eDente" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#DDEBFA"/></linearGradient>
        <filter id="eBrilho" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="${cabeca}" fill="rgba(111,184,255,.13)" stroke="#8FD0FF" stroke-width="6" filter="url(#eBrilho)" stroke-linejoin="round"/>
      <path class="e-nariz" d="${suave([[-4.85, 1.55], [-4.2, 2.08], [-2.6, 2.28], [-1.0, 2.12], [0.15, 1.7], [0.78, 1.18]].map(scr))}" fill="none" stroke="rgba(199,166,255,.55)" stroke-width="58" stroke-linecap="round"/>
      <path class="e-garg" d="${suave([[-4.72, 2.0], [-5.02, 1.2], [-5.05, -0.6], [-4.95, -2.6], [-4.88, -4.0]].map(scr))}" fill="none" stroke="rgba(255,159,192,.45)" stroke-width="64" stroke-linecap="round"/>
      <path class="e-boca-fundo" fill="rgba(122,43,74,.55)"/>
      <path class="e-ceu" fill="none" stroke="#F6A9BD" stroke-width="20" stroke-linecap="round"/>
      <path class="e-osso" fill="none" stroke="#F8E5C4" stroke-width="12" stroke-linecap="round"/>
      <path class="e-veu" fill="#F28CA6" stroke="#E07090" stroke-width="2"/>
      <path class="e-lingua" fill="url(#eLing)" stroke="#E0607A" stroke-width="3"/>
      <rect class="e-dente-c" width="30" height="58" rx="12" fill="url(#eDente)" stroke="#BCD3EA" stroke-width="2"/>
      <rect class="e-dente-b" width="28" height="52" rx="12" fill="url(#eDente)" stroke="#BCD3EA" stroke-width="2"/>
      <ellipse class="e-labio-c" rx="26" ry="24" fill="#D8636F"/>
      <ellipse class="e-labio-b" rx="28" ry="27" fill="#D8636F"/>
      <g class="e-laringe" transform="translate(${X(-4.9)},${Y(-4.2)})"><ellipse rx="44" ry="15" fill="none" stroke="#F3A0B0" stroke-width="12"/><g class="e-ondas" stroke="#FFD04A" stroke-width="7" fill="none" stroke-linecap="round">
        ${[0, 1, 2].map((i) => `<path class="e-onda" style="--i:${i}" d="M${70 + i * 26},-30 q22,30 0,60"/><path class="e-onda" style="--i:${i}" d="M${-70 - i * 26},-30 q-22,30 0,60"/>`).join('')}</g></g>
      <g class="e-ar"></g>
      <circle class="e-marca" r="34" fill="rgba(255,224,138,.6)" opacity="0"/>
      <g class="e-alvos"></g>`;
    container.appendChild(svg);
    const $ = (s) => svg.querySelector(s);
    const ALVOS = { labios: [0.35, -0.05, 46], dentes: [-0.32, 0.2, 30], alveolo: [-0.85, 0.55, 32], palato: [-2.2, 1.25, 52], veu: [-4.25, 1.25, 44], garganta: [-5.0, -1.0, 52], nariz: [0.4, 1.6, 46], lingua: [-2.6, 0.0, 70], pregas: [-4.9, -4.2, 46] };
    const alvos = $('.e-alvos');
    for (const [z, [zz, y, r]] of Object.entries(ALVOS)) {
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', X(zz)); c.setAttribute('cy', Y(y)); c.setAttribute('r', r);
      c.setAttribute('fill', 'transparent'); c.dataset.zona = z; c.style.cursor = 'pointer'; alvos.appendChild(c);
    }
    const ouvintes = [];
    alvos.addEventListener('click', (e) => { const z = e.target.dataset && e.target.dataset.zona; if (z) ouvintes.forEach((cb) => cb({ zona: z })); });
    // ar: bolinhas que andam por caminhos
    const gAr = $('.e-ar'), NB = 24, bol = [];
    for (let i = 0; i < NB; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 6); c.setAttribute('fill', '#BFF3FF'); gAr.appendChild(c); bol.push({ c, t: i / NB, cam: i % 2 }); }

    let de = P.pose(opts.fonema || 'a'), para = de, atual = de, id = opts.fonema || 'a', t0 = 0, dur = 0.5, tempo = 0, lento = false, congel = null, parado = false, marcaT = -9;
    let ultimo = performance.now();
    const reduz = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function desenha() {
      if (parado) return;
      const agora = performance.now(), dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora; tempo += dt;
      const k = congel ? 1 : Math.min(1, (tempo - t0) / dur);
      const o = congel || P.mistura(de, para, P.suave(k)); atual = o;
      const f = P.F[id], vel = lento ? 0.4 : 1, pronto = k > 0.7 ? 1 : 0;
      const lin = o.lin.map((p) => p.slice());
      if (f.modo === 'tepe' && !reduz) { const ph = ((tempo * vel) % 0.9) / 0.9, b = Math.exp(-Math.pow((ph - 0.35) / 0.075, 2)) * pronto; lin[0][1] += (0.5 - lin[0][1]) * b; lin[0][0] += (-0.8 - lin[0][0]) * b; }
      let solta = 0;
      if (f.modo === 'plosiva' && !reduz) { const ph = ((tempo * vel) % 1.8) / 1.8; solta = ph > 0.62 ? Math.sin(((ph - 0.62) / 0.38) * Math.PI) * pronto : 0; if (['t', 'd'].includes(id)) lin[0][1] -= 0.45 * solta; if (['k', 'g'].includes(id)) lin[3][1] -= 0.5 * solta; }
      const jaw = o.jaw + (f.modo === 'plosiva' ? 2.5 * solta : 0);
      // língua: superfície de cima + corpo para dentro (normal), suavizado
      const sup = lin.map((p) => { const g = P.giraMand(p, jaw); return [p[0] + (g[0] - p[0]) * o.tj, p[1] + (g[1] - p[1]) * o.tj]; });
      sup.push(P.giraMand([-4.35, -2.15], jaw * 0.5));
      const D = [0.4, 0.8, 1.25, 1.5, 1.2, 0.75, 0.4], baixo = [];
      for (let i = sup.length - 1; i >= 0; i--) {
        const a = sup[Math.max(0, i - 1)], b = sup[Math.min(sup.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tz, ty) || 1;
        baixo.push([sup[i][0] - (ty / L) * D[i], sup[i][1] + (tz / L) * D[i]]);
      }
      $('.e-lingua').setAttribute('d', suave([[sup[0][0] + 0.12, sup[0][1] - 0.12], ...sup, ...baixo].map(scr), true));
      // céu da boca e véu
      $('.e-ceu').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z, y + 0.06]))));
      $('.e-osso').setAttribute('d', suave(P.CEU.slice(1).map(([z, y]) => scr([z - 0.04, y + 0.2]))));
      const v = o.vel, uv = f.modo === 'vibrante' && !reduz ? Math.sin(tempo * 50 * vel) * 0.06 : 0;
      const A = [[-3.72, 1.3], [-4.38, 1.52], [-4.98, 1.47]], B = [[-3.72, 1.3], [-4.22, 1.06], [-4.5, 0.58]];
      const vp = A.map((a, i) => [a[0] + (B[i][0] - a[0]) * v, a[1] + (B[i][1] - a[1]) * v + (i === 2 ? uv : 0)]);
      const vb = vp.map(([z, y], i) => [z + (i ? 0.1 : 0), y - [0.34, 0.36, 0.2][i]]).reverse();
      $('.e-veu').setAttribute('d', suave([...vp, [vp[2][0] - 0.12, vp[2][1] - 0.15], ...vb].map(scr), true));
      // fundo escuro da boca
      $('.e-boca-fundo').setAttribute('d', suave([[-0.6, 0.15], ...P.CEU.slice(1), [-4.4, 1.3], [-4.95, 0.9], [-4.95, -1.6], ...sup.slice().reverse().slice(0, 4), [-0.6, -0.3]].map(scr), true));
      // dentes (incisivos): de cima fixo, de baixo gira com a mandíbula
      const dc = $('.e-dente-c'); dc.setAttribute('x', X(-0.27) - 15); dc.setAttribute('y', Y(0.55)); dc.setAttribute('transform', `rotate(-8 ${X(-0.27)} ${Y(0.25)})`);
      const li = P.giraMand([-0.45, -0.15], jaw), db = $('.e-dente-b');
      db.setAttribute('x', X(li[0]) - 14); db.setAttribute('y', Y(li[1]) - 2); db.setAttribute('transform', `rotate(${8 + jaw} ${X(li[0])} ${Y(li[1])})`);
      // lábios
      const ab = o.ab + (['p', 'b'].includes(id) ? 0.42 * solta : 0), zb = 0.22 + o.arr * 0.4;
      let yU = 0.05 + ab * 0.3 + 0.23, yL = P.giraMand([0.15, -0.06], jaw)[1] - ab * 0.22 - 0.25;
      const junta = 1 - Math.min(1, ab / 0.14); const m = (yU + yL) / 2; yU += (m + 0.23 - yU) * junta; yL += (m - 0.25 - yL) * junta;
      let zL = zb; if (o.ld > 0) { yL += (-0.3 - yL) * o.ld; zL += (-0.06 - zL) * o.ld; }
      const lc = $('.e-labio-c'), lb = $('.e-labio-b');
      lc.setAttribute('cx', X(zb)); lc.setAttribute('cy', Y(yU)); lb.setAttribute('cx', X(zL)); lb.setAttribute('cy', Y(yL));
      lc.setAttribute('rx', 24 + o.arr * 10); lb.setAttribute('rx', 26 + o.arr * 10);
      // voz
      svg.classList.toggle('com-voz', !!(o.voz > 0.5 && k > 0.5)); svg.classList.toggle('lento', lento);
      // ar
      const ar = k > 0.6 ? f.ar : 'nenhum';
      const meio = (i) => [sup[i][0], (sup[i][1] + Math.max(P.ceuY(sup[i][0]), sup[i][1] + 0.05)) / 2 + 0.05];
      const oral = [[-4.9, -4.0], [-4.95, -1.6], [-4.85, 0.55], meio(3), meio(2), meio(1), [-0.25, (yU + yL) / 2], [0.6, (yU + yL) / 2], [2.0, (yU + yL) / 2 - 0.1]];
      const nasal = [[-4.9, -4.0], [-5.0, -1.6], [-5.0, 1.05], [-4.85, 1.55], [-4.2, 2.08], [-2.6, 2.28], [-1.0, 2.12], [0.15, 1.7], [0.78, 1.18], [1.9, 0.95]];
      const em = (cam, t) => { const n = cam.length - 1, u = t * n, i = Math.min(n - 1, Math.floor(u)), r = u - i; return [cam[i][0] + (cam[i + 1][0] - cam[i][0]) * r, cam[i][1] + (cam[i + 1][1] - cam[i][1]) * r]; };
      const fecha = { p: 0.88, b: 0.88, t: 0.75, d: 0.75, k: 0.45, g: 0.45 }[id];
      bol.forEach((b, i) => {
        let cam = null;
        if (b.cam === 0 && ['oral', 'oral+nasal', 'lateral'].includes(ar)) cam = oral;
        if (b.cam === 1 && ['nasal', 'oral+nasal'].includes(ar)) cam = nasal;
        if (b.cam === 1 && (ar === 'oral' || ar === 'lateral')) cam = oral;
        if (!cam || reduz) { b.c.setAttribute('opacity', 0); return; }
        b.t += dt * (lento ? 0.15 : 0.42) * (f.modo === 'fricativa' ? 1.6 : 1) * (solta > 0.05 ? 3 : 1);
        if (f.modo === 'plosiva' && solta < 0.05 && fecha && b.t > fecha) b.t = fecha - 0.03 * Math.random();
        if (b.t > 1) b.t -= 1;
        const [z, y] = em(cam, b.t);
        b.c.setAttribute('cx', X(z)); b.c.setAttribute('cy', Y(y) + (i % 3 - 1) * 4); b.c.setAttribute('opacity', Math.min(1, b.t * 6, (1 - b.t) * 5) * 0.9);
        b.c.setAttribute('r', f.modo === 'fricativa' ? 4 : 6);
      });
      const mt = tempo - marcaT; $('.e-marca').setAttribute('opacity', mt < 2 ? (1 - mt / 2) : 0);
      requestAnimationFrame(desenha);
    }
    requestAnimationFrame(desenha);

    return {
      tipo: 'svg',
      fonema(n, { instantaneo = false } = {}) { if (!P.F[n]) return; de = atual; para = P.pose(n); id = n; t0 = tempo; dur = instantaneo ? 0.0001 : (lento ? 1.7 : 0.55); congel = null; },
      modo() {}, get modoAtual() { return 'lado'; }, get fonemaAtual() { return id; },
      lento(v) { lento = !!v; }, girar() {}, rotulos() {},
      destacar(zona, ok = true) { const a = ALVOS[zona]; if (!a) return; const c = $('.e-marca'); c.setAttribute('cx', X(a[0])); c.setAttribute('cy', Y(a[1])); c.setAttribute('fill', ok ? 'rgba(255,224,138,.7)' : 'rgba(168,213,242,.7)'); marcaT = tempo; },
      onToque(cb) { ouvintes.push(cb); },
      pose(a, b, f) { id = b; congel = P.mistura(P.pose(a), P.pose(b), P.suave(f)); },
      solta() { congel = null; },
      destruir() { parado = true; svg.remove(); }
    };
  }
  global.EspelhoSVG = { criar };
})(window);
