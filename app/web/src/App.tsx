import { useRota } from './rotas.ts';
import { Inicio, AdultoHome, PainelFamilia, Porteira, Professor, Configuracoes } from './telas/adulto/Adulto.tsx';
import { Cadastro } from './telas/adulto/Cadastro.tsx';
import { Avatar } from './telas/crianca/Avatar.tsx';
import { Arquipelago, Chegada, EntradaFase, Regiao, Vila } from './telas/crianca/Mundo.tsx';
import { Sessao } from './telas/crianca/Sessao.tsx';
import { Album, ConhecaSeuCorpo, Lojinha, MostraProfessor, Mundo3D, Sondagem } from './telas/crianca/Extras.tsx';

/** Rotas (hash): #/ · #/adulto/... · #/c/:id/... */
export function App() {
  const r = useRota();
  // transição de página: cada rota entra com fade/slide (desligada em "menos movimento" pelo CSS)
  return <div className="pagina" key={r.join('/')}>{tela(r)}</div>;
}

function tela(r: string[]) {
  if (r[0] === 'adulto') {
    const [, sub, id] = r;
    return (
      <Porteira>
        {sub === 'cadastro' ? <Cadastro /> : sub === 'familia' && id ? <PainelFamilia criancaId={id} /> : sub === 'professor' ? <Professor /> : sub === 'config' ? <Configuracoes /> : <AdultoHome />}
      </Porteira>
    );
  }
  if (r[0] === 'c' && r[1]) {
    const [, id, tela, arg] = r;
    switch (tela) {
      case 'avatar': return <Avatar criancaId={id} />;
      case 'chegada': return <Chegada criancaId={id} />;
      case 'mapa': return <Arquipelago criancaId={id} />;
      case 'regiao': return <Regiao criancaId={id} regiaoId={arg} />;
      case 'fase': return <EntradaFase key={arg} criancaId={id} faseId={arg} />;
      case 'sessao': return <Sessao key={arg + location.hash} criancaId={id} faseId={arg} />;
      case 'lojinha': return <Lojinha criancaId={id} />;
      case 'album': return <Album criancaId={id} />;
      case 'corpo': return <ConhecaSeuCorpo criancaId={id} />;
      case 'mostra': return <MostraProfessor criancaId={id} faseId={arg} />;
      case 'sondagem': return <Sondagem criancaId={id} />;
      case 'mundo': return <Mundo3D criancaId={id} />;
      default: return <Vila criancaId={id} />;
    }
  }
  return <Inicio />;
}
