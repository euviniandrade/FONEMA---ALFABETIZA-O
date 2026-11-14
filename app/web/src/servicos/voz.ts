/**
 * Serviço de VOZ (D011, D013, D029 §5):
 *  - Na fala dos personagens só existem DUAS vozes: "Sofia — FONEMA" e "Tales — FONEMA", pré-geradas
 *    (public/audio/falas/manifesto.json, texto → arquivo). O nome da criança é gerado UMA vez e encaixado.
 *  - Nenhuma voz do navegador (speechSynthesis) e nenhuma mudança de tom ou de velocidade: todo clipe toca em 1×,
 *    do jeito que foi gravado. Falas de outros personagens (Bolota, Dona Cida…) são narradas pela dupla.
 *  - Som REAL das letras (fonemas): clipes próprios em public/audio/sons (ou gravados pelo adulto no Estúdio de sons),
 *    tocados por servicos/sons-letras.ts. É a única voz diferente da dupla, autorizada só para o som da letra (D029 §2).
 */
import type { Personagem } from '@fonema/conteudo';
import { modoTeste } from './ambiente.ts';
import { fonemaDoTexto, fonemasDaSequencia, sonsLetras } from './sons-letras.ts';

/** `rate` e `pitchExtra` são ignorados (ficaram só para não quebrar chamadas antigas): a voz nunca é esticada. */
export interface OpcoesFala { quem?: Personagem; rate?: number; pitchExtra?: number }

export interface ProvedorVoz {
  falar(texto: string, o?: OpcoesFala): Promise<void>;
  parar(): void;
}

/**
 * Reserva SILENCIOSA: quando não há clipe oficial, ninguém fala (o texto fica no balão) e a tela segue no ritmo
 * da leitura. Substitui a antiga voz do aparelho (speechSynthesis), que não é mais usada em lugar nenhum.
 */
