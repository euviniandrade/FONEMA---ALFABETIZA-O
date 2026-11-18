/**
 * Contrato comum das duas pistas do Corre-Som em corrida (D035): a 3D (corre-som-3d.ts) e a reserva 2D (corre-som-2d.ts).
 * A tela (CorreSom.tsx) só conversa com este contrato.
 */
export interface PlacaArco { letra?: string; imagem?: string }
export type MarcaArco = 'tentado' | 'modelo' | 'certo' | null;

/** Um arco (3 placas, uma por pista) a caminho do boneco. */
export interface PortalCorrida {
  /** Resolve com a pista em que o boneco estava quando o arco passou por ele (passou = escolheu). */
  passou: Promise<number>;
  /** Resolve quando o arco já andou o espaço entre dois arcos (hora de lançar o próximo da onda). */
  longe: Promise<void>;
  marcar(m: MarcaArco): void;
}

export interface MotorCorrida {
  /** A pista corre sem parar nesta velocidade (m/s; a 2D usa o mesmo tempo de chegada). */
  iniciarCorrida(velocidade: number): void;
  pararCorrida(): void;
  /** Lança um arco agora. `tempoMs` = quanto ele leva para chegar ao boneco (2D e "menos movimento"). */
  portal(placas: PlacaArco[], tempoMs: number): PortalCorrida;
  irParaPista(k: number): void;
  readonly pista: number;
  pular(): void;
  festejar(): void;
  chegada(): Promise<void>;
  /** Posição (0–1 da largura) de cada pista na tela, na altura das placas. */
  colunasNaTela(): number[];
  descartar(): void;
  aoMoeda: (() => void) | null;
  /** Pulou por cima de uma almofada (bônus). */
  aoPulo: (() => void) | null;
  aoTropeco: (() => void) | null;
}
