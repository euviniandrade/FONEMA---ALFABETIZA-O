/**
 * Cópia dos dados do aparelho (Área do Adulto → Configurações): o arquivo que "Guardar uma cópia dos dados"
 * baixa e que "Restaurar uma cópia dos dados" lê de volta. A validação é pura (testada em copia.test.ts):
 * nada é gravado sem o arquivo passar aqui e sem o adulto confirmar.
 */
import type { Crianca, Demonstracao, Evento, Progresso } from '@fonema/motor';
import type { ConfigPlataforma } from '@fonema/conteudo';

export interface CopiaDados {
  exportadoEm: string;
  criancas: Crianca[];
  progressos: Progresso[];
  eventos: Evento[];
  demonstracoes: Demonstracao[];
  config: Partial<ConfigPlataforma>;
}

export type ResultadoCopia =
  | { ok: true; dados: CopiaDados; resumo: { criancas: string[]; exportadoEm: Date | null } }
  | { ok: false; erro: string };

const objeto = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Confere o arquivo de cópia. Aceita texto (o conteúdo do .json) ou o objeto já lido. */
export function validarCopia(entrada: unknown): ResultadoCopia {
  let d: unknown = entrada;
  if (typeof entrada === 'string') {
    try { d = JSON.parse(entrada); } catch { return { ok: false, erro: 'Este arquivo não é uma cópia do FONEMA (não deu para ler).' }; }
  }
  if (!objeto(d)) return { ok: false, erro: 'Este arquivo não é uma cópia do FONEMA.' };
  for (const k of ['criancas', 'progressos', 'eventos', 'demonstracoes'] as const) {
    if (!Array.isArray(d[k])) return { ok: false, erro: 'Este arquivo não é uma cópia do FONEMA (faltam partes).' };
  }
  const criancas = d.criancas as unknown[];
  if (!criancas.length) return { ok: false, erro: 'Esta cópia não tem nenhuma criança cadastrada.' };
  if (!criancas.every((c) => objeto(c) && typeof c.id === 'string' && typeof c.nome === 'string')) return { ok: false, erro: 'A lista de crianças desta cópia está estragada.' };
  const ids = new Set(criancas.map((c) => (c as { id: string }).id));
  const progressos = d.progressos as unknown[];
  if (!progressos.every((p) => objeto(p) && typeof p.criancaId === 'string' && ids.has(p.criancaId))) return { ok: false, erro: 'O progresso desta cópia não combina com as crianças dela.' };
  if (!(d.eventos as unknown[]).every((e) => objeto(e) && typeof e.id === 'string')) return { ok: false, erro: 'Os registros desta cópia estão estragados.' };
  if (!(d.demonstracoes as unknown[]).every((e) => objeto(e) && typeof e.id === 'string')) return { ok: false, erro: 'Os registros desta cópia estão estragados.' };
  const quando = typeof d.exportadoEm === 'string' ? new Date(d.exportadoEm) : null;
  // os áudios não vão na cópia: a marca "(áudio fica só no aparelho)" vira "sem áudio"
  const demonstracoes = (d.demonstracoes as Demonstracao[]).map((x) => (typeof x.audioId === 'string' && x.audioId.startsWith('(') ? { ...x, audioId: undefined } : x));
  return {
    ok: true,
    dados: {
      exportadoEm: typeof d.exportadoEm === 'string' ? d.exportadoEm : '',
      criancas: criancas as Crianca[], progressos: progressos as Progresso[], eventos: d.eventos as Evento[], demonstracoes,
      config: objeto(d.config) ? (d.config as Partial<ConfigPlataforma>) : {}
    },
    resumo: { criancas: criancas.map((c) => (c as { nome: string }).nome), exportadoEm: quando && !Number.isNaN(quando.getTime()) ? quando : null }
  };
}
