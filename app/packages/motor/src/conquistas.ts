/**
 * Desbloqueio de conquistas DEPOIS do fato (D018, D019). Cada regra olha só para aprendizagem e esforço:
 * nada por abrir o app, tempo de tela, dias seguidos ou gastar moedas. Conquista nunca volta a ter cadeado.
 */
import { ALFABETO, CONQUISTA_POR_ID, SELO_ALFABETO_COMPLETO, faseDaLetra, seloDaLetra } from '@fonema/conteudo';
import type { ConquistaGanha, Demonstracao, Progresso } from './estado.ts';
import { fasesConcluidas } from './sequencia.ts';

type Nivel = ConquistaGanha['nivel'];

export interface Fatos {
  concluidas: Set<string>;
  acertos: (habilidade: string) => number;
  sessoesCom: (habilidade: string) => number;
  dominada: (habilidade: string) => boolean;
  contador: (nome: string) => number;
  moedinhasTotal: number;
  validadas: (prefixoFase: string) => number;
}

export function fatosDe(p: Progresso, demonstracoes: Demonstracao[] = []): Fatos {
  const concluidas = fasesConcluidas(p);
  return {
    concluidas,
    acertos: (h) => (p.habilidades[h]?.tentativas ?? []).filter((t) => t.acertou && !t.comAjuda).length,
    sessoesCom: (h) => new Set((p.habilidades[h]?.tentativas ?? []).map((t) => t.sessao)).size,
    dominada: (h) => !!p.habilidades[h]?.dominadaEm,
    contador: (n) => p.contadores[n] ?? 0,
    moedinhasTotal: p.moedinhas.total,
    validadas: (prefixo) => demonstracoes.filter((d) => d.faseId.startsWith(prefixo) && (d.status === 'aprendeu' || d.status === 'explicou')).length
  };
}

/** bronze/prata/ouro por limiares crescentes. */
function degraus(valor: number, limiares: [number, number?, number?]): Nivel | null {
  const [b, pr, o] = limiares;
  if (o !== undefined && valor >= o) return 'ouro';
  if (pr !== undefined && valor >= pr) return 'prata';
  if (valor >= b) return 'bronze';
  return null;
}
const se = (cond: boolean, n: Nivel = 'unico'): Nivel | null => (cond ? n : null);

