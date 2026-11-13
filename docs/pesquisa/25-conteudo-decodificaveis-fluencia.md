# 25 — Conteúdo de leitura: livros decodificáveis, vocabulário, fluência, compreensão e escrita

> Frente de pesquisa 25 de 30 — **Conteúdo de leitura e escrita**
> Projeto: FONEMA, plataforma web + app de alfabetização fônica em pt-BR (letras → sílabas → palavras → frases → textos).
> Data: novembro/2026. As referências estão numeradas entre colchetes, por exemplo [12], e listadas na seção 5.

**Nota de método (importante).** Nesta sessão **não foi possível fazer buscas nem abrir páginas**. A cota de WebSearch da rodada já estava esgotada quando esta frente começou, e a rede bloqueou `doi.org` e `api.crossref.org`. As referências abaixo são trabalhos consolidados e muito citados da literatura, que o pesquisador conhecia antes desta sessão. **Nenhuma foi conferida on-line agora.** Por isso, toda a tabela da seção 5 tem a marcação "(verificar)". Só aparecem DOIs de que havia alta confiança, e mesmo esses precisam ser conferidos. Volume, páginas e anos devem ser checados antes de citar o documento fora da equipe. Itens com dúvida real sobre algum detalhe (título exato, ano, nome de programa) estão marcados com **(verificar — incerto)**. Não há URLs inventadas: quando o endereço não era conhecido com segurança, a coluna diz "buscar".

---

## 1. Resumo executivo

1. **Texto decodificável é um andaime e não precisa ser o único texto.** A evidência mostra que, no início, textos com alta proporção de palavras decodificáveis (com as correspondências grafema-fonema já ensinadas) fazem a criança **aplicar** a decodificação em vez de adivinhar pelo contexto ou pela figura [1][2][3][4]. A revisão de Cheatham & Allor [1] conclui que a decodificabilidade ajuda, mas que a evidência é **modesta e de qualidade metodológica limitada**. Ela também não é o único fator: repetição de palavras, controle de vocabulário e qualidade da instrução também pesam. O debate recente [5][6] defende usar decodificáveis **por pouco tempo** (semanas a poucos meses por fase) e, em paralelo, oferecer leitura em voz alta de textos ricos para vocabulário e compreensão.
2. **O português brasileiro favorece textos decodificáveis.** A ortografia é semitransparente [7]. Por isso, a decodificabilidade sobe rápido: com vogais e umas 8 a 10 consoantes em sílabas CV já se escrevem frases inteiras ("a bola é da vovó"). O problema próprio do PB está nas **regras contextuais e nas reduções vocálicas**: "e" e "o" átonos finais soam [i] e [u] ("leite", "bolo"), "de" soa [dʒi], há nasalização e há "r" e "s" com valor dependente da posição. O gerador de textos precisa tratar essas regras como **conteúdo ensinado**, e não como exceções invisíveis.
3. **Há bases lexicais para construir o vocabulário controlado, mas nenhuma é perfeita para o Brasil infantil.** **LexPorBR** [8] é brasileiro e adulto (frequências de corpora gerais). **ESCOLEX** [9] é infantil, por ano escolar, mas é de **Portugal** (livros didáticos do PE). **Pinheiro (1996)** [10] é brasileiro e infantil, mas antigo. Os modelos internacionais (Manulex [11], CPWD [12], childLex [13]) mostram o desenho ideal: frequência por série, a partir de livros lidos por crianças. **Recomendação: o FONEMA deve montar o próprio corpus infantil pt-BR** e usar as bases existentes para cruzar e calibrar.
4. **Fluência: leitura repetida com modelo e retorno funciona.** O NRP [14] e as revisões de Kuhn & Stahl [15] e Therrien [16] apoiam a leitura oral **repetida e guiada, com feedback**. A prosódia faz parte da fluência e se relaciona com a compreensão [17][18]. **Ler ouvindo com destaque sincronizado ("karaokê")** tem evidência a favor de ganhos de reconhecimento de palavras quando a criança é levada a **olhar a palavra destacada** [19][20]. A ressalva é que a criança pode só escutar e não ler. Por isso o karaokê deve ser uma etapa ("ouvir → ler junto → ler sozinho com reconhecimento de fala"), e não o fim do percurso.
5. **Vocabulário e compreensão dependem de conhecimento, não só de decodificação.** Pela Visão Simples da Leitura [21], compreensão = decodificação × compreensão da linguagem. As palavras de "camada 2" de Beck & McKeown [22] e a construção de conhecimento de mundo [23][24] (no experimento do beisebol de Recht & Leslie, conhecimento prévio pesou mais que habilidade leitora) devem vir por **leitura em voz alta e conjuntos temáticos de textos**, e não pelos decodificáveis, que têm vocabulário pobre por definição. O guia do IES/WWC [25] recomenda ensinar estratégias de compreensão de forma explícita, ensinar estrutura de texto e conversar sobre o texto.
6. **A escrita reforça a leitura.** Escrever e soletrar consolida o mapeamento ortográfico [26][27]. A **escrita inventada** com feedback na educação infantil prevê e melhora a leitura [28][29]. **Ditado** com análise de erros por categoria, na linha de Artur Gomes de Morais [30][31], é o instrumento brasileiro natural. **Traçado à mão** (com caneta ou stylus) favorece o reconhecimento de letras mais do que digitar [32][33][34][35]. **A recomendação é mão e stylus, não teclado, na fase de letras.**

---

## 2. Achados

