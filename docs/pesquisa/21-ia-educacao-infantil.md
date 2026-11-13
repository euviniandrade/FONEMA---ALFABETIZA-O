# 21 — Inteligência Artificial na Educação Infantil e na Alfabetização

> Frente de pesquisa 21 de 30 — Projeto FONEMA (alfabetização fônica em pt-BR, guia "Sofia").
> Data da pesquisa: novembro de 2026.
> **Nota de método:** as buscas foram feitas em modo *standard*; o orçamento global de buscas da sessão (compartilhado entre todas as frentes) esgotou-se no meio do trabalho, e os domínios oficiais (unicef.org, ed.gov, planalto.gov.br, ico.org.uk) estavam bloqueados para leitura direta nesta sessão. Por isso: (a) todas as referências da tabela vieram de resultados de busca reais desta sessão; (b) números citados foram conferidos apenas em resumos/abstracts e devem ser checados no texto integral antes de uso público; (c) temas que ficaram sem fonte verificada estão listados na seção 5 ("Lacunas a pesquisar"), sem referência inventada.

---

## 1. Resumo executivo

1. **Tutoria inteligente funciona — quando é "por passos" e bem implementada.** VanLehn (2011) mostrou que tutores inteligentes *step-based* chegam perto da tutoria humana (d ≈ 0,76 vs. 0,79) [1]; Kulik & Fletcher (2016), em 50 avaliações controladas, acharam mediana de +0,66 DP, com forte dependência da qualidade da implementação e do grupo de controle [2][3]. Para o FONEMA, isso significa: o valor está no **feedback fino em cada passo** (cada fonema, cada sílaba), não em "conversa aberta".
2. **Tutores de leitura que escutam a criança têm 25 anos de evidência.** O Project LISTEN (Carnegie Mellon) demonstrou ganhos com um tutor que ouve a leitura oral, mesmo com reconhecimento de fala imperfeito [4][5][6]; sua lição central é *não punir a criança por erros do reconhecedor* e usar o reconhecimento como fonte de dados de fluência [7][8][9].
3. **Produtos comerciais atuais (Amira, Google Read Along, Microsoft Reading Coach, Ello, Lalilo)** convergem para a mesma arquitetura: leitura em voz alta + ASR + feedback imediato + painel do professor [11]–[24]. As evidências de eficácia são, em sua maioria, **encomendadas pelos fornecedores e quase-experimentais** [11][12][21]; as avaliações independentes são mais modestas (ex.: Amira "Promising" no Evidence for ESSA [13]; avaliação independente do Read Along na Índia pela Sattva [17]). Um ECR francês com o Lalilo está registrado, sem resultados ainda [23].
4. **Agentes conversacionais podem replicar benefícios da leitura dialógica com adultos.** Os estudos de Ying Xu (UC Irvine → Michigan → Harvard) mostram que um agente que faz perguntas contingentes durante a leitura/vídeo melhora compreensão e participação verbal de crianças de 3–6 anos, de forma comparável a um parceiro humano — mas com padrões de comunicação diferentes [25]–[29]. Isso valida uma Sofia que **pergunta e responde de forma estruturada**, não um chatbot livre.
5. **Diretrizes internacionais pedem: humano no circuito, privacidade, transparência e cautela com "companheiros" de IA.** UNICEF publicou a versão 3.0 da orientação sobre IA e crianças (dez/2025), com 10 requisitos e foco novo em *AI companions* [30][31][32][33]; UNESCO (2023) sugere considerar idade mínima de 13 anos para uso direto de IA generativa em sala [34][35]; o Departamento de Educação dos EUA (2023) põe "humans in the loop" como critério central [36][37][38].
6. **Recomendação-síntese para o FONEMA:** uma **Sofia híbrida**, em que a criança **nunca conversa diretamente com um LLM aberto**. A fala da Sofia vem de roteiros pré-gravados/pré-gerados e revisados; IA generativa fica *nos bastidores* (geração de histórias decodificáveis validadas por algoritmo + revisão humana, sugestões para o professor); IA "ao vivo" com a criança limita-se a reconhecimento de fala restrito (alinhamento a texto conhecido) e adaptação de sequência (modelo de domínio). Professor e família têm painel e controle.

---

## 2. Achados (com citações)

### 2.1 Sistemas tutores inteligentes (STI): o que a meta-análise diz

