/**
 * Fila do dono nº 27 (1): a dupla cumprimenta a criança só na PRIMEIRA entrada do dia na vila ("Oi, [NOME]!").
 * Voltar de uma tela para a vila não fala nada (antes tocava "Que bom que você voltou…" toda vez: "fica cansativo").
 * Guardado por criança e por dia neste aparelho (localStorage); sem armazenamento, cumprimenta (melhor do que calar sempre).
 */
const CHAVE = 'fonema-saudou';

/** Dia local "AAAA-MM-DD". */
export function diaDe(agora: number): string {
  const d = new Date(agora);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Pura: dado o registro { criancaId: dia }, deve cumprimentar agora? */
export function deveSaudar(registro: Record<string, string>, criancaId: string, agora: number): boolean {
  return registro[criancaId] !== diaDe(agora);
}

/** Devolve true (e anota) se esta é a 1ª entrada do dia desta criança na vila. */
export function primeiraEntradaDoDia(criancaId: string, agora = Date.now()): boolean {
  try {
    const reg = JSON.parse(localStorage.getItem(CHAVE) || '{}') as Record<string, string>;
    if (!deveSaudar(reg, criancaId, agora)) return false;
    reg[criancaId] = diaDe(agora);
    localStorage.setItem(CHAVE, JSON.stringify(reg));
    return true;
  } catch {
    return true;
  }
}
