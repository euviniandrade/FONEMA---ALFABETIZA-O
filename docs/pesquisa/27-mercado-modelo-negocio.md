# 27 — Mercado, Modelo de Negócio e Validação de Impacto

> Frente 27 de 30 da fase de pesquisa do FONEMA. Data: novembro de 2026.
> Complementa e **não repete** o doc 02 (BNCC, CNCA, indicador "Criança Alfabetizada" e série 56% → 59,2% → 66%) nem o doc 04 (benchmark de apps, mecânicas e preços dos concorrentes estrangeiros). Aqui o foco é: **tamanho do problema e do mercado, quem paga, como vender ao poder público, quem financia, como provar impacto e quais são os riscos.**

## Como ler as marcações de verificação

As ferramentas desta sessão tinham limites. O `curl` direto só funcionou no **Crossref** e no **ERIC**. O gov.br devolveu uma tela anti-robô, e o WebFetch não alcançou Planalto, Inep, IBGE nem CIEB. Por isso a verificação tem dois níveis:

- **[V-D] Verificado direto:** o registro foi consultado na base (Crossref/DOI ou ERIC) nesta sessão. Título, autor, ano e periódico conferem.
- **[V-B] Verificado por busca:** a URL e o trecho citado apareceram no índice da busca web nesta sessão, mas a página não foi aberta inteira. O número está como aparece no trecho. **Antes de usar em proposta comercial ou edital, abra a fonte primária.**
- **[NV] Não verificado:** informação de memória, de relatório de mercado com metodologia fechada ou com fontes que se contradizem. Use só como hipótese.
- **Estimativa FONEMA:** conta feita por este documento a partir de fontes marcadas. A conta aparece explicitamente e **não é dado oficial**.

---

## 1. Resumo executivo

1. **O problema é grande e mensurável.** O Brasil tem cerca de **13,7 milhões de crianças de 5 a 9 anos** e **12,7 milhões de 0 a 4 anos** (Censo 2022) [2], ou seja, cerca de **2,6 a 2,8 milhões de crianças por ano de idade**. O número de crianças está caindo: a população de até 14 anos passou de 45,9 milhões (2010) para 40,1 milhões (2022) [1]. Em 2025, **34% das crianças do 2º ano ainda não estavam alfabetizadas** pelo indicador oficial (ICA = 66%) [7]. Isso dá **aproximadamente 0,9 milhão de crianças por ano** que terminam o 2º ano sem se alfabetizar (estimativa FONEMA; ver §2.2).
2. **Quem atende essas crianças é a rede pública municipal.** A rede privada tem cerca de **20% das matrículas** da educação básica (≈9,5 de 47,1 milhões) [3][4], e a **rede municipal responde por 69,7% das matrículas dos anos iniciais** [4]. **Quem paga em escala é a prefeitura (B2G)**, não a família.
3. **O mercado de edtech no Brasil é o maior da América Latina, mas o capital está escasso.** O Brasil concentra quase 70% das edtechs da região e cerca de 80% do volume investido, com US$ 475,6 milhões em 280 rodadas entre 2015 e o 1º tri de 2024 [10]. O venture capital geral caiu 13% em 2025 (US$ 4,5 bi) [11]. **Conclusão: o FONEMA deve planejar receita e filantropia antes de depender de VC.**
4. **Os números do "mercado global de apps de alfabetização" não são confiáveis.** Relatórios pagos falam em cerca de US$ 5,8 bi (2025) e CAGR de 17%, mas a metodologia é fechada e há números quase idênticos para segmentos diferentes [14]. **Não use em pitch sem ressalva.** O argumento forte é o problema brasileiro medido pelo Inep, não o TAM global.
5. **Modelo recomendado: híbrido, com B2G como motor de escala e impacto, e B2C freemium como vitrine, gerador de dados e caixa inicial.** O B2B em escolas privadas é uma ponte de receita rápida. Sequência proposta:
   - Ano 1: B2C freemium, escolas privadas e pilotos públicos financiados por filantropia.
   - Ano 2: avaliação de impacto independente e primeiras vendas a prefeituras por pregão com ata de registro de preços (ARP).
   - Ano 3: escala via adesões (carona) e programas estaduais.
6. **Caminhos de compra pública** (Lei 14.133/2021):
   - **Pregão com ARP** é a via mais segura.
   - **Inexigibilidade** (art. 74, I) só vale com exclusividade real e comprovada, e os tribunais de contas olham isso de perto [17].
   - **Dispensa por valor:** teto de R$ 65.492,11 em 2026 [19]. Serve só para pilotos pequenos.
   - **CPSI do Marco Legal das Startups** (LC 182/2021): até R$ 1,6 mi, 12+12 meses, para testar uma solução inovadora [20]. É **a melhor porta para pilotos municipais pagos**.
7. **Faixa de preço sugerida (hipóteses para testar):**
   - **B2C:** R$ 24,90–29,90/mês ou R$ 179–229/ano. Fica abaixo do Lingokids (R$ 59,90/mês; R$ 289/ano) [15] e perto do GraphoGame (R$ 24,90) [16].
   - **B2G:** R$ 25–50 por aluno/ano em licença, com formação e implantação como itens separados. Equivale a menos de 1% do valor mínimo por aluno do Fundeb (VAAF-MIN ≈ R$ 5,4–5,7 mil em 2025) [26].
   - **B2B privado:** R$ 60–120 por aluno/ano [NV — sem referência de mercado verificada].
8. **Evidência vira vantagem comercial.** No Brasil, o concorrente com melhor evidência é o **Escribo Play**: um ensaio randomizado com 749 crianças, 62 turmas e 17 escolas mediu d = 0,40 em leitura e d = 0,20 em escrita [36]. O FONEMA precisa de um plano de impacto em quatro fases:
   - lógica de intervenção;
   - usabilidade;
   - piloto quase-experimental (ESSA nível 3);
   - **RCT por conglomerado com avaliador externo, pré-registro e medidas independentes** (ESSA nível 1).

   Um RCT desses tem orçamento de 60 a 100 turmas para detectar efeitos de cerca de 0,2 DP (ver §4).
9. **Os maiores riscos:**
   - ciclo lento de venda pública e calendário eleitoral;
   - concorrentes gratuitos ou subsidiados;
   - resultado nulo no RCT;
   - conformidade com LGPD e ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026, que proíbe *loot boxes* e perfilamento publicitário de crianças) [27];
   - custo de voz e reconhecimento de fala por criança;
   - queda demográfica.

---

## 2. Números de mercado (com fontes)

### 2.1 População-alvo e matrículas

