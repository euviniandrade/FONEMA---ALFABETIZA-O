import { Fundo, Icone } from '../../componentes/ui.tsx';
import { useEffect, useMemo, useState } from 'react';
import { CAMPO_POR_ID, CONQUISTA_POR_ID, FASE_POR_ID, FALAS, type Fase } from '@fonema/conteudo';
import { abriuParaMostrar, calcularNivel, campoDoDesafio, desafioDaFase, desafioMemoria, fasesConcluidas, fimDaMissao, missaoInicialFeita, missoesHoje, infoNome, situacaoSondagem, type Crianca, type Progresso, type RelatorioSessao } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Topo } from '../../componentes/basicos.tsx';
import { BarraObjetivo, CelebracaoSelos, Cofrinho, FiguraLimpa, MiniaturaPremio, Premio3D, Termometro } from '../../componentes/recompensas.tsx';
import { asset, espera } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { semFonetica, textoTela, textoVoz } from '../../util.ts';
import { BotaoTreino } from './Treino.tsx';
import { PainelAbriu } from '../../componentes/Desbloqueio.tsx';

const NOME_DESAFIO = { 'estrada-pares': 'Desafio: Estrada dos Pares', carteiro: 'Desafio: Carteiro da Vila', 'casa-som': 'Desafio: Casa do Som' } as const;

/**
 * C9 · Ritual de fim: recapitula, moedinhas EM BLOCO voando ao porquinho (cofrinho), conquistas e surpresas
 * DEPOIS do fato (P1-b), barra do próximo OBJETIVO, gancho e despedida.
 * D036 (dono, 26/11): várias missões no mesmo dia. O fim tem o botão grande "Próxima missão" (leva à ENTRADA da missão seguinte;
 * nada começa sozinho) ao lado de "Voltar para a vila"; não diz "amanhã" quando há outra missão para fazer agora; depois de
 * PAUSA_DEPOIS_DE missões no dia sugere uma pausa, sem bloquear. Substitui o "sem botão continuar" (pesquisa 42 R13) da fila nº 30.
 */
