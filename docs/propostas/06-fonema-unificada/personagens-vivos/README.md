# Personagens vivos (Decisão 027 §3)

Pedido do dono: *"Os personagens estão todos em formato de foto. Quero como se fossem feitos no Blender 3D, 360° de cada personagem e cada animalzinho, um personagem vivo, de vários ângulos; e a boca, na hora de falar, tem que se mexer; tudo em 3D e com movimento forte."*

Esta pasta entrega a etapa **"agora"** da D027 (personagens animados em vídeo com qualidade de filme) e prepara a etapa **"em seguida"** (modelos 3D reais).

**Aviso honesto:** ainda **não são modelos 3D em tempo real**. São vídeos de animação gerados a partir das artes aprovadas, com o fundo recortado, e uma boca trocada por posições no tempo da voz. Parecem 3D e se mexem, mas não dá para mudar a roupa, a luz ou a pose pelo código. O caminho para o 3D de verdade está na seção 5.

## 1. O que ficou pronto

| Entrega | O que é | Onde ver |
|---|---|---|
| **Giro de 360°** | Sofia, Tales, Bolota e Zum-Zum giram ao arrastar com o dedo; parados, giram sozinhos devagar. 48 quadros por personagem | `demo.html` seção 1 · `capturas/demo-01…03` · no app: Álbum → "Conheça a Sofia e o Tales" (`capturas/app-03-album-conheca-giro.png`) |
| **Corpo vivo** | Laços de vídeo com fundo transparente: dupla **parada (respira e pisca), acenando, batendo palmas, pensando, comemorando, apontando**; Sofia e Tales separados (parado, acenando); Bolota (mexe orelhas, acena); Zum-Zum (voando) | `demo.html` seção 2 · `capturas/demo-04…07` · no app: chegada (`capturas/app-02-chegada-falando.png`) e mapa da vila |
| **Boca que fala** | Busto da Sofia e do Tales com a boca sincronizada à **voz oficial**, piscadas e balanço da cabeça | `demo.html` seção 3 · vídeo `capturas/demo-boca-falando.mp4` (sem som) · tira `capturas/demo-09-tira-boca-falando.jpg` · no app: todo balão de fala |
| **Folhas de modelagem** | 8 vistas (0° a 315°) de cada personagem em fundo branco, para o artista 3D ou serviço de imagem→3D | `folhas-de-modelagem/` |

Para abrir a demonstração: sirva a **raiz do repositório** num servidor local e abra `docs/propostas/06-fonema-unificada/personagens-vivos/demo.html` (a página lê os arquivos de `app/web/public/assets/vivos/`).

## 2. Como foi feito

1. **Arte-base** (`fontes/base-*.png`): cada personagem de corpo inteiro em fundo verde liso (magenta para o Zum-Zum, que é verde), gerado com Gemini imagem a partir de `personagens-3d/dupla-opcao-1.png` e `01-folha-modelo.png`. A Sofia e o Tales sozinhos foram **recortados da mesma imagem da dupla**, para o rosto ser idêntico.
2. **Vídeos** (`fontes/videos/*.mp4`, 16 clipes de 10 s, 1280×720): gerados com `gemini-omni-1.2-flash` a partir da arte-base. Os 16 saíram bons na primeira tentativa; nenhum foi descartado.
3. **Recorte do fundo** (`ferramentas/recortar.py`): chave de cor com numpy (verde: G − max(R,B); magenta: min(R,B) − G), borda suave e remoção do reflexo da cor do fundo.
   - `giro`: acha o quadro em que a volta fecha, amostra 48 quadros compensando a velocidade irregular do vídeo e monta uma folha WebP 8×6.
   - `estado`: WebM VP9 com canal alfa (testado no Chromium), WebP animado como reserva e um pôster parado. Os últimos 10 quadros derretem de volta ao primeiro para o laço fechar.
