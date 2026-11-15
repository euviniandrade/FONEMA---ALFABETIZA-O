/**
 * Itens da SONDAGEM PERIÓDICA em blocos (D030, etapa 9; docs/pedagogia/06 §3).
 *
 * Cinco blocos curtos, em forma de brincadeira, sem dica e sem ajuda: sons das letras (ouve o som → toca a letra),
 * leitura de palavras (lê → toca a figura), pseudopalavras CONFERIDAS (vê o "nome de bichinho" escrito, ouve três
 * leituras e escolhe), segmentação (ouve a palavra → quantos sons ela tem) e ditado (ouve → monta com letras móveis).
 *
 * Regra 2 do CLAUDE.md (docs/pedagogia/05 §3): palavra para LER ou ESCREVER só entra se TODAS as letras já tiveram o
 * som ensinado (fase concluída) e todos os valores sonoros dela já foram ensinados. Palavra só OUVIDA (segmentação)
 * é livre (05 §3), mas usamos só palavras em que cada letra é um som (sem dígrafo, sem letra muda).
 * Bloco sem item possível fica de fora (a área fica "não medida", nunca zero).
 *
 * Os bancos abaixo só têm palavras com clipe gravado e aprovado na voz da Sofia (o teste confere no manifesto),
 * figura 3D publicada (leitura) e, nas pseudopalavras, as leituras aprovadas na auditoria (docs/auditoria-audio.md).
 * Quantidades de itens por bloco = decisão do projeto (curta: ~15 respostas, poucos minutos).
 */
import { FASES, LETRA_POR_ID, SONS_PARECIDOS, PARES_DE_VOZ, VALORES_ENSINADOS, VALORES_SO_AVISO, usaSomReal, valoresDaPalavra } from '@fonema/conteudo';
import type { RegiaoId, ValorSonoro } from '@fonema/conteudo';
import type { AreaSondagem, Progresso } from './estado.ts';
import { fasesConcluidas } from './sequencia.ts';

/** Palavras para LER (com figura) e ESCREVER (ditado). Todas com clipe da Sofia e figura em assets/figuras. */
export const PALAVRAS_SONDAGEM = ['FACA', 'VACA', 'UVA', 'LUA', 'MALA', 'FILA', 'LULA', 'MULA', 'JACA', 'TATU', 'BOLA', 'MOLA', 'RODA', 'DEDO'] as const;
/** Pseudopalavras conferidas: a escrita, a leitura certa e duas leituras erradas (todas com clipe aprovado). */
export const PSEUDOS_SONDAGEM: { mostrar: string; certa: string; erradas: [string, string] }[] = [
  { mostrar: 'LIFU', certa: 'lifu', erradas: ['lifa', 'mifa'] },
  { mostrar: 'MIFA', certa: 'mifa', erradas: ['mufa', 'lifa'] },
  { mostrar: 'MUFA', certa: 'mufa', erradas: ['mifa', 'mula'] }
];
/** Segmentação (palavra só ouvida): os sons de cada palavra, na ordem. */
export const SEGMENTACAO_SONDAGEM: { palavra: string; sons: string[] }[] = [
  { palavra: 'lua', sons: ['l', 'u', 'a'] },
  { palavra: 'uva', sons: ['u', 'v', 'a'] },
  { palavra: 'ovo', sons: ['o', 'v', 'u'] },
  { palavra: 'mala', sons: ['m', 'a', 'l', 'a'] },
  { palavra: 'faca', sons: ['f', 'a', 'k', 'a'] },
  { palavra: 'vaca', sons: ['v', 'a', 'k', 'a'] },
  { palavra: 'bola', sons: ['b', 'O', 'l', 'a'] },
  { palavra: 'tatu', sons: ['t', 'a', 't', 'u'] },
  { palavra: 'sapato', sons: ['s', 'a', 'p', 'a', 't', 'u'] }
];
/** Exemplo feito pela dupla antes de valer (docs/pedagogia/04 §1 R12): não conta. */
export const EXEMPLO_SEGMENTACAO = SEGMENTACAO_SONDAGEM[0];