- **VanLehn (2011)**, *Educational Psychologist* 46(4): comparou tutoria humana, tutores computacionais e ausência de tutoria, classificando sistemas pela *granularidade* da interação (resposta, passo, subpasso). Tutoria humana: d ≈ 0,79 sobre nenhuma tutoria (bem abaixo do mítico "2 sigma" de Bloom); STI baseados em passos: d ≈ 0,76; sistemas baseados só na resposta final ficaram bem abaixo. Também refutou a crença de que "quanto mais fina a granularidade, sempre melhor" — há um platô [1].
- **Kulik & Fletcher (2016)**, *Review of Educational Research* 86(1): 50 avaliações controladas; mediana de +0,66 DP. Os efeitos variaram com o tipo de controle e a fidelidade de implementação; implementações falhas reduziram resultados [2][3].
- Panorama histórico de STI (modelo de domínio, modelo do aluno, modelo pedagógico, interface) em Alkhatlan & Kalita [10].
- **Implicação:** em alfabetização fônica, o "passo" natural é a correspondência grafema–fonema, a síntese silábica e a leitura de palavra. O FONEMA deve dar feedback **por passo**, não só "acertou/errou a fase".

### 2.2 Tutores de leitura com reconhecimento de fala

**Project LISTEN (Jack Mostow, CMU, ~1990–2010s)**
- O *Reading Tutor* exibia histórias, ouvia a criança ler em voz alta (reconhecedor Sphinx-II adaptado) e intervinha quando ela travava, pulava palavras ou pedia ajuda [5][6].
- Estudo de um ano com 131 alunos de 2.º e 3.º anos em 12 salas comparou o tutor automático com tutoria humana e com aula regular [4].
- Comparação com leitura silenciosa sustentada mostrou benefício da leitura oral guiada por computador, apesar de o reconhecimento de fala ser "longe de perfeito" [7].
- Lições técnicas: (a) prever erros prováveis (*miscues*) para melhorar a precisão e **evitar marcar como erro uma palavra lida corretamente** [8]; (b) fala infantil é bem mais difícil de reconhecer que a adulta [9]; (c) a saída do reconhecedor é ótima fonte para **medir fluência** (palavras corretas/minuto, latência) [41]; (d) experimentos embutidos no próprio tutor permitem melhoria contínua [6].

**Amira Learning (EUA; distribuída pela HMH)**
- Tutor de leitura oral com ASR e avaliação (inclusive de fluência). Estudo de Louisiana 2023–24 (elaborado pela Instructure para a Amira), quase-experimental, ~79 mil alunos K–5 em 12 distritos, desenhado para o nível II do ESSA; maior uso associado a maiores ganhos; não revisado por pares [11][12].
- Estudo próprio com DIBELS, também quase-experimental [14].
- Avaliação independente (Evidence for ESSA, citada pela FCRR): "Promising" para K–5, com efeito +0,64 num estudo antigo em distrito suburbano favorecido [13]. Material comercial da HMH alega "Strong evidence" e efeito ~0,70 — alegação do fornecedor [15].

**Google Read Along (ex-Bolo; Índia → global)**
- Lançado em 2019 com a assistente virtual "Diya" que ouve e corrige a leitura, funcionando *offline* no celular [16][18].
- Piloto com Pratham/ASER em ~200 vilarejos de Uttar Pradesh (~1.500 crianças, ~3 meses): 64% dos usuários melhoraram proficiência (dado do próprio Google; uso não supervisionado) [17a][19].
- Avaliação independente da Sattva (2020): ~3.500 crianças, 3 línguas, 45–60 dias; "40% mais alunos" melhoraram ≥1 nível vs. comparação; a personagem Diya foi "instrumental para o engajamento" [17].
- **Relevância direta para a Sofia:** personagem-guia + ASR no dispositivo + funcionar offline é exatamente o modelo de uso em contextos de baixa conectividade como boa parte do Brasil.

**Microsoft Reading Progress / Reading Coach**
- Ferramentas gratuitas: o aluno grava a leitura; o sistema calcula palavras corretas por minuto, precisão, palavras difíceis e prosódia; o professor revisa (economiza tempo de escuta individual) [20][21b].
- O modo "criar uma história" usa IA generativa filtrada por Azure AI Content Safety (ódio, palavrões, autolesão, conteúdo sexual, violência), e a Microsoft recomenda uso com supervisão de adulto [20][22].
- Limitações apontadas: não avalia compreensão; conteúdo gerado pode não representar adequadamente identidades/culturas [22].

**Ello (EUA)**
- "Coach" de leitura com biblioteca de centenas de livros **decodificáveis** alinhados a sequência fônica. A empresa afirma ter modelo de fala treinado em >130 mil horas de fala infantil e superar o Whisper em fala de crianças — alegação de *press release*, sem estudo independente encontrado [24][24b].

**Lalilo (França; hoje da Renaissance)**
- Fonética + compreensão para K–2, com exercícios adaptativos e reconhecimento de fala para leitura oral [21].
- Estudo da Renaissance (2022–23): 15.839 usuários vs. 88.935 não usuários nos mesmos distritos; leitores com dificuldade que usaram "com fidelidade" ganharam o equivalente a ~6 semanas extras — comparação não randomizada [21c]. Relatório WestEd (qualitativo, entrevistas com professores) [21d].
- ECR no 1.º ano francês (Barone et al.) registrado no AEA RCT Registry em 2025 — será a primeira evidência randomizada [23].
- Resenha pedagógica independente: Common Sense Education [42].

