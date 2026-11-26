import { describe, expect, it } from 'vitest';
import type { RegistroConta, Repositorio } from '../dados/repositorio.ts';
import { ServicoContaLocal, hashPin, loginValido, senhaAdultoValida } from './conta.ts';

const memoria = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };
function repoFalso(inicial: RegistroConta[] = []) {
  let contas = inicial;
  return { repo: { listarContas: async () => structuredClone(contas), salvarContas: async (c: RegistroConta[]) => { contas = structuredClone(c); } } as unknown as Repositorio, ver: () => contas };
}

describe('contas dos adultos com login e senha (fila do dono nº 34)', () => {
  it('valida login e senha', () => {
    expect(loginValido('ana')).toBeNull();
    expect(loginValido('Ana@Escola.com')).toBeNull();
    expect(loginValido('an')).toMatch(/3/);
    expect(loginValido('ana souza')).toMatch(/letras/);
    expect(senhaAdultoValida('abc12')).toMatch(/6/);
    expect(senhaAdultoValida('123456')).toMatch(/letras/);
    expect(senhaAdultoValida('bolota1')).toBeNull();
  });
  it('cria a conta sem guardar a senha; entra só com login e senha certos', async () => {
    const { repo, ver } = repoFalso();
    const s = new ServicoContaLocal(repo, memoria());
    const ses = await s.criar({ nome: 'Ana', tipo: 'professor', login: ' Ana.Prof ', senha: 'fonema123' });
    expect(ses.tipo).toBe('professor');
    expect(JSON.stringify(ver())).not.toContain('fonema123');
    expect(ver()[0].login).toBe('ana.prof');
    expect(await s.entrarComLogin('ana.prof', 'errada1', 'professor')).toMatchObject({ ok: false, motivo: 'senha' });
    expect(await s.entrarComLogin('ninguem', 'fonema123', 'professor')).toMatchObject({ ok: false, motivo: 'senha' });
    expect((await s.entrarComLogin('ANA.PROF', 'fonema123', 'professor')).ok).toBe(true);
    expect(s.sessao()?.nome).toBe('Ana');
  });
  it('login repetido é recusado', async () => {
    const { repo } = repoFalso();
    const s = new ServicoContaLocal(repo, memoria());
    await s.criar({ nome: 'Ana', tipo: 'responsavel', login: 'ana', senha: 'fonema123' });
    await expect(s.criar({ nome: 'Outra', tipo: 'professor', login: 'ANA', senha: 'fonema456' })).rejects.toThrow(/já existe/);
  });
  it('a conta da família não abre a porta do professor (e vice-versa)', async () => {
    const { repo } = repoFalso();
    const s = new ServicoContaLocal(repo, memoria());
    await s.criar({ nome: 'Ana', tipo: 'responsavel', login: 'ana', senha: 'fonema123' });
    s.sair();
    expect(await s.entrarComLogin('ana', 'fonema123', 'professor')).toEqual({ ok: false, motivo: 'outro-tipo', tipo: 'responsavel' });
    expect(s.sessao()).toBeNull();
    expect((await s.entrarComLogin('ana', 'fonema123')).ok).toBe(true);
  });
  it('5 senhas erradas = espera', async () => {
    const { repo } = repoFalso();
    const s = new ServicoContaLocal(repo, memoria());
    await s.criar({ nome: 'Ana', tipo: 'responsavel', login: 'ana', senha: 'fonema123' });
    let r = await s.entrarComLogin('ana', 'x1x1x1');
    for (let i = 0; i < 4; i++) r = await s.entrarComLogin('ana', `errada${i}`);
    expect(r).toMatchObject({ ok: false, motivo: 'espera' });
    expect(await s.entrarComLogin('ana', 'fonema123')).toMatchObject({ ok: false, motivo: 'espera' });
  });
  it('conta antiga (só PIN) entra com o PIN e cria login e senha', async () => {
    const salt = 'sal-antigo';
    const { repo, ver } = repoFalso([{ id: 'ct-1', nome: 'Rosa', tipo: 'responsavel', salt, hashPin: await hashPin('1234', salt), criadaEm: 1 }]);
    const s = new ServicoContaLocal(repo, memoria());
    expect((await s.listar())[0].soPin).toBe(true);
    expect(await s.entrar('ct-1', '0000')).toMatchObject({ ok: false, motivo: 'pin' });
    expect((await s.entrar('ct-1', '1234')).ok).toBe(true);
    await expect(s.migrar('ct-1', '9999', 'rosa', 'fonema123')).rejects.toThrow();
    await s.migrar('ct-1', '1234', 'rosa', 'fonema123');
    expect(ver()[0].hashPin).toBeUndefined();
    expect((await s.listar())[0].soPin).toBe(false);
    expect((await s.entrarComLogin('rosa', 'fonema123', 'responsavel')).ok).toBe(true);
    expect((await s.entrar('ct-1', 'fonema123')).ok).toBe(true);
  });
  it('esqueci a senha: senha nova para o login, neste aparelho', async () => {
    const { repo } = repoFalso();
    const s = new ServicoContaLocal(repo, memoria());
    await s.criar({ nome: 'Ana', tipo: 'professor', login: 'ana', senha: 'fonema123' });
    await expect(s.redefinirSenha('bia', 'nova-senha1')).rejects.toThrow(/Não achamos/);
    await s.redefinirSenha('ana', 'nova-senha1');
    expect((await s.entrarComLogin('ana', 'fonema123')).ok).toBe(false);
    expect((await s.entrarComLogin('ana', 'nova-senha1')).ok).toBe(true);
  });
});
