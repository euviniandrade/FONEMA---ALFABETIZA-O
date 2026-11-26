/**
 * Contas dos adultos (Decisão 028; fila do dono nº 34, 26/11/2026: "colocando login e senha na hora que entrar").
 * A tela só conversa com a interface `ServicoConta`.
 *
 * Hoje: contas guardadas NESTE APARELHO (pela camada Repositorio), sem servidor. Cada adulto (família ou professor)
 * entra com LOGIN (e-mail ou nome de usuário) + SENHA; guardamos só o hash da senha com salt (PBKDF2-SHA-256 ·
 * Web Crypto), como o administrador (servicos/admin-conta.ts). Contas antigas, de antes do login, têm só PIN de 4
 * números: entram com o PIN uma vez e criam o login e a senha (`migrar`).
 * Amanhã: login real com servidor — basta escrever outra classe que implemente `ServicoConta` e trocar em `servicoConta()`.
 * A criança nunca digita senha: ela entra pelo cartão do personagem.
 */
import type { RegistroConta, Repositorio } from '../dados/repositorio.ts';
import { novoId } from '../dados/repositorio.ts';

export type TipoConta = 'responsavel' | 'professor';
export interface Conta { id: string; nome: string; tipo: TipoConta; email?: string; login?: string; criadaEm: number; /** conta antiga, só com PIN */ soPin: boolean }
export interface Sessao { contaId: string; nome: string; tipo: TipoConta; ate: number }
export type ResultadoEntrada =
  | { ok: true; sessao: Sessao }
  | { ok: false; motivo: 'senha' | 'pin' | 'espera'; segundos?: number }
  /** login e senha certos, mas a conta é da outra porta (família × professor): não abre sessão */
  | { ok: false; motivo: 'outro-tipo'; tipo: TipoConta };

export interface ServicoConta {
  listar(): Promise<Conta[]>;
  criar(dados: { nome: string; tipo: TipoConta; login: string; senha: string; email?: string }): Promise<Sessao>;
  /** Entrar pela porta de um tipo (ou qualquer, sem `tipo`) com login e senha. */
  entrarComLogin(login: string, senha: string, tipo?: TipoConta): Promise<ResultadoEntrada>;
  /** Confere a credencial de uma conta conhecida: a senha, ou o PIN se a conta é antiga. Abre a sessão. */
  entrar(contaId: string, credencial: string): Promise<ResultadoEntrada>;
  /** Conta antiga (só PIN): com o PIN certo, cria o login e a senha e abre a sessão. */
  migrar(contaId: string, pin: string, login: string, senha: string): Promise<Sessao>;
  /** Conta antiga que esqueceu o PIN (como o antigo "Esqueci o PIN": segurar 5 s no aparelho): cria login e senha sem o PIN. */
  redefinirAcessoAntigo(contaId: string, login: string, senha: string): Promise<Sessao>;
  /** "Esqueci a senha" (sem servidor, feito no próprio aparelho): senha nova para o login. */
  redefinirSenha(login: string, novaSenha: string): Promise<Sessao>;
  /** Conta antiga: "Esqueci o PIN" continua funcionando como antes. */
  redefinirPin(contaId: string, novoPin: string): Promise<Sessao>;
  sessao(): Sessao | null;
  sair(): void;
}

export const pinValido = (pin: string) => /^\d{4}$/.test(pin);
export const SENHA_ADULTO_MIN = 6;
/** Senha do adulto: pelo menos 6 caracteres e não só números. Devolve o problema, ou null se está boa. */
export function senhaAdultoValida(s: string): string | null {
  if (s.length < SENHA_ADULTO_MIN) return `A senha precisa de pelo menos ${SENHA_ADULTO_MIN} caracteres.`;
  if (/^\d+$/.test(s)) return 'Use letras também (só números é fácil de adivinhar).';
  return null;
}
export const normalizarLogin = (l: string) => l.trim().toLowerCase();
/** Login: e-mail, ou nome de usuário de 3 a 40 letras, números, ponto, traço ou sublinhado. */
export function loginValido(l: string): string | null {
  const x = normalizarLogin(l);
  if (!x) return 'Escreva um e-mail ou um nome de usuário.';
  if (x.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) ? null : 'Confira o e-mail.';
  if (x.length < 3) return 'O nome de usuário precisa de pelo menos 3 letras.';
  if (x.length > 40) return 'Nome de usuário muito comprido (até 40).';
  return /^[a-z0-9._-]+$/.test(x) ? null : 'No nome de usuário use só letras sem acento, números, ponto, traço ou _.';
}
export const ROTULO_TIPO: Record<TipoConta, string> = { responsavel: 'Pai, mãe ou responsável', professor: 'Professor(a)' };

