/**
 * FICHAS DE LEITURA POR CAMPO SEMÂNTICO (D033, pedido do dono; docs/decisoes/033-fichas-de-leitura-por-campo-semantico.md).
 *
 * Cada campo (animais, comidas, casa…) junta palavras do banco com pronúncia anotada (fases/tf-banco.ts) e figura. A ficha
 * mostra para LER só as palavras cujos sons a criança já aprendeu (motor › fichas.ts); as outras ficam trancadas, "em breve",
 * e nunca aparecem escritas para ler (regra 2; docs/pedagogia/05 §3).
 *
 * Os quatro níveis (D033; o "como" é decisão do projeto [DP]):
 *  1. "Vamos ler juntos?": a palavra escrita, sem figura; em cima de cada letra a boquinha faz o som daquela letra NAQUELA
 *     posição (o O final de "pato" mostra a boca do /u/), o som puro toca, um por um; depois emendados; "o que ficou?" →
 *     a criança escolhe a figura entre 3. Ler junto é prática guiada (exposição); a escolha final é a leitura avaliada.
 *  2. Só o som (letra por letra e emendado), sem a palavra escrita → escolhe a figura entre 3 (síntese); num degrau acima,
 *     escolhe a palavra ESCRITA entre 3 (todas decodificáveis para a criança).
 *  3. Só as boquinhas (sem som) e as letras soltas → ligar cada letra à boquinha certa. Consciência articulatória (Soares,
 *     Alfaletrar, p. 146, usa o ponto de articulação), habilidade `boca-som`. Só com bocas visualmente DIFERENTES na mesma rodada.
 *  4. Só a sequência de boquinhas (sem som e sem letras) → descobrir a palavra entre 3 figuras, só com palavras cujas
 *     sequências de boca não se confundem entre si.
 *
 * As CLASSES DE BOCA abaixo são a regra das "bocas distinguíveis": sons da mesma classe parecem iguais de frente (a diferença
 * está dentro da boca ou na garganta: /p/ /b/ /m/; /f/ /v/; /t/ /d/ /n/; /k/ /g/; /s/ /z/) e NUNCA ficam na mesma rodada.
 * O agrupamento é conservador [DP]: junta também o que a vista de frente do Espelho do Som (public/espelho/fonemas.js) mostra
 * quase igual (L e o R fraco com o T/D/N; I, E e S/Z no sorriso; CH e J no biquinho do U; K, G e o R forte na boca aberta do A).
 * Posições da boca simplificadas: validar com fonoaudióloga (como o próprio Espelho).
 */
import { BANCO } from './fases/tf-banco.ts';
import { SONS_PUBLICADOS, comSons } from './fases/tf.ts';
import { analisar, grafemas } from './decodificabilidade.ts';

export interface CampoSemantico {
  id: string;
  titulo: string;
  /** Figura da capa do cartão (arquivo em web/public/assets/figuras). */
  capa: string;
  /** Palavras do banco (com figura), na ordem do cartão. */
  palavras: string[];
}

