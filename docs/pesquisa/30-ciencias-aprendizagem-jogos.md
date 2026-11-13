# 30 — Ciências da aprendizagem e evidência sobre jogos educativos

> Frente de pesquisa 30 de 30: **Ciências da aprendizagem e jogos educativos**
> Projeto: FONEMA, plataforma web + app de alfabetização fônica em pt-BR, com a personagem Sofia.
> Data: novembro/2026. As referências estão numeradas entre colchetes, por exemplo [12], e listadas na seção 4.

**Nota de método.** O WebSearch não foi usado. Todas as referências foram buscadas por `curl` em três bases: **Crossref** (busca de DOI e metadados, e resumo quando disponível), **ERIC/IES** (ID e resumo) e **PubMed**. **[V]** quer dizer que o registro foi encontrado nesta sessão e que título, primeiro autor, ano e periódico conferem com o DOI ou o ID do ERIC. **[NV]** quer dizer que a obra não foi verificada on-line (livros clássicos sem DOI). Os números de efeito citados no texto (d, g, ES) foram copiados dos resumos oficiais lidos nesta sessão. Quando um detalhe vem só da memória do pesquisador, sem o resumo à vista, o texto diz **(conferir no texto completo)**.

---

## 1. Resumo executivo

1. **Jogos ensinam, mas pouco e de forma condicional.** As meta-análises dão efeitos pequenos a moderados: serious games d = 0,29 na aprendizagem e 0,36 na retenção [1]; jogos digitais g = 0,33 [2]; gamificação g = 0,49 no desempenho cognitivo [3]. O dado que mais importa ao FONEMA: **os jogos não foram mais motivadores que o ensino convencional** (d = 0,26, não significativo) [1]. Eles funcionam melhor **com outras formas de instrução, em várias sessões e com interação** [1][2]. Não se pode esperar que "ser jogo" resolva a motivação nem a aprendizagem.
2. **Tecnologia de leitura tem histórico fraco, e quanto mais rigoroso o estudo, menor o efeito.** Em 84 estudos K-12, a tecnologia rendeu ES = +0,16, e o software suplementar de exercícios ficou em +0,11 [16]. Com leitores com dificuldade, o ES foi 0,14. O que foi melhor (0,32) foi a tecnologia **integrada ao ensino em pequeno grupo** [17]. O estudo federal dos EUA com 16 produtos comerciais **não encontrou diferença** entre as turmas que usaram software e as que não usaram [29][30]. O Fast ForWord, muito vendido, **não teve efeito** em meta-análise [28].
3. **O GraphoGame, o "app fônico" mais estudado, é um alerta de projeto.** Numa meta-análise com 19 estudos, o efeito sobre a leitura de palavras foi **g = −0,02 (nulo)**. Nos contextos com **muita interação de um adulto**, subiu para **g = 0,48** [21]. Há ganhos claros **dentro do jogo** que **não transferem** para testes orais ou em papel [24], e ganhos em decodificação sem transferência para fluência e compreensão [25]. Também há resultados positivos com crianças de risco e como complemento da aula [22][23]. **Conclusão: o app sozinho e solto não basta. Precisa de mediação adulta, de transferência planejada e de medidas fora do jogo.**
4. **Os apps "educativos" de loja em geral são ruins.** Os Four Pillars [31] pedem que a criança esteja **ativa** ("minds-on"), **engajada sem distração**, com conteúdo **significativo** e **interação social**, dentro de um objetivo de aprendizagem. Os apps mais baixados pontuam mal nesses quatro pilares [32]. Em livros digitais, **hotspots, joguinhos e animações interativas atrapalham** a compreensão, sobretudo das crianças de famílias com menos estímulo, enquanto a narração e imagens animadas *coerentes com o texto* ajudam [34][35][36].
5. **A integração intrínseca funciona.** Quando a mecânica do jogo **é** a habilidade (e não um "prêmio" depois do exercício), as crianças aprendem mais no mesmo tempo e jogam **7 vezes mais** por escolha própria [8]. Para o FONEMA, cada mecânica de jogo deve exigir uma operação fonológica ou ortográfica, e não ser uma "cobertura de açúcar" sobre uma pergunta.
6. **Ensino explícito, exemplos resolvidos e retirada gradual do apoio.** A aprendizagem por descoberta sem guia é pior para iniciantes [56][57][58]. O Direct Instruction tem 50 anos de efeitos positivos em 328 estudos [54]. Rosenshine [53] resume o caminho: pequenos passos, modelagem, prática guiada, verificação, alta taxa de acerto, prática independente e revisão. Isso é o **"eu faço → nós fazemos → você faz"** [62][63]. Com a Sofia, essa é a espinha de toda lição.
7. **Dificuldade ótima entre 80% e 85% de acerto.** Um modelo formal mostra que o aprendizado é mais rápido com cerca de **85% de acerto** [49]. Rosenshine recomenda ~80% na prática guiada [53]. Crianças e bebês evitam o que é fácil ou difícil demais [51][50], e jogos desafiadores aumentam engajamento e aprendizagem [13]. **A regra do motor adaptativo: manter cada criança entre 75% e 90% de acerto na prática, com 85% como alvo, e exigir domínio (≥ 90% a 95%) só nas provinhas.**
8. **Domínio (mastery) e tutoria são a referência de ouro, mas o "2 sigma" é otimista.** Bloom relatou +2 DP com tutoria e +1 DP com mastery learning [40]. As meta-análises confirmam efeitos de mastery learning, maiores nos alunos mais fracos [42][43]. Com estimativas modernas, a tutoria humana fica em d ≈ 0,79 e os sistemas tutores por passos chegam perto disso [44][45]. **O FONEMA deve ser um tutor por passos** (feedback a cada passo, não só no fim), e não um banco de exercícios.

