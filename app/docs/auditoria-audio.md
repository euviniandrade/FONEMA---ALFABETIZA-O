# Auditoria dos clipes de voz

Gerado por `ferramentas/auditar-audio.py`. Regra (D027 §2): **nenhum áudio vai ao ar sem esta auditoria**.

- Clipes auditados: **1037** (747 falas + 290 nomes; vozes Sofia e Tales)
- Graves (defeito audível provável): **33** · a conferir de ouvido (palavra/som solto com transcrição diferente): **66** · leves (higiene do sinal): **0** · sem defeito: **938**
- Conteúdo conferido por transcrição: **1037** clipes · **sem transcrição: 0** (só o sinal foi conferido nesses)
- Volume (clipes ≥ 0,4 s): mediana -17.4 LUFS, de -22.8 a -14.6 (alvo -16)

## Defeitos por tipo

| Tipo | Antes | Agora |
|---|---|---|
| começo seco | 184 | 0 |
| conteúdo: palavra trocada | 69 | 77 |
| volume fora da média | 135 | 0 |
| sem respiro no começo | 113 | 0 |
| sem respiro no fim | 69 | 0 |
| clipping | 63 | 2 |
| fim seco | 35 | 0 |
| fim cortado na gravação | 21 | 1 |
| conteúdo: nome errado | 16 | 5 |
| conteúdo: sílaba faltando no fim | 6 | 6 |
| conteúdo: sílaba faltando no começo | 4 | 5 |
| conteúdo: sobrando | 5 | 3 |
| conteúdo: transcrição vazia | 2 | 1 |
| mudo | 1 | 0 |
| conteúdo: sílaba faltando no meio | 0 | 1 |

Antes: 275 graves, 52 a conferir e 188 leves em 915 clipes (915 com transcrição).

Critérios: começo/fim seco = RMS dos 25 ms das pontas acima de −30 dBFS; curto demais = menos de 55 ms por caractere falado; volume fora = mais de 4 dB da mediana da voz; clipping = 8+ amostras no teto ou onda achatada; fim cortado na gravação = o arquivo bruto do TTS acaba em plena fala (sem a queda da voz); conteúdo = transcrição automática (Gemini e, como segunda opinião, ElevenLabs Scribe; basta uma bater) comparada ao texto enviado ao TTS, por chave fonética (ignora caixa, pontuação e grafia). Sílabas e sons soltos têm transcrição pouco confiável: conferir de ouvido.

## Clipes graves