4. **Visemas** (`ferramentas/montar_visemas.py`): os rostos por som que já existiam no Espelho do Som (`espelho-do-som-3d/recortes/rosto-*.jpg`) são alinhados pelos olhos ao rosto de boca fechada; só a região da boca vira uma camada transparente. A piscada é uma pálpebra pintada.
5. **Sincronia da boca** (`ferramentas/gerar_bocas.py` → `app/web/public/assets/vivos/bocas.json`): para cada clipe de voz, o texto vira uma sequência de visemas (regras do português do Brasil) e é encaixado na envoltória de energia do áudio por programação dinâmica: vogais nos picos, M/P/B e pausas nos vales, silêncio sempre de boca fechada. Uma letra a cada 40 ms.

**Sempre que os áudios forem regravados, rode de novo** (leva 1 minuto):
```bash
python3 docs/propostas/06-fonema-unificada/personagens-vivos/ferramentas/gerar_bocas.py app/web/public app/web/public/assets/vivos/bocas.json
```
Clipe que não estiver no `bocas.json` não fica mudo de boca: ela balbucia enquanto o áudio toca.

## 3. No app

- Componente: `app/web/src/componentes/PersonagemVivo.tsx` (+ `personagem-vivo.css`).
  ```tsx
  <PersonagemVivo quem="sofia" modo="busto" texto={textoDoBalao} />          // boca que fala
  <PersonagemVivo quem="dupla" modo="corpo" estado="acenando" gestos />      // laço vivo (+ gestos espontâneos)
  <PersonagemVivo quem="tales" modo="giro" tamanho={230} />                   // giro de 360°
  ```
- **Fala:** o componente escuta `window` `'fonema:fala'` `{ quem, texto, audio, arquivo }` e `'fonema:fala-fim'`, que `servicos/voz.ts` já dispara. Se esses eventos faltarem, uma ponte interna observa os `<audio>` que tocam e identifica o clipe (pelo caminho ou, no pacote único, pela impressão digital do blob). Com vários balões do mesmo personagem na tela, só fala o balão cujo texto contém a fala.
- **Onde entrou:** balões de fala (`Balao` em `basicos.tsx`), chegada e mapa da vila (`Mundo.tsx`), Álbum (`Extras.tsx`).
- **Acessibilidade e desempenho:** "Menos movimento" e `prefers-reduced-motion` mostram o pôster parado (a boca continua trocando, sem balanço); tudo pausa fora da tela; as bocas só são baixadas na primeira fala.
- **Safari/iPad:** o Safari não mostra a transparência do WebM. Nele o componente usa o WebP animado (8 quadros por segundo, menor). **Não foi testado em aparelho real.**
- **Bancada de teste** com os componentes e a voz reais: `npx vite -c vite.bancada.config.ts` em `app/web` e abrir `/bancada-vivo.html`.

Tamanho em `app/web/public/assets/vivos/`: **22 MB** (corpo WebM 7,5 MB · reserva WebP animado 11 MB · giro 3,2 MB · busto 0,2 MB · bocas.json 0,1 MB).

## 4. O que não ficou bom (para decidir)

- **Boca:** é um alinhamento aproximado por energia, não reconhecimento de fonemas. Abre e fecha no tempo certo; a forma exata de cada som erra às vezes.
- **Visemas incompletos:** vieram das artes do Espelho do Som. Faltam para a Sofia o I e o U próprios (usa S e CH) e para o Tales o F/V, L/T/D/N, S e CH (usa I, E, I e U). A geração de uma folha completa de visemas foi tentada e **barrada pela cota da API** (ver seção 6).
- **Busto de baixa resolução:** os rostos-fonte têm ~150 px (Sofia) e ~250 px (Tales). Bom no balão (84 px); mole se ampliado.
- **Piscada pintada:** é uma pálpebra desenhada, visível por 130 ms. Serve, mas não é bonita em tamanho grande.
- **Expressões nos balões:** o busto vivo tem uma expressão só (sorriso). Os balões perderam as variações estáticas (pensando, surpresa…) que o `Rosto` tinha.
- **Giro:** os ângulos são aproximados (o vídeo não gira em velocidade constante) e o cabelo da Sofia muda um pouco entre quadros. No Zum-Zum as asas borram.
- **Corpo:** os gestos saem e voltam ao descanso com um derretimento de 0,2 s, não com uma transição animada. No "comemorando" o vídeo desenhou risquinhos brancos no toque de mãos.
- **Sem boca no corpo inteiro:** quando a dupla aparece de corpo inteiro, a boca não acompanha a fala; só o busto do balão fala.
- **Folhas de modelagem:** são vistas tiradas do giro, com os braços soltos. **Não há pose em A/T** nem vistas ortográficas verdadeiras (têm perspectiva).