---

## 2. Achados

### 2.1 Meta-análises de jogos e gamificação

- **Wouters et al. (2013)** [1] analisaram 77 comparações de aprendizagem e 31 de motivação. Serious games superaram o ensino convencional em aprendizagem (d = 0,29) e retenção (d = 0,36), mas **não em motivação** (d = 0,26, n.s.). Moderadores: o efeito foi maior quando o jogo era **complementado por outra instrução**, quando havia **várias sessões** e quando se jogava **em grupo**.
- **Clark, Tanner-Smith & Killingsworth (2016)** [2] (K-16) acharam jogo × não jogo g = 0,33. Ao comparar versões do mesmo jogo, **designs "aumentados"** (com scaffolding, feedback explicativo e afins) renderam +0,34 a mais. Os efeitos variaram com as mecânicas, com o visual e a narrativa e com a qualidade da pesquisa. Ou seja, **o design do jogo importa tanto quanto ser jogo.**
- **Sailer & Homner (2020)** [3] mediram o efeito da gamificação (pontos, badges, narrativa) em três frentes: cognitivo g = 0,49, motivacional g = 0,36 e comportamental g = 0,25. Só o efeito cognitivo se manteve nos estudos mais rigorosos. A ficção de jogo e a interação social moderaram o efeito comportamental.
- **Hamari, Koivisto & Sarsa (2014)** [4] revisaram estudos de gamificação. Os efeitos são em geral positivos, mas **dependem do contexto e do usuário**, e há efeitos de novidade.
- **Vogel et al. (2006)** [5] e **Mayer (2019)** [6] concordam: jogos funcionam quando o **objetivo de aprendizagem está alinhado com a ação do jogo**. Mayer distingue três abordagens: *value-added* (o que acrescentar ao jogo), *cognitive consequences* (o jogo "treina" algo geral, com evidência fraca de transferência) e *media comparison*.
- **Plass, Homer & Kinzer (2015)** [7] descrevem quatro fundamentos do game-based learning: cognitivo, motivacional, afetivo e sociocultural. Eles insistem que a **mecânica de aprendizagem** e a **mecânica de jogo** devem coincidir.

### 2.2 Motivação: o que de fato engaja crianças

- **Integração intrínseca (Habgood & Ainsworth, 2011)** [8]. O estudo comparou versões do jogo *Zombie Division* (matemática, 7 a 11 anos). Na versão intrínseca, dividir é a forma de atacar. Na extrínseca, o quiz aparece entre as fases. A versão intrínseca **ensinou mais no mesmo tempo**, e em tempo livre as crianças a jogaram **7 vezes mais**. Base teórica: **Malone (1981)** [9], com desafio, fantasia (de preferência "endógena", ligada ao conteúdo) e curiosidade.
- **Gee (2003)** [10] lista princípios de bons jogos: aprender fazendo, informação "na hora certa" e "sob demanda", desafio no limite da competência, identidade do jogador e ciclos de domínio e novo desafio. Valem como heurísticas de design, não como evidência causal.
- **Autodeterminação (Ryan, Rigby & Przybylski, 2006)** [11]. O prazer em jogos é previsto pela satisfação de **competência, autonomia e pertencimento**. **Deci, Koestner & Ryan (1999)** [12] mostraram que **recompensas tangíveis esperadas** tendem a minar a motivação intrínseca, enquanto o **feedback verbal positivo e informativo** tende a aumentá-la. Implicação: as estrelas e figurinhas da Sofia devem **informar progresso** ("você aprendeu o som do M!"), e não "pagar" pela tarefa.
- **Desafio e flow.** **Hamari et al. (2016)** [13] verificaram que o desafio percebido e a habilidade aumentam engajamento e imersão, e que isso se associa à aprendizagem. O **flow** [15], com equilíbrio entre desafio e habilidade, metas claras e feedback imediato, também prevê engajamento em sala [14].
- **GraphoGame e engajamento (Ronimus et al., 2014)** [26]. O estudo examinou tempo, recompensas e desafio no engajamento de crianças finlandesas com um jogo de leitura. O engajamento **caiu ao longo das semanas**, e as **recompensas extras não tiveram o efeito esperado** sobre o tempo de jogo; o nível de desafio pesou mais **(conferir no texto completo)**. Em outro estudo com o GraphoLearn, as crianças com **mais engajamento cognitivo** ganharam mais em leitura. Já o engajamento **emocional** aumentou o tempo de jogo **sem aumentar os ganhos** [25]. **Diversão não é aprendizagem: é preciso medir as duas coisas separadamente.**

### 2.3 Tecnologia e alfabetização inicial: onde funcionou e onde não

**Panorama.**
- **Cheung & Slavin (2012)** [16] reuniram 84 estudos e 60 mil alunos K-12. O efeito médio foi +0,16. O CAI suplementar (exercícios no computador), o modelo dominante, ficou em **+0,11, sem significância educacional**, e **quanto maior a qualidade metodológica, menor o efeito**. Os aplicativos integrados ao ensino em sala foram melhores.
- **Cheung & Slavin (2013)** [17], com leitores com dificuldade (20 estudos, 7 mil alunos), acharam ES = 0,14. A **tecnologia integrada a pequeno grupo com professor** (ex.: Lindamood) chegou a 0,32. Os suplementares (Lexia, Jostens) ficaram em 0,18.
- **Slavin et al. (2011)** [18], numa síntese sobre leitores com dificuldade, concluíram que a **tutoria um a um e em pequeno grupo com ênfase fônica** supera a tecnologia sozinha.
- **Verhoeven et al. (2020)** [19] fizeram uma meta-análise de intervenções computadorizadas de letramento na pré-escola e na educação infantil. Os efeitos são positivos, com destaque para habilidades de código, como consciência fonológica e conhecimento de letras **(conferir os tamanhos de efeito no texto completo)**.
- **Kim et al. (2021)** [20], com apps educativos da pré-escola ao 3º ano (36 estudos, 285 efeitos), acharam média de **+0,31**. Os efeitos são **maiores na pré-escola**, **com testes feitos pelos próprios pesquisadores** (e não padronizados) e em **habilidades "restritas"** (letras, sons) do que em habilidades amplas, como vocabulário e compreensão. **"Measures matter": parte do efeito vem de medir o que o próprio app treina.**

