// Elenco da vila — gerador de pessoas (mesma linguagem visual da Sofia)
const { P, U, limb, uid, f, rng } = require('./core');
const { arm, eye, FACE } = require('./sofia');
const { mouthExpr } = require('./mouth');

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k)));
  return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function grad(c) {
  const id = uid('pg');
  return { id, def: `<radialGradient id="${id}" cx=".42" cy=".36" r=".8"><stop offset="0" stop-color="${shade(c, 1.12)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, .82)}"/></radialGradient>` };
}
function lgrad(c) {
  const id = uid('lg');
  return { id, def: `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 1.15)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, .8)}"/></linearGradient>` };
}
function curls(c, pts, seed, hi) {
  let s = ''; pts.forEach(([x, y, r]) => s += `<circle cx="${x}" cy="${y}" r="${r}"/>`);
  const R = rng(seed); let t = '';
  pts.forEach(([x, y, r]) => { const k = r * .45; t += `<path transform="translate(${x + (R() - .5) * r * .6},${y + (R() - .5) * r * .6}) rotate(${f(R() * 360)})" d="M${-k},0 A${k},${k} 0 0 1 ${f(k * .8)},${f(-k * .5)}" fill="none" stroke="${hi}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`; });
  const id = uid('cl');
  return U(s, c, 3.6) + `<defs><clipPath id="${id}">${s}</clipPath></defs><g clip-path="url(#${id})">${t}</g>`;
}

// ---- cabelos (back = atrás do rosto, front = por cima) ----
const HAIR = {
  vovo: c => ({
    back: curls('#CFC8BE', [[0, 150, 120], [-100, 200, 50], [100, 200, 50], [-118, 250, 34], [118, 250, 34], [0, 52, 54]], 4, '#FFFFFF'),
    front: curls('#DDD7CE', [[-80, 160, 36], [-40, 142, 38], [0, 138, 38], [40, 142, 38], [80, 160, 36], [-108, 196, 26], [108, 196, 26]], 6, '#FFFFFF'),
  }),
  fade: c => ({
    back: '',
    front: `<path d="M-120,236 Q-130,140 0,124 Q130,140 120,236 Q110,180 70,168 Q0,160 -70,168 Q-110,180 -120,236Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-60,150 q60,-14 120,0" stroke="#4A4040" stroke-width="5" opacity=".5" fill="none"/>`,
  }),
  menino: c => ({
    back: `<path d="M-130,250 Q-140,120 0,112 Q140,120 130,250Z" fill="${c}" stroke="${P.line}" stroke-width="3.6"/>`,
    front: `<path d="M-128,232 Q-130,130 0,118 Q130,126 128,226 L108,192 L96,214 L80,178 L60,206 L40,170 L18,200 L0,168 L-22,198 L-44,170 L-62,204 L-84,178 L-98,212 L-110,190Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-70,140 q50,-16 100,-8" stroke="${shade(c, 1.4)}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".6"/>`,
  }),
  curto: c => ({
    back: '',
    front: `<path d="M-124,240 Q-132,128 0,118 Q132,128 124,240 Q118,190 96,178 Q20,176 -20,160 Q-60,186 -100,180 Q-118,196 -124,240Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-100,190 q-8,20 -6,40 M100,190 q8,20 6,40" stroke="#BDB6AE" stroke-width="6" stroke-linecap="round"/>`,
  }),
  liso: c => ({
    back: `<path d="M-140,240 Q-150,110 0,104 Q150,110 140,240 L150,520 Q0,548 -150,520Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-110,300 L-114,500 M110,300 L114,500 M-80,420 v90 M80,420 v90" stroke="${shade(c, 1.5)}" stroke-width="3" opacity=".6"/>`,
    front: `<path d="M-132,250 Q-140,118 0,110 Q140,118 132,250 L120,250 L116,196 L-116,196 L-120,250Z" fill="${c}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-116,196 H116" stroke="${P.line}" stroke-width="3.6"/><path d="M-60,134 q60,-14 110,2" stroke="${shade(c, 1.6)}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".5"/>`,
  }),
  locs: c => {
    let locs = '';
    for (let i = 0; i < 8; i++) { const x = -110 + i * 6; locs += `<path d="M${x},220 q-8,80 ${-4 + i},170" stroke="${P.line}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M${x},220 q-8,80 ${-4 + i},170" stroke="${c}" stroke-width="10" stroke-linecap="round" fill="none"/>`; }
    return {
      back: locs + curls(c, [[0, 40, 66], [-40, 60, 40], [40, 60, 40]], 9, shade(c, 2.2)),
      front: `<path d="M-126,236 Q-132,124 0,116 Q132,124 126,236 Q116,170 0,160 Q-116,170 -126,236Z" fill="${c}" stroke="${P.line}" stroke-width="3.6"/>${[-80, -40, 0, 40, 80].map(x => `<path d="M${x},${126 + Math.abs(x) * .2} q${x * .1},20 ${x * .2},40" stroke="${shade(c, 2.4)}" stroke-width="3" fill="none" opacity=".7"/>`).join('')}
        <path d="M-118,150 Q0,96 118,150 L114,176 Q0,124 -114,176Z" fill="${P.focus}" stroke="${P.line}" stroke-width="3.4"/><path d="M-60,128 l10,14 M0,118 l10,14 M60,128 l10,14" stroke="${P.ipe}" stroke-width="4" stroke-linecap="round"/>`,
    };
  },
};

