/**
 * D032 itens 1 e 2: o CAMINHO DO QUE A CRIANÇA VAI APRENDER, em etapas visíveis (tutorial "A grande aventura" e painel guia).
 *
 * As etapas são um AGRUPAMENTO da jornada que já existe (`FASES`, D031) para a criança enxergar o caminho; não mudam a ordem
 * nem o que libera cada fase. A ordem segue docs/pedagogia/01 (sons e letras → juntar sons e ler palavras → frases → textos;
 * depois os outros valores das vogais e, ainda não publicados, os blocos 4 a 8: nasais, R e H, dígrafos, encontros).
 * Os cortes exatos entre as etapas são **decisão do projeto [DP]**:
 *  - "Letras e sons" vai até TF-05 (as cinco vogais, só som e letra: 01 §4, bloco 1);
 *  - "Ler palavras" começa em TF-06, a primeira leitura (ai, ei, oi, ui);
 *  - "Frases" começa em TF-10, a lição com a primeira frase ("A lula viu a lua.");
 *  - "Historinhas" começa em TF-R2, quando abre o 2º texto para ler sozinho ("A ema suja", biblioteca/textos.ts);
 *  - "Outros sons das vogais" = é/ê e ó/ô (R1), a revisão do Vale do M-L-F (R2a) e Meu nome (R0);
 *  - as etapas `futura` ainda não têm fases publicadas: aparecem trancadas, com cadeado.
 * Figuras: só artes já existentes em web/public/assets (nenhuma é resposta de atividade).
 */
import { FASES } from './regioes.ts';
import type { Fala } from './tipos.ts';

export interface EtapaCaminho {
  id: string;
  /** Rótulo curto (a criança não precisa ler: a Sofia fala `fala`). */
  titulo: string;
  /** Para o adulto: o que entra na etapa. */
  sub: string;
  /** Figura em assets/ (sem extensão de pasta); `abc` = a peça "Aa" desenhada pela tela. */
  figura: string;
  /** Última fase da jornada desta etapa (ausente nas etapas futuras). */
  ate?: string;
  /** Ainda sem fases publicadas: aparece com cadeado. */
  futura?: boolean;
  /** Fala da Sofia/Tales sobre a etapa (tutorial e botão "Você está aqui"). */
  fala?: Fala;
}

/** Falas novas do tutorial "A grande aventura" (D032). Sem {masc|fem|neutro}: uma forma só, para gastar pouca voz. */
export const FALAS_TUTORIAL = {
  mundo1: { quem: 'sofia', texto: '[NOME], vem comigo conhecer o nosso mundo!' },
  mundo2: { quem: 'tales', texto: 'Olha quantas ilhas! Cada uma guarda um segredo das letras.' },
  mundo3: { quem: 'sofia', texto: 'Elas vão abrindo, uma por uma, enquanto você aprende.' },
  caminho: { quem: 'sofia', texto: 'Este é o caminho que você vai fazer.' },
  letras: { quem: 'sofia', texto: 'Primeiro, você conhece as letras e os sons.' },
  palavras: { quem: 'sofia', texto: 'Depois, junta os sons e lê palavras.' },
  frases: { quem: 'sofia', texto: 'Aí vêm as frases.' },
  historias: { quem: 'sofia', texto: 'E as historinhas!' },
  vogais: { quem: 'sofia', texto: 'Depois, os outros sons das vogais.' },
  trancadas: { quem: 'tales', texto: 'E lá na frente tem mais lugares trancados, esperando por você!' },
  aqui: { quem: 'sofia', texto: 'A estrela mostra onde você está.' },
  tocar: { quem: 'sofia', texto: 'Para brincar, é só tocar. Toque na estrela!' },
  arrastar: { quem: 'sofia', texto: 'Agora arraste a moedinha até o porquinho.' },
  ouvir: { quem: 'sofia', texto: 'Quer ouvir de novo? Toque no botão do som.' },
  voltar: { quem: 'sofia', texto: 'E a setinha leva você de volta.' },
  moedas: { quem: 'tales', texto: 'Cada desafio feito vale moedinhas para o seu porquinho!' },
  lojinha: { quem: 'tales', texto: 'Na Lojinha, você troca as moedinhas por roupas para o seu boneco. E, mais para a frente, até barco e carro!' },
  selos: { quem: 'sofia', texto: 'Você também ganha selos para o seu álbum e sobe de nível.' },
  brincar: { quem: 'tales', texto: 'Quer brincar com os sons? Toque em Brincar. Lá tem um monte de jogos!' },
  barra1: { quem: 'sofia', texto: 'Cada missão tem uma barrinha. A cada desafio, ela enche um pouco.' },
  barra2: { quem: 'sofia', texto: 'Quando ela ficar cheia, a missão está feita!' },
  primeira: { quem: 'tales', texto: 'Tudo pronto, [NOME]? Vamos para a primeira missão!' },
  continuar: { quem: 'tales', texto: 'Agora é com você, [NOME]! Vamos continuar a missão?' }
} satisfies Record<string, Fala>;

const ultimaDe = (regiao: string) => [...FASES].reverse().find((f) => f.regiao === regiao || (regiao === 'AL-TF' && (f.regiao === 'AL' || f.regiao === 'TF')))!.id;

export const ETAPAS_DO_CAMINHO: EtapaCaminho[] = [
  { id: 'letras', titulo: 'Letras e sons', sub: 'as vogais: o som e a letra', figura: 'abc', ate: 'TF-05', fala: FALAS_TUTORIAL.letras },
  { id: 'palavras', titulo: 'Ler palavras', sub: 'juntar os sons: ai, oi, mia, uva', figura: 'figuras/uva.webp', ate: 'TF-09', fala: FALAS_TUTORIAL.palavras },
  { id: 'frases', titulo: 'Frases', sub: 'a primeira frase e os sons que esticam', figura: 'figuras/fala.webp', ate: 'TF-15', fala: FALAS_TUTORIAL.frases },
  { id: 'historias', titulo: 'Historinhas', sub: 'textos para ler sozinho e os sons que estouram', figura: 'historias/bolota-chuva/capa.webp', ate: ultimaDe('AL-TF'), fala: FALAS_TUTORIAL.historias },
  { id: 'vogais', titulo: 'Outros sons das vogais', sub: 'é e ó; revisão das palavras; o meu nome', figura: 'figuras/pe.webp', ate: FASES[FASES.length - 1].id, fala: FALAS_TUTORIAL.vogais },
  { id: 'nasais', titulo: 'Sons pelo nariz', sub: 'ã, an, em, im, om, um, ão (em breve)', figura: 'figuras/pao.webp', futura: true },
  { id: 'r-h', titulo: 'R e H', sub: 'r forte e fraco, rr, h (em breve)', figura: 'figuras/rato.webp', futura: true },
  { id: 'duplas', titulo: 'Letras em dupla', sub: 'ch, lh, nh, qu, gu e as regras do c, g, s (em breve)', figura: 'figuras/chave.webp', futura: true },
  { id: 'encontros', titulo: 'Encontros', sub: 'pr, tr, bl, fl… (em breve)', figura: 'figuras/trofeu-taca.webp', futura: true }
];
