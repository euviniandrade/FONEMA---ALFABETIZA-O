/**
 * Critério dos pares mínimos (docs/pedagogia/06 §2 item 4; 04 §1 R8): 8 de 10 certas e sem ajuda nas últimas tentativas
 * do contraste; com menos de 10, a mesma proporção arredondada para cima; a fase não trava por isso.
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASE_POR_ID } from '@fonema/conteudo';
import { avaliarDominio, criterioDaFaseCumprido, criterioPares, itensDeParDaFase, novaHabilidade, progressoInicial, registrarTentativa } from '../src/index.ts';
import type { EstadoHabilidade, Tentativa } from '../src/index.ts';

const cfg = CONFIG_PADRAO;
const T0 = new Date('2026-11-16T15:00:00').getTime();
let k = 0;
const tent = (habilidade: string, acertou: boolean, sessao: string, extra: Partial<Tentativa> = {}): Tentativa =>
  ({ em: T0 + k++, sessao, habilidade, acertou, mecanica: 'parMinimo', alvo: `P${k % 4}ATO`, nOpcoes: 3, ...extra });
const montar = (ts: Tentativa[]): EstadoHabilidade => ts.reduce(registrarTentativa, novaHabilidade());
const H = 'par-minimo-p-b';
/** Sequência com `erros` posições erradas (índices) entre `n` tentativas, em 2 sessões. */
const seq = (n: number, erros: number[], h = H) => Array.from({ length: n }, (_, i) => tent(h, !erros.includes(i), i < n / 2 ? 's1' : 's2'));

describe('pares mínimos: 8 de 10', () => {
  it('criterioPares: 10 tentativas → 8; 9 → 8; 8 → 7 (mesma proporção, para cima)', () => {
    expect(criterioPares(seq(10, []), cfg.dominio).exigidos).toBe(8);
    expect(criterioPares(seq(9, []), cfg.dominio).exigidos).toBe(8);
    expect(criterioPares(seq(8, []), cfg.dominio).exigidos).toBe(7);
    expect(criterioPares(seq(14, []), cfg.dominio).janela).toBe(10);
  });

  it('3 erros nas últimas 10 seguram o domínio do par, mesmo com o resto do critério cumprido', () => {
    // erros antigos (posições 0–2) + 4 das últimas 5 certas: o critério geral passaria, o 8 de 10 não
    const ts = seq(14, [4, 5, 9]);
    const av = avaliarDominio(montar(ts), cfg.dominio, false, H);
    expect(av.faltaPares).toBe(true);
    expect(av.pares).toEqual({ janela: 10, acertos: 7, exigidos: 8 });
    expect(av.dominado).toBe(false);
    expect(av.falta.join(' ')).toMatch(/8 de 10/);
  });

  it('8 de 10 (com erro antigo fora da janela) não segura', () => {
    const ts = [...seq(4, [0, 1, 2, 3]), ...seq(12, [0, 3])];
    const av = avaliarDominio(montar(ts), cfg.dominio, false, H);
    expect(av.pares).toMatchObject({ janela: 10, exigidos: 8 });
    expect(av.faltaPares).toBe(false);
  });

  it('só vale para habilidades par-minimo-*', () => {
    const ts = seq(14, [4, 5, 9], 'letra-p');
    const av = avaliarDominio(montar(ts), cfg.dominio, false, 'letra-p');
    expect(av.pares).toBeUndefined();
    expect(av.faltaPares).toBe(false);
  });

  it('acerto com ajuda não conta na janela', () => {
    const ts = Array.from({ length: 10 }, (_, i) => tent(H, true, i < 5 ? 's1' : 's2', { comAjuda: i < 3 }));
    expect(criterioPares(ts, cfg.dominio).acertos).toBe(7);
  });

  it('a jornada não trava: nenhuma lição oferece 10 itens de um contraste, então a falta do 8 de 10 não segura a fase', () => {
    const fase = FASE_POR_ID['TF-18'];
    expect(itensDeParDaFase(fase, H)).toBeLessThan(10);
    expect(itensDeParDaFase(fase, H)).toBeGreaterThan(0);
    const p = progressoInicial('c1', T0);
    const ts = seq(14, [4, 5, 9]);
    const prog = { ...p, habilidades: { ...p.habilidades, [H]: montar(ts) } };
    expect(avaliarDominio(prog.habilidades[H], cfg.dominio, false, H).basicoCumprido).toBe(true);
    expect(criterioDaFaseCumprido(prog, fase, H, cfg)).toBe(true);
  });
});
