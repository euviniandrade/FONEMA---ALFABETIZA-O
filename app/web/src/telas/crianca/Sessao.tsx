import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FASE_POR_ID, type Atividade } from '@fonema/conteudo';
import { aplicarAtividade, fecharSessao, montarSessao, podeEntrar, type Progresso, type RelatorioSessao, type Sessao as TSessao, type Tentativa } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { AssisteEFaz } from '../../mecanicas/AssisteEFaz.tsx';
import { Escolher } from '../../mecanicas/Escolher.tsx';
import { Palmas } from '../../mecanicas/Palmas.tsx';
import { Montar } from '../../mecanicas/Montar.tsx';
import { Ditado } from '../../mecanicas/Ditado.tsx';
import { Falar } from '../../mecanicas/Falar.tsx';
import { Espelho } from '../../mecanicas/Espelho.tsx';
import { Tracar } from '../../mecanicas/Tracar.tsx';
import { Pausa } from '../../mecanicas/Pausa.tsx';
import type { ResultadoMecanica } from '../../mecanicas/comum.tsx';
import { Ritual } from './Ritual.tsx';

const NOME_CENA: Record<string, string> = { C1: 'Revisão', C2: 'Eu faço', C3: 'Nós fazemos', C4: 'Você faz', C5: 'Desafio', C6: 'Pausa', C7: 'Projeto', C8: 'Ensinar', C9: 'Fim' };

