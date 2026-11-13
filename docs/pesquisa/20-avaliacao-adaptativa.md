# 20 — Avaliação, diagnóstico e personalização adaptativa

> Frente de pesquisa 20 de 30 · Projeto FONEMA (plataforma web + app de alfabetização fônica, pt-BR, guia "Sofia").
> Data da pesquisa: novembro/2026.
>
> **Nota de verificação (importante):** durante esta frente, o limite de buscas web da sessão foi atingido no meio do trabalho e o acesso direto a vários sites (gov.uk, Wikipedia, Reading Rockets, Acadience) estava bloqueado pela rede da sessão. Por isso a tabela final usa duas marcas:
> - **V** = localizada e confirmada por busca web nesta pesquisa (título, autoria/ano e URL conferidos no resultado);
> - **C** = referência clássica e amplamente citada na literatura, incluída a partir de conhecimento consolidado; DOI/editora informados apenas quando há alta confiança. **Antes de publicar qualquer material externo, conferir as referências C** (sobretudo os instrumentos brasileiros e os valores numéricos de normas).
> Nenhum DOI ou URL foi inventado; onde não havia certeza, o campo ficou como "editora / ver catálogo".

---

## 1. Resumo executivo

1. **O que medir já está bem definido no mundo.** Os instrumentos de triagem de alfabetização inicial convergem para o mesmo núcleo: **consciência fonológica/fonêmica**, **conhecimento letra-som**, **decodificação de palavras e pseudopalavras**, **fluência de leitura oral (palavras corretas por minuto)** e **compreensão** — é o desenho do EGRA (RTI/USAID, adaptado a mais de 100 línguas) [1], do DIBELS 8 [2][3], do Acadience [36] e do aimsweb [37]. O FONEMA deve copiar essa anatomia, adaptada ao português.
2. **Pseudopalavras são o "teste da verdade" da fônica.** O Phonics Screening Check inglês (40 itens, metade pseudopalavras; nota de corte 32/40 de 2012 a 2025, reportadamente 31 em 2026) [5][6][7] e o subteste NWF do DIBELS 8 [2][3] isolam decodificação de memorização visual. As **provinhas letra a letra** do FONEMA devem sempre incluir pseudopalavras.
3. **O Brasil tem um alvo nacional claro: 743 pontos na escala Saeb do 2º ano.** A Pesquisa Alfabetiza Brasil (Inep, 2023) definiu esse ponto de corte para "criança alfabetizada"; o Indicador Criança Alfabetizada (ICA) é calculado com avaliações estaduais articuladas ao Saeb (16 itens de múltipla escolha + 3 de resposta construída, um deles produção de texto). Resultado: 56% (2023) → 59,2% (2024, abaixo da meta de 60%) → 66% reportado para 2025; meta de 80% em 2030 [16][17][18][19][20]. Os relatórios do FONEMA devem "falar a língua" desse padrão.
4. **A Provinha Brasil (2008–~2016) foi o precedente de avaliação diagnóstica não classificatória do 2º ano** [21][22]; seu espírito ("diagnóstico para o professor, sem nota") é exatamente o que o FONEMA quer, mas agora contínuo e digital.
5. **Instrumentos clínicos brasileiros existem, mas são de uso restrito/pago** (CONFIAS, Prova de Consciência Fonológica de Capovilla, TCLPP, TDE-II, PROLEC adaptado) [29]–[34]. Servem como **referência de construto e de validação externa** (correlacionar o diagnóstico do app com eles num estudo-piloto), não para serem copiados — vários são testes psicológicos com restrição de uso.
6. **Normas de fluência:** os EUA têm normas robustas (Hasbrouck & Tindal 2017: mediana ≈ 60 PCPM no fim do 1º ano, ≈ 100 no fim do 2º, ≈ 112 no fim do 3º) [4]. **O Brasil não tem normas nacionais públicas equivalentes** de grande escala; os valores americanos não se transferem diretamente (o português é mais transparente — precisão chega antes [26] — mas as palavras são mais longas). Proposta: metas provisórias + calibração com dados próprios.
7. **Modelo de aluno recomendado: Elo hierárquico por habilidade fônica, com "gate" de domínio inspirado em BKT.** Pelánek mostra que o Elo é simples, robusto e quase tão preciso quanto modelos mais caros para sistemas adaptativos [8][45]; o Math Garden holandês usa a mesma ideia em escala [23]. O BKT (Corbett & Anderson) [9] dá a semântica de "probabilidade de domínio" e o Deep Knowledge Tracing [10] só compensa quando houver muitos dados — fica para uma fase 2.
8. **Avaliação "invisível" (stealth assessment)** [11][12] e o **Evidence-Centered Design** [27] dão o método para transformar cada jogo em evidência válida: definir o que cada ação do jogo prova sobre cada habilidade antes de desenhar o jogo.
9. **Estrutura de pré-requisitos** (Knowledge Space Theory / ALEKS) [13][14][15] resolve o diagnóstico inicial rápido: ao saber que a criança lê "lh", inferimos que domina vogais e consoantes simples, sem testar tudo — 20–30 perguntas no ALEKS; no FONEMA, **~12–15 minutos divididos em 3 sessões curtas**.
10. **Domínio precisa de critério alto e de retenção.** Mastery learning (Bloom [24]; meta-análise de Kulik et al. [25]) só funciona com critério exigente (80–90%) e reteste espaçado. Proposta: passar de fase com **P(domínio) ≥ 0,95, ≥ 85% de acerto na provinha incluindo pseudopalavras, latência dentro do alvo e confirmação após ≥ 24 h**.

---

## 2. Achados

### 2.1 Instrumentos internacionais de leitura inicial

**EGRA — Early Grade Reading Assessment (RTI/USAID).** Avaliação oral individual, aplicada em ~15 minutos, criada em 2006 com financiamento do Banco Mundial e USAID; toolkit 2ª edição (2016, 225 p.) é obrigatório em aplicações financiadas pela USAID e foi adaptado a mais de 100 línguas [1]. Subtarefas típicas: conhecimento de letras/sons (cronometrado, 1 minuto), consciência fonêmica (som inicial, segmentação), leitura de palavras familiares, **decodificação de pseudopalavras**, leitura oral de texto (fluência) com perguntas de compreensão, compreensão oral e ditado. Pontos fortes para o FONEMA: (a) modelo de **adaptação linguística** (não traduzir, reconstruir com frequência de letras e palavras da língua); (b) medidas **cronometradas** de 60 s que viram "corretos por minuto", fáceis de repetir no app. Ressalva: o EGRA é feito para avaliação de sistemas, não de diagnóstico individual fino.

