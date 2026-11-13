import { Figura, Icone } from '../componentes/ui.tsx';
import { useEffect, useRef, useState } from 'react';
import { FALAS, type AtividadePalmas } from '@fonema/conteudo';
import { infoNome, silabasPara } from '@fonema/motor';
import { Balao } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

/** Palmas das sílabas: cada palma acende uma lâmpada (ou uma casa da amarelinha). */
export function Palmas({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadePalmas>) {
  const nome = infoNome(crianca.nome, crianca.pronuncia.grafia);
  const [i, setI] = useState(0);
  const [palmas, setPalmas] = useState(0);
  const [erros, setErros] = useState(0);
  const [mostrando, setMostrando] = useState(-1);
  const [ok, setOk] = useState(false);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const deNovo = useRef(0);
  const palavra = atividade.palavras[i];
  const sil = silabasPara(palavra, nome);
  const ehNome = palavra === crianca.nome;
  const falaPalavra = ehNome ? crianca.pronuncia.fala : palavra;

  useEffect(() => {
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      await voz.falar(falaPalavra, { quem: 'tales' });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const bater = () => {
    if (ok || mostrando >= 0) return;
    efeitos.palma();
    const n = palmas + 1;
    setPalmas(n);
    if (n <= sil.length) voz.falar(sil[n - 1], { quem: 'sofia', rate: 0.9 });
  };

  const modelar = async () => {
    for (let k = 0; k < sil.length; k++) {
      setMostrando(k);
      efeitos.palma();
      await voz.falar(sil[k], { quem: 'sofia', rate: 0.8 });
      await espera(250);
    }
    setMostrando(-1);
  };

  const pronto = async () => {
    if (palmas === sil.length) {
      setOk(true);
      efeitos.acerto();
      tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, erros));
      if (erros) deNovo.current++;
      await voz.falar(textoVoz(atividade.comemora?.texto ?? 'Isso! Uma palma para cada pedacinho!', crianca), { quem: atividade.comemora?.quem ?? 'tales' });
      await espera(400);
      if (i + 1 < atividade.palavras.length) { setI(i + 1); setPalmas(0); setErros(0); setOk(false); }
      else onFim({ tentativas: tents.current, tentouDeNovo: deNovo.current });
    } else {
      setErros((e) => e + 1);
      await voz.falar(textoVoz(erros === 0 ? 'Vamos bater juntos, [NOME]? Escuta e olha as lâmpadas.' : 'Olha eu batendo devagar.', crianca), { quem: 'sofia' });
      await modelar();
      setPalmas(0);
    }
  };

  const estilo = atividade.estilo ?? 'palmas';
  const nLuz = Math.max(sil.length, palmas, 4);
  return (
    <div className={`mec mec-palmas estilo-${estilo}`}>
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.palavras.length} />
      <div className="palmas-palavra">
        <button className="btn ouvir-texto" onClick={() => voz.falar(falaPalavra, { quem: 'tales' })} aria-label={`Ouvir: ${ehNome ? crianca.nome : palavra}`}><Icone nome="som" /><span>{ehNome ? crianca.nome : palavra}</span></button>
      </div>
      <div className={`lampadas ${estilo === 'amarelinha' ? 'amarelinha' : ''}`} data-silabas={sil.length} aria-live="polite" aria-label={`${palmas} palmas`}>
        {Array.from({ length: nLuz }, (_, k) => (
          <span key={k} className={`lampada ${k < palmas || k === mostrando || ok ? 'acesa' : ''} ${k >= sil.length ? 'extra' : ''}`}>
            {(k < palmas || k === mostrando || ok) && k < sil.length ? <small>{sil[k]}</small> : null}
          </span>
        ))}
      </div>
      <div className="palmas-acoes">
        <button className="btn grande ipe botao-palma" onClick={bater} disabled={ok} data-testid="palma">
          <Figura className="" palavra={estilo === 'amarelinha' ? 'pé' : estilo === 'capoeira' ? 'ginga' : 'mão'} />{estilo === 'amarelinha' ? 'Pular' : estilo === 'capoeira' ? 'Palma na ginga' : 'Palma'}
        </button>
        <button className="btn grande verde" onClick={pronto} disabled={ok || palmas === 0} data-testid="pronto-palmas"><Icone nome="check" />Pronto!</button>
        <button className="btn" onClick={() => setPalmas(0)} disabled={ok || palmas === 0}><Icone nome="repetir" />De novo</button>
      </div>
      {erros > 0 && !ok ? <p className="aviso-acolhe"><Icone nome="dica" /><span>{FALAS.erroJunto.replace('[NOME]', crianca.nome)}</span></p> : null}
    </div>
  );
}
