// FONEMA v2 · ZOOM NA BOCA — close frontal detalhado (lábios, dentes, língua) + corte sagital colorido e animável.
// Tudo em camadas nomeadas (data-layer) para virar ossos/estados no Rive: labioSup, labioInf, dentesSup, dentesInf,
// lingua, mandibula, veu, ar, vibracao.
const { P, uid, f } = require('./core');

const K = {
  lipUp: '#8E4636', lipLo: '#B25E4A', lipHi: '#E39A80', lipSh: '#6E3226',
  cav0: '#7A2634', cav1: '#3A0D16', throat: '#26060C',
  tooth: '#FFFDF7', toothSh: '#E6D9C3', toothLine: '#CDBDA2', gum: '#E07F86',
  tongue: '#E26C78', tongueHi: '#F59AA2', tongueSh: '#B74A5A', tongueUnder: '#C9566C', vein: '#9F4B8A',
  uvula: '#E8828A',
  air: '#2F6FE0', airSoft: '#9CC2FF', voice: '#F4B400', voiceSh: '#D98E00',
  // corte
  cut: '#F2C1A8', cutSh: '#E3A78C', cutLine: '#B9765A', airSp: '#FFF6F1', bone: '#F7EBD6', boneLine: '#C9B48E',
  velum: '#EE8E90', fold: '#E46F7A', nasal: '#FBE1DA',
};

// ---------------------------------------------------------------------------------------------
// FRONTAL
// ---------------------------------------------------------------------------------------------
const SHAPES = {
  rest: { W: 92, top: 0, bot: 0, closed: true },
  m: { W: 94, top: 0, bot: 0, closed: true },
  p: { W: 88, top: 0, bot: 0, closed: true, press: 1 },
  b: { W: 88, top: 0, bot: 0, closed: true, press: 1 },
  f: { W: 100, top: -26, bot: 0, labio: true },
  v: { W: 100, top: -26, bot: 0, labio: true },
  s: { W: 118, top: -15, bot: 15, teeth: 'both', gap: 3 },
  l: { W: 100, top: -32, bot: 40, tongue: 'up' },
  a: { W: 96, top: -52, bot: 86, tongue: 'low', throat: true },
};

