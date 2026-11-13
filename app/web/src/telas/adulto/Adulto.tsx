import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONFIG_PADRAO, CONQUISTA_POR_ID, FASE_POR_ID, type ConfigPlataforma } from '@fonema/conteudo';
import { NIVEIS_INICIAIS, aplicarNivelInicial, avaliarConquistas, calcularNivel, fasesConcluidas, filaProfessor, mapaHabilidades, progressoInicial, resumoFamilia, type Crianca, type Demonstracao, type Evento, type NivelInicial, type Progresso, type StatusDemonstracao } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Ajustes, AvatarMini, Carregando, Topo } from '../../componentes/basicos.tsx';
import { BarraObjetivo, Termometro } from '../../componentes/recompensas.tsx';
import { BotaoSegurar, Fundo, Icone, Logo } from '../../componentes/ui.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { voz } from '../../servicos/voz.ts';
import { novoId } from '../../dados/repositorio.ts';

/* ------------------------------ portão do adulto (sem cálculo) ------------------------------ */
const CHAVE = 'fonema-adulto-ate';
export function adultoLiberado(): boolean {
  try { return Number(sessionStorage.getItem(CHAVE) ?? 0) > Date.now(); } catch { return false; }
}
/** "Área para adultos": segurar o botão por 3 segundos (anel de progresso). Vale por 20 minutos. */
export function Porteira({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(adultoLiberado);
  if (ok) return <>{children}</>;
  const liberar = () => {
    try { sessionStorage.setItem(CHAVE, String(Date.now() + 20 * 60_000)); } catch { /* sem sessionStorage: vale só nesta tela */ }
    setOk(true);
  };
  return (
    <div className="tela-adulto" data-testid="portao-adulto">
      <Fundo cena="arte/hero-paisagem" desfoque={14} tom="escuro" />
      <Topo voltar="" titulo="Família e escola" />
      <main className="palco adulto">
        <section className="cartao vidro portao">
          <img className="portao-icone" src={asset('arte/icones/familia.webp')} alt="" />
          <h1 className="t">Área para adultos</h1>
          <p>Segure o botão por 3 segundos para entrar.</p>
          <BotaoSegurar ms={3000} aoCompletar={liberar} rotulo="Entrar na área para adultos" testId="segurar-adulto" />
          <p className="nota-mic">Aqui ficam o cadastro, o painel da família, a visão do professor e as configurações.</p>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ entrada (splash) ------------------------------ */
const nivelDe = (p?: Progresso) => (p ? calcularNivel(p.desafios, p.fases['R0-F01']?.estado === 'concluida', fasesConcluidas(p)) : null);

export function Inicio() {
  const { repo, pronto, prefs } = useApp();
  const [lista, setLista] = useState<{ c: Crianca; p?: Progresso }[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    repo.listarCriancas().then(async (cs) => {
      const l = await Promise.all(cs.map(async (c) => ({ c, p: await repo.obterProgresso(c.id) })));
      setLista(l);
      const ultimo = (() => { try { return localStorage.getItem('fonema-ultimo-perfil'); } catch { return null; } })();
      setSel(l.find((x) => x.c.id === ultimo)?.c.id ?? l[0]?.c.id ?? null);
    });
  }, [repo]);
  const semMovimento = prefs.menosMovimento || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // vídeo só quando a aba está visível
  useEffect(() => {
    const f = () => { const v = video.current; if (!v) return; if (document.hidden) v.pause(); else v.play().catch(() => undefined); };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  const petalas = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ left: `${(i * 37 + 11) % 100}%`, dur: `${9 + (i * 5) % 8}s`, atraso: `${-(i * 1.7)}s` })), []);
  if (!pronto || !lista) return <Carregando />;
  const entrar = (id: string) => {
    try { localStorage.setItem('fonema-ultimo-perfil', id); } catch { /* ok */ }
    navegar(`c/${id}/vila`);
  };
  const temCriancas = lista.length > 0;
  return (
    <div className="tela-inicio" data-testid="inicio">
      <img className="splash-midia paisagem" src={asset('arte/hero-paisagem.webp')} alt="" />
      {!semMovimento ? (
        <video ref={video} className="splash-midia paisagem" src={asset('arte/hero-loop.mp4')} poster={asset('arte/hero-paisagem.webp')} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      ) : null}
      <img className="splash-midia retrato" src={asset('arte/hero-retrato.webp')} alt="" />
      <div className="splash-veu" />
      <div className="splash-nuvens" aria-hidden="true"><i /><i /><i /></div>
      <div className="splash-petalas" aria-hidden="true">{petalas.map((p, i) => <i key={i} style={{ left: p.left, animationDuration: p.dur, animationDelay: p.atraso }} />)}</div>

      <div className="splash-cima">
        <Ajustes />
        <button className="splash-familia vidro" onClick={() => navegar('adulto')} data-testid="area-adulto" aria-label="Família e escola (área para adultos)">
          <Icone nome="familia" /><span>Família e escola</span>
        </button>
      </div>

      <div className="splash-logo"><Logo tamanho="g" subtitulo animar /></div>

      <main className="splash-base">
        {temCriancas ? (
          <div className="perfis vidro" role="group" aria-label="Quem vai jogar?">
            {lista.map(({ c, p }) => {
              const n = nivelDe(p);
              const pct = n && n.custoProximo ? Math.min(100, Math.round((n.desafiosNoNivel / n.custoProximo) * 100)) : 0;
              return (
                <button key={c.id} className={`perfil ${sel === c.id ? 'sel' : ''}`} onClick={() => entrar(c.id)} onFocus={() => setSel(c.id)} data-perfil={c.nome} aria-label={`Jogar como ${c.nome}`}>
                  <AvatarMini crianca={c} tamanho={84} />
                  <b>{c.nome}</b>
                  <small>{n && n.nivel > 0 ? `Nível ${n.nivel}${n.titulo ? ` · ${n.rotulo}` : ''}` : 'Começando a aventura'}</small>
                  <div className="barrinha" aria-hidden="true"><i style={{ width: `${Math.max(6, pct)}%` }} /></div>
                </button>
              );
            })}
            <button className="perfil perfil-novo" onClick={() => navegar('adulto/cadastro')} aria-label="Cadastrar outra criança (área para adultos)">
              <span className="mais"><Icone nome="mais" /></span>
              <b>Nova criança</b>
            </button>
          </div>
        ) : null}
        <div className="splash-jogar">
          <button
            className="btn ipe enorme brilha pulsa"
            data-testid="jogar"
            onClick={() => (temCriancas && sel ? entrar(sel) : navegar('adulto/cadastro'))}
          >
            <Icone nome="play" />{temCriancas ? 'Jogar' : 'Começar a aventura'}
          </button>
          {!temCriancas ? <p className="splash-nota">Um adulto cadastra a criança primeiro (2 minutos). Tudo fica neste aparelho.</p> : null}
        </div>
      </main>
    </div>
  );
}

