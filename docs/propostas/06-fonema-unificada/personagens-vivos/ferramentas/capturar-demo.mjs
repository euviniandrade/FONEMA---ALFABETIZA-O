// Capturas da demo SEM servidor: o Playwright entrega os arquivos do repositório direto do disco.
import { chromium } from '/home/user/FONEMA---ALFABETIZA-O/app/node_modules/@playwright/test/index.mjs';
import { readFile } from 'node:fs/promises';
const RAIZ = '/home/user/FONEMA---ALFABETIZA-O';
const CAP = `${RAIZ}/docs/propostas/06-fonema-unificada/personagens-vivos/capturas`;
const TIPO = { html: 'text/html', json: 'application/json', webp: 'image/webp', webm: 'video/webm', mp3: 'audio/mpeg', png: 'image/png', js: 'text/javascript', css: 'text/css' };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: process.argv[2], size: { width: 1280, height: 800 } } });
await ctx.route('http://fonema.local/**', async (rota) => {
  const caminho = decodeURIComponent(new URL(rota.request().url()).pathname);
  try { await rota.fulfill({ body: await readFile(RAIZ + caminho), contentType: TIPO[caminho.split('.').pop()] ?? 'application/octet-stream', headers: { 'accept-ranges': 'none' } }); }
  catch { await rota.fulfill({ status: 404, body: 'nao achei' }); }
});
const pg = await ctx.newPage();
pg.on('console', (m) => { if (m.type() === 'error') console.log('ERRO', m.text()); });
pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await pg.goto('http://fonema.local/docs/propostas/06-fonema-unificada/personagens-vivos/demo.html');
await pg.waitForTimeout(2500);
await pg.locator('#s-giro').screenshot({ path: `${CAP}/demo-01-giro-frente.png` });
await pg.evaluate(() => document.querySelectorAll('.giro').forEach((g) => g.irPara(9)));
await pg.waitForTimeout(300); await pg.locator('#s-giro').screenshot({ path: `${CAP}/demo-02-giro-lado.png` });
await pg.evaluate(() => document.querySelectorAll('.giro').forEach((g) => g.irPara(22)));
await pg.waitForTimeout(300); await pg.locator('#s-giro').screenshot({ path: `${CAP}/demo-03-giro-costas.png` });
const g = pg.locator('[data-giro=sofia]'); const bx = await g.boundingBox();
await pg.mouse.move(bx.x + bx.width / 2, bx.y + 200); await pg.mouse.down(); await pg.mouse.move(bx.x + bx.width / 2 - 60, bx.y + 200, { steps: 8 }); await pg.mouse.up();
console.log('giro apos arrastar', await g.evaluate((e) => e.style.backgroundPosition));
await pg.locator('#s-corpo').scrollIntoViewIfNeeded(); await pg.waitForTimeout(1500);
console.log('videos', JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('video')].map((v) => [v.id, v.videoWidth, v.readyState, v.paused]))));
await pg.locator('#s-corpo').screenshot({ path: `${CAP}/demo-04-corpo-parado.png` });
await pg.click('[data-gesto=acenando]'); await pg.waitForTimeout(3200); await pg.locator('#palco').screenshot({ path: `${CAP}/demo-05-corpo-acenando.png` });
await pg.click('[data-gesto=comemorando]'); await pg.waitForTimeout(2300); await pg.locator('#palco').screenshot({ path: `${CAP}/demo-06-corpo-comemorando.png` });
await pg.click('[data-gesto=palmas]'); await pg.waitForTimeout(2600); await pg.locator('#palco').screenshot({ path: `${CAP}/demo-07-corpo-palmas.png` });
await pg.locator('#s-fala').scrollIntoViewIfNeeded(); await pg.waitForTimeout(500);
await pg.locator('#s-fala').screenshot({ path: `${CAP}/demo-08-bocas.png` });
const t0 = Date.now();
const fala = pg.evaluate(async () => { for (const k of window.CONVERSA.slice(0, 2)) { await window.falar(k); await new Promise((r) => setTimeout(r, 300)); } });
const el = pg.locator('#s-fala .fila').first();
for (let i = 0; i < 12; i++) { await pg.waitForTimeout(230); await el.screenshot({ path: `${process.argv[2]}/fala-${String(i).padStart(2, '0')}.png` }); }
await fala; console.log('fala durou', Date.now() - t0);
await ctx.close(); await b.close();