**DIBELS 8ª edição (Universidade de Oregon, 2018–2020).** Medidas de 1 minuto: Letter Naming Fluency, Phonemic Segmentation Fluency, **Nonsense Word Fluency** (sons corretos de letras e palavras recodificadas), Word Reading Fluency, Oral Reading Fluency e Maze (compreensão). As metas de benchmark foram atualizadas em julho/2020 com dados de cerca de um milhão de alunos [2]. Mudanças relevantes do DIBELS 8: no NWF a criança recebe crédito por ler a pseudopalavra inteira mesmo sem soletrar som a som, e o NWF passou a considerar a frequência dos padrões ortográficos [2][3]. Lição para o app: **pontuar duas camadas** (sons corretos e palavra inteira decodificada) — mostra a transição de "soletrando" para "lendo".

**Acadience Reading (antigo DIBELS Next) e aimsweb Plus.** Mesma família de medidas curriculares (CBM) de 1 minuto, com benchmarks três vezes ao ano e monitoramento de progresso [36][37]. O conceito-chave é a **classificação de risco em três faixas** (no alvo / abaixo do alvo / bem abaixo — suporte intensivo), base dos sistemas RTI/MTSS. O FONEMA pode usar a mesma lógica em semáforo.

**Fluência de leitura oral como indicador geral.** Fuchs et al. (2001) mostraram que palavras corretas por minuto em leitura oral é um indicador robusto da competência leitora geral, correlacionando fortemente com compreensão nos anos iniciais [28]. É por isso que todos os sistemas acima usam ORF.

**Normas de Hasbrouck & Tindal (2017).** Relatório técnico nº 1702 (BRT, Universidade de Oregon), compilando dados de DIBELS, DIBELS Next e easyCBM para 1º–6º ano e comparando com as normas de 2006 [4]. Valores de referência (percentil 50, palavras corretas por minuto — **conferir no PDF antes de publicar**):

| Série (EUA) | Outono | Inverno | Primavera |
|---|---|---|---|
| 1º ano | — | ≈ 29 | ≈ 60 |
| 2º ano | ≈ 50 | ≈ 84 | ≈ 100 |
| 3º ano | ≈ 83 | ≈ 97 | ≈ 112 |

Os autores recomendam que alunos abaixo do percentil ~40 (≈ 10 PCPM abaixo da mediana) recebam atenção e que a fluência seja sempre lida junto com a **precisão** (acurácia) [4].

**Phonics Screening Check (Inglaterra, desde 2012).** 40 palavras lidas para o professor no fim do Year 1 (≈ 6 anos), cerca de metade pseudopalavras ("alien words", ilustradas com um alienígena para a criança não buscar significado). Nota de corte 32/40 de 2012 a 2025, divulgada às escolas só depois da aplicação desde 2014 [5][6]; reportagem secundária indica corte de 31 em 2026 (a confirmar no gov.uk) [7]. Lições: (a) **itens organizados por complexidade** (CVC simples → dígrafos → encontros consonantais → padrões complexos); (b) pseudopalavras com personagem lúdico (no FONEMA: "palavras do planeta da Sofia"); (c) resultado binário para política pública + perfil por tipo de grafema para o professor.

**CTOPP-2 e TOWRE-2 (EUA).** CTOPP-2 avalia processamento fonológico em três compostos — consciência fonológica, memória fonológica e **nomeação rápida (RAN)** [38]; TOWRE-2 mede eficiência de leitura de palavras e pseudopalavras em 45 s [39]. Para o FONEMA: incluir uma tarefa breve de **RAN** (nomear cores/objetos/letras o mais rápido possível) como sinal de risco de dislexia, e medir **leitura de pseudopalavras com tempo** (eficiência, não só precisão).

**PIRLS (IEA).** Avalia compreensão leitora no 4º ano em dezenas de países a cada 5 anos [40]. É útil como **teto conceitual** (propósitos de leitura: literária e informativa; processos: localizar, inferir, interpretar, avaliar) para os relatórios de compreensão nas fases finais do FONEMA.

### 2.2 Ortografia transparente muda as metas

Seymour, Aro & Erskine (2003) compararam 13 ortografias europeias: crianças de ortografias regulares atingem leitura precisa no fim do 1º ano escolar; o inglês demora bem mais; o português ficou em posição intermediária [26]. Share (2008) alerta que a ciência da leitura é "anglocêntrica" e que normas e modelos do inglês não devem ser transpostos sem ajuste [35]. Consequências para o FONEMA:
- **Precisão de decodificação** deve ser exigida mais cedo e mais alta (≥ 90–95% em palavras regulares até o fim do 1º ano).
- **Velocidade** em PCPM não é comparável diretamente (palavras do português têm mais sílabas). Recomenda-se registrar também **sílabas por minuto** internamente e calibrar metas próprias.
- O diferencial diagnóstico em português está nas **regras contextuais** (c/qu, g/gu, r/rr, s/ss/ç, m/n antes de consoante, nasalização, x) — é aí que a escala precisa de mais itens.

### 2.3 Avaliação de alfabetização no Brasil

**Saeb — Avaliação de Alfabetização (2º ano).** Avalia leitura e escrita em Língua Portuguesa no fim do 2º ano. A **Pesquisa Alfabetiza Brasil** (Inep, 2023) definiu o ponto de corte de **743 pontos** na escala Saeb como padrão de "criança alfabetizada"; o padrão expressa que a criança lê e escreve palavras, frases e textos curtos [16][17][20]. O **Indicador Criança Alfabetizada (ICA)** do Compromisso Nacional Criança Alfabetizada usa avaliações estaduais articuladas ao Saeb: cada aluno responde 16 itens de múltipla escolha e 3 de resposta construída (um de produção textual) [17]. Resultados: ~56% (2023), 59,2% (2024; meta era 60%; Ceará com 85,3%) e 66% reportado para 2025 (meta de 64% superada em 2 p.p., segundo nota técnica do Todos pela Educação); meta nacional de 80% em 2030 [17][18][19]. Fundação Lemann e outros atores usam o mesmo padrão em apresentações ao Congresso [20].

**Provinha Brasil.** Instituída em 2007 (Portaria nº 10), aplicada a partir de 2008 no 2º ano, elaborada pelo Inep e distribuída às redes; tinha caráter **diagnóstico e não classificatório** (sem nota), com aplicação no início e no fim do ano e devolutiva por níveis de desempenho ao professor [21][22]. Deixou de ser aplicada na segunda metade da década de 2010, com a avaliação da alfabetização migrando para a ANA e depois para o Saeb 2º ano (a data/ato exato não foi confirmado nesta pesquisa). Para o FONEMA, a Provinha é o melhor modelo nacional de **devolutiva pedagógica por níveis**, e o nome "provinha" já é familiar a professores.

**Avaliações estaduais (CAEd/UFJF, SPAECE-Alfa/Ceará-PAIC e outras).** O CAEd/UFJF opera avaliações estaduais de alfabetização e fluência para várias redes; o Ceará (PAIC, SPAECE-Alfa) é o caso de maior sucesso (85,3% no ICA 2024) [17][41]. Elementos aproveitáveis: escala única comum entre anos, **níveis descritivos** ("não alfabetizado / alfabetização incompleta / intermediário / suficiente / desejável" no SPAECE-Alfa) e **avaliação de fluência por gravação** com níveis de leitor (pré-leitor → leitor iniciante → leitor fluente) — confirmar nomenclatura atual no CAEd.

