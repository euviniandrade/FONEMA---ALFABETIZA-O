# 38 — Design de economia virtual educativa: fichas, moedinhas, lojinha e cofrinho

> Frente de pesquisa 38. Projeto FONEMA (alfabetização fônica em pt-BR, 4 a 8 anos, com a Sofia).
> Data: 13/11/2026. Complementa a **Decisão 002** (economia de moedinhas, avatar e educação financeira) e o **rel. 08** (dopamina, superjustificação, Deci et al. 1999, Lepper 1973, Cameron & Pierce 1994, Radesky 2022 em linhas gerais). O que já está nesses documentos **não é repetido** aqui. Este relatório traz a evidência que faltava e transforma tudo numa **especificação operacional da economia**.

**Nota de método.** As buscas foram feitas por `curl` no **Crossref** (DOI, autores, ano, periódico e resumo), no **OpenAlex** e no **Semantic Scholar** (só para obter resumos), no **PubMed E-utilities** e no **ERIC (IES)**, e com WebSearch (modo standard, 11 buscas) para fontes sem DOI: FTC, ECA Digital, avaliações de programas e livros. Quando uma referência está marcada como **[V]**, quer dizer que o registro foi conferido nesta sessão (título, primeiro autor e ano batem com o DOI, PMID, ID do ERIC ou página oficial). Já **[NV]** marca uma obra que não foi conferida on-line, como livros ou documentos normativos que não puderam ser abertos. Os números citados no texto foram copiados de resumos lidos nesta sessão. Quando o detalhe não estava no resumo, o texto diz **(conferir no texto completo)**. **Nada aqui é parecer jurídico.**

---

## 1. Resumo executivo

1. **A economia de fichas funciona, e é exatamente isso que o FONEMA está construindo.** Numa meta-análise de estudos de caso único em sala de aula, as fichas tiveram efeito médio **ES = 0,82** (28 estudos, 90 participantes). O efeito foi um pouco maior dos **6 aos 15 anos** que dos **3 aos 5**, e maior em metas **comportamentais** que em metas **acadêmicas** [4]. Em TEA/DI e TDAH, as revisões e meta-análises sustentam o reforço sistemático [3][6]. **O ponto fraco é conhecido desde 1972: os ganhos podem não se generalizar quando as fichas param** [1]. Logo, a economia do FONEMA precisa de um **plano de retirada gradual** e de laços com recompensas naturais da leitura.
2. **Uma economia de fichas tem seis componentes, e só 19% dos estudos descrevem todos eles** [5]. São eles: o comportamento-alvo, a ficha, os reforçadores de troca e três esquemas (quando se ganha, quando se troca e quanto custa). A seção 4 especifica os seis para o FONEMA, sem lacunas.
3. **A gamificação ajuda na aprendizagem, mas nenhum elemento é mágico.** Bai, Hew & Huang encontraram **g = 0,504** em 30 intervenções, **sem diferença por tipo de elemento** [9]. Pontos, níveis e placares aumentaram a **quantidade** de produção, mas **não** a motivação intrínseca [12]. Badges, placares e gráficos de desempenho satisfazem a necessidade de **competência**, e avatar e história satisfazem o **vínculo** [11]. Hanus & Fox (badges + placar, universitários, 16 semanas) viram **queda** de motivação e notas mais baixas, efeito mediado pela motivação intrínseca [10]. **Conclusão: a moeda deve ser um sinal de competência, e não um placar comparativo.**
4. **Incentivo e motivação intrínseca não são inimigos, mas medem coisas diferentes.** Em 183 estudos (N = 212.468), os incentivos predisseram melhor a **quantidade** e a motivação intrínseca predisse melhor a **qualidade**. Houve "crowding out" quando o incentivo era atrelado diretamente ao desempenho [15]. Em leitura, crianças do 3º ano que ganharam **livro** como prêmio persistiram mais na leitura seguinte que as que ganharam **fichas** [17]. **Recompensa "próxima" da leitura (livros, estante, figurinhas que falam) prejudica menos que ficha genérica.**
5. **Em jogo educativo, a recompensa externa não prejudicou crianças quando o ambiente tinha muito feedback.** Em alunos do 5º ano, recompensas externas não minaram a motivação, mas também não aumentaram o engajamento disciplinar [16]. Pagar crianças por ler livros, notas ou provas teve efeito estatisticamente nulo em mais de 200 escolas [18]. **Moeda não ensina; quem ensina é o design da atividade.**
6. **Economias virtuais obedecem às leis da economia real, e "o código é a lei".** Num mundo virtual comercial, a produção, o consumo e a oferta de moeda seguiram padrões macroeconômicos reais. Um servidor novo com as mesmas regras reproduziu os mesmos agregados [22]. Inflação, acúmulo e "farming" são **consequências das regras** de fontes e sumidouros [23]. Por isso a economia precisa de engenharia e métricas desde o primeiro dia.
7. **Apps infantis estão cheios de padrões manipulativos, e eles se concentram nas famílias mais pobres.** Em apps usados por crianças de 3 a 5 anos, 45% tinham "iscas atraentes", 25% tinham pressão de relação parassocial e 17% tinham pressão de tempo. A pressão de compra foi maior em famílias de menor renda e escolaridade [26]. A FTC obrigou a Epic (Fortnite) a pagar **US$ 245 milhões** por dark patterns de compra, além de **US$ 275 milhões** por violar a COPPA [28]. Loot boxes se associam a jogo problemático (r = 0,27 em 13 publicações) [31]. O ECA Digital proíbe loot boxes (art. 20) [32].
8. **A educação financeira para crianças melhora o conhecimento. O efeito sobre o comportamento é menor e incerto.** Há efeito em 126 avaliações, menor em populações de baixa renda, e maior no "momento ensinável" [33]. Em 76 ECRs com mais de 160 mil participantes, houve efeitos sobre conhecimento e comportamentos [34]. No Brasil, um ECR em 892 escolas de ensino médio teve **+0,25 DP** em proficiência, mas também **mais uso de crédito caro** [35]. O My Classroom Economy (economia de sala de aula, alunos do 3º ao 5º ano) teve ganhos de cerca de **0,1 DP** em 10 semanas [38]. A **aprendizagem experiencial** é o caminho mais promissor para crianças [36]. **Uma lojinha com cofrinho é aprendizagem experiencial no "momento ensinável".**
9. **Esperar depende de confiar.** Crianças de 4 anos e meio esperaram muito mais quando o ambiente se mostrou **confiável** [43]. A ligação do "teste do marshmallow" com o futuro tem metade do tamanho original e perde dois terços com controles de família [42]. **Regra de ouro: preço, meta e bônus do cofrinho nunca mudam depois de prometidos.**
10. **A especificação (seção 4)** traz uma moeda única, ganha só por aprender, com valores pequenos e contáveis. Os preços são fixos e não sobem para itens existentes. A curva de 2 anos acompanha a capacidade de esperar e a numeracia da criança. O cofrinho tem meta rotulada e bônus de paciência fixo. Há teto diário de ganho, rendimento decrescente para "farming", desfazer compra em 24 h, nenhuma aleatoriedade, nenhuma escassez artificial, nenhuma troca entre crianças, e um **painel de saúde da economia** com sentinela de superjustificação.

---

## 2. Achados

### 2.1 Economia de fichas (token economy): o que a análise do comportamento já sabe