const ROTULO_NIVEL: Record<NivelInicial, string> = { zero: 'Do zero', 'letras-e-sons': 'Já conhece as letras e os sons', 'le-palavras': 'Já lê palavras' };

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
      <Fundo cena="varanda" desfoque={18} tom="calmo" />
      <Topo voltar="" titulo="Família e escola" />
      <main className="palco adulto">
        <section className="cartao">
          <div className="adulto-cab">
            <h1 className="t">Crianças deste aparelho</h1>
            <button className="btn pri" onClick={() => navegar('adulto/cadastro')} data-testid="nova-crianca"><Icone nome="mais" />Cadastrar criança</button>
          </div>
          {lista.length === 0 ? <p>Nenhuma criança cadastrada ainda. O cadastro leva 2 minutos.</p> : null}
          <div className="lista-criancas">
            {lista.map(({ c, p }) => (
              <div key={c.id} className="linha-crianca">
                <AvatarMini crianca={c} tamanho={76} />
                <div>
                  <b>{c.nome}</b>
                  <small>{p ? FASE_POR_ID[p.faseAtual]?.titulo : 'ainda não começou'} · termômetro {p?.termometro ?? 0}/10</small>
                  <div className="mini-termo" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < (p?.termometro ?? 0) ? 'cheio' : ''} />)}</div>
                </div>
                <div className="linha-botoes">
                  <button className="btn" onClick={() => navegar(`adulto/familia/${c.id}`)} data-testid={`painel-${c.nome}`}><Icone nome="grafico" />Painel da família</button>
                  <button className="btn" onClick={() => navegar(`c/${c.id}/sondagem`)}><Icone nome="placa" />Sondagem</button>
                  <button className="btn ipe" onClick={() => navegar(`c/${c.id}/vila`)}><Icone nome="tocar" />Jogar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="atalhos">
            <button className="atalho" onClick={() => navegar('adulto/professor')} data-testid="visao-professor"><Icone nome="chapeu" /><span><b>Visão do professor</b><small>Fila de demonstrações e mapa de habilidades</small></span></button>
            <button className="atalho" onClick={() => navegar('adulto/config')}><Icone nome="engrenagem" /><span><b>Configurações</b><small>Voz, lojinha, modo demonstração e dados</small></span></button>
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
  if (!dados || !resumo) return <Carregando />;
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
    <div className="tela-adulto">
      <Fundo cena="varanda" desfoque={18} tom="calmo" />
      <Topo voltar="adulto" titulo="Painel da família" />
      <main className="palco adulto">
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
  const STATUS: Record<string, [string, string]> = { aprendeu: ['check', 'Aprendeu'], treinar: ['repetir', 'Treinar mais'], explicou: ['microfone', 'Explicou certinho'], criterio: ['relogio', 'Vale o critério'] };
  return (
    <div className="tela-adulto">
      <Fundo cena="biblioteca" desfoque={18} tom="calmo" />
      <Topo voltar="adulto" titulo="Visão do professor" />
      <main className="palco adulto">
        <section className="cartao" data-testid="professor">
          <div className="adulto-cab">
            <h1 className="t">Mostra pro professor</h1>
            <span className="etiqueta">{pend.length} na fila</span>
          </div>
          <p className="nota-mic">Corrija em 1 toque. A criança ouve "Parabéns, [nome]!" na voz da dupla. Sem resposta em {config.demonstracao.horasParaValerCriterio} h, vale o critério de domínio.</p>
          {ds.length === 0 ? <p>Nenhuma demonstração ainda.</p> : null}
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
          <h2 className="t">Turma neste aparelho · habilidades</h2>
          <p className="nota-mic">Sem ranking (P2-b): ordem alfabética, estado por habilidade, só para planejar a aula.</p>
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
            <span className="hab dominada"><i />dominada</span><span className="hab aprendendo"><i />aprendendo</span><span className="hab"><i />ainda não começou</span>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ configurações (padrões do MVP) ------------------------------ */
export function Configuracoes() {
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
    <div className="tela-adulto">
      <Fundo cena="varanda" desfoque={18} tom="calmo" />
      <Topo voltar="adulto" titulo="Configurações" />
      <main className="palco adulto">
        <section className="cartao">
          <div className="adulto-cab"><h1 className="t">Configurações</h1>{msg ? <span className="etiqueta verde" role="status"><Icone nome="check" />{msg}</span> : null}</div>
          <p className="nota-mic">Padrões PROVISÓRIOS do MVP até as respostas do dono (docs/revisao/04-perguntas-para-o-dono.md). O arquivo de padrões é packages/conteudo/src/config.ts.</p>
          <fieldset className="campo config-grupo"><legend>Prêmios de nível</legend>
            <label className="opcao-linha"><input type="radio" name="premios" checked={configBruta.recompensas.modo === 'surpresa'} onChange={() => set({ recompensas: { modo: 'surpresa' } })} /> Surpresa depois da conquista; a barra mostra o próximo objetivo de aprendizagem (recomendado)</label>
            <label className="opcao-linha"><input type="radio" name="premios" checked={configBruta.recompensas.modo === 'anunciada'} onChange={() => set({ recompensas: { modo: 'anunciada' } })} /> Anunciar o prêmio antes</label>
          </fieldset>
          <fieldset className="campo config-grupo"><legend>Onde aparecem a Lojinha e as Conquistas</legend>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.naVila} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naVila: e.target.checked } })} /> Lojinha na vila</label>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.noFimDaSessao} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, noFimDaSessao: e.target.checked } })} /> Lojinha no fim da sessão</label>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.lojinha.naEntradaDaFase} onChange={(e) => set({ lojinha: { ...configBruta.lojinha, naEntradaDaFase: e.target.checked } })} /> Lojinha na entrada da fase (a revisão recomenda desligado)</label>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.conquistas.naEntradaDaFase} onChange={(e) => set({ conquistas: { naEntradaDaFase: e.target.checked } })} /> "Minhas Conquistas" na entrada da fase</label>
          </fieldset>
          <fieldset className="campo config-grupo"><legend>Ranking</legend>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.ranking.naTelaDaCrianca} disabled readOnly /> Ranking na tela da criança (desligado no MVP)</label>
          </fieldset>
          <fieldset className="campo config-grupo"><legend>Testar a jornada</legend>
            <label className="opcao-linha"><input type="checkbox" checked={configBruta.modoDemonstracao} onChange={(e) => set({ modoDemonstracao: e.target.checked })} data-testid="modo-demo" /> Modo demonstração: domínio em 1 sessão (para o adulto testar as fases rapidamente)</label>
          </fieldset>
          <fieldset className="campo config-grupo"><legend>Voz</legend>
            <label className="opcao-linha">Velocidade <input type="range" min={0.7} max={1.2} step={0.05} value={configBruta.voz.velocidade} onChange={(e) => set({ voz: { ...configBruta.voz, velocidade: Number(e.target.value) } })} /> <b>{configBruta.voz.velocidade.toFixed(2)}×</b></label>
            <div className="linha-botoes">
              <button className="btn" onClick={() => voz.falar('Oi! Eu sou a Sofia.', { quem: 'sofia' })}><Icone nome="som" />Testar Sofia</button>
              <button className="btn" onClick={() => voz.falar('E eu sou o Tales!', { quem: 'tales' })}><Icone nome="som" />Testar Tales</button>
            </div>
          </fieldset>
          <fieldset className="campo config-grupo"><legend>Dados deste aparelho</legend>
            <div className="linha-botoes">
              <button className="btn" onClick={() => set(CONFIG_PADRAO)}><Icone nome="repetir" />Voltar aos padrões</button>
              <button className="btn" onClick={exportar}><Icone nome="baixar" />Exportar dados (JSON)</button>
              {apagar ? (
                <>
                  <button className="btn terra" data-testid="confirmar-apagar" onClick={async () => { await repo.apagarTudo(); navegar(''); location.reload(); }}><Icone nome="lixeira" />Sim, apagar tudo</button>
                  <button className="btn" onClick={() => setApagar(false)}>Cancelar</button>
                </>
              ) : <button className="btn terra" onClick={() => setApagar(true)}><Icone nome="lixeira" />Apagar todos os dados</button>}
            </div>
            {apagar ? <p className="nota-mic" role="alert">Isso apaga as crianças, o progresso e as gravações deste aparelho. Não dá para desfazer.</p> : null}
          </fieldset>
        </section>
      </main>
    </div>
  );
}
