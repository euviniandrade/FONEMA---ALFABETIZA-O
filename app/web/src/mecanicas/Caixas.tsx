import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TRILHA_SONS as T, contrasteDosSons, fonemaDoGrafema, type AtividadeCaixas } from '@fonema/conteudo';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { ehDeterminista, falar, textoVoz } from '../util.ts';
import { explicarContraste } from './contraste.ts';
import { Progressinho, type PropsMecanica } from './comum.tsx';
import { pararSons, tocarSonsEmendados } from './sons-emendados.ts';
import { registro } from './tf-comum.tsx';

type Etapa = 'fichas' | 'conferindo' | 'letras' | 'feito';
const chaveDemo = (c: string) => `fonema-demo-caixas:${c}`;
const jaViu = (c: string) => { try { return localStorage.getItem(chaveDemo(c)) === '1'; } catch { return true; } };
const marcar = (c: string) => { try { localStorage.setItem(chaveDemo(c), '1'); } catch { /* sem armazenamento */ } };

/**
 * CAIXAS DE SONS (Elkonin; docs/pedagogia/04 N1; ABC p. 332–333; MP p. 36–37): a criança OUVE a palavra (a figura só
 * lembra a palavra ouvida) e põe uma ficha por SOM nas caixas — há sempre caixa sobrando, para o número de caixas não
 * entregar o número de sons. Depois troca cada ficha pela LETRA do som (segmentação → escrita), sem modelo.
 * Erro de contagem: a palavra volta, som por som, bem devagar. Erro de letra: a correção toca o som escolhido e o certo;
 * nas regras (O e E do fim, T e D antes de I) a dupla diz a regra. Na 3ª tentativa a letra certa brilha (ajuda).
 * Registra duas tentativas por palavra: a segmentação e a escrita.
 */
