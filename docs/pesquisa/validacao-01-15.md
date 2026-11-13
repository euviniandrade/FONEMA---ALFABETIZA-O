# Validação das referências — relatórios 01 a 15 (Etapa 2)

Data: 13/11/2026. Escopo: todas as linhas das tabelas de referências (e, no relatório 03, os itens da lista "Fontes consultadas") dos relatórios `01-*.md` a `15-*.md` em `docs/pesquisa/`.

## Método

- **Com DOI** (no texto ou embutido na URL do editor): `api.crossref.org/works/<DOI>`; conferência de 1º autor, ano (±1, por diferença entre edição online e impressa) e título. Quando o DOI não estava no Crossref, conferência em `doi.org/api/handles/<DOI>`.
- **Sem DOI**: busca `query.bibliographic` no Crossref (autor + ano + título) e, em seguida, `esearch` no PubMed pelo título. Aceita só com 1º autor e ano batendo e título com alta semelhança. Foram usados também `esummary` do PubMed/PMC para PMIDs e links PMC e a API do ERIC (`api.ies.ed.gov`) para relatórios do IES/NCEE e livros.
- **Livros sem DOI**: quando a obra não tem registro próprio, mas há resenha indexada no Crossref que confirma título, autor e ano, a referência foi marcada como "VERIFICADA — indireta" e a resenha foi citada.
- **Sites, leis e documentos**: `curl -L` com status HTTP. Status 2xx = URL ativa; 404/410 = quebrada; 000/403/429 = não checável.
- Pausa de ≥0,3 s entre chamadas às APIs. Nenhum DOI foi digitado à mão: todos os DOIs registrados vieram das respostas do Crossref ou do PubMed.
- Nos relatórios, cada tabela de referências ganhou a coluna **"Validação E2"**; no 03, cada item ganhou o sufixo *"Validação E2: …"*. O restante do conteúdo não foi alterado, exceto a marcação "(fonte não confirmada)" nas afirmações que dependiam das referências não encontradas.

## Resumo por relatório

| Relatório | Total de refs | Verificadas | Corrigidas | Não encontradas | Não checáveis |
|---|---|---|---|---|---|
| 01-metodo-fonico-mundo.md | 47 | 16 | 0 | 0 | 31 |
| 02-brasil-bncc-fonetica-pb.md | 52 | 3 | 0 | 0 | 49 |
| 03-github-tecnologia.md | 23 | 11 | 0 | 0 | 12 |
| 04-mercado-jogos-engajamento.md | 84 | 7 | 0 | 0 | 77 |
| 05-inclusao-acessibilidade-legal.md | 43 | 13 | 0 | 0 | 30 |
| 06-neuro-cerebro-leitor.md | 24 | 16 | 1 | 0 | 7 |
| 07-neuro-memoria-retencao.md | 72 | 70 | 0 | 2 | 0 |
| 08-neuro-dopamina-motivacao.md | 45 | 41 | 0 | 0 | 4 |
| 09-neuro-atencao-carga-cognitiva.md | 74 | 68 | 1 | 1 | 4 |
| 10-neuro-fala-multissensorial.md | 46 | 43 | 0 | 0 | 3 |
| 11-neuro-dislexia.md | 62 | 51 | 4 | 2 | 5 |
| 12-neuro-tea-tdah.md | 55 | 53 | 2 | 0 | 0 |
| 13-neuro-emocao-erro-feedback.md | 45 | 45 | 0 | 0 | 0 |
| 14-neuro-desenvolvimento-musica.md | 41 | 35 | 1 | 0 | 5 |
| 15-neuroeducacao-mitos.md | 62 | 44 | 0 | 0 | 18 |
| **Total** | **775** | **516** | **9** | **5** | **245** |

