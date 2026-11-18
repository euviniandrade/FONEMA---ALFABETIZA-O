/**
 * EDIÇÕES DO ADMINISTRADOR NESTE APARELHO (gerenciador, fila do dono nº 18; D032: sem servidor).
 *
 * O conteúdo editado (textos, falas, missões, lojinha…) e as figuras/modelos trocados ficam no IndexedDB "fonema-admin"
 * (lojas `edicoes` e `midias`), separados dos dados das crianças. Na abertura do app (main.tsx), as edições PUBLICADAS
 * (vêm com o site: conteudo/src/edicao/publicadas.json) e, por cima, as deste aparelho são aplicadas no conteúdo
 * (camada `CONTEUDO_EDITAVEL`, no lugar): as telas leem o conteúdo como sempre e já veem a versão editada.
 * Figuras e modelos trocados viram endereços blob: e `asset()` (ambiente.ts) devolve o trocado no lugar do original.
 *
 * Histórico: cada lugar editado guarda os valores anteriores ("Desfazer" volta um passo; "Voltar ao original" tira).
 * Nada sai do aparelho sem o administrador gerar o pacote (aba Publicar).
 */
import { CONTEUDO_EDITAVEL, EDICOES_PUBLICADAS, chaveDaEdicao, type Edicao, type RelatorioAplicacao } from '@fonema/conteudo';
import { normalizarCaminhoAsset, trocarAsset } from './ambiente.ts';
import { abrirBancoAdmin } from './substituicoes.ts';

export interface RegistroEdicao extends Edicao {
  chave: string;
  /** Valores anteriores neste mesmo lugar (o mais recente no fim). */
  anteriores?: { valor: unknown; em: number; quem?: string }[];
}
export interface MidiaTrocada {
  /** Caminho dentro de assets/ (ex.: figuras/uva.webp, modelos3d/sofia.glb). */
  caminho: string;
  blob: Blob;
  /** Nome do arquivo que o administrador subiu. */
  nome: string;
  em: number;
  quem?: string;
  largura?: number;
  altura?: number;
}

export interface ArmazemEdicoes {
  edicoes(): Promise<RegistroEdicao[]>;
  salvarEdicao(r: RegistroEdicao): Promise<void>;
  apagarEdicao(chave: string): Promise<void>;
  midias(): Promise<MidiaTrocada[]>;
  salvarMidia(m: MidiaTrocada): Promise<void>;
  apagarMidia(caminho: string): Promise<void>;
}

export class ArmazemEdicoesMemoria implements ArmazemEdicoes {
  private e = new Map<string, RegistroEdicao>();
  private m = new Map<string, MidiaTrocada>();
  async edicoes() { return [...this.e.values()]; }
  async salvarEdicao(r: RegistroEdicao) { this.e.set(r.chave, structuredClone(r)); }
  async apagarEdicao(c: string) { this.e.delete(c); }
  async midias() { return [...this.m.values()]; }
  async salvarMidia(x: MidiaTrocada) { this.m.set(x.caminho, x); }
  async apagarMidia(c: string) { this.m.delete(c); }
}

export class ArmazemEdicoesIndexedDB implements ArmazemEdicoes {
  private db = abrirBancoAdmin();
  async edicoes() { return (await (await this.db).getAll('edicoes')) as RegistroEdicao[]; }
  async salvarEdicao(r: RegistroEdicao) { await (await this.db).put('edicoes', r); }
  async apagarEdicao(c: string) { await (await this.db).delete('edicoes', c); }
  async midias() { return (await (await this.db).getAll('midias')) as MidiaTrocada[]; }
  async salvarMidia(m: MidiaTrocada) { await (await this.db).put('midias', m); }
  async apagarMidia(c: string) { await (await this.db).delete('midias', c); }
}

const ordenar = (l: RegistroEdicao[]) => [...l].sort((a, b) => a.em - b.em);

