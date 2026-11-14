# Auditoria dos clipes de voz

Gerado por `ferramentas/auditar-audio.py`. Regra (D027 §2): **nenhum áudio vai ao ar sem esta auditoria**.

- Clipes auditados: **915** (625 falas + 290 nomes; vozes Sofia e Tales)
- Graves (defeito audível provável): **275** · a conferir de ouvido (palavra/som solto com transcrição diferente): **52** · leves (higiene do sinal): **188** · sem defeito: **400**
- Conteúdo conferido por transcrição: **915** clipes · **sem transcrição: 0** (só o sinal foi conferido nesses)
- Volume (clipes ≥ 0,4 s): mediana -15.4 LUFS, de -26.7 a -5.1 (alvo -16)

## Defeitos por tipo

| Tipo | Clipes |
|---|---|
| começo seco | 184 |
| volume fora da média | 135 |
| sem respiro no começo | 113 |
| conteúdo: palavra trocada | 69 |
| sem respiro no fim | 69 |
| clipping | 63 |
| fim seco | 35 |
| fim cortado na gravação | 21 |
| conteúdo: nome errado | 16 |
| conteúdo: sílaba faltando no fim | 6 |
| conteúdo: sobrando | 5 |
| conteúdo: sílaba faltando no começo | 4 |
| conteúdo: transcrição vazia | 2 |
| mudo | 1 |

Critérios: começo/fim seco = RMS dos 25 ms das pontas acima de −30 dBFS; curto demais = menos de 55 ms por caractere falado; volume fora = mais de 4 dB da mediana da voz; clipping = 8+ amostras no teto ou onda achatada; fim cortado na gravação = o arquivo bruto do TTS acaba em plena fala (sem a queda da voz); conteúdo = transcrição automática (Gemini e, como segunda opinião, ElevenLabs Scribe; basta uma bater) comparada ao texto enviado ao TTS, por chave fonética (ignora caixa, pontuação e grafia). Sílabas e sons soltos têm transcrição pouco confiável: conferir de ouvido.

## Clipes graves

