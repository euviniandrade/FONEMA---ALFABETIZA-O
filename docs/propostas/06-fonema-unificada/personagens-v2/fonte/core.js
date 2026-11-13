// FONEMA · personagens — utilidades comuns de desenho SVG (ilustração vetorial feita à mão em código)
let _id = 0;
const uid = (p = 'i') => `${p}${++_id}`;
const f = n => Math.round(n * 10) / 10;

// Paleta mestre (ver README)
const P = {
  line: '#3A2218',        // contorno (nunca preto puro)
  ink: '#2B2A4C',         // texto (Tinta)
  slate: '#5B5A72',
  cream: '#FFF8EC', sky: '#E8EEFB', mint: '#E6F4F1', peach: '#FDE8D7',
  // Sofia
  skin: '#A86B47', skinSh: '#7E4E33', skinHi: '#C48A62', blush: '#E0705E',
  hair: '#2E1B12', hairMid: '#432819', hairHi: '#6B4130',
  shirt: '#F28C28', shirtSh: '#CF6716', shirtHi: '#FFB461',
  polo: '#FBFAF6', poloSh: '#DCD6C9', poloMid: '#F1EEE6', poloHi: '#FFFFFF',
  shorts: '#2E4374', shortsSh: '#1F2E55', shortsHi: '#4A6199',
  sock: '#FFF8EC', shoe: '#FBF4E8', shoeSh: '#DCCDB6', lace: '#2F7D4F', sole: '#2F7D4F',
  pack: '#1F7A70', packSh: '#145650', packHi: '#38A090', strap: '#C77B2C', strapSh: '#9C5C1C',
  ipe: '#F4B400', ipeSh: '#D98E00', ipeHi: '#FFD85A', ipeIn: '#B4561A',
  lip: '#8A4433', mouthIn: '#5A1E2A', tongue: '#E4747C', teeth: '#FFFAF2',
  iris: '#5A321C', eyeW: '#FFFDF8',
  vowel: '#C2410C', cons: '#1D4ED8', ok: '#2F7D4F', focus: '#6D3FC0', mango: '#F28C28',
  // Bolota
  shell: '#C9975A', shellSh: '#A2723B', shellHi: '#E6BD82', band: '#B07C40', scute: '#E8C690',
  bskin: '#EDC7A4', bskinSh: '#D19F7C', bear: '#E8978E',
};

