import { describe, expect, it } from 'vitest';
import { FASES } from '@fonema/conteudo';
import { aplicarNivelInicial, concluirFase, faseInicial, fasesConcluidas, fasesLiberadas, podeEntrar, progressoInicial } from '../src/index.ts';

const T0 = new Date('2026-11-13T15:00:00').getTime();

describe('nível inicial escolhido pelo adulto (D026)', () => {
  it('do zero é o padrão: começa em R0-F01 e nada é liberado', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'zero', T0);
    expect(faseInicial('zero')).toBe('R0-F01');
    expect(p.faseAtual).toBe('R0-F01');
    expect(fasesLiberadas(p)).toEqual([]);
    expect(podeEntrar(p, 'R0-F02')).toBe(false);
  });

  it('"já conhece as letras e os sons" libera sons e letras e começa em juntar sons e sílabas', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'letras-e-sons', T0);
    expect(p.faseAtual).toBe('R2a-F01');
    expect(p.nivelInicial).toBe('letras-e-sons');
    // fases anteriores: abertas para revisar, mas NÃO concluídas nem dominadas
    expect(fasesLiberadas(p)).toEqual(FASES.slice(0, FASES.findIndex((f) => f.id === 'R2a-F01')).map((f) => f.id));
    expect(podeEntrar(p, 'R0-F03')).toBe(true);
    expect(podeEntrar(p, 'R1-F07')).toBe(true);
    expect(fasesConcluidas(p).size).toBe(0);
    expect(p.termometro).toBe(0);
    expect(Object.keys(p.habilidades)).toEqual([]);
    expect(Object.keys(p.conquistas)).toEqual([]);
    // adiante continua sequencial
    expect(podeEntrar(p, 'R2a-F02')).toBe(false);
  });

  it('"já lê palavras" começa na fase mais avançada que ainda ensina; o chefe vem depois', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'le-palavras', T0);
    expect(p.faseAtual).toBe('R2a-F04');
    expect(podeEntrar(p, 'R2a-F05')).toBe(false);
    const q = concluirFase(p, 'R2a-F04', T0);
    expect(q.faseAtual).toBe('R2a-F05');
    expect(podeEntrar(q, 'R2a-F05')).toBe(true);
  });

  it('dentro do nível a progressão é sequencial, e revisar uma fase liberada não faz a jornada voltar', () => {
    let p = aplicarNivelInicial(progressoInicial('c1', T0), 'letras-e-sons', T0);
    p = concluirFase(p, 'R0-F02', T0); // revisão voluntária de uma fase liberada
    expect(p.fases['R0-F02'].estado).toBe('concluida');
    expect(p.fases['R0-F02'].liberada).toBe(false);
    expect(p.faseAtual).toBe('R2a-F01');
    p = concluirFase(p, 'R2a-F01', T0);
    expect(p.faseAtual).toBe('R2a-F02');
    expect(() => concluirFase(p, 'R2a-F04', T0)).toThrow();
  });

  it('o adulto pode mudar o nível depois sem apagar o que a criança já fez', () => {
    let p = progressoInicial('c1', T0);
    p = concluirFase(p, 'R0-F01', T0);
    p = { ...p, moedinhas: { ...p.moedinhas, saldo: 7 } };
    p = aplicarNivelInicial(p, 'le-palavras', T0);
    expect(p.fases['R0-F01'].estado).toBe('concluida');
    expect(p.moedinhas.saldo).toBe(7);
    expect(p.faseAtual).toBe('R2a-F04');
    // de volta ao zero: retoma na primeira fase ainda não feita e fecha de novo o que estava adiante
    p = aplicarNivelInicial(p, 'zero', T0);
    expect(p.faseAtual).toBe('R0-F02');
    expect(fasesLiberadas(p)).toEqual([]);
    expect(podeEntrar(p, 'R2a-F04')).toBe(false);
    expect(p.fases['R0-F01'].estado).toBe('concluida');
  });
});
