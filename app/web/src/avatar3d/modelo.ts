/**
 * Aparência do boneco: os DADOS do avatar (ids de peças) já resolvidos em cores e modelos.
 * Não importa three.js: pode ser usado em qualquer tela (chave de cache das miniaturas, reserva 2D).
 */
import { pecaAvatar, type Genero, type PecaAvatar } from '@fonema/conteudo';
import type { AvatarCrianca, Crianca } from '@fonema/motor';

export interface PecaVestida { id: string; modelo: string; cor: string; cor2: string; estampa?: PecaAvatar['estampa'] }

export interface Aparencia {
  sexo: Genero;
  /** Cor da pele (hex) ou null = boneco ainda "de massinha". */
  pele: string | null;
  rosto: string | null;
  olhos: string | null;
  cabelo: { id: string; modelo: string; cor: string } | null;
  camisa: PecaVestida | null;
  calca: PecaVestida | null;
  calcado: PecaVestida | null;
  acessibilidade: string[];
}

/** Medidas comuns do boneco (metros). São as MESMAS do contrato dos modelos GLB (app/docs/avatar-3d-contrato.md). */
export const MEDIDAS = {
  altura: 1.10,
  /** Centro e raio da cabeça. */
  cabecaY: 0.87, cabecaRaio: 0.2,
  /** Pivô do pescoço (a cabeça balança em torno dele). */
  pescocoY: 0.69,
  ombroY: 0.635, ombroX: 0.125,
  quadrilY: 0.38, quadrilX: 0.062,
  coxa: 0.15, canela: 0.15, tornozeloY: 0.08
} as const;

export const COR_MASSINHA = '#D9D3CC';
export const COR_ROUPA_BASE = '#EEF1F5';

const vestida = (cat: 'camisa' | 'calca' | 'calcado', id: string | null): PecaVestida | null => {
  const p = pecaAvatar(cat, id);
  return p ? { id: p.id, modelo: p.modelo ?? 'camiseta', cor: p.cor ?? '#FFFFFF', cor2: p.cor2 ?? p.cor ?? '#FFFFFF', estampa: p.estampa } : null;
};

export function resolverAparencia(avatar: AvatarCrianca, sexo: Genero): Aparencia {
  const cab = pecaAvatar('cabelo', avatar.cabelo);
  return {
    sexo,
    pele: pecaAvatar('pele', avatar.pele)?.cor ?? null,
    rosto: pecaAvatar('rosto', avatar.rosto)?.id ?? null,
    olhos: pecaAvatar('olhos', avatar.olhos)?.cor ?? null,
    cabelo: cab ? { id: cab.id, modelo: cab.modelo ?? 'liso-curto', cor: pecaAvatar('corCabelo', avatar.corCabelo)?.cor ?? '#3A2416' } : null,
    camisa: vestida('camisa', avatar.camisa),
    calca: vestida('calca', avatar.calca),
    calcado: vestida('calcado', avatar.calcado),
    acessibilidade: [...avatar.acessibilidade].sort()
  };
}

export const aparenciaDe = (c: Pick<Crianca, 'avatar' | 'genero'>): Aparencia => resolverAparencia(c.avatar, c.genero);

/** Chave estável da aparência (cache de miniaturas). */
export const chaveAparencia = (a: Aparencia): string => JSON.stringify(a);
