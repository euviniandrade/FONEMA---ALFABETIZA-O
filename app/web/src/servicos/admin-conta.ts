/**
 * ACESSO DO ADMINISTRADOR (D032 item 5). Sem servidor: as contas ficam NESTE aparelho (banco "fonema-admin",
 * loja "chaves"), e a senha nunca é guardada — só o hash PBKDF2-SHA-256 com salt (Web Crypto), como o PIN dos adultos
 * (servicos/conta.ts), com mais iterações e senha de no mínimo 8 caracteres. Nada de senha no código.
 *
 * Dois papéis:
 *  - "geral" (o dono): criado no primeiro uso; vê tudo e configura os áudios e o site;
 *  - "escola" (administrador da escola): criado pelo geral; vê a visão geral e os dados formais da escola.
 * Sessão na aba (sessionStorage), 30 minutos renovados com o uso. 5 senhas erradas = espera de 60 s.
 * Esqueceu a senha: "Zerar o acesso" apaga as contas de administrador, os dados da escola e os áudios trocados deste
 * aparelho; se houver contas de adulto (família/professor), pede o PIN de uma delas antes (servicos/conta.ts).
 */
import { abrirBancoAdmin } from './substituicoes.ts';

export type PapelAdmin = 'geral' | 'escola';
export interface ContaAdmin { id: string; nome: string; papel: PapelAdmin; salt: string; hash: string; criadaEm: number }
export interface SessaoAdmin { id: string; nome: string; papel: PapelAdmin; ate: number }

/** Onde as contas ficam (IndexedDB no app; memória nos testes). */
export interface GavetaAdmin {
  ler<T>(chave: string): Promise<T | undefined>;
  gravar<T>(chave: string, valor: T): Promise<void>;
  apagarTudo(): Promise<void>;
}
export class GavetaIndexedDB implements GavetaAdmin {
  private db = abrirBancoAdmin();
  async ler<T>(chave: string) { return ((await (await this.db).get('chaves', chave)) as { valor: T } | undefined)?.valor; }
  async gravar<T>(chave: string, valor: T) { await (await this.db).put('chaves', { id: chave, valor }); }
  async apagarTudo() { const db = await this.db; await db.clear('chaves'); await db.clear('substitutos'); }
}
export class GavetaMemoria implements GavetaAdmin {
  m = new Map<string, unknown>();
  async ler<T>(chave: string) { return this.m.get(chave) as T | undefined; }
  async gravar<T>(chave: string, valor: T) { this.m.set(chave, valor); }
  async apagarTudo() { this.m.clear(); }
}

export const SENHA_MIN = 8;
export const ITERACOES = 150_000;
const CHAVE_CONTAS = 'admin-contas';
const CHAVE_SESSAO = 'fonema-admin-sessao';
const DURACAO = 30 * 60_000;
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');

export function senhaValida(s: string): string | null {
  if (s.length < SENHA_MIN) return `A senha precisa de pelo menos ${SENHA_MIN} caracteres.`;
  if (/^\d+$/.test(s)) return 'Use letras também (só números é fácil de adivinhar).';
  return null;
}

export async function hashSenha(senha: string, salt: string, iteracoes = ITERACOES): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Este navegador não tem Web Crypto (abra o site por https).');
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: iteracoes }, chave, 256);
  return `p2:${iteracoes}:${hex(bits)}`;
}
function novoSalt(): string { const b = new Uint8Array(16); crypto.getRandomValues(b); return hex(b); }
const novoIdAdmin = () => `adm-${hex(crypto.getRandomValues(new Uint8Array(8)))}`;

export class ServicoAdmin {
  private erros = 0;
  private bloqueadoAte = 0;
  constructor(private gaveta: GavetaAdmin, private sessaoGuardada: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = typeof sessionStorage !== 'undefined' ? sessionStorage : null) {}

  async contas(): Promise<ContaAdmin[]> { return (await this.gaveta.ler<ContaAdmin[]>(CHAVE_CONTAS)) ?? []; }
  /** Ainda não há administrador geral neste aparelho (primeiro uso). */
  async primeiroUso(): Promise<boolean> { return !(await this.contas()).some((c) => c.papel === 'geral'); }