/** pessoa de corpo inteiro; o = {skin, hair, hairColor, top, topColor, bottom, bottomColor, shoe, headScale, expr, armL, armR, extras, seated, glasses, beard, wrinkles, hearingAid} */
function person(o) {
  const skin = o.skin, hs = o.headScale ?? 0.8;
  const fg = grad(skin), tg = lgrad(o.topColor), bg = lgrad(o.bottomColor || '#3D4A6B');
  let d = `<defs>${fg.def}${tg.def}${bg.def}</defs>`;
  const H = (HAIR[o.hair] || HAIR.curto)(o.hairColor || '#2A1A12');
  const headY = o.seated ? 150 : 0;
  // cabeça
  let head = H.back;
  head += `<ellipse cx="-127" cy="276" rx="17" ry="23" fill="${skin}" stroke="${P.line}" stroke-width="3.6"/><ellipse cx="127" cy="276" rx="17" ry="23" fill="${skin}" stroke="${P.line}" stroke-width="3.6"/>`;
  if (o.hearingAid) head += `<path d="M136,252 q22,4 18,34 q-4,16 -16,14" fill="#2F7BE0" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/><circle cx="148" cy="270" r="4" fill="${P.ipe}"/><path d="M138,298 q-8,-6 -10,-16" stroke="#9FD0F6" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  head += `<path d="${o.faceShape || FACE}" fill="url(#${fg.id})" stroke="${P.line}" stroke-width="4"/>`;
  const e = o.expr || { eyes: 'open', mouth: 'smile' };
  head += `<ellipse cx="-80" cy="314" rx="22" ry="12" fill="${P.blush}" opacity=".3" filter="url(#soft2)"/><ellipse cx="80" cy="314" rx="22" ry="12" fill="${P.blush}" opacity=".3" filter="url(#soft2)"/>`;
  head += `<g>${eye(-46, 262, e.eyes || 'open', e.look || [0, 0], -1)}${eye(46, 262, e.eyes || 'open', e.look || [0, 0], 1)}</g>`;
  head += `<path d="M-66,${210 + (e.by || 0)} Q-46,198 -26,210 M26,210 Q46,198 66,${210 + (e.by || 0)}" fill="none" stroke="${o.browColor || o.hairColor || '#2A1A12'}" stroke-width="7.5" stroke-linecap="round"/>`;
  head += `<path d="M-7,300 Q0,308 8,299" fill="none" stroke="${shade(skin, .7)}" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="-2" cy="290" rx="6" ry="4" fill="${shade(skin, 1.15)}"/>`;
  if (o.wrinkles) head += `<path d="M-84,262 l-12,-4 M-84,272 l-12,4 M84,262 l12,-4 M84,272 l12,4 M-40,322 q-8,10 -4,22 M40,322 q8,10 4,22" stroke="${shade(skin, .7)}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  if (o.beard) head += `<path d="M-112,280 Q-110,388 0,394 Q110,388 112,280 Q100,340 60,352 Q0,330 -60,352 Q-100,340 -112,280Z" fill="${o.hairColor}" stroke="${P.line}" stroke-width="3" opacity=".95"/>`;
  if (o.mustache) head += `<path d="M-30,322 Q-14,310 0,318 Q14,310 30,322 Q16,330 0,324 Q-16,330 -30,322Z" fill="${o.mustache}" stroke="${P.line}" stroke-width="2.6"/>`;
  head += `<g transform="translate(0,338)">${mouthExpr(e.mouth || 'smile')}</g>`;
  head += H.front;
  if (o.glasses) head += `<g fill="none" stroke="${o.glasses}" stroke-width="5"><circle cx="-46" cy="262" r="34" fill="#fff" fill-opacity=".12"/><circle cx="46" cy="262" r="34" fill="#fff" fill-opacity=".12"/><path d="M-12,258 q12,-8 24,0 M-80,256 l-44,-6 M80,256 l44,-6"/></g>`;
  if (o.goggles) head += `<g transform="translate(0,150)"><rect x="-120" y="-10" width="240" height="16" rx="8" fill="#5B5A72" stroke="${P.line}" stroke-width="3"/><circle cx="-44" cy="-2" r="30" fill="#9FD3F0" stroke="${P.line}" stroke-width="5"/><circle cx="44" cy="-2" r="30" fill="#9FD3F0" stroke="${P.line}" stroke-width="5"/><path d="M-56,-14 q8,-6 16,-2 M32,-14 q8,-6 16,-2" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></g>`;
  if (o.hat === 'padeiro') head += `<g><path d="M-100,150 Q-130,60 -60,56 Q-40,10 0,16 Q40,10 60,56 Q130,60 100,150Z" fill="#FFFDF8" stroke="${P.line}" stroke-width="3.8"/><rect x="-104" y="136" width="208" height="34" rx="12" fill="#F2EBDD" stroke="${P.line}" stroke-width="3.6"/><path d="M-40,60 q4,40 0,76 M30,56 q-4,40 0,80" stroke="#E6DCCB" stroke-width="4" fill="none"/></g>`;
  if (o.earrings) head += `<circle cx="-127" cy="302" r="6" fill="${o.earrings}" stroke="${P.line}" stroke-width="2"/><circle cx="127" cy="302" r="6" fill="${o.earrings}" stroke="${P.line}" stroke-width="2"/>`;

  // corpo
  let body = '';
  const T = `M-58,390 C-82,392 -104,402 -112,426 L-106,508 C-106,560 -102,598 -98,624 L98,624 C102,598 106,560 106,508 L112,426 C104,402 82,392 58,390 Z`;
  const legs = (sk, sock, shoe) => {
    let g = '';
    for (const s of [-1, 1]) {
      const L = [[s * 44, 690], [s * 46, 812], [s * 48, 922]];
      g += limb(L, o.bottom === 'pants' ? 50 : 40, o.bottom === 'pants' ? `url(#${bg.id})` : sk);
      g += `<g transform="translate(${s * 52},946)"><path d="M-40,22 Q-46,-12 -18,-20 L18,-20 Q46,-12 40,22Z" fill="${shoe}" stroke="${P.line}" stroke-width="3.6"/><rect x="-44" y="14" width="88" height="13" rx="6.5" fill="${shade(shoe, .7)}" stroke="${P.line}" stroke-width="3.2"/><ellipse cx="${-s * 20}" cy="0" rx="9" ry="5" fill="#fff" opacity=".35"/></g>`;
    }
    return g;
  };
  if (o.seated) body += seatedBody(o, skin, tg, bg);
  else {
    if (o.bottom === 'skirt' || o.bottom === 'dress') body += legs(skin, null, o.shoe || '#7A4B2E');
    else body += legs(skin, null, o.shoe || '#FBF4E8');
    if (o.bottom === 'skirt') body += `<path d="M-100,596 L100,596 L132,780 Q0,800 -132,780Z" fill="url(#${bg.id})" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-60,610 L-76,780 M0,612 V792 M60,610 L76,780" stroke="${shade(o.bottomColor, .8)}" stroke-width="2.6"/>`;
    else if (o.bottom === 'dress') body += `<path d="M-100,560 L100,560 L140,800 Q0,820 -140,800Z" fill="url(#${tg.id})" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>${o.pattern || ''}`;
    else if (o.bottom === 'pants') body += `<path d="M-100,596 L100,596 L104,700 L14,706 L0,660 L-14,706 L-104,700Z" fill="url(#${bg.id})" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>`;
    else body += `<path d="M-98,596 L98,596 L106,712 L14,720 L2,672 L-10,720 L-106,712 Z" fill="url(#${bg.id})" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/>`;
    body += `<rect x="-24" y="356" width="48" height="56" fill="${shade(skin, .85)}" stroke="${P.line}" stroke-width="3.6"/>`;
    body += `<path d="${T}" fill="url(#${tg.id})" stroke="${P.line}" stroke-width="3.8" stroke-linejoin="round"/>`;
    body += `<path d="M-40,392 Q0,428 40,392" fill="none" stroke="${shade(o.topColor, .75)}" stroke-width="9" stroke-linecap="round"/>`;
    if (o.top === 'stripes') body += `<g clip-path="url(#${uid('x')})"></g>` + [440, 490, 540, 590].map(y => `<path d="M-108,${y} H108" stroke="${o.stripe || '#fff'}" stroke-width="16" opacity=".85"/>`).join('') + `<path d="${T}" fill="none" stroke="${P.line}" stroke-width="3.8"/>`;
    if (o.top === 'cardigan') body += `<path d="M-30,396 L-14,624 M30,396 L14,624" stroke="${P.line}" stroke-width="3"/><path d="M-30,396 L-14,624 L14,624 L30,396 Q0,430 -30,396Z" fill="${o.inner || '#FFF8EC'}" stroke="${P.line}" stroke-width="3"/>${[460, 520, 580].map(y => `<circle cx="-22" cy="${y}" r="5" fill="${P.ipe}" stroke="${P.line}" stroke-width="1.6"/>`).join('')}`;
    if (o.top === 'apron') body += `<path d="M-60,420 L60,420 L74,700 Q0,716 -74,700Z" fill="#FFFDF8" stroke="${P.line}" stroke-width="3.6"/><path d="M-60,420 Q-50,396 -30,394 M60,420 Q50,396 30,394" stroke="#FFFDF8" stroke-width="8" fill="none"/><rect x="-30" y="560" width="60" height="40" rx="8" fill="#F2EBDD" stroke="${P.line}" stroke-width="2.6"/><text x="0" y="590" text-anchor="middle" font-family="Andika" font-weight="700" font-size="26" fill="${P.vowel}">PÃO</text>`;
    if (o.top === 'overall') body += `<path d="M-70,470 L70,470 L76,640 L100,640 L104,700 L14,706 L0,660 L-14,706 L-104,700 L-100,640 L-76,640Z" fill="${o.overall}" stroke="${P.line}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-70,470 L-64,400 M70,470 L64,400" stroke="${o.overall}" stroke-width="16"/><path d="M-70,470 L-64,400 M70,470 L64,400" stroke="${P.line}" stroke-width="3" opacity=".6"/><rect x="-36" y="500" width="72" height="50" rx="8" fill="${shade(o.overall, .85)}" stroke="${P.line}" stroke-width="3"/><path d="M-20,512 v26 M-6,508 v30" stroke="#C9C2B3" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="524" r="9" fill="${P.ipe}" stroke="${P.line}" stroke-width="2.4"/>`;
    if (o.badge) body += o.badge;
  }
  const armL = { t: [-132, 640], hand: 'relax', ...(o.armL || {}) }, armR = { t: [132, 640], hand: 'relax', ...(o.armR || {}) };
  const sleeve = o.sleeve === false ? false : undefined;
  const ao = { skin, sleeveColor: `url(#${tg.id})`, hemColor: shade(o.topColor, .75), sleeve };
  const yoff = o.seated ? 0 : 0;
  let arms = arm([-98, 430 + yoff], armL.t, -1, { ...ao, ...armL }) + arm([98, 430 + yoff], armR.t, 1, { ...ao, ...armR });
  const hsY = 380;
  const g = `${d}${o.behind || ''}${o.seated ? '' : ''}${body}<g transform="translate(0,${hsY}) scale(${hs}) translate(0,${-hsY + (o.seated ? 0 : 0)})">${head}</g>${arms}${o.front || ''}`;
  return `<g transform="translate(0,${o.seated ? 0 : 0})">${g}</g>`;
}

