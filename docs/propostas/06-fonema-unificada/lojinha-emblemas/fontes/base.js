/* FONEMA · Lojinha & Emblemas — biblioteca de ilustração (SVG com volume, brilho e sombra) */
(function (W) {
  const rgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const lt = (c, t) => mix(c, '#fffaf0', t), dk = (c, t) => mix(c, '#2a140a', t);
  let UID = 0;

  /* contexto de um SVG: registra gradientes com ids únicos */
  function Ctx() { this.p = 'g' + (UID++) + '_'; this.n = 0; this.defs = []; }
  Ctx.prototype.id = function () { return this.p + (this.n++); };
  // volume esférico: luz em cima-esquerda
  Ctx.prototype.r = function (c, o = {}) {
    const id = this.id();
    this.defs.push(`<radialGradient id="${id}" cx="${o.cx ?? 32}%" cy="${o.cy ?? 28}%" r="${o.r ?? 85}%"><stop offset="0" stop-color="${lt(c, o.hi ?? .42)}"/><stop offset="${o.m ?? .5}" stop-color="${c}"/><stop offset="1" stop-color="${dk(c, o.lo ?? .38)}"/></radialGradient>`);
    return `url(#${id})`;
  };
  // volume cilíndrico/linear
  Ctx.prototype.l = function (c, o = {}) {
    const id = this.id(); const [x1, y1, x2, y2] = o.dir || [0, 0, 0, 1];
    this.defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${lt(c, o.hi ?? .35)}"/><stop offset="${o.m ?? .45}" stop-color="${c}"/><stop offset="1" stop-color="${dk(c, o.lo ?? .32)}"/></linearGradient>`);
    return `url(#${id})`;
  };
  // cilindro horizontal (luz no centro-esquerda)
  Ctx.prototype.cyl = function (c, o = {}) {
    const id = this.id(); const [x1, y1, x2, y2] = o.dir || [0, 0, 1, 0];
    this.defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${dk(c, .25)}"/><stop offset=".28" stop-color="${lt(c, .4)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dk(c, .4)}"/></linearGradient>`);
    return `url(#${id})`;
  };
  Ctx.prototype.stops = function (arr, dir = [0, 0, 0, 1], radial) {
    const id = this.id(); const st = arr.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
    this.defs.push(radial ? `<radialGradient id="${id}" cx="${dir[0]}%" cy="${dir[1]}%" r="${dir[2]}%">${st}</radialGradient>` : `<linearGradient id="${id}" x1="${dir[0]}" y1="${dir[1]}" x2="${dir[2]}" y2="${dir[3]}">${st}</linearGradient>`);
    return `url(#${id})`;
  };
  Ctx.prototype.sh = function (cx, cy, rx, ry, a = .32) { // sombra no chão
    const id = this.id();
    this.defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="#3b1d0c" stop-opacity="${a}"/><stop offset=".6" stop-color="#3b1d0c" stop-opacity="${a * .45}"/><stop offset="1" stop-color="#3b1d0c" stop-opacity="0"/></radialGradient>`);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry ?? rx * .22}" fill="url(#${id})"/>`;
  };
  Ctx.prototype.svg = function (body, vb = '0 0 200 200', extra = '') {
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${extra}><defs>${this.defs.join('')}</defs>${body}</svg>`;
  };
  const S = (c, t = .55) => dk(c, t); // contorno: tom escuro da própria cor
  const gl = (d, o = .55) => `<path d="${d}" fill="#fff" opacity="${o}"/>`; // brilho
  const spark = (x, y, s = 1, o = .95) => `<path transform="translate(${x},${y}) scale(${s})" d="M0,-10 C1.5,-2 2,-1.5 10,0 C2,1.5 1.5,2 0,10 C-1.5,2 -2,1.5 -10,0 C-2,-1.5 -1.5,-2 0,-10Z" fill="#fff" opacity="${o}"/>`;
  const sw = 'stroke-linejoin="round" stroke-linecap="round"';

  W.FX = { mix, lt, dk, Ctx, S, gl, spark, sw };

  /* ======================= ITENS ======================= */
  const I = {};
  const def = (k, nome, cat, fn) => I[k] = { k, nome, cat, fn };

  /* ---------- ROUPAS ---------- */
  def('bone', 'BONÉ', 'roupa', c => {
    const b = '#D9483B', v = '#F2B33D';
    return c.sh(100, 160, 70) + `
    <path d="M44,128 Q46,62 100,58 Q154,62 156,124 Z" fill="${c.r(b, { cx: 35, cy: 25 })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M100,60 Q88,90 92,128 M100,60 Q124,86 128,126 M100,60 Q70,84 64,128" stroke="${dk(b, .3)}" stroke-width="2.5" fill="none" opacity=".7"/>
    <path d="M38,124 Q100,108 168,124 Q184,140 158,150 Q100,136 40,140 Q28,134 38,124Z" fill="${c.l(v, { dir: [0, 0, 0, 1] })}" stroke="${S(v)}" stroke-width="3.5" ${sw}/>
    <path d="M52,128 Q100,116 160,128" stroke="#fff" stroke-width="3" opacity=".55" fill="none" stroke-dasharray="6 6"/>
    <circle cx="100" cy="60" r="8" fill="${c.r(v)}" stroke="${S(v)}" stroke-width="3"/>
    <circle cx="112" cy="96" r="15" fill="${c.r('#FFFBF4')}" stroke="${S(b, .3)}" stroke-width="2.5"/>
    <path d="M112,86 l3,7 7,0 -6,4 2,7 -6,-4 -6,4 2,-7 -6,-4 7,0z" fill="${c.r(v)}"/>
    ${gl('M58,108 Q60,78 86,68 Q70,86 66,110Z')}${spark(150, 70, .9)}`;
  });
  def('bota', 'BOTA', 'roupa', c => {
    const b = '#F2B33D', so = '#7A4B2E';
    const boot = (tx, s, tone) => `<g transform="translate(${tx},0) scale(${s})">
      <path d="M58,40 h44 q6,0 6,6 v78 q34,4 46,22 q6,12 -4,18 h-100 q-6,0 -6,-6 v-112 q0,-6 6,-6z" fill="${c.l(tone, { dir: [0, 0, 1, 1] })}" stroke="${S(tone)}" stroke-width="3.5" ${sw}/>
      <path d="M48,150 h108 q4,8 -4,14 h-100 q-6,0 -6,-6z" fill="${c.l(so)}" stroke="${S(so)}" stroke-width="3" ${sw}/>
      <rect x="54" y="40" width="54" height="16" rx="6" fill="${c.l(lt(tone, .2))}" stroke="${S(tone)}" stroke-width="3"/>
      <circle cx="84" cy="98" r="9" fill="${c.r('#2F6B43')}"/><path d="M84,90 q4,8 0,16 q-4,-8 0,-16" fill="#8CC084"/>
      ${gl('M62,62 h8 v70 h-8z', .45)}</g>`;
    return c.sh(100, 172, 78) + boot(38, .78, dk(b, .08)) + boot(-6, .9, b) + spark(160, 50);
  });
  def('saia', 'SAIA', 'roupa', c => {
    const b = '#B23C62';
    const dots = [[70, 100], [100, 92], [130, 100], [60, 130], [90, 126], [120, 128], [146, 132], [76, 154], [108, 156], [136, 156]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFFBF4" opacity=".9"/>`).join('');
    return c.sh(100, 178, 76) + `
    <path d="M66,62 h68 l36,100 q-20,14 -70,14 q-50,0 -70,-14z" fill="${c.l(b, { dir: [0, 0, 1, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M84,64 L74,170 M100,64 V174 M116,64 L126,170" stroke="${dk(b, .25)}" stroke-width="3" opacity=".5"/>
    ${dots}
    <path d="M30,162 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 l0,6 q-70,22 -140,0z" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="3" ${sw}/>
    <rect x="60" y="50" width="80" height="18" rx="8" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="3.5"/>
    <circle cx="100" cy="59" r="5" fill="${c.r('#A9472A')}"/>
    ${gl('M70,74 l-26,84 l10,2 l24,-84z', .35)}${spark(152, 70)}`;
  });
  def('vestido', 'VESTIDO DE CHITA', 'roupa', c => {
    const b = '#D9483B';
    const fl = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="5" ry="8" cy="-7" transform="rotate(${a})" fill="#FFFBF4"/>`).join('')}<circle r="4" fill="#F2B33D"/></g>`;
    const leaf = (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.5" transform="rotate(${a} ${x} ${y})" fill="#2F6B43"/>`;
    return c.sh(100, 182, 74) + `
    <path d="M76,30 q24,14 48,0 l14,16 -10,22 q34,56 44,104 q-72,18 -144,0 q10,-48 44,-104 l-10,-22z" fill="${c.l(b, { dir: [0, 0, 1, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    ${leaf(74, 112, 30)}${leaf(130, 96, -30)}${leaf(112, 150, 20)}${leaf(64, 150, -20)}${leaf(146, 152, 40)}
    ${fl(84, 104)}${fl(122, 90, .9)}${fl(100, 136, 1.1)}${fl(60, 162, .9)}${fl(140, 162, .9)}${fl(94, 70, .7)}
    <path d="M60,74 q40,12 80,0" stroke="#F2B33D" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M26,172 q74,20 148,0" stroke="#F2B33D" stroke-width="6" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/>
    ${gl('M80,80 q-24,40 -36,88 l8,2 q12,-48 34,-86z', .3)}${spark(158, 54)}`;
  });
  def('chapeu', 'CHAPÉU DE COURO', 'roupa', c => {
    const b = '#A86A3A';
    return c.sh(100, 160, 84) + `
    <path d="M14,128 Q100,92 186,128 Q160,158 100,156 Q40,158 14,128Z" fill="${c.l(b, { dir: [0, 0, 0, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M28,128 Q100,104 172,128" stroke="${lt(b, .45)}" stroke-width="2.5" fill="none" stroke-dasharray="5 5"/>
    <path d="M56,124 Q52,66 100,56 Q148,66 144,124 Q100,138 56,124Z" fill="${c.r(b, { cx: 40, cy: 25 })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M58,112 Q100,124 142,112 L143,124 Q100,138 57,124Z" fill="${c.l('#3B2A20')}"/>
    ${[66, 80, 94, 108, 122, 136].map(x => `<path d="M${x},62 l0,0 M${x},116 l0,0" />`).join('')}
    <path d="M100,58 q-6,30 0,56 M100,58 q22,22 28,58 M100,58 q-22,22 -28,58" stroke="${dk(b, .3)}" stroke-width="2" fill="none" opacity=".6"/>
    ${[[70, 92], [100, 80], [130, 92]].map(([x, y]) => `<path d="M${x},${y - 8} l3,6 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="${c.r('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="1.5"/>`).join('')}
    ${gl('M68,104 Q66,76 90,64 Q76,82 76,106Z', .45)}${spark(160, 92)}`;
  });
  def('mochila', 'MOCHILA', 'roupa', c => {
    const b = '#1F6E82';
    return c.sh(100, 178, 64) + `
    <path d="M76,48 q0,-26 24,-26 q24,0 24,26" stroke="${dk(b, .3)}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="44" y="44" width="112" height="128" rx="30" fill="${c.r(b, { cx: 30, cy: 20 })}" stroke="${S(b)}" stroke-width="3.5"/>
    <path d="M50,92 q50,-20 100,0 v8 q-50,-18 -100,0z" fill="${dk(b, .25)}"/>
    <path d="M48,76 q52,-22 104,0 q0,26 -10,30 q-42,-14 -84,0 q-10,-4 -10,-30z" fill="${c.l(lt(b, .12))}" stroke="${S(b)}" stroke-width="3"/>
    <rect x="62" y="116" width="76" height="44" rx="14" fill="${c.l(dk(b, .1))}" stroke="${S(b)}" stroke-width="3"/>
    <g transform="translate(80,96)"><rect width="40" height="30" rx="4" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2.5"/><path d="M20,3 v24" stroke="${S('#F2B33D')}" stroke-width="2"/><path d="M6,10 h10 M6,16 h10 M24,10 h10 M24,16 h10" stroke="#7A4B2E" stroke-width="2"/></g>
    <circle cx="100" cy="136" r="7" fill="${c.r('#F2B33D')}"/>
    ${gl('M54,70 q2,-20 22,-24 q-14,10 -14,26z', .5)}${spark(158, 50)}`;
  });
  def('capa', 'CAPA DE LEITOR', 'roupa', c => {
    const b = '#6B5BA8';
    return c.sh(100, 182, 70) + `
    <path d="M60,34 q40,18 80,0 l30,140 q-70,16 -140,0z" fill="${c.l(b, { dir: [0, 0, 1, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M78,40 L66,170 M122,40 L134,170" stroke="${dk(b, .3)}" stroke-width="3" opacity=".45"/>
    <path d="M52,36 q48,24 96,0 q2,14 -6,20 q-42,16 -84,0 q-8,-6 -6,-20z" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="3"/>
    <circle cx="100" cy="104" r="26" fill="${c.r('#FFFBF4')}" stroke="${S('#F2B33D')}" stroke-width="3.5"/>
    <path d="M84,96 q8,-4 16,2 q8,-6 16,-2 v18 q-8,-4 -16,2 q-8,-6 -16,-2z" fill="${c.l('#A9472A')}" stroke="${S('#A9472A')}" stroke-width="2"/>
    <path d="M100,98 v18" stroke="#FFFBF4" stroke-width="2"/>
    ${[[60, 150], [140, 150], [100, 160], [72, 70], [128, 70]].map(([x, y]) => spark(x, y, .55, .85)).join('')}
    ${gl('M68,52 l-18,110 8,2 18,-108z', .3)}`;
  });

  /* ---------- CABELO & ACESSÓRIOS (representatividade) ---------- */
  def('lenco', 'LENÇO', 'acessorio', c => {
    const a = '#E8792E', b = '#1F6E82';
    const dots = [[64,96],[84,82],[108,78],[132,86],[150,104],[56,118],[78,108],[120,104],[142,124],[98,98]].map(([x,y])=>`<g transform="translate(${x},${y})"><circle r="6" fill="#F2B33D"/><circle r="2.6" fill="#B23C62"/></g>`).join('');
    return c.sh(100, 176, 70) + `
    <path d="M30,146 Q22,70 100,52 Q178,70 170,146 Q100,168 30,146Z" fill="${c.r(a, { cx: 35, cy: 25 })}" stroke="${S(a)}" stroke-width="3.5"/>
    ${dots}
    <path d="M34,130 Q100,104 166,128 L168,144 Q100,120 32,146Z" fill="${c.l(b)}" stroke="${S(b)}" stroke-width="2.5"/>
    <path d="M40,134 Q100,112 160,132" stroke="#F2B33D" stroke-width="3" fill="none" stroke-dasharray="6 6"/>
    <path d="M100,58 C70,40 54,20 70,10 C86,4 98,30 100,52Z" fill="${c.r(b)}" stroke="${S(b)}" stroke-width="3"/>
    <path d="M100,58 C130,40 146,20 130,10 C114,4 102,30 100,52Z" fill="${c.r(b)}" stroke="${S(b)}" stroke-width="3"/>
    <path d="M76,16 q10,10 18,30 M124,16 q-10,10 -18,30" stroke="#F2B33D" stroke-width="2.5" fill="none" opacity=".8"/>
    <ellipse cx="100" cy="54" rx="13" ry="11" fill="${c.r(lt(b,.1))}" stroke="${S(b)}" stroke-width="3"/>
    ${gl('M46,118 Q44,82 80,64 Q60,88 58,120Z', .4)}${spark(166, 60)}`;
  });
  def('tiara', 'TIARA DE IPÊ', 'acessorio', c => {
    const f = (x, y, col, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="9" ry="13" cy="-11" transform="rotate(${a})" fill="${c.r(col, { cy: 70 })}" stroke="${S(col, .4)}" stroke-width="1.5"/>`).join('')}<circle r="6" fill="${c.r('#F2B33D')}"/></g>`;
    return c.sh(100, 160, 70) + `
    <path d="M30,140 Q30,58 100,54 Q170,58 170,140" stroke="${c.l('#7A4B2E')}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M34,130 Q36,64 100,60" stroke="#fff" stroke-width="2.5" opacity=".4" fill="none"/>
    ${[[44, 98, -40], [156, 98, 40], [70, 66, -20], [130, 66, 20]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" transform="rotate(${a} ${x} ${y})" fill="${c.l('#2F6B43')}"/>`).join('')}
    ${f(54, 82, '#E9A43B', .9)}${f(146, 82, '#E9A43B', .9)}${f(100, 56, '#D96FA0', 1.15)}${f(76, 62, '#F2C94C', .8)}${f(124, 62, '#F2C94C', .8)}${f(38, 116, '#D96FA0', .7)}${f(162, 116, '#D96FA0', .7)}
    ${spark(100, 22)}`;
  });
  def('fivela', 'FIVELA', 'acessorio', c => {
    const clip = (tx, ty, rot, col, shape) => `<g transform="translate(${tx},${ty}) rotate(${rot})">
      <rect x="-46" y="-8" width="92" height="16" rx="8" fill="${c.l('#C9CED6', { lo: .4 })}" stroke="#6E7682" stroke-width="2.5"/>
      ${shape === 'star' ? `<path d="M0,-30 l9,18 20,3 -15,14 4,20 -18,-10 -18,10 4,-20 -15,-14 20,-3z" fill="${c.r(col)}" stroke="${S(col)}" stroke-width="3" ${sw}/>` : `<path d="M0,26 C-40,0 -26,-30 0,-14 C26,-30 40,0 0,26z" fill="${c.r(col)}" stroke="${S(col)}" stroke-width="3" ${sw}/>`}
      ${gl(shape === 'star' ? 'M-4,-20 l3,-4 2,8z' : 'M-18,-12 q8,-6 12,2 q-8,0 -12,-2z', .8)}</g>`;
    return c.sh(100, 170, 70) + clip(70, 80, -18, '#F2B33D', 'star') + clip(128, 124, 12, '#B23C62', 'heart') + spark(156, 56) + spark(46, 146, .6);
  });
  def('micanga', 'MIÇANGA', 'acessorio', c => {
    const h = '#2B1B12';
    const seg = Array.from({ length: 6 }, (_, i) => `<ellipse cx="${100 + (i % 2 ? 8 : -8)}" cy="${30 + i * 18}" rx="18" ry="13" fill="${c.r(h, { hi: .3 })}" stroke="#120904" stroke-width="2"/>`).join('');
    const beads = [['#F2B33D', 140], ['#1F6E82', 156], ['#B23C62', 172]].map(([col, y], i) => `<ellipse cx="100" cy="${y}" rx="${15 - i}" ry="9" fill="${c.r(col)}" stroke="${S(col)}" stroke-width="2.5"/>${gl(`M${92 + i},${y - 4} q4,-4 10,-3 q-6,2 -8,6z`, .8)}`).join('');
    return c.sh(100, 186, 40) + seg + beads + `<path d="M96,180 l-8,10 M100,181 v12 M104,180 l8,10" stroke="${h}" stroke-width="4" stroke-linecap="round"/>` +
      `<g transform="translate(150,70)"><ellipse rx="13" ry="9" fill="${c.r('#2F6B43')}" stroke="${S('#2F6B43')}" stroke-width="2.5"/><ellipse cy="26" rx="13" ry="9" fill="${c.r('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2.5"/><ellipse cy="52" rx="13" ry="9" fill="${c.r('#D9483B')}" stroke="${S('#D9483B')}" stroke-width="2.5"/></g>` + spark(56, 60);
  });
  def('oculos', 'ÓCULOS', 'gratis', c => {
    const f = '#B23C62';
    const lens = x => `<circle cx="${x}" cy="104" r="34" fill="${c.stops([[0, '#ffffff', .55], [1, '#BFE3EC', .45]], [0, 0, 1, 1])}" stroke="${c.l(f)}" stroke-width="10"/><circle cx="${x}" cy="104" r="34" fill="none" stroke="${S(f)}" stroke-width="2"/><path d="M${x - 20},92 q8,-14 22,-14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>`;
    return c.sh(100, 160, 74) + lens(60) + lens(140) + `<path d="M94,100 q6,-10 12,0" stroke="${c.l(f)}" stroke-width="8" fill="none"/><path d="M26,96 l-14,-8 M174,96 l14,-8" stroke="${c.l(f)}" stroke-width="8" stroke-linecap="round"/>` + spark(160, 60);
  });
  def('aparelho', 'APARELHO AUDITIVO', 'gratis', c => {
    const b = '#1F6E82';
    return c.sh(100, 172, 50) + `
    <path d="M86,40 C130,30 150,70 132,108 C122,130 108,138 104,150" fill="none" stroke="${c.l('#7FB8C9')}" stroke-width="10" stroke-linecap="round"/>
    <path d="M70,46 C70,30 104,20 120,34 C140,52 134,104 116,132 C108,144 86,140 84,124 C80,100 70,70 70,46Z" fill="${c.r(b, { cx: 30, cy: 20 })}" stroke="${S(b)}" stroke-width="3.5"/>
    ${[[96, 60, '#F2B33D'], [110, 82, '#B23C62'], [92, 92, '#FFFBF4'], [104, 112, '#F2B33D'], [86, 70, '#8CC084']].map(([x, y, col]) => `<path d="M${x},${y - 7} l2,5 6,0 -5,3 2,6 -5,-4 -5,4 2,-6 -5,-3 6,0z" fill="${col}"/>`).join('')}
    <ellipse cx="104" cy="160" rx="14" ry="10" fill="${c.r('#E7D6C2')}" stroke="#8E7A66" stroke-width="2.5"/>
    ${gl('M78,52 q4,-18 22,-20 q-14,10 -16,24z', .6)}${spark(150, 50)}${spark(48, 120, .6)}`;
  });
  def('cadeira', 'CADEIRA DE RODAS', 'gratis', c => {
    const f = '#2F6B43';
    const spokes = (cx, cy, r) => Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${cx},${cy} L${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}" stroke="${['#F2B33D', '#B23C62', '#1F6E82', '#E8792E'][i % 4]}" stroke-width="4"/>`; }).join('');
    return c.sh(100, 182, 82) + `
    <path d="M70,40 v70 h70 l14,40" stroke="${c.l(f)}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M58,104 h86 q8,0 8,8 v4 h-94z" fill="${c.l('#B23C62')}" stroke="${S('#B23C62')}" stroke-width="3"/>
    <path d="M70,40 q-4,30 6,60 h-14 q-8,-30 -4,-60z" fill="${c.l('#B23C62')}" stroke="${S('#B23C62')}" stroke-width="3"/>
    <circle cx="86" cy="134" r="44" fill="none" stroke="${c.l('#3B2A20')}" stroke-width="10"/>
    <circle cx="86" cy="134" r="34" fill="none" stroke="#C9CED6" stroke-width="4"/>${spokes(86, 134, 34)}
    <circle cx="86" cy="134" r="8" fill="${c.r('#C9CED6')}" stroke="#6E7682" stroke-width="2"/>
    <circle cx="156" cy="164" r="13" fill="${c.r('#3B2A20')}"/><circle cx="156" cy="164" r="4" fill="#C9CED6"/>
    <path d="M52,108 q4,-30 30,-44" stroke="#fff" stroke-width="3" opacity=".35" fill="none"/>
    ${spark(150, 60)}`;
  });

  /* ---------- CASA ---------- */
  def('sofa', 'SOFÁ', 'casa', c => {
    const b = '#2F6B43';
    return c.sh(100, 170, 90) + `
    <rect x="26" y="56" width="148" height="70" rx="26" fill="${c.l(b, { hi: .3 })}" stroke="${S(b)}" stroke-width="3.5"/>
    <rect x="40" y="66" width="56" height="54" rx="18" fill="${c.r(lt(b, .1))}" stroke="${S(b)}" stroke-width="2.5"/>
    <rect x="104" y="66" width="56" height="54" rx="18" fill="${c.r(lt(b, .1))}" stroke="${S(b)}" stroke-width="2.5"/>
    <rect x="30" y="112" width="140" height="38" rx="14" fill="${c.l(b)}" stroke="${S(b)}" stroke-width="3.5"/>
    <rect x="12" y="86" width="34" height="66" rx="16" fill="${c.cyl(b)}" stroke="${S(b)}" stroke-width="3.5"/>
    <rect x="154" y="86" width="34" height="66" rx="16" fill="${c.cyl(b)}" stroke="${S(b)}" stroke-width="3.5"/>
    <rect x="70" y="78" width="42" height="36" rx="10" transform="rotate(-10 91 96)" fill="${c.r('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2.5"/>
    <path d="M78,90 l10,12 M90,84 l12,14" stroke="#E8792E" stroke-width="3" opacity=".7"/>
    <path d="M30,150 l4,16 M170,150 l-4,16" stroke="#7A4B2E" stroke-width="8" stroke-linecap="round"/>
    ${gl('M38,64 q20,-6 50,-4 q-34,4 -46,12z', .5)}${spark(166, 44)}`;
  });
  def('estante', 'ESTANTE', 'casa', c => {
    const w = '#9A6234';
    const books = (y, arr) => { let x = 44; return arr.map(([col, h, wd, tilt]) => { const s = `<g transform="translate(${x},${y}) rotate(${tilt || 0} 0 0)"><rect x="0" y="${-h}" width="${wd}" height="${h}" rx="2" fill="${c.l(col, { dir: [0, 0, 1, 0] })}" stroke="${S(col)}" stroke-width="2"/><rect x="2" y="${-h + 6}" width="${wd - 4}" height="3" fill="#F2B33D" opacity=".8"/></g>`; x += wd + 2; return s; }).join(''); };
    return c.sh(100, 186, 76) + `
    <rect x="34" y="20" width="132" height="162" rx="6" fill="${c.l(w, { dir: [0, 0, 1, 0] })}" stroke="${S(w)}" stroke-width="3.5"/>
    <rect x="42" y="28" width="116" height="146" fill="${dk(w, .45)}"/>
    ${[72, 122, 172].map(y => `<rect x="38" y="${y}" width="124" height="8" rx="2" fill="${c.l(w)}" stroke="${S(w)}" stroke-width="2"/>`).join('')}
    ${books(72, [['#D9483B', 36, 12], ['#1F6E82', 40, 14], ['#F2B33D', 32, 10], ['#2F6B43', 38, 13], ['#B23C62', 34, 12], ['#6B5BA8', 40, 14]])}
    <g transform="translate(142,72)"><rect x="-6" y="-26" width="12" height="26" rx="2" fill="${c.l('#E8792E')}"/></g>
    ${books(122, [['#6B5BA8', 38, 13], ['#F2B33D', 34, 12], ['#D9483B', 40, 13]])}
    <g transform="translate(118,122)"><path d="M0,0 q-2,-20 10,-28 q12,8 10,28z" fill="${c.r('#2F6B43')}"/><rect x="-2" y="-8" width="24" height="8" rx="2" fill="${c.l('#A9472A')}"/></g>
    ${books(172, [['#1F6E82', 36, 14], ['#B23C62', 40, 12], ['#2F6B43', 34, 13], ['#F2B33D', 38, 12], ['#D9483B', 32, 13]])}
    ${gl('M38,24 h6 v152 h-6z', .3)}${spark(170, 22)}`;
  });
  def('rede', 'REDE', 'casa', c => {
    const b = '#E8792E';
    const stripes = ['#F2B33D', '#B23C62', '#1F6E82', '#2F6B43'];
    return c.sh(100, 176, 70) + `
    <path d="M8,40 q40,16 50,46 M192,40 q-40,16 -50,46" stroke="#C9A77C" stroke-width="3" fill="none"/>
    <path d="M8,40 q30,34 54,48 M192,40 q-30,34 -54,48" stroke="#C9A77C" stroke-width="3" fill="none"/>
    <circle cx="8" cy="40" r="6" fill="${c.r('#7A4B2E')}"/><circle cx="192" cy="40" r="6" fill="${c.r('#7A4B2E')}"/>
    <path d="M52,84 Q100,170 148,84 Q100,110 52,84Z" fill="${c.l(b, { dir: [0, 0, 0, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    ${stripes.map((s, i) => `<path d="M${60 + i * 6},${92 + i * 6} Q100,${150 - i * 2} ${140 - i * 6},${92 + i * 6}" stroke="${s}" stroke-width="5" fill="none" opacity=".9"/>`).join('')}
    <path d="M52,84 Q100,110 148,84" stroke="#FFFBF4" stroke-width="5" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${66 + i * 9},${118 + Math.sin(i / 8 * Math.PI) * 28} v14" stroke="#F2B33D" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${gl('M66,96 Q100,140 132,96 Q100,120 66,96Z', .25)}${spark(100, 40)}`;
  });
  def('tapete', 'TAPETE', 'casa', c => {
    const cols = ['#A9472A', '#F2B33D', '#1F6E82', '#FFFBF4', '#B23C62'];
    return c.sh(100, 150, 92, 24) + `
    <ellipse cx="100" cy="128" rx="88" ry="38" fill="${c.l(cols[0], { lo: .3 })}" stroke="${S(cols[0])}" stroke-width="3.5"/>
    ${cols.slice(1).map((col, i) => `<ellipse cx="100" cy="${126 - i}" rx="${74 - i * 16}" ry="${31 - i * 6.6}" fill="${c.l(col)}" stroke="${S(col, .35)}" stroke-width="2" ${i === 3 ? '' : 'stroke-dasharray="4 4"'}/>`).join('')}
    <ellipse cx="100" cy="123" rx="8" ry="3.5" fill="#F2B33D"/>
    ${Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2; return `<path d="M${(100 + Math.cos(a) * 88).toFixed(1)},${(128 + Math.sin(a) * 38).toFixed(1)} l${(Math.cos(a) * 8).toFixed(1)},${(Math.sin(a) * 4).toFixed(1)}" stroke="#F2B33D" stroke-width="3" stroke-linecap="round"/>`; }).join('')}
    ${gl('M40,112 q30,-18 70,-20 q-40,10 -60,26z', .35)}${spark(156, 82)}`;
  });
  def('vaso', 'VASO', 'casa', c => {
    const v = '#A9472A', g = '#2F6B43';
    const leaf = (x, y, rot, s) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M0,0 C-30,-10 -36,-50 0,-70 C36,-50 30,-10 0,0Z" fill="${c.r(g, { cx: 30, cy: 30 })}" stroke="${S(g)}" stroke-width="2.5"/><path d="M0,-4 V-62" stroke="${lt(g, .4)}" stroke-width="2.5"/>${[-50, -38, -26].map(yy => `<path d="M0,${yy} l-14,-6 M0,${yy} l14,-6" stroke="${lt(g, .3)}" stroke-width="2"/>`).join('')}</g>`;
    return c.sh(100, 184, 54) + leaf(96, 104, -40, 1) + leaf(104, 104, 38, .95) + leaf(100, 100, 0, 1.1) + leaf(92, 108, -78, .7) + leaf(110, 108, 76, .7) + `
    <path d="M58,108 h84 l-12,70 q-30,10 -60,0z" fill="${c.cyl(v)}" stroke="${S(v)}" stroke-width="3.5" ${sw}/>
    <rect x="52" y="100" width="96" height="16" rx="7" fill="${c.l(v)}" stroke="${S(v)}" stroke-width="3.5"/>
    <path d="M66,136 q34,10 68,0" stroke="#F2B33D" stroke-width="5" fill="none"/><path d="M66,148 q34,10 68,0" stroke="#FFFBF4" stroke-width="3" fill="none" stroke-dasharray="3 6" stroke-linecap="round"/>
    ${spark(160, 40)}`;
  });
  def('quadro', 'QUADRO', 'casa', c => {
    const m = '#C08A3E';
    return c.sh(100, 178, 70, 10) + `
    <path d="M100,14 L70,40 M100,14 L130,40" stroke="#7A4B2E" stroke-width="2.5"/><circle cx="100" cy="14" r="4" fill="#7A4B2E"/>
    <rect x="30" y="38" width="140" height="124" rx="8" fill="${c.l(m, { dir: [0, 0, 1, 1] })}" stroke="${S(m)}" stroke-width="3.5"/>
    <rect x="44" y="52" width="112" height="96" rx="3" fill="${c.stops([[0, '#9ED3E4'], [.65, '#FCE3A6'], [1, '#FCE3A6']])}"/>
    <circle cx="128" cy="78" r="12" fill="${c.r('#F2B33D')}"/>
    <path d="M44,124 q30,-26 60,-6 q24,-18 52,-4 v34 h-112z" fill="${c.l('#5E9E5A')}"/>
    <path d="M70,124 l18,-16 18,16 v20 h-36z" fill="${c.l('#FFFBF4')}" stroke="#A9472A" stroke-width="2"/><path d="M66,126 l22,-20 22,20" stroke="#A9472A" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="84" y="130" width="8" height="14" fill="#7A4B2E"/>
    <rect x="44" y="52" width="112" height="96" rx="3" fill="none" stroke="${dk(m, .4)}" stroke-width="3"/>
    ${gl('M34,42 h132 l-8,8 h-116z', .4)}${spark(166, 34)}`;
  });

  /* ---------- VILA ---------- */
  def('forno', 'FORNO', 'vila', c => {
    const b = '#C86B3C';
    const bricks = Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, k) => `<rect x="${30 + k * 24 + (r % 2) * 12}" y="${142 + r * 8}" width="22" height="7" rx="1.5" fill="${dk('#B05530', (k + r) % 3 * .06)}"/>`).join('')).join('');
    return c.sh(100, 186, 86) + `
    <rect x="26" y="140" width="148" height="44" rx="6" fill="${dk('#8A3E22', .2)}"/>${bricks}
    <path d="M36,144 Q36,40 100,38 Q164,40 164,144Z" fill="${c.r(b, { cx: 36, cy: 22 })}" stroke="${S(b)}" stroke-width="3.5"/>
    <path d="M70,144 Q70,92 100,90 Q130,92 130,144Z" fill="${c.stops([[0, '#3B1A0C'], [1, '#170904']])}" stroke="${S(b)}" stroke-width="3"/>
    <path d="M78,144 q4,-22 12,-14 q4,-18 12,-4 q8,-16 12,2 q8,-6 8,16z" fill="${c.stops([[0, '#FFE08A'], [.5, '#F2A33D'], [1, '#D9483B']])}"/>
    <ellipse cx="100" cy="142" rx="34" ry="6" fill="#F2B33D" opacity=".35"/>
    <path d="M128,52 h18 v-26 h-18z" fill="${c.l('#9A4B2A')}" stroke="${S(b)}" stroke-width="3"/>
    <path d="M134,20 q-8,-10 2,-16 q10,-6 4,-14" stroke="#C9C1B6" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
    ${gl('M48,118 Q48,66 86,48 Q62,74 60,120Z', .4)}
    <g transform="translate(150,154)"><ellipse rx="20" ry="10" fill="${c.r('#E3A55A')}" stroke="#8A5A2A" stroke-width="2.5"/><path d="M-10,-4 l4,6 M0,-6 l4,6 M10,-4 l4,6" stroke="#8A5A2A" stroke-width="2"/></g>
    ${spark(40, 50)}`;
  });
  def('fonte', 'FONTE', 'vila', c => {
    const s = '#B9AEA0', w = '#5DB7D6';
    return c.sh(100, 184, 86) + `
    <ellipse cx="100" cy="150" rx="84" ry="28" fill="${c.l(s)}" stroke="${S(s)}" stroke-width="3.5"/>
    <path d="M16,150 v14 q84,40 168,0 v-14" fill="${c.l(dk(s, .1))}" stroke="${S(s)}" stroke-width="3.5"/>
    <ellipse cx="100" cy="148" rx="72" ry="20" fill="${c.stops([[0, lt(w, .4)], [1, dk(w, .2)]])}"/>
    <path d="M60,150 q10,-4 20,0 M120,146 q10,-4 20,0" stroke="#fff" stroke-width="2.5" opacity=".7" fill="none"/>
    <rect x="90" y="84" width="20" height="62" rx="4" fill="${c.cyl(s)}" stroke="${S(s)}" stroke-width="3"/>
    <ellipse cx="100" cy="84" rx="40" ry="12" fill="${c.l(s)}" stroke="${S(s)}" stroke-width="3"/>
    <ellipse cx="100" cy="82" rx="32" ry="8" fill="${lt(w, .2)}"/>
    <path d="M100,70 Q100,30 100,30 M100,40 q-30,0 -46,44 M100,40 q30,0 46,44" stroke="${c.stops([[0, '#fff'], [1, w]])}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
    <circle cx="100" cy="30" r="8" fill="${lt(w, .5)}"/>
    ${[[56, 100], [146, 96], [80, 60], [124, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${lt(w, .6)}"/>`).join('')}
    ${spark(160, 40)}${spark(40, 120, .6)}`;
  });
  def('horta', 'HORTA', 'vila', c => {
    const w = '#8A5A34';
    const cen = (x, y) => `<g transform="translate(${x},${y})"><path d="M-8,0 q-2,-24 8,-34 q10,10 8,34" fill="${c.r('#2F6B43')}"/><path d="M0,-4 q-18,-8 -20,-24 q16,4 20,24 M0,-4 q18,-8 20,-24 q-16,4 -20,24" fill="${c.r('#5E9E5A')}"/></g>`;
    const tom = (x, y) => `<g transform="translate(${x},${y})"><path d="M0,0 v-26" stroke="#2F6B43" stroke-width="3"/><circle cx="-6" cy="-14" r="8" fill="${c.r('#D9483B')}"/><circle cx="8" cy="-8" r="7" fill="${c.r('#D9483B')}"/><path d="M-10,-30 q10,6 20,0" stroke="#5E9E5A" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    return c.sh(100, 186, 92) + `
    <path d="M12,120 L100,92 L188,120 L100,150Z" fill="${c.l('#6B3E22')}"/>
    <path d="M12,120 L100,150 L100,176 L12,146Z" fill="${c.l(w)}" stroke="${S(w)}" stroke-width="3"/>
    <path d="M188,120 L100,150 L100,176 L188,146Z" fill="${c.l(dk(w, .15))}" stroke="${S(w)}" stroke-width="3"/>
    <path d="M12,120 L100,92 L188,120 L100,150Z" fill="none" stroke="${S(w)}" stroke-width="3"/>
    ${[[56, 116], [84, 110], [112, 104], [78, 130], [106, 124], [134, 118]].map(([x, y], i) => i % 2 ? tom(x, y) : cen(x, y)).join('')}
    ${[[130, 136], [150, 128]].map(([x, y]) => `<g transform="translate(${x},${y})"><path d="M0,0 q-10,-10 -4,-22 q8,4 8,22" fill="#5E9E5A"/><path d="M-2,0 l-6,14 l10,-2z" fill="${c.r('#E8792E')}"/></g>`).join('')}
    <g transform="translate(30,60)"><rect x="0" y="0" width="34" height="22" rx="3" fill="${c.l('#FFFBF4')}" stroke="${S(w)}" stroke-width="2"/><text x="17" y="16" font-family="Fredoka" font-weight="700" font-size="11" text-anchor="middle" fill="#2F6B43">HORTA</text><path d="M17,22 v40" stroke="${w}" stroke-width="4"/></g>
    ${spark(170, 70)}`;
  });
  def('coreto', 'CORETO', 'vila', c => {
    const r = '#D9483B', w = '#FFFBF4';
    return c.sh(100, 188, 86) + `
    <path d="M24,160 h152 v14 h-152z" fill="${c.l('#B9AEA0')}" stroke="${S('#B9AEA0')}" stroke-width="3"/>
    <path d="M30,152 h140 v10 h-140z" fill="${c.l('#E6DCCB')}" stroke="${S('#B9AEA0')}" stroke-width="3"/>
    ${[40, 70, 100, 130, 160].map(x => `<rect x="${x - 4}" y="78" width="8" height="76" fill="${c.cyl(w)}" stroke="${S(w, .35)}" stroke-width="2"/>`).join('')}
    <path d="M36,132 h128" stroke="${c.l(w)}" stroke-width="5"/>${[48, 58, 80, 90, 110, 120, 142, 152].map(x => `<path d="M${x},132 v20" stroke="${dk(w, .25)}" stroke-width="3"/>`).join('')}
    <path d="M100,18 L170,78 H30Z" fill="${c.l(r, { dir: [0, 0, 1, 1] })}" stroke="${S(r)}" stroke-width="3.5" ${sw}/>
    <path d="M100,18 L76,78 M100,18 L124,78" stroke="${dk(r, .2)}" stroke-width="3" opacity=".6"/>
    <path d="M26,78 q9,10 18,0 q9,10 18,0 q9,10 18,0 q9,10 18,0 q9,10 18,0 q9,10 18,0 q9,10 18,0 q9,10 18,0" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2.5"/>
    <circle cx="100" cy="14" r="7" fill="${c.r('#F2B33D')}"/>
    ${gl('M96,26 L50,70 L60,70 L98,30Z', .4)}
    <g transform="translate(100,110)"><path d="M-6,-10 v18 a5,4 0 1 1 -3,-4 v-12 l14,-4 v16 a5,4 0 1 1 -3,-4 v-12z" fill="#6B5BA8"/></g>
    ${spark(170, 30)}`;
  });
  def('ponte', 'PONTE', 'vila', c => {
    const w = '#A86A3A';
    const arc = (x) => 150 - Math.sin((x - 10) / 180 * Math.PI) * 60;
    const planks = Array.from({ length: 16 }, (_, i) => { const x = 16 + i * 11.2; return `<path d="M${x.toFixed(1)},${(arc(x) - 2).toFixed(1)} v14" stroke="${dk(w, .35)}" stroke-width="2"/>`; }).join('');
    const posts = Array.from({ length: 8 }, (_, i) => { const x = 22 + i * 22.3; return `<path d="M${x.toFixed(1)},${(arc(x) - 4).toFixed(1)} V${(arc(x) - 30).toFixed(1)}" stroke="${c.l('#7A4B2E')}" stroke-width="5" stroke-linecap="round"/>`; }).join('');
    const rail = Array.from({ length: 19 }, (_, i) => { const x = 14 + i * 9.6; return `${i ? 'L' : 'M'}${x.toFixed(1)},${(arc(x) - 30).toFixed(1)}`; }).join(' ');
    const deckTop = Array.from({ length: 19 }, (_, i) => { const x = 10 + i * 10; return `${i ? 'L' : 'M'}${x},${arc(x).toFixed(1)}`; }).join(' ');
    const deckBot = Array.from({ length: 19 }, (_, i) => { const x = 190 - i * 10; return `L${x},${(arc(x) + 14).toFixed(1)}`; }).join(' ');
    return c.sh(100, 180, 94) + `
    <path d="M0,168 Q100,150 200,168 V184 H0Z" fill="${c.stops([[0, '#7FC6DD'], [1, '#3E98B5']])}"/>
    <path d="M30,170 q10,-4 20,0 M130,166 q10,-4 20,0" stroke="#fff" stroke-width="2.5" opacity=".6" fill="none"/>
    <path d="M40,170 Q100,110 160,170" fill="none" stroke="${c.l('#9C8F80')}" stroke-width="12"/>
    ${posts}
    <path d="${rail}" stroke="${c.l('#7A4B2E')}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="${deckTop} ${deckBot}Z" fill="${c.l(w)}" stroke="${S(w)}" stroke-width="3" stroke-linejoin="round"/>
    ${planks}
    <path d="${deckTop}" stroke="#fff" stroke-width="2" opacity=".45" fill="none"/>
    ${[[14, arc(14)], [186, arc(186)]].map(([x, y]) => `<rect x="${x - 7}" y="${(y - 40).toFixed(1)}" width="14" height="${(186 - y + 40).toFixed(1)}" rx="3" fill="${c.cyl('#7A4B2E')}"/><circle cx="${x}" cy="${(y - 44).toFixed(1)}" r="7" fill="${c.r('#F2B33D')}"/>`).join('')}
    ${spark(100, 50)}`;
  });
  def('moinho', 'MOINHO', 'vila', c => {
    const w = '#FFFBF4', r = '#A9472A';
    const blade = a => `<g transform="rotate(${a} 100 66)"><path d="M100,66 L100,8" stroke="#7A4B2E" stroke-width="5"/><path d="M102,12 h22 v48 h-22z" fill="${c.l('#F2E3C6')}" stroke="#7A4B2E" stroke-width="2.5"/><path d="M102,24 h22 M102,36 h22 M102,48 h22 M113,12 v48" stroke="#C9A77C" stroke-width="1.5"/></g>`;
    return c.sh(100, 188, 70) + `
    <path d="M66,186 L76,70 h48 L134,186Z" fill="${c.cyl(w)}" stroke="${S(w, .4)}" stroke-width="3.5" ${sw}/>
    <path d="M66,70 Q100,20 134,70Z" fill="${c.l(r)}" stroke="${S(r)}" stroke-width="3.5"/>
    <path d="M90,186 v-30 q10,-14 20,0 v30z" fill="${c.l('#7A4B2E')}"/>
    <rect x="92" y="104" width="16" height="18" rx="8" fill="${c.l('#1F6E82')}" stroke="#7A4B2E" stroke-width="2.5"/>
    ${[20, 110, 200, 290].map(blade).join('')}
    <circle cx="100" cy="66" r="9" fill="${c.r('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2.5"/>
    ${gl('M80,80 L72,180 L78,180 L86,80Z', .5)}`;
  });
  def('banca', 'BANCA DE LIVROS', 'vila', c => {
    const w = '#1F6E82';
    return c.sh(100, 186, 86) + `
    <rect x="26" y="70" width="148" height="110" rx="6" fill="${c.l(w, { dir: [0, 0, 1, 1] })}" stroke="${S(w)}" stroke-width="3.5"/>
    <rect x="38" y="84" width="124" height="70" rx="3" fill="${dk(w, .5)}"/>
    ${[['#D9483B', 46, 104], ['#F2B33D', 68, 100], ['#2F6B43', 90, 106], ['#B23C62', 112, 100], ['#6B5BA8', 134, 104]].map(([col, x, y]) => `<g transform="translate(${x},${y})"><rect width="20" height="28" rx="2" fill="${c.l(col)}" stroke="${S(col)}" stroke-width="2"/><rect x="4" y="5" width="12" height="9" rx="1" fill="#FFFBF4" opacity=".85"/></g>`).join('')}
    ${[['#F2B33D', 52], ['#D9483B', 82], ['#1F6E82', 112], ['#2F6B43', 138]].map(([col, x]) => `<g transform="translate(${x},140)"><rect width="22" height="12" rx="2" fill="${c.l(col)}"/></g>`).join('')}
    <path d="M14,72 L30,34 h140 l16,38z" fill="${c.l('#FFFBF4')}" stroke="${S('#D9483B')}" stroke-width="3"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${30 + i * 40 + 20},34 h20 l${4 + i * 1},38 h-24z" fill="${c.l('#D9483B')}"/>`).join('')}
    <path d="M14,72 q11,12 22,0 q11,12 22,0 q11,12 22,0 q11,12 22,0 q11,12 22,0 q11,12 22,0 q11,12 22,0 q11,12 22,0" fill="${c.l('#D9483B')}" stroke="${S('#D9483B')}" stroke-width="2.5"/>
    <rect x="62" y="160" width="76" height="16" rx="4" fill="${c.l('#F2B33D')}"/><text x="100" y="172" font-family="Fredoka" font-weight="700" font-size="12" text-anchor="middle" fill="#3B2A20">LIVROS</text>
    ${spark(176, 30)}`;
  });

  /* ---------- BICHINHOS (fauna brasileira) ---------- */
  const eye = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1E120B"/><circle cx="${x + r * .35}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/><circle cx="${x - r * .3}" cy="${y + r * .35}" r="${r * .16}" fill="#fff" opacity=".8"/>`;
  W.FX.eye = eye;
  def('arara', 'ARARA', 'bicho', c => {
    const r = '#D9332B';
    return c.sh(100, 190, 50) + `
    <path d="M92,140 L70,196 L86,196 L100,150 L112,196 L128,196 L110,140Z" fill="${c.l('#1F6E82')}" stroke="${S('#1F6E82')}" stroke-width="2.5"/>
    <path d="M96,146 L84,192 L94,192 L102,150Z" fill="${c.l('#F2B33D')}"/>
    <ellipse cx="100" cy="112" rx="40" ry="48" fill="${c.r(r, { cx: 35, cy: 25 })}" stroke="${S(r)}" stroke-width="3"/>
    <path d="M72,100 Q50,130 64,160 Q90,150 96,118Z" fill="${c.l('#F2B33D', { dir: [0, 0, 1, 1] })}" stroke="${S('#F2B33D')}" stroke-width="2.5"/>
    <path d="M66,130 Q58,150 66,166 Q84,158 88,140Z" fill="${c.l('#1F6E82')}" stroke="${S('#1F6E82')}" stroke-width="2.5"/>
    <circle cx="100" cy="60" r="34" fill="${c.r(r, { cx: 35, cy: 25 })}" stroke="${S(r)}" stroke-width="3"/>
    <path d="M104,46 q20,-6 26,14 q-2,18 -20,16 q-14,-10 -6,-30z" fill="${c.r('#FFFBF4')}"/>
    <path d="M110,74 q-6,-4 -4,-2" />
    ${[0, 1, 2].map(i => `<path d="M${110 + i * 4},${52 + i * 6} h6" stroke="#9C2A22" stroke-width="1.5"/>`).join('')}
    ${eye(116, 58, 6)}
    <path d="M128,58 Q156,60 150,84 Q144,98 134,90 Q140,76 126,74Z" fill="${c.l('#3B2A20', { hi: .5 })}" stroke="#1E120B" stroke-width="2.5"/>
    <path d="M128,74 Q138,82 134,90 Q124,88 124,78Z" fill="#E6DCCB"/>
    <path d="M80,34 q-10,-14 4,-22 q4,12 10,14z" fill="${c.r(r)}"/>
    ${gl('M76,52 q4,-20 24,-24 q-16,10 -18,26z', .5)}${spark(160, 30)}`;
  });
  def('tucano', 'TUCANO', 'bicho', c => {
    const k = '#22201E';
    return c.sh(96, 190, 46) + `
    <path d="M70,160 l-10,34 h16 l6,-30z" fill="${c.l(k)}"/>
    <ellipse cx="84" cy="118" rx="38" ry="52" fill="${c.r(k, { hi: .3 })}" stroke="#000" stroke-width="2.5"/>
    <path d="M70,82 q-6,30 14,44 q22,-8 22,-40 q-16,-14 -36,-4z" fill="${c.r('#FFFBF4')}" stroke="#C9B9A2" stroke-width="2"/>
    <path d="M72,122 q12,8 26,0 q-2,10 -12,14 q-10,-2 -14,-14z" fill="${c.r('#D9483B')}"/>
    <circle cx="86" cy="62" r="7" fill="${c.r('#5DB7D6')}"/>${eye(86, 62, 5)}
    <path d="M96,52 Q170,40 196,72 Q160,88 100,78Z" fill="${c.l('#F2A33D', { dir: [0, 0, 0, 1], hi: .45 })}" stroke="${S('#F2A33D')}" stroke-width="3" ${sw}/>
    <path d="M100,70 Q150,76 196,72 Q160,88 100,78Z" fill="${c.l('#E8792E')}"/>
    <path d="M180,60 Q192,64 196,72 L186,74Z" fill="#1E120B"/>
    <path d="M100,52 Q104,64 100,78" stroke="#2F6B43" stroke-width="5" fill="none"/>
    ${gl('M110,56 Q150,48 176,58 Q150,54 112,62Z', .6)}${gl('M60,96 q4,-22 18,-30 q-10,14 -10,32z', .25)}${spark(40, 40)}`;
  });
  def('capivara', 'CAPIVARA', 'bicho', c => {
    const b = '#9C6B42';
    return c.sh(100, 178, 84) + `
    <ellipse cx="96" cy="128" rx="74" ry="42" fill="${c.r(b, { cx: 40, cy: 20 })}" stroke="${S(b)}" stroke-width="3"/>
    ${[[40, 160], [64, 166], [128, 166], [150, 160]].map(([x, y]) => `<rect x="${x - 9}" y="${y - 14}" width="18" height="22" rx="8" fill="${c.l(dk(b, .1))}" stroke="${S(b)}" stroke-width="2.5"/>`).join('')}
    <path d="M128,80 Q186,72 188,112 Q186,138 156,136 Q126,130 120,110Z" fill="${c.r(b, { cx: 40, cy: 25 })}" stroke="${S(b)}" stroke-width="3"/>
    <ellipse cx="180" cy="108" rx="12" ry="14" fill="${c.r(dk(b, .35))}"/>
    <ellipse cx="184" cy="104" rx="3" ry="2" fill="#1E120B"/>
    <path d="M168,126 q8,4 14,0" stroke="${S(b)}" stroke-width="2.5" fill="none"/>
    ${eye(152, 98, 5.5)}
    <ellipse cx="138" cy="80" rx="8" ry="6" fill="${c.r(dk(b, .2))}" stroke="${S(b)}" stroke-width="2"/>
    <circle cx="164" cy="116" r="7" fill="#E07F62" opacity=".35"/>
    <g transform="translate(118,70)"><path d="M0,0 q4,-14 16,-12 q-4,10 -16,12z" fill="${c.r('#5E9E5A')}"/></g>
    <g transform="translate(150,62)"><path d="M-6,0 q-4,-10 6,-14 q10,4 6,14z" fill="${c.r('#F2B33D')}"/><path d="M-6,0 h12" stroke="${S('#F2B33D')}" stroke-width="2"/></g>
    ${gl('M40,108 q16,-26 52,-28 q-36,12 -44,32z', .3)}${spark(30, 70)}`;
  });
  def('jabuti', 'JABUTI', 'bicho', c => {
    const sh = '#7A4B2E', sk = '#8C8B4A';
    const hex = (x, y, r) => `<path d="M${x - r},${y} l${r / 2},${-r * .85} h${r} l${r / 2},${r * .85} l${-r / 2},${r * .85} h${-r}z" fill="${c.r('#C08A3E', { hi: .3 })}" stroke="${dk(sh, .3)}" stroke-width="2.5"/>`;
    return c.sh(100, 178, 82) + `
    ${[[50, 156], [80, 164], [124, 164], [152, 156]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="12" fill="${c.r(sk)}" stroke="${S(sk)}" stroke-width="2.5"/>`).join('')}
    <path d="M150,130 Q190,124 192,100 Q190,78 168,82 Q150,90 144,118Z" fill="${c.r(sk, { cx: 40, cy: 20 })}" stroke="${S(sk)}" stroke-width="3"/>
    ${eye(176, 96, 5.5)}<path d="M180,110 q6,2 10,-2" stroke="${S(sk)}" stroke-width="2" fill="none"/>
    <path d="M26,140 Q30,60 100,56 Q170,60 172,140 Z" fill="${c.r(sh, { cx: 40, cy: 20 })}" stroke="${S(sh)}" stroke-width="3.5"/>
    ${hex(100, 92, 18)}${hex(66, 108, 16)}${hex(134, 108, 16)}${hex(84, 126, 13)}${hex(116, 126, 13)}${hex(100, 64, 10)}
    <path d="M22,138 Q100,154 176,138 l-2,8 Q100,164 24,146z" fill="${c.l('#E3B35F')}" stroke="${S(sh)}" stroke-width="2.5"/>
    ${gl('M46,104 Q56,70 92,62 Q64,80 56,108Z', .4)}${spark(40, 50)}`;
  });
  def('mico', 'MICO-LEÃO', 'bicho', c => {
    const o = '#E8892E';
    const tufts = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 46).toFixed(1)}" cy="${(80 + Math.sin(a) * 44).toFixed(1)}" r="16" fill="${c.r(o, { hi: .35 })}"/>`; }).join('');
    return c.sh(100, 190, 52) + `
    <path d="M128,150 q50,10 46,-40 q-2,-20 -14,-24" stroke="${c.l(o)}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="150" rx="32" ry="34" fill="${c.r(o, { cx: 40, cy: 20 })}" stroke="${S(o)}" stroke-width="3"/>
    <ellipse cx="80" cy="182" rx="12" ry="8" fill="${c.r(dk(o, .1))}"/><ellipse cx="120" cy="182" rx="12" ry="8" fill="${c.r(dk(o, .1))}"/>
    <g>${tufts}</g><circle cx="100" cy="80" r="46" fill="${c.r(o, { hi: .45 })}"/>
    <ellipse cx="100" cy="88" rx="28" ry="30" fill="${c.r('#7A4B2E', { hi: .3 })}" stroke="${dk('#7A4B2E', .4)}" stroke-width="2"/>
    ${eye(89, 82, 6)}${eye(111, 82, 6)}
    <ellipse cx="100" cy="98" rx="5" ry="3" fill="#2B160B"/><path d="M93,106 q7,5 14,0" stroke="#2B160B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="98" r="5" fill="#E07F62" opacity=".4"/><circle cx="118" cy="98" r="5" fill="#E07F62" opacity=".4"/>
    ${gl('M66,62 q8,-22 32,-28 q-20,12 -26,32z', .45)}${spark(160, 40)}`;
  });
  def('lobo', 'LOBO-GUARÁ', 'bicho', c => {
    const o = '#C9622D';
    return c.sh(100, 190, 66) + `
    ${[[70, 150], [86, 156], [128, 150], [142, 156]].map(([x, y]) => `<rect x="${x - 5}" y="${y}" width="10" height="34" rx="4" fill="${c.l('#2B1B12')}"/>`).join('')}
    <path d="M150,118 q34,-6 36,22 q-6,12 -16,6 q2,-16 -20,-14z" fill="${c.l(o)}" stroke="${S(o)}" stroke-width="2.5"/><path d="M178,144 q6,-4 8,-6 q-2,10 -8,12z" fill="#FFFBF4"/>
    <ellipse cx="108" cy="130" rx="48" ry="28" fill="${c.r(o, { cx: 40, cy: 20 })}" stroke="${S(o)}" stroke-width="3"/>
    <path d="M70,108 q30,-18 64,-6 q-30,4 -64,14z" fill="#2B1B12"/>
    <path d="M60,128 Q48,92 54,70 L84,78 Q84,104 84,124Z" fill="${c.r(o)}" stroke="${S(o)}" stroke-width="3"/>
    <path d="M60,128 Q52,100 56,84 L66,82 Q66,108 72,126Z" fill="#2B1B12"/>
    <path d="M30,62 Q50,40 76,52 Q90,62 84,82 Q60,94 40,84 Q26,80 30,62Z" fill="${c.r(o, { cx: 50, cy: 25 })}" stroke="${S(o)}" stroke-width="3"/>
    <path d="M30,62 Q22,68 24,76 Q32,84 40,84 Q34,74 34,64Z" fill="${c.r('#2B1B12')}"/>
    <path d="M44,84 q8,6 22,2 q-10,-6 -22,-2z" fill="#FFFBF4"/>
    <path d="M58,50 L52,14 L74,40Z M76,54 L86,18 L94,48Z" fill="${c.l(o)}" stroke="${S(o)}" stroke-width="3" ${sw}/>
    <path d="M60,44 L56,24 L68,40Z M80,48 L86,28 L88,46Z" fill="#FFFBF4" opacity=".85"/>
    ${eye(58, 62, 5)}${gl('M80,116 q20,-12 50,-10 q-30,4 -46,16z', .35)}${spark(150, 50)}`;
  });
  def('sapo', 'SAPO', 'bicho', c => {
    const g = '#4FA34A';
    return c.sh(100, 180, 70) + `
    <path d="M40,170 q-24,-2 -26,-14 q20,-6 40,4z M160,170 q24,-2 26,-14 q-20,-6 -40,4z" fill="${c.l(g)}" stroke="${S(g)}" stroke-width="2.5"/>
    <ellipse cx="100" cy="132" rx="64" ry="44" fill="${c.r(g, { cx: 40, cy: 20 })}" stroke="${S(g)}" stroke-width="3"/>
    <ellipse cx="100" cy="146" rx="40" ry="24" fill="${c.r('#D9EBA8')}"/>
    <circle cx="66" cy="82" r="26" fill="${c.r(g)}" stroke="${S(g)}" stroke-width="3"/><circle cx="134" cy="82" r="26" fill="${c.r(g)}" stroke="${S(g)}" stroke-width="3"/>
    <circle cx="66" cy="80" r="16" fill="#FFFBF4"/><circle cx="134" cy="80" r="16" fill="#FFFBF4"/>${eye(68, 80, 10)}${eye(132, 80, 10)}
    <path d="M70,122 Q100,140 130,122" stroke="${S(g)}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="62" cy="116" r="8" fill="#E07F62" opacity=".45"/><circle cx="138" cy="116" r="8" fill="#E07F62" opacity=".45"/>
    ${[[50, 140], [150, 140], [80, 104], [118, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${dk(g, .2)}" opacity=".5"/>`).join('')}
    ${[[60, 172], [140, 172]].map(([x, y]) => `<path d="M${x - 14},${y} q-4,-14 14,-18 q18,4 14,18z" fill="${c.l(g)}" stroke="${S(g)}" stroke-width="2.5"/>`).join('')}
    ${gl('M48,112 q10,-20 34,-24 q-20,12 -26,28z', .4)}${spark(164, 50)}`;
  });

  /* ---------- INSTRUMENTOS ---------- */
  def('pandeiro', 'PANDEIRO', 'instrumento', c => {
    const w = '#C08A3E';
    const jingles = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2 + .3; const x = 100 + Math.cos(a) * 62, y = 104 + Math.sin(a) * 50; return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><ellipse rx="10" ry="5" fill="${c.r('#D9DDE3', { hi: .6 })}" stroke="#7D8590" stroke-width="2"/><ellipse cy="-4" rx="10" ry="5" fill="${c.r('#EEF0F3', { hi: .6 })}" stroke="#7D8590" stroke-width="2"/></g>`; }).join('');
    return c.sh(100, 178, 76) + `
    <ellipse cx="100" cy="112" rx="76" ry="62" fill="${c.l(w)}" stroke="${S(w)}" stroke-width="3.5"/>
    <ellipse cx="100" cy="100" rx="76" ry="62" fill="${c.l(lt(w, .1))}" stroke="${S(w)}" stroke-width="3.5"/>
    <ellipse cx="100" cy="100" rx="66" ry="53" fill="${c.r('#F6E7C8', { cx: 40, cy: 30 })}" stroke="${dk(w, .2)}" stroke-width="2.5"/>
    <path d="M60,100 a40,32 0 0 1 80,0" fill="none" stroke="#D9483B" stroke-width="3" opacity=".55"/><circle cx="100" cy="100" r="12" fill="#F2B33D" opacity=".6"/>
    ${jingles}
    ${gl('M48,82 q14,-28 52,-32 q-36,10 -44,40z', .55)}${spark(166, 40)}`;
  });
  def('sanfona', 'SANFONA', 'instrumento', c => {
    const r = '#D9483B', k = '#FFFBF4';
    const pleats = Array.from({ length: 7 }, (_, i) => `<path d="M${66 + i * 10},44 l5,8 l-5,8 l5,8 l-5,8 l5,8 l-5,8 l5,8 l-5,8 l5,8 l-5,8 l5,8 l-5,8 l5,8 l-5,8" stroke="${i % 2 ? '#3B2A20' : '#7A4B2E'}" stroke-width="3" fill="none"/>`).join('');
    return c.sh(100, 186, 86) + `
    <rect x="62" y="40" width="76" height="130" fill="${c.stops([[0, '#5A3A2A'], [.5, '#8A5A3E'], [1, '#4A2E20']], [0, 0, 1, 0])}"/>${pleats}
    <rect x="16" y="30" width="54" height="150" rx="12" fill="${c.l(r, { dir: [0, 0, 1, 1] })}" stroke="${S(r)}" stroke-width="3.5"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="24" y="${42 + i * 14}" width="38" height="11" rx="3" fill="${c.l(i % 2 ? '#2B1B12' : k)}" stroke="#7A6A5A" stroke-width="1.5"/>`).join('')}
    <rect x="130" y="30" width="54" height="150" rx="12" fill="${c.l(r, { dir: [0, 0, 1, 1] })}" stroke="${S(r)}" stroke-width="3.5"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${146 + (i % 3) * 12}" cy="${52 + Math.floor(i / 3) * 26}" r="5" fill="${c.r(k)}" stroke="#8C7B6A" stroke-width="1.5"/>`).join('')}
    <path d="M136,150 q20,-6 42,0" stroke="#F2B33D" stroke-width="4" fill="none"/>
    ${gl('M20,40 h8 v130 h-8z', .35)}${gl('M134,40 h8 v130 h-8z', .35)}${spark(100, 26)}`;
  });
  def('tambor', 'TAMBOR', 'instrumento', c => {
    const b = '#1F6E82';
    return c.sh(100, 186, 72) + `
    <path d="M32,64 v92 q68,40 136,0 v-92z" fill="${c.cyl(b)}" stroke="${S(b)}" stroke-width="3.5"/>
    <path d="M32,74 L64,150 L100,78 L136,154 L168,76" stroke="#F2B33D" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <path d="M32,150 q68,40 136,0 v10 q-68,40 -136,0z" fill="${c.l('#D9483B')}" stroke="${S('#D9483B')}" stroke-width="3"/>
    <ellipse cx="100" cy="64" rx="68" ry="24" fill="${c.r('#F6E7C8', { cx: 40, cy: 30 })}" stroke="${S('#C08A3E')}" stroke-width="3.5"/>
    <path d="M32,64 q68,36 136,0 v10 q-68,36 -136,0z" fill="${c.l('#D9483B')}" stroke="${S('#D9483B')}" stroke-width="3"/>
    <path d="M150,20 L118,58 M168,30 L130,62" stroke="${c.l('#C08A3E')}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="150" cy="20" r="8" fill="${c.r('#7A4B2E')}"/><circle cx="168" cy="30" r="8" fill="${c.r('#7A4B2E')}"/>
    ${gl('M44,84 h8 v70 q-6,-2 -8,-6z', .45)}${spark(40, 30)}`;
  });
  def('viola', 'VIOLA', 'instrumento', c => {
    const w = '#C9823E';
    return c.sh(96, 188, 52) + `
    <g transform="rotate(-28 100 110)">
    <rect x="92" y="2" width="16" height="96" rx="3" fill="${c.l('#6B3E22', { dir: [0, 0, 1, 0] })}"/>
    <path d="M86,0 h28 l-4,-22 h-20z" fill="${c.l('#4A2E20')}"/>${[-16, -8].map(y => `<circle cx="84" cy="${y}" r="4" fill="${c.r('#E6DCCB')}"/><circle cx="116" cy="${y}" r="4" fill="${c.r('#E6DCCB')}"/>`).join('')}
    <path d="M100,92 C64,92 60,118 72,132 C52,146 56,190 100,190 C144,190 148,146 128,132 C140,118 136,92 100,92Z" fill="${c.r(w, { cx: 35, cy: 30 })}" stroke="${S(w)}" stroke-width="3.5"/>
    <circle cx="100" cy="128" r="14" fill="#2B160B"/><circle cx="100" cy="128" r="18" fill="none" stroke="#F2B33D" stroke-width="3"/>
    <rect x="84" y="160" width="32" height="7" rx="2" fill="#4A2E20"/>
    ${[95, 98, 101, 104].map(x => `<path d="M${x},-12 V163" stroke="#EDE3D3" stroke-width="1.2"/>`).join('')}
    ${gl('M74,116 q0,-16 18,-20 q-10,8 -10,22z', .5)}</g>${spark(160, 40)}`;
  });
  def('chocalho', 'CHOCALHO', 'instrumento', c => {
    const m = (tx, ty, rot, col) => `<g transform="translate(${tx},${ty}) rotate(${rot})"><rect x="-6" y="20" width="12" height="62" rx="5" fill="${c.l('#7A4B2E', { dir: [0, 0, 1, 0] })}"/><ellipse cx="0" cy="0" rx="32" ry="38" fill="${c.r(col)}" stroke="${S(col)}" stroke-width="3"/><path d="M-28,-6 q28,14 56,0 M-30,8 q30,14 60,0" stroke="#FFFBF4" stroke-width="4" fill="none" opacity=".85"/><path d="M-28,-6 q28,14 56,0" stroke="${S(col, .2)}" stroke-width="2" fill="none" stroke-dasharray="2 5"/>${gl('M-18,-22 q6,-12 18,-12 q-12,4 -14,16z', .7)}</g>`;
    return c.sh(100, 184, 66) + m(72, 78, -18, '#F2B33D') + m(132, 86, 16, '#2F6B43') + `<path d="M40,30 q-8,-6 -6,-14 M168,34 q8,-6 6,-14 M30,60 q-10,0 -14,-6" stroke="#C08A3E" stroke-width="4" stroke-linecap="round" fill="none"/>` + spark(100, 20);
  });

  /* ---------- FIGURINHAS que falam ---------- */
  const fig = (word, bg, inner) => c => `${c.sh(100, 184, 60)}
    <g transform="rotate(-4 100 100)">
    <rect x="34" y="14" width="132" height="168" rx="14" fill="${c.stops([[0, '#FFE7A0'], [.3, '#F7C5D9'], [.6, '#BFE3EC'], [1, '#C9E7B4']], [0, 0, 1, 1])}" stroke="#B88A2E" stroke-width="3"/>
    <rect x="42" y="22" width="116" height="152" rx="9" fill="#FFFBF4"/>
    <rect x="48" y="28" width="104" height="104" rx="7" fill="${c.stops([[0, lt(bg, .45)], [1, bg]])}"/>
    <g transform="translate(48,28)">${inner(c)}</g>
    <text x="92" y="160" font-family="Fredoka" font-weight="700" font-size="22" text-anchor="middle" fill="#3B2A20">${word}</text>
    <g transform="translate(140,152)"><circle r="11" fill="${c.r('#1F6E82')}"/><path d="M-5,-3 h3 l5,-4 v14 l-5,-4 h-3z" fill="#fff"/><path d="M5,-4 q3,4 0,8" stroke="#fff" stroke-width="1.8" fill="none"/></g>
    ${gl('M42,22 h40 l-40,60z', .35)}</g>`;
  def('fig_ipe', 'FIGURINHA IPÊ', 'figurinha', fig('IPÊ', '#9ED3E4', c => `
    <path d="M52,104 q-2,-30 0,-56" stroke="#6B3E22" stroke-width="7" stroke-linecap="round"/><path d="M52,66 l-20,-14 M52,58 l18,-16" stroke="#6B3E22" stroke-width="4" stroke-linecap="round"/>
    ${[[30, 40, 20], [52, 30, 24], [74, 40, 20], [40, 22, 14], [66, 20, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.r('#F2C94C', { hi: .5 })}"/>`).join('')}
    ${[[30, 36], [56, 26], [76, 42], [44, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#E8892E"/>`).join('')}
    <path d="M0,104 q52,-14 104,0z" fill="#8CC084"/>`));
  def('fig_onca', 'FIGURINHA ONÇA', 'figurinha', fig('ONÇA', '#8CC084', c => `
    <ellipse cx="52" cy="62" rx="36" ry="32" fill="${c.r('#E9A43B', { hi: .45 })}"/>
    <circle cx="26" cy="34" r="10" fill="${c.r('#E9A43B')}"/><circle cx="78" cy="34" r="10" fill="${c.r('#E9A43B')}"/><circle cx="26" cy="34" r="5" fill="#B66A2A"/><circle cx="78" cy="34" r="5" fill="#B66A2A"/>
    ${[[30, 54], [74, 54], [40, 40], [64, 40], [24, 72], [80, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="#3B2A20" stroke-width="2.5"/>`).join('')}
    <ellipse cx="52" cy="76" rx="16" ry="12" fill="#FFF4E2"/>${eye(40, 58, 5)}${eye(64, 58, 5)}<path d="M48,72 h8 l-4,5z" fill="#3B2A20"/>`));
  def('fig_caju', 'FIGURINHA CAJU', 'figurinha', fig('CAJU', '#FCE3A6', c => `
    <path d="M24,40 C20,80 40,96 52,96 C64,96 84,80 80,40 C70,28 34,28 24,40Z" fill="${c.r('#E2432F', { hi: .45 })}"/>
    <path d="M36,32 q16,-12 32,0 q-4,-18 -16,-22 q-12,4 -16,22z" fill="${c.r('#9C6B42')}"/>
    ${gl('M32,48 q4,-12 14,-12 q-8,6 -8,16z', .6)}<path d="M60,22 q14,-10 24,-4" stroke="#2F6B43" stroke-width="4" fill="none"/>`));

  /* ---------- EVENTOS (voltam todo ano) ---------- */
  // Decisão 012: sem bandeirinhas/fogueira juninas nem itens de carnaval. Eventos: feira de leitura, colheita, festival de talentos, formatura.
  def('varal', 'VARAL DE LIVROS', 'evento', c => {
    const cols = ['#1F3A6B', '#F2B33D', '#FFFBF4']; // marinho, amarelo-ipê, branco (D009: 2–3 cores)
    const pts = Array.from({ length: 5 }, (_, i) => { const x = 30 + i * 35; const y = 52 + Math.sin(i / 4 * Math.PI) * 24; return [x, y]; });
    return c.sh(100, 184, 70) + `<path d="M8,40 Q100,100 192,40" stroke="#7A4B2E" stroke-width="3" fill="none"/>` +
      pts.map(([x, y], i) => { const col = cols[i % 3]; return `<g transform="rotate(${(i - 2) * 4} ${x} ${y})">
      <path d="M${x - 15},${y} h30 v40 h-30z" fill="${c.l(col, { dir: [0, 0, 1, 1] })}" stroke="${S(col)}" stroke-width="2.5"/>
      <path d="M${x},${y} v40" stroke="${S(col, .35)}" stroke-width="2"/>
      <path d="M${x - 10},${y + 12} h7 M${x - 10},${y + 18} h7 M${x + 3},${y + 12} h7 M${x + 3},${y + 18} h7" stroke="${col === '#FFFBF4' ? '#1F3A6B' : '#FFFBF4'}" stroke-width="2" opacity=".7"/>
      <rect x="${x - 3}" y="${y - 6}" width="6" height="9" rx="2" fill="#C08A3E"/></g>`; }).join('') +
      `<path d="M30,150 h140 v10 h-140z" fill="${c.l('#7A4B2E')}" stroke="${S('#7A4B2E')}" stroke-width="2.5"/>
      ${[[44, '#1F3A6B'], [64, '#F2B33D'], [82, '#2F6B43'], [100, '#1F3A6B'], [118, '#F2B33D']].map(([x, col]) => `<rect x="${x}" y="116" width="15" height="34" rx="2" fill="${c.l(col)}" stroke="${S(col)}" stroke-width="2"/>`).join('')}
      ${spark(164, 112)}`;
  });
  def('cesta', 'CESTA DA COLHEITA', 'evento', c => {
    const w = '#C08A3E';
    return c.sh(100, 184, 76) + `
    <path d="M40,96 Q100,20 160,96" stroke="${c.l('#7A4B2E')}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${[[70, 92, -24], [96, 86, -6], [124, 90, 18]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="11" ry="30" fill="${c.l('#F2C94C', { dir: [0, 0, 1, 0] })}" stroke="#B8862B" stroke-width="2.5"/><path d="M${x - 10},${y + 10} q-8,24 4,34 M${x + 10},${y + 10} q8,24 -4,34" fill="${c.l('#6FA35A')}" stroke="#2F6B43" stroke-width="2"/></g>`).join('')}
    <circle cx="146" cy="104" r="15" fill="${c.r('#E2432F')}"/><circle cx="54" cy="106" r="13" fill="${c.r('#F2A33D')}"/>
    <path d="M30,104 h140 l-16,72 q-2,8 -10,8 h-88 q-8,0 -10,-8z" fill="${c.l(w, { dir: [0, 0, 1, 1] })}" stroke="${S(w)}" stroke-width="3.5" ${sw}/>
    ${[124, 144, 164].map(y => `<path d="M${36 + (y - 104) / 5},${y} H${164 - (y - 104) / 5}" stroke="${S(w, .3)}" stroke-width="3"/>`).join('')}
    ${[60, 85, 110, 135].map(x => `<path d="M${x},106 l4,76" stroke="${S(w, .3)}" stroke-width="2.5"/>`).join('')}
    ${gl('M38,110 h18 l-8,40z', .35)}${spark(166, 50)}`;
  });
  def('microfone', 'MICROFONE', 'evento', c => {
    const m = '#1F3A6B';
    return c.sh(100, 186, 46) + `<g transform="rotate(-12 100 100)">
    <path d="M86,92 h28 l-6,70 h-16z" fill="${c.l(m, { dir: [0, 0, 1, 0] })}" stroke="${S(m)}" stroke-width="3" ${sw}/>
    <circle cx="100" cy="60" r="34" fill="${c.r('#C9CED6')}" stroke="#6B7280" stroke-width="3"/>
    ${[44, 56, 68, 80].map(y => `<path d="M${70},${y} H130" stroke="#8A919C" stroke-width="2" opacity=".6"/>`).join('')}
    <rect x="80" y="90" width="40" height="10" rx="4" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2"/>
    ${gl('M78,44 q8,-16 24,-18 q-14,8 -18,24z', .6)}</g>${spark(160, 40)}${spark(40, 60, .7)}`;
  });
  def('capelo', 'CAPELO DE FORMATURA', 'evento', c => {
    const b = '#1F3A6B';
    return c.sh(100, 176, 70) + `
    <path d="M62,104 v34 q38,22 76,0 v-34z" fill="${c.l(b, { dir: [0, 0, 1, 1] })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M100,52 L180,86 L100,120 L20,86Z" fill="${c.l(b, { dir: [0, 0, 1, 1], hi: .45 })}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <circle cx="100" cy="86" r="6" fill="${c.r('#F2B33D')}"/>
    <path d="M100,86 Q150,92 152,112 V140" stroke="#F2B33D" stroke-width="4" fill="none"/>
    <path d="M146,140 h12 l4,22 h-20z" fill="${c.l('#F2B33D')}" stroke="${S('#F2B33D')}" stroke-width="2"/>
    ${gl('M40,84 L100,58 L84,72Z', .45)}${spark(40, 40)}`;
  });
  def('pipa', 'PIPA', 'evento', c => {
    return c.sh(110, 188, 40) + `<g transform="rotate(-10 100 90)">
    <path d="M100,14 L156,84 L100,150 L44,84Z" fill="${c.l('#F2B33D', { dir: [0, 0, 1, 1] })}" stroke="#9C6B1E" stroke-width="3.5" ${sw}/>
    <path d="M100,14 L156,84 L100,84Z" fill="${c.l('#D9483B')}"/><path d="M100,84 L44,84 L100,150Z" fill="${c.l('#1F6E82')}"/>
    <path d="M100,14 V150 M44,84 H156" stroke="#7A4B2E" stroke-width="2.5"/>
    <path d="M100,150 q-14,14 0,22 q14,8 -2,20" stroke="#7A4B2E" stroke-width="2.5" fill="none"/>
    ${[[96, 162, '#B23C62'], [104, 178, '#2F6B43'], [96, 192, '#F2B33D']].map(([x, y, col]) => `<path d="M${x},${y} l-10,-6 v12z M${x},${y} l10,-6 v12z" fill="${col}"/>`).join('')}
    ${gl('M100,22 L66,66 L74,66 L100,32Z', .5)}</g>
    <path d="M150,96 Q180,140 196,190" stroke="#A89A88" stroke-width="1.5" fill="none"/>${spark(30, 40)}`;
  });
  def('piao', 'PIÃO', 'evento', c => {
    const b = '#D9483B';
    return c.sh(104, 186, 48) + `
    <path d="M100,180 L58,96 Q100,70 142,96Z" fill="${c.cyl(b)}" stroke="${S(b)}" stroke-width="3.5" ${sw}/>
    <path d="M70,120 Q100,136 130,120 L124,132 Q100,146 76,132Z" fill="${c.l('#F2B33D')}"/>
    <path d="M84,152 Q100,160 116,152 L110,164 Q100,168 90,164Z" fill="${c.l('#1F6E82')}"/>
    <ellipse cx="100" cy="94" rx="44" ry="18" fill="${c.r(lt(b, .2))}" stroke="${S(b)}" stroke-width="3.5"/>
    <rect x="94" y="56" width="12" height="34" rx="5" fill="${c.cyl('#7A4B2E')}"/>
    <path d="M100,180 v10" stroke="#6E7682" stroke-width="4" stroke-linecap="round"/>
    <path d="M30,150 q-10,-20 6,-34 M170,150 q10,-20 -6,-34" stroke="#C9A77C" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    ${gl('M70,104 L94,170 L98,166 L78,106Z', .45)}${spark(160, 50)}`;
  });

  W.ITENS = I;
  W.item = (k, extra = '') => { const it = I[k]; const c = new Ctx(); return c.svg(it.fn(c), '0 0 200 200', extra); };

  /* moedinha com brilho */
  W.coin = (s = 24) => { const c = new Ctx(); return c.svg(`<circle cx="50" cy="52" r="44" fill="#B87A16"/><circle cx="50" cy="48" r="44" fill="${c.r('#F2B33D', { hi: .55 })}" stroke="#A86A12" stroke-width="4"/><circle cx="50" cy="48" r="32" fill="none" stroke="#D99A26" stroke-width="4"/><path d="M42,30 q-12,18 0,36 q16,-4 16,-18 q0,-14 -16,-18z" fill="#E0951F"/><path d="M50,30 q14,4 14,18" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>${spark(26, 24, .9)}`, '0 0 100 100', `width="${s}" height="${s}"`); };
})(window);
