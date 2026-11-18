/**
 * ASSISTENTE DE PRONÚNCIA para palavra NOVA (gerenciador): o verificador de decodificabilidade só aceita palavra com a
 * pronúncia anotada à mão, som a som (decodificabilidade.ts §2), porque o E e o O abertos/fechados, o O/E do fim que
 * soam U/I e a sílaba forte não se deduzem das letras. Em vez de pedir a notação ao administrador, fazemos as perguntas
 * em linguagem simples e montamos a anotação; o administrador ainda pode corrigir à mão.
 * O resto (C antes de E/I = S, S entre vogais = Z, R no começo = forte…) segue a regra comum das letras [DP].
 */
import { analisar, grafemas, type EntradaBanco } from '../decodificabilidade.ts';

export type RespostaVogal = 'fechado' | 'aberto' | 'u-i';
export interface PerguntaPronuncia {
  /** Posição do grafema na palavra (índice em `grafemas`). */
  indice: number;
  /** A letra perguntada (e/o). */
  letra: 'e' | 'o';
  /** Pedaço da palavra com a letra em destaque (ex.: "pe[t]eca" → "p(e)teca"). */
  destaque: string;
  pergunta: string;
  opcoes: { valor: RespostaVogal; rotulo: string }[];
  padrao: RespostaVogal;
}

const VOGAIS = 'aeiouáàâãéêíóôõú';
const ehVogal = (c: string | undefined) => !!c && VOGAIS.includes(c);
const NASAL: Record<string, string> = { a: 'ã', â: 'ã', e: 'ẽ', ê: 'ẽ', i: 'ĩ', o: 'õ', ô: 'õ', u: 'ũ', ú: 'ũ' };

/** As perguntas que a palavra precisa (uma por E/O sem acento). */
export function perguntasDePronuncia(palavra: string): PerguntaPronuncia[] {
  const w = palavra.toLowerCase();
  const gs = grafemas(w);
  const out: PerguntaPronuncia[] = [];
  const ultimaVogal = [...gs].reverse().find((g) => ehVogal(g.g[0]) && g.g.length === 1 && !(g.g === 's'))?.i;
  gs.forEach((g, i) => {
    if (g.g !== 'e' && g.g !== 'o') return;
    const letra = g.g as 'e' | 'o';
    const destaque = `${w.slice(0, g.i)}(${letra})${w.slice(g.i + 1)}`;
    const noFim = g.i === ultimaVogal && (g.i === w.length - 1 || (g.i === w.length - 2 && w.endsWith('s')));
    const depoisDeVogal = ehVogal(w[g.i - 1]);
    if (noFim && !depoisDeVogal) {
      out.push({
        indice: i, letra, destaque,
        pergunta: letra === 'o' ? `O "o" do fim de "${w}" soa "u" (como em "pato")?` : `O "e" do fim de "${w}" soa "i" (como em "dente")?`,
        opcoes: [{ valor: 'u-i', rotulo: letra === 'o' ? 'Sim, soa "u"' : 'Sim, soa "i"' }, { valor: 'fechado', rotulo: letra === 'o' ? 'Não, soa "ô"' : 'Não, soa "ê"' }, { valor: 'aberto', rotulo: letra === 'o' ? 'Não, soa "ó"' : 'Não, soa "é"' }],
        padrao: 'u-i'
      });
    } else {
      out.push({
        indice: i, letra, destaque,
        pergunta: letra === 'o' ? `Em "${destaque}", o "o" é aberto (ó, como em "bola") ou fechado (ô, como em "bolo")?` : `Em "${destaque}", o "e" é aberto (é, como em "pé") ou fechado (ê, como em "dedo")?`,
        opcoes: [{ valor: 'fechado', rotulo: letra === 'o' ? 'Fechado (ô)' : 'Fechado (ê)' }, { valor: 'aberto', rotulo: letra === 'o' ? 'Aberto (ó)' : 'Aberto (é)' }, { valor: 'u-i', rotulo: letra === 'o' ? 'Soa "u"' : 'Soa "i"' }],
        padrao: 'fechado'
      });
    }
  });
  return out;
}

