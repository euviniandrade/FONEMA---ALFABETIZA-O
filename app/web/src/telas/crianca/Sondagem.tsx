/**
 * SONDAGEM PERIÓDICA em blocos (D030 etapa 9; docs/pedagogia/06 §3): "Missão das Placas da Vila", agora com cinco
 * placas curtas — sons das letras, leitura de palavras, nomes de bichinhos (pseudopalavras conferidas), quantos sons e
 * ditado. Os itens vêm do motor (`montarSondagem`) e só usam o que a criança já estudou.
 *
 * Regras de 06 §3: sem dica, sem ajuda, sem "certo/errado", sem moeda nem trava; a criança vê só "missão cumprida".
 * O resultado vai para o adulto (painel), por área, e não entra no domínio (medida não se mistura com treino).
 * A PRIMEIRA sondagem continua sendo a Missão das Placas antiga (ela alimenta a Trilha Expressa, D021).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Fala } from '@fonema/conteudo';
import {
  AREAS_SONDAGEM, EXEMPLO_SEGMENTACAO, conferirDitado, montarSondagem, registrarSondagem, resultadoPorArea, situacaoSondagem, ultimaSondagem,
  type AreaSondagem, type ItemDaSondagem, type ItemSondagem, type PlanoSondagem
} from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, BotaoOuvir, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { Modelo3D } from '../../componentes/recompensas.tsx';
import { espera, modoTeste } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { falar } from '../../util.ts';
import { IDADE_DA_LEITURA, Sondagem as MissaoDasPlacas } from './Extras.tsx';
import { letraAa } from '../../componentes/LetraAa.tsx';

/** Menos que isto de itens possíveis: a criança ainda viu pouco; vale a Missão das Placas antiga. */
const MINIMO_DE_ITENS = 3;

/** Falas de cada placa: todas com clipe gravado e auditado (sem voz nova). A da segmentação ainda não tem voz. */
const FALA_DO_BLOCO: Record<AreaSondagem, Fala> = {
  'sons-letras': { quem: 'sofia', texto: 'Ouça e toque na letra.' },
  'leitura-palavras': { quem: 'sofia', texto: 'Lê e toca a figura!' },
  pseudopalavras: { quem: 'tales', texto: 'Esses são nomes de bichinhos da mata. Lê pra mim, [NOME]!' },
  segmentacao: { quem: 'sofia', texto: 'Quantos sons tem a palavra? Escuta comigo.' },
  ditado: { quem: 'sofia', texto: 'Escuta a palavra e monta com as letras.' }
};
const ROTULO_PLACA: Record<AreaSondagem, string> = {
  'sons-letras': 'Placa dos sons', 'leitura-palavras': 'Placa das palavras', pseudopalavras: 'Placa dos bichinhos', segmentacao: 'Placa dos pedacinhos de som', ditado: 'Placa da escrita'
};
const INTRO: Fala = { quem: 'sofia', texto: 'O Zum-Zum embaralhou as placas da vila! Me ajuda a pendurar, [NOME]?' };
const FIM: Fala = { quem: 'sofia', texto: 'Todas as placas no lugar! Obrigada pela ajuda, [NOME]!' };