### 2.3 LLMs e agentes conversacionais com crianças

- **Leitura dialógica com agente (Xu et al., 2021, *Child Development*):** 117 crianças de 3–6 anos, desenho 2×2 (dialógica vs. não dialógica × agente vs. humano). O agente replicou os benefícios da leitura dialógica humana, aumentando verbalizações relevantes para a narrativa e a compreensão da história [25].
- **Mesmos benefícios, padrões diferentes (Xu et al., 2021, *Computers & Education*):** compreensão semelhante com agente ou adulto, mas a interação verbal das crianças difere (menos elaborada com o agente) [26].
- **Ciência na TV com agente (Xu et al., 2024, *J. Educ. Psychology* 116(7); AIED 2021):** perguntas contingentes inseridas no desenho "Elinor Wonders Why" (PBS KIDS), ~10 momentos de conversa por episódio, melhoraram a compreensão de conceitos [27][28].
- **Agentes com LLM para leitura dialógica (StoryPal e afins):** pais valorizam como complemento quando estão indisponíveis, mas não como substituto da interação pai–filho [29].
- Síntese de Xu sobre efeitos sociais e cognitivos da IA em crianças (Children and Screens) [29]; financiamentos NSF da linha de pesquisa [40].
- **Implicação:** o ganho vem da **contingência estruturada** (pergunta certa no momento certo + resposta à fala da criança), o que pode ser obtido com roteiros ramificados e classificação de intenção restrita — sem geração livre de texto diante da criança.

### 2.4 Riscos

- **Alucinação e conteúdo impróprio:** mesmo a Microsoft envolve sua geração de histórias em filtros de segurança e recomenda supervisão [20][22]; viés cultural/identitário em texto gerado [22].
- **Apego e "AI companions":** a versão 3.0 da orientação do UNICEF passou a tratar explicitamente de companheiros de IA, além de privacidade, não discriminação, transparência e responsabilização [30][31][32].
- **Idade:** UNESCO (2023) sugere considerar 13 anos como limite para uso de IA generativa em sala e menciona defensores de 16 anos [34][35]. O público do FONEMA (≈4–8 anos) está muito abaixo — reforça não expor a criança a chat aberto.
- **Reconhecimento de fala infantil:** taxas de erro altas em crianças pequenas e em sotaques/variedades; falso "errou" desmotiva [7][8][9]; modelos genéricos tendem a "corrigir" a pronúncia infantil para a palavra esperada.
- **Evidência fraca de produto:** a maioria dos estudos de eficácia é do fornecedor, quase-experimental, com viés de seleção por uso [11][12][14][21c].
- **"Humano no circuito" como bala de prata:** o ITIF critica a exigência indiscriminada, pois pode deixar alunos sem ajuda [38] — o FONEMA deve definir *onde* o humano entra (revisão de conteúdo, decisões pedagógicas), não exigir aprovação de cada interação.

### 2.5 Diretrizes

| Diretriz | Pontos para o FONEMA |
|---|---|
| UNICEF — Guidance on AI and Children 3.0 (dez/2025) [30][31][32]; versão 2021 [33] | 10 requisitos centrados na criança (segurança, privacidade de dados, não discriminação, transparência, responsabilização, regulação); novidade: AI companions; acompanha checklist prático. |
| UNESCO — Guidance for Generative AI in Education and Research (set/2023) [34][35] | Primeira orientação global; validar sistemas antes do uso por alunos; considerar idade mínima (13); formação de professores. |
| US DoE/OET — AI and the Future of Teaching and Learning (mai/2023) [36][37] | Rejeita substituir professores; humanos no circuito em todas as fases; IA alinhada a visão pedagógica. |
| Crítica ITIF [38] | Humano no circuito não deve virar burocracia que impeça tutoria. |
| ITU (doc. de grupo de trabalho sobre proteção infantil online, 2026) [39] | Repercussão da orientação UNICEF em fóruns de governança digital. |

---

## 3. Implicações práticas para o FONEMA

### 3.1 Onde USAR IA

