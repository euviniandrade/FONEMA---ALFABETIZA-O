/**
 * Termômetro da alfabetização 0–10 (D004): CUMULATIVO, só sobe por provinha de fase / chefe de região
 * e NUNCA desce na tela da criança. Nível ≠ termômetro: o nível mede esforço; o termômetro, o que ela lê.
 */
export const FAIXAS_TERMOMETRO: Record<number, string> = {
  0: 'Ponto de partida: brinca com os sons das palavras (rimas, palmas, primeiro som).',
  1: 'Reconhece o som das 5 vogais e o primeiro som das palavras.',
  2: 'Lê as primeiras palavras simples (MALA, LUA, FALA) juntando os sons.',
  3: 'Lê palavras com V, S, N e bilhetes de 2 palavras.',
  4: 'Lê palavras com P, T, B, D sem trocar.',
  5: 'Lê frases curtas com dígrafos.',
  6: 'Lê textos curtos com regras de contexto.',
  7: 'Lê com sílabas complexas.',
  8: 'Lê com fluência textos do dia a dia.',
  9: 'Lê e compreende textos com inferência.',
  10: 'Alfabetização plena.'
};

export function subirTermometro(atual: number, valorDoChefe: number | undefined): number {
  if (valorDoChefe === undefined) return atual;
  return Math.min(10, Math.max(atual, valorDoChefe));
}

export function descreverTermometro(valor: number): string {
  return FAIXAS_TERMOMETRO[Math.floor(valor)] ?? FAIXAS_TERMOMETRO[0];
}
