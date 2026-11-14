import { describe, expect, it } from 'vitest';
import { CABELOS, CAMISAS, PASSOS_AVATAR, idCompraAvatar, pecaAvatar, pecasPara } from '@fonema/conteudo';
import {
  AVATAR_LIMPO, alternarAcessibilidade, comprarPeca, concluirFase, definirSexo, estadoPeca, generoDaFala, migrarAvatar, montagemCompleta,
  normalizarCrianca, passoPendente, progressoInicial, proximasPecas, renderFala, rotuloCadeado, vestir
} from '../src/index.ts';
import type { Crianca } from '../src/index.ts';

const base = (extra: Record<string, unknown> = {}): Crianca => ({
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2021,
  pronuncia: { grafia: 'Mariana', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { ...AVATAR_LIMPO },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: 1 },
  rotina: { minutosDia: 15, horaDormir: '20:00' }, criadoEm: 1,
  ...extra
} as Crianca);

describe('avatar montável: começa limpo e tem passos obrigatórios (D029)', () => {
  it('o boneco começa sem nada escolhido e sem acessórios', () => {
    expect(passoPendente(AVATAR_LIMPO)).toBe(0);
    expect(montagemCompleta(AVATAR_LIMPO)).toBe(false);
    expect(AVATAR_LIMPO.acessibilidade).toEqual([]);
    for (const p of PASSOS_AVATAR) expect(AVATAR_LIMPO[p.id]).toBeNull();
  });

  it('vestindo a primeira opção grátis de cada passo, a montagem fica completa', () => {
    for (const sexo of ['m', 'f'] as const) {
      let a = { ...AVATAR_LIMPO };
      const p = progressoInicial('c1', 0);
      PASSOS_AVATAR.forEach((passo, i) => {
        expect(passoPendente(a)).toBe(i);
        const peca = pecasPara(passo.id, sexo).find((x) => estadoPeca(x, p).estado === 'livre')!;
        a = vestir(a, passo.id, peca.id, sexo);
      });
      expect(montagemCompleta(a)).toBe(true);
    }
  });

  it('recusa vestir peça do outro sexo', () => {
    const cabeloMenino = CABELOS.find((c) => c.sexo === 'm')!;
    expect(() => vestir(AVATAR_LIMPO, 'cabelo', cabeloMenino.id, 'f')).toThrow();
    expect(() => vestir(AVATAR_LIMPO, 'cabelo', 'nao-existe', 'f')).toThrow();
  });

  it('acessibilidade liga e desliga, sempre grátis', () => {
    const a = alternarAcessibilidade(AVATAR_LIMPO, 'oculos');
    expect(a.acessibilidade).toEqual(['oculos']);
    expect(alternarAcessibilidade(a, 'oculos').acessibilidade).toEqual([]);
    expect(() => alternarAcessibilidade(a, 'coroa')).toThrow();
  });
});

describe('cadeados: fase E moedinhas', () => {
  const moletom = pecaAvatar('camisa', 'moletom-mata')!;
  const comMoedas = (p: ReturnType<typeof progressoInicial>, n: number) => ({ ...p, moedinhas: { saldo: n, total: n, porDia: {} } });
  const ateLetra = (letra: string) => {
    let p = progressoInicial('c1', 0);
    for (const l of 'ABCDE') { if (l === letra) break; p = concluirFase(p, `AL-${l}`, 1); }
    return p;
  };

  it('no começo, a peça mostra a fase e o preço, mesmo com moedas sobrando', () => {
    const p = comMoedas(progressoInicial('c1', 0), 99);
    const e = estadoPeca(moletom, p);
    expect(e.estado).toBe('fase');
    expect(rotuloCadeado(e)).toBe('Abre na Letra F · 12 moedas');
    expect(() => comprarPeca(p, moletom)).toThrow();
  });

  it('com a fase aberta e sem moedas: "faltam"; com moedas: pode trocar, desconta e passa a ser da criança', () => {
    const listrada = pecaAvatar('camisa', 'camiseta-listrada')!; // Letra C · 6
    const p = ateLetra('C');
    expect(estadoPeca(listrada, comMoedas(p, 2))).toEqual({ estado: 'faltam', preco: 6, faltam: 4 });
    expect(estadoPeca(listrada, comMoedas(p, 6)).estado).toBe('pode');
    const depois = comprarPeca(comMoedas(p, 10), listrada);
    expect(depois.moedinhas.saldo).toBe(4);
    expect(depois.itens).toContain(idCompraAvatar(listrada));
    expect(estadoPeca(listrada, depois).estado).toBe('tem');
    expect(() => comprarPeca(depois, listrada)).toThrow();
  });

  it('o uniforme da turma é livre desde o começo', () => {
    expect(estadoPeca(pecaAvatar('camisa', 'uniforme')!, progressoInicial('c1', 0)).estado).toBe('livre');
  });

  it('a vitrine da montagem mostra só peças do sexo da criança, com cadeado, na ordem em que abrem', () => {
    const p = progressoInicial('c1', 0);
    for (const sexo of ['m', 'f'] as const) {
      const v = proximasPecas(p, sexo, 6);
      expect(v.length).toBe(6);
      expect(v.every((x) => x.peca.sexo === 'ambos' || x.peca.sexo === sexo)).toBe(true);
      expect(v.every((x) => x.estado.estado === 'fase')).toBe(true);
      expect(v[0].peca.fase).toBe('AL-B');
    }
    expect(CAMISAS.some((c) => c.sexo === 'f')).toBe(true);
  });
});

