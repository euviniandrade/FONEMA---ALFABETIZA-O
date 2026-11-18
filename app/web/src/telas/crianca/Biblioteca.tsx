/**
 * CANTINHO DA LEITURA (#/c/:id/leitura[/:sub]) — D030 etapa 8, camadas F, G e H de docs/pedagogia/00 §3:
 *  - Hora da história (texto real OUVIDO, perguntas e vocabulário) — aberta desde o começo, antes de saber ler;
 *  - Ler sozinho: um texto decodificável no fim de cada bloco da Trilha dos Sons (abre com o bloco);
 *  - Ler mais ligeiro: releitura cronometrada, só com precisão de leitura ≥ 95% (ABC p. 375–376);
 *  - Ler em eco e em coro: frases já estudadas, lidas com a Sofia;
 *  - Escrever do meu jeito: escrita própria com confronto (abre depois do M).
 * Nada aqui trava a trilha nem dá moedinhas. Respostas conferidas vão para o motor (`registrarLivre`); o resto, só para
 * o resumo do adulto (`Progresso.biblioteca`).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BANCO, FALAS_BIBLIOTECA as B, HISTORIAS, HISTORIA_POR_ID, TEXTOS_DECODIFICAVEIS, TEXTO_POR_ID, nomeDaFigura } from '@fonema/conteudo';
import {
  anotarBiblioteca, catalogoDeExtras, dadosBiblioteca, estadoDosCampos, frasesEstudadas, estadoFluencia, palavrasParaEscrever, registrarLivre, resumoFluencia, textoLiberado, type DadosBiblioteca,
  type Tentativa
} from '@fonema/motor';
import { Falta, SeloNovo, ehNovo, marcarVistoAqui, useMissoesAteAbrir } from '../../componentes/Desbloqueio.tsx';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { CaminhoFluencia } from '../../componentes/GraficoFluencia.tsx';
import { novoId } from '../../dados/repositorio.ts';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { falar } from '../../util.ts';
import { Historia } from '../../mecanicas/Historia.tsx';
import { TextoLeitura } from '../../mecanicas/TextoLeitura.tsx';
import { Fluencia } from '../../mecanicas/Fluencia.tsx';
import { EcoCoro } from '../../mecanicas/EcoCoro.tsx';
import { EscritaPropria } from '../../mecanicas/EscritaPropria.tsx';
import { TelaFichas } from './Fichas.tsx';
import '../../estilos-biblioteca.css';

/** Salva o que a criança fez numa atividade livre (respostas conferidas → motor; resumo → adulto). */
export function useRegistroLivre(criancaId: string) {
  const { repo, config } = useApp();
  const { progresso, salvarProgresso } = useCrianca(criancaId);
  const sessao = useRef(novoId('livre'));
  return {
    sessao: sessao.current,
    salvar: async (cena: { id: string; titulo: string }, tentativas: Tentativa[], resumo: (d: DadosBiblioteca) => DadosBiblioteca) => {
      if (!progresso) return;
      const agora = Date.now();
      if (!tentativas.length) { await salvarProgresso(anotarBiblioteca(progresso, resumo)); return; }
      const demonstracoes = await repo.listarDemonstracoes(criancaId);
      const r = registrarLivre(progresso, { sessao: sessao.current, cena, tentativas, cfg: config, agora, demonstracoes }, resumo);
      await salvarProgresso(r.progresso);
      const acertos = tentativas.filter((t) => t.acertou && !t.comAjuda).length;
      await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'atividade', cena: cena.id, habilidade: tentativas[0].habilidade, texto: cena.titulo, acertos, total: tentativas.length });
    }
  };
}