/** Itens por bloco (decisão do projeto). */
export const ITENS_POR_BLOCO: Record<AreaSondagem, number> = { 'sons-letras': 4, 'leitura-palavras': 3, pseudopalavras: 3, segmentacao: 3, ditado: 3 };

export interface ItemDaSondagem {
  area: AreaSondagem;
  /** A resposta certa: letra (sons), palavra em minúsculas (leitura/pseudo), número de sons (segmentação), palavra em maiúsculas (ditado). */
  alvo: string;
  /** Sons das letras: o fonema tocado (som puro, nunca o nome da letra). */
  somAlvo?: string;
  /** Palavra falada pela Sofia (segmentação, ditado). */
  ouvir?: string;
  /** Palavra escrita na tela (leitura, pseudopalavras). */
  mostrar?: string;
  /** Opções na ORDEM DA TELA (já sorteada). Vazio no ditado. */
  opcoes: string[];
  /** Ditado: as letras móveis da bandeja (as da palavra + parecidas), já embaralhadas. */
  bandeja?: string[];
  /** Segmentação: os sons da palavra (para a correção mostrar depois, no painel). */
  sons?: string[];
}

export interface BlocoSondagem { area: AreaSondagem; itens: ItemDaSondagem[] }
export interface PlanoSondagem {
  blocos: BlocoSondagem[];
  /** Letras cujo som a criança já estudou (base do filtro de decodificabilidade). */
  letrasVistas: string[];
  /** Valores sonoros além do som principal já ensinados (É, Ó…). */
  valores: ValorSonoro[];
  total: number;
}

/* ------------------------------ o que a criança já viu ------------------------------ */

const HAB_LETRA = /^(?:letra|vogal|gpc)-([a-z])$/;

/**
 * Letras cujo SOM já foi ensinado numa fase CONCLUÍDA: letra da Trilha A–Z (só as que usam o som real),
 * vogais da Ilha das Vogais, M/L/F do Vale. Fases novas que seguirem o padrão de habilidade `gpc-x`/`letra-x` entram sozinhas.
 */
export function letrasComSomVisto(p: Progresso): string[] {
  const out = new Set<string>();
  const feitas = fasesConcluidas(p);
  for (const f of FASES) {
    if (!feitas.has(f.id)) continue;
    for (const h of f.habilidades) {
      if (h === 'vogais') ['A', 'E', 'I', 'O', 'U'].forEach((l) => out.add(l));
      const m = HAB_LETRA.exec(h);
      if (!m) continue;
      const L = m[1].toUpperCase();
      const info = LETRA_POR_ID[L];
      if (h.startsWith('letra-') && info && !usaSomReal(info)) continue;
      out.add(L);
    }
  }
  return [...out].sort();
}

/**
 * Valores sonoros (além do som principal) já ensinados. `VALORES_ENSINADOS` é por REGIÃO (o que se sabe ao fim dela),
 * então, para não liberar cedo demais, a região só conta quando TODAS as fases dela estão concluídas.
 */
export function valoresEnsinadosAte(p: Progresso): ValorSonoro[] {
  const feitas = fasesConcluidas(p);
  const todas = [...new Set(FASES.map((f) => f.regiao))];
  const regioes = new Set<RegiaoId>(todas.filter((r) => FASES.filter((f) => f.regiao === r).every((f) => feitas.has(f.id))));
  return [...new Set([...regioes].flatMap((r) => VALORES_ENSINADOS[r] ?? []))];
}