| Indicador | Valor | Ano | Fonte | Status |
|---|---|---|---|---|
| População de 0 a 4 anos | ≈ 12,7 milhões | 2022 | IBGE, Anuário Estatístico 2024, tab. s2t1102 [2] | [V-B] (a linha "Brasil" foi lida no trecho indexado; conferir no SIDRA) |
| População de 5 a 9 anos | ≈ 13,7 milhões | 2022 | idem [2] | [V-B] |
| População de até 14 anos | 45,9 mi (2010) → 40,1 mi (2022), −12,6% | 2010–2022 | IBGE Agência de Notícias [1] | [V-B] |
| População de 0 a 6 anos | −7,7% entre 2010 e 2022 | 2022 | Nota técnica Pref. SP / Censo [1b] | [V-B] |
| Matrículas na educação básica | 47,1 milhões em 179,3 mil escolas | 2024 | Inep, apresentação do Censo Escolar 2024 [3] | [V-B] |
| Matrículas públicas × privadas | ≈ 37,6 mi públicas × ≈ 9,5 mi privadas (≈ 20,2% privada) | 2024 | Inep, Notas Estatísticas 2024 [4]; "20,2%" no trecho de [3] | [V-B] (rótulos do gráfico a confirmar) |
| Matrículas no ensino fundamental | 26 milhões | 2024 | Notas Estatísticas [4] | [V-B] |
| Participação municipal nos anos iniciais | 69,7% | 2024 | Notas Estatísticas [4] | [V-B] |
| Matrículas na pré-escola | ≈ 5,30 milhões (5,338 mi em 2023) | 2024 | Imprensa sobre o Censo [6] | [V-B] (imprensa; conferir no Inep) |
| Atendimento escolar de 4 e 5 anos | 92,9% | 2024 | Cenpec [5] | [V-B] |
| Matrículas nos anos iniciais (total nacional) | **não localizado nesta sessão** | 2024 | — | [NV]: buscar nas Sinopses do Inep |
| Indicador Criança Alfabetizada (ICA) | 56% (2023) → 59,2% (2024) → **66% (2025)** | 2023–25 | TPE [7]; Agência Gov [8] (detalhes no doc 02) | [V-B] |
| Usuários de internet de 9–17 anos com 1º acesso antes dos 6 anos | 23% (11% em 2015) | 2024 | CETIC.br, TIC Kids Online 2024 [9] | [V-B] |

**Leitura para o produto:**
- **Uma coorte de idade tem cerca de 2,7 milhões de crianças** (13,7 mi ÷ 5 anos). Os anos de interesse do FONEMA são de 4 a 8 anos: pré-escola, 1º, 2º e 3º anos. Isso dá cerca de 13 a 14 milhões de crianças no total.
- **A demografia encolhe.** Mercados baseados em "número de crianças" vão diminuir devagar. O crescimento precisa vir de **penetração e de receita por aluno**, não do tamanho da população.
- **O acesso a telas começa cedo** (23% acessam a internet antes dos 6 anos [9]). Isso confirma o uso doméstico, mas a pesquisa cobre só usuários de 9 a 17 anos. **Não há número verificado de acesso a dispositivos entre 4 e 8 anos** nesta sessão [NV].

### 2.2 Tamanho do problema (estimativa FONEMA)

| Passo | Conta | Resultado |
|---|---|---|
| Coorte que termina o 2º ano por ano | ≈ 2,7 mi (IBGE [2]; ignora reprovação e distorção idade-série) | ≈ 2,7 mi |
| Fatia não alfabetizada (ICA 2025) | 100% − 66% [7] | 34% |
| Crianças/ano sem alfabetização ao fim do 2º ano | 2,7 mi × 0,34 | **≈ 0,9 mi** (ordem de grandeza) |

Ressalvas:
- O ICA se baseia nas avaliações das redes **públicas**, equalizadas ao Saeb. Aplicar o percentual a toda a coorte é uma aproximação.
- O ICA varia muito entre estados (Ceará, Paraná e Goiás perto de 80% [7]). **Os municípios com ICA baixo são o público prioritário de impacto**, e esses mesmos municípios costumam ter menos orçamento e infraestrutura.

### 2.3 Tamanho do mercado endereçável (estimativa FONEMA, ordem de grandeza)

| Segmento | Base de cálculo | Preço-hipótese | Teto teórico anual |
|---|---|---|---|
| **B2G**: pré-escola (5 anos) + 1º + 2º ano, redes públicas | 3 coortes × 2,7 mi × ≈ 80% público ≈ **6,5 mi alunos** | R$ 25–50/aluno/ano | **≈ R$ 160–325 mi** |
| **B2B**: mesmas séries, escolas privadas | 3 × 2,7 mi × ≈ 20% ≈ **1,6 mi alunos** | R$ 60–120/aluno/ano [NV] | ≈ R$ 100–195 mi |
| **B2C**: famílias com filhos de 4 a 7 anos | 4 coortes × 2,7 mi ≈ 10,8 mi crianças; supõe conversão paga de 1–3% (hipótese de app freemium [NV]) | R$ 200/ano | ≈ R$ 22–65 mi |

Esses tetos assumem 100% de adoção. **Não são projeção de receita.** Uma meta realista em 5 anos seria de **1 a 5% do teto B2G** (60 a 300 mil alunos), o que daria R$ 2–15 mi/ano. Isso é hipótese de planejamento, não dado.

### 2.4 Edtech no Brasil

| Indicador | Valor | Fonte | Status |
|---|---|---|---|
| Edtechs ativas | 364 (2018); 449 (2019); 566 (2020) | CIEB/Abstartups, mapeamentos [13] | [V-B] |
| Edtechs em 2022 | 813 (+44% em dois anos) | Deloitte/Abstartups [12] | [V-B] (metodologia diferente) |
| Base de 2025 | 368 edtechs ativas no Mapeamento de Startups 2025 (Abstartups/USP) | Forbes Brasil, jul/2026 [12b] | [V-B] (não é comparável com a série anterior) |
| Participação regional | ≈ 70% das edtechs e ≈ 80% do volume investido na América Latina | Distrito, Report EdTech 2024 [10] | [V-B] |
| Investimento acumulado | US$ 475,6 mi em 280 rodadas (2015–1º tri 2024) | Distrito via Startups.com.br [10] | [V-B] |
| Queda dos aportes de VC em edtech em 2023 | −73% (contra −38% no VC geral) | Crunchbase via Startups.com.br [10] | [V-B] |
| VC geral no Brasil em 2025 | US$ 4,5 bi em 459 rodadas, −13% no volume | Sling Hub via Bloomberg Línea [11] | [V-B] |

**Leitura:** o capital de risco para edtech encolheu muito depois de 2022, e há juros acima de 10% há quase quatro anos [11]. Para o FONEMA, o financiamento mais provável no curto prazo é **filantropia + receita**. O VC entra depois de haver tração e evidência.

### 2.5 Mercado global e referências de preço

- **Mercado global de apps de alfabetização infantil:** cerca de US$ 5,8 bi (2025) → US$ 20,2 bi (2034), CAGR de 17,3% (Marketintelo) [14]. A mesma editora dá US$ 6,2 bi e o mesmo CAGR para "early childhood learning apps". Outras fontes dão entre 5% e 12% ao ano para segmentos vizinhos. **[NV]: metodologia fechada e números que parecem modelados por template.** Use só como "mercado grande e crescente", nunca como número de pitch.
- **Referências de preço no Brasil** (complementam o doc 04, que lista os preços em US$):
  - **Lingokids, App Store BR:** R$ 59,90/mês e R$ 289/ano, com versão gratuita limitada [15] [V-B].
  - **GraphoGame Brasil:** R$ 24,90 na App Store BR. Era gratuito com apoio do MEC e passou a ser pago depois de mais de 3 milhões de downloads [16] [V-B]. Agregadores estimam cerca de 1,9 milhão de instalações no Google Play [NV].
  - **Mundo Bita Play:** assinatura, preço não confirmado [NV].