export class ProvedorSilencioso implements ProvedorVoz {
  falar(texto: string): Promise<void> {
    const limpo = texto.replace(/[/*_]/g, '').trim();
    if (!limpo) return Promise.resolve();
    return new Promise((r) => setTimeout(r, modoTeste() ? 20 : Math.min(2500, 400 + limpo.length * 35)));
  }
  parar() { /* nada tocando */ }
}

/** Falas sem áudio oficial nesta sessão (para o relatório do gerador; veja window.__fonemaFaltando). */
export const faltando = new Set<string>();
if (typeof window !== 'undefined') (window as any).__fonemaFaltando = faltando;

/**
 * Qual das DUAS vozes diz a fala de cada personagem (D029 §5). Não há mais tom nem ritmo por personagem:
 * o conteúdo novo já atribui as falas à Sofia ou ao Tales; este mapa só cobre dados antigos.
 */
export const VOZ_DO_PERSONAGEM: Record<string, 'sofia' | 'tales'> = {
  sofia: 'sofia', tales: 'tales', bolota: 'tales', davi: 'tales', 'dona-cida': 'sofia', pescadora: 'sofia',
  'guarda-parque': 'tales', 'zum-zum': 'tales'
};
const vozDe = (quem: string | undefined): 'sofia' | 'tales' => VOZ_DO_PERSONAGEM[quem ?? 'sofia'] ?? 'sofia';

/** Chave de um trecho de fala (sem pontuação solta no começo). Mesma regra do gerador (scripts/gerar-vozes.mjs). */
export function chaveTrecho(t: string): string {
  return t.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').replace(/(\p{L})\1{2,}/giu, '$1$1$1$1').trim();
}
export function chaveNome(n: string): string {
  return n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Pacote de áudio opcional (publicação em página única): se existir ./audio/pacote.json
 * ({ arquivo, itens: { "audio/falas/x.mp3": [inicio, tamanho] } }), os clipes são lidos de um único
 * arquivo binário e tocados por blob. Sem o pacote, cada clipe é carregado pelo próprio caminho.
 */
let pacote: Promise<{ dados: ArrayBuffer; itens: Record<string, [number, number]> } | null> | null = null;
const blobs = new Map<string, string>();
function carregarPacote() {
  pacote ??= fetch('./audio/pacote.json')
    .then((r) => (r.ok ? r.json() : null))
    .then(async (idx) => {
      if (!idx?.arquivo) return null;
      const dados = await (await fetch(`./audio/${idx.arquivo}`)).arrayBuffer();
      return { dados, itens: idx.itens as Record<string, [number, number]> };
    })
    .catch(() => null);
  return pacote;
}
export async function urlDoAudio(caminho: string): Promise<string> {
  const p = await carregarPacote();
  const chave = caminho.replace(/^\.\//, '');
  const it = p?.itens[chave];
  if (!p || !it) return caminho;
  let u = blobs.get(chave);
  if (!u) { u = URL.createObjectURL(new Blob([p.dados.slice(it[0], it[0] + it[1])], { type: 'audio/mpeg' })); blobs.set(chave, u); }
  return u;
}

/** Um clipe carregado e pronto para tocar inteiro (sem esperar a rede no meio da frase). */
function carregar(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve) => {
    const el = new Audio();
    el.preload = 'auto';
    let feito = false;
    const ok = () => { if (!feito) { feito = true; resolve(el); } };
    el.addEventListener('canplaythrough', ok, { once: true });
    el.addEventListener('error', ok, { once: true });
    setTimeout(ok, 4000); // rede lenta: toca assim mesmo
    el.src = url;
    el.load();
  });
}

/**
 * Aviso para quem anima os personagens (boca falando): no começo de CADA clipe sai o evento de janela
 * 'fonema:fala' { quem, voz, texto, audio (HTMLAudioElement), arquivo ("audio/falas/x.mp3"), inicio (performance.now()),
 * trecho, trechos } e, quando a fala inteira acaba ou é interrompida, 'fonema:fala-fim' { quem }.
 */
function avisar(tipo: 'fonema:fala' | 'fonema:fala-fim', detail: Record<string, unknown>) {
  try { window.dispatchEvent(new CustomEvent(tipo, { detail })); } catch { /* sem janela (teste) */ }
}

/** Fala em andamento menor que isto é deixada terminar (nunca cortar uma sílaba, um som ou o fim de uma frase). */
const DEIXA_TERMINAR_S = 1.0;
/** Ao interromper uma fala longa, o volume desce nesse tempo (sem estalo). */
const FADE_MS = 90;
/** Respiro extra depois do nome da criança, quando a frase continua ("Oi, Mariana! | Eu sou a Sofia."). */
const PAUSA_DEPOIS_DO_NOME_MS = 140;

/**
 * Vozes OFICIAIS pré-geradas (ElevenLabs: "Sofia — FONEMA" e "Tales — FONEMA").
 * A fala é dividida no nome da criança: [trecho] + [clipe do nome] + [trecho]. Se o nome não tem clipe,
 * toca a variante sem o nome (o nome continua escrito na tela). Só cai no speechSynthesis se faltar um trecho.
 *
 * Regras de reprodução (D027 §2, "áudio sem cortes"):
 *  - todos os trechos da fala são CARREGADOS antes de o primeiro tocar; cada um toca até o fim ('ended');
 *  - os clipes já vêm masterizados (silêncio de 80 ms nas pontas, fade, volume igual): a emenda não estala;
 *  - a voz da Sofia e do Tales nunca é esticada (sem playbackRate para "falar devagar"): a fala lenta é gravada lenta;
 *  - uma fala nova não corta o finzinho da anterior: se falta menos de 1 s, espera terminar; senão, baixa o volume e para.
 */
export class ProvedorPreGerado implements ProvedorVoz {
  private falas: Record<string, string> | null = null;
  private nomes: Record<string, string[]> = { sofia: [], tales: [] };
  private arqNomes: Record<string, Record<string, string>> = {};
  private atual: HTMLAudioElement | null = null;
  /** Termina quando a fala anterior acabou de verdade (fim natural do clipe ou fim do fade). */
  private cauda: Promise<void> = Promise.resolve();
  private geracao = 0;
  nome = '';
  pronto: Promise<void>;
  nomesDe(voz: 'sofia' | 'tales'): string[] { return this.nomes[voz] ?? []; }
  constructor(private reserva: ProvedorVoz) {
    this.pronto = Promise.all([
      fetch('./audio/falas/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
      fetch('./audio/nomes/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
    ]).then(([f, n]: any[]) => { this.falas = f; this.nomes = { sofia: n.sofia ?? [], tales: n.tales ?? [] }; this.arqNomes = n.arquivos ?? {}; });
  }
  /** Caminho do clipe do nome (o manifesto diz o arquivo; sem ele, <nome>.mp3). */
  arquivoDoNome(voz: 'sofia' | 'tales', nome: string): string {
    const k = chaveNome(nome);
    return `./audio/nomes/${voz}/${this.arqNomes[voz]?.[k] ?? `${k}.mp3`}`;
  }
  /** Existe clipe para este trecho (sem nome) nesta voz? */
  temTrecho(texto: string, quem: string): boolean {
    return !!this.falas?.[`${vozDe(quem)}|${chaveTrecho(texto)}`];
  }
  /** Lista de arquivos para uma fala, ou null se faltar algum trecho. */
  arquivos(texto: string, quem: string): string[] | null {
    return this.plano(texto, quem)?.map((p) => p.arquivo) ?? null;
  }
  /** Trechos da fala em ordem, com a pausa extra depois de cada um. */
  plano(texto: string, quem: string): { arquivo: string; pausaMs: number }[] | null {
    if (!this.falas) return null;
    const v = { voz: vozDe(quem) };
    const partes = this.nome ? texto.split(this.nome) : [texto];
    const temNome = this.nome && this.nomes[v.voz]?.includes(chaveNome(this.nome));
    const out: { arquivo: string; pausaMs: number }[] = [];
    for (let i = 0; i < partes.length; i++) {
      if (i > 0 && temNome) out.push({ arquivo: this.arquivoDoNome(v.voz, this.nome), pausaMs: chaveTrecho(partes[i]) ? PAUSA_DEPOIS_DO_NOME_MS : 0 });
      const k = chaveTrecho(partes[i]);
      if (!k) continue;
      const arq = this.falas[`${v.voz}|${k}`];
      if (!arq) return null;
      out.push({ arquivo: `./audio/falas/${arq}`, pausaMs: 0 });
    }
    return out.length ? out : null;
  }
  async falar(texto: string, o: OpcoesFala = {}): Promise<void> {
    await this.pronto;
    const quem = o.quem ?? 'sofia';
    const plano = this.plano(texto, quem);
    if (modoTeste()) return this.reserva.falar(texto, o);
    if (!plano) {
      // sem áudio oficial: NUNCA voz do aparelho; o texto fica no balão e a tela segue no ritmo da leitura
      faltando.add(`${vozDe(quem)}|${texto}`);
      return this.reserva.falar(texto, o);
    }
    const g = ++this.geracao;
    // carrega TODOS os trechos antes de começar (e espera o finzinho da fala anterior)
    const [els] = await Promise.all([Promise.all(plano.map(async (p) => carregar(await urlDoAudio(p.arquivo)))), this.cauda]);
    for (let i = 0; i < els.length; i++) {
      if (g !== this.geracao) return;
      const el = els[i];
      const fim = new Promise<void>((resolve) => {
        el.onended = () => resolve();
        el.onerror = () => resolve();
        el.onpause = () => { if (!el.ended) resolve(); };
      });
      this.atual = el;
      this.cauda = fim;
      el.playbackRate = 1; // D029 §5: nunca mudar tom nem velocidade
      avisar('fonema:fala', { quem, voz: vozDe(quem), texto, audio: el, arquivo: plano[i].arquivo.replace(/^\.\//, ''), inicio: performance.now(), trecho: i, trechos: els.length });
      el.play().catch(() => el.onerror?.(new Event('error')));
      await fim;
      if (this.atual === el) this.atual = null;
      if (g !== this.geracao || i === els.length - 1) avisar('fonema:fala-fim', { quem });
      if (plano[i].pausaMs && g === this.geracao) await new Promise((r) => setTimeout(r, plano[i].pausaMs));
    }
  }
  /** Interrompe a fala: o clipe que está quase no fim termina sozinho; o resto some com fade (sem estalo). */
  parar() {
    this.geracao++;
    const el = this.atual;
    this.atual = null;
    if (el && !el.paused && !el.ended) {
      const resta = (el.duration - el.currentTime) / (el.playbackRate || 1);
      if (!(resta <= DEIXA_TERMINAR_S)) {
        const v0 = el.volume;
        const t0 = performance.now();
        const passo = () => {
          const k = (performance.now() - t0) / FADE_MS;
          if (k >= 1 || el.paused) { el.pause(); return; }
          el.volume = v0 * (1 - k) * (1 - k);
          setTimeout(passo, 15);
        };
        passo();
      }
    }
    this.reserva.parar();
  }
  /** Toca um clipe solto (nome no cadastro) até o fim. */
  async tocarArquivo(caminho: string): Promise<void> {
    const g = ++this.geracao;
    const [el] = await Promise.all([urlDoAudio(caminho).then(carregar), this.cauda]);
    if (g !== this.geracao) return;
    const fim = new Promise<void>((resolve) => { el.onended = () => resolve(); el.onerror = () => resolve(); el.onpause = () => { if (!el.ended) resolve(); }; });
    this.atual = el;
    this.cauda = fim;
    const quem = /nomes\/(sofia|tales)\//.exec(caminho)?.[1] ?? 'sofia';
    avisar('fonema:fala', { quem, voz: quem, texto: '', audio: el, arquivo: caminho.replace(/^\.\//, ''), inicio: performance.now(), trecho: 0, trechos: 1 });
    el.play().catch(() => el.onerror?.(new Event('error')));
    await fim;
    if (this.atual === el) this.atual = null;
    avisar('fonema:fala-fim', { quem });
  }
}

/** Coleta (só em teste) as falas realmente ditas, para gerar os áudios oficiais (scripts/gerar-vozes.mjs). */
function coletar(texto: string, quem: Personagem | undefined, nome: string) {
  try {
    if (localStorage.getItem('fonema-coletar') !== '1') return;
    const v = vozDe(quem);
    const t = nome ? texto.split(nome).join('[NOME]') : texto;
    const k = 'fonema-falas';
    const atual = JSON.parse(localStorage.getItem(k) || '[]') as string[];
    const item = `${v}|${t}`;
    if (!atual.includes(item)) { atual.push(item); localStorage.setItem(k, JSON.stringify(atual)); }
  } catch { /* sem armazenamento */ }
}

/** Fachada usada pelas telas: liga/desliga e troca de provedor num lugar só. */
class Voz {
  ligada = true;
  private nav = new ProvedorSilencioso();
  private pre = new ProvedorPreGerado(this.nav);
  private provedor: ProvedorVoz = this.pre;
  /** Nome (na pronúncia escolhida) da criança desta tela, para encaixar o clipe do nome. */
  definirNome(nome: string) { this.pre.nome = nome; }
  private fila: Promise<void> = Promise.resolve();
  configurar(o: { ligada?: boolean; velocidade?: number; provedor?: 'navegador' | 'pre-gerada' }) {
    if (o.ligada !== undefined) this.ligada = o.ligada;
    // `velocidade` e `provedor: 'navegador'` não têm mais efeito (D029 §5): só as vozes oficiais, em 1×
  }
  /** Fala agora (interrompe o que estava falando). */
  falar(texto: string, o?: OpcoesFala): Promise<void> {
    this.parar();
    coletar(texto, o?.quem, this.pre.nome);
    if (!this.ligada) return Promise.resolve();
    this.fila = this.provedor.falar(texto, o);
    return this.fila;
  }
  /** O nome tem clipe gravado nas vozes oficiais? (lista de nomes comuns) */
  async temNome(nome: string): Promise<boolean> {
    await this.pre.pronto;
    return this.pre.nomesDe('sofia').includes(chaveNome(nome)) && this.pre.nomesDe('tales').includes(chaveNome(nome));
  }
  /** Toca o nome na voz OFICIAL da Sofia ou do Tales (cadastro). Devolve false se o nome ainda não tem gravação. */
  async ouvirNome(nome: string, quem: 'sofia' | 'tales'): Promise<boolean> {
    this.parar();
    await this.pre.pronto;
    if (!this.pre.nomesDe(quem).includes(chaveNome(nome))) return false;
    if (!this.ligada || modoTeste()) return true;
    await this.pre.tocarArquivo(this.pre.arquivoDoNome(quem, nome));
    return true;
  }
  /** Todas estas falas curtas (sílabas, sons) têm clipe na voz oficial? Se faltar uma, é melhor não falar nenhuma. */
  temTodas(textos: string[], quem: Personagem = 'sofia'): boolean {
    return textos.every((t) => this.pre.temTrecho(t, quem));
  }
  /** Fala uma sequência de falas, uma depois da outra. */
  async sequencia(falas: { texto: string; quem?: Personagem }[], aoMudar?: (i: number) => void): Promise<void> {
    this.parar();
    for (let i = 0; i < falas.length; i++) {
      aoMudar?.(i);
      coletar(falas[i].texto, falas[i].quem, this.pre.nome);
      if (this.ligada) await this.provedor.falar(falas[i].texto, { quem: falas[i].quem });
      else await new Promise((r) => setTimeout(r, modoTeste() ? 10 : 1400));
    }
  }
  parar() { this.provedor.parar(); }
}

export const voz = new Voz();
