/**
 * D032 item 1 — TUTORIAL "A grande aventura" (2–3 min, tudo falado e animado; a criança toca na seta para seguir).
 *  1. O mundo: o arquipélago com a câmera passeando, Sofia e Tales apresentam as ilhas.
 *  2. O caminho do que vai aprender, etapa por etapa (conteudo/caminho.ts), com "Você está aqui" e as etapas trancadas.
 *  3. Como mexer: um toque (na estrela) e um arraste (moedinha até o porquinho), o botão do som e a setinha de voltar.
 *     É só para aprender a mexer: nada é registrado como tentativa (regra 4; motor/guia.ts).
 *  4. O que ganha: moedinhas, Lojinha (roupas do boneco; barco e carro mais para a frente), selos, álbum e níveis.
 *  5. Os jogos e o "Brincar".
 *  6. A primeira missão e a barrinha dela; termina levando direto à primeira fase.
 * Abre sozinho na primeira vez (depois do boneco), retoma no passo em que parou, o adulto pode pular, e depois de visto
 * só reabre pelo botão "Como jogar?" (rota .../tutorial/de-novo). Menos movimento: sem câmera passeando nem pulsos.
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent as PE } from 'react';
import { FALAS, FALAS_TUTORIAL, FASE_POR_ID, JOGOS_ESCUTA, type Fala } from '@fonema/conteudo';
import { PASSOS_TUTORIAL, estadoDoCaminho, marcarTutorial, missaoDeHoje, passoParaRetomar, type Crianca, type Progresso } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarMini, Carregando } from '../../componentes/basicos.tsx';
import { Figura, Icone } from '../../componentes/ui.tsx';
import { PersonagemVivo, temBustoVivo } from '../../componentes/PersonagemVivo.tsx';
import { BarraMissao, CaminhoEtapas } from '../../componentes/Guia.tsx';
import { asset, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { NOMES_PERSONAGEM, falar, falarVarias, textoTela } from '../../util.ts';
import '../../estilos-tutorial.css';

const F = FALAS_TUTORIAL;
/** Falas de cada passo (o passo 3 fala por partes, conforme a criança faz o toque e o arraste). */
const FALAS_DO_PASSO: Fala[][] = [
  [F.mundo1, F.mundo2, F.mundo3],
  [F.caminho, F.letras, F.palavras, F.frases, F.historias, F.vogais, F.trancadas, F.aqui],
  [F.tocar],
  [F.moedas, F.lojinha, F.selos],
  [F.brincar],
  [F.barra1, F.barra2]
];
const NOME_PASSO = ['O mundo', 'O caminho', 'Como mexer', 'O que você ganha', 'Os jogos', 'A primeira missão'];
/** Revisão 18/11 (item 23): no passo do Brincar, cada brincadeira com a figura 3D da capa dela (como no Brincar), não ícone chapado. */
const FIGURA_JOGO: Record<string, string> = { comprida: 'formiga', escondida: 'sapato', rimas: 'rato', intruso: 'vela', comeco: 'sapo', palmas: 'abacaxi' };
const FIGURA_PASSO = ['arte/icones/mapa.webp', 'figuras/estrela.webp', 'figuras/dedo.webp', 'recompensas/moeda.webp', 'figuras/pandeiro.webp', 'modelos3d/bau.webp'];

type Mexer = 'tocar' | 'arrastar' | 'botoes' | 'pronto';

