import { Fundo, Icone } from '../../componentes/ui.tsx';
import { useEffect, useMemo, useState } from 'react';
import { CAMPO_POR_ID, CONQUISTA_POR_ID, FASE_POR_ID, FALAS, type Fase } from '@fonema/conteudo';
import { calcularNivel, campoDoDesafio, desafioDaFase, desafioMemoria, fasesConcluidas, missaoInicialFeita, infoNome, situacaoSondagem, type Crianca, type Progresso, type RelatorioSessao } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Topo } from '../../componentes/basicos.tsx';
import { BarraObjetivo, CelebracaoSelos, Cofrinho, FiguraLimpa, MiniaturaPremio, Premio3D, Termometro } from '../../componentes/recompensas.tsx';
import { asset, espera } from '../../servicos/ambiente.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { textoTela, textoVoz } from '../../util.ts';
import { BotaoTreino } from './Treino.tsx';

const NOME_DESAFIO = { 'estrada-pares': 'Desafio: Estrada dos Pares', carteiro: 'Desafio: Carteiro da Vila', 'casa-som': 'Desafio: Casa do Som' } as const;

/**
 * C9 · Ritual de fim: recapitula, moedinhas EM BLOCO voando ao porquinho (cofrinho), conquistas e surpresas
 * DEPOIS do fato (P1-b), barra do próximo OBJETIVO, gancho e despedida. Sem botão "continuar".
 */
