// Captura um GLB em vários ângulos numa folha. Uso (na raiz do repositório): node .../capturar-glb.mjs <caminho.glb a partir da raiz> <saida.png>
import { createRequire } from 'node:module'; import { spawn } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const [glb, saida] = process.argv.slice(2), porta = 4391;
const srv = spawn('python3', ['-m', 'http.server', String(porta)], { stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const angs = [0, 45, 90, 135, 180, 225, 270, 315], L = 420;
const pg = await b.newPage({ viewport: { width: L, height: L } }); const imgs = [];
for (const a of angs) {
  await pg.goto(`http://localhost:${porta}/docs/propostas/06-fonema-unificada/recompensas-3d/ferramentas/ver-glb.html?glb=/${glb}&ang=${a}`);
  await pg.waitForFunction(() => document.title.startsWith('pronto') || document.title.startsWith('erro'), null, { timeout: 120000 });
  if (a === 0) console.log(await pg.title());
  imgs.push((await pg.screenshot()).toString('base64'));
}
const fl = await b.newPage({ viewport: { width: L * 4, height: L * 2 } });
await fl.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(4,${L}px)">${imgs.map((i) => `<img src="data:image/png;base64,${i}">`).join('')}</body>`);
await fl.screenshot({ path: saida }); await b.close(); srv.kill();
