/**
 * CORRE-SOM · reserva em 2D (sem WebGL, ou quando a pista 3D não fica pronta a tempo). Mesmo contrato da 3D (corrida-motor.ts):
 * os arcos descem da linha do horizonte e crescem até o boneco no tempo de chegada do nível; passou = escolheu a pista em que
 * o boneco está. Moedinhas descem junto e são pegas na pista do boneco. Tudo em DOM com `transform` (sem redesenhar o React).
 */
import { letraAa } from '../../componentes/LetraAa.tsx';
import type { MarcaArco, MotorCorrida, PlacaArco, PortalCorrida } from './corrida-motor.ts';

const COLUNAS = [1 / 6, 0.5, 5 / 6];
const CORES = ['#ff8a65', '#ffc93c', '#5ec2e8'];

interface Coisa2D { el: HTMLElement; inicio: number; dur: number; pista: number; pega: boolean; tipo: 'portal' | 'moeda'; ao?: (k: number) => void; aoLonge?: () => void; longe?: boolean; passou?: boolean }

export class PistaCorrida2D implements MotorCorrida {
  private readonly camada: HTMLDivElement;
  private readonly boneco: HTMLDivElement;
  private coisas: Coisa2D[] = [];
  private pistaAlvo = 1;
  private quadro = 0;
  private vivo = true;
  private ultimoTempo = 2500;
  aoMoeda: (() => void) | null = null;
  aoPulo: (() => void) | null = null;
  aoTropeco: (() => void) | null = null;

  constructor(palco: HTMLElement, private readonly menos: boolean) {
    this.camada = document.createElement('div');
    this.camada.className = 'cs2-camada';
    this.camada.setAttribute('aria-hidden', 'true');
    this.boneco = document.createElement('div');
    this.boneco.className = 'cs2-boneco';
    this.camada.appendChild(this.boneco);
    palco.prepend(this.camada);
    this.irParaPista(1);
    this.quadro = requestAnimationFrame(this.passo);
  }

  get pista() { return this.pistaAlvo; }
  irParaPista(k: number) { this.pistaAlvo = Math.max(0, Math.min(2, k)); this.boneco.style.left = `${COLUNAS[this.pistaAlvo] * 100}%`; }
  pular() { this.boneco.classList.remove('pula'); void this.boneco.offsetWidth; this.boneco.classList.add('pula'); }
  iniciarCorrida() { this.camada.classList.add('correndo'); }
  pararCorrida() { this.camada.classList.remove('correndo'); }
  colunasNaTela() { return COLUNAS; }
  festejar() { this.boneco.classList.remove('festa'); void this.boneco.offsetWidth; this.boneco.classList.add('festa'); }
  async chegada() { this.pararCorrida(); for (const c of this.coisas) c.el.remove(); this.coisas = []; this.boneco.classList.add('festa'); }

  portal(placas: PlacaArco[], tempoMs: number): PortalCorrida {
    this.ultimoTempo = tempoMs;
    const el = document.createElement('div');
    el.className = 'cs2-portal';
    placas.forEach((p, k) => {
      const a = document.createElement('div');
      a.className = 'cs2-arco';
      a.style.left = `${COLUNAS[k] * 100}%`;
      a.style.setProperty('--cor', CORES[k]);
      if (p.letra) { const b = document.createElement('b'); b.className = 'cs-letra'; b.textContent = letraAa(p.letra); a.appendChild(b); }
      else if (p.imagem) { const i = document.createElement('img'); i.src = p.imagem; i.alt = ''; a.appendChild(i); }
      el.appendChild(a);
    });
    this.camada.appendChild(el);
    let ao: (k: number) => void = () => {};
    let aoLonge: () => void = () => {};
    const passou = new Promise<number>((ok) => { ao = ok; });
    const longe = new Promise<void>((ok) => { aoLonge = ok; });
    this.coisas.push({ el, inicio: performance.now(), dur: tempoMs, pista: -1, pega: false, tipo: 'portal', ao, aoLonge });
    if (!this.menos) {
      const p = Math.floor(Math.random() * 3);
      for (let k = 0; k < 3; k++) this.moeda(p, tempoMs * (0.35 + k * 0.12));
    }
    return {
      passou, longe,
      marcar: (m: MarcaArco) => { const a = el.children[this.pistaAlvo] as HTMLElement | undefined; if (a && m) a.classList.add(m); }
    };
  }

  private moeda(pista: number, atraso: number) {
    const el = document.createElement('div');
    el.className = 'cs2-moeda';
    el.style.left = `${COLUNAS[pista] * 100}%`;
    el.style.opacity = '0';
    this.camada.appendChild(el);
    this.coisas.push({ el, inicio: performance.now() + atraso, dur: this.ultimoTempo, pista, pega: false, tipo: 'moeda' });
  }

  private passo = (agora: number) => {
    if (!this.vivo) return;
    for (const c of this.coisas) {
      const f = (agora - c.inicio) / c.dur; // 0 = no horizonte, 1 = no boneco
      if (f < 0) continue;
      const g = this.menos ? 1 : Math.min(1.3, f);
      // perspectiva simples: desce e cresce; depois de passar, some
      const y = 8 + 62 * g * g;
      const s = 0.3 + 0.75 * g;
      c.el.style.transform = `translateY(${y}%) scale(${s})`;
      c.el.style.opacity = f > 1.15 ? String(Math.max(0, 1 - (f - 1.15) * 6)) : '1';
      if (c.tipo === 'portal') {
        if (!c.longe && f >= 0.45) { c.longe = true; c.aoLonge?.(); }
        if (!c.passou && f >= 1) { c.passou = true; c.ao?.(this.pistaAlvo); if (!c.longe) { c.longe = true; c.aoLonge?.(); } }
      } else if (!c.pega && f >= 0.97 && c.pista === this.pistaAlvo) { c.pega = true; c.el.remove(); this.aoMoeda?.(); }
    }
    this.coisas = this.coisas.filter((c) => { const fim = (agora - c.inicio) / c.dur > 1.35 || (c.tipo === 'moeda' && c.pega); if (fim) c.el.remove(); return !fim; });
    this.quadro = requestAnimationFrame(this.passo);
  };

  descartar() {
    this.vivo = false;
    cancelAnimationFrame(this.quadro);
    for (const c of this.coisas) { if (c.tipo === 'portal' && !c.passou) c.ao?.(this.pistaAlvo); }
    this.camada.remove();
  }
}
