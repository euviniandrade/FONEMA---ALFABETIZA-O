import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { Conquista } from '@fonema/conteudo';
import type { ConquistaGanha, InfoNivel } from '@fonema/motor';
import { asset } from '../servicos/ambiente.ts';
import { caminhoFigura } from './ui.tsx';
import { carregarImagem, geoPremio, geoSelo, novoCanvas, pintarFrente, pintarVerso, prepararSelo, relevoEstrela, type ArteSelo, type Forma, type Metal, type Motivo } from './selo-pintura.ts';
import type { Modo, Peca, Vista } from './premio3d.ts';

/* ============================== selos 3D (D025/D029) ============================== */
const NOME_NIVEL: Record<string, string> = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', diamante: 'Diamante' };
const COR_BORDA: Record<Metal | 'bloqueado', number> = { ouro: 0xe7ad3c, bronze: 0xb56c38, prata: 0xc2cad6, diamante: 0x74b9ee, bloqueado: 0xb4bdc9 };
const MARGEM_3D = 1.16; // o canvas 3D é um pouco maior que o selo (perspectiva e quique da entrada)

/**
 * Forma da base por tipo de conquista:
 * selo → MEDALHA (roseta), ou ESTRELA quando o motivo é uma letra (o "Meu Nome" aprovado e os selos das letras);
 * medalha (marco da jornada) e troféu → ESTRELA; título e emblema de coleção → ESCUDO com louros;
 * selo de validação do adulto → HEXÁGONO.
 */
export function formaDoSelo(tipo: string, motivoEhLetra: boolean): Forma {
  if (tipo === 'titulo' || tipo === 'patente' || tipo === 'emblema_colecao') return 'escudo';
  if (tipo === 'selo_validacao') return 'hexagono';
  if (tipo === 'medalha' || tipo === 'trofeu') return 'estrela';
  return motivoEhLetra ? 'estrela' : 'medalha';
}

function motivoDe(c: Conquista, letra?: string): Motivo {
  // "Cofrinho Novo": o motivo é o porquinho, não uma moeda solta
  if (c.id === 'S-R0-10' || /cofrinho|porquinho/i.test(c.nome)) return { tipo: 'figura', src: asset('recompensas/cofrinho-porquinho.webp') };
  const m = c.motivo === '$LETRA' ? (letra ?? 'A') : c.motivo;
  if (/^[A-ZÀ-Ý]{1,2}$/.test(m)) return { tipo: 'letra', texto: m };
  return { tipo: 'figura', src: caminhoFigura(m) ?? asset('figuras/estrela.webp') };
}

