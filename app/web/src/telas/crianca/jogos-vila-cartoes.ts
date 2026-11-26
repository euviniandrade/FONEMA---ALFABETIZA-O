/**
 * Cartões e endereços dos JOGOS DA VILA (Estrada e Rio dos Pares, Carteiro da Vila, Casa do Som), sem as telas: o Brincar
 * (Parque de Jogos), o fim da missão e o mundo 3D usam isto sem carregar os jogos. Telas: JogosVila.tsx.
 * Gancho para o mundo 3D: abrir `#/` + `rotaDoJogoDaVila(criancaId, 'carteiro')` (ex.: #/c/123/jogo/carteiro).
 */
import { nomeDoJogo, treinaDoJogo } from '@fonema/conteudo';
import { carteiroLiberado, casaLiberada, variacoesDaEstrada, type JogoVilaId, type Progresso } from '@fonema/motor';

/** Endereço de cada jogo (para o Parque, o fim da missão e o mundo 3D). */
export const rotaDoJogoDaVila = (criancaId: string, jogo: JogoVilaId, faseId?: string) => `c/${criancaId}/jogo/${jogo}${faseId ? `/${faseId}` : ''}`;

/** Cartões dos jogos da vila (para o Parque de Jogos / Brincar mostrar). */
/** Nome e "treina" vêm do Estúdio criativo › Jogos (conteudo/jogos.ts), lidos na hora (getters): edição vale sem recarregar. */
const cartao = (id: JogoVilaId, nome: string, treina: string, capa: string[], cor: string) => ({
  id, capa, cor, get nome() { return nomeDoJogo(id, nome); }, get treina() { return treinaDoJogo(id, treina); }
});
export const JOGOS_DA_VILA: { id: JogoVilaId; nome: string; treina: string; capa: string[]; cor: string }[] = [
  cartao('estrada-pares', 'Estrada e Rio dos Pares', 'Ouvir e ler palavras quase iguais', ['vaca', 'faca'], 'mar'),
  cartao('carteiro', 'Carteiro da Vila', 'Ler o nome e entregar a carta', ['mala', 'lua'], 'ipe'),
  cartao('casa-som', 'Casa do Som', 'Escrever para montar a casinha', ['pia', 'bule'], 'verde')
];

/** Situação de cada jogo para a criança (aberto ou o que falta). */
export function situacaoDosJogosDaVila(p: Progresso): Record<JogoVilaId, { aberto: boolean; motivo?: string }> {
  const est = variacoesDaEstrada(p);
  const c = carteiroLiberado(p);
  const casa = casaLiberada(p);
  return {
    'estrada-pares': { aberto: est.some((v) => v.liberada), motivo: est[0].motivo },
    carteiro: { aberto: c.liberada, motivo: c.motivo },
    'casa-som': { aberto: casa.liberada, motivo: casa.motivo }
  };
}