- **Revisão clássica [1] [V].** Kazdin & Bootzin (1972) revisaram programas de fichas em hospitais psiquiátricos, deficiência intelectual, sala de aula, delinquência e autismo. Eles concluíram que as fichas **funcionam enquanto estão em operação**, mas que a **generalização e a resistência à extinção** são o problema central. Também listaram obstáculos: treino de quem aplica, resistência, burla das contingências e não resposta. Propuseram procedimentos para manter o desempenho quando o reforço é retirado.
- **Dez anos depois [2] [V].** Kazdin (1982) atualizou o balanço e documentou a expansão para escolas e casas, além das limitações na manutenção (conferir no texto completo).
- **Revisão recente [7] [V, pela página da revista].** Doll, McLaughlin & Barretto (2013) atualizaram a revisão das fichas em vários contextos, porque não havia um panorama novo desde Kazdin. O texto completo traz exemplos de componentes e de retirada gradual (conferir no texto completo).
- **TEA e deficiência intelectual [3] [V].** Matson & Boisjoli (2009): as fichas "imitam sistemas naturais de reforço, como o dinheiro" e continuam promissoras para crianças com DI e/ou autismo. Esse é um bom argumento para o FONEMA: a moedinha é ao mesmo tempo ferramenta de reforço e **modelo de dinheiro**.
- **TDAH [6] [V].** Fabiano et al. (2009) reuniram 174 estudos de tratamento comportamental, com efeitos de 0,83 entre grupos e 0,70 em pré-pós. O reforço sistemático é uma peça central desses tratamentos (o rel. 12 já cita esse estudo; aqui ele entra só para dimensionar o efeito).
- **Sala de aula, meta-análise de caso único [4] [V].** Soares et al. (2016): ES = 0,82 (IC 0,77–0,88), ou 0,85 nos estudos de melhor qualidade. Foi um pouco mais eficaz dos 6 aos 15 anos que dos 3 aos 5, e com metas comportamentais que com metas acadêmicas. Não houve diferença entre ensino regular e especial, nem com o uso de "custo de resposta" (perder fichas). **Implicação: perder moedas não acrescenta eficácia. O FONEMA mantém "nunca perder moedas" (Decisão 002) sem custo pedagógico.**
- **Os seis componentes [5] [V].** Ivy et al. (2017) definem a economia de fichas por seis componentes: (1) resposta-alvo, (2) ficha como reforçador condicionado, (3) reforçadores de troca (*backup*), (4) esquema de produção de fichas, (5) esquema de oportunidade de troca e (6) esquema de troca (preço). Só **19%** dos 96 artigos descreviam os seis de forma completa e replicável.
- **Fichas como economia comportamental [8][8b] [V].** Hackenberg (2009; 2018) mostra que os sistemas de fichas se analisam em termos de **preço unitário, custo e benefício**, num sistema de "moeda comum" parecido com o dinheiro humano, e que a pesquisa aplicada pode orientar a básica. **Implicação:** preços e taxas de ganho são variáveis de design mensuráveis, e não detalhes estéticos.

### 2.2 Gamificação por elemento: pontos, badges, placares e avatares

- **Meta-análise de desempenho [9] [V].** Bai, Hew & Huang (2020): 30 intervenções, 3.202 participantes, **g = 0,504** (IC 0,284–0,723). Pela análise de moderadores, **não houve diferença significativa por tipo de elemento, número de elementos nem rigor do desenho** (informação obtida por busca secundária; conferir no texto completo). O rel. 30 já traz Sailer & Homner (2020); os dois convergem num efeito positivo modesto.
- **Elementos específicos e necessidades psicológicas [11] [V].** Sailer et al. (2017), num ECR: badges, placares e gráficos de desempenho aumentaram a satisfação da **competência** e o sentido da tarefa. Avatares, histórias e colegas de equipe aumentaram o **vínculo**. Nenhum elemento aumentou a sensação de **autonomia**. **Implicação:** no FONEMA, a autonomia tem de vir de *escolhas reais* (o que comprar, para que poupar, qual história ler), e não dos pontos.
- **Pontos, níveis e placares [12] [V].** Mekler et al. (2017), num experimento 2×4 com uma tarefa de anotar imagens: os elementos aumentaram a **quantidade** de tags, mas **não** a motivação intrínseca nem a competência. Funcionaram como incentivo extrínseco "de volume".
- **Efeito negativo [10] [V].** Hanus & Fox (2015), num curso universitário com placar e badges (71 alunos, quatro medições em 16 semanas): o grupo gamificado ficou **menos motivado, menos satisfeito e com menos autonomia**, e teve nota final menor, efeito mediado pela queda da motivação intrínseca. Os autores atribuem o resultado à literatura de "recompensa que mina interesse" e à **comparação social do placar**. **Implicação: nada de ranking entre crianças.**
- **Badges dependem de quem aprende [13] [V].** Abramovich et al. (2013), num tutor inteligente de matemática: os padrões de conquista de badges e os efeitos motivacionais **variaram com o conhecimento prévio**, e tipos diferentes de badge afetaram alunos diferentes. **Implicação:** a criança com dificuldade (dislexia, TDAH) precisa ganhar moedas por **progresso pessoal**, e não por velocidade ou acerto absoluto.

### 2.3 Superjustificação em contextos digitais e recompensa por desempenho × participação

- **O debate continua [14][14b] [V].** Eisenberger & Cameron (1996) e Cameron, Banko & Pierce (2001) defendem que os efeitos negativos das recompensas são **limitados e previsíveis**. Segundo eles, ocorrem sobretudo com recompensas tangíveis e esperadas, dadas só por participar, e recompensas contingentes a **atingir um padrão de desempenho** podem manter ou elevar o interesse (conferir no texto completo). Deci et al. (rel. 08) discordam. **Leitura prática:** as duas escolas concordam que *recompensa por simplesmente fazer* (clicar, tempo de uso) é a pior opção.
- **Meta-análise de 40 anos [15] [V].** Cerasoli, Nicklin & Ford (2014): k = 183, N = 212.468. A motivação intrínseca prevê o desempenho (ρ = 0,21–0,45) com ou sem incentivo. Os incentivos preveem melhor a **quantidade** e a motivação intrínseca prevê melhor a **qualidade**. Quando o incentivo é **diretamente atrelado ao desempenho**, a motivação intrínseca pesa menos ("crowding out"); quando é **indireto**, pesa mais. **Implicação:** a moeda deve ser **indireta e informativa** ("você dominou o /s/!"), não um pagamento por resposta certa.
- **Jogo educativo infantil [16] [V].** Filsecker & Hickey (2014), 5º ano (n = 50 com recompensa e n = 56 sem), num jogo rico em feedback: a recompensa externa **não minou** a motivação, nem perto nem longe da tarefa, **mas também não aumentou** o engajamento disciplinar. Os autores sugerem que o feedback rico neutraliza o dano previsto (resumo obtido por busca secundária).
- **Recompensa próxima da leitura [17] [V].** Marinak & Gambrell (2008), 3º ano: as crianças que ganharam **um livro** e as que **não ganharam nada** se engajaram mais na leitura seguinte que as que ganharam **fichas**. A **proximidade** entre recompensa e comportamento foi o fator decisivo. **Implicação direta:** os itens de maior valor simbólico na lojinha devem estar *ligados à leitura* (estante, marcadores, figurinhas que falam, cenários de história), e os livros novos se desbloqueiam por **domínio**, nunca por moeda.
- **Pagar por insumos ou por resultados [18] [V].** Fryer (2011) testou incentivos em mais de 200 escolas: em Dallas, pagamento por livro lido (insumo); em Nova York, por provas; em Chicago, por notas (resultado). O efeito foi **estatisticamente zero** nas três cidades, e o único efeito significativo foi entre falantes de inglês em Dallas (pagamento por insumo). **Implicação:** o dinheiro, mesmo real, não move a aprendizagem sozinho. Quando há algum sinal, ele está no **insumo controlável pela criança** (ler, praticar), e não no resultado.

### 2.4 Design de economias de jogo: fontes, sumidouros, inflação e progressão

