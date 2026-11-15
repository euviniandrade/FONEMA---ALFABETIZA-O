import { useEffect, useRef, useState } from 'react';
import { CENAS_DO_SOM, type AtividadeSomNovo, type Fala } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { EspelhoBoca } from '../componentes/EspelhoDoSom.tsx';
import { Figura, Icone, caminhoFigura } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { tentativa, type PropsMecanica } from './comum.tsx';
import '../estilos-trilha-sons.css';

type Passo = 'inicio' | 'brincadeira' | 'som' | 'repita' | 'vez' | 'letra' | 'pronto';

/**
 * SOM NOVO (Trilha dos Sons, "eu faço"): o faz de conta leva o corpo a fazer o som → o SOM REAL da letra, três vezes,
 * com a boca do Espelho do Som → "Repita comigo!" e a vez da criança → só então a LETRA aparece (maiúscula e
 * minúscula), com o nome dela como apoio ("M, de macaco."). Regra 1: o som vem antes do nome da letra.
 * Nas unidades de REGRA (O/E no fim, TI/DI) mostra palavras com a letra destacada e o som que ela faz ali.
 * É apresentação: registra EXPOSIÇÃO (não conta para o domínio) e não pede "Eu fiz o som!".
 */
export function SomNovo({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeSomNovo>) {
  const a = atividade;
  const [passo, setPasso] = useState<Passo>('inicio');
  const [fala, setFala] = useState<Fala>(a.enunciado);
  const [falando, setFalando] = useState(false);
  const [parte, setParte] = useState(-1);
  const [palavra, setPalavra] = useState(-1);
  const [destaque, setDestaque] = useState(false);
  const [feito, setFeito] = useState(false);
  const vivo = useRef(true);
  const inicio = useRef(Date.now());
  const cena = CENAS_DO_SOM[a.letra];

  const diz = async (f: Fala | undefined) => {
    if (!f || !vivo.current) return vivo.current;
    setFala(f);
    await voz.falar(textoVoz(f.texto, crianca), { quem: f.quem });
    await espera(220);
    return vivo.current;
  };
  const som = async (vezes: number) => {
    setFalando(true);
    const ok = await voz.somReal(a.fonema, vezes);
    setFalando(false);
    return ok;
  };

  const apresentar = async () => {
    setPasso('inicio'); setParte(-1); setPalavra(-1); setDestaque(false);
    await falar(a.enunciado, crianca);
    if (!vivo.current) return;
    if (a.regra) {
      for (let p = 0; p < a.regra.partes.length && vivo.current; p++) {
        const pt = a.regra.partes[p];
        setParte(p); setPalavra(-1); setDestaque(false);
        if (!(await diz(pt.explica))) return;
        for (let k = 0; k < pt.palavras.length && vivo.current; k++) {
          setPalavra(k); setDestaque(false);
          await voz.falar(pt.palavras[k].palavra.toLowerCase(), { quem: 'sofia' });
          await espera(250);
          setDestaque(true);
          if (pt.palavras[k].som) { setFalando(true); await voz.somReal(pt.palavras[k].som!, 1); setFalando(false); }
          await espera(700);
          await voz.falar(pt.palavras[k].palavra.toLowerCase(), { quem: 'sofia' });
          await espera(350);
        }
      }
      if (a.regra.fecha && !(await diz(a.regra.fecha))) return;
      if (vivo.current) setPasso('pronto');
      return;
    }
    if (a.brincadeira) { setPasso('brincadeira'); if (!(await diz(a.brincadeira))) return; }
    setPasso('som');
    await som(3);
    await espera(300);
    if (a.repita) { setPasso('repita'); if (!(await diz(a.repita))) return; await som(1); }
    setPasso('vez');
    await espera(1800); // a vez da criança fazer o som
    if (!vivo.current) return;
    setPasso('letra');
    efeitos.acerto();
    if (!(await diz(a.revela))) return;
    await som(1);
    await espera(250);
    if (!(await diz(a.apoio))) return;
    setPasso('pronto');
  };

  useEffect(() => {
    vivo.current = true;
    void apresentar();
    return () => { vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continuar = async () => {
    setFeito(true);
    efeitos.acerto();
    await espera(450);
    onFim({ tentativas: [tentativa(a.habilidade, sessao, cenaId, 0, { tipo: 'exposicao', mecanica: 'somNovo', alvo: a.fonema, categoria: 'fonema', tempoMs: Date.now() - inicio.current, tentativaNumero: 1 })], tentouDeNovo: 0 });
  };

  const mostraLetra = passo === 'letra' || passo === 'pronto';
  const pt = a.regra && parte >= 0 ? a.regra.partes[parte] : null;
  return (
    <div className="mec mec-somnovo licao" data-passo={passo} data-testid="som-novo">
      <Balao fala={fala} crianca={crianca} />
      {a.regra ? (
        <div className="regra-palco">
          <div className="regra-boca"><EspelhoBoca fonema={pt?.palavras[Math.max(0, palavra)]?.som ?? a.fonema} falando={falando} /></div>
          <div className="regra-palavras" aria-live="polite">
            {pt?.palavras.map((w, k) => (
              <div key={w.palavra} className={`regra-palavra ${k <= palavra ? 'visivel' : ''} ${k === palavra ? 'agora' : ''}`} data-palavra={w.palavra}>
                {[...w.palavra].map((ch, i) => <span key={i} className={i === w.destaque && (k < palavra || (k === palavra && destaque)) ? 'destaque' : ''}>{ch}</span>)}
                {caminhoFigura(undefined, w.palavra.toLowerCase()) ? <Figura palavra={w.palavra.toLowerCase()} className="regra-fig" /> : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="somnovo-palco">
          <div className={`somnovo-cena ${passo === 'brincadeira' || passo === 'som' ? 'visivel' : ''}`} aria-hidden={passo !== 'brincadeira'}>
            {cena && caminhoFigura(undefined, cena) ? <Figura palavra={cena} className="somnovo-fig" /> : null}
            <span className="somnovo-rotulo">Faz de conta…</span>
          </div>
          <div className={`somnovo-boca ${falando ? 'falando' : ''}`}>
            <EspelhoBoca fonema={a.fonema} falando={falando} />
            <span className={`somnovo-onda ${falando ? 'tocando' : ''}`} aria-hidden="true"><i /><i /><i /></span>
            <p className="somnovo-legenda">{passo === 'vez' ? 'Sua vez! Faça o som.' : passo === 'repita' ? 'Repita comigo!' : passo === 'som' ? 'Escute o som' : ' '}</p>
          </div>
          <div className={`somnovo-letra ${mostraLetra ? 'visivel' : ''}`} data-testid="letra-do-som" aria-hidden={!mostraLetra}>
            <span className="somnovo-bloco"><b>{a.letra}</b></span>
            <span className="somnovo-bloco minuscula"><b>{a.letra.toLowerCase()}</b></span>
            {mostraLetra ? <Brilho ativo /> : null}
          </div>
        </div>
      )}
      <div className="linha-botoes centro">
        <button className="btn" onClick={() => { if (passo === 'pronto') void som(2); }} disabled={passo !== 'pronto'}><Icone nome="som" />Ouvir o som</button>
        <button className="btn" onClick={() => void apresentar()} disabled={passo !== 'pronto'}><Icone nome="voltar" />Ver de novo</button>
        <button className="btn grande verde" onClick={continuar} disabled={passo !== 'pronto' || feito} data-testid="som-novo-continuar"><Icone nome="seta" />Continuar</button>
      </div>
    </div>
  );
}
