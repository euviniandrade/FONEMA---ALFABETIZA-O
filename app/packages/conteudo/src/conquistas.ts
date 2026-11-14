/**
 * Conquistas do MVP = subconjunto do catálogo oficial (conquistas/catalogo.json),
 * extraído por scripts/extrair-conquistas.mjs, + a DICA do cadeado e o motivo do selo.
 *
 * P1-b (padrão provisório do MVP): o cadeado diz a HABILIDADE, nunca "faça X para desbloquear",
 * e os prêmios chegam como SURPRESA depois do fato.
 */
import catalogo from './dados/conquistas-catalogo.json';
import type { Conquista, ConquistaCatalogo } from './tipos.ts';
import { ALFABETO, seloDaLetra } from './alfabeto.ts';

const MOTIVO_POR_CATEGORIA: Record<string, string> = {
  fonema: '👂', silaba: '👏', palavra: '📖', leitura: '📚', compreensao: '💡', valores: '🤝', esporte: '⚽',
  ambiente: '🌱', conhecimento: '🌎', financeiro: '🪙', emocional: '💛', computacional: '🧩',
  familia_professor: '✔', constancia: '🌙', colecionador: '🖼', segredo: '❔'
};

/** Dica do cadeado por conquista (habilidade, em linguagem de criança, lida em voz alta). */
const DICAS: Record<string, { dica: string; motivo?: string }> = {
  'S-R0-01': { dica: 'O som do começo do seu nome', motivo: '$LETRA' },
  'TI-R0-01': { dica: 'A primeira missão: o som do seu nome', motivo: '🌱' },
  'S-R0-02': { dica: 'Achar palavras que terminam igual', motivo: '🎵' },
  'S-R0-03': { dica: 'Bater palmas nos pedacinhos das palavras' },
  'S-R0-04': { dica: 'Escutar o comecinho das palavras' },
  'S-R0-05': { dica: 'Juntar sons falados devagar', motivo: '🔗' },
  'M-R0-01': { dica: 'A Festa das Rimas, na praça', motivo: '🏮' },
  'TI-R0-02': { dica: 'Vencer a Festa das Rimas', motivo: '🔍' },
  'S-R0-06': { dica: 'A Festa das Rimas, na praça', motivo: '🏡' },
  'S-R0-07': { dica: 'Bater palmas nos nomes da família', motivo: '👨‍👩‍👧' },
  'S-R0-10': { dica: 'Guardar moedinhas no cofrinho-tatu' },
  'S-R0-12': { dica: 'Ensinar o Bolota com gentileza', motivo: '🦔' },
  'S-R0-13': { dica: 'Pular a amarelinha batendo as sílabas', motivo: '🦶' },
  'S-R0-15': { dica: 'Terminar a sessão no ritual de fim', motivo: '🌙' },
  'V-R0-01': { dica: 'Mostrar o que aprendeu para um adulto' },
  'S-R1-01': { dica: 'Ouvir as 5 vogais e tocar a letra', motivo: '✋' },
  'S-R1-02': { dica: 'Imitar a boca da Sofia nas vogais', motivo: '🪞' },
  'S-R1-03': { dica: 'Ouvir a diferença entre é e ê', motivo: 'É' },
  'S-R1-04': { dica: 'Ouvir a diferença entre vovó e vovô', motivo: 'Ó' },
  'S-R1-05': { dica: 'Desenhar as vogais com o dedo', motivo: '✍' },
  'S-R1-06': { dica: 'Achar a vogal do começo das palavras', motivo: '🎣' },
  'M-R1-01': { dica: 'Acender o farol da ilha', motivo: '🗼' },
  'S-R1-07': { dica: 'Acender o farol da ilha', motivo: '🏝' },
  'S-R1-08': { dica: 'Separar figuras pelo primeiro som', motivo: '🧺' },
  'S-R1-10': { dica: 'Tentar de novo depois de errar', motivo: '💪' },
  'S-R1-12': { dica: 'Limpar a praia para a tartaruga', motivo: '🐢' },
  'S-R1-18': { dica: 'Lembrar o que aprendeu em outros dias', motivo: '🌼' },
  'V-R1-01': { dica: 'Mostrar as vogais para o professor' },
  'S-SOM-A': { dica: 'O som /a/ da letra A', motivo: 'A' },
  'S-SOM-E-E-E': { dica: 'Os sons /é/ e /ê/ da letra E', motivo: 'E' },
  'S-SOM-I': { dica: 'O som /i/ da letra I', motivo: 'I' },
  'S-SOM-O-O-O': { dica: 'Os sons /ó/ e /ô/ da letra O', motivo: 'O' },
  'S-SOM-U': { dica: 'O som /u/ da letra U', motivo: 'U' },
  'S-SOM-M': { dica: 'O som /m/ da letra M', motivo: 'M' },
  'S-SOM-L': { dica: 'O som /l/ da letra L', motivo: 'L' },
  'S-SOM-F': { dica: 'O som /f/ da letra F', motivo: 'F' },
  'S-R2a-01': { dica: 'Esticar /mmm/, /lll/ e /fff/', motivo: '〰' },
  'S-R2a-02': { dica: 'Achar /m/, /l/ e /f/ no começo das palavras' },
  'S-R2a-03': { dica: 'Juntar consoante e vogal: MA, LO, FU', motivo: 'MA' },
  'S-R2a-04': { dica: 'Montar sílabas na tábua', motivo: 'FI' },
  'M-R2a-01': { dica: 'Ler a primeira palavra sem ajuda', motivo: '🧳' },
  'S-R2a-05': { dica: 'Ler palavras da mata em dias diferentes', motivo: '🌿' },
  'S-R2a-06': { dica: 'Ler a palavra e ver a coisa acontecer', motivo: '✨' },
  'S-R2a-07': { dica: 'Escrever palavras ditadas com letras móveis', motivo: '✏' },
  'M-R2a-02': { dica: 'Atravessar a Cachoeira das Sílabas', motivo: '💧' },
  'S-R2a-08': { dica: 'Atravessar a Cachoeira das Sílabas', motivo: '🌳' },
  'TI-R2a-01': { dica: 'Vencer a Cachoeira das Sílabas', motivo: '🎒' },
  'S-R2a-09': { dica: 'Fazer o guia da mata para o Bolota', motivo: '📒' },
  'V-R2a-01': { dica: 'Mostrar a primeira palavra para o professor' },
  'V-R2a-02': { dica: 'Ler 3 palavras para alguém da família', motivo: '🏠' }
};

