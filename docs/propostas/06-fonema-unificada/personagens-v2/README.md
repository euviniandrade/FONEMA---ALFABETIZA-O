# FONEMA · Personagens v2: uniforme, sem adornos, elenco ampliado e zoom na boca

Esta pasta é a **bíblia visual v2**. Ela aplica a [Decisão 006](../../../decisoes/006-academia-uniforme-elenco-voz.md), itens 2, 3 e 7:

- a Sofia ganha uniforme escolar e fica sem nenhum adorno;
- todo o elenco também fica sem adornos;
- o elenco passa a ter 12 moradores com profissões e 8 animais;
- o **zoom na boca** fica detalhado e didático.

Ela substitui a v1 ([../personagens/](../personagens/README.md)) apenas nos pontos descritos aqui. Bolota, ambientes, voz e as regras pedagógicas da v1 continuam valendo.

> **O que é isto.** É **arte de referência** vetorial, feita em SVG à mão (código em `fonte/`) e renderizada em PNG pelo Playwright com `deviceScaleFactor: 2`. Ela fixa proporções, paleta, personalidade e camadas de animação. A versão de produção será redesenhada por ilustradora profissional e animada em Rive.

## 1. Arquivos

| Arquivo | Conteúdo |
|---|---|
| `sofia-uniforme-folha-modelo.png` | Turnaround (frente, ¾, perfil, costas), grade em cabeças, emblema bordado, close do rosto, paleta v2 e a regra "sem adornos" |
| `sofia-uniforme-expressoes.png` | 12 expressões em busto, para ler bem o rosto |
| `sofia-uniforme-poses.png` | 8 poses de ensino: apontar, mão no pescoço, dedo no nariz, ouvir, celebrar, explicar, convidar e despedir |
| `elenco-profissoes.png` | 12 moradores com profissão, idade, personalidade e sons ou palavras |
| `animais-da-vila.png` | 8 animais com nome, função e sons, mais a faixa do Bolota |
| `boca-zoom-m-p-b.png` | Pranchas de /m/, /p/ e /b/ |
| `boca-zoom-f-v.png` | Pranchas de /f/ e /v/ |
| `boca-zoom-s-l-a.png` | Pranchas de /s/, /l/ e /a/ |
| `tela-espelho-do-som-v2.png` | Tela de lição 2560×1600 com o Espelho do Som grande |
| `elenco-completo-praca.png` | Praça da Vila com a Sofia, o Bolota, os 12 moradores e os 8 animais |
| `fonte/` | Código. Para gerar tudo, rode `node fonte/render.js`. Para gerar uma prancha só, rode `node fonte/render.js boca-zoom-f-v` |

**Arquivos do código:**
- `core.js`: paleta e gradientes;
- `sofia.js`: Sofia, com rosto refinado, uniforme e emblema;
- `mouth.js`: visemas de lip-sync;
- `boca.js`: close frontal e corte sagital;
- `people.js`: gerador de moradores, com cabelos, chapéus e roupas de cada profissão;
- `animais.js`;
- `bolota.js`;
- `env.js`: a praça, com o elenco passado como parâmetro;
- `pages.js`: as pranchas;
- `render.js`.

## 2. Regra v2: sem adornos (vale para todo o elenco)

1. **Proibido:** brincos, colares, pulseiras, anéis, miçangas, fivelas e presilhas decorativas, laços, tiaras, óculos decorativos, pingentes e estampas de enfeite em acessórios.
2. **Permitido, porque é acessibilidade ou função:**
   - óculos de grau (Dona Cida);
   - aparelho auditivo (Iara);
   - bengala (Dona Cida);
   - cadeira de rodas (Davi);
   - óculos de proteção de laboratório (Lia, como EPI);
   - equipamento de trabalho: capacete, estetoscópio, crachá, binóculo, bolsa de cartas;
   - material escolar: a mochila da Sofia.
3. **Cabelo:** solto ou preso **sem enfeite**. Se preso, usar só elástico liso da cor do cabelo.
4. **Animais:** sem coleiras enfeitadas, laços ou roupinhas. Os alforjes do burrinho são carga (a biblioteca itinerante).
5. **Identidade** vem do rosto, do cabelo, da silhueta, da cor e do uniforme ou roupa de trabalho, nunca de enfeites.