function teethRow(W, yRoot, yEdge, up = true) {
  // dentes individuais: incisivos centrais maiores, laterais, caninos e pré-molares recuados
  const ws = [27, 22, 20, 17, 15];
  let g = '', x = 0;
  const dir = up ? 1 : -1;
  const list = [];
  for (let i = 0; i < ws.length; i++) { list.push([x, ws[i], i]); x += ws[i]; }
  const scale = Math.min(1, (W * 0.98) / x);
  for (const s of [-1, 1]) for (const [x0, w0, i] of list) {
    const xa = s * x0 * scale, xb = s * (x0 + w0) * scale;
    const l = Math.min(xa, xb), r = Math.max(xa, xb), w = r - l;
    const shrink = i * 3.2 * (up ? 1 : 0.7);
    const e = yEdge - dir * shrink - (up ? 0 : 0);
    const rr = Math.min(7, w * 0.35);
    const d = up
      ? `M${f(l)},${yRoot} L${f(l)},${f(e - rr)} Q${f(l)},${f(e)} ${f(l + rr)},${f(e)} L${f(r - rr)},${f(e)} Q${f(r)},${f(e)} ${f(r)},${f(e - rr)} L${f(r)},${yRoot}Z`
      : `M${f(l)},${yRoot} L${f(l)},${f(e + rr)} Q${f(l)},${f(e)} ${f(l + rr)},${f(e)} L${f(r - rr)},${f(e)} Q${f(r)},${f(e)} ${f(r)},${f(e + rr)} L${f(r)},${yRoot}Z`;
    const shade = i >= 3 ? 0.78 : i === 2 ? 0.9 : 1;
    g += `<path d="${d}" fill="${shade < 1 ? K.toothSh : 'url(#bTooth)'}" opacity="${shade < 0.8 ? 0.85 : 1}" stroke="${K.toothLine}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if (i < 2) g += `<path d="M${f(l + w * 0.3)},${f(up ? yRoot + 4 : yRoot - 4)} L${f(l + w * 0.3)},${f(e - dir * 8)}" stroke="#fff" stroke-width="${f(w * 0.18)}" stroke-linecap="round" opacity=".75"/>`;
  }
  return g;
}

function upperLip(W, top, press) {
  const pk = press ? -19 : -31, dip = press ? -15 : -24;
  const t = top;
  return `M${-W - 9},3 C${f(-W * 0.82)},${f(t * 0.35 - 12)} ${-56},${f(t + pk + 2)} ${-25},${f(t + pk)} Q${-11},${f(t + pk - 1)} 0,${f(t + dip)} Q${11},${f(t + pk - 1)} ${25},${f(t + pk)} C${56},${f(t + pk + 2)} ${f(W * 0.82)},${f(t * 0.35 - 12)} ${W + 9},3
    C${f(W * 0.55)},${f(t + (t ? 0 : 2))} ${f(-W * 0.55)},${f(t + (t ? 0 : 2))} ${-W - 9},3Z`;
}
function lowerLip(W, bot, press, topY = null) {
  const th = press ? 30 : 46;
  const inner = topY === null
    ? `C${f(-W * 0.55)},${f(bot + (bot ? 0 : 3))} ${f(W * 0.55)},${f(bot + (bot ? 0 : 3))} ${W + 9},3`
    : `C${f(-W * 0.5)},${topY} ${f(W * 0.5)},${topY} ${W + 9},3`;
  return `M${-W - 9},3 ${inner} C${f(W * 0.74)},${f(bot + th)} ${f(-W * 0.74)},${f(bot + th)} ${-W - 9},3Z`;
}
function opening(W, top, bot) {
  return `M${-W},2 C${f(-W * 0.55)},${top} ${f(W * 0.55)},${top} ${W},2 C${f(W * 0.55)},${bot} ${f(-W * 0.55)},${bot} ${-W},2Z`;
}

/** Boca grande da Sofia (centro 0,0; largura ~220). */
function mouthBig(k) {
  const S = SHAPES[k] || SHAPES.rest;
  const { W, top, bot } = S;
  let g = '';
  if (S.closed) {
    // lábios fechados
    g += `<path data-layer="labioInf" d="${lowerLip(W, 0, S.press)}" fill="url(#bLipLo)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>`;
    g += `<path data-layer="labioSup" d="${upperLip(W, 0, S.press)}" fill="url(#bLipUp)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>`;
    g += `<path d="M${-W - 8},3 Q0,${S.press ? 6 : 9} ${W + 8},3" fill="none" stroke="${K.lipSh}" stroke-width="${S.press ? 5 : 4}" stroke-linecap="round"/>`;
    // brilho e textura dos lábios
    g += `<ellipse cx="-14" cy="${S.press ? 16 : 24}" rx="${S.press ? 26 : 32}" ry="${S.press ? 4 : 6}" fill="${K.lipHi}" opacity=".75"/><ellipse cx="18" cy="${S.press ? -9 : -14}" rx="16" ry="3.2" fill="${K.lipHi}" opacity=".45"/>`;
    g += [-40, -22, 0, 22, 40].map(x => `<path d="M${x},${S.press ? 10 : 14} q2,${S.press ? 6 : 10} 0,${S.press ? 12 : 18}" stroke="${K.lipSh}" stroke-width="1.4" opacity=".35" fill="none"/>`).join('');
    if (S.press) g += `<path d="M${-W - 18},-6 q-8,9 0,18 M${W + 18},-6 q8,9 0,18" fill="none" stroke="${P.skinSh}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/><path d="M-60,${46} Q0,${58} 60,${46}" fill="none" stroke="${P.skinSh}" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
    return g;
  }
  const id = uid('bo');
  const O = S.labio ? `M${-W},2 C${f(-W * 0.55)},${top} ${f(W * 0.55)},${top} ${W},2 C${f(W * 0.5)},6 ${f(-W * 0.5)},6 ${-W},2Z` : opening(W, top, bot);
  let inner = `<rect x="${-W - 10}" y="${top - 20}" width="${2 * W + 20}" height="${bot - top + 60}" fill="url(#bCav)"/>`;
  if (S.throat) {
    // garganta, véu e úvula ao fundo
    inner += `<ellipse cx="0" cy="${f(top * 0.1 + 8)}" rx="${f(W * 0.42)}" ry="${f((bot - top) * 0.32)}" fill="${K.throat}"/>`;
    inner += `<path d="M${f(-W * 0.7)},${top + 2} Q0,${f(top + 52)} ${f(W * 0.7)},${top + 2}" fill="none" stroke="#9C3446" stroke-width="7" opacity=".7"/>`;
    inner += `<path data-layer="uvula" d="M-9,${top + 30} Q-10,${top + 52} 0,${top + 56} Q10,${top + 52} 9,${top + 30}Z" fill="${K.uvula}" stroke="#9C3446" stroke-width="2"/>`;
  }
  // língua
  if (S.tongue === 'low') {
    inner += `<path data-layer="lingua" d="M${-W - 6},${bot + 10} C${f(-W * 0.9)},${f(bot * 0.35)} ${f(-W * 0.35)},${f(bot * 0.3)} 0,${f(bot * 0.32)} C${f(W * 0.35)},${f(bot * 0.3)} ${f(W * 0.9)},${f(bot * 0.35)} ${W + 6},${bot + 10}Z" fill="url(#bTongue)" stroke="${K.tongueSh}" stroke-width="2.4"/>
      <path d="M0,${f(bot * 0.4)} Q2,${f(bot * 0.6)} 0,${f(bot * 0.82)}" stroke="${K.tongueSh}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="${f(-W * 0.3)}" cy="${f(bot * 0.48)}" rx="${f(W * 0.2)}" ry="${f(bot * 0.07)}" fill="${K.tongueHi}" opacity=".8"/>`;
  } else if (S.tongue === 'up') {
    // ponta da língua sobe e encosta atrás dos dentes de cima; vemos a parte de baixo da língua
    inner += `<path d="M${-W - 6},${bot + 10} C${-W * 0.7},${bot * 0.2} -40,${top + 30} -14,${top + 14} Q0,${top + 8} 14,${top + 14} C40,${top + 30} ${W * 0.7},${bot * 0.2} ${W + 6},${bot + 10}Z" fill="url(#bTongueU)" stroke="${K.tongueSh}" stroke-width="2.4"/>
      <path d="M0,${top + 18} V${bot + 6}" stroke="#B0465F" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M-10,${top + 26} Q-22,${bot * 0.2} -30,${bot} M10,${top + 26} Q22,${bot * 0.2} 30,${bot}" stroke="${K.vein}" stroke-width="2.6" fill="none" opacity=".55" stroke-linecap="round"/>
      <ellipse cx="-24" cy="${top + 28}" rx="10" ry="4" fill="${K.tongueHi}" opacity=".6"/>`;
  } else if (!S.labio) {
    inner += `<ellipse cx="0" cy="${bot + 10}" rx="${W * 0.62}" ry="16" fill="${K.tongue}" opacity=".85"/>`;
  }
  // dentes
  if (S.labio) {
    inner += `<path d="M${-W},14 C${-W * 0.5},${-2} ${W * 0.5},${-2} ${W},14 V60 H${-W}Z" fill="url(#bLipLo)"/>`;
    inner += `<g data-layer="dentesSup">${teethRow(W * 0.86, top - 14, 8, true)}</g>`;
  } else {
    inner += `<g data-layer="dentesSup">${teethRow(W * 0.9, top - 14, S.teeth === 'both' ? -S.gap / 2 : top + 22, true)}</g>`;
    if (S.teeth === 'both') inner += `<g data-layer="dentesInf">${teethRow(W * 0.84, bot + 14, S.gap / 2, false)}</g>`;
    else if (S.tongue !== 'up') inner += `<g data-layer="dentesInf">${teethRow(W * 0.7, bot + 14, bot - 12, false)}</g>`;
    else inner += `<g data-layer="dentesInf">${teethRow(W * 0.7, bot + 14, bot - 8, false)}</g>`;
  }
  // sombra de oclusão sob o lábio de cima
  inner += `<path d="M${-W},${top - 6} C${-W * 0.5},${top - 4} ${W * 0.5},${top - 4} ${W},${top - 6} V${top + 10} C${W * 0.5},${top + 12} ${-W * 0.5},${top + 12} ${-W},${top + 10}Z" fill="#2A0810" opacity=".35" filter="url(#bSoft)"/>`;
  g += `<defs><clipPath id="${id}"><path d="${O}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
  // lábios
  if (S.labio) {
    // lábio de baixo dobrado para dentro, por baixo dos dentes de cima
    g += `<path data-layer="labioInf" d="M${-W - 9},3 C${-W * 0.5},2 ${W * 0.5},2 ${W + 9},3 C${W * 0.74},38 ${-W * 0.74},38 ${-W - 9},3Z" fill="url(#bLipLo)" stroke="${P.line}" stroke-width="3.2" stroke-linejoin="round"/>`;
    g += `<g>${teethRow(W * 0.86, top - 14, 8, true).replace(/<path d="M[^"]*" stroke="#fff"[^>]*>/g, '')}</g>`.replace(/<g>/, `<g clip-path="url(#${id}t)">`);
    g += `<defs><clipPath id="${id}t"><rect x="${-W}" y="${top - 4}" width="${2 * W}" height="${12 - top}"/></clipPath></defs>`;
    g += `<ellipse cx="-10" cy="22" rx="30" ry="4.5" fill="${K.lipHi}" opacity=".7"/><path d="M${-W * 0.62},10 Q0,4 ${W * 0.62},10" stroke="${K.lipSh}" stroke-width="2" fill="none" opacity=".5"/>`;
    g += `<path data-layer="labioSup" d="${upperLip(W, top, 0)}" fill="url(#bLipUp)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>`;
  } else {
    g += `<path data-layer="labioInf" d="${lowerLip(W, bot, 0)}" fill="url(#bLipLo)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>`;
    g += `<path data-layer="labioSup" d="${upperLip(W, top, 0)}" fill="url(#bLipUp)" stroke="${P.line}" stroke-width="3.4" stroke-linejoin="round"/>`;
    g += `<ellipse cx="-12" cy="${f(bot * 0.75 + 22)}" rx="${f(W * 0.32)}" ry="5" fill="${K.lipHi}" opacity=".75"/>`;
    g += [-0.4, -0.2, 0.2, 0.4].map(t => `<path d="M${f(W * t)},${f(bot * 0.75 + 10)} q2,8 0,16" stroke="${K.lipSh}" stroke-width="1.4" opacity=".35" fill="none"/>`).join('');
  }
  g += `<ellipse cx="20" cy="${f(top - 20)}" rx="16" ry="3" fill="${K.lipHi}" opacity=".45"/>`;
  return g;
}

