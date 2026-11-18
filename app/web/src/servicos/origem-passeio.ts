/**
 * Fila do dono nº 27 (6): "de onde vim" quando a criança entra num lugar pelo PASSEIO 3D (Escola, Biblioteca, Campinho,
 * Lojinha, Casa, Coreto). Enquanto a marca existe, a setinha de voltar que iria para a vila (ou a da própria tela de
 * entrada) leva de volta ao passeio, e o boneco reaparece onde estava antes de entrar na porta.
 *
 * A marca fica FORA da rota (sessionStorage): a rota por hash é dividida em "/" (rotas.ts) e uma "?de=passeio" quebraria
 * o último pedaço. Ela some quando a vila abre (a criança saiu do passeio por outro caminho) e quando o passeio a usa.
 */
export interface PosicaoPasseio { x: number; z: number; giro: number }
export interface MarcaPasseio { criancaId: string; rota: string; pos?: PosicaoPasseio }

const CHAVE = 'fonema-vim-do-passeio';
const limpa = (r: string) => r.replace(/^[#/]+/, '');

export function lerMarca(): MarcaPasseio | null {
  try { return JSON.parse(sessionStorage.getItem(CHAVE) || 'null') as MarcaPasseio | null; } catch { return null; }
}
export function marcarVindoDoPasseio(m: MarcaPasseio): void {
  try { sessionStorage.setItem(CHAVE, JSON.stringify({ ...m, rota: limpa(m.rota) })); } catch { /* sem armazenamento: volta à vila */ }
}
export function limparMarca(): void {
  try { sessionStorage.removeItem(CHAVE); } catch { /* nada */ }
}

/**
 * Pura: para onde vai a setinha de voltar. `atual` = rota desta tela; `voltar` = destino normal dela.
 * Vai ao passeio quando a tela é a que foi aberta pela porta, ou quando o destino normal seria a vila.
 */
export function destinoDoVoltar(voltar: string, atual: string, marca: MarcaPasseio | null): string {
  if (!marca) return voltar;
  const c = `c/${marca.criancaId}`;
  const v = limpa(voltar);
  if (v === `${c}/mundo` || limpa(atual) === `${c}/mundo`) return voltar;
  if (limpa(atual) === marca.rota || v === `${c}/vila`) return `${c}/mundo`;
  return voltar;
}
