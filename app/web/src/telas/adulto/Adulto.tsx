import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONFIG_PADRAO, CONQUISTA_POR_ID, FASE_POR_ID, type ConfigPlataforma, sonsPurosPendentes } from '@fonema/conteudo';
import { AREAS_SONDAGEM, NIVEIS_AJUDA, NIVEIS_INICIAIS, aplicarNivelInicial, avaliarConquistas, dificuldadesDaTurma, filaProfessor, mapaHabilidades, progressoInicial, resumoAprendizagem, resumoFamilia, type CategoriaAlvo, type Crianca, type Demonstracao, type Evento, type NivelInicial, type Progresso, type StatusDemonstracao } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Ajustes, AvatarMini, Carregando } from '../../componentes/basicos.tsx';
import { BarraObjetivo, Termometro } from '../../componentes/recompensas.tsx';
import { Fundo, Icone } from '../../componentes/ui.tsx';
import { Dupla3D } from '../../componentes/Dupla3D.tsx';
import { useConta } from '../entrada/Entrada.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';
import { PainelCantinho } from '../../componentes/PainelCantinho.tsx';
import '../../estilos-painel.css';

const ROTULO_NIVEL: Record<NivelInicial, string> = { zero: 'Do zero', 'letras-e-sons': 'Já conhece as letras e os sons', 'le-palavras': 'Já lê palavras' };


/* ------------------------------ moldura das áreas (D028): cada perfil tem a sua, com menu próprio e "Sair" ------------------------------ */
type AreaId = 'familia' | 'professor';
const AREAS: Record<AreaId, { nome: string; cena: string; menu: [string, string, string][] }> = {
  familia: { nome: 'Área da Família', cena: 'varanda', menu: [['familia', 'pessoa', 'Crianças'], ['familia/cadastro', 'mais', 'Adicionar criança'], ['familia/sons', 'microfone', 'Sons das letras'], ['familia/config', 'engrenagem', 'Configurações']] },
  professor: { nome: 'Área do Professor', cena: 'biblioteca', menu: [['professor', 'pessoa', 'Turma'], ['professor/fila', 'chapeu', 'Mostra pro professor'], ['professor/habilidades', 'grafico', 'Habilidades'], ['professor/palavras', 'caderno', 'Palavras difíceis'], ['professor/sons', 'microfone', 'Sons das letras'], ['professor/config', 'engrenagem', 'Configurações']] }
};

export function Area({ area, atual, children }: { area: AreaId; atual: string; children: ReactNode }) {
  const conta = useConta();
  const sessao = useMemo(() => conta.sessao(), [conta]);
  const a = AREAS[area];
  return (
    <div className={`tela-area area-${area}`} data-testid={`area-${area}`}>
      <Fundo cena={a.cena} desfoque={18} tom="calmo" />
      <header className="area-topo">
        <div className="area-marca">
          <img src={asset(area === 'familia' ? 'arte/icones/familia.webp' : 'recompensas/bau-livros.webp')} alt="" />
          <span><b>{a.nome}</b><small>{sessao ? `Olá, ${sessao.nome}` : 'FONEMA'}</small></span>
        </div>
        <nav className="area-menu" aria-label={`Menu da ${a.nome}`}>
          {a.menu.map(([rota, ic, r]) => (
            <button key={rota} className="area-item" aria-current={rota === atual ? 'page' : undefined} onClick={() => navegar(rota)} data-menu={rota}><Icone nome={ic} /><span>{r}</span></button>
          ))}
        </nav>
        <div className="area-dir">
          <Ajustes />
          <button className="area-sair" onClick={() => { conta.sair(); navegar(''); }} data-testid="sair"><Icone nome="seta-esq" /><span>Sair</span></button>
        </div>
      </header>
      <main className="palco adulto">{children}</main>
    </div>
  );
}

function useTurma() {
  const { repo } = useApp();
  const [lista, setLista] = useState<{ c: Crianca; p?: Progresso }[] | null>(null);
  useEffect(() => {
    repo.listarCriancas().then(async (cs) => setLista(await Promise.all(cs.map(async (c) => ({ c, p: await repo.obterProgresso(c.id) })))));
  }, [repo]);
  return lista;
}

/* ------------------------------ Área da Família: crianças ------------------------------ */
export function FamiliaHome() {
  const lista = useTurma();
  if (!lista) return <Carregando />;
  return (
    <Area area="familia" atual="familia">
      <section className="cartao">
        <div className="adulto-cab">
          <h1 className="t">Suas crianças</h1>
          <button className="btn pri" onClick={() => navegar('familia/cadastro')} data-testid="nova-crianca"><Icone nome="mais" />Adicionar criança</button>
        </div>
        {lista.length === 0 ? (
          <div className="area-vazio">
            <Dupla3D pose="acenando" />
            <div><h2 className="t">Vamos cadastrar a primeira criança?</h2><p>Leva uns 2 minutos, em 3 passos.</p>
              <button className="btn grande ipe brilha" onClick={() => navegar('familia/cadastro')}><Icone nome="mais" />Cadastrar criança</button></div>
          </div>
        ) : null}
        <div className="lista-criancas">
          {lista.map(({ c, p }) => (
            <div key={c.id} className="linha-crianca">
              <AvatarMini crianca={c} tamanho={76} />
              <div>
                <b>{c.nome}</b>
                <small>{p ? FASE_POR_ID[p.faseAtual]?.titulo : 'ainda não começou'}</small>
                <div className="mini-termo" role="img" aria-label={`Termômetro da leitura: ${p?.termometro ?? 0} de 10`}>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < (p?.termometro ?? 0) ? 'cheio' : ''} />)}<em>{p?.termometro ?? 0}/10</em></div>
              </div>
              <div className="linha-botoes">
                <button className="btn" onClick={() => navegar(`familia/crianca/${c.id}`)} data-testid={`painel-${c.nome}`}><Icone nome="grafico" />Ver o painel</button>
                <button className="btn ipe" onClick={() => navegar(`c/${c.id}/vila`)}><Icone nome="tocar" />Jogar</button>
              </div>
            </div>
          ))}
        </div>
        {lista.length ? <p className="nota-mic">No painel de cada criança: termômetro da leitura, missão de 5 minutos em casa, mensagem para a família e o nível inicial.</p> : null}
      </section>
    </Area>
  );
}