function primeiraFrase(t: string): string {
  const s = t.replace(/^(Bronze|Prata|Ouro)[^:]*:\s*/i, '');
  return s.split(/[.;(]/)[0].trim();
}

/** Trilha do Alfabeto (D027): um selo por letra + o troféu "Alfabeto Completo" (fora do catálogo antigo). */
export const SELO_ALFABETO_COMPLETO = 'T-ALFABETO';
const CONQUISTAS_ALFABETO: Conquista[] = [
  ...ALFABETO.map((l): Conquista => ({
    id: seloDaLetra(l.letra), nome: `Letra ${l.letra}`, tipo: 'selo', categoria: 'fonema', regiao: 'AL',
    criterio: `Completar a missão da letra ${l.letra} na Trilha do Alfabeto.`, niveis: ['unico'], visivel_antes: 'visivel',
    dica: `Conhecer a letra ${l.letra}`, motivo: l.letra
  })),
  {
    id: SELO_ALFABETO_COMPLETO, nome: 'Alfabeto Completo', tipo: 'trofeu', categoria: 'fonema', regiao: 'AL',
    criterio: 'Conhecer as 26 letras e vencer a Festa do Alfabeto.', niveis: ['unico'], visivel_antes: 'visivel',
    dica: 'Conhecer todas as letras, de A a Z', motivo: 'AZ'
  }
];

export const CONQUISTAS: Conquista[] = [
  ...CONQUISTAS_ALFABETO,
  ...(catalogo as ConquistaCatalogo[]).map((c) => ({
    ...c,
    dica: DICAS[c.id]?.dica ?? primeiraFrase(c.criterio),
    motivo: DICAS[c.id]?.motivo ?? MOTIVO_POR_CATEGORIA[c.categoria] ?? '★'
  }))
];

export const CONQUISTA_POR_ID: Record<string, Conquista> = Object.fromEntries(CONQUISTAS.map((c) => [c.id, c]));
