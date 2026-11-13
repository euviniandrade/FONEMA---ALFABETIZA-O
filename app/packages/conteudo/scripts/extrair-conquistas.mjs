// Extrai do catálogo oficial (docs/propostas/06-fonema-unificada/conquistas/catalogo.json)
// o subconjunto usado pelo MVP (R0, R1, R2a + Maestria dos sons dessas regiões), sem patentes
// (patentes ficam na visão do adulto, recomendação P1 da revisão).
// Uso: node packages/conteudo/scripts/extrair-conquistas.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const origem = resolve(aqui, '../../../../docs/propostas/06-fonema-unificada/conquistas/catalogo.json');
const destino = resolve(aqui, '../src/dados/conquistas-catalogo.json');
const REGIOES = new Set(['R0', 'R1', 'R2a']);
const SONS = new Set(['S-SOM-A', 'S-SOM-E-E-E', 'S-SOM-I', 'S-SOM-O-O-O', 'S-SOM-U', 'S-SOM-M', 'S-SOM-L', 'S-SOM-F']);

const todos = JSON.parse(readFileSync(origem, 'utf8'));
const sub = todos
  .filter((c) => c.tipo !== 'patente' && (REGIOES.has(c.regiao) || SONS.has(c.id)))
  .map(({ id, nome, tipo, categoria, regiao, criterio, niveis, visivel_antes, area }) => ({
    id, nome, tipo, categoria, regiao, criterio, niveis, visivel_antes, area
  }));
writeFileSync(destino, JSON.stringify(sub, null, 2) + '\n');
console.log(`conquistas extraídas: ${sub.length} → ${destino}`);
