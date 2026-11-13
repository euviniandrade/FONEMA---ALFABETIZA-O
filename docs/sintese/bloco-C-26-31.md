# Síntese — Bloco C: relatórios 26 a 31

> Parte do DOCUMENTO MESTRE de síntese do FONEMA. Data: 13/11/2026.
> Fontes: `docs/pesquisa/26` a `31` e `docs/decisoes/001` a `004`.
> Escopo: família/professores/escolas (26), mercado e modelo de negócio (27), arte/animação/áudio (28), fonoaudiologia (29), ciências da aprendizagem e jogos (30), catálogo de funcionalidades/gráficos/design (31).

## Como ler

- **Marcas de evidência:** cada relatório usou a sua própria legenda, e ela foi mantida.
  - [V] = conferido por DOI, PMID, ERIC ou leitura da página na sessão do relatório.
  - [V-D] (rel. 27) = verificado direto em Crossref ou ERIC.
  - [V-B] (rel. 27) e [V-URL] (rel. 26) = documento localizado por busca; **o número precisa ser conferido na fonte primária**.
  - [NV] = não verificado (memória, livro sem DOI, página bloqueada).
  - "Estimativa própria" = conta ou orçamento feito pelo relatório, **sem fonte**.
- **Tipo de estudo** vem entre parênteses (meta-análise, ECR, quase-experimento etc.), porque é o que dá a força do achado.
- **Decisões prevalecem sobre os relatórios.** Quando um relatório contradiz uma decisão (sobretudo a 001 sobre preços), o texto diz isso e traz a versão atualizada.
- Esta síntese **não acrescenta dados novos**. Contas de conversão estão rotuladas como tal.

---

## Rel. 26 — Família, professores e implementação nas escolas

**Base:** 85 referências (76 [V], 7 [V-URL], 2 [NV]). Os números oficiais brasileiros (Cetic.br, Inep, Inaf, MEC) estão todos como [V-URL]: o PDF não abriu na sessão.

### (a) Achados mais fortes

1. **O tipo de envolvimento dos pais importa mais que a quantidade.** Pais treinados para ensinar habilidades específicas de leitura têm efeito grande (d ≈ 1,1). Pais que ouvem a criança ler têm efeito moderado (d ≈ 0,5). Pais que só leem para a criança têm efeito pequeno e não significativo sobre a decodificação (d ≈ 0,2). Programas amplos de literacia familiar têm efeito pequeno (d ≈ 0,18), inclusive em famílias de baixa renda, e maior em código do que em linguagem.
   - Evidência: meta-análises [V]. Os valores de d foram citados "de memória a partir de artigos verificados" e devem ser revisados antes de publicação externa.
   - Referências: Sénéchal & Young 2008; van Steensel et al. 2011; Fikrat-Wevers et al. 2021.
   - Complemento: no estudo longitudinal de Sénéchal & LeFevre 2002 [V], **ler livros** prediz vocabulário e compreensão, e **ensinar letras e palavras** prediz a leitura inicial. São dois caminhos distintos.
2. **Mensagens curtas aos pais são a intervenção familiar mais barata com evidência experimental.**
   - READY4K (ECR [V], ~1.000 famílias de crianças de 4 anos): 3 SMS por semana (fato, dica, reforço) aumentaram as atividades de letramento em casa e deram ganhos de ~0,2–0,3 DP em alguns subtestes.
   - Mensagens diferenciadas pelo nível da criança foram melhores para parte das crianças (Doss et al. 2019, ECR [V]).
   - No Brasil, SMS a pais da rede pública paulista melhoraram frequência e desempenho, e parte do efeito vem da **saliência** (Lichand et al., ECR [V]).
   - Mensagens da professora sobre **o que o aluno pode melhorar** funcionaram melhor que elogio genérico (Kraft & Rogers 2015, ECR [V]).
3. **Tela compartilhada só ajuda se for desenhada para isso.**
   - Livros digitais com muitos recursos reduzem o diálogo entre pais e filhos (Munzer 2019; Strouse & Ganea 2017 [V]).
   - Narração, animação e música **coerentes com a história** ajudam; hotspots e jogos sem relação com ela distraem (meta-análise de Takacs, Swart & Bus 2015 [V]).
   - O celular dos pais interrompe a aprendizagem da criança (Reed et al. 2017 [V]; McDaniel & Radesky 2018 [V]).
4. **Muitos pais brasileiros têm baixa escolaridade e acessam a internet só pelo celular.**
   - Inaf 2024: ~29% de analfabetismo funcional entre 15 e 64 anos e ~42% no Nordeste somando os níveis analfabeto e rudimentar [V-URL].
   - ~60% dos usuários de internet acessam só pelo celular (TIC Domicílios 2024 [V-URL]).
   - Usuários com baixo letramento acertam mais com voz + imagem do que com menus de texto (Medhi et al. 2007/2011 [V]).
5. **Tecnologia sem implementação não funciona; software adaptativo integrado à rotina funciona.**
   - Laptops e computadores sem integração pedagógica não melhoraram a aprendizagem no Peru e na Colômbia (ECRs [V]).
   - Mindspark, na Índia: ~0,37 DP em matemática e ~0,23 DP em hindi em ~4,5 meses (Muralidharan et al. 2019, ECR [V]).
   - Com boa implementação, os efeitos costumam ser 2 a 3 vezes maiores (Durlak & DuPre 2008 [V]).
6. **Os casos de sucesso brasileiros são sistêmicos, não tecnológicos.**
   - Sobral e PAIC/Ceará combinaram meta no 2º ano, avaliação externa frequente, material estruturado, formação continuada e ICMS ligado à aprendizagem (Banco Mundial [V]).
   - ICA 2024: Ceará 85,3% × Brasil 59,2% [V-URL].
   - Em formação de professores, coaching tem efeito de ~0,49 DP na prática e ~0,18 DP na aprendizagem, menor em escala, e o virtual funciona (Kraft, Blazar & Hogan 2018, meta-análise [V]).
   - **Guia do professor estruturado** foi o ingrediente mais custo-efetivo no Quênia (Piper et al. 2018, ECR [V]).

### (b) Regras de design e produto

**Área dos pais**
- Propor uma **"missão da semana" de 5 minutos** ligada ao fonema atual da criança, no formato fato/dica/reforço, 3 vezes por semana, diferenciada pelo nível real da criança.
- Manter **duas trilhas separadas**: "brincar com sons e letras" (código) e "hora da história" (leitura dialógica com 2 ou 3 perguntas prontas por livro).
- Oferecer o **modo "ouça seu filho ler"**: a criança grava uma frase decodificável e o pai responde com um coração ou um áudio. O pai não precisa saber ler bem.
- Fazer a área **áudio-primeiro**:
  - botão "ouvir" em todo texto;
  - relatório em **ícone + frase falada**, sem gráfico como formato principal;
  - no máximo 2 níveis de navegação;
  - cadastro e login por **celular/código, sem e-mail**.
- Aumentar a autoeficácia ("você não precisa ser professor para ajudar") e trazer o convite **assinado pela professora**.
- **Anti-tecnoferência:** no máximo 3 notificações por semana, no horário escolhido pelo pai, e nenhuma durante o "modo juntos".
- **"Modo juntos":** sem hotspots nem minijogos durante a história; perguntas para o adulto num balão discreto; a Sofia "cede a vez" ao adulto.
- **Dados leves:** áudio comprimido, vídeos de até 60 s e opcionais, download das missões só com Wi-Fi.

**WhatsApp**
- Usar um canal oficial pela API do WhatsApp Business: áudio da Sofia ou da professora + 1 imagem + link profundo para o app.
- O pai pode responder com áudio da criança lendo, com consentimento LGPD.
- **Nunca usar o número pessoal da professora.**
- Repetir o mesmo tema em dias diferentes (saliência).
- Testar em A/B: SMS × WhatsApp texto × WhatsApp áudio.
- Opt-in explícito do responsável, nenhuma foto de criança em grupo e dados mínimos.

**Painel do professor: "três perguntas, não trinta gráficos"**
1. Quem precisa de mim hoje? Alertas acionáveis: travado há 3 sessões, "chutando", sem uso há 7 dias.
2. Como está a turma no mapa de fonemas? Grade aluno × correspondência grafema-fonema.
3. O que fazer amanhã? Grupos de 3 a 5 crianças com a atividade correspondente.

Além disso:
- modo ao vivo em sala, estilo Lumilo;
- cada indicador com frase simples e sugestão pedagógica;
- destaque para as crianças "invisíveis";
- relatório exportável no formato da secretaria;
- mensagem aos pais em 1 clique.

**Sala de aula**
- **Offline-first:** as lições do mês ficam no tablet; o ASR precisa de modo local ou degradado.
- **Modo estação** de 10 a 15 min por grupo, com troca rápida de aluno (avatar e foto, sem senha) e **2 crianças por tablet** com turnos.
- **Kit impresso** da estação sem tela, com a mesma correspondência grafema-fonema.
- **Modo projetor/TV:** um aparelho por turma, com a Sofia conduzindo a consciência fonológica.
- **Fidelidade medida automaticamente:** dose (min/aluno/semana), cobertura e tempo em tarefa, com painel para a gestão.

**Formação embutida**
- Microvídeos de 2–3 min ligados à lição do dia.
- Guia do professor estruturado (eu faço / nós fazemos / você faz).
- Coaching assistido por dados para coordenadores.
- Comunidade de prática da rede.
- Posicionar o FONEMA como **ferramenta do sistema** (Compromisso Nacional, PAIC), sem competir com ele.

### (c) Números operacionais

