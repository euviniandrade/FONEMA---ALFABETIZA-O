/**
 * Estado da criança na jornada (o que o repositório guarda). Lógica pura: nada aqui acessa tela ou banco.
 */
import type { Atividade, Genero } from '@fonema/conteudo';
import type { DadosBiblioteca } from './biblioteca.ts';

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
export type MecanicaTentativa = Atividade['tipo'] | 'sondagem' | MecanicaLivre;
/** Mecânicas do Cantinho da Leitura e do Brincar com sons (biblioteca.ts). */
export type MecanicaLivre = 'historia' | 'texto' | 'fluencia' | 'escuta' | 'ficha' | MecanicaJogo;
/**
 * D032 §4: jogos fônicos. Corre-Som e Bichinho Come-Som (jogos-fonicos.ts); Estrada e Rio dos Pares, Carteiro da Vila e Casa do
 * Som (jogos-vila.ts). Cada escolha conferida é uma tentativa AVALIADA; moedas, distância e enfeites não contam.
 */
export type MecanicaJogo = 'corre-som' | 'come-som' | 'estrada-pares' | 'carteiro' | 'casa-som' | 'memoria-sons' | 'caca-tesouro';

/** De que natureza é o `alvo` (para o painel separar sons, letras e palavras). */
export type CategoriaAlvo = 'fonema' | 'grafema' | 'silaba' | 'palavra' | 'pseudopalavra' | 'outro';

export interface DetalheTentativa {
  /** O que a tentativa prova. Ausente = o motor deduz pela mecânica da cena (tentativas.ts › tipoDaTentativa). */
  tipo?: TipoTentativa;
  mecanica?: MecanicaTentativa;
  /**
   * O item CERTO, em texto estável e legível: a letra ("P"), a chave do fonema ("p", "rr"), a sílaba ("MA") ou a
   * palavra ("MALA"). No Escolher: a letra da opção correta quando ela é uma letra; o `som` da opção quando o item
   * testa um som com figuras (figura "bola" → alvo "b", categoria 'fonema'); senão o `id` da opção (a palavra).
   * `alvo`, `escolhido`, `respostas` e `distratores` usam SEMPRE o mesmo vocabulário dentro do item.
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

  /* ---- campos de 15/11 (D030 etapa 9; docs/pedagogia/06 §1). Todos OPCIONAIS: quem não grava continua válido. ---- */

  /**
   * Maior ajuda que o item recebeu (escada de docs/pedagogia/06 §4), da menor para a maior:
   * 'nenhuma' · 'repetiu' (ouviu o estímulo de novo por conta do app) · 'contraste' (1º erro: o app tocou o escolhido e o
   * certo) · 'caminho' (2º erro: mostrou como achar, som por som) · 'resposta-mostrada' (brilho/resposta: NÃO conta como acerto).
   * Ausente = o motor deduz por `tentativaNumero`/`comAjuda` (ver ajuda.ts › nivelDeAjuda).
   */
  nivelAjuda?: NivelAjuda;
  /** Quantas vezes a CRIANÇA pediu para ouvir de novo (botão "ouvir de novo") neste item. Sinal de dúvida, não de erro. */
  ouviuDeNovo?: number;
  /** Posição da resposta certa nas opções mostradas (0 = a primeira, na ordem de leitura da tela). */
  posicaoCerta?: number;
  /** Posição da PRIMEIRA opção tocada (0 = a primeira). Junto com `posicaoCerta`, mostra chute por posição (E-CHU). */
  posicaoEscolhida?: number;
  /** Quantas opções havia na tela (chance de chute = 1/nOpcoes; docs/pedagogia/04 §1 R8). */
  nOpcoes?: number;
  /** Onde a tentativa aconteceu: trilha (fase), revisão, sondagem ou reforço (treino rápido). Não misturar treino com medida. */
  contexto?: ContextoTentativa;
  /**
   * Formato do item dentro da mecânica (no Escolher: 'som-letra', 'letra-som', 'ler-figura', 'ouvir-leituras'…). Junto com
   * `mecanica`, define o TIPO DE ATIVIDADE para o critério "mais de um tipo de atividade" (docs/pedagogia/06 §2, item 5).
   */
  formato?: string;
  /**
   * D035 (Corre-Som em corrida, `formato: 'corrida'`): como estava a corrida ANTES desta passagem pelo arco. A sequência cruza
   * letras (habilidades diferentes), por isso fica gravada na própria tentativa. `mexeu`: a criança trocou de pista ou tocou numa
   * pista enquanto este arco vinha (sem isso, passar no arco é ficar parada, não é escolha). Ver tentativas.ts › chuteDeCorrida.
   */
  corrida?: { acertosSeguidos: number; errosSeguidos: number; mexeu: boolean; nivel?: number };
}

