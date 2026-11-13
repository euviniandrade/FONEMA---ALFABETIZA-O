# 04 — Mercado, Apps/Jogos Educativos e Design de Engajamento

> Projeto: plataforma web + app de alfabetização pelo método fônico (pt-BR), guia "Sofia".
> Fase: pesquisa. Data: novembro/2026.
> Frente: mercado, benchmark de apps/jogos, mecânicas, engajamento ético, arte/som, personagem.

## Como ler este documento (nota de método)

- As informações vieram de buscas na web (resumos de páginas oficiais, lojas de apps, imprensa, artigos científicos). **Neste ambiente não foi possível abrir as páginas diretamente** (apps.apple.com e teachyourmonster.org estavam bloqueados na rede da sessão). Por isso, preços e notas de loja vêm dos trechos indexados e de resenhas de terceiros, e estão marcados como "aprox." ou "varia". **Confirme preços e notas na loja antes de usar em material comercial.**
- Não inventamos números. Onde as fontes divergem, isso está dito. Onde não há dado, a célula diz "não verificado".
- Os números entre colchetes [n] remetem à **Tabela de Fontes** no final.

---

## 1. Resumo executivo

1. **Problema real e grande no Brasil.** Segundo o Indicador Criança Alfabetizada, 56% das crianças da rede pública estavam alfabetizadas ao fim do 2º ano em 2023 e 59,2% em 2024, abaixo da meta de 60%. A meta do Compromisso Nacional Criança Alfabetizada é 80% até 2030 [81]. A demanda existe em casa (pais) e na escola (redes públicas e privadas).
2. **O mercado global de "aprender a ler" está maduro em inglês e pobre em pt-BR.** Os melhores produtos (Khan Academy Kids, Duolingo ABC, Teach Your Monster to Read, Reading Eggs, Hooked on Phonics, Ello, Homer, Lingokids) são em inglês. O Khan Academy Kids aparece como "apenas em inglês" na FAQ em português da Khan [6]. No Brasil, a oferta fônica com qualidade de jogo é pequena: GraphoGame Brasil (finlandês, adaptado pela PUCRS e hoje pago) [42][43], Escribo Play (com ensaio randomizado) [48], EduEdu (Instituto ABCD, gratuito) [49] e muitos apps genéricos de sílabas com qualidade irregular [50][54]. As plataformas grandes (Elefante Letrado, Árvore) são **B2B escolares de leitura de livros**, não de fônica lúdica para o "zero" [44][47].
3. **A lacuna que o projeto pode ocupar:** um produto **pt-BR nativo, fônico e sistemático, do zero até o texto, com qualidade de produção de nível internacional** (arte, animação, som, voz) e **voz que escuta a criança ler** (como Ello e Amira fazem em inglês [22][25]). Não encontramos concorrente brasileiro que reúna os três: fônica sistemática + jogo com acabamento de estúdio + leitura em voz alta com reconhecimento de fala em pt-BR.
4. **Evidência: jogos ajudam, mas não sozinhos.** Uma meta-análise sobre o GraphoGame (19 estudos) não achou efeito geral em leitura de palavras (g = −0,02). O único moderador significativo foi o **apoio de um adulto durante o jogo** (efeito médio de 0,48 nos estudos com muito apoio) [32]. Já o Escribo Play, no Brasil, teve ensaio randomizado com 749 crianças e efeito d = 0,40 em leitura [48]. Lição: o produto precisa de uma **camada para pais e professores** e de conteúdo bem sequenciado, não só de jogos bonitos.
5. **"Vício positivo" precisa ser redesenhado como "hábito saudável e retorno voluntário".** Cerca de 4 em cada 5 apps usados por crianças de 3 a 5 anos têm design manipulativo [55]. Desde 17/03/2026 vale no Brasil o **ECA Digital (Lei 15.211/2025)**, que proíbe loot boxes em jogos acessíveis a crianças, proíbe perfilamento para publicidade e exige ferramentas de supervisão parental [67]. Apple e Google também restringem anúncios e analytics de terceiros em apps infantis [61][62]. O caminho que funciona é motivação intrínseca (Teoria da Autodeterminação), domínio progressivo, repetição espaçada e sessões curtas com **fim natural** [68][70][72][73].
6. **Personagem "Sofia": risco de associação com "Princesinha Sofia" (Disney Junior, *Sofia the First*)**, conhecida pelo público infantil no Brasil. A Disney tem marcas "SOFIA THE FIRST" registradas nos EUA em várias classes, inclusive educação e entretenimento [77]. Há ainda apps com o nome "Sofia" (Talking Sofia, Sofia/Dynseo) [78]. O nome pode ser usado, mas **com busca no INPI, nome composto ou marca própria e visual bem distante de princesa**.

---

## 2. Tabela comparativa de concorrentes

Legenda: "aprox." = valor de fonte secundária ou de loja indexada, que muda por país e por época. "n.v." = não verificado nesta pesquisa.

### 2.1 Internacionais

