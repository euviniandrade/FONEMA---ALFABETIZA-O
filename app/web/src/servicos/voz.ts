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

export class ProvedorPreGerado implements ProvedorVoz {
  private manifesto: Record<string, string> | null = null;
  private atual: HTMLAudioElement | null = null;
  constructor(private reserva: ProvedorVoz) {
    fetch('./audio/falas/manifesto.json').then((r) => (r.ok ? r.json() : {})).then((m) => (this.manifesto = m)).catch(() => (this.manifesto = {}));
  }
  falar(texto: string, o: OpcoesFala = {}): Promise<void> {
    const arq = this.manifesto?.[`${o.quem ?? 'sofia'}|${texto}`];
    if (!arq || modoTeste()) return this.reserva.falar(texto, o);
    return new Promise((resolve) => {
      this.atual = new Audio(`./audio/falas/${arq}`);
      this.atual.onended = () => resolve();
      this.atual.onerror = () => this.reserva.falar(texto, o).then(resolve);
      this.atual.play().catch(() => this.reserva.falar(texto, o).then(resolve));
    });
  }
  parar() { this.atual?.pause(); this.reserva.parar(); }
}

/** Fachada usada pelas telas: liga/desliga e troca de provedor num lugar só. */
class Voz {
  ligada = true;
  private nav = new ProvedorNavegador();
  private provedor: ProvedorVoz = new ProvedorPreGerado(this.nav);
  private fila: Promise<void> = Promise.resolve();
  configurar(o: { ligada?: boolean; velocidade?: number; provedor?: 'navegador' | 'pre-gerada' }) {
    if (o.ligada !== undefined) this.ligada = o.ligada;
    if (o.velocidade) this.nav.velocidade = o.velocidade;
    if (o.provedor === 'navegador') this.provedor = this.nav;
  }
  /** Fala agora (interrompe o que estava falando). */
  falar(texto: string, o?: OpcoesFala): Promise<void> {
    this.parar();
    if (!this.ligada) return Promise.resolve();
    this.fila = this.provedor.falar(texto, o);
    return this.fila;
  }
  /** Fala uma sequência de falas, uma depois da outra. */
  async sequencia(falas: { texto: string; quem?: Personagem }[], aoMudar?: (i: number) => void): Promise<void> {
    this.parar();
    for (let i = 0; i < falas.length; i++) {
      aoMudar?.(i);
      if (this.ligada) await this.provedor.falar(falas[i].texto, { quem: falas[i].quem });
      else await new Promise((r) => setTimeout(r, modoTeste() ? 10 : 1400));
    }
  }
  parar() { this.provedor.parar(); }
}

export const voz = new Voz();
