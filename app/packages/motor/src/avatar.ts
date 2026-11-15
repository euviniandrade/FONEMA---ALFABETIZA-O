/**
 * Regras do AVATAR 3D (D029 §1 e §7). Lógica pura: o que está liberado, o que tem cadeado, a troca por moedinhas,
 * a migração dos avatares antigos (recorte `avatar.base` e boneco de peças v2) e das crianças salvas sem sexo definido.
 */
import {
  ACESSIBILIDADE, CABELOS, FASE_POR_ID, idCompraAvatar, pecaAvatar, pecaPadrao, pecasPara,
  type CategoriaAvatar, type Genero, type PassoAvatar, type PecaAvatar
} from '@fonema/conteudo';
import type { AvatarCrianca, Crianca, Progresso } from './estado.ts';
import { comprar } from './moedinhas.ts';

/** O boneco começa no padrão completo do modelo 3D (D029 §7): nada escolhido = tudo como o modelo já vem. */
export const AVATAR_PADRAO: AvatarCrianca = {
  versao: 3, cantinho: 'ceu', pele: null, olhos: null, corCabelo: null, cabelo: null,
  camisa: null, calca: null, calcado: null, acessibilidade: [], pronto: false
};

/** Nome antigo (o boneco já não começa "limpo"); mantido para telas que ainda importam. */
export const AVATAR_LIMPO = AVATAR_PADRAO;

/** Recortes antigos → cores e tipo de cabelo equivalentes. `cabelo` é o nome da variação; o id certo sai do sexo. */
const BASES_ANTIGAS: Record<string, { pele: string; cabelo: string; cor: string; olhos?: string; acess?: string[] }> = {
  '01-crespo-curto': { pele: 'pele-07', cabelo: 'crespo', cor: 'preto' },
  '02-trancas': { pele: 'pele-08', cabelo: 'trancas', cor: 'preto' },
  '03-coque': { pele: 'pele-04', cabelo: 'rabo', cor: 'castanho-escuro' },
  '04-ruiva-ondulada': { pele: 'pele-01', cabelo: 'padrao', cor: 'ruivo', olhos: 'verde' },
  '05-chanel-liso': { pele: 'pele-03', cabelo: 'padrao', cor: 'preto' },
  '06-liso-longo-pintura': { pele: 'pele-05', cabelo: 'padrao', cor: 'preto', acess: ['pintura-no-rosto'] },
  '07-black-power-alto': { pele: 'pele-09', cabelo: 'black', cor: 'preto' },
  '08-oculos-aparelho': { pele: 'pele-02', cabelo: 'cacheado', cor: 'castanho', acess: ['oculos', 'aparelho-auditivo'] },
  '09-cadeira-de-rodas': { pele: 'pele-06', cabelo: 'cacheado', cor: 'castanho-escuro', acess: ['cadeira-de-rodas'] },
  '08-oculos-aparelho-cadeira': { pele: 'pele-06', cabelo: 'cacheado', cor: 'castanho-escuro', acess: ['oculos', 'aparelho-auditivo', 'cadeira-de-rodas'] }
};
/** Variação de cabelo → a parecida que existe para menino. */
const PARECIDO_MENINO: Record<string, string> = { black: 'crespo', trancas: 'crespo', rabo: 'padrao' };

function cabeloDaVariacao(variacao: string, sexo: Genero): string | null {
  const alvo = `${sexo}-${sexo === 'm' ? PARECIDO_MENINO[variacao] ?? variacao : variacao}`;
  const peca = CABELOS.find((c) => c.sexo === sexo && c.id === alvo && !c.fase);
  return peca && !peca.padrao ? peca.id : null;
}

/** Avatar antigo de recorte (`{ base, cantinho }`) → avatar 3D equivalente (tom de pele, cor e tipo de cabelo, acessibilidade). */
export function migrarAvatar(antigo: { base?: string; cantinho?: string } | undefined, sexo: Genero | null): AvatarCrianca {
  const chave = (antigo?.base ?? '').replace(/^crianca-b?/, '');
  const m = BASES_ANTIGAS[chave];
  const cantinho = antigo?.cantinho ?? 'ceu';
  if (!m) return { ...AVATAR_PADRAO, cantinho };
  return {
    ...AVATAR_PADRAO, cantinho, pele: m.pele, olhos: m.olhos ?? null, corCabelo: m.cor,
    cabelo: sexo ? cabeloDaVariacao(m.cabelo, sexo) : null, acessibilidade: m.acess ?? [], pronto: sexo !== null,
    ...(sexo ? {} : { baseAntiga: antigo?.base })
  };
}

