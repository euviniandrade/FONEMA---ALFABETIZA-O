/**
 * TF · TRILHA DOS SONS (D030 etapas 6–8): a trilha fônica que ENSINA A LER. Blocos 1 a 5 de
 * docs/pedagogia/01-escopo-e-sequencia.md: vogais (TF-01…06), consoantes que se prolongam (TF-07…15), consoantes de
 * estouro (TF-16…22), vogais abertas e nasais (TF-23…30) e o R (TF-31, TF-32), com revisões no fim dos blocos 2, 3 e 4.
 * A Trilha A–Z continua como "conhecer as letras".
 *
 * LIÇÃO EM ESPERA (17/11): uma lição só entra na jornada quando TODOS os sons puros que ela toca estão publicados no mapa de
 * sons (`SONS_PUBLICADOS`, igual a web/public/audio/sons/mapa.json) E todas as lições anteriores da trilha também entraram
 * (a ordem de docs/pedagogia/01 não se pula: o que vem depois pode usar o que vem antes). As outras ficam escritas e
 * conferidas em `FASES_TF_EM_ESPERA`, fora da jornada, até o som existir. Nada de voz do navegador nem de nome de letra no lugar.
 *
 * Roteiro de cada lição (docs/pedagogia/04 §4 [DP]; o "eu faço, nós fazemos, você faz" na lição de som é extensão do projeto):
 *   1. revisão cumulativa dos sons já ensinados (ABC p. 510, 513);
 *   2. SOM NOVO: faz de conta + som real + boca do Espelho do Som; a letra só aparece depois do som (regra 1);
 *   3. ouvir o som e achar a letra; ver a letra e achar o som (os dois sentidos, FG);
 *   4. SÍNTESE com som prolongado (eu faço → nós fazemos → você faz);
 *   5. LER palavras novas e palavras INVENTADAS conferidas (ABC p. 333);
 *   6. CAIXAS DE SONS: separar os sons e escrever (ditado);
 *   7. desafio: frase curta com pergunta, pares mínimos ou troca-letras.
 * Passos 2 é exposição (não conta); 3 a 7 contam (resposta conferida).
 *
 * Todas as palavras de ler e escrever estão no banco com pronúncia anotada (`tf-banco.ts`) e passam pelo verificador
 * (`decodificabilidade.ts`) nos testes. Som de estouro e sons "duvidosos" (L, V, J, P, T, B, C, D, G: nenhum ouvido por
 * pessoa) nunca são o ÚNICO estímulo de item que conta (docs/pedagogia/03 §5): ali o estímulo é a sílaba falada
 * pela Sofia ("pa"), e o som puro fica para a apresentação e para a correção.
 *
 * VOZES: só frases-moldura genéricas (`FALAS_TRILHA_SONS`) + os clipes de som, de palavra e de letra que já existem.
 */
import type { AtividadeEscolher, Cena, Fala, Fase, ItemEscolha, ItemFrase, ItemParMinimo, ItemTroca, Opcao, PalavraComSons } from '../tipos.ts';
import { BRINCADEIRAS, LETRA_POR_ID, falaChave, type LetraAlfabeto } from '../alfabeto.ts';
import { FALAS_FONICAS, habilidadeDoPar, parConfuso } from '../sons.ts';
import { analisar, grafemas, numeroDaUnidade } from '../decodificabilidade.ts';
import { BANCO } from './tf-banco.ts';
import { falaApoio, figurasDoSom } from './alfabeto.ts';

type Voz = 'sofia' | 'tales';
const f = (quem: Voz, texto: string): Fala => ({ quem, texto });
const sofia = (t: string) => f('sofia', t);

/** Frases-moldura da Trilha dos Sons: genéricas, gravadas uma vez, combinadas com os clipes de som e de palavra. */
export const FALAS_TRILHA_SONS = {
  trilha: 'Na Trilha dos Sons, cada som novo vira palavra para ler!',
  entrada: 'Trilha dos Sons!',
  acolhida: 'Oi, [NOME]! Hoje tem som novo na Trilha dos Sons!',
  acolhidaRegra: 'Oi, [NOME]! Hoje tem um segredo das letras!',
  acolhidaRevisao: 'Oi, [NOME]! Hoje é dia de juntar os sons que você já sabe!',
  gancho: 'Amanhã tem mais um som!',
  revisao: 'Primeiro, os sons que você já sabe.',
  somNovo: 'Escute o som novo.',
  revela: 'Esta é a letra deste som.',
  regraO: 'No fim da palavra, o O tem som de U.',
  regraE: 'No fim da palavra, o E tem som de I.',
  regraT: 'Em muitos lugares, o T antes do I soa assim.',
  regraD: 'E o D antes do I soa assim.',
  regraVale: 'Todo jeito de falar vale!',
  silabaLetra: 'Escute. Qual letra faz o primeiro som?',
  letraSilaba: 'Qual destes começa com o som desta letra? Toque para ouvir.',
  sintese: 'Toque nas letras, uma de cada vez, e escute os sons.',
  sinteseJunta: 'Agora junte os sons.',
  sinteseRapido: 'Mais rápido!',
  sinteseQual: 'Que palavra os sons formaram?',
  euFaco: 'Olha como eu faço.',
  nosFazemos: 'Agora vamos juntos.',
  voceFaz: 'Agora é com você!',
  primeiraLetra: 'Comece pela primeira letra.',
  lerFigura: 'Leia a palavra e toque na figura.',
  pseudo: 'Este é o nome de um bichinho inventado. Toque para ouvir e escolha a leitura.',
  caixas: 'Escute a palavra. Ponha uma ficha para cada som.',
  caixasConfere: 'Vamos conferir, som por som.',
  caixasSobra: 'Tem ficha a mais. Escute de novo, bem devagar.',
  caixasFalta: 'Faltou ficha. Escute de novo, bem devagar.',
  caixasLetras: 'Agora troque cada ficha pela letra do som.',
  caixasRegraO: 'No fim da palavra, esse som se escreve com O.',
  caixasRegraE: 'No fim da palavra, esse som se escreve com E.',
  caixasCerto: 'Cada som na sua caixa!',
  parOuvir: 'Escute a palavra e toque na figura certa.',
  parLer: 'Leia a palavra e escolha a leitura certa.',
  parMuda: 'Essas palavras só mudam um som!',
  troca: 'Troque um som e leia a palavra nova.',
  trocaMais: 'Ponha mais um som e leia a palavra nova.',
  trocaQualLetra: 'Qual letra faz este som?',
  trocaLeia: 'Que palavra ficou? Toque para ouvir e escolha.',
  frase: 'Leia a frase e responda.',
  eco: 'Escute como eu leio. Depois, leia junto comigo.',
  ecoVez: 'Agora leia você, em voz alta.',
  ecoFim: 'Que leitura bonita!',
  ditado: 'Agora você escreve, [NOME]. Escuta a palavra e monta com as letras.'
} as const;

/* ------------------------------------------------------------------------------------------------------------ */
/* sons de cada letra, a partir da pronúncia anotada                                                             */
/* ------------------------------------------------------------------------------------------------------------ */

const FONEMA_DO_SOM: Record<string, string> = {
  a: 'a', e: 'e', ɛ: 'E', i: 'i', o: 'o', ɔ: 'O', u: 'u', ã: 'a~', m: 'm', n: 'n', f: 'f', v: 'v', s: 's', z: 'z', ʃ: 'x', ʒ: 'j', l: 'l',
  R: 'rr', p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', tʃ: 't', dʒ: 'd', ẽ: 'e~', ĩ: 'i~', õ: 'o~', ũ: 'u~', ɾ: 'r'
};
/** Palavra do banco com o som (chave de fonema) de cada LETRA, na ordem. */
export function comSons(palavra: string): PalavraComSons {
  const e = BANCO[palavra.toLowerCase()];
  if (!e) throw new Error(`Trilha dos Sons: "${palavra}" fora do banco de palavras`);
  const sons: (string | null)[] = [];
  for (const g of analisar(e).grafemas) {
    sons.push(g.sons[0] ? FONEMA_DO_SOM[g.sons[0]] ?? null : null);
    for (let k = 1; k < g.g.length; k++) sons.push(null);
  }
  return { palavra: palavra.toUpperCase(), sons };
}

/* ------------------------------------------------------------------------------------------------------------ */
/* as lições                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------ */

/**
 * `grafema`: lição de um som novo escrito com acento, til ou duas letras (É, Ó, Ã, EN, IN, ON, UN), no roteiro das consoantes.
 * `regra-aberta` (TF-24), `regra-mn` (TF-30) e `regra-r` (TF-32): unidades de regra com apresentação própria (`apresentacao`).
 */
type Tipo = 'vogal' | 'consoante' | 'grafema' | 'revisao-vogais' | 'regra-final' | 'regra-tidi' | 'regra-aberta' | 'regra-mn' | 'regra-r' | 'revisao';
/** Apresentação de uma unidade de regra: palavras com a letra destacada e o som que ela faz ali (como TF-12 e TF-22). */
interface Apresentacao { fonema: string; letra: string; partes: { explica: string; palavras: { palavra: string; destaque: number; som?: string }[] }[]; fecha?: string }
interface Leitura { palavra: string; outras: string[] }
interface Desafio { pares?: ItemParMinimo[]; trocas?: ItemTroca[]; frase?: Omit<ItemFrase, 'palavras'>; eco?: boolean }
interface Licao {
  unidade: string;
  tipo: Tipo;
  bloco: number;
  /** Letra nova (maiúscula), ou o grafema novo (É, Ã, EN…). */
  letra?: string;
  /** Mais de um grafema novo na mesma lição (TF-23: É e Ó). O primeiro é `letra`. */
  letras?: string[];
  /** Unidades de regra novas (TF-24, TF-30): a apresentação e a habilidade da regra. */
  apresentacao?: Apresentacao;
  habilidadeRegra?: string;
  /** Som novo que não é o som principal da letra (TF-32: R fraco), com faz de conta, apoio e cena próprios. */
  somProprio?: { fonema: string; letra: string; brincadeira: string; apoio: string; cena: string };
  /** Rótulo do disco na trilha. */
  rotulo: string;
  titulo: string;
  objetivo: string;
  /** Síntese: [palavra, ...opções] (a 1ª opção é a certa). Opções com figura viram figuras; senão, palavras faladas. */
  sintese?: string[][];
  /** Leitura de palavras reais: com figura (ler e tocar) ou com leituras faladas. */
  leitura?: Leitura[];
  /** Palavras inventadas: [alvo, leitura errada, leitura errada]. */
  pseudo?: string[][];
  /** Caixas de sons. */
  caixas?: string[];
  /** Ditado com letras móveis (revisões). */
  ditado?: string[];
  desafio?: Desafio;
  /** Letras da revisão (revisões de bloco). */
  revisaoLetras?: string[];
  /** Revisão de bloco: vale como a unidade indicada (o que já foi ensinado até ela). */
  ate?: string;
  /** Itens avaliados da REGRA (TF-12, TF-22): ouvir a palavra e escolher a letra do som que falta. */
  regra?: { mostrar: string; palavra: string; certa: string; outras: string[]; som: string }[];
}

/**
 * GRAFEMAS NOVOS dos blocos 4 e 5 (não são letras da Trilha A–Z): o som, a palavra-apoio e o faz de conta de cada um.
 * Faz de conta: ideias do projeto a partir de docs/pesquisa/46 §"O que levamos" (é de nojo ao pisar na lama, ó de surpresa,
 * ã de quem está pensando) [DP]; o som que se ouve é sempre o SOM PURO do mapa de sons, nunca o nome da letra (regra 1).
 */