**Onde não funcionou e por quê.**
| Caso | Resultado | Provável causa | Lição para o FONEMA |
|---|---|---|---|
| Estudo federal dos EUA com 16 produtos de leitura e matemática [29][30] | Sem diferença significativa | Uso suplementar pouco integrado; pouco tempo de uso real; produtos genéricos | Integrar ao plano do professor e da família; medir a dose real |
| Fast ForWord [28] | Nenhum efeito em leitura ou linguagem contra controles ativos ou sem tratamento | Teoria-base (déficit de processamento auditivo temporal) não se sustenta; treino de habilidade "subjacente" sem transferência | Ensinar **a habilidade-alvo** (grafema-fonema, leitura de palavras), não "treinos cerebrais" |
| GraphoGame, meta-análise [21] | g = −0,02 em leitura de palavras | Uso isolado; foco estreito; pouca interação adulta | Mediação adulta (família ou professor) planejada; com interação alta, g = 0,48 |
| GraphoLearn, Índia [24] | Ganhos só **dentro do jogo**; nada nos testes orais e em papel | Transferência não planejada; a criança joga "o jogo" e não lê | Provinhas fora do formato do jogo; leitura em voz alta de texto real |
| GraphoLearn, Finlândia, 2º ano [25] | Melhora na leitura de palavras; **sem transferência** para fluência, compreensão e ortografia | Treino restrito ao nível da palavra | Incluir frases, textos decodificáveis e escrita |
| Livros digitais com "interatividade" [34][35][36] | Hotspots e jogos **pioram** a compreensão; o livro eletrônico reduz o diálogo entre pais e filhos | Carga cognitiva irrelevante; atenção desviada | Nada de enfeites clicáveis durante a leitura; animação só quando ilustra o texto |
| Apps de loja [32][37] | A maioria pontua baixo nos Four Pillars | Distração, recompensas vazias, pouco conteúdo | Usar os Four Pillars como critério de aceite |

**Onde funcionou.**
- **Kyle et al. (2013)** [22], no Reino Unido, com crianças de 6 a 7 anos com leitura fraca: o GraphoGame Rime e o Phoneme, **como complemento da aula** (5 vezes por semana, 12 semanas), melhoraram leitura, ortografia e fonologia contra um controle sem tratamento, e os ganhos se mantiveram 4 meses depois.
- **Saine et al. (2011)** [23], na Finlândia, com crianças de risco de 7 anos: a intervenção remedial **com computador** (letra-som) foi muito melhor que a remediação comum e levou as crianças ao nível dos pares.
- **Carvalhais & Castro (2018)** [27] trazem um precedente em português (GraphoGame Fluent Portuguese, Portugal). Para o Brasil, é preciso conferir se há estudos com GraphoGame Brasil (outra frente).
- **Piasta & Wagner (2010)** [38] mostram que ensinar o alfabeto melhora o conhecimento de letras, mas com **pouca transferência** para fonologia e leitura. O conhecimento de letras é necessário, mas não suficiente, e precisa ser ligado logo à decodificação.

### 2.4 Four Pillars (Hirsh-Pasek et al., 2015)

Os quatro pilares [31] são condições para a aprendizagem com apps, dentro de um **objetivo de aprendizagem claro**:
1. **Ativo** ("minds-on", não só tocar na tela): a criança pensa, decide e produz.
2. **Engajado no conteúdo**, sem distrações. Efeitos e recompensas que tiram a atenção do conteúdo derrubam a aprendizagem.
3. **Significativo**: ligado à vida da criança e ao que ela já sabe.
4. **Socialmente interativo**: com adultos, com pares ou com personagens que respondem de forma contingente.

Meyer et al. (2021) [32] aplicaram os pilares aos apps mais baixados e encontraram pontuação baixa na maioria. Kucirkova [37] alerta que é preciso separar as suposições sobre tablets daquilo que de fato foi demonstrado. A revisão de Griffith et al. [33] encontra aprendizagem com apps em crianças pequenas, mas com estudos curtos e muitas vezes em laboratório.

### 2.5 Mastery learning, tutoria e "2 sigma"

- **Bloom (1968)** [39] propõe o *learning for mastery*: um objetivo claro, ensino, teste formativo, correção para quem não atingiu, enriquecimento para quem atingiu e só então avanço. **Bloom (1984)** [40] relatou tutoria com +2 DP e mastery em grupo com cerca de +1 DP, e pediu métodos coletivos que se aproximassem disso.
- **Guskey (2007)** [41] e **Guskey & Pigott (1988)** [42] confirmam efeitos positivos do mastery learning em grupo. **Kulik, Kulik & Bangert-Drowns (1990)** [43], com 108 avaliações, encontraram efeitos positivos, **maiores nos alunos mais fracos** e com melhora nas atitudes, mas com **mais tempo gasto** e menos alunos concluindo os programas autoinstrucionais. **Lição: mastery sem limite de tempo pode travar a criança. É preciso um "plano B"**, com outra explicação, outro exemplo ou um alerta ao adulto.
- **VanLehn (2011)** [44] recalibrou o 2 sigma: tutoria humana d ≈ 0,79; sistemas tutores **por passos** d ≈ 0,76; sistemas que só corrigem a resposta final d ≈ 0,31. **Kulik & Fletcher (2016)** [45] encontraram mediana de 0,66 em 50 avaliações de sistemas tutores, mas com efeito muito maior em testes locais do que em padronizados. **Lição: feedback no passo (em cada fonema ou sílaba) vale mais que corrigir só a resposta final; e testes padronizados são o juiz honesto.**

