# Auditoria dos clipes de voz

Gerado por `ferramentas/auditar-audio.py`. Regra (D027 §2): **nenhum áudio vai ao ar sem esta auditoria**.

- Clipes auditados: **1677** (1387 falas + 290 nomes; vozes Sofia e Tales)
- Graves (defeito audível provável): **50** · a conferir de ouvido (palavra/som solto com transcrição diferente): **132** · leves (higiene do sinal): **0** · sem defeito: **1495**
- Conteúdo conferido por transcrição: **1677** clipes · **sem transcrição: 0** (só o sinal foi conferido nesses)
- Volume (clipes ≥ 0,4 s): mediana -17.4 LUFS, de -22.8 a -14.6 (alvo -16)

## Defeitos por tipo

| Tipo | Antes | Agora |
|---|---|---|
| conteúdo: palavra trocada | 69 | 145 |
| começo seco | 184 | 0 |
| volume fora da média | 135 | 0 |
| sem respiro no começo | 113 | 0 |
| sem respiro no fim | 69 | 0 |
| clipping | 63 | 3 |
| fim seco | 35 | 0 |
| conteúdo: nome errado | 16 | 5 |
| fim cortado na gravação | 21 | 0 |
| conteúdo: sílaba faltando no fim | 6 | 8 |
| conteúdo: sílaba faltando no começo | 4 | 7 |
| conteúdo: sobrando | 5 | 4 |
| curto demais | 0 | 4 |
| conteúdo: sílaba faltando no meio | 0 | 3 |
| conteúdo: transcrição vazia | 2 | 1 |
| conteúdo: palavra faltando | 0 | 2 |
| conteúdo: fim faltando | 0 | 2 |
| conteúdo: começo faltando | 0 | 1 |
| mudo | 1 | 0 |

Antes: 275 graves, 52 a conferir e 188 leves em 915 clipes (915 com transcrição).

Critérios: começo/fim seco = RMS dos 25 ms das pontas acima de −30 dBFS; curto demais = menos de 55 ms por caractere falado; volume fora = mais de 4 dB da mediana da voz; clipping = 8+ amostras no teto ou onda achatada; fim cortado na gravação = o arquivo bruto do TTS acaba em plena fala (sem a queda da voz); conteúdo = transcrição automática (Gemini e, como segunda opinião, ElevenLabs Scribe; basta uma bater) comparada ao texto enviado ao TTS, por chave fonética (ignora caixa, pontuação e grafia). Sílabas e sons soltos têm transcrição pouco confiável: conferir de ouvido.

## Clipes graves

