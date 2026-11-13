# 32 — Pensamento computacional na primeira infância (4 a 8 anos)

> Frente de pesquisa 32: **Pensamento computacional (PC) integrado à alfabetização**
> Projeto: FONEMA, plataforma web + app de alfabetização fônica em pt-BR, com a guia Sofia e o aprendiz Bolota (tatu-bola).
> Data: novembro/2026. Base de decisão: Decisão 003 (formação integral) e rel. 30 (integração intrínseca, carga cognitiva).
> As referências estão numeradas entre colchetes, por exemplo [12], e listadas na seção 5.

**Nota de método.** Os artigos foram buscados por `curl` no **Crossref** (DOI e metadados), no **OpenAlex** e no **Semantic Scholar** (resumos, pela DOI), e no **ERIC/IES** (ID e resumo). O WebSearch foi usado três a quatro vezes, só para as normas brasileiras. **[V]** quer dizer que o registro (DOI ou ID ERIC) foi encontrado nesta sessão com título, autores e ano conferidos; quando há números (tamanho de efeito, N), eles vêm do resumo lido nesta sessão. **[NV]** quer dizer que não foi possível conferir na fonte primária. Neste ambiente, os sites do governo (planalto.gov.br, gov.br, camara.leg.br) e os sites dos produtos (code.org, scratchjr.org, csunplugged.org etc.) **não puderam ser abertos**: a rede da sessão bloqueia esses domínios. As normas brasileiras foram conferidas por várias fontes secundárias concordantes (prefeituras, conselhos, SBC), mas **o texto oficial precisa ser aberto antes de citar a redação literal** num documento formal. Quando um resumo não estava disponível, o achado está descrito só pelo título e marcado como tal.

---

## 1. Resumo executivo

1. **Crianças de 4 a 8 anos aprendem pensamento computacional, e o efeito é grande quando o desenho é adequado à idade.** Uma meta-análise com crianças de **3 a 8 anos** (17 estudos, 1.665 crianças) achou **d = 0,83** [24]. Na educação básica como um todo, programar melhora o PC com **g = 0,60** (86 estudos) [23], e as atividades **desplugadas** chegam a **g = 1,03** (13 estudos, poucos e heterogêneos) [25]. O conceito-chave para a idade é o **sequenciamento**: uma semana de programação de robôs já melhora o sequenciamento de crianças pequenas [9][10], e a programação de robô supera o jogo com blocos em sequenciamento num ensaio aleatorizado por turma [31].
2. **A transferência para outras áreas existe, mas é seletiva, e a alfabetização é a que menos ganha.** Na maior meta-análise de transferência (105 estudos), o efeito geral é **g = 0,49**: forte para transferência próxima (**0,75**) e moderado para distante (**0,47**), com ganhos em criatividade, matemática, metacognição e raciocínio espacial. **"Rendimento escolar e letramento foram os que menos se beneficiaram"** [22]. Nas funções executivas, programar melhora **resolução de problemas (0,89)** e **planejamento (0,36)**, mas pouco a inibição (0,17) e a memória de trabalho (0,20) [27][29][30].
3. **Programar não ensina a ler. O FONEMA precisa fazer o inverso: usar a leitura para ensinar computação.** No ensaio aleatorizado do currículo *Coding as Another Language* (CAL) com ScratchJr (13 escolas, cerca de 950 crianças da educação infantil ao 2º ano), o grupo CAL **melhorou em programação**, mas **não teve diferença em leitura padronizada**: o tempo tirado da aula não prejudicou a alfabetização, mas também não a acelerou [18]. A correlação entre o nível de leitura e o domínio de programação no 2º ano é **positiva, mas fraca** [21]. A analogia "escrever = programar" (planejar, rascunhar, **depurar**) é útil como metodologia [20], não como atalho para a leitura. **Implicação:** toda mecânica de PC no FONEMA tem de **exigir decodificação** (regra de ouro da Decisão 003) e deve ser medida pelos ganhos de leitura, não por "efeitos de bônus".
4. **O enquadramento de Bers é o mais adequado à faixa e à proposta lúdica.** *Coding as a Playground* trata a programação como **parquinho** (criar, expressar, colaborar), e não como **cercadinho** (exercício passivo). O modelo *Positive Technological Development* (PTD) liga a programação a seis "Cs": comunicação, colaboração, construção de comunidade, criação de conteúdo, criatividade e escolhas de conduta [5][6][7]. As "ideias poderosas" para a idade são algoritmos, modularidade, estruturas de controle, representação, hardware e software, processo de design e **depuração** [5]. Isso conversa diretamente com a inteligência emocional (lidar com o erro) da Decisão 003.
5. **Para 4 a 6 anos funcionam melhor atividades estruturadas, tangíveis e corporais. Para 7 a 8 anos, as mais abertas.** A meta-análise de funções executivas mostra benefício de **programação estruturada (virtual e com robôs) na pré-escola e no 1º ano**, e de programação mais aberta (tipo Scratch) para os mais velhos [27]. Uma intervenção de 8 horas de programação melhorou o planejamento e a inibição de crianças de 5 a 7 anos [28]. Ferramentas validadas para a faixa: **KIBO** (4 a 7 anos, blocos de madeira sem tela) [12], **ScratchJr** (5 a 7 anos) [13][35][36] e **Bee-Bot** (4 a 6 anos) [30][52]. A abstração e a decomposição melhoram com a idade [42].
6. **A escola brasileira já tem a computação como norma.** O **Parecer CNE/CEB nº 2/2022** (aprovado em 17/02/2022, homologado em 03/10/2022) e a **Resolução CNE/CEB nº 1, de 04/10/2022** definem normas sobre **Computação na Educação Básica, em complemento à BNCC**, organizadas em três eixos: **Pensamento Computacional, Mundo Digital e Cultura Digital** [59][60]. Para a educação infantil há objetivos como **EI03CO01** ("reconhecer padrão de repetição em sequência de sons, movimentos, desenhos"), EI03CO02 (expressar as etapas de uma tarefa de forma clara e ordenada) até EI03CO06 (decisões de dois estados, verdadeiro ou falso) [59, NV]. A **Lei 14.533/2023 (PNED)** define o pensamento computacional como "a capacidade de compreender, analisar, definir, modelar, resolver, comparar e automatizar problemas e suas soluções de forma metódica e sistemática" [61]. O FONEMA pode **mapear cada mecânica a esses códigos** e se posicionar como apoio às redes que precisam implementar a BNCC Computação.
7. **Os apps comerciais têm pouca evidência própria.** Uma revisão de 21 estudos com quatro apps de programação concluiu que todos têm efeito positivo no PC, mas nenhum desenvolve plenamente a **fluência computacional** (expressar-se criando). O ScratchJr, por ser "caixa de areia", se sai melhor [34]. **Lightbot Jr, Kodable, codeSpark e Osmo Coding** não têm, até onde foi possível conferir nesta sessão, ensaios independentes revisados por pares com crianças de 4 a 8 anos: são **referências de design**, não de evidência [66, NV].
8. **Riscos e cuidados.** (a) O PC não pode **roubar tempo** da alfabetização (rel. 09). A meta-análise de Sun et al. indica que intervenções curtas (1 semana a 1 mês) e **integradas a outras disciplinas** rendem mais [23], o que favorece missões de PC curtas e embutidas na leitura. (b) Nos estudos de transferência, os efeitos são maiores com controle passivo e em estudos publicados [22]: **não prometer** ganhos cognitivos amplos no marketing. (c) Faltam avaliações válidas para crianças pequenas [33]. TechCheck [15] e o instrumento de Clarke-Midura [71] são referências para provinhas desplugadas dentro do app. (d) Os estereótipos de gênero sobre tecnologia já aparecem aos 5 a 7 anos [53]: Sofia (menina guia) programando é uma boa escolha de design.

