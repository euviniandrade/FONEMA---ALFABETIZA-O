/**
 * Resolve os marcadores das cenas para UMA criança: $NOME, $SOM_NOME, $LETRA_NOME, $PALAVRA_NOME
 * e o gerador "som-do-nome" (caça às figuras que começam com o mesmo som do nome).
 */
import { SONS } from '@fonema/conteudo';
import type { Atividade, Cena, ItemEscolha } from '@fonema/conteudo';
import { rodadaFiguras, somInicial, silabas } from './primeiro-som.ts';

export interface InfoNome {
  nome: string;
  /** Sílabas para as palmas (vêm da grafia da pronúncia escolhida, ex.: Ma-ri-A-na). */
  silabas: string[];
  chave: string;
  /** Letras do começo a destacar (letra real) e quantas são mudas. */
  letras: string;
  mudo: number;
  nota: string | null;
}

export function infoNome(nome: string, grafia?: string): InfoNome {
  const s = somInicial(nome) ?? { chave: 'a', destaque: 1, mudo: 0, nota: null };
  const sil = grafia && grafia.includes('-') ? grafia.replace(/\s*\(.*\)$/, '').split('-').map((x) => x.toLowerCase()) : silabas(nome);
  return { nome, silabas: sil, chave: s.chave, letras: nome.slice(0, s.destaque).toUpperCase(), mudo: s.mudo, nota: s.nota };
}

function trocaTexto(t: string, n: InfoNome): string {
  const som = SONS[n.chave] ?? SONS.a;
  return t
    .replace(/\$PALAVRA_NOME/g, som.palavras[0][0])
    .replace(/\$SOM_NOME/g, n.chave)
    .replace(/\$LETRA_NOME/g, n.letras)
    .replace(/\$NOME/g, n.nome);
}

export function itensSomDoNome(n: InfoNome, rodadas = 4): ItemEscolha[] {
  const som = SONS[n.chave] ?? SONS.a;
  const itens: ItemEscolha[] = [];
  for (let i = 0; i < rodadas; i++) {
    const r = rodadaFiguras(n.nome + '·'.repeat(i), n.chave);
    const certo = r.find((x) => x.certo)!;
    itens.push({
      ouvir: `${som.esticado}… qual começa com ${som.esticado}, igual a ${n.nome}?`,
      correta: certo.palavra,
      habilidade: 'som-do-nome',
      dica: `Escuta: ${som.esticado}… ${certo.palavra}. Começa igual a ${n.nome}!`,
      opcoes: r.map((x) => ({ id: x.palavra, rotulo: x.palavra, figura: x.fig, falar: x.palavra }))
    });
  }
  return itens;
}

export function resolverAtividade(a: Atividade, n: InfoNome): Atividade {
  switch (a.tipo) {
    case 'palmas':
    case 'montar':
      return { ...a, palavras: a.palavras.map((w) => trocaTexto(w, n)) } as Atividade;
    case 'espelho':
      return { ...a, fonema: trocaTexto(a.fonema, n), letra: trocaTexto(a.letra, n), ancora: { ...a.ancora, texto: trocaTexto(a.ancora.texto, n) } };
    case 'pausa':
      return { ...a, sequencia: a.sequencia.map((s) => ({ ...s, falar: trocaTexto(s.falar, n) })) };
    case 'escolher':
      return a.gerador === 'som-do-nome' ? { ...a, itens: itensSomDoNome(n) } : a;
    default:
      return a;
  }
}

export function resolverCena(c: Cena, n: InfoNome): Cena {
  return c.atividade ? { ...c, atividade: resolverAtividade(c.atividade, n) } : c;
}

/** Sílabas de qualquer palavra das palmas ($NOME já resolvido usa a grafia da pronúncia). */
export function silabasPara(palavra: string, n?: InfoNome): string[] {
  if (n && palavra === n.nome) return n.silabas;
  return silabas(palavra);
}