function arteDe(c: Conquista, ganha: ConquistaGanha | undefined, letra: string | undefined, bloqueado: boolean): ArteSelo {
  const mist = bloqueado && c.visivel_antes === 'misterio';
  const motivo: Motivo = mist ? { tipo: 'misterio' } : motivoDe(c, letra);
  const nivel = ganha?.nivel ?? 'ouro';
  const metal: Metal = nivel === 'bronze' || nivel === 'prata' || nivel === 'diamante' ? nivel : 'ouro';
  return {
    forma: formaDoSelo(c.tipo, motivo.tipo === 'letra' || c.motivo === '$LETRA'),
    metal, nome: c.nome, motivo, bloqueado,
    verso: ganha && !bloqueado ? { nivel: NOME_NIVEL[ganha.nivel] ?? '', data: new Date(ganha.em).toLocaleDateString('pt-BR') } : undefined
  };
}
const chaveArte = (a: ArteSelo) => JSON.stringify(a);
const dpr = () => Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
const calmo = () => typeof document !== 'undefined' && (document.documentElement.classList.contains('menos-movimento') || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

interface Montada { peca: Peca; frente: HTMLCanvasElement | HTMLImageElement }
async function montarSelo(arte: ArteSelo): Promise<Montada> {
  const im = await prepararSelo(arte, true);
  const g = geoSelo(arte.forma);
  const frente = novoCanvas(g.w * 1.2, g.h * 1.2);
  const verso = novoCanvas(g.w, g.h);
  pintarFrente(frente, arte, im);
  pintarVerso(verso, arte, im);
  return { frente, peca: { frente, verso, contorno: g.contorno, proporcao: g.w / g.h, espessura: 0.075, borda: COR_BORDA[arte.bloqueado ? 'bloqueado' : arte.metal] } };
}

/** Objeto que GIRA em 360° (frente, borda e verso). Sem WebGL, fica a frente parada. */
function Objeto3D({ chave, montar, proporcao, largura, modo, angulo, rotulo, aoAssentar, className = '' }: {
  chave: string; montar: () => Promise<Montada>; proporcao: number; largura: number; modo: Modo; angulo?: number; rotulo: string; aoAssentar?: () => void; className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const assentar = useRef(aoAssentar);
  assentar.current = aoAssentar;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let vivo = true;
    let vista: Vista | null = null;
    canvas.width = Math.round(largura * MARGEM_3D * dpr());
    canvas.height = Math.round(canvas.width / proporcao);
    (async () => {
      const { peca, frente } = await montar();
      if (!vivo) return;
      const ctx = canvas.getContext('2d');
      const m = (1 - 1 / MARGEM_3D) / 2;
      ctx?.drawImage(frente, canvas.width * m, canvas.height * m, canvas.width / MARGEM_3D, canvas.height / MARGEM_3D);
      try {
        const motor = await import('./premio3d.ts');
        if (!vivo) return;
        vista = motor.criarVista(canvas, peca, { modo, angulo, calmo: calmo(), aoAssentar: () => assentar.current?.() });
        canvas.dataset.giro = '3d';
        if (calmo() || modo !== 'entrada') assentar.current?.();
      } catch {
        canvas.dataset.giro = 'parado';
        assentar.current?.();
      }
    })();
    return () => { vivo = false; vista?.destruir(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, largura, modo, angulo]);
  return <canvas ref={ref} className={`premio-3d ${className}`} style={{ width: largura * MARGEM_3D, aspectRatio: String(proporcao) }} role="img" aria-label={rotulo} data-testid="premio-3d" />;
}

/** Selo girando em 360°: arraste para girar (com inércia); solta e ele volta de frente ou retoma o giro lento. */
export function SeloGirando({ conquista, ganha, letra, bloqueado = false, tamanho = 300, modo = 'auto', angulo, aoAssentar }: { conquista: Conquista; ganha?: ConquistaGanha; letra?: string; bloqueado?: boolean; tamanho?: number; modo?: Modo; angulo?: number; aoAssentar?: () => void }) {
  const arte = arteDe(conquista, ganha, letra, bloqueado);
  const g = geoSelo(arte.forma);
  return <Objeto3D chave={chaveArte(arte)} montar={() => montarSelo(arte)} proporcao={g.w / g.h} largura={tamanho} modo={modo} angulo={angulo} aoAssentar={aoAssentar} rotulo={`Selo ${conquista.nome}${bloqueado ? ' (ainda não conquistado)' : ''}`} />;
}

const PREMIOS = {
  moeda: { arquivo: 'moeda', rotulo: 'Moedinha', espessura: 0.07, borda: 0xe2a52c, modo: 'auto' },
  trofeu: { arquivo: 'trofeu', rotulo: 'Troféu', espessura: 0.1, borda: 0xd9982a, modo: 'balanco' },
  bau: { arquivo: 'bau-livros', rotulo: 'Baú de livros', espessura: 0.1, borda: 0x2a3f78, modo: 'balanco' }
} as const;

/**
 * Moeda, troféu e baú como objetos com espessura, no mesmo motor dos selos.
 * A MOEDA dá a volta inteira (verso liso com estrela em relevo). TROFÉU e BAÚ são uma imagem só, com letras:
 * balançam de um lado para o outro mostrando a borda, sem virar de costas (a volta inteira pede modelo 3D).
 */
export function Premio3D({ tipo, tamanho = 160, modo, angulo }: { tipo: keyof typeof PREMIOS; tamanho?: number; modo?: Modo; angulo?: number }) {
  const p = PREMIOS[tipo];
  const g = geoPremio(p.arquivo);
  const montar = async (): Promise<Montada> => {
    const [f, v] = await Promise.all([carregarImagem(asset(`recompensas/${p.arquivo}.webp`)), carregarImagem(asset(`recompensas/${p.arquivo}-verso.webp`))]);
    if (!f) throw new Error('sem imagem');
    let verso: HTMLCanvasElement | HTMLImageElement = v ?? f;
    if (tipo === 'moeda' && v) {
      const c = novoCanvas(g.w * 2, g.h * 2);
      const x = c.getContext('2d');
      if (x) { x.drawImage(v, 0, 0, c.width, c.height); relevoEstrela(x, c.width * 0.5, c.height * 0.47, c.height * 0.2); verso = c; }
    }
    return { frente: f, peca: { frente: f, verso, contorno: g.contorno, proporcao: g.w / g.h, espessura: p.espessura, borda: p.borda } };
  };
  return <Objeto3D chave={tipo} montar={montar} proporcao={g.w / g.h} largura={tamanho} modo={modo ?? p.modo} angulo={angulo} rotulo={p.rotulo} className={`premio-${tipo}`} />;
}

/**
 * Selo 3D (padrão aprovado): base em render 3D no metal do nível, motivo no centro e o nome NEUTRO (D022) na faixa.
 * Parado é uma pintura leve (dezenas no Álbum); `ampliavel` abre o selo grande em 360°; `girar` já entra girando.
 */
export function Selo({ conquista, ganha, tamanho = 150, girar = false, letra, bloqueado = false, ampliavel = false }: { conquista: Conquista; ganha?: ConquistaGanha; tamanho?: number; girar?: boolean; letra?: string; bloqueado?: boolean; ampliavel?: boolean }) {
  const arte = arteDe(conquista, ganha, letra, bloqueado);
  const chave = chaveArte(arte);
  const g = geoSelo(arte.forma);
  const ref = useRef<HTMLCanvasElement>(null);
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    if (girar) return;
    let vivo = true;
    prepararSelo(arte).then((im) => {
      const canvas = ref.current;
      if (!vivo || !canvas) return;
      canvas.width = Math.round(tamanho * dpr());
      canvas.height = Math.round((canvas.width * g.h) / g.w);
      pintarFrente(canvas, arte, im);
      canvas.dataset.pintado = '1';
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tamanho, girar]);
  const mist = arte.motivo.tipo === 'misterio';
  const rotulo = `${mist ? 'Mistério' : conquista.nome}${bloqueado ? ' (ainda não conquistado)' : ''}`;
  const abrir = ampliavel ? () => setAberto(true) : undefined;
  return (
    <figure
      className={`selo selo-3d ${girar ? 'selo-gira' : ''} ${bloqueado ? 'selo-bloqueado' : ''} ${ampliavel ? 'selo-ampliavel' : ''}`}
      style={{ width: tamanho } as CSSProperties} data-conquista={conquista.id} data-forma={arte.forma} data-metal={bloqueado ? 'bloqueado' : arte.metal}
      {...(ampliavel ? { role: 'button', tabIndex: 0, onClick: abrir, onKeyDown: (e: { key: string; preventDefault: () => void }) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir?.(); } }, 'aria-label': `${rotulo}. Tocar para ver de perto e girar.` } : {})}
    >
      {girar
        ? <SeloGirando conquista={conquista} ganha={ganha} letra={letra} bloqueado={bloqueado} tamanho={tamanho} modo="entrada" />
        : <canvas ref={ref} style={{ aspectRatio: `${g.w} / ${g.h}` }} role="img" aria-label={rotulo} />}
      {tamanho <= 130 && !girar ? <figcaption className="selo-nome">{mist ? 'Mistério' : conquista.nome}</figcaption> : null}
      {aberto ? <SeloAmpliado conquista={conquista} ganha={ganha} letra={letra} bloqueado={bloqueado} aoFechar={() => setAberto(false)} /> : null}
    </figure>
  );
}