### 2.1 Textos decodificáveis: o que a evidência diz

- **Definição operacional.** Decodificabilidade é a proporção de palavras de um texto que podem ser lidas só com as correspondências grafema-fonema (CGF) já ensinadas, somadas a uma lista pequena de palavras ensinadas de memória [2][3]. Mesmer [2] mostra que "decodificável" é uma propriedade **relativa ao currículo**: o mesmo texto é decodificável para uma turma e não para outra. **Consequência para o FONEMA: a decodificabilidade se calcula contra o estado de cada criança, não contra o texto isolado.**
- **Estudos clássicos.** Juel & Roper-Schneider [4] observaram que crianças expostas a livros com mais palavras decodificáveis usavam mais estratégias fônicas e generalizavam melhor para palavras novas. Mesmer [3] encontrou mais acurácia e mais uso de estratégias de decodificação na 1ª série com textos altamente decodificáveis.
- **Revisão de Cheatham & Allor (2012)** [1]. A decodificabilidade parece útil para leitores iniciantes, mas os estudos são poucos, heterogêneos e de qualidade metodológica variável. As autoras destacam também a **repetição de palavras** e o **controle de vocabulário** como características relevantes do texto.
- **Evidência recente (Reino Unido).** Price-Mohr & Price [5] compararam crianças de 4 a 5 anos lendo textos com alta e com baixa proporção de palavras decodificáveis. Os resultados **não favoreceram de forma simples** os textos mais decodificáveis, o que alimenta o debate atual. **(verificar — incerto: detalhes do desenho e dos resultados.)**
- **Posição de síntese.** Castles, Rastle & Nation [6], na revisão "Ending the reading wars", defendem a instrução fônica sistemática no início, seguida de **muita leitura variada**. É por essa exposição que se constrói o léxico ortográfico (hipótese do autoensino de Share [36]; mapeamento ortográfico de Ehri [26]). O decodificável é a ponte, não o destino.
- **Ortografias transparentes.** Seymour, Aro & Erskine [7] mostraram que crianças em ortografias consistentes (finlandês, grego, italiano, espanhol) chegam a uma decodificação razoável em cerca de um ano. Em ortografias opacas (inglês), isso leva muito mais tempo. O português ficou numa posição intermediária. **Implicação: no PB, a fase "estritamente decodificável" pode ser mais curta que no inglês.**

### 2.2 Iniciativas brasileiras de textos decodificáveis e materiais estruturados

- **PNA (2019) e RENABE (2020)** [37][38]. A Política Nacional de Alfabetização e o Relatório Nacional de Alfabetização Baseada em Evidências (MEC) trouxeram ao debate oficial os componentes do NRP: consciência fonêmica, instrução fônica, fluência, vocabulário, compreensão e produção de escrita. A PNA foi revogada em 2023 (ver doc 02), mas esses documentos continuam úteis como síntese em português.
- **Tempo de Aprender (MEC, 2020)** [39]. Programa federal ligado à PNA, com formação de professores e recursos digitais. Hoje ele é **pouco documentado e foi substituído no discurso oficial pelo CNCA**. **(verificar — incerto: se o programa distribuiu livros decodificáveis próprios e se os materiais seguem on-line.)**
- **Instituto Alfa e Beto (IAB)** [40]. Organização brasileira com programa estruturado de alfabetização fônica e material próprio de leitura graduada (coleções de livros para o 1º ano). **(verificar — incerto: títulos das coleções e licença de uso.)**
- **"Ensino Estruturado"**: **não foi possível confirmar** a que iniciativa o nome se refere. Pode ser uma rede, uma editora ou um programa estadual. Investigar em outra rodada.
- **Lacuna.** Não se conhece um **corpus público e aberto** de textos decodificáveis em pt-BR com metadados de CGF por texto. **Isso é uma oportunidade de diferenciação para o FONEMA**, e também um risco: a biblioteca terá de ser produzida pelo próprio projeto.

### 2.3 Bases lexicais e frequência de palavras

| Base | País | O que tem | Uso no FONEMA |
|---|---|---|---|
| **LexPorBR** [8] | Brasil | Léxico do PB com frequências (corpora gerais/adultos), variáveis morfológicas e fonológicas | Frequência geral, filtro de palavras raras, classe gramatical |
| **ESCOLEX** [9] | Portugal | Cerca de 48 mil palavras de livros didáticos do 1º ao 6º ano, com frequência por ano escolar | Modelo de desenho; frequência relativa por série (com cautela: léxico e grafia do PE) |
| **Pinheiro (1996)** [10] | Brasil | Contagem de frequência de palavras em material lido por crianças da pré-escola às séries iniciais | Âncora brasileira infantil; conferir a disponibilidade da lista |
| **CHILDES — corpora do português** [41] | Internacional (inclui corpora brasileiros e portugueses) | Transcrições de fala infantil e de fala dirigida à criança | Vocabulário oral que a criança conhece (compreensão, não leitura) |
| **Manulex** [11] | França | Frequências por série a partir de livros didáticos franceses | Modelo metodológico |
| **CPWD** [12] | Reino Unido | Palavras de livros lidos por crianças de 5 a 9 anos | Modelo metodológico |
| **childLex** [13] | Alemanha | Corpus de cerca de 500 livros infantis alemães, por faixa etária | Modelo metodológico (o mais próximo do ideal) |

