import { useEffect, useMemo, useRef, useState } from 'react';
import type { AtividadeMontar } from '@fonema/conteudo';
import { hash, silabas } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { ehDeterminista, falar, textoVoz } from '../util.ts';
import { Progressinho, tentativa, type PropsMecanica } from './comum.tsx';

const SOM_LETRA: Record<string, string> = { A: 'aa', E: 'éé', I: 'ii', O: 'óó', U: 'uu', M: 'mmm', L: 'lll', F: 'fff', S: 'sss', V: 'vvv', N: 'nnn', R: 'rr', P: 'pê', T: 'tê', B: 'bê', D: 'dê', C: 'cê', G: 'gê', J: 'jjj', Z: 'zzz', K: 'cá', H: 'agá', X: 'xxx', Q: 'quê', Y: 'ii', W: 'uu', Ã: 'ãã', É: 'éé', Í: 'ii', Ó: 'óó', Ú: 'uu', Â: 'ââ', Ê: 'êê', Ô: 'ôô', Õ: 'õõ', Ç: 'sss' };

/** MONTAR com o alfabeto móvel (ou a tábua de sílabas): tocar a peça certa para encher cada espaço. */
export function Montar({ atividade, crianca, sessao, cenaId, onFim }: PropsMecanica<AtividadeMontar>) {
  const [i, setI] = useState(0);
  const palavra = atividade.palavras[i].toUpperCase();
  const alvo = useMemo(() => (atividade.porSilaba ? silabas(palavra).map((s) => s.toUpperCase()) : [...palavra]), [palavra, atividade.porSilaba]);
  const pecas = useMemo(() => {
    const base = alvo.map((t, k) => ({ id: `${t}-${k}`, t }));
    const extras = (atividade.distratoras ?? []).map((t, k) => ({ id: `x${t}-${k}`, t }));
    return ehDeterminista([...base, ...extras], hash(palavra + crianca.id));
  }, [alvo, atividade.distratoras, palavra, crianca.id]);
  const [usadas, setUsadas] = useState<string[]>([]);
  const [errosSeguidos, setErrosSeguidos] = useState(0);
  const [errosTotal, setErrosTotal] = useState(0);
  const [balanca, setBalanca] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const tents = useRef<ReturnType<typeof tentativa>[]>([]);
  const deNovo = useRef(0);
  const pos = usadas.length;

  useEffect(() => {
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      await voz.falar(palavra === crianca.nome.toUpperCase() ? crianca.pronuncia.fala : palavra.toLowerCase(), { quem: 'sofia' });
    })();
    setUsadas([]); setErrosSeguidos(0); setErrosTotal(0); setPronto(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const tocar = async (p: { id: string; t: string }) => {
    if (pronto || usadas.includes(p.id)) return;
    const som = atividade.porSilaba ? p.t.toLowerCase() : SOM_LETRA[p.t] ?? p.t.toLowerCase();
    if (p.t === alvo[pos]) {
      efeitos.toque();
      const novas = [...usadas, p.id];
      setUsadas(novas);
      setErrosSeguidos(0);
      voz.falar(som, { quem: 'sofia', rate: 0.85 });
      if (novas.length === alvo.length) {
        setPronto(true);
        efeitos.acerto();
        tents.current.push(tentativa(atividade.habilidade, sessao, cenaId, errosTotal));
        if (errosTotal) deNovo.current++;
        await espera(500);
        await voz.falar(textoVoz(atividade.comemora?.texto ?? `Você montou ${palavra}!`, crianca), { quem: atividade.comemora?.quem ?? 'sofia' });
        await espera(400);
        if (i + 1 < atividade.palavras.length) setI(i + 1);
        else onFim({ tentativas: tents.current, tentouDeNovo: deNovo.current });
      }
    } else {
      efeitos.suave();
      setBalanca(p.id);
      setTimeout(() => setBalanca(null), 500);
      setErrosSeguidos((e) => e + 1);
      setErrosTotal((e) => e + 1);
      await voz.falar(`${som}… ${errosSeguidos >= 1 ? 'Olha, a peça certa está brilhando.' : 'Escuta de novo: ' + (SOM_LETRA[alvo[pos]] ?? alvo[pos].toLowerCase())}`, { quem: 'sofia' });
    }
  };

  return (
    <div className="mec mec-montar">
      <Balao fala={atividade.enunciado} crianca={crianca} />
      <Progressinho atual={i} total={atividade.palavras.length} />
      {atividade.mostrarModelo ? <div className="modelo-palavra" aria-label={`Modelo: ${palavra}`}>{alvo.map((t, k) => <span key={k} className={k < pos ? 'feito' : k === pos ? 'agora' : ''}>{t}</span>)}</div> : null}
      <div className="espacos" data-testid="espacos">
        {alvo.map((t, k) => <span key={k} className={`espaco ${k < pos ? 'cheio' : ''} ${atividade.porSilaba ? 'silaba' : ''}`}>{k < pos ? t : ''}</span>)}
        {pronto ? <Brilho ativo /> : null}
      </div>
      <div className="pecas" role="group" aria-label="Peças">
        {pecas.map((p) => {
          const brilha = errosSeguidos >= 2 && p.t === alvo[pos] && !usadas.includes(p.id) && pecas.find((q) => q.t === alvo[pos] && !usadas.includes(q.id))?.id === p.id;
          return (
            <button key={p.id} className={`peca ${usadas.includes(p.id) ? 'usada' : ''} ${balanca === p.id ? 'balanca' : ''} ${brilha ? 'modelo' : ''} ${atividade.porSilaba ? 'silaba' : ''}`} onClick={() => tocar(p)} disabled={usadas.includes(p.id)} data-peca={p.t} aria-label={`Peça ${p.t}`}>
              {p.t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