| Voz | Texto esperado | Ouvido | Problemas | Arquivo |
|---|---|---|---|---|
| sofia | Devagar: M, de macaco-Aaaaa, ma. L, de lua-Aaaaa, la. mala! | Devagar, hem, de macaco ama. Ele de lua ala, mala | palavra trocada (“n” → “en”); palavra trocada (“a ma l” → “ama ele”) | `falas/sofia-guzzxu-m1.mp3` |
| sofia | E: é e ê. Ligar os sons é e ê à letra E. | É, iê! Liga os sons é e iê à letra E. / I, E e E. Ligar os sons E e E  | palavra trocada (“e” → “i”) | `falas/sofia-1svhpmb-m1.mp3` |
| sofia | I do sorriso. Ligar o som i à letra I e traçar o I. | E do S o riso, ligar o som e a letra I, e traçar o U. / E do sorriso:  | palavra trocada (“i” → “e”) | `falas/sofia-15jw11t-m1.mp3` |
| sofia | I, de ilha. | E dele | palavra trocada (“i de ilia” → “e dele”) | `falas/sofia-1qncf0t-m1.mp3` |
| sofia | Iiiii, um sorriso grande. Sua vez, | E um sorriso grande. Sua vez. / E um sorriso grande. Sua vez | palavra trocada (“i” → “e”) | `falas/sofia-n7w6f5-m1.mp3` |
| sofia | K, de kiwi. | Cadê Kiwi? | palavra trocada (“k de” → “kade”) | `falas/sofia-1wuhvy7-m1.mp3` |
| sofia | L, de lua | É de luar / Ele de lua | palavra trocada (“l” → “ele”) | `falas/sofia-1uqi87f-m1.mp3` |
| sofia | L, de lua | Lei de Loire? | palavra trocada (“l” → “le”); palavra trocada (“lua” → “loire”) | `falas/sofia-1uraq2z-m1.mp3` |
| sofia | L, de lua… lua! | É o de lua, lua | palavra trocada (“l” → “e o”) | `falas/sofia-1asmjqs-m1.mp3` |
| sofia | M. Ligar a letra M ao som m e juntar ma, mo, mu. | tem se ligar a letra M ao som M e juntar ma mó mu / M se ligar a letra | palavra trocada (“n” → “ten se”) | `falas/sofia-n0mlr6-m1.mp3` |
| sofia | Mais uma tábua encaixou na ponte! | Mais uma tábua encaixou na ponte. | clipping | `falas/sofia-104fnkb-m1.mp3` |
| sofia | N, de navio | em, o navio / É, de navio | palavra trocada (“n” → “e”) | `falas/sofia-1uqjt6z-m1.mp3` |
| sofia | O Q vem sempre com o U. | O que vem sempre com o U | palavra trocada (“k” → “ke”) | `falas/sofia-gsjide-m1.mp3` |
| sofia | Olha a minha boca antes de responder, | Olhe pra minha boca antes de responder. / Olhe na minha boca antes de  | palavra trocada (“olia a” → “olie na”) | `falas/sofia-fkfjyi-m1.mp3` |
| sofia | Olha minha boca. | Olha a minha boca / Olha a minha boca | sobrando “a” | `falas/sofia-18vvjz7-m1.mp3` |
| sofia | R, de rato | É de rato / É de rato | palavra trocada (“r” → “e”) | `falas/sofia-rdgy2-m1.mp3` |
| sofia | S, de sapo. | É CD запо | palavra trocada (“s de sapo” → “e kd”) | `falas/sofia-ff5ofq-m1.mp3` |
| sofia | S, de sapo… sapo! | Este sapo. Sapo | palavra trocada (“s de” → “este”) | `falas/sofia-1docthd-m1.mp3` |
| sofia | Tenho um fio que faz F, de foca! | Tem um filtro que faz selfie de foca. / Tem um fio que faz F de foca | sílaba faltando no fim (“tenio” → “ten”) | `falas/sofia-24dqt2-m1.mp3` |
| sofia | U ou O, | Uóuou! | sílaba faltando no fim (“u o o” → “uo”) | `falas/sofia-o4xcnb-r2-m1.mp3` |
| sofia | V, de vaca | O de vaca / Vê, devagar | palavra trocada (“v” → “o”) | `falas/sofia-1ur1r4b-m1.mp3` |
| sofia | Você está pronta para conhecer as letras? | Você está pronta pra conhecer as letras? | palavra trocada (“para” → “pra”) | `falas/sofia-1jqjx0n-m1.mp3` |
| sofia | Você está pronto para conhecer as letras? | Você está pronto pra conhecer as letras? | palavra trocada (“para” → “pra”) | `falas/sofia-19cp63t-m1.mp3` |
| sofia | X, de xícara | Xis de chave / X de chave | palavra trocada (“xikara” → “xave”) | `falas/sofia-1uqr763-m1.mp3` |
| sofia | vovó: a boca abre mais. Óóóóó. | Vovó, a porta abriu mais. Ó! / Vovó, a boca abre mais. Ôpa | palavra trocada (“o” → “opa”) | `falas/sofia-1o64pg2-m1.mp3` |
| sofia | vovó: a boca abre mais. Óóóóó. | Vovó, a boca abre mais. Abre! | palavra trocada (“o” → “abre”) | `falas/sofia-1vrnlcx-m1.mp3` |
| tales | E eu sou o Tales! Seja bem-vinda na Vila das Letras, | E eu sou o Thales. Seja bem-vinda na Viva das Letras | palavra trocada (“vila” → “viva”) | `falas/tales-10xi3fj-v3-m1.mp3` |
| tales | Isso! Você me entendeu! | É isso. Você me entendeu? | sobrando “e” | `falas/tales-hohrig-v3-m1.mp3` |
| tales | O eco falou! Qual letra, | O eco falou: qual letra | fim cortado na gravação | `falas/tales-y49e3v-v3-r2-m1.mp3` |
| tales | X, de xícara | Xis, de chave. / X de chave | palavra trocada (“xikara” → “xave”) | `falas/tales-1ooggl2-v3-m1.mp3` |
| tales | mo… la! Monta e o gol vale! | Mola! Multa e o Gol Vale | palavra trocada (“mo la monta” → “mola multa”) | `falas/tales-1q9sxiu-v3-m1.mp3` |
| tales | vovô: a boca fecha mais, redondinha. Ôôôôô. | Vovô, a bota fecha mais, redondinha. Ôôô | palavra trocada (“boka” → “bota”) | `falas/tales-1sykr1u-v3-m1.mp3` |
| sofia | bryan | Brian | clipping | `nomes/sofia/bryan-m1.mp3` |

