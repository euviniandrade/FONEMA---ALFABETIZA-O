# 05 — Inclusão, neurodivergência, acessibilidade e legal/privacidade

> **Frente:** inclusão/neurodivergência + acessibilidade + legal/privacidade
> **Projeto:** plataforma web + app de alfabetização pelo método fônico (pt-BR), guia "Sofia", vozes neurais, jogos, reconhecimento de fala e possivelmente câmera.
> **Data da pesquisa:** novembro de 2026
> **Status:** pesquisa. **Não é parecer jurídico.** Os itens marcados com ⚖️ precisam de revisão por advogado(a) especializado(a) em proteção de dados e direito da criança.

**Como a pesquisa foi feita:** buscas na web, priorizando fontes primárias (W3C, CAST, FTC, Google, Apple, ASHA, IDA, DSE, ANPD/gov.br, textos de lei transcritos) e revisões sistemáticas. **Limitação:** o ambiente de pesquisa não conseguiu abrir `planalto.gov.br` nem alguns sites de escritórios (bloqueio de rede). Por isso, os textos de lei foram conferidos em transcrições e análises secundárias (Câmara, Senado, LegJur, escritórios, Agência Gov, FGV). Quando as fontes divergem sobre o número de um artigo, a divergência está indicada. **Antes de qualquer uso formal, confira tudo no texto compilado do Planalto.**

---

## 1. Resumo executivo

1. **Projetar para todos e permitir ajustes por perfil.** O Desenho Universal para a Aprendizagem (DUA/UDL 3.0, CAST) e o WCAG 2.2 servem de base. Sobre essa base entra uma camada de **perfil sensorial e de aprendizagem configurável pelo responsável**: som, animação, contraste, fonte, velocidade da voz, sem tempo limite, "modo calmo". Isso é mais confiável do que presets fixos por diagnóstico, porque a variação dentro de cada perfil (por exemplo, no TEA) é muito grande.
2. **A fônica sistemática e explícita continua sendo o núcleo.** Ela é essencial na dislexia (IDA: *Structured Literacy*) e útil para a maioria das crianças. Os perfis mudam o **caminho de entrada** e o **ritmo**, não o objetivo:
   - **Síndrome de Down:** começar por palavra inteira e frases (*See and Learn*, da DSE) e chegar à fônica depois.
   - **TEA com hiperlexia:** a decodificação costuma estar à frente da compreensão. É preciso reforçar compreensão e linguagem oral.
   - **Surdez:** abordagem bilíngue, com Libras como L1 e português escrito como L2. A fônica baseada em som tem papel limitado e precisa de pistas visuais.
3. **O reconhecimento de fala (ASR) é o recurso mais arriscado pedagogicamente.** Em crianças, os modelos têm muito mais erro do que em adultos, e o erro piora com fala atípica (TDL, apraxia, Down, perda auditiva). Recomendações:
   - Nunca usar ASR como "juiz" que reprova a criança.
   - Oferecer sempre uma alternativa sem fala (tocar ou apontar).
   - Ter um modo "ouvir e celebrar a tentativa".
   - Desligar a avaliação por voz por padrão nos perfis TDL/apraxia.
4. **A voz e a imagem do rosto da criança são o maior risco legal.** Na LGPD, dado biométrico é **dado sensível** (art. 5º, II), e o tratamento de dados de crianças segue o art. 14 (melhor interesse e consentimento específico e em destaque de um dos pais, entre outras bases admitidas pela ANPD). Recomendação de arquitetura:
   - Processar a fala **no dispositivo**.
   - **Não armazenar áudio**, nem usar a voz para identificar a criança.
   - **Câmera desligada por padrão e fora do MVP.** Se entrar, deve funcionar só localmente, sem gravação e com consentimento destacado.
5. **O ECA Digital (Lei 15.211/2025) está em vigor desde 17/03/2026** e foi regulamentado pelo Decreto 12.880/2026. O app é um produto "direcionado a crianças" e por isso está no escopo. Exigências principais:
   - privacidade e proteção no nível mais alto **por padrão**;
   - ferramentas de **supervisão parental**;
   - **proibição de loot boxes**;
   - proibição de perfilamento para publicidade;
   - mecanismos confiáveis de aferição/verificação de idade, que a ANPD ainda está detalhando;
   - multas de até 10% do faturamento, limitadas a R$ 50 milhões por infração.
6. **Lojas de aplicativos.** Na Apple Kids Category são proibidos analytics e anúncios de terceiros, e links e compras precisam ficar atrás de um **parental gate**. No Google Play Families, se houver anúncios, só é permitido SDK autocertificado, e o ID de publicidade não pode ser transmitido. **Recomendação: sem anúncios e sem SDKs de terceiros que coletem dados da criança.**
7. **Triagem sem diagnóstico.** A plataforma pode registrar indicadores com valor preditivo conhecido (consciência fonológica, conhecimento de letras, nomeação rápida/RAN) e a **resposta à instrução** ao longo do tempo. Com isso, pode **sinalizar ao responsável** uma "dificuldade persistente" e sugerir avaliação multiprofissional (ABD; Lei 14.254/2021). Nunca deve rotular a criança com diagnóstico, nem exibir esse tipo de rótulo para ela.

---

## 2. Base transversal: DUA/UDL, WCAG 2.2 e acessibilidade cognitiva

### 2.1 DUA / UDL 3.0 (CAST)
- A versão 3.0 foi lançada em 30/07/2024 [F1, F2]. Ela mantém os três princípios:
  - **engajamento** (o "porquê");
  - **representação** (o "quê");
  - **ação e expressão** (o "como").
- A 3.0 acrescenta a identidade do aprendiz (o "quem") e a valorização de **formas diversas de comunicação**. "Physical Action" virou "Interaction" e "Comprehension" virou "Building Knowledge" [F2].
- **Tradução para o produto:**
  - **Engajamento:** escolhas de tema (incluindo interesses da criança), metas visíveis, feedback que celebra o esforço e autorregulação (pausas e o botão "preciso de um tempo").
  - **Representação:** cada estímulo em múltiplos canais (som + letra + imagem + boca/articulação + Libras quando o perfil for de surdez), com velocidade da voz ajustável e texto ampliável.
  - **Ação e expressão:** a criança pode responder **falando, tocando, arrastando (com alternativa sem arrastar), apontando ou por CAA**.

### 2.2 WCAG 2.2 aplicado a crianças
O WCAG 2.2 traz 9 critérios novos e remove o 4.1.1 [F3]. Os mais relevantes para crianças pequenas:

| Critério | Nível | Aplicação concreta |
|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Mínimo de 24×24 px CSS. **Para crianças, usar ≥ 48–64 px** (decisão de design, não exigência normativa). |
| 2.5.7 Dragging Movements | AA | Todo jogo de "arrastar a letra" precisa de alternativa por toque simples (tocar na letra e depois no destino). |
| 2.4.11 Focus Not Obscured | AA | Barras fixas (Sofia, menu) não podem cobrir o elemento em foco. |
| 2.3.3 Animation from Interactions | AAA | Respeitar `prefers-reduced-motion` e oferecer o próprio interruptor "menos movimento" [F4]. Adotar mesmo sendo AAA. |
| 2.2.1 Timing Adjustable | A | Nada de tempo limite obrigatório. Se houver cronômetro, ele deve poder ser desligado ou estendido. *(Requisito exato não verificado nesta pesquisa; conferir o texto oficial.)* |
| 2.2.2 Pause, Stop, Hide | A | Animações automáticas precisam de controle de pausa. *(Conferir limiares no texto oficial.)* |

