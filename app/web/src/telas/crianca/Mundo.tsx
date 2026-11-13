import { useEffect, useMemo, useState } from 'react';
import { CONQUISTA_POR_ID, FALAS, FASES, FASE_POR_ID, REGIOES, REGIAO_POR_ID, type Fala } from '@fonema/conteudo';
import { calcularNivel, faseEmExpressa, fasesConcluidas, infoNome, podeEntrar, type Crianca, type Progresso } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Ajustes, AvatarMini, Balao, BotaoOuvir, Carregando, Moedinhas, Rosto, Topo } from '../../componentes/basicos.tsx';
import { Selo } from '../../componentes/recompensas.tsx';
import { Fundo, Icone, MapaNavegavel, type Marcador } from '../../componentes/ui.tsx';
import { asset, mundo3dDisponivel } from '../../servicos/ambiente.ts';
import { falar, falarVarias, textoTela } from '../../util.ts';

function nivelDe(p: Progresso) {
  return calcularNivel(p.desafios, p.fases['R0-F01']?.estado === 'concluida', fasesConcluidas(p));
}

/** Cenário 3D (assets/cenas) de cada cenário do conteúdo. */
export const CENA_DO_CENARIO: Record<string, string> = { quintal: 'quintal', ilha: 'ilha', farol: 'ilha', mata: 'mata', mar: 'mar', praca: 'praca', campinho: 'feira', sala: 'sala', biblioteca: 'biblioteca' };
export const cenaDe = (cenario?: string) => CENA_DO_CENARIO[cenario ?? ''] ?? 'quintal';

