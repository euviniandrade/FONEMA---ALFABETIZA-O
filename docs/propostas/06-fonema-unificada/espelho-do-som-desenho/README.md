# Espelho do Som — boca em desenho no estilo da Sofia (proposta de 17/11)

Pedido do dono (D032 §6): "a boca está feia; eu falei para fazer uma ilustração de uma boca como se fosse um desenho, igual a Sofia
ou o Tales, com a língua, o dente". Tentamos fazer, com a MiniMax `image-01` e a arte oficial da Sofia como referência, um close do
rosto dela em cada posição de boca da tabela de `docs/pesquisa/45-video-alfabeto-fonetico-referencia.md`.

**Resultado: não integrado ao app.** O conjunto não ficou consistente nem fiel o bastante. O Espelho do Som continua como está (3D).

- `00-folha-atual-x-proposta.jpg`: atual (em cima) × a melhor tentativa de cada som (embaixo), com a avaliação.
- `01-tentativas.jpg`: as 7 formas de pedir que testamos (102 imagens no total), da primeira à última.
- `aproveitaveis/`: as imagens que servem (A, I, U, M/B/P, S/Z) e as "mais ou menos" (E, K/G).
- `fontes/`: o recorte do rosto da Sofia usado como referência (da arte `personagens-vivos/fontes/base-sofia.png`) e a versão sem boca.
- `ferramentas/`: `ger.py` (gera com referência), `pintar.py` (boca-guia pintada), `alinhar.py` (cola só a boca num rosto fixo).
  Rodam numa pasta de trabalho com `ref-sofia.jpg` e `ref-semboca.jpg` (copiar de `fontes/`); a chave vem do proxy.

## O que deu certo e o que não deu

| Som | Resultado |
|---|---|
| A, I, U, M/B/P, S/Z | servem: boca aberta, sorriso largo, biquinho, lábios fechados, dentes juntos |
| E, K/G | mais ou menos: o E vira sorriso; no K a boca abre mas não dá para ver o fundo da língua |
| O | o único O redondo veio com brinco (proibido, D008) |
| F/V, L, T/D/N, R, X/J | **não saíram**: nenhuma imagem com os dentes de cima no lábio de baixo, nem com a ponta da língua subindo atrás dos dentes |

Os dois problemas que impedem usar:
1. **Língua e dente no lábio, justamente o que o dono pediu, o gerador não faz.** Testamos pedir por ação ("morder o lábio",
   "lá-lá-lá"), colar a boca antiga na referência e pintar uma boca-guia: ou ele ignora (sai um sorriso), ou copia o rascunho e
   fica uma boca de plástico.
2. **A Sofia muda de uma imagem para outra** (rosto, cabelo, roupa, enquadramento), então não dá para trocar quadro a quadro.
   Colar só a boca num rosto fixo funciona nos lábios fechados, mas nas bocas abertas a emenda aparece (queixo e pele).
   Isso confirma o teste de 15/11 (`espelho-do-som-conceitos/README.md`).

## O que falta para ficar bom (decisão do dono)

- **Um editor de imagem que mexe só na boca e mantém o resto igual** (ex.: o "nano banana" do Higgsfield, que já fez as páginas do
  Bolota com a cara igual; ou a edição de imagem da Cloudinary, que tem cota gratuita mas precisa da autorização do dono para usar).
  Com ele: um rosto-base da Sofia aprovado e uma edição por som (~13 a 15 imagens), conferidas contra a pesquisa 45.
- Ou **um artista desenhando as bocas** sobre a arte-base (caminho do `espelho-do-som-conceitos/README.md`).
- Ou **o vídeo real da boca da Agatha**, que o dono citou como alternativa (D032 §6).

Quando houver o conjunto, a integração é simples: em `app/web/src/componentes/EspelhoDoSom.tsx` já existe a reserva por imagens
(`frente-<visema>.webp`); bastaria um modo "desenho" com uma imagem por grupo de som, mantendo o "por dentro" 3D e o marcador
"o som nasce aqui".