  private abrir(c: ContaAdmin): SessaoAdmin {
    const s: SessaoAdmin = { id: c.id, nome: c.nome, papel: c.papel, ate: Date.now() + DURACAO };
    try { this.sessaoGuardada?.setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch { /* sem armazenamento */ }
    return s;
  }

  /** Primeiro uso: cria o administrador geral. Falha se já existe um. */
  async criarGeral(nome: string, senha: string): Promise<SessaoAdmin> {
    const erro = senhaValida(senha);
    if (erro) throw new Error(erro);
    if (!(await this.primeiroUso())) throw new Error('Já existe um administrador neste aparelho.');
    const salt = novoSalt();
    const c: ContaAdmin = { id: novoIdAdmin(), nome: nome.trim() || 'Administrador', papel: 'geral', salt, hash: await hashSenha(senha, salt), criadaEm: Date.now() };
    await this.gaveta.gravar(CHAVE_CONTAS, [...(await this.contas()), c]);
    return this.abrir(c);
  }

  /** O administrador geral cria (ou troca a senha de) um administrador da escola. */
  async criarEscola(nome: string, senha: string): Promise<ContaAdmin> {
    if (this.sessao()?.papel !== 'geral') throw new Error('Só o administrador geral cria outro acesso.');
    const erro = senhaValida(senha);
    if (erro) throw new Error(erro);
    const salt = novoSalt();
    const c: ContaAdmin = { id: novoIdAdmin(), nome: nome.trim() || 'Escola', papel: 'escola', salt, hash: await hashSenha(senha, salt), criadaEm: Date.now() };
    await this.gaveta.gravar(CHAVE_CONTAS, [...(await this.contas()), c]);
    return c;
  }
  async removerConta(id: string): Promise<void> {
    if (this.sessao()?.papel !== 'geral') throw new Error('Só o administrador geral remove acessos.');
    const lista = await this.contas();
    const alvo = lista.find((c) => c.id === id);
    if (!alvo || alvo.papel === 'geral') throw new Error('O administrador geral não pode ser removido.');
    await this.gaveta.gravar(CHAVE_CONTAS, lista.filter((c) => c.id !== id));
  }
  async trocarSenha(id: string, atual: string, nova: string): Promise<void> {
    const erro = senhaValida(nova);
    if (erro) throw new Error(erro);
    const lista = await this.contas();
    const c = lista.find((x) => x.id === id);
    if (!c || (await hashSenha(atual, c.salt, iteracoesDe(c.hash))) !== c.hash) throw new Error('Senha atual errada.');
    c.salt = novoSalt();
    c.hash = await hashSenha(nova, c.salt);
    await this.gaveta.gravar(CHAVE_CONTAS, lista);
  }

  async entrar(id: string, senha: string): Promise<{ ok: true; sessao: SessaoAdmin } | { ok: false; motivo: 'senha' | 'espera'; segundos?: number }> {
    if (Date.now() < this.bloqueadoAte) return { ok: false, motivo: 'espera', segundos: Math.ceil((this.bloqueadoAte - Date.now()) / 1000) };
    const c = (await this.contas()).find((x) => x.id === id);
    if (c && (await hashSenha(senha, c.salt, iteracoesDe(c.hash))) === c.hash) { this.erros = 0; return { ok: true, sessao: this.abrir(c) }; }
    if (++this.erros >= 5) { this.erros = 0; this.bloqueadoAte = Date.now() + 60_000; return { ok: false, motivo: 'espera', segundos: 60 }; }
    return { ok: false, motivo: 'senha' };
  }

  sessao(): SessaoAdmin | null {
    try {
      const s = JSON.parse(this.sessaoGuardada?.getItem(CHAVE_SESSAO) || 'null') as SessaoAdmin | null;
      if (!s || s.ate < Date.now()) return null;
      s.ate = Date.now() + DURACAO;
      this.sessaoGuardada?.setItem(CHAVE_SESSAO, JSON.stringify(s));
      return s;
    } catch { return null; }
  }
  sair() { try { this.sessaoGuardada?.removeItem(CHAVE_SESSAO); } catch { /* ok */ } }

  /** Zera o acesso de administrador deste aparelho (contas, dados da escola e áudios trocados). */
  async zerar(): Promise<void> { await this.gaveta.apagarTudo(); this.sair(); }

  /** Dados guardados pela Área do administrador (escola, turmas, professores, ajustes). */
  ler<T>(chave: string) { return this.gaveta.ler<T>(`dados:${chave}`); }
  gravar<T>(chave: string, valor: T) { return this.gaveta.gravar(`dados:${chave}`, valor); }
}
const iteracoesDe = (hash: string) => Number(/^p2:(\d+):/.exec(hash)?.[1] ?? ITERACOES);

let unico: ServicoAdmin | null = null;
export function servicoAdmin(): ServicoAdmin {
  unico ??= new ServicoAdmin(new GavetaIndexedDB());
  return unico;
}
