import { useEffect, useRef, useState } from 'react';
import type { Fala } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { Rosto } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { asset, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { NOMES_PERSONAGEM, falarVarias, textoTela } from '../util.ts';

/**
 * "Assiste e Faz" (D015): vídeo curto da dupla SEMPRE seguido da atividade. Três formas:
 *  - `video`: clipe gravado (ex.: a música das vogais), tocado no próprio quadro;
 *  - `audio`: diálogo gravado nas vozes oficiais, sobre a arte da série;
 *  - só `roteiro`: as falas da dupla, uma a uma, com legenda.
 * Depois da mídia, o roteiro termina com "Agora é a sua vez, [NOME]!".
 */
export function AssisteEFaz({ roteiro, imagem, video, audio, crianca, onFim }: { roteiro: Fala[]; imagem?: string; video?: string; audio?: string; crianca: Crianca; onFim: () => void }) {
  const [i, setI] = useState(-1);
  const [acabou, setAcabou] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [precisaToque, setPrecisaToque] = useState(false);
  const rodando = useRef(false);
  const midia = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const temMidia = !!(video || audio);

  const falarRoteiro = async () => {
    if (rodando.current) return;
    rodando.current = true;
    await falarVarias(roteiro, crianca, setI);
    rodando.current = false;
    setAcabou(true);
  };
  const tocar = async () => {
    setAcabou(false);
    setI(-1);
    if (!temMidia || modoTeste()) return falarRoteiro();
    const m = midia.current;
    if (!m) return;
    voz.parar();
    m.currentTime = 0;
    try { await m.play(); setPrecisaToque(false); } catch { setPrecisaToque(true); }
  };
  useEffect(() => {
    tocar();
    return () => voz.parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fala = roteiro[Math.max(0, i)];
  const naMidia = temMidia && i < 0 && !acabou;
  const pct = temMidia ? (i >= 0 || acabou ? 100 : progresso * 100) : ((i + 1) / Math.max(1, roteiro.length)) * 100;
  const eventos = {
    onTimeUpdate: (e: React.SyntheticEvent<HTMLMediaElement>) => setProgresso(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0),
    onEnded: () => { falarRoteiro(); },
    onError: () => { falarRoteiro(); }
  };
  return (
    <div className="assiste">
      <div className="video" role="region" aria-label="Vídeo: Assiste e Faz">
        {video ? (
          <video ref={midia} className="video-clipe" src={asset(`video/${video}.mp4`)} poster={asset(`video/${video}.webp`)} playsInline preload="auto" {...eventos} />
        ) : (
          <img className={`video-fundo ${naMidia || i >= 0 ? 'movendo' : ''}`} src={asset(`fundos/${imagem ?? 'dupla-praca'}.webp`)} alt="" />
        )}
        {audio ? <audio ref={midia} src={asset(`audio/${audio}.mp3`)} preload="auto" {...eventos} /> : null}
        <span className="selo-assiste"><Icone nome="tocar" />Assiste e Faz</span>
        {precisaToque ? (
          <button className="video-tocar" onClick={tocar} aria-label="Tocar o vídeo"><Icone nome="play" /></button>
        ) : null}
        {!naMidia && fala ? (
          <div className="video-legenda vidro" aria-live="polite">
            <Rosto quem={fala.quem} tamanho={72} /><p><b>{NOMES_PERSONAGEM[fala.quem]}:</b> {textoTela(fala.texto, crianca)}</p>
          </div>
        ) : audio && naMidia ? (
          <div className="video-legenda vidro"><Rosto quem="sofia" tamanho={56} /><Rosto quem="tales" tamanho={56} /><p><b>Sofia e Tales</b> estão conversando. Escuta só!</p></div>
        ) : null}
        <div className="video-barra"><i style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="linha-botoes">
        <button className="btn vidro" onClick={tocar}><Icone nome="repetir" />Ver de novo</button>
        <button className="btn grande ipe" onClick={() => { voz.parar(); midia.current?.pause(); onFim(); }} data-testid="minha-vez" disabled={!acabou && i < roteiro.length - 1}>
          {textoTela('Agora é a minha vez!', crianca)}<Icone nome="seta" />
        </button>
      </div>
    </div>
  );
}
