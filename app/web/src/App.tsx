import { useEffect, type ReactNode } from 'react';
import { navegar, useRota } from './rotas.ts';
import { Carregando } from './componentes/basicos.tsx';
import { EstudioSons } from './telas/adulto/EstudioSons.tsx';
import { AdultoHome, Configuracoes, FamiliaHome, PainelFamilia, Professor, type AbaProfessor } from './telas/adulto/Adulto.tsx';
import { Cadastro } from './telas/adulto/Cadastro.tsx';
import { Alunos, Entrada, PrimeiraVez, Protegido, useConta } from './telas/entrada/Entrada.tsx';
import { Avatar } from './telas/crianca/Avatar.tsx';
import { Arquipelago, Chegada, EntradaFase, Regiao, Vila } from './telas/crianca/Mundo.tsx';
import { TrilhaAlfabeto } from './telas/crianca/Alfabeto.tsx';
import { TrilhaSons } from './telas/crianca/TrilhaSons.tsx';
import { Sessao } from './telas/crianca/Sessao.tsx';
import { Album, ConhecaSeuCorpo, MostraProfessor, Mundo3D } from './telas/crianca/Extras.tsx';
import { SondagemDaVila } from './telas/crianca/Sondagem.tsx';
import { Treino } from './telas/crianca/Treino.tsx';
import { Lojinha } from './telas/crianca/Lojinha.tsx';
import { useCrianca } from './contexto.tsx';

/**
 * Rotas (hash) — Decisão 028: a primeira página é sempre "Entrar no FONEMA".
 * #/ entrada · #/aluno cartões das crianças · #/primeira-vez criar conta · #/familia/... Área da Família (PIN)
 * · #/professor/... Área do Professor (PIN) · #/c/:id/... aventura da criança · #/adulto/... (rotas antigas, redirecionadas)
 */
export function App() {
  const r = useRota();
  // transição de página: cada rota entra com fade/slide (desligada em "menos movimento" pelo CSS)
  return <div className="pagina" key={r.join('/')}>{tela(r)}</div>;
}

const ABAS: Record<string, AbaProfessor> = { fila: 'fila', habilidades: 'habilidades', palavras: 'palavras' };

function tela(r: string[]) {
  const [raiz, sub, id] = r;
  if (raiz === 'aluno') return <Alunos />;
  if (raiz === 'primeira-vez') return <PrimeiraVez />;
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