| Produto | Público | Mecânicas principais | Voz/fala | Progressão | Recompensas | Modelo/preço | Pontos fortes | Pontos fracos |
|---|---|---|---|---|---|---|---|---|
| **Khan Academy Kids** [1][2][3][4][5][6] | 2–8 anos (CSM: 3+) | Atividades curtas de leitura, livros, palavras visuais, matemática, socioemocional; personagens animais (narrador Kodi Bear) | Narração completa | Caminho adaptativo; conteúdo vai até ~2º ano | Personagens e itens colecionáveis (detalhe n.v.) | **100% gratuito, sem anúncios nem assinatura** (ONG) | Qualidade de estúdio (origem: Duck Duck Moose); estilo "whimsical, cores fortes, linhas levemente tortas" | Só em inglês; aviso de privacidade no CSM [3] |
| **Duolingo ABC** [7][8][9] | 3–8 anos | 700+ lições curtas; traçar letras (vídeo → "trilho" → mão livre); ligar imagem e frase; histórias ilustradas | Leitura em voz alta com reconhecimento de fala nas histórias | 9 níveis; sequência por pares letra-som, CVC, depois dígrafos e encontros | Microcelebrações, metas | Gratuito, sem anúncios nem compras | Escopo e sequência públicos [9]; fônica explícita | CSM: "melhor em pequenas doses" [8]; estudo da EDC citado por terceiros, n.v. |
| **Teach Your Monster to Read** [10][11][12] | ~3–6 anos (2 primeiros anos de leitura) | A criança **cria e personaliza um monstro e o ensina a ler**; 3 jogos (First Steps, Fun With Words, Champion Reader); minijogos letra-som; coleta de "Trickies" (palavras irregulares) | Narração de sons e palavras | Ilhas/mapa de aventura; jogo 1 → 3 | Itens para o monstro, recompensas de ilha | **Grátis no computador**; apps pagos (preço varia) | Fantasia forte (efeito protegé: "eu ensino o monstro"); da Usborne Foundation | Sem estudo de eficácia independente encontrado |
| **Reading Eggs** [13][14] | 2–13 (Junior 2–4; Reading Eggs 3–7; Eggspress 7–13) | Mapas de lições; cada mapa com 10 unidades e quiz | Narração | Mapas sequenciais | Ovos de ouro, itens, avatar | Assinatura; trial 30 dias; preço varia muito por fonte | Cobertura ampla de idades | Preço confuso; muito "economia de moedas" |
| **Hooked on Phonics** [15][16] | Pré-escola a ~2º ano | Lições, vídeos, músicas, livros | Narração | Sequência linear | Estrelas/prêmios (n.v.) | Trial 7 dias; aprox. US$ 7,99–12,99/mês; kits físicos à parte | Marca forte, kit físico + app | Modelo de assinatura + livros pagos |
| **Starfall** [17][18] | Pré-K–3º ano | Atividades e canções fônicas simples | Narração | Por letra/nível | Pouca gamificação | Parte grátis; membership aprox. US$ 35/ano | Simples, barato, clássico | Visual datado |
| **ABCmouse** [19] | 2–8 | "Step-by-Step Learning Path" com 850+ lições em 10 níveis | Narração | Trilha guiada por nível | **Tickets** trocados por roupas de avatar, móveis, zoológico e aquário virtuais | Assinatura aprox. US$ 12,99/mês | Currículo amplo | Economia de tickets pode tirar o foco do aprendizado (risco de recompensa extrínseca) |
| **Lingokids** [20] | 2–8 | Jogos, músicas, vídeos ("playlearning"), inglês e mais | Narração | Por tema | Coleções | Plus aprox. US$ 13,49–14,99/mês ou US$ 71,99–161,88/ano (varia) | Produção forte, presença global | Foco em inglês como segunda língua |
| **Homer** [21] | 2–8 | Caminho de leitura personalizado, histórias, fônica | Narração | Plano personalizado | Prêmios (n.v.) | Aprox. US$ 9,99–12,99/mês; trial 30–60 dias | Personalização inicial por interesse | Preço confuso |
| **Ello** [22][23][24] | Kindergarten–3º ano | **A criança lê livros decodificáveis em voz alta e a IA escuta**, corrige erros e omissões; criação de histórias personalizadas (2024) | **ASR treinado em fala infantil** (empresa diz superar Whisper e Google na tarefa) | Nível do livro ajustado ao leitor | Escolha de livros | App grátis com assinatura (aprox. US$ 14,99/mês; anual aprox. US$ 139); 700 a 1.200+ livros decodificáveis | Melhor referência de "voz que escuta" | Só inglês; números da empresa sem verificação independente |
| **Amira Learning** [25][26] | PreK–8 (escolas) | Tutor de leitura em voz alta | Mede precisão, ritmo, prosódia e tipos de erro (análise de erros) | Avaliação contínua | Pouco jogo | B2B (vendido com HMH nos EUA) | Avaliação de fluência automática; base em pesquisa da Carnegie Mellon | Evidência majoritariamente da própria empresa |
| **Readability (Reading Buddy)** [27] | K–6 | Leitura em voz alta + perguntas de compreensão respondidas oralmente | Detecta erros de pronúncia e pede repetição | Por nível | Painel para pais | Assinatura; trial 7–30 dias | Painel de fluência para pais | Só marketing da empresa como evidência |
| **Nessy Reading & Spelling** [28] | 6–11 (oficial) | 100 lições Orton-Gillingham em 10 ilhas; vídeo de estratégia + jogos (ex.: "Banana Wheels") | Narração | Ilhas sequenciais | Personagens, ilhas | Aprox. US$ 10–12/mês (varia) | Referência em dislexia; fichas imprimíveis | Inglês; sem ensaio independente encontrado |
| **Endless Reader (Originator)** [29] | 2–6 | Monstros espalham as letras da palavra, a criança recoloca nas silhuetas; frases-quebra-cabeça | Narração da palavra e dos sons | Pacotes de palavras | Animações-recompensa | Grátis com pacotes pagos (aprox. US$ 4,99–5,99) | Animação engraçadíssima | CSM: "super envolvente, mas pouco eficaz para palavras visuais" |
| **Feed the Monster (Curious Learning)** [30][31] | Pré-escola/1º ano | **Alimentar o monstro** com a letra/sílaba/palavra certa; o monstro evolui | Narração de sons | Níveis por som | Monstro que cresce e evolui | **Gratuito e open source**; 48 a 50+ línguas (inclui português do Brasil) | Kit de localização open source (com UNICEF) | Visual simples; feito em Unity |
| **GraphoGame (global)** [32] | 4–8 | Ouvir som → tocar letra/sílaba; repetição adaptativa | Sons isolados | Adaptativo | Simples | Varia por país | Base científica (Univ. Jyväskylä) | Meta-análise: sem efeito geral; efeito aparece com apoio de adulto |
| **Lexia Core5** [33] | PreK–5 (escolas) | Programa adaptativo misto (online + professor) | Narração | Adaptativo, 6 áreas | Certificados | B2B | Classificado "Strong" pelo Evidence for ESSA | Escolar, pouco lúdico |
| **Toca Boca (referência de ludicidade, não fônica)** [34][35][36] | 3–9 | Brinquedo digital aberto: **sem placar, sem timer, sem "game over"** | Pouca fala | Livre | Nenhuma de pontuação | Começou pago e sem compras; desde 2018 o Toca Life World é grátis com compras no app [36] | Diversão por exploração; testes com crianças | Modelo atual com loja (há opção de desligar a loja) |
| **Pok Pok** [37] | 2–8 | Brinquedos digitais estilo Montessori; **sem pontos, níveis ou timers** | Sons suaves | Livre | Nenhuma | Assinatura (ofertas vitalícias) | Arte desenhada à mão, som gentil, criança para sozinha quando quer | Não ensina fônica sistemática |
| **Sago Mini** [38][39] | 2–5 | Brincadeira aberta, sem incentivos artificiais | Pouca fala | Livre | Nenhuma | Assinatura | Testes com 20–30 crianças por app, cerca de 1 vez por mês | Não é alfabetização |
| **PBS KIDS (Ready To Learn)** [40] | 2–8 | Jogos com personagens de TV; apps para pais e filhos jogarem juntos | Narração bilíngue | Por jogo | Personagens | Gratuito (financiamento público dos EUA) | Avaliações independentes (SRI, EDC) | Fragmentado em vários apps |
| **Sesame — Elmo Loves ABCs** [41] | 2–5 | Traçar letras, 80+ clipes, colorir, esconde-esconde | Elmo narra | Por letra | Clipes como prêmio | Aprox. US$ 4,99; versão Lite (A, B, C) | Personagem amado, prêmios Parents' Choice | Para pré-leitores, sem decodificação |

### 2.2 Brasil

