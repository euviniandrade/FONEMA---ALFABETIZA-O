// Capturas da demo SEM servidor: o Playwright entrega os arquivos do repositório direto do disco.
import { chromium } from '/home/user/FONEMA---ALFABETIZA-O/app/node_modules/@playwright/test/index.mjs';
import { readFile } from 'node:fs/promises';
const RAIZ = '/home/user/FONEMA---ALFABETIZA-O';
const CAP = `${RAIZ}/docs/propostas/06-fonema-unificada/personagens-vivos/capturas`;
const TIPO = { html: 'text/html', json: 'application/json', webp: 'image/webp', webm: 'video/webm', mp3: 'audio/mpeg', png: 'image/png', js: 'text/javascript', css: 'text/css' };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 900, height: 600 }, recordVideo: { dir: process.argv[2], size: { width: 900, height: 600 } } });
await ctx.route('http://fonema.local/**', async (rota) => {
  const caminho = decodeURIComponent(new URL(rota.request().url()).pathname);
  try { await rota.fulfill({ body: await readFile(RAIZ + caminho), contentType: TIPO[caminho.split('.').pop()] ?? 'application/octet-stream', headers: { 'accept-ranges': 'none' } }); }
  catch { await rota.fulfill({ status: 404, body: 'nao achei' }); }
});
const pg = await ctx.newPage();
pg.on('console', (m) => { if (m.type() === 'error') console.log('ERRO', m.text()); });
pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await pg.goto('http://fonema.local/docs/propostas/06-fonema-unificada/personagens-vivos/demo.html');
await pg.waitForTimeout(1500);
await pg.evaluate(() => { document.querySelector('header').remove(); document.getElementById('s-giro').remove(); document.getElementById('s-corpo').remove(); window.scrollTo(0, 0); });
await pg.waitForTimeout(600);
const t0 = Date.now();
await pg.evaluate(async () => { for (const k of window.CONVERSA) { await window.falar(k); await new Promise((r) => setTimeout(r, 300)); } });
console.log('dur', Date.now() - t0);
await ctx.close(); await b.close();
