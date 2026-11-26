/**
 * Primeira página e acesso. Refeita do zero (fila do dono nº 34, 26/11/2026: "entrada separada para aluno, professor
 * com login e senha e o administrador geral"; antes: Decisão 028, "Quem vai entrar?" com 4 portas iguais e PIN).
 *
 * Três jeitos de entrar, cada um com a sua cara:
 *  - CRIANÇA / ALUNO(A): o botão grande, colorido, sem senha (a criança nunca digita senha) → cartões das crianças;
 *  - ADULTOS com LOGIN e SENHA: Família (pai, mãe ou responsável) e Professor(a) → a área de cada um;
 *  - ADMINISTRADOR (o dono): link discreto no rodapé → #/admin, com a senha própria do administrador.
 * Sem servidor: as contas ficam NESTE aparelho (servicos/conta.ts), e a tela diz isso com todas as letras.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { calcularNivel, fasesConcluidas, missaoInicialFeita, type Crianca, type Progresso } from '@fonema/motor';
import { TEXTOS_TELA } from '@fonema/conteudo';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Ajustes, AvatarMini, Carregando, Topo } from '../../componentes/basicos.tsx';
import { BotaoSegurar, Fundo, Icone, Logo } from '../../componentes/ui.tsx';
import { Dupla3D, type PoseDupla } from '../../componentes/Dupla3D.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { loginValido, senhaAdultoValida, servicoConta, type Conta, type Sessao, type TipoConta } from '../../servicos/conta.ts';
import '../../estilos-portal.css';

export function useConta() {
  const { repo } = useApp();
  return useMemo(() => servicoConta(repo), [repo]);
}

const nivelDe = (p?: Progresso) => (p ? calcularNivel(p.desafios, missaoInicialFeita(p), fasesConcluidas(p)) : null);
const ultimoPerfil = () => { try { return localStorage.getItem('fonema-ultimo-perfil'); } catch { return null; } };
const NOME_AREA: Record<TipoConta, string> = { responsavel: 'Área da Família', professor: 'Área do Professor' };
const ROTA_AREA: Record<TipoConta, string> = { responsavel: 'familia', professor: 'professor' };
const PORTA: Record<TipoConta, string> = { responsavel: 'Família', professor: 'Professor(a)' };
const texto = (k: string, padrao: string) => TEXTOS_TELA[k] ?? padrao;

/* ------------------------------------------------------------------ primeira página */
/** Tela deitada e larga usa a arte em paisagem (com a dupla à esquerda); em pé, a arte em retrato. */
const PAISAGEM = '(orientation: landscape) and (min-width: 901px)';
function useTelaDeitada(): boolean {
  return useSyncExternalStore(
    (avisar) => { const m = matchMedia(PAISAGEM); m.addEventListener('change', avisar); return () => m.removeEventListener('change', avisar); },
    () => typeof matchMedia === 'undefined' || matchMedia(PAISAGEM).matches
  );
}
/**
 * O vídeo da entrada (1,1 MB) não atrasa a primeira pintura: a arte parada aparece primeiro e o vídeo só começa a
 * baixar depois que a página terminou de carregar e o navegador ficou livre. Em tela em pé ele nem existe.
 */
function useDepoisDeCarregar(): boolean {
  const [livre, setLivre] = useState(false);
  useEffect(() => {
    let t = 0;
    const ir = () => { t = window.setTimeout(() => setLivre(true), 600); };
    if (document.readyState === 'complete') ir(); else window.addEventListener('load', ir, { once: true });
    return () => { window.removeEventListener('load', ir); clearTimeout(t); };
  }, []);
  return livre;
}