- **Vocabulário de projeto [19] [NV, livro; conceitos conferidos em trechos oficiais].** Adams & Dormans (2012) descrevem a "economia interna" de um jogo como **recursos**, **fontes** (criam recurso "do nada"), **sumidouros/drenos** (removem o recurso de vez), **conversores** (transformam um recurso em outro) e **trocadores** (movem recursos entre entidades por uma regra de câmbio). O diagrama *Machinations* permite simular o fluxo antes de implementar.
- **Macroeconomia virtual [22] [V].** Castronova et al. (2009), com dados de transações de um mundo virtual comercial: a produção, o consumo e a oferta de moeda seguiram padrões macroeconômicos reais. Um servidor novo com as mesmas regras convergiu para agregados **quase idênticos**, ou seja, "*code is law*": o resultado é explicado pelas regras do design.
- **O que faz alguém querer um item virtual [20] [V].** Lehdonvirta (2009) classifica os atributos que levam à compra de itens virtuais em funcionais, hedônicos (estética) e sociais (status, distinção) (conferir no texto completo). **Implicação:** no FONEMA, os itens devem ser **hedônicos e expressivos** (vestir, decorar, tocar um som). Nunca **funcionais** (vantagem na aprendizagem) e nunca de **status comparativo**, como raridade ou "só eu tenho".
- **Economias virtuais como disciplina [21] [NV, livro].** Lehdonvirta & Castronova (2014), *Virtual Economies: Design and Analysis* (MIT Press), trazem o vocabulário de oferta de moeda, inflação, sumidouros e controle de preços em economias virtuais.
- **Lições práticas consolidadas (síntese do pesquisador sobre [19][21][22]):** (a) toda fonte nova precisa de um sumidouro correspondente; (b) a inflação em jogos não vem de "preços que sobem sozinhos", mas do **acúmulo de moeda sem nada desejável onde gastar**, ou de fontes repetíveis exploradas ("farming"); (c) os preços de itens existentes devem ser **fixos**, e a progressão se faz **adicionando itens novos** em faixas de preço maiores; (d) as métricas certas são as de fluxo (entrada/saída por semana) e de estoque (saldo mediano em semanas de renda).

### 2.5 Riscos: dark patterns, loot boxes, Epic e ECA Digital

- **Prevalência em apps da primeira infância [26] [V].** Radesky et al. (2022): 160 crianças de 3 a 5 anos, os 3 apps mais usados de cada uma. Quatro tipologias de manipulação apareceram nos apps com personagens: **pressão de relação parassocial** em 24,8% (jogo) e 18,8% (compra); **pressão de tempo** em 17,3% e 10,5%; **restrições de navegação** em 45,9% e 36,8%; e **iscas atraentes** em 45,1% e 45,9%. Os índices foram **maiores em famílias de menor escolaridade** (mediana 3,7 vs 3,0; p = 0,02) e a **pressão de compra foi maior nas de menor renda**. (O rel. 08 citou o estudo de forma geral; os números são novos aqui.) **Implicação para o FONEMA, cujo público é majoritariamente da escola pública: o risco é maior justamente no nosso público.**
- **Quadro de análise [27] [V].** Fitton & Read (2019) propõem um framework para avaliar criticamente o "design escuro" em apps *free-to-play* usados por crianças (conferir no texto completo). Ele serve de checklist de auditoria.
- **FTC v. Epic Games [28] [V].** A ordem foi finalizada em março de 2023. Foram **US$ 245 milhões** em reembolsos porque a Epic usou *dark patterns* para induzir compras não desejadas e bloqueou contas de quem contestou cobranças. Houve ainda **US$ 275 milhões** de multa por violar a COPPA (privacidade infantil). A ordem proíbe cobrar sem consentimento afirmativo. **Lições aplicáveis mesmo sem dinheiro real:** confirmar a compra em duas etapas, poder desfazer, botões de compra que não fiquem colados em botões de jogo, e nenhuma punição por contestar.
- **Loot boxes e jogo de azar [29][30][31] [V].** Zendle & Cairns (2018), 7.422 jogadores: o gasto em loot boxes se associou à gravidade do jogo problemático (η² = 0,054), uma associação mais forte que a de outras compras dentro do jogo (η² = 0,004). Drummond & Sauer (2018) argumentam que as loot boxes são "psicologicamente parecidas com jogo de azar" (conferir no texto completo). Spicer et al. (2021/2022), revisão sistemática: 12 de 13 publicações mostraram relação positiva com jogo problemático (**r = 0,27**) e com uso problemático de games (r = 0,40).
- **ECA Digital [32] [V por fontes secundárias; texto literal NV].** A Lei 15.211/2025 está em vigor desde 17/03/2026 e foi regulamentada pelo Decreto 12.880/2026. O **art. 20** proíbe "caixas de recompensa" em jogos direcionados a crianças e adolescentes ou de acesso provável por eles. O **art. 2º, IV** as define como a aquisição, **mediante pagamento**, de itens ou vantagens sem conhecimento prévio do conteúdo ou garantia de utilidade. Uma nota técnica do MJSP pediu à ANPD que monitore jogos com caixas de recompensa. **Nota:** como as moedinhas do FONEMA não são compradas com dinheiro, um baú aleatório talvez nem caísse na definição legal estrita. **Mesmo assim, a Decisão 002 proíbe qualquer aleatoriedade na recompensa**, por coerência com a evidência ([29]–[31], rel. 08) e por prudência regulatória (conferir com advogado).
- **Lojas de aplicativos.** As regras da Apple (Kids Category, diretriz 1.3; compras e links atrás de porteira parental) e do Google Play (Families Policy) já estão no rel. 05 [F41][F42]. **Implicação específica desta frente:** como não existe compra com dinheiro, a lojinha **não aciona** as regras de compra no app. Mesmo assim, qualquer link para a área dos pais fica atrás de porteira parental.

### 2.6 Educação financeira infantil e simulações econômicas

- **Meta-análise ampla [33] [V].** Kaiser & Menkhoff (2017), 126 avaliações: a educação financeira afeta o **comportamento** e, mais ainda, o **conhecimento**. O efeito é **menor para clientes de baixa renda** e em países de renda baixa e média-baixa. O sucesso depende da **intensidade** e de chegar no **"momento ensinável"**.
- **Só ECRs [34] [V].** Kaiser, Lusardi, Menkhoff & Urban (2022), *J. Financ. Econ.* 145(2): 76 ECRs com mais de 160 mil participantes, com efeitos em conhecimento e em comportamentos posteriores, robustos a viés de publicação (o tamanho exato do efeito deve ser conferido no texto completo).
- **Brasil [35] [V].** Bruhn et al. (2016), ECR no ensino médio em 6 estados, 892 escolas e cerca de 25 mil alunos: **+0,25 DP** de proficiência financeira, mais aprovação, mais poupança e orçamento, efeito transbordando para os pais, **mas também mais uso de crédito caro para consumo**. **Lição: ensinar a gastar sem ensinar a esperar pode sair pela culatra. O FONEMA começa por poupar e escolher, e não por "comprar".**
- **Revisão infantojuvenil [36] [V].** Amagir et al. (2018): os programas escolares melhoram conhecimento e atitudes, mas os efeitos sobre o **comportamento real** são escassos. A **aprendizagem experiencial** é o método mais promissor no ensino fundamental.
- **4º e 5º ano [37] [V].** Batty, Collins & Odders-White (2015), experimento: mesmo um programa breve gerou **conhecimento que persistiu um ano** e atitudes mais positivas, e as crianças **pareciam mais propensas a poupar**.
- **Escola + conta de poupança [39] [V].** Sherraden et al. (2011), programa *I Can Save*: educação financeira na escola combinada com conta de poupança real para crianças do ensino fundamental, com efeitos em conhecimento financeiro (conferir no texto completo).
- **Economia de sala de aula [38] [V].** O *My Classroom Economy* (Vanguard) não tem aulas de finanças: os alunos têm "empregos", ganham "dólares" de sala, pagam "aluguel" da carteira e compram em leilões e lojinhas. A avaliação do Center for Financial Security (Univ. Wisconsin), com 1.972 alunos, majoritariamente do 3º ao 5º ano, em 113 turmas, encontrou ganhos consistentes em **conhecimento financeiro, orçamento, socialização financeira e experiência econômica** depois de 10 semanas, de cerca de **0,1 DP**. É pouco, mas notável porque não há aulas diretas.
- **JA BizTown / Mini-Empresa [40] [V, existência; eficácia NV].** Não foi encontrada avaliação independente e rigorosa do BizTown. Há uma tese qualitativa com crianças do 5º ano e relatórios da própria Junior Achievement com resultados autodeclarados. **Não usar como evidência de eficácia.** (A Mini-Empresa da JA Brasil é voltada ao ensino médio.)
- **Brasil, programa público [41] [V, por resumo do BCB].** No *Aprender Valor* (Banco Central), a avaliação de impacto de curto prazo (nov./2021–fev./2022) cobriu 52.078 alunos em 2.064 turmas, com 397 escolas no grupo de tratamento. Houve aumento de pontuação, e quanto maior o uso dos recursos, maior o avanço (associação, não causalidade). Os tamanhos de efeito não estavam acessíveis; estão na *Série Cidadania Financeira nº 9* do BCB.
- **BNCC [48] [NV].** A Educação Financeira é tema contemporâneo transversal, e a unidade "Grandezas e medidas" trata do sistema monetário brasileiro nos anos iniciais. Os códigos exatos das habilidades ainda precisam ser conferidos no documento oficial (pendência já registrada na Decisão 002).