- **Contraste, legendas e baixa visão:** seguir os critérios de contraste (1.4.x) e de legendas (1.2.x) do WCAG.
- **Âncora legal no Brasil:** o art. 63 da LBI torna obrigatória a acessibilidade de sites mantidos por empresas com sede ou representação no país, conforme as melhores práticas internacionais (na prática, WCAG) [F5]. Existe norma ABNT específica, a NBR 17225:2025, citada em análise do CONPEDI [F5]. ⚖️ Confirmar se o art. 63 alcança apps nativos e qual é o nível exigido.

### 2.3 Acessibilidade cognitiva (W3C COGA)
A nota do W3C *Making Content Usable for People with Cognitive and Learning Disabilities* (2021) complementa o WCAG com objetivos e padrões de design [F6]:
- ícones e termos familiares;
- navegação previsível;
- ajudar a entender "o que é e como usar";
- evitar sobrecarga de memória;
- personalização.

Deve servir de checklist de UX para as telas da criança e do responsável.

### 2.4 Painel de "Perfil sensorial e de aprendizagem" (proposta)
Configurado pelo responsável, com presets sugeridos por perfil, mas **sempre editável**:

- **Som:** volume dos efeitos separado do volume da voz da Sofia; sem música de fundo; sem sons súbitos; "som suave".
- **Movimento:** animações completas, reduzidas ou nenhuma. Respeitar o sistema operacional (`prefers-reduced-motion`).
- **Visual:**
  - contraste normal, alto ou suave (fundo creme);
  - tamanho da letra;
  - fonte (padrão, Andika ou Lexend; OpenDyslexic como opção estética, ver §5);
  - espaçamento entre letras e palavras;
  - redução de elementos decorativos.
- **Voz:** velocidade da Sofia (0,75×–1,25×), repetição ilimitada, legendas sempre visíveis.
- **Tempo:** sem tempo limite (padrão), duração da sessão configurável e timer visual opcional.
- **Fala:** reconhecimento de fala ligado, "só incentivar" (sem avaliar) ou desligado (responde tocando).
- **Comunicação:** respostas por pictogramas/CAA e Libras (vídeo).
- **Feedback:** celebração intensa, discreta ou neutra. Erro sem som negativo e sem vermelho piscando.
- **Modo calmo:** um único botão que aplica "sem música, animação mínima, cores suaves, sem confete, ritmo lento".

Fundamento: guias práticos e a literatura de design para crianças autistas recomendam evitar sons súbitos e mudanças visuais abruptas, mas sem deixar a cena totalmente estática, e oferecer controles ao usuário [F7]. Faltam limiares consolidados, então **ajustes do usuário > padrões fixos** [F7].

---

## 3. Perfis: evidências e implicações

### 3.1 TEA (autismo)
- **Hiperlexia.** A revisão sistemática de Ostrolenk et al. (2017; 82 estudos) descreve a hiperlexia como leitura avançada em relação à compreensão ou à inteligência geral, aquisição precoce sem ensino explícito e forte orientação ao material escrito. Os autores afirmam que esse perfil caracteriza uma parte substancial do espectro e discutem usar a habilidade como alavanca de intervenção [F8].
- **Decodificação × compreensão.** Revisões indicam que muitos autistas decodificam bem e compreendem pior. Leitura de palavras e linguagem oral são essenciais para a compreensão. A revisão de Vale et al. (2022) encontrou evidências mistas sobre onde estão as fraquezas [F8, F9].
  - **Implicação:** não parar em "decodificou a palavra". Incluir verificação de sentido (palavra → imagem, frase → cena) e linguagem oral.
- **Apoios visuais e previsibilidade.** O relatório NCAEP 2020 classifica *Visual Supports* como prática baseada em evidência (104 estudos de caso único e 2 estudos de grupo) [F10]. Uma revisão de 2025 alerta que a evidência isolada de que **agendas visuais** melhoram transições é insuficiente, porque elas costumam vir junto com outros componentes [F10].
  - **Implicação:** usar "trilha da sessão" visual (o que vem agora e o que vem depois), aviso antes de cada transição e layout sempre igual. Tratar isso como apoio razoável e de baixo risco, sem prometer milagre.
- **Sobrecarga sensorial:** ver §2.4. Sem autoplay de áudio, sem sons súbitos e com controles granulares [F7].
- **CAA/PECS.** Há evidência razoável de que é possível ensinar leitura de palavras isoladas a usuários de CAA, inclusive autistas (revisão de Mandak, Light & Boyle, 2018, com 9 estudos de caso único). A evidência sobre compreensão é escassa [F11].
  - **Implicação:** modo de resposta sem fala (pictogramas e tocar na letra/palavra) e possibilidade de integrar o vocabulário da prancha de CAA da criança.
- **Interesses restritos como motivação.** Estudos pequenos e qualitativos indicam mais engajamento e menos necessidade de prompts quando a tarefa usa o interesse da criança (Wood, 2019, 10 crianças) [F12].
  - **Implicação:** temas escolhíveis (dinossauros, trens, planetas) para as palavras e cenários dos jogos, respeitando a sequência fônica.
- **ABA × abordagens naturalistas (posição neutra).** A meta-análise de Sandbank et al., conforme comentário secundário, encontrou efeitos positivos em todas as abordagens. Restrita a ECRs de qualidade, o efeito se mantém só para abordagens do desenvolvimento e NDBI, e não há ECRs de qualidade suficientes para comparar com ABA. Revisões apontam evidência inconsistente [F13]. NDBI é a sigla criada por Schreibman et al. (2015) para integrar ciência comportamental e desenvolvimento [F13].
  - **Implicação:** a plataforma **não deve se posicionar como intervenção para TEA** nem adotar uma linha terapêutica. Pode se apresentar como ferramenta educacional complementar, compatível com o plano terapêutico da família.
- **Lei Berenice Piana (12.764/2012):** pelo art. 1º, §2º, a pessoa com TEA é considerada pessoa com deficiência para todos os efeitos legais [F14]. Portanto, valem as garantias da LBI.

### 3.2 TDAH
- **Gamificação com feedback imediato.** Um ECR de 2025 (Frontiers in Education; 80 crianças de 6–12 anos com TDAH; 8 semanas) comparou o mesmo conteúdo com e sem feedback imediato, recompensas e níveis. O grupo gamificado melhorou atenção e desempenho acadêmico, inclusive em leitura [F15]. Um piloto (JMIR Human Factors 2025, 22 crianças, sem grupo controle) usou sessões curtas e frequentes [F15].
- **Pausas ativas.** O protocolo Break4Brain (2024) cita meta-análises em que atividade física breve melhora o comportamento "on-task" em sala. Também afirma que ainda **não há** estudos sobre o efeito no desempenho acadêmico de crianças com TDAH, e o ECR está em andamento [F16].
- **Timers visuais.** A evidência é basicamente de fabricantes e relatos, sem ensaios controlados, mas o recurso é barato e de baixo risco [F16].
- **Implicações:**
  - micro-sessões de 5–10 min configuráveis;
  - feedback imediato a cada item;
  - progresso visível (barra/trilha);
  - pausa de movimento opcional e guiada pela Sofia ("pule como sapo 3 vezes");
  - timer visual **opcional**;
  - tela limpa, sem distratores;
  - uma tarefa por tela.
