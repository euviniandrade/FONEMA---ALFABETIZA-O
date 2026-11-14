/**
 * Nível da jornada (esforço, nunca desce) e títulos neutros pela ação (D019, D022; jogo-completo/07).
 * Curva: 2→6 desafios por nível no começo, 8–14 no meio, até 24 nos níveis finais.
 * Títulos só mudam ao passar um PORTÃO de domínio (chefe de região).
 */

import { FASES } from '@fonema/conteudo';

/** Os desafios da primeira missão levam ao nível 1 (o nível 2 pede 2 desafios DEPOIS dela). */
export const DESAFIOS_NIVEL_1 = FASES[0].cenas.filter((c) => c.atividade).length;

export const TITULOS = [
  { nome: 'Primeiros Sons', inicio: 1, sub: [1, 4, 6] },
  { nome: 'Caça às Sílabas', inicio: 7, sub: [7, 10, 13] },
  { nome: 'Exploração das Palavras', inicio: 16, sub: [16, 19, 22] },
  { nome: 'Leitura da Vila', inicio: 25, sub: [25, 28, 31] },
  { nome: 'Contação de Histórias', inicio: 34, sub: [34, 37, 40] },
  { nome: 'Guarda dos Livros', inicio: 43, sub: [43, 46, 49] },
  { nome: 'Maestria da Leitura', inicio: 52, sub: [52, 55, 58] }
] as const;

/** Portões: para CHEGAR ao nível N é preciso ter vencido este chefe. */
export const PORTOES: Record<number, { fase: string; nome: string }> = {
  7: { fase: 'AL-FESTA', nome: 'Festa do Alfabeto' },
  16: { fase: 'R2a-F05', nome: 'Cachoeira das Sílabas' },
  25: { fase: 'R3-F10', nome: 'Ventania que Embaralha' },
  34: { fase: 'R6-F08', nome: 'Feira do Cordel' },
  43: { fase: 'R8-F07', nome: 'Trem dos Encontros' },
  52: { fase: 'R10-F09', nome: 'Festival de Leitura' }
};

/** Desafios para subir DO nível n-1 PARA o nível n. */
export function custoNivel(n: number): number {
  if (n <= 1) return 0;
  if (n <= 6) return n;
  if (n === 7) return 6;
  if (n <= 10) return 8;
  if (n <= 13) return 9;
  if (n <= 20) return 10;
  if (n <= 25) return 11;
  if (n <= 33) return 12;
  if (n <= 42) return 13;
  if (n <= 52) return 14;
  if (n <= 60) return Math.min(19, 16 + Math.floor((n - 53) / 2));
  return Math.min(24, 20 + Math.floor((n - 61) / 2));
}

export interface InfoNivel {
  nivel: number;
  titulo: string | null;
  /** "I", "II", "III" */
  sub: string;
  /** Estrelas depois do III enquanto o portão não é vencido (III ★1, ★2…). */
  estrelas: number;
  rotulo: string;
  desafiosNoNivel: number;
  custoProximo: number;
  faltam: number;
  /** Portão que segura o próximo título, se houver. */
  portao?: { nome: string; fase: string; nivel: number };
}

export function tituloDoNivel(nivel: number): { titulo: string | null; sub: string } {
  if (nivel < 1) return { titulo: null, sub: '' };
  let atual: (typeof TITULOS)[number] = TITULOS[0];
  for (const t of TITULOS) if (nivel >= t.inicio) atual = t;
  const i = atual.sub.filter((s) => nivel >= s).length;
  return { titulo: atual.nome, sub: ['I', 'II', 'III'][Math.max(0, i - 1)] };
}

export function calcularNivel(desafios: number, missaoInicialFeita: boolean, fasesConcluidas: Set<string>): InfoNivel {
  if (!missaoInicialFeita) {
    return { nivel: 0, titulo: null, sub: '', estrelas: 0, rotulo: 'Começando', desafiosNoNivel: 0, custoProximo: 0, faltam: 0 };
  }
  let nivel = 1;
  let resto = Math.max(0, desafios - DESAFIOS_NIVEL_1);
  let portao: InfoNivel['portao'];
  for (;;) {
    const n = nivel + 1;
    const custo = custoNivel(n);
    const g = PORTOES[n];
    if (g && !fasesConcluidas.has(g.fase)) {
      portao = { ...g, nivel: n };
      break;
    }
    if (resto >= custo) {
      resto -= custo;
      nivel = n;
    } else break;
  }
  const custoProximo = custoNivel(nivel + 1);
  let estrelas = 0;
  let desafiosNoNivel = resto;
  if (portao && resto >= custoProximo) {
    estrelas = Math.floor(resto / custoProximo);
    desafiosNoNivel = resto % custoProximo;
  }
  const { titulo, sub } = tituloDoNivel(nivel);
  const rotulo = `${titulo} ${sub}${estrelas ? ` ★${estrelas}` : ''}`;
  return { nivel, titulo, sub, estrelas, rotulo, desafiosNoNivel, custoProximo, faltam: custoProximo - desafiosNoNivel, portao };
}