export function Caixas({ atividade, crianca, sessao, cenaId, revisao, onFim }: PropsMecanica<AtividadeCaixas>) {
  const itens = atividade.itens;
  const [i, setI] = useState(0);
  const item = itens[i];
  const nSons = item.sons.filter(Boolean).length;
  const nCaixas = nSons + (atividade.caixasExtras ?? 1);
  const [fichas, setFichas] = useState(0);
  const [etapa, setEtapa] = useState<Etapa>('fichas');
  const [escritas, setEscritas] = useState<string[]>([]);
  const [acesa, setAcesa] = useState(-1);
  const [fala, setFala] = useState(atividade.enunciado);
  const [ocupado, setOcupado] = useState(true);
  const [errosLetra, setErrosLetra] = useState(0);
  const [balanca, setBalanca] = useState<string | null>(null);
  const contagens = useRef<number[]>([]);
  const letrasTentadas = useRef<string[]>([]);
  const ajudaLetra = useRef(false);
  const ouviu = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<ReturnType<typeof registro>[]>([]);
  const vivo = useRef(true);
  const bandeja = useMemo(() => ehDeterminista(item.letras.map((l, k) => ({ id: `${l}-${k}`, l })), modoTeste() ? 7 + i : Math.floor(Math.random() * 99999)), [item, i]);

  const diz = async (texto: string) => { setFala({ quem: 'sofia', texto }); await voz.falar(textoVoz(texto, crianca), { quem: 'sofia' }); };
  const ouvirPalavra = () => voz.falar(item.palavra.toLowerCase(), { quem: 'sofia' });
  const somPorSom = async () => { await tocarSonsEmendados(item.sons, 'separado', setAcesa); setAcesa(-1); };

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; pararSons(); voz.parar(); }; }, []);

  useEffect(() => {
    let atual = true;
    setFichas(0); setEtapa('fichas'); setEscritas([]); setAcesa(-1); setErrosLetra(0); setOcupado(true);
    contagens.current = []; letrasTentadas.current = []; ajudaLetra.current = false; ouviu.current = 0;
    (async () => {
      if (i === 0) await falar(atividade.enunciado, crianca);
      if (!atual) return;
      if (i === 0 && !jaViu(crianca.id)) {
        // exemplo antes de valer (R12): a dupla põe as fichas, uma por som, e depois tira
        await diz(T.euFaco);
        await ouvirPalavra();
        await tocarSonsEmendados(item.sons, 'separado', (k) => { setAcesa(k); setFichas(k + 1); });
        setAcesa(-1);
        await espera(500);
        if (!atual) return;
        setFichas(0);
        marcar(crianca.id);
        await diz(T.voceFaz);
      }
      await ouvirPalavra();
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const porFicha = () => { if (ocupado || etapa !== 'fichas' || fichas >= nCaixas) return; efeitos.toque(); setFichas((f) => f + 1); };
  const tirarFicha = () => { if (ocupado || etapa !== 'fichas' || !fichas) return; efeitos.suave(); setFichas((f) => f - 1); };

  const conferirFichas = async () => {
    if (ocupado) return;
    setOcupado(true);
    contagens.current.push(fichas);
    if (fichas === nSons) {
      efeitos.acerto();
      setEtapa('conferindo');
      tents.current.push(registro({
        habilidade: atividade.habilidade, sessao, cena: cenaId, mecanica: 'caixas', alvo: String(nSons), respostas: contagens.current.map(String), distratores: [],
        inicio: inicio.current, categoria: 'palavra', revisao, ouviuDeNovo: ouviu.current
      }));
      await diz(T.caixasConfere);
      await somPorSom();
      await diz(T.caixasLetras);
      setEtapa('letras');
      inicio.current = Date.now();
      setOcupado(false);
      return;
    }
    efeitos.suave();
    await diz(fichas > nSons ? T.caixasSobra : T.caixasFalta);
    await ouvirPalavra();
    if (contagens.current.length >= 2) {
      // 3ª tentativa: a dupla mostra, som por som, uma ficha em cada caixa (resposta mostrada)
      setFichas(0);
      await tocarSonsEmendados(item.sons, 'separado', (k) => { setAcesa(k); setFichas(k + 1); });
      setAcesa(-1);
    } else {
      await somPorSom();
      setFichas(0);
    }
    setOcupado(false);
  };

  const pos = escritas.length;
  const certaAgora = item.palavra[pos];
  const tocarLetra = async (l: string, id: string) => {
    if (ocupado || etapa !== 'letras') return;
    if (l === certaAgora) {
      efeitos.toque();
      const novas = [...escritas, l];
      setEscritas(novas);
      setErrosLetra(0);
      setAcesa(pos);
      if (item.sons[pos]) void voz.somReal(item.sons[pos]!, 1);
      if (novas.length === item.palavra.length) {
        setOcupado(true);
        setEtapa('feito');
        efeitos.acerto();
        tents.current.push(registro({
          habilidade: atividade.habilidadeEscrita, sessao, cena: cenaId, mecanica: 'caixas', alvo: item.palavra, respostas: [...letrasTentadas.current, item.palavra],
          distratores: item.letras.filter((x) => !item.palavra.includes(x)), inicio: inicio.current, revisao, ...(ajudaLetra.current ? { ajuda: 'resposta-mostrada' as const } : {})
        }));
        await espera(450);
        await ouvirPalavra();
        await diz(T.caixasCerto);
        await espera(400);
        if (!vivo.current) return;
        if (i + 1 < itens.length) setI(i + 1);
        else onFim({ tentativas: tents.current, tentouDeNovo: tents.current.filter((t) => !t.acertou).length });
      }
      return;
    }
    // letra errada: correção contrastiva (ou a regra), sem mostrar a letra certa
    efeitos.suave();
    setBalanca(id);
    setTimeout(() => setBalanca(null), 500);
    letrasTentadas.current.push(l);
    const e = errosLetra + 1;
    setErrosLetra(e);
    setOcupado(true);
    const somCerto = item.sons[pos];
    const somDela = fonemaDoGrafema(l); // letra da Trilha A–Z ou grafema novo (É, Ó, Ã…)
    if (e >= 2) { ajudaLetra.current = true; await diz(FALAS.erro2); }
    else if (somCerto && somDela === somCerto && item.palavra.endsWith(certaAgora) && pos === item.palavra.length - 1) {
      // O e E do fim: o som é U/I, mas a letra é O/E
      await diz(certaAgora === 'O' ? T.caixasRegraO : T.caixasRegraE);
    } else if (somCerto && somDela && somDela !== somCerto) {
      await diz('Essa letra faz este som:');
      await voz.somReal(somDela, 1);
      await espera(200);
      const c = contrasteDosSons(somDela, somCerto);
      if (c) await explicarContraste(somDela, somCerto, c);
      else { await diz('Eu pedi este som:'); setAcesa(pos); await voz.somReal(somCerto, 1); }
      await diz('Escuta os dois e tenta de novo.');
    } else {
      await diz(FALAS.erro1);
      if (somCerto) { setAcesa(pos); await voz.somReal(somCerto, 1); }
    }
    setOcupado(false);
  };

  return (
    <div className="mec mec-caixas" data-testid="caixas" data-etapa={etapa} data-n-sons={nSons} data-palavra-caixas={item.palavra} data-proxima-letra={etapa === 'letras' ? certaAgora : ''}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={itens.length} />
      <div className="pergunta caixas-topo">
        <button className="ouvir" aria-label="Ouvir a palavra" disabled={ocupado} onClick={() => { ouviu.current++; void ouvirPalavra(); }}><Icone nome="som" /></button>
        {item.figura ? <div className="caixas-figura"><Figura palavra={item.figura} /></div> : <span className="dica-ouvir">Escute a palavra</span>}
      </div>
      <div className={`caixas-fileira ${etapa === 'letras' || etapa === 'feito' ? 'so-sons' : ''}`} aria-label="Caixas de sons">
        {Array.from({ length: etapa === 'fichas' ? nCaixas : nSons }, (_, k) => {
          const comFicha = etapa === 'fichas' ? k < fichas : true;
          const letra = escritas[k];
          return (
            <button key={k} className={`caixa ${comFicha ? 'com-ficha' : ''} ${acesa === k ? 'acesa' : ''} ${letra ? 'com-letra' : ''} ${etapa === 'letras' && k === pos ? 'agora' : ''}`} onClick={tirarFicha} disabled={etapa !== 'fichas' || k !== fichas - 1} aria-label={`Caixa ${k + 1}`}>
              {letra ? <b>{letra}</b> : comFicha ? <i className="ficha" aria-hidden="true" /> : null}
            </button>
          );
        })}
        {etapa === 'feito' ? <Brilho ativo /> : null}
      </div>
      {etapa === 'fichas' ? (
        <div className="linha-botoes centro">
          <button className="btn grande caixas-monte" onClick={porFicha} disabled={ocupado || fichas >= nCaixas} data-testid="caixas-ficha"><i className="ficha" aria-hidden="true" />Pôr uma ficha</button>
          <button className="btn" onClick={tirarFicha} disabled={ocupado || !fichas}><Icone nome="apagar" />Tirar</button>
          <button className="btn grande verde" onClick={conferirFichas} disabled={ocupado || !fichas} data-testid="caixas-pronto"><Icone nome="check" />Pronto!</button>
        </div>
      ) : null}
      {etapa === 'letras' ? (
        <div className="pecas" role="group" aria-label="Letras móveis">
          {bandeja.map((p) => {
            const brilha = errosLetra >= 2 && p.l === certaAgora;
            return <button key={p.id} className={`peca caixas-letra ${balanca === p.id ? 'balanca' : ''} ${brilha ? 'modelo' : ''}`} onClick={() => void tocarLetra(p.l, p.id)} data-letra={p.l} aria-label={`Letra ${p.l}`}>{p.l}</button>;
          })}
        </div>
      ) : null}
    </div>
  );
}
