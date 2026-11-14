/**
 * Camada de REPOSITÓRIO: a tela só conversa com esta interface.
 * Hoje: IndexedDB no aparelho (offline). Amanhã: API NestJS/Postgres (arquitetura-infra) — basta
 * escrever outra classe que implemente `Repositorio` e trocar em `criarRepositorio()`.
 */
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Crianca, Demonstracao, Evento, Progresso, StatusDemonstracao } from '@fonema/motor';

/** Conta de adulto guardada no aparelho (D028). O PIN nunca é guardado: só o hash com salt. */
export interface RegistroConta {
  id: string;
  nome: string;
  tipo: 'responsavel' | 'professor';
  email?: string;
  salt: string;
  hashPin: string;
  criadaEm: number;
}

export interface Repositorio {
  /** Contas de adultos deste aparelho (D028). Trocar por API quando houver servidor. */
  listarContas(): Promise<RegistroConta[]>;
  salvarContas(contas: RegistroConta[]): Promise<void>;

  listarCriancas(): Promise<Crianca[]>;
  obterCrianca(id: string): Promise<Crianca | undefined>;
  salvarCrianca(c: Crianca): Promise<void>;
  removerCrianca(id: string): Promise<void>;

  obterProgresso(criancaId: string): Promise<Progresso | undefined>;
  salvarProgresso(p: Progresso): Promise<void>;

  registrarEvento(e: Evento): Promise<void>;
  listarEventos(criancaId: string): Promise<Evento[]>;

  salvarDemonstracao(d: Demonstracao): Promise<void>;
  listarDemonstracoes(criancaId?: string): Promise<Demonstracao[]>;
  responderDemonstracao(id: string, status: StatusDemonstracao, agora: number): Promise<Demonstracao | undefined>;

  salvarAudio(id: string, blob: Blob, agora: number): Promise<void>;
  obterAudio(id: string): Promise<Blob | undefined>;
  apagarAudio(id: string): Promise<void>;
  /** Apaga áudios mais velhos que N dias (gravação do nome: 30 dias, D013). */
  apagarAudiosAntigos(dias: number, agora: number): Promise<number>;

  obterConfig(): Promise<Partial<ConfigPlataforma>>;
  salvarConfig(c: Partial<ConfigPlataforma>): Promise<void>;

  exportarTudo(): Promise<unknown>;
  apagarTudo(): Promise<void>;
}

export function novoId(prefixo: string): string {
  const r = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefixo}-${r}`;
}