export function Entrada() {
  const { repo, pronto, prefs } = useApp();
  const [criancas, setCriancas] = useState<Crianca[] | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const deitada = useTelaDeitada();
  const livre = useDepoisDeCarregar();
  useEffect(() => { repo.listarCriancas().then(setCriancas); }, [repo]);
  const semMovimento = prefs.menosMovimento || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const f = () => { const v = video.current; if (!v) return; if (document.hidden) v.pause(); else v.play().catch(() => undefined); };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  if (!pronto || !criancas) return <Carregando />;
  const ultima = criancas.find((c) => c.id === ultimoPerfil()) ?? criancas[0];
  return (
    <div className="tela-portal" data-testid="inicio">
      <div className="portal-arte" aria-hidden="true">
        {deitada ? <img src={asset('arte/hero-paisagem.webp')} alt="" fetchPriority="high" /> : <img src={asset('arte/hero-retrato.webp')} alt="" fetchPriority="high" />}
        {deitada && !semMovimento && livre ? (
          <video ref={video} src={asset('arte/hero-loop.mp4')} poster={asset('arte/hero-paisagem.webp')} autoPlay muted loop playsInline preload="auto" />
        ) : null}
        <i className="portal-veu" />
      </div>
      <div className="portal-ajustes"><Ajustes /></div>

      <main className="portal-palco">
        <div className="portal-logo"><Logo tamanho="g" subtitulo animar /></div>

        <div className="portal-painel">
          <h1 className="sr-only">{texto('entrada.titulo', 'Quem vai entrar?')}</h1>
          {/* criança: o botão grande, sem senha */}
          <button className="portal-crianca" onClick={() => navegar('aluno')} data-testid="entrar-aluno" data-papel="aluno">
            <span className="portal-crianca-arte" aria-hidden="true">
              {ultima ? <AvatarMini crianca={ultima} tamanho={112} /> : <img src={asset('dupla3d/acenando.webp')} alt="" />}
            </span>
            <span className="portal-crianca-texto">
              <small className="portal-etiqueta">{texto('entrada.aluno', 'Criança · aluno(a)')}</small>
              <b>{ultima ? `Continuar, ${ultima.nome.split(' ')[0]}!` : texto('entrada.aluno.sub', 'Vamos jogar!')}</b>
              <em>{texto('entrada.aluno.nota', 'Sem senha: é só tocar no seu cartão.')}</em>
            </span>
            <span className="portal-play" aria-hidden="true"><Icone nome="tocar" /></span>
          </button>

          {/* adultos: login e senha */}
          <section className="portal-adultos" aria-labelledby="portal-adultos-t">
            <h2 id="portal-adultos-t" className="portal-adultos-titulo">
              <span>{texto('entrada.adultos', 'Para adultos')}</span>
              <small><Icone nome="escudo" />{texto('entrada.adultos.sub', 'com login e senha')}</small>
            </h2>
            <div className="portal-portas">
              <button className="portal-porta familia" onClick={() => navegar('familia')} data-testid="entrar-familia" data-papel="familia">
                <span className="portal-porta-arte porta-par" aria-hidden="true"><img src={asset('figuras/mamae.webp')} alt="" /><img src={asset('figuras/papai.webp')} alt="" /></span>
                <span className="portal-porta-texto"><b>{texto('entrada.familia', 'Família')}</b><small>{texto('entrada.familia.sub', 'Pai, mãe ou responsável')}</small></span>
                <Icone nome="seta" className="portal-seta" />
              </button>
              <button className="portal-porta professor" onClick={() => navegar('professor')} data-testid="entrar-professor" data-papel="professor">
                <span className="portal-porta-arte" aria-hidden="true"><img src={asset('recompensas/bau-livros.webp')} alt="" /></span>
                <span className="portal-porta-texto"><b>{texto('entrada.professor', 'Professor(a)')}</b><small>{texto('entrada.professor.sub', 'Turma, atividades e relatórios')}</small></span>
                <Icone nome="seta" className="portal-seta" />
              </button>
            </div>
            <div className="portal-pe">
              <button className="portal-nova" onClick={() => navegar('primeira-vez')} data-testid="primeira-vez">
                <Icone nome="mais" /><span>{texto('entrada.primeira', 'Primeira vez aqui?')} <b>{texto('entrada.primeira.sub', 'Criar conta')}</b></span>
              </button>
              <button className="portal-admin" onClick={() => navegar('admin')} data-testid="entrar-admin-geral" data-papel="admin">
                <Icone nome="engrenagem" /><span>{texto('entrada.admin', 'Administrador')}</span>
              </button>
            </div>
          </section>
          <p className="portal-nota"><Icone nome="escudo" />{texto('entrada.nota', 'Sem servidor por enquanto: as contas e o progresso ficam só neste aparelho.')}</p>
        </div>
      </main>
    </div>
  );
}


