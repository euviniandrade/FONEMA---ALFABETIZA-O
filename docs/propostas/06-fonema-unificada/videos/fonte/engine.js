// Motor determinístico: tudo é função de t (segundos). Nada de timers/CSS animation.
const Q = new URLSearchParams(location.search);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const win = (t, a, b, fi = .4, fo = .4) => Math.min(eo(prog(t, a, a + fi)), 1 - eio(prog(t, b - fo, b)));
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function css(el, o) {
  if (typeof el === 'string') el = $(el);
  if (!el) return;
  const tr = [];
  if (o.x != null || o.y != null) tr.push(`translate(${o.x || 0}px,${o.y || 0}px)`);
  if (o.r != null) tr.push(`rotate(${o.r}deg)`);
  if (o.s != null) tr.push(`scale(${o.s})`);
  if (tr.length) el.style.transform = tr.join(' ');
  if (o.o != null) { el.style.opacity = o.o; el.style.visibility = o.o <= 0.001 ? 'hidden' : 'visible'; }
}
function captions(t, list) {
  const el = $('#cap'); let cur = null;
  for (const c of list) if (t >= c.a && t < c.b) cur = c;
  if (!cur) { el.style.opacity = 0; el.dataset.k = ''; return; }
  const k = cur.a + '';
  if (el.dataset.k !== k) { el.innerHTML = (cur.who ? `<span class="who">${cur.who}</span>` : '') + cur.html; el.dataset.k = k; }
  const o = Math.min(prog(t, cur.a, cur.a + .18), 1 - prog(t, cur.b - .15, cur.b));
  el.style.opacity = o;
  el.style.transform = `translateX(-50%) translateY(${(1 - eo(prog(t, cur.a, cur.a + .25))) * 10}px)`;
}
function blinkAt(t, seeds = [1.7, 4.3, 7.9, 10.6, 13.2, 16.8, 19.4, 23.1, 26.0, 29.3, 32.5, 35.6, 38.4, 41.7]) {
  for (const s of seeds) { const d = t - s; if (d >= 0 && d < .16) return 1 - Math.sin(d / .16 * Math.PI) * .92; }
  return 1;
}
function along(path, f) { const L = path.getTotalLength(); return path.getPointAtLength(clamp(f) * L); }
// boca falando (determinística) a partir das legendas; janelas de fonema = boca fechada
function mouthFor(t, caps, snd = []) {
  if (snd.some(([a, b]) => t >= a && t < b)) return 'closed';
  for (const c of caps) if (c.who === 'Sofia' && t >= c.a + .1 && t < c.b - .25) { const v = Math.sin(t * 17) + Math.sin(t * 7.3); return v > .6 ? 'open' : v > -.5 ? 'soft' : 'smile'; }
  return 'smile';
}
window.__ready = (async () => { await document.fonts.ready; return true; })();