- **Cuidado com o ECA Digital:** recompensas devem ser intrínsecas à aprendizagem. Nada de loot box, nada de recompensa aleatória ligada a dinheiro e nada de mecânica compulsiva de retenção (ver §6).

### 3.3 Dislexia
- **Structured Literacy (IDA).** Segundo a definição de trabalho de julho/2024 da IDA, é uma **abordagem, não um programa**: sistemática e cumulativa, explícita e diagnóstica. A associação som-símbolo deve ser ensinada nas duas direções, visual→auditivo (ler) e auditivo→visual (escrever). Os elementos são fonologia, som-símbolo, sílabas, morfologia, sintaxe e semântica. É "essencial" para quem tem dislexia e benéfica para todos [F17]. Orton-Gillingham é a raiz histórica do componente multissensorial. *(Esta pesquisa não verificou, nas fontes consultadas, a evidência específica do componente multissensorial.)*
- **ABD (Associação Brasileira de Dislexia).** A dislexia se caracteriza por dificuldade de reconhecer letras e associá-las aos sons. O diagnóstico é de **equipe multidisciplinar** (fonoaudiólogo, psicopedagogo e neuropsicólogo, entre outros). Sintomas isolados não fecham diagnóstico. Com histórico familiar, a avaliação deve ser precoce [F18].
- **Fontes tipográficas:**
  - **OpenDyslexic:** sem ganho de velocidade ou precisão em crianças com dislexia (Wery & Diliberto, Annals of Dyslexia, 12 alunos), e os alunos não a preferiram. Resumos indicam que "fontes para dislexia" não superam fontes comuns e às vezes ficam piores [F19].
  - **Lexend:** há estudos dos próprios criadores e relatos de ganho de fluência, mas sem replicação independente encontrada [F20].
  - **Andika (SIL):** projetada para alfabetização e leitores iniciantes, com 'a' e 'g' de um andar e letras pouco confundíveis. A justificativa é de design, sem estudos de desfecho [F20].
  - **Recomendação:** fonte padrão **sem serifa com 'a' e 'g' de um andar (Andika)**. Opções para o responsável: Lexend e OpenDyslexic, sem prometer efeito terapêutico. Espaçamento ampliado ajustável e linhas curtas. As evidências sobre cores ou overlays não foram verificadas nesta pesquisa, então não fazer promessas sobre isso.
- **Lei 14.254/2021:** prevê acompanhamento integral de educandos com dislexia, TDAH ou outro transtorno de aprendizagem (identificação precoce, encaminhamento para diagnóstico, apoio educacional e apoio terapêutico), na educação básica pública e privada [F21]. O dever é do poder público e das escolas, não do app. Mesmo assim, o relatório para escola e família pode **apoiar a identificação precoce** (ver §7).

### 3.4 Síndrome de Down
- **DSE "See and Learn":** começa por **palavras inteiras e frases simples** para apoiar a linguagem. Etapas posteriores trabalham fônica. Estudos indicam que crianças com Down aprendem bem palavras por reconhecimento visual e têm mais dificuldade com fônica. Um vocabulário visual maior está associado a mais progresso na fônica posterior [F22]. Ressalva: o material é da própria DSE e inclui relatos de famílias.
- **Perfil sensorial:** perda auditiva é frequente e as estimativas variam muito. A NDCS estima perda sensorioneural permanente em cerca de 10–15%, e a perda condutiva é mais comum. Guias relatam forças visuais e recomendam letra **maior e mais forte** [F23].
- **Implicações:**
  - trilha "Palavra inteira → Fônica" selecionável;
  - fotos reais e familiares (com upload local pelos pais, ver privacidade);
  - letra grande;
  - mais repetição e espaçamento;
  - ritmo mais lento;
  - ASR tolerante (fala com inteligibilidade reduzida é comum; ver §3.5);
  - legendas e pistas visuais sempre presentes.

### 3.5 TDL (transtorno do desenvolvimento da linguagem) e apraxia de fala
- **TDL (CATALISE):** o termo é *Developmental Language Disorder* para dificuldades de linguagem que prejudicam o funcionamento diário sem causa biomédica conhecida. Pode coocorrer com TDAH e não exige discrepância entre QI verbal e não verbal [F24].
- **Apraxia de fala na infância (ASHA):** é um distúrbio motor de **planejamento** dos movimentos da fala, sem fraqueza muscular. Não se resolve sozinha e requer fonoaudiologia intensiva. Pode vir acompanhada de dificuldades de leitura e escrita [F25].
- **ASR em crianças:** um *position paper* de 2024 relata degradação significativa de precisão em fala infantil, inclusive com o Whisper [F26]. Em tutores de leitura, pausas, repetições e hesitações pioram o reconhecimento. Há o risco de o sistema dizer que a criança errou quando o erro é dele [F26].
- **Regras de produto (não frustrar):**
  1. **No perfil TDL/apraxia, a avaliação automática da pronúncia vem desligada por padrão.** A criança pode falar, e a Sofia celebra a tentativa ("Que bom ouvir você!") sem dar nota.
  2. Em todos os perfis, toda tarefa com fala tem uma alternativa equivalente por toque, e o progresso na trilha **nunca depende só do ASR**.
  3. Usar o ASR para **leitura** (a criança leu a palavra-alvo?) com limiar tolerante, e **não** para avaliar articulação. A plataforma não é terapia de fala.
  4. Depois de 2 tentativas não reconhecidas, oferecer "toque na palavra que você leu" e seguir em frente, sem penalidade e sem som de erro.
  5. Recursos de "ver a boca" (vídeo/animação da articulação da Sofia) são úteis como **modelo**. Analisar a boca da criança pela câmera não é recomendado (ver §6.6).
  6. Mostrar ao responsável a orientação: "Se seu filho faz fonoterapia, combine com o(a) fonoaudiólogo(a) como usar a parte de fala."

### 3.6 Deficiência auditiva / surdez
- **Marco legal:** a Lei 10.436/2002 reconhece a Libras como meio legal de comunicação e expressão, sem substituir o português escrito. O Decreto 5.626/2005 a regulamenta, e a Lei 14.191/2021 incluiu a educação bilíngue de surdos na LDB [F27].
- **Pedagogia:** a literatura brasileira trata a Libras como L1 e o português escrito como L2, e destaca recursos visuais [F28]. A evidência é sobretudo qualitativa.
- **Implicações:**
  - legendas em 100% das falas da Sofia;
  - sinal visual para todo evento sonoro (ícone ou flash suave, nunca piscando rápido);
  - vídeos em Libras (intérprete/ator surdo) para instruções e vocabulário, em fase futura;
  - perfil "surdo/Libras" que reorganiza a trilha com ênfase em **palavra escrita ↔ sinal ↔ imagem**, com fônica opcional;
  - para crianças com aparelho auditivo ou implante coclear, que muitas vezes usam via oral, manter a fônica com reforço visual da articulação.
  - Recomenda-se consultoria com educadores surdos.