/* ------------------------------------------------------------------ sou aluno(a): cartões das crianças */
export function Alunos() {
  const { repo } = useApp();
  const [lista, setLista] = useState<{ c: Crianca; p?: Progresso }[] | null>(null);
  useEffect(() => {
    repo.listarCriancas().then(async (cs) => setLista(await Promise.all(cs.map(async (c) => ({ c, p: await repo.obterProgresso(c.id) })))));
  }, [repo]);
  if (!lista) return <Carregando />;
  const ultimo = lista.find((x) => x.c.id === ultimoPerfil())?.c.id ?? lista[0]?.c.id;
  const entrar = (id: string) => {
    try { localStorage.setItem('fonema-ultimo-perfil', id); } catch { /* ok */ }
    navegar(`c/${id}/vila`);
  };
  return (
    <div className="tela-fluxo tela-alunos" data-testid="alunos">
      <Fundo cena="arte/paisagem-sem-dupla" desfoque={16} tom="claro" />
      <Topo voltar="" titulo="Alunos" />
      <main className="alunos-palco">
        {lista.length ? (
          <>
            <h1 className="t alunos-titulo">{TEXTOS_TELA['alunos.titulo']}</h1>
            <p className="alunos-sub">{TEXTOS_TELA['alunos.sub']}</p>
            <div className="alunos-grade" data-qtd={Math.min(lista.length, 4)}>
              {lista.map(({ c, p }) => {
                const n = nivelDe(p);
                const destaque = c.id === ultimo;
                return (
                  <button key={c.id} className={`aluno ${destaque ? 'destaque' : ''}`} onClick={() => entrar(c.id)} data-perfil={c.nome} data-testid={destaque ? 'jogar' : undefined} aria-label={`Entrar como ${c.nome}`}>
                    <AvatarMini crianca={c} tamanho={120} />
                    <b>{c.nome}</b>
                    <small>{n && n.nivel > 0 ? `Nível ${n.nivel}${n.titulo ? ` · ${n.rotulo}` : ''}` : 'Começando a aventura'}</small>
                    <span className={`btn ${destaque ? 'ipe brilha' : 'pri'} aluno-btn`}><Icone nome="play" />{destaque ? 'Continuar a aventura' : 'Entrar'}</span>
                  </button>
                );
              })}
            </div>
            <button className="alunos-novo" onClick={() => navegar('familia/cadastro')}><Icone nome="mais" />Cadastrar outra criança (para adultos)</button>
          </>
        ) : (
          <section className="cartao alunos-vazio" data-testid="alunos-vazio">
            <Dupla3D pose="pensando" />
            <h1 className="t">Ainda não tem aluno neste aparelho</h1>
            <p>Um adulto precisa fazer o cadastro primeiro. É rápido: leva uns 2 minutos.</p>
            <button className="btn grande ipe brilha" onClick={() => navegar('primeira-vez')} data-testid="ir-primeira-vez"><Icone nome="estrela" />Primeira vez aqui</button>
          </section>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ PIN: campo + teclado na tela */
function Teclado({ aoDigitar, aoApagar }: { aoDigitar: (d: string) => void; aoApagar: () => void }) {
  return (
    <div className="teclado" role="group" aria-label="Teclado de números">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} type="button" className="tecla" onClick={() => aoDigitar(d)}>{d}</button>)}
      <span />
      <button type="button" className="tecla" onClick={() => aoDigitar('0')}>0</button>
      <button type="button" className="tecla tecla-apagar" onClick={aoApagar} aria-label="Apagar"><Icone nome="apagar" /></button>
    </div>
  );
}

function CampoPin({ valor, aoMudar, rotulo, testId, ativo, aoFocar, erro, focoInicial }: { valor: string; aoMudar: (v: string) => void; rotulo: string; testId: string; ativo?: boolean; aoFocar?: () => void; erro?: boolean; focoInicial?: boolean }) {
  return (
    <label className={`pin ${ativo ? 'ativo' : ''} ${erro ? 'erro' : ''}`}>
      <span>{rotulo}</span>
      <span className="pin-caixa">
        <input
          type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="\d{4}" value={valor} data-testid={testId} autoFocus={focoInicial}
          onChange={(e) => aoMudar(e.target.value.replace(/\D/g, '').slice(0, 4))} onFocus={aoFocar} aria-label={rotulo} aria-invalid={erro || undefined}
        />
        <span className="pin-bolas" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i < valor.length ? 'cheia' : ''} />)}</span>
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ moldura dos fluxos (dupla 3D + cartão) */
export function Fluxo({ titulo, voltar, pose, quem, fala, children, cena = 'quintal', testId, tipo }: { titulo: string; voltar: string; pose: PoseDupla; quem: string; fala: string; children: ReactNode; cena?: string; testId?: string; tipo?: string }) {
  return (
    <div className="tela-fluxo" data-testid={testId} data-tipo={tipo}>
      <Fundo cena={cena} desfoque={14} tom="claro" />
      <Topo voltar={voltar} titulo={titulo} />
      <main className="fluxo">
        <aside className="fluxo-dupla">
          <p className="fluxo-fala" key={fala} aria-live="polite"><b>{quem}</b>{fala}</p>
          <Dupla3D pose={pose} />
        </aside>
        {children}
      </main>
    </div>
  );
}


