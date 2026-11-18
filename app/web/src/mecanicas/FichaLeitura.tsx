/**
 * FICHAS DE LEITURA (D033): as atividades dos quatro níveis. Regras e itens: @fonema/motor › fichas.ts; conteúdo e classes
 * de boca: @fonema/conteudo › fichas.ts. A boquinha é a vista de frente do Espelho do Som (componentes/Boquinha.tsx).
 *
 *  - Nível 1 (ler): a palavra escrita, sem figura; boquinha em cima de cada letra (ou dígrafo) faz o som DAQUELA posição
 *    enquanto a letra acende e o som puro toca (contínuos ≈ 1,5 s, que é o clipe inteiro; estouros curtos), um por um; depois
 *    emendados (devagar e ligeiro); "o que ficou?" → 3 figuras. Ler junto = exposição; a escolha = leitura avaliada.
 *  - Nível 2 (ouvir / ouvir-palavra): só o som, sem a palavra escrita → 3 figuras; no degrau, 3 palavras escritas (legíveis).
 *  - Nível 3 (bocas): letras soltas × boquinhas paradas, sem som; ligar cada letra à boca (tocar a letra, depois a boca).
 *  - Nível 4 (bocas-palavra): só a sequência de boquinhas (sem som, sem letras) → 3 figuras.
 * Correção contrastiva: 1º erro = ouve/vê a escolhida e depois a certa (o caminho, sem dizer a resposta); 2º erro = a certa
 * brilha (ajuda máxima: conta como "com ajuda", R4). Posição da certa sorteada (R5). Nada de nome de letra (regra 1) nem de
 * sílaba (regra 6): a peça é a letra.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BANCO, DESCRICAO_DA_BOCA, FALAS, FALAS_FICHAS as F, classeDaBoca, comSons, pedacosDaPalavra } from '@fonema/conteudo';
import {
  FORMATO_DO_MODO, FORMATO_LER_JUNTO, HABILIDADE_DO_MODO, rodadaDaFicha, rodadaDeBocas, type Crianca, type ModoFicha, type ParBoca, type Progresso, type Tentativa
} from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Boquinha } from '../componentes/Boquinha.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { textoVoz } from '../util.ts';
import { Progressinho } from './comum.tsx';
import { pararSons, tocarSonsEmendados } from './sons-emendados.ts';
import { registro } from './tf-comum.tsx';

export interface ResultadoFicha { tentativas: Tentativa[]; acertos: number; total: number }
type Contexto = 'livre' | 'desafio';

/** Sorteio com semente (no modo de teste a semente é fixa: o E2E sabe o que vem). */
export function sorteio(semente: number): () => number {
  let s = semente % 2147483647 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const novaSemente = () => (modoTeste() ? 7 : 1 + Math.floor(Math.random() * 2147483000));
/**
 * A rodada de uma ficha é sorteada UMA vez e fica guardada até a ficha acabar (revisão 18/11, item 2): se a tela for
 * montada de novo no meio (recarga do progresso, volta do aparelho), a palavra mostrada na abertura é a mesma que é lida.
 * "De novo" (nova rodada) e o fim da ficha sorteiam outra.
 */
const SEMENTES = new Map<string, number>();
function sementeDaRodada(chave: string): number {
  let s = SEMENTES.get(chave);
  if (s === undefined) { s = novaSemente(); SEMENTES.set(chave, s); }
  return s;
}
const esquecerRodada = (chave: string) => SEMENTES.delete(chave);

/** Pedaços com o índice de letra de cada um (para casar os sons emendados, que vêm por letra). */
function pedacos(w: string) {
  let i = 0;
  return pedacosDaPalavra(w).map((p) => { const x = { ...p, i }; i += p.letras.length; return x; });
}

/* ================================================================ níveis 1, 2 e 4 ================================================================ */

export function FichaEscolha({ progresso, campo, modo, crianca, sessao, contexto, onFim }: {
  progresso: Progresso; campo: string; modo: Exclude<ModoFicha, 'bocas'>; crianca: Crianca; sessao: string; contexto: Contexto; onFim: (r: ResultadoFicha) => void;
}) {
  const chave = `${crianca.id}|${campo}|${modo}`;
  const itens = useMemo(() => rodadaDaFicha(progresso, campo, modo, sorteio(sementeDaRodada(chave))), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0);
  const item = itens[k];
  const ps = useMemo(() => (item ? pedacos(item.palavra) : []), [item]);
  const sonsPorLetra = useMemo(() => (item ? comSons(item.palavra).sons : []), [item]);
  const [ativo, setAtivo] = useState(-1);
  const [lidos, setLidos] = useState(0);
  const [etapa, setEtapa] = useState<'inicio' | 'guia' | 'escolher' | 'feito'>('inicio');
  const [fala, setFala] = useState<string>(modo === 'ler' ? F.lerJuntos : modo === 'bocas-palavra' ? F.qualPalavraBoca : F.escuta);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [contraste, setContraste] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const respostas = useRef<string[]>([]);
  const posEscolhida = useRef<number | undefined>(undefined);
  const ouviu = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<Tentativa[]>([]);
  const vivo = useRef(true);
  useEffect(() => { vivo.current = true; return () => { vivo.current = false; pararSons(); voz.parar(); }; }, []);

  const diz = async (t: string) => { setFala(t); if (vivo.current) await voz.falar(textoVoz(t, crianca), { quem: 'sofia' }); };
  /** índice do pedaço que contém a letra `i` */
  const pedacoDaLetra = (i: number) => ps.findIndex((p) => i >= p.i && i < p.i + p.letras.length);

  /** Um som de cada vez (a boquinha faz o som; a letra acende). */
  const umPorUm = async () => {
    for (let j = 0; j < ps.length && vivo.current; j++) {
      const f = ps[j].fonema;
      if (!f) { setLidos(j + 1); continue; }
      setAtivo(j);
      if (modo === 'bocas-palavra') await espera(950);
      else if (!(await voz.somReal(f, 1))) await espera(700);
      setAtivo(-1);
      setLidos(j + 1);
      await espera(['p', 'b', 't', 'd', 'k', 'g'].includes(f) ? 380 : 480);
    }
  };
  /** Os sons emendados (síntese), com a boquinha e a letra de cada som acendendo junto. */
  const emendados = async (ritmos: ('lento' | 'rapido')[]) => {
    for (const r of ritmos) {
      if (!vivo.current) return;
      if (r === 'rapido') await diz(F.rapido);
      await tocarSonsEmendados(sonsPorLetra, r, (i) => setAtivo(pedacoDaLetra(i)));
      setAtivo(-1);
      await espera(300);
    }
  };
  /** Nível 4: a sequência de bocas de novo, sem som. */
  const bocasDeNovo = async () => { for (let j = 0; j < ps.length && vivo.current; j++) { if (!ps[j].fonema) continue; setAtivo(j); await espera(modoTeste() ? 30 : 850); setAtivo(-1); await espera(modoTeste() ? 10 : 200); } };

  const apresentar = async () => {
    setOcupado(true);
    setEtapa('guia');
    setLidos(0);
    if (modo === 'ler') await diz(F.olhaBoca);
    if (modo === 'bocas-palavra') { await diz(F.bocaDiferente); await bocasDeNovo(); await bocasDeNovo(); }
    else {
      await umPorUm();
      if (!vivo.current) return;
      await diz(F.junta);
      await emendados(['lento', 'rapido']);
    }
    if (!vivo.current) return;
    if (modo === 'ler') {
      // ler junto: prática guiada (exposição), não conta para o domínio (regra 4)
      tents.current.push({ ...registro({ habilidade: HABILIDADE_DO_MODO.ler, sessao, cena: `ficha-${campo}`, mecanica: 'ficha', alvo: item.palavra.toUpperCase(), respostas: [item.palavra.toUpperCase()], distratores: [], inicio: inicio.current, tipo: 'exposicao' }), formato: FORMATO_LER_JUNTO, contexto });
    }
    setEtapa('escolher');
    await diz(modo === 'bocas-palavra' ? F.qualPalavraBoca : F.oQueFicou);
    setOcupado(false);
    inicio.current = Date.now();
  };

  // começo de cada item
  useEffect(() => {
    if (!item) return;
    respostas.current = []; posEscolhida.current = undefined; ouviu.current = 0;
    setMarcadas([]); setContraste(null); setAtivo(-1); setLidos(0);
    if (k === 0 && modo === 'ler') { setEtapa('inicio'); setFala(F.lerJuntos); void voz.falar(textoVoz(F.lerJuntos, crianca), { quem: 'sofia' }); return; }
    void apresentar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  if (!item) return <p className="ficha-vazia">Ainda não há palavras para esta ficha.</p>;

  /** Fala o nome da palavra: o clipe gravado, se houver; senão os sons emendados ligeiro (nunca voz do aparelho). */
  const dizerPalavra = async (w: string) => {
    if (voz.temTodas([w])) await voz.falar(w, { quem: 'sofia' });
    else await tocarSonsEmendados(comSons(w).sons, 'rapido');
  };

  const escolher = async (w: string, pos: number) => {
    if (etapa !== 'escolher' || ocupado) return;
    respostas.current.push(w.toUpperCase());
    posEscolhida.current ??= pos;
    if (w === item.palavra) {
      setEtapa('feito');
      setOcupado(true);
      efeitos.acerto();
      tents.current.push({
        ...registro({
          habilidade: HABILIDADE_DO_MODO[modo], sessao, cena: `ficha-${campo}`, mecanica: 'ficha', alvo: item.palavra.toUpperCase(), respostas: respostas.current,
          distratores: item.opcoes.filter((o) => o !== item.palavra).map((o) => o.toUpperCase()), inicio: inicio.current, posicaoCerta: item.posicaoCerta,
          posicaoEscolhida: posEscolhida.current, nOpcoes: item.opcoes.length, ouviuDeNovo: ouviu.current
        }), formato: FORMATO_DO_MODO[modo], contexto
      });
      await dizerPalavra(item.palavra);
      await espera(200);
      await diz(FALAS.acertos[k % FALAS.acertos.length]);
      await espera(900);
      if (!vivo.current) return;
      if (k + 1 < itens.length) { setK(k + 1); return; }
      esquecerRodada(chave);
      const ts = tents.current;
      const av = ts.filter((t) => t.tipo === 'avaliada');
      onFim({ tentativas: ts, acertos: av.filter((t) => t.acertou && !t.comAjuda).length, total: av.length });
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, w]);
    setOcupado(true);
    if (respostas.current.length === 1) {
      // correção contrastiva: a escolhida soa assim… e a da ficha soa assim (o caminho, sem dizer a resposta)
      await diz(FALAS.erro1);
      setContraste(w);
      await tocarSonsEmendados(comSons(w).sons, 'rapido');
      await espera(450);
      setContraste(null);
      if (modo === 'bocas-palavra') await bocasDeNovo();
      else await emendados(['lento']);
      await diz(modo === 'bocas-palavra' ? F.qualPalavraBoca : F.oQueFicou);
    } else await diz(FALAS.erro2);
    setOcupado(false);
  };

  const ouvirDeNovo = async () => {
    if (ocupado) return;
    ouviu.current++;
    setOcupado(true);
    if (modo === 'bocas-palavra') await bocasDeNovo(); else await emendados(['lento']);
    setOcupado(false);
  };

  const mostrarCerta = respostas.current.length >= 2 && etapa === 'escolher';
  const escrita = modo === 'ler';
  return (
    <div className={`ficha-ativ modo-${modo}`} data-testid="ficha-atividade" data-modo={modo} data-etapa={etapa} data-item={k} data-palavra={modoTeste() ? item.palavra : undefined}>
      <Balao fala={{ quem: 'sofia', texto: fala }} crianca={crianca} />
      <Progressinho atual={k} total={itens.length} />
      <div className={`ficha-folha ${etapa === 'feito' ? 'revelada' : ''}`}>
        {etapa === 'feito' ? (
          <div className="ficha-revela" aria-live="polite"><Figura palavra={item.palavra} className="ficha-fig-grande" /><Brilho ativo /></div>
        ) : null}
        <div className="ficha-palavra" style={{ ['--n' as string]: ps.length } as CSSProperties} role="group" aria-label={escrita ? 'A palavra, letra por letra' : modo === 'bocas-palavra' ? 'As boquinhas da palavra' : 'Os sons da palavra'}>
          {ps.map((p, j) => (
            <div key={j} className={`ficha-pedaco ${ativo === j ? 'acesa' : ''} ${j < lidos ? 'lida' : ''} ${p.fonema ? '' : 'calada'}`} data-pedaco={j}>
              {modo === 'ler' || modo === 'bocas-palavra' ? <Boquinha fonema={p.fonema} falando={ativo === j} fixa={modo === 'bocas-palavra'} destaque={ativo === j} /> : null}
              {escrita || etapa === 'feito' ? <span className="ficha-letra">{p.letras}</span> : modo === 'bocas-palavra' ? null : <span className={`ficha-bolinha ${p.fonema ? '' : 'vazia'}`} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
      {etapa === 'inicio' ? (
        <div className="linha-botoes centro"><button className="btn enorme ipe brilha" onClick={() => void apresentar()} data-testid="ficha-ler-juntos"><Icone nome="som" />Vamos ler juntos?</button></div>
      ) : null}
      {etapa === 'escolher' || (etapa === 'feito' && modo !== 'ler') ? (
        <>
          <div className="pergunta">
            <button className="ouvir" aria-label={modo === 'bocas-palavra' ? 'Ver as boquinhas de novo' : 'Ouvir os sons de novo'} disabled={ocupado} onClick={() => void ouvirDeNovo()} data-testid="ficha-de-novo">
              <Icone nome={modo === 'bocas-palavra' ? 'olho' : 'som'} />
            </button>
            {/* a pergunta já está no balão da Sofia: aqui só o botão (revisão 18/11, item 3) */}
          </div>
        </>
      ) : null}
      {etapa === 'escolher' ? (
        <div className={`ficha-opcoes ${modo === 'ouvir-palavra' ? 'escritas' : ''}`} role="group" aria-label="Opções">
          {item.opcoes.map((o, j) => (
            <button key={o} className={`ficha-opcao ${marcadas.includes(o) ? 'tentada' : ''} ${contraste === o ? 'contraste' : ''} ${mostrarCerta && o === item.palavra ? 'modelo' : ''}`}
              onClick={() => void escolher(o, j)} disabled={ocupado && contraste !== o} data-opcao={o} data-correta={o === item.palavra ? '1' : undefined}
              aria-label={modo === 'ouvir-palavra' ? `Palavra ${j + 1}` : `Figura ${j + 1}`}>
              {modo === 'ouvir-palavra' ? <span className="ficha-opcao-texto">{BANCO[o]?.texto.toUpperCase() ?? o.toUpperCase()}</span> : <Figura palavra={o} />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================ nível 3 ================================================================ */

export function FichaBocas({ progresso, campo, crianca, sessao, contexto, onFim }: {
  progresso: Progresso; campo: string; crianca: Crianca; sessao: string; contexto: Contexto; onFim: (r: ResultadoFicha) => void;
}) {
  const chave = `${crianca.id}|${campo}|bocas`;
  const semente = useMemo(() => sementeDaRodada(chave), []); // eslint-disable-line react-hooks/exhaustive-deps
  const rodada = useMemo(() => rodadaDeBocas(progresso, campo, sorteio(semente)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const pares = useMemo(() => rodada?.pares ?? [], [rodada]);
  const letras = useMemo(() => [...pares].sort((a, b) => a.letra.localeCompare(b.letra)), [pares]);
  const bocas = useMemo(() => {
    const r = sorteio(semente + 11);
    const a = [...pares];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    // a boca de uma letra nunca fica logo embaixo dela (posição não entrega a resposta, R5)
    if (a.length > 1 && a.every((x, i) => x.letra === letras[i].letra)) a.push(a.shift()!);
    return a;
  }, [pares, letras, semente]);
  const [sel, setSel] = useState<string | null>(null);
  const [ligadas, setLigadas] = useState<string[]>([]);
  const [legenda, setLegenda] = useState<{ fonema: string; texto: string } | null>(null);
  const [fala, setFala] = useState<string>(F.ligar);
  const [ocupado, setOcupado] = useState(true);
  const erros = useRef<Record<string, string[]>>({});
  const nOpc = useRef<Record<string, number>>({});
  const inicio = useRef(Date.now());
  const tents = useRef<Tentativa[]>([]);
  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true;
    (async () => { await voz.falar(textoVoz(F.bocaDiferente, crianca), { quem: 'sofia' }); if (vivo.current) { setFala(F.ligar); setOcupado(false); inicio.current = Date.now(); } })();
    return () => { vivo.current = false; voz.parar(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rodada) return <p className="ficha-vazia">Ainda não há letras suficientes para esta brincadeira.</p>;

  const tocarLetra = (p: ParBoca) => {
    if (ocupado || ligadas.includes(p.letra)) return;
    efeitos.toque();
    setSel(p.letra);
    nOpc.current[p.letra] ??= pares.length - ligadas.length;
  };
  const tocarBoca = async (b: ParBoca) => {
    if (ocupado || ligadas.includes(b.letra)) return;
    if (!sel) { efeitos.suave(); setFala(F.ligar); return; }
    const letra = sel;
    const errosDaLetra = (erros.current[letra] ??= []);
    if (b.letra === letra) {
      efeitos.acerto();
      const n = nOpc.current[letra] ?? 1;
      const respostas = [...errosDaLetra, letra];
      tents.current.push({
        ...registro({
          habilidade: HABILIDADE_DO_MODO.bocas, sessao, cena: `ficha-${campo}`, mecanica: 'ficha', alvo: letra, respostas, categoria: 'grafema',
          distratores: pares.filter((x) => x.letra !== letra && !ligadas.includes(x.letra)).map((x) => x.letra), inicio: inicio.current,
          posicaoCerta: bocas.findIndex((x) => x.letra === letra), posicaoEscolhida: bocas.findIndex((x) => x.letra === respostas[0]), nOpcoes: n,
          // só vale como medida quando havia 3 bocas ou mais para escolher (R8); as últimas ligações são prática
          tipo: n >= 3 ? 'avaliada' : 'exposicao'
        }), formato: FORMATO_DO_MODO.bocas, contexto
      });
      const novas = [...ligadas, letra];
      setLigadas(novas);
      setSel(null);
      setLegenda(null);
      inicio.current = Date.now();
      if (novas.length === pares.length) {
        setOcupado(true);
        await voz.falar(textoVoz(FALAS.acertos[3], crianca), { quem: 'sofia' });
        await espera(700);
        const av = tents.current.filter((t) => t.tipo === 'avaliada');
        esquecerRodada(chave);
        if (vivo.current) onFim({ tentativas: tents.current, acertos: av.filter((t) => t.acertou && !t.comAjuda).length, total: av.length });
      }
      return;
    }
    efeitos.suave();
    errosDaLetra.push(b.letra);
    setOcupado(true);
    // 1º erro: a boca escolhida mostra como ela é ("lábios fechados"), para comparar; 2º: a certa brilha (ajuda)
    const c = classeDaBoca(b.fonema);
    setLegenda(c ? { fonema: b.fonema, texto: DESCRICAO_DA_BOCA[c] } : null);
    setFala(F.bocaDiferente);
    await voz.falar(textoVoz(errosDaLetra.length === 1 ? F.bocaDiferente : FALAS.erro2, crianca), { quem: 'sofia' });
    setOcupado(false);
  };
  const certaDe = (l: string) => (erros.current[l]?.length ?? 0) >= 2;
  return (
    <div className="ficha-ativ modo-bocas" data-testid="ficha-atividade" data-modo="bocas" data-etapa={ligadas.length === pares.length ? 'feito' : 'escolher'}>
      <Balao fala={{ quem: 'sofia', texto: fala }} crianca={crianca} />
      <div className="ficha-ligar">
        <div className="ficha-ligar-letras" role="group" aria-label="Letras">
          {letras.map((p) => (
            <button key={p.letra} className={`ficha-letra-solta ${sel === p.letra ? 'sel' : ''} ${ligadas.includes(p.letra) ? 'ligada' : ''}`} onClick={() => tocarLetra(p)} disabled={ligadas.includes(p.letra)}
              data-letra={p.letra} aria-pressed={sel === p.letra} aria-label={`Letra ${p.letra}`}>{p.letra}</button>
          ))}
        </div>
        <div className="ficha-ligar-bocas" role="group" aria-label="Boquinhas">
          {bocas.map((b, j) => (
            <button key={b.letra} className={`ficha-boca-btn ${ligadas.includes(b.letra) ? 'ligada' : ''} ${sel && certaDe(sel) && b.letra === sel ? 'modelo' : ''}`} onClick={() => void tocarBoca(b)}
              disabled={ligadas.includes(b.letra)} data-boca={b.letra} data-fonema={b.fonema} aria-label={`Boquinha ${j + 1}`}>
              <Boquinha fonema={b.fonema} fixa />
              {ligadas.includes(b.letra) ? <span className="ficha-boca-letra">{b.letra}</span> : null}
              {legenda?.fonema === b.fonema ? <span className="ficha-boca-legenda">{legenda.texto}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