## 5. Caminho para o 3D de verdade

### O que falta
Um arquivo **glTF 2.0 binário (.glb)** por personagem, com malha, texturas, **esqueleto** e **formas de boca (blendshapes / morph targets)**, tocado em tempo real no app com three.js (já vendorizado em `mundo-3d-v2/vendor`) ou react-three-fiber.

### Duas formas de conseguir os modelos
| Opção | Como | Pontos fortes | Riscos |
|---|---|---|---|
| **A. Artista 3D no Blender** | Modela a partir das folhas (`personagens-3d/01-folha-modelo.png`, `02-expressoes.png`, `folhas-de-modelagem/`), faz retopologia, rig e blendshapes | Qualidade de filme, rosto fiel, topologia boa para a boca, controle total | Prazo de semanas por personagem; depende de contratar |
| **B. Serviço de imagem→3D + auto-rig** | Serviços de geração de malha a partir de uma ou várias imagens (há vários no mercado, pagos por crédito) geram a malha texturizada; um serviço de rig automático para bípedes coloca o esqueleto | Rápido (horas); bom para **bichos e moradores** secundários | Rosto costuma sair diferente do aprovado; malha triangulada e sem laços de boca, ruim para fala; mãos e cabelo cacheado falham; o rig automático não cria blendshapes |
| **Híbrido (recomendado)** | Opção B para um rascunho de volume de todos; artista refaz **cabeça e rosto** da Sofia e do Tales e cria os blendshapes; bichos ficam com B + limpeza | Equilíbrio entre prazo e fidelidade | Exige revisão de arte contra a folha-modelo |

Preços não estão cotados aqui: dependem de orçamento com artista e do plano do serviço escolhido.

### Linha de produção
1. Folhas de modelagem aprovadas (frente, lado, costas, 3/4, **pose em A** — falta gerar, ver seção 6).
2. Modelagem / geração → retopologia (quads, laços em volta da boca e dos olhos) → UV → texturas PBR (cor, normal, rugosidade).
3. Rig: esqueleto humanoide padrão (quadril, coluna 3, pescoço, cabeça, ombro/braço/antebraço/mão com dedos, coxa/perna/pé), mais ossos de cabelo para a Sofia e de cauda/orelhas para o Bolota; asas e antenas para o Zum-Zum.
4. Blendshapes do rosto (lista abaixo) e animações.
5. Exportação glTF 2.0 `.glb`: malha comprimida (Draco ou Meshopt), texturas KTX2/Basis, animações no mesmo arquivo ou em `.glb` separados por clipe.
6. No app: `PersonagemVivo` ganha `modo="3d"` e mantém a mesma interface; os vídeos de hoje ficam como reserva para aparelhos fracos.

### Orçamento para tablet (por personagem em cena)
| Item | Dupla (cada) | Bolota / Zum-Zum / moradores |
|---|---|---|
| Triângulos | 25–40 mil | 8–15 mil |
| Ossos | até 60 (4 influências por vértice) | até 30 |
| Texturas | 1 conjunto 2048² (1024² em aparelho fraco) | 1 conjunto 1024² |
| Materiais / chamadas de desenho | até 3 | 1–2 |
| Blendshapes ativos | 20–25 | 6–10 |
| Arquivo `.glb` | 3–5 MB | 1–2 MB |

Meta: 30 quadros por segundo com 3 personagens em cena num tablet de entrada; sem sombra em tempo real (sombra de contato pintada).