| Voz | Texto esperado | Ouvido | Problemas | Arquivo |
|---|---|---|---|---|
| sofia | A ema foi na lama. | [som de transição] | palavra trocada (“a ema foi na lama” → “son de transikao”) | `falas/sofia-ht4lcz-m1.mp3` |
| sofia | A ema sai suja, suja! | Aê, mas sai suja, suja? | palavra trocada (“a ema” → “ae mas”) | `falas/sofia-1xj0bed-m1.mp3` |
| sofia | Como o Tales ficou no fim? | [som de carro] | palavra trocada (“komo o tales fiko no fin” → “son de karo”) | `falas/sofia-3z70un-m1.mp3` |
| sofia | Conhecer a letra érre. | Conhecer a letra R | sílaba faltando no meio (“ere” → “r”) | `falas/sofia-2my0ul-r2-m1.mp3` |
| sofia | Continue a trilha para descobrir! | Continue a trilha para descobrir | curto demais | `falas/sofia-16c3ruf-m1.mp3` |
| sofia | Cá! De kiwi. | K de kiwi | sílaba faltando no fim (“ka” → “k”) | `falas/sofia-1wuhvy7-r2-m1.mp3` |
| sofia | Devagar: M, de macaco-Aaaaa, ma. L, de lua-Aaaaa, la. mala! | Devagar, hem, de macaco ama. Ele de lua ala, mala | palavra trocada (“n” → “en”); palavra trocada (“a ma l” → “ama ele”) | `falas/sofia-guzzxu-m1.mp3` |
| sofia | E: é e ê. Ligar os sons é e ê à letra E. | É, iê! Liga os sons é e iê à letra E. / I, E e E. Ligar os sons E e E  | palavra trocada (“e” → “i”) | `falas/sofia-1svhpmb-m1.mp3` |
| sofia | Ei! Ui! Ai! Eu! Oi! Oi, oi! | Ei, oi, ai, eu, oi, oi, oi | palavra trocada (“ui” → “oi”) | `falas/sofia-j1ecvd-m1.mp3` |
| sofia | Escute como eu leio. Depois, leia você, do mesmo jeito. | E escute como eu leio. Depois leia você do mesmo jeito | sobrando “e” | `falas/sofia-181eno1-m1.mp3` |
| sofia | Esticar M, de macaco, L, de lua e F, de foca | Esticar M de macaco, L de lua e Fim de foca | palavra trocada (“f” → “fin”) | `falas/sofia-1ngizd-m1.mp3` |
| sofia | Guardar moedinhas no porquinho | Guardar moedinhas no porquinho | curto demais | `falas/sofia-13bc37v-m1.mp3` |
| sofia | I do sorriso. Ligar o som i à letra I e traçar o I. | E do S o riso, ligar o som e a letra I, e traçar o U. / E do sorriso:  | palavra trocada (“i” → “e”) | `falas/sofia-15jw11t-m1.mp3` |
| sofia | Iiiii, um sorriso grande. Sua vez, | E um sorriso grande. Sua vez. / E um sorriso grande. Sua vez | palavra trocada (“i” → “e”) | `falas/sofia-n7w6f5-m1.mp3` |
| sofia | Isso! Esse é o som do Q. | Isso, esse é o som do quê? | palavra trocada (“k” → “ke”) | `falas/sofia-1duq14f-m1.mp3` |
| sofia | L, de lua | É de luar / Ele de lua | palavra trocada (“l” → “ele”) | `falas/sofia-1uqi87f-m1.mp3` |
| sofia | L, de lua | Lei de Loire? | palavra trocada (“l” → “le”); palavra trocada (“lua” → “loire”) | `falas/sofia-1uraq2z-m1.mp3` |
| sofia | L, de lua… lua! | É o de lua, lua | palavra trocada (“l” → “e o”) | `falas/sofia-1asmjqs-m1.mp3` |
| sofia | M. Ligar a letra M ao som m e juntar ma, mo, mu. | tem se ligar a letra M ao som M e juntar ma mó mu / M se ligar a letra | palavra trocada (“n” → “ten se”) | `falas/sofia-n0mlr6-m1.mp3` |
| sofia | Mais uma tábua encaixou na ponte! | Mais uma tábua encaixou na ponte. | clipping | `falas/sofia-104fnkb-m1.mp3` |
| sofia | Monte a palavra som por som, | [som de transição] | começo faltando “monte a palavra”; palavra trocada (“por son” → “de transikao”) | `falas/sofia-y4sa5r-m1.mp3` |
| sofia | N, de navio | em, o navio / É, de navio | palavra trocada (“n” → “e”) | `falas/sofia-1uqjt6z-m1.mp3` |
| sofia | No caminho, ela encontrou o besouro Beto. Ele estava sentado, com a ba | No caminho, ela encontrou o besouro Beto. Ele estava sentado com a bar | clipping | `falas/sofia-z2ryym-m1.mp3` |
| sofia | O D tem voz: | O detém voz | palavra trocada (“d ten” → “deten”) | `falas/sofia-1sspl1-m1.mp3` |
| sofia | O Q vem sempre com o U. | O que vem sempre com o U | palavra trocada (“k” → “ke”) | `falas/sofia-gsjide-m1.mp3` |
| sofia | O som do U, uuuu, da letra U. | O som do U, uru da letra U | palavra trocada (“u” → “uru”) | `falas/sofia-lyxfku-r2-m1.mp3` |
| sofia | Olha a minha boca antes de responder, | Olhe pra minha boca antes de responder. / Olhe na minha boca antes de  | palavra trocada (“olia a” → “olie na”) | `falas/sofia-fkfjyi-m1.mp3` |
| sofia | Olha minha boca. | Olha a minha boca / Olha a minha boca | sobrando “a” | `falas/sofia-18vvjz7-m1.mp3` |
| sofia | Olhe a capa. O que você acha que a formiga vai fazer? | Olha a capa. O que você acha que a formiga vai fazer? | palavra trocada (“olie” → “olia”) | `falas/sofia-lkikce-m1.mp3` |
| sofia | Os sons é e ê da letra E | Os sons E e I da letra E | palavra trocada (“e” → “i”) | `falas/sofia-1suupoe-m1.mp3` |
| sofia | Ouvir a diferença entre é e ê | Ouvir a diferença entre "e" | fim faltando “e e” | `falas/sofia-lmh00y-m1.mp3` |
| sofia | Põe a mão no pescoço para sentir. | Ponha a mão no pescoço para sentir | palavra trocada (“poe” → “ponia”) | `falas/sofia-1h6mw43-m1.mp3` |
| sofia | Qual palavra é mais comprida? | Qual palavra é mais comprida? | curto demais | `falas/sofia-7wcok-m1.mp3` |
| sofia | R, de rato | É de rato / É de rato | palavra trocada (“r” → “e”) | `falas/sofia-rdgy2-m1.mp3` |
| sofia | S, de sapo… sapo! | Este sapo. Sapo | palavra trocada (“s de” → “este”) | `falas/sofia-1docthd-m1.mp3` |
| sofia | Tenho um fio que faz F, de foca! | Tem um filtro que faz selfie de foca. / Tem um fio que faz F de foca | sílaba faltando no fim (“tenio” → “ten”) | `falas/sofia-24dqt2-m1.mp3` |
| sofia | U? Ou O? | U? Ô | fim faltando “o” | `falas/sofia-o4xcnb-r4-m1.mp3` |
| sofia | V, de vaca | O de vaca / Vê, devagar | palavra trocada (“v” → “o”) | `falas/sofia-1ur1r4b-m1.mp3` |
| sofia | Vamos conferir, som por som. | Vamos conferir som por som | curto demais | `falas/sofia-r4du6i-m1.mp3` |
| sofia | Você está pronta para conhecer as letras? | Você está pronta pra conhecer as letras? | palavra trocada (“para” → “pra”) | `falas/sofia-1jqjx0n-m1.mp3` |
| sofia | Você está pronto para conhecer as letras? | Você está pronto pra conhecer as letras? | palavra trocada (“para” → “pra”) | `falas/sofia-19cp63t-m1.mp3` |
| sofia | X, de xícara | Xis de chave / X de chave | palavra trocada (“xikara” → “xave”) | `falas/sofia-1uqr763-m1.mp3` |
| sofia | vovó: a boca abre mais. Óóóóó. | Vovó, a porta abriu mais. Ó! / Vovó, a boca abre mais. Ôpa | palavra trocada (“o” → “opa”) | `falas/sofia-1o64pg2-m1.mp3` |
| tales | Ajuda o Bolota a fazer o guia da mata? Lê a figurinha! | Ajudo o Bolota a fazer o guia da mata? Leia a figurinha | palavra trocada (“le” → “lea”) | `falas/tales-8xpboj-v3-m1.mp3` |
| tales | Isso! Você entendeu o Bolota! | Isso! Você entendeu, Bolota | palavra faltando “o” | `falas/tales-1xuz4l0-v3-m1.mp3` |
| tales | Isso! Você me entendeu! | É isso. Você me entendeu? | sobrando “e” | `falas/tales-hohrig-v3-m1.mp3` |
| tales | Na Lojinha, você troca as moedinhas por roupas para o seu boneco. E, m | Na lojinha, você troca as moedinhas por roupas para o seu boneco e mai | palavra faltando “a” | `falas/tales-18e834u-v3-m1.mp3` |
| tales | Olha a Lojinha! A cada letra abrem coisas novas para o seu boneco. | Olhe a lojinha! A cada letra abrem coisas novas para o seu boneco | palavra trocada (“olia” → “olie”) | `falas/tales-s8k98h-v3-m1.mp3` |
| tales | X, de xícara | Xis, de chave. / X de chave | palavra trocada (“xikara” → “xave”) | `falas/tales-1ooggl2-v3-m1.mp3` |
| sofia | bryan | Brian | clipping | `nomes/sofia/bryan-m1.mp3` |