/** Close frontal: rosto da Sofia do nariz ao queixo, com luz de estúdio. */
function frontal(k, w = 540, h = 480, o = {}) {
  const id = uid('fr');
  const S = SHAPES[k] || SHAPES.rest;
  const cx = w / 2, my = h * 0.6;
  const chin = h + 30 + Math.max(0, S.bot) * 0.35;
  let g = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}" rx="34"/></clipPath></defs><g clip-path="url(#${id})">`;
  g += `<rect width="${w}" height="${h}" fill="#5E3824"/>`;
  // rosto
  g += `<path d="M-40,-40 H${w + 40} V${h * 0.5} C${w + 30},${h * 0.9} ${cx + 160},${chin} ${cx},${chin} C${cx - 160},${chin} -30,${h * 0.9} -40,${h * 0.5}Z" fill="url(#bSkin)"/>`;
  // luz principal (cima-esquerda) e sombra lateral
  g += `<ellipse cx="${w * 0.28}" cy="${h * 0.22}" rx="${w * 0.32}" ry="${h * 0.22}" fill="#E8B48C" opacity=".45" filter="url(#bBlur)"/>`;
  g += `<ellipse cx="${w * 1.02}" cy="${h * 0.6}" rx="${w * 0.12}" ry="${h * 0.5}" fill="#6E4129" opacity=".35" filter="url(#bBlur)"/>`;
  // bochechas
  g += `<ellipse cx="${w * 0.1}" cy="${h * 0.42}" rx="70" ry="44" fill="${P.blush}" opacity=".3" filter="url(#bBlur)"/><ellipse cx="${w * 0.9}" cy="${h * 0.42}" rx="70" ry="44" fill="${P.blush}" opacity=".26" filter="url(#bBlur)"/>`;
  // nariz (base) e sulco nasolabial
  const ny = h * 0.1;
  g += `<path d="M${cx - 70},${ny - 8} C${cx - 82},${ny + 30} ${cx - 40},${ny + 46} ${cx - 20},${ny + 36} Q${cx},${ny + 46} ${cx + 20},${ny + 36} C${cx + 40},${ny + 46} ${cx + 82},${ny + 30} ${cx + 70},${ny - 8}" fill="none" stroke="${P.skinSh}" stroke-width="4.5" stroke-linecap="round"/>`;
  g += `<path d="M${cx - 66},${ny - 40} C${cx - 50},${ny - 70} ${cx + 50},${ny - 70} ${cx + 66},${ny - 40}" fill="none" stroke="#C48A62" stroke-width="20" opacity=".5" filter="url(#bSoft)"/>`;
  g += `<ellipse cx="${cx - 34}" cy="${ny + 22}" rx="15" ry="8" fill="#4A2416" opacity=".75" transform="rotate(-14 ${cx - 34} ${ny + 22})"/><ellipse cx="${cx + 34}" cy="${ny + 22}" rx="15" ry="8" fill="#4A2416" opacity=".75" transform="rotate(14 ${cx + 34} ${ny + 22})"/>`;
  g += `<ellipse cx="${cx - 10}" cy="${ny - 14}" rx="26" ry="14" fill="#DDA27A" opacity=".8" filter="url(#bSoft)"/>`;
  // filtro labial
  g += `<path d="M${cx - 16},${ny + 46} L${cx - 22},${my + (S.top || 0) - 34} M${cx + 16},${ny + 46} L${cx + 22},${my + (S.top || 0) - 34}" stroke="${P.skinSh}" stroke-width="6" opacity=".18" stroke-linecap="round" filter="url(#bSoft)"/>`;
  g += `<path d="M${cx - 130},${ny + 30} Q${cx - 150},${my - 10} ${cx - 140},${my + 60} M${cx + 130},${ny + 30} Q${cx + 150},${my - 10} ${cx + 140},${my + 60}" fill="none" stroke="${P.skinSh}" stroke-width="5" opacity="${S.teeth === 'both' ? .4 : 0}" stroke-linecap="round" filter="url(#bSoft)"/>`;
  // queixo
  g += `<ellipse cx="${cx}" cy="${chin - 50}" rx="70" ry="22" fill="#C48A62" opacity=".5" filter="url(#bBlur)"/>`;
  // boca
  g += `<g transform="translate(${cx},${my}) scale(${o.k || 1.62})">${mouthBig(k)}</g>`;
  const F = FON[k] || {};
  if (F.air === 'nasal') g += `<g fill="none" stroke="${K.air}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 11"><path d="M${cx - 36},${ny + 34} q-30,24 -64,26"/><path d="M${cx + 36},${ny + 34} q30,24 64,26"/></g><circle cx="${cx - 104}" cy="${ny + 60}" r="7" fill="${K.airSoft}"/><circle cx="${cx + 104}" cy="${ny + 60}" r="7" fill="${K.airSoft}"/>`;
  if (F.air === 'burst') g += `<g stroke="${K.air}" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M${cx - 190},${my - 26} l-22,-12 M${cx - 194},${my + 6} h-26 M${cx - 190},${my + 36} l-22,12 M${cx + 190},${my - 26} l22,-12 M${cx + 194},${my + 6} h26 M${cx + 190},${my + 36} l22,12"/></g>`;
  if (F.air === 'fric-lab' || F.air === 'fric-alv') g += `<g fill="none" stroke="${K.airSoft}" stroke-width="5" stroke-linecap="round"><path d="M${cx - 60},${my + 92} q10,10 0,22 q-10,10 0,22"/><path d="M${cx},${my + 96} q10,10 0,22 q-10,10 0,22"/><path d="M${cx + 60},${my + 92} q10,10 0,22 q-10,10 0,22"/></g>`;
  if (F.voice) g += `<g transform="translate(${w - 70},${h - 64})"><circle r="30" fill="${K.voice}" opacity=".95"/><path d="M-10,-12 V12" stroke="#3A2218" stroke-width="4" stroke-linecap="round"/><path d="M0,-8 q6,8 0,16 M8,-13 q10,13 0,26" stroke="#3A2218" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
  if (o.extra) g += o.extra;
  g += `</g><rect width="${w}" height="${h}" rx="34" fill="none" stroke="${P.line}" stroke-opacity=".22" stroke-width="2.5"/>`;
  return g;
}

// ---------------------------------------------------------------------------------------------
// CORTE SAGITAL (caixa 600×540, rosto virado para a direita)
// ---------------------------------------------------------------------------------------------
const FON = {
  m: { jaw: 0, velum: 'down', air: 'nasal', voice: true, lips: 'closed', tongue: 'rest' },
  p: { jaw: 0, velum: 'up', air: 'burst', voice: false, lips: 'pressed', tongue: 'rest' },
  b: { jaw: 0, velum: 'up', air: 'burst', voice: true, lips: 'pressed', tongue: 'rest' },
  f: { jaw: 2, velum: 'up', air: 'fric-lab', voice: false, lips: 'labiodental', tongue: 'rest' },
  v: { jaw: 2, velum: 'up', air: 'fric-lab', voice: true, lips: 'labiodental', tongue: 'rest' },
  s: { jaw: 1.5, velum: 'up', air: 'fric-alv', voice: false, lips: 'spread', tongue: 's' },
  l: { jaw: 5, velum: 'up', air: 'lateral', voice: true, lips: 'open', tongue: 'l' },
  a: { jaw: 13, velum: 'up', air: 'oral', voice: true, lips: 'wide', tongue: 'low' },
};
const PIV = [300, 238];
const rot = (p, deg) => { const a = deg * Math.PI / 180, dx = p[0] - PIV[0], dy = p[1] - PIV[1]; return [PIV[0] + dx * Math.cos(a) - dy * Math.sin(a), PIV[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
const pt = p => `${f(p[0])},${f(p[1])}`;

function tonguePath(t) {
  // em coordenadas da mandíbula fechada
  const T = {
    rest: { back: [282, 262], mid: [380, 252], front: [462, 262], tip: [492, 276], tipU: [486, 292] },
    s: { back: [282, 258], mid: [380, 246], front: [458, 248], tip: [494, 248], tipU: [486, 266] },
    l: { back: [282, 268], mid: [372, 270], front: [452, 256], tip: [500, 232], tipU: [488, 252] },
    low: { back: [286, 286], mid: [380, 284], front: [462, 290], tip: [494, 298], tipU: [486, 312] },
  }[t];
  return `M262,430 C240,360 246,${T.back[1] + 14} ${pt(T.back)} C${T.back[0] + 30},${T.mid[1] - 6} ${T.mid[0] - 40},${T.mid[1]} ${pt(T.mid)} C${T.mid[0] + 40},${T.mid[1]} ${T.front[0] - 24},${T.front[1] - 2} ${pt(T.front)} C${T.front[0] + 18},${T.front[1]} ${T.tip[0] - 6},${T.tip[1] - 6} ${pt(T.tip)} Q${T.tip[0] + 6},${T.tip[1] + 10} ${pt(T.tipU)} C470,318 420,326 380,350 C340,374 300,400 290,430Z`;
}

function sagittal(k, o = {}) {
  const F = FON[k];
  const id = uid('sg'), mk = uid('ah'), mkv = uid('av');
  const J = F.jaw;
  const R = p => pt(rot(p, J));
  let g = `<defs>
    <marker id="${mk}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" fill="${K.air}"/></marker>
    <clipPath id="${id}"><rect width="600" height="540" rx="34"/></clipPath></defs><g clip-path="url(#${id})">`;
  g += `<rect width="600" height="540" fill="${o.bg || '#EEF4FF'}"/>`;
  g += `<circle cx="600" cy="0" r="260" fill="#fff" opacity=".5"/>`;
  // ---- cabeça fixa (parte de cima), pescoço
  const HEAD = `M-10,-10 H420 C462,26 490,74 498,118 C504,142 526,164 566,186 Q578,198 560,205 L546,207 C553,216 557,232 555,248 Q553,260 540,264 L505,264 L300,300 L230,560 L-10,560Z`;
  g += `<path d="M376,384 L334,420 C322,468 322,520 328,560 L180,560 L220,330Z" fill="${K.cut}"/>`;
  g += `<path d="${HEAD}" fill="${K.cut}"/>`;
  // ---- mandíbula (gira em torno da ATM)
  const JAW = [[538, 266], [556, 270], [556, 286], [550, 300], [538, 304], [548, 320], [552, 352], [530, 374], [500, 392], [430, 398], [370, 392], [300, 330], [290, 272], [500, 270]];
  const jd = `M${R(JAW[0])} Q${R(JAW[1])} ${R(JAW[2])} Q${R(JAW[3])} ${R(JAW[4])} C${R(JAW[5])} ${R(JAW[6])} ${R(JAW[7])} C${R(JAW[8])} ${R(JAW[9])} ${R(JAW[10])} L${R(JAW[11])} L${R(JAW[12])} L${R(JAW[13])}Z`;
  g += `<path data-layer="mandibula" d="${jd}" fill="${K.cut}"/>`;
  // ---- espaços de ar: boca + garganta + traqueia
  const floor = [[505, 280], [470, 318], [380, 352], [300, 404], [268, 440]].map(p => rot(p, J));
  g += `<path d="M507,236 Q420,232 300,238 L262,250 L232,252 L226,480 L236,560 L270,560 L268,500 L268,440 L${pt(floor[3])} L${pt(floor[2])} L${pt(floor[1])} L${pt(floor[0])} L${R([540, 268])} L548,262Z" fill="${K.airSp}"/>`;
  // nariz por dentro (cavidade nasal)
  g += `<path d="M548,203 C520,176 486,134 420,124 C356,114 290,124 252,152 L230,196 L228,240 L262,240 Q284,224 310,222 L500,222 Q528,214 548,208Z" fill="${K.nasal}"/>`;
  g += `<path d="M300,160 Q370,140 450,160 M290,186 Q380,170 470,190 M320,206 Q400,198 486,210" fill="none" stroke="${K.cutSh}" stroke-width="9" stroke-linecap="round" opacity=".8"/>`;
  // céu da boca (palato duro, osso)
  g += `<path d="M310,222 L500,222 Q512,224 512,232 Q508,240 498,238 Q420,234 312,238Z" fill="${K.bone}" stroke="${K.boneLine}" stroke-width="2.2"/>`;
  // véu palatino + úvula
  g += F.velum === 'down'
    ? `<path data-layer="veu" d="M314,222 C282,226 256,246 250,282 Q248,298 258,298 Q268,270 314,238Z" fill="${K.velum}" stroke="${K.cutLine}" stroke-width="2.2"/>`
    : `<path data-layer="veu" d="M314,222 C284,214 254,206 232,206 Q226,220 236,232 Q270,240 314,238Z" fill="${K.velum}" stroke="${K.cutLine}" stroke-width="2.2"/>`;
  // língua (gira com a mandíbula)
  g += `<g data-layer="lingua" transform="rotate(${J} ${PIV[0]} ${PIV[1]})"><path d="${tonguePath(F.tongue)}" fill="url(#bTongueS)" stroke="${K.tongueSh}" stroke-width="2.6" stroke-linejoin="round"/>
     <path d="M300,300 C340,${F.tongue === 'low' ? 312 : 282} 400,${F.tongue === 'low' ? 308 : 278} 450,${F.tongue === 'low' ? 312 : 284}" fill="none" stroke="${K.tongueHi}" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>`;
  // epiglote e pregas vocais
  g += `<path d="M268,430 Q252,410 256,392 Q262,402 272,420Z" fill="${K.velum}" stroke="${K.cutLine}" stroke-width="2"/>`;
  g += `<g data-layer="pregas"><path d="M226,476 L246,484 L226,492Z M268,474 L250,484 L268,494Z" fill="${K.fold}" stroke="${K.cutLine}" stroke-width="2" stroke-linejoin="round"/></g>`;
  // dentes
  g += `<path d="M498,226 L512,226 Q522,252 514,272 L504,272 Q496,250 498,226Z" fill="${K.tooth}" stroke="${K.toothLine}" stroke-width="2.2"/>`;
  g += `<path d="M494,${f(rot([0, 0], 0)[1])}" fill="none"/>`;
  const lt = [[496, 278], [508, 278], [512, 300], [502, 318], [494, 312]].map(p => rot(p, J));
  g += `<path data-layer="dentesInf" d="M${pt(lt[0])} L${pt(lt[1])} Q${pt(lt[2])} ${pt(lt[3])} L${pt(lt[4])}Z" fill="${K.tooth}" stroke="${K.toothLine}" stroke-width="2.2"/>`;
  // lábios
  const upL = F.lips === 'labiodental' ? 'translate(4,-4)' : F.lips === 'wide' || F.lips === 'open' ? 'translate(2,-4)' : F.lips === 'spread' ? 'translate(-4,-2)' : '';
  g += `<path data-layer="labioSup" transform="${upL}" d="M546,207 C556,218 560,236 557,252 Q554,266 538,266 L520,264 Q520,240 530,222Z" fill="url(#bLipS)" stroke="${P.line}" stroke-width="2.6" stroke-linejoin="round"/>`;
  let lo = [[536, 268], [556, 270], [557, 288], [538, 304], [524, 290]];
  if (F.lips === 'labiodental') lo = [[514, 270], [532, 266], [540, 284], [528, 302], [512, 290]];
  if (F.lips === 'pressed') lo = [[534, 266], [554, 266], [556, 282], [538, 300], [524, 288]];
  lo = lo.map(p => rot(p, J));
  g += `<path data-layer="labioInf" d="M${pt(lo[0])} Q${pt(lo[1])} ${pt(lo[2])} Q${pt([lo[2][0] - 2, lo[3][1]])} ${pt(lo[3])} Q${pt(lo[4])} ${pt(lo[0])}Z" fill="url(#bLipS)" stroke="${P.line}" stroke-width="2.6" stroke-linejoin="round"/>`;
  // contorno externo (pele)
  g += `<path d="M420,-10 C462,26 490,74 498,118 C504,142 526,164 566,186 Q578,198 560,205 L546,207" fill="none" stroke="${P.line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<path d="M${R([538, 304])} C${R([548, 320])} ${R([552, 352])} ${R([530, 374])} C${R([500, 392])} ${R([430, 398])} ${R([370, 392])} L334,420 C322,468 322,520 328,560" fill="none" stroke="${P.line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<path d="M420,-10 C462,26 490,74 498,118 C504,142 526,164 566,186 Q578,198 560,205" fill="none" stroke="#C88A64" stroke-width="10" opacity=".5" transform="translate(-6,2)"/>`;
  // olho e sobrancelha (referência)
  g += `<path d="M438,60 Q458,52 478,60" fill="none" stroke="${P.hair}" stroke-width="7" stroke-linecap="round"/><path d="M446,86 Q462,94 478,86" fill="none" stroke="${P.line}" stroke-width="4" stroke-linecap="round"/><path d="M478,86 l8,-4" stroke="${P.line}" stroke-width="3" stroke-linecap="round"/>`;
  // ---- ar
  const A = `fill="none" stroke="${K.air}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 13" marker-end="url(#${mk})" class="ar"`;
  const rise = `M252,556 L248,500 Q244,440 244,380 Q242,300 246,262`;
  if (F.air === 'nasal') g += `<path data-layer="ar" d="${rise} Q240,212 280,190 Q380,150 470,176 Q530,196 590,212" ${A}/>`;
  else if (F.air === 'burst') {
    g += `<path data-layer="ar" d="${rise} Q262,246 340,244 Q440,244 496,252" ${A}/>`;
    g += [[470, 250], [456, 238], [440, 252], [484, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${K.air}" opacity=".45"/>`).join('');
    g += `<g stroke="${K.air}" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M568,250 l18,-8 M570,268 l22,0 M568,286 l18,8"/></g><text x="560" y="236" font-family="Andika" font-weight="700" font-size="22" fill="${K.air}">puf!</text>`;
  } else if (F.air === 'fric-lab') {
    g += `<path data-layer="ar" d="${rise} Q262,246 340,244 Q450,244 512,262 L592,282" ${A}/>`;
    g += `<path d="M560,296 q10,-4 20,0 M560,306 q12,-4 24,0" stroke="${K.airSoft}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (F.air === 'fric-alv') {
    g += `<path data-layer="ar" d="${rise} Q262,240 340,238 Q446,236 500,244 L592,258" ${A}/>`;
    g += `<path d="M556,272 q8,-6 16,0 t16,0 M556,240 q8,-6 16,0 t16,0" stroke="${K.airSoft}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (F.air === 'lateral') {
    g += `<path data-layer="ar" d="${rise} Q262,244 340,${F.tongue === 'l' ? 262 : 244} Q420,290 470,296 Q520,300 592,${R([592, 296]).split(',')[1]}" ${A} opacity=".95"/>`;
    g += `<text x="368" y="326" font-family="Andika" font-weight="700" font-size="18" fill="${K.air}">pelos lados da língua</text>`;
  } else g += `<path data-layer="ar" d="${rise} Q262,256 340,266 Q440,276 520,${f(rot([520, 280], J)[1])} L592,${f(rot([592, 290], J)[1])}" ${A}/>`;
  // ---- vibração (garganta)
  if (F.voice) g += `<g data-layer="vibracao" fill="none" stroke="${K.voice}" stroke-width="6" stroke-linecap="round">
      <path d="M218,484 l-10,-8 l-10,8 l-10,-8 l-10,8" stroke-width="4.5"/>
      <path d="M346,456 q12,28 0,56 M366,442 q20,42 0,84 M388,430 q26,54 0,108"/></g>
      <g transform="translate(410,468)"><rect x="0" y="-18" width="128" height="34" rx="17" fill="${K.voice}"/><text x="64" y="6" text-anchor="middle" font-family="Andika" font-weight="700" font-size="18" fill="#3A2218">vibra! zzz</text></g>`;
  else g += `<g transform="translate(360,468)"><rect x="0" y="-18" width="150" height="34" rx="17" fill="#fff" stroke="#C9CFE0" stroke-width="2"/><text x="75" y="6" text-anchor="middle" font-family="Andika" font-weight="700" font-size="17" fill="${P.slate}">garganta quieta</text></g>`;
  if (F.velum === 'up' && F.air !== 'nasal') g += `<g transform="translate(232,214)"><circle r="12" fill="#fff" stroke="${P.vowel}" stroke-width="3"/><path d="M-6,-6 L6,6" stroke="${P.vowel}" stroke-width="3.4" stroke-linecap="round"/></g>`;
  // ---- rótulos
  const L = (x, y, tx, ty, t, c = P.ink, anchor = 'start') => { const tw = t.length * 9.4 + 22; const ex = anchor === 'end' ? tx - tw : tx; return `<path d="M${x},${y} L${ex},${ty}" stroke="${c}" stroke-width="2" opacity=".6"/><circle cx="${x}" cy="${y}" r="4.5" fill="${c}" stroke="#fff" stroke-width="1.5"/>
    <g transform="translate(${ex},${ty})"><rect x="0" y="-16" width="${tw}" height="30" rx="15" fill="#fff" stroke="${c}" stroke-opacity=".4" stroke-width="2"/><text x="${tw / 2}" y="5" text-anchor="middle" font-family="Andika" font-weight="700" font-size="16.5" fill="${c}">${t}</text></g>`; };
  if (o.labels !== false) {
    g += L(400, 150, 300, 70, 'nariz', '#B24A4A');
    g += L(420, 230, 330, 108, 'céu da boca', '#8A6A2E');
    g += L(266, 226, 40, 140, F.velum === 'down' ? 'véu (aberto)' : 'véu (fechado)', '#C2416B');
    g += L(380, F.tongue === 'low' ? 300 : 280, 60, 300, 'língua', '#C2416B');
    g += L(508, 262, 590, 352, 'dentes', '#5B5A72', 'end');
    g += L(552, 292, 590, 406, 'lábios', '#8E4636', 'end');
    g += L(236, 486, 40, 440, 'garganta', '#B07500');
  }
  g += `</g><rect width="600" height="540" rx="34" fill="none" stroke="${P.line}" stroke-opacity=".18" stroke-width="2.5"/>`;
  return g;
}