## 3. Sofia v2

### 3.1 O que mudou da v1
| v1 | v2 |
|---|---|
| Fivela de flor de ipê | **removida**: cabelo cacheado volumoso 3C/4A solto, sem enfeite |
| Brincos de bolinha e pulseira de miçangas | **removidos** |
| Camiseta Manga com letra estampada | **Polo do uniforme**: branca, com gola, mangas e barra Manga `#F28C28`, carcela de 2 botões e **emblema bordado** no peito |
| Bermuda jeans | **Bermuda do uniforme** azul-marinho `#2E4374`, com faixa lateral Manga |
| Alças de couro | Alças da mochila na cor da mochila. Na tampa de trás, etiqueta "FONEMA" |
| Olhos redondos simples | Olhos em amêndoa, íris com gradiente e anel escuro, 3 brilhos, vinco da pálpebra, pálpebra grossa que afina e 3 cílios no canto externo, linha inferior suave |
| Nariz em traço | Nariz com asas, sombra de base e brilho na ponta. Luz na testa e nas maçãs do rosto |

### 3.2 O emblema bordado
- **Forma:** escudo arredondado Manga, com pesponto tracejado e fundo creme.
- **Letra da semana:** fica dentro do escudo, em Anil `#1D4ED8`, ou em Urucum `#C2410C` quando for vogal, e troca a cada fase.
- **Nome:** "FONEMA" aparece embaixo, em Fredoka.

O emblema é parte do uniforme, não é adorno. É também o único lugar onde a letra aparece no corpo da Sofia.

### 3.3 Paleta v2
| Papel | HEX |
|---|---|
| Pele / luz / sombra | `#A86B47` / `#C48A62` / `#7E4E33` |
| Cabelo / brilho | `#2E1B12` / `#6B4130` |
| Polo do uniforme / sombra | `#FBFAF6` / `#DCD6C9` |
| Gola, mangas e barra Manga | `#F28C28` (luz `#FFB461`, sombra `#CF6716`) |
| Bermuda do uniforme | `#2E4374` (sombra `#1F2E55`) |
| Mochila escolar | `#1F7A70` / `#38A090` |
| Tênis | branco, sola e cadarço `#2F7D4F` |
| Contorno | `#3A2218` (nunca preto puro) |

Proporção (4 cabeças), regras de uso, voz e personalidade continuam como na bíblia v1, §2.

## 4. Elenco: 12 moradores (fichas)

| # | Nome | Idade · profissão | Personalidade | Visual (sem adornos) | Sons e palavras que apresenta |
|---|---|---|---|---|---|
| 1 | **Seu Kenji** | 58 · padeiro | Paciente e madrugador. Ensina a esperar o pão crescer | Nipo-brasileiro, chapéu e avental de padeiro, bandeja de pães | /p/ PÃO, PIPOCA, PATO |
| 2 | **Jaci** | 35 · bibliotecária | Calma e curiosa, conduz a hora do conto | Guarani, cabelo liso longo, cardigã, pilha de livros | /l/ LIVRO, LUA, LOBO |
| 3 | **Dra. Rosa** | 45 · médica do posto | Acolhedora e prática. Lava as mãos cantando e pede "abre bem: aaa!" | Preta, coque crespo, jaleco, estetoscópio, crachá, prancheta | /s/ SAÚDE, SOPA, SAPO |
| 4 | **Bento** | 31 · bombeiro | Corajoso e brincalhão, treina a brigada mirim | Pardo, capacete e farda vermelha com faixas refletivas, balde | /b/ BOMBEIRO, BALDE, BOLA ("o /b/ estoura como bolha") |
| 5 | **Carla** | 27 · carteira | Animada, conhece cada rua. Entrega cartas com palavras para ler | Branca, ruiva e sardenta, boné e polo de trabalho, bolsa de cartas | /k/ CARTA, CASA, CAIXA |
| 6 | **Dona Vera** | 52 · agricultora | Persistente: "semente e som precisam de tempo" | Cabocla, trança, chapéu de palha, camisa xadrez, botas, cesta da horta | /v/ VERDURA, VACA, UVA |
| 7 | **Seu Nonato** | 67 · pescador | Voz mansa, conta histórias do rio, ensina a respirar antes de falar | Preto, idoso, barba branca, chapéu de pescador, colete, vara | /r/ REDE, REMO, RIO |
| 8 | **Davi** | 28 · professor de música | Alegre e rítmico, marca as sílabas no pandeiro | Cadeirante (cadeira esportiva), barba, camiseta verde-mar | /t/ TAMBOR, TATU, TOM |
| 9 | **Lia** | 40 · cientista e inventora | Inventiva, erra e testa de novo junto com o robô Tec | Preta retinta, locs, macacão, óculos de proteção (EPI), frasco | /i/ IDEIA, ÍMÃ, ILHA |
| 10 | **Dona Cida** | 72 · artesã (bordadeira) | Avó do bairro, conta histórias da roça, parlendas e cantigas | Preta, cabelo branco, óculos de grau, bengala, bastidor de bordado | /f/ FIO, FITA, FIGO |
| 11 | **Seu Jorge** | 49 · motorista do ônibus escolar | Pontual e cuidadoso. Brinca de achar letras nas placas | Moreno, bigode, quepe e camisa de motorista, crachá | /ʒ/ JANELA, JOGO, JUNTO |
| 12 | **Iara** | 26 · guarda-parque | Atenta aos sons da mata, cuida dos bichos | Parda, trança, **aparelho auditivo** azul, chapéu de guarda, binóculo, mapa | /m/ MATA, MICO, MEL |

