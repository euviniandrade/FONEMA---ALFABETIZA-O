/**
 * FONEMA · tipos do conteúdo.
 *
 * Todo o conteúdo pedagógico é DADO: fonemas, palavras, fases, cenas, falas, conquistas e itens.
 * Para "criar coisas" na plataforma, edite os arquivos de dados (ver app/README.md §"Criar conteúdo").
 *
 * Notação das falas (jogo-completo/README §2):
 *   [NOME]                      → primeiro nome da criança, na pronúncia escolhida pelo adulto
 *   {pronto|pronta|Tudo pronto} → concordância: masculino | feminino | forma neutra (sem criança, ou sexo pendente de cadastro antigo)
 */

/** D029: só masculino ou feminino. */
export type Genero = 'm' | 'f';
/** Concordância das falas: `n` (forma neutra) só quando não há criança ou o sexo de um cadastro antigo está pendente. */
export type GeneroFala = Genero | 'n';

export type Personagem = 'sofia' | 'tales' | 'bolota' | 'dona-cida' | 'davi' | 'guarda-parque' | 'pescadora' | 'zum-zum';

export interface Fala {
  quem: Personagem;
  texto: string;
}

/** Chave do Espelho do Som (mesmas chaves de espelho-do-som-3d/fonemas.js). */
export type ChaveFonema = string;

export interface Som {
  chave: ChaveFonema;
  ipa: string;
  /** Letra(s) que representam o som (o que aparece na tela). */
  letra: string;
  /** Como a voz sintética "estica" o som (só simulação; no produto é gravado por fonoaudióloga). */
  esticado: string;
  /** Dica de boca (catálogo README §5.2). */
  dica: string;
  /** Correção curta de articulação. */
  correcao: string;
  /** Palavras-figura com esse som no começo (texto, emoji). */
  palavras: [string, string][];
  /** Chave do quadro de frente da Sofia mais parecido (M, A, O, S). */
  bocaFrente: 'M' | 'A' | 'O' | 'S';
}

export interface Palavra {
  texto: string;
  silabas: string[];
  figura: string;
  /** Pseudopalavra ("nome de bichinho da mata"): não tem figura real. */
  pseudo?: boolean;
}

export type HabilidadeId = string;

export interface Habilidade {
  id: HabilidadeId;
  nome: string;
  /** Como a família lê essa habilidade no painel ("[NOME] já ..."). */
  paraFamilia: string;
  /** O critério de domínio exige pseudopalavras? (só leitura/decodificação) */
  exigePseudo: boolean;
  regiao: RegiaoId;
  /** Som do Maestria correspondente (selo S-SOM-*), se houver. */
  seloMaestria?: string;
}

export type RegiaoId = 'AL' | 'TF' | 'R0' | 'R1' | 'R2a';

/* ----------------------------- mecânicas ----------------------------- */

export interface Opcao {
  id: string;
  rotulo: string;
  figura?: string;
  /** Letra grande no lugar da figura (TOCAR letra). */
  letra?: string;
  /** O que a voz fala ao tocar a opção. */
  falar?: string;
  /**
   * Fonema que a opção representa (D030): na correção contrastiva o app toca o som ESCOLHIDO e o som CERTO.
   * Numa opção-letra é o som da letra; numa figura, o som do começo da palavra.
   */
  som?: ChaveFonema;
  /**
   * Opção de OUVIR (D030): aparece como botão de som, sem nada escrito. Tocar só toca o som (`som`) ou a fala
   * (`falar`); a criança escolhe e confirma em "É este!". Usado em letra → som e em "o Bolota leu errado".
   */
  botaoDeSom?: boolean;
}

/**
 * Valores sonoros que NÃO são o som principal da letra (D030 §6). Uma palavra só entra em LEITURA autônoma
 * quando todos os valores dela já foram ensinados na etapa (ver `VALORES_ENSINADOS` em palavras.ts).
 */
