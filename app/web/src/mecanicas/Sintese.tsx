import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TRILHA_SONS as T, type AtividadeSintese, type Opcao } from '@fonema/conteudo';
import { Balao } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar, textoVoz } from '../util.ts';
import { Progressinho, embaralhar, sementeDaTentativa, sortearItens, type PropsMecanica } from './comum.tsx';
import { pararSons, tocarSonsEmendados, type Ritmo } from './sons-emendados.ts';
import { OpcoesTF, registro } from './tf-comum.tsx';

type Modo = 'demo' | 'juntos' | 'sozinho';
type Etapa = 'tocar' | 'juntar' | 'juntando' | 'escolher' | 'feito';

/**
 * SÍNTESE COM SOM PROLONGADO (docs/pedagogia/04 N2): a criança toca as letras da esquerda para a direita; cada toque
 * toca o som da letra, esticado. Depois os sons emendados ("mmmaaalll…"), devagar e mais rápido, e a pergunta: que
 * palavra os sons formaram? A palavra inteira só é dita DEPOIS da resposta (R9).
 * "Eu faço, nós fazemos, você faz": no 1º item a dupla faz sozinha (demonstração, não conta); no 2º a próxima letra
 * brilha para a criança tocar junto; do 3º em diante, sem apoio.
 */
