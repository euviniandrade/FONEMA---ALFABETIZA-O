/**
 * D036 (dono, 26/11): várias missões no mesmo dia. O progresso anda missão a missão; o domínio, a revisão espaçada e o teto de
 * moedinhas continuam como eram (exposição ≠ domínio; revisão em dias). O fim da missão não diz "amanhã" quando há outra missão
 * para fazer agora, e só usa falas já gravadas.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FALAS, FASES } from '@fonema/conteudo';
import {
  AVATAR_LIMPO, CONVITE_PROXIMA, DIA_MS, PAUSA_DEPOIS_DE, aplicarAtividade, diaDe, dominadaDeVerdade, fecharSessao, fimDaMissao, missaoDeHoje,
  missoesHoje, montarSessao, progressoInicial, resumoFamilia
} from '../src/index.ts';
import type { Crianca, Progresso, Tentativa } from '../src/index.ts';

const cfg = CONFIG_PADRAO;
const MEIO_DIA = new Date('2026-11-26T12:00:00').getTime();
const HORA = 3600_000;
const crianca: Crianca = {
  id: 'c1', nome: 'Mariana', genero: 'f', anoNascimento: 2019,
  pronuncia: { grafia: 'Ma-ri-A-na', fala: 'Mariana', rate: 1, pitchExtra: 0, voz: 'sofia' },
  avatar: { ...AVATAR_LIMPO, cantinho: 'mata' },
  apoios: { previsivel: false, focoCurto: false, leituraReforco: false, calmo: false },
  jaSabe: { letrasDoNome: 'nao-sei', lePalavras: 'nao-sei', leFrases: 'nao-sei' },
  consentimentos: { responsavel: true, vozPrimeiroNome: true, gravarVozAdulto: false, em: MEIO_DIA },
  rotina: { minutosDia: 15, horaDormir: '20:00' },
  criadoEm: MEIO_DIA
};

/** Joga a missão da fase atual inteira. `acerta`: respostas certas (como a mecânica grava); `soExposicao`: só ver/ouvir. */
function jogar(p: Progresso, agora: number, modo: 'acerta' | 'soExposicao' = 'acerta') {
  const faseId = p.faseAtual;
  const s = montarSessao(p, crianca, faseId, cfg, agora);
  const todas: Tentativa[] = [];
  let atividades = 0;
  for (const e of s.etapas) {
    const a = e.cena?.atividade;
    if (!a) continue;
    const n = a.tipo === 'escolher' ? Math.max(1, a.itens.length) : 1;
    const ts: Tentativa[] = Array.from({ length: n }, (_, k) => {
      const item = a.tipo === 'escolher' ? a.itens[k] : undefined;
      return {
        em: agora, sessao: s.id, habilidade: item?.habilidade ?? a.habilidade, acertou: true, cena: e.cena!.id,
        ...(modo === 'soExposicao' ? { tipo: 'exposicao' as const, mecanica: 'letra' } : {}),
        ...(item?.pseudo ? { pseudo: true } : {}), ...(item?.formato ? { formato: item.formato } : {})
      };
    });
    p = aplicarAtividade(p, { sessao: s.id, cena: e.cena!, tentativas: ts, tentouDeNovo: 0 }, cfg, agora);
    if (e.cena!.contaDominio) { atividades++; todas.push(...ts); }
  }
  return { faseId, ...fecharSessao(p, { faseId, sessao: s.id, atividades, tentativasDaSessao: todas, expressa: false, demonstracoes: [] }, cfg, agora) };
}

