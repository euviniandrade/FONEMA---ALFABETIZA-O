/**
 * Nível inicial escolhido pelo adulto (D026, ajusta a D021 §2–3).
 * O padrão é DO ZERO (R0-F01). Quando o adulto escolhe um nível mais adiante, as fases anteriores ficam
 * LIBERADAS: abertas para visitar e revisar, com os selos ainda por conquistar — não contam como concluídas
 * nem como dominadas (o termômetro e os títulos só sobem pelo que a criança fizer de verdade).
 * Dentro do nível escolhido a progressão continua sequencial, uma fase por vez.
 */
import { FASES } from '@fonema/conteudo';
import type { NivelInicial, Progresso, ProgressoFase } from './estado.ts';

export const NIVEIS_INICIAIS: { id: NivelInicial; titulo: string; resumo: string; perguntas: string[] }[] = [
  {
    id: 'zero', titulo: 'Do zero', resumo: 'Começa pelos sons, rimas, sílabas e primeiras letras.',
    perguntas: ['Ainda não conhece todas as letras?', 'Ainda confunde o som das letras?', 'Está na dúvida? Comece por aqui.']
  },
  {
    id: 'letras-e-sons', titulo: 'Já conhece as letras e os sons', resumo: 'Começa em juntar sons e ler sílabas e palavras.',
    perguntas: ['Reconhece as vogais e fala o som de cada uma?', 'Sabe o som de várias letras (não só o nome)?', 'Ainda não lê palavras sem ajuda?']
  },
  {
    id: 'le-palavras', titulo: 'Já lê palavras', resumo: 'Começa lendo palavras sem ajuda, rumo às frases.',
    perguntas: ['Lê palavras simples como MALA e LUA sem ajuda?', 'Junta as sílabas sem precisar soletrar?', 'Quer ganhar fluência e entender o que lê?']
  }
];

/** Fase em que cada nível começa, calculada pelo CONTEÚDO disponível (não é uma lista fixa de ids). */
export function faseInicial(nivel: NivelInicial): string {
  if (nivel === 'letras-e-sons') {
    // primeira fase que junta consoante + vogal (sílaba) ou lê palavras
    const f = FASES.find((x) => x.habilidades.some((h) => h === 'silaba-cv' || h.startsWith('leitura-')));
    if (f) return f.id;
  }
  if (nivel === 'le-palavras') {
    // a fase mais avançada disponível que ainda ensina (o chefe final fica como desafio, depois dela)
    const semChefe = FASES.filter((x) => !x.chefe);
    const f = semChefe[semChefe.length - 1];
    if (f) return f.id;
  }
  return FASES[0].id;
}

/**
 * Aplica (ou muda) o nível inicial. Nunca apaga o que a criança já fez: fases concluídas continuam concluídas,
 * moedinhas, selos e habilidades ficam como estão.
 */
export function aplicarNivelInicial(p: Progresso, nivel: NivelInicial, agora: number): Progresso {
  const inicio = FASES.findIndex((f) => f.id === faseInicial(nivel));
  let atual = FASES.findIndex((f, i) => i >= inicio && p.fases[f.id]?.estado !== 'concluida');
  if (atual < 0) atual = FASES.length - 1;
  const fases: Record<string, ProgressoFase> = {};
  FASES.forEach((f, i) => {
    const a = p.fases[f.id] ?? { estado: 'bloqueada' as const, sessoes: 0 };
    if (a.estado === 'concluida') fases[f.id] = { ...a, liberada: false };
    else if (i < inicio) fases[f.id] = { ...a, estado: 'aberta', liberada: true, abertaEm: a.abertaEm ?? agora };
    else if (i === atual) fases[f.id] = { ...a, estado: 'aberta', liberada: false, abertaEm: a.abertaEm ?? agora };
    else fases[f.id] = { ...a, estado: 'bloqueada', liberada: false };
  });
  return { ...p, nivelInicial: nivel, fases, faseAtual: FASES[atual].id };
}

/** Fases liberadas pelo nível inicial (para a tela mostrar "aberta para revisar"). */
export function fasesLiberadas(p: Progresso): string[] {
  return FASES.filter((f) => p.fases[f.id]?.liberada).map((f) => f.id);
}