**Instrumentos clínicos e de pesquisa (Brasil):**
- **CONFIAS** (Moojen et al., 2003): consciência fonológica em nível silábico e fonêmico, com relação explícita com os níveis de escrita da psicogênese [30].
- **Prova de Consciência Fonológica por produção oral** (Capovilla & Capovilla): dez subtestes (síntese, segmentação, manipulação, transposição silábica e fonêmica, rima, aliteração), com normas da pré-escola à 2ª série [31].
- **TCLPP — Teste de Competência de Leitura de Palavras e Pseudopalavras** (Seabra & Capovilla): 70 pares figura-palavra com itens corretos e distratores (trocas visuais, fonológicas, pseudopalavras homófonas e estranhas), que permitem inferir **qual rota de leitura falha** (logográfica, fonológica, lexical) [32]. Excelente modelo para itens de "toque na palavra certa" no app.
- **TDE-II** (Stein, Giacomoni & Fonseca, 2019): desempenho escolar em escrita, aritmética e leitura, 1º ao 9º ano [33].
- **PROLEC** (original espanhol de Cuetos et al.; adaptação brasileira de Capellini, Oliveira & Cuetos): processos de leitura — identificação de letras, processos léxicos (palavras/pseudopalavras), sintáticos e semânticos [34].
- **Psicogênese da língua escrita** (Ferreiro & Teberosky): níveis pré-silábico, silábico (sem/com valor sonoro), silábico-alfabético e alfabético [29]. Muito usado por professores brasileiros; o FONEMA pode **traduzir** o resultado da escrita (montagem de palavras/ditado) para essa linguagem no relatório ao professor, sem adotar a teoria como método.

### 2.4 Psicometria para app: TRI, CAT e calibração contínua

- **TRI (Teoria de Resposta ao Item).** Modela a probabilidade de acerto como função da habilidade do aluno (θ) e de parâmetros do item (dificuldade b, discriminação a, acerto ao acaso c) [42]. É a mesma base da escala Saeb, o que permite, no futuro, **ancorar a escala do FONEMA à escala Saeb** com itens de ligação.
- **CAT (testes adaptativos computadorizados).** Escolhe o próximo item que maximiza informação na habilidade estimada; reduz o número de itens pela metade ou mais com a mesma precisão; para por erro-padrão alvo ou número máximo de itens [43]. Para crianças de 5–7 anos, recomenda-se **CAT multiestágio** (blocos curtos de 4–6 itens por rota), mais robusto com banco pequeno e com reconhecimento de fala ruidoso.
- **Calibração "on the fly".** Bancos de itens novos não têm parâmetros de TRI estimados. Klinkenberg, Straatemeier & van der Maas (2011), no Math Garden (Países Baixos), usaram um sistema derivado do Elo para estimar **simultaneamente** habilidade do aluno e dificuldade do item durante o uso, incorporando tempo de resposta no escore [23]. Pelánek (2016) sistematiza variantes do Elo em educação (com função de incerteza K decrescente com nº de tentativas, Elo multivariado por conceito) e mostra que é simples, robusto e eficaz [8]. Pelánek (2017) compara BKT, modelos logísticos (AFM, PFA) e Elo e conclui que modelos logísticos/Elo costumam ser preferíveis em sistemas práticos [45].

### 2.5 Modelagem do aluno

- **BKT — Bayesian Knowledge Tracing** (Corbett & Anderson, 1994/95): cada habilidade é um estado oculto binário (domina/não domina), com quatro parâmetros (conhecimento inicial, aprendizagem, chute, deslize); a tutoria passa de habilidade quando P(domínio) ≥ 0,95 [9]. Extensões contextualizam chute/deslize [44]. Vantagem: semântica clara de "domínio" para relatórios. Limitações: não modela esquecimento nem diferença de dificuldade entre itens da mesma habilidade.
- **Elo / modelos logísticos:** tratam a resposta como uma "partida" aluno × item [8][23]. Modelam dificuldade por item (crucial: "pato" e "prato" exercitam p, mas têm dificuldades diferentes), atualizam em tempo real, custo computacional mínimo (roda no dispositivo, offline).
- **DKT — Deep Knowledge Tracing** (Piech et al., 2015): redes recorrentes, sem codificação manual de habilidades, ganho relatado de 25% em AUC num benchmark [10]. Requer grandes volumes de dados e é pouco interpretável — **não recomendado para o lançamento**; candidato a fase 2 para prever risco e sugerir sequência.
- **Knowledge Space Theory / ALEKS** (Doignon & Falmagne): o domínio é um conjunto de itens com relação de pré-requisitos; o "estado de conhecimento" do aluno é um subconjunto viável; o ALEKS avalia com ~20–30 perguntas adaptativas e define "o que o aluno está pronto para aprender" (a "franja externa") [13][14][15]. A confiabilidade do ALEKS foi estudada com mais de 700 mil avaliações reais [14]. No FONEMA, o grafo de pré-requisitos fônicos (vogais → consoantes contínuas → oclusivas → sílabas CV → dígrafos → CCV/CVC → regras contextuais) funciona como espaço de conhecimento simplificado.

### 2.6 Avaliação formativa, invisível e ECD

- **Avaliação formativa** tem efeito expressivo sobre a aprendizagem quando gera feedback acionável (Black & Wiliam, 1998) [46].
- **Stealth assessment** (Shute, 2011; Shute & Ventura, 2013): avaliação embutida no jogo, sem que a criança perceba que está sendo testada, reduzindo ansiedade e usando os dados para adaptar o conteúdo [11][12]. Baseia-se no **Evidence-Centered Design** (Mislevy, Steinberg & Almond, 2003): modelo de competência (o que queremos saber) → modelo de evidência (que comportamentos provam) → modelo de tarefa (que atividade provoca esses comportamentos) [27].
- **Mastery learning** (Bloom): com critério de domínio e correção, alunos médios aproximam-se dos melhores ("2 sigma" com tutoria + domínio) [24]; meta-análise de Kulik, Kulik & Bangert-Drowns (1990) encontrou efeitos positivos consistentes, maiores com critérios de domínio mais altos [25].

### 2.7 Learning analytics e dashboards

Siemens & Long (2011) definem learning analytics como medição, coleta, análise e relato de dados sobre aprendizes para entender e otimizar a aprendizagem [47]. Verbert et al. (2013) revisaram painéis de learning analytics e destacam consciência, reflexão e *sensemaking* como objetivos — painéis só ajudam se levam a uma **ação** [48]. Implicação: cada indicador no painel do professor deve vir com "o que fazer agora".

### 2.8 Teoria do desenvolvimento usada para ordenar habilidades

