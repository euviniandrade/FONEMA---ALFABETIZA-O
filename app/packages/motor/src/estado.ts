/**
 * Estado da criança na jornada (o que o repositório guarda). Lógica pura: nada aqui acessa tela ou banco.
 */
import type { Atividade, Genero } from '@fonema/conteudo';

/* ------------------------------------------------------------------------------------------------------------------
 * CONTRATO DO REGISTRO DETALHADO DE TENTATIVAS (D030, etapa 2) — quem escreve as mecânicas lê aqui.
 *
 * UMA `Tentativa` = UM ITEM respondido (uma pergunta do Escolher, uma palavra do Montar/Ditado, uma letra do Traçar…),
 * gravada quando o item termina. Não é "um toque": os toques errados do mesmo item vão em `respostas`.
 * Todos os campos de `DetalheTentativa` são OPCIONAIS: dados antigos (sem eles) continuam válidos, e o motor
 * completa `tipo` e `mecanica` sozinho a partir da cena quando a mecânica não informa (ver tentativas.ts).
 *
 * Como passar (web): `tentativa(habilidade, sessao, cenaId, erros, { alvo, escolhido, respostas, distratores, tempoMs, … })`
 * — o último parâmetro (`extra: Partial<Tentativa>`) já aceita estes campos. No motor: `detalharTentativa(t, detalhe)`.
 * ------------------------------------------------------------------------------------------------------------------ */

/**
 * O que a tentativa prova:
 *  - 'avaliada': a criança respondeu e o app conferiu a resposta (Escolher, Montar, Ditado, Palmas). CONTA para o domínio.
 *  - 'exposicao': a criança viu/ouviu/fez junto, sem resposta conferida (Letra, Espelho, Traçar, Pausa). É participação.
 *  - 'autorrelato': alguém disse "consegui" sem o app conferir (Falar: "Li!" / "Me ajuda"). É participação.
 * Exposição e autorrelato NÃO contam para o domínio, nem para o critério de pseudopalavras.
 */
export type TipoTentativa = 'avaliada' | 'exposicao' | 'autorrelato';

/** Mecânica que gerou a tentativa: o `tipo` da atividade ('escolher', 'ligar', 'montar'…), mais a sondagem. */
export type MecanicaTentativa = Atividade['tipo'] | 'sondagem';

/** De que natureza é o `alvo` (para o painel separar sons, letras e palavras). */
export type CategoriaAlvo = 'fonema' | 'grafema' | 'silaba' | 'palavra' | 'pseudopalavra' | 'outro';

export interface DetalheTentativa {
  /** O que a tentativa prova. Ausente = o motor deduz pela mecânica da cena (tentativas.ts › tipoDaTentativa). */
  tipo?: TipoTentativa;
  mecanica?: MecanicaTentativa;
  /**
   * O item CERTO, em texto estável e legível: a letra ("P"), a chave do fonema ("p", "rr"), a sílaba ("MA") ou a
   * palavra ("MALA"). No Escolher: o `id` (ou a letra) da opção correta.
   */
  alvo?: string;
  categoria?: CategoriaAlvo;
  /**
   * A PRIMEIRA resposta da criança neste item, no mesmo vocabulário do `alvo`. Se acertou de primeira, é igual ao `alvo`.
   * (É o dado que alimenta a matriz de confusão: "escolheu B quando o alvo era P".)
   */
  escolhido?: string;
  /** Todas as respostas do item, na ordem em que foram dadas (a última é a certa, quando o item terminou em acerto). */
  respostas?: string[];
  /** As opções ERRADAS oferecidas (sem o alvo). No Montar/Ditado: as letras/sílabas distratoras da bandeja. */
  distratores?: string[];
  /** Tempo do item, em ms: do momento em que a pergunta ficou pronta para responder até a resposta certa (ou o fim). */
  tempoMs?: number;
  /** Em qual tentativa o item foi resolvido: 1 = de primeira, 2 = na segunda… (igual a nº de erros + 1). */
  tentativaNumero?: number;
}

