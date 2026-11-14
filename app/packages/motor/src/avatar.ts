/**
 * Regras do AVATAR MONTÁVEL (D029 §1). Lógica pura: o que está liberado, o que tem cadeado, a troca por moedinhas,
 * a migração dos avatares antigos (recorte pronto `avatar.base`) e das crianças salvas sem sexo definido.
 */
import {
  ACESSIBILIDADE, CABELOS, FASE_POR_ID, PASSOS_AVATAR, idCompraAvatar, pecaAvatar, pecasPara,
  type CategoriaAvatar, type Genero, type PecaAvatar
} from '@fonema/conteudo';
import type { AvatarCrianca, Crianca, Progresso } from './estado.ts';
import { comprar } from './moedinhas.ts';

export const AVATAR_LIMPO: AvatarCrianca = {
  versao: 2, cantinho: 'ceu', pele: null, rosto: null, olhos: null, cabelo: null, corCabelo: 'castanho-escuro',
  camisa: null, calca: null, calcado: null, acessibilidade: [], pronto: false
};

/** Recortes antigos → peças equivalentes. `cabelo` é o MODELO; o id certo sai do sexo da criança. */
const BASES_ANTIGAS: Record<string, { pele: string; cabelo: string; cor: string; olhos?: string; acess?: string[] }> = {
  '01-crespo-curto': { pele: 'pele-07', cabelo: 'crespo-curto', cor: 'preto' },
  '02-trancas': { pele: 'pele-08', cabelo: 'trancas', cor: 'preto' },
  '03-coque': { pele: 'pele-04', cabelo: 'coque', cor: 'castanho-escuro' },
  '04-ruiva-ondulada': { pele: 'pele-01', cabelo: 'ondulado', cor: 'ruivo', olhos: 'verde' },
  '05-chanel-liso': { pele: 'pele-03', cabelo: 'liso-chanel', cor: 'preto' },
  '06-liso-longo-pintura': { pele: 'pele-05', cabelo: 'liso-longo', cor: 'preto', acess: ['pintura-no-rosto'] },
  '07-black-power-alto': { pele: 'pele-09', cabelo: 'black-power', cor: 'preto' },
  '08-oculos-aparelho': { pele: 'pele-02', cabelo: 'cacheado', cor: 'castanho', acess: ['oculos', 'aparelho-auditivo'] },
  '09-cadeira-de-rodas': { pele: 'pele-06', cabelo: 'cacheado', cor: 'castanho-escuro', acess: ['cadeira-de-rodas'] },
  '08-oculos-aparelho-cadeira': { pele: 'pele-06', cabelo: 'cacheado', cor: 'castanho-escuro', acess: ['oculos', 'aparelho-auditivo', 'cadeira-de-rodas'] }
};
/** Modelo de cabelo → o parecido que existe para menino. */
const PARECIDO_MENINO: Record<string, string> = {
  'crespo-curto': 'crespo-curto', 'black-power': 'black-power', cacheado: 'cacheado-curto', ondulado: 'ondulado-curto',
  'liso-longo': 'liso-curto', 'liso-chanel': 'liso-curto', trancas: 'trancinhas', coque: 'liso-curto'
};

function cabeloDoModelo(modelo: string, sexo: Genero): string | null {
  const alvo = sexo === 'm' ? PARECIDO_MENINO[modelo] ?? modelo : modelo;
  return CABELOS.find((c) => c.sexo === sexo && c.modelo === alvo && !c.fase)?.id ?? null;
}

/** Avatar antigo (`{ base, cantinho }`) → avatar montado equivalente. Sem sexo definido, o cabelo fica para a criança escolher. */
export function migrarAvatar(antigo: { base?: string; cantinho?: string } | undefined, sexo: Genero | null): AvatarCrianca {
  const chave = (antigo?.base ?? '').replace(/^crianca-b?/, '');
  const m = BASES_ANTIGAS[chave];
  const cantinho = antigo?.cantinho ?? 'ceu';
  if (!m) return { ...AVATAR_LIMPO, cantinho };
  const cabelo = sexo ? cabeloDoModelo(m.cabelo, sexo) : null;
  return {
    versao: 2, cantinho, pele: m.pele, rosto: 'redondo', olhos: m.olhos ?? 'castanho-escuro', cabelo, corCabelo: m.cor,
    camisa: 'uniforme', calca: 'uniforme', calcado: 'tenis-branco', acessibilidade: m.acess ?? [], pronto: cabelo !== null,
    ...(sexo ? {} : { baseAntiga: antigo?.base })
  };
}

