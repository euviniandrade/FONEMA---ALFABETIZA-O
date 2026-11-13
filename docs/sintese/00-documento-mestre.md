# FONEMA — Documento Mestre (Especificação Consolidada v1)

> **Base comum das 5 propostas de execução.** Data: 13/11/2026. Versão: v1.
> **Fontes:** sínteses [Bloco A](bloco-A-01-15.md), [Bloco B](bloco-B-16-25.md), [Bloco C](bloco-C-26-31.md) e [Bloco D](bloco-D-32-43.md); decisões do dono [001](../decisoes/001-jornada-e-modelo-de-precos.md), [002](../decisoes/002-economia-virtual-avatar-educacao-financeira.md), [003](../decisoes/003-formacao-integral-e-aprendizagem-profunda.md) e [004](../decisoes/004-termometro-alfabetizacao-e-proxima-fase.md); [bibliografia validada](../bibliografia/README.md). Os relatórios completos estão em `docs/pesquisa/` (índice na seção 10).
>
> **Regras deste documento**
> 1. **As decisões do dono prevalecem** sobre os relatórios. Quando uma decisão contraria uma recomendação da pesquisa, a decisão vale e as **salvaguardas** da pesquisa passam a ser obrigatórias.
> 2. **Nada foi acrescentado às fontes.** Os números e as referências vêm dos blocos e dos relatórios. Quando este documento *propõe* uma reconciliação, aparece a marca **[proposta de síntese]**.
> 3. Quase todos os parâmetros de produto (durações, limiares, preços, metas) são **hipóteses a calibrar em piloto**, como os próprios relatórios dizem.
> 4. Itens que precisam de confirmação do dono aparecem como **[aguardando confirmação do dono]**. Itens que precisam de parecer jurídico aparecem como **⚖️**.
>
> **Legenda de evidência:** **A** = meta-análise, revisão sistemática ou ECR replicado · **B** = ECR isolado, longitudinal ou quase-experimento · **C** = correlacional, neuroimagem, documento oficial ou revisão narrativa · **D** = fonte de fabricante, fonte secundária ou proposta de relatório. **Status de verificação:** "verificada" = conferida em Crossref/PubMed/ERIC na Etapa 2; "não checável" = domínio bloqueado na sessão, o que **não** indica fonte falsa; "[NV]" = não verificada.

---

## 1. Sumário executivo

**O que é.** O FONEMA é uma plataforma web e um app que compartilham a mesma conta. Ele ensina crianças brasileiras de 4 a 8 anos a ler e escrever pelo **método fônico sistemático e explícito**, do zero à alfabetização plena, numa jornada de cerca de **2 anos** (Decisão 001). A conta é sempre criada por um **adulto ou por uma instituição** (Decisão 002).

**Por que agora.** Em 2025, 66% das crianças brasileiras estavam alfabetizadas ao fim do 2º ano (Indicador Criança Alfabetizada, corte de 743 pontos no Saeb). A meta nacional é de 80% em 2030. Isso significa **cerca de 0,9 milhão de crianças por ano** que terminam o 2º ano sem estar alfabetizadas (estimativa do rel. 27; números a conferir na fonte oficial). Em inglês, o mercado de apps de leitura é maduro. Em pt-BR, **nenhum concorrente encontrado** reúne fônica sistemática, acabamento de estúdio e leitura em voz alta com reconhecimento de fala (rel. 04; "não encontrado" não significa "não existe").

**O que a ciência exige.** Fônica explícita funciona (d = 0,41; Ehri et al., 2001), mas **não basta sozinha**: precisa de linguagem oral, vocabulário, conhecimento de mundo e escrita. **App sozinho rende perto de zero** (GraphoGame g = −0,02 isolado e 0,48 com muita interação adulta). Por isso o adulto faz parte da intervenção, e o painel do professor e a missão da família fazem parte do produto, não são extras.

**Como o produto funciona (v1).**
- **Mundo aberto com 11 regiões** (biomas brasileiros), uma por etapa da ordem de ensino do PB. A **trilha principal é liberada por domínio, nunca por tempo**. Há missões paralelas geradas por regras a partir de palavras e textos validados, uma vila para construir, colecionáveis, desafios de fim de região e temporadas.
- **Sessão curta com fim natural** (10–12 min aos 4–5 anos; 15–20 min aos 7–8), com revisão espaçada, recuperação ativa, feedback imediato e um ritual de encerramento.
- **Sofia** (mentora, ~9–10 anos, parda, 2D) e **Bolota** (filhote de tatu-bola que aprende com a criança). O recurso de articulação **"Espelho do Som"** mostra boca real, corte lateral e letra sincronizados. O nome "Boquinhas" é marca registrada e não será usado.
- **Reconhecimento de fala** que verifica a leitura contra um alvo conhecido, roda no aparelho e **nunca é juiz**: aceita sotaques e as trocas típicas da idade.
- **Economia de moedinhas fictícias** ganhas só aprendendo, com lojinha cujas etiquetas são palavras decodificáveis, cofrinho com meta e educação financeira leve. Não há dinheiro real, sorteio nem perda.
- **Seis competências**: a alfabetização é a espinha dorsal. Pensamento computacional, raciocínio lógico, inteligência emocional, tecnologia e educação financeira **entram por dentro** das tarefas de leitura.
- **Termômetro da Leitura 0–10** por critério ("Nível 6 de 10: faltam 4"), visto de forma diferente pela criança, pelo responsável, pelo professor e pela rede.
- **Privacidade por arquitetura**: voz no aparelho, câmera fora do MVP, nenhuma inferência de emoção, sem SDK de terceiros, sem anúncios. Conformidade com a LGPD (art. 14) e o ECA Digital (Lei 15.211/2025).
- **Negócio**: **assinatura sempre mensal** e freemium por conquista. A parte gratuita vai até o fim da região R2a (~4–8 semanas pela Decisão 001). Planos: família, escola privada e rede pública, estes dois por aluno/mês.

**O que ainda falta para construir com segurança.** Parecer jurídico (ECA Digital, voz, economia, contratação pública por aluno/mês). Conferência das leis e da BNCC no texto oficial. Validação da ordem dos sons, da Escala 0–10 e da matriz de tolerância de fala com fonoaudiólogos e linguistas. Corpus próprio de fala infantil pt-BR. Piloto com medida externa, braço de controle da economia e coleta de normas brasileiras. A próxima fase (Decisão 004 §2) é **organização e infraestrutura**: monorepo, CI, segurança por padrão e ambientes separados.

---

## 2. O problema e a oportunidade

### 2.1 Números do Brasil

| Indicador | Valor | Fonte (relatório) | Status de verificação |
|---|---|---|---|
| Expectativa da BNCC | Alfabetização até o fim do 2º ano | BNCC (rel. 02) | Conferida só em fontes secundárias |
| Indicador Criança Alfabetizada (ICA), corte | 743 pontos na escala Saeb do 2º ano | Pesquisa Alfabetiza Brasil/Inep (rels. 02, 20) | Não checável (gov.br 404/429) |
| ICA, série | 43,6% (2021) → 56% (2023) → 59,2% (2024; meta 60% não atingida) → 66% (2025; meta 64% superada) | rels. 02, 20, 27 | Não checável; o dado de 2025 vem de nota técnica do Todos pela Educação |
| Meta nacional | 80% em 2030 (CNCA) | rels. 04, 20 | Não checável |
| ICA por UF | Ceará 85,3% (2024); CE, PR e GO ≈ 80% (2025) | rels. 26, 27 | [V-URL]/[V-B]; anos e fontes diferentes, conferir os dois |
| Crianças por ano de idade | ≈ 2,7 milhões (13,7 mi de 5–9 anos; 12,7 mi de 0–4; Censo 2022) | rel. 27 | [V-B] |
| Não alfabetizadas ao fim do 2º ano | ≈ 0,9 milhão por ano (2,7 mi × 34%) | rel. 27 | **Estimativa do relatório** |
| Matrículas na educação básica | 47,1 mi (≈ 20,2% privadas); rede municipal com 69,7% dos anos iniciais | Inep 2024 (rel. 27) | [V-B] |
| Learning poverty | 48% (SAEB 2017, nota de 2019) | Banco Mundial (rel. 19) | Não checável |
| PIRLS 2021 | Brasil 61% "no nível básico" × 19% na África do Sul | rel. 19 | Não checável; conferir o significado exato no relatório da IEA |
| Analfabetismo funcional (15–64 anos) | ~29%; ~42% no Nordeste (analfabeto + rudimentar) | Inaf 2024 (rel. 26) | [V-URL] |
| Internet só pelo celular | ~60% dos usuários | TIC Domicílios 2024 (rel. 26) | [V-URL] |
| Escolas de EF com internet para os alunos | ~48,8% | Censo Escolar 2024 (rel. 26) | [V-URL] |
| Uso de internet pelos alunos | ~27% (rede municipal) × ~67% (estadual) | TIC Educação 2024 (rel. 26) | [V-URL] |
| Desvio fonológico | 15,3% das crianças de 3–8 anos (Santa Maria/RS), ou seja, 2–4 por turma de 25 | Ceron 2017 (rel. 29) | Verificada; amostra só do RS |
| Representatividade (Censo 2022) | Pardos 45,3%; pretos 10,2% | rel. 28 | [V] |

**Leitura.** O problema é grande, é medido por fonte oficial e se concentra na **rede municipal**, que é quem paga em escala. As famílias que mais precisam têm menos escolaridade e menos conectividade. Daí vêm três requisitos: **interface por voz e imagem**, **offline-first** e **aparelho fraco ou compartilhado**.

### 2.2 A oportunidade

1. **Lacuna de produto em pt-BR**: falta um produto que junte fônica sistemática, qualidade de estúdio e "Eu leio, a Sofia escuta" (rel. 04). Os diferenciais D1–D11 do rel. 31 precisam ser revalidados antes de qualquer material comercial.
2. **Evidência como vantagem comercial.** O concorrente brasileiro com melhor evidência é o **Escribo Play**: ECR com 749 crianças, d = 0,40 em leitura e 0,20 em escrita, estudo liderado pelo criador (rels. 04, 27). As redes usam a matriz **CIEB NT 29 (2025)** como linguagem técnica (rel. 27).
3. **Política pública favorável sem método prescrito.** O CNCA (Decreto 11.556/2023) **não prescreve método**. O FONEMA deve se apresentar como "instrução fônica sistemática **alinhada à BNCC**" e como ferramenta do sistema, nunca como "método oficial" (rels. 02, 15, 26).
4. **Os casos de sucesso brasileiros são sistêmicos** (Sobral, PAIC/Ceará): meta no 2º ano, avaliação frequente, material estruturado, formação e incentivo (rel. 26). O produto precisa caber nessa engrenagem.
5. **Contexto de capital escasso**: aportes em edtech caíram 73% em 2023 (rel. 27). Estratégia: **filantropia + receita antes de capital de risco**.

---

## 3. O que a ciência diz — 15 princípios inegociáveis

Cada princípio vale para todo conteúdo, jogo, tela e texto de marketing.

| # | Princípio | Evidência-chave | Nível |
|---|---|---|---|
| P1 | **Fônica sistemática e explícita como núcleo, nunca sozinha.** Código + linguagem oral + vocabulário + leitura com sentido. | Ehri, Nunes, Stahl & Willows 2001: d = 0,41 (0,55 se começa até o 1º ano); Castles, Rastle & Nation 2018; Reading First: ganho em decodificação e **zero** em compreensão (rels. 01, 15) | A |
| P2 | **A unidade de ensino é o fonema ligado à letra.** A sílaba organiza a progressão de complexidade, mas não é a unidade de mapeamento. | Sargiani, Ehri & Maluf 2018: no Brasil, mapeamento fonema-letra com articulação superou o silábico; treino fonológico + letras > só fonológico (Bus & van IJzendoorn 1999; NRP) (rels. 10, 17) | A/B |
| P3 | **Decodificar, não adivinhar.** Pseudopalavras para treinar e medir; mapeamento ortográfico som + letra + significado. | Ehri 2014; Share 1995; Phonics Screening Check (metade pseudopalavras); Yoncheva et al. 2010 (foco no grafema → rede esquerda) (rels. 06, 20, 35) | B/C |
| P4 | **Estímulos multissensoriais congruentes**: som, boca e letra sincronizados, um vídeo por fonema, terminando sempre na letra. | Boyer & Ehri 2011; Castiglioni-Spalten & Ehri 2003; Shams & Seitz 2008 (só funciona com congruência) (rels. 10, 28) | B |
| P5 | **Prática distribuída + recuperação ativa + feedback corretivo imediato.** Revisão no dia seguinte; sem "decoreba em bloco". | Cepeda et al. 2006 (839 comparações); Rowland 2014 (g ≈ 0,50); Seabrook et al. 2005 (3 microssessões > 1 longa em fônica, 5–7 anos); Metcalfe 2017 (rels. 07, 13) | A |
| P6 | **Domínio comprovado**: critério exigente, transferência para formato novo e retenção após dias. Nunca avançar por tempo de uso. | Kulik et al. 1990 (mastery com critério 80–90%); Barnett & Ceci 2002 (transferência rara se não planejada); GraphoLearn: ganho no jogo sem transferência (rels. 20, 30, 35) | A/C |
| P7 | **Dificuldade calibrada em torno de 85% de acerto**, com plano B para quem fica abaixo. | Wilson et al. 2019 (modelo teórico, âncora, não norma infantil); princípio GraphoGame ~80% (rels. 08, 17, 30) | C |
| P8 | **Um foco por tela; animação só quando ensina; nada de "detalhe sedutor".** | Sundararajan & Adesope 2020: g ≈ −0,33; Fisher, Godwin & Seltman 2014 (sala decorada: 38,6% × 28,4% fora da tarefa); Takacs et al. 2015 (hotspots prejudicam) (rels. 09, 28) | A/B |
| P9 | **Erro é informação.** Feedback específico, na tarefa e na estratégia; elogio ao processo; nunca punição. | Kluger & DeNisi 1996 (> 1/3 dos feedbacks pioram o desempenho quando focam o "eu"); Hattie & Timperley 2007; Mueller & Dweck 1998 (rel. 13) | A/B |
| P10 | **A leitura é a recompensa principal.** Recompensa tangível só como consequência de domínio, nunca anunciada antes da tarefa. | Deci, Koestner & Ryan 1999 (recompensa tangível esperada reduz a motivação intrínseca, mais em crianças); Habgood & Ainsworth 2011 (integração intrínseca: 7× mais jogo voluntário) (rels. 08, 30) | A/B |
| P11 | **Adulto no circuito.** O painel do professor e a missão da família fazem parte da intervenção. | McTigue et al.: GraphoGame g = −0,02 sozinho × 0,48 com muita interação adulta; Cheung & Slavin 2013: tecnologia integrada a pequeno grupo 0,32; Sénéchal & Young 2008 (pais ensinando habilidades específicas d ≈ 1,1, valor a revisar) (rels. 01, 26, 30) | A |
| P12 | **Compreensão = decodificação × linguagem.** Linguagem oral, leitura dialógica e conhecimento de mundo em temas coerentes e em espiral. | Gough & Tunmer 1986; Hwang, Cabell & Joyner 2022 (compreensão padronizada 0,25); MORE (transferência mantida 14 meses); Xu et al. 2021 (agente dialógico ≈ adulto) (rels. 21, 39, 41) | A/B |
| P13 | **Escrever junto com ler, desde o dia 1**: escrita inventada com feedback e traçado à mão. | Ouellette & Sénéchal 2008; Alves Martins et al. (inclui crianças do Brasil e de Portugal); Graham & Hebert 2011; Longcamp et al. 2005 (rels. 17, 25, 40) | A/B |
| P14 | **Monitorar, nunca diagnosticar; variação dialetal não é erro.** Sinal só por persistência, só para o adulto, com ação concreta. | Snowling & Melby-Lervåg 2016 (~45% de dislexia com risco familiar × ~12%); Ceron et al. (normas do PB por fonema); diagnóstico é ato privativo do fonoaudiólogo (Lei 6.965/1981) (rels. 11, 29) | A/B |
| P15 | **Sessão curta com fim natural, proteção do sono, zero design manipulativo e zero neuromitos.** | Radesky et al. 2022 (~80% dos apps de 3–5 anos têm design manipulativo); dispositivo à noite OR 2,17 para sono insuficiente; Henderson et al. 2012 (sono consolida palavras); Dekker et al. 2012 (neuromitos) (rels. 04, 07, 15, 42) | A/B |

