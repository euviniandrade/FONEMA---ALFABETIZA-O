/**
 * Sistema de design FONEMA (Decisão 025 · padrão visual premium).
 * Componentes-base: Icone (3D ou traço), Figura (figuras 3D das atividades), Logo, Fundo, Botao3D, Cartao,
 * BotaoSegurar (portão do adulto, sem cálculo) e MapaNavegavel (arrastar/pinça).
 * Regra: nenhum emoji como ícone — só os ícones 3D de assets/arte/icones, as figuras 3D ou estes SVGs.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { asset, modoTeste } from '../servicos/ambiente.ts';

/* ------------------------------------------------------------------ ícones */
const ICONES_3D = new Set(['som', 'tartaruga', 'contraste', 'engrenagem', 'cadeado', 'mapa', 'lojinha', 'album', 'casa', 'play', 'voltar', 'familia']);

/** Ícones de traço (24×24), todos com a mesma espessura e cantos redondos. */
const TRACO: Record<string, ReactNode> = {
  seta: <path d="M5 12h13M12.5 6l6 6-6 6" />,
  'seta-esq': <path d="M19 12H6M11.5 6l-6 6 6 6" />,
  check: <path d="M5 12.8l4.6 4.6L19 7.6" />,
  mais: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  repetir: <><path d="M19.2 12a7.2 7.2 0 1 1-2.2-5.2" /><path d="M19.5 3.6v4.6h-4.6" /></>,
  apagar: <><path d="M9 6h11v12H9l-5-6z" /><path d="M12.5 10l4 4m0-4l-4 4" /></>,
  microfone: <><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></>,
  dica: <><path d="M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z" /><path d="M9.5 18.5h5M10.5 21h3" /></>,
  trofeu: <><path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" /><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 20.5h8" /></>,
  estrela: <path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3 6.3 20.3l1.1-6.3L2.8 9.5l6.4-.9z" fill="currentColor" />,
  alvo: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  raio: <path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z" fill="currentColor" />,
  olho: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.6" fill="currentColor" /></>,
  copiar: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>,
  baixar: <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" />,
  lixeira: <path d="M4.5 7h15M10 7V4.2h4V7M6.8 7l1 13h8.4l1-13M10 11v5M14 11v5" />,
  grafico: <path d="M5 20v-8M12 20V5M19 20v-5" />,
  pessoa: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.6-4 3.6-6 7.5-6s6.9 2 7.5 6" /></>,
  chapeu: <><path d="M2.5 9.5L12 5l9.5 4.5L12 14z" fill="currentColor" /><path d="M6.5 12.5v4c0 1.4 2.6 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4M21.5 9.5v5" /></>,
  boca: <path d="M3 11.5c2.6-3.6 5.8-4.6 9-2.4 3.2-2.2 6.4-1.2 9 2.4-2.6 4.8-5.6 6.4-9 6.4s-6.4-1.6-9-6.4zM3 11.5h18" />,
  cubo: <path d="M12 2.8l8.5 4.7v9L12 21.2l-8.5-4.7v-9zM12 12l8.5-4.5M12 12v9.2M12 12L3.5 7.5" />,
  globo: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  placa: <path d="M12 3v18M5 6h11.5l3 3-3 3H5z" />,
  gravar: <circle cx="12" cy="12" r="6.5" fill="currentColor" />,
  tocar: <path d="M7.5 4.5l12 7.5-12 7.5z" fill="currentColor" />,
  coracao: <path d="M12 20.5S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9c0 6-8.5 11.5-8.5 11.5z" fill="currentColor" />,
  nota: <><path d="M9 18V5.5L20 3.5V16" /><circle cx="6.5" cy="18" r="2.6" fill="currentColor" /><circle cx="17.5" cy="16" r="2.6" fill="currentColor" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.5l3.5 2" /></>,
  escudo: <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" />,
  caderno: <><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h3.5" /></>,
  sino: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 21h4" />
};

