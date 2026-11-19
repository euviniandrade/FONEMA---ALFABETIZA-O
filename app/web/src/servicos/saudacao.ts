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
  return primeiraVezHoje(criancaId, 'vila', agora);
}

/**
 * A fala de apresentação de uma tela (Brincar, Lojinha…) só na 1ª vez do dia: voltar de um jogo para a lista não repete
 * "Vamos brincar com os sons das palavras!" (mesmo motivo do item 1 da fila nº 27). O botão de ouvir continua lá.
 */
export function primeiraVezHoje(criancaId: string, onde: string, agora = Date.now()): boolean {
  const id = onde === 'vila' ? criancaId : `${criancaId}|${onde}`;
  try {
    const reg = JSON.parse(localStorage.getItem(CHAVE) || '{}') as Record<string, string>;
    if (!deveSaudar(reg, id, agora)) return false;
    reg[id] = diaDe(agora);
    localStorage.setItem(CHAVE, JSON.stringify(reg));
    return true;
  } catch {
    return true;
  }
}