/** A palavra pode ser LIDA/ESCRITA na sondagem? Todas as letras com som visto e todos os valores ensinados (sem "só aviso"). */
export function palavraPermitidaNaSondagem(palavra: string, letras: string[], valores: ValorSonoro[]): boolean {
  const w = palavra.toUpperCase();
  if (![...w].every((ch) => letras.includes(ch))) return false;
  return valoresDaPalavra(w).every((v) => valores.includes(v) && !VALORES_SO_AVISO.includes(v));
}

/* ------------------------------ sorteio determinístico ------------------------------ */

function gerador(semente: number): () => number {
  let a = semente >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function embaralhar<T>(xs: readonly T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Põe a certa numa posição sorteada, sem repetir a posição do item anterior (docs/pedagogia/04 §1 R5). */
function posicionar(certa: string, outras: string[], r: () => number, anterior: { pos: number }): string[] {
  const n = outras.length + 1;
  let pos = Math.floor(r() * n);
  if (pos === anterior.pos && n > 1) pos = (pos + 1 + Math.floor(r() * (n - 1))) % n;
  anterior.pos = pos;
  const op = embaralhar(outras, r);
  op.splice(pos, 0, certa);
  return op;
}

/** Quantas letras iguais na mesma posição (para o distrator mudar só uma letra: R7). */
function parecenca(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) n++;
  return n - Math.abs(a.length - b.length);
}

/* ------------------------------ os blocos ------------------------------ */

function blocoSons(letras: string[], r: () => number): ItemDaSondagem[] {
  const comSom = letras.filter((l) => LETRA_POR_ID[l]?.fonema && usaSomReal(LETRA_POR_ID[l]));
  if (comSom.length < 3) return [];
  const fon = (l: string) => LETRA_POR_ID[l].fonema!;
  const ant = { pos: -1 };
  return embaralhar(comSom, r).slice(0, ITENS_POR_BLOCO['sons-letras']).map((alvo) => {
    // distratores: primeiro a letra de som parecido (p/b, f/v, m/n…), depois qualquer outra; nunca o mesmo som
    const parecidas = new Set<string>([
      ...SONS_PARECIDOS.filter((g) => g.includes(alvo)).flat(),
      ...PARES_DE_VOZ.filter((par) => par.includes(fon(alvo).toLowerCase())).flat().map((x) => x.toUpperCase())
    ]);
    const outras = comSom.filter((l) => l !== alvo && fon(l) !== fon(alvo));
    const ordem = [...embaralhar(outras.filter((l) => parecidas.has(l)), r), ...embaralhar(outras.filter((l) => !parecidas.has(l)), r)];
    return { area: 'sons-letras' as const, alvo, somAlvo: fon(alvo), opcoes: posicionar(alvo, ordem.slice(0, 2), r, ant) };
  });
}

function blocoLeitura(letras: string[], valores: ValorSonoro[], r: () => number): ItemDaSondagem[] {
  const pode = PALAVRAS_SONDAGEM.filter((w) => palavraPermitidaNaSondagem(w, letras, valores));
  const ant = { pos: -1 };
  return embaralhar(pode, r).slice(0, ITENS_POR_BLOCO['leitura-palavras']).map((w) => {
    // figuras distratoras: as palavras mais parecidas na escrita (FACA × VACA; MALA × MULA), para não ler só a 1ª letra
    const outras = PALAVRAS_SONDAGEM.filter((x) => x !== w)
      .map((x) => ({ x, k: parecenca(w, x) + r() * 0.5 }))
      .sort((a, b) => b.k - a.k)
      .slice(0, 2)
      .map((o) => o.x.toLowerCase());
    return { area: 'leitura-palavras' as const, alvo: w.toLowerCase(), mostrar: w, opcoes: posicionar(w.toLowerCase(), outras, r, ant) };
  });
}

function blocoPseudo(letras: string[], r: () => number): ItemDaSondagem[] {
  const ant = { pos: -1 };
  return embaralhar(PSEUDOS_SONDAGEM.filter((s) => [...s.mostrar].every((ch) => letras.includes(ch))), r)
    .slice(0, ITENS_POR_BLOCO.pseudopalavras)
    .map((s) => ({ area: 'pseudopalavras' as const, alvo: s.certa, mostrar: s.mostrar, opcoes: posicionar(s.certa, [...s.erradas], r, ant) }));
}

/** Segmentação: só ouvida (livre), com 2 a 5 sons de opção; o exemplo (lua) fica de fora dos itens que valem. */
export const OPCOES_SEGMENTACAO = ['2', '3', '4', '5'];
function blocoSegmentacao(r: () => number): ItemDaSondagem[] {
  const banco = SEGMENTACAO_SONDAGEM.filter((s) => s !== EXEMPLO_SEGMENTACAO && s.sons.length <= 5);
  // um de 3 sons e os outros de 4 (variação de resposta), em ordem sorteada
  const tres = embaralhar(banco.filter((s) => s.sons.length === 3), r).slice(0, 1);
  const quatro = embaralhar(banco.filter((s) => s.sons.length === 4), r).slice(0, ITENS_POR_BLOCO.segmentacao - tres.length);
  return embaralhar([...tres, ...quatro], r).map((s) => ({ area: 'segmentacao' as const, alvo: String(s.sons.length), ouvir: s.palavra, sons: s.sons, opcoes: OPCOES_SEGMENTACAO }));
}

function blocoDitado(letras: string[], valores: ValorSonoro[], r: () => number, jaLidas: string[]): ItemDaSondagem[] {
  // palavras DIFERENTES das lidas no bloco de leitura (não vale copiar de memória visual)
  const pode = PALAVRAS_SONDAGEM.filter((w) => palavraPermitidaNaSondagem(w, letras, valores) && !jaLidas.includes(w.toLowerCase()));
  return embaralhar(pode, r).slice(0, ITENS_POR_BLOCO.ditado).map((w) => {
    const proprias = [...new Set(w)];
    const parecidas = new Set<string>(SONS_PARECIDOS.filter((g) => g.some((l) => proprias.includes(l))).flat());
    const extras = letras.filter((l) => !proprias.includes(l));
    const dist = [...embaralhar(extras.filter((l) => parecidas.has(l)), r), ...embaralhar(extras.filter((l) => !parecidas.has(l)), r)].slice(0, 3);
    return { area: 'ditado' as const, alvo: w, ouvir: w.toLowerCase(), opcoes: [], bandeja: embaralhar([...w, ...dist], r) };
  });
}

/**
 * Monta a sondagem periódica para esta criança: só com o que ela já estudou. `semente` muda a cada sondagem
 * (itens e posições variam, docs/pedagogia/04 §1 R5–R6); com a mesma semente o plano é o mesmo (teste).
 */
export function montarSondagem(p: Progresso, semente: number): PlanoSondagem {
  const r = gerador(semente);
  const letras = letrasComSomVisto(p);
  const valores = valoresEnsinadosAte(p);
  const leitura = blocoLeitura(letras, valores, r);
  const blocos: BlocoSondagem[] = [
    { area: 'sons-letras', itens: blocoSons(letras, r) },
    { area: 'leitura-palavras', itens: leitura },
    { area: 'pseudopalavras', itens: blocoPseudo(letras, r) },
    { area: 'segmentacao', itens: blocoSegmentacao(r) },
    { area: 'ditado', itens: blocoDitado(letras, valores, r, leitura.map((i) => i.alvo)) }
  ].filter((b) => b.itens.length > 0) as BlocoSondagem[];
  return { blocos, letrasVistas: letras, valores, total: blocos.reduce((n, b) => n + b.itens.length, 0) };
}

/** Confere o ditado: certo só se a criança montou exatamente a palavra (sem nota parcial para a criança). */
export function conferirDitado(alvo: string, escrito: string): boolean {
  return alvo.toUpperCase() === escrito.toUpperCase();
}
