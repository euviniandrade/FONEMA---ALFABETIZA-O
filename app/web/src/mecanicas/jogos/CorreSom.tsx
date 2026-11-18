/**
 * CORRE-SOM (D032 §4; docs/pesquisa/47 G1): o boneco da criança corre numa rua de 3 pistas. Toca o SOM PURO (regra 1);
 * vêm 3 arcos (letras ou figuras) em pistas sorteadas (R5); a rua DESACELERA e PARA antes de cada escolha (não premia pressa)
 * e a criança escolhe trocando de pista: tocar na pista (celular e tablet), deslizar para os lados, setas ou A/D (computador).
 * Ficar parado não responde: é preciso tocar na pista, deslizar para cima, ↑/Espaço/Enter, ou parar numa pista depois de trocar.
 * Sem resposta por um tempo, o som toca de novo (não é erro). Erro: correção contrastiva e os arcos voltam; no 3º arco, o
 * certo brilha e o item vale "com ajuda" (R4). Moedinhas da rua e almofadas para pular são enfeite: nada disso vira
 * tentativa (regra 4). Sem "game over", sem cronômetro, sem placar.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FALAS, FALAS_ESCUTA, type Fala } from '@fonema/conteudo';
import { aparenciaDe, temWebGL } from '../../avatar3d/index.ts';
import type { Crianca, ItemJogo, Tentativa } from '@fonema/motor';
import { idDoRegistro } from '@fonema/motor';
import { Balao } from '../../componentes/basicos.tsx';
import { Figura, Icone, caminhoFigura } from '../../componentes/ui.tsx';
import { useApp } from '../../contexto.tsx';
import { efeitos } from '../../servicos/efeitos.ts';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { textoVoz } from '../../util.ts';
import { Progressinho } from '../comum.tsx';
import { registro } from '../tf-comum.tsx';
import { comemorar, corrigirEscolha, dizerFigura, tocarSom } from './correcao.ts';
import type { PistaCorreSom } from './corre-som-3d.ts';
import './estilos-jogos.css';

export interface ResultadoJogo { tentativas: Tentativa[]; tentouDeNovo: number }
export interface PropsJogoFonico {
  itens: ItemJogo[];
  crianca: Crianca;
  sessao: string;
  cena: string;
  contexto: 'livre' | 'desafio' | 'revisao';
  enunciado: Fala;
  /** R12: na primeira vez do jogo, a guia faz um item de exemplo (não vale). */
  demo?: ItemJogo | null;
  onFim: (r: ResultadoJogo) => void;
}

type Fase = 'carregando' | 'correndo' | 'chegando' | 'escolher' | 'passando' | 'fim';
const ESPERA_REPETIR_MS = 9000;
const AUTO_CONFIRMA_MS = 1400;

