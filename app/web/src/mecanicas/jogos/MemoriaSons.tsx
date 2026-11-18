/**
 * MEMÓRIA DOS SONS (fila do dono nº 17; docs/pesquisa/46 §"O que levamos" item 2; regras em motor/src/memoria-sons.ts).
 * Duas grades de cartas viradas: em cima as CENAS DO SOM (no nível 4, cartas de SOM com alto-falante), embaixo as LETRAS.
 * A criança vira uma de cada grade e acha os pares. A carta da cena TOCA O SOM PURO ao virar (regra 1: nunca o nome);
 * a carta da letra só toca no nível 1 (exposição); nos outros ela é muda até o par fechar (regra 3: senão o par se faria
 * comparando dois sons iguais, sem ler a letra).
 * Correção do erro com decisão: "Essa letra faz este som:" + som da letra, "Essa cena faz este som:" + som da cena (clipes
 * gravados). Depois de 2 erros com decisão no mesmo som, a letra certa brilha (vale "com ajuda").
 * Moedinhas que pulam no par são só enfeite (nenhuma é dada). Sem cronômetro, sem ranking. "Menos movimento": sem giro 3D.
 */
import { PAUSA_ENTRE_SONS_MS } from '../contraste.ts';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS, FALAS_ESCUTA, FALAS_FONICAS, type Fala } from '@fonema/conteudo';
import type { CartaMemoria, Crianca, JogadaMemoria, RodadaMemoria, Tentativa } from '@fonema/motor';
import { tentativasDaMemoria } from '@fonema/motor';
import { Balao, Brilho } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { asset, espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { textoVoz } from '../../util.ts';
import './estilos-memoria.css';
import { letraAa } from '../../componentes/LetraAa.tsx';

const F = FALAS_FONICAS;

/** Enunciados: "Ligue cada letra à cena…" já tem clipe (Tales); o do "só ouvindo" e o do olhar ainda não (falas-pendentes §1g). */
export const ENUNCIADO_MEMORIA: Fala = { quem: 'tales', texto: F.ligaOSom };
export const ENUNCIADO_SO_OUVINDO: Fala = { quem: 'sofia', texto: 'Vire uma carta de som e ache a letra que faz esse som.' };
export const FALA_OLHAR: Fala = { quem: 'sofia', texto: 'Olhe as cartas e toque para ouvir. Depois a gente vira.' };

export interface ResultadoMemoria { tentativas: Tentativa[]; jogadas: JogadaMemoria[] }

export function MemoriaSons({ rodada, crianca, sessao, cena, contexto, onFim }: {
  rodada: RodadaMemoria; crianca: Crianca; sessao: string; cena: string; contexto: 'livre' | 'desafio'; onFim: (r: ResultadoMemoria) => void;
}) {
  const n1 = rodada.nivel === 1;
  const soOuvindo = rodada.nivel === 4;
  const [etapa, setEtapa] = useState<'olhar' | 'jogar' | 'fim'>(n1 ? 'olhar' : 'jogar');
  const [fala, setFala] = useState<Fala>(n1 ? FALA_OLHAR : soOuvindo ? ENUNCIADO_SO_OUVINDO : ENUNCIADO_MEMORIA);
  const [abertas, setAbertas] = useState<string[]>([]);
  const [feitas, setFeitas] = useState<string[]>([]);
  const [brilha, setBrilha] = useState<string | null>(null);
  const [errada, setErrada] = useState<string[]>([]);
  const [moeda, setMoeda] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [tocando, setTocando] = useState<string | null>(null);
  const vivo = useRef(true);
  const vistas = useRef(new Set<string>());
  const jogadas = useRef<JogadaMemoria[]>([]);
  const erros = useRef<Record<string, number>>({});
  const ouviu = useRef<Record<string, number>>({});
  const brilhou = useRef(new Set<string>());
  const inicio = useRef(Date.now());
  const rapido = modoTeste();

  const diz = async (f: Fala) => {
    if (!vivo.current) return;
    setFala(f);
    await voz.falar(textoVoz(f.texto, crianca), { quem: f.quem === 'tales' ? 'tales' : 'sofia' });
  };
  const tocar = async (c: CartaMemoria, vezes = 1) => {
    setTocando(c.id);
    await voz.somReal(c.som, vezes);
    if (vivo.current) setTocando((t) => (t === c.id ? null : t));
  };

  useEffect(() => {
    vivo.current = true;
    void diz(n1 ? FALA_OLHAR : soOuvindo ? ENUNCIADO_SO_OUVINDO : ENUNCIADO_MEMORIA);
    return () => { vivo.current = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todas = [...rodada.cenas, ...rodada.letras];
  const porId = (id: string) => todas.find((c) => c.id === id)!;
  const virada = (c: CartaMemoria) => etapa === 'olhar' || abertas.includes(c.id) || feitas.includes(c.letra);

  /** Etapa de olhar (nível 1): todas abertas; tocar só ouve. Exposição: nada é registrado. */
  const comecar = async () => {
    efeitos.toque();
    for (const c of todas) vistas.current.add(c.id);
    setEtapa('jogar');
    inicio.current = Date.now();
    await diz(ENUNCIADO_MEMORIA);
  };

  const resolver = async (cCena: CartaMemoria, cLetra: CartaMemoria, segundaJaVista: boolean) => {
    setOcupado(true);
    const alvo = cCena.letra;
    const certo = cLetra.letra === alvo;
    const naMesa = rodada.letras.filter((l) => !feitas.includes(l.letra)).length;
    jogadas.current.push({
      alvo, escolhida: cLetra.letra, decisao: segundaJaVista, em: Date.now(), naMesa,
      posEscolhida: rodada.letras.findIndex((l) => l.id === cLetra.id), posCerta: rodada.letras.findIndex((l) => l.letra === alvo),
      ...(brilhou.current.has(alvo) ? { brilhou: true } : {}), ...(ouviu.current[alvo] ? { ouviuDeNovo: ouviu.current[alvo] } : {})
    });
    ouviu.current[alvo] = 0;
    if (certo) {
      efeitos.acerto();
      const novas = [...feitas, alvo];
      setFeitas(novas);
      setAbertas([]);
      setBrilha(null);
      setMoeda(alvo);
      // o par fechou: agora a letra "fala" o seu som (confirmação; já não responde nada)
      await tocar(cLetra, 1);
      if (!vivo.current) return;
      if (novas.length === rodada.pares.length) {
        setEtapa('fim');
        await diz(FALAS_ESCUTA.muitoBem);
        await espera(rapido ? 40 : 900);
        if (!vivo.current) return;
        const r = tentativasDaMemoria({ rodada, jogadas: jogadas.current, sessao, cena, contexto, inicio: inicio.current });
        onFim({ tentativas: r.tentativas, jogadas: jogadas.current });
        return;
      }
      if (novas.length % 2 === 0) await diz({ quem: 'sofia', texto: FALAS.acertos[novas.length % FALAS.acertos.length] });
      setOcupado(false);
      return;
    }
    setErrada([cCena.id, cLetra.id]);
    efeitos.suave();
    if (segundaJaVista && !n1) {
      // erro com decisão: correção contrastiva curta (os dois sons), sem dizer a resposta nem o nome da letra
      erros.current[alvo] = (erros.current[alvo] ?? 0) + 1;
      await diz({ quem: 'sofia', texto: F.letraFaz });
      await tocar(cLetra, 1);
      await espera(rapido ? 10 : PAUSA_ENTRE_SONS_MS);
      await diz({ quem: 'sofia', texto: F.cenaFaz });
      await tocar(cCena, 1);
    } else {
      await espera(rapido ? 40 : 1100);
    }
    if (!vivo.current) return;
    setErrada([]);
    setAbertas([]);
    setOcupado(false);
  };

  const virar = async (c: CartaMemoria) => {
    if (ocupado || etapa === 'fim') return;
    if (etapa === 'olhar') {
      efeitos.toque();
      // olhar: a cena e a letra tocam o som (nível 1 = exposição; nada conta)
      await tocar(c, 1);
      return;
    }
    if (feitas.includes(c.letra)) return;
    if (abertas.includes(c.id)) {
      // tocar na carta aberta: ouvir de novo (a da letra só no nível 1)
      if (c.lado === 'cena' || n1) { ouviu.current[c.letra] = (ouviu.current[c.letra] ?? 0) + (c.lado === 'cena' ? 1 : 0); efeitos.toque(); await tocar(c, 1); }
      return;
    }
    const outra = abertas.map(porId).find((x) => x.lado === c.lado);
    if (outra) return; // já há uma carta deste lado aberta: vire uma do outro lado
    efeitos.toque();
    const jaVista = vistas.current.has(c.id);
    vistas.current.add(c.id);
    const novas = [...abertas, c.id];
    setAbertas(novas);
    const par = novas.map(porId);
    const cCena = par.find((x) => x.lado === 'cena');
    const cLetra = par.find((x) => x.lado === 'letra');
    if (c.lado === 'cena') {
      // depois de 2 erros com decisão neste som, a letra certa brilha (ajuda: a tentativa fica "com ajuda")
      if ((erros.current[c.letra] ?? 0) >= 2 && !cLetra) { brilhou.current.add(c.letra); setBrilha(`l-${c.letra}`); }
      await tocar(c, 1);
    } else if (n1) await tocar(c, 1);
    if (cCena && cLetra) {
      await espera(rapido ? 10 : 350);
      await resolver(cCena, cLetra, jaVista);
    }
  };

  const carta = (c: CartaMemoria, k: number) => {
    const v = virada(c);
    const feita = feitas.includes(c.letra);
    const rotulo = c.lado === 'cena' ? (soOuvindo ? 'Carta de som' : 'Carta de cena') : 'Carta de letra';
    return (
      <button key={c.id} type="button" className={`mem-carta lado-${c.lado} ${v ? 'virada' : ''} ${feita ? 'feita' : ''} ${errada.includes(c.id) ? 'errada' : ''} ${brilha === c.id ? 'brilha' : ''} ${tocando === c.id ? 'tocando' : ''}`}
        style={{ ['--k' as string]: k } as CSSProperties} onClick={() => void virar(c)} disabled={feita && etapa !== 'olhar'}
        aria-label={`${rotulo} ${k + 1}${v ? (c.lado === 'letra' ? `: letra ${c.letra}` : soOuvindo ? ': toque para ouvir' : ': cena') : ', virada para baixo'}`}
        data-carta={c.id} data-par={c.letra} data-virada={v ? '1' : undefined} data-feita={feita ? '1' : undefined}>
        <span className="mem-giro">
          <span className="mem-verso" aria-hidden="true"><i className="mem-verso-selo"><Icone nome={c.lado === 'letra' ? 'estrela' : 'som'} /></i></span>
          <span className="mem-frente" aria-hidden="true">
            {c.lado === 'letra' ? <b className="mem-letra">{letraAa(c.letra)}</b>
              : c.cena ? <Figura palavra={c.cena} className="mem-fig" />
              : <span className="mem-som"><Icone nome="som" /><span className="mem-ondas"><i /><i /><i /></span></span>}
            {c.lado === 'cena' && c.cena ? <span className="mem-som-mini"><Icone nome="som" /></span> : null}
          </span>
        </span>
        {feita && c.lado === 'letra' ? <Brilho ativo /> : null}
        {moeda === c.letra && c.lado === 'letra' ? <img className="mem-moeda" src={asset('recompensas/moeda.webp')} alt="" aria-hidden="true" onAnimationEnd={() => setMoeda(null)} /> : null}
      </button>
    );
  };

  const cols = (n: number) => ({ ['--n' as string]: n } as CSSProperties);
  return (
    <div className={`mec jogo-memoria nivel-${rodada.nivel}`} data-testid="memoria" data-etapa={etapa} data-nivel={rodada.nivel} data-ocupado={ocupado ? '1' : undefined}>
      <Balao fala={fala} crianca={crianca} />
      <div className="mem-mesa">
        <div className={`mem-grade mem-cenas ${rodada.cenas.length > 4 ? 'muitas' : ''}`} style={cols(rodada.cenas.length)} role="group" aria-label={soOuvindo ? 'Cartas de som' : 'Cartas de cena'}>
          {rodada.cenas.map(carta)}
        </div>
        <div className="mem-divisa" aria-hidden="true"><span>{feitas.length} / {rodada.pares.length}</span></div>
        <div className={`mem-grade mem-letras ${rodada.letras.length > 4 ? 'muitas' : ''}`} style={cols(rodada.letras.length)} role="group" aria-label="Cartas de letra">
          {rodada.letras.map(carta)}
        </div>
      </div>
      {etapa === 'olhar' ? (
        <div className="linha-botoes centro">
          <button className="btn grande verde" onClick={() => void comecar()} data-testid="memoria-virar"><Icone nome="repetir" />Virar as cartas</button>
        </div>
      ) : null}
    </div>
  );
}