- **"Palavras de alta frequência" em português.** As listas de "sight words" do inglês (Dolch, Fry) **não se transpõem**: no PB, quase todas as palavras funcionais são **decodificáveis**, desde que a criança tenha aprendido a regra da vogal átona final ("o" → [u], "e" → [i]), a nasalização e alguns dígrafos. O que é "irregular" no PB é o **pequeno conjunto** de palavras cuja leitura depende de regras ainda não ensinadas na fase (por exemplo, "que", "não", "muito" [mũj̃tu], "também", "homem"). Esse conjunto deve ser **ensinado de forma explícita e mapeado** (como em Ehri [26]): ler pela parte regular e marcar a parte "ainda não ensinada", sem memorização visual pura.

### 2.4 Fluência

- **Componentes.** Precisão, automaticidade (velocidade) e prosódia [15][17]. Normas de palavras corretas por minuto (PCPM) em inglês: Hasbrouck & Tindal [42]. **Em português, as normas ainda precisam ser obtidas e verificadas.** As avaliações de fluência de redes brasileiras (por exemplo, a avaliação de fluência leitora aplicada em parceria com estados) [43] são o ponto de partida. **(verificar — incerto: instituição responsável e normas publicadas.)** Não se devem transplantar as normas do inglês.
- **Leitura repetida.** Samuels [44] propôs ler o mesmo texto várias vezes até atingir um critério. O NRP [14] concluiu que a leitura oral repetida e guiada, com retorno, melhora reconhecimento de palavras, fluência e compreensão. A meta-análise de Therrien [16] indica que são mais eficazes: **modelo adulto antes da leitura, feedback corretivo e critério de desempenho**, em vez de um número fixo de repetições.
- **Prosódia.** Schwanenflugel et al. [17] relacionaram as características prosódicas (pausas, entonação) à habilidade leitora. A **Multidimensional Fluency Scale** de Zutell & Rasinski [18] avalia expressão, fraseado, fluidez e ritmo numa rubrica simples de 4 níveis. Rasinski [45] sistematizou práticas como leitura em eco, leitura coral e "teatro de leitores".
- **Ler ouvindo e karaokê.** Reitsma [19] comparou leitura guiada, leitura ouvindo e leitura com feedback de fala por computador em iniciantes holandeses: **as condições com apoio auditivo deram ganhos** em relação à leitura independente. Gerbier, Bailly & Bosse [20] estudaram o efeito da **sincronização áudio-visual** (destaque da palavra falada) sobre o olhar e a aprendizagem: o destaque **ajuda a manter o olhar no texto**. **(verificar — incerto: magnitude dos efeitos.)** O "Same Language Subtitling" na Índia (legendas sincronizadas em videoclipes, PlanetRead/Kothari) [46] é a maior aplicação em escala de "karaokê" para alfabetização, com relatos de ganhos de leitura. **(verificar — incerto: referência exata e desenho dos estudos.)** A meta-análise de Wood et al. [47] sobre ferramentas de leitura em voz alta e TTS mostrou efeito positivo **na compreensão** de alunos com dificuldade, ou seja, como **acesso** ao texto, não como treino de decodificação.
- **Tutor que escuta.** O Project LISTEN (Carnegie Mellon) [48] mostrou que um tutor com reconhecimento de fala que **escuta a criança ler** e intervém em erros e hesitações é viável e tem efeitos em leitura. **(verificar — incerto: estudos específicos.)** Esse é o modelo para o modo "ler sozinho" do FONEMA.

### 2.5 Vocabulário e compreensão

- **Camadas de vocabulário** [22]. Camada 1: palavras do dia a dia (casa, bola). Camada 2: palavras de alta utilidade na linguagem escrita e em vários domínios (enorme, cauteloso, perceber). Camada 3: termos de domínio (fotossíntese). O ensino deve focar a camada 2, com **definições amigáveis**, vários contextos e uso ativo.
- **Efeito Mateus** [49]. Quem lê bem lê mais, aprende mais palavras e passa a ler ainda melhor. Daí a urgência de automatizar a decodificação e, ao mesmo tempo, expor a criança a vocabulário rico **pela escuta**.
- **Conhecimento de mundo.** Recht & Leslie [23]: o conhecimento prévio sobre beisebol pesou mais que a habilidade leitora na compreensão e na recordação de um texto sobre beisebol. Hirsch [24] argumenta que a compreensão exige conhecimento de palavras e de mundo, construído por currículo temático.
- **Práticas recomendadas.** O guia IES/WWC de compreensão K–3 [25] recomenda: ensinar estratégias (prever, perguntar, visualizar, monitorar, resumir), ensinar estrutura de texto (narrativo e informativo), conduzir discussões e escolher textos com propósito. O guia de habilidades fundamentais [50] cobre linguagem oral, consciência fonológica, decodificação e leitura conectada com textos decodificáveis.
- **Shanahan.** Em seus trabalhos sobre compreensão e no guia WWC que coordenou [25], recomenda ensinar a ler textos de complexidade crescente com apoio, sem ficar preso ao "nível" do aluno. Para o FONEMA, isso significa que a **leitura em voz alta pelo adulto ou pela voz pode e deve usar textos acima do nível de decodificação**.

### 2.6 Escrita: ditado, ortografia, escrita inventada e traçado