| Produto | Público | Mecânicas | Voz/fala | Progressão | Recompensas | Modelo/preço | Pontos fortes | Pontos fracos |
|---|---|---|---|---|---|---|---|---|
| **GraphoGame Brasil** [42][43] | Pré-escola a 2º ano | Ouvir som/sílaba → tocar a escrita certa; funciona offline | Sons em pt-BR (adaptado pelo Instituto do Cérebro/PUCRS) | Adaptativo | Simples | Lançado em nov/2020, gratuito no Tempo de Aprender (MEC). Depois de mais de 3 milhões de downloads virou pago (aprox. R$ 24,90 no iPad) | Única fônica sistemática pt-BR com base científica e escala | Visual e jogabilidade modestos; meta-análise internacional fraca sem adulto [32] |
| **Escribo Play** [48] | Educação infantil (5 anos) | 20 jogos de consciência fonológica, leitura e escrita | Narração | Sequência de jogos | n.v. | Versão grátis com 6 jogos; versão escolar | **Ensaio randomizado: 749 crianças, leitura d = 0,40, escrita d = 0,20** | Parte da pesquisa foi financiada pela empresa; crianças com nível muito baixo no pré-teste não se beneficiaram |
| **EduEdu (Instituto ABCD)** [49][50] | 4–9 (varia por fonte) | Avaliação inicial + atividades adaptadas; consciência fonológica e letra-som | Narração | Adaptativo | n.v. | Gratuito, sem anúncios, offline; recomenda sessões de até 15 min | ONG; 550 mil alunos (2021) | Interface simples; disponibilidade no iOS não confirmada |
| **Elefante Letrado** [44][45][46] | Fundamental I (escolas) | Biblioteca digital com níveis, perguntas, gamificação | Áudio dos livros (detalhe n.v.) | Níveis de leitura | Gamificação, metas | **B2B**: login só via escola ou rede; contratos estaduais (ex.: R$ 5 mi em MG; 550 mil alunos de alfabetização em SP) | Escala em redes públicas | Crítica no Le Monde Diplomatique Brasil por "encaixotar" a literatura [45]; não ensina o zero |
| **Árvore** [47] | Fundamental e Médio (escolas) | Biblioteca de 35 mil livros, trilhas, ranking, prêmios | n.v. | Trilhas | **Ranking de leitura e premiações** | B2B | Grande acervo de editoras | Foco em leitor já alfabetizado; ranking competitivo |
| **Mundo Bita Play / ABC do Bita** [50][51] | 2–6 | Vídeos e brincadeiras; ABC do Bita com letras, sílabas, palavras | Personagens e músicas do Bita | n.v. | n.v. | Assinatura no app (Mundo Bita Play) | **Marca musical brasileira fortíssima** | Não é programa fônico completo |
| **Palavra Cantada — "Brincando com Palavras"** [52] | Pré-escola | Jogo LETRAS: tocar letras para montar palavras no ritmo da música; jogo da memória | Canções da dupla | n.v. | n.v. | Memória grátis; resto n.v. | Música de altíssima qualidade | Escopo pequeno |
| **abcD+ (Lume)** [53] | 5–7 | "Cards Mágicos" com realidade aumentada | n.v. | n.v. | n.v. | n.v. | AR com material físico | Pouca informação pública |
| **Apps de sílabas genéricos** (Silabando, Ler e Contar, ABC Dinos, LeLe Sílabas) [50][54] | 4–8 | Separar e contar sílabas, palavra ilustrada | Narração simples | Linear | Estrelas | Grátis com anúncios ou pago | Baratos e populares | Análise acadêmica do LeLe Sílabas deu nota negativa na maioria dos critérios pedagógicos |

**Leitura do quadro:**
- Em inglês, o padrão de excelência é: **gratuito ou assinatura sem anúncios**, fônica explícita com sequência pública (Duolingo ABC), **fantasia de "ensinar ou alimentar um monstro"** (TYM, Feed the Monster, Endless Reader) e, na fronteira, **IA que escuta a leitura** (Ello, Amira, Readability).
- No Brasil, quem tem evidência (GraphoGame, Escribo) tem pouco acabamento lúdico, e quem tem escala (Elefante Letrado, Árvore) é biblioteca para quem já lê.

---

## 3. Catálogo de mecânicas de jogo (30 ideias mapeadas por habilidade fônica)

Progressão de habilidades usada (sequência fônica típica, a validar com a frente pedagógica): **(A) consciência fonológica** (rima, sílaba, fonema inicial) → **(B) letra-som** (grafema-fonema, começando por vogais e consoantes contínuas como M, S, F, V, L, N) → **(C) síntese/decodificação de sílabas** (CV, depois V, CVC, CCV) → **(D) palavras** (canônicas, depois com dígrafos e encontros) → **(E) segmentação e escrita** (codificação) → **(F) frases** → **(G) textos decodificáveis e fluência** → **(H) compreensão**.

