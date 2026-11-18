import { describe, expect, it } from 'vitest';
import { CABELOS, CAMISAS, FASES, idCompraAvatar, pecaAvatar, pecasPara } from '@fonema/conteudo';
import {
  AVATAR_PADRAO, alternarAcessibilidade, comprarPeca, concluirFase, definirSexo, estadoPeca, generoDaFala, migrarAvatar,
  normalizarCrianca, pecaEmUso, progressoInicial, proximasPecas, renderFala, rotuloCadeado, vestir
} from '../src/index.ts';
import type { Crianca } from '../src/index.ts';

const base = (extra: Record<string, unknown> = {}): Crianca => ({
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2021,
  pronuncia: { grafia: 'Mariana', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { ...AVATAR_PADRAO },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: 1,
  ...extra
} as Crianca);

describe('avatar 3D: começa no padrão completo e a criança personaliza (D029 §7)', () => {
  it('o boneco começa sem nada mudado (tudo como o modelo já vem) e sem acessórios', () => {
    for (const k of ['pele', 'olhos', 'corCabelo', 'cabelo', 'camisa', 'calca', 'calcado'] as const) expect(AVATAR_PADRAO[k]).toBeNull();
    expect(AVATAR_PADRAO.acessibilidade).toEqual([]);
    expect(pecaEmUso(AVATAR_PADRAO, 'camisa', 'f')?.id).toBe('branca');
    expect(pecaEmUso(AVATAR_PADRAO, 'cabelo', 'm')?.id).toBe('m-padrao');
    expect(pecaEmUso(AVATAR_PADRAO, 'pele', 'f')).toBeUndefined();
  });

  it('muda uma cor de cada vez; escolher a cor do padrão volta ao original', () => {
    let a = vestir(AVATAR_PADRAO, 'pele', 'pele-08', 'f');
    a = vestir(a, 'camisa', 'ipe', 'f');
    expect(a).toMatchObject({ pele: 'pele-08', camisa: 'ipe', calca: null });
    expect(vestir(a, 'camisa', 'branca', 'f').camisa).toBeNull();
    expect(pecaEmUso(a, 'camisa', 'f')?.id).toBe('ipe');
  });

  it('recusa cabelo do outro sexo, peça desconhecida e item que ainda não cabe no modelo', () => {
    const cabeloMenino = CABELOS.find((c) => c.sexo === 'm')!;
    expect(() => vestir(AVATAR_PADRAO, 'cabelo', cabeloMenino.id, 'f')).toThrow();
    expect(() => vestir(AVATAR_PADRAO, 'camisa', 'nao-existe', 'f')).toThrow();
    expect(() => alternarAcessibilidade(AVATAR_PADRAO, 'cadeira-de-rodas')).toThrow();
  });

  it('acessibilidade liga e desliga, sempre grátis', () => {
    const a = alternarAcessibilidade(AVATAR_PADRAO, 'oculos');
    expect(a.acessibilidade).toEqual(['oculos']);
    expect(alternarAcessibilidade(a, 'oculos').acessibilidade).toEqual([]);
    expect(() => alternarAcessibilidade(a, 'coroa')).toThrow();
  });
});

describe('cadeados: fase E moedinhas', () => {
  const madeira = pecaAvatar('camisa', 'madeira')!; // Letra F · 10
  const comMoedas = (p: ReturnType<typeof progressoInicial>, n: number) => ({ ...p, moedinhas: { saldo: n, total: n, porDia: {} } });
  const ateLetra = (letra: string) => {
    let p = progressoInicial('c1', 0);
    // D031: a jornada alterna letras e lições; conclui tudo o que vem antes da letra
    for (const f of FASES) { if (f.id === `AL-${letra}`) break; p = concluirFase(p, f.id, 1); }
    return p;
  };

  it('no começo, a cor especial mostra a fase e o preço, mesmo com moedas sobrando', () => {
    const p = comMoedas(progressoInicial('c1', 0), 99);
    const e = estadoPeca(madeira, p);
    expect(e.estado).toBe('fase');
    // D034: a camiseta cor de madeira abre com a fase AL-U (8 missões depois da primeira); o cadeado diz quantas faltam
    expect(rotuloCadeado(e)).toBe('Abre em 8 missões · 10 moedas');
    expect(rotuloCadeado({ ...e, faltamMissoes: 1 } as typeof e)).toBe('Abre na próxima missão · 10 moedas');
    expect(() => comprarPeca(p, madeira)).toThrow();
  });

  it('com a fase aberta e sem moedas: "faltam"; com moedas: pode trocar, desconta e passa a ser da criança', () => {
    const terra = pecaAvatar('camisa', 'terra')!; // D034: abre com a fase AL-I · 6
    const p = ateLetra('C');
    expect(estadoPeca(terra, comMoedas(p, 2))).toEqual({ estado: 'faltam', preco: 6, faltam: 4 });
    expect(estadoPeca(terra, comMoedas(p, 6)).estado).toBe('pode');
    const depois = comprarPeca(comMoedas(p, 10), terra);
    expect(depois.moedinhas.saldo).toBe(4);
    expect(depois.itens).toContain(idCompraAvatar(terra));
    expect(estadoPeca(terra, depois).estado).toBe('tem');
    expect(() => comprarPeca(depois, terra)).toThrow();
  });

  it('as cores do começo são livres', () => {
    const p = progressoInicial('c1', 0);
    for (const id of ['branca', 'ceu', 'ipe']) expect(estadoPeca(pecaAvatar('camisa', id)!, p).estado).toBe('livre');
  });

  it('a vitrine mostra só o que tem cadeado, na ordem em que abre, e pula cabelo sem modelo 3D', () => {
    const p = progressoInicial('c1', 0);
    for (const sexo of ['m', 'f'] as const) {
      const v = proximasPecas(p, sexo, 6, (peca) => peca.categoria !== 'cabelo');
      expect(v.length).toBe(6);
      expect(v.every((x) => x.estado.estado === 'fase' && x.peca.categoria !== 'cabelo')).toBe(true);
      expect(v[0].peca.fase).toBe('TF-01'); // D034: a primeira peça especial abre já na 2ª missão da jornada
    }
    expect(proximasPecas(p, 'f', 20).some((x) => x.peca.id === 'f-coque')).toBe(true);
    expect(CAMISAS.some((c) => c.fase)).toBe(true);
  });
});

describe('migração de cadastros antigos', () => {
  it('avatar de recorte vira avatar 3D equivalente: tom de pele, cor e tipo de cabelo, acessibilidade', () => {
    const f = migrarAvatar({ base: 'crianca-02-trancas', cantinho: 'mata' }, 'f');
    expect(f).toMatchObject({ versao: 3, cantinho: 'mata', pele: 'pele-08', corCabelo: 'preto', cabelo: 'f-trancas', camisa: null, pronto: true });
    expect(migrarAvatar({ base: 'crianca-b02-trancas', cantinho: 'ceu' }, 'm').cabelo).toBe('m-crespo');
    expect(migrarAvatar({ base: 'crianca-04-ruiva-ondulada', cantinho: 'ceu' }, 'f')).toMatchObject({ cabelo: null, corCabelo: 'ruivo', olhos: 'verde' });
    expect(migrarAvatar({ base: 'crianca-b08-oculos-aparelho-cadeira', cantinho: 'ceu' }, 'f').acessibilidade).toEqual(['oculos', 'aparelho-auditivo', 'cadeira-de-rodas']);
    for (const b of ['01-crespo-curto', '02-trancas', '03-coque', '04-ruiva-ondulada', '05-chanel-liso', '06-liso-longo-pintura', '07-black-power-alto', '08-oculos-aparelho', '09-cadeira-de-rodas']) {
      for (const sexo of ['m', 'f'] as const) {
        const a = migrarAvatar({ base: `crianca-${b}`, cantinho: 'ceu' }, sexo);
        expect(a.pele, `${b}/${sexo}`).toMatch(/^pele-/);
        if (a.cabelo) expect(pecasPara('cabelo', sexo).map((c) => c.id)).toContain(a.cabelo);
      }
    }
    expect(migrarAvatar({ base: 'desconhecido', cantinho: 'ipe' }, 'f')).toMatchObject({ pele: null, cantinho: 'ipe', pronto: false });
  });

  it('avatar "de peças" (versão 2) guarda as cores que ainda existem e o resto volta ao padrão', () => {
    const v2 = base({ avatar: { versao: 2, cantinho: 'mata', pele: 'pele-06', rosto: 'oval', olhos: 'mel', cabelo: 'f-rabo-de-cavalo', corCabelo: 'ruivo', camisa: 'uniforme', calca: 'saia-marinho', calcado: 'tenis-branco', acessibilidade: ['oculos', 'cadeira-de-rodas'], pronto: true } });
    const c = normalizarCrianca(v2);
    expect(c.avatar).toEqual({ versao: 3, cantinho: 'mata', pele: 'pele-06', olhos: 'mel', corCabelo: 'ruivo', cabelo: null, camisa: null, calca: null, calcado: null, acessibilidade: ['oculos', 'cadeira-de-rodas'], pronto: true });
    expect(normalizarCrianca(c)).toBe(c);
  });

  it('criança salva como "prefiro não informar" fica com o sexo pendente e a fala neutra, sem quebrar', () => {
    const antiga = base({ genero: 'n', avatar: { base: 'crianca-07-black-power-alto', cantinho: 'ceu' } });
    const c = normalizarCrianca(antiga);
    expect(c.generoPendente).toBe(true);
    expect(['m', 'f']).toContain(c.genero);
    expect(c.avatar).toMatchObject({ versao: 3, pele: 'pele-09', cabelo: null, pronto: false });
    expect(generoDaFala(c)).toBe('n');
    expect(renderFala('{Você está pronto|Você está pronta|Tudo pronto}, [NOME]?', { nome: c.nome, genero: generoDaFala(c) })).toBe('Tudo pronto, Mariana?');

    const menino = definirSexo(c, 'm');
    expect(menino.generoPendente).toBeUndefined();
    expect(menino.genero).toBe('m');
    expect(menino.avatar.cabelo).toBe('m-crespo');
    expect(menino.avatar.baseAntiga).toBeUndefined();
    expect(generoDaFala(menino)).toBe('m');
    // escolhido uma vez, não pede de novo
    expect(normalizarCrianca(menino)).toBe(menino);
  });

  it('criança com sexo definido e avatar de recorte migra direto; registro novo volta igual', () => {
    const c = normalizarCrianca(base({ genero: 'f', avatar: { base: 'crianca-06-liso-longo-pintura', cantinho: 'ipe' } }));
    expect(c.generoPendente).toBeUndefined();
    expect(c.avatar).toMatchObject({ pele: 'pele-05', acessibilidade: ['pintura-no-rosto'], pronto: true });
    const nova = base();
    expect(normalizarCrianca(nova)).toBe(nova);
  });

  it('ao escolher o sexo, o cabelo do outro sexo sai do boneco e as cores ficam', () => {
    const menina = base({ avatar: { ...AVATAR_PADRAO, pele: 'pele-03', cabelo: 'f-coque', camisa: 'ipe' }, generoPendente: true });
    const c = definirSexo(menina, 'm');
    expect(c.avatar).toMatchObject({ cabelo: null, pele: 'pele-03', camisa: 'ipe' });
  });
});