**Corolários usados na especificação**
- A neurociência sustenta o **método**, não o app. É proibido dizer "comprovado pela neurociência", "treina o cérebro", "ativa o hemisfério X" ou "cura/trata dislexia", e vale a lista das 16 frases proibidas do rel. 15 (Decisão 002: "sem prometer nada").
- "Vício positivo" (Decisão 001) é aceitável **só como meta interna de design**. Na comunicação externa, o termo é "vontade de voltar", e a métrica é retorno voluntário + encerramento tranquilo + progresso real (rels. 04, 08, 15).

---

## 4. Especificação consolidada v1

### 4.1 Público e perfis

**Criança (4–8 anos).** Nunca cria conta, nunca paga, nunca vê oferta de compra (D002). É um **perfil dentro da conta do adulto**, sem dados desnecessários. Há trilhas por idade, que mudam a **entrada e o ritmo**, não o objetivo (rel. 14):

| Trilha | Idade | Foco |
|---|---|---|
| Sementinha | 4–5 | Linguagem oral, rimas, sílabas com batida, letras como personagens, escrita do nome; **sem pressão por decodificar**, mas já com letras e sons |
| Broto | 5–6 | Fonema inicial, síntese de 2–3 sons, vogais e contínuas, primeiras CV |
| Florada | 6–7 | Fônica sistemática, CV/CVC/dígrafos, frases decodificáveis, ditado |
| Fruto | 7–8 | Fluência com modelo de voz, sílabas complexas, compreensão; sem leitura cronometrada ansiogênica |
| Recomeço | 8+ não alfabetizados | Mesmo conteúdo, estética mais velha, progressão acelerada, **sem rótulo de atrasado** (V1) |

**Adultos e instituições** (D002, D004; rels. 26, 31)

| Perfil | Cria/vincula | Vê | Nunca vê |
|---|---|---|---|
| Responsável (B2C ou convidado pela escola) | Conta, consentimentos, perfis das crianças, assinatura | Relatório semanal, missão da semana, configurações, compras da lojinha, sinais de atenção | Comparação com outras crianças |
| Professor | Turma (QR da turma, importação) | Mapa de calor aluno × habilidade, grupos, alertas acionáveis, fila de escuta | Conteúdo do autorrelato emocional; alerta socioemocional individual |
| Escola/Secretaria | Contrato, turmas, adesão | Agregados por nível 0–10, cobertura curricular das transversais, dose e fidelidade | **Dado nominal** (só agregados com n ≥ 10, limiar ⚖️); socioemocional |
| Fonoaudiólogo (opcional, V2) | Identificado por nome e registro, com responsabilidade técnica (Res. CFFa 580/2020) | Modo profissional | — |
| Editorial/Admin/Pesquisa | — | Dados pseudonimizados; saúde do conteúdo e do ASR | Identidade da criança |

**Contas e acesso**
- O responsável entra por **celular/código como padrão**; e-mail/magic link fica como alternativa (resolve o conflito rel. 26 × rel. 31).
- A criança entra por **figuras**: QR da turma → grade de avatares (máx. 30) → senha de 3 figuras entre 9. Em casa, usa um QR individual impresso. Até **40 perfis por tablet** (rel. 24).
- **Porteira parental**: pressionar e segurar 3 s + tarefa que depende de leitura, com aviso falado. Atrás dela ficam relatórios, configurações, links, consentimentos, **assinatura** e mensagens. Logout após 2 min sem uso (rel. 24). A porteira **não equivale a consentimento parental** (rel. 24).

### 4.2 Jornada de 2 anos — mapa único de 11 regiões

O mapa adota a **proposta única do Bloco D** [proposta de síntese], que concilia os rels. 37 e 39 com os nomes da Decisão 004. Os critérios são: uma região por etapa da ordem de ensino (seção 4.3); a espiral temática do rel. 39 (Ano 1 "Seres vivos e seus lugares"; Ano 2 "Pessoas, culturas e como as coisas funcionam"); e palavras-âncora decodificáveis na própria etapa.

| Região | Etapa | Conteúdo fônico | Tema / pergunta-guia | Semanas (rel. 37) / meses (rel. 39) | Nível típico ao sair |
|---|---|---|---|---|---|
| R0 Quintal da Sofia / Vila do Bolota | 0 | Consciência fonológica oral | "Quem sou eu e quem vive comigo?" | 1–3 / 0–1 | 0 |
| R1 Ilha das Vogais | 1 | A E I O U (é/ê, ó/ô) | Praia e mar como primeiro contato | 3–6 / 1–2 | 1 |
| R2a Mata Atlântica — Vale do M-L-F | 2 | M, L, F + CV | "Quem mora na mata e do que precisa?" | 6–10 / 2–3 | 2 |
| **Fim da parte gratuita** | — | Relatório antes/depois; "ponte em obras", sem cadeado nem oferta à criança | — | D001: 4–8 sem.; rel. 37: ~8–10 sem. | — |
| R2b Mata Atlântica — Trilha do V-S-N | 2 | V, S, N + CV.CV | idem | 10–16 / 3–4 | 3 |
| R3 Pampa | 3 | P, T → B, D (com intervalo, depois contraste) | "O que muda do dia para a noite e entre as estações?" | 16–26 / 4–6 | 4 |
| R4 Pantanal | 4 | J, Z, X/CH, NH, LH + frases | "Por que a água sobe e desce?" | 26–36 / 6–8 | 5 (parcial) |
| R5 Cerrado | 5 | C/QU, G/GU, R/RR, S/SS, Ç | "Como as plantas vivem com seca e fogo?" | 36–48 / 8–10 | 6 (parcial) |
| R6 Caatinga/Sertão — **chefe do Ano 1** | 6 | Nasalidade | "Como se vive bem com pouca água?" | 48–58 / 10–12 | 5 (completo) |
| R7 Amazônia (abre o Ano 2) | 7 | CVC + ditongos | "Como os povos da floresta conhecem e cuidam do rio?" | 58–70 / 12–15 | 5–7 |
| R8 Litoral e Mar | 8 | CCV (PR, BR, TR… PL, BL…) | "O que o mar traz e leva?" (África–Brasil, ERER) | 70–82 / 15–17 | 6 (completo)–7 |
| R9 Cidade das Letras / oficina | 9 | S/Z/X, CH/X, J/G, H; -ou, -ão, -inho | "Quem constrói e faz a cidade funcionar?" | 82–94 / 17–20 | 8 |
| R10 Arquipélago dos Livros — **chefe final** e pós-jogo | 10 | Fluência, alta frequência, textos | "O que o céu e o tempo contam?" + "Livro da minha jornada" | 94–104+ / 20–24 | 9–10 |

**Estrutura de jogo** (D001; rels. 37, 42)
1. **Trilha principal** liberada por domínio. Para 4–6 anos, ela é **linear dentro do mundo aberto**, com no máximo 2 toques do mapa à atividade (concilia o rel. 24 com a D001).
2. **Missões paralelas procedurais** geradas por restrições: só grafemas já ensinados, linter de decodificabilidade, semente determinística e *fallback* curado. A mistura é ~60% alvo, ~30% revisão e ~10% transferência. O gerador **não cria palavra nem texto livre** (rel. 37 M10).
3. **Vila do Bolota** (construção e estratégia por "planta" lida), **colecionáveis que ensinam** (figurinhas que falam, livros na estante), **desafio-chefe** de fim de região (provinha disfarçada; falhar não tira nada) e **temporadas** com itens que voltam todo ano.
4. **Modo infinito de revisão** com dificuldade adaptativa. Para não cair na lista vermelha do rel. 42 ("mundo procedural sem fim de capítulo"), **toda sessão e toda missão têm fim**.
5. Regiões futuras **visíveis e sem cadeado**. Voltar às regiões antigas conta como revisão espaçada. Não há streak: há um **Álbum de Dias de Leitura** que só cresce.

O ritmo é indicativo, para uma criança de 5–6 anos com 4–5 sessões por semana. O avanço real é por domínio. Os nomes e biomas finais dependem do dono e da consultoria de conteúdo (ERER, cultura indígena, biologia).

### 4.3 Ordem de ensino dos sons

Prevalece a **sequência do rel. 02**, que é específica do PB e apoiada em Lemle, Morais e na BNCC (EF02LP03–05). Ela recebe as restrições dos rels. 06/07. É uma **síntese de projeto, não norma oficial**, e precisa ser validada com especialistas (D004).

| Etapa | Conteúdo | Observações |
|---|---|---|
| 0 | Consciência fonológica oral (rima, sílaba, fonema inicial, síntese oral) | Já com letras e sons nas apresentações (P2) |
| 1 | Vogais A E I O U, já com é/ê e ó/ô | — |
| 2 | Contínuas M, L, F, V, S (inicial), N + CV | Contínuas podem ser prolongadas (/mmm/), o que facilita a síntese |
| 3 | Oclusivas P, T, B, D | P antes de B, T antes de D, **com intervalo**; depois contraste explícito por intercalação |
| 4 | J, Z, X (ch), CH, NH, LH | — |
| 5 | Contextuais C/QU, G/GU, R × RR, S × SS, C/Ç | Diferencial diagnóstico do PB; mais itens aqui (rel. 20) |
| 6 | Nasalidade (ã, am/an…, m antes de p/b) | — |
| 7 | CVC e ditongos | — |
| 8 | CCV (PR, BR… PL, BL…) | Na fala, encontros só são exigíveis entre 6;0 e 7;0 (rel. 29) |
| 9 | Concorrências arbitrárias e morfológicas frequentes (-ou, -am/-ão, -inho) | Morfologia desde cedo (rel. 35, P10) |
| 10 | Fluência e palavras frequentes | O conjunto "irregular" do PB é pequeno ("que", "não", "muito", "também", "homem") e é ensinado por mapeamento, sem memorização visual pura (rel. 25) |

**Regras transversais da ordem**
- **Sons, não nomes**, na apresentação e na decodificação. O nome da letra fica num botão separado ("nome da letra" × "som da letra") e é ensinado explicitamente, como pede a BNCC (EF01LP10). Os dois nunca se misturam na fusão (rels. 02, 06, 07).
- **Pares espelhados (b/d, p/q) e pares surdo/sonoro separados no tempo**: nunca na mesma lição ou semana. Primeiro se consolida um, depois os dois são contrastados (rels. 06, 07).
- **Ritmo**: começar com **2–4 grafemas novos por semana** (1–2 por sessão) e subir até 4–5 por semana pela regra de taxa de aquisição (≥ 85% retidos no dia seguinte → +1; < 70% → −1) (rel. 07).
- **Regras contextuais e reduções vocálicas do PB são conteúdo ensinado**: "a gente fala assim, escreve assado" (rels. 25, 29).
- **Tipografia**: fonte **Andika** ("a" e "g" de um andar), caixa alta na entrada, minúscula de imprensa logo em seguida e **cursiva como mundo próprio** (V2). Ainda pendente de validação pedagógica (rels. 04, 25, 28).
- **Pistas visuais retiráveis** (sílabas coloridas, dígrafos marcados, cor de vogal redundante com forma) que somem com o ganho de fluência (rels. 18, 28, 31).

### 4.4 Estrutura da lição e da sessão

**Lição** (uma por objetivo; rels. 01, 30, 35). Ciclo fixo, "eu faço → nós fazemos → você faz":

| Fase | Duração | O que acontece |
|---|---|---|
| 0. Aquecimento | 30–60 s | 3–5 itens dominados ("sons-relâmpago") |
| 1. Eu faço | 1–2 min | Sofia modela: som + Espelho do Som + letra + palavra-âncora; 1–2 exemplos e 1 contraexemplo; quando cabe, descoberta guiada (ver casos → achar o padrão → Sofia nomeia a regra) |
| 2. Nós fazemos | 2–3 min | Síntese (*blending*) e segmentação com alfabeto móvel; dicas contingentes (1º erro → dica leve; 2º → modelo; 3º → fazer junto, e o item volta depois) |
| 3. Você faz | 2–4 min | Mini-jogo com **integração intrínseca** (a ação é a operação de leitura); sem dica automática, só se a criança pedir |
| 4. Verificação | 30–60 s | 2–4 itens **fora do formato do jogo**, com ≥ 1 pseudopalavra |
| 5. Fechamento | 15 s | Feedback informativo e convite para "ler para alguém" |

**Composição da sessão** (rels. 07, 31, 37, 42). Na acolhida (≤ 6 s), a Sofia mostra a trilha da sessão (3–5 estações). Depois vêm: aquecimento e **Jardim da Revisão** (revisões ≈ 60–70% dos itens; 1–2 itens novos) → lição → **slot rotativo** → pausa ativa → bloco de contraste (pares confusos) → **ritual de encerramento** (30–60 s: recapitula o aprendido, mostra o mapa, entrega as moedinhas em bloco, planta curiosidade para amanhã e não tem botão "continuar"). Há aviso em duas etapas ("mais 2 desafios" a ~80% do tempo; "último desafio!") e a sessão **termina em alta** (última tarefa com ~85–90% de chance de acerto).