| Item | Valor | Fonte/status |
|---|---|---|
| Mensagens aos pais | 3 por semana (fato, dica, reforço) | READY4K [V] |
| Teto de notificações | 3 por semana | regra derivada [31][32] |
| Missão em casa | 5 min | proposta do relatório |
| Vídeo para pais | ≤ 60 s | proposta do relatório |
| Estação em sala | 10–15 min por grupo; 1–5 tablets por turma | proposta do relatório |
| Grupos sugeridos | 3–5 crianças | proposta do relatório |
| Alertas | travado 3 sessões; sem uso 7 dias | proposta do relatório |
| Internet para uso dos alunos (EF) | ~48,8% das escolas | Censo Escolar 2024 [V-URL] |
| Uso de internet pelos alunos | ~27% na rede municipal × ~67% na estadual | TIC Educação 2024 [V-URL] |
| ENEC | ~138 mil escolas até 2026; Inec ~70% no fim de 2025 (57,3% em dez/2024) | [V-URL] |
| ICA | Brasil 59,2% (2024); Ceará 85,3% | [V-URL] |

### (d) Riscos, limites e pendências

- **Não há ECR verificado de WhatsApp (áudio) para alfabetização no Brasil.** O FONEMA pode gerar essa evidência.
- Não há avaliação de impacto causal do "Conta pra Mim" nem do "Mais Alfabetização".
- Todos os números do Censo, da TIC Educação, do Inaf e do ICA precisam ser conferidos no PDF. É preciso liberar `cetic.br` e `download.inep.gov.br`.
- Os d de Sénéchal & Young, Kraft e outros foram citados "cerca de"; revisar antes de material externo.
- Risco de **app em casa sem estrutura**: as perdas do ensino remoto em SP mostram esse limite (Lichand et al. 2022 [V]).
- O coaching perde efeito em escala.
- WhatsApp traz riscos de sobrecarga da professora, mistura entre vida pessoal e trabalho, e LGPD.
- Muitos professores têm pouca formação para usar dados: o painel precisa **interpretar**, não só mostrar números.

---

## Rel. 27 — Mercado, modelo de negócio e validação de impacto

**Base:** 21 [V-D], 37 [V-B] e 4 [NV], além de várias afirmações [NV] no corpo do texto. Os números de mercado e de compra pública vêm quase todos de trechos de busca [V-B]. **A seção de preços está desatualizada pela Decisão 001 (ver abaixo).**

### (a) Achados mais fortes

1. **O problema é grande e medido por fonte oficial.**
   - ~13,7 milhões de crianças de 5–9 anos e ~12,7 milhões de 0–4 anos (Censo 2022 [V-B]), ou seja, ~2,7 milhões por ano de idade.
   - ICA 2025 = 66% [V-B, TPE]. Isso dá **≈ 0,9 milhão de crianças por ano** terminando o 2º ano sem estar alfabetizadas (estimativa FONEMA: 2,7 mi × 34%).
   - A população de até 14 anos caiu 12,6% entre 2010 e 2022 [V-B].
2. **Quem paga em escala é a prefeitura (B2G).** A rede municipal tem 69,7% das matrículas dos anos iniciais, e a rede privada tem ~20% da educação básica (Inep 2024 [V-B]).
3. **O capital de risco para edtech está escasso.**
   - O Brasil concentra ~70% das edtechs da América Latina (US$ 475,6 mi em 280 rodadas entre 2015 e o 1º tri de 2024 [V-B]).
   - Os aportes em edtech caíram 73% em 2023, e o VC geral caiu 13% em 2025 [V-B].
   - Conclusão do relatório: **filantropia + receita antes de VC.**
   - Os números do "mercado global de apps de alfabetização" (US$ 5,8 bi, CAGR de 17%) são **[NV]**, com metodologia fechada. Não usar em pitch.
4. **A compra pública tem portas definidas** (Lei 14.133/2021 e LC 182/2021 [V-B]):
   - **pregão com ARP** é a via mais segura, com carona de até 50% por órgão;
   - **CPSI** (até R$ 1,6 mi, 12+12 meses, depois fornecimento de 24+24 meses até 5×) é a melhor porta para pilotos pagos;
   - **dispensa** só para pilotos pequenos (teto de R$ 65.492,11 em 2026);
   - **inexigibilidade** só com exclusividade comprovada e parecer jurídico.
5. **Evidência vira vantagem comercial.**
   - O concorrente brasileiro com melhor evidência é o **Escribo Play**: ECR com 749 crianças, 62 turmas e 17 escolas, d = 0,40 em leitura e 0,20 em escrita (Amorim et al. 2020 [V-D]; efeitos [V-B]). Os estudos são liderados pelo criador do produto.
   - Os efeitos aparecem inflados em estudos pequenos, com medidas do próprio pesquisador e em quase-experimentos (Cheung & Slavin 2016 [V-D]).
   - A matriz **CIEB NT 29 (2025)** é a "linguagem" dos técnicos das secretarias [V-B].
6. **Plano de impacto em fases**, até um **RCT por conglomerado** pré-registrado, com avaliador externo e medidas independentes (ESSA nível 1). O relatório recomenda ~80–100 turmas com pré-teste para detectar ~0,2 DP.

### (b) Regras de produto e de negócio

**Modelo "B2G-led híbrido"**
- Ano 1: B2C freemium, escolas privadas e pilotos públicos financiados por filantropia.
- Ano 2: avaliação independente e primeiras vendas por pregão com ARP.
- Ano 3: escala por adesões (carona) e programas estaduais.

**Fases de mercado propostas**

| Fase | Período | Escopo |
|---|---|---|
| 0 | 1º sem. 2027 | Beta: 200–500 famílias e 3–5 turmas |
| 1 | 2º sem. 2027 | B2C + 5–20 escolas privadas |
| 2 | 2027–2028 | 2–4 municípios via CPSI |
| 3 | ano letivo de 2028 | RCT com 60–100 turmas |
| 4 | 2029+ | Escala B2G (60–300 mil alunos) |

**Preços: versão atualizada pela Decisão 001** (substitui o §3.6 e o resumo executivo do rel. 27)

| Produto | Rel. 27 (original) | **Versão vigente (Decisão 001)** |
|---|---|---|
| Parte gratuita | "trilha central limitada por dia" | **Freemium por conquista.** Parte gratuita suficiente para engajar a criança, para o responsável ver o antes/depois e para a escola ver o painel da turma. Recorte proposto: consciência fonológica + vogais + 1º grupo de consoantes + primeiras sílabas e palavras (~4–8 semanas), com relatório completo. **Gatilho do plano pago:** concluir a parte gratuita (ex.: fim do 1º mundo/região). A validar em piloto |
| B2C família | R$ 24,90–29,90/mês **ou R$ 179–229/ano** (até 3 crianças) | **Só mensal: R$ 24,90–29,90/mês** (faixa-hipótese mantida). **Plano anual excluído** |
| B2B escola privada | R$ 60–120/aluno/ano [NV] | **Por aluno/mês.** Conversão aritmética do original: ≈ R$ 5–10/aluno/mês [NV, sem âncora de mercado; a recalcular] |
| B2G rede pública | R$ 25–50/aluno/ano | **Por aluno/mês, via contratação pública.** Conversão aritmética: ≈ R$ 2,10–4,20/aluno/mês (a recalcular) |
| B2G formação/implantação | item separado | sem mudança |

- **Conformidade:** a oferta de compra aparece **só para o adulto, atrás da porteira parental**, nunca para a criança. Sem anúncios e sem compras dirigidas à criança (Decisões 001 e 002; ECA Digital).
- O TAM B2C do relatório usou R$ 200/ano por criança. Com preço mensal, refazer a conta.

**Validação de impacto: boas práticas**
1. Pré-registro.
2. Medidas independentes; os dados do jogo são resultado secundário.
3. Avaliador externo e publicação **mesmo de resultado nulo**.
4. Medir dose e fidelidade e reportar ITT e CACE.
5. Aprovação em CEP/Conep, consentimento dos pais e assentimento da criança.
6. A voz não é usada para identificar a criança.
7. **Não prometer "nota Saeb"**; falar em "estimativa de trajetória".
8. Preencher a matriz CIEB NT 29 antes de conversar com as redes.

**Painel de impacto:** aprendizagem; engajamento saudável (dentro do intervalo-alvo, não "mais é melhor"); equidade (região, renda, ASR por sotaque); negócio (CAC, LTV, conversão, churn, custo de voz/ASR por criança).

### (c) Números operacionais

| Item | Valor | Status |
|---|---|---|
| Coorte por idade | ≈ 2,7 mi | [V-B] / estimativa |
| Crianças/ano não alfabetizadas ao fim do 2º ano | ≈ 0,9 mi | estimativa FONEMA |
| Matrículas na educação básica | 47,1 mi (≈ 20,2% privadas) | [V-B] |
| Rede municipal nos anos iniciais | 69,7% | [V-B] |
| ICA | 56% (2023) → 59,2% (2024) → 66% (2025); CE, PR e GO ≈ 80% | [V-B] |
| Teto B2G teórico (pré + 1º + 2º, ~6,5 mi alunos) | ≈ R$ 160–325 mi/ano (base anual do original) | estimativa |
| Meta realista em 5 anos | 1–5% do teto B2G (60–300 mil alunos; R$ 2–15 mi/ano) | hipótese |
| VAAF-MIN do Fundeb 2025 | ≈ R$ 5,4–5,7 mil/aluno | [V-B], com valores divergentes |
| **Custo variável de TTS + ASR** | **bem abaixo de R$ 10 por criança/ano** para o B2G fechar | regra de *unit economics* |
| CPSI | até R$ 1,6 mi; 12+12 meses | [V-B] |
| Dispensa (2026) | R$ 65.492,11 | [V-B], com divergência entre fontes para 2025 |
| RCT | MDES ≈ 0,22 DP (60 turmas) / 0,17 DP (100 turmas) com pré-teste, ICC 0,15 [NV], n = 20 por turma | estimativa |
| Dose hipotética (F0) | 15 min/dia, 4×/semana | exemplo do relatório |
| Concorrentes (preço BR) | Lingokids R$ 59,90/mês; GraphoGame R$ 24,90 | [V-B] |

### (d) Riscos, limites e pendências

- **Riscos com probabilidade alta:**
  - ciclo lento de venda pública, com eleição municipal em 2028 e troca de gestão em 2029;
  - concorrentes gratuitos ou subsidiados;
  - infraestrutura das escolas;
  - VC escasso;
  - números de mercado frágeis.
