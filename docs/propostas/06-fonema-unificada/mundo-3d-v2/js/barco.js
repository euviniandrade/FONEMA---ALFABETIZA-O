// FONEMA · Mundo 3D v2 — BARQUINHO do passeio (caça ao tesouro, fila do dono nº 25).
//
// O barco é o da vila (vila.js › barco). Embarcando no píer (porta 'barco' de passeio.js), ele vira o VEÍCULO do passeio
// (passeio.usarVeiculo): as mesmas setinhas, joystick e "tocar para ir" agora remam. O barco só anda no rio (corredor pelo meio
// do rio, da ponte até depois do cais): na margem ele para. Desce no píer.
import { clamp, lerp } from './kit.js';
import { girarPara } from './npcs.js';

/** Onde a criança fica no píer (a porta 'barco' de passeio.js). */
export const PIER = { x: 40.4, z: 12.6 };
const MARGEM = 4.7; // até quantos metros do meio do rio o barco vai (a beirinha rasa fica de fora)
const Z_MIN = -62, Z_MAX = 46; // da ponte (z = -46) até depois do cais
const VEL_MAX = 3.0;

export function criarBarco(mundo, passeio, h = {}) {
  const vila = mundo.vila;
  const barco = vila.barco;
  const casa = { x: barco.position.x, z: barco.position.z, ry: barco.rotation.y };
  const { distRio } = vila;
  let ativo = false, x = casa.x, z = casa.z, giro = casa.ry + Math.PI / 2, vel = 0;
  const livre = (a, b) => b > Z_MIN && b < Z_MAX && distRio(a, b) < MARGEM;

  const veiculo = {
    mover(dt, ix, iz, vMax) {
      const quer = vMax > 0;
      if (quer) giro = girarPara(giro, Math.atan2(ix, iz), dt * 2.6);
      vel = lerp(vel, quer ? Math.min(VEL_MAX, Math.max(1.4, vMax)) : 0, 1 - Math.exp(-dt * (quer ? 1.8 : 1.3)));
      const nx = x + Math.sin(giro) * vel * dt, nz = z + Math.cos(giro) * vel * dt;
      if (livre(nx, nz)) { x = nx; z = nz; } else if (livre(nx, z)) x = nx; else if (livre(x, nz)) z = nz; else { vel *= 0.3; h.aoMargem?.(); }
      barco.position.x = x; barco.position.z = z; barco.rotation.y = giro - Math.PI / 2;
      // a criança fica na popa (o mastro está no meio)
      return { x: x - Math.sin(giro) * 0.85, z: z - Math.cos(giro) * 0.85, y: barco.position.y + 0.38, giro };
    },
  };

  const pertoDoPier = () => Math.hypot(x - casa.x, z - casa.z) < 4.5;
  return {
    get ativo() { return ativo; },
    get pos() { return { x, z, giro, vel }; },
    pertoDoPier,
    embarcar() {
      if (ativo) return true;
      ativo = true; x = barco.position.x; z = barco.position.z; giro = barco.rotation.y + Math.PI / 2; vel = 0;
      passeio.usarVeiculo(veiculo);
      h.aoEmbarcar?.();
      return true;
    },
    /** Desce no píer (só perto dele; longe, devolve false). `forcar` (testes, sair da caça) leva o barco de volta. */
    desembarcar(forcar = false) {
      if (!ativo) return true;
      if (!forcar && !pertoDoPier()) return false;
      ativo = false; vel = 0;
      passeio.usarVeiculo(null);
      x = casa.x; z = casa.z; giro = casa.ry + Math.PI / 2;
      barco.position.x = casa.x; barco.position.z = casa.z; barco.rotation.y = casa.ry;
      passeio.teleportar(PIER.x, PIER.z, -Math.PI / 2);
      h.aoDesembarcar?.();
      return true;
    },
    /** Testes: leva o barco direto a um ponto do rio (se for água de barco). */
    levarA(a, b) { if (!livre(a, b)) return false; x = clamp(a, -999, 999); z = b; return true; },
    livre,
  };
}
