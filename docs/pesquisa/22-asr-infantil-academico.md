# 22 — Reconhecimento de fala infantil e avaliação automática de leitura/pronúncia: estado da arte acadêmico

> Frente de pesquisa acadêmica do Projeto FONEMA. Data: novembro/2026.
> **Nota de método:** todas as referências numeradas [n] foram localizadas por busca web nesta rodada (títulos, venues e URLs conferidos nos resultados). Durante a pesquisa, o orçamento de buscas da sessão se esgotou e os domínios arxiv.org, aclanthology.org, isca-archive.org e pmc.ncbi.nlm.nih.gov estavam bloqueados para leitura direta. Por isso, alguns números vieram de resumos e índices, e não do PDF completo. Esses casos estão marcados com "(conferir no PDF)". Corpora clássicos que não foram verificados nesta rodada aparecem na seção 4.2, separados da tabela de referências.

---

## 1. Resumo executivo

1. **A fala infantil continua difícil para o ASR.** Crianças têm pitch e formantes mais altos, trato vocal menor, duração e prosódia mais variáveis e articulação ainda em desenvolvimento. Com modelos acústicos treinados em adultos, o WER em crianças fica cerca de 2 a 5 vezes maior que em adultos, e o erro cresce quanto menor a idade [1]. Normalização do falante e adaptação reduzem essa distância, mas não a eliminam [1][2][3][28].
2. **Modelos de fundação ajudam muito, desde que passem por fine-tuning.** Em 2024, o benchmark de Fan et al. (UCLA) comparou Whisper, Canary, Parakeet, wav2vec2, HuBERT e WavLM em OGI (leitura) e MyST (fala espontânea). Com fine-tuning completo, os WERs relatados ficaram em torno de 1,4% no OGI para o Whisper-large-v3 e cerca de 10% no MyST (conferir no PDF) [4]. O fine-tuning do Whisper com fala infantil traz ganhos significativos, e o wav2vec2 ajustado chegou a superar o Whisper ajustado [5]. Kid-Whisper reforça esse resultado com o MyST [6].
3. **Português brasileiro infantil quase não tem dados.** O trabalho mais próximo do FONEMA é o de Rodrigues & Ribeiro (PROPOR 2026): leitura de palavras isoladas por crianças do 2º e 3º anos, com 5.400 amostras, wav2vec2 e saída **fonêmica** em SAMPA. A conclusão é que modelos fonêmicos ajustados acompanham melhor a pronúncia real da criança do que modelos ortográficos [9]. Em português europeu existe o **LetsRead** (284 crianças de 6 a 10 anos, cerca de 20 h de leitura de frases e pseudopalavras, com anotação de disfluências) [8], além de um estudo sobre padrões de pronúncia de crianças de 3 a 10 anos que geram erros de ASR [10]. Os corpora abertos de PB, como CORAA, Kaldi e E2E, são de fala adulta [11][12][13].
4. **Avaliação automática de leitura já tem três décadas de pesquisa.** O Project LISTEN (CMU) mostrou que um tutor que "ouve" funciona quando a tarefa é **restrita**: a criança lê uma frase por vez e o texto esperado é conhecido. O projeto também validou medidas automáticas de fluência, como a latência entre palavras [14][15][16][17]. O FONEMA deve seguir esse princípio: **verificar contra um alvo conhecido** é muito mais fácil e confiável do que transcrever livremente.
5. **Detecção de erros de pronúncia (MDD).** O padrão clássico é o GOP de Witt & Young [18][19]. Hoje convivem GOP calculado sobre modelos neurais, GOP sem segmentação [20], transfer learning para pontuação [21] e classificadores específicos por erro [22]. Quase tudo foi validado com adultos aprendendo L2, e muito pouco com crianças nativas.
6. **Distúrbios dos sons da fala (SSD).** Já existem detectores automáticos para cantonês (UAR de 89% no nível do falante) [23][24], coreano (UAR de 73,9%) [25] e alemão (wav2vec multilíngue com ASR e classificação SSD em conjunto) [26], além de pesquisas com ultrassom de língua [27]. Todos esbarram na **escassez de dados**. Nenhum deles serve como diagnóstico. São apoio à triagem feita por fonoaudiólogo.
7. **Conclusão para o produto:** o realista para o FONEMA em 2026–2027 é (a) **verificação forçada contra o alvo** (fonema, sílaba ou palavra esperada), com (b) um modelo fonêmico pt-BR ajustado em fala infantil e (c) uma política pedagógica de **tolerância assimétrica**: na dúvida, aceitar ou pedir nova tentativa, nunca reprovar. Isso exige um **corpus próprio de fala infantil pt-BR**, coletado com consentimento dos responsáveis e assentimento da criança, conforme a LGPD (art. 14).