export type ValorSonoro =
  | 'e-aberto' | 'o-aberto' | 'e-final-i' | 'o-final-u' | 'e-reduzido' | 'nasal' | 'nasalizada' | 'ditongo' | 's-som-z' | 'r-fraco' | 'r-final'
  | 'l-final' | 'c-som-s' | 'g-som-j' | 'digrafo' | 'h-mudo' | 'encontro' | 'x-outro-som' | 'letra-de-nomes' | 's-final';

/** Tipo do registro da tentativa (contrato do motor, D030 etapa 2). */
export type TipoRegistro = 'resposta' | 'autorrelato' | 'exposicao';

export interface ItemEscolha {
  /** Pergunta falada (opcional; senão vale o enunciado da atividade). */
  pergunta?: Fala;
  /** O que a voz toca antes de mostrar as opções (ex.: "sssapo… lua"). */
  ouvir?: string;
  /** Palavra/letra escrita mostrada em destaque (itens de LEITURA: ler e tocar a figura). */
  mostrar?: string;
  opcoes: Opcao[];
  correta: string;
  pseudo?: boolean;
  /** Figura grande mostrada como pergunta ("com qual letra começa?"): palavra do banco de figuras. */
  mostrarFigura?: string;
  /** Dica de 1º erro (fala da dupla). */
  dica?: string;
  /** Quem fala `ouvir` neste item (padrão: quem fala o enunciado). */
  quem?: Personagem;
  /** Quem fala a `dica` (padrão: Sofia). */
  quemDica?: Personagem;
  habilidade?: HabilidadeId;
  /**
   * SOM REAL da letra como estímulo principal (D030 §1): tocado 2 vezes no lugar de `ouvir`. Se o fonema não tem
   * clipe aprovado nem gravação do adulto, vale `ouvir` (comportamento antigo).
   */
  somAlvo?: ChaveFonema;
  /** Dito DEPOIS do acerto, como apoio, com o nome da letra: "Isso! Esse é o som do B." (sem clipe: a frase genérica). */
  apoio?: Fala;

  /** Explicação do contraste entre dois sons/letras parecidos (par mínimo), dita na correção. */
  contraste?: Contraste;
  /** Fonema do alvo quando a resposta certa não é uma opção com `som` (ex.: figura). */
  somCorreta?: ChaveFonema;
  /** Item de LEITURA autônoma (ler a palavra escrita e escolher): entra no verificador de valores sonoros. */
  leitura?: boolean;
  /** Rótulo do tipo de item para o registro e para o adulto. */
  formato?: FormatoItem;
}

export type FormatoItem =
  | 'som-letra' | 'letra-som' | 'som-figura' | 'figura-letra' | 'letra-figura' | 'par-minimo' | 'espelho-letras' | 'som-cena' | 'cena-letra'
  | 'ler-figura' | 'silaba-falta' | 'fonema-falta' | 'ouvir-leituras' | 'outro';

/** O que muda entre dois sons parecidos: voz (p/b, t/d, f/v, s/z, x/j, k/g), boca (m/n…) ou desenho (b/d/p/q). */
export type Contraste = 'voz' | 'boca' | 'desenho';

interface AtividadeBase {
  habilidade: HabilidadeId;
  enunciado: Fala;
  /** Frase de comemoração específica do processo. */
  comemora?: Fala;
}

export interface AtividadeEscolher extends AtividadeBase {
  tipo: 'escolher';
  /** "ensinar": o Bolota erra e a criança corrige (efeito protégé). */
  estilo?: 'tocar' | 'cacar' | 'ensinar' | 'revisao' | 'sintese';
  itens: ItemEscolha[];
  /** Gerador especial: monta os itens a partir do som do nome da criança. */
  gerador?: 'som-do-nome';
  /**
   * Banco maior que a rodada (D030 §4): sorteia este número de itens a cada tentativa da atividade.
   * No modo de teste (determinístico) valem os primeiros.
   */
  sortear?: number;
}

