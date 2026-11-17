import { describe, expect, it } from 'vitest';
import { GavetaMemoria, ServicoAdmin, hashSenha, senhaValida } from './admin-conta.ts';

const memoria = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };

describe('acesso do administrador (senha com PBKDF2, nada de senha no código)', () => {
  it('senha fraca é recusada', () => {
    expect(senhaValida('abc')).toMatch(/8/);
    expect(senhaValida('12345678')).toMatch(/letras/);
    expect(senhaValida('bolota-2026')).toBeNull();
  });
  it('o hash não contém a senha e muda com o salt', async () => {
    const a = await hashSenha('bolota-2026', 'sal1', 1000);
    const b = await hashSenha('bolota-2026', 'sal2', 1000);
    expect(a).toMatch(/^p2:1000:[0-9a-f]{64}$/);
    expect(a).not.toContain('bolota');
    expect(a).not.toBe(b);
  });
  it('primeiro uso cria o administrador geral; depois só entra com a senha certa', async () => {
    const g = new GavetaMemoria();
    const s = new ServicoAdmin(g, memoria());
    expect(await s.primeiroUso()).toBe(true);
    const ses = await s.criarGeral('Dono', 'senha-forte-1');
    expect(ses.papel).toBe('geral');
    expect(await s.primeiroUso()).toBe(false);
    await expect(s.criarGeral('Outro', 'senha-forte-2')).rejects.toThrow(/Já existe/);
    const guardado = JSON.stringify(g.m.get('admin-contas'));
    expect(guardado).not.toContain('senha-forte-1');
    const [c] = await s.contas();
    expect((await s.entrar(c.id, 'errada!!')).ok).toBe(false);
    expect((await s.entrar(c.id, 'senha-forte-1')).ok).toBe(true);
  });
  it('5 senhas erradas: espera', async () => {
    const s = new ServicoAdmin(new GavetaMemoria(), memoria());
    await s.criarGeral('Dono', 'senha-forte-1');
    const [c] = await s.contas();
    let r;
    for (let i = 0; i < 5; i++) r = await s.entrar(c.id, `errada-${i}xx`);
    expect(r).toMatchObject({ ok: false, motivo: 'espera' });
    expect(await s.entrar(c.id, 'senha-forte-1')).toMatchObject({ ok: false, motivo: 'espera' });
  });
  it('o geral cria o administrador da escola; a escola não cria nem remove acessos', async () => {
    const sessao = memoria();
    const s = new ServicoAdmin(new GavetaMemoria(), sessao);
    await s.criarGeral('Dono', 'senha-forte-1');
    const esc = await s.criarEscola('Coordenação', 'escola-2026');
    expect(esc.papel).toBe('escola');
    s.sair();
    expect((await s.entrar(esc.id, 'escola-2026')).ok).toBe(true);
    await expect(s.criarEscola('X', 'outra-senha-1')).rejects.toThrow();
    await expect(s.removerConta(esc.id)).rejects.toThrow();
  });
  it('zerar apaga contas e dados do administrador', async () => {
    const s = new ServicoAdmin(new GavetaMemoria(), memoria());
    await s.criarGeral('Dono', 'senha-forte-1');
    await s.gravar('escola', { nome: 'Escola X' });
    await s.zerar();
    expect(await s.primeiroUso()).toBe(true);
    expect(await s.ler('escola')).toBeUndefined();
    expect(s.sessao()).toBeNull();
  });
});