- **Ortografia em pt-BR** (Morais) [30][31]. As dificuldades ortográficas se dividem em **regulares** (diretas, contextuais e morfológico-gramaticais) e **irregulares**. As regulares se ensinam por reflexão e descoberta da regra. As irregulares, pela memorização de palavras frequentes e pelo uso do dicionário. O ditado deve ser **diagnóstico**: classificar cada erro (troca surdo/sonoro, omissão de coda, regra contextual r/rr, c/qu, nasalização, irregular) e não só marcar certo ou errado.
- **Escrita inventada.** Ouellette & Sénéchal [28] mostraram, em estudo experimental, que crianças da pré-escola que escreviam palavras do próprio jeito e recebiam **feedback que mostrava uma grafia um pouco mais avançada** aprenderam a ler melhor do que crianças em treino só fonológico. O estudo longitudinal de 2017 [29] indica que a escrita inventada no jardim de infância prediz leitura e escrita no 1º ano, além da consciência fonológica e do conhecimento de letras. Isso dialoga com a tradição brasileira das hipóteses de escrita (Ferreiro), mas com feedback **explícito** sobre a relação som-letra.
- **Escrita para ler.** A meta-análise de Graham & Hebert [27] encontrou efeitos de escrever (incluindo ensino de ortografia e de construção de frases) sobre a leitura.
- **Traçado à mão × digitação.** Longcamp et al. [32]: crianças de 3 a 5 anos que treinaram **escrevendo à mão** reconheceram melhor as letras do que as que treinaram **digitando**. James & Engelhardt [33]: escrever letras à mão (mais do que digitá-las ou traçá-las sobre um modelo) recrutou em crianças pré-leitoras a rede cerebral de leitura. Kiefer et al. [34], na Alemanha, acharam vantagem da escrita à mão em algumas medidas de leitura e escrita em pré-escolares. Mangen & Velay [35] discutem a **háptica** da escrita: a sensação e o movimento da caneta contribuem para a memória da letra. A meta-análise de Santangelo & Graham [51] mostra que **ensinar caligrafia** melhora a legibilidade, a fluência de escrita e também a qualidade dos textos. **Ponto em aberto:** os estudos comparam principalmente **mão × teclado**. A diferença entre **stylus em tablet × lápis em papel** é menos estudada, e há indícios de que o atrito e a resistência do papel importam. **(verificar — incerto: estudos específicos de stylus.)**
- **Bastão → imprensa → cursiva (debate brasileiro).** A tradição escolar brasileira começa pela **letra bastão (caixa alta)**, mais fácil de traçar com segmentos retos e mais fácil de segmentar visualmente. Depois vem a **letra de imprensa minúscula**, predominante nos livros, e mais tarde a **cursiva**. A obrigatoriedade e o momento da cursiva são debatidos no Brasil. Internacionalmente, a Finlândia deixou de exigir a cursiva no currículo de 2016. **(verificar — incerto: redação da BNCC sobre cursiva e detalhes do caso finlandês.)** Para leitura, o que importa é **reconhecer a minúscula de imprensa cedo**, porque é ela que aparece nos textos.

---

## 3. Implicações práticas para o FONEMA

### 3.1 Biblioteca de textos decodificáveis em pt-BR: como gerar e validar

**a) Modelo de dados por fase (escopo e sequência)**

Cada fase do currículo declara o **inventário de CGF ensinadas** (ver ordem de ensino no doc 02, §5.5) e a **lista de palavras-ferramenta liberadas**. Exemplo de progressão (proposta, a validar com a equipe pedagógica):

| Fase | CGF liberadas (cumulativas) | Estruturas silábicas | Exemplo de texto possível |
|---|---|---|---|
| F1 Letras | a e i o u + m p b t l v (V e CV) | V, CV | "A uva. O ovo. Eu." |
| F2 Sílabas | + d f n s(inicial) j c(+a,o,u) g(+a,o,u) | CV, CVCV | "O pato bebe. A bola é da vovó." |
| F3 Palavras | + vogal átona final (-e = [i], -o = [u]), r intervocálico, til (ã, õ) | CV, CVCV(CV), V nasal | "O leite é do gato. A mão do menino." |
| F4 Frases | + dígrafos ch lh nh rr ss qu gu, s/r/l/n em coda | CVC, nasais (am, em, an...) | "O cachorro corre no quintal." |
| F5 Textos | + encontros CCV (pr, bl, tr...), c/ç/s/ss/z/x (regras), h inicial, acentos | CCV, CCVC, ditongos | Texto narrativo curto de 80 a 150 palavras |

**b) Pipeline de geração**

1. **Léxico-base.** Unir LexPorBR [8] (frequência geral pt-BR), Pinheiro [10] (infantil BR), ESCOLEX [9] (frequência por série; descartar ou mapear grafias e léxico do PE) e o vocabulário de CHILDES-pt [41] (palavras que a criança já **conhece oralmente**). Gerar para cada palavra: transcrição fonológica (G2P próprio para o PB, com variante regional configurável), divisão silábica, lista de CGF usadas e o **"índice de fase"** (a primeira fase em que a palavra fica 100% decodificável).
2. **Corpus próprio.** Coletar e licenciar textos infantis brasileiros, de domínio público e próprios, para montar a frequência por faixa etária, como em Manulex, CPWD e childLex [11][12][13]. Esse é um ativo estratégico.
3. **Geração de textos.** Rascunho por LLM com **restrição dura**: só palavras com índice de fase ≤ fase atual, mais a lista de palavras-ferramenta da fase. Revisão automática (passo 4) e depois **revisão humana obrigatória** (pedagoga + revisor de linguagem), com checagem de sentido, naturalidade, adequação cultural e ausência de estereótipos.
4. **Validador automático (linter de decodificabilidade).** Para cada texto, calcular:
   - % de tokens decodificáveis na fase (meta proposta: ≥ 95% em F1–F2 e ≥ 90% em F3–F4; F5 livre, com palavras novas sinalizadas). **Atenção: os limiares são uma proposta de produto, não um número da literatura** [1][2];
   - % de palavras-ferramenta e quais são;
   - **repetição**: cada CGF nova aparece no mínimo N vezes (por exemplo, ≥ 4) [1];
   - número de palavras, palavras por frase, palavras novas por 100;
   - lista de "palavras fora da fase", para bloquear ou substituir.
