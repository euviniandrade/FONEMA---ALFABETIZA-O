/**
 * Junta TODAS as falas fixas da plataforma em packages/conteudo/src/falas.json
 * (id estável, voz sofia|tales, texto com [NOME] onde entra o nome da criança).
 * Fontes: (1) o conteúdo (fases, cenas, falas gerais, conquistas) expandido nas 3 formas de concordância;
 *         (2) as falas realmente ditas pelas telas durante o E2E (web/e2e/falas-coletadas.json, `npm run e2e -- --coletar`).
 * Uso: npx tsx scripts/extrair-falas.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ALFABETO, NOMES_COMUNS, FASES, FALAS, FALAS_TRILHA_SONS, SILABA_DO_SOM, FALAS_ALFABETO, FALAS_FONICAS, VOZES_DAS_FALAS_FONICAS, FALAS_DOS_PARES, FALA_ESPELHO_BD, FALAS_DAS_TELAS, FALAS_TUTORIAL, PASSOS_AVATAR, CONQUISTA_POR_ID, FIGURAS, PALAVRAS_R2A, ITENS_LOJA, SONS, type Fala } from '@fonema/conteudo';
import { concordar, silabas } from '@fonema/motor';
import { FALAS_CACA, LUGARES_CACA } from '@fonema/conteudo';
import { FALAS_BIBLIOTECA, FALAS_ESCUTA, FALAS_HISTORIA, FALAS_TEXTO, HISTORIAS, JOGOS_ESCUTA, TEXTOS_DECODIFICAVEIS, nomeDaFigura, textoCorrido } from '@fonema/conteudo';

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
  // entrada da fase: fala curta própria (Trilha do Alfabeto: "Letra B.") ou "título. objetivo."
  if (f.falaEntrada) addF(f.falaEntrada, f.id); else add('sofia', `${f.titulo}. ${f.objetivo}.`, f.id);
  if (f.uau) add('tales', f.uau, f.id);
  for (const c of f.cenas) {
    c.assiste?.roteiro.forEach((r) => addF(r, c.id));
    const a = c.atividade;
    if (!a) continue;
    addF(a.enunciado, c.id); addF(a.comemora, c.id);
    if (a.tipo === 'escolher') a.itens.forEach((i) => { add(i.quem ?? a.enunciado.quem, i.ouvir, c.id); add(i.quemDica ?? 'sofia', i.dica, c.id); addF(i.apoio, c.id); i.opcoes.forEach((o) => add('sofia', o.falar, c.id)); });
    if (a.tipo === 'palmas') a.palavras.forEach((w) => { if (!w.startsWith('$')) { add('tales', w, c.id); silabas(w).forEach((s) => add('sofia', s, c.id)); } });
    if (a.tipo === 'montar') a.palavras.forEach((w) => !w.startsWith('$') && add('sofia', w.toLowerCase(), c.id));
    if (a.tipo === 'ditado') a.palavras.forEach((w) => add('sofia', w.toLowerCase(), c.id));
    if (a.tipo === 'falar') a.itens.forEach((i) => add('sofia', i.falar, c.id));
    if (a.tipo === 'letra') { a.falas.forEach((x) => addF(x, c.id)); addF(a.brincadeira, c.id); addF(a.repita, c.id); }
    if (a.tipo === 'espelho') { add(a.voz ?? 'sofia', a.falaSom, c.id); add(a.voz ?? 'sofia', a.falaAncora, c.id); if (a.voz) add(a.voz, 'Agora é a sua vez, [NOME]!', c.id); }
    if (a.tipo === 'pausa') a.sequencia.forEach((s) => add('tales', s.falar, c.id));
    // Trilha dos Sons (D030): só palavras soltas e frases curtas; as molduras vêm de FALAS_TRILHA_SONS
    if (a.tipo === 'somNovo') { addF(a.brincadeira, c.id); addF(a.repita, c.id); addF(a.revela, c.id); addF(a.apoio, c.id); a.regra?.partes.forEach((p) => { addF(p.explica, c.id); p.palavras.forEach((w) => add('sofia', w.palavra.toLowerCase(), c.id)); }); addF(a.regra?.fecha, c.id); }
    if (a.tipo === 'sintese') a.itens.forEach((i) => { add('sofia', i.correta, c.id); i.opcoes.forEach((o) => add('sofia', o.falar, c.id)); });
    if (a.tipo === 'caixas') a.itens.forEach((i) => add('sofia', i.palavra.toLowerCase(), c.id));
    if (a.tipo === 'parMinimo') a.itens.forEach((i) => { add('sofia', i.alvo, c.id); add('sofia', i.outra, c.id); if (i.distrator) add('sofia', i.distrator, c.id); });
    if (a.tipo === 'troca') a.itens.forEach((i) => i.leituras.forEach((w) => add('sofia', w, c.id)));
    if (a.tipo === 'frase') a.itens.forEach((i) => { add('sofia', i.frase, c.id); addF(i.pergunta, c.id); i.opcoes.forEach((o) => add('sofia', o, c.id)); });
  }
  // dicas do cadeado (botão "Ouvir a dica" na entrada da fase): entram sempre; DICAS=0 deixa de fora
  if (process.env.DICAS !== '0') for (const id of f.conquistas) if (CONQUISTA_POR_ID[id]) add('sofia', CONQUISTA_POR_ID[id].dica, id);
  if (f.demonstracao) add('tales', `${f.demonstracao.descricao}.`, f.id);
}
FALAS.chegada.forEach((f) => addF(f, 'chegada'));
addF(FALAS.saudacao, 'saudacao');
addF(FALAS.avatar, 'avatar'); addF(FALAS.avatarPronto, 'avatar'); addF(FALAS.avatarSexo, 'avatar'); addF(FALAS.avatarLojinha, 'avatar');
PASSOS_AVATAR.forEach((p) => add('tales', p.pergunta, 'avatar'));
FALAS_DAS_TELAS.forEach((f) => addF(f, 'telas'));
// D032: tutorial "A grande aventura" (e o botão "Você está aqui" do painel guia, que reusa as falas das etapas)
Object.values(FALAS_TUTORIAL).forEach((f) => addF(f, 'tutorial'));
// fila nº 25: caça ao tesouro no passeio 3D (falas e charadas dos lugares)
Object.values(FALAS_CACA).forEach((f) => addF(f, 'caca'));
LUGARES_CACA.forEach((l) => addF(l.charada, 'caca'));
add('sofia', 'Continue a trilha para descobrir!', 'telas');
Object.values(FALAS_DOS_PARES).forEach((p) => { add('sofia', p.tocou, 'pares (D030)'); add('sofia', p.como, 'pares (D030)'); });
add('sofia', FALA_ESPELHO_BD, 'pares (D030)'); addF(FALAS.suaVez, 'geral');
FALAS.acertos.forEach((t) => add('sofia', t, 'acertos'));
for (const k of ['erro1', 'erro2', 'erroJunto', 'naoOuvi', 'euFalei', 'professorAprendeu', 'professorTreinar', 'professorExplicou'] as const) add('sofia', FALAS[k], k);
Object.values(FALAS.ritual).forEach((t) => add('sofia', t, 'ritual'));
Object.values(FIGURAS).forEach((w) => add('sofia', w.texto, 'figuras'));
PALAVRAS_R2A.forEach((w) => add('sofia', w.texto.toLowerCase(), 'palavras'));
void ITENS_LOJA;
Object.values(SONS).forEach((x) => { add('sofia', x.esticado, 'sons'); add('tales', x.esticado, 'sons'); });
['A', 'E', 'I', 'O', 'U', 'M', 'L', 'F', 'S', 'V', 'N'].forEach((l) => add('sofia', l.toLowerCase().repeat(3), 'sons'));
add('sofia', FALAS_ALFABETO.trilha, 'trilha do alfabeto');
// D030: frases-moldura da Trilha dos Sons (sempre a Sofia) e as sílabas usadas como estímulo dos sons ainda duvidosos
Object.values(FALAS_TRILHA_SONS).forEach((t) => add('sofia', t, 'trilha dos sons'));
Object.values(SILABA_DO_SOM).forEach((t) => add('sofia', t, 'trilha dos sons'));
// D030: falas fônicas genéricas (correção contrastiva, apoios e enunciados novos), cada uma na(s) voz(es) em que é usada
for (const k of Object.keys(FALAS_FONICAS) as (keyof typeof FALAS_FONICAS)[]) for (const v of VOZES_DAS_FALAS_FONICAS[k] ?? ['sofia']) add(v, FALAS_FONICAS[k], 'falas fônicas (D030)');
// três palavras-exemplo de cada letra (D029 §2): ditas pela Sofia na tela da letra
ALFABETO.forEach((l) => l.palavras.forEach((w) => add('sofia', w, 'alfabeto: palavras')));
add('sofia', FALAS.conquista, 'ritual'); add('tales', FALAS.surpresa, 'ritual');

// D030 etapa 8: Cantinho da Leitura e Brincar com sons (histórias, textos para ler sozinho, perguntas, vocabulário, jogos)
for (const h of HISTORIAS) {
  addF(h.abre, h.id); addF(h.fecha, h.id); h.paginas.forEach((pg) => addF(pg.texto, h.id));
  h.perguntas.forEach((q) => { addF(q.pergunta, h.id); q.opcoes.forEach((o) => add('sofia', nomeDaFigura(o), h.id)); });
  h.vocabulario.forEach((v) => { add('tales', v.palavra, h.id); addF(v.explica, h.id); addF(v.frase, h.id); addF(v.pergunta, h.id); v.opcoes.forEach((o) => add('sofia', nomeDaFigura(o), h.id)); });
}
for (const t of TEXTOS_DECODIFICAVEIS) {
  add('sofia', textoCorrido(t), t.id);
  t.linhas.forEach((l) => add('sofia', l.texto, t.id));
  t.perguntas.forEach((q) => { addF(q.pergunta, t.id); q.opcoes.forEach((o) => add('sofia', nomeDaFigura(o), t.id)); });
}
for (const j of JOGOS_ESCUTA) {
  addF(j.enunciado, j.id); add('sofia', j.pergunta, j.id);
  j.itens.forEach((it) => [...it.opcoes, ...(it.estimulo ? [it.estimulo] : [])].forEach((o) => add('sofia', nomeDaFigura(o), j.id)));
  j.palavras?.forEach((w) => { add('tales', w, j.id); silabas(w).forEach((x) => add('sofia', x, j.id)); });
}
[FALAS_HISTORIA, FALAS_TEXTO, FALAS_ESCUTA, FALAS_BIBLIOTECA].forEach((g) => Object.values(g).forEach((f) => addF(f, 'cantinho da leitura')));

const coletadas = 'web/e2e/falas-coletadas.json';
if (existsSync(coletadas)) {
  for (const linha of JSON.parse(readFileSync(coletadas, 'utf8')) as string[]) {
    const [voz, ...r] = linha.split('|');
    const texto = r.join('|').trim();
    const temNome = NOMES_COMUNS.some((n) => new RegExp(`\\b${n}\\b`, 'i').test(texto)) || /Mari[aá]n/i.test(texto);
    if (!temNome && texto.replace(/[^\p{L}]/gu, '').length > 3 && !/\d{2,}|[a-z]-[a-z0-9]{6}/i.test(texto)) saida.set(`${voz}|${texto}`, { voz, texto, origem: 'telas (E2E)' });
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
for (const f of lista) for (const p of f.texto.split('[NOME]')) { const k = p.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').replace(/(\p{L})\1{2,}/giu, '$1$1$1$1').trim(); if (k) trechos.add(`${f.voz}|${k}`); }
const chars = [...trechos].reduce((s, t) => s + t.split('|').slice(1).join('|').length, 0);
console.log(`${lista.length} falas, ${trechos.size} trechos únicos, ${chars} caracteres`);