### 2.7 Poupar, esperar e metas: psicologia que molda o cofrinho

- **Adiamento da gratificação [44] [V].** Mischel, Shoda & Rodriguez (1989) é o paradigma clássico. **A replicação [42] [V]** (Watts, Duncan & Quan, 2018) mostrou que um minuto a mais de espera aos 4 anos prediz cerca de 0,1 DP de desempenho aos 15, que isso é **metade do relatado** e que cai **dois terços** com controles de família e ambiente. A maior parte da variação veio de conseguir esperar **pelo menos 20 segundos**. **Implicação:** para crianças de 4 a 5 anos, as metas do cofrinho devem ser **curtas** (dias, não meses). A espera é uma habilidade a treinar, e não um teste de caráter.
- **Esperar é racional quando o mundo é confiável [43] [V].** Kidd, Palmeri & Aslin (2013), n = 28, idade média de 4 anos e 6 meses: as crianças num ambiente **confiável** esperaram significativamente mais (p < 0,0005) que as de ambiente **não confiável**. **Implicação central para a especificação: preço anunciado nunca sobe, bônus prometido sempre vem e meta escolhida nunca é "movida".**
- **Estratégias infantis de poupança [45] [V].** Otto, Schots, Westerman & Webley (2006) estudaram, em situação experimental, como crianças em idade escolar usam estratégias para poupar e resistir a gastar (conferir no texto completo as faixas de idade e os resultados).
- **Rotular o dinheiro ajuda a poupar [46] [V].** Soman & Cheema (2011), experimento de campo com famílias de baixa renda: **separar e rotular** o dinheiro reservado aumentou a poupança (conferir no texto completo a manipulação exata). **Implicação:** o cofrinho tem **meta com foto do item** (dinheiro "carimbado").
- **Gradiente de meta [47] [V].** Kivetz, Urminsky & Zheng (2006): o esforço acelera à medida que a meta se aproxima, e uma ilusão de progresso também acelera. **Progresso dotado [47b] [V]** (Nunes & Drèze, 2006): um avanço artificial inicial aumenta o esforço. **Implicação ética:** a barra do cofrinho mostra o progresso **real**. *Proibido* fabricar progresso falso para "fisgar" a criança, porque isso é técnica de marketing e não pedagogia.

---

## 3. Síntese: o que muda na Decisão 002

| Tema | Decisão 002 dizia | Esta frente acrescenta |
|---|---|---|
| Ganho | Só aprendendo, por domínio e esforço | Valores concretos e pequenos, teto diário, rendimento decrescente; recompensa **indireta e informativa** [15] e por **insumo controlável** [18] |
| Perda | Sem perda de moedas | Confirmado: o custo de resposta não melhora o resultado [4] |
| Lojinha | Nomes decodificáveis | Itens **próximos da leitura** valem mais [17]; livros por domínio, nunca por moeda |
| Cofrinho | Meta, barra e bônus de paciência | Metas curtas aos 4–5 anos [42]; **confiabilidade absoluta** [43]; meta rotulada com foto [46]; progresso só real [47b] |
| Educação financeira | Mecânicas leves | Começar por **poupar/escolher**, e não por consumir [35]; experiencial [36][38] |
| Riscos | Sem loot box | Sem ranking [10], sem escassez/FOMO e sem pressão parassocial [26]; compras confirmadas e reversíveis [28] |
| Inclusão | — | Modo "quadro de fichas" para TEA/TDAH, com plano de retirada [1][3][4][5] |

---

## 4. ESPECIFICAÇÃO DA ECONOMIA DO FONEMA (v0.1, proposta para validação)

> Todos os números são **valores iniciais de projeto**, a calibrar no piloto (F1/F2 do rel. 27) com as métricas da seção 4.10. São deliberadamente pequenos para caber na numeracia de 4 a 8 anos.

### 4.1 Os seis componentes da economia de fichas (formato Ivy et al. [5])

| Componente | Definição no FONEMA |
|---|---|
| 1. Respostas-alvo | Prática deliberada de leitura: concluir atividade com tentativa real, revisar, ler história até o fim, recontar, dominar um som/padrão (marco verificado pelo modelo do aluno, rel. 20), ensinar o Bolota, ponte com o mundo real confirmada por adulto. **Nunca:** entrar no app, tempo de tela, sequência de dias, toques rápidos, repetir o que já foi dominado |
| 2. Ficha | **Moedinha** (nome na tela: "moeda"). Uma só moeda e uma só unidade. Sem moeda premium, sem gemas, sem segunda moeda |
| 3. Reforçadores de troca | Itens cosméticos e expressivos (avatar, casa, vila, bichinho, instrumentos que tocam sons de letras), ingressos para mini-aventuras **extras**, presentes, doação a projetos da vila. **Nunca** vantagem de aprendizagem nem conteúdo essencial |
| 4. Esquema de produção | Contínuo e imediato em cada resposta-alvo, com valores fixos (tabela 4.2). O marco de domínio é anunciado depois do fato pela Sofia, junto com o elogio de processo |
| 5. Oportunidade de troca | Lojinha aberta **no fim da sessão** (não no meio da lição, para não fragmentar a atenção, rel. 09) e no "tempo livre" da vila. Modo TEA/TDAH: troca ao fim de cada bloco curto, se configurado |
| 6. Esquema de troca (preço) | Preço fixo, visível e escrito em palavra e numeral, conforme a curva 4.6. Nunca muda depois de publicado |

### 4.2 Fontes de moedas (faucets) e valores relativos

| Fonte | Moedas | Limite | Racional |
|---|---|---|---|
| Atividade concluída com tentativa real (inclui erro + nova tentativa) | 1 | — | Esforço, não acerto [13][15] |
| Lição do dia concluída | 2 | 1/dia | Fecho da sessão ("termina bem", rel. 08) |
| Revisão espaçada concluída | 2 | conforme agenda (rel. 07) | Revisão deve "valer" tanto quanto o novo |
| História decodificável lida até o fim | 2 (+1 se recontar) | — | Recompensa próxima da leitura [17] |
| **Marco de domínio** (som/padrão dominado) | **5** | por marco | Maior fonte = aprendizagem real [15] |
| **Região concluída** (família de sons) | **10** | por região | Marco grande, raro, previsível |
| Ensinar o Bolota (efeito protegido) | 1 | 3/dia | Explicar consolida |
| Ponte com o mundo real (adulto confirma no painel) | 2 | 1/dia | Leva a recompensa para fora da tela (rel. 08) |
| Repetir atividade **já dominada** | 1 nas 2 primeiras vezes/dia, depois 0 | — | Antifarming; repetir continua permitido e elogiado, só não rende moeda |
| Login, tempo de tela, sequência de dias, anúncio, compra | **0 (inexistente)** | — | Proibido (Decisão 002, rel. 08) |