function bocaDefs() {
  return `<defs>
  <linearGradient id="bLipUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E3C2E"/><stop offset="1" stop-color="${K.lipUp}"/></linearGradient>
  <linearGradient id="bLipLo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C87562"/><stop offset=".55" stop-color="${K.lipLo}"/><stop offset="1" stop-color="#93493A"/></linearGradient>
  <linearGradient id="bLipS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93493A"/><stop offset="1" stop-color="#C46E5A"/></linearGradient>
  <radialGradient id="bCav" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${K.cav1}"/><stop offset="1" stop-color="${K.cav0}"/></radialGradient>
  <linearGradient id="bTooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1E6D2"/><stop offset=".35" stop-color="${K.tooth}"/><stop offset="1" stop-color="#F6EEDF"/></linearGradient>
  <linearGradient id="bTongue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.tongueHi}"/><stop offset=".5" stop-color="${K.tongue}"/><stop offset="1" stop-color="${K.tongueSh}"/></linearGradient>
  <linearGradient id="bTongueU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E67C88"/><stop offset=".6" stop-color="${K.tongueUnder}"/><stop offset="1" stop-color="#A94058"/></linearGradient>
  <linearGradient id="bTongueS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.tongueHi}"/><stop offset=".45" stop-color="${K.tongue}"/><stop offset="1" stop-color="${K.tongueSh}"/></linearGradient>
  <radialGradient id="bSkin" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#C08660"/><stop offset=".55" stop-color="${P.skin}"/><stop offset="1" stop-color="#875538"/></radialGradient>
  <filter id="bSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="bBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>`;
}