function seatedBody(o, skin, tg, bg) {
  // cadeira de rodas esportiva (vista frontal ¾) + corpo sentado
  let g = '';
  const wheel = (x) => `<g transform="translate(${x},760)"><ellipse rx="44" ry="176" fill="#2B2A4C" stroke="${P.line}" stroke-width="4"/><ellipse rx="34" ry="160" fill="none" stroke="#8C93AD" stroke-width="5"/><ellipse rx="26" ry="150" fill="none" stroke="#CFD5E6" stroke-width="2" stroke-dasharray="3 18"/><ellipse rx="10" ry="16" fill="#CFD5E6" stroke="${P.line}" stroke-width="3"/></g>`;
  g += `<rect x="-120" y="440" width="240" height="250" rx="20" fill="#3B4A7A" stroke="${P.line}" stroke-width="3.6"/><path d="M-120,470 H120" stroke="#5368A8" stroke-width="6"/>`;
  g += wheel(-150) + wheel(150);
  g += `<rect x="-24" y="356" width="48" height="56" fill="${shade(skin, .85)}" stroke="${P.line}" stroke-width="3.6"/>`;
  g += `<path d="M-108,690 L108,690 L104,780 L-104,780Z" fill="url(#${bg.id})" stroke="${P.line}" stroke-width="3.6"/>`;
  g += limb([[-50, 770], [-52, 900]], 50, `url(#${bg.id})`) + limb([[50, 770], [52, 900]], 50, `url(#${bg.id})`);
  for (const s of [-1, 1]) g += `<g transform="translate(${s * 54},930)"><path d="M-36,18 Q-42,-12 -16,-18 L16,-18 Q42,-12 36,18Z" fill="${o.shoe || '#F4B400'}" stroke="${P.line}" stroke-width="3.6"/><rect x="-40" y="12" width="80" height="12" rx="6" fill="${shade(o.shoe || '#F4B400', .7)}" stroke="${P.line}" stroke-width="3"/></g>`;
  g += `<rect x="-110" y="952" width="220" height="16" rx="8" fill="#8C93AD" stroke="${P.line}" stroke-width="3.4"/><circle cx="-100" cy="990" r="14" fill="#2B2A4C" stroke="${P.line}" stroke-width="3"/><circle cx="100" cy="990" r="14" fill="#2B2A4C" stroke="${P.line}" stroke-width="3"/>`;
  const T = `M-58,390 C-82,392 -104,402 -112,426 L-106,508 C-106,560 -102,620 -104,700 L104,700 C102,620 106,560 106,508 L112,426 C104,402 82,392 58,390 Z`;
  g += `<path d="${T}" fill="url(#${tg.id})" stroke="${P.line}" stroke-width="3.8" stroke-linejoin="round"/><path d="M-40,392 Q0,428 40,392" fill="none" stroke="${shade(o.topColor, .75)}" stroke-width="9" stroke-linecap="round"/>`;
  if (o.badge) g += o.badge;
  return g;
}