---

## 3. Modelos de negócio e recomendação

### 3.1 Comparação dos modelos

| Modelo | Quem paga | Vantagens | Desvantagens | Ciclo de venda |
|---|---|---|---|---|
| **B2C freemium** (família) | Pais | Receita direta; dados de uso rápidos; marca; não depende de licitação | Alfabetização é vista como "obrigação da escola"; disposição a pagar menor nas classes C, D e E; custo de aquisição alto; taxas das lojas de apps [NV: 15–30%] | Imediato |
| **B2B escola privada** | Mantenedora (repassa na mensalidade ou no material) | Venda mais rápida que a pública; ticket por aluno maior; referência pedagógica | Mercado de ≈ 20% dos alunos; disputa com sistemas de ensino que já trazem plataforma própria | 2 a 6 meses; decisão em ago–nov para o ano seguinte [NV] |
| **B2G município ou estado** | Secretaria de Educação (Fundeb, recursos próprios, programas federais) | Escala; missão de impacto; contratos plurianuais | Licitação; troca de gestão; exige evidência, formação e suporte; pagamento pode atrasar | 6 a 18 meses [NV] |
| **B2G2C** (rede compra, criança usa em casa) | Secretaria | Une escala e uso doméstico; engaja a família | Depende de celular em casa e de dados móveis | idem B2G |
| **Filantropia e editais** | Fundações, organismos multilaterais | Financia pilotos e avaliação de impacto | Não é receita recorrente; editais temáticos e pontuais | 3 a 9 meses |

### 3.2 Compra pública: o que a lei permite (Lei 14.133/2021 e LC 182/2021)

| Via | Quando cabe | Limites e cuidados | Fonte |
|---|---|---|---|
| **Pregão eletrônico** (critério menor preço ou técnica e preço) | Regra geral para software e licença que se possa descrever objetivamente | Exige especificação técnica bem feita. O risco é perder para solução mais barata e sem evidência. **Mitigação:** apoiar as redes a escrever termos de referência com requisitos verificáveis (fônica sistemática, relatório por habilidade BNCC, acessibilidade, LGPD) | Lei 14.133 [17] |
| **Sistema de Registro de Preços / ARP** | Compras recorrentes ou de quantidade incerta | **Adesão (carona) de órgão não participante: até 50% dos quantitativos registrados por órgão.** O total de adesões é limitado ao dobro do registrado (§§ 4º e 5º do art. 86; Dec. 11.462/2023). Órgãos federais não podem aderir a atas de estados e municípios. O edital precisa estimar quantitativos para permitir caronas | TCU, Licitações e Contratos 5.9.4 [18] |
| **Inexigibilidade, art. 74, I** (fornecedor exclusivo) | Só quando a competição é inviável | Comprovar com atestado ou contrato de exclusividade, declaração do fabricante etc. **Patente ou registro de software, sozinhos, não bastam** (TCE-MG). Os tribunais de contas questionam muito o uso em edtech | TCU 5.10.1.1 [17]; Zênite [17b] |
| **Dispensa por valor, art. 75, II** | Pilotos pequenos | **R$ 62.725,59 (2025, Dec. 12.343/2024) → R$ 65.492,11 (2026, Dec. 12.807/2025)** | Justen; Conlicitação [19] (há divergência entre fontes nos valores de 2025) |
| **CPSI, LC 182/2021** (contrato público para solução inovadora) | **Testar** solução inovadora com problema definido pelo órgão | **Até R$ 1,6 mi, vigência de 12 meses prorrogável por igual período.** Se o teste der certo, cabe um **contrato de fornecimento sem nova licitação**: 24 + 24 meses e até 5× o valor do CPSI | Effecti; Seti-PR; Enap (casos) [20] |
| **Sandbox Regulatório de IA na Educação (MEC)** | Testar IA em contexto real com supervisão do MEC | Não é contrato de compra. O participante arca com os próprios custos. Edital SEI 2300.056786/2025-81 | gov.br/MEC; Itatiaia; Cebraspe [21] |

**Recomendação jurídica:**
1. **Pilotos:** CPSI, ou termo de cooperação sem custo financiado por filantropia.
2. **Escala:** pregão com ARP gerenciada por um município ou consórcio, abrindo espaço para caronas.
3. **Inexigibilidade só com parecer jurídico.**

Validar tudo com advogado de licitações e ler o texto literal dos artigos no Planalto (indisponível nesta sessão).

### 3.3 Guias e curadorias que abrem portas

- **Guia de Tecnologias Educacionais (MEC):** reunia tecnologias pré-qualificadas por edital para uso nas escolas públicas. A 2ª edição somava 120 tecnologias [24] [V-B, notícia antiga]. **Não foi encontrado edital ativo de pré-qualificação em 2023–2026** [NV]. Monitorar gov.br/mec e o DOU.
- **MEC, Guia de planejamento para adoção de dispositivos** (1ª ed., jan/2025; volume 1 de uma série sobre aquisições) [25] [V-B]. Indica que o MEC está organizando orientações de compra de tecnologia, e os próximos volumes podem tratar de software.
- **CIEB:**
  - **Nota Técnica 29 (2025)**, matriz de referência para avaliar e selecionar recursos educacionais digitais de **Língua Portuguesa**. Eixos: desenho educacional, critérios tecnológicos, acessibilidade, **evidências** e suporte à implementação [22] [V-B].
  - Nota Técnica "Tecnologias para Alfabetização" (2019) [23] [V-B, só a URL].
  - Plataforma de Evidências e Toolkit de Seleção e Aquisição [22] [V-B].

  **Ação:** preencher a matriz da NT 29 como autoavaliação antes de qualquer conversa com redes. Ela é a "linguagem" que os técnicos das secretarias usam.
- **Estados Unidos (para comparar e para um futuro mercado em inglês):** ESSA *tiers*, Evidence for ESSA, WWC (ver §4) e o *EdTech Quality Indicators Guide* da Digital Promise (2026) [55] [V-D].

### 3.4 Financiadores possíveis

