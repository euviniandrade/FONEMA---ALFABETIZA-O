/**
 * HORA DA HISTÓRIA (docs/pedagogia/04 N12 e N16; 02 COM-OUV-01 e VOC-01): a dupla narra uma história curta, página por
 * página, com ilustração; a criança OUVE (texto real, D030 §3) e responde por figura:
 *  - ANTES: previsão olhando a capa (não tem certo; vale como conversa, sem registro);
 *  - DURANTE: uma pergunta direta logo depois da página que tem a resposta;
 *  - DEPOIS: uma direta e uma de dedução, com a ilustração fora da tela (mede memória e compreensão, não a figura).
 * 1º erro: a dupla relê o trecho da história (o caminho, sem dizer a resposta); 2º erro: a certa brilha (ajuda máxima).
 * VOCABULÁRIO: três palavras, cada uma com explicação de criança, uso numa frase e uma conferência por figura
 * (VT-PE p. 48, 92; ABC p. 230–233; SOA p. 237–240). A figura da palavra só aparece depois da conferência.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALAS, FALAS_HISTORIA as H, type Historia as THistoria, type Opcao, type PerguntaHistoria } from '@fonema/conteudo';
import type { Crianca, Tentativa } from '@fonema/motor';
import { Balao, Brilho } from '../componentes/basicos.tsx';
import { Figura, Icone } from '../componentes/ui.tsx';
import { asset, espera, modoTeste } from '../servicos/ambiente.ts';
import { efeitos } from '../servicos/efeitos.ts';
import { voz } from '../servicos/voz.ts';
import { embaralhar, sementeDaTentativa } from './comum.tsx';
import { OpcoesTF, registro } from './tf-comum.tsx';
import { opcaoFigura, useFala } from './livre-comum.tsx';

type Passo =
  | { tipo: 'capa' }
  | { tipo: 'pagina'; n: number }
  | { tipo: 'pergunta'; p: PerguntaHistoria; k: number }
  | { tipo: 'vocab'; v: number; fase: 'apresenta' | 'pergunta' | 'feito' }
  | { tipo: 'fim' };

export function Historia({ historia, crianca, sessao, onFim }: { historia: THistoria; crianca: Crianca; sessao: string; onFim: (r: { tentativas: Tentativa[]; acertos: number; total: number }) => void }) {
  const semente = useMemo(sementeDaTentativa, []);
  /** Roteiro: capa → previsão → páginas (com a pergunta "durante") → perguntas "depois" → vocabulário → fim. */
  const roteiro = useMemo<Passo[]>(() => {
    const r: Passo[] = [{ tipo: 'capa' }];
    const qs = historia.perguntas.map((p, k) => ({ p, k }));
    for (const q of qs.filter((x) => x.p.momento === 'antes')) r.push({ tipo: 'pergunta', ...q });
    historia.paginas.forEach((_, n) => {
      r.push({ tipo: 'pagina', n });
      for (const q of qs.filter((x) => x.p.momento === 'durante' && x.p.depoisDaPagina === n)) r.push({ tipo: 'pergunta', ...q });
    });
    for (const q of qs.filter((x) => x.p.momento === 'depois')) r.push({ tipo: 'pergunta', ...q });
    historia.vocabulario.forEach((_, v) => r.push({ tipo: 'vocab', v, fase: 'apresenta' }));
    r.push({ tipo: 'fim' });
    return r;
  }, [historia]);
  const [passo, setPasso] = useState(0);
  const [vocabFase, setVocabFase] = useState<'apresenta' | 'pergunta' | 'feito'>('apresenta');
  const atual = roteiro[passo];
  const { fala, diz } = useFala(crianca, historia.abre);
  const [ocupado, setOcupado] = useState(true);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [pista, setPista] = useState<number | null>(null);
  const [virando, setVirando] = useState(false);
  const respostas = useRef<string[]>([]);
  const pos = useRef<number | undefined>(undefined);
  const inicio = useRef(Date.now());
  const tents = useRef<Tentativa[]>([]);
  const vivo = useRef(true);

  const perguntaAtual = atual.tipo === 'pergunta' ? atual.p : atual.tipo === 'vocab' ? historia.vocabulario[atual.v] : null;
  const opcoes: Opcao[] = useMemo(() => (perguntaAtual ? embaralhar(perguntaAtual.opcoes.map(opcaoFigura), semente ? semente + passo * 11 : 0) : []), [perguntaAtual, semente, passo]);

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; voz.parar(); }; }, []);

  const avancar = () => { if (vivo.current) { setVirando(true); setTimeout(() => { setVirando(false); setPasso((x) => Math.min(x + 1, roteiro.length - 1)); }, modoTeste() ? 10 : 380); } };

  useEffect(() => {
    let vale = true;
    setMarcadas([]); setAcertou(false); setPista(null); setOcupado(true); setVocabFase('apresenta');
    respostas.current = []; pos.current = undefined;
    (async () => {
      if (atual.tipo === 'capa') { await diz(historia.abre); await diz(H.ouvir); }
      else if (atual.tipo === 'pagina') await diz(historia.paginas[atual.n].texto);
      else if (atual.tipo === 'pergunta') {
        if (atual.p.momento === 'depois' && roteiro[passo - 1]?.tipo === 'pagina') await diz(H.depois);
        await diz(atual.p.pergunta);
      } else if (atual.tipo === 'vocab') {
        const v = historia.vocabulario[atual.v];
        if (atual.v === 0) await diz(H.vocab);
        await diz(H.palavraNova);
        await voz.falar(v.palavra, { quem: 'tales' });
        await diz(v.explica);
        await diz(v.frase);
        if (!vale) return;
        setVocabFase('pergunta');
        await diz(v.pergunta);
      } else if (atual.tipo === 'fim') await diz(historia.fecha);
      if (vale) { setOcupado(false); inicio.current = Date.now(); }
    })();
    return () => { vale = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  const responder = async (o: Opcao, k: number) => {
    if (!perguntaAtual || acertou || ocupado) return;
    const p = atual.tipo === 'pergunta' ? atual.p : null;
    respostas.current.push(o.id);
    pos.current ??= k;
    // previsão: não tem certo; a história mostra
    if (p?.tipo === 'previsao') {
      efeitos.toque(); setAcertou(true); setOcupado(true);
      await diz(H.previsao);
      avancar();
      return;
    }
    if (o.id === perguntaAtual.correta) {
      setAcertou(true); setOcupado(true); efeitos.acerto();
      tents.current.push(registro({
        habilidade: p ? 'compreensao-ouvida' : 'vocabulario', sessao, cena: `livre-historia-${historia.id}`, mecanica: 'historia', categoria: 'palavra',
        alvo: perguntaAtual.correta!, respostas: [...respostas.current], distratores: perguntaAtual.opcoes.filter((x) => x !== perguntaAtual.correta),
        inicio: inicio.current, posicaoCerta: opcoes.findIndex((x) => x.id === perguntaAtual.correta), posicaoEscolhida: pos.current, nOpcoes: opcoes.length
      }));
      await diz(FALAS.acertos[passo % FALAS.acertos.length]);
      if (atual.tipo === 'vocab') { setVocabFase('feito'); await diz(historia.vocabulario[atual.v].frase); }
      await espera(modoTeste() ? 20 : 400);
      avancar();
      return;
    }
    efeitos.suave();
    setMarcadas((m) => [...m, o.id]);
    setOcupado(true);
    if (respostas.current.length === 1) {
      if (p?.pista !== undefined) { setPista(p.pista); await diz(H.pista); await diz(historia.paginas[p.pista].texto); setPista(null); }
      else if (atual.tipo === 'vocab') await diz(historia.vocabulario[atual.v].explica);
      await diz(perguntaAtual.pergunta);
    } else await diz(FALAS.erro2);
    setOcupado(false);
  };

  const terminar = () => onFim({ tentativas: tents.current, acertos: tents.current.filter((t) => t.acertou && !t.comAjuda).length, total: tents.current.length });
  const paginaVista = atual.tipo === 'pagina' ? atual.n : -1;
  const totalPaginas = historia.paginas.length;

  return (
    <div className="mec mec-historia" data-testid="historia" data-passo={atual.tipo} data-pagina={paginaVista}>
      <Balao fala={fala} crianca={crianca} />
      {atual.tipo === 'capa' || atual.tipo === 'pagina' ? (
        <div className={`livro ${virando ? 'virando' : ''}`}>
          <div className="livro-pagina">
            <img className="livro-ilustra" src={asset(`${atual.tipo === 'capa' ? historia.capa : historia.paginas[atual.n].imagem}.webp`)} alt="" draggable={false} />
            {atual.tipo === 'capa' ? <h2 className="livro-titulo t">{historia.titulo}</h2> : <p className="livro-texto">{historia.paginas[atual.n].texto.texto}</p>}
          </div>
          <div className="livro-rodape">
            <span className="livro-contador" aria-label="Página">{atual.tipo === 'pagina' ? `${atual.n + 1} / ${totalPaginas}` : 'Capa'}</span>
            <button className="btn" onClick={() => { efeitos.toque(); void diz(atual.tipo === 'capa' ? historia.abre : historia.paginas[atual.n].texto); }} disabled={ocupado}><Icone nome="repetir" />Ouvir de novo</button>
            <button className="btn grande ipe" onClick={avancar} disabled={ocupado} data-testid="historia-virar"><Icone nome="seta" />{atual.tipo === 'capa' ? 'Abrir o livro' : 'Virar a página'}</button>
          </div>
        </div>
      ) : null}

      {atual.tipo === 'pergunta' || (atual.tipo === 'vocab' && vocabFase !== 'apresenta') ? (
        <div className="historia-pergunta">
          {atual.tipo === 'pergunta' ? <span className={`etiqueta ${atual.p.tipo === 'inferencia' ? 'verde' : ''}`}>{atual.p.momento === 'antes' ? 'Antes da história' : atual.p.momento === 'durante' ? 'No meio da história' : atual.p.tipo === 'inferencia' ? 'Pense bem' : 'Depois da história'}</span> : <span className="etiqueta">Palavra nova</span>}
          {pista !== null ? <img className="historia-pista" src={asset(`${historia.paginas[pista].imagem}.webp`)} alt="" /> : null}
          {atual.tipo === 'vocab' && vocabFase === 'feito' ? <div className="vocab-revela"><Figura palavra={historia.vocabulario[atual.v].figura} /></div> : null}
          <OpcoesTF opcoes={opcoes} correta={perguntaAtual?.correta ?? '__previsao'} marcadas={marcadas} acertou={acertou} ocupado={ocupado} mostrarCerta={marcadas.length >= 2} onEscolher={responder} rotulo="Respostas" />
        </div>
      ) : null}

      {atual.tipo === 'vocab' && vocabFase === 'apresenta' ? (
        <div className="vocab-cartao" data-palavra={historia.vocabulario[atual.v].palavra}>
          <span className="etiqueta">Palavra nova · {atual.v + 1} de 3</span>
          <b className="vocab-palavra t">{historia.vocabulario[atual.v].palavra}</b>
          <p className="vocab-explica">{historia.vocabulario[atual.v].explica.texto}</p>
          <p className="vocab-frase">“{historia.vocabulario[atual.v].frase.texto}”</p>
        </div>
      ) : null}

      {atual.tipo === 'fim' ? (
        <div className="historia-fim">
          <img className="livro-capinha" src={asset(`${historia.capa}.webp`)} alt="" />
          <div>
            <h2 className="t">Fim!</h2>
            <ul className="vocab-lista">{historia.vocabulario.map((v) => <li key={v.palavra}><Figura palavra={v.figura} /><b>{v.palavra}</b></li>)}</ul>
            <button className="btn enorme ipe brilha" onClick={terminar} disabled={ocupado} data-testid="historia-fim"><Icone nome="check" />Terminar</button>
          </div>
          <Brilho ativo />
        </div>
      ) : null}
    </div>
  );
}
