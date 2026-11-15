/**
 * TF · TRILHA DOS SONS (D030 etapas 6–8): a trilha fônica que ENSINA A LER. Blocos 1, 2 e 3 de
 * docs/pedagogia/01-escopo-e-sequencia.md: vogais (TF-01…06), consoantes que se prolongam (TF-07…15) e consoantes de
 * estouro (TF-16…22), com uma revisão no fim dos blocos 2 e 3. A Trilha A–Z continua como "conhecer as letras".
 *
 * Roteiro de cada lição (docs/pedagogia/04 §4 [DP]; "eu faço, nós fazemos, você faz": ABC p. 306, 320; VT-PE p. 32):
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
import { LETRA_POR_ID, falaChave, type LetraAlfabeto } from '../alfabeto.ts';
import { FALAS_FONICAS, parConfuso } from '../sons.ts';
import { analisar, numeroDaUnidade } from '../decodificabilidade.ts';
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
  R: 'rr', p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', tʃ: 't', dʒ: 'd'
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

type Tipo = 'vogal' | 'consoante' | 'revisao-vogais' | 'regra-final' | 'regra-tidi' | 'revisao';
interface Leitura { palavra: string; outras: string[] }
interface Desafio { pares?: ItemParMinimo[]; trocas?: ItemTroca[]; frase?: Omit<ItemFrase, 'palavras'>; eco?: boolean }
interface Licao {
  unidade: string;
  tipo: Tipo;
  bloco: number;
  /** Letra nova (maiúscula). */
  letra?: string;
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

