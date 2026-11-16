/**
 * TEXTOS DECODIFICÁVEIS PARA LER SOZINHO (D030 §3, camada F de docs/pedagogia/00; 05 §3): um texto curto no fim de cada
 * bloco da Trilha dos Sons, montado SÓ com valores sonoros já ensinados até a unidade indicada (`ate`).
 * O teste `conteudo/test/biblioteca.test.ts` passa cada frase pelo verificador (`verificarFrase` e `verificarTexto`).
 *
 * Fundamento: "primeiro apenas decodificáveis e, pouco depois" variados (ABC p. 334–335); textos iniciais com palavras
 * regulares (ABC p. 376); controle progressivo para leitura independente (SOA p. 230); perguntas com o texto à vista quando
 * a tarefa mede leitura (04 N12 [DP]); leitura em coro depois, como prática de fluência (ABC p. 375–376; SOA p. 246–248).
 * Textos do projeto (07 §3). Limite honesto: com só as vogais (bloco 1), o texto é um diálogo de três falas.
 * As palavras que não estavam no banco foram acrescentadas, com pronúncia anotada, no fim de `fases/tf-banco.ts`.
 */
import type { Fala } from '../tipos.ts';
import type { TextoDecodificavel } from './tipos.ts';

const s = (texto: string): Fala => ({ quem: 'sofia', texto });

export const TEXTOS_DECODIFICAVEIS: TextoDecodificavel[] = [
  {
    id: 'oi', titulo: 'Oi!', bloco: 1, ate: 'TF-06', liberaCom: ['TF-06'],
    linhas: [{ texto: 'Oi!', quem: 'sofia' }, { texto: 'Oi, oi!', quem: 'tales' }, { texto: 'Ai! Ui!', quem: 'tales' }],
    perguntas: [
      { tipo: 'literal', pergunta: s('Leia de novo. O que a Sofia falou?'), opcoes: ['oi', 'ai', 'ui'], correta: 'oi', escritas: true },
      { tipo: 'inferencia', pergunta: s('Como o Tales ficou no fim?'), opcoes: ['rosto-triste', 'rosto-feliz', 'rosto-bravo'], correta: 'rosto-triste' }
    ]
  },
  {
    id: 'ema-suja', titulo: 'A ema suja', bloco: 2, ate: 'TF-15', liberaCom: ['TF-15', 'TF-R2'],
    linhas: [
      { texto: 'A ema viu a lama.' }, { texto: 'A ema foi na lama.' }, { texto: 'A ema sai suja, suja!' }, { texto: 'A mula viu a ema e fala: Ai, ai, ema!' }
    ],
    perguntas: [
      { tipo: 'literal', pergunta: s('Onde a ema foi?'), opcoes: ['lama', 'lua', 'navio'], correta: 'lama' },
      { tipo: 'literal', pergunta: s('Quem viu a ema suja?'), opcoes: ['mula', 'lula', 'vaca'], correta: 'mula' },
      { tipo: 'inferencia', pergunta: s('Do que a ema precisa agora?'), opcoes: ['banho', 'bolo-velinhas', 'pipoca'], correta: 'banho' }
    ]
  },
  {
    id: 'bolo-tia', titulo: 'O bolo da tia', bloco: 3, ate: 'TF-22', liberaCom: ['TF-22', 'TF-R3'],
    linhas: [
      { texto: 'Dia de bolo!' }, { texto: 'O bolo da tia caiu no tapete.' }, { texto: 'O gato viu o bolo.' }, { texto: 'O gato pula no bolo!' },
      { texto: 'A tia fala: Ai, ai, gato!' }
    ],
    perguntas: [
      { tipo: 'literal', pergunta: s('Onde o bolo caiu?'), opcoes: ['tapete', 'mesa', 'panela'], correta: 'tapete' },
      { tipo: 'literal', pergunta: s('Quem pulou no bolo?'), opcoes: ['gato', 'galo', 'pato'], correta: 'gato' },
      { tipo: 'inferencia', pergunta: s('Como a tia ficou?'), opcoes: ['rosto-bravo', 'rosto-feliz', 'rosto-triste'], correta: 'rosto-bravo' }
    ]
  }
];

export const TEXTO_POR_ID: Record<string, TextoDecodificavel> = Object.fromEntries(TEXTOS_DECODIFICAVEIS.map((x) => [x.id, x]));

/** O texto inteiro, numa linha (para a voz que lê junto e para o verificador). */
export const textoCorrido = (x: TextoDecodificavel) => x.linhas.map((l) => l.texto).join(' ');

export const FALAS_TEXTO = {
  abre: s('Este texto é para você ler sozinho! Toque numa palavra para ouvir os sons dela.'),
  jaLeu: s('Agora responda. Pode olhar o texto.'),
  pista: s('Leia de novo, devagar, da esquerda para a direita.'),
  coro: s('Agora vamos ler juntos, em voz alta.'),
  coroFim: s('Que leitura bonita!')
} as const;