export function Icone({ nome, tam, className = '' }: { nome: string; tam?: number; className?: string }) {
  const st: CSSProperties | undefined = tam ? { width: tam, height: tam } : undefined;
  if (ICONES_3D.has(nome)) return <img className={`ic ic3d ${className}`} style={st} src={asset(`arte/icones/${nome}.webp`)} alt="" aria-hidden="true" draggable={false} />;
  return (
    <svg className={`ic ${className}`} style={st} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {TRACO[nome] ?? TRACO.estrela}
    </svg>
  );
}

/* ------------------------------------------------------------------ figuras 3D das atividades */
const semAcento = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim();
const TEM = new Set('abacaxi abelha alto-falante aviao banana bola boneca caneca caranguejo casa chave cola concha copo dado elefante escada estrela faca fala feijao fila foca fofo fogo folha formiga garrafa gato ginga helicoptero hipopotamo iglu ilha ioio janela joinha kiwi lama leao lua lula lupa macaco mala mamae mao mel mesa mofo mola moto muda mula navio ovelha ovo pandeiro panela pao papai papel pare pato pe peixe peteca pipoca queijo rato rua sacola sapato sapo sol suco tatu urso uva vaca vela vovo-f vovo-m waffle xicara xilofone yakisoba zebra'.split(' '));
const POR_PALAVRA: Record<string, string> = { 'vovó': 'vovo-f', 'vovô': 'vovo-m', bolota: 'tatu', esquiva: 'ginga', sim: 'joinha', nao: 'pare', 'não': 'pare', 'copo plastico': 'copo' };
const POR_EMOJI: Record<string, string> = {
  '🐱': 'gato', '🦆': 'pato', '✋': 'mao', '🍞': 'pao', '⚽': 'bola', '🧴': 'cola', '🏠': 'casa', '🏡': 'casa', '🪑': 'mesa', '🐸': 'sapo', '🌙': 'lua', '🛣': 'rua', '🪟': 'janela',
  '🍲': 'panela', '🦭': 'foca', '🍿': 'pipoca', '🦁': 'leao', '✈': 'aviao', '🧳': 'mala', '🐒': 'macaco', '🏍': 'moto', '☀': 'sol', '🧃': 'suco', '🍴': 'faca', '🔥': 'fogo',
  '🐜': 'formiga', '🍃': 'folha', '🌿': 'folha', '🌳': 'folha', '🦶': 'pe', '🦔': 'tatu', '🎲': 'dado', '👵': 'vovo-f', '👴': 'vovo-m', '🐝': 'abelha', '🍇': 'uva', '🥚': 'ovo', '🐑': 'ovelha',
  '🐘': 'elefante', '⭐': 'estrela', '✨': 'estrela', '🪜': 'escada', '🏝': 'ilha', '🗼': 'ilha', '🧊': 'iglu', '🪀': 'ioio', '🐻': 'urso', '🍍': 'abacaxi', '🐟': 'peixe', '🎣': 'peixe', '🍌': 'banana',
  '☕': 'caneca', '🪆': 'boneca', '🍯': 'mel', '📄': 'papel', '📒': 'papel', '📖': 'papel', '📚': 'papel', '🫘': 'feijao', '👞': 'sapato', '🔑': 'chave', '🚢': 'navio', '🐚': 'concha', '🦀': 'caranguejo',
  '🥤': 'copo', '🛍': 'sacola', '🧺': 'sacola', '🎒': 'mala', '👩': 'mamae', '👨': 'papai', '👨‍👩‍👧': 'mamae', '🏸': 'peteca', '🤸': 'ginga', '🕯': 'vela', '🏮': 'vela', '🐄': 'vaca', '🦓': 'zebra', '🐭': 'rato',
  '🗣': 'fala', '🚶': 'fila', '🧸': 'fofo', '🫏': 'mula', '🦑': 'lula', '🌀': 'mola', '🟫': 'lama', '👍': 'joinha', '💪': 'joinha', '🔊': 'alto-falante', '👂': 'alto-falante', '🔍': 'lupa', '🌱': 'muda',
  '🌼': 'sol', '👏': 'mao', '🪙': '@recompensas/moeda', '🐢': '@arte/icones/tartaruga', '🖼': '@arte/icones/album', '🌎': '@arte/icones/mapa', '🎵': 'pandeiro'
};

