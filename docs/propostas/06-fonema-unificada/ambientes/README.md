# FONEMA · Ambientes para desbravar

Esta pasta traz a **série de cenários ilustrados** da jornada: as 11 regiões do mapa (seção 4.2 do [documento mestre](../../../sintese/00-documento-mestre.md)) e 5 interiores da vila. Ela atende ao item 4 da [Decisão 006](../../../decisoes/006-academia-uniforme-elenco-voz.md), "muitos ambientes para desbravar, 100% profissionais", e ao item 5, "jornada conectada". Também cumpre o requisito 1 da [Decisão 005](../../../decisoes/005-proposta-unificada.md): cenários mais ricos.

> **O que é isto.** É **arte de referência** vetorial feita em código (SVG em `fonte/`), renderizada pelo Playwright em PNG 2560×1600 (escala 2×). Ela fixa a composição, a paleta, a luz, a fauna e a flora e os pontos exploráveis de cada lugar. A versão de produção será repintada por ilustradora e animada em Rive, como os personagens ([../personagens/README.md](../personagens/README.md)).

## 1. Arquivos

| Arquivo | Conteúdo |
|---|---|
| `01-quintal-vila.png` … `11-arquipelago-dos-livros.png` | As 11 regiões, uma por etapa da ordem de ensino |
| `int-biblioteca.png`, `int-padaria.png`, `int-escola-sala.png`, `int-oficina-robos.png`, `int-casa-sofia-quarto.png` | Interiores da vila |
| `mosaico-ambientes.png` | Os 16 ambientes em miniatura, na ordem da jornada |
| `paralaxe-camadas.png` | O Cerrado decomposto em 5 camadas, com a velocidade de cada uma e as regras de movimento no app |
| `fonte/` | `lib.js` (motor de cenário: céu, relevo, copas com volume, palmeiras, água, reflexos, fauna, luz, grão), `regioes.js`, `interiores.js`, `render.js` e `extras.js` (pranchas). `fonte/camadas/` guarda as camadas isoladas do Cerrado; `fonte/hotspots.json` traz as coordenadas dos pontos exploráveis |

Para gerar tudo de novo: `node fonte/render.js` e depois `node fonte/extras.js`. Para um só ambiente: `node fonte/render.js 06-cerrado`.

## 2. Regras de arte (valem para todos)

- **Camadas de paralaxe.** Todo SVG tem 5 grupos: `layer-sky`, `layer-far`, `layer-mid`, `layer-near` e `layer-fg`, mais um `layer-fx` com vinheta, grão e luz quente. As velocidades são 0,08×, 0,25×, 0,55×, 1,0× e 1,25×. No **modo leve** ficam só 2 camadas e não há partículas.
- **Profundidade.** Usamos perspectiva atmosférica, em que os planos distantes se misturam à cor da névoa. O primeiro plano fica desfocado (2–3 px) e a luz tem direção clara: sol, raios, sombras longas, contraluz. Tudo recebe o mesmo grão de papel e uma vinheta quente.
- **Paleta.** É quente e ilustrada, coerente com a Sofia e o Bolota. Cada região tem uma "hora" própria, para que a criança reconheça onde está pela cor.
- **Pessoas.** Os cenários não têm personagens: o foco é o lugar. A Sofia, o Bolota e o elenco entram por cima, em 2D. **Nenhum adorno** aparece em lugar nenhum (D006).
- **Pontos exploráveis ✦.** Cada cenário tem **5 objetos** marcados com um brilho sutil: um halo, uma borda pontilhada e três faíscas. O brilho mora na camada do objeto e acompanha a paralaxe. O toque segue o ciclo da lição: **som inicial → sílabas → palavra falada e escrita** (Andika), com a palavra entrando no Caderninho. Nas regiões, os nomes são **palavras decodificáveis na etapa da região** ou em etapas anteriores. Os interiores são visitados a jornada toda: cada ponto ✦ só oferece a leitura quando a etapa indicada na tabela da seção 4 foi dominada; antes disso, a palavra é só ouvida. As coordenadas estão em `fonte/hotspots.json`, em pixels lógicos de 1280×800.
- **Áudio espacial.** Cada ambiente tem uma "cama" contínua, que toca baixa durante as lições (−18 dB sob a voz), e 3–5 fontes pontuais posicionadas no estéreo conforme a camada. Os sons pontuais **nunca coincidem** com o momento em que a criança fala.

