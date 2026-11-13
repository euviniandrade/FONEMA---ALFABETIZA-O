// FONEMA · Interiores da vila (perspectiva de um ponto, luz de janela, camadas de paralaxe)
const L = require('./lib');
const { W, H, f, rng, mix, Scene, finish, canopy, particles, shadowE, flowers } = L;

// sala em perspectiva: parede do fundo (bx0,by0)-(bx1,by1)
function room(s, { b = [190, 70, 1090, 540], wall = '#F2DDB8', side = '#E2C69C', floor = ['#B87A44', '#8A5430'], ceil = '#D8B88A', planks = 16, base = '#9A6A40' } = {}) {
  const [x0, y0, x1, y1] = b;
  s.add('sky', `<rect width="${W}" height="${H}" fill="${wall}"/>`);
  s.add('sky', `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${s.lin([[0, mix(wall, '#FFFFFF', .12)], [1, mix(wall, '#3A2218', .08)]])}"/>`);
  s.add('sky', `<path d="M0,0 L${x0},${y0} L${x0},${y1} L0,${H}Z" fill="${s.lin([[0, mix(side, '#3A2218', .18)], [1, side]], 0, 0, 1, 0)}"/><path d="M${W},0 L${x1},${y0} L${x1},${y1} L${W},${H}Z" fill="${s.lin([[0, side], [1, mix(side, '#3A2218', .22)]], 0, 0, 1, 0)}"/>`);
  s.add('sky', `<path d="M0,0 L${W},0 L${x1},${y0} L${x0},${y0}Z" fill="${s.lin([[0, mix(ceil, '#3A2218', .2)], [1, ceil]])}"/>`);
  let fl = `<path d="M${x0},${y1} L${x1},${y1} L${W},${H} L0,${H}Z" fill="${s.lin([[0, floor[0]], [1, floor[1]]])}"/>`;
  for (let i = 0; planks > 0 && i <= planks; i++) { const t = i / planks; fl += `<path d="M${f(x0 + (x1 - x0) * t)},${y1} L${f(-200 + (W + 400) * t)},${H}" stroke="${mix(floor[1], '#000000', .25)}" stroke-width="1.6" opacity=".45"/>`; }
  [.12, .3, .55, .85].forEach(k => { const y = y1 + (H - y1) * k, xl = x0 - x0 * k, xr = x1 + (W - x1) * k; fl += `<path d="M${f(xl)},${f(y)} L${f(xr)},${f(y)}" stroke="${mix(floor[1], '#000000', .2)}" stroke-width="1.2" opacity=".3"/>`; });
  fl += `<path d="M${x0},${y1} L${x1},${y1}" stroke="${base}" stroke-width="8"/><path d="M${x0},${y1} L0,${H}" stroke="${base}" stroke-width="10"/><path d="M${x1},${y1} L${W},${H}" stroke="${base}" stroke-width="10"/>`;
  s.add('far', fl);
}
// facho de luz da janela até o chão
function beam(s, pts, o = .32, col = '#FFF2C8') {
  s.add('near', `<path d="M${pts.map(p => p.join(',')).join(' L')}Z" fill="${s.lin([[0, col, o], [1, col, 0]])}" filter="${s.blur(10)}" style="mix-blend-mode:screen"/>`);
}
function windowArch(s, x, y, w, h, out = 'day', frame = '#8A5A33') {
  let g = `<path d="M${x},${y + h} V${y + w / 2} a${w / 2},${w / 2} 0 0 1 ${w},0 V${y + h}Z" fill="${out === 'day' ? s.lin([[0, '#9ED3F0'], [1, '#E6F4F2']]) : s.lin([[0, '#1E2A5A'], [1, '#5A4A8A']])}"/>`;
  if (out === 'day') g += `<ellipse cx="${x + w * .3}" cy="${y + h - 10}" rx="${w * .5}" ry="30" fill="#9CCB85"/><ellipse cx="${x + w * .85}" cy="${y + h - 4}" rx="${w * .45}" ry="26" fill="#7DB56E"/>` + canopy(x + w * .75, y + h - 50, w * .25, 30, ['#C98A10', '#F0B21A', '#FFD24A'], 3);
  g += `<path d="M${x},${y + h} V${y + w / 2} a${w / 2},${w / 2} 0 0 1 ${w},0 V${y + h}Z" fill="none" stroke="${frame}" stroke-width="12"/><path d="M${x + w / 2},${y} V${y + h} M${x},${y + h * .55} H${x + w}" stroke="${frame}" stroke-width="7"/><rect x="${x - 14}" y="${y + h - 4}" width="${w + 28}" height="14" rx="4" fill="${mix(frame, '#FFFFFF', .15)}"/>`;
  return g;
}
const BOOKC = ['#C2410C', '#1D4ED8', '#2F7D4F', '#F4B400', '#6D3FC0', '#E26D5A', '#1F7A70', '#4FA3C7', '#8CC084'];
function shelf(x, y, w, h, rows, seed, wood = '#8A5A33') {
  const r = rng(seed); let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wood}"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" fill="${mix(wood, '#000000', .35)}"/>`;
  const rh = (h - 20) / rows;
  for (let k = 0; k < rows; k++) {
    const sy = y + 10 + (k + 1) * rh; let bx = x + 14;
    while (bx < x + w - 24) { const bw = 9 + r() * 12, bh = rh * (.55 + r() * .32), c = BOOKC[Math.floor(r() * BOOKC.length)]; if (r() < .08) { bx += 14; continue; } g += `<rect x="${f(bx)}" y="${f(sy - bh - 6)}" width="${f(bw)}" height="${f(bh)}" rx="1.5" fill="${c}"/><rect x="${f(bx)}" y="${f(sy - bh + 2)}" width="${f(bw)}" height="3" fill="#FFF8E8" opacity=".5"/><rect x="${f(bx + bw - 3)}" y="${f(sy - bh - 6)}" width="3" height="${f(bh)}" fill="#000" opacity=".15"/>`; bx += bw + 1.5; }
    g += `<rect x="${x + 6}" y="${f(sy - 6)}" width="${w - 12}" height="9" fill="${mix(wood, '#FFFFFF', .1)}"/>`;
  }
  return g;
}
function rug(cx, cy, rx, ry, c1, c2, c3) { return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c1}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * .88}" ry="${ry * .82}" fill="none" stroke="${c2}" stroke-width="6" stroke-dasharray="18 10"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * .6}" ry="${ry * .55}" fill="none" stroke="${c3}" stroke-width="5"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * .32}" ry="${ry * .3}" fill="${mix(c1, '#FFFFFF', .25)}"/>`; }
function plant(x, y, s = 1, seed = 1) { return `<g transform="translate(${x},${y}) scale(${s})">${L.bigLeaves(0, -60, .5, seed, ['#2F6B43', '#3E8A55', '#5FA06D'], 1, 7, -70, 70)}<path d="M-34,-64 L34,-64 L26,0 L-26,0Z" fill="#C2693E"/><rect x="-38" y="-70" width="76" height="12" rx="4" fill="#D9804F"/></g>`; }
function lampHang(s, x, y, len, col = '#E8B030') { return `<path d="M${x},0 V${y}" stroke="#4A3828" stroke-width="2"/><path d="M${x - 30},${y + 26} Q${x},${y - 14} ${x + 30},${y + 26}Z" fill="${col}"/><ellipse cx="${x}" cy="${y + 26}" rx="30" ry="6" fill="#FFF2C4"/><ellipse cx="${x}" cy="${y + 60}" rx="${len}" ry="${len * .5}" fill="#FFE6A0" opacity=".22" filter="${s.blur(18)}"/>`; }

