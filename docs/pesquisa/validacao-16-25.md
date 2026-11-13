# Validação das referências — relatórios 16 a 25 (Etapa 2)

> Data: 13/11/2026. Escopo: todas as linhas das tabelas de referências dos relatórios 16–25, mais as 5 "referências canônicas" listadas fora da tabela no relatório 16. Nenhum DOI foi digitado à mão: só entram DOIs devolvidos pelo Crossref ou pelo PubMed.

## Método

1. Um script extraiu cada linha das tabelas (autor, ano, título, URL/DOI, tipo).
2. **Com DOI** (na coluna ou embutido na URL): `api.crossref.org/works/<DOI>`. Título, 1º autor e ano foram comparados com a tabela. Se o DOI não estava no Crossref, `doi.org` foi consultado.
3. **Sem DOI, ou com DOI de outra obra:** busca `query.bibliographic` no Crossref (autor + título + ano). O resultado só foi aceito com título e autor coincidentes (similaridade de tokens alta). Depois vieram o ERIC (`api.ies.ed.gov`, por título) e o PubMed (`esearch`/`esummary`, por título).
4. **URLs:** `curl -L` com tempo-limite de 20 s e pausa de 0,3 s entre chamadas. Código 200 conta como página ativa. Recusa do proxy (código 000/403) conta como "não checável", e não como fonte falsa.
5. Casos ambíguos foram revistos à mão: título descritivo na tabela, DOI que aponta para outra obra, autoria "a conferir" e preprint com versão publicada.

**Categorias:** VERIFICADA = existência e metadados principais confirmados. CORRIGIDA = a obra existe, mas a tabela tinha DOI, autoria, título ou vínculo errados (o certo foi registrado). NÃO ENCONTRADA = buscada no Crossref, ERIC e PubMed sem correspondência. NÃO CHECÁVEL = sem como conferir nesta rede (domínio bloqueado, livro ou teste fora das bases, documento sem URL).

## Resumo por relatório

| Relatório | Total | Verificadas | Corrigidas | Não encontradas | Não checáveis | DOIs acrescentados |
|---|---|---|---|---|---|---|
| 16 — América Latina e espanhol | 49 | 3 | 1 | 1 | 44 | 3 |
| 17 — Europa | 48 | 19 | 0 | 0 | 29 | 12 |
| 18 — Ásia, Oceania e Oriente Médio | 109 | 34 | 1 | 0 | 74 | 3 |
| 19 — África e organismos globais | 108 | 25 | 0 | 0 | 83 | 4 |
| 20 — Avaliação adaptativa | 50 | 26 | 1 | 0 | 23 | 10 |
| 21 — IA na educação infantil | 48 | 15 | 0 | 0 | 33 | 11 |
| 22 — ASR infantil (acadêmico) | 29 | 21 | 0 | 0 | 8 | 20 |
| 23 — Agente pedagógico Sofia | 44 | 29 | 4 | 0 | 11 | 19 |
| 24 — UX/UI para crianças | 44 | 18 | 1 | 0 | 25 | 7 |
| 25 — Conteúdo, decodificáveis e fluência | 51 | 40 | 0 | 0 | 11 | 32 |
| **Total** | **580** | **230** | **8** | **1** | **341** | **121** |

Fontes das confirmações: Crossref na grande maioria dos casos, depois ERIC, PubMed e páginas com HTTP 200 (Apple e Android Developers, ERIC). Em 3 itens verificados, o ano no Crossref difere em 1 da tabela (data on-line × impressa). A diferença ficou anotada na coluna, sem ser tratada como erro.