### 2.6 ZDP, scaffolding e dificuldade ótima

- **Vygotsky** [48] descreve a zona de desenvolvimento proximal (ZDP): o que a criança faz com ajuda hoje, fará sozinha amanhã. **Wood, Bruner & Ross (1976)** [46] definem as funções do andaime: despertar o interesse, simplificar a tarefa, manter o rumo, marcar o que é relevante, controlar a frustração e demonstrar. **Van de Pol et al. (2010)** [47] resumem três características do scaffolding: **contingência** (a ajuda depende do desempenho), **retirada gradual** e **transferência de responsabilidade**.
- **Regra dos 85% (Wilson et al., 2019)** [49]. Numa ampla classe de algoritmos de aprendizagem (classificação binária, descida de gradiente), a taxa de erro ótima é cerca de **15,87%**, ou seja, **~85% de acerto**. **Cuidado:** o resultado é teórico e vale para tarefas binárias. Não foi testado com crianças em alfabetização. Serve como **âncora**, não como lei.
- **Convergências.** A "região de aprendizagem proximal" [50] mostra que quem aprende bem estuda o que está *logo além* do que já domina. O efeito Cachinhos Dourados [51] mostra que bebês desviam o olhar de sequências simples demais ou complexas demais. A curiosidade busca o **progresso de aprendizagem** [52]. Rosenshine pede **taxa de sucesso alta (~80%)** na prática guiada [53].
- **Reversão por especialização (Kalyuga, 2007)** [64]. O apoio que ajuda o iniciante **atrapalha** quem já domina. O andaime precisa ser retirado conforme a criança avança.

### 2.7 Ensino explícito, exemplos resolvidos e "eu faço / nós fazemos / você faz"

- **Rosenshine (2012)** [53] reúne dez princípios: revisão diária; material novo em passos pequenos; muitas perguntas; modelos e exemplos; prática guiada; verificar a compreensão; alta taxa de sucesso; andaimes para tarefas difíceis; prática independente monitorada; revisão semanal e mensal.
- **Direct Instruction (Engelmann & Carnine)** [55]: roteiros com sequência cuidadosa, exemplos e contraexemplos escolhidos para evitar interpretações erradas ("faultless communication"), respostas frequentes e correção imediata. **Stockard et al. (2018)** [54] (328 estudos, 1966 a 2016) acharam todos os efeitos acadêmicos positivos e significativos, com pouca perda na manutenção e mais efeito com mais exposição.
- **Contra a descoberta sem guia.** Kirschner, Sweller & Clark [56], Mayer [57] e Alfieri et al. [58] mostram que a descoberta sem apoio rende menos que o ensino explícito, e que a descoberta **guiada** (com feedback, exemplos e explicações pedidas) é melhor que as duas.
- **Exemplos resolvidos.** Sweller & Cooper [59], Atkinson et al. [60] e Renkl [61] mostram que estudar exemplos resolvidos antes de resolver sozinho reduz a carga cognitiva [66] e acelera a aprendizagem de iniciantes. Depois, os passos resolvidos vão sendo **retirados aos poucos** ("fading").
- **Liberação gradual de responsabilidade.** Pearson & Gallagher (1983) [62] e Fisher & Frey [63] descrevem a sequência *I do / We do / You do together / You do alone*.
- **Feedback.** Hattie & Timperley (2007) [65] mostram que o feedback eficaz responde a três perguntas: para onde vou, como estou indo e qual o próximo passo. O feedback sobre a **tarefa e o processo** funciona; o elogio à pessoa ("você é inteligente") não.

---

## 3. Implicações para o FONEMA

### 3.1 Estrutura de lição com a Sofia (eu faço → nós fazemos → você faz)

Cada lição ensina **um objetivo** (ex.: a correspondência M → /m/ e as sílabas MA, ME, MI, MO, MU). A duração vai de 5 a 10 minutos.

| Fase | Duração aprox. | O que acontece | Base |
|---|---|---|---|
| 0. Aquecimento / revisão | 30 a 60 s | 3 a 5 itens rápidos de conteúdo já dominado (repetição espaçada). Sucesso quase garantido | Rosenshine 1 e 10 [53] |
| 1. **Eu faço** (modelagem) | 1 a 2 min | A Sofia mostra e fala em voz alta: "Olha a minha boca: mmm. Esta letra é o M. M com A: mmm-a, MA!" Um a dois exemplos resolvidos e um contraexemplo (ex.: N × M). A criança só observa e repete | DI [55]; exemplos resolvidos [59][60] |
| 2. **Nós fazemos** (prática guiada) | 2 a 3 min | A Sofia e a criança fazem juntas. A Sofia dá o primeiro fonema e a criança completa. Dicas contingentes: 1º erro → dica leve (repetir o som); 2º erro → dica forte (destacar a letra e dar o modelo); 3º erro → a Sofia faz junto e o item volta depois. Alvo de ~85% | Wood et al. [46]; van de Pol [47]; Rosenshine 5 a 7 [53] |
| 3. **Você faz** (prática independente em jogo) | 2 a 4 min | Mini-jogo com integração intrínseca (ver 3.3). Sem dicas automáticas; dica só se a criança pedir. Ajuste adaptativo de dificuldade | Habgood [8]; Kalyuga [64] |
| 4. Verificação / transferência | 30 a 60 s | 2 a 4 itens **fora do formato do jogo** (ler em voz alta uma palavra nova, escrever uma sílaba ditada) | Lição de [24][25] |
| 5. Fechamento | 15 s | Feedback informativo sobre o progresso ("Hoje você aprendeu MA, ME, MI!") e convite opcional para mostrar a um adulto | Deci [12]; Hattie [65]; McTigue [21] |

