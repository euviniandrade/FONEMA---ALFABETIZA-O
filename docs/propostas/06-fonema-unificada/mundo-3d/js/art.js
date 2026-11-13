// FONEMA · Mundo 3D — "pintura": texturas de canvas (letreiros, rótulos, calçada,
// emoções) e personagens 2D ilustrados (SVG -> canvas -> textura de billboard).
import * as THREE from 'three';

export const PAL = {
  tinta: '#3B2A20', areia: '#FFF4E2', papel: '#FFFBF4', terracota: '#A9472A', sol: '#F2B33D',
  folha: '#2F6B43', mar: '#1F6E82', ipe: '#B23C62', lilas: '#6B5BA8', barro: '#7A4B2E', ceu: '#BFE3EC',
};

export async function loadFonts() {
  const list = [
    ['Andika', 'fonts/andika-latin-700-normal.woff2', '700'],
    ['Andika', 'fonts/andika-latin-400-normal.woff2', '400'],
    ['Fredoka', 'fonts/fredoka-latin-600-normal.woff2', '600'],
    ['Fredoka', 'fonts/fredoka-latin-700-normal.woff2', '700'],
  ];
  await Promise.all(list.map(async ([fam, url, w]) => {
    try { const f = new FontFace(fam, `url(${url})`, { weight: w }); await f.load(); document.fonts.add(f); } catch (e) { console.warn('fonte', url, e); }
  }));
}

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, renderer) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4; return t;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------- Letreiro de madeira com palavra decodificável ----------
export function signTexture(word, renderer, { w = 512, h = 220, color = PAL.tinta, accent = PAL.terracota, icon = null } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  // tábua
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#C98E58'); g.addColorStop(1, '#A86F3F');
  x.fillStyle = g; rr(x, 0, 0, w, h, 28); x.fill();
  x.strokeStyle = 'rgba(90,50,25,.35)'; x.lineWidth = 3;
  for (let i = 1; i < 3; i++) { x.beginPath(); x.moveTo(14, (h / 3) * i); x.lineTo(w - 14, (h / 3) * i + (i % 2 ? 4 : -3)); x.stroke(); }
  // placa papel
  x.fillStyle = PAL.papel; rr(x, 18, 18, w - 36, h - 36, 20); x.fill();
  x.strokeStyle = accent; x.lineWidth = 8; rr(x, 30, 30, w - 60, h - 60, 14); x.stroke();
  // pregos
  x.fillStyle = '#7A4B2E'; [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 7, 0, 7); x.fill(); });
  let tx = w / 2;
  if (icon) { icon(x, 70, h / 2, h * 0.36); tx = w / 2 + 34; }
  x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
  let fs = h * 0.56; x.font = `700 ${fs}px Andika`;
  const maxW = (icon ? w - 170 : w - 110);
  while (x.measureText(word).width > maxW) { fs -= 4; x.font = `700 ${fs}px Andika`; }
  x.fillText(word, tx, h / 2 + fs * 0.04);
  return tex(c, renderer);
}

