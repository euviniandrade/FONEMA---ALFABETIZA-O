/**
 * CAMADA DE CONTEÚDO EDITÁVEL (pedido do dono de 18/11, fila nº 18: "editar tudo").
 *
 * O conteúdo continua sendo os DADOS do repositório (fases, falas, lojinha, histórias…). O administrador grava EDIÇÕES
 * (sobreposições) por cima dele, e esta camada as aplica NOS PRÓPRIOS OBJETOS do conteúdo, no lugar: as telas e o motor
 * continuam lendo `FASES`, `FASE_POR_ID`, `ITENS_LOJA`… como sempre, e já veem o conteúdo editado. Nada é apagado:
 *  - cada item tocado tem o ORIGINAL guardado (cópia) na primeira vez; reaplicar = restaurar o original e aplicar de novo
 *    (idempotente; "voltar ao original" = tirar a edição e reaplicar);
 *  - os IDs não mudam (fase, cena), então o progresso salvo continua valendo; uma fase nova ganha um ID novo;
 *  - "desligar uma cena" só a tira da lista em uso (a cena continua no repositório e volta quando religada).
 *
 * Caminho de uma edição: lista de chaves a partir do item. Número = posição numa lista; texto que começa com "@" = o
 * elemento da lista com aquele `id` (ex.: ['cenas', '@TF-07-C3', 'atividade', 'itens', 0, 'mostrar']).
 *
 * Arquivo puro (sem DOM): usado pelo app (servicos/edicoes.ts), pelos testes e pelo importador do pacote.
 */

export type Caminho = (string | number)[];

export type TipoEdicao =
  /** Troca o valor no caminho (caminho vazio = o item inteiro). */
  | 'definir'
  /** Item novo (ex.: fase criada a partir de um modelo, palavra nova no banco). `valor` é o item inteiro. */
  | 'novo'
  /** Fase: nova ordem das cenas (`valor`: ids das cenas). */
  | 'ordem-cenas'
  /** Fase: cenas desligadas (`valor`: ids das cenas). */
  | 'desligar-cenas';

export interface Edicao {
  colecao: string;
  /** Id do item na coleção (fase 'TF-07', item da lojinha 'caderno', palavra do banco 'pato'…). */
  item: string;
  tipo: TipoEdicao;
  caminho?: Caminho;
  valor?: unknown;
  /** Item novo: entra logo depois deste item (fases: na jornada). Ausente = no fim. */
  depoisDe?: string;
  /** Item novo copiado deste item (fase nova a partir de um modelo). */
  modelo?: string;
  /** Fase nova fora da jornada (rascunho: só abre pelo administrador). */
  rascunho?: boolean;
  /** Quando foi feita (ms). */
  em: number;
  /** Quem editou e uma frase sobre a mudança (para o histórico). */
  quem?: string;
  nota?: string;
  /** Ids de áudio que ficaram desatualizados com esta edição (fala:sofia|…), para regravar na aba Áudios. */
  audios?: string[];
}

/** Chave que identifica O LUGAR editado: uma edição nova no mesmo lugar substitui a anterior (que vai para o histórico). */
export function chaveDaEdicao(e: Pick<Edicao, 'colecao' | 'item' | 'tipo' | 'caminho'>): string {
  return `${e.colecao}|${e.item}|${e.tipo}|${JSON.stringify(e.caminho ?? [])}`;
}

/* ------------------------------------------------------------------ coleções */

export interface Colecao {
  id: string;
  /** Nome para gente ("Missões", "Lojinha"). */
  rotulo: string;
  /** Ids dos itens, na ordem atual. */
  ids(): string[];
  /** O item atual (o objeto do conteúdo; editado no lugar). */
  obter(id: string): unknown;
  /** Troca o item inteiro (itens que não são objeto, como textos soltos de um registro). */
  substituir?(id: string, valor: unknown): void;
  /** Põe um item novo (edição `novo`). */
  inserir?(id: string, valor: unknown, e: Edicao): void;
  /** Tira um item novo (quando a edição `novo` sai). */
  retirar?(id: string): void;
  /** Depois de aplicar as edições de um item (ex.: fase: ordem e cenas desligadas). */
  depoisDoItem?(id: string, item: unknown, edicoes: Edicao[]): void;
  /** Depois de aplicar tudo (refazer listas derivadas). */
  depoisDeTudo?(): void;
}

