// Capturas do Mundo 3D v2 (Playwright + Chromium com WebGL por software/SwiftShader).
// Uso, a partir de mundo-3d-v2/:  node ferramentas/capturar.js [prefixos,separados,por,vírgula] [--dpr=2] [--q=alto]
// Sobe um servidor local temporário (módulos ES não abrem em file://) e salva PNG 1280×800 em capturas/.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const AQUI = path.resolve(__dirname, '..'), CAP = path.join(AQUI, 'capturas');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
const args = process.argv.slice(2);
const so = (args.find((a) => !a.startsWith('--')) || '').split(',').filter(Boolean);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const DPR = Number(opt.dpr || 2), QUAL = opt.q || 'alto';

// [arquivo, vista, tempo, extras de URL, hud]
const CENAS = [
  ['01-vila-aerea', 'aerea', 4.0, '', 0],
  ['02-praca-nivel-dos-olhos', 'praca', 2.0, '', 0],
  ['03-escola-portao', 'escola', 3.0, '', 0],
  ['04-rio-e-cais', 'rio', 5.0, '', 0],
  ['05-campinho', 'campinho', 3.5, '', 0],
  ['06-entardecer', 'entardecer', 6.0, '', 0],
  ['07-arquipelago', 'arquipelago', 3.0, '', 0],
  ['08-voo-arquipelago-vila', 'voo', 4.0, '', 0],
  ['09-rua-das-casas', 'rua', 2.0, '', 0],
  ['10-horta', 'horta', 2.5, '', 0],
  ['11-vila-com-hud', 'aerea', 4.0, '', 1],
  ['12-tilt-shift', 'aerea', 4.0, '&tilt=1', 0],
];

const srv = http.createServer((q, r) => {
  const f = path.join(AQUI, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(AQUI)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const base = `http://localhost:${srv.address().port}/index.html`;
  fs.mkdirSync(CAP, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: DPR });
  page.on('pageerror', (e) => console.log('  ERRO', e.message));
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('  [console]', m.text().slice(0, 240)); });
  let urlAtual = '';
  for (const [nome, vista, t, extra, hud] of CENAS) {
    if (so.length && !so.some((s) => nome.startsWith(s))) continue;
    const t0 = Date.now();
    const url = `${base}?captura=1&q=${QUAL}&hud=${hud}${extra}`;
    if (url !== urlAtual) { await page.goto(url); await page.waitForFunction(() => window.FONEMA_MUNDO, null, { timeout: 300000 }); await page.waitForTimeout(900); urlAtual = url; }
    const info = await page.evaluate(async ([v, t]) => { await window.FONEMA_MUNDO.renderAt(t, v); const s = window.FONEMA_MUNDO.stats(); await window.FONEMA_MUNDO.renderAt(t, v); return s; }, [vista, t]);
    if (hud) await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(CAP, nome + '.png'), timeout: 600000 });
    console.log('📷', nome, JSON.stringify(info), ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close(); srv.close();
});