/**
 * LIGA O SOM (D030): ligar cada LETRA à CENA que faz o som dela (Z ↔ abelha zumbindo). Sem texto: a criança toca
 * numa letra e numa cena (ou arrasta); cada ligação certa toca o SOM REAL da letra.
 */
export interface AtividadeLigar extends AtividadeBase {
  tipo: 'ligar';
  /** Pares da rodada (3–4). `cena` é o nome da figura da cena; `fonema` é o som que toca. */
  pares: { letra: string; cena: string; fonema: ChaveFonema | null; habilidade?: HabilidadeId }[];
  /** Banco maior: sorteia este número de pares por rodada. */
  sortear?: number;
}

export interface AtividadePalmas extends AtividadeBase {
  tipo: 'palmas';
  /** Use "$NOME" para o nome da criança. */
  palavras: string[];
  estilo?: 'palmas' | 'amarelinha' | 'capoeira';
}

export interface AtividadeMontar extends AtividadeBase {
  tipo: 'montar';
  /** Palavras (ou sílabas) a montar. "$NOME" monta o nome da criança. */
  palavras: string[];
  mostrarModelo: boolean;
  /** Primeiras palavrinhas (Trilha do Alfabeto): as peças não falam (nada de nome de letra); a dupla junta e fala a palavra. */
  semSomDasPecas?: boolean;
  /** Peças são sílabas (tábua de sílabas) em vez de letras. */
  porSilaba?: boolean;
  distratoras?: string[];
  /**
   * D030 §5 · como o modelo aparece quando `mostrarModelo` é true:
   *  'demonstracao' (padrão): a 1ª palavra é demonstração guiada (modelo visível); nas seguintes o modelo SOME e a
   *  criança monta ouvindo a palavra e o som das peças; a peça certa só brilha na 3ª tentativa, e conta como ajuda.
   *  'sempre': modelo sempre visível (cópia) — só para apresentar a mecânica.
   */
  modelo?: 'demonstracao' | 'sempre';
  /**
   * As palavras usam valores sonoros ainda não ensinados (BIFE, GATO, BANANA…): ficam como VOCABULÁRIO para montar
   * e ouvir, e o registro sai como exposição, sem contar como decodificação.
   */
  vocabulario?: boolean;
}

export interface AtividadeDitado extends AtividadeBase {
  tipo: 'ditado';
  palavras: string[];
  letras: string[];
}

export interface AtividadeFalar extends AtividadeBase {
  tipo: 'falar';
  itens: { texto: string; falar: string; figura?: string; pseudo?: boolean }[];
  /** As palavras são LIDAS pela criança (leitura autônoma): entram no verificador de valores sonoros. */
  leitura?: boolean;
}

export interface AtividadeEspelho extends AtividadeBase {
  tipo: 'espelho';
  /** Chave do fonema ou "$SOM_NOME". */
  fonema: ChaveFonema;
  letra: string;
  ancora: { texto: string; figura: string };
  /**
   * Trilha do Alfabeto (D027): fala usada NO LUGAR do som esticado ("B, de bola."), porque o som isolado de
   * consoante sai errado na voz sintética (o som puro fica para a gravação da fonoaudióloga).
   */
  falaSom?: string;
  /** Fala da palavra-exemplo depois do som ("A, de abelha."). Vazio = não repete. */
  falaAncora?: string;
  /** Quem mostra o som (padrão: Sofia). */
  voz?: 'sofia' | 'tales';
}

/** Trilha do Alfabeto (D027): apresentação da letra (maiúscula e minúscula grandes) com a palavra-exemplo. */
export interface AtividadeLetra extends AtividadeBase {
  tipo: 'letra';
  /** Letra maiúscula; os dados (minúscula, palavra, figura) vêm de `alfabeto.ts`. */
  letra: string;
  /** Falas ditas em sequência depois do enunciado. */
  falas: Fala[];
  /** Faz de conta do som (D029 §2): dito antes do som real da letra. */
  brincadeira?: Fala;
  /** "Repita comigo!": dito depois do som, com pausa para a criança fazer junto. */
  repita?: Fala;
}

