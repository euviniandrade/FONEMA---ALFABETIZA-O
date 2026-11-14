import { describe, expect, it } from 'vitest';
import { FASES } from '@fonema/conteudo';
import { aplicarNivelInicial, concluirFase, faseInicial, fasesConcluidas, fasesLiberadas, podeEntrar, progressoInicial } from '../src/index.ts';

const T0 = new Date('2026-11-13T15:00:00').getTime();
const ALFABETO = FASES.filter((f) => f.regiao === 'AL').map((f) => f.id);

describe('nível inicial escolhido pelo adulto (D026, com a jornada da D027)', () => {
  it('do zero é o padrão: começa na letra A e nada é liberado', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'zero', T0);
    expect(faseInicial('zero')).toBe('AL-A');
    expect(p.faseAtual).toBe('AL-A');
    expect(fasesLiberadas(p)).toEqual([]);
    expect(podeEntrar(p, 'AL-B')).toBe(false);
  });

  it('"já conhece as letras e os sons": pula o Alfabeto (liberado para revisar) e começa em Sílabas', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'letras-e-sons', T0);
    expect(p.faseAtual).toBe('R2a-F01');
    expect(p.nivelInicial).toBe('letras-e-sons');
    // tudo antes fica aberto para visitar e revisar: o alfabeto inteiro e os outros sons das vogais
    expect(fasesLiberadas(p)).toEqual(FASES.slice(0, FASES.findIndex((f) => f.id === 'R2a-F01')).map((f) => f.id));
    for (const id of ALFABETO) { expect(fasesLiberadas(p)).toContain(id); expect(podeEntrar(p, id)).toBe(true); }
    expect(podeEntrar(p, 'R1-F07')).toBe(true);
    // liberada não é concluída: nada de selo, termômetro ou título de graça
    expect(fasesConcluidas(p).size).toBe(0);
    expect(Object.keys(p.conquistas)).toHaveLength(0);
    expect(p.termometro).toBe(0);
    // dali em diante continua uma fase por vez
    expect(podeEntrar(p, 'R2a-F02')).toBe(false);
  });

  it('"já lê palavras": começa no ponto de leitura mais avançado; depois vêm o chefe e "Meu nome"', () => {
    const p = aplicarNivelInicial(progressoInicial('c1', T0), 'le-palavras', T0);
    expect(p.faseAtual).toBe('R2a-F04');
    expect(podeEntrar(p, 'R2a-F05')).toBe(false);
    let q = concluirFase(p, 'R2a-F04', T0);
    expect(q.faseAtual).toBe('R2a-F05');
    expect(podeEntrar(q, 'R2a-F05')).toBe(true);
    q = concluirFase(q, 'R2a-F05', T0);
    expect(q.faseAtual).toBe('R0-F01');
  });

  it('revisar uma letra liberada não trava nem faz a jornada voltar', () => {
    let p = aplicarNivelInicial(progressoInicial('c1', T0), 'letras-e-sons', T0);
    p = concluirFase(p, 'AL-M', T0); // revisão voluntária de uma letra liberada
    expect(p.fases['AL-M'].estado).toBe('concluida');
    expect(p.fases['AL-M'].liberada).toBe(false);
    expect(p.faseAtual).toBe('R2a-F01');
    p = concluirFase(p, 'R2a-F01', T0);
    expect(p.faseAtual).toBe('R2a-F02');
    expect(() => concluirFase(p, 'R2a-F04', T0)).toThrow();
  });

  it('mudar o nível depois não apaga o que já foi feito', () => {
    let p = progressoInicial('c1', T0);
    p = concluirFase(p, 'AL-A', T0);
    p = { ...p, moedinhas: { saldo: 7, total: 7, porDia: {} } };
    p = aplicarNivelInicial(p, 'le-palavras', T0);
    expect(p.fases['AL-A'].estado).toBe('concluida');
    expect(p.moedinhas.saldo).toBe(7);
    expect(p.faseAtual).toBe('R2a-F04');
    // voltar para "do zero" retoma na primeira letra ainda não feita e fecha o que estava adiante
    p = aplicarNivelInicial(p, 'zero', T0);
    expect(p.faseAtual).toBe('AL-B');
    expect(fasesLiberadas(p)).toEqual([]);
    expect(podeEntrar(p, 'R2a-F04')).toBe(false);
    expect(p.fases['AL-A'].estado).toBe('concluida');
  });
});