Regras complementares:
- **Retirada gradual do apoio entre lições.** Se a criança domina, a fase "eu faço" da próxima lição fica mais curta. Se a criança é iniciante, a fase dura mais [64].
- **Erro sem punição**: nunca tirar pontos nem vidas por erro de leitura. O erro leva a uma dica, e o item volta mais tarde.
- **Momento social**: ao fim de cada fase, um "Leia para alguém" (desafio para fazer com um adulto) e um painel para a família ou professor com uma sugestão de 2 minutos de interação. A meta-análise do GraphoGame mostra que **a interação adulta é o moderador que vira o resultado** (de −0,02 para 0,48) [21].

### 3.2 Regra de dificuldade adaptativa (~80 a 85%)

- **Alvo de prática: 85% de acerto** numa janela móvel dos últimos 10 a 20 itens (âncora em [49][53]).
  - Acima de 90% em duas janelas seguidas: subir a dificuldade (menos dicas, distratores mais parecidos, como b/d e m/n, palavras mais longas, menos tempo de exposição).
  - Entre 75% e 90%: manter.
  - Abaixo de 75%: descer a dificuldade (mais dicas, distratores mais distantes, voltar um passo do currículo) e voltar a "nós fazemos" com a Sofia.
  - Abaixo de 60% em duas sessões no mesmo objetivo: **plano B**, com outra explicação, outro exemplo e aviso ao adulto. É a lição de Kulik [43]: mastery sem saída trava a criança.
- **Domínio para avançar (provinhas):** ≥ 90% a 95% de acerto em itens **novos**, em formato **diferente** do jogo, em **dois dias diferentes** (domínio + retenção) [39][43].
- **Separar as duas métricas:** "acerto na prática" (alvo de 85%, para aprender) e "acerto na provinha" (≥ 90%, para certificar). Não usar a provinha para subir a dificuldade da prática.
- **Feedback por passo:** ao montar uma palavra, corrigir no fonema ou na sílaba onde a criança errou, e não só no fim [44].
- **Registrar** o tempo de resposta, o número de dicas por item e o padrão de erro, para separar "chutou" de "não sabe" e calibrar a regra com dados reais (a regra de 85% é uma hipótese a validar com as crianças do FONEMA).

### 3.3 Integração intrínseca: como desenhar cada jogo

- **A ação do jogo É a operação de leitura.** Exemplos:
  - *Trem das sílabas*: para o trem andar, a criança junta os vagões M + A falando "MA". Errado: responder um quiz e depois ganhar o trem.
  - *Pescaria de sons*: só se pesca o peixe que tem o som pedido, e o anzol "puxa" quando a criança aponta a letra certa e ouve o som.
  - *Ponte de letras*: para atravessar, monta-se a palavra ouvida, sílaba por sílaba (síntese e segmentação).
- **A fantasia vem do conteúdo** (fantasia endógena de Malone [9]): o mundo da Sofia é feito de sons e letras, e a história avança porque a criança lê.
- **A recompensa informa** (ex.: um cartão "Domínio do M") e não substitui o prazer de conseguir ler [12]. Nada de caixas-surpresa nem de moedas sem ligação com o conteúdo.
- **Sem distratores durante a decodificação**: as animações e os sons de efeito acontecem **depois** da resposta, nunca na hora em que a criança precisa olhar a letra [34][35].

### 3.4 Checklist de qualidade para cada jogo novo (critério de aceite)

**Pedagogia**
- [ ] Tem **um objetivo de aprendizagem** explícito, ligado a um item do currículo (grafema-fonema, sílaba, palavra, frase).
- [ ] A **mecânica central exige** essa habilidade, e não dá para vencer sem ler, ouvir ou segmentar (teste: "dá para ganhar chutando?" → precisa ser **não**).
- [ ] Tem a sequência eu faço / nós fazemos / você faz, ou se encaixa nela.
- [ ] Os exemplos e contraexemplos foram escolhidos para evitar a regra errada (ex.: b/d, m/n, sílabas inversas).
- [ ] Mede acerto na janela móvel e ajusta a dificuldade para ~85%.
- [ ] As dicas são contingentes e graduadas (leve → forte → modelo), e o apoio é retirado conforme o domínio.
- [ ] O feedback diz **o que** estava certo ou errado e **o que fazer** (por passo).
- [ ] Inclui ou alimenta uma **verificação fora do formato do jogo** (transferência).
- [ ] Revisão espaçada: o item volta em outros dias.

**Engajamento e Four Pillars**
- [ ] **Ativo**: a criança decide e produz (fala, escreve, monta), e não só toca para avançar.
- [ ] **Sem distração**: nenhum efeito, animação ou elemento clicável compete com a letra ou o som na hora da resposta.
- [ ] **Significativo**: as palavras e imagens são do universo da criança brasileira.
- [ ] **Social**: tem um gancho para um adulto ou par ("leia para alguém") e a Sofia responde de forma contingente.
- [ ] O erro não é punido com perda de progresso, vida ou tempo.
- [ ] A recompensa é informativa e está ligada ao domínio, e não ao volume de cliques.

