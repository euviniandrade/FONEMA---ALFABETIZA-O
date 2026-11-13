/** Sinalizadores do ambiente. `fonema-teste-rapido` (localStorage) acelera falas e animações nos testes E2E. */
export const modoTeste = (): boolean => {
  try { return localStorage.getItem('fonema-teste-rapido') === '1'; } catch { return false; }
};
export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, modoTeste() ? Math.min(ms, 30) : ms));
export const asset = (caminho: string) => `./assets/${caminho}`;

/** O mundo 3D (mundo-3d-v2) foi copiado para ./mundo3d/? (servidores de SPA devolvem o index do app para caminhos inexistentes.) */
let mundo: Promise<boolean> | null = null;
export function mundo3dDisponivel(): Promise<boolean> {
  mundo ??= fetch('./mundo3d/index.html', { cache: 'no-store' })
    .then(async (r) => r.ok && !(await r.text()).includes('id="raiz"'))
    .catch(() => false);
  return mundo;
}
