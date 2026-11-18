/**
 * Cartão da CAÇA AO TESOURO no Brincar → Jogos (fila do dono nº 25): abre o passeio 3D direto no mapa da caça
 * (#/c/:id/mundo/caca). Só aparece quando o aparelho mostra o 3D (sem ele, o passeio volta para a vila).
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { RECURSOS } from '@fonema/conteudo';
import { cacaAberta, dadosBiblioteca, type Progresso } from '@fonema/motor';
import { navegar } from '../../../rotas.ts';
import { Figura, Icone } from '../../../componentes/ui.tsx';
import { mundo3dDisponivel } from '../../../servicos/ambiente.ts';
import { Falta, SeloNovo, ehNovo, marcarVistoAqui } from '../../../componentes/Desbloqueio.tsx';

export function CartaoCaca({ criancaId, progresso, k, faltaMissoes }: { criancaId: string; progresso: Progresso; k: number; faltaMissoes?: number | null }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { let vivo = true; void mundo3dDisponivel().then((v) => { if (vivo) setOk(v); }); return () => { vivo = false; }; }, []);
  if (!ok || !RECURSOS.mundo3d) return null;
  const aberto = cacaAberta(progresso);
  const vezes = dadosBiblioteca(progresso).jogos.filter((x) => x.id.startsWith('caca-tesouro')).length;
  const id = 'jogo:caca';
  return (
    <button className={`brincar-jogo-cartao cor-mar ${aberto ? '' : 'trancado'}`} style={{ ['--k' as string]: k } as CSSProperties}
      onClick={() => { marcarVistoAqui(criancaId, id); navegar(`c/${criancaId}/mundo/caca`); }} data-testid="jogo-caca" data-aberto={aberto ? '1' : '0'}>
      <span className="brincar-figs" aria-hidden="true"><Figura palavra="mapa" /></span>
      <b>Caça ao Tesouro</b>
      {aberto ? <small>Ouvir o som e achar o baú pela vila (e de barco!)</small> : <Falta texto="Abre com o primeiro som da trilha." n={faltaMissoes} compacto />}
      {aberto && ehNovo(progresso, criancaId, id) ? <SeloNovo /> : vezes ? <span className="biblio-selo"><Icone nome="check" />{vezes}×</span> : null}
    </button>
  );
}