## A conferir de ouvido (palavras, sílabas e sons soltos)

| Voz | Texto esperado | Ouvido | Arquivo |
|---|---|---|---|
| sofia | Aaaaa. | [efeito sonoro] | `falas/sofia-1ur9zd7-m1.mp3` |
| sofia | Babá. | 爸爸 | `falas/sofia-1uqmowb-m1.mp3` |
| sofia | Bife. | Vice | `falas/sofia-1uqmi6b-m1.mp3` |
| sofia | Bo. | Bom! / Pó! | `falas/sofia-rpt9om-m1.mp3` |
| sofia | Bola. | Paula? | `falas/sofia-1ur9r57-m1.mp3` |
| sofia | Bolota. | Bolacha / Palata | `falas/sofia-ezk40g-m1.mp3` |
| sofia | Bo… la. | Pula / Pó lá | `falas/sofia-jt7slp-m1.mp3` |
| sofia | Bo… la. | Pu-la | `falas/sofia-138awz1-m1.mp3` |
| sofia | Cama. | Come on! | `falas/sofia-1uqnjlx-m1.mp3` |
| sofia | Ca… sa. | Tchau, tchau! / Xá, sá! | `falas/sofia-ki86cd-m1.mp3` |
| sofia | Co. | So, / Tchau! | `falas/sofia-rpt9pj-m1.mp3` |
| sofia | Eeeee. | Hum. / Ãhn | `falas/sofia-1uqp3d7-m1.mp3` |
| sofia | Fo. | Fu! / Fu! | `falas/sofia-rpt9s2-m1.mp3` |
| sofia | Folu. | Follow / Follow | `falas/sofia-1uqpmxn-m1.mp3` |
| sofia | Gin. | Quem / Quem? | `falas/sofia-1qahbzf-m1.mp3` |
| sofia | Gá. | Já / Já! | `falas/sofia-rpt9pp-m1.mp3` |
| sofia | Iglu. | Igloo / Íglo | `falas/sofia-1uqfwe4-m1.mp3` |
| sofia | Iiiii. | E | `falas/sofia-1ur4023-m1.mp3` |
| sofia | Iiiii… ilha! | Iiiih, ihá! | `falas/sofia-11wcpy8-m1.mp3` |
| sofia | Ilha. | IA / E aí? | `falas/sofia-1uqg207-m1.mp3` |
| sofia | Ja. | É? / Yeah | `falas/sofia-rpt9hc-m1.mp3` |
| sofia | Les. | Lê / Lei | `falas/sofia-1qah2up-m1.mp3` |
| sofia | Lhá. | Lá / Lá | `falas/sofia-1qah37y-m1.mp3` |
| sofia | Lo. | Não / Não | `falas/sofia-rpt9jc-m1.mp3` |
| sofia | Lufo. | LMAO / Lofo | `falas/sofia-1uqifyz-m1.mp3` |
| sofia | Mapa. | Maba | `falas/sofia-1uqj16e-m1.mp3` |
| sofia | Mo. | Não! / Não! | `falas/sofia-rpt9k9-m1.mp3` |
| sofia | Ooooo. | Ah... / [efeito sonoro] | `falas/sofia-1uqkiiz-m1.mp3` |
| sofia | Pai. | Vai / Bye | `falas/sofia-1qahjqr-m1.mp3` |
| sofia | Pe. | Ei / Ei! | `falas/sofia-rpta1q-m1.mp3` |
| sofia | Pi. | Pai / Bye! | `falas/sofia-rpta1e-m1.mp3` |
| sofia | Po. | Hã? / Pá! | `falas/sofia-rpta1g-m1.mp3` |
| sofia | Pá. | Dê / E aí? | `falas/sofia-rpta56-m1.mp3` |
| sofia | Rei. | Ei! | `falas/sofia-1qahlf9-m1.mp3` |
| sofia | Te. | Dê / E aí? | `falas/sofia-rpta56-m1.mp3` |
| sofia | Tá. | Ei / Ei! | `falas/sofia-rpta1q-m1.mp3` |
| sofia | Uuuuu. | Au! / Uou! | `falas/sofia-1ur11zf-m1.mp3` |
| sofia | Uuuuu. | [música de introdução] | `falas/sofia-1uroxmz-m1.mp3` |
| sofia | Yakisoba. | E a Kisuba? | `falas/sofia-1h2qlq-m1.mp3` |
| sofia | nicolas | Nicola | `nomes/sofia/nicolas-m1.mp3` |
| sofia | theo | Tchau! | `nomes/sofia/theo-r2-m1.mp3` |
| sofia | Ããããã. | Hum / Oh! | `falas/sofia-1utb0sr-m1.mp3` |
| sofia | Ééééé. | [grito] | `falas/sofia-1utrih7-m1.mp3` |
| sofia | Ééééé… pé! | E pá! | `falas/sofia-16f73ud-m1.mp3` |
| sofia | Êêêêê. | [efeito sonoro] | `falas/sofia-1utquq3-m1.mp3` |
| sofia | Óóóóó… vovó! | Uou! Vovó | `falas/sofia-hbnus0-m1.mp3` |
| sofia | Ôôôôô. | Uh-oh / [uivo] | `falas/sofia-1uttnnv-m1.mp3` |
| sofia | Ôôôôô. | [canto] | `falas/sofia-1uug6mj-m1.mp3` |
| sofia | Õõõõõ. | Ah! Ah! / Uou! | `falas/sofia-1utuq17-m1.mp3` |
| sofia | Ũ. | Oh / Ô | `falas/sofia-1uvr58r-m1.mp3` |
| tales | Avião. | Aviel | `falas/tales-do7an8-v3-m1.mp3` |
| tales | Bá. | Opa! / Oba! | `falas/tales-1qh5ynp-v3-m1.mp3` |
| tales | Cá. | Já / Tá. | `falas/tales-1qh5yms-v3-m1.mp3` |
| tales | Lhá. | É! / Yeah! | `falas/tales-1u7b6b-v3-m1.mp3` |
| tales | Me escuta, | Miss Scott | `falas/tales-1aretmv-v3-r2-m1.mp3` |
| tales | Peteca. | Eteca | `falas/tales-fo8l8w-v3-m1.mp3` |
| tales | Sol. | So / So | `falas/tales-1u6p0m-v3-m1.mp3` |
| tales | Uuuuu. | Oh! | `falas/tales-1oot2uu-v3-m1.mp3` |
| tales | caua | Tała | `nomes/tales/caua-r2-m1.mp3` |
| tales | henry | Ei, Ri | `nomes/tales/henry-r2-m1.mp3` |
| tales | kaua | Gauê! | `nomes/tales/kaua-r2-m1.mp3` |
| tales | luan | Luã! | `nomes/tales/luan-r2-m1.mp3` |
| tales | raul | Ha Wu! | `nomes/tales/raul-r2-m1.mp3` |
| tales | theo | Teu | `nomes/tales/theo-r2-m1.mp3` |
| tales | Õõõõõ. | Uh! / Uuuuh! | `falas/tales-1oldara-v3-m1.mp3` |
| tales | Ũ. | Hum / Hum. | `falas/tales-1ou2r3q-v3-m1.mp3` |

## Sem transcrição (0)

Clipes cujo conteúdo ainda NÃO foi conferido por transcrição (rodar a auditoria de novo quando houver cota):

—
