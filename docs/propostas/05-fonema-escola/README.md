# Proposta 5 — FONEMA Escola

> **📦 Proposta histórica.** Esta proposta foi uma das 5 opções de 13/11/2026. A [Decisão 005](../../decisoes/005-proposta-unificada.md) juntou o melhor das cinco na **[proposta 06 (FONEMA Unificada)](../06-fonema-unificada/README.md)**, que é a que vale. Decisões posteriores também mudaram pontos daqui: dupla Sofia e Tales em 3D (D007), sem adornos (D008), sem arco-íris (D009), Academia (D011), **sem festa junina, carnaval ou folclore como entidade (D012)** e linguagem de **plataforma**, não "jogo" (D014). Ver o [índice de decisões](../../decisoes/README.md).

> **Escola e rede pública primeiro, com o app da família junto.** O mesmo mundo lúdico da Sofia e do Bolota para a criança, mas o produto nasce pensado para a sala de aula real (tablets compartilhados, internet ruim, 25 crianças, uma professora) e para quem compra em escala no Brasil: a secretaria municipal.

Documentos desta proposta:

| Arquivo | Conteúdo |
|---|---|
| `README.md` (este) | conceito, dia típico, jornada, MVP, cronograma, equipe, custos, preços, contratação pública, riscos, prós e contras |
| [`arquitetura.md`](arquitetura.md) + `arquitetura.png` | arquitetura lógica, sincronização offline, identidade, dados |
| [`esqueleto.md`](esqueleto.md) | estrutura do monorepo e convenções |
| [`infra.md`](infra.md) + `infra.png` | ambientes, CI/CD, segurança/LGPD, observabilidade, backups, MDM, lojas |
| [`design.md`](design.md) + `estilo.png` e 5 telas | identidade visual dupla (lúdico × institucional) e telas-chave |

Base: síntese (`docs/sintese/00-documento-mestre.md` e blocos A–D), Decisões 001–004 e relatórios 19, 20, 26, 27, 31 e 43. Valores em R$ são **estimativas próprias** desta proposta, salvo indicação.

---

## 1. Conceito em uma frase

**Um programa de alfabetização para a rede, não só um app:** a criança joga e aprende no tablet da escola (em dupla, offline), a professora sabe todo dia **quem precisa dela, em que grupo e com que atividade**, a família recebe **uma missão de 5 minutos por semana** no celular, e a secretaria acompanha **quantas crianças estão em cada nível de 0 a 10** — com evidência de impacto medida por um ensaio randomizado independente.

Por que esse caminho:
- **Quem paga em escala é a prefeitura:** a rede municipal tem ~70% das matrículas dos anos iniciais (rel. 27).
- **Tecnologia sem implementação não funciona**; software adaptativo integrado à rotina funciona e tem efeitos 2–3× maiores com boa implementação (rel. 26: Mindspark; Durlak & DuPre).
- **Os casos de sucesso brasileiros são sistêmicos** (Sobral, PAIC/Ceará): meta, avaliação frequente, material estruturado, formação continuada. O FONEMA Escola se posiciona como **ferramenta do sistema** (Compromisso Nacional Criança Alfabetizada), sem competir com ele.
- **O guia do professor estruturado** foi o ingrediente mais custo-efetivo no Quênia (Tusome). Aqui ele é peça central, não anexo.
- **Evidência vira vantagem comercial:** o concorrente brasileiro com melhor evidência (Escribo Play) tem um ECR liderado pelo próprio criador. Um **RCT independente e pré-registrado** é o diferencial que nenhum concorrente em pt-BR tem.

O que **não muda** em relação ao núcleo do FONEMA: método fônico sistemático, Sofia e Bolota, mapa de 11 regiões em 2 anos, Escala FONEMA 0–10, **Espelho do Som** (nome de trabalho do recurso de articulação; "Boquinhas" é marca registrada e não é usado), economia de moedinhas sem dinheiro real e sem sorte, seis competências integradas, privacidade por arquitetura.

---

## 2. Um dia típico

### Na escola — Escola Municipal Rio Claro (fictícia), 1º ano B, 24 alunos, 5 tablets

