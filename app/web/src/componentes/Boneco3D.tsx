import { useEffect, useRef, useState } from 'react';
import { COR_MASSINHA, COR_ROUPA_BASE, carregarMotor, chaveAparencia, miniaturaGuardada, pedirMiniatura, temWebGL, type Aparencia, type Palco } from '../avatar3d/index.ts';
import { useApp } from '../contexto.tsx';
import { Icone } from './ui.tsx';
import '../estilos-avatar.css';

/**
 * Reserva 2D (SVG) do boneco: aparece só quando o aparelho não tem WebGL ou enquanto a imagem 3D não chegou.
 * Usa os mesmos dados (pele, cabelo, olhos, roupas): a criança continua se reconhecendo.
 */
export function Boneco2D({ aparencia: a, tipo = 'busto', className = '' }: { aparencia: Aparencia; tipo?: 'busto' | 'corpo'; className?: string }) {
  const pele = a.pele ?? COR_MASSINHA;
  const cab = a.cabelo?.cor ?? 'none';
  const m = a.cabelo?.modelo ?? '';
  const volumoso = /black-power|cacheado/.test(m);
  const longo = /liso-longo|ondulado$|trancas|cacheado$/.test(m);
  const camisa = a.camisa?.cor ?? COR_ROUPA_BASE, manga = a.camisa?.id === 'uniforme' ? a.camisa.cor2 : camisa;
  const calca = a.calca?.cor ?? COR_ROUPA_BASE, sapato = a.calcado?.cor ?? pele;
  const corpo = tipo === 'corpo';
  return (
    <svg className={`boneco2d ${className}`} viewBox={corpo ? '0 0 100 150' : '8 2 84 84'} role="img" aria-hidden="true">
      {a.cabelo && longo ? <path d="M22 40 Q20 12 50 10 Q80 12 78 40 L80 78 Q50 86 20 78 Z" fill={cab} /> : null}
      {a.cabelo && volumoso ? <circle cx="50" cy="30" r="33" fill={cab} /> : null}
      {a.cabelo && m === 'coque' ? <circle cx="50" cy="6" r="9" fill={cab} /> : null}
      {a.cabelo && m === 'maria-chiquinha' ? <><ellipse cx="17" cy="42" rx="7" ry="13" fill={cab} /><ellipse cx="83" cy="42" rx="7" ry="13" fill={cab} /></> : null}
      {corpo ? (
        <>
          <rect x="36" y="104" width="12" height="34" rx="6" fill={a.calca?.modelo === 'bermuda' || a.calca?.modelo === 'saia' || !a.calca ? pele : calca} />
          <rect x="52" y="104" width="12" height="34" rx="6" fill={a.calca?.modelo === 'bermuda' || a.calca?.modelo === 'saia' || !a.calca ? pele : calca} />
          <path d={a.calca?.modelo === 'saia' ? 'M33 98 H67 L74 122 H26 Z' : 'M33 96 H67 V116 H33 Z'} fill={calca} />
          <ellipse cx="41" cy="141" rx="9" ry="6" fill={sapato} /><ellipse cx="59" cy="141" rx="9" ry="6" fill={sapato} />
          <rect x="20" y="70" width="11" height="34" rx="5.5" fill={pele} /><rect x="69" y="70" width="11" height="34" rx="5.5" fill={pele} />
        </>
      ) : null}
      <rect x="44" y="56" width="12" height="12" fill={pele} />
      <path d={corpo ? 'M30 68 Q50 62 70 68 L69 102 H31 Z' : 'M22 86 Q22 66 40 64 H60 Q78 66 78 86 Z'} fill={camisa} />
      {corpo ? <><rect x="19" y="68" width="13" height="16" rx="6" fill={manga} /><rect x="68" y="68" width="13" height="16" rx="6" fill={manga} /></> : null}
      <ellipse cx="50" cy="36" rx="25" ry="24" fill={pele} />
      <ellipse cx="25" cy="38" rx="3.2" ry="5" fill={pele} /><ellipse cx="75" cy="38" rx="3.2" ry="5" fill={pele} />
      {a.cabelo && !volumoso ? <path d="M24 34 Q22 10 50 9 Q78 10 76 34 Q66 20 50 20 Q34 20 24 34 Z" fill={cab} /> : null}
      {a.cabelo && volumoso ? <path d="M24 30 Q30 12 50 12 Q70 12 76 30 Q62 22 50 22 Q38 22 24 30 Z" fill={cab} /> : null}
      {a.olhos ? (
        <>
          <ellipse cx="40" cy="38" rx="5.6" ry="6.4" fill="#fff" /><ellipse cx="60" cy="38" rx="5.6" ry="6.4" fill="#fff" />
          <circle cx="40.5" cy="38.6" r="3.9" fill={a.olhos} /><circle cx="59.5" cy="38.6" r="3.9" fill={a.olhos} />
          <circle cx="40.5" cy="38.6" r="1.9" fill="#0B0806" /><circle cx="59.5" cy="38.6" r="1.9" fill="#0B0806" />
          <circle cx="42" cy="37" r="1.1" fill="#fff" /><circle cx="61" cy="37" r="1.1" fill="#fff" />
        </>
      ) : <path d="M35 39 Q40 43 45 39 M55 39 Q60 43 65 39" fill="none" stroke="#3b2a22" strokeWidth="1.6" strokeLinecap="round" />}
      <path d="M42 49 Q50 55 58 49" fill="none" stroke="#7a2e2a" strokeWidth="1.8" strokeLinecap="round" />
      {a.acessibilidade.includes('oculos') ? <g fill="none" stroke="#1F3A6E" strokeWidth="1.8"><circle cx="40" cy="38" r="8" /><circle cx="60" cy="38" r="8" /><path d="M48 38 H52" /></g> : null}
      {a.acessibilidade.includes('pintura-no-rosto') ? <path d="M27 45 H34 M27 48.5 H34 M66 45 H73 M66 48.5 H73" stroke="#B5432A" strokeWidth="1.6" strokeLinecap="round" /> : null}
    </svg>
  );
}

