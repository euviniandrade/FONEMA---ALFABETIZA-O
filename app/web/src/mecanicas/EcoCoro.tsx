/**
 * LEITURA EM ECO E EM CORO de frases decodificáveis JÁ ESTUDADAS (docs/pedagogia/04 N11; 02 FLU-TXT-01;
 * SOA p. 246–248; ABC p. 375–376; VT-1A p. 167).
 *  - Eco: a Sofia lê a frase com ritmo (cada palavra acende); depois a criança lê do mesmo jeito, com as palavras
 *    acendendo devagar, uma por uma.
 *  - Coro: a Sofia e a criança leem AO MESMO TEMPO, com as palavras acendendo no ritmo da Sofia.
 * É prática com modelo: o "Li!" é autorrelato e NÃO conta como domínio (regra 4); fica só no resumo para o adulto.
 */
import { useEffect, useRef, useState } from 'react';
import { FALAS_BIBLIOTECA as B } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { asset, espera, modoTeste } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { Progressinho } from './comum.tsx';
import { TextoTocavel, useFala } from './livre-comum.tsx';

export function EcoCoro({ frases, modo, crianca, onFim }: { frases: string[]; modo: 'eco' | 'coro'; crianca: Crianca; onFim: (r: { frases: number }) => void }) {
  const [i, setI] = useState(0);
  const frase = frases[i];
  const ws = frase.split(/\s+/);
  const { fala, diz } = useFala(crianca, modo === 'eco' ? B.ecoAbre : B.coroAbre);
  const [acesa, setAcesa] = useState(-1);
  const [vez, setVez] = useState<'dupla' | 'crianca' | 'feito'>('dupla');
  const [ocupado, setOcupado] = useState(true);
  const vivo = useRef(true);

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; voz.parar(); }; }, []);

  const acender = async (passo: (w: string) => number) => {
    for (let k = 0; k < ws.length && vivo.current; k++) { setAcesa(k); await espera(modoTeste() ? 5 : passo(ws[k])); }
    setAcesa(-1);
  };

  const rodar = async () => {
    setOcupado(true); setVez('dupla');
    if (modo === 'eco') {
      const lendo = voz.falar(frase, { quem: 'sofia' });
      await acender((w) => 260 + w.length * 70);
      await lendo;
      if (!vivo.current) return;
      setVez('crianca');
      await diz(B.ecoVez);
      await acender((w) => 700 + w.length * 140);
    } else {
      setVez('crianca');
      const lendo = voz.falar(frase, { quem: 'sofia' });
      await acender((w) => 380 + w.length * 110);
      await lendo;
    }
    setOcupado(false);
  };

  useEffect(() => {
    let vale = true;
    (async () => {
      if (i === 0) await diz(modo === 'eco' ? B.ecoAbre : B.coroAbre);
      if (vale) await rodar();
    })();
    return () => { vale = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const li = async () => {
    efeitos.acerto(); setOcupado(true); setVez('feito');
    await espera(modoTeste() ? 20 : 350);
    if (i + 1 < frases.length) setI(i + 1);
    else { await diz(B.ecoFim); onFim({ frases: frases.length }); }
  };

  return (
    <div className={`mec mec-eco modo-${modo}`} data-testid="eco-coro" data-modo={modo} data-vez={vez}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={frases.length} />
      <div className="eco-palco">
        <div className={`eco-vez ${vez}`} aria-hidden="true">
          <img src={asset("dupla/sofia-busto-alegre.webp")} alt="" className={vez === 'dupla' || modo === 'coro' ? 'lendo' : ''} />
          <span className="eco-seta"><Icone nome="seta" /></span>
          <span className={`eco-voce ${vez === 'crianca' ? 'lendo' : ''}`}><Icone nome="microfone" />Você</span>
        </div>
        <p className="eco-frase"><TextoTocavel texto={frase} acesa={acesa} desligado /></p>
        {vez === 'feito' ? <Brilho ativo /> : null}
      </div>
      <div className="linha-botoes centro">
        <button className="btn" onClick={() => void rodar()} disabled={ocupado}><Icone nome="repetir" />De novo</button>
        <button className="btn grande verde" onClick={() => void li()} disabled={ocupado} data-testid="eco-li"><Icone nome="check" />{modo === 'eco' ? 'Li!' : 'Li junto!'}</button>
      </div>
    </div>
  );
}