### 3.7 Baixa visão / deficiência visual
- WCAG: contraste, ampliação sem perda de função e compatibilidade com leitores de tela (TalkBack/VoiceOver) nas telas do responsável e nos menus [F3].
- **Implicações:**
  - modo alto contraste;
  - letras enormes (zoom do cartão de letra);
  - narração de tudo pela Sofia;
  - alvos grandes;
  - sem informação só por cor;
  - descrição de imagens.
- Para cegueira total, a alfabetização em braille está fora do escopo do produto visual. Pode-se sinalizar isso à família e oferecer só os módulos auditivos (consciência fonológica). *(Esta pesquisa não buscou fontes sobre braille.)*

---

## 4. Matriz "perfil → adaptações concretas na plataforma"

| Perfil | Trilha / pedagogia | Interface e sensorial | Voz / ASR | Feedback e motivação | Para o responsável |
|---|---|---|---|---|---|
| **TEA** | Fônica sistemática + verificação de **compreensão** (palavra↔imagem, frase↔cena). Trilha hiperléxica: avança rápido na decodificação e reforça o sentido. Vocabulário de interesse. | Modo calmo como opção destacada, layout fixo, "trilha da sessão" visual (agora → depois), aviso antes das transições, sem autoplay, sem sons súbitos, animação reduzida. | ASR opcional. Resposta por toque ou pictograma (CAA) sempre disponível. Velocidade da Sofia ajustável. Linguagem literal (sem metáforas). | Celebração configurável (discreta/neutra), recompensas previsíveis, temas de interesse (dinossauros, trens etc.). | Configurar interesses, importar vocabulário da prancha de CAA, ver relatório de compreensão × decodificação. |
| **TDAH** | Micro-lições de 5–10 min, um objetivo por sessão, revisão espaçada. | Tela limpa, uma tarefa por tela, timer visual opcional, barra de progresso. | ASR com resposta rápida. | Feedback imediato item a item, níveis curtos, conquistas ligadas a aprender (sem aleatoriedade e sem loot box), pausa de movimento guiada pela Sofia. | Limite diário configurável, sugestão de horário, relatório curto. |
| **Dislexia** | Structured Literacy: sequência fônica explícita e cumulativa, leitura **e** escrita (som→letra), sílabas, morfologia depois; muita prática distribuída. Atividades multissensoriais (traçar a letra, ouvir, ver a boca). | Fonte Andika (opções Lexend/OpenDyslexic, sem promessa terapêutica), espaçamento ampliado, linhas curtas, fundo suave opcional, texto grande. | Leitura em voz alta tolerante a hesitação e sem penalidade de tempo. | Valorizar a precisão antes da velocidade. Nunca exibir ranking. | Sinalização de dificuldade persistente com orientação de avaliação multiprofissional (ABD) e menção à Lei 14.254/2021 para a escola. |
| **Síndrome de Down** | Trilha "Palavra inteira → frases → fônica" (inspirada em *See and Learn*), fotos reais e familiares, muita repetição. | Letra grande e forte, poucos itens por tela, ritmo lento, legendas sempre ativas. | ASR em modo "incentivar" por padrão, com limiar muito tolerante. Sofia mais lenta. | Celebração calorosa, progresso em passos pequenos. | Upload de fotos da família (processadas localmente), lembrete para avaliar a audição periodicamente. |
| **TDL / apraxia** | Mais apoio de linguagem oral e vocabulário. Fônica com resposta receptiva (ouvir e tocar) predominante. | Padrão comum, com opção de modo calmo. | **Avaliação automática de pronúncia DESLIGADA por padrão.** Fala celebrada sem nota. Modelo visual da boca da Sofia. Alternativa por toque obrigatória. | Nunca som de erro ligado à fala. A progressão não depende de falar. | Orientação para combinar o uso com a fonoaudióloga. Aviso de que não substitui terapia. |
| **Deficiência auditiva** | Perfil Libras/bilíngue: palavra escrita ↔ sinal ↔ imagem, fônica opcional. Perfil "oralizado/IC": fônica + leitura labial da Sofia + legendas. | Legendas sempre ativas, sinal visual para todo som, nada de informação só sonora, vídeos em Libras (fase 2). | ASR desligável. Para IC, com tolerância alta. | Feedback visual (estrelas, gestos da Sofia). | Escolha de perfil (Libras × oral), informação sobre educação bilíngue. |
| **Baixa visão** | Mesma trilha, com cartões de letra ampliados. | Alto contraste, zoom, alvos ≥ 64 px, sem informação só por cor, compatível com TalkBack/VoiceOver (menus e telas do responsável). | Sofia narra tudo, inclusive as instruções visuais. | Feedback sonoro + háptico. | Configurar contraste e tamanho, orientação sobre braille/serviços especializados se for o caso. |

**Regras globais para todos os perfis:**
- sem tempo limite obrigatório;
- toda interação de arrastar tem alternativa por toque;
- toda tarefa de fala tem alternativa sem fala;
- o erro nunca é punitivo;
- os perfis são **sugestões editáveis**, nunca rótulos visíveis para a criança.

---

## 5. Notas de evidência (o que NÃO prometer)
- Não prometer que fontes "para dislexia" melhoram a leitura [F19, F20].
- Não prometer que o app "trata" autismo, TDAH, dislexia ou apraxia. Ele é um recurso educacional.
- Não citar números de eficácia próprios sem estudo. Mesmo para o GraphoGame Brasil, a evidência específica publicada e independente é limitada, e os resultados do "Tempo de Aprender" (MEC) não isolam o efeito do app [F29].
- Timers visuais e pausas ativas são de baixo risco, mas a evidência é preliminar [F16].

---

## 6. Legislação e privacidade

### 6.1 LGPD (Lei 13.709/2018) — crianças e dados sensíveis
- **Art. 14:** o tratamento de dados de crianças deve atender ao **melhor interesse**. O §1º exige **consentimento específico e em destaque** de pelo menos um dos pais ou do responsável legal. O §3º admite coleta sem consentimento só para contatar os pais (uma única vez, sem armazenamento) ou para proteção da criança [F30].
- **Enunciado CD/ANPD nº 1/2023:** o tratamento pode se apoiar nas hipóteses dos arts. 7º ou 11 (não só no consentimento), desde que observado o melhor interesse [F30]. ⚖️ Definir a base legal de cada finalidade, por exemplo:
  - execução de contrato com o responsável para a conta;
  - consentimento específico para voz;
  - legítimo interesse **não** recomendado para dados da criança sem análise.
- **Art. 5º, II e art. 11 (dados sensíveis):** dado biométrico é sensível. As hipóteses do art. 11 são mais restritas e incluem o consentimento específico e destacado. A ANPD abriu Tomada de Subsídios sobre biometria e reconhecimento facial e tem notas técnicas que reforçam alternativas menos invasivas [F31].
  - **Não foi encontrada orientação específica da ANPD sobre voz.** Pelo conceito de biometria, a voz usada para identificar alguém é biométrica. A voz usada só para transcrever é discutível. ⚖️ Tratar de forma conservadora, como sensível.
- **Medidas recomendadas:**
  - minimização: apelido em vez de nome completo, sem foto da criança na nuvem, faixa etária em vez de data de nascimento quando bastar;
  - RIPD/DPIA antes do lançamento;
  - encarregado (DPO);
  - política de privacidade em linguagem simples, com versão para criança;
  - painel de direitos do titular (acesso, exclusão);
  - retenção mínima.

