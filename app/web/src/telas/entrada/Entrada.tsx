/**
 * Primeira página e acesso (Decisão 028): a primeira tela é sempre "Entrar no FONEMA", com quatro caminhos —
 * Sou aluno(a) · Sou pai, mãe ou responsável · Sou professor(a) · Primeira vez aqui. Cada um leva a uma área diferente.
 * O adulto entra com PIN de 4 dígitos (conta guardada neste aparelho, ver servicos/conta.ts); a criança nunca digita senha.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { calcularNivel, fasesConcluidas, missaoInicialFeita, type Crianca, type Progresso } from '@fonema/motor';
import { useApp } from '../../contexto.tsx';
import { navegar } from '../../rotas.ts';
import { Ajustes, AvatarMini, Carregando, Topo } from '../../componentes/basicos.tsx';
import { BotaoSegurar, Fundo, Icone, Logo } from '../../componentes/ui.tsx';
import { Dupla3D, type PoseDupla } from '../../componentes/Dupla3D.tsx';
import { asset } from '../../servicos/ambiente.ts';
import { ROTULO_TIPO, pinValido, servicoConta, type Conta, type Sessao, type TipoConta } from '../../servicos/conta.ts';

export function useConta() {
  const { repo } = useApp();
  return useMemo(() => servicoConta(repo), [repo]);
}

const nivelDe = (p?: Progresso) => (p ? calcularNivel(p.desafios, missaoInicialFeita(p), fasesConcluidas(p)) : null);
const ultimoPerfil = () => { try { return localStorage.getItem('fonema-ultimo-perfil'); } catch { return null; } };
const NOME_AREA: Record<TipoConta, string> = { responsavel: 'Área da Família', professor: 'Área do Professor' };
const ROTA_AREA: Record<TipoConta, string> = { responsavel: 'familia', professor: 'professor' };

/* ------------------------------------------------------------------ primeira página */
export function Entrada() {
  const { repo, pronto, prefs } = useApp();
  const [criancas, setCriancas] = useState<Crianca[] | null>(null);
  const video = useRef<HTMLVideoElement>(null);
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
    <div className="tela-entrada" data-testid="inicio">
      <img className="entrada-midia paisagem" src={asset('arte/hero-paisagem.webp')} alt="" />
      {!semMovimento ? (
        <video ref={video} className="entrada-midia paisagem" src={asset('arte/hero-loop.mp4')} poster={asset('arte/hero-paisagem.webp')} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      ) : null}
      <img className="entrada-midia retrato" src={asset('arte/hero-retrato.webp')} alt="" />
      <div className="entrada-veu" aria-hidden="true" />

      <div className="entrada-cima"><Ajustes /></div>

      <div className="entrada-conteudo">
        <div className="entrada-logo"><Logo tamanho="g" subtitulo animar /></div>
        <main className="entrada-painel" aria-labelledby="entrada-titulo">
          <h1 id="entrada-titulo" className="entrada-titulo">Quem vai entrar?</h1>
          <div className="portas">
            <button className="porta porta-aluno" onClick={() => navegar('aluno')} data-testid="entrar-aluno">
              <span className="porta-arte">
                {ultima ? <AvatarMini crianca={ultima} tamanho={84} /> : <img className="porta-dupla" src={asset('dupla3d/acenando.webp')} alt="" />}
              </span>
              <span className="porta-texto"><b>Sou aluno(a)</b><small>{ultima ? `Continuar a aventura, ${ultima.nome}!` : 'Entrar na aventura'}</small></span>
              <Icone nome="seta" className="porta-seta" />
            </button>
            <button className="porta porta-familia" onClick={() => navegar('familia')} data-testid="entrar-familia">
              <span className="porta-arte porta-par"><img src={asset('figuras/mamae.webp')} alt="" /><img src={asset('figuras/papai.webp')} alt="" /></span>
              <span className="porta-texto"><b>Sou pai, mãe ou responsável</b><small>Área da Família</small></span>
              <Icone nome="seta" className="porta-seta" />
            </button>
            <button className="porta porta-professor" onClick={() => navegar('professor')} data-testid="entrar-professor">
              <span className="porta-arte"><img src={asset('recompensas/bau-livros.webp')} alt="" /></span>
              <span className="porta-texto"><b>Sou professor(a)</b><small>Área do Professor</small></span>
              <Icone nome="seta" className="porta-seta" />
            </button>
            <button className="porta porta-nova" onClick={() => navegar('primeira-vez')} data-testid="primeira-vez">
              <span className="porta-arte"><img src={asset('figuras/estrela.webp')} alt="" /></span>
              <span className="porta-texto"><b>Primeira vez aqui</b><small>Criar conta e cadastrar a criança</small></span>
              <Icone nome="seta" className="porta-seta" />
            </button>
          </div>
          <p className="entrada-nota"><Icone nome="escudo" />Por enquanto sua conta fica guardada neste aparelho.</p>
        </main>
      </div>
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
      <Fundo cena="arte/hero-paisagem" desfoque={16} tom="claro" />
      <Topo voltar="" titulo="Alunos" />
      <main className="alunos-palco">
        {lista.length ? (
          <>
            <h1 className="t alunos-titulo">Quem é você?</h1>
            <p className="alunos-sub">Toque no seu cartão para entrar na aventura.</p>
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
export function Fluxo({ titulo, voltar, pose, quem, fala, children, cena = 'quintal', testId }: { titulo: string; voltar: string; pose: PoseDupla; quem: string; fala: string; children: ReactNode; cena?: string; testId?: string }) {
  return (
    <div className="tela-fluxo" data-testid={testId}>
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

/* ------------------------------------------------------------------ primeira vez: criar a conta do adulto */
export function CriarConta({ tipoFixo, aoCriar, voltar = '', aviso }: { tipoFixo?: TipoConta; aoCriar: (s: Sessao) => void; voltar?: string; aviso?: string }) {
  const conta = useConta();
  const [passo, setPasso] = useState<'quem' | 'pin'>('quem');
  const [tipo, setTipo] = useState<TipoConta>(tipoFixo ?? 'responsavel');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [campo, setCampo] = useState<1 | 2>(1);
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const nomeOk = nome.trim().length >= 2;
  const emailOk = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  const pinsOk = pinValido(pin) && pin === pin2;
  const digitar = (d: string) => {
    if (campo === 1) { const v = (pin + d).slice(0, 4); setPin(v); if (v.length === 4) setCampo(2); }
    else setPin2((pin2 + d).slice(0, 4));
  };
  const apagar = () => { if (campo === 2 && pin2) setPin2(pin2.slice(0, -1)); else if (campo === 2) { setCampo(1); setPin(pin.slice(0, -1)); } else setPin(pin.slice(0, -1)); };
  const criar = async () => {
    setTentou(true);
    if (!pinsOk || salvando) return;
    setSalvando(true);
    try { aoCriar(await conta.criar({ nome, tipo, email, pin })); } finally { setSalvando(false); }
  };
  const erroPin = tentou && !pinsOk ? (!pinValido(pin) ? 'O PIN precisa ter 4 números.' : 'Os dois PINs estão diferentes. Digite de novo.') : pin2.length === 4 && pin !== pin2 ? 'Os dois PINs estão diferentes. Digite de novo.' : '';
  return (
    <Fluxo
      titulo="Primeira vez aqui" voltar={voltar} testId="criar-conta"
      pose={passo === 'quem' ? 'acenando' : 'apontando'} quem={passo === 'quem' ? 'Sofia' : 'Tales'}
      fala={passo === 'quem' ? 'Que bom que você chegou! Primeiro, a conta do adulto.' : 'Crie um PIN de 4 números. Só os adultos usam.'}
    >
      <section className="cartao fluxo-cartao">
        <div className="progresso" role="img" aria-label={`Conta do adulto: parte ${passo === 'quem' ? 1 : 2} de 2`}>
          <span className="progresso-rotulo">Conta do adulto · <b>{passo === 'quem' ? 1 : 2} de 2</b></span>
          <span className="progresso-barra"><i style={{ width: passo === 'quem' ? '50%' : '100%' }} /></span>
        </div>
        {passo === 'quem' ? (
          <form className="fluxo-corpo" key="quem" onSubmit={(e) => { e.preventDefault(); setTentou(true); if (nomeOk && emailOk) { setTentou(false); setPasso('pin'); } }} id="form-conta">
            <h1 className="t">Quem é você?</h1>
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
            ) : <p className="fluxo-sub">Conta de <b>{ROTULO_TIPO[tipoFixo].toLowerCase()}</b>.</p>}
            <label className="campo campo-junto">
              <span>Seu nome</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como você se chama?" autoComplete="off" autoCapitalize="words" data-testid="conta-nome" aria-invalid={tentou && !nomeOk || undefined} />
              {tentou && !nomeOk ? <small className="aviso-campo" role="alert">Escreva o seu nome para continuar.</small> : null}
            </label>
            <label className="campo campo-junto">
              <span>E-mail <em>(opcional)</em></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="off" data-testid="conta-email" aria-invalid={tentou && !emailOk || undefined} />
              {tentou && !emailOk ? <small className="aviso-campo" role="alert">Confira o e-mail (ou deixe em branco).</small> : null}
            </label>
          </form>
        ) : (
          <div className="fluxo-corpo" key="pin">
            <h1 className="t">Crie seu PIN</h1>
            <p className="fluxo-sub">4 números fáceis de lembrar, para entrar na {NOME_AREA[tipo]}.</p>
            <div className="pin-dupla">
              <CampoPin rotulo="PIN" valor={pin} aoMudar={(v) => { setPin(v); if (v.length === 4) setCampo(2); }} testId="conta-pin" ativo={campo === 1} aoFocar={() => setCampo(1)} focoInicial />
              <CampoPin rotulo="Repita o PIN" valor={pin2} aoMudar={setPin2} testId="conta-pin2" ativo={campo === 2} aoFocar={() => setCampo(2)} erro={!!erroPin} />
            </div>
            <p className={`pin-msg ${erroPin ? 'erro' : ''}`} role={erroPin ? 'alert' : undefined}>{erroPin || 'A criança não usa senha: entra pelo cartão dela.'}</p>
            <Teclado aoDigitar={digitar} aoApagar={apagar} />
          </div>
        )}
        <footer className="fluxo-pe">
          {passo === 'pin' ? <button className="btn" onClick={() => setPasso('quem')}><Icone nome="seta-esq" />Voltar</button> : <span className="fluxo-pe-nota"><Icone nome="escudo" />Por enquanto sua conta fica guardada neste aparelho.</span>}
          {passo === 'quem'
            ? <button className="btn grande pri" type="submit" form="form-conta" data-testid="conta-continuar">Continuar<Icone nome="seta" /></button>
            : <button className="btn grande verde" onClick={criar} disabled={salvando} data-testid="conta-criar"><Icone nome="check" />Criar conta</button>}
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
  // já existe conta neste aparelho: um adulto cadastrado confirma o PIN antes de criar outra
  if (contas.length && !sessao) {
    return <TelaPin contas={contas} aoEntrar={setSessao} titulo="Este aparelho já tem conta" sub="Para criar outra conta, um adulto já cadastrado digita o PIN." voltar="" />;
  }
  return <CriarConta aoCriar={(s) => navegar(`${ROTA_AREA[s.tipo]}/cadastro`)} />;
}

/* ------------------------------------------------------------------ entrar com PIN */
export function TelaPin({ contas, tipo, aoEntrar, titulo, sub, voltar = '' }: { contas: Conta[]; tipo?: TipoConta; aoEntrar: (s: Sessao) => void; titulo?: string; sub?: string; voltar?: string }) {
  const conta = useConta();
  const [sel, setSel] = useState(contas[0].id);
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [modo, setModo] = useState<'entrar' | 'esqueci' | 'novo'>('entrar');
  const [novo, setNovo] = useState('');
  const [novo2, setNovo2] = useState('');
  const [campo, setCampo] = useState<1 | 2>(1);
  const verificando = useRef(false);
  const escolhida = contas.find((c) => c.id === sel) ?? contas[0];

  const tentar = async (v: string) => {
    if (verificando.current) return;
    verificando.current = true;
    const r = await conta.entrar(escolhida.id, v);
    verificando.current = false;
    if (r.ok) { aoEntrar(r.sessao); return; }
    setPin('');
    setMsg(r.motivo === 'espera' ? `Muitas tentativas. Espere ${r.segundos} segundos e tente de novo.` : 'PIN incorreto. Tente de novo.');
  };
  const mudar = (v: string) => { setPin(v); setMsg(''); if (v.length === 4) void tentar(v); };
  const novoOk = pinValido(novo) && novo === novo2;

  const arte = tipo === 'professor' ? <img src={asset('recompensas/bau-livros.webp')} alt="" /> : tipo === 'responsavel' ? <span className="porta-par"><img src={asset('figuras/mamae.webp')} alt="" /><img src={asset('figuras/papai.webp')} alt="" /></span> : <img src={asset('arte/icones/cadeado.webp')} alt="" />;
  return (
    <div className="tela-fluxo tela-pin" data-testid="tela-pin">
      <Fundo cena="arte/hero-paisagem" desfoque={16} tom="escuro" />
      <Topo voltar={voltar} titulo={tipo ? NOME_AREA[tipo] : 'Área dos adultos'} />
      <main className="pin-palco">
        <section className="cartao pin-cartao">
          <div className="pin-arte">{arte}</div>
          {modo === 'entrar' ? (
            <>
              <h1 className="t">{titulo ?? (tipo ? NOME_AREA[tipo] : 'Área dos adultos')}</h1>
              <p className="fluxo-sub">{sub ?? `Olá, ${escolhida.nome}! Digite seu PIN de 4 números.`}</p>
              {contas.length > 1 ? (
                <div className="pin-contas" role="group" aria-label="Quem está entrando?">
                  {contas.map((c) => <button key={c.id} className="pin-conta" aria-pressed={c.id === sel} onClick={() => { setSel(c.id); setPin(''); setMsg(''); }}>{c.nome}<small>{c.tipo === 'professor' ? 'professor(a)' : 'família'}</small></button>)}
                </div>
              ) : null}
              <CampoPin rotulo="PIN" valor={pin} aoMudar={mudar} testId="pin" ativo erro={!!msg} focoInicial />
              <p className={`pin-msg ${msg ? 'erro' : ''}`} role={msg ? 'alert' : undefined} data-testid="pin-msg">{msg || ' '}</p>
              <Teclado aoDigitar={(d) => mudar((pin + d).slice(0, 4))} aoApagar={() => mudar(pin.slice(0, -1))} />
              <button className="link" onClick={() => setModo('esqueci')} data-testid="esqueci-pin">Esqueci o PIN</button>
            </>
          ) : modo === 'esqueci' ? (
            <>
              <h1 className="t">Esqueceu o PIN?</h1>
              <p className="fluxo-sub">Segure o botão por 5 segundos para criar um PIN novo para <b>{escolhida.nome}</b>. Os dados das crianças continuam guardados.</p>
              <BotaoSegurar ms={5000} aoCompletar={() => setModo('novo')} rotulo="Redefinir o PIN" testId="segurar-redefinir" />
              <p className="pin-msg">Por enquanto a conta fica só neste aparelho; por isso a redefinição é feita aqui mesmo.</p>
              <button className="link" onClick={() => setModo('entrar')}>Lembrei! Voltar</button>
            </>
          ) : (
            <>
              <h1 className="t">Novo PIN</h1>
              <p className="fluxo-sub">Escolha 4 números e repita para confirmar.</p>
              <div className="pin-dupla">
                <CampoPin rotulo="Novo PIN" valor={novo} aoMudar={(v) => { setNovo(v); if (v.length === 4) setCampo(2); }} testId="novo-pin" ativo={campo === 1} aoFocar={() => setCampo(1)} focoInicial />
                <CampoPin rotulo="Repita" valor={novo2} aoMudar={setNovo2} testId="novo-pin2" ativo={campo === 2} aoFocar={() => setCampo(2)} erro={novo2.length === 4 && novo !== novo2} />
              </div>
              <p className={`pin-msg ${novo2.length === 4 && novo !== novo2 ? 'erro' : ''}`}>{novo2.length === 4 && novo !== novo2 ? 'Os dois PINs estão diferentes.' : ' '}</p>
              <Teclado
                aoDigitar={(d) => { if (campo === 1) { const v = (novo + d).slice(0, 4); setNovo(v); if (v.length === 4) setCampo(2); } else setNovo2((novo2 + d).slice(0, 4)); }}
                aoApagar={() => { if (campo === 2 && novo2) setNovo2(novo2.slice(0, -1)); else { setCampo(1); setNovo(novo.slice(0, -1)); } }}
              />
              <button className="btn grande verde" disabled={!novoOk} onClick={async () => aoEntrar(await conta.redefinirPin(escolhida.id, novo))} data-testid="confirmar-novo-pin"><Icone nome="check" />Confirmar e entrar</button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ guarda das áreas dos adultos */
/**
 * Só mostra o conteúdo para um adulto com sessão aberta (PIN). `tipo` restringe à área: responsável → Família,
 * professor → Professor. Sem conta nenhuma no aparelho, leva para "Primeira vez aqui".
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
  const candidatas = tipo ? contas.filter((c) => c.tipo === tipo) : contas;
  const entrou = (s: Sessao) => { setSessao(s); void recarregar(); };
  if (candidatas.length) return <TelaPin contas={candidatas} tipo={tipo} aoEntrar={entrou} />;
  if (!contas.length) return <CriarConta tipoFixo={tipo} aoCriar={entrou} />;
  // há contas, mas nenhuma deste tipo: um adulto já cadastrado confirma o PIN e cria a conta que falta
  if (!sessao) return <TelaPin contas={contas} aoEntrar={entrou} titulo={`Ainda não há conta de ${tipo === 'professor' ? 'professor(a)' : 'responsável'}`} sub="Para criar essa conta, um adulto já cadastrado digita o PIN." />;
  return <CriarConta tipoFixo={tipo} aoCriar={entrou} aviso={`Este aparelho ainda não tem conta de ${tipo === 'professor' ? 'professor(a)' : 'responsável'}. Crie agora: leva um minuto.`} />;
}
