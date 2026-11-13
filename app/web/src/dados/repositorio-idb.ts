import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ConfigPlataforma } from '@fonema/conteudo';
import type { Crianca, Demonstracao, Evento, Progresso, StatusDemonstracao } from '@fonema/motor';
import type { Repositorio } from './repositorio.ts';

interface Esquema extends DBSchema {
  criancas: { key: string; value: Crianca };
  progressos: { key: string; value: Progresso };
  eventos: { key: string; value: Evento; indexes: { porCrianca: string } };
  demonstracoes: { key: string; value: Demonstracao; indexes: { porCrianca: string } };
  audios: { key: string; value: { id: string; blob: Blob; em: number } };
  config: { key: string; value: { id: string; valor: Partial<ConfigPlataforma> } };
}

const NOME_BANCO = 'fonema';

export class RepositorioIndexedDB implements Repositorio {
  private db: Promise<IDBPDatabase<Esquema>>;

  constructor(nome = NOME_BANCO) {
    this.db = openDB<Esquema>(nome, 1, {
      upgrade(db) {
        db.createObjectStore('criancas', { keyPath: 'id' });
        db.createObjectStore('progressos', { keyPath: 'criancaId' });
        db.createObjectStore('eventos', { keyPath: 'id' }).createIndex('porCrianca', 'criancaId');
        db.createObjectStore('demonstracoes', { keyPath: 'id' }).createIndex('porCrianca', 'criancaId');
        db.createObjectStore('audios', { keyPath: 'id' });
        db.createObjectStore('config', { keyPath: 'id' });
      }
    });
  }

  async listarCriancas() { return (await (await this.db).getAll('criancas')).sort((a, b) => a.criadoEm - b.criadoEm); }
  async obterCrianca(id: string) { return (await this.db).get('criancas', id); }
  async salvarCrianca(c: Crianca) { await (await this.db).put('criancas', c); }
  async removerCrianca(id: string) {
    const db = await this.db;
    const tx = db.transaction(['criancas', 'progressos', 'eventos', 'demonstracoes'], 'readwrite');
    await tx.objectStore('criancas').delete(id);
    await tx.objectStore('progressos').delete(id);
    for (const k of await tx.objectStore('eventos').index('porCrianca').getAllKeys(id)) await tx.objectStore('eventos').delete(k);
    for (const k of await tx.objectStore('demonstracoes').index('porCrianca').getAllKeys(id)) await tx.objectStore('demonstracoes').delete(k);
    await tx.done;
  }

  async obterProgresso(criancaId: string) { return (await this.db).get('progressos', criancaId); }
  async salvarProgresso(p: Progresso) { await (await this.db).put('progressos', p); }

  async registrarEvento(e: Evento) { await (await this.db).put('eventos', e); }
  async listarEventos(criancaId: string) { return (await (await this.db).getAllFromIndex('eventos', 'porCrianca', criancaId)).sort((a, b) => a.em - b.em); }

  async salvarDemonstracao(d: Demonstracao) { await (await this.db).put('demonstracoes', d); }
  async listarDemonstracoes(criancaId?: string) {
    const db = await this.db;
    return criancaId ? db.getAllFromIndex('demonstracoes', 'porCrianca', criancaId) : db.getAll('demonstracoes');
  }
  async responderDemonstracao(id: string, status: StatusDemonstracao, agora: number) {
    const db = await this.db;
    const d = await db.get('demonstracoes', id);
    if (!d) return undefined;
    const novo = { ...d, status, respondidaEm: agora, vista: false };
    await db.put('demonstracoes', novo);
    return novo;
  }

  async salvarAudio(id: string, blob: Blob, agora: number) { await (await this.db).put('audios', { id, blob, em: agora }); }
  async obterAudio(id: string) { return (await (await this.db).get('audios', id))?.blob; }
  async apagarAudio(id: string) { await (await this.db).delete('audios', id); }
  async apagarAudiosAntigos(dias: number, agora: number) {
    const db = await this.db;
    let n = 0;
    for (const a of await db.getAll('audios')) {
      if (agora - a.em > dias * 86400_000) { await db.delete('audios', a.id); n++; }
    }
    return n;
  }

  async obterConfig() { return (await (await this.db).get('config', 'config'))?.valor ?? {}; }
  async salvarConfig(c: Partial<ConfigPlataforma>) { await (await this.db).put('config', { id: 'config', valor: c }); }

  async exportarTudo() {
    const db = await this.db;
    return {
      exportadoEm: new Date().toISOString(),
      criancas: await db.getAll('criancas'),
      progressos: await db.getAll('progressos'),
      eventos: await db.getAll('eventos'),
      demonstracoes: (await db.getAll('demonstracoes')).map((d) => ({ ...d, audioId: d.audioId ? '(áudio fica só no aparelho)' : undefined })),
      config: await this.obterConfig()
    };
  }

  async apagarTudo() {
    const db = await this.db;
    for (const s of ['criancas', 'progressos', 'eventos', 'demonstracoes', 'audios', 'config'] as const) await db.clear(s);
  }
}