**Orçamento único de tempo** [proposta de síntese]. Resolve o conflito 5 do Bloco D (somados, os blocos de linguagem, leitura em voz alta, criar e brincar livre não cabem na sessão) com um **núcleo fixo + 1 slot rotativo por sessão**:

| Idade | Sessão-padrão | Teto diário | Microatividade | Bloco antes de pausa | Pausa ativa | Alternativas por tela |
|---|---|---|---|---|---|---|
| 4–5 anos | **10–12 min** | 15 min, 1 sessão | 1–3 min | 3–7 min | 20–90 s | 2–3 |
| 6 anos | **10–15 min** | 2 sessões / 30 min | 3–4 min | 7–10 min | 20–60 s | 3–4 |
| 7–8 anos | **15–20 min** | 2 sessões / 30 min | 4–6 min | 10–12 min | 20–60 s | 3–4 (até 6) |
| Foco curto (TDAH) | 10–15 min | idem | — | **5 min (ajustável 3–7)** | 20–40 s | — |

Fontes: rels. 08, 09, 14, 42 e o conflito C2.1 do Bloco A. O teto ajustável pelo responsável vai até 20 min (4–5 anos) e 40 min (6–8 anos) (rel. 42 R3). 20–25 min aos 7–8 anos (rel. 09) é teto, não padrão.

- **Núcleo fixo (toda sessão):** acolhida → revisão → lição → contraste → ritual. Ocupa ~70% do tempo.
- **Slot rotativo (um por sessão, revezando entre os dias):** (a) **Hora da História**, leitura em voz alta acima do nível de decodificação, com 2–3 pausas CROWD (3–5 min; rels. 39, 41); (b) **Papo com a Sofia / Conta de novo!** (linguagem oral, ~2 min; rel. 41); (c) **Criar** (produção autoral: escrita inventada, legenda, placa; 3–5 min; rel. 40); (d) **missão transversal** (seção 4.11; ≤ 1 por sessão).
- **Brincar livre na vila** só **depois do ritual**, se o adulto liberou, sem missões e sem moedas (rel. 37).
- **Frequência-alvo**: **5 dias por semana** [proposta de síntese entre 4 (rel. 38), 4–5 (rel. 37), ~5 (rel. 39) e 5–6 (rel. 42)]. Validar no piloto. A renda da economia (seção 4.9) deve ser recalibrada para essa base.
- **Horário**: sessão principal no fim da tarde; revisão curta na manhã seguinte. **Janela noturna bloqueada**: nenhuma sessão nova a partir de 1 h antes do horário de dormir cadastrado (padrão 19h30 aos 4–5 anos; 20h00 aos 6–8). Nesse horário existe só o modo "história para dormir" em áudio. "Modo noturno" significa **modo dormir**, não filtro azul (rels. 07, 14, 42).
- **Inatividade e dicas** (rels. 23, 24, 31): 3–5 s de escuta; aos 5 s a Sofia aponta; aos 10 s repete; aos 20 s "vamos juntos?". Os tempos valem nas fases guiadas e ficam suspensos ou configuráveis na fase "você faz" (resolve C11 do Bloco C).
- **Sinais de sobrecarga** (3 erros seguidos, salto no tempo de resposta, toques aleatórios, inatividade > 20–30 s): a Sofia reduz as alternativas, muda de modalidade ou propõe pausa, e a sessão **fecha com êxito** (rels. 09, 13).

### 4.5 Critérios de domínio e Escala FONEMA 0–10

**Modelo do aluno** (rels. 07, 20)
- **Elo hierárquico**: θ global + θ por habilidade + dificuldade por item, com acerto ao acaso c_i. P(domínio) é derivado do Elo (semântica do BKT). Há decaimento após mais de 14 dias sem prática. O próximo item vem da "franja externa" de um grafo de **~70 habilidades em 7 domínios**.
- **Agendador v0 (Leitner + estabilidade)**: níveis de item 0–7; intervalos-base de 1, 2, 4, 8, 16, 32 e 60 dias; resposta classificada em fluente / correta lenta / correta com pista / erro; o item "sanguessuga" (≥ 3 lapsos em 14 dias) vai para a trilha de contraste. Na fase 2 entram FSRS/HLR treinados com dados próprios.
- **Dificuldade-alvo unificada** [proposta de síntese]: **85% na prática, faixa 80–90%**. Acima de 90% em duas janelas, sobe; abaixo de 75%, desce e volta a "nós fazemos"; abaixo de 60% em duas sessões, entra o **plano B** (outra explicação e aviso ao adulto). Na revisão, o alvo é 85–90% de retenção. No **diagnóstico**, P(acerto) ≈ 0,5. Itens novos ficam bloqueados se o acerto cair abaixo de 75%, se houver mais de 40 revisões vencidas ou se 2 ou mais itens estiverem travados (rels. 07, 20, 30, 37, 43).
- **Tempo é medido de forma invisível**: latência e PCPM entram no modelo, mas **não há cronômetro na tela** da criança (rel. 24 × rels. 18/20).

**Critério de domínio harmonizado** [proposta de síntese; consolida rel. 20, rel. 30, rel. 35 (T0–T6) e D004 §1.4]. Uma habilidade grafofonêmica só fica "dominada" quando cumpre as quatro condições:
1. **Prática**: P(domínio) ≥ 0,95, com ≥ 8 tentativas em ≥ 2 sessões; das últimas 5, ≥ 4 acertos, incluindo ≥ 2 pseudopalavras; latência mediana no alvo (hipóteses: letra-som ≤ 2 s; palavra CV ≤ 3 s).
2. **Generalização (T2)**: ≥ 1 sucesso com item novo ou pseudopalavra.
3. **Transferência (T3/T4)**: ≥ 1 sucesso em formato **diferente do jogo** ou em contexto novo (etiqueta da lojinha, placa da vila, carta) (D003).
4. **Retenção (T5)**: 3–5 itens de checagem **entre 24 h e 7 dias** depois. Se falhar, o item volta para "em consolidação" **sem rebaixar a fase**.

**Provinhas** ("Desafio da Sofia"; sem nota para a criança; sem cronômetro visível; reprovar **nunca bloqueia o jogo**, abre uma trilha de reforço curta):
- **Provinha de letra** (~2–3 min, 10 itens): ≥ 8/10, com ≥ 1 pseudopalavra correta e sem troca surda/sonora sistemática.
- **Provinha de fase/região** (~6–8 min): 10 palavras + 10 pseudopalavras + 4 de escrita (+ 1 texto a partir das sílabas complexas). Critério: **≥ 85% na leitura e ≥ 75% na escrita**.
- A diferença entre 80% (letra) e 90–95% (rel. 30) fica resolvida assim: **80% é o gate de prática por item; o gate de nível exige a provinha de fase + as condições 2–4**. Decisão final com a equipe pedagógica.

**Escala FONEMA de Alfabetização 0–10 (D004)**. É uma escala **por critério**, não por comparação. Substitui a escala 0–1000 do rel. 20 e os níveis 1–6 do rel. 31, que passam a ser remapeados nela (C2 do Bloco B).

| Nível | Nome (adultos) | Descritor: a criança consegue… | Evidência mínima para subir [proposta de síntese] | Região típica |
|---|---|---|---|---|
| 0 | Ponto de partida | Ouvir e brincar com sons e rimas | Diagnóstico de entrada | R0 |
| 1 | Sons e vogais | Identificar vogais e primeiros sons iniciais | Domínio das 5 vogais + fonema inicial | R1 |
| 2 | Primeiras letras | Ligar letra ↔ som das consoantes mais regulares | Domínio do 1º grupo de contínuas | R2a |
| 3 | Juntando sons | Ler sílabas simples (CV) e palavras curtas | Provinha de fase R2b | R2b |
| 4 | Primeiras palavras | Ler e escrever palavras regulares, inclusive pseudopalavras | Provinha com pseudopalavras ≥ 85% | R3 |
| 5 | Sílabas complexas | Ler sílabas CVC, nasais e dígrafos | Domínio dos dígrafos (R4), nasalidade (R6) e CVC (R7) | R4–R7 |
| 6 | Encontros e casos especiais | Ler encontros (pr, bl…) e grafias contextuais | Domínio de contextuais (R5) e CCV (R8) | R5–R8 |
| 7 | Frases | Ler e compreender frases; escrever frases simples | Frase decodificável com compreensão + ditado | R7–R8 |
| 8 | Pequenos textos | Ler textos curtos com compreensão literal | Texto da fase com compreensão literal ≥ 70% | R9 |
| 9 | Leitor fluente | Ler com fluência e entonação; inferências simples | Precisão ≥ 95% + PCPM acima da meta da fase + ≥ 1 inferência | R10 |
| 10 | **Alfabetizado pleno** | Ler e compreender textos do 2º ano; produzir textos curtos com ortografia regular | Benchmark completo; **referência** (não equivalência) à meta do ICA/Saeb 743 | R10 |

**Regras de honestidade (D004)**
- O nível sobe **só com domínio comprovado**, nunca por tempo de uso.
- O nível **nunca desce visivelmente** para a criança. Se ela esquecer algo, as revisões são agendadas em silêncio.
- A previsão de chegada aparece **como faixa** ("entre 3 e 5 meses") e é recalculada, sem promessa.
- O nível ≠ etapa ≠ região. Os níveis 5 e 6 atravessam várias regiões e não seguem a ordem das etapas. A coluna "região" indica a **região típica, não um gate** (Bloco D).
- Rodapé fixo em todo relatório: "estimativa por critério; não é nota Saeb". Nunca afirmar equivalência numérica com 743 antes da ancoragem psicométrica (TRI com itens de ligação, fase futura).

**Diagnóstico de entrada** ("Missão de boas-vindas da Sofia"): **versão curta de triagem** (5–10 min, oral, modelo ASER) + **versão completa** em 3 sessões de 4–6 min (CF, letras, decodificação, RAN, escrita, fluência). Resultado: fase de entrada, priors por habilidade e até 3 bandeiras ("precisa de mais CF"; "lê por memória visual"; "sinais de atenção" → sugerir avaliação, nunca diagnosticar). **Benchmark trimestral** com versão paralela de ~8 min (rel. 20).

**Fluência (metas provisórias, só internas).** Fim do 1º ano: 50–60 PCPM (precisão ≥ 95%). Fim do 2º ano: 80–90 + compreensão literal ≥ 70%. Também se registram **sílabas corretas por minuto**. Essas metas **nunca** aparecem como norma no relatório aos pais. Não há norma brasileira pública: é preciso calibrar com uma coorte de ≥ 500 crianças por série (rels. 20, 25).

### 4.6 Sofia e Bolota

**Sofia: mentora e voz da interface** (rels. 04, 23, 28, 31)
- **Aparência**: ilustração 2D vetorial (2D rende mais que 3D: g+ = 0,38 × 0,11). Menina de **~9–10 anos** ("prima que já sabe ler"), **parda**, cabelo cacheado 3C/4A, sem coroa, vestido de princesa ou tiara. Usa camiseta com a letra da semana e tem um objeto-assinatura. Boca grande e legível nos visemas. O elenco é diverso (óculos, aparelho auditivo, cadeira de rodas).
- **Personalidade**: calorosa, curiosa, paciente e brincalhona. Elogia **esforço e estratégia**. Erra de propósito às vezes para a criança corrigir. É modelo vicário ("eu também trocava…").
- **Voz**: TTS neural pt-BR expressivo, pré-gerado e versionado. Instruções 10–15% mais lentas que a fala adulta; velocidade ajustável de 0,75× a 1,25×; 15–30 variações por tipo de fala. **Fonemas isolados, pares mínimos, 150–300 falas-chave e canções são gravados por uma dubladora humana**. Clonar a voz da dubladora só com contrato específico ⚖️.
- **Técnica**: Rive com **12 bocas** ligadas a visemas por Data Binding; visemas do Azure para falas roteirizadas; Rhubarb + ajuste manual para gravações; 33 animações feitas à mão no "modo boca". Cerca de 40 estados, **nunca triste**, e **nada se move durante a resposta da criança**.
- **Fading em 5 fases**: muito presente na CF → modela letra-som → andaime decrescente na decodificação → leitura dialógica ("ler para o Bolota dormir") → autonomia, com ritual de passagem com a família. A Sofia **continua sendo a voz do menu**; o que diminui é o andaime pedagógico (C16 do Bloco B).
- **Ética**: roteiro 100% revisado, **sem LLM livre diante da criança**. Diz que é "um programa de computador". Sem manipulação emocional, FOMO, câmera ou biometria afetiva. Nunca vende e nunca aparece em anúncio.
- **Falas proibidas**: "Fiquei triste porque você saiu", "Não me deixa sozinha", "Só mais uma!", "Você é muito inteligente!", qualquer comparação com outras crianças.
- **Expectativa realista**: personagem pedagógica tem efeito **pequeno** (g+ = 0,20). A Sofia amplifica atenção e motivação, mas **não substitui o método** e não deve ser vendida como "a professora".

**Bolota: companheiro aprendiz** (rels. 23, 37)
- Filhote de tatu-bola (*Tolypeutes tricinctus*). Usa o efeito protégé: a criança corrige e ensina.
- Erros planejados: surda/sonora, inversão de sílaba, omissão do fonema final, b/d. **Nunca erra o que a criança ainda não domina**, e os erros nunca são piadas humilhantes.
- Tem um **caderninho** com o que a criança ensinou, que também funciona como visualização de progresso.
- **Nunca fica triste, doente ou "com saudade"** (adota-se a versão mais restritiva, S5 do rel. 38).

**Hipóteses A/B** (rel. 23): H1 voz expressiva × neutra; H2 com × sem Bolota; H3 boca em close × plano médio; H4 rituais de vínculo × sem.

**Marca** ⚖️: "Sofia" tem risco de colisão com "Princesinha Sofia" (Disney) e com apps existentes. É preciso buscar no INPI (classes 9, 41 e 28) e **preferir marca composta** (rels. 04, 31).

### 4.7 Recurso de articulação: "Espelho do Som"

**Nome.** "Boquinhas" é marca registrada (Método das Boquinhas, INPI 2008). **Não usar** nome, imagens nem "articulemas" desse método, nem copiar LiPS, Jolly Phonics ou a Fonomímica Paula Teles. O rel. 28 sugere "Boca da Sofia" ou "Espelho do Som". Este documento adota **"Espelho do Som"** como nome de trabalho [proposta de síntese], porque ele não depende da marca "Sofia", que também tem risco. Ambos dependem de busca no INPI ⚖️.