## 3. As 11 regiões

### 01 · Quintal da Sofia / Vila do Bolota (R0 · etapa 0)
- **Etapa fônica:** consciência fonológica oral: rima, sílaba e som inicial.
- **Pontos ✦:** **bola**, **pipa**, **gato**, **pato**, **sapo**. Trazem a família de rimas *gato · pato · sapo* e as sílabas *bo-la* e *pi-pa*. Nesta etapa ainda não há leitura: a palavra é ouvida, batida em sílabas e só então mostrada.
- **Fauna e flora:** mangueira com mangas, horta (alface, cenoura), gramado com flores, cachorro, gato, pato, sapo e borboletas.
- **Clima e hora:** manhã ensolarada, céu limpo, sol baixo à esquerda.
- **Sons ambientes:** bem-te-vi, galo distante, varal ao vento, latido curto, água do laguinho, sino da igrejinha da vila ao longe.
- **Ligação com a próxima:** a pipa voa para a direita, rumo ao mar. "Vamos seguir a pipa?" leva à ponte de barco até a Ilha das Vogais.

### 02 · Ilha das Vogais (R1 · etapa 1)
- **Etapa fônica:** vogais A E I O U, com é/ê e ó/ô.
- **Pontos ✦:** **ave** (atobá na pedra), **estrela**-do-mar, **ovo** (ninho de tartaruga-marinha), **uva**-da-praia, **onda**. Cada objeto é marcado pela **vogal inicial**, que é o som trabalhado. Como leitura, só entram as vogais e os encontros vocálicos decodificáveis: *oi*, *ai*, *eu*, *ui*.
- **Fauna e flora:** coqueiros, uva-da-praia (*Coccoloba*), salsa-da-praia, atobá, fragata, caranguejo e ninho de tartaruga-marinha.
- **Clima e hora:** meio-dia luminoso, mar turquesa, nuvens altas.
- **Sons ambientes:** ondas em ciclo de 8 s, espuma na pedra, vento nos coqueiros, gaivotas e o caranguejo correndo na areia.
- **Ligação com a próxima:** no fim da praia, um rio de água doce desce da serra. "De onde vem essa água?" sobe para a Mata Atlântica.

### 03 · Mata Atlântica, Vale do M-L-F e Trilha do V-S-N (R2a/R2b · etapa 2)
- **Etapa fônica:** consoantes contínuas M, L, F, V, S e N em sílabas CV.
- **Pontos ✦:** **lua** (lua pálida da manhã), **lama** (poça), **fila** (formigas no tronco), **favo** (abelhas jataí no oco), **ovo** (ninho). Como os sons são contínuos, a Sofia prolonga o som: /lll/-ua, /fff/-avo.
- **Fauna e flora:** cachoeira e poço, quaresmeira (roxa), embaúbas prateadas, palmito-juçara, samambaiaçu, bromélias; mico-leão-dourado, tucano-de-bico-verde, borboleta-azul (*Morpho*) e formigas-cortadeiras.
- **Clima e hora:** manhã de neblina com fachos de luz entre as copas e as serras em camadas.
- **Sons ambientes:** cachoeira (cama), sabiá, chamado do tucano, gotas, folhas e o zumbido leve das abelhas no ponto do favo.
- **Ligação com a próxima:** a R2a termina na "**ponte em obras**", o fim da parte gratuita, sem cadeado. Depois dela, a R2b segue pela trilha até as campinas do sul: a mata se abre no Pampa.