const CHAVE_SESSAO = 'fonema-sessao';
const DURACAO = 30 * 60_000;
const ITERACOES_SENHA = 100_000;
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** Mistura simples só para quando a página é aberta sem https (sem Web Crypto): o protótipo não trava. */
function misturaSemCrypto(segredo: string, salt: string): string {
  let h = 2166136261;
  for (let i = 0; i < 4000; i++) for (const c of `${salt}:${segredo}:${i}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return 'f0:' + h.toString(16);
}
async function pbkdf2(segredo: string, salt: string, iteracoes: number): Promise<string> {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: iteracoes }, chave, 256));
}
export async function hashPin(pin: string, salt: string): Promise<string> {
  return globalThis.crypto?.subtle ? 'p1:' + (await pbkdf2(pin, salt, 60_000)) : misturaSemCrypto(pin, salt);
}
/** Hash da senha do adulto: `p2:<iterações>:<hex>` (mesmo formato do administrador). */
export async function hashSenhaAdulto(senha: string, salt: string, iteracoes = ITERACOES_SENHA): Promise<string> {
  return globalThis.crypto?.subtle ? `p2:${iteracoes}:${await pbkdf2(senha, salt, iteracoes)}` : misturaSemCrypto(senha, salt);
}
const iteracoesDe = (hash: string) => Number(/^p2:(\d+):/.exec(hash)?.[1] ?? ITERACOES_SENHA);
async function senhaConfere(c: RegistroConta, senha: string) { return !!c.hashSenha && (await hashSenhaAdulto(senha, c.salt, iteracoesDe(c.hashSenha))) === c.hashSenha; }
function novoSalt(): string {
  const b = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) crypto.getRandomValues(b); else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  return hex(b);
}

/** Implementação local (sem servidor): contas no aparelho, sessão na aba. */
export class ServicoContaLocal implements ServicoConta {
  private erros = 0;
  private bloqueadoAte = 0;
  constructor(private repo: Repositorio, private guardaSessao: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = typeof sessionStorage !== 'undefined' ? sessionStorage : null) {}

  private publica = ({ id, nome, tipo, email, login, hashSenha, criadaEm }: RegistroConta): Conta => ({ id, nome, tipo, email, login, criadaEm, soPin: !hashSenha });
  private abrir(c: RegistroConta): Sessao {
    const s: Sessao = { contaId: c.id, nome: c.nome, tipo: c.tipo, ate: Date.now() + DURACAO };
    try { this.guardaSessao?.setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch { /* sem sessionStorage */ }
    return s;
  }
  private espera(): ResultadoEntrada | null {
    return Date.now() < this.bloqueadoAte ? { ok: false, motivo: 'espera', segundos: Math.ceil((this.bloqueadoAte - Date.now()) / 1000) } : null;
  }
  private errou(motivo: 'senha' | 'pin'): ResultadoEntrada {
    if (++this.erros >= 5) { this.erros = 0; this.bloqueadoAte = Date.now() + 30_000; return { ok: false, motivo: 'espera', segundos: 30 }; }
    return { ok: false, motivo };
  }
  private async loginLivre(login: string, contas: RegistroConta[], exceto?: string) {
    const x = normalizarLogin(login);
    if (contas.some((c) => c.id !== exceto && c.login === x)) throw new Error('Este login já existe neste aparelho. Escolha outro (ou entre com ele).');
    return x;
  }

  async listar() { return (await this.repo.listarContas()).map(this.publica); }

  async criar(d: { nome: string; tipo: TipoConta; login: string; senha: string; email?: string }) {
    const e = loginValido(d.login) ?? senhaAdultoValida(d.senha);
    if (e) throw new Error(e);
    const contas = await this.repo.listarContas();
    const login = await this.loginLivre(d.login, contas);
    const salt = novoSalt();
    const email = d.email?.trim() || (login.includes('@') ? login : undefined);
    const c: RegistroConta = { id: novoId('ct'), nome: d.nome.trim(), tipo: d.tipo, email, login, salt, hashSenha: await hashSenhaAdulto(d.senha, salt), criadaEm: Date.now() };
    await this.repo.salvarContas([...contas, c]);
    return this.abrir(c);
  }

  async entrarComLogin(login: string, senha: string, tipo?: TipoConta): Promise<ResultadoEntrada> {
    const parado = this.espera();
    if (parado) return parado;
    const c = (await this.repo.listarContas()).find((x) => x.login && x.login === normalizarLogin(login));
    if (!c || !(await senhaConfere(c, senha))) return this.errou('senha');
    this.erros = 0;
    if (tipo && c.tipo !== tipo) return { ok: false, motivo: 'outro-tipo', tipo: c.tipo };
    return { ok: true, sessao: this.abrir(c) };
  }

  async entrar(contaId: string, credencial: string): Promise<ResultadoEntrada> {
    const parado = this.espera();
    if (parado) return parado;
    const c = (await this.repo.listarContas()).find((x) => x.id === contaId);
    const certo = !!c && (c.hashSenha ? await senhaConfere(c, credencial) : !!c.hashPin && (await hashPin(credencial, c.salt)) === c.hashPin);
    if (!c || !certo) return this.errou(c?.hashSenha ? 'senha' : 'pin');
    this.erros = 0;
    return { ok: true, sessao: this.abrir(c) };
  }

  async migrar(contaId: string, pin: string, login: string, senha: string) {
    const e = loginValido(login) ?? senhaAdultoValida(senha);
    if (e) throw new Error(e);
    const contas = await this.repo.listarContas();
    const c = contas.find((x) => x.id === contaId);
    if (!c || c.hashSenha || !c.hashPin || (await hashPin(pin, c.salt)) !== c.hashPin) throw new Error('Não deu para confirmar o PIN desta conta.');
    c.login = await this.loginLivre(login, contas, c.id);
    c.salt = novoSalt();
    c.hashSenha = await hashSenhaAdulto(senha, c.salt);
    delete c.hashPin;
    if (!c.email && c.login.includes('@')) c.email = c.login;
    await this.repo.salvarContas(contas);
    return this.abrir(c);
  }

  async redefinirAcessoAntigo(contaId: string, login: string, senha: string) {
    const e = loginValido(login) ?? senhaAdultoValida(senha);
    if (e) throw new Error(e);
    const contas = await this.repo.listarContas();
    const c = contas.find((x) => x.id === contaId);
    if (!c || c.hashSenha) throw new Error('Esta conta já usa login e senha: use "Esqueci a senha".');
    c.login = await this.loginLivre(login, contas, c.id);
    c.salt = novoSalt();
    c.hashSenha = await hashSenhaAdulto(senha, c.salt);
    delete c.hashPin;
    if (!c.email && c.login.includes('@')) c.email = c.login;
    await this.repo.salvarContas(contas);
    this.erros = 0; this.bloqueadoAte = 0;
    return this.abrir(c);
  }

  async redefinirSenha(login: string, novaSenha: string) {
    const e = senhaAdultoValida(novaSenha);
    if (e) throw new Error(e);
    const contas = await this.repo.listarContas();
    const c = contas.find((x) => x.login && x.login === normalizarLogin(login));
    if (!c) throw new Error('Não achamos este login neste aparelho.');
    c.salt = novoSalt();
    c.hashSenha = await hashSenhaAdulto(novaSenha, c.salt);
    await this.repo.salvarContas(contas);
    this.erros = 0; this.bloqueadoAte = 0;
    return this.abrir(c);
  }

  async redefinirPin(contaId: string, novoPin: string) {
    if (!pinValido(novoPin)) throw new Error('PIN inválido');
    const contas = await this.repo.listarContas();
    const c = contas.find((x) => x.id === contaId);
    if (!c) throw new Error('Conta não encontrada');
    if (c.hashSenha) throw new Error('Esta conta usa login e senha.');
    c.salt = novoSalt();
    c.hashPin = await hashPin(novoPin, c.salt);
    await this.repo.salvarContas(contas);
    this.erros = 0; this.bloqueadoAte = 0;
    return this.abrir(c);
  }

  sessao(): Sessao | null {
    try {
      const s = JSON.parse(this.guardaSessao?.getItem(CHAVE_SESSAO) || 'null') as Sessao | null;
      if (!s || s.ate < Date.now()) return null;
      s.ate = Date.now() + DURACAO; // a sessão se renova enquanto o adulto usa
      this.guardaSessao?.setItem(CHAVE_SESSAO, JSON.stringify(s));
      return s;
    } catch { return null; }
  }

  sair() { try { this.guardaSessao?.removeItem(CHAVE_SESSAO); } catch { /* ok */ } }
}

const porRepo = new WeakMap<Repositorio, ServicoConta>();
/** Ponto de troca: devolva aqui um ServicoContaApi quando o login com servidor existir. */
export function servicoConta(repo: Repositorio): ServicoConta {
  let s = porRepo.get(repo);
  if (!s) { s = new ServicoContaLocal(repo); porRepo.set(repo, s); }
  return s;
}