- **Riscos de impacto alto:**
  - contestação jurídica (inexigibilidade);
  - RCT nulo;
  - LGPD e ECA Digital: Lei 15.211/2025, vigente desde 17/03/2026, com o art. 20 proibindo loot boxes e o art. 22 proibindo perfilamento publicitário;
  - custo de TTS/ASR;
  - promessa exagerada.
- **Pendências:**
  - abrir as Sinopses do Inep (matrículas dos anos iniciais por rede) e o SIDRA (idade simples de 4–8 anos);
  - ler os textos literais da Lei 14.133 (arts. 74, 75, 82–86), da LC 182 (arts. 13–15), da LGPD (art. 14) e da Lei 15.211 (arts. 20 e 22);
  - buscar preços registrados em ARPs no PNCP/Compras.gov.br;
  - verificar se há edital ativo do Guia de Tecnologias Educacionais do MEC;
  - confirmar editais de Lemann, Itaú Social, TPE e BID Lab em 2027;
  - fazer pesquisa van Westendorp com 300+ pais, segmentada por classe.
- **Nova pendência criada pela Decisão 001:**
  - recalcular todas as faixas e o TAM em base mensal;
  - confirmar com advogado de licitações como se contrata "por aluno/mês" em pregão/ARP e CPSI.

---

## Rel. 28 — Arte, animação, vídeo, áudio e música

**Base:** 59 entradas [V] (38 diretas e 21 via busca ou fonte secundária) e 3 [NV]. **Todos os custos em R$ são estimativas próprias, sem fonte.** O agrupamento de visemas também é proposta própria [NV].

### (a) Achados mais fortes

1. **Vídeo real de rosto para o que se vê; corte lateral animado em 2D para o que não se vê.**
   - Modelo por vídeo ≥ modelo ao vivo para imitação (Charlop-Christy 2000; meta-análise de Bellini & Akullian 2007 [V], ambos com TEA).
   - A língua, o véu e o vozeamento só aparecem num corte sagital. Base: articulation pictures (Boyer & Ehri 2011 [V]); fonema + articulação foi a condição mais eficaz no Brasil (Sargiani, Ehri & Maluf 2018 [V]); rosto translúcido de Massaro [V]; biofeedback por ultrassom [V].
   - **Rosto 3D não é recomendado** (custo e vale da estranheza).
   - **Limite:** não há estudo controlado do vídeo da boca como **única** intervenção em alfabetização típica. A/B obrigatório.
2. **Déficit de vídeo e contingência.** Crianças de até ~3 anos aprendem menos por tela (Barr & Hayne 1999; Strouse & Troseth 2014 [V]). O déficit diminui com contingência, então a Sofia deve **reagir** à criança e o vídeo não deve rodar passivo.
3. **Sincronia audiovisual:** a janela de integração das crianças é parecida com a dos adultos (Hillock-Dunn et al. 2016 [V]), embora amadureça até a adolescência em outros paradigmas [V]. O áudio adiantado em relação ao vídeo é percebido mais cedo.
4. **Sofia em Rive, com visemas do Azure.**
   - O Azure TTS suporta pt-BR com Viseme ID e blend shapes (55 posições a 60 fps); a saída SVG existe só para en-US [V, página lida].
   - O Duolingo usa Rive + visemas em escala [V].
   - O Rive recomenda **Data Binding** em vez de inputs [V].
   - Há relato de vozes sem blend shapes: testar a voz escolhida antes de fechar contrato.
5. **Ambiente visual limpo na tarefa.** A decoração excessiva reduziu a atenção e a aprendizagem de crianças de 5–6 anos (Fisher, Godwin & Seltman 2014 [V]), e o efeito persiste com exposição repetida (Godwin et al. 2022 [V]).
6. **Áudio seguro e música.**
   - Norma OMS-ITU H.870: modo criança de **75 dB(A)** por 40 h/semana [V].
   - Treino musical tem efeito pequeno a moderado sobre a consciência fonológica (Gordon et al. 2015, meta-análise [V]). A canção é **veículo de memória e motivação**, não substitui a instrução fônica.

### (b) Regras de design e produção

**Nome e marca**
- Chamar o recurso de "Boca da Sofia" ou "Espelho do Som". **Não usar "Boquinhas"** (Método das Boquinhas, registrado no INPI em 2008 [V]).

**Vídeos da boca**
- **Modelo principal:** fonoaudióloga adulta com CRFa e sotaque "neutro". Variantes regionais em pacotes opcionais: [tʃ dʒ], /s/ de coda, róticos.
- **Modelos secundários:** 3 crianças de 6–9 anos, de regiões e etnias diferentes, com termo dos responsáveis e cessão de imagem com prazo.
- Cada clipe é aprovado por **2 fonoaudiólogas independentes**, com checklist articulatório.
- **Estrutura fixa do clipe:**
  1. a Sofia aponta para a moldura;
  2. som isolado ×2 (contínuos prolongados por 1,0–1,5 s; oclusivos sem vogal de apoio: /p/, não "pê");
  3. corte lateral 2D de 1,5–2 s;
  4. sílaba e palavra-âncora;
  5. **a letra aparece no instante do som**;
  6. tela "sua vez" com espelho local sem gravação.
- **Corte lateral obrigatório** para os pares que o rosto não distingue: /t/×/k/, /s/×/ʃ/, surdo×sonoro, oral×nasal.
- O vídeo sai com **áudio embutido (mux)**, e não com áudio tocado em paralelo (a latência do Android varia).

**Sofia (Rive)**
- **12 bocas** ligadas à propriedade `viseme` por Data Binding.
- Camadas paralelas de corpo, olhar e boca.
- Estados: idle sutil, ouvir, pensar, apontar, comemorar pequeno e grande, "vamos de novo" (**nunca triste**) e bocejo.
- **Nada se move durante a resposta da criança.**
- Três fluxos de lip-sync:
  - falas roteirizadas: TTS Azure + JSON de visemas gerados no build;
  - gravações da dubladora: Rhubarb faz o 1º passe e o animador corrige;
  - "modo boca" do fonema: **33 animações feitas à mão**.
- **Ferramentas:** Rive para personagens, Lottie/dotLottie para efeitos. **Não comprar Spine nem Live2D.**

**Áudio**
- Fala a −16 LUFS, −1 dBTP e compressão 2:1.
- Fonema isolado com pico de −3 dBFS e sem compressão que achate o ataque das oclusivas.
- Música de fundo 12–15 dB abaixo da fala, com *ducking*, e **muda com microfone ligado** ou em tarefa de som-alvo.
- Erro = som neutro e curto (≤ 200 ms), **nunca buzina**.
- Limitador master no app.
- Seção "Cuidando dos ouvidos" para os pais.

**Música e licenças**
- Canções **encomendadas com cessão total dos direitos patrimoniais**; avaliar com advogado o tratamento do ECAD (o STJ trata streaming como execução pública).
- **Não usar** gravações folclóricas de terceiros nem paródias: o arranjo e a gravação não são domínio público [NV, princípio geral].
- Efeitos sonoros:
  - gravação própria e Foley brasileiro;
  - Kenney (CC0);
  - Freesound só CC0 ou CC-BY (**excluir BY-NC**);
  - OpenGameArt sem GPL nem CC-BY-SA em material sincronizado.
- Registro de licenças em CSV.

**Voz**
- **Dubladora humana:** fonemas, pares mínimos, 150–300 falas-chave e canções.
- **TTS neural:** histórias e frases dinâmicas.
- Clonar a voz da dubladora só com contrato específico (finalidade, prazo, remuneração, revogação) e aviso aos pais. PLs 3392/2024 e 4041/2025: [V], com tramitação não confirmada.

**Estilo visual**
- 2D "feito à mão", formas arredondadas, sem preto puro.
- Dois níveis de densidade: **"mundo"** rico (6–10 elementos) e **"tarefa"** dessaturada (≤ 3 elementos além do alvo).
- Nenhum flash acima de 3/s (WCAG 2.3.1).
- `prefers-reduced-motion` respeitado.
- Cor sempre redundante com forma: vogal sobre "gota", consoante sobre "bloco".
- **Representatividade:** Sofia parda (pardos são 45,3% e pretos 10,2% da população no Censo 2022 [V]).

**Tipografia** (todas OFL [V])
- Andika: letra bastão e imprensa.
- **Playwrite BR + Guides:** cursiva escolar. Não se confirmou que siga um modelo oficial do MEC.
- Atkinson Hyperlegible ou Lexend: área dos pais.
- Fonte lúdica só em títulos.
- As animações de traçado são SVG próprios, revisados pela equipe pedagógica.

### (c) Números operacionais

| Item | Valor |
|---|---|
| Gravação | 4K, 60 fps, lente 85–105 mm; áudio 48 kHz/24-bit; RT60 < 0,3 s; ruído < 30 dBA |
| Sincronia | desvio de áudio entre −10 e +30 ms; QA ≤ 30 ms |
| Entrega do vídeo | H.264 720×720 a 30 fps (~1–1,5 Mbps) + versão leve 480×480 (~500 kbps); AAC 128 kbps; legenda WebVTT |
| Duração dos clipes | base 4–8 s; par mínimo 6–10 s; "sua vez" com 3 s de pausa |
| Inventário | ~33 clipes base + 8 de pares mínimos + 7 de vogais = **≈ 48 clipes** |
| Sofia | ~40 estados; parceiro ~20; 12 bocas; 33 "modo boca"; animação a 24 fps |
| Áudio | fala −16 LUFS / −1 dBTP; música −28 a −32 LUFS; efeitos com pico de −6 dBFS e 50–300 ms |
| Canções | 26 (20–40 s, 90–110 bpm [NV]) + tema + "tchau" + 4–6 trilhas em loop |
| Movimento | 200–400 ms ease-out; recompensa ≤ 1,5 s |
| Tipografia | Andika ≥ 32 px em palavra isolada e 24 px em frase; letra-alvo 96–160 px; pais 16–18 px |
| Alvo de toque | ≥ 64 dp (rel. 28; ver o conflito com o rel. 31) |
| Custo do MVP | **R$ 330–750 mil** na tabela (o resumo diz R$ 350–700 mil); **6–9 meses**; núcleo de 6–8 pessoas. **Estimativa própria, sem fonte** |
| Cronograma | M1–M2: bíblia + piloto de 3 fonemas (/m/, /a/, /p/) com 10–15 crianças; M3–M5: lote; M6: QA |
| Rive Cadet | US$ 9–17 por assento/mês (máx. 3) [V; fontes divergem] |