**Medição e evidência**
- [ ] Registra acerto, tempo, dicas e padrão de erro por item.
- [ ] Antes de ir para todos, o jogo passou por um piloto com crianças, com medida **fora do jogo** (pré e pós) além da medida dentro dele.
- [ ] A dose está definida (minutos por sessão, sessões por semana) e é registrada.
- [ ] Engajamento (tempo, retorno) e aprendizagem (ganho) são reportados **separadamente** [25].

### 3.5 Riscos para evitar

1. **Inflar o efeito com métricas internas.** Os ganhos dentro do app são maiores que os ganhos em testes padronizados [20][45]. Os relatórios para escolas e famílias devem usar também uma medida externa.
2. **App solto, sem adulto.** É a principal causa do efeito nulo do GraphoGame [21]. É preciso desenhar o papel do adulto desde o início.
3. **"Treino cerebral" sem conteúdo** (o caso Fast ForWord [28]).
4. **Gamificação superficial**: pontos e badges sem integração intrínseca dão ganhos motivacionais instáveis [3] e podem minar a motivação intrínseca [12].
5. **Parar no nível da palavra**: sem frases, textos e escrita, não há transferência para fluência e compreensão [25][38].

---

## 4. Tabela de referências

Legenda: **[V]** registro conferido nesta sessão (DOI no Crossref ou ID no ERIC). **[NV]** não verificado on-line. Tipos: MA = meta-análise; RS = revisão sistemática; ECR = ensaio controlado randomizado; QE = quase-experimental; REV = revisão narrativa ou teórica; TEO = modelo teórico; REL = relatório técnico; LIV = livro.