// =============================================================================================
function biblioteca() {
  const s = new Scene('biblioteca');
  room(s, { wall: '#EAD2A8', side: '#D8B888', floor: ['#A86A3A', '#7A4A26'], ceil: '#C8A070' });
  // estantes do fundo, janela em arco ao centro
  s.add('far', shelf(200, 90, 330, 450, 5, 3) + shelf(750, 90, 330, 450, 5, 4));
  s.add('far', windowArch(s, 560, 120, 160, 300));
  s.add('far', `<rect x="540" y="430" width="200" height="110" fill="#8A5A33"/><rect x="552" y="442" width="176" height="86" fill="#6A4026"/>${[0, 1].map(k => `<rect x="560" y="${450 + k * 40}" width="160" height="6" fill="#9A6A40"/>`).join('')}`);
  // estantes laterais em perspectiva
  const sideShelf = (dir) => {
    const x0 = dir < 0 ? -10 : W + 10, xe = dir < 0 ? 172 : W - 172; const r = rng(dir < 0 ? 5 : 6);
    const X = u => x0 + (xe - x0) * u, Y = (u, t) => (40 + 650 * t) * (1 - u) + (100 + 450 * t) * u;
    let g = `<path d="M${x0},${Y(0, 0)} L${xe},${Y(1, 0)} L${xe},${Y(1, 1)} L${x0},${Y(0, 1)}Z" fill="#7A4A2A"/><path d="M${x0},${Y(0, 0)} L${xe},${Y(1, 0)} L${xe},${Y(1, 1)} L${x0},${Y(0, 1)}Z" fill="#000" opacity=".25"/>`;
    for (let k = 1; k <= 5; k++) { const t = k / 5.2; let u = .02; while (u < .95) { const du = (.035 + r() * .03) * (1 - u * .35), hb = (r() * .25 + .62) * (Y(u, t) - Y(u, t - 1 / 5.2)), c = BOOKC[Math.floor(r() * BOOKC.length)]; if (r() > .06) g += `<path d="M${f(X(u))},${f(Y(u, t))} L${f(X(u + du))},${f(Y(u + du, t))} L${f(X(u + du))},${f(Y(u + du, t) - hb * (1 - (u + du) * .3))} L${f(X(u))},${f(Y(u, t) - hb * (1 - u * .3))}Z" fill="${c}"/><path d="M${f(X(u))},${f(Y(u, t) - hb * .7)} L${f(X(u + du))},${f(Y(u + du, t) - hb * .7 * (1 - (u + du) * .3) / (1 - u * .3))}" stroke="#FFF8E8" stroke-width="2" opacity=".45"/>`; u += du + .004; }
      g += `<path d="M${x0},${f(Y(0, t))} L${xe},${f(Y(1, t))}" stroke="#A8703E" stroke-width="${dir ? 7 : 7}"/>`; }
    return g;
  };
  s.add('far', sideShelf(-1) + sideShelf(1));
  // escada de biblioteca
  s.add('mid', `<path d="M1000,560 L1050,110 M1060,560 L1110,110" stroke="#6A4026" stroke-width="8"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${1004 + i * 5.5},${510 - i * 48} h58" stroke="#8A5A33" stroke-width="6"/>`).join('')}`);
  // tapete, mesa redonda com globo, lupa e livro
  s.add('mid', rug(640, 680, 380, 80, '#E9C46A', '#C2410C', '#1F7A70'));
  s.add('mid', `<g>${shadowE(640, 650, 140, .3)}<path d="M630,560 L620,650 L660,650 L650,560Z" fill="#6A4026"/><ellipse cx="640" cy="560" rx="150" ry="34" fill="#8A5A33"/><ellipse cx="640" cy="554" rx="150" ry="34" fill="#A8703E"/><ellipse cx="610" cy="548" rx="90" ry="16" fill="#C08850" opacity=".6"/></g>`);
  s.hotspot('mid', 700, 590, 46, 'mesa');
  s.add('mid', `<g transform="translate(560,500)"><circle r="32" fill="#4FA3C7"/><path d="M-20,-14 q10,6 6,16 q-6,8 4,16 M8,-26 q12,8 4,18 q8,10 14,4" stroke="#8CC084" stroke-width="9" fill="none" stroke-linecap="round"/><circle r="32" fill="none" stroke="#8A5A33" stroke-width="4"/><path d="M-40,0 a40,40 0 0 0 80,0" stroke="#C9A060" stroke-width="4" fill="none"/><path d="M0,40 v14 M-16,56 h32" stroke="#6A4026" stroke-width="5"/><ellipse cx="-12" cy="-12" rx="8" ry="5" fill="#fff" opacity=".4"/></g>`);
  s.hotspot('mid', 560, 500, 44, 'globo');
  s.add('mid', `<g transform="translate(690,546)"><path d="M-60,-6 Q-30,-18 0,-6 Q30,-18 60,-6 L60,8 Q30,-4 0,8 Q-30,-4 -60,8Z" fill="#FFFBF2"/><path d="M0,-6 V8" stroke="#C9B49A" stroke-width="2"/><path d="M-60,8 Q-30,-4 0,8 Q30,-4 60,8 L60,12 Q30,0 0,12 Q-30,0 -60,12Z" fill="#1D4ED8"/>${[-48, -36, 10, 22].map(x => `<path d="M${x},${-6 + Math.abs(x) * .04} h${x < 0 ? 34 : 30}" stroke="#C9B49A" stroke-width="1.6"/>`).join('')}</g>`);
  s.hotspot('mid', 690, 540, 40, 'livro');
  s.add('mid', `<g transform="translate(770,540) rotate(-20)"><circle r="14" fill="#DFF2F6" stroke="#8A6A3A" stroke-width="4"/><path d="M10,10 L30,30" stroke="#6A4026" stroke-width="7" stroke-linecap="round"/><path d="M-6,-6 a8,8 0 0 1 8,-2" stroke="#fff" stroke-width="2" fill="none"/></g>`);
  s.hotspot('mid', 778, 546, 30, 'lupa');
  s.hotspot('mid', 400, 712, 44, 'tapete');
  // poltrona e almofadas
  s.add('near', `<g transform="translate(210,700)">${shadowE(0, 6, 120, .3)}<path d="M-100,0 L-110,-120 Q-110,-150 -80,-150 L80,-150 Q110,-150 110,-120 L100,0Z" fill="#1F7A70"/><path d="M-120,-80 Q-130,-40 -110,0 L-80,0 L-84,-70Z M120,-80 Q130,-40 110,0 L80,0 L84,-70Z" fill="#17605A"/><rect x="-84" y="-60" width="168" height="40" rx="12" fill="#2A9A8C"/><path d="M-90,-140 Q0,-160 90,-140" stroke="#3AB0A0" stroke-width="10" fill="none" opacity=".6"/></g>`);
  s.add('near', plant(1150, 740, 1.1, 7) + `<g transform="translate(1000,760)">${shadowE(0, 0, 50, .3)}${[0, 1, 2, 3].map(i => `<rect x="${-40 + (i % 2) * 6}" y="${-22 - i * 20}" width="${86 - i * 6}" height="20" rx="3" fill="${BOOKC[i + 2]}"/><rect x="${-34 + (i % 2) * 6}" y="${-18 - i * 20}" width="${74 - i * 6}" height="12" fill="#FFF8E8" opacity=".85"/>`).join('')}</g>`);
  s.add('near', L.gato(1060, 676, .9, true, '#E8A048'));
  beam(s, [[560, 130], [720, 130], [900, 760], [420, 760]], .38);
  s.add('fg', lampHang(s, 420, 40, 120) + lampHang(s, 860, 40, 120) + particles(201, 50, 420, 900, 120, 700, '#FFF6D0', 1.6, .6));
  finish(s, { vignette: '#3A1E0E', vo: .35, warm: '#FFC070', warmO: .12 });
  return s;
}

// =============================================================================================
function padaria() {
  const s = new Scene('padaria');
  room(s, { b: [160, 60, 1120, 470], wall: '#F4E6CC', side: '#E2CCA4', floor: ['#C8A47A', '#9A7A54'], ceil: '#D8BC90', planks: 0, base: '#8A6A44' });
  // piso xadrez
  { let g = ''; for (let r = 0; r < 8; r++) for (let c = -6; c < 22; c++) { const y0 = 470 + (H - 470) * Math.pow(r / 8, 1.3), y1 = 470 + (H - 470) * Math.pow((r + 1) / 8, 1.3), k0 = (y0 - 470) / (H - 470), k1 = (y1 - 470) / (H - 470); const xa = t => 160 + (1120 - 160) * t, xp = (t, k) => xa(t) + (t - .5) * 1280 * k * .9; const t0 = c / 16, t1 = (c + 1) / 16; if ((r + c) % 2) g += `<path d="M${f(xp(t0, k0))},${f(y0)} L${f(xp(t1, k0))},${f(y0)} L${f(xp(t1, k1))},${f(y1)} L${f(xp(t0, k1))},${f(y1)}Z" fill="#8A6A4A" opacity=".55"/>`; } s.add('far', g); }
  // azulejos atrás do balcão
  { let g = ''; for (let y = 240; y < 470; y += 30) for (let x = 160; x < 1120; x += 30) g += `<rect x="${x + 1}" y="${y + 1}" width="28" height="28" fill="${((x + y) / 30) % 2 ? '#E8F0F4' : '#D8E6EE'}"/><path d="M${x + 15},${y + 6} l9,9 l-9,9 l-9,-9z" fill="#4E8AB8" opacity=".55"/>`; s.add('far', g); }
  // forno a lenha (arco de tijolos)
  s.add('far', `<g transform="translate(900,470)"><path d="M-170,0 V-200 Q-170,-300 0,-300 Q170,-300 170,-200 V0Z" fill="#C8784A"/>${Array.from({ length: 9 }, (_, i) => `<path d="M-170,${-20 - i * 22} H170" stroke="#A85A34" stroke-width="2" opacity=".7"/>`).join('')}<path d="M-80,0 V-90 a80,80 0 0 1 160,0 V0Z" fill="#2A140C"/><path d="M-60,0 V-80 a60,60 0 0 1 120,0 V0Z" fill="${s.rad([[0, '#FFE08A'], [.5, '#F28C28'], [1, '#8A2A10']], .5, .8, .7)}"/>${[[-30, -10], [0, -16], [30, -8]].map(([a, b]) => `<path d="M${a - 16},${b} l32,-8" stroke="#5A2A10" stroke-width="8" stroke-linecap="round"/>`).join('')}<circle cx="0" cy="-60" r="120" fill="#FFB060" opacity=".22" filter="${s.blur(20)}"/></g>`);
  s.hotspot('far', 900, 420, 62, 'forno');
  // quadro-negro com ícones
  s.add('far', `<g transform="translate(360,110)"><rect width="300" height="150" rx="6" fill="#2E3A34" stroke="#8A5A33" stroke-width="10"/>${[['🍞', 0], ['🍰', 1], ['☕', 2]].map((_, i) => `<circle cx="${60 + i * 90}" cy="70" r="28" fill="none" stroke="#F4EEE0" stroke-width="3" opacity=".8"/>`).join('')}<path d="M44,70 q16,-22 32,0 q-16,10 -32,0z" fill="none" stroke="#F2C94C" stroke-width="3"/><path d="M134,80 h52 v-14 h-52z M140,66 v-8 h40 v8" fill="none" stroke="#E89ACB" stroke-width="3"/><path d="M226,58 h34 v24 q-17,10 -34,0z M260,64 q10,0 8,10" fill="none" stroke="#F4EEE0" stroke-width="3"/><path d="M30,120 h240" stroke="#F4EEE0" stroke-width="2" stroke-dasharray="6 8" opacity=".5"/></g>`);
  // prateleiras com pães
  const bread = (x, y, k = 1) => `<g transform="translate(${x},${y}) scale(${k})"><ellipse cx="0" cy="0" rx="26" ry="14" fill="#C8803A"/><ellipse cx="-4" cy="-4" rx="20" ry="9" fill="#E0A050"/>${[-10, 0, 10].map(d => `<path d="M${d - 4},-8 q4,4 8,0" stroke="#9A5A20" stroke-width="2" fill="none"/>`).join('')}</g>`;
  s.add('far', `<rect x="170" y="290" width="380" height="10" fill="#8A5A33"/><rect x="170" y="380" width="380" height="10" fill="#8A5A33"/>${[0, 1, 2, 3, 4, 5].map(i => bread(206 + i * 60, 276, .9)).join('')}${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${215 + i * 70},366)"><circle r="16" fill="#D8A050"/><circle r="10" cx="-3" cy="-3" fill="#F0C070"/><circle r="2" cx="4" cy="2" fill="#FFF8E8"/></g>`).join('')}`);
  // balcão com vitrine (mid)
  s.add('mid', `<path d="M90,520 L1040,520 L1040,660 L90,660Z" fill="#8A5A33"/><path d="M90,520 L1040,520 L1060,500 L110,500Z" fill="#B87A44"/><rect x="120" y="540" width="890" height="100" fill="#6A4026"/>${[0, 1, 2, 3].map(i => `<rect x="${140 + i * 220}" y="556" width="200" height="70" rx="6" fill="#9A6A40"/>`).join('')}`);
  s.add('mid', `<path d="M140,500 L140,400 Q140,390 150,390 L560,390 Q570,390 570,400 L570,500" fill="#DFF2F6" opacity=".35" stroke="#B8C8CC" stroke-width="3"/>`);
  s.add('mid', bread(220, 470, 1.4) + bread(300, 474, 1.3) + bread(260, 446, 1.2));
  s.hotspot('mid', 262, 464, 56, 'pão');
  s.add('mid', `<g transform="translate(450,480)"><ellipse cx="0" cy="10" rx="62" ry="12" fill="#E8E0D0"/><path d="M-50,10 V-40 Q0,-56 50,-40 V10Z" fill="#7A3A20"/><ellipse cx="0" cy="-40" rx="50" ry="12" fill="#F4E8D8"/><path d="M-50,-30 q12,14 24,0 q12,14 26,0 q12,14 26,0 q12,14 24,0" fill="#F4E8D8"/><circle cx="-14" cy="-46" r="6" fill="#E2483D"/><circle cx="14" cy="-44" r="6" fill="#E2483D"/><path d="M-40,-20 V4" stroke="#A85A34" stroke-width="5" opacity=".6"/></g>`);
  s.hotspot('mid', 450, 456, 52, 'bolo');
  s.add('mid', `<g transform="translate(700,480)"><ellipse cx="0" cy="12" rx="74" ry="14" fill="#C89A5A"/><path d="M-70,12 Q-74,-10 -60,-14 L60,-14 Q74,-10 70,12Z" fill="#B88A4A"/>${[[-36, -18], [0, -22], [36, -18], [-18, -34], [18, -34]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="18" ry="13" fill="#D8A84A"/><ellipse cx="${a - 4}" cy="${b - 4}" rx="9" ry="5" fill="#F2CC70"/>${[0, 1, 2].map(k => `<circle cx="${a - 6 + k * 6}" cy="${b + 2}" r="1.3" fill="#8A5A20"/>`).join('')}`).join('')}</g>`);
  s.hotspot('mid', 700, 460, 54, 'broa');
  s.add('mid', `<g transform="translate(566,486)"><ellipse cx="0" cy="12" rx="34" ry="8" fill="#E8E0D0"/><path d="M-22,12 L-26,-26 L26,-26 L22,12Z" fill="#FFFBF2"/><path d="M26,-18 q16,0 14,14 q-2,10 -16,8" stroke="#FFFBF2" stroke-width="6" fill="none"/><ellipse cx="0" cy="-26" rx="26" ry="6" fill="#5A2E16"/><path d="M-8,-40 q-6,-14 4,-24 M8,-38 q-6,-16 4,-26" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/><path d="M-12,-6 h24" stroke="#C2410C" stroke-width="4"/></g>`);
  s.hotspot('mid', 566, 466, 40, 'café');
  // cestos, sacos de farinha (near)
  s.add('near', `<g transform="translate(1160,760)">${shadowE(0, 0, 70, .3)}<path d="M-60,0 L-70,-80 L70,-80 L60,0Z" fill="#C8A060"/>${Array.from({ length: 6 }, (_, i) => `<path d="M-64,${-12 - i * 12} H64" stroke="#9A7A40" stroke-width="3"/>`).join('')}${[[-30, -88], [0, -96], [30, -88]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="28" ry="14" fill="#E0A050" transform="rotate(-20 ${a} ${b})"/>`).join('')}</g><g transform="translate(110,770)">${shadowE(0, 0, 60, .3)}<path d="M-50,0 Q-60,-70 -36,-110 L36,-110 Q60,-70 50,0Z" fill="#F4ECDC"/><path d="M-36,-110 Q0,-124 36,-110 Q20,-96 0,-100 Q-20,-96 -36,-110Z" fill="#E2D6C0"/><text x="0" y="-46" text-anchor="middle" font-family="Andika" font-weight="700" font-size="20" fill="#8A6A44">farinha</text></g>`);
  s.add('far', `<path d="M1150,130 L1250,104 L1250,380 L1150,370Z" fill="${s.lin([[0, '#9ED3F0'], [1, '#F4ECD0']])}"/><path d="M1150,130 L1250,104 L1250,380 L1150,370Z M1200,117 L1200,375 M1150,250 L1250,242" fill="none" stroke="#8A5A33" stroke-width="8"/><path d="M20,200 L130,170 L130,182 L20,214Z" fill="#8A5A33"/>${[0, 1, 2, 3].map(i => `<g transform="translate(${36 + i * 24},${196 - i * 6})"><rect x="-9" y="-30" width="18" height="30" rx="4" fill="#E8F4F4" opacity=".8"/><rect x="-9" y="-16" width="18" height="16" rx="3" fill="${['#E2483D', '#F2B33D', '#8A5A20', '#E89ACB'][i]}"/><rect x="-10" y="-34" width="20" height="6" rx="2" fill="#C8A070"/></g>`).join('')}`);
  beam(s, [[1150, 130], [1250, 104], [980, 790], [620, 790]], .28);
  s.add('fg', lampHang(s, 330, 30, 120, '#C2410C') + lampHang(s, 700, 30, 120, '#C2410C') + particles(211, 40, 600, 1200, 200, 500, '#FFF4D0', 1.4, .5));
  finish(s, { vignette: '#3A1E0E', vo: .32, warm: '#FFB060', warmO: .14 });
  return s;
}