const grafema = (letra: string, fonema: string, ipa: string, palavra: string, brincadeira: string, dicaBoca: string): LetraAlfabeto => ({
  letra, minuscula: letra.toLowerCase(), tipo: 'vogal', ipa, fonema, palavra, dicaBoca, gesto: '', voz: 'sofia', somPuro: { gravado: false }, brincadeira, palavras: [palavra, palavra, palavra]
});
const NASAL = 'Faz de conta que o som escorrega pelo nariz.';
export const GRAFEMAS_TF: Record<string, LetraAlfabeto> = {
  É: grafema('É', 'E', '/ɛ/', 'pé', 'Faz de conta que você pisou na lama. Que nojo!', 'Boca bem aberta, sorriso largo.'),
  Ó: grafema('Ó', 'O', '/ɔ/', 'vovó', 'Faz de conta que você viu uma coisa linda. Que surpresa!', 'Bolinha bem aberta.'),
  Ê: grafema('Ê', 'e', '/e/', 'bebê', BRINCADEIRAS.E, 'Sorriso meio aberto.'),
  Ô: grafema('Ô', 'o', '/o/', 'vovô', BRINCADEIRAS.O, 'Boca redonda e fechadinha.'),
  Ã: grafema('Ã', 'a~', '/ã/', 'lã', 'Faz de conta que você está pensando, bem quietinho.', 'Boca aberta, e o som passa pelo nariz.'),
  EN: grafema('EN', 'e~', '/ẽ/', 'dente', NASAL, 'Sorriso pequeno, e o som passa pelo nariz.'),
  IN: grafema('IN', 'i~', '/ĩ/', 'lindo', NASAL, 'Sorriso largo, e o som passa pelo nariz.'),
  ON: grafema('ON', 'o~', '/õ/', 'onda', NASAL, 'Boca redondinha, e o som passa pelo nariz.'),
  UN: grafema('UN', 'u~', '/ũ/', 'mundo', NASAL, 'Biquinho, e o som passa pelo nariz.')
};
/** Apoio dito depois do som, com o nome da letra (como "M, de macaco."). */
const APOIO_DO_GRAFEMA: Record<string, string> = {
  É: 'É, de pé.', Ó: 'Ó, de vovó.', Ê: 'Ê, de bebê.', Ô: 'Ô, de vovô.', Ã: 'A com til, de lã.',
  EN: 'E e N, de dente.', IN: 'I e N, de lindo.', ON: 'O e N, de onda.', UN: 'U e N, de mundo.'
};
/** Cena do faz de conta (web/public/assets/figuras) dos grafemas novos; as letras usam `CENAS_DO_SOM`. */
const CENA_DO_GRAFEMA: Record<string, string> = { É: 'cena-e-aberto', Ó: 'cena-o-aberto', Ã: 'cena-a-nasal' };
/** A letra (Trilha A–Z) ou o grafema novo. */
const letraDe = (x: string): LetraAlfabeto => LETRA_POR_ID[x] ?? GRAFEMAS_TF[x];
/** Som (chave do mapa de sons) de uma letra ou grafema da trilha. */
export const fonemaDoGrafema = (x: string): string | null => letraDe(x)?.fonema ?? null;

/** Item de par mínimo: a habilidade vem SEMPRE do contraste (`habilidadeDoPar`), nunca da leitura em geral. */
const par = (modo: 'ouvir' | 'ler', alvo: string, outra: string, sons: [string, string], distrator: string): ItemParMinimo => ({
  modo, alvo, outra, sons, distrator, ...(modo === 'ouvir' ? { figuraAlvo: alvo, figuraOutra: outra } : {}), habilidade: habilidadeDoPar(sons)
});
const troca = (acao: 'trocar' | 'acrescentar', de: string, para: string, posicao: number, letra: string, letras: string[], leituras: string[]): ItemTroca => ({
  acao, de: de.toUpperCase(), para: para.toUpperCase(), posicao, letra, som: fonemaDoGrafema(letra)!, letras, leituras
});
const frase = (texto: string, pergunta: string, correta: string, opcoes: string[]): Omit<ItemFrase, 'palavras'> => ({ frase: texto, pergunta: sofia(pergunta), correta, opcoes });