export interface AtividadeTracar extends AtividadeBase {
  tipo: 'tracar';
  letras: string[];
}

/* ------------------------- TRILHA DOS SONS (D030 etapas 6–8) ------------------------- */

/**
 * SOM NOVO (lição da trilha fônica, "eu faço"): faz de conta → SOM REAL da letra (3 vezes) com a boca do Espelho do
 * Som → "Repita comigo!" → só DEPOIS aparece a letra que escreve o som (regra 1: som antes do nome da letra).
 * Nas unidades de REGRA (TF-12, TF-22), mostra palavras com a letra destacada e o som que ela faz ali.
 * É EXPOSIÇÃO: não conta para o domínio.
 */
export interface AtividadeSomNovo extends AtividadeBase {
  tipo: 'somNovo';
  /** Fonema apresentado (chave do mapa de sons). */
  fonema: ChaveFonema;
  /** Letra que escreve o som (maiúscula). */
  letra: string;
  /** Faz de conta do som (o clipe já gravado da Trilha A–Z). */
  brincadeira?: Fala;
  /** "Repita comigo!" */
  repita?: Fala;
  /** Fala dita quando a letra aparece ("Esta é a letra deste som."). */
  revela: Fala;
  /** Apoio com o nome da letra, depois do som ("M, de macaco."). */
  apoio?: Fala;
  /** Unidade de regra: explicações + palavras com a letra destacada e o som que ela faz ali. */
  regra?: { partes: { explica: Fala; palavras: { palavra: string; destaque: number; som?: ChaveFonema }[] }[]; fecha?: Fala };
}

/** Uma palavra da trilha com os sons de cada letra (um fonema por letra; `null` = letra calada). */
export interface PalavraComSons {
  palavra: string;
  sons: (ChaveFonema | null)[];
}

/**
 * SÍNTESE com som prolongado (docs/pedagogia/04 N2): a criança toca as letras uma a uma, ouve cada som esticado e
 * depois os sons emendados ("mmmaaalll…"), cada vez mais depressa; então escolhe a figura (ou a palavra falada) que
 * os sons formaram, entre 2–3 opções com um som de diferença. A palavra inteira só é dita DEPOIS da resposta.
 * Roteiro "eu faço, nós fazemos, você faz": 1º item demonstrado pela dupla, 2º guiado, os outros sozinho.
 */
export interface AtividadeSintese extends AtividadeBase {
  tipo: 'sintese';
  itens: (PalavraComSons & { opcoes: Opcao[]; correta: string; pseudo?: boolean })[];
  /** Liga o roteiro eu faço / nós fazemos (padrão: ligado). */
  roteiro?: boolean;
  sortear?: number;
}

/**
 * CAIXAS DE SONS (Elkonin, docs/pedagogia/04 N1): ouve a palavra, põe uma ficha por som nas caixas (há caixa
 * sobrando: o número de sons não é dado) e depois troca cada ficha pela letra do som (segmentação → escrita).
 */
export interface AtividadeCaixas extends AtividadeBase {
  tipo: 'caixas';
  itens: (PalavraComSons & { figura?: string; letras: string[] })[];
  /** Habilidade da parte de escrita (a da atividade mede a segmentação). */
  habilidadeEscrita: HabilidadeId;
  /** Caixas a mais, para o número de caixas não entregar o número de sons (padrão: 1). */
  caixasExtras?: number;
}

/**
 * PARES MÍNIMOS de palavras (docs/pedagogia/04 N3): duas palavras que mudam UM som (faca × vaca).
 * `ouvir`: ouve uma e toca a figura certa. `ler`: vê a palavra escrita e escolhe a leitura certa entre duas.
 */
