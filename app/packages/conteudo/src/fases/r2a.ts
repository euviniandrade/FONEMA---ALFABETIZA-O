/**
 * R2a · Mata Atlântica, Vale do M-L-F (jogo-completo/02, semanas 6–10). Fim da parte gratuita.
 * Toda palavra LIDA aqui usa só M, L, F e vogais (linter de decodificabilidade).
 */
import type { Fase } from '../tipos.ts';
import { bolota, donaCida, guarda, itemLer, itemLetra, itemSilaba, sofia, tales } from '../construtores.ts';

export const FASES_R2A: Fase[] = [
  {
    id: 'R2a-F01', regiao: 'R2a', numero: 1, titulo: 'M',
    objetivo: 'Ligar a letra M ao som /m/ e juntar MA, MO, MU', sessoesPrevistas: '2–3 sessões',
    habilidades: ['gpc-m', 'silaba-cv'], criterio: { tipo: 'dominio', habilidades: ['gpc-m'] },
    acolhida: sofia('Oi, [NOME]! Lembra do som que veio da mata? /mmm/…'),
    cenas: [
      {
        id: 'R2a-F01-C2', tipo: 'C2', titulo: 'Espelho do Som: /m/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'gpc-m', fonema: 'm', letra: 'M', ancora: { texto: 'mala', figura: '🧳' }, enunciado: sofia('Lábios fechados, o som sai pelo nariz: /mmm/. Sua vez, [NOME]!'), comemora: sofia('Sentiu a cosquinha no nariz?') }
      },
      {
        id: 'R2a-F01-C3', tipo: 'C3', titulo: 'Qual letra faz /mmm/?', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'gpc-m', enunciado: tales('Qual letra faz /mmm/, [NOME]?'), itens: [itemLetra('mmmm', 'M', 'A', 'O'), itemLetra('mmmm', 'M', 'U'), itemLetra('mmmm', 'M', 'A', 'I'), itemLetra('mmmm', 'M', 'E')], comemora: tales('M faz /mmm/!') }
      },
      {
        id: 'R2a-F01-C4', tipo: 'C4', titulo: 'A árvore do mico', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'montar', habilidade: 'silaba-cv', palavras: ['MA', 'MO', 'MU'], mostrarModelo: true, distratoras: ['E', 'I'], enunciado: sofia('Junta comigo, [NOME]: mmm-aaa… MA!'), comemora: sofia('Você juntou o /m/ com a vogal!') }
      },
      {
        id: 'R2a-F01-C6', tipo: 'C6', titulo: 'Anda como o mico', cenario: 'mata',
        atividade: { tipo: 'pausa', habilidade: 'gpc-m', acao: 'Mexe', enunciado: tales('Mexe quando ouvir /mmm/, [NOME]!'), sequencia: [{ falar: 'macaco', alvo: true }, { falar: 'lua', alvo: false }, { falar: 'mala', alvo: true }, { falar: 'foca', alvo: false }, { falar: 'moto', alvo: true }] }
      }
    ],
    gancho: tales('Tem um lago lá na frente… e dizem que a lua aparece nele!'),
    fechamento: 'O mico ganhou as sílabas MA, MO, MU na árvore.',
    emCasa: '"Hora do /mmm/": dizer MA, ME, MI, MO, MU esticando o /m/ enquanto escovam os dentes.',
    conquistas: ['S-SOM-M', 'S-R2a-01', 'S-R2a-03'],
    demonstracao: { descricao: 'Falar /mmm/, tocar o M e juntar MA', habilidade: 'gpc-m' }
  },
  {
    id: 'R2a-F02', regiao: 'R2a', numero: 2, titulo: 'L',
    objetivo: 'Ligar a letra L ao som /l/ e ler LUA e MALA', sessoesPrevistas: '2–3 sessões',
    habilidades: ['gpc-l', 'leitura-cvcv'], criterio: { tipo: 'dominio', habilidades: ['gpc-l'] },
    acolhida: tales('Oi, [NOME]! Hoje a língua sobe e fica lá em cima.'),
    cenas: [
      {
        id: 'R2a-F02-C2', tipo: 'C2', titulo: 'Espelho do Som: /l/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'gpc-l', fonema: 'l', letra: 'L', ancora: { texto: 'lua', figura: '🌙' }, enunciado: tales('/lll/, a língua sobe e fica lá. Sua vez, [NOME]!'), comemora: tales('A ponta da língua subiu!') }
      },
      {
        id: 'R2a-F02-C3', tipo: 'C3', titulo: 'Qual letra faz /lll/?', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'gpc-l', enunciado: sofia('Qual letra faz /lll/, [NOME]?'), itens: [itemLetra('llll', 'L', 'M'), itemLetra('llll', 'L', 'A', 'M'), itemLetra('mmmm', 'M', 'L'), itemLetra('llll', 'L', 'U')] }
      },
      {
        id: 'R2a-F02-C4', tipo: 'C4', titulo: 'O lago da lua', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'montar', habilidade: 'gpc-l', palavras: ['LUA', 'MALA'], mostrarModelo: true, distratoras: ['O', 'F'], enunciado: sofia('Letra por letra, [NOME]: L-U-A.'), comemora: sofia('A lua apareceu no lago!') }
      },
      {
        id: 'R2a-F02-C8', tipo: 'C8', titulo: 'O Bolota leu errado', cenario: 'mata', contaDominio: true,
        atividade: {
          tipo: 'escolher', estilo: 'ensinar', habilidade: 'gpc-l',
          enunciado: bolota('Eu li "LALA"… Ops! Me ensina, [NOME]? Como se lê?'),
          itens: [
            { mostrar: 'MALA', correta: 'mala', opcoes: [{ id: 'lala', rotulo: '"lala"', figura: '🔊', falar: 'lala' }, { id: 'mala', rotulo: '"mala"', figura: '🔊', falar: 'mala' }] },
            { mostrar: 'LUA', correta: 'lua', opcoes: [{ id: 'lua', rotulo: '"lua"', figura: '🔊', falar: 'lua' }, { id: 'mua', rotulo: '"mua"', figura: '🔊', falar: 'mua' }] },
            { mostrar: 'MOLA', correta: 'mola', opcoes: [{ id: 'lola', rotulo: '"lola"', figura: '🔊', falar: 'lola' }, { id: 'mola', rotulo: '"mola"', figura: '🔊', falar: 'mola' }] }
          ],
          comemora: bolota('Agora eu sei! M é /mmm/, L é /lll/!')
        }
      }
    ],
    gancho: donaCida('Amanhã venha me ajudar a bordar, [NOME]. Tenho um fio que faz /fff/!'),
    fechamento: 'A lua apareceu no lago quando você leu LUA.',
    emCasa: 'Procurar o L em embalagens e fazer o som /lll/ (não "ele").',
    conquistas: ['S-SOM-L', 'S-R2a-02', 'S-R2a-06'],
    demonstracao: { descricao: 'Ler LUA e MALA em voz alta', habilidade: 'gpc-l' }
  },
  {
    id: 'R2a-F03', regiao: 'R2a', numero: 3, titulo: 'F',
    objetivo: 'Ligar a letra F ao som /f/ e montar FALA, FILA, FOFO', sessoesPrevistas: '2–3 sessões',
    habilidades: ['gpc-f', 'silaba-cv'], criterio: { tipo: 'dominio', habilidades: ['gpc-f'] },
    acolhida: sofia('Oi, [NOME]! Sente o ventinho? /fff/…'),
    cenas: [
      {
        id: 'R2a-F03-C2', tipo: 'C2', titulo: 'Espelho do Som: /f/', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'espelho', habilidade: 'gpc-f', fonema: 'f', letra: 'F', ancora: { texto: 'foca', figura: '🦭' }, enunciado: sofia('/fff/, um ventinho. Dentes de cima no lábio de baixo. Sua vez, [NOME]!'), comemora: sofia('Que ventinho bom!') }
      },
      {
        id: 'R2a-F03-C3', tipo: 'C3', titulo: 'Qual letra faz /fff/?', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'gpc-f', enunciado: tales('Qual letra faz /fff/, [NOME]?'), itens: [itemLetra('ffff', 'F', 'L'), itemLetra('ffff', 'F', 'M', 'A'), itemLetra('llll', 'L', 'F'), itemLetra('ffff', 'F', 'O')] }
      },
      {
        id: 'R2a-F03-C4', tipo: 'C4', titulo: 'Os carretéis da Dona Cida', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'montar', habilidade: 'silaba-cv', palavras: ['FILA', 'FALA', 'FOFO'], mostrarModelo: true, porSilaba: true, distratoras: ['MU', 'LE'], enunciado: donaCida('Me ajuda a bordar, [NOME]? Um carretel para cada pedacinho.'), comemora: donaCida('Ficou um bordado lindo!') }
      },
      {
        id: 'R2a-F03-C5', tipo: 'C5', titulo: 'A placa do vale', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'gpc-f', enunciado: guarda('A placa apagou! Qual sílaba falta aqui, [NOME]?'), itens: [itemSilaba('__LA (FALA)', 'FA', 'MA', 'LU'), itemSilaba('__FO (FOFO)', 'FO', 'MO', 'LI'), itemSilaba('__LA (FILA)', 'FI', 'MI', 'LA')], comemora: guarda('A placa do vale voltou a funcionar!') }
      }
    ],
    gancho: tales('Amanhã a ponte do rio precisa da sua leitura, [NOME]!'),
    fechamento: 'O bordado da Dona Cida ficou com FILA, FALA e FOFO.',
    emCasa: 'Fazer o som /fff/ soprando uma pena ou um papelzinho.',
    conquistas: ['S-SOM-F', 'S-R2a-04'],
    demonstracao: { descricao: 'Falar /fff/ e montar FALA', habilidade: 'gpc-f' }
  },
  {
    id: 'R2a-F04', regiao: 'R2a', numero: 4, titulo: 'Juntar sílabas: primeiras palavras',
    objetivo: 'Ler sozinho as primeiras palavras (MALA, LUA, FALA)', sessoesPrevistas: '3–4 sessões',
    habilidades: ['leitura-cvcv'], criterio: { tipo: 'dominio', habilidades: ['leitura-cvcv'] },
    acolhida: sofia('Oi, [NOME]! Hoje você vai ler uma palavra inteirinha.'),
    cenas: [
      {
        id: 'R2a-F04-C2', tipo: 'C2', titulo: 'Letra por letra', cenario: 'licao', contaDominio: true,
        assiste: { imagem: 'dupla-praca', roteiro: [tales('MA… LA… Eu vou rápido demais e erro!'), sofia('Devagar: mmm-aaa, MA. lll-aaa, LA. MALA!'), tales('Letra por letra! Agora é a sua vez, [NOME]!')] },
        atividade: { tipo: 'falar', habilidade: 'leitura-cvcv', enunciado: sofia('Lê comigo, [NOME]. Devagar e até o fim.'), itens: [{ texto: 'MALA', falar: 'mala', figura: '🧳' }], comemora: sofia('Você leu MALA!') }
      },
      {
        id: 'R2a-F04-C4', tipo: 'C4', titulo: 'Ponte das Sílabas', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'leitura-cvcv', enunciado: sofia('A ponte precisa da sua leitura, [NOME]. Lê e toca a figura!'), itens: [itemLer('LUA', 'lua', 'mala'), itemLer('MALA', 'mala', 'lua'), itemLer('FOFO', 'FOFO', 'MULA'), itemLer('MULA', 'MULA', 'LULA'), itemLer('LULA', 'LULA', 'FOFO')], comemora: sofia('Mais uma tábua encaixou na ponte!') }
      },
      {
        id: 'R2a-F04-C4b', tipo: 'C4', titulo: 'Futebol de Sílabas', cenario: 'campinho', marcador: 'esporte-futebol', contaDominio: true,
        atividade: { tipo: 'montar', habilidade: 'leitura-cvcv', palavras: ['MOLA', 'FILA'], mostrarModelo: true, porSilaba: true, distratoras: ['FU', 'ME'], enunciado: tales('Passa a bola, [NOME]! MO… LA! Monta e o gol vale!'), comemora: tales('Gooool! Você leu!') }
      },
      {
        id: 'R2a-F04-C5', tipo: 'C5', titulo: 'Só você e as letras', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'falar', habilidade: 'leitura-cvcv', enunciado: sofia('Sem ponte, sem bola. Só você e as letras, [NOME].'), itens: [{ texto: 'LUA', falar: 'lua' }, { texto: 'FALA', falar: 'fala' }, { texto: 'LUFO', falar: 'lufo', pseudo: true }], comemora: sofia('Até o nome do bichinho da mata você leu!') }
      }
    ],
    gancho: tales('A cachoeira tem pedras com sílabas… Amanhã a gente atravessa!'),
    fechamento: 'A MALA que você leu apareceu e se abriu!',
    emCasa: 'A criança lê MALA, LUA e FALA em cartões feitos pelo adulto (letra de forma maiúscula).',
    conquistas: ['M-R2a-01', 'S-R2a-05', 'V-R2a-01', 'V-R2a-02'],
    demonstracao: { descricao: 'Ler MALA e LUA e explicar "juntei o /m/ com o /a/"', habilidade: 'leitura-cvcv' },
    uau: 'A primeira palavra que você leu, MALA, apareceu e se abriu!'
  },
  {
    id: 'R2a-F05', regiao: 'R2a', numero: 5, titulo: 'Chefe: Cachoeira das Sílabas',
    objetivo: 'Ler palavras e nomes de bichinhos da mata e escrever 4 palavras',
    sessoesPrevistas: '2–3 sessões', chefe: true, termometro: 2,
    habilidades: ['leitura-cvcv', 'escrita-cvcv'], criterio: { tipo: 'chefe', leituraMin: 0.85, escritaMin: 0.75 },
    acolhida: sofia('A cachoeira tem pedras com sílabas, [NOME]. Uma pedra de cada vez.'),
    cenas: [
      {
        id: 'R2a-F05-C4a', tipo: 'C4', titulo: 'Pedras da cachoeira', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'leitura-cvcv', enunciado: sofia('Lê a pedra e toca a figura, [NOME].'), itens: [itemLer('MALA', 'mala', 'MULA'), itemLer('LULA', 'LULA', 'lua'), itemLer('FILA', 'FILA', 'FOFO'), itemLer('LUA', 'lua', 'LULA')] }
      },
      {
        id: 'R2a-F05-C4b', tipo: 'C4', titulo: 'Nomes de bichinhos', cenario: 'mata', contaDominio: true,
        atividade: { tipo: 'falar', habilidade: 'leitura-cvcv', enunciado: tales('Esses são nomes de bichinhos da mata. Lê pra mim, [NOME]!'), itens: [{ texto: 'FOLU', falar: 'folu', pseudo: true }, { texto: 'MUFE', falar: 'mufe', pseudo: true }, { texto: 'FALA', falar: 'fala' }] }
      },
      {
        id: 'R2a-F05-C4c', tipo: 'C4', titulo: 'Ditado da cachoeira', cenario: 'licao', contaDominio: true,
        atividade: { tipo: 'ditado', habilidade: 'escrita-cvcv', palavras: ['LUA', 'MALA', 'FILA', 'MOLA'], letras: ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'F'], enunciado: sofia('Agora você escreve, [NOME]. Escuta a palavra e monta com as letras.') }
      },
      {
        id: 'R2a-F05-C7', tipo: 'C7', titulo: 'Guia da mata para o Bolota', cenario: 'mata',
        atividade: { tipo: 'escolher', estilo: 'tocar', habilidade: 'leitura-cvcv', enunciado: bolota('Me ajuda a fazer o guia da mata? Lê a figurinha!'), itens: [itemLer('MULA', 'MULA', 'lua'), itemLer('LULA', 'LULA', 'mala')], comemora: bolota('Agora eu sei a mata!') }
      }
    ],
    gancho: tales('Tem alguém chamando lá do outro lado da ponte, [NOME]! A ponte está em obras… e um tucano espia.'),
    fechamento: 'Leitura da Mata! A vila ganhou a horta e a Árvore das Palavras. O Zum-Zum aprendeu que "devagar e até o fim, a palavra aparece".',
    emCasa: 'Ler o Guia da mata para alguém da família.',
    conquistas: ['M-R2a-02', 'S-R2a-08', 'TI-R2a-01', 'S-R2a-07', 'S-R2a-09'],
    uau: 'Você atravessou a cachoeira lendo pedra por pedra!'
  }
];