function tamanhoGrande(): number {
  if (typeof window === 'undefined') return 300;
  return Math.round(Math.max(170, Math.min(340, window.innerWidth * 0.62, window.innerHeight * 0.42)));
}

/** Selo aberto, grande, em 360°: nome, nível e como foi conquistado (Álbum / Minhas Conquistas / fim da fase). */
export function SeloAmpliado({ conquista, ganha, letra, bloqueado = false, aoFechar }: { conquista: Conquista; ganha?: ConquistaGanha; letra?: string; bloqueado?: boolean; aoFechar: () => void }) {
  const [tam] = useState(tamanhoGrande);
  const mist = bloqueado && conquista.visivel_antes === 'misterio';
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') aoFechar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aoFechar]);
  const nivel = ganha && NOME_NIVEL[ganha.nivel];
  return createPortal(
    <div className="selo-ampliado" role="dialog" aria-modal="true" aria-label={mist ? 'Mistério' : conquista.nome} data-testid="selo-ampliado" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) aoFechar(); }}>
      <div className="selo-ampliado-cartao">
        <div className="selo-ampliado-palco">
          <div className="selo-raios" aria-hidden="true" />
          <SeloGirando conquista={conquista} ganha={ganha} letra={letra} bloqueado={bloqueado} tamanho={tam} modo="auto" />
        </div>
        <p className="selo-ampliado-gire" aria-hidden="true">Arraste para girar</p>
        <h2 className="t">{mist ? 'Mistério' : conquista.nome}</h2>
        {bloqueado
          ? <p className="selo-ampliado-nivel bloqueado">Ainda não conquistado</p>
          : <p className={`selo-ampliado-nivel ${ganha?.nivel ?? 'unico'}`}>{nivel ? `Nível ${nivel}` : 'Conquistado'}{ganha ? ` · ${new Date(ganha.em).toLocaleDateString('pt-BR')}` : ''}</p>}
        <p className="selo-ampliado-como"><b>{bloqueado ? 'Como conquistar: ' : 'Como você conquistou: '}</b>{mist ? 'Continue a trilha para descobrir!' : conquista.dica}</p>
        <button className="btn grande ipe" onClick={aoFechar} data-testid="fechar-selo" autoFocus>Fechar</button>
      </div>
    </div>,
    document.body
  );
}