/** Chegada (primeira vez): "Oi, [NOME]!", com a dupla e o Bolota no portão da vila. */
export function Chegada({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const [k, setK] = useState(-1);
  useEffect(() => { if (crianca) falarVarias(FALAS.chegada, crianca, setK); }, [crianca]);
  if (!crianca || !progresso) return <Carregando />;
  return (
    <div className="tela-chegada">
      <Fundo cena="arte/hero-paisagem" desfoque={6} tom="claro" />
      <Topo crianca={crianca} titulo="Vila das Letras" />
      <main className="palco chegada">
        <img className="dupla-corpo" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales" />
        <div className="baloes">
          {FALAS.chegada.map((f, i) => <div key={i} className={i <= k ? 'aparece' : 'espera'}><Balao fala={f} crianca={crianca} /></div>)}
        </div>
        <div className="linha-botoes chegada-botoes">
          <button className="btn grande vidro" onClick={() => falarVarias(FALAS.chegada, crianca, setK)}><Icone nome="som" />Ouvir de novo</button>
          <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${criancaId}/sessao/${progresso.faseAtual}`)} data-testid="primeira-missao"><Icone nome="play" />Vamos!</button>
        </div>
      </main>
    </div>
  );
}

/** Onde cada lugar fica na arte do mapa da vila (em % da imagem). */
const LUGAR = {
  missao: { x: 51.2, y: 42 },
  casa: { x: 25.5, y: 60 },
  album: { x: 80.5, y: 36 },
  corpo: { x: 36, y: 33 },
  lojinha: { x: 66, y: 30 },
  cais: { x: 21, y: 84 },
  proxima1: { x: 79, y: 60 },
  proxima2: { x: 44.5, y: 68 },
  dupla: { x: 61, y: 70 }
};

/** MAPA DA VILA: arte isométrica em tela cheia (arrastar/pinça), pinos 3D e HUD de jogo. */
export function Vila({ criancaId }: { criancaId: string }) {
  const { config, repo } = useApp();
  const { crianca, progresso } = useCrianca(criancaId);
  const [recado, setRecado] = useState<Fala | null>(null);
  const [mundo3d, setMundo3d] = useState(false);

  useEffect(() => {
    mundo3dDisponivel().then(setMundo3d);
  }, []);

  // recado do professor (retorno do "Mostra pro professor")
  useEffect(() => {
    if (!crianca) return;
    repo.listarDemonstracoes(crianca.id).then(async (ds) => {
      const nova = ds.find((d) => d.status !== 'pendente' && d.status !== 'criterio' && !d.vista);
      if (!nova) return;
      const texto = nova.status === 'aprendeu' ? FALAS.professorAprendeu : nova.status === 'explicou' ? FALAS.professorExplicou : FALAS.professorTreinar;
      const f: Fala = { quem: 'sofia', texto };
      setRecado(f);
      falar(f, crianca);
      await repo.salvarDemonstracao({ ...nova, vista: true });
    });
  }, [crianca, repo]);

  useEffect(() => {
    if (crianca && progresso && !recado) falar(progresso.sessoesFeitas ? FALAS.voltou[0] : FALAS.chegada[0], crianca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca?.id, progresso?.sessoesFeitas]);

  if (!crianca || !progresso) return <Carregando />;
  const fase = FASE_POR_ID[progresso.faseAtual];
  const nivel = nivelDe(progresso);
  const idx = FASES.findIndex((f) => f.id === fase.id);
  const proximas = FASES.slice(idx + 1, idx + 3);
  const total = Math.min(8, nivel.custoProximo || 1);
  const feitos = Math.round(((nivel.desafiosNoNivel || 0) / (nivel.custoProximo || 1)) * total);
  const fala: Fala = recado ?? (progresso.sessoesFeitas ? FALAS.voltou[0] : { quem: 'sofia', texto: 'Oi, [NOME]! Toque na estrela para a missão de hoje.' });

  const lugar = (id: keyof typeof LUGAR, icone: string, rotulo: string, ir: string, o: number): Marcador => ({
    id, ...LUGAR[id],
    conteudo: (
      <button className="pino lugar" style={{ ['--o' as string]: o }} onClick={() => navegar(ir)} data-ponto={id} aria-label={rotulo}>
        <span className="pino-bolha"><Icone nome={icone} /></span>
        <span className="pino-rotulo">{rotulo}</span>
      </button>
    )
  });
  const marcadores: Marcador[] = [
    { id: 'dupla', ...LUGAR.dupla, conteudo: <img className="mapa-dupla" src={asset('dupla/dupla-corpo.webp')} alt="" draggable={false} /> },
    lugar('casa', 'casa', 'Minha casa', `c/${criancaId}/avatar`, 1),
    lugar('album', 'album', 'Álbum', `c/${criancaId}/album`, 2),
    lugar('corpo', 'boca', 'Conheça seu corpo', `c/${criancaId}/corpo`, 3),
    lugar('cais', 'mapa', 'Mapa das ilhas', `c/${criancaId}/mapa`, 4),
    ...(config.lojinha.naVila ? [lugar('lojinha', 'lojinha', 'Lojinha', `c/${criancaId}/lojinha`, 5)] : []),
    ...proximas.map((f, i): Marcador => ({
      id: `prox-${f.id}`, ...(i === 0 ? LUGAR.proxima1 : LUGAR.proxima2),
      conteudo: (
        <div className="pino trancado" style={{ ['--o' as string]: 6 + i }} role="img" aria-label={`Depois: ${f.titulo} (ainda trancada)`}>
          <span className="pino-bolha"><Icone nome="cadeado" /></span>
          <span className="pino-rotulo">Depois: {f.titulo}</span>
        </div>
      )
    })),
    {
      id: 'missao', ...LUGAR.missao,
      conteudo: (
        <button className="pino missao" onClick={() => navegar(`c/${criancaId}/fase/${fase.id}`)} data-ponto="missao" aria-label={`Missão de hoje: ${fase.titulo}`}>
          <span className="pino-bolha"><Icone nome="play" /></span>
          <span className="pino-rotulo">{fase.titulo}<small>Missão de hoje</small></span>
        </button>
      )
    }
  ];

  return (
    <div className="tela-vila" data-testid="vila">
      <MapaNavegavel imagem={asset('arte/mapa-vila.webp')} proporcao={2752 / 1536} marcadores={marcadores} foco={{ x: 51, y: 46 }} rotulo="Mapa da vila: arraste para passear">
        <span className="sr">{textoTela('Vila da Sofia. Toque na estrela para a missão de hoje, [NOME].', crianca)}</span>
      </MapaNavegavel>

      <div className="hud-topo">
        <div className="hud-grupo">
          <button className="hud-btn" onClick={() => navegar('')} aria-label="Sair para a tela inicial"><Icone nome="voltar" /></button>
          <button className="hud-jogador vidro" onClick={() => navegar(`c/${criancaId}/avatar`)} aria-label={`${crianca.nome}: ${nivel.nivel > 0 ? `nível ${nivel.nivel}` : 'começando'}. Mudar meu personagem`} data-testid="barra-objetivo">
            <AvatarMini crianca={crianca} tamanho={60} />
            <span>
              <b>{crianca.nome}</b>
              <small>{nivel.nivel > 0 ? `Nível ${nivel.nivel}${nivel.titulo ? ` · ${nivel.rotulo}` : ''}` : 'Começando'}</small>
              <span className="bo-bolinhas" aria-label={`Faltam ${nivel.faltam} desafios para o próximo nível`}>{Array.from({ length: total }, (_, i) => <i key={i} className={i < feitos ? 'cheia' : ''} />)}</span>
            </span>
          </button>
        </div>
        <div className="hud-grupo">
          <Moedinhas valor={progresso.moedinhas.saldo} id="cofre-topo" />
          <Ajustes />
        </div>
      </div>

      <div className="hud-base">
        <div className={`hud-fala vidro ${recado ? 'balao-destaque' : ''}`} data-quem={fala.quem}>
          <Rosto quem={fala.quem} humor={recado ? 'joinha' : 'alegre'} tamanho={68} />
          <p><b>{fala.quem === 'tales' ? 'Tales' : 'Sofia'}</b>{textoTela(fala.texto, crianca)}</p>
          <BotaoOuvir onClick={() => falar(fala, crianca)} />
        </div>
        <nav className="hud-doca vidro" aria-label="Lugares da vila">
          <button className="doca-btn" onClick={() => navegar(`c/${criancaId}/album`)}><Icone nome="album" />Álbum</button>
          {config.lojinha.naVila ? <button className="doca-btn" onClick={() => navegar(`c/${criancaId}/lojinha`)}><Icone nome="lojinha" />Lojinha</button> : null}
          <button className="doca-btn" onClick={() => navegar(`c/${criancaId}/mapa`)}><Icone nome="mapa" />Ilhas</button>
          {mundo3d ? <button className="doca-btn" onClick={() => navegar(`c/${criancaId}/mundo`)} data-ponto="mundo3d"><Icone nome="cubo" />Passear 3D</button> : null}
          <button className="btn ipe doca-missao brilha" onClick={() => navegar(`c/${criancaId}/fase/${fase.id}`)} data-testid="ir-missao"><Icone nome="play" />Missão</button>
        </nav>
      </div>
    </div>
  );
}

/** Onde cada região fica na arte do arquipélago (em % da imagem) e as ilhas futuras (com névoa e cadeado). */
const ILHA: Record<string, { x: number; y: number }> = { R0: { x: 17, y: 36 }, R1: { x: 39, y: 30 }, R2a: { x: 59, y: 33 } };
const ILHAS_FUTURAS = [{ x: 76, y: 47 }, { x: 46.5, y: 54 }, { x: 16, y: 70 }, { x: 37, y: 88 }, { x: 62.5, y: 80 }, { x: 87.5, y: 74 }, { x: 88.5, y: 27 }];

/** Mapa do arquipélago: regiões abertas por domínio; as ilhas futuras aparecem com névoa e cadeado. */
export function Arquipelago({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  const estadoRegiao = (rid: string) => {
    const fs = REGIAO_POR_ID[rid].fases;
    if (fs.every((f) => progresso.fases[f]?.estado === 'concluida')) return 'concluida';
    if (fs.some((f) => podeEntrar(progresso, f))) return 'aberta';
    return 'bloqueada';
  };
  const regiaoAtual = FASE_POR_ID[progresso.faseAtual].regiao;
  const marcadores: Marcador[] = [
    ...ILHAS_FUTURAS.map((p, i): Marcador => ({
      id: `futura-${i}`, ...p,
      conteudo: (
        <>
          <span className="nevoa" style={{ animationDelay: `${-i * 1.3}s` }} />
          <div className="pino trancado" style={{ ['--o' as string]: 4 + i }} role="img" aria-label="Ilha ainda trancada: em breve">
            <span className="pino-bolha"><Icone nome="cadeado" /></span>
            <span className="pino-rotulo">Em breve</span>
          </div>
        </>
      )
    })),
    ...REGIOES.map((r, i): Marcador => {
      const e = estadoRegiao(r.id);
      const atual = r.id === regiaoAtual && e !== 'bloqueada';
      const p = ILHA[r.id] ?? { x: r.mapa.x, y: r.mapa.y };
      return {
        id: r.id, ...p,
        conteudo: (
          <>
            {e === 'bloqueada' ? <span className="nevoa" /> : null}
            <button
              className={`pino regiao ${e === 'bloqueada' ? 'trancado' : atual ? 'missao' : 'lugar'} ${e === 'concluida' ? 'feito' : ''} ${e}`}
              style={{ ['--o' as string]: i }}
              onClick={() => e !== 'bloqueada' && navegar(`c/${criancaId}/regiao/${r.id}`)}
              aria-disabled={e === 'bloqueada'}
              aria-label={`${r.nome}: ${e === 'bloqueada' ? 'ainda trancada' : e === 'concluida' ? 'concluída' : 'aberta'}`}
              data-regiao={r.id}
            >
              <span className="pino-bolha">
                <Icone nome={e === 'bloqueada' ? 'cadeado' : atual ? 'play' : 'estrela'} />
                {e === 'concluida' ? <span className="pino-selo"><Icone nome="check" /></span> : null}
              </span>
              <span className="pino-rotulo">{r.nome.split(' · ')[0]}</span>
            </button>
          </>
        )
      };
    })
  ];
  return (
    <div className="tela-mapa">
      <MapaNavegavel imagem={asset('arte/mapa-arquipelago.webp')} proporcao={1920 / 1072} marcadores={marcadores} foco={{ x: ILHA[regiaoAtual]?.x ?? 40, y: 40 }} rotulo="Mapa das ilhas: arraste para passear" />
      <div className="hud-topo">
        <div className="hud-grupo">
          <button className="hud-btn" onClick={() => navegar(`c/${criancaId}/vila`)} aria-label="Voltar para a vila"><Icone nome="voltar" /></button>
          <div className="hud-titulo-mapa vidro">Arquipélago das Letras</div>
        </div>
        <div className="hud-grupo">
          <Moedinhas valor={progresso.moedinhas.saldo} />
          <Ajustes />
        </div>
      </div>
    </div>
  );
}

/** Trilha de fases de uma região: uma de cada vez, sem pular (D021); fases liberadas pelo nível inicial ficam abertas para revisar (D026). */
export function Regiao({ criancaId, regiaoId }: { criancaId: string; regiaoId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const r = REGIAO_POR_ID[regiaoId];
  if (!crianca || !progresso || !r) return <Carregando />;
  return (
    <div className="tela-regiao">
      <Fundo cena={cenaDe(r.cenario)} desfoque={8} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/mapa`} titulo={r.nome} />
      <main className="palco">
        <section className="cartao regiao-cartao">
          <h1 className="t">{r.nome}</h1>
          <p className="pergunta-guia">{r.perguntaGuia}</p>
          <ol className="trilha-fases">
            {r.fases.map((fid, i) => {
              const f = FASE_POR_ID[fid];
              const pf = progresso.fases[fid];
              const e = pf?.estado ?? 'bloqueada';
              const liberada = !!pf?.liberada && e === 'aberta';
              const atual = fid === progresso.faseAtual;
              return (
                <li key={fid} className={`fase-no ${liberada ? 'liberada' : e} ${atual ? 'atual' : ''}`}>
                  <button className="fase-btn" disabled={e === 'bloqueada'} onClick={() => navegar(`c/${criancaId}/fase/${fid}`)} data-fase={fid}>
                    <span className="fase-num">{e === 'concluida' ? <Icone nome="check" /> : e === 'bloqueada' ? <Icone nome="cadeado" /> : i + 1}</span>
                    <span><b>{f.titulo}</b><small>{e === 'bloqueada' ? `Depois: ${f.objetivo.toLowerCase()}` : f.objetivo}</small></span>
                    {liberada ? <em className="etiqueta">Aberta para revisar</em> : faseEmExpressa(progresso, fid) && e === 'aberta' ? <em className="etiqueta-expressa"><Icone nome="raio" />Expressa</em> : atual ? <em className="etiqueta"><Icone nome="tocar" />Agora</em> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </div>
  );
}

/** Entrada da fase: "Minhas Conquistas" da fase (brilhante × apagado com cadeado e a HABILIDADE) e começar. */
export function EntradaFase({ criancaId, faseId }: { criancaId: string; faseId: string }) {
  const { config } = useApp();
  const { crianca, progresso } = useCrianca(criancaId);
  const fase = FASE_POR_ID[faseId];
  const letra = useMemo(() => (crianca ? infoNome(crianca.nome, crianca.pronuncia.grafia).letras : 'A'), [crianca]);
  useEffect(() => { if (crianca && fase && progresso && podeEntrar(progresso, faseId)) falar({ quem: 'sofia', texto: `${fase.titulo}. ${fase.objetivo}.` }, crianca); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crianca, fase]);
  const trancada = !!progresso && !!fase && !podeEntrar(progresso, faseId);
  useEffect(() => { if (trancada) navegar(`c/${criancaId}/vila`); }, [trancada, criancaId]);
  if (!crianca || !progresso || !fase || trancada) return <Carregando />;
  const concluida = progresso.fases[faseId]?.estado === 'concluida';
  const expressa = faseEmExpressa(progresso, faseId);
  const conquistas = fase.conquistas.map((id) => CONQUISTA_POR_ID[id]).filter((c) => c && c.visivel_antes !== 'oculto');
  const cena = cenaDe(REGIAO_POR_ID[fase.regiao].cenario);
  return (
    <div className="tela-fase">
      <Fundo cena={cena} desfoque={12} tom="claro" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo={`${REGIAO_POR_ID[fase.regiao].nome}`} />
      <main className="palco">
        <section className="cartao entrada-fase">
          <div className="entrada-capa" style={{ backgroundImage: `url(${asset(`cenas/${cena}.webp`)})` }}>
            <div className="entrada-cab">
              <div>
                <p className="sobre">{REGIAO_POR_ID[fase.regiao].nome.split(' · ')[0]} · {fase.sessoesPrevistas}</p>
                <h1 className="t">{fase.titulo}</h1>
                <p className="objetivo"><Icone nome="alvo" />{fase.objetivo}</p>
              </div>
              <button className="btn enorme ipe brilha" onClick={() => navegar(`c/${criancaId}/sessao/${faseId}`)} data-testid="comecar-missao">
                <Icone nome="play" />{concluida ? 'Brincar de novo' : expressa ? 'Começar (Expressa)' : 'Começar'}
              </button>
            </div>
          </div>
          <div className="entrada-corpo">
            {config.conquistas.naEntradaDaFase ? (
              <>
                <h2 className="t">Minhas Conquistas desta fase</h2>
                <div className="grade-conquistas" data-testid="conquistas-fase">
                  {conquistas.map((c) => {
                    const g = progresso.conquistas[c.id];
                    const dica = c.visivel_antes === 'misterio' ? 'Continue a trilha para descobrir!' : c.dica;
                    return (
                      <div key={c.id} className={`conquista-item ${g ? 'ganha' : 'bloqueada'}`} data-conquista={c.id} data-estado={g ? 'ganha' : 'bloqueada'}>
                        <Selo conquista={c} ganha={g} bloqueado={!g} letra={letra} tamanho={124} />
                        {!g ? <p className="dica-cadeado">{dica}</p> : <p className="dica-cadeado ok">Conquistado!</p>}
                        {!g ? <button className="ouvir-mini" aria-label="Ouvir a dica" onClick={() => falar({ quem: 'sofia', texto: dica }, crianca)}><Icone nome="som" /></button> : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
            {config.lojinha.naEntradaDaFase ? <div className="linha-botoes"><button className="btn" onClick={() => navegar(`c/${criancaId}/lojinha`)}><Icone nome="lojinha" />Lojinha</button></div> : null}
            <p className="nota-mic">Em casa (para o adulto): {fase.emCasa}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export function textoNivel(c: Crianca, p: Progresso): string {
  const n = nivelDe(p);
  return textoTela(n.nivel ? `Nível ${n.nivel} · ${n.rotulo}` : 'Começando', c);
}
