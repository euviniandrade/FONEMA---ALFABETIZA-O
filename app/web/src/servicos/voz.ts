/**
 * Serviço de VOZ com ponto de troca (D011, D013, voz/README.md):
 *  - ProvedorPreGerado: toca os mp3 das vozes oficiais "Sofia — FONEMA" e "Tales — FONEMA" quando existirem
 *    em public/audio/falas/manifesto.json (texto → arquivo). O nome da criança é gerado UMA vez e encaixado.
 *  - ProvedorNavegador: simulação com speechSynthesis (pt-BR), timbre diferente para cada personagem.
 * Sons isolados (/mmm/) serão gravados por fonoaudióloga; aqui a voz do navegador estica a escrita.
 */
import type { Personagem } from '@fonema/conteudo';
import { modoTeste } from './ambiente.ts';

export interface OpcoesFala { quem?: Personagem; rate?: number; pitchExtra?: number }

export interface ProvedorVoz {
  falar(texto: string, o?: OpcoesFala): Promise<void>;
  parar(): void;
}

const TIMBRE: Record<string, { pitch: number; rate: number }> = {
  sofia: { pitch: 1.35, rate: 1 },
  tales: { pitch: 1.12, rate: 1.03 },
  bolota: { pitch: 0.85, rate: 0.92 },
  'dona-cida': { pitch: 1.0, rate: 0.9 },
  davi: { pitch: 1.2, rate: 1 },
  'guarda-parque': { pitch: 0.95, rate: 0.95 },
  pescadora: { pitch: 1.1, rate: 0.95 },
  'zum-zum': { pitch: 1.5, rate: 1.1 }
};

let vozPt: SpeechSynthesisVoice | null = null;
function escolherVoz() {
  if (typeof speechSynthesis === 'undefined') return;
  const vs = speechSynthesis.getVoices();
  vozPt = vs.find((v) => /pt[-_]BR/i.test(v.lang) && /female|luciana|francisca|google/i.test(v.name)) ?? vs.find((v) => /pt[-_]BR/i.test(v.lang)) ?? vs.find((v) => /^pt/i.test(v.lang)) ?? null;
}
if (typeof speechSynthesis !== 'undefined') {
  escolherVoz();
  speechSynthesis.onvoiceschanged = escolherVoz;
}