### 6.2 ECA (Lei 8.069/1990)
- **Art. 17:** o direito ao respeito abrange a **preservação da imagem e da identidade** da criança [F32]. Reforça que imagem e voz não devem ser expostas nem reutilizadas (por exemplo, em marketing) sem base sólida. ⚖️ Para uso em divulgação, exigir autorização específica e separada.

### 6.3 ECA Digital (Lei 15.211/2025) + Decreto 12.880/2026
- **Vigência:** em vigor desde **17/03/2026** [F33, F34]. A data de sanção aparece como 17 ou 18/09/2025, conforme a fonte.
- **Escopo:** produtos e serviços de TI **direcionados a crianças e adolescentes ou de acesso provável** por eles [F35]. **A plataforma está claramente no escopo.**
- **Exigências relevantes** (numeração conforme fontes secundárias, que divergem):

| Tema | O que se sabe | Impacto no produto |
|---|---|---|
| Privacidade/proteção por padrão | Configuração no nível mais protetivo **por padrão** (art. 7º, segundo algumas fontes) [F34, F35] | Tudo começa no máximo de proteção: sem perfil público, sem chat, sem compartilhamento, analytics mínimo. |
| Supervisão parental | Ferramentas acessíveis de supervisão (arts. 16–18, conforme as fontes). A ANPD regulamenta padrões mínimos (art. 17, §1º) [F33, F34] | Painel do responsável: tempo de uso, conteúdo, configurações, exclusão de dados. |
| Contas vinculadas | Contas de usuários até 16 anos vinculadas a um responsável (art. 24, segundo fonte) [F33, F34] | A conta é sempre do responsável, e a criança é um perfil dentro dela. |
| Verificação/aferição de idade | Autodeclaração vedada para os casos exigidos. O decreto diferencia aferição × verificação e "sinal de idade". Lojas e sistemas operacionais funcionam como "porta de entrada" que fornece o sinal. A ANPD publicou orientações preliminares em 20/03/2026, com fase definitiva prevista para agosto/2026 [F33, F36] | ⚖️ Verificar quais obrigações valem para um app **infantil** (que pressupõe criança). Provável foco: confirmar que **o adulto que cria a conta e consente é maior de idade** e integrar o sinal de idade das lojas. Acompanhar as orientações definitivas da ANPD. |
| Loot boxes | **Proibidas** em jogos acessíveis a crianças e adolescentes (art. 20) [F33] | Sem caixas de recompensa ou baús aleatórios, nem pagos nem trocáveis. Recompensas determinísticas e ligadas ao aprendizado. |
| Perfilamento / publicidade | Vedado o perfilamento para direcionar publicidade a crianças e adolescentes, inclusive por análise emocional e RA/RV (art. 22) [F35] | **Sem publicidade.** A análise de emoção pela câmera também está vetada por cautela. |
| Mecânicas de engajamento | O decreto e notícias citam vedação de **rolagem infinita e autoplay** para crianças [F36] | Sessões com fim claro, sem autoplay do próximo episódio, sem "streak" punitivo. |
| Sanções | Advertência; multa de até 10% do faturamento no Brasil, limitada a **R$ 50 milhões por infração** (ou R$ 10 a R$ 1 mil por usuário); suspensão e proibição. Divergência sobre quais sanções dependem do Judiciário [F34] | Compliance desde o MVP. |
| Questionamento judicial | O partido Missão acionou o STF contra dispositivos sobre verificação de idade e jogos. Desfecho não localizado [F33] | ⚖️ Acompanhar. |

### 6.4 LBI e Berenice Piana
- **LBI (13.146/2015):**
  - art. 28: educação inclusiva, recursos de acessibilidade e tecnologia assistiva (alterado pela Lei 15.249/2025, conferir o texto atual);
  - art. 63: acessibilidade obrigatória em sites [F5].
  - Para venda a escolas e redes públicas, a acessibilidade deixa de ser diferencial e vira requisito.
- **Lei 12.764/2012:** pessoa com TEA = pessoa com deficiência para todos os efeitos legais [F14].
- **Lei 14.254/2021:** ver §3.3 [F21].

### 6.5 Regras internacionais e das lojas
- **COPPA (EUA):** emenda final publicada em 16/01/2025, em vigor desde 23/06/2025, com conformidade geral até **22/04/2026** [F37]. Pontos principais:
  - inclui **identificadores biométricos** em "informação pessoal";
  - aviso parental mais detalhado;
  - programa de segurança da informação infantil.
  - **Voz:** a gravação da voz de criança menor de 13 anos é informação pessoal e exige consentimento parental verificável. Pela *Enforcement Policy Statement* de 2017, a FTC não aplica sanção quando o áudio é usado **só para substituir texto** e **apagado imediatamente**, sem identificação por voz, sem perfilamento, sem compartilhamento, e com aviso na política de privacidade [F38]. ⚖️ Confirmar se a política segue válida depois da emenda de 2025. Ela é um bom **padrão de design** de qualquer forma.
- **GDPR (UE), art. 8:** para serviços da sociedade da informação com base em consentimento, a idade padrão é 16 anos (os Estados podem baixar até 13). Abaixo disso, exige-se consentimento dos pais com esforço razoável de verificação [F39]. O **UK Age Appropriate Design Code** (15 padrões) pede "high privacy" por padrão, geolocalização desligada e proibição de *nudge techniques* [F40]. Só é relevante se houver expansão para a Europa ou o Reino Unido.
- **Apple — Kids Category (diretriz 1.3):**
  - **sem** publicidade ou analytics de terceiros;
  - sem transmissão de dados a terceiros (exceções estreitas);
  - links externos, compras e "distrações" só atrás de **parental gate**;
  - o desenvolvedor responde pelos SDKs incluídos.
  [F41]
- **Google Play — Política para Famílias:**
  - público infantil exige cumprimento da política, sob pena de remoção;
  - anúncios só via SDK autocertificado (o programa não aceita novos participantes no momento);
  - nada de anúncios enganosos ou de clique acidental;
  - não transmitir o ID de publicidade de crianças ou de usuários de idade desconhecida.
  [F42]

### 6.6 Voz e câmera: arquitetura recomendada (privacy by design)
1. **ASR no dispositivo** como padrão (modelos on-device). O áudio cru **não sai do aparelho** e **não é armazenado**. Só se guarda o resultado pedagógico ("leu 'bola': sim/não, tentativa 2").
2. Se for preciso ASR em nuvem (por exemplo, no web): streaming sem retenção, contrato de operador (LGPD art. 39) com proibição de treino com os dados, servidor com garantias de transferência internacional (⚖️ arts. 33–36) e apagamento imediato. Aviso claro ao responsável.
3. **Sem identificação por voz** (sem voiceprint) e sem uso da voz da criança para treinar modelos. Melhorar modelos com voz infantil só via programa **separado, opt-in, com consentimento específico, de preferência anonimizado** e revisado juridicamente ⚖️.
4. **Microfone:** pedido de permissão contextual feito pelo **responsável** (parental gate), indicador visível de "ouvindo" e botão de microfone que a criança controla.
5. **Câmera:** **fora do MVP.** Se for implementada ("ver a boca"):
   - processamento só local (landmarks), sem gravar, sem enviar e sem reconhecimento facial;
   - nenhuma inferência de emoção (veto do art. 22 do ECA Digital para publicidade e cautela geral);
   - consentimento específico e destacado;
   - desligada por padrão;
   - alternativa equivalente sem câmera.
   - Avaliar se o benefício pedagógico justifica o risco. O modelo visual da boca da Sofia entrega boa parte do valor sem coletar nada.