---

## 2. Estado da arte

### 2.1 Por que o ASR falha com crianças

- **Acústica e fisiologia.** Potamianos & Narayanan [1] mostraram que as mudanças da fala com a idade produzem variabilidade espectral e temporal. Com modelos adultos, o desempenho piora conforme a idade diminui, e o WER infantil fica cerca de 2 a 5 vezes maior que o adulto. Os autores propõem *frequency warping* linear por partes e dependente do fonema, além de modelos acústicos por faixa etária. Segundo o resumo, isso reduziu o WER em cerca de 10% (conferir no PDF). Um trabalho anterior do mesmo grupo combinou *warping* de frequência com *spectral shaping* e relatou melhora de 25 a 45% para falantes infantis (conferir no PDF) [2].
- **Pronúncia e linguagem.** Além da acústica, as crianças pronunciam de forma não canônica, com substituições e simplificações típicas do desenvolvimento. Modelar essas variantes no léxico e adaptar o modelo acústico trazem ganhos que se somam [28].
- **Transfer learning.** Shivakumar & Georgiou [3] compararam adaptação clássica e transfer learning de adulto para criança (GMM-HMM versus DNN), estudaram o efeito da idade e quanto dado de adaptação é necessário. Um trabalho citante descreve o uso de cerca de 91 h de fala de crianças de 6 a 14 anos. Recomendação prática: partir de um modelo adulto forte e adaptar as camadas certas com dado infantil, com ganho maior nas idades menores.

### 2.2 Benchmarks com modelos de fundação (2023–2025)

| Estudo | Modelos | Dados | Resultado-chave |
|---|---|---|---|
| Jain et al., Interspeech 2023 [5] | Whisper (vários tamanhos), wav2vec2 | MyST, PF-STAR, CMU Kids | Fine-tuning do Whisper em fala infantil gera ganho significativo sobre o zero-shot. O **wav2vec2 ajustado superou o Whisper ajustado**. |
| Kid-Whisper, 2023/24 [6] | Whisper | MyST (com pré-processamento) | Fine-tuning com dados limpos do MyST diminui a diferença entre crianças e adultos. Relata SOTA em conjuntos infantis (conferir no PDF). |
| Fan, Balaji Shankar & Alwan, Interspeech 2024 [4] | Whisper-large-v3, Canary, Parakeet-TDT, wav2vec2, HuBERT, WavLM | OGI (leitura), MyST (espontânea) | Primeiro benchmark sistemático. Com fine-tuning completo: Whisper-large-v3 com WER de cerca de 1,4% e wav2vec2-large com cerca de 2,5% no OGI; WavLM-large com cerca de 10,4% no MyST (números de página secundária, conferir no PDF). O PEFT empata com o fine-tuning completo nos modelos grandes, mas perde nos pequenos. Data augmentation (pitch, speed, VTLP, SpecAugment) e a perda proposta PIF ajudam. |

**Leitura crítica:**
- O WER baixo no OGI se explica por ser **leitura de vocabulário restrito**. Na fala espontânea (MyST), o erro sobe para cerca de 10% ou mais. O FONEMA está mais perto do OGI (alvo conhecido), mas com crianças **mais novas** (4 a 8 anos) e que estão **aprendendo a ler**. Nesse cenário, a pronúncia "errada" é justamente o sinal que interessa, e o ASR tende a "corrigir" para a palavra mais provável.
- Modelos seq2seq como o Whisper **alucinam e normalizam**: transformam a produção da criança na palavra correta, o que gera falsos positivos de acerto. Para avaliar pronúncia, é preferível um modelo CTC fonêmico (família wav2vec2/WavLM), o que é coerente com [5] e [9].

### 2.3 Corpora de fala infantil

| Corpus | Língua | Conteúdo | Ref. |
|---|---|---|---|
| **MyST** | Inglês (EUA) | Cerca de 400–470 h, aproximadamente 1.300–1.371 alunos do 3º ao 5º ano conversando com tutor virtual de ciências. Cerca de 100 mil enunciados transcritos. CC para uso não comercial, com licença comercial à parte (LDC2021S05). | [7] |
| **OGI Kids** | Inglês (EUA) | Leitura e fala espontânea, do jardim de infância ao 10º ano. Usado como benchmark em [4]. | [4] |
| **PF-STAR, CMU Kids** | Inglês (UK/EUA) e outras | Usados como benchmark em [5]. | [5] |
| **LetsRead** | **Português europeu** | 284 crianças de 6 a 10 anos (escolas públicas e privadas), cerca de 20 h, frases e **pseudopalavras** de dificuldade variável, anotação manual de disfluências e desempenho de leitura. Disponibilidade pública não confirmada. | [8] |
| Corpus de fala infantil PE de 3 a 10 anos | Português europeu | ASR treinado e testado em crianças. Análise de padrões de pronúncia ligados a erros de reconhecimento. | [10] |
| **Corpus de Rodrigues & Ribeiro** | **Português brasileiro** | 5.400 gravações de palavras isoladas lidas por crianças do 2º e 3º anos, com transcrição fonêmica SAMPA. Disponibilidade pública não confirmada. | [9] |
| CORAA e outros | PB adulto | CORAA v1 com cerca de 291 h (pouco mais de 574 h somando corpora liberados em 2021). Todo o conteúdo é adulto. | [11][12][13] |

