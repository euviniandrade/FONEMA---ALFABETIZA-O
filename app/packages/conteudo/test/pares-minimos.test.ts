/**
 * Pares mínimos com 3 opções (docs/pedagogia/04 §1 R8; 06 §2 item 4): todo item que conta para o domínio tem um distrator
 * coerente — palavra do banco, diferente do alvo e do par, decodificável na unidade (modo ler) ou com figura (modo ouvir).
 */
import { describe, expect, it } from 'vitest';
import { BANCO, FASES, sonsDaAnotacao, verificarPalavra } from '../src/index.ts';
import { leiturasDaFase, unidadeDaFase } from '../src/fases/verificar-fases.ts';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const figura = (w: string) => existsSync(fileURLToPath(new URL(`../../../web/public/assets/figuras/${BANCO[w]?.figura ?? w}.webp`, import.meta.url)));

describe('pares mínimos com 3 opções', () => {
  const itens = FASES.flatMap((f) => f.cenas.flatMap((c) => (c.atividade?.tipo === 'parMinimo' && c.contaDominio ? c.atividade.itens.map((i) => ({ f, c, i })) : [])));

  it('todo item avaliado tem um distrator diferente do alvo e do par', () => {
    expect(itens.length).toBeGreaterThan(10);
    for (const { c, i } of itens) {
      expect(i.distrator, `${c.id} ${i.alvo}`).toBeTruthy();
      expect(new Set([i.alvo, i.outra, i.distrator]).size, `${c.id} ${i.alvo}`).toBe(3);
      expect(BANCO[i.distrator!], `${i.distrator} no banco`).toBeDefined();
    }
  });

  it('modo ler: o distrator é decodificável na unidade da fase e entra no verificador', () => {
    for (const { f, c, i } of itens) {
      if (i.modo !== 'ler') continue;
      const n = unidadeDaFase(f)!;
      const r = verificarPalavra(i.distrator!, n, BANCO);
      expect(r.erros, `${c.id} ${i.distrator}`).toEqual([]);
      expect(leiturasDaFase(f).some((l) => l.cena === c.id && l.texto === i.distrator)).toBe(true);
    }
  });

  it('modo ouvir: o distrator tem figura', () => {
    for (const { c, i } of itens) if (i.modo === 'ouvir') expect(figura(i.distrator!), `${c.id} ${i.distrator}`).toBe(true);
  });

  it('o distrator difere do alvo em algum som (não é o mesmo par disfarçado)', () => {
    for (const { c, i } of itens) {
      const a = sonsDaAnotacao(BANCO[i.alvo].sons).join(' ');
      expect(sonsDaAnotacao(BANCO[i.distrator!].sons).join(' '), c.id).not.toBe(a);
    }
  });
});
