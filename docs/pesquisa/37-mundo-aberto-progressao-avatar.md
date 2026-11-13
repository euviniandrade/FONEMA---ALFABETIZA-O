# 37 — Mundo aberto, progressão de longa duração e avatar

> Frente de pesquisa 37. Projeto: FONEMA, plataforma web + app de alfabetização fônica em pt-BR para crianças de 4 a 8 anos, com a guia Sofia e o aprendiz Bolota.
> Data: novembro/2026. Responde às Decisões 001 (jornada de 2 anos), 002 (moedinhas, avatar e educação financeira) e 003 (seis competências).
> Base interna: rel. 08 (dopamina e motivação), 30 (ciências da aprendizagem e jogos) e 31 (funcionalidades e design). As referências externas estão numeradas entre colchetes, como [12], e listadas na seção 7. As internas aparecem como [rel. NN].

## Nota de método

- **Bases consultadas por `curl`:** Crossref (DOI e metadados, com resumo quando o editor libera), ERIC/IES (ID e resumo), PubMed E-utilities (PMID e resumo) e Semantic Scholar (resumo ou "TLDR" automático quando o editor esconde o resumo).
- **WebSearch** foi usado três vezes, só para o que não está em base acadêmica: a denúncia contra o Prodigy Math, as páginas de pesquisa do próprio Prodigy e os relatórios de impacto do Minecraft Education.
- **GitHub:** `gh api search/repositories` para ferramentas de geração procedural, narrativa e avatar. As estrelas e licenças foram lidas em 13/11/2026 e mudam com o tempo.
- **[V]** quer dizer que o registro foi encontrado nesta sessão e que título, primeiro autor e ano conferem com o DOI, o ID do ERIC, o PMID ou a URL. **[NV]** quer dizer que a fonte não foi aberta nesta sessão: vem de trecho de busca ou da memória do pesquisador.
- **Resultados numéricos** só aparecem quando foram lidos num resumo nesta sessão. Quando o detalhe vem do título, do TLDR automático ou da memória, o texto diz **(conferir no texto completo)**.
- **Muitos estudos sobre avatar são com adultos ou adolescentes.** Há pouquíssima pesquisa com crianças de 4 a 8 anos. Onde o texto extrapola para a faixa do FONEMA, isso está dito, e o ponto vira **hipótese para o piloto**.
- **A seção 3 (proposta)** é projeto, não achado. Os números de semanas, sessões e proporções são **hipóteses de produto** derivadas dos achados, para validar em piloto.

---

## 1. Resumo executivo

1. **Mundo aberto funciona como moldura de motivação, não como método de ensino.** As revisões sobre Minecraft na educação apontam ganhos de motivação, linguagem e habilidades sociais, mas também dúvidas sobre generalização, adequação à idade e segurança. O uso que funciona é **guiado por um adulto** [1][2]. A revisão sobre o Roblox repete esse padrão e acrescenta os riscos de cyberbullying e de segurança em ambiente aberto [6]. Para o FONEMA: **o mundo é o cenário, e a trilha fônica com domínio continua sendo o motor** (rel. 30).
2. **O que engaja nem sempre ensina.** Num experimento de larga escala com um jogo de matemática, **as versões mais envolventes foram as que produziram o aprendizado mais lento** [17]. Crianças **preferem** a versão mais bonita de um jogo (d > 0,86), mas **não aprendem mais** com ela (compreensão d = −0,59) [44]. A personalização cosmética do ambiente **não mudou nem motivação nem aprendizagem** em crianças de 9 anos [43]. Regra: **medir engajamento e aprendizagem separados**, e nunca otimizar só o engajamento.
3. **A novidade se gasta.** Numa turma universitária gamificada (pontos, medalhas, ranking), a motivação, a satisfação e a autonomia **caíram ao longo do semestre** em comparação com a turma sem gamificação [20]. "Pontos e medalhas" sozinhos são gamificação rasa [19]. Numa jornada de 2 anos, o que sustenta o retorno é **conteúdo novo e competência crescente** (regiões, histórias, construção), não pontos.
4. **Autonomia, competência e pertencimento explicam o prazer de jogar** [13][14]. Avatares e histórias reforçam o pertencimento; medalhas e gráficos de desempenho reforçam a competência [21]. **Escolher** aumenta a motivação intrínseca, e o efeito é **maior em crianças** e com **2 a 4 opções** [45]. Mesmo escolhas sem peso pedagógico aumentaram a aprendizagem em adolescentes [46].
5. **Personalizar com o mundo da criança melhora motivação e aprendizagem.** Contextualizar, personalizar e dar escolha aumentaram a motivação e o engajamento em crianças de 4º e 5º ano [31]. Livros personalizados aumentaram a aquisição de palavras em pré-escolares (n = 18) [32]. A personalização pelo interesse ajudou mais os alunos com pouco interesse inicial [33][34].
6. **Avatar: identificação gera motivação, mas o efeito na aprendizagem é indireto e quase não foi testado com crianças pequenas.** Identificar-se com o avatar aumentou autonomia, imersão, esforço e prazer [37]. Personalizar o avatar reduziu o abandono num programa de treino [38], aumentou motivação e autoeficácia num jogo educativo [39] e melhorou o desempenho num exergame. Avatares **idealizados**, porém, pioraram o desempenho em comparação com os **realistas** [40]. O **efeito Proteus** (a pessoa se comporta de acordo com as características do avatar) é confiável, com efeito de 0,22 a 0,26 em 46 experimentos [35][36]. Com crianças, personalizar o avatar aumentou presença e excitação **em jogos de propaganda de comida** [42]. Isso é um alerta de que o avatar amplifica também a persuasão.
7. **Narrativa: efeito misto.** Em sessões de menos de 2 horas, jogos narrativos **não ensinaram mais** que uma apresentação simples, e a hipótese "história forte ensina mais" não se confirmou [47]. As revisões veem ganho de engajamento, com efeito incerto na aprendizagem [48]. Para o FONEMA, a narrativa deve ser **curta, endógena e feita do próprio texto decodificável**, nunca cena longa que tira tempo de leitura.
8. **A geração procedural de conteúdo (PCG) é madura e já foi usada em leitura infantil.** Há taxonomias e métodos (busca, gramáticas, programação por restrições) [24][25][27]. Um gerador de conteúdo de leitura em inglês ajustado à habilidade da criança deu **mais ganho** que o conteúdo não ajustado [28]. Há métodos para ordenar automaticamente a dificuldade de progressões [29][30]. Para o FONEMA, o caminho é **PCG por restrições sobre um banco validado**: o gerador combina, mas não inventa palavra nem texto livre para a criança.
9. **O modelo comercial é o maior risco ético do "RPG educativo".** O Prodigy Math foi alvo de denúncia à FTC (2021) por 22 entidades, que alegaram pressão de assinatura sobre a criança, recompensas só para pagantes e progresso mais rápido para quem paga [10]. As evidências de eficácia divulgadas pela empresa são correlacionais e encomendadas por ela [11]. Num estudo com apps usados por crianças de 3 a 5 anos, **atrativos sedutores** apareceram em ~45% dos apps e **restrições de navegação** em 37% a 46%. O design manipulativo foi **mais frequente nos apps das crianças de famílias com menor escolaridade** [22]. Os jogos "ville" retêm o jogador com espera, energia, plantações que murcham e obrigação social [12]. **O FONEMA não usa nenhum desses padrões.**
10. **Construção livre favorece a criatividade quando não há ordem para "ser criativo".** Jogar Minecraft livremente aumentou a criatividade em relação a ver TV, a um jogo de corrida e a jogar Minecraft com a instrução "seja criativo" [4]. Os apps abertos para 0 a 5 anos podem favorecer ou inibir o brincar, dependendo do design [9]. A vila do FONEMA deve ter **espaço de construção livre**, sem metas impostas, ao lado das missões guiadas.

---

## 2. Achados

### 2.1 Mundos abertos e sandbox na educação