- **Teto diário de ganho: 12 moedas.** Ao atingi-lo, a Sofia diz: "Suas moedas de hoje já estão guardadas. Amanhã tem mais!" A criança pode continuar praticando (sem moedas) ou encerrar, e o app reforça o fim saudável da sessão.
- **Renda de referência (R):** sessão típica de 10–15 min ≈ **6–9 moedas**. Semana típica (4 sessões) + marcos ≈ **30–40 moedas/semana**. **R = 35** é a âncora de preços. Ano 1 ≈ 1.200–1.400; Ano 2 ≈ 1.300–1.500 (mesmas regras; ver 4.6).
- **Equidade:** os marcos são relativos à trajetória da criança (o domínio é o *dela*, rel. 20). A criança com dislexia demora mais por marco, mas ganha por atividade, revisão e história no mesmo ritmo. **Meta: a renda semanal mediana de crianças com perfil de dificuldade ≥ 80% da mediana geral** (métrica E2).
- **Surpresas:** as moedas não têm sorteio. As surpresas ficam no **conteúdo** e no **elogio** (rel. 08). A única "surpresa" econômica permitida é a Sofia notar algo de forma **não anunciada** ("Vi que você tentou de novo três vezes, que coragem!"), **sem moeda extra**, para não criar um esquema de razão variável.

### 4.3 Sumidouros (sinks)

| Sumidouro | Peso esperado no gasto | Observações |
|---|---|---|
| Lojinha de itens (avatar, casa, vila) | 60–70% | Principal; preços fixos |
| Ingressos de mini-aventuras extras | 10–15% | Só conteúdo **bônus** (nunca trilha principal); reutilizáveis depois de comprados |
| Presentes a amigos do jogo (NPCs) | 5–10% | Generosidade; o NPC agradece, sem pressão |
| **Projeto coletivo da vila** (horta, ponte, biblioteca) | 10–15% | Meta coletiva visível; na escola, por turma (sem ranking entre crianças) |
| Cuidado do bichinho | **0 obrigatório** | Itens opcionais. **O bichinho nunca adoece, fica triste nem "morre" por falta de compra ou de uso** (pressão parassocial [26]) |
| Taxas, aluguel, multa, desgaste de itens | **inexistentes** | Itens não quebram nem expiram; sem custo de manutenção |

### 4.4 Catálogo por região (proposta)