export function CorreSom({ itens, crianca, sessao, cena, contexto, enunciado, demo, onFim }: PropsJogoFonico) {
  const { prefs } = useApp();
  const menos = prefs.menosMovimento || modoTeste() || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [comWebGL, setComWebGL] = useState(() => temWebGL());
  const canvas = useRef<HTMLCanvasElement>(null);
  const pista = useRef<PistaCorreSom | null>(null);
  const [pronta, setPronta] = useState(!comWebGL);
  const [fase, setFase] = useState<Fase>('carregando');
  const [i, setI] = useState(0);
  const [item, setItem] = useState<ItemJogo>(demo ?? itens[0]);
  const [emDemo, setEmDemo] = useState(!!demo);
  const [fala, setFala] = useState<Fala>(enunciado);
  const [marcas, setMarcas] = useState<Record<number, 'tentado' | 'modelo' | 'certo'>>({});
  const [acesa, setAcesa] = useState<number | null>(null);
  const [aqui, setAqui] = useState(1);
  const [maozinha, setMaozinha] = useState(true);
  const [colunas, setColunas] = useState([1 / 6, 0.5, 5 / 6]);
  const vivo = useRef(true);
  const escolha = useRef<((k: number) => void) | null>(null);
  const auto = useRef<number | undefined>(undefined);
  const ouviu = useRef(0);
  const repetiu = useRef(false);

  const diz = async (f: Fala | string) => {
    const x: Fala = typeof f === 'string' ? { quem: 'sofia', texto: f } : f;
    setFala(x);
    await voz.falar(textoVoz(x.texto, crianca), { quem: x.quem });
  };

  // a pista 3D (sob demanda); sem WebGL, a reserva em 2D (os mesmos arcos, sem a rua)
  useEffect(() => {
    vivo.current = true;
    let p: PistaCorreSom | null = null;
    if (comWebGL && canvas.current) {
      void import('./corre-som-3d.ts').then(async (m) => {
        if (!vivo.current || !canvas.current) return;
        try {
          p = new m.PistaCorreSom(canvas.current, menos);
          p.aoMoeda = () => efeitos.moeda();
          p.aoTropeco = () => efeitos.suave();
          pista.current = p;
          await p.vestir(aparenciaDe(crianca));
        } catch { pista.current = null; p?.descartar(); p = null; setComWebGL(false); }
        if (vivo.current) { setPronta(true); if (pista.current) setColunas(pista.current.colunasNaTela()); }
      });
    }
    return () => { vivo.current = false; voz.parar(); window.clearTimeout(auto.current); p?.descartar(); pista.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ajustar = () => { if (pista.current) setColunas(pista.current.colunasNaTela()); };
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  const placas = (it: ItemJogo) => it.opcoes.map((o) => (o.letra ? { letra: o.letra } : { imagem: caminhoFigura(undefined, o.figura ?? o.id) ?? undefined }));
  const marcar = (k: number, m: 'tentado' | 'modelo' | 'certo' | null) => {
    pista.current?.marcar(k, m);
    setMarcas((x) => { const n = { ...x }; if (m) n[k] = m; else delete n[k]; return n; });
  };
  const irPara = (k: number) => { pista.current?.irParaPista(k); setAqui(k); };

  /** Apresenta o item: para figuras, a guia diz o nome de cada uma acendendo a placa (04 R10); depois o som, 2 vezes. */
  const apresentar = async (it: ItemJogo, primeira: boolean) => {
    if (primeira) await diz(enunciado);
    if (!vivo.current) return;
    if (it.formato !== 'som-letra') {
      for (let k = 0; k < it.opcoes.length; k++) {
        if (!vivo.current) return;
        setAcesa(k); pista.current?.acender(k);
        await dizerFigura(it.opcoes[k]);
        await espera(200);
      }
      setAcesa(null); pista.current?.acender(null);
    }
    if (vivo.current) await tocarSom(it.somAlvo, 2);
  };

  /** Espera a escolha (ou repete o som, sem contar erro, se a criança não escolher). */
  const esperarEscolha = (it: ItemJogo) => new Promise<number>((ok) => {
    let timer = 0;
    const repetir = () => { timer = window.setTimeout(async () => { if (!escolha.current) return; repetiu.current = true; await tocarSom(it.somAlvo, 1); repetir(); }, ESPERA_REPETIR_MS); };
    repetir();
    escolha.current = (k) => { window.clearTimeout(timer); window.clearTimeout(auto.current); escolha.current = null; setMaozinha(false); ok(k); };
  });

  // o jogo inteiro: um laço assíncrono que conversa com a pista 3D
  useEffect(() => {
    if (!pronta) return;
    let cancelado = false;
    const ok = () => vivo.current && !cancelado;
    const tentativas: Tentativa[] = [];
    let tentouDeNovo = 0;
    const correr = async (k: number) => {
      setFase('correndo');
      await pista.current?.correr(menos ? 0 : k === 0 ? 1.6 : 2.6, { moedas: true, almofada: k % 2 === 1 });
    };
    const chegarArcos = async (it: ItemJogo) => {
      setFase('chegando');
      setMarcas({});
      await pista.current?.mostrarArcos(placas(it));
      if (pista.current) setColunas(pista.current.colunasNaTela());
    };
    (async () => {
      // R12: exemplo feito pela guia antes de valer (só na primeira vez deste jogo)
      if (demo) {
        await diz(FALAS_ESCUTA.euFaco);
        await correr(0);
        await chegarArcos(demo);
        if (!ok()) return;
        await apresentar(demo, false);
        if (!ok()) return;
        setFase('passando');
        await pista.current?.passar(demo.posicaoCerta);
        irPara(demo.posicaoCerta);
        marcar(demo.posicaoCerta, 'certo'); pista.current?.festejar(demo.posicaoCerta); efeitos.acerto();
        await espera(400);
        await diz(FALAS_ESCUTA.voceFaz);
        if (!ok()) return;
        setEmDemo(false);
      }
      for (let k = 0; k < itens.length; k++) {
        const it = itens[k];
        setI(k); setItem(it);
        ouviu.current = 0; repetiu.current = false;
        await correr(k);
        if (!ok()) return;
        await chegarArcos(it);
        if (!ok()) return;
        await apresentar(it, k === 0 && !demo);
        const respostas: string[] = [];
        let posEscolhida: number | undefined;
        const inicio = Date.now();
        let erros = 0;
        for (;;) {
          if (!ok()) return;
          if (erros >= 2) marcar(it.posicaoCerta, 'modelo');
          setFase('escolher');
          const pistaEscolhida = await esperarEscolha(it);
          if (!ok()) return;
          const o = it.opcoes[pistaEscolhida];
          respostas.push(idDoRegistro(it, o));
          posEscolhida ??= pistaEscolhida;
          setFase('passando');
          irPara(pistaEscolhida);
          await pista.current?.passar(pistaEscolhida);
          if (!ok()) return;
          if (pistaEscolhida === it.posicaoCerta) {
            marcar(pistaEscolhida, 'certo'); pista.current?.festejar(pistaEscolhida); efeitos.acerto();
            tentativas.push({
              ...registro({
                habilidade: it.habilidade, sessao, cena, mecanica: 'corre-som', alvo: idDoRegistro(it, it.opcoes[it.posicaoCerta]), respostas, categoria: it.categoria,
                distratores: it.opcoes.filter((_, j) => j !== it.posicaoCerta).map((x) => idDoRegistro(it, x)), inicio, posicaoCerta: it.posicaoCerta, posicaoEscolhida: posEscolhida,
                nOpcoes: it.opcoes.length, ouviuDeNovo: ouviu.current, revisao: contexto === 'revisao', ...(erros === 0 && repetiu.current ? { ajuda: 'repetiu' as const } : {})
              }),
              formato: it.formato, contexto
            });
            if (erros > 0) tentouDeNovo++;
            if (it.formato !== 'som-letra') await dizerFigura(o);
            await comemorar(it, k, erros, crianca, diz);
            break;
          }
          // erro acolhido: o arco tentado fica apagadinho, a correção compara os dois sons e os arcos voltam
          erros++;
          efeitos.suave();
          marcar(pistaEscolhida, 'tentado');
          if (erros === 1) await corrigirEscolha(it, o, diz, ok);
          else await diz({ quem: 'sofia', texto: FALAS.erro2 });
          if (!ok()) return;
          setFase('chegando');
          await pista.current?.voltarAosArcos();
          if (erros === 1 && ok()) await tocarSom(it.somAlvo, 1);
        }
      }
      if (!ok()) return;
      setFase('fim');
      await pista.current?.chegada();
      await diz(FALAS_ESCUTA.muitoBem);
      await espera(modoTeste() ? 50 : 600);
      if (ok()) onFim({ tentativas, tentouDeNovo });
    })();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronta]);

  /* ------------------------------------------------------------ controles ------------------------------------------------------------ */

  const tocarPista = (k: number) => {
    if (fase === 'escolher' && escolha.current) { efeitos.toque(); irPara(k); escolha.current(k); return; }
    if (fase === 'correndo' || fase === 'chegando') { irPara(k); setMaozinha(false); }
  };
  const mover = (d: number) => {
    if (fase !== 'escolher' && fase !== 'correndo' && fase !== 'chegando') return;
    const k = Math.max(0, Math.min(2, aqui + d));
    irPara(k);
    setMaozinha(false);
    if (fase === 'escolher') {
      // trocou de pista e parou: depois de um instante, vale a pista em que ficou
      window.clearTimeout(auto.current);
      auto.current = window.setTimeout(() => escolha.current?.(k), AUTO_CONFIRMA_MS);
    }
  };
  const confirmarOuPular = () => {
    if (fase === 'escolher' && escolha.current) { escolha.current(aqui); return; }
    if (fase === 'correndo') pista.current?.pular();
  };
  const ouvirDeNovo = () => { if (fase !== 'escolher') return; ouviu.current++; efeitos.toque(); void tocarSom(item.somAlvo, 1); };

  const teclas = useRef({ mover, confirmarOuPular });
  teclas.current = { mover, confirmarOuPular };
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); teclas.current.mover(-1); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); teclas.current.mover(1); }
      else if (k === 'arrowup' || k === 'w' || k === ' ' || k === 'enter') { e.preventDefault(); teclas.current.confirmarOuPular(); }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  // deslizar: para os lados troca de pista; para cima pula (correndo) ou passa no arco (escolhendo)
  const toque = useRef<{ x: number; y: number; arrastou: boolean } | null>(null);
  const aoApertar = (e: React.PointerEvent) => { toque.current = { x: e.clientX, y: e.clientY, arrastou: false }; };
  const aoSoltar = (e: React.PointerEvent) => {
    const t0 = toque.current;
    if (!t0) return;
    const dx = e.clientX - t0.x, dy = e.clientY - t0.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { t0.arrastou = true; mover(dx > 0 ? 1 : -1); }
    else if (dy < -40) { t0.arrastou = true; confirmarOuPular(); }
  };

  // áreas de toque: uma por pista, divididas no meio do caminho entre as pistas (na tela)
  const cortes = [0, (colunas[0] + colunas[1]) / 2, (colunas[1] + colunas[2]) / 2, 1];
  const escolhendo = fase === 'escolher';
  const ehFigura = item.formato !== 'som-letra';
  return (
    <div className={`mec jogo-corre ${comWebGL ? '' : 'sem-3d'} ${menos ? 'menos-mov' : ''}`} data-testid="corre-som" data-fase={fase} data-demo={emDemo ? '1' : undefined} data-item={i} data-formato={item.formato} data-pista={aqui}>
      <Balao fala={fala} crianca={crianca} />
      <div className="jogo-topo">
        <Progressinho atual={emDemo ? 0 : i} total={itens.length} />
        <button className="jogo-ouvir" onClick={ouvirDeNovo} disabled={!escolhendo} aria-label="Ouvir o som de novo" data-testid="jogo-ouvir"><Icone nome="som" /><span>Ouvir o som</span></button>
      </div>
      <div className="cs-palco" onPointerDown={aoApertar} onPointerUp={aoSoltar}>
        {comWebGL ? <canvas ref={canvas} className="cs-canvas" aria-hidden="true" /> : null}
        {!pronta ? <div className="cs-carregando"><span className="carregando-bola" aria-hidden="true" /></div> : null}
        <div className="cs-pistas" role="group" aria-label="Pistas">
          {[0, 1, 2].map((k) => {
            const o = item.opcoes[k];
            const m = marcas[k];
            return (
              <button key={k} className={`cs-pista ${aqui === k ? 'aqui' : ''} ${m ?? ''} ${acesa === k ? 'acesa' : ''} ${escolhendo ? 'ativa' : ''}`}
                style={{ left: `${cortes[k] * 100}%`, width: `${(cortes[k + 1] - cortes[k]) * 100}%` } as CSSProperties}
                onClick={() => { if (toque.current?.arrastou) { toque.current = null; return; } tocarPista(k); }}
                aria-label={`Pista ${k + 1}${o?.letra ? `: letra ${o.letra}` : ''}`} data-opcao={o?.id} data-correta={o && k === item.posicaoCerta ? '1' : undefined} data-pista={k}>
                {!comWebGL && o ? (
                  <span className="cs-arco-2d" style={{ ['--cor' as string]: ['#ff8a65', '#ffc93c', '#5ec2e8'][k] } as CSSProperties}>
                    {o.letra ? <b className="cs-letra">{o.letra}</b> : <Figura palavra={o.figura ?? o.id} />}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {ehFigura && escolhendo ? (
          <div className="cs-nomes">
            {[0, 1, 2].map((k) => (
              <button key={k} className="cs-nome" style={{ left: `${colunas[k] * 100}%` } as CSSProperties} aria-label={`Ouvir o nome da figura ${k + 1}`} onClick={(e) => { e.stopPropagation(); efeitos.toque(); void dizerFigura(item.opcoes[k]); }}>
                <Icone nome="som" />
              </button>
            ))}
          </div>
        ) : null}
        {maozinha && (escolhendo || fase === 'correndo') && !emDemo ? <span className="cs-maozinha" aria-hidden="true" style={{ left: `${colunas[aqui === 0 ? 2 : 0] * 100}%` } as CSSProperties} /> : null}
      </div>
      <div className="jogo-rodape">
        <button className="btn grande jogo-pular" onClick={confirmarOuPular} disabled={fase !== 'correndo' && !escolhendo} data-testid="cs-pular">
          <Icone nome={escolhendo ? 'seta' : 'raio'} />{escolhendo ? 'Passar' : 'Pular'}
        </button>
      </div>
    </div>
  );
}