export function Ritual({ crianca, progresso, relatorio, fase, expressa }: { crianca: Crianca; progresso: Progresso; relatorio: RelatorioSessao; fase: Fase; expressa: boolean }) {
  const { config } = useApp();
  const [passo, setPasso] = useState(0);
  const [moedasAnim, setMoedasAnim] = useState(0);
  const nivel = useMemo(() => calcularNivel(progresso.desafios, missaoInicialFeita(progresso), fasesConcluidas(progresso)), [progresso]);
  const proxima = FASE_POR_ID[progresso.faseAtual];
  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  const saldoAntes = progresso.moedinhas.saldo - relatorio.moedinhas;
  const desafio = useMemo(() => desafioDaFase(progresso, fase.id), [progresso, fase.id]);
  // D033: ficha de leitura como desafio opcional nas lições da Trilha dos Sons (campo com palavras que a criança já lê)
  const ficha = useMemo(() => campoDoDesafio(progresso, fase.id), [progresso, fase.id]);
  // fila do dono nº 17: Memória dos Sons como desafio opcional no fim das fases da Trilha A–Z (memoria-sons.ts)
  const memoria = useMemo(() => desafioMemoria(progresso, fase.id), [progresso, fase.id]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const f = (t: string, quem: 'sofia' | 'tales' = 'sofia') => (vivo ? voz.falar(textoVoz(t, crianca), { quem }) : Promise.resolve());
      await f(FALAS.ritual.recap);
      if (!vivo) return;
      setPasso(1);
      if (relatorio.moedinhas > 0) {
        setMoedasAnim(relatorio.moedinhas);
        efeitos.moeda();
        await f(FALAS.ritual.moedinhas);
      }
      await espera(600);
      if (!vivo) return;
      setPasso(2);
      if (relatorio.conquistasNovas.length) {
        efeitos.conquista();
        await f(FALAS.conquista);
      }
      if (relatorio.surpresas.length) await f(FALAS.surpresa, 'tales');
      if (relatorio.faseConcluida && fase.uau) await f(fase.uau, 'tales');
      if (relatorio.chefe && !relatorio.chefe.passou) await f('Vamos treinar mais um pouquinho e tentar de novo outro dia. Nada se perde!');
      if (!vivo) return;
      setPasso(3);
      await f(relatorio.faseConcluida ? fase.gancho.texto : FALAS.ritual.amanha, relatorio.faseConcluida ? fase.gancho.quem as 'sofia' | 'tales' : 'sofia');
      await f(FALAS.ritual.tchau);
    })();
    return () => { vivo = false; voz.parar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idade = new Date().getFullYear() - crianca.anoNascimento;
  return (
    <div className="tela-ritual" data-testid="ritual">
      <Fundo cena="arte/hero-paisagem" desfoque={10} tom="claro" />
      {relatorio.conquistasNovas.length || relatorio.faseConcluida ? <div className="confete" aria-hidden="true">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ left: `${(i * 41 + 7) % 100}%`, animationDuration: `${3.5 + (i % 5) * 0.7}s`, animationDelay: `${(i % 9) * 0.25}s` }} />)}</div> : null}
      <Topo crianca={crianca} moedinhas={saldoAntes + (passo >= 1 ? relatorio.moedinhas : 0)} titulo="Fim da missão de hoje" />
      <main className="palco ritual">
        <section className="cartao ritual-cartao">
          <div className="ritual-raios" aria-hidden="true" />
          {relatorio.faseConcluida ? <FiguraLimpa className="ritual-trofeu" src={asset('figuras/estrela.webp')} /> : null}
          <h1 className="t">{relatorio.faseConcluida ? `Fase concluída: ${fase.titulo}!` : 'Missão de hoje feita!'}</h1>
          <Balao fala={{ quem: 'sofia', texto: FALAS.ritual.recap }} crianca={crianca} />
          <p className="ritual-desafios">Hoje: <b>{relatorio.atividades}</b> desafios feitos</p>
          <div className="ritual-grade">
            <div className="ritual-moedas">
              <Cofrinho saldo={saldoAntes + (passo >= 1 ? relatorio.moedinhas : 0)} animar={moedasAnim} tamanho={250} />
              <p data-testid="moedinhas-ganhas"><span className="ritual-moeda-3d" aria-hidden="true"><Premio3D tipo="moeda" tamanho={44} /></span><b>+{relatorio.moedinhas}</b> moedinhas no cofrinho</p>
              {relatorio.moedinhasCalculadas > relatorio.moedinhas ? <small>Hoje o cofrinho já está cheio; amanhã tem mais.</small> : null}
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
          <BarraObjetivo nivel={nivel} objetivo={config.recompensas.modo === 'surpresa' ? proxima?.objetivo : undefined} />
          {passo >= 3 ? <Balao fala={relatorio.faseConcluida ? fase.gancho : { quem: 'sofia', texto: FALAS.ritual.amanha }} crianca={crianca} humor="curiosa" /> : null}
          <div className="linha-botoes ritual-botoes">
            {fase.demonstracao ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/mostra/${fase.id}`)} data-testid="mostra-professor"><Icone nome="chapeu" />Mostra pro professor</button> : null}
            <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/album`)}><Icone nome="album" />Álbum</button>
            {config.lojinha.noFimDaSessao ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/lojinha`)} data-testid="ir-lojinha"><Icone nome="lojinha" />Lojinha</button> : null}
            {situacaoSondagem(progresso, config, Date.now(), idade).devida ? <button className="btn grande" onClick={() => navegar(`c/${crianca.id}/sondagem`)}><Icone nome="placa" />Missão das Placas</button> : null}
            <BotaoTreino criancaId={crianca.id} progresso={progresso} className="btn grande btn-treino" />
            {/* D032 §4: desafio opcional com um jogo da vila, com o que esta missão trabalhou (jogos-vila.ts › desafioDaFase) */}
            {desafio ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/jogo/${desafio.jogo}/${fase.id}`)} data-testid="desafio-jogo"><Icone nome="play" />{NOME_DESAFIO[desafio.jogo]}</button> : null}
            {memoria ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/memoria/${fase.id}`)} data-testid="desafio-memoria"><Icone nome="estrela" />Desafio: Memória dos Sons</button> : null}
            {ficha ? <button className="btn grande verde" onClick={() => navegar(`c/${crianca.id}/leitura/ficha.${ficha}.desafio`)} data-testid="desafio-ficha"><Icone nome="boca" />Ficha de leitura: {CAMPO_POR_ID[ficha].titulo}</button> : null}
            <button className="btn grande ipe" onClick={() => navegar(`c/${crianca.id}/vila`)} data-testid="voltar-vila"><Icone nome="casa" />{textoTela('Tchau! Voltar para a vila', crianca)}</button>
          </div>
        </section>
      </main>
    </div>
  );
}