As regiões seguem as famílias de sons do mapa (rel. 04 #28, rel. 31 F06) e os biomas e culturas da Decisão 002. **A ordem dos grafemas deve seguir o escopo e sequência dos rel. 02 e 25.** Os nomes abaixo são exemplos e devem passar pelo filtro de decodificabilidade do rel. 25 antes de entrar no catálogo.

| Região (famílias de sons, ilustrativas) | Tema/bioma | Itens-âncora (nome decodificável na fase) | Faixa de preço |
|---|---|---|---|
| R0 Vogais e primeiras consoantes contínuas | Casa e quintal | Itens com **figura + áudio**, ainda sem leitura exigida: "pipa", "bola", "mala" | 2–8 |
| R1 Consoantes iniciais em sílabas CV | Litoral/praia | "luva", "tatu" (bichinho), "fita", "pote", "sapo" | 3–12 |
| R2 Oclusivas e mais CV | Sertão/caatinga | "bode", "pote de barro", "sanfona"*, "chapéu de couro"* | 5–20 |
| R3 Dígrafos (ch, lh, nh) | Amazônia | "chocalho", "ninho", "folha", "cachoeira" (cenário) | 8–30 |
| R4 Sílabas travadas e encontros (ar, as, br, pl) | Pantanal | "barco", "árvore", "bloco", "porta" | 10–40 |
| R5 Nasalização (ã, am, an, em) | Pampa/Sul | "lã", "manta", "pandeiro", "tambor" | 15–60 |
| R6 Regras contextuais (c/ç, g/gu, r/rr, s/ss) | Cidade/periferia e festa junina | "carroça", "fogueira", "pamonha", "bandeirinha" | 20–80 |
| R7 Fluência e textos | Mata Atlântica e carnaval | Fantasias, instrumentos, decoração de estante; cenários de história | 25–120 |

\* Só entram quando todos os grafemas do nome já tiverem sido ensinados; até lá, ficam bloqueados **por domínio** e aparecem como "em breve", sem preço.

**Regras do catálogo:**
- **Itens de representatividade são gratuitos e permanentes** (pele, cabelos, óculos, aparelho auditivo, cadeira de rodas; Decisão 002 §4). Identidade não se compra.
- **Itens sazonais** (festa junina, carnaval, Natal) **voltam todo ano**, e o que foi comprado fica para sempre. **Proibido:** "só hoje", contagem regressiva, item que some.
- **Sem raridade:** todos os itens são igualmente "comuns", e não há indicadores de "épico/lendário".
- **Itens próximos da leitura** (estante, marcador, figurinha que fala a palavra, instrumento que toca o som da letra) recebem destaque [17].
- Cada região acrescenta **20–30 itens** e um **projeto coletivo**, o que absorve o saldo acumulado (anti-inflação, 4.8).

### 4.5 A lojinha como atividade de leitura

1. **Etiqueta = palavra decodificável + numeral + ícones de moeda.** Nas fases iniciais, o preço aparece também como pilha de moedas agrupadas de 5 em 5 (subitização).
2. **"Leia para conhecer":** ao tocar no item, a criança tenta ler o nome primeiro. A Sofia só lê depois da tentativa, ou com ajuda graduada (sílaba → som → palavra, rel. 31 F30). **Ler nunca é condição para comprar:** a criança que não consegue recebe ajuda e compra normalmente. Ler a etiqueta pode render 1 moeda dentro da regra de "atividade concluída", respeitando o teto.
3. **Frases de compra decodificáveis** nas fases avançadas: "A pipa custa 5." / "Falta 3 para a luva."
4. **Comparar preços** (Decisão 002): duas barracas com o mesmo item em preços diferentes, a partir de R4. A tarefa de "achar o mais barato" é leitura + matemática.
5. **Lista de desejos lida em voz alta** pela criança (prática de fluência com vocabulário motivador).

### 4.6 Curva de preços ao longo de 2 anos

Princípio: **as regras de ganho não mudam**. O que cresce é o **tamanho das metas**, acompanhando (a) a capacidade de esperar [42][43] e (b) a numeracia da criança (contagem até 10–20 no início, até 100 depois, sistema monetário no 2º ano). R = renda semanal típica (cerca de 35).

| Período | Idade típica | Números exibidos | Item pequeno (P) | Item médio (M) | Meta do cofrinho (G) | Espera máxima da meta |
|---|---|---|---|---|---|---|
| S1 (meses 1–6) | 4–5 / início 6 | até 20 (+ pilha de moedas) | 2–5 (≈ 1 sessão) | 6–12 (2 sessões) | 15–25 | **≤ 1 semana** |
| S2 (meses 7–12) | 5–6 | até 50 | 3–8 | 10–20 | 30–50 | ≤ 1,5 semana |
| S3 (meses 13–18) | 6–7 | até 100 | 5–10 | 15–30 | 50–90 | ≤ 2,5 semanas |
| S4 (meses 19–24) | 7–8 | até 200; **moedas de 1, 5 e 10** para trocar e contar | 5–15 | 20–40 | 80–150 | ≤ 4 semanas |

- **Regra de preço:** P ≈ 0,1–0,25 R; M ≈ 0,3–1 R; G ≈ 0,5–1 R em S1, subindo até 2,5–4 R em S4.
- **Preço publicado é imutável.** Se a calibração mostrar um item barato demais, ele **continua** com o mesmo preço, e o ajuste é feito nos itens **novos**.
- **A criança mais nova nunca vê preço maior que a sua numeracia:** a idade/fase define quais faixas aparecem.
- **Moedas de 5 e 10 (S4):** o saldo é o mesmo; muda só a **representação** (agrupar e trocar), para a habilidade BNCC de sistema monetário. Não é uma nova moeda.

### 4.7 Cofrinho e metas

- **Uma meta por vez em S1–S2 e até três metas em S3–S4**, cada uma com **foto do item** (dinheiro rotulado [46]).
- **Barra de progresso real** (gradiente de meta [47]), com frase decodificável "Falta __". **Sem progresso inicial fictício** [47b].
- **Transferência automática opcional:** a criança (ou o adulto, com ela) escolhe "guardar 1 de cada 3 moedas no cofrinho". É uma regra simples, visual e revogável.
- **Bônus de paciência fixo e anunciado:** ao atingir a meta, **+1 moeda para cada 10 guardadas** (10%), sempre igual e sem exceção [43]. Em S4, a Sofia chama isso de "o cofrinho rendeu" (porta de entrada para juros, sem fórmula).
- **Sacar é livre e sem penalidade** (autonomia). O bônus só vem ao completar a meta. A Sofia comenta sem julgar: "Você pode usar agora ou continuar guardando. A escolha é sua."
- **Custo de oportunidade visível** antes de cada compra quando há meta ativa: "Se comprar o boné, a pipa fica para depois." É dito uma vez, sem culpa, e não se repete.
- **Celebração da meta** com o item e a Sofia (elogio de processo: "Você esperou e conseguiu!"), sem fogos excessivos (rel. 09).
- **Conversa em família:** o painel dos pais mostra metas, compras e doações, com uma pergunta semanal sugerida ("O que você está guardando? Por quê?") [33]: momento ensinável.

### 4.8 Anti-inflação e saúde da oferta de moeda

1. **Preços fixos** e progressão **por itens novos** em faixas maiores ([19][21][22]).
2. **Teto diário** (12) e **rendimento decrescente** em repetições de conteúdo dominado (4.2).
3. **Nenhuma fonte nova sem sumidouro correspondente** (revisão de design obrigatória; simular no Machinations [19] ou numa planilha).
4. **Cada nova região traz itens e um projeto coletivo** dimensionados para absorver cerca de 1–2 semanas de saldo mediano.
5. **Alvo de razão gasto/ganho em 4 semanas: 0,6–0,9.** Abaixo de 0,5 por mais de 4 semanas, a criança está acumulando sem desejo: oferecer projeto coletivo ou itens novos, **sem** baixar preços nem criar promoções-relâmpago.
6. **Saldo mediano alvo ≤ 2 R** (fora o que está em metas). Se passar de 4 R na população, o problema é de catálogo, e não de preço.
7. **Sem troca entre crianças** e **sem mercado secundário** (evita bullying, extorsão e comparação). Os presentes vão só para NPCs ou para a turma (projeto coletivo).
8. **Sem conversão** entre moedas e qualquer coisa de valor real (pontos de parceiros, descontos, brindes físicos).

### 4.9 Salvaguardas éticas e legais (checklist de lançamento)

| # | Salvaguarda | Base |
|---|---|---|
| S1 | Moedas nunca compradas com dinheiro real; nenhum anúncio; nenhum "assista e ganhe" | Decisão 002; [28]; rel. 05 |
| S2 | Zero aleatoriedade na recompensa material (sem baú, roleta, sorteio, raridade) | ECA Digital art. 20 [32]; [29]–[31] |
| S3 | Sem ranking, placar ou comparação entre crianças | [10][11] |
| S4 | Sem escassez artificial, contagem regressiva ou item que desaparece | [26] (pressão de tempo) |
| S5 | Sem pressão parassocial: a Sofia, o Bolota e o bichinho nunca ficam tristes, doentes ou "com saudade" por falta de uso ou de compra | [26]; rel. 08 |
| S6 | Compra em 2 toques (escolher → confirmar com imagem e preço lido); **desfazer em até 24 h** com devolução integral | [28] |
| S7 | Moedas não expiram; itens não se desgastam; nada se perde por erro ou ausência | [4]; Decisão 002 |
| S8 | Itens sem vantagem pedagógica; conteúdo essencial nunca atrás de moeda | [20]; rel. 30 |
| S9 | Recompensa por tempo de uso ou sequência de dias proibida | rel. 08; [15] |
| S10 | Porteira parental para o painel e qualquer link externo; sem SDK de terceiros | rel. 05 [F41][F42] |
| S11 | A economia pode ser **desligada ou simplificada** por pais e escolas (modo "só estrelas de domínio") | Autonomia da família; superjustificação |
| S12 | Auditoria anual de dark patterns com o framework de Fitton & Read [27] e a tipologia de Radesky [26] | — |
| S13 | Revisão jurídica do art. 2º, IV e do art. 20 do ECA Digital e do Decreto 12.880/2026 no texto oficial | [32] (NV literal) |

**Modo "quadro de fichas" (TEA/TDAH, configurável pelo adulto ou terapeuta).** Quadro visual de 5 casas por bloco curto. O reforçador de troca é **escolhido antes** de começar, e a troca é imediata ao completar o quadro. A regra é explícita e consistente. O **plano de retirada** é aumentar gradualmente o tamanho do quadro (5 → 8 → 10) e migrar para o modo padrão [1][3][4][5]. Esse modo não usa custo de resposta.

### 4.10 Métricas de saúde da economia (painel interno, agregado e sem identificação, conforme o rel. 05)

| Código | Métrica | Alvo / alerta |
|---|---|---|
| E1 | **% das moedas vindas de marcos + revisão + história** (vs. atividades soltas) | ≥ 40%; alerta < 25% (economia "de clique") |
| E2 | Renda semanal mediana de crianças com perfil de dificuldade / mediana geral | ≥ 0,8 |
| E3 | Razão gasto/ganho (4 semanas) | 0,6–0,9; alerta < 0,5 ou > 1,0 sustentado |
| E4 | Saldo mediano livre em semanas de renda (R) | ≤ 2 R; alerta > 4 R |
| E5 | % de metas do cofrinho concluídas / abandonadas; tempo até a meta por faixa etária | Conclusão ≥ 60%; tempo dentro da "espera máxima" (4.6) |
| E6 | Taxa de "desfazer compra" | Alerta > 10% (UI confusa ou compra impulsiva) |
| E7 | Sinais de farming: % de atividades em conteúdo já dominado; % de dias no teto | Alerta: > 30% das atividades em conteúdo dominado; > 50% dos dias no teto |
| E8 | **Sentinela de superjustificação:** % de crianças que leem na **estante livre** (leitura que não rende moeda) e sua tendência mês a mês | Estável ou subindo; **queda > 20% em 2 meses com renda estável → revisão do sistema** [17][15] |
| E9 | Aprendizagem não piora com a economia: no piloto, comparar turmas com economia completa vs. "só estrelas de domínio" (S11) em domínio fônico e leitura livre | Sem diferença negativa; decisão de manter guiada por dados (rel. 27) |
| E10 | Duração e término das sessões (fim natural vs. abandono) | Fim natural ≥ 70% |
| E11 | Uso da conversa em família (painel dos pais) | Monitorar; meta de engajamento a definir |
| E12 | Itens nunca comprados por mais de 6 meses / itens mais desejados | Curadoria do catálogo (sem mexer em preço) |

---

## 5. Lacunas e próximos passos

1. **Calibrar R, o teto diário e as faixas de preço** no piloto F1/F2. Os números da seção 4 são hipóteses.
2. **Testar E9** (economia completa vs. só estrelas). Não há ECR com crianças de 4 a 8 anos que isole moedas + lojinha em alfabetização. Seria uma contribuição original do FONEMA.
3. **Conferir no texto completo:** [2], [7], [9] (moderadores), [14b], [20], [27], [30], [34], [39], [45], [46] e os números da *Série Cidadania Financeira nº 9* [41].
4. **Conferir os códigos BNCC** (tema transversal de Educação Financeira; sistema monetário nos anos iniciais) [48].
5. **Validação jurídica** de S1–S13, com atenção à definição de "caixa de recompensa" no ECA Digital.
6. **Gerar o catálogo real** com o filtro de decodificabilidade do rel. 25, por região, e revisar a representatividade cultural com consultores regionais (rel. 23).

---

## 6. Referências

| # | Autor(es) | Ano | Título / veículo | Tipo | DOI / URL | Status |
|---|---|---|---|---|---|---|
| 1 | Kazdin, A. E.; Bootzin, R. R. | 1972 | The token economy: an evaluative review. *J. Appl. Behav. Anal.* 5(3):343–372 | Revisão | 10.1901/jaba.1972.5-343 (PMID 16795358) | [V] |
| 2 | Kazdin, A. E. | 1982 | The token economy: a decade later. *J. Appl. Behav. Anal.* 15(3):431 | Revisão | 10.1901/jaba.1982.15-431 | [V] |
| 3 | Matson, J. L.; Boisjoli, J. A. | 2009 | The token economy for children with intellectual disability and/or autism: a review. *Res. Dev. Disabil.* 30(2):240–248 | Revisão | 10.1016/j.ridd.2008.04.001 (PMID 18486442) | [V] |
| 4 | Soares, D. A.; Harrison, J. R.; Vannest, K. J.; McClelland, S. S. | 2016 | Effect size for token economy use in contemporary classroom settings: a meta-analysis of single-case research. *School Psychol. Rev.* 45(4):379–399 | Meta-análise | 10.17105/SPR45-4.379-399 | [V] |
| 5 | Ivy, J. W.; Meindl, J. N.; Overley, E.; Robson, K. M. | 2017 | Token economy: a systematic review of procedural descriptions. *Behav. Modif.* 41(5):708 | Revisão sistemática | 10.1177/0145445517699559 | [V] |
| 6 | Fabiano, G. A. et al. | 2009 | A meta-analysis of behavioral treatments for ADHD. *Clin. Psychol. Rev.* 29(2):129 | Meta-análise | 10.1016/j.cpr.2008.11.001 (PMID 19131150) | [V] |
| 7 | Doll, C.; McLaughlin, T. F.; Barretto, A. | 2013 | The token economy: a recent review and evaluation. *Int. J. Basic Appl. Sci.* 2(1):131–149 | Revisão | https://behaviortechcourse.com/wp-content/uploads/2022/11/Doll_Token_Economy.pdf | [V] (sem DOI) |
| 8 | Hackenberg, T. D. | 2009 | Token reinforcement: a review and analysis. *J. Exp. Anal. Behav.* 91(2):257 | Revisão | 10.1901/jeab.2009.91-257 (PMID 19794838) | [V] |
| 8b | Hackenberg, T. D. | 2018 | Token reinforcement: translational research and application. *J. Appl. Behav. Anal.* 51(2):393–435 | Revisão | 10.1002/jaba.439 | [V] |
| 9 | Bai, S.; Hew, K. F.; Huang, B. | 2020 | Does gamification improve student learning outcome? Evidence from a meta-analysis and synthesis of qualitative data. *Educ. Res. Rev.* 30:100322 | Meta-análise | 10.1016/j.edurev.2020.100322 | [V] |
| 10 | Hanus, M. D.; Fox, J. | 2015 | Assessing the effects of gamification in the classroom: a longitudinal study on intrinsic motivation, social comparison, satisfaction, effort, and academic performance. *Comput. Educ.* 80:152 | Estudo longitudinal | 10.1016/j.compedu.2014.08.019 | [V] |
| 11 | Sailer, M.; Hense, J. U.; Mayr, S. K.; Mandl, H. | 2017 | How gamification motivates: an experimental study of the effects of specific game design elements on psychological need satisfaction. *Comput. Hum. Behav.* 69:371 | ECR | 10.1016/j.chb.2016.12.033 | [V] |
| 12 | Mekler, E. D.; Brühlmann, F.; Tuch, A. N.; Opwis, K. | 2017 | Towards understanding the effects of individual gamification elements on intrinsic motivation and performance. *Comput. Hum. Behav.* 71:525–534 | Experimento | 10.1016/j.chb.2015.08.048 | [V] |
| 13 | Abramovich, S.; Schunn, C.; Higashi, R. M. | 2013 | Are badges useful in education? It depends upon the type of badge and expertise of learner. *ETR&D* 61:217 | Estudo empírico | 10.1007/s11423-013-9289-2 (ERIC EJ997626) | [V] |
| 14 | Eisenberger, R.; Cameron, J. | 1996 | Detrimental effects of reward: reality or myth? *Am. Psychol.* 51(11):1153 | Revisão | 10.1037/0003-066X.51.11.1153 | [V] |
| 14b | Cameron, J.; Banko, K. M.; Pierce, W. D. | 2001 | Pervasive negative effects of rewards on intrinsic motivation: the myth continues. *Behav. Anal.* 24(1):1–44 | Meta-análise | 10.1007/BF03392017 | [V] |
| 15 | Cerasoli, C. P.; Nicklin, J. M.; Ford, M. T. | 2014 | Intrinsic motivation and extrinsic incentives jointly predict performance: a 40-year meta-analysis. *Psychol. Bull.* 140(4):980 | Meta-análise | 10.1037/a0035661 | [V] |
| 16 | Filsecker, M.; Hickey, D. T. | 2014 | A multilevel analysis of the effects of external rewards on elementary students' motivation, engagement and learning in an educational game. *Comput. Educ.* 75:136–148 | Quase-experimento | 10.1016/j.compedu.2014.02.008 | [V] |
| 17 | Marinak, B. A.; Gambrell, L. B. | 2008 | Intrinsic motivation and rewards: what sustains young children's engagement with text? *Literacy Res. Instr.* 47(1):9 | Experimento | 10.1080/19388070701749546 | [V] |
| 18 | Fryer, R. G. | 2011 | Financial incentives and student achievement: evidence from randomized trials. *Q. J. Econ.* 126(4):1755 | ECRs de campo | 10.1093/qje/qjr045 | [V] |
| 19 | Adams, E.; Dormans, J. | 2012 | *Game Mechanics: Advanced Game Design*. New Riders | Livro | ISBN 9780321820273; https://peachpit.com/articles/article.aspx?p=1925649 | [NV] livro; trechos [V] |
| 20 | Lehdonvirta, V. | 2009 | Virtual item sales as a revenue model: identifying attributes that drive purchase decisions. *Electron. Commer. Res.* 9:97 | Artigo | 10.1007/s10660-009-9028-2 | [V] |
| 21 | Lehdonvirta, V.; Castronova, E. | 2014 | *Virtual Economies: Design and Analysis*. MIT Press | Livro | — | [NV] |
| 22 | Castronova, E. et al. | 2009 | As real as real? Macroeconomic behavior in a large-scale virtual world. *New Media Soc.* 11(5):685 | Estudo empírico | 10.1177/1461444809105346 | [V] |
| 23 | Síntese do pesquisador sobre [19][21][22] | — | Princípios de fontes/sumidouros e inflação | Síntese | — | — |
| 26 | Radesky, J. et al. | 2022 | Prevalence and characteristics of manipulative design in mobile applications used by children. *JAMA Netw. Open* 5(6):e2217641 | Transversal | 10.1001/jamanetworkopen.2022.17641 (PMID 35713902) | [V] |
| 27 | Fitton, D.; Read, J. C. | 2019 | Creating a framework to support the critical consideration of dark design aspects in free-to-play apps. *IDC '19*:407–418 | Framework | 10.1145/3311927.3323136 | [V] |
| 28 | Federal Trade Commission | 2022–2023 | FTC v. Epic Games: US$ 245 mi em reembolsos (dark patterns) + US$ 275 mi (COPPA) | Decisão administrativa/judicial | https://www.ftc.gov/node/80648 ; https://www.pbs.org/newshour/amp/nation/fortnite-maker-epic-games-to-settle-ftc-case-pay-520-million-in-penalties-and-refunds | [V] |
| 29 | Zendle, D.; Cairns, P. | 2018 | Video game loot boxes are linked to problem gambling: results of a large-scale survey. *PLoS One* 13(11):e0206767 | Survey (n = 7.422) | 10.1371/journal.pone.0206767 | [V] |
| 30 | Drummond, A.; Sauer, J. D. | 2018 | Video game loot boxes are psychologically akin to gambling. *Nat. Hum. Behav.* 2:530–532 | Comentário/análise | 10.1038/s41562-018-0360-1 | [V] |
| 31 | Spicer, S. G. et al. | 2022 (online 2021) | Loot boxes, problem gambling and problem video gaming: a systematic review and meta-synthesis. *New Media Soc.* 24(4):1001–1022 | Revisão sistemática | 10.1177/14614448211027175 | [V] |
| 32 | Brasil | 2025 | Lei 15.211/2025 (ECA Digital), arts. 2º, IV e 20; Decreto 12.880/2026; Nota Técnica MJSP 55 | Lei | https://www.mattosfilho.com.br/unico/eca-digital-sancionada-lei/ ; https://www.conjur.com.br/2025-out-22/impactos-do-eca-digital-no-segmento-de-jogos-eletronicos/ ; https://www.gov.br/mj/pt-br/assuntos/noticias-1/mjsp-pede-a-anpd-que-monitore-jogos-eletronicos-com-caixas-de-recompensa-que-nao-implementaram-verificacao-de-idade/NotaTcnican55.pdf | [V] secundária; texto literal [NV] |
| 33 | Kaiser, T.; Menkhoff, L. | 2017 | Does financial education impact financial literacy and financial behavior, and if so, when? *World Bank Econ. Rev.* 31(3):611 | Meta-análise | 10.1093/wber/lhx018 | [V] |
| 34 | Kaiser, T.; Lusardi, A.; Menkhoff, L.; Urban, C. | 2022 | Financial education affects financial knowledge and downstream behaviors. *J. Financ. Econ.* 145(2):255–272 | Meta-análise de ECRs | 10.1016/j.jfineco.2021.09.022 | [V] |
| 35 | Bruhn, M. et al. | 2016 | The impact of high school financial education: evidence from a large-scale evaluation in Brazil. *AEJ: Applied* 8(4):256 | ECR (Brasil) | 10.1257/app.20150149 | [V] |
| 36 | Amagir, A.; Groot, W.; Maassen van den Brink, H.; Wilschut, A. | 2018 | A review of financial-literacy education programs for children and adolescents. *Citizenship Soc. Econ. Educ.* 17(1):56–80 | Revisão sistemática | 10.1177/2047173417719555 | [V] |
| 37 | Batty, M.; Collins, J. M.; Odders-White, E. | 2015 | Experimental evidence on the effects of financial education on elementary school students' knowledge, behavior, and attitudes. *J. Consum. Aff.* 49(1):69–96 | Experimento | 10.1111/joca.12058 | [V] |
| 38 | Center for Financial Security (UW–Madison) / U.S. Treasury | 2016 | My Classroom Economy evaluation (Palm Beach, 1.972 alunos, 3º–5º ano) | Avaliação de programa | https://cfs.wisc.edu/2016/09/15/mce ; https://home.treasury.gov/system/files/231/My-Classroom-Economy-Brief.pdf | [V] |
| 39 | Sherraden, M. S.; Johnson, L.; Guo, B.; Elliott, W. | 2011 | Financial capability in children: effects of participation in a school-based financial education and savings program. *J. Fam. Econ. Issues* 32:385 | Quase-experimento | 10.1007/s10834-010-9220-5 | [V] |
| 40 | Junior Achievement / Endsley (tese EKU) | 2020–2025 | JA BizTown: tese qualitativa e relatórios institucionais | Relatórios | https://core.ac.uk/download/475675721.pdf ; https://www.lrl.mn.gov/docs/2025/mandated/251950.pdf | [V] existência; eficácia [NV] |
| 41 | Banco Central do Brasil | 2024 | Aprender Valor: avaliação de impacto (*Série Cidadania Financeira* nº 9) | Avaliação de programa | https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/serie_cidadania/S%C3%A9rie_cidadania_financeira_n9.pdf | [V] (resumo) |
| 42 | Watts, T. W.; Duncan, G. J.; Quan, H. | 2018 | Revisiting the marshmallow test: a conceptual replication... *Psychol. Sci.* 29(7):1159 | Replicação | 10.1177/0956797618761661 | [V] |
| 43 | Kidd, C.; Palmeri, H.; Aslin, R. N. | 2013 | Rational snacking: young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability. *Cognition* 126(1):109 | Experimento | 10.1016/j.cognition.2012.08.004 (PMID 23063236) | [V] |
| 44 | Mischel, W.; Shoda, Y.; Rodriguez, M. L. | 1989 | Delay of gratification in children. *Science* 244:933 | Revisão/estudos | 10.1126/science.2658056 | [V] |
| 45 | Otto, A. M. C.; Schots, P. A. M.; Westerman, J. A. J.; Webley, P. | 2006 | Children's use of saving strategies: an experimental approach. *J. Econ. Psychol.* 27(1):57 | Experimento | 10.1016/j.joep.2005.06.013 | [V] |
| 46 | Soman, D.; Cheema, A. | 2011 | Earmarking and partitioning: increasing saving by low-income households. *J. Mark. Res.* 48(SPL):S14 | Experimento de campo | 10.1509/jmkr.48.SPL.S14 | [V] |
| 47 | Kivetz, R.; Urminsky, O.; Zheng, Y. | 2006 | The goal-gradient hypothesis resurrected. *J. Mark. Res.* 43(1):39 | Experimentos | 10.1509/jmkr.43.1.39 | [V] |
| 47b | Nunes, J. C.; Drèze, X. | 2006 | The endowed progress effect: how artificial advancement increases effort. *J. Consum. Res.* 32(4):504 | Experimentos | 10.1086/500480 | [V] |
| 48 | Brasil, MEC | 2018 | BNCC: TCT Educação Financeira; Matemática, sistema monetário (anos iniciais) | Normativo | http://basenacionalcomum.mec.gov.br/ | [NV] (códigos a conferir) |

Referências cruzadas internas (não contadas): rel. 05 [F41][F42] (Apple e Google), rel. 08 (Deci et al. 1999; Lepper 1973; Greene et al. 1976; Cameron & Pierce 1994; Radesky 2022), rel. 12 (TDAH), rel. 20 (modelo de domínio), rel. 25 (decodificáveis), rel. 30 (Sailer & Homner 2020), rel. 31 (telas e funcionalidades).

**Contagem:** 49 entradas (numeração com 8b, 14b e 47b; os números 24–25 não foram usados). Descontada a síntese [23], são **48 fontes externas**: **43 [V]** (DOI, PMID, ERIC ou página oficial), **2 [V] parciais** (ECA Digital [32], com texto literal a conferir; BizTown [40], só a existência) e **3 [NV]** ([19] e [21], livros; [48], BNCC).