| Uso | Tipo de IA | Onde roda | Justificativa |
|---|---|---|---|
| Verificar leitura de fonema/sílaba/palavra | ASR **restrito** (alinhamento forçado / vocabulário fechado com o alvo conhecido) | **No dispositivo** sempre que possível | Lição LISTEN/Read Along [5][8][16]; privacidade; offline |
| Medir fluência (PCPM, precisão, latência) | Saída do ASR + regras | Dispositivo → só métricas vão à nuvem | [9][20][41] |
| Escolher próxima atividade | Modelo do aluno (ex.: rastreamento de conhecimento bayesiano por correspondência grafema–fonema) | Dispositivo (com sincronização) | STI step-based [1][2] |
| Gerar histórias decodificáveis | LLM **offline, nos bastidores** + validador algorítmico + revisão humana | Nuvem (pipeline editorial) | Produção escalável, sem LLM diante da criança |
| Vozes da Sofia | TTS neural **pré-renderizado** e revisado | Gerado na nuvem, distribuído como áudio | Pronúncia controlada de fonemas pt-BR |
| Apoio ao professor | LLM para resumo de progresso, sugestão de agrupamentos e de atividades | Nuvem, só para adultos, dados pseudonimizados | US DoE: humano decide [36] |

### 3.2 Onde NÃO usar IA

- **Chat livre entre criança e LLM.** Nenhum texto gerado ao vivo por LLM chega à criança sem passar por um conjunto fechado/validado.
- **Pronúncia de fonemas isolados gerada por TTS em tempo real** (risco de /b/ virar "bê"): gravar com fonoaudióloga/locutora e versionar.
- **Diagnóstico** (dislexia, TDL, etc.): IA só sinaliza padrões ao professor; não rotula a criança.
- **Avaliação punitiva baseada em ASR:** baixa confiança do reconhecedor ⇒ tratar como "vamos tentar juntos", nunca "errado" [8].
- **"Amizade" simulada / vínculo emocional dependente:** Sofia é guia, não "melhor amiga"; sem frases do tipo "fico triste se você sair" (preocupação com AI companions [30][31]).

### 3.3 Arquitetura proposta da Sofia ("roteiro primeiro, IA controlada")

```
Camada 1 — Roteiro (determinística, 100% revisada)
  Árvore de falas pré-gravadas/pré-renderizadas por atividade:
  instrução → dica 1 → dica 2 → modelagem → celebração → transição.
  Variantes por contexto (acerto, erro típico X, hesitação, silêncio).

Camada 2 — Percepção (IA restrita, no dispositivo)
  ASR com vocabulário/alvo conhecido → {correto, erro típico, incerto, silêncio}
  Classificador de intenção minúsculo (ex.: "repete", "não sei", "sim/não").
  Saída é sempre um RÓTULO, nunca texto livre.

Camada 3 — Decisão pedagógica (modelo do aluno)
  Escolhe qual ramo do roteiro tocar e qual a próxima atividade.

Camada 4 — Conteúdo gerado offline (bastidores)
  LLM gera histórias/frases → validadores → revisão humana → publicado como
  conteúdo estático, igual ao feito à mão.
```

- Inspirada em Xu (contingência estruturada) [25][27] e em Diya/Read Along (personagem + ASR + offline) [16][17].
- Vantagens: previsível, auditável, barato, funciona offline, sem dados de voz saindo do aparelho.
- **Evolução futura (fase 2, opcional, com estudo):** "perguntas dialógicas" em que o LLM apenas *classifica* a resposta oral da criança contra respostas esperadas, e a Sofia responde com falas pré-aprovadas. Nunca gerar fala nova para a criança sem passar por lista branca.

### 3.4 Gerador de histórias decodificáveis (pipeline)

1. **Entrada:** posição na sequência fônica (grafemas já ensinados), lista de palavras de alta frequência liberadas, tema, comprimento, personagens do universo FONEMA.
2. **Geração:** LLM com instrução de restrição + exemplos (*few-shot*), temperatura baixa; várias candidatas.
3. **Validação algorítmica (obrigatória, bloqueante):** tokenizar; para cada palavra, decompor em grafemas pt-BR (incluir dígrafos *ch, lh, nh, rr, ss, qu, gu*, nasalização *am/an/ão*, *x* com múltiplos valores) e checar se todos estão no conjunto ensinado ou na lista de exceções liberadas; calcular **% de decodificabilidade** (meta ≥ 95%, ajustável); comprimento de frase; ausência de nomes próprios não ensinados.
4. **Filtros de segurança e cultura:** lista de bloqueio, classificador de conteúdo, checagem de estereótipos e diversidade regional brasileira (a Microsoft aponta risco de representação [22]).
5. **Revisão humana** (pedagoga) antes de publicar; registro de versão.
6. **Publicação estática** + áudio TTS revisado + ilustração.
7. **Medição:** taxa de leitura correta por história alimenta o próximo ciclo.
> Referência de produto: Ello usa biblioteca decodificável alinhada a sequência fônica [24]; o FONEMA pode ser pioneiro fazendo isso para o português com validador de grafemas aberto.

### 3.5 Guard-rails de segurança infantil (checklist)

