// Captura os infográficos em 2560×1600 (viewport 1280×800, deviceScaleFactor 2).
// Uso: node capturar.js            (todos)
//      node capturar.js mapa-jornada-2-anos   (um só)
const { chromium } = require('playwright');
const path = require('path');
const TODOS = ['mapa-jornada-2-anos', 'neurociencia-na-jornada', 'anatomia-da-sessao', 'semana-tipica', 'grafo-habilidades'];
(async () => {
  const nomes = process.argv.slice(2).length ? process.argv.slice(2) : TODOS;
  const b = await chromium.launch();
  for (const n of nomes) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    p.on('pageerror', e => console.log('ERRO', n, e.message));
    p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', n, m.text()); });
    await p.goto('file://' + path.resolve(__dirname, n + '.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const out = path.resolve(__dirname, '..', n + '.png');
    await p.screenshot({ path: out });
    console.log('salvo', out);
    await p.close();
  }
  await b.close();
})();