6. **Analytics:** só first-party, agregado e sem identificadores de publicidade. Nada de SDKs de terceiros no app infantil (Apple/Google).
7. **Retenção:** relatórios pedagógicos guardados enquanto a conta estiver ativa, com exclusão total sob pedido e expurgo automático de contas inativas.

---

## 7. Triagem: sinalizar sem diagnosticar

**O que medir** (como subproduto natural das atividades, sem "teste" à parte):
- consciência fonológica;
- conhecimento de letras;
- nomeação rápida automatizada (RAN);
- memória verbal de curto prazo;
- **resposta à instrução** (a criança progride com prática?).

Pesquisas identificam RAN, consciência fonológica e conhecimento de letras como fortes preditores precoces de dislexia, com contribuição única do RAN. Ferramentas curtas e até apps aplicados na entrada escolar previram déficits de leitura no fim do 1º ano. A estabilidade da identificação de risco **varia com os pontos de corte** [F43].

**Como sinalizar:**
- Só para o **responsável** (e para a escola, se houver vínculo autorizado), **nunca para a criança**.
- Linguagem: "Notamos que [habilidade] está levando mais tempo do que o esperado, mesmo com prática regular nas últimas X semanas. Isso **não é um diagnóstico**. Pode valer a pena conversar com a escola ou com um(a) profissional (fonoaudiólogo(a), psicopedagogo(a), neuropsicólogo(a))."
- Gatilho: dificuldade **persistente** (várias semanas com prática adequada) e não um dia ruim.
- Para fala (TDL/apraxia): **não sinalizar com base no ASR**, porque o falso positivo é alto. No máximo, um questionário opcional ao responsável.
- Incluir material sobre a avaliação multidisciplinar (ABD) e sobre o direito ao acompanhamento escolar (Lei 14.254/2021) [F18, F21].

**Cuidados:**
- Validar os pontos de corte em população brasileira antes de usar limiares.
- No início, preferir **tendência relativa** (estagnação) a normas absolutas.
- Não usar a sinalização para marketing ("compre o plano premium para dislexia").
- ⚖️ Inferir indício de condição de saúde pode ser tratamento de **dado sensível referente à saúde**. Avaliar a base legal, a transparência e o opt-in desse recurso.

---

## 8. Checklist de conformidade legal/privacidade (produto)

**Governança**
- [ ] ⚖️ Parecer jurídico sobre LGPD (art. 14 e art. 11), ECA Digital + Decreto 12.880/2026 e orientações da ANPD sobre aferição de idade.
- [ ] Encarregado (DPO) nomeado. Canal do titular publicado.
- [ ] RIPD/DPIA antes do lançamento, cobrindo voz, câmera (se houver), triagem e analytics.
- [ ] Mapeamento de dados com base legal por finalidade (registro de operações).
- [ ] Contratos com operadores (ASR, TTS, nuvem) com proibição de treino com dados, apagamento e cláusulas de transferência internacional ⚖️.

**Conta e consentimento**
- [ ] A conta pertence ao responsável adulto. A criança é um perfil vinculado (ECA Digital).
- [ ] Mecanismo de confirmação de maioridade do responsável compatível com as orientações da ANPD (sem mera autodeclaração quando exigido) e integração do "sinal de idade" das lojas ⚖️.
- [ ] Consentimento **específico e em destaque**, separado por finalidade: (a) uso do microfone, (b) câmera, se houver, (c) relatórios para a escola, (d) sinalização de risco, (e) programa opt-in de pesquisa.
- [ ] Revogação fácil e com efeito imediato.

**Privacidade por padrão (ECA Digital / UK AADC)**
- [ ] Todas as configurações no máximo de proteção por padrão.
- [ ] Sem chat, sem perfil público, sem geolocalização, sem compartilhamento social.
- [ ] Sem publicidade e sem perfilamento comercial.
- [ ] Sem loot boxes ou recompensas aleatórias. Sem rolagem infinita ou autoplay. Sem *dark patterns* ou *nudges* para ampliar uso ou coleta.
- [ ] Compras e links externos só na área do responsável, atrás de parental gate.

**Voz e imagem**
- [ ] ASR on-device por padrão. Áudio não armazenado nem enviado (ou, se nuvem, apagamento imediato e sem treino).
- [ ] Sem voiceprint e sem reconhecimento facial.
- [ ] Câmera fora do MVP. Se existir, local, sem gravação, desligada por padrão e com consentimento destacado.
- [ ] Fotos enviadas pelos pais (perfil Down) processadas e guardadas localmente ou criptografadas, e nunca usadas para outra finalidade.
- [ ] Nenhuma imagem ou voz de criança usada em marketing sem autorização específica e separada (ECA art. 17) ⚖️.

**Lojas**
- [ ] Apple Kids Category: zero analytics e anúncios de terceiros, parental gate, revisão de todos os SDKs.
- [ ] Google Play Families: declaração de público-alvo, sem ID de publicidade, SDKs conformes.

**Transparência**
- [ ] Política de privacidade em linguagem simples para os pais e versão ilustrada para a criança.
- [ ] Aviso explícito sobre o tratamento da voz (o que é captado, onde é processado, por quanto tempo fica guardado: "não guardamos").
- [ ] Indicador visível de microfone e câmera ativos.

**Segurança**
- [ ] Criptografia em trânsito e em repouso, controle de acesso e logs.
- [ ] Plano de resposta a incidentes (comunicação à ANPD e aos titulares).
- [ ] Programa de segurança da informação infantil (exigência da COPPA emendada, se houver usuários nos EUA).

**Acessibilidade e inclusão**
- [ ] WCAG 2.2 AA nas telas web e do responsável. Critérios adaptados para crianças nas telas infantis.
- [ ] Painel de perfil sensorial (§2.4), sem tempo limite obrigatório, alternativas para arrastar e para falar.
- [ ] Legendas em 100% do áudio. Libras na fase 2.
- [ ] Testes com crianças e famílias neurodivergentes e com profissionais (fono, psicopedagogia, educação de surdos) antes do lançamento.

**Triagem**
- [ ] Linguagem "não é diagnóstico", destinada só ao responsável.
- [ ] Gatilho por persistência, sem uso do ASR para sinalizar fala.
- [ ] ⚖️ Base legal para inferências relacionadas à saúde.

---

## 9. Pontos abertos que exigem advogado(a) ⚖️
1. Quais obrigações de **verificação/aferição de idade** do ECA Digital e do Decreto 12.880/2026 se aplicam a um app infantil, e quais métodos a ANPD aceitará nas orientações definitivas.
2. Se a **voz usada só para transcrição** é dado biométrico sensível na LGPD, e qual a base legal adequada (consentimento × execução de contrato).
3. Base legal das **sinalizações de risco** (possível dado de saúde inferido).
4. Transferência internacional de dados (ASR/TTS em nuvem estrangeira).
5. Alcance do art. 63 da LBI e da NBR 17225:2025 sobre apps.
6. Situação da ação no STF contra dispositivos do ECA Digital.
7. Se houver usuários nos EUA ou na UE: COPPA emendada (validade atual da política de áudio de 2017) e GDPR art. 8.
8. Uso de imagem e voz de crianças em materiais de divulgação (ECA art. 17).