5. **Validação com dados.** No piloto, registrar por texto a acurácia da leitura oral (pelo reconhecimento de fala), as PCPM e a taxa de pedidos de ajuda. Textos com acurácia mediana < 90% na fase-alvo voltam para revisão. Esse ciclo calibra os limiares do item 4 com evidência própria.
6. **Metadados por texto:** fase, CGF-foco, palavras-ferramenta, tema (para os conjuntos temáticos de conhecimento), gênero (narrativo/informativo), contagem de palavras, palavras de camada 2 (se houver), áudio TTS com marcações de tempo por palavra.

**c) Dois tipos de texto, dois propósitos**

- **Decodificáveis** (a criança lê): controlados, curtos, com repetição das CGF novas.
- **Textos ricos para escuta** (a voz lê para a criança): livres, com vocabulário de camada 2 e organizados em **conjuntos temáticos** (por exemplo, "animais do cerrado", "o corpo humano", "festas juninas"), para construir conhecimento [22][23][24]. Cada conjunto temático pode ter versões decodificáveis curtas, para que o vocabulário ouvido reapareça mais tarde na leitura autônoma.

### 3.2 Módulo de fluência (karaokê com destaque)

- **Sequência em 4 passos por texto** (inspirada em leitura repetida guiada [14][16] e em Rasinski [45]):
  1. **Ouvir**: modelo de leitura fluente (TTS ou voz gravada) com **destaque sincronizado palavra a palavra**. Nas fases F1 e F2 há opção de destaque **por sílaba**. Os tempos vêm das marcações (timestamps) do motor de TTS ou de alinhamento forçado.
  2. **Ler junto (eco ou coral)**: a voz lê um trecho e a criança repete, ou os dois leem juntos. O destaque segue a voz.
  3. **Ler sozinho**: o destaque **segue a criança**, pelo reconhecimento de fala (modelo "tutor que escuta" [48]). Ao detectar hesitação longa ou erro, a ajuda é graduada: primeiro destacar a sílaba difícil, depois o som da letra, e só no fim ler a palavra.
  4. **Reler** até um critério (por exemplo, ≥ 95% de acurácia e PCPM acima da meta da fase), com teto de 3 a 4 releituras na sessão, para evitar tédio [16].
- **Para evitar a "escuta passiva"** [19][20]: no passo 1, a palavra destacada é **clicável/tocável**, e há micro-checagens ("toque na palavra *bola*"). Os passos 2 e 3 são obrigatórios para avançar de fase.
- **Métricas**: acurácia (%), PCPM, autocorreções e, para prosódia, uma rubrica simplificada derivada de Zutell & Rasinski [18], com pausa em pontuação e entonação de pergunta, estimada pela análise de áudio e marcada como experimental. As **normas de PCPM em pt-BR precisam ser estabelecidas** com dados próprios e fontes brasileiras [43]. Não usar Hasbrouck & Tindal [42] como meta.
- **Acessibilidade:** para crianças com dificuldade persistente, o modo "ouvir" funciona como **acesso** ao conteúdo [47], mas sem substituir a prática de decodificação.

### 3.3 Módulo de vocabulário e compreensão

- Em cada texto de escuta: de 3 a 5 palavras de camada 2 [22], com **definição amigável** gravada, imagem e dois ou três contextos novos. Revisitar essas palavras em sessões seguintes (repetição espaçada).
- Perguntas antes, durante e depois da leitura: literais, inferenciais e de vocabulário. Reconto oral gravado. Organizador gráfico simples de estrutura narrativa (quem, onde, problema, solução) [25].
- Progressão por **conjuntos temáticos**, com acompanhamento do "mapa de conhecimento" da criança [23][24].

### 3.4 Módulo de escrita, ditado e traçado

- **Traçado:** com stylus ou dedo no tablet e versão para imprimir em papel. Ordem proposta: **bastão (caixa alta) → minúscula de imprensa** logo em seguida (é ela que a criança lê nos textos) → **cursiva opcional**, configurável pela escola ou família, de acordo com o debate brasileiro. Mostrar a **direção e a ordem dos traços**, avaliar a forma do traçado e preferir **traçado livre a "cobrir pontilhado"** [33]. **Não usar teclado** como forma principal de produção de letras nas fases F1–F2 [32][34]. Recomendar stylus quando houver.
- **Escrita inventada com feedback** [28][29]: a criança ouve uma palavra, escreve do jeito dela (montando letras ou à mão) e o sistema mostra **uma grafia um passo mais avançada**, sem marcar como "errado" na educação infantil.
- **Ditado diagnóstico** (a partir do 1º ano): palavras e frases geradas da mesma base lexical da fase. O corretor classifica os erros pelas categorias de Morais [30][31] (regular direta, contextual, morfológica, irregular) e pelos erros típicos do doc 02 §6.3 (surdo/sonoro, omissão de coda, apoio na oralidade). O relatório para o professor mostra **quais regras** ainda não foram consolidadas, não só a nota.
- **Ortografia irregular:** listas pequenas e frequentes, com estratégia de mapeamento (ler a parte regular e destacar a parte arbitrária) [26].

