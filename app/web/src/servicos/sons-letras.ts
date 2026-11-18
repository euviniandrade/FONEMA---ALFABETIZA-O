/**
 * SOM REAL DAS LETRAS (D029 §2): o fonema puro ("mmm", "sss", "p, p, p"), como a professora faz na alfabetização fônica.
 *
 * De onde vem o som de cada fonema, por ordem de prioridade:
 *  0. áudio trocado pelo ADMINISTRADOR neste aparelho (Área do administrador › Áudios; servicos/substituicoes.ts,
 *     id `som:<fonema>`): é o "subir um áudio que entra no lugar certo" da D032;
 *  1. gravação feita pelo ADULTO no Estúdio de sons (Área do Professor/Família), guardada no aparelho (IndexedDB,
 *     id `som-letra-<fonema>`): é a rota garantida para o som "igual ao da escola";
 *  2. clipe publicado em public/audio/sons (mapa.json: fonema → arquivo), só com sons que passaram na verificação;
 *  3. nada: a tela usa a fala antiga da dupla ("M, de macaco.").
 *
 * É a única voz do app que não é a da Sofia nem a do Tales, e só diz o som da letra.
 * Evento de janela 'fonema:som' { fonema, origem, audio } no começo de cada som e 'fonema:som-fim' { fonema } no fim
 * (o Espelho do Som pode usar para mexer a boca).
 */
import { modoTeste } from './ambiente.ts';
import { tocarAteOFim } from './midia.ts';
import { interromper, ocupar, tocandoDoElemento, vez, type MotivoParar } from './canal-audio.ts';
import { anotarTocado, idSom, substituicoes } from './substituicoes.ts';

export interface SomPublicado {
  arquivo: string;
  /** Só 'aprovado' e 'duvidoso' são publicados; reprovados ficam fora do mapa. */
  estado: 'aprovado' | 'duvidoso';
  /** 'voz humana' quando veio de um pacote de áudios do administrador (scripts/importar-pacote-audios.ts). */
  origem?: string;
  tipo: 'vogal' | 'continuo' | 'explosivo';
  ipa: string;
  duracaoMs: number;
}
export interface MapaSons {
  versao: number;
  fonemas: Record<string, SomPublicado>;
  /** Letra (ou dígrafo) → fonemas, o principal primeiro. */
  letras: Record<string, string[]>;
}

/** Lista do Estúdio de sons: letras A–Z + dígrafos, com o fonema que cada linha grava. */
export const SONS_DO_ESTUDIO: { fonema: string; rotulo: string; exemplo: string; como: string }[] = [
  { fonema: 'a', rotulo: 'A', exemplo: 'abelha', como: 'aaa (boca bem aberta)' },
  { fonema: 'b', rotulo: 'B', exemplo: 'bola', como: 'b, b, b (curto, sem dizer "bê")' },
  { fonema: 'k', rotulo: 'C · K · Q', exemplo: 'casa', como: 'k, k, k (curto, no fundo da boca)' },
  { fonema: 'd', rotulo: 'D', exemplo: 'dado', como: 'd, d, d (curto)' },
  { fonema: 'e', rotulo: 'E (ê)', exemplo: 'elefante', como: 'êêê' },
  { fonema: 'E', rotulo: 'E (é)', exemplo: 'pé', como: 'ééé' },
  { fonema: 'f', rotulo: 'F', exemplo: 'foca', como: 'ffff (só o ventinho)' },
  { fonema: 'g', rotulo: 'G', exemplo: 'gato', como: 'g, g, g (curto, na garganta)' },
  { fonema: 'i', rotulo: 'I · Y', exemplo: 'ilha', como: 'iii' },
  { fonema: 'j', rotulo: 'J · G de gelo', exemplo: 'janela', como: 'jjjj (contínuo, com voz)' },
  { fonema: 'l', rotulo: 'L', exemplo: 'lua', como: 'lll (ponta da língua para cima)' },
  { fonema: 'm', rotulo: 'M', exemplo: 'macaco', como: 'mmm (boca fechada)' },
  { fonema: 'n', rotulo: 'N', exemplo: 'navio', como: 'nnn (língua atrás dos dentes)' },
  { fonema: 'o', rotulo: 'O (ô)', exemplo: 'ovo', como: 'ôôô' },
  { fonema: 'O', rotulo: 'O (ó)', exemplo: 'vovó', como: 'óóó' },
  { fonema: 'p', rotulo: 'P', exemplo: 'pato', como: 'p, p, p (estouro sem voz)' },
  { fonema: 'rr', rotulo: 'R forte · RR', exemplo: 'rato', como: 'rrrr (do fundo da garganta)' },
  { fonema: 'r', rotulo: 'R fraco', exemplo: 'arara', como: 'uma batidinha da língua' },
  { fonema: 's', rotulo: 'S · SS · Ç', exemplo: 'sapo', como: 'ssss (só ar)' },
  { fonema: 't', rotulo: 'T', exemplo: 'tatu', como: 't, t, t (curto)' },
  { fonema: 'u', rotulo: 'U · W de kiwi', exemplo: 'uva', como: 'uuu' },
  { fonema: 'v', rotulo: 'V · W de Wagner', exemplo: 'vaca', como: 'vvvv (com voz)' },
  { fonema: 'x', rotulo: 'X · CH', exemplo: 'xícara', como: 'xxxx (chiado)' },
  { fonema: 'z', rotulo: 'Z · S de casa', exemplo: 'zebra', como: 'zzzz (com voz)' },
  { fonema: 'lh', rotulo: 'LH', exemplo: 'folha', como: 'lh (língua no céu da boca)' },
  { fonema: 'nh', rotulo: 'NH', exemplo: 'ninho', como: 'nh (pelo nariz)' },
  { fonema: 'a~', rotulo: 'Ã · AN', exemplo: 'maçã', como: 'ããã (pelo nariz)' }
];
export const FONEMAS_DO_ESTUDIO = SONS_DO_ESTUDIO.map((s) => s.fonema);

