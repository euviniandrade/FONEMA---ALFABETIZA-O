// Prova no APP (build de produção servido do disco pelo Playwright, sem servidor): chegada com a dupla viva e bustos que falam.
import { chromium } from '/home/user/FONEMA---ALFABETIZA-O/app/node_modules/@playwright/test/index.mjs';
import { readFile } from 'node:fs/promises';
const DIST = process.argv[2], CAP = process.argv[3];
const TIPO = { html: 'text/html', json: 'application/json', webp: 'image/webp', webm: 'video/webm', mp3: 'audio/mpeg', mp4: 'video/mp4', png: 'image/png', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
await ctx.route('http://fonema.local/**', async (rota) => {
  let c = decodeURIComponent(new URL(rota.request().url()).pathname); if (c.endsWith('/')) c += 'index.html';
  try { await rota.fulfill({ body: await readFile(DIST + c), contentType: TIPO[c.split('.').pop()] ?? 'application/octet-stream' }); } catch { await rota.fulfill({ status: 404, body: '' }); }
});
const pg = await ctx.newPage();
pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) console.log('ERRO', m.text()); });
await pg.addInitScript(() => { window.__falas = []; window.addEventListener('fonema:fala', (e) => window.__falas.push([e.detail.quem, e.detail.arquivo, !!e.detail.ponte])); });
const ids = async (r) => console.log(r, pg.url().split('#')[1], JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('[data-testid]')].map((e) => e.dataset.testid).slice(0, 25))));
await pg.goto('http://fonema.local/'); await pg.evaluate(() => localStorage.setItem('fonema-teste-rapido', '1'));
await pg.goto('http://fonema.local/#/familia/cadastro'); await pg.reload(); await pg.waitForTimeout(1200); await ids('A');
await pg.getByTestId('conta-nome').fill('Ana'); await pg.getByTestId('conta-email').fill('ana@exemplo.com'); await pg.getByTestId('conta-continuar').click(); await pg.waitForTimeout(600); await ids('A2');
for (const sel of ['novo-pin', 'confirmar-novo-pin']) if (await pg.getByTestId(sel).count()) await pg.getByTestId(sel).fill('2468');
for (const el of await pg.locator('input[type=password]').all()) await el.fill('2468');
if (await pg.getByTestId('conta-criar').count()) await pg.getByTestId('conta-criar').click(); await pg.waitForTimeout(800); await ids('A3');
if (await pg.getByTestId('segurar-adulto').count()) { await pg.getByTestId('segurar-adulto').dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true }); await pg.waitForTimeout(4000); await ids('B'); }
await pg.getByTestId('campo-nome').fill('Mariana');
await pg.locator('[data-idade]').first().click();
await pg.locator('[data-genero="f"]').click();
await pg.getByTestId('cadastro-continuar').click();
await pg.getByTestId('nivel-continuar').click();
await pg.getByTestId('cons-responsavel').check();
await pg.getByTestId('salvar-crianca').click();
await ids('C'); await pg.getByTestId('entregar').click(); await pg.waitForTimeout(800); await ids('D');

await pg.evaluate(() => localStorage.removeItem('fonema-teste-rapido')); await pg.reload(); 
await pg.getByTestId('avatar-pronto').click({ force: true });
await pg.getByTestId('primeira-missao').waitFor();
const visemas = new Set();
for (let i = 0; i < 40; i++) {
  await pg.waitForTimeout(150);
  const v = await pg.evaluate(() => [...document.querySelectorAll('.vivo-busto')].map((b) => { const m = [...b.querySelectorAll('.vivo-boca')].find((x) => x.style.opacity === '1'); return (b.dataset.quem + ':' + (b.classList.contains('falando') ? 'F' : '-') + (m ? m.src.split('boca-')[1][0] : '.')); }));
  v.forEach((x) => visemas.add(x));
  if (i % 5 === 0) console.log(i, JSON.stringify(await pg.evaluate(() => { const a = window.__fonemaVivo?.ativa; return [window.__fonemaVivo?.bustos, a && [a.quem, a.texto, a.linha.length, a.audio?.paused, a.audio?.currentTime]]; })), v.join(' '));
  if (i === 6) await pg.screenshot({ path: `${CAP}/app-01-chegada-dupla-viva.png` });
  if (i === 22) await pg.screenshot({ path: `${CAP}/app-02-chegada-falando.png` });
}
console.log('eventos', JSON.stringify(await pg.evaluate(() => window.__falas)));
console.log('visemas vistos', [...visemas].join(' '));
console.log('corpo', JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('.vivo-corpo')].map((c) => [c.dataset.estado, c.getBoundingClientRect().width | 0, c.getBoundingClientRect().height | 0, [...c.querySelectorAll('video')].map((v) => [v.videoWidth, v.paused, v.currentTime.toFixed(1)])]))));
const id = pg.url().split('/c/')[1].split('/')[0];
await pg.goto(`http://fonema.local/#/c/${id}/album`); await pg.getByTestId('conheca-dupla').waitFor(); await pg.waitForTimeout(1500);
await pg.getByTestId('conheca-dupla').screenshot({ path: `${CAP}/app-03-album-conheca-giro.png` });
await pg.goto(`http://fonema.local/#/c/${id}/vila`); await pg.waitForTimeout(3000);
await pg.screenshot({ path: `${CAP}/app-04-vila-dupla-viva.png` });
await b.close();