### 3.5 Próximos passos de pesquisa (o que verificar)

1. Conferir on-line **todas** as referências da seção 5 (DOI, volume, páginas).
2. Confirmar com fontes primárias os materiais do **Tempo de Aprender**, do **Instituto Alfa e Beto** e o que é o "**Ensino Estruturado**".
3. Verificar a disponibilidade e a licença de **LexPorBR**, **ESCOLEX** e da lista de **Pinheiro**. Procurar corpora infantis pt-BR mais recentes.
4. Buscar normas brasileiras de fluência (PCPM por ano) e a avaliação de fluência usada pelas redes.
5. Buscar estudos de **stylus × lápis** e de karaokê com crianças lusófonas.

---

## 4. Riscos e cuidados

- **Texto decodificável "artificial"** ("O boi viu a uva do boi"): reduzir com revisão humana e com geração orientada a histórias curtas com sentido [1][5].
- **Variação regional** na leitura de vogais átonas, "s" em coda, "r" e "t/d" antes de [i]: o reconhecimento de fala e o validador **não podem** marcar variante dialetal como erro (ver doc 02).
- **Ficar tempo demais nos decodificáveis**: definir saída da fase por desempenho e oferecer textos livres cedo [6][7].
- **Licenciamento:** bases lexicais e textos infantis podem ter restrições de uso comercial. Verificar antes de incorporar.

---

## 5. Referências

> Todas as entradas estão **"(verificar)"**: não foram conferidas on-line nesta sessão (ver Nota de método). As marcadas **"incerto"** têm dúvida específica sobre algum detalhe. DOIs só aparecem quando havia alta confiança, e mesmo assim precisam ser conferidos.

