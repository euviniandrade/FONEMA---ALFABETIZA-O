import { Icone } from '../componentes/ui.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LETRA_POR_ID, falaChave, pontosDoTraco, tracosDaLetra, type AtividadeTracar } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

const SOM: Record<string, string> = { A: 'aaa', E: 'ééé', I: 'iii', O: 'óóó', U: 'uuu', M: 'mmm', L: 'lll', F: 'fff' };

/** Lado do quadro da tela (o canvas do dedo) e do quadro dos dados (packages/conteudo/src/tracos.ts). */
const TELA = 360;
const K = TELA / 100;
/** Tolerância GENEROSA: o dedo vale se passar a até 15 unidades (15 % do quadro) do traço. */
const TOLERANCIA = 15;
/** O dedo pode "pular" até aqui para a frente no traço (curvas fechadas, dedo rápido). */
const JANELA = 26;
/** Cobertura (em qualquer ordem) que também libera o "Pronto": a criança nunca fica presa. */
const COBERTURA_LIVRE = 0.6;
const COR_FEITO = '#2E9E5B';
const COR_DEDO = '#A06A3B';

type Ponto = { x: number; y: number; s: number };
interface Traco { d: string; pts: Ponto[]; comp: number; ponto: boolean }

function prepara(letra: string): Traco[] {
  return (tracosDaLetra(letra) ?? []).map((t) => { const pts = pontosDoTraco(t.d, 2); return { d: t.d, pts, comp: pts[pts.length - 1].s, ponto: !!t.ponto }; });
}
/** Ponto e direção (graus) a uma distância `s` do começo do traço. */
function em(t: Traco, s: number): { x: number; y: number; ang: number } {
  const i = Math.min(t.pts.length - 2, Math.max(0, t.pts.findIndex((p) => p.s >= s) - 1));
  const a = t.pts[i], b = t.pts[i + 1] ?? a;
  const u = b.s > a.s ? Math.min(1, Math.max(0, (s - a.s) / (b.s - a.s))) : 0;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}
/** Onde ficam as setas de direção de um traço. */
function setas(t: Traco): number[] {
  if (t.ponto || t.comp < 14) return [];
  if (t.comp < 45) return [t.comp * 0.6];
  if (t.comp < 110) return [t.comp * 0.3, t.comp * 0.72];
  return [t.comp * 0.18, t.comp * 0.45, t.comp * 0.72];
}

/**
 * TRAÇAR com o dedo na areia (D029 §4): a letra é desenhada a partir dos dados de traços, com o PONTO DE INÍCIO
 * (bolinha verde pulsando), SETAS de direção e NÚMEROS da ordem. Antes da vez da criança, uma demonstração: um ponto
 * percorre os traços em ordem ("Ver de novo" repete). O traço da criança é conferido na ordem e na direção, com
 * tolerância generosa; cobrir bem a letra em qualquer ordem também libera o "Pronto" (ninguém fica preso).
 */
