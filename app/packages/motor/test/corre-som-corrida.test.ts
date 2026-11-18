/**
 * D035: Corre-Som em corrida — pontos, estrelas, níveis, moedinhas, ondas, registro e a regra de peso (chute de corrida).
 */
import { describe, expect, it } from 'vitest';
import { AVATAR_PADRAO } from '../src/index.ts';
import { CONFIG_PADRAO, FASE_POR_ID } from '@fonema/conteudo';
import type { AtividadeEscolher } from '@fonema/conteudo';
import {
  BONUS_SEQUENCIA_A_CADA, ERROS_SEGUIDOS_CHUTE, NIVEIS_CORRIDA, NIVEL_MAXIMO, PONTOS, aplicarAtividade, avaliarDominio, bateuMeta, chuteDeCorrida, concluirFase,
  desafioDaCena, estrelasDaCorrida, fecharSessao, idDoRegistro, moedinhasDaCorrida, montarOndas, montarRodada, montarSessao, multiplicador, nivelDaCorrida, ondasDaFase,
  placarInicial, pontuar, progressoInicial, proximoNivel, recalcularP, registrarTentativa, novaHabilidade, tempoDeChegadaMs, tentativaDaCorrida, valeParaDominio
} from '../src/index.ts';
import type { Crianca, ItemJogo, PlacarCorrida, Progresso, Tentativa } from '../src/index.ts';

const T0 = new Date('2026-11-18T15:00:00').getTime();
function concluidas(ids: string[]): Progresso {
  const base = progressoInicial('c1', T0);
  const fases = { ...base.fases };
  for (const id of ids) fases[id] = { estado: 'concluida', sessoes: 1, concluidaEm: T0 };
  return { ...base, fases, sessoesFeitas: 3 };
}
const ALFA = (ls: string) => [...ls].map((l) => `AL-${l}`).filter((id) => FASE_POR_ID[id]);

describe('D035 · pontos', () => {
  it('moedinha +1, bônus +2, letra certa +10 com multiplicador de sequência, errada −5 e nunca abaixo de zero', () => {
    let pl = placarInicial();
    expect(pontuar(pl, 'errado').placar.pontos).toBe(0); // começa no zero e não fica negativo
    pl = pontuar(pl, 'moeda').placar;
    expect(pl.pontos).toBe(PONTOS.moeda);
    pl = pontuar(pl, 'bonus').placar;
    expect(pl.pontos).toBe(1 + PONTOS.bonus);
    const r1 = pontuar(pl, 'certo');
    expect(r1.delta).toBe(10);
    const e = pontuar(r1.placar, 'errado');
    expect(e.delta).toBe(-5);
    expect(e.placar).toMatchObject({ sequencia: 0, errosSeguidos: 1, erros: 1 });
  });
  it('a sequência multiplica (×1, ×2 a partir de 3, ×3 a partir de 6) e a cada 3 acertos seguidos vem o bônus +2', () => {
    expect([0, 2, 3, 5, 6, 9].map(multiplicador)).toEqual([1, 1, 2, 2, 3, 3]);
    let pl: PlacarCorrida = placarInicial();
    const deltas: number[] = [];
    for (let k = 0; k < 7; k++) { const r = pontuar(pl, 'certo'); deltas.push(r.delta); pl = r.placar; }
    expect(deltas).toEqual([10, 10, 12, 20, 20, 22, 30]);
    expect(pl).toMatchObject({ sequencia: 7, melhorSequencia: 7, acertos: 7, bonus: 2 });
    expect(BONUS_SEQUENCIA_A_CADA).toBe(3);
  });
});