| Hora | O que acontece |
|---|---|
| **7h40** | A prof.ª Márcia abre o **painel do professor** no celular. Cartão "Quem precisa de mim hoje": Kauã travado no "R entre vogais" há 3 sessões; Lara 7 dias sem usar (faltou); João respondendo rápido demais; Bia pronta para a provinha do nível 8. Os **grupos de hoje** já foram recalculados à meia-noite com os dados sincronizados ontem. |
| **8h00** | Modo **projetor/TV** (opcional): 10 minutos de consciência fonológica com a turma toda, a Sofia conduzindo rimas e o Espelho do Som do fonema da semana. |
| **8h10–8h55** | **Rotação por estações, 3 × 15 min.** Estação 1: grupo com a professora, seguindo o **guia da aula** (eu faço / nós fazemos / você faz) e a ficha do kit impresso. Estação 2: **tablets em dupla** — cada criança toca a sua figura (ou mostra o crachá QR), a dupla reveza a vez, a Sofia avisa a troca. Estação 3: **kit impresso** sem tela, mesma correspondência letra-som. |
| **durante** | Sem internet na sala. Tudo fica gravado no tablet (SQLite cifrado) e entra na fila de sincronização. O **modo ao vivo** mostra para a professora, no celular dela, quem está travado *agora* (via rede local do tablet ou na próxima sincronização). |
| **12h30** | Os tablets voltam ao carrinho; no Wi-Fi da escola, sincronizam em lote. Às 19h o MDM baixa pacotes de lição novos. |
| **15h** | Microvídeo de 3 min na trilha de formação ("Como ensinar o R entre vogais"), ligado à lição de amanhã. A coordenadora vê no painel da escola a dose da semana por turma. |

### Em casa — a família da Ana

| Quando | O que acontece |
|---|---|
| **segunda, 18h** | Chega no celular da mãe, pelo **canal oficial da escola** (API do WhatsApp Business, nunca o número da professora): áudio de 28 s da prof.ª Márcia + imagem da missão + link para o app. Formato **fato / dica / reforço** (READY4K), 3 mensagens por semana no máximo. |
| **segunda, 19h** | No **mesmo app** (mesma conta criada pela escola, área do responsável atrás da porteira parental): "**Nível 6 de 10 — faltam 4 níveis**", o que a Ana já sabe, o que está aprendendo, previsão em faixa ("entre 5 e 8 meses", sem promessa) e a **missão da semana** de 5 minutos, com botão "ouvir" (a mãe não precisa ler bem). |
| **quarta** | "Ouça seu filho ler" (opt-in): a Ana grava "o prato da Bia", a mãe responde com um coração. A gravação só sai do aparelho com consentimento específico. |
| **fim de semana** | A Ana joga 15 minutos no celular da família: missões paralelas na região onde está, cuida da Vila do Bolota com as moedinhas que ganhou aprendendo. O progresso conta no mesmo termômetro da escola. |

---

## 3. Jornada de 2 anos (escola + casa)

O mapa é o do Documento Mestre (11 regiões, R0 Quintal → R10 Arquipélago dos Livros). Na proposta Escola, a jornada é **alinhada ao calendário letivo** e ao indicador Criança Alfabetizada:

| Período | Regiões (nível típico ao sair) | Na sala | Marcos para a rede |
|---|---|---|---|
| **1º ano, fev–abr** | R0 Quintal, R1 Ilha das Vogais, R2a Vale do M-L-F (0→2) | diagnóstico de entrada (provinha disfarçada de aventura); estações 3×/semana | **Avaliação de entrada** da rede; fim da parte gratuita para turmas-teste |
| **1º ano, mai–set** | R2b Trilha do V-S-N, R3 Pampa, R4 Pantanal (3→5 parcial) | grupos automáticos; contraste surdo/sonoro com Espelho do Som | relatório semestral; ajuste de dose por escola |
| **1º ano, out–dez** | R5 Cerrado, R6 Caatinga — chefe do Ano 1 (5 completo) | provinhas de passagem; modo projetor para revisão | **marco do 1º ano**: % nos níveis ≥ 5 |
| **2º ano, fev–jun** | R7 Amazônia, R8 Litoral e Mar (6→7) | frases e pequenos textos; leitura dialógica | relatório ao Conselho Municipal |
| **2º ano, ago–nov** | R9 Cidade das Letras, R10 Arquipélago dos Livros (8→10) | fluência, compreensão, produção de texto | **% no nível 10** e **estimativa de referência Saeb 743** (sempre rotulada como estimativa) antes da avaliação oficial |
| **sempre** | modo infinito de revisão, temporadas (feira da colheita, Copa das Letras; D012), Vila do Bolota | — | — |