**Especificação** (rels. 02, 10, 28, 29)
- **Um clipe por fonema, não por letra.** São ≈ 48 clipes: ~33 base + 8 de pares mínimos + 7 de vogais.
- **Estrutura fixa**: a Sofia aponta para a moldura → som isolado ×2 (contínuos prolongados por 1,0–1,5 s; oclusivos sem vogal de apoio: /p/, não "pê") → **corte lateral 2D** (1,5–2 s) → sílaba e palavra-âncora → **a letra aparece no instante do som** → tela "sua vez" com espelho local, sem gravação.
- **Modelo**: fonoaudióloga adulta (CRFa) como modelo principal, mais 3 crianças de 6–9 anos de regiões e etnias diferentes, com cessão de imagem com prazo. **Cada clipe é aprovado por 2 fonoaudiólogas independentes.**
- **Corte lateral obrigatório** nos pares que o rosto não distingue: /t/×/k/, /s/×/ʃ/, surdo×sonoro, oral×nasal. Ícones de **vozeamento** ("mão na garganta: vibra!") e **nasalidade** ("nariz").
- **Pistas lúdicas**: "ventinho" do /p/, língua escondida no /s/, biquinho no /ʃ/, "tdtdtd" para o tepe. Gestos próprios do PB são **opcionais**, como gancho de memória, de preferência gestos que reforcem a articulação.
- **Técnica**: vídeo com áudio embutido (mux), sincronia entre −10 e +30 ms, H.264 720×720 (versão leve 480×480), legenda WebVTT.
- **Variantes regionais** ([tʃ dʒ], /s/ de coda, róticos) em pacotes opcionais. **Nenhuma é a "certa".**
- **Câmera fora do MVP.** No máximo um **espelho local, sem gravação e sem avaliação** (V1, F43). A dica articulatória por câmera (V2, F50) só depois de PoC, A/B e parecer jurídico. A câmera não vê a língua, e não há evidência de que classificar a boca da criança melhore a aprendizagem (rels. 05, 10, 29).
- **A/B obrigatório antes da produção em lote**: vídeo + corte + letra × só letra + som (rel. 28).

### 4.8 Reconhecimento de fala (ASR)

**Papel.** O ASR é **um sinal, nunca o portão**. Ele verifica se a criança **leu o alvo**, não se ela articula perfeitamente. Fala é o formato preferido de recuperação (rel. 07), mas **todo critério de domínio tem caminho equivalente por toque** (rel. 05). "Leitura ≠ fala": se uma criança de 5 anos lê "prato" e diz "pato", **a leitura conta como correta** (rel. 29).

**Arquitetura** (rels. 03, 21, 22)
- **Verificar, não transcrever**: tarefas fechadas e texto-dependentes (alvo + 2–4 distratores, frase esperada).
- **Modelo acústico CTC fonêmico** (wav2vec2/WavLM/XLS-R) ajustado para pt-BR, com GOP + classificadores binários dos contrastes da lição. **Whisper não é usado como juiz de pronúncia**, porque normaliza e produz falso acerto; ele serve só para tarefas abertas ou como plano B.
- **No aparelho**, com modelo pequeno e quantizado. **O áudio cru não sai do aparelho nem é guardado**; só o resultado pedagógico (rótulo e métricas) vai à nuvem.
- Camadas: VAD local ("não ouvi") → verificação do alvo → (V2) revisão humana de casos duvidosos, com consentimento.

**Política de tolerância assimétrica** (rels. 13, 20, 22, 29)
- Três faixas: **aceita** / **incerta** ("vamos ouvir de novo e falar juntos?") / **erro provável** (dica, nunca "errado!"). **Baixa confiança nunca conta como erro**: vira item não pontuado.
- Após **2 tentativas incertas**: "toque na palavra que você leu", e a criança segue sem penalidade.
- **Meta de produto: FRR ≤ 5%** em produções corretas (aceita-se FAR maior). Um item só entra no cálculo de domínio com **≥ 90% de acordo com juízes humanos**.
- Ruído, silêncio ou clipping → pedir nova gravação **sem culpar a criança**.

**Variação regional e desenvolvimento** (rel. 29). Comparar sempre contra o **conjunto de variantes aceitas**. A configuração regional muda só o áudio-modelo e o vídeo.
- **Nunca são erro**: róticos [x h ʁ r ɹ ɾ] e apagamento no infinitivo; /S/ de coda [s z ʃ ʒ h]; /t d/ com ou sem palatalização; /l/ de coda como [w]; alçamento ("minino"); monotongação ("pexe"); /ʎ/ como [lj] ou [j]; rotacismo ("pranta"); desnasalização final ("homi").
- **Matriz de tolerância por idade** (aceitar sem alerta até): tepe 5;0; coda /ɾ/ 5;6; CCV com /ɾ/ 6;0; CCV com /l/ 6;6–7;0; /ʎ/ 7–8 anos. As faixas são média de referência, não corte individual, e precisam ser validadas pelo conselho de fonoaudiologia. As normas vêm do RS/RJ; não há dados do N e do CO.
- **Perfis TDL/apraxia**: avaliação de pronúncia **desligada por padrão** ("Que bom ouvir você!"). **Down**: modo "incentivar".

**Corpus próprio pt-BR (ativo estratégico).** Fase 1: 300–500 crianças de 4–8 anos, 5 regiões, rede pública e privada, inclusive crianças com transtorno dos sons da fala. Gravação em 16 kHz mono em aparelhos reais. Anotação por fonoaudiólogos, com dupla anotação em 10–20%. Meta de 30–50 h anotadas. Ética: CEP/CONEP, TCLE + TALE e consentimento LGPD art. 14 com opções separadas (produto / pesquisa / corpus aberto) (rel. 22). **PoC de pronúncia** com 30–50 crianças de 5–7 anos (rel. 03).

**Escopo por versão** (rel. 31): MVP = VAD + modo "só incentiva" (F24) + **beta "Eu leio, a Sofia escuta"** em escolas-piloto (F25). V1 = leitura oral geral, karaokê em 4 passos, PCPM e precisão (F30–F32).

### 4.9 Economia de moedinhas

**Base (D002, aprovada):** moedinhas **fictícias**, ganhas **só aprendendo**. Não há compra com dinheiro real, anúncio que dê moedas, sorte, surpresa paga ou perda por errar ou faltar. Todo item tem preço e aparência visíveis antes da compra. As moedas são gastas em avatar, casa/vila, figurinhas, bichinhos, ingressos para mini-aventuras extras e presentes.

**Tensão assumida.** O rel. 08 classificava a camada "tangível/econômica" como "não usar", porque recompensa tangível esperada reduz a motivação intrínseca. **A Decisão 002 prevalece** e as salvaguardas passam a ser obrigatórias (seção 5).

**Proposta de operação — [aguardando confirmação do dono]** [proposta de síntese do Bloco D, rels. 37/38/08]
- **Conta por atividade, entrega no fim da sessão.** O sistema **contabiliza** as moedinhas por resposta-alvo (necessário para o teto, o antifarming e as métricas), mas **só as entrega e mostra em bloco no ritual de encerramento**, como informação. Não há anúncio de valores antes das tarefas, nem efeito de moeda a cada acerto, nem "leia 10 e ganhe X". Os marcos de domínio são comunicados **depois do fato**, junto do elogio ao processo.
- **Consequência**: mecânicas que "pagam item a item" (rel. 38 §4.5, etiqueta = 1 moeda; rel. 36 mec. 7; rel. 32 mec. 17) passam a apenas **somar na conta da sessão**.

**Parâmetros de partida** (rel. 38; todos a calibrar no piloto)

| Fonte | Moedas | Limite |
|---|---|---|
| Atividade concluída com tentativa real | 1 | — |
| Lição do dia | 2 | 1/dia |
| Revisão | 2 | — |
| História até o fim | 2 (+1 se recontar) | — |
| **Marco de domínio** | **5** | — |
| **Região concluída** | **10** | — |
| Ensinar o Bolota | 1 | 3/dia |
| Ponte com o mundo real (confirmada pelo adulto) | 2 | 1/dia |
| Repetir conteúdo já dominado | 1 nas 2 primeiras vezes/dia, depois 0 | antifarming |

- **Teto diário de 12**; âncora de preços R = 35 por semana com 4 sessões. **Recalibrar para 5 sessões por semana** (seção 4.4). Nunca rendem moeda: login, tempo de uso, sequência de dias, toques rápidos e **escolher uma emoção no "Como estou hoje?"** (rel. 33).
- **Uma moeda só** (sem gemas nem moeda premium). Os **selos de domínio** do rel. 37 entram como insígnias **não gastáveis e não conversíveis**, exigidas por prédios grandes da vila [proposta de síntese; aguardando confirmação do dono].
- **Lojinha como leitura**: a etiqueta tem palavra decodificável da fase + numeral + pilha de moedas. "Leia para conhecer" tem ajuda graduada, e **ler nunca é condição para comprar**. A lojinha fica **fora da tela inicial** (comprar não é o clímax). A compra leva 2 toques, com **desfazer em 24 h**. Preço fixo, **imutável depois de publicado**.
- **Cofrinho**: uma meta por vez no início, com foto do item e **barra de progresso real**. **Bônus de paciência fixo de 10%** ao atingir a meta (validar com pedagogia o uso da palavra "rendeu"). Sacar é livre. O custo de oportunidade é dito uma vez, sem culpa.
- **Catálogo**: representatividade grátis e permanente; **nenhum item exclusivo de assinante**; sem raridade; sazonais voltam todo ano; **livros por domínio, nunca por moeda**; nenhum item dá vantagem pedagógica.
- **Economia desligável** pela família ou escola (modo "só estrelas de domínio"). **Modo quadro de fichas** para TEA/TDAH (5 casas por bloco, retirada gradual).
- **Salvaguardas S1–S13** (rel. 38): sem dinheiro real, anúncio ou "assista e ganhe"; zero aleatoriedade; sem ranking de riqueza; sem escassez ou "só hoje"; sem pressão parassocial; nada expira; sem recompensa por tempo ou sequência; porteira parental; auditoria anual de dark patterns; revisão jurídica ⚖️.
- **Sentinela de superjustificação (E8)**: queda > 20% em 2 meses da leitura voluntária na estante livre → revisão do sistema. **Piloto com 3 braços** (trilha sem vila/lojinha; com vila; com vila + lojinha) (rels. 37, 38).

**Educação financeira** (D002 §3; rel. 34). É leve e lúdica e **não ofusca a alfabetização**. Mecânicas: ganhar com esforço, cofrinho com meta, esperar vale a pena, custo de oportunidade, necessidade × desejo, comparar preços (fases avançadas), compartilhar/doar (projeto coletivo da vila), contar moedas de 1, 5 e 10 (fase avançada, só como representação), lista de desejos. **Cuidados anticonsumismo**: nunca moeda com nome ou desenho de real; **crédito não entra** na faixa de 4–8 anos; o jogo **sempre cumpre a promessa**; sem marketing do tipo "hábitos se fixam até os 7". O sistema monetário real entra como **conteúdo** de leitura e matemática (códigos BNCC a conferir), nunca como moeda do jogo.

### 4.10 Avatar e vila

- **Avatar** (D002; rel. 37): corpo, tom de pele, cabelos (cacheado, crespo, liso, tranças), óculos, aparelho auditivo, cadeira de rodas. Toda a **representatividade é gratuita**. O convite é "parecido com você **ou** como quiser". Os itens **não dão poder**. O avatar fica discreto durante a lição. Há guarda-roupa por região (festa junina, carnaval, praia, sertão, Amazônia). É uma alavanca de **identidade e pertencimento, não de aprendizagem** (não há meta-análise de avatar e aprendizagem em 4–8 anos; personalizar enfeites teve efeito nulo em Lomas et al.).
- **Vila do Bolota**: casa, quintal e vila que crescem. Construção por **planta lida** (ponte com PC). Missões de **necessidade antes do enfeite** (água, comida do bichinho). Projetos comunitários (horta). Bichinhos da fauna brasileira para cuidar, que **nunca adoecem nem sentem saudade**. A vila funciona como canto de faz-de-conta com **objetos de letramento** (cardápio, placa, receita, correio; rel. 40).
- **Coleções e conquistas**: figurinhas que falam a palavra, instrumentos que tocam sons de letras, livros na estante (por domínio), títulos por domínio ("Mestre do S", "Leitor da Floresta"), **nunca por tempo de tela**.
- **Sem interação entre crianças no MVP**: sem chat, sem conteúdo de outros usuários, sem troca entre crianças. "Presentes" vão para personagens do jogo. Cartas para contatos reais aprovados pelo responsável ficam para uma versão futura, com parecer ⚖️ [proposta de síntese para o conflito 13 do Bloco D].
- **Painel dos pais**: mostra o que a criança comprou e poupou, como ponto de partida para uma **conversa sobre dinheiro** em casa.

### 4.11 As seis competências integradas

**Regra de ouro (D003).** As cinco competências transversais **entram por dentro** das atividades de leitura: toda missão transversal **exige ler ou ouvir e decodificar**. Quando o desafio principal não é a leitura, ela usa **leitura de nível já dominado** (rel. 35 P14). Teto agregado [proposta de síntese]: **≤ 1 missão transversal por sessão** (rel. 37), ocupando o slot rotativo, o que respeita o limite de ≤ 15–20% do tempo para PC (rel. 32).

| Competência | Como entra | Cota | O que a evidência permite dizer | Proibido prometer |
|---|---|---|---|---|
| **Alfabetização** (espinha dorsal) | Trilha principal; único gate de progressão | ~70%+ da sessão | Seções 3 e 4.3–4.5 | "Nota Saeb" |
| **Pensamento computacional** | Cartas de comando com **palavras decodificáveis** (PULA, SOBE); "Bug do Bolota"; receita para ordenar; desplugado → tela; telemetria separa erro de decodificação de erro de lógica | ≤ 15–20% do tempo | PC aos 3–8 anos d = 0,83 (Wang et al. 2024); **programar não ensina a ler** (Yang et al. 2023) | "Programação melhora a leitura" |
| **Raciocínio lógico** | Classificar palavras por som, completar padrões de sílabas, seriar, analogias; trilha numérica **linear** no mapa | Dentro do slot | Padrões predizem matemática (Rittle-Johnson et al.); tabuleiro linear (Siegler & Ramani) | "Turbina a leitura" |
| **Inteligência emocional** | Palavras de emoção **ordenadas pela decodificabilidade** (MEDO, NOJO → CALMA → TRISTE → RAIVA); emoção pelo contexto, não só pelo rosto; respirar com a Sofia (20–40 s, opcional); "Errei, e agora?" | ~1 de cada 4–5 missões; ≤ 1–2 min | Vocabulário emocional liga-se à compreensão emocional (Streubel et al. 2020); **Compasso teve efeito nulo/negativo no Rio** | "Desenvolve a inteligência emocional", "reduz ansiedade" |
| **Tecnologia e cidadania digital** | "Como a Sofia me ouve?" (orelhinha acesa), Mochila dos Segredos, Semáforo da Vila, Detetive de Botões, com dados fictícios do Bolota | ~1 a cada 4–5 sessões; 2–4 min | Ensinar uma máquina torna as ideias mais realistas aos 4–6 anos (PopBots) | Medir "vício" |
| **Educação financeira** | Economia, cofrinho, lojinha (seção 4.9) | Ritual e tempo livre | Efeitos pequenos, maiores em conhecimento que em comportamento; ECR brasileiro com efeito colateral de crédito caro (Bruhn et al. 2016) | "Nota de educação financeira" |

