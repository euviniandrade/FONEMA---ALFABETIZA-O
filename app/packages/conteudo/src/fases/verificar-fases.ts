/**
 * O verificador de decodificabilidade aplicado às FASES (docs/pedagogia/05 §6.5–6.8): junta tudo o que a criança lê ou
 * escreve sozinha em cada fase (opções escritas, peças de montar, ditado, caixas de sons, síntese, pares mínimos,
 * troca-letras, frases) e confere palavra por palavra na unidade da fase. Também gera o relatório por fase.
 */
import type { Fase } from '../tipos.ts';
import { FASES } from '../regioes.ts';
import { UNIDADES_TF, numeroDaUnidade, valoresAte, verificarFrase, verificarPalavra, verificarPseudo, type Resultado, type ValorTF } from '../decodificabilidade.ts';
import { VALORES_ENSINADOS } from '../palavras.ts';
import { BANCO } from './tf-banco.ts';

export interface LeituraDaFase {
  cena: string;
  texto: string;
  tipo: 'palavra' | 'pseudo' | 'frase' | 'escrita';
}

/** Tudo o que a criança LÊ ou ESCREVE sozinha numa fase (palavras ouvidas, figuras e falas ficam de fora: 05 §3). */
export function leiturasDaFase(f: Fase): LeituraDaFase[] {
  const out: LeituraDaFase[] = [];
  for (const c of f.cenas) {
    const a = c.atividade;
    if (!a) continue;
    const add = (texto: string, tipo: LeituraDaFase['tipo']) => out.push({ cena: c.id, texto, tipo });
    switch (a.tipo) {
      case 'escolher':
        for (const i of a.itens) {
          if (i.leitura && i.mostrar) add(i.mostrar, i.pseudo ? 'pseudo' : 'palavra');
          // "qual sílaba falta" e "qual som falta": a criança completa a palavra escrita (a palavra inteira passa pelo verificador)
          else if ((i.formato === 'silaba-falta' || i.formato === 'fonema-falta') && i.ouvir) add(i.ouvir.toUpperCase(), 'escrita');
        }
        break;
      case 'falar': if (a.leitura) for (const i of a.itens) add(i.texto, i.pseudo ? 'pseudo' : 'palavra'); break;
      // montar por sílaba também entra: a palavra montada é escrita pela criança (a peça é a sílaba, mas as letras são lidas)
      case 'montar': if (!a.vocabulario) for (const w of a.palavras) if (!w.startsWith('$')) add(w, 'escrita'); break;
      case 'ditado': for (const w of a.palavras) add(w, 'escrita'); break;
      case 'sintese': for (const i of a.itens) add(i.palavra, i.pseudo ? 'pseudo' : 'palavra'); break;
      case 'caixas': for (const i of a.itens) add(i.palavra, 'escrita'); break;
      case 'parMinimo': for (const i of a.itens) if (i.modo === 'ler') add(i.alvo, 'palavra'); break;
      case 'troca': for (const i of a.itens) { add(i.de, 'palavra'); add(i.para, 'palavra'); } break;
      case 'frase': for (const i of a.itens) add(i.frase, 'frase'); break;
      default: break;
    }
  }
  return out;
}

/** Unidade em que a fase está: TF-07 → 7; revisões de bloco valem como a última unidade do bloco. */
export function unidadeDaFase(f: Fase): number | null {
  if (f.regiao !== 'TF') return null;
  const u = f.id === 'TF-R2' ? 'TF-15' : f.id === 'TF-R3' ? 'TF-22' : f.id;
  return numeroDaUnidade(u);
}

/**
 * Trilhas antigas (A–Z, Ilha das Vogais, Vale do M-L-F, Meu nome): não andam por unidade. Vale O QUE JÁ FOI VISTO
 * (05 §6.5): o som principal de cada letra das fases da Trilha A–Z que vêm ANTES (ou são) a fase na jornada, os valores das
 * lições da Trilha dos Sons que vêm antes dela, e os valores marcados para a região em `VALORES_ENSINADOS`.
 * Palavra de exposição ou vocabulário (montar com `vocabulario`) fica de fora da conta.
 */
