// Ambientes ilustrados (1280×800 → PNG 2560×1600)
const { P, rng, f, groundShadow, uid } = require('./core');
const S = require('./sofia');
const B = require('./bolota');
const PE = require('./people');

// ---------- utilidades de cenário ----------
function canopy(cx, cy, rx, ry, cols, seed, n = 46, line = null) {
  const r = rng(seed); let a = '', b = '', c = '';
  const pts = [];
  for (let i = 0; i < n; i++) { const t = r() * Math.PI * 2, d = Math.sqrt(r()); pts.push([cx + Math.cos(t) * rx * d, cy + Math.sin(t) * ry * d, 14 + r() * (rx * 0.22)]); }
  pts.forEach(([x, y, s]) => { a += `<circle cx="${f(x)}" cy="${f(y + s * 0.35)}" r="${f(s)}"/>`; b += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.92)}"/>`; });
  pts.filter((p, i) => p[1] < cy && i % 2).forEach(([x, y, s]) => c += `<circle cx="${f(x - s * 0.3)}" cy="${f(y - s * 0.35)}" r="${f(s * 0.38)}"/>`);
  return `${line ? `<g fill="${line}" stroke="${line}" stroke-width="5">${a}</g>` : ''}<g fill="${cols[0]}">${a}</g><g fill="${cols[1]}">${b}</g><g fill="${cols[2]}" opacity=".55">${c}</g>`;
}
function trunk(x, y, h, w, col, lean = 0, branches = []) {
  let g = `<path d="M${x - w},${y} C${x - w * 0.6},${y - h * 0.4} ${x + lean - w * 0.9},${y - h * 0.7} ${x + lean - w * 0.3},${y - h} L${x + lean + w * 0.3},${y - h} C${x + lean + w * 0.4},${y - h * 0.6} ${x + w * 0.7},${y - h * 0.4} ${x + w},${y}Z" fill="${col}"/>`;
  branches.forEach(([x1, y1, x2, y2, bw]) => g += `<path d="M${x1},${y1} Q${(x1 + x2) / 2 + 10},${(y1 + y2) / 2} ${x2},${y2}" stroke="${col}" stroke-width="${bw}" stroke-linecap="round" fill="none"/>`);
  g += `<path d="M${x - w * 0.3},${y - 10} q${w * 0.3},${-h * 0.3} ${lean * 0.4},${-h * 0.6}" stroke="#000" stroke-opacity=".15" stroke-width="3" fill="none"/>`;
  return g;
}
function grassTufts(seed, n, x0, x1, y0, y1, cols, hmin = 10, hmax = 26) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), h = hmin + r() * (hmax - hmin) * ((y - y0) / (y1 - y0 + 1) + 0.5), c = cols[i % cols.length];
    g += `<path d="M${f(x - 6)},${f(y)} q2,${f(-h * 0.6)} -4,${f(-h)} M${f(x)},${f(y)} q1,${f(-h * 0.8)} 3,${f(-h * 1.2)} M${f(x + 6)},${f(y)} q0,${f(-h * 0.5)} 8,${f(-h * 0.9)}" stroke="${c}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  }
  return g;
}
function cloud(x, y, s = 1, o = 0.9) {
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="10" rx="90" ry="22" fill="#fff"/><circle cx="-40" cy="0" r="30" fill="#fff"/><circle cx="0" cy="-14" r="40" fill="#fff"/><circle cx="44" cy="0" r="28" fill="#fff"/><ellipse cx="0" cy="22" rx="80" ry="10" fill="#DCEBF5"/></g>`;
}
function bunting(x1, y1, x2, y2, sag, n, seed = 1) {
  const cols = [P.ipe, P.vowel, P.cons, P.ok, '#E26D5A', P.focus]; let g = `<path d="M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}" stroke="#7A5A48" stroke-width="2" fill="none"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n, x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2, y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag * 2) + t * t * y2;
    g += `<path d="M${f(x - 9)},${f(y)} L${f(x + 9)},${f(y)} L${f(x)},${f(y + 22)}Z" fill="${cols[(i + seed) % cols.length]}" stroke="#7A5A48" stroke-width="1"/>`;
  }
  return g;
}
function chitaPattern(id, base = '#D9483B') {
  return `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${base}"/>
    <g transform="translate(10,10)">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-5" rx="3.6" ry="5" fill="#FFF3D6" transform="rotate(${a})"/>`).join('')}<circle r="2.6" fill="${P.ipe}"/></g>
    <g transform="translate(30,30)">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-4" rx="3" ry="4.2" fill="${P.ipe}" transform="rotate(${a})"/>`).join('')}<circle r="2" fill="#2F7D4F"/></g>
    <path d="M24,8 q6,2 8,8 M6,30 q4,-6 10,-6" stroke="#2F7D4F" stroke-width="2" fill="none"/></pattern>`;
}
function monstera(x, y, s = 1, seed = 3) {
  const r = rng(seed); let g = '';
  const leaves = [[-70, -220, -30], [40, -260, 20], [-10, -320, -5], [90, -170, 50], [-110, -140, -60], [10, -180, 5]];
  leaves.forEach(([lx, ly, a]) => {
    g += `<path d="M0,0 Q${lx * 0.4},${ly * 0.5} ${lx},${ly}" stroke="#2F6B43" stroke-width="5" fill="none"/>`;
    g += `<g transform="translate(${lx},${ly}) rotate(${a})"><path d="M0,40 C-60,30 -70,-40 0,-56 C70,-40 60,30 0,40Z" fill="#2F7D4F" stroke="#1F5535" stroke-width="2.6"/>
      <path d="M0,40 V-50" stroke="#1F5535" stroke-width="2"/>${[-26, -6, 14].map(yy => `<path d="M-14,${yy + 6} L-${40 - Math.abs(yy) * .3},${yy - 2} M14,${yy + 6} L${40 - Math.abs(yy) * .3},${yy - 2}" stroke="#1F5535" stroke-width="2" stroke-linecap="round" opacity=".7"/>`).join('')}
      <path d="M-30,-30 q20,-12 30,-16" stroke="#5FA06D" stroke-width="4" stroke-linecap="round" opacity=".7" fill="none"/></g>`;
  });
  return `<g transform="translate(${x},${y}) scale(${s})">${g}<path d="M-70,0 L70,0 L56,110 Q0,124 -56,110Z" fill="#C2693E" stroke="#7A3E22" stroke-width="3"/><rect x="-78" y="-12" width="156" height="24" rx="8" fill="#D9804F" stroke="#7A3E22" stroke-width="3"/><path d="M-50,40 h100" stroke="#E8A070" stroke-width="5" opacity=".6"/></g>`;
}

// ipê com galhos aparentes e cachos de flores separados (silhueta irregular)
function ipe(x, y, h, w, cols, seed, bark = '#4E3524', line = null) {
  const r = rng(seed);
  const top = [x, y - h];
  const N = 6;
  const cl = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1) - 0.5;
    cl.push([x + t * w * 1.6 + (r() - .5) * 30, y - h - 40 - Math.cos(t * Math.PI) * h * 0.38 + (r() - .5) * 26, w * (0.34 + r() * 0.12)]);
  }
  cl.push([x + (r() - .5) * 40, y - h - h * 0.52, w * 0.42]);
  let g = `<path d="M${x - 14},${y} C${x - 8},${y - h * 0.4} ${x + 12},${y - h * 0.6} ${top[0]},${top[1]} L${top[0] + 12},${top[1]} C${x + 24},${y - h * 0.6} ${x + 8},${y - h * 0.4} ${x + 14},${y}Z" fill="${bark}"/>`;
  cl.forEach(([cx, cy]) => g += `<path d="M${top[0] + 6},${top[1] + 10} Q${(top[0] + cx) / 2},${top[1] - 10} ${f(cx)},${f(cy + 16)}" stroke="${bark}" stroke-width="${7}" stroke-linecap="round" fill="none"/>`);
  g += `<path d="M${x - 6},${y - 10} q6,${-h * 0.3} 4,${-h * 0.6}" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none"/>`;
  cl.forEach(([cx, cy, rr], i) => g += canopy(cx, cy, rr, rr * 0.62, cols, seed * 7 + i, 16, line));
  return g;
}
// =================== CASA DA SOFIA ===================
function casa() {
  let g = `<defs>${chitaPattern('chita')}${chitaPattern('chita2', '#1F7A70')}
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9E6C8"/><stop offset="1" stop-color="#F1CFA2"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9773F"/><stop offset="1" stop-color="#D49A62"/></linearGradient>
    <linearGradient id="outside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED3F0"/><stop offset=".7" stop-color="#DDF1F8"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
    <radialGradient id="vign" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#5A3418" stop-opacity="0"/><stop offset="1" stop-color="#5A3418" stop-opacity=".22"/></radialGradient></defs>`;
  g += `<rect width="1280" height="800" fill="url(#wall)"/>`;
  // teto com vigas
  g += `<rect width="1280" height="46" fill="#B98252"/>${[100, 330, 560, 790, 1020, 1250].map(x => `<rect x="${x - 20}" y="0" width="40" height="58" rx="4" fill="#9C6A3E"/>`).join('')}<rect y="44" width="1280" height="6" fill="#8A5A33" opacity=".5"/>`;
  // lambri
  g += `<rect y="440" width="1280" height="130" fill="#E8B98A"/>${Array.from({ length: 32 }, (_, i) => `<path d="M${i * 40 + 20},446 V566" stroke="#D29E6C" stroke-width="2"/>`).join('')}<rect y="434" width="1280" height="12" rx="3" fill="#C98D58"/>`;
  // piso
  g += `<path d="M0,568 H1280 V800 H0Z" fill="url(#floor)"/>`;
  for (let i = -12; i <= 12; i++) g += `<path d="M${640 + i * 40},568 L${640 + i * 140},800" stroke="#A9683A" stroke-width="2" opacity=".55"/>`;
  [600, 640, 700, 770].forEach(y => g += `<path d="M0,${y} H1280" stroke="#A9683A" stroke-width="1.6" opacity=".35"/>`);
  g += `<rect y="560" width="1280" height="14" fill="#9C6A3E"/>`;
  // janela
  g += `<g><rect x="90" y="96" width="330" height="300" rx="10" fill="url(#outside)"/>
    <ellipse cx="200" cy="330" rx="200" ry="70" fill="#9CCB85"/><ellipse cx="380" cy="350" rx="180" ry="60" fill="#7DB56E"/>
    ${[[130, 300, '#F2B33D'], [190, 296, '#E26D5A'], [250, 304, '#4FA3C7']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="50" height="40" fill="${c}"/><path d="M${x - 6},${y} L${x + 25},${y - 20} L${x + 56},${y}Z" fill="#B5541E"/><rect x="${x + 18}" y="${y + 18}" width="14" height="22" fill="#7A4B2E"/>`).join('')}
    ${trunk(340, 330, 90, 8, '#6B4430', 10, [[345, 280, 310, 250, 6], [348, 270, 380, 240, 5]])}${canopy(345, 220, 70, 50, ['#D98E00', P.ipe, P.ipeHi], 11, 34)}
    ${cloud(170, 150, .6)}${cloud(330, 130, .4, .8)}
    <rect x="90" y="96" width="330" height="300" rx="10" fill="none" stroke="#8A5A33" stroke-width="16"/><path d="M255,96 V396 M90,246 H420" stroke="#8A5A33" stroke-width="12"/>
    <rect x="72" y="390" width="366" height="22" rx="6" fill="#9C6A3E"/><rect x="72" y="408" width="366" height="6" fill="#7A4B2E" opacity=".5"/></g>`;
  // cortinas de chita
  g += `<path d="M58,60 H140 Q130,200 150,300 Q120,330 108,430 H58Z" fill="url(#chita)" stroke="#9E2E25" stroke-width="2"/><path d="M370,60 H452 V430 H402 Q390,330 360,300 Q380,200 370,60Z" fill="url(#chita)" stroke="#9E2E25" stroke-width="2"/>
    <rect x="40" y="52" width="430" height="12" rx="6" fill="#7A4B2E"/><path d="M110,298 q22,6 40,0 M360,298 q22,6 40,0" stroke="${P.ipe}" stroke-width="7" stroke-linecap="round"/>`;
  // feixe de sol
  g += `<path d="M120,140 L420,140 L860,800 L300,800Z" fill="url(#beam)" opacity=".7"/>`;
  // varal de letras
  g += `<path d="M480,108 Q690,170 900,108" stroke="#7A5A48" stroke-width="2.4" fill="none"/>`;
  'ABCDEF'.split('').forEach((L, i) => { const t = (i + 0.7) / 6.4, x = 480 + t * 420, y = 108 + 4 * t * (1 - t) * 62; const v = 'AEIOU'.includes(L);
    g += `<g transform="translate(${f(x)},${f(y)}) rotate(${(i - 2.5) * 3})"><rect x="-4" y="-8" width="8" height="16" rx="2" fill="#C98D58"/><rect x="-24" y="4" width="48" height="56" rx="8" fill="#FFFBF2" stroke="#C9B49A" stroke-width="2"/><text y="47" text-anchor="middle" font-family="Andika" font-weight="700" font-size="38" fill="${v ? P.vowel : P.cons}">${L}</text></g>`; });
  // quadro de desenho infantil
  g += `<g transform="translate(560,236)"><rect width="110" height="84" rx="4" fill="#fff" stroke="#9C6A3E" stroke-width="7"/><circle cx="24" cy="22" r="10" fill="${P.ipe}"/><path d="M40,62 l20,-20 l20,20 v16 h-40z" fill="#E26D5A"/><path d="M8,78 q40,-12 94,0" stroke="${P.ok}" stroke-width="4" fill="none"/></g>`;
  g += `<g transform="translate(700,250)"><rect width="76" height="96" rx="4" fill="#DCEBF5" stroke="#9C6A3E" stroke-width="7"/><circle cx="38" cy="40" r="16" fill="#A86B47"/><circle cx="38" cy="36" r="22" fill="none" stroke="#2E1B12" stroke-width="10" stroke-dasharray="6 3"/><path d="M18,96 q20,-34 40,0" fill="${P.mango}"/></g>`;
  // rede
  g += `<g><circle cx="470" cy="300" r="7" fill="#7A5A48"/><circle cx="900" cy="300" r="7" fill="#7A5A48"/>
    <path d="M470,300 L540,372 M900,300 L830,372" stroke="#C9B49A" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M470,300 L${540 + i * 3},${372 + i * 4} M900,300 L${830 - i * 3},${372 + i * 4}" stroke="#E6D3B8" stroke-width="1.4"/>`).join('')}
    <path d="M540,370 Q685,520 830,370 L832,396 Q685,560 538,396Z" fill="url(#chita2)" stroke="#145650" stroke-width="2.4"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${548 + i * 4},${390 + i * 8} Q685,${528 + i * 8} ${822 - i * 4},${390 + i * 8}" stroke="${[P.ipe, P.vowel, '#fff', P.ipe][i]}" stroke-width="3" fill="none" opacity=".85"/>`).join('')}
    ${Array.from({ length: 14 }, (_, i) => { const t = (i + 0.5) / 14, x = 540 + t * 290, y = 394 + Math.sin(t * Math.PI) * 80; return `<path d="M${f(x)},${f(y)} v9" stroke="#F2E2C2" stroke-width="3" stroke-linecap="round"/>`; }).join('')}</g>`;
  // estante
  g += `<g><rect x="940" y="110" width="290" height="470" rx="8" fill="#9C6A3E"/><rect x="954" y="124" width="262" height="442" fill="#7A4B2E"/>`;
  const r = rng(21); const bc = [P.cons, P.vowel, P.ok, P.ipe, P.focus, '#E26D5A', '#4FA3C7', '#F28C28', '#8CC084'];
  [124, 236, 348, 460].forEach((sy, si) => {
    let x = 962;
    while (x < 1200) {
      const w = 14 + r() * 16, h = 60 + r() * 40, c = bc[Math.floor(r() * bc.length)];
      if (si === 1 && x > 1100) { x += 200; break; }
      if (r() < 0.12 && x < 1150) { g += `<rect x="${x}" y="${sy + 104 - 74}" width="${74}" height="${16}" rx="2" fill="${c}" transform="rotate(-12 ${x} ${sy + 104})"/>`; x += 60; continue; }
      g += `<rect x="${f(x)}" y="${f(sy + 104 - h)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${c}"/><rect x="${f(x)}" y="${f(sy + 104 - h + 8)}" width="${f(w)}" height="4" fill="#fff" opacity=".45"/>`;
      x += w + 2;
    }
    g += `<rect x="948" y="${sy + 104}" width="274" height="10" fill="#B98252"/>`;
  });
  g += `<g transform="translate(1150,276)"><circle cx="20" cy="20" r="22" fill="#4FA3C7" stroke="#7A4B2E" stroke-width="3"/><path d="M6,12 q10,8 4,18 M26,6 q8,10 4,20" stroke="#8CC084" stroke-width="6" fill="none"/><path d="M20,42 v18 M8,62 h24" stroke="#7A4B2E" stroke-width="4"/></g>`;
  g += `</g>`;
  g += `<g transform="translate(1110,110)">${canopy(0, -44, 50, 24, ['#2F6B43', '#3E8A55', '#7DB56E'], 4, 18)}<path d="M-24,-30 L24,-30 L18,0 L-18,0Z" fill="#C2693E" stroke="#7A3E22" stroke-width="2.4"/><rect x="-28" y="-34" width="56" height="9" rx="3" fill="#D9804F"/></g>`;
  // samambaia pendurada + luminária de palha
  g += `<path d="M640,46 V96" stroke="#7A5A48" stroke-width="3"/><path d="M590,140 Q640,70 690,140Z" fill="#E6C27A" stroke="#B5862F" stroke-width="3"/>${[600, 620, 640, 660, 680].map(x => `<path d="M640,96 L${x},140" stroke="#B5862F" stroke-width="1.6"/>`).join('')}<ellipse cx="640" cy="146" rx="80" ry="22" fill="#FFF2C4" opacity=".35" filter="url(#blur12)"/>`;
  // filtro de barro no banquinho
  g += `<g transform="translate(470,560)"><rect x="-44" y="-70" width="88" height="12" rx="4" fill="#9C6A3E"/><path d="M-36,-58 L-40,0 M36,-58 L40,0" stroke="#7A4B2E" stroke-width="8"/>
    <path d="M-28,-74 Q-34,-120 0,-124 Q34,-120 28,-74Z" fill="#C2693E" stroke="#7A3E22" stroke-width="3"/><path d="M-26,-124 Q-30,-170 0,-172 Q30,-170 26,-124Z" fill="#CF7B4A" stroke="#7A3E22" stroke-width="3"/><ellipse cx="0" cy="-174" rx="14" ry="5" fill="#A2552F"/><rect x="24" y="-96" width="12" height="6" fill="#8C93AD"/><path d="M-14,-150 q-4,14 0,24" stroke="#E8A070" stroke-width="4" fill="none" opacity=".7"/></g>`;
  // tapete
  g += `<ellipse cx="640" cy="704" rx="360" ry="74" fill="#E9C46A"/><ellipse cx="640" cy="704" rx="330" ry="62" fill="none" stroke="#C2410C" stroke-width="6" stroke-dasharray="20 12"/><ellipse cx="640" cy="704" rx="250" ry="40" fill="none" stroke="#1F7A70" stroke-width="5"/><ellipse cx="640" cy="704" rx="150" ry="22" fill="#F2D89A"/>`;
  // almofadas + livro aberto
  g += `<g transform="translate(470,712)"><ellipse rx="70" ry="26" fill="url(#chita)" stroke="#9E2E25" stroke-width="2.4"/><ellipse cy="-6" rx="56" ry="12" fill="#fff" opacity=".18"/></g>`;
  g += `<g transform="translate(690,736)"><path d="M-60,-6 Q-30,-18 0,-6 Q30,-18 60,-6 L60,10 Q30,-2 0,10 Q-30,-2 -60,10Z" fill="#FFFBF2" stroke="#C9B49A" stroke-width="2"/><path d="M0,-6 V10" stroke="#C9B49A" stroke-width="2"/><text x="-44" y="4" font-family="Andika" font-weight="700" font-size="12" fill="${P.ink}">a bola</text><circle cx="30" cy="0" r="6" fill="${P.vowel}"/></g>`;
  // planta
  g += monstera(170, 650, .62, 5);
  // personagens
  g += groundShadow(470, 720, 70, 12) + `<g transform="translate(450,716) scale(.34)">${B.bolota({ pose: 'read', eyes: 'happy', mouth: 'smile' })}</g>`;
  g += groundShadow(1000, 756, 90, 14) + `<g transform="translate(1000,${756 - 520}) scale(.52)">${S.sofia({ expr: 'alegre', letter: 'A', headTilt: -5, armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } })}</g>`;
  g += `<rect width="1280" height="800" fill="url(#vign)"/>`;
  return g;
}

// =================== PRAÇA DA VILA ===================
function sign(x, y, w, txt, bg = '#FFFBF2', col = P.ink, icon = '') {
  return `<g transform="translate(${x},${y})"><rect x="${-w / 2 - 4}" y="-22" width="${w + 8}" height="46" rx="10" fill="#7A4B2E"/><rect x="${-w / 2}" y="-18" width="${w}" height="38" rx="8" fill="${bg}"/>${icon}<text y="12" text-anchor="middle" font-family="Andika" font-weight="700" font-size="28" fill="${col}" letter-spacing="2">${txt}</text></g>`;
}
function casinha(x, w, h, col, door = 'arch', sg = '') {
  const base = 470, top = base - h;
  let g = `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${col}"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#houseShade)"/>`;
  g += `<path d="M${x - 10},${top + 2} L${x + w / 2},${top - 40} L${x + w + 10},${top + 2}Z" fill="#B5541E"/>${Array.from({ length: Math.floor(w / 18) + 1 }, (_, i) => `<path d="M${x - 6 + i * 18},${top + 2} q9,-10 18,0" stroke="#8E3F15" stroke-width="2" fill="none"/>`).join('')}<rect x="${x - 10}" y="${top - 2}" width="${w + 20}" height="8" fill="#9E4818"/>`;
  g += `<rect x="${x}" y="${base - 18}" width="${w}" height="18" fill="#000" opacity=".08"/><rect x="${x}" y="${top + 6}" width="${w}" height="10" fill="#fff" opacity=".35"/>`;
  const dx = x + w / 2 - 22;
  g += door === 'arch' ? `<path d="M${dx},${base} V${base - 70} a22,22 0 0 1 44,0 V${base}Z" fill="#6B3E22"/><path d="M${dx + 22},${base - 90} V${base}" stroke="#4E2C17" stroke-width="2"/><circle cx="${dx + 30}" cy="${base - 40}" r="2.5" fill="${P.ipe}"/>`
    : `<rect x="${dx - 8}" y="${base - 80}" width="60" height="80" fill="#6B3E22"/><rect x="${dx - 2}" y="${base - 72}" width="48" height="40" fill="#BFE3EC"/>`;
  [x + 18, x + w - 52].forEach(wx => { if (w > 120) g += `<rect x="${wx}" y="${top + 34}" width="34" height="44" fill="#BFE3EC" stroke="#FFF8EC" stroke-width="5"/><path d="M${wx - 12},${top + 34} h10 v44 h-10z M${wx + 36},${top + 34} h10 v44 h-10z" fill="${P.ok}"/><rect x="${wx - 4}" y="${top + 80}" width="42" height="10" rx="3" fill="#8A5A33"/>${[0, 1, 2].map(i => `<circle cx="${wx + 6 + i * 11}" cy="${top + 78}" r="5" fill="${[P.vowel, P.ipe, '#E26D5A'][i]}"/>`).join('')}`; });
  return g + sg;
}
function lamp(x, y) { return `<g><path d="M${x},${y} V${y - 150}" stroke="#2F4F3F" stroke-width="7"/><path d="M${x - 16},${y - 150} h32 l-6,-30 h-20z" fill="#FFF2C4" stroke="#2F4F3F" stroke-width="4"/><path d="M${x - 20},${y - 182} h40 l-20,-14z" fill="#2F4F3F"/><ellipse cx="${x}" cy="${y}" rx="18" ry="5" fill="#000" opacity=".15"/></g>`; }
function bench(x, y, s = 1) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-70" y="-60" width="140" height="12" rx="4" fill="#B5793F"/><rect x="-70" y="-44" width="140" height="12" rx="4" fill="#B5793F"/><rect x="-72" y="-26" width="144" height="12" rx="4" fill="#C98D58"/><path d="M-60,-14 V8 M60,-14 V8 M-62,-60 V-14 M62,-60 V-14" stroke="#2F4F3F" stroke-width="7"/></g>`; }
function praca() {
  let g = `<defs><linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FCBEF"/><stop offset="1" stop-color="#E7F5FA"/></linearGradient>
    <linearGradient id="houseShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <pattern id="ondas" width="64" height="32" patternUnits="userSpaceOnUse"><rect width="64" height="32" fill="#F1E4CC"/><path d="M0,16 Q16,4 32,16 T64,16 V22 Q48,10 32,22 T0,22Z" fill="#9C7A5E"/></pattern>
    <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAD7B6"/><stop offset="1" stop-color="#E0C79E"/></linearGradient>
    <radialGradient id="vign2" cx=".5" cy=".45" r=".8"><stop offset=".65" stop-color="#2B3A5A" stop-opacity="0"/><stop offset="1" stop-color="#2B3A5A" stop-opacity=".18"/></radialGradient></defs>`;
  g += `<rect width="1280" height="800" fill="url(#skyP)"/>${cloud(200, 90, .9)}${cloud(760, 60, .7)}${cloud(1120, 120, .8)}`;
  g += `<path d="M0,330 Q200,250 420,300 Q640,230 860,290 Q1080,240 1280,300 V480 H0Z" fill="#A9D49A"/><path d="M0,360 Q300,300 600,340 Q900,290 1280,340 V480 H0Z" fill="#8CC084"/>`;
  // casario
  const H = [
    [0, 150, 190, '#F2B33D', 'arch', ''],
    [150, 190, 230, '#E26D5A', 'shop', sign(245, 300, 96, 'PÃO', '#FFFBF2', P.ink, '')],
    [340, 170, 200, '#4FA3C7', 'arch', sign(425, 316, 104, 'BOLO')],
    [740, 180, 220, '#F6E7C9', 'shop', sign(830, 306, 120, 'LIVRO')],
    [920, 170, 190, '#B23C62', 'arch', ''],
    [1090, 200, 236, '#8CC084', 'shop', sign(1190, 296, 112, 'SUCO')],
  ];
  H.forEach(([x, w, h, c, d, s]) => g += casinha(x, w, h, c, d, s));
  // ipê ao fundo, no vão entre as casas (atrás do coreto)
  g += ipe(625, 470, 120, 110, ['#D98E00', P.ipe, P.ipeHi], 8, '#5C3A26', '#B87400');
  // chão da praça
  g += `<path d="M0,470 H1280 V800 H0Z" fill="url(#chao)"/>`;
  g += `<path d="M0,680 Q640,650 1280,680 V800 H0Z" fill="url(#ondas)" opacity=".75"/><path d="M0,680 Q640,650 1280,680" stroke="#C9B08A" stroke-width="6" fill="none"/>`;
  // coreto
  g += `<g transform="translate(625,548) scale(.72)"><ellipse cx="0" cy="40" rx="170" ry="26" fill="#000" opacity=".1"/><rect x="-150" y="0" width="300" height="40" rx="6" fill="#F6E7C9" stroke="#C9B08A" stroke-width="3"/><path d="M-150,10 H150" stroke="#E2CFA8" stroke-width="3"/>
    ${[-130, -65, 0, 65, 130].map(x => `<rect x="${x - 5}" y="-150" width="10" height="150" fill="#FFFBF2" stroke="#C9B08A" stroke-width="2"/>`).join('')}
    <path d="M-140,-30 H140" stroke="#FFFBF2" stroke-width="6"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${-130 + i * 20},-30 V0" stroke="#FFFBF2" stroke-width="3"/>`).join('')}
    <path d="M-176,-146 Q0,-250 176,-146 Z" fill="#C2410C"/>${[-120, -60, 0, 60, 120].map(x => `<path d="M${x},-146 Q${x * 0.4},-210 0,-232" stroke="#FFF3D6" stroke-width="6" fill="none"/>`).join('')}<rect x="-180" y="-152" width="360" height="12" rx="4" fill="#FFFBF2"/>
    <path d="M0,-232 V-262" stroke="#7A5A48" stroke-width="3"/><path d="M0,-262 l26,8 l-26,8z" fill="${P.ipe}"/></g>`;
  // bandeirinhas
  g += bunting(245, 238, 425, 246, 14, 8) + bunting(830, 238, 1010, 242, 14, 8, 3) + bunting(1010, 242, 1190, 232, 14, 8, 2);
  // barraca de suco/frutas
  g += `<g transform="translate(1160,600)"><rect x="-90" y="-60" width="180" height="70" fill="#C98D58" stroke="#7A4B2E" stroke-width="3"/><path d="M-90,-30 h180" stroke="#B5793F" stroke-width="3"/>
    ${[[-60, '#2F7D4F', 26], [-20, '#F28C28', 16], [10, '#F28C28', 16], [40, '#F4B400', 14], [64, '#C2410C', 14]].map(([x, c, r]) => `<circle cx="${x}" cy="-72" r="${r}" fill="${c}" stroke="#7A4B2E" stroke-width="2"/>`).join('')}
    <path d="M-80,-60 V-170 M80,-60 V-170" stroke="#7A4B2E" stroke-width="7"/>
    <path d="M-110,-170 H110 L96,-130 H-96Z" fill="#fff"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-110 + i * 44},-170 h22 l-3,40 h-22z" fill="${P.vowel}"/>`).join('')}<path d="M-96,-130 ${Array.from({ length: 8 }, (_, i) => `q12,14 24,0`).join(' ')}" fill="#fff" stroke="${P.vowel}" stroke-width="3"/></g>`;
  g += sign(1040, 380, 0, '').replace(/<rect[^>]*>/g, '');
  g += lamp(40, 660) + lamp(820, 640) + bench(150, 640, .8) + bench(930, 620, .7);
  // pétalas de ipê no chão
  { const r = rng(9); for (let i = 0; i < 60; i++) g += `<ellipse cx="${f(480 + r() * 300)}" cy="${f(560 + r() * 100)}" rx="4" ry="2.4" fill="${P.ipe}" transform="rotate(${f(r() * 180)} 0 0)" opacity=".85"/>`; }
  // moradores
  const pp = (k, x, y, s) => groundShadow(x, y, 120 * s, 18 * s) + `<g transform="translate(${x},${y - 1000 * s}) scale(${s})">${PE.ELENCO[k]()}</g>`;
  g += pp('kenji', 245, 486, .19);
  g += pp('jaci', 830, 490, .19);
  g += pp('cida', 150, 650, .21);
  g += pp('davi', 330, 600, .21);
  g += PE.pipa(930, 150, .45) + `<path d="M930,182 Q915,380 942,${652 - 0.17 * 1000 + 470 * .17}" stroke="#5B5A72" stroke-width="1.2" fill="none"/>` + pp('tito', 920, 652, .17);
  g += `<g transform="translate(1170,746)">${groundShadow(0, 0, 30, 6)}${PE.robo(0, -14, .2)}</g>` + pp('lia', 1100, 748, .21);
  // Sofia e Bolota no primeiro plano
  g += groundShadow(500, 780, 70, 12) + `<g transform="translate(500,${780 - 400}) scale(.4)">${S.sofia({ expr: 'alegre', turn: 1, letter: 'P', armR: { t: [236, 300], hand: 'point', hrot: -50 } })}</g>`;
  g += groundShadow(624, 780, 50, 9) + `<g transform="translate(610,778) scale(.27)">${B.bolota({ eyes: 'open', mouth: 'open', look: [3, -4] })}</g>`;
  g += `<rect width="1280" height="800" fill="url(#vign2)"/>`;
  return g;
}