/** Avatar "de peças" da versão 2 (boneco provisório) → versão 3: guarda as cores que ainda existem; o resto volta ao padrão. */
function daVersao2(a: Record<string, unknown>, sexo: Genero): AvatarCrianca {
  const id = (cat: CategoriaAvatar, v: unknown): string | null => (typeof v === 'string' && pecasPara(cat, sexo).some((x) => x.id === v) ? v : null);
  const acess = Array.isArray(a.acessibilidade) ? a.acessibilidade.filter((x): x is string => typeof x === 'string' && ACESSIBILIDADE.some((p) => p.id === x)) : [];
  return {
    versao: 3, cantinho: typeof a.cantinho === 'string' ? a.cantinho : 'ceu',
    pele: id('pele', a.pele), olhos: id('olhos', a.olhos), corCabelo: id('corCabelo', a.corCabelo), cabelo: id('cabelo', a.cabelo),
    camisa: id('camisa', a.camisa), calca: id('calca', a.calca), calcado: id('calcado', a.calcado),
    acessibilidade: acess, pronto: a.pronto === true,
    ...(typeof a.baseAntiga === 'string' ? { baseAntiga: a.baseAntiga } : {})
  };
}

/**
 * Conserta um registro de criança lido do aparelho (versões antigas):
 * - sexo "prefiro não informar" (`n`) → fica PENDENTE: o app pede a escolha uma vez (D029);
 * - avatar de recorte ou de peças (versão 2) → avatar 3D da versão atual.
 * Registros já no formato novo voltam iguais (mesma referência).
 */
export function normalizarCrianca(bruto: Crianca): Crianca {
  const r = bruto as unknown as { genero?: string; generoPendente?: boolean; avatar?: Record<string, unknown> & { versao?: number; base?: string; cantinho?: string } };
  const semSexo = r.genero !== 'm' && r.genero !== 'f';
  const avatarNovo = r.avatar?.versao === 3;
  if (!semSexo && avatarNovo) return bruto;
  const genero: Genero = r.genero === 'm' ? 'm' : 'f';
  const avatar = avatarNovo ? bruto.avatar : r.avatar?.versao === 2 ? daVersao2(r.avatar, genero) : migrarAvatar(r.avatar, semSexo ? null : genero);
  return { ...bruto, genero, ...(semSexo ? { generoPendente: true } : {}), avatar };
}

/** O adulto ou a criança escolheu o sexo (uma vez). Completa o cabelo que a migração deixou em aberto. */
export function definirSexo(c: Crianca, sexo: Genero): Crianca {
  const { generoPendente: _p, ...resto } = c;
  void _p;
  let avatar = c.avatar;
  if (avatar.baseAntiga) {
    avatar = { ...migrarAvatar({ base: avatar.baseAntiga, cantinho: avatar.cantinho }, sexo), pronto: false };
  } else if (avatar.cabelo && !pecasPara('cabelo', sexo).some((x) => x.id === avatar.cabelo)) {
    avatar = { ...avatar, cabelo: null };
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

/**
 * Aplica a cor/variação no boneco (sem checar compra: quem chama já viu `pecaUsavel`). Recusa peça do outro sexo.
 * Escolher a peça com que o modelo já vem (camiseta branca, cabelo padrão…) volta o campo para `null`.
 */
export function vestir(avatar: AvatarCrianca, categoria: PassoAvatar, id: string, sexo: Genero): AvatarCrianca {
  const peca = pecaAvatar(categoria, id);
  if (!peca || peca.indisponivel) throw new Error(`Peça desconhecida: ${categoria}/${id}`);
  if (peca.sexo !== 'ambos' && peca.sexo !== sexo) throw new Error('Esta peça não é para este boneco.');
  return { ...avatar, [categoria]: peca.padrao ? null : id };
}

/** A peça que está valendo numa categoria: a escolhida ou, sem escolha, a do padrão do modelo (se houver). */
export function pecaEmUso(avatar: AvatarCrianca, categoria: PassoAvatar, sexo: Genero): PecaAvatar | undefined {
  return pecaAvatar(categoria, avatar[categoria]) ?? pecaPadrao(categoria, sexo);
}

/** Liga ou desliga um item de acessibilidade (sempre grátis, sempre opcional). */
export function alternarAcessibilidade(avatar: AvatarCrianca, id: string): AvatarCrianca {
  if (!ACESSIBILIDADE.some((a) => a.id === id && !a.indisponivel)) throw new Error(`Item de acessibilidade desconhecido: ${id}`);
  const tem = avatar.acessibilidade.includes(id);
  return { ...avatar, acessibilidade: tem ? avatar.acessibilidade.filter((x) => x !== id) : [...avatar.acessibilidade, id] };
}

/** Peças com cadeado para este sexo, na ordem em que abrem: é a vitrine que ensina a Lojinha na montagem. */
export function proximasPecas(p: Progresso, sexo: Genero, limite = 6, existe: (peca: PecaAvatar) => boolean = () => true): { peca: PecaAvatar; estado: EstadoPeca }[] {
  const ordem = (x: PecaAvatar) => (x.fase ? Object.keys(p.fases).indexOf(x.fase) : -1);
  return (['cabelo', 'camisa', 'calca', 'calcado'] as const)
    .flatMap((c) => pecasPara(c, sexo))
    .filter(existe)
    .map((peca) => ({ peca, estado: estadoPeca(peca, p) }))
    .filter((x) => x.estado.estado !== 'livre' && x.estado.estado !== 'tem')
    .sort((a, b) => ordem(a.peca) - ordem(b.peca) || a.peca.preco - b.peca.preco)
    .slice(0, limite);
}