describe('D036: três missões seguidas no mesmo dia', () => {
  it('o contador do dia sobe 1, 2, 3, o progresso anda e as sessões contam (sem pular fase)', () => {
    let p = progressoInicial('c1', MEIO_DIA);
    const feitas: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = jogar(p, MEIO_DIA + i * HORA);
      feitas.push(`${r.faseId}:${r.relatorio.faseConcluida ? 'concluiu' : 'treina'}`);
      p = r.progresso;
      expect(p.missoesDoDia).toEqual({ dia: diaDe(MEIO_DIA), n: i + 1 });
      expect(missoesHoje(p, MEIO_DIA + i * HORA + 1)).toBe(i + 1);
    }
    expect(p.sessoesFeitas).toBe(3);
    // AL-A conclui por participação; a lição do som /a/ (TF-01) é de DOMÍNIO e pede 2 sessões (≥ sessoesMin): no mesmo dia,
    // a 2ª e a 3ª missão são essa lição, e a 3ª a conclui. O critério conta SESSÕES, não dias (docs/pedagogia/06 §2; D036 pergunta ao dono)
    expect(feitas).toEqual(['AL-A:concluiu', 'TF-01:treina', 'TF-01:concluiu']);
    expect(p.faseAtual).toBe('AL-E');
    expect(p.fases['AL-E'].estado).toBe('aberta');
    expect(p.fases['AL-I'].estado).toBe('bloqueada');
  });

  it('a revisão espaçada de uma habilidade dominada hoje fica para OUTRO dia (não vira revisão na missão seguinte)', () => {
    let p = progressoInicial('c1', MEIO_DIA);
    for (let i = 0; i < 3; i++) p = jogar(p, MEIO_DIA + i * HORA).progresso;
    const h = p.habilidades['vogal-a'];
    expect(dominadaDeVerdade(h)).toBe(true);
    expect(h.revisao?.proxima).toBeDefined();
    expect(diaDe(h.revisao!.proxima)).not.toBe(diaDe(MEIO_DIA));
    expect(h.revisao!.proxima).toBeGreaterThanOrEqual(MEIO_DIA + 2 * HORA + cfg.revisao.intervalosDias[0] * DIA_MS);
    // a 4ª missão no mesmo dia não traz o Jardim da Revisão de vogal-a (ainda não venceu)
    const s = montarSessao(p, crianca, p.faseAtual, cfg, MEIO_DIA + 3 * HORA);
    expect(s.etapas.some((e) => e.cena?.id.includes('-C1-revisao') && e.cena?.atividade?.habilidade === 'vogal-a')).toBe(false);
  });

  it('exposição não vira domínio: três missões só de ver e ouvir não dominam nada', () => {
    let p = progressoInicial('c1', MEIO_DIA);
    for (let i = 0; i < 3; i++) p = jogar(p, MEIO_DIA + i * HORA, 'soExposicao').progresso;
    expect(p.missoesDoDia?.n).toBe(3);
    expect(Object.values(p.habilidades).some((h) => h.dominadaEm)).toBe(false);
    expect(p.fases['TF-01']?.estado).not.toBe('concluida');
  });

  it('o teto de moedinhas do dia continua valendo com várias missões', () => {
    let p = progressoInicial('c1', MEIO_DIA);
    for (let i = 0; i < 5; i++) p = jogar(p, MEIO_DIA + i * HORA).progresso;
    expect(p.moedinhas.porDia[diaDe(MEIO_DIA)] ?? 0).toBeLessThanOrEqual(cfg.moedinhas.tetoDia);
  });

  it('o contador volta a zero no dia seguinte; progresso antigo sem contador conta a última missão de hoje como 1', () => {
    let p = jogar(progressoInicial('c1', MEIO_DIA), MEIO_DIA).progresso;
    expect(missoesHoje(p, MEIO_DIA + DIA_MS)).toBe(0);
    expect(missaoDeHoje(p, MEIO_DIA + DIA_MS)).toMatchObject({ feitasHoje: 0, numero: 1, feitaHoje: false });
    expect(missaoDeHoje(p, MEIO_DIA + HORA)).toMatchObject({ feitasHoje: 1, numero: 2, feitaHoje: true });
    p = jogar(p, MEIO_DIA + DIA_MS).progresso;
    expect(p.missoesDoDia).toEqual({ dia: diaDe(MEIO_DIA + DIA_MS), n: 1 });
    const antigo = { ...progressoInicial('c1', MEIO_DIA), ultimaSessao: MEIO_DIA, missoesDoDia: undefined };
    expect(missoesHoje(antigo, MEIO_DIA + HORA)).toBe(1);
    // e o 1º fechamento de um progresso antigo sem nada hoje conta 1 (não 2)
    expect(jogar(progressoInicial('c1', MEIO_DIA), MEIO_DIA).progresso.missoesDoDia?.n).toBe(1);
  });

  it('painel da família: missões de hoje', () => {
    let p = progressoInicial('c1', MEIO_DIA);
    for (let i = 0; i < 2; i++) p = jogar(p, MEIO_DIA + i * HORA).progresso;
    expect(resumoFamilia(crianca, p, [], cfg, MEIO_DIA + 2 * HORA).missoesHoje).toBe(2);
    expect(resumoFamilia(crianca, p, [], cfg, MEIO_DIA + DIA_MS).missoesHoje).toBe(0);
  });
});

