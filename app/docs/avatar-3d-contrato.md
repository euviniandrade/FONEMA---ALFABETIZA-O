# Avatar 3D montável — contrato dos modelos (GLB)

Decisão 029 §1. Este documento diz **exatamente o que um artista 3D ou uma plataforma de 3D precisa entregar** para o
boneco da criança, e como os arquivos entram no app.

Hoje o boneco é **provisório, feito em código** (`app/web/src/avatar3d/procedural.ts`). O app já tem o carregador de
modelos prontos (`app/web/src/avatar3d/glb.ts`): **trocar é soltar o `.glb` na pasta e registrar a peça no manifesto**.
Nenhuma tela, regra ou dado muda. Peça sem modelo pronto continua usando o provisório, então a troca pode ser feita
aos poucos — mas, para não misturar estilos, entregue **um conjunto completo por vez** (ver "Ordem de entrega").

## 1. Onde ficam os arquivos

```
app/web/public/assets/avatar3d/
  manifesto.json          ← lista das peças que já têm modelo pronto
  corpo-f.glb
  cabeca-redondo.glb
  cabelo-f-cacheado.glb
  camisa-uniforme.glb
  ...
```

`manifesto.json`:

```json
{
  "versao": 1,
  "pecas": {
    "corpo-f":            { "arquivo": "corpo-f.glb", "sentado": "corpo-f.sentado.glb" },
    "cabeca-redondo":     { "arquivo": "cabeca-redondo.glb" },
    "cabelo-f-cacheado":  { "arquivo": "cabelo-f-cacheado.glb" },
    "calca-uniforme":     { "arquivo": "calca-uniforme.glb", "sentado": "calca-uniforme.sentado.glb" }
  }
}
```

- A **chave** é `<categoria>-<id da peça>`; o id é o mesmo do catálogo `app/packages/conteudo/src/avatar.ts`.
- `sentado` é a variante para a cadeira de rodas (só corpo, calças e calçados; ver §6).
- Arquivo ausente, com erro ou fora do manifesto = o app usa a peça provisória e segue funcionando.

## 2. Espaço comum (vale para TODAS as peças)

Todas as peças são modeladas **no mesmo espaço**, já na posição final. O app só soma as peças; não reposiciona nem
reescala nada.

| Item | Valor |
|---|---|
| Unidade | metro (1 unidade glTF = 1 m) |
| Eixos | +Y para cima, boneco de **frente para +Z**, esquerda do boneco em +X (padrão glTF) |
| Origem | no **chão, entre os pés** (0, 0, 0). Sola do calçado encosta em y = 0 |
| Altura total | **1,10 m** (sem cabelo volumoso) |
| Proporção | cabeça grande, de animação infantil: ~2,7 cabeças de altura |
| Pose | em pé, relaxada: braços soltos ao lado, abertos ~12° do tronco; pernas retas, pés paralelos |
| Transformações | aplicadas ("apply all transforms"): escala 1, rotação 0 em todos os nós |

Medidas de referência (iguais às do boneco provisório, em `avatar3d/modelo.ts › MEDIDAS`):

| Ponto | Posição (m) |
|---|---|
| Centro da cabeça | (0, **0,87**, 0), raio ≈ **0,20** |
| Pivô do pescoço (a cabeça balança em torno dele) | (0, **0,69**, 0) |
| Ombros | (±0,125, 0,635, 0) |
| Quadril (topo das pernas) | (±0,062, 0,38, 0) |
| Joelho | y ≈ 0,23 · Tornozelo: y ≈ 0,08 |
| Olhos | centro em (±0,065, 0,865, ~0,18); diâmetro visível ~0,09 |
| Orelhas | (±0,20, 0,86, 0) |

O couro cabeludo de todos os cabelos e a parte de cima de todas as cabeças precisam coincidir: **o crânio (da linha
das sobrancelhas para cima e para trás) é igual nos 4 formatos de rosto**; os formatos só mudam bochechas, queixo e
mandíbula. Assim qualquer cabelo serve em qualquer rosto, e óculos/aparelho encaixam sem ajuste.

## 3. Peças a entregar (nomes exatos dos arquivos)

**Corpo e cabeça (base)**

| Chave / arquivo | O que é |
|---|---|
| `corpo-m.glb`, `corpo-f.glb` | pele do corpo: pescoço, braços, mãos, pernas e pés descalços (o tronco pode ser simples: fica sob a roupa). Com variante `.sentado` |
| `cabeca-redondo.glb`, `cabeca-oval.glb`, `cabeca-coracao.glb`, `cabeca-quadrado.glb` | cabeça com rosto: olhos grandes com brilho, sobrancelhas, nariz, boca sorrindo, orelhas. **Sem cabelo.** Serve para os dois sexos |

**Cabelos** (`cabelo-<id>.glb`) — 18 peças

- Menina: `f-crespo-curto`, `f-black-power`, `f-cacheado`, `f-ondulado`, `f-liso-longo`, `f-liso-chanel`, `f-trancas`,
  `f-coque`, `f-rabo-de-cavalo`, `f-maria-chiquinha`
