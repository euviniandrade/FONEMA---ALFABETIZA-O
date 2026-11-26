/**
 * JOGOS FÔNICOS: a moldura dos dois jogos.
 *  - `TelaJogoFonico` (Brincar › Jogos): escolher a variação aberta pelo que já foi ensinado, jogar uma rodada curta e ver o
 *    fim ("Jogo feito!"). Respostas conferidas vão para o motor no contexto 'livre' (sem moedinhas).
 *  - `JogoNaFase` (desafio opcional dentro de uma fase): a cena "som → letra" vira Corre-Som e a "som → figura" vira
 *    Bichinho Come-Som, com OS MESMOS ITENS da fase; as tentativas voltam para a sessão no contexto 'desafio'.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { FALAS_ALFABETO, FALAS_FONICAS, LETRA_POR_ID, nomeDoJogo, treinaDoJogo, type AtividadeEscolher, type Fala } from '@fonema/conteudo';
import { ESCOLHAS_POR_RODADA, NIVEL_MAXIMO, desafioDaCena, montarOndas, montarRodada, proximoNivel, variacoesDoJogo, type Crianca, type JogoFonicoId, type Progresso, type VariacaoJogo } from '@fonema/motor';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { voz } from '../../servicos/voz.ts';
import { sementeDaTentativa, sortearItens } from '../comum.tsx';
import { ComeSom } from './ComeSom.tsx';
import { Falta, useMissoesAteAbrir } from '../../componentes/Desbloqueio.tsx';
import { CorreSom, type ResultadoJogo, type ResumoCorrida } from './CorreSom.tsx';
import { ResultadoCorrida } from './CorridaResultado.tsx';
import './estilos-jogos.css';
import { letraAa } from '../../componentes/LetraAa.tsx';

export interface InfoJogo {
  id: JogoFonicoId;
  nome: string;
  treina: string;
  cor: string;
  capa: string[];
  variacoes: { id: VariacaoJogo; nome: string; treina: string; enunciado: Fala; capa: string[] }[];
}

/** Nomes e textos do projeto (regra 9). Enunciados: falas já gravadas, exceto o do "termina com" (falas-pendentes §1c). */
export const JOGOS_FONICOS: InfoJogo[] = [
  {
    id: 'corre-som', get nome() { return nomeDoJogo('corre-som', 'Corre-Som'); }, get treina() { return treinaDoJogo('corre-som', 'Ouvir o som e correr para a letra certa'); }, cor: 'coral', capa: ['letra:M', 'letra:A', 'letra:S'],
    variacoes: [
      { id: 'letra', nome: 'Letras', treina: 'Ouve o som e passa no arco da letra', enunciado: { quem: 'sofia', texto: FALAS_ALFABETO.acheALetra }, capa: ['letra:F', 'letra:V'] },
      { id: 'figura', nome: 'Figuras', treina: 'Ouve o som e passa na figura que começa com ele', enunciado: { quem: 'sofia', texto: FALAS_FONICAS.qualFigura }, capa: ['foca', 'vaca'] }
    ]
  },
  {
    id: 'come-som', get nome() { return nomeDoJogo('come-som', 'Bichinho Come-Som'); }, get treina() { return treinaDoJogo('come-som', 'Dar ao Bolota a comida que começa com o som'); }, cor: 'verde', capa: ['uva', 'abacaxi', 'banana'],
    variacoes: [
      { id: 'inicio', nome: 'Começa com', treina: 'A comida que começa com o som', enunciado: { quem: 'sofia', texto: FALAS_FONICAS.qualFigura }, capa: ['uva', 'pipoca'] },
      { id: 'fim', nome: 'Termina com', treina: 'A comida que termina com o som', enunciado: { quem: 'sofia', texto: 'Qual figura termina com este som?' }, capa: ['jaca', 'peixe'] }
    ]
  }
];
export const JOGO_FONICO_POR_ID: Record<string, InfoJogo> = Object.fromEntries(JOGOS_FONICOS.map((j) => [j.id, j]));

const chaveDemo = (c: string, j: string, v: string) => `fonema-demo-jogo:${c}:${j}:${v}`;
const jaViu = (c: string, j: string, v: string) => { try { return localStorage.getItem(chaveDemo(c, j, v)) === '1'; } catch { return true; } };
const marcarVisto = (c: string, j: string, v: string) => { try { localStorage.setItem(chaveDemo(c, j, v), '1'); } catch { /* sem armazenamento */ } };
/** D035: nível da corrida do Corre-Som, por criança e variação (sobe ao bater a meta; guardado no aparelho). */
const chaveNivel = (c: string, v: string) => `fonema-corre-nivel:${c}:${v}`;
const nivelGuardado = (c: string, v: string) => { try { return Math.max(1, Math.min(NIVEL_MAXIMO, Number(localStorage.getItem(chaveNivel(c, v))) || 1)); } catch { return 1; } };
const guardarNivel = (c: string, v: string, n: number) => { try { localStorage.setItem(chaveNivel(c, v), String(n)); } catch { /* sem armazenamento */ } };
/** Ondas de sobra para a corrida inteira (o tempo é que acaba). */
const ONDAS_POR_CORRIDA = 40;