/* ------------------------------------------------------------------ campos de login e senha */
function CampoTexto({ rotulo, valor, aoMudar, testId, tipo = 'text', auto, dica, erro, foco, extra }: { rotulo: string; valor: string; aoMudar: (v: string) => void; testId: string; tipo?: string; auto?: string; dica?: string; erro?: string; foco?: boolean; extra?: ReactNode }) {
  return (
    <label className="campo acesso-campo">
      <span>{rotulo}</span>
      <span className="acesso-entrada">
        <input
          type={tipo} value={valor} onChange={(e) => aoMudar(e.target.value)} autoComplete={auto} autoCapitalize="none" autoCorrect="off" spellCheck={false}
          data-testid={testId} aria-invalid={!!erro || undefined} autoFocus={foco} placeholder={dica}
        />
        {extra}
      </span>
      {erro ? <small className="aviso-campo" role="alert">{erro}</small> : null}
    </label>
  );
}
function CampoSenha({ rotulo = 'Senha', valor, aoMudar, testId, nova, erro, foco }: { rotulo?: string; valor: string; aoMudar: (v: string) => void; testId: string; nova?: boolean; erro?: string; foco?: boolean }) {
  const [ver, setVer] = useState(false);
  return (
    <CampoTexto
      rotulo={rotulo} valor={valor} aoMudar={aoMudar} testId={testId} tipo={ver ? 'text' : 'password'} auto={nova ? 'new-password' : 'current-password'} erro={erro} foco={foco}
      dica={nova ? '6 ou mais, com letras' : undefined}
      extra={<button type="button" className="acesso-ver" onClick={() => setVer(!ver)} aria-pressed={ver} aria-label={ver ? 'Esconder a senha' : 'Mostrar a senha'}><Icone nome="olho" /><span>{ver ? 'Esconder' : 'Mostrar'}</span></button>}
    />
  );
}
const ArteTipo = ({ tipo }: { tipo?: TipoConta }) => tipo === 'professor'
  ? <img src={asset('recompensas/bau-livros.webp')} alt="" />
  : tipo === 'responsavel' ? <span className="porta-par"><img src={asset('figuras/mamae.webp')} alt="" /><img src={asset('figuras/papai.webp')} alt="" /></span>
    : <img src={asset('arte/icones/cadeado.webp')} alt="" />;

/* ------------------------------------------------------------------ criar a conta do adulto (login + senha) */
export function CriarConta({ tipoFixo, aoCriar, voltar = '', aoCancelar, aviso }: { tipoFixo?: TipoConta; aoCriar: (s: Sessao) => void; voltar?: string; aoCancelar?: () => void; aviso?: string }) {
  const conta = useConta();
  const [tipo, setTipo] = useState<TipoConta>(tipoFixo ?? 'responsavel');
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const eNome = nome.trim().length >= 2 ? '' : 'Escreva o seu nome para continuar.';
  const eLogin = loginValido(login) ?? '';
  const eSenha = senhaAdultoValida(senha) ?? '';
  const eSenha2 = senha2 === senha ? '' : 'As duas senhas estão diferentes.';
  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setTentou(true); setErro('');
    if (eNome || eLogin || eSenha || eSenha2 || salvando) return;
    setSalvando(true);
    try { aoCriar(await conta.criar({ nome, tipo, login, senha })); } catch (z) { setErro(z instanceof Error ? z.message : 'Não deu para criar a conta.'); } finally { setSalvando(false); }
  };
  return (
    <Fluxo
      titulo={tipoFixo ? NOME_AREA[tipoFixo] : 'Primeira vez aqui'} voltar={voltar} testId="criar-conta" tipo={tipo}
      pose="acenando" quem="Sofia" fala="Que bom que você chegou! Primeiro, a conta do adulto, com login e senha."
    >
      <section className="cartao fluxo-cartao">
        <form className="fluxo-corpo" onSubmit={(e) => void criar(e)} id="form-conta" noValidate>
          <h1 className="t">Criar conta {tipoFixo ? `de ${tipoFixo === 'professor' ? 'professor(a)' : 'família'}` : 'de adulto'}</h1>
          {aviso ? <p className="fluxo-aviso">{aviso}</p> : null}
          {!tipoFixo ? (
            <div className="tipos" role="group" aria-label="Tipo de conta">
              <button type="button" className="tipo" aria-pressed={tipo === 'responsavel'} onClick={() => setTipo('responsavel')} data-tipo="responsavel">
                <span className="porta-par"><img src={asset('figuras/mamae.webp')} alt="" /><img src={asset('figuras/papai.webp')} alt="" /></span>
                <b>Pai, mãe ou responsável</b>
              </button>
              <button type="button" className="tipo" aria-pressed={tipo === 'professor'} onClick={() => setTipo('professor')} data-tipo="professor">
                <img src={asset('recompensas/bau-livros.webp')} alt="" />
                <b>Professor(a)</b>
              </button>
            </div>
          ) : null}
          <CampoTexto rotulo="Seu nome" valor={nome} aoMudar={setNome} testId="conta-nome" auto="name" dica="Como você se chama?" erro={tentou ? eNome : ''} />
          <CampoTexto rotulo="Login (e-mail ou nome de usuário)" valor={login} aoMudar={setLogin} testId="conta-login" auto="username" dica="ex.: ana.souza ou ana@email.com" erro={tentou ? eLogin : ''} />
          <div className="acesso-duas">
            <CampoSenha valor={senha} aoMudar={setSenha} testId="conta-senha" nova erro={tentou ? eSenha : ''} />
            <CampoSenha rotulo="Repita a senha" valor={senha2} aoMudar={setSenha2} testId="conta-senha2" nova erro={tentou ? eSenha2 : ''} />
          </div>
          {erro ? <p className="acesso-erro" role="alert" data-testid="conta-erro">{erro}</p> : null}
          <p className="acesso-nota"><Icone nome="escudo" />A criança não usa senha: entra pelo cartão dela. Sem servidor por enquanto, esta conta vale só neste aparelho.</p>
        </form>
        <footer className="fluxo-pe">
          {aoCancelar ? <button className="btn" type="button" onClick={aoCancelar}><Icone nome="seta-esq" />Voltar</button> : <span />}
          <button className="btn grande verde" type="submit" form="form-conta" disabled={salvando} data-testid="conta-criar"><Icone nome="check" />Criar conta e entrar</button>
        </footer>
      </section>
    </Fluxo>
  );
}