### 04 · Pampa (R3 · etapa 3)
- **Etapa fônica:** oclusivas P, T, B e D, com P antes de B e T antes de D, em lições separadas no tempo e só depois contrastadas.
- **Pontos ✦:** **boi**, **pato** (açude), **bota**, **tatu** (tatu-mulita) e **pote** de barro. Os pares de contraste só aparecem juntos depois da consolidação (*pato/bota*, *tatu/dado*).
- **Fauna e flora:** coxilhas, umbu solitário (*Phytolacca dioica*), capim-dos-campos, cavalos crioulos, boi, ema, quero-quero e marrecas; estância com galpão e moinho.
- **Clima e hora:** pôr do sol com a lua já no céu, o que materializa a pergunta-guia "o que muda do dia para a noite?".
- **Sons ambientes:** vento no campo (cama), quero-quero (alarme típico), mugido distante, moinho rangendo, patos e grilos que começam ao escurecer.
- **Ligação com a próxima:** um arroio do açude corre para o norte, e as cheias alagam o caminho: chegada ao Pantanal.

### 05 · Pantanal (R4 · etapa 4)
- **Etapa fônica:** J, Z, X/CH, NH e LH, além de frases curtas.
- **Pontos ✦:** **ninho** (tuiuiús na piúva), **chalana**, **jabuti**, **folha** (aguapé) e **chuva** (pancada ao longe). Frase-modelo: "o jabuti olha a chuva".
- **Fauna e flora:** piúva (ipê-roxo do Pantanal), carandás, aguapés com flor, capões no horizonte; tuiuiús, jacarés, capivaras, garça-branca e jabuti.
- **Clima e hora:** amanhecer dourado com bruma sobre a água e uma chuva passando à direita, que liga com "por que a água sobe e desce?".
- **Sons ambientes:** água parada com pequenos marulhos (cama), bater de bico do tuiuiú, capivaras, jacaré submergindo, sapos e trovão abafado ao longe.
- **Ligação com a próxima:** a chalana sobe o rio até onde a terra fica alta e seca: o Cerrado.

### 06 · Cerrado (R5 · etapa 5)
- **Etapa fônica:** regras contextuais C/QU, G/GU, R/RR, S/SS e Ç.
- **Pontos ✦:** **pequi** (QU), **coruja** (C, R e J), **caju**, **arara** (R entre vogais) e **seriema**.
- **Fauna e flora:** chapadas, vereda de buritis, pequizeiro, ipê-amarelo, árvores tortuosas de casca grossa, cajuzinho-do-cerrado, canela-de-ema e cupinzeiros; lobo-guará, seriema, coruja-buraqueira, araras-canindé e tatu.
- **Clima e hora:** fim de tarde dourado da estação seca, com sol baixo, sombras longas e pólen no ar.
- **Sons ambientes:** cigarras (cama), canto da seriema (marcante, à direita), araras ao longe, capim seco no vento e o pio da coruja ao entardecer.
- **Ligação com a próxima:** a trilha de terra vermelha segue para o nordeste, e o verde vai ficando cinza: chegada à Caatinga.
- **Paralaxe:** este é o cenário decomposto em `paralaxe-camadas.png`.

### 07 · Caatinga / Sertão (R6 · etapa 6 · chefe do Ano 1)
- **Etapa fônica:** nasalidade: ã, am/an, em/en, im, om/on, um/un, e m antes de p/b.
- **Pontos ✦:** **mandacaru** (an), **umbu** (um), **jumento** (en), **sanfona** (an, on) e **moringa** (in).
- **Fauna e flora:** mandacaru em flor, xique-xique, umbuzeiro com frutos, juazeiro verde, caatinga cinzenta de galhos secos e lajedos; jumento, asa-branca, calango; casa de taipa com alpendre e cisterna.
- **Clima e hora:** tarde quente com céu azul profundo e chão rachado, que liga com "como se vive bem com pouca água?".
- **Sons ambientes:** vento seco (cama), asa-branca, zurro do jumento, chocalho de bode ao longe, sanfona tocando baixinho no alpendre (só no mapa, nunca na lição) e a água caindo na moringa.
- **Ligação com a próxima:** o desafio-chefe do Ano 1 acontece no alpendre. Depois dele, a asa-branca voa para oeste, "atrás da chuva", e abre o Ano 2 na Amazônia.

