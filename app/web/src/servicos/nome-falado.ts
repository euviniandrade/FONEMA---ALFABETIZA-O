/**
 * Fila do dono nº 27 (2), decisão do dono: o NOME da criança é dito no máximo UMA vez, no começo de cada atividade, prova
 * ou jogo; depois, rodadas inteiras sem chamar ("[NOME] aparece demais"). Regra central, usada pela voz (servicos/voz.ts):
 *  - a "atividade" começa a cada troca de tela (rotas.ts) e a cada atividade nova dentro da lição (telas/crianca/Sessao.tsx);
 *  - o nome é dito na PRIMEIRA fala com nome da atividade (venha quando vier) e só ela; uma fala de outra tela que toca atrasada não conta;
 *  - depois, a fala toca a variante gravada SEM o nome ("Agora é a sua vez!") ou, se não houver, os mesmos trechos sem o
 *    clipe do nome. O nome continua ESCRITO na tela (balões, títulos): a regra é da voz.
 */
export class ControleNome {
  private dito = false;
  /** Número da atividade atual: uma fala pedida numa atividade anterior (ex.: a saudação da vila que toca atrasada) não gasta a vez desta. */
  atividade = 0;
  /** Começou uma atividade, prova ou jogo: o nome pode ser dito de novo (uma vez). */
  novaAtividade(): void { this.atividade++; this.dito = false; }
  /** A próxima fala pode dizer o nome? (a 1ª fala com nome da atividade, venha quando vier) */
  podeDizer(): boolean { return !this.dito; }
  /** O clipe do nome tocou numa fala pedida na atividade `atividade` (padrão: a atual). */
  disse(atividade = this.atividade): void { if (atividade === this.atividade) this.dito = true; }
  get jaDisse(): boolean { return this.dito; }
}
