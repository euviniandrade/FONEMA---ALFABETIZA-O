// Captura as telas da v2 com Playwright (Chromium headless, deviceScaleFactor 2).
// Uso: (na pasta paineis-v2) python3 -m http.server 8765 &  →  node ferramentas/capturar.js [nome...]
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/';
const T = [
  // nome do PNG, página, largura, altura, página inteira?
  ['crianca-aventura', 'crianca-aventura.html', 1280, 800],
  ['crianca-celular', 'crianca-celular.html', 390, 844],
  ['crianca-celular-completo', 'crianca-celular.html?completo=1', 390, 844, true],
  ['professor-turma', 'professor-turma.html', 1280, 800],
  ['professor-turma-escuro', 'professor-turma.html?tema=escuro', 1280, 800],
  ['professor-crianca-detalhe', 'professor-crianca.html', 1280, 800],
  ['professor-palavras-dificuldade', 'professor-palavras.html', 1280, 800],
  ['pais-celular', 'pais.html', 390, 844],
  ['pais-celular-completo', 'pais.html?completo=1', 390, 844, true],
  ['pais-web', 'pais.html', 1280, 800],
  ['gestor-unidade', 'gestor-unidade.html', 1440, 900, true],
  ['gestor-unidade-escuro', 'gestor-unidade.html?tema=escuro', 1440, 900, true],
  ['painel-secretaria', 'painel-secretaria.html', 1440, 900, true],
];
(async () => {
  const want = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [nome, url, w, h, full] of T) {
    if (want.length && !want.includes(nome)) continue;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', e => console.log('  erro JS', nome, e.message));
    await p.goto(BASE + url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => window.__pronto === true, null, { timeout: 20000 }).catch(() => console.log('  (sem __pronto)', nome));
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(__dirname, '..', nome + '.png'), fullPage: !!full });
    console.log('ok', nome);
    await p.close();
  }
  await b.close();
})();
