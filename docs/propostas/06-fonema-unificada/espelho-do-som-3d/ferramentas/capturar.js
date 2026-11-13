// Capturas do Espelho do Som (Playwright + Chromium com WebGL em software).
// Uso, a partir de espelho-do-som-3d/:  node ferramentas/capturar.js
// Sobe um servidor local temporário (módulos ES não funcionam em file://) e salva em capturas/ (1280×800, deviceScaleFactor 2).
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const AQUI = path.resolve(__dirname, '..'), RAIZ = path.resolve(AQUI, '..'), CAP = path.join(AQUI, 'capturas');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const so = (process.argv[2] || '').split(',').filter(Boolean);
const quer = (n) => !so.length || so.some((s) => n.startsWith(s));

const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(RAIZ)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const base = `http://localhost:${srv.address().port}/espelho-do-som-3d/demo.html`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const pagina = async (query) => {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.log('  ERRO', e.message));
    await p.goto(`${base}?mudo&cap&${query}`); await p.waitForFunction(() => window.DEMO); await p.waitForTimeout(2500);
    return p;
  };
  const foto = async (p, nome, ms = 600) => { await p.waitForTimeout(ms); await p.screenshot({ path: path.join(CAP, nome + '.png'), timeout: 120000 }); console.log('📷', nome); };
  const cenas = [
    ['01-frente-A', 'f=a&m=frente&2d', 0], ['02-frente-L-ponta-sobe', 'f=l&m=frente&2d', 0], ['03-frente-M-fecha', 'f=m&m=frente&2d', 0],
    ['04-frente-U-biquinho', 'f=u&m=frente&2d', 0], ['04b-frente-K-fundo-sobe', 'f=k&m=frente&2d', 0], ['04c-frente-F-dente-no-labio', 'f=f&m=frente&2d', 0],
    ['05-lado-L-ponta-no-alveolo', 'f=l&m=lado&2d', 0], ['06-lado-K-dorso-no-veu', 'f=k&m=lado&2d', 0], ['07-lado-M-nariz-e-voz', 'f=m&m=lado&2d', 0],
    ['08-lado-S-ar-fininho', 'f=s&m=lado&2d', 0], ['09-lado-A-boca-aberta', 'f=a&m=lado&2d', 0],
    ['10-3d-boca-de-frente-A', 'f=a&m=frente3d', 1500], ['11-3d-dentro-da-boca-T', 'f=t&m=dentro', 4000], ['12-3d-dentro-da-boca-K', 'f=k&m=dentro', 4000], ['13-3d-pulmao-a-boca', 'f=a&aba=corpo', 4000]
  ];
  for (const [nome, qy, extra] of cenas) { if (!quer(nome)) continue; const p = await pagina(qy); await foto(p, nome, 900 + extra); await p.close(); }
  if (quer('14')) { // Onde está a língua? (toca o lugar certo do T: atrás dos dentes)
    const p = await pagina('aba=lingua&2d'); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelector('#vRaiox circle[data-zona=alveolo]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await foto(p, '14-ex-onde-esta-a-lingua', 1500); await p.close();
  }
  if (quer('15')) { const p = await pagina('aba=voz&2d'); await p.click('.op button[data-r="1"]'); await foto(p, '15-ex-tem-voz', 1500); await p.close(); }
  if (quer('16')) { const p = await pagina('aba=imite&2d'); await p.click('#bCam'); await foto(p, '16-ex-imite-a-sofia', 2000); await p.close(); }
  if (quer('17')) { const p = await pagina('aba=corpo'); await p.waitForTimeout(3000); await p.click('.partes button[data-p=pregas]'); await foto(p, '17-ex-conheca-seu-corpo', 1500); await p.close(); }
  

  // Transições quadro a quadro (pose congelada entre dois sons), de lado e de frente
  if (quer('transicoes')) {
    for (const [a, b] of [['m', 'a'], ['l', 'a'], ['t', 'a']]) for (const m of ['frente', 'lado']) {
      const p = await pagina(`f=${a}&m=${m}&2d`);
      for (const f of [0, 0.33, 0.66, 1]) {
        await p.evaluate(([a, b, f]) => window.DEMO.esp.pose(a, b, f), [a, b, f]);
        await p.waitForTimeout(500);
        const el = await p.$(m === 'frente' ? '#vFrente' : '#vRaiox');
        await el.screenshot({ timeout: 120000, path: path.join(CAP, 'transicoes', `${a}-${b}-${m}-${Math.round(f * 100)}.png`) });
      }
      console.log('🎞️', a, '→', b, m); await p.close();
    }
  }
  await browser.close(); srv.close();
});
