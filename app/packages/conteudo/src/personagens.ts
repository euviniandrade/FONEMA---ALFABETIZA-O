/**
 * PERSONAGENS (gerenciador, fila do dono nº 18): nome, papel, fala de apresentação, cor e as imagens/modelo 3D de cada
 * um. As figuras e o modelo são trocados pela aba Imagens do administrador (o arquivo novo entra no mesmo caminho).
 * Nomes: as telas usam `nomeDoPersonagem` (util.ts › NOMES_PERSONAGEM lê daqui). As FALAS que citam o nome ("Eu sou a
 * Sofia") são texto das falas: mudam na aba Textos e falas (e o áudio precisa ser regravado).
 */
import type { Personagem } from './tipos.ts';

export interface FichaPersonagem {
  id: Personagem;
  nome: string;
  papel: string;
  /** Como se apresenta: onde está a fala de apresentação (as falas da chegada, `FALAS.chegada`, são as que tocam). */
  apresentacao?: { colecao: string; item: string; caminho: (string | number)[] };
  /** Cor de destaque (#rrggbb). */
  cor: string;
  /** Arquivos (dentro de assets/) que mostram o personagem: busto, corpo, giro 360°, modelo 3D. */
  imagens: string[];
}

export const PERSONAGENS: FichaPersonagem[] = [
  {
    id: 'sofia', nome: 'Sofia', papel: 'Guia das letras e dos sons (voz principal).', cor: '#e8743b',
    apresentacao: { colecao: 'falas-gerais', item: 'chegada', caminho: [0, 'texto'] },
    imagens: ['dupla/sofia-busto-alegre.webp', 'modelos3d/sofia.webp', 'modelos3d/sofia.glb', 'vivos/giro/sofia.webp']
  },
  {
    id: 'tales', nome: 'Tales', papel: 'Amigo da Sofia; brinca com os sons.', cor: '#2f7fd0',
    apresentacao: { colecao: 'falas-gerais', item: 'chegada', caminho: [1, 'texto'] },
    imagens: ['dupla/tales-busto-alegre.webp', 'modelos3d/tales.webp', 'modelos3d/tales.glb', 'vivos/giro/tales.webp']
  },
  { id: 'bolota', nome: 'Bolota', papel: 'O tatu da dupla (voz do Tales); às vezes erra para a criança ensinar.', cor: '#9a6b3f', imagens: ['modelos3d/bolota.webp', 'modelos3d/bolota.glb', 'vivos/giro/bolota.webp'] },
  { id: 'zum-zum', nome: 'Zum-Zum', papel: 'A abelha das ilhas.', cor: '#f2c230', imagens: ['vivos/giro/zum-zum.webp'] },
  { id: 'dona-cida', nome: 'Dona Cida', papel: 'Moradora da vila.', cor: '#b0557a', imagens: [] },
  { id: 'davi', nome: 'Davi', papel: 'Morador da vila (música e esporte).', cor: '#3f9a6b', imagens: [] },
  { id: 'guarda-parque', nome: 'Guarda-parque', papel: 'Cuida da mata.', cor: '#5a7d2a', imagens: [] },
  { id: 'pescadora', nome: 'Pescadora', papel: 'Moradora do rio.', cor: '#2a7d7d', imagens: [] }
];
export const PERSONAGEM_POR_ID: Record<string, FichaPersonagem> = Object.fromEntries(PERSONAGENS.map((p) => [p.id, p]));
export const nomeDoPersonagem = (id: string): string => PERSONAGEM_POR_ID[id]?.nome ?? id;
