// FONEMA v2 · ANIMAIS DA VILA — mesma linguagem visual (contorno #3A2218, luz de cima à esquerda, olhos grandes e brilhantes)
// Cada função devolve SVG com os pés em y=0 e centro em x=0. Sem coleiras enfeitadas nem laços.
const { P, uid, f } = require('./core');
const L = P.line;
function rg(c1, c2, c3, cx = '.4', cy = '.32') { const id = uid('ag'); return { id, d: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>` }; }
const sh = (d, fill, w = 3.6, extra = '') => `<path d="${d}" fill="${fill}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
function aEye(x, y, r = 14, look = [1, 0]) {
  return `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#1E120B" stroke="${L}" stroke-width="2.4"/><ellipse cx="${x + look[0] * r * .15}" cy="${y + r * .25}" rx="${r * .62}" ry="${r * .5}" fill="#5A3A26" opacity=".7"/><circle cx="${x + r * .32}" cy="${y - r * .36}" r="${r * .36}" fill="#fff"/><circle cx="${x - r * .3}" cy="${y + r * .4}" r="${r * .15}" fill="#fff" opacity=".9"/></g>`;
}
const shadow = (rx, ry = rx * .16) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="url(#gShadow)"/>`;

// 1 · Cachorro caramelo (vira-lata) — sentado
function caramelo() {
  const b = rg('#F2B871', '#D98E44', '#A9662A'), m = rg('#FFF1D8', '#F6D7A6', '#E2B57C');
  let g = `<defs>${b.d}${m.d}</defs>${shadow(120)}`;
  g += sh('M88,-6 Q150,-30 156,-100 Q160,-130 140,-128 Q136,-70 92,-48Z', `url(#${b.id})`); // cauda
  g += sh('M-70,-4 Q-96,-80 -60,-170 Q-20,-230 40,-200 Q100,-160 96,-60 Q96,-10 80,-4Z', `url(#${b.id})`); // corpo
  g += sh('M30,-120 Q100,-110 104,-40 Q104,-4 70,-2 L40,-2 Q20,-40 30,-120Z', `url(#${b.id})`); // coxa
  g += sh('M-30,-190 Q0,-210 26,-190 Q34,-120 20,-60 Q0,-48 -22,-60 Q-40,-120 -30,-190Z', `url(#${m.id})`, 0); // peito
  g += sh('M-46,-120 L-50,-12 Q-50,0 -30,0 L-14,0 Q-6,-6 -12,-14 L-18,-120Z', `url(#${b.id})`) + sh('M8,-120 L6,-12 Q6,0 24,0 L40,0 Q48,-6 42,-14 L36,-120Z', `url(#${b.id})`);
  g += `<path d="M-40,-6 v-8 M-30,-6 v-8 M16,-6 v-8 M26,-6 v-8" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
  // cabeça
  g += `<g transform="translate(-6,-232)">`;
  g += sh('M-74,-46 Q-118,-40 -112,24 Q-108,52 -86,46 Q-72,10 -60,-20Z', '#B9722F') + sh('M70,-46 Q114,-40 108,24 Q104,52 82,46 Q68,10 56,-20Z', '#B9722F');
  g += sh('M0,-84 C64,-84 86,-40 84,8 C82,60 44,82 0,82 C-44,82 -82,60 -84,8 C-86,-40 -64,-84 0,-84Z', `url(#${b.id})`);
  g += `<path d="M-30,-70 Q0,-40 30,-70" fill="#F6D7A6" opacity=".6"/>`;
  g += sh('M-46,34 Q-50,2 0,0 Q50,2 46,34 Q40,74 0,76 Q-40,74 -46,34Z', `url(#${m.id})`, 3);
  g += aEye(-32, -18, 13) + aEye(32, -18, 13);
  g += `<path d="M-46,-42 q12,-8 24,-2 M22,-44 q12,-6 24,2" stroke="#8A4E1F" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  g += `<ellipse cx="0" cy="14" rx="15" ry="11" fill="#2A1A12" stroke="${L}" stroke-width="2.4"/><ellipse cx="-4" cy="9" rx="5" ry="3" fill="#fff" opacity=".6"/>`;
  g += `<path d="M0,25 V38 M-18,40 Q-9,50 0,40 Q9,50 18,40" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  g += sh('M-8,46 Q0,70 8,46Z', '#E8707A', 2.6);
  g += `<ellipse cx="-56" cy="24" rx="12" ry="7" fill="${P.blush}" opacity=".35"/><ellipse cx="56" cy="24" rx="12" ry="7" fill="${P.blush}" opacity=".35"/></g>`;
  return g;
}

// 2 · Gatinha tigrada — sentada, cauda enrolada
function gatinha() {
  const b = rg('#BFC3CF', '#9AA0B0', '#6F7587');
  let g = `<defs>${b.d}</defs>${shadow(90)}`;
  g += sh('M40,-8 Q120,0 110,-60 Q104,-90 80,-80 Q96,-40 50,-30Z', `url(#${b.id})`);
  g += sh('M-56,-4 Q-74,-80 -40,-140 Q0,-170 40,-140 Q74,-80 56,-4Z', `url(#${b.id})`);
  g += `<path d="M-16,-140 Q0,-100 16,-140 Q20,-60 0,-40 Q-20,-60 -16,-140Z" fill="#F1F2F6"/>`;
  g += `<path d="M-62,-60 q16,4 22,-2 M-66,-90 q16,4 24,-2 M62,-60 q-16,4 -22,-2 M66,-90 q-16,4 -24,-2 M96,-62 l12,4 M90,-40 l12,6" stroke="#5E6475" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  g += sh('M-30,-60 L-32,-6 Q-30,2 -14,2 Q-6,-2 -10,-10 L-12,-60Z', '#F1F2F6', 3) + sh('M12,-60 L10,-10 Q6,-2 14,2 Q30,2 32,-6 L30,-60Z', '#F1F2F6', 3);
  g += `<g transform="translate(0,-196)">`;
  g += sh('M-70,-20 L-74,-92 L-24,-56Z', `url(#${b.id})`) + sh('M70,-20 L74,-92 L24,-56Z', `url(#${b.id})`);
  g += `<path d="M-62,-36 L-64,-76 L-38,-54Z M62,-36 L64,-76 L38,-54Z" fill="#F2A7B0"/>`;
  g += sh('M0,-66 C58,-66 80,-30 78,6 C76,46 42,62 0,62 C-42,62 -76,46 -78,6 C-80,-30 -58,-66 0,-66Z', `url(#${b.id})`);
  g += `<path d="M-12,-64 l4,22 M0,-66 v24 M12,-64 l-4,22" stroke="#5E6475" stroke-width="5" stroke-linecap="round"/>`;
  g += `<path d="M-40,40 Q-40,10 0,12 Q40,10 40,40 Q30,62 0,62 Q-30,62 -40,40Z" fill="#F1F2F6"/>`;
  g += aEye(-30, -6, 13) + aEye(30, -6, 13);
  g += `<path d="M-30,-6 m0,-10 v20 M30,-6 m0,-10 v20" stroke="#0E0805" stroke-width="3" opacity=".0"/>`;
  g += `<path d="M-7,18 L7,18 L0,26Z" fill="#E8707A" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><path d="M0,26 v6 M-12,36 Q-6,42 0,34 Q6,42 12,36" stroke="${L}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M-46,22 h-34 M-46,30 l-30,8 M46,22 h34 M46,30 l30,8" stroke="#6F7587" stroke-width="2" stroke-linecap="round"/>`;
  g += `<ellipse cx="-50" cy="20" rx="10" ry="6" fill="${P.blush}" opacity=".35"/><ellipse cx="50" cy="20" rx="10" ry="6" fill="${P.blush}" opacity=".35"/></g>`;
  return g;
}

// 3 · Papagaio-verdadeiro — no poleiro
function papagaio() {
  const b = rg('#7FD66A', '#38A84A', '#1F7A38');
  let g = `<defs>${b.d}</defs>${shadow(70)}`;
  g += `<path d="M-6,0 V-120" stroke="${L}" stroke-width="16" stroke-linecap="round"/><path d="M-6,0 V-120" stroke="#9C6A3E" stroke-width="10" stroke-linecap="round"/>`;
  g += `<path d="M-90,-120 H90" stroke="${L}" stroke-width="18" stroke-linecap="round"/><path d="M-90,-120 H90" stroke="#B5793F" stroke-width="12" stroke-linecap="round"/>`;
  g += sh('M14,-130 L40,-40 L20,-36 L0,-120Z', '#1F7A38') + sh('M30,-128 L70,-56 L50,-48 L16,-120Z', '#2C6FD0');
  g += sh('M-50,-150 Q-60,-240 0,-270 Q60,-270 62,-200 Q64,-140 30,-122 L-30,-122 Q-48,-130 -50,-150Z', `url(#${b.id})`);
  g += sh('M-50,-210 Q-74,-170 -40,-128 Q-20,-150 -24,-196Z', '#2C8F3F');
  g += `<path d="M-48,-196 Q-56,-180 -48,-160" stroke="#E43D30" stroke-width="10" stroke-linecap="round"/>`;
  g += `<path d="M-40,-150 q8,-10 16,0 M-44,-170 q8,-10 16,0" stroke="#1F7A38" stroke-width="3" fill="none"/>`;
  g += sh('M-20,-120 v10 M-6,-120 v10', 'none', 3);
  g += `<path d="M-24,-124 q-6,10 4,12 M-8,-124 q-6,10 4,12" stroke="#7A7A7A" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  // cabeça
  g += `<g transform="translate(6,-282)">`;
  g += sh('M0,-56 C44,-56 60,-24 58,8 C56,40 30,52 0,52 C-36,52 -58,36 -58,0 C-58,-34 -36,-56 0,-56Z', `url(#${b.id})`);
  g += `<path d="M-30,-48 Q0,-64 30,-48 Q20,-30 0,-30 Q-20,-30 -30,-48Z" fill="#4A8FE8"/><path d="M-50,-10 Q-40,-40 -10,-36 Q10,-10 -6,20 Q-40,26 -50,-10Z" fill="#F7D046"/>`;
  g += `<circle cx="-18" cy="-8" r="15" fill="#FFF8E8" stroke="${L}" stroke-width="2"/>` + aEye(-18, -8, 9);
  g += sh('M24,-18 Q70,-20 64,30 Q60,46 46,40 Q50,14 30,10Z', '#3A3A44') + `<path d="M30,10 Q44,18 40,30 L30,26Z" fill="#26262E"/><ellipse cx="46" cy="-6" rx="8" ry="4" fill="#fff" opacity=".35"/>`;
  g += `</g>`;
  return g;
}

// 4 · Jabuti-piranga — andando devagar
function jabuti() {
  const s = rg('#8A6A44', '#5E4428', '#3A2A18');
  let g = `<defs>${s.d}</defs>${shadow(150)}`;
  g += sh('M-100,-30 Q-112,-4 -96,0 L-76,0 Q-70,-16 -72,-34Z', '#7A5A3E') + sh('M70,-34 Q72,-16 80,0 L100,0 Q112,-4 100,-30Z', '#7A5A3E');
  g += `<circle cx="-90" cy="-14" r="5" fill="#E2553B"/><circle cx="88" cy="-16" r="5" fill="#E2553B"/>`;
  g += sh('M-130,-40 Q-126,-150 0,-160 Q126,-150 130,-40 Q0,-24 -130,-40Z', `url(#${s.id})`);
  const sc = [[-60, -110], [0, -128], [60, -110], [-90, -64], [-30, -72], [30, -72], [90, -64]];
  sc.forEach(([x, y]) => g += `<path d="M${x - 22},${y} L${x - 11},${y - 18} L${x + 11},${y - 18} L${x + 22},${y} L${x + 11},${y + 18} L${x - 11},${y + 18}Z" fill="#E0A63A" stroke="#3A2A18" stroke-width="3"/><path d="M${x - 8},${y - 6} h16" stroke="#F4CF6E" stroke-width="3" stroke-linecap="round"/>`);
  g += `<path d="M-130,-40 Q0,-24 130,-40 L128,-28 Q0,-12 -128,-28Z" fill="#3A2A18"/>`;
  g += `<ellipse cx="-50" cy="-130" rx="40" ry="10" fill="#fff" opacity=".18"/>`;
  // cabeça
  g += sh('M118,-50 Q140,-90 186,-86 Q222,-80 220,-50 Q216,-26 186,-26 Q150,-28 128,-30Z', '#8A6A44');
  g += `<circle cx="160" cy="-68" r="5" fill="#E2553B"/><circle cx="148" cy="-52" r="4" fill="#E2553B"/><circle cx="172" cy="-48" r="4" fill="#F28C28"/>`;
  g += `<circle cx="192" cy="-66" r="12" fill="#FFF8E8" stroke="${L}" stroke-width="2"/>` + aEye(194, -66, 8) + `<path d="M180,-74 Q194,-82 206,-74" stroke="${L}" stroke-width="3" fill="none"/>`;
  g += `<path d="M196,-40 Q206,-36 216,-42" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  g += sh('M-140,-40 L-160,-30 L-136,-30Z', '#7A5A3E', 3);
  return g;
}

// 5 · Capivara — deitadinha, calma
function capivara() {
  const b = rg('#C98E5A', '#9C6A3E', '#6E4826');
  let g = `<defs>${b.d}</defs>${shadow(170)}`;
  g += sh('M-150,-10 Q-170,-120 -60,-150 Q60,-170 120,-120 Q150,-90 140,-10Z', `url(#${b.id})`);
  g += `<path d="M-120,-60 q10,-8 20,0 M-80,-100 q10,-8 20,0 M-30,-120 q10,-8 20,0 M20,-120 q10,-8 20,0 M60,-100 q10,-8 20,0" stroke="#7A5232" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  g += sh('M-120,0 Q-124,-30 -100,-34 Q-84,-30 -86,0Z', '#8A5A34') + sh('M-30,0 Q-34,-28 -10,-30 Q6,-26 4,0Z', '#8A5A34');
  // cabeça
  g += `<g transform="translate(130,-120)">`;
  g += sh('M-40,-60 Q-48,-80 -30,-84 Q-20,-80 -22,-62Z', '#8A5A34') + sh('M10,-66 Q8,-86 26,-86 Q36,-80 30,-62Z', '#8A5A34');
  g += sh('M-60,10 Q-70,-60 0,-70 Q70,-72 90,-20 Q104,20 80,50 Q60,74 10,72 Q-50,70 -60,10Z', `url(#${b.id})`);
  g += sh('M30,0 Q90,-6 92,30 Q90,62 50,66 Q20,66 18,40Z', '#B07A48', 3);
  g += `<ellipse cx="64" cy="14" rx="9" ry="5" fill="#3A2218"/><ellipse cx="82" cy="20" rx="6" ry="4" fill="#3A2218"/>`;
  g += `<path d="M50,46 Q64,54 80,44" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M-6,-20 Q6,-30 18,-20" stroke="${L}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-6,-14 q12,6 24,0" stroke="#6E4826" stroke-width="2.4" fill="none" opacity=".6"/>`;
  g += `<ellipse cx="-14" cy="26" rx="14" ry="8" fill="${P.blush}" opacity=".35"/>`;
  g += `</g>`;
  // passarinho amigo nas costas
  g += `<g transform="translate(-30,-160)">${sh('M-20,0 Q-20,-26 6,-28 Q24,-26 24,-8 Q22,6 0,8Z', '#F4B400', 3)}${sh('M22,-16 L36,-12 L22,-8Z', '#E07A1C', 2)}<circle cx="12" cy="-16" r="3.4" fill="${L}"/><circle cx="13" cy="-17" r="1.2" fill="#fff"/><path d="M-20,-6 L-34,-2" stroke="${L}" stroke-width="3" stroke-linecap="round"/><path d="M-4,8 v8 M4,8 v8" stroke="${L}" stroke-width="2.4"/></g>`;
  return g;
}

// 6 · Mico-leão-dourado — sentado no galho
function mico() {
  const b = rg('#FFD27A', '#F2A33A', '#C8741C');
  let g = `<defs>${b.d}</defs>${shadow(80)}`;
  g += `<path d="M40,-40 Q140,-30 130,80" stroke="${L}" stroke-width="22" fill="none" stroke-linecap="round" transform="translate(0,-90)"/><path d="M40,-40 Q140,-30 130,80" stroke="#E8922E" stroke-width="15" fill="none" stroke-linecap="round" transform="translate(0,-90)"/>`;
  g += sh('M-46,-4 Q-60,-90 -26,-150 Q10,-170 40,-140 Q64,-90 48,-4Z', `url(#${b.id})`);
  g += sh('M-40,-2 Q-60,-10 -46,-60 Q-30,-40 -20,-2Z', '#E8922E', 3) + sh('M40,-2 Q60,-10 46,-60 Q30,-40 20,-2Z', '#E8922E', 3);
  g += sh('M-30,-130 Q-80,-90 -50,-60 Q-40,-70 -34,-100Z', `url(#${b.id})`, 3) + sh('M30,-130 Q80,-90 50,-60 Q40,-70 34,-100Z', `url(#${b.id})`, 3);
  // juba e rosto
  g += `<g transform="translate(0,-200)">`;
  let mane = ''; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mane += `<circle cx="${f(Math.cos(a) * 62)}" cy="${f(Math.sin(a) * 58)}" r="${i % 2 ? 30 : 34}"/>`; }
  g += `<g fill="${L}" stroke="${L}" stroke-width="7">${mane}</g><g fill="url(#${b.id})">${mane}</g><circle r="64" fill="#F6B04A"/>`;
  g += sh('M0,-40 C34,-40 44,-10 42,14 C40,40 22,52 0,52 C-22,52 -40,40 -42,14 C-44,-10 -34,-40 0,-40Z', '#7A4A30');
  g += `<path d="M-20,30 Q0,24 20,30 Q14,50 0,50 Q-14,50 -20,30Z" fill="#8E5A3E"/>`;
  g += aEye(-16, 0, 10) + aEye(16, 0, 10);
  g += `<ellipse cx="-5" cy="22" rx="2.6" ry="2" fill="#2A1610"/><ellipse cx="5" cy="22" rx="2.6" ry="2" fill="#2A1610"/><path d="M-8,36 Q0,42 8,36" stroke="#2A1610" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M-30,-18 q12,-8 22,-2 M8,-20 q12,-6 22,2" stroke="#4A2A18" stroke-width="3.6" fill="none" stroke-linecap="round"/></g>`;
  return g;
}

// 7 · Galinha caipira
function galinha() {
  const b = rg('#E09A5A', '#B8622C', '#86401A');
  let g = `<defs>${b.d}</defs>${shadow(90)}`;
  g += `<path d="M-14,0 V-40 M14,0 V-40" stroke="${L}" stroke-width="10" stroke-linecap="round"/><path d="M-14,0 V-40 M14,0 V-40" stroke="#F2B233" stroke-width="5" stroke-linecap="round"/><path d="M-28,0 h26 M0,0 h28" stroke="#F2B233" stroke-width="5" stroke-linecap="round"/>`;
  g += sh('M-70,-90 Q-120,-150 -100,-190 Q-80,-160 -60,-150 Q-90,-200 -60,-220 Q-50,-170 -40,-150Z', '#3A2A20');
  g += sh('M-80,-60 Q-100,-150 -20,-170 Q60,-180 90,-140 Q100,-120 90,-100 Q90,-40 40,-30 Q-40,-20 -80,-60Z', `url(#${b.id})`);
  g += sh('M-40,-110 Q0,-140 40,-110 Q30,-60 -20,-60 Q-50,-80 -40,-110Z', '#9A4A20', 3);
  g += `<path d="M-30,-100 q12,8 24,0 M-30,-84 q12,8 24,0 M-6,-92 q12,8 24,0" stroke="#7A3416" stroke-width="2.6" fill="none"/>`;
  g += `<g transform="translate(60,-170)">`;
  g += sh('M-20,-34 Q-24,-56 -8,-56 Q-4,-70 10,-66 Q20,-74 28,-60 Q40,-56 30,-40Z', '#E43D30', 3);
  g += sh('M0,-40 C30,-40 40,-20 38,0 C36,26 20,34 0,34 C-20,34 -36,24 -38,0 C-40,-22 -26,-40 0,-40Z', `url(#${b.id})`);
  g += aEye(10, -8, 8);
  g += sh('M34,-6 L56,2 L34,10Z', '#F2B233', 3);
  g += sh('M28,12 Q36,30 26,36 Q18,30 22,14Z', '#E43D30', 2.6);
  g += `<ellipse cx="-6" cy="10" rx="8" ry="5" fill="${P.blush}" opacity=".4"/></g>`;
  return g;
}

// 8 · Burrinho com os alforjes da biblioteca itinerante
function burrinho() {
  const b = rg('#C3BDB5', '#9C958C', '#6E6860');
  let g = `<defs>${b.d}</defs>${shadow(170)}`;
  for (const [x, c] of [[-110, '#7E776F'], [-70, '#9C958C'], [70, '#7E776F'], [110, '#9C958C']]) g += sh(`M${x - 16},-150 L${x - 14},-14 Q${x - 14},0 ${x},0 L${x + 14},0 Q${x + 18},-8 ${x + 16},-20 L${x + 16},-150Z`, c) + `<rect x="${x - 17}" y="-18" width="34" height="18" rx="5" fill="#3A2A20"/>`;
  g += sh('M-150,-150 Q-150,-250 -60,-256 L90,-256 Q160,-250 160,-170 Q160,-120 120,-110 L-110,-110 Q-150,-110 -150,-150Z', `url(#${b.id})`);
  g += sh('M-150,-200 Q-200,-190 -200,-120 Q-196,-100 -186,-110 Q-186,-170 -150,-180Z', '#7E776F');
  g += `<path d="M-190,-120 l-6,24 l12,-10 l4,14 l6,-26z" fill="#3A2A20"/>`;
  g += `<path d="M-130,-140 Q0,-120 140,-140" stroke="#E8E3DA" stroke-width="18" opacity=".55" fill="none"/>`;
  // alforjes com livros
  g += sh('M-70,-262 L80,-262 L84,-236 L-74,-236Z', '#9C5C1C', 3);
  g += sh('M-60,-240 L60,-240 L66,-130 Q0,-118 -66,-130Z', '#C77B2C');
  g += `<rect x="-50" y="-262" width="16" height="26" fill="#1D4ED8" stroke="${L}" stroke-width="2.4"/><rect x="-32" y="-268" width="14" height="32" fill="#C2410C" stroke="${L}" stroke-width="2.4"/><rect x="-16" y="-262" width="16" height="26" fill="#2F7D4F" stroke="${L}" stroke-width="2.4"/><rect x="2" y="-270" width="14" height="34" fill="#F4B400" stroke="${L}" stroke-width="2.4"/>`;
  g += `<rect x="-44" y="-206" width="88" height="34" rx="8" fill="#FFF8EC" stroke="${L}" stroke-width="2.6"/><text x="0" y="-182" text-anchor="middle" font-family="Andika" font-weight="700" font-size="21" fill="#1D4ED8">LIVROS</text>`;
  // pescoço e cabeça
  g += sh('M100,-240 Q140,-320 180,-330 L210,-290 Q170,-250 150,-170Z', `url(#${b.id})`);
  g += `<path d="M110,-250 Q140,-320 176,-334" stroke="#3A2A20" stroke-width="14" stroke-linecap="round" fill="none"/>`;
  g += `<g transform="translate(200,-330) rotate(18)">`;
  g += sh('M-34,-40 Q-60,-150 -30,-160 Q-10,-140 -10,-44Z', '#9C958C') + sh('M10,-44 Q20,-150 50,-150 Q66,-120 32,-40Z', '#9C958C');
  g += `<path d="M-30,-54 Q-44,-130 -30,-146 Q-20,-120 -20,-56Z M20,-56 Q28,-128 46,-138 Q52,-110 30,-54Z" fill="#E8B4AE"/>`;
  g += sh('M-50,-10 Q-56,-60 0,-62 Q56,-60 54,-6 Q56,40 40,70 Q20,96 -6,94 Q-36,92 -46,64 Q-52,30 -50,-10Z', `url(#${b.id})`);
  g += sh('M-40,40 Q-42,90 0,94 Q42,92 44,40 Q20,26 0,26 Q-20,26 -40,40Z', '#E8E3DA', 3);
  g += `<ellipse cx="-14" cy="56" rx="6" ry="4" fill="#3A2A20"/><ellipse cx="16" cy="56" rx="6" ry="4" fill="#3A2A20"/><path d="M-12,76 Q0,84 14,76" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  g += aEye(-22, -12, 11) + aEye(22, -12, 11);
  g += `<path d="M-14,-60 q10,-24 24,-6 q6,-20 20,-4" stroke="#3A2A20" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  return g;
}

const ANIMAIS = { caramelo, gatinha, papagaio, jabuti, capivara, mico, galinha, burrinho };
module.exports = { ANIMAIS, aEye };
