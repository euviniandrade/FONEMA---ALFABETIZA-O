/**
 * JOGOS DA VILA (#/c/:id/jogo[/:jogo[/:faseId]]) — D032 §4; docs/pesquisa/47 §5 (ordem 3 a 5) e §5.1:
 *  - Estrada e Rio dos Pares (`estrada-pares`), Carteiro da Vila (`carteiro`) e Casa do Som (`casa-som`);
 *  - sem `faseId`: jogar à vontade (Parque de Jogos), contexto 'livre';
 *  - com `faseId`: desafio opcional oferecido no fim daquela missão (Ritual), contexto 'desafio', com os itens daquela fase.
 * Rotas para o mundo 3D abrir (sem editar o mundo): `rotaDoJogoDaVila(criancaId, 'carteiro')` → `#/c/:id/jogo/carteiro`.
 * Só o que já foi ensinado (jogos-vila.ts). Sem moedinhas ganhas, sem cronômetro, sem ranking; a cor do carro se compra com
 * as moedinhas da jornada (D002) e a casinha decorada é brincadeira: nada disso conta como domínio (regra 4).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { FALAS_ESCUTA } from '@fonema/conteudo';
import {
  CORES_VEICULO, comprar, corLiberada, dadosBiblioteca, dadosJogosVila, escolherCor, moverMovel, podeComprar, receberMovel,
  registrarLivre, rodadaDaCasa, rodadaDaEstrada, rodadaDoCarteiro, variacoesDaEstrada, type JogoVilaId, type Progresso, type Tentativa, type VariacaoEstrada
} from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { lerRota, navegar } from '../../rotas.ts';
import { Carregando, Topo } from '../../componentes/basicos.tsx';
import { Figura, Fundo, Icone } from '../../componentes/ui.tsx';
import { novoId } from '../../dados/repositorio.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { sementeDaTentativa } from '../../mecanicas/comum.tsx';
import { EstradaPares } from '../../mecanicas/jogos/EstradaPares.tsx';
import { Carteiro } from '../../mecanicas/jogos/Carteiro.tsx';
import { CasaDoSom, CasinhaDoSom } from '../../mecanicas/jogos/CasaDoSom.tsx';
import { Veiculo, corDoVeiculo } from '../../mecanicas/jogos/vila-comum.tsx';
import { JOGOS_DA_VILA, rotaDoJogoDaVila, situacaoDosJogosDaVila } from './jogos-vila-cartoes.ts';
import { Falta, useMissoesAteAbrir } from '../../componentes/Desbloqueio.tsx';
import '../../mecanicas/jogos/estilos-jogos-vila.css';

export { JOGOS_DA_VILA, rotaDoJogoDaVila, situacaoDosJogosDaVila };

/** Registro das respostas conferidas (motor, contexto livre/desafio) + o que muda na casinha/garagem. */
function useRegistroJogo(criancaId: string, progresso: Progresso | undefined, salvarProgresso: (p: Progresso) => Promise<void>) {
  const { repo, config } = useApp();
  const sessao = useRef(novoId('jogo'));
  const atual = useRef<Progresso | undefined>(progresso);
  useEffect(() => { if (progresso) atual.current = progresso; }, [progresso]);
  const mudar = async (f: (p: Progresso) => Progresso) => {
    if (!atual.current) return;
    const p = f(atual.current);
    atual.current = p;
    await salvarProgresso(p);
  };
  const salvar = async (jogo: JogoVilaId, titulo: string, tentativas: Tentativa[]) => {
    const p0 = atual.current;
    if (!p0) return;
    const agora = Date.now();
    const acertos = tentativas.filter((t) => t.acertou && !t.comAjuda).length;
    const resumo = (d: ReturnType<typeof dadosBiblioteca>) => ({ ...d, jogos: [...d.jogos, { id: jogo, em: agora, acertos, total: tentativas.length }] });
    if (!tentativas.length) { await mudar((p) => ({ ...p, biblioteca: resumo(dadosBiblioteca(p)) })); return; }
    const demonstracoes = await repo.listarDemonstracoes(criancaId);
    const r = registrarLivre(p0, { sessao: sessao.current, cena: { id: `livre-${jogo}`, titulo }, tentativas, cfg: config, agora, demonstracoes }, resumo);
    atual.current = r.progresso;
    await salvarProgresso(r.progresso);
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'atividade', cena: `livre-${jogo}`, habilidade: tentativas[0].habilidade, texto: titulo, acertos, total: tentativas.length });
  };
  return { sessao: sessao.current, salvar, mudar };
}