/** Rota "Primeira vez aqui": cria a conta do adulto e segue para o cadastro da criança. */
export function PrimeiraVez() {
  const conta = useConta();
  const [contas, setContas] = useState<Conta[] | null>(null);
  const [sessao, setSessao] = useState<Sessao | null>(() => conta.sessao());
  useEffect(() => { conta.listar().then(setContas); }, [conta]);
  if (!contas) return <Carregando />;
  // já existe conta neste aparelho: um adulto cadastrado entra antes de criar outra (toda conta vê as crianças do aparelho)
  if (contas.length && !sessao) {
    return <AcessoAdulto contas={contas} aoEntrar={setSessao} confirmar titulo="Este aparelho já tem conta" sub="Para criar outra conta, um adulto já cadastrado entra primeiro com o login e a senha dele." />;
  }
  return <CriarConta aoCriar={(s) => navegar(`${ROTA_AREA[s.tipo]}/cadastro`)} />;
}

/* ------------------------------------------------------------------ entrar: login + senha (e contas antigas com PIN) */
type Modo = 'entrar' | 'esqueci' | 'nova-senha' | 'pin' | 'esqueci-pin' | 'migrar' | 'confirmar' | 'criar';
/**
 * Porta de um tipo de adulto. `tipo` vazio = qualquer adulto (confirmação). `confirmar`: só confere quem é
 * (sem "criar conta" nem "outra porta").
 */