---

## 2. Achados

### 2.1 Definições: o que é pensamento computacional para uma criança de 5 anos

- **Wing (2006)** [1] popularizou o termo: "pensar como um cientista da computação" é uma habilidade fundamental para todos, não só para programadores. Abrange **abstração e decomposição**, resolver problemas com recursão e heurísticas e "pensar em vários níveis de abstração". Em **2008** [2] ela resumiu o núcleo como **abstração e automação**. A crítica posterior (Grover & Pea [48]; Shute et al. [49]) aponta que a definição é ampla e pouco operacional. Shute et al. propõem seis facetas: **decomposição, abstração, algoritmos, depuração, iteração e generalização** [49].
- **Brennan & Resnick (2012)** [3] dão o modelo mais usado na educação básica, em três dimensões:
  - **Conceitos:** sequências, laços (repetição), eventos, paralelismo, condicionais, operadores e dados.
  - **Práticas:** ser incremental e iterativo, testar e depurar, reusar e remixar, abstrair e modularizar.
  - **Perspectivas:** expressar-se, conectar-se e questionar.
- **Bers (2018/2020)** [5] adapta isso à primeira infância com **sete ideias poderosas**: algoritmos, modularidade, estruturas de controle, representação, hardware/software, processo de design e depuração. A frase central é que **programar é uma nova alfabetização**: é uma linguagem para **se expressar**, e não só para resolver problemas. O **PTD** [6] e o estudo na Espanha com 172 crianças de **3 a 5 anos** [7] mostram que é possível começar aos 3 anos com o KIBO, e que as estratégias promovem comunicação, colaboração e criatividade, ligadas a arte, música e estudos sociais.
- **Papert (1980)** [4] é a raiz construcionista (LOGO, a "tartaruga" que a criança comanda) e a ideia de que o **erro é informação ("bug")** e não fracasso. **Resnick (2017)** [70] estende isso para o "jardim de infância para a vida toda": projetos, paixão, pares e brincadeira.
- **Na lei brasileira** (PNED [61]), o pensamento computacional é "a capacidade de compreender, analisar, definir, modelar, resolver, comparar e automatizar problemas e suas soluções de forma metódica e sistemática".

**Síntese operacional para o FONEMA (4 a 8 anos):** 1) **sequência/algoritmo**; 2) **padrão** (reconhecer, completar, criar); 3) **decomposição** (partes de um todo: palavra em sílabas, história em cenas); 4) **depuração** (achar e consertar o erro); 5) **repetição/laço**; 6) **condicional** (se... então); 7) **evento** (quando...); 8) **abstração/representação** (símbolo que vale por uma ação: seta, cartão, palavra). Os itens 1 a 4 são o núcleo dos 4 aos 6 anos. Os itens 5 a 8 entram dos 6 aos 8.

### 2.2 Evidência: crianças pequenas aprendem PC?

| Estudo | Amostra | Resultado | Leitura para o FONEMA |
|---|---|---|---|
| Wang, Chan & Li (2024) [24], MA | 17 estudos, 34 efeitos, 1.665 crianças de 3 a 8 anos | **d = 0,83**. Moderadores: gênero, *scaffolding* e nível de ensino. Duração com efeito marginal | O apoio (*scaffolding*) importa: a Sofia modela antes, depois a criança tenta |
| Sun, Hu & Zhou (2021) [23], MA | 86 estudos, 114 efeitos, educação básica | **g = 0,60**. Maior com **integração interdisciplinar**, intervenção de 1 semana a 1 mês e turmas com menos de 50 alunos | Integrar o PC à leitura é a escolha certa |
| Chen et al. (2023) [25], RS+MA | 49 estudos revisados; MA com 13 estudos (16 efeitos) | Desplugado **g = 1,03**. **Jogos de tabuleiro e cartas** são a forma mais comum | Cartas de comando físicas e imprimíveis para a família |
| Zhang et al. (2024) [26], MA | Desplugado, alunos de K-9 | Analisa ano escolar, gênero, duração e tipo de atividade (resumo não disponível nesta sessão) | Conferir os moderadores no texto completo |
| Relkin, de Ruiter & Bers (2021) [16] | 667 crianças com CAL-KIBO contra 181 no controle (1º e 2º ano) | Ganho no TechCheck **equivalente a cerca de 6 meses** de desenvolvimento em 7 semanas. Evidência decisiva no 1º ano | O 1º ano (6 a 7 anos) é uma janela forte |
| Yang, Ng & Gao (2022) [31], aleatorizado por turma | 101 crianças da pré-escola (cerca de 5,4 anos) | Robô > blocos em **sequenciamento**. Ganho maior nas crianças com **menos autorregulação** | Sequenciar pode ajudar crianças impulsivas (ligar ao rel. 12, TDAH) |
| Kazakoff, Sullivan & Bers (2013) [9] | Oficina de 1 semana na educação infantil | Sequenciamento pós > pré, comparado com controle | "Doses" curtas funcionam |
| Kazakoff & Bers (2014) [10] | Linguagem tangível CHERP | Programar robôs melhora o sequenciamento | Mesmo achado com outra ferramenta |
| Sullivan & Bers (2016) [11] | 8 semanas, da pré-escola ao 2º ano | Os pequenos dominam o básico; os maiores vão mais longe **com o mesmo kit** | Um mesmo "kit de cartas" serve aos 2 anos de jornada, com profundidade crescente |
| Bers et al. (2014) [8] | TangibleK, educação infantil | As crianças aprendem robótica, programação e PC; há sugestões de redesenho | Currículo em ciclos de projeto |
| del Olmo-Muñoz et al. (2020) [41] | 84 crianças do 2º ano, atividades do Code.org | Começar desplugado e depois passar ao digital **favoreceu o PC** em relação a só digital | **Ordem: corpo/cartas, depois tela** |
| Brackmann et al. (2017) [40] | Quase-experimento no ensino fundamental, Espanha | Desplugado > controle | Funciona sem equipamento: bom para redes públicas |
| Levinson, Carocca & Bers (2025) [19] | Ensaio aleatorizado por conglomerados, Argentina (CAL-ScratchJr adaptado) | Melhorou a programação e o PC; os professores avaliaram bem | Evidência latino-americana; adaptar localmente |