**Leitura dos números:**
- Das 580 entradas, 238 (41%) foram verificadas ou corrigidas. Isso inclui praticamente todos os artigos, capítulos e anais registrados no Crossref, ERIC ou PubMed. Só 1 entrada não foi encontrada.
- Os não checáveis são, na grande maioria, páginas web de governos, ONGs, imprensa e empresas, em domínios que a rede da sessão ainda bloqueia (o `curl` devolveu 000). Isso não indica fonte falsa.
- Os sites oficiais brasileiros liberados não deram resposta conclusiva. `www.planalto.gov.br` respondeu vazio (*empty reply*). `www.gov.br` respondeu 404 a dois PDFs do MEC (relatório 20, nº 16 e 17) e, em seguida, 429 com página anti-robô até para URLs inexistentes. `basenacionalcomum.mec.gov.br` respondeu 403. Por isso essas leis e documentos ficaram como NÃO CHECÁVEL, e as duas URLs do MEC devem ser reconferidas à mão.
- Os relatórios 18 e 19 foram reescritos por outra frente durante esta validação (2ª rodada: 109 e 108 entradas). A validação e as edições usaram a versão atual dos arquivos.

## Referências NÃO ENCONTRADAS

| Relatório | Referência | Busca | Ação no texto |
|---|---|---|---|
| 16 | Revisão espanhola (2024) de apps para dislexia (Galexia, Ubinding, Glifing, Tradislexia, GraphoGame, Jellys, DytectiveU, Minecraft) | Crossref, PubMed e ERIC sem correspondência | A afirmação da seção 2 ("Apps para dislexia em espanhol") foi marcada como **(fonte não confirmada)** |

## Correções feitas