export interface Tentativa extends DetalheTentativa {
  /** Momento (ms desde 1970). */
  em: number;
  sessao: string;
  habilidade: string;
  acertou: boolean;
  /** Acertou depois de ajuda (escada N3): conta como desafio feito, mas não como acerto "sozinho". */
  comAjuda?: boolean;
  pseudo?: boolean;
  cena?: string;
  /** Item de revisão (Jardim da Revisão). */
  revisao?: boolean;
}

export interface EstadoHabilidade {
  tentativas: Tentativa[];
  /** P(domínio) do modelo do aluno (BKT simples). */
  p: number;
  dominadaEm?: number;
  /** Revisão espaçada. */
  revisao?: { indice: number; proxima: number; retencaoOk?: boolean };
  /**
   * D030: a habilidade está marcada como dominada (`dominadaEm`), mas por um caminho que NÃO comprovou o critério
   * inteiro com tentativas avaliadas (dado antigo em que exposição contava; chefe vencido sem pseudopalavra avaliada).
   * Nada é tirado da criança (selos, revisão), mas o painel do adulto mostra "a confirmar" e não "dominada".
   * Some sozinho quando o critério honesto é cumprido (jornada.ts › fecharSessao).
   */
  aConfirmar?: boolean;
}

/** D026: nível inicial escolhido pelo adulto no cadastro (dá para mudar na área da família). */
export type NivelInicial = 'zero' | 'letras-e-sons' | 'le-palavras';

export type EstadoFase = 'bloqueada' | 'aberta' | 'concluida';

export interface ProgressoFase {
  estado: EstadoFase;
  sessoes: number;
  abertaEm?: number;
  concluidaEm?: number;
  /** Trilha Expressa (D021): fase feita como prova-relâmpago. */
  expressa?: boolean;
  /**
   * D026: fase LIBERADA pelo nível inicial escolhido pelo adulto — aberta para visitar e revisar, com os selos
   * ainda por conquistar. Não conta como concluída nem como dominada.
   */
  liberada?: boolean;
  /**
   * D030: CONCLUÍDA × DOMINADA. `concluidaEm` = a criança terminou a fase (missão: por participação).
   * `dominadaEm` = todas as habilidades da fase estão dominadas de verdade (tentativas avaliadas, sem "a confirmar").
   */
  dominadaEm?: number;
  /** Último resultado do chefe (0–1). */
  chefe?: { leitura: number; escrita?: number; passou: boolean; em: number };
}

export interface ConquistaGanha {
  id: string;
  nivel: 'bronze' | 'prata' | 'ouro' | 'diamante' | 'unico';
  em: number;
  /** Já foi mostrada na celebração (surpresa entregue). */
  vista: boolean;
}

export interface Progresso {
  criancaId: string;
  /** 2 = registro detalhado e domínio honesto (D030); dados da versão 1 são migrados em migracao.ts. */
  versao: 1 | 2;
  /** D026: de onde a criança começou (escolha do adulto). Ausente = do zero. */
  nivelInicial?: NivelInicial;
  faseAtual: string;
  fases: Record<string, ProgressoFase>;
  habilidades: Record<string, EstadoHabilidade>;
  /** Desafios feitos (nível da jornada = esforço, nunca desce). */
  desafios: number;
  termometro: number;
  moedinhas: { saldo: number; total: number; porDia: Record<string, number> };
  conquistas: Record<string, ConquistaGanha>;
  itens: string[];
  equipados: string[];
  areas: string[];
  /** Surpresas já entregues (nível → id). */
  surpresas: string[];
  /** Contadores de marcadores (esporte, ambiente, ensinar, rituais, traçados…). */
  contadores: Record<string, number>;
  /** Trilha Expressa a partir da sondagem (regiões que a criança já domina). */
  expressa: { regioes: string[]; ativa: boolean; sondagemEm?: number; degrau?: number };
  /** D030: sondagens periódicas feitas (sondagem.ts), da mais antiga para a mais nova. */
  sondagens?: ResultadoSondagem[];
  sessoesFeitas: number;
  ultimaSessao?: number;
  criadoEm: number;
}

/* ------------------------------ sondagem periódica (D030, etapa 9) ------------------------------ */

