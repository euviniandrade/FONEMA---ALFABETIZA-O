/**
 * CAMADA DE SUBSTITUIÇÃO DE ÁUDIOS (D032 item 5): o administrador sobe ou grava um áudio no lugar de um áudio da
 * plataforma, e o novo toca EXATAMENTE onde o original tocava — neste aparelho.
 *
 * Cada áudio da plataforma tem um id lógico (não depende do nome do arquivo, que muda a cada masterização):
 *   som:<fonema>              som puro da letra (servicos/sons-letras.ts; mapa public/audio/sons/mapa.json)
 *   fala:<voz>|<trecho>       trecho de fala da Sofia ou do Tales (public/audio/falas/manifesto.json; palavras e
 *                             sílabas ditas pela dupla também são falas). Serve também para fala que ainda não tem clipe.
 *   nome:<voz>|<chave>        nome da criança na voz da dupla (public/audio/nomes/manifesto.json)
 *   arquivo:<caminho>         qualquer outro arquivo de áudio tocado pelo caminho (ex.: assets/audio/dupla-ilha-das-vogais.mp3)
 *
 * Quem consulta: servicos/voz.ts (falas e nomes), servicos/sons-letras.ts (som das letras) e as telas que tocam um
 * arquivo pelo caminho (useUrlDeAudio). O substituto vira um endereço blob: do próprio aparelho: não passa pelo
 * service worker, então o cache da mídia original continua igual (e "Voltar ao original" é só apagar o substituto).
 * Os substitutos ficam no IndexedDB "fonema-admin" (separado dos dados das crianças; "Apagar todos os dados" das
 * Configurações não mexe neles). Nada sai do aparelho sem o administrador gerar o pacote (servicos/pacote-audios.ts).
 */

import { useEffect, useState } from 'react';
import { openDB } from 'idb';

export type TipoId = 'som' | 'fala' | 'nome' | 'arquivo';
export const idSom = (fonema: string) => `som:${fonema}`;
/** `trecho` já na forma de chave (voz.ts › chaveTrecho). */
export const idFala = (voz: string, trecho: string) => `fala:${voz}|${trecho}`;
export const idNome = (voz: string, chave: string) => `nome:${voz}|${chave}`;
export const idArquivo = (caminho: string) => `arquivo:${caminho.replace(/^\.?\//, '').split(/[?#]/)[0]}`;
export function tipoDoId(id: string): TipoId | null {
  const t = id.slice(0, id.indexOf(':'));
  return t === 'som' || t === 'fala' || t === 'nome' || t === 'arquivo' ? t : null;
}

export interface MetaSubstituto {
  id: string;
  /** Nome do arquivo que o administrador subiu (ou "gravação.wav"). */
  nomeArquivo: string;
  origem: 'arquivo' | 'gravacao';
  em: number;
  duracaoMs?: number;
  /** Quem gravou (texto livre, opcional — ex.: "Agatha"). */
  quem?: string;
  /** O texto/legenda do áudio no momento da troca (para o pacote e para o relatório). */
  texto?: string;
  /** O adulto marcou que a pessoa gravada autorizou por escrito o uso da voz. */
  autorizacao?: boolean;
}
export interface RegistroSubstituto extends MetaSubstituto { blob: Blob }

/** Onde os substitutos ficam guardados. No app: IndexedDB; nos testes: memória. */
export interface ArmazemSubstitutos {
  ids(): Promise<string[]>;
  obter(id: string): Promise<RegistroSubstituto | undefined>;
  listar(): Promise<RegistroSubstituto[]>;
  salvar(r: RegistroSubstituto): Promise<void>;
  apagar(id: string): Promise<void>;
}

export class ArmazemMemoria implements ArmazemSubstitutos {
  private m = new Map<string, RegistroSubstituto>();
  async ids() { return [...this.m.keys()]; }
  async obter(id: string) { return this.m.get(id); }
  async listar() { return [...this.m.values()]; }
  async salvar(r: RegistroSubstituto) { this.m.set(r.id, r); }
  async apagar(id: string) { this.m.delete(id); }
}

export const NOME_BANCO_ADMIN = 'fonema-admin';
/** Abre (e cria, na primeira vez) o banco do administrador. Lojas: substitutos (áudios), chaves (acesso, escola), edicoes e midias. */
export async function abrirBancoAdmin() {
  // versão 2 (gerenciador): edições do conteúdo e figuras/modelos trocados (servicos/edicoes.ts)
  return openDB(NOME_BANCO_ADMIN, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('substitutos')) db.createObjectStore('substitutos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('chaves')) db.createObjectStore('chaves', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('edicoes')) db.createObjectStore('edicoes', { keyPath: 'chave' });
      if (!db.objectStoreNames.contains('midias')) db.createObjectStore('midias', { keyPath: 'caminho' });
    }
  });
}