### Blendshapes de boca (visemas PT-BR, alinhados ao Espelho do Som — D020)
| Código no app | Sons | Forma |
|---|---|---|
| `.` descanso | silêncio | lábios fechados, sorriso leve |
| `m` | M, P, B | lábios juntos e pressionados |
| `a` | A, Á, Ã | boca bem aberta, queixo desce |
| `e` | É, Ê, E | meio aberta, cantos esticados |
| `i` | I | sorriso, dentes quase juntos |
| `o` | Ó, Ô, O | lábios redondos, abertos |
| `u` | U | biquinho fechado |
| `f` | F, V | dentes de cima no lábio de baixo |
| `l` | L, T, D, N, LH, NH | ponta da língua atrás dos dentes de cima |
| `s` | S, Z, C(e,i), Ç | dentes juntos, lábios entreabertos |
| `x` | CH, J, X, G(e,i) | lábios para a frente, em bico aberto |
| (novos no 3D) | R forte / K, G | fundo da língua sobe, boca entreaberta |
| (novos no 3D) | nasais ÃO, ÃE, ÕE | transição A→U, A→I, O→I com nasalização |

São os mesmos códigos do `bocas.json`: o motor de sincronia já pronto passa a mover os blendshapes em vez de trocar imagens. Além da boca: piscar (2), sobrancelhas sobe/desce/franze (6), sorriso e tristeza (4), olhos arregalados (2), bochecha inflada (1), língua para fora (1).

### Animações necessárias
- **Base:** parado respirando (2 variações), piscar, olhar para a criança, andar, correr, virar.
- **Gestos de aula:** acenar, bater palmas (1, 2, 3 e 4 sílabas), apontar (esquerda, direita, para cima), pensar, comemorar (pulo, toca-aqui), joinha, "sua vez" (mão estendida), ouvir (mão na orelha), "psiu" calmo, respirar fundo.
- **Fala:** corpo falando (gestos leves em laço) para somar com os visemas.
- **Emoção:** surpresa, dúvida, "ops" (erro sem culpa), incentivo, abraço da dupla.
- **Bichos:** Bolota (parado, farejar, virar bola, rolar, acenar, ler errado e coçar a cabeça); Zum-Zum (voar parado, zunir em volta, distrair-se, pousar, prestar atenção); Paçoca e o gato (parado, andar, sentar, abanar/ronronar).

## 6. O que ficou sem fazer (cota da API)

Depois de 7 imagens (5 aproveitadas) e 16 vídeos, a API Google passou a responder **429 (teto mensal de gastos) e 402 (créditos esgotados)**. Ficou faltando:
- folha de **visemas completa** de cada personagem (12 posições no mesmo enquadramento, incluindo olhos fechados);
- **folhas ortográficas limpas com pose em A** (as que estão em `folhas-de-modelagem/` são vistas do giro);
- **Paçoca** (cachorro) e o **gato** — sem arte-base, sem giro;
- estados separados da Sofia e do Tales além de parado e acenando;
- corpo "falando".

Os comandos estão em `ferramentas/` e os prompts usados estão em `fontes/PROMPTS.md`; com a cota de volta, cada item é uma chamada de imagem ou de vídeo.

## 7. Arquivos

```
personagens-vivos/
├── README.md, demo.html
├── fontes/            artes-base (5 PNG), PROMPTS.md e videos/ (16 MP4 originais, 50 MB)
├── ferramentas/       recortar.py · montar_visemas.py · gerar_bocas.py · folha_de_modelagem.py
│                      capturar-demo.mjs · gravar-boca-falando.mjs · provar-na-bancada.mjs · provar-no-app.mjs
├── folhas-de-modelagem/   sofia · tales · bolota · zum-zum (8 vistas)
└── capturas/          demo-*.png, app-*.png, demo-boca-falando.mp4
app/web/public/assets/vivos/   giro/ · corpo/ · busto/ · bocas.json
app/web/src/componentes/       PersonagemVivo.tsx · personagem-vivo.css
```