export const LICOES_TF: Licao[] = [
  { unidade: 'TF-01', tipo: 'vogal', bloco: 1, letra: 'A', rotulo: 'a', titulo: 'O som /a/', objetivo: 'Ouvir, dizer e achar o som /a/ e a letra A' },
  { unidade: 'TF-02', tipo: 'vogal', bloco: 1, letra: 'E', rotulo: 'e', titulo: 'O som /ê/', objetivo: 'Ouvir, dizer e achar o som /ê/ e a letra E' },
  { unidade: 'TF-03', tipo: 'vogal', bloco: 1, letra: 'I', rotulo: 'i', titulo: 'O som /i/', objetivo: 'Ouvir, dizer e achar o som /i/ e a letra I' },
  { unidade: 'TF-04', tipo: 'vogal', bloco: 1, letra: 'O', rotulo: 'o', titulo: 'O som /ô/', objetivo: 'Ouvir, dizer e achar o som /ô/ e a letra O' },
  { unidade: 'TF-05', tipo: 'vogal', bloco: 1, letra: 'U', rotulo: 'u', titulo: 'O som /u/', objetivo: 'Ouvir, dizer e achar o som /u/ e a letra U' },
  {
    unidade: 'TF-06', tipo: 'revisao-vogais', bloco: 1, rotulo: 'ai', titulo: 'As vogais juntas', objetivo: 'Ler duas vogais juntas: AI, EI, OI, UI, EU',
    sintese: [['ai', 'ai', 'oi', 'ui'], ['eu', 'eu', 'ei', 'ui'], ['oi', 'oi', 'ai', 'eu']],
    leitura: [{ palavra: 'oi', outras: ['ai', 'ui'] }, { palavra: 'ei', outras: ['eu', 'ai'] }, { palavra: 'ui', outras: ['oi', 'eu'] }],
    caixas: ['oi', 'eu']
  },
  {
    unidade: 'TF-07', tipo: 'consoante', bloco: 2, letra: 'M', rotulo: 'm', titulo: 'O som /m/', objetivo: 'Ligar o som /m/ à letra M e ler as primeiras palavras',
    sintese: [['mia', 'mia', 'meu', 'eu'], ['ema', 'ema', 'uva', 'ovo'], ['meu', 'meu', 'mia', 'eu']],
    leitura: [{ palavra: 'meia', outras: ['mia', 'meu'] }, { palavra: 'miau', outras: ['mia', 'meu'] }, { palavra: 'ema', outras: ['uva', 'ovo'] }],
    pseudo: [['amu', 'ami', 'ama'], ['umi', 'ami', 'umu']],
    caixas: ['mia', 'meu', 'ema'],
    desafio: { trocas: [troca('acrescentar', 'eu', 'meu', 0, 'M', ['M', 'A', 'O'], ['meu', 'eu', 'mia']), troca('acrescentar', 'mia', 'meia', 1, 'E', ['E', 'U', 'O'], ['meia', 'mia', 'meu'])] }
  },
  {
    unidade: 'TF-08', tipo: 'consoante', bloco: 2, letra: 'F', rotulo: 'f', titulo: 'O som /f/', objetivo: 'Ligar o som /f/ à letra F e ler palavras com F',
    sintese: [['fia', 'fia', 'fui', 'foi'], ['foi', 'foi', 'fia', 'oi'], ['fui', 'fui', 'foi', 'ui']],
    leitura: [{ palavra: 'foi', outras: ['fui', 'oi'] }, { palavra: 'fui', outras: ['foi', 'fia'] }, { palavra: 'afia', outras: ['fia', 'mia'] }],
    pseudo: [['fami', 'mafi', 'fama'], ['mafu', 'mafa', 'fafu']],
    caixas: ['fia', 'foi'],
    desafio: { trocas: [troca('trocar', 'mia', 'fia', 0, 'F', ['F', 'M', 'A'], ['fia', 'mia', 'via'])] }
  },
  {
    unidade: 'TF-09', tipo: 'consoante', bloco: 2, letra: 'V', rotulo: 'v', titulo: 'O som /v/', objetivo: 'Ligar o som /v/ à letra V e ouvir a diferença entre F e V',
    sintese: [['uva', 'uva', 'ovo', 'ema'], ['via', 'via', 'viu', 'fia'], ['vai', 'vai', 'viu', 'ai']],
    leitura: [{ palavra: 'uva', outras: ['ovo', 'ema'] }, { palavra: 'viu', outras: ['vai', 'via'] }, { palavra: 'vai', outras: ['viu', 'ai'] }],
    pseudo: [['vafi', 'fafi', 'vavi'], ['muva', 'mufa', 'uva']],
    caixas: ['uva', 'vai'],
    desafio: { pares: [par('ouvir', 'faca', 'vaca', ['f', 'v'], 'foca'), par('ouvir', 'vaca', 'faca', ['v', 'f'], 'jaca'), par('ler', 'via', 'fia', ['v', 'f'], 'viu'), par('ler', 'fia', 'via', ['f', 'v'], 'mia')] }
  },
  {
    unidade: 'TF-10', tipo: 'consoante', bloco: 2, letra: 'L', rotulo: 'l', titulo: 'O som /l/', objetivo: 'Ligar o som /l/ à letra L, ler palavras e a primeira frase',
    sintese: [['lua', 'lua', 'lula', 'uva'], ['fila', 'fila', 'mala', 'mula'], ['mala', 'mala', 'mula', 'fala']],
    leitura: [{ palavra: 'mala', outras: ['mula', 'lua'] }, { palavra: 'lua', outras: ['lula', 'uva'] }, { palavra: 'fila', outras: ['mala', 'lula'] }, { palavra: 'mula', outras: ['mala', 'fila'] }],
    pseudo: [['lifa', 'lifu', 'mifa'], ['mufa', 'mifa', 'mula']],
    caixas: ['lua', 'mala', 'fila'],
    desafio: { frase: frase('A lula viu a lua.', 'O que a lula viu?', 'lua', ['lua', 'uva', 'mala']) }
  },
  {
    unidade: 'TF-11', tipo: 'consoante', bloco: 2, letra: 'S', rotulo: 's', titulo: 'O som /s/', objetivo: 'Ligar o som /s/ à letra S no começo da palavra',
    sintese: [['sai', 'sai', 'sei', 'vai'], ['sala', 'sala', 'mala', 'fala'], ['sua', 'sua', 'lua', 'sai']],
    leitura: [{ palavra: 'sai', outras: ['sei', 'sua'] }, { palavra: 'sala', outras: ['mala', 'fala'] }, { palavra: 'saia', outras: ['sai', 'sala'] }],
    pseudo: [['safi', 'sami', 'safa'], ['sula', 'sila', 'lula']],
    caixas: ['sua', 'sala'],
    desafio: { trocas: [troca('trocar', 'mala', 'sala', 0, 'S', ['S', 'F', 'L'], ['sala', 'mala', 'fala']), troca('trocar', 'sala', 'fala', 0, 'F', ['F', 'V', 'M'], ['fala', 'sala', 'vala'])] }
  },
  {
    unidade: 'TF-12', tipo: 'regra-final', bloco: 2, letra: 'O', rotulo: 'o·e', titulo: 'O e E no fim da palavra', objetivo: 'Saber que O e E no fim da palavra soam U e I',
    sintese: [['ovo', 'ovo', 'uva', 'ema'], ['mofo', 'mofo', 'fofo', 'ovo'], ['fio', 'fio', 'fia', 'foi']],
    leitura: [{ palavra: 'ovo', outras: ['uva', 'ema'] }, { palavra: 'fofo', outras: ['mofo', 'ovo'] }, { palavra: 'mofo', outras: ['fofo', 'mala'] }, { palavra: 'ele', outras: ['ela', 'eli'] }],
    pseudo: [['mufe', 'mufa', 'mufo'], ['savo', 'sava', 'sivo']],
    caixas: ['ovo', 'fio', 'ele'],
    regra: [
      { mostrar: 'OV_', palavra: 'ovo', certa: 'O', outras: ['U', 'A'], som: 'u' }, { mostrar: 'FOF_', palavra: 'fofo', certa: 'O', outras: ['U', 'A'], som: 'u' },
      { mostrar: 'EL_', palavra: 'ele', certa: 'E', outras: ['I', 'A'], som: 'i' }, { mostrar: 'VAL_', palavra: 'vale', certa: 'E', outras: ['I', 'U'], som: 'i' },
      { mostrar: 'MOF_', palavra: 'mofo', certa: 'O', outras: ['U', 'I'], som: 'u' }
    ],
    desafio: { frase: frase('Ele viu o ovo.', 'O que ele viu?', 'ovo', ['ovo', 'uva', 'lua']) }
  },
  {
    unidade: 'TF-13', tipo: 'consoante', bloco: 2, letra: 'N', rotulo: 'n', titulo: 'O som /n/', objetivo: 'Ligar o som /n/ à letra N e ouvir a diferença entre M e N',
    sintese: [['nave', 'nave', 'ave', 'nove'], ['novo', 'novo', 'ovo', 'nove'], ['nua', 'nua', 'lua', 'sua']],
    leitura: [{ palavra: 'navio', outras: ['ovo', 'uva'] }, { palavra: 'novo', outras: ['nove', 'ovo'] }, { palavra: 'nave', outras: ['ave', 'nove'] }],
    pseudo: [['nafu', 'nafa', 'mafu'], ['muni', 'mumi', 'nuni']],
    caixas: ['nave', 'novo'],
    desafio: { trocas: [troca('acrescentar', 'ovo', 'novo', 0, 'N', ['N', 'M', 'L'], ['novo', 'ovo', 'movo']), troca('acrescentar', 'ave', 'nave', 0, 'N', ['N', 'M', 'S'], ['nave', 'ave', 'mave'])] }
  },
  {
    unidade: 'TF-14', tipo: 'consoante', bloco: 2, letra: 'Z', rotulo: 'z', titulo: 'O som /z/', objetivo: 'Ligar o som /z/ à letra Z e ouvir a diferença entre S e Z',
    sintese: [['zoa', 'zoa', 'soa', 'lua'], ['vazio', 'vazio', 'navio', 'fazia'], ['zelo', 'zelo', 'selo', 'novo']],
    leitura: [{ palavra: 'zoa', outras: ['soa', 'zua'] }, { palavra: 'vazio', outras: ['vazia', 'fazia'] }, { palavra: 'fazia', outras: ['vazia', 'fazio'] }],
    pseudo: [['zufa', 'sufa', 'zafa'], ['zami', 'sami', 'zama']],
    caixas: ['zoa', 'zelo'],
    desafio: { pares: [par('ler', 'selo', 'zelo', ['s', 'z'], 'sala'), par('ler', 'zelo', 'selo', ['z', 's'], 'sala'), par('ler', 'zoa', 'soa', ['z', 's'], 'voa'), par('ler', 'soa', 'zoa', ['s', 'z'], 'sua')] }
  },
  {
    unidade: 'TF-15', tipo: 'consoante', bloco: 2, letra: 'J', rotulo: 'j', titulo: 'O som /j/', objetivo: 'Ligar o som /j/ à letra J',
    sintese: [['sujo', 'sujo', 'suja', 'sumo'], ['seja', 'seja', 'suja', 'vela'], ['jaula', 'jaula', 'aula', 'jaca']],
    leitura: [{ palavra: 'sujo', outras: ['suja', 'sumo'] }, { palavra: 'seja', outras: ['suja', 'vela'] }, { palavra: 'jaula', outras: ['aula', 'jaca'] }],
    pseudo: [['jufa', 'zufa', 'jufo'], ['jali', 'zali', 'jala']],
    caixas: ['sujo', 'seja'],
    desafio: { frase: frase('A mula suja sai.', 'Quem sai?', 'mula', ['mula', 'lula', 'mala']) }
  },
  {
    unidade: 'TF-R2', tipo: 'revisao', bloco: 2, ate: 'TF-15', rotulo: '★', titulo: 'Revisão: sons que esticam', objetivo: 'Ler, escrever e comparar M, F, V, L, S, N, Z e J',
    revisaoLetras: ['M', 'F', 'V', 'L', 'S', 'N', 'Z', 'J'],
    sintese: [['lua', 'lua', 'lula', 'uva'], ['sala', 'sala', 'mala', 'fala'], ['novo', 'novo', 'ovo', 'nove']],
    pseudo: [['fami', 'mafi', 'fama'], ['zufa', 'sufa', 'zafa']],
    ditado: ['LUA', 'MALA', 'OVO', 'NAVE'],
    desafio: {
      pares: [par('ouvir', 'faca', 'vaca', ['f', 'v'], 'foca'), par('ler', 'selo', 'zelo', ['s', 'z'], 'sala'), par('ler', 'via', 'fia', ['v', 'f'], 'viu')],
      trocas: [troca('trocar', 'lua', 'sua', 0, 'S', ['S', 'Z', 'M'], ['sua', 'lua', 'zua']), troca('trocar', 'sua', 'nua', 0, 'N', ['N', 'M', 'L'], ['nua', 'sua', 'mua'])],
      frase: frase('A mula viu a uva.', 'O que a mula viu?', 'uva', ['uva', 'lua', 'ovo']), eco: true
    }
  },
  {
    unidade: 'TF-16', tipo: 'consoante', bloco: 3, letra: 'P', rotulo: 'p', titulo: 'O som /p/', objetivo: 'Ligar o som /p/ à letra P e ler palavras com P',
    sintese: [['sapo', 'sapo', 'lupa', 'uva'], ['lupa', 'lupa', 'lua', 'uva'], ['pula', 'pula', 'pia', 'lula']],
    leitura: [{ palavra: 'papai', outras: ['sapo', 'mala'] }, { palavra: 'lupa', outras: ['lua', 'uva'] }, { palavra: 'sapo', outras: ['lupa', 'mula'] }],
    pseudo: [['puli', 'pali', 'buli'], ['pafe', 'pafa', 'vafe']],
    caixas: ['pia', 'sapo', 'lupa'],
    desafio: { trocas: [troca('acrescentar', 'lua', 'lupa', 2, 'P', ['P', 'F', 'M'], ['lupa', 'lua', 'lufa'])] }
  },
  {
    unidade: 'TF-17', tipo: 'consoante', bloco: 3, letra: 'T', rotulo: 't', titulo: 'O som /t/', objetivo: 'Ligar o som /t/ à letra T, ler palavras e uma frase',
    sintese: [['pato', 'pato', 'sapo', 'gato'], ['tatu', 'tatu', 'pato', 'uva'], ['lata', 'lata', 'nata', 'luta']],
    leitura: [{ palavra: 'pato', outras: ['sapo', 'gato'] }, { palavra: 'tatu', outras: ['pato', 'lupa'] }, { palavra: 'sapato', outras: ['sapo', 'pato'] }],
    pseudo: [['tufa', 'tafa', 'pufa'], ['latu', 'lafu', 'patu']],
    caixas: ['pato', 'tatu', 'lata'],
    desafio: {
      frase: frase('O pato pula.', 'Quem pula?', 'pato', ['pato', 'sapo', 'tatu']),
      trocas: [troca('trocar', 'pato', 'mato', 0, 'M', ['M', 'N', 'F'], ['mato', 'pato', 'nato']), troca('trocar', 'lata', 'nata', 0, 'N', ['N', 'M', 'L'], ['nata', 'lata', 'mata'])]
    }
  },
  {
    unidade: 'TF-18', tipo: 'consoante', bloco: 3, letra: 'B', rotulo: 'b', titulo: 'O som /b/', objetivo: 'Ligar o som /b/ à letra B e ouvir a diferença entre P e B',
    sintese: [['lobo', 'lobo', 'bolo', 'ovo'], ['boi', 'boi', 'foi', 'oi'], ['bala', 'bala', 'mala', 'pala']],
    leitura: [{ palavra: 'bolo', outras: ['lobo', 'ovo'] }, { palavra: 'lobo', outras: ['bolo', 'lupa'] }, { palavra: 'boi', outras: ['foi', 'oi'] }],
    pseudo: [['bufi', 'pufi', 'bupi'], ['labu', 'lapu', 'labi']],
    caixas: ['boi', 'bolo', 'bala'],
    desafio: {
      pares: [par('ouvir', 'mala', 'bala', ['m', 'b'], 'mula'), par('ler', 'pato', 'bato', ['p', 'b'], 'pata'), par('ler', 'bato', 'pato', ['b', 'p'], 'bata'), par('ler', 'pule', 'bule', ['p', 'b'], 'pula'), par('ler', 'pata', 'bata', ['p', 'b'], 'pato')],
      trocas: [troca('acrescentar', 'oi', 'boi', 0, 'B', ['B', 'P', 'D'], ['boi', 'oi', 'poi'])]
    }
  },
  {
    unidade: 'TF-19', tipo: 'consoante', bloco: 3, letra: 'C', rotulo: 'c', titulo: 'O som /k/ (ca, co, cu)', objetivo: 'Ligar o som /k/ à letra C antes de A, O e U',
    sintese: [['vaca', 'vaca', 'faca', 'jaca'], ['suco', 'suco', 'sapo', 'uva'], ['macaco', 'macaco', 'pato', 'vaca']],
    leitura: [{ palavra: 'faca', outras: ['vaca', 'jaca'] }, { palavra: 'macaco', outras: ['pato', 'vaca'] }, { palavra: 'suco', outras: ['sapo', 'jaca'] }, { palavra: 'jaca', outras: ['faca', 'vaca'] }],
    pseudo: [['cafu', 'gafu', 'cafa'], ['cavu', 'cafi', 'gavu']],
    caixas: ['vaca', 'suco', 'boca'],
    desafio: {
      frase: frase('O macaco viu a jaca.', 'O que o macaco viu?', 'jaca', ['jaca', 'uva', 'faca']),
      pares: [par('ler', 'faca', 'vaca', ['f', 'v'], 'fala'), par('ler', 'vaca', 'faca', ['v', 'f'], 'jaca')]
    }
  },
  {
    unidade: 'TF-20', tipo: 'consoante', bloco: 3, letra: 'D', rotulo: 'd', titulo: 'O som /d/', objetivo: 'Ligar o som /d/ à letra D e ouvir a diferença entre T e D',
    sintese: [['dado', 'dado', 'dedo', 'pato'], ['dedo', 'dedo', 'dado', 'ovo'], ['nada', 'nada', 'nata', 'lado']],
    leitura: [{ palavra: 'dado', outras: ['dedo', 'pato'] }, { palavra: 'dedo', outras: ['dado', 'ovo'] }, { palavra: 'vida', outras: ['vila', 'via'] }],
    pseudo: [['dufa', 'tufa', 'dufo'], ['midu', 'mitu', 'mido']],
    caixas: ['dado', 'dedo', 'vida'],
    desafio: { pares: [par('ler', 'nada', 'nata', ['d', 't'], 'cada'), par('ler', 'nata', 'nada', ['t', 'd'], 'lata'), par('ouvir', 'dado', 'dedo', ['a', 'e'], 'pato')] }
  },
  {
    unidade: 'TF-21', tipo: 'consoante', bloco: 3, letra: 'G', rotulo: 'g', titulo: 'O som /g/ (ga, go, gu)', objetivo: 'Ligar o som /g/ à letra G antes de A, O e U',
    sintese: [['gato', 'gato', 'pato', 'galo'], ['fogo', 'fogo', 'fofo', 'ovo'], ['gota', 'gota', 'gata', 'bota']],
    leitura: [{ palavra: 'gato', outras: ['pato', 'galo'] }, { palavra: 'galo', outras: ['gato', 'lobo'] }, { palavra: 'fogo', outras: ['fofo', 'ovo'] }],
    pseudo: [['gufa', 'gafa', 'gufo'], ['lagu', 'lacu', 'lago']],
    caixas: ['gato', 'galo', 'lago'],
    desafio: {
      trocas: [troca('trocar', 'mato', 'gato', 0, 'G', ['G', 'C', 'P'], ['gato', 'mato', 'cato']), troca('trocar', 'gato', 'galo', 2, 'L', ['L', 'T', 'M'], ['galo', 'gato', 'gamo'])],
      frase: frase('O gato viu o galo.', 'Quem o gato viu?', 'galo', ['galo', 'pato', 'sapo'])
    }
  },
  {
    unidade: 'TF-22', tipo: 'regra-tidi', bloco: 3, letra: 'T', rotulo: 'ti·di', titulo: 'TI e DI', objetivo: 'Ler T e D antes do som de I (tia, dia), como se fala na sua região',
    sintese: [['tia', 'tia', 'dia', 'lia'], ['dia', 'dia', 'tia', 'via'], ['tomate', 'tomate', 'tapete', 'macaco']],
    leitura: [{ palavra: 'tomate', outras: ['tapete', 'pato'] }, { palavra: 'tapete', outras: ['tomate', 'sapato'] }, { palavra: 'tia', outras: ['dia', 'lia'] }, { palavra: 'dia', outras: ['tia', 'via'] }],
    pseudo: [['tifa', 'difa', 'tufa'], ['dimu', 'timu', 'dumu']],
    caixas: ['tia', 'dia', 'bate'],
    regra: [
      { mostrar: '_IA', palavra: 'tia', certa: 'T', outras: ['D', 'X'], som: 't' }, { mostrar: '_IA', palavra: 'dia', certa: 'D', outras: ['T', 'J'], som: 'd' },
      { mostrar: 'TOMA_E', palavra: 'tomate', certa: 'T', outras: ['D', 'X'], som: 't' }, { mostrar: 'BA_E', palavra: 'bate', certa: 'T', outras: ['D', 'X'], som: 't' }
    ],
    desafio: {
      pares: [par('ler', 'tia', 'dia', ['t', 'd'], 'pia'), par('ler', 'dia', 'tia', ['d', 't'], 'via')],
      frase: frase('A tia viu o tomate.', 'O que a tia viu?', 'tomate', ['tomate', 'tapete', 'pato'])
    }
  },
  {
    unidade: 'TF-R3', tipo: 'revisao', bloco: 3, ate: 'TF-22', rotulo: '★', titulo: 'Revisão: sons que estouram', objetivo: 'Ler, escrever e comparar P, T, B, C, D e G',
    revisaoLetras: ['P', 'T', 'B', 'C', 'D', 'G'],
    sintese: [['gato', 'gato', 'pato', 'galo'], ['dedo', 'dedo', 'dado', 'ovo'], ['vaca', 'vaca', 'faca', 'jaca']],
    pseudo: [['tufa', 'tafa', 'pufa'], ['gufa', 'gafa', 'gufo']],
    ditado: ['PATO', 'BOLO', 'FACA', 'GATO', 'DEDO'],
    desafio: {
      pares: [par('ler', 'pato', 'bato', ['p', 'b'], 'pata'), par('ouvir', 'faca', 'vaca', ['f', 'v'], 'foca'), par('ler', 'nata', 'nada', ['t', 'd'], 'lata'), par('ler', 'galo', 'calo', ['g', 'k'], 'gato'), par('ler', 'gata', 'cata', ['g', 'k'], 'gota')],
      trocas: [troca('trocar', 'pato', 'mato', 0, 'M', ['M', 'N', 'B'], ['mato', 'pato', 'nato']), troca('trocar', 'mato', 'gato', 0, 'G', ['G', 'C', 'D'], ['gato', 'mato', 'cato'])],
      frase: frase('O gato viu a vaca.', 'Quem o gato viu?', 'vaca', ['vaca', 'faca', 'pato']), eco: true
    }
  },
  // BLOCO 4 · vogais abertas e nasais (docs/pedagogia/01 §4). Só na trilha fônica é que o E e o O ganham o som aberto.
  {
    unidade: 'TF-23', tipo: 'grafema', bloco: 4, letra: 'É', letras: ['É', 'Ó'], rotulo: 'é·ó', titulo: 'Os sons /é/ e /ó/',
    objetivo: 'Ligar os sons /é/ e /ó/ ao acento agudo (pé, vovó) e ouvir a diferença de /ê/ e /ô/',
    sintese: [['café', 'café', 'cafu', 'cafa'], ['vovó', 'vovó', 'vovô', 'ovo'], ['babá', 'babá', 'bebê', 'bala']],
    leitura: [{ palavra: 'pé', outras: ['pato', 'pipoca'] }, { palavra: 'vovó', outras: ['vovô', 'ovo'] }, { palavra: 'café', outras: ['cafa', 'cafu'] }, { palavra: 'babá', outras: ['bebê', 'bala'] }],
    pseudo: [['lupé', 'lupê', 'lupa'], ['nafó', 'nafô', 'nafa']],
    caixas: ['pé', 'vovó', 'café'],
    desafio: { pares: [par('ouvir', 'vovó', 'vovô', ['O', 'o'], 'vela'), par('ouvir', 'vovô', 'vovó', ['o', 'O'], 'bola'), par('ler', 'avó', 'avô', ['O', 'o'], 'ave')] }
  },
  {
    unidade: 'TF-24', tipo: 'regra-aberta', bloco: 4, letra: 'O', rotulo: 'é·ê', titulo: 'É ou ê? Ó ou ô?', habilidadeRegra: 'regra-vogal-aberta',
    objetivo: 'Ler E e O abertos sem acento (bola, vela) e ê e ô com chapeuzinho (bebê, vovô)',
    apresentacao: {
      fonema: 'O', letra: 'O',
      partes: [
        { explica: 'Sem acento, o O às vezes soa ó.', palavras: [{ palavra: 'BOLA', destaque: 1, som: 'O' }, { palavra: 'COPO', destaque: 1, som: 'O' }] },
        { explica: 'E o E às vezes soa é.', palavras: [{ palavra: 'VELA', destaque: 1, som: 'E' }, { palavra: 'JANELA', destaque: 3, som: 'E' }] },
        { explica: 'Com chapeuzinho, o som é fechado: ô e ê.', palavras: [{ palavra: 'VOVÔ', destaque: 3, som: 'o' }, { palavra: 'BEBÊ', destaque: 3, som: 'e' }] }
      ],
      fecha: 'Leia primeiro com o som fechado. Se não virar palavra, tente o aberto!'
    },
    regra: [
      { mostrar: 'VOV_', palavra: 'vovô', certa: 'Ô', outras: ['Ó', 'O'], som: 'o' }, { mostrar: 'VOV_', palavra: 'vovó', certa: 'Ó', outras: ['Ô', 'O'], som: 'O' },
      { mostrar: 'BEB_', palavra: 'bebê', certa: 'Ê', outras: ['É', 'E'], som: 'e' }, { mostrar: 'CAF_', palavra: 'café', certa: 'É', outras: ['Ê', 'E'], som: 'E' },
      { mostrar: 'P_', palavra: 'pé', certa: 'É', outras: ['Ê', 'E'], som: 'E' }
    ],
    sintese: [['bola', 'bola', 'mola', 'cola'], ['vela', 'vela', 'bola', 'mala'], ['moto', 'moto', 'mola', 'pato']],
    leitura: [{ palavra: 'bola', outras: ['mola', 'cola'] }, { palavra: 'vela', outras: ['bola', 'mala'] }, { palavra: 'janela', outras: ['panela', 'caneca'] }, { palavra: 'pipoca', outras: ['peteca', 'boneca'] }, { palavra: 'ela', outras: ['ele', 'eli'] }],
    pseudo: [['dovê', 'dové', 'dova'], ['bupô', 'bupó', 'bupa']],
    caixas: ['bola', 'vela', 'copo'],
    desafio: { frase: frase('A vovó viu a bola.', 'O que a vovó viu?', 'bola', ['bola', 'vela', 'mola']), pares: [par('ler', 'avô', 'avó', ['o', 'O'], 'ave'), par('ler', 'avó', 'avô', ['O', 'o'], 'ave')] }
  },
  {
    unidade: 'TF-25', tipo: 'grafema', bloco: 4, letra: 'Ã', rotulo: 'ã', titulo: 'O som /ã/', objetivo: 'Ligar o som /ã/ ao Ã e ao AN (lã, anta) e ouvir a diferença de /a/',
    sintese: [['panda', 'panda', 'pato', 'papai'], ['lã', 'lã', 'lua', 'uva'], ['anta', 'anta', 'manta', 'janta']],
    leitura: [{ palavra: 'panda', outras: ['pato', 'papai'] }, { palavra: 'lã', outras: ['lua', 'uva'] }, { palavra: 'anta', outras: ['janta', 'manta'] }, { palavra: 'manta', outras: ['mata', 'nata'] }],
    pseudo: [['lantu', 'latu', 'lanta'], ['tanfi', 'tafi', 'tanfa']],
    caixas: ['lã', 'fã'],
    desafio: {
      frase: frase('A anta viu a lua.', 'O que a anta viu?', 'lua', ['lua', 'uva', 'bola']),
      pares: [par('ler', 'manta', 'mata', ['a~', 'a'], 'nata'), par('ler', 'tanto', 'tato', ['a~', 'a'], 'canto'), par('ler', 'lã', 'lá', ['a~', 'a'], 'fã')]
    }
  },
  {
    unidade: 'TF-26', tipo: 'grafema', bloco: 4, letra: 'EN', rotulo: 'en', titulo: 'O som /ẽ/', objetivo: 'Ligar o som /ẽ/ ao EN (dente, vento)',
    sintese: [['dente', 'dente', 'dedo', 'pente'], ['vento', 'vento', 'veto', 'lento'], ['lenda', 'lenda', 'venda', 'lado']],
    leitura: [{ palavra: 'dente', outras: ['pente', 'dedo'] }, { palavra: 'vento', outras: ['veto', 'venda'] }, { palavra: 'lento', outras: ['lenda', 'lado'] }],
    pseudo: [['fendu', 'fedu', 'fenda'], ['benfa', 'befa', 'binfa']],
    ditado: ['DENTE', 'VENTO'],
    desafio: { pares: [par('ler', 'vento', 'veto', ['e~', 'E'], 'lento'), par('ler', 'veto', 'vento', ['E', 'e~'], 'vale')] }
  },
  {
    unidade: 'TF-27', tipo: 'grafema', bloco: 4, letra: 'IN', rotulo: 'in', titulo: 'O som /ĩ/', objetivo: 'Ligar o som /ĩ/ ao IM e ao IN (sim, lindo)',
    sintese: [['fim', 'fim', 'sim', 'fio'], ['lindo', 'lindo', 'lido', 'minto'], ['tinta', 'tinta', 'tanto', 'vinte']],
    leitura: [{ palavra: 'sim', outras: ['fim', 'fio'] }, { palavra: 'lindo', outras: ['lido', 'minto'] }, { palavra: 'vinte', outras: ['vento', 'vela'] }, { palavra: 'ninja', outras: ['nata', 'mito'] }],
    pseudo: [['tindu', 'tidu', 'tinda'], ['binta', 'bita', 'banta']],
    ditado: ['FIM', 'LINDO'],
    desafio: { pares: [par('ler', 'lindo', 'lido', ['i~', 'i'], 'lado'), par('ler', 'minto', 'mito', ['i~', 'i'], 'mato'), par('ler', 'mito', 'minto', ['i', 'i~'], 'meio')] }
  },
  {
    unidade: 'TF-28', tipo: 'grafema', bloco: 4, letra: 'ON', rotulo: 'on', titulo: 'O som /õ/', objetivo: 'Ligar o som /õ/ ao OM e ao ON (bom, onda)',
    sintese: [['bom', 'bom', 'som', 'boi'], ['onda', 'onda', 'conta', 'lenda'], ['ponte', 'ponte', 'pote', 'fonte']],
    leitura: [{ palavra: 'bom', outras: ['som', 'boi'] }, { palavra: 'onda', outras: ['anta', 'lenda'] }, { palavra: 'conta', outras: ['cota', 'canto'] }, { palavra: 'monte', outras: ['ponte', 'dente'] }],
    pseudo: [['lontu', 'lotu', 'lonta'], ['donfa', 'dofa', 'danfa']],
    ditado: ['BOM', 'ONDA', 'PONTE'],
    desafio: { pares: [par('ler', 'conta', 'cota', ['o~', 'O'], 'canto'), par('ler', 'ponte', 'pote', ['o~', 'O'], 'pente'), par('ler', 'cota', 'conta', ['O', 'o~'], 'cola')] }
  },
  {
    unidade: 'TF-29', tipo: 'grafema', bloco: 4, letra: 'UN', rotulo: 'un', titulo: 'O som /ũ/', objetivo: 'Ligar o som /ũ/ ao UM e ao UN (um, mundo)',
    sintese: [['mundo', 'mundo', 'mudo', 'fundo'], ['nunca', 'nunca', 'nuca', 'junto'], ['atum', 'atum', 'tatu', 'fim']],
    leitura: [{ palavra: 'mundo', outras: ['mudo', 'fundo'] }, { palavra: 'junto', outras: ['fundo', 'janta'] }, { palavra: 'nunca', outras: ['nuca', 'janta'] }, { palavra: 'um', outras: ['oi', 'eu'] }],
    pseudo: [['tunfa', 'tufa', 'tanfa'], ['lunti', 'luti', 'lanti']],
    ditado: ['UM', 'MUNDO', 'FUNDO'],
    desafio: { pares: [par('ler', 'mundo', 'mudo', ['u~', 'u'], 'lado'), par('ler', 'nunca', 'nuca', ['u~', 'u'], 'nada'), par('ler', 'mudo', 'mundo', ['u', 'u~'], 'mato')] }
  },
  {
    unidade: 'TF-30', tipo: 'regra-mn', bloco: 4, letra: 'M', rotulo: 'ão', titulo: 'M antes de P e B; ÃO, ÃE e ÕE', habilidadeRegra: 'regra-m-n',
    objetivo: 'Escrever o som do nariz com M antes de P e B (campo, bomba) e ler ão, ãe, õe e o -em do fim (mão, mãe, tem)',
    apresentacao: {
      fonema: 'a~', letra: 'M',
      partes: [
        { explica: 'Antes de P e B, o som do nariz se escreve com M.', palavras: [{ palavra: 'CAMPO', destaque: 2 }, { palavra: 'BOMBA', destaque: 2 }] },
        { explica: 'Com til, o A e o O do fim fazem ão.', palavras: [{ palavra: 'MÃO', destaque: 1, som: 'a~' }, { palavra: 'PÃO', destaque: 1, som: 'a~' }] },
        { explica: 'E o EM do fim soa assim.', palavras: [{ palavra: 'TEM', destaque: 1, som: 'e~' }] }
      ],
      fecha: 'Cada som do nariz tem o seu jeito de escrever!'
    },
    regra: [
      { mostrar: 'CA_PO', palavra: 'campo', certa: 'M', outras: ['N', 'P'], som: 'a~' }, { mostrar: 'TA_PA', palavra: 'tampa', certa: 'M', outras: ['N', 'B'], som: 'a~' },
      { mostrar: 'BO_BA', palavra: 'bomba', certa: 'M', outras: ['N', 'D'], som: 'o~' }, { mostrar: 'O_DA', palavra: 'onda', certa: 'N', outras: ['M', 'D'], som: 'o~' },
      { mostrar: 'M_O', palavra: 'mão', certa: 'Ã', outras: ['A', 'O'], som: 'a~' }
    ],
    sintese: [['mão', 'mão', 'pão', 'mamãe'], ['campo', 'campo', 'canto', 'tampa'], ['bomba', 'bomba', 'boba', 'pomba']],
    leitura: [{ palavra: 'mão', outras: ['pão', 'mamãe'] }, { palavra: 'pão', outras: ['mão', 'pato'] }, { palavra: 'tampa', outras: ['tapa', 'tanto'] }, { palavra: 'pomba', outras: ['bomba', 'ponte'] }, { palavra: 'tem', outras: ['bem', 'tia'] }],
    pseudo: [['tampu', 'tapu', 'tantu'], ['lombi', 'lobi', 'londi']],
    ditado: ['MÃO', 'PÃO', 'CAMPO', 'BOMBA'],
    desafio: { pares: [par('ler', 'tampa', 'tapa', ['a~', 'a'], 'tatu'), par('ler', 'bomba', 'boba', ['o~', 'o'], 'bola')] }
  },
  {
    unidade: 'TF-R4', tipo: 'revisao', bloco: 4, ate: 'TF-30', rotulo: '★', titulo: 'Revisão: vogais abertas e nasais', objetivo: 'Ler, escrever e comparar é, ó, ê, ô e os sons do nariz',
    revisaoLetras: ['É', 'Ó', 'Ã', 'EN', 'IN', 'ON', 'UN'],
    sintese: [['vovó', 'vovó', 'vovô', 'ovo'], ['mão', 'mão', 'pão', 'mamãe'], ['bola', 'bola', 'mola', 'cola']],
    pseudo: [['lantu', 'latu', 'lanta'], ['tindu', 'tidu', 'tinda']],
    ditado: ['PÉ', 'LÃ', 'DENTE', 'MUNDO', 'BOLA'],
    desafio: {
      pares: [par('ouvir', 'vovó', 'vovô', ['O', 'o'], 'vela'), par('ler', 'lindo', 'lido', ['i~', 'i'], 'lado'), par('ler', 'conta', 'cota', ['o~', 'O'], 'canto'), par('ler', 'manta', 'mata', ['a~', 'a'], 'nata')],
      frase: frase('A vovó viu o pão.', 'O que a vovó viu?', 'pão', ['pão', 'pé', 'bola']), eco: true
    }
  },
  // BLOCO 5 · R (só TF-31 e TF-32 por enquanto; R no fim da sílaba, RR e H mudo são TF-33…35)
  {
    unidade: 'TF-31', tipo: 'consoante', bloco: 5, letra: 'R', rotulo: 'r', titulo: 'O R do começo (rato)', objetivo: 'Ligar o R do começo da palavra ao som forte (rato, rua): todo sotaque vale',
    sintese: [['rato', 'rato', 'pato', 'gato'], ['rua', 'rua', 'lua', 'uva'], ['roda', 'roda', 'rato', 'bola']],
    leitura: [{ palavra: 'rato', outras: ['pato', 'gato'] }, { palavra: 'rua', outras: ['lua', 'uva'] }, { palavra: 'roda', outras: ['rato', 'bola'] }, { palavra: 'rei', outras: ['lei', 'ai'] }],
    pseudo: [['rafu', 'lafu', 'rafa'], ['rupi', 'lupi', 'rupa']],
    caixas: ['rato', 'rua', 'rei'],
    desafio: {
      frase: frase('O rato viu a roda.', 'O que o rato viu?', 'roda', ['roda', 'rua', 'bola']),
      trocas: [troca('trocar', 'pato', 'rato', 0, 'R', ['R', 'L', 'B'], ['rato', 'pato', 'lato']), troca('trocar', 'lua', 'rua', 0, 'R', ['R', 'L', 'N'], ['rua', 'lua', 'nua'])]
    }
  },
  {
    unidade: 'TF-32', tipo: 'regra-r', bloco: 5, letra: 'R', rotulo: 'r·r', titulo: 'O R fraco (arara)', habilidadeRegra: 'regra-r',
    objetivo: 'Ler o R entre vogais com o som fraco (cara, arara)',
    // MP p. 88: gato ronronando = R fraco (cachorro rosnando = R forte); o R fraco não começa palavra (ABC p. 120)
    somProprio: { fonema: 'r', letra: 'R', brincadeira: 'Faz de conta que você é um gatinho ronronando no colo.', apoio: 'R, de arara.', cena: 'cena-r-fraco' },
    regra: [
      { mostrar: 'CA_A', palavra: 'cara', certa: 'R', outras: ['L', 'D'], som: 'r' }, { mostrar: 'PE_A', palavra: 'pera', certa: 'R', outras: ['L', 'N'], som: 'r' },
      { mostrar: 'MU_O', palavra: 'muro', certa: 'R', outras: ['L', 'D'], som: 'r' }, { mostrar: 'ARA_A', palavra: 'arara', certa: 'R', outras: ['L', 'N'], som: 'r' }
    ],
    sintese: [['cara', 'cara', 'cala', 'vara'], ['muro', 'muro', 'mudo', 'puro'], ['pera', 'pera', 'pela', 'fera']],
    leitura: [{ palavra: 'cara', outras: ['cala', 'vara'] }, { palavra: 'muro', outras: ['mudo', 'puro'] }, { palavra: 'arara', outras: ['arada', 'alala'] }, { palavra: 'fera', outras: ['vela', 'pera'] }],
    pseudo: [['furi', 'fuli', 'fudi'], ['lari', 'lali', 'ladi']],
    caixas: ['cara', 'muro', 'pera'],
    desafio: {
      frase: frase('A arara viu o pato.', 'Quem a arara viu?', 'pato', ['pato', 'gato', 'sapo']),
      pares: [par('ler', 'pera', 'pela', ['r', 'l'], 'pata'), par('ler', 'cara', 'cala', ['r', 'l'], 'cada'), par('ler', 'pela', 'pera', ['l', 'r'], 'vela')]
    }
  }
];

