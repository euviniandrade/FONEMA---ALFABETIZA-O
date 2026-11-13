import { useEffect, useMemo, useState } from 'react';
import { CONQUISTA_POR_ID, FALAS, FASE_POR_ID, REGIOES, REGIAO_POR_ID, type Fala } from '@fonema/conteudo';
import { calcularNivel, faseEmExpressa, fasesConcluidas, infoNome, podeEntrar, type Crianca, type Progresso } from '@fonema/motor';
import { useApp, useCrianca } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarGrande, Balao, Carregando, Topo } from '../../componentes/basicos.tsx';
import { BarraObjetivo, Selo } from '../../componentes/recompensas.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { falar, falarVarias, textoTela } from '../../util.ts';

function nivelDe(p: Progresso) {
  return calcularNivel(p.desafios, p.fases['R0-F01']?.estado === 'concluida', fasesConcluidas(p));
}

/** Chegada (primeira vez): "Oi, [NOME]!", com a dupla e o Bolota no portão da vila. */
export function Chegada({ criancaId }: { criancaId: string }) {
  const { crianca } = useCrianca(criancaId);
  const [k, setK] = useState(-1);
  useEffect(() => { if (crianca) falarVarias(FALAS.chegada, crianca, setK); }, [crianca]);
  if (!crianca) return <Carregando />;
  return (
    <div className="tela-chegada">
      <img className="cenario" src={asset('fundos/quintal.webp')} alt="" />
      <Topo crianca={crianca} titulo="Vila das Letras" />
      <main className="palco chegada">
        <img className="dupla-corpo" src={asset('dupla/dupla-corpo.webp')} alt="Sofia e Tales acenando" />
        <div className="baloes">
          {FALAS.chegada.map((f, i) => <div key={i} className={i <= k ? 'aparece' : 'espera'}><Balao fala={f} crianca={crianca} /></div>)}
        </div>
        <div className="linha-botoes chegada-botoes">
          <button className="btn grande" onClick={() => falarVarias(FALAS.chegada, crianca, setK)}>🔊 Ouvir de novo</button>
          <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/sessao/R0-F01`)} data-testid="primeira-missao">Vamos! →</button>
        </div>
      </main>
    </div>
  );
}

interface Ponto { id: string; x: number; y: number; rotulo: string; icone: string; ir: string; destaque?: boolean }

/** MAPA DA VILA (2D sobre a arte do mundo 3D; o 3D explorável entra em #/c/:id/mundo quando existir). */
export function Vila({ criancaId }: { criancaId: string }) {
  const { config, repo } = useApp();
  const { crianca, progresso } = useCrianca(criancaId);
  const [recado, setRecado] = useState<Fala | null>(null);
  const [mundo3d, setMundo3d] = useState(false);

  useEffect(() => {
    fetch('./mundo3d/index.html', { cache: 'no-store' }).then((r) => setMundo3d(r.ok && (r.headers.get('content-type') ?? '').includes('html'))).catch(() => undefined);
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
  const pontos: Ponto[] = [
    { id: 'missao', x: 47, y: 46, rotulo: `Missão: ${fase.titulo}`, icone: '⭐', ir: `c/${criancaId}/fase/${fase.id}`, destaque: true },
    { id: 'casa', x: 30, y: 42, rotulo: 'Minha casa', icone: '🏠', ir: `c/${criancaId}/avatar` },
    { id: 'biblioteca', x: 58, y: 33, rotulo: 'Álbum de Conquistas', icone: '🏅', ir: `c/${criancaId}/album` },
    { id: 'escola', x: 43, y: 29, rotulo: 'Conheça seu corpo', icone: '👄', ir: `c/${criancaId}/corpo` },
    { id: 'cais', x: 82, y: 82, rotulo: 'Mapa das ilhas', icone: '🗺️', ir: `c/${criancaId}/mapa` }
  ];
  if (config.lojinha.naVila) pontos.push({ id: 'lojinha', x: 68, y: 46, rotulo: 'Lojinha', icone: '🛒', ir: `c/${criancaId}/lojinha` });
  if (mundo3d) pontos.push({ id: 'mundo3d', x: 16, y: 18, rotulo: 'Explorar em 3D', icone: '🧭', ir: `c/${criancaId}/mundo` });

  return (
    <div className="tela-vila" data-testid="vila">
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} titulo="Vila da Sofia">
        <BarraObjetivo nivel={nivel} objetivo={fase.objetivo} compacta />
      </Topo>
      <main className="mapa-palco">
        <div className="mapa" style={{ backgroundImage: `url(${asset('fundos/vila.webp')})` }}>
          {pontos.map((p) => (
            <button key={p.id} className={`ponto ${p.destaque ? 'destaque' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={() => navegar(p.ir)} data-ponto={p.id}>
              <span className="ponto-icone" aria-hidden="true">{p.icone}</span>
              <span className="ponto-rotulo">{p.rotulo}</span>
            </button>
          ))}
        </div>
        <aside className="vila-lado">
          <AvatarGrande crianca={crianca} itens={progresso.equipados} />
          <p className="vila-nome t">{crianca.nome}</p>
          {recado ? <Balao fala={recado} crianca={crianca} destaque /> : <Balao fala={progresso.sessoesFeitas ? FALAS.voltou[0] : { quem: 'sofia', texto: 'Oi, [NOME]! Toque na estrela para a missão de hoje.' }} crianca={crianca} />}
          <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/fase/${fase.id}`)} data-testid="ir-missao">⭐ Missão de hoje</button>
          {!mundo3d ? <p className="nota-mic">Mapa 2D. O mundo 3D explorável entra aqui quando estiver pronto.</p> : null}
        </aside>
      </main>
    </div>
  );
}

/** Mapa do arquipélago: regiões R0–R2a abertas por domínio; as outras ilhas aparecem com cadeado. */
export function Arquipelago({ criancaId }: { criancaId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  if (!crianca || !progresso) return <Carregando />;
  const estadoRegiao = (rid: string) => {
    const fs = REGIAO_POR_ID[rid].fases;
    if (fs.every((f) => progresso.fases[f]?.estado === 'concluida')) return 'concluida';
    if (fs.some((f) => podeEntrar(progresso, f))) return 'aberta';
    return 'bloqueada';
  };
  return (
    <div className="tela-mapa">
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/vila`} titulo="Arquipélago das Letras" />
      <main className="mapa-palco so-mapa">
        <div className="mapa" style={{ backgroundImage: `url(${asset('fundos/mapa-arquipelago.webp')})` }}>
          {REGIOES.map((r) => {
            const e = estadoRegiao(r.id);
            return (
              <button key={r.id} className={`ponto regiao ${e}`} style={{ left: `${r.mapa.x}%`, top: `${r.mapa.y}%` }} onClick={() => e !== 'bloqueada' && navegar(`c/${criancaId}/regiao/${r.id}`)} aria-disabled={e === 'bloqueada'} data-regiao={r.id}>
                <span className="ponto-icone" aria-hidden="true">{e === 'concluida' ? '★' : e === 'aberta' ? '▶' : '🔒'}</span>
                <span className="ponto-rotulo">{r.nome}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/** Trilha de fases de uma região: uma de cada vez, sem pular (D021). */
export function Regiao({ criancaId, regiaoId }: { criancaId: string; regiaoId: string }) {
  const { crianca, progresso } = useCrianca(criancaId);
  const r = REGIAO_POR_ID[regiaoId];
  if (!crianca || !progresso || !r) return <Carregando />;
  return (
    <div className="tela-regiao">
      <img className="cenario" src={asset(`fundos/${r.cenario}.webp`)} alt="" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/mapa`} titulo={r.nome} />
      <main className="palco">
        <section className="cartao">
          <h1 className="t">{r.nome}</h1>
          <p className="pergunta-guia">{r.perguntaGuia}</p>
          <ol className="trilha-fases">
            {r.fases.map((fid, i) => {
              const f = FASE_POR_ID[fid];
              const e = progresso.fases[fid]?.estado ?? 'bloqueada';
              return (
                <li key={fid} className={`fase-no ${e}`}>
                  <button className="btn fase-btn" disabled={e === 'bloqueada'} onClick={() => navegar(`c/${criancaId}/fase/${fid}`)} data-fase={fid}>
                    <span className="fase-num">{e === 'concluida' ? '★' : e === 'bloqueada' ? '🔒' : i + 1}</span>
                    <span><b>{f.titulo}</b><small>{e === 'bloqueada' ? `Depois: ${f.objetivo.toLowerCase()}` : f.objetivo}</small></span>
                    {faseEmExpressa(progresso, fid) && e === 'aberta' ? <em className="etiqueta-expressa">⚡ Expressa</em> : null}
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
  useEffect(() => { if (crianca && fase) falar({ quem: 'sofia', texto: `${fase.titulo}. ${fase.objetivo}.` }, crianca); }, [crianca, fase]);
  if (!crianca || !progresso || !fase) return <Carregando />;
  if (!podeEntrar(progresso, faseId)) {
    navegar(`c/${criancaId}/vila`);
    return null;
  }
  const concluida = progresso.fases[faseId]?.estado === 'concluida';
  const expressa = faseEmExpressa(progresso, faseId);
  const conquistas = fase.conquistas.map((id) => CONQUISTA_POR_ID[id]).filter((c) => c && c.visivel_antes !== 'oculto');
  return (
    <div className="tela-fase">
      <img className="cenario" src={asset(`fundos/${REGIAO_POR_ID[fase.regiao].cenario}.webp`)} alt="" />
      <Topo crianca={crianca} moedinhas={progresso.moedinhas.saldo} voltar={`c/${criancaId}/regiao/${fase.regiao}`} titulo={`${REGIAO_POR_ID[fase.regiao].nome}`} />
      <main className="palco">
        <section className="cartao entrada-fase">
          <div className="entrada-cab">
            <div>
              <p className="sobre">{fase.id} · {fase.sessoesPrevistas}</p>
              <h1 className="t">{fase.titulo}</h1>
              <p className="objetivo">🎯 {fase.objetivo}</p>
            </div>
            <button className="btn grande ipe" onClick={() => navegar(`c/${criancaId}/sessao/${faseId}`)} data-testid="comecar-missao">
              {concluida ? '↺ Brincar de novo' : expressa ? '⚡ Começar (Trilha Expressa)' : '▶ Começar missão'}
            </button>
          </div>
          {config.conquistas.naEntradaDaFase ? (
            <>
              <h2 className="t">🏅 Minhas Conquistas desta fase</h2>
              <div className="grade-conquistas" data-testid="conquistas-fase">
                {conquistas.map((c) => {
                  const g = progresso.conquistas[c.id];
                  return (
                    <div key={c.id} className={`conquista-item ${g ? 'ganha' : 'bloqueada'}`} data-conquista={c.id} data-estado={g ? 'ganha' : 'bloqueada'}>
                      <Selo conquista={c} ganha={g} bloqueado={!g} letra={letra} tamanho={120} />
                      {!g ? <p className="dica-cadeado"><span aria-hidden="true">🔒</span> {c.visivel_antes === 'misterio' ? 'Continue a trilha para descobrir!' : c.dica}</p> : <p className="dica-cadeado ok">Conquistado!</p>}
                      {!g ? <button className="ouvir-mini" aria-label="Ouvir a dica" onClick={() => falar({ quem: 'sofia', texto: c.visivel_antes === 'misterio' ? 'Continue a trilha para descobrir!' : c.dica }, crianca)}>🔊</button> : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
          {config.lojinha.naEntradaDaFase ? <button className="btn" onClick={() => navegar(`c/${criancaId}/lojinha`)}>🛒 Lojinha</button> : null}
          <p className="nota-mic">Em casa (para o adulto): {fase.emCasa}</p>
        </section>
      </main>
    </div>
  );
}

export function textoNivel(c: Crianca, p: Progresso): string {
  const n = nivelDe(p);
  return textoTela(n.nivel ? `Nível ${n.nivel} · ${n.rotulo}` : 'Começando', c);
}
