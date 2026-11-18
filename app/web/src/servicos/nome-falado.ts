/**
 * Fila do dono nº 27 (2), decisão do dono: o NOME da criança é dito no máximo UMA vez, no começo de cada atividade, prova
 * ou jogo; depois, rodadas inteiras sem chamar ("[NOME] aparece demais"). Regra central, usada pela voz (servicos/voz.ts):
 *  - a "atividade" começa a cada troca de tela (rotas.ts) e a cada atividade nova dentro da lição (telas/crianca/Sessao.tsx);
 *  - o nome só pode ser dito nos primeiros JANELA_DO_NOME_MS da atividade e só uma vez;
 *  - depois, a fala toca a variante gravada SEM o nome ("Agora é a sua vez!") ou, se não houver, os mesmos trechos sem o
 *    clipe do nome. O nome continua ESCRITO na tela (balões, títulos): a regra é da voz.
 */
export const JANELA_DO_NOME_MS = 30_000;

export class ControleNome {
  private inicio: number;
  private dito = false;
  constructor(private relogio: () => number = () => Date.now()) { this.inicio = relogio(); }
  /** Começou uma atividade, prova ou jogo: o nome pode ser dito de novo (uma vez). */
  novaAtividade(): void { this.inicio = this.relogio(); this.dito = false; }
  /** A próxima fala pode dizer o nome? */
  podeDizer(): boolean { return !this.dito && this.relogio() - this.inicio <= JANELA_DO_NOME_MS; }
  /** O clipe do nome acabou de tocar (ou, em teste, foi planejado). */
  disse(): void { this.dito = true; }
  get jaDisse(): boolean { return this.dito; }
}