// =============================================================================================
function escola() {
  const s = new Scene('escola');
  room(s, { b: [170, 60, 1110, 500], wall: '#EAF0E2', side: '#D4E0CC', floor: ['#C8A070', '#9A764E'], ceil: '#E0E6D8', base: '#7A9A6A' });
  s.add('sky', `<rect x="170" y="380" width="940" height="120" fill="#B8D4A8"/><path d="M170,380 H1110" stroke="#7A9A6A" stroke-width="6"/>`);
  // lousa verde com alfabeto
  s.add('far', `<rect x="330" y="130" width="560" height="230" rx="6" fill="#2E5A44" stroke="#9A6A40" stroke-width="12"/><rect x="330" y="350" width="560" height="14" fill="#8A5A33"/><rect x="380" y="352" width="30" height="8" rx="3" fill="#FFFFFF"/><rect x="420" y="353" width="24" height="7" rx="3" fill="#F2C94C"/>`);
  s.add('far', `<g font-family="Andika" font-weight="700" fill="#F4F0E4"><text x="370" y="210" font-size="54">pa</text><text x="470" y="210" font-size="54" fill="#F2C94C">to</text><text x="370" y="300" font-size="40" opacity=".85">o pato nada.</text></g><path d="M640,170 q30,40 0,80 q50,10 90,-20" stroke="#F4F0E4" stroke-width="4" fill="none" opacity=".6"/><g transform="translate(780,230)"><ellipse rx="40" ry="24" fill="none" stroke="#F4F0E4" stroke-width="4"/><circle cx="30" cy="-30" r="14" fill="none" stroke="#F4F0E4" stroke-width="4"/><path d="M42,-30 l16,4 l-16,4" fill="none" stroke="#F2C94C" stroke-width="4"/></g>`);
  s.hotspot('far', 410, 354, 34, 'giz');
  // varal do alfabeto (friso)
  { let g = '', x = 190; 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => { const v = 'AEIOU'.includes(c); g += `<rect x="${x}" y="80" width="32" height="38" rx="4" fill="#FFFBF2" stroke="#C9B49A" stroke-width="1.5"/><text x="${x + 16}" y="110" text-anchor="middle" font-family="Andika" font-weight="700" font-size="26" fill="${v ? '#C2410C' : '#1D4ED8'}">${c}</text>`; x += 35.5; }); s.add('far', g); }
  // mapa do Brasil (estilizado) e janela lateral
  s.add('far', `<g transform="translate(940,150)"><rect width="140" height="170" rx="4" fill="#FFFBF2" stroke="#9A6A40" stroke-width="6"/><path d="M52,24 L78,18 L96,30 L118,40 L128,58 L122,80 L108,100 L96,122 L82,140 L72,152 L68,138 L58,124 L48,118 L40,100 L26,94 L18,76 L14,60 L24,44 L38,40Z" fill="#8CC084" stroke="#5E8A4E" stroke-width="2"/><path d="M60,60 l20,10 M70,90 l14,-6" stroke="#4FA3C7" stroke-width="3"/><circle cx="84" cy="96" r="4" fill="#C2410C"/></g>`);
  s.hotspot('far', 1010, 236, 52, 'mapa');
  s.add('far', `<path d="M40,150 L150,120 L150,380 L40,420Z" fill="${s.lin([[0, '#9ED3F0'], [1, '#E6F4F2']])}"/><path d="M40,150 L150,120 L150,380 L40,420Z M95,135 L95,400 M40,285 L150,250" fill="none" stroke="#7A5A3A" stroke-width="8"/>` + canopy(90, 330, 50, 30, ['#3E7A3E', '#5A9A48', '#9CCB6A'], 9));
  // sino da escola na parede direita
  s.add('far', `<g transform="translate(1180,170)"><path d="M0,-30 V-10" stroke="#5A4030" stroke-width="4"/><path d="M-26,24 Q-24,-12 0,-12 Q24,-12 26,24Z" fill="#E8B030"/><rect x="-30" y="22" width="60" height="8" rx="3" fill="#C88A18"/><circle cx="0" cy="34" r="6" fill="#8A6020"/><path d="M-14,10 q4,-14 12,-16" stroke="#FFF0A0" stroke-width="3" fill="none"/></g>`);
  s.hotspot('far', 1180, 190, 40, 'sino');
  // carteiras em fileiras (mid / near)
  const desk = (x, y, k, seat = '#4FA3C7') => `<g transform="translate(${x},${y}) scale(${k})">${shadowE(0, 30, 90, .25)}<path d="M-56,-62 V-4 M56,-62 V-4" stroke="#5A6A7A" stroke-width="6"/><path d="M-70,-74 L70,-74 L76,-62 L-64,-62Z" fill="#E8C890"/><rect x="-64" y="-62" width="140" height="8" fill="#B88A50"/><path d="M-28,-14 V46 M28,-14 V46 M-20,-14 V36 M20,-14 V36" stroke="#5A6A7A" stroke-width="4"/><rect x="-34" y="-20" width="68" height="10" rx="3" fill="${mix(seat, '#000000', .15)}"/><rect x="-32" y="-12" width="64" height="30" rx="6" fill="${seat}"/><rect x="-26" y="-4" width="52" height="8" rx="3" fill="#FFFFFF" opacity=".25"/></g>`;
  s.add('mid', desk(400, 590, .8, '#E26D5A') + desk(640, 590, .8, '#F2B33D') + desk(880, 590, .8, '#6FB86A'));
  s.add('near', desk(300, 712, 1.2, '#4FA3C7') + desk(980, 712, 1.2, '#B56FD0'));
  s.add('near', `<g transform="translate(300,632)"><path d="M-60,0 Q-30,-12 0,-2 Q30,-12 60,0 L60,8 Q30,-4 0,6 Q-30,-4 -60,8Z" fill="#FFFBF2"/><text x="-46" y="4" font-family="Andika" font-weight="700" font-size="11" fill="#2B2A4C">a mesa</text></g>`);
  s.hotspot('near', 300, 640, 60, 'mesa');
  s.add('near', `<g transform="translate(960,624)"><rect x="-10" y="-34" width="22" height="36" rx="5" fill="#FFFBF2" stroke="#C9B49A" stroke-width="2"/><path d="M-6,-34 L-2,-46 L6,-46 L8,-34Z" fill="#F28C28"/><rect x="-10" y="-22" width="22" height="12" fill="#4FA3C7"/><path d="M30,0 l40,-14" stroke="#F2C94C" stroke-width="8" stroke-linecap="round"/><path d="M68,-13 l8,-3" stroke="#2B2A4C" stroke-width="8" stroke-linecap="round"/></g>`);
  s.hotspot('near', 960, 604, 38, 'cola');
  // mochila e planta
  s.add('near', `<g transform="translate(640,770)">${shadowE(0, 0, 50, .3)}<path d="M-40,0 V-70 Q-40,-100 0,-100 Q40,-100 40,-70 V0Z" fill="#1F7A70"/><rect x="-30" y="-50" width="60" height="40" rx="8" fill="#38A090"/><path d="M-20,-100 Q0,-124 20,-100" stroke="#C77B2C" stroke-width="6" fill="none"/><rect x="-8" y="-36" width="16" height="6" rx="2" fill="#F4B400"/></g>`);
  s.add('near', plant(120, 760, 1, 11) + plant(1180, 770, .9, 12));
  beam(s, [[40, 150], [150, 120], [700, 790], [300, 800]], .3);
  s.add('fg', particles(221, 40, 100, 700, 150, 700, '#FFF6D0', 1.4, .5));
  finish(s, { vignette: '#2A3A2A', vo: .3, warm: '#FFD890', warmO: .1 });
  return s;
}