/** Quais sons têm clipe (só eles viram estímulo: regra 1). */
export function useSonsComClipe(): Set<string> | null {
  const [sons, setSons] = useState<Set<string> | null>(null);
  useEffect(() => {
    let vivo = true;
    const todos = [...new Set(Object.values(LETRA_POR_ID).map((l) => l.fonema).filter(Boolean) as string[])];
    void Promise.all(todos.map(async (f) => [f, await voz.temSomReal(f)] as const)).then((r) => { if (vivo) setSons(new Set(r.filter(([, ok]) => ok).map(([f]) => f))); });
    return () => { vivo = false; };
  }, []);
  return sons;
}

/** Miniatura de capa: letra desenhada ou figura. */
export function Capa({ itens }: { itens: string[] }) {
  return (
    <span className="jogo-capa" aria-hidden="true">
      {itens.map((x) => (x.startsWith('letra:') ? <b key={x} className="jogo-capa-letra">{letraAa(x.slice(6))}</b> : <Figura key={x} palavra={x} />))}
    </span>
  );
}

/* ------------------------------------------------------------ desafio dentro da fase ------------------------------------------------------------ */

/** A cena da fase vira jogo? (mesmos itens; sorteio igual ao do Escolher). */
export function useDesafioDaCena(atividade: AtividadeEscolher) {
  return useMemo(() => {
    if (atividade.gerador) return null;
    const semente = sementeDaTentativa();
    const d = desafioDaCena(atividade, semente);
    if (!d) return null;
    return { ...d, itens: sortearItens(d.itens, atividade.sortear, semente) };
  }, [atividade]);
}

export function JogoNaFase({ desafio, atividade, crianca, sessao, cenaId, revisao, onFim }: {
  desafio: NonNullable<ReturnType<typeof useDesafioDaCena>>; atividade: AtividadeEscolher; crianca: Crianca; sessao: string; cenaId: string; revisao?: boolean; onFim: (r: ResultadoJogo) => void;
}) {
  const props = { itens: desafio.itens, crianca, sessao, cena: cenaId, contexto: revisao ? 'revisao' as const : 'desafio' as const, enunciado: atividade.enunciado, onFim };
  return desafio.jogo === 'corre-som' ? <CorreSom {...props} /> : <ComeSom {...props} />;
}

/* ------------------------------------------------------------ Brincar › Jogos ------------------------------------------------------------ */