### 08 · Amazônia (R7 · etapa 7 · abre o Ano 2)
- **Etapa fônica:** sílabas CVC e ditongos.
- **Pontos ✦:** **peixe** (ei), **cacau** (au), **ouriço** de castanha (ou), **garça** (CVC: *gar*) e **barco** (CVC: *bar*).
- **Fauna e flora:** sumaúma emergente, açaizeiros, cacaueiro com frutos no tronco, vitórias-régias; boto-cor-de-rosa, tambaqui, garça, araras-vermelhas e tucano; palafitas e barco de linha.
- **Clima e hora:** manhã úmida, com bruma no rio e fachos de luz entre as folhas.
- **Sons ambientes:** floresta densa (cama de insetos e aves), respiração do boto, remo n'água, chuva fina em ciclos e o motor de barco distante.
- **Ligação com a próxima:** o barco desce o rio até a foz e o mar: Litoral e Mar.
- **Cuidado de conteúdo:** as palafitas e o barco representam comunidades ribeirinhas. As representações indígenas dependem da consultoria (seção 4.2).

### 09 · Litoral e Mar (R8 · etapa 8)
- **Etapa fônica:** encontros consonantais CCV: PR, BR, TR, CR, GR, FR, DR, PL, BL, CL, FL.
- **Pontos ✦:** **fragata** (FR), **flor** (FL; salsa-da-praia na duna), **pedra** (DR; com anêmonas), **estrela**-do-mar (TR) e **prancha** (PR).
- **Fauna e flora:** corte acima e abaixo d'água com recife de coral (gorgônias, coral-cérebro), tartaruga-marinha, cardumes, anêmonas, cauda de baleia-jubarte ao longe e fragata; jangadas e vila de pescadores com coqueiros.
- **Clima e hora:** fim de tarde, com reflexo do sol no mar e cáusticas de luz debaixo d'água.
- **Sons ambientes:** acima d'água, ondas e vento nas velas; abaixo, uma cama abafada e bolhas. A transição entre os dois acompanha a rolagem vertical. Há ainda o canto de baleia ao longe.
- **Ligação com a próxima:** as jangadas voltam ao porto, e do porto sai o bonde para a Cidade das Letras. "O que o mar traz e leva" é trabalhado com a consultoria ERER.

### 10 · Cidade das Letras / Oficina (R9 · etapa 9)
- **Etapa fônica:** concorrências S/Z/X, CH/X, J/G e H; -ou, -ão, -inho.
- **Pontos ✦:** **relógio** (G antes de i), **horta** (H inicial), **chave** (CH), **caixa** (X) e **balão** (-ão).
- **Fauna e flora:** urbana. Horta comunitária em canteiros, gato na calçada, sobrados coloridos, torre do relógio, bonde, chaveiro e caixotes de feira.
- **Clima e hora:** hora azul com janelas acesas e toldos da feira em 2–3 cores, que liga com "quem constrói e faz a cidade funcionar?".
- **Sons ambientes:** murmúrio de praça (cama), sino do bonde, tique-taque e badalada do relógio, ferramentas na oficina e pombos.
- **Ligação com a próxima:** do alto da torre se vê o farol do Arquipélago dos Livros. A badalada final abre a ponte para o desafio último.

### 11 · Arquipélago dos Livros (R10 · etapa 10 · chefe final e pós-jogo)
- **Etapa fônica:** fluência, palavras frequentes ("que", "não", "muito", "também", "homem"), textos.
- **Pontos ✦:** **farol**, **cometa**, **nuvem**, **luneta** e **livro**. Os textos curtos lidos aqui completam o "Livro da minha jornada".
- **Elementos:** ilhas de livros empilhados com árvores, farol com dois fachos de luz, constelação em forma de livro aberto, lua crescente, cometa, "cascata" de vogais caindo de uma ilha (memória da R1) e barquinho com lanterna.
- **Clima e hora:** noite estrelada e mar calmo, que liga com "o que o céu e o tempo contam?".
- **Sons ambientes:** mar noturno suave (cama), virar de páginas, vento leve, buzina grave do farol a cada 20 s e um brilho sonoro (sininho) quando o cometa passa.
- **Ligação:** é o fim da trilha principal. O **pós-jogo** volta a todas as regiões em revisão espaçada, e o farol "ilumina" no mapa as regiões que pedem revisão.