- Sem chat aberto; sem coleta de texto livre da criança; sem câmera.
- Áudio da criança processado **no dispositivo**; se precisar subir (melhorar modelo), só com consentimento parental específico, destacado e revogável, e pseudonimização. *(Obs.: a base legal brasileira — LGPD art. 14 e normas recentes de proteção de crianças em ambiente digital — deve ser confirmada pela frente jurídica; não pude verificar os textos oficiais nesta sessão.)*
- Toda saída de IA generativa passa por: lista branca → classificador de conteúdo → revisão humana.
- Sofia se apresenta como personagem de computador, de forma compreensível para a idade (transparência [30][36]).
- Sem padrões manipulativos (*streaks* punitivos, culpa, "sentir saudade"); limites de tempo de tela sugeridos às famílias.
- Painel parental/docente com o que foi gravado, retido e por quanto tempo; botão de apagar.
- Avaliação de impacto sobre direitos da criança usando o checklist da UNICEF 3.0 [30][31].
- Testes de *red team* com falas infantis reais (incluindo sotaques regionais, fala atípica e ruído de sala).
- Monitorar taxa de "falso erro" do ASR por região/sotaque (equidade) [8][9].

### 3.6 Papel do professor

- **Decide**, a IA **sugere** [36][37]: painel com fluência, grafemas dominados/em risco, sugestões de agrupamento.
- Escuta por amostragem gravações (como em Reading Progress [20]) e pode corrigir o veredito do ASR — isso vira dado de melhoria.
- Aprova/rejeita histórias geradas para sua turma; pode pedir histórias com tema local.
- Recebe formação curta sobre limites da IA (UNESCO [34]).
- Ferramentas de IA para professores brasileiros (planejamento, devolutivas a famílias) só no lado adulto, sem dados identificáveis de crianças no prompt.

### 3.7 Dispositivo vs. nuvem (resumo)

| No dispositivo | Na nuvem |
|---|---|
| ASR restrito, classificação de intenção, modelo do aluno, todo o áudio da Sofia em cache, funcionamento offline | Pipeline editorial de histórias com LLM, TTS de produção, painéis agregados, sincronização de progresso (sem áudio bruto por padrão), retreino de modelos com dados consentidos |

### 3.8 Plano de evidência (ser "pioneiro" de verdade)

O setor tem pouca evidência independente [13][17][23]. O FONEMA pode se diferenciar com: experimentos embutidos (A/B de dicas, estilo LISTEN [6]); parceria com universidade para ECR; pré-registro; métricas de decodificação, fluência (PCPM) e compreensão; e publicação aberta da precisão do ASR em fala infantil brasileira.

---

## 4. Tabela de referências

> **Etapa 2 (validação, 13/11/2026):** a última coluna das tabelas de referências traz o status de cada item (VERIFICADA / CORRIGIDA / NÃO ENCONTRADA / NÃO CHECÁVEL), conferido no Crossref, PubMed, ERIC e por requisição HTTP. DOIs encontrados pelas APIs foram acrescentados à coluna URL/DOI. "NÃO CHECÁVEL" quase sempre significa domínio bloqueado pela rede da sessão, não fonte falsa. Detalhes em `validacao-16-25.md`.

