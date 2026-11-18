/**
 * CORRE-SOM em CORRIDA (D035; fila do dono nº 27, ponto 3; antes D032 §4 e pesquisa 47 G1). Pedido do dono (18/11): "O jogo
 * não pode ficar parando: automático, rápido e instantâneo; ela tem que identificar. Entrou pela porta errada: um xizinho e
 * perde ponto. Tempo… objetivo e premiação… sem ficar falando a letra o tempo inteiro. Letras sempre Aa."
 *
 *  - A pista NUNCA para: o boneco corre sozinho e os arcos vêm em ONDAS. No começo de cada onda toca UMA vez o SOM PURO da
 *    letra-alvo (regra 1); só depois de ele tocar inteiro os arcos da onda são lançados (o tempo de resposta conta daí).
 *  - A criança troca de pista (deslizar, setas/A-D, tocar na pista) e passa pelo arco que quiser: passou = escolheu.
 *    Certo: brilho + som curto + "+N". Errado: ✖ + som curto + "−5", a letra certa aparece 1 s no canto e a corrida segue.
 *    A correção completa (os dois sons, lado a lado) fica para o fim da corrida.
 *  - Pontos (motor › corre-som-corrida.ts): moedinha +1, pulo de almofada e sequência +2, letra certa +10 × sequência, errada −5.
 *  - Brincar (`nivel` informado): corrida com tempo e meta; estrelas, selo e moedinhas da Lojinha no fim (TelaJogoFonico).
 *    Fase (desafio, revisão, lições de vogal): os itens da fase em sequência, sem relógio; acaba quando os itens acabam.
 *  - Registro: cada passagem é UMA tentativa avaliada (`formato: 'corrida'`, D035); pontos/estrelas/tempo nunca contam (regra 4).
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS_ESCUTA, type Fala } from '@fonema/conteudo';
import { aparenciaDe, temWebGL } from '../../avatar3d/index.ts';
import type { Crianca, ItemJogo, OndaCorrida, OpcaoJogo, PlacarCorrida, Tentativa } from '@fonema/motor';
import { bateuMeta, estrelasDaCorrida, idDoRegistro, nivelDaCorrida, ondasDaFase, placarInicial, pontuar, tempoDeChegadaMs, tentativaDaCorrida } from '@fonema/motor';
import { Balao } from '../../componentes/basicos.tsx';
import { Figura, Icone, caminhoFigura } from '../../componentes/ui.tsx';
import { LetraAa, letraAa } from '../../componentes/LetraAa.tsx';
import { useApp } from '../../contexto.tsx';
import { efeitos } from '../../servicos/efeitos.ts';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { textoVoz } from '../../util.ts';
import { dizerFigura, tocarSom } from './correcao.ts';
import type { MotorCorrida, PlacaArco, PortalCorrida } from './corrida-motor.ts';
import { PistaCorrida2D } from './corre-som-2d.ts';
import { ResultadoCorrida } from './CorridaResultado.tsx';
import './estilos-jogos.css';

export interface ErroCorrida { alvo: OpcaoJogo; escolhida: OpcaoJogo; formato: ItemJogo['formato'] }
export interface ResumoCorrida {
  pontos: number; meta: number | null; estrelas: 0 | 1 | 2 | 3; nivel: number | null; bateuMeta: boolean;
  acertos: number; erros: number; melhorSequencia: number; moedas: number; erradas: ErroCorrida[];
}
export interface ResultadoJogo { tentativas: Tentativa[]; tentouDeNovo: number; corrida?: ResumoCorrida }
export interface PropsJogoFonico {
  itens: ItemJogo[];
  crianca: Crianca;
  sessao: string;
  cena: string;
  contexto: 'livre' | 'desafio' | 'revisao';
  enunciado: Fala;
  /** R12: na primeira vez do jogo, a guia faz um item de exemplo (não vale). */
  demo?: ItemJogo | null;
  /** D035 (Brincar): corrida com tempo e meta do nível; as ondas vêm do motor (montarOndas). */
  nivel?: number;
  ondas?: OndaCorrida[];
  onFim: (r: ResultadoJogo) => void;
}

type Fase = 'carregando' | 'largada' | 'correndo' | 'fim';
/** No modo de teste a corrida livre acaba por número de arcos (máquina carregada não muda o resultado). */
const ARCOS_NO_TESTE = 8;
const CHEGADA_NO_TESTE_MS = 1300;

