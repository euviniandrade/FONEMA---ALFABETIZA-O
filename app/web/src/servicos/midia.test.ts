import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LIMITE_SEM_DURACAO_MS, MARGEM_FIM_MS, noMaximo, tocarAteOFim, type MidiaTocavel } from './midia.ts';

/** Elemento de áudio de mentira: nada acontece sozinho (nem 'ended'), a não ser que o teste mande. */
function falso(duracaoS = 2, play: () => Promise<void> = () => Promise.resolve()): MidiaTocavel {
  return { duration: duracaoS, ended: false, paused: true, error: null, onended: null, onerror: null, onpause: null, play() { this.paused = false; return play(); } };
}

describe('tocarAteOFim: a espera por um clipe sempre termina (trava da voz, 16/11)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('termina no ended', async () => {
    const el = falso();
    const { fim } = tocarAteOFim(el);
    el.ended = true; el.onended?.(new Event('ended'));
    await expect(fim).resolves.toBe(true);
  });

  it('o clipe acabou mas o evento de fim NÃO chegou: o vigia percebe', async () => {
    const el = falso();
    const { fim } = tocarAteOFim(el);
    let feito = false; void fim.then(() => { feito = true; });
    el.ended = true; el.paused = true; // sem disparar onended/onpause (o que aconteceu no navegador)
    await vi.advanceTimersByTimeAsync(300);
    expect(feito).toBe(true);
    await expect(fim).resolves.toBe(true);
  });

  it('nada acontece: libera no tempo-limite = duração + margem', async () => {
    const el = falso(3);
    const { fim } = tocarAteOFim(el);
    let feito = false; void fim.then(() => { feito = true; });
    await vi.advanceTimersByTimeAsync(3000 + MARGEM_FIM_MS - 300);
    expect(feito).toBe(false);
    await vi.advanceTimersByTimeAsync(600);
    expect(feito).toBe(true);
  });

  it('sem duração conhecida: libera no limite fixo', async () => {
    const el = falso(NaN);
    const { fim } = tocarAteOFim(el);
    let feito = false; void fim.then(() => { feito = true; });
    await vi.advanceTimersByTimeAsync(LIMITE_SEM_DURACAO_MS + 300);
    expect(feito).toBe(true);
  });

  it('play recusado (sem permissão de som) libera na hora', async () => {
    const el = falso(5, () => Promise.reject(new Error('NotAllowedError')));
    await expect(tocarAteOFim(el).fim).resolves.toBe(false);
  });

  it('pausa no meio (fala interrompida) e soltar() liberam', async () => {
    const a = falso();
    const ta = tocarAteOFim(a);
    a.paused = true; a.onpause?.(new Event('pause'));
    await expect(ta.fim).resolves.toBe(false);
    const b = falso();
    const tb = tocarAteOFim(b);
    tb.soltar();
    await expect(tb.fim).resolves.toBe(false);
    expect(b.onended).toBeNull();
  });

  it('noMaximo: uma promessa que nunca termina não segura mais que o limite', async () => {
    let feito = false;
    void noMaximo(new Promise(() => {}), 1300).then(() => { feito = true; });
    await vi.advanceTimersByTimeAsync(1299);
    expect(feito).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(feito).toBe(true);
  });
});