**Funções executivas.** Na meta-análise de Montuori et al. [27] (19 estudos, 1.523 participantes de 4 a 16 anos), o efeito é maior na **resolução de problemas (0,89)** e no **planejamento (0,36)**. Programação **estruturada** funciona melhor na pré-escola e no 1º ano. Arfé et al. [29] fizeram um ensaio aleatorizado com **76 crianças do 1º ano**: um mês de programação melhorou o planejamento e a inibição em comparação com atividades STEM comuns. Montuori et al. [28] testaram 8 horas de programação com 273 crianças do 1º ano e 164 do 4º, com ganho em planejamento e inibição nas duas idades. Di Lieto et al. [30] fizeram um piloto com **12 crianças de 5 a 6 anos** usando **Bee-Bot** em 13 sessões e acharam melhora na memória de trabalho visuoespacial e na inibição. O estudo é pequeno e não tem controle aleatorizado: é indicativo.

**Revisões da faixa.** Su & Yang [33] (26 estudos, de 2010 a 2022) concluem que, com um desenho adequado à idade, as crianças desenvolvem conceitos de PC e também comunicação, colaboração e resolução de problemas. Os desafios são: aprendizagem **profunda** (e não só seguir setas), **falta de avaliações válidas** para faixas amplas, escolha de ferramentas e atividades adequadas à idade. Bakala et al. [32] fizeram uma revisão sistemática sobre robôs com pré-escolares (resumo não disponível nesta sessão). Yu & Roque [55] revisaram brinquedos e kits computacionais para crianças pequenas (resumo não disponível nesta sessão).

**Avaliação.** O **TechCheck** [15] é desplugado, tem boas propriedades psicométricas, é fácil de aplicar e discrimina bem no 1º ano (no 2º ano tende ao efeito teto). O instrumento de Clarke-Midura et al. [71], feito por *Evidence-Centered Design* para a pré-escola, inclui o **raciocínio espacial** como subcomponente do pensamento algorítmico.

### 2.3 Transferência: o que programar melhora (e o que não)

- **Scherer, Siddiq & Sánchez Viveros (2019)** [22]: 105 estudos e 539 efeitos. Efeito geral **g = 0,49**. Transferência próxima **0,75** e distante **0,47**. Os ganhos aparecem em criatividade, matemática, metacognição, raciocínio espacial e raciocínio. **Letramento e rendimento escolar são os que menos ganham.** Os efeitos são maiores contra controle passivo e na literatura publicada, o que indica algum viés.
- **Clements & Gullo (1984)** [51] é um estudo clássico com Logo e crianças pequenas, sobre efeitos cognitivos (metacognição e pensamento divergente). É a origem histórica da hipótese de transferência.
- **Popat & Starkey (2019)** [50] fizeram uma revisão sobre "aprender a programar ou programar para aprender": defendem usar a programação **como meio** para outras aprendizagens, com resultados que dependem do desenho (resumo não disponível nesta sessão).
- **Consequência para o produto:** o FONEMA **não deve vender** "programação melhora a leitura". O argumento honesto é que **a leitura é o meio** (as cartas de comando são palavras), e por isso **cada minuto de PC também é prática de decodificação**. Ao mesmo tempo, a criança ganha planejamento, sequenciamento e resolução de problemas, que têm evidência própria.

### 2.4 Programação, sequenciamento e alfabetização

- **Coding as Another Language (CAL)** [17][18][19]: é o currículo de Bers que integra programação e alfabetização (KIBO ou ScratchJr), da educação infantil ao 2º ano, com paralelos explícitos: **a linguagem de programação tem símbolos, sintaxe e significado, como a escrita**. Há **sequenciamento de histórias**, "escrever" um programa como quem escreve uma frase e "ler" o programa de um colega.
  - Resultado sobre PC: em Relkin et al. [16], ganho claro. No estudo de impacto independente [18], ganho em **programação**, mas **sem diferença no PC (TechCheck) e sem diferença na leitura padronizada**. O dado importante é que dedicar tempo de aula ao CAL **não piorou** a leitura.
- **Hassenfeld & Bers (2020)** [20]: comparação entre o processo de escrever uma história e o de criar um programa, no **2º ano**. A analogia de **depuração** (revisar, testar, consertar) ajuda a ensinar o **processo de escrita**.
- **Hassenfeld et al. (2020)** [21]: com 132 crianças do 2º ano, **correlação positiva fraca** entre o nível de leitura (PALS) e o domínio de programação. Leitores mais fracos também conseguem programar quando a programação é apresentada "pela lente da alfabetização".
- **Sequenciamento narrativo como ponte:**
  - Fenty et al. (2025) [44]: **cantigas e parlendas** sequenciadas com grades, setas e personagens, na pré-escola. Houve melhora no sequenciamento e surgiu vocabulário de programação.
  - Fenty, Pierce & Schildwachter (2022) [45]: "pré-programação" ligada a **leitura em voz alta** e rotinas, em salas inclusivas.
  - Beisly & Herath (2026) [46]: **livro ilustrado → programação**, porque as histórias já treinam sequência, representação e padrão.
  - Pelizzari et al. (2023) [47]: **storytelling + robô Cubetto** com 51 crianças de 4 anos. Houve ganhos em espacialidade e em "armazenar e **decodificar** instruções progressivamente mais complexas".
  - Tank et al. (2024) [43]: em tarefas desplugadas de sequenciamento, crianças de 5 a 8 anos mostram reconhecimento de padrão, algoritmo, decomposição e **depuração**, com estratégias que se tornam mais complexas com a idade.
- **Kafai & Burke** [68][69] mostram que, nas crianças maiores, programar é uma forma de **escrever e contar histórias** ("oficina de escritores" para programadores).
- **Ponte conceitual com o método fônico** (inferência de design, não testada): **decodificar é executar um algoritmo** (ler cada grafema na ordem, da esquerda para a direita, e juntar os sons). **Segmentar é decompor**. **Trocar uma letra e ver a palavra mudar é depurar** (rel. 01, "cadeias de palavras"). **Famílias de palavras são padrões e abstração**. A mesma ponte existe na escrita: planejar, escrever, revisar.

### 2.5 Desplugado e Bebras

- **CS Unplugged** (Bell e colaboradores) ensina conceitos de computação com cartas, cordas e o corpo. Bell & Vahrenhold (2018) [37] revisam o uso e a evidência: o desplugado é útil para **introduzir** conceitos e para engajar, mas deve **ligar-se depois à programação** real. Isso confirma del Olmo-Muñoz et al. [41].
- **Bebras** é um desafio internacional de informática com tarefas curtas sem programação [38][39], categorizadas por conceito (algoritmos, dados, estruturas, processos) e habilidade de PC [39]. É um bom modelo de **"enigma curto de 1 a 3 minutos"** para o FONEMA. Há categorias para os mais novos ("Little Beavers").
- **No Brasil**, Brackmann [40][58] trouxe o desplugado para a pesquisa nacional. Ticon, Mól & Legey (2022) [57] mostraram, com uma sequência didática plugada e desplugada **na educação infantil**, que é possível desenvolver PC respeitando a organização curricular da etapa. Valente (2019) [56] discute PC, letramento computacional e competência digital.

### 2.6 Robôs e apps para a faixa