**Lacuna:** não foi encontrado nenhum corpus **público** e grande de fala infantil em PB, nem de crianças pré-leitoras (4 a 6 anos) produzindo fonemas e sílabas isoladas. Essa é ao mesmo tempo a principal barreira e o principal ativo competitivo que o FONEMA pode construir.

### 2.4 Avaliação automática de leitura oral (ORF)

- **Project LISTEN / Reading Tutor (CMU, Mostow).** Usa o reconhecedor Sphinx-II. Mostra a história na tela, ouve a leitura em voz alta e responde com ajuda falada e gráfica. Para contornar a imprecisão do ASR infantil, o desenho é **restrito**: ouve no máximo uma frase por vez, contra o texto esperado [14][15]. Beck, Jia & Mostow validaram a **latência entre palavras** como medida automática de fluência, comparada à fluência medida por humanos [16]. A eficácia do tutor foi mostrada em várias avaliações empíricas, incluindo comparação com leitura silenciosa independente, e o trabalho recebeu financiamento do IES/EUA [17]. Lição de "chão de escola": robustez a ruído de sala, microfone e engajamento pesam tanto quanto o modelo [15].
- **LetsRead (Portugal).** Corpus e sistema voltados à avaliação automática do desempenho de leitura de crianças de 6 a 10 anos, com pseudopalavras para isolar a decodificação fônica, exatamente o construto do método fônico [8].
- **PB (2026).** Primeiro sistema de ASR para leitura infantil em PB com abordagem fonêmica [9].

### 2.5 Detecção e diagnóstico de erros de pronúncia (MDD)

- **GOP clássico.** Witt & Young [18] definiram o *Goodness of Pronunciation* como razão de verossimilhança entre o fone esperado e o melhor fone concorrente, normalizada pela duração, com **limiar por fone** e quatro métricas de concordância com juízes humanos, porque o julgamento de pronúncia é subjetivo. A tese de Witt [19] é a referência completa.
- **Classificadores específicos.** Strik et al. [22] compararam classificadores acústico-fonéticos e GOP para erros específicos (pares de fonemas confundíveis). Classificadores dedicados a contrastes previstos superam o GOP genérico. Isso interessa ao FONEMA, porque os contrastes do PB infantil são conhecidos: /r/–/l/, /s/–/ʃ/, vozeamento /p/–/b/, /t/–/d/, /f/–/v/, encontros consonantais e o rótico.
- **Abordagens neurais recentes.** Transfer learning para pontuação de pronúncia [21] e **GOP sem segmentação** com modelos CTC, que dispensa alinhamento forçado frágil [20]. Para crianças, o alinhamento forçado é um ponto fraco conhecido. GOP baseado em CTC é a direção recomendada.
- **Limite:** quase todo MDD foi validado com **adultos aprendendo L2** (L2-ARCTIC, speechocean762 etc.). Na criança nativa a variação desenvolvimental é normal, por exemplo "pato" por "prato" aos 4 anos, e não deve ser tratada como erro da mesma forma.

### 2.6 Distúrbios dos sons da fala (SSD) e fonoaudiologia

- **Cantonês (PolyU):** abordagem "microscópica", com DNN detectando erros fonológicos por fone, e "macroscópica", agregando os erros por falante. Chega a **UAR de 89,0%** na detecção de SSD no nível do falante (IEEE/ACM TASLP 2024) [23]. Variante com representações holísticas de falante (estilo *speaker verification*) supera a fusão de detecções por fone [24].
- **Coreano:** 92 crianças com SSD, cinco métodos combinando ASR e classificação de áudio, melhor resultado com **UAR de 73,9%** [25].
- **Alemão (Interspeech 2025):** wav2vec multilíngue ajustado de forma conjunta para ASR e classificação de SSD, com *augmentation* por fala típica [26].
- **Ultrassom de língua:** revisão sistemática (Frontiers in AI, 2025) aponta a falta de grandes datasets de distúrbio e de sistemas *end-to-end* integrados [27].
- **Implicação:** esses números são de **triagem no nível do falante**, com muitas produções. Classificar **um único enunciado** é bem menos confiável. O FONEMA pode no máximo **sinalizar padrões persistentes** e sugerir avaliação fonoaudiológica, nunca diagnosticar.