export function Sintese({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeSintese>) {
  const semente = useMemo(sementeDaTentativa, []);
  const itens = useMemo(() => sortearItens(atividade.itens, atividade.sortear, semente), [atividade, semente]);
  const [i, setI] = useState(0);
  const item = itens[i];
  const roteiro = atividade.roteiro !== false && itens.length >= 3;
  const modo: Modo = roteiro && i === 0 ? 'demo' : roteiro && i === 1 ? 'juntos' : 'sozinho';
  const opcoes = useMemo(() => (item ? embaralhar(item.opcoes, semente ? semente + i * 977 : 0) : []), [item, semente, i]);
  const letras = item ? [...item.palavra] : [];
  const [tocadas, setTocadas] = useState(0);
  const [acesa, setAcesa] = useState(-1);
  const [etapa, setEtapa] = useState<Etapa>('tocar');
  const [fala, setFala] = useState(atividade.enunciado);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const respostas = useRef<string[]>([]);
  const posEscolhida = useRef<number | undefined>(undefined);
  const ouviu = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<ReturnType<typeof registro>[]>([]);
  const vivo = useRef(true);

  const diz = async (texto: string) => { setFala({ quem: 'sofia', texto }); await voz.falar(textoVoz(texto, crianca), { quem: 'sofia' }); };
  const somDaLetra = (k: number) => tocarSonsEmendados([item.sons[k]], 'separado', () => setAcesa(k));
  const juntar = async (ritmos: Ritmo[]) => {
    for (const r of ritmos) {
      if (!vivo.current) return;
      if (r === 'rapido') await diz(T.sinteseRapido);
      await tocarSonsEmendados(item.sons, r, setAcesa);
      setAcesa(-1);
      await espera(350);
    }
  };

  useEffect(() => {
    vivo.current = true;
    return () => { vivo.current = false; pararSons(); voz.parar(); };
  }, []);

  // começo de cada item
  useEffect(() => {
    if (!item) return;
    let atual = true;
    setTocadas(0); setAcesa(-1); setEtapa('tocar'); setMarcadas([]); setAcertou(false); setOcupado(true);
    respostas.current = []; posEscolhida.current = undefined; ouviu.current = 0;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (!atual) return;
      await diz(modo === 'demo' ? T.euFaco : modo === 'juntos' ? T.nosFazemos : i === 2 && roteiro ? T.voceFaz : T.sintese);
      if (!atual) return;
      if (modo === 'demo') {
        // eu faço: a dupla toca cada letra, junta devagar e depressa, e diz a palavra
        for (let k = 0; k < letras.length && atual; k++) { await somDaLetra(k); setTocadas(k + 1); await espera(250); }
        setAcesa(-1);
        await diz(T.sinteseJunta);
        await juntar(['lento', 'rapido']);
        if (!atual) return;
        setEtapa('feito');
        setAcertou(true);
        await voz.falar(item.correta, { quem: 'sofia' });
        await espera(700);
        tents.current.push(registro({ habilidade: atividade.habilidade, sessao, cena: cenaId, mecanica: 'sintese', alvo: item.palavra, respostas: [item.correta], distratores: [], inicio: inicio.current, tipo: 'exposicao', revisao }));
        if (atual) setI(1);
        return;
      }
      setOcupado(false);
      inicio.current = Date.now();
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!item) return null;

  const tocarLetra = async (k: number) => {
    if (ocupado || etapa !== 'tocar' || modo === 'demo') return;
    if (k !== tocadas) { efeitos.suave(); await diz(T.primeiraLetra); return; }
    efeitos.toque();
    setOcupado(true);
    await somDaLetra(k);
    setTocadas(k + 1);
    if (k + 1 === letras.length) { setAcesa(-1); setEtapa('juntar'); await diz(T.sinteseJunta); }
    setOcupado(false);
  };

  const fazerJuntar = async () => {
    setEtapa('juntando');
    setOcupado(true);
    await juntar(['lento', 'rapido']);
    if (!vivo.current) return;
    setEtapa('escolher');
    await diz(T.sinteseQual);
    setOcupado(false);
    inicio.current = Date.now();
  };

  const escolher = async (o: Opcao, k: number) => {
    if (acertou || ocupado) return;
    respostas.current.push(o.id);
    posEscolhida.current ??= k;
    if (o.id === item.correta) {
      setAcertou(true);
      efeitos.acerto();
      tents.current.push(registro({
        habilidade: atividade.habilidade, sessao, cena: cenaId, mecanica: 'sintese', alvo: item.palavra, respostas: respostas.current.map((x) => x.toUpperCase()),
        distratores: opcoes.filter((x) => x.id !== item.correta).map((x) => x.id.toUpperCase()), inicio: inicio.current, pseudo: item.pseudo, revisao,
        posicaoCerta: opcoes.findIndex((x) => x.id === item.correta), posicaoEscolhida: posEscolhida.current, nOpcoes: opcoes.length, ouviuDeNovo: ouviu.current
      }));
      // só agora a palavra inteira é dita
      await voz.falar(item.correta, { quem: 'sofia' });
      await espera(200);
      await voz.falar(textoVoz(respostas.current.length > 2 ? FALAS.erroJunto.replace('?', '!') : FALAS.acertos[i % FALAS.acertos.length], crianca), { quem: 'sofia' });
      await espera(450);
      if (!vivo.current) return;
      if (i + 1 < itens.length) setI(i + 1);
      else onFim({ tentativas: tents.current, tentouDeNovo: tents.current.filter((t) => !t.acertou).length });
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    // 1º erro: ouvir de novo os sons emendados (o caminho), sem dizer a palavra; 2º: a certa brilha (ajuda)
    if (respostas.current.length === 1) { await diz(FALAS.erro1); await juntar(['lento', 'rapido']); await diz(T.sinteseQual); }
    else await diz(FALAS.erro2);
    setOcupado(false);
  };

  return (
    <div className="mec mec-sintese" data-testid="sintese" data-modo={modo} data-etapa={etapa} data-item={i}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={itens.length} />
      <div className="sintese-letras" role="group" aria-label="Letras da palavra">
        {letras.map((l, k) => {
          const proxima = etapa === 'tocar' && k === tocadas;
          return (
            <button
              key={k} className={`sintese-letra ${k < tocadas ? 'tocada' : ''} ${acesa === k ? 'acesa' : ''} ${proxima && modo === 'juntos' ? 'guia' : ''}`}
              onClick={() => void tocarLetra(k)} disabled={etapa !== 'tocar' || modo === 'demo'} aria-label={`Letra ${k + 1}`}
              data-sintese-letra={k} {...(proxima ? { 'data-sintese-proxima': '1' } : {})}
            >
              <span>{l}</span>
              <i className="sintese-esticado" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {etapa === 'juntar' ? (
        <div className="linha-botoes centro"><button className="btn enorme ipe brilha" onClick={fazerJuntar} data-testid="sintese-juntar"><Icone nome="som" />Juntar os sons!</button></div>
      ) : null}
      {etapa === 'escolher' || (etapa === 'feito' && modo !== 'demo') ? (
        <>
          <div className="pergunta"><button className="ouvir" aria-label="Ouvir os sons de novo" disabled={ocupado} onClick={async () => { ouviu.current++; setOcupado(true); await juntar(['rapido']); setOcupado(false); }}><Icone nome="som" /></button><span className="dica-ouvir">Que palavra os sons formaram?</span></div>
          <OpcoesTF opcoes={opcoes} correta={item.correta} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={respostas.current.length >= 2} onEscolher={escolher} />
        </>
      ) : null}
      {modo === 'demo' && etapa === 'feito' ? <p className="sintese-palavra" aria-live="polite">{item.palavra}</p> : null}
    </div>
  );
}