/** Caminho da figura 3D para uma palavra (ou para o emoji provisório do conteúdo); `null` se não houver arte. */
export function caminhoFigura(emoji?: string, palavra?: string): string | null {
  const p = palavra ? semAcento(palavra) : '';
  const porPalavra = palavra ? POR_PALAVRA[palavra.toLowerCase()] ?? POR_PALAVRA[p] ?? (TEM.has(p) ? p : undefined) : undefined;
  const e = emoji ? POR_EMOJI[emoji] ?? POR_EMOJI[emoji.replace(/️/g, '')] : undefined;
  const nome = porPalavra ?? e;
  if (!nome) return null;
  return nome.startsWith('@') ? asset(`${nome.slice(1)}.webp`) : asset(`figuras/${nome}.webp`);
}

/** Figura 3D da atividade (no lugar dos emojis provisórios do conteúdo). */
export function Figura({ emoji, palavra, className = 'fig' }: { emoji?: string; palavra?: string; className?: string }) {
  const src = caminhoFigura(emoji, palavra);
  if (src) return <img className={`${className} fig-3d`} src={src} alt="" aria-hidden="true" draggable={false} loading="lazy" />;
  return <span className={`${className} fig-letra`} aria-hidden="true"><Icone nome="estrela" /></span>;
}

