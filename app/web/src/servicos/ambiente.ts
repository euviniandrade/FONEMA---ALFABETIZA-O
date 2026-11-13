/** Sinalizadores do ambiente. `fonema-teste-rapido` (localStorage) acelera falas e animações nos testes E2E. */
export const modoTeste = (): boolean => {
  try { return localStorage.getItem('fonema-teste-rapido') === '1'; } catch { return false; }
};
export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, modoTeste() ? Math.min(ms, 30) : ms));
export const asset = (caminho: string) => `./assets/${caminho}`;
