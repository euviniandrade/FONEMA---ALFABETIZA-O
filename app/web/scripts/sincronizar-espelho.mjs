// Copia para public/ (sem editar as pastas de origem) as demos que outros agentes constroem em docs/:
//  - Espelho do Som 3D  (docs/propostas/06-fonema-unificada/espelho-do-som-3d) → public/espelho/
//  - Mundo 3D v2        (docs/propostas/06-fonema-unificada/mundo-3d-v2)       → public/mundo3d/
// Roda antes de `npm run dev` e `npm run build`. Se a pasta não existir (ou ainda não tiver o arquivo
// principal), o app usa o modo 2D (imagens) e mostra o aviso no console.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const docs = resolve(aqui, '../../../docs/propostas/06-fonema-unificada');
const publico = resolve(aqui, '../public');

function copiar(origem, destino, { exige, ignora = [] }) {
  if (!existsSync(join(origem, exige))) {
    console.log(`· ${origem.split('/').pop()}: ainda sem ${exige}; o app usa o modo 2D.`);
    rmSync(destino, { recursive: true, force: true });
    return false;
  }
  rmSync(destino, { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });
  for (const nome of readdirSync(origem)) {
    if (ignora.some((r) => r.test(nome))) continue;
    cpSync(join(origem, nome), join(destino, nome), { recursive: true });
  }
  const tam = du(destino);
  console.log(`· ${origem.split('/').pop()} → public/${destino.split('/').pop()} (${(tam / 1e6).toFixed(1)} MB)`);
  return true;
}

function du(p) {
  const s = statSync(p);
  if (!s.isDirectory()) return s.size;
  return readdirSync(p).reduce((t, n) => t + du(join(p, n)), 0);
}

copiar(join(docs, 'espelho-do-som-3d'), join(publico, 'espelho'), {
  exige: 'espelho.js',
  ignora: [/^capturas$/, /^imagens$/, /^ferramentas$/, /^_teste/, /\.py$/, /\.md$/, /^__pycache__$/]
});
copiar(join(docs, 'mundo-3d-v2'), join(publico, 'mundo3d'), {
  exige: 'index.html',
  ignora: [/^capturas$/, /^ferramentas$/, /\.py$/, /\.md$/, /\.mp4$/, /^__pycache__$/]
});
