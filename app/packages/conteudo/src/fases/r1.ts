/**
 * R1 · Ilha das Vogais (jogo-completo/02, semanas 3–6). Som ≠ nome da letra.
 */
import type { Fase } from '../tipos.ts';
import { bolota, itemFig, itemLetra, pescadora, sofia, tales } from '../construtores.ts';

export const FASES_R1: Fase[] = [
  {
    id: 'R1-F01', regiao: 'R1', numero: 1, titulo: 'A da boca bem aberta',
    objetivo: 'Ligar o som /a/ à letra A', sessoesPrevistas: '2 sessões',
    habilidades: ['vogal-a'], criterio: { tipo: 'dominio', habilidades: ['vogal-a'] },
    acolhida: sofia('Oi, [NOME]! O barco do Bolota chegou na Ilha das Vogais!'),
    cenas: [
      {
        id: 'R1-F01-C2', tipo: 'C2', titulo: 'Espelho do Som: /a/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'vogal-a', fonema: 'a', letra: 'A', ancora: { texto: 'abelha', figura: '🐝' }, enunciado: sofia('/aaa/. Boca bem aberta, como um bocejo. Sua vez, [NOME]!'), comemora: sofia('Isso! Você abriu bem a boca: aaa!') }
      },
      {
        id: 'R1-F01-C3', tipo: 'C3', titulo: 'O eco da ilha', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogal-a', enunciado: tales('O eco falou! Qual letra, [NOME]?'), itens: [itemLetra('aaaa', 'A', 'O'), itemLetra('aaaa', 'A', 'U'), itemLetra('aaaa', 'A', 'O', 'U'), itemLetra('aaaa', 'A', 'I')], comemora: tales('A letra A faz /aaa/!') }
      },
      {
        id: 'R1-F01-C4', tipo: 'C4', titulo: 'Conchas que abrem', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'falar', habilidade: 'vogal-a', enunciado: sofia('Fala o som desta letra, [NOME]. A concha abre!'), itens: [{ texto: 'A', falar: 'aaaa', figura: '🐚' }, { texto: 'A', falar: 'aaaa', figura: '🐚' }], comemora: sofia('A concha abriu!') }
      },
      {
        id: 'R1-F01-C6', tipo: 'C6', titulo: 'Corrida na areia', cenario: 'ilha', marcador: 'esporte-corrida',
        atividade: { tipo: 'pausa', habilidade: 'vogal-a', acao: 'Pula', enunciado: tales('Pula no /a/, [NOME]!'), sequencia: [{ falar: 'abelha', alvo: true }, { falar: 'uva', alvo: false }, { falar: 'avião', alvo: true }, { falar: 'ovo', alvo: false }, { falar: 'abacaxi', alvo: true }] }
      }
    ],
    gancho: tales('Tem uma vovó e um vovô na ilha… e os dois têm O no nome!'),
    fechamento: 'O cais da ilha ganhou a primeira concha.',
    emCasa: '"Boca de bocejo": falar /aaa/ no espelho do banheiro com o adulto.',
    conquistas: ['S-SOM-A', 'S-R1-01', 'S-R1-02', 'S-R1-10'],
    demonstracao: { descricao: 'Falar /aaa/ e tocar a letra A', habilidade: 'vogal-a' }
  },
  {
    id: 'R1-F02', regiao: 'R1', numero: 2, titulo: 'O de boca redonda: ó e ô',
    objetivo: 'Ligar os sons /ó/ e /ô/ à letra O', sessoesPrevistas: '2–3 sessões',
    habilidades: ['vogal-o', 'o-aberto-fechado'], criterio: { tipo: 'dominio', habilidades: ['vogal-o'] },
    acolhida: sofia('Oi, [NOME]! Hoje a pescadora vai apresentar a vovó e o vovô dela.'),
    cenas: [
      {
        id: 'R1-F02-C2', tipo: 'C2', titulo: 'Espelho do Som: ó e ô', cenario: 'licao', contaDominio: true,
        assiste: { imagem: 'serie-licao', roteiro: [sofia('VOVÓ: a boca abre mais. Óóó.'), tales('VOVÔ: a boca fecha mais, redondinha. Ôôô.'), sofia('Os dois são O. Sua vez, [NOME]!')] },
        atividade: { tipo: 'espelho', habilidade: 'vogal-o', fonema: 'O', letra: 'O', ancora: { texto: 'vovó', figura: '👵' }, enunciado: sofia('Bolinha aberta: óóó. Sua vez, [NOME]!'), comemora: sofia('Boca redonda, muito bem!') }
      },
      {
        id: 'R1-F02-C3', tipo: 'C3', titulo: 'Vovó ou vovô?', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'o-aberto-fechado', enunciado: pescadora('É a vovó ou o vovô, [NOME]?'), itens: [itemFig('vovó', 'vovó', 'vovô'), itemFig('vovô', 'vovô', 'vovó'), itemFig('vovó', 'vovó', 'vovô'), itemFig('vovô', 'vovô', 'vovó')], comemora: pescadora('Você ouviu a diferença!') }
      },
      {
        id: 'R1-F02-C4', tipo: 'C4', titulo: 'Bolhas para o peixe-boi', cenario: 'mar', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogal-o', enunciado: tales('O peixe-boi só come bolha de O. Qual letra faz /ôôô/, [NOME]?'), itens: [itemLetra('ôôôô', 'O', 'A'), itemLetra('óóóó', 'O', 'U'), itemLetra('ôôôô', 'O', 'A', 'U'), itemLetra('óóóó', 'O', 'A')], comemora: tales('O peixe-boi adorou!') }
      },
      {
        id: 'R1-F02-C8', tipo: 'C8', titulo: 'O Bolota trocou A e O', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'ensinar', habilidade: 'vogal-o', enunciado: bolota('Ops! Eu acho que esse som é do A… Me ensina?'), itens: [itemLetra('ôôôô', 'O', 'A'), itemLetra('aaaa', 'A', 'O'), itemLetra('óóóó', 'O', 'A')], comemora: bolota('Você me ensinou direitinho!') }
      }
    ],
    gancho: sofia('Amanhã a gente descobre o E, que também tem dois jeitos!'),
    fechamento: 'O peixe-boi ficou amigo da turma.',
    emCasa: 'Brincar de "boca redonda" e "boca aberta" dizendo vovó e vovô.',
    conquistas: ['S-SOM-O-O-O', 'S-R1-04', 'S-R0-12'],
    demonstracao: { descricao: 'Dizer "vovó ou vovô?" e tocar o O', habilidade: 'vogal-o' }
  },
  {
    id: 'R1-F03', regiao: 'R1', numero: 3, titulo: 'E: é e ê',
    objetivo: 'Ligar os sons /é/ e /ê/ à letra E', sessoesPrevistas: '2–3 sessões',
    habilidades: ['vogal-e'], criterio: { tipo: 'dominio', habilidades: ['vogal-e'] },
    acolhida: tales('Oi, [NOME]! Repara no meu sorriso hoje.'),
    cenas: [
      {
        id: 'R1-F03-C2', tipo: 'C2', titulo: 'Espelho do Som: é e ê', cenario: 'licao', contaDominio: true,
        assiste: { imagem: 'serie-licao', roteiro: [tales('PÉ: o sorriso abre. Ééé.'), sofia('VOCÊ: o sorriso fecha um pouquinho. Êêê.'), tales('É ou ê? Repara no meu sorriso. Sua vez, [NOME]!')] },
        atividade: { tipo: 'espelho', habilidade: 'vogal-e', fonema: 'E', letra: 'E', ancora: { texto: 'pé', figura: '🦶' }, enunciado: tales('Sorriso aberto: ééé. Sua vez, [NOME]!'), comemora: tales('Isso! O sorriso abriu!') }
      },
      {
        id: 'R1-F03-C3', tipo: 'C3', titulo: 'Que letra faz /é/?', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogal-e', enunciado: sofia('Que letra faz este som, [NOME]?'), itens: [itemLetra('éééé', 'E', 'A'), itemLetra('êêêê', 'E', 'O'), itemLetra('éééé', 'E', 'A', 'O'), itemLetra('êêêê', 'E', 'U')], comemora: sofia('A letra E!') }
      },
      {
        id: 'R1-F03-C4', tipo: 'C4', titulo: 'A rede do Tales', cenario: 'mar', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'cacar', habilidade: 'vogal-e', enunciado: tales('E se tiver um /e/ escondido? Puxa a rede, [NOME]!'), itens: [itemFig('qual começa com eee?', 'elefante', 'uva', 'ovo'), itemFig('qual começa com eee?', 'estrela', 'abelha', 'sol'), itemFig('qual começa com ééé?', 'escada', 'ilha', 'urso')], comemora: tales('Pescou um E!') }
      },
      {
        id: 'R1-F03-C8', tipo: 'C8', titulo: 'Misturado: A, O, E', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: sofia('Agora misturado. Letra por letra, [NOME].'), itens: [itemLetra('aaaa', 'A', 'O', 'E'), itemLetra('éééé', 'E', 'A', 'O'), itemLetra('ôôôô', 'O', 'E', 'A'), itemLetra('êêêê', 'E', 'O', 'A')], comemora: sofia('Você não se confundiu!') }
      }
    ],
    gancho: sofia('Amanhã é a vez do sorriso mais largo de todos!'),
    fechamento: 'A rede do Tales ficou cheia de letras E.',
    emCasa: 'Achar o "é" de PÉ e o "ê" de VOCÊ ao conversar.',
    conquistas: ['S-SOM-E-E-E', 'S-R1-03', 'S-R1-06'],
    demonstracao: { descricao: 'Falar /é/ de PÉ e tocar a letra E', habilidade: 'vogal-e' }
  },
  {
    id: 'R1-F04', regiao: 'R1', numero: 4, titulo: 'I do sorriso',
    objetivo: 'Ligar o som /i/ à letra I e traçar o I', sessoesPrevistas: '2 sessões',
    habilidades: ['vogal-i'], criterio: { tipo: 'dominio', habilidades: ['vogal-i'] },
    acolhida: sofia('Oi, [NOME]! Hoje o sorriso é bem grande.'),
    cenas: [
      {
        id: 'R1-F04-C2', tipo: 'C2', titulo: 'Espelho do Som: /i/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'vogal-i', fonema: 'i', letra: 'I', ancora: { texto: 'ilha', figura: '🏝️' }, enunciado: sofia('/iii/, um sorriso grande. Sua vez, [NOME]!'), comemora: sofia('Que sorriso! iii!') }
      },
      {
        id: 'R1-F04-C4', tipo: 'C4', titulo: 'I na areia', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'tracar', habilidade: 'vogal-i', letras: ['I', 'A', 'O'], enunciado: tales('Desenha a letra na areia com o dedo e fala o som, [NOME]!'), comemora: tales('Ficou lindo na areia!') }
      },
      {
        id: 'R1-F04-C5', tipo: 'C5', titulo: 'As placas da praia', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogal-i', enunciado: sofia('O Zum-Zum embaralhou a placa. Escuta bem: qual som começa a palavra, [NOME]?'), itens: [itemLetra('ilha', 'I', 'O', 'U'), itemLetra('ioiô', 'I', 'A'), itemLetra('iglu', 'I', 'E', 'U')], comemora: sofia('A placa voltou para o lugar!') }
      }
    ],
    gancho: tales('Amanhã a tartaruga precisa da nossa ajuda!'),
    fechamento: 'A praia ficou cheia de letras I na areia.',
    emCasa: 'Missão "praia limpa" de faz de conta: guardar os brinquedos que começam com /i/ e /a/.',
    conquistas: ['S-SOM-I', 'S-R1-05'],
    demonstracao: { descricao: 'Traçar o I e falar /iii/', habilidade: 'vogal-i' }
  },
  {
    id: 'R1-F05', regiao: 'R1', numero: 5, titulo: 'U do biquinho',
    objetivo: 'Ligar o som /u/ à letra U e diferenciar U de O', sessoesPrevistas: '2 sessões',
    habilidades: ['vogal-u'], criterio: { tipo: 'dominio', habilidades: ['vogal-u'] },
    acolhida: tales('Oi, [NOME]! Faz um biquinho de assobio comigo?'),
    cenas: [
      {
        id: 'R1-F05-C2', tipo: 'C2', titulo: 'Espelho do Som: /u/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'vogal-u', fonema: 'u', letra: 'U', ancora: { texto: 'uva', figura: '🍇' }, enunciado: tales('/uuu/, biquinho de assobio. Sua vez, [NOME]!'), comemora: tales('Biquinho perfeito!') }
      },
      {
        id: 'R1-F05-C4', tipo: 'C4', titulo: 'As boias da tartaruga', cenario: 'mar', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogal-u', enunciado: sofia('U ou O, [NOME]? Olha minha boca.'), itens: [itemLetra('uuuu', 'U', 'O'), itemLetra('ôôôô', 'O', 'U'), itemLetra('uuuu', 'U', 'O', 'A'), itemLetra('uuuu', 'U', 'I')], comemora: sofia('A tartaruga passou pelas boias!') }
      },
      {
        id: 'R1-F05-C6', tipo: 'C6', titulo: 'Praia limpa', cenario: 'ilha', marcador: 'ambiental-praia',
        atividade: { tipo: 'escolher', estilo: 'cacar', habilidade: 'vogal-u', enunciado: tales('Tira da areia o que não é da praia, para a tartaruga voltar!'), itens: [itemFig('o que não é da praia?', 'copo plástico', 'concha', 'caranguejo'), itemFig('o que não é da praia?', 'sacola', 'concha', 'peixe'), itemFig('o que não é da praia?', 'garrafa', 'caranguejo', 'concha')], comemora: tales('A tartaruga volta! Valeu, [NOME]!') }
      }
    ],
    gancho: sofia('Amanhã a gente aprende a diferença entre o SOM e o NOME das letras.'),
    fechamento: 'A tartaruga voltou para a praia limpa.',
    emCasa: 'Jogo do "biquinho e sorriso" (U e I) no espelho.',
    conquistas: ['S-SOM-U', 'S-R1-12'],
    demonstracao: { descricao: 'Falar /uuu/ e tocar o U', habilidade: 'vogal-u' }
  },
  {
    id: 'R1-F06', regiao: 'R1', numero: 6, titulo: 'Som e nome das vogais',
    objetivo: 'Reconhecer as 5 vogais misturadas', sessoesPrevistas: '2 sessões',
    habilidades: ['vogais'], criterio: { tipo: 'dominio', habilidades: ['vogais'] },
    acolhida: sofia('Oi, [NOME]! O farol precisa das cinco vogais para acender.'),
    cenas: [
      {
        id: 'R1-F06-C2', tipo: 'C2', titulo: 'Botão do som e botão do nome', cenario: 'licao',
        assiste: { imagem: 'serie-eco', roteiro: [sofia('Toda letra tem um NOME e um SOM.'), tales('Nas vogais eles são parecidos: o nome é "a", o som é /aaa/.'), sofia('Este botão diz o nome. Este diz o som. Agora é a sua vez, [NOME]!')] },
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: sofia('Qual letra faz este som, [NOME]?'), itens: [itemLetra('iiii', 'I', 'E')] }
      },
      {
        id: 'R1-F06-C4', tipo: 'C4', titulo: 'Farol das Vogais', cenario: 'farol', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: tales('O farol precisa da sua vogal, [NOME]!'), itens: [itemLetra('aaaa', 'A', 'E', 'O'), itemLetra('uuuu', 'U', 'O', 'I'), itemLetra('iiii', 'I', 'E', 'A'), itemLetra('éééé', 'E', 'I', 'A'), itemLetra('óóóó', 'O', 'U', 'A')], comemora: tales('Mais um anel do farol acendeu!') }
      },
      {
        id: 'R1-F06-C5', tipo: 'C5', titulo: 'Sem o farol agora', cenario: 'ilha', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: sofia('Sem o farol agora. Qual som começa a palavra, [NOME]?'), itens: [itemLetra('avião', 'A', 'O', 'U'), itemLetra('ovelha', 'O', 'A', 'E'), itemLetra('urso', 'U', 'O', 'I'), itemLetra('escada', 'E', 'I', 'A')], comemora: sofia('Você ouviu o comecinho de palavras novas!') }
      }
    ],
    gancho: tales('Amanhã é o grande dia: acender o farol inteiro!'),
    fechamento: 'Os anéis do farol estão quase todos acesos.',
    emCasa: '"Caça às vogais" no rótulo de um alimento (o adulto aponta, a criança faz o som).',
    conquistas: ['S-R1-01', 'S-R1-08', 'V-R1-01'],
    demonstracao: { descricao: 'Falar o som das 5 vogais e tocar cada letra', habilidade: 'vogais' }
  },
  {
    id: 'R1-F07', regiao: 'R1', numero: 7, titulo: 'Chefe: O Farol Apagado',
    objetivo: 'Mostrar as 5 vogais (ouvir e tocar, ver e falar) e acender o farol',
    sessoesPrevistas: '1–2 sessões', chefe: true, termometro: 1,
    habilidades: ['vogais'], criterio: { tipo: 'chefe', leituraMin: 0.8 },
    acolhida: sofia('O farol apagou, [NOME]. São 4 andares. Você vai devagar e dá certo.'),
    cenas: [
      {
        id: 'R1-F07-C1', tipo: 'C1', titulo: 'Conchas da lembrança', cenario: 'ilha',
        atividade: { tipo: 'escolher', estilo: 'revisao', habilidade: 'vogais', enunciado: sofia('Lembra das conchas, [NOME]?'), itens: [itemLetra('aaaa', 'A', 'U')] }
      },
      {
        id: 'R1-F07-C4a', tipo: 'C4', titulo: 'Andar 1', cenario: 'farol', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: tales('Andar 1! Qual letra, [NOME]?'), itens: [itemLetra('aaaa', 'A', 'O', 'E'), itemLetra('iiii', 'I', 'U', 'E'), itemLetra('uuuu', 'U', 'O', 'A')] }
      },
      {
        id: 'R1-F07-C4b', tipo: 'C4', titulo: 'Andar 2', cenario: 'farol', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: sofia('Olha a minha boca antes de responder, [NOME].'), itens: [itemLetra('éééé', 'E', 'A', 'I'), itemLetra('ôôôô', 'O', 'U', 'A'), itemLetra('avião', 'A', 'I', 'O')] }
      },
      {
        id: 'R1-F07-C4c', tipo: 'C4', titulo: 'Andar 3: ver e falar', cenario: 'farol', contaDominio: true,
        atividade: { tipo: 'falar', habilidade: 'vogais', enunciado: tales('Fala o som desta letra, [NOME]!'), itens: [{ texto: 'O', falar: 'óóó' }, { texto: 'I', falar: 'iii' }, { texto: 'U', falar: 'uuu' }, { texto: 'E', falar: 'ééé' }] }
      },
      {
        id: 'R1-F07-C4d', tipo: 'C4', titulo: 'Andar 4', cenario: 'farol', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'vogais', enunciado: sofia('Último andar, [NOME]!'), itens: [itemLetra('urso', 'U', 'O'), itemLetra('elefante', 'E', 'A'), itemLetra('ovo', 'O', 'U')] }
      }
    ],
    gancho: sofia('Você acendeu o farol, [NOME]. A luz chegou até a mata… Ouviu? /mmm/…'),
    fechamento: 'Leitura da Ilha! O termômetro subiu para 1. O Zum-Zum descobriu que olhar a boca ajuda a ouvir e ganhou um lugar no barco.',
    emCasa: '"Caça às vogais" no rótulo de um alimento.',
    conquistas: ['M-R1-01', 'S-R1-07', 'S-R1-18'],
    uau: 'O farol acendeu e a luz varreu o mar até a mata!'
  }
];
