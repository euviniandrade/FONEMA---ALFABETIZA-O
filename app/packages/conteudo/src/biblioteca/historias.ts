/**
 * HORA DA HISTÓRIA (D030 §3, camada G de docs/pedagogia/00): histórias curtas OUVIDAS, narradas pela dupla, com figuras,
 * para a criança que ainda não lê. O texto é real e rico (não precisa ser decodificável: a criança só ouve; 05 §1, §3).
 *
 * Fundamento:
 *  - perguntas antes (previsão), durante e depois, diretas e de dedução: VT-PE p. 41, 83; ABC p. 306, 397–398; SOA p. 232–246;
 *  - três palavras de vocabulário por história, com explicação de criança e uso em frase, sem definição de dicionário:
 *    VT-PE p. 48, 92; ABC p. 230–233; SOA p. 237–240;
 *  - compreensão ouvida e vocabulário correm ao lado da fônica desde o começo: SOA p. 27; ABC p. 286–289.
 * As histórias, os personagens Fia e Beto e as falas são do projeto (07 §3: nada copiado dos materiais).
 * Perguntas respondidas por figura, 3 opções plausíveis; a resposta não está na ilustração da pergunta (04 N12) [DP].
 * A figura certa é a que APARECE na história (a bola do Bolota é vermelha: `bola-vermelha`), e a pergunta que cita a capa
 * mostra a capa junto (`mostraCapa`); revisão de qualidade 18/11, itens 4 e 5 [DP].
 */
import type { Fala } from '../tipos.ts';
import type { Historia } from './tipos.ts';

const s = (texto: string): Fala => ({ quem: 'sofia', texto });
const t = (texto: string): Fala => ({ quem: 'tales', texto });