**Aprendizagem profunda (D003 §2; rel. 35).** Decodificar para memorizar (nada de cartão-relâmpago de palavra inteira). Pseudopalavras em 10–20% dos itens de leitura de cada nível. Descoberta guiada (ver casos → achar o padrão → a Sofia nomeia a regra), com 1–2 explicações por sessão no máximo. Comparar pares mínimos e famílias. Morfologia desde cedo. ≥ 1 pergunta inferencial por texto. **Árvore das Palavras**: um grafo que só cresce com **conexões efetivamente usadas**, mostrando no máximo 3–4 conexões por vez. **Conhecimento de mundo** com três camadas de texto por região: leitura em voz alta rica; decodificáveis temáticos; missão-projeto, que é o desafio-chefe (rel. 39). Pré-ensino de 3 palavras antes de cada texto da camada A, para compensar o efeito Mateus.

**Medir sem virar prova (rel. 43).**
- **N1** (habilidade de tarefa) alimenta o motor.
- **N2** (competência) só depois de ≥ 3 tarefas de ≥ 2 mecânicas em ≥ 2 dias, em **faixas descritivas**.
- **N3** (traço da criança): **nunca**.
- Uma tarefa transversal só conta como evidência transversal se a criança acertou a parte de leitura (ou recebeu a instrução em áudio).
- As transversais **nunca bloqueiam** o mundo, nunca geram ranking nem "risco". **Só a alfabetização tem gate.**

### 4.12 Termômetros e relatórios por perfil

**Nomes distintos** para não misturar progresso, autorrelato e metacognição [proposta de síntese para o conflito 9 do Bloco D]:
- **Termômetro da Leitura**: a Escala 0–10 (D004).
- **Trilhas das competências**: estados N2 por conceito, "novo / praticando / usa em situação nova" (rel. 43). Sem número e sem "quantos faltam".
- **"Como estou hoje?"**: autorrelato emocional **opcional, efêmero e não armazenado no servidor** (rel. 33). Não aparece em relatório nem perfil.
- **"Quanto tenho certeza?"**: metacognição (rel. 35).

| Perfil | O que vê | Formato | Regras |
|---|---|---|---|
| **Criança** | Trilha no mapa; Termômetro da Leitura que **enche** a cada som dominado; próxima região; Jardim, álbum, caderninho do Bolota | Visual e falado pela Sofia; **sem números, gráficos ou comparação** | O nível nunca desce visivelmente; sem push de desempenho |
| **Responsável** | "Nível 6 de 10: faltam 4"; o que já sabe e o que está aprendendo; previsão em faixa; **missão da semana (5 min, sem tela)**; compras e poupança; sinais de atenção (se houver) | **1 tela por semana, áudio + ícone como formato principal**; gráficos em "ver mais" | Sem comparação com outras crianças; sem metas de PCPM como norma; ≤ 3 notificações/semana no horário escolhido |
| **Professor** | Nível de cada aluno e distância até 10; **mapa de calor aluno × habilidade**; **3–5 grupos sugeridos com a atividade de amanhã**; alertas acionáveis (travado há 3 sessões, "chutando", sem uso há 7 dias); erros por categoria; dose; tradução para psicogênese/BNCC | "Três perguntas, não trinta gráficos": quem precisa de mim hoje? Como está a turma? O que fazer amanhã? Começar com 5 visualizações | Incerteza do ASR visível; itens incertos fora do cálculo; persistência + dose antes de alerta; sem semáforo vermelho/verde |
| **Escola / Secretaria** | Distribuição pelos níveis 0–10; % no nível 10 por turma/escola; dose e fidelidade; cobertura curricular das transversais | Painel agregado; exportável no formato da secretaria | **Sem dado nominal**; n < 10 suprimido ⚖️; referência Saeb sempre rotulada como estimativa; **socioemocional nunca vai à secretaria** |

**Anti-padrões proibidos**: ranking ou pódio; gauge de "nível de leitura" para a criança; nota Saeb individual; minutos de tela como sucesso; percentis sem norma brasileira; streak com dias em vermelho; linguagem como "atraso", "déficit", "risco" ou "inteligente" nas transversais (rels. 31, 43).

### 4.13 Inclusão

**Princípios** (rels. 05, 12, 31)
- Projetar para todos (DUA/UDL 3.0 + WCAG 2.2 AA) e permitir **ajustes por perfil**, configuráveis pelo responsável ou terapeuta e com registro.
- Os ajustes **mudam a entrada e o ritmo, não o objetivo**: fônica estruturada é o núcleo para todos.
- **Nenhum rótulo diagnóstico é visível** para a criança. A linguagem é de neurodiversidade ("modos de apoio").
- **Nenhuma alegação terapêutica**: o FONEMA não é dispositivo médico nem intervenção para TEA, TDAH, dislexia ou apraxia.

**Painel "Perfil sensorial e de aprendizagem"**: volumes separados (efeitos × voz); movimento completo/reduzido/nenhum (respeita `prefers-reduced-motion`); contraste normal/alto/suave; fonte (Andika padrão; Lexend e OpenDyslexic opcionais, **sem promessa terapêutica**, porque "fontes para dislexia" não têm ganho comprovado); espaçamento entre letras, palavras e linhas; velocidade da Sofia; legendas; **sem tempo limite**; fala ligada / "só incentivar" / desligada; celebração intensa/discreta/neutra; **botão "modo calmo"**.

| Modo (nome de produto) | Para quem | Ajustes-chave |
|---|---|---|
| **Previsível** | TEA | Trilha da sessão visual e sempre na mesma ordem; **aviso 10 s antes de cada transição**; surpresas desligadas (novidade só pelo "botão de novidade"); som baixo, sem música; Sofia com voz calma (0,85–0,9×), frases literais e frases-âncora fixas; opção de Sofia sem rosto; recompensa informativa e não social; tema de interesse cadastrado pela família; decodificação e compreensão medidas separadamente (alerta de perfil hiperléxico ao adulto) |
| **Foco curto** | TDAH | Blocos de 5 min (3–7); **feedback < 300 ms**, nunca acumulado; reforço informativo imediato (estrela/som, **não moeda**); metas curtas visíveis com prêmio determinístico; desvio-padrão do tempo de resposta (janela de ~10 itens) → troca de atividade ou pausa de movimento; movimento permitido; **triagem fonológica obrigatória** (comorbidade com dislexia ~25–40%) |
| **Reforço de leitura** | Sinais de dislexia | Mais fônica, passos menores, 1 letra nova por sessão, 4–5 recuperações para aquisição; espaçamento extra (+2,5 pt entre letras); tipografia +15% e entrelinha 1,8; foco em fluência com leitura repetida e metas pessoais; **sem cronômetro visível**; dose de 20–30 min/dia em 2 blocos, 5 dias/semana, ≥ 12–20 semanas, reavaliação a cada 4–6 semanas; sem resposta após 3–6 meses de boa dose → recomendar avaliação profissional |
| **Palavra inteira primeiro** | Síndrome de Down | Trilha palavra inteira → frases → fônica; letra grande; lembrete de audição; ASR em modo "incentivar" |
| **Libras / legendas** | Surdez | Legendas em 100% das falas; sinal visual para todo som; perfil Libras (palavra ↔ sinal ↔ imagem) e perfil oralizado/IC (V2: Libras e CAA) |
| **Alto contraste** | Baixa visão | Zoom, alvos ≥ 64 px (≥ 96 dp no padrão infantil), nada só por cor, narração de tudo |
| **Calmo / Noturno** | Todos | Celebração discreta; modo dormir (seção 4.4) |

- **TEA + TDAH**: a **previsibilidade prevalece** sobre a novidade (rel. 12).
- **Legendas** (C13 do Bloco A): disponíveis para 100% das falas; **ligadas por padrão** nos perfis de deficiência auditiva, nas telas do adulto e onde a lei exigir; **desligadas por padrão** na tela da criança pré-leitora típica, por causa do custo de redundância.
- **Triagem sem diagnóstico** (rels. 05, 11, 29): indicadores de consciência fonológica, RAN, conhecimento de letras, **taxa de aprendizagem**, efeito de extensão e pseudopalavras, comparados à coorte e ao tempo de exposição. O sinal exige **persistência** (várias semanas; para fala, ≥ 3 semanas em várias palavras com ASR confiável), aparece **só para o responsável** (e para a escola, se autorizada), com o texto "isto não é um diagnóstico" e uma ação concreta (citando a Lei 14.254/2021 como direito). **Não se sinaliza fala com base só no ASR**, e o sinal nunca é usado para vender plano. A escola pode ativar a trilha de **Tier 2 automática** após ~6–10 semanas sem avanço, com alerta ao professor (rels. 18, 20); a janela única fica para o piloto.

### 4.14 Família e escola

**Família** (rels. 14, 26, 41)
- **Missão da semana de 5 min**, ligada ao fonema atual, no formato fato/dica/reforço, com **3 mensagens por semana** (READY4K, ECR; ganhos de ~0,2–0,3 DP em subtestes), diferenciadas pelo nível da criança. Funciona **sem que o adulto saiba ler bem** (áudio + imagem).
- **Duas trilhas**: "brincar com sons e letras" (código) e **"hora da história"** (leitura dialógica com perguntas CROWD prontas; vídeo PEER de 1 min).
- **"Ouça seu filho ler"**: a criança grava uma frase decodificável e o adulto responde com coração ou áudio. A gravação exige consentimento específico ⚖️, e a voz não sai do aparelho sem esse consentimento.
- **"Modo juntos"**: sem hotspots nem minijogos durante a história; perguntas para o adulto num balão discreto; a Sofia "cede a vez". **Nenhuma notificação durante o modo juntos.**
- **Área do responsável áudio-primeiro**: botão "ouvir" em todo texto; no máximo 2 níveis de navegação; dados leves (vídeos ≤ 60 s, opcionais; download só com Wi-Fi).
- **WhatsApp Business oficial** (V1): áudio da Sofia ou da professora + 1 imagem + link profundo. **Nunca o número pessoal da professora.** Opt-in explícito; nenhuma foto de criança em grupo. A/B entre SMS, WhatsApp texto e WhatsApp áudio, o que pode gerar **evidência inédita** (não há ECR brasileiro de WhatsApp em alfabetização).
- Valorizar a **língua da família** e a variação regional ("em casa *mainha*, na história *mãe*: as duas estão certas"). Incentivar línguas maternas (espanhol, crioulo, línguas indígenas, Libras).
- Mensagens sobre sono: sessão no fim da tarde e nada de tela logo antes de dormir, **sem prometer** "aprende dormindo".

**Escola** (rels. 18, 19, 26, 31)
- **Painel do professor** (seção 4.12) com **modo ao vivo** em sala, mensagem aos pais em 1 clique e destaque para as crianças "invisíveis".
- **Modo estação** (10–15 min por grupo, troca rápida de aluno, **2 crianças por tablet** com turnos), **modo projetor/TV** (a Sofia conduz a CF para a turma) e **kit impresso** da estação sem tela.
- **Guia do professor estruturado** (eu faço / nós fazemos / você faz): é o ingrediente mais custo-efetivo segundo a evidência internacional (Tusome, Quênia). Microvídeos de formação de 2–3 min ligados à lição do dia. Coaching assistido por dados para coordenadores.
- **Horário fixo diário** recomendado à escola (15–20 min). O TaRL **só funcionou com tempo dedicado**.
- **Fidelidade medida automaticamente**: dose (min/aluno/semana), cobertura e tempo em tarefa, com painel para a gestão.
- **Fila de escuta** (V1, ⚖️): o professor ouve por amostragem leituras gravadas (≤ 10 por semana), com consentimento, e pode corrigir o veredito do ASR.
- **Taxonomia BNCC** como espinha dorsal dos dados: cada atividade leva tags com códigos canônicos + aliases por rede (ex.: Currículo Paulista). Os códigos precisam ser conferidos no documento oficial.

### 4.15 Privacidade, segurança e legal

**Status: tudo nesta seção depende de parecer jurídico ⚖️. Nenhum texto de lei foi conferido no Planalto durante a pesquisa.**

**Marco aplicável** (rels. 04, 05, 27, 29, 36, 38, 42)
- **LGPD** (Lei 13.709/2018): art. 14 (dados de crianças: melhor interesse; consentimento específico e em destaque de um dos pais ou responsável; o Enunciado CD/ANPD 1/2023 admite outras bases legais); arts. 5º, II e 11 (biometria como dado sensível).
- **ECA Digital** (Lei 15.211/2025), **vigente desde 17/03/2026**:
  - proteção máxima por padrão;
  - supervisão parental;
  - contas até 16 anos vinculadas a um responsável;
  - **loot boxes proibidas (art. 20)**, com definição no art. 2º, IV ("mediante pagamento"); o FONEMA proíbe qualquer aleatoriedade por prudência;
  - **perfilamento para publicidade vedado (art. 22)**;
  - vedação de autoplay e rolagem infinita;
  - multa de até 10% do faturamento (teto de R$ 50 mi por infração).
  - **Decreto regulamentador a confirmar**: 12.880/2026 (rels. 05, 38, 42) × 12.622/2025 (rel. 36). A numeração dos artigos diverge entre fontes secundárias, e há ação no STF contra a lei.
- **ECA** (art. 17, imagem); **Resolução CONANDA 163/2014** (publicidade infantil); **LBI** (arts. 28 e 63) e NBR 17225:2025 (acessibilidade digital); **Lei 14.254/2021** (dislexia/TDAH na escola); **Lei 6.965/1981** e **Res. CFFa 580/2020** (atos privativos de fonoaudiólogo).
- **Lojas**: Apple Kids (porteira de nível adulto; sem analytics nem anúncios de terceiros) e Google Families (sem ID de publicidade).
- **Fora do Brasil** (só se houver expansão): COPPA emendada (conformidade até 22/04/2026), GDPR art. 8, AI Act art. 5(1)(f) (proíbe reconhecimento de emoções em instituições de ensino).

