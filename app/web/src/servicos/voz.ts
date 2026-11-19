/**
 * Serviço de VOZ (D011, D013, D029 §5):
 *  - Na fala dos personagens só existem DUAS vozes: "Sofia — FONEMA" e "Tales — FONEMA", pré-geradas
 *    (public/audio/falas/manifesto.json, texto → arquivo). O nome da criança é gerado UMA vez e encaixado.
 *  - Nenhuma voz do navegador (speechSynthesis) e nenhuma mudança de tom ou de velocidade: todo clipe toca em 1×,
 *    do jeito que foi gravado. Falas de outros personagens (Bolota, Dona Cida…) são narradas pela dupla.
 *  - Som REAL das letras (fonemas): clipes próprios em public/audio/sons (ou gravados pelo adulto no Estúdio de sons),
 *    tocados por servicos/sons-letras.ts. É a única voz diferente da dupla, autorizada só para o som da letra (D029 §2).
 */
import { LEITURAS_EM_SONS, type Personagem } from '@fonema/conteudo';
import { pararSons, tocarSonsEmendados } from '../mecanicas/sons-emendados.ts';
import { modoTeste } from './ambiente.ts';
import { fonemasDaSequencia, sonsLetras } from './sons-letras.ts';
import { tocarAteOFim } from './midia.ts';
import { interromper, ocupar, tocandoDoElemento, vez, type MotivoParar } from './canal-audio.ts';
import { anotarTocado, idFala, idNome, substituicoes } from './substituicoes.ts';
import { nomeSoChamamento, semNome } from '@fonema/motor';
import { ControleNome } from './nome-falado.ts';
export { noMaximo, tocarAteOFim } from './midia.ts';

/** `rate` e `pitchExtra` são ignorados (ficaram só para não quebrar chamadas antigas): a voz nunca é esticada. */
export interface OpcoesFala { quem?: Personagem; rate?: number; pitchExtra?: number }