| Ferramenta | Idade | O que é | Evidência | O que o FONEMA aproveita |
|---|---|---|---|---|
| **KIBO** (KinderLab) | 4 a 7 | Robô de madeira programado com **blocos físicos** que a criança "lê" com um scanner | [7][12][16][17] | **Blocos de comando como palavras** que se escaneiam e executam |
| **ScratchJr** (MIT/Tufts) | 5 a 7 | Blocos gráficos sem texto, para criar histórias animadas | [13][14][34][35][36][54] | Criar histórias; blocos de evento, movimento e repetição. **Lição:** sem texto, a leitura não é treinada. O FONEMA põe a palavra **no** bloco |
| **Bee-Bot / Blue-Bot** | 4 a 6 | Robô-abelha com botões de setas, em tapete quadriculado | [30][52] | Tapete-mapa da vila do Bolota; diretrizes didáticas [52] |
| **Cubetto** | 3 a 6 | Robô de madeira com tabuleiro de peças | [47] | Storytelling + programação |
| **Scratch** | 8+ | Blocos com texto | [3][68] | Transição para o fim da jornada (7 a 8 anos) |
| **Code.org** (cursos A/B, *Hour of Code*) | 4 a 8 | Cursos gratuitos com atividades plugadas e desplugadas | [41] usou as atividades | Modelo de progressão; atividades desplugadas |
| **Lightbot Jr** | 4 a 8 | Puzzles de comandar um robô por símbolos, com procedimentos | Sem ensaio revisado encontrado [66, NV] | Puzzles curtos; **procedimento** = "feitiço" que se reusa |
| **Kodable** | 4 a 8 | Labirintos com setas, condicionais e laços | Sem ensaio revisado encontrado [66, NV] | Progressão de setas → laços → condicionais |
| **codeSpark** (*The Foos*) | 3 a 9 | Puzzles **sem palavras** e criação de jogos | Sem ensaio revisado encontrado [66, NV] | **Contraponto:** o FONEMA faz o oposto e põe a palavra como comando |
| **Osmo Coding** | 5 a 10 | Blocos físicos reconhecidos pela câmera do tablet | Sem ensaio revisado para PC encontrado [66, NV] | Integração entre o tangível e a tela pela câmera, como ideia futura |

**Lição de design:** os apps líderes evitam texto para incluir não leitores. O FONEMA tem a **vantagem oposta**: como o objetivo é alfabetizar, os comandos podem ser **palavras decodificáveis do nível atual da criança**, com áudio de apoio (toque = Sofia lê) que vai sendo retirado aos poucos (*fading*, rel. 30).

---

## 3. Normas brasileiras e progressão de 4 a 8 anos em 2 anos

### 3.1 O que dizem as normas (com o nível de conferência)

- **BNCC Computação**: o Parecer CNE/CEB nº 2/2022 e seu anexo, aprovado em 17/02/2022 e homologado pelo MEC em 03/10/2022, e a **Resolução CNE/CEB nº 1, de 04/10/2022** (DOU de 06/10/2022, seção 1, p. 33; vigência a partir de 01/11/2022) definem normas sobre Computação na Educação Básica **em complemento à BNCC** [59][60]. Ela **não substitui** a BNCC: acrescenta competências e habilidades em **três eixos**:
  - **Pensamento Computacional**: algoritmos, padrões, decomposição e abstração;
  - **Mundo Digital**: como os dispositivos funcionam, informação e dados, codificação;
  - **Cultura Digital**: uso ético, seguro e crítico, e fluência.
- **Educação infantil (crianças de 4 a 5 anos e 11 meses)**: os objetivos EI03CO01 a EI03CO09 entram de forma **transversal aos campos de experiência**, sem disciplina própria. Redação segundo fontes secundárias concordantes [59, NV; conferir no anexo oficial]:
  - EI03CO01: reconhecer padrão de repetição em sequência de sons, movimentos e desenhos;
  - EI03CO02: expressar as etapas para a realização de uma tarefa de forma clara e ordenada;
  - EI03CO03: experienciar a execução de algoritmos brincando com objetos (des)plugados;
  - EI03CO04: criar e representar algoritmos para resolver problemas;
  - EI03CO05: comparar soluções algorítmicas para resolver um mesmo problema;
  - EI03CO06: compreender decisões em dois estados (verdadeiro ou falso);
  - EI03CO07 e EI03CO08: dados e codificação (*redação não confirmada*);
  - EI03CO09: identificar dispositivos computacionais e as diferentes formas de interação.
- **1º e 2º ano**, segundo fontes secundárias, **com versões divergentes entre rascunho e texto final** [59, NV]:
  - EF01CO01: organizar objetos físicos ou digitais por características, explicitando semelhanças (padrões) e diferenças;
  - EF01CO02: identificar e seguir sequências de passos do dia a dia para resolver problemas;
  - EF01CO03: reorganizar e criar sequências de passos em meios físicos ou digitais, relacionando-as à palavra "algoritmo";
  - EF02CO02: criar e simular algoritmos em **linguagem oral, escrita ou pictográfica**, com **repetições simples** (iterações definidas).

  O EF02CO02 é o elo mais direto com o FONEMA: **algoritmo representado por escrito**.
- **Lei 14.533/2023, Política Nacional de Educação Digital (PNED)** [61]: tem como eixos estruturantes a **Inclusão Digital**, a **Educação Digital Escolar**, a **Capacitação e Especialização Digital** e a **Pesquisa e Desenvolvimento em TICs**. Fontes secundárias divergem entre três e quatro eixos; conferir o art. 1º, § 2º. No eixo Educação Digital Escolar (art. 3º), o **pensamento computacional** é a primeira competência listada. O eixo deve estar "em consonância com a BNCC". A lei foi sancionada com vetos, e há previsão de recursos do Fust a partir de 2025.
- **BNCC 2017** [62]: a **competência geral 5 (cultura digital)** trata de compreender, utilizar e criar tecnologias digitais de forma crítica, significativa, reflexiva e ética.

### 3.2 Progressão proposta (2 anos de jornada, entrada entre 4 e 6 anos)

A jornada do FONEMA é organizada **por nível de leitura**, não por idade. Por isso os marcos abaixo são indicados por **nível de leitura e idade típica**. Cada linha diz qual tipo de palavra aparece nas cartas.

