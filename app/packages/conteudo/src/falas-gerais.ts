/**
 * Falas gerais da dupla (chegada, erro acolhido, ritual de fim, despedida, família).
 * [NOME] = nome da criança. {masc|fem|neutro} = concordância (D013): o neutro muda a FORMA da frase,
 * nunca usa "(a)". Prefira frases naturalmente neutras (elogio ao processo).
 */
import type { Fala } from './tipos.ts';

export const FALAS = {
  chegada: [
    { quem: 'sofia', texto: 'Oi, [NOME]! Eu sou a Sofia.' },
    { quem: 'tales', texto: 'E eu sou o Tales! {Seja bem-vindo|Seja bem-vinda|Que bom ter você} na Vila das Letras, [NOME]!' },
    { quem: 'sofia', texto: '{Você está pronto|Você está pronta|Tudo pronto} para conhecer as letras?' }
  ] as Fala[],
  /**
   * Fila do dono nº 27 (1): saudação curta, só na 1ª entrada do dia na vila (web/src/servicos/saudacao.ts). Saiu o
   * "Que bom que você voltou, curioso/curiosa" que tocava a cada volta à vila ("fica cansativo"). Voltar de uma tela não fala nada.
   */
  saudacao: { quem: 'sofia', texto: 'Oi, [NOME]!' } as Fala,
  /**
   * Fila nº 27 (2): falas com o nome NO FIM que se repetem dentro de uma atividade (rodada a rodada). Depois que o nome já foi
   * dito, a voz toca a variante gravada SEM o nome (semNome, @fonema/motor): "Agora é a sua vez!" em vez de
   * "Agora é a sua vez," com a voz pendurada. As outras falas com nome tocam os mesmos trechos sem o clipe do nome.
   * O extrator (scripts/extrair-falas.ts) grava a forma sem nome destas; a lista de pendentes está em app/docs/falas-pendentes.md.
   */
  comVarianteSemNome: [
    { quem: 'sofia', texto: 'Agora é a sua vez, [NOME]!' },
    { quem: 'sofia', texto: 'Vamos fazer juntos, [NOME]?' },
    { quem: 'sofia', texto: 'Você conseguiu, [NOME]!' },
    { quem: 'sofia', texto: 'Que letra faz este som, [NOME]?' },
    { quem: 'sofia', texto: 'Qual rima, [NOME]?' },
    { quem: 'sofia', texto: 'Junta comigo, [NOME]!' },
    { quem: 'sofia', texto: 'Uma palma para cada pedacinho, [NOME]!' },
    { quem: 'sofia', texto: 'Olha que lindo! Você ganhou uma conquista nova, [NOME]!' },
    { quem: 'sofia', texto: 'É a vovó ou o vovô, [NOME]?' },
    { quem: 'sofia', texto: 'O que o Bolota disse, [NOME]?' },
    { quem: 'sofia', texto: 'Olha a minha boca antes de responder, [NOME].' },
    { quem: 'sofia', texto: 'Lê a pedra e toca a figura, [NOME].' },
    { quem: 'tales', texto: 'Agora é a sua vez, [NOME]!' },
    { quem: 'tales', texto: 'Letra por letra! Agora é a sua vez, [NOME]!' },
    { quem: 'tales', texto: 'Qual começa com o som, [NOME]?' },
    { quem: 'tales', texto: 'Rima ou não rima, [NOME]?' },
    { quem: 'tales', texto: 'Fala o som desta letra, [NOME]!' },
    { quem: 'tales', texto: 'Olha só o que chegou para você, [NOME]!' },
    { quem: 'tales', texto: 'Escolhe do seu jeito, [NOME]!' },
    { quem: 'tales', texto: 'O eco falou! Qual letra, [NOME]?' }
  ] as Fala[],
  avatar: { quem: 'tales', texto: 'Vamos montar o seu boneco, [NOME]! Qual é a cor da sua pele?' } as Fala,
  avatarSexo: { quem: 'sofia', texto: 'O boneco é menino ou menina?' } as Fala,
  avatarLojinha: { quem: 'tales', texto: 'Olha a Lojinha! A cada letra abrem coisas novas para o seu boneco.' } as Fala,
  avatarPronto: { quem: 'sofia', texto: 'Ficou a sua cara! {Você está pronto|Você está pronta|Tudo pronto pra começar}?' } as Fala,
  suaVez: { quem: 'sofia', texto: 'Agora é a sua vez, [NOME]!' } as Fala,
  acertos: [
    'Isso, [NOME]! Você escutou com atenção.',
    'Muito bem! Você foi devagar e deu certo.',
    'Você conseguiu, [NOME]!',
    'Isso mesmo! Olhou a boca e acertou.'
  ],
  /** Escada de ajuda (N3): dica → modelo → fazer junto → fechar com êxito. */
  erro1: 'Quase, [NOME]! Escuta comigo de novo.',
  erro2: 'Olha, eu te mostro. É esta aqui!',
  erroJunto: 'Vamos fazer juntos, [NOME]?',
  naoOuvi: 'Não ouvi bem. Fala comigo de novo? Ou toca em "Eu falei!".',
  euFalei: 'Eu ouvi você, [NOME]! Agora escuta como eu falo:',
  ritual: {
    recap: 'Hoje você trabalhou com muita atenção, [NOME].',
    moedinhas: 'As moedinhas vão para o porquinho!',
    amanha: 'Amanhã a gente lembra!',
    tchau: 'Tchau, [NOME]! A tela vai descansar e você também.'
  },
  conquista: 'Olha que lindo! Você ganhou uma conquista nova, [NOME]!',
  surpresa: 'Olha só o que chegou para você, [NOME]!',
  professorAprendeu: 'Parabéns, [NOME]! O professor viu que você aprendeu!',
  professorTreinar: 'Vamos treinar mais um pouquinho juntos, [NOME]. Treinar é assim mesmo!',
  professorExplicou: 'Parabéns, [NOME]! Você explicou certinho!',
  lojinhaFalta: 'Faltam [FALTAM] moedinhas para: [ITEM]. Quer juntar?',
  /** Mensagens para a família (sem envio real no MVP). */
  familia: {
    primeiroDia: 'Oi! {O|A|} [NOME] começou hoje no FONEMA, pela Trilha do Alfabeto. {Ele|Ela|[NOME]} descobriu que cada letra tem um som: hoje foi a letra [LETRA], de [PALAVRA]. Missão de 5 min: [MISSAO]',
    marco: '{O|A|} [NOME] conquistou [CONQUISTA]! [DETALHE]',
    semana: 'Resumo da semana de [NOME]: [RESUMO]'
  }
};