export const HISTORIAS: Historia[] = [
  {
    id: 'bolota-chuva',
    titulo: 'O Bolota e a chuva',
    capa: 'historias/bolota-chuva/capa',
    abre: s('Hora da história! Esta se chama: O Bolota e a chuva.'),
    paginas: [
      { imagem: 'historias/bolota-chuva/1', texto: s('Era uma manhã de sol. O Bolota, o tatu, saiu de casa com a sua bola vermelha.') },
      { imagem: 'historias/bolota-chuva/2', texto: s('De repente, o céu ficou escuro e começou uma chuva forte. Plic, plic, ploc!') },
      { imagem: 'historias/bolota-chuva/3', texto: s('O Bolota correu, correu… e viu uma folha enorme, maior do que ele!') },
      { imagem: 'historias/bolota-chuva/4', texto: s('Ele se escondeu embaixo da folha. A folha virou um abrigo, igual a um guarda-chuva.') },
      { imagem: 'historias/bolota-chuva/5', texto: s('Quando a chuva passou, o sol voltou. O Bolota agradeceu à folha e foi pular nas poças.') }
    ],
    perguntas: [
      { momento: 'antes', tipo: 'previsao', pergunta: s('Olhe a capa. Que tempo você acha que vai fazer nesta história?'), opcoes: ['chuva', 'sol', 'estrela'], mostraCapa: true },
      { momento: 'durante', tipo: 'literal', depoisDaPagina: 1, pergunta: s('O que o Bolota levou quando saiu de casa?'), opcoes: ['bola-vermelha', 'mala', 'sacola'], correta: 'bola-vermelha', pista: 0 },
      { momento: 'depois', tipo: 'literal', pergunta: s('Onde o Bolota se escondeu?'), opcoes: ['folha', 'casa', 'mala'], correta: 'folha', pista: 3 },
      { momento: 'depois', tipo: 'inferencia', pergunta: s('Por que o Bolota se escondeu?'), opcoes: ['chuva', 'sol', 'bola-vermelha'], correta: 'chuva', pista: 2 }
    ],
    vocabulario: [
      {
        palavra: 'enorme', figura: 'elefante',
        explica: s('Enorme é muito, muito grande.'), frase: s('O elefante é enorme!'),
        pergunta: s('Qual destes é enorme?'), opcoes: ['elefante', 'formiga', 'abelha'], correta: 'elefante'
      },
      {
        palavra: 'abrigo', figura: 'casa',
        explica: s('Abrigo é um lugar que protege a gente da chuva, do frio ou do sol forte.'), frase: s('Quando chove, a minha casa é o meu abrigo.'),
        pergunta: s('Qual destes pode ser um abrigo na chuva?'), opcoes: ['casa', 'sorvete', 'bola'], correta: 'casa'
      },
      {
        palavra: 'poça', figura: 'poca',
        explica: s('Poça é a água que fica parada no chão depois da chuva.'), frase: s('Depois da chuva, eu pulei na poça e me molhei todo!'),
        pergunta: s('Qual destes é uma poça?'), opcoes: ['poca', 'copo-agua', 'nuvem'], correta: 'poca'
      }
    ],
    fecha: s('Fim! Que folha amiga, não é?')
  },
  {
    id: 'piquenique-fia',
    titulo: 'O piquenique da Fia',
    capa: 'historias/piquenique-fia/capa',
    abre: s('Hora da história! Esta se chama: O piquenique da Fia.'),
    paginas: [
      { imagem: 'historias/piquenique-fia/1', texto: s('A formiga Fia preparou um piquenique: uma uva, um pedacinho de pão e uma gota de suco.') },
      { imagem: 'historias/piquenique-fia/2', texto: s('Ela pôs tudo numa folha e subiu o morro. Ufa! A folha estava pesada.') },
      { imagem: 'historias/piquenique-fia/3', texto: s('No caminho, ela encontrou o besouro Beto. Ele estava sentado, com a barriga roncando de fome.') },
      { imagem: 'historias/piquenique-fia/4', texto: s('A Fia pensou um pouquinho e disse: Vem, Beto! Vamos dividir!') },
      { imagem: 'historias/piquenique-fia/5', texto: s('Os dois comeram juntos, embaixo de uma flor. E o piquenique ficou ainda mais gostoso.') }
    ],
    perguntas: [
      { momento: 'antes', tipo: 'previsao', pergunta: s('Olhe a capa. O que você acha que a formiga vai fazer?'), opcoes: ['piquenique', 'banho', 'bola'], mostraCapa: true },
      { momento: 'durante', tipo: 'literal', depoisDaPagina: 0, pergunta: s('Que fruta a Fia levou no piquenique?'), opcoes: ['uva', 'abacaxi', 'banana'], correta: 'uva', pista: 0 },
      { momento: 'depois', tipo: 'literal', pergunta: s('Quem a Fia encontrou no caminho?'), opcoes: ['besouro', 'abelha', 'sapo'], correta: 'besouro', pista: 2 },
      { momento: 'depois', tipo: 'inferencia', pergunta: s('Como o Beto ficou quando a Fia dividiu o lanche?'), opcoes: ['rosto-feliz', 'rosto-triste', 'rosto-bravo'], correta: 'rosto-feliz', pista: 3 }
    ],
    vocabulario: [
      {
        palavra: 'piquenique', figura: 'piquenique',
        explica: s('Piquenique é quando a gente leva comida para comer ao ar livre, sentado numa toalha no chão.'), frase: s('No domingo, fizemos um piquenique no parque.'),
        pergunta: s('Qual figura mostra um piquenique?'), opcoes: ['piquenique', 'banho', 'navio'], correta: 'piquenique'
      },
      {
        palavra: 'pesado', figura: 'hipopotamo',
        explica: s('Pesado é difícil de levantar e de carregar.'), frase: s('A mala cheia de roupa ficou pesada.'),
        pergunta: s('Qual destes é o mais pesado?'), opcoes: ['hipopotamo', 'folha', 'bolhas-sabao'], correta: 'hipopotamo'
      },
      {
        palavra: 'dividir', figura: 'dividir',
        explica: s('Dividir é dar uma parte do que é seu para outra pessoa.'), frase: s('Eu dividi o meu pão com o meu amigo.'),
        pergunta: s('Em qual figura alguém está dividindo?'), opcoes: ['dividir', 'pao', 'sacola'], correta: 'dividir'
      }
    ],
    fecha: s('Fim! Dividir deixou o piquenique ainda mais gostoso.')
  }
];

export const HISTORIA_POR_ID: Record<string, Historia> = Object.fromEntries(HISTORIAS.map((h) => [h.id, h]));

/** Moldura das histórias e do vocabulário (gravadas uma vez). Tales apresenta a palavra nova. */
export const FALAS_HISTORIA = {
  ouvir: s('Escute a história. Depois eu faço umas perguntas.'),
  previsao: s('Vamos descobrir!'),
  pista: s('Vamos lembrar dessa parte da história.'),
  depois: s('Agora, umas perguntas sobre a história.'),
  vocab: t('Agora, três palavras novas da história!'),
  palavraNova: t('Palavra nova:'),
  vocabFim: t('Use essas palavras hoje, conversando com alguém!'),
  muitoBem: s('Isso mesmo!')
} as const;
