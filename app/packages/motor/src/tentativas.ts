/**
 * Registro detalhado de tentativas (D030, etapa 2): o que cada tentativa PROVA.
 * O contrato dos campos está em estado.ts (`DetalheTentativa`). Aqui ficam as regras puras:
 * qual mecânica é avaliada, exposição ou autorrelato, e como completar dados antigos (sem os campos novos).
 */
import { FASES } from '@fonema/conteudo';
import type { Cena } from '@fonema/conteudo';
import type { DetalheTentativa, MecanicaTentativa, Tentativa, TipoTentativa } from './estado.ts';

/**
 * Padrão por mecânica (decisão do projeto, D030 etapa 5). A mecânica pode informar outro `tipo` na própria tentativa
 * (ex.: um Traçar que passe a conferir o traço pode gravar `tipo: 'avaliada'`).
 */
export const TIPO_POR_MECANICA: Partial<Record<MecanicaTentativa, TipoTentativa>> = {
  escolher: 'avaliada',
  ligar: 'avaliada',
  montar: 'avaliada',
  ditado: 'avaliada',
  palmas: 'avaliada',
  sondagem: 'avaliada',
  letra: 'exposicao',
  espelho: 'exposicao',
  tracar: 'exposicao',
  pausa: 'exposicao',
  falar: 'autorrelato'
};

let mapaCenas: Map<string, MecanicaTentativa> | undefined;

/** Mecânica de uma cena pelo id (conteúdo publicado + cenas montadas pelo motor: Jardim da Revisão e pausa ativa). */
export function mecanicaDaCena(cenaId: string | undefined): MecanicaTentativa | undefined {
  if (!cenaId) return undefined;
  if (!mapaCenas) {
    mapaCenas = new Map();
    for (const f of FASES) for (const c of f.cenas) if (c.atividade) mapaCenas.set(c.id, c.atividade.tipo);
  }
  const m = mapaCenas.get(cenaId);
  if (m) return m;
  if (cenaId.endsWith('-C6-pausa')) return 'pausa';
  if (/-C1-revisao(-\d+)?$/.test(cenaId)) return 'escolher';
  return undefined;
}

/** Padrão da mecânica; mecânica nova ainda sem regra = 'avaliada' (ela deve informar o `tipo` se não conferir a resposta). */
export function tipoPadrao(m: MecanicaTentativa | undefined): TipoTentativa {
  return (m && TIPO_POR_MECANICA[m]) || 'avaliada';
}

/** Aceita o apelido 'resposta' (usado no conteúdo, `TipoRegistro`) como 'avaliada'. */
function tipoInformado(tipo: string | undefined): TipoTentativa | undefined {
  if (tipo === 'resposta' || tipo === 'avaliada') return 'avaliada';
  if (tipo === 'exposicao' || tipo === 'autorrelato') return tipo;
  return undefined;
}

export function mecanicaDaTentativa(t: Pick<Tentativa, 'mecanica' | 'cena'>): MecanicaTentativa | undefined {
  return t.mecanica ?? mecanicaDaCena(t.cena);
}

/**
 * Tipo da tentativa: o que a mecânica gravou; senão, o padrão da mecânica (pela cena, para dados antigos).
 * Cena desconhecida (conteúdo que já saiu do ar) = 'avaliada', como era antes da D030: na dúvida não se apaga evidência.
 */
export function tipoDaTentativa(t: Pick<Tentativa, 'tipo' | 'mecanica' | 'cena'>): TipoTentativa {
  return tipoInformado(t.tipo) ?? tipoPadrao(mecanicaDaTentativa(t));
}

/** Conta para o domínio? Só tentativa AVALIADA (a criança respondeu e o app conferiu). */
export function ehAvaliada(t: Pick<Tentativa, 'tipo' | 'mecanica' | 'cena'>): boolean {
  return tipoDaTentativa(t) === 'avaliada';
}

/** Acerto que vale como evidência: avaliado, certo e sem ajuda. */
export function acertoSozinho(t: Tentativa): boolean {
  return ehAvaliada(t) && t.acertou && !t.comAjuda;
}

/** Junta o detalhe a uma tentativa (sem apagar o que já existe). */
export function detalharTentativa(t: Tentativa, d: DetalheTentativa): Tentativa {
  return { ...t, ...Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)) };
}

/**
 * Completa a tentativa na ENTRADA do motor (jornada.ts › aplicarAtividade): grava `mecanica` e `tipo` (para a
 * classificação não mudar se o conteúdo mudar depois), `tentativaNumero` e `escolhido` quando dá para deduzir.
 */
export function normalizarTentativa(t: Tentativa, cena?: Pick<Cena, 'id' | 'atividade' | 'tipo'>): Tentativa {
  const mecanica = t.mecanica ?? cena?.atividade?.tipo ?? mecanicaDaCena(t.cena ?? cena?.id);
  const tipo = tipoInformado(t.tipo) ?? tipoPadrao(mecanica);
  const out: Tentativa = { ...t, tipo };
  if (mecanica) out.mecanica = mecanica;
  if (!out.cena && cena) out.cena = cena.id;
  if (out.escolhido === undefined && out.respostas?.length) out.escolhido = out.respostas[0];
  if (out.escolhido === undefined && out.alvo !== undefined && t.acertou && !t.comAjuda) out.escolhido = out.alvo;
  if (out.tentativaNumero === undefined && out.respostas?.length) out.tentativaNumero = out.respostas.length;
  if (out.tempoMs !== undefined && !(out.tempoMs >= 0 && Number.isFinite(out.tempoMs))) delete out.tempoMs;
  return out;
}

/** Respostas ERRADAS do item (para a matriz de confusão): todas as de `respostas` diferentes do alvo, ou o `escolhido`. */
export function respostasErradas(t: Tentativa): string[] {
  if (t.alvo === undefined) return [];
  if (t.respostas?.length) return t.respostas.filter((r) => r !== t.alvo);
  return t.escolhido !== undefined && t.escolhido !== t.alvo ? [t.escolhido] : [];
}
