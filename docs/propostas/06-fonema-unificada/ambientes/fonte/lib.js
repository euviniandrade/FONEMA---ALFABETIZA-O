// FONEMA · Ambientes — biblioteca de desenho de cenários em camadas (SVG feito em código)
// Tela lógica 1280×800 → PNG 2560×1600 (deviceScaleFactor 2)
const W = 1280, H = 800;
const f = n => Math.round(n * 10) / 10;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const h2r = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
const r2h = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };

// ---------------------------------------------------------------------------------------------
// Cena com camadas de paralaxe: sky (céu/astros) · far (horizonte) · mid · near · fg (primeiro plano)
// ---------------------------------------------------------------------------------------------
const LAYERS = ['sky', 'far', 'mid', 'near', 'fg'];
class Scene {
  constructor(name, o = {}) { this.name = name; this.n = 0; this.d = []; this.L = {}; LAYERS.forEach(l => this.L[l] = []); this.fx = []; this.hot = []; this.o = o; this.blurs = {}; }
  id(p = 'g') { return `${this.name.replace(/\W/g, '')}_${p}${++this.n}`; }
  def(s) { this.d.push(s); }
  stops(st) { return st.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join(''); }
  lin(st, x1 = 0, y1 = 0, x2 = 0, y2 = 1, user = false) { const id = this.id('l'); this.def(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${user ? ' gradientUnits="userSpaceOnUse"' : ''}>${this.stops(st)}</linearGradient>`); return `url(#${id})`; }
  rad(st, cx = .5, cy = .5, r = .5, user = false, extra = '') { const id = this.id('r'); this.def(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${user ? ' gradientUnits="userSpaceOnUse"' : ''} ${extra}>${this.stops(st)}</radialGradient>`); return `url(#${id})`; }
  blur(sd) { const k = String(sd); if (!this.blurs[k]) { const id = this.id('b'); this.blurs[k] = id; this.def(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`); } return `url(#${this.blurs[k]})`; }
  clip(shape) { const id = this.id('c'); this.def(`<clipPath id="${id}">${shape}</clipPath>`); return `url(#${id})`; }
  add(l, s) { this.L[l].push(s); return this; }
  addFx(s) { this.fx.push(s); return this; }
  // ponto explorável: brilho suave + faíscas (fica na camada do objeto)
  hotspot(l, x, y, r = 34, word = '') {
    this.hot.push({ l, x, y, r, word });
    const g = this.rad([[0, '#FFF7DA', .62], [.45, '#FFE9A8', .26], [1, '#FFE9A8', 0]]);
    const sp = (sx, sy, s, o = 1) => `<path transform="translate(${f(sx)},${f(sy)})" d="M0,${-s} Q${s * .14},${-s * .14} ${s},0 Q${s * .14},${s * .14} 0,${s} Q${-s * .14},${s * .14} ${-s},0 Q${-s * .14},${-s * .14} 0,${-s}Z" fill="#FFFBEA" opacity="${o}"/>`;
    this.add(l, `<g class="hot" data-word="${word}"><circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="${g}" style="mix-blend-mode:screen"/>
      <circle cx="${x}" cy="${y}" r="${r * 1.08}" fill="none" stroke="#FFF6D0" stroke-opacity=".38" stroke-width="1.3" stroke-dasharray="1.5 6" stroke-linecap="round"/>
      ${sp(x + r * .78, y - r * .72, 7.5)}${sp(x - r * .86, y - r * .2, 4.2, .85)}${sp(x + r * .2, y + r * .9, 3.4, .7)}</g>`);
  }
  render({ only = null, fx = true } = {}) {
    let body = '';
    LAYERS.forEach(l => { const vis = !only || only.includes(l); body += `<g id="layer-${l}" style="${vis ? '' : 'display:none'}">${this.L[l].join('\n')}</g>`; });
    if (fx && !only) body += `<g id="layer-fx">${this.fx.join('\n')}</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${this.d.join('')}</defs>${body}</svg>`;
  }
}

// efeitos de acabamento: vinheta, grão de papel, luz quente
function finish(s, { vignette = '#3A2218', vo = .28, grain = .5, warm = null, warmO = .12 } = {}) {
  s.addFx(`<rect width="${W}" height="${H}" fill="${s.rad([[.55, vignette, 0], [1, vignette, vo]], .5, .46, .78)}"/>`);
  if (warm) s.addFx(`<rect width="${W}" height="${H}" fill="${warm}" opacity="${warmO}" style="mix-blend-mode:soft-light"/>`);
  const id = s.id('grain');
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .09 0"/></filter>`);
  s.addFx(`<rect width="${W}" height="${H}" filter="url(#${id})" opacity="${grain}" style="mix-blend-mode:multiply"/>`);
}

// ---------------------------------------------------------------------------------------------
// Céu, astros, nuvens, relevo
// ---------------------------------------------------------------------------------------------
function sky(s, stops, l = 'sky') { s.add(l, `<rect width="${W}" height="${H}" fill="${s.lin(stops)}"/>`); }
function sunGlow(s, x, y, r, core = '#FFF6D6', glow = '#FFD98A', R = 520, o = .75, l = 'sky') {
  s.add(l, `<circle cx="${x}" cy="${y}" r="${R}" fill="${s.rad([[0, glow, o], [.25, glow, o * .45], [1, glow, 0]])}"/>`);
  if (r) s.add(l, `<circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="${s.rad([[0, core, .9], [1, core, 0]])}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${core}"/>`);
}
function rays(s, x, y, angs, len, col = '#FFF3C8', o = .22, l = 'sky', w = 0.06) {
  let g = '';
  const gr = s.rad([[0, col, o], [1, col, 0]], x, y, len, true);
  angs.forEach(a => { const a1 = a - w, a2 = a + w; g += `<path d="M${x},${y} L${f(x + Math.cos(a1) * len)},${f(y + Math.sin(a1) * len)} L${f(x + Math.cos(a2) * len)},${f(y + Math.sin(a2) * len)}Z" fill="${gr}"/>`; });
  s.add(l, `<g filter="${s.blur(10)}" style="mix-blend-mode:screen">${g}</g>`);
}
function cloud(s, x, y, w, light = '#FFFFFF', shadow = '#D8E2F0', seed = 1, o = 1, lx = -.4) {
  const r = rng(seed); const n = 7 + Math.floor(r() * 4); let a = '', b = '';
  const hgt = w * .34;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), cx = x - w / 2 + t * w + (r() - .5) * w * .05, bump = Math.sin(t * Math.PI), rr = w * (0.07 + 0.11 * bump) * (0.75 + r() * .5), cy = y - rr * .5 - bump * hgt * .35 * r();
    a += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}"/>`;
    if (r() < .8) b += `<circle cx="${f(cx + lx * rr * .25)}" cy="${f(cy - rr * .22)}" r="${f(rr * .78)}"/>`;
  }
  a += `<ellipse cx="${x}" cy="${f(y - w * .02)}" rx="${f(w * .52)}" ry="${f(w * .05)}"/>`;
  const gid = s.lin([[0, light], [.55, mix(light, shadow, .35)], [1, shadow]], 0, y - hgt * 1.2, 0, y + w * .04, true);
  return `<g opacity="${o}"><g fill="${gid}">${a}</g><g fill="${light}" opacity=".75" filter="${s.blur(w * .012)}">${b}</g></g>`;
}
function ridge(seed, y0, amp, { step = 6, fr = [1, 2.3, 5.1, 11.7], wt = [1, .5, .22, .09], x0 = -30, x1 = W + 30, bottom = H + 10, sharp = 0 } = {}) {
  const r = rng(seed); const ph = fr.map(() => r() * Math.PI * 2);
  const yf = x => { let v = 0; fr.forEach((q, i) => v += Math.sin(x / W * Math.PI * 2 * q + ph[i]) * wt[i]); if (sharp) v = v + sharp * (1 - Math.abs(Math.sin(x / W * Math.PI * 4 + ph[0]))); return y0 - v * amp; };
  const pts = []; for (let x = x0; x <= x1 + step; x += step) pts.push(`${f(x)},${f(yf(x))}`);
  return { d: `M${x0},${bottom} L${pts.join(' L')} L${x1 + step},${bottom}Z`, top: `M${pts.join(' L')}`, y: yf };
}
// silhueta de chapada/mesa (topo plano, escarpa)
function mesa(x0, x1, top, base, seed) {
  const r = rng(seed); const w = x1 - x0; let d = `M${x0},${base} `;
  d += `C${x0 + w * .05},${base - (base - top) * .6} ${x0 + w * .08},${top + 12} ${x0 + w * .14},${top + 4} `;
  for (let i = 1; i <= 6; i++) d += `L${f(x0 + w * (.14 + i * .12))},${f(top + (r() - .5) * 8)} `;
  d += `C${x1 - w * .08},${top + 8} ${x1 - w * .04},${base - (base - top) * .5} ${x1},${base}Z`;
  return d;
}

// ---------------------------------------------------------------------------------------------
// Flora
// ---------------------------------------------------------------------------------------------
// copa volumétrica: 3 passes (sombra · meio-tom · luz) com direção da luz (lx,ly)
function canopy(cx, cy, rx, ry, cols, seed, { n = 30, lx = -.55, ly = -.8, smin = .26, smax = .42, spec = true } = {}) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) { const t = r() * Math.PI * 2, d = Math.sqrt(r()) * .82; pts.push([cx + Math.cos(t) * rx * d, cy + Math.sin(t) * ry * d, Math.min(rx, ry) * (smin + r() * (smax - smin)) * 1.25]); }
  pts.sort((a, b) => a[1] - b[1]);
  let a = '', b = '', c = '', d2 = '';
  pts.forEach(([x, y, s]) => {
    a += `<circle cx="${f(x)}" cy="${f(y + s * .1)}" r="${f(s)}"/>`;
    b += `<circle cx="${f(x + lx * s * .2)}" cy="${f(y + ly * s * .2)}" r="${f(s * .8)}"/>`;
    const dot = ((x - cx) / rx) * lx + ((y - cy) / ry) * ly;
    if (dot > -.05) c += `<circle cx="${f(x + lx * s * .42)}" cy="${f(y + ly * s * .42)}" r="${f(s * .46)}"/>`;
    if (spec && dot > .35) d2 += `<circle cx="${f(x + lx * s * .55)}" cy="${f(y + ly * s * .55)}" r="${f(s * .18)}"/>`;
  });
  return `<g fill="${cols[0]}">${a}</g><g fill="${cols[1]}">${b}</g><g fill="${cols[2]}" opacity=".8">${c}</g>${cols[3] ? `<g fill="${cols[3]}" opacity=".45">${d2}</g>` : ''}`;
}
function trunkPath(x, y, h, w, lean = 0, top = .35) {
  return `M${f(x - w)},${y} C${f(x - w * .7)},${f(y - h * .45)} ${f(x + lean - w * top * 1.6)},${f(y - h * .75)} ${f(x + lean - w * top)},${f(y - h)} L${f(x + lean + w * top)},${f(y - h)} C${f(x + lean + w * top * 1.6)},${f(y - h * .7)} ${f(x + w * .7)},${f(y - h * .45)} ${f(x + w)},${y}Z`;
}
// árvore de copa redonda com galhos
function tree(x, y, { h = 200, w = 14, crown = [130, 90], cols, bark = ['#4A3020', '#6B4A33'], seed = 1, lobes = 4, lean = 0, lx = -.55, ly = -.8, n = 22, spread = 1 } = {}) {
  const r = rng(seed); let g = '';
  const tx = x + lean, ty = y - h;
  g += `<path d="${trunkPath(x, y, h, w, lean)}" fill="${bark[0]}"/>`;
  g += `<path d="M${f(x + lx * w * .4)},${y - 6} C${f(x + lx * w * .3)},${f(y - h * .4)} ${f(tx + lx * w * .3)},${f(y - h * .7)} ${f(tx)},${f(ty + 8)}" stroke="${bark[1]}" stroke-width="${f(w * .45)}" stroke-linecap="round" fill="none" opacity=".8"/>`;
  const L = [];
  for (let i = 0; i < lobes; i++) { const t = lobes === 1 ? 0 : i / (lobes - 1) - .5; L.push([tx + t * crown[0] * 1.2 * spread + (r() - .5) * 20, ty - crown[1] * .25 - Math.cos(t * Math.PI) * crown[1] * .45 + (r() - .5) * 16, crown[0] * (.5 + r() * .18), crown[1] * (.5 + r() * .15)]); }
  L.forEach(([cx, cy]) => g += `<path d="M${f(tx)},${f(ty + 10)} Q${f((tx + cx) / 2)},${f(ty - 4)} ${f(cx)},${f(cy + 10)}" stroke="${bark[0]}" stroke-width="${f(w * .55)}" stroke-linecap="round" fill="none"/>`);
  L.forEach(([cx, cy, rx, ry], i) => g += canopy(cx, cy, rx, ry, cols, seed * 13 + i, { n, lx, ly }));
  return g;
}
// coqueiro / palmeira genérica (folhas pinadas)
function palm(x, y, { h = 260, lean = 40, col = ['#2E6B3A', '#4C9550', '#86C06A'], trunk = ['#7A5A3C', '#A2805A'], seed = 1, fronds = 9, len = 120, droop = .5, nuts = true, w = 9 } = {}) {
  const r = rng(seed); let g = '';
  const tx = x + lean, ty = y - h, cx1 = x + lean * .1, cy1 = y - h * .55;
  // tronco afunilado
  const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14, px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx1 + t * t * tx, py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy1 + t * t * ty; pts.push([px, py, w * (1 - t * .38)]); }
  g += `<path d="M${pts.map(p => `${f(p[0] - p[2])},${f(p[1])}`).join(' L')} L${pts.slice().reverse().map(p => `${f(p[0] + p[2])},${f(p[1])}`).join(' L')}Z" fill="${trunk[0]}"/>`;
  g += `<path d="M${pts.map(p => `${f(p[0] - p[2] * .2)},${f(p[1])}`).join(' L')}" stroke="${trunk[1]}" stroke-width="${f(w * .5)}" fill="none" opacity=".7"/>`;
  pts.forEach((p, i) => { if (i % 1 === 0 && i < 14) g += `<path d="M${f(p[0] - p[2])},${f(p[1])} q${f(p[2])},${f(-3)} ${f(p[2] * 2)},0" stroke="${trunk[0]}" stroke-width="1.6" fill="none" opacity=".9" filter=""/>`; });
  // folhas
  const fr = [];
  for (let i = 0; i < fronds; i++) { const a = -Math.PI / 2 + (i / (fronds - 1) - .5) * Math.PI * 1.55 + (r() - .5) * .2; fr.push(a); }
  fr.sort((a, b) => Math.abs(Math.cos(b)) - Math.abs(Math.cos(a)));
  fr.forEach((a, i) => {
    const L = len * (.8 + r() * .3), c = col[i % 2 ? 1 : 0];
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + L * droop * (Math.abs(Math.cos(a)) * .9 + .1);
    const mx = tx + Math.cos(a) * L * .55, my = ty + Math.sin(a) * L * .7 - L * .12;
    let leaf = `<path d="M${f(tx)},${f(ty)} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${c}" stroke-width="3" fill="none"/>`;
    for (let k = 1; k <= 16; k++) {
      const t = k / 17, px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey;
      const dx = 2 * (1 - t) * (mx - tx) + 2 * t * (ex - mx), dy = 2 * (1 - t) * (my - ty) + 2 * t * (ey - my), dl = Math.hypot(dx, dy), nx = -dy / dl, ny = dx / dl;
      const ll = L * .26 * Math.sin(Math.PI * (t * .85 + .1));
      [1, -1].forEach(sg => leaf += `<path d="M${f(px)},${f(py)} q${f(nx * sg * ll * .5 + dx / dl * ll * .3)},${f(ny * sg * ll * .5 + ll * .25)} ${f(nx * sg * ll * .7 + dx / dl * ll * .5)},${f(ny * sg * ll * .7 + ll * .55)}" stroke="${sg > 0 ? c : col[2]}" stroke-width="${f(2.6 - t * 1.2)}" stroke-linecap="round" fill="none"/>`);
    }
    g += leaf;
  });
  if (nuts) g += [[-8, 8], [6, 10], [-1, 16], [10, 3]].map(([dx, dy]) => `<circle cx="${f(tx + dx)}" cy="${f(ty + dy)}" r="7" fill="#6E7A2E"/><circle cx="${f(tx + dx - 2)}" cy="${f(ty + dy - 2)}" r="2.5" fill="#A8B45A"/>`).join('');
  return g;
}
// buriti / carandá (folhas em leque)
function fanPalm(x, y, { h = 240, col = ['#3B6B34', '#5E9447', '#9CC46A'], trunk = ['#6A5A48', '#8C7A62'], seed = 2, n = 11, len = 70, w = 8, skirt = '#9C7A4A' } = {}) {
  const r = rng(seed); let g = `<path d="M${x - w},${y} L${x - w * .7},${y - h} L${x + w * .7},${y - h} L${x + w},${y}Z" fill="${trunk[0]}"/><path d="M${x - w * .2},${y} L${x - w * .1},${y - h}" stroke="${trunk[1]}" stroke-width="${w * .5}" opacity=".6"/>`;
  for (let k = 0; k < h; k += 9) g += `<path d="M${x - w},${y - k} h${w * 2}" stroke="${trunk[0]}" stroke-width="1.5" opacity=".6"/>`;
  const tx = x, ty = y - h;
  g += `<path d="M${tx - 16},${ty + 4} Q${tx},${ty + 46} ${tx + 16},${ty + 4}Z" fill="${skirt}"/>`;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - .5) * Math.PI * 1.7 + (r() - .5) * .15, L = len * (.85 + r() * .3), c = col[i % 3 === 0 ? 0 : 1];
    const px = tx + Math.cos(a) * L * .55, py = ty + Math.sin(a) * L * .45 + (Math.abs(Math.cos(a)) * L * .2);
    g += `<path d="M${tx},${ty} L${f(px)},${f(py)}" stroke="${trunk[0]}" stroke-width="2.4"/>`;
    let fan = ''; const fa = a, spread = 1.1;
    for (let k = 0; k < 13; k++) { const b = fa + (k / 12 - .5) * spread, ll = L * .6 * (.7 + r() * .35), dr = ll * (.15 + Math.abs(Math.cos(b)) * .35); fan += `<path d="M${f(px)},${f(py)} Q${f(px + Math.cos(b) * ll * .6)},${f(py + Math.sin(b) * ll * .6)} ${f(px + Math.cos(b) * ll)},${f(py + Math.sin(b) * ll + dr)}" stroke="${k % 3 ? c : col[2]}" stroke-width="${f(3.4 - Math.abs(k - 6) * .15)}" stroke-linecap="round" fill="none"/>`; }
    g += fan;
  }
  return g;
}
// samambaiaçu (feto arborescente)
function treeFern(x, y, { h = 150, col = ['#3E7D3A', '#6AA84F', '#A6D27A'], seed = 3, n = 10, len = 90 } = {}) {
  const r = rng(seed); let g = `<path d="M${x - 6},${y} Q${x - 2},${y - h / 2} ${x - 4},${y - h} L${x + 4},${y - h} Q${x + 3},${y - h / 2} ${x + 6},${y}Z" fill="#4A3A2A"/>`;
  for (let k = 8; k < h; k += 10) g += `<path d="M${x - 6},${y - k} q6,-4 12,0" stroke="#33281C" stroke-width="2" fill="none"/>`;
  const tx = x, ty = y - h;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - .5) * Math.PI * 1.65, L = len * (.8 + r() * .35), c = col[i % 2];
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .4 + L * .45 * Math.abs(Math.cos(a)) + 10, mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .6 - 8;
    g += `<path d="M${tx},${ty} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${c}" stroke-width="2.2" fill="none"/>`;
    for (let k = 1; k < 18; k++) { const t = k / 18, px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey, ll = 13 * Math.sin(Math.PI * (t * .9 + .05)); g += `<path d="M${f(px)},${f(py)} l${f(-ll * .5)},${f(ll * .7)} M${f(px)},${f(py)} l${f(ll * .5)},${f(ll * .7)}" stroke="${k % 3 ? c : col[2]}" stroke-width="2.2" stroke-linecap="round"/>`; }
  }
  return g;
}
// embaúba (copa em guarda-chuva com folhas palmadas prateadas)
function embauba(x, y, { h = 260, seed = 4, col = ['#7FA08A', '#A9C4B0', '#DDE9DF'] } = {}) {
  const r = rng(seed); let g = `<path d="M${x - 5},${y} L${x - 3},${y - h} L${x + 3},${y - h} L${x + 5},${y}Z" fill="#D9D4C4"/><path d="M${x + 1},${y} L${x + 1},${y - h}" stroke="#B8B2A0" stroke-width="2"/>`;
  for (let k = 20; k < h; k += 22) g += `<path d="M${x - 5},${y - k} h10" stroke="#9E9886" stroke-width="1.4"/>`;
  const tips = [[-70, -40], [-30, -70], [20, -78], [66, -44], [0, -30]];
  tips.forEach(([dx, dy], i) => {
    const bx = x + dx, by = y - h + dy;
    g += `<path d="M${x},${y - h + 30} Q${f(x + dx * .3)},${f(y - h + dy * .2)} ${f(bx)},${f(by)}" stroke="#CFC9B6" stroke-width="4" fill="none"/>`;
    for (let k = 0; k < 7; k++) { const a = -Math.PI + k / 6 * Math.PI, L = 26 + r() * 6; g += `<ellipse cx="${f(bx + Math.cos(a) * L * .55)}" cy="${f(by + Math.sin(a) * L * .35 + 6)}" rx="${f(L * .5)}" ry="7" transform="rotate(${f(a * 180 / Math.PI)} ${f(bx + Math.cos(a) * L * .55)} ${f(by + Math.sin(a) * L * .35 + 6)})" fill="${col[(k + i) % 3]}"/>`; }
  });
  return g;
}
// cacto colunar (mandacaru) com braços
function cactus(x, y, { h = 220, w = 18, arms = [[.45, -1, 70, 60], [.6, 1, 60, 50]], col = ['#4F7F5A', '#6FA073', '#A4CBA0'] } = {}) {
  const col2 = col;
  const column = (x0, y0, x1, y1, ww) => `<path d="M${x0 - ww},${y0} L${x1 - ww},${y1 + ww} Q${x1 - ww},${y1 - ww * .2} ${x1},${y1 - ww * .2} Q${x1 + ww},${y1 - ww * .2} ${x1 + ww},${y1 + ww} L${x0 + ww},${y0}Z" fill="${col2[0]}"/>
    <path d="M${x0 - ww * .35},${y0} L${x1 - ww * .35},${y1 + ww * .5}" stroke="${col2[1]}" stroke-width="${ww * .5}" stroke-linecap="round"/><path d="M${x0 - ww * .45},${y0} L${x1 - ww * .45},${y1 + ww * .5}" stroke="${col2[2]}" stroke-width="${ww * .14}" stroke-linecap="round" opacity=".8"/>
    <path d="M${x0 + ww * .4},${y0} L${x1 + ww * .4},${y1 + ww * .5}" stroke="#2E5038" stroke-width="${ww * .12}" opacity=".5"/>`;
  let g = '';
  arms.forEach(([t, side, out, up]) => {
    const ay = y - h * t, ax = x + side * w * .6, ex = x + side * out;
    g += `<path d="M${ax},${ay + w * .4} Q${ex},${ay + w * .4} ${ex},${ay - 10}" stroke="${col[0]}" stroke-width="${w * 1.5}" fill="none" stroke-linecap="round"/>`;
    g += column(ex, ay - 6, ex, ay - up - 40, w * .72);
  });
  g += column(x, y, x, y - h, w);
  // flor branca (mandacaru floresce à noite) e espinhos
  g += Array.from({ length: Math.floor(h / 16) }, (_, i) => `<circle cx="${x + (i % 2 ? w * .6 : -w * .2)}" cy="${y - 10 - i * 16}" r="1.3" fill="#F4EBD0" opacity=".8"/>`).join('');
  return g;
}
// galho seco/arbusto cinzento (caatinga)
function dryBush(x, y, s, seed, col = '#8B8378', leaf = null) {
  const r = rng(seed); let g = '';
  const br = (bx, by, a, L, w, d) => { if (d > 4 || L < 6) return; const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L; g += `<path d="M${f(bx)},${f(by)} L${f(ex)},${f(ey)}" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round"/>`; if (leaf && d >= 3) g += `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(3 + r() * 3)}" fill="${leaf}" opacity=".85"/>`; br(ex, ey, a - .35 - r() * .35, L * (.65 + r() * .15), w * .66, d + 1); br(ex, ey, a + .3 + r() * .35, L * (.6 + r() * .2), w * .64, d + 1); };
  for (let i = 0; i < 3; i++) br(x + (i - 1) * 6 * s, y, -Math.PI / 2 + (i - 1) * .45, 46 * s, 5 * s, 0);
  return g;
}
// tufo de capim / grama (lâminas afiladas)
function grass(seed, n, x0, x1, y0, y1, cols, hmin = 8, hmax = 24, lean = 0, wid = 2.2) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), k = (y - y0) / (y1 - y0 + .01), h = (hmin + r() * (hmax - hmin)) * (.6 + k * .6), c = cols[Math.floor(r() * cols.length)];
    const bl = 3 + Math.floor(r() * 3);
    for (let j = 0; j < bl; j++) { const b = (r() - .5) * h * .8 + lean * h, w = wid * (.55 + k * .6), ox = (r() - .5) * 9 * (.5 + k), hh = h * (.6 + r() * .5); g += `<path d="M${f(x + ox - w)},${f(y)} Q${f(x + ox + b * .25)},${f(y - hh * .6)} ${f(x + ox + b)},${f(y - hh)} Q${f(x + ox + b * .2 + w * .2)},${f(y - hh * .5)} ${f(x + ox + w)},${f(y)}Z" fill="${c}"/>`; }
  }
  return g;
}
function flowers(seed, n, x0, x1, y0, y1, cols, r0 = 2.2) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), k = (y - y0) / (y1 - y0 + .01), rr = r0 * (.6 + k * .9); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${cols[i % cols.length]}"/><circle cx="${f(x - rr * .3)}" cy="${f(y - rr * .3)}" r="${f(rr * .35)}" fill="#fff" opacity=".6"/>`; }
  return g;
}
// folhagem grande de primeiro plano (silhueta para enquadrar)
function bigLeaves(x, y, s, seed, cols = ['#1F3D2A', '#2B5236'], dir = 1, n = 6) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) {
    const a = (-80 + i * (100 / n) + (r() - .5) * 18) * dir, L = (140 + r() * 90) * s, wd = L * (.26 + r() * .08), c = cols[i % cols.length];
    g += `<g transform="translate(${x},${y}) rotate(${f(a)})"><path d="M0,0 Q${f(wd)},${f(-L * .45)} 0,${f(-L)} Q${f(-wd)},${f(-L * .45)} 0,0Z" fill="${c}"/><path d="M0,0 Q${f(wd * .06)},${f(-L * .5)} 0,${f(-L * .96)}" stroke="${mix(c, '#000000', .25)}" stroke-width="${f(2 * s)}" fill="none" opacity=".7"/>${[.25, .4, .55, .7].map(t => `<path d="M0,${f(-L * t)} q${f(wd * .5)},${f(-L * .05)} ${f(wd * .75)},${f(-L * .12)} M0,${f(-L * t)} q${f(-wd * .5)},${f(-L * .05)} ${f(-wd * .75)},${f(-L * .12)}" stroke="${mix(c, '#000000', .2)}" stroke-width="${f(1.4 * s)}" fill="none" opacity=".5"/>`).join('')}</g>`;
  }
  return g;
}
function bromelia(x, y, s = 1, col = ['#3F7A3E', '#6FAE55'], flower = '#E2483D') {
  let g = '';
  [-70, -45, -20, 0, 20, 45, 70].forEach((a, i) => g += `<path transform="translate(${x},${y}) rotate(${a}) scale(${s})" d="M-6,0 Q-8,-30 0,-${48 + (3 - Math.abs(i - 3)) * 8} Q8,-30 6,0Z" fill="${col[i % 2]}"/>`);
  g += `<path transform="translate(${x},${y}) scale(${s})" d="M-6,-20 L0,-62 L6,-20Z" fill="${flower}"/><circle cx="${x}" cy="${y - 60 * s}" r="${4 * s}" fill="#F7C948"/>`;
  return g;
}
function rock(x, y, w, h, cols = ['#7D7266', '#A0968A', '#C9C0B2'], seed = 1) {
  const r = rng(seed); const pts = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([x + Math.cos(a) * w * (0.85 + r() * .2), y + Math.sin(a) * h * (.8 + r() * .25)]); }
  const d = `M${f(x - w)},${y} L${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')} L${f(x + w)},${y}Z`;
  return `<path d="${d}" fill="${cols[0]}"/><path d="M${f(x - w * .8)},${f(y - h * .2)} Q${f(x - w * .5)},${f(y - h * .95)} ${f(x + w * .15)},${f(y - h * .9)} Q${f(x - w * .2)},${f(y - h * .5)} ${f(x - w * .6)},${f(y - h * .05)}Z" fill="${cols[1]}"/><path d="M${f(x - w * .5)},${f(y - h * .7)} Q${f(x - w * .2)},${f(y - h * .92)} ${f(x + w * .05)},${f(y - h * .86)}" stroke="${cols[2]}" stroke-width="${f(Math.max(2, h * .08))}" stroke-linecap="round" fill="none" opacity=".8"/>`;
}