### (d) Riscos, limites e pendências

- Confirmar a tabela oficial dos 22 Viseme IDs × fonemas pt-BR e testar a voz num protótipo Rive. O agrupamento em 12 bocas é [NV].
- Fazer um **A/B do vídeo da boca** (vídeo + corte + letra × só letra + som) antes da produção em lote.
- Pedir parecer jurídico sobre cessão musical × ECAD, contrato de voz sintética e imagem de crianças.
- Fazer busca no INPI para "Boca da Sofia" e "Espelho do Som" (classes 9, 41 e 28).
- Pedir orçamentos reais a 3 fornecedores por linha. O relatório tem **inconsistência interna** no total do MVP (R$ 350–700 mil × R$ 330–750 mil).
- Ler as páginas bloqueadas na sessão: Rive, Spine, Kenney, Freesound, OpenGameArt, OMS e W3C.
- O editor do Rive é proprietário e na nuvem, o que cria dependência do fornecedor.

---

## Rel. 29 — Fonoaudiologia: aquisição fonológica, articulação e limites

**Base:** 50 referências [V] (PubMed e Crossref; os números citados vêm dos resumos) e 8 [NV] (livros clássicos, leis, páginas da ASHA e do CFFa).

### (a) Achados mais fortes

1. **Há normas brasileiras recentes por fonema e posição silábica.** O grupo da UFSM avaliou 733–866 crianças de 3;0 a 8;11 com o INFONO, todas do RS (Ceron et al. 2017–2022 [V]).
   - Plosivas, nasais e /f v s z/ estão **dominadas antes de 3;0**.
   - /ʃ ʒ l/ chegam entre 3;0 e 4;0; /x/ aos 3;6.
   - O tepe /ɾ/ chega entre 4;0 e 4;6, e a coda /ɾ/ entre 4;6 e 5;0.
   - Os **encontros (CCV)** vêm por último: com /ɾ/ entre 5;0 e 6;0; com /l/ entre 5;6 e 7;0.
   - O **/ʎ/ é divergente:** 4;0 na curva [1], mas adquirido aos 7;0 e dominado aos 8;6 em outro recorte da mesma amostra [2].
   - Converge com a revisão de 27 línguas (McLeod & Crowe 2018 [V]: ≥ 93% de consoantes corretas aos 5;0).
2. **"Pato" por "prato" aos 4–5 anos é esperado.** O desempenho se estabiliza a partir de 5;0 (Ceron 2017 [V]). Padrões persistentes passam a ser sinal de atenção a partir de ~6–7 anos.
3. **O desvio fonológico é comum.** Afetou 15,3% das crianças de 3–8 anos em Santa Maria, com mais ocorrência em meninos, entre 4 e 6 anos e na escola pública (Ceron 2017 [V]). Numa turma de 25 alunos, devem-se esperar 2 a 4 crianças com alteração de fala.
4. **Fala e escrita se ligam.** O desvio se associa a pior consciência fonológica e a mais **trocas surdo/sonoro na escrita**, e a terapia melhora as duas (Brondani 2002; Mota 2007; Rizzon 2009 [V]).
5. **O biofeedback funciona, mas com fonoaudiólogo e em outro público.**
   - Ultrassom: revisão positiva, porém fraca (Sugden 2019 [V]).
   - Biofeedback visual-acústico e ultrassom aceleraram a aquisição do /ɹ/ num ECR grande de 2026 (McAllister; Preston [V]).
   - **Tudo foi testado com fonoaudiólogo, em crianças de 9–15 anos e quase só no /ɹ/ do inglês.** Não há evidência de que um app corrija a articulação de crianças de 4–6 anos.
   - A **câmera não vê** a língua posterior, o dorso nem o vozeamento.
   - Uma análise de 132 apps de fala infantil encontrou evidência mínima (Furlong 2018 [V]).
6. **Variação dialetal não é erro, e o diagnóstico é ato privativo.**
   - "Nenhum dialeto é transtorno" (ASHA [NV]).
   - Em Natal, simplificações de coda refletiam a variedade regional (Silva 2023 [V]).
   - Avaliadores humanos têm viés de idade e gênero ao julgar o /s/ (Munson 2024 [V]).
   - Diagnóstico e terapia são atos privativos do fonoaudiólogo (Lei 6.965/1981 [NV]); a telefonoaudiologia é regulada pela Res. CFFa 580/2020 [NV, texto não lido].

### (b) Regras de design e produto

**Matriz de tolerância**
- Entrada: (fonema-alvo, posição silábica, idade, região).
- Saída: {aceitar, aceitar com modelo, praticar, sinalizar}.
- **Sinalizar** só no painel do adulto, **nunca para a criança**, e só com persistência, em várias palavras, em várias sessões e com ASR de alta confiança.

**Leitura ≠ fala**
- Se a criança de 5 anos lê "prato" e diz "pato", **a leitura conta como correta**. O relatório chama isso de "o ponto mais importante".

**ASR**
- Na dúvida, aceitar ou pedir nova tentativa.
- Comparar sempre contra o **conjunto de variantes aceitas**, nunca contra o modelo "neutro" como gabarito único.
- A configuração regional muda só o áudio-modelo e o vídeo; **todas as variantes são aceitas por padrão.**

**Variantes que nunca são erro**
- Róticos [x h ʁ r ɹ ɾ] e apagamento no infinitivo.
- /S/ de coda como [s z ʃ ʒ h].
- /t d/ com ou sem palatalização.
- /l/ de coda como [w].
- Alçamento de vogais átonas ("minino").
- Monotongação ("pexe").
- /ʎ/ como [lj] ou [j].
- Rotacismo ("pranta").
- Desnasalização final ("homi").
- A ortografia continua ensinada ("a gente fala assim, escreve assado").

**Pistas de articulação**
- Usar pistas visuais, táteis e auditivas lúdicas: **"mão na garganta"** para o vozeamento (ponto central para a escrita), "ventinho" do /p/, língua escondida no /s/, biquinho no /ʃ/, "tdtdtd" para o tepe.
- **Discriminação auditiva antes da produção** (treino auditivo melhorou a fala em crianças com TSF; Valim 2025 [V]).
- A **câmera serve só de espelho e modelo**, nunca para diagnosticar.
- O biofeedback acústico, se existir (fase 2), é um **modo para fonoaudiólogo**, usado sob supervisão.

**Gatilhos para sugerir fonoaudiólogo** (sempre ao adulto, em linguagem acolhedora)
1. Processo fora da faixa por ≥ 3 semanas, em várias palavras, com ASR confiável e sem explicação dialetal.
2. Ensurdecimento **na fala** depois de 4;6–5;0; sugerir também avaliação auditiva.
3. Distorção lateral do /s/ ou fala "pelo nariz", em qualquer idade.
4. **Inconsistência alta** na mesma palavra (possível componente motor/apraxia), **sem nomear o transtorno**.
5. Inteligibilidade baixa relatada pelos pais. A ICS-BP pode ser oferecida como autorrelato informativo (sensibilidade 0,98, especificidade 0,87 [V]); a licença precisa ser verificada [NV].
6. Trocas surdo/sonoro na escrita que persistem depois do 2º ano.

**Linguagem**
- Não usar "transtorno", "desvio", "erro" nem "problema" nas mensagens automáticas.
- Sempre dizer "o FONEMA não faz avaliação nem diagnóstico".
- Fazer **alegação educacional** ("pratica os sons das letras"), nunca terapêutica.
- Não emitir laudo, nota de articulação nem relatório clínico.

**Modo fonoaudiólogo (opcional)**
- O profissional é identificado com nome e registro e tem a responsabilidade técnica (Res. 580/2020).

**Conselho Consultivo de Fonoaudiologia**
- Composição: fonoaudiólogo clínico, pesquisador de aquisição fonológica, sociolinguista, alfabetizador da escola pública e, opcionalmente, um representante das famílias.
- Revisão anual da matriz, registro das decisões e declaração de conflitos de interesse.

### (c) Números operacionais (faixa "aceitar sem alerta até…")

| Estrutura | Até |
|---|---|
| Vogais, plosivas, nasais, /f v s z/ | exigíveis a partir de 4;0 (ceceio tolerado até ~4;6–5) |
| /l/ em ataque | 4;0 |
| /ʃ ʒ/, R forte /x/ | 4;6 (**qualquer realização regional é correta**) |
| Tepe /ɾ/ | 5;0 |
| Coda /S/ | 5;0 ([s] ou [ʃ] sempre aceitos) |
| Coda /ɾ/ | 5;6 no meio da palavra (apagamento no infinitivo sempre aceito) |
| CCV com /ɾ/ | 6;0 |
| CCV com /l/ | 6;6–7;0; fricativa + /l/ até 7;0 |
| /ʎ/ | aceitar [lj], [l] ou [j] até 7–8 anos |
| Coda /L/ | [w] sempre aceito |
| Plosivação de fricativa; posteriorização/anteriorização de plosivas | depois de 4 anos → atenção |
| Anteriorização de fricativa; apagamento de sílaba átona | depois de 5 anos → atenção |
| Substituição de líquida | persistente depois de 5;6 → atenção |
| Gatilho de persistência | ≥ 3 semanas, várias palavras e várias sessões |
| Prevalência esperada | 15,3% (3–8 anos, RS); 2–4 crianças por turma de 25 |

Critérios usados: "adquirido" = ≥ 75% das crianças; "dominado" = ≥ 90%. As faixas são **média de referência, não corte individual**, e precisam ser validadas pelo conselho.

### (d) Riscos, limites e pendências