export class Edicoes {
  private armazem: ArmazemEdicoes | null = null;
  private lista: RegistroEdicao[] = [];
  private midiasMeta = new Map<string, Omit<MidiaTrocada, 'blob'>>();
  private urls = new Map<string, string>();
  private carga: Promise<void> | null = null;
  private ouvintes = new Set<() => void>();
  ultimo: RelatorioAplicacao = { aplicadas: 0, semLugar: [] };

  usar(a: ArmazemEdicoes) { this.armazem = a; this.carga = null; this.lista = []; this.limparMidias(); }
  private padrao(): ArmazemEdicoes | null {
    if (!this.armazem && typeof indexedDB !== 'undefined') this.armazem = new ArmazemEdicoesIndexedDB();
    return this.armazem;
  }
  /** Lê do aparelho e aplica (uma vez; `recarregar` lê de novo). */
  carregar(): Promise<void> {
    this.carga ??= (async () => {
      try {
        const a = this.padrao();
        if (!a) return;
        this.lista = ordenar(await a.edicoes());
        this.limparMidias();
        for (const m of await a.midias()) this.ligarMidia(m);
      } catch { /* sem banco: só o publicado */ }
      this.reaplicar();
    })();
    return this.carga;
  }
  recarregar() { this.carga = null; return this.carregar(); }

  /** As edições deste aparelho (com o histórico de cada lugar). */
  edicoes(): RegistroEdicao[] { return this.lista; }
  /** Edições deste aparelho num item. */
  doItem(colecao: string, item: string) { return this.lista.filter((e) => e.colecao === colecao && e.item === item); }
  /** Há edição deste aparelho neste lugar? */
  noLugar(e: Pick<Edicao, 'colecao' | 'item' | 'tipo' | 'caminho'>) { const k = chaveDaEdicao(e); return this.lista.find((x) => x.chave === k); }

  private reaplicar() {
    this.ultimo = CONTEUDO_EDITAVEL.aplicar([...EDICOES_PUBLICADAS, ...this.lista]);
    this.avisar();
  }

  /** Guarda a edição (substitui a anterior do mesmo lugar, que vai para o histórico) e aplica. */
  async salvar(e: Edicao): Promise<RegistroEdicao> {
    await this.carregar();
    const chave = chaveDaEdicao(e);
    const antes = this.lista.find((x) => x.chave === chave);
    const anteriores = antes ? [...(antes.anteriores ?? []), { valor: antes.valor, em: antes.em, quem: antes.quem }].slice(-20) : [];
    const r: RegistroEdicao = { ...e, chave, anteriores };
    await this.padrao()?.salvarEdicao(r);
    this.lista = ordenar([...this.lista.filter((x) => x.chave !== chave), r]);
    this.reaplicar();
    return r;
  }
  /** Desfaz o último passo neste lugar (volta ao valor anterior; sem anterior, volta ao original). */
  async desfazer(chave: string): Promise<void> {
    await this.carregar();
    const r = this.lista.find((x) => x.chave === chave);
    if (!r) return;
    const ant = r.anteriores?.[r.anteriores.length - 1];
    if (!ant) { await this.voltarAoOriginal(chave); return; }
    const novo: RegistroEdicao = { ...r, valor: ant.valor, em: Date.now(), anteriores: r.anteriores!.slice(0, -1) };
    await this.padrao()?.salvarEdicao(novo);
    this.lista = ordenar([...this.lista.filter((x) => x.chave !== chave), novo]);
    this.reaplicar();
  }
  /** Tira a edição deste lugar: vale o original (ou o publicado). */
  async voltarAoOriginal(chave: string): Promise<void> {
    await this.carregar();
    await this.padrao()?.apagarEdicao(chave);
    this.lista = this.lista.filter((x) => x.chave !== chave);
    this.reaplicar();
  }
  /** Tira todas as edições deste aparelho num item (fase, peça, história…). */
  async voltarItem(colecao: string, item: string): Promise<void> {
    for (const r of this.doItem(colecao, item)) await this.padrao()?.apagarEdicao(r.chave);
    this.lista = this.lista.filter((x) => !(x.colecao === colecao && x.item === item));
    this.reaplicar();
  }

