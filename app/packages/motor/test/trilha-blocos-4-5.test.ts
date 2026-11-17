/**
 * Versão 4 do progresso (17/11): TF-23…TF-25 entram na jornada antes das letras R…W e da Festa. Quem já tinha passado da
 * revisão P…G não perde nada e volta para a primeira lição nova; quem ainda não chegou lá segue igual.
 */
import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, FASES } from '@fonema/conteudo';
import { migrarProgresso, podeEntrar, progressoInicial } from '../src/index.ts';
import type { Progresso, ProgressoFase } from '../src/index.ts';

const T0 = new Date('2026-11-17T15:00:00').getTime();
const NOVAS = ['TF-23', 'TF-24', 'TF-25'];
/** Progresso versão 3 (ordem de 16/11, sem TF-23…25): concluiu tudo até `ate` (exclusive), na ordem da jornada. */
function salvoV3(ate: string): Progresso {
  const base = progressoInicial('c1', T0);
  const ordem = FASES.map((f) => f.id).filter((id) => !NOVAS.includes(id));
  const n = ordem.indexOf(ate);
  const fases: Record<string, ProgressoFase> = {};
  ordem.forEach((id, i) => { fases[id] = i < n ? { estado: 'concluida', sessoes: 1, concluidaEm: T0, abertaEm: T0 } : i === n ? { estado: 'aberta', sessoes: 0, abertaEm: T0 } : { estado: 'bloqueada', sessoes: 0 }; });
  return { ...base, versao: 3, fases, faseAtual: ate, moedinhas: { saldo: 12, total: 20, porDia: {} } };
}

describe('progresso versão 4: TF-23…TF-25 na jornada', () => {
  it('quem estava na letra H (já tinha feito o R) volta para TF-23, sem perder nada', () => {
    const antigo = salvoV3('AL-H');
    const p = migrarProgresso(antigo, CONFIG_PADRAO);
    expect(p.versao).toBe(4);
    expect(p.faseAtual).toBe('TF-23');
    expect(podeEntrar(p, 'TF-23')).toBe(true);
    for (const [id, f] of Object.entries(antigo.fases)) if (f.estado === 'concluida') expect(p.fases[id].estado, id).toBe('concluida');
    expect(p.fases['AL-H'].estado).toBe('bloqueada'); // espera a vez, depois de TF-25
    expect(p.fases['TF-24']).toMatchObject({ estado: 'bloqueada', sessoes: 0 });
    expect(p.moedinhas).toEqual(antigo.moedinhas);
    expect(migrarProgresso(p, CONFIG_PADRAO)).toBe(p);
  });

  it('quem ainda estava antes (TF-10) segue na mesma fase', () => {
    const p = migrarProgresso(salvoV3('TF-10'), CONFIG_PADRAO);
    expect(p.faseAtual).toBe('TF-10');
    expect(p.fases['TF-23'].estado).toBe('bloqueada');
  });

  it('criança nova já nasce na versão 4', () => {
    expect(progressoInicial('c2', T0).versao).toBe(4);
  });
});
