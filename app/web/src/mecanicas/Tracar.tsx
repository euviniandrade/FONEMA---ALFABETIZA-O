import { useEffect, useRef, useState } from 'react';
import type { AtividadeTracar } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

const SOM: Record<string, string> = { A: 'aaa', E: 'ééé', I: 'iii', O: 'óóó', U: 'uuu', M: 'mmm', L: 'lll', F: 'fff' };

/** TRAÇAR com o dedo na areia: guia visual retirável; aceita quando o traço cobre boa parte da letra. */
export function Tracar({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeTracar>) {
  const [i, setI] = useState(0);
  const [cobertura, setCobertura] = useState(0);
  const [ok, setOk] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const guia = useRef<ImageData | null>(null);
  const tocados = useRef(new Set<number>());
  const totalGuia = useRef(1);
  const desenhando = useRef(false);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const letra = atividade.letras[i];

  useEffect(() => {
    if (i === 0) falar(atividade.enunciado, crianca);
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    // máscara da letra (fora da tela) para medir a cobertura
    const m = document.createElement('canvas');
    m.width = c.width; m.height = c.height;
    const mc = m.getContext('2d')!;
    mc.font = `700 ${c.height * 0.85}px Andika, sans-serif`;
    mc.textAlign = 'center'; mc.textBaseline = 'middle';
    mc.fillText(letra, c.width / 2, c.height * 0.55);
    guia.current = mc.getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let k = 3; k < guia.current.data.length; k += 4 * 64) if (guia.current.data[k] > 0) n++;
    totalGuia.current = Math.max(1, n);
    tocados.current = new Set();
    setCobertura(0); setOk(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const ponto = (e: React.PointerEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height];
  };
  const marcar = (x: number, y: number) => {
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#A06A3B';
    ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    const g = guia.current;
    if (!g) return;
    for (let dy = -16; dy <= 16; dy += 4) for (let dx = -16; dx <= 16; dx += 4) {
      const px = Math.round(x + dx), py = Math.round(y + dy);
      if (px < 0 || py < 0 || px >= c.width || py >= c.height) continue;
      const k = (py * c.width + px) * 4 + 3;
      if (g.data[k] > 0 && (k - 3) % (4 * 64) === 0) tocados.current.add(k);
    }
    setCobertura(Math.min(1, tocados.current.size / totalGuia.current));
  };

  const terminar = async () => {
    setOk(true);
    efeitos.acerto();
    tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, 0));
    await voz.falar(`${letra}! ${SOM[letra] ?? ''}`, { quem: 'tales' });
    await espera(400);
    if (i + 1 < atividade.letras.length) setI(i + 1);
    else onFim({ tentativas: tents.current, tentouDeNovo: 0, extras: { tracados: atividade.letras.length } });
  };

  return (
    <div className="mec mec-tracar">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.letras.length} />
      <div className="areia">
        <span className="letra-guia" aria-hidden="true">{letra}</span>
        <canvas
          ref={canvas}
          width={360}
          height={360}
          aria-label={`Desenhe a letra ${letra}`}
          onPointerDown={(e) => { desenhando.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); const [x, y] = ponto(e); marcar(x, y); }}
          onPointerMove={(e) => { if (desenhando.current) { const [x, y] = ponto(e); marcar(x, y); } }}
          onPointerUp={() => (desenhando.current = false)}
        />
        {ok ? <Brilho ativo /> : null}
      </div>
      <div className="linha-botoes">
        <button className="btn" onClick={() => { const c = canvas.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); tocados.current = new Set(); setCobertura(0); }}>↺ Apagar</button>
        <button className="btn grande verde" onClick={terminar} disabled={ok || cobertura < 0.35} data-testid="tracei">✋ Pronto, desenhei!</button>
      </div>
      <p className="nota-mic">Desenhe por cima da letra. {cobertura < 0.35 ? 'Continue o traço…' : 'Muito bem! Pode tocar em "Pronto".'}</p>
    </div>
  );
}