describe('D036: o fim da missão (C9) com outra missão à mão', () => {
  const manifesto = JSON.parse(readFileSync(resolve(__dirname, '../../../web/public/audio/falas/manifesto.json'), 'utf8')) as Record<string, unknown>;
  /** A fala tem clipe gravado (pedaços em volta do nome; mesma chave de web/src/servicos/voz.ts › chaveTrecho). */
  const gravada = (quem: string, texto: string) => texto.split('[NOME]')
    .map((t) => t.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').replace(/(\p{L})\1{2,}/giu, '$1$1$1$1').trim())
    .filter((t) => /\p{L}/u.test(t))
    .every((t) => `${quem}|${t}` in manifesto);

  it('nunca diz "amanhã" quando há próxima missão e ainda não é hora da pausa; a fala escolhida tem clipe gravado', () => {
    for (const fase of FASES) {
      for (const faseConcluida of [true, false]) {
        for (let feitasHoje = 1; feitasHoje < PAUSA_DEPOIS_DE; feitasHoje++) {
          const f = fimDaMissao({ fase, faseConcluida, feitasHoje, haProxima: true });
          expect(f.gancho.texto, `${fase.id}`).not.toMatch(/amanh/i);
          expect(f.tchau).toBe(false);
          expect(f.proxima).toBe(true);
          expect(f.pausa).toBe(false);
          if (!/[{}]/.test(f.gancho.texto)) expect(gravada(f.gancho.quem, f.gancho.texto), `${fase.id}: "${f.gancho.texto}"`).toBe(true);
        }
      }
    }
    expect(gravada(CONVITE_PROXIMA.quem, CONVITE_PROXIMA.texto)).toBe(true);
    expect(gravada('sofia', FALAS.ritual.tchau)).toBe(true);
  });

  it(`depois de ${PAUSA_DEPOIS_DE} missões: sugere pausa (fim de antes, com o tchau) e a próxima continua aberta`, () => {
    const fase = FASES[0];
    const f = fimDaMissao({ fase, faseConcluida: false, feitasHoje: PAUSA_DEPOIS_DE, haProxima: true });
    expect(f).toMatchObject({ pausa: true, tchau: true, proxima: true });
    expect(f.gancho.texto).toBe(FALAS.ritual.amanha);
  });

  it('chefe que pede treino "outro dia" e jornada sem próxima: sem botão de próxima, fim de antes', () => {
    const fase = FASES[0];
    expect(fimDaMissao({ fase, faseConcluida: false, feitasHoje: 1, haProxima: true, chefeNaoPassou: true })).toMatchObject({ proxima: false, tchau: true, pausa: false });
    expect(fimDaMissao({ fase, faseConcluida: true, feitasHoje: 1, haProxima: false })).toMatchObject({ proxima: false, tchau: true, gancho: fase.gancho });
  });
});