const SONS = {
  m: { L: 'M m', word: ['M', 'A', 'L', 'A'], lab: 'fechados', ar: 'pelo nariz', voz: true, dica: 'Boca fechadinha e o som sai pelo nariz: mmm… como quando a comida está gostosa!', teste: 'Tape o nariz: o mmm para!', par: 'nasal' },
  p: { L: 'P p', word: ['P', 'A', 'T', 'O'], lab: 'apertados e soltam', ar: 'sai de uma vez (puf!)', voz: false, dica: 'Os lábios seguram o ar e soltam um sopro: p! Um papelzinho na frente da boca balança.', teste: 'Mão no pescoço: não vibra.', par: 'par de /b/' },
  b: { L: 'B b', word: ['B', 'O', 'L', 'A'], lab: 'apertados e soltam', ar: 'sai de uma vez', voz: true, dica: 'Igual ao /p/, mas a garganta liga o motorzinho: b-b-b, como uma bola quicando!', teste: 'Mão no pescoço: vibra!', par: 'par de /p/' },
  f: { L: 'F f', word: ['F', 'A', 'C', 'A'], lab: 'dentes no lábio de baixo', ar: 'sopra pela boca', voz: false, dica: 'Dentes de cima no lábio de baixo e um ventinho: fff… como apagar a vela devagar.', teste: 'Mão na frente da boca: sente o vento.', par: 'par de /v/' },
  v: { L: 'V v', word: ['V', 'A', 'C', 'A'], lab: 'dentes no lábio de baixo', ar: 'sopra pela boca', voz: true, dica: 'A mesma boca do /f/, mas a garganta vibra: vvv… como um aviãozinho voando!', teste: 'Mão no pescoço: vibra!', par: 'par de /f/' },
  s: { L: 'S s', word: ['S', 'A', 'P', 'O'], lab: 'sorriso, dentes juntinhos', ar: 'chia na ponta da língua', voz: false, dica: 'Dentes juntinhos, sorriso e um chiado de cobrinha: sss!', teste: 'Mão no pescoço: não vibra.', par: 'par de /z/' },
  l: { L: 'L l', word: ['L', 'U', 'A'], lab: 'entreabertos', ar: 'passa pelos lados da língua', voz: true, dica: 'A pontinha da língua sobe e encosta atrás dos dentes de cima: lá-lá-lá, a língua dança!', teste: 'Olhe no espelho: a língua aparece!', par: 'língua no céu' },
  a: { L: 'A a', word: ['A', 'B', 'E', 'LH', 'A'], lab: 'bem abertos', ar: 'sai livre pela boca', voz: true, dica: 'Boca bem aberta, língua deitadinha e a garganta canta: aaa… como no médico!', teste: 'Mão no queixo: ele desce.', par: 'vogal' },
};

module.exports = { mouthBig, frontal, sagittal, bocaDefs, SONS, FON, K, SHAPES };