O avanço é **por domínio**, nunca por tempo. Crianças que chegam ao 2º ano ainda no nível 2 continuam de onde estão; o painel da secretaria mostra a **distribuição**, não uma média que esconde quem ficou para trás. O nível **nunca desce visivelmente** para a criança.

---

## 4. Diferenciais

1. **Modo sala de aula de verdade:** troca de perfil por **figura ou crachá QR em ≤ 2 toques**, até 40 perfis por tablet, **2 crianças por tablet** com turnos, estações de 10–15 min com cronômetro, **100% offline por até 30 dias** com sincronização em lote. Funciona na escola sem internet (≈ metade das escolas de EF, rel. 26).
2. **Painel do professor como peça central ("três perguntas, não trinta gráficos"):** quem precisa de mim hoje, mapa de calor aluno × habilidade, grupos de 3–5 crianças recalculados todo dia, **plano de aula sugerido** com rotação por estações, **guia do professor** (eu faço / nós fazemos / você faz), kit impresso e **formação embutida** em microvídeos ligados à lição do dia.
3. **Painel da secretaria:** distribuição 0–10 por escola e turma, % no nível 10, **fidelidade de uso medida automaticamente** (dose, cobertura), escolas que pedem apoio, exportação no layout da rede, e a **referência Saeb 743 sempre rotulada como estimativa**. Sem nomes de crianças, com supressão de grupos com n < 10 e sem dados socioemocionais.
4. **Família junto, sem sobrecarregar a professora:** canal oficial via API do WhatsApp Business (A/B com SMS e app), missão da semana em áudio, "ouça seu filho ler", e a **mesma conta** da escola (sem novo cadastro; só adulto/instituição cadastra).
5. **Evidência de impacto como estratégia de venda:** piloto de viabilidade (2027) → **RCT por conglomerado pré-registrado** com avaliador externo (ano letivo 2028) → resultados publicados mesmo se nulos, a tempo das novas gestões municipais de 2029. Pode gerar a **primeira evidência experimental brasileira de mensagens de WhatsApp para alfabetização** (rel. 26).
6. **Stack robusta e auditável:** TypeScript de ponta a ponta (Expo, Next.js, NestJS), PostgreSQL gerenciado com RLS, Keycloak (SSO de professores, login gov.br para gestores), Terraform, **todos os dados na AWS São Paulo**, trilha de auditoria imutável — o que a área de TI e o controle interno da prefeitura vão perguntar.

---

## 5. MVP (o que entra primeiro)

Escopo do MVP = o necessário para o **piloto de viabilidade** com 20–30 turmas no 2º semestre de 2027.

| Área | Entra no MVP | Fica para depois (V1/V2) |
|---|---|---|
| Conteúdo | R0–R3 (níveis 0–4; ≈ 6 meses de uso), Espelho do Som dos fonemas dessas regiões, áudio pré-gerado + fonemas gravados por fonoaudióloga | R4–R10; variantes regionais opcionais |
| Criança | lição completa, missões paralelas procedurais com linter de decodificabilidade, moedinhas + Vila do Bolota básica, termômetro sem números, fala no aparelho (verificador fechado; toque como alternativa equivalente) | lojinha completa, temporadas, educação financeira avançada; câmera fica **fora** (espelho local só se a PoC aprovar) |
| Sala de aula | troca de perfil por figura/QR, duplas com turnos, modo estação, offline + sync, modo projetor simples, kit impresso (PDF) | modo ao vivo por rede local, fila de escuta |
| Professor | "quem precisa de mim hoje", mapa de calor, grupos automáticos, plano de aula sugerido, guia da aula, provinhas de passagem, 8 microvídeos | comunidade de prática, coaching para coordenadores |
| Secretaria | distribuição 0–10 por escola/turma, dose, exportação CSV, estimativa Saeb rotulada | integração por API com sistemas da rede, relatórios ao Conselho |
| Família | mesmo app, área do responsável, missão da semana em áudio, mensagens via WhatsApp/SMS com opt-in | "ouça seu filho ler", hora da história com perguntas dialógicas |
| Plataforma | Keycloak (professor/gestor com MFA; família por OTP), RLS, auditoria, medição aluno-mês, MDM (Android) | login gov.br (depende de credenciamento), iPad/Apple School Manager |