| Fase (idade típica) | Leitura na fase (rel. 01/25) | Marcos de PC (a criança consegue...) | Código BNCC Comp. (a conferir) | Ferramenta no FONEMA |
|---|---|---|---|---|
| **F0 – Pré-leitor (4 a 5 anos), meses 1 a 4** | Consciência fonológica, primeiras letras e sons | Seguir uma sequência de **3 a 4 passos** com **setas e ícones** narrados; reconhecer e continuar padrões **AB/ABB** de sons, gestos e cores; ordenar **3 cenas** de uma história ouvida; perceber "algo está errado" numa rotina | EI03CO01, EI03CO02, EI03CO03 | Cartas-seta e cartas-ícone com áudio; tapete da vila (como o Bee-Bot); padrões rítmicos de sílabas |
| **F1 – Leitor inicial (5 a 6 anos), meses 4 a 10** | Correspondências grafema-fonema, sílabas CV, palavras de 2 sílabas | Montar um programa de **4 a 6 comandos**, em que o comando é uma **palavra CV decodificável** (ex.: "PULA", "SOBE"); **depurar 1 erro** num programa curto; **comparar dois caminhos** ("qual é mais curto?"); decompor a palavra em sílabas como "partes" do programa | EI03CO04, EI03CO05; EF01CO02 | Cartas de comando-palavra; "Bug do Bolota" |
| **F2 – Decodificador (6 a 7 anos), meses 10 a 16** | Sílabas complexas (CCV, CVC), frases curtas | **Repetição com número** ("PULA 3 VEZES"); **evento** ("QUANDO O SINO TOCAR..."); **condicional V/F** com frase ("SE A PORTA ESTÁ ABERTA, ENTRE"); classificar palavras por atributo (padrão/abstração); programar com **frases de 3 a 4 palavras** | EI03CO06; EF01CO01, EF01CO03; EF02CO02 | Cartas de laço e condição; a Sofia lê no começo e depois só por pedido |
| **F3 – Leitor fluente inicial (7 a 8 anos), meses 16 a 24** | Textos decodificáveis, ortografia contextual | **Procedimentos** ("feitiço" com nome = sub-rotina reutilizável); depurar **vários erros**; **escrever** o próprio programa (ditado de comandos, escrita com apoio); seguir e escrever **receitas e manuais** (texto instrucional); explicar o próprio algoritmo para o Bolota; noções de **dados** (tabela da lojinha) e de **codificação** (código secreto letra↔número); **Mundo Digital/Cultura Digital** em mini-aventuras ("como o app ouve", privacidade) | EF02CO02 e seguintes; eixos Mundo Digital e Cultura Digital | Oficina de criação (estilo ScratchJr, com blocos de texto); preparação para o Scratch |

**Regras de dosagem:** o PC fica em no máximo **cerca de 15% a 20% do tempo** de sessão e **sempre via leitura** (Decisão 003). Cada fase tem no mínimo um **"desplugado para casa"** imprimível para fazer com a família (rel. 26; desplugado [25][41]). Para a **avaliação**, uma provinha desplugada no estilo TechCheck [15] ao fim de cada fase, **fora do formato do jogo** (lição de transferência do rel. 30).

---

## 4. Mecânicas de jogo: computação ATRAVÉS da leitura (18)

Para cada mecânica: **o que a criança faz → o que ela lê → conceito de PC → código BNCC Comp. (a conferir) → fase**. Todas exigem decodificação para serem resolvidas (integração intrínseca, rel. 30, Habgood & Ainsworth). O apoio de áudio (toque = a Sofia lê) é **retirado aos poucos** conforme o domínio.

1. **Cartas de comando decodificáveis.** A criança monta a fila de cartas para levar o Bolota até a fruta. As cartas são verbos do nível de leitura dela (PULA, ANDA, SOBE, ROLA, VIRA). Uma carta lida errado gera um caminho errado, e o feedback é **visível** ("o Bolota rolou em vez de pular"). **PC:** sequência/algoritmo. **BNCC:** EI03CO03, EI03CO04, EF01CO03. **Fase:** F1 em diante.
2. **O Bug do Bolota (depurar a sequência).** O Bolota "escreveu" um programa e caiu no rio. A criança **lê** as cartas, executa passo a passo (botão "um passo") e troca a carta errada. **PC:** depuração e execução passo a passo. **Bônus emocional:** "errar faz parte; vamos achar o bug juntos" (Decisão 003). **Fase:** F1 em diante.
3. **Depurar a palavra (cadeia de sílabas).** Uma ponte de sílabas forma uma palavra, mas uma pedra está trocada (PA-TO vira PA-LO). A criança lê, acha o "bug" e conserta. Variante: o **pseudopalavra-detector** ("essa palavra existe?"). **PC:** depuração e comparação com a especificação. **Leitura:** decodificação e mapeamento ortográfico (rel. 01, 25). **Fase:** F1 e F2.
4. **Receita do Bolota (algoritmo do dia a dia).** Cartões com os passos de uma receita ou rotina (LAVA A MÃO, PEGA O PÃO...) estão embaralhados. A criança lê e ordena, e o cozinheiro executa **literalmente**: se a ordem estiver errada, o resultado é engraçado. **PC:** algoritmo e precisão. **BNCC:** EI03CO02, EF01CO02. **Gênero textual:** instrucional. **Fase:** F1 a F3.
5. **Sequência da história (storyboard).** Depois de ouvir ou ler um conto curto, a criança ordena 3 a 6 cenas **com legenda escrita**. Depois "programa" o personagem para reencenar a história [44][46][47]. **PC:** sequência e decomposição. **Leitura:** compreensão (ordem temporal, conectivos PRIMEIRO, DEPOIS, NO FIM). **Fase:** F0 (imagens) a F3 (frases).
6. **Trilha de padrões sonoros.** Padrões de sílabas ou rimas (BA-BO-BA-BO-?; GATO-PATO-RATO-?) que a criança completa, e depois cria um padrão para o Bolota. **PC:** padrão e generalização. **BNCC:** EI03CO01. **Leitura:** consciência fonológica e família de palavras. **Fase:** F0 a F2.
7. **Laço mágico (repetição).** Em vez de 4 cartas "PULA", usa-se uma carta "REPETE 4 VEZES" + "PULA". A criança **lê o número por extenso** nas fases maiores (QUATRO). Desafio: "use o **menor número de cartas**". **PC:** laço e eficiência. **BNCC:** EF02CO02 (iteração definida). **Fase:** F2 e F3.
8. **Porta do SE (condicional verdadeiro/falso).** Portas com frases-condição: "SE A LUZ ESTÁ ACESA, ENTRE". A criança lê, observa a cena e decide **SIM/NÃO**. Depois monta a própria regra. **PC:** condicional e lógica booleana. **BNCC:** EI03CO06. **Raciocínio lógico** (Decisão 003). **Fase:** F2 e F3.
9. **Quando o sino tocar (eventos).** Cartões de gatilho ("QUANDO CHOVER", "QUANDO O GALO CANTAR") ligados a ações. A criança lê e faz as ligações. Depois o mundo "roda" e verifica. **PC:** evento e paralelismo simples. **Fase:** F2 e F3.
10. **Classificador da lojinha (atributos e abstração).** Itens da lojinha com etiquetas escritas vão para a caixa certa por **regra lida** ("SÓ COISAS QUE COMEÇAM COM /m/", "SÓ COISAS QUE CUSTAM MENOS DE 5 MOEDINHAS"). **PC:** classificação, abstração e dados. **BNCC:** EF01CO01. **Integração** com educação financeira (Decisão 002). **Fase:** F1 a F3.
11. **Decompõe e constrói (decomposição).** Uma palavra longa (BORBOLETA) é um "robô" desmontado em peças-sílaba. A criança separa, conta e remonta. Depois aplica o mesmo a uma tarefa grande ("arrumar a toca" = 3 subtarefas escritas). **PC:** decomposição. **Leitura:** segmentação silábica e síntese. **Fase:** F1 a F3.
12. **Feitiço com nome (procedimento/função).** A criança agrupa uma sequência que se repete ("VIRA, ANDA, ANDA") e **dá um nome escrito** a ela (o "feitiço GIRO"). Depois usa o nome como uma carta. **PC:** modularidade, abstração e sub-rotina. **Escrita:** nomear com escrita inventada ou com apoio. **Fase:** F3.
13. **Código secreto (codificação).** Mensagens cifradas com símbolos ↔ letras (cada desenho é uma letra). A criança **decifra** e lê a mensagem, e depois **cifra** o próprio nome para o Bolota. **PC:** representação e codificação de dados (eixo Mundo Digital). **Leitura:** correspondência grafema↔símbolo, a mesma lógica do alfabeto. **Fase:** F2 e F3.
14. **Dois caminhos, qual é melhor? (comparar algoritmos).** Duas soluções escritas para o mesmo problema. A criança lê as duas, conta os passos, testa e escolhe ("mais curta", "gasta menos moedinhas"). **PC:** comparar soluções e otimizar. **BNCC:** EI03CO05. **Fase:** F1 a F3.
15. **Instruções para o robô-literal (precisão da linguagem).** O robô da vila faz **exatamente** o que está escrito. A criança escreve ou monta frases-comando, e frases ambíguas geram resultados cômicos ("PEGUE A BOLA" — qual bola?). **PC:** especificação precisa. **Escrita:** clareza e pontuação. Retoma Hassenfeld & Bers [20]. **Fase:** F3.
16. **Mapa da vila com coordenadas (grade).** Uma grade com letras nas colunas e sílabas nas linhas leva a um tesouro. A criança lê as pistas ("vá até BA-3") e programa a rota. **PC:** representação espacial e algoritmo. Raciocínio espacial é subcomponente do PC em [71]. **Fase:** F2 e F3.
17. **Desafio Bebras da semana (enigma curto).** Um enigma de 1 a 3 minutos no estilo Bebras [38][39], **com enunciado decodificável** e imagem. Formato com 3 a 4 alternativas. Rende moedinhas, com o teto de recompensas do rel. 08 e 30. **PC:** variado (padrões, ordenação, árvores simples). **Fase:** F2 e F3.
18. **Oficina de criação (fluência computacional).** Um modo livre, no estilo ScratchJr: a criança cria uma **cena animada da própria história** usando **blocos com palavras** e grava a narração. Os colegas e a família podem "ler o programa" [5][34]. **PC:** criação, expressão e *remix*. **Cultura Digital:** autoria, crédito e compartilhar com segurança. **Fase:** F3.
19. **Como o app me ouve? (Mundo e Cultura Digital).** Mini-aventura em que a Sofia mostra que o microfone vira "ondas" e o computador **compara padrões**. A criança ordena, lendo, os passos "fala → microfone → computador compara → resposta". Inclui uma conversa sobre **privacidade** ("seu áudio é seu"). **PC:** sistema entrada → processamento → saída. **BNCC:** EI03CO09 e eixo Mundo Digital. **Fase:** F2 e F3.
20. **Desplugado em família (cartas imprimíveis).** O mesmo baralho de cartas-comando em PDF. Um adulto faz o "robô" e a criança **lê as cartas** para comandá-lo pela casa. Há um placar de bugs encontrados. **PC:** todos os básicos. **Mediação adulta**, que no rel. 30 (GraphoGame) foi o que fez o efeito aparecer. **Fase:** todas.