export function TelaJogoFonico({ jogo, crianca, progresso, sessao, onSalvar, onVoltar }: {
  jogo: InfoJogo; crianca: Crianca; progresso: Progresso; sessao: string;
  /** Devolve as moedinhas da Lojinha creditadas (D035: corrida com estrelas). */
  onSalvar: (variacao: VariacaoJogo, r: ResultadoJogo) => Promise<number | void>; onVoltar: () => void;
}) {
  const sons = useSonsComClipe();
  const [variacao, setVariacao] = useState<VariacaoJogo | null>(null);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<{ acertos: number; total: number; corrida?: ResumoCorrida; moedinhas?: number } | null>(null);
  const corrida = jogo.id === 'corre-som';
  const [nivel, setNivel] = useState(1);
  // D035: a pista 3D começa a carregar já na escolha da variação (sem "esperando a pista" na largada)
  useEffect(() => { if (corrida) void import('./corre-som-3d.ts').catch(() => undefined); }, [corrida]);
  useEffect(() => { if (variacao && corrida) setNivel(nivelGuardado(crianca.id, variacao)); }, [variacao, corrida, crianca.id]);
  const temSom = useMemo(() => (sons ? (f: string) => sons.has(f) : undefined), [sons]);
  const estados = useMemo(() => (temSom ? variacoesDoJogo(progresso, jogo.id, temSom) : []), [progresso, jogo.id, temSom]);
  const plano = useMemo(() => {
    if (!variacao || !temSom) return null;
    const demo = !jaViu(crianca.id, jogo.id, variacao);
    if (corrida) {
      const n = nivelGuardado(crianca.id, variacao);
      const ondas = montarOndas(progresso, variacao as 'letra' | 'figura', n, { semente: sementeDaTentativa() || 1 + rodada, temSom, ondas: ONDAS_POR_CORRIDA + 1 });
      if (!ondas.length) return null;
      return demo ? { demo: ondas[0].arcos[0], itens: ondas.slice(1).flatMap((o) => o.arcos), ondas: ondas.slice(1), nivel: n } : { demo: null, itens: ondas.flatMap((o) => o.arcos), ondas, nivel: n };
    }
    const itens = montarRodada(progresso, jogo.id, { variacao, semente: sementeDaTentativa() || 1 + rodada, temSom, n: ESCOLHAS_POR_RODADA[jogo.id] + (demo ? 1 : 0) });
    if (!itens.length) return null;
    return demo ? { demo: itens[0], itens: itens.slice(1), ondas: undefined, nivel: undefined } : { demo: null, itens, ondas: undefined, nivel: undefined };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variacao, temSom, rodada, nivel]);
  const info = jogo.variacoes.find((v) => v.id === variacao);
  const missoes = useMissoesAteAbrir(progresso);

  if (!sons) return <div className="jogo-carregando"><span className="carregando-bola" aria-hidden="true" /></div>;

  if (fim?.corrida && info && variacao) {
    const c = fim.corrida;
    const sobe = c.bateuMeta && (c.nivel ?? 1) < NIVEL_MAXIMO;
    return (
      <ResultadoCorrida resumo={c} moedinhas={fim.moedinhas}
        onProximo={sobe ? () => { setFim(null); setNivel(nivelGuardado(crianca.id, variacao)); setRodada((r) => r + 1); } : undefined}
        onDeNovo={() => { setFim(null); setRodada((r) => r + 1); }}
        onOutra={() => { setFim(null); setVariacao(null); }} />
    );
  }

  if (fim && info) {
    return (
      <section className="cartao biblio-feito jogo-fim" data-testid="jogo-fim">
        <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
        <h1 className="t">Jogo feito!</h1>
        <p>{`Você acertou ${fim.acertos} de ${fim.total} de primeira.`}</p>
        <div className="linha-botoes centro">
          <button className="btn grande" onClick={() => { setFim(null); setRodada((r) => r + 1); }} data-testid="jogo-de-novo"><Icone nome="repetir" />Jogar de novo</button>
          <button className="btn grande ipe" onClick={() => { setFim(null); setVariacao(null); }} data-testid="jogo-outra"><Icone nome="seta-esq" />Escolher outro</button>
        </div>
      </section>
    );
  }

  if (variacao && plano && info) {
    const props = {
      itens: plano.itens, demo: plano.demo, crianca, sessao, cena: `livre-${jogo.id}`, contexto: 'livre' as const, enunciado: info.enunciado,
      ...(plano.ondas ? { ondas: plano.ondas, nivel: plano.nivel } : {}),
      onFim: async (r: ResultadoJogo) => {
        if (plano.demo) marcarVisto(crianca.id, jogo.id, variacao);
        // D035: bateu a meta = o próximo nível abre (nunca desce)
        if (r.corrida?.nivel) guardarNivel(crianca.id, variacao, proximoNivel(r.corrida.nivel, r.corrida.pontos));
        const moedinhas = await onSalvar(variacao, r);
        setFim({ acertos: r.tentativas.filter((t) => t.acertou && !t.comAjuda).length, total: r.tentativas.length, corrida: r.corrida, moedinhas: moedinhas || 0 });
      }
    };
    return (
      <section className={`cartao atividade jogo-cartao jogo-${jogo.id}`} key={`${variacao}-${rodada}`}>
        <h2 className="titulo-cena t"><Icone nome={jogo.id === 'corre-som' ? 'raio' : 'coracao'} />{jogo.nome} · {info.nome}</h2>
        {jogo.id === 'corre-som' ? <CorreSom {...props} /> : <ComeSom {...props} />}
      </section>
    );
  }

  return (
    <section className="cartao jogo-variacoes" data-testid="jogo-variacoes" data-jogo={jogo.id}>
      <header className="jogo-variacoes-cab">
        <Capa itens={jogo.capa} />
        <div>
          <h1 className="t">{jogo.nome}</h1>
          <p>{jogo.treina}</p>
        </div>
      </header>
      <div className="jogo-variacoes-grade">
        {jogo.variacoes.map((v, k) => {
          const e = estados.find((x) => x.variacao === v.id);
          const aberta = !!e?.liberada;
          return (
            <button key={v.id} className={`jogo-variacao cor-${jogo.cor} ${aberta ? '' : 'trancada'}`} style={{ ['--k' as string]: k } as CSSProperties}
              disabled={!aberta} onClick={() => setVariacao(v.id)} data-testid={`variacao-${v.id}`}>
              <Capa itens={v.capa} />
              <b>{v.nome}</b>
              {aberta ? <small>{v.treina}</small> : <Falta texto={e?.motivo} n={missoes[`jogo:${jogo.id}:${v.id}`]} compacto />}
              {aberta && e?.aquecimento ? <span className="etiqueta-aquecimento" data-testid="aquecimento">Para aquecer: ganha mais sons a cada missão</span> : null}
              {!aberta ? <span className="jogo-cadeado" aria-hidden="true"><Icone nome="cadeado" /></span> : null}
            </button>
          );
        })}
      </div>
      <p className="brincar-nota">Só entram os sons que você já estudou na trilha. Pode jogar quantas vezes quiser.</p>
      <div className="linha-botoes centro"><button className="btn ipe" onClick={onVoltar}><Icone nome="seta-esq" />Outros jogos</button></div>
    </section>
  );
}