export interface ItemParMinimo {
  modo: 'ouvir' | 'ler';
  alvo: string;
  outra: string;
  /** Os dois sons que mudam (o do alvo primeiro), para a correção contrastiva. */
  sons: [ChaveFonema, ChaveFonema];
  /** Figuras (modo ouvir). */
  figuraAlvo?: string;
  figuraOutra?: string;
  habilidade?: HabilidadeId;
}
export interface AtividadeParMinimo extends AtividadeBase {
  tipo: 'parMinimo';
  itens: ItemParMinimo[];
  sortear?: number;
}

/**
 * TROCA-LETRAS e MAIS-UMA-LETRA (docs/pedagogia/04 N4, N5): a dupla pede um SOM novo numa posição; a criança acha a
 * letra desse som entre as letras móveis, a palavra muda na tela, e ela escolhe a leitura da palavra nova entre três
 * (a palavra nova nunca é dita antes).
 */
export interface ItemTroca {
  acao: 'trocar' | 'acrescentar';
  de: string;
  para: string;
  /** Posição (0 = primeira letra) que muda ou onde a letra entra. */
  posicao: number;
  /** Som novo (chave do fonema) e a letra dele. */
  som: ChaveFonema;
  letra: string;
  /** Letras móveis oferecidas (inclui a certa). */
  letras: string[];
  /** Leituras oferecidas (inclui `para`, e a palavra antiga). */
  leituras: string[];
  habilidade?: HabilidadeId;
}
export interface AtividadeTroca extends AtividadeBase {
  tipo: 'troca';
  itens: ItemTroca[];
  /** Habilidade da parte "qual letra faz este som" (padrão: a da letra, `gpc-<letra>`). */
  habilidadeLetra?: HabilidadeId;
}

/**
 * LEITURA DE FRASE decodificável (docs/pedagogia/04 N11, N12): a criança lê a frase sozinha (tocar numa palavra toca
 * os sons dela, um a um — ensina o caminho, não diz a palavra) e responde a uma pergunta literal tocando na figura.
 * Com `eco`: depois, a dupla lê a frase com ritmo e a criança relê junto (registro de autorrelato: não vale nota).
 */
export interface ItemFrase {
  frase: string;
  pergunta: Fala;
  correta: string;
  /** Figuras (3), todas plausíveis. */
  opcoes: string[];
  /** Sons de cada palavra (para o "toque na palavra"). */
  palavras: PalavraComSons[];
}
export interface AtividadeFrase extends AtividadeBase {
  tipo: 'frase';
  itens: ItemFrase[];
  eco?: boolean;
  /** Habilidade da pergunta de compreensão. */
  habilidadeCompreensao: HabilidadeId;
}

export interface AtividadePausa extends AtividadeBase {
  tipo: 'pausa';
  acao: string;
  /** Sons/palavras falados durante a pausa; a criança se mexe nos que têm o alvo. */
  sequencia: { falar: string; alvo: boolean }[];
}

export type Atividade =
  | AtividadeEscolher
  | AtividadePalmas
  | AtividadeMontar
  | AtividadeDitado
  | AtividadeFalar
  | AtividadeEspelho
  | AtividadeLetra
  | AtividadeLigar
  | AtividadeTracar
  | AtividadePausa
  | AtividadeSomNovo
  | AtividadeSintese
  | AtividadeCaixas
  | AtividadeParMinimo
  | AtividadeTroca
  | AtividadeFrase;

/* ------------------------------- cenas ------------------------------- */

export type TipoCena = 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9';

export interface Cena {
  id: string;
  tipo: TipoCena;
  titulo: string;
  /** Chave de imagem de fundo (ver web/src/assets.ts). Lição usa fundo limpo. */
  cenario: string;
  /** "Assiste e Faz" (D015): roteiro curto da dupla antes da atividade. */
  /**
   * `video`: clipe em web/public/assets/video/<nome>.mp4 (com capa <nome>.webp) · `audio`: diálogo gravado da dupla em
   * web/public/assets/audio/<nome>.mp3, tocado sobre a `imagem`. O `roteiro` é falado DEPOIS da mídia.
   */
  assiste?: { roteiro: Fala[]; imagem?: string; video?: string; audio?: string };
  atividade?: Atividade;
  /** Conta para o domínio/progresso da fase? */
  contaDominio?: boolean;
  /** Missão ambiental, esporte etc. (para selos). */
  marcador?: string;
}

