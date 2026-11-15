/**
 * Atalhos para escrever fases como dados, sem repetir estrutura.
 * Ex.: itemFig('sssapo… lua', 'sapo', 'lua') monta um item de TOCAR com 2 figuras.
 */
import type { Fala, ItemEscolha, Opcao, Personagem } from './tipos.ts';
import { figura } from './palavras.ts';
import { SONS } from './sons.ts';

const fala = (quem: Personagem) => (texto: string): Fala => ({ quem, texto });
export const sofia = fala('sofia');
export const tales = fala('tales');
export const bolota = fala('bolota');
export const donaCida = fala('dona-cida');
export const davi = fala('davi');
export const guarda = fala('guarda-parque');
export const pescadora = fala('pescadora');

/** Posição determinística da resposta certa (sem sorte, sem padrão fixo). */
let contador = 0;
export function posiciona<T>(certa: T, outras: T[]): T[] {
  const lista = [...outras];
  const pos = contador++ % (outras.length + 1);
  lista.splice(pos, 0, certa);
  return lista;
}

export function opFig(texto: string): Opcao {
  const w = figura(texto);
  return { id: texto, rotulo: texto, figura: w.figura, falar: texto };
}

const LETRA_SOM: Record<string, string> = { A: 'a', E: 'E', I: 'i', O: 'O', U: 'u', M: 'm', L: 'l', F: 'f', S: 's', V: 'v' };
export function opLetra(letra: string): Opcao {
  const som = SONS[LETRA_SOM[letra] ?? letra.toLowerCase()];
  // `som`: fonema da letra, para a correção contrastiva tocar o som escolhido e o som certo (D030 §2b)
  return { id: letra, rotulo: letra, letra, falar: som ? som.esticado : letra, ...(som ? { som: som.chave } : {}) };
}

/** TOCAR a figura: ouve `ouvir` e toca a figura `certa`. */
export function itemFig(ouvir: string, certa: string, ...outras: string[]): ItemEscolha {
  return { ouvir, correta: certa, opcoes: posiciona(opFig(certa), outras.map(opFig)) };
}

/** TOCAR a letra que faz o som ouvido. */
export function itemLetra(ouvir: string, certa: string, ...outras: string[]): ItemEscolha {
  return { ouvir, correta: certa, opcoes: posiciona(opLetra(certa), outras.map(opLetra)) };
}

/** Sim ou não ("rima ou não rima?", "começam igual?"). */
export function itemSimNao(ouvir: string, resposta: boolean, rotulos: [string, string] = ['Sim', 'Não']): ItemEscolha {
  const sim: Opcao = { id: 'sim', rotulo: rotulos[0], figura: '👍', falar: rotulos[0] };
  const nao: Opcao = { id: 'nao', rotulo: rotulos[1], figura: '✋', falar: rotulos[1] };
  return { ouvir, correta: resposta ? 'sim' : 'nao', opcoes: [sim, nao] };
}

/** LER a palavra escrita e tocar a figura certa. */
export function itemLer(palavra: string, certa: string, ...outras: string[]): ItemEscolha {
  return { mostrar: palavra, correta: certa, opcoes: posiciona(opFig(certa), outras.map(opFig)), leitura: true, formato: 'ler-figura' };
}

/**
 * Sílaba que falta na placa (ex.: "__LA" → FA). A pista NÃO mostra a palavra inteira (D030 §7): a criança OUVE a
 * palavra (`palavra`) e escolhe a sílaba.
 */
export function itemSilaba(mostrar: string, palavra: string, certa: string, ...outras: string[]): ItemEscolha {
  const op = (s: string): Opcao => ({ id: s, rotulo: s, letra: s, falar: s.toLowerCase() });
  return { mostrar, ouvir: palavra.toLowerCase(), quem: 'sofia', correta: certa, opcoes: posiciona(op(certa), outras.map(op)), formato: 'silaba-falta' };
}

/**
 * FONEMA que falta (a versão fônica de "qual sílaba falta"): ouve a palavra, vê a escrita com um buraco ("_ALA") e
 * escolhe a LETRA do som que falta. A correção toca o som escolhido e o som que falta.
 */
export function itemFonema(mostrar: string, palavra: string, certa: string, ...outras: string[]): ItemEscolha {
  return { mostrar, ouvir: palavra.toLowerCase(), quem: 'sofia', correta: certa, opcoes: posiciona(opLetra(certa), outras.map(opLetra)), formato: 'fonema-falta' };
}

/**
 * OUVIR AS LEITURAS ("o Bolota leu errado", D030 §8): a palavra aparece escrita e as opções são BOTÕES DE SOM, sem
 * nada escrito; a criança ouve as leituras e escolhe a que combina com a palavra.
 */
export function itemOuvirLeituras(palavra: string, ...erradas: string[]): ItemEscolha {
  const op = (t: string): Opcao => ({ id: t.toLowerCase(), rotulo: '', falar: t.toLowerCase(), botaoDeSom: true });
  return { mostrar: palavra.toUpperCase(), correta: palavra.toLowerCase(), opcoes: posiciona(op(palavra), erradas.map(op)), leitura: true, formato: 'ouvir-leituras' };
}
