import { Icone } from '../componentes/ui.tsx';
import { useEffect, useRef, useState } from 'react';
import type { Fala } from '@fonema/conteudo';
import type { Crianca } from '@fonema/motor';
import { Rosto } from '../componentes/basicos.tsx';
import { asset } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { NOMES_PERSONAGEM, falarVarias, textoTela } from '../util.ts';

/**
 * "Assiste e Faz" (D015): vídeo curto da dupla em diálogo (aqui, animação com as artes da série + vozes),
 * SEMPRE seguido da atividade. Termina com "Agora é a sua vez, [NOME]!".
 */
export function AssisteEFaz({ roteiro, imagem, crianca, onFim }: { roteiro: Fala[]; imagem?: string; crianca: Crianca; onFim: () => void }) {
  const [i, setI] = useState(-1);
  const [acabou, setAcabou] = useState(false);
  const rodando = useRef(false);

  const tocar = async () => {
    if (rodando.current) return;
    rodando.current = true;
    setAcabou(false);
    await falarVarias(roteiro, crianca, setI);
    rodando.current = false;
    setAcabou(true);
  };
  useEffect(() => {
    tocar();
    return () => voz.parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fala = roteiro[Math.max(0, i)];
  return (
    <div className="assiste">
      <div className="video" role="region" aria-label="Vídeo: Assiste e Faz">
        <img className="video-fundo" src={asset(`fundos/${imagem ?? 'dupla-praca'}.webp`)} alt="" />
        <span className="selo-assiste"><Icone nome="tocar" />Assiste e Faz</span>
        <div className="video-legenda vidro" aria-live="polite">
          {fala ? <><Rosto quem={fala.quem} tamanho={72} /><p><b>{NOMES_PERSONAGEM[fala.quem]}:</b> {textoTela(fala.texto, crianca)}</p></> : null}
        </div>
        <div className="video-barra"><i style={{ width: `${((i + 1) / roteiro.length) * 100}%` }} /></div>
      </div>
      <div className="linha-botoes">
        <button className="btn vidro" onClick={tocar}><Icone nome="repetir" />Ver de novo</button>
        <button className="btn grande ipe" onClick={() => { voz.parar(); onFim(); }} data-testid="minha-vez" disabled={!acabou && i < roteiro.length - 1}>
          {textoTela('Agora é a minha vez!', crianca)}<Icone nome="seta" />
        </button>
      </div>
    </div>
  );
}