- As normas vêm do **Sul e do Sudeste** (RS e RJ). Para o Nordeste há só Natal (n pequeno), e não há dados do Norte nem do Centro-Oeste. Nível socioeconômico e escola pública atrasam a aquisição.
- **Os valores clássicos não foram relidos:** Lamprecht 2004, Yavas 1991 e ABFW estão [NV]. Conferir no original.
- O texto integral da Res. CFFa 580/2020 não foi lido; verificar também resoluções posteriores sobre software.
- A divergência do /ʎ/ (4;0 × 7;0) precisa de decisão do conselho.
- A licença da ICS-BP precisa ser verificada.
- **Risco de equidade:** testar o ASR por região e por tipo de escola antes do lançamento.
- **Risco legal e reputacional:** qualquer rótulo clínico ou promessa de correção.
- Dados de voz e vídeo são sensíveis; a câmera deve ser processada no aparelho.

---

## Rel. 30 — Ciências da aprendizagem e evidência sobre jogos

**Base:** 66 referências, 63 [V] (Crossref, ERIC e PubMed; os números de efeito vêm dos resumos) e 3 [NV] (livros). Alguns detalhes estão marcados "conferir no texto completo".

### (a) Achados mais fortes

1. **Jogos ensinam pouco e de forma condicional, e não motivam mais por si só.**
   - Serious games: d = 0,29 na aprendizagem e 0,36 na retenção, **mas d = 0,26 n.s. na motivação** (Wouters et al. 2013, meta-análise [V]).
   - Jogos digitais: g = 0,33; designs "aumentados" (scaffolding, feedback explicativo) rendem +0,34 (Clark et al. 2016 [V]).
   - Gamificação: g = 0,49 no cognitivo, o único efeito que se mantém nos estudos rigorosos (Sailer & Homner 2020 [V]).
   - Funciona melhor **com outra instrução, em várias sessões e com interação**.
2. **Tecnologia de leitura tem efeito pequeno, e quanto mais rigoroso o estudo, menor o efeito.**
   - Em 84 estudos, ES = +0,16; o software suplementar de exercícios ficou em +0,11 (Cheung & Slavin 2012 [V]).
   - Com leitores com dificuldade, ES = 0,14; **integrada a pequeno grupo com professor, 0,32** (2013 [V]).
   - O estudo federal dos EUA com 16 produtos não encontrou diferença [V].
   - O Fast ForWord não teve efeito [V].
   - Apps da pré-escola ao 3º ano: +0,31, mas com efeito maior com medidas do próprio pesquisador e em habilidades restritas (Kim et al. 2021 [V]): **"measures matter"**.
3. **O GraphoGame é um alerta de projeto.**
   - Meta-análise com 19 estudos: g = −0,02 em leitura de palavras; **com muita interação adulta, g = 0,48** (McTigue et al. [V]).
   - Ganhos dentro do jogo **não transferem** para testes orais ou em papel (GraphoLearn, Índia [V]).
   - Ganhos em decodificação sem transferência para fluência e compreensão (Finlândia [V]).
   - Funcionou como **complemento da aula** com crianças de risco (Kyle 2013; Saine 2011 [V]).
4. **Integração intrínseca.** Quando a mecânica **é** a habilidade, as crianças aprenderam mais no mesmo tempo e jogaram **7 vezes mais** por escolha própria (Habgood & Ainsworth 2011 [V]). Recompensas tangíveis esperadas minam a motivação intrínseca, e o feedback informativo a aumenta (Deci, Koestner & Ryan 1999 [V]).
5. **Ensino explícito e retirada gradual do apoio.**
   - Rosenshine: 10 princípios, com ~80% de sucesso na prática guiada [V].
   - Direct Instruction: 328 estudos, todos positivos (Stockard 2018 [V]).
   - Descoberta sem guia é pior para iniciantes, e a descoberta guiada é a melhor (Kirschner; Mayer; Alfieri [V]).
   - Exemplos resolvidos ajudam iniciantes.
   - O apoio que ajuda o iniciante atrapalha quem já domina (reversão por especialização, Kalyuga 2007 [V]).
6. **Dificuldade ótima e tutor por passos.**
   - ~85% de acerto otimiza o aprendizado (Wilson et al. 2019 [V]). O modelo é **teórico e de tarefas binárias**, não testado com crianças em alfabetização: serve de âncora.
   - Tutoria humana d ≈ 0,79; tutores **por passos** d ≈ 0,76; tutores que só corrigem a resposta final d ≈ 0,31 (VanLehn 2011 [V]).
   - Mastery learning tem efeito maior nos alunos mais fracos, mas gasta mais tempo e menos alunos concluem (Kulik et al. 1990 [V]). É preciso um "plano B".

### (b) Regras de design e produto

**Lição de 5–10 min com um objetivo** ("eu faço → nós fazemos → você faz")

| Fase | Duração | O que acontece |
|---|---|---|
| 0. Aquecimento | 30–60 s | 3–5 itens dominados |
| 1. Eu faço | 1–2 min | Sofia modela, com 1–2 exemplos resolvidos e 1 contraexemplo (N × M) |
| 2. Nós fazemos | 2–3 min | dicas contingentes: 1º erro → dica leve; 2º → dica forte e modelo; 3º → a Sofia faz junto e o item volta depois |
| 3. Você faz | 2–4 min | mini-jogo com integração intrínseca; sem dica automática (só se a criança pedir) |
| 4. Verificação | 30–60 s | 2–4 itens **fora do formato do jogo** |
| 5. Fechamento | 15 s | feedback informativo e convite para mostrar a um adulto |

**Motor adaptativo**
- Alvo de **85%** de acerto numa janela móvel dos últimos 10–20 itens.
  - Acima de 90% em duas janelas: subir a dificuldade.
  - Entre 75% e 90%: manter.
  - Abaixo de 75%: descer e voltar a "nós fazemos".
  - Abaixo de 60% em duas sessões: **plano B** (outra explicação e aviso ao adulto).
- **Domínio para avançar:** ≥ 90–95% em itens **novos**, em formato **diferente** do jogo, em **dois dias diferentes**.
- Separar as duas métricas (prática × provinha). A provinha não é usada para ajustar a dificuldade da prática.
- **Feedback por passo**, no fonema ou na sílaba onde a criança errou.
- Registrar tempo, número de dicas e padrão de erro, para separar "chutou" de "não sabe".

**Integração intrínseca**
- A ação do jogo **é** a operação de leitura. Exemplos: trem das sílabas, pescaria de sons, ponte de letras.
- A fantasia vem do conteúdo.
- A recompensa informa ("Domínio do M"). **Nada de caixas-surpresa nem de moedas sem ligação com o conteúdo.**
- Efeitos só **depois** da resposta.

**Mediação adulta é obrigatória**
- "Leia para alguém" ao fim das fases e sugestão de 2 min de interação no painel. A interação adulta é o moderador que vira o resultado do GraphoGame.

**Checklist de aceite de cada jogo novo** (§3.4 do relatório)
- Objetivo único ligado ao currículo.
- "Dá para ganhar chutando?" → precisa ser **não**.
- Exemplos e contraexemplos escolhidos.
- Janela de ~85%.
- Dicas graduadas.
- Feedback por passo.
- Verificação fora do jogo.
- Revisão espaçada.
- Os quatro pilares: ativo, sem distração, significativo, social.
- Erro sem perda de progresso.
- Recompensa ligada ao domínio.
- Registro por item.
- **Piloto com medida externa pré/pós.**
- Dose definida.
- **Engajamento e aprendizagem reportados separadamente.**

### (c) Números operacionais

| Item | Valor |
|---|---|
| Lição | 5–10 min, 1 objetivo |
| Janela adaptativa | 10–20 itens; alvo 85%; faixa 75–90% |
| Gatilho do plano B | < 60% em 2 sessões no mesmo objetivo |
| Domínio (provinha) | ≥ 90–95%, itens novos, formato diferente, 2 dias |
| Dicas | 3 níveis (leve → forte → fazer junto) |
| Efeitos de referência | jogos d ≈ 0,29–0,33; tecnologia de leitura ES ≈ 0,11–0,16; integrada a pequeno grupo 0,32; tutor por passos 0,76 |

### (d) Riscos, limites e pendências

- **Riscos:**
  1. inflar o efeito com métricas internas;
  2. app solto, sem adulto;
  3. "treino cerebral" sem conteúdo;
  4. gamificação superficial;
  5. parar no nível da palavra, sem frases, textos e escrita.
- O engajamento com o GraphoGame **caiu ao longo das semanas**, e as recompensas extras não tiveram o efeito esperado (Ronimus 2014, "conferir no texto completo").
- O engajamento emocional aumentou o tempo de jogo sem aumentar os ganhos.
- **Pendências:**
  - conferir os tamanhos de efeito de Verhoeven 2020 e os detalhes de Ronimus 2014;
  - procurar estudos do **GraphoGame Brasil**;
  - validar a regra dos 85% com A/B entre alvos de 75%, 85% e 95%.

---

## Rel. 31 — Catálogo de funcionalidades, gráficos e design

**Base:** síntese dos documentos internos 01–25, com evidência rastreada no formato [doc NN §x]. Fontes externas desta rodada: busca web sobre painéis de mercado (benchmark de layout, sem avaliação de eficácia) e API do GitHub (estrelas e licenças em 13/11/2026). Os contrastes de cor foram **calculados**. O próprio relatório diz que "nada aqui é especificação final" e que arte, paleta e personagens precisam de teste com crianças. **Ele é anterior às Decisões 001–004** (ver "Consensos e conflitos").

### (a) Achados mais fortes (decisões estruturantes)

1. **Cinco públicos, cinco perguntas:**
   - criança: "estou indo bem?", sem números;
   - responsável: o que aprendeu e o que fazer em casa;
   - professor: quem precisa da mesma aula amanhã;
   - gestor: quantos estão no caminho da "criança alfabetizada";
   - editorial: se o conteúdo e o ASR estão funcionando.