export function Ritual({ crianca, progresso, relatorio, fase, expressa }: { crianca: Crianca; progresso: Progresso; relatorio: RelatorioSessao; fase: Fase; expressa: boolean }) {
  const { config } = useApp();
  const [passo, setPasso] = useState(0);
  const [moedasAnim, setMoedasAnim] = useState(0);
  // revisão 18/11 (item 12): o contador soma NA HORA, de uma em uma, enquanto as moedinhas voam para o porquinho
  const [somadas, setSomadas] = useState(0);
  const nivel = useMemo(() => calcularNivel(progresso.desafios, missaoInicialFeita(progresso), fasesConcluidas(progresso)), [progresso]);
  const proxima = FASE_POR_ID[progresso.faseAtual];
  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  const saldoAntes = progresso.moedinhas.saldo - relatorio.moedinhas;
  const desafio = useMemo(() => desafioDaFase(progresso, fase.id), [progresso, fase.id]);
  // D033: ficha de leitura como desafio opcional nas lições da Trilha dos Sons (campo com palavras que a criança já lê)
  const ficha = useMemo(() => campoDoDesafio(progresso, fase.id), [progresso, fase.id]);
  // fila do dono nº 17: Memória dos Sons como desafio opcional no fim das fases da Trilha A–Z (memoria-sons.ts)
  const memoria = useMemo(() => desafioMemoria(progresso, fase.id), [progresso, fase.id]);
  // D034: extras que abriram nesta missão (jogos, leitura, peças da Lojinha)
  const abriu = useMemo(() => abriuParaMostrar(relatorio.abriu ?? [], crianca.genero), [relatorio.abriu, crianca.genero]);
  // D036: quantas missões hoje (esta incluída) e como o fim fecha (só falas já gravadas; guia.ts › fimDaMissao)
  const feitasHoje = useMemo(() => Math.max(1, missoesHoje(progresso, Date.now())), [progresso]);
  const fim = useMemo(() => fimDaMissao({
    fase, faseConcluida: relatorio.faseConcluida, feitasHoje,
    haProxima: !!proxima && progresso.fases[proxima.id]?.estado !== 'concluida',
    chefeNaoPassou: !!relatorio.chefe && !relatorio.chefe.passou
  }), [fase, relatorio, feitasHoje, proxima, progresso]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const f = (t: string, quem: 'sofia' | 'tales' = 'sofia') => (vivo ? voz.falar(textoVoz(t, crianca), { quem }) : Promise.resolve());
      if (relatorio.moedinhas > 0) { setMoedasAnim(relatorio.moedinhas); efeitos.moeda(); }
      await f(FALAS.ritual.recap);
      if (!vivo) return;
      setPasso(1);
      if (relatorio.moedinhas > 0) await f(FALAS.ritual.moedinhas);
      await espera(600);
      if (!vivo) return;
      setPasso(2);
      if (relatorio.conquistasNovas.length) {
        efeitos.conquista();
        await f(FALAS.conquista);
      }
      // D034: o que abriu nesta missão (jogo, leitura, peça) aparece no painel "Abriu!"; o Tales anuncia com a fala já gravada
      if (relatorio.surpresas.length || abriu.length) await f(FALAS.surpresa, 'tales');
      if (relatorio.faseConcluida && fase.uau) await f(fase.uau, 'tales');
      if (relatorio.chefe && !relatorio.chefe.passou) await f('Vamos treinar mais um pouquinho e tentar de novo outro dia. Nada se perde!');
      if (!vivo) return;
      setPasso(3);
      await f(fim.gancho.texto, fim.gancho.quem as 'sofia' | 'tales');
      if (fim.tchau) await f(FALAS.ritual.tchau);
    })();
    return () => { vivo = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!relatorio.moedinhas) return;
    // as moedas chegam ao porquinho ~1 s depois de começarem a voar; dali o número sobe uma por vez
    let n = 0;
    let relogio = 0;
    const subir = () => { n++; setSomadas(n); if (n < relatorio.moedinhas) relogio = window.setTimeout(subir, 160); };
    relogio = window.setTimeout(subir, 950);
    return () => window.clearTimeout(relogio);
  }, [relatorio.moedinhas]);
  const saldoAgora = saldoAntes + Math.max(somadas, passo >= 1 && moedasAnim === 0 ? relatorio.moedinhas : 0);
  // fila nº 30 ("sempre saber qual é a próxima missão"): o fim mostra SEMPRE a próxima missão (outra fase ou a mesma de novo), em
  // qualquer modo de prêmio (missão não é prêmio). D036: e agora também o botão para começá-la (leva à entrada da fase).
  const idade = new Date().getFullYear() - crianca.anoNascimento;
  return (
    <div className="tela-ritual" data-testid="ritual">
      <Fundo cena="arte/paisagem-sem-dupla" desfoque={10} tom="claro" />
      {relatorio.conquistasNovas.length || relatorio.faseConcluida ? <div className="confete" aria-hidden="true">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ left: `${(i * 41 + 7) % 100}%`, animationDuration: `${3.5 + (i % 5) * 0.7}s`, animationDelay: `${(i % 9) * 0.25}s` }} />)}</div> : null}
      <Topo crianca={crianca} moedinhas={saldoAgora} titulo="Fim da missão" />
      <main className="palco ritual">
        <section className="cartao ritual-cartao">
          <div className="ritual-raios" aria-hidden="true" />
          {relatorio.faseConcluida ? <FiguraLimpa className="ritual-trofeu" src={asset('figuras/estrela.webp')} /> : null}
          <h1 className="t">{relatorio.faseConcluida ? `Fase concluída: ${semFonetica(fase.titulo)}!` : feitasHoje > 1 ? `Missão ${feitasHoje} de hoje feita!` : 'Missão de hoje feita!'}</h1>
          <Balao fala={{ quem: 'sofia', texto: FALAS.ritual.recap }} crianca={crianca} />
          <p className="ritual-desafios">Nesta missão: <b>{relatorio.atividades}</b> desafios feitos</p>
          {/* D034: o que abriu fica logo no alto (no celular, o resto do ritual vem embaixo) */}
          {passo >= 2 && abriu.length ? <PainelAbriu ids={relatorio.abriu ?? []} sexo={crianca.genero} criancaId={crianca.id} ir={navegar} /> : null}
          <div className="ritual-grade">
            <div className="ritual-moedas">
              <Cofrinho saldo={saldoAgora} animar={moedasAnim} tamanho={250} />
              {/* revisão 18/11 (item 12): nunca "+0 moedinhas": sem moedas hoje (cofrinho do dia cheio), só o elogio */}
              {relatorio.moedinhas > 0
                ? <p data-testid="moedinhas-ganhas"><span className="ritual-moeda-3d" aria-hidden="true"><Premio3D tipo="moeda" tamanho={44} /></span><b className="soma">+{relatorio.moedinhas}</b> moedinhas no cofrinho</p>
                : <p className="ritual-elogio" data-testid="ritual-elogio"><Icone nome="estrela" />Você trabalhou muito bem!</p>}
            </div>
            <div className="ritual-conquistas" aria-live="polite">
              {passo >= 2 && relatorio.conquistasNovas.length ? (
                <>
                  <h2 className="t">Olha o que você conquistou!</h2>
                  <CelebracaoSelos letra={letra} itens={relatorio.conquistasNovas.slice(0, 4).flatMap((g) => (CONQUISTA_POR_ID[g.id] ? [{ conquista: CONQUISTA_POR_ID[g.id], ganha: g }] : []))} />
                  {relatorio.conquistasNovas.length > 4 ? <p>+{relatorio.conquistasNovas.length - 4} no Álbum</p> : null}
                </>
              ) : passo >= 2 ? <p className="ritual-sem">Cada desafio é um passo a mais na leitura.</p> : null}
              {passo >= 2 && relatorio.surpresas.length ? (
                <div className="surpresas">
                  <MiniaturaPremio qual="bau" titulo="Baú de surpresas" tamanho={84}><p>As surpresas que você ganha saem daqui.</p></MiniaturaPremio>
                  {relatorio.surpresas.map((s) => (
                    <div key={s.id} className="surpresa" data-testid="surpresa">
                      <img src={asset(s.imagem ?? 'arte/icones/casa.webp')} alt="" />
                      <p><small>Surpresa!</small> {s.nome}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {relatorio.chefe ? (
            <p className={`ritual-chefe ${relatorio.chefe.passou ? 'ok' : ''}`}>
              <Icone nome={relatorio.chefe.passou ? 'estrela' : 'coracao'} />{relatorio.chefe.passou ? `Você venceu! (${Math.round(relatorio.chefe.leitura * 100)}% de acertos)` : 'Quase! Vamos treinar mais um pouquinho; o desafio continua lá, e nada se perde.'}
            </p>
          ) : null}
          {expressa && relatorio.expressa ? <p className="ritual-chefe"><Icone nome="raio" />{relatorio.expressa.passou ? 'Trilha Expressa: fase feita em ritmo rápido!' : 'Essa a gente vai fazer com calma, juntos!'}</p> : null}
          {relatorio.termometroDepois > relatorio.termometroAntes ? <div className="ritual-termo"><p>O termômetro da leitura subiu!</p><Termometro valor={relatorio.termometroDepois} comNumero={false} /></div> : null}
          {relatorio.tituloNovo ? <p className="titulo-novo">Título novo: <b>{relatorio.tituloNovo}</b></p> : null}
          <BarraObjetivo nivel={nivel} objetivo={proxima ? semFonetica(proxima.titulo) : undefined} rotuloObjetivo="Próxima missão" />
          {/* o balão mostra a fala que tocou (D036: sem "amanhã" quando há outra missão agora) */}
          {passo >= 3 ? <div data-testid="ritual-gancho"><Balao fala={fim.gancho} crianca={crianca} humor="curiosa" /></div> : null}
          {/* D036 [DP]: depois de PAUSA_DEPOIS_DE missões no dia, só uma sugestão de pausa (texto, sem voz nova); a próxima continua aberta */}
          {fim.pausa ? <p className="ritual-pausa" data-testid="ritual-pausa"><Icone nome="coracao" /><span><b>Que tal uma pausa?</b> Você já fez {feitasHoje} missões hoje. Se quiser, a próxima espera por você.</span></p> : null}
          <div className={`linha-botoes ritual-botoes ${fim.proxima && proxima ? 'com-seguir' : ''}`}>
            {fase.demonstracao ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/mostra/${fase.id}`)} data-testid="mostra-professor"><Icone nome="chapeu" />Mostra pro professor</button> : null}
            <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/album`)}><Icone nome="album" />Álbum</button>
            {config.lojinha.noFimDaSessao ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/lojinha`)} data-testid="ir-lojinha"><Icone nome="lojinha" />Lojinha</button> : null}
            {situacaoSondagem(progresso, config, Date.now(), idade).devida ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/sondagem`)}><Icone nome="placa" />Missão das Placas</button> : null}
            <BotaoTreino criancaId={crianca.id} progresso={progresso} className="btn grande btn-treino" />
            {/* D032 §4: desafio opcional com um jogo da vila, com o que esta missão trabalhou (jogos-vila.ts › desafioDaFase) */}
            {desafio ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/jogo/${desafio.jogo}/${fase.id}`)} data-testid="desafio-jogo"><Icone nome="play" />{NOME_DESAFIO[desafio.jogo]}</button> : null}
            {memoria ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/memoria/${fase.id}`)} data-testid="desafio-memoria"><Icone nome="estrela" />Desafio: Memória dos Sons</button> : null}
            {ficha ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/leitura/ficha.${ficha}.desafio`)} data-testid="desafio-ficha"><Icone nome="boca" />Ficha de leitura: {CAMPO_POR_ID[ficha].titulo}</button> : null}
            {fim.proxima && proxima ? null : <button className="btn grande ipe" onClick={() => navegar(`c/${crianca.id}/vila`)} data-testid="voltar-vila"><Icone nome="casa" />{textoTela('Tchau! Voltar para a vila', crianca)}</button>}
          </div>
          {/* D036: "Próxima missão" e "Voltar para a vila" sempre à vista (presos embaixo), a próxima em destaque */}
          {fim.proxima && proxima ? (
            <div className="ritual-seguir">
              <button className={`btn enorme ipe ${fim.pausa ? '' : 'brilha'} ritual-proxima`} onClick={() => navegar(`c/${crianca.id}/fase/${proxima.id}`)} data-testid="ritual-proxima" aria-label={`Próxima missão: ${semFonetica(proxima.titulo)}`}>
                <Icone nome="play" /><span className="rp-txt"><b>Próxima missão</b><small>{semFonetica(proxima.titulo)}</small></span>
              </button>
              <button className="btn enorme ritual-vila" onClick={() => navegar(`c/${crianca.id}/vila`)} data-testid="voltar-vila"><Icone nome="casa" />{textoTela('Voltar para a vila', crianca)}</button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
