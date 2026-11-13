// VERSÃO ACADEMIA (Decisão 006): Sofia de UNIFORME ESCOLAR e SEM joias/adornos (sem brincos, fivela, pulseira, miçangas, mochila).
// SOFIA — personagem-guia do FONEMA (~9–10 anos, parda, cabelo cacheado 3C/4A, fivela de flor de ipê, mochila de exploradora)
// Coordenadas: x centrado em 0, pés em y≈1000. Cabeça ~ 1/3 da altura (proporção de animação infantil).
const { P, U, limb, ik, uid, f, rng } = require('./core');
const { mouthExpr } = require('./mouth');

// ---------- olhos e sobrancelhas ----------
function eye(x, y, type = 'open', look = [0, 0], side = 1, sx = 1) {
  const [lx, ly] = look;
  const lash = `<path d="M${x + side * 21},${y - 7} q${side * 7},-2 ${side * 11},-10 M${x + side * 22},${y - 1} q${side * 8},0 ${side * 12},-5" fill="none" stroke="${P.line}" stroke-width="3.6" stroke-linecap="round"/>`;
  let g = '';
  if (type === 'open' || type === 'wide' || type === 'half' || type === 'soft') {
    const rx = type === 'wide' ? 24 : 22.5, ry = type === 'wide' ? 31 : 28;
    const id = uid('ey');
    const ir = type === 'wide' ? [14, 17] : [17.5, 21.5];
    let inner = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${P.eyeW}"/>
      <ellipse cx="${x + lx}" cy="${y + 3 + ly}" rx="${ir[0]}" ry="${ir[1]}" fill="url(#gIris)"/>
      <ellipse cx="${x + lx}" cy="${y + 4 + ly}" rx="${ir[0] * 0.52}" ry="${ir[1] * 0.52}" fill="#1C0E07"/>
      <path d="M${x - rx},${y - ry + 4} Q${x},${y - ry - 6} ${x + rx},${y - ry + 4} L${x + rx},${y - ry + 14} Q${x},${y - ry + 4} ${x - rx},${y - ry + 14}Z" fill="#7A5A48" opacity=".22"/>`;
    let lidY = null;
    if (type === 'half') lidY = y - 4;
    if (type === 'soft') lidY = y - 13;
    if (lidY !== null) inner += `<path d="M${x - rx - 3},${y - ry - 4} H${x + rx + 3} V${lidY} Q${x},${lidY - (type === 'soft' ? 3 : 6)} ${x - rx - 3},${lidY}Z" fill="${P.skin}"/>`;
    inner += `<circle cx="${x + lx + 5}" cy="${y - 6 + ly + (lidY !== null && type === 'half' ? 9 : 0)}" r="5.2" fill="#fff"/><circle cx="${x + lx - 5}" cy="${y + 11 + ly}" r="2.3" fill="#fff" opacity=".9"/>`;
    g += `<g transform="translate(${x},0) scale(${sx},1) translate(${-x},0)"><defs><clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath></defs>
      <g clip-path="url(#${id})">${inner}</g>
      <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${P.line}" stroke-width="2.2" opacity=".75"/>`;
    if (lidY !== null) g += `<path d="M${x - rx - 1},${lidY + 1} Q${x},${lidY - (type === 'soft' ? 3 : 6)} ${x + rx + 1},${lidY + 1}" fill="none" stroke="${P.line}" stroke-width="5" stroke-linecap="round"/>`;
    else g += `<path d="M${x - rx - 1},${y - 6} C${x - rx + 2},${y - ry - 4} ${x + rx - 2},${y - ry - 4} ${x + rx + 1},${y - 6}" fill="none" stroke="${P.line}" stroke-width="5.2" stroke-linecap="round"/>`;
    g += lash.replace(/<path/, `<path transform="translate(0,${lidY !== null ? lidY - y + 6 : 0})"`) + '</g>';
  } else if (type === 'happy') {
    g += `<path d="M${x - 19},${y + 6} Q${x},${y - 18} ${x + 19},${y + 6}" fill="none" stroke="${P.line}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M${x + side * 18},${y + 2} q${side * 7},-3 ${side * 10},-10" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/>`;
  } else if (type === 'closed') {
    g += `<path d="M${x - 19},${y - 1} Q${x},${y + 12} ${x + 19},${y - 1}" fill="none" stroke="${P.line}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x + side * 17},${y + 3} q${side * 6},3 ${side * 10},1 M${x + side * 8},${y + 8} q${side * 3},4 ${side * 6},5" fill="none" stroke="${P.line}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return g;
}
function brow(x, y, dy, tilt, side, arch = 8) {
  const r = side < 0 ? -tilt : tilt;
  return `<path transform="rotate(${r} ${x} ${y + dy})" d="M${x - 20},${y + dy + 4} Q${x},${y + dy - arch} ${x + 20},${y + dy + 4}" fill="none" stroke="${P.hair}" stroke-width="7.5" stroke-linecap="round"/>`;
}

// ---------- expressões ----------
const EXPR = {
  neutra:      { eyes: 'open', mouth: 'smile', b: [0, 0, 0, 0] },
  alegre:      { eyes: 'open', mouth: 'bigSmile', b: [-4, -2, -4, -2], blush: 1 },
  orgulhosa:   { eyes: 'happy', mouth: 'proud', b: [-6, -4, -8, 6], blush: 1, tilt: 6 },
  curiosa:     { eyes: 'wide', mouth: 'oSmall', b: [-12, 4, -2, -4], look: [4, -2], tilt: -7 },
  pensativa:   { eyes: 'half', mouth: 'hmm', b: [-14, -6, 2, 8], look: [7, -9], tilt: 5, hand: 'chin' },
  surpresa:    { eyes: 'wide', mouth: 'o', b: [-16, 0, -16, 0], blush: .6 },
  encorajadora:{ eyes: 'soft', mouth: 'smile', b: [-6, 8, -6, 8], tilt: -6, blush: .8 },
  calma:       { eyes: 'closed', mouth: 'breath', b: [-2, 4, -2, 4], breath: 1 },
  empatica:    { eyes: 'soft', mouth: 'kind', b: [-8, 14, -8, 14], look: [0, 2], tilt: 8 },
  rindo:       { eyes: 'happy', mouth: 'laugh', b: [-10, -2, -10, -2], blush: 1.2, tilt: -5 },
  concentrada: { eyes: 'half', mouth: 'focus', b: [2, -10, 2, -10], look: [0, 6] },
  escutando:   { eyes: 'open', mouth: 'listen', b: [-6, 6, -2, -2], look: [-8, 0], tilt: -9 },
  comemorando: { eyes: 'happy', mouth: 'cheer', b: [-14, -4, -14, -4], blush: 1.3 },
  falando:     { eyes: 'open', mouth: 'talk', b: [-4, 0, -4, 0], blush: .7 },
};

// ---------- cabelo ----------
function hairBack(cx = 0, cy = 222, rx = 150, ry = 124, seed = 7, sideOnly = false) {
  const r = rng(seed);
  let c = `<circle cx="${cx}" cy="${cy}" r="${ry + 18}"/>`;
  const N = 20;
  for (let k = 0; k < N; k++) {
    const t = k / N * Math.PI * 2;
    const rr = 50 + r() * 22;
    c += `<circle cx="${f(cx + Math.cos(t) * rx)}" cy="${f(cy + Math.sin(t) * ry)}" r="${f(rr)}"/>`;
  }
  for (let k = 0; k < 14; k++) {
    const t = r() * Math.PI * 2;
    c += `<circle cx="${f(cx + Math.cos(t) * (rx + 32))}" cy="${f(cy + Math.sin(t) * (ry + 30))}" r="${f(18 + r() * 12)}"/>`;
  }
  let curls = '';
  for (let k = 0; k < 46; k++) {
    const t = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = cx + Math.cos(t) * (rx + 40) * d, y = cy + Math.sin(t) * (ry + 40) * d;
    const s = 9 + r() * 8, rot = r() * 360;
    const hi = (x - cx) < 20 && (y - cy) < 20 ? 1 : 0.55;
    curls += `<path transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})" d="M${-s},0 A${s},${s} 0 0 1 ${f(s * 0.7)},${f(-s * 0.7)}" fill="none" stroke="${P.hairHi}" stroke-width="3.2" stroke-linecap="round" opacity="${hi * 0.8}"/>`;
  }
  for (let k = 0; k < 26; k++) {
    const t = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = cx + Math.cos(t) * (rx + 30) * d, y = cy + Math.sin(t) * (ry + 30) * d;
    const s = 8 + r() * 7, rot = r() * 360;
    curls += `<path transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})" d="M${-s},0 A${s},${s} 0 0 0 ${f(s * 0.7)},${f(s * 0.7)}" fill="none" stroke="#1A0E08" stroke-width="2.8" stroke-linecap="round" opacity=".5"/>`;
  }
  const id = uid('hb');
  return `<g>${U(c, 'url(#gHair)', 4)}<defs><clipPath id="${id}">${c}</clipPath></defs><g clip-path="url(#${id})">${curls}
   <path d="M${cx - rx * 0.85},${cy - ry * 0.25} Q${cx - rx * 0.5},${cy - ry - 30} ${cx + rx * 0.15},${cy - ry - 14}" fill="none" stroke="${P.hairHi}" stroke-width="22" stroke-linecap="round" opacity=".35" filter="url(#soft)"/></g></g>`;
}
function fringe(shift = 0, seed = 3) {
  const r = rng(seed);
  let c = '';
  const pts = [[-104, 196, 26], [-92, 166, 30], [-62, 148, 32], [-26, 140, 33], [12, 138, 33], [48, 144, 32], [80, 158, 30], [102, 184, 26], [-118, 222, 18], [116, 214, 18]];
  for (const [x, y, rr] of pts) c += `<circle cx="${x + shift}" cy="${y}" r="${rr}"/>`;
  let curls = '';
  for (const [x, y, rr] of pts) {
    const s = rr * 0.45;
    curls += `<path transform="translate(${x + shift + (r() - .5) * 8},${y - 2}) rotate(${f(r() * 360)})" d="M${-s},0 A${s},${s} 0 0 1 ${f(s * 0.8)},${f(-s * 0.5)}" fill="none" stroke="${P.hairHi}" stroke-width="3" stroke-linecap="round" opacity=".75"/>`;
  }
  const id = uid('fr');
  return `${U(c, 'url(#gHair)', 3.6)}<defs><clipPath id="${id}">${c}</clipPath></defs><g clip-path="url(#${id})">${curls}<ellipse cx="${-40 + shift}" cy="128" rx="60" ry="16" fill="${P.hairHi}" opacity=".45" filter="url(#soft2)"/></g>`;
}
// fivela de flor de ipê amarelo (3 flores em cacho + presilha)
function ipeClip(x, y, s = 1, rot = 0) {
  const flower = (fx, fy, fs, fr) => {
    let pet = '';
    for (let i = 0; i < 5; i++) pet += `<ellipse cx="0" cy="-13" rx="10" ry="13" transform="rotate(${i * 72})"/>`;
    return `<g transform="translate(${fx},${fy}) scale(${fs}) rotate(${fr})">${U(pet, 'url(#gIpe)', 2.6)}
      ${[0, 1, 2, 3, 4].map(i => `<path transform="rotate(${i * 72})" d="M0,-6 Q2,-14 0,-20" stroke="${P.ipeSh}" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}
      <circle r="6" fill="${P.ipeIn}" stroke="${P.line}" stroke-width="2.4"/><circle cx="-1.5" cy="-1.5" r="2" fill="#E9873A"/></g>`;
  };
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${rot})">
    <rect x="-30" y="10" width="60" height="12" rx="6" fill="${P.strap}" stroke="${P.line}" stroke-width="3"/>
    <path d="M-14,14 l6,4 M2,14 l6,4" stroke="${P.strapSh}" stroke-width="2"/>
    ${flower(-22, -2, .8, 15)}${flower(20, 0, .78, -20)}${flower(0, -14, 1, 0)}</g>`;
}

