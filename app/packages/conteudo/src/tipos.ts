/**
 * FONEMA · tipos do conteúdo.
 *
 * Todo o conteúdo pedagógico é DADO: fonemas, palavras, fases, cenas, falas, conquistas e itens.
 * Para "criar coisas" na plataforma, edite os arquivos de dados (ver app/README.md §"Criar conteúdo").
 *
 * Notação das falas (jogo-completo/README §2):
 *   [NOME]                      → primeiro nome da criança, na pronúncia escolhida pelo adulto
 *   {pronto|pronta|Tudo pronto} → concordância: masculino | feminino | prefiro não informar
 */

export type Genero = 'm' | 'f' | 'n';

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

export type RegiaoId = 'R0' | 'R1' | 'R2a';

/* ----------------------------- mecânicas ----------------------------- */

export interface Opcao {
  id: string;
  rotulo: string;
  figura?: string;
  /** Letra grande no lugar da figura (TOCAR letra). */
  letra?: string;
  /** O que a voz fala ao tocar a opção. */
  falar?: string;
}

export interface ItemEscolha {
  /** Pergunta falada (opcional; senão vale o enunciado da atividade). */
  pergunta?: Fala;
  /** O que a voz toca antes de mostrar as opções (ex.: "sssapo… lua"). */
  ouvir?: string;
  opcoes: Opcao[];
  correta: string;
  pseudo?: boolean;
  /** Dica de 1º erro (fala da dupla). */
  dica?: string;
  habilidade?: HabilidadeId;
}

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
  distratoras?: string[];
}

export interface AtividadeDitado extends AtividadeBase {
  tipo: 'ditado';
  palavras: string[];
  letras: string[];
}

export interface AtividadeFalar extends AtividadeBase {
  tipo: 'falar';
  itens: { texto: string; falar: string; figura?: string; pseudo?: boolean }[];
}

export interface AtividadeEspelho extends AtividadeBase {
  tipo: 'espelho';
  /** Chave do fonema ou "$SOM_NOME". */
  fonema: ChaveFonema;
  letra: string;
  ancora: { texto: string; figura: string };
}

export interface AtividadeTracar extends AtividadeBase {
  tipo: 'tracar';
  letras: string[];
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
  | AtividadeTracar
  | AtividadePausa;

/* ------------------------------- cenas ------------------------------- */

export type TipoCena = 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9';

export interface Cena {
  id: string;
  tipo: TipoCena;
  titulo: string;
  /** Chave de imagem de fundo (ver web/src/assets.ts). Lição usa fundo limpo. */
  cenario: string;
  /** "Assiste e Faz" (D015): roteiro curto da dupla antes da atividade. */
  assiste?: { roteiro: Fala[]; imagem?: string };
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
