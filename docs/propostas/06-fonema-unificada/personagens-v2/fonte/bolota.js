// BOLOTA — filhote de tatu-bola (Tolypeutes tricinctus), aprendiz que erra e aprende.
// Coordenadas: chão em y=0, corpo centrado em x=0, olhando para a direita (vista lateral ¾).
const { P, U, uid, f, rng } = require('./core');

function scutes(clipPath, seed = 2, area = [-150, -200, 300, 190]) {
  const r = rng(seed); let g = '';
  for (let y = area[1] + 10; y < area[1] + area[3]; y += 22) for (let x = area[0] + ((y / 22) % 2) * 11; x < area[0] + area[2]; x += 22) {
    g += `<circle cx="${f(x + (r() - .5) * 4)}" cy="${f(y + (r() - .5) * 4)}" r="${f(5 + r() * 1.5)}" fill="${P.scute}" opacity=".42"/>`;
  }
  const id = uid('sc');
  return `<defs><clipPath id="${id}"><path d="${clipPath}"/></clipPath></defs><g clip-path="url(#${id})">${g}</g>`;
}

function bEye(x, y, type = 'open', look = [0, 0], s = 1) {
  const [lx, ly] = look;
  if (type === 'happy') return `<path d="M${x - 13 * s},${y + 4} Q${x},${y - 14 * s} ${x + 13 * s},${y + 4}" fill="none" stroke="${P.line}" stroke-width="5" stroke-linecap="round"/>`;
  if (type === 'closed') return `<path d="M${x - 13 * s},${y - 2} Q${x},${y + 10 * s} ${x + 13 * s},${y - 2}" fill="none" stroke="${P.line}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (type === 'squint') return `<path d="M${x - 12},${y - 8} L${x + 10},${y} L${x - 12},${y + 8}" fill="none" stroke="${P.line}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const R = (type === 'wide' ? 19 : 16) * s;
  return `<ellipse cx="${x}" cy="${y}" rx="${R * 0.9}" ry="${R}" fill="#2A1A12" stroke="${P.line}" stroke-width="2.5"/>
    <ellipse cx="${x + lx}" cy="${y + 3 + ly}" rx="${R * 0.55}" ry="${R * 0.62}" fill="#4A2E20"/>
    <circle cx="${x + lx + R * 0.32}" cy="${y - R * 0.38 + ly}" r="${R * 0.36}" fill="#fff"/><circle cx="${x + lx - R * 0.3}" cy="${y + R * 0.42 + ly}" r="${R * 0.15}" fill="#fff"/>
    ${type === 'half' ? `<path d="M${x - R - 2},${y - R - 2} H${x + R + 2} V${y - 2} Q${x},${y - 6} ${x - R - 2},${y - 2}Z" fill="${P.bskin}"/><path d="M${x - R},${y - 2} Q${x},${y - 6} ${x + R},${y - 2}" stroke="${P.line}" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}`;
}
function bMouth(t, x, y) {
  switch (t) {
    case 'open': return `<path d="M${x - 14},${y} Q${x},${y + 4} ${x + 12},${y - 3} Q${x + 6},${y + 18} ${x - 6},${y + 14}Z" fill="${P.mouthIn}" stroke="${P.line}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y + 11}" rx="6" ry="3.5" fill="${P.tongue}"/>`;
    case 'o': return `<ellipse cx="${x - 2}" cy="${y + 4}" rx="6" ry="8" fill="${P.mouthIn}" stroke="${P.line}" stroke-width="3"/>`;
    case 'wobbly': return `<path d="M${x - 14},${y + 4} q5,-5 9,0 q5,5 9,0 q4,-4 6,-2" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/>`;
    case 'flat': return `<path d="M${x - 12},${y + 2} Q${x},${y + 4} ${x + 10},${y}" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/>`;
    case 'tongue': return `<path d="M${x - 14},${y} Q${x - 2},${y + 10} ${x + 10},${y - 2}" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/><path d="M${x - 2},${y + 5} q2,9 9,6 q2,-6 -3,-9z" fill="${P.tongue}" stroke="${P.line}" stroke-width="2.4"/>`;
    default: return `<path d="M${x - 15},${y - 1} Q${x - 2},${y + 12} ${x + 12},${y - 4}" fill="none" stroke="${P.line}" stroke-width="3.4" stroke-linecap="round"/>`;
  }
}

const SHELL = 'M-128,-44 C-136,-132 -70,-188 6,-188 C88,-188 140,-136 136,-52 Q138,-36 124,-34 Q90,-26 60,-30 Q30,-22 0,-28 Q-30,-22 -60,-30 Q-96,-24 -118,-30 Q-130,-32 -128,-44Z';

/** o = { eyes, mouth, look, ears:'up'|'down', brow:[l,r], blush, extra:'sweat'|'q'|'spark'|'zzz'|'heart', pose:'stand'|'jump'|'read'|'shy', legs } */
function bolota(o = {}) {
  const pose = o.pose || 'stand';
  if (pose === 'ball') return bolotaBall(o);
  if (pose === 'half') return bolotaHalf(o);
  const lift = pose === 'jump' ? -40 : 0;
  let g = '';
  // pernas
  const legs = pose === 'jump' ? [[-86, -6, -20], [-50, -6, -10], [64, -6, 18], [100, -6, 28]] : [[-86, 0, 0], [-52, 0, 0], [62, 0, 0], [98, 0, 0]];
  legs.forEach(([x, y, a], i) => {
    const c = i % 2 ? P.bskin : P.bskinSh;
    g += `<g transform="translate(${x},${y + lift}) rotate(${a})"><path d="M-15,-44 L15,-44 L16,-8 Q16,4 4,4 L-14,4 Q-18,4 -17,-6Z" fill="${c}" stroke="${P.line}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M2,4 l6,4 M8,3 l7,3 M-4,4 l3,5" stroke="#F4E6D2" stroke-width="3.2" stroke-linecap="round"/></g>`;
  });
  g = `<g>${g}</g><g transform="translate(0,${lift})">`;
  // cauda
  g += `<path d="M-120,-62 Q-160,-60 -176,-86 Q-150,-78 -122,-80Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-140,-66 l4,-10 M-154,-72 l4,-8" stroke="${P.band}" stroke-width="3"/>`;
  // barriga fofa
  g += `<path d="M-118,-36 Q0,-6 128,-40 L120,-30 Q0,-2 -112,-26Z" fill="#F6E2CB" stroke="${P.line}" stroke-width="3" stroke-linejoin="round"/>`;
  g += `<path d="M-90,-26 l-3,8 M-60,-20 l-2,8 M-30,-16 l-1,8 M0,-14 v8 M30,-16 l1,8 M60,-20 l2,8 M90,-26 l3,8" stroke="#E8CDB0" stroke-width="2.6" stroke-linecap="round"/>`;
  // casco
  g += `<path d="${SHELL}" fill="url(#gShell)" stroke="${P.line}" stroke-width="4" stroke-linejoin="round"/>`;
  g += scutes(SHELL, 3);
  const id = uid('sh');
  g += `<defs><clipPath id="${id}"><path d="${SHELL}"/></clipPath></defs><g clip-path="url(#${id})">
    ${[-28, 4, 36].map(x => `<path d="M${x - 14},-200 Q${x - 26},-110 ${x - 14},-20 L${x + 14},-20 Q${x + 2},-110 ${x + 14},-200Z" fill="${P.band}" stroke="${P.line}" stroke-width="3"/>
       ${[-170, -140, -110, -80, -50].map(y => `<rect x="${x - 8 - (y + 110) * 0.02}" y="${y}" width="16" height="10" rx="5" fill="${P.shellHi}" opacity=".45"/>`).join('')}`).join('')}
    <path d="M-100,-150 Q-60,-186 10,-178" fill="none" stroke="#FFF1D6" stroke-width="16" stroke-linecap="round" opacity=".45" filter="url(#soft2)"/>
    <path d="M140,-120 Q120,-40 60,-26 L150,-26Z" fill="${P.shellSh}" opacity=".35" filter="url(#soft)"/></g>
    <path d="M-124,-40 Q-90,-28 -60,-34 Q-30,-26 0,-32 Q30,-26 60,-34 Q92,-30 128,-38" fill="none" stroke="${P.shellSh}" stroke-width="3" opacity=".7"/>`;
  // cabeça
  const hx = 150, hy = -78;
  g += `<g transform="translate(${hx - 40},${hy + 30}) scale(1.28) translate(${-(hx - 40)},${-(hy + 30)})">`;
  const ears = o.ears === 'down'
    ? `<path d="M${hx - 34},${hy - 30} q-30,-4 -40,14 q22,10 40,-2z" fill="${P.bskin}" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/><path d="M${hx - 38},${hy - 26} q-18,0 -26,8" stroke="${P.bear}" stroke-width="5" stroke-linecap="round" fill="none"/>`
    : `<ellipse cx="${hx - 30}" cy="${hy - 50}" rx="13" ry="22" transform="rotate(-24 ${hx - 30} ${hy - 50})" fill="${P.bskin}" stroke="${P.line}" stroke-width="3.4"/><ellipse cx="${hx - 29}" cy="${hy - 48}" rx="6" ry="13" transform="rotate(-24 ${hx - 29} ${hy - 48})" fill="${P.bear}"/>`;
  g += ears;
  g += `<path d="M${hx - 48},${hy - 8} C${hx - 50},${hy - 52} ${hx - 6},${hy - 58} ${hx + 26},${hy - 34} C${hx + 48},${hy - 18} ${hx + 66},${hy + 2} ${hx + 62},${hy + 18} C${hx + 58},${hy + 32} ${hx + 30},${hy + 40} ${hx - 6},${hy + 38} C${hx - 34},${hy + 36} ${hx - 48},${hy + 22} ${hx - 48},${hy - 8}Z" fill="url(#gBskin)" stroke="${P.line}" stroke-width="3.8" stroke-linejoin="round"/>`;
  // escudo da cabeça
  g += `<path d="M${hx - 40},${hy - 26} Q${hx - 22},${hy - 58} ${hx + 10},${hy - 46} Q${hx + 32},${hy - 36} ${hx + 36},${hy - 22} Q${hx + 6},${hy - 34} ${hx - 40},${hy - 26}Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3.2" stroke-linejoin="round"/><circle cx="${hx - 12}" cy="${hy - 40}" r="4" fill="${P.scute}" opacity=".7"/><circle cx="${hx + 6}" cy="${hy - 38}" r="3.5" fill="${P.scute}" opacity=".7"/>`;
  // focinho
  g += `<ellipse cx="${hx + 60}" cy="${hy + 10}" rx="9" ry="7" fill="${P.bear}" stroke="${P.line}" stroke-width="3"/><ellipse cx="${hx + 58}" cy="${hy + 7}" rx="3" ry="2" fill="#fff" opacity=".7"/>`;
  g += `<ellipse cx="${hx + 18}" cy="${hy + 20}" rx="12" ry="7" fill="${P.blush}" opacity="${0.4 * (o.blush ?? 1)}" filter="url(#soft2)"/>`;
  g += bEye(hx + 8, hy - 8, o.eyes || 'open', o.look || [2, 0]);
  if (o.brow) g += `<path transform="rotate(${o.brow} ${hx + 8} ${hy - 34})" d="M${hx - 4},${hy - 32} Q${hx + 8},${hy - 38} ${hx + 20},${hy - 32}" stroke="${P.line}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g += bMouth(o.mouth || 'smile', hx + 36, hy + 24);
  // patinha da frente segurando caderninho
  if (pose === 'read') g += `<g transform="translate(${hx + 40},${hy - 20}) rotate(-12)"><rect x="-6" y="-40" width="62" height="76" rx="6" fill="${P.ipe}" stroke="${P.line}" stroke-width="3.6"/><rect x="-6" y="-40" width="12" height="76" rx="4" fill="${P.ipeSh}" stroke="${P.line}" stroke-width="3"/><path d="M16,-22 h30 M16,-10 h24 M16,2 h28" stroke="${P.line}" stroke-width="3" stroke-linecap="round" opacity=".6"/><circle cx="38" cy="22" r="7" fill="${P.ok}"/></g>
    <ellipse cx="${hx + 34}" cy="${hy + 26}" rx="12" ry="10" fill="${P.bskin}" stroke="${P.line}" stroke-width="3"/>`;
  g += '</g></g>';
  g += extra(o.extra, hx + 10, hy + lift - 20);
  return `<g>${g}</g>`;
}
function extra(t, hx, hy) {
  switch (t) {
    case 'sweat': return `<path d="M${hx - 18},${hy - 70} q-10,14 0,18 q10,-4 0,-18z" fill="#9FD3F0" stroke="${P.line}" stroke-width="2.6"/>`;
    case 'q': return `<text x="${hx + 30}" y="${hy - 70}" font-family="Fredoka" font-weight="700" font-size="46" fill="${P.focus}">?</text>`;
    case 'spark': return `<g transform="translate(${hx + 50},${hy - 82})"><path d="M0,-24 L6,-6 L24,0 L6,6 L0,24 L-6,6 L-24,0 L-6,-6Z" fill="${P.ipe}" stroke="${P.line}" stroke-width="2.6" stroke-linejoin="round"/></g><g transform="translate(${hx + 84},${hy - 50}) scale(.5)"><path d="M0,-24 L6,-6 L24,0 L6,6 L0,24 L-6,6 L-24,0 L-6,-6Z" fill="${P.ipe}" stroke="${P.line}" stroke-width="4" stroke-linejoin="round"/></g>`;
    case 'zzz': return `<text x="${hx + 20}" y="${hy - 60}" font-family="Fredoka" font-weight="600" font-size="30" fill="${P.focus}" opacity=".8">z<tspan dy="-14" font-size="38">Z</tspan></text>`;
    case 'heart': return `<path transform="translate(${hx + 50},${hy - 74})" d="M0,8 C-14,-4 -12,-18 -2,-16 Q0,-15 0,-12 Q0,-15 2,-16 C12,-18 14,-4 0,8Z" fill="${P.vowel}" stroke="${P.line}" stroke-width="2.6"/>`;
    case 'bulb': return `<g transform="translate(${hx + 40},${hy - 92})"><circle r="17" fill="${P.ipeHi}" stroke="${P.line}" stroke-width="3"/><rect x="-8" y="14" width="16" height="10" rx="3" fill="#C9C2B3" stroke="${P.line}" stroke-width="2.6"/>${[0, 45, 90, 135, 180].map(a => `<path transform="rotate(${a - 90})" d="M0,-24 v-9" stroke="${P.ipeSh}" stroke-width="3.4" stroke-linecap="round"/>`).join('')}</g>`;
    default: return '';
  }
}