## 4. Interiores da vila

| Interior | Pontos ✦ (etapa em que são decodificáveis) | Elementos | Luz e sons |
|---|---|---|---|
| **Biblioteca** (Jaci) | **lupa**, **tapete** (e3) · **mesa** (e5, s = /z/) · **livro**, **globo** (e8) | Estantes em perspectiva, janela em arco com ipê, escada, poltrona, tapete, gato | Facho de manhã, luminárias; páginas, relógio de parede, gato ronronando |
| **Padaria** (Seu Kenji) | **bolo** (e3) · **café** (e5) · **pão** (e6) · **forno** (e7) · **broa** (e8) | Forno a lenha aceso, azulejos, vitrine, quadro de menu em ícones, saco de farinha, cesto de pães | Brasa quente e luz de janela lateral; estalo da lenha, sino da porta, crocância do pão |
| **Sala de aula** | **sino** (e2) · **mapa** (e3) · **mesa**, **cola** (e5) · **giz** (e9, g diante de i) | Lousa com *pa-to* e "o pato nada.", friso do alfabeto (vogais em laranja, consoantes em azul, como no app), mapa do Brasil, carteiras, mochila | Luz da manhã; giz, cadeiras e sino do recreio. Serve de cenário ao **modo sala** |
| **Oficina de robôs** (Lia) | **mola**, **fio** (e2) · **lata** (e3) · **roda**, **robô** (e5, R forte) | Painel de ferramentas, engrenagens, janela industrial, parede de tijolo, robô de bancada e robozinho de chão | Luz de fim de tarde; motor, chave de fenda, bip do robô |
| **Quarto da Sofia** | **bola**, **pipa**, **sapo** (e3) · **cama** (e5, C) · **lua** (e2) | Cama com colcha de chita, pipa na parede, estante de brinquedos, janela com lua e vila à noite, abajur | Noite aconchegante; grilos, vento na cortina. É o cenário do **ritual de encerramento** (D: "termina em alta") |

## 5. Como a jornada se conecta (neurociência embutida)

1. **Fio narrativo físico.** Cada cenário mostra **a saída para o próximo**: a pipa, o rio, a ponte, o arroio, a chalana, a trilha, a asa-branca, o barco, o bonde e o farol. A criança vê para onde vai e cria antecipação, sem pressão de tempo, porque o avanço é sempre por domínio.
2. **Uma cor e uma hora por região.** A manhã do quintal, o meio-dia da ilha, a neblina da mata, o pôr do sol do pampa, o amanhecer do pantanal, o entardecer do cerrado, a tarde quente da caatinga, a manhã úmida da Amazônia, o fim de tarde do litoral, a hora azul da cidade e a noite do arquipélago. Essas pistas de contexto ajudam a recuperar a memória (codificação dependente de contexto) e marcam o tempo da jornada.
3. **Revisão espaçada no mapa.** Voltar a uma região conta como revisão. Os pontos ✦ de regiões antigas reaparecem na sessão do Jardim da Revisão.
4. **Carga cognitiva baixa.** Há no máximo 5 pontos ✦ por cena. O brilho é sutil e nunca pisca rápido. Durante a lição, o cenário recua: fica desfocado e 20% mais escuro, e a paralaxe para.
5. **Conhecimento de mundo.** A fauna e a flora de cada bioma alimentam a camada A de leitura em voz alta da região, com as 3 palavras pré-ensinadas (seção 4.4).

## 6. Pendências

- Validar a fauna, a flora e as representações culturais com as consultorias de biologia, ERER e cultura indígena.
- Validar com as especialistas a lista de palavras por etapa. Por exemplo, "mesa" exige S intervocálico (/z/), "cama" e "cola" exigem C diante de a/o, e "giz" exige G diante de i.
- Na produção, repintar com textura de pincel e animar as camadas em Rive (balanço de copas, água, partículas).
- Os PNGs têm de 3 a 5 MB por causa do grão. No app, usar WebP/AVIF por camada, com o grão aplicado em shader.
