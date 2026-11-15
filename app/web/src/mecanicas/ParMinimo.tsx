import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TRILHA_SONS as T, contrasteDosSons, type AtividadeParMinimo, type Opcao } from '@fonema/conteudo';
import { Balao } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { explicarContraste } from './contraste.ts';
import { Progressinho, embaralhar, sementeDaTentativa, sortearItens, type PropsMecanica } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';

/**
 * PARES MÍNIMOS de palavras (docs/pedagogia/04 N3; SOA p. 147; MOR p. 214): duas palavras que mudam UM som.
 *  - ouvir: a dupla diz uma das palavras e a criança toca a figura certa (faca × vaca);
 *  - ler: a palavra aparece escrita e a criança escolhe, entre duas leituras, a que combina (pato × bato).
 * Posição sorteada; 1º erro: as duas palavras, uma depois da outra, e o que muda entre os dois sons; 2º erro: a certa
 * brilha (ajuda). Depois do acerto, no modo ler, as duas palavras aparecem lado a lado com a letra que muda destacada.
 */
export function ParMinimo({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeParMinimo>) {
  const semente = useMemo(sementeDaTentativa, []);
  const itens = useMemo(() => sortearItens(atividade.itens, atividade.sortear, semente), [atividade, semente]);
  const [i, setI] = useState(0);
  const item = itens[i];
  const opcoes: Opcao[] = useMemo(() => {
    if (!item) return [];
    const op = (w: string): Opcao => (item.modo === 'ouvir' ? { id: w, rotulo: w, figura: '', falar: w } : { id: w, rotulo: '', falar: w, botaoDeSom: true });
    return embaralhar([op(item.alvo), op(item.outra)], semente ? semente + i * 31 : 0);
  }, [item, semente, i]);
  const [fala, setFala] = useState(atividade.enunciado);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [ocupado, setOcupado] = useState(true);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const ouviu = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<ReturnType<typeof registro>[]>([]);
  const vivo = useRef(true);

  const diz = async (texto: string) => { setFala({ quem: 'sofia', texto }); await voz.falar(textoVoz(texto, crianca), { quem: 'sofia' }); };
  const estimulo = () => (item.modo === 'ouvir' ? voz.falar(item.alvo, { quem: 'sofia' }) : Promise.resolve());

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; voz.parar(); }; }, []);
  useEffect(() => {
    if (!item) return;
    let atual = true;
    setMarcadas([]); setAcertou(false); setOcupado(true);
    respostas.current = []; pos.current = undefined; ouviu.current = 0;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (!atual) return;
      await diz(item.modo === 'ouvir' ? T.parOuvir : T.parLer);
      await estimulo();
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!item) return null;

  const escolher = async (o: Opcao, k: number) => {
    if (acertou || ocupado) return;
    respostas.current.push(o.id);
    pos.current ??= k;
    if (o.id === item.alvo) {
      setAcertou(true);
      efeitos.acerto();
      tents.current.push(registro({
        habilidade: item.habilidade ?? atividade.habilidade, sessao, cena: cenaId, mecanica: 'parMinimo', alvo: item.alvo.toUpperCase(), respostas: respostas.current.map((x) => x.toUpperCase()),
        distratores: [item.outra.toUpperCase()], inicio: inicio.current, revisao, posicaoCerta: opcoes.findIndex((x) => x.id === item.alvo), posicaoEscolhida: pos.current, nOpcoes: 2, ouviuDeNovo: ouviu.current
      }));
      await voz.falar(item.alvo, { quem: 'sofia' });
      await espera(250);
      await voz.falar(textoVoz(FALAS.acertos[i % FALAS.acertos.length], crianca), { quem: 'sofia' });
      await espera(900);
      if (!vivo.current) return;
      if (i + 1 < itens.length) setI(i + 1);
      else onFim({ tentativas: tents.current, tentouDeNovo: tents.current.filter((t) => !t.acertou).length });
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    if (respostas.current.length === 1) {
      // as duas palavras e o que muda entre os dois sons
      await diz('Escuta os dois e tenta de novo.');
      await voz.falar(item.outra, { quem: 'sofia' });
      await espera(300);
      await voz.falar(item.alvo, { quem: 'sofia' });
      await espera(300);
      const [a, b] = item.sons;
      const c = contrasteDosSons(b, a);
      if (c) await explicarContraste(b, a, c);
      await estimulo();
    } else await diz(FALAS.erro2);
    setOcupado(false);
  };

  // depois do acerto (modo ler): as duas palavras lado a lado, com a letra que muda destacada
  const dif = [...item.alvo].findIndex((ch, k) => item.outra[k] !== ch);
  return (
    <div className="mec mec-par" data-testid="par-minimo" data-modo={item.modo} data-item={i}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={itens.length} />
      <div className="pergunta">
        {item.modo === 'ouvir'
          ? <><button className="ouvir" aria-label="Ouvir a palavra de novo" disabled={ocupado} onClick={() => { ouviu.current++; void estimulo(); }}><Icone nome="som" /></button><span className="dica-ouvir">Toque na figura da palavra que você ouviu</span></>
          : <div className="palavra-grande" data-testid="palavra-lida">{item.alvo.toUpperCase()}</div>}
      </div>
      <div className="par-palco">
        <OpcoesTF opcoes={opcoes} correta={item.alvo} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={respostas.current.length >= 2} onEscolher={escolher} />
        <span className="par-diferente" aria-hidden="true">≠</span>
      </div>
      {acertou && item.modo === 'ler' ? (
        <div className="par-comparar" aria-label="As duas palavras">
          {[item.alvo, item.outra].map((w) => <span key={w}>{[...w.toUpperCase()].map((ch, k) => <b key={k} className={k === dif ? 'muda' : ''}>{ch}</b>)}</span>)}
        </div>
      ) : null}
    </div>
  );
}
