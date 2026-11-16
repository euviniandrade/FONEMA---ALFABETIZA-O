/**
 * LER MAIS LIGEIRO: releitura cronometrada de uma lista de palavras que a criança JÁ LEU CERTO na trilha
 * (docs/pedagogia/02 FLU-PAL-01; ABC p. 375–376 leitura repetida, só com precisão ≥ 95%; VT-1A p. 197, 202; ABC p. 515
 * gráfico de progresso). Cada palavra aparece sozinha; a criança lê EM VOZ ALTA e toca na figura da palavra — a
 * figura confere a leitura (não é autorrelato). O tempo vai da palavra aparecer até a escolha certa.
 * Microfone (opcional, só com o aparelho permitindo): o reconhecimento de fala escuta junto e conta quantas palavras
 * "ouviu"; é APOIO para o adulto, nunca a nota (servicos/microfone.ts: "sinal, nunca juiz").
 * Erro: "leia de novo, letra por letra" + os sons da palavra, um a um; a palavra conta como não lida de primeira.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { BANCO, FALAS_BIBLIOTECA as B, comSons, type Opcao } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { escutar, temReconhecimento } from '../servicos/microfone.ts';
import { voz } from '../servicos/voz.ts';
import { embaralhar, sementeDaTentativa } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';
import { useFala } from './livre-comum.tsx';
import { pararSons, tocarSonsEmendados } from './sons-emendados.ts';

export interface ItemLido { palavra: string; certa: boolean; tempoMs: number; ouvido?: boolean }

/** Duas outras palavras da lista para as opções: primeiro as que mudam pouco (mesmo tamanho, mesmas letras). */
function distratores(alvo: string, lista: string[]): string[] {
  const parecida = (w: string) => [...w].filter((c, k) => alvo[k] === c).length + (w.length === alvo.length ? 1 : 0);
  return lista.filter((w) => w !== alvo && BANCO[w]?.figura).sort((a, b) => parecida(b) - parecida(a) || a.localeCompare(b)).slice(0, 2);
}

export function Fluencia({ palavras, crianca, sessao, onFim }: { palavras: string[]; crianca: Crianca; sessao: string; onFim: (r: { tentativas: Tentativa[]; itens: ItemLido[]; microfone: boolean }) => void }) {
  const semente = useMemo(sementeDaTentativa, []);
  const ordem = useMemo(() => embaralhar(palavras, semente), [palavras, semente]);
  const [etapa, setEtapa] = useState<'intro' | 'lendo' | 'fim'>('intro');
  const [i, setI] = useState(0);
  const alvo = ordem[i];
  const opcoes: Opcao[] = useMemo(() => embaralhar([alvo, ...distratores(alvo, palavras)], semente ? semente + i * 3 : 0).map((w) => ({ id: BANCO[w].figura!, rotulo: w })), [alvo, palavras, semente, i]); // sem 'falar': ouvir o nome da figura entregaria a leitura
  const certaId = BANCO[alvo].figura!;
  const { fala, diz } = useFala(crianca, B.fluAbre);
  const [mic, setMic] = useState(false);
  const [ocupado, setOcupado] = useState(true);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [letraAcesa, setLetraAcesa] = useState(-1);
  const itens = useRef<ItemLido[]>([]);
  const tents = useRef<Tentativa[]>([]);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const inicio = useRef(Date.now());
  const ouvido = useRef<Promise<string | null> | null>(null);
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    (async () => { await diz(B.fluAbre); setOcupado(false); })();
    return () => { vivo.current = false; pararSons(); voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (etapa !== 'lendo') return;
    setMarcadas([]); setAcertou(false); respostas.current = []; pos.current = undefined;
    inicio.current = Date.now();
    ouvido.current = mic ? escutar(3500) : null;
    setOcupado(false);
  }, [i, etapa, mic]);

  const comecar = async () => {
    setOcupado(true);
    if (mic) await diz(B.fluMic);
    setEtapa('lendo');
  };

  const escolher = async (o: Opcao, k: number) => {
    if (acertou || ocupado) return;
    respostas.current.push(o.rotulo);
    pos.current ??= k;
    if (o.id === certaId) {
      const tempoMs = Date.now() - inicio.current;
      setAcertou(true); setOcupado(true); efeitos.acerto();
      const deprimeira = respostas.current.length === 1;
      let ouviu: boolean | undefined;
      if (ouvido.current) { const t = await Promise.race([ouvido.current, espera(400).then(() => null)]); ouviu = !!t && t.toLowerCase().includes(alvo.slice(0, 3)); }
      itens.current.push({ palavra: alvo, certa: deprimeira, tempoMs, ...(mic ? { ouvido: ouviu } : {}) });
      tents.current.push({
        ...registro({ habilidade: 'fluencia-palavras', sessao, cena: 'livre-fluencia', mecanica: 'fluencia', alvo, respostas: [...respostas.current], distratores: opcoes.filter((x) => x.id !== certaId).map((x) => x.rotulo), inicio: inicio.current, posicaoCerta: opcoes.findIndex((x) => x.id === certaId), posicaoEscolhida: pos.current, nOpcoes: opcoes.length }),
        tempoMs
      });
      await espera(modoTeste() ? 20 : 350);
      if (!vivo.current) return;
      if (i + 1 < ordem.length) setI(i + 1);
      else { setEtapa('fim'); await diz(B.fluFim); onFim({ tentativas: tents.current, itens: itens.current, microfone: mic }); }
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    await diz(B.fluDeNovo);
    await tocarSonsEmendados(comSons(alvo).sons, 'separado', setLetraAcesa);
    setLetraAcesa(-1);
    setOcupado(false);
  };

  return (
    <div className="mec mec-fluencia" data-testid="fluencia" data-etapa={etapa} data-palavra={etapa === 'lendo' ? alvo : ''} data-figura-certa={etapa === 'lendo' ? certaId : ''}>
      <Balao fala={fala} crianca={crianca} />
      {etapa === 'intro' ? (
        <div className="flu-intro">
          <ol className="flu-previa" aria-label="Palavras da lista">{palavras.map((w) => <li key={w}>{w.toUpperCase()}</li>)}</ol>
          {temReconhecimento() ? (
            <label className="flu-mic"><input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} /><Icone nome="microfone" />Usar o microfone (opcional; escuta só no aparelho)</label>
          ) : null}
          <button className="btn enorme ipe brilha" onClick={() => void comecar()} disabled={ocupado} data-testid="flu-comecar"><Icone nome="play" />Começar</button>
        </div>
      ) : null}
      {etapa === 'lendo' ? (
        <>
          <div className="flu-trilho" aria-label={`Palavra ${i + 1} de ${ordem.length}`}>{ordem.map((_, k) => <i key={k} className={k < i ? 'feita' : k === i ? 'agora' : ''} />)}</div>
          <div className="flu-cartao" key={alvo}>
            <b className="flu-palavra">{[...alvo.toUpperCase()].map((c, k) => <span key={k} className={letraAcesa === k ? 'letra-acesa' : ''}>{c}</span>)}</b>
            {mic ? <span className="flu-ouvindo" aria-label="O microfone está escutando"><Icone nome="microfone" /></span> : null}
          </div>
          <OpcoesTF opcoes={opcoes} correta={certaId} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={escolher} rotulo="Figuras" />
          {acertou ? <Brilho ativo /> : null}
        </>
      ) : null}
    </div>
  );
}