---

## 10. Tabela de fontes

> Observação: `planalto.gov.br` estava inacessível no ambiente de pesquisa. As leis foram verificadas por transcrições e análises listadas abaixo. Antes de citar formalmente, conferir no Planalto: L13709 (LGPD), L15211 (ECA Digital), L13146 (LBI), L12764, L14254, L8069 (ECA) e L10436.

| # | Fonte | URL | O que aproveitar | Validação E2 |
|---|---|---|---|---|
| F1 | CAST — UDL Guidelines (FAQ / site oficial) | https://udlguidelines.cast.org/more/frequently-asked-questions/ | Fonte oficial do DUA/UDL 3.0. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F2 | Novak Education — o que mudou na UDL 3.0 | https://novakeducation.com/blog/what-to-know-about-the-udl-guidelines-3.0-update | Data de lançamento (30/07/2024), mudanças de nomenclatura e o "quem". | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F3 | W3C — What's New in WCAG 2.2 | https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ | Critérios novos: 2.5.8, 2.5.7, 2.4.11 etc. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F4 | W3C — Understanding SC 2.3.3 Animation from Interactions | https://w3c.github.io/wcag/understanding/animation-from-interactions.html | `prefers-reduced-motion` e controle de animação. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F5 | Ceweb.br / CONPEDI / LegJur — LBI arts. 28 e 63 | https://acervo.ceweb.br/acervos/conteudo/fce061ec-8fed-41d9-b69c-81ce2bd6674b ; https://site.conpedi.org.br/publicacoes/5g243f3g/497u5ozm/U9wErejdr79dY2x1.pdf ; https://www.legjur.com/legislacao/art/lei_00131462015-28 | Acessibilidade obrigatória em sites, NBR 17225:2025, educação inclusiva. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F6 | W3C — Making Content Usable for People with Cognitive and Learning Disabilities | https://www.w3.org/TR/coga-usable/ | Padrões de design para acessibilidade cognitiva. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F7 | arXiv 2502.03447 (diretrizes de design para crianças autistas) + Accessibility.com (sensory-friendly design) | https://arxiv.org/pdf/2502.03447 ; https://www.accessibility.com/blog/sensory-friendly-design-creating-digital-spaces-that-support-autistic-users | Evitar sons e mudanças abruptas, controles sensoriais, sem autoplay. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F8 | Ostrolenk et al. 2017 — Hyperlexia: systematic review (PubMed) | https://pubmed.ncbi.nlm.nih.gov/28478182/ | Definição de hiperlexia, prevalência no TEA, uso em intervenção. | VERIFICADA — Crossref · doi:10.1016/j.neubiorev.2017.04.029 |
| F9 | Vale, Fernandes & Cardoso 2022 — Word reading skills in ASD (Frontiers) | https://www.frontiersin.org/articles/10.3389/fpsyg.2022.930275/full | Decodificação × compreensão no TEA. | VERIFICADA — Crossref; DOI confere |
| F10 | AFIRM/NCAEP Visual Supports + Mouzakes & Thompson 2025 | https://afirm-modules.fpg.unc.edu/Visual-Supports/content/assets/raScOE/Visual%20Supports%20Brief%20Packet%2C%20Sam%20%26%20AFIRM%20Team%2C%20Updated%202024.pdf ; https://digitalcommons.wne.edu/casfacpubs/10/ | Apoios visuais como prática baseada em evidência. Ressalva sobre agendas visuais e transições. | VERIFICADA — Crossref (artigo de Mouzakes & Thompson; página AFIRM não checável) · doi:10.1002/bin.70028 |
| F11 | Mandak, Light & Boyle 2018 (AAC) — Informa | https://informahealthcare.com/doi/abs/10.1080/07434618.2018.1470668 | Leitura de palavras por usuários de CAA. | VERIFICADA — Crossref; DOI confere |
| F12 | Wood 2019 — interesses especiais no TEA (Univ. Glasgow) | https://eprints.gla.ac.uk/273222/1/273222.pdf | Interesses como motivação de aprendizagem. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F13 | Schreibman et al. 2015 (NDBI) + Carlat Report (Sandbank) | https://rd.springer.com/content/pdf/10.1007/s10803-015-2407-8.pdf ; https://www.thecarlatreport.com/podcast/the-three-approaches-to-autism-intervention-2 | Panorama neutro ABA × NDBI. | VERIFICADA — Crossref; DOI confere |
| F14 | Lei 12.764/2012 (texto, LegJur) | https://www.legjur.com/legislacao/htm/lei_00127642012 | TEA = pessoa com deficiência (art. 1º, §2º). | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F15 | Frontiers in Education 2025 — ECR gamificação em TDAH | https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1668260/full | Feedback imediato, recompensas e níveis em TDAH. | VERIFICADA — Crossref; DOI confere |
| F16 | Break4Brain (PMC) — pausas ativas e TDAH | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11583342/ | Evidência preliminar de pausas ativas. Lacuna sobre timers. | VERIFICADA — Crossref · doi:10.3389/fpsyg.2024.1451731 |
| F17 | IDA — Structured Literacy Fact Sheet (2024/2025) | https://dyslexiaida.org/wp-content/uploads/2025/12/8_SL-Fact-Sheet.pdf | Definição de Structured Literacy. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F18 | ABD — Associação Brasileira de Dislexia | https://www.dislexia.org.br | Definição e avaliação multidisciplinar. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F19 | Wery & Diliberto — OpenDyslexic (PMC) + Edutopia | https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233 ; https://www.edutopia.org/article/do-dyslexia-fonts-actually-work/ | Fontes "para dislexia" sem benefício. | VERIFICADA — Crossref · doi:10.1007/s11881-016-0127-1 |
| F20 | Lexend (site oficial) + Andika (SIL, via Fontsource/Wikipedia) | https://lexend.com/ ; https://fontsource.org/fonts/andika/about | Justificativas de design. Evidência limitada. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F21 | Lei 14.254/2021 (Câmara — Legislação Informatizada) | https://www2.camara.leg.br/legin/fed/lei/2021/lei-14254-30-novembro-2021-792022-publicacaooriginal-164005-pl.html | Acompanhamento integral para dislexia/TDAH. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F22 | Down Syndrome Education International — See and Learn | https://www.down-syndrome.org/en-gb/resources/see-and-learn | Palavra inteira → fônica na síndrome de Down. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F23 | NDCS (deafness + additional needs) + Down's Syndrome Association (SEN) | https://www.NDCS.org.uk/information-and-support/childhood-deafness/additional-needs/additional-need-types/ ; https://www.downs-syndrome.org.uk/wp-content/uploads/2021/04/SEN80-Down-syndrome.pdf | Perda auditiva e visão na síndrome de Down, letra maior. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F24 | CATALISE (Bishop et al. 2017) — RCSLT | https://www.rcslt.org/-/media/Project/RCSLT/revised-catalise-2017.pdf | Definição de TDL. | VERIFICADA — Crossref (versão publicada do CATALISE-2) · doi:10.1111/jcpp.12721 |
| F25 | ASHA — Childhood Apraxia of Speech | https://www.asha.org/public/speech/disorders/childhood-apraxia-of-speech/ | Natureza motora e tratamento intensivo com fonoaudiologia. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F26 | arXiv 2410.11865 — ASR para triagem de distúrbios de fala infantil | https://arxiv.org/html/2410.11865v1 | Degradação do ASR em fala infantil e atípica. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F27 | Decreto 5.626/2005 (Câmara) + Lei 10.436/2002 (LegJur) | https://www2.camara.leg.br/legin/fed/decret/2005/decreto-5626-22-dezembro-2005-539842-normaatualizada-pe.pdf ; https://www.legjur.com/legislacao/htm/lei_00104362002 | Libras e educação bilíngue. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F28 | SciELO — "Deaf children and experiences with the written word" | https://new.scielo.br/j/ep/a/fTFzVHrWMfhHtNv54mtH7TR/?lang=en | Letramento bilíngue de surdos, pistas visuais. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F29 | Gazeta do Povo / SBIE — GraphoGame Brasil | https://www.gazetadopovo.com.br/educacao/poucas-escolas-nao-tem-internet-diz-ministro-da-educacao-em-lancamento-de-app-de-alfabetizacao/ ; https://sol.sbc.org.br/index.php/sbie/article/download/26711/26530 | Referência nacional e limites de evidência. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F30 | Felsberg / Aurum — LGPD art. 14 e Enunciado ANPD nº 1 | https://www.felsberg.com.br/importante-anpd-publica-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes/ ; https://www.aurum.com.br/blog/lgpd-comentada/art-14-lgpd/ | Bases legais e melhor interesse. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F31 | ANPD — Tomada de Subsídios Biometria + Notas Técnicas 5 e 11/2025 | https://www.gov.br/participamaisbrasil/ts-dados-biometricos ; https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/nota-tecnica-11_2025_fis_cgf_ocultado.pdf | Biometria como dado sensível, alternativas menos invasivas. | VERIFICADA — URL ativa, HTTP 200 |
| F32 | TJDFT — Proteção legal da imagem da criança (ECA art. 17) | https://www.tjdft.jus.br/informacoes/infancia-e-juventude/informacoes/publicacoes-textos-e-artigos/textos-e-artigos/2019/a-protecao-legal-da-imagem-da-crianca | Direito à imagem e à identidade. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F33 | IBDFAM / Olhar Digital / COAD — ECA Digital | https://ibdfam.org.br/noticias/13258 ; https://olhardigital.com.br/2026/03/16/internet-e-redes-sociais/eca-digital-comeca-a-valer-na-terca-feira-17-saiba-o-que-muda-nas-redes/ ; https://coad.com.br/home/noticias-detalhe/139047/questionadas-regras-do-eca-digital-sobre-verificacao-de-idade-e-acesso-a-jogos-na-internet | Vigência, loot boxes, verificação de idade, ação no STF. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F34 | FGV — Cartilha ECA Digital + Demarest Cartilha V2 + Agência Gov | https://repositorio.fgv.br/server/api/core/bitstreams/9417cd5d-d2c7-47d5-9e70-54e959953ecf/content ; https://www.demarest.com.br/wp-content/uploads/2026/03/Cartilha-ECA-Digital_V2.pdf ; https://agenciagov.ebc.com.br/noticias/202608/eca-digital-conheca-as-regras-de-protecao-de-criancas-e-adolescentes-no-ambiente-online | Supervisão parental, privacidade por padrão, sanções. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F35 | Meio & Mensagem / Data Privacy Brasil — acesso provável e perfilamento | https://www.meioemensagem.com.br/proxxima/o-novo-estatuto-digital-da-crianca-e-do-adolescente-e-seus-efeitos ; https://www.dataprivacybr.org/wp-content/uploads/2026/03/Apresentacao-_-ECA-Digital-e-cultura-de-direitos-digitais.pdf | Escopo de "acesso provável" e art. 22 (perfilamento). | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F36 | Agência Gov (decretos) / Mattos Filho / Convergência Digital / ANPD guia de aferição etária | https://agenciagov.ebc.com.br/noticias/202603/lula-assina-decretos-que-regulamentam-eca-digital-conheca-em-10-pontos-a-nova-lei ; https://www.mattosfilho.com.br/en/unico/online-protections-minors-regulated/ ; https://convergenciadigital.com.br/governo/anpd-define-primeiras-orientacoes-sobre-verificacao-de-idade-em-plataformas-digitais/ ; https://www.gov.br/anpd/pt-br/cnpd/documentos-e-publicacoes/anexo_36228481_conslidacao_cnpd_guia_afericao_etaria.pdf/@@display-file/file | Decreto 12.880/2026, aferição × verificação, sinal de idade, cronograma da ANPD, rolagem infinita/autoplay. | VERIFICADA — URL ativa, HTTP 200 |
| F37 | Hunton / Latham — COPPA Final Rule 2025 | https://www.hunton.com/privacy-and-cybersecurity-law-blog/ftc-publishes-final-coppa-rule-amendments ; https://www.lw.com/en/insights/2025/05/ftc-publishes-updates-to-coppa-rule | Biometria, aviso parental, programa de segurança, prazos. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F38 | FTC — COPPA Policy Statement on Audio Recordings (2017) | https://www.ftc.gov/system/files/documents/public_statements/1266473/coppa_policy_statement_audiorecordings.pdf | Voz → texto e apagamento imediato como padrão de design. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F39 | GDPR art. 8 (gdpr-info.eu) | https://gdpr-info.eu/art-8-gdpr/ | Idade de consentimento digital (16, até 13). | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F40 | ICO — Age Appropriate Design Code | https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf | 15 padrões: high privacy por padrão, sem nudges. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F41 | Apple — Developer News (Kids Category) + App Review Guidelines | https://developer.apple.com/news/?id=06032019j ; https://developer.apple.com/support/downloads/terms/app-review-guidelines/App-Review-Guidelines-English-UK.pdf | Sem analytics e anúncios de terceiros, parental gate. | VERIFICADA — URL ativa, HTTP 200 |
| F42 | Google Play — Families Policy / Self-Certified Ads SDK | https://support.google.com/googleplay/android-developer/answer/9893335 ; https://support.google.com/googleplay/android-developer/answer/12918983 | Requisitos para apps infantis, anúncios e identificadores. | NÃO CHECÁVEL — site fora da rede liberada, HTTP 000 |
| F43 | McWeeny et al. 2022 (RAN como preditor) + Frontiers in Pediatrics 2022 (triagem) | https://learnlab.northwestern.edu/wp-content/uploads/2022/07/McWeeny-et-al.-2022-RAN-as-a-Kindergarten-Predictor.pdf ; https://www.frontiersin.org/articles/10.3389/fped.2022.863477/full | Preditores de risco de leitura e pontos de corte. | VERIFICADA — parcial: artigo da Frontiers confere; McWeeny et al. 2022 não localizado em Crossref/PubMed (PDF em site bloqueado) |

**Total:** 43 entradas de fontes, com mais de 60 URLs distintas.