### 2.7 Falsos negativos, impacto pedagógico e privacidade

- **Assimetria de custos.** Em tutores de leitura, rejeitar uma leitura correta (falso negativo do ponto de vista da criança) frustra e desmotiva. Por isso, o Reading Tutor aceitava com tolerância e preferia não interromper quando tinha dúvida [14][15]. Witt & Young [18] já calibravam limiares por fone justamente para controlar rejeições indevidas.
- **Viés por idade e sotaque.** O erro cresce em crianças mais novas [1][3]. Sotaques regionais do PB (rótico, /s/ em coda, palatalização de /t, d/) não estão em nenhum corpus infantil. Sem dados regionais, o sistema penalizaria variantes legítimas, o que é um risco de equidade.
- **Privacidade.** Não foi encontrada nesta rodada literatura acadêmica específica sobre a voz infantil. O enquadramento normativo, porém, é claro: LGPD (Lei 13.709/2018), art. 14, que exige consentimento específico e em destaque de pelo menos um dos pais ou responsável e o melhor interesse da criança. Nos EUA vale a COPPA. Voz é dado biométrico em potencial (LGPD, art. 5º, II, dado sensível). O próprio MyST adota licença que separa uso de pesquisa e uso comercial [7], um modelo útil de governança.

---

## 3. Implicações práticas para o FONEMA

### 3.1 Abordagem recomendada (arquitetura)

1. **Verificar, não transcrever.** Cada exercício tem alvo conhecido: fonema /f/, sílaba "fa", palavra "faca". O sistema responde à pergunta "a criança produziu o alvo?" e não "o que a criança disse?". É a lição central do Project LISTEN [14].
2. **Modelo acústico fonêmico CTC** (wav2vec2, WavLM ou XLS-R multilíngue), ajustado para **saída de fonemas pt-BR**: SAMPA ou IPA com tokenização própria, como em [9]. Evitar Whisper como juiz de pronúncia, porque ele normaliza para a palavra correta. O Whisper pode servir para tarefas abertas, como "diga o nome desta figura".
3. **Pontuação:** GOP sobre posteriores CTC (sem segmentação [20]) mais **classificadores binários dedicados** aos contrastes-alvo de cada lição [22]. Calibrar o limiar **por fonema e por faixa etária** [18][1].
4. **Normas desenvolvimentais.** Usar uma tabela de idade de aquisição dos fonemas do PB (a ser fornecida pela frente de fonoaudiologia) para decidir o que é "erro" e o que é "esperado para a idade". Exemplo: substituição de rótico aos 4 anos não gera correção.
5. **Feedback articulatório** baseado no **tipo de erro detectado** (vozeamento, ponto, modo), e não na pontuação bruta. Exemplo: "Ponha a mão na garganta: no /v/ ela vibra!".
6. **On-device sempre que possível**, com modelo pequeno e quantizado. Reduz latência e evita que o áudio saia do aparelho (privacidade).

### 3.2 Limites realistas (o que esperar)

- **Palavras isoladas e conhecidas, de 6 a 8 anos:** com dado próprio, aceitação e rejeição em nível de palavra devem ser confiáveis. Por analogia com o OGI, WER de um dígito com fine-tuning [4].
- **Fonemas e sílabas isolados, de 4 a 5 anos:** é o cenário mais difícil, com sinal curto, pitch alto e articulação imatura [1]. Esperar decisões ruidosas. Usar **várias tentativas** e agregar por sessão, como na estratégia "macroscópica" de [23].
- **Erros finos de ponto articulatório** (/s/ x /ʃ/, distorções): detecção possível no agregado, mas não confiável por enunciado [23][25][27].
- **Não é ferramenta diagnóstica.** No máximo, sinalização para triagem.

### 3.3 Plano de coleta de dados de voz infantil pt-BR (com consentimento)

