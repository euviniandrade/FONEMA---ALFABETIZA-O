import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONFIG_PADRAO, CONQUISTA_POR_ID, FASE_POR_ID, type ConfigPlataforma } from '@fonema/conteudo';
import { avaliarConquistas, calcularNivel, fasesConcluidas as fasesConcluidasDe, filaProfessor, mapaHabilidades, progressoInicial, resumoFamilia, type Crianca, type Demonstracao, type Evento, type Progresso, type StatusDemonstracao } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { AvatarMini, Carregando, Logo, Topo } from '../../componentes/basicos.tsx';
import { IcCadeado, IcMais, IcMusica, IcSeta } from '../../componentes/icones.tsx';
import { BarraObjetivo, Termometro } from '../../componentes/recompensas.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';

/* ------------------------------ porteira parental ------------------------------ */
const CHAVE = 'fonema-adulto-ate';
export function adultoLiberado(): boolean {
  return Number(sessionStorage.getItem(CHAVE) ?? 0) > Date.now();
}
export function Porteira({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(adultoLiberado);
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6));
  const [b] = useState(() => 4 + Math.floor(Math.random() * 5));
  const [r, setR] = useState('');
  if (ok) return <>{children}</>;
  return (
    <div className="tela-adulto">
      <Topo voltar="" titulo="Área do adulto" />
      <main className="palco adulto">
        <section className="cartao form-adulto porteira">
          <h1 className="t">Área do adulto</h1>
          <p>Para entrar, responda: quanto é <b data-testid="conta">{a} × {b}</b>?</p>
          <form onSubmit={(e) => { e.preventDefault(); if (Number(r) === a * b) { sessionStorage.setItem(CHAVE, String(Date.now() + 20 * 60_000)); setOk(true); } }}>
            <input inputMode="numeric" value={r} onChange={(e) => setR(e.target.value)} aria-label="Resposta" data-testid="resposta-porteira" />
            <button className="btn grande pri" type="submit" data-testid="entrar-adulto">Entrar</button>
          </form>
          <p className="nota-mic">A porteira evita que a criança mude configurações sem querer.</p>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ início (quem vai aprender?) ------------------------------ */
/** Tela inicial: arte 3D da vila em tela cheia, dupla em destaque, perfis como cartões e a Área do adulto discreta. */
export function Inicio() {
  const { repo, pronto } = useApp();
  const [perfis, setPerfis] = useState<{ c: Crianca; p?: Progresso }[] | null>(null);
  const [musica, setMusica] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  useEffect(() => {
    repo.listarCriancas().then(async (cs) => setPerfis(await Promise.all(cs.map(async (c) => ({ c, p: await repo.obterProgresso(c.id) })))));
  }, [repo]);
  useEffect(() => () => audio.current?.pause(), []);
  const alternarMusica = () => {
    if (!audio.current) { audio.current = new Audio(asset('audio/musica-vogais.mp3')); audio.current.loop = true; audio.current.volume = 0.25; }
    if (musica) audio.current.pause(); else audio.current.play().catch(() => undefined);
    setMusica(!musica);
  };
  const mover = (e: React.PointerEvent) => {
    const r = palco.current?.getBoundingClientRect();
    if (!r) return;
    palco.current!.style.setProperty('--px', String((e.clientX - r.left) / r.width - 0.5));
    palco.current!.style.setProperty('--py', String((e.clientY - r.top) / r.height - 0.5));
  };
  if (!pronto || !perfis) return <Carregando />;
  const entrar = (c: Crianca) => { voz.definirNome(c.pronuncia.fala); navegar(`c/${c.id}/mundo`); };
  return (
    <div className="tela-inicio" ref={palco} onPointerMove={mover}>
      <div className="inicio-fundo" aria-hidden="true"><img src={asset('fundos/vila.webp')} alt="" /></div>
      <div className="inicio-veu" aria-hidden="true" />
      <header className="inicio-topo">
        <Logo grande subtitulo="aprender a ler com a Sofia e o Tales" />
        <div className="inicio-acoes">
          <button className={`chip ${musica ? 'ativo' : ''}`} onClick={alternarMusica} aria-pressed={musica} title="Música ambiente"><IcMusica tamanho={22} ligado={musica} /> <span>Música</span></button>
          <button className="chip" onClick={() => navegar(perfis.length ? 'adulto' : 'adulto/cadastro')} data-testid="area-adulto"><IcCadeado tamanho={22} /> <span>Área do adulto</span></button>
        </div>
      </header>
      <main className="inicio-palco">
        <section className="inicio-texto">
          <p className="inicio-sobre entra" style={{ animationDelay: '.1s' }}>Vila das Letras</p>
          <h1 className="inicio-titulo entra" style={{ animationDelay: '.2s' }}>{perfis.length ? 'Quem vai aprender hoje?' : 'Vamos aprender a ler juntos?'}</h1>
          {perfis.length ? (
            <div className="perfis">
              {perfis.map(({ c, p }, i) => {
                const n = p ? calcularNivel(p.desafios, p.fases['R0-F01']?.estado === 'concluida', fasesConcluidasDe(p)) : null;
                return (
                  <button key={c.id} className="perfil entra" style={{ animationDelay: `${0.3 + i * 0.08}s` }} onClick={() => entrar(c)} data-perfil={c.nome}>
                    <AvatarMini crianca={c} tamanho={92} />
                    <span className="perfil-txt"><b>{c.nome}</b><small>{n && n.nivel ? `${n.titulo} ${n.sub} · nível ${n.nivel}` : 'Começando a aventura'}</small></span>
                    <span className="perfil-seta" aria-hidden="true"><IcSeta tamanho={26} /></span>
                  </button>
                );
              })}
              <button className="perfil perfil-novo entra" style={{ animationDelay: `${0.3 + perfis.length * 0.08}s` }} onClick={() => navegar('adulto/cadastro')}>
                <span className="perfil-mais" aria-hidden="true"><IcMais tamanho={34} /></span>
                <span className="perfil-txt"><b>Nova criança</b><small>O adulto cadastra em 2 minutos</small></span>
              </button>
            </div>
          ) : (
            <>
              <p className="inicio-sub entra" style={{ animationDelay: '.3s' }}>Sons, letras, histórias e muitas descobertas na Vila das Letras. Um adulto começa o cadastro e depois entrega o aparelho para a criança.</p>
              <button className="btn-brilho entra" style={{ animationDelay: '.4s' }} onClick={() => navegar('adulto/cadastro')} data-testid="comecar-aventura">
                Começar a aventura <IcSeta tamanho={30} />
              </button>
            </>
          )}
          <p className="inicio-nota entra" style={{ animationDelay: '.6s' }}>Funciona sem internet. Os dados ficam neste aparelho.</p>
        </section>
        <div className="inicio-dupla" aria-hidden="true">
          <div className="dupla-sombra" />
          <img className="dupla-idle" src={asset('dupla/dupla-corpo.webp')} alt="" />
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ painel do adulto ------------------------------ */
export function AdultoHome() {
  const { repo } = useApp();
  const [lista, setLista] = useState<{ c: Crianca; p?: Progresso }[] | null>(null);
  useEffect(() => {
    repo.listarCriancas().then(async (cs) => setLista(await Promise.all(cs.map(async (c) => ({ c, p: await repo.obterProgresso(c.id) })))));
  }, [repo]);
  if (!lista) return <Carregando />;
  return (
    <div className="tela-adulto">
      <Topo voltar="" titulo="Área do adulto" />
      <main className="palco adulto">
        <section className="cartao">
          <h1 className="t">Crianças deste aparelho</h1>
          <div className="lista-criancas">
            {lista.map(({ c, p }) => (
              <div key={c.id} className="linha-crianca">
                <AvatarMini crianca={c} tamanho={64} />
                <div><b>{c.nome}</b><small>{p ? FASE_POR_ID[p.faseAtual]?.titulo : 'ainda não começou'} · termômetro {p?.termometro ?? 0}/10</small></div>
                <div className="linha-botoes">
                  <button className="btn" onClick={() => navegar(`adulto/familia/${c.id}`)} data-testid={`painel-${c.nome}`}>📊 Painel da família</button>
                  <button className="btn" onClick={() => navegar(`c/${c.id}/sondagem`)}>🪧 Sondagem</button>
                  <button className="btn" onClick={() => navegar(`c/${c.id}/mundo`)}>▶ Entrar como {c.nome}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="linha-botoes">
            <button className="btn grande pri" onClick={() => navegar('adulto/cadastro')} data-testid="nova-crianca">＋ Cadastrar criança</button>
            <button className="btn grande" onClick={() => navegar('adulto/professor')} data-testid="visao-professor">🧑‍🏫 Visão do professor</button>
            <button className="btn grande" onClick={() => navegar('adulto/config')}>⚙️ Configurações</button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ painel da família ------------------------------ */
export function PainelFamilia({ criancaId }: { criancaId: string }) {
  const { repo, config } = useApp();
  const [dados, setDados] = useState<{ c: Crianca; p: Progresso; ev: Evento[] } | null>(null);
  useEffect(() => {
    (async () => {
      const c = await repo.obterCrianca(criancaId);
      if (!c) return;
      const p = (await repo.obterProgresso(criancaId)) ?? progressoInicial(criancaId, Date.now());
      setDados({ c, p, ev: await repo.listarEventos(criancaId) });
    })();
  }, [repo, criancaId]);
  const resumo = useMemo(() => (dados ? resumoFamilia(dados.c, dados.p, dados.ev, config, Date.now()) : null), [dados, config]);
  if (!dados || !resumo) return <Carregando />;
  const { c, ev } = dados;
  return (
    <div className="tela-adulto">
      <Topo voltar="adulto" titulo="Painel da família" />
      <main className="palco adulto">
        <section className="cartao painel" data-testid="painel-familia">
          <div className="painel-cab">
            <AvatarMini crianca={c} tamanho={88} />
            <div>
              <h1 className="t">{c.nome}</h1>
              <p>{resumo.nivel.nivel ? `Nível ${resumo.nivel.nivel} da jornada · ${resumo.nivel.rotulo}` : 'Começando a jornada'}</p>
            </div>
            <button className="btn" onClick={() => voz.falar(`${c.nome}: termômetro ${resumo.termometro} de 10. ${resumo.termometroTexto}`)}>🔊 Ouvir resumo</button>
          </div>
          <div className="painel-grade">
            <div className="bloco">
              <h2>Termômetro da leitura</h2>
              <Termometro valor={resumo.termometro} />
              <p>{resumo.termometroTexto}</p>
              <p className="nota-mic">O termômetro mede o que {c.nome} sabe ler (sobe só por provinha de fase). O nível da jornada mede o esforço. Nenhum dos dois é nota.</p>
            </div>
            <div className="bloco">
              <h2>Agora</h2>
              <p><b>{resumo.faseAtual.titulo}</b> — {resumo.faseAtual.objetivo}</p>
              <BarraObjetivo nivel={resumo.nivel} objetivo={resumo.faseAtual.objetivo} />
              <h3>Missão de 5 minutos em casa</h3>
              <p>{resumo.faseAtual.emCasa}</p>
            </div>
            <div className="bloco">
              <h2>O que {c.nome} já faz</h2>
              {resumo.jaSabe.length ? <ul>{resumo.jaSabe.map((t) => <li key={t}>✓ {t}</li>)}</ul> : <p>Ainda começando: cada dia de brincadeira com sons conta.</p>}
              <h3>Está aprendendo</h3>
              {resumo.aprendendo.length ? <ul>{resumo.aprendendo.map((a) => <li key={a.nome}>{a.nome} <small>({a.falta.slice(0, 2).join('; ')})</small></li>)}</ul> : <p>—</p>}
            </div>
            <div className="bloco">
              <h2>Esta semana</h2>
              <p><b>{resumo.atividadesSemana}</b> atividades · <b>{resumo.sessoesSemana}</b> sessões · cofrinho: <b>{resumo.moedinhas.saldo}</b> moedinhas</p>
              <h3>Conquistas recentes</h3>
              <p>{resumo.selosRecentes.length ? resumo.selosRecentes.join(' · ') : '—'}</p>
              <h3>Últimas atividades</h3>
              <ul className="eventos">{ev.slice(-6).reverse().map((e) => <li key={e.id}><small>{new Date(e.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</small> {e.tipo === 'conquista' ? `🏅 ${CONQUISTA_POR_ID[e.texto]?.nome ?? e.texto}` : e.texto}{e.total ? ` (${e.acertos}/${e.total})` : ''}</li>)}</ul>
            </div>
          </div>
          <div className="bloco whatsapp-bloco">
            <h2>Mensagem para a família (exemplo, sem envio real)</h2>
            <div className="whatsapp" data-testid="whatsapp">
              <div className="wa-topo"><span className="wa-avatar">F</span><b>FONEMA</b><small>mensagem automática</small></div>
              <div className="wa-msg"><p>{resumo.mensagemWhatsApp}</p><div className="wa-botoes"><span>▶ Ouvir</span><span>✓ Feito!</span></div><small className="wa-hora">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓</small></div>
            </div>
            <div className="linha-botoes">
              <button className="btn" onClick={() => navigator.clipboard?.writeText(resumo.mensagemWhatsApp)}>📋 Copiar texto</button>
              <button className="btn" onClick={() => voz.falar(resumo.mensagemWhatsApp)}>🔊 Ouvir</button>
            </div>
            <p className="nota-mic">Até 3 mensagens por semana, só com o primeiro nome. Nunca: áudio, foto, comparação com outras crianças, oferta de compra ou diagnóstico.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ visão do professor ------------------------------ */
export function Professor() {
  const { repo, config } = useApp();
  const [ds, setDs] = useState<Demonstracao[]>([]);
  const [turma, setTurma] = useState<{ crianca: Crianca; progresso: Progresso }[]>([]);
  const [tocando, setTocando] = useState<string | null>(null);
  const carregar = async () => {
    const cs = await repo.listarCriancas();
    setTurma(await Promise.all(cs.map(async (c) => ({ crianca: c, progresso: (await repo.obterProgresso(c.id)) ?? progressoInicial(c.id, Date.now()) }))));
    setDs(filaProfessor(await repo.listarDemonstracoes(), Date.now(), config));
  };
  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const pend = ds.filter((d) => d.status === 'pendente');
  return (
    <div className="tela-adulto">
      <Topo voltar="adulto" titulo="Visão do professor" />
      <main className="palco adulto">
        <section className="cartao" data-testid="professor">
          <h1 className="t">Mostra pro professor · fila ({pend.length})</h1>
          <p className="nota-mic">Corrija em 1 toque. A criança ouve "Parabéns, [nome]!" na voz da dupla. Sem resposta em {config.demonstracao.horasParaValerCriterio} h, vale o critério de domínio.</p>
          {ds.length === 0 ? <p>Nenhuma demonstração ainda.</p> : null}
          <div className="fila">
            {ds.map((d) => (
              <div key={d.id} className={`demo ${d.status}`} data-demo={d.status}>
                <div><b>{nomes[d.criancaId] ?? '—'}</b> · {FASE_POR_ID[d.faseId]?.titulo}<p>{d.descricao}</p><small>{d.modo === 'gravacao' ? '🎙️ gravação' : '👀 mostrou ao vivo'} · {new Date(d.criadaEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</small></div>
                {d.audioId ? <button className="btn" onClick={async () => { const b = await repo.obterAudio(d.audioId!); if (b) { setTocando(d.id); const a = new Audio(URL.createObjectURL(b)); a.onended = () => setTocando(null); a.play(); } }}>{tocando === d.id ? '…' : '▶ Ouvir'}</button> : null}
                {d.status === 'pendente' ? (
                  <div className="um-toque">
                    <button className="btn verde" onClick={() => responder(d, 'aprendeu')} data-testid="aprendeu">✓ Aprendeu!</button>
                    <button className="btn" onClick={() => responder(d, 'treinar')}>↺ Vamos treinar mais</button>
                    <button className="btn pri" onClick={() => responder(d, 'explicou')}>🎤 Me explicou certinho</button>
                  </div>
                ) : <span className="status">{{ aprendeu: '✓ Aprendeu', treinar: '↺ Treinar mais', explicou: '🎤 Explicou certinho', criterio: '⏱ Vale o critério', pendente: '' }[d.status]}</span>}
              </div>
            ))}
          </div>
          <h2 className="t">Turma neste aparelho · habilidades</h2>
          <p className="nota-mic">Sem ranking (P2-b): ordem alfabética, estado por habilidade, só para planejar a aula.</p>
          <div className="tabela-rolagem">
            <table className="mapa-hab">
              <thead><tr><th>Criança</th><th>Termômetro</th><th>Fase</th>{mapa[0]?.habilidades.map((h) => <th key={h.id} title={h.nome}>{h.nome}</th>)}</tr></thead>
              <tbody>
                {[...mapa].sort((a, b) => a.crianca.nome.localeCompare(b.crianca.nome)).map((l) => (
                  <tr key={l.crianca.id}><td><b>{l.crianca.nome}</b></td><td>{l.termometro}/10</td><td>{l.faseAtual}</td>{l.habilidades.map((h) => <td key={h.id} className={`hab ${h.estado}`} title={h.falta.join('; ')}>{h.estado === 'dominada' ? '●' : h.estado === 'aprendendo' ? '◐' : '·'}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="nota-mic">● dominada · ◐ aprendendo · · ainda não começou</p>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ configurações (padrões do MVP) ------------------------------ */
export function Configuracoes() {
  const { configBruta, salvarConfig, repo } = useApp();
  const [msg, setMsg] = useState('');
  const set = async (c: Partial<ConfigPlataforma>) => { await salvarConfig(c); setMsg('Salvo.'); };
  const exportar = async () => {
    const blob = new Blob([JSON.stringify(await repo.exportarTudo(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fonema-dados.json';
    a.click();
  };
  return (
    <div className="tela-adulto">
      <Topo voltar="adulto" titulo="Configurações" />
      <main className="palco adulto">
        <section className="cartao form-adulto">
          <h1 className="t">Configurações</h1>
          <p className="nota-mic">Padrões PROVISÓRIOS do MVP até as respostas do dono (docs/revisao/04-perguntas-para-o-dono.md). O arquivo de padrões é packages/conteudo/src/config.ts.</p>
          <fieldset className="campo"><legend>P1 · Prêmios de nível</legend>
            <label><input type="radio" checked={configBruta.recompensas.modo === 'surpresa'} onChange={() => set({ recompensas: { modo: 'surpresa' } })} /> Surpresa depois da conquista; a barra mostra o próximo objetivo de aprendizagem (P1-b, recomendado)</label>
            <label><input type="radio" checked={configBruta.recompensas.modo === 'anunciada'} onChange={() => set({ recompensas: { modo: 'anunciada' } })} /> Anunciar o prêmio antes (P1-a)</label>
          </fieldset>
          <fieldset className="campo"><legend>P7 · Onde aparecem a Lojinha e as Conquistas</legend>
            <label><input type="checkbox" checked={configBruta.lojinha.naVila} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naVila: e.target.checked } })} /> Lojinha na vila</label>
            <label><input type="checkbox" checked={configBruta.lojinha.noFimDaSessao} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, noFimDaSessao: e.target.checked } })} /> Lojinha no fim da sessão</label>
            <label><input type="checkbox" checked={configBruta.lojinha.naEntradaDaFase} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naEntradaDaFase: e.target.checked } })} /> Lojinha na entrada da fase (D021; a revisão recomenda desligado)</label>
            <label><input type="checkbox" checked={configBruta.conquistas.naEntradaDaFase} onChange={(e) => set({ conquistas: { naEntradaDaFase: e.target.checked } })} /> "Minhas Conquistas" na entrada da fase</label>
          </fieldset>
          <fieldset className="campo"><legend>P2 · Ranking</legend>
            <label><input type="checkbox" checked={configBruta.ranking.naTelaDaCrianca} disabled /> Ranking na tela da criança (desligado no MVP, P2-b)</label>
          </fieldset>
          <fieldset className="campo"><legend>Testar a jornada</legend>
            <label><input type="checkbox" checked={configBruta.modoDemonstracao} onChange={(e) => set({ modoDemonstracao: e.target.checked })} data-testid="modo-demo" /> Modo demonstração: domínio em 1 sessão (para o adulto testar as fases rapidamente)</label>
          </fieldset>
          <fieldset className="campo"><legend>Voz</legend>
            <label>Velocidade da voz <input type="range" min={0.7} max={1.2} step={0.05} value={configBruta.voz.velocidade} onChange={(e) => set({ voz: { ...configBruta.voz, velocidade: Number(e.target.value) } })} /> {configBruta.voz.velocidade.toFixed(2)}×</label>
            <button className="btn" onClick={() => voz.falar('Oi! Eu sou a Sofia.', { quem: 'sofia' })}>🔊 Testar Sofia</button>
            <button className="btn" onClick={() => voz.falar('E eu sou o Tales!', { quem: 'tales' })}>🔊 Testar Tales</button>
          </fieldset>
          <div className="linha-botoes">
            <button className="btn" onClick={() => set(CONFIG_PADRAO)}>Voltar aos padrões</button>
            <button className="btn" onClick={exportar}>⬇ Exportar dados (JSON)</button>
            <button className="btn terra" onClick={async () => { if (confirm('Apagar TODOS os dados deste aparelho?')) { await repo.apagarTudo(); navegar(''); location.reload(); } }}>🗑 Apagar todos os dados</button>
          </div>
          {msg ? <p role="status">{msg}</p> : null}
        </section>
      </main>
    </div>
  );
}