/* ------------------------------------------------------------------------------------------------------------ */
/* construção das fases                                                                                          */
/* ------------------------------------------------------------------------------------------------------------ */

/** Lição que ensina letra (ou grafema) nova. */
const ensinaLetra = (l: Licao) => l.tipo === 'vogal' || l.tipo === 'consoante' || l.tipo === 'grafema';
/** As letras (ou grafemas) novas da lição. */
const letrasDa = (l: Licao): string[] => (l.letras ?? (l.letra ? [l.letra] : []));
/** Ordem das letras ensinadas (para revisão cumulativa e distratores). */
const ORDEM: string[] = LICOES_TF.filter(ensinaLetra).flatMap(letrasDa);
const letrasAte = (unidade: string) => {
  const n = numeroDaUnidade(unidade);
  return LICOES_TF.filter((l) => ensinaLetra(l) && numeroDaUnidade(l.unidade) <= n).flatMap(letrasDa);
};
/** Unidade que vale para o que já foi ensinado (a revisão de bloco vale como a última unidade do bloco). */
const efetiva = (li: Licao) => li.ate ?? li.unidade;

/** Habilidade dos grafemas novos (docs/pedagogia/02 §4: FG-AB-01 e FG-NAS-01 a 05). */
const HABILIDADE_DO_GRAFEMA: Record<string, string> = {
  É: 'e-aberto-fechado', Ê: 'e-aberto-fechado', Ó: 'o-aberto-fechado', Ô: 'o-aberto-fechado',
  Ã: 'gpc-nasal-a', EN: 'gpc-nasal-e', IN: 'gpc-nasal-i', ON: 'gpc-nasal-o', UN: 'gpc-nasal-u'
};
/** Habilidade da relação som ↔ letra de cada letra da trilha (docs/pedagogia/02 §4). */
export const habilidadeTF = (letra: string): string =>
  HABILIDADE_DO_GRAFEMA[letra] ?? (ehVogal(letra) ? `vogal-${letra.toLowerCase()}` : letra === 'C' ? 'gpc-c' : `gpc-${letra.toLowerCase()}`);