| # | Autor(es) | Ano | Título (abreviado) | País | Tipo | DOI / ID | V/NV | O que aproveitar |
|---|---|---|---|---|---|---|---|---|
| 1 | Wouters, van Nimwegen, van Oostendorp, van der Spek | 2013 | A meta-analysis of the cognitive and motivational effects of serious games | Holanda | MA | 10.1037/a0031311 (ERIC EJ1008015) | V | d = 0,29; jogos **não** mais motivadores; combinar com instrução |
| 2 | Clark, Tanner-Smith, Killingsworth | 2016 | Digital games, design, and learning | EUA | MA | 10.3102/0034654315582065 | V | g = 0,33; design "aumentado" +0,34 |
| 3 | Sailer, Homner | 2020 | The gamification of learning: a meta-analysis | Alemanha | MA | 10.1007/s10648-019-09498-w | V | Cognitivo g = 0,49 (estável); motivacional instável |
| 4 | Hamari, Koivisto, Sarsa | 2014 | Does gamification work? | Finlândia | RS | 10.1109/HICSS.2014.377 | V | Efeito depende do contexto e do usuário |
| 5 | Vogel et al. | 2006 | Computer gaming and interactive simulations for learning | EUA | MA | 10.2190/FLHV-K4WA-WPVQ-H0YM | V | Jogos e simulações > ensino tradicional (média) |
| 6 | Mayer | 2019 | Computer games in education | EUA | REV | 10.1146/annurev-psych-010418-102744 | V | Abordagem *value-added*; transferência fraca |
| 7 | Plass, Homer, Kinzer | 2015 | Foundations of game-based learning | EUA | REV | 10.1080/00461520.2015.1122533 | V | Fundamentos cognitivo, motivacional, afetivo e social |
| 8 | Habgood, Ainsworth | 2011 | Motivating children to learn effectively: intrinsic integration | Reino Unido | QE | 10.1080/10508406.2010.508029 (ERIC EJ922627) | V | Integração intrínseca: mais ganho, 7× mais tempo livre |
| 9 | Malone | 1981 | Toward a theory of intrinsically motivating instruction | EUA | TEO | 10.1207/s15516709cog0504_2 | V | Desafio, fantasia endógena, curiosidade |
| 10 | Gee | 2003 | What video games have to teach us about learning and literacy | EUA | REV | 10.1145/950566.950595 | V | Princípios de design de bons jogos |
| 11 | Ryan, Rigby, Przybylski | 2006 | The motivational pull of video games: SDT | EUA | Empírico | 10.1007/s11031-006-9051-8 | V | Competência, autonomia, pertencimento |
| 12 | Deci, Koestner, Ryan | 1999 | Meta-analytic review… extrinsic rewards on intrinsic motivation | EUA | MA | 10.1037/0033-2909.125.6.627 | V | Recompensas tangíveis minam; feedback verbal ajuda |
| 13 | Hamari et al. | 2016 | Challenging games help students learn | Finlândia | Empírico | 10.1016/j.chb.2015.07.045 | V | Desafio → engajamento e imersão → aprendizagem |
| 14 | Shernoff et al. | 2003 | Student engagement… perspective of flow theory | EUA | Empírico | 10.1521/scpq.18.2.158.21860 | V | Equilíbrio desafio-habilidade prevê engajamento |
| 15 | Csikszentmihalyi | 1990 | Flow: the psychology of optimal experience | EUA | LIV | — | NV | Conceito de flow |
| 16 | Cheung, Slavin | 2012 | How features of educational technology applications affect student reading outcomes | EUA | MA | 10.1016/j.edurev.2012.05.002 (ERIC EJ986353) | V | ES +0,16; CAI suplementar +0,11; rigor ↑ efeito ↓ |
| 17 | Cheung, Slavin | 2013 | Effects of educational technology… struggling readers | EUA | MA | 10.1002/rrq.50 | V | ES 0,14; tecnologia integrada a pequeno grupo 0,32 |
| 18 | Slavin, Lake, Davis, Madden | 2011 | Effective programs for struggling readers | EUA | MA | 10.1016/j.edurev.2010.07.002 | V | Tutoria fônica > tecnologia isolada |
| 19 | Verhoeven, Voeten, van Setten, Segers | 2020 | Computer-supported early literacy intervention effects in preschool and kindergarten | Holanda | MA | 10.1016/j.edurev.2020.100325 | V | Efeitos em habilidades de código na pré-escola (conferir números) |
| 20 | Kim et al. | 2021 | Measures matter: meta-analysis of educational apps (preschool–grade 3) | EUA | MA | 10.1177/23328584211004183 | V | +0,31; efeito maior com medidas do pesquisador e habilidades restritas |
| 21 | McTigue, Solheim, Zimmer, Uppstad | 2020 | Critically reviewing GraphoGame across the world | Noruega | RS + MA | 10.1002/rrq.256 | V | g = −0,02; com adulto g = 0,48 |
| 22 | Kyle, Kujala, Richardson, Lyytinen, Goswami | 2013 | Two computer-assisted reading interventions in the UK (GG Rime/Phoneme) | Reino Unido | QE/ECR | 10.1002/rrq.038 (ERIC EJ996119) | V | Ganhos como complemento; mantidos 4 meses |
| 23 | Saine, Lerkkanen, Ahonen, Tolvanen, Lyytinen | 2011 | Computer-assisted remedial reading intervention for school beginners at risk | Finlândia | QE | 10.1111/j.1467-8624.2011.01580.x | V | Letra-som no computador ajuda as crianças de risco |
| 24 | Patel, Torppa, Aro, Richardson, Lyytinen | 2022 | Game-based phonics intervention… English learners in India (GraphoLearn) | Índia/Finlândia | ECR | 10.1111/jcal.12592 | V | Ganho só dentro do jogo; sem transferência |
| 25 | Ronimus, Eklund, Pesu, Lyytinen | 2019 | Supporting struggling readers with digital game-based learning | Finlândia | ECR | 10.1007/s11423-019-09658-3 (ERIC EJ1214780) | V | Palavras sim; fluência e compreensão não; engajamento cognitivo importa |
| 26 | Ronimus, Kujala, Tolvanen, Lyytinen | 2014 | Children's engagement during digital game-based learning of reading | Finlândia | Experimental | 10.1016/j.compedu.2013.10.008 | V | Recompensas × desafio × tempo no engajamento |
| 27 | Carvalhais, Castro | 2018 | Computer-assisted reading and spelling intervention with GraphoGame Fluent Portuguese | Portugal | Empírico (capítulo) | 10.1007/978-3-319-77712-2_140 | V | Precedente em português |
| 28 | Strong, Torgerson, Torgerson, Hulme | 2011 | Meta-analytic review… 'Fast ForWord' | Reino Unido | MA | 10.1111/j.1469-7610.2010.02329.x | V | Efeito nulo: não treinar "habilidades subjacentes" |
| 29 | Dynarski et al. | 2007 | Effectiveness of reading and mathematics software products (1st cohort) | EUA | REL/ECR | ERIC ED496015 | V | Sem diferença entre as turmas com e sem software |
| 30 | Campuzano et al. | 2009 | Effectiveness of reading and mathematics software products (two cohorts) | EUA | REL/ECR | ERIC ED504657 | V | Confirma efeitos fracos por produto |
| 31 | Hirsh-Pasek et al. | 2015 | Putting education in "educational" apps | EUA | REV | 10.1177/1529100615569721 | V | Four Pillars |
| 32 | Meyer et al. | 2021 | How educational are "educational" apps for young children? | EUA | Análise de conteúdo | 10.1080/17482798.2021.1882516 | V | Apps de loja pontuam baixo |
| 33 | Griffith, Hagan, Heymann, Heflin, Bagner | 2020 | Apps as learning tools: a systematic review | EUA | RS | 10.1542/peds.2019-1579 (PMID 31871246) | V | Evidência curta e de laboratório em crianças pequenas |
| 34 | Takacs, Swart, Bus | 2015 | Benefits and pitfalls of multimedia and interactive features in technology-enhanced storybooks | Holanda | MA | 10.3102/0034654314566989 | V | Multimídia ajuda; hotspots e jogos atrapalham |
| 35 | Bus, Takacs, Kegel | 2015 | Affordances and limitations of electronic storybooks | Holanda | REV | 10.1016/j.dr.2014.12.004 | V | Coerência entre texto e animação |
| 36 | Parish-Morris, Mahajan, Hirsh-Pasek, Golinkoff, Collins | 2013 | Once upon a time: parent–child dialogue and storybook reading in the electronic era | EUA | Experimental | 10.1111/mbe.12028 (ERIC EJ1026636) | V | E-book reduz o diálogo e a compreensão |
| 37 | Kucirkova | 2014 | iPads in early education: separating assumptions and evidence | Reino Unido | REV | 10.3389/fpsyg.2014.00715 | V | Cautela com promessas de tablets |
| 38 | Piasta, Wagner | 2010 | Developing early literacy skills: meta-analysis of alphabet learning | EUA | MA | 10.1598/rrq.45.1.2 | V | Pouca transferência letra → leitura |
| 39 | Bloom | 1968 | Learning for mastery | EUA | REV | ERIC ED053419 | V | Ciclo de domínio (formativo, corretivo, enriquecimento) |
| 40 | Bloom | 1984 | The 2 sigma problem | EUA | REV | 10.3102/0013189X013006004 | V | Tutoria +2 DP (otimista) |
| 41 | Guskey | 2007 | Closing achievement gaps: revisiting Bloom's "Learning for Mastery" | EUA | REV | 10.4219/jaa-2007-704 | V | Componentes essenciais do mastery |
| 42 | Guskey, Pigott | 1988 | Research on group-based mastery learning programs: a meta-analysis | EUA | MA | 10.1080/00220671.1988.10885824 | V | Efeitos positivos do mastery em grupo |
| 43 | Kulik, Kulik, Bangert-Drowns | 1990 | Effectiveness of mastery learning programs: a meta-analysis | EUA | MA | 10.3102/00346543060002265 | V | Maior ganho nos mais fracos; custo de tempo |
| 44 | VanLehn | 2011 | Relative effectiveness of human tutoring, ITS and other tutoring systems | EUA | MA | 10.1080/00461520.2011.611369 | V | Tutoria humana 0,79; tutor por passos 0,76 |
| 45 | Kulik, Fletcher | 2016 | Effectiveness of intelligent tutoring systems | EUA | MA | 10.3102/0034654315581420 | V | Mediana 0,66; menor em testes padronizados |
| 46 | Wood, Bruner, Ross | 1976 | The role of tutoring in problem solving | EUA/Reino Unido | Empírico/TEO | 10.1111/j.1469-7610.1976.tb00381.x | V | Funções do andaime |
| 47 | van de Pol, Volman, Beishuizen | 2010 | Scaffolding in teacher–student interaction | Holanda | RS | 10.1007/s10648-010-9127-6 | V | Contingência, retirada gradual, transferência |
| 48 | Vygotsky | 1978 | Mind in society | Rússia/EUA | LIV | — | NV | ZDP |
| 49 | Wilson, Shenhav, Straccia, Cohen | 2019 | The eighty five percent rule for optimal learning | EUA | TEO/computacional | 10.1038/s41467-019-12552-4 | V | Erro ótimo ≈ 15,87% |
| 50 | Metcalfe, Kornell | 2005 | A region of proximal learning model of study time allocation | EUA | Empírico | 10.1016/j.jml.2004.12.001 | V | Estudar o que está logo além do domínio |
| 51 | Kidd, Piantadosi, Aslin | 2012 | The Goldilocks effect | EUA | Empírico | 10.1371/journal.pone.0036399 | V | Nem simples nem complexo demais |
| 52 | Oudeyer, Gottlieb, Lopes | 2016 | Intrinsic motivation, curiosity, and learning | França/EUA | REV | 10.1016/bs.pbr.2016.05.005 | V | Curiosidade busca progresso de aprendizagem |
| 53 | Rosenshine | 2012 | Principles of instruction | EUA | REV | ERIC EJ971753 | V | 10 princípios; ~80% de sucesso |
| 54 | Stockard, Wood, Coughlin, Khoury | 2018 | Effectiveness of Direct Instruction curricula: meta-analysis | EUA | MA | 10.3102/0034654317751919 (ERIC EJ1185486) | V | 328 estudos, todos os efeitos acadêmicos positivos |
| 55 | Engelmann, Carnine | 1982 | Theory of instruction: principles and applications | EUA | LIV | — | NV | Sequência, exemplos e contraexemplos |
| 56 | Kirschner, Sweller, Clark | 2006 | Why minimal guidance during instruction does not work | Holanda/Austrália/EUA | REV | 10.1207/s15326985ep4102_1 | V | Guia explícito para iniciantes |
| 57 | Mayer | 2004 | Three-strikes rule against pure discovery learning? | EUA | REV | 10.1037/0003-066X.59.1.14 | V | Descoberta pura falha |
| 58 | Alfieri, Brooks, Aldrich, Tenenbaum | 2011 | Does discovery-based instruction enhance learning? | EUA | MA | 10.1037/a0021017 | V | Descoberta guiada > explícito > descoberta pura |
| 59 | Sweller, Cooper | 1985 | Worked examples as a substitute for problem solving | Austrália | Experimental | 10.1207/s1532690xci0201_3 | V | Exemplos resolvidos |
| 60 | Atkinson, Derry, Renkl, Wortham | 2000 | Learning from examples | EUA/Alemanha | REV | 10.3102/00346543070002181 | V | Princípios de exemplos resolvidos |
| 61 | Renkl | 2014 | Toward an instructionally oriented theory of example-based learning | Alemanha | TEO | 10.1111/cogs.12086 | V | Retirada gradual dos passos resolvidos |
| 62 | Pearson, Gallagher | 1983 | The instruction of reading comprehension | EUA | REV | 10.1016/0361-476X(83)90019-X | V | Liberação gradual de responsabilidade |
| 63 | Fisher, Frey | 2013 | Gradual release of responsibility instructional framework | EUA | REV | 10.1598/e-ssentials.8037 | V | Eu faço / nós fazemos / você faz |
| 64 | Kalyuga | 2007 | Expertise reversal effect | Austrália | REV | 10.1007/s10648-007-9054-3 | V | Retirar o andaime com o domínio |
| 65 | Hattie, Timperley | 2007 | The power of feedback | Nova Zelândia | REV | 10.3102/003465430298487 | V | Feedback de tarefa e processo |
| 66 | Sweller | 1988 | Cognitive load during problem solving | Austrália | Experimental | 10.1207/s15516709cog1202_4 | V | Carga cognitiva |

**Total: 66 referências, 63 verificadas [V] e 3 não verificadas [NV] (livros clássicos).**

### Pendências para próximas rodadas
- Conferir no texto completo os tamanhos de efeito de Verhoeven et al. 2020 [19] e os achados detalhados de Ronimus et al. 2014 [26].
- Procurar estudos do **GraphoGame Brasil** (pt-BR) e avaliações de apps de alfabetização no Brasil.
- Validar a regra dos 85% com dados do próprio FONEMA (teste A/B entre alvos de 75%, 85% e 95%).
