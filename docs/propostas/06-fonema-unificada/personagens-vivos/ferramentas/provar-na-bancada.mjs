// Prova com os componentes REAIS do app (bancada-vivo), servidos do disco pelo Playwright (sem servidor).
import { chromium } from '/home/user/FONEMA---ALFABETIZA-O/app/node_modules/@playwright/test/index.mjs';
import { readFile } from 'node:fs/promises';
const DIST = process.argv[2], CAP = process.argv[3];
const TIPO = { html: 'text/html', json: 'application/json', webp: 'image/webp', webm: 'video/webm', mp3: 'audio/mpeg', png: 'image/png', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', woff2: 'font/woff2' };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: 'block' });
await ctx.route('http://fonema.local/**', async (rota) => {
  const c = decodeURIComponent(new URL(rota.request().url()).pathname);
  try { await rota.fulfill({ body: await readFile(DIST + c), contentType: TIPO[c.split('.').pop()] ?? 'application/octet-stream' }); } catch { await rota.fulfill({ status: 404, body: '' }); }
});
const pg = await ctx.newPage();
pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) console.log('ERRO', m.text()); });
await pg.addInitScript(() => { window.__falas = []; window.addEventListener('fonema:fala', (e) => window.__falas.push([e.detail.quem, e.detail.arquivo, !!e.detail.ponte])); });
await pg.goto('http://fonema.local/bancada-vivo.html');
await pg.getByTestId('conversa').waitFor(); await pg.waitForTimeout(2000);
await pg.screenshot({ path: `${CAP}/app-01-bancada-componentes-reais.png` });
await pg.getByTestId('conversa').click();
const vistos = new Set();
for (let i = 0; i < 60; i++) {
  await pg.waitForTimeout(120);
  const v = await pg.evaluate(() => [...document.querySelectorAll('.vivo-busto')].map((b, k) => { const m = [...b.querySelectorAll('.vivo-boca')].find((x) => x.style.opacity === '1'); return k + b.dataset.quem[0] + ':' + (b.classList.contains('falando') ? 'F' : '-') + (m ? m.src.split('boca-')[1][0] : '.'); }));
  v.forEach((x) => vistos.add(x));
  if (i % 12 === 3) { console.log(i, v.join(' '), JSON.stringify(await pg.evaluate(() => { const a = window.__fonemaVivo?.ativa; return a && [a.quem, a.texto.slice(0, 30), a.audio?.currentTime]; }))); await pg.getByTestId('baloes').screenshot({ path: `${CAP}/app-02-balao-falando-${i}.png` }); }
}
console.log('eventos', JSON.stringify(await pg.evaluate(() => window.__falas)));
console.log('vistos', [...vistos].sort().join(' '));
await pg.click('[data-gesto=comemorando]'); await pg.waitForTimeout(2400);
console.log('corpo', JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('.vivo-corpo')].map((c) => [c.dataset.estado, c.getBoundingClientRect().width | 0, c.getBoundingClientRect().height | 0, [...c.querySelectorAll('video')].map((v) => [v.videoWidth, v.paused, +v.currentTime.toFixed(1)])]))));
await pg.screenshot({ path: `${CAP}/app-03-bancada-comemorando.png`, fullPage: true });
await pg.waitForTimeout(9000);
console.log('depois', JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('.vivo-corpo')].slice(0, 1).map((c) => [c.dataset.estado, [...c.querySelectorAll('video')].map((v) => [v.paused, +v.currentTime.toFixed(1)])]))));
await b.close();