export class ProvedorNavegador implements ProvedorVoz {
  velocidade = 0.95;
  falar(texto: string, o: OpcoesFala = {}): Promise<void> {
    const limpo = texto.replace(/[/*_]/g, '').trim();
    if (!limpo) return Promise.resolve();
    if (modoTeste() || typeof speechSynthesis === 'undefined') return new Promise((r) => setTimeout(r, modoTeste() ? 20 : 400));
    const t = TIMBRE[o.quem ?? 'sofia'] ?? TIMBRE.sofia;
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(limpo);
      u.lang = 'pt-BR';
      if (vozPt) u.voice = vozPt;
      u.pitch = Math.min(2, t.pitch + (o.pitchExtra ?? 0));
      u.rate = (o.rate ?? 1) * t.rate * this.velocidade;
      let feito = false;
      const fim = () => { if (!feito) { feito = true; resolve(); } };
      u.onend = fim;
      u.onerror = fim;
      // alguns navegadores não disparam "end": tempo máximo pela duração estimada
      setTimeout(fim, 1200 + limpo.length * 85 / (u.rate || 1));
      speechSynthesis.speak(u);
    });
  }
  parar() { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); }
}

/** Falas sem áudio oficial nesta sessão (para o relatório do gerador; veja window.__fonemaFaltando). */
export const faltando = new Set<string>();
if (typeof window !== 'undefined') (window as any).__fonemaFaltando = faltando;

/** Personagens sem voz própria usam a voz da Sofia ou do Tales com outro ritmo (até terem dubladores). */
export const VOZ_DO_PERSONAGEM: Record<string, { voz: 'sofia' | 'tales'; rate: number }> = {
  sofia: { voz: 'sofia', rate: 1 }, tales: { voz: 'tales', rate: 1 }, bolota: { voz: 'tales', rate: 0.86 },
  davi: { voz: 'tales', rate: 1.05 }, 'dona-cida': { voz: 'sofia', rate: 0.9 }, pescadora: { voz: 'sofia', rate: 0.95 },
  'guarda-parque': { voz: 'tales', rate: 0.9 }, 'zum-zum': { voz: 'tales', rate: 1.12 }
};

/** Chave de um trecho de fala (sem pontuação solta no começo). Mesma regra do gerador (scripts/gerar-vozes.mjs). */
export function chaveTrecho(t: string): string {
  return t.replace(/^[\s,.!?;:…]+/, '').replace(/\s+/g, ' ').replace(/(\p{L})\1{2,}/gu, '$1$1$1$1').trim();
}
export function chaveNome(n: string): string {
  return n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Vozes OFICIAIS pré-geradas (ElevenLabs: "Sofia — FONEMA" e "Tales — FONEMA").
 * A fala é dividida no nome da criança: [trecho] + [clipe do nome] + [trecho]. Se o nome não tem clipe,
 * toca a variante sem o nome (o nome continua escrito na tela). Só cai no speechSynthesis se faltar um trecho.
 */
export class ProvedorPreGerado implements ProvedorVoz {
  private falas: Record<string, string> | null = null;
  private nomes: Record<string, string[]> = { sofia: [], tales: [] };
  private atual: HTMLAudioElement | null = null;
  private geracao = 0;
  nome = '';
  pronto: Promise<void>;
  constructor(private reserva: ProvedorVoz) {
    this.pronto = Promise.all([
      fetch('./audio/falas/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
      fetch('./audio/nomes/manifesto.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
    ]).then(([f, n]) => { this.falas = f; this.nomes = { sofia: [], tales: [], ...n }; });
  }
  /** Lista de arquivos para uma fala, ou null se faltar algum trecho. */
  arquivos(texto: string, quem: string): string[] | null {
    if (!this.falas) return null;
    const v = VOZ_DO_PERSONAGEM[quem] ?? VOZ_DO_PERSONAGEM.sofia;
    const partes = this.nome ? texto.split(this.nome) : [texto];
    const temNome = this.nome && this.nomes[v.voz]?.includes(chaveNome(this.nome));
    const out: string[] = [];
    for (let i = 0; i < partes.length; i++) {
      if (i > 0 && temNome) out.push(`./audio/nomes/${v.voz}/${chaveNome(this.nome)}.mp3`);
      const k = chaveTrecho(partes[i]);
      if (!k) continue;
      const arq = this.falas[`${v.voz}|${k}`];
      if (!arq) return null;
      out.push(`./audio/falas/${arq}`);
    }
    return out.length ? out : null;
  }
  async falar(texto: string, o: OpcoesFala = {}): Promise<void> {
    await this.pronto;
    const quem = o.quem ?? 'sofia';
    const arqs = this.arquivos(texto, quem);
    if (modoTeste()) return this.reserva.falar(texto, o);
    if (!arqs && /^[\s…,.!?-]*((\p{L})\2{2,}[\s…,.!?-]*)+$/u.test(texto)) {
      // sequência de sons isolados ("sss… ooo… lll"): ainda sem gravação da fonoaudióloga → voz do aparelho como último recurso
      return this.reserva.falar(texto, o);
    }
    if (!arqs) {
      // sem áudio oficial: NUNCA voz robótica para a Sofia/Tales; o texto fica no balão e a tela segue no ritmo da leitura
      faltando.add(`${(VOZ_DO_PERSONAGEM[quem] ?? VOZ_DO_PERSONAGEM.sofia).voz}|${texto}`);
      return new Promise((r) => setTimeout(r, Math.min(2500, 400 + texto.length * 35)));
    }
    const g = ++this.geracao;
    const rate = (VOZ_DO_PERSONAGEM[quem]?.rate ?? 1) * (o.rate && o.rate < 0.85 ? 0.85 : 1);
    for (const a of arqs) {
      if (g !== this.geracao) return;
      await new Promise<void>((resolve) => {
        const el = new Audio(a);
        this.atual = el;
        el.playbackRate = rate;
        (el as any).preservesPitch = rate === 1;
        el.onended = () => resolve();
        el.onerror = () => resolve();
        el.play().catch(() => resolve());
      });
    }
  }
  parar() { this.geracao++; this.atual?.pause(); this.reserva.parar(); }
}

/** Coleta (só em teste) as falas realmente ditas, para gerar os áudios oficiais (scripts/gerar-vozes.mjs). */
function coletar(texto: string, quem: Personagem | undefined, nome: string) {
  try {
    if (localStorage.getItem('fonema-coletar') !== '1') return;
    const v = (VOZ_DO_PERSONAGEM[quem ?? 'sofia'] ?? VOZ_DO_PERSONAGEM.sofia).voz;
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
  private nav = new ProvedorNavegador();
  private pre = new ProvedorPreGerado(this.nav);
  private provedor: ProvedorVoz = this.pre;
  /** Nome (na pronúncia escolhida) da criança desta tela, para encaixar o clipe do nome. */
  definirNome(nome: string) { this.pre.nome = nome; }
  private fila: Promise<void> = Promise.resolve();
  configurar(o: { ligada?: boolean; velocidade?: number; provedor?: 'navegador' | 'pre-gerada' }) {
    if (o.ligada !== undefined) this.ligada = o.ligada;
    if (o.velocidade) this.nav.velocidade = o.velocidade;
    if (o.provedor === 'navegador') this.provedor = this.nav;
  }
  /** Fala agora (interrompe o que estava falando). */
  falar(texto: string, o?: OpcoesFala): Promise<void> {
    this.parar();
    coletar(texto, o?.quem, this.pre.nome);
    if (!this.ligada) return Promise.resolve();
    this.fila = this.provedor.falar(texto, o);
    return this.fila;
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
