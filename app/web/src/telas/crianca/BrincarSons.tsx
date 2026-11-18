/**
 * BRINCAR COM SONS (#/c/:id/brincar[/:jogo]): jogos de escuta curtos e rejogáveis, abertos o tempo todo e sem travar a
 * trilha (docs/pedagogia/01 §3; D030 §3). Palavra comprida, palavra escondida, rimas, quem não rima, mesmo começo e
 * palmas. Sem moedinhas; respostas conferidas vão para o motor no contexto "livre".
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { FALAS_BIBLIOTECA as B, JOGOS_ESCUTA, JOGO_ESCUTA_POR_ID, RECURSOS, type AtividadePalmas } from '@fonema/conteudo';
import { dadosBiblioteca, memoriaAberta, variacoesDoJogo } from '@fonema/motor';
import { useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { falar } from '../../util.ts';
import { JogoEscuta } from '../../mecanicas/JogoEscuta.tsx';
import { Palmas } from '../../mecanicas/Palmas.tsx';
import { embaralhar, sementeDaTentativa } from '../../mecanicas/comum.tsx';
import { useRegistroLivre } from './Biblioteca.tsx';
import { JOGOS_DA_VILA, rotaDoJogoDaVila, situacaoDosJogosDaVila } from './jogos-vila-cartoes.ts';
import { Capa, JOGOS_FONICOS, JOGO_FONICO_POR_ID, TelaJogoFonico } from '../../mecanicas/jogos/JogoFonico.tsx';
import { CapaMemoria } from './MemoriaDosSons.tsx';
import { Falta, SeloNovo, ehNovo, marcarVistoAqui, useMissoesAteAbrir } from '../../componentes/Desbloqueio.tsx';
import '../../estilos-biblioteca.css';

/** Figura da capa de cada jogo. */
const CAPA: Record<string, string[]> = { comprida: ['sol', 'formiga'], escondida: ['sapato', 'pato'], rimas: ['pato', 'rato'], intruso: ['mao', 'pao', 'vela'], comeco: ['sapo', 'sapato'], palmas: ['abacaxi'] };