| Relatório / nº | Na tabela | Correção (Crossref) |
|---|---|---|
| 18 / 14 | Gillon, G. et al. (2024), A better start literacy approach: effectiveness of Tier 1 a… | título e autores correspondem a Gillon, McNeill, Scott & Arrow (2022), Reading and Writing; o DOI 10.3389/feduc.2024.1354182 citado é de outro artigo (Gillon et al., 2024, Large scale implementation of effective early literacy instruction, Frontiers in Education) — DOI 10.1007/s11145-022-10303-4 |
| 20 / 14 | Matayoshi, J.; Doble, C.; Cosyn, E. (2019), (Reliability of ALEKS assessments) International Journal of… | 1º autor: Doble, C. (Doble, Matayoshi, Cosyn, Uzun & Karami); título: A Data-Based Simulation Study of Reliability for an Adaptive Assessment Based on Knowledge Space Theory — DOI 10.1007/s40593-019-00176-0 |
| 23 / 12 | Tanaka, F.; Matsuzoe, S. (RO-MAN 2014) (2014), Robô care-receiving × robô especialista no vocabulário de i… | título: Learning English words with the aid of an autonomous care-receiving robot in a children's group activity; autores: Matsuzoe, Kuzuoka & Tanaka — DOI 10.1109/roman.2014.6926351 |
| 23 / 18 | Mayer, R. E. (Cambridge Handbook of Mul… (2014/2021), Principles based on social cues in multimedia learning | autoria no Crossref (ed. 2021): Fiorella & Mayer — DOI 10.1017/9781108894333.029 |
| 23 / 23 | Brunick, K. L.; Putnam, M. M.; McGarry,… (2016), Children's future parasocial relationships with media chara… | DOI correto; o DOI do link da tabela (10.1080/17482798.2016.1157502) é de outro artigo — DOI 10.1080/17482798.2015.1127839 |
| 23 / 26 | Lauricella, A. R.; Gola, A. A. H.; Calv… (2011), Toddlers' learning from socially meaningful video character… | DOI correto; o link da tabela aponta para outro artigo — DOI 10.1080/15213269.2011.573465 |
| 24 / 16 | Revisão secundária (Springer, INTERACT … (2015), Capítulo que resume Vatavu et al. e estudos de gestos (2–8 … | o capítulo é Nacher & Jaen (2015), Evaluating the Accuracy of Pre-kindergarten Children Multi-touch Interaction, INTERACT 2015 — DOI 10.1007/978-3-319-22668-2_42 |
| 16 / canônica | Herrera & Defior (2005), referência incompleta | Completada: Herrera & Defior (2005), *Psykhe*, DOI 10.4067/s0718-22282005000200007 (provável correspondência, conferir o conteúdo) |

## Verificadas com identificação completada

Linhas em que a tabela tinha título descritivo ou autoria "a conferir". A coluna Etapa 2 agora traz o título ou os autores reais:

- **16 nº 37**: autores: Martínez, Maurits & Maassen (2022) (DOI 10.1177/02656590221139232)
- **17 nº A11**: título real: Supporting Acquisition of Spelling Skills in Different Orthographies Using an Empirically Validated Digital Learning Environment (DOI 10.3389/fpsyg.2021.566220)
- **17 nº A13**: título real: In search of finalizing and validating digital learning tools supporting all in acquiring full literacy (DOI 10.3389/fpsyg.2023.1142559)
- **17 nº A14**: título real: Supporting struggling readers with digital game-based learning (Ronimus, Eklund, Pesu & Lyytinen) (DOI 10.1007/s11423-019-09658-3)
- **17 nº A33**: título real: A aquisição da leitura em leitores principiantes: erros típicos no português europeu (DOI 10.1590/s1678-4634201844165734)
- **19 nº 37**: título: Implementation matters: Generalising treatment effects in education (2023) (DOI 10.35489/bsg-whatworkshubforglobaleducation-wp_2023/001)
- **20 nº 13**: versão publicada: capítulo do New Handbook of Mathematical Psychology (Cambridge UP); a tabela cita o preprint arXiv (DOI 10.1017/9781139245913.006)
- **20 nº 21**: autoria: Gontijo (2012), Avaliação da alfabetização: Provinha Brasil, Educação e Pesquisa 38(3) (DOI 10.1590/s1517-97022012000300005)
- **20 nº 22**: autoria: Gontijo (2012); provavelmente a mesma obra do nº 21 (DOI 10.1590/s1517-97022012000300005)
- **21 nº 9**: título: Designing spoken tutorial dialogue with children to elicit predictable but educationally valuable responses (DOI 10.21437/interspeech.2009-213)
- **21 nº 10**: DOI da versão publicada (IJCA, 2019); ano no Crossref: 2019 (DOI 10.5120/ijca2019918451)
- **21 nº 11**: no ERIC: Shah & Scanlan, 2025 (ERIC ED677055)
- **21 nº 12**: no ERIC: Shah & Scanlan, 2025 (ERIC ED677055)
- **21 nº 23**: registro AEA RCT; 1º autor no Crossref: Grellet (DOI 10.1257/rct.17205)
- **21 nº 25**: título: Dialogue with a conversational agent promotes children's story comprehension via enhancing engagement (Xu et al.; Crossref: 2022) (DOI 10.1111/cdev.13708)
- **22 nº 6**: DOI da versão publicada (AIES 2024) (DOI 10.1609/aies.v7i1.31618)
- **22 nº 10**: autores: Hämäläinen, Cho, Candeias, Pellegrini, Abad et al. (2014), LNCS (DOI 10.1007/978-3-319-09761-9_1)
- **22 nº 11**: DOI da versão publicada (CORAA ASR, Language Resources and Evaluation, 2023); ano no Crossref: 2023 (DOI 10.1007/s10579-022-09621-4)
- **22 nº 12**: título: Baseline Acoustic Models for Brazilian Portuguese Using Kaldi Tools (Batista, Dias & Sampaio Neto) (DOI 10.21437/iberspeech.2018-17)
- **22 nº 13**: autores: Quintanilha, Netto & Biscainho (2020) (DOI 10.14209/jcis.2020.25)
- **22 nº 20**: autores: Cao, Fan, Svendsen & Salvi; versão publicada na IEEE TASLP (2026) (DOI 10.1109/taslpro.2026.3654852)
- **22 nº 21**: autores: Sancinetti, Vidal, Bonomi & Ferrer; publicado no ICASSP 2022 (DOI 10.1109/icassp43922.2022.9747727)
- **22 nº 23**: autores: Ng, Ng, Wang & Lee (2024) (DOI 10.1109/taslp.2024.3463503)
- **22 nº 26**: autores: Marx, Matassoni & Brutti; título no Crossref: Automatic detection of speech sound disorders in German-speaking children (…) (DOI 10.21437/interspeech.2025-1996)
- **23 nº 14**: título: Individual Differences in Children's (Language) Learning Skills Moderate Effects of Robot-Assisted Second Language Learning (van den Berghe et al.) (DOI 10.3389/frobt.2021.676248)
- **23 nº 15**: 1º autor: Demir-Lira (Frontiers in Education, 2020) (DOI 10.3389/feduc.2020.599636)
- **23 nº 19**: autores: Davis, Vincent & Wan (2021) (DOI 10.1186/s41239-021-00256-z)
- **23 nº 24**: estudo original: Calvert, Putnam, Aguiar, Ryan et al. (2020), Young Children's Mathematical Learning From Intelligent Characters (DOI 10.1111/cdev.13341)
- **25 nº 46**: exemplo localizado: Kothari et al. (2002), Same language subtitling: a butterfly for literacy? (DOI 10.1080/02601370110099515)
- **25 nº 48**: exemplo localizado: Mostow (2016), Project LISTEN's Reading Tutor (capítulo) (DOI 10.4324/9781315647500-18)

## Não checáveis — o que fazer

- **Liberar na rede** (concentram a maior parte dos não checáveis): `eduscol.education.fr`, `education.gouv.fr`, `dge.mec.pt`, `repositorio*.pt`, `education.nsw.gov.au`, `education.sa.gov.au`, `worldbank.org`, `unesco.org`, `unicef.org`, `rti.org`, `povertyactionlab.org`, `imagineworldwide.org`, `blog.google`, `nngroup.com`, `arxiv.org`, `aclanthology.org`, `isca-archive.org`, `ri.cmu.edu`. Depois, rodar de novo o mesmo script (`/tmp/claude-0/-home-user-FONEMA---ALFABETIZA-O/7ffddb0b-e1df-5cee-91bb-73247f203345/scratchpad/verif.py`, que tem cache).
- **Livros e testes brasileiros** (CONFIAS, TCLPP, TDE II, PROLEC, Morais 1998/2012, Pinheiro 1996): conferir no catálogo das editoras ou em bibliotecas (Dedalus/USP, Sophia), porque não estão no Crossref.
- **Leis** (LGPD art. 14; Lei 15.211/2025): conferir no Planalto, que não respondeu nesta sessão.
- **Relatório 20, nº 16 e 17 (PDFs do MEC em gov.br):** a 1ª resposta foi 404. A URL pode ter mudado; procurar o documento no portal do MEC.

## Observações

- Os relatórios receberam uma coluna nova, **"Etapa 2 (validação 13/11/2026)"**, em cada tabela de referências, e uma nota curta antes da primeira tabela. O conteúdo original das linhas foi mantido. Mudaram só a coluna URL/DOI (DOI acrescentado; nos relatórios 17 e 25, as marcas "(a confirmar)"/"(verificar)"/"buscar" saíram das linhas confirmadas) e a última coluna.
- As marcas antigas de pendência no corpo do texto (por exemplo, "verificar — incerto: magnitude" no relatório 25) continuam valendo. A validação confirmou que a **referência existe**, e não o número citado.
- Arquivos de trabalho (scripts, cache das APIs, resultados brutos): `/tmp/claude-0/-home-user-FONEMA---ALFABETIZA-O/7ffddb0b-e1df-5cee-91bb-73247f203345/scratchpad/` (`verif.py`, `classify.py`, `apply.py`, `overrides.json`, `results.json`, `classified.json`).