export interface ProvedorVoz {
  falar(texto: string, o?: OpcoesFala): Promise<void>;
  parar(motivo?: MotivoParar): void;
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
 *  - uma fala nova não corta o finzinho da anterior: se falta menos de 1 s, espera terminar; senão, baixa o volume e para;
 *  - todo clipe passa pelo CANAL ÚNICO (servicos/canal-audio.ts): só começa quando o áudio anterior (fala ou som de letra)
 *    acabou de verdade. Nunca há duas falas/sons ao mesmo tempo.
 */
export class ProvedorPreGerado implements ProvedorVoz {
  private falas: Record<string, string> | null = null;
  private nomes: Record<string, string[]> = { sofia: [], tales: [] };
  private arqNomes: Record<string, Record<string, string>> = {};
  private geracao = 0;
  nome = '';
  /** Fila nº 27 (2): o nome é dito no máximo uma vez, no começo de cada atividade (servicos/nome-falado.ts). */
  controleNome = new ControleNome();
  /** Quantas vezes o clipe do nome tocou nesta página (E2E: window.__fonemaNomeDito). */
  vezesNome = 0;
  pronto: Promise<void>;
  nomesDe(voz: 'sofia' | 'tales'): string[] { return this.nomes[voz] ?? []; }
  constructor(private reserva: ProvedorVoz) {
    this.pronto = Promise.all([
      fetch('./audio/falas/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
      fetch('./audio/nomes/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
      // áudios trocados pelo administrador neste aparelho (servicos/substituicoes.ts)
      substituicoes.carregar()
    ]).then(([f, n]: any[]) => { this.falas = f; this.nomes = { sofia: n.sofia ?? [], tales: n.tales ?? [] }; this.arqNomes = n.arquivos ?? {}; });
  }
  /** Caminho do clipe do nome (o manifesto diz o arquivo; sem ele, <nome>.mp3). */
  arquivoDoNome(voz: 'sofia' | 'tales', nome: string): string {
    const k = chaveNome(nome);
    return `./audio/nomes/${voz}/${this.arqNomes[voz]?.[k] ?? `${k}.mp3`}`;
  }
  /** Existe clipe para este trecho (sem nome) nesta voz? */
  temTrecho(texto: string, quem: string): boolean {
    const k = `${vozDe(quem)}|${chaveTrecho(texto)}`;
    return !!this.falas?.[k] || substituicoes.tem(`fala:${k}`);
  }
  /** O nome tem clipe nesta voz (oficial ou trocado pelo administrador)? */
  temNomeNaVoz(voz: 'sofia' | 'tales', nome: string): boolean {
    const k = chaveNome(nome);
    return !!this.nomes[voz]?.includes(k) || substituicoes.tem(idNome(voz, k));
  }
  /** Lista de arquivos para uma fala, ou null se faltar algum trecho. */
  arquivos(texto: string, quem: string): string[] | null {
    const com = this.plano(texto, quem);
    if (!com) return null;
    // a variante sem o nome também fica no aparelho (é a que toca depois que o nome já foi dito)
    const sem = this.plano(texto, quem, false) ?? [];
    return [...new Set([...com, ...sem].map((p) => p.arquivo))];
  }
  /**
   * Trechos da fala em ordem, com a pausa extra depois de cada um. `id` = id lógico do trecho (substituicoes.ts):
   * se o administrador trocou o áudio neste aparelho, toca o substituto; um trecho sem clipe oficial mas com
   * substituto também toca (arquivo "substituto:<id>").
   */
  plano(texto: string, quem: string, comNome = true): { arquivo: string; pausaMs: number; id: string }[] | null {
    if (!this.falas) return null;
    const v = { voz: vozDe(quem) };
    const partes = this.nome ? texto.split(this.nome) : [texto];
    // o nome como CONTEÚDO ("Mariana!", "[NOME] começa com este som") é sempre dito; só o chamamento é cortado
    if (!comNome && partes.length > 1 && !nomeSoChamamento(partes.join('[NOME]'))) comNome = true;
    if (!comNome && partes.length > 1) {
      // fila nº 27 (2): o nome já foi dito nesta atividade. 1º a variante gravada sem o nome ("Agora é a sua vez!")…
      const k = chaveTrecho(semNome(partes.join('[NOME]')));
      const id = idFala(v.voz, k);
      const arq = this.falas[`${v.voz}|${k}`];
      if (k && (arq || substituicoes.tem(id))) return [{ arquivo: arq ? `./audio/falas/${arq}` : `substituto:${id}`, pausaMs: 0, id }];
      // …senão os mesmos trechos, sem o clipe do nome (abaixo)
    }
    const temNome = comNome && this.nome && this.temNomeNaVoz(v.voz, this.nome);
    const out: { arquivo: string; pausaMs: number; id: string }[] = [];
    for (let i = 0; i < partes.length; i++) {
      if (i > 0 && temNome) out.push({ arquivo: this.arquivoDoNome(v.voz, this.nome), pausaMs: chaveTrecho(partes[i]) ? PAUSA_DEPOIS_DO_NOME_MS : 0, id: idNome(v.voz, chaveNome(this.nome)) });
      const k = chaveTrecho(partes[i]);
      if (!k) continue;
      const id = idFala(v.voz, k);
      const arq = this.falas[`${v.voz}|${k}`];
      if (!arq && !substituicoes.tem(id)) return null;
      out.push({ arquivo: arq ? `./audio/falas/${arq}` : `substituto:${id}`, pausaMs: 0, id });
    }
    return out.length ? out : null;
  }
  /** Endereço de um trecho: o substituto do administrador, se houver; senão o clipe oficial. */
  private async urlDoTrecho(p: { arquivo: string; id: string }): Promise<{ url: string; substituto: boolean }> {
    const s = await substituicoes.url(p.id);
    return s ? { url: s, substituto: true } : { url: await urlDoAudio(p.arquivo), substituto: false };
  }
  async falar(texto: string, o: OpcoesFala = {}): Promise<void> {
    await this.pronto;
    const quem = o.quem ?? 'sofia';
    const plano = this.plano(texto, quem, this.controleNome.podeDizer());
    const ehNome = (p: { id: string }) => p.id.startsWith('nome:');
    if (modoTeste()) {
      for (const p of plano ?? []) {
        anotarTocado({ id: p.id, origem: substituicoes.tem(p.id) ? 'substituto' : 'original' });
        if (ehNome(p)) this.disseNome();
      }
      return this.reserva.falar(texto, o);
    }
    if (!plano) {
      // sem áudio oficial: NUNCA voz do aparelho; o texto fica no balão e a tela segue no ritmo da leitura
      faltando.add(`${vozDe(quem)}|${texto}`);
      return this.reserva.falar(texto, o);
    }
    const g = ++this.geracao;
    // carrega TODOS os trechos antes de começar
    const urls = await Promise.all(plano.map((p) => this.urlDoTrecho(p)));
    const els = await Promise.all(urls.map((u) => carregar(u.url)));
    for (let i = 0; i < els.length; i++) {
      if (g !== this.geracao) return;
      const el = els[i];
      el.playbackRate = 1; // D029 §5: nunca mudar tom nem velocidade
      // substituto: sem boca pré-calculada (o PersonagemVivo acompanha o texto)
      const arquivo = urls[i].substituto ? `substituto:${plano[i].id}` : plano[i].arquivo.replace(/^\.\//, '');
      const tocou = await this.tocarNoCanal(el, g, () => {
        if (ehNome(plano[i])) this.disseNome();
        anotarTocado({ id: plano[i].id, origem: urls[i].substituto ? 'substituto' : 'original', url: urls[i].url });
        avisar('fonema:fala', { quem, voz: vozDe(quem), texto, audio: el, arquivo, inicio: performance.now(), trecho: i, trechos: els.length });
      });
      if (!tocou) return;
      if (g !== this.geracao || i === els.length - 1) avisar('fonema:fala-fim', { quem });
      if (plano[i].pausaMs && g === this.geracao) await new Promise((r) => setTimeout(r, plano[i].pausaMs));
    }
  }
  /**
   * Espera a vez no canal único, toca o clipe até o fim e solta a vez. Devolve false se a fala ficou velha
   * enquanto esperava (alguém pediu outra coisa): aí nada toca.
   */
  private async tocarNoCanal(el: HTMLAudioElement, g: number, aoComecar: () => void): Promise<boolean> {
    const liberar = await vez();
    try {
      if (g !== this.geracao) return false;
      aoComecar();
      const { fim, soltar } = tocarAteOFim(el);
      const desocupar = ocupar(tocandoDoElemento(el, soltar));
      await fim;
      desocupar();
      return true;
    } finally {
      liberar();
    }
  }
  private disseNome() {
    this.controleNome.disse();
    this.vezesNome++;
    try { (window as any).__fonemaNomeDito = this.vezesNome; } catch { /* sem janela (teste) */ }
  }
  /** Interrompe a fala: o clipe que está quase no fim termina sozinho; o resto some com fade (sem estalo). */
  parar(motivo: MotivoParar = 'pedido') {
    this.geracao++;
    interromper(motivo);
    this.reserva.parar();
  }
  /** Toca um clipe solto (nome no cadastro) até o fim. Com `id`, toca o substituto do administrador se houver. */
  async tocarArquivo(caminho: string, id?: string): Promise<void> {
    const g = ++this.geracao;
    const sub = id ? await substituicoes.url(id) : null;
    const el = await carregar(sub ?? (await urlDoAudio(caminho)));
    if (g !== this.geracao) return;
    const quem = /nomes\/(sofia|tales)\//.exec(caminho)?.[1] ?? 'sofia';
    const tocou = await this.tocarNoCanal(el, g, () => {
      avisar('fonema:fala', { quem, voz: quem, texto: '', audio: el, arquivo: sub && id ? `substituto:${id}` : caminho.replace(/^\.\//, ''), inicio: performance.now(), trecho: 0, trechos: 1 });
    });
    if (tocou) avisar('fonema:fala-fim', { quem });
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
  /** Fila nº 27 (2): começou uma atividade, prova ou jogo; o nome pode ser dito uma vez, no começo. */
  novaAtividade() { this.pre.controleNome.novaAtividade(); }
  private fila: Promise<void> = Promise.resolve();
  configurar(o: { ligada?: boolean; velocidade?: number; provedor?: 'navegador' | 'pre-gerada' }) {
    if (o.ligada !== undefined) this.ligada = o.ligada;
    // `velocidade` e `provedor: 'navegador'` não têm mais efeito (D029 §5): só as vozes oficiais, em 1×
  }
  /**
   * Fala agora. O que estava tocando: se a criança acabou de tocar na tela, sai com fade; senão, a fala nova espera
   * acabar (canal único, servicos/canal-audio.ts). Nunca duas ao mesmo tempo.
   */
  falar(texto: string, o?: OpcoesFala): Promise<void> {
    this.parar('novo');
    coletar(texto, o?.quem, this.pre.nome);
    if (!this.ligada) return Promise.resolve();
    this.fila = this.dizer(texto, o);
    return this.fila;
  }
  /**
   * Som isolado ("mmm", "/ssss/") ou sequência de sons ("sss… ooo… lll"): toca o SOM REAL da letra quando todos
   * existem (Estúdio de sons ou public/audio/sons). Senão, a fala gravada da dupla (ou silêncio, se não houver).
   */
  private async dizer(texto: string, o?: OpcoesFala, t = this.turno): Promise<void> {
    const seq = fonemasDaSequencia(texto);
    if (seq && !modoTeste() && (await sonsLetras.temTodos(seq))) { if (t === this.turno) await sonsLetras.tocarSequencia(seq); return; }
    // leitura da Trilha dos Sons ainda sem clipe de voz ("lupé", "anta"…): os sons puros emendados, ligeiro (ponte até a
    // gravação; nunca voz do navegador nem nome de letra). Lista e sons em @fonema/conteudo › LEITURAS_EM_SONS.
    const sons = LEITURAS_EM_SONS[texto.trim()];
    if (sons) {
      await this.pre.pronto;
      if (!this.pre.temTrecho(texto, o?.quem ?? 'sofia') && (await sonsLetras.temTodos(sons.filter((x): x is string => !!x)))) {
        if (t !== this.turno) return;
        this.emendando = true;
        await tocarSonsEmendados(sons, 'rapido');
        this.emendando = false;
        return;
      }
    }
    if (t !== this.turno) return; // alguém pediu outra coisa enquanto este esperava
    return this.provedor.falar(texto, o);
  }
  /**
   * SOM REAL de um fonema (D029 §2), `vezes` seguidas com um respiro. Devolve false quando não há som para ele:
   * aí a tela usa a fala antiga da dupla ("M, de macaco.").
   */
  async somReal(fonema: string, vezes = 1): Promise<boolean> {
    this.parar('novo');
    const t = this.turno;
    if (!(await sonsLetras.tem(fonema))) return false;
    if (!this.ligada || t !== this.turno) return true;
    const p = (async () => { await sonsLetras.tocarSequencia(Array.from({ length: vezes }, () => fonema), 450); })();
    this.fila = p;
    await p;
    return true;
  }
  /** Existe som real (gravado ou publicado) para este fonema? */
  temSomReal(fonema: string): Promise<boolean> { return sonsLetras.tem(fonema); }
  /** Arquivos (clipes) destas falas com o nome dado, sem tocar nada. Usado para deixar falas comuns no aparelho. */
  async arquivosDasFalas(falas: { texto: string; quem?: Personagem }[], nome: string): Promise<string[]> {
    await this.pre.pronto;
    const antes = this.pre.nome;
    this.pre.nome = nome;
    try { return falas.flatMap((f) => this.pre.arquivos(f.texto, f.quem ?? 'sofia') ?? []); } finally { this.pre.nome = antes; }
  }
  /** O nome tem clipe gravado nas vozes oficiais? (lista de nomes comuns) */
  async temNome(nome: string): Promise<boolean> {
    await this.pre.pronto;
    return this.pre.temNomeNaVoz('sofia', nome) && this.pre.temNomeNaVoz('tales', nome);
  }
  /** Toca o nome na voz OFICIAL da Sofia ou do Tales (cadastro). Devolve false se o nome ainda não tem gravação. */
  async ouvirNome(nome: string, quem: 'sofia' | 'tales'): Promise<boolean> {
    this.parar('novo');
    await this.pre.pronto;
    if (!this.pre.temNomeNaVoz(quem, nome)) return false;
    if (!this.ligada || modoTeste()) return true;
    await this.pre.tocarArquivo(this.pre.arquivoDoNome(quem, nome), idNome(quem, chaveNome(nome)));
    return true;
  }
  /** Todas estas falas curtas (sílabas, sons) têm clipe na voz oficial? Se faltar uma, é melhor não falar nenhuma. */
  temTodas(textos: string[], quem: Personagem = 'sofia'): boolean {
    return textos.every((t) => this.pre.temTrecho(t, quem));
  }
  /** Fala uma sequência de falas, uma depois da outra. */
  async sequencia(falas: { texto: string; quem?: Personagem }[], aoMudar?: (i: number) => void): Promise<void> {
    this.parar('novo');
    const t = this.turno;
    for (let i = 0; i < falas.length; i++) {
      if (t !== this.turno) return; // alguém parou a voz (outra fala, troca de tela): a fila acaba aqui
      aoMudar?.(i);
      coletar(falas[i].texto, falas[i].quem, this.pre.nome);
      if (this.ligada) await this.dizer(falas[i].texto, { quem: falas[i].quem }, t);
      else await new Promise((r) => setTimeout(r, modoTeste() ? 10 : 1400));
    }
  }
  /** Muda a cada parar(): uma sequência em andamento sabe que foi cancelada. */
  private turno = 0;
  /**
   * Para a voz e os sons. `'pedido'` (padrão: botão, troca de tela) corta na hora, com fade; `'novo'` é o parar
   * implícito de quem vai tocar algo novo (só corta se a criança tocou na tela há pouco; ver servicos/canal-audio.ts).
   */
  parar(motivo: MotivoParar = 'pedido') {
    this.turno++;
    this.provedor.parar(motivo);
    sonsLetras.parar(motivo);
    if (this.emendando) { this.emendando = false; pararSons(motivo); }
  }
  /**
   * Uma CADEIA de falas/sons de uma tela (ex.: enunciado → som-estímulo). Se qualquer outra fala, som ou parada
   * acontecer no meio (a criança respondeu, tocou em "ouvir"), a cadeia fica velha e o resto dela não toca: o
   * estímulo antigo nunca entra por cima da correção. `ativa()` diz se ela ainda vale.
   */
  cadeia() {
    let meu = this.turno;
    const ativa = () => meu === this.turno;
    const passo = async <T,>(f: () => Promise<T>, pulo: T): Promise<T> => {
      if (!ativa()) return pulo;
      const p = f();
      meu = this.turno; // f() já parou o anterior (síncrono): o turno novo é desta cadeia
      const r = await p;
      return r;
    };
    return {
      ativa,
      falar: (texto: string, o?: OpcoesFala) => passo(() => this.falar(texto, o), undefined),
      somReal: (fonema: string, vezes = 1) => passo(() => this.somReal(fonema, vezes), false),
      /** Para coisas fora da voz (sons emendados, espera): roda só se a cadeia ainda vale. */
      se: <T,>(f: () => Promise<T>, pulo: T) => passo(f, pulo)
    };
  }
  /** Uma leitura sem clipe está tocando em sons emendados (só ela é parada por `parar`). */
  private emendando = false;
}

export const voz = new Voz();