/** Regras do MVP. As que não estão aqui ficam como "em breve" (mistério) no Álbum. */
export const REGRAS: Record<string, (f: Fatos) => Nivel | null> = {
  // AL · Trilha do Alfabeto (D027): um selo por letra concluída + o troféu do alfabeto inteiro
  ...Object.fromEntries(ALFABETO.map((l) => [seloDaLetra(l.letra), (f: Fatos) => se(f.concluidas.has(faseDaLetra(l.letra)))])),
  [SELO_ALFABETO_COMPLETO]: (f) => se(f.concluidas.has('AL-FESTA')),
  // R0
  'S-R0-01': (f) => se(f.concluidas.has('R0-F01'), 'bronze'),
  'TI-R0-01': (f) => se(f.concluidas.has('R0-F01')),
  'S-R0-02': (f) => degraus(f.acertos('rima'), [5, 10, 20]),
  'S-R0-03': (f) => (f.sessoesCom('silaba') >= 1 ? degraus(f.acertos('silaba'), [8, 16, 30]) : null),
  'S-R0-04': (f) => degraus(f.acertos('som-inicial'), [6, 12, 24]),
  'S-R0-05': (f) => degraus(f.acertos('sintese'), [6, 12, 24]),
  'M-R0-01': (f) => se(f.concluidas.has('R0-F06')),
  'TI-R0-02': (f) => se(f.concluidas.has('R0-F06')),
  'S-R0-06': (f) => se(f.concluidas.has('R0-F06'), 'bronze'),
  'S-R0-07': (f) => se(f.contador('album-familia') >= 1, 'bronze'),
  'S-R0-10': (f) => se(f.moedinhasTotal > 0, 'bronze'),
  'S-R0-12': (f) => degraus(f.contador('ensinar'), [5, 15, 30]),
  'S-R0-13': (f) => degraus(f.contador('esporte-amarelinha'), [1, 3, 6]),
  'S-R0-15': (f) => degraus(f.contador('rituais'), [3, 10, 25]),
  'V-R0-01': (f) => se(f.validadas('R0') >= 1),
  // R1
  'S-R1-01': (f) => se(['vogal-a', 'vogal-e', 'vogal-i', 'vogal-o', 'vogal-u'].every((h) => f.acertos(h) >= 1) && f.acertos('vogais') >= 4, 'bronze'),
  'S-R1-02': (f) => se(f.contador('espelho-vogais') >= 5, 'bronze'),
  'S-R1-03': (f) => degraus(f.acertos('vogal-e'), [8, 16]),
  'S-R1-04': (f) => degraus(f.acertos('o-aberto-fechado'), [8, 16]),
  'S-R1-05': (f) => degraus(f.contador('tracados'), [5, 15]),
  'S-R1-06': (f) => degraus(f.contador('cacar-vogal'), [3, 10]),
  'M-R1-01': (f) => se(f.concluidas.has('R1-F07')),
  'S-R1-07': (f) => se(f.concluidas.has('R1-F07'), 'bronze'),
  'S-R1-08': (f) => degraus(f.acertos('vogais'), [8, 16]),
  'S-R1-10': (f) => degraus(f.contador('tentou-de-novo'), [5, 15, 40]),
  'S-R1-12': (f) => degraus(f.contador('ambiental-praia'), [1, 3]),
  'S-R1-18': (f) => degraus(f.contador('revisao-acertos'), [25, 60, 120]),
  'V-R1-01': (f) => se(f.validadas('R1') >= 1),
  'S-SOM-A': (f) => se(f.dominada('vogal-a'), 'bronze'),
  'S-SOM-E-E-E': (f) => se(f.dominada('vogal-e'), 'bronze'),
  'S-SOM-I': (f) => se(f.dominada('vogal-i'), 'bronze'),
  'S-SOM-O-O-O': (f) => se(f.dominada('vogal-o'), 'bronze'),
  'S-SOM-U': (f) => se(f.dominada('vogal-u'), 'bronze'),
  // R2a
  'S-SOM-M': (f) => se(f.dominada('gpc-m'), 'bronze'),
  'S-SOM-L': (f) => se(f.dominada('gpc-l'), 'bronze'),
  'S-SOM-F': (f) => se(f.dominada('gpc-f'), 'bronze'),
  'S-R2a-01': (f) => se(f.contador('espelho-mlf') >= 3, 'bronze'),
  'S-R2a-02': (f) => degraus(f.acertos('gpc-m') + f.acertos('gpc-l') + f.acertos('gpc-f'), [10, 20]),
  'S-R2a-03': (f) => degraus(f.acertos('silaba-cv'), [10, 20]),
  'S-R2a-04': (f) => degraus(f.contador('silabas-montadas'), [8, 16]),
  'M-R2a-01': (f) => se(f.contador('leu-sozinho') >= 1),
  'S-R2a-05': (f) => (f.sessoesCom('leitura-cvcv') >= 2 ? degraus(f.acertos('leitura-cvcv'), [10, 20, 40]) : null),
  'S-R2a-06': (f) => degraus(f.contador('palavra-que-faz'), [3, 8]),
  'S-R2a-07': (f) => degraus(f.contador('ditado-palavras'), [5, 10]),
  'M-R2a-02': (f) => se(f.concluidas.has('R2a-F05')),
  'S-R2a-08': (f) => se(f.concluidas.has('R2a-F05'), 'bronze'),
  'TI-R2a-01': (f) => se(f.concluidas.has('R2a-F05')),
  'S-R2a-09': (f) => se(f.contador('guia-da-mata') >= 1, 'bronze'),
  'V-R2a-01': (f) => se(f.validadas('R2a') >= 1),
  'V-R2a-02': (f) => se(f.validadas('R2a') >= 1 && f.contador('leu-pra-familia') >= 1)
};

const ORDEM: Nivel[] = ['bronze', 'prata', 'ouro', 'diamante'];

/** Avalia as regras e devolve SÓ o que é novo (conquista nova ou nível mais alto). */
export function avaliarConquistas(p: Progresso, demonstracoes: Demonstracao[], agora: number): { progresso: Progresso; novas: ConquistaGanha[] } {
  const f = fatosDe(p, demonstracoes);
  const novas: ConquistaGanha[] = [];
  const conquistas = { ...p.conquistas };
  for (const [id, regra] of Object.entries(REGRAS)) {
    if (!CONQUISTA_POR_ID[id]) continue;
    const nivel = regra(f);
    if (!nivel) continue;
    const atual = conquistas[id];
    const melhor = !atual || (nivel !== 'unico' && ORDEM.indexOf(nivel) > ORDEM.indexOf(atual.nivel));
    if (melhor) {
      const g: ConquistaGanha = { id, nivel, em: agora, vista: false };
      conquistas[id] = g;
      novas.push(g);
    }
  }
  return { progresso: { ...p, conquistas }, novas };
}