**Privacidade por arquitetura** (D004 §2.3; rels. 03, 05, 21, 31)
1. A **conta pertence ao adulto**; a criança é um perfil com o mínimo de dados.
2. **Voz processada no aparelho**; o áudio cru não sai nem é guardado. Não há **voiceprint**. Voz para melhorar modelos só num programa **separado, opt-in e revogável**. A nuvem, se usada, opera sem retenção e sem treino, com contrato de operador (região, retenção) ⚖️.
3. **Câmera fora do MVP.** Se vier: local, sem gravação, sem reconhecimento facial, **sem inferência de emoção**, desligada por padrão e com consentimento destacado.
4. **Nenhuma inferência de emoção** por câmera, voz, rosto ou ritmo de toque. Autorrelato emocional efêmero.
5. **Analytics só first-party e agregado**; **sem SDK de terceiros** na área infantil; sem anúncios; sem perfilamento.
6. **Consentimentos separados por finalidade**: microfone, câmera, relatório à escola, sinalização de risco, gravação para o professor, pesquisa/corpus.
7. **Painel de privacidade** para o responsável: o que foi gravado e botão de apagar. Microfone com indicador "ouvindo".
8. **Papéis e acesso**: RLS por papel; a secretaria não vê dados nominais; admin e pesquisa veem dados pseudonimizados; agregados com n < 10 suprimidos.
9. **Oferta de assinatura só ao adulto**, atrás da porteira; nunca pressão sobre a criança (D001/D002).
10. **Comunicação**: sem promessa de resultado e sem neuromitos (16 frases proibidas, rel. 15). Não criar selo com aparência de certificação oficial.

**Questões abertas para advogado**: voz só para transcrição é biométrica? Qual a base legal? Base legal da sinalização de risco (dado de saúde inferido). Transferência internacional (ASR/TTS em nuvem). Verificação/aferição de idade aplicável (orientações definitivas da ANPD previstas para ago/2026). Economia de moedinhas e lojinha fictícia × ECA Digital. Voz sintética da dubladora (PLs 3392/2024 e 4041/2025). Cessão musical × ECAD. Imagem de criança nos vídeos e no marketing. Limiar de n mínimo. Contratação pública "por aluno/mês".

### 4.16 Modelo de negócio (sempre mensal)

**Decisão 001 (prevalece sobre o rel. 27):** **somente assinatura mensal; nenhum plano anual.**

| Plano | Preço (hipótese) | Status |
|---|---|---|
| **Gratuito por conquista** | R$ 0 até concluir **R0 + R1 + R2a** (CF + vogais + 1º grupo de consoantes + primeiras sílabas e palavras), com **relatório antes/depois completo** para o responsável e **painel da turma** para a escola | Recorte da D001 (~4–8 semanas); o rel. 37 estima ~8–10 semanas. Validar no piloto |
| Família (B2C) | **R$ 24,90–29,90/mês** | Faixa-hipótese do rel. 27, mantida; pesquisa van Westendorp em base mensal pendente |
| Escola privada (B2B) | Por aluno/mês; ≈ R$ 5–10 | **Conversão aritmética** do anual, sem âncora de mercado [NV]; recalcular |
| Rede pública (B2G) | Por aluno/mês, via contratação pública; ≈ R$ 2,10–4,20 | Conversão aritmética; recalcular; ⚖️ como contratar "por aluno/mês" em pregão/ARP e CPSI |
| Formação/implantação (B2G) | Item separado | Sem mudança |

- **Gatilho do plano pago**: concluir a parte gratuita (fim de R2a). A criança vê a próxima região como **"ponte em obras"**, sem cadeado punitivo e **sem oferta**. A oferta aparece só ao adulto, atrás da porteira (resolve C5 do Bloco C).
- O relatório antes/depois do freemium **não promete resultado** (D002).
- **Estratégia "B2G-led híbrido"** (rel. 27):

| Fase | Período | Escopo |
|---|---|---|
| 0 | 1º sem. 2027 | Beta: 200–500 famílias e 3–5 turmas |
| 1 | 2º sem. 2027 | B2C + 5–20 escolas privadas |
| 2 | 2027–2028 | 2–4 municípios via CPSI |
| 3 | ano letivo de 2028 | RCT com 60–100 turmas |
| 4 | 2029+ | Escala B2G (60–300 mil alunos) |

- **Portas de compra pública**: pregão com ARP (via mais segura; carona de até 50%), **CPSI** (até R$ 1,6 mi; melhor porta para piloto pago), dispensa só para pilotos pequenos (R$ 65.492,11 em 2026) e inexigibilidade só com exclusividade comprovada ⚖️. O risco de calendário é alto: eleição municipal em 2028 e troca de gestão em 2029.
- **Unit economics**: o custo variável de TTS + ASR precisa ficar **bem abaixo de R$ 10 por criança/ano** para o B2G fechar (rel. 27). Com Azure em tudo, o custo seria de **US$ 1,3–1,5 por aluno ativo/mês** (rel. 03), o que é **incompatível** com o preço B2G. Portanto, **ASR no aparelho e TTS pré-gerado** (≈ US$ 0 por aluno) são requisitos econômicos, não só de privacidade.
- **Financiamento**: filantropia + receita antes de capital de risco. Editais 2027 (Lemann, Itaú Social, TPE, BID Lab) a confirmar.

---

## 5. Tabela de conflitos resolvidos

| # | Conflito | Decisão | Justificativa |
|---|---|---|---|
| 1 | **Moedas e loja**: rels. 04/08/31 (lista vermelha) × Decisão 002 (economia aprovada) | Economia fictícia **mantida** com as salvaguardas do rel. 08 e as S1–S13 do rel. 38; piloto com 3 braços e sentinela E8 | A decisão do dono prevalece; as salvaguardas atacam a superjustificação (Deci 1999) |
| 2 | **Quando a moeda chega**: rel. 38 (imediata por resposta) × rels. 37/08 (em bloco no fim) | **Conta por atividade, entrega no fim da sessão** — **[aguardando confirmação do dono]** | Mantém teto e antifarming sem criar contingência anunciada |
| 3 | **Preço anual** (rel. 27) × só mensal (D001) | **Só mensal**; recalcular faixas e TAM | Decisão do dono |
| 4 | **Freemium por limite diário** (rel. 27) × **por conquista** (D001) | Por conquista: até o fim de R2a | Decisão do dono; o recorte ainda depende do piloto |
| 5 | **Duração do freemium**: 4–8 sem. (D001) × ~8–10 sem. (rel. 37) | Mantém-se o recorte de conteúdo da D001; a duração real é medida no piloto | O avanço é por domínio, então o tempo varia por criança |
| 6 | **Escala**: 0–1000 com 6 níveis (rel. 20); níveis 1–6 (rel. 31) × 0–10 (D004) | **Escala 0–10 por critério**; as outras são remapeadas | Decisão do dono |
| 7 | **Nível × etapa × região** (D004 associa níveis a regiões) | A região na D004 é **típica, não gate** | Os níveis 5–6 não seguem a ordem das etapas (Bloco D) |
| 8 | **Mapa de regiões**: rels. 37 (11), 39 (10), 38 (ilustrativo) | **Mapa único de 11 regiões** do Bloco D | Uma região por etapa; nomes da D004; espiral do rel. 39 |
| 9 | **Mapa linear** (rel. 24) × **mundo aberto** (D001) | Trilha principal linear para 4–6 anos dentro do mundo aberto | Mantém a D001 e a usabilidade infantil |
| 10 | **Mundo procedural infinito** (D001) × lista vermelha "sem fim de capítulo" (rel. 42) | Toda sessão e missão tem fim; o infinito é de conteúdo, não de sessão | Compatível com as duas fontes |
| 11 | **Duração da sessão** (8–25 min entre relatórios) | 10–12 min (4–5), 10–15 (6), 15–20 (7–8); tetos diários do rel. 42 | Mediana das fontes; SBP/OMS/AAP pedem cautela |
| 12 | **Orçamento de tempo** (blocos de linguagem, criar, leitura em voz alta e brincar não cabem) | Núcleo fixo + 1 slot rotativo por sessão; brincar livre depois do ritual [proposta de síntese] | Preserva o código e reveza os demais blocos |
| 13 | **Frequência semanal** (4 a 6 dias) | 5 dias/semana como alvo; validar | Ponto médio; afeta a renda da economia |
| 14 | **Bloco no TDAH** (3–5, 5–7, 5–10 min) | Começa em 5 min, ajustável de 3 a 7 | Todos são parâmetros iniciais não medidos |
| 15 | **Taxa de acerto-alvo** (75–95%) | 85% na prática (faixa 80–90%); revisão 85–90%; diagnóstico ≈ 50%; última tarefa 85–90% | D001 fixa ~85%; definir por modo |
| 16 | **Critério de domínio** (80% × 90–95% × provinha + transferência + retenção) | 4 condições (prática + T2 + T3/T4 + retenção 24 h–7 d); 80% como gate de item; provinha de fase para o nível | Integra os rels. 20/30/35 e a D004 |
| 17 | **Escalas de transferência** T0–T6 (35) × T0–T3 (43) | Alfabetização usa T0–T6; transversais usam T0–T3, com a correspondência do Bloco D; **retenção única de 24 h–7 dias** para o nível | Um só intervalo de retenção para a D004 |
| 18 | **Cinco usos de "termômetro"** | Termômetro da Leitura / Trilhas das competências / "Como estou hoje?" / "Quanto tenho certeza?" | Evita misturar progresso com autorrelato |
| 19 | **Termômetro das transversais com "quantos faltam"** (D004) × sem número (rel. 43) | Estados "novo / praticando / usa em situação nova", sem número | O rel. 43 mostra os riscos de rotular; a D004 continua atendida em espírito |
| 20 | **Ordem de ensino** (rels. 01, 02, 04, 14, 25) | Sequência do rel. 02, com pares espelhados e surdo/sonoro separados no tempo | Específica do PB; validar com especialistas |
| 21 | **Ritmo de letras** (4–5/sem × 2–4/sem) | Começa com 2–4 e sobe até 4–5 pela regra de aquisição | Mecanismo adaptativo do rel. 07 |
| 22 | **Som × nome da letra** | Som em foco; nome em botão separado, ensinado explicitamente | Evidência neural + BNCC |
| 23 | **Câmera**: espelho e camada 3 (rels. 01/03) × fora do MVP (05/10) | No MVP, nenhuma câmera; espelho local na V1; dica por câmera na V2 com PoC, A/B e ⚖️ | Biometria infantil; sem evidência de benefício |
| 24 | **ASR no domínio** | Sinal, não portão; caminho equivalente por toque; desligado em TDL/apraxia | Risco de falso "errou"; equidade regional |
| 25 | **Modelo de ASR**: Whisper/Vosk/Web Speech (rel. 18) × CTC fonêmico (rel. 22) | CTC fonêmico para leitura e pronúncia; Whisper só em tarefa aberta | Whisper normaliza e produz falso acerto |
| 26 | **Modelo do aluno**: BKT (21) × Elo (20) | Elo hierárquico com semântica de domínio do BKT | Mais simples e robusto (Pelánek) |
| 27 | **Micro-recompensa no TDAH** (moeda a cada 30–60 s; "baú") | Estrela/som informativo, prêmio determinístico, sem moeda nem "baú" | Compatível com a D002 e o ECA Digital |
| 28 | **Ícone "baú"** (rel. 24) | Trocar o ícone | Evita sugerir loot box |
| 29 | **Surpresas**: figurinha bônus (rels. 04, 42) × sem surpresa econômica (rel. 38) | Surpresa **só no conteúdo** e no comentário da Sofia; nunca item ou moeda extra | Evita reforço de razão variável |
| 30 | **Bichinho com "saudade"** (rel. 37) × nunca (rels. 38, 08) | Nunca | Versão mais restritiva |
| 31 | **Selos e materiais** (rel. 37) × "uma moeda só" (rel. 38) | Uma moeda gastável + selos de domínio não gastáveis; materiais de missão só se forem não conversíveis e não expirarem — **[aguardando confirmação do dono]** | Mantém a economia simples |
| 32 | **Legendas** 100% (rel. 05) × sem legenda para pré-leitor (rel. 09) | Disponíveis sempre; ligadas por padrão para surdez e adultos | Requisito legal + carga cognitiva |
| 33 | **Login do responsável**: celular (26) × e-mail (31) | Celular/código padrão; e-mail opcional | Baixo letramento e acesso só por celular |
| 34 | **Relatório aos pais**: áudio + ícone (26) × gráficos (31) | Áudio + ícone principal; gráficos em "ver mais" | Inaf 2024 |
| 35 | **Dica automática** (30: só se pedir × 31: 5/10/20 s) | Tempos nas fases guiadas; suspensos/configuráveis no "você faz" | Reversão por especialização |
| 36 | **Alvo de toque e tipografia** (28 × 31) | Valores do rel. 31 (96/88/72 dp; letra 72, mín. 48) | Mais detalhados e ligados ao rel. 24 |
| 37 | **Paleta** (28 × 31) | Um só arquivo de tokens; a cor da vogal não coincide com a cor de alerta | Consistência; testar com crianças |
| 38 | **Normas de fluência** (H&T como ordem de grandeza × "não usar") | Metas só internas, como hipótese; nunca como norma aos pais | Não há norma brasileira |
| 39 | **Decodificabilidade** | ≥ 95% em F1–F2, ≥ 90% em F3–F4, F5 livre; acurácia mediana < 90% → revisão | Versão por fase do rel. 25 |
| 40 | **Voz no servidor** (reconto pontuado, rel. 41) × voz no aparelho (D004) | Voz no aparelho; reconto avaliado localmente ou por participação; upload só com consentimento específico | D004 e LGPD art. 14 |
| 41 | **Diário com termômetro de emoções** (40) × autorrelato efêmero (33/43) | Efêmero e não armazenado | Dado sensível; rel. 43 N3 |
| 42 | **Contato entre crianças** (rels. 37/40/42 × 33/38) | Nenhum no MVP; ranking nenhum, nem cooperativo para a criança | Segurança e ECA Digital |
| 43 | **Decreto do ECA Digital** (12.622/2025 × 12.880/2026) | Pendente; conferir no Planalto ⚖️ | Fontes secundárias divergem |
| 44 | **Nome do recurso de boca** ("Boquinha" nos relatórios) | **"Espelho do Som"** (nome de trabalho) | "Boquinhas" é marca INPI 2008; "Sofia" tem risco próprio |
| 45 | **"Vício positivo"** (D001) × termo proibido (rel. 15) | Só interno; externo = "vontade de voltar" | Zero neuromitos (D002) |
| 46 | **Horário da sessão** (07, 14, 15, 42) | Fim da tarde + revisão de manhã; janela noturna bloqueada | Integra as fontes sem prejudicar o sono |