// pequenos ícones desenhados (concretos, sem texto)
export const ICONS = {
  pao(x, cx, cy, s) { x.fillStyle = '#D9934A'; x.beginPath(); x.ellipse(cx, cy, s * 0.9, s * 0.5, -0.2, 0, 7); x.fill(); x.strokeStyle = '#F6D3A0'; x.lineWidth = 5; x.lineCap = 'round'; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(cx + i * s * 0.4 - 8, cy + 10); x.lineTo(cx + i * s * 0.4 + 8, cy - 12); x.stroke(); } },
  livro(x, cx, cy, s) { x.fillStyle = PAL.mar; x.beginPath(); x.moveTo(cx, cy - s * 0.4); x.quadraticCurveTo(cx - s * 0.5, cy - s * 0.6, cx - s, cy - s * 0.4); x.lineTo(cx - s, cy + s * 0.5); x.quadraticCurveTo(cx - s * 0.5, cy + s * 0.3, cx, cy + s * 0.5); x.quadraticCurveTo(cx + s * 0.5, cy + s * 0.3, cx + s, cy + s * 0.5); x.lineTo(cx + s, cy - s * 0.4); x.quadraticCurveTo(cx + s * 0.5, cy - s * 0.6, cx, cy - s * 0.4); x.fill(); x.strokeStyle = PAL.papel; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, cy - s * 0.35); x.lineTo(cx, cy + s * 0.45); x.stroke(); },
  bola(x, cx, cy, s) { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, s * 0.62, 0, 7); x.fill(); x.strokeStyle = PAL.tinta; x.lineWidth = 4; x.stroke(); x.fillStyle = PAL.tinta; x.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; x.lineTo(cx + Math.cos(a) * s * 0.24, cy + Math.sin(a) * s * 0.24); } x.fill(); },
  casa(x, cx, cy, s) { x.fillStyle = PAL.terracota; x.beginPath(); x.moveTo(cx - s * 0.8, cy - s * 0.05); x.lineTo(cx, cy - s * 0.75); x.lineTo(cx + s * 0.8, cy - s * 0.05); x.fill(); x.fillStyle = '#F3C7A8'; x.fillRect(cx - s * 0.55, cy - s * 0.08, s * 1.1, s * 0.75); x.fillStyle = PAL.barro; x.fillRect(cx - s * 0.15, cy + s * 0.2, s * 0.3, s * 0.47); },
  robo(x, cx, cy, s) { x.fillStyle = '#7FA7B5'; rr(x, cx - s * 0.55, cy - s * 0.45, s * 1.1, s * 0.9, 10); x.fill(); x.fillStyle = '#FFF4E2'; x.beginPath(); x.arc(cx - s * 0.22, cy - s * 0.05, s * 0.15, 0, 7); x.arc(cx + s * 0.22, cy - s * 0.05, s * 0.15, 0, 7); x.fill(); x.strokeStyle = '#7FA7B5'; x.lineWidth = 5; x.beginPath(); x.moveTo(cx, cy - s * 0.45); x.lineTo(cx, cy - s * 0.75); x.stroke(); x.fillStyle = PAL.sol; x.beginPath(); x.arc(cx, cy - s * 0.8, 7, 0, 7); x.fill(); },
  cofre(x, cx, cy, s) { x.fillStyle = '#E58FA4'; x.beginPath(); x.ellipse(cx, cy + 4, s * 0.75, s * 0.55, 0, 0, 7); x.fill(); x.beginPath(); x.arc(cx + s * 0.72, cy, s * 0.2, 0, 7); x.fill(); x.fillStyle = '#7A2E3E'; x.fillRect(cx - s * 0.18, cy - s * 0.42, s * 0.36, 6); x.fillStyle = PAL.sol; x.beginPath(); x.arc(cx, cy - s * 0.68, s * 0.2, 0, 7); x.fill(); },
  horta(x, cx, cy, s) { x.fillStyle = '#E8892F'; x.beginPath(); x.moveTo(cx - s * 0.18, cy - s * 0.3); x.lineTo(cx + s * 0.18, cy - s * 0.3); x.lineTo(cx, cy + s * 0.75); x.fill(); x.fillStyle = '#4FA35A'; for (let i = -1; i <= 1; i++) { x.beginPath(); x.ellipse(cx + i * 10, cy - s * 0.48, 6, 16, i * 0.4, 0, 7); x.fill(); } },
  escola(x, cx, cy, s) { x.fillStyle = PAL.sol; x.beginPath(); x.moveTo(cx - s * 0.2, cy - s * 0.6); x.lineTo(cx + s * 0.2, cy - s * 0.6); x.lineTo(cx + s * 0.45, cy + s * 0.2); x.lineTo(cx - s * 0.45, cy + s * 0.2); x.fill(); x.fillStyle = PAL.barro; x.beginPath(); x.arc(cx, cy + s * 0.32, s * 0.12, 0, 7); x.fill(); },
  sapo(x, cx, cy, s) { x.fillStyle = '#5DAA4E'; x.beginPath(); x.ellipse(cx, cy + 6, s * 0.7, s * 0.45, 0, 0, 7); x.fill(); x.beginPath(); x.arc(cx - s * 0.32, cy - s * 0.3, s * 0.22, 0, 7); x.arc(cx + s * 0.32, cy - s * 0.3, s * 0.22, 0, 7); x.fill(); x.fillStyle = PAL.tinta; x.beginPath(); x.arc(cx - s * 0.32, cy - s * 0.32, 5, 0, 7); x.arc(cx + s * 0.32, cy - s * 0.32, 5, 0, 7); x.fill(); },
};