// robô da inventora
function robo(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0,-150 v-24" stroke="${P.line}" stroke-width="5"/><circle cx="0" cy="-180" r="10" fill="${P.vowel}" stroke="${P.line}" stroke-width="3"/>
    <rect x="-70" y="-150" width="140" height="100" rx="30" fill="#DDE6F3" stroke="${P.line}" stroke-width="4"/><rect x="-54" y="-136" width="108" height="72" rx="20" fill="#2B2A4C"/>
    <text x="0" y="-84" text-anchor="middle" font-family="Andika" font-weight="700" font-size="50" fill="#7EE0B0">A</text>
    <rect x="-50" y="-44" width="100" height="74" rx="18" fill="#BFCBE0" stroke="${P.line}" stroke-width="4"/><circle cx="0" cy="-8" r="12" fill="${P.ipe}" stroke="${P.line}" stroke-width="3"/>
    <path d="M-50,-20 q-30,10 -36,36 M50,-20 q30,10 36,-20" stroke="${P.line}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M-50,-20 q-30,10 -36,36 M50,-20 q30,10 36,-20" stroke="#BFCBE0" stroke-width="6" stroke-linecap="round" fill="none"/>
    <rect x="-44" y="30" width="88" height="20" rx="10" fill="#5B5A72" stroke="${P.line}" stroke-width="3"/><circle cx="-30" cy="56" r="12" fill="#2B2A4C" stroke="${P.line}" stroke-width="3"/><circle cx="30" cy="56" r="12" fill="#2B2A4C" stroke="${P.line}" stroke-width="3"/></g>`;
}
function livros(x, y, s = 1) {
  const cs = [P.cons, P.vowel, P.ok, P.ipe, P.focus];
  return `<g transform="translate(${x},${y}) scale(${s})">${cs.map((c, i) => `<rect x="${-56 + (i % 2) * 6}" y="${-i * 24}" width="112" height="22" rx="4" fill="${c}" stroke="${P.line}" stroke-width="3"/><path d="M${-46 + (i % 2) * 6},${-i * 24 + 11} h90" stroke="#fff" stroke-width="2" opacity=".5"/>`).join('')}</g>`;
}
function bandeja(x, y, s = 1) {
  let p = ''; for (let i = 0; i < 4; i++) p += `<ellipse cx="${-48 + i * 32}" cy="-14" rx="18" ry="12" fill="#E3A65A" stroke="${P.line}" stroke-width="2.6"/><path d="M${-56 + i * 32},-16 q8,-6 16,0" stroke="#F6D29A" stroke-width="3" fill="none"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${p}<rect x="-80" y="-6" width="160" height="14" rx="6" fill="#B8BFCC" stroke="${P.line}" stroke-width="3"/></g>`;
}
function pipa(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-70 L46,0 L0,80 L-46,0Z" fill="${P.ipe}" stroke="${P.line}" stroke-width="4"/><path d="M0,-70 V80 M-46,0 H46" stroke="${P.vowel}" stroke-width="3"/><path d="M0,80 q-20,30 0,60 q20,30 0,60" stroke="${P.line}" stroke-width="2.6" fill="none"/><path d="M-10,110 l20,8 M-10,170 l20,8" stroke="${P.cons}" stroke-width="8" stroke-linecap="round"/></g>`;
}

