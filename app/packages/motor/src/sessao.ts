/**
 * Monta a sessão C0–C9 de uma fase (jogo-completo README §3):
 * C0 acolhida → C1 Jardim da Revisão (se houver revisão vencida) → cenas da fase → C6 pausa ativa
 * → C9 ritual de fim. Na Trilha Expressa, a fase vira prova-relâmpago (4–6 itens) + história curta.
 */
import { FASES, FASE_POR_ID } from '@fonema/conteudo';
import type { Atividade, Cena, ConfigPlataforma, ItemEscolha } from '@fonema/conteudo';
import type { Crianca, Progresso } from './estado.ts';
import { infoNome, resolverCena } from './resolver.ts';
import { revisoesVencidas } from './revisao.ts';
import { faseEmExpressa } from './trilha-expressa.ts';
import { hash } from './primeiro-som.ts';

export interface Etapa {
  tipo: 'acolhida' | 'cena' | 'ritual';
  cena?: Cena;
}

export interface Sessao {
  id: string;
  faseId: string;
  expressa: boolean;
  etapas: Etapa[];
  iniciadaEm: number;
}

/** Itens de revisão (já revisados no banco de conteúdo) para uma habilidade dominada. */
export function itensDeRevisao(habilidade: string, n: number, semente: number): ItemEscolha[] {
  const todos: ItemEscolha[] = [];
  for (const f of FASES) {
    for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher' && !a.gerador && a.habilidade === habilidade) todos.push(...a.itens.map((i) => ({ ...i, habilidade })));
    }
  }
  if (!todos.length) return [];
  const out: ItemEscolha[] = [];
  for (let k = 0; k < Math.min(n, todos.length); k++) out.push(todos[(semente + k * 3) % todos.length]);
  return out;
}

function limitarItens(a: Atividade, max: number): Atividade {
  if (a.tipo === 'escolher') return { ...a, itens: a.itens.slice(0, max) };
  if (a.tipo === 'falar') return { ...a, itens: a.itens.slice(0, max) };
  if (a.tipo === 'palmas' || a.tipo === 'montar' || a.tipo === 'ditado') return { ...a, palavras: a.palavras.slice(0, max) } as Atividade;
  if (a.tipo === 'tracar') return { ...a, letras: a.letras.slice(0, max) };
  return a;
}

export function montarSessao(p: Progresso, c: Crianca, faseId: string, cfg: ConfigPlataforma, agora: number): Sessao {
  const fase = FASE_POR_ID[faseId];
  if (!fase) throw new Error(`Fase desconhecida: ${faseId}`);
  const n = infoNome(c.nome, c.pronuncia.grafia);
  const expressa = faseEmExpressa(p, faseId);
  const semente = hash(`${c.id}${p.sessoesFeitas}`);
  const etapas: Etapa[] = [{ tipo: 'acolhida' }];

  // C1 · Jardim da Revisão: até N itens das habilidades vencidas
  const vencidas = revisoesVencidas(p.habilidades, agora, 2);
  const revisao: ItemEscolha[] = vencidas.flatMap((h) => itensDeRevisao(h, Math.ceil(cfg.revisao.maxItensPorSessao / vencidas.length), semente));
  if (revisao.length && !expressa) {
    etapas.push({
      tipo: 'cena',
      cena: {
        id: `${faseId}-C1-revisao`, tipo: 'C1', titulo: 'Jardim da Revisão', cenario: 'quintal',
        atividade: { tipo: 'escolher', estilo: 'revisao', habilidade: revisao[0].habilidade ?? fase.habilidades[0], itens: revisao, enunciado: { quem: 'sofia', texto: 'Cada flor guarda uma palavra de outro dia. Tenta antes de eu ajudar, [NOME]!' } }
      }
    });
  }

  const maxItens = c.apoios.focoCurto ? 3 : 6;
  if (expressa) {
    // prova-relâmpago: só as cenas que contam domínio, 4–6 itens no total, com história curta
    let resta = 6;
    for (const cena of fase.cenas.filter((x) => x.contaDominio && x.atividade)) {
      if (resta <= 0) break;
      const a = limitarItens(cena.atividade!, Math.min(2, resta));
      resta -= 2;
      etapas.push({ tipo: 'cena', cena: resolverCena({ ...cena, assiste: cena.assiste ? { ...cena.assiste, roteiro: cena.assiste.roteiro.slice(0, 2) } : undefined, atividade: a }, n) });
    }
  } else {
    for (const cena of fase.cenas) {
      if (cena.tipo === 'C1' && revisao.length) continue;
      const atividade = cena.atividade ? limitarItens(cena.atividade, maxItens) : undefined;
      etapas.push({ tipo: 'cena', cena: resolverCena({ ...cena, atividade }, n) });
    }
    // missões curtas (Trilha do Alfabeto) não ganham pausa ativa automática
    if (!fase.curta && !fase.cenas.some((x) => x.tipo === 'C6')) {
      etapas.push({
        tipo: 'cena',
        cena: {
          id: `${faseId}-C6-pausa`, tipo: 'C6', titulo: 'Pausa ativa: respira com a Sofia', cenario: 'quintal',
          atividade: { tipo: 'pausa', habilidade: fase.habilidades[0], acao: 'Respira', sequencia: [], enunciado: { quem: 'sofia', texto: 'Enche o peito de ar… e solta devagar. Estica os braços bem alto, [NOME]!' } }
        }
      });
    }
  }
  etapas.push({ tipo: 'ritual' });
  return { id: `s-${agora.toString(36)}`, faseId, expressa, etapas, iniciadaEm: agora };
}