interface Arco { it: ItemJogo; onda: { mostrada: boolean; ouviu: number }; inicio: number; mexeu: boolean; h?: PortalCorrida }
interface Flutuante { id: number; texto: string; tipo: 'mais' | 'menos' | 'moeda' }

export function CorreSom({ itens, crianca, sessao, cena, contexto, enunciado, demo, nivel, ondas, onFim }: PropsJogoFonico) {
  const { prefs } = useApp();
  const menos = prefs.menosMovimento || modoTeste() || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const livre = nivel !== undefined;
  const nv = nivelDaCorrida(nivel ?? 1);
  const chegadaMs = modoTeste() ? CHEGADA_NO_TESTE_MS : tempoDeChegadaMs(nv);
  const [comWebGL, setComWebGL] = useState(() => temWebGL());
  const canvas = useRef<HTMLCanvasElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const motor = useRef<MotorCorrida | null>(null);
  const [pronta, setPronta] = useState(false);
  const [fase, setFase] = useState<Fase>('carregando');
  const [contagem, setContagem] = useState(0);
  const [emDemo, setEmDemo] = useState(!!demo);
  const [fala, setFala] = useState<Fala>(enunciado);
  const [placar, setPlacar] = useState<PlacarCorrida>(placarInicial);
  const placarRef = useRef(placar);
  const [restante, setRestante] = useState(nv.segundos);
  const [aqui, setAqui] = useState(1);
  const [alvo, setAlvo] = useState<ItemJogo | null>(null);
  const [passados, setPassados] = useState(0);
  const [xis, setXis] = useState<OpcaoJogo | null>(null);
  const [flutuantes, setFlutuantes] = useState<Flutuante[]>([]);
  const [maozinha, setMaozinha] = useState(true);
  const [colunas, setColunas] = useState([1 / 6, 0.5, 5 / 6]);
  const [resumo, setResumo] = useState<{ r: ResultadoJogo } | null>(null);
  const vivo = useRef(true);
  const fila = useRef<Arco[]>([]);
  const ondaAtual = useRef<{ somAlvo: string; estado: Arco['onda'] } | null>(null);
  const idF = useRef(0);
  const fase0 = useRef<Fase>('carregando');

  const diz = async (f: Fala | string) => {
    const x: Fala = typeof f === 'string' ? { quem: 'sofia', texto: f } : f;
    setFala(x);
    await voz.falar(textoVoz(x.texto, crianca), { quem: x.quem });
  };
  const flutuar = (texto: string, tipo: Flutuante['tipo']) => {
    const id = ++idF.current;
    setFlutuantes((xs) => [...xs.slice(-4), { id, texto, tipo }]);
    window.setTimeout(() => { if (vivo.current) setFlutuantes((xs) => xs.filter((f) => f.id !== id)); }, 900);
  };
  const somar = (ev: Parameters<typeof pontuar>[1]) => {
    const r = pontuar(placarRef.current, ev);
    placarRef.current = r.placar;
    setPlacar(r.placar);
    return r;
  };

  // a pista: 3D sob demanda (o módulo já vem pré-carregado da tela de escolha); sem WebGL ou sem a 3D em 4 s, a reserva 2D.
  // O boneco é vestido sem esperar (começa com a reserva feita em código e troca sozinho): nada de "esperando a pista".
  useEffect(() => {
    vivo.current = true;
    let decidido = false;
    let p3: MotorCorrida | null = null;
    const usar2D = () => {
      if (decidido || !vivo.current || !palco.current) return;
      decidido = true;
      p3?.descartar(); p3 = null;
      setComWebGL(false);
      motor.current = new PistaCorrida2D(palco.current, menos);
      setPronta(true);
    };
    if (comWebGL && canvas.current) {
      void import('./corre-som-3d.ts').then((m) => {
        if (!vivo.current || !canvas.current || decidido) return;
        try {
          const p = new m.PistaCorreSom(canvas.current, menos);
          p3 = p;
          void p.vestir(aparenciaDe(crianca)).catch(() => undefined);
          decidido = true;
          motor.current = p;
          setColunas(p.colunasNaTela());
          setPronta(true);
        } catch { usar2D(); }
      }).catch(usar2D);
    } else usar2D();
    const reserva = window.setTimeout(usar2D, 4000);
    return () => { vivo.current = false; window.clearTimeout(reserva); voz.parar(); motor.current?.descartar(); motor.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ajustar = () => { if (motor.current) setColunas(motor.current.colunasNaTela()); };
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  const placas = (it: ItemJogo): PlacaArco[] => it.opcoes.map((o) => (o.letra ? { letra: letraAa(o.letra) } : { imagem: caminhoFigura(undefined, o.figura ?? o.id) ?? undefined }));
  const irPara = (k: number) => { motor.current?.irParaPista(k); setAqui(Math.max(0, Math.min(2, k))); };
  const mostrarAlvo = () => setAlvo(fila.current[0]?.it ?? null);

  // a corrida inteira: um laço assíncrono que lança os arcos e trata cada passagem na hora em que ela acontece
  useEffect(() => {
    if (!pronta || !motor.current) return;
    const m = motor.current;
    let cancelado = false;
    const ok = () => vivo.current && !cancelado;
    const tentativas: Tentativa[] = [];
    const erradas: ErroCorrida[] = [];
    let arcosPassados = 0;
    let fimEm = Infinity;
    let avisarFim: () => void = () => {};
    const fimDoTempo = new Promise<void>((r) => { avisarFim = r; });
    const acabou = () => livre && (modoTeste() ? arcosPassados >= ARCOS_NO_TESTE : Date.now() >= fimEm);
    let relogio = 0;
    m.aoMoeda = () => { if (fase0.current !== 'correndo') return; efeitos.moeda(); const r = somar('moeda'); if (r.delta) flutuar(`+${r.delta}`, 'moeda'); };
    m.aoPulo = () => { if (fase0.current !== 'correndo') return; efeitos.toque(); const r = somar('bonus'); if (r.delta) flutuar(`+${r.delta}`, 'mais'); };
    m.aoTropeco = () => efeitos.suave();

    const passagem = (a: Arco, pista: number) => {
      fila.current = fila.current.filter((x) => x !== a);
      mostrarAlvo();
      if (!ok() || acabou()) return;
      arcosPassados++;
      setPassados(arcosPassados);
      const it = a.it;
      const certo = pista === it.posicaoCerta;
      const antes = placarRef.current;
      tentativas.push(tentativaDaCorrida({
        item: it, pista, idDe: (o) => idDoRegistro(it, o), sessao, cena, contexto, tempoMs: Date.now() - a.inicio, em: Date.now(),
        antes: { sequencia: antes.sequencia, errosSeguidos: antes.errosSeguidos }, mexeu: a.mexeu, nivel: livre ? nv.nivel : undefined,
        ouviuDeNovo: a.onda.ouviu, respostaMostrada: a.onda.mostrada
      }));
      if (certo) {
        a.h?.marcar('certo'); m.festejar(); efeitos.acerto();
        const r = somar('certo');
        flutuar(`+${r.delta}`, 'mais');
      } else {
        a.h?.marcar('tentado'); efeitos.suave();
        const r = somar('errado');
        flutuar(r.delta ? `${r.delta}` : '✖', 'menos');
        a.onda.mostrada = true;
        const certa = it.opcoes[it.posicaoCerta];
        erradas.push({ alvo: certa, escolhida: it.opcoes[pista], formato: it.formato });
        setXis(certa);
        window.setTimeout(() => { if (vivo.current) setXis(null); }, 1000);
      }
    };

    (async () => {
      setFase('largada');
      // R12: exemplo feito pela guia antes de valer (só na primeira vez desta variação)
      if (demo) {
        await diz(FALAS_ESCUTA.euFaco);
        if (!ok()) return;
        m.iniciarCorrida(nv.velocidade);
        await tocarSom(demo.somAlvo, 1);
        if (!ok()) return;
        const h = m.portal(placas(demo), chegadaMs);
        setAlvo(demo);
        irPara(demo.posicaoCerta);
        await h.passou;
        if (!ok()) return;
        h.marcar('certo'); m.festejar(); efeitos.acerto();
        setAlvo(null); setEmDemo(false);
        await diz(FALAS_ESCUTA.voceFaz);
      } else {
        await diz(enunciado);
      }
      if (!ok()) return;
      // largada: 3, 2, 1 (só na tela) e a pista não para mais
      for (const n of [3, 2, 1]) { setContagem(n); await espera(modoTeste() ? 30 : 520); if (!ok()) return; }
      setContagem(0);
      fase0.current = 'correndo';
      setFase('correndo');
      m.iniciarCorrida(nv.velocidade);
      if (livre) {
        fimEm = Date.now() + nv.segundos * 1000;
        relogio = window.setInterval(() => {
          const s = Math.max(0, Math.ceil((fimEm - Date.now()) / 1000));
          setRestante(s);
          if (acabou()) avisarFim();
        }, 250);
      }
      const lista = livre ? (ondas ?? []) : ondasDaFase(itens);
      for (const o of lista) {
        if (!ok() || acabou()) break;
        const estado = { mostrada: false, ouviu: 0 };
        ondaAtual.current = { somAlvo: o.somAlvo, estado };
        // o som da onda toca UMA vez, inteiro, antes de os arcos valerem (regra 1; sem repetir a letra o tempo todo)
        await Promise.race([tocarSom(o.somAlvo, 1), fimDoTempo]);
        if (!ok() || acabou()) break;
        const pend: Promise<void>[] = [];
        for (let k = 0; k < o.arcos.length; k++) {
          const a: Arco = { it: o.arcos[k], onda: estado, inicio: Date.now(), mexeu: false };
          a.h = m.portal(placas(a.it), chegadaMs);
          fila.current.push(a);
          mostrarAlvo();
          pend.push(a.h.passou.then((pista) => passagem(a, pista)));
          if (k < o.arcos.length - 1) await Promise.race([a.h.longe, fimDoTempo]);
          if (!ok() || acabou()) break;
        }
        await Promise.race([Promise.all(pend), fimDoTempo]);
        if (acabou()) avisarFim();
      }
      window.clearInterval(relogio);
      if (!ok()) return;
      fila.current = []; setAlvo(null);
      fase0.current = 'fim';
      setFase('fim');
      m.pararCorrida();
      await m.chegada();
      if (!ok()) return;
      const pl = placarRef.current;
      const meta = livre ? nv.meta : null;
      const r: ResultadoJogo = {
        tentativas, tentouDeNovo: 0,
        corrida: {
          pontos: pl.pontos, meta, estrelas: meta ? estrelasDaCorrida(pl.pontos, meta) : 0, nivel: livre ? nv.nivel : null, bateuMeta: meta ? bateuMeta(pl.pontos, meta) : false,
          acertos: pl.acertos, erros: pl.erros, melhorSequencia: pl.melhorSequencia, moedas: pl.moedas, erradas
        }
      };
      if (livre) { await espera(modoTeste() ? 50 : 400); if (ok()) onFim(r); return; }
      setResumo({ r });
    })();
    return () => { cancelado = true; window.clearInterval(relogio); avisarFim(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronta]);
  /* ------------------------------------------------------------ controles ------------------------------------------------------------ */

  const ativo = fase === 'correndo' || fase === 'largada';
  /** A criança agiu enquanto o arco mais perto vinha: a passagem por ele é escolha (D035: sem isso não conta). */
  const agiu = () => { const a = fila.current[0]; if (a) a.mexeu = true; setMaozinha(false); };
  const tocarPista = (k: number) => { if (!ativo || emDemo) return; efeitos.toque(); irPara(k); agiu(); };
  const mover = (d: number) => { if (!ativo || emDemo) return; irPara((motor.current?.pista ?? aqui) + d); agiu(); };
  const pular = () => { if (fase === 'correndo') motor.current?.pular(); };
  const ouvirDeNovo = () => {
    const o = ondaAtual.current;
    if (!o || fase !== 'correndo') return;
    o.estado.ouviu++;
    efeitos.toque();
    void tocarSom(o.somAlvo, 1);
  };

  const teclas = useRef({ mover, pular });
  teclas.current = { mover, pular };
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); teclas.current.mover(-1); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); teclas.current.mover(1); }
      else if (k === 'arrowup' || k === 'w' || k === ' ') { e.preventDefault(); teclas.current.pular(); }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  // deslizar: para os lados troca de pista; para cima pula
  const toque = useRef<{ x: number; y: number; arrastou: boolean } | null>(null);
  const aoApertar = (e: React.PointerEvent) => { toque.current = { x: e.clientX, y: e.clientY, arrastou: false }; };
  const aoSoltar = (e: React.PointerEvent) => {
    const t0 = toque.current;
    if (!t0) return;
    const dx = e.clientX - t0.x, dy = e.clientY - t0.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { t0.arrastou = true; mover(dx > 0 ? 1 : -1); }
    else if (dy < -40) { t0.arrastou = true; pular(); }
  };

  if (resumo) {
    return (
      <div className="mec jogo-corre" data-testid="corre-som" data-fase="fim">
        <ResultadoCorrida resumo={resumo.r.corrida!} onContinuar={() => onFim(resumo.r)} />
      </div>
    );
  }

  const cortes = [0, (colunas[0] + colunas[1]) / 2, (colunas[1] + colunas[2]) / 2, 1];
  const ehFigura = (alvo?.formato ?? itens[0]?.formato) !== 'som-letra';
  const meta = livre ? nv.meta : null;
  const decidir = fase === 'correndo' && !emDemo && !!alvo;
  return (
    <div className={`mec jogo-corre corrida ${comWebGL ? '' : 'sem-3d'} ${menos ? 'menos-mov' : ''}`} data-testid="corre-som" data-fase={fase} data-demo={emDemo ? '1' : undefined}
      data-decidir={decidir ? '1' : undefined} data-pontos={placar.pontos} data-passados={passados} data-pista={aqui} data-nivel={livre ? nv.nivel : undefined} data-formato={alvo?.formato}>
      {fase === 'largada' ? <Balao fala={fala} crianca={crianca} /> : null}
      <div className="cs-placar" role="status" aria-live="off">
        <span className="cs-pontos" data-testid="cs-pontos"><Icone nome="estrela" /><b>{placar.pontos}</b>{meta ? <small>/ {meta}</small> : null}</span>
        {placar.sequencia >= 3 ? <span className="cs-multi">×{placar.sequencia >= 6 ? 3 : 2}</span> : null}
        {livre ? <span className={`cs-tempo ${restante <= 10 ? 'pouco' : ''}`} data-testid="cs-tempo"><Icone nome="relogio" />{restante}s</span> : <span className="cs-tempo">{passados}/{itens.length}</span>}
        <button className="jogo-ouvir" onClick={ouvirDeNovo} disabled={fase !== 'correndo'} aria-label="Ouvir o som de novo" data-testid="jogo-ouvir"><Icone nome="som" /><span>Ouvir</span></button>
      </div>
      {meta ? <div className="cs-meta" aria-hidden="true"><i style={{ width: `${Math.min(100, (placar.pontos / meta) * 100)}%` }} /></div> : null}
      <div className="cs-palco" ref={palco} onPointerDown={aoApertar} onPointerUp={aoSoltar}>
        {comWebGL ? <canvas ref={canvas} className="cs-canvas" aria-hidden="true" /> : null}
        {!pronta ? <div className="cs-carregando"><span className="carregando-bola" aria-hidden="true" /></div> : null}
        <div className="cs-pistas" role="group" aria-label="Pistas">
          {[0, 1, 2].map((k) => {
            const o = alvo?.opcoes[k];
            return (
              <button key={k} className={`cs-pista ${aqui === k ? 'aqui' : ''}`}
                style={{ left: `${cortes[k] * 100}%`, width: `${(cortes[k + 1] - cortes[k]) * 100}%` } as CSSProperties}
                onClick={() => { if (toque.current?.arrastou) { toque.current = null; return; } tocarPista(k); }}
                aria-label={`Pista ${k + 1}${o?.letra ? `: letra ${o.letra}` : ''}`} data-opcao={o?.id} data-correta={o && alvo && k === alvo.posicaoCerta ? '1' : undefined} data-pista={k} />
            );
          })}
        </div>
        {ehFigura && decidir && alvo ? (
          <div className="cs-nomes">
            {[0, 1, 2].map((k) => (
              <button key={k} className="cs-nome" style={{ left: `${colunas[k] * 100}%` } as CSSProperties} aria-label={`Ouvir o nome da figura ${k + 1}`} onClick={(e) => { e.stopPropagation(); efeitos.toque(); void dizerFigura(alvo.opcoes[k]); }}>
                <Icone nome="som" />
              </button>
            ))}
          </div>
        ) : null}
        {contagem ? <div className="cs-contagem" key={contagem} aria-hidden="true">{contagem}</div> : null}
        <div className="cs-flutuantes" aria-hidden="true">
          {flutuantes.map((f) => <span key={f.id} className={`cs-flutua ${f.tipo}`}>{f.texto}</span>)}
        </div>
        {xis ? (
          <div className="cs-xis" data-testid="cs-xis" aria-live="polite">
            <span className="cs-xis-marca" aria-hidden="true">✖</span>
            <span className="cs-xis-certa">{xis.letra ? <LetraAa letra={xis.letra} /> : <Figura palavra={xis.figura ?? xis.id} />}</span>
          </div>
        ) : null}
        {maozinha && fase === 'correndo' && !emDemo ? <span className="cs-maozinha" aria-hidden="true" style={{ left: `${colunas[aqui === 0 ? 2 : 0] * 100}%` } as CSSProperties} /> : null}
      </div>
      <div className="jogo-rodape">
        <button className="btn grande jogo-pular" onClick={pular} disabled={fase !== 'correndo'} data-testid="cs-pular"><Icone nome="raio" />Pular</button>
      </div>
    </div>
  );
}
