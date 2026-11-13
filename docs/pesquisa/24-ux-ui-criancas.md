# 24 — UX/UI e interação para crianças pequenas (4 a 8 anos, pré-leitoras)

> Frente 24 de 30. Projeto FONEMA: alfabetização pelo método fônico, pt-BR, web + app, perfis aluno/responsável/professor, personagem "Sofia".
> Data da pesquisa: novembro de 2026.
> Limitações desta frente: o limite de buscas da sessão acabou antes de cobrir Epic, Google Play Families, WCAG 2.2 e dados brasileiros de aparelhos (TIC Educação/TIC Kids Online). Alguns sites (w3.org, nngroup.com, support.google.com) estavam bloqueados para leitura direta. As fontes que não foram conferidas nesta sessão aparecem com a marca **(NV)** na tabela de referências. O conteúdo delas vem de conhecimento consolidado e deve ser conferido antes de entrar em documento oficial.

---

## 1. Resumo executivo

1. **Alvos grandes, toque simples.** A NN/g recomenda alvos de toque de pelo menos 2 cm × 2 cm para crianças pequenas. Isso é quatro vezes a área do mínimo para adultos, que é 1 cm × 1 cm [1]. Os mínimos de plataforma são 48 dp no Android [30] e 44 pt no iOS [32]. Esses valores valem para adultos e são insuficientes para crianças de 4 a 6 anos. **Regra FONEMA: botão de ação ≥ 96 dp (≈ 1,5–2 cm na maioria dos celulares); nenhum alvo infantil < 72 dp; 24 dp entre alvos.**
2. **Tocar é o gesto universal.** Sesame Workshop [3] e Vatavu et al. [9][10] mostram que o toque simples é o gesto mais intuitivo e preciso. A precisão melhora muito dos 3 aos 6 anos. Pinça, gesto rápido de deslizar (*flick*), arrastar com as duas mãos e arrasto longo são difíceis [3][9][16]. Arrastar com uma mão é viável a partir de 4–5 anos e pode até ajudar quando o movimento combina com a tarefa [17]. Mesmo assim, precisa de tolerância a erro e de conclusão parcial, porque o dedo perde contato com a tela [3].
3. **O pré-leitor navega por áudio, personagem e símbolos concretos.** Símbolos "informais" usados por adultos (hambúrguer ☰, setas abstratas, reticências) não são entendidos por pré-escolares [15]. Os produtos que dão certo usam um personagem que recebe a criança, falas contextuais e dicas temporizadas quando ela fica parada [3]. No FONEMA, a Sofia é a interface de áudio.
4. **Login sem texto já é padrão de mercado.** Seesaw usa QR de turma para PreK–3 [26][27]. ClassDojo usa QR individual ou de turma e código de 6 caracteres [28][29]. Chromebooks aceitam login por sequência de figuras (Cloudwise COOL Picture Login) e por crachá QR (Clever) [31][33][34]. **Proposta FONEMA:** o professor gera um QR da turma; a criança toca no próprio avatar e depois na "senha de figuras" (3 figuras em sequência entre 9). Para a família, a mesma figura-senha ou um QR individual impresso.
5. **Adultos ficam atrás de uma "porteira" (parental gate).** A Apple exige que links externos, compras e "distrações" fiquem atrás de uma porteira com tarefa de nível adulto. Para pré-leitores, a Apple sugere um aviso falado pedindo que chamem um adulto [5][6]. A loja também restringe analytics e anúncios de terceiros [5].
6. **Teste com criança exige método próprio.** Para avaliação, o caminho é o Fun Toolkit (Smileyometer, Again-Again, Fun Sorter) de Read & MacFarlane [18][19][20][21]. Para criação, o caminho é o co-design (Cooperative Inquiry, de Druin) [22][23][24]. Crianças pequenas tendem a marcar "super legal" em tudo, então observar o comportamento vale mais que a nota.
7. **Brasil real: aparelho fraco, compartilhado e com pouca internet.** O Android Go roda com 1–2 GB de RAM [36]. O Google recomenda otimizar rede, tamanho, memória e bateria para mercados emergentes [37]. **Meta FONEMA:** funcionar em aparelho de 2 GB, APK/instalação inicial ≤ 40 MB, pacotes de lição baixáveis, modo offline-first e sincronização posterior.

---

## 2. Achados com citações

### 2.1 Motricidade fina e alvos de toque

- O artigo da NN/g sobre desenvolvimento físico testou crianças de 3 a 12 anos em laptops e celulares. Ele recomenda **alvos ≥ 2 cm × 2 cm** para crianças pequenas e **botões grandes e bem visíveis**, porque a coordenação motora grossa da criança é mais madura que a fina. Alvos pequenos causaram confusão; até crianças de 7 anos falharam ao tocar no "X" de um anúncio [1]. No computador, crianças com menos de 9 anos devem usar **clique simples ou teclado**. Arrastar, rolar a tela e clicar em objetos pequenos com mouse ou trackpad é difícil para elas [1].
- Hourcade dedica um capítulo inteiro às habilidades motoras finas e discute a lei de Fitts aplicada a crianças. A conclusão é que crianças são mais lentas e menos precisas que adultos e que a diferença diminui com a idade [7][8].
- Vatavu, Cramariuc e Schipor (IJHCS, 2015) estudaram **89 crianças de 3 a 6 anos e 30 adultos** em tablets e smartphones. A precisão do toque melhora muito dos 3 aos 6 anos e há diferenças claras em relação aos adultos [9][10]. Trabalhos que resumem o estudo relatam bom desempenho em toque, toque duplo e arrastar-e-soltar com uma mão. Arrastar com as duas mãos foi mais difícil. Crianças com melhor habilidade visuoespacial tocam mais perto do centro do alvo [16].
- O toque de uma criança é tão diferente do de um adulto que dá para inferir a faixa etária só pelas medidas de toque [11]. Isso reforça que limiares e tolerâncias de reconhecimento de gesto precisam ser calibrados para crianças, e não herdados de adultos [12][13].
- Um estudo citado em secundária com crianças de 2 a 8 anos relatou que **só 27% das crianças de 2–3 anos** tocaram no lugar pretendido. Aos 4 anos, as crianças aprenderam os sete gestos comuns ensinados [16]. Para o FONEMA, cujo público começa aos 4 anos, isso confirma que gestos simples são viáveis, desde que ensinados com demonstração.
- Os mínimos de plataforma são **48 × 48 dp** no Android ("maior é ainda melhor") [30] e **44 × 44 pt** no iOS [32]. A WCAG 2.2 define 24 × 24 px CSS como mínimo de nível AA (2.5.8) e 44 × 44 como nível AAA (2.5.5) [35]. Todos esses números são pensados para adultos.