---

## 6. Cronograma (com piloto e avaliação de impacto)

Pressupostos: início em **jan/2027**, após o fechamento da coleta (Decisão 001); ano letivo brasileiro de fevereiro a dezembro; eleições municipais em out/2028 e novas gestões em jan/2029.

| Período | Fase | Entregas | Avaliação |
|---|---|---|---|
| **dez/2026–jan/2027** | Descoberta | 3 redes parceiras (acordo de cooperação técnica, sem custo); matriz **CIEB NT 29**; observação de 6 salas; PoCs (fala no aparelho em Android de entrada, Sofia em Rive, sync offline com 40 perfis) | parecer jurídico (LGPD/ECA Digital, contratação "por aluno/mês") |
| **fev–jul/2027** | Construção do MVP | fundação (Terraform, Keycloak, CI/CD), app modo sala, painel professor, conteúdo R0–R3, kit impresso, guia + 8 microvídeos | testes de usabilidade com 5–8 crianças por faixa e 5 professoras (critério de "pronto" do rel. 24) |
| **ago–dez/2027** | **Piloto de viabilidade** | 2–3 redes, 20–30 turmas, ~600 alunos; formação presencial inicial + acompanhamento remoto | métricas de fidelidade (dose, cobertura), usabilidade, satisfação; **pré-registro** do RCT (OSF/ReBEC) e aprovação no CEP |
| **jan/2028** | Preparação do RCT | sorteio de **80–100 turmas** em 2–4 redes (via CPSI), conteúdo até R6 pronto | pré-teste independente em fevereiro |
| **fev–nov/2028** | **RCT por conglomerado** (ano letivo) | operação plena; A/B de mensagens às famílias (SMS × WhatsApp texto × WhatsApp áudio) | medidas independentes (não o jogo); ITT e CACE; MDES ≈ 0,17–0,22 DP (rel. 27) |
| **dez/2028–abr/2029** | Análise e publicação | relatório do avaliador externo; artigo; dossiê para redes | publicação **mesmo se o resultado for nulo** |
| **2029** | Escala | pregão com ARP; adesões; programas estaduais; R7–R10 completos | estudo de continuidade (2º ano) |

---

## 7. Equipe

Núcleo de **14–16 pessoas** no pico da construção (2027), mais parceiros:

| Papel | Qtd. | Observação |
|---|---|---|
| Líder de produto (educação pública) | 1 | conhece rotina de secretaria |
| Coordenação pedagógica de alfabetização | 1 | dona do guia do professor e das provinhas |
| Designer de conteúdo / roteirista | 1 | lições, histórias decodificáveis |
| Fonoaudióloga consultora (CRFa) | 0,5 | Espelho do Som, matriz de tolerância |
| UX/UI (dois registros: criança e institucional) | 1 | |
| Ilustração e animação (Sofia/Bolota, Rive) | 1–2 | ou estúdio contratado |
| Engenharia mobile (React Native/Expo, offline) | 2 | |
| Engenharia web (Next.js, painéis) | 1 | |
| Engenharia back-end (NestJS, Postgres) | 2 | |
| SRE / segurança (Terraform, AWS, MDM) | 1 | |
| QA (aparelhos reais, offline) | 1 | |
| Dados e avaliação de impacto | 1 | interface com avaliador externo |
| Implantação e sucesso da rede | 1–2 | formação, suporte às escolas; cresce com a escala |
| Jurídico / encarregado de dados (DPO) | fracionado | contratos com secretarias, RIPD |
| **Externos** | — | avaliador independente do RCT (universidade/centro de pesquisa); conselho pedagógico e de fonoaudiologia; estúdio de áudio |

---

## 8. Custo de construção (faixa, estimativa)

| Item | Faixa | Premissa |
|---|---|---|
| Equipe até o MVP (fev–jul/2027, ~7 meses) | R$ 2,3–2,9 mi | ~14 pessoas, CLT com encargos ou PJ equivalente |
| Arte, animação, áudio, Espelho do Som | R$ 0,33–0,75 mi | faixa do rel. 28 (tabela), até R3 |
| Infra, ferramentas, aparelhos de teste, jurídico | R$ 0,15–0,25 mi | |
| **Total até o MVP** | **R$ 2,8–3,9 mi** | |
| Piloto + RCT + conteúdo até R10 (ago/2027–dez/2028) | R$ 5,5–7,0 mi | equipe + implantação + formação nas escolas |
| Avaliação externa do RCT (aplicadores, análise) | R$ 0,8–1,5 mi | idealmente financiada por filantropia |
| **Total em 24 meses** | **≈ R$ 9–12 mi** | parte coberta por CPSI e editais (Lemann, Itaú Social, TPE, BID Lab a confirmar) |

