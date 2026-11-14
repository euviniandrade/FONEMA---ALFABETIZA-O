/**
 * PERSONAGEM VIVO (D027 §3) — os personagens deixam de ser foto:
 *  - modo="busto": rosto de frente com a BOCA sincronizada à voz oficial (visemas do Espelho do Som), piscadas e balanço;
 *  - modo="corpo": corpo inteiro em laço de vídeo com fundo transparente (parado respirando, acenando, palmas, pensando…);
 *  - modo="giro":  giro de 360° que a criança arrasta com o dedo (e que gira sozinho, devagar).
 *
 * Fala: o componente escuta os eventos window 'fonema:fala' { quem, texto, audio, arquivo, inicio… } e 'fonema:fala-fim'
 * que o serviço de voz (servicos/voz.ts) dispara a cada clipe. Rede de segurança: se esses eventos não vierem, uma PONTE
 * observa os <audio> que tocam e descobre o clipe sozinha (pelo caminho ou, no pacote único, pela impressão digital do blob).
 * A ponte se desliga no primeiro evento oficial.
 *
 * Respeita "Menos movimento" (html.menos-movimento / prefers-reduced-motion) e pausa tudo fora da tela.
 * Arquivos: public/assets/vivos/{busto,corpo,giro}/ e bocas.json (gerados por docs/.../personagens-vivos/ferramentas).
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { asset, modoTeste } from '../servicos/ambiente.ts';
import './personagem-vivo.css';

export type QuemVivo = 'sofia' | 'tales' | 'dupla' | 'bolota' | 'zum-zum';
export type EstadoVivo = 'parado' | 'acenando' | 'palmas' | 'pensando' | 'comemorando' | 'apontando';
export interface DetalheFala { quem: string; texto?: string; audio?: HTMLAudioElement; arquivo?: string; duracao?: number; ponte?: boolean }

const NOME: Record<QuemVivo, string> = { sofia: 'Sofia', tales: 'Tales', dupla: 'Sofia e Tales', bolota: 'Bolota', 'zum-zum': 'Zum-Zum' };

/* ───────────── medidas dos arquivos ───────────── */
const GIRO: Record<QuemVivo, { arq: string; q: number; col: number; lin: number; l: number; a: number } | undefined> = {
  sofia: { arq: 'sofia', q: 48, col: 8, lin: 6, l: 203, a: 420 },
  tales: { arq: 'tales', q: 48, col: 8, lin: 6, l: 155, a: 420 },
  bolota: { arq: 'bolota', q: 48, col: 8, lin: 6, l: 404, a: 340 },
  'zum-zum': { arq: 'zum-zum', q: 48, col: 8, lin: 6, l: 532, a: 260 },
  dupla: undefined
};
/** estado -> [arquivo, largura, altura]; o primeiro de cada personagem é o laço de descanso. */
const CORPO: Record<QuemVivo, Partial<Record<EstadoVivo, [string, number, number]>>> = {
  dupla: { parado: ['dupla-parado', 414, 480], acenando: ['dupla-acenando', 538, 480], palmas: ['dupla-palmas', 416, 480], pensando: ['dupla-pensando', 470, 480], comemorando: ['dupla-comemorando', 470, 480], apontando: ['dupla-apontando', 522, 480] },
  sofia: { parado: ['sofia-parado', 240, 480], acenando: ['sofia-acenando', 288, 480] },
  tales: { parado: ['tales-parado', 196, 480], acenando: ['tales-acenando', 320, 480] },
  bolota: { parado: ['bolota-parado', 370, 360] },
  'zum-zum': { parado: ['zum-zum-voando', 502, 260] }
};
/** bocas que cada busto tem; as que faltam caem na mais parecida. */
const BOCAS: Record<'sofia' | 'tales', Record<string, string>> = {
  sofia: { a: 'a', e: 'e', i: 's', o: 'o', u: 'u', f: 'f', l: 'l', s: 's', x: 'u' },
  tales: { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', f: 'i', l: 'e', s: 'i', x: 'u' }
};

/* ───────────── ambiente ───────────── */
const semMovimento = () => modoTeste() || document.documentElement.classList.contains('menos-movimento') || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** Safari/iOS não mostra a transparência do WebM (VP9): usa o WebP animado. */
const semAlfaWebm = () => /iP(ad|hone|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) || /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

function useNaTela<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [v, setV] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const o = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: '80px' });
    o.observe(el);
    const vis = () => setV(!document.hidden && el.getBoundingClientRect().bottom > -80);
    document.addEventListener('visibilitychange', vis);
    return () => { o.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, []);
  return [ref, v];
}