const ehObjeto = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
export const copiar = <T>(x: T): T => (x === undefined ? x : (JSON.parse(JSON.stringify(x)) as T));

/** Restaura `atual` para ficar igual a `modelo`, NO LUGAR (quem guarda referência ao objeto continua vendo-o). */
export function restaurarNoLugar(atual: unknown, modelo: unknown): boolean {
  if (Array.isArray(atual) && Array.isArray(modelo)) {
    atual.length = 0;
    for (const x of copiar(modelo)) atual.push(x);
    return true;
  }
  if (ehObjeto(atual) && ehObjeto(modelo)) {
    for (const k of Object.keys(atual)) delete atual[k];
    Object.assign(atual, copiar(modelo));
    return true;
  }
  return false;
}

/** Acha o filho de `pai` pelo segmento do caminho ('@id' = elemento da lista com aquele id). */
function filho(pai: unknown, seg: string | number): { dono: Record<string | number, unknown>; chave: string | number } | null {
  if (typeof seg === 'string' && seg.startsWith('@')) {
    if (!Array.isArray(pai)) return null;
    const i = pai.findIndex((x) => ehObjeto(x) && x.id === seg.slice(1));
    return i < 0 ? null : { dono: pai as unknown as Record<number, unknown>, chave: i };
  }
  if (Array.isArray(pai) && typeof seg === 'number') return seg >= 0 && seg <= pai.length ? { dono: pai as unknown as Record<number, unknown>, chave: seg } : null;
  if (ehObjeto(pai) && typeof seg === 'string') return { dono: pai, chave: seg };
  return null;
}

/** Lê o valor no caminho (undefined se o caminho não existe). */
export function lerCaminho(raiz: unknown, caminho: Caminho): unknown {
  let x = raiz;
  for (const seg of caminho) {
    const f = filho(x, seg);
    if (!f) return undefined;
    x = f.dono[f.chave];
  }
  return x;
}

/** Grava o valor no caminho. Falha (devolve false) se o caminho não existe mais no conteúdo. */
export function gravarCaminho(raiz: unknown, caminho: Caminho, valor: unknown): boolean {
  if (!caminho.length) return false;
  let x = raiz;
  for (const seg of caminho.slice(0, -1)) {
    const f = filho(x, seg);
    if (!f) return false;
    x = f.dono[f.chave];
  }
  const f = filho(x, caminho[caminho.length - 1]);
  if (!f) return false;
  if (valor === undefined) {
    if (Array.isArray(f.dono)) return false;
    delete f.dono[f.chave];
  } else f.dono[f.chave] = copiar(valor);
  return true;
}

/* ------------------------------------------------------------------ aplicar */

export interface RelatorioAplicacao {
  aplicadas: number;
  /** Edições que não acharam mais o lugar (o conteúdo do repositório mudou): ficam guardadas, mas sem efeito. */
  semLugar: { edicao: Edicao; motivo: string }[];
}

export class Sobreposicao {
  private colecoes = new Map<string, Colecao>();
  /** Originais dos itens tocados: `colecao|item` → cópia (undefined = item que não existia: foi criado por edição). */
  private originais = new Map<string, { existia: boolean; copia: unknown }>();
  private atuais: Edicao[] = [];

  constructor(colecoes: Colecao[] = []) { for (const c of colecoes) this.registrar(c); }
  registrar(c: Colecao) { this.colecoes.set(c.id, c); }
  colecao(id: string) { return this.colecoes.get(id); }
  listaDeColecoes() { return [...this.colecoes.values()]; }
  /** As edições em vigor (a última aplicação). */
  edicoes() { return this.atuais; }