/** As cinco áreas que a sondagem periódica acompanha. */
export type AreaSondagem = 'sons-letras' | 'leitura-palavras' | 'pseudopalavras' | 'segmentacao' | 'ditado';

export interface ItemSondagem {
  alvo: string;
  /** Primeira resposta da criança (ausente = não respondeu). */
  escolhido?: string;
  acertou: boolean;
  tempoMs?: number;
}

export interface ResultadoAreaSondagem {
  acertos: number;
  total: number;
  itens?: ItemSondagem[];
}

export interface ResultadoSondagem {
  id: string;
  em: number;
  /** Por que foi feita: a primeira, por número de fases, por tempo, ou pedida pelo adulto. */
  motivo: 'inicial' | 'fases' | 'dias' | 'adulto';
  /** Retrato da jornada no momento (para comparar sondagens). */
  faseAtual: string;
  fasesConcluidas: number;
  /** Só as áreas que esta sondagem mediu; área ausente = não medida (não é zero). */
  areas: Partial<Record<AreaSondagem, ResultadoAreaSondagem>>;
  /** Degrau da "Missão das Placas" (sondagem lúdica antiga), quando a tela usada foi ela. */
  degrau?: number;
}

/**
 * Avatar montável (D029): só DADOS — ids de peças e de cores do catálogo (@fonema/conteudo › avatar.ts).
 * `null` = a criança ainda não escolheu (o boneco começa limpo).
 */
export interface AvatarCrianca {
  versao: 2;
  /** Cor do cantinho (fundo das miniaturas). */
  cantinho: string;
  pele: string | null;
  rosto: string | null;
  olhos: string | null;
  cabelo: string | null;
  corCabelo: string;
  camisa: string | null;
  calca: string | null;
  calcado: string | null;
  /** Itens de acessibilidade ligados (óculos, aparelho auditivo, cadeira de rodas, pintura no rosto). */
  acessibilidade: string[];
  /** A montagem obrigatória foi concluída ao menos uma vez. */
  pronto: boolean;
  /** Recorte antigo guardado só até o sexo ser escolhido (migração). */
  baseAntiga?: string;
}

export interface Crianca {
  id: string;
  nome: string;
  genero: Genero;
  anoNascimento: number;
  pronuncia: { grafia: string; fala: string; rate: number; pitchExtra: number; voz: 'sofia' | 'tales' };
  /** Id do áudio gravado pelo adulto (apagado em 30 dias). */
  gravacaoNomeId?: string;
  gravacaoNomeEm?: number;
  /** Cadastro antigo com "prefiro não informar": o app pede a escolha uma vez (D029). */
  generoPendente?: boolean;
  avatar: AvatarCrianca;
  apoios: { previsivel: boolean; focoCurto: boolean; leituraReforco: boolean; calmo: boolean };
  jaSabe: { letrasDoNome: string; lePalavras: string; leFrases: string };
  consentimentos: { responsavel: boolean; vozPrimeiroNome: boolean; gravarVozAdulto: boolean; em: number };
  rotina: { minutosDia: number; horaDormir: string };
  turma?: string;
  criadoEm: number;
}

export type StatusDemonstracao = 'pendente' | 'aprendeu' | 'treinar' | 'explicou' | 'criterio';

export interface Demonstracao {
  id: string;
  criancaId: string;
  faseId: string;
  habilidade: string;
  descricao: string;
  /** Como a criança mostrou: ao vivo ou com gravação (id do áudio). */
  modo: 'ao-vivo' | 'gravacao';
  audioId?: string;
  status: StatusDemonstracao;
  criadaEm: number;
  respondidaEm?: number;
  /** A criança já ouviu o retorno do professor. */
  vista?: boolean;
}

export interface Evento {
  id: string;
  criancaId: string;
  em: number;
  tipo: 'atividade' | 'sessao' | 'fase' | 'conquista' | 'compra' | 'demonstracao' | 'sondagem' | 'assistiu';
  faseId?: string;
  cena?: string;
  habilidade?: string;
  texto: string;
  acertos?: number;
  total?: number;
}

export function diaDe(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DIA_MS = 24 * 60 * 60 * 1000;