Simple View of Reading (Gough & Tunmer, 1986): compreensão = decodificação × compreensão oral [49]. Ehri (2005): fases pré-alfabética → alfabética parcial → plena → consolidada; o mapeamento ortográfico depende de consciência fonêmica + correspondências letra-som [50]. O FONEMA deve **medir os dois fatores** (decodificação e compreensão oral) desde o início, para distinguir dificuldade de decodificação de dificuldade de linguagem.

---

## 3. Proposta de sistema de avaliação do FONEMA

### 3.1 Princípios

1. **Diagnóstico para ensinar, não para rotular** (herança da Provinha Brasil [21]). Nenhum resultado individual aparece como "nota"; aparece como "o que a criança já sabe / o que vem a seguir".
2. **Evidência antes do jogo (ECD)** [27]: cada mecânica de jogo declara qual habilidade gera evidência e com que peso.
3. **Duas camadas de medida:** precisão (acertou?) e **automaticidade** (em quanto tempo?) — como DIBELS/TOWRE [2][39].
4. **Pseudopalavras obrigatórias** em toda checagem de decodificação [5][2].
5. **Reconhecimento de fala com humildade:** resposta oral com baixa confiança do ASR nunca conta como erro; vira item "não pontuado" e, se repetido, pede confirmação por toque ou pelo adulto.
6. **Proteção de dados de crianças (LGPD art. 14):** áudios processados preferencialmente no dispositivo, retenção mínima, consentimento do responsável.

### 3.2 Mapa de habilidades (o "espaço de conhecimento" do FONEMA)

~70 habilidades em 7 domínios, com grafo de pré-requisitos:

| Domínio | Exemplos de habilidades (nós) | Tipo de evidência |
|---|---|---|
| A. Consciência fonológica | rima; contar sílabas; sílaba inicial; fonema inicial; síntese de fonemas; segmentação; supressão | toque em figura, fala |
| B. Letra-som (por grafema) | 5 vogais orais; ã/õ; consoantes contínuas (m, n, s, f, v, l, r inicial, z, j); oclusivas (p, b, t, d, k, g) | ouvir som → tocar letra; ver letra → falar som |
| C. Decodificação silábica | CV regular; V; CVC (-s, -r, -l, -m/-n); CCV (pr, bl…) | ler sílaba/palavra/pseudopalavra |
| D. Dígrafos e regras contextuais | lh, nh, ch; rr/ss; qu/gu; c/ç; s entre vogais; r brando/forte; m antes de p/b; nasalização; x | ler + escrever |
| E. Palavras frequentes irregulares/ambíguas | "hoje", "exceção" do x, e/i e o/u átonos finais | leitura cronometrada |
| F. Fluência e compreensão | frases, textos decodificáveis; PCPM; perguntas literais/inferenciais | leitura oral gravada + perguntas |
| G. Escrita | montar palavra com letras; ditado; frase | montagem/teclado/traçado |

### 3.3 Avaliação diagnóstica inicial ("Missão de boas-vindas da Sofia")

Formato: **3 sessões de 4–6 minutos** (total **12–15 min**), em dias consecutivos ou com pausa, todas como jogo. Roteamento **multiestágio + KST** (para no nível em que a criança começa a errar; infere o que está abaixo).

| Sessão | Tarefa (estilo jogo) | Itens | Tempo | O que decide |
|---|---|---|---|---|
| 1 | **Consciência fonológica**: "qual rima com…?", "qual começa com o mesmo som?", "quantos pedaços tem *borboleta*?" (toque em figuras, sem leitura) | 6–10 adaptativos | ~4 min | ponto de partida em A |
| 1 | **Conhecimento de letras**: ouve som → toca a letra (grade de 4); bloco curto de "fala o som desta letra" (ASR) | 10–16 adaptativos (começa pelas mais frequentes; para após 3 erros seguidos no bloco) | ~2 min | quais grafemas de B já domina |
| 2 | **Decodificação**: ler sílabas CV → palavras regulares → pseudopalavras ("palavras do planeta da Sofia") → dígrafos/CCV. Toque (estilo TCLPP: figura + 4 palavras com distratores) e leitura em voz alta | 8–14 em rota adaptativa | ~5 min | C, D; detecta rota logográfica (acerta palavras, erra pseudopalavras) |
| 2 | **RAN** (nomear 20 figuras/cores conhecidas o mais rápido possível) | 1 cartela | ~1 min | sinal de risco (não define fase) |
| 3 | **Escrita**: montar 4–6 palavras com letras móveis (ditado) | 4–6 | ~3 min | nível de escrita (traduzido em hipótese psicogenética no relatório do professor) |
| 3 | **Fluência + compreensão** (só se decodificou palavras regulares): ler texto curto por 1 min + 3 perguntas; para quem não lê, **compreensão oral** de uma história ouvida | 1 texto | ~2–3 min | PCPM, acurácia, compreensão |

Resultado: (a) **fase de entrada** no currículo; (b) priors do modelo de aluno por habilidade; (c) três "bandeiras" possíveis: *precisa de mais consciência fonológica*, *lê por memória visual (erra pseudopalavras)*, *sinais de risco* (RAN lento + baixa CF + pouca evolução após 8–10 semanas → sugerir avaliação fonoaudiológica/psicopedagógica, nunca "diagnosticar").

Reaplicação: **benchmark trimestral** curto (versão paralela, ~8 min), à semelhança do DIBELS/Acadience (início, meio, fim do ano) [2][36].

### 3.4 Modelo de aluno: Elo hierárquico por habilidade + gate de domínio

**Estrutura.** Para a criança *s*: habilidade global θ_s e habilidade local θ_{s,k} para cada nó *k* do mapa. Cada item *i* tem dificuldade d_i (calibrada on-line) e está ligado a 1–2 habilidades.

**Predição** (modelo logístico, equivalente a Rasch com termo local):
P(acerto) = c_i + (1 − c_i) · σ(θ_s + θ_{s,k} − d_i), onde σ(x) = 1/(1+e^−x) e c_i é o acerto ao acaso (ex.: 0,25 para escolha entre 4 figuras; 0 para leitura oral).

**Atualização** após resposta r ∈ {0,1} (ou parcial, ex.: 0,5 para autocorreção):
- θ_{s,k} ← θ_{s,k} + K(n_{s,k}) · (r − P)
- θ_s ← θ_s + γ·K(n_s) · (r − P)
- d_i ← d_i − K(n_i) · (r − P)
- Função de incerteza K(n) = a / (1 + b·n) (ex.: a = 0,8, b = 0,05), como recomendado por Pelánek [8].

**Tempo de resposta** (ideia do Math Garden [23]): em tarefas de automaticidade (letra-som, leitura de palavras), r é ponderado pela latência: acerto rápido = 1; acerto lento (> limite do item) = 0,7; isso alimenta um indicador separado de **automaticidade** por habilidade.

**Esquecimento:** antes de cada sessão, θ_{s,k} decai levemente em direção ao prior se a habilidade não foi praticada há > 14 dias; agenda **revisão espaçada** (1, 3, 7, 21 dias) das habilidades dominadas.