| Caso | O que a evidência mostra | Lição para o FONEMA |
|---|---|---|
| **Minecraft (Education)** | Revisão de literatura [1] [V]: o jogo é usado como ferramenta didática e como instrumento de pesquisa, com benefícios e limites discutidos. Revisão sistemática com 42 artigos [2] [V]: mais motivação, desenvolvimento da linguagem, aprendizagem em ciências e história, e habilidades sociais (comunicação, partilha, colaboração, liderança). Preocupações: idade adequada, segurança, uso de tecnologia e **generalização da aprendizagem**. A conclusão favorece o uso **informado e guiado**. Análise de aulas prontas do Minecraft Education [3] [V] (conferir os achados no texto completo). O relatório de impacto encomendado pela Microsoft (QUT, 2020; matemática, 3º e 4º ano, seis escolas, três meses) [5] [NV, só trecho de busca] tem amostra pequena e é material do fabricante. | O sandbox engaja e favorece o trabalho social, mas **não substitui o ensino explícito**. Mediação adulta e verificação fora do jogo continuam obrigatórias (rel. 30). |
| **Roblox** | Revisão com 40 estudos [6] [V]: atrai muitos alunos, gera atitudes positivas e combina bem com aprendizagem colaborativa e programação. Desafios: **cyberbullying, segurança e falta de desenho pedagógico**. Os estudos empíricos ainda são poucos. | Nada de chat aberto nem de conteúdo gerado por outros usuários sem moderação no ambiente da criança. O "social" do FONEMA é com personagens, família e turma, por canais fechados. |
| **Animal Crossing** | Durante a pandemia, o jogo apareceu associado a conexão social e alívio de isolamento [7] [V] (conferir as medidas no texto completo). Há análise das oportunidades de **letramento e aprendizagem social** do jogo para quem aprende uma língua [8] [V]. O design (vila que cresce, moradores com pedidos, coleções, tempo real, ausência de derrota) é referência de **estrutura** para o FONEMA. | Pegar a estrutura (vila, moradores que pedem coisas, coleções, ausência de derrota) **sem** o relógio que pune quem não volta (plantas que murcham, moradores que vão embora) [12]. |
| **Toca Life World e apps abertos** | Não foi encontrado estudo controlado sobre Toca Life World nesta sessão [NV]. O estudo britânico com 2.000 famílias e 17 h de vídeo [9] [V] mostra que o design do app pode **favorecer ou inibir** o brincar e a criatividade de crianças de 0 a 5 anos. | Um modo "casinha/faz de conta" sem objetivos é coerente com a idade, desde que fique **fora** do tempo da lição e sem enfeites que distraiam durante a leitura (rel. 30, livros digitais). |
| **Prodigy Math (RPG educativo)** | Denúncia à FTC em 19/02/2021 por 22 entidades lideradas pela Fairplay (antiga CCFC) [10] [V, página da denúncia]. **Alegações** (não constatações): o jogo se diz gratuito mas mostra à criança anúncios da versão paga; há recompensas virtuais só para pagantes; quem paga avança mais rápido e parece "melhor em matemática". A página de pesquisa da empresa [11] [V] cita estudos próprios ou coescritos, que ela mesma descreve como **correlacionais**, e uma análise encomendada que a classifica como ESSA Tier 3. | A estrutura de RPG (avatar, batalhas de pergunta, mundo) engaja, mas o modelo comercial **dentro da experiência da criança** é o ponto mais criticado. O FONEMA já decidiu que a oferta de compra só aparece ao adulto (Decisões 001/002). Aqui se acrescenta: **assinar nunca muda poder, velocidade nem itens exclusivos do avatar**. |
| **Jogos "ville" (FarmVille e afins)** | Análise dos padrões motivacionais pela economia comportamental [12] [V]: espera, energia, punição por ausência (plantações que murcham), obrigação social e compra para pular espera. | É a **lista do que não copiar**. O "Jardim da Revisão nunca morre" do rel. 31 já segue essa linha. |

### 2.2 Progressão e retenção: core loop, meta-game, flow e pacing

- **Necessidades psicológicas.** A satisfação de **competência, autonomia e pertencimento** prevê prazer, vontade de continuar e bem-estar no jogo [13] [V]. O modelo motivacional de engajamento em jogos [14] [V] separa o engajamento **saudável** (necessidades satisfeitas) do **obsessivo** (compensação de necessidades frustradas). Para o FONEMA, a criança deve sair da sessão **satisfeita**, não "presa".
- **Elementos de jogo têm efeitos específicos** [21] [V]. Num experimento controlado, medalhas, ranking e gráficos de desempenho aumentaram a sensação de **competência** e o sentido da tarefa. **Avatares, histórias com sentido e colegas de equipe** aumentaram o **pertencimento**. O FONEMA usa os dois grupos: **gráfico de progresso não numérico** para competência (rel. 31 §3.3.1) e **avatar, Sofia, Bolota e moradores** para pertencimento. Ranking entre crianças continua proibido (rel. 08).
- **Flow e ajuste de dificuldade.** O flow depende de equilibrar desafio e habilidade. O "canal do flow" é diferente para cada jogador, por isso o jogo deve oferecer **escolhas embutidas de dificuldade** em vez de um caminho único [15] [V]. O modelo GameFlow transforma isso em critérios de avaliação (concentração, desafio, habilidade, controle, metas claras, feedback, imersão, interação social) [50] [V]. O ajuste dinâmico de dificuldade [16] [V] é o equivalente do motor adaptativo de ~85% de acerto (rel. 20 e 30).
- **Desafio × engajamento × aprendizagem** [17] [V]. Num jogo on-line de matemática testado em larga escala, as condições **mais envolventes** produziram as **taxas de aprendizagem mais lentas** (TLDR do Semantic Scholar; conferir os números no texto completo). É a confirmação, em dados de produto, de que **tempo de jogo não é aprendizagem**. O motor adaptativo do FONEMA deve otimizar **domínio**, e o engajamento entra só como restrição ("a criança quer voltar").
- **Átomos de habilidade.** O método de Deterding [18] [V] parte da habilidade-alvo e desenha o **ciclo** em torno dela: meta → ação → regra → feedback → domínio crescente. É a forma técnica de garantir a integração intrínseca (rel. 30, Habgood): **o core loop do FONEMA é o ciclo de decodificar**, e não um ciclo de pontos com leitura colada por cima.
- **Gamificação rasa e efeito novidade.** Só enquadrar uma tarefa como "jogo" já aumentou o interesse [19] [V], mas é efeito de enquadramento, não de mecânica. No estudo longitudinal [20] [V], a turma gamificada teve **menos** motivação intrínseca, satisfação e autonomia ao longo do tempo. O rel. 30 [26] também mostra o engajamento caindo ao longo das semanas no GraphoGame. **Implicação para 2 anos:** o "motor de novidade" tem que ser **conteúdo** (região nova, história nova, construção nova, personagem novo), não mais pontos.
- **Loops diários éticos.** Num estudo com 160 crianças de 3 a 5 anos e os apps que mais usavam [22] [V], os padrões manipulativos para prolongar o jogo e para comprar foram, respectivamente: pressão de relação parassocial com personagem em 24,8% e 18,8% dos apps com personagens; pressão de tempo em 17,3% e 10,5%; restrições de navegação em 45,9% e 36,8%; atrativos sedutores em 45,1% e 45,9%. As crianças de famílias com menor escolaridade tinham **mais** desses padrões. Num player de vídeo infantil com **fim embutido**, ficou mais fácil a criança se autorregular do que com controle parental rígido [23] [V] (conferir o desenho do estudo no texto completo). Para o FONEMA: **o fim da sessão faz parte do design**, como no ritual da Sofia (rel. 08 §3.6), e nada de sequência de dias que zera.

### 2.3 Geração procedural de conteúdo (PCG) para aprender

- **Taxonomia.** A PCG baseada em busca [24] [V] gera candidatos e os avalia por uma função de qualidade. Ela se divide em online × offline, necessária × opcional, aleatória × parametrizada e construtiva × gerar-e-testar. O manual de referência [25] [V] cobre gramáticas, L-systems, ruído, programação por restrições e avaliação de conteúdo gerado.
- **PCG guiada pela experiência** [26] [V]: o conteúdo é gerado para produzir uma **experiência-alvo** no jogador, a partir de um modelo do jogador. No FONEMA, a "experiência-alvo" é **~85% de acerto com o conteúdo já ensinado + revisão espaçada**.
- **Programação por conjuntos de respostas (ASP)** [27] [V] declara o **espaço de projeto** com restrições ("toda palavra usa só correspondências que a criança já domina") e deixa o solucionador achar conteúdos válidos. É a abordagem mais adequada para garantir a **decodificabilidade** por construção.
- **PCG em leitura infantil** [28] [V]: um gerador com algoritmo genético e SVM criou conteúdo de um jogo de leitura inicial em inglês ajustado à habilidade de cada criança. As crianças tiveram **mais ganho de desempenho** com o conteúdo ajustado do que com o não ajustado, e a abordagem orientada por dados superou a heurística.
- **Progressões automáticas.** Traços de execução permitem ordenar a dificuldade de exercícios e prever a avaliação de dificuldade melhor que os métodos de base [29] [V]. Estratégias de progressão inspiradas em tutores inteligentes buscam domínio não só dos conceitos básicos, mas de **combinações** de conceitos [30] [V]. No FONEMA, isso vira o **grafo de pré-requisitos** de correspondências grafema-fonema (CGF) e estruturas silábicas que guia o gerador.