- Menino: `m-raspado`, `m-crespo-curto`, `m-black-power`, `m-cacheado`, `m-ondulado`, `m-liso`, `m-trancinhas`, `m-topete`

**Camisas** (`camisa-<id>.glb`) — 10 peças: `uniforme` (camiseta branca, mangas azul-marinho, letra A no peito),
`camiseta-ceu`, `camiseta-ipe`, `camiseta-listrada`, `polo-terra` (m), `bata-ipe` (f), `moletom-mata`,
`regata-esporte` (m), `blusa-manguinha` (f), `camisa-do-time`.

**Calças, bermudas e saias** (`calca-<id>.glb`, cada uma com variante `.sentado`) — 8 peças: `uniforme` (calça
azul-marinho), `bermuda-marinho`, `saia-marinho` (f), `jeans`, `bermuda-mata` (m), `saia-ipe` (f), `moletom-cinza` (m),
`legging-mata` (f).

**Calçados** (`calcado-<id>.glb`, cada um com variante `.sentado`) — 7 peças: `tenis-branco`, `sandalia`, `tenis-azul`,
`galocha`, `chuteira` (m), `sapatilha` (f), `bota-de-trilha`.

**Acessibilidade** (`acessibilidade-<id>.glb`) — 4 peças: `oculos`, `aparelho-auditivo`, `cadeira-de-rodas`,
`pintura-no-rosto` (traços finos nas bochechas, como malha colada na pele).

**Opcional:** roupa de baixo do boneco "limpo" (antes de a criança escolher). Hoje o app usa a regata e o short
provisórios; não precisa entregar.

Total do conjunto completo: **2 corpos + 4 cabeças + 18 cabelos + 10 camisas + 8 calças + 7 calçados + 4 itens de
acessibilidade = 53 peças**, mais **17 variantes sentadas** (2 corpos, 8 calças, 7 calçados) = **70 arquivos `.glb`**.

Para incluir uma peça nova no catálogo: acrescente-a em `app/packages/conteudo/src/avatar.ts` (id, nome, sexo, cores,
fase e preço) e registre o arquivo no manifesto.

## 4. Materiais que recebem cor (o app pinta pelo NOME do material)

O app troca a cor-base (`baseColorFactor`) dos materiais com estes nomes. A textura, se houver, é **multiplicada**
pela cor: por isso a textura desses materiais deve ser **em tons de cinza claro/branco** (sombras e detalhes), nunca
já colorida.

| Nome do material | Recebe | Onde aparece |
|---|---|---|
| `pele` | cor de pele escolhida (10 tons) | corpo, cabeça, e pele aparente em roupas |
| `cabelo` | cor do cabelo (7 tons naturais) | cabelos |
| `sobrancelha` | cor do cabelo | cabeça |
| `iris` | cor dos olhos (7 tons) | cabeça (só a íris; pupila, brilho e branco do olho em materiais próprios) |
| `tecido` | cor principal da peça | camisas, calças, calçados |
| `tecido2` | segunda cor (mangas, gola, listras, sola) | camisas, calças, calçados |

Qualquer outro nome de material fica como veio (ex.: `olho-branco`, `pupila`, `boca`, `sola`, `armacao`, `lente`,
`pneu`, `aro`). Estampas fixas (a letra A do uniforme, o número da camisa do time, as listras) podem vir na textura
de um material **sem** nome reservado, ou as listras podem usar `tecido` + `tecido2` em malhas separadas.

Material: PBR metálico-rugoso do glTF (`KHR_materials_*` simples são aceitos: clearcoat, sheen). Sem transparência,
exceto a lente dos óculos.

## 5. Limites por peça

| Peça | Triângulos (máx.) | Textura (máx.) |
|---|---|---|
| Corpo | 6 000 | 1024 × 1024 |
| Cabeça | 8 000 | 1024 × 1024 |
| Cabelo | 8 000 (volumosos: até 12 000) | 1024 × 1024 |
| Camisa, calça | 4 000 | 1024 × 1024 |
| Par de calçados | 3 000 | 512 × 512 |
| Óculos, aparelho, pintura | 1 500 | 256 × 256 |
| Cadeira de rodas | 8 000 | 512 × 512 |
| **Boneco montado (soma)** | **≤ 40 000** | |

- Arquivo: **GLB binário (glTF 2.0)**, um por peça, **até 400 kB** (corpo/cabeça/cabelo até 700 kB).
- Compressão de malha: **meshopt** (`gltfpack -cc`) é aceita. **Draco não** (o app não carrega o decodificador).
- Texturas: PNG ou JPEG embutidos; WebP (`EXT_texture_webp`) aceito. **KTX2/Basis não.**
- Sem câmeras, luzes ou cenas extras no arquivo. Normais suaves. UV sem sobreposição nas peças com textura.

## 6. Encaixes, animação e cadeira de rodas

