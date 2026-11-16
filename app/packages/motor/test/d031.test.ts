/**
 * D031: letras e sons alternados na jornada. Progresso salvo na ordem antiga (Alfabeto inteiro → Trilha dos Sons) não perde nada:
 * fases concluídas continuam concluídas e a fase atual é recalculada pela nova ordem.
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES } from '@fonema/conteudo';
import { concluirFase, migrarProgresso, podeEntrar, progressoInicial, reordenarJornada } from '../src/index.ts';
import type { Progresso, ProgressoFase } from '../src/index.ts';

const T0 = new Date('2026-11-16T15:00:00').getTime();
const cfg = CONFIG_PADRAO;

/** A ordem ANTIGA da jornada (até 16/11): A–Z com revisão a cada 5 letras e a Festa, depois a Trilha dos Sons. */
const ORDEM_ANTIGA = [
  ...'ABCDE'.split('').map((l) => `AL-${l}`), 'AL-R1', ...'FGHIJ'.split('').map((l) => `AL-${l}`), 'AL-R2',
  ...'KLMNO'.split('').map((l) => `AL-${l}`), 'AL-R3', ...'PQRST'.split('').map((l) => `AL-${l}`), 'AL-R4',
  ...'UVWXYZ'.split('').map((l) => `AL-${l}`), 'AL-FESTA',
  ...FASES.filter((f) => f.regiao === 'TF').map((f) => f.id)
];

/** Progresso versão 2 salvo na ordem antiga: concluiu as `n` primeiras fases; a seguinte estava aberta. */
function salvoNaOrdemAntiga(n: number): Progresso {
  const base = progressoInicial('c1', T0);
  const fases: Record<string, ProgressoFase> = {};
  ORDEM_ANTIGA.forEach((id, i) => {
    fases[id] = i < n ? { estado: 'concluida', sessoes: 1, concluidaEm: T0, abertaEm: T0 } : i === n ? { estado: 'aberta', sessoes: 0, abertaEm: T0 } : { estado: 'bloqueada', sessoes: 0 };
  });
  // as fases depois da Trilha dos Sons não mudaram de lugar
  for (const f of FASES) if (!fases[f.id] && f.regiao !== 'AL') fases[f.id] = { estado: 'bloqueada', sessoes: 0 };
  return { ...base, versao: 2, fases, faseAtual: ORDEM_ANTIGA[n], moedinhas: { saldo: 30, total: 40, porDia: {} }, desafios: 50 };
}

describe('D031: migração do progresso salvo na ordem antiga', () => {
  it('no meio do alfabeto (A–K feitas, L aberta): nada concluído se perde e a fase atual passa a ser a lição do som /a/', () => {
    const antigo = salvoNaOrdemAntiga(ORDEM_ANTIGA.indexOf('AL-L'));
    const p = migrarProgresso(antigo, cfg);
    expect(p.versao).toBe(3);
    for (const id of ORDEM_ANTIGA.slice(0, ORDEM_ANTIGA.indexOf('AL-L'))) expect(p.fases[id].estado, id).toBe('concluida');
    // as revisões antigas (fora da jornada) ficam guardadas como estavam
    expect(p.fases['AL-R1'].estado).toBe('concluida');
    expect(p.fases['AL-R2'].estado).toBe('concluida');
    // a primeira que falta na ordem nova: TF-01 (A já foi feita); é a única aberta além das concluídas
    expect(p.faseAtual).toBe('TF-01');
    expect(podeEntrar(p, 'TF-01')).toBe(true);
    expect(p.fases['AL-L'].estado).toBe('bloqueada'); // estava aberta, agora espera a vez (depois de TF-09)
    expect(FASES.filter((f) => p.fases[f.id].estado === 'aberta').map((f) => f.id)).toEqual(['TF-01']);
    // fases novas (revisões por bloco) entram trancadas
    expect(p.fases['AL-RV1']).toMatchObject({ estado: 'bloqueada', sessoes: 0 });
    // o resto não muda
    expect(p.moedinhas).toEqual(antigo.moedinhas);
    expect(p.desafios).toBe(50);
    // e a jornada anda: TF-01 → (E já feita) → TF-02
    const q = concluirFase(p, 'TF-01', T0);
    expect(q.faseAtual).toBe('TF-02');
    expect(podeEntrar(q, 'TF-02')).toBe(true);
    const r = concluirFase(q, 'TF-02', T0);
    expect(r.faseAtual).toBe('TF-03'); // I também já estava feita
  });

  it('alfabeto inteiro + Festa + TF-01…TF-05 feitos: continua em TF-06 e as revisões novas vêm na hora delas', () => {
    const antigo = salvoNaOrdemAntiga(ORDEM_ANTIGA.indexOf('TF-06'));
    const p = migrarProgresso(antigo, cfg);
    expect(p.faseAtual).toBe('TF-06');
    expect(p.fases['AL-FESTA'].estado).toBe('concluida');
    expect(p.fases['AL-M'].estado).toBe('concluida');
    const q = concluirFase(p, 'TF-06', T0);
    expect(q.faseAtual).toBe('AL-RV1');
    const r = concluirFase(q, 'AL-RV1', T0);
    expect(r.faseAtual).toBe('TF-07'); // a letra M já estava feita
    expect(podeEntrar(r, 'TF-07')).toBe(true);
  });

  it('é idempotente e não mexe em progresso novo', () => {
    const p = migrarProgresso(salvoNaOrdemAntiga(7), cfg);
    expect(migrarProgresso(p, cfg)).toBe(p);
    expect(reordenarJornada(p, T0)).toEqual(p);
    const novo = progressoInicial('c1', T0);
    expect(novo.versao).toBe(3);
    expect(migrarProgresso(novo, cfg)).toBe(novo);
  });

  it('nível "já conhece as letras e os sons" salvo antes: as letras continuam liberadas e a jornada segue em TF-06', () => {
    const base = progressoInicial('c1', T0);
    const fases: Record<string, ProgressoFase> = {};
    for (const f of FASES) fases[f.id] = f.regiao === 'AL' || ['TF-01', 'TF-02', 'TF-03', 'TF-04', 'TF-05'].includes(f.id)
      ? { estado: 'aberta', sessoes: 0, liberada: true, abertaEm: T0 } : f.id === 'TF-06' ? { estado: 'aberta', sessoes: 0, abertaEm: T0 } : { estado: 'bloqueada', sessoes: 0 };
    delete fases['AL-RV1']; delete fases['AL-RV2']; delete fases['AL-RV3'];
    const p = migrarProgresso({ ...base, versao: 2, nivelInicial: 'letras-e-sons', fases, faseAtual: 'TF-06' }, cfg);
    expect(p.faseAtual).toBe('TF-06');
    expect(podeEntrar(p, 'AL-M')).toBe(true);
    // a revisão nova do alfabeto (não existia) também fica liberada: depois de TF-06 vem TF-07
    expect(p.fases['AL-RV1']).toMatchObject({ estado: 'aberta', liberada: true });
    expect(concluirFase(p, 'TF-06', T0).faseAtual).toBe('TF-07');
  });
});