describe('D035 · tempo, meta, estrelas, moedinhas e níveis', () => {
  it('cada nível tem tempo, meta e velocidade; sobe velocidade, meta e arcos por onda; o tempo nunca aumenta', () => {
    expect(NIVEIS_CORRIDA[0]).toMatchObject({ nivel: 1, parecidos: false });
    expect(NIVEIS_CORRIDA[0].segundos).toBeGreaterThanOrEqual(45);
    expect(NIVEIS_CORRIDA[0].segundos).toBeLessThanOrEqual(60);
    for (let k = 1; k < NIVEIS_CORRIDA.length; k++) {
      const a = NIVEIS_CORRIDA[k - 1], b = NIVEIS_CORRIDA[k];
      expect(b.velocidade).toBeGreaterThan(a.velocidade);
      expect(b.meta).toBeGreaterThan(a.meta);
      expect(b.segundos).toBeLessThanOrEqual(a.segundos);
      expect(b.arcosPorOnda).toBeGreaterThanOrEqual(a.arcosPorOnda);
      expect(tempoDeChegadaMs(b)).toBeLessThan(tempoDeChegadaMs(a));
    }
    expect(nivelDaCorrida(0).nivel).toBe(1);
    expect(nivelDaCorrida(99).nivel).toBe(NIVEL_MAXIMO);
  });
  it('estrelas 1–3 pela meta; moedinhas da Lojinha = estrelas, com teto 3; o nível sobe ao bater a meta e nunca desce', () => {
    expect([0, 39, 40, 79, 80, 119, 120, 999].map((p) => estrelasDaCorrida(p, 80))).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    expect([0, 1, 2, 3, 7].map(moedinhasDaCorrida)).toEqual([0, 1, 2, 3, 3]);
    expect(bateuMeta(80, 80)).toBe(true);
    expect(proximoNivel(1, 80)).toBe(2);
    expect(proximoNivel(1, 79)).toBe(1);
    expect(proximoNivel(3, 0)).toBe(3);
    expect(proximoNivel(NIVEL_MAXIMO, 9999)).toBe(NIVEL_MAXIMO);
  });
});

describe('D035 · ondas de arcos', () => {
  const p = concluidas(ALFA('AEIOUMF'));
  it('só letras já ensinadas (regra 2); cada onda tem um som e os arcos do nível, com a certa em posição sorteada que não repete (R5)', () => {
    for (const nivel of [1, 3]) {
      const ondas = montarOndas(p, 'letra', nivel, { semente: 11, ondas: 12 });
      expect(ondas).toHaveLength(12);
      let anterior = -1;
      for (const o of ondas) {
        expect(o.arcos).toHaveLength(nivelDaCorrida(nivel).arcosPorOnda);
        for (const a of o.arcos) {
          expect(a.somAlvo).toBe(o.somAlvo);
          expect(a.opcoes).toHaveLength(3);
          expect(a.opcoes.every((x) => 'AEIOUMF'.includes(x.letra!))).toBe(true);
          expect(a.posicaoCerta).not.toBe(anterior);
          anterior = a.posicaoCerta;
        }
      }
      expect(new Set(ondas.flatMap((o) => o.arcos.map((a) => a.posicaoCerta))).size).toBe(3);
    }
  });
  it('nível 1 evita distrator parecido; do nível 2 em diante há um parecido quando existe (R7: m/n, f/v)', () => {
    const q = concluidas(ALFA('AEIOUMNFV'));
    const parecido = (it: ItemJogo) => it.opcoes.some((o, j) => j !== it.posicaoCerta && ['MN', 'NM', 'FV', 'VF'].includes(it.correta + o.letra));
    const alvosMN = (n: number) => montarOndas(q, 'letra', n, { semente: 5, ondas: 40 }).map((o) => o.arcos[0]).filter((a) => 'MNFV'.includes(a.correta));
    expect(alvosMN(1).some(parecido)).toBe(false);
    expect(alvosMN(2).every(parecido)).toBe(true);
  });
  it('a opção nova não muda o sorteio de quem já usa montarRodada (caça ao tesouro, rodada clássica)', () => {
    const a = montarRodada(p, 'corre-som', { variacao: 'letra', semente: 42 });
    const b = montarRodada(p, 'corre-som', { variacao: 'letra', semente: 42, parecidos: true });
    expect(b).toEqual(a);
  });
  it('na fase, cada item é uma onda de um arco (a rodada acaba quando os itens acabam)', () => {
    const cena = FASE_POR_ID['TF-01'].cenas.find((c) => c.id === 'TF-01-C3a')!;
    const d = desafioDaCena(cena.atividade as AtividadeEscolher, 3)!;
    const ondas = ondasDaFase(d.itens);
    expect(ondas.map((o) => o.arcos.length)).toEqual(d.itens.map(() => 1));
  });
});

/* ------------------------------------------------------------ registro e peso ------------------------------------------------------------ */

