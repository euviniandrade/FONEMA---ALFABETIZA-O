// FONEMA · Roda da Sofia (academia) — utilidades de interface: página, logo, ícones, personagens de uniforme.
const { P, defs, groundShadow } = require('./core');
const S = require('./sofia');
const B = require('./bolota');

const W = 1280, H = 800; // CSS px; captura com deviceScaleFactor 2 => 2560×1600

const C = {
  bg: '#FFF8EC', ink: '#2B2A4C', slate: '#5B5A72', line: '#3A2218', card: '#FFFFFF',
  mango: '#F28C28', ipe: '#F4B400', ipeL: '#FFF1C2',
  green: '#2F7D4F', greenL: '#E3F3EA', mint: '#E6F4F1',
  blue: '#1D4ED8', navy: '#1E3A6E', sky: '#E8EEFB',
  purple: '#6D3FC0', purpleL: '#EFE8FB', coral: '#C2410C', coralL: '#FDE8D7',
  wa: '#1F8F55',
};

function page(body, extraCss = '') {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face{font-family:Andika;src:url(fonts/andika-latin-400-normal.woff2) format('woff2');font-weight:400}
@font-face{font-family:Andika;src:url(fonts/andika-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Andika;src:url(fonts/andika-latin-ext-400-normal.woff2) format('woff2');font-weight:400;unicode-range:U+0100-024F}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-500-normal.woff2) format('woff2');font-weight:500}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-600-normal.woff2) format('woff2');font-weight:600}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Atkinson;src:url(fonts/atkinson-hyperlegible-latin-400-normal.woff2) format('woff2');font-weight:400}
@font-face{font-family:Atkinson;src:url(fonts/atkinson-hyperlegible-latin-700-normal.woff2) format('woff2');font-weight:700}
*{box-sizing:border-box}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};color:${C.ink};font-family:Atkinson,sans-serif}
svg{display:block}
.fr{font-family:Fredoka,sans-serif}
.an{font-family:Andika,sans-serif}
.abs{position:absolute}
.card{background:#fff;border-radius:22px;box-shadow:0 1px 0 rgba(58,34,24,.06),0 10px 28px -14px rgba(43,42,76,.28);border:1px solid rgba(58,34,24,.07)}
.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:700;white-space:nowrap}
.row{display:flex;align-items:center}
.top{position:absolute;left:0;top:0;width:${W}px;height:64px;display:flex;align-items:center;padding:0 28px;gap:16px}
.bar{height:8px;border-radius:8px;background:#ECE6DA;overflow:hidden}.bar>i{display:block;height:100%;border-radius:8px}
.listen{width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#fff;border:2px solid rgba(43,42,76,.12)}
${extraCss}
</style></head><body>${body}</body></html>`;
}

// ---------- logo: crianças de mãos dadas em roda, com onda sonora no centro ----------
function logoMark(s = 44) {
  const cols = [C.mango, C.green, C.blue, C.coral, C.purple, C.ipe, '#0E7C86', '#B4561A'];
  let g = `<circle cx="50" cy="50" r="31" fill="none" stroke="${C.ink}" stroke-width="4" opacity=".14"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, x = 50 + Math.cos(a) * 34, y = 50 + Math.sin(a) * 34;
    const a2 = a + Math.PI / 8, mx = 50 + Math.cos(a2) * 38, my = 50 + Math.sin(a2) * 38;
    g += `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${(50 + Math.cos(a + Math.PI / 4) * 34).toFixed(1)},${(50 + Math.sin(a + Math.PI / 4) * 34).toFixed(1)}" stroke="${cols[i]}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, x = 50 + Math.cos(a) * 34, y = 50 + Math.sin(a) * 34;
    g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${cols[i]}" stroke="#fff" stroke-width="2.5"/>`;
  }
  g += `<path d="M34,50 h4 M40,42 v16 M46,36 v28 M52,40 v20 M58,45 v10 M64,48 v4" stroke="${C.ink}" stroke-width="4.2" stroke-linecap="round"/>`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 100 100">${g}</svg>`;
}
function logo(sub = 'do FONEMA', s = 44, dark = false) {
  const col = dark ? '#fff' : C.ink;
  return `<div class="row" style="gap:10px">${logoMark(s)}<div><div class="fr" style="font-weight:700;font-size:${s * 0.5}px;line-height:1;color:${col};letter-spacing:.2px">Roda da Sofia</div><div style="font-size:${Math.max(11, s * 0.26)}px;color:${dark ? 'rgba(255,255,255,.8)' : C.slate};margin-top:3px;font-weight:700;letter-spacing:.4px">${sub}</div></div></div>`;
}

