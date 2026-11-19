import { beforeAll, describe, expect, it } from 'vitest';
import { ControleNome, JANELA_DO_NOME_MS } from './nome-falado.ts';
import { ProvedorPreGerado, ProvedorSilencioso } from './voz.ts';

describe('nome da criança no máximo uma vez por atividade (fila nº 27, item 2)', () => {
  it('diz o nome uma vez no começo; depois, a atividade inteira sem chamar', () => {
    let agora = 1000;
    const c = new ControleNome(() => agora);
    expect(c.podeDizer()).toBe(true);
    c.disse();
    agora += 2000;
    expect(c.podeDizer()).toBe(false);
    agora += 60_000;
    expect(c.podeDizer()).toBe(false);
  });
  it('atividade nova libera o nome de novo (uma vez)', () => {
    let agora = 0;
    const c = new ControleNome(() => agora);
    c.disse();
    agora = 5000;
    c.novaAtividade();
    expect(c.podeDizer()).toBe(true);
  });
  it('o nome é só do começo: passada a janela, não é dito nem se ainda não foi', () => {
    let agora = 0;
    const c = new ControleNome(() => agora);
    agora = JANELA_DO_NOME_MS + 1;
    expect(c.podeDizer()).toBe(false);
  });
});

describe('plano da voz com e sem o nome', () => {
  const pre = new ProvedorPreGerado(new ProvedorSilencioso());
  // manifesto mínimo: trechos de "Agora é a sua vez, [NOME]!" e de "Isso, [NOME]! Você conseguiu.", e a variante sem nome da 1ª
  beforeAll(async () => {
    await pre.pronto; // o construtor tenta ler os manifestos de verdade (aqui não há): só depois entra o manifesto de teste
    Object.assign(pre as unknown as Record<string, unknown>, {
    falas: { 'sofia|Agora é a sua vez,': 'a.mp3', 'sofia|Agora é a sua vez!': 'a-sem.mp3', 'sofia|Isso,': 'i.mp3', 'sofia|Você conseguiu.': 'v.mp3' },
    nomes: { sofia: ['mariana'], tales: ['mariana'] }
    });
    pre.nome = 'Mariana';
  });
  const arqs = (t: string, com: boolean) => pre.plano(t, 'sofia', com)?.map((p) => p.arquivo.replace('./audio/', ''));

  it('com o nome: trecho + clipe do nome', () => {
    expect(arqs('Agora é a sua vez, Mariana!', true)).toEqual(['falas/a.mp3', 'nomes/sofia/mariana.mp3']);
  });
  it('sem o nome: usa a variante gravada sem o nome, se existir', () => {
    expect(arqs('Agora é a sua vez, Mariana!', false)).toEqual(['falas/a-sem.mp3']);
  });
  it('sem variante gravada: os mesmos trechos, sem o clipe do nome', () => {
    expect(arqs('Isso, Mariana! Você conseguiu.', false)).toEqual(['falas/i.mp3', 'falas/v.mp3']);
  });
  it('o nome como conteúdo da fala é sempre dito (nunca vira silêncio)', () => {
    expect(arqs('Mariana!', false)).toEqual(['nomes/sofia/mariana.mp3']);
    expect(arqs('Mariana', false)).toEqual(['nomes/sofia/mariana.mp3']);
    expect(arqs('Mariana Você conseguiu.', false)).toEqual(['nomes/sofia/mariana.mp3', 'falas/v.mp3']);
  });
  it('fala sem nome não muda', () => {
    expect(arqs('Você conseguiu.', false)).toEqual(['falas/v.mp3']);
  });
});
