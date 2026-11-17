/**
 * Grafo de habilidades do MVP (R0–R2a). A ordem do array é a ordem da jornada.
 * Base: jogo-completo/02 (tabelas "Como a aprendizagem é medida").
 */
import type { Habilidade } from './tipos.ts';
import { ALFABETO, habilidadeLetra } from './alfabeto.ts';

export const HABILIDADES: Habilidade[] = [
  // AL · Trilha do Alfabeto (D027): uma habilidade por letra (letra ↔ som principal)
  ...ALFABETO.map((l): Habilidade => ({
    id: habilidadeLetra(l.letra), regiao: 'AL', exigePseudo: false,
    nome: l.ipa && l.tipo !== 'nomes' ? `Letra ${l.letra} ↔ som ${l.ipa}` : `Letra ${l.letra}`,
    paraFamilia: l.tipo === 'muda' ? `conhece a letra ${l.letra} (que não faz som sozinha)` : `conhece a letra ${l.letra} e o som dela, como em "${l.palavra}"`
  })),
  // R0 · consciência fonológica oral
  { id: 'nome-silabas', regiao: 'R0', nome: 'Palmas no próprio nome', paraFamilia: 'bate as palmas das sílabas do próprio nome', exigePseudo: false },
  { id: 'som-do-nome', regiao: 'R0', nome: 'Primeiro som do nome', paraFamilia: 'sabe o primeiro som do próprio nome', exigePseudo: false },
  { id: 'rima', regiao: 'R0', nome: 'Rimas', paraFamilia: 'percebe palavras que rimam', exigePseudo: false },
  { id: 'silaba', regiao: 'R0', nome: 'Sílabas (palmas)', paraFamilia: 'separa palavras em sílabas com palmas', exigePseudo: false },
  { id: 'som-inicial', regiao: 'R0', nome: 'Som inicial', paraFamilia: 'acha o primeiro som das palavras', exigePseudo: false },
  // D032 §4: Bichinho Come-Som, variação "termina com" (CFN-FIM, docs/pedagogia/02); só nos jogos livres e de escuta
  { id: 'som-final', regiao: 'R0', nome: 'Som final', paraFamilia: 'acha o último som das palavras (pato termina com u)', exigePseudo: false },
  { id: 'sintese', regiao: 'R0', nome: 'Juntar sons', paraFamilia: 'junta sons falados devagar e descobre a palavra', exigePseudo: false },
  // R1 · vogais
  { id: 'vogal-a', regiao: 'R1', nome: 'Vogal A', paraFamilia: 'reconhece o som do A', exigePseudo: false, seloMaestria: 'S-SOM-A' },
  { id: 'vogal-o', regiao: 'R1', nome: 'Vogal O (ó/ô)', paraFamilia: 'reconhece o som do O', exigePseudo: false, seloMaestria: 'S-SOM-O-O-O' },
  { id: 'o-aberto-fechado', regiao: 'R1', nome: 'ó × ô', paraFamilia: 'ouve a diferença entre vovó e vovô', exigePseudo: false },
  { id: 'vogal-e', regiao: 'R1', nome: 'Vogal E (é/ê)', paraFamilia: 'reconhece o som do E', exigePseudo: false, seloMaestria: 'S-SOM-E-E-E' },
  { id: 'vogal-i', regiao: 'R1', nome: 'Vogal I', paraFamilia: 'reconhece o som do I', exigePseudo: false, seloMaestria: 'S-SOM-I' },
  { id: 'vogal-u', regiao: 'R1', nome: 'Vogal U', paraFamilia: 'reconhece o som do U', exigePseudo: false, seloMaestria: 'S-SOM-U' },
  { id: 'vogais', regiao: 'R1', nome: 'As 5 vogais misturadas', paraFamilia: 'reconhece as 5 vogais misturadas', exigePseudo: false },
  // R2a · M, L, F e primeiras palavras
  { id: 'gpc-m', regiao: 'R2a', nome: 'Letra M ↔ som /m/', paraFamilia: 'liga a letra M ao som /m/', exigePseudo: false, seloMaestria: 'S-SOM-M' },
  { id: 'gpc-l', regiao: 'R2a', nome: 'Letra L ↔ som /l/', paraFamilia: 'liga a letra L ao som /l/', exigePseudo: false, seloMaestria: 'S-SOM-L' },
  { id: 'gpc-f', regiao: 'R2a', nome: 'Letra F ↔ som /f/', paraFamilia: 'liga a letra F ao som /f/', exigePseudo: false, seloMaestria: 'S-SOM-F' },
  { id: 'silaba-cv', regiao: 'R2a', nome: 'Juntar consoante e vogal (MA, LU, FI)', paraFamilia: 'junta o som da consoante com o som da vogal (MA, LU, FI)', exigePseudo: false },
  { id: 'leitura-cvcv', regiao: 'R2a', nome: 'Ler palavras como MALA e LUA', paraFamilia: 'lê palavras como MALA e LUA', exigePseudo: true },
  { id: 'escrita-cvcv', regiao: 'R2a', nome: 'Escrever palavras com letras móveis', paraFamilia: 'escreve palavras simples com letras móveis', exigePseudo: false },
  // TF · Trilha dos Sons (D030; docs/pedagogia/02): som ↔ letra das consoantes novas, regras, segmentação, troca de
  // sons, pares mínimos, frases e compreensão. M, L, F, vogais, síntese, leitura e escrita reaproveitam os ids acima.
  ...(['V', 'S', 'N', 'Z', 'J', 'P', 'T', 'B', 'C', 'D', 'G'] as const).map((x): Habilidade => {
    const som: Record<string, string> = { V: '/v/', S: '/s/', N: '/n/', Z: '/z/', J: '/ʒ/', P: '/p/', T: '/t/', B: '/b/', C: '/k/', D: '/d/', G: '/g/' };
    return { id: `gpc-${x.toLowerCase()}`, regiao: 'TF', nome: `Letra ${x} ↔ som ${som[x]}`, paraFamilia: `liga a letra ${x} ao som ${som[x]}`, exigePseudo: false };
  }),
  { id: 'leitura-vogais', regiao: 'TF', nome: 'Ler duas vogais juntas (AI, OI, EU)', paraFamilia: 'lê duas vogais juntas, como AI e OI', exigePseudo: false },
  { id: 'regra-vogal-final', regiao: 'TF', nome: 'O e E no fim soam U e I', paraFamilia: 'sabe que o O e o E do fim da palavra soam U e I (ovo, ele)', exigePseudo: false },
  { id: 'regra-ti-di', regiao: 'TF', nome: 'T e D antes do I (tia, dia)', paraFamilia: 'lê T e D antes do som de I (tia, dia)', exigePseudo: false },
  { id: 'segmentacao', regiao: 'TF', nome: 'Separar a palavra em sons (caixas de sons)', paraFamilia: 'separa a palavra em sons, um por um', exigePseudo: false },
  { id: 'troca-de-som', regiao: 'TF', nome: 'Trocar ou pôr um som e ler a palavra nova', paraFamilia: 'troca um som e lê a palavra nova (pato → mato)', exigePseudo: false },
  { id: 'par-minimo-f-v', regiao: 'TF', nome: 'Pares mínimos F × V', paraFamilia: 'ouve e lê a diferença entre F e V (faca, vaca)', exigePseudo: false },
  { id: 'par-minimo-s-z', regiao: 'TF', nome: 'Pares mínimos S × Z', paraFamilia: 'ouve e lê a diferença entre S e Z (selo, zelo)', exigePseudo: false },
  { id: 'par-minimo-p-b', regiao: 'TF', nome: 'Pares mínimos P × B', paraFamilia: 'ouve e lê a diferença entre P e B (pato, bato)', exigePseudo: false },
  { id: 'par-minimo-t-d', regiao: 'TF', nome: 'Pares mínimos T × D', paraFamilia: 'ouve e lê a diferença entre T e D (nata, nada)', exigePseudo: false },
  { id: 'par-minimo-k-g', regiao: 'TF', nome: 'Pares mínimos C × G', paraFamilia: 'ouve e lê a diferença entre C e G (calo, galo)', exigePseudo: false },
  { id: 'par-minimo-m-b', regiao: 'TF', nome: 'Pares mínimos M × B (escuta)', paraFamilia: 'ouve a diferença entre M e B (mala, bala)', exigePseudo: false },
  { id: 'par-minimo-vogal', regiao: 'TF', nome: 'Pares mínimos de vogal (escuta)', paraFamilia: 'ouve a diferença entre vogais (dado, dedo)', exigePseudo: false },
  // Blocos 4 e 5 (TF-23…TF-32; docs/pedagogia/02 §4: FG-AB-01, FG-NAS-01 a 05, FG-CTX)
  { id: 'e-aberto-fechado', regiao: 'TF', nome: 'é × ê', paraFamilia: 'lê e ouve a diferença entre é e ê (pé, bebê)', exigePseudo: false },
  { id: 'regra-vogal-aberta', regiao: 'TF', nome: 'E e O abertos sem acento; ê e ô', paraFamilia: 'lê E e O abertos sem acento (bola, vela) e sabe que o chapeuzinho fecha o som (vovô, bebê)', exigePseudo: false },
  ...(['a', 'e', 'i', 'o', 'u'] as const).map((v): Habilidade => {
    const g: Record<string, string> = { a: 'Ã e AN', e: 'EN', i: 'IM e IN', o: 'OM e ON', u: 'UM e UN' };
    const ex: Record<string, string> = { a: 'lã, anta', e: 'dente, vento', i: 'sim, lindo', o: 'bom, onda', u: 'um, mundo' };
    return { id: `gpc-nasal-${v}`, regiao: 'TF', nome: `${g[v]} ↔ som /${v}/ nasal`, paraFamilia: `lê o som de ${v.toUpperCase()} pelo nariz (${ex[v]})`, exigePseudo: false };
  }),
  { id: 'regra-m-n', regiao: 'TF', nome: 'M antes de P e B; ão, ãe, õe', paraFamilia: 'escreve o som do nariz com M antes de P e B (campo) e lê mão, mãe, tem', exigePseudo: false },
  { id: 'gpc-r', regiao: 'TF', nome: 'Letra R do começo ↔ R forte', paraFamilia: 'lê o R do começo da palavra (rato, rua), do jeito da sua região', exigePseudo: false },
  { id: 'regra-r', regiao: 'TF', nome: 'R fraco entre vogais', paraFamilia: 'lê o R entre vogais com o som fraco (cara, arara)', exigePseudo: false },
  { id: 'par-minimo-l-r', regiao: 'TF', nome: 'Pares mínimos L × R', paraFamilia: 'lê a diferença entre L e R (pela, pera)', exigePseudo: false },
  { id: 'leitura-frase', regiao: 'TF', nome: 'Ler uma frase curta', paraFamilia: 'lê uma frase curta sem ajuda', exigePseudo: false },
  { id: 'compreensao-lida', regiao: 'TF', nome: 'Entender o que leu', paraFamilia: 'responde a uma pergunta sobre a frase que leu', exigePseudo: false },
  // Cantinho da Leitura e Brincar com sons (docs/pedagogia/02: CF-SIL-03, CF-SIL-04, CF-PDP-01, COMP-OUV-01, VOC-01, DEC-TXT-01,
  // FLU-PAL-01). Jogos e histórias são livres: não travam fase. Escrita própria (ESC-PRO-01), eco e coro (FLU-TXT-01) não entram
  // como tentativa: são exposição/autorrelato e ficam só no resumo do Cantinho para o adulto.
  { id: 'palavra-maior', regiao: 'R0', nome: 'Qual palavra é mais comprida', paraFamilia: 'percebe qual palavra tem mais pedaços (sílabas), sem olhar o tamanho da coisa', exigePseudo: false },
  { id: 'silaba-inicial', regiao: 'R0', nome: 'Mesmo começo', paraFamilia: 'acha palavras que começam com o mesmo som', exigePseudo: false },
  { id: 'palavra-dentro', regiao: 'R0', nome: 'Palavra escondida', paraFamilia: 'acha uma palavra escondida dentro de outra (sapato, pato)', exigePseudo: false },
  { id: 'compreensao-ouvida', regiao: 'R0', nome: 'Entender uma história ouvida', paraFamilia: 'responde perguntas sobre uma história que ouviu', exigePseudo: false },
  { id: 'vocabulario', regiao: 'R0', nome: 'Palavras novas das histórias', paraFamilia: 'aprende palavras novas das histórias', exigePseudo: false },
  { id: 'leitura-texto', regiao: 'TF', nome: 'Ler um texto curto sozinho', paraFamilia: 'lê sozinho um texto curto e mostra que entendeu', exigePseudo: false },
  { id: 'fluencia-palavras', regiao: 'TF', nome: 'Ler palavras conhecidas mais ligeiro', paraFamilia: 'relê palavras conhecidas cada vez mais ligeiro, sem errar', exigePseudo: false },
  // D033 · Fichas de leitura, níveis 3 e 4: consciência ARTICULATÓRIA (ligar a letra à boca que faz o som dela; descobrir a
  // palavra só pelas bocas). Soares, Alfaletrar, p. 146, usa o ponto de articulação. Livre: não trava fase. Só com bocas
  // visualmente diferentes na mesma rodada (conteudo/src/fichas.ts › CLASSE_DA_BOCA).
  { id: 'boca-som', regiao: 'TF', nome: 'Boca ↔ som (consciência articulatória)', paraFamilia: 'olha a boca e sabe que som (e que letra) ela está fazendo', exigePseudo: false }
];

export const HABILIDADE_POR_ID: Record<string, Habilidade> = Object.fromEntries(HABILIDADES.map((h) => [h.id, h]));
