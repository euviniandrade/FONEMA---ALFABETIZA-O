/**
 * Monta a sessão C0–C9 de uma fase (jogo-completo README §3):
 * C0 acolhida → C1 Jardim da Revisão (se houver revisão vencida) → cenas da fase → C6 pausa ativa
 * → C9 ritual de fim. Na Trilha Expressa, a fase vira prova-relâmpago (4–6 itens) + história curta.
 */
import { FASES, FASE_POR_ID, MARCADOR_PALAVRINHAS } from '@fonema/conteudo';
import type { Atividade, Cena, ConfigPlataforma, ItemEscolha } from '@fonema/conteudo';
import type { Crianca, Progresso } from './estado.ts';
import { infoNome, resolverCena } from './resolver.ts';
import { revisoesVencidas } from './revisao.ts';
import { faseEmExpressa } from './trilha-expressa.ts';
import { hash } from './primeiro-som.ts';
import { tipoPadrao } from './tentativas.ts';
import { itensMaisErrados } from './confusao.ts';

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

/**
 * Itens de revisão (já revisados no banco de conteúdo) para uma habilidade dominada.
 * `prioridade` (D030): alvos em que ESTA criança mais errou — os itens que cobram esses alvos entram primeiro.
 */
export function itensDeRevisao(habilidade: string, n: number, semente: number, prioridade: string[] = []): ItemEscolha[] {
  const todos: ItemEscolha[] = [];
  for (const f of FASES) {
    for (const c of f.cenas) {
      const a = c.atividade;
      if (a?.tipo === 'escolher' && !a.gerador) todos.push(...a.itens.filter((i) => (i.habilidade ?? a.habilidade) === habilidade).map((i) => ({ ...i, habilidade })));
    }
  }
  if (!todos.length) return [];
  const out: ItemEscolha[] = [];
  const quer = Math.min(n, todos.length);
  const bate = (i: ItemEscolha, alvo: string) => i.correta === alvo || i.opcoes.some((o) => o.id === i.correta && (o.letra === alvo || o.som === alvo));
  for (const alvo of prioridade) {
    const i = todos.find((x) => bate(x, alvo) && !out.includes(x));
    if (i && out.length < quer) out.push(i);
  }
  for (let k = 0; out.length < quer && k < todos.length * 3; k++) {
    const i = todos[(semente + k * 3) % todos.length];
    if (!out.includes(i)) out.push(i);
  }
  return out;
}

/**
 * Revisão ALÉM do Escolher (D030): para habilidade dominada que não tem item de Escolher (ex.: escrita, só com
 * Ditado), reaproveita uma atividade AVALIADA já publicada da mesma habilidade (Ditado, Montar, Ligar, Palmas).
 */
export function atividadeDeRevisao(habilidade: string, n: number): Atividade | undefined {
  for (const f of FASES) {
    for (const c of f.cenas) {
      const a = c.atividade;
      if (!a || !c.contaDominio || a.habilidade !== habilidade || a.tipo === 'escolher') continue;
      if (tipoPadrao(a.tipo) !== 'avaliada' || ehVocabulario(a)) continue;
      return limitarItens(a, n);
    }
  }
  return undefined;
}

/** Montar de VOCABULÁRIO (palavras com sons ainda não ensinados): é exposição, não serve de revisão avaliada. */
function ehVocabulario(a: Atividade): boolean {
  return a.tipo === 'montar' && !!(a as { vocabulario?: boolean }).vocabulario;
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
  const porHab = vencidas.length ? Math.ceil(cfg.revisao.maxItensPorSessao / vencidas.length) : 0;
  const revisao: ItemEscolha[] = vencidas.flatMap((h) =>
    itensDeRevisao(h, porHab, semente, itensMaisErrados(p.habilidades[h]?.tentativas ?? []).map((x) => x.alvo)));
  // D030: habilidades vencidas sem item de Escolher são revistas na mecânica avaliada que têm (ditado, montar…)
  const revisaoOutras = vencidas
    .filter((h) => !revisao.some((i) => i.habilidade === h))
    .map((h) => atividadeDeRevisao(h, Math.min(porHab, 2)))
    .filter((a): a is Atividade => !!a);
  if (revisao.length && !expressa) {
    etapas.push({
      tipo: 'cena',
      cena: {
        id: `${faseId}-C1-revisao`, tipo: 'C1', titulo: 'Jardim da Revisão', cenario: 'quintal',
        atividade: { tipo: 'escolher', estilo: 'revisao', habilidade: revisao[0].habilidade ?? fase.habilidades[0], itens: revisao, enunciado: { quem: 'sofia', texto: 'Cada flor guarda uma palavra de outro dia. Tenta antes de eu ajudar, [NOME]!' } }
      }
    });
  }

  if (!expressa) {
    revisaoOutras.forEach((atividade, k) => {
      etapas.push({ tipo: 'cena', cena: resolverCena({ id: `${faseId}-C1-revisao-${k + 2}`, tipo: 'C1', titulo: 'Jardim da Revisão', cenario: 'quintal', atividade }, n) });
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
      // "primeiras palavrinhas" da Trilha do Alfabeto: liga/desliga em config (o dono ainda vai confirmar)
      if (cena.marcador === MARCADOR_PALAVRINHAS && cfg.alfabeto?.primeirasPalavrinhas === false) continue;
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