**Por que não só BKT?** O BKT ignora diferenças de dificuldade entre itens da mesma habilidade e exige ajuste de 4 parâmetros por habilidade [9][45]. Usamos do BKT apenas a **semântica de domínio**: converte-se a predição do Elo num "P(domínio)" = P(acerto) previsto num item-padrão de dificuldade média da habilidade.

**Seleção do próximo item:** zona de desafio com P(acerto) alvo ≈ 0,75 em prática (motivação) e ≈ 0,5 em itens de diagnóstico (máxima informação), restrita à "franja externa" do grafo (habilidades cujos pré-requisitos já foram dominados) [13].

**Fase 2 (com dados):** treinar DKT/transformers para prever risco e para sugerir ordem ótima, mantendo o Elo como camada interpretável [10].

### 3.5 Critérios de domínio para passar de fase

Uma **habilidade** (nó) é considerada dominada quando, simultaneamente:
1. P(domínio) ≥ **0,95** (equivalente ao limiar clássico do BKT [9]);
2. ≥ **8 tentativas** em ≥ **2 sessões** distintas (evita "domínio por sorte");
3. últimas 5 respostas com ≥ 4 acertos, incluindo **pelo menos 2 pseudopalavras** quando a habilidade é de decodificação;
4. latência mediana dentro do alvo de automaticidade (ex.: letra-som ≤ 2 s; palavra CV regular ≤ 3 s).

Uma **fase** é concluída quando todas as habilidades-núcleo estão dominadas **e** a criança passa na provinha da fase (3.6). **Retenção:** 24 h a 7 dias depois, 3–5 itens de checagem; se falhar, a habilidade volta para "em consolidação" sem rebaixar a fase (evita frustração), e entra em revisão prioritária.

### 3.6 Provinhas (letra por letra e de fase)

**Provinha de letra/grafema** (ao final de cada unidade, ~2–3 min, 10 itens, apresentada como "desafio da Sofia"):

| Bloco | Itens | Exemplo para "P" |
|---|---|---|
| Som → letra (toque) | 2 | ouve /p/ → toca "P" entre P, B, T, D (distratores fonologicamente próximos) |
| Letra → som (fala) | 1 | vê "p" → diz /p/ |
| Leitura de sílabas | 2 | pa, pu |
| Leitura de palavras reais | 2 | pato, pipa |
| **Pseudopalavras** | 2 | "pafo", "lupi" |
| Escrita (montar) | 1 | ditado "pé" |

Critério: **≥ 8/10 (80%)** com **pelo menos 1 das 2 pseudopalavras correta** e sem erro sistemático de troca surda/sonora (p/b) — se houver padrão de troca, o relatório sinaliza e o app gera atividade de discriminação. Reprovação nunca bloqueia o jogo: abre uma "trilha de reforço" curta e a provinha volta após nova prática.

**Provinha de fase** (a cada 4–6 unidades, ~6–8 min, inspirada no Phonics Screening Check [5]): 20 itens de leitura (10 palavras, 10 pseudopalavras) ordenados por complexidade + 4 itens de escrita + 1 texto curto (a partir da fase de sílabas complexas). Critério: **≥ 85%** na leitura, **≥ 75%** na escrita.

**Formato das pseudopalavras:** sempre fonotaticamente possíveis em português, sem formar palavra real nem palavrão, revisadas por fonoaudiólogo; personagem "alienígena" do planeta da Sofia para a criança não buscar sentido.

### 3.7 Metas de fluência por série (provisórias)

O Brasil não tem normas nacionais públicas de PCPM comparáveis às americanas; as metas abaixo são **hipóteses de trabalho**, a calibrar com os dados do FONEMA (coorte-piloto de ≥ 500 crianças por série) e, se possível, com dados de fluência do CAEd/redes estaduais. Ancoragem: precisão chega antes em português [26]; mediana americana como referência de ordem de grandeza [4].

| Momento | Precisão mínima | Meta FONEMA (PCPM em texto adequado) | Referência EUA, P50 [4] | Observação |
|---|---|---|---|---|
| Fim da Ed. Infantil (5 anos) | — | lê sílabas CV e palavras CV-CV simples (sem meta de PCPM) | — | foco em CF e letra-som |
| Meio do 1º ano | ≥ 90% | 20–30 | ≈ 29 (inverno) | |
| Fim do 1º ano | ≥ 95% | **50–60** | ≈ 60 | equivale a "lê frases e textos curtos" |
| Meio do 2º ano | ≥ 95% | 60–75 | ≈ 84 | |
| Fim do 2º ano | ≥ 95% | **80–90** + compreensão literal ≥ 70% | ≈ 100 | alinhado ao padrão "alfabetizado" Saeb 743 [16] |
| Fim do 3º ano | ≥ 97% | **100–110** | ≈ 112 | |

Sinais de alerta: precisão < 90% em qualquer momento (problema de decodificação, não de velocidade); PCPM < 50% da meta da série; estagnação por 6 semanas. Medir com **textos equivalentes calibrados** (mesmo nº de palavras, frequência e extensão silábica) e, internamente, também **sílabas corretas por minuto**.

### 3.8 Relatórios para pais e professores (alinhados ao Saeb)

**Escala única FONEMA (0–1000, provisória)** derivada do θ global, com marcos descritivos alinhados às expectativas do 2º ano. Quando houver itens de ligação, buscar ancoragem psicométrica à escala Saeb via TRI [42]; até lá, **não afirmar equivalência numérica** com os 743 pontos — usar linguagem do tipo "no caminho para o padrão nacional de criança alfabetizada".

| Nível FONEMA | Descrição para o professor | Relação com Saeb 2º ano / ICA |
|---|---|---|
| 1 — Pré-leitor | reconhece algumas letras; CF em sílabas | distante do padrão |
| 2 — Leitor de sílabas | decodifica CV e palavras simples com esforço | distante |
| 3 — Leitor de palavras | lê palavras regulares e pseudopalavras; erra regras contextuais | em aproximação |
| 4 — Leitor de frases | lê frases e textos curtos com precisão ≥ 95%, PCPM perto da meta do 1º ano | próximo do padrão |
| 5 — Leitor alfabetizado | lê textos curtos com fluência e compreensão literal/inferencial simples; escreve palavras e frases | **no padrão "criança alfabetizada" (≈ 743)** |
| 6 — Leitor fluente | supera metas do 2º ano | acima do padrão |

**Relatório para pais (semanal, 1 tela, linguagem simples):** "Esta semana a Ana aprendeu: lh, nh. Está praticando: palavras com 'qu'. Leu 42 palavras por minuto (meta da série: 50–60)." + **1 atividade para fazer em casa** (5 min, sem tela). Sem comparação com outras crianças; progresso em relação a si mesma. Semáforo só para o próprio progresso.

