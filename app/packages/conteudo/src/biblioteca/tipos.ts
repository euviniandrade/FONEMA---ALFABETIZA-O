/**
 * CANTINHO DA LEITURA e BRINCAR COM SONS (D030 etapa 8; docs/pedagogia/02 eixos 1, 8 e 9; 04 N6–N8, N11–N13, N16).
 * Tipos dos dados. As telas ficam em web/src/telas/crianca/{Biblioteca,BrincarSons}.tsx.
 */
import type { Fala } from '../tipos.ts';

/* ------------------------------------------------ hora da história (texto real, OUVIDO) ------------------------------------------------ */

/** Pergunta de compreensão de história ouvida (04 N12): antes (prevê), durante e depois (literal e de dedução). */
export interface PerguntaHistoria {
  momento: 'antes' | 'durante' | 'depois';
  /** 'previsao' não tem resposta certa: qualquer escolha vale e a história mostra o que acontece (exposição). */
  tipo: 'previsao' | 'literal' | 'inferencia';
  /** Pergunta "durante": feita logo depois desta página (índice a partir de 0). */
  depoisDaPagina?: number;
  pergunta: Fala;
  /** Figuras (ids de assets/figuras), todas plausíveis. */
  opcoes: string[];
  correta?: string;
  /** Página que a dupla relê no 1º erro (ensina o caminho: voltar à história, sem dizer a resposta). */
  pista?: number;
}

/** Palavra de vocabulário (04 N16; ABC p. 230–233): explicação de criança, uso em frase e uma conferência por figura. */
export interface PalavraVocabulario {
  palavra: string;
  /** Figura que ilustra a palavra (aparece só DEPOIS da conferência, para não entregar a resposta). */
  figura: string;
  explica: Fala;
  frase: Fala;
  pergunta: Fala;
  opcoes: string[];
  correta: string;
}

export interface PaginaHistoria {
  /** Caminho da ilustração dentro de assets/ (ex.: 'historias/bolota-chuva/1'). */
  imagem: string;
  /** Texto narrado (e mostrado: a criança vê o texto enquanto ouve). */
  texto: Fala;
}

export interface Historia {
  id: string;
  titulo: string;
  capa: string;
  /** Fala de abertura ("Hora da história! …"). */
  abre: Fala;
  paginas: PaginaHistoria[];
  perguntas: PerguntaHistoria[];
  /** Exatamente 3 palavras (VT-PE p. 48, 92). */
  vocabulario: PalavraVocabulario[];
  fecha: Fala;
}

/* ------------------------------------------------ textos decodificáveis (para LER SOZINHO) ------------------------------------------------ */

export interface PerguntaTexto {
  tipo: 'literal' | 'inferencia';
  pergunta: Fala;
  /** Figuras; ou palavras escritas quando `escritas` (só palavras decodificáveis na unidade do texto). */
  opcoes: string[];
  correta: string;
  escritas?: boolean;
}

export interface TextoDecodificavel {
  id: string;
  /** Título (também é lido: passa pelo verificador). */
  titulo: string;
  bloco: number;
  /** Unidade da Trilha dos Sons em que o texto é decodificável (o verificador usa essa unidade). */
  ate: string;
  /** Fases que liberam o texto (qualquer uma concluída). */
  liberaCom: string[];
  /** Frases do texto, uma por linha; `quem` mostra o rostinho de quem fala (balão), sem mudar a leitura. */
  linhas: { texto: string; quem?: 'sofia' | 'tales' }[];
  perguntas: PerguntaTexto[];
}

/* ------------------------------------------------ jogos de escuta (livres, não travam nada) ------------------------------------------------ */

export type ModoEscuta = 'comprida' | 'dentro' | 'rima' | 'intruso' | 'inicio';

export interface ItemEscuta {
  /** Figura-estímulo (dentro, rima, início). */
  estimulo?: string;
  /** Figuras de resposta (a ordem é sorteada na tela). */
  opcoes: string[];
  correta: string;
  /** Pedaços falados/mostrados DEPOIS da resposta (sílabas da palavra comprida; a parte escondida; a rima). */
  revela?: Record<string, string[]>;
}

export interface JogoEscuta {
  id: string;
  modo: ModoEscuta | 'palmas';
  nome: string;
  /** Uma linha para o adulto (e o cartão): o que treina. */
  treina: string;
  habilidade: string;
  enunciado: Fala;
  /** Pergunta de cada item (moldura): nos jogos com estímulo, a voz diz em seguida o nome da figura-estímulo. */
  pergunta: string;
  itens: ItemEscuta[];
  /** Palmas: palavras (usa a mecânica Palmas que já existe). */
  palavras?: string[];
  /** Itens por rodada (o banco é maior: sorteio). */
  porRodada: number;
  cor: string;
  icone: string;
}
