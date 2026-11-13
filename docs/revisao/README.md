# Revisão geral do FONEMA (macro → micro)

> **O que é.** Uma leitura crítica de toda a base: pesquisa (rels. 01–43 e validações), bibliografia (16.847 refs, 56 países), síntese (documento mestre e blocos A–D), decisões 001–022, produto (proposta 06: jornada, jogo completo 01–08, painéis v2, WhatsApp, Academia, arquitetura, Espelho do Som, universo). Data: 13/11/2026. Revisor: agente revisor geral.
> **Regra.** Este relatório **não muda decisões nem documentos de produto**. Ele aponta o que está bom, o que falta e o que melhorar, com evidência. As poucas correções factuais feitas estão listadas no fim desta página.
>
> Arquivos: [01 · Achados detalhados](01-achados-detalhados.md) · [02 · Recomendações priorizadas](02-recomendacoes-priorizadas.md) · [03 · Checklist da ciência da leitura](03-checklist-ciencia-da-leitura.md) · [04 · Perguntas para o dono](04-perguntas-para-o-dono.md)

## Veredito em 4 linhas
1. A **base científica e a síntese estão acima do padrão** de qualquer edtech de alfabetização que conhecemos em pt-BR: princípios com nível de evidência, critério de domínio em 4 condições, ASR que "nunca é juiz", privacidade por arquitetura e adulto no circuito.
2. O **problema não é falta de pesquisa**, é **deriva**: as decisões de gamificação mais recentes (D018, D019, D021, D022) reintroduzem padrões que a própria pesquisa do projeto proíbe ("se fizer X ganha Y", ranking, coleção infinita), e o roteiro cena a cena ficou **forte no código e fraco em linguagem e compreensão**.
3. A **avaliação** está bem desenhada no papel, mas o produto não tem **marco fixo de rastreio** (início/meio/fim de ano, checagem fônica), e o termômetro 0–10 tem níveis fora de ordem.
4. O **escopo cresceu muito mais rápido que a validação**: nenhuma das PoCs obrigatórias (fala no aparelho, Espelho do Som, app ≤ 40 MB) nem o parecer jurídico P0 estão feitos, enquanto mundo 3D, série, Academia, Maternal, universo e modo online avançam.

## Nota por dimensão (0–10)

| Dimensão | Nota | Em uma linha |
|---|---|---|
| Base de evidência (pesquisa, bibliografia, rigor) | **8,5** | Ampla e honesta; mas o rel. 02 (Brasil/BNCC) tem 49 de 52 refs "não checáveis" e os rels. 26–43 não tiveram rodada de validação |
| Código: consciência fonológica, fônica, decodificação | **8,5** | Sons e não nomes, pseudopalavras, domínio com transferência e retenção, Espelho do Som |
| Sequência grafêmica do PB | **7** | Ordem boa e específica do PB; ritmo da jornada 3–5× mais lento que a regra de taxa do próprio doc. mestre; texto conectado, CVC e vogais átonas chegam tarde |
| Linguagem oral, vocabulário e compreensão (no produto) | **5,5** | Muito bem fundamentada na síntese (P12), quase ausente nas cenas do Ano 1 |
| Escrita e ortografia | **6,5** | Ditado, traçado e regras de contexto existem; escrita inventada e codificação entram tarde; acentuação e sílaba tônica não aparecem |
| Princípios N1–N12 aplicados | **8** | Cada cena tem N marcado; N10 (curiosidade) e N7 (intercalação) muito bem; N12 é ameaçado pela deriva da gamificação |
| Avaliação e monitoramento | **6,5** | Critério de domínio exemplar; falta marco fixo, checagem fônica, plano psicométrico e triagem operacionalizada |
| Inclusão | **7** | TEA, TDAH, dislexia e Down com parâmetros concretos; faltam gagueira, deficiência motora, cegueira (escopo), escolas indígenas e migrantes |
| Engajamento ético | **6** | Salvaguardas S1–S13 e ritual de fim exemplares; D018/D019/D021/D022 contradizem P10 e o rel. 08 |
| Professor e família | **7,5** | Painel "3 perguntas", WhatsApp cuidadoso, Academia 40 h; falta medir carga real do professor |
| Coerência entre documentos | **6,5** | Quadro de conflitos e QUALIDADE.md bons; doc. mestre parado na D018; vários conflitos novos não registrados |
| Privacidade e legal | **7** | Arquitetura exemplar; todos os pontos P0 de advogado seguem abertos |
| Viabilidade técnica, custo e escopo | **5,5** | Arquitetura sólida, mas infra ≈ 24–48% da receita B2G a 100 mil alunos e escopo sem corte |
| Universo e valores (consistência) | **7** | Bíblia canônica bem mantida; risco de D012 em contrato público não analisado |
| **Geral** | **≈ 7,0** | Projeto excelente no papel, precisa de **freio de escopo, reconciliação da gamificação e validação** antes do piloto |