const ehVogal = (x: string) => 'AEIOU'.includes(x);

/**
 * Sons "duvidosos" e de estouro (docs/pedagogia/03 §5; app/docs/auditoria-sons-letras.md): não são o ÚNICO estímulo
 * de item que conta. Para eles o estímulo é uma sílaba falada pela Sofia, com o som colado à vogal.
 */
export const SILABA_DO_SOM: Record<string, string> = {
  L: 'la', V: 'vo', J: 'ja', P: 'pa', T: 'ta', B: 'bo', C: 'ca', D: 'dá', G: 'ga', M: 'ma', F: 'fa', S: 'sa', N: 'ne',
  // Ã e R forte também são "duvidosos" no mapa (a nasalidade não é medida; o R muda com o sotaque): a Sofia diz o som esticado
  Ã: 'ãããã', R: 'rrrrá'
};
export const SONS_DUVIDOSOS = ['L', 'V', 'J', 'P', 'T', 'B', 'C', 'D', 'G', 'Ã', 'R'];
const duvidoso = (x: string) => SONS_DUVIDOSOS.includes(x);

const opLetra = (x: string): Opcao => ({ id: x, rotulo: x, letra: x, som: letraDe(x).fonema! });
const opSom = (fonema: string): Opcao => ({ id: `som:${fonema}`, rotulo: '', som: fonema, botaoDeSom: true });
const opSilaba = (x: string): Opcao => ({ id: `silaba:${SILABA_DO_SOM[x]}`, rotulo: '', falar: SILABA_DO_SOM[x], botaoDeSom: true });
const opPalavraFalada = (w: string): Opcao => ({ id: w, rotulo: '', falar: w, botaoDeSom: true });
/** Figura como opção: o nome da figura é o id; tocar no botãozinho fala o nome (R10). */
const opFigura = (w: string): Opcao => ({ id: w, rotulo: w, figura: '', falar: w });
const temFigura = (w: string) => !!BANCO[w]?.figura;

