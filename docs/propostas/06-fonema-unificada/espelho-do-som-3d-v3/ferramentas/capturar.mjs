// Capturas do Espelho do Som v3 (Playwright + WebGL por software).
//   cd app && node ../docs/propostas/06-fonema-unificada/espelho-do-som-3d-v3/ferramentas/capturar.mjs [--sons a,m,l] [--tam 1100x520] [--fase faz] [--saida pasta] [--folha arquivo.png]
// Sobe um servidor estático em docs/propostas/06-fonema-unificada e fotografa embed.html?f=<som>&congela=<fase>.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '../..');
const req = createRequire(pathToFileURL(join(process.cwd(), 'x.js')));
const { chromium } = req('playwright');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const sons = arg('sons', 'a,e,i,o,u,m,p,f,l,t,s,x,k,r,rr,nh').split(',');
const [W, H] = arg('tam', '1100x520').split('x').map(Number);
const fase = arg('fase', 'faz');
const saida = resolve(arg('saida', join(aqui, '../capturas')));
const extra = arg('extra', '');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const srv = createServer(async (rq, rs) => {
  try { const p = decodeURIComponent(new URL(rq.url, 'http://x').pathname); const b = await readFile(join(raiz, p)); rs.writeHead(200, { 'content-type': TIPOS[extname(p)] || 'application/octet-stream' }); rs.end(b); }
  catch { rs.writeHead(404); rs.end('nada'); }
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const porta = srv.address().port;
await mkdir(saida, { recursive: true });
const nav = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await nav.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: +arg('dpr', '1') });
pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text().slice(0, 300)); });
pg.on('pageerror', (e) => console.log('[erro]', e.message));
const arquivos = [];
for (const f of sons) {
  await pg.goto(`http://127.0.0.1:${porta}/espelho-do-som-3d-v3/embed.html?f=${encodeURIComponent(f)}&congela=${fase}&sons=&${extra}`);
  await pg.waitForFunction(() => document.documentElement.dataset.pronto === '1', null, { timeout: 30000 });
  await pg.waitForTimeout(+arg('espera', '900'));
  const nome = join(saida, `${arg('prefixo', 'v3')}-${({ E: 'e-aberto', O: 'o-aberto', e: 'e-fechado', o: 'o-fechado' })[f] || f.replace('~', '-nasal')}${fase === 'faz' ? '' : '-' + fase}.png`);
  await pg.screenshot({ path: nome }); arquivos.push([f, nome]);
  console.log('ok', f);
}
const folha = arg('folha', '');
if (folha) {
  const col = +arg('colunas', '4'), esc = +arg('escala', '0.5');
  const html = `<body style="margin:0;background:#fff;font:700 20px sans-serif"><div style="display:grid;grid-template-columns:repeat(${col},${W * esc}px);gap:6px;padding:6px">${arquivos.map(([f, n]) => `<figure style="margin:0;position:relative"><img src="file://${n}" style="width:${W * esc}px;display:block"><figcaption style="position:absolute;left:50%;top:4px;transform:translateX(-50%);background:#1F3B63;color:#fff;padding:2px 10px;border-radius:8px">${f.toUpperCase()}</figcaption></figure>`).join('')}</div></body>`;
  const p2 = await nav.newPage({ viewport: { width: Math.round(col * (W * esc + 6) + 6), height: 100 } });
  const { writeFile } = await import('node:fs/promises');
  const tmp = join(saida, '_folha.html'); await writeFile(tmp, html);
  await p2.goto('file://' + tmp); await p2.waitForTimeout(300);
  await p2.screenshot({ path: resolve(folha), fullPage: true });
  console.log('folha', resolve(folha));
}
await nav.close(); srv.close();