// ---------- mãos (local: dedos apontando para +y) ----------
function hand(type = 'open', skin = P.skin) {
  let s = '';
  if (type === 'open' || type === 'wave') {
    const sp = type === 'wave' ? 1.6 : 1;
    s = `<rect x="-16" y="-12" width="32" height="30" rx="13"/>` +
      [[-12, 12, -9 * sp], [-4, 14, -3 * sp], [4, 14, 3 * sp], [12, 12, 9 * sp]].map(([x, l, a]) => `<rect x="${x - 4.2}" y="6" width="8.4" height="${l + 10}" rx="4.2" transform="rotate(${a} ${x} 8)"/>`).join('') +
      `<rect x="10" y="-8" width="9" height="22" rx="4.5" transform="rotate(-42 14 -6)"/>`;
    return U(s, skin, 3) + `<path d="M-6,14 v8 M2,15 v8 M9,14 v7" stroke="${P.skinSh}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
  }
  if (type === 'relax') {
    s = `<rect x="-16" y="-12" width="32" height="40" rx="15"/><rect x="9" y="-8" width="10" height="24" rx="5" transform="rotate(-18 14 -6)"/>`;
    return U(s, skin, 3) + `<path d="M-7,18 v8 M1,19 v8 M9,18 v6" stroke="${P.skinSh}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  }
  if (type === 'point') {
    s = `<rect x="-16" y="-12" width="32" height="30" rx="14"/><rect x="-14" y="6" width="9" height="32" rx="4.5"/><rect x="5" y="-6" width="9" height="20" rx="4.5" transform="rotate(30 9 -4)"/>`;
    return U(s, skin, 3) + `<path d="M-2,14 q6,3 12,0" stroke="${P.skinSh}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  if (type === 'fist') {
    s = `<rect x="-16" y="-12" width="32" height="32" rx="15"/><rect x="8" y="-8" width="9" height="18" rx="4.5" transform="rotate(25 12 -6)"/>`;
    return U(s, skin, 3) + `<path d="M-10,14 q3,4 6,0 q3,4 6,0 q3,4 6,0" stroke="${P.skinSh}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  if (type === 'thumb') {
    s = `<rect x="-16" y="-12" width="32" height="32" rx="15"/><rect x="-4.5" y="-34" width="10" height="28" rx="5"/>`;
    return U(s, skin, 3) + `<path d="M-10,14 q3,4 6,0 q3,4 6,0 q3,4 6,0" stroke="${P.skinSh}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  return '';
}

// braço completo com manga
function arm(sh, target, side, o = {}) {
  const L1 = 112, L2 = 104;
  const bend = (o.bend ?? 'out') === 'out' ? (side < 0 ? 1 : -1) : (side < 0 ? -1 : 1);
  const { e, h, ang } = ik(sh, target, L1, L2, bend);
  const skin = o.skin || P.skin;
  let g = limb([sh, e, h], 28, skin);
  // sombra suave no antebraço
  g += `<path d="M${f(e[0])},${f(e[1])} L${f(h[0])},${f(h[1])}" stroke="${P.skinSh}" stroke-width="8" stroke-linecap="round" opacity=".18" transform="translate(${side * 6},0)"/>`;
  // manga curta
  const dx = e[0] - sh[0], dy = e[1] - sh[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
  const m = [sh[0] + ux * d * 0.5, sh[1] + uy * d * 0.5];
  const s0 = [sh[0] - ux * 10, sh[1] - uy * 10];
  const sl = `M${f(s0[0] + nx * 30)},${f(s0[1] + ny * 30)} L${f(m[0] + nx * 26)},${f(m[1] + ny * 26)} Q${f(m[0] + ux * 5)},${f(m[1] + uy * 5)} ${f(m[0] - nx * 26)},${f(m[1] - ny * 26)} L${f(s0[0] - nx * 30)},${f(s0[1] - ny * 30)} Q${f(s0[0] - ux * 22)},${f(s0[1] - uy * 22)} ${f(s0[0] + nx * 30)},${f(s0[1] + ny * 30)}Z`;
  if (o.sleeve !== false) g += `<path d="${sl}" fill="${o.sleeveColor || 'url(#gShirt)'}" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M${f(m[0] + nx * 24 - ux * 7)},${f(m[1] + ny * 24 - uy * 7)} L${f(m[0] - nx * 24 - ux * 7)},${f(m[1] - ny * 24 - uy * 7)}" stroke="${o.hemColor || P.trim}" stroke-width="7" opacity="1"/>`;
  // pulseira de miçangas (pulso esquerdo da Sofia = lado da tela à direita)
  if (o.bracelet) {
    const w = [h[0] - (h[0] - e[0]) * 0.16, h[1] - (h[1] - e[1]) * 0.16];
    const cols = [P.ipe, P.vowel, P.pack, P.cons, P.ipe, P.ok];
    g += cols.map((c, i) => { const t = (i - 2.5) * 5.2; return `<circle cx="${f(w[0] + nx * t)}" cy="${f(w[1] + ny * t)}" r="3.6" fill="${c}" stroke="${P.line}" stroke-width="1.4"/>`; }).join('');
  }
  const flip = o.flip ?? (side > 0 ? -1 : 1);
  g += `<g transform="translate(${f(h[0])},${f(h[1])}) rotate(${f((o.hrot ?? ang) - 90)}) scale(${flip},1)">${hand(o.hand || 'open', skin)}</g>`;
  return g;
}

// ---------- cabeça ----------
const FACE = 'M0,140 C80,140 127,188 127,260 C127,336 80,390 0,390 C-80,390 -127,336 -127,260 C-127,188 -80,140 0,140Z';
function sofiaHead(e = EXPR.neutra, o = {}) {
  const turn = o.turn || 0;                 // 0 frente, 1 = três-quartos
  const sh = 26 * turn;                     // deslocamento dos traços
  const [b1, t1, b2, t2] = e.b || [0, 0, 0, 0];
  const look = e.look || [0, 0];
  const id = uid('fc');
  let g = '';
  if (o.noHairBack !== true) g += hairBack(-10 * turn, 222, 150, 124, 7);
  // orelhas
  if (turn < 0.5) g += earF(127, 1);
  g += earF(-127 + sh * 0.4, -1);
  // rosto
  g += `<path d="${FACE}" fill="url(#gFace)" stroke="${P.line}" stroke-width="4"/>`;
  g += `<defs><clipPath id="${id}"><path d="${FACE}"/></clipPath></defs><g clip-path="url(#${id})">
    <ellipse cx="${10 * turn}" cy="160" rx="140" ry="40" fill="${P.skinSh}" opacity=".35" filter="url(#soft)"/>
    ${turn ? `<path d="M-130,180 Q-70,260 -110,400 L-140,400Z" fill="${P.skinSh}" opacity=".35" filter="url(#soft)"/>` : `<path d="M127,200 Q96,300 50,392 L140,392Z" fill="${P.skinSh}" opacity=".28" filter="url(#soft)"/>`}
  </g>`;
  // bochechas
  const bl = e.blush ?? 0.7;
  g += `<ellipse cx="${-80 + sh * 0.7}" cy="${314}" rx="${24 - turn * 5}" ry="13" fill="${P.blush}" opacity="${0.32 * bl}" filter="url(#soft2)"/><ellipse cx="${80 + sh}" cy="314" rx="24" ry="13" fill="${P.blush}" opacity="${0.32 * bl}" filter="url(#soft2)"/>`;
  // sardinhas discretas
  g += [[-74, 298], [-64, 304], [-80, 308], [70, 298], [62, 304], [78, 308]].map(([x, y]) => `<circle cx="${x + sh * (x < 0 ? 0.7 : 1)}" cy="${y}" r="1.7" fill="${P.skinSh}" opacity=".55"/>`).join('');
  // olhos
  g += eye(-46 + sh * 0.85, 262, e.eyes, look, -1, 1 - turn * 0.2);
  g += eye(46 + sh, 262, e.eyes, look, 1, 1);
  g += brow(-46 + sh * 0.85, 212, b1, t1, -1) + brow(46 + sh, 212, b2, t2, 1);
  // nariz
  g += `<path d="M${-7 + sh * 1.1},${300} Q${sh * 1.1},${308} ${8 + sh * 1.1},${299}" fill="none" stroke="${P.skinSh}" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="${-2 + sh * 1.1}" cy="291" rx="6" ry="4" fill="${P.skinHi}" opacity=".8"/>`;
  if (turn) g += `<path d="M${sh + 2},250 Q${sh + 18},280 ${sh + 10},302" fill="none" stroke="${P.skinSh}" stroke-width="2.4" opacity=".22" stroke-linecap="round"/>`;
  // boca
  g += `<g transform="translate(${sh * 1.05},338) scale(${1 - turn * 0.12},1)">${mouthExpr(e.mouth)}</g>`;
  if (e.breath) g += `<path d="M${sh + 26},350 q12,-4 20,4 M${sh + 30},362 q14,0 22,8" fill="none" stroke="#9FC6E8" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>`;
  // franja e fivela
  g += fringe(sh * 0.5);
  if (o.clip === true) g += ipeClip(112 + sh * 0.4, 150, 1, 18);
  return `<g>${g}</g>`;
}
function earF(x, side) {
  return `<ellipse cx="${x}" cy="276" rx="17" ry="23" fill="${P.skin}" stroke="${P.line}" stroke-width="3.6"/><path d="M${x + side * 2},266 q${side * 8},6 ${side * 2},18" fill="none" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/>`;
}

// ---------- corpo (frente / três-quartos) ----------
function legs(type = 'stand', turn = 0) {
  let g = '';
  const L = type === 'jump' ? [[-44, 700], [-78, 790], [-58, 870]] : type === 'walk' ? [[-44, 700], [-56, 812], [-62, 922]] : [[-44, 700], [-46, 812], [-48, 922]];
  const R = type === 'jump' ? [[44, 700], [80, 790], [60, 870]] : type === 'walk' ? [[44, 700], [52, 812], [58, 912]] : [[44, 700], [46, 812], [48, 922]];
  for (const [leg, side] of [[L, -1], [R, 1]]) {
    g += limb(leg, 42, P.skin);
    g += `<path d="M${leg[1][0] + side * 8},${leg[1][1] - 60} L${leg[2][0] + side * 8},${leg[2][1] - 20}" stroke="${P.skinSh}" stroke-width="9" opacity=".22" stroke-linecap="round"/>`;
    const ft = leg[2];
    // meia
    g += limb([[ft[0], ft[1] - 26], [ft[0], ft[1] - 4]], 44, P.sock);
    g += `<path d="M${ft[0] - 18},${ft[1] - 20} h36" stroke="${P.lace}" stroke-width="3" opacity=".8"/>`;
    // tênis
    const cx = ft[0] + side * 4 + turn * 6, cy = ft[1] + 24;
    g += `<g transform="translate(${cx},${cy})">
      <path d="M-40,22 Q-46,-12 -18,-20 L18,-20 Q46,-12 40,22Z" fill="${P.shoe}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M-30,-4 Q0,-12 30,-4" fill="none" stroke="${P.shoeSh}" stroke-width="3"/>
      <path d="M-12,-16 l24,8 M12,-16 l-24,8 M-12,-6 l24,6 M12,-6 l-24,6" stroke="${P.lace}" stroke-width="3" stroke-linecap="round"/>
      <rect x="-44" y="14" width="88" height="14" rx="7" fill="${P.sole}" stroke="${P.line}" stroke-width="3.4"/>
      <ellipse cx="${-side * 22}" cy="2" rx="9" ry="6" fill="#fff" opacity=".8"/></g>`;
  }
  return g;
}
function torsoFront(o) {
  // UNIFORME ESCOLAR: camiseta branca com gola e punhos azul-marinho, brasão bordado da escola, bermuda azul-marinho.
  const turn = o.turn || 0;
  const id = uid('ts');
  const T = `M-58,390 C-82,392 -104,402 -112,426 L-106,508 C-106,560 -102,598 -98,630 L98,630 C102,598 106,560 106,508 L112,426 C104,402 82,392 58,390 Z`;
  const SH = `M-98,604 L98,604 L108,716 L14,722 L2,676 L-10,722 L-108,716 Z`;
  let g = '';
  g += `<path d="${SH}" fill="url(#gShorts)" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M-104,706 L-12,712 M12,712 L104,706" stroke="${P.shortsHi}" stroke-width="6" opacity=".55"/>
    <path d="M-100,640 L-104,700 M100,640 L104,700" stroke="#FFFFFF" stroke-width="5" opacity=".9"/>
    <path d="M${2 + turn * 10},616 L${2 + turn * 10},670" stroke="${P.shortsSh}" stroke-width="2.6"/>`;
  g += `<rect x="-24" y="356" width="48" height="56" fill="url(#gSkinV)" stroke="${P.line}" stroke-width="3.6"/><path d="M-24,368 Q0,392 24,368 V384 Q0,404 -24,384Z" fill="${P.skinSh}" opacity=".45"/>`;
  g += `<path d="${T}" fill="url(#gShirt)" stroke="${P.line}" stroke-width="3.8" stroke-linejoin="round"/>`;
  g += `<defs><clipPath id="${id}"><path d="${T}"/></clipPath></defs><g clip-path="url(#${id})">
      <path d="M60,390 Q84,520 74,650 L130,650 L130,390Z" fill="${P.shirtSh}" opacity=".55" filter="url(#soft)"/>
      <path d="M-30,470 q8,60 -4,140 M34,480 q-6,60 6,130" stroke="${P.shirtSh}" stroke-width="5" fill="none" opacity=".5"/>
      <path d="M-120,618 H120" stroke="${P.shirtSh}" stroke-width="16" opacity=".55"/>
      <path d="M-130,602 H130" stroke="${P.trim}" stroke-width="7" opacity=".9"/>
    </g>`;
  // gola careca canelada azul-marinho
  g += `<path d="M-44,390 Q0,440 44,390" fill="none" stroke="${P.line}" stroke-width="17" stroke-linecap="round"/><path d="M-44,390 Q0,440 44,390" fill="none" stroke="${P.trim}" stroke-width="11" stroke-linecap="round"/><path d="M-40,396 Q0,432 40,396" fill="none" stroke="${P.trimHi}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  // brasão bordado da escola (peito esquerdo da Sofia = lado direito da tela)
  const bx = 52 + turn * 16, by = 470;
  g += `<g transform="translate(${bx},${by})"><path d="M-22,-24 H22 V4 Q22,22 0,30 Q-22,22 -22,4Z" fill="${P.trim}" stroke="${P.line}" stroke-width="2.6"/>
    <path d="M-14,-6 Q-7,-11 0,-6 Q7,-11 14,-6 V12 Q7,7 0,12 Q-7,7 -14,12Z" fill="#FFFFFF"/><path d="M0,-6 V12" stroke="${P.trim}" stroke-width="2"/>
    <path d="M-16,-17 H16" stroke="${P.ipe}" stroke-width="3" stroke-linecap="round"/></g>`;
  return g;
}

/** Sofia de corpo inteiro (frente ou três-quartos).
 * o = { expr, turn, armL:{t,hand,bend,hrot,flip}, armR:{...}, legs, letter, headTilt, behind (svg extra atrás) } */
function sofia(o = {}) {
  const e = typeof o.expr === 'string' ? EXPR[o.expr] : (o.expr || EXPR.neutra);
  const turn = o.turn || 0;
  const tilt = o.headTilt ?? e.tilt ?? 0;
  const armL = { t: [-132, 640], hand: 'relax', ...(o.armL || {}) };
  const armR = { t: [132, 640], hand: 'relax', ...(o.armR || {}) };
  const shL = [-98 + turn * 8, 430], shR = [98 + turn * 2, 430];
  let g = '';
  g += `<g transform="rotate(${tilt} 0 380)">${hairBack(-10 * turn, 222, 150, 124, 7)}</g>`;
  if (armL.back) g += arm(shL, armL.t, -1, armL);
  if (armR.back) g += arm(shR, armR.t, 1, armR);
  g += legs(o.legs || 'stand', turn);
  g += torsoFront({ turn, letter: o.letter });
  g += `<g transform="rotate(${tilt} 0 380)">${sofiaHead(e, { turn, noHairBack: true })}</g>`;
  if (!armL.back) g += arm(shL, armL.t, -1, armL);
  if (!armR.back) g += arm(shR, armR.t, 1, armR);
  if (o.front) g += o.front;
  return `<g>${g}</g>`;
}

// ---------- perfil (olhando para a direita) ----------
function sofiaSide() {
  let g = '';
  // mochila
  g += `<path d="M-48,404 L-118,412 Q-142,416 -142,446 L-140,584 Q-138,612 -110,612 L-46,606Z" fill="url(#gPack)" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M-142,470 H-60" stroke="${P.packSh}" stroke-width="3"/><rect x="-136" y="500" width="40" height="70" rx="12" fill="${P.packSh}" stroke="${P.line}" stroke-width="3"/>
    <rect x="-130" y="486" width="26" height="30" rx="3" fill="${P.ipe}" stroke="${P.line}" stroke-width="2.6" transform="rotate(-8 -117 500)"/>`;
  // pernas
  g += limb([[-8, 700], [-14, 812], [-18, 922]], 42, P.skinSh) + limb([[14, 700], [20, 812], [22, 922]], 42, P.skin);
  for (const [x, c] of [[-18, P.shoeSh], [22, P.shoe]]) {
    g += limb([[x, 896], [x, 918]], 44, P.sock);
    g += `<g transform="translate(${x},946)"><path d="M-26,22 Q-30,-14 -6,-22 L12,-18 Q30,-10 48,4 Q62,12 58,22Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M4,-16 l10,10 M14,-12 l8,10 M22,-8 l6,9" stroke="${P.lace}" stroke-width="3" stroke-linecap="round"/>
      <rect x="-30" y="14" width="92" height="13" rx="6.5" fill="${P.sole}" stroke="${P.line}" stroke-width="3.2"/></g>`;
  }
  // short
  g += `<path d="M-56,596 L60,596 L66,712 L-62,712Z" fill="url(#gShorts)" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-62,700 L66,700" stroke="${P.shortsHi}" stroke-width="8" opacity=".6"/><path d="M8,606 q20,20 46,16" fill="none" stroke="${P.shortsSh}" stroke-width="2.4"/>`;
  // pescoço + camiseta
  g += `<rect x="-6" y="356" width="44" height="56" fill="url(#gSkinV)" stroke="${P.line}" stroke-width="3.6"/>`;
  const T = 'M-48,396 C-30,388 34,386 52,398 C66,420 66,470 62,510 C60,560 62,596 64,624 L-58,624 C-60,580 -62,520 -60,470 C-60,440 -58,410 -48,396Z';
  g += `<path d="${T}" fill="url(#gShirt)" stroke="${P.line}" stroke-width="3.8" stroke-linejoin="round"/><path d="M-6,394 Q20,410 46,396" fill="none" stroke="${P.shirtSh}" stroke-width="10" stroke-linecap="round"/>
    <path d="M-50,398 C-44,450 -46,520 -44,600" fill="none" stroke="${P.line}" stroke-width="22" stroke-linecap="round"/><path d="M-50,398 C-44,450 -46,520 -44,600" fill="none" stroke="${P.strap}" stroke-width="15" stroke-linecap="round"/>
    <path d="M-58,560 H64" stroke="${P.shirtSh}" stroke-width="14" opacity=".35"/>`;
  // cabeça de perfil
  const HP = 'M-6,142 C40,136 88,160 100,214 C103,228 102,240 106,254 L126,288 Q128,300 112,303 L104,306 Q110,316 106,324 Q100,332 104,340 Q108,350 96,366 Q82,388 40,390 L-30,388 Q-104,370 -110,272 Q-112,170 -6,142Z';
  g += hairBack(-48, 228, 132, 124, 11);
  g += `<path d="${HP}" fill="url(#gFace)" stroke="${P.line}" stroke-width="4" stroke-linejoin="round"/>`;
  g += `<ellipse cx="-8" cy="274" rx="18" ry="24" fill="${P.skin}" stroke="${P.line}" stroke-width="3.6"/><path d="M-6,262 q10,8 0,22" fill="none" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/><circle cx="-6" cy="298" r="4.2" fill="${P.ipe}" stroke="${P.line}" stroke-width="1.8"/>`;
  g += `<ellipse cx="58" cy="314" rx="20" ry="12" fill="${P.blush}" opacity=".28" filter="url(#soft2)"/>`;
  const id = uid('pe');
  g += `<defs><clipPath id="${id}"><path d="M64,242 Q86,238 89,262 Q87,286 66,288 Q56,265 64,242Z"/></clipPath></defs><path d="M64,242 Q86,238 89,262 Q87,286 66,288 Q56,265 64,242Z" fill="${P.eyeW}"/><g clip-path="url(#${id})"><ellipse cx="80" cy="265" rx="10" ry="17" fill="url(#gIris)"/><ellipse cx="82" cy="266" rx="5" ry="9" fill="#1C0E07"/><circle cx="84" cy="257" r="3.6" fill="#fff"/></g>
    <path d="M58,240 Q80,232 90,252" fill="none" stroke="${P.line}" stroke-width="5" stroke-linecap="round"/><path d="M88,248 q8,-2 12,-10 M90,254 q9,0 13,-5" fill="none" stroke="${P.line}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M62,212 Q80,202 98,212" fill="none" stroke="${P.hair}" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M104,338 Q96,342 88,338" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/><path d="M110,300 q-6,4 -12,1" fill="none" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/>`;
  // franja de perfil
  let c = '';
  for (const [x, y, r] of [[-60, 150, 34], [-20, 136, 34], [20, 134, 32], [56, 146, 28], [80, 168, 22], [-90, 180, 30]]) c += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  g += U(c, 'url(#gHair)', 3.6);
  g += ipeClip(-36, 150, 1.05, -8);
  // braço
  g += limb([[2, 430], [12, 540], [26, 640]], 28, P.skin);
  g += `<path d="M-34,420 Q-30,396 0,394 Q34,396 38,424 L40,486 Q12,494 -20,488Z" fill="url(#gShirt)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/><path d="M-18,478 H36" stroke="${P.shirtSh}" stroke-width="2.4"/>`;
  g += `<g transform="translate(26,640) rotate(-8)">${hand('relax')}</g>`;
  g += [P.ipe, P.vowel, P.pack, P.cons, P.ipe].map((c, i) => `<circle cx="${12 + i * 5}" cy="${618 + i * 0.6}" r="3.6" fill="${c}" stroke="${P.line}" stroke-width="1.4"/>`).join('');
  return `<g>${g}</g>`;
}

// ---------- costas ----------
function sofiaBack() {
  let g = '';
  g += legs('stand');
  g += `<path d="M-98,596 L98,596 L106,712 L14,720 L2,672 L-10,720 L-106,712 Z" fill="url(#gShorts)" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M-80,622 h40 v30 q-20,8 -40,0z M40,622 h40 v30 q-20,8 -40,0z" fill="${P.shorts}" stroke="${P.shortsSh}" stroke-width="2.6"/>`;
  g += `<rect x="-24" y="356" width="48" height="56" fill="${P.skinSh}" stroke="${P.line}" stroke-width="3.6"/>`;
  const T = `M-58,390 C-82,392 -104,402 -112,426 L-106,508 C-106,560 -102,598 -98,624 L98,624 C102,598 106,560 106,508 L112,426 C104,402 82,392 58,390 Z`;
  g += `<path d="${T}" fill="url(#gShirt)" stroke="${P.line}" stroke-width="3.8"/><path d="M-40,394 Q0,404 40,394" fill="none" stroke="${P.shirtSh}" stroke-width="8"/>`;
  g += arm([-98, 430], [-132, 640], -1, { hand: 'relax', flip: -1 }) + arm([98, 430], [132, 640], 1, { hand: 'relax', bracelet: true, flip: 1 });
  // mochila de exploradora
  g += `<path d="M-74,396 C-80,420 -84,440 -86,460 M74,396 C80,420 84,440 86,460" stroke="${P.line}" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M-74,396 C-80,420 -84,440 -86,460 M74,396 C80,420 84,440 86,460" stroke="${P.strap}" stroke-width="15" stroke-linecap="round" fill="none"/>
    <rect x="-96" y="420" width="192" height="210" rx="38" fill="url(#gPack)" stroke="${P.line}" stroke-width="4"/>
    <path d="M-96,488 Q0,470 96,488 L96,470 Q96,420 58,420 L-58,420 Q-96,420 -96,470Z" fill="${P.packSh}" stroke="${P.line}" stroke-width="3.6"/>
    <rect x="-12" y="476" width="24" height="30" rx="6" fill="${P.ipe}" stroke="${P.line}" stroke-width="3"/>
    <rect x="-64" y="530" width="128" height="80" rx="20" fill="${P.pack}" stroke="${P.line}" stroke-width="3.2"/><path d="M-56,542 h112" stroke="${P.packHi}" stroke-width="3" stroke-dasharray="6 5"/>
    <g transform="translate(0,572)">${ipeClip(0, 0, 0.62, 0).replace('<rect x="-30" y="10" width="60" height="12" rx="6"', '<rect x="0" y="0" width="0" height="0"')}</g>
    <rect x="86" y="470" width="26" height="40" rx="3" fill="${P.ipe}" stroke="${P.line}" stroke-width="2.8" transform="rotate(10 99 490)"/><path d="M92,476 h14" stroke="${P.vowel}" stroke-width="3"/>
    <circle cx="-108" cy="560" r="16" fill="#DDEFF6" stroke="${P.line}" stroke-width="4"/><path d="M-100,574 l14,22" stroke="${P.strap}" stroke-width="9" stroke-linecap="round"/><path d="M-102,552 a8,8 0 0 1 4,6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-96,520 Q-104,540 -110,544" stroke="${P.line}" stroke-width="2.4" fill="none"/>`;
  // cabelo inteiro por trás
  g += earF(-127, -1).replace(/<circle[^>]*>/, '') + earF(127, 1).replace(/<circle[^>]*>/, '');
  g += hairBack(0, 230, 150, 132, 7);
  let c = '';
  for (const [x, y, r] of [[-60, 340, 44], [0, 352, 46], [60, 340, 44]]) c += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  g += U(c, 'url(#gHair)', 3.6);
  g += ipeClip(-112, 152, 1, -18);
  return `<g>${g}</g>`;
}

module.exports = { sofia, sofiaHead, sofiaSide, sofiaBack, EXPR, hand, arm, ipeClip, hairBack, eye, brow, earF, FACE };