/** Id da gravação do adulto no repositório de áudios (não expira: veja RepositorioIndexedDB.apagarAudiosAntigos). */
export const idDaGravacao = (fonema: string) => `som-letra-${fonema}`;

const POR_LETRA: Record<string, string> = {
  a: 'a', 'ã': 'a~', 'á': 'a', 'é': 'E', 'ê': 'e', e: 'e', i: 'i', 'í': 'i', 'ó': 'O', 'ô': 'o', o: 'o', u: 'u', 'ú': 'u',
  m: 'm', n: 'n', f: 'f', v: 'v', s: 's', z: 'z', x: 'x', j: 'j', l: 'l', r: 'rr'
};

/** "mmm", "/ssss/", "Aaaaa." → fonema (uma letra repetida 3+ vezes); qualquer outra coisa → null. */
export function fonemaDoTexto(texto: string): string | null {
  const t = texto.replace(/[^\p{L}]/gu, '').toLowerCase();
  if (t.length < 3 || ![...t].every((ch) => ch === t[0])) return null;
  return POR_LETRA[t[0]] ?? null;
}
/** "sss… ooo… lll" → ['s', 'o', 'l']; um som só → [fonema]; se algum pedaço não é som isolado → null. */
export function fonemasDaSequencia(texto: string): string[] | null {
  const partes = texto.split(/[\s…,.!?;:/-]+/).filter(Boolean);
  if (!partes.length || partes.length > 6) return null;
  const fs = partes.map(fonemaDoTexto);
  return fs.every(Boolean) ? (fs as string[]) : null;
}

interface FonteGravacoes { obterAudio(id: string): Promise<Blob | undefined> }

function avisar(tipo: string, detail: Record<string, unknown>) {
  try { window.dispatchEvent(new CustomEvent(tipo, { detail })); } catch { /* sem janela (teste) */ }
}

class SonsLetras {
  private mapa: Promise<MapaSons | null> | null = null;
  private fonte: FonteGravacoes | null = null;
  private urls = new Map<string, string | null>();
  private geracao = 0;