/* ───────────── motor da boca (um só para o app inteiro) ───────────── */
type Clipe = [string, string, string]; // [impressão digital, visemas a 25 qps, texto]
let bocas: Promise<{ qps: number; clipes: Record<string, Clipe>; porMarca: Map<string, string> }> | null = null;
function carregarBocas() {
  bocas ??= fetch(asset('vivos/bocas.json')).then((r) => r.json()).then((d) => {
    const porMarca = new Map<string, string>();
    for (const k in d.clipes) porMarca.set(d.clipes[k][0], k);
    return { ...d, porMarca };
  }).catch(() => ({ qps: 25, clipes: {}, porMarca: new Map() }));
  return bocas;
}

/** Texto -> visemas (regras curtas do português), para falas sem clipe pré-calculado (voz do aparelho). */
export function visemasDoTexto(texto: string): string {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let out = '';
  for (const p of t.match(/[a-zç]+|[,.;:!?…]+/g) ?? []) {
    if (!/[a-zç]/.test(p)) { out += '..'; continue; }
    for (let i = 0; i < p.length; i++) {
      const c = p[i], n = p[i + 1] ?? '', fim = i === p.length - 1;
      if ('aeiou'.includes(c)) { const v = fim && p.length > 1 ? (c === 'o' ? 'u' : c === 'e' ? 'i' : c) : c; out += v + v; continue; }
      if ((c === 'c' && n === 'h') || c === 'j' || c === 'x' || (c === 'g' && 'ei'.includes(n))) { out += 'x'; if (n === 'h') i++; continue; }
      if ((c === 'l' || c === 'n') && n === 'h') { out += 'l'; i++; continue; }
      if ('pb'.includes(c) || (c === 'm' && !fim && !'pb'.includes(n))) { out += 'm'; continue; }
      if ('fv'.includes(c)) { out += 'f'; continue; }
      if ('ltd'.includes(c) || (c === 'n' && 'aeiou'.includes(n))) { out += 'l'; continue; }
      if ('szç'.includes(c) || (c === 'c' && 'ei'.includes(n))) { out += 's'; continue; }
    }
    out += '.';
  }
  return out;
}

interface FalaAtiva { quem: string; texto: string; audio?: HTMLAudioElement; linha: string; qps: number; t0: number; fim: number }
let ativa: FalaAtiva | null = null;
let ultimoTexto = '';
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());
/** Diagnóstico (testes): window.__fonemaVivo.ativa mostra a fala que está movendo a boca agora. */
if (typeof window !== 'undefined') (window as unknown as { __fonemaVivo: unknown }).__fonemaVivo = { get ativa() { return ativa; }, get bustos() { return instancias.size; } };

