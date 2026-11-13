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
  const foto = async (p, nome, ms = 600) => { await p.waitForTimeout(ms); await p.screenshot({ path: path.join(CAP, nome + '.png') }); console.log('📷', nome); };
  const cenas = [
    ['01-frente-A', 'f=a&m=frente'], ['02-frente-U', 'f=u&m=frente'], ['03-frente-F-labio-nos-dentes', 'f=f&m=frente'], ['04-frente-M-fechada', 'f=m&m=frente'],
    ['05-raiox-M-nariz-e-voz', 'f=m&m=lado'], ['06-raiox-L-ponta-no-alveolo', 'f=l&m=lado'], ['07-raiox-K-dorso-no-veu', 'f=k&m=lado'], ['08-raiox-S-ar-fininho', 'f=s&m=lado'],
    ['09-dentro-da-boca-T', 'f=t&m=dentro'], ['10-dentro-da-boca-K', 'f=k&m=dentro'], ['11-corpo-pulmao-a-boca', 'f=a&aba=corpo']
  ];
  for (const [nome, qy] of cenas) { if (!quer(nome)) continue; const p = await pagina(qy); await foto(p, nome, 900); await p.close(); }

  if (quer('12')) { // Onde está a língua? (toca o lugar certo do T: atrás dos dentes)
    const p = await pagina('aba=lingua'); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelector('.esp3d-rot[data-zona=dentes]') && 0);
    const r = await p.evaluate(() => { const c = document.querySelector('#palco canvas').getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height }; });
    // projeta o alvo "alvéolo" para a tela e toca nele
    const alvo = await p.evaluate(() => { const b = document.querySelector('.esp3d-rot[data-zona=dentes]'); const m = b.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/); return [+m[1], +m[2]]; });
    await p.mouse.click(r.x + alvo[0] + 150 * Math.min(1, r.w / 900) * 1.0 - 25, r.y + alvo[1] - 40);
    await foto(p, '12-ex-onde-esta-a-lingua', 1800); await p.close();
  }
  if (quer('13')) { const p = await pagina('aba=voz'); await p.click('.op button[data-r="1"]'); await foto(p, '13-ex-tem-voz', 2200); await p.close(); }
  if (quer('14')) { const p = await pagina('aba=imite'); await p.click('#bCam'); await foto(p, '14-ex-imite-a-sofia', 2000); await p.close(); }
  if (quer('15')) { const p = await pagina('aba=corpo'); await p.click('.partes button[data-p=pregas]'); await foto(p, '15-ex-conheca-seu-corpo', 1500); await p.close(); }
  if (quer('16')) { const p = await pagina('f=l&2d'); await foto(p, '16-versao-2d-sem-webgl', 800); await p.close(); }

  // Transições quadro a quadro (pose congelada entre dois sons), de lado e de frente
  if (quer('transicoes')) {
    for (const [a, b] of [['m', 'a'], ['l', 'a'], ['t', 'a']]) for (const m of ['lado', 'frente']) {
      const p = await pagina(`f=${a}&m=${m}`);
      for (const f of [0, 0.33, 0.66, 1]) {
        await p.evaluate(([a, b, f]) => window.DEMO.esp.pose(a, b, f), [a, b, f]);
        await p.waitForTimeout(500);
        const el = await p.$('#palco');
        await el.screenshot({ path: path.join(CAP, 'transicoes', `${a}-${b}-${m}-${Math.round(f * 100)}.png`) });
      }
      console.log('🎞️', a, '→', b, m); await p.close();
    }
  }
  await browser.close(); srv.close();
});