/** Escada de ajuda (docs/pedagogia/06 §4). A ordem importa: é da menor para a maior. */
export type NivelAjuda = 'nenhuma' | 'repetiu' | 'contraste' | 'caminho' | 'resposta-mostrada';
export const NIVEIS_AJUDA: NivelAjuda[] = ['nenhuma', 'repetiu', 'contraste', 'caminho', 'resposta-mostrada'];

/** 'desafio' (D032 §4): jogo fônico escolhido pela criança no lugar de uma cena da fase (mesmos itens; conta como a cena). */
export type ContextoTentativa = 'trilha' | 'revisao' | 'sondagem' | 'reforco' | 'livre' | 'desafio';

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
  /**
   * D030 (revisão de 16/11): a etiqueta "a confirmar" veio de uma prova de UMA sessão (chefe vencido ou prova-relâmpago),
   * que libera o avanço mas não prova domínio. O marco (moedinhas, "dominou agora") fica para quando o critério honesto
   * for cumprido.
   */
  marcoPendente?: boolean;
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
  /** 2 = registro detalhado e domínio honesto (D030); 3 = ordem alternada letras/sons (D031); 4 = TF-23…TF-25 na jornada. Versões antigas: migracao.ts. */
  versao: 1 | 2 | 3 | 4;
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
  /** D030: treinos rápidos com a Sofia feitos (reforco-treino.ts), só o resumo (as respostas vão para `habilidades`). */
  treinos?: { em: number; habilidade: string; motivo: string; acertos: number; total: number }[];
  /** Cantinho da Leitura e Brincar com sons (biblioteca.ts): resumos de fluência, escrita própria, histórias, textos, eco e jogos. */
  biblioteca?: DadosBiblioteca;
  sessoesFeitas: number;
  ultimaSessao?: number;
  criadoEm: number;
  /** D032: tutorial "A grande aventura" (guia.ts). Ausente = nunca viu. `passo` = onde parou (para retomar). */
  tutorial?: { passo?: number; vistoEm?: number; puladoEm?: number; vezes?: number };
  /** D032: resumo da última missão feita (painel guia: estrelinhas e selos). */
  ultimaMissao?: ResumoMissao;
  /** D032 §4: jogos da vila (jogos-vila.ts): casinha decorada e cor do carro/barco. Brincadeira: nada aqui conta como domínio. */
  jogosVila?: DadosJogosVila;
  /** D034: extras que ABRIRAM e a criança ainda não visitou (selo "Novo!"; desbloqueio.ts). Ausente = nada novo. */
  novidades?: string[];
}

/** Casa do Som e garagem (jogos-vila.ts). Só enfeite e brincadeira (regra 4): nunca entra no domínio. */
export interface DadosJogosVila {
  /** Móveis já recebidos na Casa do Som (palavra do móvel), na ordem em que chegaram. */
  moveis: string[];
  /** Onde cada móvel está na casinha (em % da sala: x da esquerda, y de cima). */
  posicoes: Record<string, { x: number; y: number }>;
  /** Cor escolhida do carro/barco (id da cor em jogos-vila.ts › CORES_VEICULO). */
  corVeiculo?: string;
}

/** D032: resumo da última missão, para o painel guia (estrelinhas = retorno à criança, não domínio). */
export interface ResumoMissao {
  faseId: string;
  em: number;
  desafios: number;
  estrelas: 1 | 2 | 3;
  /** Conquistas (selos) ganhas nesta missão. */
  selos: string[];
  faseConcluida: boolean;
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
  /** Ditado: o que a criança escreveu (letras na ordem), para o adulto ver ao lado da forma certa. */
  escrito?: string;
  /** Posição da resposta certa e da escolhida (0 = a primeira opção). */
  posicaoCerta?: number;
  posicaoEscolhida?: number;
  /** Vezes que a criança pediu para ouvir de novo. */
  ouviuDeNovo?: number;
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
  /** Qual tela mediu: a Missão das Placas (primeira sondagem) ou a sondagem periódica em blocos (sondagem-itens.ts). */
  tela?: 'placas' | 'blocos';
}

/**
 * Avatar 3D (D029 §7): só DADOS — ids de cores e variações do catálogo (@fonema/conteudo › avatar.ts).
 * O boneco começa no padrão completo; `null` = "como o modelo já vem" (a criança ainda não mudou).
 */
export interface AvatarCrianca {
  versao: 3;
  /** Cor do cantinho (fundo das miniaturas). */
  cantinho: string;
  pele: string | null;
  olhos: string | null;
  corCabelo: string | null;
  /** Tipo de cabelo (troca o modelo inteiro). */
  cabelo: string | null;
  camisa: string | null;
  calca: string | null;
  calcado: string | null;
  /** Itens de acessibilidade ligados (óculos, pintura no rosto; aparelho auditivo e cadeira de rodas ficam guardados). */
  acessibilidade: string[];
  /** A criança já passou pela personalização ao menos uma vez. */
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