export function JogosVila({ criancaId, jogoId }: { criancaId: string; jogoId?: string }) {
  // um só estado da criança para a tela e para o registro (a casinha e a cor aparecem na hora)
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  const reg = useRegistroJogo(criancaId, progresso, salvarProgresso);
  const faseId = lerRota()[4];
  const jogo = JOGOS_DA_VILA.find((j) => j.id === jogoId);
  const [jogando, setJogando] = useState<{ rodada: number; variacao?: VariacaoEstrada } | null>(null);
  const [fim, setFim] = useState<{ acertos: number; total: number } | null>(null);
  const [veiculo, setVeiculo] = useState<'carro' | 'barco'>('carro');
  const [novo, setNovo] = useState<string | undefined>();
  useEffect(() => { setJogando(null); setFim(null); }, [jogoId]);
  useEffect(() => () => voz.parar(), []);
  const missoes = useMissoesAteAbrir(progresso);

  // a rodada é sorteada UMA vez por partida (semente nova a cada "jogar")
  const partida = useMemo(() => {
    if (!progresso || !jogando || !jogo) return null;
    const semente = sementeDaTentativa() || 7 + jogando.rodada;
    const primeira = !dadosBiblioteca(progresso).jogos.some((x) => x.id === jogo.id);
    const comDemo = <T,>(xs: T[]) => (primeira && xs.length > 1 ? { demo: xs[0], itens: xs.slice(1) } : { demo: null, itens: xs });
    if (jogo.id === 'estrada-pares') {
      const n = faseId ? 4 : 6;
      return comDemo(rodadaDaEstrada(progresso, { variacao: jogando.variacao ?? 'ouvir', semente, n: n + (primeira ? 1 : 0), faseId }));
    }
    if (jogo.id === 'carteiro') return comDemo(rodadaDoCarteiro(progresso, { semente, n: (faseId ? 4 : 5) + (primeira ? 1 : 0) }));
    return { demo: null, itens: rodadaDaCasa(progresso, { semente, n: faseId ? 2 : 3 }) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogando?.rodada, jogando?.variacao, jogo?.id, !!progresso]);

  if (!crianca || !progresso) return <Carregando />;
  const sit = situacaoDosJogosDaVila(progresso);
  const vila = dadosJogosVila(progresso);
  const cor = corDoVeiculo(vila.corVeiculo);
  const contexto = faseId ? 'desafio' as const : 'livre' as const;
  const voltar = faseId ? `c/${criancaId}/vila` : `c/${criancaId}/brincar`;

  const terminar = async (tentativas: Tentativa[]) => {
    if (!jogo) return;
    await reg.salvar(jogo.id, jogo.nome, tentativas);
    setFim({ acertos: tentativas.filter((t) => t.acertou && !t.comAjuda).length, total: tentativas.length });
    setJogando(null);
  };
  const jogar = (variacao?: VariacaoEstrada) => { efeitos.toque(); setFim(null); setNovo(undefined); setJogando((j) => ({ rodada: (j?.rodada ?? 0) + 1, variacao })); };

  return (
    <div className="tela-jogos-vila" data-testid="jogos-vila" data-jogo={jogoId ?? ''} data-contexto={contexto}>
      <Fundo cena={jogo?.id === 'casa-som' ? 'arte/jogos/sala-casa-som' : jogo?.id === 'carteiro' ? 'arte/jogos/rua-vila' : 'arte/paisagem-sem-dupla'} desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={voltar} titulo={jogo ? jogo.nome : 'Jogos da vila'} />
      <main className="palco">
        {!jogo ? (
          <section className="cartao jv-parque">
            <h1 className="t">Jogos da vila</h1>
            <div className="jv-grade">
              {JOGOS_DA_VILA.map((j, k) => {
                const s = sit[j.id];
                const vezes = dadosBiblioteca(progresso).jogos.filter((x) => x.id === j.id).length;
                return (
                  <button key={j.id} className={`jv-cartao cor-${j.cor} ${s.aberto ? '' : 'fechado'}`} style={{ ['--k' as string]: k } as CSSProperties}
                    onClick={() => { if (s.aberto) navegar(rotaDoJogoDaVila(criancaId, j.id)); else { efeitos.suave(); } }} aria-disabled={!s.aberto} data-testid={`jogo-${j.id}`}>
                    <span className="jv-capa" aria-hidden="true">{j.id === 'estrada-pares' ? <Veiculo tipo="carro" cor={cor} /> : null}{j.capa.map((f) => <Figura key={f} palavra={f} />)}</span>
                    <b>{j.nome}</b>
                    {s.aberto ? <small>{j.treina}</small> : <Falta texto={s.motivo} n={missoes[`jogo:${j.id}`]} compacto />}
                    {!s.aberto ? <span className="jv-cadeado"><Icone nome="cadeado" /></span> : vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
                  </button>
                );
              })}
            </div>
            <p className="brincar-nota">Os jogos usam só os sons e as palavras que você já aprendeu. Pode jogar quantas vezes quiser.</p>
          </section>
        ) : jogando && partida && partida.itens.length ? (
          <section className="cartao atividade jv-jogo" key={jogando.rodada}>
            {jogo.id === 'estrada-pares' ? (
              <EstradaPares itens={partida.itens as never} demo={partida.demo as never} crianca={crianca} sessao={reg.sessao} cena={`livre-${jogo.id}`} contexto={contexto}
                veiculo={veiculo} cor={cor} onFim={(r) => void terminar(r.tentativas)} />
            ) : jogo.id === 'carteiro' ? (
              <Carteiro itens={partida.itens as never} demo={partida.demo as never} crianca={crianca} sessao={reg.sessao} cena={`livre-${jogo.id}`} contexto={contexto} onFim={(r) => void terminar(r.tentativas)} />
            ) : (
              <CasaDoSom itens={partida.itens as never} crianca={crianca} sessao={reg.sessao} cena={`livre-${jogo.id}`} contexto={contexto}
                aoReceber={(w) => { setNovo(w); void reg.mudar((p) => receberMovel(p, w)); }} onFim={(r) => void terminar(r.tentativas)} />
            )}
          </section>
        ) : (
          <section className="cartao jv-inicio" data-testid="jogo-inicio">
            {fim ? (
              <div className="jv-fim" data-testid="jogo-fim">
                <div className="biblio-feito-selo" aria-hidden="true"><Icone nome="estrela" /></div>
                <h1 className="t">{jogo.id === 'casa-som' ? 'Chegou na sua casinha!' : jogo.id === 'carteiro' ? 'Cartas entregues!' : 'Chegamos!'}</h1>
                <p>{fim.total ? `Você acertou ${fim.acertos} de ${fim.total} de primeira.` : FALAS_ESCUTA.muitoBem.texto}</p>
              </div>
            ) : <h1 className="t jv-titulo">{jogo.nome}</h1>}
            {!sit[jogo.id].aberto && !faseId ? <div className="jv-motivo"><Falta texto={sit[jogo.id].motivo} n={missoes[`jogo:${jogo.id}`]} /></div> : null}

            {jogo.id === 'estrada-pares' ? (
              <EscolhaEstrada progresso={progresso} veiculo={veiculo} setVeiculo={setVeiculo} cor={cor} faseId={faseId} jogar={jogar}
                pintar={(id) => void reg.mudar((p) => escolherCor(p, id))} comprarCor={(id, preco) => void reg.mudar((p) => escolherCor(comprar(p, id, preco), id))} />
            ) : jogo.id === 'casa-som' ? (
              <>
                <CasinhaDoSom moveis={vila.moveis} posicoes={vila.posicoes} novo={novo} aoMover={(w, x, y) => void reg.mudar((p) => moverMovel(p, w, x, y))} />
                <div className="linha-botoes centro">
                  <button className="btn grande verde" onClick={() => jogar()} disabled={!sit['casa-som'].aberto} data-testid="jogo-comecar"><Icone nome="lojinha" />Fazer uma encomenda</button>
                </div>
              </>
            ) : (
              <div className="linha-botoes centro">
                <button className="btn grande verde" onClick={() => jogar()} disabled={!sit.carteiro.aberto} data-testid="jogo-comecar"><Icone nome="play" />{fim ? 'Entregar mais cartas' : 'Começar a entregar'}</button>
              </div>
            )}
            {fim || faseId ? (
              <div className="linha-botoes centro">
                {faseId ? <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)} data-testid="voltar-vila"><Icone nome="casa" />Voltar para a vila</button>
                  : <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/brincar`)} data-testid="jogo-outros"><Icone nome="seta-esq" />Outros jogos</button>}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}

/** Antes da estrada: carro ou barco, a cor (garagem) e ouvir/ler. */
function EscolhaEstrada({ progresso, veiculo, setVeiculo, cor, faseId, jogar, pintar, comprarCor }: {
  progresso: Progresso; veiculo: 'carro' | 'barco'; setVeiculo: (v: 'carro' | 'barco') => void; cor: string; faseId?: string;
  jogar: (v: VariacaoEstrada) => void; pintar: (id: string) => void; comprarCor: (id: string, preco: number) => void;
}) {
  const vars = faseId ? (['ouvir', 'ler'] as const).filter((v) => rodadaDaEstrada(progresso, { variacao: v, semente: 1, faseId }).length).map((v) => ({ variacao: v, liberada: true }))
    : variacoesDaEstrada(progresso);
  const atual = dadosJogosVila(progresso).corVeiculo ?? CORES_VEICULO[0].id;
  return (
    <div className="jv-estrada-inicio">
      <div className="jv-veiculos" role="group" aria-label="Carro ou barco">
        {(['carro', 'barco'] as const).map((v) => (
          <button key={v} className={`jv-veiculo ${veiculo === v ? 'sel' : ''}`} onClick={() => { efeitos.toque(); setVeiculo(v); }} aria-pressed={veiculo === v} data-testid={`veiculo-${v}`}>
            <Veiculo tipo={v} cor={cor} /><b>{v === 'carro' ? 'Estrada' : 'Rio'}</b>
          </button>
        ))}
      </div>
      <div className="jv-cores" role="group" aria-label="Cor do carro e do barco">
        {CORES_VEICULO.map((c) => {
          const tem = corLiberada(progresso, c.id);
          const pode = podeComprar(progresso, c.preco).pode;
          return (
            <button key={c.id} className={`jv-cor ${atual === c.id ? 'sel' : ''} ${tem ? '' : 'a-venda'}`} style={{ ['--cor' as string]: c.cor } as CSSProperties}
              onClick={() => { if (tem) { efeitos.toque(); pintar(c.id); } else if (pode) { efeitos.acerto(); comprarCor(c.id, c.preco); } else efeitos.suave(); }}
              aria-label={tem ? `Pintar de ${c.nome}` : `${c.nome}: ${c.preco} moedinhas${pode ? '' : ' (ainda faltam moedinhas)'}`} data-cor={c.id}>
              <i />{tem ? null : <small><Icone nome="lojinha" />{c.preco}</small>}
            </button>
          );
        })}
      </div>
      <div className="linha-botoes centro">
        {vars.map((v) => (
          <button key={v.variacao} className={`btn grande ${v.variacao === 'ouvir' ? 'verde' : ''}`} disabled={!v.liberada} onClick={() => jogar(v.variacao)} data-testid={`jogo-comecar-${v.variacao}`}>
            <Icone nome={v.variacao === 'ouvir' ? 'som' : 'olho'} />{v.variacao === 'ouvir' ? 'Ouvir e escolher' : 'Ler e escolher'}
          </button>
        ))}
      </div>
    </div>
  );
}
