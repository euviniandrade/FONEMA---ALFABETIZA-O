import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEIXA_TERMINAR_MS, FADE_MS, JANELA_TOQUE_MS, LIMITE_ESPERA_MS, _zerarCanal, interromper, marcarToque, ocupar, vez } from './canal-audio.ts';

/**
 * Um "tocador" de mentira que usa o canal do mesmo jeito que voz.ts / sons-letras.ts: pede a vez, toca `dur` ms
 * (ou até ser cortado), solta a vez. Registra início e fim de cada áudio para conferir que nada se sobrepõe.
 */
const linha: { nome: string; ini: number; fim: number; cortado: boolean }[] = [];
async function tocar(nome: string, dur: number) {
  const liberar = await vez();
  try {
    const ini = Date.now();
    let acabar!: (cortado: boolean) => void;
    const fim = new Promise<boolean>((r) => { acabar = r; });
    const t = setTimeout(() => acabar(false), dur);
    const desocupar = ocupar({ restaMs: () => ini + dur - Date.now(), cortar: (ms) => { clearTimeout(t); setTimeout(() => acabar(true), ms); } });
    const cortado = await fim;
    desocupar();
    linha.push({ nome, ini, fim: Date.now(), cortado });
  } finally {
    liberar();
  }
}
const sobreposicoes = () => {
  const s: string[] = [];
  for (const a of linha) for (const b of linha) if (a !== b && a.ini < b.ini && b.ini < a.fim) s.push(`${a.nome}×${b.nome}`);
  return s;
};

describe('canal único de áudio: nunca duas falas/sons ao mesmo tempo', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(100000); _zerarCanal(); linha.length = 0; });
  afterEach(() => { vi.useRealTimers(); });

  it('pedidos seguidos tocam um depois do outro, na ordem (fila)', async () => {
    const a = tocar('pergunta', 2000);
    const b = tocar('som-estimulo', 600);
    const c = tocar('som-estimulo-2', 600);
    await vi.advanceTimersByTimeAsync(4000);
    await Promise.all([a, b, c]);
    expect(linha.map((x) => x.nome)).toEqual(['pergunta', 'som-estimulo', 'som-estimulo-2']);
    expect(sobreposicoes()).toEqual([]);
  });

  it('a criança interrompe: a fala longa sai com fade curto e só então a nova começa', async () => {
    const a = tocar('fala-longa', 5000);
    await vi.advanceTimersByTimeAsync(1000);
    marcarToque();
    interromper('novo');
    const b = tocar('correcao', 1500);
    await vi.advanceTimersByTimeAsync(FADE_MS + 50);
    await a;
    expect(linha[0]).toMatchObject({ nome: 'fala-longa', cortado: true });
    expect(linha[0].fim - linha[0].ini).toBeLessThanOrEqual(1000 + FADE_MS + 20);
    await vi.advanceTimersByTimeAsync(2000);
    await b;
    expect(sobreposicoes()).toEqual([]);
  });

  it('o som da escolha (menos de 1 s para acabar) termina inteiro antes da correção', async () => {
    const a = tocar('som-da-escolha', 700);
    await vi.advanceTimersByTimeAsync(100);
    marcarToque();
    interromper('novo');
    const b = tocar('correcao', 1500);
    await vi.advanceTimersByTimeAsync(3000);
    await Promise.all([a, b]);
    expect(linha[0]).toMatchObject({ nome: 'som-da-escolha', cortado: false });
    expect(linha[0].fim - linha[0].ini).toBe(700);
    expect(linha[1].ini).toBeGreaterThanOrEqual(linha[0].fim);
    expect(DEIXA_TERMINAR_MS).toBeGreaterThanOrEqual(700);
  });

  it('áudio novo SEM toque da criança não corta: espera a frase acabar (a pergunta não atropela a Sofia)', async () => {
    const a = tocar('frase-da-sofia', 3000);
    await vi.advanceTimersByTimeAsync(500);
    vi.setSystemTime(Date.now() + JANELA_TOQUE_MS + 10);
    interromper('novo');
    const b = tocar('som', 500);
    await vi.advanceTimersByTimeAsync(4000);
    await Promise.all([a, b]);
    expect(linha[0]).toMatchObject({ nome: 'frase-da-sofia', cortado: false });
    expect(sobreposicoes()).toEqual([]);
  });

  it('parar pedido (botão, troca de tela) corta mesmo sem toque recente', async () => {
    const a = tocar('historia', 8000);
    await vi.advanceTimersByTimeAsync(500);
    interromper('pedido');
    await vi.advanceTimersByTimeAsync(FADE_MS + 20);
    await a;
    expect(linha[0].cortado).toBe(true);
  });

  it('um áudio que nunca solta a vez não trava o canal para sempre', async () => {
    void vez(); // pegou a vez e "esqueceu" de soltar
    const b = tocar('depois', 100);
    await vi.advanceTimersByTimeAsync(LIMITE_ESPERA_MS + 200);
    await b;
    expect(linha.map((x) => x.nome)).toEqual(['depois']);
  });
});