// =================== CERRADO ===================
function lobo(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-60,-120 Q-110,-130 -130,-90 Q-150,-50 -170,-40 Q-140,-60 -120,-80" fill="#B4532A"/><path d="M-170,-40 q-6,-10 6,-16 q4,10 -6,16z" fill="#fff"/>
    ${[[-50, -1], [-30, 1], [44, -1], [62, 1]].map(([lx, d]) => `<path d="M${lx},-110 L${lx + d * 4},-4" stroke="#1C140F" stroke-width="12" stroke-linecap="round"/>`).join('')}
    <ellipse cx="0" cy="-130" rx="80" ry="34" fill="#C8642A"/><ellipse cx="-10" cy="-120" rx="60" ry="18" fill="#E3A160" opacity=".5"/>
    <path d="M30,-160 Q50,-170 60,-150 L66,-118 Q40,-110 30,-130Z" fill="#1C140F"/>
    <path d="M60,-150 Q70,-210 96,-210 Q120,-206 128,-188 L150,-176 Q152,-166 140,-164 L112,-160 Q90,-140 70,-128Z" fill="#C8642A"/>
    <path d="M86,-206 L84,-246 L104,-212Z M98,-208 L108,-244 L116,-204Z" fill="#B4532A" stroke="#1C140F" stroke-width="2"/><path d="M90,-214 L89,-236 L100,-214Z" fill="#F6E2CB"/>
    <path d="M128,-188 L150,-176 Q152,-166 140,-164 L118,-166Z" fill="#1C140F"/><path d="M108,-168 Q100,-150 86,-146" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="112" cy="-192" r="3.6" fill="#1C140F"/></g>`;
}
function buriti(x, y, h, s = 1) {
  let leaves = '';
  for (let i = 0; i < 13; i++) { const a = -170 + i * 13.5; const r = 60 + (i % 3) * 6; const ex = Math.cos(a * Math.PI / 180) * r, ey = Math.sin(a * Math.PI / 180) * r * 0.8;
    leaves += `<path d="M0,0 Q${f(ex * 0.5)},${f(ey * 0.6 - 10)} ${f(ex)},${f(ey + 12)}" stroke="#2F6B43" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    for (let k = 0; k < 5; k++) { const t = 0.55 + k * 0.1; leaves += `<path d="M${f(ex * t)},${f((ey + 12) * t)} l${f(ex * 0.12)},${f(14 + k * 2)}" stroke="#3E8A55" stroke-width="3" stroke-linecap="round"/>`; } }
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-6,0 L-4,${-h} L4,${-h} L6,0Z" fill="#7A6A58"/>${Array.from({ length: Math.floor(h / 14) }, (_, i) => `<path d="M-5,${-i * 14} h10" stroke="#5E5040" stroke-width="2"/>`).join('')}<g transform="translate(0,${-h})">${leaves}<circle r="10" fill="#4E3A2A"/></g></g>`;
}
function cupim(x, y, s = 1) { return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-36,0 Q-40,-50 -16,-80 Q-6,-100 6,-86 Q30,-70 34,-30 Q38,-10 40,0Z" fill="#B5683E"/><path d="M-10,-70 q8,30 -4,60 M14,-60 q6,24 0,50" stroke="#94512E" stroke-width="3" fill="none"/><path d="M-30,-30 q14,-30 30,-54" stroke="#D08A5E" stroke-width="5" fill="none" opacity=".6"/></g>`; }
function cerrado() {
  let g = `<defs><linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77AEE0"/><stop offset=".55" stop-color="#BFD9EA"/><stop offset="1" stop-color="#F9D8A4"/></linearGradient>
    <radialGradient id="sunC" cx=".82" cy=".42" r=".4"><stop offset="0" stop-color="#FFF4CF" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4CF" stop-opacity="0"/></radialGradient>
    <linearGradient id="campo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7BC6A"/><stop offset="1" stop-color="#C49B4A"/></linearGradient>
    <linearGradient id="trilha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D08A5E"/><stop offset="1" stop-color="#B5683E"/></linearGradient>
    <radialGradient id="vign3" cx=".5" cy=".45" r=".8"><stop offset=".6" stop-color="#4A2A12" stop-opacity="0"/><stop offset="1" stop-color="#4A2A12" stop-opacity=".22"/></radialGradient></defs>`;
  g += `<rect width="1280" height="800" fill="url(#skyC)"/><rect width="1280" height="800" fill="url(#sunC)"/><circle cx="1050" cy="300" r="46" fill="#FFF6D8" opacity=".9"/>${cloud(240, 110, .8, .8)}${cloud(640, 70, .6, .7)}${cloud(980, 150, .7, .75)}${cloud(1180, 60, .5, .7)}
    <path d="M760,190 q14,-12 28,0 q14,-12 28,0" fill="none" stroke="#4A3A5A" stroke-width="3" stroke-linecap="round"/><path d="M820,230 q9,-8 18,0 q9,-8 18,0" fill="none" stroke="#4A3A5A" stroke-width="2.4" stroke-linecap="round"/>`;
  // chapadas
  g += `<path d="M0,330 L80,330 L110,300 L360,296 L392,330 L520,334 L560,310 L760,306 L800,336 L1280,330 V420 H0Z" fill="#B7A6C8"/><path d="M110,300 L360,296 L366,308 L116,312Z" fill="#CDBEDC"/>`;
  g += `<path d="M0,360 Q160,340 300,356 L640,350 L700,320 L1000,316 L1050,350 Q1180,346 1280,356 V440 H0Z" fill="#9C8FB6"/><path d="M700,320 L1000,316 L1006,330 L706,334Z" fill="#B7A6C8"/>`;
  // campo distante e vereda
  g += `<path d="M0,410 Q320,380 640,400 Q960,380 1280,404 V800 H0Z" fill="#CFB26A"/>`;
  g += `<path d="M680,430 Q900,410 1280,430 V470 Q980,460 680,452Z" fill="#5E8F55"/>`;
  [720, 770, 830, 880, 960, 1020, 1090, 1160, 1230].forEach((x, i) => g += buriti(x, 446 + (i % 2) * 6, 110 + (i % 3) * 20, .55));
  // campo médio
  g += `<path d="M0,470 Q300,440 640,470 Q980,450 1280,480 V800 H0Z" fill="url(#campo)"/>`;
  g += grassTufts(3, 160, 0, 1280, 480, 560, ['#B08C3E', '#E0C878', '#9E7A32'], 8, 18);
  // lobo-guará ao fundo
  g += `<ellipse cx="830" cy="548" rx="60" ry="7" fill="#000" opacity=".12"/>` + lobo(820, 548, .52);
  g += grassTufts(7, 30, 760, 900, 534, 554, ['#B08C3E', '#E0C878'], 10, 20);
  // cupinzeiros
  g += cupim(150, 540, .9) + cupim(990, 528, .55) + cupim(1190, 600, 1.1);
  // ipê roxo
  g += ipe(1090, 620, 170, 150, ['#8E4380', '#C36BB0', '#EAB2DC'], 14, '#4E3524', '#7A3570');
  // ipê amarelo
  g += ipe(250, 650, 200, 180, ['#D98E00', P.ipe, P.ipeHi], 21, '#5C3A26', '#B87400');
  // trilha de terra
  g += `<path d="M420,800 Q520,660 600,600 Q660,560 720,540 L760,542 Q700,580 680,620 Q640,700 760,800Z" fill="url(#trilha)"/><path d="M600,600 Q660,560 720,540" stroke="#E2A57C" stroke-width="4" fill="none" opacity=".6"/>`;
  // primeiro plano: capim dourado, canela-de-ema, flores
  g += grassTufts(11, 220, 0, 1280, 600, 800, ['#A57F35', '#E7CF84', '#8E6A2A', '#D9B95E'], 14, 40);
  const r = rng(31);
  for (let i = 0; i < 40; i++) { const x = r() * 1280, y = 620 + r() * 170; if (x > 420 && x < 760 && y > 600) continue; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3)}" fill="${['#F6F0FF', '#C36BB0', P.ipe, '#fff'][i % 4]}"/>`; }
  g += `<g transform="translate(90,760)"><path d="M0,0 Q-6,-60 4,-120" stroke="#3A2A20" stroke-width="10" fill="none"/>${[-120, -100, -80].map(y => `<path d="M2,${y} l-18,-20 M4,${y} l18,-22 M3,${y} l-4,-26" stroke="#4E7A3E" stroke-width="5" stroke-linecap="round"/>`).join('')}<circle cx="4" cy="-150" r="10" fill="#9B6FC4"/><circle cx="-8" cy="-140" r="8" fill="#B892E0"/></g>`;
  g += `<g opacity=".95">${grassTufts(41, 26, 1080, 1280, 760, 800, ['#7A5A22', '#9E7A32'], 40, 70)}${grassTufts(43, 18, 300, 420, 770, 800, ['#7A5A22', '#9E7A32'], 30, 56)}</g>`;
  // Sofia exploradora e Bolota
  g += groundShadow(560, 770, 80, 14) + `<g transform="translate(560,${770 - 480}) scale(.48)">${S.sofia({ expr: 'curiosa', turn: 1, letter: 'L', headTilt: 4, armR: { t: [240, 300], hand: 'point', hrot: -40 } })}</g>`;
  g += groundShadow(710, 772, 56, 10) + `<g transform="translate(694,770) scale(.3)">${B.bolota({ eyes: 'wide', mouth: 'o', look: [4, -4], extra: 'q' })}</g>`;
  g += `<g opacity=".9"><path d="M820,640 q8,-12 16,0 q8,-12 16,0" fill="none" stroke="#5B5A72" stroke-width="2.6" stroke-linecap="round"/><path d="M380,520 q6,-9 12,0 q6,-9 12,0" fill="none" stroke="#5B5A72" stroke-width="2.2" stroke-linecap="round"/></g>`;
  g += `<rect width="1280" height="800" fill="url(#vign3)"/>`;
  return g;
}

module.exports = { casa, praca, cerrado };