export function BrincarSons({ criancaId, jogoId }: { criancaId: string; jogoId?: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const reg = useRegistroLivre(criancaId);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<{ acertos: number; total: number } | null>(null);
  const jogo = jogoId ? JOGO_ESCUTA_POR_ID[jogoId] : undefined;
  const palavrasPalmas = useMemo(() => (jogo?.palavras ? embaralhar(jogo.palavras, sementeDaTentativa()).slice(0, jogo.porRodada) : []), [jogo, rodada]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setFim(null); }, [jogoId]);
  useEffect(() => { if (crianca && !jogoId) void falar(B.brincar, crianca); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca?.id, jogoId]);
  useEffect(() => () => voz.parar(), []);
  // D034: quantas missões faltam para cada jogo fechado (o "o que falta" de cada cartão)
  const missoes = useMissoesAteAbrir(progresso);
  if (!crianca || !progresso) return <Carregando />;
  /** Toca no cartão: tira o "Novo!" e vai para o jogo. */
  const abrir = (id: string, rota: string) => { marcarVistoAqui(criancaId, id); navegar(rota); };
  const novo = (id: string) => ehNovo(progresso, criancaId, id);
  const d = dadosBiblioteca(progresso);
  const vila = situacaoDosJogosDaVila(progresso);
  // D032 §4: jogos fônicos (Corre-Som e Bichinho Come-Som), com os sons já ensinados
  const jogoFonico = jogoId ? JOGO_FONICO_POR_ID[jogoId] : undefined;
  if (jogoFonico) {
    return (
      <div className="tela-brincar" data-testid="brincar" data-jogo={jogoId}>
        <Fundo cena="quintal" desfoque={12} tom="claro" />
        <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/brincar`} titulo="Brincar com sons" />
        <main className="palco">
          <TelaJogoFonico jogo={jogoFonico} crianca={crianca} progresso={progresso} sessao={reg.sessao} onVoltar={() => navegar(`c/${criancaId}/brincar`)}
            onSalvar={(v, r) => reg.salvar({ id: `livre-${jogoFonico.id}`, titulo: `${jogoFonico.nome} (${jogoFonico.variacoes.find((x) => x.id === v)?.nome ?? v})` }, r.tentativas,
              (x) => ({ ...x, jogos: [...x.jogos, { id: jogoFonico.id, em: Date.now(), acertos: r.tentativas.filter((t) => t.acertou && !t.comAjuda).length, total: r.tentativas.length }] }))} />
        </main>
      </div>
    );
  }

  const terminar = async (tentativas: Parameters<typeof reg.salvar>[1], acertos: number) => {
    if (!jogo) return;
    await reg.salvar({ id: `livre-${jogo.id}`, titulo: jogo.nome }, tentativas, (x) => ({ ...x, jogos: [...x.jogos, { id: jogo.id, em: Date.now(), acertos, total: tentativas.length }] }));
    setFim({ acertos, total: tentativas.length });
  };

  return (
    <div className="tela-brincar" data-testid="brincar" data-jogo={jogoId ?? ''}>
      <Fundo cena="quintal" desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={jogo ? `c/${criancaId}/brincar` : `c/${criancaId}/vila`} titulo="Brincar com sons" />
      <main className="palco">
        {jogo && fim ? (
          <section className="cartao biblio-feito" data-testid="brincar-fim">
            <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
            <h1 className="t">Jogo feito!</h1>
            <p>{fim.total ? `Você acertou ${fim.acertos} de ${fim.total} de primeira.` : 'Que palmas caprichadas!'}</p>
            <div className="linha-botoes centro">
              <button className="btn grande" onClick={() => { setFim(null); setRodada((r) => r + 1); }} data-testid="brincar-de-novo"><Icone nome="repetir" />Jogar de novo</button>
              <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/brincar`)} data-testid="brincar-voltar"><Icone nome="seta-esq" />Outros jogos</button>
            </div>
          </section>
        ) : jogo ? (
          <section className="cartao atividade brincar-jogo" key={rodada}>
            <h2 className="titulo-cena t"><Icone nome={jogo.icone} />{jogo.nome}</h2>
            {jogo.modo === 'palmas' ? (
              <Palmas atividade={{ tipo: 'palmas', habilidade: jogo.habilidade, enunciado: jogo.enunciado, palavras: palavrasPalmas } as AtividadePalmas} crianca={crianca} sessao={reg.sessao} cenaId={`livre-${jogo.id}`}
                onFim={(r) => void terminar(r.tentativas.map((t) => ({ ...t, mecanica: 'palmas' as const })), r.tentativas.filter((t) => t.acertou && !t.comAjuda).length)} />
            ) : (
              <JogoEscuta jogo={jogo} crianca={crianca} sessao={reg.sessao} onFim={(r) => void terminar(r.tentativas, r.acertos)} />
            )}
          </section>
        ) : (
          <section className="cartao brincar-cartao">
            <header className="biblio-cab">
              <img className="biblio-dupla" src={asset('dupla/tales-busto-alegre.webp')} alt="Tales" />
              <div>
                <h1 className="t">Brincar com sons</h1>
                <Balao fala={B.brincar} crianca={crianca} />
              </div>
            </header>
            {RECURSOS.jogos ? <h2 className="brincar-secao">Jogos</h2> : null}
            <div className="brincar-grade brincar-jogos-grade" hidden={!RECURSOS.jogos}>
              {JOGOS_FONICOS.map((j, k) => {
                const vezes = d.jogos.filter((x) => x.id === j.id).length;
                const vs = variacoesDoJogo(progresso, j.id);
                const aberto = vs.some((v) => v.liberada);
                const id = `jogo:${j.id}`;
                return (
                  <button key={j.id} className={`brincar-jogo-cartao cor-${j.cor} ${aberto ? '' : 'trancado'}`} style={{ ['--k' as string]: k } as CSSProperties} onClick={() => abrir(id, `c/${criancaId}/brincar/${j.id}`)} data-testid={`jogo-${j.id}`} data-aberto={aberto ? '1' : '0'}>
                    <Capa itens={j.capa} />
                    <b>{j.nome}</b>
                    {aberto ? <small>{j.treina}</small> : <Falta texto="Abre com o primeiro som da trilha." n={missoes[id]} compacto />}
                    {aberto && novo(id) ? <SeloNovo /> : vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
                  </button>
                );
              })}
              {/* D032 §4: jogos da vila (Estrada e Rio dos Pares, Carteiro, Casa do Som), telas em JogosVila.tsx */}
              {JOGOS_DA_VILA.map((j, k) => {
                const vezes = d.jogos.filter((x) => x.id === j.id).length;
                const s = vila[j.id];
                const id = `jogo:${j.id}`;
                return (
                  <button key={j.id} className={`brincar-jogo-cartao cor-${j.cor} ${s.aberto ? '' : 'trancado'}`} style={{ ['--k' as string]: k + JOGOS_FONICOS.length } as CSSProperties} onClick={() => abrir(id, rotaDoJogoDaVila(criancaId, j.id))} data-testid={`jogo-${j.id}`} data-aberto={s.aberto ? '1' : '0'}>
                    <span className="brincar-figs" aria-hidden="true">{j.capa.map((f) => <Figura key={f} palavra={f} />)}</span>
                    <b>{j.nome}</b>
                    {s.aberto ? <small>{j.treina}</small> : <Falta texto={s.motivo} n={missoes[id]} compacto />}
                    {s.aberto && novo(id) ? <SeloNovo /> : vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
                  </button>
                );
              })}
              {/* fila do dono nº 17: Memória dos Sons (cena do som × letra), tela em MemoriaDosSons.tsx */}
              {(() => {
                const aberto = memoriaAberta(progresso);
                const vezes = d.jogos.filter((x) => x.id === 'memoria-sons').length;
                return (
                  <button className={`brincar-jogo-cartao cor-ceu ${aberto ? '' : 'trancado'}`} style={{ ['--k' as string]: JOGOS_FONICOS.length + JOGOS_DA_VILA.length } as CSSProperties} onClick={() => abrir('jogo:memoria', `c/${criancaId}/memoria`)} data-testid="jogo-memoria-sons" data-aberto={aberto ? '1' : '0'}>
                    <CapaMemoria itens={['fig', 'verso', 'letra']} />
                    <b>Memória dos Sons</b>
                    {aberto ? <small>Achar o par da cena e da letra do mesmo som</small> : <Falta texto="Abre com os primeiros sons da trilha." n={missoes['jogo:memoria']} compacto />}
                    {aberto && novo('jogo:memoria') ? <SeloNovo /> : vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
                  </button>
                );
              })()}
            </div>
            <h2 className="brincar-secao">Brincadeiras de escutar</h2>
            <div className="brincar-grade">
              {JOGOS_ESCUTA.map((j, k) => {
                const vezes = d.jogos.filter((x) => x.id === j.id).length;
                return (
                  <button key={j.id} className={`brincar-jogo-cartao cor-${j.cor}`} style={{ ['--k' as string]: k } as CSSProperties} onClick={() => navegar(`c/${criancaId}/brincar/${j.id}`)} data-testid={`jogo-${j.id}`}>
                    <span className="brincar-figs" aria-hidden="true">{CAPA[j.id]?.map((f) => <Figura key={f} palavra={f} />)}</span>
                    <b>{j.nome}</b>
                    <small>{j.treina}</small>
                    {vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
                  </button>
                );
              })}
            </div>
            <p className="brincar-nota">Os jogos de escutar ficam sempre abertos e não travam a trilha. Os jogos de sons abrem com o primeiro som da trilha e ganham sons novos a cada missão. Pode jogar quantas vezes quiser.</p>
          </section>
        )}
      </main>
    </div>
  );
}
