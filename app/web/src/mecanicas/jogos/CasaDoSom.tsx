/**
 * CASA DO SOM (D032 §4; docs/pesquisa/47 G3): a criança faz a "encomenda" de um móvel ESCREVENDO o nome dele com letras móveis.
 *  1. A Sofia mostra a figura do móvel no catálogo e diz o nome (palavra inteira; ditado sem modelo, 04 N10). As letras da
 *     bandeja são as da palavra + distratoras já ensinadas (par confundível, U do O final…). Tocar numa letra toca o SOM dela.
 *  2. "Pronto": a escrita dela em cima e a forma certa embaixo, alinhadas letra a letra (como em EscritaPropria). Igual ganha
 *     estrelinha; onde FALTOU ou veio TROCADO um som a Sofia aponta: "Aqui tem mais um som" + o SOM real + "esse som se escreve
 *     com esta letra". Nada em vermelho, sem "errado". Pode escrever de novo SEM o modelo (a forma certa some).
 *  3. O móvel chega sempre (é brincadeira) e vai para a casinha, onde a criança arruma à vontade (CasinhaDoSom).
 * Só conta (regra 4) a palavra certa na 1ª escrita, sem modelo: tentativa AVALIADA 'casa-som' na habilidade de escrita.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as PE } from 'react';
import { FALAS_BIBLIOTECA as B, FALAS_ESCUTA, FALAS_TRILHA_SONS as T, LETRA_POR_ID, comSons, nomeDaFigura, type Fala } from '@fonema/conteudo';
import { alinharEscrita, MOVEIS_CASA, type CasaAlinhada, type EncomendaCasa, type Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { Progressinho, tentativa } from '../comum.tsx';
import { useFala } from '../livre-comum.tsx';
import type { PropsJogoVila } from './vila-comum.tsx';
import './estilos-jogos-vila.css';

export const nomeDoMovel = (w: string) => MOVEIS_CASA.find((m) => m.palavra === w)?.nome ?? w;

type Etapa = 'escrever' | 'comparar' | 'chegando';

export function CasaDoSom({ itens, crianca, sessao, cena, contexto, onFim, aoReceber }: PropsJogoVila<EncomendaCasa> & { aoReceber: (palavra: string) => void }) {
  const enunciado: Fala = { quem: 'sofia', texto: T.ditado };
  const { fala, diz } = useFala(crianca, enunciado);
  const [i, setI] = useState(0);
  const [letras, setLetras] = useState<string[]>([]);
  const [etapa, setEtapa] = useState<Etapa>('escrever');
  const [vez, setVez] = useState<1 | 2>(1);
  const [ocupado, setOcupado] = useState(true);
  const [apontada, setApontada] = useState<number | null>(null);
  const item = itens[i];
  const certo = item.palavra.toUpperCase();
  const sons = useMemo(() => comSons(item.palavra).sons, [item.palavra]);
  const alinhado: CasaAlinhada[] = useMemo(() => (etapa === 'escrever' ? [] : alinharEscrita(letras.join(''), certo)), [etapa, letras, certo]);
  const tentativas = useRef<Tentativa[]>([]);
  const escritas = useRef<string[]>([]);
  const inicio = useRef(Date.now());
  const vivo = useRef(true);
  const tentouDeNovo = useRef(0);

  const dizerPalavra = () => voz.falar(nomeDaFigura(item.palavra), { quem: 'sofia' });

  useEffect(() => {
    vivo.current = true;
    return () => { vivo.current = false; voz.parar(); };
  }, []);
  useEffect(() => {
    let atual = true;
    setLetras([]); setEtapa('escrever'); setVez(1); setApontada(null); setOcupado(true);
    escritas.current = [];
    (async () => {
      if (i === 0) await diz(enunciado);
      if (!atual) return;
      await dizerPalavra();
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const por = (l: string) => {
    if (ocupado || etapa !== 'escrever' || letras.length >= 10) return;
    efeitos.toque();
    setLetras((x) => [...x, l]);
    const f = LETRA_POR_ID[l]?.fonema;
    if (f) void voz.somReal(f, 1);
  };
  const apagar = () => { if (ocupado || !letras.length) return; efeitos.suave(); setLetras((x) => x.slice(0, -1)); };

  /** Registra o item (uma tentativa por encomenda: a 1ª escrita decide; a reescrita entra em `respostas`). */
  const registrar = () => {
    const primeira = escritas.current[0] ?? '';
    const erros = primeira === certo ? 0 : 1;
    tentativas.current.push(tentativa(item.habilidade, sessao, cena, erros, {
      tipo: 'avaliada', mecanica: 'casa-som', alvo: certo, categoria: 'palavra', escolhido: primeira, respostas: [...escritas.current],
      distratores: item.distratoras, tempoMs: Date.now() - inicio.current, tentativaNumero: erros + 1, nivelAjuda: erros ? 'contraste' : 'nenhuma',
      formato: 'ditado-sem-modelo', contexto
    }));
    if (erros && escritas.current[escritas.current.length - 1] === certo) tentouDeNovo.current++;
  };

  const pronto = async () => {
    if (ocupado || !letras.length) return;
    setOcupado(true);
    const escrito = letras.join('');
    escritas.current.push(escrito);
    setEtapa('comparar');
    const casas = alinharEscrita(escrito, certo);
    if (casas.every((c) => c.tipo === 'igual')) {
      efeitos.acerto();
      await diz(B.escIgual);
      await dizerPalavra();
      await receber();
      return;
    }
    efeitos.suave();
    await diz(B.escCompara);
    await dizerPalavra();
    // a Sofia aponta o primeiro som que faltou (ou veio trocado): o SOM real e a letra que escreve esse som
    const k = casas.findIndex((c) => c.tipo === 'faltou' || c.tipo === 'trocou');
    if (k >= 0) {
      const c = casas[k];
      setApontada(k);
      const som = c.pos !== undefined ? sons[c.pos] : null;
      await diz(B.escFaltou);
      if (som) await voz.somReal(som, 2);
      await diz(B.escFaltouLetra);
      await espera(modoTeste() ? 10 : 400);
    } else if (casas.some((c) => c.tipo === 'sobrou')) {
      setApontada(casas.findIndex((c) => c.tipo === 'sobrou'));
      await diz(B.escSobrou);
    }
    if (vez === 1 && vivo.current) await diz(B.escDeNovo);
    setOcupado(false);
  };

  const deNovo = async () => {
    setLetras([]); setApontada(null); setVez(2); setEtapa('escrever'); setOcupado(true);
    await dizerPalavra();
    setOcupado(false);
  };

  /** O móvel chega (sempre: é brincadeira) e vai para a casinha. */
  const receber = async () => {
    setOcupado(true);
    registrar();
    setEtapa('chegando');
    aoReceber(item.palavra);
    await espera(modoTeste() ? 30 : 1400);
    await diz(FALAS_ESCUTA.muitoBem);
    if (!vivo.current) return;
    if (i + 1 < itens.length) setI(i + 1);
    else onFim({ tentativas: tentativas.current, tentouDeNovo: tentouDeNovo.current });
  };

  return (
    <div className="mec jogo-casa" data-testid="casa-som" data-etapa={etapa} data-palavra={item.palavra} data-item={i}>
      <Balao fala={fala} crianca={crianca} />
      <div className="jogo-topo"><Progressinho atual={i} total={itens.length} /></div>
      <div className="cs-encomenda">
        <div className={`cs-catalogo ${etapa === 'chegando' ? 'chegando' : ''}`}>
          <button className="cs-figura" onClick={() => { efeitos.toque(); void dizerPalavra(); }} disabled={ocupado} aria-label="Ouvir o nome do móvel" data-testid="jogo-ouvir">
            <Figura palavra={item.palavra} />
            <span className="cs-ouvir"><Icone nome="som" /></span>
          </button>
          {etapa === 'chegando' ? <div className="cs-caminhao" aria-hidden="true"><span className="cs-caixa"><Figura palavra={item.palavra} /></span></div> : null}
        </div>
        {etapa === 'escrever' ? (
          <div className="escrita-linha cs-linha" aria-label="O que você escreveu" data-testid="escrita-linha">
            {letras.length ? letras.map((l, k) => <b key={k} className="escrita-letra">{l}</b>) : <span className="escrita-vazia">Toque nas letras</span>}
            <i className="escrita-cursor" aria-hidden="true" />
          </div>
        ) : (
          <div className="escrita-confronto" data-testid="escrita-confronto">
            <div className="confronto-fila"><small>Você escreveu</small>
              <div className="confronto-casas">{alinhado.map((c, k) => <span key={k} className={`casa c-${c.tipo} ${apontada === k ? 'apontada' : ''}`}>{c.escrita ?? ''}</span>)}</div>
            </div>
            {(
              <div className="confronto-fila certa"><small>Assim se escreve</small>
                <div className="confronto-casas">{alinhado.map((c, k) => (
                  <span key={k} className={`casa c-${c.tipo} ${apontada === k ? 'apontada' : ''}`}>{c.certa ?? ''}{c.tipo === 'igual' ? <i className="casa-estrela"><Icone nome="estrela" /></i> : null}</span>
                ))}</div>
              </div>
            )}
            {etapa === 'chegando' ? <Brilho ativo /> : null}
          </div>
        )}
      </div>
      {etapa === 'escrever' ? (
        <>
          <div className="pecas cs-bandeja" role="group" aria-label="Letras móveis">
            {item.letras.map((l) => <button key={l} className="peca" onClick={() => por(l)} disabled={ocupado} data-letra={l} aria-label={`Letra ${l}`}>{l}</button>)}
          </div>
          <div className="linha-botoes centro">
            <button className="btn" onClick={apagar} disabled={ocupado || !letras.length}><Icone nome="apagar" />Apagar</button>
            <button className="btn grande verde" onClick={() => void pronto()} disabled={ocupado || !letras.length} data-testid="escrita-pronto"><Icone nome="check" />Pronto!</button>
          </div>
        </>
      ) : etapa === 'comparar' ? (
        <div className="linha-botoes centro">
          {vez === 1 ? <button className="btn grande" onClick={() => void deNovo()} disabled={ocupado} data-testid="escrita-de-novo"><Icone nome="repetir" />Escrever de novo</button> : null}
          <button className="btn grande verde" onClick={() => void receber()} disabled={ocupado} data-testid="casa-receber"><Icone nome="casa" />Receber o móvel</button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * A CASINHA: a criança arruma os móveis à vontade (arrastar com o dedo ou o mouse; também dá para tocar num móvel e depois
 * tocar no lugar). Brincadeira livre (rel. 37 §1.10): nada aqui conta como domínio. O lugar fica salvo no Progresso.
 */
export function CasinhaDoSom({ moveis, posicoes, aoMover, novo }: {
  moveis: string[]; posicoes: Record<string, { x: number; y: number }>; aoMover: (palavra: string, x: number, y: number) => void; novo?: string;
}) {
  const sala = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [local, setLocal] = useState(posicoes);
  const moveu = useRef(false);
  useEffect(() => { setLocal(posicoes); }, [posicoes]);
  const pct = (e: { clientX: number; clientY: number }) => {
    const r = sala.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const inicio = (w: string, e: PE<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastando(w); moveu.current = false; };
  const mover = (w: string, e: PE<HTMLButtonElement>) => {
    if (arrastando !== w) return;
    moveu.current = true;
    const p = pct(e);
    setLocal((l) => ({ ...l, [w]: { x: lim(p.x, 6, 94), y: lim(p.y, 30, 92) } }));
  };
  const soltar = (w: string) => {
    if (arrastando !== w) return;
    setArrastando(null);
    if (moveu.current) { const p = local[w]; if (p) aoMover(w, p.x, p.y); efeitos.toque(); setSelecionado(null); }
    else setSelecionado((s) => (s === w ? null : w));
  };
  const tocarSala = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selecionado || e.target !== e.currentTarget) return;
    const p = pct(e);
    const x = lim(p.x, 6, 94); const y = lim(p.y, 30, 92);
    setLocal((l) => ({ ...l, [selecionado]: { x, y } }));
    aoMover(selecionado, x, y);
    efeitos.toque();
    setSelecionado(null);
  };
  return (
    <div className="cs-casinha" data-testid="casinha">
      <div className="cs-sala" ref={sala} onClick={tocarSala} role="group" aria-label="A sua casinha: arraste os móveis">
        <span className="cs-janela" aria-hidden="true" />
        <span className="cs-quadro" aria-hidden="true" />
        <span className="cs-rodape" aria-hidden="true" />
        {moveis.map((w, k) => {
          const p = local[w] ?? { x: 20 + k * 10, y: 60 };
          return (
            <button key={w} className={`cs-movel ${arrastando === w ? 'arrastando' : ''} ${selecionado === w ? 'selecionado' : ''} ${novo === w ? 'novo' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: Math.round(p.y) } as CSSProperties}
              onPointerDown={(e) => inicio(w, e)} onPointerMove={(e) => mover(w, e)} onPointerUp={() => soltar(w)} onPointerCancel={() => setArrastando(null)}
              aria-label={`${nomeDoMovel(w)}: arraste para mudar de lugar`} data-movel={w}>
              <Figura palavra={w} />
            </button>
          );
        })}
        {!moveis.length ? <p className="cs-vazia">A casinha está vazia. Faça uma encomenda!</p> : null}
      </div>
    </div>
  );
}
