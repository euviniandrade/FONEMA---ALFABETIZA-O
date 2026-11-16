/**
 * TEXTO DECODIFICÁVEL PARA LER SOZINHO (docs/pedagogia/02 DEC-TXT-01 e COMP-LEI-01; 04 N11, N12; 05 §3).
 *  1. A criança lê o texto sozinha. Tocar numa palavra toca os SONS dela, um a um (ensina o caminho; não diz a palavra).
 *  2. Perguntas com o texto À VISTA (medem leitura, 04 N12 [DP]): diretas e de dedução, por figura ou por palavra escrita.
 *     1º erro: "leia de novo, da esquerda para a direita" (ABC p. 329); 2º: a certa brilha (ajuda máxima).
 *  3. Leitura em CORO: a Sofia lê o texto inteiro, palavra por palavra acesa, e a criança lê junto (ABC p. 375–376;
 *     SOA p. 246–248). É prática: autorrelato, fica só no resumo, não vale nota.
 * Registro: cada pergunta = `compreensao-lida`; o texto = `leitura-texto`, certo quando todas as perguntas diretas saíram
 * certas de primeira.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_TEXTO as X, textoCorrido, type Opcao, type TextoDecodificavel } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';
import { Balao, Brilho, Rosto } from '../componentes/basicos.tsx';
import { Icone } from '../componentes/ui.tsx';
import { espera, modoTeste } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { embaralhar, sementeDaTentativa } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';
import { OpcoesPalavra, TextoTocavel, opcaoFigura, useFala } from './livre-comum.tsx';
import { pararSons } from './sons-emendados.ts';

type Etapa = 'ler' | 'perguntas' | 'coro' | 'feito';

export function TextoLeitura({ texto, crianca, sessao, onFim }: {
  texto: TextoDecodificavel; crianca: Crianca; sessao: string; onFim: (r: { tentativas: Tentativa[]; acertos: number; total: number; ouviuSons: number; coro: boolean }) => void;
}) {
  const semente = useMemo(sementeDaTentativa, []);
  const [etapa, setEtapa] = useState<Etapa>('ler');
  const [q, setQ] = useState(0);
  const pergunta = texto.perguntas[q];
  const opcoes: Opcao[] = useMemo(() => embaralhar(pergunta.opcoes.map(opcaoFigura), semente ? semente + q * 7 : 0), [pergunta, semente, q]);
  const { fala, diz } = useFala(crianca, X.abre);
  const [ocupado, setOcupado] = useState(true);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [acesa, setAcesa] = useState(-1);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const ouviuSons = useRef(0);
  const inicio = useRef(Date.now());
  const tents = useRef<Tentativa[]>([]);
  const vivo = useRef(true);
  const palavras = useMemo(() => textoCorrido(texto).split(/\s+/), [texto]);

  useEffect(() => {
    vivo.current = true;
    (async () => { await diz(X.abre); setOcupado(false); inicio.current = Date.now(); })();
    return () => { vivo.current = false; pararSons(); voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jaLi = async () => {
    setEtapa('perguntas'); setOcupado(true);
    await diz(X.jaLeu);
    await diz(texto.perguntas[0].pergunta);
    setOcupado(false); inicio.current = Date.now();
  };

  const responder = async (id: string, k: number) => {
    if (acertou || ocupado) return;
    respostas.current.push(id);
    pos.current ??= k;
    if (id === pergunta.correta) {
      setAcertou(true); setOcupado(true); efeitos.acerto();
      tents.current.push(registro({
        habilidade: 'compreensao-lida', sessao, cena: `livre-texto-${texto.id}`, mecanica: 'texto', alvo: pergunta.correta, respostas: [...respostas.current],
        distratores: pergunta.opcoes.filter((x) => x !== pergunta.correta), inicio: inicio.current, posicaoCerta: pergunta.opcoes.indexOf(pergunta.correta),
        posicaoEscolhida: pos.current, nOpcoes: pergunta.opcoes.length, categoria: 'palavra'
      }));
      await diz(FALAS.acertos[q % FALAS.acertos.length]);
      await espera(modoTeste() ? 20 : 300);
      if (!vivo.current) return;
      if (q + 1 < texto.perguntas.length) {
        setQ(q + 1); setAcertou(false); setMarcadas([]); respostas.current = []; pos.current = undefined;
        await diz(texto.perguntas[q + 1].pergunta);
        setOcupado(false); inicio.current = Date.now();
      } else await coro();
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, id]);
    setOcupado(true);
    if (respostas.current.length === 1) { await diz(X.pista); await diz(pergunta.pergunta); } else await diz(FALAS.erro2);
    setOcupado(false);
  };

  /** Leitura em coro: a Sofia lê, cada palavra acende no ritmo; a criança lê junto. */
  const coro = async () => {
    setEtapa('coro'); setOcupado(true);
    await diz(X.coro);
    const lendo = voz.falar(textoCorrido(texto), { quem: 'sofia' });
    for (let k = 0; k < palavras.length && vivo.current; k++) { setAcesa(k); await espera(modoTeste() ? 5 : 330 + palavras[k].length * 80); }
    await lendo;
    setAcesa(-1);
    setOcupado(false);
  };

  const terminar = async (comCoro: boolean) => {
    setOcupado(true); setEtapa('feito'); efeitos.acerto();
    const diretas = tents.current.filter((_, k) => texto.perguntas[k]?.tipo === 'literal');
    const leuBem = diretas.length > 0 && diretas.every((t) => t.acertou && !t.comAjuda);
    tents.current.push({
      ...registro({ habilidade: 'leitura-texto', sessao, cena: `livre-texto-${texto.id}`, mecanica: 'texto', alvo: texto.id.toUpperCase(), respostas: [texto.id.toUpperCase()], distratores: [], inicio: inicio.current, categoria: 'outro', ouviuDeNovo: ouviuSons.current }),
      acertou: leuBem, comAjuda: !leuBem
    });
    if (comCoro) await diz(X.coroFim);
    onFim({ tentativas: tents.current, acertos: tents.current.filter((t) => t.acertou && !t.comAjuda && t.habilidade === 'compreensao-lida').length, total: texto.perguntas.length, ouviuSons: ouviuSons.current, coro: comCoro });
  };

  let inicioLinha = 0;
  return (
    <div className="mec mec-texto" data-testid="texto-leitura" data-etapa={etapa} data-pergunta={q}>
      <Balao fala={fala} crianca={crianca} />
      <article className={`texto-livro ${etapa === 'coro' ? 'coro' : ''}`} aria-label={texto.titulo}>
        <h2 className="texto-titulo t"><TextoTocavel texto={texto.titulo} desligado={ocupado || etapa !== 'ler'} aoTocar={() => { ouviuSons.current++; }} /></h2>
        {texto.linhas.map((l, n) => {
          const comeco = inicioLinha;
          inicioLinha += l.texto.split(/\s+/).length;
          return (
            <p key={n} className={`texto-linha ${l.quem ? 'com-balao' : ''}`}>
              {l.quem ? <span className="texto-quem"><Rosto quem={l.quem} tamanho={52} /></span> : null}
              <TextoTocavel texto={l.texto} inicio={comeco} acesa={acesa} desligado={ocupado || etapa === 'coro' || etapa === 'feito'} aoTocar={() => { ouviuSons.current++; }} />
            </p>
          );
        })}
        {etapa === 'ler' ? <p className="frase-dica"><Icone nome="dica" />Toque numa palavra para ouvir os sons dela.</p> : null}
        {etapa === 'feito' ? <Brilho ativo /> : null}
      </article>
      {etapa === 'ler' ? <div className="linha-botoes centro"><button className="btn grande verde" onClick={jaLi} disabled={ocupado} data-testid="texto-li"><Icone nome="check" />Já li o texto</button></div> : null}
      {etapa === 'perguntas' ? (
        <div className="texto-perguntas">
          <span className={`etiqueta ${pergunta.tipo === 'inferencia' ? 'verde' : ''}`}>{pergunta.tipo === 'inferencia' ? 'Pense bem' : `Pergunta ${q + 1}`}</span>
          <p className="texto-pergunta">{pergunta.pergunta.texto}</p>
          {pergunta.escritas
            ? <OpcoesPalavra opcoes={embaralhar(pergunta.opcoes, semente ? semente + q : 0)} correta={pergunta.correta} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={(o, k) => void responder(o, k)} />
            : <OpcoesTF opcoes={opcoes} correta={pergunta.correta} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={(o, k) => void responder(o.id, k)} rotulo="Respostas" />}
        </div>
      ) : null}
      {etapa === 'coro' ? (
        <div className="linha-botoes centro">
          <button className="btn" onClick={() => void coro()} disabled={ocupado}><Icone nome="repetir" />Ler junto de novo</button>
          <button className="btn grande verde" onClick={() => void terminar(true)} disabled={ocupado} data-testid="texto-coro-li"><Icone nome="check" />Li junto!</button>
        </div>
      ) : null}
    </div>
  );
}
