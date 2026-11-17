/**
 * D032 §4: jogos fônicos (Corre-Som e Bichinho Come-Som) — filtro "já ensinado", sorteio de posições, rodada variada,
 * cenas de fase que viram jogo e registro das escolhas pelo contrato do motor.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES, FASE_POR_ID, LETRA_POR_ID, fonemasDasLetras, parConfuso } from '@fonema/conteudo';
import type { AtividadeEscolher } from '@fonema/conteudo';
import {
  FIGURAS_SOM_FINAL, HABILIDADE_SOM_FINAL, desafioDaCena, figurasQueComecam, letrasComSomVisto, montarRodada, posicionarCerta, geradorJogo,
  progressoInicial, registrarLivre, sonsEnsinados, variacoesDoJogo, ehAvaliada, aplicarAtividade
} from '../src/index.ts';
import type { ItemJogo, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
function concluidas(ids: string[], base: Progresso = progressoInicial('c1', T0)): Progresso {
  const fases = { ...base.fases };
  for (const id of ids) fases[id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
  return { ...base, fases, sessoesFeitas: 3 };
}
const ALFA = (ls: string) => [...ls].map((l) => `AL-${l}`).filter((id) => FASE_POR_ID[id]);
const MANIFESTO = JSON.parse(readFileSync(fileURLToPath(new URL('../../../web/public/audio/falas/manifesto.json', import.meta.url)), 'utf8')) as Record<string, unknown>;

describe('jogos fônicos: só o que a criança já estudou', () => {
  it('sem fase concluída nenhuma variação abre; com 2 sons ainda não (3 opções diferentes, R8)', () => {
    const zero = progressoInicial('c1', T0);
    expect(sonsEnsinados(zero)).toEqual([]);
    expect(variacoesDoJogo(zero, 'corre-som').every((v) => !v.liberada)).toBe(true);
    expect(montarRodada(zero, 'corre-som', { variacao: 'letra', semente: 3 })).toEqual([]);
    const dois = concluidas(ALFA('AE'));
    expect(variacoesDoJogo(dois, 'corre-som')[0]).toMatchObject({ liberada: false });
    expect(variacoesDoJogo(concluidas(ALFA('AEI')), 'corre-som')[0]).toMatchObject({ liberada: true });
  });

  it('H, K, W e Y não entram (sem som real); C, K e Q valem um som só', () => {
    const p = concluidas(ALFA('ACHKQWYM'));
    const s = sonsEnsinados(p);
    expect(s.map((x) => x.letra)).toEqual(['A', 'C', 'M']);
    expect(new Set(s.map((x) => x.som)).size).toBe(s.length);
  });

  it('sem clipe do som (temSom), o som não entra (regra 1: nunca o nome da letra no lugar)', () => {
    const p = concluidas(ALFA('AEIMF'));
    expect(sonsEnsinados(p, (f) => f !== 'm').map((x) => x.letra)).not.toContain('M');
  });

  const GRUPOS = ['AEI', 'AEIOU', 'AEIOUMF', 'AFCV', 'AUVLMS', 'ABCDEFGIJLMNOPSTUVZ', 'FACULIVOTDRB'];
  it('Corre-Som "letra": 3 opções, todas de letras já ensinadas, sons diferentes, som puro como estímulo', () => {
    for (const g of GRUPOS) {
      const p = concluidas(ALFA(g));
      const vistas = letrasComSomVisto(p);
      for (let s = 1; s < 40; s++) {
        const rodada = montarRodada(p, 'corre-som', { variacao: 'letra', semente: s });
        expect(rodada.length).toBe(6);
        for (const i of rodada) {
          expect(i.opcoes).toHaveLength(3);
          expect(i.opcoes.every((o) => o.letra && vistas.includes(o.letra))).toBe(true);
          expect(new Set(i.opcoes.map((o) => o.som)).size).toBe(3);
          expect(i.somAlvo).toBe(LETRA_POR_ID[i.correta].fonema);
          expect(i.opcoes[i.posicaoCerta].id).toBe(i.correta);
        }
      }
    }
  });

  it('distrator parecido quando os dois sons já foram ensinados (R7: f/v, m/n, p/b)', () => {
    const p = concluidas(ALFA('AFVIU'));
    let comPar = 0;
    for (let s = 1; s < 30; s++) {
      for (const i of montarRodada(p, 'corre-som', { variacao: 'letra', semente: s })) {
        if (i.correta === 'F' || i.correta === 'V') { expect(i.opcoes.some((o) => o.id === (i.correta === 'F' ? 'V' : 'F'))).toBe(true); comPar++; }
      }
    }
    expect(comPar).toBeGreaterThan(0);
  });

  it('figuras (Corre-Som "figura" e Bichinho "inicio"): começam com um som ensinado; nenhuma figura tem o som do alvo além da certa', () => {
    for (const g of GRUPOS) {
      const p = concluidas(ALFA(g));
      const sons = sonsEnsinados(p).map((x) => x.som);
      for (const [jogo, variacao] of [['corre-som', 'figura'], ['come-som', 'inicio']] as const) {
        for (let s = 1; s < 25; s++) {
          for (const i of montarRodada(p, jogo, { variacao, semente: s })) {
            expect(i.opcoes).toHaveLength(3);
            expect(i.opcoes.every((o) => sons.includes(o.som))).toBe(true);
            expect(i.opcoes.filter((o) => o.som === i.somAlvo)).toHaveLength(1);
            for (const o of i.opcoes) {
              expect(fonemasDasLetras(o.id)[0]).toBe(o.som);
              expect(MANIFESTO[`sofia|${o.falar}`], `voz de ${o.falar}`).toBeTruthy();
            }
            expect(new Set(i.opcoes.map((o) => o.id)).size).toBe(3);
          }
        }
      }
    }
  });

  it('Bichinho "fim": só abre com A, I e U ensinados; cada figura termina com um som diferente (a, i, u)', () => {
    expect(variacoesDoJogo(concluidas(ALFA('AEIO')), 'come-som')[1].liberada).toBe(false);
    const p = concluidas(ALFA('AEIOU'));
    expect(variacoesDoJogo(p, 'come-som')[1].liberada).toBe(true);
    for (let s = 1; s < 30; s++) {
      const rodada = montarRodada(p, 'come-som', { variacao: 'fim', semente: s });
      expect(rodada.length).toBe(6);
      for (const i of rodada) {
        expect(i.habilidade).toBe(HABILIDADE_SOM_FINAL);
        expect(new Set(i.opcoes.map((o) => o.som))).toEqual(new Set(['a', 'i', 'u']));
        expect(i.opcoes.find((o) => o.id === i.correta)!.som).toBe(i.somAlvo);
      }
    }
    for (const f of FIGURAS_SOM_FINAL) expect(MANIFESTO[`sofia|${f.palavra}`], f.palavra).toBeTruthy();
    expect(FIGURAS_SOM_FINAL.find((f) => f.palavra === 'pato')?.som).toBe('u');
    expect(FIGURAS_SOM_FINAL.find((f) => f.palavra === 'chave')?.som).toBe('i');
    expect(FIGURAS_SOM_FINAL.some((f) => f.palavra === 'sol' || f.palavra === 'leão')).toBe(false);
  });
});

describe('sorteio: posição e variação (R5, R6)', () => {
  it('a posição da certa nunca repete a do item anterior', () => {
    const p = concluidas(ALFA('AEIOUMFVLS'));
    const contagem = [0, 0, 0];
    for (let s = 1; s < 60; s++) {
      for (const v of ['letra', 'figura'] as const) {
        const r = montarRodada(p, 'corre-som', { variacao: v, semente: s });
        for (let k = 1; k < r.length; k++) expect(r[k].posicaoCerta).not.toBe(r[k - 1].posicaoCerta);
        r.forEach((i) => contagem[i.posicaoCerta]++);
      }
    }
    // as três pistas são usadas (ficar parado numa pista acerta só ~1 em 3)
    expect(Math.min(...contagem) / Math.max(...contagem)).toBeGreaterThan(0.6);
    const r = geradorJogo(5);
    const ant = { pos: -1 };
    for (let k = 0; k < 50; k++) { const a = ant.pos; const { pos } = posicionarCerta('x', ['y', 'z'], r, ant); expect(pos).not.toBe(a); }
  });

  it('sementes diferentes trazem outra ordem; o mesmo alvo nunca vem duas vezes seguidas; cada som entra antes de repetir', () => {
    const p = concluidas(ALFA('AEIOUMF'));
    const a = montarRodada(p, 'corre-som', { variacao: 'letra', semente: 1 }).map((i) => i.correta).join('');
    const b = montarRodada(p, 'corre-som', { variacao: 'letra', semente: 2 }).map((i) => i.correta).join('');
    expect(a).not.toBe(b);
    for (let s = 1; s < 40; s++) {
      const r = montarRodada(p, 'corre-som', { variacao: 'letra', semente: s, n: 8 });
      for (let k = 1; k < r.length; k++) expect(r[k].correta).not.toBe(r[k - 1].correta);
      expect(new Set(r.slice(0, 7).map((i) => i.correta)).size).toBe(7);
    }
  });
});

describe('desafio dentro da fase: a cena "som → letra" / "som → figura" vira jogo com os MESMOS itens', () => {
  const cenas = FASES.flatMap((f) => f.cenas.map((c) => ({ f, c }))).filter(({ c }) => c.atividade?.tipo === 'escolher');
  it('há cenas da Trilha A–Z e da Trilha dos Sons que viram Corre-Som e Bichinho', () => {
    const conv = cenas.map(({ f, c }) => ({ f, d: desafioDaCena(c.atividade as AtividadeEscolher) })).filter((x) => x.d);
    expect(conv.some((x) => x.f.regiao === 'AL' && x.d!.jogo === 'corre-som')).toBe(true);
    expect(conv.some((x) => x.f.regiao === 'AL' && x.d!.jogo === 'come-som')).toBe(true);
    expect(conv.some((x) => x.f.regiao === 'TF' && x.d!.jogo === 'corre-som')).toBe(true);
  });
  it('cada item continua com a certa, 3 opções, o parecido mantido e o mesmo som; outros formatos não viram jogo', () => {
    for (const { c } of cenas) {
      const a = c.atividade as AtividadeEscolher;
      const d = desafioDaCena(a, 7);
      if (!d) { if (a.itens.length) expect(a.itens.some((i) => !['som-letra', 'som-figura'].includes(i.formato ?? '') || !i.somAlvo || i.opcoes.length < 3)).toBe(true); continue; }
      d.itens.forEach((i: ItemJogo, k) => {
        const orig = a.itens[k];
        expect(i.correta).toBe(orig.correta);
        expect(i.somAlvo).toBe(orig.somAlvo);
        expect(i.opcoes).toHaveLength(3);
        expect(i.opcoes[i.posicaoCerta].id).toBe(orig.correta);
        expect(i.opcoes.every((o) => orig.opcoes.some((x) => x.id === o.id))).toBe(true);
        const parecida = orig.opcoes.find((o) => o.id !== orig.correta && parConfuso(o.som!, orig.somCorreta ?? orig.somAlvo!));
        if (parecida) expect(i.opcoes.some((o) => o.id === parecida.id)).toBe(true);
      });
    }
  });
});

describe('registro das escolhas (contrato do motor)', () => {
  const t = (extra: Partial<Tentativa>): Tentativa => ({ em: T0, sessao: 's1', habilidade: 'som-final', acertou: true, ...extra });
  it('a escolha do jogo é AVALIADA, com contexto livre no Brincar; moeda e distância não viram tentativa', () => {
    const p = concluidas(ALFA('AEIOU'));
    const ts: Tentativa[] = [
      t({ mecanica: 'come-som', alvo: 'u', escolhido: 'u', respostas: ['u'], tempoMs: 900, nOpcoes: 3, posicaoCerta: 1, posicaoEscolhida: 1, categoria: 'fonema', formato: 'som-final' }),
      t({ mecanica: 'come-som', alvo: 'a', escolhido: 'i', respostas: ['i', 'a'], acertou: false, comAjuda: true, tempoMs: 2100, nOpcoes: 3, posicaoCerta: 0, posicaoEscolhida: 2, categoria: 'fonema', formato: 'som-final' })
    ];
    expect(ts.every((x) => ehAvaliada(x))).toBe(true);
    const r = registrarLivre(p, { sessao: 'livre-1', cena: { id: 'livre-come-som', titulo: 'Bichinho Come-Som' }, tentativas: ts, cfg: CONFIG_PADRAO, agora: T0 });
    const gravadas = r.progresso.habilidades['som-final'].tentativas;
    expect(gravadas).toHaveLength(2);
    expect(gravadas.every((x) => x.contexto === 'livre' && x.tipo === 'avaliada' && x.mecanica === 'come-som')).toBe(true);
    expect(r.progresso.moedinhas.saldo).toBe(p.moedinhas.saldo);
  });
  it('no desafio da fase, a tentativa entra na cena com contexto "desafio" e mecânica do jogo', () => {
    const p = concluidas([]);
    const cena = FASE_POR_ID['AL-A'].cenas.find((c) => c.id === 'AL-A-C3')!;
    const r = aplicarAtividade(p, { sessao: 's9', cena, tentativas: [t({ habilidade: 'letra-a', cena: cena.id, mecanica: 'corre-som', contexto: 'desafio', alvo: 'A', escolhido: 'A' })], tentouDeNovo: 0 }, CONFIG_PADRAO, T0);
    const g = r.habilidades['letra-a'].tentativas.at(-1)!;
    expect(g).toMatchObject({ mecanica: 'corre-som', contexto: 'desafio', tipo: 'avaliada' });
  });
  it('figurasQueComecam: a palavra-chave da letra vem por último (04 R1)', () => {
    expect(figurasQueComecam('B').at(-1)).toBe(LETRA_POR_ID.B.palavra);
  });
});