| # | Nome provisório | Habilidade | Mecânica | Referência inspiradora | Uso de voz |
|---|---|---|---|---|---|
| 1 | **Rima ou Não Rima?** | A — rima | Dois objetos aparecem e a criança puxa para "par" ou "não par" | Jogos de consciência fonológica (Escribo [48]) | Sofia fala os nomes |
| 2 | **Bate-Palmas das Sílabas** | A — sílaba | A criança toca o tambor uma vez por sílaba de "bo-ne-ca" | Silabando [54] | Fala silabada + eco |
| 3 | **Caça ao Primeiro Som** | A — fonema inicial | "Ache tudo que começa com /mmm/" num cenário de esconde-esconde | Elmo Loves ABCs (achar escondidos) [41] | Fonema alongado |
| 4 | **Alimente o Bichinho** | B — letra-som | O bichinho-parceiro pede um som e a criança arrasta a letra certa até a boca dele | Feed the Monster [30] | Pedido falado do som |
| 5 | **Balões de Letras** | B — reconhecimento rápido | Balões com letras sobem e a criança estoura os do som pedido (sem cronômetro punitivo) | Clássico de arcade adaptado | Som-alvo repetido |
| 6 | **Memória Som-Letra** | B — letra-som | Jogo da memória em que um lado tem o **som** (ícone de alto-falante) e o outro a letra | Jogo da memória da Palavra Cantada [52] | Som ao virar a carta |
| 7 | **Traço Mágico** | B + escrita | Traçar a letra em 3 fases: demonstração → trilho → mão livre; o traço vira animação | Duolingo ABC [7] | Sofia narra o movimento ("desce, sobe...") |
| 8 | **Boca da Sofia** | B — articulação | Close animado da boca da Sofia fazendo o som; a criança imita (microfone opcional) | Métodos fônicos articulatórios (validar com a pedagogia) | Modelo de fala |
| 9 | **Fábrica de Sílabas** | C — síntese CV | Esteira junta consoante + vogal ("M" + "A"), a máquina "cospe" MA e toca o som | Montagem de sílabas (GraphoGame [42]) | Fusão audível /m/+/a/ = "ma" |
| 10 | **Trem das Sílabas** | C — sequência | Vagões com sílabas; montar o trem na ordem certa para formar a palavra | Endless Reader (silhuetas) [29] | Lê o trem ao partir |
| 11 | **Escorregador de Sons** | C — blending contínuo | Letras no escorregador; ao deslizar o dedo, os sons se fundem ("sssooool") | Prática de blending contínuo (fônica sintética) | Som contínuo sincronizado ao dedo |
| 12 | **Ouça e Toque** | C — discriminação | Sofia diz uma sílaba e a criança toca entre 2–4 opções (dificuldade adaptativa) | GraphoGame [32] | Sílaba falada |
| 13 | **Monta-Palavra com Silhueta** | D — decodificação | Letras espalhadas por uma travessura do parceiro; recolocar nas silhuetas | Endless Reader [29] | Lê a palavra pronta com animação engraçada |
| 14 | **Palavra Viva** | D — significado | Ao montar "GATO", o gato ganha vida e passeia no cenário | Endless Alphabet/Reader [29] | Palavra + efeito sonoro |
| 15 | **Caça-Palavras Falado** | D — leitura | Sofia diz a palavra e a criança encontra na grade (grade pequena, letra grande) | Caça-palavras clássico | Palavra-alvo falada |
| 16 | **Troca-Letra (Palavras Mágicas)** | D — consciência fonêmica | Trocar uma letra transforma o objeto: PATO → GATO → GALO | Cadeias de palavras (prática fônica) | Lê antes e depois |
| 17 | **Ditado do Bichinho** | E — codificação | O parceiro "fala" uma palavra e a criança escreve com teclado de letras grandes | TYM (ensinar o monstro) [10] | Ditado com repetição a pedido |
| 18 | **Lojinha de Palavras** | D/E — leitura funcional | Atender clientes: ler o pedido ("BOLA") e entregar o objeto | Toca Boca (brincar de faz de conta) [34] | Cliente fala; leitura obrigatória |
| 19 | **Karaokê da Sofia** | G — fluência | Canção com letra; a palavra acende no ritmo (realce sincronizado) | Palavra Cantada / Mundo Bita [51][52] | Música + realce de palavra |
| 20 | **Eu Leio pra Você** | G — leitura oral | A criança lê a página em voz alta e o app escuta, marca os acertos e ajuda gentilmente no erro | Ello, Amira [22][25] | **Reconhecimento de fala infantil em pt-BR** |
| 21 | **Livrinho Decodificável Interativo** | G — decodificação em contexto | Histórias só com os sons já aprendidos; tocar a palavra faz Sofia ler; ao terminar, a cena anima | Ello (livros decodificáveis), Duolingo ABC [7][23] | Leitura sob demanda |
| 22 | **Frase-Quebra-Cabeça** | F — sintaxe | Ordenar palavras para formar frase que vira cena animada | Endless Reader (sentence puzzles) [29] | Lê a frase montada |
| 23 | **Verdadeiro ou Bobagem?** | F/H — compreensão | Ler "O PEIXE VOA" e decidir se é verdade; frases absurdas dão risada | Frases bobas para checar compreensão | Feedback com humor |
| 24 | **Detetive do Texto** | H — compreensão | Depois da história, achar no texto a resposta da pergunta (tocar a palavra) | Readability (perguntas de compreensão) [27] | Pergunta falada |
| 25 | **Mini-Chefão de Ilha** | Revisão de unidade | Fim de ilha: uma "nuvem bagunceira" apagou as letras do mapa e a criança restaura lendo (falhar não tira nada, só dá nova chance) | Quiz de fim de mapa do Reading Eggs [13] | Narrativa épica leve |
| 26 | **Álbum de Figurinhas** | Motivação + revisão | Cada som dominado libera uma figurinha (objeto que começa com aquele som); a figurinha "fala" o som quando tocada | Coleções (ABCmouse [19]); figurinha brasileira | Figurinha toca a palavra |
| 27 | **Parceiro que Evolui** | Motivação de domínio | O bichinho-parceiro ganha acessórios ou habilidades ligados a marcos de leitura (não a tempo de tela) | Feed the Monster, TYM [10][30] | Parceiro comemora |
| 28 | **Mapa de Ilhas/Bairros** | Estrutura de progressão | Mapa do mundo da Sofia; cada região é uma família de sons; regiões revisitáveis | Nessy (10 ilhas), Reading Eggs (mapas) [13][28] | Narração de chegada |
| 29 | **Jardim da Revisão (repetição espaçada)** | Retenção | "Plantinhas" murcham levemente quando um som não é revisto há dias; regar = minirrevisão de 1 min. **Nunca morrem.** | Repetição espaçada [73] | Sofia sugere "vamos regar o M?" |
| 30 | **Leitura com a Família** | Mediação adulta | Modo "ler junto": adulto e criança se revezam; o app dá dicas ao adulto | Evidência do GraphoGame com adulto [32]; PBS Parents Play & Learn [40] | Dicas em áudio para o adulto |
| 31 | **Provinha do Bichinho** | Avaliação | Provinha curta e lúdica que **parece jogo**, sem nota visível para a criança; o resultado vai para o painel do adulto | Avaliação lúdica (blog da Khan [4]); Amira [25] | Itens falados |
| 32 | **Estúdio de Histórias** | Autoria/expressão | Criança escolhe cenário e personagens, monta frases com palavras já dominadas e grava a própria voz lendo | Ello (criação de histórias) [24]; Toca (criação) | Gravação da criança |

**Princípios de mecânica derivados do benchmark:**
- **Fantasia do "eu ensino"** (TYM): a criança ensina o parceiro, o que inverte o papel e reduz o medo de errar.
- **Feedback imediato no toque e erro tratado como pista** [63][84]: sem buzina de erro, com dica progressiva (repetir som → destacar opção → modelar).
- **Dificuldade adaptativa sem punição**: o fluxo (equilíbrio desafio-habilidade) é o objetivo, mas a evidência de ajuste automático em crianças pequenas ainda é pouca [74]. Melhor regras simples (ex.: 2 erros seguidos = mais apoio) do que algoritmo opaco.

---

## 4. Princípios de engajamento ético ("vício positivo" do jeito certo)

### 4.1 O que diz a evidência

| Tema | Achado | Fonte |
|---|---|---|
| Recompensas extrínsecas | Meta-análise de 128 experimentos: recompensas tangíveis, esperadas e ligadas a engajamento ou conclusão **reduzem o interesse intrínseco**, e o efeito é mais forte em crianças. Elogio verbal informativo tende a não prejudicar. | Deci, Koestner & Ryan 1999 [68] |
| Teoria da Autodeterminação | Motivação cresce quando se apoia **autonomia, competência e vínculo**. | [68] |
| Gamificação | Efeitos positivos pequenos a moderados (cognitivo g ≈ 0,49; motivacional g ≈ 0,36; comportamental g ≈ 0,25, segundo resumos). Ficção de jogo e interação social moderam os efeitos. | Sailer & Homner [69] |
| O que torna um app "educativo" | Quatro pilares: **ativo, engajado (sem distração), significativo e socialmente interativo**, dentro de um objetivo de aprendizagem claro. | Hirsh-Pasek et al. 2015 [70] |
| "Dopamina" | Recompensa incerta pode aumentar a motivação e a memória em jogos de aprendizagem (estudos pequenos). Os próprios autores alertam que "recompensa" e "aprendizagem" na neurociência não equivalem às da escola. | Howard-Jones [71] |
| Domínio (mastery) | Aprendizagem por domínio em grupo: cerca de +0,5 desvio-padrão (Kulik). O "2 sigma" de Bloom vale para **tutoria individual**. | [72] |
| Repetição espaçada | Recuperação espaçada melhora aprendizado e retenção de palavras em pré-escolares, inclusive com transtorno de linguagem. | Haebig et al. [73] |
| Dark patterns | **~80% dos apps usados por crianças de 3–5 anos** têm design manipulativo (pressão de tempo falsa, personagens que insistem para continuar, anúncios com "x" atrasado). Mais comum entre famílias de menor escolaridade. | Radesky et al., JAMA Netw Open 2022 [55][56] |
| Streaks e culpa | O Duolingo é criticado por notificações de culpa e por explorar a aversão à perda nas sequências. Há relato de criança de 9 anos recebendo mensagem por ter perdido a sequência. | [76] |

### 4.2 Diretrizes e leis aplicáveis

