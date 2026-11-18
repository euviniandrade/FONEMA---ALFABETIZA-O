import { Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react';
import { navegar, useRota } from './rotas.ts';
import { Carregando } from './componentes/basicos.tsx';
import { Alunos, Entrada, PrimeiraVez, Protegido, useConta } from './telas/entrada/Entrada.tsx';
import type { AbaProfessor } from './telas/adulto/Adulto.tsx';

/**
 * Primeiro acesso leve: só a entrada vem no JS inicial; as outras telas chegam sob demanda (cada arquivo vira um
 * pedaço separado). O service worker guarda todos os pedaços no aparelho, então depois de instalado tudo abre sem internet.
 */
function sob<M, K extends keyof M>(carregar: () => Promise<M>, nome: K): M[K] {
  // o componente preguiçoso tem as mesmas props do original (a tipagem continua conferida)
  return lazy(() => carregar().then(
    (m) => { pedacoCarregou(); return { default: m[nome] as unknown as ComponentType<object> }; },
    pedacoFaltou
  )) as unknown as M[K];
}
/**
 * Versão nova publicada com a página aberta: os pedaços da versão antiga somem (e o service worker novo apaga os dele).
 * Em vez de a tela ficar em branco, recarrega a página UMA vez para pegar a versão nova (que tem os pedaços certos).
 */
const CHAVE_RECARGA = 'fonema-recarga-pedaco';
function pedacoCarregou() { try { sessionStorage.removeItem(CHAVE_RECARGA); } catch { /* sem armazenamento */ } }
function pedacoFaltou(erro: unknown): never | Promise<never> {
  let ultima = 0;
  try { ultima = Number(sessionStorage.getItem(CHAVE_RECARGA) ?? 0); } catch { /* sem armazenamento */ }
  if (Date.now() - ultima > 15000) {
    try { sessionStorage.setItem(CHAVE_RECARGA, String(Date.now())); } catch { /* sem armazenamento */ }
    location.reload();
    return new Promise<never>(() => undefined); // a página vai recarregar: fica no "Carregando…"
  }
  throw erro;
}
const adulto = () => import('./telas/adulto/Adulto.tsx');
const mundo = () => import('./telas/crianca/Mundo.tsx');
const extras = () => import('./telas/crianca/Extras.tsx');
const EstudioSons = sob(() => import('./telas/adulto/EstudioSons.tsx'), 'EstudioSons');
const Admin = sob(() => import('./telas/admin/Admin.tsx'), 'Admin');
const AdultoHome = sob(adulto, 'AdultoHome');
const Configuracoes = sob(adulto, 'Configuracoes');
const FamiliaHome = sob(adulto, 'FamiliaHome');
const PainelFamilia = sob(adulto, 'PainelFamilia');
const Professor = sob(adulto, 'Professor');
const Cadastro = sob(() => import('./telas/adulto/Cadastro.tsx'), 'Cadastro');
const Avatar = sob(() => import('./telas/crianca/Avatar.tsx'), 'Avatar');
const Arquipelago = sob(mundo, 'Arquipelago');
const Chegada = sob(mundo, 'Chegada');
const EntradaFase = sob(mundo, 'EntradaFase');
const Regiao = sob(mundo, 'Regiao');
const Vila = sob(mundo, 'Vila');
const TrilhaAlfabeto = sob(() => import('./telas/crianca/Alfabeto.tsx'), 'TrilhaAlfabeto');
const TrilhaSons = sob(() => import('./telas/crianca/TrilhaSons.tsx'), 'TrilhaSons');
const Sessao = sob(() => import('./telas/crianca/Sessao.tsx'), 'Sessao');
const Album = sob(extras, 'Album');
const ConhecaSeuCorpo = sob(extras, 'ConhecaSeuCorpo');
const MostraProfessor = sob(extras, 'MostraProfessor');
const Mundo3D = sob(extras, 'Mundo3D');
const SondagemDaVila = sob(() => import('./telas/crianca/Sondagem.tsx'), 'SondagemDaVila');
const Treino = sob(() => import('./telas/crianca/Treino.tsx'), 'Treino');
const Biblioteca = sob(() => import('./telas/crianca/Biblioteca.tsx'), 'Biblioteca');
const BrincarSons = sob(() => import('./telas/crianca/BrincarSons.tsx'), 'BrincarSons');
const JogosVila = sob(() => import('./telas/crianca/JogosVila.tsx'), 'JogosVila');
const MemoriaDosSons = sob(() => import('./telas/crianca/MemoriaDosSons.tsx'), 'MemoriaDosSons');
const Lojinha = sob(() => import('./telas/crianca/Lojinha.tsx'), 'Lojinha');
const Tutorial = sob(() => import('./telas/crianca/Tutorial.tsx'), 'Tutorial');
import { useCrianca } from './contexto.tsx';

/**
 * Rotas (hash) — Decisão 028: a primeira página é sempre "Entrar no FONEMA".
 * #/ entrada · #/aluno cartões das crianças · #/primeira-vez criar conta · #/familia/... Área da Família (PIN)
 * · #/professor/... Área do Professor (PIN) · #/admin/... Área do administrador (senha) · #/c/:id/... aventura da criança · #/adulto/... (rotas antigas, redirecionadas)
 */
export function App() {
  const r = useRota();
  // transição de página: cada rota entra com fade/slide (desligada em "menos movimento" pelo CSS)
  return <div className="pagina" key={r.join('/')}><Suspense fallback={<Carregando />}>{tela(r)}</Suspense></div>;
}

const ABAS: Record<string, AbaProfessor> = { fila: 'fila', habilidades: 'habilidades', palavras: 'palavras' };

function tela(r: string[]) {
  const [raiz, sub, id] = r;
  if (raiz === 'aluno') return <Alunos />;
  if (raiz === 'primeira-vez') return <PrimeiraVez />;
  // D032 item 5: Área do administrador (senha própria, aba à parte; não usa o PIN dos adultos)
  if (raiz === 'admin') return <Admin aba={sub} sub={id} />;
  if (raiz === 'familia') {
    return (
      <Protegido tipo="responsavel">
        {sub === 'cadastro' ? <Cadastro area="familia" /> : sub === 'crianca' && id ? <PainelFamilia criancaId={id} /> : sub === 'sons' ? <EstudioSons /> : sub === 'config' ? <Configuracoes area="familia" /> : <FamiliaHome />}
      </Protegido>
    );
  }
  if (raiz === 'professor') {
    return (
      <Protegido tipo="professor">
        {sub === 'cadastro' ? <Cadastro area="professor" /> : sub === 'sons' ? <EstudioSons /> : sub === 'config' ? <Configuracoes area="professor" /> : <Professor aba={ABAS[sub] ?? 'turma'} />}
      </Protegido>
    );
  }
  if (raiz === 'adulto') {
    // rotas antigas: continuam funcionando, agora atrás do PIN do adulto
    if (sub === 'professor') return <Protegido tipo="professor"><Professor aba="fila" /></Protegido>;
    if (sub === 'familia' && id) return <Protegido tipo="responsavel"><PainelFamilia criancaId={id} /></Protegido>;
    return <Protegido>{sub === 'cadastro' ? <CadastroDaSessao /> : sub === 'config' ? <ConfigDaSessao /> : <AdultoHome />}</Protegido>;
  }
  if (raiz === 'c' && r[1]) {
    const [, cid, t, arg] = r;
    return <PortaoSexo criancaId={cid} rota={t}>{telaCrianca(cid, t, arg)}</PortaoSexo>;
  }
  return <Entrada />;
}

function areaDaSessao(tipo?: string) { return tipo === 'professor' ? 'professor' as const : 'familia' as const; }
function CadastroDaSessao() { return <Cadastro area={areaDaSessao(useConta().sessao()?.tipo)} />; }
function ConfigDaSessao() { return <Configuracoes area={areaDaSessao(useConta().sessao()?.tipo)} />; }

function telaCrianca(cid: string, t: string | undefined, arg: string) {
  switch (t) {
    case 'avatar': return <Avatar criancaId={cid} />;
    case 'chegada': return <Chegada criancaId={cid} />;
    case 'tutorial': return <Tutorial key={arg ?? ''} criancaId={cid} deNovo={arg === 'de-novo'} />;
    case 'mapa': return <Arquipelago criancaId={cid} />;
    case 'alfabeto': return <TrilhaAlfabeto criancaId={cid} />;
    case 'sons': return <TrilhaSons criancaId={cid} />;
    case 'regiao': return arg === 'AL' ? <TrilhaAlfabeto criancaId={cid} /> : arg === 'TF' ? <TrilhaSons criancaId={cid} /> : <Regiao criancaId={cid} regiaoId={arg} />;
    case 'fase': return <EntradaFase key={arg} criancaId={cid} faseId={arg} />;
    case 'sessao': return <Sessao key={arg + location.hash} criancaId={cid} faseId={arg} />;
    case 'lojinha': return <Lojinha criancaId={cid} />;
    case 'album': return <Album criancaId={cid} />;
    case 'corpo': return <ConhecaSeuCorpo criancaId={cid} />;
    case 'mostra': return <MostraProfessor criancaId={cid} faseId={arg} />;
    case 'sondagem': return <SondagemDaVila criancaId={cid} />;
    case 'treino': return <Treino criancaId={cid} />;
    case 'leitura': return <Biblioteca criancaId={cid} sub={arg} />;
    case 'brincar': return <BrincarSons criancaId={cid} jogoId={arg} />;
    case 'jogo': return <JogosVila key={arg ?? ''} criancaId={cid} jogoId={arg} />;
    case 'memoria': return <MemoriaDosSons key={arg ?? ''} criancaId={cid} faseId={arg || undefined} />;
    case 'mundo': return <Mundo3D criancaId={cid} />;
    default: return <Vila criancaId={cid} />;
  }
}

/**
 * D029: cadastros antigos com "prefiro não informar" pedem a escolha (menino ou menina) UMA vez, na montagem do
 * boneco, antes de qualquer outra tela da criança. Depois disso, nunca mais.
 */
function PortaoSexo({ criancaId, rota, children }: { criancaId: string; rota: string | undefined; children: ReactNode }) {
  const { crianca, carregado } = useCrianca(criancaId);
  const pendente = rota !== 'avatar' && !!crianca?.generoPendente;
  useEffect(() => { if (pendente) navegar(`c/${criancaId}/avatar`); }, [pendente, criancaId]);
  if (rota === 'avatar') return <>{children}</>;
  if (!carregado || pendente) return <Carregando />;
  return <>{children}</>;
}