export type CriterioFase =
  | { tipo: 'missao' }
  | { tipo: 'dominio'; habilidades: HabilidadeId[] }
  | { tipo: 'chefe'; leituraMin: number; escritaMin?: number };

export interface Fase {
  id: string;
  regiao: RegiaoId;
  numero: number;
  titulo: string;
  /** Objetivo de aprendizagem (vai na barra "próximo objetivo", P1-b). */
  objetivo: string;
  sessoesPrevistas: string;
  habilidades: HabilidadeId[];
  cenas: Cena[];
  criterio: CriterioFase;
  /** Fala curta dita na entrada da fase, no lugar de "título. objetivo." (letras: "Letra B."). */
  falaEntrada?: Fala;
  /** Missão curta (Trilha do Alfabeto): sem pausa ativa automática. */
  curta?: boolean;
  /** Trilha do Alfabeto: letra desta missão, ou 'revisao' / 'festa'. */
  alfabeto?: { letra?: string; tipo: 'letra' | 'revisao' | 'festa' };
  /** Trilha dos Sons (D030): unidade da trilha fônica (TF-01…), bloco e o que aparece no disco da trilha. */
  trilhaSons?: { unidade: string; bloco: number; tipo: 'licao' | 'regra' | 'revisao'; rotulo: string };
  /** Fala de abertura (C0) e de gancho (C9). */
  acolhida: Fala;
  gancho: Fala;
  /** O que a fase deixa no mundo ao fechar. */
  fechamento: string;
  /** Missão de 5 min em casa (painel da família). */
  emCasa: string;
  /** IDs de conquistas mostradas em "Minhas Conquistas" desta fase. */
  conquistas: string[];
  /** Ponto de demonstração "Mostra pro professor". */
  demonstracao?: { descricao: string; habilidade: HabilidadeId };
  chefe?: boolean;
  /** Termômetro 0–10 depois de vencer (só chefes). */
  termometro?: number;
  /** Momento uau desta fase (texto curto mostrado na celebração). */
  uau?: string;
}

export interface Regiao {
  id: RegiaoId;
  nome: string;
  perguntaGuia: string;
  cenario: string;
  /** Posição no mapa do arquipélago (% da imagem). */
  mapa: { x: number; y: number };
  fases: string[];
  selo: string;
  chefe: string;
  zumZumViraAmigo: string;
  ganchoProxima: string;
  /** Etapa da jornada (D027): Alfabeto → Sílabas → Palavras → Meu nome → Frases. */
  etapa: string;
}

/* ---------------------------- conquistas ---------------------------- */

export type TipoConquista = 'selo' | 'medalha' | 'trofeu' | 'titulo' | 'emblema_colecao' | 'selo_validacao';

export interface ConquistaCatalogo {
  id: string;
  nome: string;
  tipo: TipoConquista | 'patente';
  categoria: string;
  regiao: string;
  criterio: string;
  niveis: string[];
  visivel_antes: 'visivel' | 'misterio' | 'oculto';
  area?: string;
}

export interface Conquista extends ConquistaCatalogo {
  /** Dica do cadeado: diz a HABILIDADE, sem "para desbloquear" (P1-b). */
  dica: string;
  /** Motivo do selo (emoji ou letra). */
  motivo: string;
}

/* ------------------------------ lojinha ----------------------------- */

export interface ItemLoja {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  /** "Por que guardar?" — frase de educação financeira. */
  fala: string;
  categoria: 'utensilio' | 'esporte' | 'casa' | 'livro';
}

/** Item que chega como SURPRESA depois de um marco (P1-b): igual para todos, sem sorte. */
export interface Surpresa {
  nivel: number;
  tipo: 'item' | 'area';
  id: string;
  nome: string;
  imagem?: string;
}
