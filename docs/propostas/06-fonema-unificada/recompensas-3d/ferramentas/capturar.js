// Capturas das recompensas animadas. Uso, a partir de recompensas-3d/: node ferramentas/capturar.js
const { chromium } = require('playwright');
const path = require('path');
const AQUI = path.resolve(__dirname, '..'), CAP = path.join(AQUI, 'capturas');
const URL = 'file://' + path.join(AQUI, 'demo.html');
(async () => {
  const b = await chromium.launch();
  const pag = async (q) => { const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); p.on('pageerror', (e) => console.log('ERRO', e.message)); await p.goto(URL + '?mudo&' + q); await p.waitForTimeout(400); return p; };
  const foto = async (p, n) => { await p.screenshot({ path: path.join(CAP, n + '.png') }); console.log('📷', n); };
  let p = await pag('');            // celebração completa automática
  await p.waitForTimeout(1100); await foto(p, '02-selo-entrando-girando');
  await p.waitForTimeout(2300); await foto(p, '03-moedinhas-voando-ao-cofrinho');
  await p.waitForTimeout(5500); await foto(p, '01-todas-as-recompensas');
  await p.close();
  p = await pag('parado');
  for (let i = 0; i < 3; i++) { await p.evaluate(() => window.DEMO_RC.subir()); await p.waitForTimeout(1400); }
  await foto(p, '04-nivel-diamante'); await p.close();
  for (const [nome, arq] of [['Helena', '05-selo-letra-H'], ['Bia', '06-selo-letra-B']]) {
    p = await pag('parado&nome=' + nome); await p.evaluate(() => window.DEMO_RC.montaSelo(true)); await p.waitForTimeout(2600);
    const el = await p.$('.c-selo'); await el.screenshot({ path: path.join(CAP, arq + '.png') }); console.log('📷', arq); await p.close();
  }
  await b.close();
})();
