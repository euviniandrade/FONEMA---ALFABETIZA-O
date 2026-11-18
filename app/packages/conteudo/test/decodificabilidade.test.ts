import { describe, expect, it } from 'vitest';
import {
  BANCO, FASES, FASES_TF, FIGURAS, LICOES_TF, UNIDADES_TF, analisar, comSons, grafemas, montarBanco, unidadeQueLibera, valoresDaEntrada,
  verificarFrase, verificarPalavra, verificarPseudo, verificarTexto, type EntradaBanco
} from '../src/index.ts';
import { leiturasDaFase, relatorioDaFase, unidadeDaFase, verificarFase } from '../src/fases/verificar-fases.ts';

/** D030 etapa 7 · VERIFICADOR DE DECODIFICABILIDADE (docs/pedagogia/05 §6): roda em todas as fases e falha o build. */
describe('verificador de decodificabilidade', () => {
  it('o banco: toda anotação bate com as letras e nenhuma palavra fica sem anotação', () => {
    for (const e of Object.values(BANCO)) expect(analisar(e).erros, e.texto).toEqual([]);
    // a anotação que não bate é acusada
    expect(analisar({ texto: 'pato', sons: 'p a t a' }).erros.length).toBeGreaterThan(0);
    expect(analisar({ texto: 'pato', sons: 'p a t' }).erros.length).toBeGreaterThan(0);
    expect(() => montarBanco([{ texto: 'pato', sons: 'p a t u' }, { texto: 'pato', sons: 'p a t o' }])).toThrow();
    expect(verificarPalavra('xyzw', 30, BANCO).erros[0]).toMatch(/não está no banco/);
  });

  it('divide em grafemas: dígrafos, vogal nasal, letras', () => {
    expect(grafemas('chuva').map((g) => g.g)).toEqual(['ch', 'u', 'v', 'a']);
    expect(grafemas('campo').map((g) => g.g)).toEqual(['c', 'am', 'p', 'o']);
    expect(grafemas('cama').map((g) => g.g)).toEqual(['c', 'a', 'm', 'a']);
    expect(grafemas('queijo').map((g) => g.g)).toEqual(['qu', 'e', 'i', 'j', 'o']);
    expect(grafemas('unha').map((g) => g.g)).toEqual(['u', 'nh', 'a']);
  });

  /** 05 §6.7: ao menos um exemplo de cada armadilha A1–A20, que falha antes da unidade e passa depois dela. */
  const CASOS: [string, EntradaBanco, number][] = [
    ['A1', { texto: 'gato', sons: 'g a t u' }, 21], ['A1', { texto: 'ovo', sons: 'o v u' }, 12], ['A2', { texto: 'nave', sons: 'n a v i' }, 13],
    ['A3', { texto: 'pé', sons: 'p ɛ' }, 23], ['A4', { texto: 'bola', sons: 'b ɔ l a' }, 24], ['A4', { texto: 'vovô', sons: 'v o v o' }, 24],
    ['A6', { texto: 'anta', sons: 'ã t a' }, 25], ['A6', { texto: 'tempo', sons: 't ẽ p u' }, 30], ['A7', { texto: 'pão', sons: 'p ã u' }, 30],
    ['A8', { texto: 'tia', sons: 'tʃ i a' }, 22], ['A8', { texto: 'leite', sons: 'l e i tʃ i' }, 22], ['A9', { texto: 'casa', sons: 'k a z a' }, 47],
    ['A10', { texto: 'pasta', sons: 'p a s t a' }, 50], ['A11', { texto: 'gelo', sons: 'ʒ e l u' }, 44], ['A11', { texto: 'cedo', sons: 's e d u' }, 45],
    ['A12', { texto: 'queijo', sons: 'k e i ʒ u' }, 40], ['A12', { texto: 'guia', sons: 'g i a' }, 42], ['A12', { texto: 'quati', sons: 'k u a tʃ i', oxitona: true }, 41],
    ['A13', { texto: 'rato', sons: 'R a t u' }, 31], ['A13', { texto: 'cara', sons: 'k a ɾ a' }, 32], ['A13', { texto: 'porta', sons: 'p ɔ R t a' }, 33], ['A13', { texto: 'carro', sons: 'k a R u' }, 34],
    ['A14', { texto: 'sol', sons: 's ɔ u' }, 49], ['A15', { texto: 'hora', sons: 'ɔ ɾ a' }, 35], ['A15', { texto: 'chuva', sons: 'ʃ u v a' }, 38], ['A15', { texto: 'olho', sons: 'o ʎ u' }, 36],
    ['A16', { texto: 'xale', sons: 'ʃ a l i' }, 39], ['A16', { texto: 'táxi', sons: 't a k s i' }, 51], ['A17', { texto: 'pai', sons: 'p a i' }, 16], ['A17', { texto: 'ouvi', sons: 'o u v i', oxitona: true }, 24],
    ['A18', { texto: 'prato', sons: 'p ɾ a t u' }, 52], ['A18', { texto: 'flor', sons: 'f l ɔ R' }, 53], ['A20', { texto: 'sofá', sons: 's o f a' }, 23], ['A20', { texto: 'bebê', sons: 'b e b e' }, 24]
  ];
  it.each(CASOS)('armadilha %s: "%o" falha antes da unidade que a libera e passa nela', (_a, e, unidade) => {
    const banco = montarBanco([e]);
    expect(verificarPalavra(e.texto, unidade - 1, banco).ok, `${e.texto} antes de TF-${unidade}`).toBe(false);
    expect(verificarPalavra(e.texto, unidade, banco).ok, `${e.texto} em TF-${unidade}`).toBe(true);
    expect(unidadeQueLibera(e.texto, banco)).toBe(unidade);
  });

  it('erro × aviso: A5 (cama), A19 e pronúncia regional só avisam; a sílaba forte fora da penúltima sem acento é erro', () => {
    const banco = montarBanco([{ texto: 'cama', sons: 'k a m a' }, { texto: 'ema', sons: 'e m a' }, { texto: 'sabia', sons: 's a b i a' }, { texto: 'tia', sons: 'tʃ i a' }, { texto: 'cafe', sons: 'k a f e', oxitona: true }]);
    const cama = verificarPalavra('cama', 19, banco);
    expect(cama.ok).toBe(true);
    expect(cama.avisos.join()).toMatch(/A5/);
    expect(verificarPalavra('ema', 7, banco).avisos.length).toBe(1);
    expect(verificarPalavra('sabia', 18, banco).ok).toBe(true);
    expect(verificarPalavra('tia', 22, banco).avisos.join()).toMatch(/região/);
    expect(verificarPalavra('cafe', 22, banco).ok).toBe(false); // "café" sem acento: a regra da sílaba forte é de TF-23
    expect(valoresDaEntrada({ texto: 'tatu', sons: 't a t u', oxitona: true }).valores).not.toContain('acento-tonico');
  });

  it('frases e textos: palavras decodificáveis + no máximo 1 palavra frequente liberada', () => {
    expect(verificarFrase('O pato pula.', 17, BANCO).ok).toBe(true);
    expect(verificarFrase('O pato pula.', 16, BANCO).ok).toBe(false); // o T só em TF-17
    expect(verificarFrase('A lula viu a lua.', 10, BANCO).ok).toBe(true);
    expect(verificarFrase('O ovo é fofo.', 12, BANCO)).toMatchObject({ ok: true, frequentes: ['é'] });
    expect(verificarFrase('O ovo é fofo.', 11, BANCO).ok).toBe(false);
    expect(verificarFrase('É um ovo.', 13, BANCO).ok).toBe(false); // duas palavras frequentes numa frase
    expect(verificarTexto('O pato pula. O gato viu o galo. A tia viu o tomate.', 22, BANCO)).toMatchObject({ ok: true, porcentagem: 1 });
    expect(verificarTexto('O pato pula. O gato viu o galo.', 20, BANCO).ok).toBe(false);
  });

  it('palavras inventadas: só valores ensinados, sílabas do português, nem palavra real nem palavra feia', () => {
    const reais = new Set(Object.values(BANCO).filter((e) => !e.pseudo).map((e) => e.texto));
    expect(verificarPseudo('lifa', 10, BANCO, reais).ok).toBe(true);
    expect(verificarPseudo('lifa', 9, BANCO, reais).ok).toBe(false);
    expect(verificarPseudo('mala', 10, BANCO, reais).ok).toBe(false);
    const banco = montarBanco([{ texto: 'pute', sons: 'p u tʃ i', pseudo: true }, { texto: 'cufo', sons: 'k u f u', pseudo: true }]);
    expect(verificarPseudo('cufo', 22, banco, reais).erros.join()).toMatch(/feia/);
  });

  it('TRILHA DOS SONS: cada fase só lê e escreve o que já foi ensinado ATÉ a unidade dela (erro = build falha)', () => {
    let palavras = 0;
    for (const f of FASES_TF) {
      for (const i of verificarFase(f)) {
        palavras++;
        expect(i.resultado.erros, `${i.cena}: "${i.texto}"`).toEqual([]);
      }
    }
    expect(palavras).toBeGreaterThan(150);
    // toda unidade de LEITURA tem palavras inventadas com resposta conferida (escolha entre leituras, nunca "Eu falei!")
    for (const f of FASES_TF) {
      const le = leiturasDaFase(f).some((l) => l.tipo === 'palavra');
      if (!le || f.id === 'TF-06') continue;
      expect(leiturasDaFase(f).filter((l) => l.tipo === 'pseudo').length, `${f.id} sem palavra inventada`).toBeGreaterThanOrEqual(2);
      const pseudoConferida = f.cenas.some((c) => c.atividade?.tipo === 'escolher' && c.atividade.itens.some((i) => i.pseudo && i.formato === 'ouvir-leituras' && i.opcoes.length >= 3));
      expect(pseudoConferida, `${f.id}: pseudopalavra sem conferência`).toBe(true);
    }
  });

  it('TODAS as trilhas: toda palavra lida ou escrita sozinha está no banco anotado e respeita o que a região ensina', () => {
    for (const f of FASES) for (const i of verificarFase(f)) expect(i.resultado.erros, `${f.id} ${i.cena}: "${i.texto}"`).toEqual([]);
    expect(FASES.filter((f) => f.regiao !== 'TF').flatMap(leiturasDaFase).length).toBeGreaterThan(20);
  });

  it('o roteiro de cada lição da trilha (docs/pedagogia/04 §4) e as revisões de bloco', () => {
    for (const f of FASES_TF) {
      const tipos = f.cenas.map((c) => c.atividade?.tipo);
      const licao = f.trilhaSons!.tipo === 'licao';
      // vogais (TF-01…05): a fase "Letra X" (Trilha A–Z) vem logo antes e já apresenta o som (cena 'letra', som antes do nome);
      // a lição faz as perguntas em outra tela, como jogo (revisão 18/11, item 10) [DP]
      const vogal = /^TF-0[1-5]$/.test(f.id);
      if (vogal) {
        const letra = FASES.find((x) => x.id === `AL-${'AEIOU'[Number(f.id.slice(-1)) - 1]}`);
        expect(letra?.cenas.map((c) => c.atividade?.tipo)[0], `${f.id}: a letra antes apresenta o som`).toBe('letra');
        expect(f.cenas.filter((c) => c.id.includes('-C3')).every((c) => c.atividade?.tipo === 'escolher' && c.atividade.comoJogo), f.id).toBe(true);
      } else if (licao) {
        expect(tipos, f.id).toContain('somNovo');
        // som antes do nome da letra: a cena do som novo vem antes de qualquer cena que mostre a letra
        expect(tipos.indexOf('somNovo'), f.id).toBeLessThan(tipos.indexOf('escolher', f.id === 'TF-01' ? 0 : 1));
      }
      if (unidadeDaFase(f)! >= 7) {
        for (const t of ['sintese', 'caixas'] as const) if (f.trilhaSons!.tipo !== 'revisao') expect(tipos, `${f.id} sem ${t}`).toContain(t);
      }
      expect(f.criterio.tipo, f.id).toBe('dominio');
    }
    expect(FASES_TF.filter((f) => f.trilhaSons!.tipo === 'revisao').map((f) => f.id)).toEqual(['TF-06', 'TF-R2', 'TF-R3']);
    expect(LICOES_TF.map((l) => l.unidade).filter((u) => /^TF-\d+$/.test(u))).toEqual(UNIDADES_TF.slice(0, 32).map((u) => u.id));
    // as frases decodificáveis vêm a partir de TF-10, com pergunta e figuras plausíveis
    const frases = FASES_TF.flatMap((f) => f.cenas).filter((c) => c.atividade?.tipo === 'frase');
    expect(frases.length).toBeGreaterThanOrEqual(8);
    for (const c of frases) if (c.atividade?.tipo === 'frase') for (const i of c.atividade.itens) {
      expect(i.opcoes).toContain(i.correta);
      expect(i.opcoes.length).toBe(3);
      for (const o of i.opcoes) expect(FIGURAS[o] ?? BANCO[o]?.figura, `${c.id}: figura ${o}`).toBeTruthy();
    }
  });

  it('as mecânicas novas não entregam a resposta', () => {
    for (const f of FASES_TF) for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'sintese') for (const i of a.itens) {
        expect(i.opcoes.map((o) => o.id)).toContain(i.correta);
        expect(i.opcoes.length, c.id).toBeGreaterThanOrEqual(3);
        // as opções ou são todas figuras, ou todas palavras faladas (sem nada escrito)
        expect(i.opcoes.every((o) => o.botaoDeSom && o.rotulo === '') || i.opcoes.every((o) => !o.botaoDeSom), c.id).toBe(true);
        expect(i.sons.length).toBe(i.palavra.length);
      }
      if (a?.tipo === 'caixas') for (const i of a.itens) {
        expect(i.letras.length, `${c.id}: a bandeja precisa ter letras a mais`).toBeGreaterThan(new Set(i.palavra).size);
        expect(a.caixasExtras ?? 1).toBeGreaterThanOrEqual(1);
      }
      if (a?.tipo === 'troca') for (const i of a.itens) {
        expect(i.letras).toContain(i.letra);
        expect(i.letras.length).toBeGreaterThanOrEqual(3);
        expect(i.leituras).toContain(i.para.toLowerCase());
        expect(i.leituras).toContain(i.de.toLowerCase());
      }
      if (a?.tipo === 'parMinimo') for (const i of a.itens) {
        expect(i.alvo).not.toBe(i.outra);
        if (i.modo === 'ouvir') expect(FIGURAS[i.alvo] ?? BANCO[i.alvo]?.figura, `${c.id}: ${i.alvo}`).toBeTruthy();
      }
    }
    expect(comSons('pato')).toEqual({ palavra: 'PATO', sons: ['p', 'a', 't', 'u'] });
    expect(comSons('tia').sons).toEqual(['t', 'i', 'a']);
  });

  it('relatório por fase (05 §6.8)', () => {
    const r = relatorioDaFase(FASES_TF.find((f) => f.id === 'TF-17')!);
    expect(r).toMatch(/TF-17/);
    expect(r).toMatch(/PATO/);
    expect(r).not.toMatch(/\*\*erro\*\*/);
  });
});