### 2.4 Personalização, avatar e identificação

**Personalização de conteúdo (o que mais tem evidência):**
- **Cordova e Lepper (1996)** [31] [V, resumo do ERIC]: 72 crianças de 4º e 5º ano, uma condição de controle e quatro experimentais. **Contextualização** (fantasia), **personalização** (nome, preferências) e **escolha** (mesmo de detalhes incidentais) aumentaram a motivação e o engajamento. O ganho na aprendizagem é citado na literatura posterior (conferir os números no texto completo).
- **Livros personalizados** [32] [V]: 18 crianças de idade média 3a10m; as palavras novas inseridas nas partes **personalizadas** do livro foram mais aprendidas (conferir os números no texto completo). É o achado mais próximo da faixa e do domínio do FONEMA.
- **Personalização pelo interesse** [33] [V]: problemas de álgebra ligados aos interesses do aluno melhoraram o desempenho, com efeito maior para quem tinha mais dificuldade (conferir os números). A revisão [34] [V] separa três formas (contextual, por escolha e ativa) e mostra ganho de interesse **sobretudo nos alunos com pouco interesse inicial**.

**Avatar:**
- **Efeito Proteus** [35] [V]: as pessoas se comportam de acordo com o avatar (atratividade, altura). A **meta-análise** de 46 experimentos [36] [V] acha efeito consistente entre **0,22 e 0,26**, "pequeno a médio", mas grande para efeitos de mídia digital.
- **Identificação com o avatar → motivação intrínseca** [37] [V]: identificação por semelhança, corporificada e "desejada" (wishful) aumentou autonomia, imersão, esforço investido, prazer e afeto positivo (adultos).
- **Personalização contra o abandono** [38] [V]: num programa digital de autoaperfeiçoamento, personalizar o avatar foi proposto e testado como forma de reduzir o abandono por engajamento voluntário (adultos; conferir os números no texto completo).
- **Avatar em jogo educativo** [39] [V]: independentemente das medalhas, a identificação com o avatar melhorou a experiência, a motivação intrínseca e a autoeficácia, e levou a níveis criados com mais qualidade (conferir a idade da amostra no texto completo).
- **Realista × idealizado** [40] [V]: personalizar aumentou identificação, motivação intrínseca e desempenho físico. Avatares **idealizados** aumentaram a identificação "desejada", mas **pioraram o desempenho** em comparação com os **realistas**.
- **Crianças.** Crianças de 9 a 12 anos com sobrepeso foram testadas com o tamanho do corpo do avatar e com ameaça de estereótipo num jogo de corrida [41] [V] (conferir os resultados no texto completo). Ao personalizar o avatar em **jogos patrocinados por fast-food**, as crianças tiveram mais presença e excitação [42] [V]. Implicação ética: **o avatar amplifica o que estiver em volta dele**, inclusive persuasão comercial. No FONEMA ele só pode estar ligado a aprender.
- **Personalizar enfeites não ensina** [43] [V]: 143 crianças de ~9 anos, cerca de 20 min de jogo sobre biologia. Personalizar elementos do ambiente (não o avatar) teve **resultado nulo** em motivação e em aprendizagem. Na mesma linha, o visual mais bonito foi preferido, mas não ensinou mais [44] [V].
- **Síntese para crianças de 4 a 8 anos:** não foi encontrada meta-análise específica sobre personalização de avatar **e aprendizagem** com crianças pequenas. A evidência sustenta o avatar como **alavanca de identidade, pertencimento e retorno**, e **não** como fonte de ganho de aprendizagem. Por isso a personalização deve ficar **fora** do tempo nobre de leitura, e o efeito deve ser testado no piloto (seção 4).

### 2.5 Escolha e autonomia

- Meta-análise com 41 estudos [45] [V, resumo do ERIC]: dar escolha aumentou a motivação intrínseca, o esforço, o desempenho e a percepção de competência. O efeito foi **maior**: (a) para escolhas **sem peso pedagógico**; (b) com **2 a 4 escolhas seguidas**; (c) quando **não havia recompensa** depois da escolha; (e) **em crianças** do que em adultos.
- Em dois experimentos com alunos do ensino médio [46] [V], uma escolha de tema (mesmo **fictícia**) melhorou a retenção e a transferência. O efeito na retenção passou pela **percepção de autonomia**.
- Para o FONEMA: oferecer **2 a 3 opções** por decisão (qual missão, qual morador ajudar, onde pôr a casa, qual roupa). A escolha nunca é sobre **pular** o conteúdo-alvo: todas as opções levam ao mesmo objetivo fônico.

### 2.6 Narrativa

- **Adams et al. (2012)** [47] [V]: em sessões de menos de 2 horas, o jogo narrativo **não** foi superior para aprender. Os resultados contradizem a hipótese da **descoberta** (aprender fazendo em cenário envolvente) e a hipótese da **narrativa** (história forte ensina mais). Não há dados para períodos longos de jogo.
- **Revisão sobre narrativa em serious games** [48] [V]: a narrativa aparece ligada a engajamento e motivação, mas a evidência sobre aprendizagem é mista (conferir o detalhamento no texto completo).
- Coerência com o rel. 30: animações e "hotspots" que não ilustram o texto **atrapalham** a compreensão. **Decisão para o FONEMA:** a narrativa é feita do **próprio texto que a criança lê** (bilhete do morador, placa, livrinho). Há fantasia endógena (Malone, rel. 30), sem cenas longas que só se assistem.

### 2.7 Construção, sandbox e criatividade

- Jogar Minecraft **sem instrução** aumentou a criatividade em comparação com Minecraft **com a ordem "seja criativo"**, com um jogo de corrida e com ver TV (n = 352 universitários) [4] [V]. O efeito depende de **como** se joga, não só da mecânica.
- As revisões sobre Minecraft [1][2] mostram ganhos de planejamento, colaboração e linguagem quando há **projeto com propósito** e mediação.
- Para o FONEMA: a vila tem dois modos. **(1) Projetos da vila**, guiados por missões de leitura (ler a planta, a lista de material, a ordem dos passos, ligada ao pensamento computacional). **(2) Construção livre**, sem metas, onde a criança decora e arruma como quiser.

### 2.8 Design para crianças pequenas em mundo aberto

- A síntese clássica de design de interação para crianças [49] [V] reforça o que os rels. 24 e 31 já trazem: alvos grandes, ícones concretos, apoio de áudio, pouca carga de memória, **navegação previsível**.
- **Restrições de navegação** (beco sem saída, botão de fechar escondido, fluxo que obriga a ver algo) são um dos padrões manipulativos mais comuns em apps de crianças de 3 a 5 anos [22]. **Evitar perda** é igualmente central: nada some, nada murcha, nada zera [12][22]; rel. 08 §3.5.
- Implicação: o "mundo aberto" de uma criança de 4 anos **não é** um mapa livre de 360°. É uma **rede pequena de lugares conhecidos**, com um "fio de luz" para a sugestão do dia e um botão de casa sempre visível (seção 3.8).

### 2.9 Tensão com o rel. 08 e como resolver

O rel. 08 (§3.4) põe "moedas e lojas" na camada de **alto risco** e recomenda não usar. A Decisão 002, posterior, aprovou as moedinhas com regras. Os achados desta frente **não** derrubam o alerta: as recompensas tangíveis esperadas minam a motivação intrínseca (Deci et al., rel. 30 [12]). A escolha é mais motivadora quando **não** há recompensa depois dela [45]. E a pressão de compra é o que mais pesa nos apps infantis [22].

**Proposta de reconciliação** (detalhada na seção 3.5):
1. as moedas **nunca** são anunciadas antes da tarefa ("leia 10 e ganhe 5");
2. o ganho vem **em blocos ao fim da sessão** e nos **marcos de domínio**, apresentado como **informação** ("você dominou o som do M: a vila te agradece");
3. não há preço por acerto individual;
4. o piloto mede se a criança **escolhe ler** no modo livre (medida de motivação intrínseca) com e sem a lojinha ativa.