/* ------------------------------------------------------------------ logotipo */
export function Logo({ tamanho = 'g', subtitulo = false, animar = false }: { tamanho?: 'p' | 'm' | 'g'; subtitulo?: boolean; animar?: boolean }) {
  return (
    <div className={`logo logo-${tamanho} ${animar ? 'logo-anima' : ''}`} role="img" aria-label="FONEMA — Aventura da leitura com Sofia e Tales">
      <div className="logo-letras" aria-hidden="true">
        {/* três camadas da palavra inteira (contorno marinho, contorno branco, miolo amarelo): uma letra nunca cobre a vizinha */}
        {(['fundo', 'meio', 'frente'] as const).map((camada) => (
          <div key={camada} className={`logo-camada logo-${camada}`}>
            {[...'FONEMA'].map((l, i) => <span key={i} style={{ ['--i' as string]: i }}>{l}</span>)}
          </div>
        ))}
      </div>
      {subtitulo ? <div className="logo-faixa" aria-hidden="true">Aventura da leitura com Sofia e Tales</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ fundo de tela */
/** Cenário 3D em tela cheia. `desfoque` deixa a arte calma atrás do cartão (regra pedagógica: foco). */
export function Fundo({ cena, desfoque = 0, tom = 'claro' }: { cena: string; desfoque?: number; tom?: 'claro' | 'escuro' | 'nenhum' | 'calmo' }) {
  const src = cena.includes('/') ? asset(`${cena}.webp`) : asset(`cenas/${cena}.webp`);
  return (
    <div className={`fundo fundo-${tom}`} aria-hidden="true">
      <img src={src} alt="" style={desfoque ? { filter: `blur(${desfoque}px) saturate(1.05)`, transform: 'scale(1.08)' } : undefined} />
    </div>
  );
}

/* ------------------------------------------------------------------ botão 3D e cartão */
type Variante = 'neutro' | 'pri' | 'ipe' | 'verde' | 'terra' | 'vidro';
export function Botao3D({ variante = 'neutro', tamanho, icone, brilho, children, className = '', ...resto }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamanho?: 'mini' | 'grande' | 'enorme'; icone?: string; brilho?: boolean }) {
  return (
    <button className={`btn ${variante === 'neutro' ? '' : variante} ${tamanho ?? ''} ${brilho ? 'brilha' : ''} ${className}`} {...resto}>
      {icone ? <Icone nome={icone} /> : null}
      {children}
    </button>
  );
}

export function Cartao({ children, className = '', vidro = false, ...resto }: { children: ReactNode; className?: string; vidro?: boolean } & React.HTMLAttributes<HTMLElement>) {
  return <section className={`cartao ${vidro ? 'vidro' : ''} ${className}`} {...resto}>{children}</section>;
}

/* ------------------------------------------------------------------ portão: segurar por 3 segundos */
/** Botão de segurar (sem cálculo): o anel enche em `ms`; soltar antes zera. Funciona com toque, mouse e teclado. */
export function BotaoSegurar({ ms = 3000, aoCompletar, rotulo = 'Segure para entrar', testId }: { ms?: number; aoCompletar: () => void; rotulo?: string; testId?: string }) {
  const [p, setP] = useState(0);
  const inicio = useRef<number | null>(null);
  const quadro = useRef(0);
  const feito = useRef(false);
  const dur = modoTeste() ? 250 : ms;

  const parar = useCallback(() => {
    inicio.current = null;
    cancelAnimationFrame(quadro.current);
    if (!feito.current) setP(0);
  }, []);
  const passo = useCallback(() => {
    if (inicio.current === null) return;
    const v = Math.min(1, (performance.now() - inicio.current) / dur);
    setP(v);
    if (v >= 1) {
      feito.current = true;
      inicio.current = null;
      aoCompletar();
      return;
    }
    quadro.current = requestAnimationFrame(passo);
  }, [dur, aoCompletar]);
  const comecar = useCallback(() => {
    if (inicio.current !== null || feito.current) return;
    inicio.current = performance.now();
    quadro.current = requestAnimationFrame(passo);
  }, [passo]);
  useEffect(() => () => cancelAnimationFrame(quadro.current), []);

  const R = 54;
  const C = 2 * Math.PI * R;
  const seg = Math.max(0, Math.ceil((1 - p) * (ms / 1000)));
  return (
    <button
      type="button"
      className={`segurar ${p > 0 ? 'segurando' : ''}`}
      data-testid={testId}
      aria-label={`${rotulo}: mantenha pressionado por ${Math.round(ms / 1000)} segundos`}
      onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético */ } comecar(); }}
      onPointerUp={parar}
      onPointerCancel={parar}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); comecar(); } }}
      onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') parar(); }}
      onBlur={parar}
    >
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={R} className="segurar-trilho" />
        <circle cx="64" cy="64" r={R} className="segurar-anel" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 64 64)" />
      </svg>
      <span className="segurar-miolo">
        <Icone nome="cadeado" />
        <b aria-hidden="true">{p > 0 ? seg : ''}</b>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ mapa navegável (arrastar, roda, pinça) */
export interface Marcador { id: string; x: number; y: number; conteudo: ReactNode }

/**
 * Mapa em tela cheia com pan/zoom suave. A imagem sempre cobre a tela (nunca aparece borda).
 * Os marcadores ficam em % da imagem e mantêm o tamanho ao aproximar.
 */
