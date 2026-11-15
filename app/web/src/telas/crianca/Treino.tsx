/**
 * TREINO RÁPIDO COM A SOFIA (D030 etapa 9): a prática recomendada pelo motor (`treinoDisponivel`) vira uma rodada curta
 * de Escolher, focada no par que a criança confunde e com a volta ao pré-requisito. As respostas são registradas como
 * avaliadas (contexto 'reforco'). Sem moedinha a ganhar ou perder; uma vez por dia.
 */
import { useEffect, useRef, useState } from 'react';
import { CONQUISTA_POR_ID } from '@fonema/conteudo';
import { infoNome, registrarTreino, treinoDisponivel, type ConquistaGanha, type Progresso, type TreinoRapido } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { CelebracaoSelos, Modelo3D } from '../../componentes/recompensas.tsx';
import { Escolher } from '../../mecanicas/Escolher.tsx';
import type { ResultadoMecanica } from '../../mecanicas/comum.tsx';
import { novoId } from '../../dados/repositorio.ts';
import { efeitos } from '../../servicos/efeitos.ts';
import { voz } from '../../servicos/voz.ts';
import { falar } from '../../util.ts';

/** Botão "Treino rápido com a Sofia" (vila e fim da missão): só aparece quando há o que treinar hoje. */
export function BotaoTreino({ criancaId, progresso, className = 'doca-btn doca-treino' }: { criancaId: string; progresso: Progresso; className?: string }) {
  const { config } = useApp();
  const [treino] = useState(() => treinoDisponivel(progresso, config, Date.now()));
  if (!treino) return null;
  return (
    <button className={className} onClick={() => navegar(`c/${criancaId}/treino`)} data-testid="ir-treino" title={treino.titulo}>
      <span className="treino-rosto" aria-hidden="true"><img src="./assets/modelos3d/sofia.webp" alt="" draggable={false} /></span>
      Treino rápido
    </button>
  );
}

export function Treino({ criancaId }: { criancaId: string }) {
  const { repo, config } = useApp();
  const { crianca, progresso, salvarProgresso } = useCrianca(criancaId);
  const [treino, setTreino] = useState<TreinoRapido | null | undefined>(undefined);
  const [etapa, setEtapa] = useState<'intro' | 'jogo' | 'fim'>('intro');
  const [novas, setNovas] = useState<ConquistaGanha[]>([]);
  const [placar, setPlacar] = useState<{ total: number } | null>(null);
  const sessao = useRef(novoId('treino'));

  useEffect(() => {
    if (progresso && treino === undefined) setTreino(treinoDisponivel(progresso, config, Date.now()));
  }, [progresso, treino, config]);
  useEffect(() => { if (crianca && treino && etapa === 'intro') void falar({ quem: 'sofia', texto: 'Vamos treinar mais um pouquinho juntos, [NOME].' }, crianca); }, [crianca, treino, etapa]);
  useEffect(() => () => voz.parar(), []);
  if (!crianca || !progresso || treino === undefined) return <Carregando />;

  const aoFim = async (res: ResultadoMecanica) => {
    if (!treino) return;
    const agora = Date.now();
    const demonstracoes = await repo.listarDemonstracoes(criancaId);
    const r = registrarTreino(progresso, treino, sessao.current, res.tentativas, config, agora, demonstracoes);
    await salvarProgresso(r.progresso);
    const acertos = res.tentativas.filter((t) => t.acertou && !t.comAjuda).length;
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'atividade', cena: treino.cena.id, habilidade: treino.pratica.habilidade, texto: treino.titulo, acertos, total: res.tentativas.length });
    for (const g of r.novas) await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'conquista', texto: g.id });
    setNovas(r.novas);
    setPlacar({ total: res.tentativas.length });
    setEtapa('fim');
    efeitos.conquista();
    await falar({ quem: 'sofia', texto: 'Treinar é assim mesmo!' }, crianca);
  };

  const letra = infoNome(crianca.nome, crianca.pronuncia.grafia).letras;
  return (
    <div className="tela-treino" data-testid="treino" data-etapa={etapa}>
      <Fundo cena="quintal" desfoque={16} tom="calmo" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Treino rápido com a Sofia" />
      <main className="palco">
        {!treino ? (
          <section className="cartao treino-cartao">
            <div className="treino-intro">
              <div className="treino-sofia" aria-hidden="true"><Modelo3D qual="sofia" tamanho={200} modo="balanco" /></div>
              <div>
                <h1 className="t">Tudo em dia!</h1>
                <Balao fala={{ quem: 'sofia', texto: 'Muito bem! Letra por letra.' }} crianca={crianca} />
                <p className="sondagem-nota">Hoje não tem treino rápido. É só seguir a missão.</p>
                <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)}><Icone nome="casa" />Voltar para a vila</button>
              </div>
            </div>
          </section>
        ) : etapa === 'intro' ? (
          <section className="cartao treino-cartao">
            <div className="treino-intro">
              <div className="treino-sofia" aria-hidden="true"><Modelo3D qual="sofia" tamanho={230} modo="balanco" /></div>
              <div>
                <p className="etiqueta"><Icone nome="relogio" />Uns 2 minutinhos</p>
                <h1 className="t">{treino.titulo}</h1>
                <Balao fala={{ quem: 'sofia', texto: 'Vamos treinar mais um pouquinho juntos, [NOME].' }} crianca={crianca} />
                <p className="sondagem-nota">{treino.atividade.itens.length} desafios. Pode ouvir quantas vezes quiser.</p>
                <button className="btn enorme ipe brilha" onClick={() => { voz.parar(); setEtapa('jogo'); }} data-testid="comecar-treino"><Icone nome="play" />Vamos!</button>
              </div>
            </div>
          </section>
        ) : etapa === 'jogo' ? (
          <section className="cartao atividade">
            <h2 className="titulo-cena t">{treino.titulo}</h2>
            <Escolher atividade={treino.atividade} crianca={crianca} sessao={sessao.current} cenaId={treino.cena.id} onFim={aoFim} />
          </section>
        ) : (
          <section className="cartao treino-cartao" data-testid="treino-fim">
            <div className="treino-intro">
              <div className="treino-sofia" aria-hidden="true"><Modelo3D qual="sofia" tamanho={230} modo="entrada" /></div>
              <div>
                <h1 className="t">Treino feito!</h1>
                <Balao fala={{ quem: 'sofia', texto: 'Treinar é assim mesmo!' }} crianca={crianca} />
                {placar ? <p className="treino-placar">Você fez {placar.total} desafios com atenção.</p> : null}
                {novas.length ? <CelebracaoSelos letra={letra} itens={novas.slice(0, 2).flatMap((g) => (CONQUISTA_POR_ID[g.id] ? [{ conquista: CONQUISTA_POR_ID[g.id], ganha: g }] : []))} /> : null}
                <div className="linha-botoes"><button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/vila`)} data-testid="treino-voltar"><Icone nome="casa" />Voltar para a vila</button></div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