---

## 3. Proposta do Mundo do FONEMA

### 3.1 Princípios-guia

| # | Princípio | Base |
|---|---|---|
| M1 | **O core loop é decodificar.** Toda ação que avança o mundo exige ler, ouvir e segmentar, ou escrever. | rel. 30 (integração intrínseca); [18] |
| M2 | **O domínio libera; o tempo nunca libera.** Nada se ganha por esperar ou por voltar no dia certo. | Decisão 001; [12] |
| M3 | **Não existe perda.** Nada murcha, ninguém vai embora, nenhum contador zera, nenhuma moeda se perde. | rel. 08 §3.5; [12][22] |
| M4 | **Novidade vem do conteúdo.** Regiões, histórias, moradores, construções. Não mais pontos. | [19][20] |
| M5 | **Escolha pequena e frequente.** 2 a 3 opções, todas com o mesmo alvo pedagógico. | [45][46] |
| M6 | **Avatar e vila são identidade e pertencimento**, não aceleradores de aprendizagem nem poder. | [21][37][43] |
| M7 | **Medir separado:** domínio fônico, transferência fora do jogo e vontade de voltar. | [17][44]; rel. 30 |
| M8 | **Fim natural de sessão**, com ritual e curiosidade para amanhã. | rel. 08 §3.6; [23] |
| M9 | **Mundo seguro:** sem chat aberto, sem conteúdo de outros usuários, sem compra visível para a criança. | [6][10][22]; Decisões 001/002 |
| M10 | **Gerador por restrições:** só combina itens validados. Não cria palavra nem texto livre para a criança. | [27]; rel. 25 |

### 3.2 Mapa de regiões: jornada de ~2 anos

**Lógica:** cada região corresponde a uma **etapa da ordem de ensino do rel. 02 §5.5** (etapas 0 a 10) e às fases 1 a 8 do rel. 31 §5. Os biomas e paisagens brasileiros dão o cenário e o **conhecimento de mundo** (Decisão 003, princípio 9). As semanas são **indicativas** para uma criança de 5 a 6 anos que joga cerca de 4 a 5 sessões por semana. A passagem é **por domínio**: uma criança de 4 anos pode passar o dobro do tempo nas primeiras regiões, e uma de 7 anos pode atravessá-las em dias.

| # | Região (cenário) | Semanas (indicativo) | Etapa rel. 02 / Fase rel. 31 | Conteúdo fônico | Competências transversais (Decisão 003) | "Chefe" de região (provinha) | O que a vila ganha |
|---|---|---|---|---|---|---|---|
| R0 | **Quintal da Sofia** (centro da vila) | 1–3 | Etapa 0 / F1 | Consciência fonológica oral: rima, sílaba, som inicial | Emocional: nomear 4 emoções básicas; Tecnologia: "como o app me ouve" | Festa das Rimas (oral) | Casa do avatar, quintal, Bolota |
| R1 | **Ilha das Vogais** (litoral, praia) | 3–6 | Etapa 1 / F2 | A E I O U (é/ê, ó/ô) | Lógico: classificar por som; Financeira: primeira moedinha e o cofrinho | O Farol Apagado (acender lendo vogais) | Barco e cais (ponte para o continente) |
| R2a | **Mata Atlântica: Vale do M-L-F** | 6–10 | Etapa 2 / F2–F3 | M, L, F + sílabas CV + primeiras palavras | Computacional: sequência de 3 passos (cartas de comando para o Bolota) | Cachoeira das Sílabas | Horta e Árvore das Palavras |
| — | *Fim do recorte gratuito (Decisão 001)* | ~8–10 | — | — | — | Relatório antes/depois para o adulto | A "ponte do rio" aparece em obras, sem cadeado e sem mensagem de compra para a criança |
| R2b | **Mata Atlântica: Trilha do V-S-N** | 10–16 | Etapa 2 / F3–F4 | V, S, N + palavras CV.CV | Emocional: ler o bilhete triste de um morador e ajudar | Ninho do Tucano | Correio da vila (bilhetes dos moradores) |
| R3 | **Cerrado** | 16–26 | Etapa 3 / F4 | P, T e depois B, D (com intervalo e contraste) | Lógico: seriação; Computacional: achar o "bug" na sequência | Ipê sem Flores (restaurar lendo pares mínimos) | Biblioteca (estante de livrinhos) |
| R4 | **Pantanal** | 26–36 | Etapa 4 / F5 | J, Z, X (ch), CH, NH, LH + frases | Emocional: empatia com os bichos; Financeira: necessidade × desejo | A Cheia (ler instruções para salvar os bichos) | Viveiro de bichos para cuidar |
| R5 | **Caatinga / Sertão** | 36–48 | Etapa 5 / F6 | Contextuais: C/QU, G/GU, R/RR, S/SS, C/Ç + textos decodificáveis | Lógico: dedução a partir de pistas lidas; Financeira: comparar preços (duas lojinhas) | Feira do Cordel (ler e recontar) | Mercado e Coreto (música, cordel) |
| R6 | **Pampa** | 48–58 | Etapa 6 / F6 | Nasalidade: Ã, AM/AN, EM/EN… | Computacional: repetição (laços) em receitas e danças | Ventania que Embaralha (frases) | Moinho e Padaria |
| R7 | **Amazônia** | 58–70 | Etapa 7 / F6–F7 | CVC (R, S, L, nasal finais) + ditongos | Conhecimento de mundo: rios e floresta; Tecnologia: pausas e cuidado com a tela | Rio que Esqueceu as Palavras | Barco-escola e Observatório de bichos |
| R8 | **Serra dos Encontros** (montanhas) | 70–82 | Etapa 8 / F7 | CCV: PR, BR, TR… PL, BL, CL… | Lógico: condição "se… então"; Emocional: persistência | Trem da Serra (fluência em frases) | Estação de trem (liga as regiões) |
| R9 | **Cidade das Letras** (cidade brasileira imaginária) | 82–94 | Etapa 9 / F7–F8 | Concorrências arbitrárias (S/Z/X, CH/X, J/G, H) e morfologia (-inho, -ão, -ou) | Financeira: troco e planejamento; Tecnologia: privacidade explicada | Jornal da Cidade (ler e escrever notícia curta) | Jornal, teatro e praça |
| R10 | **Arquipélago dos Livros** (destino final e pós-jogo) | 94–104+ | Etapa 10 / F7–F8 | Fluência, palavras de alta frequência, compreensão e escrita autoral | Todas, em projetos longos (escrever o "livro da vila") | Festival de Leitura (reconto para a família) | Editora da vila: os livros da criança ficam na biblioteca |

**Regras do mapa:**
- **Regiões futuras visíveis e sem cadeado** (rel. 31 W2): a criança vê o Cerrado no horizonte, ouve a Sofia falar dele e pode "espiar" uma cena, mas ainda não há missões lá. Gera curiosidade, não bloqueio.
- **Voltar é sempre possível e útil.** As regiões antigas viram terreno de **revisão espaçada**: os moradores de lá continuam pedindo ajuda com palavras daquele bloco, misturadas às novas (rel. 07: intercalação).
- **Temporadas** (Carnaval, Festa Junina, Folclore em agosto, Dia das Crianças, fim de ano) aparecem como **festas na vila**, com histórias e itens temáticos. Os itens de temporada **voltam todo ano** e não somem: sem medo de perder (FOMO).

### 3.3 Core loop da sessão (10 a 15 min)