## A conferir de ouvido (palavras, sílabas e sons soltos)

| Voz | Texto esperado | Ouvido | Arquivo |
|---|---|---|---|
| sofia | Aaaaa. | [efeito sonoro] | `falas/sofia-1ur9zd7-m1.mp3` |
| sofia | Ai. | I | `falas/sofia-rpt9nn-m1.mp3` |
| sofia | Ama. | Amo! | `falas/sofia-1qah752-m1.mp3` |
| sofia | Ave. | Sei | `falas/sofia-1qah7mh-m1.mp3` |
| sofia | Babá. | 爸爸 | `falas/sofia-1uqmowb-m1.mp3` |
| sofia | Bife. | Vice | `falas/sofia-1uqmi6b-m1.mp3` |
| sofia | Bo. | Bom! / Pó! | `falas/sofia-rpt9om-m1.mp3` |
| sofia | Bola. | Paula? | `falas/sofia-1ur9r57-m1.mp3` |
| sofia | Bolo. | Bola | `falas/sofia-1uqmqit-m1.mp3` |
| sofia | Bolota. | Bolacha / Palata | `falas/sofia-ezk40g-m1.mp3` |
| sofia | Bo… la. | Pula / Pó lá | `falas/sofia-jt7slp-m1.mp3` |
| sofia | Bo… la. | Pu-la | `falas/sofia-138awz1-m1.mp3` |
| sofia | Bupi. | Bupe | `falas/sofia-1uqn58l-m1.mp3` |
| sofia | Cafa. | Kappa! | `falas/sofia-1uqnjxq-m1.mp3` |
| sofia | Cafu. | Careful! | `falas/sofia-1uqnjy2-m1.mp3` |
| sofia | Cama. | Come on! | `falas/sofia-1uqnjlx-m1.mp3` |
| sofia | Cavu. | Tavo? | `falas/sofia-1uqnkbu-m1.mp3` |
| sofia | Ca… sa. | Tchau, tchau! / Xá, sá! | `falas/sofia-ki86cd-m1.mp3` |
| sofia | Co. | So, / Tchau! | `falas/sofia-rpt9pj-m1.mp3` |
| sofia | Dividir. | Divigil | `falas/sofia-10f0i7a-m1.mp3` |
| sofia | Eeeee. | Hum. / Ãhn | `falas/sofia-1uqp3d7-m1.mp3` |
| sofia | Ele. | L | `falas/sofia-1qaha4n-m1.mp3` |
| sofia | Eli. | Ellie | `falas/sofia-1qaha4r-m1.mp3` |
| sofia | Fali. | Fale | `falas/sofia-1uqprgp-m1.mp3` |
| sofia | Fama. | Fala, | `falas/sofia-1uqprfk-m1.mp3` |
| sofia | Fami. | Family | `falas/sofia-1uqprfs-m1.mp3` |
| sofia | Fazio. | Fácil | `falas/sofia-j4w7k-m1.mp3` |
| sofia | Fo. | Fu! / Fu! | `falas/sofia-rpt9s2-m1.mp3` |
| sofia | Fofa. | Fafa | `falas/sofia-1urbxad-m1.mp3` |
| sofia | Folu. | Follow / Follow | `falas/sofia-1uqpmxn-m1.mp3` |
| sofia | Fuli. | Foli | `falas/sofia-1uqq1r1-m1.mp3` |
| sofia | Fulu. | [outro jingle] | `falas/sofia-1uqq1q9-m1.mp3` |
| sofia | Gafu. | Gaffo | `falas/sofia-1uqqmny-m1.mp3` |
| sofia | Gin. | Quem / Quem? | `falas/sofia-1qahbzf-m1.mp3` |
| sofia | Gufa. | Guifa | `falas/sofia-1uqqwxq-m1.mp3` |
| sofia | Gufo. | Good for | `falas/sofia-1uqqwxc-m1.mp3` |
| sofia | Gá. | Já / Já! | `falas/sofia-rpt9pp-m1.mp3` |
| sofia | Iglu. | Igloo / Íglo | `falas/sofia-1uqfwe4-m1.mp3` |
| sofia | Iiiii. | E | `falas/sofia-1ur4023-m1.mp3` |
| sofia | Iiiii… ilha! | Iiiih, ihá! | `falas/sofia-11wcpy8-m1.mp3` |
| sofia | Ilha. | IA / E aí? | `falas/sofia-1uqg207-m1.mp3` |
| sofia | Ja. | É? / Yeah | `falas/sofia-rpt9hc-m1.mp3` |
| sofia | Jali. | Yali | `falas/sofia-1uqgjb9-m1.mp3` |
| sofia | Jufa. | Schufa | `falas/sofia-1uqgzo3-m1.mp3` |
| sofia | Jufo. | Ufo | `falas/sofia-1uqgzod-m1.mp3` |
| sofia | Labu. | Labo | `falas/sofia-1uqi5sh-m1.mp3` |
| sofia | Lacu. | Lacho | `falas/sofia-1uqi5rk-m1.mp3` |
| sofia | Lafu. | Lafo | `falas/sofia-1uqi5p1-m1.mp3` |
| sofia | Lapu. | Lapo | `falas/sofia-1uqi64j-m1.mp3` |
| sofia | Les. | Lê / Lei | `falas/sofia-1qah2up-m1.mp3` |
| sofia | Lhá. | Lá / Lá | `falas/sofia-1qah37y-m1.mp3` |
| sofia | Lia. | Leah | `falas/sofia-1qah35b-m1.mp3` |
| sofia | Lo. | Não / Não | `falas/sofia-rpt9jc-m1.mp3` |
| sofia | Lufo. | LMAO / Lofo | `falas/sofia-1uqifyz-m1.mp3` |
| sofia | Mapa. | Maba | `falas/sofia-1uqj16e-m1.mp3` |
| sofia | Mave. | Maeve | `falas/sofia-1uqj14k-m1.mp3` |
| sofia | Mido. | Medo | `falas/sofia-1uqj7dw-m1.mp3` |
| sofia | Midu. | Me deu | `falas/sofia-1uqj7em-m1.mp3` |
| sofia | Mitu. | Me too | `falas/sofia-1uqj7se-m1.mp3` |
| sofia | Mo. | Não! / Não! | `falas/sofia-rpt9k9-m1.mp3` |
| sofia | Movo. | Novo! | `falas/sofia-1uqizu8-m1.mp3` |
| sofia | Mufo. | Mofo | `falas/sofia-1uqjb0a-m1.mp3` |
| sofia | Muni. | Moni | `falas/sofia-1uqjb78-m1.mp3` |
| sofia | Muva. | Mufa | `falas/sofia-1uqjalg-m1.mp3` |
| sofia | Nato. | Não tô | `falas/sofia-1uqjm8v-m1.mp3` |
| sofia | Nua. | Noah | `falas/sofia-1qah4tt-m1.mp3` |
| sofia | Olho. | Óleo | `falas/sofia-1uqkeen-r3-m1.mp3` |
| sofia | Ooooo. | Ah... / [efeito sonoro] | `falas/sofia-1uqkiiz-m1.mp3` |
| sofia | Pafe. | Perfeito! | `falas/sofia-1uqxkgp-m1.mp3` |
| sofia | Pai. | Vai / Bye | `falas/sofia-1qahjqr-m1.mp3` |
| sofia | Patu. | Pato | `falas/sofia-1uqxk0r-m1.mp3` |
| sofia | Pe. | Ei / Ei! | `falas/sofia-rpta1q-m1.mp3` |
| sofia | Pi. | Pai / Bye! | `falas/sofia-rpta1e-m1.mp3` |
| sofia | Po. | Hã? / Pá! | `falas/sofia-rpta1g-m1.mp3` |
| sofia | Poi. | Põe | `falas/sofia-1qahjp9-m1.mp3` |
| sofia | Poça. | Pode, sá? | `falas/sofia-1uqxfaq-m1.mp3` |
| sofia | Pufi. | Poofy | `falas/sofia-1uqxa69-m1.mp3` |
| sofia | Pule. | Pô! | `falas/sofia-1uqx9xj-m1.mp3` |
| sofia | Pá. | Dê / E aí? | `falas/sofia-rpta56-m1.mp3` |
| sofia | Rei. | Ei! | `falas/sofia-1qahlf9-m1.mp3` |
| sofia | Ré. | Trê | `falas/sofia-rpta6o-m1.mp3` |
| sofia | Saia. | Sai! | `falas/sofia-1uqzv69-m1.mp3` |
| sofia | Savo. | Sabô | `falas/sofia-1uqzv6o-m1.mp3` |
| sofia | Selo. | Celu | `falas/sofia-1uqzym6-m1.mp3` |
| sofia | Sivo. | Sibo | `falas/sofia-1uqzoh4-m1.mp3` |
| sofia | Sula. | Saru lá | `falas/sofia-1uqzl5s-m1.mp3` |
| sofia | Tafa. | Dafa | `falas/sofia-1ur0n6h-m1.mp3` |
| sofia | Te. | Dê / E aí? | `falas/sofia-rpta56-m1.mp3` |
| sofia | Timu. | Dimu | `falas/sofia-1ur0gry-m1.mp3` |
| sofia | To. | Tchau! | `falas/sofia-rpta4w-m1.mp3` |
| sofia | Tufa. | Too far | `falas/sofia-1ur06kt-m1.mp3` |
| sofia | Tá. | Ei / Ei! | `falas/sofia-rpta1q-m1.mp3` |
| sofia | Ui! Ai! | Oi, ai! | `falas/sofia-1awpnrz-m1.mp3` |
| sofia | Ui. | Oi! | `falas/sofia-rpta5z-m1.mp3` |
| sofia | Umu. | Amo | `falas/sofia-1qahnqe-m1.mp3` |
| sofia | Unha. | Punga | `falas/sofia-1ur148p-r3-m1.mp3` |
| sofia | Uuuuu. | Au! / Uou! | `falas/sofia-1ur11zf-m1.mp3` |
| sofia | Uuuuu. | [música de introdução] | `falas/sofia-1uroxmz-m1.mp3` |
| sofia | Vafe. | Vaf | `falas/sofia-1ur23a7-m1.mp3` |
| sofia | Vavi. | Babi | `falas/sofia-1ur22v7-m1.mp3` |
| sofia | Viu. | [efeito sonoro] | `falas/sofia-1qahogx-m1.mp3` |
| sofia | Yakisoba. | E a Kisuba? | `falas/sofia-1h2qlq-m1.mp3` |
| sofia | Zafa. | Jafa | `falas/sofia-1uqsuqf-m1.mp3` |
| sofia | Zufa. | Zefa | `falas/sofia-1uqskg3-m1.mp3` |
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
| tales | Poça. | Possa | `falas/tales-1ooabpr-v3-m1.mp3` |
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
