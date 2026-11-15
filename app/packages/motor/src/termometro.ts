/**
 * Termômetro da alfabetização 0–10 (D004): CUMULATIVO, só sobe por provinha de fase / chefe de região
 * e NUNCA desce na tela da criança. Nível ≠ termômetro: o nível mede esforço; o termômetro, o que ela lê.
 */
export const FAIXAS_TERMOMETRO: Record<number, string> = {
  0: 'Ponto de partida: está conhecendo as letras do alfabeto e o som de cada uma.',
  1: 'Conhece as letras do alfabeto e o som principal de cada uma.',
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

/**
 * POR QUE O MÁXIMO ALCANÇÁVEL HOJE É 2 DE 10 (conferido na D030): a escala vai até 10 (alfabetização plena), mas o
 * termômetro só sobe quando uma fase com o campo `termometro` é concluída (sequencia.ts › concluirFase), e o conteúdo
 * publicado (Alfabeto, R0, R1, R2a) só tem três: a Festa do Alfabeto (1), o chefe das vogais (1) e o chefe de R2a (2).
 * As faixas 3–10 pertencem a regiões ainda não publicadas (V/S/N, P/T/B/D, dígrafos, regras, sílabas complexas,
 * fluência, compreensão). Não é defeito de conta: a criança que chega a 2 está no teto do que o app ensina hoje.
 * A escala NÃO foi refeita (decisão: não inventar escala nova); o painel do adulto mostra o teto atual.
 */
export function termometroMaximoDoConteudo(fases: { termometro?: number }[]): number {
  return fases.reduce((m, f) => Math.max(m, f.termometro ?? 0), 0);
}

export function subirTermometro(atual: number, valorDoChefe: number | undefined): number {
  if (valorDoChefe === undefined) return atual;
  return Math.min(10, Math.max(atual, valorDoChefe));
}

export function descreverTermometro(valor: number): string {
  return FAIXAS_TERMOMETRO[Math.floor(valor)] ?? FAIXAS_TERMOMETRO[0];
}