export function Tutorial({ criancaId, deNovo }: { criancaId: string; deNovo: boolean }) {
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  const [passo, setPasso] = useState<number | null>(null);
  const [k, setK] = useState(-1);
  const [fala, setFala] = useState<Fala | null>(null);
  const [mexer, setMexer] = useState<Mexer>('tocar');
  const [falou, setFalou] = useState(false);
  const prog = useRef<Progresso | undefined>(undefined);
  const turno = useRef(0);
  const primeiraVez = !!progresso && progresso.sessoesFeitas === 0 && !deNovo;

  useEffect(() => { if (progresso) prog.current = progresso; }, [progresso]);
  // passo inicial: retoma de onde parou (só na primeira vez); reaberto pelo botão, do começo
  useEffect(() => {
    if (progresso && passo === null) setPasso(deNovo ? 0 : passoParaRetomar(progresso));
  }, [progresso, passo, deNovo]);

  const salvar = useCallback(async (ev: { passo?: number; fim?: 'visto' | 'pulado' }) => {
    if (!prog.current) return;
    const novo = marcarTutorial(prog.current, ev, Date.now());
    prog.current = novo;
    await salvarProgresso(novo);
  }, [salvarProgresso]);

  /** Fala uma lista; devolve true se terminou sem ser interrompida (troca de passo, "ouvir de novo"). */
  const dizer = useCallback(async (fs: Fala[], c: Crianca) => {
    const meu = ++turno.current;
    setFalou(false);
    await falarVarias(fs, c, (i) => { if (meu === turno.current) { setK(i); setFala(fs[i]); } });
    const ok = meu === turno.current;
    if (ok) setFalou(true);
    return ok;
  }, []);

  // ao entrar num passo: guarda o passo (para retomar) e a dupla fala
  useEffect(() => {
    if (passo === null || !crianca) return;
    setK(-1);
    if (passo === 2) setMexer('tocar');
    if (!deNovo) void salvar({ passo });
    void dizer(FALAS_DO_PASSO[passo], crianca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { turno.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, crianca?.id]);
  useEffect(() => () => voz.parar(), []);

  if (!crianca || !progresso || passo === null) return <Carregando />;

  const ultimo = passo === PASSOS_TUTORIAL - 1;
  const ir = (n: number) => { efeitos.suave(); voz.parar(); setPasso(Math.max(0, Math.min(PASSOS_TUTORIAL - 1, n))); };
  const fase = FASE_POR_ID[progresso.faseAtual];

  const terminar = async () => {
    efeitos.toque();
    voz.parar();
    await salvar({ fim: 'visto' });
    await falar(primeiraVez ? F.primeira : F.continuar, crianca);
    // primeira vez: direto para a primeira fase; reaberto: para a entrada da fase de agora
    navegar(primeiraVez ? `c/${criancaId}/sessao/${progresso.faseAtual}` : `c/${criancaId}/fase/${progresso.faseAtual}`);
  };
  const pular = async () => {
    voz.parar();
    if (!deNovo) await salvar({ fim: 'pulado' });
    navegar(primeiraVez ? `c/${criancaId}/chegada` : `c/${criancaId}/vila`);
  };
  const repetir = () => {
    efeitos.toque();
    if (passo === 2) {
      const fs = mexer === 'tocar' ? [F.tocar] : mexer === 'arrastar' ? [F.arrastar] : [F.ouvir, F.voltar];
      void dizer(fs, crianca);
    } else void dizer(FALAS_DO_PASSO[passo], crianca);
  };

  // passo 3: o toque e o arraste guiados
  const tocouEstrela = async () => {
    if (mexer !== 'tocar') return;
    efeitos.acerto();
    setMexer('arrastar');
    if (await dizer([{ quem: 'sofia', texto: FALAS.acertos[2] }], crianca)) void dizer([F.arrastar], crianca);
  };
  const guardouMoeda = async () => {
    if (mexer !== 'arrastar') return;
    efeitos.moeda();
    setMexer('botoes');
    if (await dizer([{ quem: 'sofia', texto: FALAS.acertos[2] }], crianca)) {
      if (await dizer([F.ouvir, F.voltar], crianca)) setMexer('pronto');
    }
  };

  const pronto = passo !== 2 || mexer === 'pronto';
  return (
    <div className={`tela-tutorial passo-${passo}`} data-testid="tutorial" data-passo={passo}>
      <div className="tut-fundo" aria-hidden="true">
        {passo === 0 ? <div className="tut-camera"><img src={asset('arte/mapa-arquipelago.webp')} alt="" draggable={false} /></div> : <img className="tut-paisagem" src={asset('arte/paisagem-sem-dupla.webp')} alt="" draggable={false} />}
      </div>

      <header className="tut-topo">
        <ol className="tut-passos" aria-label={`Passo ${passo + 1} de ${PASSOS_TUTORIAL}: ${NOME_PASSO[passo]}`}>
          {NOME_PASSO.map((n, i) => (
            <li key={n} className={i < passo ? 'feito' : i === passo ? 'agora' : ''} aria-current={i === passo ? 'step' : undefined}>
              <img src={asset(FIGURA_PASSO[i])} alt="" draggable={false} />
            </li>
          ))}
        </ol>
        <button className="tut-pular" onClick={() => void pular()} data-testid="pular-tutorial" aria-label={deNovo ? 'Fechar o tutorial' : 'Pular o tutorial (para o adulto)'}>
          {deNovo ? <><Icone nome="x" />Fechar</> : <>Pular<small>para o adulto</small></>}
        </button>
      </header>

      <main className="tut-palco" key={passo}>
        {passo === 0 ? <PassoMundo /> : null}
        {passo === 1 ? <PassoCaminho progresso={progresso} crianca={crianca} k={k} /> : null}
        {passo === 2 ? <PassoMexer mexer={mexer} aoTocar={() => void tocouEstrela()} aoGuardar={() => void guardouMoeda()} k={k} /> : null}
        {passo === 3 ? <PassoPremios crianca={crianca} k={k} /> : null}
        {passo === 4 ? <PassoJogos /> : null}
        {passo === 5 ? <PassoMissao progresso={progresso} k={k} titulo={fase?.titulo ?? ''} primeiraVez={primeiraVez} aoComecar={() => void terminar()} /> : null}
      </main>

      <footer className="tut-base">
        <div className="tut-fala vidro" data-quem={fala?.quem ?? 'sofia'} aria-live="polite">
          {fala && temBustoVivo(fala.quem) ? <PersonagemVivo quem={fala.quem} modo="busto" className="rosto" texto={textoTela(fala.texto, crianca)} tamanho={72} /> : <img className="rosto" src={asset('dupla/sofia-busto-alegre.webp')} alt="" style={{ width: 72, height: 72 }} />}
          <p>{fala ? <><b>{NOMES_PERSONAGEM[fala.quem]}</b>{textoTela(fala.texto, crianca)}</> : <b>Sofia</b>}</p>
          <button className="ouvir tut-ouvir" onClick={repetir} aria-label="Ouvir de novo" data-testid="tutorial-ouvir"><Icone nome="som" /></button>
        </div>
        <div className="tut-nav">
          <button className="tut-seta voltar" onClick={() => ir(passo - 1)} disabled={passo === 0} aria-label="Voltar um passo" data-testid="tutorial-voltar"><img src={asset('arte/icones/voltar.webp')} alt="" draggable={false} /></button>
          {/* revisão 18/11 (item 25): no último passo o único botão de seguir é o "Vamos!" do meio (dois botões iguais confundiam) */}
          {ultimo
            ? null
            : <button className={`tut-seta seguir ${pronto && (falou || modoTeste()) ? 'vai' : ''}`} onClick={() => ir(passo + 1)} aria-label="Seguir" data-testid="tutorial-seguir"><Icone nome="seta" /></button>}
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- passos ---------------------------------------------------------------- */

function PassoMundo() {
  return (
    <section className="tut-mundo">
      <h1 className="tut-titulo"><span>A grande</span> aventura</h1>
      <div className="tut-dupla"><PersonagemVivo quem="dupla" modo="corpo" gestos estado="acenando" /></div>
    </section>
  );
}

/** Índice de cada fala do passo 2 → etapas acesas (0 = "Este é o caminho": nenhuma; trancadas: as 4 futuras). */
function etapasAcesas(k: number, atual: number): number[] {
  if (k <= 0) return [];
  if (k <= 5) return [k - 1];
  if (k === 6) return [5, 6, 7, 8];
  return [atual];
}
function PassoCaminho({ progresso, crianca, k }: { progresso: Progresso; crianca: Crianca; k: number }) {
  const atual = Math.max(0, estadoDoCaminho(progresso).findIndex((e) => e.estado === 'agora'));
  const acesas = etapasAcesas(k, atual);
  const vistas = k >= 7 ? [] : Array.from({ length: Math.max(0, Math.min(k - 1, 5)) }, (_, i) => i);
  return (
    <section className="tut-cartao tut-caminho vidro">
      <h2 className="tut-sub">O caminho da leitura</h2>
      <div className={`tut-caminho-wrap ${k >= 7 ? '' : 'revelando'}`}>
        <CaminhoEtapas progresso={progresso} crianca={crianca} destaque={acesas} vistas={vistas} />
      </div>
    </section>
  );
}

function PassoMexer({ mexer, aoTocar, aoGuardar, k }: { mexer: Mexer; aoTocar: () => void; aoGuardar: () => void; k: number }) {
  const moeda = useRef<HTMLButtonElement>(null);
  const porco = useRef<HTMLButtonElement>(null);
  const [arrasto, setArrasto] = useState<{ x: number; y: number; ativo: boolean }>({ x: 0, y: 0, ativo: false });
  const [pegou, setPegou] = useState(false);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const guardada = mexer === 'botoes' || mexer === 'pronto';

  const soltouEmCima = (x: number, y: number) => {
    const r = porco.current?.getBoundingClientRect();
    return !!r && x >= r.left - 30 && x <= r.right + 30 && y >= r.top - 30 && y <= r.bottom + 30;
  };
  const baixo = (e: PE<HTMLButtonElement>) => {
    if (mexer !== 'arrastar') return;
    inicio.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setArrasto({ x: 0, y: 0, ativo: true });
  };
  const move = (e: PE<HTMLButtonElement>) => {
    if (!inicio.current) return;
    setArrasto({ x: e.clientX - inicio.current.x, y: e.clientY - inicio.current.y, ativo: true });
  };
  const cima = (e: PE<HTMLButtonElement>) => {
    if (!inicio.current) return;
    const mexeu = Math.hypot(e.clientX - inicio.current.x, e.clientY - inicio.current.y) > 12;
    inicio.current = null;
    setArrasto({ x: 0, y: 0, ativo: false });
    if (mexeu && soltouEmCima(e.clientX, e.clientY)) aoGuardar();
  };
  // sem arrastar (teclado, leitor de tela, dedo que não arrasta): toca na moedinha e depois no porquinho
  const tocouMoeda = () => { if (mexer === 'arrastar' && !arrasto.ativo) setPegou((p) => !p); };
  const tocouPorco = () => { if (pegou && mexer === 'arrastar') { setPegou(false); aoGuardar(); } };

  return (
    <section className="tut-cartao tut-mexer vidro" data-mexer={mexer}>
      <div className={`tut-mexer-caixa tocar ${mexer === 'tocar' ? 'agora' : 'feito'}`}>
        <span className="tut-mexer-num"><img src={asset('figuras/dedo.webp')} alt="" draggable={false} /></span>
        <button className="tut-estrela" onClick={aoTocar} disabled={mexer !== 'tocar'} aria-label="Toque na estrela" data-testid="tutorial-estrela">
          <img src={asset('figuras/estrela.webp')} alt="" draggable={false} />
          {mexer !== 'tocar' ? <span className="tut-ok"><Icone nome="check" /></span> : <span className="tut-mao" aria-hidden="true" />}
        </button>
      </div>
      <div className={`tut-mexer-caixa arrastar ${mexer === 'arrastar' ? 'agora' : guardada ? 'feito' : 'espera'}`}>
        <div className="tut-arrasto">
          {!guardada ? (
            <button ref={moeda} className={`tut-moeda ${arrasto.ativo ? 'segurando' : ''} ${pegou ? 'pegou' : ''}`} style={{ transform: `translate(${arrasto.x}px, ${arrasto.y}px)` }}
              onPointerDown={baixo} onPointerMove={move} onPointerUp={cima} onPointerCancel={() => { inicio.current = null; setArrasto({ x: 0, y: 0, ativo: false }); }}
              onClick={tocouMoeda} disabled={mexer !== 'arrastar'} aria-label="Moedinha: arraste até o porquinho" aria-pressed={pegou} data-testid="tutorial-moeda">
              <img src={asset('recompensas/moeda.webp')} alt="" draggable={false} />
            </button>
          ) : <span className="tut-moeda-vazia" />}
          <span className="tut-trilha-arrasto" aria-hidden="true" />
          <button ref={porco} className={`tut-porco ${guardada ? 'cheio' : ''}`} onClick={tocouPorco} aria-label="Porquinho" data-testid="tutorial-porquinho">
            <img src={asset('modelos3d/porquinho.webp')} alt="" draggable={false} />
            {guardada ? <span className="tut-ok"><Icone nome="check" /></span> : null}
          </button>
        </div>
      </div>
      <div className={`tut-mexer-caixa botoes ${mexer === 'botoes' || mexer === 'pronto' ? 'agora' : 'espera'}`}>
        <span className={`tut-demo ouvir ${mexer === 'botoes' && k === 0 ? 'aceso' : ''}`} aria-hidden="true"><Icone nome="som" /></span>
        <span className={`tut-demo voltar ${(mexer === 'botoes' && k === 1) || mexer === 'pronto' ? 'aceso' : ''}`} aria-hidden="true"><img src={asset('arte/icones/voltar.webp')} alt="" draggable={false} /></span>
      </div>
    </section>
  );
}

function PassoPremios({ crianca, k }: { crianca: Crianca; k: number }) {
  return (
    <section className="tut-cartao tut-premios vidro">
      <div className={`tut-premio ${k === 0 ? 'aceso' : ''}`}>
        <div className="tut-premio-fig"><img className="tut-porco-g" src={asset('modelos3d/porquinho.webp')} alt="" /><img className="tut-moeda-voa" src={asset('recompensas/moeda.webp')} alt="" /><img className="tut-moeda-voa d2" src={asset('recompensas/moeda.webp')} alt="" /></div>
        <b>Moedinhas</b>
      </div>
      <div className={`tut-premio ${k === 1 ? 'aceso' : ''}`}>
        <div className="tut-premio-fig loja">
          <img src={asset('arte/icones/lojinha.webp')} alt="" />
          <span className="tut-boneco"><AvatarMini crianca={crianca} tamanho={70} /></span>
        </div>
        <b>Lojinha</b>
        <div className="tut-depois" aria-label="Mais para a frente: barco e carro">
          <span><img src={asset('figuras/barco-motor.webp')} alt="" /><i><img src={asset('arte/icones/cadeado.webp')} alt="" /></i></span>
          <span><img src={asset('figuras/carrinho.webp')} alt="" /><i><img src={asset('arte/icones/cadeado.webp')} alt="" /></i></span>
        </div>
      </div>
      <div className={`tut-premio ${k === 2 ? 'aceso' : ''}`}>
        <div className="tut-premio-fig"><img src={asset('arte/icones/album.webp')} alt="" /><img className="tut-trofeu" src={asset('modelos3d/trofeu.webp')} alt="" /></div>
        <b>Selos e álbum</b>
        <span className="tut-niveis" aria-label="Níveis"><i className="cheia" /><i className="cheia" /><i /><em>Nível</em></span>
      </div>
    </section>
  );
}

function PassoJogos() {
  return (
    <section className="tut-cartao tut-jogos vidro">
      <div className="tut-brincar">
        <span className="tut-brincar-btn"><img src={asset('figuras/pandeiro.webp')} alt="" /><b>Brincar</b></span>
        <span className="tut-mao-aponta" aria-hidden="true" />
      </div>
      <ul className="tut-jogos-lista" aria-label="Alguns jogos">
        {JOGOS_ESCUTA.slice(0, 6).map((j, i) => (
          <li key={j.id} className={`cor-${j.cor}`} style={{ ['--i' as string]: i }}>{FIGURA_JOGO[j.id] ? <Figura palavra={FIGURA_JOGO[j.id]} /> : <Icone nome={j.icone} />}<span>{j.nome}</span></li>
        ))}
      </ul>
    </section>
  );
}

function PassoMissao({ progresso, k, titulo, primeiraVez, aoComecar }: { progresso: Progresso; k: number; titulo: string; primeiraVez: boolean; aoComecar: () => void }) {
  const passos = missaoDeHoje(progresso, Date.now()).passos;
  // a barrinha enche sozinha enquanto a Sofia explica (só demonstração)
  const [feitos, setFeitos] = useState(0);
  useEffect(() => {
    if (k < 0) return;
    const alvo = k >= 1 ? passos : Math.ceil(passos / 2);
    if (feitos >= alvo) return;
    const t = setTimeout(() => setFeitos((f) => Math.min(alvo, f + 1)), modoTeste() ? 10 : 650);
    return () => clearTimeout(t);
  }, [k, feitos, passos]);
  return (
    <section className="tut-cartao tut-missao vidro">
      <p className="tut-missao-sobre">{primeiraVez ? 'A primeira missão' : 'A missão de agora'}</p>
      <h2 className="tut-missao-titulo">{titulo}</h2>
      <BarraMissao passos={passos} feitos={feitos} agora={feitos < passos ? feitos : undefined} grande rotulo="Barrinha da missão (exemplo)" />
      <button className="btn enorme ipe brilha tut-comecar" onClick={aoComecar} data-testid="tutorial-comecar"><Icone nome="play" />Vamos!</button>
    </section>
  );
}