| Financiador | O que foi verificado | Encaixe com o FONEMA | Status |
|---|---|---|---|
| **Fundação Lemann** | Relatório 2024 lista como co-investidores BID, BNDES, Jacobs Foundation, Porticus e outros [28]. Lançou o **impulsiONar EdTech** com BID Lab e Imaginable Futures (US$ 2,36 mi, ≈ R$ 12,4 mi, em 2021), para conectar edtechs a redes públicas, com 50% das vagas para Norte e Nordeste [29] | Alto: alfabetização e redes públicas são o foco histórico | [V-B] (o programa é de 2021; checar nova edição) |
| **Itaú Social** | Edital inédito de **Letramento Matemático na Pré-escola** (2025, apoio da SEB/MEC; até R$ 80 mil por projeto segundo a Agência Brasil); edital FIA (só para conselhos municipais) [30] | Médio: mostra apetite por educação infantil. Acompanhar um possível edital de linguagem ou alfabetização | [V-B] |
| **Todos Pela Educação** | Edital de pesquisa em **ciência da implementação** (dez/2025) [31] | Médio/alto para financiar a **avaliação** de implementação | [V-B] (só a URL; regras [NV]) |
| **Instituto Unibanco** | Atuação histórica no ensino médio e na gestão [NV] | Baixo para a alfabetização | [NV] |
| **BNDES** | Aparece como co-investidor da Lemann [28]. Linhas específicas para edtech não foram verificadas | Possível via fundos de impacto ou co-investimento | [NV] |
| **Gates Foundation** | Programa global de educação focado em África Subsaariana e Índia. Doação ao Global Schools Forum para troca entre organizações de alfabetização e numeracia (FLN) de Índia, África do Sul, Quênia e **Brasil** [32] | Baixo para financiamento direto. Útil para rede e evidência | [V-B] |
| **Jacobs Foundation** | Artigo "Evidence in EdTech" (2025): compras públicas usam cada vez mais os níveis de evidência ESSA, e as empresas têm interesse em subir de nível [33]. É co-investidora da Lemann [28] | Médio: interesse em evidência de edtech e aprendizagem | [V-B] |
| **BID Lab / Imaginable Futures** | Co-financiadores do impulsiONar [29] | Médio | [V-B] |
| **MEC, Sandbox de IA** | Ambiente de teste, sem recursos [21] | Legitimidade regulatória para o reconhecimento de fala e a Sofia | [V-B] |

### 3.5 Recomendação de modelo e sequência

**Modelo: "B2G-led híbrido".** A missão é a criança pública. Quem paga em escala é a rede. O B2C financia o começo, gera marca e dados, e prova engajamento.

| Fase | Período sugerido | Foco | Receita/financiamento | Marco de saída |
|---|---|---|---|---|
| 0. Beta fechado | 1º sem. 2027 | 200 a 500 famílias e 3 a 5 turmas (usabilidade, §4 fase 1) | Recursos próprios; edital de fundação | Retenção D30, tempo útil por sessão, ganhos em pré e pós-teste |
| 1. Lançamento B2C + B2B | 2º sem. 2027 | App freemium pt-BR; 5 a 20 escolas privadas | Assinaturas; licenças B2B | NPS dos pais; conversão; custo de voz e ASR por criança |
| 2. Pilotos públicos | 2027–2028 | 2 a 4 municípios via CPSI ou cooperação financiada | CPSI; filantropia | Estudo quase-experimental (ESSA 3); relatório CIEB NT 29 |
| 3. RCT independente | ano letivo de 2028 | 60 a 100 turmas (§4) | Fundação + parceiro acadêmico | Resultado pré-registrado publicado, positivo ou não |
| 4. Escala B2G | 2029+ | Pregão com ARP; caronas; programas estaduais | Contratos plurianuais | 60 a 300 mil alunos |

Atenção ao calendário: os mandatos municipais vão de 2025 a 2028. **Eleição municipal em 2028 e troca de gestão em 2029** [NV, calendário constitucional]. Contratos fechados em 2027–2028 precisam sobreviver à transição, o que reforça a necessidade de **evidência pública e adesão dos professores**.

### 3.6 Faixa de preço sugerida (hipóteses a validar)

| Produto | Preço-hipótese | Âncoras | Como validar |
|---|---|---|---|
| B2C gratuito | Trilha central limitada por dia, **sem anúncios e sem compras dirigidas à criança** (exigência ética e do ECA Digital [27]) | Khan Kids gratuito (doc 04); Lingokids com versão gratuita limitada [15] | Retenção e conversão |
| B2C Premium mensal | **R$ 24,90–29,90** | Lingokids R$ 59,90 [15]; GraphoGame R$ 24,90 [16] | Teste A/B; pesquisa van Westendorp com 300 ou mais pais |
| B2C Premium anual | **R$ 179–229** (até 3 crianças) | Lingokids R$ 289/ano [15] | Idem |
| B2B escola privada | **R$ 60–120/aluno/ano** + painel do professor | Sem âncora verificada [NV] | 10 entrevistas com mantenedoras; carta de intenção |
| B2G licença | **R$ 25–50/aluno/ano** | VAAF-MIN do Fundeb 2025 ≈ R$ 5,4–5,7 mil/aluno [26]: R$ 40 ≈ 0,7% | Pesquisar preços registrados em ARPs de plataformas digitais (Compras.gov.br, PNCP) [NV: não localizados nesta sessão] |
| B2G formação e implantação | Item separado, por professor ou por polo | — | Orçar com base no custo real de formação |

**Regra de ouro de *unit economics*:** o custo variável de TTS e ASR por criança/ano precisa ficar **bem abaixo de R$ 10** para o B2G a R$ 25–50 funcionar. Medir isso já no beta. O doc 03 trata de tecnologia, e o 22 de ASR infantil.

---

## 4. Plano de validação de impacto

### 4.1 Referências de rigor

- **ESSA (Every Student Succeeds Act, EUA): 4 níveis de evidência** [34]:

  | Nível | Desenho exigido |
  |---|---|
  | 1, *strong* | Experimento randomizado bem conduzido |
  | 2, *moderate* | Quase-experimento |
  | 3, *promising* | Estudo correlacional com controle estatístico |
  | 4, *demonstrates a rationale* | Lógica de intervenção fundamentada |

  O WWC define os padrões dos níveis 1 e 2. A Evidence for ESSA atualizou os próprios padrões em 2026 [35]. Detalhes do guia oficial do Departamento de Educação dos EUA: [NV] (não acessado).
- **Viés de método:** efeitos são inflados em estudos pequenos, com medidas feitas pelo próprio pesquisador e em quase-experimentos (Cheung & Slavin, 2016) [40]. Para leitura com tecnologia, as sínteses de Cheung & Slavin (2012, 2013) mostram efeitos modestos em média [41][42].
- **Como interpretar o tamanho de efeito:** Kraft (2020) propõe referências para estudos causais com medidas padronizadas [39]. Os limiares de que lembramos são < 0,05 pequeno, 0,05–0,20 médio e ≥ 0,20 grande [NV quanto aos números exatos; conferir no artigo].
- **Evidência de tecnologia em países de renda média e baixa:**
  - aprendizagem personalizada com tecnologia: Major et al., 2021 [49];
  - revisões de Rodriguez-Segura, 2021 [46] e Escueta et al., 2020 [47];
  - Mindspark, na Índia: Muralidharan et al., 2019 [48];
  - apps em RCT: Outhwaite et al., 2019 [50].