/** Posição determinística (o app sorteia na tela; no modo de teste vale esta ordem). */
let giro = 0;
function posicionar<T>(certa: T, outras: T[]): T[] {
  const l = [...outras];
  l.splice(giro++ % (outras.length + 1), 0, certa);
  return l;
}

/** Distratoras: letras já ensinadas; depois de ensinados os dois sons de um par confundível, o par entra (R7). */
function distratorasDe(x: string, ate: string, n: number, salto = 0, pool?: string[]): string[] {
  const fx = letraDe(x).fonema!;
  const vistas = (pool ?? letrasAte(ate)).filter((y) => y !== x && letraDe(y).fonema !== fx);
  const parceira = vistas.find((y) => parConfuso(fx, letraDe(y).fonema!));
  const resto = vistas.filter((y) => y !== parceira);
  const k = salto % Math.max(1, resto.length);
  const girado = [...resto.slice(k), ...resto.slice(0, k)].reverse();
  // no começo da trilha ainda há poucas letras ensinadas: completa com vogais e letras de som distante (conhecidas da Trilha A–Z)
  const reserva = ['A', 'I', 'U', 'E', 'O', 'M', 'S', 'F'].filter((y) => y !== x && !vistas.includes(y) && letraDe(y).fonema !== fx && !parConfuso(fx, letraDe(y).fonema!));
  return [...(parceira ? [parceira] : []), ...girado, ...reserva].slice(0, n);
}

/** Som → letra (o som real, ou a sílaba falada para os sons duvidosos). */
function itemSomLetra(x: string, ate: string, salto = 0, pool?: string[]): ItemEscolha {
  const l = letraDe(x);
  const outras = distratorasDe(x, ate, 2, salto, pool);
  const base = { habilidade: habilidadeTF(x), correta: x, opcoes: posicionar(opLetra(x), outras.map(opLetra)), somCorreta: l.fonema!, apoio: f(l.voz, falaApoio(l)), formato: 'som-letra' as const };
  if (duvidoso(x)) return { ...base, quem: 'sofia', ouvir: SILABA_DO_SOM[x] };
  return { ...base, quem: l.voz, somAlvo: l.fonema! };
}

/** Letra → som (botões de som; sílabas faladas para os sons duvidosos). */
function itemLetraSom(x: string, ate: string, salto = 0): ItemEscolha {
  const l = letraDe(x);
  if (duvidoso(x)) {
    const outras = distratorasDe(x, ate, 4, salto).filter((y) => SILABA_DO_SOM[y]).slice(0, 2);
    const extras = ['M', 'F', 'S', 'L', 'N'].filter((y) => y !== x && !outras.includes(y) && SILABA_DO_SOM[y]);
    const todas = [...outras, ...extras].slice(0, 2);
    return { quem: 'sofia', mostrar: x, habilidade: habilidadeTF(x), correta: `silaba:${SILABA_DO_SOM[x]}`, opcoes: posicionar(opSilaba(x), todas.map(opSilaba)), apoio: f(l.voz, falaApoio(l)), formato: 'letra-som' };
  }
  const outras = distratorasDe(x, ate, 4, salto).filter((y) => !duvidoso(y)).slice(0, 2);
  const extras = ['A', 'I', 'U', 'M', 'S', 'F'].filter((y) => y !== x && !outras.includes(y) && !parConfuso(letraDe(y).fonema!, l.fonema!));
  const todas = [...outras, ...extras].slice(0, 2);
  return { quem: l.voz, mostrar: x, habilidade: habilidadeTF(x), correta: `som:${l.fonema}`, opcoes: posicionar(opSom(l.fonema!), todas.map((y) => opSom(letraDe(y).fonema!))), apoio: f(l.voz, falaApoio(l)), formato: 'letra-som' };
}

/** Vogais: "qual figura começa com este som?" (som inicial), com figuras que começam com outras vogais. */
function itemFiguraVogal(x: string, palavra: string, salto: number): ItemEscolha {
  const l = letraDe(x);
  const outras = ['A', 'E', 'I', 'O', 'U'].filter((y) => y !== x && !parConfuso(letraDe(y).fonema!, l.fonema!));
  const escolhidas = [outras[salto % outras.length], outras[(salto + 1) % outras.length]];
  const figs = escolhidas.map((y) => ({ fig: figurasDoSom(letraDe(y))[salto % figurasDoSom(letraDe(y)).length], som: letraDe(y).fonema! }));
  return {
    quem: l.voz, somAlvo: l.fonema!, somCorreta: l.fonema!, habilidade: habilidadeTF(x), correta: palavra, formato: 'som-figura', apoio: f(l.voz, falaApoio(l)),
    opcoes: posicionar({ ...opFigura(palavra), som: l.fonema! }, figs.map((g) => ({ ...opFigura(g.fig), som: g.som })))
  };
}

const escolher = (habilidade: string, enunciado: Fala, itens: ItemEscolha[], extra: Partial<AtividadeEscolher> = {}): AtividadeEscolher => ({
  tipo: 'escolher', estilo: 'tocar', habilidade, enunciado, itens, ...extra
});

function cenaRevisao(id: string, li: Licao): Cena | null {
  const antes = li.revisaoLetras ?? letrasAte(efetiva(li)).filter((x) => !letrasDa(li).includes(x));
  if (!antes.length) return null;
  const itens = antes.map((x, k) => itemSomLetra(x, efetiva(li), k, antes));
  // nas revisões de bloco entra também o outro sentido: ver a letra e achar o som
  if (li.revisaoLetras || li.tipo === 'revisao-vogais') itens.push(...antes.map((x, k) => itemLetraSom(x, efetiva(li), k)));
  return {
    id, tipo: 'C1', titulo: 'Os sons que você já sabe', cenario: 'praca', contaDominio: true,
    atividade: escolher(habilidadeTF(antes[antes.length - 1]), sofia(FALAS_TRILHA_SONS.revisao), itens, { sortear: Math.min(li.revisaoLetras ? 6 : 3, itens.length), estilo: 'revisao' })
  };
}

function cenaSomNovo(id: string, li: Licao, x: string = li.letra!): Cena {
  const l = letraDe(x);
  const hab = habilidadeTF(x);
  if (li.apresentacao) {
    const a = li.apresentacao;
    return {
      id, tipo: 'C2', titulo: li.titulo, cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'somNovo', habilidade: li.habilidadeRegra!, fonema: a.fonema, letra: a.letra, enunciado: sofia(FALAS_TRILHA_SONS.acolhidaRegra), revela: sofia(FALAS_TRILHA_SONS.revela),
        regra: { partes: a.partes.map((p) => ({ explica: sofia(p.explica), palavras: p.palavras })), ...(a.fecha ? { fecha: sofia(a.fecha) } : {}) }
      }
    };
  }
  if (li.somProprio) {
    const sp = li.somProprio;
    return {
      id, tipo: 'C2', titulo: 'Som novo', cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'somNovo', habilidade: li.habilidadeRegra!, fonema: sp.fonema, letra: sp.letra, cena: sp.cena, enunciado: sofia(FALAS_TRILHA_SONS.somNovo),
        brincadeira: sofia(sp.brincadeira), repita: sofia('Repita comigo!'), revela: sofia(FALAS_TRILHA_SONS.revela), apoio: sofia(sp.apoio)
      }
    };
  }
  if (li.tipo === 'regra-final') {
    return {
      id, tipo: 'C2', titulo: 'O segredo do fim da palavra', cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'somNovo', habilidade: 'regra-vogal-final', fonema: 'u', letra: 'O', enunciado: sofia(FALAS_TRILHA_SONS.acolhidaRegra), revela: sofia(FALAS_TRILHA_SONS.revela),
        regra: {
          partes: [
            { explica: sofia(FALAS_TRILHA_SONS.regraO), palavras: [{ palavra: 'OVO', destaque: 2, som: 'u' }, { palavra: 'FOFO', destaque: 3, som: 'u' }] },
            { explica: sofia(FALAS_TRILHA_SONS.regraE), palavras: [{ palavra: 'ELE', destaque: 2, som: 'i' }, { palavra: 'VALE', destaque: 3, som: 'i' }] }
          ]
        }
      }
    };
  }
  if (li.tipo === 'regra-tidi') {
    return {
      id, tipo: 'C2', titulo: 'O T e o D antes do I', cenario: 'licao', contaDominio: true,
      atividade: {
        tipo: 'somNovo', habilidade: 'regra-ti-di', fonema: 't', letra: 'T', enunciado: sofia(FALAS_TRILHA_SONS.acolhidaRegra), revela: sofia(FALAS_TRILHA_SONS.revela),
        regra: {
          partes: [
            { explica: sofia(FALAS_TRILHA_SONS.regraT), palavras: [{ palavra: 'TIA', destaque: 0 }, { palavra: 'TOMATE', destaque: 4 }] },
            { explica: sofia(FALAS_TRILHA_SONS.regraD), palavras: [{ palavra: 'DIA', destaque: 0 }] }
          ],
          fecha: sofia(FALAS_TRILHA_SONS.regraVale)
        }
      }
    };
  }
  return {
    id, tipo: 'C2', titulo: 'Som novo', cenario: 'licao', contaDominio: true,
    atividade: {
      tipo: 'somNovo', habilidade: hab, fonema: l.fonema!, letra: l.letra, enunciado: sofia(FALAS_TRILHA_SONS.somNovo), ...(CENA_DO_GRAFEMA[x] ? { cena: CENA_DO_GRAFEMA[x] } : {}),
      brincadeira: f(l.voz, l.brincadeira), repita: f(l.voz, 'Repita comigo!'), revela: sofia(FALAS_TRILHA_SONS.revela), apoio: f(l.voz, APOIO_DO_GRAFEMA[x] ?? falaChave(l))
    }
  };
}

