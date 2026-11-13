/**
 * R0 · Quintal da Sofia / Vila do Bolota (jogo-completo/02, semanas 1–3).
 * Consciência fonológica oral: nome, rima, sílaba, som inicial, síntese. A criança ainda não lê.
 */
import type { Fase } from '../tipos.ts';
import { bolota, davi, donaCida, itemFig, itemSimNao, sofia, tales } from '../construtores.ts';

export const FASES_R0: Fase[] = [
  {
    id: 'R0-F01',
    regiao: 'R0',
    numero: 1,
    titulo: 'O som do meu nome',
    objetivo: 'Descobrir o primeiro som do próprio nome',
    sessoesPrevistas: '1–2 sessões',
    habilidades: ['nome-silabas', 'som-do-nome'],
    criterio: { tipo: 'missao' },
    acolhida: sofia('Oi, [NOME]! Hoje a gente vai descobrir um segredo do seu nome.'),
    cenas: [
      {
        id: 'R0-F01-C2', tipo: 'C2', titulo: 'Palmas no nome', cenario: 'quintal', contaDominio: true,
        assiste: {
          imagem: 'serie-palmas',
          roteiro: [
            sofia('Eu sou a Sofia. SO… FI… A! Três palmas!'),
            tales('E eu sou o Tales. TA… LES! Duas palmas!'),
            sofia('Uma palma para cada pedacinho do nome.'),
            tales('Agora é a sua vez, [NOME]! Quantas palmas tem o seu nome?')
          ]
        },
        atividade: {
          tipo: 'palmas', habilidade: 'nome-silabas', palavras: ['$NOME'],
          enunciado: tales('Bate uma palma para cada pedacinho do seu nome, [NOME]!'),
          comemora: tales('Isso! Cada palma acendeu uma lâmpada!')
        }
      },
      {
        id: 'R0-F01-C2b', tipo: 'C2', titulo: 'Espelho do Som: o som do seu nome', cenario: 'licao', contaDominio: true,
        atividade: {
          tipo: 'espelho', habilidade: 'som-do-nome', fonema: '$SOM_NOME', letra: '$LETRA_NOME', ancora: { texto: '$NOME', figura: '⭐' },
          enunciado: sofia('[NOME] começa com este som. Olha a minha boca. Agora é a sua vez, [NOME]!'),
          comemora: sofia('Isso! Você fez o som do seu nome!')
        }
      },
      {
        id: 'R0-F01-C4', tipo: 'C4', titulo: 'Caça ao som do nome', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'cacar', habilidade: 'som-do-nome', gerador: 'som-do-nome', itens: [],
          enunciado: tales('Pega a lupa! O que mais começa com o som do seu nome, [NOME]?'),
          comemora: sofia('Começa igual a você!')
        }
      },
      {
        id: 'R0-F01-C6', tipo: 'C6', titulo: 'Pula no som!', cenario: 'quintal',
        atividade: {
          tipo: 'pausa', habilidade: 'som-do-nome', acao: 'Pula',
          sequencia: [{ falar: '$PALAVRA_NOME', alvo: true }, { falar: 'bola', alvo: false }, { falar: '$NOME', alvo: true }, { falar: 'lua', alvo: false }],
          enunciado: tales('Pula quando ouvir o som do seu nome, [NOME]!')
        }
      },
      {
        id: 'R0-F01-C5', tipo: 'C5', titulo: 'A placa da porta', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'montar', habilidade: 'som-do-nome', palavras: ['$NOME'], mostrarModelo: true,
          enunciado: sofia('A placa da sua porta está vazia. Monta o seu nome, letra por letra, [NOME]!'),
          comemora: sofia('Esta é a sua letra, [NOME]. E este é o som dela! Foi você que descobriu.')
        }
      }
    ],
    gancho: tales('Ouviu isso, [NOME]? Alguma coisa rolou no arbusto… Amanhã a gente descobre quem é!'),
    fechamento: 'A placa da porta mostra a letra do seu nome. O cofrinho-tatu apareceu!',
    emCasa: 'Procurem juntos 3 coisas da casa que começam com o som do nome (o adulto fala o som esticado, sem dizer o nome da letra).',
    conquistas: ['S-R0-01', 'TI-R0-01', 'S-R0-10', 'S-R0-15'],
    demonstracao: { descricao: 'Bater as palmas do próprio nome e falar o primeiro som', habilidade: 'som-do-nome' },
    uau: 'A letra do seu nome acendeu na placa da casa!'
  },
  {
    id: 'R0-F02',
    regiao: 'R0',
    numero: 2,
    titulo: 'Rimas do quintal',
    objetivo: 'Perceber palavras que terminam igual (rimas)',
    sessoesPrevistas: '2–3 sessões',
    habilidades: ['rima'],
    criterio: { tipo: 'dominio', habilidades: ['rima'] },
    acolhida: sofia('Oi, [NOME]! A Dona Cida sabe umas palavras que terminam igualzinho. Vamos ouvir?'),
    cenas: [
      {
        id: 'R0-F02-C2', tipo: 'C2', titulo: 'Parlenda da Dona Cida', cenario: 'quintal',
        assiste: {
          imagem: 'dupla-praca',
          roteiro: [
            donaCida('Escuta: GATO… PATO. Terminam igual: g-ATO, p-ATO!'),
            donaCida('MÃO… PÃO. Também terminam igual!'),
            sofia('Quando termina igual, a gente diz que RIMA.'),
            tales('Agora é a sua vez, [NOME]!')
          ]
        },
        atividade: {
          tipo: 'escolher', estilo: 'tocar', habilidade: 'rima',
          enunciado: donaCida('Qual rima com GATO, [NOME]?'),
          itens: [itemFig('gato… qual rima com gato?', 'pato', 'bola')],
          comemora: donaCida('GATO e PATO terminam igual!')
        }
      },
      {
        id: 'R0-F02-C3', tipo: 'C3', titulo: 'Rima ou não rima?', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'tocar', habilidade: 'rima',
          enunciado: tales('Rima ou não rima, [NOME]?'),
          itens: [itemSimNao('mão… pão', true), itemSimNao('bola… casa', false), itemSimNao('janela… panela', true), itemSimNao('sapo… lua', false), itemSimNao('caneca… boneca', true)],
          comemora: sofia('Você escutou o final das palavras!')
        }
      },
      {
        id: 'R0-F02-C4', tipo: 'C4', titulo: 'O varal de rimas', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'tocar', habilidade: 'rima',
          enunciado: sofia('Ajuda a gente a pendurar no varal, [NOME]: o que rima?'),
          itens: [itemFig('o que rima com pão?', 'mão', 'lua'), itemFig('o que rima com foca?', 'pipoca', 'sol'), itemFig('o que rima com mel?', 'papel', 'casa'), itemFig('o que rima com leão?', 'avião', 'bola'), itemFig('o que rima com rua?', 'lua', 'pato')],
          comemora: sofia('Terminam igual! Você achou a rima!')
        }
      },
      {
        id: 'R0-F02-C8', tipo: 'C8', titulo: 'O Bolota se confundiu', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'ensinar', habilidade: 'rima',
          enunciado: bolota('Ops! Eu disse que BOLA rima com MESA. Me ensina, [NOME]? Qual rima com BOLA?'),
          itens: [itemFig('bola… qual rima com bola?', 'cola', 'mesa'), itemFig('gato… qual rima com gato?', 'pato', 'sol'), itemFig('janela… qual rima com janela?', 'panela', 'uva')],
          comemora: bolota('Ahh, agora eu entendi! Obrigado, [NOME]!')
        }
      }
    ],
    gancho: tales('Amanhã o Davi vem com o pandeiro. Ele diz que as palavras têm pedacinhos!'),
    fechamento: 'O varal de rimas ficou pendurado no quintal.',
    emCasa: 'Brinquem de "o que rima com…?" no caminho da escola.',
    conquistas: ['S-R0-02', 'S-R0-12', 'V-R0-01'],
    demonstracao: { descricao: 'Falar duas palavras que rimam (GATO e PATO)', habilidade: 'rima' }
  },
  {
    id: 'R0-F03',
    regiao: 'R0',
    numero: 3,
    titulo: 'Palmas das sílabas',
    objetivo: 'Separar palavras em pedacinhos (sílabas) com palmas',
    sessoesPrevistas: '2–3 sessões',
    habilidades: ['silaba'],
    criterio: { tipo: 'dominio', habilidades: ['silaba'] },
    acolhida: sofia('Oi, [NOME]! Hoje tem música na praça com o Davi.'),
    cenas: [
      {
        id: 'R0-F03-C2', tipo: 'C2', titulo: 'O pandeiro do Davi', cenario: 'praca', contaDominio: true,
        assiste: {
          imagem: 'serie-palmas',
          roteiro: [davi('PI… PO… CA! Uma batida para cada pedacinho.'), tales('Três pedacinhos!'), tales('Agora é a sua vez, [NOME]! Uma palma para cada pedacinho.')]
        },
        atividade: { tipo: 'palmas', habilidade: 'silaba', palavras: ['pipoca'], enunciado: davi('Bate comigo: PIPOCA!'), comemora: davi('PI-PO-CA! Três palmas!') }
      },
      {
        id: 'R0-F03-C4', tipo: 'C4', titulo: 'Varal de lâmpadas', cenario: 'praca', contaDominio: true,
        atividade: {
          tipo: 'palmas', habilidade: 'silaba', palavras: ['bolota', 'sapo', 'pé', 'macaco', 'janela'],
          enunciado: sofia('Quantas palmas tem esta palavra, [NOME]? Eu me perdi!'),
          comemora: sofia('Cada palma acendeu uma lâmpada!')
        }
      },
      {
        id: 'R0-F03-C6', tipo: 'C6', titulo: 'Amarelinha das sílabas', cenario: 'praca', marcador: 'esporte-amarelinha',
        atividade: { tipo: 'palmas', estilo: 'amarelinha', habilidade: 'silaba', palavras: ['janela', 'bola'], enunciado: tales('Pula com a gente, [NOME]! Uma casa para cada pedacinho.') }
      },
      {
        id: 'R0-F03-C6b', tipo: 'C6', titulo: 'Roda de respeito (capoeira como esporte)', cenario: 'praca', marcador: 'esporte-capoeira',
        atividade: {
          tipo: 'palmas', estilo: 'capoeira', habilidade: 'silaba', palavras: ['ginga', 'peteca'],
          enunciado: davi('Na roda a gente joga junto, ninguém bate em ninguém. Uma palma por pedacinho, [NOME]!')
        }
      },
      {
        id: 'R0-F03-C5', tipo: 'C5', titulo: 'Nomes na porta da escola', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'palmas', habilidade: 'silaba', palavras: ['Sofia', 'Tales', '$NOME'], enunciado: tales('E os nossos nomes? Bate pra mim, [NOME]!') }
      }
    ],
    gancho: sofia('Amanhã a gente vai brincar de descobrir o primeiro som das coisas!'),
    fechamento: 'A praça ganhou o varal de lâmpadas.',
    emCasa: 'Batam palmas nos nomes das pessoas da família no jantar.',
    conquistas: ['S-R0-03', 'S-R0-13'],
    demonstracao: { descricao: 'Bater as palmas das sílabas do próprio nome', habilidade: 'silaba' }
  },
  {
    id: 'R0-F04',
    regiao: 'R0',
    numero: 4,
    titulo: 'O primeiro som',
    objetivo: 'Achar o primeiro som das palavras (/mmm/, /sss/, /fff/)',
    sessoesPrevistas: '2–3 sessões',
    habilidades: ['som-inicial'],
    criterio: { tipo: 'dominio', habilidades: ['som-inicial'] },
    acolhida: sofia('Oi, [NOME]! Hoje a gente escuta o comecinho das palavras.'),
    cenas: [
      {
        id: 'R0-F04-C2', tipo: 'C2', titulo: 'Espelho do Som: /sss/', cenario: 'licao', contaDominio: true,
        atividade: {
          tipo: 'espelho', habilidade: 'som-inicial', fonema: 's', letra: 'S', ancora: { texto: 'sapo', figura: '🐸' },
          enunciado: sofia('Primeiro a gente escuta: /sss/. Dentinhos quase fechados, língua escondida. Agora é a sua vez, [NOME]!'),
          comemora: sofia('Isso! Uma cobrinha: sss!')
        }
      },
      {
        id: 'R0-F04-C3', tipo: 'C3', titulo: 'Qual começa com…?', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'tocar', habilidade: 'som-inicial',
          enunciado: sofia('Escuta, [NOME]. Qual começa com o som?'),
          itens: [itemFig('qual começa com sss?', 'sapo', 'lua'), itemFig('qual começa com mmm?', 'mala', 'pé'), itemFig('qual começa com fff?', 'foca', 'bola'), itemFig('qual começa com sss?', 'sol', 'moto'), itemFig('qual começa com mmm?', 'macaco', 'uva')],
          comemora: sofia('Você escutou o comecinho!')
        }
      },
      {
        id: 'R0-F04-C4', tipo: 'C4', titulo: 'O Paçoca escondeu tudo', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'cacar', habilidade: 'som-inicial',
          enunciado: tales('O Paçoca escondeu tudo que começa com /fff/. Bora, [NOME]!'),
          itens: [itemFig('fff… cadê o que começa com fff?', 'formiga', 'sapo', 'lua'), itemFig('fff…', 'folha', 'mala', 'pato'), itemFig('fff…', 'foca', 'uva', 'gato'), itemFig('fff…', 'fogo', 'bola', 'casa')],
          comemora: tales('Achou! O Paçoca abanou o rabo!')
        }
      },
      {
        id: 'R0-F04-C8', tipo: 'C8', titulo: 'Começam igual?', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'ensinar', habilidade: 'som-inicial',
          enunciado: bolota('Eu acho que SAPO e MALA começam igual… Começam, [NOME]?'),
          itens: [itemSimNao('sapo… mala', false), itemSimNao('sapo… sol', true), itemSimNao('mala… macaco', true), itemSimNao('foca… lua', false)],
          comemora: bolota('Você me ensinou! Valeu, [NOME]!')
        }
      }
    ],
    gancho: tales('O Bolota fala tudo devagarinho… Amanhã a gente descobre o que ele quer dizer!'),
    fechamento: 'Você abriu a página "Sons do quintal" do álbum.',
    emCasa: '"Eu vejo uma coisa que começa com /mmm/…" (o adulto fala o som, não o nome da letra).',
    conquistas: ['S-R0-04', 'S-R0-12'],
    demonstracao: { descricao: 'Dizer o primeiro som de 3 figuras', habilidade: 'som-inicial' }
  },
  {
    id: 'R0-F05',
    regiao: 'R0',
    numero: 5,
    titulo: 'Juntar sons',
    objetivo: 'Juntar sons falados devagar e descobrir a palavra',
    sessoesPrevistas: '2 sessões',
    habilidades: ['sintese'],
    criterio: { tipo: 'dominio', habilidades: ['sintese'] },
    acolhida: sofia('Oi, [NOME]! O Bolota fala de um jeito engraçado: bem devagar. É a fala de tatu!'),
    cenas: [
      {
        id: 'R0-F05-C2', tipo: 'C2', titulo: 'Fala de tatu', cenario: 'quintal', contaDominio: true,
        assiste: { imagem: 'serie-bolota', roteiro: [bolota('Bo… la.'), sofia('O Bolota falou bem devagar. Junta comigo: bo… la… BOLA!'), tales('Agora é a sua vez, [NOME]!')] },
        atividade: {
          tipo: 'escolher', estilo: 'sintese', habilidade: 'sintese',
          enunciado: sofia('O que o Bolota disse, [NOME]?'),
          itens: [itemFig('bo… la', 'bola', 'mala'), itemFig('pa… to', 'pato', 'gato'), itemFig('ca… sa', 'casa', 'mesa')],
          comemora: bolota('Isso! Você me entendeu!')
        }
      },
      {
        id: 'R0-F05-C3', tipo: 'C3', titulo: 'Sons separadinhos', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'sintese', habilidade: 'sintese',
          enunciado: sofia('Junta comigo, [NOME]!'),
          itens: [itemFig('sss… ooo… lll', 'sol', 'lua', 'pé'), itemFig('lll… uuu… aaa', 'lua', 'uva', 'sol'), itemFig('mmm… eee… lll', 'mel', 'pé', 'ovo')],
          comemora: sofia('Você juntou os sons!')
        }
      },
      {
        id: 'R0-F05-C4', tipo: 'C4', titulo: 'Os pedidos do Paçoca', cenario: 'quintal', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'sintese', habilidade: 'sintese',
          enunciado: tales('O Paçoca pede em fala de tatu. Entrega pra ele, [NOME]?'),
          itens: [itemFig('o Paçoca quer a ba… na… na', 'banana', 'boneca', 'bola'), itemFig('o Paçoca quer o sa… pa… to', 'sapato', 'sapo', 'pato'), itemFig('o Paçoca quer a ja… ne… la', 'janela', 'panela', 'caneca'), itemFig('o Paçoca quer o pei… xe', 'peixe', 'pé', 'pipoca')],
          comemora: tales('O Paçoca adorou!')
        }
      }
    ],
    gancho: sofia('Amanhã é a Festa das Rimas na praça! Vai ter lanterna e tudo.'),
    fechamento: 'O Bolota ganhou uma casinha no quintal.',
    emCasa: 'Falem palavras devagar ("me dá a ca… ma") e a criança adivinha.',
    conquistas: ['S-R0-05'],
    demonstracao: { descricao: 'Ouvir "bo… la" e dizer a palavra inteira', habilidade: 'sintese' }
  },
  {
    id: 'R0-F06',
    regiao: 'R0',
    numero: 6,
    titulo: 'Chefe: Festa das Rimas',
    objetivo: 'Mostrar rima, sílaba, som inicial e juntar sons na festa',
    sessoesPrevistas: '1–2 sessões',
    habilidades: ['rima', 'silaba', 'som-inicial', 'sintese'],
    criterio: { tipo: 'chefe', leituraMin: 0.85 },
    chefe: true,
    termometro: 0,
    acolhida: tales('Hoje é a Festa das Rimas, [NOME]! São 4 estações. Cada uma acende uma lanterna.'),
    cenas: [
      {
        id: 'R0-F06-C1', tipo: 'C1', titulo: 'Aquecimento', cenario: 'praca',
        atividade: { tipo: 'escolher', estilo: 'revisao', habilidade: 'som-inicial', enunciado: tales('Aquece com a gente, [NOME]!'), itens: [itemFig('qual começa com mmm?', 'mala', 'sol')] }
      },
      {
        id: 'R0-F06-C4a', tipo: 'C4', titulo: 'Estação 1: varal de rimas', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'rima', enunciado: sofia('Qual rima, [NOME]?'), itens: [itemFig('o que rima com gato?', 'pato', 'lua'), itemFig('o que rima com panela?', 'janela', 'bola'), itemFig('o que rima com pão?', 'mão', 'sapo')] }
      },
      {
        id: 'R0-F06-C4b', tipo: 'C4', titulo: 'Estação 2: lâmpadas', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'palmas', habilidade: 'silaba', palavras: ['macaco', 'sol', 'bolota'], enunciado: sofia('Uma palma para cada pedacinho, [NOME]!') }
      },
      {
        id: 'R0-F06-C4c', tipo: 'C4', titulo: 'Estação 3: caça ao som', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'cacar', habilidade: 'som-inicial', enunciado: tales('Qual começa com o som, [NOME]?'), itens: [itemFig('sss…', 'suco', 'mala', 'uva'), itemFig('fff…', 'foca', 'sol', 'pé'), itemFig('mmm…', 'moto', 'lua', 'gato')] }
      },
      {
        id: 'R0-F06-C4d', tipo: 'C4', titulo: 'Estação 4: fala de tatu', cenario: 'praca', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'sintese', habilidade: 'sintese', enunciado: bolota('Me escuta, [NOME]!'), itens: [itemFig('ma… ca… co', 'macaco', 'moto', 'mala'), itemFig('sss… ooo… lll', 'sol', 'lua', 'mel')] }
      },
      {
        id: 'R0-F06-C7', tipo: 'C7', titulo: 'Álbum da minha família', cenario: 'praca',
        atividade: { tipo: 'palmas', habilidade: 'silaba', palavras: ['mamãe', 'papai', 'vovó'], enunciado: sofia('Quem mora com você, [NOME]? Bate as palmas do nome.') }
      }
    ],
    gancho: tales('Olha, [NOME]! Uma garrafa chegou na beira do quintal, com um mapa e cinco sinais. E se forem letras?'),
    fechamento: 'Leitura do Quintal! A vila ganhou o varal de lâmpadas e o cais. O Zum-Zum ouviu a festa inteira quietinho e virou amigo.',
    emCasa: 'Vejam juntos o "Álbum da minha família".',
    conquistas: ['M-R0-01', 'S-R0-06', 'TI-R0-02', 'S-R0-07'],
    uau: 'As quatro lanternas da festa acenderam!'
  }
];