/** Rota "sondagem": a primeira é a Missão das Placas (Trilha Expressa); as periódicas, em blocos. */
export function SondagemDaVila({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const [plano, setPlano] = useState<PlanoSondagem | null>(null);
  useEffect(() => {
    if (progresso && !plano) setPlano(montarSondagem(progresso, modoTeste() ? 1 : Date.now() % 2147483647));
  }, [progresso, plano]);
  if (!crianca || !progresso || !plano) return <Carregando />;
  const primeira = !ultimaSondagem(progresso) && progresso.expressa.sondagemEm === undefined;
  // 4 e 5 anos (docs/pedagogia/06 §3): só o bloco de sons e letras (som inicial/letras; nada de fonema no meio da palavra)
  const idade = new Date().getFullYear() - crianca.anoNascimento;
  const doPlano = idade < IDADE_DA_LEITURA ? { ...plano, blocos: plano.blocos.filter((x) => x.area === 'sons-letras') } : plano;
  const total = doPlano.blocos.reduce((n, x) => n + x.itens.length, 0);
  if (primeira || total < MINIMO_DE_ITENS) return <MissaoDasPlacas criancaId={criancaId} />;
  return <SondagemEmBlocos criancaId={criancaId} plano={{ ...doPlano, total }} />;
}

type Resposta = ItemSondagem & { area: AreaSondagem };

function SondagemEmBlocos({ criancaId, plano }: { criancaId: string; plano: PlanoSondagem }) {
  const { repo, config } = useApp();
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  const [fase, setFase] = useState<'intro' | 'bloco' | 'fim'>('intro');
  const [b, setB] = useState(0);
  const [i, setI] = useState(0);
  const respostas = useRef<Resposta[]>([]);
  const salvo = useRef(false);
  const bloco = plano.blocos[b];
  const item = bloco?.itens[i];

  useEffect(() => { if (crianca && fase === 'intro') void falar(INTRO, crianca); }, [crianca, fase]);
  useEffect(() => () => voz.parar(), []);
  if (!crianca || !progresso) return <Carregando />;

  const terminar = async () => {
    setFase('fim');
    if (salvo.current) return;
    salvo.current = true;
    const agora = Date.now();
    const motivo = situacaoSondagem(progresso, config, agora).motivo;
    const novo = registrarSondagem(progresso, { id: novoId('sd'), areas: resultadoPorArea(respostas.current), motivo, tela: 'blocos' }, agora);
    await salvarProgresso(novo);
    const medidas = plano.blocos.map((x) => AREAS_SONDAGEM.find((a) => a.id === x.area)?.nome).join(', ');
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'sondagem', texto: `Sondagem periódica (${medidas})`, acertos: respostas.current.filter((r) => r.acertou).length, total: respostas.current.length });
    efeitos.conquista();
    await falar(FIM, crianca);
  };
  const responder = (r: Omit<Resposta, 'area' | 'alvo'>) => {
    respostas.current.push({ area: bloco.area, alvo: item.alvo, ...r });
    efeitos.toque(); // som neutro: a sondagem não diz "certo" nem "errado"
    if (i + 1 < bloco.itens.length) setI(i + 1);
    else if (b + 1 < plano.blocos.length) { setB(b + 1); setI(0); }
    else void terminar();
  };
  const placas = plano.blocos.length;

  return (
    <div className="tela-sondagem tela-sondagem-blocos" data-testid="sondagem-blocos">
      <Fundo cena="praca" desfoque={14} tom="calmo" />
      <Topo crianca={crianca} voltar={`c/${criancaId}/vila`} titulo="Missão das Placas da Vila" />
      <main className="palco">
        <section className="cartao sondagem-cartao sondagem-blocos" data-fase={fase} data-area={bloco?.area}>
          <ol className="placas-fila" aria-label={`Placa ${Math.min(b + 1, placas)} de ${placas}`}>
            {plano.blocos.map((x, k) => (
              <li key={x.area} className={fase === 'fim' || k < b ? 'pendurada' : k === b && fase === 'bloco' ? 'agora' : ''} title={ROTULO_PLACA[x.area]}>
                <span className="placa-tabua"><Icone nome={fase === 'fim' || k < b ? 'check' : 'placa'} /></span>
              </li>
            ))}
          </ol>
          {fase === 'intro' ? (
            <div className="sondagem-intro">
              <div className="sondagem-mascote" aria-hidden="true"><Modelo3D qual="sofia" tamanho={230} modo="balanco" /></div>
              <div>
                <h1 className="t">Missão das Placas</h1>
                <Balao fala={INTRO} crianca={crianca} />
                <p className="sondagem-nota">São {placas} placas rapidinhas. Não tem certo nem errado: é só fazer do seu jeito.</p>
                <button className="btn enorme ipe brilha" onClick={() => { voz.parar(); setFase('bloco'); }} data-testid="comecar-sondagem"><Icone nome="play" />Vamos!</button>
              </div>
            </div>
          ) : fase === 'fim' ? (
            <div className="sondagem-fim" data-testid="sondagem-fim">
              <div className="sondagem-mascote" aria-hidden="true"><Modelo3D qual="sofia" tamanho={210} modo="entrada" /></div>
              <div>
                <h1 className="t">Missão cumprida!</h1>
                <Balao fala={FIM} crianca={crianca} />
                <div className="linha-botoes"><button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)} data-testid="sondagem-voltar"><Icone nome="casa" />Voltar para a vila</button></div>
              </div>
            </div>
          ) : (
            <BlocoAtual key={`${b}-${i}`} area={bloco.area} item={item} primeiro={i === 0} n={i} total={bloco.itens.length} crianca={crianca} aoResponder={responder} />
          )}
        </section>
      </main>
    </div>
  );
}

interface PropsBloco {
  area: AreaSondagem;
  item: ItemDaSondagem;
  primeiro: boolean;
  n: number;
  total: number;
  crianca: NonNullable<ReturnType<typeof useCrianca>['crianca']>;
  aoResponder: (r: Omit<Resposta, 'area' | 'alvo'>) => void;
}