const ELENCO = {
  cida: () => person({ skin: '#5C3A26', hair: 'vovo', hairColor: '#CFC8BE', browColor: '#BDB6AE', topColor: '#9B6FC4', top: 'cardigan', inner: '#F6E7C9', bottom: 'skirt', bottomColor: '#2F7D4F', shoe: '#7A4B2E', glasses: '#B5651D', wrinkles: true, earrings: P.ipe, expr: { eyes: 'happy', mouth: 'smile' },
    armR: { t: [168, 760], hand: 'fist', hrot: 90 }, front: `<path d="M172,760 V1000" stroke="${P.line}" stroke-width="16" stroke-linecap="round"/><path d="M172,760 V1000" stroke="#8A5A33" stroke-width="10" stroke-linecap="round"/><path d="M150,752 q22,-14 34,8" stroke="${P.line}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M150,752 q22,-14 34,8" stroke="#8A5A33" stroke-width="8" fill="none" stroke-linecap="round"/>` }),
  davi: () => person({ seated: true, skin: '#8D5A3B', hair: 'fade', hairColor: '#1E1410', beard: true, topColor: '#1F7A70', bottomColor: '#2F4E86', shoe: P.ipe, expr: { eyes: 'open', mouth: 'bigSmile' },
    armR: { t: [190, 300], hand: 'wave', hrot: -100 }, armL: { t: [-150, 690], hand: 'fist', hrot: 90 }, badge: `<g transform="translate(-40,500)"><circle r="22" fill="#FFF8EC" stroke="${P.line}" stroke-width="3"/><path d="M-10,-6 l10,-8 l10,8 v12 h-20z" fill="${P.vowel}"/></g>` }),
  tito: () => person({ skin: '#F1C9A5', hair: 'menino', hairColor: '#8A5A33', topColor: '#F4B400', top: 'stripes', stripe: '#2F7D4F', bottomColor: '#2F5DA8', headScale: 1, hearingAid: true, expr: { eyes: 'open', mouth: 'bigSmile', look: [4, -2] },
    armR: { t: [180, 340], hand: 'fist', hrot: -60 } }),
  kenji: () => person({ skin: '#EBC39C', hair: 'curto', hairColor: '#2A2622', topColor: '#E9E2D4', top: 'apron', bottom: 'pants', bottomColor: '#5B5A72', shoe: '#3A3A4A', hat: 'padeiro', mustache: '#3A3430', expr: { eyes: 'happy', mouth: 'smile' },
    armL: { t: [-60, 500], hand: 'open', hrot: 0, bend: 'in' }, armR: { t: [60, 500], hand: 'open', hrot: 180, bend: 'in' }, front: bandeja(0, 480, 1.1) }),
  jaci: () => person({ skin: '#B07A50', hair: 'liso', hairColor: '#17110D', topColor: '#E2A23B', top: 'cardigan', inner: '#2F7D4F', bottom: 'skirt', bottomColor: '#7A4B8E', shoe: '#5C3A26', earrings: '#8A5A33', glasses: '#C2410C', expr: { eyes: 'open', mouth: 'smile' },
    armL: { t: [-40, 560], hand: 'open', hrot: 20, bend: 'in' }, armR: { t: [44, 560], hand: 'open', hrot: 160, bend: 'in' }, front: livros(0, 560, 1) }),
  lia: () => person({ skin: '#3B2419', hair: 'locs', hairColor: '#1B110C', topColor: '#F6E7C9', top: 'overall', overall: '#6D3FC0', bottom: 'pants', bottomColor: '#6D3FC0', shoe: '#F28C28', goggles: true, earrings: '#38A090', expr: { eyes: 'open', mouth: 'bigSmile', look: [6, 2] },
    armR: { t: [200, 560], hand: 'open', hrot: -10 } }),
};
module.exports = { person, ELENCO, robo, shade, livros, pipa, bandeja };