**Princípios do elenco:**
- A deficiência faz parte da vida e nunca vira "lição de superação".
- Profissões sem estereótipo de gênero.
- Representatividade alinhada ao Censo 2022: pardos, pretos, indígenas, amarelos e brancos.
- Validar com consultoria de diversidade e com as próprias comunidades.

## 5. Animais da vila (fichas)

| Animal | Nome | Personalidade e função na vila | Sons e palavras |
|---|---|---|---|
| Cachorro caramelo | **Paçoca** | Leal e animado, acompanha a carteira Carla nas entregas | /p/ PAÇOCA, AU-AU |
| Gatinha tigrada | **Nina** | Tranquila, mora na biblioteca e dorme no colo de quem lê | /n/ NINA, MIAU |
| Papagaio-verdadeiro | **Loro** | Tagarela, repete os sons: é o **jogo do eco** ("fala comigo: mmm!") | /l/ LORO, LÁ-LÁ |
| Jabuti-piranga | **Dona Lenta** | Sem pressa, ensina a falar devagar e **esticar o som** ("sssapo") | /ʒ/ JABUTI, DEVAGAR |
| Capivara | **Capi** (com o passarinho amigo) | Calma, guardiã do lago, faz a **respiração** antes da lição | /k/ CAPI, CALMA |
| Mico-leão-dourado | **Faísca** | Rápido, dono das rimas e dos trava-línguas da Mata Atlântica | /f/ FAÍSCA, FOLHA |
| Galinha caipira | **Dona Cocó** | Bate as asas a cada **sílaba**: co-có-ri-có | /g/ GALINHA, sílabas |
| Burrinho | **Fubá** | Teimoso e gentil, carrega a **biblioteca itinerante** | /b/ BURRO, LIVROS |
| Tatu-bola | **Bolota** | Continua o parceiro principal: o único que **erra de propósito** para a criança corrigir (bíblia v1, §3) | erros planejados p/b, f/v |

Os animais nunca disputam atenção com a letra. Aparecem em cenas, histórias, mapas e no reforço de fim de bloco.

## 6. Zoom na boca (Espelho do Som v2)

Cada prancha traz três partes lado a lado.

**(a) Close frontal da boca da Sofia, do nariz ao queixo, com luz de estúdio:**
- **Luz:** principal de cima à esquerda, sombra lateral e brilho nas maçãs e no queixo.
- **Lábios:** arco do cupido, gradientes, brilho no lábio de baixo e linhas finas.
- **Dentes:** individuais (incisivos, laterais, caninos e pré-molares recuados) com reflexo.
- **Boca por dentro:** língua com sulco central e brilho; úvula e garganta no /a/; parte de baixo da língua e espaços laterais no /l/; sombra sob o lábio de cima.
- **Pistas visuais:**
  - sopro saindo do nariz no /m/;
  - estouro nos cantos no /p/ e no /b/;
  - vento na frente da boca no /f/, /v/ e /s/;
  - selo amarelo de "garganta vibra" nos sons com voz.