**Painel do professor (turma):**
- **Mapa de calor** criança × habilidade (dominado / em consolidação / não iniciado), com agrupamento automático de "quem precisa da mesma aula amanhã" (3–5 grupos) — princípio de dashboard acionável [48].
- **Classificação de risco em 3 faixas** (no alvo / atenção / intervenção intensiva), como DIBELS/Acadience [2][36], com base em PCPM, precisão, ritmo de domínio e RAN.
- **Erros por categoria** (troca surda/sonora, regra contextual, omissão de sílaba complexa, leitura logográfica).
- **Tradução para a linguagem escolar brasileira:** hipótese de escrita (psicogênese) [29], habilidades BNCC correspondentes e posição em relação ao padrão Saeb/ICA [16][17].
- **Relatório de rede/secretaria** (opcional): % de crianças por nível, comparável ao formato do ICA.

### 3.9 Validação do sistema (roteiro)

1. **Piloto de validade concorrente:** 200–300 crianças fazendo o diagnóstico FONEMA + um instrumento externo (TCLPP, CONFIAS ou prova estadual) [30][32]; meta de correlação ≥ 0,6.
2. **Validade preditiva:** diagnóstico no início do ano × resultado da avaliação estadual/Saeb no fim do 2º ano.
3. **Precisão do ASR por faixa etária, sotaque regional e fala atípica**; itens com ASR incerto ficam fora do cálculo até atingir acurácia ≥ 90% em relação a juízes humanos.
4. **Auditoria de viés** por região, rede pública/privada e sexo (funcionamento diferencial de item — DIF).
5. **Recalibração trimestral** das dificuldades dos itens e das metas de fluência com os dados reais.

---

## 4. Referências

Legenda: **V** = confirmada por busca web nesta pesquisa; **C** = referência clássica a conferir (busca bloqueada durante a sessão).

> **Etapa 2 (validação, 13/11/2026):** a última coluna das tabelas de referências traz o status de cada item (VERIFICADA / CORRIGIDA / NÃO ENCONTRADA / NÃO CHECÁVEL), conferido no Crossref, PubMed, ERIC e por requisição HTTP. DOIs encontrados pelas APIs foram acrescentados à coluna URL/DOI. "NÃO CHECÁVEL" quase sempre significa domínio bloqueado pela rede da sessão, não fonte falsa. Detalhes em `validacao-16-25.md`.

