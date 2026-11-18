/**
 * CANAL ÚNICO DE ÁUDIO (revisão de qualidade 18/11, item 1: "as vozes se atropelam").
 *
 * Regra: nunca duas falas ou sons ao mesmo tempo. Toda fala da dupla (servicos/voz.ts), todo som de letra
 * (servicos/sons-letras.ts) e todos os sons emendados (mecanicas/sons-emendados.ts) passam por aqui:
 *  - `vez()` é uma fila (FIFO): quem pede espera o áudio anterior ACABAR de verdade antes de começar;
 *  - quem toca se registra com `ocupar()` e solta a vez ao terminar (`liberar`);
 *  - `interromper()` corta o que está tocando de forma LIMPA: um som ou o finzinho de uma frase (menos de 1 s)
 *    termina sozinho; o resto desce o volume em 90 ms e para. Só então o próximo da fila começa — a correção espera
 *    o som da escolha acabar e nada fica por cima.
 *  - Quem corta: a criança. Um pedido de parar explícito (`'pedido'`: botão, troca de tela) sempre corta. Um áudio NOVO
 *    (`'novo'`) só corta o anterior se a criança tocou na tela há pouco (`JANELA_TOQUE_MS`); senão ele espera a vez:
 *    a pergunta nunca atropela a frase da Sofia nem o som-estímulo.
 *  - a espera tem limite (`LIMITE_ESPERA_MS`): um áudio que nunca avisa o fim não trava o app (ver midia.ts).
 * Efeitos curtos (servicos/efeitos.ts: "plim" de toque e de acerto) não passam pela fila: não são fala nem som de letra.
 */

/** Fala em andamento com menos que isto para acabar é deixada terminar (nunca cortar uma sílaba ou um som). */
export const DEIXA_TERMINAR_MS = 1000;
/** Ao interromper, o volume desce neste tempo (sem estalo). */
export const FADE_MS = 90;
/** Ninguém espera mais que isto pela vez (o áudio anterior sempre avisa o fim antes; isto é só a rede de segurança). */
export const LIMITE_ESPERA_MS = 14000;
/** Um áudio novo pedido até este tempo depois de um toque da criança vale como "a criança interrompeu". */
export const JANELA_TOQUE_MS = 900;

let ultimoToque = -Infinity;
/** Marca um toque da criança agora (o app escuta pointerdown/keydown; os testes chamam direto). */
export function marcarToque(agora = Date.now()) { ultimoToque = agora; }
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, () => marcarToque(), { capture: true, passive: true });
}
/** Motivo da interrupção: 'pedido' = parar explícito (sempre corta); 'novo' = um áudio novo foi pedido. */
export type MotivoParar = 'pedido' | 'novo';

/** O que está tocando agora, do jeito que o canal precisa para cortar. */
export interface Tocando {
  /** Quanto falta (ms) para acabar sozinho; Infinity se não se sabe. */
  restaMs(): number;
  /** Corta com fade de `ms` e avisa o fim (quem tocava solta a vez). */
  cortar(ms: number): void;
}

let fila: Promise<void> = Promise.resolve();
let atual: Tocando | null = null;
/** Muda a cada interrupção: um pedido que esperava na fila sabe que ficou velho. */
let interrupcoes = 0;

function noMaximo(p: Promise<unknown>, ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    p.then(() => { clearTimeout(t); resolve(); }, () => { clearTimeout(t); resolve(); });
  });
}

/**
 * Pede a vez de tocar. Resolve quando o áudio anterior acabou; devolve a função que solta a vez (chame sempre,
 * mesmo se desistir de tocar). Pode chamar `liberar` mais de uma vez sem problema.
 */
export async function vez(): Promise<() => void> {
  const anterior = fila;
  let soltar!: () => void;
  fila = new Promise<void>((r) => { soltar = r; });
  let feito = false;
  const liberar = () => { if (feito) return; feito = true; soltar(); };
  await noMaximo(anterior, LIMITE_ESPERA_MS);
  return liberar;
}

/** Marca o que está tocando (para `interromper` poder cortar). Devolve a função que desmarca. */
export function ocupar(t: Tocando): () => void {
  atual = t;
  return () => { if (atual === t) atual = null; };
}

/** Corta o que estiver tocando de forma limpa (ver a regra no topo). */
export function interromper(motivo: MotivoParar = 'pedido'): void {
  interrupcoes++;
  const t = atual;
  if (!t) return;
  if (motivo === 'novo' && Date.now() - ultimoToque > JANELA_TOQUE_MS) return; // ninguém tocou: o novo espera a vez
  const resta = t.restaMs();
  if (resta <= DEIXA_TERMINAR_MS) return; // termina sozinho; o próximo espera na fila
  atual = null;
  t.cortar(FADE_MS);
}

/** Contador de interrupções (para quem quer saber se o pedido dele ficou velho enquanto esperava). */
export const numeroDeInterrupcoes = () => interrupcoes;
/** Há algo tocando agora? */
export const canalOcupado = () => atual !== null;

/** Adaptador para um elemento de áudio do navegador: fade no volume e pausa. */
export function tocandoDoElemento(el: { duration: number; currentTime: number; paused: boolean; ended: boolean; volume: number; pause(): void }, aoCortar?: () => void): Tocando {
  return {
    restaMs: () => (el.paused || el.ended ? 0 : Number.isFinite(el.duration) && el.duration > 0 ? (el.duration - el.currentTime) * 1000 : Infinity),
    cortar: (ms) => {
      const v0 = el.volume;
      const t0 = Date.now();
      const passo = () => {
        const k = (Date.now() - t0) / ms;
        if (k >= 1 || el.paused) { try { el.pause(); } catch { /* nada */ } aoCortar?.(); return; }
        el.volume = Math.max(0, v0 * (1 - k) * (1 - k));
        setTimeout(passo, 15);
      };
      passo();
    }
  };
}

/** Só para testes: zera o canal. */
export function _zerarCanal() { fila = Promise.resolve(); atual = null; interrupcoes = 0; ultimoToque = -Infinity; }