/**
 * Conserta um registro de criança lido do aparelho (versões antigas):
 * - sexo "prefiro não informar" (`n`) → fica PENDENTE: o app pede a escolha uma vez (D029);
 * - avatar de recorte → avatar montado equivalente.
 * Registros já no formato novo voltam iguais (mesma referência).
 */
export function normalizarCrianca(bruto: Crianca): Crianca {
  const r = bruto as unknown as { genero?: string; generoPendente?: boolean; avatar?: { versao?: number; base?: string; cantinho?: string } };
  const semSexo = r.genero !== 'm' && r.genero !== 'f';
  const avatarNovo = r.avatar?.versao === 2;
  if (!semSexo && avatarNovo) return bruto;
  const genero: Genero = r.genero === 'm' ? 'm' : 'f';
  return {
    ...bruto,
    genero,
    ...(semSexo ? { generoPendente: true } : {}),
    avatar: avatarNovo ? bruto.avatar : migrarAvatar(r.avatar, semSexo ? null : genero)
  };
}

/** O adulto ou a criança escolheu o sexo (uma vez). Completa o cabelo que a migração deixou em aberto. */
export function definirSexo(c: Crianca, sexo: Genero): Crianca {
  const { generoPendente: _p, ...resto } = c;
  void _p;
  let avatar = c.avatar;
  if (avatar.baseAntiga) {
    avatar = migrarAvatar({ base: avatar.baseAntiga, cantinho: avatar.cantinho }, sexo);
  } else if (avatar.cabelo && !pecasPara('cabelo', sexo).some((x) => x.id === avatar.cabelo)) {
    avatar = { ...avatar, cabelo: null, pronto: false };
  }
  // roupas do outro sexo saem (a criança escolhe de novo)
  for (const cat of ['camisa', 'calca', 'calcado'] as const) {
    if (avatar[cat] && !pecasPara(cat, sexo).some((x) => x.id === avatar[cat])) avatar = { ...avatar, [cat]: null, pronto: false };
  }
  return { ...resto, genero: sexo, avatar };
}

/** Para a concordância das falas: enquanto o sexo está pendente, a dupla usa a forma neutra. */
export function generoDaFala(c: Pick<Crianca, 'genero' | 'generoPendente'> | undefined): Genero | 'n' {
  return !c || c.generoPendente ? 'n' : c.genero;
}

export type EstadoPeca =
  | { estado: 'livre' }
  | { estado: 'tem' }
  | { estado: 'pode'; preco: number }
  | { estado: 'faltam'; preco: number; faltam: number }
  | { estado: 'fase'; fase: string; rotuloFase: string; preco: number };

/** A fase já está ao alcance da criança (aberta, concluída ou liberada pelo nível inicial)? */
function faseAlcancada(p: Progresso, faseId: string): boolean {
  const e = p.fases[faseId]?.estado;
  return e === 'aberta' || e === 'concluida';
}

/**
 * Como a peça aparece para a criança: livre (grátis), já tem (comprada), pode trocar, faltam moedinhas, ou
 * com cadeado da fase ("Abre na Letra F · 12 moedas"). A fase vem ANTES das moedas: sem pular etapas (D021).
 */
export function estadoPeca(peca: PecaAvatar, p: Progresso): EstadoPeca {
  if (p.itens.includes(idCompraAvatar(peca))) return { estado: 'tem' };
  if (!peca.fase && peca.preco === 0) return { estado: 'livre' };
  if (peca.fase && !faseAlcancada(p, peca.fase)) {
    return { estado: 'fase', fase: peca.fase, rotuloFase: FASE_POR_ID[peca.fase]?.titulo ?? peca.fase, preco: peca.preco };
  }
  if (peca.preco === 0) return { estado: 'livre' };
  const faltam = peca.preco - p.moedinhas.saldo;
  return faltam > 0 ? { estado: 'faltam', preco: peca.preco, faltam } : { estado: 'pode', preco: peca.preco };
}

