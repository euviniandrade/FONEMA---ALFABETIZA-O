/**
 * BRINCAR COM SONS: jogos de escuta LIVRES (docs/pedagogia/01 §3: "disponíveis o tempo todo, não travam a trilha";
 * 00 §3 camada A; 02 eixo 1). Sempre IDENTIFICAR antes de produzir (MOR p. 51–53, 131; MP p. 4; VT-PE p. 12, 14).
 *
 *  - Palavra comprida (CF-SIL-03): qual de duas palavras tem mais pedaços (MOR p. 141, 149, 192–193). Inclui casos em que o
 *    bicho grande tem nome curto (sol × formiga, urso × abelha) para separar a palavra da coisa (04 N6 [DP]).
 *  - Palavra escondida (CF-PDP-01): a palavra dentro da palavra, começando por tirar a primeira sílaba (MOR p. 196, 200, 203;
 *    SOA p. 85–86). A parte igual só é destacada, escrita, DEPOIS da resposta (04 N7).
 *  - Rimas e o intruso (CF-RIM-01): achar o par que rima e a que não combina (MOR p. 191–193, 204–205; MP p. 24–27; VT-PE p. 85).
 *    O intruso nunca é "o único bicho" ou "a única comida" (04 N8).
 *  - Mesmo começo (CF-SIL-04): palavras que começam com o mesmo som (e a mesma sílaba): aliteração, mais fácil que a rima em
 *    português (MOR p. 51, 139, 189; SOA p. 80–82). Distratores com o par de som parecido (s/z, p/b, t/d) quando dá.
 *  - Palmas (CF-SIL-01): a mecânica Palmas que já existe (MP p. 19–23; MOR p. 160–161; SOA p. 85–86).
 * A sílaba vale aqui como unidade de ESCUTA (regra 6 do CLAUDE.md); nada disso é ler ou escrever.
 * Os nomes dos jogos são do projeto (07 §3). Tocar numa figura fala o nome combinado dela (04 R10; MOR p. 147).
 */
import type { Fala } from '../tipos.ts';
import type { JogoEscuta } from './tipos.ts';

const s = (texto: string): Fala => ({ quem: 'sofia', texto });
const t = (texto: string): Fala => ({ quem: 'tales', texto });

