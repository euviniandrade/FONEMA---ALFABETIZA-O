// Gera os PNGs do mapa e da galeria: node docs/mapa/capturar.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const dir = __dirname;
  async function shoot(html, full, parts, fullScale) {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(dir, html), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    for (const [sel, out] of parts) await (await page.$(sel)).screenshot({ path: path.join(dir, out) });
    await ctx.close();
    if (full) {
      const c2 = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: fullScale });
      const p2 = await c2.newPage();
      await p2.goto('file://' + path.join(dir, html), { waitUntil: 'load' });
      await p2.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      await p2.screenshot({ path: path.join(dir, full), fullPage: true });
      await c2.close();
    }
  }
  const scale = Number(process.env.ESCALA_MAPA || 2);
  await shoot('mapa-completo.html', 'mapa-completo.png',
    [['#parte-1', 'mapa-parte-1.png'], ['#parte-2', 'mapa-parte-2.png'], ['#parte-3', 'mapa-parte-3.png']], scale);
  await shoot('galeria.html', null,
    [['#galeria-1', 'galeria-1.png'], ['#galeria-2', 'galeria-2.png'], ['#galeria-3', 'galeria-3.png']]);
  await browser.close();
})();