| Etapa | Detalhe |
|---|---|
| **Ética** | Submeter ao CEP/CONEP (Plataforma Brasil). TCLE para os responsáveis e TALE (assentimento) em linguagem infantil, com ícones. Direito de retirada a qualquer momento, com exclusão do áudio. |
| **Base legal** | LGPD art. 14: consentimento específico e destacado de um responsável. Finalidade declarada: treinar e avaliar o modelo do FONEMA. Opção **separada** para (a) uso só no produto, (b) pesquisa e (c) publicação em corpus aberto anonimizado. |
| **Amostra-alvo (fase 1)** | Cerca de 300 a 500 crianças de 4 a 8 anos, estratificadas por idade (de ano em ano), sexo, **5 regiões** do país e rede pública/privada, inspirado no desenho do LetsRead [8]. Incluir crianças com desenvolvimento típico e, em parceria com clínicas-escola de fonoaudiologia, crianças com diagnóstico de SSD, sob protocolo próprio. |
| **Material** | Os 30 a 35 fonemas do PB em sílabas CV, CCV e CVC, palavras do currículo fônico, **pseudopalavras** (para isolar decodificação [8]) e frases curtas. Seguir a progressão do método. |
| **Gravação** | Os aparelhos reais do produto (tablets e celulares baratos) em sala de aula real, e não só em estúdio [15]. 16 kHz mono, sem compressão com perdas no armazenamento de treino. |
| **Anotação** | Transcrição **fonética estreita** do que a criança realmente disse (e não do alvo), feita por fonoaudiólogos. Dupla anotação em 10 a 20% do material para medir concordância (kappa). Rótulos: correto, substituição, omissão, distorção, inserção e "esperado para a idade". |
| **Volume** | Referência: 91 h de fala infantil foram usadas em [3]; [9] já obteve resultado com 5.400 palavras. Meta inicial de 30 a 50 h anotadas, crescendo com dados de uso consentidos (opt-in). |
| **Segurança** | Pseudonimização (ID sem nome), metadados mínimos (idade em anos, região, sexo), criptografia em repouso, acesso por papel, retenção com prazo definido e registro de consentimento versionado. |

### 3.4 Métricas de qualidade

- **ASR:** WER e **PER** (*phone error rate*) por faixa etária e por região.
- **MDD:** precisão, *recall* e F1 da detecção de erro. **Taxa de falsa rejeição** (FRR, quando o sistema marca como erro uma produção correta) e **taxa de falsa aceitação** (FAR), reportadas por fonema e por idade.
- **Concordância com humanos:** kappa de Cohen ou correlação entre sistema e fonoaudiólogo, comparada com a concordância **entre fonoaudiólogos**. A meta é ficar próxima do teto humano, seguindo a lógica das métricas de [18].
- **Equidade:** diferença máxima de FRR entre regiões, sexos e redes de ensino, sem exceder uma margem pré-definida.
- **Pedagógicas (produto):** persistência na tarefa, abandono após feedback negativo e progressão no currículo.

### 3.5 Política de tolerância a erro (não punir a criança pelo erro do sistema)

1. **Assimetria explícita:** a meta de produto é **FRR ≤ 5%** em produções corretas, mesmo que a FAR suba. Deixar passar um erro custa menos que reprovar um acerto.
2. **Três faixas de confiança:** *aceita* (celebra), *incerta* (convite neutro: "Vamos ouvir de novo e falar juntos?") e *erro provável* (dica articulatória, nunca "errado!").
3. **Nunca bloquear a progressão** por decisão do ASR sozinho. Após duas tentativas incertas, avançar e registrar para o professor ou responsável.
4. **Agregar antes de concluir:** só sinalizar dificuldade persistente (por exemplo, "/r/ em encontros") quando houver várias evidências ao longo de sessões [23].
5. **Detectar condições ruins** (ruído, silêncio, clipping) e pedir nova gravação, sem atribuir a falha à criança.
6. **Humano no circuito:** painel do professor ou fonoaudiólogo com áudio (quando houver consentimento) para revisar as decisões do sistema.

---

## 4. Referências

### 4.1 Referências numeradas (localizadas por busca nesta rodada)

> **Etapa 2 (validação, 13/11/2026):** a última coluna das tabelas de referências traz o status de cada item (VERIFICADA / CORRIGIDA / NÃO ENCONTRADA / NÃO CHECÁVEL), conferido no Crossref, PubMed, ERIC e por requisição HTTP. DOIs encontrados pelas APIs foram acrescentados à coluna URL/DOI. "NÃO CHECÁVEL" quase sempre significa domínio bloqueado pela rede da sessão, não fonte falsa. Detalhes em `validacao-16-25.md`.