- **Sem pontos de encaixe:** como todas as peças já vêm na posição final, não há ossos nem "sockets" obrigatórios.
- **Peças da cabeça** (cabeça, cabelo, óculos, aparelho auditivo, pintura): o app as prende ao pivô do pescoço
  (0, 0,69, 0) para a cabeça inclinar de leve. Devem ser modeladas no espaço comum, como as outras.
- **Piscar (recomendado):** a cabeça pode trazer um *morph target* chamado **`piscar`** (0 = olhos abertos, 1 =
  fechados). Se existir, o app pisca sozinho. Sem ele, o boneco não pisca.
- **Respirar/balançar:** o app faz por conta própria (escala e rotação leves do boneco inteiro). Nada a entregar.
- **Cadeira de rodas:** o boneco fica **sentado**. Para isso o app carrega a variante `sentado` de `corpo`, `calca` e
  `calcado` (mesmo espaço; quadril na mesma altura, 0,38 m; coxas para a frente, joelhos em z ≈ 0,15, pés apoiados em
  y ≈ 0,15). Sem a variante, a peça aparece em pé — então **as 17 variantes sentadas fazem parte do conjunto**.
  A `cadeira-de-rodas.glb` tem assento com topo em y ≈ 0,31 e apoio de pés em y ≈ 0,14.
- **Esqueleto (opcional, para o futuro):** se o artista preferir entregar com esqueleto, use um único esqueleto
  comum a todas as peças, com estes nomes de ossos: `raiz`, `quadril`, `coluna`, `pescoco`, `cabeca`, `ombro.E/D`,
  `braco.E/D`, `antebraco.E/D`, `mao.E/D`, `coxa.E/D`, `perna.E/D`, `pe.E/D`. **O app ainda não posa ossos**: hoje o
  esqueleto é ignorado e a malha aparece na pose em que foi salva. Quando houver animações (acenar, comemorar), este
  é o esqueleto que o app vai usar — e as variantes sentadas deixam de ser necessárias.

## 7. Direção de arte e valores (o que NÃO pode)

- Estilo: **boneco infantil de filme de animação 3D**, original, no mesmo estilo da dupla Sofia e Tales (D008, D025):
  formas arredondadas, olhos grandes e expressivos com brilho, sorriso. Nada de "low-poly bruto" nem de foto.
- **Começa limpo:** a cabeça vem sem cabelo e sem acessórios; o corpo, sem roupa de sair (só a pele e, se quiser, uma
  roupa de baixo lisa).
- **Só dois sexos** (D029). Cabelos e algumas roupas são por sexo (prefixos `f-`/`m-` e a coluna "sexo" do catálogo).
- **Sem joias nem adornos** (D008): nada de brinco, colar, pulseira, anel, piercing, coroa, maquiagem, laço de enfeite.
  Elásticos de cabelo, quando necessários, lisos e na cor do cabelo.
- **Sem arco-íris** (D009): no máximo 2–3 cores harmônicas por peça, da paleta da marca e da natureza (azul-marinho,
  azul-claro, branco, madeira, verdes da mata, amarelo do ipê, terracota).
- **Sem magia nem folclore** (D012): nada de varinha, chapéu de bruxa, asas, chifres etc.
- **Sem foto de criança** e sem semelhança com criança real (D008 §5). Sem marcas ou personagens de terceiros.
- A pintura no rosto é discreta (traços nas bochechas), sem símbolos.

## 8. Como conferir uma entrega

1. Copie os `.glb` para `app/web/public/assets/avatar3d/` e registre-os em `manifesto.json`.
2. `cd app && npm run build && node web/e2e/capturas-avatar.mjs` — gera `app/docs/capturas/v4-avatar-*.png` (boneco de
   frente, de lado, de costas, tela de montar, Lojinha, Acessibilidade, miniaturas).
3. Olhe: a peça está no lugar (sem flutuar nem atravessar o corpo)? A cor muda quando a criança troca pele/cabelo/
   olhos/roupa? Cabelo serve nos 4 rostos? Óculos e aparelho encostam na orelha? A versão sentada cabe na cadeira?
4. `timeout 300 node web/e2e/fluxo.e2e.mjs --sem-jornada` continua passando (o fluxo não depende da arte).

## 9. Ordem de entrega sugerida

1. **Base** (6 arquivos + 2 sentados): 2 corpos, 4 cabeças → já dá para ver o estilo no boneco limpo.
2. **Roupa inicial** (3 + 2 sentados): `camisa-uniforme`, `calca-uniforme`, `calcado-tenis-branco`.
3. **Cabelos grátis** (16): todos menos `f-maria-chiquinha` e `m-topete`.
4. **Acessibilidade** (4).
5. **Peças da Lojinha** (o restante), na ordem das fases em que abrem (Letra B, C, D…).

Enquanto um grupo não chega inteiro, deixe-o **fora do manifesto**: o app usa o provisório para o grupo todo e o
boneco não fica com metade de cada estilo.