const ITEM: ItemJogo = {
  correta: 'M', somAlvo: 'm', posicaoCerta: 1, habilidade: 'letra-m', formato: 'som-letra', categoria: 'grafema',
  opcoes: [{ id: 'A', letra: 'A', som: 'a' }, { id: 'M', letra: 'M', som: 'm' }, { id: 'F', letra: 'F', som: 'f' }]
};
const passar = (pista: number, extra: Partial<Parameters<typeof tentativaDaCorrida>[0]> = {}): Tentativa => tentativaDaCorrida({
  item: ITEM, pista, idDe: (o) => idDoRegistro(ITEM, o), sessao: 's1', cena: 'livre-corre-som', contexto: 'livre', tempoMs: 1830.4, em: T0,
  antes: { sequencia: 0, errosSeguidos: 0 }, mexeu: true, nivel: 2, ...extra
});

describe('D035 · cada passagem pelo arco é uma tentativa avaliada', () => {
  it('certa: avaliada, mecânica corre-som, formato corrida, alvo, escolhido, tempo, 3 opções, posições, contexto e o estado da corrida', () => {
    const t = passar(1, { antes: { sequencia: 2, errosSeguidos: 0 }, ouviuDeNovo: 1 });
    expect(t).toMatchObject({
      tipo: 'avaliada', mecanica: 'corre-som', formato: 'corrida', acertou: true, alvo: 'M', escolhido: 'M', respostas: ['M'], distratores: ['A', 'F'],
      tempoMs: 1830, nOpcoes: 3, posicaoCerta: 1, posicaoEscolhida: 1, contexto: 'livre', habilidade: 'letra-m', categoria: 'grafema', ouviuDeNovo: 1,
      corrida: { acertosSeguidos: 2, errosSeguidos: 0, mexeu: true, nivel: 2 }
    });
    expect(t.comAjuda).toBeUndefined();
  });
  it('errada numa passagem só: acertou = false e a escolha errada registrada (matriz de confusão)', () => {
    const t = passar(2);
    expect(t).toMatchObject({ acertou: false, alvo: 'M', escolhido: 'F', respostas: ['F'], posicaoEscolhida: 2 });
  });
  it('depois de um ✖ a letra certa aparece no canto: o próximo arco da onda vale "com ajuda" (R4)', () => {
    expect(passar(1, { respostaMostrada: true })).toMatchObject({ acertou: true, comAjuda: true, nivelAjuda: 'resposta-mostrada' });
  });
  it('aquecimento (D034) grava exposição; revisão marca revisao', () => {
    expect(tentativaDaCorrida({ item: { ...ITEM, aquecimento: true }, pista: 1, idDe: (o) => o.id, sessao: 's', cena: 'c', contexto: 'livre', tempoMs: 1, em: T0, antes: { sequencia: 0, errosSeguidos: 0 }, mexeu: true }).tipo).toBe('exposicao');
    expect(passar(1, { contexto: 'revisao' })).toMatchObject({ contexto: 'revisao', revisao: true });
  });
});

describe('D035 · regra de peso: o que da corrida NÃO conta como domínio', () => {
  it('passar sem mexer (ficou parada na pista) não conta, nem certo nem errado', () => {
    expect(chuteDeCorrida(passar(1, { mexeu: false }))).toBe(true);
    expect(chuteDeCorrida(passar(0, { mexeu: false }))).toBe(true);
  });
  it(`acerto isolado logo depois de ${ERROS_SEGUIDOS_CHUTE} erros seguidos não conta; acerto em sequência e erro com escolha contam`, () => {
    expect(chuteDeCorrida(passar(1, { antes: { sequencia: 0, errosSeguidos: 2 } }))).toBe(true);
    expect(chuteDeCorrida(passar(1, { antes: { sequencia: 0, errosSeguidos: 1 } }))).toBe(false);
    expect(chuteDeCorrida(passar(1, { antes: { sequencia: 3, errosSeguidos: 0 } }))).toBe(false);
    expect(chuteDeCorrida(passar(2, { antes: { sequencia: 0, errosSeguidos: 4 } }))).toBe(false);
  });
  it('fora da corrida nada muda (outros jogos e o Escolher não têm o campo)', () => {
    expect(chuteDeCorrida({ formato: 'som-letra', acertou: true })).toBe(false);
  });
  it('o motor ignora o chute na firmeza, no nº de tentativas e nas últimas certas; o resto é gravado (painel)', () => {
    let h = novaHabilidade();
    const chutes = [passar(1, { mexeu: false }), passar(1, { antes: { sequencia: 0, errosSeguidos: 3 } })];
    for (const t of chutes) h = registrarTentativa(h, t);
    expect(h.tentativas).toHaveLength(2);
    expect(h.p).toBe(novaHabilidade().p);
    expect(recalcularP(h.tentativas)).toBe(novaHabilidade().p);
    const av = avaliarDominio(h, CONFIG_PADRAO.dominio, false, 'letra-m');
    expect(av.tentativas).toBe(0);
    expect(av.participacoes).toBe(2);
    h = registrarTentativa(h, passar(1, { antes: { sequencia: 1, errosSeguidos: 0 } }));
    expect(h.p).toBeGreaterThan(novaHabilidade().p);
    expect(valeParaDominio(h.tentativas[2])).toBe(true);
  });
  it('pontos, moedas e estrelas não existem na tentativa (regra 4)', () => {
    const t = passar(1) as unknown as Record<string, unknown>;
    for (const k of ['pontos', 'moedas', 'estrelas', 'placar']) expect(t[k]).toBeUndefined();
  });
});