const par = (modo: 'ouvir' | 'ler', alvo: string, outra: string, sons: [string, string], habilidade?: string): ItemParMinimo => ({
  modo, alvo, outra, sons, ...(modo === 'ouvir' ? { figuraAlvo: alvo, figuraOutra: outra } : {}), ...(habilidade ? { habilidade } : {})
});
const troca = (acao: 'trocar' | 'acrescentar', de: string, para: string, posicao: number, letra: string, letras: string[], leituras: string[]): ItemTroca => ({
  acao, de: de.toUpperCase(), para: para.toUpperCase(), posicao, letra, som: LETRA_POR_ID[letra].fonema!, letras, leituras
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
    desafio: { pares: [par('ouvir', 'faca', 'vaca', ['f', 'v'], 'par-minimo-f-v'), par('ouvir', 'vaca', 'faca', ['v', 'f'], 'par-minimo-f-v'), par('ler', 'via', 'fia', ['v', 'f'], 'par-minimo-f-v'), par('ler', 'fia', 'via', ['f', 'v'], 'par-minimo-f-v')] }
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
    desafio: { pares: [par('ler', 'selo', 'zelo', ['s', 'z'], 'par-minimo-s-z'), par('ler', 'zelo', 'selo', ['z', 's'], 'par-minimo-s-z'), par('ler', 'zoa', 'soa', ['z', 's'], 'par-minimo-s-z'), par('ler', 'soa', 'zoa', ['s', 'z'], 'par-minimo-s-z')] }
  },
  {
    unidade: 'TF-15', tipo: 'consoante', bloco: 2, letra: 'J', rotulo: 'j', titulo: 'O som /j/', objetivo: 'Ligar o som /j/ à letra J',
    sintese: [['sujo', 'sujo', 'suja', 'sumo'], ['veja', 'veja', 'seja', 'vela'], ['jaula', 'jaula', 'aula', 'jaca']],
    leitura: [{ palavra: 'sujo', outras: ['suja', 'sumo'] }, { palavra: 'veja', outras: ['seja', 'vela'] }, { palavra: 'jaula', outras: ['aula', 'jaca'] }],
    pseudo: [['jufa', 'zufa', 'jufo'], ['jali', 'zali', 'jala']],
    caixas: ['sujo', 'veja'],
    desafio: { frase: frase('A mula suja sai.', 'Quem sai?', 'mula', ['mula', 'lula', 'mala']) }
  },
  {
    unidade: 'TF-R2', tipo: 'revisao', bloco: 2, ate: 'TF-15', rotulo: '★', titulo: 'Revisão: sons que esticam', objetivo: 'Ler, escrever e comparar M, F, V, L, S, N, Z e J',
    revisaoLetras: ['M', 'F', 'V', 'L', 'S', 'N', 'Z', 'J'],
    sintese: [['lua', 'lua', 'lula', 'uva'], ['sala', 'sala', 'mala', 'fala'], ['novo', 'novo', 'ovo', 'nove']],
    pseudo: [['fami', 'mafi', 'fama'], ['zufa', 'sufa', 'zafa']],
    ditado: ['LUA', 'MALA', 'OVO', 'NAVE'],
    desafio: {
      pares: [par('ouvir', 'faca', 'vaca', ['f', 'v'], 'par-minimo-f-v'), par('ler', 'selo', 'zelo', ['s', 'z'], 'par-minimo-s-z'), par('ler', 'via', 'fia', ['v', 'f'], 'par-minimo-f-v')],
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
    pseudo: [['bufi', 'pufi', 'bufa'], ['labu', 'lapu', 'labi']],
    caixas: ['boi', 'bolo', 'bala'],
    desafio: {
      pares: [par('ouvir', 'mala', 'bala', ['m', 'b']), par('ler', 'pato', 'bato', ['p', 'b'], 'par-minimo-p-b'), par('ler', 'bato', 'pato', ['b', 'p'], 'par-minimo-p-b'), par('ler', 'bule', 'pule', ['b', 'p'], 'par-minimo-p-b'), par('ler', 'pata', 'bata', ['p', 'b'], 'par-minimo-p-b')],
      trocas: [troca('acrescentar', 'oi', 'boi', 0, 'B', ['B', 'P', 'D'], ['boi', 'oi', 'poi'])]
    }
  },
  {
    unidade: 'TF-19', tipo: 'consoante', bloco: 3, letra: 'C', rotulo: 'c', titulo: 'O som /k/ (ca, co, cu)', objetivo: 'Ligar o som /k/ à letra C antes de A, O e U',
    sintese: [['vaca', 'vaca', 'faca', 'jaca'], ['suco', 'suco', 'sapo', 'uva'], ['macaco', 'macaco', 'pato', 'vaca']],
    leitura: [{ palavra: 'faca', outras: ['vaca', 'jaca'] }, { palavra: 'macaco', outras: ['pato', 'vaca'] }, { palavra: 'suco', outras: ['sapo', 'jaca'] }, { palavra: 'jaca', outras: ['faca', 'vaca'] }],
    pseudo: [['cufa', 'gufa', 'cufo'], ['cavu', 'cafu', 'gavu']],
    caixas: ['vaca', 'suco', 'boca'],
    desafio: {
      frase: frase('O macaco come a jaca.', 'O que o macaco come?', 'jaca', ['jaca', 'uva', 'faca']),
      pares: [par('ler', 'faca', 'vaca', ['f', 'v'], 'par-minimo-f-v'), par('ler', 'vaca', 'faca', ['v', 'f'], 'par-minimo-f-v')]
    }
  },
  {
    unidade: 'TF-20', tipo: 'consoante', bloco: 3, letra: 'D', rotulo: 'd', titulo: 'O som /d/', objetivo: 'Ligar o som /d/ à letra D e ouvir a diferença entre T e D',
    sintese: [['dado', 'dado', 'dedo', 'pato'], ['dedo', 'dedo', 'dado', 'ovo'], ['nada', 'nada', 'nata', 'lado']],
    leitura: [{ palavra: 'dado', outras: ['dedo', 'pato'] }, { palavra: 'dedo', outras: ['dado', 'ovo'] }, { palavra: 'vida', outras: ['vila', 'via'] }],
    pseudo: [['dufa', 'tufa', 'dufo'], ['midu', 'mitu', 'mido']],
    caixas: ['dado', 'dedo', 'vida'],
    desafio: { pares: [par('ler', 'nada', 'nata', ['d', 't'], 'par-minimo-t-d'), par('ler', 'nata', 'nada', ['t', 'd'], 'par-minimo-t-d'), par('ouvir', 'dado', 'dedo', ['a', 'e'])] }
  },
  {
    unidade: 'TF-21', tipo: 'consoante', bloco: 3, letra: 'G', rotulo: 'g', titulo: 'O som /g/ (ga, go, gu)', objetivo: 'Ligar o som /g/ à letra G antes de A, O e U',
    sintese: [['gato', 'gato', 'pato', 'galo'], ['fogo', 'fogo', 'fofo', 'ovo'], ['gota', 'gota', 'gata', 'bota']],
    leitura: [{ palavra: 'gato', outras: ['pato', 'galo'] }, { palavra: 'galo', outras: ['gato', 'lobo'] }, { palavra: 'fogo', outras: ['fofo', 'ovo'] }],
    pseudo: [['gufa', 'cufa', 'gufo'], ['lagu', 'lacu', 'lago']],
    caixas: ['gato', 'galo', 'lago'],
    desafio: {
      trocas: [troca('trocar', 'mato', 'gato', 0, 'G', ['G', 'C', 'P'], ['gato', 'mato', 'cato']), troca('trocar', 'gato', 'galo', 2, 'L', ['L', 'T', 'M'], ['galo', 'gato', 'gamo'])],
      pares: [par('ler', 'galo', 'calo', ['g', 'k'], 'par-minimo-k-g'), par('ler', 'gata', 'cata', ['g', 'k'], 'par-minimo-k-g')],
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
      pares: [par('ler', 'tia', 'dia', ['t', 'd'], 'par-minimo-t-d'), par('ler', 'dia', 'tia', ['d', 't'], 'par-minimo-t-d')],
      frase: frase('A tia viu o tomate.', 'O que a tia viu?', 'tomate', ['tomate', 'tapete', 'pato'])
    }
  },
  {
    unidade: 'TF-R3', tipo: 'revisao', bloco: 3, ate: 'TF-22', rotulo: '★', titulo: 'Revisão: sons que estouram', objetivo: 'Ler, escrever e comparar P, T, B, C, D e G',
    revisaoLetras: ['P', 'T', 'B', 'C', 'D', 'G'],
    sintese: [['gato', 'gato', 'pato', 'galo'], ['dedo', 'dedo', 'dado', 'ovo'], ['vaca', 'vaca', 'faca', 'jaca']],
    pseudo: [['tufa', 'tafa', 'pufa'], ['gufa', 'cufa', 'gufo']],
    ditado: ['PATO', 'BOLO', 'FACA', 'GATO', 'DEDO'],
    desafio: {
      pares: [par('ler', 'pato', 'bato', ['p', 'b'], 'par-minimo-p-b'), par('ouvir', 'faca', 'vaca', ['f', 'v'], 'par-minimo-f-v'), par('ler', 'nata', 'nada', ['t', 'd'], 'par-minimo-t-d'), par('ler', 'galo', 'calo', ['g', 'k'], 'par-minimo-k-g')],
      trocas: [troca('trocar', 'pato', 'mato', 0, 'M', ['M', 'N', 'B'], ['mato', 'pato', 'nato']), troca('trocar', 'mato', 'gato', 0, 'G', ['G', 'C', 'D'], ['gato', 'mato', 'cato'])],
      frase: frase('O gato viu a vaca.', 'Quem o gato viu?', 'vaca', ['vaca', 'faca', 'pato']), eco: true
    }
  }
];

/* ------------------------------------------------------------------------------------------------------------ */
/* construção das fases                                                                                          */
/* ------------------------------------------------------------------------------------------------------------ */

/** Ordem das letras ensinadas (para revisão cumulativa e distratores). */
const ORDEM: string[] = LICOES_TF.filter((l) => l.tipo === 'vogal' || l.tipo === 'consoante').map((l) => l.letra!);
const letrasAte = (unidade: string) => {
  const n = numeroDaUnidade(unidade);
  return LICOES_TF.filter((l) => (l.tipo === 'vogal' || l.tipo === 'consoante') && numeroDaUnidade(l.unidade) <= n).map((l) => l.letra!);
};
/** Unidade que vale para o que já foi ensinado (a revisão de bloco vale como a última unidade do bloco). */
const efetiva = (li: Licao) => li.ate ?? li.unidade;
const letraDe = (x: string): LetraAlfabeto => LETRA_POR_ID[x];

/** Habilidade da relação som ↔ letra de cada letra da trilha (docs/pedagogia/02 §4). */
export const habilidadeTF = (letra: string): string => (ehVogal(letra) ? `vogal-${letra.toLowerCase()}` : letra === 'C' ? 'gpc-c' : `gpc-${letra.toLowerCase()}`);
const ehVogal = (x: string) => 'AEIOU'.includes(x);

/**
 * Sons "duvidosos" e de estouro (docs/pedagogia/03 §5; app/docs/auditoria-sons-letras.md): não são o ÚNICO estímulo
 * de item que conta. Para eles o estímulo é uma sílaba falada pela Sofia, com o som colado à vogal.
 */
export const SILABA_DO_SOM: Record<string, string> = { L: 'la', V: 'vo', J: 'ja', P: 'pa', T: 'ta', B: 'bo', C: 'ca', D: 'dá', G: 'ga', M: 'ma', F: 'fa', S: 'sa', N: 'ne' };
export const SONS_DUVIDOSOS = ['L', 'V', 'J', 'P', 'T', 'B', 'C', 'D', 'G'];
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
  const antes = li.revisaoLetras ?? letrasAte(efetiva(li)).filter((x) => x !== li.letra);
  if (!antes.length) return null;
  const itens = antes.map((x, k) => itemSomLetra(x, efetiva(li), k, antes));
  return {
    id, tipo: 'C1', titulo: 'Os sons que você já sabe', cenario: 'praca', contaDominio: true,
    atividade: escolher(habilidadeTF(antes[antes.length - 1]), sofia(FALAS_TRILHA_SONS.revisao), itens, { sortear: Math.min(li.revisaoLetras ? 4 : 3, itens.length), estilo: 'revisao' })
  };
}

