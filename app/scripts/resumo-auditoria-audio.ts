/**
 * Resumo da auditoria dos clipes (docs/auditoria-audio.json, 1,2 MB) para a Área do administrador: só os clipes que
 * pedem atenção (grave/conferir), em web/src/telas/admin/auditoria-resumo.json (poucos KB, entra no pedaço da tela).
 * Rode depois de cada auditoria (ferramentas/auditar-audio.py). O importador de pacotes roda sozinho.
 * Uso (a partir de app/):  npx tsx scripts/resumo-auditoria-audio.ts
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function gerarResumoAuditoria(raiz = RAIZ): { total: number; marcados: number } {
  const entrada = resolve(raiz, 'docs/auditoria-audio.json');
  const saida = resolve(raiz, 'web/src/telas/admin/auditoria-resumo.json');
  if (!existsSync(entrada)) { writeFileSync(saida, '{}\n'); return { total: 0, marcados: 0 }; }
  const lista = JSON.parse(readFileSync(entrada, 'utf8')) as { arquivo?: string; gravidade?: string; voz_humana?: unknown }[];
  const r: Record<string, string> = {};
  for (const c of lista) if (c.arquivo && !c.voz_humana && (c.gravidade === 'grave' || c.gravidade === 'conferir')) r[c.arquivo] = c.gravidade;
  writeFileSync(saida, JSON.stringify(r, Object.keys(r).sort(), 0).replace(/,"/g, ',\n"') + '\n');
  return { total: lista.length, marcados: Object.keys(r).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { total, marcados } = gerarResumoAuditoria();
  console.log(`auditoria: ${total} clipes, ${marcados} pedem atenção → web/src/telas/admin/auditoria-resumo.json`);
}
