import { useEffect, useRef, useState } from 'react';
import type { AtividadeDitado } from '@fonema/conteudo';
import { Balao, BotaoOuvir } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

/** DITADO com letras móveis: "Assim você escreveu / assim os adultos escrevem" — sem vermelho. */
export function Ditado({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeDitado>) {
  const [i, setI] = useState(0);
  const [escrito, setEscrito] = useState<string[]>([]);
  const [conferido, setConferido] = useState<null | boolean>(null);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const palavra = atividade.palavras[i].toUpperCase();

  useEffect(() => {
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      await voz.falar(palavra.toLowerCase(), { quem: 'sofia', rate: 0.8 });
    })();
    setEscrito([]); setConferido(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const conferir = async () => {
    const certo = escrito.join('') === palavra;
    setConferido(certo);
    tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, certo ? 0 : 1));
    if (certo) { efeitos.acerto(); await voz.falar(`Você escreveu ${palavra.toLowerCase()}! Letra por letra.`, { quem: 'sofia' }); }
    else await voz.falar('Olha: assim você escreveu, e assim os adultos escrevem. Repara na diferença.', { quem: 'sofia' });
  };
  const seguir = async () => {
    await espera(200);
    if (i + 1 < atividade.palavras.length) setI(i + 1);
    else onFim({ tentativas: tents.current, tentouDeNovo: 0, extras: { palavras: tents.current.filter((t) => t.acertou).length } });
  };

  return (
    <div className="mec mec-ditado">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.palavras.length} />
      <div className="pergunta"><BotaoOuvir onClick={() => voz.falar(palavra.toLowerCase(), { quem: 'sofia', rate: 0.75 })} rotulo="Ouvir a palavra" /><span className="dica-ouvir">Escuta a palavra e escreve</span></div>
      <div className="espacos">
        {escrito.map((l, k) => <span key={k} className="espaco cheio">{l}</span>)}
        <span className="espaco cursor" />
      </div>
      {conferido === null ? (
        <>
          <div className="pecas teclado" role="group" aria-label="Letras">
            {atividade.letras.map((l) => <button key={l} className="peca" onClick={() => { efeitos.toque(); setEscrito((e) => [...e, l]); }} data-peca={l}>{l}</button>)}
          </div>
          <div className="linha-botoes">
            <button className="btn" onClick={() => setEscrito((e) => e.slice(0, -1))} disabled={!escrito.length}>⌫ Apagar</button>
            <button className="btn grande verde" onClick={conferir} disabled={!escrito.length} data-testid="conferir-ditado">Pronto!</button>
          </div>
        </>
      ) : (
        <div className="comparar">
          <div><small>Assim você escreveu</small><b>{escrito.join('')}</b></div>
          <div><small>Assim os adultos escrevem</small><b>{palavra}</b></div>
          <button className="btn grande ipe" onClick={seguir} data-testid="seguir-ditado">Continuar →</button>
        </div>
      )}
    </div>
  );
}
