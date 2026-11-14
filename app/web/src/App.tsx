import { useRota } from './rotas.ts';
import { AdultoHome, Configuracoes, FamiliaHome, PainelFamilia, Professor, type AbaProfessor } from './telas/adulto/Adulto.tsx';
import { Cadastro } from './telas/adulto/Cadastro.tsx';
import { Alunos, Entrada, PrimeiraVez, Protegido, useConta } from './telas/entrada/Entrada.tsx';
import { Avatar } from './telas/crianca/Avatar.tsx';
import { Arquipelago, Chegada, EntradaFase, Regiao, Vila } from './telas/crianca/Mundo.tsx';
import { TrilhaAlfabeto } from './telas/crianca/Alfabeto.tsx';
import { Sessao } from './telas/crianca/Sessao.tsx';
import { Album, ConhecaSeuCorpo, Lojinha, MostraProfessor, Mundo3D, Sondagem } from './telas/crianca/Extras.tsx';

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
        {sub === 'cadastro' ? <Cadastro area="familia" /> : sub === 'crianca' && id ? <PainelFamilia criancaId={id} /> : sub === 'config' ? <Configuracoes area="familia" /> : <FamiliaHome />}
      </Protegido>
    );
  }
  if (raiz === 'professor') {
    return (
      <Protegido tipo="professor">
        {sub === 'cadastro' ? <Cadastro area="professor" /> : sub === 'config' ? <Configuracoes area="professor" /> : <Professor aba={ABAS[sub] ?? 'turma'} />}
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
    switch (t) {
      case 'avatar': return <Avatar criancaId={cid} />;
      case 'chegada': return <Chegada criancaId={cid} />;
      case 'mapa': return <Arquipelago criancaId={cid} />;
      case 'alfabeto': return <TrilhaAlfabeto criancaId={cid} />;
      case 'regiao': return arg === 'AL' ? <TrilhaAlfabeto criancaId={cid} /> : <Regiao criancaId={cid} regiaoId={arg} />;
      case 'fase': return <EntradaFase key={arg} criancaId={cid} faseId={arg} />;
      case 'sessao': return <Sessao key={arg + location.hash} criancaId={cid} faseId={arg} />;
      case 'lojinha': return <Lojinha criancaId={cid} />;
      case 'album': return <Album criancaId={cid} />;
      case 'corpo': return <ConhecaSeuCorpo criancaId={cid} />;
      case 'mostra': return <MostraProfessor criancaId={cid} faseId={arg} />;
      case 'sondagem': return <Sondagem criancaId={cid} />;
      case 'mundo': return <Mundo3D criancaId={cid} />;
      default: return <Vila criancaId={cid} />;
    }
  }
  return <Entrada />;
}

function areaDaSessao(tipo?: string) { return tipo === 'professor' ? 'professor' as const : 'familia' as const; }
function CadastroDaSessao() { return <Cadastro area={areaDaSessao(useConta().sessao()?.tipo)} />; }
function ConfigDaSessao() { return <Configuracoes area={areaDaSessao(useConta().sessao()?.tipo)} />; }