export function MapaNavegavel({ imagem, proporcao, marcadores, foco = { x: 50, y: 50 }, zoomInicial = 1, rotulo, children }: { imagem: string; proporcao: number; marcadores: Marcador[]; foco?: { x: number; y: number }; zoomInicial?: number; rotulo: string; children?: ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [v, setV] = useState({ x: 0, y: 0, z: zoomInicial });
  const [suave, setSuave] = useState(false);
  const pontos = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<{ x: number; y: number; vx: number; vy: number; z: number; dist: number; moveu: boolean } | null>(null);
  const iniciado = useRef(false);

  // tamanho-base: a imagem cobre a área visível
  const base = (() => {
    if (!tam.w) return { w: 0, h: 0 };
    return tam.w / tam.h > proporcao ? { w: tam.w, h: tam.w / proporcao } : { w: tam.h * proporcao, h: tam.h };
  })();
  const limitar = useCallback((x: number, y: number, z: number) => {
    const zz = Math.min(2.6, Math.max(1, z));
    const w = base.w * zz, h = base.h * zz;
    return { x: Math.min(0, Math.max(tam.w - w, x)), y: Math.min(0, Math.max(tam.h - h, y)), z: zz };
  }, [base.w, base.h, tam.w, tam.h]);

  useLayoutEffect(() => {
    const el = caixa.current!;
    const medir = () => setTam({ w: el.clientWidth, h: el.clientHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // centraliza no foco na primeira medida e quando a tela muda de tamanho
  useLayoutEffect(() => {
    if (!base.w) return;
    setV((a) => {
      const z = iniciado.current ? a.z : zoomInicial;
      iniciado.current = true;
      return limitar(tam.w / 2 - (foco.x / 100) * base.w * z, tam.h / 2 - (foco.y / 100) * base.h * z, z);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.w, base.h]);

  const zoomEm = (cx: number, cy: number, fator: number, animado = false) => {
    setSuave(animado);
    setV((a) => {
      const z = Math.min(2.6, Math.max(1, a.z * fator));
      const k = z / a.z;
      return limitar(cx - (cx - a.x) * k, cy - (cy - a.y) * k, z);
    });
  };

  const aoDescer = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-fixo]')) return;
    pontos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pontos.current.values()];
    const dist = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0;
    gesto.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, z: v.z, dist, moveu: false };
    setSuave(false);
  };
  const aoMover = (e: React.PointerEvent) => {
    const g = gesto.current;
    if (!g || !pontos.current.has(e.pointerId)) return;
    pontos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pontos.current.values()];
    if (ps.length > 1 && g.dist) {
      const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      const r = caixa.current!.getBoundingClientRect();
      const cx = (ps[0].x + ps[1].x) / 2 - r.left, cy = (ps[0].y + ps[1].y) / 2 - r.top;
      const z = Math.min(2.6, Math.max(1, g.z * (d / g.dist)));
      const k = z / g.z;
      g.moveu = true;
      setV(limitar(cx - (cx - g.vx) * k, cy - (cy - g.vy) * k, z));
      return;
    }
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.moveu && Math.hypot(dx, dy) < 7) return;
    if (!g.moveu) { try { caixa.current?.setPointerCapture(e.pointerId); } catch { /* ok */ } }
    g.moveu = true;
    setV(limitar(g.vx + dx, g.vy + dy, g.z));
  };
  const aoSubir = (e: React.PointerEvent) => {
    pontos.current.delete(e.pointerId);
    if (!pontos.current.size) setTimeout(() => { gesto.current = null; }, 0);
  };

  return (
    <div
      ref={caixa}
      className="mapa-nav"
      role="application"
      aria-label={rotulo}
      onPointerDown={aoDescer}
      onPointerMove={aoMover}
      onPointerUp={aoSubir}
      onPointerCancel={aoSubir}
      onWheel={(e) => { const r = caixa.current!.getBoundingClientRect(); zoomEm(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12); }}
      onClickCapture={(e) => { if (gesto.current?.moveu) { e.stopPropagation(); e.preventDefault(); } }}
    >
      <div className={`mapa-mundo ${suave ? 'suave' : ''}`} style={{ width: base.w * v.z || '100%', height: base.h * v.z || '100%', transform: `translate3d(${v.x}px,${v.y}px,0)` }}>
        <img className="mapa-arte" src={imagem} alt="" draggable={false} />
        {base.w ? marcadores.map((m) => <div key={m.id} className="mapa-marcador" style={{ left: `${m.x}%`, top: `${m.y}%` }}>{m.conteudo}</div>) : null}
      </div>
      <div className="mapa-zoom" data-fixo role="group" aria-label="Aproximar e afastar o mapa">
        <button className="hud-btn" onClick={() => zoomEm(tam.w / 2, tam.h / 2, 1.35, true)} aria-label="Aproximar"><Icone nome="mais" /></button>
        <button className="hud-btn" onClick={() => zoomEm(tam.w / 2, tam.h / 2, 1 / 1.35, true)} aria-label="Afastar"><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg></button>
      </div>
      {children}
    </div>
  );
}
