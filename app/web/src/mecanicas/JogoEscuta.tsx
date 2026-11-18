/**
 * JOGOS DE ESCUTA do "Brincar com sons" (docs/pedagogia/04 N6–N8; 02 CF-SIL-03, CF-SIL-04, CF-PDP-01, CF-RIM-01):
 * palavra comprida, palavra escondida, rima, quem não rima e mesmo começo. Só escuta e escolha (identificar antes de
 * produzir: MOR p. 51–53, 131). A dupla diz o nome de cada figura (04 R10; MOR p. 147); posições sorteadas (R5);
 * 1º erro: compara o que a criança tocou com o estímulo (correção contrastiva); 2º erro: a certa brilha (ajuda máxima, R4).
 * Exemplo feito pela Sofia antes de valer, na primeira vez de cada jogo (R12; MOR p. 80; VT-PE p. 50).
 * A parte escrita (sílabas, rima, palavra escondida) só aparece DEPOIS da resposta (04 N7; MOR p. 137–139).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_ESCUTA as F, nomeDaFigura, type JogoEscuta as Jogo, type Opcao } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { efeitos } from '../servicos/efeitos.ts';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { voz } from '../servicos/voz.ts';
import { falar } from '../util.ts';
import { Progressinho, embaralhar, sementeDaTentativa, sortearItens } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';
import { falarFigura, opcaoFigura, useFala } from './livre-comum.tsx';

const chaveDemo = (c: string, j: string) => `fonema-demo-escuta:${c}:${j}`;
const jaViu = (c: string, j: string) => { try { return localStorage.getItem(chaveDemo(c, j)) === '1'; } catch { return true; } };
const marcar = (c: string, j: string) => { try { localStorage.setItem(chaveDemo(c, j), '1'); } catch { /* sem armazenamento */ } };