/**
 * Celebração do fim da fase: cada selo novo entra GRANDE, girando, um por vez; depois ficam lado a lado
 * (e cada um abre em 360° ao toque). Em "menos movimento" (e nos testes) já aparecem lado a lado.
 */
export function CelebracaoSelos({ itens, letra }: { itens: Array<{ conquista: Conquista; ganha: ConquistaGanha }>; letra?: string }) {
  const [semGiro] = useState(calmo);
  const [pousados, setPousados] = useState(semGiro ? itens.length : 0);
  const [tam] = useState(tamanhoGrande);
  const relogio = useRef<number | undefined>(undefined);
  const pousar = (i: number, espera: number) => {
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(() => setPousados((n) => Math.max(n, i + 1)), espera);
  };
  useEffect(() => {
    // rede de segurança: se o giro não puder rodar, o selo pousa assim mesmo
    if (pousados < itens.length) pousar(pousados, 12000);
    return () => window.clearTimeout(relogio.current);
  }, [pousados, itens.length]);
  const atual = pousados < itens.length ? itens[pousados] : null;
  // lado a lado: 1 selo bem grande, 2 grandes, 3–4 menores; sempre cabem dois por linha no celular
  const [lado] = useState(() => {
    const n = Math.min(itens.length, 2);
    const base = itens.length === 1 ? 200 : itens.length === 2 ? 170 : 132;
    const util = Math.min(typeof window === 'undefined' ? 560 : window.innerWidth - 96, 560);
    return Math.max(104, Math.min(base, Math.floor((util - 18 * (n - 1)) / n)));
  });
  return (
    <>
      <div className={`selos-linha selos-novos n${itens.length}`}>
        {itens.slice(0, pousados).map((it) => (
          <div key={it.conquista.id} className="selo-novo" data-testid="selo-novo">
            <Selo conquista={it.conquista} ganha={it.ganha} letra={letra} tamanho={lado} ampliavel />
          </div>
        ))}
      </div>
      {atual ? createPortal(
        <div className="selo-palco" data-testid="selo-palco" aria-hidden="true">
          <div className="selo-raios" />
          <SeloGirando key={atual.conquista.id} conquista={atual.conquista} ganha={atual.ganha} letra={letra} tamanho={tam} modo="entrada" aoAssentar={() => pousar(pousados, 1500)} />
        </div>,
        document.body
      ) : null}
    </>
  );
}

