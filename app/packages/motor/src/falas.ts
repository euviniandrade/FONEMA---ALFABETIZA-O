/**
 * Encaixa o nome e a concordância nas falas (D013).
 *   [NOME]           → nome (texto na tela) ou pronúncia (voz)
 *   {masc|fem|neutro} → masculino ou feminino (D029); a forma neutra vale sem criança ou com sexo pendente
 *   [CHAVE]          → extras (ex.: [CONQUISTA], [FALTAM])
 */
import type { GeneroFala } from '@fonema/conteudo';

export interface ContextoFala {
  nome: string;
  genero: GeneroFala;
  extras?: Record<string, string | number>;
}

export function concordar(texto: string, genero: GeneroFala): string {
  return texto.replace(/\{([^{}|]*)\|([^{}|]*)\|([^{}]*)\}/g, (_m, masc: string, fem: string, neutro: string) =>
    genero === 'm' ? masc : genero === 'f' ? fem : neutro
  );
}

export function renderFala(texto: string, ctx: ContextoFala): string {
  let t = concordar(texto, ctx.genero);
  t = t.replace(/\[NOME\]/g, ctx.nome);
  for (const [k, v] of Object.entries(ctx.extras ?? {})) t = t.split(`[${k}]`).join(String(v));
  // limpa espaços duplos que sobram quando o neutro é vazio ("{O|A|} Kauã" → "Kauã")
  return t.replace(/\s{2,}/g, ' ').replace(/^\s+/, '').replace(/(^|[.!?]\s)([a-zà-ú])/g, (_m, a: string, b: string) => a + b.toUpperCase());
}

/** Palavras que não podem aparecer numa fala neutra (teste de concordância). */
export const MARCAS_DE_GENERO = /\b(pronto|pronta|bem-vindo|bem-vinda|curioso|curiosa|orgulhoso|orgulhosa|sozinho|sozinha|alfabetizado|alfabetizada)\b/i;

/**
 * Fila do dono nº 27 (2): a mesma fala SEM o nome da criança ("Agora é a sua vez, [NOME]!" → "Agora é a sua vez!").
 * Usada pela voz (servicos/voz.ts) depois que o nome já foi dito na atividade, e pelo extrator (scripts/extrair-falas.ts)
 * para gravar a variante sem nome das falas mais repetidas. Mesma função nos dois lados: a chave do clipe bate.
 *   "Isso, [NOME]! Você…"   → "Isso! Você…"      "[NOME], olha…" → "Olha…"
 *   "Você, [NOME], consegue" → "Você consegue"
 */
export function semNome(texto: string): string {
  let t = texto
    .replace(/^\s*\[NOME\]\s*[,!]?\s*/, '') // no começo: "[NOME], olha" → "olha"
    .replace(/\s*,\s*\[NOME\]\s*,\s*/g, ' ') // no meio, entre vírgulas
    .replace(/[\s,]*\[NOME\]\s*([!?.…]|$)/g, '$1') // no fim da frase: ", [NOME]!" → "!"
    .replace(/\s*\[NOME\]\s*/g, ' '); // qualquer outro lugar
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Fila nº 27 (2): o nome só pode ser cortado quando é CHAMAMENTO ("Agora é a sua vez, [NOME]!", "[NOME], olha"). Quando o
 * nome é o conteúdo da fala ("[NOME]!", "[NOME] começa com este som"), ele sempre é dito.
 */
export function nomeSoChamamento(texto: string): boolean {
  if (!texto.includes('[NOME]')) return false;
  if (!semNome(texto).replace(/[^\p{L}]/gu, '')) return false; // sem o nome não sobra nada
  for (const m of texto.matchAll(/\[NOME\]/g)) {
    const antes = texto.slice(0, m.index).trimEnd();
    const depois = texto.slice(m.index + m[0].length).trimStart();
    const vocativo = (antes === '' || antes.endsWith(',')) && (depois === '' || /^[,!?.…]/u.test(depois));
    if (!vocativo) return false;
  }
  return true;
}
