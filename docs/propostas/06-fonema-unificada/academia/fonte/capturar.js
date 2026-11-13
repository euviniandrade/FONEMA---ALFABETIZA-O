// Captura as telas da Academia FONEMA: node capturar.js [nome...]  (viewport 1280×800, deviceScaleFactor 2 => PNG 2560×1600)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const telas = require('./telas');
(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch();
  for (const [name, fn] of Object.entries(telas)) {
    if (want.length && !want.includes(name)) continue;
    const file = path.join(__dirname, `_${name}.html`);
    fs.writeFileSync(file, fn());
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    await p.goto('file://' + file);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const out = path.join(__dirname, '..', `${name}.png`);
    await p.screenshot({ path: out });
    await p.close();
    console.log('ok', out);
  }
  await b.close();
})();