**Telemetria sugerida (rel. 20):** separar erros de **decodificação** (a criança leu "ROLA" como "PULA") de erros de **lógica** (leu certo, mas a ordem está errada). Para isso, oferecer o botão "ouvir a carta" e registrar se a criança o usa. Esse diagnóstico duplo é um diferencial do produto.

---

## 5. Tabela de referências

Tipos: MA = meta-análise; RS = revisão sistemática; ECR = ensaio aleatorizado; QE = quase-experimento; EC = estudo de caso ou descritivo; T = teórico ou livro; N = norma; P = produto.

| # | Autor(es) | Ano | Título (abreviado) | País | Tipo | DOI / ID / URL | V/NV | O que aproveitar |
|---|---|---|---|---|---|---|---|---|
| 1 | Wing | 2006 | Computational thinking | EUA | T | 10.1145/1118178.1118215 | V | Definição fundadora |
| 2 | Wing | 2008 | Computational thinking and thinking about computing | EUA | T | 10.1098/rsta.2008.0118 | V | Núcleo: abstração e automação |
| 3 | Brennan, Resnick | 2012 | New frameworks for studying and assessing the development of CT (AERA) | EUA | T | scratched.gse.harvard.edu/ct/files/AERA2012.pdf | NV (site inacessível nesta sessão) | Conceitos, práticas e perspectivas |
| 4 | Papert | 1980 | Mindstorms: children, computers, and powerful ideas | EUA | T | livro; resenha 10.2307/816450 | V (via resenha) | O erro como "bug" e o construcionismo |
| 5 | Bers | 2018/2020 | Coding as a Playground (1ª e 2ª ed.) | EUA | T | 10.4324/9781315398945; 10.4324/9781003022602 | V | Parquinho × cercadinho; 7 ideias poderosas |
| 6 | Bers, Doyle-Lynch, Chau | 2012 | Positive Technological Development (cap.) | EUA | T | 10.1017/cbo9781139027656.007 | V | Modelo PTD (6 Cs) |
| 7 | Bers, González-González, Armas-Torres | 2019 | Coding as a playground: positive learning experiences | Espanha | QE | 10.1016/j.compedu.2019.04.013 | V | Começar aos 3 anos; N = 172 |
| 8 | Bers, Flannery, Kazakoff, Sullivan | 2014 | Computational thinking and tinkering (TangibleK) | EUA | EC | 10.1016/j.compedu.2013.10.020 | V | Currículo de robótica na educação infantil |
| 9 | Kazakoff, Sullivan, Bers | 2013 | Intensive robotics workshop on sequencing ability | EUA | QE | 10.1007/s10643-012-0554-5 | V | 1 semana melhora o sequenciamento |
| 10 | Kazakoff, Bers | 2014 | Put your robot in, put your robot out | EUA | QE | 10.2190/EC.50.4.f | V | Sequenciamento com linguagem tangível |
| 11 | Sullivan, Bers | 2016 | Robotics in the early childhood classroom: 8-week curriculum | EUA | QE | 10.1007/s10798-015-9304-5 | V | Mesmo kit, profundidade crescente por idade |
| 12 | Elkin, Sullivan, Bers | 2016 | Programming with the KIBO kit in preschool classrooms | EUA | EC | 10.1080/07380569.2016.1216251 | V | KIBO na pré-escola |
| 13 | Flannery, Silverman, Kazakoff, Bers et al. | 2013 | Designing ScratchJr | EUA | EC/design | 10.1145/2485760.2485785 | V | Princípios de design para 5 a 7 anos |
| 14 | Strawhacker, Lee, Bers | 2018 | Teaching tools, teachers' rules (ScratchJr) | EUA | EC | 10.1007/s10798-017-9400-9 (ERIC EJ1179354) | V (sem resumo) | O estilo docente afeta a aprendizagem |
| 15 | Relkin, de Ruiter, Bers | 2020 | TechCheck: unplugged CT assessment | EUA | validação | 10.1007/s10956-020-09831-x | V | Modelo de provinha desplugada |
| 16 | Relkin, de Ruiter, Bers | 2021 | Learning to code and the acquisition of CT by young children | EUA | QE | 10.1016/j.compedu.2021.104222 | V | CAL-KIBO: ganho de cerca de 6 meses em 7 semanas |
| 17 | Bers, Blake-West, Kapoor, Levinson et al. | 2023 | Coding as another language: research-based curriculum | EUA | T/currículo | 10.1016/j.ecresq.2023.05.002 | V (sem resumo) | Programação como linguagem, ligada à alfabetização |
| 18 | Yang, Shaffer, Hagan et al. | 2023 | Impact Study of the CAL Curriculum | EUA | ECR (escolas) | ERIC ED626865 | V | Programação ↑; PC e leitura padronizada sem diferença |
| 19 | Levinson, Carocca P, Bers | 2025 | CAL curriculum in Argentina | Argentina | ECR | 10.1080/08993408.2025.2455339 | V | Evidência latino-americana |
| 20 | Hassenfeld, Bers | 2020 | Debugging the writing process | EUA | EC | 10.1002/trtr.1885 | V | Analogia programar = escrever (depurar) |
| 21 | Hassenfeld, Govind, de Ruiter, Bers | 2020 | If you can program, you can write | EUA | correlacional | 10.28945/4509 | V | Correlação leitura × programação fraca e positiva (N = 132) |
| 22 | Scherer, Siddiq, Sánchez Viveros | 2019 | Cognitive benefits of learning programming: transfer MA | Noruega | MA | 10.1037/edu0000314 | V | g = 0,49; letramento é o que menos ganha |
| 23 | Sun, Hu, Zhou | 2021 | Which way of design programming activities is more effective… | China | MA | 10.1111/jcal.12545 | V | g = 0,60; integração interdisciplinar |
| 24 | Wang, Chan, Li | 2024 | Do 3–8 years old children benefit from CT development? | Macau/China | MA | ERIC EJ1440206 (J. Educ. Comput. Res.) | V | d = 0,83 de 3 a 8 anos; o *scaffolding* modera |
| 25 | Chen, Yang, Metwally, Lavonen | 2023 | Fostering CT through unplugged activities | Finlândia/China | RS+MA | 10.1186/s40594-023-00434-7 | V | Desplugado g = 1,03; cartas e tabuleiro |
| 26 | Zhang, Liang, Tian, Yu | 2024 | Effects of unplugged programming on K-9 CT | China | MA | 10.1007/s11423-023-10339-5 | V (sem resumo) | Moderadores do desplugado |
| 27 | Montuori, Gambarota, Altoè, Arfé | 2024 | Cognitive effects of computational thinking | Itália | RS+MA | 10.1016/j.compedu.2023.104961 | V | Resolução de problemas 0,89; planejamento 0,36; estruturado para os pequenos |
| 28 | Montuori, Ronconi, Pozzan et al. | 2025 | Age-related effects of coding interventions | Itália | QE | 10.1016/j.ijcci.2025.100747 | V | 8 horas de programação → planejamento e inibição no 1º ano |
| 29 | Arfé, Vardanega, Montuori, Lavanga | 2019 | Coding in primary grades boosts children's EFs | Itália | ECR (turmas) | 10.3389/fpsyg.2019.02713 | V | 1º ano: planejamento e inibição |
| 30 | Di Lieto, Inguaggiato, Castro et al. | 2017 | Educational robotics on EFs in preschool (Bee-Bot) | Itália | piloto | 10.1016/j.chb.2017.01.018 | V | N = 12; memória de trabalho visuoespacial e inibição |
| 31 | Yang, Ng, Gao | 2022 | Robot programming versus block play in ECE | Hong Kong | ECR (turmas) | ERIC EJ1350624 (BJET) | V | Sequenciamento ↑; ajuda as crianças com baixa autorregulação |
| 32 | Bakala, Gerosa, Hourcade, Tejera | 2021 | Preschool children, robots, and CT: systematic review | Uruguai | RS | 10.1016/j.ijcci.2021.100337 | V (sem resumo) | Panorama de robôs na pré-escola |
| 33 | Su, Yang | 2023 | Systematic review of integrating CT in ECE | Hong Kong | RS | 10.1016/j.caeo.2023.100122 | V | Desafios: profundidade e avaliação |
| 34 | Papadakis | 2021 | Impact of coding apps on CT and computational fluency | Grécia | RS | 10.3389/feduc.2021.657895 | V | Apps ajudam o PC, mas não a fluência; o ScratchJr é melhor |
| 35 | Papadakis | 2024 | Can preschoolers learn CT with ScratchJr? | Grécia | RS | ERIC EJ1400120 | V | 18 estudos com ScratchJr |
| 36 | Papadakis, Kalogiannakis, Zaranis | 2016 | Developing programming concepts with ScratchJr in preschool | Grécia | EC | 10.1504/ijmlo.2016.077867 | V | Piloto na pré-escola |
| 37 | Bell, Vahrenhold | 2018 | CS Unplugged — how is it used, and does it work? | NZ/Alemanha | revisão | 10.1007/978-3-319-98355-4_29 | V (sem resumo) | Desplugado para introduzir, depois ligar à programação |
| 38 | Dagienė, Futschek | 2008 | Bebras contest: criteria for good tasks | Lituânia/Áustria | T | 10.1007/978-3-540-69924-8_2 | V | Critérios de enigma curto |
| 39 | Dagienė, Sentance, Stupurienė | 2017 | Two-dimensional categorization for informatics tasks | Lituânia/RU | T | 10.15388/informatica.2017.119 | V | Taxonomia conceito × habilidade |
| 40 | Brackmann, Román-González, Robles, Moreno-León et al. | 2017 | Development of CT skills through unplugged activities | Espanha/Brasil | QE | 10.1145/3137065.3137069 | V | Desplugado > controle |
| 41 | del Olmo-Muñoz, Cózar-Gutiérrez, González-Calero | 2020 | CT through unplugged activities in early primary | Espanha | QE | 10.1016/j.compedu.2020.103832 | V | Desplugado → plugado (Code.org) |
| 42 | Rijke, Bollen, Eysink, Tolboom | 2018 | Abstraction and decomposition in different age groups | Holanda | transversal | 10.15388/infedu.2018.05 | V | Abstração cresce com a idade |
| 43 | Tank, Ottenbreit-Leftwich, Moore et al. | 2024 | Sequencing as a means to CT in young learners | EUA | EC | ERIC EJ1428869 | V | 5 a 8 anos: padrão, algoritmo, decomposição e depuração |
| 44 | Fenty, Yeganeh, Uhteg | 2025 | Sequencing nursery rhymes through early coding | EUA | EC | ERIC EJ1487066 (Reading Teacher) | V | Parlendas + setas + grade |
| 45 | Fenty, Pierce, Schildwachter | 2022 | Coding is lit: coding and literacy in inclusive ECE | EUA | prático | ERIC EJ1335348 | V | Pré-programação com leitura em voz alta e inclusão |
| 46 | Beisly, Herath Mudiyanselage | 2026 | From picturebook to code | EUA | prático | ERIC EJ1518103 | V | Livro ilustrado → PC |
| 47 | Pelizzari, Marangi, Rivoltella | 2023 | Coding and childhood between play and learning (Cubetto) | Itália | QE | ERIC EJ1364761 | V | Storytelling + robô aos 4 anos |
| 48 | Grover, Pea | 2013 | Computational thinking in K–12 | EUA | revisão | 10.3102/0013189X12463051 | V | Estado da arte; críticas à definição |
| 49 | Shute, Sun, Asbell-Clarke | 2017 | Demystifying computational thinking | EUA | revisão | 10.1016/j.edurev.2017.09.003 | V | Seis facetas operacionais |
| 50 | Popat, Starkey | 2019 | Learning to code or coding to learn? | NZ | RS | 10.1016/j.compedu.2018.10.005 | V (sem resumo) | A programação como meio |
| 51 | Clements, Gullo | 1984 | Effects of computer programming on young children's cognition | EUA | QE | 10.1037/0022-0663.76.6.1051 | V (sem resumo) | Origem histórica (Logo) |
| 52 | Seckel, Salinas, Font et al. | 2023 | Guidelines to develop CT using the Bee-Bot | Chile/Espanha | RS qualit. | ERIC EJ1402668 | V | Diretrizes didáticas com Bee-Bot |
| 53 | Sullivan, Bers | 2016 | Girls, boys, and bots | EUA | piloto | ERIC EJ1113035 | V | Estereótipo de gênero aos 5 a 7 anos |
| 54 | Unahalekhaka, Bers | 2021 | Taking coding home: ScratchJr usage | EUA | log/uso | 10.1007/s11423-021-10011-w | V (sem resumo) | Uso em casa × escola (telemetria) |
| 55 | Yu, Roque | 2019 | Review of computational toys and kits for young children | EUA | revisão | 10.1016/j.ijcci.2019.04.001 | V (sem resumo) | Panorama de kits |
| 56 | Valente | 2019 | PC, letramento computacional ou competência digital? | Brasil | T | 10.5935/2238-1279.20190008 | V | Debate conceitual no Brasil |
| 57 | Ticon, Mól, Legey | 2022 | Atividades plugadas e desplugadas na educação infantil | Brasil | EC | 10.5585/40.2022.21751 | V | Sequência didática na educação infantil brasileira |
| 58 | Brackmann | 2018 | PC desplugado: ensino e avaliação na educação primária espanhola | Brasil/Espanha | QE/tese | 10.14210/ijcthink.v2.n1.p36 | V | Referência nacional de desplugado |
| 59 | CNE/CEB | 2022 | Parecer CNE/CEB nº 2/2022 e anexo (BNCC Computação) | Brasil | N | gov.br/mec/.../AnexoaoParecerCNECEBn22022BNCCComputao.pdf | NV (domínio bloqueado; fontes secundárias concordantes) | Eixos; códigos EI03CO, EF01CO, EF02CO |
| 60 | CNE/CEB | 2022 | Resolução CNE/CEB nº 1, de 04/10/2022 | Brasil | N | DOU 06/10/2022, seção 1, p. 33 | NV (idem) | Força normativa do complemento à BNCC |
| 61 | Brasil | 2023 | Lei nº 14.533 (PNED) | Brasil | N | planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14533.htm | NV (idem; definição de PC citada por fonte que reproduz o Planalto) | Definição legal de PC; eixos |
| 62 | MEC | 2017/2018 | Base Nacional Comum Curricular | Brasil | N | basenacionalcomum.mec.gov.br | NV | Competência geral 5 (cultura digital) |
| 63 | Bell, Witten, Fellows et al. | — | CS Unplugged (site e atividades) | NZ | P/recurso | csunplugged.org | NV | Atividades desplugadas abertas |
| 64 | Code.org | — | Cursos A–F, Hour of Code | EUA | P/recurso | code.org | NV | Progressão e atividades desplugadas |
| 65 | MIT Media Lab / DevTech | — | Scratch / ScratchJr | EUA | P | scratch.mit.edu; scratchjr.org | NV | Gratuitos; referência de interface |
| 66 | Lightbot; Kodable; codeSpark; Tangible Play (Osmo) | — | Lightbot Jr, Kodable, codeSpark (The Foos), Osmo Coding | Canadá/EUA | P | lightbot.com; kodable.com; codespark.com; playosmo.com | NV (sem ensaio revisado encontrado) | Referência de design, não de evidência |
| 67 | KinderLab / TTS | — | KIBO; Bee-Bot | EUA/RU | P | kinderlabrobotics.com; tts-international.com | NV | Tangíveis para a faixa |
| 68 | Kafai, Burke | 2014 | Connected Code | EUA | T | 10.7551/mitpress/9992.001.0001 | V | Programar como letramento social |
| 69 | Burke, Kafai | 2012 | The writers' workshop for youth programmers | EUA | EC | 10.1145/2157136.2157264 | V (sem resumo) | Narrativa + programação |
| 70 | Resnick | 2017 | Lifelong Kindergarten | EUA | T | 10.7551/mitpress/11017.001.0001 | V | Projetos, paixão, pares e brincadeira |
| 71 | Clarke-Midura, Silvis, Shumway et al. | 2021 | Kindergarten CT assessment using ECD | EUA | validação | ERIC EJ1298625 | V | Avaliação do pensamento algorítmico; raciocínio espacial |
| 72 | Saxena, Lo, Hew, Wong | 2019 | Unplugged and plugged activities in early childhood | Hong Kong | EC | 10.1007/s40299-019-00478-w (ERIC EJ1240455) | V (sem resumo) | Combinação plugada e desplugada na educação infantil |
| 73 | Angeli, Valanides | 2020 | Young children's CT with robotics: gender × scaffolding | Chipre | QE | 10.1016/j.chb.2019.03.018 | V (sem resumo) | O tipo de *scaffolding* interage com o gênero |

**Totais:** 73 entradas, das quais **60 [V]** (DOI ou ERIC conferidos nesta sessão; 14 sem resumo acessível, com o achado restrito ao título) e **13 [NV]** (normas e sites de produtos, cujos domínios estavam bloqueados na rede da sessão; Brennan & Resnick 2012; BNCC).

**Pendências para a próxima rodada (com acesso a gov.br e planalto.gov.br):**
1. Abrir o anexo do Parecer CNE/CEB 2/2022 e transcrever a redação oficial de EI03CO01 a 09, EF01CO e EF02CO. Há divergências entre a versão de rascunho (UFPR) e a final.
2. Conferir o art. 1º, § 2º, e o art. 3º, § 1º, da Lei 14.533/2023 (três ou quatro eixos; incisos).
3. Ler o texto completo de Zhang et al. 2024 [26] e de Bakala et al. 2021 [32] para os moderadores com a faixa de 4 a 6 anos.
4. Procurar avaliações independentes de Lightbot, Kodable, codeSpark e Osmo Coding.