export function AcessoAdulto({ tipo, contas, aoEntrar, sessaoAberta, confirmar, titulo, sub }: { tipo?: TipoConta; contas: Conta[]; aoEntrar: (s: Sessao) => void; sessaoAberta?: boolean; confirmar?: boolean; titulo?: string; sub?: string }) {
  const conta = useConta();
  const [modo, setModo] = useState<Modo>('entrar');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [msg, setMsg] = useState('');
  const [outra, setOutra] = useState<TipoConta | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [confirmado, setConfirmado] = useState(!!sessaoAberta);
  // confirmando para criar outra conta: vale qualquer adulto já cadastrado (também conta antiga, com PIN)
  const [paraCriar, setParaCriar] = useState(false);
  const [semPin, setSemPin] = useState(false);
  const antigas = contas.filter((c) => c.soPin && (paraCriar || !tipo || c.tipo === tipo));
  const [sel, setSel] = useState(antigas[0]?.id ?? '');
  const [pin, setPin] = useState('');
  const ir = (m: Modo) => {
    if (m === 'confirmar') setParaCriar(true);
    if (m === 'entrar') setParaCriar(false);
    if (m === 'pin') { setSel((x) => (antigas.some((c) => c.id === x) ? x : antigas[0]?.id ?? '')); setSemPin(false); }
    setModo(m); setMsg(''); setOutra(null); setSenha(''); setSenha2('');
  };
  const aberta = (s: Sessao) => {
    if (paraCriar) { setConfirmado(true); ir('criar'); return; }
    if (tipo && s.tipo !== tipo) { setOutra(s.tipo); conta.sair(); return; }
    aoEntrar(s);
  };

  const mudarPin = async (v: string) => {
    setPin(v); setMsg('');
    if (v.length < 4) return;
    const r = await conta.entrar(sel, v);
    if (r.ok) { conta.sair(); ir('migrar'); return; }
    setPin('');
    setMsg(r.ok === false && r.motivo === 'espera' ? `Muitas tentativas. Espere ${r.segundos} segundos.` : 'PIN incorreto. Tente de novo.');
  };
  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    if (ocupado) return;
    setMsg(''); setOutra(null);
    if (!login.trim() || !senha) { setMsg('Escreva o login e a senha.'); return; }
    setOcupado(true);
    const r = await conta.entrarComLogin(login, senha, modo === 'confirmar' ? undefined : tipo);
    setOcupado(false);
    if (r.ok) { aberta(r.sessao); return; }
    setSenha('');
    if (r.motivo === 'outro-tipo') setOutra(r.tipo);
    else setMsg(r.motivo === 'espera' ? `Muitas tentativas. Espere ${r.segundos} segundos e tente de novo.` : 'Login ou senha errados. Confira e tente de novo.');
  };

  if (modo === 'criar') {
    return confirmado
      ? <CriarConta tipoFixo={tipo} aoCriar={aoEntrar} aoCancelar={() => ir('entrar')} aviso={tipo && !contas.some((c) => c.tipo === tipo) ? `Este aparelho ainda não tem conta de ${tipo === 'professor' ? 'professor(a)' : 'família'}. Crie agora: leva um minuto.` : undefined} />
      : null;
  }
  const nomeArea = tipo ? NOME_AREA[tipo] : 'Área dos adultos';
  const tituloAqui = modo === 'confirmar' ? 'Um adulto confirma' : titulo ?? nomeArea;
  const subAqui = modo === 'confirmar'
    ? 'Este aparelho já tem conta. Para criar outra, um adulto já cadastrado entra primeiro (qualquer conta, da família ou do professor).'
    : sub ?? (tipo === 'professor' ? 'Entre com o seu login e a sua senha de professor(a).' : tipo === 'responsavel' ? 'Entre com o login e a senha da família.' : 'Entre com o seu login e a sua senha.');

  return (
    <div className="tela-fluxo tela-acesso" data-testid="acesso-adulto" data-tipo={modo === 'confirmar' || !tipo ? 'qualquer' : tipo} data-modo={modo}>
      <Fundo cena={tipo === 'professor' ? 'biblioteca' : 'varanda'} desfoque={16} tom="escuro" />
      <Topo voltar="" titulo={nomeArea} />
      <main className="acesso-palco">
        <section className="cartao acesso-cartao">
          <div className="acesso-cab">
            <span className="acesso-arte" aria-hidden="true"><ArteTipo tipo={tipo} /></span>
            <div><small className="acesso-chip"><Icone nome="escudo" />{tipo ? `Porta ${PORTA[tipo]}` : 'Adultos'} · login e senha</small><h1 className="t">{modo === 'esqueci' || modo === 'nova-senha' ? 'Esqueceu a senha?' : modo === 'pin' || modo === 'esqueci-pin' || modo === 'migrar' ? 'Conta antiga, com PIN' : tituloAqui}</h1></div>
          </div>

          {modo === 'entrar' || modo === 'confirmar' ? (
            <form className="acesso-form" onSubmit={(e) => void entrar(e)} noValidate data-testid="login-form">
              <p className="fluxo-sub">{subAqui}</p>
              <CampoTexto rotulo="Login (e-mail ou nome de usuário)" valor={login} aoMudar={(v) => { setLogin(v); setMsg(''); }} testId="login-usuario" auto="username" foco />
              <CampoSenha valor={senha} aoMudar={(v) => { setSenha(v); setMsg(''); }} testId="login-senha" />
              <p className={`acesso-erro ${msg ? '' : 'vazio'}`} role={msg ? 'alert' : undefined} data-testid="login-msg">{msg}</p>
              {outra ? (
                <div className="acesso-outra" role="alert" data-testid="login-outra-porta">
                  <p>Esta conta é da <b>{PORTA[outra]}</b>. Para entrar nela, use a porta {PORTA[outra]} na primeira página.</p>
                  <button type="button" className="btn" onClick={() => navegar(ROTA_AREA[outra])}><Icone nome="seta" />Ir para a {NOME_AREA[outra]}</button>
                </div>
              ) : null}
              <button className="btn grande pri acesso-entrar" type="submit" disabled={ocupado} data-testid="login-entrar"><Icone nome="seta" />{modo === 'confirmar' ? 'Confirmar' : 'Entrar'}</button>
              <div className="acesso-links">
                <button type="button" className="acesso-link" onClick={() => ir('esqueci')} data-testid="esqueci-senha">Esqueci a senha</button>
                {modo === 'confirmar'
                  ? <button type="button" className="acesso-link" onClick={() => ir('entrar')}>Voltar</button>
                  : !confirmar ? <button type="button" className="acesso-link forte" onClick={() => ir(confirmado ? 'criar' : 'confirmar')} data-testid="ir-criar-conta"><Icone nome="mais" />Criar conta</button> : null}
                {antigas.length ? <button type="button" className="acesso-link" onClick={() => ir('pin')} data-testid="entrar-com-pin">Conta antiga? Entrar com o PIN</button> : null}
              </div>
            </form>
          ) : null}

          {modo === 'esqueci' ? (
            <div className="acesso-form" data-testid="esqueci">
              <p className="fluxo-sub">O FONEMA ainda não tem servidor, então <b>não dá para mandar e-mail</b> com uma senha nova. A conta fica só neste aparelho; por isso a troca é feita aqui mesmo. As crianças e o progresso continuam guardados.</p>
              <CampoTexto rotulo="Seu login" valor={login} aoMudar={(v) => { setLogin(v); setMsg(''); }} testId="esqueci-login" auto="username" />
              <p className={`acesso-erro ${msg ? '' : 'vazio'}`} role={msg ? 'alert' : undefined}>{msg}</p>
              <BotaoSegurar key={msg} ms={5000} rotulo="Segure para criar uma senha nova" testId="segurar-redefinir" aoCompletar={() => {
                const x = contas.find((c) => c.login && c.login === login.trim().toLowerCase());
                if (x && (paraCriar || !tipo || x.tipo === tipo)) ir('nova-senha');
                else setMsg(x ? `Este login é da porta ${PORTA[x.tipo]}: troque a senha por lá.` : 'Não achamos este login neste aparelho. Confira como foi escrito.');
              }} />
              <button type="button" className="acesso-link" onClick={() => ir('entrar')}>Lembrei! Voltar</button>
            </div>
          ) : null}

          {modo === 'nova-senha' ? (
            <form className="acesso-form" data-testid="nova-senha" noValidate onSubmit={async (e) => {
              e.preventDefault();
              const x = senhaAdultoValida(senha) ?? (senha !== senha2 ? 'As duas senhas estão diferentes.' : null);
              if (x) { setMsg(x); return; }
              try { aberta(await conta.redefinirSenha(login, senha)); } catch (z) { setMsg(z instanceof Error ? z.message : 'Não deu.'); }
            }}>
              <p className="fluxo-sub">Senha nova para <b>{login.trim().toLowerCase()}</b>.</p>
              <CampoSenha rotulo="Senha nova" valor={senha} aoMudar={setSenha} testId="nova-senha1" nova foco />
              <CampoSenha rotulo="Repita a senha nova" valor={senha2} aoMudar={setSenha2} testId="nova-senha2" nova />
              <p className={`acesso-erro ${msg ? '' : 'vazio'}`} role={msg ? 'alert' : undefined}>{msg}</p>
              <button className="btn grande verde acesso-entrar" type="submit" data-testid="confirmar-nova-senha"><Icone nome="check" />Salvar e entrar</button>
            </form>
          ) : null}

          {modo === 'pin' ? (
            <div className="acesso-form acesso-pin">
              <p className="fluxo-sub">Contas criadas antes do login entram com o PIN de 4 números uma última vez e, em seguida, criam o login e a senha.</p>
              {antigas.length > 1 ? (
                <div className="pin-contas" role="group" aria-label="Qual conta?">
                  {antigas.map((c) => <button key={c.id} type="button" className="pin-conta" aria-pressed={c.id === sel} onClick={() => { setSel(c.id); setPin(''); setMsg(''); }}>{c.nome}<small>{c.tipo === 'professor' ? 'professor(a)' : 'família'}</small></button>)}
                </div>
              ) : <p className="acesso-quem">Olá, <b>{antigas[0]?.nome}</b>!</p>}
              <CampoPin rotulo="PIN" valor={pin} testId="pin" ativo erro={!!msg} focoInicial aoMudar={(v) => void mudarPin(v)} />
              <p className={`pin-msg ${msg ? 'erro' : ''}`} role={msg ? 'alert' : undefined} data-testid="pin-msg">{msg || ' '}</p>
              <Teclado aoDigitar={(d) => void mudarPin((pin + d).slice(0, 4))} aoApagar={() => void mudarPin(pin.slice(0, -1))} />
              <div className="acesso-links">
                <button type="button" className="acesso-link" onClick={() => { setPin(''); ir('esqueci-pin'); }} data-testid="esqueci-pin">Esqueci o PIN</button>
                <button type="button" className="acesso-link" onClick={() => { setPin(''); ir(paraCriar ? 'confirmar' : 'entrar'); }}>Voltar ao login</button>
              </div>
            </div>
          ) : null}

          {modo === 'esqueci-pin' ? (
            <div className="acesso-form acesso-pin" data-testid="esqueci-pin-tela">
              <p className="fluxo-sub">Sem servidor, a troca é feita aqui mesmo. Segure o botão por 5 segundos para criar o login e a senha de <b>{antigas.find((c) => c.id === sel)?.nome}</b> sem o PIN. As crianças e o progresso continuam guardados.</p>
              <BotaoSegurar ms={5000} rotulo="Segure para criar login e senha" testId="segurar-redefinir-pin" aoCompletar={() => { ir('migrar'); setSemPin(true); }} />
              <button type="button" className="acesso-link" onClick={() => ir('pin')}>Lembrei! Voltar</button>
            </div>
          ) : null}

          {modo === 'migrar' ? (
            <form className="acesso-form" data-testid="migrar" noValidate onSubmit={async (e) => {
              e.preventDefault();
              const x = loginValido(login) ?? senhaAdultoValida(senha) ?? (senha !== senha2 ? 'As duas senhas estão diferentes.' : null);
              if (x) { setMsg(x); return; }
              try { const s = semPin ? await conta.redefinirAcessoAntigo(sel, login, senha) : await conta.migrar(sel, pin, login, senha); setPin(''); aberta(s); } catch (z) { setMsg(z instanceof Error ? z.message : 'Não deu.'); }
            }}>
              <p className="fluxo-sub">{semPin ? 'Crie' : 'PIN certo! Agora o acesso é com login e senha. Crie'} o login e a senha de <b>{antigas.find((c) => c.id === sel)?.nome}</b> (o PIN deixa de valer).</p>
              <CampoTexto rotulo="Login (e-mail ou nome de usuário)" valor={login} aoMudar={setLogin} testId="migrar-login" auto="username" foco />
              <div className="acesso-duas">
                <CampoSenha valor={senha} aoMudar={setSenha} testId="migrar-senha" nova />
                <CampoSenha rotulo="Repita a senha" valor={senha2} aoMudar={setSenha2} testId="migrar-senha2" nova />
              </div>
              <p className={`acesso-erro ${msg ? '' : 'vazio'}`} role={msg ? 'alert' : undefined}>{msg}</p>
              <button className="btn grande verde acesso-entrar" type="submit" data-testid="migrar-salvar"><Icone nome="check" />Salvar e entrar</button>
            </form>
          ) : null}

          <p className="acesso-nota"><Icone nome="escudo" />Sem servidor por enquanto: o login vale só neste aparelho e neste navegador.</p>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ guarda das áreas dos adultos */
/**
 * Só mostra o conteúdo para um adulto com sessão aberta (login e senha). `tipo` restringe à área: responsável →
 * Família, professor → Professor. Sem conta nenhuma no aparelho, a primeira conta é criada ali mesmo.
 */
export function Protegido({ tipo, children }: { tipo?: TipoConta; children: ReactNode }) {
  const conta = useConta();
  const [contas, setContas] = useState<Conta[] | null>(null);
  const [sessao, setSessao] = useState<Sessao | null>(() => conta.sessao());
  const recarregar = () => conta.listar().then(setContas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void recarregar(); }, [conta]);
  if (sessao && (!tipo || sessao.tipo === tipo)) return <>{children}</>;
  if (!contas) return <Carregando />;
  const entrou = (s: Sessao) => { setSessao(s); void recarregar(); };
  if (!contas.length) return <CriarConta tipoFixo={tipo} aoCriar={entrou} aviso="Primeira conta deste aparelho: escolha um login e uma senha que você vai lembrar." />;
  // uma sessão de outro tipo já confirma que é um adulto cadastrado (pode criar a conta que falta sem confirmar de novo)
  return <AcessoAdulto key={tipo ?? 'qualquer'} tipo={tipo} contas={contas} aoEntrar={entrou} sessaoAberta={!!sessao} />;
}