### 2.2 Gestos: o que usar e o que evitar

- O Sesame Workshop sintetizou mais de 50 estudos [3][4]:
  - **Toque simples** é o mais intuitivo.
  - **Pinça e *flick*** são difíceis.
  - **Deslizar** só funciona com uma pista visual de onde deslizar.
  - A criança tem dificuldade em manter o dedo na tela continuamente, então a interface deve **aceitar conclusão parcial** do gesto.
  - A criança apoia a palma na borda inferior, então **não se deve pôr ícones na parte de baixo**.
  - O uso costuma ser **na horizontal (paisagem)**.
- Shaw e Anthony analisaram como crianças desenham gestos na tela e encontraram mais variação que em adultos. Por isso, reconhecedores de traçado (por exemplo, para traçar letras) precisam de tolerância maior [12].
- Um estudo de 2024 dividiu ao acaso **70 crianças de 5–6 anos** em grupo "arrastar" e grupo "tocar". Quando o arrasto **combina com a ação** da tarefa, ele pode melhorar o desempenho; nas tarefas difíceis, o grupo que arrastou foi mais preciso [17]. Implicação para o FONEMA: arrastar uma letra até a sílaba é aceitável, desde que o percurso seja curto e o soltar seja tolerante.
- O grupo da UPV (Espanha) estudou gestos multitoque com crianças da pré-escola [14]. É evidência adicional de que gestos com vários dedos precisam ser tratados com cautela.
- A WCAG 2.2 exige que **toda ação de arrastar tenha uma alternativa de ponteiro único** (2.5.7) e que gestos com vários dedos ou de trajetória tenham equivalente de toque simples (2.5.1) [35].

### 2.3 Navegação para pré-leitores: áudio, ícones, personagem

- Hiniker et al. ("Hidden Symbols") mostraram que **convenções simbólicas informais** de interfaces adultas atrapalham a usabilidade para pré-escolares [15]. Exemplos: ícone de menu, ícone de "voltar" abstrato e indicador de página. Os ícones precisam ser **concretos** (casa = início, porta = sair) e sempre **falados** ao toque.
- O Sesame Workshop recomenda [3]:
  - fala contextual e reforço visual para crianças que não leem;
  - abertura com um **personagem que cumprimenta** a criança;
  - **dicas temporizadas** ("time-outs") que sugerem o próximo passo quando a criança fica parada;
  - em livros digitais, ouvir o texto inteiro antes de liberar os elementos interativos, ter leitura com e sem narração e permitir que os pais desliguem pontos de toque que distraem.
- A PBS KIDS trabalha com estruturas de aprendizagem (*Learning Frameworks*) e consultores de desenvolvimento infantil em todas as plataformas [2]. O guia de marca exige contraste de cor adequado [25].
- Gelman organiza o design por faixas etárias (2–4, 4–6, 6–8, 8–10, 10–12). Ela mostra que, abaixo dos 12 anos, brincar e aprender se sobrepõem, e que um mesmo app pode atender várias idades se houver progressão de complexidade [38]. Castella complementa do ponto de vista do desenvolvimento infantil aplicado ao design de produtos [39].
- O Edutopia, com base na experiência de produção para pré-escola, recomenda avaliar recursos digitais pela intencionalidade pedagógica, pela interação adequada à idade e pela ausência de distrações [40].

### 2.4 Login de crianças que não leem

- **Seesaw:** o código de turma (QR em cartaz impresso) é desenhado para PreK–3 e para salas 1:1. A criança escaneia o código e escolhe o próprio nome ou foto. Existe alternativa de texto de 6 dígitos, válida por até 1 hora. Os *Home Learning Codes* são individuais, com QR + texto, para uso em casa. O código da turma **não deve ir para casa** [26][27].
- **ClassDojo:** oferece QR individual (entra direto na conta), QR ou texto de turma (a criança escolhe o nome na lista) e login Google (só na web). Se o código se perder, o professor gera outro [28][29].
- **Chromebook / Google:** o Google anunciou em 2016 a integração com o COOL Picture Login, da Cloudwise (Holanda). O fluxo é: escolher a turma, escolher o avatar e tocar na sequência de figuras que forma a senha [31]. Clever Badge [33], ClassLink QuickCards (PK–2) e realsmart [34] usam crachá QR mostrado à webcam.
- A WCAG 2.2 (3.3.8, nível AA) proíbe exigir teste cognitivo, como lembrar uma senha, sem alternativa. **Reconhecer objetos/figuras e usar QR são explicitamente aceitos** como alternativa [35]. Isso dá respaldo normativo à senha por figuras.