// rolando como bola
function bolotaBall(o = {}) {
  const R = 104, cy = -R;
  let g = '';
  if (o.motion !== false) g += `<path d="M-180,-150 h-60 M-170,-100 h-90 M-180,-50 h-60" stroke="${P.shellSh}" stroke-width="8" stroke-linecap="round" opacity=".35"/>
    <circle cx="-110" cy="-8" r="16" fill="#E8D8C0"/><circle cx="-136" cy="-14" r="11" fill="#EFE3D0"/><circle cx="-90" cy="-4" r="10" fill="#E8D8C0"/>`;
  const rot = o.rot ?? -18;
  g += `<g transform="translate(0,${cy}) rotate(${rot})">`;
  g += `<circle r="${R}" fill="url(#gShell)" stroke="${P.line}" stroke-width="4"/>`;
  g += scutes(`M${-R},0 a${R},${R} 0 1 0 ${2 * R},0 a${R},${R} 0 1 0 ${-2 * R},0`, 5, [-R, -R, 2 * R, 2 * R]);
  const id = uid('bl');
  g += `<defs><clipPath id="${id}"><circle r="${R}"/></clipPath></defs><g clip-path="url(#${id})">
    ${[-34, 0, 34].map(x => `<path d="M${x - 13},${-R - 4} Q${x - 40},0 ${x - 13},${R + 4} L${x + 13},${R + 4} Q${x - 14},0 ${x + 13},${-R - 4}Z" fill="${P.band}" stroke="${P.line}" stroke-width="3"/>`).join('')}
    <path d="M-70,-60 Q-40,-96 10,-94" fill="none" stroke="#FFF1D6" stroke-width="16" stroke-linecap="round" opacity=".45" filter="url(#soft2)"/>
    <circle r="${R}" fill="none" stroke="${P.shellSh}" stroke-width="30" opacity=".25" transform="translate(16,16)"/></g>`;
  // escudos da cabeça e da cauda fechando a bola + olhinhos espiando
  g += `<path d="M${R - 30},-56 Q${R + 6},-20 ${R - 6},26 L${R - 40},0Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M${R - 6},26 Q${R - 20},60 ${R - 52},70 L${R - 40},0Z" fill="${P.band}" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M${R - 40},0 L${R - 6},26" stroke="#2A1A12" stroke-width="12" stroke-linecap="round"/>`;
  g += `</g>`;
  if (o.peek !== false) g += `<g transform="translate(0,${cy}) rotate(${rot})"><circle cx="${R - 30}" cy="9" r="5" fill="#fff"/><circle cx="${R - 14}" cy="19" r="5" fill="#fff"/><circle cx="${R - 29}" cy="10" r="2.3" fill="#2A1A12"/><circle cx="${R - 13}" cy="20" r="2.3" fill="#2A1A12"/></g>`;
  return `<g>${g}</g>`;
}
// meio enroladinho (tímido / se protegendo)
function bolotaHalf(o = {}) {
  let g = '';
  g += `<g transform="translate(0,-6)">`;
  const S2 = 'M-118,-30 C-130,-140 -40,-196 30,-180 C100,-166 140,-110 128,-44 Q120,-24 96,-24 Q40,-14 -20,-20 Q-80,-18 -118,-30Z';
  g += `<path d="${S2}" fill="url(#gShell)" stroke="${P.line}" stroke-width="4"/>` + scutes(S2, 8);
  const id = uid('hf');
  g += `<defs><clipPath id="${id}"><path d="${S2}"/></clipPath></defs><g clip-path="url(#${id})">${[-20, 12, 44].map(x => `<path d="M${x - 14},-200 Q${x - 30},-100 ${x - 14},0 L${x + 14},0 Q${x - 2},-100 ${x + 14},-200Z" fill="${P.band}" stroke="${P.line}" stroke-width="3"/>`).join('')}
    <path d="M-90,-140 Q-50,-180 20,-172" fill="none" stroke="#FFF1D6" stroke-width="16" stroke-linecap="round" opacity=".45" filter="url(#soft2)"/></g>`;
  // cabeça encolhida espiando
  g += `<path d="M70,-24 C60,-70 110,-90 136,-64 C156,-44 150,-14 120,-10 Q90,-8 70,-24Z" fill="url(#gBskin)" stroke="${P.line}" stroke-width="3.6"/>
    <path d="M76,-58 Q100,-92 134,-70 Q110,-70 76,-58Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3"/>`;
  g += bEye(112, -42, o.eyes || 'open', o.look || [3, 0], 0.8);
  g += `<ellipse cx="146" cy="-28" rx="7" ry="5.5" fill="${P.bear}" stroke="${P.line}" stroke-width="2.6"/><ellipse cx="124" cy="-20" rx="9" ry="5" fill="${P.blush}" opacity=".4"/>`;
  g += bMouth(o.mouth || 'wobbly', 132, -18).replace(/stroke-width="3.4"/g, 'stroke-width="2.8"');
  g += `<ellipse cx="-80" cy="-10" rx="18" ry="10" fill="${P.bskinSh}" stroke="${P.line}" stroke-width="3"/>`;
  g += '</g>' + extra(o.extra, 100, -40);
  return `<g>${g}</g>`;
}