const VALOR_DA_LETRA: Record<string, ValorTF> = {
  A: 'a', E: 'e', I: 'i', O: 'o', U: 'u', M: 'm', F: 'f', V: 'v', L: 'l', S: 's', N: 'n', Z: 'z', J: 'j', P: 'p', T: 't', B: 'b', C: 'c-k', D: 'd', G: 'g'
};
const EQUIVALENTE: Record<string, ValorTF[]> = { 'e-aberto': ['e-aberto', 'e-aberto-sem-acento'], 'o-aberto': ['o-aberto', 'o-aberto-sem-acento'], 'o-final-u': ['o-final-u'], 'e-final-i': ['e-final-i'], ditongo: ['ditongo'] };
/** Letras que a fase da Trilha A–Z apresenta (habilidades `letra-x`). */
const letrasDaFaseAl = (f: Fase) => f.habilidades.map((h) => /^letra-([a-z])$/.exec(h)?.[1]?.toUpperCase()).filter((x): x is string => !!x);

/** Valores sonoros já vistos AO CHEGAR à fase (inclusive ela), na ordem da jornada (`ordem`, padrão: FASES). */
export function valoresVistosAte(f: Fase, ordem: Fase[] = FASES): Set<ValorTF> {
  const ate = ordem.findIndex((x) => x.id === f.id);
  const antes = ate >= 0 ? ordem.slice(0, ate + 1) : [...ordem, f];
  const out = new Set<ValorTF>(['acento', 'circunflexo']);
  let tf = 0;
  for (const x of antes) {
    if (x.regiao === 'AL') for (const l of letrasDaFaseAl(x)) { const v = VALOR_DA_LETRA[l]; if (v) out.add(v); }
    const u = unidadeDaFase(x);
    if (u !== null && x.id !== f.id) tf = Math.max(tf, u);
  }
  if (tf) for (const v of valoresAte(tf)) out.add(v);
  // acento agudo em Á, Í, Ú e o circunflexo só marcam a sílaba forte (BABÁ, BEBÊ): nas trilhas antigas não mudam o som da letra
  for (const v of (VALORES_ENSINADOS[f.regiao] ?? []).flatMap((v) => EQUIVALENTE[v] ?? [])) out.add(v);
  return out;
}
function permitidosDaRegiao(f: Fase): Set<ValorTF> {
  const n = unidadeDaFase(f);
  if (n !== null) return valoresAte(n);
  return valoresVistosAte(f);
}

const REAIS = new Set(Object.values(BANCO).filter((e) => !e.pseudo).map((e) => e.texto.toLowerCase()));

export interface ItemRelatorio extends LeituraDaFase { resultado: Resultado; libera?: string }

/** Confere cada leitura da fase (erro = o teste falha; aviso = lista). */
export function verificarFase(f: Fase): ItemRelatorio[] {
  const n = unidadeDaFase(f) ?? 99;
  const permitidos = permitidosDaRegiao(f);
  return leiturasDaFase(f).map((l) => {
    const resultado = l.tipo === 'frase' ? verificarFrase(l.texto, n, BANCO, permitidos)
      : l.tipo === 'pseudo' && unidadeDaFase(f) !== null ? verificarPseudo(l.texto, n, BANCO, REAIS)
        : verificarPalavra(l.texto, n, BANCO, permitidos);
    const barra = resultado.erros.map((e) => /ensinado só em (TF-\d+)/.exec(e)?.[1]).find(Boolean);
    return { ...l, resultado, ...(barra ? { libera: barra } : {}) };
  });
}

/** Relatório por fase (05 §6.8): o que foi lido, o valor que barrou cada palavra e a unidade que a libera. */
export function relatorioDaFase(f: Fase): string {
  const itens = verificarFase(f);
  const u = unidadeDaFase(f);
  const linhas = [`### ${f.id} · ${f.titulo}${u ? ` (até ${UNIDADES_TF[u - 1].id})` : ''}`, ''];
  if (!itens.length) return [...linhas, 'Sem leitura nem escrita sozinha nesta fase.', ''].join('\n');
  linhas.push('| Cena | O quê | Texto | Resultado |', '|---|---|---|---|');
  for (const i of itens) {
    const r = i.resultado.ok ? (i.resultado.avisos.length ? `ok, com aviso: ${[...new Set(i.resultado.avisos)].join('; ')}` : 'ok') : `**erro**: ${i.resultado.erros.join('; ')}`;
    linhas.push(`| ${i.cena} | ${i.tipo} | ${i.texto} | ${r} |`);
  }
  return [...linhas, ''].join('\n');
}