2. **Para a criança, não há gráfico.** O progresso aparece como **mundo que muda**: trilha colorida, Jardim da Revisão que nunca morre, álbum de figurinhas que falam e caderninho do Bolota.
3. **O gráfico mais importante é o mapa de calor aluno × habilidade do professor**, com 3–5 grupos sugeridos e uma atividade de sala por grupo. Como o efeito dos jogos depende do adulto, o painel faz parte da intervenção.
4. **Princípios de visualização:**
   - cada gráfico leva a uma ação;
   - a criança é comparada só consigo mesma;
   - **precisão antes de velocidade** (< 90% = problema de decodificação);
   - incerteza do ASR visível, e itens incertos fora do cálculo;
   - **persistência + dose** antes de qualquer alerta;
   - linguagem de "caminho", não de nota;
   - cor + forma + textura + rótulo, com tabela equivalente;
   - agregados com n < 10 suprimidos (limiar a confirmar com o jurídico).
5. **O padrão de mercado** (95 Percent, Amplify Boost, GraphoGame, Renaissance) é a grade habilidade × aluno com agrupamento automático. O FONEMA deve acrescentar a **ação sugerida por grupo** e o **contexto de dose**.
6. **"Ética como marca"** e a lista vermelha permanente (§4.5): ver (b).

### (b) Regras de design e produto

**Perfis e permissões**
- RLS no Postgres/Supabase.
- A secretaria **nunca vê dados nominais** (só agregados com n mínimo).
- Admin e pesquisa veem só dados pseudonimizados.

**Navegação infantil**
- Paisagem, sem texto de navegação, **no máximo 2 toques** do mapa à atividade, sem rolagem.
- Nós futuros **visíveis e sem cadeado**.
- 2–3 opções por dia.

**Fluxos-chave**
- **Sessão (F-C):** acolhida ≤ 6 s → aquecimento → 60–70% de revisões com 1–2 itens novos → pausa ativa → bloco de contraste → fechamento → ritual → fim natural, sem autoplay.
- **Erro (F-D):** "Quase!" + pista → modelo + boquinha → mudança de estratégia → registro só para o adulto. ASR incerto vira "Não ouvi direitinho", nunca "errou".
- **Inatividade:** 5 s → a Sofia aponta; 10 s → repete; 20 s → "vamos juntos?".
- **Provinha (F-E):** "ponte" no mapa, sem cronômetro visível, feedback neutro-positivo ("Anotado!"). Se a criança não passa, abre uma trilha de reforço.
- **Relatório (F-F):** 1 tela para o adulto, 1 atividade sem tela com áudio e botão "fizemos!".

**Anti-padrões de visualização**
- ranking ou pódio;
- gauge de "nível de leitura";
- nota Saeb individual;
- minutos de tela como sucesso;
- percentis sem norma brasileira;
- streak com dias em vermelho;
- push de desempenho para a criança.

**Lista vermelha permanente ("Won't")**
- anúncios e SDKs de terceiros;
- loot boxes e sorteios;
- **moedas compráveis e loja para a criança** (ver o conflito com a Decisão 002);
- vidas, game over e cronômetros de pressão;
- streak que zera e push para a criança;
- Sofia triste;
- autoplay e "só mais uma";
- ranking;
- chat livre com LLM;
- TTS ao vivo para fonemas isolados;
- inferência de emoção por câmera;
- reconhecimento facial e voiceprint;
- usar o sinal de risco para vender plano.

**Design system "Quintal"**
- **Princípios:**
  - um foco por tela;
  - a Sofia é o menu falado;
  - animação só quando ensina;
  - erro sem vermelho, X, buzina ou tremor;
  - "previsível nas regras, surpreendente no conteúdo";
  - modos calmo e alto contraste como cidadãos de primeira classe;
  - leve;
  - brasileiro e plural;
  - **"se não existe no design system, não entra no produto"**.
- **Fontes:**
  - Andika para o conteúdo de leitura;
  - Lexend e OpenDyslexic como opção, sem promessa terapêutica;
  - Atkinson Hyperlegible na área adulta;
  - letra bastão primeiro; cursiva como mundo próprio na V2.
- **Cores:**
  - paleta com tokens; os pares de texto têm ≥ 4,5:1 calculado;
  - escala de 1 matiz no mapa de calor;
  - faixas de risco ● ◆ ▲, **sem o par vermelho/verde**;
  - codificação da vogal opcional e redundante (sublinhado ondulado), removida aos poucos.
- **Feedback:**
  - acerto: brilho ≤ 1,5 s e fala específica;
  - erro: balanço leve da peça, som neutro e nenhum háptico;
  - no TDAH, feedback em < 300 ms;
  - no calmo e no TEA, celebração discreta.
- **Som:**
  - prioridade: voz da Sofia > fonema > efeito > música;
  - instruções 10–15% mais lentas que a fala adulta; velocidade de 0,75× a 1,25×;
  - silêncio musical na discriminação e com o microfone aberto;
  - **fonemas gravados por humano**;
  - banco de 15–30 variações de fala.
- **Modos (sem rótulo diagnóstico):** padrão, calmo, alto contraste, reforço de leitura, foco curto, previsível, noturno. Quando TEA e TDAH estão juntos, a previsibilidade vence a novidade.
- **Personagens:**
  - Sofia: ~9–10 anos, parda, cabelo cacheado 3C/4A, sem coroa nem vestido de princesa;
  - Bolota: filhote de tatu-bola;
  - teste com crianças de 4–7 anos em 3 regiões e busca no INPI.
- **Critério de "pronto" de cada jogo:**
  - checklist de tela;
  - alternativa por toque e sem fala;
  - declara a evidência gerada;
  - teste com crianças com ≥ 80% de sucesso sem ajuda e < 15% de toques fora do alvo.

**Bibliotecas de gráficos**
- Web: ECharts (mapa de calor) + Recharts.
- App: react-native-echarts (professor) + Skia (responsável). Victory Native XL só depois de conferir a licença.
- Criança: Rive e Lottie.
- PDF: renderização no servidor.

### (c) Números operacionais

| Item | Valor |
|---|---|
| Toque (criança) | botão principal 96 dp (rec. 112–128); alternativa 88 dp (rec. 120+); navegação 72–80 dp; espaço 16–24 dp; ímã 48 dp; corredor de traçado 40 dp; faixa morta 48–64 dp |
| Tipografia (criança) | letra 72 (mín. 48); sílaba 64; palavra 48; frase 40; livro 32–36 (≤ 7 palavras/linha); modo reforço +15% e entrelinha 1,8 |
| Movimento | toque ≤ 100 ms; áudio ≤ 300 ms; celebração ≤ 1,5 s (micro) e ≤ 2–3 s (bloco); 1 animação por vez; 0 flashes > 3/s |
| Alternativas de resposta | 2–3 aos 4–5 anos; 3–4 aos 6–8 |
| Diagnóstico | 3 sessões de 4–6 min (o resumo cita 12–15 min); benchmark trimestral de ~8 min |
| Provinha | letra: 10 itens, ≥ 8/10 com pseudopalavra; fase: 20 + 4 + texto |
| Mapa de calor | ~70 habilidades em 7 domínios; 5 estados + ⚑ "sanguessuga" (3 lapsos em 14 dias) e ⧗ lento |
| Grupos | 3–5 grupos de 2–8 alunos; faixa da coorte só com n ≥ 30 |
| Jardim | 3–5 plantas "com sede" visíveis no máximo |
| Fila de escuta | ≤ 10 leituras por semana |
| Dose de referência | 10–15 min/dia, 5×/semana |
| Linter | decodificável ≥ 95% (F1–F2) e ≥ 90% (F3–F4), como proposta de produto; repetição mínima da CGF-foco = 4 |
| Offline | pacote ≤ 5 MB; instalação ≤ 40 MB; Android 8.1 com 2 GB; até 40 perfis por tablet |
| ASR | liberar item com ≥ 90% de acordo com juízes; corpus consentido de 20–50 h |
| Normas | recalibrar com a coorte-piloto (≥ 500 por série) |
| Agregados | suprimir n < 10 |

### (d) Funcionalidades por versão

**MVP ("Must", piloto em casa + escolas parceiras):**

| ID | Funcionalidade | Comp. |
|---|---|---|
| F01 | Contas, papéis e vínculos (RLS; até 40 perfis por tablet) | M |
| F02 | Consentimento parental granular + porteira adulta (segurar 3 s + tarefa escrita) ⚖️ | M |
| F03 | Login por figuras + QR da turma e QR individual | M |
| F04 | Currículo fônico em dados ("language pack" com etapas 0–10, CGF, pseudopalavras, tags BNCC) | M |
| F05 | Missão de boas-vindas (diagnóstico em 3 sessões) | G |
| F06 | Mundo/trilha | M |
| F07 | Sessão estruturada e ritual de fim | M |
| F08 | Motor v0 (Leitner + estabilidade, Elo por habilidade, gate de domínio com 4 critérios) | G |
| F09 | Sofia roteirizada (Rive, TTS neural + visemas, 15–30 variações) | G |
| F10 | Inventário de fonemas gravado por humano | M |
| F11 | Vídeos da boquinha (frontal + lateral + letra) | M |
| F12 | 14 jogos-núcleo | G |
| F13 | Escada de ajuda e feedback (5/10/20 s; prompt → recast → leitura conjunta) | M |
| F14 | Recompensas intrínsecas (trilha, álbum, "palavras que eu sei") | M |
| F15 | Desafio da Sofia (provinhas) | M |
| F16 | ~30 livrinhos decodificáveis | G |
| F17 | Linter de decodificabilidade (interno) | M |
| F18 | Perfil sensorial + modo calmo | M |
| F19 | Acessibilidade base (WCAG 2.2 AA) | M |
| F20 | Offline-first e aparelhos fracos | G |
| F21 | Relatório semanal da família | P |
| F22 | Painel do professor v1 (começar com P1, P2, P3, P7 e P12) | G |
| F23 | Analytics first-party, sem SDK de terceiros ⚖️ | M |
| F24 | ASR camada 1 (VAD) + modo "só incentiva" | P |
| F25 | **Beta "Eu leio, a Sofia escuta"** em escolas-piloto (item não pontuado com baixa confiança) ⚖️ | G |

