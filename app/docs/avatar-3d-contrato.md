# Avatar 3D — contrato dos modelos (GLB) e da personalização por cor

Decisão 029 §1 e §7. Este documento diz **o que um artista 3D ou uma plataforma de 3D precisa entregar** para o boneco
da criança e **como um modelo novo entra no app**.

Desde 15/11 o boneco é um **modelo 3D de verdade** (GLB gerado por plataforma, estilo filme de animação): começa num
**padrão completo** — rosto, cabelo, roupa toda branca com o "A" azul — e a criança **personaliza as cores** em tempo
real, sem trocar de modelo. O tipo de cabelo troca o **modelo inteiro**. O boneco feito em código
(`app/web/src/avatar3d/procedural.ts`) ficou só como **reserva**, para quando o modelo não carrega.

## 1. Arquivos

```
docs/propostas/06-fonema-unificada/avatar-3d/padrao/modelos/   ← ORIGINAIS da plataforma (≈3 MB, textura 2048) — nunca sobrescrever
  avatar-menino-padrao.glb
  avatar-menina-padrao.glb
  avatar-<menino|menina>-<cabelo>.glb        ← variações de cabelo, quando chegarem

app/web/public/assets/modelos3d/              ← o que o app carrega (gerado pelas ferramentas)
  avatar-menino-padrao.glb                    ← comprimido: ≈0,3 MB (meta ≤ 1 MB por personagem)
  avatar-menino-padrao.cor.webp               ← textura de cor em 1024 px (a que o app recolore)
  avatar-menino-padrao.mascara.png            ← máscara de regiões (ver §3)
  avatares.json                               ← manifesto: modelos existentes + médias de cor + âncoras
```

Hoje existem `menino-padrao` e `menina-padrao` (≈0,32–0,34 MB cada, mais ≈0,1 MB de textura de cor + máscara).
Sofia e Tales (`sofia.glb`, `tales.glb`) foram comprimidos do mesmo jeito: de ≈9 MB para ≈0,5 MB cada.

## 2. Como incluir um modelo novo (ex.: um tipo de cabelo)

1. Salve o original em `docs/propostas/06-fonema-unificada/avatar-3d/padrao/modelos/avatar-<sexo>-<cabelo>.glb`
   (`<sexo>` = `menino` ou `menina`; `<cabelo>` = o nome usado no catálogo: `cacheado`, `black`, `trancas`, `rabo`,
   `coque`, `crespo`, `franja`, `topete`).
2. `python3 app/ferramentas/avatar-mascaras.py --conferir /tmp/conferir` — gera a máscara, a textura de cor e atualiza
   `avatares.json`. **Olhe** `/tmp/conferir/<nome>-regioes-no-boneco.png`: cada região tem uma cor (pele laranja,
   cabelo roxo, íris azul-claro, camiseta vermelha, calça verde, calçado amarelo; cinza = não muda).
3. `app/ferramentas/comprimir-modelos3d.sh` — comprime os GLB (textura 1024 em WebP, malha em meshopt, sem
   simplificar: os UVs precisam continuar iguais aos da máscara).
4. `cd app && npm run build && node web/e2e/capturas-avatar.mjs` — confira as capturas `v6-avatar-*`.

Pronto: o passo "Penteado" e a aba "Cabelo" da Lojinha aparecem sozinhos quando existe mais de um modelo para o sexo
(o catálogo em `app/packages/conteudo/src/avatar.ts` já lista as variações previstas; a tela só mostra as que têm
arquivo em `avatares.json`).

## 3. O que o modelo precisa ter para a recoloração funcionar

O script separa as regiões pela **cor do texel** e pela **posição 3D** do triângulo que usa aquele texel. Para isso
o modelo gerado deve seguir o padrão dos dois que já existem:

