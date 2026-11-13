import { Figura, Icone } from '../componentes/ui.tsx';
import { useEffect, useRef, useState } from 'react';
import type { AtividadePausa } from '@fonema/conteudo';
import { Balao } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar } from '../util.ts';
import type { PropsMecanica } from './comum.tsx';

/** C6 · Pausa ativa (≤ 60 s): mexer o corpo no som-alvo. Opção sentada: tocar o botão. Sem acerto/erro. */
export function Pausa({ atividade, crianca, onFim }: PropsMecanica<AtividadePausa>) {
  const [k, setK] = useState(-1);
  const [estrelas, setEstrelas] = useState(0);
  const [fim, setFim] = useState(false);
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    (async () => {
      await falar(atividade.enunciado, crianca);
      if (!atividade.sequencia.length) {
        for (let r = 0; r < 3 && vivo.current; r++) { setK(r); await voz.falar(r % 2 ? 'Solta devagar…' : 'Enche o peito de ar…', { quem: 'sofia', rate: 0.8 }); await espera(1200); }
      }
      for (let n = 0; n < atividade.sequencia.length && vivo.current; n++) {
        setK(n);
        await voz.falar(atividade.sequencia[n].falar, { quem: 'tales' });
        await espera(1300);
      }
      if (vivo.current) setFim(true);
    })();
    return () => { vivo.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atual = atividade.sequencia[k];
  const mexer = () => {
    if (atual?.alvo) { efeitos.acerto(); setEstrelas((e) => e + 1); }
    else efeitos.toque();
  };
  return (
    <div className="mec mec-pausa">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <div className={`pausa-palco ${atividade.sequencia.length ? '' : 'respira'}`}>
        {atividade.sequencia.length ? <div className="pausa-palavra" aria-live="polite">{atual ? <><Icone nome="som" />{atual.falar}</> : '…'}</div> : <div className="respira-bola" aria-hidden="true" />}
        <div className="pausa-estrelas" aria-label={`${estrelas} estrelas`}>{Array.from({ length: Math.min(estrelas, 12) }, (_, i) => <Icone key={i} nome="estrela" />)}</div>
      </div>
      <div className="linha-botoes">
        {atividade.sequencia.length ? <button className="btn grande ipe" onClick={mexer}><Figura className="" palavra="ginga" />{atividade.acao}!</button> : null}
        <button className="btn grande verde" onClick={() => { vivo.current = false; voz.parar(); onFim({ tentativas: [], tentouDeNovo: 0 }); }} data-testid="pausa-pronto">
          {fim ? 'Pronto! Vamos continuar' : 'Pular a pausa'}<Icone nome="seta" />
        </button>
      </div>
      <p className="nota-mic">Pode fazer sentadinho também: é só tocar no botão.</p>
    </div>
  );
}