| # | Autor(es) | Ano | Título | País | Venue | URL/DOI | O que aproveitar | Etapa 2 (validação 13/11/2026) |
|---|---|---|---|---|---|---|---|---|
| 1 | A. Potamianos, S. Narayanan | 2003 | Robust recognition of children's speech | EUA | IEEE Trans. Speech and Audio Processing 11(6):603–616 | doi:10.1109/TSA.2003.818026 | Explica por que o ASR falha com crianças. WER 2 a 5 vezes maior. Frequency warping e modelos por idade. | **VERIFICADA** — Crossref (DOI) |
| 2 | A. Potamianos, S. Narayanan, S. Lee | 1997 | Automatic speech recognition for children | EUA | Eurospeech 1997 | https://www.isi.edu/results/publications/17966/automatic-speech-recognition-for-children · DOI 10.21437/eurospeech.1997-623 | Normalização do falante (warping e spectral shaping). Ganho de 25 a 45% (conferir no PDF). | **VERIFICADA** — Crossref (busca bibliográfica) |
| 3 | P. G. Shivakumar, P. Georgiou | 2020 | Transfer learning from adult to children for speech recognition: Evaluation, analysis and recommendations | EUA | Computer Speech & Language 63:101077 | https://arxiv.org/abs/1805.03322 ; https://dblp.org/rec/journals/csl/ShivakumarG20 · DOI 10.1016/j.csl.2020.101077 | Receita de transfer learning de adulto para criança, efeito da idade e quantidade de dado de adaptação. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 4 | R. Fan, N. Balaji Shankar, A. Alwan | 2024 | Benchmarking Children's ASR with Supervised and Self-supervised Speech Foundation Models | EUA | Interspeech 2024 (arXiv:2406.10507) | https://arxiv.org/abs/2406.10507 · DOI 10.21437/interspeech.2024-1353 | Benchmark de Whisper, Canary, Parakeet, wav2vec2 e WavLM em OGI e MyST. PEFT, augmentation, PIF. Código no GitHub (diamondfan/spapl_kidsasr). | **VERIFICADA** — Crossref (busca bibliográfica) |
| 5 | R. Jain, A. Barcovschi, M. Yiwere, P. Corcoran, H. Cucu | 2023 | Adaptation of Whisper models to child speech recognition | Irlanda / Romênia | Interspeech 2023 (arXiv:2307.13008) | https://arxiv.org/abs/2307.13008 · DOI 10.21437/interspeech.2023-935 | Fine-tuning do Whisper em criança. wav2vec2 ajustado supera o Whisper ajustado. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 6 | A. A. Attia et al. (Univ. of Maryland; conferir lista completa) | 2023/2024 | Kid-Whisper: Towards bridging the performance gap in automatic speech recognition for children vs. adults | EUA | arXiv:2309.07927 | https://arxiv.org/abs/2309.07927 · DOI 10.1609/aies.v7i1.31618 | Pré-processamento do MyST e fine-tuning do Whisper. | **VERIFICADA** — Crossref (busca bibliográfica); DOI da versão publicada (AIES 2024) |
| 7 | S. Pradhan, R. Cole, W. Ward | 2024 | My Science Tutor (MyST) – A Large Corpus of Children's Conversational Speech | EUA | LREC-COLING 2024 (arXiv:2309.13347); LDC2021S05 | https://aclanthology.org/2024.lrec-main.1052.pdf ; https://catalog.ldc.upenn.edu/LDC2021S05 · DOI 10.63317/3oyyfeeq9pwo | Maior corpus infantil. Modelo de licença que separa pesquisa e uso comercial. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 8 | J. Proença, D. Celorico, S. Candeias, C. Lopes, F. Perdigão | 2016 | The LetsRead Corpus of Portuguese Children Reading Aloud for Performance Evaluation | Portugal | LREC 2016, pp. 781–785 | https://aclanthology.org/L16-1125/ · DOI 10.63317/2btm79vvkmd8 | Desenho de corpus de leitura infantil em português, pseudopalavras e anotação de disfluências. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 9 | Rodrigues, Ribeiro | 2026 | Automatic Speech Recognition for Child Reading: A Phonemic Approach using Isolated Words in Brazilian Portuguese | Brasil | PROPOR 2026 | https://aclanthology.org/2026.propor-1.98/ | **Trabalho mais próximo do FONEMA:** PB, crianças do 2º e 3º anos, wav2vec2 com saída fonêmica SAMPA. Contatar os autores para parceria e dados. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 10 | (ISCTE-IUL; conferir autores) | — | Automatically recognising European Portuguese children's speech: pronunciation patterns revealed by... (capítulo de livro) | Portugal | Capítulo de livro | https://ciencia.iscte-iul.pt/publications/automatically-recognising-european-portuguese-childrens-speech-pronunciation-patterns-revealed-by/22964?lang=en · DOI 10.1007/978-3-319-09761-9_1 | Padrões de pronúncia infantil de 3 a 10 anos que causam erro de ASR em português. | **VERIFICADA** — Crossref (busca bibliográfica); autores: Hämäläinen, Cho, Candeias, Pellegrini, Abad et al. (2014), LNCS |
| 11 | A. Candido Junior et al. | 2021 | CORAA: a large corpus of spontaneous and prepared speech manually validated for speech recognition in Brazilian Portuguese | Brasil | arXiv:2110.15731 | https://arxiv.org/abs/2110.15731 · DOI 10.1007/s10579-022-09621-4 | Base adulta de PB para pré-treino e adaptação. | **VERIFICADA** — Crossref (busca bibliográfica); DOI da versão publicada (CORAA ASR, Language Resources and Evaluation, 2023); ano no Crossref: 2023 |
| 12 | C. Batista et al. | 2018 | Kaldi para português brasileiro (baselines acústicos) | Brasil | IberSPEECH 2018 | https://www.isca-archive.org/iberspeech_2018/batista18_iberspeech.pdf · DOI 10.21437/iberspeech.2018-17 | Recursos e baseline PB, e escassez de dados. | **VERIFICADA** — Crossref (busca bibliográfica); título: Baseline Acoustic Models for Brazilian Portuguese Using Kaldi Tools (Batista, Dias & Sampaio Neto) |
| 13 | (JCIS/SBrT; conferir autores) | — | An open-source end-to-end ASR system for Brazilian Portuguese using DNNs built from newly assembled corpora | Brasil | Journal of Communication and Information Systems | https://jcis.sbrt.org.br/jcis/article/view/721 · DOI 10.14209/jcis.2020.25 | ASR E2E aberto em PB (adulto). | **VERIFICADA** — Crossref (busca bibliográfica); autores: Quintanilha, Netto & Biscainho (2020) |
| 14 | J. Mostow | 2004 | If I Have a Hammer: Computational Linguistics in a Reading Tutor that Listens | EUA | ACL 2004 (palestra convidada) | https://www.aclweb.org/mirror/acl2004/Invited%20talk-Mostow.htm ; https://www.ri.cmu.edu/?p=8983 | Desenho restrito (uma frase por vez, alvo conhecido). | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 15 | J. Mostow et al. | — | When the Rubber Meets the Road: Lessons from the In-School Adventures of an Automated Reading Tutor that Listens | EUA | CMU Robotics Institute | https://www.ri.cmu.edu/?p=17028 | Lições de implantação em escola real. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 16 | J. Beck, P. Jia, J. Mostow | 2004 | Automatically assessing oral reading fluency in a computer tutor that listens | EUA | Technology, Instruction, Cognition and Learning | https://typeset.io/pdf/automatically-assessing-oral-reading-fluency-in-a-computer-64jmt5nbh0.pdf | Latência entre palavras como medida automática de fluência. | **NÃO CHECÁVEL** — periódico TICL sem DOI no Crossref; link bloqueado |
| 17 | IES (Dept. of Education, EUA) | — | Accelerating fluency development with an automated reading tutor (projeto financiado) | EUA | IES Award | https://ies.ed.gov/use-work/awards/accelerating-fluency-development-automated-reading-tutor | Evidência de financiamento e avaliação de eficácia. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 18 | S. M. Witt, S. J. Young | 2000 | Phone-level pronunciation scoring and assessment for interactive language learning | Reino Unido | Speech Communication 30(2–3):95–108 | https://mi.eng.cam.ac.uk/~sjy/papers/wiyo00.pdf · DOI 10.1016/s0167-6393(99)00044-8 | GOP, limiar por fone e métricas de concordância com humanos. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 19 | S. M. Witt | 1999 | Use of speech recognition in computer-assisted language learning (tese) | Reino Unido | PhD thesis, Univ. of Cambridge | https://mi.eng.cam.ac.uk/reports/abstracts/speech/witt_thesis.html | Fundamentação completa do GOP. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 20 | (conferir autores; provável NTNU) | 2025 | Segmentation-Free Goodness of Pronunciation | (Noruega, conferir) | arXiv:2507.16838 | https://arxiv.org/abs/2507.16838 · DOI 10.1109/taslpro.2026.3654852 | GOP sobre CTC sem alinhamento forçado, útil para criança. | **VERIFICADA** — Crossref (busca bibliográfica); autores: Cao, Fan, Svendsen & Salvi; versão publicada na IEEE TASLP (2026) |
| 21 | (conferir autores; provável Sancinetti, Vidal, Bonomi, Ferrer) | 2021/2022 | A transfer learning approach for pronunciation scoring | (Argentina, conferir) | arXiv:2111.00976 | https://arxiv.org/abs/2111.00976 · DOI 10.1109/icassp43922.2022.9747727 | Pontuação de pronúncia com poucos dados anotados. | **VERIFICADA** — Crossref (busca bibliográfica); autores: Sancinetti, Vidal, Bonomi & Ferrer; publicado no ICASSP 2022 |
| 22 | H. Strik, K. Truong, F. de Wet, C. Cucchiarini | 2007 | Comparing classifiers for pronunciation error detection | Países Baixos | Interspeech 2007 | https://www.isca-archive.org/interspeech_2007/strik07_interspeech.pdf · DOI 10.21437/interspeech.2007-512 | Classificadores dedicados a contrastes específicos superam o GOP genérico. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 23 | (PolyU; conferir autores) | 2024 | Automatic Detection of Speech Sound Disorder in Cantonese-Speaking Pre-School Children | Hong Kong (China) | IEEE/ACM TASLP | https://research.polyu.edu.hk/en/publications/automatic-detection-of-speech-sound-disorder-in-cantonese-speakin/ · DOI 10.1109/taslp.2024.3463503 | Detecção micro (por fone) e macro (por falante). UAR de 89%. | **VERIFICADA** — Crossref (busca bibliográfica); autores: Ng, Ng, Wang & Lee (2024) |
| 24 | S.-I. Ng et al. | 2022 | Automatic Detection of Speech Sound Disorder in Child Speech Using Posterior-based Speaker Representations | Hong Kong (China) | arXiv:2203.15405 (Interspeech 2022) | https://arxiv.org/pdf/2203.15405 · DOI 10.21437/interspeech.2022-935 | Representações holísticas por falante para triagem. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 25 | Sung et al. | 2024 | Automatic detection of speech sound disorder in children using automatic speech recognition and audio classification | Coreia do Sul | Phonetics and Speech Sciences | https://koreascience.kr/article/JAKO202431643648160.page?lang=ko · DOI 10.13064/ksss.2024.16.3.087 | 92 crianças com SSD. ASR combinado com classificação. UAR de 73,9%. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 26 | Marx et al. | 2025 | Fine-tuning de wav2vec multilíngue para ASR e classificação SSD em crianças alemãs | Alemanha / Itália (FBK) | Interspeech 2025 | https://www.isca-archive.org/interspeech_2025/marx25_interspeech.html · DOI 10.21437/interspeech.2025-1996 | Treino conjunto de ASR e SSD, com augmentation por fala típica. | **VERIFICADA** — Crossref (busca bibliográfica); autores: Marx, Matassoni & Brutti; título no Crossref: Automatic detection of speech sound disorders in German-speaking children (…) |
| 27 | Al Ani et al. | 2025 | Deep learning in ultrasound tongue imaging: a systematic review toward automated detection of speech sound disorders | Reino Unido | Frontiers in Artificial Intelligence | https://strathprints.strath.ac.uk/94120/ · DOI 10.3389/frai.2025.1631134 | Estado do ultrassom e da IA. Lacunas de dados. | **VERIFICADA** — Crossref (busca bibliográfica) |
| 28 | P. G. Shivakumar, A. Potamianos, S. Lee, S. Narayanan | 2014 | Improving speech recognition for children using acoustic adaptation and pronunciation modeling | EUA / Grécia | WOCCI 2014 | https://www.isi.edu/results/publications/17209/improving-speech-recognition-for-children-using-acoustic-adaptation-and-pronunciation-modeling/ | Modelagem de pronúncia infantil no léxico, somada à adaptação acústica. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |
| 29 | USC / IMSC | — | CHIMP — Children's Interactive Multimedia Project (relatório) | EUA | USC Integrated Media Systems Center | https://infolab.usc.edu/imsc/research/project/chimp/chimp.pdf | Interação falada com crianças em jogos, contexto histórico. | **NÃO CHECÁVEL** — domínio bloqueado pelo proxy |

### 4.2 Recursos citados na pauta que não foram verificados nesta rodada (verificar antes de usar)

- **CSLU Kids' Speech** (OGI/OHSU, distribuído pela LDC), **CMU Kids** (LDC), **PF-STAR** (UE: inglês britânico, alemão, sueco, italiano), **JIBO Kids**: só confirmados indiretamente, como benchmarks em [4][5].
- **CHILDES** português (TalkBank) e "Projeto ALIP": não verificados (a busca de confirmação não pôde ser feita porque o orçamento acabou).
- Literatura acadêmica específica sobre **privacidade da voz infantil**: não coberta. Recomenda-se uma nova rodada de busca.

**Totais:** 29 referências numeradas, de 11 países ou regiões: EUA, Portugal, Brasil, Reino Unido, Irlanda, Romênia, Países Baixos, Hong Kong (China), Coreia do Sul, Alemanha e Itália, além de Noruega, Argentina e Grécia como afiliações prováveis, a conferir.