// =============================================================================================
function oficina() {
  const s = new Scene('oficina');
  room(s, { b: [160, 60, 1120, 480], wall: '#EAD9BE', side: '#D6BC98', floor: ['#A08A72', '#6E5A48'], ceil: '#CDB494', planks: 8, base: '#6A5444' });
  { let g = ''; for (let y = 360; y < 480; y += 20) for (let x = 160 + ((y / 20) % 2) * 20; x < 1120; x += 40) g += `<rect x="${x + 1}" y="${y + 1}" width="38" height="18" rx="2" fill="${(x * 7 + y) % 3 ? '#C8805A' : '#B8704A'}"/>`; s.add('sky', `<g clip-path="${s.clip('<rect x="160" y="360" width="960" height="120"/>')}"><rect x="160" y="360" width="960" height="120" fill="#8A5038"/>${g}</g>`); }
  const sideBins = dir => { const x0 = dir < 0 ? 0 : W, xe = dir < 0 ? 150 : W - 150; let g = ''; [[.25, '#E2483D'], [.45, '#4FA3C7'], [.65, '#F2B33D']].forEach(([t, c], k) => { const ya = 120 + 520 * t, yb = 140 + 320 * t; g += `<path d="M${x0},${ya} L${xe},${yb} L${xe},${yb + 8} L${x0},${ya + 14}Z" fill="#7A5A3A"/>`; for (let i = 0; i < 3; i++) { const u0 = .08 + i * .3, u1 = u0 + .24, X = u => x0 + (xe - x0) * u, Y = u => ya + (yb - ya) * u, hh = u => 60 * (1 - u * .4); g += `<path d="M${f(X(u0))},${f(Y(u0))} L${f(X(u1))},${f(Y(u1))} L${f(X(u1))},${f(Y(u1) - hh(u1))} L${f(X(u0))},${f(Y(u0) - hh(u0))}Z" fill="${['#E2483D', '#4FA3C7', '#F2B33D', '#6FB86A'][(i + k) % 4]}"/>`; } }); return g; };
  s.add('far', sideBins(-1) + sideBins(1));
  // painel de ferramentas (pegboard)
  { let g = `<rect x="200" y="110" width="420" height="230" rx="6" fill="#C8A070"/>`; for (let y = 124; y < 330; y += 16) for (let x = 214; x < 610; x += 16) g += `<circle cx="${x}" cy="${y}" r="1.8" fill="#8A6A44"/>`;
    g += `<path d="M240,140 v90" stroke="#5A6A74" stroke-width="8"/><rect x="226" y="130" width="28" height="16" rx="3" fill="#E2483D"/>` + `<path d="M300,140 l0,70 M290,210 h20" stroke="#5A6A74" stroke-width="6"/><circle cx="300" cy="140" r="12" fill="none" stroke="#5A6A74" stroke-width="6"/>` + `<path d="M360,140 v80" stroke="#F2C94C" stroke-width="10"/><path d="M360,220 v30" stroke="#8A8A90" stroke-width="4"/>` + `<g transform="translate(450,190)"><circle r="40" fill="#8A9AA4"/><circle r="14" fill="#C8A070"/>${Array.from({ length: 10 }, (_, i) => `<rect x="-6" y="-50" width="12" height="14" fill="#8A9AA4" transform="rotate(${i * 36})"/>`).join('')}</g><g transform="translate(560,170)"><circle r="22" fill="#6A7A84"/><circle r="8" fill="#C8A070"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-4" y="-30" width="8" height="10" fill="#6A7A84" transform="rotate(${i * 45})"/>`).join('')}</g>` + `<path d="M240,290 h340" stroke="#5A6A74" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${260 + i * 56},290 v22" stroke="${['#E2483D', '#4FA3C7', '#F2C94C', '#6FB86A', '#B56FD0', '#F28C28'][i]}" stroke-width="7" stroke-linecap="round"/>`).join('')}`;
    s.add('far', g); }
  // janela industrial
  s.add('far', `<rect x="700" y="100" width="360" height="240" fill="${s.lin([[0, '#F6C88A'], [1, '#FCE6C0']])}"/>${[0, 1, 2].map(i => `<path d="M${700 + (i + 1) * 90},100 V340" stroke="#4A5A64" stroke-width="6"/>`).join('')}<path d="M700,220 H1060" stroke="#4A5A64" stroke-width="6"/><rect x="700" y="100" width="360" height="240" fill="none" stroke="#4A5A64" stroke-width="12"/><g opacity=".5">${[0, 1, 2, 3, 4].map(i => `<rect x="${720 + i * 66}" y="${280 - i * 14}" width="50" height="${60 + i * 14}" fill="#C88A6A"/>`).join('')}</g>`);
  // bancada (mid)
  s.add('mid', `<path d="M120,500 L1160,500 L1180,480 L140,480Z" fill="#B87A44"/><rect x="120" y="500" width="1040" height="24" fill="#8A5A33"/><path d="M160,524 V680 M1120,524 V680 M640,524 V680" stroke="#4A5A64" stroke-width="12"/><rect x="170" y="600" width="440" height="14" fill="#5A6A74"/>`);
  // robô na bancada (objeto, sem adornos)
  s.add('mid', `<g transform="translate(640,480)">${shadowE(0, 0, 70, .3)}<rect x="-46" y="-120" width="92" height="90" rx="18" fill="#4FA3C7"/><rect x="-36" y="-110" width="72" height="40" rx="10" fill="#1E3A4E"/><circle cx="-16" cy="-90" r="9" fill="#9FF0E8"/><circle cx="16" cy="-90" r="9" fill="#9FF0E8"/><path d="M-12,-76 q12,8 24,0" stroke="#9FF0E8" stroke-width="3" fill="none"/><path d="M0,-120 V-140" stroke="#5A6A74" stroke-width="4"/><circle cx="0" cy="-146" r="7" fill="#F2C94C"/><rect x="-40" y="-30" width="80" height="30" rx="8" fill="#3A86A8"/><rect x="-70" y="-60" width="22" height="12" rx="6" fill="#5A6A74"/><rect x="48" y="-60" width="22" height="12" rx="6" fill="#5A6A74"/><path d="M-30,-118 q30,-10 60,0" stroke="#8ACCE8" stroke-width="5" fill="none" opacity=".7"/></g>`);
  s.hotspot('mid', 640, 410, 66, 'robô');
  // mola, roda, lata, fio
  s.add('mid', `<g transform="translate(330,470)">${Array.from({ length: 7 }, (_, i) => `<ellipse cx="0" cy="${-i * 7}" rx="16" ry="5" fill="none" stroke="#B8C4CA" stroke-width="3"/>`).join('')}</g>`);
  s.hotspot('mid', 330, 450, 36, 'mola');
  s.add('mid', `<g transform="translate(460,456)"><circle r="26" fill="#2A2A30"/><circle r="15" fill="#8A9AA4"/><circle r="5" fill="#2A2A30"/>${Array.from({ length: 6 }, (_, i) => `<path d="M0,0 L${f(Math.cos(i * 1.047) * 14)},${f(Math.sin(i * 1.047) * 14)}" stroke="#2A2A30" stroke-width="2"/>`).join('')}</g>`);
  s.hotspot('mid', 460, 456, 38, 'roda');
  s.add('mid', `<g transform="translate(860,476)"><rect x="-22" y="-56" width="44" height="56" rx="4" fill="#C8D2D8"/><ellipse cx="0" cy="-56" rx="22" ry="6" fill="#E8EEF0"/><rect x="-22" y="-40" width="44" height="22" fill="#E2483D"/><path d="M-16,-50 V-4" stroke="#fff" stroke-width="4" opacity=".6"/>${[0, 1, 2].map(i => `<path d="M${-10 + i * 10},-56 l${-4 + i * 4},-16" stroke="#5A6A74" stroke-width="3"/>`).join('')}</g>`);
  s.hotspot('mid', 860, 446, 40, 'lata');
  s.add('mid', `<path d="M960,480 Q1000,440 1040,470 T1100,460" stroke="#E2483D" stroke-width="4" fill="none"/><path d="M960,484 Q1010,450 1050,476 T1110,470" stroke="#4FA3C7" stroke-width="4" fill="none"/><circle cx="1000" cy="470" r="16" fill="none" stroke="#F2C94C" stroke-width="5"/>`);
  s.hotspot('mid', 1030, 466, 40, 'fio');
  // luminária de bancada
  s.add('mid', `<path d="M1100,480 L1080,380 L1010,350" stroke="#4A5A64" stroke-width="6" fill="none"/><path d="M990,330 L1040,350 L1010,390Z" fill="#F2C94C"/><path d="M1000,380 L880,500 L1080,500Z" fill="#FFF0B0" opacity=".3" filter="${s.blur(12)}"/>`);
  // caixas e peças no chão (near)
  s.add('near', `<g transform="translate(180,760)">${shadowE(0, 0, 80, .3)}<rect x="-70" y="-90" width="140" height="90" fill="#C8A070"/><path d="M-70,-90 L-50,-110 L90,-110 L70,-90Z" fill="#D8B888"/><path d="M70,-90 L90,-110 L90,-20 L70,0Z" fill="#A8804E"/>${[[-40, -100], [-10, -104], [20, -100], [50, -104]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="10" fill="#8A9AA4"/><circle cx="${a}" cy="${b}" r="4" fill="#5A6A74"/>`).join('')}</g><g transform="translate(1100,770)">${shadowE(0, 0, 60, .3)}<rect x="-50" y="-60" width="100" height="60" rx="6" fill="#E2483D"/><rect x="-50" y="-60" width="100" height="16" rx="6" fill="#C2302A"/><path d="M-20,-60 Q0,-80 20,-60" stroke="#2A2A30" stroke-width="5" fill="none"/></g>`);
  s.add('near', `<g transform="translate(780,740)">${shadowE(0, 0, 40, .3)}<rect x="-30" y="-50" width="60" height="40" rx="10" fill="#F28C28"/><rect x="-22" y="-44" width="44" height="20" rx="6" fill="#3A2A20"/><circle cx="-10" cy="-34" r="5" fill="#9FF0E8"/><circle cx="10" cy="-34" r="5" fill="#9FF0E8"/><circle cx="-18" cy="-6" r="9" fill="#2A2A30"/><circle cx="18" cy="-6" r="9" fill="#2A2A30"/><path d="M0,-50 v-12" stroke="#5A4A3A" stroke-width="3"/><circle cx="0" cy="-64" r="4" fill="#E2483D"/></g><g transform="translate(470,770)">${shadowE(0, 0, 44, .3)}<ellipse cx="0" cy="-60" rx="40" ry="10" fill="#C8804A"/><path d="M-30,-56 L-36,0 M30,-56 L36,0 M0,-52 V0" stroke="#5A4A3A" stroke-width="6"/></g>`);
  s.add('fg', `<path d="M0,40 Q200,90 360,40 Q520,0 640,50" stroke="#3A3A3A" stroke-width="3" fill="none"/><path d="M640,50 Q800,100 960,40 Q1100,-10 1280,60" stroke="#E2483D" stroke-width="3" fill="none"/>`);
  beam(s, [[700, 100], [1060, 100], [1000, 800], [420, 800]], .3, '#FFE0B0');
  s.add('fg', lampHang(s, 400, 30, 140, '#4A5A64') + lampHang(s, 880, 30, 140, '#4A5A64') + particles(231, 50, 400, 1100, 150, 700, '#FFF0D0', 1.4, .5));
  finish(s, { vignette: '#1A2228', vo: .34, warm: '#FFB870', warmO: .12 });
  return s;
}

// =============================================================================================
function quarto() {
  const s = new Scene('quarto');
  room(s, { b: [180, 60, 1100, 500], wall: '#F6DCC8', side: '#E8C4A8', floor: ['#B87A44', '#8A5430'], ceil: '#E8C8A8' });
  // papel de parede com estrelinhas
  { let g = ''; const r = rng(5); for (let i = 0; i < 70; i++) { const x = 190 + r() * 900, y = 70 + r() * 420; g += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="#E8A898" opacity=".6"/>`; } s.add('sky', g); }
  // janela com noite e lua
  s.add('far', `<rect x="700" y="110" width="300" height="230" rx="8" fill="${s.lin([[0, '#1E2A5A'], [1, '#6A5A9A']])}"/>${particles(241, 30, 710, 990, 120, 300, '#FFFFFF', 1.2, .9)}<circle cx="900" cy="170" r="26" fill="#FFF4D8"/><circle cx="900" cy="170" r="50" fill="#FFF4D8" opacity=".15"/><path d="M700,320 Q760,290 820,310 Q900,280 1000,306 V340 H700Z" fill="#2A3A4A"/>${[[730, 318], [770, 312], [940, 300]].map(([x, y]) => `<rect x="${x}" y="${y - 14}" width="16" height="14" fill="#3A4A5A"/><rect x="${x + 5}" y="${y - 10}" width="5" height="5" fill="#FFD27A"/>`).join('')}<rect x="700" y="110" width="300" height="230" rx="8" fill="none" stroke="#8A5A33" stroke-width="14"/><path d="M850,110 V340 M700,225 H1000" stroke="#8A5A33" stroke-width="8"/><rect x="684" y="336" width="332" height="16" rx="5" fill="#9C6A3E"/>`);
  s.hotspot('far', 900, 170, 40, 'lua');
  // cortinas
  s.add('far', `<path d="M660,90 H730 Q720,220 740,330 Q712,350 700,380 H660Z" fill="#F2B33D"/><path d="M970,90 H1040 V380 H1000 Q988,350 960,330 Q980,220 970,90Z" fill="#F2B33D"/><rect x="650" y="84" width="400" height="10" rx="5" fill="#7A4B2E"/>${[680, 700, 990, 1010].map(x => `<path d="M${x},96 V370" stroke="#E09A20" stroke-width="3" opacity=".6"/>`).join('')}`);
  // pipa na parede e desenhos
  s.add('far', `<g transform="translate(330,190) rotate(-10)"><path d="M0,-50 L36,0 L0,56 L-36,0Z" fill="#E2483D"/><path d="M0,-50 L36,0 L0,0Z M0,0 L-36,0 L0,56Z" fill="#F2B33D"/><path d="M0,-50 V56 M-36,0 H36" stroke="#7A4A2A" stroke-width="2"/><path d="M0,56 q14,30 -6,54 q-16,22 6,46" stroke="#7A4A2A" stroke-width="2" fill="none"/></g>`);
  s.hotspot('far', 330, 190, 56, 'pipa');
  s.add('far', `<g transform="translate(470,140)"><rect width="100" height="80" fill="#FFFBF2" stroke="#9C6A3E" stroke-width="6"/><circle cx="24" cy="22" r="10" fill="#F4B400"/><path d="M10,70 q40,-30 80,0" stroke="#2F7D4F" stroke-width="5" fill="none"/></g><g transform="translate(500,250)"><rect width="70" height="90" fill="#DCEBF5" stroke="#9C6A3E" stroke-width="6"/><path d="M14,70 l20,-30 l20,30z" fill="#E26D5A"/></g>`);
  // estante de brinquedos
  s.add('far', `<rect x="200" y="320" width="220" height="180" fill="#9C6A3E"/><rect x="212" y="332" width="196" height="156" fill="#7A4B2E"/><rect x="206" y="406" width="208" height="8" fill="#B98252"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${220 + i * 14}" y="${350}" width="12" height="54" fill="${BOOKC[i]}"/>`).join('')}<g transform="translate(360,400)"><path d="M-14,0 L-10,-26 L10,-26 L14,0Z" fill="#4FA3C7"/><circle cx="0" cy="-34" r="10" fill="#4FA3C7"/><circle cx="-4" cy="-36" r="2" fill="#fff"/><circle cx="4" cy="-36" r="2" fill="#fff"/></g><g transform="translate(260,480)"><rect x="-26" y="-34" width="52" height="34" fill="#F2B33D"/><rect x="-20" y="-28" width="16" height="16" fill="#E2483D"/><rect x="2" y="-28" width="18" height="16" fill="#4FA3C7"/></g>`);
  // cama com colcha de chita (mid)
  const chita = s.id('chita');
  s.def(`<pattern id="${chita}" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#D9483B"/><g transform="translate(11,11)">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-5" rx="3.6" ry="5" fill="#FFF3D6" transform="rotate(${a})"/>`).join('')}<circle r="2.6" fill="#F4B400"/></g><g transform="translate(33,33)">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-4" rx="3" ry="4.2" fill="#F4B400" transform="rotate(${a})"/>`).join('')}<circle r="2" fill="#2F7D4F"/></g><path d="M26,8 q6,2 8,8 M6,32 q4,-6 10,-6" stroke="#2F7D4F" stroke-width="2" fill="none"/></pattern>`);
  s.add('mid', `<g>${shadowE(860, 650, 300, .3)}<rect x="560" y="400" width="40" height="250" rx="8" fill="#8A5A33"/><path d="M560,400 Q580,380 600,400" fill="#8A5A33"/><path d="M580,500 L1160,500 L1180,640 L600,640Z" fill="#9C6A3E"/><path d="M600,470 L1150,470 Q1180,470 1180,500 L1180,600 L600,600Z" fill="url(#${chita})"/><path d="M600,470 L1150,470 Q1180,470 1180,500 L1180,520 L600,520Z" fill="#FFF" opacity=".1"/><path d="M600,600 L1180,600 L1180,620 L600,620Z" fill="#B0302A"/><ellipse cx="680" cy="462" rx="80" ry="30" fill="#FFFBF2"/><ellipse cx="672" cy="452" rx="60" ry="14" fill="#FFF" opacity=".7"/></g>`);
  s.hotspot('mid', 900, 540, 60, 'cama');
  // sapo de pelúcia sobre a cama
  s.add('mid', `<g transform="translate(780,470) scale(1.4)">${L.sapo(0, 0, 1)}</g>`);
  s.hotspot('mid', 780, 440, 38, 'sapo');
  // tapete, bola, rede
  s.add('near', rug(420, 690, 260, 60, '#E9C46A', '#C2410C', '#1F7A70'));
  s.add('near', `${shadowE(470, 712, 30, .3)}<circle cx="470" cy="690" r="26" fill="#F4F0E6"/><path d="M444,690 A26,26 0 0 0 496,690Z" fill="#1D4ED8"/><path d="M465,664 Q482,690 465,716" stroke="#F2B33D" stroke-width="6" fill="none"/><circle cx="460" cy="680" r="6" fill="#fff" opacity=".7"/>`);
  s.hotspot('near', 470, 690, 40, 'bola');
  s.add('near', `<g transform="translate(220,740)">${shadowE(0, 0, 40, .3)}<rect x="-30" y="-60" width="60" height="60" rx="4" fill="#C98D58"/><path d="M-36,-60 h72 v-10 h-72z" fill="#9C6A3E"/><path d="M-20,-70 Q0,-140 20,-70" stroke="#FFF2C4" stroke-width="2" fill="#FFE8A0" opacity=".5"/><rect x="-6" y="-100" width="12" height="30" fill="#E8B030"/><ellipse cx="0" cy="-110" rx="26" ry="16" fill="#F2C94C"/><circle cx="0" cy="-100" r="70" fill="#FFE6A0" opacity=".2" filter="${s.blur(14)}"/></g>`);
  s.add('near', L.gato(1150, 690, .9, true, '#8A8A8A'));
  beam(s, [[700, 120], [1000, 120], [900, 780], [500, 780]], .18, '#C8D0FF');
  s.add('fg', particles(251, 30, 500, 1100, 120, 600, '#FFF6D0', 1.2, .4));
  finish(s, { vignette: '#3A1E1E', vo: .35, warm: '#FFB080', warmO: .12 });
  return s;
}

module.exports = { 'int-biblioteca': biblioteca, 'int-padaria': padaria, 'int-escola-sala': escola, 'int-oficina-robos': oficina, 'int-casa-sofia-quarto': quarto };