/** Os campos e as palavras de cada um [DP]. Todas estão no banco, com anotação e figura (teste em test/fichas.test.ts). */
export const CAMPOS_SEMANTICOS: CampoSemantico[] = [
  {
    id: 'animais', titulo: 'Animais', capa: 'macaco',
    palavras: ['pato', 'sapo', 'tatu', 'gato', 'galo', 'vaca', 'macaco', 'lobo', 'foca', 'mula', 'lula', 'panda', 'rato', 'peixe', 'leão', 'zebra', 'abelha', 'jacaré', 'cobra', 'elefante', 'formiga', 'ovelha']
  },
  {
    id: 'comidas', titulo: 'Comidas', capa: 'pipoca',
    palavras: ['uva', 'bala', 'bolo', 'suco', 'jaca', 'ovo', 'tomate', 'pipoca', 'pão', 'queijo', 'doce', 'mel', 'feijão', 'sorvete', 'abacaxi']
  },
  {
    id: 'casa', titulo: 'Coisas da casa', capa: 'panela',
    palavras: ['pia', 'mala', 'lupa', 'tapete', 'copo', 'vela', 'janela', 'panela', 'caneca', 'sacola', 'casa', 'mesa', 'chave', 'porta', 'xícara']
  },
  { id: 'brinquedos', titulo: 'Brinquedos', capa: 'boneca', palavras: ['dado', 'bola', 'boneca', 'peteca', 'ioiô', 'pandeiro', 'tambor', 'carrinho', 'urso'] },
  { id: 'familia', titulo: 'Família e corpo', capa: 'vovo-f', palavras: ['papai', 'dedo', 'pé', 'vovó', 'vovô', 'mamãe', 'mão', 'olho', 'unha'] },
  { id: 'natureza', titulo: 'Natureza', capa: 'lua', palavras: ['lua', 'fogo', 'sol', 'nuvem', 'chuva', 'folha', 'estrela', 'ilha', 'concha', 'poça'] }
];
export const CAMPO_POR_ID: Record<string, CampoSemantico> = Object.fromEntries(CAMPOS_SEMANTICOS.map((c) => [c.id, c]));
/** Todas as palavras das fichas (sem repetição). */
export const PALAVRAS_DAS_FICHAS: string[] = [...new Set(CAMPOS_SEMANTICOS.flatMap((c) => c.palavras))];

/** Falas das fichas. As que ainda não têm clipe estão em app/docs/falas-pendentes.md (§ Fichas de leitura). */
export const FALAS_FICHAS = {
  /** clipe existente, no lugar de "Vamos ler juntos?" */
  lerJuntos: 'Agora vamos ler juntos, em voz alta.',
  olhaBoca: 'Olha a minha boca fazendo o som.',
  junta: 'Agora junte os sons.',
  rapido: 'Mais rápido!',
  /** clipe existente, no lugar de "O que ficou?" */
  oQueFicou: 'Que palavra os sons formaram?',
  bocaDiferente: 'Olha a boca: ela se mexe diferente em cada som.',
  /** SEM clipe ainda (pendentes): ficam no balão, a dupla fica calada */
  ligar: 'Ligue cada letra à boquinha que faz o som dela.',
  qualPalavraBoca: 'Que palavra a boquinha falou?',
  escuta: 'Escute os sons e descubra a palavra.'
} as const;

/* ------------------------------------------------------------------------------------------------------------ */
/* sons e bocas de cada palavra                                                                                  */
/* ------------------------------------------------------------------------------------------------------------ */

/**
 * Classes de boca vistas de frente [DP] (ver o comentário do topo). Chave = fonema do mapa de sons (web/public/audio/sons).
 */
export type ClasseBoca = 'labios-fechados' | 'dente-no-labio' | 'lingua-em-cima' | 'sorriso' | 'biquinho' | 'redonda' | 'aberta';
export const CLASSE_DA_BOCA: Record<string, ClasseBoca> = {
  p: 'labios-fechados', b: 'labios-fechados', m: 'labios-fechados',
  f: 'dente-no-labio', v: 'dente-no-labio',
  t: 'lingua-em-cima', d: 'lingua-em-cima', n: 'lingua-em-cima', l: 'lingua-em-cima', r: 'lingua-em-cima',
  s: 'sorriso', z: 'sorriso', i: 'sorriso', 'i~': 'sorriso', e: 'sorriso', 'e~': 'sorriso', E: 'sorriso',
  u: 'biquinho', 'u~': 'biquinho', x: 'biquinho', j: 'biquinho',
  o: 'redonda', 'o~': 'redonda', O: 'redonda',
  a: 'aberta', 'a~': 'aberta', k: 'aberta', g: 'aberta', rr: 'aberta'
};
/** Como a boca fica, em palavras de criança (legenda pequena na correção). */
export const DESCRICAO_DA_BOCA: Record<ClasseBoca, string> = {
  'labios-fechados': 'lábios fechados', 'dente-no-labio': 'dente no lábio', 'lingua-em-cima': 'língua lá em cima', sorriso: 'sorriso',
  biquinho: 'biquinho', redonda: 'boca redonda', aberta: 'boca bem aberta'
};
export const classeDaBoca = (fonema: string): ClasseBoca | undefined => CLASSE_DA_BOCA[fonema];