**(b) Corte lateral (sagital) colorido, mostrando:**
- **Estruturas:** nariz (cavidade nasal com conchas), céu da boca (osso), véu e úvula, língua, dentes, lábios, garganta, epiglote e pregas vocais.
- **Seta do ar:** pontilhada, mostra o caminho de cada som:
  - pelo nariz no /m/;
  - pressão e "puf!" no /p/ e no /b/;
  - entre o dente e o lábio no /f/ e no /v/;
  - chiado na ponta da língua no /s/;
  - pelos lados da língua no /l/;
  - livre no /a/.
- **Véu fechado:** marcado com ⊘.
- **Vibração:** ondas amarelas no pescoço e etiqueta "vibra! zzz", ou "garganta quieta".
- **Rótulos:** em linguagem infantil.

**(c) Cartão do som:**
- letra maiúscula e minúscula;
- botão /som/;
- par mínimo ou família;
- palavra-chave com a letra-alvo sublinhada;
- 4 pistas: lábios, ar, garganta e um teste com o corpo;
- **dica lúdica da Sofia** em 1 frase.

| Som | Dica lúdica |
|---|---|
| /m/ | Boca fechadinha e o som sai pelo nariz: mmm… como quando a comida está gostosa! |
| /p/ | Os lábios seguram o ar e soltam um sopro: p! Um papelzinho na frente da boca balança. |
| /b/ | Igual ao /p/, mas a garganta liga o motorzinho: b-b-b, como uma bola quicando! |
| /f/ | Dentes de cima no lábio de baixo e um ventinho: fff… como apagar a vela devagar. |
| /v/ | A mesma boca do /f/, mas a garganta vibra: vvv… como um aviãozinho voando! |
| /s/ | Dentes juntinhos, sorriso e um chiado de cobrinha: sss! |
| /l/ | A pontinha da língua sobe e encosta atrás dos dentes de cima: lá-lá-lá, a língua dança! |
| /a/ | Boca bem aberta, língua deitadinha e a garganta canta: aaa… como no médico! |

**Animação (Rive):**
- **Camadas nomeadas:** cada parte do SVG tem um `data-layer` (`labioSup`, `labioInf`, `dentesSup`, `dentesInf`, `lingua`, `mandibula`, `veu`, `uvula`, `ar`, `vibracao`, `pregas`) e vira osso ou estado.
- **Seta do ar:** anima com `stroke-dashoffset`.
- **Vibração:** pulsa a 3–4 Hz (sem flash).
- **Mandíbula:** gira em torno da ATM (`PIV` em `boca.js`) e leva junto a língua, os dentes de baixo e o lábio de baixo.
- **Linha do tempo:** tem 3 passos (posição, som, saída para a vogal), com controles de ½× e "de novo".

**Validação:** revisão por 2 fonoaudiólogas antes da produção.

### 6.1 Tela de lição v2 (`tela-espelho-do-som-v2.png`)
- **Problema corrigido:** na v1, a boca ficava pequena num recorte de 240 px.
- **Espelho do Som:** agora ocupa **776×494** no centro da tela. A boca frontal ocupa 352×360, com lábios de cerca de 250 px de largura, e o corte lateral tem 360×324.
- **Fala da Sofia:** a Sofia fica à esquerda, de uniforme, apontando para o Espelho, com a fala no balão.
- **Coluna da direita:** letra e palavra MALA.
- **Embaixo:**
  - espelho local da criança, que não grava;
  - botão de falar;
  - o Bolota no canto.
- **Corte lateral:** sem rótulos pequenos, com 2 etiquetas grandes ("ar pelo nariz", "véu aberto").

## 7. Próximos passos
1. **Ilustradora:** redesenha a partir desta referência, com a mesma regra "sem adornos" e o mesmo uniforme.
2. **Rive:** monta o rig do Espelho do Som com as camadas do §6, sobre os 8 sons iniciais, e depois estende aos demais fonemas do pt-BR.
3. **Validação:** fonoaudiólogas validam os cortes, e uma consultoria de diversidade valida o elenco.
4. **Vozes:** cada morador ganha uma voz no ElevenLabs, ligada às frases e histórias (Decisão 006, item 6). Os fonemas isolados continuam gravados por fonoaudióloga.