/** A palavra tem acento escrito? (então a sílaba forte já está marcada e não é preciso perguntar) */
export const temAcentoGrafico = (palavra: string) => /[áàâãéêíóôõú]/.test(palavra.toLowerCase());

/** Monta a anotação ("p a t u") a partir das respostas. `respostas[indice]` vale para os E/O; o resto segue a regra comum. */
export function anotarPalavra(palavra: string, respostas: Record<number, RespostaVogal> = {}): string {
  const w = palavra.toLowerCase();
  const gs = grafemas(w);
  const padroes = new Map(perguntasDePronuncia(w).map((p) => [p.indice, p.padrao]));
  const sons: string[] = [];
  gs.forEach((gr, idx) => {
    const g = gr.g;
    const ant = w[gr.i - 1];
    const prox = w[gr.i + g.length];
    const fimSilaba = !ehVogal(prox);
    const r = respostas[idx] ?? padroes.get(idx);
    switch (g) {
      case 'a': case 'á': case 'à': case 'â': sons.push('a'); break;
      case 'e': sons.push(r === 'aberto' ? 'ɛ' : r === 'u-i' ? 'i' : 'e'); break;
      case 'o': sons.push(r === 'aberto' ? 'ɔ' : r === 'u-i' ? 'u' : 'o'); break;
      case 'é': sons.push('ɛ'); break;
      case 'ê': sons.push('e'); break;
      case 'ó': sons.push('ɔ'); break;
      case 'ô': sons.push('o'); break;
      case 'i': case 'í': case 'y': sons.push('i'); break;
      case 'u': case 'ú': sons.push('u'); break;
      case 'ã': sons.push('ã'); break;
      case 'õ': sons.push('õ'); break;
      case 'c': sons.push(/[eiéêí]/.test(prox ?? '') ? 's' : 'k'); break;
      case 'ç': sons.push('s'); break;
      case 'g': sons.push(/[eiéêí]/.test(prox ?? '') ? 'ʒ' : 'g'); break;
      case 'h': break;
      case 'j': sons.push('ʒ'); break;
      case 'q': sons.push('k'); break;
      case 'l': sons.push(fimSilaba ? 'u' : 'l'); break;
      case 'r': sons.push(gr.i === 0 || (ant && !ehVogal(ant) && !/[bcdfgptv]/.test(ant)) ? 'R' : 'ɾ'); break;
      case 's': sons.push(gr.i > 0 && ehVogal(ant) && ehVogal(prox) ? 'z' : 's'); break;
      case 'z': sons.push(fimSilaba && gr.i > 0 ? 's' : 'z'); break;
      case 'x': sons.push('ʃ'); break;
      case 'w': sons.push('u'); break;
      case 'ch': sons.push('ʃ'); break;
      case 'lh': sons.push('ʎ'); break;
      case 'nh': sons.push('ɲ'); break;
      case 'rr': sons.push('R'); break;
      case 'ss': sons.push('s'); break;
      case 'qu': sons.push(...(/[aoáó]/.test(prox ?? '') ? ['k', 'u'] : ['k'])); break;
      case 'gu': sons.push('g'); break;
      default:
        if (g.length === 2 && NASAL[g[0]]) { sons.push(NASAL[g[0]]); if (g[0] === 'e' && gr.i + 2 === w.length) sons.push('i'); }
        else sons.push(g);
    }
  });
  return sons.join(' ');
}

/** Confere a anotação contra as letras (os mesmos erros que o verificador daria). */
export function conferirAnotacao(e: EntradaBanco): string[] {
  if (!e.texto.trim()) return ['Escreva a palavra.'];
  if (!/^[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]+$/.test(e.texto)) return ['Use só letras (uma palavra, sem espaço nem número).'];
  return analisar(e).erros;
}