  /** Tira TODAS as edições e figuras deste aparelho (vale só o publicado). */
  async voltarTudo(): Promise<void> {
    await this.carregar();
    for (const r of this.lista) await this.padrao()?.apagarEdicao(r.chave);
    this.lista = [];
    for (const m of [...this.midiasMeta.keys()]) await this.removerMidia(m);
    this.reaplicar();
  }

  /* ---------------------------------------------------------------- figuras e modelos */
  private ligarMidia(m: MidiaTrocada) {
    const c = normalizarCaminhoAsset(m.caminho);
    const velha = this.urls.get(c);
    if (velha) { try { URL.revokeObjectURL(velha); } catch { /* nada */ } }
    const u = URL.createObjectURL(m.blob);
    this.urls.set(c, u);
    const meta: Omit<MidiaTrocada, 'blob'> & { blob?: Blob } = { ...m };
    delete meta.blob;
    this.midiasMeta.set(c, meta);
    trocarAsset(c, u);
  }
  private limparMidias() {
    for (const [c, u] of this.urls) { try { URL.revokeObjectURL(u); } catch { /* nada */ } trocarAsset(c, null); }
    this.urls.clear();
    this.midiasMeta.clear();
  }
  midias(): Omit<MidiaTrocada, 'blob'>[] { return [...this.midiasMeta.values()].sort((a, b) => a.caminho.localeCompare(b.caminho)); }
  midiaTrocada(caminho: string) { return this.midiasMeta.get(normalizarCaminhoAsset(caminho)); }
  async blobDaMidia(caminho: string): Promise<Blob | undefined> {
    return (await this.padrao()?.midias())?.find((m) => normalizarCaminhoAsset(m.caminho) === normalizarCaminhoAsset(caminho))?.blob;
  }
  async listarMidias(): Promise<MidiaTrocada[]> { await this.carregar(); return (await this.padrao()?.midias()) ?? []; }
  async salvarMidia(m: MidiaTrocada): Promise<void> {
    await this.carregar();
    if (!m.blob?.size) throw new Error('Arquivo vazio.');
    const caminho = normalizarCaminhoAsset(m.caminho);
    if (!caminhoDeMidiaValido(caminho)) throw new Error(`Caminho não permitido: ${caminho}`);
    const a = this.padrao();
    if (!a) throw new Error('Este navegador não guarda arquivos (sem IndexedDB).');
    const r = { ...m, caminho };
    await a.salvarMidia(r);
    this.ligarMidia(r);
    this.avisar();
  }
  async removerMidia(caminho: string): Promise<void> {
    const c = normalizarCaminhoAsset(caminho);
    await this.padrao()?.apagarMidia(c);
    const u = this.urls.get(c);
    if (u) { try { URL.revokeObjectURL(u); } catch { /* nada */ } }
    this.urls.delete(c);
    this.midiasMeta.delete(c);
    trocarAsset(c, null);
    this.avisar();
  }

  ouvir(fn: () => void): () => void { this.ouvintes.add(fn); return () => { this.ouvintes.delete(fn); }; }
  private avisar() { for (const f of this.ouvintes) { try { f(); } catch { /* ouvinte com defeito */ } } }
}

/** Só figuras e modelos dentro de assets/ (nada de sair da pasta). */
export function caminhoDeMidiaValido(c: string): boolean {
  return /^[a-z0-9][a-z0-9/_.-]*\.(webp|png|jpg|jpeg|glb|svg)$/i.test(c) && !c.includes('..') && !c.includes('//');
}

export const edicoes = new Edicoes();

/** Abre o app só depois de aplicar as edições (com limite: aparelho lento não fica preso na tela branca). */
export function iniciarEdicoes(limiteMs = 1500): Promise<void> {
  return Promise.race([edicoes.carregar(), new Promise<void>((r) => setTimeout(r, limiteMs))]);
}