- **Alfabetização inicial assistida por computador:** meta-análises de Verhoeven et al. (2020, pré-escola; 2022, anos iniciais) [44][45]. GraphoGame com cautelas de implementação: McTigue et al. [43].
- **Brasil:**
  - **Escribo Play.** RCT com 749 crianças, 62 turmas e 17 escolas: leitura d = 0,40 e escrita d = 0,20 [36]. Estudo com crianças de baixa renda: leitura d = 0,67 e escrita d = 0,36 [37]. Análise dos dados de jogo [38]. **Ressalva:** os estudos são liderados pelo criador do produto [V-B].
  - Quatro pilares de um app educativo (Hirsh-Pasek et al., 2015) [51]: aprendizagem ativa, engajada, significativa e socialmente interativa.
  - Guia de prática do WWC para habilidades fundamentais (Foorman et al., 2016) [52].
  - Guia para redes avaliarem a evidência de edtech (CRRE, 2017) [53].
  - Como as redes compram edtech (Morrison et al., 2019) [54].
  - Ensaio adaptativo SMART (Kim et al., 2019) [56].

### 4.2 Fases

| Fase | Objetivo | Desenho | Amostra indicativa | Medidas | Nível ESSA |
|---|---|---|---|---|---|
| **F0, lógica de intervenção** (mês 0–2) | Teoria de mudança: dose (por exemplo, 15 min/dia, 4×/semana), mecanismos (consciência fonêmica → correspondência grafema-fonema → decodificação → fluência), resultados | Documento + revisão por especialistas | — | — | 4 |
| **F1, usabilidade e viabilidade** (mês 2–6) | A criança de 4–8 anos usa sozinha? A voz e o ASR funcionam com sotaques regionais? | Testes moderados + telemetria | 30 a 60 crianças em 3 regiões | Taxa de conclusão; erros de ASR por sotaque; tempo útil | — |
| **F2, piloto quase-experimental** (1 semestre letivo) | Sinal de efeito e fidelidade de implementação | Pré e pós-teste com grupo de comparação pareado (escolas semelhantes, PSM) | 2 a 4 municípios, 20 a 40 turmas | Teste padronizado independente: consciência fonológica, conhecimento de letras, leitura de palavras e pseudopalavras, fluência (palavras corretas por minuto) | 3 (2 se o pareamento for robusto) |
| **F3, RCT por conglomerado** (1 ano letivo) | Efeito causal | Randomização por turma ou escola, estratificada por município e pré-teste; avaliador **externo** (universidade); **pré-registro** (OSF ou AEA RCT Registry) | 60 a 100 turmas (ver §4.3) | As mesmas medidas da F2 + avaliação estadual alinhada ao Saeb ou ICA, quando houver | **1** |
| **F4, escala e custo-efetividade** | O efeito se mantém sem a equipe do FONEMA? | Monitoramento em larga escala + análise de custo por desvio-padrão | Redes contratantes | Custo por aluno; efeito por R$ | — |

### 4.3 Poder estatístico (exemplo ilustrativo, estimativa FONEMA)

A fórmula padrão do efeito mínimo detectável (MDES) para conglomerados é:

MDES ≈ M × √[ (1 / (P(1−P)J)) × (ICC(1−R²₂) + (1−ICC)(1−R²₁)/n) ]

com M ≈ 2,8 (α = 0,05 bicaudal, poder de 80%), P = 0,5, n = 20 crianças por turma e ICC = 0,15 (valor típico de suposição [NV]; calibrar com dados do piloto).

| Turmas (J) | Sem covariável | Com pré-teste (R² = 0,5 nos dois níveis) |
|---|---|---|
| 60 | ≈ 0,32 DP | ≈ 0,22 DP |
| 100 | ≈ 0,25 DP | ≈ 0,17 DP |

**Conclusão:** para detectar efeitos da ordem do Escribo em escrita (≈ 0,2) [36], planeje **cerca de 80 a 100 turmas (≈ 1.600 a 2.000 crianças) com pré-teste**. Refaça o cálculo com software próprio (PowerUp!, Optimal Design) e com o ICC observado na F2.

### 4.4 Boas práticas de credibilidade

1. **Pré-registrar** hipóteses, resultados primários e análise antes de coletar dados.
2. **Usar medidas independentes**, não só os dados do próprio jogo. Os dados do jogo são secundários [40].
3. **Avaliador externo** e compromisso de **publicar o resultado, mesmo nulo**.
4. Medir **fidelidade e dose**: minutos por semana e lições concluídas. Relatar o efeito por quem cumpriu a dose (análise *CACE*) além do efeito por intenção de tratar (*ITT*).
5. **Ética:** aprovação em comitê de ética (sistema CEP/Conep; para ciências humanas e sociais, Res. CNS 510/2016 [NV]). Consentimento dos pais e assentimento da criança. **LGPD art. 14** (dados de crianças exigem consentimento específico de um dos pais [NV, texto não aberto]). A **voz** é dado pessoal e pode virar dado biométrico se usada para identificar a criança. Não usar a voz para identificar e minimizar a retenção dos áudios (doc 05 e doc 22).
6. **Não prometer "nota Saeb".** Relatórios podem falar em "estimativa de trajetória até os 743 pontos" (doc 02).
7. Preencher a **matriz CIEB NT 29** [22] e organizar um dossiê de evidência no padrão ESSA para redes e fundações.

### 4.5 Métricas do painel de impacto (produto + negócio)

| Tipo | Métricas |
|---|---|
| Aprendizagem | Ganho em consciência fonêmica, conhecimento de letras, decodificação e palavras corretas por minuto; % no caminho da "criança alfabetizada" |
| Engajamento saudável | Minutos/semana no intervalo-alvo, sem incentivar uso excessivo; retenção D7 e D30; conclusão de lições |
| Equidade | Efeito por região, sexo, renda e crianças com dificuldade; desempenho do ASR por sotaque |
| Negócio | CAC, LTV, conversão freemium → premium, churn, custo de voz e ASR por criança, receita por aluno B2G |

---

## 5. Riscos e mitigações

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | **Ciclo de venda pública lento** e troca de gestão (eleição de 2028) | Alta | Alto | Diversificar com B2C e B2B; CPSI para pilotos; evidência pública; adesão dos professores; atas com carona |
| 2 | **Contestação jurídica** (inexigibilidade questionada por tribunal de contas, impugnação de edital) | Média | Alto | Preferir pregão com ARP; parecer jurídico; termos de referência com requisitos objetivos [17][18] |
| 3 | **Concorrentes gratuitos ou subsidiados** (programas federais, EduEdu, apps genéricos) e players com evidência (Escribo) [36] | Alta | Médio | Diferenciar com voz que escuta, livros decodificáveis pt-BR, relatórios BNCC/ICA e avaliação independente |
| 4 | **RCT com resultado nulo ou pequeno** | Média | Alto | F1 e F2 bem feitas antes; dose adequada; pré-registro; publicar e iterar. Resultado nulo bem feito ainda dá credibilidade |
| 5 | **Conformidade com LGPD e ECA Digital** (Lei 15.211/2025, vigente desde 17/03/2026; art. 20 proíbe *loot boxes*; art. 22 proíbe perfilamento publicitário; fiscalização pela ANPD) [27] | Média | Alto | Privacidade por padrão; sem anúncios; sem compras dentro do app voltadas à criança; consentimento parental; DPIA; áudio processado com retenção mínima |
| 6 | **Custo de TTS e ASR** inviabiliza preço B2G | Média | Alto | Medir no beta; cache de áudio pré-gerado para a Sofia; ASR no dispositivo quando possível |
| 7 | **Infraestrutura**: escolas sem dispositivos ou internet; famílias com pacote de dados limitado | Alta | Médio | Modo offline; app leve; uso em casa no modelo B2G2C; kits impressos complementares |
| 8 | **Queda demográfica** (−12,6% de até 14 anos entre 2010 e 2022) [1] | Certa | Baixo/médio | Crescer por penetração, receita por aluno e reforço até o 3º–5º ano (recomposição) |
| 9 | **Capital de risco escasso** [10][11] | Alta | Médio | Filantropia + receita; captação só depois da F2 |
| 10 | **Dependência das lojas de apps** (taxas, políticas para apps infantis) | Média | Médio | Versão web/PWA; venda B2B e B2G fora da loja |
| 11 | **Promessa exagerada** ("alfabetiza em X dias", "nota Saeb") | Média | Alto (reputação) | Comunicação baseada em evidência; revisão por especialistas |
| 12 | **Números de mercado frágeis** em pitch [14] | Alta | Médio | Usar dados do Inep e do IBGE; tratar o TAM global como [NV] |

