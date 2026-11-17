/**
 * CATÁLOGO DE TODOS OS ÁUDIOS que a plataforma toca (Área do administrador › Áudios), cada um com o texto ao lado.
 *
 * Fontes (as mesmas que os serviços de áudio usam para tocar):
 *  - public/audio/sons/mapa.json  + lista do Estúdio de sons (SONS_DO_ESTUDIO): som puro de cada letra
 *    (inclusive os que ainda não têm clipe publicado: R fraco, LH, NH);
 *  - public/audio/falas/manifesto.json ("voz|trecho" → arquivo): tudo o que a Sofia e o Tales dizem — nome da letra
 *    ("Letra B.", "B, de bola."), palavras, sílabas, frases; as falas de outros personagens (Bolota, Dona Cida…)
 *    são ditas pela dupla (D029 §5);
 *  - packages/conteudo/src/falas.json (todas as falas do conteúdo, com a fase de origem): dá a fase de cada trecho
 *    e lista as falas que AINDA NÃO TÊM clipe (pendentes), que também podem ganhar áudio pela Área do administrador;
 *  - public/audio/nomes/manifesto.json: nomes das crianças nas duas vozes;
 *  - arquivos tocados pelo caminho (assets/audio/…).
 * Arquivo puro: as entradas chegam já lidas (a tela busca os manifestos; o teste passa objetos).
 */
import { idArquivo, idFala, idNome, idSom } from './substituicoes.ts';

export type TipoAudio = 'som-letra' | 'nome-letra' | 'palavra' | 'silaba' | 'frase' | 'som-dupla' | 'nome-crianca' | 'outro';
export const ROTULO_TIPO_AUDIO: Record<TipoAudio, string> = {
  'som-letra': 'Som puro da letra',
  'nome-letra': 'Nome da letra',
  palavra: 'Palavra',
  silaba: 'Sílaba',
  frase: 'Frase / fala',
  'som-dupla': 'Som dito pela dupla',
  'nome-crianca': 'Nome da criança',
  outro: 'Outro áudio'
};

export interface ItemCatalogo {
  id: string;
  tipo: TipoAudio;
  /** O que o áudio diz (legenda que aparece ao lado). */
  texto: string;
  /** Explicação curta (como fazer o som, onde aparece…). */
  detalhe?: string;
  voz?: 'sofia' | 'tales';
  /** Quem "diz" a fala no conteúdo (bolota, dona-cida…), quando não é a própria dupla. */
  personagem?: string;
  /** Caminho do clipe original (relativo à pasta publicada) ou null se ainda não há áudio. */
  arquivo: string | null;
  /** Letras ligadas a este áudio (para filtrar por letra). */
  letras: string[];
  /** Fases/telas onde o áudio aparece (origem no falas.json). */
  fases: string[];
  /** Situação na auditoria (só o que pede atenção). */
  auditoria?: 'grave' | 'conferir';
  /** Ordem dentro do tipo (letras na ordem A–Z). */
  ordem?: number;
}

export interface SomDoEstudio { fonema: string; rotulo: string; exemplo: string; como: string }
export interface EntradasCatalogo {
  sons: SomDoEstudio[];
  mapaSons: { fonemas: Record<string, { arquivo: string; estado?: string; ipa?: string; letras?: string[]; origem?: string }> } | null;
  falas: Record<string, string>;
  nomes: { sofia?: string[]; tales?: string[]; arquivos?: Record<string, Record<string, string>> };
  falasConteudo: { voz: string; texto: string; origem: string }[];
  palavrasConhecidas: Set<string>;
  /** arquivo ("falas/x.mp3") → gravidade, só o que não está ok. */
  auditoria?: Record<string, 'grave' | 'conferir'>;
  extras?: { caminho: string; texto: string; detalhe?: string }[];
  /** Mesma regra de voz.ts › chaveTrecho (injetada para não puxar o serviço de voz). */
  chaveTrecho: (t: string) => string;
}

const RE_LETRA = /^Letra ([A-ZÇ]{1,2})\.$/;
const RE_CHAVE = /^([A-ZÇ]{1,2}), de ([\p{L}]+)\.$/u;
const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Classifica um trecho falado pela dupla. */
export function classificarTrecho(t: string, palavras: Set<string>): { tipo: TipoAudio; letras: string[] } {
  const m1 = RE_LETRA.exec(t);
  if (m1) return { tipo: 'nome-letra', letras: [m1[1]] };
  const m2 = RE_CHAVE.exec(t);
  if (m2) return { tipo: 'nome-letra', letras: [m2[1]] };
  const limpo = t.replace(/\.$/, '');
  const so = limpo.replace(/[^\p{L}]/gu, '').toLowerCase();
  // "mmmm", "éééé", "rrrrá": som esticado dito pela dupla
  if (so.length >= 3 && /^(\p{L})\1{2,}/u.test(so) && limpo === limpo.toLowerCase()) return { tipo: 'som-dupla', letras: [semAcento(so[0]).toUpperCase()] };
  if (/^[\p{Ll}]+$/u.test(limpo)) {
    const letra = semAcento(limpo[0]).toUpperCase();
    if (palavras.has(limpo)) return { tipo: 'palavra', letras: [letra] };
    return { tipo: limpo.length <= 3 ? 'silaba' : 'palavra', letras: [letra] };
  }
  return { tipo: 'frase', letras: [] };
}

/** Letra da fase de origem ("S-LETRA-M", "AL-M-C2", "AL-M" → "M"). */
export function letraDaOrigem(o: string): string | null {
  const m = /^(?:S-LETRA-|AL-)([A-Z])(?:-|$)/.exec(o);
  return m ? m[1] : null;
}