### 2.5 Área dos pais/professor, privacidade e lojas

- **Apple** (1.3 e 5.1.4) [5]: apps da categoria Kids não podem ter links para fora, compras ou "outras distrações", exceto em área atrás de uma porteira para adultos (parental gate). Também não devem ter analytics nem anúncios de terceiros, salvo exceções restritas, e precisam de política de privacidade. A porteira **não equivale** ao consentimento parental exigido pelas leis de privacidade. A página da Apple sobre apps infantis [6] define a porteira como uma **tarefa de nível adulto** e sugere, para apps de pré-leitores, um **aviso falado** para que a criança chame um adulto.
- **Google Play:** a política de Famílias exige que apps para crianças cumpram COPPA/GDPR, usem só SDKs de anúncio certificados para famílias e não coletem identificadores indevidos [41 (NV)].
- **Brasil:** a LGPD, art. 14, exige consentimento específico de pelo menos um dos pais para tratar dados de crianças, e as informações sobre o tratamento devem ser apresentadas de forma simples, inclusive com recursos audiovisuais [42 (NV)].

### 2.6 Testes de usabilidade e co-design com crianças

- **Fun Toolkit** (Read & MacFarlane, IDC 2006, Tampere) [18]: reúne Smileyometer (escala de 5 carinhas), Again-Again Table ("quer brincar de novo?"), Fun Sorter (ordenar as atividades) e Funometer. O artigo discute quatro problemas das pesquisas de opinião com crianças: viés de satisfação, sugestionabilidade, linguagem e o esforço cognitivo de dar notas [18]. O kit foi validado para crianças de 5 a 10 anos [19][21]. Read & Horton reavaliaram depois o Smileyometer como escala visual analógica [20]. **Achado prático:** crianças pequenas marcam "brilhante" quase sempre, então o Smileyometer serve mais para **comparar** versões que como nota absoluta. O Again-Again e a observação do comportamento são mais confiáveis.
- **Cooperative Inquiry** (Druin, 2002) [22]: define 4 papéis para a criança no design: usuária, testadora, informante e parceira de design. Como parceira de design, a criança participa em pé de igualdade com os adultos. Fails, Guha e Druin (2013) catalogam as técnicas: *bags of stuff* (prototipagem com materiais), *sticky noting*, *layered elaboration*, entre outras [24]. O Joan Ganz Cooney Center resume como crianças e adultos cocriam tecnologia [23].
- O livro de Hourcade traz um capítulo sobre metodologias de design com crianças [7]. A versão ampliada (*Child-Computer Interaction*) está disponível no site do autor [8].

### 2.7 Aparelhos fracos, compartilhados e offline

- O Android (Go edition) roda em aparelhos com **512 MB a 2 GB de RAM**, conforme a versão (Android 13 Go: 2 GB). Em 2017, aparelhos de entrada eram mais da metade dos embarques no mundo. Vários recursos vêm desligados no Go, entre eles picture-in-picture, tela dividida e papéis de parede animados [36].
- As diretrizes *Build for Billions* recomendam otimizar imagens, rede e transferência de dados, reduzir o tamanho do app, usar memória com economia, poupar bateria e deixar o usuário configurar o uso de rede [37].
- A Apple exige que apps infantis não enviem dados de aparelho a terceiros [5]. Isso também reduz o tráfego de rede, o que ajuda em aparelhos fracos.

---

## 3. GUIA DE UX DO FONEMA

### 3.1 Tamanhos e layout (em dp; 1 dp ≈ 0,16 mm em densidade de referência)

| Elemento | Mínimo | Recomendado | Observação |
|---|---|---|---|
| Botão principal de ação (ouvir, próximo, resposta) | 96 × 96 dp | 112–128 dp | ≈ 2 cm, alinhado com a NN/g [1] |
| Alternativas de resposta (letra/sílaba/figura) | 88 × 88 dp | 120 dp+ | no máximo 3–4 alternativas por tela para 4–5 anos; até 6 para 7–8 anos |
| Ícones de navegação infantil (casa, voltar, Sofia) | 72 × 72 dp | 80 dp | cantos **superiores**, nunca na faixa inferior [3] |
| Espaço entre alvos | 16 dp | 24 dp | evita tocar o alvo errado |
| Área da porteira dos adultos | 48 dp (padrão adulto) | — | ícone discreto no canto superior; ver 3.5 |
| Faixa inferior "morta" | 48 dp sem alvos | 64 dp | a palma da mão apoia ali [3] |
| Texto de leitura (letras/sílabas-alvo) | 32 sp | 48–72 sp | fonte com "a" e "g" de forma escolar (uma só volta); contraste ≥ 4,5:1 [30][35] |

