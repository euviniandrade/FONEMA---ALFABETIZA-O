import { describe, expect, it } from 'vitest';
import { nomeSoChamamento, semNome } from '../src/index.ts';

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

describe('nome como chamamento × nome como conteúdo', () => {
  it('chamamento pode ser cortado', () => {
    expect(nomeSoChamamento('Agora é a sua vez, [NOME]!')).toBe(true);
    expect(nomeSoChamamento('[NOME], olha a placa!')).toBe(true);
    expect(nomeSoChamamento('Isso, [NOME]! Você escutou com atenção.')).toBe(true);
  });
  it('nome como conteúdo é sempre dito', () => {
    expect(nomeSoChamamento('[NOME]!')).toBe(false);
    expect(nomeSoChamamento('[NOME]')).toBe(false);
    expect(nomeSoChamamento('[NOME] começa com este som. Olha a minha boca.')).toBe(false);
    expect(nomeSoChamamento('Escuta bem.')).toBe(false);
  });
});