---

## 9. Custo mensal de operação (estimativa)

Inclui os 3 ambientes (dev, hml, prod), segurança, observabilidade, CDN, mensagens às famílias e ASR em nuvem amostral. **Não inclui** pessoas (suporte, implantação, formação) nem os tablets/MDM da rede. Câmbio-hipótese: US$ 1 = R$ 5,50. A AWS São Paulo custa ~30–50% mais que regiões dos EUA; isso já está na conta.

| Alunos ativos | Infra AWS | Mensagens às famílias¹ | Outros² | **Total/mês** | **Por aluno/mês** |
|---|---|---|---|---|---|
| **1 mil** (piloto) | R$ 14–18 mil | R$ 0,3 mil | R$ 1 mil | **R$ 15–20 mil** | R$ 15–20 (custo fixo domina) |
| **10 mil** | R$ 20–26 mil | R$ 2,7 mil | R$ 2 mil | **R$ 25–31 mil** | **R$ 2,50–3,10** |
| **100 mil** | R$ 55–75 mil | R$ 27 mil | R$ 8 mil | **R$ 90–110 mil** | **R$ 0,90–1,10** |

¹ ~12 mensagens-modelo de utilidade por família/mês, 60% de adesão, ≈ R$ 0,45/família/mês pela tabela da Meta para o Brasil + provedor (a conferir na tabela vigente). Pode ser trocado por notificação do app (custo ≈ 0) para quem preferir.
² ASR em nuvem só amostral (o reconhecimento é no aparelho; Azure em tudo custaria US$ 1,3–1,5/aluno/mês e inviabilizaria o B2G, rel. 03), SMS de OTP, crash reports, domínio, suporte AWS Business.

---

## 10. Preço (sempre mensal)

| Plano | Preço proposto | O que inclui |
|---|---|---|
| **Turma-teste gratuita por conquista** | R$ 0 até o fim da R2a (≈ 6–10 semanas) | app em sala + painel da turma + relatório antes/depois para escola e famílias |
| **Rede pública (B2G)** | **R$ 3,50 por aluno ativo/mês** (faixa 2,90–4,20) | app (escola e casa), painéis professor/escola/secretaria, conteúdo completo, sync, suporte, app da família |
| **Implantação e formação (B2G)** | **R$ 1,00 por aluno/mês nos 6 primeiros meses** (item separado) | formação inicial, acompanhamento remoto quinzenal, kit impresso em PDF, relatório de fidelidade |
| **Escola privada (B2B)** | **R$ 8,90 por aluno/mês** (faixa 6,90–9,90) | tudo do B2G + formação remota |
| **Família de aluno de escola contratada** | **incluso** | mesma conta, área do responsável, missões |
| **Família direta (B2C)** | **R$ 24,90/mês** (até 3 crianças) | freemium por conquista; oferta só ao adulto, atrás da porteira |

Leitura honesta: a 10 mil alunos, a receita B2G (~R$ 35 mil/mês) mal cobre a infra; o **ponto de equilíbrio** com a equipe fica em **~120–150 mil alunos** ativos, ou antes disso com B2B e B2C. É um negócio de escala e de ciclo longo, que precisa de filantropia e CPSI até 2029.

---

## 11. Caminho de contratação pública

Tudo a confirmar com advogado de licitações ⚖️ (sobretudo a unidade "aluno ativo/mês" com medição mensal pelo relatório de alunos ativos).