  /** O item como está NO REPOSITÓRIO (sem nenhuma edição). */
  original(colecao: string, item: string): unknown {
    const o = this.originais.get(`${colecao}|${item}`);
    if (o) return o.existia ? copiar(o.copia) : undefined;
    return copiar(this.colecoes.get(colecao)?.obter(item));
  }
  /** O item existe no repositório (não foi criado por edição)? */
  existeNoRepositorio(colecao: string, item: string): boolean {
    const o = this.originais.get(`${colecao}|${item}`);
    if (o) return o.existia;
    return this.colecoes.get(colecao)?.obter(item) !== undefined;
  }

  /**
   * Aplica a lista INTEIRA de edições (as publicadas e as deste aparelho, nesta ordem: a última vale). Antes, tudo o que
   * foi tocado na aplicação anterior volta ao original. Chamar de novo com outra lista é seguro.
   */
  aplicar(edicoes: Edicao[]): RelatorioAplicacao {
    this.desfazerTudo();
    const semLugar: RelatorioAplicacao['semLugar'] = [];
    let aplicadas = 0;
    // agrupa por item, na ordem em que aparecem; a última edição de um mesmo lugar vale
    const porLugar = new Map<string, Edicao>();
    for (const e of edicoes) porLugar.set(chaveDaEdicao(e), e);
    const validas = [...porLugar.values()];
    const porItem = new Map<string, Edicao[]>();
    for (const e of validas) {
      const k = `${e.colecao}|${e.item}`;
      if (!porItem.has(k)) porItem.set(k, []);
      porItem.get(k)!.push(e);
    }
    const tocadas = new Set<Colecao>();
    // primeiro os itens novos (uma fase nova pode ser editada depois), depois os outros
    const ordem = [...porItem.entries()].sort(([, a], [, b]) => Number(b.some((x) => x.tipo === 'novo')) - Number(a.some((x) => x.tipo === 'novo')));
    for (const [k, lista] of ordem) {
      const e0 = lista[0];
      const col = this.colecoes.get(e0.colecao);
      if (!col) { for (const e of lista) semLugar.push({ edicao: e, motivo: `coleção desconhecida: ${e0.colecao}` }); continue; }
      tocadas.add(col);
      const novo = lista.find((e) => e.tipo === 'novo');
      const existia = col.obter(e0.item) !== undefined;
      if (novo) {
        if (existia) { semLugar.push({ edicao: novo, motivo: `já existe um item com o id ${novo.item}` }); }
        else if (!col.inserir) { semLugar.push({ edicao: novo, motivo: 'esta coleção não aceita itens novos' }); }
        else {
          this.originais.set(k, { existia: false, copia: undefined });
          col.inserir(novo.item, copiar(novo.valor), novo);
          aplicadas++;
        }
      }
      const item = col.obter(e0.item);
      if (item === undefined) {
        for (const e of lista) if (e.tipo !== 'novo') semLugar.push({ edicao: e, motivo: `o item ${e.item} não existe mais` });
        continue;
      }
      if (!this.originais.has(k)) {
        this.originais.set(k, { existia: true, copia: copiar(item) });
        // separa o item dos objetos que ele divide com outros itens (falas reaproveitadas): edita só este
        restaurarNoLugar(item, copiar(item));
      }
      for (const e of lista) {
        if (e.tipo !== 'definir') continue;
        const cam = e.caminho ?? [];
        let ok: boolean;
        if (!cam.length) {
          ok = restaurarNoLugar(col.obter(e.item), e.valor);
          if (!ok && col.substituir) { col.substituir(e.item, copiar(e.valor)); ok = true; }
        } else ok = gravarCaminho(col.obter(e.item), cam, e.valor);
        if (ok) aplicadas++;
        else semLugar.push({ edicao: e, motivo: `o lugar ${cam.join(' › ') || '(item)'} não existe mais em ${e.item}` });
      }
      const extras = lista.filter((e) => e.tipo === 'ordem-cenas' || e.tipo === 'desligar-cenas');
      if (col.depoisDoItem) col.depoisDoItem(e0.item, col.obter(e0.item), lista);
      aplicadas += extras.length;
    }
    for (const c of tocadas) c.depoisDeTudo?.();
    this.atuais = validas;
    return { aplicadas, semLugar };
  }