describe('migração de cadastros antigos', () => {
  it('avatar de recorte vira avatar montado equivalente, com peças liberadas e do sexo certo', () => {
    const f = migrarAvatar({ base: 'crianca-02-trancas', cantinho: 'mata' }, 'f');
    expect(f).toMatchObject({ versao: 2, cantinho: 'mata', cabelo: 'f-trancas', camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco', pronto: true });
    const m = migrarAvatar({ base: 'crianca-b02-trancas', cantinho: 'ceu' }, 'm');
    expect(m.cabelo).toBe('m-trancinhas');
    expect(migrarAvatar({ base: 'crianca-b08-oculos-aparelho-cadeira', cantinho: 'ceu' }, 'f').acessibilidade).toEqual(['oculos', 'aparelho-auditivo', 'cadeira-de-rodas']);
    for (const b of ['01-crespo-curto', '02-trancas', '03-coque', '04-ruiva-ondulada', '05-chanel-liso', '06-liso-longo-pintura', '07-black-power-alto', '08-oculos-aparelho', '09-cadeira-de-rodas']) {
      for (const sexo of ['m', 'f'] as const) {
        const a = migrarAvatar({ base: `crianca-${b}`, cantinho: 'ceu' }, sexo);
        expect(montagemCompleta(a), `${b}/${sexo}`).toBe(true);
        expect(pecasPara('cabelo', sexo).map((c) => c.id)).toContain(a.cabelo);
      }
    }
    expect(migrarAvatar({ base: 'desconhecido', cantinho: 'ipe' }, 'f')).toMatchObject({ pele: null, cantinho: 'ipe', pronto: false });
  });

  it('criança salva como "prefiro não informar" fica com o sexo pendente e a fala neutra, sem quebrar', () => {
    const antiga = base({ genero: 'n', avatar: { base: 'crianca-07-black-power-alto', cantinho: 'ceu' } });
    const c = normalizarCrianca(antiga);
    expect(c.generoPendente).toBe(true);
    expect(['m', 'f']).toContain(c.genero);
    expect(c.avatar.versao).toBe(2);
    expect(c.avatar.cabelo).toBeNull();
    expect(c.avatar.pronto).toBe(false);
    expect(generoDaFala(c)).toBe('n');
    expect(renderFala('{Você está pronto|Você está pronta|Tudo pronto}, [NOME]?', { nome: c.nome, genero: generoDaFala(c) })).toBe('Tudo pronto, Mariana?');

    const menino = definirSexo(c, 'm');
    expect(menino.generoPendente).toBeUndefined();
    expect(menino.genero).toBe('m');
    expect(menino.avatar.cabelo).toBe('m-black-power');
    expect(menino.avatar.baseAntiga).toBeUndefined();
    expect(generoDaFala(menino)).toBe('m');
    // escolhido uma vez, não pede de novo
    expect(normalizarCrianca(menino)).toBe(menino);
  });

  it('criança com sexo definido e avatar de recorte migra direto; registro novo volta igual', () => {
    const c = normalizarCrianca(base({ genero: 'f', avatar: { base: 'crianca-03-coque', cantinho: 'ipe' } }));
    expect(c.generoPendente).toBeUndefined();
    expect(c.avatar).toMatchObject({ cabelo: 'f-coque', pronto: true });
    const nova = base();
    expect(normalizarCrianca(nova)).toBe(nova);
  });

  it('ao trocar de sexo, roupa e cabelo do outro sexo saem do boneco', () => {
    const menina = base({ avatar: { ...AVATAR_LIMPO, pele: 'pele-03', rosto: 'oval', olhos: 'mel', cabelo: 'f-coque', camisa: 'uniforme', calca: 'saia-marinho', calcado: 'tenis-branco', pronto: true }, generoPendente: true });
    const c = definirSexo(menina, 'm');
    expect(c.avatar.cabelo).toBeNull();
    expect(c.avatar.calca).toBeNull();
    expect(c.avatar.camisa).toBe('uniforme');
    expect(c.avatar.pronto).toBe(false);
  });
});