| Etapa | Instrumento | Quando | Observação |
|---|---|---|---|
| 1. Piloto de viabilidade | **Acordo de cooperação técnica** sem repasse + filantropia | 2º sem. 2027 | a rede entra com tempo e tablets; o FONEMA com software e formação |
| 1b. Piloto pago pequeno | **Dispensa** por valor (teto R$ 65.492,11 em 2026) | 2027 | ≈ 1.500 alunos × R$ 3,50 × 12 meses = R$ 63 mil — cabe no teto |
| 2. RCT pago | **CPSI** (LC 182/2021): até R$ 1,6 mi, 12+12 meses | 2028 | depois do teste, **contrato de fornecimento** sem nova licitação (até 24+24 meses) |
| 3. Escala | **Pregão eletrônico com Sistema de Registro de Preços (ARP)** | 2029+ | via mais segura; **adesão (carona)** de outras redes dentro dos limites da Lei 14.133 |
| 4. Programas estaduais e consórcios | ARP estadual, consórcios intermunicipais, regime de colaboração (estilo PAIC) | 2029+ | multiplica alcance sem 5.570 vendas separadas |
| Apoio | matriz **CIEB NT 29**, Guia de Tecnologias Educacionais do MEC (se houver edital), cadastro no PNCP | sempre | "linguagem" dos técnicos das secretarias |

Inexigibilidade só com exclusividade comprovada e parecer jurídico; não é a estratégia principal.

---

## 12. Riscos e mitigação

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Ciclo de venda pública lento; eleição 2028 e troca de gestão 2029 | alta | alto | resultados do RCT em abr/2029, a tempo das novas gestões; B2B privado e B2C como receita-ponte; filantropia |
| Infraestrutura da escola (tablets quebrados, sem Wi-Fi) | alta | alto | 100% offline, Android de entrada, kit impresso, sync pelo celular da professora, levantamento de aparelhos na descoberta |
| Baixa fidelidade de uso (dose) | alta | alto | horário fixo diário recomendado, painel de fidelidade para a gestão, alertas de escola com uso baixo, formação embutida |
| **RCT com resultado nulo** | média | alto | piloto de viabilidade antes; medir dose e fidelidade; publicar mesmo assim; iterar |
| Sobrecarga da professora | média | alto | "três perguntas", plano pronto, mensagens às famílias automáticas; nada de número pessoal |
| LGPD / ECA Digital / contratos com secretarias | média | alto | contrato de operador, RIPD por rede, dados no Brasil, sem SDK de terceiros, parecer jurídico antes do piloto |
| Custo de mensagens (WhatsApp) e ASR | média | médio | ASR no aparelho; mensagens com teto de 3/semana; A/B com notificação do app |
| Complexidade da stack para equipe pequena | média | médio | monólito modular (não microsserviços), serviços gerenciados, Terraform desde o dia 1 |
| Concorrentes gratuitos/subsidiados | média | médio | evidência independente + painel da secretaria + formação como pacote |
| Exposição a uma só nuvem/região | baixa | alto | Terraform e PostgreSQL padrão (portável); exportação cifrada mensal para 2º provedor no Brasil |

---

## 13. Prós e contras

**Prós**
- Ataca o maior comprador e o maior problema (≈ 0,9 mi crianças/ano terminam o 2º ano sem estar alfabetizadas).
- Implementação e formação embutidas: a parte que mais explica efeito real em escala.
- Gera **evidência causal independente**, que vira barreira de entrada e argumento de venda.
- A família entra junto sem custo extra e sem cadastro novo; a casa reforça a escola.
- Stack e infraestrutura **auditáveis** (dados no Brasil, SSO, trilha de auditoria) passam na TI e no controle interno da prefeitura.
- Os dados de sala (40 perfis × milhares de turmas) alimentam o motor adaptativo e o corpus de fala com consentimento.

**Contras**
- Ciclo de receita longo: receita relevante só a partir de 2029.
- Exige equipe de implantação e formação (custo humano que escala com as redes).
- Stack mais pesada (Keycloak, AWS multi-conta, Terraform) que um BaaS; custo fixo alto no começo (R$ 15–20 mil/mês já no piloto).
- Depende de parceiros públicos e do calendário político.
- B2C fica em segundo plano no início; marca de consumo cresce mais devagar.

---

## 14. Quando escolher esta proposta

Escolha a **FONEMA Escola** se:
- o objetivo principal é **impacto em escala no Brasil público** (Criança Alfabetizada) e não crescimento rápido de assinaturas;
- há acesso a **filantropia ou capital paciente** para 24 meses (≈ R$ 9–12 mi) e redes dispostas a pilotar;
- o dono quer **evidência científica forte** como ativo da marca;
- a equipe aceita operar implantação e formação, não só software.

Não é a melhor escolha se a prioridade é receita B2C nos primeiros 12 meses ou se não houver como financiar o período até o RCT.
