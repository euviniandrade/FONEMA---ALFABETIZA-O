/**
 * Revisão independente da metodologia (16/11): pronúncia anotada, sílaba × letra, pares mínimos com a habilidade do
 * contraste, verificador da Trilha A–Z acumulando só o que já foi visto.
 */
import { describe, expect, it } from 'vitest';
import { BANCO, FASES, FASE_POR_ID, HABILIDADE_POR_ID, habilidadeDoPar, verificarPalavra } from '../src/index.ts';
import { leiturasDaFase, valoresVistosAte } from '../src/fases/verificar-fases.ts';

describe('revisão da metodologia (16/11)', () => {
  it('E e O tônicos anotados como no PB: veja /ɛ/, come /ɔ/, fofa /o/', () => {
    expect(BANCO.veja.sons).toBe('v ɛ ʒ a');
    expect(BANCO.come.sons).toBe('k ɔ m i');
    expect(BANCO.fofa.sons).toBe('f o f a');
  });

  it('todo item de par mínimo grava a habilidade do SEU contraste (nunca a leitura em geral)', () => {
    let n = 0;
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo !== 'parMinimo') continue;
      expect(a.habilidade, c.id).not.toBe('leitura-cvcv');
      expect(HABILIDADE_POR_ID[a.habilidade], c.id).toBeDefined();
      for (const i of a.itens) {
        n++;
        expect(i.habilidade, `${c.id} ${i.alvo}/${i.outra}`).toBe(habilidadeDoPar(i.sons));
        expect(HABILIDADE_POR_ID[i.habilidade!], i.habilidade).toBeDefined();
      }
    }
    expect(n).toBeGreaterThan(10);
    expect(habilidadeDoPar(['m', 'b'])).toBe('par-minimo-m-b');
    expect(habilidadeDoPar(['a', 'e'])).toBe('par-minimo-vogal');
    expect(habilidadeDoPar(['d', 't'])).toBe('par-minimo-t-d');
  });

  it('sílaba nunca conta como domínio de letra ou de leitura (regra 6)', () => {
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'montar' && a.porSilaba) expect(a.habilidade, c.id).toBe('silaba');
      if (a?.tipo === 'escolher') for (const i of a.itens) if (i.formato === 'silaba-falta') expect(i.habilidade ?? a.habilidade, c.id).toBe('silaba');
    }
    // onde a fase precisa provar leitura, há versão por letra ou fonema
    const f04 = FASE_POR_ID['R2a-F04'];
    expect(f04.cenas.some((c) => c.atividade?.tipo === 'montar' && !c.atividade.porSilaba)).toBe(true);
    const f03 = FASE_POR_ID['R2a-F03'];
    expect(f03.cenas.some((c) => c.atividade?.tipo === 'escolher' && c.atividade.itens.some((i) => i.formato === 'fonema-falta'))).toBe(true);
  });

  it('o verificador cobre montar por sílaba e "qual sílaba/som falta"', () => {
    const textos = leiturasDaFase(FASE_POR_ID['R2a-F03']).map((l) => l.texto);
    expect(textos).toEqual(expect.arrayContaining(['FILA', 'FALA', 'FOFA']));
  });

  it('Trilha A–Z: vale só o som das letras já vistas na jornada (05 §6.5)', () => {
    // D031: na letra M só valem as vogais (TF-01…06) e o próprio M; o L ainda não foi visto
    const m = valoresVistosAte(FASE_POR_ID['AL-M']);
    expect([...m]).toEqual(expect.arrayContaining(['a', 'e', 'i', 'o', 'u', 'm']));
    expect(m.has('l')).toBe(false);
    expect(m.has('b')).toBe(false);
    expect(verificarPalavra('MALA', 99, BANCO, m).ok).toBe(false);
    // na letra B (depois de TF-17), o B e tudo o que veio antes
    const b = valoresVistosAte(FASE_POR_ID['AL-B']);
    expect([...b]).toEqual(expect.arrayContaining(['a', 'b', 'l', 'o', 't']));
    expect(b.has('d')).toBe(false);
    expect(verificarPalavra('BABÁ', 99, BANCO, b).ok).toBe(true);
    expect(verificarPalavra('DEDO', 99, BANCO, b).ok).toBe(false);
  });

  it('nenhuma instrução de montar soletra pelo nome da letra (regra 1)', () => {
    for (const f of FASES) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'montar') expect(a.enunciado.texto, c.id).not.toMatch(/\b[A-Z]-[A-Z]-[A-Z]\b/);
    }
  });
});