/** Um item da placa: toca o estímulo (a instrução da placa vem só no 1º item) e espera a resposta. */
function BlocoAtual({ area, item, primeiro, n, total, crianca, aoResponder }: PropsBloco) {
  const [pronto, setPronto] = useState(false);
  const [exemplo, setExemplo] = useState(primeiro && area === 'segmentacao' ? 0 : -1);
  const inicio = useRef(0);
  const ouviu = useRef(0);
  const estimulo = useMemo(() => async () => {
    if (area === 'sons-letras' && item.somAlvo) { if (!(await voz.somReal(item.somAlvo, 2))) await voz.falar(`${item.somAlvo}${item.somAlvo}${item.somAlvo}`, { quem: 'sofia' }); }
    else if (item.ouvir) await voz.falar(item.ouvir, { quem: 'sofia' });
  }, [area, item]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (primeiro) await falar(FALA_DO_BLOCO[area], crianca);
      if (!vivo) return;
      if (exemplo === 0) {
        // exemplo feito pela dupla (não vale): a palavra, depois cada som acendendo uma bolinha
        await voz.falar(EXEMPLO_SEGMENTACAO.palavra, { quem: 'sofia' });
        for (let k = 0; k < EXEMPLO_SEGMENTACAO.sons.length && vivo; k++) {
          setExemplo(k + 1);
          if (!(await voz.somReal(EXEMPLO_SEGMENTACAO.sons[k], 1))) await espera(700);
          await espera(250);
        }
        if (!vivo) return;
        await espera(900);
        setExemplo(-1);
      }
      if (!vivo) return;
      await estimulo();
      if (!vivo) return;
      inicio.current = Date.now();
      setPronto(true);
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ouvirDeNovo = () => { ouviu.current++; void estimulo(); };
  const tempo = () => (inicio.current ? Date.now() - inicio.current : undefined);
  const escolher = (id: string) => {
    if (!pronto) return;
    voz.parar();
    aoResponder({ escolhido: id, acertou: id === item.alvo, tempoMs: tempo(), posicaoCerta: item.opcoes.indexOf(item.alvo), posicaoEscolhida: item.opcoes.indexOf(id), ouviuDeNovo: ouviu.current });
  };

  const cabecalho = (
    <div className="sondagem-cab">
      <h2 className="titulo-cena t"><Icone nome="placa" />{ROTULO_PLACA[area]}</h2>
      <span className="sondagem-passos" aria-hidden="true">{Array.from({ length: total }, (_, k) => <i key={k} className={k < n ? 'feito' : k === n ? 'agora' : ''} />)}</span>
    </div>
  );
  const fala = <Balao fala={FALA_DO_BLOCO[area]} crianca={crianca} />;

  if (exemplo >= 0) {
    return (
      <div className="sondagem-item" data-exemplo="1">
        {cabecalho}
        {fala}
        <div className="pergunta exemplo-seg">
          <Figura palavra={EXEMPLO_SEGMENTACAO.palavra} className="fig fig-exemplo" />
          <div className="bolinhas-som grande" aria-label="Exemplo: lua tem 3 sons">{EXEMPLO_SEGMENTACAO.sons.map((_, k) => <i key={k} className={k < exemplo ? 'acesa' : ''} />)}</div>
          <p className="sondagem-nota">Olha: <b>lua</b> tem {EXEMPLO_SEGMENTACAO.sons.length} sons.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sondagem-item" data-item={item.alvo} data-pronto={pronto ? '1' : '0'}>
      {cabecalho}
      {primeiro ? fala : null}
      {area === 'sons-letras' ? (
        <>
          <div className="pergunta"><BotaoOuvir onClick={ouvirDeNovo} rotulo="Ouvir o som de novo" /></div>
          <div className="opcoes opcoes-sondagem">{item.opcoes.map((l) => (
            <button key={l} className="opcao opcao-letra" onClick={() => escolher(l)} disabled={!pronto} data-opcao={l} data-testid="opcao-sondagem"><span className="letra">{letraAa(l)}</span></button>
          ))}</div>
        </>
      ) : area === 'leitura-palavras' ? (
        <>
          <div className="pergunta"><div className="palavra-grande" data-testid="palavra-sondagem">{item.mostrar}</div></div>
          <div className="opcoes opcoes-sondagem">{item.opcoes.map((w) => (
            <button key={w} className="opcao" onClick={() => escolher(w)} disabled={!pronto} data-opcao={w} aria-label={`Figura ${n + 1}`} data-testid="opcao-sondagem"><Figura palavra={w} /></button>
          ))}</div>
        </>
      ) : area === 'pseudopalavras' ? (
        <OuvirLeituras item={item} pronto={pronto} aoEscolher={escolher} />
      ) : area === 'segmentacao' ? (
        <>
          <div className="pergunta"><BotaoOuvir onClick={ouvirDeNovo} rotulo="Ouvir a palavra de novo" /><span className="dica-ouvir">Quantos sons?</span></div>
          <div className="opcoes opcoes-sondagem opcoes-sons">{item.opcoes.map((x) => (
            <button key={x} className="opcao opcao-sons" onClick={() => escolher(x)} disabled={!pronto} data-opcao={x} aria-label={`${x} sons`} data-testid="opcao-sondagem">
              <span className="bolinhas-som">{Array.from({ length: Number(x) }, (_, k) => <i key={k} />)}</span><b>{x}</b>
            </button>
          ))}</div>
        </>
      ) : (
        <DitadoDaSondagem item={item} pronto={pronto} aoOuvir={ouvirDeNovo} aoTerminar={(escrito) => {
          voz.parar();
          aoResponder({ escolhido: escrito, escrito, acertou: conferirDitado(item.alvo, escrito), tempoMs: tempo(), ouviuDeNovo: ouviu.current });
        }} />
      )}
    </div>
  );
}

/** Pseudopalavra conferida: o nome do bichinho escrito e três leituras para ouvir; toca, ouve e confirma. */
function OuvirLeituras({ item, pronto, aoEscolher }: { item: ItemDaSondagem; pronto: boolean; aoEscolher: (id: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [tocando, setTocando] = useState<string | null>(null);
  const ouvir = async (w: string) => {
    setSel(w);
    setTocando(w);
    await voz.falar(w, { quem: 'sofia' });
    setTocando((x) => (x === w ? null : x));
  };
  return (
    <>
      <div className="pergunta"><div className="palavra-grande pseudo" data-testid="palavra-sondagem">{item.mostrar}</div></div>
      <div className="opcoes opcoes-sondagem opcoes-leituras" role="radiogroup" aria-label="Leituras para ouvir">
        {item.opcoes.map((w, k) => (
          <button key={w} role="radio" aria-checked={sel === w} className={`opcao opcao-leitura cor-${k} ${sel === w ? 'sel' : ''} ${tocando === w ? 'tocando' : ''}`} onClick={() => ouvir(w)} disabled={!pronto} data-opcao={w} aria-label={`Leitura ${k + 1}`} data-testid="opcao-sondagem">
            <Icone nome="som" /><b>{k + 1}</b>
          </button>
        ))}
      </div>
      <div className="linha-botoes"><button className="btn grande verde" disabled={!sel || !pronto} onClick={() => sel && aoEscolher(sel)} data-testid="confirmar-leitura"><Icone nome="check" />É este!</button></div>
    </>
  );
}

/** Ditado sem modelo: ouve a palavra e monta com as letras móveis (há letras sobrando). Sem correção na sondagem. */
function DitadoDaSondagem({ item, pronto, aoOuvir, aoTerminar }: { item: ItemDaSondagem; pronto: boolean; aoOuvir: () => void; aoTerminar: (escrito: string) => void }) {
  const [escrito, setEscrito] = useState<number[]>([]);
  const bandeja = item.bandeja ?? [];
  return (
    <div className="mec mec-ditado sondagem-ditado">
      <div className="pergunta"><BotaoOuvir onClick={aoOuvir} rotulo="Ouvir a palavra de novo" /><span className="dica-ouvir">Escuta e escreve</span></div>
      <div className="espacos">
        {escrito.map((k, j) => <span key={j} className="espaco cheio">{bandeja[k]}</span>)}
        <span className="espaco cursor" />
      </div>
      <div className="pecas teclado" role="group" aria-label="Letras">
        {bandeja.map((l, k) => (
          <button key={k} className="peca" disabled={!pronto || escrito.includes(k)} onClick={() => { efeitos.toque(); setEscrito((e) => [...e, k]); }} data-peca={l}>{l}</button>
        ))}
      </div>
      <div className="linha-botoes">
        <button className="btn" onClick={() => setEscrito((e) => e.slice(0, -1))} disabled={!escrito.length}><Icone nome="apagar" />Apagar</button>
        <button className="btn grande verde" onClick={() => aoTerminar(escrito.map((k) => bandeja[k]).join(''))} disabled={!escrito.length || !pronto} data-testid="ditado-pronto"><Icone nome="check" />Pronto!</button>
      </div>
    </div>
  );
}