---

## 6. Requisitos não funcionais

### 6.1 Desempenho em Android de entrada (rels. 24, 31)

| Requisito | Meta |
|---|---|
| Aparelho mínimo | Android 8.1+, **2 GB de RAM**, tela de 5" |
| Instalação inicial | **≤ 40 MB** |
| Pacote de lição | **≤ 5 MB** |
| RAM em uso | ≤ 250 MB |
| Abertura a frio | ≤ 3 s |
| Taxa de quadros | ≥ 30 fps estáveis (60 fps em aparelho bom) |
| Latência de feedback | visual < 100 ms; áudio < 300 ms; celebração ≤ 1,5 s (micro) e ≤ 2–3 s (bloco) |
| Áudio | Opus/AAC mono 32–48 kbps; fala −16 LUFS / −1 dBTP; fonema isolado sem compressão que achate o ataque; música 12–15 dB abaixo da fala, **muda com microfone aberto**; modo criança ≤ 75 dB(A) (OMS-ITU H.870); limitador master |
| Vídeo | H.264 720×720 a 30 fps + versão leve 480×480; áudio embutido; sincronia A/V entre −10 e +30 ms |
| Perfis por aparelho | até 40; troca de perfil em ≤ 2 toques |
| PoCs obrigatórias | Pronúncia on-device em Android de entrada; Sofia em Rive com 12 bocas; voz Azure com blend shapes |

### 6.2 Offline-first e conectividade (rels. 19, 24, 26)
- Trilhas baixadas no Wi-Fi; as lições do mês ficam no aparelho; fila local com sincronização posterior; PWA com service worker na web.
- **ASR, TTS pré-gerado, motor adaptativo e agendador rodam offline.** Os dados locais são criptografados.
- Modo compartilhado (1 tablet para vários alunos) e uso no celular do responsável.
- Consumo de dados baixo para famílias que acessam só pelo celular.

### 6.3 Acessibilidade (rels. 05, 24, 28, 31)
- Meta **WCAG 2.2 AA** + ajustes infantis: contraste ≥ 4,5:1 (texto) e ≥ 3:1 (ícones); nunca só cor; **0 flashes acima de 3/s**; `prefers-reduced-motion`; sem tempo limite por padrão; leitor de tela não bloqueado; todo arrastar tem alternativa por toque (WCAG 2.5.7); toda fala tem alternativa sem fala.
- **Alvos de toque**: botão principal ≥ 96 dp (recomendado 112–128); alternativas ≥ 88 dp; navegação ≥ 72 dp, nos cantos superiores; espaço entre alvos 16–24 dp; faixa inferior "morta" de 48–64 dp.
- **Gestos proibidos para a criança**: toque duplo, pressionar e segurar (reservado à porteira), pinça, *flick*, multitoque, sacudir. Telas fixas, sem rolagem. Na web, só clique simples, sem arrastar com mouse antes dos 9 anos.
- **Navegação sem texto**: a Sofia é o menu falado; ícones concretos; nada de ☰, ⋮ ou engrenagem na área infantil; todo alvo fala o **som** ao ser tocado; no máximo 2 toques do mapa à atividade.
- **Tipografia**: Andika para leitura (letra-alvo 72, mín. 48; palavra 48; frase 40; livro 32–36, ≤ 7 palavras por linha); Atkinson Hyperlegible ou Lexend na área adulta.
- **Critério de "pronto"** de cada tela ou jogo: ≥ 80% de sucesso sem ajuda e < 15% de toques fora do alvo, com 5–8 crianças por faixa etária; área adulta testada com 5 professoras + 5 responsáveis.

### 6.4 Segurança e engenharia (D004 §2; rels. 03, 31)
- **Monorepo** (Turborepo/pnpm/TypeScript): `apps/mobile` (Expo), `apps/web` (Next.js), `packages/games|sofia|speech|vision|core|ui`. Jogos 2D (PixiJS) num pacote compartilhado. Supabase/Postgres com **RLS por papel**. Esta stack é a **recomendação do rel. 03** e pode ser revista pelas propostas de execução.
- **Autenticação forte para adultos**; segredos fora do código; tokens curtos emitidos pelo servidor para serviços de nuvem; criptografia em trânsito e em repouso; **logs sem dados pessoais**; varredura de dependências e de segredos; sem bibliotecas abandonadas; **sem GPL/AGPL no código fechado** (isolar como serviço); licenças em CSV.
- Ambientes de **desenvolvimento, homologação e produção separados**; infraestrutura como código; backups e plano de recuperação; observabilidade com alertas e **métricas éticas** de engajamento.
- Qualidade: testes de unidade, integração e ponta a ponta; lint/format; revisão obrigatória; CI em todo PR; ADRs. É preciso criar o branch `main` antes de iniciar (D004).
- Conteúdo: **linter de decodificabilidade bloqueante**; pipeline de histórias com LLM **só offline**, temperatura baixa, validador de grafemas pt-BR, filtros de segurança e cultura e **revisão humana obrigatória**; áudios e JSON de visemas **versionados** no CDN; conjunto de regressão do ASR (os fornecedores não fixam versão).
- Publicação para web e lojas (Apple Kids / Google Families), com versionamento e rollback.

---

## 7. Métricas de sucesso

**Princípio**: engajamento e aprendizagem são reportados **separadamente**; os dados do jogo são resultado **secundário** e a medida principal é externa (rels. 27, 30). **Não otimizar** tempo de tela, sessões por dia nem toques por minuto (rels. 08, 42).

### 7.1 Aprendizagem

| Métrica | Definição / meta inicial | Fonte |
|---|---|---|
| Distribuição no Termômetro 0–10 | % por nível e % no nível 10, por coorte e tempo de exposição | D004 |
| Domínio real | Domínio com transferência e retenção (seção 4.5); retenção a 30 dias como métrica do agendador | rels. 07, 35 |
| Índice de transferência | IT < 0,7 = "decorou o jogo" (limiar proposto) | rel. 35 |
| Gap real × pseudopalavra | > 25 p.p. = leitura por forma (limiar proposto) | rel. 35 |
| Fluência | Precisão + PCPM e sílabas/min, contra metas internas provisórias | rels. 20, 25 |
| Validade externa | Correlação ≥ 0,6 com instrumento externo (200–300 crianças) | rel. 20 |
| Efeito causal | ECR por conglomerado pré-registrado (60–100 turmas; MDES ≈ 0,17–0,22 DP), avaliador externo, publicação mesmo se nulo; ITT e CACE | rel. 27 |
| Aprendizagem por minuto | Métrica de eficiência, em vez de minutos por usuário | rel. 42 |

### 7.2 Engajamento saudável

| Métrica | Meta inicial | Fonte |
|---|---|---|
| Retorno voluntário | Dias diferentes com sessão por semana, dentro da dose-alvo (não "mais é melhor") | rels. 04, 08, 27 |
| Encerramento tranquilo | ≥ 80% dos pais respondendo "foi fácil parar" | rel. 42 |
| Fim natural | ≥ 70% das sessões encerradas pelo ritual | rel. 38 (E10) |
| Uso noturno | ~0% de sessões após o corte | rel. 42 |
| Sentinela de superjustificação | Queda > 20% em 2 meses na leitura voluntária → revisão | rel. 38 (E8) |
| Saúde da economia | Gasto/ganho 0,6–0,9; ≥ 40% das moedas de marcos + revisão + história; renda de crianças com dificuldade ≥ 0,8 da mediana | rel. 38 |
| Dose e fidelidade | min/aluno/semana; cobertura; tempo em tarefa | rels. 26, 31 |

### 7.3 Equidade e qualidade técnica

| Métrica | Meta inicial | Fonte |
|---|---|---|
| FRR do ASR | ≤ 5% em produções corretas, **por região, idade, sexo e rede**, com diferença máxima monitorada | rel. 22 |
| Acordo ASR × juízes | ≥ 90% para um item entrar no cálculo | rels. 20, 31 |
| DIF | Auditoria antes de qualquer número publicado | rels. 20, 43 |
| Decodificabilidade | Linter ≥ 95%/90% por fase; textos com acurácia mediana < 90% voltam para revisão | rel. 25 |

### 7.4 Negócio (metas numéricas a definir pelas propostas de execução)
- Conversão freemium → pago (no fim de R2a); churn mensal; CAC; LTV; custo de voz/ASR por criança (meta: **bem abaixo de R$ 10 por criança/ano**); municípios em CPSI/ARP; alunos B2G ativos (meta de 5 anos: 60–300 mil, hipótese do rel. 27); matriz CIEB NT 29 preenchida.

---

## 8. Riscos principais e mitigação

| # | Risco | Prob. / impacto | Mitigação |
|---|---|---|---|
| 1 | **App sem adulto rende ~0** (GraphoGame) e o B2C em casa rende menos que na escola | Alta / alto | Painel do professor como intervenção; missões para a família; "ler para alguém"; modo estação; guia estruturado |
| 2 | **Superjustificação pela economia** | Média / alto | Entrega no fim; marcos > repetição; teto e antifarming; modo "só estrelas"; piloto com 3 braços; sentinela E8 |
| 3 | **ASR diz "errou" quando o erro é dele**; viés regional | Alta / alto | Verificação contra alvo; tolerância assimétrica; variantes aceitas; FRR por região; corpus próprio de 5 regiões; caminho por toque |
| 4 | **Não conformidade com o ECA Digital e a LGPD** (voz, economia, idade, decreto) | Média / muito alto (multa de até 10%) | Parecer jurídico **antes do piloto**; privacidade por arquitetura; sem SDK de terceiros; consentimentos granulares |
| 5 | **Engajamento sem aprendizagem** (mundo aberto, avatar, vila) | Média / alto | Core loop = decodificar; domínio libera; medir fora do jogo; braço sem vila no piloto |
| 6 | **Promessa exagerada / neuromitos** | Média / alto (reputação) | 16 frases proibidas; checklist de zero neuromitos; página "A ciência do FONEMA"; conselho científico externo |
| 7 | **Marca** ("Sofia" × Disney; "Boquinhas") | Média / médio | Busca no INPI; marca composta; "Espelho do Som" |
| 8 | **Custo de voz e ASR na nuvem** inviabiliza o B2G | Alta / alto | On-device; TTS pré-gerado; nuvem só amostral e sem retenção |
| 9 | **Normas inexistentes no Brasil** (PCPM, latência, risco) | Certa / médio | Tratar como hipótese; coorte ≥ 500/série; recalibração trimestral; rodapé "não é nota Saeb" |
| 10 | **Ciclo lento de venda pública** (eleição em 2028) | Alta / alto | B2C + escolas privadas primeiro; CPSI; filantropia |
| 11 | **Sobrecarga do professor** e pouca formação para dados | Alta / médio | "Três perguntas"; começar com 5 visualizações; indicador com "o que fazer agora" |
| 12 | **Infraestrutura escolar** (< 50% com internet para alunos) | Alta / alto | Offline-first; 1–5 tablets por turma; modo projetor; kit impresso |
| 13 | **Transversais roubam tempo** da alfabetização | Média / médio | ≤ 1 missão transversal por sessão; toda missão exige leitura; só a alfabetização tem gate |
| 14 | **Conteúdo decodificável artificial** ou culturalmente inadequado | Média / médio | Revisão humana; textos com sentido; consultoria em ERER e cultura indígena; saída cedo para textos livres |
| 15 | **RCT nulo** | Média / alto | Pré-registro; dose e fidelidade medidas; publicar mesmo se nulo; desenho com pré-teste |
| 16 | **Apego e confusão pessoa/máquina** com a Sofia | Baixa / médio | A Sofia diz que é programa; nunca triste; sem amizade simulada; fading |
| 17 | **Ficar tempo demais em decodificáveis** ou parar no nível da palavra | Média / médio | Saída por desempenho; trilha de textos ricos de escuta; escrita e compreensão desde cedo |

---

## 9. Pendências de verificação (consolidadas e priorizadas)

**Prioridades:** **P0** = antes do piloto ou de qualquer material público · **P1** = durante a construção do MVP · **P2** = antes de escalar.

### 9.1 Conferir à mão (fonte primária, em outra rede)

| Prior. | Item | Origem |
|---|---|---|
| P0 | **Textos legais no Planalto**: LGPD (arts. 5º II, 11, 14), ECA Digital (Lei 15.211/2025; arts. 2º IV, 9º, 20, 22) e **número do decreto** (12.880/2026 × 12.622/2025), ECA (art. 17), LBI (arts. 28, 63), Leis 12.764, 14.254, 10.436, 6.965; decretos 9.765/2019, 11.556/2023, 12.191/2024; Lei 15.247/2025 (CNCA) | Blocos A, B, C, D |
| P0 | **BNCC no documento oficial**: EI03EF01–09, EF01LP01–13, EF12LP01/03/19, EF02LP01–08; BNCC Computação (EI03CO01–11, EF01CO, EF02CO); Matemática (EF01MA, EF02MA); EI03EO, EI03ET, EI03TS; competências gerais 5, 8 e 9; Temas Contemporâneos Transversais; redação sobre cursiva | Blocos A, B, D |
| P0 | **ICA 2021–2025**, 743 pontos, valores por UF (CE 85,3% × ≈ 80%); learning poverty (48%) e PIRLS 2021 (61%); PDFs do MEC que deram 404 | Blocos A, B, C |
| P0 | Censo Escolar 2024, TIC Educação/Domicílios 2024, Inaf 2024, SIDRA (4–8 anos), Sinopses do Inep, VAAF-MIN do Fundeb | Bloco C |
| P1 | Referências não encontradas: Leitner 1972 (base do agendador), Bjork & Bjork 2011, Dias & Seabra 2013, Capovilla & Capovilla 2004, Capellini et al. 2012, revisão espanhola 2024; McWeeny et al. 2022 | Blocos A, B |
| P1 | Candidatos DOI não aceitos: Clackmannanshire (Johnston & Watson 2004), Haebig/Leonard 2021, Boquinhas (RIAEE), CoDAS, Rev. CEFAC, GraphoGame no SBIE; artigo original do grupo de Sidarta Ribeiro (*Current Biology*); entidade "ABNE" | Bloco A |
| P1 | Números marcados "conferir no PDF", "[NV]" ou "de memória": Hasbrouck & Tindal; corte do PSC 2026; valores d do rel. 26; rel. 41 inteiro; Lomas et al.; Core Knowledge (seguimento); Koepp 1998; Hutton 2020 (erratas) | Blocos B, C, D |
| P1 | Normas fonológicas clássicas (Lamprecht 2004, Yavas 1991, ABFW); licença da ICS-BP; divergência do /ʎ/ | Bloco C |
| P1 | Disponibilidade e licença de LexPorBR, ESCOLEX, Pinheiro (1996), CHILDES-pt, LetsRead | Bloco B |
| P1 | Licenças de software: Rhubarb, Spine, Victory Native XL, Fish Speech, vozes Piper, ricky0123/vad, MLS, GCompris; preços do Rive; tabela dos 22 Viseme IDs × pt-BR | Blocos A, C |
| P2 | Bibliografia: **56 países na base × 57 na D001**; auditoria da correspondência DOI × título (indício de erro no 1º registro do Brasil); revisão manual das obras-chave (a classificação é automática) | Bloco D |
| P2 | Lacunas de cobertura internacional (Equador, Peru, Chile, PALOP, Alemanha etc.); revalidar os diferenciais D1–D11; preços de concorrentes nas lojas | Blocos B, C |