| Voz | Texto esperado | Ouvido | Problemas | Arquivo |
|---|---|---|---|---|
| sofia | A concha abre! | A concha abre! | começo seco | `falas/sofia-4ab6on.mp3` |
| sofia | A letra E! | A letra E | começo seco | `falas/sofia-ej9sf4.mp3` |
| sofia | A placa da sua porta está vazia. Monta o seu nome, letra por letra, | A placa da sua porta está vazia. Monta o seu nome, letra por letra? | sem respiro no começo; clipping | `falas/sofia-1vstqu.mp3` |
| sofia | A placa voltou para o lugar! | A placa voltou para o lugar. | sem respiro no começo; clipping | `falas/sofia-14efwa7.mp3` |
| sofia | A. | Ah | começo seco | `falas/sofia-1c6z85m.mp3` |
| sofia | Aaaaa. | Ah! | clipping; volume fora da média | `falas/sofia-1uqm3pn.mp3` |
| sofia | Aaaaa… abelha! | Ah, abelha | clipping | `falas/sofia-r7qb8v.mp3` |
| sofia | Abacaxi. | Abacaxi. | começo seco | `falas/sofia-1blvewq.mp3` |
| sofia | Agora é a sua vez, | Agora é a sua vez. | começo seco; volume fora da média | `falas/sofia-jw1frv.mp3` |
| sofia | Amanhã é a Festa das Rimas na praça! Vai ter lanterna e tudo. | Amanhã é a festa das rimas na praça. Vai ter lanterna e tudo! | clipping | `falas/sofia-yuxfl0.mp3` |
| sofia | Amanhã é a vez do sorriso mais largo de todos! | Amanhã é a vez do sorriso mais largo de todos | clipping | `falas/sofia-15yvsqq.mp3` |
| sofia | Aqui você vê por dentro como o som é feito: lábios, dentes, língua, cé | Aqui você vê por dentro como o som é feito. Lábios, dentes, língua, cé | começo seco | `falas/sofia-5xs6if.mp3` |
| sofia | As moedinhas vão para o cofrinho-tatu! | As moedinhas vão para o cofrinho tatu! | clipping | `falas/sofia-1hs1iuo.mp3` |
| sofia | Avião. | Avião | clipping | `falas/sofia-g35tl.mp3` |
| sofia | Avião. | Avião | clipping | `falas/sofia-11cpcp.mp3` |
| sofia | Boca redonda, muito bem! | Boca redonda, muito bem. | começo seco | `falas/sofia-j7stzy.mp3` |
| sofia | Bola. | Bola. | começo seco; volume fora da média | `falas/sofia-1uqmqiz.mp3` |
| sofia | Caneca. | Caneca | clipping | `falas/sofia-fo3mps.mp3` |
| sofia | Ca… sa. | Tchau, tchau! / Xá, sá! | começo seco; clipping; palavra trocada (“ka” → “xa”) | `falas/sofia-ki86cd.mp3` |
| sofia | Ca… sa. | Cá, sá | começo seco | `falas/sofia-13x8b5p.mp3` |
| sofia | Chave. | Chave | começo seco | `falas/sofia-gs3te.mp3` |
| sofia | Chefe: Cachoeira das Sílabas. Ler palavras e nomes de bichinhos da mat | Chefe, Cachoeira das Sílabas: ler palavras e nomes de bichinhos da mat | começo seco | `falas/sofia-11idavc.mp3` |
| sofia | Chefe: Festa das Rimas. Mostrar rima, sílaba, som inicial e juntar son | Chefe, festa das rimas. Mostrar rima, sílaba, som inicial e juntar son | começo seco | `falas/sofia-wh1czs.mp3` |
| sofia | Chefe: O Farol Apagado. Mostrar as 5 vogais (ouvir e tocar, ver e fala | Chefe, o farol apagou. Mostrar as cinco vogais. Ouvir e tocar, ver e f | começo seco; clipping | `falas/sofia-1abgg4w.mp3` |
| sofia | Cá. | Cá | clipping; volume fora da média | `falas/sofia-rpt9t5.mp3` |
| sofia | Dado. | Dado | começo seco | `falas/sofia-1uqobgl.mp3` |
| sofia | Devagar: M, de macaco-Aaaaa, ma. L, de lua-Aaaaa, la. mala! | Devagar. M de macaco. Amã! L de lua. A la mala | clipping; volume fora da média | `falas/sofia-tv6ilu.mp3` |
| sofia | Devagar: M, de macaco-Aaaaa, ma. L, de lua-Aaaaa, la. mala! | Devagar, hem, de macaco ama. Ele de lua ala, mala | sem respiro no começo; clipping; palavra trocada (“n” → “en”); palavra trocada (“a ma l” → “ama ele”) | `falas/sofia-guzzxu.mp3` |
| sofia | Dá. | Da | começo seco | `falas/sofia-rpt9n2.mp3` |
| sofia | E: é e ê. Ligar os sons é e ê à letra E. | É, iê! Liga os sons é e iê à letra E. / I, E e E. Ligar os sons E e E  | começo seco; palavra trocada (“e” → “i”) | `falas/sofia-1svhpmb.mp3` |
| sofia | Esta é a sua letra, | Esta é a sua letra | começo seco | `falas/sofia-6wzcat.mp3` |
| sofia | Eu sou a Sofia. so… fi… A! Três palmas! | Eu sou a Sofia. So-fi-a. Três palmas | clipping | `falas/sofia-1egnpj4.mp3` |
| sofia | F, de foca | F de foca | começo seco; volume fora da média | `falas/sofia-1uqpsi3.mp3` |
| sofia | F, de foca, um ventinho. Dentes de cima no lábio de baixo. Sua vez, | F de foca, um ventinho, dentes de cima no lábio de baixo. Sua vez! | começo seco | `falas/sofia-102u0ga.mp3` |
| sofia | F, de foca… foca! | F de foca. Foca | clipping; volume fora da média | `falas/sofia-ganutj.mp3` |
| sofia | F. Ligar a letra F ao som f e montar fala, fila, fofo. | F, ligar a letra F ao som F e montar fala, fila, fofo | começo seco | `falas/sofia-1bj7qh6.mp3` |
| sofia | Ficou a sua cara! Tudo pronto pra começar? | Ficou a sua cara! Tudo pronto pra começar? | clipping; volume fora da média | `falas/sofia-9a09w5.mp3` |
| sofia | Fila. | Fila. | começo seco; volume fora da média | `falas/sofia-1urc26h.mp3` |
| sofia | Ga. | Gá! | clipping; volume fora da média | `falas/sofia-rpt9t9.mp3` |
| sofia | Gato. | Gato | sem respiro no começo; clipping | `falas/sofia-1uqqn3q.mp3` |
| sofia | Gato… qual rima com gato? | Gato! Qual rima com gato? | sem respiro no começo; clipping; volume fora da média | `falas/sofia-1djl32l.mp3` |
| sofia | Gá. | Já / Já! | sem respiro no começo; clipping; palavra trocada (“ga” → “ja”); volume fora da média | `falas/sofia-rpt9pp.mp3` |
| sofia | Hoje a pescadora vai apresentar a vovó e o vovô dela. | Hoje a pescadora vai apresentar a vovó e o vovô dela | começo seco | `falas/sofia-1iervyv.mp3` |
| sofia | Hoje você trabalhou com muita atenção, | Hoje você trabalhou com muita atenção | começo seco | `falas/sofia-1flpqdx.mp3` |
| sofia | I do sorriso. Ligar o som i à letra I e traçar o I. | E do S o riso, ligar o som e a letra I, e traçar o U. / E do sorriso:  | palavra trocada (“i” → “e”) | `falas/sofia-15jw11t.mp3` |
| sofia | Iiiii, um sorriso grande. Sua vez, | E um sorriso grande. Sua vez. / E um sorriso grande. Sua vez | começo seco; palavra trocada (“i” → “e”) | `falas/sofia-n7w6f5.mp3` |
| sofia | Iiiii. | Iiii! | começo seco; volume fora da média | `falas/sofia-1uqg4ej.mp3` |
| sofia | Iiiii. | E | começo seco; palavra trocada (“i” → “e”); volume fora da média | `falas/sofia-1ur4023.mp3` |
| sofia | Iiiii… ilha! | Iiiih, ihá! | clipping; sílaba faltando no começo (“ilia” → “ia”); volume fora da média | `falas/sofia-11wcpy8.mp3` |
| sofia | Ioiô. | Yoyo | fim seco | `falas/sofia-1ur3a28.mp3` |
| sofia | Isso mesmo! Olhou a boca e acertou. | Isso mesmo, olhou a boca e acertou. | começo seco | `falas/sofia-1qfo6l6.mp3` |
| sofia | Isso! Uma cobrinha: S, de sapo! | Isso! Uma cobrinha. S de sapo. | começo seco; clipping | `falas/sofia-1vj9k58.mp3` |
| sofia | Isso! Você abriu bem a boca: Aaaaa! | Isso! Você abriu bem a boca. Ah! | começo seco; clipping | `falas/sofia-94d8lq.mp3` |
| sofia | Isso! Você fez o som do seu nome! | Isso! Você fez o som do seu nome! | começo seco | `falas/sofia-1lb8np7.mp3` |
| sofia | J, de jacaré | J de jacaré | começo seco | `falas/sofia-1uqgtjf.mp3` |
| sofia | Janela. | Janela | começo seco | `falas/sofia-9ryn7q.mp3` |
| sofia | L, de lua | É de luar / Ele de lua | começo seco; palavra trocada (“l” → “ele”); volume fora da média | `falas/sofia-1uqi87f.mp3` |
| sofia | L, de lua | Lei de Loire? | palavra trocada (“l” → “le”); palavra trocada (“lua” → “loire”) | `falas/sofia-1uraq2z.mp3` |
| sofia | L, de lua… lua! | É o de lua, lua | clipping; palavra trocada (“l” → “e o”) | `falas/sofia-1asmjqs.mp3` |
| sofia | L. Ligar a letra L ao som l e ler lua e mala. | L. Ligar a letra L ao som L e ler lua e mala | começo seco | `falas/sofia-1owymw4.mp3` |
| sofia | Lala. | Lalá | começo seco; volume fora da média | `falas/sofia-1uqi5u3.mp3` |
| sofia | Lembra do som que veio da mata? M, de macaco… | Lembra do som que veio da mata? M de macaco | começo seco | `falas/sofia-2jcp79.mp3` |
| sofia | Lifu. | Lifu | começo seco | `falas/sofia-1uqicf1.mp3` |
| sofia | Lola. | Lola | começo seco; clipping; volume fora da média | `falas/sofia-1uqiakl.mp3` |
| sofia | Lufo. | LMAO / Lofo | começo seco; palavra trocada (“lufo” → “lofo”) | `falas/sofia-1uqifyz.mp3` |
| sofia | Lula. | Lula | começo seco | `falas/sofia-1uqig4f.mp3` |
| sofia | Lê a pedra e toca a figura, | Lê a pedra e toca a figura | começo seco; volume fora da média | `falas/sofia-kw8ej5.mp3` |
| sofia | Lê e toca a figura! | Lê e toca a figura | começo seco | `falas/sofia-1upok2n.mp3` |
| sofia | M, de macaco | M de macaco | começo seco | `falas/sofia-1uqj423.mp3` |
| sofia | M, de macaco | M de macaco | começo seco | `falas/sofia-1ur6zpn.mp3` |
| sofia | M, de macaco-Aaaaa… ma! | Em tema caçoa, má | começo seco | `falas/sofia-uovuvh.mp3` |
| sofia | M, de macaco… mala! | M de macaco. Mala | começo seco; clipping; volume fora da média | `falas/sofia-1cezx59.mp3` |
| sofia | M. Ligar a letra M ao som m e juntar ma, mo, mu. | tem se ligar a letra M ao som M e juntar ma mó mu / M se ligar a letra | começo seco; palavra trocada (“n” → “ten se”); volume fora da média | `falas/sofia-n0mlr6.mp3` |
| sofia | Macaco. | Macaco | começo seco | `falas/sofia-bv2fhl.mp3` |
| sofia | Mais uma tábua encaixou na ponte! | Mais uma tábua encaixou na ponte. | clipping; volume fora da média | `falas/sofia-104fnkb.mp3` |
| sofia | Mamãe. | Mamãe | começo seco | `falas/sofia-cy7ik.mp3` |
| sofia | Mesa. | Mesa | começo seco | `falas/sofia-1uqixox.mp3` |
| sofia | Mo. | Não! / Não! | começo seco; palavra trocada (“mo” → “nao”); volume fora da média | `falas/sofia-rpt9k9.mp3` |
| sofia | Mola. | Mola. | começo seco; volume fora da média | `falas/sofia-1uqiz38.mp3` |
| sofia | Mua. | Muah | começo seco | `falas/sofia-1qah46q.mp3` |
| sofia | Mula. | Mula | começo seco; sem respiro no fim | `falas/sofia-1ur76v2.mp3` |
| sofia | Mão. | Mão | começo seco; volume fora da média | `falas/sofia-1qah0h6.mp3` |
| sofia | N, de navio | em, o navio / É, de navio | começo seco; palavra trocada (“n” → “e”) | `falas/sofia-1uqjt6z.mp3` |
| sofia | O Bolota falou bem devagar. Junta comigo: bo… la… bola! | O bola tá falado bem devagar. Junta comigo. Bo-la! Bola! | clipping | `falas/sofia-x25bp3.mp3` |
| sofia | O barco do Bolota chegou na Ilha das Vogais! | O barco do Bolota chegou na ilha das vogais! | clipping | `falas/sofia-1x59zbf.mp3` |
| sofia | Olha a minha boca antes de responder, | Olhe pra minha boca antes de responder. / Olhe na minha boca antes de  | palavra trocada (“olia a” → “olie na”) | `falas/sofia-fkfjyi.mp3` |
| sofia | Olha minha boca. | Olha a minha boca / Olha a minha boca | sobrando “a” | `falas/sofia-18vvjz7.mp3` |
| sofia | Olha, eu te mostro. É esta aqui! | Olha, eu te mostro. É esta aqui | começo seco | `falas/sofia-15ak9x9.mp3` |
| sofia | Ooooo. | Ah... / [efeito sonoro] | começo seco; palavra trocada (“o” → “efeto sonoro”); volume fora da média | `falas/sofia-1uqkiiz.mp3` |
| sofia | Os dois são O. Sua vez, | Os dois são, ó, suave / Os dois são ó, suave | sílaba faltando no fim (“sua ves” → “suave”); volume fora da média | `falas/sofia-1fm95sq.mp3` |
| sofia | Ovo. | Ou vou | começo seco; fim seco | `falas/sofia-1qah5r1.mp3` |
| sofia | Qual começa com F, de foca? | Qual começa com F de foca? | clipping | `falas/sofia-1ol7foe.mp3` |
| sofia | Qual começa com o som? | Qual começa com o som | clipping | `falas/sofia-f89vmo.mp3` |
| sofia | Que sorriso! Iiiii! | Que sorriso! Ih | clipping | `falas/sofia-7etlc3.mp3` |
| sofia | R, de rato | É de rato / É de rato | sem respiro no fim; clipping; palavra trocada (“r” → “e”) | `falas/sofia-rdgy2.mp3` |
| sofia | Rato. | Rato. | clipping; volume fora da média | `falas/sofia-1uqz077.mp3` |
| sofia | S, de sapo | S de sapo. | começo seco; volume fora da média | `falas/sofia-1uqzgsr.mp3` |
| sofia | S, de sapo… sapo! | Este sapo. Sapo | palavra trocada (“s de” → “este”) | `falas/sofia-1docthd.mp3` |
| sofia | Sa. | Sá. | clipping; volume fora da média | `falas/sofia-rpta49.mp3` |
| sofia | Sacola. | Sacola. | começo seco | `falas/sofia-q10ct4.mp3` |
| sofia | Sapato. | Sapato | começo seco | `falas/sofia-q0ov03.mp3` |
| sofia | Sem o farol agora. Qual som começa a palavra, | Sem o Farol agora. Qual som começa a palavra? | começo seco | `falas/sofia-d85eqb.mp3` |
| sofia | Sim. | Sim | começo seco | `falas/sofia-1qaib6k.mp3` |
| sofia | Sol. | Sol. | começo seco; volume fora da média | `falas/sofia-1qahm4b.mp3` |
| sofia | Solta devagar… | Solta devagar | começo seco | `falas/sofia-1k6uvwq.mp3` |
| sofia | Som e nome das vogais. Reconhecer as 5 vogais misturadas. | Som e nome das vogais. Reconhecer as cinco vogais misturadas. | começo seco | `falas/sofia-qb8apk.mp3` |
| sofia | Suco. | Suco | começo seco | `falas/sofia-1uqzlfl.mp3` |
| sofia | Ta. | Tá! | clipping; volume fora da média | `falas/sofia-rpta5a.mp3` |
| sofia | Tatu. | Tatu! | clipping; volume fora da média | `falas/sofia-1ur0mqn.mp3` |
| sofia | Tenho um fio que faz F, de foca! | Tem um filtro que faz selfie de foca. / Tem um fio que faz F de foca | sílaba faltando no fim (“tenio” → “ten”) | `falas/sofia-24dqt2.mp3` |
| sofia | Terminam igual! Você achou a rima! | Terminam igual, você achou a rima! | clipping | `falas/sofia-9jci8e.mp3` |
| sofia | U ou O, | Tu tu / Oh, oh, oh | começo seco; palavra trocada (“u o o” → “tu tu”) | `falas/sofia-o4xcnb.mp3` |
| sofia | Uma palma para cada pedacinho do nome. | Uma palma para cada pedacinho do nome. | clipping | `falas/sofia-1gniec9.mp3` |
| sofia | Uuuuu. | Au! / Uou! | começo seco; palavra trocada (“u” → “au”); volume fora da média | `falas/sofia-1ur11zf.mp3` |
| sofia | Uuuuu. | [música de introdução] | começo seco; palavra trocada (“u” → “musika de introdukao”); volume fora da média | `falas/sofia-1uroxmz.mp3` |
| sofia | V, de vaca | O de vaca / Vê, devagar | sem respiro no fim; palavra trocada (“v” → “o”); volume fora da média | `falas/sofia-1ur1r4b.mp3` |
| sofia | Vo. | Vou! | clipping; volume fora da média | `falas/sofia-rpta6q.mp3` |
| sofia | X, de xícara | Xis de chave / X de chave | começo seco; palavra trocada (“xikara” → “xave”) | `falas/sofia-1uqr763.mp3` |
| sofia | mão… pão. Também terminam igual! | Mão, pão também terminam igual. | começo seco | `falas/sofia-csqcky.mp3` |
| sofia | o que rima com foca? | O que rima com foca? | começo seco | `falas/sofia-1ia5gbr.mp3` |
| sofia | vovÓ: a boca abre mais. Óóóóó. | Vovó, a porta abriu mais. Ó! / Vovó, a boca abre mais. Ôpa | palavra trocada (“o” → “opa”) | `falas/sofia-1o64pg2.mp3` |
| sofia | vovÓ: a boca abre mais. Óóóóó. | Vovó, a boca abre mais. Abre! | clipping; palavra trocada (“o” → “abre”) | `falas/sofia-1vrnlcx.mp3` |
| sofia | Ééééé… pé! | E pá! | clipping; palavra trocada (“pe” → “pa”) | `falas/sofia-16f73ud.mp3` |
| sofia | Êêêêê. | É... | começo seco; volume fora da média | `falas/sofia-1ut4c5n.mp3` |
| sofia | Ôôôôô. | Uh-oh / [uivo] | começo seco; sobrando “u” | `falas/sofia-1uttnnv.mp3` |
| sofia | Ôôôôô. | [canto] | começo seco; palavra trocada (“o” → “kanto”) | `falas/sofia-1uug6mj.mp3` |
| sofia | Õõõõõ. | Ah! Ah! / Uou! | começo seco; palavra trocada (“o” → “uo”) | `falas/sofia-1utuq17.mp3` |
| sofia | óóóó | Se inscreva no nosso canal. / [silêncio] | mudo; palavra trocada (“o” → “silenkio”) | `falas/sofia-1utmzez.mp3` |
| sofia | Ũ. | Oh / Ô | começo seco; palavra trocada (“u” → “o”) | `falas/sofia-1uvr58r.mp3` |
| tales | A cachoeira tem pedras com sílabas… Amanhã a gente atravessa! | A cachoeira tem pedras com sílabas. Amanhã a gente atravessa. | fim seco | `falas/tales-1msyvae-v3.mp3` |
| tales | A tartaruga volta! Valeu, | A tartaruga volta! Valeu! | fim seco; fim cortado na gravação | `falas/tales-uu17m-v3.mp3` |
| tales | Aaaaa. | Ah! | fim seco; fim cortado na gravação | `falas/tales-1op814m-v3.mp3` |
| tales | Ahh, agora eu entendi! Obrigado, | Ah, agora eu entendi. Obrigado | fim seco; fim cortado na gravação | `falas/tales-1hox1tq-v3.mp3` |
| tales | Amanhã o Davi vem com o pandeiro. Ele diz que as palavras têm pedacinh | Amanhã o Davi vem com o pandeiro. Ele diz que as palavras têm pedacinh | começo seco; sem respiro no fim | `falas/tales-gklppr-v3.mp3` |
| tales | Andar 1! Qual letra, | Andar 1. Qual letra? | fim seco; fim cortado na gravação | `falas/tales-770uid-v3.mp3` |
| tales | As quatro lanternas da festa acenderam! | As quatro lanternas da festa acenderam | começo seco | `falas/tales-1ew88z-v3.mp3` |
| tales | Bola… casa. | Bola, casa. | começo seco; sem respiro no fim | `falas/tales-1qshan4-v3.mp3` |
| tales | Bola… casa. | Bola. Casa | começo seco | `falas/tales-s5tfcw-v3.mp3` |
| tales | Bola… qual rima com bola? | Bola. Qual rima com bola? | começo seco | `falas/tales-1mo3es0-v3.mp3` |
| tales | Bo… la. | Bola | começo seco; sem respiro no fim | `falas/tales-1ei8zum-v3.mp3` |
| tales | Bá. | Opa! / Oba! | começo seco; sem respiro no fim; palavra trocada (“ba” → “oba”) | `falas/tales-1qh5ynp-v3.mp3` |
| tales | Dizer "vovó ou vovô?" e tocar o O. | dizer vovó ou vovô e tocar o ó | começo seco | `falas/tales-1qdh25w-v3.mp3` |
| tales | E eu sou o Tales! Seja bem-vinda na Vila das Letras, | E eu sou o Thales. Seja bem-vinda na Viva das Letras | palavra trocada (“vila” → “viva”) | `falas/tales-10xi3fj-v3.mp3` |
| tales | Esses são nomes de bichinhos da mata. Lê pra mim, | Esses são nomes de bichinhos da mata. Lê pra mim | fim seco; fim cortado na gravação | `falas/tales-1h06bnk-v3.mp3` |
| tales | F, de foca | F de foca | começo seco | `falas/tales-1ooevli-v3.mp3` |
| tales | F, de foca… | F de foca | começo seco; sem respiro no fim | `falas/tales-dihlow-v3.mp3` |
| tales | F, de foca… cadê o que começa com F, de foca? | F de foca. Cadê o que começa com F de foca? | começo seco; sem respiro no fim | `falas/tales-1op37y-v3.mp3` |
| tales | Falar Uuuuu e tocar o U. | Falar U e tocar o U | começo seco | `falas/tales-17ef5x0-v3.mp3` |
| tales | Falar o som das 5 vogais e tocar cada letra. | Falar o som das cinco vogais e tocar cada letra | começo seco | `falas/tales-uzc3z3-v3.mp3` |
| tales | Falar é de PÉ e tocar a letra E. | Falar é de pé e tocar a letra E | começo seco | `falas/tales-g7eut-v3.mp3` |
| tales | Foca… lua. | Foca lua | começo seco | `falas/tales-owz81v-v3.mp3` |
| tales | Gato… qual rima com gato? | Gato. Qual rima com gato? | começo seco; fim seco; fim cortado na gravação | `falas/tales-16g88uo-v3.mp3` |
| tales | Ginga. | Ginga | começo seco | `falas/tales-dhyu8g-v3.mp3` |
| tales | Gooool! Você leu! | Gol! Você leu! | começo seco | `falas/tales-1xf18nl-v3.mp3` |
| tales | Isso! Uma palma para cada pedacinho! | Isso! Uma palma para cada pedacinho | começo seco; fim seco | `falas/tales-dh7w4u-v3.mp3` |
| tales | Isso! Você me entendeu! | É isso. Você me entendeu? | começo seco; sobrando “e” | `falas/tales-hohrig-v3.mp3` |
| tales | Janela. | Janela | começo seco | `falas/tales-rgnjzv-v3.mp3` |
| tales | Janela… panela. | Janela, panela | começo seco | `falas/tales-ke5ywa-v3.mp3` |
| tales | Janela… panela. | Janela, panela | começo seco; fim seco | `falas/tales-1rhvgay-v3.mp3` |
| tales | Janela… qual rima com janela? | Janela? Qual rima com janela | começo seco; volume fora da média | `falas/tales-iv3ocw-v3.mp3` |
| tales | L, de lua | L de lua | começo seco | `falas/tales-1opdcs6-v3.mp3` |
| tales | L, de lua, a língua sobe e fica lá. Sua vez, | L de lua. A língua sobe e fica lá. Sua vez | começo seco; fim seco; fim cortado na gravação | `falas/tales-1n03vx1-v3.mp3` |
| tales | Ler lua e mala em voz alta. | Ler Lua e Mala em voz alta | começo seco | `falas/tales-1vpwe98-v3.mp3` |
| tales | M faz M, de macaco! | M faz M, de macaco | começo seco | `falas/tales-kl8qjr-v3.mp3` |
| tales | M, de macaco… | M de macaco | começo seco; sem respiro no fim | `falas/tales-dribf4-v3.mp3` |
| tales | Macaco. | Macaco | começo seco | `falas/tales-s420wk-v3.mp3` |
| tales | Mala… macaco. | Mala, macaco | fim seco | `falas/tales-1csyzcj-v3.mp3` |
| tales | Mala… macaco. | Mala. Macaco | começo seco; fim seco | `falas/tales-dbtjo3-v3.mp3` |
| tales | Ma… ca… co | Ma-ca-co | começo seco; sem respiro no fim | `falas/tales-1i4ai9g-v3.mp3` |
| tales | Me escuta, | Me escuta | fim seco; fim cortado na gravação | `falas/tales-1aretmv-v3.mp3` |
| tales | Mexe quando ouvir M, de macaco, | Mexe quando ouvir M de macaco | começo seco | `falas/tales-mqk8uw-v3.mp3` |
| tales | Mão… pão. | Mão, pão | começo seco | `falas/tales-vpoc0d-v3.mp3` |
| tales | O Paçoca escondeu tudo que começa com F, de foca. Bora, | O Paçoca escondeu tudo que começa com F de foca. Bora | fim seco; fim cortado na gravação | `falas/tales-1kbg9i-v3.mp3` |
| tales | O eco falou! Qual letra, | O eco falou! Qual letra | fim seco; fim cortado na gravação | `falas/tales-y49e3v-v3.mp3` |
| tales | O farol acendeu e a luz varreu o mar até a mata! | O farol acendeu e a luz varreu o mar até a mata | fim seco | `falas/tales-1fc9pza-v3.mp3` |
| tales | O que não é da praia? | O que não é da praia? | fim seco | `falas/tales-fm8wci-v3.mp3` |
| tales | Oi, | Oi | fim seco; fim cortado na gravação | `falas/tales-1u8198-v3.mp3` |
| tales | Olha só o que chegou para você, | Olha só o que chegou para você | começo seco; fim seco; fim cortado na gravação | `falas/tales-ykgnjz-v3.mp3` |
| tales | Ops! Eu acho que esse som é do A… Me ensina? | Ops, eu acho que esse som é do... ah... Menino! / Ops, eu acho que ess | palavra trocada (“me ensina” → “menino”) | `falas/tales-106uhle-v3.mp3` |
| tales | Ops! Eu disse que bola rima com mesa. Me ensina, | Ops! Eu disse que bola rima com mesa. Me ensina | fim seco; fim cortado na gravação | `falas/tales-11uigd6-v3.mp3` |
| tales | Ouviu isso, | Ouviu isso? | fim seco; fim cortado na gravação | `falas/tales-12hica4-v3.mp3` |
| tales | Passa a bola, | Faça a bola | fim seco; fim cortado na gravação; palavra trocada (“pasa” → “faka”) | `falas/tales-56w7zf-v3.mp3` |
| tales | Pega a lupa! O que mais começa com o som do seu nome, | Pega a lupa! O que mais começa com o som do seu nome? | fim seco | `falas/tales-vqtbwl-v3.mp3` |
| tales | R, de rato | R de rato | começo seco | `falas/tales-da9dqv-v3.mp3` |
| tales | S, de sapo | S de sapo. | começo seco | `falas/tales-1oo57au-v3.mp3` |
| tales | S, de sapo… | S de sapo | começo seco | `falas/tales-d9mbww-v3.mp3` |
| tales | Sapo. | Sapo | começo seco | `falas/tales-1oo4w7v-v3.mp3` |
| tales | Sapo… lua. | Sapo. Lua. | começo seco | `falas/tales-1hhid9h-v3.mp3` |
| tales | Sapo… lua. | Sapo. Lua | começo seco | `falas/tales-12fyyit-v3.mp3` |
| tales | Sapo… mala. | Sapo Mala | começo seco; sem respiro no fim | `falas/tales-1ob5zp8-v3.mp3` |
| tales | Sapo… mala. | Sapo? Mala | começo seco | `falas/tales-1p45oik-v3.mp3` |
| tales | Sapo… sol. | Sapo, sol. | começo seco | `falas/tales-1hhi94d-v3.mp3` |
| tales | Sapo… sol. | Sapo, sol | começo seco | `falas/tales-12fyudp-v3.mp3` |
| tales | Sol. | So / So | começo seco; sílaba faltando no fim (“sol” → “so”) | `falas/tales-1u6p0m-v3.mp3` |
| tales | Sorriso aberto: Ééééé. Sua vez, | Sorriso aberto. Ééé. Sua vez | começo seco; fim seco; fim cortado na gravação | `falas/tales-p3edc6-v3.mp3` |
| tales | Uma palma para cada pedacinho. | Uma palma para cada pedacinho | fim seco | `falas/tales-190ush2-v3.mp3` |
| tales | Uuuuu, biquinho de assobio. Sua vez, | Uuuu, biquinho de assobio. Sua vez | fim seco; fim cortado na gravação | `falas/tales-lm240i-v3.mp3` |
| tales | V, de vaca | V de vaca | começo seco | `falas/tales-1oo2wza-v3.mp3` |
| tales | Você me ensinou! Valeu, | Você me ensinou. Valeu | fim seco; sem respiro no começo; fim cortado na gravação | `falas/tales-11hrnf1-v3.mp3` |
| tales | Vovó. | Vovó | começo seco; sem respiro no fim | `falas/tales-1oo2wve-v3.mp3` |
| tales | X, de xícara | Xis, de chave. / X de chave | começo seco; palavra trocada (“xikara” → “xave”) | `falas/tales-1ooggl2-v3.mp3` |
| tales | Z, de zebra | Z, de zebra. | começo seco | `falas/tales-1oobvxy-v3.mp3` |
| tales | bola… qual rima com bola? | Bola  Qual rima com bola? | fim seco; sem respiro no começo | `falas/tales-85r3ao-v3.mp3` |
| tales | gato… qual rima com gato? | Gato Qual rima com gato? | começo seco; fim seco; fim cortado na gravação | `falas/tales-bw2yi8-v3.mp3` |
| tales | janela… qual rima com janela? | Janela? Qual rima com janela | começo seco | `falas/tales-m07mcw-v3.mp3` |
| tales | ma… ca… co | macaco | começo seco; sem respiro no fim | `falas/tales-1msmtjo-v3.mp3` |
| tales | ma… la… Eu vou rápido demais e erro! | Ma... la... Eu vou rápido demais e erro! | começo seco | `falas/tales-1o59bxv-v3.mp3` |
| tales | mo… la! Monta e o gol vale! | Mola! Multa e o Gol Vale | começo seco; palavra trocada (“mo la monta” → “mola multa”) | `falas/tales-1q9sxiu-v3.mp3` |
| tales | pi… po… ca! Uma batida para cada pedacinho. | Pipoca Uma batida para cada pedacinho | sem respiro no fim; clipping | `falas/tales-8atrrd-v3.mp3` |
| tales | vovÔ: a boca fecha mais, redondinha. Ôôôôô. | Vovô, a boca fecha mais, redondinha. Ôôô | começo seco; sem respiro no fim | `falas/tales-nhro9y-v3.mp3` |
| tales | vovÔ: a boca fecha mais, redondinha. Ôôôôô. | Vovô, a bota fecha mais, redondinha. Ôôô | começo seco; palavra trocada (“boka” → “bota”) | `falas/tales-1sykr1u-v3.mp3` |
| tales | É ou ê? Repara no meu sorriso. Sua vez, | É! Ou é! Repara no meu sorriso. Sua vez! | fim seco; fim cortado na gravação | `falas/tales-18yq1gc-v3.mp3` |
| tales | Êêêêê. | É | começo seco | `falas/tales-1olu6ba-v3.mp3` |
| tales | Óóóóó. | Oh! | começo seco; sem respiro no fim | `falas/tales-1olbj1y-v3.mp3` |
| tales | Óóóóó. | Oh! | fim seco | `falas/tales-1om9yd2-v3.mp3` |
| sofia | ana | Anna | começo seco | `nomes/sofia/ana.mp3` |
| sofia | antonella | Antonella | começo seco | `nomes/sofia/antonella.mp3` |
| sofia | arthur | Arthur | começo seco | `nomes/sofia/arthur.mp3` |
| sofia | augusto | Augusto | começo seco | `nomes/sofia/augusto.mp3` |
| sofia | benjamin | Benjamin | começo seco | `nomes/sofia/benjamin.mp3` |
| sofia | bianca | Bianca | clipping | `nomes/sofia/bianca.mp3` |
| sofia | breno | Preno | clipping; volume fora da média | `nomes/sofia/breno.mp3` |
| sofia | bryan | Brian | clipping | `nomes/sofia/bryan.mp3` |
| sofia | cecilia | Cecília | começo seco; volume fora da média | `nomes/sofia/cecilia.mp3` |
| sofia | davi | Davi | começo seco | `nomes/sofia/davi.mp3` |
| sofia | enrico | É rico | clipping; volume fora da média | `nomes/sofia/enrico.mp3` |
| sofia | fernando | Fernando | clipping; volume fora da média | `nomes/sofia/fernando.mp3` |
| sofia | gael | Gael | começo seco | `nomes/sofia/gael.mp3` |
| sofia | gustavo | Gustavo | clipping; volume fora da média | `nomes/sofia/gustavo.mp3` |
| sofia | helena | Helena | sem respiro no começo; clipping | `nomes/sofia/helena.mp3` |
| sofia | heloisa | Hello Isa | clipping | `nomes/sofia/heloisa.mp3` |
| sofia | isis | Esis | começo seco; nome errado (“isis” → “esis”) | `nomes/sofia/isis.mp3` |
| sofia | joaquim | Joaquim | começo seco | `nomes/sofia/joaquim.mp3` |
| sofia | josue | Josué | começo seco; volume fora da média | `nomes/sofia/josue.mp3` |
| sofia | julia | Júlia | começo seco; clipping; volume fora da média | `nomes/sofia/julia.mp3` |
| sofia | lara | Lara | começo seco; volume fora da média | `nomes/sofia/lara.mp3` |
| sofia | lavinia | Lavínia | começo seco | `nomes/sofia/lavinia.mp3` |
| sofia | lis | Liz | começo seco | `nomes/sofia/lis.mp3` |
| sofia | livia | Lívia | começo seco | `nomes/sofia/livia.mp3` |
| sofia | liz | Liz | começo seco; clipping | `nomes/sofia/liz.mp3` |
| sofia | malu | Malu | começo seco | `nomes/sofia/malu.mp3` |
| sofia | manuela | Manuela | começo seco; clipping; volume fora da média | `nomes/sofia/manuela.mp3` |
| sofia | mariah | Maria | sem respiro no começo; clipping; volume fora da média | `nomes/sofia/mariah.mp3` |
| sofia | matteo | Mateo | clipping | `nomes/sofia/matteo.mp3` |
| sofia | pedro | Pedro | clipping | `nomes/sofia/pedro.mp3` |
| sofia | rafael | Rafael | sem respiro no começo; clipping; volume fora da média | `nomes/sofia/rafael.mp3` |
| sofia | rafaela | Rafaela | clipping | `nomes/sofia/rafaela.mp3` |
| sofia | ravi | Ravi | sem respiro no começo; clipping; volume fora da média | `nomes/sofia/ravi.mp3` |
| sofia | ryan | Ryan | começo seco | `nomes/sofia/ryan.mp3` |
| sofia | samuel | Samuel | começo seco | `nomes/sofia/samuel.mp3` |
| sofia | sarah | Sarah | começo seco | `nomes/sofia/sarah.mp3` |
| sofia | sofia | Sofia | começo seco | `nomes/sofia/sofia.mp3` |
| sofia | zoe | Zoe | sem respiro no começo; clipping | `nomes/sofia/zoe.mp3` |
| tales | breno | Breno | começo seco | `nomes/tales/breno.mp3` |
| tales | daniela | Daniela | começo seco | `nomes/tales/daniela.mp3` |
| tales | elisa | Elisa | fim seco | `nomes/tales/elisa.mp3` |
| tales | enrico | [falando em mandarim] | começo seco; fim seco; fim cortado na gravação; nome errado (“enriko” → “falando en mandarin”) | `nomes/tales/enrico.mp3` |
| tales | gabriela | Gabriela | começo seco | `nomes/tales/gabriela.mp3` |
| tales | gabrielly | Gabriele | começo seco | `nomes/tales/gabrielly.mp3` |
| tales | gael | Gael | começo seco | `nomes/tales/gael.mp3` |
| tales | joao | João | começo seco | `nomes/tales/joao.mp3` |
| tales | joaquim | Joaquim | começo seco | `nomes/tales/joaquim.mp3` |
| tales | jose | José | começo seco | `nomes/tales/jose.mp3` |
| tales | josue | Josué | começo seco | `nomes/tales/josue.mp3` |
| tales | julia | Júlia | começo seco | `nomes/tales/julia.mp3` |
| tales | laura | Laura | começo seco | `nomes/tales/laura.mp3` |
| tales | livia | Olívia | começo seco | `nomes/tales/livia.mp3` |
| tales | noah | Não, ó! | começo seco; nome errado (“noa” → “nao o”) | `nomes/tales/noah.mp3` |
| tales | samuel | Samuel | começo seco; sem respiro no fim | `nomes/tales/samuel.mp3` |
| tales | sarah | Sara | começo seco | `nomes/tales/sarah.mp3` |
| tales | sofia | Sofia | começo seco | `nomes/tales/sofia.mp3` |
| tales | valentina | Valentina | começo seco | `nomes/tales/valentina.mp3` |
| tales | vitoria | Vitória! | começo seco | `nomes/tales/vitoria.mp3` |
| tales | yasmin | E Jasmine? | começo seco; nome errado (“iasmin” → “e jasmine”) | `nomes/tales/yasmin.mp3` |
| tales | zoe | Zoe! | começo seco | `nomes/tales/zoe.mp3` |

## A conferir de ouvido (palavras, sílabas e sons soltos)

| Voz | Texto esperado | Ouvido | Arquivo |
|---|---|---|---|
| sofia | Aaaaa. | [efeito sonoro] | `falas/sofia-1ur9zd7.mp3` |
| sofia | Bo. | Bom! / Pó! | `falas/sofia-rpt9om.mp3` |
| sofia | Bolota. | Bolacha / Palata | `falas/sofia-ezk40g.mp3` |
| sofia | Bo… la. | Pula / Pó lá | `falas/sofia-jt7slp.mp3` |
| sofia | Bo… la. | Pu-la | `falas/sofia-138awz1.mp3` |
| sofia | Co. | So, / Tchau! | `falas/sofia-rpt9pj.mp3` |
| sofia | Eeeee. | Hum. / Ãhn | `falas/sofia-1uqp3d7.mp3` |
| sofia | Fo. | Fu! / Fu! | `falas/sofia-rpt9s2.mp3` |
| sofia | Folu. | Follow / Follow | `falas/sofia-1uqpmxn.mp3` |
| sofia | Gin. | Quem / Quem? | `falas/sofia-1qahbzf.mp3` |
| sofia | Iglu. | Igloo / Íglo | `falas/sofia-1uqfwe4.mp3` |
| sofia | Ilha. | IA / E aí? | `falas/sofia-1uqg207.mp3` |
| sofia | Ja. | É? / Yeah | `falas/sofia-rpt9hc.mp3` |
| sofia | Les. | Lê / Lei | `falas/sofia-1qah2up.mp3` |
| sofia | Lhá. | Lá / Lá | `falas/sofia-1qah37y.mp3` |
| sofia | Lo. | Não / Não | `falas/sofia-rpt9jc.mp3` |
| sofia | Pai. | Vai / Bye | `falas/sofia-1qahjqr.mp3` |
| sofia | Pe. | Ei / Ei! | `falas/sofia-rpta1q.mp3` |
| sofia | Pi. | Pai / Bye! | `falas/sofia-rpta1e.mp3` |
| sofia | Po. | Hã? / Pá! | `falas/sofia-rpta1g.mp3` |
| sofia | Pá. | Dê / E aí? | `falas/sofia-rpta56.mp3` |
| sofia | Te. | Dê / E aí? | `falas/sofia-rpta56.mp3` |
| sofia | Tá. | Ei / Ei! | `falas/sofia-rpta1q.mp3` |
| sofia | agatha | É, Agatha | `nomes/sofia/agatha.mp3` |
| sofia | benicio | Vinícius | `nomes/sofia/benicio.mp3` |
| sofia | laura | Nora? | `nomes/sofia/laura.mp3` |
| sofia | nicolas | Nicola | `nomes/sofia/nicolas.mp3` |
| sofia | theo | Dior? | `nomes/sofia/theo.mp3` |
| sofia | Ããããã. | Hum / Oh! | `falas/sofia-1utb0sr.mp3` |
| sofia | Ééééé. | [grito] | `falas/sofia-1utrih7.mp3` |
| sofia | Êêêêê. | [efeito sonoro] | `falas/sofia-1utquq3.mp3` |
| sofia | Óóóóó… vovó! | Uou! Vovó | `falas/sofia-hbnus0.mp3` |
| tales | Avião. | Aviel | `falas/tales-do7an8-v3.mp3` |
| tales | Cá. | Já / Tá. | `falas/tales-1qh5yms-v3.mp3` |
| tales | Lhá. | É! / Yeah! | `falas/tales-1u7b6b-v3.mp3` |
| tales | Peteca. | Eteca | `falas/tales-fo8l8w-v3.mp3` |
| tales | Uuuuu. | Oh! | `falas/tales-1oot2uu-v3.mp3` |
| tales | caua | 高啊。 | `nomes/tales/caua.mp3` |
| tales | eloa | E lua? | `nomes/tales/eloa.mp3` |
| tales | henry | Angry | `nomes/tales/henry.mp3` |
| tales | igor | Игорь | `nomes/tales/igor.mp3` |
| tales | kaua | Tower | `nomes/tales/kaua.mp3` |
| tales | liz | Please | `nomes/tales/liz.mp3` |
| tales | luan | Lua | `nomes/tales/luan.mp3` |
| tales | luna | Lona | `nomes/tales/luna.mp3` |
| tales | nicole | Nicole Ali | `nomes/tales/nicole.mp3` |
| tales | pietra | E é outra | `nomes/tales/pietra.mp3` |
| tales | raul | How? | `nomes/tales/raul.mp3` |
| tales | ryan | Raem? | `nomes/tales/ryan.mp3` |
| tales | theo | Teu | `nomes/tales/theo.mp3` |
| tales | Õõõõõ. | Uh! / Uuuuh! | `falas/tales-1oldara-v3.mp3` |
| tales | Ũ. | Hum / Hum. | `falas/tales-1ou2r3q-v3.mp3` |

## Sem transcrição (0)

Clipes cujo conteúdo ainda NÃO foi conferido por transcrição (rodar a auditoria de novo quando houver cota):

—