/** Sessão C0–C9 de uma fase. Toda regra vem do motor; aqui só a apresentação. */
export function Sessao({ criancaId, faseId }: { criancaId: string; faseId: string }) {
  const { repo, config } = useApp();
  const { crianca, progresso, carregado, salvarProgresso } = useCrianca(criancaId);
  const [sessao, setSessao] = useState<TSessao>();
  const [idx, setIdx] = useState(0);
  const [assistiu, setAssistiu] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioSessao>();
  const [progFinal, setProgFinal] = useState<Progresso>();
  const prog = useRef<Progresso>();
  const tentativas = useRef<Tentativa[]>([]);
  const atividades = useRef(0);
  const fase = FASE_POR_ID[faseId];

  useEffect(() => {
    if (!crianca || !progresso || sessao) return;
    if (!podeEntrar(progresso, faseId)) { navegar(`c/${criancaId}/vila`); return; }
    prog.current = progresso;
    setSessao(montarSessao(progresso, crianca, faseId, config, Date.now()));
  }, [crianca, progresso, sessao, faseId, criancaId, config]);

  useEffect(() => () => voz.parar(), []);

  const etapa = sessao?.etapas[idx];

  const fecharRitual = useCallback(async () => {
    if (!sessao || !prog.current || relatorio) return;
    const demonstracoes = await repo.listarDemonstracoes(criancaId);
    const agora = Date.now();
    const r = fecharSessao(prog.current, { faseId, sessao: sessao.id, atividades: atividades.current, tentativasDaSessao: tentativas.current, expressa: sessao.expressa, demonstracoes }, config, agora);
    await salvarProgresso(r.progresso);
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'sessao', faseId, texto: `Sessão de "${fase.titulo}" (${atividades.current} atividades)` });
    if (r.relatorio.faseConcluida) await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'fase', faseId, texto: `Concluiu a fase "${fase.titulo}"${sessao.expressa ? ' (Trilha Expressa)' : ''}` });
    for (const g of r.relatorio.conquistasNovas) await repo.registrarEvento({ id: novoId('ev'), criancaId, em: agora, tipo: 'conquista', faseId, texto: g.id });
    setProgFinal(r.progresso);
    setRelatorio(r.relatorio);
  }, [sessao, relatorio, repo, criancaId, faseId, config, salvarProgresso, fase]);

  useEffect(() => {
    if (etapa?.tipo === 'ritual') fecharRitual();
  }, [etapa, fecharRitual]);

  if (!carregado || !crianca || !sessao || !etapa || !fase) return <Carregando />;

  const avancar = () => { setAssistiu(false); setIdx((i) => i + 1); };

  const aoFim = async (res: ResultadoMecanica) => {
    const cena = etapa.cena!;
    const agora = Date.now();
    prog.current = aplicarAtividade(prog.current!, { sessao: sessao.id, cena, tentativas: res.tentativas, tentouDeNovo: res.tentouDeNovo, extras: res.extras }, config, agora);
    tentativas.current.push(...res.tentativas.filter(() => cena.contaDominio || cena.tipo === 'C1'));
    if (cena.contaDominio) atividades.current++;
    else if (cena.atividade?.tipo !== 'pausa' && res.tentativas.length) atividades.current += 0;
    await repo.salvarProgresso(prog.current);
    await repo.registrarEvento({
      id: novoId('ev'), criancaId, em: agora, tipo: 'atividade', faseId, cena: cena.id, habilidade: cena.atividade?.habilidade,
      texto: cena.titulo, acertos: res.tentativas.filter((t) => t.acertou).length, total: res.tentativas.length
    });
    avancar();
  };

  const props = (a: Atividade) => ({ crianca, sessao: sessao.id, cenaId: etapa.cena!.id, revisao: etapa.cena!.tipo === 'C1', onFim: aoFim, atividade: a as never });
  const renderAtividade = (a: Atividade) => {
    switch (a.tipo) {
      case 'escolher': return <Escolher key={etapa.cena!.id} {...props(a)} />;
      case 'palmas': return <Palmas key={etapa.cena!.id} {...props(a)} />;
      case 'montar': return <Montar key={etapa.cena!.id} {...props(a)} />;
      case 'ditado': return <Ditado key={etapa.cena!.id} {...props(a)} />;
      case 'falar': return <Falar key={etapa.cena!.id} {...props(a)} />;
      case 'espelho': return <Espelho key={etapa.cena!.id} {...props(a)} />;
      case 'tracar': return <Tracar key={etapa.cena!.id} {...props(a)} />;
      case 'pausa': return <Pausa key={etapa.cena!.id} {...props(a)} />;
    }
  };

  const cenas = sessao.etapas.filter((e) => e.tipo === 'cena');
  const posCena = sessao.etapas.slice(0, idx).filter((e) => e.tipo === 'cena').length;
  const cenario = etapa.cena?.cenario ?? 'quintal';
  const limpo = cenario === 'licao' || etapa.cena?.atividade?.tipo === 'espelho';

  if (etapa.tipo === 'ritual') {
    return relatorio && progFinal ? <Ritual crianca={crianca} progresso={progFinal} relatorio={relatorio} fase={fase} expressa={sessao.expressa} /> : <Carregando />;
  }

  return (
    <div className={`tela-sessao ${limpo ? 'fundo-limpo' : ''}`} data-etapa={etapa.tipo} data-cena={etapa.cena?.id}>
      {!limpo ? <img className="cenario" src={asset(`fundos/${cenario === 'farol' || cenario === 'campinho' ? (cenario === 'farol' ? 'ilha' : 'praca') : cenario}.webp`)} alt="" /> : null}
      <Topo crianca={crianca} titulo={`${fase.id} · ${fase.titulo}`}>
        <ol className="trilha" aria-label="Trilha do dia">
          {cenas.map((e, k) => (
            <li key={e.cena!.id} className={k < posCena ? 'feito' : k === posCena && etapa.tipo === 'cena' ? 'agora' : ''} title={e.cena!.titulo}>
              <i>{k < posCena ? '✓' : k + 1}</i><span>{NOME_CENA[e.cena!.tipo] ?? e.cena!.tipo}</span>
            </li>
          ))}
        </ol>
      </Topo>
      <main className="palco" id="palco">
        {etapa.tipo === 'acolhida' ? (
          <section className="cartao acolhida">
            {sessao.expressa ? <p className="etiqueta-expressa">⚡ Trilha Expressa: você já sabe muita coisa! Vamos em ritmo rápido.</p> : null}
            <h1 className="t">{fase.titulo}</h1>
            <Balao fala={fase.acolhida} crianca={crianca} auto destaque />
            <ol className="trilha-dia">
              {cenas.map((e) => <li key={e.cena!.id}><b>{NOME_CENA[e.cena!.tipo]}</b> {e.cena!.titulo}</li>)}
            </ol>
            <button className="btn grande ipe" onClick={avancar} data-testid="comecar-sessao">Vamos! →</button>
          </section>
        ) : etapa.cena?.assiste && !assistiu ? (
          <AssisteEFaz key={etapa.cena.id} roteiro={etapa.cena.assiste.roteiro} imagem={etapa.cena.assiste.imagem} crianca={crianca} onFim={() => setAssistiu(true)} />
        ) : etapa.cena?.atividade ? (
          <section className="cartao atividade">
            <h2 className="titulo-cena t">{etapa.cena.titulo}</h2>
            {renderAtividade(etapa.cena.atividade)}
          </section>
        ) : (
          <button className="btn grande" onClick={avancar}>Continuar</button>
        )}
      </main>
    </div>
  );
}