export const JOGOS_ESCUTA: JogoEscuta[] = [
  {
    id: 'comprida', modo: 'comprida', nome: 'Palavra comprida', treina: 'Qual palavra tem mais pedaços (sílabas)', habilidade: 'palavra-maior',
    enunciado: t('Escute os nomes. Qual palavra é mais comprida? Não vale olhar o tamanho da coisa!'), pergunta: 'Qual palavra é mais comprida?', porRodada: 5, cor: 'ipe', icone: 'grafico',
    itens: [
      { opcoes: ['sol', 'formiga'], correta: 'formiga', revela: { sol: ['sol'], formiga: ['for', 'mi', 'ga'] } },
      { opcoes: ['urso', 'abelha'], correta: 'abelha', revela: { urso: ['ur', 'so'], abelha: ['a', 'be', 'lha'] } },
      { opcoes: ['vaca', 'pipoca'], correta: 'pipoca', revela: { vaca: ['va', 'ca'], pipoca: ['pi', 'po', 'ca'] } },
      { opcoes: ['pao', 'helicoptero'], correta: 'helicoptero', revela: { pao: ['pão'], helicoptero: ['he', 'li', 'cóp', 'te', 'ro'] } },
      { opcoes: ['ovo', 'hipopotamo'], correta: 'hipopotamo', revela: { ovo: ['o', 'vo'], hipopotamo: ['hi', 'po', 'pó', 'ta', 'mo'] } },
      { opcoes: ['leao', 'xicara'], correta: 'xicara', revela: { leao: ['le', 'ão'], xicara: ['xí', 'ca', 'ra'] } },
      { opcoes: ['mel', 'elefante'], correta: 'elefante', revela: { mel: ['mel'], elefante: ['e', 'le', 'fan', 'te'] } },
      { opcoes: ['navio', 'pe'], correta: 'navio', revela: { navio: ['na', 'vi', 'o'], pe: ['pé'] } }
    ]
  },
  {
    id: 'escondida', modo: 'dentro', nome: 'Palavra escondida', treina: 'Achar uma palavra dentro de outra (sapato → pato)', habilidade: 'palavra-dentro',
    enunciado: s('Tem uma palavra escondida dentro de outra. Escute bem!'), pergunta: 'Que palavra está escondida dentro de…', porRodada: 4, cor: 'mar', icone: 'olho',
    itens: [
      { estimulo: 'sapato', opcoes: ['pato', 'gato', 'rato'], correta: 'pato', revela: { sapato: ['SA', 'PATO'] } },
      { estimulo: 'luva', opcoes: ['uva', 'lua', 'ovo'], correta: 'uva', revela: { luva: ['L', 'UVA'] } },
      { estimulo: 'sacola', opcoes: ['cola', 'bola', 'mola'], correta: 'cola', revela: { sacola: ['SA', 'COLA'] } },
      { estimulo: 'girassol', opcoes: ['sol', 'mel', 'pe'], correta: 'sol', revela: { girassol: ['GIRAS', 'SOL'] } },
      { estimulo: 'jacare', opcoes: ['jaca', 'faca', 'vaca'], correta: 'jaca', revela: { jacare: ['JACA', 'RÉ'] } }
    ]
  },
  {
    id: 'rimas', modo: 'rima', nome: 'Achar a rima', treina: 'Achar a palavra que termina igual (pato, rato)', habilidade: 'rima',
    enunciado: s('Palavras que rimam terminam com o mesmo som. Escute!'), pergunta: 'Qual rima com…', porRodada: 5, cor: 'verde', icone: 'nota',
    itens: [
      { estimulo: 'pato', opcoes: ['rato', 'sapo', 'mala'], correta: 'rato', revela: { pato: ['P', 'ATO'], rato: ['R', 'ATO'] } },
      { estimulo: 'mao', opcoes: ['pao', 'mel', 'mala'], correta: 'pao', revela: { mao: ['M', 'ÃO'], pao: ['P', 'ÃO'] } },
      { estimulo: 'bola', opcoes: ['cola', 'bala', 'lua'], correta: 'cola', revela: { bola: ['B', 'OLA'], cola: ['C', 'OLA'] } },
      { estimulo: 'lua', opcoes: ['rua', 'uva', 'luva'], correta: 'rua', revela: { lua: ['L', 'UA'], rua: ['R', 'UA'] } },
      { estimulo: 'vela', opcoes: ['janela', 'vaca', 'bola'], correta: 'janela', revela: { vela: ['V', 'ELA'], janela: ['JAN', 'ELA'] } },
      { estimulo: 'faca', opcoes: ['vaca', 'foca', 'fila'], correta: 'vaca', revela: { faca: ['F', 'ACA'], vaca: ['V', 'ACA'] } },
      { estimulo: 'boneca', opcoes: ['peteca', 'banana', 'bola'], correta: 'peteca', revela: { boneca: ['BON', 'ECA'], peteca: ['PET', 'ECA'] } },
      { estimulo: 'mel', opcoes: ['papel', 'mala', 'mesa'], correta: 'papel', revela: { mel: ['M', 'EL'], papel: ['PAP', 'EL'] } }
    ]
  },
  {
    id: 'intruso', modo: 'intruso', nome: 'Quem não rima?', treina: 'Achar a palavra que não rima com as outras', habilidade: 'rima',
    enunciado: s('Duas palavras rimam e uma não. Ache a que não combina!'), pergunta: 'Qual não rima?', porRodada: 5, cor: 'coral', icone: 'alvo',
    itens: [
      { opcoes: ['pato', 'sapato', 'bola'], correta: 'bola' },
      { opcoes: ['mao', 'pao', 'vela'], correta: 'vela' },
      { opcoes: ['faca', 'vaca', 'lua'], correta: 'lua' },
      { opcoes: ['boneca', 'caneca', 'mala'], correta: 'mala' },
      { opcoes: ['mala', 'bala', 'uva'], correta: 'uva' },
      { opcoes: ['leao', 'aviao', 'gato'], correta: 'gato' },
      { opcoes: ['lula', 'mula', 'sol'], correta: 'sol' }
    ]
  },
  {
    id: 'comeco', modo: 'inicio', nome: 'Mesmo começo', treina: 'Achar a palavra que começa com o mesmo som', habilidade: 'silaba-inicial',
    enunciado: s('Escute o começo das palavras. Qual começa igual?'), pergunta: 'Qual começa igual a…', porRodada: 5, cor: 'ceu', icone: 'som',
    itens: [
      { estimulo: 'sapo', opcoes: ['sapato', 'pato', 'zebra'], correta: 'sapato', revela: { sapo: ['SA', 'PO'], sapato: ['SA', 'PATO'] } },
      { estimulo: 'mala', opcoes: ['macaco', 'bala', 'lama'], correta: 'macaco', revela: { mala: ['MA', 'LA'], macaco: ['MA', 'CACO'] } },
      { estimulo: 'foca', opcoes: ['fogo', 'bola', 'vela'], correta: 'fogo', revela: { foca: ['FO', 'CA'], fogo: ['FO', 'GO'] } },
      { estimulo: 'pato', opcoes: ['panela', 'bala', 'gato'], correta: 'panela', revela: { pato: ['PA', 'TO'], panela: ['PA', 'NELA'] } },
      { estimulo: 'gato', opcoes: ['galo', 'pato', 'mala'], correta: 'galo', revela: { gato: ['GA', 'TO'], galo: ['GA', 'LO'] } },
      { estimulo: 'lua', opcoes: ['luva', 'uva', 'rua'], correta: 'luva', revela: { lua: ['LU', 'A'], luva: ['LU', 'VA'] } },
      { estimulo: 'tatu', opcoes: ['tapete', 'pato', 'dado'], correta: 'tapete', revela: { tatu: ['TA', 'TU'], tapete: ['TA', 'PETE'] } }
    ]
  },
  {
    id: 'palmas', modo: 'palmas', nome: 'Palmas', treina: 'Bater uma palma para cada pedaço da palavra', habilidade: 'silaba',
    enunciado: t('Bata uma palma para cada pedaço da palavra!'), pergunta: '', porRodada: 4, cor: 'sol', icone: 'coracao', itens: [],
    palavras: ['bola', 'sapato', 'pipoca', 'jacaré', 'sol', 'abacaxi']
  }
];