- **ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026):** proíbe loot boxes em jogos para crianças ou de provável acesso por elas; proíbe perfilamento e uso de dados sensíveis (inclusive análise emocional) para publicidade dirigida a crianças; exige ferramentas de supervisão parental e verificação de idade confiável (autodeclaração não basta). Prevê sanções de advertência a suspensão [67]. **Ponto de atenção jurídico:** usar reconhecimento de voz exige revisar o tratamento de dado de voz infantil com a LGPD e o ECA Digital. Recomendamos parecer jurídico.
- **UK Age Appropriate Design Code (ICO) / 5Rights:** padrão de "nudges", ou seja, não empurrar a criança a reduzir privacidade ou compartilhar dados; usar nudges a favor do bem-estar [57][58].
- **UNICEF RITEC (com LEGO Foundation):** framework RITEC-8 e Design Toolbox para bem-estar em brincadeira digital, com pesquisa de 50 crianças de 6–12 anos e famílias [59][60].
- **Apple Kids Category:** sem publicidade nem analytics de terceiros; links externos e compras atrás de "parental gate" [62].
- **Google Play Families / Teacher Approved:** só SDKs de anúncio autocertificados, sem anúncio personalizado para crianças, sem AD_ID em apps só para crianças (API 33+). Avaliação inclui design, apelo, enriquecimento, adequação de anúncios e compras [61].
- **Tempo de tela:**
  - **SBP:** zero tela até 2 anos; **2–5 anos: até 1 h/dia com supervisão**; acima de 6 anos: até 2 h/dia (fora tarefas escolares). Atualização "#Menos Telas #Mais Saúde 2024" [64].
  - **OMS (2019):** 1–4 anos com no máximo 1 h de tela sedentária (menos é melhor); menores de 1 ano, nenhuma [65].
  - **AAP:** plano de mídia familiar pelos "5 Cs": a Criança, o Conteúdo, a Calma/autorregulação, o que a mídia Desloca (*crowding out*) e a Comunicação [66].
  - **EduEdu** recomenda sessões de até 15 min/dia [49].

### 4.3 Proposta: "vício positivo" = vontade de voltar + saída tranquila

Reformular a meta do cliente como **"a criança quer voltar amanhã e sai feliz hoje"**. Métricas: retorno em dias diferentes e domínio de sons, **não** minutos de tela.

**Fazer:**
1. **Sessão-padrão de 10–15 min** ("uma aventura por dia"), com **fim natural narrado**: Sofia e o parceiro vão dormir ou lanchar, e o mapa mostra "amanhã tem surpresa na Ilha do R". O limite é configurável pelos pais, com padrão conservador para 4–5 anos.
2. **Domínio visível**: o progresso aparece como conquista de sons e livros lidos (o mapa se colore, o álbum se completa), não como moedas.
3. **Recompensa informativa e inesperada**: elogio específico ("você juntou /m/ com /a/!"). Surpresas **gratuitas e não contingentes** (uma figurinha bônus ocasional) podem manter a curiosidade sem virar loteria paga, mas o uso de aleatoriedade deve passar por revisão jurídica à luz do ECA Digital.
4. **Autonomia**: escolher entre 2–3 atividades do dia, personalizar o parceiro, escolher o livro.
5. **Vínculo**: modo "ler junto" e relatório semanal para a família com sugestões offline (ex.: "procurem coisas com /s/ no mercado"). A evidência do GraphoGame mostra que o adulto faz diferença [32].
6. **Sequência gentil**: contar "dias de leitura na semana" em vez de streak que zera. Sem notificações para a criança; o lembrete vai para o adulto, opcional.
7. **Repetição espaçada embutida** (Jardim da Revisão) que **nunca pune** com perda.
8. **Testes com crianças reais** com frequência, como a Sago faz com 20–30 crianças por app [38].

**Não fazer (lista vermelha):**
- Anúncios, SDKs de analytics de terceiros, perfilamento.
- Loot boxes, moedas compráveis, "gemas", lojas para a criança.
- Timers de pressão, vidas que acabam, "game over".
- Personagem triste ou chorando quando a criança sai ou falta ("a Sofia ficou triste...").
- Autoplay infinito, "só mais uma" automático, botão de fechar escondido.
- Ranking competitivo entre crianças pequenas.
- Compras e links externos sem parental gate.

---

## 5. Recomendações de arte, som e personagem

### 5.1 Direção de arte

- **Referências:**
  - Khan Academy Kids: "whimsical, cores fortes, linhas levemente tortas, mistura de familiar e fantástico" [4].
  - Pok Pok: desenho à mão, som gentil, sem flashes [37].
  - Sago Mini: limpo, moderno, não superestimulante [38].
  - Toca Boca: brinquedo, não teste [34].
  - Duolingo: personagem com formas simplificadas para animar rápido e animação concentrada nos momentos de recompensa [75].
- **Recomendação:** ilustração 2D vetorial com textura leve de "feito à mão", formas arredondadas, contorno irregular e animação "squash & stretch" (rig 2D como Spine ou Rive, decisão da frente técnica). Cenários brasileiros (feira, praia, quintal, bairro, mata) sem estereótipo.
- **Paleta (proposta, a validar em teste):** base quente e acolhedora com fundos claros dessaturados e personagens e elementos interativos saturados, para que **o que é tocável se destaque do fundo**. Evitar neon e piscar rápido. Garantir contraste WCAG AA no texto.
- **Codificação por cor (proposta pedagógica a validar):** cor fixa para vogais e outra para consoantes nos primeiros níveis, removida aos poucos para não virar muleta.

### 5.2 Tipografia

- **Prática brasileira:** começar pela **letra bastão (caixa alta)** pela facilidade motora, passar à imprensa minúscula e introduzir a cursiva por volta de 6–7 anos [79]. Há estudos brasileiros recentes que defendem expor a criança a mais de um tipo de letra desde cedo (tese sobre "dupla caixa"; artigo da UFRN com escritas de 2019 e 2024) [79]. **Recomendação:** trilha principal em bastão, com "modo descobrir" mostrando o par maiúscula/minúscula a partir da fase de sílabas e a cursiva como mundo próprio (fase 2). Validar com a frente pedagógica.
- **Fonte:** não existe "fonte para dislexia" com vantagem comprovada. **Espaçamento entre letras, palavras e linhas e tamanho grande importam mais** [80]. Usar sans-serif escolar com "a" e "g" de um andar (forma ensinada na escola, recomendação de design) e kerning aberto. Considerar fonte própria ou licença de fonte escolar. Para cursiva, uma fonte cursiva escolar brasileira com ligações corretas.
- Texto sempre tocável: tocar faz a Sofia ler (som e palavra juntos).

### 5.3 Som e voz

- **Feedback sonoro imediato em todo toque** [84][63]; erro com som neutro e curto, nunca buzina.
- **Música:** tema da Sofia com variações por ilha e trilha de baixa intensidade nas atividades de escuta. **Silenciar a música quando houver som-alvo ou microfone ligado** (áudio alto atrapalha o reconhecimento de fala [84]).
- **Fonemas isolados:** vozes neurais costumam errar sons isolados (/m/, /s/, /r/ fraco). Recomendação (hipótese técnica a testar): **gravar com fonoaudiólogo/locutor humano o inventário de fonemas e sílabas do pt-BR** e usar TTS neural só para frases e histórias. Validar a pronúncia regional (sotaque neutro e/ou opções).
- **Leitura com IA que escuta (Ello/Amira):** reconhecimento de fala treinado ou ajustado para voz infantil em pt-BR. A Ello afirma que modelos genéricos rendem menos com crianças [22]. Exige consentimento parental e política de retenção de áudio mínima (ECA Digital/LGPD) [67].
- **Parceria musical** com marcas brasileiras de música infantil (Palavra Cantada e Mundo Bita mostram a força desse caminho) [51][52] é oportunidade comercial a explorar.

### 5.4 Personagem guia "Sofia" e parceiro