export function JogoEscuta({ jogo, crianca, sessao, onFim }: { jogo: Jogo; crianca: Crianca; sessao: string; onFim: (r: { tentativas: Tentativa[]; acertos: number }) => void }) {
  const semente = useMemo(sementeDaTentativa, []);
  const rodada = useMemo(() => sortearItens(jogo.itens, jogo.porRodada, semente), [jogo, semente]);
  const demo = useMemo(() => jogo.itens.find((x) => !rodada.includes(x)) ?? rodada[0], [jogo, rodada]);
  const [i, setI] = useState(0);
  const [emDemo, setEmDemo] = useState(false);
  const item = emDemo ? demo : rodada[i];
  const opcoes: Opcao[] = useMemo(() => embaralhar(item.opcoes.map(opcaoFigura), semente ? semente + i * 17 + (emDemo ? 5 : 0) : 0), [item, semente, i, emDemo]);
  const { fala, diz } = useFala(crianca, jogo.enunciado);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [ocupado, setOcupado] = useState(true);
  const [acesa, setAcesa] = useState<string | null>(null);
  const [revelar, setRevelar] = useState(false);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const ouviu = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<Tentativa[]>([]);
  const vivo = useRef(true);
  const disseEnunciado = useRef(false);

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; voz.parar(); }; }, []);

  /** Diz a pergunta, o estímulo e o nome de cada opção, acendendo a figura que está sendo dita. */
  const apresentar = async (it = item, ops = opcoes) => {
    if (jogo.pergunta) await diz({ quem: 'sofia', texto: jogo.pergunta });
    if (it.estimulo) { setAcesa(it.estimulo); await falarFigura(it.estimulo); await espera(250); }
    for (const o of ops) { if (!vivo.current) return; setAcesa(o.id); await falarFigura(o.id); await espera(220); }
    setAcesa(null);
  };

  useEffect(() => {
    let atual = true;
    setMarcadas([]); setAcertou(false); setRevelar(false); setOcupado(true);
    respostas.current = []; pos.current = undefined; ouviu.current = 0;
    (async () => {
      if (i === 0 && !emDemo && !disseEnunciado.current) {
        disseEnunciado.current = true;
        await falar(jogo.enunciado, crianca);
        if (!jaViu(crianca.id, jogo.id) && atual) { setEmDemo(true); return; }
      }
      if (emDemo) {
        // exemplo antes de valer: a Sofia faz um item inteiro, sem registro
        await diz(F.euFaco);
        await apresentar();
        if (!atual) return;
        setAcesa(item.correta);
        await falarFigura(item.correta);
        setAcertou(true); setRevelar(true); efeitos.acerto();
        await explicar();
        await espera(500);
        if (!atual) return;
        marcar(crianca.id, jogo.id);
        // a vez da criança começa limpa: a resposta da demonstração não fica marcada (revisão 18/11, item 6)
        setAcesa(null); setAcertou(false); setRevelar(false);
        await diz(F.voceFaz);
        setEmDemo(false);
        return;
      }
      await apresentar();
      if (atual) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, emDemo]);

  /** Depois do acerto: mostra a parte escrita e diz por que (rima, começo igual, palavra escondida, pedaços). */
  const explicar = async () => {
    const certa = item.correta;
    if (jogo.modo === 'comprida') {
      await diz(F.pedacos);
      for (const o of item.opcoes) { setAcesa(o); await falarFigura(o); await espera(200); }
      setAcesa(null);
    } else if (jogo.modo === 'dentro') {
      await diz(F.escondida); await falarFigura(item.estimulo!); await espera(200); await falarFigura(certa);
    } else if (jogo.modo === 'rima') {
      await diz(F.rimam); await falarFigura(item.estimulo!); await espera(200); await falarFigura(certa);
    } else if (jogo.modo === 'intruso') {
      await diz(F.naoRima); await falarFigura(certa);
    } else if (jogo.modo === 'inicio') {
      await diz(F.mesmoComeco); await falarFigura(item.estimulo!); await espera(200); await falarFigura(certa);
    }
  };

  const escolher = async (o: Opcao, k: number) => {
    if (acertou || ocupado || emDemo) return;
    respostas.current.push(o.id);
    pos.current ??= k;
    if (o.id === item.correta) {
      setAcertou(true); setOcupado(true); setRevelar(true);
      efeitos.acerto();
      tents.current.push(registro({
        habilidade: jogo.habilidade, sessao, cena: `livre-${jogo.id}`, mecanica: 'escuta', alvo: item.correta, respostas: [...respostas.current], categoria: 'palavra',
        distratores: item.opcoes.filter((x) => x !== item.correta), inicio: inicio.current, posicaoCerta: opcoes.findIndex((x) => x.id === item.correta),
        posicaoEscolhida: pos.current, nOpcoes: opcoes.length, ouviuDeNovo: ouviu.current
      }));
      await explicar();
      await diz(FALAS.acertos[i % FALAS.acertos.length]);
      await espera(modoTeste() ? 50 : 700);
      if (!vivo.current) return;
      if (i + 1 < rodada.length) setI(i + 1);
      else {
        await diz(F.fim);
        onFim({ tentativas: tents.current, acertos: tents.current.filter((t) => t.acertou && !t.comAjuda).length });
      }
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    if (respostas.current.length === 1) {
      // correção contrastiva: o que tocou × o que foi pedido, e a pergunta de novo, devagar
      await diz(F.voceTocou); setAcesa(o.id); await falarFigura(o.id); await espera(200);
      if (item.estimulo) { await diz(F.comparar); setAcesa(item.estimulo); await falarFigura(item.estimulo); }
      await diz(F.escuteDeNovo);
      await apresentar();
    } else await diz(FALAS.erro2);
    setAcesa(null);
    setOcupado(false);
  };

  const pecas = (id: string) => item.revela?.[id];
  return (
    <div className={`mec mec-escuta modo-${jogo.modo}`} data-testid="jogo-escuta" data-jogo={jogo.id} data-demo={emDemo ? '1' : undefined} data-correta={item.correta}>
      <Balao fala={fala} crianca={crianca} />
      <Progressinho atual={i} total={rodada.length} />
      {item.estimulo ? (
        <div className={`escuta-estimulo ${acesa === item.estimulo ? 'acesa' : ''}`}>
          <button className="escuta-estimulo-fig" onClick={() => { ouviu.current++; efeitos.toque(); void falarFigura(item.estimulo!); }} disabled={ocupado} aria-label={`Ouvir: ${nomeDaFigura(item.estimulo)}`}>
            <Figura palavra={item.estimulo} />
            <span className="escuta-ouvir"><Icone nome="som" /></span>
          </button>
          {revelar && pecas(item.estimulo) ? <Partes partes={pecas(item.estimulo)!} destaque={jogo.modo === 'dentro' ? item.correta : jogo.modo === 'inicio' ? 0 : -1} /> : null}
        </div>
      ) : null}
      <div className={`escuta-opcoes ${acesa ? 'falando' : ''}`} data-acesa={acesa ?? ''}>
        <OpcoesTF opcoes={opcoes} correta={item.correta} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={escolher} rotulo="Figuras" />
        <div className="escuta-revela" aria-live="polite">
          {revelar ? opcoes.map((o) => (pecas(o.id) ? (
            <div key={o.id} className={`escuta-revela-item ${o.id === item.correta ? 'certa' : ''}`}>
              {jogo.modo === 'comprida' ? <Palminhas n={pecas(o.id)!.length} /> : null}
              <Partes partes={pecas(o.id)!} destaque={jogo.modo === 'inicio' ? 0 : jogo.modo === 'rima' ? 1 : -1} silabas={jogo.modo === 'comprida'} />
            </div>
          ) : <div key={o.id} />)) : null}
        </div>
      </div>
      {acertou ? <Brilho ativo /> : null}
    </div>
  );
}

/** Palavra escrita em pedaços, com um pedaço em destaque (por índice ou pelo texto). Só para ver: não é leitura. */
function Partes({ partes, destaque, silabas }: { partes: string[]; destaque: number | string; silabas?: boolean }) {
  return (
    <span className={`escuta-partes ${silabas ? 'silabas' : ''}`} aria-hidden="true">
      {partes.map((p, k) => <b key={k} className={k === destaque || (typeof destaque === 'string' && p.toLowerCase() === destaque) ? 'destaque' : ''}>{p.toUpperCase()}</b>)}
    </span>
  );
}

/** Uma mãozinha por pedaço (sílaba) da palavra. */
function Palminhas({ n }: { n: number }) {
  return <span className="escuta-palmas" aria-label={`${n} pedaços`}>{Array.from({ length: n }, (_, k) => <i key={k} style={{ animationDelay: `${k * 0.18}s` }} />)}</span>;
}
