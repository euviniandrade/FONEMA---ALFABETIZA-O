# Espelho do Som v3 — boca 3D em tempo real (D029 §3)

Refeito do zero. **Frente e lado na mesma tela**, animando juntas o mesmo som, em 3D de verdade (three.js), sem nenhuma imagem:
tudo é modelado em código.

- **De frente**: rosto infantil estilizado (bochechas, nariz, queixo), lábios volumosos com brilho, dentes arredondados, língua e o
  fundo escuro da boca.
- **Por dentro (de lado)**: a mesma cabeça em "gelatina" translúcida, com as peças coloridas: céu da boca, véu (sobe e desce),
  língua articulada, dentes, gengivas, o caminho do ar (boca e nariz), o **ar em partículas** e a **caixinha da voz** na garganta,
  que acende e treme quando o som tem voz.
- **Marcador "o som nasce aqui"**: anel amarelo que pulsa no ponto onde a boca faz o som (lábios, dentes, atrás dos dentes de cima,
  céu da boca, fundo da língua, garganta). É o papel do dedo da apresentadora do vídeo de referência (docs/pesquisa/45).
- **Sinais sem texto**: voz ligada/desligada, ar pelo nariz, ar fraco/médio/forte.
- **Animação por tipo de som** (docs/pesquisa/45): contínuos = prepara → segura 1,8 s → solta; explosivos (p b t d k g) = três
  estouros curtos (fecha, o ar se junta, solta); R fraco = a ponta da língua bate várias vezes; H = boca parada, sem ar e sem voz.
- Botões: **repetir** e **câmera lenta**. Arrastar gira as duas vistas um pouco (com limite) e elas voltam sozinhas.

## Arquivos

| arquivo | o que é |
|---|---|
| `embed.html` + `embed.js` | entrada do iframe e contrato com o app (postMessage) |
| `espelho3d.js` | o componente: tela, duas vistas num canvas só, linha do tempo, sinais, botões, áudio |
| `modelo.js` | o modelo 3D procedural (pele e lábios, dentes, língua, céu da boca, véu, vias de ar, caixinha da voz) |
| `ar.js` | partículas do ar (caminho recalculado pela pose; para onde a boca fecha) e o marcador |
| `fonemas.js` | tabela articulatória do português brasileiro (32 sons, com fontes) + tipo de animação, força do ar e faz de conta |
| `reserva2d.js` | reserva sem WebGL: as duas vistas desenhadas em 2D com a mesma pose |
| `ferramentas/capturar.mjs` | capturas com Playwright (WebGL por software) e folha de contato |

O three.js vem do vendor do Mundo 3D (`../mundo-3d-v2/vendor` aqui; `../mundo3d/vendor` no app). Não há cópia própria.

## Contrato com o app

`embed.html?f=<fonema>&quem=sofia|tales&compacto=1&lento=1&rotulos=0|1&sons=<mapa.json>`

Mensagens aceitas: `espelho:fonema {f}` (igual à versão anterior), `espelho:falando {ativo, duracao?}`, `espelho:repetir`,
`espelho:lento {lento}`, `espelho:rotulos {rotulos}`, `espelho:quem {quem}`, `espelho:ouvir`.
Mensagens enviadas: `espelho:pronto {fonemas, webgl, versao: 3}`, `espelho:mudou {f, quem}`, `espelho:audio {f, tocou}`.

**Áudio e sincronia**: há dois caminhos.
1. O app toca o som (voz.ts / sons puros) e avisa com `espelho:falando {ativo: true}` ao começar e `{ativo: false}` ao terminar:
   a boca recomeça junto e segura o som enquanto a voz durar. É o que o app usa (`sons=` vazio).
2. O próprio espelho toca: `sons` aponta para um mapa `{ fonemas: { "<id>": { arquivo, duracaoMs } } }` (o formato de
   `app/web/public/audio/sons/mapa.json`; também aceita `{ "<id>": "arquivo.mp3" }`). O botão de repetir toca o arquivo e a boca
   segura o som pela duração do áudio. Padrão do embed fora do app: `../audio/sons/mapa.json`.

Ids dos sons: `a E e i O o u`, nasais `a~ e~ i~ o~ u~`, `p b m f v t d n l r s z x j nh lh k g rr h`.
Apelidos aceitos: `ch c q é ê ó ô ã õ y w` e letras maiúsculas.

## Desempenho e acessibilidade

Um canvas, pixelRatio ≤ 2 e teto de ~2,4 MP, sem sombras nem pós-processamento; pausa fora da tela e com a aba oculta;
com "menos movimento" a boca fica parada na pose do som e só anima ao tocar em repetir; sem WebGL cai para o desenho 2D.

## Limites conhecidos

- **Posições simplificadas: validar com fonoaudióloga** antes de tratar como material clínico.
- O R forte é mostrado como atrito no fundo da garganta, sem voz (varia muito entre sotaques).
- O nariz de frente é discreto; não há olhos (o enquadramento é do nariz ao queixo).
- De frente não há partículas de ar (ficavam parecendo manchas na pele): o ar aparece só na vista de lado.

## Capturas

`cd app && node ../docs/propostas/06-fonema-unificada/espelho-do-som-3d-v3/ferramentas/capturar.mjs --sons a,m,l --folha saida.png`