describe('D035 · a lição de vogal (TF-01) continua concluindo com o Corre-Som em corrida', () => {
  const crianca: Crianca = {
    id: 'c1', nome: 'Ana', genero: 'f', anoNascimento: 2021,
    pronuncia: { grafia: 'A-na', fala: 'Ana', rate: 1, pitchExtra: 0, voz: 'sofia' },
    avatar: { ...AVATAR_PADRAO, cantinho: 'mata' },
    apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
    jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
    consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: T0 },
    rotina: { minutosDia: 15, horaDormir: '20:00' },
    criadoEm: T0
  };
  /** Uma sessão da TF-01: o Corre-Som grava passagens de corrida; o Bichinho, a escolha clássica. */
  function sessaoTF01(p: Progresso, agora: number, mexeu: boolean) {
    const s = montarSessao(p, crianca, 'TF-01', CONFIG_PADRAO, agora);
    const todas: Tentativa[] = [];
    let atividades = 0;
    let seq = 0;
    for (const e of s.etapas) {
      const a = e.cena?.atividade;
      if (!a) continue;
      let ts: Tentativa[];
      const d = a.tipo === 'escolher' ? desafioDaCena(a as AtividadeEscolher, 0) : null;
      if (d?.jogo === 'corre-som') {
        ts = ondasDaFase(d.itens).map((o) => tentativaDaCorrida({ item: o.arcos[0], pista: o.arcos[0].posicaoCerta, idDe: (x) => idDoRegistro(o.arcos[0], x), sessao: s.id, cena: e.cena!.id,
          contexto: 'desafio', tempoMs: 1500, em: agora, antes: { sequencia: seq++, errosSeguidos: 0 }, mexeu }));
      } else {
        ts = [{ em: agora, sessao: s.id, habilidade: a.habilidade, acertou: true, tipo: 'avaliada', mecanica: d ? d.jogo : undefined, contexto: 'desafio' }];
      }
      p = aplicarAtividade(p, { sessao: s.id, cena: e.cena!, tentativas: ts, tentouDeNovo: 0 }, CONFIG_PADRAO, agora);
      if (e.cena!.contaDominio) { atividades++; todas.push(...ts); }
    }
    return fecharSessao(p, { faseId: 'TF-01', sessao: s.id, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, CONFIG_PADRAO, agora);
  }
  const inicio = () => concluirFase(progressoInicial('c1', T0), 'AL-A', T0);
  it('acertando com escolha, a fase conclui em poucas sessões (como antes da corrida)', () => {
    let p = inicio();
    let concluiu = 0;
    for (let k = 1; k <= 4 && !concluiu; k++) { const r = sessaoTF01(p, T0 + k * 86400e3, true); p = r.progresso; if (r.relatorio.faseConcluida) concluiu = k; }
    expect(concluiu).toBeGreaterThan(0);
    expect(concluiu).toBeLessThanOrEqual(2);
    expect(p.fases['TF-01'].estado).toBe('concluida');
  });
  it('passar sem mexer nunca conclui só pelo Corre-Som (as passagens não contam)', () => {
    let p = inicio();
    const semMexer = sessaoTF01(p, T0 + 86400e3, false);
    p = semMexer.progresso;
    const h = p.habilidades['vogal-a'];
    expect(h.tentativas.filter((t) => t.formato === 'corrida').every((t) => !valeParaDominio(t))).toBe(true);
  });
});
