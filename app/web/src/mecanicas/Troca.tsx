import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TRILHA_SONS as T, SILABA_DO_SOM, SONS_DUVIDOSOS, contrasteDosSons, fonemaDoGrafema, habilidadeTF, type AtividadeTroca, type Opcao } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { PAUSA_ENTRE_SONS_MS, explicarContraste } from './contraste.ts';
import { Progressinho, embaralhar, sementeDaTentativa, type PropsMecanica } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';
import { letraAa } from '../componentes/LetraAa.tsx';

type Etapa = 'letra' | 'muda' | 'ler' | 'feito';

/**
 * TROCA-LETRAS e MAIS-UMA-LETRA (docs/pedagogia/04 N4, N5; MOR p. 212; ABC p. 354–356): a palavra está montada com
 * letras móveis; a dupla pede um SOM novo numa posição (o lugar pisca). A criança acha a letra desse som; a letra entra
 * (troca ou é acrescentada) e a palavra muda. Depois ela escolhe, entre três leituras faladas, como se lê a palavra
 * nova — que nunca é dita antes. Duas tentativas por item: a letra do som e a leitura da palavra nova.
 */
export function Troca({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeTroca>) {
  const semente = useMemo(sementeDaTentativa, []);
  const itens = atividade.itens;
  const [i, setI] = useState(0);
  const item = itens[i];
  const [etapa, setEtapa] = useState<Etapa>('letra');
  const [fala, setFala] = useState(atividade.enunciado);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(true);
  const [acertou, setAcertou] = useState(false);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const inicio = useRef(Date.now());
  const tents = useRef<ReturnType<typeof registro>[]>([]);
  const vivo = useRef(true);
  const letras: Opcao[] = useMemo(() => embaralhar(item.letras.map((l) => ({ id: l, rotulo: l, letra: l, som: fonemaDoGrafema(l)! })), semente ? semente + i * 17 : 0), [item, semente, i]);
  const leituras: Opcao[] = useMemo(() => embaralhar(item.leituras.map((w) => ({ id: w, rotulo: '', falar: w, botaoDeSom: true })), semente ? semente + i * 23 : 0), [item, semente, i]);

  const diz = async (texto: string) => { setFala({ quem: 'sofia', texto }); await voz.falar(textoVoz(texto, crianca), { quem: 'sofia' }); };
  /** O som pedido: o som real, ou a sílaba falada para os sons ainda "duvidosos" (docs/pedagogia/03 §5). */
  const somPedido = async () => {
    if (SONS_DUVIDOSOS.includes(item.letra) && SILABA_DO_SOM[item.letra]) await voz.falar(SILABA_DO_SOM[item.letra], { quem: 'sofia' });
    else await voz.somReal(item.som, 2);
  };

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; voz.parar(); }; }, []);
  useEffect(() => {
    let atual = true;
    setEtapa('letra'); setMarcadas([]); setAcertou(false); setOcupado(true);
    respostas.current = []; pos.current = undefined;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      else await diz(item.acao === 'acrescentar' ? T.trocaMais : T.troca);
      if (!atual) return;
      await diz(T.trocaQualLetra);
      await somPedido();
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const escolherLetra = async (o: Opcao, k: number) => {
    if (ocupado || etapa !== 'letra') return;
    respostas.current.push(o.id);
    pos.current ??= k;
    if (o.id === item.letra) {
      efeitos.acerto();
      tents.current.push(registro({
        habilidade: atividade.habilidadeLetra ?? habilidadeTF(item.letra), sessao, cena: cenaId, mecanica: 'troca', alvo: item.letra, categoria: 'grafema', respostas: [...respostas.current],
        distratores: item.letras.filter((x) => x !== item.letra), inicio: inicio.current, revisao, posicaoCerta: letras.findIndex((x) => x.id === item.letra), posicaoEscolhida: pos.current, nOpcoes: letras.length
      }));
      setOcupado(true);
      setEtapa('muda');
      await espera(900); // a letra entra na palavra
      if (!vivo.current) return;
      setEtapa('ler');
      setMarcadas([]); respostas.current = []; pos.current = undefined;
      await diz(T.trocaLeia);
      setOcupado(false);
      inicio.current = Date.now();
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    if (respostas.current.length === 1 && o.som && o.som !== item.som) {
      await diz('Essa letra faz este som:');
      await voz.somReal(o.som, 1);
      await espera(PAUSA_ENTRE_SONS_MS);
      const c = contrasteDosSons(o.som, item.som);
      if (c) await explicarContraste(o.som, item.som, c);
      else { await diz('Eu pedi este som:'); await somPedido(); }
    } else await diz(FALAS.erro2);
    setOcupado(false);
  };

  const escolherLeitura = async (o: Opcao, k: number) => {
    if (ocupado || etapa !== 'ler') return;
    respostas.current.push(o.id);
    pos.current ??= k;
    const certa = item.para.toLowerCase();
    if (o.id === certa) {
      setAcertou(true);
      efeitos.acerto();
      tents.current.push(registro({
        habilidade: atividade.habilidade, sessao, cena: cenaId, mecanica: 'troca', alvo: item.para, respostas: respostas.current.map((x) => x.toUpperCase()),
        distratores: item.leituras.filter((x) => x !== certa).map((x) => x.toUpperCase()), inicio: inicio.current, revisao,
        posicaoCerta: leituras.findIndex((x) => x.id === certa), posicaoEscolhida: pos.current, nOpcoes: leituras.length
      }));
      setEtapa('feito');
      await voz.falar(certa, { quem: 'sofia' });
      await espera(250);
      await voz.falar(textoVoz(FALAS.acertos[i % FALAS.acertos.length], crianca), { quem: 'sofia' });
      await espera(600);
      if (!vivo.current) return;
      if (i + 1 < itens.length) setI(i + 1);
      else onFim({ tentativas: tents.current, tentouDeNovo: tents.current.filter((t) => !t.acertou).length });
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    // 1º erro: o caminho — a dupla aponta a letra nova e toca o som dela; a criança volta a ler da esquerda para a direita
    if (respostas.current.length === 1) { await diz(FALAS.erro1); await somPedido(); }
    else await diz(FALAS.erro2);
    setOcupado(false);
  };

  // a palavra montada: antes (com o lugar piscando) e depois da troca
  const mudou = etapa !== 'letra';
  const palavra = mudou ? item.para : item.de;
  const lugar = item.posicao;
  const pecas: (string | null)[] = [...palavra];
  if (!mudou && item.acao === 'acrescentar') pecas.splice(lugar, 0, null);
  return (
    <div className="mec mec-troca" data-testid="troca" data-etapa={etapa} data-item={i}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={itens.length} />
      <div className="troca-palavra" aria-label={`Palavra: ${palavra}`}>
        {pecas.map((ch, k) => (ch === null
          ? <span key={`b-${k}`} className="troca-buraco" aria-label="Aqui entra uma letra" />
          : <span key={`${etapa}-${k}`} className={`troca-peca ${k === lugar && mudou ? 'nova' : ''} ${k === lugar && !mudou && item.acao === 'trocar' ? 'sai' : ''}`}>{ch}</span>))}
        {etapa === 'feito' ? <Brilho ativo /> : null}
      </div>
      {etapa === 'letra' ? (
        <>
          <div className="pergunta"><button className="ouvir" aria-label="Ouvir o som de novo" disabled={ocupado} onClick={() => void somPedido()}><Icone nome="som" /></button><span className="dica-ouvir">Qual letra faz este som?</span></div>
          <div className="opcoes n3 troca-letras" role="group" aria-label="Letras">
            {letras.map((o, k) => (
              <button key={o.id} className={`opcao opcao-letra ${marcadas.includes(o.id) ? 'tentada' : ''} ${marcadas.length >= 2 && o.id === item.letra ? 'modelo' : ''}`} onClick={() => void escolherLetra(o, k)} data-correta={o.id === item.letra ? '1' : undefined} aria-label={`Letra ${o.letra}`}>
                <span className="letra">{letraAa(o.letra ?? '')}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      {etapa === 'ler' || etapa === 'feito' ? (
        <OpcoesTF opcoes={leituras} correta={item.para.toLowerCase()} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={escolherLeitura} rotulo="Leituras" />
      ) : null}
    </div>
  );
}