// vista de frente (para a folha-modelo)
function bolotaFront() {
  let g = '';
  g += `<ellipse cx="0" cy="-104" rx="150" ry="98" fill="url(#gShell)" stroke="${P.line}" stroke-width="4"/>`;
  g += scutes('M-150,-104 a150,98 0 1 0 300,0 a150,98 0 1 0 -300,0', 9, [-150, -202, 300, 196]);
  g += `<path d="M-146,-80 Q0,-50 146,-80" fill="none" stroke="${P.band}" stroke-width="10"/><path d="M-130,-150 Q-60,-196 30,-196" fill="none" stroke="#FFF1D6" stroke-width="14" stroke-linecap="round" opacity=".45" filter="url(#soft2)"/>`;
  for (const x of [-60, 60]) g += `<path d="M${x - 16},-36 h32 v34 q0,6 -6,6 h-20 q-6,0 -6,-6z" fill="${P.bskin}" stroke="${P.line}" stroke-width="3.5"/><path d="M${x - 8},4 v6 M${x},4 v7 M${x + 8},4 v6" stroke="#F4E6D2" stroke-width="3" stroke-linecap="round"/>`;
  g += `<g transform="translate(0,-40) scale(1.32) translate(0,40)">`;
  g += `<ellipse cx="-44" cy="-150" rx="13" ry="22" transform="rotate(-20 -44 -150)" fill="${P.bskin}" stroke="${P.line}" stroke-width="3.4"/><ellipse cx="44" cy="-150" rx="13" ry="22" transform="rotate(20 44 -150)" fill="${P.bskin}" stroke="${P.line}" stroke-width="3.4"/>
    <ellipse cx="-44" cy="-148" rx="6" ry="13" transform="rotate(-20 -44 -148)" fill="${P.bear}"/><ellipse cx="44" cy="-148" rx="6" ry="13" transform="rotate(20 44 -148)" fill="${P.bear}"/>`;
  g += `<path d="M-52,-90 C-56,-136 -24,-146 0,-146 C24,-146 56,-136 52,-90 C50,-58 26,-42 0,-42 C-26,-42 -50,-58 -52,-90Z" fill="url(#gBskin)" stroke="${P.line}" stroke-width="3.8"/>`;
  g += `<path d="M-40,-118 Q0,-160 40,-118 Q0,-130 -40,-118Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3"/>`;
  g += bEye(-22, -96, 'open', [1, 0], 0.85) + bEye(22, -96, 'open', [-1, 0], 0.85);
  g += `<ellipse cx="0" cy="-70" rx="9" ry="7" fill="${P.bear}" stroke="${P.line}" stroke-width="3"/><path d="M-10,-58 Q0,-50 10,-58" stroke="${P.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="-34" cy="-70" rx="9" ry="5" fill="${P.blush}" opacity=".4"/><ellipse cx="34" cy="-70" rx="9" ry="5" fill="${P.blush}" opacity=".4"/></g>`;
  return `<g>${g}</g>`;
}
// vista de trás
function bolotaBack() {
  let g = '';
  for (const x of [-60, 60]) g += `<path d="M${x - 16},-36 h32 v34 q0,6 -6,6 h-20 q-6,0 -6,-6z" fill="${P.bskinSh}" stroke="${P.line}" stroke-width="3.5"/>`;
  g += `<ellipse cx="0" cy="-104" rx="150" ry="98" fill="url(#gShell)" stroke="${P.line}" stroke-width="4"/>`;
  g += scutes('M-150,-104 a150,98 0 1 0 300,0 a150,98 0 1 0 -300,0', 12, [-150, -202, 300, 196]);
  g += `<path d="M-146,-80 Q0,-50 146,-80" fill="none" stroke="${P.band}" stroke-width="10"/>`;
  g += `<path d="M-16,-40 Q0,-10 16,-40 Q0,-50 -16,-40Z" fill="url(#gShell)" stroke="${P.line}" stroke-width="3.4"/><path d="M-130,-150 Q-60,-196 30,-196" fill="none" stroke="#FFF1D6" stroke-width="14" stroke-linecap="round" opacity=".45" filter="url(#soft2)"/>`;
  g += `<ellipse cx="-30" cy="-196" rx="11" ry="18" transform="rotate(-20 -30 -196)" fill="${P.bskinSh}" stroke="${P.line}" stroke-width="3.2"/><ellipse cx="30" cy="-196" rx="11" ry="18" transform="rotate(20 30 -196)" fill="${P.bskinSh}" stroke="${P.line}" stroke-width="3.2"/>`;
  return `<g>${g}</g>`;
}

module.exports = { bolota, bolotaBall, bolotaHalf, bolotaFront, bolotaBack };