/** Cofrinho de porquinho (D029): balança em 3D com sombra; arrastar inclina. (É uma imagem só: ver nota no CSS.) */
export function Cofrinho({ saldo, animar = 0 }: { saldo: number; animar?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; g: number } | null>(null);
  const girar = (g: number | null) => {
    const el = ref.current;
    if (!el) return;
    if (g === null) { el.classList.remove('arrastando'); el.style.removeProperty('--giro'); } else { el.classList.add('arrastando'); el.style.setProperty('--giro', `${g.toFixed(1)}deg`); }
  };
  return (
    <div
      className="cofrinho cofrinho-3d" id="cofrinho" data-testid="cofrinho" ref={ref}
      onPointerDown={(e) => { arrasto.current = { x: e.clientX, g: 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético */ } }}
      onPointerMove={(e) => { const a = arrasto.current; if (a) girar(Math.max(-38, Math.min(38, (e.clientX - a.x) * 0.45))); }}
      onPointerUp={() => { arrasto.current = null; girar(null); }}
      onPointerCancel={() => { arrasto.current = null; girar(null); }}
    >
      <img className="cofre" src={asset('recompensas/cofrinho-porquinho.webp')} alt="Cofrinho de porquinho" draggable={false} />
      <b>{saldo}</b>
      {Array.from({ length: Math.min(animar, 12) }, (_, i) => (
        <img key={i} className="moeda-voando" style={{ animationDelay: `${i * 0.12}s` }} src={asset('recompensas/moeda.webp')} alt="" aria-hidden="true" />
      ))}
    </div>
  );
}

/** Termômetro 0–10 (D004). Para a criança: "aquecendo", sem número; para o adulto, com número. */
export function Termometro({ valor, comNumero = true }: { valor: number; comNumero?: boolean }) {
  return (
    <div className="termometro" role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={valor} aria-label="Termômetro da leitura">
      <div className="termo-escala">
        {Array.from({ length: 11 }, (_, i) => <span key={i} className={i <= valor ? 'cheio' : ''}>{comNumero ? i : ''}</span>)}
      </div>
      {comNumero ? <p><b>Nível {valor} de 10</b></p> : null}
    </div>
  );
}

/**
 * Barra do PRÓXIMO OBJETIVO (P1-b): mostra o objetivo de aprendizagem, não o prêmio.
 * 4–5 anos: bolinhas para preencher (no máximo 8 visíveis); a Sofia fala o número.
 */
export function BarraObjetivo({ nivel, objetivo, compacta = false }: { nivel: InfoNivel; objetivo?: string; compacta?: boolean }) {
  const total = Math.min(8, nivel.custoProximo || 1);
  const feitos = Math.round(((nivel.desafiosNoNivel || 0) / (nivel.custoProximo || 1)) * total);
  return (
    <div className={`barra-objetivo ${compacta ? 'compacta' : ''}`} data-testid="barra-objetivo">
      <div className="bo-titulo"><b>{nivel.nivel > 0 ? `Nível ${nivel.nivel}` : 'Começando'}</b>{nivel.titulo ? <span>{nivel.rotulo}</span> : null}</div>
      <div className="bo-bolinhas" aria-label={`Faltam ${nivel.faltam} desafios para o nível ${nivel.nivel + 1}`}>
        {Array.from({ length: total }, (_, i) => <i key={i} className={i < feitos ? 'cheia' : ''} />)}
      </div>
      {objetivo ? <p className="bo-obj">Próximo objetivo: <b>{objetivo}</b></p> : null}
      {nivel.portao && nivel.desafiosNoNivel + (nivel.estrelas ? nivel.custoProximo : 0) >= 0 && !compacta ? <p className="bo-portao">Rumo a um título novo: vencer <b>{nivel.portao.nome}</b></p> : null}
    </div>
  );
}