**V1 ("Should", 3–6 meses depois do MVP):**
- F30 "Eu leio, a Sofia escuta" geral (autocorreção conta como meio acerto);
- F31 Karaokê em 4 passos;
- F32 PCPM e precisão;
- F33 Bolota aprendiz;
- F34 Jardim da Revisão;
- F35 Traçado de letras;
- F36 Ditado e escrita inventada;
- F37 Presets de apoio (TEA, foco curto, reforço);
- F38 Benchmark trimestral;
- F39 Faixas de risco e sinais de atenção ⚖️;
- F40 Painel escola/rede (formato ICA);
- F41 Modo "Ler junto" (família);
- F42 Fila de escuta do professor ⚖️;
- F43 Espelho local;
- F44 Pausas ativas;
- F45 Canções e parlendas;
- F46 Trilha "Recomeço" (8+);
- F47 Importação de turmas e PDF;
- F48 Biblioteca de 100+ livros.

**V2 ("Could", 6–12 meses):**
- F50 Dica articulatória por câmera (só local; A/B antes de escalar);
- F51 Pipeline de histórias com LLM (nunca ao vivo para a criança);
- F52 Estúdio de Histórias;
- F53 Mundo da cursiva;
- F54 Rubrica de prosódia (experimental);
- F55 Assistente do professor com LLM (lado adulto);
- F56 Libras e CAA;
- F57 Pacotes regionais;
- F58 Integração com redes (SSO);
- F59 Publicação aberta da acurácia do ASR.

**Futuro (pesquisa ou dependente de dados):**
- F70 agendador FSRS/HLR treinado com dados próprios;
- F71 DKT/transformers;
- F72 ancoragem psicométrica ao Saeb (TRI);
- F73 LLM classificando respostas orais;
- F74 diagnóstico automático de erro fonêmico;
- F75 trilha EJA;
- F76 estudo de efeito randomizado.

**Ordem dos épicos:**
1. Fundação: F01, F02, F04, F20, F23.
2. Núcleo da criança.
3. Motor: F05, F08, F15.
4. Conteúdo: F12, F16, F17.
5. Adultos: F21, F22.
6. Fala: F24, F25 → F30–F32.
7. Expansão.

**Os 14 jogos do MVP (F12):**

| # | Jogo | Fase | Habilidade |
|---|---|---|---|
| 1 | Rima ou Não Rima? | 1 Consciência fonológica | rima |
| 2 | Bate a Sílaba | 1 | segmentação silábica (sincronia registrada como triagem rítmica, não como nota) |
| 3 | Caça ao Primeiro Som | 1 | fonema inicial |
| 6 | Robô Fala-Picado | 1 | síntese fonêmica oral |
| 9 | Alimente o Bolota | 2 Letra-som | som → letra |
| 10 | Memória Som-Letra | 2 | correspondência grafema-fonema |
| 11 | Balões de Letras (sem cronômetro) | 2 | reconhecimento rápido / automaticidade |
| 16 | Fábrica de Sílabas | 3 Sílabas | síntese CV |
| 18 | Ouça e Toque | 3 | discriminação sílaba → escrita (adaptativo) |
| 20 | Planeta das Palavras de Mentirinha | 3 | decodificação de pseudopalavras (revisadas por fono) |
| 21 | Monta-Palavra com Silhueta | 4 Palavras | decodificação/codificação (porta de entrada da escrita no MVP) |
| 23 | Troca-Letra Mágica | 4 | substituição fonêmica |
| 28 | Frase-Quebra-Cabeça | 5 Frases | leitura de frase |
| 32 | Livrinho Decodificável Interativo | 6 Textos | decodificação em contexto, sem hotspots |

- Os 14 jogos cobrem as fases 1 a 6.
- O #8 (Boquinha no Espelho) entra como parte da lição (F11).
- O #12 (Traço Mágico) e a fluência (Karaokê, #35) chegam na V1.
- Regras globais de todos os jogos:
  - sem tempo-limite;
  - arrastar ⇄ toque-toque;
  - fala ⇄ toque;
  - erro tratado como pista;
  - celebração depois da resposta;
  - adaptações para TEA, TDAH e dislexia.
- **O catálogo completo tem 42 jogos em 8 fases**, mais 5 mecânicas transversais:
  - T1 Mapa de regiões;
  - T2 Jardim;
  - T3 Álbum;
  - T4 Desafio/mini-chefão;
  - T5 Parceiro que evolui por marcos de leitura.

### (e) Riscos, limites e pendências

- **Legais ⚖️:** LGPD art. 14/11, ECA Digital + Decreto 12.880/2026 (verificação de idade), voz e imagem de criança, sinal de risco como dado de saúde e limiar de n mínimo. Pedir **parecer jurídico antes do piloto**.
- **Marca:** "Sofia" × "Princesinha Sofia" (Disney) e apps já existentes. Fazer busca no INPI ou usar marca composta.
- **ASR infantil:** falso "errado", sotaques e falta de corpus aberto.
- **Normas:** PCPM, latências e pontos de corte sem norma brasileira (hipóteses). A escala FONEMA pode ser lida como "nota Saeb": manter o rodapé fixo.
- **Câmera:** sem evidência de benefício; fora do MVP.
- **Sobrecarga do professor:** começar com 5 visualizações e testar com 5 professoras.
- **"Vício positivo" mal interpretado:** usar as métricas éticas (A5) como OKR.
- **Licenças a conferir:** Victory Native XL (sem SPDX na API), Rhubarb, Rive pago, Spine.
- **Os diferenciais "não encontrados em pt-BR"** (D1–D11) precisam ser revalidados antes de ir para material comercial ("não encontrado ≠ não existe").
- **Atualizações exigidas pelas decisões e que ainda não estão no rel. 31:**
  - Decisão 001: mundo aberto, missões procedurais, construção/estratégia, temporadas, porteira de assinatura;
  - Decisão 002: economia de moedinhas, lojinha, cofrinho, avatar, vila;
  - Decisão 003: 6 competências;
  - Decisão 004: termômetro 0–10.

---

## Consensos e conflitos

### Consensos (aparecem em dois ou mais relatórios e nas decisões)

1. **O adulto faz parte da intervenção.** Rel. 26 (envolvimento ativo dos pais, coaching, fidelidade), rel. 30 (GraphoGame: g −0,02 → 0,48 com mediação adulta; tecnologia integrada a pequeno grupo, 0,32) e rel. 31 (painel do professor como intervenção; "Leia para alguém"; "fizemos!").
2. **Painel acionável, não estatístico.** Rel. 26 ("três perguntas"; alertas acionáveis; interpretação) e rel. 31 (mapa de calor + grupos + atividade + dose; começar com 5 gráficos).
3. **Medir fora do jogo e com avaliador independente.** Rel. 27 (RCT pré-registrado; dados do jogo como secundários; Cheung & Slavin) e rel. 30 ("measures matter"; verificação fora do formato; GraphoLearn). Decisões 003 e 004: domínio só conta com transferência e retenção.
4. **Dose e fidelidade de implementação** como métrica de primeira classe: rel. 26, 27 (ITT/CACE), 30 e 31 (dose ao lado de todo alerta; G5; P12).
5. **Sem pressão, sem punição e recompensa informativa:** rel. 30 (Deci; nada de caixa-surpresa), rel. 31 (lista vermelha), rel. 28 (erro sem buzina; Sofia nunca triste) e Decisões 001/002 (ECA Digital; sem loot box; moedas por domínio, sem perda).
6. **Variação dialetal aceita e ASR assimétrico ("na dúvida, não pune"):** rel. 29 (matriz de variantes), rel. 31 ("Não ouvi direitinho"; itens incertos fora do cálculo) e rel. 28 (variantes regionais como pacotes opcionais).
7. **Boca humana real + corte lateral 2D + letra no instante do som, câmera só como espelho local:** rel. 28, 29 e 31 (W4, F11, F43; F50 só na V2 com A/B).
8. **Nada de diagnóstico, rótulo ou promessa terapêutica:** rel. 29 (ato privativo; mensagens-modelo), rel. 31 (sinais "não diagnósticos"; Lei 14.254/2021), rel. 27 (não prometer nota Saeb) e Decisão 002 ("sem prometer nada").
9. **Tela de tarefa limpa e animação só depois da resposta:** rel. 28 (Fisher 2014; ≤ 3 elementos), rel. 30 (efeitos depois da resposta), rel. 31 (um foco por tela) e rel. 26 (modo juntos sem hotspots).
10. **Offline-first e aparelho fraco/compartilhado:** rel. 26 (internet para alunos em < 50% das escolas de EF), rel. 27 (risco de infraestrutura) e rel. 31 (F20; até 40 perfis).
11. **Ensino explícito com dificuldade ~85% e domínio para avançar:** rel. 30 e Decisão 001 ("modo infinito… ~85% de acerto"; liberação por domínio).
12. **Música e voz:** fonema isolado gravado por humano e TTS neural para o resto; música muda com microfone aberto (rel. 28 e 31).

### Conflitos e tensões (precisam de decisão)