// ---------------------------------------------------------------------------------------------
// Fauna (pequena, estilizada, sem contorno; sempre com sombra de contato quando no chão)
// ---------------------------------------------------------------------------------------------
const shadowE = (x, y, rx, o = .25, c = '#2A1A10') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * .18)}" fill="${c}" opacity="${o}"/>`;
const T = (x, y, s, flip, inner) => `<g transform="translate(${f(x)},${f(y)}) scale(${flip ? -s : s},${s})">${inner}</g>`;
function birdV(x, y, s = 1, col = '#4A3A40', o = .8) { return `<path transform="translate(${x},${y}) scale(${s})" d="M-12,0 Q-6,-7 0,0 Q6,-7 12,0 Q6,-4 0,2 Q-6,-4 -12,0Z" fill="${col}" opacity="${o}"/>`; }
// quadrúpede paramétrico (boi, cavalo, jumento, lobo, capivara)
function quad(x, y, s, flip, o) {
  const { bl = 70, bh = 34, leg = 36, col = '#8A5A3C', dark = mix(col, '#000000', .3), light = mix(col, '#FFFFFF', .25), neck = [30, -26], head = [26, 14], headA = 30, ear = 'small', tail = 'thin', legCol = dark, mane = null, hump = 0, snout = null, eye = '#1A120C' } = o;
  let g = shadowE(0, 0, bl * .7);
  const by = -leg - bh / 2;
  // pernas de trás (mais escuras)
  const legP = (lx0, c, bend) => `<path d="M${lx0},${by + bh * .1} L${lx0 + bl * .12},${by + bh * .1} Q${lx0 + bl * .1 + bend},${by + bh * .5 + leg * .45} ${lx0 + bl * .075},${-2} L${lx0 + bl * .025},${-2} Q${lx0 + bend * .5},${by + bh * .5 + leg * .45} ${lx0},${by + bh * .1}Z" fill="${c}"/><rect x="${lx0 + bl * .015}" y="-4" width="${bl * .07}" height="4" rx="1.5" fill="${mix(c, '#000000', .45)}"/>`;
  g += legP(-bl * .4, mix(legCol, '#000000', .22), 3) + legP(bl * .24, mix(legCol, '#000000', .22), -3);
  // cauda
  if (tail === 'thin') g += `<path d="M${-bl * .48},${by - bh * .2} Q${-bl * .6},${by + bh * .3} ${-bl * .56},${by + bh * .9}" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="${-bl * .56}" cy="${by + bh * .95}" rx="3.5" ry="6" fill="${dark}"/>`;
  if (tail === 'bushy') g += `<path d="M${-bl * .46},${by - bh * .1} Q${-bl * .75},${by + bh * .1} ${-bl * .72},${by + bh * .9} Q${-bl * .6},${by + bh * .4} ${-bl * .46},${by + bh * .2}Z" fill="${col}"/><path d="M${-bl * .72},${by + bh * .9} q-2,-12 4,-16 q2,10 -4,16z" fill="#F4EEE2"/>`;
  if (tail === 'horse') g += `<path d="M${-bl * .48},${by - bh * .25} Q${-bl * .72},${by + bh * .1} ${-bl * .62},${by + bh * 1.1} Q${-bl * .55},${by + bh * .3} ${-bl * .42},${by}Z" fill="${mane || dark}"/>`;
  // corpo
  g += `<path d="M${-bl * .5},${by} Q${-bl * .52},${by - bh * .55} ${-bl * .25},${by - bh * .5 - hump * .3} Q${0},${by - bh * .55} ${bl * .2},${by - bh * .5 - hump} Q${bl * .52},${by - bh * .55} ${bl * .5},${by} Q${bl * .48},${by + bh * .55} ${bl * .1},${by + bh * .5} Q${-bl * .45},${by + bh * .6} ${-bl * .5},${by}Z" fill="${col}"/>`;
  g += `<path d="M${-bl * .42},${by - bh * .2} Q${0},${by - bh * .5} ${bl * .38},${by - bh * .25}" stroke="${light}" stroke-width="${bh * .22}" fill="none" stroke-linecap="round" opacity=".55"/>`;
  g += `<path d="M${-bl * .4},${by + bh * .38} Q${0},${by + bh * .55} ${bl * .4},${by + bh * .35}" stroke="${dark}" stroke-width="${bh * .16}" fill="none" stroke-linecap="round" opacity=".45"/>`;
  // pernas da frente
  g += legP(-bl * .3, legCol, -2) + legP(bl * .34, legCol, 2);
  // pescoço + cabeça
  const nx = bl * .42 + neck[0], ny = by + neck[1];
  g += `<path d="M${bl * .22},${by - bh * .45} Q${nx - 4},${ny - 8} ${nx + 4},${ny - 4} L${nx + 8},${ny + head[1] * .6} Q${bl * .5},${by + bh * .1} ${bl * .42},${by + bh * .2}Z" fill="${col}"/>`;
  if (mane) g += `<path d="M${bl * .2},${by - bh * .48} Q${nx - 8},${ny - 14} ${nx + 2},${ny - 8} L${nx - 2},${ny} Q${bl * .4},${by - bh * .4} ${bl * .24},${by - bh * .34}Z" fill="${mane}"/>`;
  g += `<g transform="translate(${nx + 4},${ny}) rotate(${headA})"><ellipse cx="${head[0] * .45}" cy="0" rx="${head[0] * .6}" ry="${head[1] * .55}" fill="${col}"/><ellipse cx="${head[0] * .85}" cy="${head[1] * .1}" rx="${head[0] * .3}" ry="${head[1] * .42}" fill="${snout || dark}"/><circle cx="${head[0] * .25}" cy="${-head[1] * .15}" r="${Math.max(1.6, head[1] * .1)}" fill="${eye}"/>`;
  if (ear === 'small') g += `<path d="M${-head[0] * .05},${-head[1] * .35} l${-head[0] * .2},${-head[1] * .5} l${head[0] * .25},${head[1] * .2}z" fill="${dark}"/>`;
  if (ear === 'big') g += `<path d="M${-head[0] * .05},${-head[1] * .3} q${-head[0] * .3},${-head[1] * 1.6} ${-head[0] * .05},${-head[1] * 1.5} q${head[0] * .25},${head[1] * .8} ${head[0] * .2},${head[1] * 1.15}z" fill="${col}"/><path d="M${-head[0] * .02},${-head[1] * .5} q${-head[0] * .12},${-head[1] * .8} ${-head[0] * .02},${-head[1] * .9}" stroke="${dark}" stroke-width="2" fill="none"/>`;
  if (ear === 'fox') g += `<path d="M${-head[0] * .05},${-head[1] * .3} l${-head[0] * .05},${-head[1] * 1.4} l${head[0] * .35},${head[1] * 1.0}z M${head[0] * .2},${-head[1] * .3} l${head[0] * .2},${-head[1] * 1.3} l${head[0] * .2},${head[1] * 1.1}z" fill="${col}"/>`;
  if (ear === 'horns') g += `<path d="M${-head[0] * .05},${-head[1] * .4} q${-head[0] * .35},${-head[1] * .2} ${-head[0] * .3},${-head[1] * .8}" stroke="#EDE3CC" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${-head[0] * .1},${-head[1] * .2} l${-head[0] * .35},${-head[1] * .05} l${head[0] * .25},${head[1] * .25}z" fill="${dark}"/>`;
  g += `</g>`;
  return T(x, y, s, flip, g);
}
const boi = (x, y, s = 1, flip = false, col = '#EDE6DA') => quad(x, y, s, flip, { bl: 74, bh: 38, leg: 30, col, neck: [14, -16], head: [26, 18], headA: 50, ear: 'horns', hump: 10, snout: '#C9B8A4', legCol: mix(col, '#000000', .15) });
const cavalo = (x, y, s = 1, flip = false, col = '#7A4A2E', mane = '#2E1C12') => quad(x, y, s, flip, { bl: 72, bh: 32, leg: 44, col, neck: [26, -34], head: [30, 15], headA: 58, ear: 'small', tail: 'horse', mane });
const jumento = (x, y, s = 1, flip = false) => quad(x, y, s, flip, { bl: 62, bh: 30, leg: 32, col: '#8E8780', neck: [20, -24], head: [30, 16], headA: 46, ear: 'big', mane: '#4A4440', snout: '#E6E0D6', light: '#B5AFA6' });
const lobo = (x, y, s = 1, flip = false) => quad(x, y, s, flip, { bl: 62, bh: 24, leg: 48, col: '#C8642A', legCol: '#1E140E', neck: [20, -28], head: [26, 13], headA: 18, ear: 'fox', tail: 'bushy', mane: '#1E140E', snout: '#1E140E' });
const capivara = (x, y, s = 1, flip = false) => {
  const c = '#8A5E3A';
  return T(x, y, s, flip, `${shadowE(0, 0, 40)}<path d="M-42,-10 Q-46,-44 -10,-46 Q30,-48 42,-30 Q48,-14 40,-6 Q0,2 -42,-10Z" fill="${c}"/><path d="M-36,-36 Q0,-50 34,-36" stroke="#A47650" stroke-width="7" fill="none" opacity=".6" stroke-linecap="round"/>
  <path d="M26,-44 Q40,-58 58,-46 Q66,-38 64,-26 Q56,-18 40,-22Z" fill="${c}"/><rect x="56" y="-40" width="10" height="16" rx="5" fill="#5A3A22"/><circle cx="46" cy="-44" r="2.2" fill="#1A100A"/><ellipse cx="34" cy="-52" rx="4" ry="5" fill="#6A4628"/>
  <rect x="-30" y="-14" width="9" height="14" rx="4" fill="#5E3E24"/><rect x="22" y="-14" width="9" height="14" rx="4" fill="#5E3E24"/><rect x="-18" y="-12" width="9" height="12" rx="4" fill="#6E4A2C"/><rect x="30" y="-12" width="9" height="12" rx="4" fill="#6E4A2C"/>`);
};
function tatu(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 30)}<path d="M-30,-4 Q-30,-38 0,-40 Q30,-38 30,-4Z" fill="#B48A58"/>${[-18, -9, 0, 9, 18].map(dx => `<path d="M${dx},-39 Q${dx + 2},-20 ${dx},-4" stroke="#8C6638" stroke-width="2.2" fill="none"/>`).join('')}<path d="M-24,-26 Q0,-38 24,-26" stroke="#D9B884" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
  <path d="M26,-14 Q40,-24 52,-10 Q40,-4 28,-6Z" fill="#C9A06C"/><path d="M30,-20 l4,-12 l4,10z" fill="#C9A06C"/><circle cx="40" cy="-14" r="1.8" fill="#1A100A"/><path d="M-30,-10 q-14,2 -20,8" stroke="#A47E4E" stroke-width="5" stroke-linecap="round" fill="none"/>`);
}
function ema(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 28)}<path d="M-6,-40 L-10,0 M8,-40 L12,0" stroke="#6E6258" stroke-width="4" stroke-linecap="round"/><path d="M-36,-60 Q-40,-92 0,-94 Q30,-92 34,-70 Q30,-42 0,-40 Q-30,-40 -36,-60Z" fill="#9C948A"/><path d="M-34,-60 Q-20,-84 20,-84" stroke="#C2BBB0" stroke-width="10" fill="none" opacity=".6" stroke-linecap="round"/><path d="M-30,-56 Q-44,-50 -44,-38 Q-34,-46 -24,-46" fill="#7E766C"/>
  <path d="M22,-82 Q30,-120 32,-140" stroke="#857C72" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M22,-84 Q28,-100 30,-112" stroke="#2F2A26" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="35" cy="-142" rx="9" ry="6" fill="#8C8378"/><path d="M42,-143 l10,2 l-10,3z" fill="#D9C9A8"/><circle cx="36" cy="-144" r="1.6" fill="#1A120C"/>`);
}
function queroquero(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 10)}<path d="M-2,-10 L-3,0 M3,-10 L4,0" stroke="#D2557A" stroke-width="1.6"/><path d="M-16,-18 Q-10,-26 4,-24 Q12,-22 12,-14 Q6,-8 -6,-10 Q-14,-12 -16,-18Z" fill="#A9A79A"/><path d="M-2,-12 Q8,-10 12,-14 L12,-20 Q4,-16 -2,-14Z" fill="#fff"/><path d="M4,-24 Q12,-24 12,-18 L6,-18Z" fill="#2B2A28"/><circle cx="12" cy="-28" r="5.5" fill="#B9B7AA"/><path d="M8,-32 l-10,-4 l9,1z" fill="#2B2A28"/><path d="M17,-28 l6,1 l-6,2z" fill="#D2557A"/><circle cx="13" cy="-29" r="1.2" fill="#C2283C"/>`);
}
function tuiuiu(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-4,-40 L-6,0 M8,-40 L10,0" stroke="#1E1E22" stroke-width="3"/><path d="M-30,-62 Q-36,-90 0,-92 Q26,-90 28,-72 Q22,-44 -6,-42 Q-26,-44 -30,-62Z" fill="#F7F5F0"/><path d="M-30,-62 Q-38,-58 -42,-48 Q-30,-52 -22,-50Z" fill="#DCD8D0"/><path d="M-24,-80 Q-2,-90 20,-80" stroke="#fff" stroke-width="6" fill="none" opacity=".8"/>
  <path d="M14,-86 Q22,-104 20,-124" stroke="#151518" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M12,-84 Q22,-88 24,-96" stroke="#D3343A" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="-128" rx="9" ry="8" fill="#151518"/><path d="M26,-132 L62,-124 L28,-122Z" fill="#202024"/><path d="M28,-130 L58,-125" stroke="#4A4A50" stroke-width="1.5"/><circle cx="22" cy="-131" r="1.5" fill="#E8D9A0"/>`);
}
function garca(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-2,-30 L-4,0 M4,-30 L6,0" stroke="#2A2A2A" stroke-width="2"/><path d="M-22,-44 Q-24,-62 0,-62 Q16,-60 16,-48 Q12,-32 -4,-32 Q-18,-34 -22,-44Z" fill="#FAFAF6"/><path d="M-22,-44 L-34,-38 L-20,-38Z" fill="#E8E6E0"/><path d="M10,-56 Q20,-66 10,-78 Q2,-88 12,-96" stroke="#FAFAF6" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="15" cy="-97" rx="6" ry="4.5" fill="#FAFAF6"/><path d="M19,-98 L38,-95 L19,-94Z" fill="#E8B830"/><circle cx="16" cy="-98" r="1.1" fill="#222"/>`);
}
function seriema(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 14)}<path d="M-2,-30 L-4,0 M6,-30 L8,0" stroke="#C9573A" stroke-width="2.4"/><path d="M-26,-44 Q-28,-62 0,-62 Q18,-60 16,-44 Q10,-30 -6,-30 Q-22,-32 -26,-44Z" fill="#B8A38A"/><path d="M-26,-44 L-46,-30 L-22,-36Z" fill="#8E7A62"/><path d="M8,-56 Q14,-72 10,-84" stroke="#C4B094" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="-87" rx="7" ry="6" fill="#C4B094"/><path d="M19,-88 L30,-85 L19,-83Z" fill="#D2412E"/><path d="M8,-92 l-4,-12 l6,8 l0,-12 l4,12z" fill="#8E7A62"/><circle cx="14" cy="-89" r="1.6" fill="#222"/><circle cx="14" cy="-89" r="2.8" fill="none" stroke="#5E7FA8" stroke-width="1.2"/>`);
}
function coruja(x, y, s = 1) {
  return T(x, y, s, false, `${shadowE(0, 0, 12)}<path d="M-4,-14 L-5,0 M4,-14 L5,0" stroke="#8C7A5E" stroke-width="2"/><ellipse cx="0" cy="-30" rx="13" ry="18" fill="#8C6A44"/><ellipse cx="0" cy="-24" rx="8" ry="11" fill="#E8D8B8"/>${[[-6, -30], [5, -26], [-3, -20], [4, -36]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.5" fill="#8C6A44"/>`).join('')}<circle cx="0" cy="-52" r="11" fill="#8C6A44"/><circle cx="-4.5" cy="-53" r="4" fill="#F4D03F"/><circle cx="4.5" cy="-53" r="4" fill="#F4D03F"/><circle cx="-4.5" cy="-53" r="2" fill="#1A120C"/><circle cx="4.5" cy="-53" r="2" fill="#1A120C"/><path d="M-9,-47 Q0,-43 9,-47" stroke="#F4EEE2" stroke-width="2" fill="none"/><path d="M0,-50 l-1.5,4 l3,0z" fill="#D9C38A"/><path d="M-8,-58 Q0,-62 8,-58" stroke="#F4EEE2" stroke-width="1.6" fill="none"/>`);
}
function arara(x, y, s = 1, flip = false, kind = 'vermelha') {
  const body = kind === 'canide' ? '#2E7CC2' : '#D3342E', belly = kind === 'canide' ? '#F4C430' : '#C62A26', wing = kind === 'canide' ? '#2366A8' : '#2E6FBF', wing2 = kind === 'canide' ? '#1F5A94' : '#F2B33D';
  return T(x, y, s, flip, `<path d="M-2,8 L-14,70 L-6,72 L4,10Z" fill="${body}"/><path d="M-4,10 L-12,66" stroke="${wing}" stroke-width="3"/><path d="M-12,-24 Q-16,-2 -6,12 Q8,14 10,-4 Q12,-24 0,-30Z" fill="${belly}"/><path d="M-10,-20 Q-4,4 6,6 Q-2,-8 -2,-24Z" fill="${wing}"/><path d="M-8,-12 Q-4,-4 2,-2" stroke="${wing2}" stroke-width="4" fill="none"/><circle cx="2" cy="-30" r="10" fill="${body}"/><path d="M4,-36 Q12,-34 10,-24 Q4,-26 4,-36Z" fill="#F7F0E6"/><path d="M10,-34 Q22,-32 18,-20 Q14,-24 10,-24Z" fill="#2A2420"/><path d="M10,-34 Q18,-33 18,-26" stroke="#F0E6D6" stroke-width="2" fill="none"/><circle cx="6" cy="-32" r="1.5" fill="#111"/><path d="M-6,12 l-4,6 M2,12 l2,6" stroke="#3A3A3A" stroke-width="2"/>`);
}
function tucano(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-6,10 L-14,46 L-4,46 L2,10Z" fill="#141414"/><ellipse cx="0" cy="-6" rx="11" ry="18" fill="#141414"/><path d="M2,-22 Q12,-20 10,-8 Q4,-4 0,-10Z" fill="#F4E9C8"/><circle cx="2" cy="-26" r="9" fill="#141414"/><path d="M8,-30 Q34,-34 44,-22 Q34,-16 8,-20Z" fill="#F28C28"/><path d="M8,-26 Q30,-28 42,-23" stroke="#E04A1E" stroke-width="2" fill="none"/><path d="M38,-26 Q44,-24 44,-22 L38,-21Z" fill="#141414"/><circle cx="4" cy="-27" r="3.5" fill="#4FA3C7"/><circle cx="4" cy="-27" r="1.4" fill="#111"/><path d="M-4,10 h10" stroke="#C62A26" stroke-width="4"/>`);
}
function mico(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-8,0 Q-30,20 -24,60 Q-20,70 -26,80" stroke="#D98A1C" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-6" rx="11" ry="14" fill="#E89A22"/><path d="M-8,4 l-6,10 M8,4 l6,10" stroke="#C97A14" stroke-width="5" stroke-linecap="round"/><circle cx="2" cy="-26" r="15" fill="#F2A72A"/><circle cx="-4" cy="-30" r="12" fill="#F7B840" opacity=".7"/><ellipse cx="5" cy="-24" rx="7" ry="8" fill="#5A3A28"/><circle cx="3" cy="-26" r="1.4" fill="#111"/><circle cx="8" cy="-26" r="1.4" fill="#111"/>`);
}
function jacare(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<ellipse cx="0" cy="2" rx="70" ry="6" fill="#ffffff" opacity=".18"/><path d="M-80,0 Q-60,-10 -20,-12 Q20,-14 40,-10 L78,-6 Q84,-3 78,0Z" fill="#4E5A34"/>${[-60, -48, -36, -24, -12, 0, 12].map(dx => `<path d="M${dx},-11 l4,-5 l4,5z" fill="#3A4428"/>`).join('')}<ellipse cx="40" cy="-14" rx="6" ry="5" fill="#5E6B3E"/><circle cx="41" cy="-16" r="2" fill="#E8C64A"/><circle cx="41" cy="-16" r=".9" fill="#111"/><circle cx="74" cy="-7" r="1.5" fill="#2A3018"/><path d="M-80,0 Q-50,-3 78,-1" stroke="#7A8650" stroke-width="2" opacity=".6" fill="none"/>`);
}
function boto(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-60,10 Q-40,-50 20,-46 Q48,-42 60,-26 L74,-24 Q76,-18 70,-17 L56,-16 Q40,-20 18,-14 Q-20,-8 -44,18Z" fill="#E7A2A6"/><path d="M-44,-14 Q-10,-46 30,-42" stroke="#F7CACB" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-6,-44 Q2,-60 14,-50Z" fill="#D88A90"/><circle cx="48" cy="-30" r="2" fill="#3A2226"/><path d="M-60,10 l-14,-6 l4,16z" fill="#D88A90"/>`);
}
function peixe(x, y, s = 1, flip = false, c = '#F2A33A', c2 = '#FFD27A') {
  return T(x, y, s, flip, `<path d="M-24,0 Q-4,-16 18,-6 Q26,0 18,6 Q-4,16 -24,0Z" fill="${c}"/><path d="M-22,0 L-36,-10 L-32,0 L-36,10Z" fill="${c}"/><path d="M-14,-4 Q0,-12 14,-4" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="12" cy="-2" r="2" fill="#1A1A1A"/><path d="M-6,-10 l6,-6 l4,7z" fill="${mix(c, '#000000', .2)}"/>`);
}
function tartaruga(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-6,-14 Q-30,-46 -50,-40 Q-34,-26 -14,-8Z" fill="#7C9A5A"/><path d="M-6,14 Q-30,46 -46,42 Q-30,26 -14,8Z" fill="#6C8A4C"/><path d="M28,-10 Q40,-30 52,-26 Q44,-14 30,-4Z" fill="#7C9A5A"/><path d="M28,10 Q36,24 46,22 Q38,12 30,4Z" fill="#6C8A4C"/><ellipse cx="0" cy="0" rx="34" ry="24" fill="#8A6A3A"/>${[[-12, -8], [6, -10], [-14, 8], [8, 8], [20, 0], [-2, 0]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="7" ry="6" fill="#B08A4E"/>`).join('')}<ellipse cx="44" cy="0" rx="11" ry="9" fill="#8CA86A"/><circle cx="48" cy="-3" r="1.8" fill="#111"/>`);
}
function caranguejo(x, y, s = 1) {
  return T(x, y, s, false, `${shadowE(0, 2, 16)}${[-1, 1].map(d => `<path d="M${d * 8},-4 l${d * 10},4 l${d * 4},6 M${d * 10},-7 l${d * 12},2 l${d * 5},7" stroke="#C9452E" stroke-width="2" fill="none"/>`).join('')}<ellipse cx="0" cy="-8" rx="13" ry="8" fill="#E2583A"/><path d="M-12,-12 q-8,-8 -12,-4 q4,6 10,6z M12,-12 q8,-8 12,-4 q-4,6 -10,6z" fill="#E2583A"/><path d="M-4,-15 v-5 M4,-15 v-5" stroke="#C9452E" stroke-width="1.6"/><circle cx="-4" cy="-21" r="1.8" fill="#111"/><circle cx="4" cy="-21" r="1.8" fill="#111"/><ellipse cx="-3" cy="-11" rx="5" ry="2" fill="#F58A62" opacity=".7"/>`);
}
function fragata(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M0,0 L-34,-10 L-60,-2 L-30,-4 L-6,4 L-14,18 L-4,10 L4,18 L4,6 L30,-4 L62,-2 L34,-10Z" fill="#222026"/><path d="M-4,10 L-10,28 L0,16 L8,28 L4,10Z" fill="#222026"/><path d="M2,-2 l12,-2 l-10,4z" fill="#555"/><circle cx="2" cy="4" r="3" fill="#D2333A"/>`);
}
function borboleta(x, y, s = 1, c = '#3D7DE0', c2 = '#7FB8FF', rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M0,0 Q-14,-16 -18,-4 Q-16,6 0,2Z" fill="${c}"/><path d="M0,0 Q14,-16 18,-4 Q16,6 0,2Z" fill="${c}"/><path d="M0,2 Q-10,14 -4,14 Q0,10 0,2Z M0,2 Q10,14 4,14 Q0,10 0,2Z" fill="${mix(c, '#000000', .3)}"/><path d="M-4,-4 Q-10,-10 -14,-4 M4,-4 Q10,-10 14,-4" stroke="${c2}" stroke-width="2.5" fill="none" opacity=".8"/><path d="M0,-4 v14" stroke="#222" stroke-width="1.6"/></g>`;
}
function jabuti(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 30)}<path d="M-22,-4 v6 M14,-4 v6" stroke="#5A4A3A" stroke-width="7" stroke-linecap="round"/><path d="M-30,-4 Q-28,-38 0,-40 Q28,-38 30,-4Z" fill="#4A3828"/>${[[-14, -18], [0, -26], [14, -18], [-6, -10], [8, -10]].map(([a, b]) => `<path d="M${a - 6},${b} l6,-6 l6,6 l-6,6z" fill="#E8A23A" opacity=".9"/>`).join('')}<path d="M-26,-6 H26" stroke="#2E2218" stroke-width="3"/><path d="M28,-12 Q40,-22 46,-12 Q42,-4 30,-6Z" fill="#6A5A4A"/><circle cx="34" cy="-14" r="2.6" fill="#E25A2A"/><circle cx="41" cy="-14" r="1.6" fill="#111"/>`);
}
function pato(x, y, s = 1, flip = false, col = '#8C6E4A') {
  return T(x, y, s, flip, `<ellipse cx="0" cy="1" rx="24" ry="3" fill="#fff" opacity=".25"/><path d="M-22,0 Q-24,-18 -4,-18 Q14,-18 16,-6 Q14,0 -22,0Z" fill="${col}"/><path d="M-18,-6 Q-6,-16 8,-10" stroke="${mix(col, '#FFFFFF', .3)}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-22,-4 L-30,-14 L-18,-10Z" fill="${col}"/><path d="M8,-14 Q10,-30 18,-30 Q26,-30 24,-22 Q20,-16 14,-12Z" fill="#2F6E4A"/><path d="M23,-26 L32,-24 L23,-21Z" fill="#E8A830"/><circle cx="19" cy="-26" r="1.4" fill="#111"/><path d="M10,-14 h8" stroke="#fff" stroke-width="2"/>`);
}
function gato(x, y, s = 1, flip = false, c = '#E8A048') {
  return T(x, y, s, flip, `${shadowE(0, 0, 18)}<path d="M-14,0 Q-20,-30 -2,-34 Q14,-34 12,0Z" fill="${c}"/><path d="M-12,-4 Q-30,-2 -28,-18" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="2" cy="-40" r="11" fill="${c}"/><path d="M-6,-46 l-2,-10 l8,6z M8,-46 l4,-10 l2,10z" fill="${c}"/><path d="M-6,-24 q6,4 12,0 M-8,-14 q8,3 16,0" stroke="${mix(c, '#000000', .25)}" stroke-width="2" fill="none"/><circle cx="-2" cy="-41" r="1.6" fill="#222"/><circle cx="6" cy="-41" r="1.6" fill="#222"/><path d="M2,-37 l-1.4,1.6 h2.8z" fill="#C2566A"/>`);
}
function sapo(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 16)}<path d="M-16,0 Q-18,-20 0,-20 Q18,-20 16,0Z" fill="#4E9A3E"/><path d="M-18,0 q-6,-2 -6,-8 q6,0 10,6z M18,0 q6,-2 6,-8 q-6,0 -10,6z" fill="#3E8030"/><circle cx="-7" cy="-21" r="5" fill="#5DB04A"/><circle cx="7" cy="-21" r="5" fill="#5DB04A"/><circle cx="-7" cy="-22" r="2.4" fill="#111"/><circle cx="7" cy="-22" r="2.4" fill="#111"/><path d="M-8,-10 q8,5 16,0" stroke="#2E6A24" stroke-width="1.6" fill="none"/><ellipse cx="0" cy="-6" rx="9" ry="5" fill="#E8E2A0" opacity=".6"/>`);
}
function cachorro(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `${shadowE(0, 0, 22)}<path d="M-20,-30 q-12,-6 -10,-20" stroke="#B9824A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-22,-16 Q-24,-34 0,-34 Q16,-34 18,-20 Q14,-10 -22,-16Z" fill="#C98E52"/><path d="M-18,-14 v14 M-10,-14 v14 M8,-16 v16 M14,-18 v18" stroke="#A8743E" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="-38" r="10" fill="#C98E52"/><path d="M22,-36 q10,0 10,6 q-6,4 -12,0z" fill="#E8C49A"/><circle cx="31" cy="-34" r="2" fill="#222"/><path d="M12,-44 q-6,4 -4,14 q6,-4 6,-12z" fill="#8C5A2E"/><circle cx="20" cy="-40" r="1.6" fill="#222"/>`);
}
function asaBranca(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M0,0 Q-14,-14 -30,-10 Q-16,-4 -4,4Z" fill="#8C8C94"/><path d="M-12,-8 Q-22,-10 -28,-9" stroke="#F4F4F0" stroke-width="3" fill="none"/><path d="M0,0 Q14,-12 28,-18 Q18,-4 4,4Z" fill="#9C9CA4"/><path d="M10,-6 Q18,-12 24,-14" stroke="#F4F4F0" stroke-width="3" fill="none"/><ellipse cx="0" cy="2" rx="12" ry="5" fill="#8C8C94"/><circle cx="12" cy="0" r="4" fill="#8C8C94"/><path d="M-12,2 l-8,4 l2,-6z" fill="#7C7C84"/>`);
}
function calango(x, y, s = 1, flip = false) {
  return T(x, y, s, flip, `<path d="M-30,0 Q-10,-8 10,-4 Q22,-6 26,-2 Q22,2 10,2 Q-10,4 -30,0Z" fill="#5E8A4A"/><path d="M-30,0 Q-44,4 -54,0" stroke="#5E8A4A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-12,-2 l-6,8 M-12,0 l-4,-8 M8,-2 l6,8 M8,0 l4,-8" stroke="#4E7A3A" stroke-width="2.4" stroke-linecap="round"/><path d="M-20,-3 Q0,-8 16,-4" stroke="#A8C46A" stroke-width="2" fill="none"/><circle cx="20" cy="-3" r="1.2" fill="#111"/>`);
}
function baleiaCauda(x, y, s = 1) {
  return T(x, y, s, false, `<path d="M0,0 Q-4,-24 0,-34 Q-20,-44 -40,-40 Q-20,-34 -8,-30 L0,-30 L8,-30 Q20,-34 40,-40 Q20,-44 0,-34" fill="#3A4A5C"/><path d="M-30,2 Q0,-4 30,2" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>${[[-16, -46], [-6, -52], [10, -48]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2" fill="#fff" opacity=".7"/>`).join('')}`);
}
function abelhas(x, y, n, seed) { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const a = x + (r() - .5) * 40, b = y + (r() - .5) * 30; g += `<ellipse cx="${f(a)}" cy="${f(b)}" rx="2.6" ry="1.8" fill="#E8B830"/><ellipse cx="${f(a - 1)}" cy="${f(b - 2.4)}" rx="2" ry="1.4" fill="#fff" opacity=".7"/>`; } return g; }
function particles(seed, n, x0, x1, y0, y1, col = '#FFF4C8', rmax = 2.6, o = .7) { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) g += `<circle cx="${f(x0 + r() * (x1 - x0))}" cy="${f(y0 + r() * (y1 - y0))}" r="${f(.6 + r() * rmax)}" fill="${col}" opacity="${f(o * (.3 + r() * .7))}"/>`; return g; }

// ---------------------------------------------------------------------------------------------
// Água
// ---------------------------------------------------------------------------------------------
function shimmer(seed, n, x0, x1, y0, y1, col = '#FFFFFF', o = .5, focusX = null, wmax = 40) {
  const r = rng(seed); let g = '';
  for (let i = 0; i < n; i++) {
    let x = x0 + r() * (x1 - x0); const y = y0 + Math.pow(r(), 1.4) * (y1 - y0), k = (y - y0) / (y1 - y0 + .01);
    if (focusX != null && r() < .55) x = focusX + (r() - .5) * (60 + k * 220);
    const w = (6 + r() * wmax) * (.4 + k * 1.2);
    g += `<path d="M${f(x - w / 2)},${f(y)} h${f(w)}" stroke="${col}" stroke-width="${f(1 + k * 1.8)}" stroke-linecap="round" opacity="${f(o * (.3 + r() * .7))}"/>`;
  }
  return g;
}
// reflexo: espelha um <g id> no eixo y=axis, recortado na área da água
function reflection(s, id, axis, clipD, o = .35, bl = 2.5, tint = null) {
  return `<g clip-path="${s.clip(`<path d="${clipD}"/>`)}"><g opacity="${o}" filter="${s.blur(bl)}"><use href="#${id}" transform="matrix(1,0,0,-1,0,${2 * axis})"/></g>${tint ? `<path d="${clipD}" fill="${tint}" opacity=".25"/>` : ''}</g>`;
}

// ---------------------------------------------------------------------------------------------
// Arquitetura simples
// ---------------------------------------------------------------------------------------------
function house(x, y, w, h, { wall = '#F2D8A8', roof = '#B5541E', door = '#6B3E22', win = '#4A6A7A', shade = .14, roofH = 40, lit = false, trim = '#FFF6E6', side = 0 } = {}) {
  let g = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${wall}"/>`;
  if (side) g += `<path d="M${x + w},${y} L${x + w},${y - h} L${x + w + side},${y - h - side * .25} L${x + w + side},${y - side * .25}Z" fill="${mix(wall, '#3A2218', .28)}"/>`;
  g += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#3A2218" opacity="0"/><rect x="${x}" y="${y - 10}" width="${w}" height="10" fill="#3A2218" opacity=".12"/>`;
  g += `<path d="M${x - 8},${y - h + 2} L${x + w / 2},${y - h - roofH} L${x + w + 8 + side},${y - h + 2 - side * .1}Z" fill="${roof}"/><path d="M${x - 8},${y - h + 2} L${x + w + 8 + side},${y - h + 2 - side * .1}" stroke="${mix(roof, '#000000', .3)}" stroke-width="5"/>`;
  g += `<path d="M${x},${y - h + 6} h${w}" stroke="#3A2218" stroke-width="8" opacity="${shade}"/>`;
  const dw = Math.min(26, w * .22);
  g += `<rect x="${x + w * .5 - dw / 2}" y="${y - dw * 1.9}" width="${dw}" height="${dw * 1.9}" rx="${dw * .1}" fill="${door}"/>`;
  [x + w * .2, x + w * .8].forEach(cx => { if (w > 60) g += `<rect x="${cx - dw * .45}" y="${y - h * .62}" width="${dw * .9}" height="${dw * .9}" fill="${lit ? '#FFD27A' : win}" stroke="${trim}" stroke-width="3"/>${lit ? `<circle cx="${cx}" cy="${y - h * .62 + dw * .45}" r="${dw * 1.4}" fill="#FFC86A" opacity=".18"/>` : ''}`; });
  return g;
}

// sombra projetada longa (luz baixa)
const castShadow = (s, x, y, len, wid, ang = 0, o = .28, c = '#4A2A14') => `<ellipse cx="${f(x + Math.cos(ang) * len / 2)}" cy="${f(y + Math.sin(ang) * len * .18)}" rx="${f(len / 2)}" ry="${f(wid)}" fill="${c}" opacity="${o}" filter="${s.blur(6)}"/>`;
// sombra de contato genérica
const contact = (x, y, rx, o = .3) => shadowE(x, y, rx, o);

module.exports = { W, H, f, rng, mix, Scene, finish, sky, sunGlow, rays, cloud, ridge, mesa, canopy, trunkPath, tree, palm, fanPalm, treeFern, embauba, cactus, dryBush, grass, flowers, bigLeaves, bromelia, rock, shadowE, T, birdV, quad, boi, cavalo, jumento, lobo, capivara, tatu, ema, queroquero, tuiuiu, garca, seriema, coruja, arara, tucano, mico, jacare, boto, peixe, tartaruga, caranguejo, fragata, borboleta, jabuti, pato, gato, sapo, cachorro, asaBranca, calango, baleiaCauda, abelhas, particles, shimmer, reflection, house, contact, castShadow };
