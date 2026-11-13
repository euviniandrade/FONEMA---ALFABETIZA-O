import { useEffect, useRef, useState } from 'react';
import { FALAS, type AtividadeEscolher, type Opcao } from '@fonema/conteudo';
import { Balao, Brilho, BotaoOuvir } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

/**
 * TOCAR / CAÇAR / ENSINAR / SÍNTESE / REVISÃO: escolher entre 2–4 opções.
 * Escada de ajuda (N3): 1º erro → dica e o som de novo; 2º erro → a certa brilha (modelo) e a criança toca junto.
 * Nada de X vermelho, buzina, perda ou cronômetro.
 */
export function Escolher({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeEscolher>) {
  const [i, setI] = useState(0);
  const [erros, setErros] = useState(0);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const tentativas = useRef<ReturnType<typeof tentativa>[]>([]);
  const deNovo = useRef(0);
  const item = atividade.itens[i];
  const ehLeitura = !!item?.mostrar;

  const tocarItem = () => {
    if (item?.ouvir) return voz.falar(textoVoz(item.ouvir, crianca), { quem: atividade.enunciado.quem });
    if (item?.mostrar && i === 0) return falar(atividade.enunciado, crianca);
    return Promise.resolve();
  };

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (vivo && item?.ouvir) await voz.falar(textoVoz(item.ouvir, crianca), { quem: atividade.enunciado.quem });
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!item) return null;

  const escolher = async (o: Opcao) => {
    if (acertou) return;
    efeitos.toque();
    if (o.id === item.correta) {
      setAcertou(true);
      efeitos.acerto();
      tentativas.current.push(tentativa(item.habilidade ?? atividade.habilidade, sessao, cenaId, erros, { pseudo: item.pseudo, revisao }));
      if (erros > 0) deNovo.current++;
      const frase = erros > 1 ? FALAS.erroJunto.replace('?', '!') : atividade.comemora?.texto ?? FALAS.acertos[i % FALAS.acertos.length];
      setAviso(null);
      await voz.falar(textoVoz(frase, crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
      await espera(500);
      if (i + 1 < atividade.itens.length) {
        setI(i + 1); setErros(0); setMarcadas([]); setAcertou(false);
      } else {
        onFim({ tentativas: tentativas.current, tentouDeNovo: deNovo.current });
      }
      return;
    }
    // erro acolhido
    const e = erros + 1;
    setErros(e);
    setMarcadas((m) => [...m, o.id]);
    efeitos.suave();
    if (e === 1) {
      const dica = item.dica ?? FALAS.erro1;
      setAviso(dica);
      await voz.falar(textoVoz(dica, crianca), { quem: 'sofia' });
      if (item.ouvir) await voz.falar(textoVoz(item.ouvir, crianca), { quem: 'sofia' });
      else if (item.mostrar) await voz.falar(item.mostrar.split(/[\s(]/)[0].toLowerCase().replace(/_/g, ''), { quem: 'sofia', rate: 0.7 });
    } else {
      setAviso(FALAS.erro2);
      await voz.falar(textoVoz(FALAS.erro2, crianca), { quem: 'sofia' });
    }
  };

  const mostrarRotulo = (o: Opcao) => !o.figura || o.id === 'sim' || o.id === 'nao' || o.rotulo.startsWith('"');
  return (
    <div className={`mec mec-escolher estilo-${atividade.estilo ?? 'tocar'}`}>
      <Balao fala={atividade.enunciado} crianca={crianca} humor={atividade.estilo === 'ensinar' ? 'pensando' : 'alegre'} />
      <Progressinho atual={i} total={atividade.itens.length} />
      <div className="pergunta">
        {item.ouvir ? <BotaoOuvir onClick={tocarItem} rotulo="Ouvir de novo" /> : null}
        {ehLeitura ? <div className="palavra-grande" data-testid="palavra-lida">{item.mostrar}</div> : null}
        {item.ouvir && !ehLeitura ? <span className="dica-ouvir">Toque no alto-falante para ouvir de novo</span> : null}
      </div>
      <div className={`opcoes n${item.opcoes.length}`} role="group" aria-label="Opções">
        {item.opcoes.map((o) => {
          const modelo = erros >= 2 && o.id === item.correta;
          const certa = acertou && o.id === item.correta;
          return (
            <button
              key={o.id}
              className={`opcao ${o.letra ? 'opcao-letra' : ''} ${modelo ? 'modelo' : ''} ${certa ? 'certa' : ''} ${marcadas.includes(o.id) && !certa ? 'tentada' : ''}`}
              onClick={() => escolher(o)}
              aria-label={o.letra ? `Letra ${o.letra}` : o.rotulo}
              data-opcao={o.id}
              data-correta={o.id === item.correta ? '1' : undefined}
            >
              {o.letra ? <span className="letra">{o.letra}</span> : <span className="fig" aria-hidden="true">{o.figura}</span>}
              {mostrarRotulo(o) && !o.letra ? <span className="rot">{o.rotulo}</span> : null}
              {certa ? <Brilho ativo /> : null}
            </button>
          );
        })}
      </div>
      {aviso ? <p className="aviso-acolhe" role="status">{aviso.replace('[NOME]', crianca.nome)}</p> : null}
    </div>
  );
}