export function montarCatalogo(e: EntradasCatalogo): ItemCatalogo[] {
  const out: ItemCatalogo[] = [];
  // 1) som puro das letras
  const letrasDoFonema = new Map<string, string[]>();
  e.sons.forEach((s, i) => {
    const pub = e.mapaSons?.fonemas[s.fonema];
    const letras = s.rotulo.split(/[·\s]+/).filter((x) => /^[A-ZÇ]{1,2}$/.test(x));
    letrasDoFonema.set(s.fonema, letras);
    out.push({
      id: idSom(s.fonema), tipo: 'som-letra', texto: `${s.rotulo}: ${s.como}`, detalhe: `Exemplo: ${s.exemplo}${pub?.ipa ? ` · ${pub.ipa}` : ''}${pub?.estado === 'duvidoso' ? ' · clipe atual marcado como duvidoso' : ''}${pub?.origem ? ` · ${pub.origem}` : ''}`,
      arquivo: pub ? `audio/sons/${pub.arquivo}` : null, letras, fases: [], ordem: i
    });
  });
  // 2) falas da dupla (com a fase de origem tirada do conteúdo)
  const origens = new Map<string, Set<string>>();
  const personagens = new Map<string, string>();
  const pendentes = new Map<string, { voz: string; k: string }>();
  for (const f of e.falasConteudo) {
    for (const parte of f.texto.split('[NOME]')) {
      const k = e.chaveTrecho(parte);
      if (!k) continue;
      const chave = `${f.voz}|${k}`;
      (origens.get(chave) ?? origens.set(chave, new Set()).get(chave)!).add(f.origem);
      if (/bolota/i.test(f.origem)) personagens.set(chave, 'bolota');
      if (!e.falas[chave]) pendentes.set(chave, { voz: f.voz, k });
    }
  }
  const umaFala = (chave: string, arquivo: string | null) => {
    const i = chave.indexOf('|');
    const voz = chave.slice(0, i) as 'sofia' | 'tales';
    const texto = chave.slice(i + 1);
    const c = classificarTrecho(texto, e.palavrasConhecidas);
    const fases = [...(origens.get(chave) ?? [])].sort();
    const letras = new Set(c.letras);
    for (const o of fases) { const l = letraDaOrigem(o); if (l && (c.tipo === 'frase' || c.tipo === 'nome-letra')) letras.add(l); }
    out.push({
      id: idFala(voz, texto), tipo: c.tipo, texto, voz, personagem: personagens.get(chave), arquivo: arquivo ? `audio/falas/${arquivo}` : null,
      letras: [...letras], fases, auditoria: arquivo ? e.auditoria?.[`falas/${arquivo}`] : undefined,
      detalhe: arquivo ? undefined : 'Ainda sem áudio: hoje o texto só aparece escrito.'
    });
  };
  for (const [chave, arq] of Object.entries(e.falas)) umaFala(chave, arq);
  for (const [chave] of pendentes) umaFala(chave, null);
  // 3) nomes das crianças
  for (const voz of ['sofia', 'tales'] as const) {
    for (const n of e.nomes[voz] ?? []) {
      const arq = e.nomes.arquivos?.[voz]?.[n] ?? `${n}.mp3`;
      out.push({ id: idNome(voz, n), tipo: 'nome-crianca', texto: n, voz, arquivo: `audio/nomes/${voz}/${arq}`, letras: [semAcento(n[0] ?? '').toUpperCase()], fases: [], auditoria: e.auditoria?.[`nomes/${voz}/${arq}`] });
    }
  }
  // 4) outros arquivos
  for (const x of e.extras ?? []) out.push({ id: idArquivo(x.caminho), tipo: 'outro', texto: x.texto, detalhe: x.detalhe, arquivo: x.caminho, letras: [], fases: [] });
  return out;
}

export interface FiltroCatalogo { busca?: string; tipo?: TipoAudio | ''; voz?: string; letra?: string; fase?: string; so?: 'trocados' | 'pendentes' | 'auditoria' | ''; trocados?: Set<string> }
export function filtrarCatalogo(itens: ItemCatalogo[], f: FiltroCatalogo): ItemCatalogo[] {
  const q = semAcento((f.busca ?? '').trim().toLowerCase());
  return itens.filter((it) => {
    if (f.tipo && it.tipo !== f.tipo) return false;
    if (f.voz && (f.voz === 'bolota' ? it.personagem !== 'bolota' : it.voz !== f.voz)) return false;
    if (f.letra && !it.letras.includes(f.letra)) return false;
    if (f.fase && !it.fases.some((o) => o.startsWith(f.fase!))) return false;
    if (f.so === 'trocados' && !f.trocados?.has(it.id)) return false;
    if (f.so === 'pendentes' && it.arquivo) return false;
    if (f.so === 'auditoria' && !it.auditoria) return false;
    if (q && !semAcento(`${it.texto} ${it.detalhe ?? ''} ${it.fases.join(' ')} ${it.arquivo ?? ''}`.toLowerCase()).includes(q)) return false;
    return true;
  });
}

/** Resumo por tipo (para a visão geral). */
export function contarPorTipo(itens: ItemCatalogo[]): Record<TipoAudio, { total: number; semAudio: number; auditoria: number }> {
  const r = Object.fromEntries(Object.keys(ROTULO_TIPO_AUDIO).map((k) => [k, { total: 0, semAudio: 0, auditoria: 0 }])) as Record<TipoAudio, { total: number; semAudio: number; auditoria: number }>;
  for (const it of itens) { r[it.tipo].total++; if (!it.arquivo) r[it.tipo].semAudio++; if (it.auditoria) r[it.tipo].auditoria++; }
  return r;
}
