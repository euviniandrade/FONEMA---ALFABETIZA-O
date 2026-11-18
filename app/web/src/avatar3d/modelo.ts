/**
 * Aparência do boneco: os DADOS do avatar (ids do catálogo) já resolvidos em cores e no modelo 3D a usar.
 * Não importa three.js: pode ser usado em qualquer tela (chave de cache das miniaturas, reserva 2D).
 */
import { pecaAvatar, pecaPadrao, type Genero } from '@fonema/conteudo';
import type { AvatarCrianca, Crianca } from '@fonema/motor';

export interface Aparencia {
  sexo: Genero;
  /** Chave do modelo 3D pedido em avatares.json (ex.: "menina-padrao", "menino-topete"). Se o arquivo não existir, vale o padrão do sexo. */
  modelo: string;
  /** Penteado feito em peça separada (avatar3d/cabelos.ts) no lugar do cabelo do modelo. `null` = o cabelo do modelo. */
  penteado?: string | null;
  /** Cores escolhidas (hex). `null` = como o modelo já vem. */
  pele: string | null;
  olhos: string | null;
  cabelo: string | null;
  camisa: string | null;
  calca: string | null;
  calcado: string | null;
  acessibilidade: string[];
}

/** Altura do boneco na cena (metros): todo modelo é normalizado para isto, com os pés no chão e de frente para +Z. */
export const ALTURA_BONECO = 1.1;
export const modeloPadrao = (sexo: Genero): string => (sexo === 'm' ? 'menino-padrao' : 'menina-padrao');

export function resolverAparencia(avatar: AvatarCrianca, sexo: Genero): Aparencia {
  const cor = (cat: 'pele' | 'olhos' | 'corCabelo' | 'camisa' | 'calca' | 'calcado'): string | null => {
    const p = pecaAvatar(cat, avatar[cat]);
    return p && !p.padrao ? p.cor ?? null : null;
  };
  const cabelo = pecaAvatar('cabelo', avatar.cabelo) ?? pecaPadrao('cabelo', sexo);
  return {
    sexo,
    modelo: cabelo && (cabelo.sexo === sexo || cabelo.sexo === 'ambos') && cabelo.modelo ? cabelo.modelo : modeloPadrao(sexo),
    penteado: cabelo && (cabelo.sexo === sexo || cabelo.sexo === 'ambos') && cabelo.penteado ? cabelo.penteado : null,
    pele: cor('pele'), olhos: cor('olhos'), cabelo: cor('corCabelo'),
    camisa: cor('camisa'), calca: cor('calca'), calcado: cor('calcado'),
    acessibilidade: [...avatar.acessibilidade].sort()
  };
}

export const aparenciaDe = (c: Pick<Crianca, 'avatar' | 'genero'>): Aparencia => resolverAparencia(c.avatar, c.genero);

/** Chave estável da aparência (cache de miniaturas). */
export const chaveAparencia = (a: Aparencia): string => JSON.stringify(a);

/* ---- medidas e tipos do boneco PROVISÓRIO feito em código (reserva quando o modelo 3D não carrega) ---- */

export interface PecaVestida { id: string; modelo: string; cor: string; cor2: string; estampa?: 'letra' | 'listras' | 'numero' }
export interface AparenciaProvisoria {
  sexo: Genero;
  pele: string | null;
  rosto: string | null;
  olhos: string | null;
  cabelo: { id: string; modelo: string; cor: string } | null;
  camisa: PecaVestida | null;
  calca: PecaVestida | null;
  calcado: PecaVestida | null;
  acessibilidade: string[];
}
export const MEDIDAS = {
  altura: 1.10, cabecaY: 0.87, cabecaRaio: 0.2, pescocoY: 0.69,
  ombroY: 0.635, ombroX: 0.125, quadrilY: 0.38, quadrilX: 0.062, coxa: 0.15, canela: 0.15, tornozeloY: 0.08
} as const;
export const COR_MASSINHA = '#D9D3CC';
export const COR_ROUPA_BASE = '#EEF1F5';
/** Cores do padrão, para a reserva (provisório em 3D e desenho 2D) ficar parecida com o modelo de verdade. */
export const PADRAO = { pele: '#F0C3A0', olhos: '#3E2414', cabelo: '#3A2416', roupa: '#FAFBFD', letra: '#22407A' } as const;

/** Aparência → boneco provisório equivalente (mesmas cores, cabelo parecido). */
export function paraProvisorio(a: Aparencia): AparenciaProvisoria {
  const v = a.modelo.split('-').slice(1).join('-');
  const cabelos: Record<string, string> = a.sexo === 'f'
    ? { padrao: 'liso-chanel', cacheado: 'cacheado', black: 'black-power', trancas: 'trancas', rabo: 'rabo-de-cavalo', coque: 'coque' }
    : { padrao: 'liso-curto', cacheado: 'cacheado-curto', crespo: 'crespo-curto', franja: 'liso-curto', topete: 'topete' };
  const roupa = (id: string, modelo: string, cor: string | null, estampa?: 'letra'): PecaVestida => ({ id, modelo, cor: cor ?? PADRAO.roupa, cor2: estampa ? PADRAO.letra : cor ?? PADRAO.roupa, estampa });
  return {
    sexo: a.sexo, pele: a.pele ?? PADRAO.pele, rosto: 'redondo', olhos: a.olhos ?? PADRAO.olhos,
    cabelo: { id: a.modelo, modelo: cabelos[v] ?? cabelos.padrao, cor: a.cabelo ?? PADRAO.cabelo },
    camisa: roupa('camiseta', 'camiseta', a.camisa, 'letra'), calca: roupa('calca', 'calca', a.calca), calcado: { ...roupa('tenis', 'tenis', a.calcado), cor2: '#DDE3EC' },
    acessibilidade: a.acessibilidade.filter((x) => x !== 'cadeira-de-rodas' && x !== 'aparelho-auditivo')
  };
}