---

## 6. Tabela de referências

Legenda: **[V-D]** verificado direto (Crossref/ERIC); **[V-B]** verificado por trecho indexado na busca, com URL; **[NV]** não verificado.

| # | Autor/Instituição | Ano | Título | Tipo | URL/DOI | Status | O que aproveitar |
|---|---|---|---|---|---|---|---|
| 1 | IBGE, Agência de Notícias | 2023 | Censo 2022: população por idade e envelhecimento | Notícia oficial | https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-denoticias/noticias/38186- | V-B | Até 14 anos: 45,9 mi → 40,1 mi (−12,6%) |
| 1b | Pref. São Paulo (ObservaSampa) | s.d. | Nota técnica com base no Censo 2022 | Nota técnica | https://dados-abertos-observasampa.prefeitura.sp.gov.br/Conteudo/DisplayPDF/139 | V-B | 0–6 anos: −7,7% entre 2010 e 2022 |
| 2 | IBGE | 2024 | Anuário Estatístico do Brasil, tab. s2t1102 | Estatística oficial | https://anuario.ibge.gov.br/images/aeb/2024/s2/2_pdf/s2t1102.pdf | V-B | 0–4 anos ≈ 12,7 mi; 5–9 anos ≈ 13,7 mi (conferir no SIDRA) |
| 3 | Inep | 2025 | Censo Escolar 2024, apresentação coletiva | Estatística oficial | https://download.inep.gov.br/censo_escolar/resultados/2024/apresentacao_coletiva.pdf | V-B | 47,1 mi de matrículas; 179,3 mil escolas; 20,2% privada |
| 4 | Inep | 2025 | Notas Estatísticas, Censo da Educação Básica 2024 (cópia UFAM) | Estatística oficial | https://cefort.ufam.edu.br/repositoriocp/wp-content/uploads/tainacan-items/71/3943/notas_estatisticas_censo_da_educacao_basica_2024.pdf | V-B | EF = 26 mi; municipal = 69,7% dos anos iniciais; ≈ 9,5 mi privadas |
| 5 | Cenpec | 2025 | Censo Escolar: desigualdades na Educação Infantil | Estudo | https://www.cenpec.org.br/wp-content/uploads/2025/05/Cenpec_Censo_Escolar_Desigualdades-na-Ed.-Infantil.pdf | V-B | Atendimento de 92,9% aos 4–5 anos |
| 6 | Folha de Pernambuco | 2025 | Censo do MEC mostra creche e pré-escola estagnadas | Imprensa | https://www.folhape.com.br/noticias/censo-do-mec-mostra-creche-e-pre-escola-estagnadas-e-avanco-do/403429/ | V-B | Pré-escola ≈ 5,30 mi (2024) |
| 7 | Todos Pela Educação | 2026 | Nota técnica: Indicador Criança Alfabetizada 2025 | Nota técnica | https://todospelaeducacao.org.br/wordpress/wp-content/uploads/2026/03/nota-tecnica-indicador-crianca-alfabetizada-2025-todos-pela-educacao.pdf | V-B | ICA 2025 = 66%; PR, GO e CE ≈ 80% |
| 8 | Agência Gov | 2025 | 58% dos municípios melhoraram a alfabetização | Notícia oficial | https://agenciagov.ebc.com.br/noticias/202507/58-dos-municipios-melhoraram-alfabetizacao | V-B | ICA 2024 = 59,2% |
| 9 | CETIC.br / NIC.br | 2025 | TIC Kids Online Brasil 2024, resumo executivo | Pesquisa | https://cetic.br/media/docs/publicacoes/2/20250512154015/tic_kids_online_2024_resumo_executivo.pdf | V-B | 23% com 1º acesso antes dos 6 anos |
| 10 | Distrito, via Startups.com.br | 2024 | Brasil lidera mercado LatAm de edtechs (US$ 475 mi em 10 anos) | Relatório/imprensa | https://startups.com.br/pesquisas/brasil-lidera-mercado-latam-de-edtechs-e-movimenta-us-475m-em-10-anos/ | V-B | ≈ 70% das edtechs da LatAm; US$ 475,6 mi em 280 rodadas; desaceleração |
| 11 | Bloomberg Línea (dados Sling Hub) | 2026 | Captação de startups no Brasil cai 13% em 2025 | Imprensa | https://www.bloomberglinea.com.br/startups/rodadas-da-semana-captacao-de-startups-no-brasil-cai-13-para-us-45-bi-em-2025/ | V-B | VC 2025 = US$ 4,5 bi; juros altos |
| 12 | Deloitte/Abstartups, via Suno | 2022 | Número de edtechs cresce 44% em dois anos | Imprensa | https://www.suno.com.br/noticias/numero-edtechs-cresce-estudo-deloitte-abstartups/ | V-B | 813 edtechs |
| 12b | Forbes Brasil | 2026 | Edtechs brasileiras em fase de escala | Imprensa | https://forbes.com.br/geral/2026/07/edtechs-brasileiras-fase-escala/ | V-B | 368 edtechs no Mapeamento 2025 (outra base) |
| 13 | CIEB e Abstartups | 2020 | Mapeamento Edtech 2019 | Relatório | https://cieb.net.br/wp-content/uploads/2020/04/Mapeamento-Edtech_CIEB-e-Abstartups-2019.pdf | V-B | 364 (2018) e 449 (2019) edtechs |
| 14 | Marketintelo | 2025 | Children's Literacy Apps Market Report 2034 | Relatório de mercado pago | https://marketintelo.com/report/childrens-literacy-apps-market/amp | **NV** | US$ 5,8 bi; CAGR de 17,3%. Só como ordem de grandeza |
| 15 | Lingokids, App Store BR | 2026 | Lingokids: Aprenda em inglês | Loja | https://apps.apple.com/BR/app/id1002043426 | V-B | R$ 59,90/mês; R$ 289/ano |
| 16 | GraphoGame, App Store BR | 2026 | GraphoGame Brasil | Loja | https://apps.apple.com/BR/app/id1540637587 | V-B | R$ 24,90; virou pago depois de mais de 3 mi de downloads |
| 17 | TCU | s.d. | Licitações e Contratos, 5.10.1.1 Fornecedor exclusivo | Manual oficial | https://licitacoesecontratos.tcu.gov.br/5-10-1-1-fornecedor-exclusivo-inciso-i/ | V-B | Requisitos da inexigibilidade (art. 74, I) |
| 17b | Zênite | s.d. | TCE-MG: patente por si só não justifica exclusividade | Doutrina | https://zenite.blog.br/tce-mg-registro-de-patente-por-si-so-nao-justifica-a-exclusividade-na-contratacao-por-inexigibilidade/ | V-B | Cautela com inexigibilidade |
| 18 | TCU | s.d. | Licitações e Contratos, 5.9.4 Sistema de Registro de Preços | Manual oficial | https://licitacoesecontratos.tcu.gov.br/5-9-4-sistema-de-registro-de-precos-2/ | V-B | Carona de até 50% por órgão; vedação de adesão federal a atas de outras esferas |
| 19 | Justen; Conlicitação; Unipampa | 2025–26 | Valores da Lei 14.133 (Dec. 12.343/2024 e 12.807/2025) | Doutrina/norma | https://justen.com.br/artigo_pdf/atualizacoes-nos-valores-da-lei-14-133-2021-com-a-publicacao-do-decreto-12-343-2024/ ; https://sites.unipampa.edu.br/propladi/files/2026/01/decreto-12-807-2025-limites-dispensa-2026.pdf | V-B | Dispensa (compras): R$ 62.725,59 (2025); R$ 65.492,11 (2026) |
| 20 | Effecti; Seti-PR; Enap | 2022–26 | CPSI, Marco Legal das Startups (LC 182/2021) | Doutrina/casos | https://effecti.com.br/contrato-publico-startup-cpsi/ ; https://repositorio.enap.gov.br/jspui/bitstream/1/6703/122/2026-Casos-Oficina-CPSI-PGE-SP-GNOVA.pdf | V-B | Até R$ 1,6 mi; 12+12 meses; fornecimento 24+24 meses, até 5× |
| 21 | MEC | 2025 | Edital do Sandbox Regulatório de IA na Educação | Edital | https://www.gov.br/mec/pt-br/acesso-a-informacao/participacao-social/editais-chamamento-publico/sandbox-ia-educacao/documentos/edital-sandbox.pdf | V-B | Teste supervisionado de IA, sem recursos públicos |
| 22 | CIEB | 2025 | Notas Técnicas 29: REDs, matriz de avaliação e seleção em Língua Portuguesa | Nota técnica | https://cieb.net.br/wp-content/uploads/2025/12/CIEB-Notas-Tecnicas-29-Recursos-educacionais-digitais-pedagogicos-matriz-de-referencia-para-avaliacao-e-selecao-na-area-de-Lingua-Portuguesa.pdf | V-B | Checklist de autoavaliação para redes |
| 23 | CIEB | 2019 | Nota Técnica: Tecnologias para Alfabetização | Nota técnica | https://cieb.net.br/wp-content/uploads/2019/06/Nota-T%C3%A9cnica-Tecnologias-para-Alfabetizacao-final.pdf | V-B (só URL) | Ler na íntegra |
| 24 | Baguete (sobre o MEC) | ~2011 | MEC: foco na TI educativa (Guia de Tecnologias Educacionais) | Imprensa | https://www.baguete.com.br/noticias/mec-foco-na-ti-educativa | V-B | Histórico da pré-qualificação; 120 tecnologias na 2ª edição |
| 25 | MEC | 2025 | Guia de planejamento para adoção de dispositivos | Guia oficial | https://www.gov.br/mec/pt-br/escolas-conectadas/arquivos/guia-planej-adocao-dispositivos.pdf | V-B | Série de orientações de compra de tecnologia |
| 26 | Agência Gov | 2025 | Portaria aumenta estimativa de complementação do Fundeb | Notícia oficial | https://agenciagov.ebc.com.br/noticias/202505/portaria-aumenta-estimativa-de-complementacao-para-o-fundeb-1 | V-B (valores divergem entre fontes) | VAAF-MIN 2025 ≈ R$ 5.448 → 5.699 |
| 27 | Mattos Filho; Congresso em Foco; Demarest | 2025–26 | ECA Digital (Lei 15.211/2025) | Análise jurídica | https://www.mattosfilho.com.br/unico/eca-digital-sancionada-lei/ ; https://www.congressoemfoco.com.br/noticia/117235/eca-digital-entra-em-vigor-o-que-muda-com-a-nova-lei | V-B | Vigência em 17/03/2026; art. 20 (*loot boxes*); art. 22 (perfilamento); ANPD |
| 28 | Fundação Lemann | 2025 | Relatório Anual 2024, governança e co-investidores | Relatório | https://relatorioanual2024.fundacaolemann.org.br/en/governance/ | V-B | Jacobs, BNDES e BID como co-investidores |
| 29 | Global EdTech (sobre BID Lab, Lemann e Imaginable Futures) | 2021 | impulsiONar EdTech programme | Imprensa | https://global-edtech.com/?p=16627 | V-B | US$ 2,36 mi; edtech + redes públicas |
| 30 | Agência Brasil; Itaú Social | 2025 | Projetos de matemática na pré-escola podem receber até R$ 80 mil | Imprensa/edital | https://agenciabrasil.ebc.com.br/educacao/noticia/2025-05/projetos-de-matematica-na-pre-escola-podem-receber-ate-r-80-mil | V-B | Apetite por educação infantil |
| 31 | Todos Pela Educação | 2025 | Edital de pesquisa em ciência da implementação | Edital | https://todospelaeducacao.org.br/wordpress/wp-content/uploads/2025/12/edital-regulamento-pesquisa-ciencia-implementacao.pdf | V-B (só URL) | Possível financiamento da avaliação |
| 32 | Gates Foundation | 2024 | Committed grant INV-069606: Global Schools Forum | Base de doações | https://gatesfoundation.org/about/committed-grants/2024/10/inv-069606 | V-B | Rede de FLN que inclui o Brasil |
| 33 | Jacobs Foundation | 2025 | Evidence in EdTech | Artigo | https://jacobsfoundation.org/wp-content/uploads/2025/03/Evidence-in-EdTech-article.pdf | V-B | Níveis ESSA como argumento de compra |
| 34 | California Dept. of Education | s.d. | ESSA evidence tiers | Guia oficial (estadual) | https://www.cde.ca.gov/re/es/evidence.asp | V-B | Definição dos níveis 1 a 4 |
| 35 | Evidence for ESSA (JHU) | 2026 | Standards and Procedures Update | Padrão | https://www.evidenceforessa.org/wp-content/uploads/2026/08/Standards-and-Procedures-Update-FINAL-08-26-26.pdf | V-B | Critérios atuais de classificação |
| 36 | Amorim, A. N. et al. | 2020 | Using Escribo Play Video Games to Improve Phonological Awareness, Early Reading, and Writing in Preschool | RCT (*Educational Researcher*) | https://doi.org/10.3102/0013189x20909824 (ERIC EJ1250596) | **V-D** | n = 749; d = 0,40 em leitura e 0,20 em escrita (efeitos [V-B]) |
| 37 | Amorim, A. N. et al. | 2022 | Escribo play learning games can foster early reading and writing for low-income kindergarten children | RCT (*Computers & Education*) | https://doi.org/10.1016/j.compedu.2021.104364 | **V-D** | d = 0,67 em leitura e 0,36 em escrita (efeitos [V-B]) |
| 38 | da Silva, … et al. | 2022 | Game learning analytics can unpack Escribo play effects in preschool early reading and writing | Artigo (*Computers & Education Open*) | https://doi.org/10.1016/j.caeo.2021.100066 | **V-D** | Uso de dados de jogo como resultado secundário |
| 39 | Kraft, M. A. | 2020 | Interpreting Effect Sizes of Education Interventions | Metodologia (*Educational Researcher*) | https://doi.org/10.3102/0013189x20912798 | **V-D** | Referências de tamanho de efeito |
| 40 | Cheung, A.; Slavin, R. | 2016 | How Methodological Features Affect Effect Sizes in Education | Meta-pesquisa (*Educational Researcher*) | https://doi.org/10.3102/0013189x16656615 | **V-D** | Viés de amostra pequena e de medida própria |
| 41 | Cheung, A.; Slavin, R. | 2013 | Effects of Educational Technology Applications on Reading Outcomes for Struggling Readers | Síntese (*RRQ*) | https://doi.org/10.1002/rrq.50 | **V-D** | Efeito médio de tecnologia em leitura |
| 42 | Cheung, A.; Slavin, R. | 2012 | How features of educational technology applications affect student reading outcomes | Meta-análise (*Educational Research Review*) | https://doi.org/10.1016/j.edurev.2012.05.002 | **V-D** | Características que moderam o efeito |
| 43 | McTigue, E. et al. | 2019/2020 | Critically Reviewing GraphoGame Across the World | Revisão (*RRQ*) | https://doi.org/10.1002/rrq.256 | **V-D** | Cautelas de implementação |
| 44 | Verhoeven, L. et al. | 2020 | Computer-supported early literacy intervention effects in preschool and kindergarten | Meta-análise (*Educational Research Review*) | https://doi.org/10.1016/j.edurev.2020.100325 | **V-D** | Benchmark de efeito na pré-escola |
| 45 | Verhoeven, L. et al. | 2022 | Computer-assisted word reading intervention effects throughout the primary grades | Meta-análise (*Educational Research Review*) | https://doi.org/10.1016/j.edurev.2022.100486 | **V-D** | Benchmark nos anos iniciais |
| 46 | Rodriguez-Segura, D. | 2021 | EdTech in Developing Countries: A Review of the Evidence | Revisão (*World Bank Research Observer*) | https://doi.org/10.1093/wbro/lkab011 | **V-D** | O que funciona em países de renda média e baixa |
| 47 | Escueta, M. et al. | 2020 | Upgrading Education with Technology: Insights from Experimental Research | Revisão (*JEL*) | https://doi.org/10.1257/jel.20191507 | **V-D** | Síntese de experimentos com tecnologia |
| 48 | Muralidharan, K. et al. | 2019 | Disrupting Education? Experimental Evidence on Technology-Aided Instruction in India | RCT (*AER*) | https://doi.org/10.1257/aer.20171112 | **V-D** | Personalização adaptativa |
| 49 | Major, L. et al. | 2021 | The effectiveness of technology-supported personalised learning in low- and middle-income countries | Meta-análise (*BJET*) | https://doi.org/10.1111/bjet.13116 | **V-D** | Efeito de personalização |
| 50 | Outhwaite, L. et al. | 2019 | Raising early achievement in math with interactive apps: A randomized control trial | RCT (*J. Educ. Psychol.*) | https://doi.org/10.1037/edu0000286 | **V-D** | Modelo de RCT de app na escola |
| 51 | Hirsh-Pasek, K. et al. | 2015 | Putting Education in "Educational" Apps | Revisão (*PSPI*) | https://doi.org/10.1177/1529100615569721 | **V-D** | Quatro pilares de um app educativo |
| 52 | Foorman, B. et al. (WWC) | 2016 | Foundational Skills to Support Reading for Understanding in K–3 | Guia de prática | ERIC ED566956 | **V-D** | Recomendações com nível de evidência |
| 53 | CRRE / Johns Hopkins | 2017 | Evaluating Evidence for Ed-Tech Product Effectiveness: Guidelines for School Districts | Guia | ERIC ED573715 | **V-D** | Como redes leem evidência |
| 54 | Morrison, J. R. et al. | 2019 | From the Market to the Classroom: How Ed-Tech Products Are Procured by School Districts | Artigo (*ETR&D*) | ERIC EJ1208098 | **V-D** | Processo de compra das redes |
| 55 | Digital Promise | 2026 | EdTech Quality Indicators Guide | Guia | ERIC ED682393 | **V-D** | Indicadores de qualidade para compra |
| 56 | Kim, J. S. et al. | 2019 | Using a SMART to Develop an Adaptive K-2 Literacy Intervention | RCT adaptativo (*AERA Open*) | ERIC EJ1229662 | **V-D** | Desenho para otimizar dose e adaptação |
| 57 | U.S. Dept. of Education | 2016/2023 | Non-Regulatory Guidance: Using Evidence to Strengthen Education Investments | Guia oficial | — | **NV** | Texto oficial dos níveis ESSA (não acessado) |
| 58 | Brasil | 2018 | LGPD (Lei 13.709/2018), art. 14 | Lei | — | **NV** | Consentimento parental (texto não aberto nesta sessão) |
| 59 | CNS | 2016 | Resolução 510/2016 (ética em ciências humanas e sociais) | Norma | — | **NV** | Rito ético do RCT |

**Contagem:** 21 fontes **[V-D]**, 37 fontes **[V-B]** e 4 itens **[NV]** (14, 57, 58, 59), além de afirmações [NV] marcadas no texto.

## 7. Pendências para a próxima rodada

1. Abrir as **Sinopses Estatísticas do Inep 2024/2025** e tirar o total de matrículas dos anos iniciais e da pré-escola por rede.
2. Abrir o **SIDRA/IBGE** e tirar a população por idade simples de 4 a 8 anos.
3. Ler no Planalto o texto literal dos arts. 74, 75, 82–86 da Lei 14.133, dos arts. 13–15 da LC 182/2021 e dos arts. 14 da LGPD e 20/22 da Lei 15.211.
4. Pesquisar no **PNCP e no Compras.gov.br** preços registrados em ARPs de "plataforma digital de alfabetização" para calibrar o preço B2G.
5. Verificar se há **edital vigente do Guia de Tecnologias Educacionais** ou nova pré-qualificação do MEC.
6. Confirmar editais abertos de Lemann, Itaú Social, TPE e BID Lab em 2027.
7. Pesquisa de disposição a pagar (van Westendorp) com pais de crianças de 4 a 7 anos, segmentada por classe.
