/**
 * Sondagem PERIÓDICA (D030, etapa 9): quando oferecer de novo e como guardar o resultado por área.
 * A primeira sondagem ("Missão das Placas", trilha-expressa.ts) continua igual; aqui entra a repetição:
 * a cada N fases concluídas ou a cada M dias (config › sondagem), o que vier primeiro.
 * Cinco áreas acompanhadas: sons das letras, leitura de palavras, pseudopalavras, segmentação e ditado.
 * Área que a tela não mediu fica AUSENTE do resultado (não é zero).
 */
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { AreaSondagem, ItemSondagem, Progresso, ResultadoAreaSondagem, ResultadoSondagem } from './estado.ts';
import { DIA_MS } from './estado.ts';
import { fasesConcluidas } from './sequencia.ts';
import { aplicarSondagem } from './trilha-expressa.ts';

export const AREAS_SONDAGEM: { id: AreaSondagem; nome: string; oQueMede: string }[] = [
  { id: 'sons-letras', nome: 'Sons das letras', oQueMede: 'ouve o som e acha a letra (e o contrário)' },
  { id: 'leitura-palavras', nome: 'Leitura de palavras', oQueMede: 'lê palavras de verdade sem ajuda' },
  { id: 'pseudopalavras', nome: 'Pseudopalavras', oQueMede: 'lê palavras inventadas (mostra que decodifica, não decorou)' },
  { id: 'segmentacao', nome: 'Segmentação', oQueMede: 'separa a palavra em pedaços e acha o primeiro som' },
  { id: 'ditado', nome: 'Ditado', oQueMede: 'escreve a palavra que ouviu' }
];

/** Degrau da "Missão das Placas" → área da sondagem periódica. */
export const AREA_DO_DEGRAU: Record<number, AreaSondagem> = { 1: 'segmentacao', 2: 'segmentacao', 3: 'sons-letras', 4: 'sons-letras', 5: 'leitura-palavras' };

export function ultimaSondagem(p: Pick<Progresso, 'sondagens'>): ResultadoSondagem | undefined {
  const s = p.sondagens ?? [];
  return s[s.length - 1];
}

export interface SituacaoSondagem {
  devida: boolean;
  motivo?: ResultadoSondagem['motivo'];
  /** Fases concluídas desde a última sondagem (ou desde o começo). */
  fasesDesde: number;
  /** Dias desde a última sondagem (ou desde a primeira sessão). */
  diasDesde: number;
  /** Quando a próxima fica devida por tempo (ms), se o gatilho de dias estiver ligado. */
  proximaEm?: number;
  ultima?: ResultadoSondagem;
}

/**
 * A sondagem está devida?
 *  - nunca fez: devida depois da 1ª sessão (regra antiga da "Missão das Placas"), motivo 'inicial';
 *  - já fez: devida quando `aCadaFases` fases foram concluídas desde a última, ou `aCadaDias` dias se passaram.
 * `idade` (opcional): abaixo de `idadeMinima` não é oferecida à criança.
 */
export function situacaoSondagem(p: Progresso, cfg: ConfigPlataforma, agora: number, idade?: number): SituacaoSondagem {
  const k = cfg.sondagem;
  const ultima = ultimaSondagem(p);
  const concluidas = fasesConcluidas(p).size;
  // dado antigo: a Missão das Placas já feita (sem resultado por área) vale como a sondagem inicial
  const ultimaEm = ultima?.em ?? p.expressa.sondagemEm;
  const fasesDesde = ultima ? concluidas - ultima.fasesConcluidas : concluidas;
  const diasDesde = Math.max(0, Math.floor((agora - (ultimaEm ?? p.criadoEm)) / DIA_MS));
  const base: SituacaoSondagem = { devida: false, fasesDesde, diasDesde, ultima, proximaEm: ultimaEm !== undefined && k.aCadaDias > 0 ? ultimaEm + k.aCadaDias * DIA_MS : undefined };
  if (idade !== undefined && idade < k.idadeMinima) return base;
  if (p.sessoesFeitas < 1) return base;
  if (ultimaEm === undefined) return { ...base, devida: true, motivo: 'inicial' };
  if (k.aCadaFases > 0 && fasesDesde >= k.aCadaFases) return { ...base, devida: true, motivo: 'fases' };
  if (k.aCadaDias > 0 && diasDesde >= k.aCadaDias) return { ...base, devida: true, motivo: 'dias' };
  return base;
}

/** Soma itens respondidos em resultado por área. */
export function resultadoPorArea(itens: (ItemSondagem & { area: AreaSondagem })[]): ResultadoSondagem['areas'] {
  const areas: ResultadoSondagem['areas'] = {};
  for (const { area, ...item } of itens) {
    const a: ResultadoAreaSondagem = areas[area] ?? { acertos: 0, total: 0, itens: [] };
    a.total++;
    if (item.acertou) a.acertos++;
    a.itens = [...(a.itens ?? []), item];
    areas[area] = a;
  }
  return areas;
}

/**
 * Guarda uma sondagem feita. A PRIMEIRA também alimenta a Trilha Expressa (regra antiga, pelo `degrau`);
 * as seguintes só registram — uma sondagem periódica nunca acelera nem atrasa a jornada sozinha.
 */
export function registrarSondagem(
  p: Progresso,
  r: { id: string; areas: ResultadoSondagem['areas']; degrau?: number; motivo?: ResultadoSondagem['motivo'] },
  agora: number
): Progresso {
  const primeira = !(p.sondagens ?? []).length && p.expressa.sondagemEm === undefined;
  const motivo = r.motivo ?? (primeira ? 'inicial' : 'adulto');
  const feita: ResultadoSondagem = { id: r.id, em: agora, motivo, faseAtual: p.faseAtual, fasesConcluidas: fasesConcluidas(p).size, areas: r.areas, degrau: r.degrau };
  const q = primeira && r.degrau !== undefined ? aplicarSondagem(p, r.degrau, agora) : p;
  return { ...q, sondagens: [...(p.sondagens ?? []), feita] };
}

export interface EvolucaoArea {
  area: AreaSondagem;
  nome: string;
  /** Uma medida por sondagem que mediu a área, da mais antiga para a mais nova. */
  medidas: { em: number; acertos: number; total: number; proporcao: number }[];
  /** Diferença entre a última e a primeira medida (em proporção); undefined com menos de 2 medidas. */
  variacao?: number;
}

/** Evolução por área ao longo das sondagens (para o adulto comparar "antes × agora"). */
export function evolucaoSondagens(p: Pick<Progresso, 'sondagens'>): EvolucaoArea[] {
  return AREAS_SONDAGEM.map(({ id, nome }) => {
    const medidas = (p.sondagens ?? [])
      .filter((s) => s.areas[id] && s.areas[id]!.total > 0)
      .map((s) => ({ em: s.em, acertos: s.areas[id]!.acertos, total: s.areas[id]!.total, proporcao: s.areas[id]!.acertos / s.areas[id]!.total }));
    return { area: id, nome, medidas, variacao: medidas.length >= 2 ? medidas[medidas.length - 1].proporcao - medidas[0].proporcao : undefined };
  });
}
