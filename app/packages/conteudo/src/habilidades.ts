/**
 * Grafo de habilidades do MVP (R0–R2a). A ordem do array é a ordem da jornada.
 * Base: jogo-completo/02 (tabelas "Como a aprendizagem é medida").
 */
import type { Habilidade } from './tipos.ts';
import { ALFABETO, habilidadeLetra } from './alfabeto.ts';

export const HABILIDADES: Habilidade[] = [
  // AL · Trilha do Alfabeto (D027): uma habilidade por letra (letra ↔ som principal)
  ...ALFABETO.map((l): Habilidade => ({
    id: habilidadeLetra(l.letra), regiao: 'AL', exigePseudo: false,
    nome: l.ipa && l.tipo !== 'nomes' ? `Letra ${l.letra} ↔ som ${l.ipa}` : `Letra ${l.letra}`,
    paraFamilia: l.tipo === 'muda' ? `conhece a letra ${l.letra} (que não faz som sozinha)` : `conhece a letra ${l.letra} e o som dela, como em "${l.palavra}"`
  })),
  // R0 · consciência fonológica oral
  { id: 'nome-silabas', regiao: 'R0', nome: 'Palmas no próprio nome', paraFamilia: 'bate as palmas das sílabas do próprio nome', exigePseudo: false },
  { id: 'som-do-nome', regiao: 'R0', nome: 'Primeiro som do nome', paraFamilia: 'sabe o primeiro som do próprio nome', exigePseudo: false },
  { id: 'rima', regiao: 'R0', nome: 'Rimas', paraFamilia: 'percebe palavras que rimam', exigePseudo: false },
  { id: 'silaba', regiao: 'R0', nome: 'Sílabas (palmas)', paraFamilia: 'separa palavras em sílabas com palmas', exigePseudo: false },
  { id: 'som-inicial', regiao: 'R0', nome: 'Som inicial', paraFamilia: 'acha o primeiro som das palavras', exigePseudo: false },
  { id: 'sintese', regiao: 'R0', nome: 'Juntar sons', paraFamilia: 'junta sons falados devagar e descobre a palavra', exigePseudo: false },
  // R1 · vogais
  { id: 'vogal-a', regiao: 'R1', nome: 'Vogal A', paraFamilia: 'reconhece o som do A', exigePseudo: false, seloMaestria: 'S-SOM-A' },
  { id: 'vogal-o', regiao: 'R1', nome: 'Vogal O (ó/ô)', paraFamilia: 'reconhece o som do O', exigePseudo: false, seloMaestria: 'S-SOM-O-O-O' },
  { id: 'o-aberto-fechado', regiao: 'R1', nome: 'ó × ô', paraFamilia: 'ouve a diferença entre vovó e vovô', exigePseudo: false },
  { id: 'vogal-e', regiao: 'R1', nome: 'Vogal E (é/ê)', paraFamilia: 'reconhece o som do E', exigePseudo: false, seloMaestria: 'S-SOM-E-E-E' },
  { id: 'vogal-i', regiao: 'R1', nome: 'Vogal I', paraFamilia: 'reconhece o som do I', exigePseudo: false, seloMaestria: 'S-SOM-I' },
  { id: 'vogal-u', regiao: 'R1', nome: 'Vogal U', paraFamilia: 'reconhece o som do U', exigePseudo: false, seloMaestria: 'S-SOM-U' },
  { id: 'vogais', regiao: 'R1', nome: 'As 5 vogais misturadas', paraFamilia: 'reconhece as 5 vogais misturadas', exigePseudo: false },
  // R2a · M, L, F e primeiras palavras
  { id: 'gpc-m', regiao: 'R2a', nome: 'Letra M ↔ som /m/', paraFamilia: 'liga a letra M ao som /m/', exigePseudo: false, seloMaestria: 'S-SOM-M' },
  { id: 'gpc-l', regiao: 'R2a', nome: 'Letra L ↔ som /l/', paraFamilia: 'liga a letra L ao som /l/', exigePseudo: false, seloMaestria: 'S-SOM-L' },
  { id: 'gpc-f', regiao: 'R2a', nome: 'Letra F ↔ som /f/', paraFamilia: 'liga a letra F ao som /f/', exigePseudo: false, seloMaestria: 'S-SOM-F' },
  { id: 'silaba-cv', regiao: 'R2a', nome: 'Juntar consoante e vogal (MA, LU, FI)', paraFamilia: 'junta consoante e vogal em sílabas', exigePseudo: false },
  { id: 'leitura-cvcv', regiao: 'R2a', nome: 'Ler palavras como MALA e LUA', paraFamilia: 'lê palavras como MALA e LUA', exigePseudo: true },
  { id: 'escrita-cvcv', regiao: 'R2a', nome: 'Escrever palavras com letras móveis', paraFamilia: 'escreve palavras simples com letras móveis', exigePseudo: false }
];

export const HABILIDADE_POR_ID: Record<string, Habilidade> = Object.fromEntries(HABILIDADES.map((h) => [h.id, h]));