export class ArmazemIndexedDB implements ArmazemSubstitutos {
  private db = abrirBancoAdmin();
  async ids() { return (await (await this.db).getAllKeys('substitutos')).map(String); }
  async obter(id: string) { return (await (await this.db).get('substitutos', id)) as RegistroSubstituto | undefined; }
  async listar() { return (await (await this.db).getAll('substitutos')) as RegistroSubstituto[]; }
  async salvar(r: RegistroSubstituto) { await (await this.db).put('substitutos', r); }
  async apagar(id: string) { await (await this.db).delete('substitutos', id); }
}

/** Registro (para conferência e para o E2E) do que tocou por último: id, de onde veio e o endereço usado. */
export interface Tocado { id: string; origem: 'substituto' | 'original' | 'gravado' | 'publicado'; url?: string; em: number }
export function anotarTocado(t: Omit<Tocado, 'em'>) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { __fonemaAudiosTocados?: Tocado[] };
  const lista = (w.__fonemaAudiosTocados ??= []);
  lista.push({ ...t, em: Date.now() });
  if (lista.length > 100) lista.splice(0, lista.length - 100);
}

export class Substituicoes {
  private armazem: ArmazemSubstitutos | null = null;
  private conjunto = new Set<string>();
  private urls = new Map<string, string>();
  private carga: Promise<void> | null = null;
  private ouvintes = new Set<() => void>();

  /** Troca o armazém (testes, ou um provedor futuro). Esquece o que estava em memória. */
  usar(a: ArmazemSubstitutos) {
    this.armazem = a;
    this.limparUrls();
    this.conjunto.clear();
    this.carga = null;
  }
  private padrao(): ArmazemSubstitutos | null {
    if (!this.armazem && typeof indexedDB !== 'undefined') this.armazem = new ArmazemIndexedDB();
    return this.armazem;
  }
  /** Lê do aparelho quais áudios têm substituto (uma vez; depois `tem` responde na hora). */
  carregar(): Promise<void> {
    this.carga ??= (async () => {
      try { for (const id of (await this.padrao()?.ids()) ?? []) this.conjunto.add(id); } catch { /* sem banco: nada substituído */ }
    })();
    return this.carga;
  }
  /** Este áudio tem substituto neste aparelho? (síncrono: vale depois de `carregar`) */
  tem(id: string): boolean { return this.conjunto.has(id); }
  quantos(): number { return this.conjunto.size; }
  /** Endereço (blob:) do substituto, ou null se o áudio toca o original. */
  async url(id: string): Promise<string | null> {
    await this.carregar();
    if (!this.conjunto.has(id)) return null;
    const pronta = this.urls.get(id);
    if (pronta) return pronta;
    try {
      const r = await this.padrao()?.obter(id);
      if (!r?.blob || !r.blob.size) return null;
      const u = URL.createObjectURL(r.blob);
      this.urls.set(id, u);
      return u;
    } catch { return null; }
  }
  async obter(id: string) { await this.carregar(); return this.padrao()?.obter(id); }
  async listar(): Promise<RegistroSubstituto[]> { await this.carregar(); return (await this.padrao()?.listar()) ?? []; }
  /** Guarda o áudio novo no lugar do original (substitui um substituto anterior do mesmo id). */
  async salvar(r: RegistroSubstituto): Promise<void> {
    if (!tipoDoId(r.id)) throw new Error(`Id de áudio desconhecido: ${r.id}`);
    if (!r.blob || !r.blob.size) throw new Error('Áudio vazio.');
    await this.carregar();
    const a = this.padrao();
    if (!a) throw new Error('Este navegador não guarda arquivos (sem IndexedDB).');
    await a.salvar(r);
    this.esquecerUrl(r.id);
    this.conjunto.add(r.id);
    this.avisar();
  }
  /** "Voltar ao original": apaga o substituto. */
  async remover(id: string): Promise<void> {
    await this.carregar();
    await this.padrao()?.apagar(id);
    this.esquecerUrl(id);
    this.conjunto.delete(id);
    this.avisar();
  }
  /** Avisa quando algum substituto muda (as telas do administrador se atualizam). */
  ouvir(fn: () => void): () => void { this.ouvintes.add(fn); return () => { this.ouvintes.delete(fn); }; }
  private avisar() { for (const f of this.ouvintes) { try { f(); } catch { /* ouvinte com defeito */ } } }
  private esquecerUrl(id: string) {
    const u = this.urls.get(id);
    if (u) { try { URL.revokeObjectURL(u); } catch { /* nada */ } }
    this.urls.delete(id);
  }
  private limparUrls() { for (const id of [...this.urls.keys()]) this.esquecerUrl(id); }
}

export const substituicoes = new Substituicoes();

/**
 * Para telas que tocam um arquivo pelo caminho (<audio src>): devolve o endereço do substituto quando houver,
 * senão o próprio caminho. Uso: `const src = useUrlDeAudio(asset('audio/x.mp3'))`.
 */
export function useUrlDeAudio(caminho: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(caminho);
  useEffect(() => {
    let vivo = true;
    setUrl(caminho);
    if (caminho) void substituicoes.url(idArquivo(caminho)).then((u) => { if (vivo && u) setUrl(u); });
    return () => { vivo = false; };
  }, [caminho]);
  return url;
}
