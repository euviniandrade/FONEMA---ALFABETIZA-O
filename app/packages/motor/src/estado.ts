/**
 * Estado da criança na jornada (o que o repositório guarda). Lógica pura: nada aqui acessa tela ou banco.
 */
import type { Genero } from '@fonema/conteudo';

export interface Tentativa {
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
  versao: 1;
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
  sessoesFeitas: number;
  ultimaSessao?: number;
  criadoEm: number;
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
  avatar: { base: string; cantinho: string };
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