Detalhe das verificadas: 15 foram confirmadas apenas pela URL ativa (HTTP 200: learn.microsoft.com, huggingface.co, developer.apple.com, cloud.google.com, gov.br). 9 são "indiretas" (livro confirmado por resenha indexada) e 7 foram confirmadas pelo ERIC. As demais foram confirmadas no Crossref ou no PubMed. Foram acrescentados **303 DOIs novos** às tabelas.

Os "não checáveis" são, em quase todos os casos, sites comerciais, institucionais, de notícias e de lojas de apps cujo domínio está fora da rede liberada (o proxy recusa a conexão: HTTP 000). Casos especiais: `planalto.gov.br` abre o túnel, mas o TLS não completa (timeout), por isso **nenhum texto de lei pôde ser conferido no Planalto**. `www.gov.br` respondeu 200 em algumas páginas e 429 (limite de requisições) em outras. `github.com` e `scielo.br` responderam 403. `pubmed.ncbi.nlm.nih.gov` devolve uma página de cookies (HTTP 203), que não foi aceita como verificação; as referências com PMID foram conferidas pela API eutils.

## Referências NÃO ENCONTRADAS

| Relatório | # | Referência | Observação | Afirmação marcada |
|---|---|---|---|---|
| 07 | 46 | Leitner, S. 1972 So lernt man lernen | livro; sem registro em Crossref/PubMed/ERIC | sim (tabela de algoritmos, seção 2) |
| 07 | 60 | Bjork, E. L.; Bjork, R. A. 2011 Making things hard on yourself, but in a good way: creating desirable | capítulo de livro; sem registro em Crossref/ERIC | sim (seção 2.5; a afirmação também se apoia em [59], verificada) |
| 09 | 56 | Dias, N. M., & Seabra, A. G. 2013 *Programa de Intervenção em Autorregulação e Funções Executivas — PIAF | livro; sem registro em Crossref/ERIC | sim (seção 2; [55] do mesmo grupo foi verificada) |
| 11 | 56 | Capovilla, A. G. S.; Capovilla, F. C. 2004 *Alfabetização: método fônico* (Memnon) | livro; sem registro em Crossref/ERIC | sim (seção 2, Brasil) |
| 11 | 57 | Capellini, S. A.; Smythe, I.; Silva, C.  2012 *Protocolo de Avaliação de Habilidades Metafonológicas e de Leit | título/edição não localizados; o Crossref traz outro protocolo dos autores: Capellini & Smythe (2008), doi:10.36311/2008.978-85-98176-13-0 | sim (seção 2, Brasil) |

Todas são livros ou capítulos de livros, que em geral não têm registro em Crossref, PubMed ou ERIC. A ausência nas bases não indica que a obra seja falsa, mas a referência não pôde ser confirmada. Nenhum artigo de periódico ficou sem localização.

## Correções

