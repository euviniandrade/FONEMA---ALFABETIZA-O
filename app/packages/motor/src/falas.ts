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
