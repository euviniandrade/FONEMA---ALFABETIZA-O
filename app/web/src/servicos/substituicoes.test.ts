import { beforeEach, describe, expect, it } from 'vitest';
import { ArmazemMemoria, idArquivo, idFala, idNome, idSom, substituicoes, tipoDoId } from './substituicoes.ts';
import { sonsLetras } from './sons-letras.ts';
import { ProvedorPreGerado, ProvedorSilencioso } from './voz.ts';

const wav = (n = 64) => new Blob([new Uint8Array(n).fill(7)], { type: 'audio/wav' });
const reg = (id: string, blob = wav()) => ({ id, blob, nomeArquivo: 'teste.wav', origem: 'arquivo' as const, em: 1 });

describe('camada de substituição de áudios (D032 item 5)', () => {
  beforeEach(() => { substituicoes.usar(new ArmazemMemoria()); sonsLetras.recarregar(); });

  it('ids lógicos: som, fala, nome e arquivo', () => {
    expect(idSom('m')).toBe('som:m');
    expect(idFala('sofia', 'Bola.')).toBe('fala:sofia|Bola.');
    expect(idNome('tales', 'ana')).toBe('nome:tales|ana');
    expect(idArquivo('./assets/audio/x.mp3?v=2')).toBe('arquivo:assets/audio/x.mp3');
    expect(tipoDoId('fala:sofia|Oi')).toBe('fala');
    expect(tipoDoId('qualquer')).toBeNull();
  });

  it('salvar → tem e url (blob do aparelho); voltar ao original → some', async () => {
    await substituicoes.salvar(reg('som:m'));
    expect(substituicoes.tem('som:m')).toBe(true);
    const u = await substituicoes.url('som:m');
    expect(u).toMatch(/^blob:/);
    expect((await (await fetch(u!)).arrayBuffer()).byteLength).toBe(64);
    await substituicoes.remover('som:m');
    expect(substituicoes.tem('som:m')).toBe(false);
    expect(await substituicoes.url('som:m')).toBeNull();
  });

  it('trocar de novo o mesmo áudio gera endereço novo (sem tocar o antigo guardado em memória)', async () => {
    await substituicoes.salvar(reg('som:s', wav(10)));
    const a = await substituicoes.url('som:s');
    await substituicoes.salvar(reg('som:s', wav(20)));
    const b = await substituicoes.url('som:s');
    expect(b).not.toBe(a);
    expect((await (await fetch(b!)).arrayBuffer()).byteLength).toBe(20);
  });

  it('recusa áudio vazio e id desconhecido', async () => {
    await expect(substituicoes.salvar(reg('som:m', new Blob([])))).rejects.toThrow();
    await expect(substituicoes.salvar(reg('xyz'))).rejects.toThrow();
  });

  it('avisa quem está ouvindo quando um áudio muda', async () => {
    let n = 0;
    const sair = substituicoes.ouvir(() => n++);
    await substituicoes.salvar(reg('som:m'));
    await substituicoes.remover('som:m');
    sair();
    await substituicoes.salvar(reg('som:m'));
    expect(n).toBe(2);
  });

  it('som das letras: o substituto do administrador vem antes do som publicado, também para fonema sem clipe (R fraco)', async () => {
    await substituicoes.salvar(reg('som:r'));
    const o = await sonsLetras.origem('r');
    expect(o?.origem).toBe('substituto');
    expect(o?.url).toMatch(/^blob:/);
    expect(await sonsLetras.tem('r')).toBe(true);
    await substituicoes.remover('som:r');
    expect(await sonsLetras.origem('r')).toBeNull(); // sem mapa publicado (teste sem servidor) e sem gravação
  });

  it('fala: trecho trocado entra no plano da fala com o id lógico; trecho sem clipe oficial também toca se tiver substituto', async () => {
    const p = new ProvedorPreGerado(new ProvedorSilencioso());
    await p.pronto;
    (p as unknown as { falas: Record<string, string> }).falas = { 'sofia|Bola.': 'sofia-bola-m1.mp3' };
    expect(p.plano('Bola.', 'sofia')?.[0]).toMatchObject({ arquivo: './audio/falas/sofia-bola-m1.mp3', id: 'fala:sofia|Bola.' });
    expect(p.plano('Pipa.', 'sofia')).toBeNull();
    await substituicoes.salvar(reg('fala:sofia|Pipa.'));
    expect(p.plano('Pipa.', 'sofia')?.[0]).toMatchObject({ arquivo: 'substituto:fala:sofia|Pipa.', id: 'fala:sofia|Pipa.' });
    expect(p.temTrecho('Pipa.', 'sofia')).toBe(true);
  });

  it('nome da criança trocado conta como nome com clipe', async () => {
    const p = new ProvedorPreGerado(new ProvedorSilencioso());
    await p.pronto;
    expect(p.temNomeNaVoz('sofia', 'Agatha')).toBe(false);
    await substituicoes.salvar(reg('nome:sofia|agatha'));
    expect(p.temNomeNaVoz('sofia', 'Agatha')).toBe(true);
  });
});