| Requisito | Por quê |
|---|---|
| **Uma malha, um material, uma textura de cor** (PBR metálico-rugoso), UVs entre 0 e 1 | o app recompõe essa textura |
| Personagem **inteiro, em pé, em pose A** (braços abertos para baixo), pés no chão | a altura separa cabeça / tronco / pernas / pés |
| **Roupa toda branca** (camiseta de manga curta por cima da calça, calça comprida, tênis) | branco × cor = cor, com as dobras preservadas |
| **Letra "A" azul** no peito | é a única coisa azul: fica fora da máscara e nunca muda |
| **Pele clara ou média**, sem pintura | os tons são aplicados como variação em torno da média da pele |
| **Cabelo e sobrancelhas escuros** (castanho-escuro), mais escuros que a pele | separados da pele pelo valor |
| **Olhos com o branco visível** e íris escura | o branco do olho é a âncora que localiza os olhos e a direção do rosto |
| Sem acessórios, sem estampa, sem sombra pintada forte na roupa | tudo que for cinza abaixo do pescoço vira "roupa" |
| Estilo: boneco infantil de filme de animação 3D, mesmo estilo da Sofia e do Tales (D008, D025) | |

Regiões da máscara (`<nome>.mascara.png`, 1024 px): canal **R** = região — `0` não muda · `1` pele (inclui o corado
das bochechas e a boca) · `2` cabelo e sobrancelhas · `3` íris · `4` camiseta · `5` calça · `6` calçado; canal **G** =
peso (na íris: distância ao centro, para desenhar pupila e contorno). Ficam **fora** (nunca mudam): a letra A, o
branco dos olhos, o brilho da íris, a linha dos cílios e a sola do tênis.

Como o app aplica as cores (`app/web/src/avatar3d/avatarGlb.ts › recolorir`), sempre em luz linear:

- **roupa:** cor × (luminância do texel ÷ branco de referência) — as dobras continuam lá;
- **pele:** tom-alvo × (texel ÷ média da pele), canal a canal — a sombra escurece na mesma proporção e o corado e a
  boca mantêm o desvio para o vermelho; acima da média o brilho é comprimido para não estourar nos tons claros;
- **cabelo e sobrancelhas:** tom-alvo × (luminância ÷ média)^0,9 — mechas e brilho continuam;
- **íris:** cor nova com pupila, degradê e contorno; o brilho original é mantido.

Sem cor escolhida, a região fica exatamente como o modelo veio.

## 4. Limites

| Item | Limite |
|---|---|
| Triângulos por personagem | até ~45 000 (os atuais têm ~38 000–40 000) |
| Textura no app | 1024 × 1024 (cor, normal e rugosidade), WebP |
| Arquivo comprimido | **≤ 1 MB por personagem** (os atuais: ≈0,33 MB + ≈0,1 MB de cor/máscara) |
| Compressão | **meshopt** + WebP. **Draco e KTX2 não** (o app não carrega esses decodificadores) |
| Esqueleto / animação | não há: o app faz o boneco "respirar" com escala e oscilação leves |

## 5. O que ainda depende de modelo próprio

- **Tipos de cabelo:** as artes de referência estão em `docs/propostas/06-fonema-unificada/avatar-3d/padrao/variacoes/`
  (menina: black, cacheado, coque, rabo, tranças; menino: cacheado, crespo, franja, topete). Falta gerar os GLB.
- **Cadeira de rodas:** o modelo é uma malha única, em pé e sem esqueleto. Precisa de um **modelo sentado na
  cadeira** por sexo (ex.: `avatar-menina-padrao-cadeira.glb`, mesma roupa branca). Enquanto não existir, o item fica
  fora da tela (o dado do cadastro é preservado).
- **Aparelho auditivo:** precisa da orelha à mostra (no modelo da menina o cabelo cobre) ou vir modelado. Idem.
- **Formato do rosto, boca, sorriso:** dependem de kit de peças ou de modelos alternativos; não são oferecidos.
- **Óculos e pintura no rosto** funcionam hoje: são desenhados em código sobre o modelo, apoiados nos olhos
  (âncoras de `avatares.json`) e na superfície do rosto.

## 6. Valores (o que NÃO pode)

Só dois sexos (D029) · sem joias nem adornos (D008) · sem arco-íris: cores lisas da paleta da marca e da natureza
(D009) · sem magia nem folclore (D012) · sem foto de criança nem semelhança com criança real (D008 §5) · sem marcas
ou personagens de terceiros. A pele cobre a gama brasileira inteira, em ordem neutra, sem "padrão" destacado.

## 7. Reserva (boneco provisório por peças)

Se o GLB do avatar não carregar, o app mostra o boneco provisório feito em código, com as mesmas cores. O carregador
antigo de peças soltas (`app/web/src/avatar3d/glb.ts`, manifesto `public/assets/avatar3d/manifesto.json`) continua
existindo só para essa reserva; não é o caminho para modelos novos.