### 9.2 Precisa de advogado ⚖️

| Prior. | Questão |
|---|---|
| P0 | Economia de moedinhas, lojinha fictícia e "bônus de paciência" × ECA Digital (definição de caixa de recompensa) e regras das lojas |
| P0 | Voz infantil: é dado biométrico? Base legal do ASR on-device, da gravação para o professor ("fila de escuta") e para o responsável ("ouça seu filho ler"); corpus de pesquisa (CEP/CONEP + LGPD) |
| P0 | Verificação/aferição de idade e vínculo de contas (ECA Digital + orientações da ANPD); porteira parental × consentimento |
| P0 | Base legal da **sinalização de risco** (dado de saúde inferido); limiar de n mínimo nos agregados; compartilhamento com a escola |
| P0 | Oferta de assinatura só ao adulto; "ponte em obras" sem pressão à criança; Resolução CONANDA 163/2014 |
| P1 | Contratos: operador de nuvem (região, retenção, sem treino), transferência internacional; voz da dubladora e clonagem (PLs 3392/2024, 4041/2025); cessão musical × ECAD; imagem de crianças nos vídeos e no marketing (ECA art. 17) |
| P1 | Marcas no INPI: "Sofia", "Bolota", "Espelho do Som"/"Boca da Sofia", "FONEMA" (classes 9, 41, 28); distância de "Boquinhas" e "Princesinha Sofia" |
| P1 | Contratação pública **por aluno/mês** em pregão/ARP e CPSI (Lei 14.133/2021, LC 182/2021) |
| P2 | Res. CFFa 580/2020 e normas posteriores (modo fonoaudiólogo); COPPA/GDPR/AI Act se houver expansão; desfecho da ação no STF contra o ECA Digital |

### 9.3 Validar em piloto (hipóteses de produto)

| Prior. | Item |
|---|---|
| P0 | **Ordem dos sons, Escala 0–10 e descritores**, tabela articulatória, matriz de tolerância de fala e critérios de encaminhamento: com especialistas (pedagogia, fonoaudiologia, linguística) e **Conselho Consultivo de Fonoaudiologia** |
| P0 | **PoC de pronúncia** (30–50 crianças de 5–7 anos): CTC fonêmico on-device × alternativas; FRR ≤ 5%; teste por região |
| P0 | **A/B do Espelho do Som** (vídeo + corte + letra × letra + som) antes da produção em lote; piloto de 3 fonemas (/m/, /a/, /p/) com 10–15 crianças |
| P0 | Playtest da Sofia e do Bolota com crianças de 4–7 anos em ≥ 3 regiões (20–30 crianças); paleta; protocolo de usabilidade do rel. 24 |
| P1 | **Economia**: 3 braços (sem vila/lojinha; com vila; com vila + lojinha); E8; calibrar R, teto, preços e bônus para 5 sessões/semana |
| P1 | Recorte gratuito (duração real até o fim de R2a) e conversão; van Westendorp (300+ pais, base mensal) |
| P1 | Parâmetros do motor: alvo de 85% (A/B 75/85/95%), Elo (a = 0,8; b = 0,05), agendador v0, latências-alvo, critério de domínio e provinhas (8/10; 85%/75%) |
| P1 | Durações, orçamento de sessão, slot rotativo, frequência de 5 dias, pausas, tempos de dica (5/10/20 s), parâmetros dos modos TEA/TDAH/dislexia (com terapeutas e famílias) |
| P1 | Decodificabilidade (95%/90%; ≥ 4 repetições da CGF-foco); limiares IT < 0,7 e gap > 25 p.p.; 300–350 palavras em 2 anos |
| P1 | Painel do professor com 5 professoras; mensagens aos pais (SMS × WhatsApp texto × áudio) |
| P2 | Coorte ≥ 500 por série para normas de PCPM, latência e risco; correlação ≥ 0,6 com instrumento externo; janela única de Tier 2/alerta (6–10 semanas) |
| P2 | Medidas das transversais (roteiro de validade em 8 etapas do rel. 43; DIF); TechCheck/TEMA-3 como critério externo |
| P2 | RCT por conglomerado pré-registrado (ano letivo de 2028); ICC real para o cálculo de poder |

---

## 10. Índice de todos os documentos do repositório

### 10.1 Síntese
- [00 — Documento Mestre (este documento)](00-documento-mestre.md)
- [Bloco A — relatórios 01 a 15](bloco-A-01-15.md)
- [Bloco B — relatórios 16 a 25 + auditorias de validação](bloco-B-16-25.md)
- [Bloco C — relatórios 26 a 31](bloco-C-26-31.md)
- [Bloco D — relatórios 32 a 43 + bibliografia](bloco-D-32-43.md)

### 10.2 Decisões do dono
- [001 — Jornada de 2 anos e modelo de preços mensal](../decisoes/001-jornada-e-modelo-de-precos.md)
- [002 — Cadastro pelo adulto, economia de moedinhas, avatar e educação financeira](../decisoes/002-economia-virtual-avatar-educacao-financeira.md)
- [003 — Formação integral e aprendizagem profunda](../decisoes/003-formacao-integral-e-aprendizagem-profunda.md)
- [004 — Termômetro da alfabetização e próxima fase (infraestrutura)](../decisoes/004-termometro-alfabetizacao-e-proxima-fase.md)

### 10.3 Relatórios de pesquisa
| # | Relatório | # | Relatório |
|---|---|---|---|
| 01 | [Método fônico no mundo](../pesquisa/01-metodo-fonico-mundo.md) | 23 | [Agente pedagógico Sofia](../pesquisa/23-agente-pedagogico-sofia.md) |
| 02 | [Brasil: BNCC e fonética do PB](../pesquisa/02-brasil-bncc-fonetica-pb.md) | 24 | [UX/UI para crianças](../pesquisa/24-ux-ui-criancas.md) |
| 03 | [GitHub e tecnologia](../pesquisa/03-github-tecnologia.md) | 25 | [Conteúdo: decodificáveis e fluência](../pesquisa/25-conteudo-decodificaveis-fluencia.md) |
| 04 | [Mercado, jogos e engajamento](../pesquisa/04-mercado-jogos-engajamento.md) | 26 | [Família, professores e escolas](../pesquisa/26-familia-professores-escolas.md) |
| 05 | [Inclusão, acessibilidade e legal](../pesquisa/05-inclusao-acessibilidade-legal.md) | 27 | [Mercado e modelo de negócio](../pesquisa/27-mercado-modelo-negocio.md) |
| 06 | [Neuro: cérebro leitor](../pesquisa/06-neuro-cerebro-leitor.md) | 28 | [Arte, animação e áudio](../pesquisa/28-arte-animacao-audio.md) |
| 07 | [Neuro: memória e retenção](../pesquisa/07-neuro-memoria-retencao.md) | 29 | [Fonoaudiologia e articulação](../pesquisa/29-fonoaudiologia-articulacao.md) |
| 08 | [Neuro: dopamina e motivação](../pesquisa/08-neuro-dopamina-motivacao.md) | 30 | [Ciências da aprendizagem e jogos](../pesquisa/30-ciencias-aprendizagem-jogos.md) |
| 09 | [Neuro: atenção e carga cognitiva](../pesquisa/09-neuro-atencao-carga-cognitiva.md) | 31 | [Funcionalidades, gráficos e design](../pesquisa/31-funcionalidades-graficos-design.md) |
| 10 | [Neuro: fala e multissensorial](../pesquisa/10-neuro-fala-multissensorial.md) | 32 | [Pensamento computacional](../pesquisa/32-pensamento-computacional.md) |
| 11 | [Neuro: dislexia](../pesquisa/11-neuro-dislexia.md) | 33 | [Inteligência emocional](../pesquisa/33-inteligencia-emocional.md) |
| 12 | [Neuro: TEA e TDAH](../pesquisa/12-neuro-tea-tdah.md) | 34 | [Raciocínio lógico e educação financeira](../pesquisa/34-raciocinio-logico-educacao-financeira.md) |
| 13 | [Neuro: emoção, erro e feedback](../pesquisa/13-neuro-emocao-erro-feedback.md) | 35 | [Aprendizagem profunda e transferência](../pesquisa/35-aprendizagem-profunda-transferencia.md) |
| 14 | [Neuro: desenvolvimento e música](../pesquisa/14-neuro-desenvolvimento-musica.md) | 36 | [Tecnologia e cidadania digital](../pesquisa/36-tecnologia-cidadania-digital.md) |
| 15 | [Neuroeducação e mitos](../pesquisa/15-neuroeducacao-mitos.md) | 37 | [Mundo aberto, progressão e avatar](../pesquisa/37-mundo-aberto-progressao-avatar.md) |
| 16 | [América Latina e espanhol](../pesquisa/16-america-latina-espanhol.md) | 38 | [Economia virtual e recompensas](../pesquisa/38-economia-virtual-recompensas.md) |
| 17 | [Europa](../pesquisa/17-europa.md) | 39 | [Currículo integrado e conhecimento](../pesquisa/39-curriculo-integrado-conhecimento.md) |
| 18 | [Ásia, Oceania e Oriente Médio](../pesquisa/18-asia-oceania-oriente-medio.md) | 40 | [Brincar, criatividade e produção](../pesquisa/40-brincar-criatividade-producao.md) |
| 19 | [África e organismos globais](../pesquisa/19-africa-organismos-globais.md) | 41 | [Linguagem oral e vocabulário](../pesquisa/41-linguagem-oral-vocabulario.md) |
| 20 | [Avaliação adaptativa](../pesquisa/20-avaliacao-adaptativa.md) | 42 | [Neuro: jogo e telas](../pesquisa/42-neuro-jogo-telas.md) |
| 21 | [IA na educação infantil](../pesquisa/21-ia-educacao-infantil.md) | 43 | [Avaliação das competências transversais](../pesquisa/43-avaliacao-competencias-transversais.md) |
| 22 | [ASR infantil (acadêmico)](../pesquisa/22-asr-infantil-academico.md) | — | — |

**Auditorias de validação (Etapa 2):** [validação 01–15](../pesquisa/validacao-01-15.md) · [validação 16–25](../pesquisa/validacao-16-25.md)

### 10.4 Bibliografia
- [README da bibliografia validada](../bibliografia/README.md) (16.847 trabalhos, 56 países)
- [Planilha (xlsx)](../bibliografia/bibliografia_fonema.xlsx) · [CSV](../bibliografia/bibliografia_fonema.csv) · [Base completa validada (csv.gz)](../bibliografia/base_completa_validada.csv.gz)
- Listas por país em [`../bibliografia/paises/`](../bibliografia/paises/): [AO](../bibliografia/paises/AO.md) · [AR](../bibliografia/paises/AR.md) · [AT](../bibliografia/paises/AT.md) · [AU](../bibliografia/paises/AU.md) · [BE](../bibliografia/paises/BE.md) · [BR](../bibliografia/paises/BR.md) · [CA](../bibliografia/paises/CA.md) · [CH](../bibliografia/paises/CH.md) · [CL](../bibliografia/paises/CL.md) · [CN](../bibliografia/paises/CN.md) · [CO](../bibliografia/paises/CO.md) · [CZ](../bibliografia/paises/CZ.md) · [DE](../bibliografia/paises/DE.md) · [DK](../bibliografia/paises/DK.md) · [EG](../bibliografia/paises/EG.md) · [ES](../bibliografia/paises/ES.md) · [FI](../bibliografia/paises/FI.md) · [FR](../bibliografia/paises/FR.md) · [GB](../bibliografia/paises/GB.md) · [GH](../bibliografia/paises/GH.md) · [GR](../bibliografia/paises/GR.md) · [HK](../bibliografia/paises/HK.md) · [HU](../bibliografia/paises/HU.md) · [ID](../bibliografia/paises/ID.md) · [IE](../bibliografia/paises/IE.md) · [IL](../bibliografia/paises/IL.md) · [IN](../bibliografia/paises/IN.md) · [IR](../bibliografia/paises/IR.md) · [IS](../bibliografia/paises/IS.md) · [IT](../bibliografia/paises/IT.md) · [JP](../bibliografia/paises/JP.md) · [KE](../bibliografia/paises/KE.md) · [KR](../bibliografia/paises/KR.md) · [MX](../bibliografia/paises/MX.md) · [MY](../bibliografia/paises/MY.md) · [MZ](../bibliografia/paises/MZ.md) · [NG](../bibliografia/paises/NG.md) · [NL](../bibliografia/paises/NL.md) · [NO](../bibliografia/paises/NO.md) · [NZ](../bibliografia/paises/NZ.md) · [PE](../bibliografia/paises/PE.md) · [PH](../bibliografia/paises/PH.md) · [PL](../bibliografia/paises/PL.md) · [PT](../bibliografia/paises/PT.md) · [RO](../bibliografia/paises/RO.md) · [RU](../bibliografia/paises/RU.md) · [SA](../bibliografia/paises/SA.md) · [SE](../bibliografia/paises/SE.md) · [SG](../bibliografia/paises/SG.md) · [TH](../bibliografia/paises/TH.md) · [TR](../bibliografia/paises/TR.md) · [TW](../bibliografia/paises/TW.md) · [US](../bibliografia/paises/US.md) · [UY](../bibliografia/paises/UY.md) · [VN](../bibliografia/paises/VN.md) · [ZA](../bibliografia/paises/ZA.md)

### 10.5 Ferramentas
- [Coleta bibliográfica (`coletar.py`)](../../tools/bibliografia/coletar.py) · [Exportação (`exportar.py`)](../../tools/bibliografia/exportar.py) · dados brutos e logs em [`../../tools/bibliografia/data/`](../../tools/bibliografia/data/)

---

*Fim do Documento Mestre v1. Próximos passos: (1) o dono confirma os itens marcados "[aguardando confirmação do dono]" (entrega das moedinhas no fim da sessão; selos de domínio); (2) as pendências P0 da seção 9 são resolvidas antes do piloto; (3) as 5 propostas de execução partem desta especificação e registram as divergências como ADRs em `docs/decisoes/`.*
