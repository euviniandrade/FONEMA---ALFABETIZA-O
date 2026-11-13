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
    { quem: 'sofia', texto: '{Você está pronto|Você está pronta|Tudo pronto} para a primeira missão? É sobre o seu nome!' }
  ] as Fala[],
  voltou: [
    { quem: 'sofia', texto: 'Oi, [NOME]! {Que bom que você voltou, curioso|Que bom que você voltou, curiosa|Que bom te ver de novo}!' }
  ] as Fala[],
  avatar: { quem: 'tales', texto: 'Escolhe do seu jeito, [NOME]!' } as Fala,
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
    moedinhas: 'As moedinhas vão para o cofrinho-tatu!',
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
    primeiroDia: 'Oi! {O|A|} [NOME] começou hoje no FONEMA. {Ele|Ela|[NOME]} descobriu que o nome {dele|dela|próprio} começa com o som /[SOM]/ (não o nome da letra). Missão de 5 min: procurem juntos 3 coisas da casa que começam com /[SOM]/.',
    marco: '{O|A|} [NOME] conquistou [CONQUISTA]! [DETALHE]',
    semana: 'Resumo da semana de [NOME]: [RESUMO]'
  }
};
