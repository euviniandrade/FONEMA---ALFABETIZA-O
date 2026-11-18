/**
 * Letra sempre em maiúscula e minúscula ("Aa"), nunca só a grande (pedido do dono 18/11, fila nº 27 ponto 4).
 * `letraAa` é a forma em texto (para desenhar em canvas, como as placas do Corre-Som); `LetraAa` é o componente.
 * O id da letra (data-opcao, registro) continua a letra simples ("A"): só a tela muda.
 */
export const letraAa = (l: string): string => (l.length === 1 && l.toUpperCase() !== l.toLowerCase() ? `${l.toUpperCase()}${l.toLowerCase()}` : l);

export function LetraAa({ letra, className }: { letra: string; className?: string }) {
  return <b className={className} aria-label={`letra ${letra.toUpperCase()}`}>{letraAa(letra)}</b>;
}