| # | Tema | O que diz cada fonte | Encaminhamento sugerido |
|---|---|---|---|
| C1 | **Preço anual** | Rel. 27: B2C R$ 179–229/ano; B2B e B2G "por aluno/ano". Decisão 001: **só mensal** | A Decisão 001 prevalece. Recalcular as faixas e o TAM em base mensal; checar com o jurídico como a contratação pública "por aluno/mês" se encaixa em pregão/ARP e CPSI |
| C2 | **Desenho do freemium** | Rel. 27: "trilha central limitada por dia". Decisão 001: freemium **por conquista** (fim do 1º mundo; ~4–8 semanas) | A Decisão 001 prevalece; validar o recorte em piloto |
| C3 | **Escala de níveis** | Rel. 31: níveis FONEMA **1–6** (níveis 5–6 = "no caminho do 743") e escala 0–1000 provisória; F04 usa "etapas 0–10" do currículo. Decisão 004: **Escala FONEMA 0–10** por critério | Adotar 0–10 (Decisão 004) e refazer W10, W13, G1, G2 e "no caminho do 743" em cima dela; deixar explícito se as etapas curriculares 0–10 do doc 02 são ou não os mesmos níveis |
| C4 | **Moedas e loja** | Rel. 31: "recompensa sem moedas"; F14 com risco "escorregar para economia de moedas"; lista vermelha "moedas compráveis e loja para a criança". Rel. 30: "nada de moedas sem ligação com o conteúdo". Decisão 002: **economia de moedinhas fictícias** ganhas só aprendendo, **lojinha** para a criança, cofrinho; nunca dinheiro real | Reescrever a lista vermelha: proibir **compra com dinheiro real, sorte e loja de dinheiro real**, e permitir a lojinha fictícia da Decisão 002 com as 5 salvaguardas de superjustificação. Testar o efeito sobre a motivação intrínseca (alerta de Deci 1999) |
| C5 | **Cadeado × porteira de assinatura** | Rel. 31: nós futuros "visíveis e sem cadeado". Decisão 001: o plano pago libera a nova fase ao fim da parte gratuita | Definir como a criança vê a região paga sem pressão (a oferta só aparece para o adulto, atrás da porteira), mantendo a curiosidade sem cadeado punitivo |
| C6 | **Login do responsável** | Rel. 26: celular/código, **sem e-mail** (baixo letramento). Rel. 31: e-mail/magic link | Oferecer os dois, com o celular como padrão para o público B2G e da escola pública |
| C7 | **Formato do relatório para pais** | Rel. 26: ícone + frase falada, **sem gráfico** como formato principal. Rel. 31 (W8): chips + barra + linha de PCPM | Fazer da versão em áudio e ícone a principal e deixar os gráficos como "ver mais" |
| C8 | **Paleta** | Rel. 28: Tinta `#2B2A4C`; vogal Urucum `#C2410C`; consoante Anil `#1D4ED8`. Rel. 31: tinta `#1F2A44`; vogal `#B8322A`; consoante = tinta; `#C2410C` usado como **alerta** (caju) | Unificar num só arquivo de tokens; evitar que a cor da vogal coincida com a cor de alerta; testar com crianças |
| C9 | **Alvo de toque e tamanho de letra** | Rel. 28: toque ≥ 64 dp; letra-alvo 96–160 px; palavra ≥ 32 px. Rel. 31: botão 96–128 dp; letra 72 (mín. 48); palavra 48 | Adotar os valores do rel. 31 (mais detalhados e ligados ao doc 24) e conferir no doc 24 |
| C10 | **Critério de domínio** | Rel. 30: ≥ 90–95% em itens novos, formato diferente, 2 dias. Rel. 31: provinha de letra com ≥ 8/10 (80%). Decisão 004: provinha + transferência + retenção | Harmonizar: 80% na provinha isolada **ou** 90–95% com retenção? Decidir com a equipe pedagógica |
| C11 | **Dica automática** | Rel. 30: na fase "você faz", sem dica automática (só se pedir). Rel. 31: dicas por inatividade em 5/10/20 s em toda atividade | Aplicar os tempos de inatividade das fases guiadas e suspendê-los na prática independente, ou tornar configurável |
| C12 | **Dose de referência** | Rel. 27: 15 min/dia, 4×/semana (exemplo). Rel. 31: 10–15 min/dia, 5×/semana. Rel. 30: lição de 5–10 min | Fixar uma dose-alvo única na teoria de mudança (F0 do rel. 27) |
| C13 | **Duração do diagnóstico** | Rel. 31: "12–15 min" no resumo × 3 sessões de 4–6 min (F05) | Compatível (3 × 4–6 min ≈ 12–18 min); deixar a redação uniforme |
| C14 | **Custo de arte/áudio** | Rel. 28: R$ 350–700 mil (resumo) × R$ 330–750 mil (tabela) | Usar a faixa da tabela até chegarem os orçamentos reais |
| C15 | **Lacunas do rel. 31 em relação ao rel. 26** | O rel. 26 pede WhatsApp, 2 crianças por tablet com turnos, modo projetor/TV, kit impresso da estação, microformação do professor, guia do professor estruturado, painel de fidelidade e teto de 3 notificações por semana. O rel. 31 não os tem como funcionalidade (o mais próximo é F41 "Ler junto" e G5 "uso e dose") | Incluir no backlog. O guia estruturado é o "ingrediente mais custo-efetivo" da evidência internacional |
| C16 | **Ensurdecimento** | Rel. 29: na **fala**, raro depois dos 4 anos → atenção. Rel. 31 (P7): trocas surda/sonora são "comuns no início" (na **leitura/escrita**) | Compatível se a modalidade ficar explícita: na fala → gatilho de fono e audição; na escrita → erro comum de alfabetização até o 2º ano |
| C17 | **Canções** | Rel. 28: 26 canções encomendadas com cessão total (10 no MVP). Rel. 31: canções na V1 (F45), "preferir domínio público ou produção própria" | Compatível: domínio público só na **melodia**; arranjo e gravação próprios |
| C18 | **ICA do Ceará** | Rel. 26: 85,3% (2024). Rel. 27: CE ≈ 80% (2025, TPE) | São anos e fontes diferentes; conferir as duas antes de usar |

---

## Pendências de verificação

**Dados oficiais (conferir na fonte primária antes de qualquer material público ou comercial)**
1. Censo Escolar 2024: internet para uso dos alunos (~48,8% no EF), matrículas dos anos iniciais e da pré-escola por rede. Fontes: Inep, Sinopses e Notas Estatísticas (rel. 26 e 27).
2. TIC Educação 2024 (uso pelos alunos: 27% na rede municipal × 67% na estadual) e TIC Domicílios 2024 (~60% acessam só pelo celular). Cetic.br (rel. 26).
3. Inaf 2024: 29% de analfabetismo funcional; ~42% no Nordeste (rel. 26).
4. ICA 2023–2025 (56% / 59,2% / 66%) e valores por UF (CE 85,3% × ≈ 80%) (rel. 26 e 27).
5. População por idade simples de 4–8 anos no SIDRA/IBGE (rel. 27).
6. VAAF-MIN do Fundeb 2025, com valores divergentes (rel. 27).
7. ENEC/Inec: ~70% no fim de 2025 (rel. 26).

**Textos legais (ler o texto literal; parecer jurídico)**
8. Lei 14.133/2021 (arts. 74, 75, 82–86), LC 182/2021 (arts. 13–15) e valores de dispensa de 2025 e 2026 (rel. 27).
9. LGPD art. 14 e Lei 15.211/2025 (ECA Digital, arts. 20 e 22) + Decreto 12.880/2026: verificação de idade, oferta de assinatura só ao adulto, lojinha fictícia, voz e imagem de criança, limiar de n mínimo nos agregados (rel. 27 e 31; Decisões 001 e 002).
10. Lei 6.965/1981 e Res. CFFa 580/2020 (texto integral e resoluções posteriores sobre software) (rel. 29).
11. Direitos autorais e ECAD em app educacional (Lei 9.610/1998; número do REsp do STJ); contrato de voz sintética; PLs 3392/2024 e 4041/2025 (rel. 28).
12. Buscas no INPI: "Sofia" (classes 9, 41 e 28), "Boca da Sofia" e "Espelho do Som"; distância de "Boquinhas" e de "Princesinha Sofia" (rel. 28 e 31).
13. Contratação "por aluno/mês" no B2G (pregão/ARP e CPSI), consequência da Decisão 001.

**Ciência e normas**
14. Valores de d citados "de memória" no rel. 26: Sénéchal & Young (1,1/0,5/0,2); van Steensel (0,18); Kraft et al. (0,49/0,18); READY4K (0,2–0,3).
15. Tamanhos de efeito de Verhoeven 2020 e detalhes de Ronimus 2014 (rel. 30); limiares de Kraft 2020 para tamanho de efeito (rel. 27, [NV]).
16. Estudos do **GraphoGame Brasil** e de outros apps de alfabetização no Brasil (rel. 30).
17. Normas clássicas de Lamprecht 2004, Yavas 1991 e ABFW (números no original); decisão sobre a divergência do /ʎ/; normas do N, NE e CO (rel. 29).
18. Licença e uso da ICS-BP (rel. 29).
19. Regra dos 85%: A/B entre alvos de 75%, 85% e 95% com dados próprios (rel. 30).
20. PCPM, latências e pontos de corte de risco sem norma brasileira: recalibrar com a coorte-piloto de ≥ 500 por série (rel. 31).
21. ICC real para o cálculo de poder do RCT (o 0,15 é suposição [NV]) (rel. 27).

**Produção, tecnologia e mercado**
22. Tabela oficial dos 22 Viseme IDs × pt-BR; teste da voz Azure escolhida (blend shapes) num protótipo Rive; agrupamento em 12 bocas [NV] (rel. 28).
23. Páginas bloqueadas na sessão: preços do Rive (fontes divergem), Spine, Live2D, Kenney, Freesound, OpenGameArt, OMS H.870 e WCAG 2.3.1 (rel. 28).
24. Licenças: Victory Native XL (sem SPDX), Rhubarb ("Other"), runtime do Spine (rel. 31 e 28).
25. A/B do vídeo da boca (vídeo + corte + letra × letra + som) antes da produção em lote (rel. 28).
26. Orçamentos reais de arte, áudio e vídeo (3 por linha) (rel. 28).
27. Preços em ARPs no PNCP/Compras.gov.br; edital ativo do Guia de Tecnologias Educacionais; editais 2027 de Lemann, Itaú Social, TPE e BID Lab (rel. 27).
28. Pesquisa de disposição a pagar (van Westendorp, 300+ pais por classe), agora em **base mensal** (rel. 27 + Decisão 001).
29. Revalidar os diferenciais D1–D11 do rel. 31 ("não encontrado ≠ não existe") antes de usar em material comercial.
30. Teste com crianças (paleta, personagens, protocolo do doc 24) e com 5 professoras (painel) (rel. 31).
31. Lacuna de evidência a gerar pelo próprio FONEMA: ECR de WhatsApp (áudio) para pais em alfabetização (rel. 26).
