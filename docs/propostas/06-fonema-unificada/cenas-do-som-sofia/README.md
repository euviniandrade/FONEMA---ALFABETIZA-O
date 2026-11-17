# Cenas do som com a Sofia (17/11/2026)

Pedido do dono: "usar a Sofia em algumas áreas, ela segurando alguma coisa, por exemplo ela no médico com a boquinha aberta (A),
ou fazendo o sinal de silêncio (X), usar elementos para fazer a onomatopeia certinha". A cena do som é a figura do faz de conta
de cada letra (`CENAS_DO_SOM` em `app/packages/conteudo/src/alfabeto.ts`), mostrada na apresentação da letra, no "Som novo" das
lições da Trilha dos Sons e no jogo "Liga o som". Aqui o que importa é a AÇÃO que produz o som (meio corpo), não o close da boca.

**Folha antes × depois:** `00-antes-x-depois.jpg`.

## O que entrou no app (troca em `CENAS_DO_SOM`; as figuras antigas continuam no repositório)

| Letra | Faz de conta | Antes | Agora |
|---|---|---|---|
| A | no médico, abre a boca (aaa) | menino no médico (`cena-a`) | Sofia no médico, palito e luva (`cena-a-sofia`) |
| E | ganhou um troféu (êêê) | só o troféu (`trofeu-taca`) | Sofia erguendo o troféu (`cena-e-sofia`) |
| I e Y | lembrou de algo (iii!) | menino com a mão na cabeça (`cena-i`) | Sofia, mão na testa, dentes à mostra (`cena-i-sofia`) |
| L | lambe o sorvete | só o sorvete (`sorvete`) | Sofia lambendo o sorvete (`cena-l-sofia`) |
| V | pilota um avião (vvv) | só o avião (`aviao`) | Sofia voando um aviãozinho (`cena-v-sofia`) |
| X | pede silêncio (xiii) | menino com o dedo nos lábios (`cena-x`) | Sofia com o dedo nos lábios (`cena-x-sofia`) |

Falas e vozes não mudaram (as frases do faz de conta em `BRINCADEIRAS` continuam as mesmas).

## Propostas (não integradas)

Ó (surpresa), Ã (pensando, mão no queixo e olhar para cima — bem diferente do gesto do X) e R fraco (gato ronronando no colo):
`cena-o-aberto-sofia`, `cena-a-nasal-sofia`, `cena-r-fraco-sofia`. As cenas desses grafemas ficam em `CENA_DO_GRAFEMA`
(`app/packages/conteudo/src/fases/tf.ts`), que estava sendo feito em paralelo pela frente das lições TF-23+; para trocar, basta
mudar o nome lá. Ó, Ã e R fraco não têm o "A" no peito.

## O que não saiu (ficam as figuras atuais)

- **O** (chamar um amigo ao longe), **U** (cara de macaco), **N** (não de boca fechada), **M** (hmmm de boca fechada), **F** (soprar
  velinhas), **H** (zíper na boca), **S** (cobra), **Z** (abelha), **J** (barquinho), **É** (pisou na lama: o gerador dava erro de sistema
  em quase todo pedido com lama). O gerador ou não fazia o gesto (punha as mãos no rosto em "surpresa" para O; não fazia o bico do U),
  ou fazia com outra menina (cabelo liso, pele clara), ou o objeto ficava pequeno demais para ler em 220 px (abelha, zíper).
- **O "A" azul no peito:** pedido depois da primeira rodada. Saiu em A, I, L, V e X (refeitas com o "A"); no E a menina que saiu com o
  "A" não parecia a Sofia, então ficou a versão sem a letra. A letra do peito às vezes sai torta (no X o "A" é estilizado).

## Como foi feito

- Gerador: MiniMax `image-01` pelo proxy (chave injetada). Duas formas: com `subject_reference` da arte oficial
  (`personagens-vivos/fontes/base-sofia.png`, recortada em busto) — mantém a cara da Sofia mas ela **sempre sorri** e o gesto quase
  não muda; e só por texto ("Black Brazilian girl, warm brown skin, voluminous dark curly hair, white t-shirt with navy raglan sleeves")
  — o gesto sai, mas a menina varia, então foi preciso gerar várias e escolher. Ferramentas e pedidos em `ferramentas/`
  (`ger_cena.py`, `lote*.json`; `SEMREF=1` = só texto, `COMA=1` = pede o "A" no peito).
- **180 imagens geradas**, todas em `tentativas/` (reduzidas a 384 px); as 9 escolhidas em tamanho cheio em `escolhidas/`
  (lista em `ferramentas/escolhas.txt`).
- Recorte: `ferramentas/recorta2.py` — chave de cor sobre o fundo creme (modelo de fundo local) + rembg `isnet-general-use` só para
  segurar o miolo (camiseta branca). O rembg sozinho deixava creme entre os cachos ou comia a mão do médico. Fica uma franja clara
  fina no cabelo, que some no fundo claro das telas. Padrão das figuras: webp 220×220, fundo transparente.
- Conferido em cada escolhida: parece a Sofia (cachos, pele, camiseta branca com manga azul), ação clara, mãos certas, sem brinco,
  joia, arco-íris, marca ou texto (fora o "A" do uniforme).