  /** Liga o repositório do aparelho (gravações do adulto). Chamado uma vez pelo app. */
  usarGravacoes(fonte: FonteGravacoes) { this.fonte = fonte; this.urls.clear(); }
  /** Depois de gravar, apagar ou importar no Estúdio: esquece o que estava em memória. */
  recarregar(fonema?: string) {
    for (const [k, u] of this.urls) if ((!fonema || k === fonema) && u) { URL.revokeObjectURL(u); }
    if (fonema) this.urls.delete(fonema); else this.urls.clear();
  }
  carregarMapa(): Promise<MapaSons | null> {
    this.mapa ??= fetch('./audio/sons/mapa.json').then((r) => (r.ok ? r.json() : null)).then((m) => (m?.fonemas ? (m as MapaSons) : null)).catch(() => null);
    return this.mapa;
  }
  private async gravado(fonema: string): Promise<string | null> {
    if (this.urls.has(fonema)) return this.urls.get(fonema) ?? null;
    let u: string | null = null;
    try { const b = await this.fonte?.obterAudio(idDaGravacao(fonema)); if (b && b.size > 0) u = URL.createObjectURL(b); } catch { /* sem banco */ }
    this.urls.set(fonema, u);
    return u;
  }
  /** De onde sai o som deste fonema agora. */
  async origem(fonema: string): Promise<{ url: string; origem: 'substituto' | 'gravado' | 'publicado' } | null> {
    const s = await substituicoes.url(idSom(fonema));
    if (s) return { url: s, origem: 'substituto' };
    const g = await this.gravado(fonema);
    if (g) return { url: g, origem: 'gravado' };
    const p = (await this.carregarMapa())?.fonemas[fonema];
    return p ? { url: `./audio/sons/${p.arquivo}`, origem: 'publicado' } : null;
  }
  async tem(fonema: string): Promise<boolean> { return !!(await this.origem(fonema)); }
  async temTodos(fonemas: string[]): Promise<boolean> {
    for (const f of fonemas) if (!(await this.tem(f))) return false;
    return fonemas.length > 0;
  }
  /** Toca o som de um fonema até o fim. Devolve false se não há som (ou se foi interrompido). */
  async tocar(fonema: string): Promise<boolean> {
    const g = ++this.geracao;
    interromper('novo');
    const o = await this.origem(fonema);
    if (!o || g !== this.geracao) return false;
    anotarTocado({ id: idSom(fonema), origem: o.origem, url: o.url });
    if (modoTeste()) { await new Promise((r) => setTimeout(r, 20)); return true; }
    return this.tocarUrl(o.url, fonema, o.origem, g);
  }
  /** Espera a vez no canal único (servicos/canal-audio.ts) e toca o som até o fim. */
  private async tocarUrl(url: string, fonema: string, origem: string, g: number): Promise<boolean> {
    const el = new Audio(url);
    el.preload = 'auto';
    const liberar = await vez();
    try {
      if (g !== this.geracao) return false;
      avisar('fonema:som', { fonema, origem, audio: el, inicio: performance.now() });
      // a promessa sempre termina: fim, erro, pausa, play recusado, vigia ou tempo-limite (servicos/midia.ts)
      const { fim, soltar } = tocarAteOFim(el);
      const desocupar = ocupar(tocandoDoElemento(el, soltar));
      const ok = await fim;
      desocupar();
      avisar('fonema:som-fim', { fonema });
      return ok && g === this.geracao;
    } finally {
      liberar();
    }
  }
  /** Sons em sequência, com um respiro entre eles ("sss… ooo… lll"). */
  async tocarSequencia(fonemas: string[], pausaMs = 350): Promise<boolean> {
    const g = ++this.geracao;
    interromper('novo');
    for (let i = 0; i < fonemas.length; i++) {
      const o = await this.origem(fonemas[i]);
      if (!o || g !== this.geracao) return false;
      anotarTocado({ id: idSom(fonemas[i]), origem: o.origem, url: o.url });
      if (modoTeste()) { await new Promise((r) => setTimeout(r, 10)); continue; }
      if (!(await this.tocarUrl(o.url, fonemas[i], o.origem, g))) return false;
      if (i < fonemas.length - 1) await new Promise((r) => setTimeout(r, pausaMs));
    }
    return true;
  }
  /** Para os sons: o que está tocando termina limpo (canal único); os próximos da sequência não tocam. */
  parar(motivo: MotivoParar = 'pedido') { this.geracao++; interromper(motivo); }
}

export const sonsLetras = new SonsLetras();
