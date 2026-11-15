// Tira as IMAGENS PARADAS dos prêmios do PRÓPRIO modelo 3D (para a arte bater com o que gira):
//   public/assets/modelos3d/<modelo>.webp          quadro inteiro (reserva sem WebGL e primeiro quadro antes do 3D)
//   public/assets/recompensas/<imagem>.webp        recorte justo (cofrinho do topo, motivo do selo "Cofrinho Novo", ícones)
// Uso (em app/web):  npx vite -c vite.selos.config.ts --port 5199   e, em outro terminal,
//                    node scripts/gerar-miniaturas-modelos.mjs [porquinho trofeu bau bolota]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL ?? 'http://localhost:5199/';
const RECORTE = { porquinho: 'cofrinho-porquinho', trofeu: 'trofeu', bau: 'bau-livros' };
const quais = process.argv.slice(2).length ? process.argv.slice(2) : ['porquinho', 'trofeu', 'bau', 'bolota'];

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const grava = (caminho, url) => writeFileSync(resolve(aqui, '../public/assets', caminho), Buffer.from(url.split(',')[1], 'base64'));
async function tirar(q, recorte) {
  const pagina = await navegador.newPage({ viewport: { width: 700, height: 700 }, deviceScaleFactor: 1 });
  await pagina.goto(`${BASE}bancada-selos.html#mini-${q}${recorte ? '-recorte' : ''}`);
  await pagina.locator('canvas[data-giro="3d"]').waitFor({ timeout: 120000 });
  await pagina.waitForTimeout(2500);
  const r = await pagina.evaluate((justo) => {
    const c = document.querySelector('canvas[data-giro="3d"]');
    const copia = (sx, sy, sw, sh, dw, dh) => { const k = document.createElement('canvas'); k.width = dw; k.height = dh; const g = k.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, sx, sy, sw, sh, 0, 0, dw, dh); return k.toDataURL('image/webp', 0.9); };
    if (!justo) { const h = Math.round((512 * c.height) / c.width); return { url: copia(0, 0, c.width, c.height, 512, h), tam: [512, h] }; }
    const dados = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (dados[(y * c.width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const m = 4; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(c.width - 1, x1 + m); y1 = Math.min(c.height - 1, y1 + m);
    return { url: copia(x0, y0, x1 - x0 + 1, y1 - y0 + 1, x1 - x0 + 1, y1 - y0 + 1), tam: [x1 - x0 + 1, y1 - y0 + 1] };
  }, recorte);
  await pagina.close();
  return r;
}
for (const q of quais) {
  const quadro = await tirar(q, false); // com a sombra de contato, no quadro inteiro
  grava(`modelos3d/${q}.webp`, quadro.url);
  let nota = '';
  if (RECORTE[q]) { const r = await tirar(q, true); grava(`recompensas/${RECORTE[q]}.webp`, r.url); nota = `· recorte ${r.tam.join('×')} → recompensas/${RECORTE[q]}.webp`; }
  console.log(q, `quadro ${quadro.tam.join('×')}`, nota);
}
await navegador.close();