## 10 maiores forças
1. **Documento mestre** com 15 princípios graduados por evidência (A–D), 46 conflitos resolvidos e pendências priorizadas P0–P2 (`sintese/00-documento-mestre.md` §3, §5, §9). Raro em qualquer projeto.
2. **Critério de domínio em 4 condições**: prática + generalização + transferência fora do formato + retenção 24 h–7 d, com pseudopalavras obrigatórias (doc. mestre §4.5). Isso ataca o "decorou o jogo" do GraphoLearn.
3. **ASR como sinal, nunca portão**: tolerância assimétrica, variantes regionais nunca são erro, matriz por idade, "leitura ≠ fala", caminho por toque, FRR por região (doc. mestre §4.8; rels. 22, 29).
4. **Privacidade por arquitetura**: voz no aparelho, sem áudio cru na nuvem, sem SDK de terceiros, sem inferência de emoção, consentimento por finalidade (doc. mestre §4.15; `arquitetura-infra/seguranca-privacidade.md`).
5. **Adulto no circuito como parte da intervenção** (P11: GraphoGame g = −0,02 sozinho × 0,48 com adulto): painel do professor "quem precisa de mim hoje", grupos e plano de amanhã (`paineis-v2/README.md` P1–P11).
6. **Fim natural e proteção do sono**: ritual sem botão "continuar", janela noturna, sem streak, nada se perde (doc. mestre §4.4; `jogo-completo/07` §8).
7. **Modos de inclusão com parâmetros concretos** (Previsível, Foco curto, Reforço de leitura, Palavra inteira) e nenhuma alegação terapêutica (doc. mestre §4.13).
8. **Espelho do Som** com estrutura fixa, corte lateral nos pares que o rosto não distingue, 2 fonoaudiólogas por clipe e boca como modelo controlável, não imagem de IA (doc. mestre §4.7; D020; `espelho-do-som-3d/README.md`).
9. **Honestidade de comunicação**: 16 frases proibidas, "vício positivo" só interno, nível nunca desce, previsão em faixa, rodapé "não é nota Saeb" (doc. mestre §3 corolários, §4.5).
10. **Encaixe no sistema brasileiro**: lições de Sobral/PAIC, CPSI, offline-first, Android de 2 GB, WhatsApp só com adultos e duplo opt-in (rel. 26; `whatsapp/README.md`).

## 10 maiores lacunas e riscos
1. **Gamificação contra a própria evidência**: "Ao chegar ao nível X, você ganha Y" (D019; `jogo-completo/07` §5), cadeado "Leia 5 palavras com M para desbloquear" (D021) e níveis que sobem por volume de tentativas são exatamente o formato que o rel. 08 manda evitar ("leia 10 palavras e ganhe um chapéu", linha 115; Deci, Koestner & Ryan 1999).
2. **Ranking por esforço** (D018; `jogo-completo/README.md` §6) contradiz o doc. mestre §4.12 (anti-padrão), o conflito 42, a salvaguarda S3 do rel. 38 e a lista vermelha do rel. 42.
3. **Linguagem e compreensão quase ausentes no Ano 1 do produto**: "vocabulário" aparece 0 vez em R0–R6; "compreensão", 1 vez por arquivo; a Hora da História quase não aparece. Risco Reading First (ganho em decodificação, zero em compreensão; P1/P12).
4. **Ritmo da jornada incoerente com a regra de taxa**: o doc. mestre §4.3 pede 2–5 grafemas novos por semana; a jornada dá ~0,4–1 por semana (R2a: M, L, F em 4 semanas; R3: 4 letras em 10). Frases só em R4 (~6º mês), CVC e nasais em R6–R7 (~10º–15º mês), vogais átonas finais em R7, embora SAPO e BOLO apareçam desde R2. Rel. 01: em ortografias como a nossa, a base do código cabe em ~1 ano.
5. **Avaliação sem marco fixo**: o benchmark trimestral do doc. mestre não chegou ao produto; não há checagem fônica no modelo inglês/australiano (rels. 01, 18, 20); o termômetro tem níveis fora de ordem (R6: 6◐ → 5●; R8: 7 → 6●–7) e não há plano de confiabilidade das provinhas.
6. **Triagem de risco de dislexia não operacionalizada** no produto (sem RAN na sondagem, sem regra de persistência nem protocolo de encaminhamento por rede); **gagueira** não aparece em síntese nem produto, e a fluência cronometrada pode puni-la.
7. **Escopo sem freio**: mundo 3D, série, Academia (80 itens), Maternal, universo, online e idiomas avançam antes das PoCs P0 (fala no aparelho, A/B do Espelho, binário ≤ 40 MB). A infra estimada (~R$ 1/aluno/mês a 100 mil) consome 24–48% da receita B2G (`arquitetura-infra/README.md` l. 494).
8. **Legal P0 inteiro em aberto** (ECA Digital e decreto, voz como biometria, lojinha, sinalização de risco), e a base Brasil/BNCC é a menos verificada (rel. 02: 3 de 52 verificadas). Rels. 26–43 sem rodada de validação.
9. **"Sem pular fases" + Trilha Expressa fase a fase**: uma criança de 7–8 anos que já lê pode levar dezenas de sessões revendo o que sabe (89 fases); o professor não consegue alinhar a turma ao currículo. Risco de tédio, abandono e atrito com a escola.
10. **Contexto público não analisado**: D012 (perfil confessional) em contrato com rede pública (Estado laico; LDB art. 26-A, ensino de história e cultura afro-brasileira e indígena) e o Maternal (2–3 anos) com base de pesquisa feita para 4–8 anos. Ambos pedem parecer e validação.

## Correções factuais feitas nesta revisão (commit próprio)
| Arquivo | Correção |
|---|---|
| `decisoes/README.md` | Tabela parava na D019: incluídas D020, D021 e D022; conflito "títulos com gênero → D022" no quadro |
| `INDICE.md` | "Tabela 001–019" → 001–022; linhas das D020–D022 |
| `decisoes/019-progressao-vilao-familia.md` | Nota "Atualizado pela D022" nos títulos (regra da CONVENCOES) |
| `propostas/06-fonema-unificada/academia/README.md` | 3 menções a "a Roda" como nome da Academia → "a Academia" (D011) |

Correções que **não** foram feitas porque mexem em pastas em edição por outros agentes ou exigem decisão estão em [02](02-recomendacoes-priorizadas.md) (R-25 a R-27).
