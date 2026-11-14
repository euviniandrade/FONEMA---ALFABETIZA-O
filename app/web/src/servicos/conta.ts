/**
 * Contas dos adultos (Decisão 028). A tela só conversa com a interface `ServicoConta`.
 * Hoje: contas guardadas NESTE APARELHO (pela camada Repositorio), protegidas por PIN de 4 dígitos —
 * guardamos só o hash do PIN com salt (PBKDF2 · Web Crypto). Amanhã: login real com servidor —
 * basta escrever outra classe que implemente `ServicoConta` e trocar em `servicoConta()`.
 * A criança nunca digita senha: ela entra pelo cartão do personagem.
 */
import type { RegistroConta, Repositorio } from '../dados/repositorio.ts';
import { novoId } from '../dados/repositorio.ts';

export type TipoConta = 'responsavel' | 'professor';
export interface Conta { id: string; nome: string; tipo: TipoConta; email?: string; criadaEm: number }
export interface Sessao { contaId: string; nome: string; tipo: TipoConta; ate: number }
export type ResultadoEntrada = { ok: true; sessao: Sessao } | { ok: false; motivo: 'pin' | 'espera'; segundos?: number };

export interface ServicoConta {
  listar(): Promise<Conta[]>;
  criar(dados: { nome: string; tipo: TipoConta; email?: string; pin: string }): Promise<Sessao>;
  entrar(contaId: string, pin: string): Promise<ResultadoEntrada>;
  redefinirPin(contaId: string, novoPin: string): Promise<Sessao>;
  sessao(): Sessao | null;
  sair(): void;
}

export const pinValido = (pin: string) => /^\d{4}$/.test(pin);
export const ROTULO_TIPO: Record<TipoConta, string> = { responsavel: 'Pai, mãe ou responsável', professor: 'Professor(a)' };

const CHAVE_SESSAO = 'fonema-sessao';
const DURACAO = 30 * 60_000;
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function hashPin(pin: string, salt: string): Promise<string> {
  const dados = new TextEncoder().encode(pin);
  const sal = new TextEncoder().encode(salt);
  if (globalThis.crypto?.subtle) {
    const chave = await crypto.subtle.importKey('raw', dados, 'PBKDF2', false, ['deriveBits']);
    return 'p1:' + hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: 60_000 }, chave, 256));
  }
  // sem Web Crypto (página aberta sem https): mistura simples, só para o protótipo não travar
  let h = 2166136261;
  for (let i = 0; i < 4000; i++) for (const c of `${salt}:${pin}:${i}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return 'f0:' + h.toString(16);
}
function novoSalt(): string {
  const b = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) crypto.getRandomValues(b); else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  return hex(b);
}

/** Implementação local (protótipo): contas no aparelho, sessão na aba. */
export class ServicoContaLocal implements ServicoConta {
  private erros = 0;
  private bloqueadoAte = 0;
  constructor(private repo: Repositorio) {}

  private publica = ({ id, nome, tipo, email, criadaEm }: RegistroConta): Conta => ({ id, nome, tipo, email, criadaEm });
  private abrir(c: RegistroConta): Sessao {
    const s: Sessao = { contaId: c.id, nome: c.nome, tipo: c.tipo, ate: Date.now() + DURACAO };
    try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch { /* sem sessionStorage */ }
    return s;
  }

  async listar() { return (await this.repo.listarContas()).map(this.publica); }

  async criar(d: { nome: string; tipo: TipoConta; email?: string; pin: string }) {
    if (!pinValido(d.pin)) throw new Error('PIN inválido');
    const salt = novoSalt();
    const c: RegistroConta = { id: novoId('ct'), nome: d.nome.trim(), tipo: d.tipo, email: d.email?.trim() || undefined, salt, hashPin: await hashPin(d.pin, salt), criadaEm: Date.now() };
    await this.repo.salvarContas([...(await this.repo.listarContas()), c]);
    return this.abrir(c);
  }

  async entrar(contaId: string, pin: string): Promise<ResultadoEntrada> {
    if (Date.now() < this.bloqueadoAte) return { ok: false, motivo: 'espera', segundos: Math.ceil((this.bloqueadoAte - Date.now()) / 1000) };
    const c = (await this.repo.listarContas()).find((x) => x.id === contaId);
    if (c && (await hashPin(pin, c.salt)) === c.hashPin) { this.erros = 0; return { ok: true, sessao: this.abrir(c) }; }
    if (++this.erros >= 5) { this.erros = 0; this.bloqueadoAte = Date.now() + 30_000; return { ok: false, motivo: 'espera', segundos: 30 }; }
    return { ok: false, motivo: 'pin' };
  }

  async redefinirPin(contaId: string, novoPin: string) {
    if (!pinValido(novoPin)) throw new Error('PIN inválido');
    const contas = await this.repo.listarContas();
    const c = contas.find((x) => x.id === contaId);
    if (!c) throw new Error('Conta não encontrada');
    c.salt = novoSalt();
    c.hashPin = await hashPin(novoPin, c.salt);
    await this.repo.salvarContas(contas);
    this.erros = 0; this.bloqueadoAte = 0;
    return this.abrir(c);
  }

  sessao(): Sessao | null {
    try {
      const s = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null') as Sessao | null;
      if (!s || s.ate < Date.now()) return null;
      s.ate = Date.now() + DURACAO; // a sessão se renova enquanto o adulto usa
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
      return s;
    } catch { return null; }
  }

  sair() { try { sessionStorage.removeItem(CHAVE_SESSAO); } catch { /* ok */ } }
}

const porRepo = new WeakMap<Repositorio, ServicoConta>();
/** Ponto de troca: devolva aqui um ServicoContaApi quando o login com servidor existir. */
export function servicoConta(repo: Repositorio): ServicoConta {
  let s = porRepo.get(repo);
  if (!s) { s = new ServicoContaLocal(repo); porRepo.set(repo, s); }
  return s;
}