/** Os sons de uma rodada podem ficar juntos? Nenhuma classe de boca repetida (nunca /t/×/d/×/n/, /f/×/v/, /p/×/b/×/m/…). */
export function bocasDistinguiveis(fonemas: string[]): boolean {
  const cs = fonemas.map(classeDaBoca);
  if (cs.some((c) => !c)) return false;
  return new Set(cs).size === cs.length;
}

/** Um pedaço da palavra para a ficha: as letras (1 ou 2, nos dígrafos) e o som que fazem ali (`null` = letra calada). */
export interface PedacoFicha { letras: string; fonema: string | null }

/** A palavra em pedaços (grafemas), cada um com o som daquela posição (o O final de "pato" → /u/), pela anotação do banco. */
export function pedacosDaPalavra(palavra: string): PedacoFicha[] {
  const w = palavra.toLowerCase();
  const sons = comSons(w).sons;
  return grafemas(w).map((g) => ({ letras: g.g.toUpperCase(), fonema: sons[g.i] ?? null }));
}

/** Sons da palavra (fonemas do mapa, sem as letras caladas). */
const SONS_CACHE = new Map<string, string[]>();
export function sonsDaFicha(palavra: string): string[] {
  const w = palavra.toLowerCase();
  let s = SONS_CACHE.get(w);
  if (!s) { s = pedacosDaPalavra(w).map((p) => p.fonema).filter((f): f is string => !!f); SONS_CACHE.set(w, s); }
  return s;
}

/** Todos os sons da palavra já existem como som puro publicado (dá para tocar a ficha inteira)? */
export const fichaTemSons = (palavra: string): boolean => sonsDaFicha(palavra).every((f) => SONS_PUBLICADOS.includes(f));

/** A sequência de bocas da palavra (classe por som). */
export const bocasDaPalavra = (palavra: string): ClasseBoca[] => sonsDaFicha(palavra).map((f) => CLASSE_DA_BOCA[f] ?? 'aberta');

/** Duas palavras se distinguem só pela boca? As sequências de classes de boca são diferentes. */
export function palavrasDistinguiveisPelaBoca(a: string, b: string): boolean {
  return bocasDaPalavra(a).join('|') !== bocasDaPalavra(b).join('|');
}

/** Som anotado (IPA do banco) → fonema do mapa de sons (o mesmo de fases/tf.ts › comSons). */
const FONEMA_DO_SOM: Record<string, string> = {
  a: 'a', e: 'e', ɛ: 'E', i: 'i', o: 'o', ɔ: 'O', u: 'u', m: 'm', n: 'n', f: 'f', v: 'v', s: 's', z: 'z', ʃ: 'x', ʒ: 'j', l: 'l',
  R: 'rr', ɾ: 'r', p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g'
};

/**
 * Pares letra ↔ som que valem para o nível 3 (letras soltas): o som PRINCIPAL da letra, sem as variações de posição que
 * confundiriam a letra sozinha (O e E do fim soando U e I, T e D antes de I, vogal nasal, letra calada, dígrafo).
 */
export function letrasComSomPrincipal(palavra: string): { letra: string; fonema: string }[] {
  const e = BANCO[palavra.toLowerCase()];
  if (!e) return [];
  const out: { letra: string; fonema: string }[] = [];
  for (const g of analisar(e).grafemas) {
    if (g.g.length !== 1 || g.sons.length !== 1) continue;
    if (['o-final-u', 'e-final-i', 'ti-di', 'ditongo', 'ditongo-ou', 'e-reduzido', 'o-reduzido', 'l-final', 's-final', 'r-final'].includes(g.valor)) continue;
    const fonema = FONEMA_DO_SOM[g.sons[0]];
    if (fonema && !out.some((x) => x.letra === g.g.toUpperCase())) out.push({ letra: g.g.toUpperCase(), fonema });
  }
  return out;
}
