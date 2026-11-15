/**
 * Sofia, Tales e Bolota em 3D de verdade (modelos GLB da plataforma de 3D, estilo filme de animação), para as telas
 * em que a dupla aparece grande e não está falando (chegada, Álbum, sondagem, treino). Arrastar gira; sozinhos eles
 * balançam devagar, sempre voltando de frente, e "respiram" (os modelos não têm esqueleto: a respiração é escala).
 * Onde a BOCA importa (a fala no balão), continua o busto vivo (PersonagemVivo modo="busto").
 *
 * three.js e os modelos só carregam quando o componente aparece (import dinâmico em recompensas.tsx › Objeto3D);
 * sem WebGL fica a imagem parada tirada do próprio modelo (assets/modelos3d/<nome>.webp). "Menos movimento":
 * sem balanço nem respiração; arrastar continua valendo.
 */
import { Modelo3D } from './recompensas.tsx';
import type { Modo } from './premio3d.ts';

/** A dupla lado a lado, levemente virados um para o outro. `altura` em px (a largura sai da proporção dos modelos). */
export function Dupla3DGiravel({ altura = 420, modo = 'balanco', className = '' }: { altura?: number; modo?: Modo; className?: string }) {
  const largura = Math.round((altura * 0.62) / 1.16);
  return (
    <div className={`dupla-giravel ${className}`} role="group" aria-label="Sofia e Tales em 3D. Arraste para girar.">
      <Modelo3D qual="sofia" tamanho={largura} modo={modo} />
      <Modelo3D qual="tales" tamanho={largura} modo={modo} />
    </div>
  );
}

export { Modelo3D };