export function Tracar({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeTracar>) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(false);
  /** Traço da vez e quanto dele já foi percorrido. */
  const [vez, setVez] = useState(0);
  const [prog, setProg] = useState(0);
  const [cobertura, setCobertura] = useState(0);
  /** Demonstração: traço e distância do ponto animado (null = não está demonstrando). */
  const [demo, setDemo] = useState<{ traco: number; s: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const tocados = useRef(new Set<string>());
  const estado = useRef({ vez: 0, prog: 0 });
  const rodada = useRef(0);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const letra = atividade.letras[i];
  const tracos = useMemo(() => prepara(letra), [letra]);
  const totalPontos = useMemo(() => Math.max(1, tracos.reduce((n, t) => n + t.pts.length, 0)), [tracos]);
  const centro = useMemo(() => {
    const todos = tracos.flatMap((t) => t.pts);
    return todos.length ? { x: todos.reduce((s, p) => s + p.x, 0) / todos.length, y: todos.reduce((s, p) => s + p.y, 0) / todos.length } : { x: 50, y: 50 };
  }, [tracos]);
  /** Onde fica o número de cada traço: ao lado do comecinho, do lado de fora da letra, sem cobrir outro número. */
  const numeros = useMemo(() => {
    const postos: { x: number; y: number }[] = [];
    for (const t of tracos) {
      const opcoes: { x: number; y: number }[] = [];
      for (const s of [Math.min(7, t.comp / 2), Math.min(16, t.comp * 0.7), 0]) {
        const p = em(t, s);
        const rad = (p.ang * Math.PI) / 180;
        let nx = -Math.sin(rad), ny = Math.cos(rad);
        if ((p.x - centro.x) * nx + (p.y - centro.y) * ny < 0) { nx = -nx; ny = -ny; }
        for (const lado of [1, -1]) opcoes.push({ x: Math.min(94, Math.max(6, p.x + nx * lado * 10.5)), y: Math.min(94, Math.max(6, p.y + ny * lado * 10.5)) });
      }
      const livre = (o: { x: number; y: number }) => postos.every((q) => Math.hypot(q.x - o.x, q.y - o.y) >= 10.5);
      postos.push(opcoes.find(livre) ?? opcoes[0]);
    }
    return postos;
  }, [tracos, centro]);
  const completo = tracos.length > 0 && vez >= tracos.length;
  const liberado = completo || cobertura >= COBERTURA_LIVRE || (tracos.length === 0 && cobertura > 0);

  const limpar = () => {
    const c = canvas.current;
    if (c) c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    tocados.current = new Set();
    estado.current = { vez: 0, prog: 0 };
    setVez(0); setProg(0); setCobertura(0);
  };

  /** Demonstração animada: um ponto percorre cada traço, na ordem. */
  const demonstrar = async () => {
    const r = ++rodada.current;
    limpar();
    if (modoTeste() || !tracos.length) { setDemo(null); return; }
    for (let k = 0; k < tracos.length; k++) {
      const t = tracos[k];
      const dur = t.ponto ? 350 : Math.min(1900, 500 + t.comp * 13);
      const t0 = performance.now();
      await new Promise<void>((fim) => {
        const passo = () => {
          if (r !== rodada.current) return fim();
          const u = Math.min(1, (performance.now() - t0) / dur);
          setDemo({ traco: k, s: t.comp * u });
          if (u < 1) requestAnimationFrame(passo); else fim();
        };
        passo();
      });
      if (r !== rodada.current) return;
      await espera(260);
    }
    if (r === rodada.current) setDemo(null);
  };

  useEffect(() => {
    setOk(false);
    let vivo = true;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (vivo) await demonstrar();
    })();
    return () => { vivo = false; rodada.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const ponto = (e: React.PointerEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height];
  };

  const marcar = (px: number, py: number) => {
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = COR_DEDO;
    ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2); ctx.fill();
    const x = px / K, y = py / K;
    // cobertura livre: quantos pontos da letra o dedo já tocou (em qualquer ordem)
    tracos.forEach((t, k) => t.pts.forEach((p, j) => { if (Math.hypot(p.x - x, p.y - y) <= TOLERANCIA * 0.8) tocados.current.add(`${k}:${j}`); }));
    setCobertura(Math.min(1, tocados.current.size / totalPontos));
    // ordem e direção: o dedo só avança o traço da vez, do começo para o fim
    const st = estado.current;
    const t = tracos[st.vez];
    if (!t) return;
    // o traço só começa na bolinha verde (perto do ponto de início); depois, só anda para a frente
    const noInicio = Math.hypot(t.pts[0].x - x, t.pts[0].y - y) <= TOLERANCIA;
    if (st.prog === 0 && !noInicio) return;
    let novo = Math.max(st.prog, 0.01);
    for (const p of t.pts) {
      if (p.s < st.prog) continue;
      if (p.s > st.prog + JANELA) break;
      if (Math.hypot(p.x - x, p.y - y) <= TOLERANCIA) novo = Math.max(novo, p.s);
    }
    const fim = t.ponto ? 0 : t.comp - 5;
    if (novo >= fim && (t.ponto ? noInicio : true)) {
      estado.current = { vez: st.vez + 1, prog: 0 };
      setVez(st.vez + 1); setProg(0);
      efeitos.toque();
    } else if (novo > st.prog) {
      estado.current = { vez: st.vez, prog: novo };
      setProg(novo);
    }
  };

  const terminar = async () => {
    setOk(true);
    efeitos.acerto();
    tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, 0));
    // Trilha do Alfabeto: o SOM REAL da letra e depois "B, de bola." na voz de quem apresentou a letra (D029 §2)
    const al = atividade.habilidade.startsWith('letra-') ? LETRA_POR_ID[letra.toUpperCase()] : undefined;
    if (al) {
      if (al.fonema) await voz.somReal(al.fonema, 1);
      await voz.falar(falaChave(al), { quem: al.voz });
    } else await voz.falar(SOM[letra] ?? letra, { quem: 'tales' });
    await espera(400);
    if (i + 1 < atividade.letras.length) setI(i + 1);
    else onFim({ tentativas: tents.current, tentouDeNovo: 0, extras: { tracados: atividade.letras.length } });
  };

  const demonstrando = demo !== null;
  const atual = demonstrando ? demo!.traco : vez;
  const pontoDemo = demonstrando ? em(tracos[demo!.traco], demo!.s) : null;
  // roteiro para testes automáticos (E2E): os pontos de cada traço, na ordem, em fração do quadro
  const roteiro = useMemo(() => JSON.stringify(tracos.map((t) => t.pts.filter((_, j) => j % 3 === 0 || j === t.pts.length - 1).map((p) => [Math.round(p.x) / 100, Math.round(p.y) / 100]))), [tracos]);

  return (
    <div className="mec mec-tracar">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.letras.length} />
      <div className={`areia ${demonstrando ? 'demonstrando' : ''}`} data-letra={letra} data-tracos={tracos.length} data-vez={vez} data-roteiro={roteiro} data-testid="areia">
        {tracos.length ? (
          <svg className="tracado" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <marker id="ponta-seta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9 Z" fill="currentColor" /></marker>
            </defs>
            {/* corpo da letra (guia) */}
            {tracos.map((t, k) => <path key={`g${k}`} className="tracado-guia" d={t.d} />)}
            {tracos.map((t, k) => <path key={`l${k}`} className="tracado-linha" d={t.d} />)}
            {/* traços já feitos (verde) e o pedaço percorrido do traço da vez */}
            {tracos.map((t, k) => {
              const feito = demonstrando ? (k < demo!.traco ? t.comp : k === demo!.traco ? demo!.s : 0) : k < vez ? t.comp : k === vez ? prog : 0;
              if (feito <= 0 && !(t.ponto && (demonstrando ? k < demo!.traco : k < vez))) return null;
              return <path key={`f${k}`} className="tracado-feito" d={t.d} stroke={demonstrando ? '#2E7FD0' : COR_FEITO} strokeDasharray={`${Math.max(feito, 0.01)} 1000`} />;
            })}
            {/* setas de direção: fortes no traço da vez, fracas nos outros */}
            {tracos.map((t, k) => setas(t).map((s, j) => {
              const p = em(t, s);
              return <path key={`s${k}-${j}`} className={`tracado-seta ${k === atual ? 'da-vez' : ''} ${k < atual ? 'feita' : ''}`} d="M-3.4,-2.6 L2.6,0 L-3.4,2.6 Z" transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.ang.toFixed(0)})`} />;
            }))}
            {/* números da ordem, ao lado do começo de cada traço */}
            {tracos.map((_t, k) => {
              const { x, y } = numeros[k];
              return (
                <g key={`n${k}`} className={`tracado-numero ${k === atual ? 'da-vez' : ''} ${k < atual ? 'feito' : ''}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                  <circle r="4.6" /><text y="1.9" textAnchor="middle">{k + 1}</text>
                </g>
              );
            })}
            {/* ponto de início do traço da vez: bolinha verde pulsando */}
            {!demonstrando && !completo && tracos[vez] ? (
              <g className="tracado-inicio" transform={`translate(${em(tracos[vez], prog).x.toFixed(1)} ${em(tracos[vez], prog).y.toFixed(1)})`} data-testid="inicio-do-traco">
                <circle className="onda" r="4" /><circle className="miolo" r="3.6" />
              </g>
            ) : null}
            {pontoDemo ? <circle className="tracado-demo" cx={pontoDemo.x} cy={pontoDemo.y} r="4.4" /> : null}
          </svg>
        ) : <span className={`letra-guia ${letra !== letra.toUpperCase() ? 'minuscula' : ''}`} aria-hidden="true">{letra}</span>}
        <canvas
          ref={canvas}
          width={TELA}
          height={TELA}
          aria-label={`Desenhe a letra ${letra}`}
          onPointerDown={(e) => { if (demonstrando) return; desenhando.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); const [x, y] = ponto(e); marcar(x, y); }}
          onPointerMove={(e) => { if (desenhando.current && !demonstrando) { const [x, y] = ponto(e); marcar(x, y); } }}
          onPointerUp={() => (desenhando.current = false)}
          onPointerCancel={() => (desenhando.current = false)}
        />
        {ok ? <Brilho ativo /> : null}
      </div>
      <div className="linha-botoes">
        <button className="btn" onClick={demonstrar} disabled={ok} data-testid="ver-de-novo"><Icone nome="repetir" />Ver de novo</button>
        <button className="btn" onClick={() => { rodada.current++; setDemo(null); limpar(); }} disabled={ok}><Icone nome="apagar" />Apagar</button>
        <button className="btn grande verde" onClick={terminar} disabled={ok || demonstrando || !liberado} data-testid="tracei"><Icone nome="check" />Pronto, desenhei!</button>
      </div>
      <p className="nota-mic" data-testid="dica-tracado">
        {demonstrando ? 'Olhe o caminho: o ponto mostra por onde o dedo vai.'
          : completo ? 'Muito bem! Pode tocar em "Pronto".'
            : tracos.length ? `Comece na bolinha verde e siga as setas. Traço ${Math.min(vez + 1, tracos.length)} de ${tracos.length}.`
              : 'Desenhe por cima da letra.'}
      </p>
    </div>
  );
}