export function Biblioteca({ criancaId, sub }: { criancaId: string; sub?: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const reg = useRegistroLivre(criancaId);
  const [feito, setFeito] = useState<{ titulo: string; texto: string; extra?: ReactNode } | null>(null);
  const [rodada, setRodada] = useState(0);
  useEffect(() => { setFeito(null); }, [sub]);
  useEffect(() => () => voz.parar(), []);
  useEffect(() => { if (crianca && !sub) void falar(B.cantinho, crianca); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca?.id, sub]);
  const escrever = useMemo(() => (progresso ? palavrasParaEscrever(progresso, BANCO) : []), [progresso]);
  const escolhidas = useMemo(() => (progresso ? [...frasesEstudadas(progresso)].sort(() => Math.random() - 0.5).slice(0, 3) : []), [sub, rodada, !!progresso]); // eslint-disable-line react-hooks/exhaustive-deps
  const palavraEscrita = useMemo(() => (escrever.length ? escrever[Math.floor(Math.random() * escrever.length)] : null), [escrever, rodada]); // eslint-disable-line react-hooks/exhaustive-deps
  // D033: fichas de leitura por campo semântico (tela própria: Fichas.tsx)
  if (sub && /^fichas?(\.|$)/.test(sub)) return <TelaFichas criancaId={criancaId} sub={sub} />;
  if (!crianca || !progresso) return <Carregando />;

  const voltar = `c/${criancaId}/leitura`;
  const d = dadosBiblioteca(progresso);
  const flu = estadoFluencia(progresso, BANCO);
  const frases = frasesEstudadas(progresso);
  const fim = (titulo: string, texto: string, extra?: ReactNode) => setFeito({ titulo, texto, extra });

  let corpo: ReactNode;
  if (feito) {
    corpo = (
      <section className="cartao biblio-feito" data-testid="biblio-feito">
        <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
        <h1 className="t">{feito.titulo}</h1>
        <p>{feito.texto}</p>
        {feito.extra}
        <div className="linha-botoes centro">
          <button className="btn grande" onClick={() => { setFeito(null); setRodada((r) => r + 1); }}><Icone nome="repetir" />De novo</button>
          <button className="btn grande ipe" onClick={() => navegar(voltar)} data-testid="biblio-voltar"><Icone nome="seta-esq" />Cantinho da Leitura</button>
        </div>
      </section>
    );
  } else if (sub?.startsWith('historia-') && HISTORIA_POR_ID[sub.slice(9)]) {
    const h = HISTORIA_POR_ID[sub.slice(9)];
    corpo = (
      <section className="cartao atividade biblio-atividade" key={rodada}>
        <h2 className="titulo-cena t"><Icone nome="caderno" />Hora da história</h2>
        <Historia historia={h} crianca={crianca} sessao={reg.sessao} onFim={async (r) => {
          await reg.salvar({ id: `livre-historia-${h.id}`, titulo: h.titulo }, r.tentativas, (x) => ({ ...x, historias: [...x.historias, { id: h.id, em: Date.now(), acertos: r.acertos, total: r.total }] }));
          fim('História ouvida!', `Você ouviu "${h.titulo}" e aprendeu 3 palavras novas.`);
        }} />
      </section>
    );
  } else if (sub?.startsWith('texto-') && TEXTO_POR_ID[sub.slice(6)] && textoLiberado(progresso, TEXTO_POR_ID[sub.slice(6)])) {
    const t = TEXTO_POR_ID[sub.slice(6)];
    corpo = (
      <section className="cartao atividade biblio-atividade" key={rodada}>
        <h2 className="titulo-cena t"><Icone nome="olho" />Ler sozinho</h2>
        <TextoLeitura texto={t} crianca={crianca} sessao={reg.sessao} onFim={async (r) => {
          await reg.salvar({ id: `livre-texto-${t.id}`, titulo: t.titulo }, r.tentativas, (x) => ({
            ...x, textos: [...x.textos, { id: t.id, em: Date.now(), acertos: r.acertos, total: r.total, ouviuSons: r.ouviuSons }],
            eco: r.coro ? [...x.eco, { em: Date.now(), modo: 'coro', frases: t.linhas.length }] : x.eco
          }));
          fim('Texto lido!', `Você leu "${t.titulo}" sozinho.`);
        }} />
      </section>
    );
  } else if (sub === 'fluencia' && flu.liberada) {
    corpo = (
      <section className="cartao atividade biblio-atividade" key={rodada}>
        <h2 className="titulo-cena t"><Icone nome="raio" />Ler mais ligeiro</h2>
        <Fluencia palavras={flu.palavras} crianca={crianca} sessao={reg.sessao} onFim={async (r) => {
          const reg1 = resumoFluencia(flu.lista, flu.palavras, r.itens, Date.now(), r.microfone);
          const antes = d.fluencia;
          await reg.salvar({ id: 'livre-fluencia', titulo: 'Ler mais ligeiro' }, r.tentativas, (x) => ({ ...x, fluencia: [...x.fluencia, reg1] }));
          const ant = [...antes].reverse().find((x) => x.lista === reg1.lista);
          const melhorou = !!ant && reg1.ppm > ant.ppm && reg1.precisao >= ant.precisao;
          if (melhorou) void falar(B.fluMelhorou, crianca);
          fim('Lista lida!', melhorou ? 'Você leu mais ligeiro que da outra vez!' : `Você leu ${reg1.certas} de ${reg1.total} palavras de primeira.`,
            <CaminhoFluencia leituras={[...antes, reg1]} destaque />);
        }} />
      </section>
    );
  } else if ((sub === 'eco' || sub === 'coro') && frases.length) {
    corpo = (
      <section className="cartao atividade biblio-atividade" key={`${sub}-${rodada}`}>
        <h2 className="titulo-cena t"><Icone nome="som" />{sub === 'eco' ? 'Ler em eco' : 'Ler em coro'}</h2>
        <EcoCoro frases={escolhidas} modo={sub} crianca={crianca} onFim={async (r) => {
          await reg.salvar({ id: `livre-${sub}`, titulo: sub }, [], (x) => ({ ...x, eco: [...x.eco, { em: Date.now(), modo: sub, frases: r.frases }] }));
          fim('Leitura bonita!', sub === 'eco' ? 'Você leu do jeito da Sofia.' : 'Você leu junto com a Sofia.');
        }} />
      </section>
    );
  } else if (sub === 'escrita' && palavraEscrita) {
    corpo = (
      <section className="cartao atividade biblio-atividade" key={`${palavraEscrita}-${rodada}`}>
        <h2 className="titulo-cena t"><Icone nome="caderno" />Escrever do meu jeito</h2>
        <EscritaPropria palavra={palavraEscrita} figura={BANCO[palavraEscrita].figura!} crianca={crianca} onFim={async (r) => {
          await reg.salvar({ id: 'livre-escrita', titulo: 'Escrever do meu jeito' }, [], (x) => ({ ...x, escritas: [...x.escritas, ...r.escritas.map((e) => ({ em: Date.now(), palavra: palavraEscrita, ...e }))] }));
          fim('Que escrita caprichada!', `Você escreveu ${nomeDaFigura(BANCO[palavraEscrita].figura!)} do seu jeito.`);
        }} />
      </section>
    );
  } else {
    corpo = <Menu criancaId={criancaId} d={d} flu={flu} frases={frases.length} escrever={escrever.length > 0} progresso={progresso} />;
  }

  return (
    <div className="tela-biblio" data-testid="biblioteca" data-sub={sub ?? ''}>
      <Fundo cena="biblioteca" desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={sub ? voltar : `c/${criancaId}/vila`} titulo="Cantinho da Leitura" />
      <main className="palco">{corpo}</main>
    </div>
  );
}

function Menu({ criancaId, d, flu, frases, escrever, progresso }: {
  criancaId: string; d: DadosBiblioteca; flu: ReturnType<typeof estadoFluencia>; frases: number; escrever: boolean; progresso: Parameters<typeof textoLiberado>[0];
}) {
  const { crianca } = useCrianca(criancaId);
  /** D034: tocar tira o "Novo!" (id do catálogo de desbloqueio) e vai. */
  const ir = (s: string, id?: string) => { if (id) marcarVistoAqui(criancaId, id); navegar(`c/${criancaId}/leitura/${s}`); };
  const missoes = useMissoesAteAbrir(progresso);
  const fluExtra = catalogoDeExtras(progresso).find((x) => x.id === 'leitura:fluencia');
  const novo = (id: string) => ehNovo(progresso, criancaId, id);
  let k = 0;
  const estilo = () => ({ ['--k' as string]: k++ } as CSSProperties);
  return (
    <section className="cartao biblio-cartao">
      <header className="biblio-cab">
        <img className="biblio-dupla" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales" />
        <div>
          <h1 className="t">Cantinho da Leitura</h1>
          {crianca ? <Balao fala={B.cantinho} crianca={crianca} /> : null}
        </div>
      </header>

      <h2 className="biblio-secao t"><Icone nome="caderno" />Hora da história <small>para ouvir</small></h2>
      <div className="biblio-grade historias">
        {HISTORIAS.map((h) => {
          const vezes = d.historias.filter((x) => x.id === h.id).length;
          return (
            <button key={h.id} className="biblio-livro" style={estilo()} onClick={() => ir(`historia-${h.id}`)} data-testid={`historia-${h.id}`}>
              <img src={asset(`${h.capa}.webp`)} alt="" />
              <span className="biblio-livro-titulo">{h.titulo}</span>
              {vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
            </button>
          );
        })}
      </div>

      <h2 className="biblio-secao t"><Icone nome="olho" />Ler sozinho <small>um texto no fim de cada bloco da Trilha dos Sons</small></h2>
      <div className="biblio-grade textos">
        {TEXTOS_DECODIFICAVEIS.map((t) => {
          const aberto = textoLiberado(progresso, t);
          const lido = d.textos.some((x) => x.id === t.id);
          return (
            <button key={t.id} className={`biblio-texto ${aberto ? '' : 'trancado'}`} style={estilo()} disabled={!aberto} onClick={() => ir(`texto-${t.id}`, `leitura:texto:${t.id}`)} data-testid={`texto-${t.id}`}>
              <span className="biblio-bloco">Bloco {t.bloco}</span>
              <b className="biblio-texto-titulo">{t.titulo}</b>
              <span className="biblio-texto-linhas" aria-hidden="true">{t.linhas.slice(0, 2).map((l) => l.texto).join(' ')}…</span>
              {aberto ? (novo(`leitura:texto:${t.id}`) && !lido ? <SeloNovo /> : lido ? <span className="biblio-selo"><Icone nome="check" />lido</span> : null) : <span className="biblio-cadeado"><Falta texto={`Abre no fim do bloco ${t.bloco}`} n={missoes[`leitura:texto:${t.id}`]} compacto /></span>}
            </button>
          );
        })}
      </div>

      {/* D033: fichas de leitura por campo semântico (só as palavras que a criança já lê; o resto trancado) */}
      <h2 className="biblio-secao t"><Icone nome="boca" />Fichas de leitura <small>palavras por tema, com a boquinha em cada letra</small></h2>
      <div className="biblio-grade praticas">
        {(() => {
          const cs = estadoDosCampos(progresso);
          const n = cs.reduce((s, c) => s + c.legiveis.length, 0);
          return (
            <button className={`biblio-pratica fichas ${n ? '' : 'trancado'}`} style={estilo()} disabled={!n} onClick={() => ir('fichas', 'leitura:fichas')} data-testid="ir-fichas">
              <span className="biblio-pratica-icone"><Icone nome="boca" /></span>
              <b>Fichas de leitura</b>{n ? <small>{`${n} palavras para ler em ${cs.filter((c) => c.legiveis.length).length} temas`}</small> : <Falta texto="Abre quando você aprender os sons de uma palavra" n={missoes['leitura:fichas']} compacto />}
              {n && novo('leitura:fichas') ? <SeloNovo /> : null}
            </button>
          );
        })()}
      </div>

      <h2 className="biblio-secao t"><Icone nome="raio" />Praticar a leitura</h2>
      <div className="biblio-grade praticas">
        <button className={`biblio-pratica flu ${flu.liberada ? '' : 'trancado'}`} style={estilo()} disabled={!flu.liberada} onClick={() => ir('fluencia')} data-testid="ir-fluencia">
          <span className="biblio-pratica-icone"><Icone nome="raio" /></span>
          <b>Ler mais ligeiro</b>
          {flu.liberada ? <small>{`Lista ${flu.lista + 1} · ${flu.palavras.length} palavras que você já leu`}</small> : <Falta texto={fluExtra?.falta} barra={fluExtra?.barra} compacto />}
          {d.fluencia.length ? <CaminhoFluencia leituras={d.fluencia} /> : null}
        </button>
        <button className={`biblio-pratica eco ${frases ? '' : 'trancado'}`} style={estilo()} disabled={!frases} onClick={() => ir('eco', 'leitura:eco')} data-testid="ir-eco">
          <span className="biblio-pratica-icone"><Icone nome="som" /></span>
          <b>Ler em eco</b>{frases ? <small>A Sofia lê, depois você lê igual</small> : <Falta texto="Abre com a primeira frase da trilha" n={missoes['leitura:eco']} compacto />}{frases && novo('leitura:eco') ? <SeloNovo /> : null}
        </button>
        <button className={`biblio-pratica coro ${frases ? '' : 'trancado'}`} style={estilo()} disabled={!frases} onClick={() => ir('coro', 'leitura:coro')} data-testid="ir-coro">
          <span className="biblio-pratica-icone"><Icone nome="nota" /></span>
          <b>Ler em coro</b>{frases ? <small>Você e a Sofia leem juntos</small> : <Falta texto="Abre com a primeira frase da trilha" n={missoes['leitura:coro']} compacto />}{frases && novo('leitura:coro') ? <SeloNovo /> : null}
        </button>
        <button className={`biblio-pratica esc ${escrever ? '' : 'trancado'}`} style={estilo()} disabled={!escrever} onClick={() => ir('escrita', 'leitura:escrita')} data-testid="ir-escrita">
          <span className="biblio-pratica-icone"><Icone nome="caderno" /></span>
          <b>Escrever do meu jeito</b>{escrever ? <small>Escreva e compare com a Sofia</small> : <Falta texto="Abre depois do som do M" n={missoes['leitura:escrita']} compacto />}{escrever && novo('leitura:escrita') ? <SeloNovo /> : null}
        </button>
      </div>
    </section>
  );
}
