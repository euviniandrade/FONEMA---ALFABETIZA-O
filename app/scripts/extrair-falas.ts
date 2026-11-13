/**
 * Junta TODAS as falas fixas da plataforma em packages/conteudo/src/falas.json
 * (id estável, voz sofia|tales, texto com [NOME] onde entra o nome da criança).
 * Fontes: (1) o conteúdo (fases, cenas, falas gerais, conquistas) expandido nas 3 formas de concordância;
 *         (2) as falas realmente ditas pelas telas durante o E2E (web/e2e/falas-coletadas.json, `npm run e2e -- --coletar`).
 * Uso: npx tsx scripts/extrair-falas.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { FASES, FALAS, CONQUISTA_POR_ID, FIGURAS, PALAVRAS_R2A, ITENS_LOJA, type Fala } from '@fonema/conteudo';
import { concordar, silabas } from '@fonema/motor';

const VOZ: Record<string, 'sofia' | 'tales'> = { sofia: 'sofia', tales: 'tales', bolota: 'tales', davi: 'tales', 'dona-cida': 'sofia', pescadora: 'sofia', 'guarda-parque': 'tales', 'zum-zum': 'tales' };
const saida = new Map<string, { voz: string; texto: string; origem: string }>();

function add(quem: string, texto: string | undefined, origem: string) {
  if (!texto || texto.includes('$')) return;
  for (const g of ['m', 'f', 'n'] as const) {
    const t = concordar(texto, g).trim();
    const voz = VOZ[quem] ?? 'sofia';
    saida.set(`${voz}|${t}`, { voz, texto: t, origem });
  }
}
const addF = (f: Fala | undefined, origem: string) => f && add(f.quem, f.texto, origem);

for (const f of FASES) {
  addF(f.acolhida, f.id); addF(f.gancho, f.id);
  add('sofia', `${f.titulo}. ${f.objetivo}.`, f.id);
  if (f.uau) add('tales', f.uau, f.id);
  for (const c of f.cenas) {
    c.assiste?.roteiro.forEach((r) => addF(r, c.id));
    const a = c.atividade;
    if (!a) continue;
    addF(a.enunciado, c.id); addF(a.comemora, c.id);
    if (a.tipo === 'escolher') a.itens.forEach((i) => { add(a.enunciado.quem, i.ouvir, c.id); add('sofia', i.dica, c.id); i.opcoes.forEach((o) => add('sofia', o.falar, c.id)); });
    if (a.tipo === 'palmas') a.palavras.forEach((w) => { if (!w.startsWith('$')) { add('tales', w, c.id); silabas(w).forEach((s) => add('sofia', s, c.id)); } });
    if (a.tipo === 'montar') a.palavras.forEach((w) => !w.startsWith('$') && add('sofia', w.toLowerCase(), c.id));
    if (a.tipo === 'ditado') a.palavras.forEach((w) => add('sofia', w.toLowerCase(), c.id));
    if (a.tipo === 'falar') a.itens.forEach((i) => add('sofia', i.falar, c.id));
    if (a.tipo === 'pausa') a.sequencia.forEach((s) => add('tales', s.falar, c.id));
  }
  // dicas do cadeado: geradas só se sobrar orçamento (DICAS=1)
  if (process.env.DICAS === '1') for (const id of f.conquistas) if (CONQUISTA_POR_ID[id]) add('sofia', CONQUISTA_POR_ID[id].dica, id);
  if (f.demonstracao) add('tales', `${f.demonstracao.descricao}.`, f.id);
}
FALAS.chegada.forEach((f) => addF(f, 'chegada'));
FALAS.voltou.forEach((f) => addF(f, 'voltou'));
addF(FALAS.avatar, 'avatar'); addF(FALAS.avatarPronto, 'avatar'); addF(FALAS.suaVez, 'geral');
FALAS.acertos.forEach((t) => add('sofia', t, 'acertos'));
for (const k of ['erro1', 'erro2', 'erroJunto', 'naoOuvi', 'euFalei', 'professorAprendeu', 'professorTreinar', 'professorExplicou'] as const) add('sofia', FALAS[k], k);
Object.values(FALAS.ritual).forEach((t) => add('sofia', t, 'ritual'));
Object.values(FIGURAS).forEach((w) => add('sofia', w.texto, 'figuras'));
PALAVRAS_R2A.forEach((w) => add('sofia', w.texto.toLowerCase(), 'palavras'));
void ITENS_LOJA;
add('sofia', FALAS.conquista, 'ritual'); add('tales', FALAS.surpresa, 'ritual');

const coletadas = 'web/e2e/falas-coletadas.json';
if (existsSync(coletadas)) {
  for (const linha of JSON.parse(readFileSync(coletadas, 'utf8')) as string[]) {
    const [voz, ...r] = linha.split('|');
    const texto = r.join('|').trim();
    if (!/\d{2,}|[a-z]-[a-z0-9]{6}/i.test(texto)) saida.set(`${voz}|${texto}`, { voz, texto, origem: 'telas (E2E)' });
  }
}

function id(voz: string, t: string) {
  let h = 5381;
  for (const ch of `${voz}|${t}`) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return `${voz[0]}-${h.toString(36)}`;
}
const lista = [...saida.values()].map((x) => ({ id: id(x.voz, x.texto), ...x })).sort((a, b) => a.id.localeCompare(b.id));
writeFileSync('packages/conteudo/src/falas.json', JSON.stringify(lista, null, 1) + '\n');
const trechos = new Set<string>();
for (const f of lista) for (const p of f.texto.split('[NOME]')) { const k = p.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').trim(); if (k) trechos.add(`${f.voz}|${k}`); }
const chars = [...trechos].reduce((s, t) => s + t.split('|').slice(1).join('|').length, 0);
console.log(`${lista.length} falas, ${trechos.size} trechos únicos, ${chars} caracteres`);