  /** Tudo volta ao repositório (sem nenhuma edição). */
  desfazerTudo() {
    const tocadas = new Set<Colecao>();
    for (const [k, o] of this.originais) {
      const i = k.indexOf('|');
      const col = this.colecoes.get(k.slice(0, i));
      const id = k.slice(i + 1);
      if (!col) continue;
      tocadas.add(col);
      if (!o.existia) { col.retirar?.(id); continue; }
      const atual = col.obter(id);
      if (!restaurarNoLugar(atual, o.copia)) col.substituir?.(id, copiar(o.copia));
    }
    this.originais.clear();
    this.atuais = [];
    for (const c of tocadas) c.depoisDeTudo?.();
  }
}

/* ------------------------------------------------------------------ ajudantes para montar coleções */

/** Coleção sobre uma lista de objetos com `id` (e índices `id → objeto` que precisam acompanhar). */
export function colecaoLista<T extends { id: string }>(id: string, rotulo: string, lista: T[], indices: Record<string, T>[] = [], extra: Partial<Colecao> = {}): Colecao {
  return {
    id, rotulo,
    ids: () => lista.map((x) => x.id),
    obter: (k) => lista.find((x) => x.id === k),
    inserir: (k, valor, e) => {
      const obj = { ...(valor as T), id: k };
      const pos = e.depoisDe ? lista.findIndex((x) => x.id === e.depoisDe) : -1;
      if (pos >= 0) lista.splice(pos + 1, 0, obj); else lista.push(obj);
      for (const ix of indices) ix[k] = obj;
    },
    retirar: (k) => {
      const i = lista.findIndex((x) => x.id === k);
      if (i >= 0) lista.splice(i, 1);
      for (const ix of indices) delete ix[k];
    },
    ...extra
  };
}

/** Coleção sobre um registro `chave → valor` (falas por chave, textos de tela, banco de palavras…). */
export function colecaoRegistro(id: string, rotulo: string, reg: Record<string, unknown>, extra: Partial<Colecao> = {}): Colecao {
  return {
    id, rotulo,
    ids: () => Object.keys(reg),
    obter: (k) => (Object.prototype.hasOwnProperty.call(reg, k) ? reg[k] : undefined),
    substituir: (k, v) => { reg[k] = v; },
    inserir: (k, v) => { reg[k] = v; },
    retirar: (k) => { delete reg[k]; },
    ...extra
  };
}

/** Fase: aplica a ordem das cenas e tira as desligadas (as cenas continuam no original). */
export function ordenarEDesligarCenas(fase: { cenas: { id: string }[] }, edicoes: Edicao[]) {
  const ordem = edicoes.find((e) => e.tipo === 'ordem-cenas')?.valor as string[] | undefined;
  const desligadas = new Set((edicoes.find((e) => e.tipo === 'desligar-cenas')?.valor as string[] | undefined) ?? []);
  let cenas = [...fase.cenas];
  if (ordem?.length) {
    const pos = (id: string) => { const i = ordem.indexOf(id); return i < 0 ? ordem.length + cenas.findIndex((c) => c.id === id) : i; };
    cenas.sort((a, b) => pos(a.id) - pos(b.id));
  }
  if (desligadas.size) cenas = cenas.filter((c) => !desligadas.has(c.id));
  fase.cenas.length = 0;
  fase.cenas.push(...cenas);
}