- **Orientação:** paisagem nos jogos [3], com rotação travada durante a atividade. Retrato é aceitável na área dos pais. Em celulares pequenos (< 5,5"), reduzir o número de alternativas em vez de reduzir o tamanho dos alvos.
- **Área de acerto maior que o desenho:** a área tocável deve passar 8–12 dp da arte visível. Toques perto da borda contam.

### 3.2 Gestos permitidos

| Gesto | Uso no FONEMA | Regras |
|---|---|---|
| **Toque simples** | padrão para tudo | aceitar toques "sujos": vários dedos ao mesmo tempo contam como um; ignorar toque que tenha só a palma |
| **Arrastar curto com uma mão** (≤ ⅓ da tela) | montar sílaba/palavra, levar letra ao "trem" | ímã de encaixe (raio ≥ 48 dp); se o dedo sair da tela no meio do caminho, a peça fica onde parou (conclusão parcial [3]); **sempre** com alternativa de toque-toque: tocar na peça e depois no destino [35] |
| **Traçar letra** (caligrafia) | atividade específica, a partir de 5 anos | pista com setas e pontos animados; tolerância de corredor ≥ 40 dp; aceitar o traçado em partes [12] |
| Deslizar | não usar na navegação | só em "virar página" de livro, com seta animada visível [3] |
| Toque duplo, pressionar e segurar, pinça, *flick*, multitoque, sacudir | **proibidos** para a criança | pressionar e segurar fica reservado à porteira dos adultos |
| Rolagem | evitar | telas fixas sem rolagem; "mais" = botão grande de seta concreta |

- **Desktop/web** (computador da escola): só clique simples; nada de arrastar com mouse para crianças com menos de 9 anos [1]. Alternativa de teclado: Espaço = ouvir de novo; setas = escolher.

### 3.3 Navegação sem texto

1. **Sofia é o menu falado.** Toda tela nova tem uma instrução da Sofia de até 6 segundos, que pode ser repetida no botão "ouvido" (fixo, canto superior esquerdo).
2. **Ícones concretos e consistentes:** casa (mapa de fases), porta com seta (sair da atividade), ouvido/alto-falante (repetir), estrela/baú (recompensas). **Nada de** ☰, ⋮, ícone de engrenagem ou seta "<" abstrata na área infantil [15].
3. **Todo alvo fala ao ser tocado** na área infantil, com áudio curto. Isso vale para ícones e para letras (o som da letra, não o nome dela: /m/, e não "eme").
4. **Dica temporizada [3]:** 5 s parada → a Sofia aponta (animação); 10 s → repete a instrução; 20 s → mostra a resposta com "vamos juntos?". Os tempos são configuráveis pelo professor.
5. **Mapa de fases linear** (trilha), com no máximo 1 escolha por nível. Profundidade máxima de 2 toques entre o mapa e a atividade.
6. **Sem pop-ups modais** na área infantil. Mensagens são faladas pela Sofia, sem caixa de diálogo com "OK".
7. **Saída segura:** sair da atividade pede confirmação falada com duas figuras (✔ verde grande / ✖ vermelho grande), para evitar saídas acidentais.

### 3.4 Fluxo de login da criança por figuras

**Na escola (aparelho compartilhado):**
1. O professor abre a turma no próprio aparelho ou o aparelho já está "vinculado" à turma. Alternativa: a criança aponta a câmera para o **cartaz QR da turma** (modelo Seesaw/ClassDojo [26][28]).
2. Aparece a **grade de avatares** da turma, com foto ou desenho escolhido pela criança + primeiro nome falado ao toque. Máximo de 30, com 6–8 por linha e alvos de 96 dp.
3. A criança toca no seu avatar → aparece a **"senha de figuras"**: 9 figuras (animais, frutas, objetos do cotidiano brasileiro: caju, sapo, bola...). Ela toca **3 em sequência** (modelo Cloudwise [31]). A ordem pode ser obrigatória para crianças de 6–8 anos e livre para 4–5 anos, a critério do professor.
4. Errou? A Sofia diz "quase! tenta de novo". Depois de 3 erros, ela diz "chama a professora". Não há bloqueio punitivo.
5. O professor pode **desativar a senha** em turmas de 4 anos e deixar só o avatar. É um risco aceitável em sala supervisionada; registrar essa decisão.

**Em casa:** QR individual impresso pelo professor (modelo *Home Learning Code* [27]) ou login do responsável, que depois "entrega" o aparelho à criança escolhida (perfil). O código da turma não vai para casa [26].

**Segurança:** a figura-senha é um fator de **reconhecimento**, aceito pela WCAG 3.3.8 [35]. Ela não protege dados sensíveis, apenas separa perfis. Dados de progresso ficam no servidor, vinculados ao responsável (LGPD art. 14 [42]).

### 3.5 Área dos pais/professor (porteira)

- Entrada por um ícone pequeno de "cadeado/adulto" no canto superior direito (48 dp, discreto).
- **Porteira de nível adulto [6]:** *pressionar e segurar por 3 s* **+** uma tarefa escrita, como "digite o ano 2019 por extenso" ou "toque nos números 7, 3 e 9 na ordem pedida por escrito". A tarefa **depende de leitura**, o que barra a criança pré-leitora. Não usar só uma conta simples, que crianças de 7–8 anos resolvem. Para crianças que leem, sortear a tarefa entre várias.
- A Sofia diz: "Essa parte é para adultos. Chama alguém da sua família!" (aviso falado, como a Apple sugere [6]).
- Atrás da porteira ficam: relatórios, configurações, links externos, consentimento LGPD, compras (se houver) e envio de mensagens. Nunca deve haver link, anúncio ou compra na área infantil [5].
- A área adulta usa **padrões normais de UI** (texto, menus, 48 dp). Os adultos de escola pública podem ter letramento digital limitado, então usar linguagem simples e ícones + texto.
- **Sessão do professor em aparelho compartilhado:** sair automaticamente da área adulta após 2 min sem uso e voltar ao seletor de avatares.

### 3.6 Estados de feedback

| Estado | Visual | Som | Háptico (se houver suporte) |
|---|---|---|---|
| Toque registrado | botão "afunda" (escala 0,95) em < 100 ms | clique suave | vibração leve de 10–20 ms (opcional, desligável) |
| Acerto | brilho/estrelinhas + Sofia comemora (≤ 1,5 s) | som ascendente + fala variada ("isso!", "muito bem!") | 1 pulso curto |
| Erro | balanço leve da alternativa, **sem X vermelho nem som de "buzina"** | Sofia: "hum, escuta de novo…" + repete o som-alvo | nenhum |
| Erro repetido (2×) | a resposta certa pulsa | "vamos juntos?" + modelagem | nenhum |
| Carregando | Sofia faz algo engraçado (animação leve) | — | — |
| Offline | ícone de nuvem com "zzz" (só na área adulta) | — | — |
| Fim da atividade | recompensa (adesivo/estrela) + volta ao mapa | celebração curta | — |

- Recompensas **intrínsecas** (progresso no mapa, desbloquear histórias). Nada de punição, vidas, cronômetro ou ranking visível para crianças de 4–6 anos.
- Feedback **imediato** (< 100 ms visual; < 300 ms de áudio após o toque).

### 3.7 Acessibilidade (meta: WCAG 2.2 AA + ajustes infantis)

- Contraste ≥ 4,5:1 em texto e ≥ 3:1 em ícones e bordas [30][35]. Nunca usar **só cor** para indicar certo ou errado (pensar em daltonismo): usar forma + som.
- Legendas e transcrição das falas da Sofia (para crianças surdas e para os adultos), com opção de **Libras** em vídeo para instruções-chave. Isso deve ser alinhado com a frente 05.
- Toda ação de arrastar tem equivalente de toque [35]. Tempo configurável e sem limite por padrão (WCAG 2.2.1).
- `contentDescription`/`aria-label` em todos os elementos [30]. Modo TalkBack/VoiceOver testado na área adulta. Na área infantil, a própria fala da Sofia cumpre esse papel, mas o leitor de tela não pode ficar bloqueado.
- Opção "menos movimento" (respeitar *reduce motion*) e volume separado para música e voz.

### 3.8 Desempenho em aparelhos fracos e offline

- **Aparelho-alvo mínimo:** Android 8.1+ com 2 GB de RAM (classe Android Go [36]), tela de 5", processador de entrada. Navegador alvo da web: Chrome Android 2 versões atrás.
- **Orçamentos:** instalação inicial ≤ 40 MB; cada pacote de lição ≤ 5 MB; RAM em uso ≤ 250 MB; abertura a frio ≤ 3 s até a Sofia aparecer; 60 fps em aparelho bom e ≥ 30 fps estáveis no mínimo.
- **Recursos:** áudio em Opus/AAC mono de 32–48 kbps; arte vetorial ou sprite atlas WebP; animações Lottie/Rive leves; nada de vídeo pesado na área infantil.
- **Offline-first [37]:** baixar trilhas inteiras no Wi-Fi da escola ou de casa; registrar progresso localmente (fila) e sincronizar quando houver rede; opção "baixar só no Wi-Fi". Como PWA na web: *service worker* + cache das lições.
- **Aparelho compartilhado:** vários perfis por aparelho (até 40 crianças em um tablet de turma); troca rápida de perfil (≤ 2 toques); dados locais criptografados e removidos ao desvincular.
- **Sem SDK de terceiros** de analytics ou anúncio na área infantil [5]. Isso também economiza dados e memória.

### 3.9 Protocolo de teste de usabilidade com crianças (FONEMA)

**Participantes:** 5–8 crianças por faixa (4–5, 6–7 e 7–8 anos) por rodada, incluindo crianças de escola pública e pelo menos 1 com deficiência por rodada, quando houver. Termo de consentimento do responsável e **assentimento da criança** (falado, com figura); a criança pode parar a qualquer momento.

**Ambiente:** na escola ou em casa, no **aparelho real** (Android de entrada, o próprio celular do responsável se possível), com 1 facilitador + 1 observador. Gravação de tela e das mãos (câmera por cima), não do rosto, salvo consentimento.

**Sessão (≤ 20 min para 4–5 anos; ≤ 30 min para 6–8 anos):**
1. Aquecimento (2 min): conversa e desenho livre.
2. Tarefas (10–15 min), sem instrução do facilitador além de "faz como você quiser". Exemplos:
   - entrar com o seu avatar e a figura-senha;
   - abrir a fase 1;
   - ouvir de novo a instrução;
   - completar 1 atividade de arrastar;
   - voltar para casa (o mapa).
3. Medidas observadas:
   - sucesso sem ajuda, com dica da Sofia ou com ajuda do adulto;
   - toques errados e toques fora do alvo (pelo log de toques);
   - tempo até o primeiro toque útil;
   - sinais de frustração (suspiro, olhar para o adulto, abandono);
   - sinais de diversão (sorriso, comentário, querer continuar). Usar uma lista de verificação de comportamentos.
4. Opinião, com o **Fun Toolkit adaptado** [18][21]:
   - Smileyometer de 5 carinhas, com as âncoras **faladas** em pt-BR ("muito chato" … "muito legal");
   - Again-Again: "quer jogar de novo? sim / talvez / não";
   - Fun Sorter com cartões de figuras das atividades, para ordenar "a mais legal".
   Interpretar o Smileyometer de forma **comparativa** (versão A × B), nunca como nota absoluta.
5. Encerramento: adesivo de agradecimento.

**Critérios de aprovação por tarefa:**
- ≥ 80% de sucesso sem ajuda de adulto na faixa-alvo;
- < 15% de toques fora do alvo;
- nenhuma saída acidental da atividade.

**Co-design (fase de descoberta):** formar um grupo fixo de 6–8 crianças de 7–8 anos como parceiras de design [22][24], com sessões mensais de *bags of stuff* (protótipo em papel e massinha) e *sticky noting* adaptado com desenhos em vez de texto. Professoras alfabetizadoras entram como informantes.

**Teste da área adulta:** teste de usabilidade clássico com 5 professoras e 5 responsáveis (pensar em voz alta), incluindo responsáveis com baixa escolaridade.

---

## 4. Tabela de referências

Legenda: **(NV)** = não verificada nesta sessão por limite de busca ou bloqueio de rede; conferir antes de citar formalmente.

> **Etapa 2 (validação, 13/11/2026):** a última coluna das tabelas de referências traz o status de cada item (VERIFICADA / CORRIGIDA / NÃO ENCONTRADA / NÃO CHECÁVEL), conferido no Crossref, PubMed, ERIC e por requisição HTTP. DOIs encontrados pelas APIs foram acrescentados à coluna URL/DOI. "NÃO CHECÁVEL" quase sempre significa domínio bloqueado pela rede da sessão, não fonte falsa. Detalhes em `validacao-16-25.md`.

| nº | Autor(es) | Ano | Título | País | Tipo | URL / DOI | O que aproveitar | Etapa 2 (validação 13/11/2026) |
|---|---|---|---|---|---|---|---|---|
| 1 | Nielsen Norman Group (Sherwin, K. et al.) | c. 2019 | Physical Development and Children's UX (*children-ux-physical-development*) | EUA | artigo de pesquisa aplicada | https://www.nngroup.com/articles/children-ux-physical-development/ | alvo ≥ 2 × 2 cm; botões grandes; clique simples para < 9 anos | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 2 | DeWitt, S. (PBS KIDS) / ZERO TO THREE | 2020 | Getting the Most Out of Screen Time: The PBS KIDS Approach to Learning Through Media | EUA | artigo | https://www.zerotothree.org/resource/getting-the-most-out-of-screen-time-the-pbs-kids-approach-to-learning-through-media/ | estruturas de aprendizagem; consultores de desenvolvimento infantil | **VERIFICADA** — ERIC EJ1288681 |
| 3 | Sesame Workshop (resumo do Joan Ganz Cooney Center) | 2012 | Best Practices: Designing Touch Tablet Experiences for Preschoolers | EUA | guia (síntese de mais de 50 estudos) | https://joanganzcooneycenter.org/?p=19607 | gestos, palma na borda inferior, paisagem, personagem que recebe, dicas temporizadas | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 4 | AppleInsider | 2012 | Sesame Workshop wants to improve iPad apps for kids with free developer guidelines | EUA | notícia | https://appleinsider.com/articles/12/12/24/sesame-workshop-wants-to-improve-ipad-apps-for-kids-with-free-developer-guidelines | contexto e divulgação do guia [3] | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 5 | Apple | 2025/26 | App Store Review Guidelines (1.3 Kids Category; 5.1.4 Kids) | EUA | norma de loja | https://developer.apple.com/app-store/review/guidelines/ | porteira; sem analytics nem anúncios de terceiros; privacidade | **VERIFICADA** — URL ativa (HTTP 200) |
| 6 | Apple | atual | Kids apps / Parental gates | EUA | norma/guia | https://developer.apple.com/app-store/kids-apps/ | porteira = tarefa de nível adulto; aviso falado para pré-leitores | **VERIFICADA** — URL ativa (HTTP 200) |
| 7 | Hourcade, J. P. | 2008 | Interaction Design and Children (Foundations and Trends in HCI 1(4):277–392) | EUA | livro/revisão | DOI 10.1561/1100000006 — https://nowpublishers.com/article/Details/HCI-006 | desenvolvimento cognitivo e motor, métodos e princípios | **VERIFICADA** — Crossref (DOI) |
| 8 | Hourcade, J. P. | 2015+ | Child-Computer Interaction (2ª ed. ampliada, site do autor) | EUA | livro on-line | https://homepage.cs.uiowa.edu/~hourcade/book/content.php | atualização dos capítulos de motricidade e métodos | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 9 | Vatavu, R.-D.; Cramariuc, G.; Schipor, D.-M. | 2015 | Touch interaction for children aged 3 to 6 years: Experimental findings and relationship to motor skills (IJHCS 74:54–76) | Romênia | artigo | DOI 10.1016/j.ijhcs.2014.10.007 | precisão do toque aumenta dos 3 aos 6; tocar/arrastar | **VERIFICADA** — Crossref (DOI) |
| 10 | Vatavu, R.-D. | 2015 | Children Touch Input Dataset | Romênia | conjunto de dados | https://raduvatavu.usv.ro/projects/ChildrenTouchInput | dados de 89 crianças para calibrar a tolerância | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 11 | Vatavu, R.-D.; Anthony, L.; Brown, Q. | 2015 | Child or Adult? Inferring Smartphone Users' Age Group from Touch Measurements Alone (INTERACT 2015) | Romênia/EUA | artigo | https://lisa-anthony.com/wp-content/uploads/2015/06/vatavu-et-al-interact2015.pdf · DOI 10.1007/978-3-319-22723-8_1 | o toque infantil é mensuravelmente diferente; calibrar limiares | **VERIFICADA** — Crossref (busca bibliográfica) |
| 12 | Shaw, A.; Anthony, L. | 2016 | Analyzing the articulation features of children's touchscreen gestures (ICMI 2016) | EUA | artigo | DOI 10.1145/2993148.2993179 | tolerância para traçado de letras | **VERIFICADA** — Crossref (DOI) |
| 13 | Anthony, L. et al. (projeto MTAGIC, Univ. of Florida) | 2019 | Preprint IJHCS 2019 sobre interação de crianças com gestos em tela sensível ao toque | EUA | artigo (preprint) | https://init.cise.ufl.edu/wp-content/uploads/sites/378/2019/03/anthony-et-al-IJHCS2019-MTAGIC-final-preprint.pdf | revisão de estudos de toque infantil | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 14 | Nacher, V.; Jaén, J. et al. (UPV) | c. 2015 | Estudo sobre gestos multitoque com crianças da pré-escola (versão de autor) | Espanha | artigo | https://riunet.upv.es/bitstream/10251/77963/4/shortpaperVersionAutor.pdf | limites do multitoque na pré-escola | **NÃO CHECÁVEL** — PDF bloqueado; candidatos no Crossref: Nacher et al. (2015), IJHCS, DOI 10.1016/j.ijhcs.2014.08.004, ou Nacher & Jaen (2015), INTERACT |
| 15 | Hiniker, A. et al. (Univ. of Washington) | c. 2016 | Hidden Symbols: How Informal Symbolism in Digital Interfaces Disrupts Usability for Preschoolers | EUA | artigo | https://faculty.washington.edu/alexisr/HiddenSymbols.pdf · DOI 10.1016/j.ijhcs.2016.03.006 | evitar ícones simbólicos abstratos com pré-escolares | **VERIFICADA** — Crossref (busca bibliográfica) |
| 16 | Revisão secundária (Springer, INTERACT 2015, cap. 42) | 2015 | Capítulo que resume Vatavu et al. e estudos de gestos (2–8 anos) | Internacional | capítulo | https://rd.springer.com/chapter/10.1007/978-3-319-22668-2_42 | toque, toque duplo e arrasto com uma mão viáveis; 27% aos 2–3 anos | **CORRIGIDA** — Crossref (DOI); o capítulo é Nacher & Jaen (2015), Evaluating the Accuracy of Pre-kindergarten Children Multi-touch Interaction, INTERACT 2015 |
| 17 | (Autores do estudo PubMed 38889478) | 2024 | Estudo randomizado Drag × Tap com 70 crianças de 5–6 anos | Internacional | artigo | https://pesquisa.bvsalud.org/bvsvs/resource/es/mdl-38889478 · DOI 10.1016/j.jecp.2024.105989 | arrasto que combina com a tarefa ajuda; ter alternativa de toque | **VERIFICADA** — PubMed 38889478; Wu, Cao & Nielsen (2024), Dragging but not tapping promotes preschoolers' numerical estimating with touchscreens, J. Exp. Child Psychol. |
| 18 | Read, J. C.; MacFarlane, S. | 2006 | Using the Fun Toolkit and other survey methods to gather opinions in child computer interaction (IDC 2006, pp. 81–88) | Reino Unido | artigo | https://researchr.org/publication/ReadM06 · DOI 10.1145/1139073.1139096 | Smileyometer, Again-Again, Fun Sorter; vieses | **VERIFICADA** — Crossref (busca bibliográfica) |
| 19 | Aalto University – Experience Research | atual | Fun Toolkit (ficha de método) | Finlândia | guia de método | https://experience.aalto.fi/fun-toolkit/ | aplicação prática (5–10 anos) | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 20 | Read, J. C.; Horton, M. (UCLan) | c. 2023 | Reavaliação do Smileyometer como escala visual analógica (versão publicada) | Reino Unido | artigo | https://clok.uclan.ac.uk/54967/1/54967%20Read%20%26%20Horton%20VOR.pdf | limitações do Smileyometer | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 21 | Read, J. C. | 2008 | Validating the Fun Toolkit: an instrument for measuring children's opinions of technology (Cognition, Technology & Work) | Reino Unido | artigo | DOI 10.1007/s10111-007-0069-9 | validação do kit | **VERIFICADA** — Crossref (DOI) |
| 22 | Druin, A. | 2002 | The role of children in the design of new technology (Behaviour & Information Technology 21(1):1–25) | EUA | artigo | https://www.cdgr.ucsb.edu/database/role-children-design-new-technology · DOI 10.1080/01449290110108659 | papéis usuária/testadora/informante/parceira; Cooperative Inquiry | **VERIFICADA** — Crossref (busca bibliográfica) |
| 23 | Joan Ganz Cooney Center | c. 2016 | Designing with Kids: How Children and Adults Can Co-create New Technology | EUA | artigo | https://joanganzcooneycenter.org/?p=23679 | co-design na prática | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 24 | Fails, J. A.; Guha, M. L.; Druin, A. | 2013 | Methods and Techniques for Involving Children in the Design of New Technology for Children (FnT HCI) | EUA | livro/revisão | https://www.nowpublishers.com/article/DownloadEBook/HCI-018 · DOI 10.1561/1100000018 | catálogo de técnicas (bags of stuff, sticky noting...) | **VERIFICADA** — Crossref (busca bibliográfica) |
| 25 | PBS KIDS | atual | PBS KIDS Style Guide | EUA | guia de marca | https://pbs-kids-brand.pbskids.org/downloads/pbs-kids-style-guide.pdf | contraste, paleta e tipografia para crianças | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 26 | Seesaw | atual | Student sign-in modes | EUA | documentação de produto | https://help.seesaw.me/hc/de/articles/203495019 | QR de turma para PreK–3; código de turma não vai para casa | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 27 | Seesaw | atual | Seesaw Codes / Home Learning Codes | EUA | documentação | https://help.seesaw.me/hc/en-us/articles/4424230271501-Seesaw-Codes | QR individual para casa | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 28 | ClassDojo | atual | How Students can Log into ClassDojo | EUA | documentação | https://help.classdojo.com/hc/en-us/articles/115004688443-How-Students-can-Log-into-ClassDojo | QR individual/turma; código de texto; escolher o nome na lista | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 29 | ClassDojo | atual | How Students Can Login With an Individual QR Code | EUA | documentação | https://help.classdojo.com/hc/en-us/articles/360023367251-How-Students-Can-Login-With-an-Individual-QR-Code | fluxo do QR individual | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 30 | Google / Android Developers | atual | Make apps more accessible | EUA | norma técnica | https://developer.android.com/guide/topics/ui/accessibility/apps | 48 dp; contraste 4,5:1; contentDescription | **VERIFICADA** — URL ativa (HTTP 200) |
| 31 | Google (The Keyword blog) | 2016 | Expanding Chromebooks for all learners | EUA / Holanda (Cloudwise) | anúncio | https://blog.google/products-and-platforms/products/education/expanding-chromebooks-all-learners/ | login por sequência de figuras (COOL Picture Login) | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 32 | Apple | atual | Human Interface Guidelines – Accessibility (alvo de 44 × 44 pt) | EUA | norma de design | https://developer.apple.com/design/human-interface-guidelines/accessibility (NV: conteúdo não carregou) | mínimo de alvo no iOS | **VERIFICADA** — URL ativa (HTTP 200) |
| 33 | Chrome Unboxed | c. 2018 | Chromebooks in the classroom get simplified login with Clever Badge | EUA | notícia | https://chromeunboxed.com/chromebooks-in-the-classroom-get-simplified-login-with-clever-badge/ | crachá QR mostrado à webcam | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 34 | realsmart | atual | QR code login into realsmart / Why use a QR code to login? | Reino Unido | documentação | https://help.realsmart.co.uk/doc/qr-code-login-into-realsmart | QR para Google Workspace/Chromebook | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 35 | W3C | 2023 | Web Content Accessibility Guidelines (WCAG) 2.2 | Internacional | norma | https://www.w3.org/TR/WCAG22/ (NV nesta sessão) | 2.5.1, 2.5.5, 2.5.7, 2.5.8, 3.3.8, 1.4.3 | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 36 | Google / Android Developers | atual | Android (Go edition) | EUA | documentação técnica | https://developer.android.com/guide/topics/androidgo | RAM mínima de 512 MB a 2 GB; recursos desligados | **VERIFICADA** — URL ativa (HTTP 200) |
| 37 | Google / Android Developers | atual | Build for Billions | EUA | diretriz | https://developer.android.com/docs/quality-guidelines/build-for-billions | rede, tamanho, memória, bateria, custo de dados | **VERIFICADA** — URL ativa (HTTP 200) |
| 38 | Gelman, D. L. | 2014 | Design for Kids: Digital Products for Playing and Learning (Rosenfeld Media) | EUA | livro | https://rosenfeldmedia.com/books/design-for-kids/ | faixas etárias, brincar = aprender, um app para várias idades | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 39 | Castella, K. | 2018 | Designing for Kids: Creating for Playing, Learning, and Growing (Routledge) | EUA | livro | https://www.routledge.com/Designing-for-Kids-Creating-for-Playing-Learning-and-Growing/Castella/p/book/9781138290761 · DOI 10.4324/9781315266015 | desenvolvimento infantil aplicado ao design | **VERIFICADA** — Crossref (busca bibliográfica) |
| 40 | Edutopia | c. 2019 | 3 Ways to Evaluate Digital Resources Made for Preschoolers | EUA | artigo | https://www.edutopia.org/article/3-ways-to-evaluate-digital-resources-made-for-preschoolers | critérios para avaliar apps pré-escolares | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 41 | Google Play | atual | Families Policy Requirements (Play Console Help) | EUA | norma de loja | https://support.google.com/googleplay/android-developer/answer/9893335 **(NV)** | SDKs certificados, anúncios, dados de crianças | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 42 | Brasil – Presidência da República | 2018 | Lei nº 13.709/2018 (LGPD), art. 14 | Brasil | lei | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm **(NV)** | consentimento parental; informação acessível à criança | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 43 | Licensing International | 2012 | Sesame Workshop shares tips for creating touch screen content for preschoolers | EUA | notícia | https://licensinginternational.org/news/sesame-workshop-shares-tips-for-creating-touch-screen-content-for-preschoolers | reforço do guia [3] | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 44 | NN/g | atual | Young Users – Articles & Videos (inclui o relatório Gilutz & Nielsen, 2002, com 70 diretrizes para sites infantis) | EUA | coleção | https://www.nngroup.com/topic/young-users/ | corpus histórico de testes com crianças | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |

**Total:** 44 referências (40 confirmadas por busca ou leitura nesta sessão; 4 marcadas NV, sendo 3 normas canônicas e a página HIG da Apple, que não carregou).
**Países/regiões:** EUA, Romênia, Reino Unido, Finlândia, Espanha, Holanda, Brasil, além de normas internacionais (W3C).

### Lacunas para a próxima rodada
- Epic (login por perfil/avatar) e Khan Academy Kids: fluxo de perfis infantis.
- Dados brasileiros: Cetic.br (TIC Educação, TIC Kids Online Brasil) sobre aparelhos, conectividade e compartilhamento na escola pública.
- Estudos brasileiros de IHC infantil (anais do IHC/SBC) e regras do Google Play Families verificadas.
- Evidência sobre feedback háptico em crianças (não encontrada nesta rodada; a recomendação acima é prudencial).
