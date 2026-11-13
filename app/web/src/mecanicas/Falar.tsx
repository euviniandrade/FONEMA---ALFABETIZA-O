import { useEffect, useRef, useState } from 'react';
import { FALAS, type AtividadeFalar } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { escutar, temReconhecimento } from '../servicos/microfone.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

/**
 * FALAR / LER-VOZ. O reconhecimento de fala é SINAL, nunca juiz: o botão "Eu falei!" está sempre ali.
 * A voz da dupla só lê DEPOIS da tentativa (áudio nunca dispara antes).
 */
export function Falar({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeFalar>) {
  const [i, setI] = useState(0);
  const [ouvindo, setOuvindo] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const ajudou = useRef(false);
  const incertos = useRef(0);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const item = atividade.itens[i];

  useEffect(() => {
    if (i === 0) falar(atividade.enunciado, crianca);
    setOk(false); setMsg(null); ajudou.current = false; incertos.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const concluir = async () => {
    setOk(true);
    efeitos.acerto();
    tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, ajudou.current ? 1 : 0, { pseudo: item.pseudo }));
    await voz.falar(textoVoz(FALAS.euFalei, crianca), { quem: 'sofia' });
    await voz.falar(item.falar, { quem: 'sofia', rate: 0.8 });
    if (atividade.comemora && i === atividade.itens.length - 1) await falar(atividade.comemora, crianca);
    await espera(500);
    if (i + 1 < atividade.itens.length) setI(i + 1);
    else onFim({ tentativas: tents.current, tentouDeNovo: 0 });
  };

  const microfone = async () => {
    setOuvindo(true);
    setMsg('Estou ouvindo…');
    const ouvido = await escutar(3500);
    setOuvindo(false);
    const alvo = item.falar.replace(/(.)\1+/g, '$1').toLowerCase();
    if (ouvido && ouvido.toLowerCase().includes(alvo.slice(0, 3))) {
      setMsg('Ouvi você!');
      return concluir();
    }
    incertos.current++;
    setMsg(incertos.current >= 2 ? 'Tudo bem! Toque em "Eu falei!".' : FALAS.naoOuvi);
    await voz.falar(incertos.current >= 2 ? 'Tudo bem! Toque em eu falei.' : FALAS.naoOuvi, { quem: 'sofia' });
  };

  const ajuda = async () => {
    ajudou.current = true;
    await voz.falar('Olha minha boca e escuta:', { quem: 'sofia' });
    await voz.falar(item.falar, { quem: 'sofia', rate: 0.7 });
  };

  return (
    <div className="mec mec-falar">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.itens.length} />
      <div className={`cartao-leitura ${item.pseudo ? 'pseudo' : ''}`}>
        {item.figura ? <span className="fig" aria-hidden="true">{item.figura}</span> : null}
        <span className="palavra-grande" data-testid="palavra-falar">{item.texto}</span>
        {item.pseudo ? <small>nome de bichinho da mata</small> : null}
        {ok ? <Brilho ativo /> : null}
      </div>
      <div className="linha-botoes">
        {temReconhecimento() ? <button className={`btn grande ${ouvindo ? 'ouvindo' : ''}`} onClick={microfone} disabled={ouvindo || ok}>🎤 Falar no microfone</button> : null}
        <button className="btn grande verde" onClick={concluir} disabled={ok} data-testid="eu-falei">✋ Eu falei!</button>
        <button className="btn" onClick={ajuda} disabled={ok}>💡 Me ajuda</button>
      </div>
      {msg ? <p className="aviso-acolhe" role="status">{msg}</p> : null}
      <p className="nota-mic">O microfone é opcional e escuta só no aparelho. Nenhum áudio é enviado.</p>
    </div>
  );
}