// pseudo-aleatório determinístico
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// União com contorno: desenha as formas duas vezes (contorno grosso + preenchimento), resultando
// num contorno único em volta da silhueta combinada — técnica de "linha de tinta" de animação.
function U(shapes, fill, t = 3.5, line = P.line) {
  return `<g fill="${line}" stroke="${line}" stroke-width="${2 * t}" stroke-linejoin="round" stroke-linecap="round">${shapes}</g><g fill="${fill}" stroke="none">${shapes}</g>`;
}
// membro (polilinha arredondada) com contorno
function limb(pts, w, color, t = 3.5, line = P.line) {
  const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
  return `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w + 2 * t}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// cinemática inversa de 2 segmentos
function ik(s, t, L1, L2, bend = 1) {
  let dx = t[0] - s[0], dy = t[1] - s[1], d = Math.hypot(dx, dy);
  const maxd = L1 + L2 - 0.5, mind = Math.abs(L1 - L2) + 1;
  if (d > maxd) { t = [s[0] + dx / d * maxd, s[1] + dy / d * maxd]; d = maxd; }
  if (d < mind) { d = mind; }
  const a = Math.atan2(dy, dx);
  const A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const e = [s[0] + L1 * Math.cos(a + bend * A), s[1] + L1 * Math.sin(a + bend * A)];
  const hx = t[0] - e[0], hy = t[1] - e[1], hd = Math.hypot(hx, hy);
  const h = [e[0] + hx / hd * L2, e[1] + hy / hd * L2];
  return { e, h, ang: Math.atan2(hy, hx) * 180 / Math.PI };
}

// definições globais (gradientes/filtros) — inserir uma vez por SVG
function defs() {
  return `<defs>
  <radialGradient id="gFace" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${P.skinHi}"/><stop offset=".55" stop-color="${P.skin}"/><stop offset="1" stop-color="#946040"/></radialGradient>
  <linearGradient id="gSkinV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.skinHi}"/><stop offset=".6" stop-color="${P.skin}"/><stop offset="1" stop-color="#946040"/></linearGradient>
  <radialGradient id="gHair" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#53321F"/><stop offset=".55" stop-color="${P.hair}"/><stop offset="1" stop-color="#22140C"/></radialGradient>
  <radialGradient id="gIris" cx=".45" cy=".7" r=".7"><stop offset="0" stop-color="#9A6038"/><stop offset=".55" stop-color="${P.iris}"/><stop offset="1" stop-color="#2A160C"/></radialGradient>
  <linearGradient id="gShirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.poloHi}"/><stop offset=".45" stop-color="${P.polo}"/><stop offset="1" stop-color="${P.poloSh}"/></linearGradient>
  <linearGradient id="gSleeve" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.shirtHi}"/><stop offset=".45" stop-color="${P.shirt}"/><stop offset="1" stop-color="${P.shirtSh}"/></linearGradient>
  <radialGradient id="gIris2" cx=".5" cy=".72" r=".75"><stop offset="0" stop-color="#C58A52"/><stop offset=".45" stop-color="#7A4524"/><stop offset="1" stop-color="#2A140A"/></radialGradient>
  <radialGradient id="gRim" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#FFE3C4" stop-opacity=".5"/></radialGradient>
  <linearGradient id="gShorts" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.shortsHi}"/><stop offset=".5" stop-color="${P.shorts}"/><stop offset="1" stop-color="${P.shortsSh}"/></linearGradient>
  <linearGradient id="gPack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.packHi}"/><stop offset=".5" stop-color="${P.pack}"/><stop offset="1" stop-color="${P.packSh}"/></linearGradient>
  <radialGradient id="gIpe" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${P.ipeHi}"/><stop offset=".6" stop-color="${P.ipe}"/><stop offset="1" stop-color="${P.ipeSh}"/></radialGradient>
  <radialGradient id="gShell" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${P.shellHi}"/><stop offset=".55" stop-color="${P.shell}"/><stop offset="1" stop-color="${P.shellSh}"/></radialGradient>
  <radialGradient id="gBskin" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F8DCC0"/><stop offset=".6" stop-color="${P.bskin}"/><stop offset="1" stop-color="${P.bskinSh}"/></radialGradient>
  <radialGradient id="gMouth" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#7A2A36"/><stop offset="1" stop-color="${P.mouthIn}"/></radialGradient>
  <radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3A2218" stop-opacity=".28"/><stop offset="1" stop-color="#3A2218" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="blur12" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .23  0 0 0 0 .13  0 0 0 0 .09  0 0 0 .05 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>`;
}

// sombra de chão
const groundShadow = (cx, cy, rx, ry = rx * 0.16) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gShadow)"/>`;

// página HTML base
function page(w, h, body, extraCss = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Andika;src:url(fonts/andika-latin-400-normal.woff2) format('woff2');font-weight:400}
@font-face{font-family:Andika;src:url(fonts/andika-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Andika;src:url(fonts/andika-latin-ext-400-normal.woff2) format('woff2');font-weight:400;unicode-range:U+0100-024F}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-500-normal.woff2) format('woff2');font-weight:500}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-600-normal.woff2) format('woff2');font-weight:600}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-700-normal.woff2) format('woff2');font-weight:700}
html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;background:${P.cream};font-family:Andika,sans-serif;color:${P.ink}}
svg{display:block}
.t{font-family:Fredoka,sans-serif}
${extraCss}
</style></head><body>${body}</body></html>`;
}

module.exports = { P, U, limb, ik, uid, f, rng, defs, groundShadow, page };
