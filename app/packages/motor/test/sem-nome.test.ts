import { describe, expect, it } from 'vitest';
import { semNome } from '../src/index.ts';

describe('fala sem o nome da criança (fila nº 27, item 2)', () => {
  it('tira o nome do fim da frase sem deixar vírgula pendurada', () => {
    expect(semNome('Agora é a sua vez, [NOME]!')).toBe('Agora é a sua vez!');
    expect(semNome('Vamos fazer juntos, [NOME]?')).toBe('Vamos fazer juntos?');
    expect(semNome('Oi, [NOME]!')).toBe('Oi!');
    expect(semNome('Isso, [NOME]! Você escutou com atenção.')).toBe('Isso! Você escutou com atenção.');
    expect(semNome('Qual som começa a palavra, [NOME]?')).toBe('Qual som começa a palavra?');
  });
  it('tira o nome do começo e do meio', () => {
    expect(semNome('[NOME], olha a placa!')).toBe('Olha a placa!');
    expect(semNome('Você, [NOME], consegue!')).toBe('Você consegue!');
    expect(semNome('Valeu, [NOME]')).toBe('Valeu');
  });
  it('fala sem nome não muda', () => {
    expect(semNome('Escuta bem.')).toBe('Escuta bem.');
  });
});