// ---------- ícones (traço 2.2, 24×24) ----------
const IC = {
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0c0 1-1 1.5-1.5 2"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  mouth: '<path d="M3.5 12c3-3.5 14-3.5 17 0-3 4.5-14 4.5-17 0z"/><path d="M6 12h12"/>',
  mirror: '<ellipse cx="12" cy="10" rx="6" ry="7"/><path d="M12 17v4M8.5 21h7"/><path d="M9.5 7.5l2-1.5" />',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z"/>',
  house: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5v-5h4v5"/>',
  book: '<path d="M3.5 6c3-1.5 6-1.5 8.5 0v13c-2.5-1.5-5.5-1.5-8.5 0z"/><path d="M20.5 6c-3-1.5-6-1.5-8.5 0v13c2.5-1.5 5.5-1.5 8.5 0z"/>',
  cap: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c3 2.5 8 2.5 11 0v-4M21.5 9.5v5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chat: '<path d="M4 5.5h16v10H9l-5 4z"/>',
  wa: '<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.3-1.6-2.8-2.8l1-1-1-2z" fill="currentColor" stroke="none"/>',
  people: '<circle cx="8.5" cy="8.5" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M3 19c.5-3.5 3-5 5.5-5s5 1.5 5.5 5M14 14.5c2.5-.5 6 .5 6.8 4.5"/>',
  doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
  down: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  medal: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3.5l2 6M15.5 3.5l-2 6"/><path d="M12 12.3l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" fill="currentColor"/>',
  shield: '<path d="M12 3.5l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5z"/><path d="M9 12l2 2 4-4"/>',
  flask: '<path d="M9.5 3.5h5M10.5 3.5v5.5L5 18.5c-.6 1 .1 2 1.2 2h11.6c1.1 0 1.8-1 1.2-2L13.5 9V3.5"/><path d="M7.5 15h9"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5"/>',
  screen: '<rect x="3.5" y="5" width="17" height="11" rx="2"/><path d="M9 20h6M12 16v4"/>',
  thermo: '<path d="M10 4.5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  gate: '<path d="M4 20V7M20 20V7M4 9h16M4 14h16M8 9v5M12 9v5M16 9v5"/>',
  cc: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M10.5 10.2a2 2 0 1 0 0 3.6M16.5 10.2a2 2 0 1 0 0 3.6"/>',
  hands: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7-6 7-2.5 0-4-1.5-5.5-4L3.5 12a1.4 1.4 0 0 1 2.3-1.6L7 12"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  lamp: '<path d="M9 18h6M10 21h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  heart: '<path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7.5a4 4 0 0 1 7.5 2c0 5.5-7.5 10-7.5 10z"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2M18 14h2M14 18h2v2M18 18h2v2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  wifi: '<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.5a8 8 0 0 1 11 0M9.5 15.5a4 4 0 0 1 5 0"/><circle cx="12" cy="18.5" r="1" fill="currentColor"/>',
  sign: '<path d="M7 8.5c1-2 3-2 4 0s3 2 4 0 3-2 4 0M5 15.5c2-1.5 4 1.5 6 0s4 1.5 6 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2L18 18M6 18l1.8-1.8M16.2 7.8L18 6"/>',
};
function ic(name, size = 20, color = 'currentColor', sw = 2.2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="color:${color};flex:none">${IC[name]}</svg>`;
}

// ---------- personagens (Sofia de uniforme, sem adornos; Bolota) ----------
function sofiaSvg(o = {}, w = 300, h = 300, vb = '-260 -20 520 1000') {
  return `<svg width="${w}" height="${h}" viewBox="${vb}">${defs()}${groundShadow(0, 975, 170)}${S.sofia(o)}</svg>`;
}
function sofiaBust(expr = 'alegre', size = 120, o = {}) {
  // cabeça + ombros com uniforme (recorte de busto)
  return `<svg width="${size}" height="${size}" viewBox="-200 60 400 400">${defs()}${S.sofia({ expr, ...o })}</svg>`;
}
function bolotaSvg(o = {}, w = 160, h = 110) {
  return `<svg width="${w}" height="${h}" viewBox="-200 -260 400 280">${defs()}${groundShadow(0, 6, 150)}${B.bolota(o)}</svg>`;
}

// ---------- miniaturas de vídeo (letra + mini-cena) ----------
function thumb(letter, bg, fg, o = {}) {
  const w = o.w || 200, h = o.h || 112;
  const mini = o.sofia !== false ? `<g transform="translate(${w * 0.73},${h * 0.1}) scale(${h / 1150})">${S.sofia({ expr: o.expr || 'alegre', armR: o.armR })}</g>` : '';
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <circle cx="${w * 0.78}" cy="${h * 1.05}" r="${h * 0.62}" fill="#fff" opacity=".35"/>
    <text x="${w * 0.36}" y="${h * 0.8}" text-anchor="middle" font-family="Andika" font-weight="700" font-size="${h * 0.5}" fill="${fg}">${letter}</text>
    ${mini}</svg>`;
}

module.exports = { W, H, C, page, logo, logoMark, ic, IC, sofiaSvg, sofiaBust, bolotaSvg, thumb, S, B, P, defs, groundShadow };
