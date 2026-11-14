/**
 * Sofia e Tales em 3D (render de filme, recorte com transparência) para as páginas principais.
 * Poses em public/assets/dupla3d/. Entra com animação suave e "respira" (leve movimento) por CSS.
 * Ponto de troca: quando o componente PersonagemVivo (giro 360° e boca falando) estiver pronto,
 * basta trocar o <img> daqui por ele — as telas só usam <Dupla3D pose=… />.
 */
import { asset } from '../servicos/ambiente.ts';

export type PoseDupla = 'parado' | 'acenando' | 'apontando' | 'pensando' | 'comemorando';
const DESCRICAO: Record<PoseDupla, string> = {
  parado: 'Sofia e Tales sorrindo',
  acenando: 'Sofia e Tales acenando',
  apontando: 'Sofia e Tales apontando',
  pensando: 'Sofia e Tales pensando',
  comemorando: 'Sofia e Tales comemorando'
};

export function Dupla3D({ pose = 'parado', className = '', decorativa = false }: { pose?: PoseDupla; className?: string; decorativa?: boolean }) {
  return (
    <div className={`dupla3d ${className}`} data-pose={pose}>
      <span className="dupla3d-sombra" aria-hidden="true" />
      {/* a chave refaz a animação de entrada quando a pose muda */}
      <img key={pose} src={asset(`dupla3d/${pose}.webp`)} alt={decorativa ? '' : DESCRICAO[pose]} aria-hidden={decorativa || undefined} draggable={false} />
    </div>
  );
}