async function aoFalar(d: DetalheFala) {
  const quem = d.quem === 'sofia' || d.quem === 'tales' ? d.quem : '';
  if (!quem) { ativa = null; avisar(); return; }
  const b = await carregarBocas();
  const arquivo = d.arquivo ?? (d.audio ? await arquivoDoAudio(d.audio) : undefined);
  const chave = arquivo?.replace(/^.*audio\//, '');
  const clipe = chave ? b.clipes[chave] : undefined;
  // o clipe do NOME da criança não tem texto: continua no mesmo balão da fala em andamento
  const texto = d.texto || clipe?.[2] || ultimoTexto;
  ultimoTexto = texto;
  if (clipe && d.audio) {
    ativa = { quem, texto, audio: d.audio, linha: clipe[1], qps: b.qps, t0: 0, fim: 0 };
    const acabou = () => { if (ativa?.audio === d.audio) { ativa = null; avisar(); } };
    d.audio.addEventListener('ended', acabou, { once: true });
    d.audio.addEventListener('pause', acabou, { once: true });
    d.audio.addEventListener('error', acabou, { once: true });
  } else if (d.audio) {
    // clipe sem boca pré-calculada (ex.: nome recém-gravado): a boca acompanha o texto ou balbucia enquanto o áudio toca
    ativa = { quem, texto, audio: d.audio, linha: (visemasDoTexto(d.texto ?? '') || 'eaoae.aieu.').repeat(30), qps: 11, t0: 0, fim: 0 };
    const acabou = () => { if (ativa?.audio === d.audio) { ativa = null; avisar(); } };
    d.audio.addEventListener('ended', acabou, { once: true });
    d.audio.addEventListener('pause', acabou, { once: true });
  } else {
    const linha = visemasDoTexto(d.texto ?? '');
    const dur = d.duracao ?? Math.max(500, linha.length * 62);
    ativa = { quem, texto, linha, qps: (linha.length / dur) * 1000, t0: performance.now(), fim: performance.now() + dur };
  }
  avisar();
}

/** Visema de agora ('.' = boca fechada) para um personagem. */
function visemaDeAgora(quem: string): string {
  const a = ativa;
  if (!a || a.quem !== quem) return '.';
  let t: number;
  if (a.audio) { if (a.audio.paused || a.audio.ended) return '.'; t = a.audio.currentTime + 0.03; }
  else { if (performance.now() > a.fim) { ativa = null; return '.'; } t = (performance.now() - a.t0) / 1000; }
  return a.linha[Math.floor(t * a.qps)] ?? '.';
}

/* ───────────── ponte provisória: descobre a fala pelos <audio> que tocam ───────────── */
let ponteLigada = false;
let oficial = false;
const marcaDoBlob = new Map<string, Promise<string>>();
function ligarPonte() {
  if (ponteLigada || typeof window === 'undefined') return;
  ponteLigada = true;
  window.addEventListener('fonema:fala', (e) => { const d = (e as CustomEvent<DetalheFala>).detail; if (!d?.ponte) oficial = true; if (d) void aoFalar(d); });
  window.addEventListener('fonema:fala-fim', () => { ativa = null; avisar(); });
  // pacote único de áudio: cada clipe vira um blob — guarda a impressão digital (tamanho + hash do meio)
  const criar = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (obj: Blob | MediaSource) => {
    const url = criar(obj);
    if (obj instanceof Blob && obj.type === 'audio/mpeg') {
      const m = Math.floor(obj.size / 2);
      marcaDoBlob.set(url, obj.slice(m, m + 256).arrayBuffer().then((buf) => {
        let h = 0x811c9dc5;
        for (const x of new Uint8Array(buf)) h = Math.imul(h ^ x, 0x01000193) >>> 0;
        return `${obj.size}-${h.toString(16)}`;
      }));
    }
    return url;
  };
  const tocar = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (!oficial && this instanceof HTMLAudioElement) void anunciar(this);
    return tocar.apply(this);
  };
}
/** Qual clipe é este <audio>? Pelo caminho ou, no pacote único (blob), pela impressão digital. */
async function arquivoDoAudio(el: HTMLAudioElement): Promise<string | undefined> {
  const src = el.currentSrc || el.src;
  const direto = /audio\/(falas|nomes)\/[^?#]+\.mp3/.exec(src)?.[0];
  if (direto || !src.startsWith('blob:')) return direto;
  const marca = await marcaDoBlob.get(src);
  const k = marca ? (await carregarBocas()).porMarca.get(marca) : undefined;
  return k ? `audio/${k}` : undefined;
}
async function anunciar(el: HTMLAudioElement) {
  const arquivo = await arquivoDoAudio(el);
  if (!arquivo || oficial) return;
  // voz em outro ritmo = outro personagem emprestando a voz (Bolota, Dona Cida…): não mexe a boca da dupla
  if (Math.abs(el.playbackRate - 1) > 0.01 && !/nomes\//.test(arquivo)) return;
  const quem = /(?:falas\/|nomes\/)(sofia|tales)/.exec(arquivo)?.[1];
  if (quem) window.dispatchEvent(new CustomEvent<DetalheFala>('fonema:fala', { detail: { quem, audio: el, arquivo, ponte: true } }));
}

/* ───────────── BUSTO que fala ───────────── */
const normal = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const instancias = new Set<{ quem: string; texto?: string }>();
/** Com vários balões do mesmo personagem na tela, só fala o balão cujo texto contém a fala (se nenhum bater, todos falam). */
function eMinhaVez(eu: { quem: string; texto?: string }): boolean {
  const a = ativa;
  if (!a || a.quem !== eu.quem) return false;
  const alvo = normal(a.texto);
  if (!alvo) return true;
  const bate = (i: { quem: string; texto?: string }) => i.quem === eu.quem && !!i.texto && normal(i.texto).includes(alvo);
  if (bate(eu)) return true;
  for (const i of instancias) if (bate(i)) return false;
  return true;
}

function Busto({ quem, tamanho, texto, className, style }: { quem: 'sofia' | 'tales'; tamanho: number; texto?: string; className?: string; style?: CSSProperties }) {
  const [raiz, naTela] = useNaTela<HTMLSpanElement>();
  const bocaA = useRef<HTMLImageElement>(null);
  const bocaB = useRef<HTMLImageElement>(null);
  const pisca = useRef<HTMLImageElement>(null);
  const eu = useRef({ quem, texto });
  eu.current.quem = quem; eu.current.texto = texto;
  useEffect(() => { ligarPonte(); const i = eu.current; instancias.add(i); return () => { instancias.delete(i); }; }, []);
  useEffect(() => {
    if (!naTela) return;
    const parado = semMovimento();
    let raf = 0, vivo = true, atual = '.', frente = bocaA.current!, fundo = bocaB.current!, proxPisca = performance.now() + 1500 + Math.random() * 3000, carregou = false;
    const el = raiz.current!;
    const mostrar = (v: string) => {
      if (v === atual) return;
      atual = v;
      if (v === '.') { frente.style.opacity = '0'; fundo.style.opacity = '0'; return; }
      // troca suave: a boca nova entra por cima e a antiga sai (≈70 ms, no CSS)
      [frente, fundo] = [fundo, frente];
      frente.src = asset(`vivos/busto/${quem}-boca-${BOCAS[quem][v] ?? 'e'}.webp`);
      frente.style.opacity = '1'; frente.style.zIndex = '2';
      fundo.style.opacity = '0'; fundo.style.zIndex = '1';
    };
    const passo = () => {
      if (!vivo) return;
      const falando = eMinhaVez(eu.current);
      if (falando && !carregou) { carregou = true; for (const v of new Set(Object.values(BOCAS[quem]))) new Image().src = asset(`vivos/busto/${quem}-boca-${v}.webp`); }
      mostrar(falando ? visemaDeAgora(quem) : '.');
      el.classList.toggle('falando', falando && !parado);
      const agora = performance.now();
      if (!parado && agora > proxPisca && pisca.current) {
        pisca.current.style.opacity = '1';
        setTimeout(() => { if (pisca.current) pisca.current.style.opacity = '0'; }, 130);
        proxPisca = agora + 2200 + Math.random() * 3800;
      }
      // sem fala em andamento, não precisa de 60 quadros por segundo
      if (ativa) raf = requestAnimationFrame(passo); else raf = window.setTimeout(passo, 400) as unknown as number;
    };
    const acordar = () => { cancelAnimationFrame(raf); clearTimeout(raf); passo(); };
    ouvintes.add(acordar);
    passo();
    return () => { vivo = false; ouvintes.delete(acordar); cancelAnimationFrame(raf); clearTimeout(raf); };
  }, [naTela, quem, raiz]);
  return (
    <span ref={raiz} className={`vivo vivo-busto ${className ?? ''}`} style={{ width: tamanho, height: tamanho, ...style }} role="img" aria-label={NOME[quem]} data-quem={quem}>
      <span className="vivo-cabeca">
        <img src={asset(`vivos/busto/${quem}-base.webp`)} alt="" draggable={false} />
        <img ref={bocaA} className="vivo-boca" alt="" draggable={false} />
        <img ref={bocaB} className="vivo-boca" alt="" draggable={false} />
        <img ref={pisca} className="vivo-pisca" src={asset(`vivos/busto/${quem}-pisca.webp`)} alt="" draggable={false} />
      </span>
    </span>
  );
}

/* ───────────── CORPO em laço ───────────── */
function Corpo({ quem, estado = 'parado', aoTerminar, gestos, className, style }: { quem: QuemVivo; estado?: EstadoVivo; aoTerminar?: () => void; gestos?: boolean; className?: string; style?: CSSProperties }) {
  const [raiz, naTela] = useNaTela<HTMLSpanElement>();
  const base = useRef<HTMLVideoElement>(null);
  const gesto = useRef<HTMLVideoElement>(null);
  const [parado] = useState(semMovimento);
  const [reserva] = useState(semAlfaWebm);
  const [auto, setAuto] = useState<EstadoVivo>('parado');
  const tabela = CORPO[quem];
  const pedido = estado !== 'parado' && tabela[estado] ? estado : auto;
  const [g, setG] = useState<EstadoVivo>('parado'); // gesto em cena (fica até o vídeo acabar)
  useEffect(() => { if (pedido !== 'parado') setG(pedido); }, [pedido]);
  const [desc, ld, ad] = tabela.parado!;
  const fim = () => { setG('parado'); setAuto('parado'); aoTerminar?.(); };

  // gestos espontâneos de vez em quando (a dupla acena, bate palmas…): "personagem vivo"
  useEffect(() => {
    if (!gestos || parado || !naTela) return;
    const lista = (Object.keys(tabela) as EstadoVivo[]).filter((e) => e !== 'parado' && e !== 'apontando');
    if (!lista.length) return;
    const t = setInterval(() => setAuto((a) => (a === 'parado' && Math.random() < 0.6 ? lista[Math.floor(Math.random() * lista.length)] : a)), 9000);
    return () => clearInterval(t);
  }, [gestos, parado, naTela, tabela]);

  useEffect(() => {
    const v = base.current;
    if (!v) return;
    if (naTela && g === 'parado') void v.play().catch(() => undefined); else v.pause();
  }, [naTela, g]);
  useEffect(() => {
    const v = gesto.current;
    if (!v || g === 'parado') return;
    v.currentTime = 0;
    void v.play().catch(() => fim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g]);
  // reserva (WebP animado não avisa quando acaba): volta ao descanso pelo relógio
  useEffect(() => {
    if (!reserva || g === 'parado') return;
    const t = setTimeout(fim, 9800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserva, g]);

  const [arqG, lg, ag] = tabela[g] ?? tabela.parado!;
  const prop = { '--vivo-prop': `${ld} / ${ad}` } as CSSProperties;
  if (parado) {
    return <span ref={raiz} className={`vivo vivo-corpo ${className ?? ''}`} style={{ ...prop, ...style }} role="img" aria-label={NOME[quem]}><img src={asset(`vivos/corpo/${desc}.webp`)} alt="" draggable={false} /></span>;
  }
  return (
    <span ref={raiz} className={`vivo vivo-corpo ${g !== 'parado' ? 'em-gesto' : ''} ${className ?? ''}`} style={{ ...prop, ...style }} role="img" aria-label={NOME[quem]} data-estado={g}>
      {reserva ? (
        <>
          <img className="vivo-base" src={asset(`vivos/corpo/${desc}.anim.webp`)} alt="" draggable={false} />
          {g !== 'parado' ? <img key={g} className="vivo-gesto" style={{ aspectRatio: `${lg} / ${ag}` }} src={asset(`vivos/corpo/${arqG}.anim.webp`)} alt="" draggable={false} /> : null}
        </>
      ) : (
        <>
          <video ref={base} className="vivo-base" src={asset(`vivos/corpo/${desc}.webm`)} poster={asset(`vivos/corpo/${desc}.webp`)} muted loop playsInline autoPlay preload="auto" disablePictureInPicture tabIndex={-1} />
          {g !== 'parado' ? <video key={g} ref={gesto} className="vivo-gesto" style={{ aspectRatio: `${lg} / ${ag}` }} src={asset(`vivos/corpo/${arqG}.webm`)} muted playsInline preload="auto" onEnded={fim} onError={fim} disablePictureInPicture tabIndex={-1} /> : null}
        </>
      )}
    </span>
  );
}

/* ───────────── GIRO 360° ───────────── */
function Giro({ quem, tamanho, className, style }: { quem: QuemVivo; tamanho: number; className?: string; style?: CSSProperties }) {
  const [raiz, naTela] = useNaTela<HTMLDivElement>();
  const g = GIRO[quem];
  const quadro = useRef(0);
  const mexeu = useRef(0);
  useEffect(() => {
    const el = raiz.current;
    if (!el || !g) return;
    const pintar = () => {
      const i = ((Math.round(quadro.current) % g.q) + g.q) % g.q;
      el.style.backgroundPosition = `${((i % g.col) / (g.col - 1)) * 100}% ${(Math.floor(i / g.col) / (g.lin - 1)) * 100}%`;
      el.setAttribute('aria-valuenow', String(Math.round((i / g.q) * 360)));
    };
    pintar();
    if (!naTela) return;
    let x0 = 0, q0 = 0, preso = false, raf = 0, antes = performance.now();
    const parado = semMovimento();
    const baixo = (e: PointerEvent) => { preso = true; x0 = e.clientX; q0 = quadro.current; el.setPointerCapture(e.pointerId); el.classList.add('pegou'); };
    const move = (e: PointerEvent) => { if (!preso) return; quadro.current = q0 - ((e.clientX - x0) / el.clientWidth) * g.q * 0.9; mexeu.current = performance.now(); pintar(); };
    const solta = () => { preso = false; mexeu.current = performance.now(); el.classList.remove('pegou'); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { quadro.current += e.key === 'ArrowRight' ? 2 : -2; mexeu.current = performance.now(); pintar(); e.preventDefault(); } };
    const passo = (agora: number) => {
      const dt = Math.min(100, agora - antes); antes = agora;
      // gira sozinho, devagar (uma volta a cada ~12 s), e espera 2,5 s depois que a criança mexe
      if (!parado && !preso && agora - mexeu.current > 2500) { quadro.current += (dt / 12000) * g.q; pintar(); }
      raf = requestAnimationFrame(passo);
    };
    el.addEventListener('pointerdown', baixo); el.addEventListener('pointermove', move); el.addEventListener('pointerup', solta); el.addEventListener('pointercancel', solta); el.addEventListener('keydown', tecla);
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerdown', baixo); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', solta); el.removeEventListener('pointercancel', solta); el.removeEventListener('keydown', tecla); };
  }, [g, naTela, raiz]);
  if (!g) return null;
  return (
    <div ref={raiz} className={`vivo vivo-giro ${className ?? ''}`} role="slider" tabIndex={0} aria-label={`${NOME[quem]}: arraste para girar`} aria-valuemin={0} aria-valuemax={360} aria-valuenow={0}
      style={{ height: tamanho, width: (tamanho * g.l) / g.a, backgroundImage: `url(${asset(`vivos/giro/${g.arq}.webp`)})`, backgroundSize: `${g.col * 100}% ${g.lin * 100}%`, ...style }} />
  );
}

/* ───────────── componente público ───────────── */
export interface PropsVivo {
  quem: QuemVivo;
  modo?: 'busto' | 'corpo' | 'giro';
  /** corpo: gesto pedido agora (toca uma vez e volta ao descanso). */
  estado?: EstadoVivo;
  /** corpo: faz gestos espontâneos de vez em quando. */
  gestos?: boolean;
  aoTerminar?: () => void;
  /** busto e giro: lado/altura em px. O corpo se ajusta pelo CSS (largura/altura do pai). */
  tamanho?: number;
  /** busto: texto do balão, para só este busto falar quando há vários do mesmo personagem. */
  texto?: string;
  className?: string;
  style?: CSSProperties;
}
export function PersonagemVivo({ quem, modo = 'busto', estado, gestos, aoTerminar, tamanho, texto, className, style }: PropsVivo) {
  if (modo === 'giro') return <Giro quem={quem} tamanho={tamanho ?? 300} className={className} style={style} />;
  if (modo === 'corpo') return <Corpo quem={quem} estado={estado} gestos={gestos} aoTerminar={aoTerminar} className={className} style={style} />;
  if (quem !== 'sofia' && quem !== 'tales') return null;
  return <Busto quem={quem} tamanho={tamanho ?? 84} texto={texto} className={className} style={style} />;
}

/** Tem busto vivo para este personagem? */
export const temBustoVivo = (quem: string): quem is 'sofia' | 'tales' => quem === 'sofia' || quem === 'tales';