export const JOGO_ESCUTA_POR_ID: Record<string, JogoEscuta> = Object.fromEntries(JOGOS_ESCUTA.map((j) => [j.id, j]));

/** Nome falado de cada figura usada nos jogos e nas perguntas (figura → palavra combinada; 04 R10). */
export const NOME_DA_FIGURA: Record<string, string> = {
  pao: 'pão', mao: 'mão', leao: 'leão', aviao: 'avião', pe: 'pé', jacare: 'jacaré', xicara: 'xícara', helicoptero: 'helicóptero',
  hipopotamo: 'hipopótamo', poca: 'poça', 'copo-agua': 'copo de água', 'bolhas-sabao': 'bolhas de sabão', 'bolo-velinhas': 'bolo',
  'rosto-feliz': 'feliz', 'rosto-triste': 'triste', 'rosto-bravo': 'bravo', chuva: 'chuva', banho: 'banho'
};
export const nomeDaFigura = (id: string) => NOME_DA_FIGURA[id] ?? id;

/** Molduras dos jogos (gravadas uma vez). */
export const FALAS_ESCUTA = {
  euFaco: s('Olha como eu faço.'),
  voceFaz: s('Agora é com você!'),
  escuteDeNovo: s('Escute de novo, devagar.'),
  voceTocou: s('Você tocou em:'),
  comparar: s('Compare com:'),
  pedacos: s('Conte os pedaços comigo.'),
  escondida: s('Olha a palavra escondida!'),
  rimam: s('Escute o fim: rimam!'),
  naoRima: s('Essa não termina igual.'),
  mesmoComeco: s('Escute o começo: é igual!'),
  muitoBem: s('Muito bem!'),
  fim: s('Jogo feito! Quer jogar de novo?')
} as const;