/** Os dois sentidos da relação som ↔ letra (FG), em duas cenas, e o som inicial nas vogais. */
function cenasAcharLetra(id: string, li: Licao): Cena[] {
  const x = li.letra!;
  const l = letraDe(x);
  const hab = habilidadeTF(x);
  const ate = efetiva(li);
  const novas = letrasDa(li);
  // primeira vez: só o sentido som → letra (4 itens, distratoras diferentes); letra → som fica para as revisões.
  // Com dois grafemas novos (TF-23: É e Ó), dois itens de cada, alternados.
  const itens = novas.length > 1 ? [0, 1, 2, 3].map((k) => itemSomLetra(novas[k % novas.length], ate, k)) : [0, 1, 2, 3].map((k) => itemSomLetra(x, ate, k));
  const cenas: Cena[] = [
    {
      id: `${id}a`, tipo: 'C3', titulo: 'Ouça o som e ache a letra', cenario: 'quintal', contaDominio: true,
      atividade: escolher(hab, duvidoso(x) ? sofia(FALAS_TRILHA_SONS.silabaLetra) : f(l.voz, 'Ouça e toque na letra.'), itens)
    }
  ];
  if (li.tipo === 'vogal') {
    cenas.push({
      id: `${id}c`, tipo: 'C3', titulo: 'Qual começa com o som?', cenario: 'quintal', contaDominio: true,
      atividade: escolher(hab, f(l.voz, FALAS_FONICAS.qualFigura), figurasDoSom(l).slice(0, 3).map((w, k) => itemFiguraVogal(x, w, k)), { estilo: 'cacar', sortear: 2 })
    });
  }
  return cenas;
}

/** A REGRA (TF-12, TF-22) com resposta conferida: ouve a palavra e escolhe a letra do som que falta. */
function cenaRegra(id: string, li: Licao, habilidade: string): Cena | null {
  if (!li.regra?.length) return null;
  const itens: ItemEscolha[] = li.regra.map((r) => ({
    mostrar: r.mostrar, ouvir: r.palavra, quem: 'sofia', correta: r.certa, somCorreta: r.som, habilidade, formato: 'fonema-falta',
    opcoes: posicionar(opLetra(r.certa), r.outras.map(opLetra))
  }));
  return { id, tipo: 'C3', titulo: 'Qual letra escreve este som?', cenario: 'quintal', contaDominio: true, atividade: escolher(habilidade, sofia(FALAS_FONICAS.qualSomFalta), itens) };
}

function cenaSintese(id: string, li: Licao, habilidade = 'sintese'): Cena | null {
  if (!li.sintese?.length) return null;
  const itens = li.sintese.map(([w, ...ops]) => {
    const figuras = ops.every(temFigura);
    return { ...comSons(w), correta: w, opcoes: posicionar(figuras ? opFigura(ops[0]) : opPalavraFalada(ops[0]), ops.slice(1).map((o) => (figuras ? opFigura(o) : opPalavraFalada(o)))) };
  });
  return { id, tipo: 'C3', titulo: 'Junte os sons', cenario: 'licao', contaDominio: true, atividade: { tipo: 'sintese', habilidade, enunciado: sofia(FALAS_TRILHA_SONS.sintese), itens } };
}

/** Ler palavras novas: ler e tocar a figura (quando há figura) e ouvir as leituras (palavras reais e INVENTADAS). */
function cenasLeitura(id: string, li: Licao, habilidade = 'leitura-cvcv'): Cena[] {
  const comFigura: ItemEscolha[] = [];
  const faladas: ItemEscolha[] = [];
  for (const { palavra, outras } of li.leitura ?? []) {
    if (temFigura(palavra) && outras.every(temFigura)) {
      comFigura.push({ mostrar: palavra.toUpperCase(), correta: palavra, opcoes: posicionar(opFigura(palavra), outras.map(opFigura)), leitura: true, formato: 'ler-figura' });
    } else {
      faladas.push({ mostrar: palavra.toUpperCase(), correta: palavra, opcoes: posicionar(opPalavraFalada(palavra), outras.map(opPalavraFalada)), leitura: true, formato: 'ouvir-leituras' });
    }
  }
  for (const [alvo, ...erradas] of li.pseudo ?? []) {
    faladas.push({ mostrar: alvo.toUpperCase(), correta: alvo, opcoes: posicionar(opPalavraFalada(alvo), erradas.map(opPalavraFalada)), leitura: true, pseudo: true, formato: 'ouvir-leituras' });
  }
  const out: Cena[] = [];
  if (comFigura.length) out.push({ id: `${id}a`, tipo: 'C4', titulo: 'Leia e toque na figura', cenario: 'quintal', contaDominio: true, atividade: escolher(habilidade, sofia(FALAS_TRILHA_SONS.lerFigura), comFigura) });
  // as inventadas ficam sempre (o domínio de leitura pede palavras inventadas com resposta conferida)
  if (faladas.length) out.push({ id: `${id}b`, tipo: 'C4', titulo: li.pseudo?.length ? 'Leia sozinho (e os bichinhos inventados)' : 'Leia sozinho', cenario: 'quintal', contaDominio: true, atividade: escolher(habilidade, sofia(FALAS_FONICAS.ouvirLeituras), faladas) });
  return out;
}

function cenaCaixas(id: string, li: Licao): Cena | null {
  if (!li.caixas?.length) return null;
  const ate = efetiva(li);
  const itens = li.caixas.map((w, k) => {
    const cs = comSons(w);
    const letrasDaPalavra = [...new Set([...cs.palavra])];
    // distratoras: o par confundível de cada letra (se já ensinado) e mais uma vogal ou consoante já vista
    const extras: string[] = [];
    for (const x of letrasDaPalavra) {
      if (ehVogal(x)) continue;
      const d = distratorasDe(x, ate, 1, k);
      if (d[0] && !letrasDaPalavra.includes(d[0]) && !extras.includes(d[0])) extras.push(d[0]);
    }
    const vogal = ['A', 'E', 'I', 'O', 'U'].find((v) => !letrasDaPalavra.includes(v) && !extras.includes(v));
    if (vogal) extras.push(vogal);
    if (cs.sons.includes('u') && cs.palavra.endsWith('O') && !letrasDaPalavra.includes('U')) extras.push('U');
    if (cs.sons.includes('i') && cs.palavra.endsWith('E') && !letrasDaPalavra.includes('I')) extras.push('I');
    return { ...cs, ...(temFigura(w) ? { figura: w } : {}), letras: [...letrasDaPalavra, ...extras.slice(0, 3)] };
  });
  return {
    id, tipo: 'C4', titulo: 'Caixas de sons', cenario: 'licao', contaDominio: true,
    atividade: { tipo: 'caixas', habilidade: 'segmentacao', habilidadeEscrita: 'escrita-cvcv', enunciado: sofia(FALAS_TRILHA_SONS.caixas), itens, caixasExtras: 1 }
  };
}

function cenaDitado(id: string, li: Licao): Cena | null {
  if (!li.ditado?.length) return null;
  const letras = [...new Set(li.ditado.join('').split(''))];
  const extras = (li.revisaoLetras ?? []).filter((x) => !letras.includes(x)).slice(0, 3);
  return {
    id, tipo: 'C5', titulo: 'Ditado', cenario: 'licao', contaDominio: true,
    atividade: { tipo: 'ditado', habilidade: 'escrita-cvcv', palavras: li.ditado, letras: [...letras, ...extras].sort(), enunciado: sofia(FALAS_TRILHA_SONS.ditado) }
  };
}