/** Rota antiga "#/adulto": leva para a área de quem está com a sessão aberta. */
export function AdultoHome() {
  const conta = useConta();
  return conta.sessao()?.tipo === 'professor' ? <Professor aba="turma" /> : <FamiliaHome />;
}

/* ------------------------------ D030: como a criança está aprendendo (pares, palavras, concluído × dominado, tempo, alerta) ------------------------------ */
const segundos = (ms: number) => `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`;
const ROTULO_CATEGORIA: Record<CategoriaAlvo, string> = { fonema: 'som', grafema: 'letra', silaba: 'sílaba', palavra: 'palavra', pseudopalavra: 'palavra inventada', outro: 'item' };
const PORQUE_PAR = { som: 'sons parecidos na boca', desenho: 'letras de desenho parecido' } as const;
const ROTULO_PRATICA = { 'pre-requisito': 'Voltar um passo', 'par-confundido': 'Comparar os dois', reforco: 'Reforçar', revisao: 'Relembrar' } as const;
const ROTULO_AJUDA = { nenhuma: 'sem ajuda', repetiu: 'ouviu a pergunta de novo', contraste: 'comparou os dois sons', caminho: 'fez junto, passo a passo', 'resposta-mostrada': 'a resposta foi mostrada' } as const;

export function BlocosAprendizagem({ c, p, config }: { c: Crianca; p: Progresso; config: ConfigPlataforma }) {
  const r = useMemo(() => resumoAprendizagem(c, p, config, Date.now()), [c, p, config]);
  const semDetalhe = r.tentativas.comDetalhe === 0;
  const s = r.sondagem;
  const sondagens = (p.sondagens ?? []).slice(-3);
  const ditado = (sondagens[sondagens.length - 1]?.areas.ditado?.itens ?? []).filter((d) => d.escrito !== undefined);
  const proximaSondagem = s.devida
    ? 'Está na hora de fazer.'
    : [config.sondagem.aCadaFases > 0 ? `faltam ${Math.max(0, config.sondagem.aCadaFases - s.fasesDesde)} fases` : '', config.sondagem.aCadaDias > 0 && s.proximaEm ? `ou até ${new Date(s.proximaEm).toLocaleDateString('pt-BR')}` : ''].filter(Boolean).join(' ') || 'Sem data marcada.';
  return (
    <>
      {r.alerta.nivel !== 'nenhum' ? (
        <div className={`bloco bloco-largo alerta-adulto ${r.alerta.nivel}`} data-testid="alerta-adulto" data-nivel={r.alerta.nivel} role="status">
          <h2><Icone nome="sino" />{r.alerta.nivel === 'risco' ? `${c.nome} precisa de apoio agora` : 'Para ficar de olho'}</h2>
          <ul>{r.alerta.sinais.map((x) => <li key={x.texto} data-sinal={x.tipo}><Icone nome="olho" /><span>{x.texto}{x.sugestao ? <small className="sugestao-alerta"> {x.sugestao}</small> : null}</span></li>)}</ul>
          <details className="criterio-alerta"><summary>Como este aviso é calculado</summary><p>{r.alerta.criterio}</p></details>
          <p className="nota-mic">Isto não é diagnóstico nem nota: é um aviso para ajudar mais cedo. Se a dificuldade continuar, vale conversar com a professora.</p>
        </div>
      ) : null}

      <div className="bloco" data-testid="concluido-dominado">
        <h2><Icone nome="alvo" />Concluído × dominado</h2>
        <div className="numeros">
          <div className="numero"><b>{r.fases.concluidas}</b><small>fases concluídas</small></div>
          <div className="numero"><b data-testid="fases-dominadas">{r.fases.dominadas}</b><small>fases dominadas</small></div>
          <div className="numero"><b>{r.habilidades.dominadas}</b><small>habilidades firmes</small></div>
        </div>
        <p className="nota-mic"><b>Concluída</b>: {c.nome} fez a fase até o fim. <b>Dominada</b>: acertou sem ajuda, em atividades que o app confere, em mais de um dia. Ouvir, ver a boca, traçar e ler em voz alta contam como participação, não como domínio.</p>
        <p className="nota-mic" data-testid="tentativas-tipos">{r.tentativas.avaliadas} respostas conferidas · {r.tentativas.exposicao} vezes ouvindo, olhando ou traçando · {r.tentativas.autorrelato} leituras em voz alta (sem conferir)</p>
        {r.habilidades.aConfirmar ? <p className="nota-mic">{r.habilidades.aConfirmar} {r.habilidades.aConfirmar === 1 ? 'habilidade está' : 'habilidades estão'} "a confirmar": já foi mostrada na brincadeira, mas ainda falta acertar em atividade conferida.</p> : null}
        {r.fases.aReforcar.length ? (
          <>
            <h3>Concluídas que ainda pedem reforço</h3>
            <ul className="lista-reforco">{r.fases.aReforcar.slice(-5).reverse().map((f) => <li key={f.id}><Icone nome="repetir" /><span><b>{f.titulo}</b><small>{f.reforco.map((h) => `${h.nome}${h.falta.length ? `: falta ${h.falta[0]}` : ''}`).slice(0, 2).join(' · ')}</small></span></li>)}</ul>
          </>
        ) : r.fases.concluidas ? <p>Tudo o que foi concluído está dominado.</p> : null}
      </div>

      <div className="bloco" data-testid="confusoes">
        <h2><Icone nome="olho" />O que {c.nome} confunde</h2>
        {r.pares.length ? (
          <ul className="pares">{r.pares.slice(0, 6).map((x) => (
            <li key={x.par.join('|')} data-par={x.par.join('-')}>
              <span className="par"><b>{x.alvo}</b><i aria-hidden="true">↔</i><b>{x.escolhido}</b></span>
              <span>Quando era <b>{x.alvo}</b>, respondeu <b>{x.escolhido}</b>. <small>{x.vezes} vezes{x.conhecido ? ` · ${PORQUE_PAR[x.conhecido]}` : ''}</small></span>
            </li>
          ))}</ul>
        ) : <p>{semDetalhe ? `Ainda sem dados: aparece depois que ${c.nome} jogar as atividades de escolher e montar.` : 'Nenhuma troca repetida até agora.'}</p>}
        {r.sonsELetras.length ? (
          <>
            <h3>Sons e letras com mais erro</h3>
            <div className="fichas">{r.sonsELetras.slice(0, 8).map((x) => <span key={x.alvo} className="ficha" title={`${x.erros} de ${x.vezes} vezes`}><b>{x.alvo}</b><small>{ROTULO_CATEGORIA[x.categoria ?? 'outro']} · {x.erros}/{x.vezes}</small></span>)}</div>
          </>
        ) : null}
      </div>

      <div className="bloco" data-testid="palavras-dificeis">
        <h2><Icone nome="caderno" />Palavras difíceis</h2>
        {r.palavras.length ? (
          <ul className="dificeis">{r.palavras.slice(0, 8).map((x) => <li key={x.alvo}><b>{x.alvo}</b><small>{x.pseudo ? 'palavra inventada · ' : ''}precisou de ajuda em {x.erros} de {x.vezes} {x.vezes === 1 ? 'vez' : 'vezes'}</small></li>)}</ul>
        ) : <p>{semDetalhe ? 'Ainda sem dados: aparece depois das atividades de ler, montar e escrever palavras.' : 'Nenhuma palavra com erro até agora.'}</p>}
        <p className="nota-mic">São as palavras de verdade em que {c.nome} errou ou pediu ajuda. Boas para ler juntos em casa, sem pressa.</p>
      </div>

      {r.tiposDeErro.length ? (
        <div className="bloco" data-testid="tipos-de-erro">
          <h2><Icone nome="caderno" />Que tipo de erro aparece mais</h2>
          <ul className="dificeis">{r.tiposDeErro.slice(0, 5).map((x) => <li key={x.erro}><b>{x.nome}</b><small>{x.vezes} {x.vezes === 1 ? 'vez' : 'vezes'}{x.exemplos[0] ? ` · ex.: ${x.exemplos[0].escolhido} no lugar de ${x.exemplos[0].alvo}` : ''}</small></li>)}</ul>
          <p className="nota-mic">Mostra o jeito do erro, não uma nota. Serve para escolher o que treinar junto.</p>
        </div>
      ) : null}

      <div className="bloco" data-testid="tempo">
        <h2><Icone nome="relogio" />Tempo de resposta</h2>
        {r.tempoMedioMs ? (
          <>
            <p><b className="destaque-num">{segundos(r.tempoMedioMs)}</b> por resposta, em média.</p>
            <ul className="tempos">{r.tempos.slice(0, 4).map((t) => <li key={t.habilidade}><Icone nome="relogio" /><span>{t.nome} <small>{segundos(t.mediaMs)} · {t.itens} {t.itens === 1 ? 'resposta' : 'respostas'}</small></span></li>)}</ul>
          </>
        ) : <p>Ainda sem medida de tempo.</p>}
        <p className="nota-mic">A criança nunca vê relógio nem perde ponto por demorar. O tempo serve só para o adulto perceber onde ela ainda pensa muito antes de responder.</p>
      </div>

      <div className="bloco" data-testid="pratica-recomendada">
        <h2><Icone nome="dica" />Próxima prática recomendada</h2>
        {r.praticas.length ? (
          <ul className="praticas">{r.praticas.slice(0, 3).map((x, i) => (
            <li key={`${x.motivo}-${x.habilidade}-${i}`} data-motivo={x.motivo}>
              <Icone nome={x.motivo === 'pre-requisito' ? 'seta-esq' : 'repetir'} />
              <span><b>{ROTULO_PRATICA[x.motivo]}: {x.nomeHabilidade}</b><small>{x.paraAdulto}{x.faseId && FASE_POR_ID[x.faseId] ? ` Onde treinar: "${FASE_POR_ID[x.faseId].titulo}".` : ''}</small></span>
            </li>
          ))}</ul>
        ) : <p>Nada a reforçar agora. É só seguir a jornada.</p>}
      </div>

      <div className="bloco bloco-largo" data-testid="sondagem-periodica">
        <h2><Icone nome="placa" />Sondagem periódica</h2>
        <p>{s.ultima ? `Última: ${new Date(s.ultima.em).toLocaleDateString('pt-BR')}.` : p.expressa.sondagemEm ? `Última: ${new Date(p.expressa.sondagemEm).toLocaleDateString('pt-BR')} (sem resultado por área).` : 'Ainda não foi feita.'} Próxima: {proximaSondagem}</p>
        {sondagens.length ? (
          <div className="tabela-rolavel"><table className="sondagem-comparada" data-testid="sondagens-comparadas">
            <thead><tr><th>Área</th>{sondagens.map((x) => <th key={x.id}>{new Date(x.em).toLocaleDateString('pt-BR')}{x.tela === 'placas' || x.degrau !== undefined ? <small> (placas)</small> : null}</th>)}<th>Mudou?</th></tr></thead>
            <tbody>{AREAS_SONDAGEM.map((a) => {
              const caiu = s.quedas.find((q) => q.area === a.id);
              const med = s.evolucao.find((e) => e.area === a.id)?.medidas ?? [];
              const dif = med.length >= 2 ? med[med.length - 1].proporcao - med[med.length - 2].proporcao : undefined;
              return (
                <tr key={a.id} data-area={a.id}>
                  <td><b>{a.nome}</b><br /><small>{a.oQueMede}</small></td>
                  {sondagens.map((x) => {
                    const v = x.areas[a.id];
                    return <td key={x.id} className="num">{v && v.total ? <>{v.acertos} de {v.total}<span className="barra"><i style={{ width: `${(v.acertos / v.total) * 100}%` }} /></span></> : <small>não medida</small>}</td>;
                  })}
                  <td className={caiu ? 'caiu' : dif !== undefined && dif > 0 ? 'subiu' : ''}>{caiu ? 'caiu' : dif === undefined ? '—' : dif > 0 ? 'subiu' : dif < 0 ? 'oscilou' : 'igual'}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : null}
        {ditado.length ? (
          <>
            <h3>O que {c.nome} escreveu no ditado</h3>
            <div className="escrita-lado" data-testid="ditado-escrito">{ditado.map((d, k) => <span key={k}>{d.escrito || '(nada)'}<small>{d.acertou ? 'igual à forma certa' : `forma certa: ${d.alvo}`}</small></span>)}</div>
          </>
        ) : null}
        {s.quedas.length ? <p className="nota-mic caiu"><b>Caiu desde a sondagem anterior:</b> {s.quedas.map((q) => q.nome).join(', ')}. Vale voltar uma fase e refazer com calma, junto. Nada do que a criança ganhou se perde.</p> : null}
        <div className="linha-botoes"><button className="btn" onClick={() => navegar(`c/${c.id}/sondagem`)} data-testid="abrir-sondagem"><Icone nome="placa" />Fazer a sondagem agora</button></div>
        <p className="nota-mic">É uma brincadeira curta com 5 placas (sons das letras, leitura de palavras, nomes de bichinhos inventados, quantos sons tem a palavra e ditado), repetida a cada {config.sondagem.aCadaFases} fases ou {config.sondagem.aCadaDias} dias para comparar o antes e o agora. Só entram letras e sons que {c.nome} já estudou. A criança não vê nota nem "errado": vê só "missão cumprida". Os números são para você acompanhar a evolução, não para comparar com outras crianças. A primeira sondagem é a Missão das Placas antiga (ela decide se a criança pode ir mais rápido).</p>
      </div>

      <div className="bloco" data-testid="ajuda-graduada">
        <h2><Icone nome="dica" />Quanta ajuda precisou</h2>
        {r.ajuda.itens ? (
          <>
            <div className="ajuda-niveis">{NIVEIS_AJUDA.map((n) => <span key={n} data-nivel={n}><b>{r.ajuda.porNivel[n]}</b><small>{ROTULO_AJUDA[n]}</small></span>)}</div>
            {r.ajuda.ouviuDeNovo.comDado ? <p className="nota-mic">Pediu para ouvir de novo em {r.ajuda.ouviuDeNovo.itens} de {r.ajuda.ouviuDeNovo.comDado} respostas medidas. Ouvir de novo é bom: mostra atenção, não erro.</p> : null}
            {r.chute.chutando ? <p className="nota-mic caiu" data-testid="sinal-chute">Parece que {c.nome} anda tocando sem ouvir (respostas muito rápidas ou sempre no mesmo lugar). Jogar junto alguns minutos costuma resolver.</p> : null}
            {r.ajuda.posicoes.length > 1 ? <p className="nota-mic">A resposta certa muda de lugar a cada pergunta (sorteio): {r.ajuda.posicoes.map((n, k) => `${n} na ${k + 1}ª posição`).join(', ')}.</p> : null}
          </>
        ) : <p>Ainda sem dados.</p>}
        <p className="nota-mic">"Sem ajuda" é o que conta para dizer que a criança já sabe. Quando o app mostra a resposta, a pergunta volta depois e não conta como acerto.</p>
      </div>

      <div className="bloco" data-testid="treinos-rapidos">
        <h2><Icone nome="repetir" />Treino rápido com a Sofia</h2>
        {r.treinos.length ? (
          <ul className="praticas">{r.treinos.slice(0, 4).map((x) => (
            <li key={x.em}><Icone nome="check" /><span><b>{new Date(x.em).toLocaleDateString('pt-BR')}: {ROTULO_PRATICA[x.motivo as keyof typeof ROTULO_PRATICA] ?? 'Treino'}</b><small>{x.total} perguntas conferidas · {x.acertos} certas sem ajuda</small></span></li>
          ))}</ul>
        ) : <p>Ainda não treinou. O botão "Treino rápido" aparece na vila quando há algo para reforçar (no máximo uma vez por dia).</p>}
        <p className="nota-mic">O treino usa a "próxima prática recomendada": poucas perguntas, focadas no que {c.nome} confunde, com volta ao passo anterior quando precisa. Não dá nem tira moedinhas.</p>
      </div>
      <PainelCantinho p={p} nome={c.nome} />
    </>
  );
}

/* ------------------------------ painel da família ------------------------------ */
export function PainelFamilia({ criancaId }: { criancaId: string }) {
  const { repo, config } = useApp();
  const [dados, setDados] = useState<{ c: Crianca; p: Progresso; ev: Evento[] } | null>(null);
  const [mudando, setMudando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    (async () => {
      const c = await repo.obterCrianca(criancaId);
      if (!c) return;
      const p = (await repo.obterProgresso(criancaId)) ?? progressoInicial(criancaId, Date.now());
      setDados({ c, p, ev: await repo.listarEventos(criancaId) });
    })();
  }, [repo, criancaId]);
  const resumo = useMemo(() => (dados ? resumoFamilia(dados.c, dados.p, dados.ev, config, Date.now()) : null), [dados, config]);
  const aprend = useMemo(() => (dados ? resumoAprendizagem(dados.c, dados.p, config, Date.now()) : null), [dados, config]);
  if (!dados || !resumo || !aprend) return <Carregando />;
  const { c, p, ev } = dados;
  const nivelAtual: NivelInicial = p.nivelInicial ?? 'zero';
  const mudarNivel = async (n: NivelInicial) => {
    const novo = aplicarNivelInicial(p, n, Date.now());
    await repo.salvarProgresso(novo);
    await repo.registrarEvento({ id: novoId('ev'), criancaId, em: Date.now(), tipo: 'sondagem', texto: `Nível inicial mudado pelo adulto: ${ROTULO_NIVEL[n]}` });
    setDados({ c, p: novo, ev: await repo.listarEventos(criancaId) });
    setMudando(false);
  };
  return (
    <Area area="familia" atual="familia">
        <button className="link area-voltar" onClick={() => navegar('familia')}><Icone nome="seta-esq" />Todas as crianças</button>
        <section className="cartao painel" data-testid="painel-familia">
          <div className="painel-cab">
            <AvatarMini crianca={c} tamanho={96} />
            <div>
              <h1 className="t">{c.nome}</h1>
              <p>{resumo.nivel.nivel ? `Nível ${resumo.nivel.nivel} da jornada · ${resumo.nivel.rotulo}` : 'Começando a jornada'}</p>
            </div>
            <button className="btn" onClick={() => voz.falar(`${c.nome}: termômetro ${resumo.termometro} de 10. ${resumo.termometroTexto}`)}><Icone nome="som" />Ouvir resumo</button>
          </div>
          <div className="painel-grade">
            <div className="bloco">
              <h2><Icone nome="grafico" />Termômetro da leitura</h2>
              <Termometro valor={resumo.termometro} />
              <p>{resumo.termometroTexto}</p>
              <p className="nota-mic">O termômetro mede o que {c.nome} sabe ler (sobe só por provinha de fase). O nível da jornada mede o esforço. Nenhum dos dois é nota.</p>
              <p className="nota-mic" data-testid="teto-termometro">{aprend.termometro.explicacao}</p>
            </div>
            <div className="bloco">
              <h2><Icone nome="alvo" />Agora</h2>
              <p><b>{resumo.faseAtual.titulo}</b> — {resumo.faseAtual.objetivo}</p>
              <BarraObjetivo nivel={resumo.nivel} objetivo={resumo.faseAtual.objetivo} />
              <h3>Missão de 5 minutos em casa</h3>
              <p>{resumo.faseAtual.emCasa}</p>
            </div>
            <div className="bloco">
              <h2><Icone nome="check" />O que {c.nome} já faz</h2>
              {resumo.jaSabe.length ? <ul>{resumo.jaSabe.map((t) => <li key={t}><Icone nome="check" /><span>{t}</span></li>)}</ul> : <p>Ainda começando: cada dia de brincadeira com sons conta.</p>}
              <h3>Está aprendendo</h3>
              {resumo.aprendendo.length ? <ul>{resumo.aprendendo.map((a) => <li key={a.nome}><Icone nome="relogio" /><span>{a.nome} <small>({a.falta.slice(0, 2).join('; ')})</small></span></li>)}</ul> : <p>—</p>}
            </div>
            <BlocosAprendizagem c={c} p={p} config={config} />
            <div className="bloco">
              <h2><Icone nome="caderno" />Esta semana</h2>
              <div className="numeros">
                <div className="numero"><b>{resumo.atividadesSemana}</b><small>atividades</small></div>
                <div className="numero"><b>{resumo.sessoesSemana}</b><small>sessões</small></div>
                <div className="numero"><b>{resumo.moedinhas.saldo}</b><small>moedinhas</small></div>
              </div>
              <h3>Conquistas recentes</h3>
              <p>{resumo.selosRecentes.length ? resumo.selosRecentes.join(' · ') : '—'}</p>
              <h3>Últimas atividades</h3>
              <ul className="eventos">{ev.slice(-6).reverse().map((e) => <li key={e.id}><small>{new Date(e.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</small><span>{e.tipo === 'conquista' ? `Conquista: ${CONQUISTA_POR_ID[e.texto]?.nome ?? e.texto}` : e.texto}{e.total ? ` (${e.acertos}/${e.total})` : ''}</span></li>)}</ul>
            </div>
            <div className="bloco" data-testid="nivel-inicial">
              <h2><Icone nome="placa" />Nível inicial</h2>
              <p><b>{ROTULO_NIVEL[nivelAtual]}</b> — {NIVEIS_INICIAIS.find((n) => n.id === nivelAtual)?.resumo}</p>
              <p className="nota-mic">Você pode mudar quando quiser. Nada do que {c.nome} já fez se perde; as fases anteriores ficam abertas para revisar, com os selos ainda por conquistar.</p>
              {mudando ? (
                <div role="group" aria-label="Escolher o nível inicial">
                  {NIVEIS_INICIAIS.map((n) => (
                    <label key={n.id} className="opcao-linha">
                      <input type="radio" name="nivel-inicial" checked={nivelAtual === n.id} onChange={() => mudarNivel(n.id)} data-nivel={n.id} />
                      <span><b>{n.titulo}</b>{n.id === 'zero' ? ' (recomendado)' : ''}<br /><small>{n.resumo}</small></span>
                    </label>
                  ))}
                  <button className="btn mini" onClick={() => setMudando(false)}>Cancelar</button>
                </div>
              ) : <button className="btn" onClick={() => setMudando(true)} data-testid="mudar-nivel"><Icone nome="repetir" />Mudar o nível inicial</button>}
            </div>
          </div>
          <div className="bloco whatsapp-bloco">
            <h2><Icone nome="sino" />Mensagem para a família (exemplo, sem envio real)</h2>
            <div className="whatsapp" data-testid="whatsapp">
              <div className="wa-topo"><span className="wa-avatar">F</span><b>FONEMA</b><small>mensagem automática</small></div>
              <div className="wa-msg"><p>{resumo.mensagemWhatsApp}</p><div className="wa-botoes"><span>Ouvir</span><span>Feito!</span></div><small className="wa-hora">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>
            </div>
            <div className="linha-botoes">
              <button className="btn" onClick={() => { navigator.clipboard?.writeText(resumo.mensagemWhatsApp).then(() => setCopiado(true)).catch(() => undefined); }}><Icone nome={copiado ? 'check' : 'copiar'} />{copiado ? 'Copiado' : 'Copiar texto'}</button>
              <button className="btn" onClick={() => voz.falar(resumo.mensagemWhatsApp)}><Icone nome="som" />Ouvir</button>
            </div>
            <p className="nota-mic">Até 3 mensagens por semana, só com o primeiro nome. Nunca: áudio, foto, comparação com outras crianças, oferta de compra ou diagnóstico.</p>
          </div>
        </section>
    </Area>
  );
}

/* ------------------------------ Área do Professor: turma · fila · habilidades · palavras difíceis ------------------------------ */
export type AbaProfessor = 'turma' | 'fila' | 'habilidades' | 'palavras';
export function Professor({ aba = 'turma' }: { aba?: AbaProfessor }) {
  const { repo, config } = useApp();
  const [ds, setDs] = useState<Demonstracao[]>([]);
  const [turma, setTurma] = useState<{ crianca: Crianca; progresso: Progresso }[] | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tocando, setTocando] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const carregar = async () => {
    const cs = await repo.listarCriancas();
    setTurma(await Promise.all(cs.map(async (c) => ({ crianca: c, progresso: (await repo.obterProgresso(c.id)) ?? progressoInicial(c.id, Date.now()) }))));
    setDs(filaProfessor(await repo.listarDemonstracoes(), Date.now(), config));
    setEventos((await Promise.all(cs.map((c) => repo.listarEventos(c.id)))).flat());
  };
  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!turma) return <Carregando />;
  const nomes = Object.fromEntries(turma.map((t) => [t.crianca.id, t.crianca.nome]));
  const responder = async (d: Demonstracao, s: StatusDemonstracao) => {
    await repo.responderDemonstracao(d.id, s, Date.now());
    const p = await repo.obterProgresso(d.criancaId);
    if (p) {
      const r = avaliarConquistas(p, await repo.listarDemonstracoes(d.criancaId), Date.now());
      await repo.salvarProgresso(r.progresso);
      for (const g of r.novas) await repo.registrarEvento({ id: novoId('ev'), criancaId: d.criancaId, em: Date.now(), tipo: 'conquista', texto: g.id });
    }
    await carregar();
  };
  const mapa = mapaHabilidades(turma, config);
  const turmaDificil = dificuldadesDaTurma(turma);
  const aprendizagem = Object.fromEntries(turma.map((t) => [t.crianca.id, resumoAprendizagem(t.crianca, t.progresso, config, Date.now())]));
  const pend = ds.filter((d) => d.status === 'pendente');
  const STATUS: Record<string, [string, string]> = { aprendeu: ['check', 'Aprendeu'], treinar: ['repetir', 'Treinar mais'], explicou: ['microfone', 'Explicou certinho'], criterio: ['relogio', 'Vale o critério'] };
  // atividades (cenas) em que a turma mais precisou de ajuda — complemento das palavras difíceis de verdade (D030)
  const dificeis = (() => {
    const m = new Map<string, { texto: string; erros: number; vezes: number; criancas: Set<string> }>();
    for (const e of eventos) {
      if (e.tipo !== 'atividade' || !e.total || e.acertos === undefined || e.acertos >= e.total) continue;
      const x = m.get(e.texto) ?? { texto: e.texto, erros: 0, vezes: 0, criancas: new Set<string>() };
      x.erros += e.total - e.acertos; x.vezes++; x.criancas.add(e.criancaId);
      m.set(e.texto, x);
    }
    return [...m.values()].sort((a, b) => b.erros - a.erros).slice(0, 12);
  })();
  const rota = aba === 'turma' ? 'professor' : `professor/${aba}`;
  return (
    <Area area="professor" atual={rota}>
      {aba === 'turma' ? (
        <section className="cartao" data-testid="professor-turma">
          <div className="adulto-cab">
            <h1 className="t">Turma neste aparelho</h1>
            <button className="btn pri" onClick={() => navegar('professor/cadastro')} data-testid="novo-aluno"><Icone nome="mais" />Adicionar aluno</button>
          </div>
          {pend.length ? <button className="area-aviso" onClick={() => navegar('professor/fila')}><Icone nome="sino" /><span><b>{pend.length} {pend.length === 1 ? 'demonstração esperando' : 'demonstrações esperando'}</b> no Mostra pro professor</span><Icone nome="seta" /></button> : null}
          {turma.length === 0 ? (
            <div className="area-vazio">
              <Dupla3D pose="acenando" />
              <div><h2 className="t">Sua turma começa aqui</h2><p>Cadastre o primeiro aluno em 3 passos.</p>
                <button className="btn grande ipe brilha" onClick={() => navegar('professor/cadastro')}><Icone nome="mais" />Cadastrar aluno</button></div>
            </div>
          ) : null}
          <div className="lista-criancas">
            {[...turma].sort((a, b) => a.crianca.nome.localeCompare(b.crianca.nome)).map(({ crianca: c, progresso: p }) => (
              <Fragment key={c.id}>
              <div className="linha-crianca">
                <AvatarMini crianca={c} tamanho={64} />
                <div>
                  <b>{c.nome}</b>
                  <small>{FASE_POR_ID[p.faseAtual]?.titulo ?? 'ainda não começou'}</small>
                  <div className="mini-termo" role="img" aria-label={`Termômetro da leitura: ${p.termometro} de 10`}>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < p.termometro ? 'cheio' : ''} />)}<em>{p.termometro}/10</em></div>
                  {(() => {
                    const a = aprendizagem[c.id];
                    const par = a.pares[0];
                    return (
                      <small className="linha-aprend" data-testid={`aprend-${c.nome}`}>
                        {a.fases.concluidas} concluídas · {a.fases.dominadas} dominadas
                        {par ? <> · confunde <b>{par.alvo}</b> com <b>{par.escolhido}</b></> : null}
                        {a.alerta.nivel !== 'nenhum' ? <span className={`selo-alerta ${a.alerta.nivel}`} title={a.alerta.sinais.map((x) => x.texto).join(' ')}><Icone nome="sino" />{a.alerta.nivel === 'risco' ? 'precisa de apoio' : 'de olho'}</span> : null}
                      </small>
                    );
                  })()}
                </div>
                <div className="linha-botoes">
                  <button className="btn" onClick={() => setAberto(aberto === c.id ? null : c.id)} aria-expanded={aberto === c.id} data-testid={`painel-prof-${c.nome}`}><Icone nome="grafico" />{aberto === c.id ? 'Fechar' : 'Como está aprendendo'}</button>
                  <button className="btn ipe" onClick={() => navegar(`c/${c.id}/vila`)}><Icone nome="tocar" />Entregar o aparelho</button>
                </div>
              </div>
              {aberto === c.id ? <div className="painel painel-grade painel-aluno" data-testid={`aprendizagem-${c.nome}`}><BlocosAprendizagem c={c} p={p} config={config} /></div> : null}
              </Fragment>
            ))}
          </div>
          {turma.length ? <p className="nota-mic">Em ordem alfabética, sem ranking: serve para planejar a aula.</p> : null}
        </section>
      ) : null}

      {aba === 'fila' ? (
        <section className="cartao" data-testid="professor">
          <div className="adulto-cab">
            <h1 className="t">Mostra pro professor</h1>
            <span className="etiqueta">{pend.length} na fila</span>
          </div>
          <p className="nota-mic">Corrija em 1 toque. A criança ouve o parabéns na voz da dupla. Sem resposta em {config.demonstracao.horasParaValerCriterio} h, vale o que ela já mostrou nas atividades.</p>
          {ds.length === 0 ? <p className="area-nada">Nenhuma demonstração ainda. Quando um aluno tocar em “Mostra pro professor”, ela aparece aqui.</p> : null}
          <div className="fila">
            {ds.map((d) => (
              <div key={d.id} className={`demo ${d.status}`} data-demo={d.status}>
                <div>
                  <b>{nomes[d.criancaId] ?? '—'}</b> · {FASE_POR_ID[d.faseId]?.titulo}
                  <p>{d.descricao}</p>
                  <small><Icone nome={d.modo === 'gravacao' ? 'microfone' : 'olho'} />{d.modo === 'gravacao' ? 'gravação' : 'mostrou ao vivo'} · {new Date(d.criadaEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</small>
                </div>
                {d.audioId ? <button className="btn" onClick={async () => { const b = await repo.obterAudio(d.audioId!); if (b) { setTocando(d.id); const a = new Audio(URL.createObjectURL(b)); a.onended = () => setTocando(null); a.play(); } }}><Icone nome="tocar" />{tocando === d.id ? 'Tocando…' : 'Ouvir'}</button> : <span />}
                {d.status === 'pendente' ? (
                  <div className="um-toque">
                    <button className="btn verde" onClick={() => responder(d, 'aprendeu')} data-testid="aprendeu"><Icone nome="check" />Aprendeu!</button>
                    <button className="btn" onClick={() => responder(d, 'treinar')}><Icone nome="repetir" />Vamos treinar mais</button>
                    <button className="btn pri" onClick={() => responder(d, 'explicou')}><Icone nome="microfone" />Me explicou certinho</button>
                  </div>
                ) : <span className="status">{STATUS[d.status] ? <><Icone nome={STATUS[d.status][0]} />{STATUS[d.status][1]}</> : null}</span>}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {aba === 'habilidades' ? (
        <section className="cartao" data-testid="professor-habilidades">
          <h1 className="t">Habilidades da turma</h1>
          <p className="nota-mic">Sem ranking: ordem alfabética, estado por habilidade, só para planejar a aula.</p>
          {mapa.length === 0 ? <p className="area-nada">Cadastre um aluno para ver as habilidades.</p> : (
            <>
              <div className="tabela-rolagem">
                <table className="mapa-hab">
                  <thead><tr><th>Criança</th><th>Termômetro</th><th>Fase</th>{mapa[0]?.habilidades.map((h) => <th key={h.id} title={h.nome}>{h.nome}</th>)}</tr></thead>
                  <tbody>
                    {[...mapa].sort((a, b) => a.crianca.nome.localeCompare(b.crianca.nome)).map((l) => (
                      <tr key={l.crianca.id}><td><b>{l.crianca.nome}</b></td><td>{l.termometro}/10</td><td>{l.faseAtual}</td>{l.habilidades.map((h) => <td key={h.id} className={`hab ${h.estado}`} title={h.falta.join('; ')}><i aria-hidden="true" /><span className="sr">{h.estado}</span></td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="legenda">
                <span className="hab dominada"><i />dominada</span><span className="hab a-confirmar"><i />a confirmar</span><span className="hab aprendendo"><i />aprendendo</span><span className="hab"><i />ainda não começou</span>
              </div>
              <p className="nota-mic">Dominada: acertou sem ajuda em atividades que o app confere. A confirmar: já mostrou na brincadeira (ouvir, traçar, ler em voz alta) ou em prova, mas falta a resposta conferida.</p>
            </>
          )}
        </section>
      ) : null}

      {aba === 'palavras' ? (
        <section className="cartao" data-testid="professor-palavras">
          <h1 className="t">Palavras difíceis</h1>
          <p className="nota-mic">As palavras, os sons e as letras em que a turma mais errou ou pediu ajuda. Sem nomes: serve para retomar na roda.</p>
          {turmaDificil.semDetalhe ? <p className="area-nada" data-testid="sem-detalhe">Ainda sem palavras para mostrar: a lista se forma conforme os alunos jogam as atividades de escolher, montar e escrever.</p> : null}
          {turmaDificil.palavras.length ? (
            <>
              <h2 className="t sub">Palavras</h2>
              <ul className="dificeis" data-testid="lista-palavras">
                {turmaDificil.palavras.map((d) => <li key={d.alvo}><b>{d.alvo}</b><small>{d.pseudo ? 'palavra inventada · ' : ''}{d.criancas} {d.criancas === 1 ? 'aluno' : 'alunos'} · ajuda em {d.erros} de {d.vezes} vezes</small></li>)}
              </ul>
            </>
          ) : null}
          {turmaDificil.pares.length ? (
            <>
              <h2 className="t sub">Trocas mais comuns</h2>
              <ul className="dificeis" data-testid="lista-pares">
                {turmaDificil.pares.map((d) => <li key={d.par.join('|')}><b>{d.alvo} ↔ {d.escolhido}</b><small>{d.criancas} {d.criancas === 1 ? 'aluno' : 'alunos'} · {d.vezes} trocas{d.conhecido ? ` · ${PORQUE_PAR[d.conhecido]}` : ''}</small></li>)}
              </ul>
            </>
          ) : null}
          {turmaDificil.sonsELetras.length ? (
            <>
              <h2 className="t sub">Sons e letras</h2>
              <div className="fichas">{turmaDificil.sonsELetras.map((x) => <span key={x.alvo} className="ficha"><b>{x.alvo}</b><small>{x.criancas} {x.criancas === 1 ? 'aluno' : 'alunos'} · {x.erros}/{x.vezes}</small></span>)}</div>
            </>
          ) : null}
          {dificeis.length ? (
            <>
              <h2 className="t sub">Atividades em que a turma mais precisou de ajuda</h2>
              <ul className="dificeis" data-testid="lista-atividades">
                {dificeis.map((d) => <li key={d.texto}><b>{d.texto}</b><small>{d.criancas.size} {d.criancas.size === 1 ? 'aluno' : 'alunos'} · {d.erros} {d.erros === 1 ? 'tentativa a mais' : 'tentativas a mais'}</small></li>)}
              </ul>
            </>
          ) : null}
          {!dificeis.length && turmaDificil.semDetalhe ? null : null}
        </section>
      ) : null}
    </Area>
  );
}

/* ------------------------------ configurações (padrões do MVP) ------------------------------ */
export function Configuracoes({ area = 'familia' }: { area?: AreaId }) {
  const { configBruta, salvarConfig, repo } = useApp();
  const [msg, setMsg] = useState('');
  const [apagar, setApagar] = useState(false);
  const set = async (c: Partial<ConfigPlataforma>) => { await salvarConfig(c); setMsg('Salvo.'); };
  const exportar = async () => {
    const blob = new Blob([JSON.stringify(await repo.exportarTudo(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fonema-dados.json';
    a.click();
  };
  return (
    <Area area={area} atual={`${area}/config`}>
        <section className="cartao config">
          <div className="adulto-cab"><h1 className="t">Configurações</h1>{msg ? <span className="etiqueta verde" role="status"><Icone nome="check" />{msg}</span> : null}</div>
          <p className="passo-sub">Valem para todas as crianças deste aparelho.</p>

          <fieldset className="campo config-grupo"><legend><Icone nome="som" />Voz da Sofia e do Tales</legend>
            <label className="opcao-linha">Velocidade da fala <input type="range" min={0.7} max={1.2} step={0.05} value={configBruta.voz.velocidade} onChange={(e) => set({ voz: { ...configBruta.voz, velocidade: Number(e.target.value) } })} /> <b>{configBruta.voz.velocidade.toFixed(2)}×</b></label>
            <div className="linha-botoes">
              <button className="btn" onClick={() => voz.falar('Oi! Eu sou a Sofia.', { quem: 'sofia' })}><Icone nome="som" />Ouvir a Sofia</button>
              <button className="btn" onClick={() => voz.falar('E eu sou o Tales!', { quem: 'tales' })}><Icone nome="som" />Ouvir o Tales</button>
            </div>
          </fieldset>

          <fieldset className="campo config-grupo" data-testid="config-alfabeto"><legend><Icone nome="caderno" />Trilha do Alfabeto</legend>
            <p className="nota-mic">A jornada começa pelo alfabeto: cada letra e o som de cada letra, de A a Z. Depois vêm as sílabas, as palavras, o nome e as frases.</p>
            <label className="opcao-linha"><input type="checkbox" data-testid="primeiras-palavrinhas" checked={configBruta.alfabeto?.primeirasPalavrinhas ?? true} onChange={(e) => set({ alfabeto: { primeirasPalavrinhas: e.target.checked } })} /> Primeiras palavrinhas: juntar as letras já conhecidas e ler (BABÁ depois do B, BEBÊ depois do E…)</label>
            <p className="nota-mic" data-testid="aviso-sons-puros"><b>Sobre os sons das letras:</b> a criança ouve primeiro o som da letra ("mmm") e depois a dupla diz "M, de macaco". Os sons foram gerados por computador e conferidos por medidas; alguns ({sonsPurosPendentes().length} consoantes: {sonsPurosPendentes().map((l) => l.letra).join(', ')}) ficam melhores gravados por quem ensina. Em casa, fale o som (e não o nome da letra): "mmm", e não "eme".</p>
            <div className="linha-botoes"><button className="btn" onClick={() => navegar(`${area}/sons`)} data-testid="abrir-estudio"><Icone nome="microfone" />Gravar os sons das letras</button></div>
          </fieldset>

          <fieldset className="campo config-grupo"><legend><Icone nome="lojinha" />Lojinha de brincadeira</legend>
            <p className="nota-mic">As moedinhas só se ganham aprendendo. Nada é comprado com dinheiro de verdade.</p>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.naVila} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naVila: e.target.checked } })} /> Mostrar a Lojinha no mapa da vila</label>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.noFimDaSessao} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, noFimDaSessao: e.target.checked } })} /> Oferecer a Lojinha quando a missão do dia termina</label>
          </fieldset>

          <fieldset className="campo config-grupo"><legend><Icone nome="escudo" />Dados deste aparelho</legend>
            <p className="nota-mic">Tudo fica guardado só aqui. Você pode levar uma cópia ou apagar quando quiser.</p>
            <div className="linha-botoes">
              <button className="btn" onClick={exportar}><Icone nome="baixar" />Guardar uma cópia dos dados</button>
              {apagar ? (
                <>
                  <button className="btn terra" data-testid="confirmar-apagar" onClick={async () => { await repo.apagarTudo(); navegar(''); location.reload(); }}><Icone nome="lixeira" />Sim, apagar tudo</button>
                  <button className="btn" onClick={() => setApagar(false)}>Cancelar</button>
                </>
              ) : <button className="btn terra" onClick={() => setApagar(true)}><Icone nome="lixeira" />Apagar todos os dados</button>}
            </div>
            {apagar ? <p className="nota-mic" role="alert">Isso apaga as crianças, o progresso e as gravações deste aparelho. Não dá para desfazer.</p> : null}
          </fieldset>

          <details className="mais-opcoes" data-testid="avancado">
            <summary><Icone nome="engrenagem" />Avançado</summary>
            <fieldset className="campo"><legend>Prêmios quando a criança sobe de nível</legend>
              <label className="opcao-linha"><input type="radio" name="premios" checked={configBruta.recompensas.modo === 'surpresa'} onChange={() => set({ recompensas: { modo: 'surpresa' } })} /> <span><b>Surpresa depois da conquista</b> (recomendado): a criança vê o próximo objetivo de aprendizagem, não o prêmio.</span></label>
              <label className="opcao-linha"><input type="radio" name="premios" checked={configBruta.recompensas.modo === 'anunciada'} onChange={() => set({ recompensas: { modo: 'anunciada' } })} /> <span><b>Mostrar o prêmio antes</b>: a criança sabe o que vai ganhar.</span></label>
            </fieldset>
            <fieldset className="campo"><legend>Antes de começar cada fase</legend>
              <label className="opcao-linha"><input type="checkbox" checked={configBruta.conquistas.naEntradaDaFase} onChange={(e) => set({ conquistas: { naEntradaDaFase: e.target.checked } })} /> Mostrar as conquistas que a fase oferece</label>
              <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.naEntradaDaFase} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naEntradaDaFase: e.target.checked } })} /> Mostrar um atalho para a Lojinha (pode distrair; recomendamos desligado)</label>
            </fieldset>
            <fieldset className="campo"><legend>Para conhecer a plataforma</legend>
              <label className="opcao-linha"><input type="checkbox" checked={configBruta.modoDemonstracao} onChange={(e) => set({ modoDemonstracao: e.target.checked })} data-testid="modo-demo" /> <span><b>Modo demonstração</b>: cada fase termina em 1 sessão, para o adulto percorrer a jornada depressa. Desligue para a criança.</span></label>
            </fieldset>
            <div className="linha-botoes"><button className="btn" onClick={() => set(CONFIG_PADRAO)}><Icone nome="repetir" />Voltar ao recomendado</button></div>
          </details>
        </section>
    </Area>
  );
}
