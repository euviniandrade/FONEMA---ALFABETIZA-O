// Renderiza as folhas: node render.js [nome...]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const pages = require('./pages');
(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch();
  for (const [name, fn] of Object.entries(pages)) { if (typeof fn !== 'function' || name === name.toUpperCase()) continue;
    if (want.length && !want.includes(name)) continue;
    const { w, h, html } = fn();
    const file = path.join(__dirname, `_${name}.html`);
    fs.writeFileSync(file, html);
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto('file://' + file);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    const out = path.join(__dirname, '..', `${name}.png`);
    await p.screenshot({ path: out });
    await p.close();
    console.log('ok', out);
  }
  await b.close();
})();