// ---------- Rótulo de ilha (pílula, como no mapa da Proposta 2) ----------
export function labelTexture(name, status, renderer) {
  const h = 128; const c0 = canvas(10, 10).getContext('2d'); c0.font = '600 58px Fredoka';
  const tw = c0.measureText(name).width; const w = Math.ceil(tw + 170);
  const c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = 'rgba(59,42,32,.18)'; rr(x, 6, 14, w - 12, h - 18, 56); x.fill();
  x.fillStyle = status === 'bloqueada' ? 'rgba(255,251,244,.86)' : PAL.papel; rr(x, 4, 4, w - 12, h - 20, 54); x.fill();
  const icx = 58, icy = (h - 16) / 2 + 2;
  x.fillStyle = status === 'bloqueada' ? '#9C8F86' : status === 'atual' ? PAL.terracota : PAL.mar;
  x.beginPath(); x.arc(icx, icy, 36, 0, 7); x.fill();
  x.strokeStyle = PAL.papel; x.fillStyle = PAL.papel; x.lineWidth = 6; x.lineCap = 'round';
  if (status === 'bloqueada') { // cadeado
    x.beginPath(); x.arc(icx, icy - 6, 11, Math.PI, 0); x.stroke(); rr(x, icx - 16, icy - 6, 32, 24, 6); x.fill();
  } else if (status === 'feita') { // estrela
    x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 21, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(icx + Math.cos(a) * r, icy + Math.sin(a) * r); } x.fill();
  } else { // orelha (ouvir o nome)
    x.beginPath(); x.moveTo(icx - 10, icy - 2); x.bezierCurveTo(icx - 10, icy - 26, icx + 18, icy - 26, icx + 16, icy - 2); x.bezierCurveTo(icx + 14, icy + 10, icx + 2, icy + 10, icx + 2, icy + 20); x.stroke();
    x.beginPath(); x.arc(icx + 3, icy - 6, 5, 0, 7); x.fill();
  }
  x.fillStyle = status === 'bloqueada' ? '#7D6F66' : PAL.tinta; x.font = '600 58px Fredoka'; x.textBaseline = 'middle';
  x.fillText(name, 112, icy + 3);
  const t = tex(c, renderer); t.userData = { aspect: w / h }; return t;
}

