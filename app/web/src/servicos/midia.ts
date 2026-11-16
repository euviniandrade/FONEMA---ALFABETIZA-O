/**
 * Tocar um clipe sem nunca travar quem espera por ele (voz da dupla e som das letras).
 * Ver docs/ESTADO-ATUAL.md §0: a "trava da voz" (16/11).
 */

/** Folga além da duração do clipe antes de desistir de esperar o fim (alguns navegadores não avisam o fim). */
export const MARGEM_FIM_MS = 1500;
/** Limite quando o navegador não sabe a duração do clipe. */
export const LIMITE_SEM_DURACAO_MS = 12000;

/** O mínimo de um elemento de áudio que tocarAteOFim usa (facilita o teste sem navegador). */
export interface MidiaTocavel {
  duration: number; ended: boolean; paused: boolean; error: unknown;
  onended: ((e: Event) => unknown) | null; onerror: OnErrorEventHandler | ((e: Event) => unknown) | null; onpause: ((e: Event) => unknown) | null;
  play(): Promise<void>;
}

/**
 * Toca um clipe e devolve uma promessa que SEMPRE termina (true = tocou até o fim):
 *  - no 'ended' (fim natural), no 'error', no 'pause' (fala interrompida) ou se o play() for recusado;
 *  - por um VIGIA que confere o estado a cada 250 ms: em alguns aparelhos o evento de fim não chega
 *    (visto no Chromium ao sair da Trilha dos Sons para a Lojinha: o clipe acabou e o 'ended' nunca veio,
 *    e a voz do app inteiro ficou presa esperando);
 *  - pelo tempo-limite = duração do clipe + MARGEM_FIM_MS (ou LIMITE_SEM_DURACAO_MS sem duração conhecida);
 *  - por `soltar()`, quando a fala é cancelada.
 */
export function tocarAteOFim(el: MidiaTocavel, margemMs = MARGEM_FIM_MS): { fim: Promise<boolean>; soltar: () => void } {
  let soltar: () => void = () => {};
  const fim = new Promise<boolean>((resolve) => {
    let feito = false;
    const t0 = Date.now();
    const acabar = (ok: boolean) => {
      if (feito) return;
      feito = true;
      clearInterval(vigia);
      el.onended = null; el.onerror = null; el.onpause = null;
      resolve(ok);
    };
    soltar = () => acabar(false);
    const limite = () => (Number.isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 + margemMs : LIMITE_SEM_DURACAO_MS);
    const vigia = setInterval(() => {
      if (el.ended) acabar(true);
      else if (el.error) acabar(false);
      else if (Date.now() - t0 > limite()) acabar(false);
    }, 250);
    el.onended = () => acabar(true);
    el.onerror = () => acabar(false);
    el.onpause = () => acabar(el.ended);
    try { el.play().catch(() => acabar(false)); } catch { acabar(false); }
  });
  return { fim, soltar };
}

/** Espera uma promessa por no máximo `ms` (nunca deixa uma fala anterior travar a próxima). */
export function noMaximo(p: Promise<unknown>, ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    p.then(() => { clearTimeout(t); resolve(); }, () => { clearTimeout(t); resolve(); });
  });
}