| n | Autor(es) | Ano | Título | País | Tipo | URL/DOI | O que aproveitar |
|---|---|---|---|---|---|---|---|
| 1 | Cheatham, J. P.; Allor, J. H. | 2012 | The influence of decodability in early reading text on reading achievement: a review of the evidence. *Reading and Writing*, 25 | EUA | Revisão | buscar DOI (verificar) | Evidência modesta a favor; importância de repetição e controle de vocabulário |
| 2 | Mesmer, H. A. E. | 2001 | Decodable text: a review of what we know. *Reading Research and Instruction*, 40(2) | EUA | Revisão | buscar (verificar) | Definição de decodificabilidade relativa ao currículo |
| 3 | Mesmer, H. A. E. | 2005 | Text decodability and the first-grade reader. *Reading & Writing Quarterly*, 21(1) | EUA | Experimento | buscar (verificar) | Mais acurácia e mais estratégia fônica com textos decodificáveis |
| 4 | Juel, C.; Roper-Schneider, D. | 1985 | The influence of basal readers on first grade reading. *Reading Research Quarterly*, 20(2) | EUA | Estudo empírico | buscar (verificar) | O tipo de texto molda a estratégia de leitura |
| 5 | Price-Mohr, R.; Price, C. | 2020 | A comparison of children aged 4–5 years learning to read through instructional texts containing either a high or a low proportion of phonically-decodable words. *Early Childhood Education Journal*, 48 | Reino Unido | Experimento | buscar (verificar — incerto) | Contraponto no debate recente |
| 6 | Castles, A.; Rastle, K.; Nation, K. | 2018 | Ending the reading wars: reading acquisition from novice to expert. *Psychological Science in the Public Interest*, 19(1) | Austrália/RU | Revisão | 10.1177/1529100618772271 (verificar) | Fônica no início e depois exposição ampla; papel dos decodificáveis |
| 7 | Seymour, P. H. K.; Aro, M.; Erskine, J. M. | 2003 | Foundation literacy acquisition in European orthographies. *British Journal of Psychology*, 94(2) | RU/Europa (inclui Portugal) | Estudo comparativo | buscar (verificar) | Ortografias transparentes aceleram a decodificação; posição do português |
| 8 | Estivalet, G. L.; Meunier, F. | 2015 | The Brazilian Portuguese Lexicon: an instrument for psycholinguistic research. *PLoS ONE*, 10(12) | Brasil/França | Base lexical | 10.1371/journal.pone.0144016 (verificar) | Frequências e variáveis do léxico pt-BR (LexPorBR) |
| 9 | Soares, A. P. et al. | 2014 | ESCOLEX: a grade-level lexical database from European Portuguese elementary to middle school textbooks. *Behavior Research Methods*, 46 | Portugal | Base lexical | buscar DOI (verificar) | Frequência por ano escolar; modelo de desenho |
| 10 | Pinheiro, Â. M. V. | 1996 | Contagem de frequência de ocorrência de palavras expostas a crianças na faixa pré-escolar e séries iniciais do 1º grau | Brasil | Lista de frequência | buscar (verificar — incerto: editora e disponibilidade) | Âncora de frequência infantil brasileira |
| 11 | Lété, B.; Sprenger-Charolles, L.; Colé, P. | 2004 | MANULEX: a grade-level lexical database from French elementary school readers. *Behavior Research Methods, Instruments & Computers*, 36(1) | França | Base lexical | buscar (verificar) | Modelo metodológico de frequência por série |
| 12 | Masterson, J.; Stuart, M.; Dixon, M.; Lovejoy, S. | 2010 | Children's printed word database: continuities and changes over time in children's early reading vocabulary. *British Journal of Psychology*, 101(2) | Reino Unido | Base lexical | buscar (verificar) | Modelo de corpus de livros infantis |
| 13 | Schroeder, S.; Würzner, K.-M.; Heister, J.; Geyken, A.; Kliegl, R. | 2015 | childLex: a lexical database of German read by children. *Behavior Research Methods*, 47(4) | Alemanha | Base lexical | buscar (verificar) | Desenho ideal de corpus infantil por faixa etária |
| 14 | National Reading Panel (NICHD) | 2000 | Teaching Children to Read: an evidence-based assessment… (Report of the National Reading Panel) | EUA | Relatório/meta-análises | nichd.nih.gov (buscar) (verificar) | Leitura oral repetida e guiada; 5 componentes |
| 15 | Kuhn, M. R.; Stahl, S. A. | 2003 | Fluency: a review of developmental and remedial practices. *Journal of Educational Psychology*, 95(1) | EUA | Revisão | buscar (verificar) | Leitura assistida e repetida |
| 16 | Therrien, W. J. | 2004 | Fluency and comprehension gains as a result of repeated reading: a meta-analysis. *Remedial and Special Education*, 25(4) | EUA | Meta-análise | buscar (verificar) | Modelo adulto, feedback e critério de desempenho |
| 17 | Schwanenflugel, P. J. et al. | 2004 | Becoming a fluent reader: reading skill and prosodic features in the oral reading of young readers. *Journal of Educational Psychology*, 96(1) | EUA | Estudo empírico | buscar (verificar) | Prosódia como parte da fluência |
| 18 | Zutell, J.; Rasinski, T. V. | 1991 | Training teachers to attend to their students' oral reading fluency. *Theory Into Practice*, 30(3) | EUA | Instrumento (MFS) | buscar (verificar) | Rubrica de prosódia |
| 19 | Reitsma, P. | 1988 | Reading practice for beginners: effects of guided reading, reading-while-listening, and independent reading with computer-based speech feedback. *Reading Research Quarterly*, 23(2) | Países Baixos | Experimento | buscar (verificar) | Evidência de ler ouvindo e de feedback de fala |
| 20 | Gerbier, E.; Bailly, G.; Bosse, M.-L. | 2018 | Audio–visual synchronization in reading while listening to texts: effects on visual behavior and verbal learning. *Computer Speech & Language*, 47 | França | Experimento | buscar (verificar — incerto) | Destaque sincronizado mantém o olhar no texto |
| 21 | Gough, P. B.; Tunmer, W. E. | 1986 | Decoding, reading, and reading disability. *Remedial and Special Education*, 7(1) | EUA/Nova Zelândia | Teórico | buscar (verificar) | Visão Simples da Leitura |
| 22 | Beck, I. L.; McKeown, M. G.; Kucan, L. | 2013 | Bringing Words to Life: Robust Vocabulary Instruction (2ª ed.). Guilford | EUA | Livro | buscar (verificar) | Palavras de camada 2; definições amigáveis |
| 23 | Recht, D. R.; Leslie, L. | 1988 | Effect of prior knowledge on good and poor readers' memory of text. *Journal of Educational Psychology*, 80(1) | EUA | Experimento | buscar (verificar) | Conhecimento prévio pesa mais que a habilidade leitora |
| 24 | Hirsch, E. D., Jr. | 2003 | Reading comprehension requires knowledge — of words and the world. *American Educator*, 27(1) | EUA | Ensaio | aft.org (buscar) (verificar) | Currículo temático de conhecimento |
| 25 | Shanahan, T. et al. (IES/WWC) | 2010 | Improving Reading Comprehension in Kindergarten Through 3rd Grade (NCEE 2010-4038) | EUA | Guia de prática | ies.ed.gov (buscar) (verificar) | Estratégias, estrutura de texto, discussão |
| 26 | Ehri, L. C. | 2014 | Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. *Scientific Studies of Reading*, 18(1) | EUA | Revisão teórica | buscar (verificar) | Mapeamento ortográfico; ensino de palavras irregulares |
| 27 | Graham, S.; Hebert, M. | 2010 | Writing to Read: Evidence for How Writing Can Improve Reading. Carnegie Corporation / Alliance for Excellent Education | EUA | Meta-análise/relatório | buscar (verificar) | Escrever melhora a leitura |
| 28 | Ouellette, G.; Sénéchal, M. | 2008 | Pathways to literacy: a study of invented spelling and its role in learning to read. *Child Development*, 79(4) | Canadá | Experimento | buscar (verificar) | Escrita inventada com feedback mais avançado |
| 29 | Ouellette, G.; Sénéchal, M. | 2017 | Invented spelling in kindergarten as a predictor of reading and spelling in Grade 1: a new pathway to literacy, or just the same road, less known? *Developmental Psychology*, 53(1) | Canadá | Longitudinal | buscar (verificar) | Valor preditivo da escrita inventada |
| 30 | Morais, A. G. de | 1998 | Ortografia: ensinar e aprender. São Paulo: Ática | Brasil | Livro | — (verificar) | Categorias regular/irregular; ditado diagnóstico |
| 31 | Morais, A. G. de | 2012 | Sistema de escrita alfabética. São Paulo: Melhoramentos | Brasil | Livro | — (verificar) | Apropriação do SEA; consciência fonológica e escrita |
| 32 | Longcamp, M.; Zerbato-Poudou, M.-T.; Velay, J.-L. | 2005 | The influence of writing practice on letter recognition in preschool children: a comparison between handwriting and typing. *Acta Psychologica*, 119(1) | França | Experimento | buscar (verificar) | Escrita à mão > digitação para reconhecer letras |
| 33 | James, K. H.; Engelhardt, L. | 2012 | The effects of handwriting experience on functional brain development in pre-literate children. *Trends in Neuroscience and Education*, 1(1) | EUA | Neuroimagem | buscar (verificar) | Traçado livre ativa a rede de leitura (mais que digitar ou cobrir modelo) |
| 34 | Kiefer, M. et al. | 2015 | Handwriting or typewriting? The influence of pen- or keyboard-based writing training on reading and writing performance in preschool children. *Advances in Cognitive Psychology*, 11(4) | Alemanha | Experimento | buscar (verificar) | Vantagem parcial da escrita à mão |
| 35 | Mangen, A.; Velay, J.-L. | 2010 | Digitizing literacy: reflections on the haptics of writing. In *Advances in Haptics* (InTech) | Noruega/França | Capítulo teórico | buscar (verificar) | Háptica da escrita; tela × papel |
| 36 | Share, D. L. | 1995 | Phonological recoding and self-teaching: sine qua non of reading acquisition. *Cognition*, 55(2) | Israel | Teórico | buscar (verificar) | Hipótese do autoensino |
| 37 | Brasil. MEC/Sealf | 2019 | PNA — Política Nacional de Alfabetização (caderno) | Brasil | Documento oficial | gov.br/mec (buscar) (verificar) | Síntese em pt dos componentes; revogada em 2023 |
| 38 | Brasil. MEC/Sealf | 2020 | Relatório Nacional de Alfabetização Baseada em Evidências (RENABE) | Brasil | Relatório | gov.br/mec (buscar) (verificar) | Revisões em pt de fluência, vocabulário, compreensão e escrita |
| 39 | Brasil. MEC | 2020 | Programa Tempo de Aprender | Brasil | Programa federal | gov.br/mec (buscar) (verificar — incerto) | Verificar se há livros decodificáveis e recursos |
| 40 | Instituto Alfa e Beto | — | Programa Alfa e Beto e materiais de leitura graduada | Brasil | Material didático | alfaebeto.org.br (verificar — incerto) | Referência de material fônico estruturado brasileiro |
| 41 | MacWhinney, B. (CHILDES) | 2000 | The CHILDES Project: Tools for Analyzing Talk (3ª ed.), com corpora do português | EUA/internacional | Banco de dados | childes.talkbank.org (verificar) | Vocabulário oral infantil e fala dirigida à criança em português |
| 42 | Hasbrouck, J.; Tindal, G. | 2017 | An update to compiled ORF norms (Technical Report 1702). Univ. of Oregon | EUA | Normas | buscar (verificar) | Modelo de tabela de normas (não usar como meta para o pt-BR) |
| 43 | Avaliação de fluência leitora de redes brasileiras (parcerias estado–terceiro setor) | 2020s | — | Brasil | Avaliação | buscar (verificar — incerto: instituição e normas) | Fonte de normas de PCPM em pt-BR |
| 44 | Samuels, S. J. | 1979 | The method of repeated readings. *The Reading Teacher*, 32(4) | EUA | Artigo seminal | buscar (verificar) | Origem da leitura repetida |
| 45 | Rasinski, T. V. | 2010 | The Fluent Reader (2ª ed.). Scholastic | EUA | Livro | buscar (verificar) | Leitura em eco, coral, teatro de leitores |
| 46 | Kothari, B. et al. (PlanetRead) | 2000s | Same Language Subtitling for literacy (vários estudos) | Índia | Avaliações de programa | planetread.org (verificar — incerto) | "Karaokê" de alfabetização em escala |
| 47 | Wood, S. G.; Moxley, J. H.; Tighe, E. L.; Wagner, R. K. | 2018 | Does use of text-to-speech and related read-aloud tools improve reading comprehension for students with reading disabilities? A meta-analysis. *Journal of Learning Disabilities*, 51(1) | EUA | Meta-análise | buscar (verificar) | TTS como acesso, não como treino |
| 48 | Mostow, J. et al. (Project LISTEN, Carnegie Mellon) | 1990s–2010s | Reading Tutor que escuta a criança ler (vários artigos) | EUA | Sistema/estudos | buscar (verificar — incerto) | Modelo de "ler sozinho com reconhecimento de fala" |
| 49 | Stanovich, K. E. | 1986 | Matthew effects in reading: some consequences of individual differences in the acquisition of literacy. *Reading Research Quarterly*, 21(4) | EUA/Canadá | Teórico | buscar (verificar) | Efeito Mateus |
| 50 | Foorman, B. et al. (IES/WWC) | 2016 | Foundational Skills to Support Reading for Understanding in Kindergarten Through 3rd Grade (NCEE 2016-4008) | EUA | Guia de prática | ies.ed.gov (buscar) (verificar) | Leitura conectada com decodificáveis; recomendações K–3 |
| 51 | Santangelo, T.; Graham, S. | 2016 | A comprehensive meta-analysis of handwriting instruction. *Educational Psychology Review*, 28(2) | EUA | Meta-análise | buscar (verificar) | Ensino de caligrafia melhora legibilidade, fluência e textos |

**Total: 51 referências**, de **12 países**: EUA, Reino Unido, França, Alemanha, Canadá, Brasil, Portugal, Países Baixos, Noruega, Israel, Índia, Austrália (mais Nova Zelândia em coautoria).
