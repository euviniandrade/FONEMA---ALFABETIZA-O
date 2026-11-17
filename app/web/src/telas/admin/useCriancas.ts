import { useEffect, useState } from 'react';
import { progressoInicial, resumoFamilia, type Crianca, type Evento, type Progresso, type ResumoFamilia } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { contarDesde, minutosDeUso } from './resumo-admin.ts';

export interface LinhaCrianca {
  c: Crianca; p: Progresso; resumo: ResumoFamilia; eventos: Evento[];
  sessoes: number; sessoes7: number; sessoes30: number; minutos: number; fasesConcluidas: number; ultimo?: number;
}
const DIA = 86_400_000;

/** Crianças deste aparelho com progresso e uso resumidos (para a visão geral e os relatórios da escola). */
export function useCriancas(): { linhas: LinhaCrianca[] | null; recarregar: () => void } {
  const { repo, config } = useApp();
  const [linhas, setLinhas] = useState<LinhaCrianca[] | null>(null);
  const [vez, setVez] = useState(0);
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const agora = Date.now();
      const cs = await repo.listarCriancas();
      const out: LinhaCrianca[] = [];
      for (const c of cs) {
        const p = (await repo.obterProgresso(c.id)) ?? progressoInicial(c.id, agora);
        const eventos = await repo.listarEventos(c.id);
        const sess = eventos.filter((e) => e.tipo === 'sessao').map((e) => e.em);
        out.push({
          c, p, eventos, resumo: resumoFamilia(c, p, eventos, config, agora),
          sessoes: sess.length, sessoes7: contarDesde(sess, agora - 7 * DIA), sessoes30: contarDesde(sess, agora - 30 * DIA),
          minutos: minutosDeUso(eventos.map((e) => e.em)),
          fasesConcluidas: Object.values(p.fases).filter((f) => f.concluidaEm && !f.liberada).length,
          ultimo: eventos.length ? eventos[eventos.length - 1].em : p.ultimaSessao
        });
      }
      if (vivo) setLinhas(out);
    })();
    return () => { vivo = false; };
  }, [repo, config, vez]);
  return { linhas, recarregar: () => setVez((v) => v + 1) };
}