| n | Autor(es) | Ano | Título | País | Tipo | URL/DOI | O que aproveitar | Etapa 2 (validação 13/11/2026) |
|---|---|---|---|---|---|---|---|---|
| 1 | VanLehn, K. | 2011 | The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems (Educ. Psychologist 46(4)) | EUA | Meta-análise | https://eric.ed.gov/?id=EJ946764 · DOI 10.1080/00461520.2011.611369 | Feedback por passo ≈ tutoria humana | **VERIFICADA** — Crossref (busca bibliográfica) |
| 2 | Kulik, J. A.; Fletcher, J. D. | 2016 | Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review (RER 86(1)) | EUA | Meta-análise | DOI 10.3102/0034654315581420 — https://journals.sagepub.com/doi/abs/10.3102/0034654315581420 | +0,66 DP; importância da implementação | **VERIFICADA** — Crossref (DOI) |
| 3 | Institute for Defense Analyses (Kulik & Fletcher) | 2017 | Welch Award — Effectiveness of ITS: A Meta-Analytic Review | EUA | Relatório/prêmio | https://www.ida.org/research-and-publications/publications/all/e/ef/effectiveness-of-intelligent-tutoring-systems-a-meta-analytic-review | Versão acessível do estudo | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 4 | Mostow, J. et al. | 2003 | Evaluation of an automated Reading Tutor that listens: Comparison to human tutoring and classroom instruction | EUA | Estudo comparativo | https://ri.cmu.edu/?p=8610 · DOI 10.2190/06ax-qw99-eq5g-rdcf | Tutor que escuta vs. humano (131 alunos) | **VERIFICADA** — Crossref (busca bibliográfica) |
| 5 | Mostow, J. et al. | — | Evaluating tutors that listen: An overview of Project LISTEN | EUA | Visão geral | https://ri.cmu.edu/publications/evaluating-tutors-that-listen-an-overview-of-project-listen | Arquitetura de tutor de leitura oral | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 6 | Mostow, J. | — | Experience from a Reading Tutor that listens: Evaluation purposes, excuses, and methods | EUA | Capítulo metodológico | https://www.ri.cmu.edu/?p=17056 · DOI 10.4324/9781003417965-6 | Experimentos embutidos no produto | **VERIFICADA** — Crossref (busca bibliográfica) |
| 7 | Mostow, J.; Nelson-Taylor, J.; Beck, J. | 2013 | Computer-guided oral reading versus independent practice (J. Educ. Computing Research) | EUA | Estudo controlado | https://www.istation.com/hubfs/6.%20Research/Full%20Research%20Studies/COMPUTER-GUIDEDORALREADINGVERSUS%20INDEPENDENTPRACTICE.pdf · DOI 10.2190/ec.49.2.g | Ganho mesmo com ASR imperfeito | **VERIFICADA** — Crossref (busca bibliográfica) |
| 8 | Banerjee, S.; Beck, J.; Mostow, J. | 2003 | Evaluating the effect of predicting oral reading miscues (Eurospeech) | EUA | Artigo técnico | https://www.isca-archive.org/eurospeech_2003/banerjee03_eurospeech.pdf · DOI 10.21437/eurospeech.2003-791 | Evitar falso "erro" | **VERIFICADA** — Crossref (busca bibliográfica) |
| 9 | Aist, G.; Mostow, J. | 2009 | (Interspeech 2009 paper, Project LISTEN) | EUA | Artigo técnico | https://www.isca-archive.org/interspeech_2009/aist09_interspeech.pdf · DOI 10.21437/interspeech.2009-213 | Dificuldade da fala infantil | **VERIFICADA** — Crossref (busca bibliográfica); título: Designing spoken tutorial dialogue with children to elicit predictable but educationally valuable responses |
| 10 | Alkhatlan, A.; Kalita, J. | 2018 | Intelligent Tutoring Systems: A Comprehensive Historical Survey with Recent Developments | EUA | Revisão (arXiv) | https://arxiv.org/pdf/1812.09628 · DOI 10.5120/ijca2019918451 | Componentes de um STI | **VERIFICADA** — Crossref (busca bibliográfica); DOI da versão publicada (IJCA, 2019); ano no Crossref: 2019 |
| 11 | Instructure (para Amira Learning) | 2024 | Amira Learning in Louisiana Public Schools: ESSA Level II Study (2023-24) | EUA | Quase-experimento (fornecedor) | https://explore.amiralearning.com/hubfs/Amira-Learning-Louisiana-Public-Schools-Research-Study.pdf | Dose-resposta de uso | **VERIFICADA** — ERIC ED677055; no ERIC: Shah & Scanlan, 2025 |
| 12 | ERIC (registro do estudo Amira) | 2024 | ERIC ED677055 | EUA | Registro bibliográfico | https://karla.hds.hebis.de/EdsRecord/eric%252CED677055 | Confirmação de indexação | **VERIFICADA** — ERIC ED677055; no ERIC: Shah & Scanlan, 2025 |
| 13 | Florida Center for Reading Research / Evidence for ESSA | — | Amira — rating "Promising" (K–5) | EUA | Avaliação independente | https://fcrr.org/node/7576 | Contraponto às alegações do fornecedor | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 14 | Amira Learning | — | Using Amira to Increase Performance on DIBELS Reading Outcomes | EUA | Quase-experimento (fornecedor) | https://explore.amiralearning.com/hubfs/Research/Using%20Amira%20to%20Increase%20Performance%20on%20DIBELS%20Reading%20Outcomes-combined.pdf | Métricas DIBELS | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 15 | HMH | — | Amira (página comercial) | EUA | Material comercial | https://www.hmhco.com/amira-access | Modelo de produto/integração escolar | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 16 | Google | 2019 | Making learning to read accessible and fun with Bolo | EUA/Índia | Blog oficial | https://blog.google/technology/ai/bolo-literacy | Personagem + ASR offline | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 17 | Sattva Consulting | 2020 | Google Read Along — Impact Assessment Report | Índia | Avaliação independente | https://www.sattva.co.in/wp-content/uploads/2020/09/Sattva_Google_Read-Along-IA-Report.pdf | Papel da personagem Diya no engajamento | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 17a | Google | 2019 | Read Along pilot findings | EUA/Índia | Relatório de piloto | https://services.google.com/fh/files/misc/read_along_pilot_findings.pdf | Desenho do piloto com ASER | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 18 | Engadget | 2019 | Google made a learn-to-read app for schoolchildren in India | EUA | Imprensa | https://www.engadget.com/2019-03-06-google-bolo-learn-to-read-app-india.html | Contexto de lançamento | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 19 | Pratham USA | 2019 | Google and Pratham pilot Bolo | EUA/Índia | Comunicado | https://prathamusa.org/press/google-and-pratham-pilot-bolo | Parceria com ONG de alfabetização | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 20 | Microsoft | — | Getting started with Reading Coach | EUA | Documentação | https://support.microsoft.com/en-us/education/getting-started-with-reading-coach | Fluxo de leitura + filtros de IA | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21b | Bett UK | — | Boost literacy skills with AI-powered Reading Coach and Progress | Reino Unido | Programação de evento | https://uk.bettshow.com/agenda/boost-literacy-skills-ai-powered-reading-coach-progress | Adoção em escolas do Reino Unido | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 22 | Office Watch | 2024 | Introducing Reading Coach to enhance reading fluency with AI | Austrália | Análise | https://office-watch.com/2024/introducing-reading-coach-to-enhance-reading-fluency-with-ai | Limitações (compreensão, representação) | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21 | Lalilo / Renaissance | — | Research-based phonics and comprehension program | França/EUA | Site do produto | https://www.lalilo.com/en | IA adaptativa + ASR em fônica | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21c | Renaissance (PR Newswire) | 2024 | Research study of 15,000 K-2 students shows accelerated foundational literacy growth with Lalilo | EUA | Estudo do fornecedor | https://prnewswire.com/news-releases/research-study-of-15-000-k2-students-shows-accelerated-foundational-literacy-growth-with-lalilo-302081341.html | Fidelidade de uso > tempo de uso | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21d | Renaissance / WestEd (PR Newswire) | 2024 | New report highlights Lalilo's positive impact on improving reading | EUA | Estudo qualitativo | https://prnewswire.com/news-releases/new-report-highlights-lalilos-positive-impact-on-improving-reading-302032125.html | Percepção docente | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 23 | Barone, C. et al. | 2025 | Reading with AI: Can Technology Foster Reading Acquisition and Promote Educational Equity? | França | ECR pré-registrado | https://www.socialscienceregistry.org/trials/17205 · DOI 10.1257/rct.17205 | Modelo de avaliação rigorosa | **VERIFICADA** — Crossref (busca bibliográfica); registro AEA RCT; 1º autor no Crossref: Grellet |
| 24 | Ello | — | Read with Ello (App Store) / The Reading Coach | EUA | Produto | https://apps.apple.com/us/app/read-with-ello/id1536720182 ; https://www.ello.com/the-reading-coach | Biblioteca decodificável + ASR fonêmico | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 24b | Ello (Yahoo Finance, press release) | — | Ello leverages GenAI to launch largest… | EUA | Comunicado | https://finance.yahoo.com/news/ello-leverages-genai-launch-largest-131500632.html | Dados de fala infantil como diferencial | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 25 | Xu, Y. et al. | 2021 | Dialogic reading with a conversational agent (Child Development) — PDF eScholarship | EUA | ECR 2×2 (n=117) | https://escholarship.org/content/qt1rw6t612/qt1rw6t612.pdf?t=rwvstk · DOI 10.1111/cdev.13708 | Agente replica leitura dialógica | **VERIFICADA** — Crossref (busca bibliográfica); título: Dialogue with a conversational agent promotes children's story comprehension via enhancing engagement (Xu et al.; Crossref: 2022) |
| 26 | Xu, Y. et al. | 2021 | Same benefits, different communication patterns (Computers & Education) | EUA | Experimento | https://escholarship.org/content/qt21q977wg/qt21q977wg.pdf?t=qvieop · DOI 10.1016/j.compedu.2020.104059 | Diferenças agente vs. adulto | **VERIFICADA** — Crossref (busca bibliográfica) |
| 27 | Xu, Y. et al. | 2024 | Artificial intelligence enhances children's science learning from television shows (J. Educ. Psych. 116(7)) | EUA | Experimento | https://par.nsf.gov/search/award_ids:1906321 · DOI 10.1037/edu0000889 | Perguntas contingentes em mídia | **VERIFICADA** — Crossref (busca bibliográfica) |
| 28 | AIED 2021 | 2021 | Programa interativo AIED 2021 (agente em "Elinor Wonders Why") | Países Baixos | Anais | https://aied2021.science.uu.nl/file/AIED2021_interactive_updated.pdf | ~10 momentos de conversa/episódio | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 29 | Children and Screens (Xu, Y.) | — | AI's impact on children's social and cognitive development | EUA | Síntese de especialista | https://www.childrenandscreens.org/learn-explore/research/ais-impact-on-childrens-social-and-cognitive-development-ying-xu-phd/ | Riscos/benefícios sociais | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 30 | UNICEF Innocenti | 2025 | Guidance on AI and Children (3.0) | Itália (internac.) | Diretriz | https://www.unicef.org/innocenti/reports/policy-guidance-ai-children | 10 requisitos; AI companions; checklist | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 31 | UNRIC | 2025 | UNICEF: Guidance on AI and children | Bélgica (ONU) | Resumo | https://unric.org/en/unicef-guidance-on-ai-and-children/ | Síntese da v3.0 | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 32 | YouthREX | 2025 | Guidance on AI and Children: Recommendations… | Canadá | Resumo | https://youthrex.com/report/guidance-on-ai-and-children-recommendations-for-ai-policies-and-systems-that-uphold-child-rights/ | Leitura aplicada | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 33 | UN Innovation Network (UNICEF) | 2021 | Policy Guidance on AI for Children | Internacional | Diretriz (v2) | https://uninnovation.network/innovation-library/policy-guidance-on-ai-for-children | Base histórica | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 34 | UN News | 2023 | UNESCO calls for regulations on AI use in schools | Internacional | Notícia oficial ONU | https://news.un.org/en/story/2023/09/1140477 | Idade, validação, formação docente | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 35 | TechXplore (AFP) | 2023 | UN calls for age limits for AI tools in schools | França/EUA | Imprensa | https://techxplore.com/news/2023-09-age-limits-ai-tools-schools.amp | Debate 13 vs. 16 anos | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 36 | US Dept. of Education, OET | 2023 | AI and the Future of Teaching and Learning — core messages | EUA | Diretriz governamental | https://www2.ed.gov/documents/ai-report/ai-report-core-messages.pdf | Humans in the loop | **VERIFICADA** — ERIC ED631097; relatório completo indexado no ERIC (2023) |
| 37 | eSpark | — | AI in Education: Keeping Humans in the Loop | EUA | Síntese | https://www.esparklearning.com/blog/ai-in-education-humans-in-the-loop/ | Onde o professor entra | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 38 | ITIF | 2023 | The Department of Education Shouldn't Treat Human in the Loop as a Silver Bullet for AI | EUA | Análise crítica | https://itif.org/publications/2023/07/19/the-department-of-education-shouldnt-treat-human-in-the-loop-as-a-silver-bullet-for-ai/ | Equilíbrio autonomia × supervisão | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 39 | ITU | 2026 | Documento informativo CLCWG-COP (S26-CLCWGCOP24-INF-0009) | Suíça | Documento de governança | https://www.itu.int/dms_pub/itu-s/md/26/clcwgcop24/inf/S26-CLCWGCOP24-INF-0009!!PDF-E.pdf | Proteção infantil online e IA | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 40 | NSF PAR | — | Publicações do award 2415882 (linha de pesquisa em IA e crianças) | EUA | Repositório | https://par.nsf.gov/search/award_ids:2415882 | Acompanhar publicações novas | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 41 | Beck, J.; Jia, P.; Mostow, J. | — | Automatically assessing oral reading fluency in a computer tutor | EUA | Artigo técnico | https://typeset.io/pdf/automatically-assessing-oral-reading-fluency-in-a-computer-64jmt5nbh0.pdf | ASR como medida de fluência | **NÃO CHECÁVEL** — periódico TICL sem DOI no Crossref; link bloqueado |
| 42 | Common Sense Education | — | Lalilo review | EUA | Resenha independente | https://commonsense.org/education/reviews/lalilo | Critérios de avaliação de apps | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 43 | Kulik & Fletcher (cópia acadêmica) | 2016 | Effectiveness of ITS: A Meta-Analytic Review | Israel (repositório MOFET/MACAM) | Repositório | https://education-eng.macam.ac.il/article/4304 | Resumo em repositório de formação docente | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |

> Observação: numeração com sufixos (17a, 21b, 21c, 21d, 24b) reflete fontes adicionadas a um item; total de **43 fontes**. Itens com "—" no ano não tiveram data confirmada nos resultados de busca.

---

## 5. Lacunas a pesquisar (sem fonte verificada nesta sessão)

- Desempenho de ASR (Whisper, wav2vec2 etc.) em **fala infantil em português brasileiro**; corpora infantis pt-BR.
- Estudos com LLM gerando **textos decodificáveis** com vocabulário controlado (literatura 2023–2026).
- Khanmigo: arquitetura de guard-rails e avaliações publicadas.
- OCDE — Digital Education Outlook (2023/2026) sobre IA generativa.
- Base legal brasileira (LGPD art. 14; ECA; normas recentes sobre crianças em ambientes digitais; orientações da ANPD) e ICO Age Appropriate Design Code (Reino Unido) — domínios bloqueados nesta sessão; delegar à frente jurídica/inclusão (doc. 05).
- Ferramentas de IA do MEC/redes estaduais para professores brasileiros.