/** Imagem do boneco desenhada em 3D fora da tela (um só contexto WebGL para todas), com cache. */
export function useMiniatura(aparencia: Aparencia, tipo: 'busto' | 'corpo' = 'busto', largura = 256, altura?: number): string | null | undefined {
  const chave = `${tipo}|${largura}|${altura ?? ''}|${chaveAparencia(aparencia)}`;
  const [estado, setEstado] = useState<{ chave: string; url: string | null | undefined }>(() => ({ chave, url: miniaturaGuardada(aparencia, tipo) }));
  const ref = useRef(aparencia);
  ref.current = aparencia;
  useEffect(() => {
    let vivo = true;
    const pedido = pedirMiniatura(ref.current, tipo, largura, altura);
    pedido.imagem.then((url) => { if (vivo && url !== undefined) setEstado({ chave, url }); });
    return () => { vivo = false; pedido.desistir(); };
  }, [chave, tipo, largura, altura]);
  return estado.chave === chave ? estado.url : miniaturaGuardada(aparencia, tipo);
}

/** Retrato parado do boneco (miniaturas, cartões, álbum, opções da montagem). */
export function RetratoBoneco({ aparencia, tipo = 'busto', largura = 256, altura, alt = '', className = '' }: { aparencia: Aparencia; tipo?: 'busto' | 'corpo'; largura?: number; altura?: number; alt?: string; className?: string }) {
  const url = useMiniatura(aparencia, tipo, largura, altura);
  if (url) return <img className={`retrato-boneco ${className}`} src={url} alt={alt} draggable={false} data-retrato="3d" />;
  // null = sem WebGL (reserva definitiva); undefined = ainda desenhando (reserva por um instante)
  return <span className={`retrato-boneco retrato-2d ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} data-retrato={url === null ? '2d' : 'espera'}><Boneco2D aparencia={aparencia} tipo={tipo} /></span>;
}

/**
 * O boneco 3D de verdade: arraste para girar 360° (ou use as setas). Um único canvas; pausa fora da tela;
 * em "menos movimento" fica parado e só redesenha quando gira ou troca de peça. Sem WebGL, mostra a reserva 2D.
 */
export function Boneco3D({ aparencia, nome, className = '', girar = true }: { aparencia: Aparencia; nome?: string; className?: string; girar?: boolean }) {
  const { prefs } = useApp();
  const canvas = useRef<HTMLCanvasElement>(null);
  const palco = useRef<Palco | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'sem3d'>(() => (temWebGL() ? 'carregando' : 'sem3d'));
  const menos = prefs.menosMovimento || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const atual = useRef(aparencia);
  atual.current = aparencia;
  const menosRef = useRef(menos);
  menosRef.current = menos;

  useEffect(() => {
    if (!temWebGL()) return;
    let vivo = true;
    let p: Palco | null = null;
    carregarMotor().then(async (m) => {
      if (!vivo || !canvas.current) return;
      p = new m.Palco(canvas.current, { menosMovimento: menosRef.current });
      p.aoPerderContexto = () => setEstado('sem3d');
      palco.current = p;
      (canvas.current as HTMLCanvasElement & { palco?: Palco }).palco = p; // para os testes e capturas
      await p.mostrar(atual.current);
      if (vivo) setEstado('pronto');
    }).catch((e) => { console.warn('[avatar3d] sem 3D neste aparelho; uso a reserva 2D.', e); if (vivo) setEstado('sem3d'); });
    return () => { vivo = false; p?.descartar(); palco.current = null; };
  }, []);

  const chave = chaveAparencia(aparencia);
  useEffect(() => { palco.current?.mostrar(atual.current); }, [chave]);
  useEffect(() => { palco.current?.definirMenosMovimento(menos); }, [menos]);

  const descricao = nome ? `Boneco de ${nome}, em 3D. Arraste para girar.` : 'Boneco em 3D. Arraste para girar.';
  return (
    <div className={`boneco3d ${className}`} data-estado={estado} data-testid="boneco3d">
      <div className="boneco3d-chao" aria-hidden="true" />
      {estado === 'sem3d' ? <Boneco2D aparencia={aparencia} tipo="corpo" className="boneco3d-reserva" /> : (
        <canvas
          ref={canvas} className="boneco3d-canvas" role="img" aria-label={descricao} tabIndex={girar ? 0 : -1}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') palco.current?.girar(-0.0625); if (e.key === 'ArrowRight') palco.current?.girar(0.0625); }}
        />
      )}
      {estado === 'carregando' ? <span className="boneco3d-espera" aria-hidden="true"><Boneco2D aparencia={aparencia} tipo="corpo" /></span> : null}
      {girar && estado !== 'sem3d' ? (
        <div className="boneco3d-giro">
          <button type="button" className="hud-btn" aria-label="Girar para a esquerda" onClick={() => palco.current?.girar(-0.125)} data-testid="girar-esq"><Icone nome="voltar" /></button>
          <small>Arraste para girar</small>
          <button type="button" className="hud-btn espelhado" aria-label="Girar para a direita" onClick={() => palco.current?.girar(0.125)} data-testid="girar-dir"><Icone nome="voltar" /></button>
        </div>
      ) : null}
    </div>
  );
}