function cenaSomNovo(id: string, li: Licao): Cena {
  const l = letraDe(li.letra!);
  const hab = habilidadeTF(li.letra!);
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
      tipo: 'somNovo', habilidade: hab, fonema: l.fonema!, letra: l.letra, enunciado: sofia(FALAS_TRILHA_SONS.somNovo),
      brincadeira: f(l.voz, l.brincadeira), repita: f(l.voz, 'Repita comigo!'), revela: sofia(FALAS_TRILHA_SONS.revela), apoio: f(l.voz, falaChave(l))
    }
  };
}

/** Os dois sentidos da relação som ↔ letra (FG), em duas cenas, e o som inicial nas vogais. */
function cenasAcharLetra(id: string, li: Licao): Cena[] {
  const x = li.letra!;
  const l = letraDe(x);
  const hab = habilidadeTF(x);
  const ate = efetiva(li);
  const cenas: Cena[] = [
    {
      id: `${id}a`, tipo: 'C3', titulo: 'Ouça o som e ache a letra', cenario: 'quintal', contaDominio: true,
      atividade: escolher(hab, duvidoso(x) ? sofia(FALAS_TRILHA_SONS.silabaLetra) : f(l.voz, 'Ouça e toque na letra.'), [itemSomLetra(x, ate, 0), itemSomLetra(x, ate, 1)])
    },
    {
      id: `${id}b`, tipo: 'C3', titulo: 'Qual é o som desta letra?', cenario: 'quintal', contaDominio: true,
      atividade: escolher(hab, duvidoso(x) ? sofia(FALAS_TRILHA_SONS.letraSilaba) : f(l.voz, FALAS_FONICAS.qualSom), [itemLetraSom(x, ate, 0), itemLetraSom(x, ate, 1)])
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

function cenasDesafio(id: string, li: Licao): Cena[] {
  const d = li.desafio;
  if (!d) return [];
  const out: Cena[] = [];
  if (d.pares?.length) {
    out.push({
      id: `${id}p`, tipo: 'C5', titulo: 'Palavras quase iguais', cenario: 'praca', contaDominio: true,
      atividade: { tipo: 'parMinimo', habilidade: d.pares[0].habilidade ?? 'leitura-cvcv', enunciado: sofia(FALAS_TRILHA_SONS.parMuda), itens: d.pares, ...(d.pares.length > 4 ? { sortear: 4 } : {}) }
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
  const ehLicaoDeLetra = li.tipo === 'vogal' || li.tipo === 'consoante';
  add(cenaRevisao(`${id}-C1`, li));
  if (ehLicaoDeLetra || li.tipo === 'regra-final' || li.tipo === 'regra-tidi') add(cenaSomNovo(`${id}-C2`, li));
  if (ehLicaoDeLetra) {
    cenas.push(...cenasAcharLetra(`${id}-C3`, li));
    add({ id: `${id}-C3t`, tipo: 'C3', titulo: 'Desenhe a letra', cenario: 'ilha', contaDominio: true, atividade: { tipo: 'tracar', habilidade: habilidadeTF(li.letra!), letras: [li.letra!, li.letra!.toLowerCase()], enunciado: f(letraDe(li.letra!).voz, 'Agora desenhe a letra com o dedo.') } });
  }
  if (li.tipo === 'revisao-vogais') {
    add({
      id: `${id}-C3`, tipo: 'C3', titulo: 'As cinco vogais', cenario: 'quintal', contaDominio: true,
      atividade: escolher('vogais', sofia('Ouça e toque na letra.'), ['A', 'E', 'I', 'O', 'U'].map((x, k) => ({ ...itemSomLetra(x, 'TF-05', k), habilidade: 'vogais' })), { sortear: 4 })
    });
  }
  if (li.tipo === 'regra-final') add(cenaRegra(`${id}-C3r`, li, 'regra-vogal-final'));
  if (li.tipo === 'regra-tidi') add(cenaRegra(`${id}-C3r`, li, 'regra-ti-di'));
  add(cenaSintese(`${id}-C3s`, li));
  cenas.push(...cenasLeitura(`${id}-C4`, li, li.tipo === 'revisao-vogais' ? 'leitura-vogais' : 'leitura-cvcv'));
  add(cenaCaixas(`${id}-C4c`, li));
  add(cenaDitado(`${id}-C5d`, li));
  cenas.push(...cenasDesafio(`${id}-C5`, li));

  const habPrincipal = li.tipo === 'vogal' || li.tipo === 'consoante' ? habilidadeTF(li.letra!) : li.tipo === 'regra-final' ? 'regra-vogal-final' : li.tipo === 'regra-tidi' ? 'regra-ti-di' : li.tipo === 'revisao-vogais' ? 'vogais' : 'leitura-cvcv';
  const leituraHab = li.tipo === 'revisao-vogais' ? 'leitura-vogais' : 'leitura-cvcv';
  const temLeitura = !!(li.leitura?.length || li.pseudo?.length);
  // critério: domínio da relação som-letra da unidade + leitura (com palavras inventadas conferidas), quando há
  const criterio = [...new Set([...(revisaoDeBloco ? [] : [habPrincipal]), ...(temLeitura ? [leituraHab] : [])])];
  const habilidades = [...new Set(cenas.flatMap((c) => [c.atividade?.habilidade ?? '', ...(c.atividade?.tipo === 'escolher' ? c.atividade.itens.map((i) => i.habilidade ?? '') : [])]).filter(Boolean))];
  const conquistas = [
    ...(li.letra && li.tipo === 'vogal' ? [CONQUISTAS_VOGAL[li.letra]] : []),
    ...(li.letra && SELO_SOM[li.letra] && li.tipo === 'consoante' ? [SELO_SOM[li.letra]] : []),
    ...(cenas.some((c) => c.atividade?.tipo === 'sintese') ? ['S-R0-05'] : []),
    ...(temLeitura && li.tipo !== 'revisao-vogais' ? ['S-R2a-05'] : []),
    ...(revisaoDeBloco ? ['S-R2a-07'] : [])
  ];
  const tipoTrilha = revisaoDeBloco || li.tipo === 'revisao-vogais' ? 'revisao' : li.tipo.startsWith('regra') ? 'regra' : 'licao';
  return {
    id, regiao: 'TF', numero, titulo: li.titulo, objetivo: li.objetivo, sessoesPrevistas: '1 lição (o avanço é por domínio)',
    habilidades: [habPrincipal, ...habilidades.filter((h) => h !== habPrincipal)], cenas,
    criterio: criterio.length ? { tipo: 'dominio', habilidades: criterio } : { tipo: 'missao' },
    trilhaSons: { unidade: li.unidade, bloco: li.bloco, tipo: tipoTrilha, rotulo: li.rotulo },
    falaEntrada: sofia(FALAS_TRILHA_SONS.entrada),
    acolhida: sofia(tipoTrilha === 'revisao' ? FALAS_TRILHA_SONS.acolhidaRevisao : tipoTrilha === 'regra' ? FALAS_TRILHA_SONS.acolhidaRegra : FALAS_TRILHA_SONS.acolhida),
    gancho: sofia(FALAS_TRILHA_SONS.gancho),
    fechamento: `${li.titulo}: mais um passo na Trilha dos Sons.`,
    emCasa: li.letra && ehLicaoDeLetra
      ? `Brinquem de achar o som /${letraDe(li.letra).ipa?.replace(/\//g, '') ?? li.letra.toLowerCase()}/ no começo das palavras. Falem o SOM, não o nome da letra.`
      : 'Leiam juntos as palavras da lição em voz alta, devagar e até o fim, apontando cada letra.',
    conquistas
  };
}

/** As fases da Trilha dos Sons, na ordem da jornada. */
export const FASES_TF: Fase[] = LICOES_TF.map((li, i) => faseDaLicao(li, i + 1));

/** Letras ensinadas pela trilha, na ordem (para a tela da trilha). */
export const LETRAS_DA_TRILHA_SONS = ORDEM;
