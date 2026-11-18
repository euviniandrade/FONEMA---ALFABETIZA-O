/**
 * D034 — desbloqueio progressivo: cada missão das primeiras abre algo novo e visível; os jogos nunca ficam trancados por muito
 * tempo; o que fecha diz o que falta; o "Abriu!" do ritual e o selo "Novo!" saem do mesmo catálogo.
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES } from '@fonema/conteudo';
import {
  abriuParaMostrar, anotarNovidades, catalogoDeExtras, concluirFase, extrasAbertos, extrasQueAbriram, fecharSessao, marcarVisto,
  missoesAteAbrir, progressoInicial, temNovidade, textoMissoes, type Progresso
} from '../src/index.ts';

const T0 = 1_700_000_000_000;
const ate = (n: number): Progresso => {
  let p = progressoInicial('c1', T0);
  for (let i = 0; i < n; i++) p = concluirFase(p, p.faseAtual, T0 + i);
  return p;
};

describe('desbloqueio progressivo (D034)', () => {
  it('criança nova: nada de jogo de som aberto ainda, mas tudo fechado diz o que falta', () => {
    const p = progressoInicial('c1', T0);
    const cat = catalogoDeExtras(p);
    for (const x of cat.filter((e) => !e.aberto)) expect(x.falta, x.id).toBeTruthy();
    // as histórias para ouvir ficam sempre abertas
    expect(cat.filter((x) => x.id.startsWith('leitura:historia:')).every((x) => x.aberto)).toBe(true);
  });

  it('cada uma das 11 primeiras missões abre pelo menos uma coisa nova e visível', () => {
    for (let n = 1; n <= 11; n++) {
      const abriu = extrasQueAbriram(ate(n - 1), ate(n));
      expect(abriu.length, `missão ${n} (${FASES[n - 1].id})`).toBeGreaterThan(0);
    }
  });

  it('depois da 1ª missão (Letra A) os jogos de som já abrem, com o som do A, e a 1ª peça da Lojinha', () => {
    const abriu = extrasQueAbriram(ate(0), ate(1));
    for (const id of ['jogo:corre-som', 'jogo:come-som', 'som:A', 'peca:camisa:mata']) expect(abriu).toContain(id);
    // a Memória abre na 3ª missão (2 sons para o nível 1, só olhar); o Corre-Som de letras na 5ª (3 letras)
    expect(extrasAbertos(ate(2)).has('jogo:memoria')).toBe(false);
    expect(extrasAbertos(ate(3)).has('jogo:memoria:1')).toBe(true);
    expect(extrasAbertos(ate(4)).has('jogo:corre-som:letra')).toBe(false);
    expect(extrasAbertos(ate(5)).has('jogo:corre-som:letra')).toBe(true);
  });

  it('missoesAteAbrir: conta as missões que faltam (1 = a próxima) e combina com o que abre de verdade', () => {
    const p = ate(0);
    const m = missoesAteAbrir(p);
    expect(m['jogo:corre-som']).toBe(1);
    expect(m['jogo:memoria']).toBe(3);
    expect(m['jogo:corre-som:letra']).toBe(5);
    expect(m['leitura:escrita']).toBe(14);
    for (const [id, n] of Object.entries(m)) if (n != null) expect(extrasAbertos(ate(n)).has(id), id).toBe(true);
    expect(textoMissoes(1)).toBe('Abre na próxima missão!');
    expect(textoMissoes(3)).toBe('Faltam 3 missões para abrir.');
  });

  it('fecharSessao devolve o que abriu e marca "Novo!" até a criança visitar', () => {
    const p0 = progressoInicial('c1', T0);
    // a Letra A é missão: conclui com as cenas que contam feitas
    const fase = FASES[0];
    const atividades = fase.cenas.filter((c) => c.contaDominio).length;
    const r = fecharSessao(p0, { faseId: fase.id, sessao: 's1', atividades, tentativasDaSessao: [], expressa: false, demonstracoes: [] }, CONFIG_PADRAO, T0 + 1);
    expect(r.relatorio.faseConcluida).toBe(true);
    expect(r.relatorio.abriu).toContain('jogo:corre-som');
    expect(temNovidade(r.progresso, 'jogo:corre-som')).toBe(true);
    expect(temNovidade(r.progresso, 'jogo')).toBe(true);
    const visto = marcarVisto(r.progresso, 'jogo:corre-som');
    expect(temNovidade(visto, 'jogo:corre-som')).toBe(false);
    expect(temNovidade(visto, 'jogo:come-som')).toBe(true);
    expect(anotarNovidades(visto, ['jogo:come-som']).novidades!.filter((x) => x === 'jogo:come-som')).toHaveLength(1);
  });

  it('"Abriu!" mostra o jogo e não repete as variações dele; peça do outro sexo não aparece', () => {
    const ids = ['jogo:corre-som', 'jogo:corre-som:figura', 'som:A', 'peca:cabelo:f-coque', 'peca:camisa:mata'];
    const m = abriuParaMostrar(ids, 'm').map((x) => x.id);
    expect(m).toEqual(['jogo:corre-som', 'som:A', 'peca:camisa:mata']);
  });

  it('quem já tinha progresso não ganha uma enxurrada de "Novo!": só o que abre numa missão nova', () => {
    const p = ate(20);
    expect(p.novidades).toBeUndefined();
  });
});