**Como mascotes educativos são construídos (benchmark):**
- **Duo (Duolingo):** em 2019, ganhou mais personalidade, expressões e movimento. Formas simplificadas ("cilindro com asas") cortaram o tempo de animação. A animação foi concentrada nos momentos de recompensa [75]. A face "culpa" do Duo é justamente o que **não** copiar com crianças [76].
- **Khan Academy Kids:** elenco de animais com narrador (Kodi Bear) e, depois, 50 personagens humanos inspirados em crianças e famílias reais [1][5].
- **TYM / Feed the Monster:** o "parceiro" é algo que a criança **cuida e ensina** [10][30].

**Proposta para Sofia:**
- **Papel:** mentora e companheira de aventura, não professora que corrige. Fala pouco, com frases curtas e ritmadas, e celebra o esforço específico.
- **Personalidade (proposta):** curiosa, engraçada, às vezes atrapalhada (erra de propósito para a criança corrigir, o que gera efeito "eu ensino"), calorosa e paciente.
- **Visual:** criança ou jovem de cerca de 8–10 anos (um passo à frente do usuário), identidade brasileira plural e silhueta reconhecível com um objeto-assinatura (ex.: mochila que vira mapa, lápis-varinha). **Evitar coroa, vestido de princesa ou tiara** para não lembrar a "Princesinha Sofia".
- **Expressões-chave para animar:** escutar (mão na orelha), pensar, comemorar, surpresa, bocejo de fim de sessão e "boca do som" (close articulatório).

**Parceiro (bichinho):**
- O parceiro é quem a criança **alimenta e ensina** (mecânicas 4, 17 e 27).
- **Evitar coruja** (associação direta com o Duo) e **monstro genérico** (TYM, Feed the Monster, Endless já ocupam).
- Opções brasileiras a testar com crianças (proposta):
  - **tatu-bola**: enrola-se e vira formas de letras; vira "bola" na hora de dormir, o que dá o fim natural de sessão;
  - **sagui**: travesso, espalha as letras;
  - **capivara**: calma, boa para modo leitura;
  - **bem-te-vi**: canta os sons; o nome já é onomatopeia.
- Checar se o nome e o visual escolhidos não conflitam com personagens existentes.

**Checagem do nome "Sofia" (achados):**
- **Disney — *Sofia the First* / "Princesinha Sofia":** série da Disney Junior exibida no Brasil como "Princesinha Sofia" [77]. A Disney Enterprises tem várias marcas "SOFIA THE FIRST" nos EUA, depositadas em 2011, em classes que vão de vestuário a educação e entretenimento [77]. Há app "Sofia the First" na Microsoft Store (listado na busca).
- **"Talking Sofia"** (app infantil iOS de vestir/alimentar a Sofia) e **"Sofia" da Dynseo** (treino cognitivo) [78].
- **Não verificamos o INPI** (sem acesso nesta sessão). **Ação recomendada:** busca no INPI nas classes 9 (software), 41 (educação/entretenimento) e 28 (brinquedos) e, de preferência, marca composta e registrável (ex.: "Sofia & [Parceiro]", ou "Sofia" como personagem dentro da marca-produto). Nome próprio comum tende a ser marca fraca isoladamente.

---

## 6. Oportunidades de diferenciação

1. **Primeiro produto fônico pt-BR com acabamento de estúdio internacional.** Hoje o Brasil tem fônica com evidência e visual modesto (GraphoGame, Escribo) ou acabamento sem fônica sistemática (apps de marca/vídeo).
2. **"Eu leio, a Sofia escuta":** leitura em voz alta com reconhecimento de fala infantil em pt-BR. Ninguém no Brasil foi encontrado fazendo isso para o zero até o texto. É um diferencial técnico defensável, porque exige dados de voz infantil e cuidado legal.
3. **Do zero ao texto num só mundo:** consciência fonológica → letras → sílabas → palavras → frases → **livros decodificáveis em pt-BR** (não encontrados em escala no mercado). Elefante Letrado e Árvore começam quando a criança já lê, então podem ser **parceiros de continuidade** e não só concorrentes.
4. **Ética como posicionamento de marca:** "sem anúncios, sem compras para a criança, sem pressão, 15 minutos por dia". Conversa com o ECA Digital, a SBP e os pais, num mercado em que cerca de 80% dos apps manipulam [55].
5. **Camada adulta forte (casa e escola):** modo "ler junto", relatório semanal com atividades offline e painel do professor com provinhas e fluência (palavras por minuto). A evidência mostra que o adulto multiplica o efeito [32], e o painel abre o B2B/B2G (redes municipais buscando a meta de 80% até 2030 [81]).
6. **Cultura brasileira e música:** cenários, bichos, cantigas e possíveis parcerias musicais, com voz e sotaque cuidados.
7. **Evidência desde o início:** planejar um estudo de efeito (como o Escribo [48]) e a sequência pública de conteúdos (como o Duolingo ABC [9]) para ganhar credibilidade com escolas e governo.
8. **Offline e aparelhos modestos:** GraphoGame e EduEdu ganham por funcionar offline [42][49]. Pacotes leves e modo offline são requisito de acesso no Brasil.
9. **Inclusão:** modo dislexia (espaçamento, ritmo), legendas e opções de contraste, inspirado em Nessy [28] e Dyslexia Scotland [80].

---

## 7. Tabela de fontes