```
 ┌───────────────── SESSÃO (10–15 min; 4–5 anos ≈ 10; 6–8 anos ≈ 15) ─────────────────┐
 │                                                                                    │
 │ 1. CHEGADA (≤ 1 min)     A Sofia recebe no quintal. O avatar aparece.              │
 │                          "Ontem a dona Coruja pediu ajuda…" (gancho plantado)      │
 │                                                                                    │
 │ 2. AQUECER (1–2 min)     Revisão espaçada disfarçada: regar o Jardim da Revisão    │
 │                          (3–5 itens já dominados; acerto alto = começo confiante)  │
 │                                                                                    │
 │ 3. APRENDER (3–4 min)    Lição da Sofia: eu faço → nós fazemos → você faz          │
 │                          (som + boca + letra + imagem; rel. 30 e Decisão 003)      │
 │                                                                                    │
 │ 4. MISSÃO (4–6 min)      A criança ESCOLHE 1 de 2–3 missões geradas (seção 3.7):   │
 │                          ler o pedido do morador → agir no mundo → ver o efeito    │
 │                          (a palavra lida vira coisa: P1 do rel. 08)                │
 │                          Mistura: ~60% alvo atual, ~30% revisão, ~10% transferência│
 │                                                                                    │
 │ 5. CONSTRUIR (1–2 min)   A missão traz material/selo; a criança decide onde pôr    │
 │                          a peça nova na vila (escolha + estratégia leve)           │
 │                                                                                    │
 │ 6. RITUAL DE FIM (≤ 1 min) Sofia recapitula ("hoje você leu PATO e BOLA"),         │
 │                          moedinhas da sessão entram no cofrinho, mapa se ilumina,  │
 │                          curiosidade p/ amanhã, ponte p/ o mundo real.             │
 │                          → tela de "até amanhã" com FIM claro (sem autoplay)       │
 └────────────────────────────────────────────────────────────────────────────────────┘
   Depois do fim: "Tempo livre na vila" (vestir o avatar, decorar, construção livre)
   só se o adulto deixou ligado, com limite configurável e sem missões nem moedas.
```

- A proporção 60/30/10 é **hipótese de produto**. O que manda é o motor adaptativo manter **~85% de acerto** (rel. 20 e 30).
- O **modo TEA** mostra essa trilha fixa no topo, com os passos sempre na mesma ordem (rel. 31 W2).
- A **personalização do avatar fica fora** dos passos 1 a 6, porque não ensina [43][44] e consome atenção.

### 3.4 Os ciclos da jornada (do segundo aos 2 anos)