// ---------- Calçada portuguesa em ondas (praça) ----------
export function calcadaTexture(renderer) {
  const S = 1024, c = canvas(S, S), x = c.getContext('2d');
  x.fillStyle = '#F1E4CB'; x.fillRect(0, 0, S, S);
  x.fillStyle = '#B9805A';
  const band = 56;
  for (let y0 = -band * 2; y0 < S + band * 2; y0 += band * 2) {
    x.beginPath();
    for (let X = 0; X <= S; X += 8) x.lineTo(X, y0 + Math.sin(X / S * Math.PI * 6) * 26);
    for (let X = S; X >= 0; X -= 8) x.lineTo(X, y0 + band * 0.55 + Math.sin(X / S * Math.PI * 6 + 0.9) * 26);
    x.fill();
  }
  // pedrinhas
  for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '90,55,30'},${Math.random() * 0.12})`; x.fillRect(Math.random() * S, Math.random() * S, 5, 5); }
  // bordas concêntricas
  x.lineWidth = 34; x.strokeStyle = '#A9472A'; x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 22, 0, 7); x.stroke();
  x.lineWidth = 10; x.strokeStyle = '#F2B33D'; x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 50, 0, 7); x.stroke();
  return tex(c, renderer);
}

// ---------- Placas da Praça das Emoções ----------
const EMO = {
  alegria: { bg: '#F2B33D', mouth: (x) => { x.beginPath(); x.arc(128, 140, 46, 0.15, Math.PI - 0.15); x.stroke(); } },
  calma: { bg: '#7DC48A', mouth: (x) => { x.beginPath(); x.arc(128, 128, 36, 0.4, Math.PI - 0.4); x.stroke(); }, eyes: 'closed' },
  tristeza: { bg: '#7FB3D5', mouth: (x) => { x.beginPath(); x.arc(128, 196, 36, Math.PI + 0.5, -0.5); x.stroke(); } },
  medo: { bg: '#A797D6', mouth: (x) => { x.beginPath(); x.ellipse(128, 170, 18, 24, 0, 0, 7); x.stroke(); } },
  raiva: { bg: '#E8835E', mouth: (x) => { x.beginPath(); x.moveTo(92, 176); x.lineTo(164, 176); x.stroke(); }, brows: true },
};
export function emotionTexture(kind, renderer) {
  const c = canvas(256, 256), x = c.getContext('2d'), e = EMO[kind];
  x.fillStyle = PAL.papel; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
  x.fillStyle = e.bg; x.beginPath(); x.arc(128, 128, 112, 0, 7); x.fill();
  x.strokeStyle = PAL.tinta; x.fillStyle = PAL.tinta; x.lineWidth = 12; x.lineCap = 'round';
  if (e.eyes === 'closed') { x.beginPath(); x.arc(92, 100, 16, Math.PI + 0.3, -0.3); x.stroke(); x.beginPath(); x.arc(164, 100, 16, Math.PI + 0.3, -0.3); x.stroke(); }
  else { x.beginPath(); x.ellipse(92, 100, 12, 16, 0, 0, 7); x.ellipse(164, 100, 12, 16, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(96, 94, 4, 0, 7); x.arc(168, 94, 4, 0, 7); x.fill(); }
  if (e.brows) { x.beginPath(); x.moveTo(72, 70); x.lineTo(108, 82); x.moveTo(184, 70); x.lineTo(148, 82); x.stroke(); }
  e.mouth(x);
  x.fillStyle = 'rgba(224,127,98,.45)'; x.beginPath(); x.arc(70, 140, 16, 0, 7); x.arc(186, 140, 16, 0, 7); x.fill();
  return tex(c, renderer);
}

export function letterTexture(ch, bg, renderer, fg = PAL.papel) {
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 10; rr(x, 14, 14, 228, 228, 26); x.stroke();
  x.fillStyle = fg; x.font = '700 176px Andika'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 128, 140);
  return tex(c, renderer);
}

export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const c = canvas(size, size), x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); return t;
}

// ---------- Personagens (SVG ilustrado -> canvas com contorno "adesivo") ----------
const SK = '#B97A52', SKD = '#A86C46', HAIR = '#3A2418', T = '#2B1B12';
const curls = (list, dx, dy, fill) => list.map(([x, y, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="${fill}"/>`).join('');
const BACK = [[40, 92, 30], [52, 58, 30], [84, 38, 31], [118, 38, 31], [150, 58, 30], [162, 92, 30], [164, 128, 26], [36, 128, 26], [44, 160, 22], [156, 160, 22], [60, 175, 16], [140, 175, 16]];
const FRONT = [[68, 70, 18], [90, 60, 19], [114, 61, 18], [134, 74, 16], [56, 88, 13], [146, 92, 11]];
function face(dx, dy) {
  return `
  <path d="M${76 + dx},${58 + dy} q6,-6 12,0 M${104 + dx},${56 + dy} q6,-6 12,0 M${124 + dx},${66 + dy} q6,-5 11,1" stroke="#6A4430" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <g transform="translate(${140 + dx},${64 + dy})"><circle r="7" cx="0" cy="-7" fill="#F2B33D"/><circle r="7" cx="7" cy="0" fill="#F2B33D"/><circle r="7" cx="0" cy="7" fill="#F2B33D"/><circle r="7" cx="-7" cy="0" fill="#F2B33D"/><circle r="4.5" fill="#A9472A"/></g>
  <path d="M${70 + dx},${98 + dy} Q${80 + dx},${91 + dy} ${91 + dx},${97 + dy} M${109 + dx},${97 + dy} Q${120 + dx},${91 + dy} ${130 + dx},${98 + dy}" stroke="${HAIR}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="${80 + dx}" cy="${115 + dy}" rx="7.5" ry="9.5" fill="${T}"/><ellipse cx="${120 + dx}" cy="${115 + dy}" rx="7.5" ry="9.5" fill="${T}"/>
  <circle cx="${82.5 + dx}" cy="${111.5 + dy}" r="2.8" fill="#fff"/><circle cx="${122.5 + dx}" cy="${111.5 + dy}" r="2.8" fill="#fff"/>
  <circle cx="${68 + dx}" cy="${133 + dy}" r="8.5" fill="#E07F62" opacity=".45"/><circle cx="${132 + dx}" cy="${133 + dy}" r="8.5" fill="#E07F62" opacity=".45"/>
  <path d="M${96 + dx},${125 + dy} Q${100 + dx},${130 + dy} ${104 + dx},${125 + dy}" stroke="#8E5636" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M${85 + dx},${140 + dy} Q${100 + dx},${157 + dy} ${115 + dx},${140 + dy} Q${100 + dx},${147 + dy} ${85 + dx},${140 + dy} Z" fill="#7A2E22"/>
  <path d="M${92 + dx},${148 + dy} Q${100 + dx},${153 + dy} ${108 + dx},${148 + dy} Q${100 + dx},${151 + dy} ${92 + dx},${148 + dy}Z" fill="#D9786A"/>`;
}
function head(dx, dy) {
  return `${curls(BACK, dx, dy, HAIR)}
  <rect x="${87 + dx}" y="${150 + dy}" width="26" height="40" rx="8" fill="${SKD}"/>
  <ellipse cx="${52 + dx}" cy="${118 + dy}" rx="9" ry="12" fill="${SKD}"/><ellipse cx="${148 + dx}" cy="${118 + dy}" rx="9" ry="12" fill="${SKD}"/>
  <ellipse cx="${100 + dx}" cy="${112 + dy}" rx="50" ry="54" fill="${SK}"/>
  ${curls(FRONT, dx, dy, HAIR)}${face(dx, dy)}`;
}
export const SOFIA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 420" width="480" height="840">
 <!-- pernas -->
 <rect x="97" y="300" width="19" height="84" rx="9" fill="${SKD}"/><rect x="125" y="300" width="19" height="84" rx="9" fill="${SKD}"/>
 <rect x="96" y="360" width="21" height="16" rx="5" fill="#FFFBF4"/><rect x="124" y="360" width="21" height="16" rx="5" fill="#FFFBF4"/>
 <path d="M84,392 Q84,374 106,374 Q120,376 120,392 Z" fill="#A9472A"/><path d="M122,392 Q122,374 142,374 Q158,376 158,392 Z" fill="#A9472A"/>
 <rect x="82" y="388" width="40" height="7" rx="3.5" fill="#FFFBF4"/><rect x="120" y="388" width="40" height="7" rx="3.5" fill="#FFFBF4"/>
 <!-- tronco: camiseta -->
 <path d="M74,304 Q70,214 120,200 Q170,214 166,304 Z" fill="#F2B33D"/>
 <path d="M104,202 L120,222 L136,202 Z" fill="#FFFBF4"/>
 <!-- jardineira -->
 <path d="M86,206 L100,244 M154,206 L140,244" stroke="#1F6E82" stroke-width="11" stroke-linecap="round"/>
 <rect x="92" y="236" width="56" height="52" rx="10" fill="#1F6E82"/>
 <rect x="104" y="248" width="32" height="20" rx="6" fill="#2A8299"/>
 <g transform="translate(120,258)"><circle r="3.6" cy="-3.6" fill="#F2B33D"/><circle r="3.6" cx="3.6" fill="#F2B33D"/><circle r="3.6" cy="3.6" fill="#F2B33D"/><circle r="3.6" cx="-3.6" fill="#F2B33D"/><circle r="2.4" fill="#A9472A"/></g>
 <circle cx="99" cy="242" r="5" fill="#F2B33D"/><circle cx="141" cy="242" r="5" fill="#F2B33D"/>
 <path d="M72,282 L168,282 L172,326 L128,326 L120,310 L112,326 L68,326 Z" fill="#1F6E82"/>
 <path d="M120,290 L120,308" stroke="#18596A" stroke-width="3"/>
 <!-- braço com livro -->
 <path d="M156,214 Q172,222 174,236" stroke="#F2B33D" stroke-width="24" fill="none" stroke-linecap="round"/>
 <path d="M174,236 Q178,256 166,270" stroke="${SK}" stroke-width="16" fill="none" stroke-linecap="round"/>
 <g transform="rotate(-14 160 266)"><rect x="140" y="250" width="44" height="34" rx="4" fill="#B23C62"/><rect x="143" y="254" width="38" height="4" fill="#FFFBF4"/><rect x="150" y="262" width="22" height="13" rx="3" fill="#F2B33D"/></g>
 <circle cx="164" cy="270" r="10" fill="${SK}"/>
 ${head(20, 4)}
 <!-- braço que acena -->
 <path d="M84,216 Q60,212 48,196" stroke="#F2B33D" stroke-width="24" fill="none" stroke-linecap="round"/>
 <path d="M48,196 Q34,178 30,156" stroke="#B97A52" stroke-width="16" fill="none" stroke-linecap="round"/>
 <circle cx="29" cy="148" r="12" fill="#B97A52"/><path d="M20,142 L14,132 M26,137 L23,125 M33,136 L34,124 M39,141 L45,133" stroke="#B97A52" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const bands = [[44, 46], [64, 31], [84, 26], [104, 28], [124, 40]].map(([x, y]) => `<path d="M${x},${y} Q${x - 7},70 ${x},100" stroke="#A0744B" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
export const BOLOTA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 124" width="570" height="372">
 <path d="M22,96 Q8,92 6,80" stroke="#A87A4E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="44" cy="106" rx="12" ry="7" fill="#9C7048"/><ellipse cx="70" cy="109" rx="12" ry="7" fill="#9C7048"/><ellipse cx="104" cy="109" rx="12" ry="7" fill="#9C7048"/><ellipse cx="124" cy="106" rx="11" ry="7" fill="#9C7048"/>
 <path d="M18,100 Q16,28 84,22 Q148,26 146,100 Z" fill="#C99A6B"/>
 ${bands}
 <path d="M18,100 L146,100" stroke="#A0744B" stroke-width="6" stroke-linecap="round"/>
 <path d="M36,62 Q52,36 84,31" stroke="#E6C49B" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
 <ellipse cx="148" cy="84" rx="26" ry="22" fill="#E0B88C"/>
 <ellipse cx="168" cy="91" rx="11" ry="8" fill="#E0B88C"/><circle cx="176" cy="89" r="4.5" fill="#8A4E3A"/>
 <path d="M126,74 Q140,58 160,66 Q150,73 126,80 Z" fill="#C99A6B"/>
 <ellipse cx="134" cy="62" rx="7" ry="12" transform="rotate(-22 134 62)" fill="#D8A97D"/><ellipse cx="134" cy="63" rx="3.5" ry="7" transform="rotate(-22 134 63)" fill="#F0C9A6"/>
 <circle cx="153" cy="80" r="5.5" fill="${T}"/><circle cx="154.8" cy="78.2" r="1.8" fill="#fff"/>
 <circle cx="151" cy="93" r="5" fill="#E07F62" opacity=".45"/>
 <path d="M158,98 Q164,102 170,97" stroke="#6B3A28" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`;

export const SOFIA_BUST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 262">
 ${head(0, 0)}
 <path d="M38,262 Q40,192 100,182 Q160,192 162,262 Z" fill="#F2B33D"/>
 <path d="M80,184 L100,206 L120,184 Z" fill="#FFFBF4"/>
 <path d="M64,204 L74,262 M136,204 L126,262" stroke="#1F6E82" stroke-width="10" stroke-linecap="round"/>
 <rect x="70" y="226" width="60" height="40" rx="9" fill="#1F6E82"/><circle cx="100" cy="242" r="6" fill="#F2B33D"/>
</svg>`;

export async function svgSprite(svg, renderer, { scale = 1, outline = 10 } = {}) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const c = canvas(w + outline * 2, h + outline * 2), x = c.getContext('2d');
  const s = canvas(c.width, c.height), sx = s.getContext('2d');
  sx.drawImage(img, outline, outline, w, h); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#FFFBF4'; sx.fillRect(0, 0, s.width, s.height);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; x.drawImage(s, Math.cos(a) * outline, Math.sin(a) * outline); }
  x.drawImage(img, outline, outline, w, h);
  const t = tex(c, renderer); t.userData = { aspect: c.width / c.height }; return t;
}

// Marcador "você está aqui" (avatar da Sofia num pino)
export async function pinTexture(renderer) {
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SOFIA_BUST_SVG.replace('viewBox="0 0 200 262"', 'viewBox="0 0 200 262" width="400" height="524"'));
  await img.decode();
  const W = 300, H = 380, c = canvas(W, H), x = c.getContext('2d');
  x.fillStyle = 'rgba(59,42,32,.25)'; x.beginPath(); x.ellipse(W / 2, H - 14, 40, 10, 0, 0, 7); x.fill();
  x.fillStyle = PAL.terracota; x.beginPath(); x.arc(W / 2, 140, 132, 0, 7); x.fill();
  x.beginPath(); x.moveTo(W / 2 - 60, 250); x.lineTo(W / 2, H - 20); x.lineTo(W / 2 + 60, 250); x.fill();
  x.fillStyle = PAL.papel; x.beginPath(); x.arc(W / 2, 140, 114, 0, 7); x.fill();
  x.save(); x.beginPath(); x.arc(W / 2, 140, 106, 0, 7); x.clip(); x.fillStyle = '#FCE3A6'; x.fillRect(0, 0, W, H);
  x.drawImage(img, W / 2 - 112, 26, 224, 294); x.restore();
  const t = tex(c, renderer); t.userData = { aspect: W / H }; return t;
}