function contrastePrincipal(pares: ItemParMinimo[]): string {
  const n = new Map<string, number>();
  for (const p of pares) n.set(p.habilidade!, (n.get(p.habilidade!) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function cenasDesafio(id: string, li: Licao): Cena[] {
  const d = li.desafio;
  if (!d) return [];
  const out: Cena[] = [];
  if (d.pares?.length) {
    out.push({
      id: `${id}p`, tipo: 'C5', titulo: 'Palavras quase iguais', cenario: 'praca', contaDominio: true,
      // habilidade da atividade = o contraste mais frequente entre os itens (cada item grava o seu)
      atividade: { tipo: 'parMinimo', habilidade: contrastePrincipal(d.pares), enunciado: sofia(FALAS_TRILHA_SONS.parMuda), itens: d.pares, ...(d.pares.length > 4 ? { sortear: 4 } : {}) }
    });
  }
  if (d.trocas?.length) {
    out.push({
      id: `${id}t`, tipo: 'C5', titulo: d.trocas.every((t) => t.acao === 'acrescentar') ? 'Mais uma letra' : 'Troca-letras', cenario: 'praca', contaDominio: true,
      atividade: { tipo: 'troca', habilidade: 'troca-de-som', enunciado: sofia(d.trocas[0].acao === 'acrescentar' ? FALAS_TRILHA_SONS.trocaMais : FALAS_TRILHA_SONS.troca), itens: d.trocas }
    });
  }
  if (d.frase) {
    out.push({
      id: `${id}f`, tipo: 'C5', titulo: d.eco ? 'Leia a frase e leia junto' : 'Leia a frase', cenario: 'biblioteca', contaDominio: true,
      atividade: {
        tipo: 'frase', habilidade: 'leitura-frase', habilidadeCompreensao: 'compreensao-lida', enunciado: sofia(FALAS_TRILHA_SONS.frase), eco: !!d.eco,
        itens: [{ ...d.frase, palavras: [...new Set(d.frase.frase.replace(/[.!?,]/g, '').split(/\s+/))].map(comSons) }]
      }
    });
  }
  return out;
}

const CONQUISTAS_VOGAL: Record<string, string> = { A: 'S-SOM-A', E: 'S-SOM-E-E-E', I: 'S-SOM-I', O: 'S-SOM-O-O-O', U: 'S-SOM-U' };
const SELO_SOM: Record<string, string> = { M: 'S-SOM-M', F: 'S-SOM-F', L: 'S-SOM-L' };

function faseDaLicao(li: Licao, numero: number): Fase {
  const id = li.unidade;
  const cenas: Cena[] = [];
  const add = (c: Cena | null) => { if (c) cenas.push(c); };
  const revisaoDeBloco = li.tipo === 'revisao';
  const ehLicaoDeLetra = ensinaLetra(li);
  const regraNova = li.tipo === 'regra-aberta' || li.tipo === 'regra-mn' || li.tipo === 'regra-r';
  add(cenaRevisao(`${id}-C1`, li));
  if (ehLicaoDeLetra && letrasDa(li).length > 1) letrasDa(li).forEach((x, k) => add(cenaSomNovo(`${id}-C2${'ab'[k] ?? k}`, li, x)));
  else if (ehLicaoDeLetra || li.tipo === 'regra-final' || li.tipo === 'regra-tidi' || regraNova) add(cenaSomNovo(`${id}-C2`, li));
  if (ehLicaoDeLetra) {
    cenas.push(...cenasAcharLetra(`${id}-C3`, li));
    // o traçado fica na Trilha A–Z ("conhecer as letras"); aqui a lição é curta: som, leitura e escrita
  }
  if (li.tipo === 'revisao-vogais') {
    add({
      id: `${id}-C3`, tipo: 'C3', titulo: 'As cinco vogais', cenario: 'quintal', contaDominio: true,
      atividade: escolher('vogais', sofia('Ouça e toque na letra.'), ['A', 'E', 'I', 'O', 'U'].map((x, k) => ({ ...itemSomLetra(x, 'TF-05', k), habilidade: 'vogais' })), { sortear: 4 })
    });
  }
  if (li.tipo === 'regra-final') add(cenaRegra(`${id}-C3r`, li, 'regra-vogal-final'));
  if (li.tipo === 'regra-tidi') add(cenaRegra(`${id}-C3r`, li, 'regra-ti-di'));
  if (regraNova) add(cenaRegra(`${id}-C3r`, li, li.habilidadeRegra!));
  add(cenaSintese(`${id}-C3s`, li));
  cenas.push(...cenasLeitura(`${id}-C4`, li, li.tipo === 'revisao-vogais' ? 'leitura-vogais' : 'leitura-cvcv'));
  add(cenaCaixas(`${id}-C4c`, li));
  add(cenaDitado(`${id}-C5d`, li));
  // lição: um desafio só (frase > pares mínimos > troca-letras), para a sessão caber em 7–8 cenas; revisão: todos
  const desafios = cenasDesafio(`${id}-C5`, li);
  const prioridade = (c: Cena) => ({ frase: 0, parMinimo: 1, troca: 2 } as Record<string, number>)[c.atividade?.tipo ?? ''] ?? 3;
  cenas.push(...(revisaoDeBloco ? desafios : [...desafios].sort((a, b) => prioridade(a) - prioridade(b)).slice(0, 1)));

  const habsDaLetra = ehLicaoDeLetra ? letrasDa(li).map(habilidadeTF) : [];
  const habPrincipal = ehLicaoDeLetra ? habsDaLetra[0] : li.tipo === 'regra-final' ? 'regra-vogal-final' : li.tipo === 'regra-tidi' ? 'regra-ti-di' : regraNova ? li.habilidadeRegra! : li.tipo === 'revisao-vogais' ? 'vogais' : 'leitura-cvcv';
  const leituraHab = li.tipo === 'revisao-vogais' ? 'leitura-vogais' : 'leitura-cvcv';
  const temLeitura = !!(li.leitura?.length || li.pseudo?.length);
  // critério: domínio da relação som-letra da unidade (de cada grafema novo) + leitura (com palavras inventadas conferidas), quando há
  const criterio = [...new Set([...(revisaoDeBloco ? [] : [habPrincipal, ...habsDaLetra]), ...(temLeitura ? [leituraHab] : [])])];
  const habilidades = [...new Set(cenas.flatMap((c) => [c.atividade?.habilidade ?? '', ...(c.atividade?.tipo === 'escolher' ? c.atividade.itens.map((i) => i.habilidade ?? '') : [])]).filter(Boolean))];
  const conquistas = [
    ...(li.letra && li.tipo === 'vogal' ? [CONQUISTAS_VOGAL[li.letra]] : []),
    ...(li.letra && SELO_SOM[li.letra] && li.tipo === 'consoante' ? [SELO_SOM[li.letra]] : []),
    ...(cenas.some((c) => c.atividade?.tipo === 'sintese') ? ['S-R0-05'] : []),
    ...(temLeitura && li.tipo !== 'revisao-vogais' ? ['S-R2a-05'] : []),
    ...(revisaoDeBloco ? ['S-R2a-07'] : [])
  ];
  const tipoTrilha = revisaoDeBloco || li.tipo === 'revisao-vogais' ? 'revisao' : li.tipo.startsWith('regra') ? 'regra' : 'licao';
  const ipa = ehLicaoDeLetra ? letrasDa(li).map((x) => `/${letraDe(x).ipa?.replace(/\//g, '') ?? x.toLowerCase()}/`).join(' e ') : '';
  return {
    id, regiao: 'TF', numero, titulo: li.titulo, objetivo: li.objetivo, sessoesPrevistas: '1 lição (o avanço é por domínio)', curta: true,
    habilidades: [habPrincipal, ...habilidades.filter((h) => h !== habPrincipal)], cenas,
    criterio: criterio.length ? { tipo: 'dominio', habilidades: criterio } : { tipo: 'missao' },
    trilhaSons: { unidade: li.unidade, bloco: li.bloco, tipo: tipoTrilha, rotulo: li.rotulo },
    falaEntrada: sofia(FALAS_TRILHA_SONS.entrada),
    acolhida: sofia(tipoTrilha === 'revisao' ? FALAS_TRILHA_SONS.acolhidaRevisao : tipoTrilha === 'regra' ? FALAS_TRILHA_SONS.acolhidaRegra : FALAS_TRILHA_SONS.acolhida),
    gancho: sofia(FALAS_TRILHA_SONS.gancho),
    fechamento: `${li.titulo}: mais um passo na Trilha dos Sons.`,
    emCasa: li.letra && ehLicaoDeLetra
      ? `Brinquem de achar o som ${ipa} ${li.tipo === 'grafema' ? 'nas palavras' : 'no começo das palavras'}. Falem o SOM, não o nome da letra.`
      : 'Leiam juntos as palavras da lição em voz alta, devagar e até o fim, apontando cada letra.',
    conquistas
  };
}

/* ------------------------------------------------------------------------------------------------------------ */
/* lições em espera: só entra na jornada o que dá para tocar com os sons que existem                             */
/* ------------------------------------------------------------------------------------------------------------ */

/**
 * Sons puros PUBLICADOS no mapa de sons (web/public/audio/sons/mapa.json; aprovados e duvidosos). Um teste confere que esta
 * lista é igual à do mapa: quando um som novo for gravado e publicado (vogais nasais, R fraco), entra aqui e as lições que
 * dependem dele passam a entrar na jornada sozinhas.
 */
export const SONS_PUBLICADOS: string[] = ['a', 'E', 'e', 'i', 'O', 'o', 'u', 'a~', 'm', 'n', 'l', 'v', 'f', 's', 'x', 'z', 'j', 'rr', 'p', 'b', 't', 'd', 'k', 'g'];

/** Todos os sons puros que a fase toca: som novo, estímulos, botões de som, síntese, caixas, troca-letras e frases. */
export function fonemasDaFase(f: Fase): string[] {
  const s = new Set<string>();
  const add = (x: string | null | undefined) => { if (x) s.add(x); };
  for (const c of f.cenas) {
    const a = c.atividade;
    if (!a) continue;
    if (a.tipo === 'somNovo') { add(a.fonema); a.regra?.partes.forEach((p) => p.palavras.forEach((w) => add(w.som))); }
    if (a.tipo === 'escolher') for (const i of a.itens) { add(i.somAlvo); add(i.somCorreta); i.opcoes.forEach((o) => add(o.som)); }
    if (a.tipo === 'sintese' || a.tipo === 'caixas') for (const i of a.itens) i.sons.forEach(add);
    if (a.tipo === 'troca') for (const i of a.itens) add(i.som);
    if (a.tipo === 'frase') for (const i of a.itens) i.palavras.forEach((w) => w.sons.forEach(add));
  }
  return [...s];
}

/** Todas as fases escritas da Trilha dos Sons, na ordem da trilha (as da jornada e as em espera). */
export const TODAS_AS_FASES_TF: Fase[] = LICOES_TF.map((li, i) => faseDaLicao(li, i + 1));

/** Por que cada lição em espera ainda não entrou na jornada. */
export interface FaseEmEspera { fase: Fase; sonsQueFaltam: string[]; motivo: string }
const PRONTAS = (() => {
  let k = 0;
  while (k < TODAS_AS_FASES_TF.length && fonemasDaFase(TODAS_AS_FASES_TF[k]).every((x) => SONS_PUBLICADOS.includes(x))) k++;
  return k;
})();

/** As fases da Trilha dos Sons que estão na JORNADA, na ordem: as lições prontas até a primeira em espera (a trilha não se pula). */
export const FASES_TF: Fase[] = TODAS_AS_FASES_TF.slice(0, PRONTAS);

/** Lições escritas e conferidas que esperam um som puro (delas ou de uma lição anterior); ficam fora da jornada. */
export const FASES_TF_EM_ESPERA: FaseEmEspera[] = TODAS_AS_FASES_TF.slice(PRONTAS).map((fase) => {
  const sonsQueFaltam = fonemasDaFase(fase).filter((x) => !SONS_PUBLICADOS.includes(x));
  const primeira = TODAS_AS_FASES_TF[PRONTAS];
  return {
    fase, sonsQueFaltam,
    motivo: [sonsQueFaltam.length ? `aguardando som: ${sonsQueFaltam.join(', ')}` : '', fase !== primeira ? `vem depois de ${primeira.id} (a trilha não se pula)` : ''].filter(Boolean).join('; ')
  };
});

/* ------------------------------------------------------------------------------------------------------------ */
/* leituras faladas sem clipe: os sons puros emendados                                                           */
/* ------------------------------------------------------------------------------------------------------------ */

const SOM_DA_LETRA: Record<string, string> = {
  a: 'a', á: 'a', â: 'a', ã: 'a~', e: 'e', é: 'E', ê: 'e', i: 'i', í: 'i', o: 'o', ó: 'O', ô: 'o', u: 'u', ú: 'u',
  b: 'b', d: 'd', f: 'f', g: 'g', j: 'j', l: 'l', m: 'm', n: 'n', p: 'p', t: 't', v: 'v', z: 'z', x: 'x'
};
const NASAL_DE: Record<string, string> = { a: 'a~', â: 'a~', e: 'e~', ê: 'e~', i: 'i~', o: 'o~', ô: 'o~', u: 'u~' };
/**
 * Sons de uma leitura falada que não está no banco (as leituras ERRADAS das opções: "lupê", "dové"…), pelas regras simples
 * da trilha: vogal + M/N no fim da sílaba = vogal nasal; E e O do fim sem acento = I e U; C e G antes de A, O, U; R do começo
 * forte, R entre vogais fraco. `null` = letra sem som próprio ali.
 */
function sonsDeduzidos(w: string): (string | null)[] {
  const out: (string | null)[] = [];
  const acento = /[áâãéêíóôú]/.test(w);
  const gs = grafemas(w);
  gs.forEach((g, k) => {
    const c = g.g;
    const ultimo = k === gs.length - 1;
    let som: string | undefined;
    if (c.length === 2 && NASAL_DE[c[0]] && 'mn'.includes(c[1])) som = NASAL_DE[c[0]];
    else if (c === 'e' && ultimo && !acento && w.length > 2) som = 'i';
    else if (c === 'o' && ultimo && !acento && w.length > 2) som = 'u';
    else if (c === 'c') som = /[eiéêí]/.test(w[g.i + 1] ?? '') ? 's' : 'k';
    else if (c === 's') som = g.i === 0 ? 's' : 'z';
    else if (c === 'r') som = g.i === 0 ? 'rr' : 'r';
    else som = SOM_DA_LETRA[c[0]];
    out.push(som ?? null);
    for (let j = 1; j < c.length; j++) out.push(null);
  });
  return out;
}

/**
 * LEITURAS FALADAS da Trilha dos Sons (palavras, palavras inventadas, as leituras erradas das opções, palavras ditas nas caixas,
 * nos pares e na troca-letras) com os sons puros de cada letra. Quando a leitura ainda não tem clipe de voz gravado, o app toca
 * estes sons emendados, bem ligeiro (web/src/servicos/voz.ts): a lição funciona com os sons que existem e a voz entra depois.
 * [DP] É uma ponte até a gravação (app/docs/falas-pendentes.md), não substitui a voz.
 */
export const LEITURAS_EM_SONS: Record<string, (string | null)[]> = (() => {
  const ws = new Set<string>();
  const add = (t?: string) => { if (t && /^[a-záâãéêíóôõú]+$/.test(t)) ws.add(t); };
  for (const f of TODAS_AS_FASES_TF) for (const c of f.cenas) {
    const a = c.atividade;
    if (!a) continue;
    if (a.tipo === 'escolher') for (const i of a.itens) { add(i.ouvir); i.opcoes.forEach((o) => add(o.falar)); }
    if (a.tipo === 'sintese') for (const i of a.itens) { add(i.correta); i.opcoes.forEach((o) => add(o.falar)); }
    if (a.tipo === 'caixas') for (const i of a.itens) add(i.palavra.toLowerCase());
    if (a.tipo === 'ditado') for (const w of a.palavras) add(w.toLowerCase());
    if (a.tipo === 'parMinimo') for (const i of a.itens) { add(i.alvo); add(i.outra); add(i.distrator); }
    if (a.tipo === 'troca') for (const i of a.itens) i.leituras.forEach(add);
  }
  return Object.fromEntries([...ws].map((w) => [w, BANCO[w] ? comSons(w).sons : sonsDeduzidos(w)]));
})();

/** Revisão de bloco → a última unidade do bloco (o que já foi ensinado ao chegar nela). */
export const UNIDADE_DA_REVISAO_TF: Record<string, string> = Object.fromEntries(LICOES_TF.filter((l) => l.ate).map((l) => [l.unidade, l.ate!]));

/** Letras ensinadas pela trilha, na ordem (para a tela da trilha). */
export const LETRAS_DA_TRILHA_SONS = ORDEM;