| Relatório | # | Referência | Correção |
|---|---|---|---|
| 06 | 23 | (mini-revisão, autoria a confirmar) 2024 Mini-revisão sobre a hipótese da reciclagem neuro | autoria identificada pelo DOI: Park & Fine (2024), 'A unified model for cross-modal plasticity and skill acquisition'. DOI correto: `10.3389/fnins.2024.1334283`. |
| 09 | 24 | Mayer, R. E. 2021 *Multimedia Learning* (3ª ed.). Cambridge University Press | 3ª edição registrada no Crossref com ano 2020 (não 2021). DOI correto: `10.1017/9781316941355`. |
| 11 | 4 | Goswami, U. 2011 A temporal sampling framework for developmental dyslexia (*Trends Cogn | o DOI citado (10.1016/j.tics.2010.10.006) não existe. DOI correto: `10.1016/j.tics.2010.10.001`. |
| 11 | 16 | Shaywitz, B. A. et al. 2004 Development of left occipitotemporal systems for skilled readi | o DOI 10.1016/j.biopsych.2003.12.017 é de outro trabalho (Rogers 2004, 'Genetics of monoamine metabolites in baboons: overlapping sets of gene'). DOI correto: `10.1016/j.biopsych.2003.12.019`. |
| 11 | 45 | PUCRS (SciELO Preprints) 2023 GraphoGame Brasil com crianças de 5 anos | Crossref: Dos Santos Konkewicz et al., 'Neurocognitive pathways to literacy: investigating GraphoGame Brazil in early childhood education', preprint publicado em 2026 (não ~2023). DOI correto: `10.1590/SciELOPreprints.15029`. |
| 11 | 53 | Dehaene, S.; Cohen, L. (artigo sobre a V 2011 The unique role of the visual word form area | o link PMC/PubMed 3704307 é de outro trabalho (Dehaene 2013, 'Inside the letterbox: how literacy transforms the human brain.'). DOI correto: `10.1016/j.tics.2011.04.003`. |
| 12 | 11 | Kohls, G.; Chevallier, C.; Troiani, V.;  2012 Reward system dysfunction in autism spectrum | o DOI existe, mas o título correto é 'Social wanting dysfunction in autism: neurobiological underpinnings and treatment implications'. |
| 12 | 51 | Bul, K. et al. 2016 Improving time-management skills in ADHD with the serious game Plan-It | título correto: 'Behavioral outcome effects of serious gaming as an adjunct to treatment for children with ADHD: a randomized controlled trial' (JMIR, 2016). DOI correto: `10.2196/jmir.5173`. |
| 14 | 16 | Goswami, U. 2011 A temporal sampling framework for developmental dyslexia. *Trends in C | o link PMC/PubMed 4224062 é de outro trabalho (Goswami 2014, 'Oscillatory "temporal sampling" and developmental dyslexia: toward an '). DOI correto: `10.1016/j.tics.2010.10.001`. |

## Outras observações

- **Itens antes marcados como não verificados** ([B], [C], †, "a conferir", "DOI a confirmar", "localizar pelo título") nos relatórios 07 a 15: quase todos foram confirmados no Crossref ou no PubMed. Os DOIs "a confirmar" da tabela 5B do relatório 08 (B1–B26) conferem todos, exceto B20 (livro; DOI da edição Oxford Academic acrescentado) e B25 (documento da OMS, não checável).
- **Links trocados**: o link PMC3704307, atribuído a Dehaene & Cohen (2011) no relatório 11, é de outro artigo (Dehaene 2013, "Inside the letterbox"). O mesmo acontece com o link PMC4224062, atribuído a Goswami (2011) no relatório 14 (é Goswami 2014). Nos dois casos, o DOI do artigo citado foi acrescentado.
- **Candidatos não aceitos** (semelhança insuficiente; continuam como NÃO CHECÁVEL):
  - 02 #28: Método das Boquinhas na RIAEE; candidato doi:10.21723/riaee.v18i00.16908.
  - 02 #41: curva de aquisição segmental na CoDAS; candidato doi:10.1590/2317-1782/20212020439.
  - 02 #42: encontros consonantais na Rev. CEFAC; candidato doi:10.1590/s1516-18462010005000139.
  - 02 #51: GraphoGame no SBIE; candidato doi:10.5753/sbie.2023.234851.
  - 01 #14: o relatório de 7 anos de Clackmannanshire não está nas bases; há o artigo relacionado Johnston & Watson (2004), doi:10.1023/b:read.0000032666.66359.62.
  - 04 #73: Haebig et al. 2021 não foi localizado. O Crossref traz Leonard et al. (2021), doi:10.1186/s11689-021-09368-z, com Haebig entre os coautores.
  - Conferir manualmente antes de adotar.
- **Pendências de rede**: as leis (LGPD, ECA Digital, LBI, Lei 12.764, Lei 14.254, decretos da PNA e do CNCA) continuam sem conferência no Planalto, porque o domínio não completa o TLS a partir deste ambiente. Conferir em outra rede.
- Scripts e dados brutos desta validação ficaram fora do repositório, no scratchpad da sessão.
