// Capturas PNG 2560×1600 do protótipo (Playwright + Chromium headless com WebGL por software).
// Uso: (na pasta mundo-3d) python3 -m http.server 8931 &  →  node ferramentas/capturar.js [só-estes...]
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:8931/index.html';
const OUT = path.resolve(__dirname, '..');
const SHOTS = [
  ['01-arquipelago-aereo', 'view=arquipelago&tod=0&hud=0', 4],
  ['02-voo-para-ilha', 'view=voo&tod=0&hud=0', 6],
  ['03-vila-panoramica', 'view=vila&tod=0&hud=0', 3],
  ['04-vila-angulo-3-4', 'view=vila34&tod=0&hud=0', 5],
  ['05-vila-zoom-praca', 'view=praca&tod=0&hud=0', 3],
  ['06-vila-zoom-biblioteca', 'view=biblioteca&tod=0&hud=0', 3],
  ['07-vila-entardecer', 'view=entardecer&tod=1&hud=0', 3],
  ['08-arquipelago-com-hud', 'view=arquipelago&tod=0&hud=1', 4],
  ['09-vila-noite', 'view=noite&tod=2&hud=0', 3],
];
(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  for (const [name, qs, t] of SHOTS) {
    if (only.length && !only.some((o) => name.startsWith(o))) continue;
    const t0 = Date.now();
    await page.goto(`${BASE}?capture=1&painel=0&q=alto&${qs}&t=${t}`);
    await page.waitForFunction(() => window.FONEMA && window.FONEMA.ready, null, { timeout: 180000 });
    const info = await page.evaluate((t) => window.FONEMA.renderAt(t), t);
    await page.evaluate((t) => window.FONEMA.renderAt(t), t);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log(name, JSON.stringify(info), ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close();
})();