| Ciclo | Duração | O que fecha o ciclo | Recompensa (camada do rel. 08) | O que **não** fazer |
|---|---|---|---|---|
| Micro (item) | segundos | Ler/ouvir uma palavra | A palavra vira coisa no mundo; frase da Sofia que informa | Pontos por clique; confete longo |
| Missão | 3–6 min | Pedido do morador atendido | Morador agradece; peça para a vila | Moeda anunciada antes |
| Sessão | 10–15 min | Ritual da Sofia | Moedinhas da sessão em bloco; mapa ilumina | Autoplay, "só mais uma" |
| Dia | 1 sessão (no máx. 2, se o adulto permitir) | "Pedido do dia" de um morador | Bilhete do morador para ler amanhã | Sequência de dias (streak) que zera; push para a criança |
| Semana | 4–5 sessões | "Projeto da semana" da vila (ex.: horta) + missão em família | Construção grande; bilhete para a família (rel. 31 #42) | Prazos que expiram |
| Região | 4–12 semanas | Chefe de região (provinha disfarçada) + verificação fora do jogo | Prédio novo na vila; figurinha; título ("Leitor do Cerrado") | Chefe que "derrota" a criança; nova chance sempre |
| Temporada | 4–6 semanas, conforme o calendário | Festa da vila | Itens temáticos (voltam todo ano) | Exclusividade com prazo; FOMO |
| Jornada | ~2 anos | Arquipélago dos Livros: a criança lê e escreve sozinha | "Livro da vila" escrito pela criança | Fim que "tranca" o jogo; o pós-jogo continua |

**Calendário que não zera:** no lugar de streak, o **"Álbum de Dias de Leitura"** ganha um carimbo a cada dia lido. Faltar não apaga nada, e o álbum só cresce (rel. 08 §3.5).

### 3.5 Meta-game: a Vila do Bolota (construção e estratégia leve)

**Fantasia:** a "Nuvem Bagunceira" apagou as letras do mundo (rel. 31 T4). Cada palavra lida devolve uma coisa ao mundo. A vila da criança é o **lugar que ela reconstrói** e para onde os moradores das regiões se mudam.

**Recursos (simples para 4 anos):**
- **Moedinhas** (única moeda): ganhas **só aprendendo** (Decisão 002), em bloco no fim da sessão e nos marcos de domínio. São gastas na lojinha (avatar, decoração, bichinhos).
- **Selos de domínio** (não se gastam, não se compram): cada som dominado dá um selo. Os **prédios grandes** pedem selos, porque representam competência ("a biblioteca precisa dos selos do P, T, B, D"). A construção fica amarrada ao **domínio**, não ao acúmulo de moedas.
- **Materiais de missão** (tábua, pedra, semente): vêm das missões e são usados nos **projetos da vila**. Nunca expiram.

**Mecânicas de construção:**
1. **Ler a planta.** Cada projeto tem uma "planta" com 2 a 5 passos escritos em palavras decodificáveis da fase da criança ("PÕE A PEDRA", "PINTA A PORTA"). Seguir a ordem é **pensamento computacional** (sequência e depuração), e ler é a única forma de construir.
2. **Decidir onde.** A grade da vila é pequena e cresce com as regiões. A criança decide onde fica cada prédio, e alguns prédios "gostam" de ficar perto de outros (a horta perto da água). É estratégia leve, sem resposta errada e com dica da Sofia.
3. **Necessidade × desejo** (Decisão 002): às vezes a vila **precisa** de algo (água para a horta, comida do bichinho) antes do enfeite. A Sofia mostra a escolha **sem julgar**, e nada morre se a criança escolher o enfeite.
4. **Projetos comunitários:** a criança pode doar moedinhas para um projeto da vila (fonte, praça). É educação financeira de partilha.
5. **Construção livre** (fora da sessão): decorar sem metas, como num sandbox. Favorece a criatividade quando não há ordem para "ser criativo" [4].

**Placas e nomes:** todo prédio, item e morador tem nome escrito com **palavras decodificáveis da fase atual**, e o texto é ouvível depois da tentativa. A vila funciona como um **ambiente impresso** que cresce com a criança. É transferência (Decisão 003, princípio 5).

**O que a vila nunca faz:** murchar, sujar, quebrar por ausência ou "ser atacada" [12]; ter timers de construção que se pulam com moeda; comparar a vila com a de outras crianças.

### 3.6 Sistema de avatar

**Criação (no primeiro acesso, com o adulto por perto):**
- **Tudo de representatividade é grátis desde o início** (Decisão 002): tons de pele, tipos de cabelo (cacheado, crespo, liso, tranças), óculos, aparelho auditivo, cadeira de rodas, prótese, roupas básicas.
- A Sofia convida: "faça alguém parecido com você **ou** do jeito que você quiser". Favorece a identificação por semelhança [37] sem obrigar, e lembra que avatares idealizados podem piorar o desempenho [40].
- **Nome:** a criança (ou o adulto) escolhe um apelido. O apelido pode aparecer nas histórias decodificáveis **quando for decodificável na fase** (ex.: "LIA", "TATÁ"). Se não for, aparece com áudio e destaque. É personalização de conteúdo, que tem evidência [31][32]. Privacidade: o apelido fica no perfil, não é público, e a LGPD art. 14 vale (Decisão 002).

**Loja de itens (lojinha):**
- **Preço e aparência visíveis antes**, sem sorteio, sem raridade e sem "edição limitada" (Decisão 002; ECA Digital).
- Nome e etiqueta de preço são **palavras decodificáveis** da fase: comprar também é ler.
- **Os itens não dão poder.** Nenhum item acelera, facilita ou pula conteúdo, e **nenhum item é exclusivo de assinante** [10].
- **Guarda-roupa por região:** os itens de cada bioma só entram na loja **depois** que a criança chega à região. É conhecimento de mundo e marco de progresso, não sorte.
- **Itens de domínio** (não se compram): chapéu de "Mestre do S", lenço do Cerrado. São o reconhecimento simbólico do rel. 08 §3.4.

**Onde o avatar aparece:** na vila, nas missões (é ele quem entrega o pedido lido) e **dentro dos livrinhos personalizados**, onde o avatar é personagem da história [32]. Na **lição da Sofia** (passo 3), o avatar fica discreto, para não competir com a boca, a letra e o som (rel. 09: carga cognitiva).

**Efeito Proteus a favor** [35][36]: acessórios de "leitor" (óculos de leitura, mochila de livros, crachá de "ajudante do Bolota") e animações em que o avatar **lê em voz alta para os moradores**. É hipótese: o avatar-leitor reforça a identidade de leitor. Testar no piloto.

### 3.7 Missões infinitas a partir do banco de palavras decodificáveis

**Objetivo:** gerar missões sem fim que (a) usem **só** correspondências grafema-fonema já ensinadas, mais o alvo atual; (b) misturem a revisão espaçada; (c) mantenham ~85% de acerto; (d) cubram as seis competências; (e) nunca exponham a criança a texto não validado.

**1. Dados de entrada**

| Banco | Campos mínimos | Quem valida |
|---|---|---|
| **Palavras** | grafia; transcrição; lista de CGF; estrutura silábica (CV, CVC, CCV…); etapa mínima (rel. 02); frequência; imagem e áudio; campo semântico (comida, bicho, casa…); bioma/região; marcação "evitar" (palavras sensíveis) | Editorial + fono (rel. 25 e 29) |
| **Pseudopalavras** | fonotáticas, por etapa | Fono (rel. 20) |
| **Frases e textos decodificáveis** | linter de decodificabilidade ≥ 95% (rel. 31 #32) | Editorial + professor |
| **Modelos de missão** | tipo; competência; mecânica (rel. 31 #1–42); slots; restrições; falas da Sofia e dos moradores com variáveis | Design + pedagogia |
| **Modelo da criança** | CGF dominadas / em aprendizagem; fila de revisão (agendador estilo FSRS); erros típicos (rel. 02 §6.3); interesses escolhidos; região atual | Motor adaptativo (rel. 20) |

**2. Tipos de missão (exemplos de modelos)**

| Tipo | Ação de leitura | Competência extra | Exemplo (fase do Cerrado, P/T dominados) |
|---|---|---|---|
| Entrega | Ler o pedido e levar o objeto | — | "O TATU QUER UMA PERA." → levar a pera |
| Resgate | Ler palavras para "limpar" a Nuvem Bagunceira | Emocional (o morador estava triste) | Limpar PATO, TOPO, PIPA |
| Planta da obra | Ler e ordenar os passos | Computacional (sequência, bug) | "1. PÕE A TÁBUA 2. PINTA" |
| Enigma | Ler pistas e deduzir | Lógico (classificação, dedução) | "QUEM TEM PENA E PIA?" |
| Feira | Ler nome e preço; escolher | Financeira | "PIPA: 3 moedinhas · TAPETE: 5" |
| Carta | Ler o bilhete e responder com 1 palavra ou figura | Emocional / escrita | "O PATO TÁ TRISTE. E VOCÊ?" |
| Curiosidade | Ler e ver o fato do bioma | Conhecimento de mundo | "O TATU-BOLA VIVE AQUI." (com áudio de apoio) |
| Verificação | Ler 1–2 pseudopalavras "de mentirinha" | Decodificação pura | "Leia o nome do alienígena: TAPU" |

**3. Algoritmo (gerar e testar com restrições)**

```
gerar_missoes(crianca, n_opcoes=3):
  alvo      = crianca.cgf_em_aprendizagem            # ex.: {P, T}
  dominadas = crianca.cgf_dominadas                  # ex.: {vogais, M, L, F, V, S, N}
  revisao   = agendador.itens_vencidos(crianca)      # FSRS-like, rel. 07
  regiao    = crianca.regiao_atual
  opcoes = []
  para tipo em escolher_tipos_diversos(n_opcoes, competencias_da_semana):
    modelo = sortear_modelo(tipo, regiao, semente=(crianca.id, data, tipo))  # determinístico
    repetir até 50 tentativas:
      preencher slots com palavras do banco tais que:
        R1  cgf(palavra) ⊆ dominadas ∪ alvo                 # decodificável por construção
        R2  ≥ 60% dos itens contêm alvo; ~30% vêm de revisao; ≤ 10% transferência
        R3  sem pares confundíveis juntos antes da fase de contraste (p/b, t/d, b/d)
        R4  palavras do campo semântico do modelo e do bioma
        R5  nenhuma palavra repetida das últimas k sessões, exceto revisão
        R6  dificuldade prevista ∈ [0,80; 0,90] de acerto (modelo da criança)
        R7  ≥ 1 pseudopalavra a cada 3 missões nas etapas 1–5
      se linter(texto_final) ≥ 95% e passa_lista_sensível: aceitar; parar
    se falhar: cair para missão pronta do banco curado (fallback)
    opcoes.append(missao)
  retornar opcoes   # a criança escolhe 1 (autonomia, [45])
```

- **Técnica:** a versão inicial pode ser **gerar e testar com retrocesso** (simples, determinística, auditável). Se o espaço de restrições crescer, migrar para **ASP/resolvedor de restrições** [27]. A seleção por dificuldade segue a PCG guiada pela experiência [26] e o ajuste ao nível da criança [28].
- **Narrativa de cola:** as falas dos moradores vêm de **gramáticas com variáveis** (estilo Tracery) ou de roteiros com ramificação (estilo ink), escritas e revisadas por humanos. O gerador só preenche os slots com palavras do banco.
- **IA generativa:** **não** gera texto que a criança vai ler sem validação. Pode ser usada **offline**, pela equipe editorial, para sugerir novos modelos, que passam pelo linter e por revisão humana antes de entrar no banco (rel. 21 e 25).
- **Semente determinística** (criança + data + tipo): a mesma missão pode ser reproduzida para o professor ver, para depurar erros e para pesquisa.
- **"Infinito" de verdade:** com dezenas de modelos por tipo, centenas de palavras por etapa e a fila de revisão sempre mudando, as combinações não se repetem na prática. O limite real é a **qualidade** dos modelos, e por isso o banco curado de modelos precisa crescer a cada temporada.
- **Controle de qualidade contínuo:** amostra semanal de missões geradas revisada por pedagogo. Missões com acerto médio fora de 70% a 95% em muitas crianças são marcadas para revisão (sinal de modelo ruim).

### 3.8 Navegação sem leitura e anti-perda

1. **Tudo fala:** todo ícone, placa e botão tem áudio ao toque, e a Sofia narra o lugar ao chegar.
2. **Poucos lugares por tela:** no máximo 3 a 5 destinos tocáveis. A **sugestão do dia** brilha e tem um "fio de luz" até ela.
3. **Botão casa sempre visível**, no mesmo canto, em todas as telas. Não há beco sem saída [22].
4. **Mapa em camadas:** vila → região → lugar. Não há rolagem livre infinita para crianças de 4 a 5 anos. Para 6 a 8 anos, o mapa abre mais.
5. **Salvar sempre:** sair no meio guarda tudo, sem mensagem de perda (rel. 08 §3.6).
6. **Nada se perde:** moedas, itens, prédios, bichinhos e plantas são permanentes. Os bichinhos ficam com "saudade" de forma **neutra** (fazem festa quando a criança volta), nunca adoecem nem fogem.
7. **Mesmos gestos sempre:** tocar para escolher; arrastar ⇄ toque-toque (rel. 31).
8. **Modo TEA:** mapa e ordem fixos e previsíveis; avisos antes de qualquer mudança na vila (rel. 12).

### 3.9 Métricas do mundo (o que medir no piloto)

| Dimensão | Métrica | Meta/uso |
|---|---|---|
| Aprendizagem | Domínio por CGF; leitura de palavras e pseudopalavras **fora do jogo** (provinha em papel ou oral) | Principal (rel. 20 e 30) |
| Motivação intrínseca | % de sessões em que a criança **escolhe** missão de leitura no tempo livre; pedido espontâneo para jogar (relato do adulto) | Com e sem lojinha ativa (seção 2.9) |
| Saúde da sessão | % de sessões encerradas pelo ritual; duração média dentro da meta | Não otimizar tempo de tela |
| Avatar e vila | Tempo na personalização (limite); identificação (escala simples com figuras, a validar) | Verificar se não rouba tempo de leitura [43] |
| Gerador | % de missões aceitas pelo linter; acerto médio por modelo; repetição de palavras | Qualidade do PCG |
| Ética | Auditoria de padrões manipulativos com a grade de Radesky et al. [22] antes de cada lançamento | Zero padrões |

---

## 4. Riscos e mitigação

| # | Risco | Por que preocupa | Mitigação |
|---|---|---|---|
| 1 | **Engajamento sem aprendizagem** | O mais envolvente aprendeu mais devagar [17]; o mais bonito não ensinou mais [44] | Domínio e transferência fora do jogo como métrica principal; engajamento só como restrição |
| 2 | **Moedas minam a motivação intrínseca** | Superjustificação (rel. 08 e 30) | Moedas em bloco, sem anúncio prévio; marcos > repetição; teste A/B no piloto (seção 2.9) |
| 3 | **Avatar e vila roubam o tempo de leitura** | Personalização não ensina [43] | Tempo livre só depois do ritual, com limite do adulto; lição sem distração |
| 4 | **Efeito novidade se gasta em semanas** | [20]; rel. 30 (Ronimus) | Novas regiões, temporadas e moradores; o meta-game muda de forma a cada região (bichos, mercado, trem…) |
| 5 | **Pressão comercial sobre a criança** | Prodigy [10]; apps infantis [22] | Nenhuma oferta visível; assinatura não muda poder nem itens; "ponte em obras" neutra no fim do gratuito |
| 6 | **Padrões manipulativos que entram aos poucos** | Comuns e mais frequentes nas famílias de menor escolaridade [22] | Auditoria com a grade de [22] a cada versão; lista vermelha do rel. 08 como critério de aceite |
| 7 | **Mundo aberto confunde crianças de 4 anos** | Carga cognitiva (rel. 09); navegação [49] | Mapa em camadas, poucas opções, fio de luz, botão casa |
| 8 | **Gerador produz conteúdo ruim ou inadequado** | Texto não decodificável ou sensível | Restrições R1–R7, linter ≥ 95%, lista de palavras sensíveis, fallback curado, revisão semanal |
| 9 | **Narrativa longa demais** | Sem ganho de aprendizagem [47] | Narrativa = texto lido pela criança; cenas ≤ 10 s |
| 10 | **Avatar idealizado ou estereotipado** | Desempenho pior com idealizado [40]; estereótipos [41] | Representatividade grátis; convite à semelhança; sem itens de "corpo ideal" |
| 11 | **Isolamento: o app vira atividade solitária** | GraphoGame: sem adulto, g ≈ 0 (rel. 30) | Missão semanal em família; painel do professor; "ler para alguém" como missão |
| 12 | **Pouca evidência com crianças de 4 a 8 anos** sobre avatar e mundo aberto | A maior parte dos estudos de avatar é com adultos | Piloto com medidas próprias; documentar como hipóteses; não fazer alegações de marketing |
| 13 | **Fim da jornada (pós-2 anos) vira vazio** | Criança terminou | Arquipélago dos Livros com produção autoral, biblioteca e modo infinito de revisão; ponte para livros reais |
| 14 | **Desequilíbrio entre as 6 competências** | Desviar tempo da alfabetização (Decisão 003) | Toda missão transversal exige leitura; ≤ 1 missão transversal por sessão |

---

## 5. Ferramentas de código aberto (GitHub, 13/11/2026)

| Repositório | ⭐ | Licença (API) | Uso no FONEMA |
|---|---|---|---|
| phaserjs/phaser | 40.703 | MIT | Motor 2D web/HTML5 para mapa, vila e minijogos |
| mxgmn/WaveFunctionCollapse | 25.516 | NOASSERTION (conferir o arquivo de licença) | Ideia de geração de **cenários decorativos** da vila e das regiões (não do conteúdo pedagógico) |
| dicebear/dicebear | 10.077 | MIT | Referência de avatar SVG em camadas (o FONEMA precisa de arte própria) |
| inkle/ink | 5.013 | MIT | Roteiros com ramificação para as falas de moradores e Sofia |
| open-spaced-repetition/fsrs4anki | 4.134 | MIT | Agendador de revisão espaçada (base para a fila de revisão) |
| victorqribeiro/isocity | 3.263 | MIT | Referência simples de construtor isométrico em JS para a vila |
| ondras/rot.js | 2.729 | BSD-3-Clause | Utilitários de geração de mapas, caminhos e sementes determinísticas |
| galaxykate/tracery | 2.222 | Apache-2.0 | Gramáticas de texto para variar as falas (só com palavras do banco) |
| rive-app/rive-react | 1.189 | MIT | Animação vetorial interativa do avatar e dos moradores |
| AlexeyBond/godot-constraint-solving | 466 | MIT | Exemplo de WFC + resolvedor de restrições (caso use Godot) |

---

## 6. Lacunas e próximos passos

1. **Piloto com crianças de 4 a 8 anos**, com três braços curtos (a definir com a frente de avaliação): (a) trilha sem vila e sem lojinha; (b) com vila; (c) com vila e lojinha. Medidas: domínio, transferência fora do jogo, escolha livre de leitura e encerramento tranquilo.
2. **Validar a escala de identificação com o avatar** por figuras, adequada a crianças que ainda não leem.
3. **Conferir no texto completo** os detalhes marcados neste relatório (Cordova & Lepper, Kucirkova, Walkington, Lomas, Bar-El, Lewis 2021, Li 2014, Hiniker 2018).
4. **Revisão jurídica** da lojinha e do avatar diante do ECA Digital, da Resolução CONANDA 163/2014 e das regras das lojas (rel. 05).
5. **Protótipo do gerador** com o banco do rel. 25 para medir a taxa de aceite do linter e a diversidade real das missões.

---

## 7. Tabela de referências

Legenda: **[V]** registro conferido nesta sessão; **[NV]** não verificado on-line. Tipos: MA = meta-análise; RS = revisão sistemática; REV = revisão narrativa/teórica; ECR = ensaio randomizado; EXP = experimento; QUAL = estudo qualitativo/caso; TRANS = estudo transversal; MET = método/técnica; LIV = livro; REL = relatório; WEB = página web.

| # | Autor(es) | Ano | Título (abreviado) | Tipo | DOI / ID / URL | V/NV | O que aproveitar |
|---|---|---|---|---|---|---|---|
| 1 | Nebel, Schneider, Rey | 2016 | Mining learning and crafting scientific experiments: Minecraft in education and research | REV | ERIC EJ1097278 (Educ. Technol. & Society) | V | Usos e limites do Minecraft |
| 2 | Alawajee, Delafield-Butt | 2021 | Minecraft in education benefits learning and social engagement | RS | 10.4018/ijgbl.2021100102 | V | 42 artigos; motivação, linguagem, social; uso guiado |
| 3 | Bar-El, Ringland | 2020 | Crafting game-based learning: lessons for Minecraft Education Edition | QUAL | 10.1145/3402942.3409788 | V | Análise das aulas prontas (conferir achados) |
| 4 | Blanco-Herrera, Gentile, Rokkum | 2019 | Video games can increase creativity, but with caveats | ECR | 10.1080/10400419.2019.1594524 | V | Minecraft livre > "seja criativo" |
| 5 | Dezuani, Macri (QUT) | 2020 | Minecraft: Education Edition for educational impact | REL | via education.minecraft.net (blog) | NV | Relatório do fabricante; amostra pequena |
| 6 | Han, Liu, Gao | 2023 | Learners in the Metaverse: systematic review on Roblox in learning | RS | 10.3390/educsci13030296 | V | 40 estudos; benefícios + cyberbullying/segurança |
| 7 | Lewis, Trojovsky, Jameson | 2021 | New social horizons: anxiety, isolation, and Animal Crossing during COVID-19 | Empírico | 10.3389/frvir.2021.627350 | V | Conexão social (conferir medidas) |
| 8 | Hourdequin | 2020 | Social learning and literacy affordances in Animal Crossing: New Horizons | REV | 10.55853/llp_v2pg9 | V | Letramento e aprendizagem social no jogo |
| 9 | Marsh, Plowman, Yamada-Rice, Bishop, Lahmar, Scott | 2018 | Play and creativity in young children's use of apps | Misto | 10.1111/bjet.12622 | V | Design de app favorece ou inibe o brincar (0–5 anos) |
| 10 | Fairplay (CCFC) et al. | 2021 | Complaint to FTC about Prodigy Math Game | WEB | https://fairplayforkids.org/feb-19-2021-advocates-to-ftc-prodigy-math-game-preys-on-kids-and-families/ | V | Alegações: pressão de assinatura sobre a criança |
| 11 | Prodigy Education | s.d. | Research (página de evidências) | WEB | https://www.prodigygame.com/research | V | Estudos próprios, correlacionais |
| 12 | Lewis, Wardrip-Fruin, Whitehead | 2012 | Motivational game design patterns of 'ville games | REV | 10.1145/2282338.2282373 | V | Padrões de retenção a **não** copiar |
| 13 | Ryan, Rigby, Przybylski | 2006 | The motivational pull of video games: SDT approach | EXP | 10.1007/s11031-006-9051-8 | V | Competência, autonomia, pertencimento |
| 14 | Przybylski, Rigby, Ryan | 2010 | A motivational model of video game engagement | REV | 10.1037/a0019440 | V | Engajamento saudável × obsessivo |
| 15 | Chen | 2007 | Flow in games (and everything else) | REV | 10.1145/1232743.1232769 | V | Canal de flow individual; escolhas de dificuldade |
| 16 | Hunicke | 2005 | The case for dynamic difficulty adjustment in games | MET | 10.1145/1178477.1178573 | V | Ajuste dinâmico de dificuldade |
| 17 | Lomas, Patel, Forlizzi, Koedinger | 2013 | Optimizing challenge in an educational game using large-scale design experiments | EXP | 10.1145/2470654.2470668 | V | Mais envolvente = aprendizagem mais lenta (TLDR; conferir) |
| 18 | Deterding | 2015 | The lens of intrinsic skill atoms | MET | 10.1080/07370024.2014.993471 | V | Core loop a partir da habilidade-alvo |
| 19 | Lieberoth | 2014 | Shallow gamification | EXP | 10.1177/1555412014559978 | V | Enquadrar como jogo já ↑ interesse (raso) |
| 20 | Hanus, Fox | 2015 | Assessing the effects of gamification in the classroom: longitudinal study | QE longitudinal | 10.1016/j.compedu.2014.08.019 | V | Motivação ↓ ao longo do tempo com gamificação |
| 21 | Sailer, Hense, Mayr, Mandl | 2017 | How gamification motivates: specific game design elements | ECR | 10.1016/j.chb.2016.12.033 | V | Avatar/história → pertencimento; gráficos → competência |
| 22 | Radesky, Hiniker, McLaren, Akgun, Schaller, Weeks, Campbell, Gearhardt | 2022 | Prevalence and characteristics of manipulative design in mobile apps used by children | TRANS | 10.1001/jamanetworkopen.2022.17641 (PMID 35713902) | V | Grade de padrões manipulativos; desigualdade por escolaridade |
| 23 | Hiniker, Heung, Hong, Kientz | 2018 | Coco's videos: video-player design features and children's media use | EXP | 10.1145/3173574.3173828 | V | Fim embutido ajuda a autorregulação (conferir) |
| 24 | Togelius, Yannakakis, Stanley, Browne | 2011 | Search-based procedural content generation: taxonomy and survey | REV | 10.1109/tciaig.2011.2148116 | V | Taxonomia de PCG |
| 25 | Shaker, Togelius, Nelson | 2016 | Procedural content generation in games | LIV | 10.1007/978-3-319-42716-4 | V | Manual de técnicas de PCG |
| 26 | Yannakakis, Togelius | 2011 | Experience-driven procedural content generation | MET | 10.1109/t-affc.2011.6 | V | Gerar para uma experiência-alvo |
| 27 | Smith, Mateas | 2011 | Answer set programming for PCG: design space approach | MET | 10.1109/tciaig.2011.2158545 | V | Restrições declarativas (decodificabilidade por construção) |
| 28 | Hooshyar, Yousefi, Wang, Lim | 2018 | A data-driven PCG approach for educational games | EXP | 10.1111/jcal.12280 | V | PCG ajustada à criança ↑ ganho em leitura inicial |
| 29 | Andersen, Gulwani, Popović | 2013 | A trace-based framework for analyzing and synthesizing educational progressions | MET | 10.1145/2470654.2470764 | V | Ordenar dificuldade automaticamente |
| 30 | Butler, Andersen, Smith, Gulwani, Popović | 2015 | Automatic game progression design through analysis of solution features | MET | 10.1145/2702123.2702330 | V | Progressão por combinação de conceitos |
| 31 | Cordova, Lepper | 1996 | Intrinsic motivation and the process of learning: contextualization, personalization, and choice | EXP | 10.1037/0022-0663.88.4.715 (ERIC EJ540338) | V | Personalização + escolha ↑ motivação e engajamento |
| 32 | Kucirkova, Messer, Sheehy | 2014 | Reading personalized books with preschool children enhances their word acquisition | EXP | 10.1177/0142723714534221 (ERIC EJ1078710) | V | Personalização ↑ aquisição de palavras (3–4 anos) |
| 33 | Walkington | 2013 | Using adaptive learning technologies to personalize instruction to student interests | EXP | 10.1037/a0031882 | V | Personalização por interesse; mais efeito em quem tem dificuldade (conferir) |
| 34 | Reber, Canning, Harackiewicz | 2018 | Personalized education to increase interest | REV | 10.1177/0963721418793140 | V | 3 formas de personalizar; ajuda quem tem pouco interesse |
| 35 | Yee, Bailenson | 2007 | The Proteus effect | EXP | 10.1111/j.1468-2958.2007.00299.x | V | Comportamento segue o avatar |
| 36 | Ratan, Beyea, Li, Graciano | 2019 | Avatar characteristics induce behavioral conformity: meta-analysis of the Proteus effect | MA | 10.1080/15213269.2019.1623698 | V | 46 estudos; efeito 0,22–0,26 |
| 37 | Birk, Atkins, Bowey, Mandryk | 2016 | Fostering intrinsic motivation through avatar identification | EXP | 10.1145/2858036.2858062 | V | Identificação → autonomia, imersão, esforço, prazer |
| 38 | Birk, Mandryk | 2018 | Combating attrition in digital self-improvement programs using avatar customization | EXP | 10.1145/3173574.3174234 | V | Personalizar reduz abandono (adultos; conferir) |
| 39 | Kao, Harrell | 2018 | The effects of badges and avatar identification on play and making in educational games | EXP | 10.1145/3173574.3174174 | V | Identificação ↑ motivação, autoeficácia, qualidade |
| 40 | Koulouris, Jeffery, Best, O'Neill, Lutteroth | 2020 | Me vs. Super(wo)man: customization and identification in a VR exergame | EXP | 10.1145/3313831.3376661 | V | Idealizado ↓ desempenho; realista melhor |
| 41 | Li, Lwin, Jung | 2014 | Wii, myself, and size: Proteus effect and stereotype threat in overweight children | EXP | 10.1089/g4h.2013.0081 | V | Avatar e estereótipo em crianças de 9–12 anos (conferir) |
| 42 | Bailey, Wise, Bolls | 2009 | How avatar customizability affects children's arousal and subjective presence (advergames) | EXP | 10.1089/cpb.2008.0292 | V | Avatar ↑ presença/excitação; amplifica persuasão |
| 43 | Javora, Děchtěrenko, Tetourová, Volná, Brom | 2021 | Customization in educational computer games and its effect on learning | ECR | 10.1111/jcal.12576 (ERIC EJ1307108) | V | Personalização cosmética: nulo em motivação e aprendizagem |
| 44 | Javora, Hannemann, Stárková, Volná, Brom | 2018 | Children like it more but don't learn more: esthetic visual design | ECR | 10.1111/bjet.12701 | V | Preferência d > 0,86; compreensão d = −0,59 |
| 45 | Patall, Cooper, Robinson | 2008 | The effects of choice on intrinsic motivation: meta-analysis | MA | 10.1037/0033-2909.134.2.270 (ERIC EJ787695) | V | 41 estudos; 2–4 escolhas; maior em crianças |
| 46 | Schneider, Nebel, Beege, Rey | 2018 | The autonomy-enhancing effects of choice on cognitive load, motivation and learning | ECR | 10.1016/j.learninstruc.2018.06.006 | V | Escolha (até fictícia) ↑ retenção e transferência |
| 47 | Adams, Mayer, MacNamara, Koenig, Wainess | 2012 | Narrative games for learning: testing the discovery and narrative hypotheses | ECR | 10.1037/a0025595 | V | Narrativa não superior em < 2 h |
| 48 | Naul, Liu | 2019 | Why story matters: a review of narrative in serious games | REV | 10.1177/0735633119859904 | V | Narrativa: engajamento sim, aprendizagem mista |
| 49 | Hourcade | 2008 | Interaction design and children | REV | 10.1561/1100000006 | V | Princípios de interação para crianças |
| 50 | Sweetser, Wyeth | 2005 | GameFlow: a model for evaluating player enjoyment | MET | 10.1145/1077246.1077253 | V | Critérios de flow para avaliar o mundo |

**Observação sobre autoria:** as listas completas de autores foram conferidas no Crossref (ou no PubMed, linha 22) nesta sessão. A exceção são as linhas 1, 5, 10 e 11, que têm autoria institucional ou ERIC.

**Fontes internas usadas:** Decisões 001, 002 e 003; rels. 02 (§5.5 e §6.3), 05, 07, 08 (§3), 09, 12, 20, 21, 24, 25, 29, 30 e 31 (W2, §5 e T1–T5).