| nº | Autor(es) | Ano | Título | País | Tipo | URL / DOI | Verif. | O que aproveitar | Etapa 2 (validação 13/11/2026) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | RTI International (para USAID) | 2016 | Early Grade Reading Assessment (EGRA) Toolkit, 2nd ed. | EUA (uso global) | Manual técnico | https://shared.rti.org/node/257 | V | Subtarefas, adaptação a novas línguas, medidas de 60 s | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 2 | University of Oregon (Center on Teaching & Learning) | 2020 | DIBELS 8th Edition Benchmark Goals | EUA | Normas/benchmarks | https://dibels.amplify.com/docs/DIBELS8thEditionGoals_1.pdf | V | Faixas de risco; NWF com dupla pontuação | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 3 | University of Oregon | 2026 (rev.) | DIBELS 8th Edition Administration and Scoring Guide | EUA | Manual | https://dibels.uoregon.edu/sites/default/files/2026-07/dibels8_admin_scoring_guide.pdf | V | Regras de pontuação de NWF, ORF, PSF | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 4 | Hasbrouck, J.; Tindal, G. | 2017 | An Update to Compiled ORF Norms (Tech. Report 1702) | EUA | Relatório técnico | https://www.brtprojects.org/wp-content/uploads/2019/05/TechRpt_1702ORFNorms.pdf | V | Normas de PCPM 1º–6º ano | **VERIFICADA** — ERIC ED605146 |
| 5 | Department for Education (DfE) | 2025 | Phonics screening check attainment, 2024/25 | Reino Unido | Estatística oficial | https://explore-education-statistics.service.gov.uk/find-statistics/phonics-screening-check-attainment/2024-25 | V | Corte 32/40; formato do check | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 6 | Department for Education (DfE) | 2024 | Phonics screening check: 2024 materials | Reino Unido | Material oficial | https://www.gov.uk/government/publications/phonics-screening-check-2024-materials | V | Itens por complexidade; pseudopalavras ilustradas | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 7 | Twinkl News | 2026 | Phonics screening check pass mark cut to 31 in first change since 2012 | Reino Unido | Notícia (secundária) | https://www.twinkl.com/news/phonics-screening-check-pass-mark-cut-to-31-in-first-change-since-2012 | V | Mudança de corte (confirmar no DfE) | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 8 | Pelánek, R. | 2016 | Applications of the Elo rating system in adaptive educational systems. Computers & Education 98, 169–179 | República Tcheca | Artigo | DOI 10.1016/j.compedu.2016.03.017 · https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf | V | Fórmulas de Elo, função de incerteza, guia de implementação | **VERIFICADA** — Crossref (DOI) |
| 9 | Corbett, A. T.; Anderson, J. R. | 1994/95 | Knowledge tracing: Modeling the acquisition of procedural knowledge. UMUAI 4, 253–278 | EUA | Artigo | DOI 10.1007/BF01099821 | V | BKT; limiar de domínio 0,95 | **VERIFICADA** — Crossref (DOI) |
| 10 | Piech, C. et al. | 2015 | Deep Knowledge Tracing (NIPS 28) | EUA | Artigo | https://papers.neurips.cc/paper/2015/hash/bac9162b47c56fc8a4d2a519803d51b3-Abstract.html · arXiv:1506.05908 | V | DKT para fase 2 | **NÃO CHECÁVEL** — anais NeurIPS sem DOI no Crossref e site bloqueado; o identificador arXiv:1506.05908 existe (doi.org), título não conferido |
| 11 | Shute, V. J. | 2011 | Stealth assessment in computer-based games to support learning. In: Computer Games and Instruction (IAP), 503–523 | EUA | Capítulo | Information Age Publishing (ver catálogo) · DOI 10.1108/978-1-61735-410-620251025 | V | Avaliação invisível em jogos | **VERIFICADA** — Crossref (busca bibliográfica) |
| 12 | Shute, V. J.; Ventura, M. | 2013 | Stealth Assessment: Measuring and Supporting Learning in Video Games | EUA | Livro (MIT Press, acesso aberto) | https://freetechbooks.com/stealth-assessment-measuring-and-supporting-learning-in-video-games-t1185.html · DOI 10.7551/mitpress/9589.001.0001 | V | Método completo ECD + jogo | **VERIFICADA** — Crossref (busca bibliográfica) |
| 13 | Doignon, J.-P.; Falmagne, J.-C. | 2015 | Knowledge Spaces and Learning Spaces | Bélgica / EUA | Capítulo (preprint) | https://arxiv.org/abs/1511.06757 · DOI 10.1017/9781139245913.006 | V | Grafo de pré-requisitos, avaliação adaptativa | **VERIFICADA** — Crossref (busca bibliográfica); versão publicada: capítulo do New Handbook of Mathematical Psychology (Cambridge UP); a tabela cita o preprint arXiv |
| 14 | Matayoshi, J.; Doble, C.; Cosyn, E. | 2019 | (Reliability of ALEKS assessments) International Journal of AI in Education | EUA | Artigo | DOI 10.1007/s40593-019-00176-0 | V | Confiabilidade de avaliação KST com 700 mil testes | **CORRIGIDA** — Crossref (DOI); 1º autor: Doble, C. (Doble, Matayoshi, Cosyn, Uzun & Karami); título: A Data-Based Simulation Study of Reliability for an Adaptive Assessment Based on Knowledge Space Theory |
| 15 | Falmagne, J.-C.; Doignon, J.-P. | 2011 | Learning Spaces | EUA / Bélgica | Livro (Springer) | https://www.springer.com/us/book/9783642010385 · DOI 10.1007/978-3-642-01039-2 | V | Teoria formal dos espaços de aprendizagem | **VERIFICADA** — Crossref (busca bibliográfica) |
| 16 | MEC — Compromisso Nacional Criança Alfabetizada | 2024 | Panorama (Indicador Criança Alfabetizada) | Brasil | Documento oficial | https://www.gov.br/mec/pt-br/crianca-alfabetizada/panorama.pdf | V | Padrão 743 Saeb; metas | **NÃO CHECÁVEL** — gov.br respondeu 404 na 1ª tentativa e depois 429 (limite/anti-robô); reconferir a URL manualmente |
| 17 | MEC / Inep | 2025 | Indicador Criança Alfabetizada 2024 — relatório Ceará | Brasil | Relatório oficial | https://www.gov.br/mec/pt-br/crianca-alfabetizada/monitoramento-e-avaliacao/ce_ica2024.pdf | V | Formato de relatório por rede | **NÃO CHECÁVEL** — gov.br respondeu 404 na 1ª tentativa e depois 429 (limite/anti-robô); reconferir a URL manualmente |
| 18 | Todos Pela Educação | 2026 | Nota técnica — Indicador Criança Alfabetizada 2025 | Brasil | Nota técnica | https://todospelaeducacao.org.br/wordpress/wp-content/uploads/2026/03/nota-tecnica-indicador-crianca-alfabetizada-2025-todos-pela-educacao.pdf | V | 66% em 2025; leitura crítica do ICA | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 19 | Agência Gov (EBC) | 2025 | 58% dos municípios melhoraram alfabetização | Brasil | Notícia oficial | https://agenciagov.ebc.com.br/noticias/202507/58-dos-municipios-melhoraram-alfabetizacao | V | Resultados ICA 2024 | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 20 | Panseri, B. (Fundação Lemann) | 2024 | Apresentação à Comissão Especial do PNE (Câmara dos Deputados) | Brasil | Apresentação | https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-temporarias/especiais/57a-legislatura/comissao-especial-sobre-o-plano-nacional-de-educacao-decenio-2024-2034-pl-2614-24/apresentacoes-em-eventos/copy_of_BRBARAPANSERIGerentedeAlfabetizaodaFundaoLemann.pdf | V | Uso do padrão 743 nas políticas | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21 | Educação e Pesquisa (USP), v.38 n.3 | 2012 | Artigo sobre a Provinha Brasil (ver autoria no PDF) | Brasil | Artigo | https://old.scielo.br/pdf/ep/v38n3/05.pdf · DOI 10.1590/s1517-97022012000300005 | V | Caráter diagnóstico e devolutiva por níveis | **VERIFICADA** — Crossref (busca bibliográfica); autoria: Gontijo (2012), Avaliação da alfabetização: Provinha Brasil, Educação e Pesquisa 38(3) |
| 22 | Repositório Redalyc (artigo sobre Provinha Brasil) | — | Avaliação da alfabetização: Provinha Brasil (ver autoria no PDF) | Brasil | Artigo | https://www.redalyc.org/pdf/298/29824608003.pdf · DOI 10.1590/s1517-97022012000300005 | V | Histórico (Portaria nº 10/2007) | **VERIFICADA** — Crossref (busca bibliográfica); autoria: Gontijo (2012); provavelmente a mesma obra do nº 21 |
| 23 | Klinkenberg, S.; Straatemeier, M.; van der Maas, H. L. J. | 2011 | Computer adaptive practice of Maths ability using a new item response model for on the fly ability and difficulty estimation. Computers & Education 57(2) | Países Baixos | Artigo | DOI 10.1016/j.compedu.2011.02.003 | C | Elo + tempo de resposta; calibração on-line (Math Garden) | **VERIFICADA** — Crossref (DOI) |
| 24 | Bloom, B. S. | 1984 | The 2 Sigma Problem. Educational Researcher 13(6), 4–16 | EUA | Artigo | DOI 10.3102/0013189X013006004 | C | Mastery learning + tutoria | **VERIFICADA** — Crossref (DOI) |
| 25 | Kulik, C.-L.; Kulik, J.; Bangert-Drowns, R. | 1990 | Effectiveness of mastery learning programs: a meta-analysis. Review of Educational Research 60(2) | EUA | Meta-análise | DOI 10.3102/00346543060002265 | C | Critérios de domínio altos funcionam melhor | **VERIFICADA** — Crossref (DOI) |
| 26 | Seymour, P.; Aro, M.; Erskine, J. | 2003 | Foundation literacy acquisition in European orthographies. British Journal of Psychology 94(2) | Reino Unido (Escócia) / Finlândia | Artigo | DOI 10.1348/000712603321661859 | C | Português intermediário; precisão chega cedo | **VERIFICADA** — Crossref (DOI) |
| 27 | Mislevy, R.; Steinberg, L.; Almond, R. | 2003 | On the structure of educational assessments. Measurement 1(1), 3–62 | EUA | Artigo | DOI 10.1207/S15366359MEA0101_02 | C | Evidence-Centered Design | **VERIFICADA** — Crossref (DOI) |
| 28 | Fuchs, L.; Fuchs, D.; Hosp, M.; Jenkins, J. | 2001 | Oral reading fluency as an indicator of reading competence. Scientific Studies of Reading 5(3) | EUA | Artigo | DOI 10.1207/S1532799XSSR0503_3 | C | Justificativa da PCPM como indicador | **VERIFICADA** — Crossref (DOI) |
| 29 | Ferreiro, E.; Teberosky, A. | 1979 | Los sistemas de escritura en el desarrollo del niño (Psicogênese da língua escrita) | Argentina / México | Livro | Siglo XXI; ed. bras. Artes Médicas (ver catálogo) | C | Níveis de escrita para o relatório do professor | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 30 | Moojen, S. et al. | 2003 | CONFIAS — Consciência Fonológica: Instrumento de Avaliação Sequencial | Brasil | Teste | Casa do Psicólogo (ver catálogo) | C | Itens silábicos/fonêmicos; validação concorrente | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 31 | Capovilla, A. G. S.; Capovilla, F. C. | 1998/2000 | Prova de Consciência Fonológica (in: Problemas de leitura e escrita) | Brasil | Teste | Memnon (ver catálogo) | C | 10 subtestes de CF com normas | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 32 | Seabra, A. G.; Capovilla, F. C. | 2010 | TCLPP — Teste de Competência de Leitura de Palavras e Pseudopalavras | Brasil | Teste | Memnon (ver catálogo) | C | Itens figura-palavra com distratores diagnósticos | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 33 | Stein, L. M.; Giacomoni, C. H.; Fonseca, R. P. | 2019 | TDE II — Teste de Desempenho Escolar | Brasil | Teste | Vetor (ver catálogo) | C | Validação externa leitura/escrita | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 34 | Capellini, S. A.; Oliveira, A. M.; Cuetos, F. | 2010 | PROLEC — Provas de Avaliação dos Processos de Leitura (adapt. do original espanhol de Cuetos, Rodríguez & Ruano, 1996) | Brasil / Espanha | Teste | Casa do Psicólogo (ver catálogo) | C | Processos léxicos/sintáticos/semânticos | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 35 | Share, D. L. | 2008 | On the Anglocentricities of current reading research and practice. Psychological Bulletin 134(4) | Israel | Artigo | DOI 10.1037/0033-2909.134.4.584 | C | Não transpor normas do inglês | **VERIFICADA** — Crossref (DOI) |
| 36 | Good, R.; Kaminski, R. (Acadience Learning) | 2019+ | Acadience Reading K–6 (antigo DIBELS Next) | EUA | Teste/benchmarks | acadiencelearning.org (site bloqueado na sessão) | C | Benchmarks 3x/ano, faixas de risco | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 37 | Pearson | — | aimsweb Plus | EUA | Teste/CBM | pearsonassessments.com (ver catálogo) | C | Monitoramento de progresso | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 38 | Wagner, R.; Torgesen, J.; Rashotte, C.; Pearson, N. | 2013 | CTOPP-2 | EUA | Teste | Pro-Ed (ver catálogo) | C | RAN, memória fonológica | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 39 | Torgesen, J.; Wagner, R.; Rashotte, C. | 2012 | TOWRE-2 | EUA | Teste | Pro-Ed (ver catálogo) | C | Eficiência palavra/pseudopalavra com tempo | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 40 | Mullis, I.; Martin, M. (eds.), IEA | 2019/2023 | PIRLS 2021 Assessment Framework / International Results | Internacional (IEA, Boston College) | Quadro de referência | pirls2021.org (conferir) · DOI 10.6017/lse.tpisc.tr2103.kb5342 | C | Processos de compreensão para fases finais | **VERIFICADA** — Crossref (busca bibliográfica); confirmado o relatório International Results (2023); o Assessment Framework não foi conferido |
| 41 | CAEd/UFJF; Governo do Ceará | — | SPAECE-Alfa / avaliações estaduais de alfabetização e fluência | Brasil | Avaliação estadual | caed.ufjf.br (conferir) | C | Níveis descritivos; avaliação de fluência | **NÃO CHECÁVEL** — obra fora das bases consultadas |
| 42 | Lord, F. M. | 1980 | Applications of Item Response Theory to Practical Testing Problems | EUA | Livro | Lawrence Erlbaum (ver catálogo) · DOI 10.4324/9780203056615 | C | Base da TRI (mesma do Saeb) | **VERIFICADA** — Crossref (busca bibliográfica); DOI da reedição Routledge (2012) do livro de 1980 |
| 43 | Wainer, H. (ed.) | 2000 | Computerized Adaptive Testing: A Primer, 2nd ed. | EUA | Livro | Lawrence Erlbaum (ver catálogo) · DOI 10.4324/9781410605931 | C | Seleção de itens, critérios de parada | **VERIFICADA** — Crossref (busca bibliográfica) |
| 44 | Baker, R.; Corbett, A.; Aleven, V. | 2008 | More accurate student modeling through contextual estimation of slip and guess probabilities in BKT (ITS 2008, LNCS 5091) | EUA | Artigo | Springer LNCS (ver catálogo) · DOI 10.1007/978-3-540-69132-7_44 | C | Chute/deslize contextuais | **VERIFICADA** — Crossref (busca bibliográfica) |
| 45 | Pelánek, R. | 2017 | Bayesian knowledge tracing, logistic models, and beyond. UMUAI 27 | República Tcheca | Artigo de revisão | DOI 10.1007/s11257-017-9193-2 | C | Comparação BKT × Elo × logísticos | **VERIFICADA** — Crossref (DOI) |
| 46 | Black, P.; Wiliam, D. | 1998 | Assessment and classroom learning. Assessment in Education 5(1), 7–74 | Reino Unido | Revisão | DOI 10.1080/0969595980050102 | C | Avaliação formativa com feedback | **VERIFICADA** — Crossref (DOI) |
| 47 | Siemens, G.; Long, P. | 2011 | Penetrating the fog: Analytics in learning and education. EDUCAUSE Review 46(5) | Canadá / EUA | Artigo | EDUCAUSE Review (ver catálogo) | C | Definição de learning analytics | **VERIFICADA** — ERIC EJ950794 |
| 48 | Verbert, K.; Duval, E.; Klerkx, J.; Govaerts, S.; Santos, J. L. | 2013 | Learning analytics dashboard applications. American Behavioral Scientist 57(10) | Bélgica | Artigo | DOI 10.1177/0002764213479363 | C | Painéis acionáveis | **VERIFICADA** — Crossref (DOI) |
| 49 | Gough, P.; Tunmer, W. | 1986 | Decoding, reading, and reading disability. Remedial and Special Education 7(1) | EUA / Nova Zelândia | Artigo | DOI 10.1177/074193258600700104 | C | Simple View: medir decodificação e compreensão oral | **VERIFICADA** — Crossref (DOI) |
| 50 | Ehri, L. C. | 2005 | Learning to read words: theory, findings, and issues. Scientific Studies of Reading 9(2) | EUA | Artigo | DOI 10.1207/s1532799xssr0902_4 | C | Fases de leitura de palavras; mapeamento ortográfico | **VERIFICADA** — Crossref (DOI) |

**Contagem:** 50 referências (22 V + 28 C), de **12 países/origens**: EUA, Reino Unido, Brasil, República Tcheca, Países Baixos, Bélgica, Espanha, Argentina/México, Israel, Canadá, Finlândia, Nova Zelândia (+ IEA internacional).

**Pendências de verificação (para a próxima rodada com busca liberada):** confirmar no gov.uk o corte de 2026 do Phonics Check; confirmar valores exatos de Hasbrouck & Tindal no PDF; localizar normas brasileiras de fluência publicadas (artigos em CoDAS/Revista CEFAC e dados de fluência do CAEd/Parc) para substituir as metas provisórias da seção 3.7; confirmar ano/ato de descontinuação da Provinha Brasil; obter URL/DOI das referências C.