| # | Nome | URL | O que aproveitar | Validação E2 |
|---|---|---|---|---|
| 1 | Khan Academy Kids — App Store | https://apps.apple.com/us/app/khan-academy-kids/id1378467217 | Gratuito, ONG, Kodi Bear, livros e jogos | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 2 | Khan Academy Kids — página oficial | https://learn.khanacademy.org/khan-academy-kids/ | "100% grátis, sem anúncios ou assinatura" | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 3 | Common Sense Media — Khan Academy Kids | https://www.commonsensemedia.org/app-reviews/khan-academy-kids | Avaliação de pais e crianças; aviso de privacidade | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 4 | Khan Academy Blog — Prototyping playful pre-K assessments | https://blog.khanacademy.org/prototyping-playful-and-nimble-pre-k-assessments/ | Estilo visual "whimsical"; avaliação lúdica | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 5 | TechCrunch — Duck Duck Moose joins Khan Academy | https://techcrunch.com/2016/08/26/kids-app-maker-duck-duck-moose-joins-khan-academy/ | Origem do estúdio | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 6 | Khan Academy (FAQ pt) | https://continueaprendendo.khanacademy.org | Khan Kids só em inglês | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 7 | Duolingo ABC — App Store | https://apps.apple.com/app/id1440502568 | 700+ lições, traçado, grátis sem anúncios | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 8 | Common Sense Media — Duolingo ABC | https://www.commonsensemedia.org/app-reviews/duolingo-abc-learn-to-read | "Melhor em pequenas doses" | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 9 | Duolingo ABC — Scope & Sequence (PDF) | https://lit-lessons-cdn.duolingo.com/resources/duolingo_abc_scope_and_sequence_english.pdf | Modelo de sequência fônica pública | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 10 | Teach Your Monster to Read | https://teachyourmonster.org/teachyourmonstertoread | Fantasia "ensinar o monstro"; grátis no PC | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 11 | TYM — What does each game cover | https://www.teachyourmonster.org/teachers/what-does-each-game-cover/ | Escopo por jogo | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 12 | Horn Book — TYM review | https://hbook.com/story/teach-your-monster-to-read-app-review | Crítica independente | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 13 | Reading Eggs — App Store / preços NZ | https://apps.apple.com/app/726696040 ; https://readingeggs.co.nz/pricing/ | Mapas, ovos de ouro, trial | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 14 | Homeschoolpicks — Reading Eggs review | https://homeschoolpicks.com/curriculum-reviews/language-arts/reading-eggs-review/ | Preços e estrutura | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 15 | Hooked on Phonics — App Store | https://apps.apple.com/US/app/id588868907 | Trial 7 dias, planos | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 16 | ThePricer — Hooked on Phonics | https://www.thepricer.org/how-much-does-hooked-on-phonics-cost/ | Preços 2026 | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 17 | Starfall — Membership | https://store.starfall.com/membership | 700+ atividades, modelo freemium | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 18 | Common Sense Media — Starfall | https://www.commonsensemedia.org/website-reviews/starfall | US$ 35/ano | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 19 | ABCmouse — Suporte (features) | https://support.abcmouse.com/hc/en-us/articles/1500005417641-What-are-the-main-features-and-benefits-of-ABCmouse | Learning Path, tickets | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 20 | Lingokids — Help (preço Plus) | https://help.lingokids.com/hc/en-us/articles/9522217000209-How-much-does-Plus-subscription-cost | Preços | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 21 | Homer — App Store / Modulo review | https://apps.apple.com/au/app/id601437586 ; https://modulo.app/all-resources/homer-early-learning-app-review | Preços, faixa 2–8 | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 22 | TechCrunch — Ello raises $15M | https://techcrunch.com/2023/09/07/ai-reading-coach-startup-ello-raises-15-million-to-bolster-child-literacy | ASR para fala infantil | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 23 | Read with Ello — App Store | https://apps.apple.com/us/app/read-with-ello/id1536720182 | Livros decodificáveis, assinatura | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 24 | TechCrunch — Ello story creation | https://techcrunch.com/2024/09/30/ai-reading-coach-startup-ello-launches-custom-story-creation-feature-for-kids | Histórias personalizadas | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 25 | Amira — How it works | https://amiralearning.com/how-it-works | Fluência, prosódia, análise de erros | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 26 | Tech & Learning — HMH + Amira | https://www.techlearning.com/news/houghton-mifflin-harcourt-partners-with-ai-powered-reading-startup | Canal B2B | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 27 | Readability — Literacy solution | https://www.readabilitytutor.com/literacy-solution-for-kids | Voz + compreensão oral + painel | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 28 | Nessy Reading & Spelling | https://nessy.com/en-us/product/nessy-reading-and-spelling-school | Orton-Gillingham, 10 ilhas | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 29 | Common Sense Media — Endless Reader | https://www.commonsensemedia.org/app-reviews/endless-reader | Mecânica de silhuetas; crítica de eficácia | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 30 | Norad — Feed the Monster | https://norad.no/en/front/thematic-areas/education/innovation/eduapp4syria/feed-the-monster-available-in-25-languages | Open source; pt-BR entre as línguas | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 31 | Digital Public Goods — Curious Learning | https://backlog.digitalpublicgoods.net/curiouslearning/ | Bem público digital; Unity → H5P | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 32 | Frontiers in Education (2020) — GraphoGame | https://www.frontiersin.org/articles/10.3389/feduc.2020.00132 | Meta-análise: efeito com apoio adulto | VERIFICADA — Crossref; DOI confere |
| 33 | Lexia Core5 — Efficacy research | https://www.lexialearning.com/resources/research/lexia-core5-reading-efficacy-research | ESSA "Strong" | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 34 | Motionographer — Toca Boca design process | https://motionographer.com/2016/04/27/the-design-process-behind-toca-bocas-infectious-apps/ | "Brinquedos, não jogos" | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 35 | Kidscreen — Toca talks | https://kidscreen.com/?p=49360 | Liberdade no design infantil | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 36 | Axios — Toca Boca muda para compras no app | https://www.axios.com/2018/11/21/toca-boca-in-app-purchases-toca-life-world | Evolução do modelo de negócio | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 37 | Screenwise — Pok Pok "Anti-Dopamine App" | https://screenwiseapp.com/media/pok-pok-app | Sem pontos ou timers, fim natural | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 38 | Joan Ganz Cooney Center — Q&A Sago Sago | https://joanganzcooneycenter.org/2014/11/14/qa-with-sago-sagos-jason-krogh/ | Playtest com 20–30 crianças | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 39 | Sago Mini — About | https://sagomini.com/about | Princípios: exploração, intuitivo, seguro | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 40 | PBS — PBS Parents Play & Learn | https://www.pbs.org/about/about-pbs/blogs/news/new-pbs-kids-app-provides-interactive-activities-to-help-parents-make-anytime-learning-time | Jogos pais + filhos | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 41 | Reading Rockets — Elmo Loves ABCs | https://www.readingrockets.org/resources/literacy-apps/elmo-loves-abcs | Traçado, achar escondidos | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 42 | GraphoGame Brasil — App Store | https://apps.apple.com/BR/app/id1540637587 | Pago após 3 mi downloads | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 43 | Diário do Nordeste — MEC adquire GraphoGame | https://diariodonordeste.verdesmares.com.br/educalab/jogo-de-alfabetizacao-e-adquirido-pelo-mec-para-diminuir-impactos-da-pandemia-veja-como-funciona-1.3014373 | Contexto Tempo de Aprender | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 44 | Elefante Letrado — App Store | https://apps.apple.com/BR/app/id1192489395 | Acesso só via escola | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 45 | Le Monde Diplomatique Brasil — "Um elefante nem tão letrado" | https://diplomatique.org.br/o-curioso-caso-de-uma-plataforma-de-leitura-que-transforma-a-literatura-em-caixas-quadradas/ | Crítica pedagógica | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 46 | ABC do ABC — SP: 52,3 mi livros lidos | https://abcdoabc.com.br/criancas-da-rede-de-ensino-de-sp-ja-leram-523-milhoes-de-livros-infantis-em-2024/ | Escala B2G | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 47 | Mobile Time — Árvore 1 milhão de estudantes | https://www.mobiletime.com.br/noticias/11/02/2021/arvore-plataforma-da-acesso-a-livros-digitais-para-1-milhao-de-estudantes-brasileiros/ | Acervo, alcance | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 48 | Escribo — JHU Hub / Computers & Education Open | https://hub.jhu.edu/magazine/2018/summer/idea-literacy-escribo-app/ ; https://doaj.org/article/5aaec3207c8647d2bb20fc0133de543b | Ensaio randomizado BR, d = 0,40 | VERIFICADA — Crossref · doi:10.1016/j.caeo.2021.100066 |
| 49 | Mobile Time — EduEdu 550 mil alunos | https://www.mobiletime.com.br/noticias/30/04/2021/com-550-mil-alunos-cadastrados-app-eduedu-ajuda-no-reforco-escolar/ | ONG, grátis, adaptativo | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 50 | Educa Mais Brasil — 8 apps de alfabetização | https://www.educamaisbrasil.com.br/educacao/escolas/8-aplicativos-de-alfabetizacao-infantil-gratuitos | Panorama BR (ABC do Bita, EduEdu, 15 min) | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 51 | Mundo Bita Play — App Store | https://apps.apple.com/app/id1609236887 | Assinatura de marca musical | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 52 | Palavra Cantada Oficial — TouchArcade | https://toucharcade.com/games/palavra-cantada-oficial | Jogo LETRAS com música | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 53 | abcD+ (Lume) — App Store | https://apps.apple.com/us/app/abcd/id1604446742 | AR + cards | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 54 | Canaltech — Melhores apps de alfabetização | https://canaltech.com.br/apps/melhores-aplicativos-alfabetizacao/ | Panorama BR | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 55 | Radesky et al. 2022 — JAMA Netw Open (PMC) | https://pmc.ncbi.nlm.nih.gov/articles/PMC9206186/ | ~80% dos apps com design manipulativo | VERIFICADA — Crossref · doi:10.1001/jamanetworkopen.2022.17641 |
| 56 | Michigan Medicine — Design tricks | https://www.michiganmedicine.org/health-lab/design-tricks-commonly-used-monetize-young-childrens-app-use | Exemplos de dark patterns | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 57 | 5Rights — Five key changes (AADC) | https://5rightsfoundation.com/five-key-changes-introduced-by-the-age-appropriate-design-code/ | Padrões de design para crianças | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 58 | ICO — Age Appropriate Design Code (PDF) | https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf | Padrão de "nudge" | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 59 | UNICEF — RITEC | https://www.unicef.org/innovation/responsible-innovation-technology-children-ritec | RITEC-8, Design Toolbox | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 60 | UNICEF — Designing digital play with well-being in mind | https://www.unicef.org/designing-digital-play-childrens-well-being-mind | Guia de design de bem-estar | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 61 | Google Play — Families / Teacher Approved | https://support.google.com/googleplay/android-developer/answer/9867159 ; https://play.google.com/console/about/programs/teacherapproved/ | Regras de anúncios, AD_ID, critérios | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 62 | Apple Developer News (2019) — Kids Category | https://developer.apple.com/news/?id=06032019j | Sem ads e analytics de terceiros | VERIFICADA — URL ativa, HTTP 200 |
| 63 | Google — Building for Kids: designing engaging apps | https://developers.google.com/building-for-kids/designing-engaging-apps | Feedback positivo, retorno rápido | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 64 | SBP — Atualização orientações era digital | https://www.sbp.com.br/sociedade-brasileira-de-pediatria-atualiza-orientacoes-para-criancas-e-adolescentes-na-era-digital/ | Limites de tela por idade | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 65 | Active for Life — OMS 2019 | https://activeforlife.com/world-health-guidelines/ | ≤ 1 h para 1–4 anos | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 66 | AAP — 5 Cs | https://www.aap.org/5Cs | Plano de mídia familiar | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 67 | Mattos Filho / Agência Gov — ECA Digital | https://www.mattosfilho.com.br/unico/eca-digital-sancionada-lei/ ; https://agenciagov.ebc.com.br/noticias/202608/eca-digital-conheca-as-regras-de-protecao-de-criancas-e-adolescentes-no-ambiente-online | Loot box, publicidade, supervisão | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 68 | Deci, Koestner & Ryan 1999 (PDF) | https://leeds-faculty.colorado.edu/dahe7472/deci%201999.pdf | Recompensas x motivação intrínseca | VERIFICADA — Crossref · doi:10.1037/0033-2909.125.6.627 |
| 69 | Sailer & Homner — Gamification meta-analysis | https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/109056 | Efeitos da gamificação | VERIFICADA — Crossref · doi:10.1007/s10648-019-09498-w |
| 70 | APS — Putting Education in "Educational" Apps | https://www.psychologicalscience.org/publications/educational-apps.html | 4 pilares | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 71 | Howard-Jones — Toward a Science of Learning Games / Reward, learning and games | https://research-information.bris.ac.uk/en/publications/toward-a-science-of-learning-games/ ; https://shura.shu.ac.uk/12203 | Recompensa incerta e cautelas | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 72 | Slavin 1987 — Mastery learning (PDF) | https://www.gwern.net/doc/psychology/1987-slavin.pdf | Efeitos reais de mastery learning | VERIFICADA — Crossref · doi:10.3102/00346543057002175 |
| 73 | Haebig et al. 2021 — Spaced retrieval | https://asha.figshare.com/articles/journal_contribution/Spaced_retrieval_supports_semantic_learning_Haebig_et_al_2021_/15063060 | Repetição espaçada em pré-escolares | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 74 | arXiv 2024 — Children's emotions in playful learning games | https://arxiv.org/pdf/2406.04794 | Flow e limites do ajuste dinâmico de dificuldade | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 75 | Design Week — Duolingo owl makeover / Duolingo Blog "Reshaping Duo" | https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified ; https://blog.duolingo.com/reshaping-duo/ | Construção de mascote | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 76 | UX Collective — "20 days of emotional blackmail from Duolingo" | https://uxdesign.cc/20-days-of-emotional-blackmail-from-duolingo-4f566523e3c5 | Crítica a streak e culpa | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 77 | Trademarkdir — SOFIA THE FIRST / AdoroCinema — Princesinha Sofia | https://trademarkdir.com/trademark/sofia-the-first-85322177 ; https://www.adorocinema.com/series/serie-16809/ | Conflito de nome | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 78 | Talking Sofia — App Store / Sofia (Dynseo) | https://apps.apple.com/bh/app/talking-sofia/id1160638442 ; https://appgoblin.info/apps/com.dynseo.stimart.sofia | Apps com nome Sofia | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 79 | Melhor Escola — Letra cursiva / UFRN — artigo sobre tipos de letra | https://www.melhorescola.com.br/artigos/letra-cursiva ; https://periodicos.ufrn.br/saberes/article/download/44743/22779/169603 | Bastão → cursiva; debate | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 80 | Dyslexia Scotland — Dyslexia-friendly typed formats | https://dyslexiascotland.org.uk/dyslexia-friendly-typed-formats | Espaçamento > fonte | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 81 | Agência Gov — Alfabetização 2024 / Band — 56% em 2023 | https://agenciagov.ebc.com.br/noticias/202507/58-dos-municipios-melhoraram-alfabetizacao ; https://www.band.com.br/educacao/alfabetizacao-de-criancas-no-2o-ano-do-fundamental-chega-a-56-em-2023-16693158 | Tamanho do problema no BR | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 82 | Horn Book — Endless Reader review | https://hbook.com/story/endless-reader-app-review | Mecânica de silhuetas | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 83 | Tempo de Aprender — apresentação Câmara (PDF) | https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/ce/apresentacoes-em-eventos/eventos-2022-1/arquivos-2022/segundo-semestre-2022/MaurcioPrado.pdf | GraphoGame com 1,8 mi downloads no programa | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| 84 | Comminit — Best practices touch-screen (Sesame) | https://sb.comminit.com/node/9311454 | Feedback sonoro no toque; erro encorajador | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |

**Total: 84 entradas, mais de 30 produtos distintos (internacionais e brasileiros) e cerca de 30 fontes de pesquisa, diretriz ou lei.**

### Pendências para validar (próximos passos)
- Abrir as páginas das lojas (Apple/Google) para preço e nota atuais. A rede desta sessão bloqueou apps.apple.com.
- Fazer busca de marca no INPI para "Sofia" e para o nome do parceiro.
- Ler o texto integral do ECA Digital (arts. 2º, 20 e 22) e da atualização SBP 2024; levar a parecer jurídico sobre voz infantil e LGPD.
- Validar com a frente pedagógica a sequência de sons (seção 3) e a decisão bastão/dupla caixa.
- Fazer playtest de personagem e parceiro com 20–30 crianças (modelo Sago).