export const pecaUsavel = (peca: PecaAvatar, p: Progresso): boolean => ['livre', 'tem'].includes(estadoPeca(peca, p).estado);

/** Texto curto do cadeado, como a criança ouve e lê. */
export function rotuloCadeado(e: EstadoPeca): string {
  const moedas = (n: number) => `${n} ${n === 1 ? 'moeda' : 'moedas'}`;
  switch (e.estado) {
    case 'fase': return e.preco ? `Abre na ${e.rotuloFase} · ${moedas(e.preco)}` : `Abre na ${e.rotuloFase}`;
    case 'faltam': return `${moedas(e.preco)} · faltam ${e.faltam}`;
    case 'pode': return moedas(e.preco);
    case 'tem': return 'É seu';
    default: return 'Grátis';
  }
}

/** Troca moedinhas pela peça (só se a fase já abriu e o saldo dá). */
export function comprarPeca(p: Progresso, peca: PecaAvatar): Progresso {
  const e = estadoPeca(peca, p);
  if (e.estado !== 'pode') throw new Error(e.estado === 'fase' ? 'Esta peça ainda não abriu.' : e.estado === 'faltam' ? 'Moedinhas insuficientes.' : 'Esta peça já é sua.');
  return comprar(p, idCompraAvatar(peca), peca.preco);
}

type Vestivel = Exclude<CategoriaAvatar, 'acessibilidade'>;

/** Veste a peça no boneco (sem checar compra: quem chama já viu `pecaUsavel`). Recusa peça do outro sexo. */
export function vestir(avatar: AvatarCrianca, categoria: Vestivel, id: string, sexo: Genero): AvatarCrianca {
  const peca = pecaAvatar(categoria, id);
  if (!peca) throw new Error(`Peça desconhecida: ${categoria}/${id}`);
  if (peca.sexo !== 'ambos' && peca.sexo !== sexo) throw new Error('Esta peça não é para este boneco.');
  const novo = { ...avatar, [categoria]: id };
  return { ...novo, pronto: avatar.pronto };
}

/** Liga ou desliga um item de acessibilidade (sempre grátis, sempre opcional). */
export function alternarAcessibilidade(avatar: AvatarCrianca, id: string): AvatarCrianca {
  if (!ACESSIBILIDADE.some((a) => a.id === id)) throw new Error(`Item de acessibilidade desconhecido: ${id}`);
  const tem = avatar.acessibilidade.includes(id);
  return { ...avatar, acessibilidade: tem ? avatar.acessibilidade.filter((x) => x !== id) : [...avatar.acessibilidade, id] };
}

/** Primeiro passo obrigatório ainda sem escolha (ou -1 se a montagem está completa). */
export function passoPendente(avatar: AvatarCrianca): number {
  return PASSOS_AVATAR.findIndex((s) => !avatar[s.id]);
}
export const montagemCompleta = (avatar: AvatarCrianca): boolean => passoPendente(avatar) === -1;

/** Peças com cadeado para este sexo, na ordem em que abrem: é a vitrine que ensina a Lojinha na montagem. */
export function proximasPecas(p: Progresso, sexo: Genero, limite = 6): { peca: PecaAvatar; estado: EstadoPeca }[] {
  const ordem = (x: PecaAvatar) => (x.fase ? Object.keys(p.fases).indexOf(x.fase) : -1);
  return (['cabelo', 'camisa', 'calca', 'calcado'] as const)
    .flatMap((c) => pecasPara(c, sexo))
    .map((peca) => ({ peca, estado: estadoPeca(peca, p) }))
    .filter((x) => x.estado.estado !== 'livre' && x.estado.estado !== 'tem')
    .sort((a, b) => ordem(a.peca) - ordem(b.peca) || a.peca.preco - b.peca.preco)
    .slice(0, limite);
}
