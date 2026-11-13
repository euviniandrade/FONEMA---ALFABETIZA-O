# Síntese — Bloco B: relatórios 16 a 25 + auditorias de validação

> Insumo para o DOCUMENTO MESTRE do FONEMA. Data: 13/11/2026.
> Fontes condensadas: `docs/pesquisa/16-*.md` a `25-*.md`, `validacao-01-15.md`, `validacao-16-25.md` e as decisões 001–004 (`docs/decisoes/`).
> Esta síntese **não acrescenta fontes nem números**: tudo vem dos relatórios. Onde o relatório marcou um dado como "conferir", "NV", "(verificar)" ou "inferência", a marca foi mantida.

## Como ler os níveis de evidência

A classificação abaixo é da síntese. Ela combina o **desenho do estudo** (como o relatório o descreve) com o **status na validação Etapa 2**.

| Nível | Significado |
|---|---|
| **A** | Meta-análise, revisão sistemática ou ECR publicado, com referência VERIFICADA/CORRIGIDA no Crossref/ERIC/PubMed |
| **B** | Estudo empírico publicado (quase-experimental, longitudinal, correlacional, experimental pequeno), referência verificada |
| **C** | Relatório oficial, dado de programa, avaliação encomendada ou autorrelatada pelo desenvolvedor, ou fonte NÃO CHECÁVEL (domínio bloqueado) |
| **D** | Inferência do relatório, proposta de produto, conhecimento prévio não confirmado ou fonte NÃO ENCONTRADA |

Atenção geral (validação 16–25): a Etapa 2 confirmou que a **referência existe**, não que o **número citado** está certo. Quase todos os números de relatórios de governos, ONGs e empresas vieram de trechos de busca, sem leitura do PDF.

---

## 16 — América Latina e mundo hispânico

**Base:** 49 entradas (44 com URL + 5 canônicas). Validação: 3 verificadas, 1 corrigida, 1 não encontrada, 44 não checáveis. Quase toda a base é C (domínios bloqueados). Equador e ECE/Peru ficaram sem cobertura.

### (a) Achados mais fortes
1. **Em ortografias transparentes (espanhol), a consciência silábica surge antes; a fonêmica é a mais difícil e a preditora mais consistente; a relação consciência fonológica ↔ leitura é bidirecional.** Nível B/C. Ref.: Defior (DOI 10.1174/021037008785702983, verificada); Herrera & Defior (2005, *Psykhe*, CORRIGIDA — "provável correspondência, conferir o conteúdo"); Seymour, Aro & Erskine (2003, verificada).
2. **Crise regional documentada:** ERCE 2019, média regional de leitura no 3º ano = 697; Peru 753, México 713, Argentina 689, Guatemala 656, Nicarágua 646, Rep. Dominicana 624. O BID afirma que ~2/3 das crianças da região não atingem o mínimo. Nível C (comunicados UNESCO/BID, não checáveis).
3. **Cobertura ≠ aprendizagem.** O PTA colombiano teve efeitos "limitados" por implementação heterogênea (Gómez Echeverry, 2025); o Leo Primero chileno reporta cobertura (632 mil crianças, >5.600 escolas em 2021) com dados do próprio ministério; a NEM mexicana não tem avaliação de impacto da lectoescritura. Nível C.
4. **Desempenho nos níveis iniciais do GraphoGame em espanhol correlacionou-se levemente com fluência 1 ano depois em crianças com TDL**, o que sugere uso como triagem. Nível B. Ref.: Martínez, Maurits & Maassen (2022), DOI 10.1177/02656590221139232 (verificada).
5. **Nenhum ECR de app de leitura em espanhol (ou português) em larga escala foi encontrado.** Nível D (ausência de achado).
6. **Modelos de instrumento reaproveitáveis:** PROLEC-R (9 índices principais, 10 secundários; tarefas com letras, palavras, pseudopalavras, frases, textos) e RtI das Canárias (Jiménez/ULL; piloto 2016 com 5–7 anos). Nível C.

### (b) Regras de design/produto
- Progressão sílaba → unidades intrassilábicas → fonema, **mas com fonema e letra-som desde cedo** e apoio articulatório da boca (nosso **Espelho do Som**) em todas as unidades.
- Incluir atividades de **sílaba tônica** (ex.: "sábia/sabia/sabiá") e leitura com entonação na fase de fluência.
- Calcular **PCPM automática** pelo reconhecimento de fala (padrão EGRA).
- Painel por processos (modelo PROLEC-R): letras, decodificação de palavras e **pseudopalavras**, palavras frequentes, frases, textos.
- **RtI em camadas** como modos adaptativos: triagem universal → camada 2 → camada 3, com monitoramento curto e frequente.
- Gerar **alertas precoces** (não diagnósticos) a partir do próprio jogo, para encaminhamento a fonoaudiólogo.
- Nascer com **avaliação pré/pós** e, quando possível, ensaio controlado.
- **Modo professor** com roteiros curtos.
- **Offline** (PWA/cache), sessões curtas, limites de tela.
- Considerar **licenças abertas** para parte do conteúdo (listas decodificáveis, corpus de voz) em parcerias públicas (modelo Aprenderia).
- Revisar Sofia e personagens com olhar de diversidade (gênero, raça, regionalidade, deficiência): há crítica de viés de gênero em Letrilandia.
- Posicionamento: **ensino explícito e sistemático + leitura compartilhada/compreensão**, sem discurso polarizado.
- Versão ES futura: espanhol latino-americano neutro + pacotes de voz por país (seseo/yeísmo; rioplatense).

### (c) Números operacionais
- Sessões de **10–15 min**.
- ERCE 2019: 697 (média), 753 (Peru), 624 (Rep. Dominicana).
- Marder/Borzone (La Plata): grupo experimental ~30% acima do controle (C).
- ATAL (Colômbia): >1,2 milhão de alunos, 60 mil docentes; 85% de fluência esperada no EGRA no 5º ano (dado da ONG).
- Biblioteca País (Uruguai): >10.000 títulos, ~598 mil usuários, ~3,8 mi empréstimos.
- Espanhol: ~5 vogais vs. 7 orais + nasais no PB.

### (d) Riscos, limites e pendências
- 44 de 49 fontes não checáveis; números vêm de resumos.
- A "revisão espanhola (2024) de apps para dislexia" é a **única referência NÃO ENCONTRADA** do bloco 16–25; a afirmação foi marcada "(fonte não confirmada)".
- Doman, Montessori, "Lectura Sin Fronteras" e "Kokoro": sem fonte; descartados.
- Lacunas: Equador, ECE/Peru, SIMCE/Chile, Un Buen Comienzo; ler na íntegra BID #10/#11, Aprenderia #16, GraphoGame Chile #37; verificar se o Aprenderia tem CF/ASR e licença de reuso.

---

## 17 — Europa continental (exceto Reino Unido)

**Base:** 48 entradas (35 na Parte A + 13 clássicas na Parte B). Validação: 19 verificadas, 29 não checáveis, 12 DOIs acrescentados. As clássicas da Parte B (Landerl, Ziegler & Goswami, Saine, McTigue, Bus & van IJzendoorn, Verhoeven, Klinkenberg, Lundberg, PIRLS) foram **verificadas** na Etapa 2. Ficaram não checáveis os guias franceses, Lalilo, materiais portugueses e Dehaene (livros). A seção sobre Alemanha ("Lesen durch Schreiben") **não foi reverificada** e deve ser tratada como hipótese.

### (a) Achados mais fortes
1. **Na maioria das ortografias europeias, a criança chega à leitura de base precisa e fluente antes do fim do 1º ano**; francês, português europeu e dinamarquês ficam atrás, e o inglês leva mais que o dobro do tempo. Os fatores são complexidade silábica e profundidade ortográfica. Nível B. Ref.: Seymour, Aro & Erskine (2003), DOI 10.1348/000712603321661859.
2. **Em ortografia transparente, a dislexia aparece como lentidão (fluência), não como erro.** Nível B. Ref.: Landerl, Wimmer & Frith (1997); Wimmer & Goswami (1994).
3. **GraphoGame:** engajamento e efeito são maiores na escola que em casa (Ronimus & Lyytinen, 2015, N=194, 8 semanas); mais engajamento emocional aumentou o tempo de jogo **sem** aumentar os ganhos (Ronimus et al., 2019); fora da Finlândia, o efeito médio é pequeno e maior com mediação adulta (McTigue et al., 2020, *RRQ*). Nível A/B.
4. **Escrita inventada mediada** (a criança escreve, o adulto mostra uma grafia um pouco mais avançada) melhora consciência fonêmica, leitura e escrita em pré-escolares: ECR com 108 crianças de 5 anos (5 semanas); pequenos grupos com 160; padrão replicado com 79 crianças de **Portugal e do Brasil**. Nível A/B. Ref.: Alves Martins & Silva (2006, verificada); Alves Martins et al. (2013, 2016, verificadas); artigo PT-BR na *Psicologia: Teoria e Pesquisa* (não checável).
5. **Treino fonológico + letras > treino só fonológico.** Nível A. Ref.: Bus & van IJzendoorn (1999). Intervenções computadorizadas na pré-escola têm meta-análise (Verhoeven et al., 2020). Lundberg, Frost & Petersen (1988): jogos de linguagem diários com efeito duradouro.
6. **Prática adaptativa tipo Elo (Oefenweb/Math Garden)** estima ao mesmo tempo a habilidade do aluno e a dificuldade do item. Nível B. Ref.: Klinkenberg, Straatemeier & van der Maas (2011).
7. **França (2018–):** guia oficial "Pour enseigner la lecture et l'écriture au CP", com ensino grafofonêmico explícito, textos decifráveis, ditado em paralelo e avaliações nacionais CP/CE1 com fluência. **Lalilo** mostra que ASR infantil para leitura oral é viável em produto (Interspeech 2021). Nível C.

### (b) Regras de design/produto
- Meta de **decodificação de base em ~1 ano letivo**; **ortografia (escrita) como trilha própria, mais longa** (s/ss/ç/c, r/rr, g/gu, x/ch, h).
- **Métrica dupla: acurácia + velocidade** (palavras corretas por minuto).
- Progressão estilo "guia CP": correspondências que formam palavras cedo; textos decifráveis gerados só com correspondências ensinadas, com **% de decifrabilidade calculado**; ditado/escrita desde o 1º dia.
- ASR no padrão Lalilo: começar por **vocabulário fechado** (palavras e pseudopalavras conhecidas) antes da leitura livre.
- Motor: ouvir som → escolher grafema entre distratores; distratores pelos **pares mínimos do PB** (p/b, t/d, f/v, m/n, e/é, o/ó); Elo de aluno e item.
- **Adulto no circuito:** "missões para fazer junto", relatórios curtos, modo sala de aula.
- Medir **ganho por item (pré/pós)**, não só tempo de tela; evitar recompensas que alonguem a sessão sem prática do código.
- Escrita inventada mediada como atividade-chave.
- Gesto + cantilena por fonema (Fonomímica Paula Teles) **só como apoio mnemônico**: a evidência é fraca (estudos de caso).
- Tabela letra-figura (Anlauttabelle) com palavras de **primeiro som inequívoco no PB** (evitar "elefante" e "xícara").
- De Portugal, aproveitar a **estrutura** (PNEP/Sim-Sim, Aprendizagens Essenciais), não os exemplos (PE tem vogais reduzidas).

### (c) Números operacionais
- Distratores ajustados para manter **~80% de acerto** (princípio GraphoGame).
- Dose GraphoGame finlandês: **< 2 h** para a decodificação de base (relato do grupo; disléxicos precisam de mais).
- COST IS1401: ~80 pesquisadores de 38 países.
- Lalilo: €5 mi (2019); ~50 mil professores e 360 mil alunos na época da compra (2021).

### (d) Riscos, limites e pendências
- Engajamento ≠ aprendizagem; uso em casa sem mediação rende menos (relevante para o B2C).
- Escores do PIRLS 2021 europeu, números das avaliações CP/CE1 e políticas de Itália, Espanha, Grécia e Polônia: não verificados.
- Alemanha (Reichen, Röhr-Sendlmeier/Bonn): não reverificado.
- Parceiros acadêmicos sugeridos: ISPA, FPCE-UP, ex-ELN, Jyväskylä.

---

## 18 — Ásia, Oceania e Oriente Médio

**Base:** 109 entradas (2ª rodada). Validação: 34 verificadas, 1 corrigida (Gillon et al. → 2022, *Reading and Writing*), 74 não checáveis. Read Along, PSC australiano, BSLA (exceto Gillon), TaRL/J-PAL e documentos oficiais estão como **não checáveis**. As exceções verificadas são sobretudo artigos acadêmicos (Share, Ziegler & Goswami, Banerjee et al., estudos de hiragana, árabe, turco, Iqra/Abadzi).

### (a) Achados mais fortes
1. **TaRL (agrupar por nível, não por série) tem 6 RCTs positivos na Índia, mas sem tempo dedicado não teve impacto.** Num desenho com 1 h/dia + mentoria: +0,15 DP em hindi; custo de US$ 0,29 por 0,1 DP adicional. Nível A (Banerjee et al. 2017 e Banerjee, Cole, Duflo & Linden verificados; resumo J-PAL não checável).
2. **Google Read Along (ex-Bolo):** assistente "Diya", ASR e TTS **no aparelho, offline**, sem login e sem enviar áudio. A Sattva (independente, ~3.500 crianças, 3 idiomas) achou **40% mais** usuários subindo ≥1 nível vs. não usuários, com **efeito crescente com o engajamento**. O piloto do Google (Unnao, ~1.500 crianças) reporta 64% de melhora. Nível C (não checável; piloto autorrelatado). A descrição de "alinhamento forçado/vocabulário restrito" é **inferência** do relatório.
3. **Ortografias transparentes (turco, vietnamita, indonésio, hebraico e árabe vocalizados) levam à decodificação rápida no 1º ano; depois o gargalo é fluência, morfologia, vocabulário e escrita** (na Turquia, escrever é mais difícil que ler). Share alerta contra o anglocentrismo. Nível B. Ref.: Share (1995, 2008), Ziegler & Goswami (2005), Öney & Durgunoğlu (1997), Babayiğit (2022).
4. **Limiar preditivo (Japão):** nomear **≥ 40 de 45 hiragana** antes do 1º ano foi o melhor ponto de corte para prever fluência (291 crianças). Aprender um silabário também desenvolve consciência fonêmica. Nível B. Ref.: Okumura et al. (2022); Fletcher-Flinn et al. (2010).
5. **Pistas retiráveis:** hebraico (nikud) e árabe (harakat) começam vocalizados e retiram as vogais por volta do 3º ano; pinyin e hiragana servem de andaime. A **diglossia** árabe afeta a consciência fonológica e a leitura inicial. Nível B. Ref.: Shany et al. (2011); Saiegh-Haddad (2003, 2018); Asadi (2017).
6. **Avaliação curta e padronizada com pseudopalavras + decodificáveis alinhados à sequência** é o pacote das políticas australianas (PSC de 40 itens; NSW compra decodificáveis; Victoria exige fônica diária). NZ trocou o Reading Recovery pelo BSLA; os estudos do BSLA são dos próprios autores. Nível C (Gillon et al. 2022 verificado).
7. **Risco regulatório real:** a "dupla redução" chinesa (2021) proibiu a tutoria acadêmica lucrativa; desde 2019 a China exige cadastro, limite de tempo e proteção de dados em apps educativos para menores. Na Coreia, os livros digitais com IA perderam o status legal em 2025. Nível C.

### (b) Regras de design/produto
- **Copiar o desenho da Diya:** a Sofia ouve, ajuda **só quando a criança trava**, funciona offline e não envia áudio. ASR de vocabulário restrito ou alinhado ao texto.
- **Métrica-motor: minutos de leitura em voz alta por semana**, não só fases concluídas.
- **"Checagem Fônica FONEMA"**: ~40 itens, metade pseudopalavras, aplicada pela Sofia com ASR. Cuidado com "treinar para o teste".
- Decodificabilidade de cada texto **validada automaticamente** contra a sequência pt-BR e **exibida ao professor**, com métrica transparente (há crítica ao rótulo comercial "totalmente decodificável").
- **Tier 1 + Tier 2 (BSLA):** reforço intensivo automático para quem não avança, com alerta ao professor; dar peso à linguagem oral e ao vocabulário.
- **Diagnóstico inicial oral por níveis** (letra / sílaba / palavra / frase / texto), modelo ASER; painel sugere **grupos por nível**; recomendar **horário fixo diário** à escola.
- Interface em que a criança **monta a sílaba** e vê o bloco se formar (inspiração Hangul/kana), **sem abandonar o fonema**.
- **Limiar de alerta precoce** de domínio grafema-fonema do pt-BR (análogo aos 40/45 hiragana).
- **Pistas visuais retiráveis** (sílabas coloridas, dígrafos marcados), retiradas com o ganho de fluência.
- **Ensinar acentos como parte do código** (lição do Vietnã).
- ASR deve **aceitar pronúncias regionais** (/tʃi/ × /te/, "r" retroflexo) e avaliar decodificação, não sotaque.
- **Jogos curtos e cronometrados de reconhecimento de letras e sílabas** (automatização, modelo Iqra).
- Narrativa animada por correspondência e ciclo **"brincar → reconhecer → praticar → escrever"** por unidade letra-som.
- **Adotar voluntariamente** limite de tempo diário, painel dos pais e minimização de dados; posicionar o FONEMA como complemento alinhado à política pública (Compromisso Criança Alfabetizada), não como "tutoria paga".
- Planejar piloto com grupo de comparação e avaliação externa.
- **Módulo pré-escolar (4–5 anos)**: letras, sons e vocabulário predizem a fluência (Vietnã).

### (c) Números operacionais
- PSC: **40 itens**, metade pseudopalavras; SA 2024: 70% no nível esperado ou acima; NSW 2024: 62.413 alunos, 1.618 escolas.
- Victoria: **≥ 25 min/dia** de fônica explícita (obrigatório em 2027); checagem no Year 1 obrigatória em 2026.
- Diagnóstico ASER: **5–10 min**, oral.
- Horário escolar sugerido: **15–20 min/dia**.
- Tier 2 após **~6–10 semanas** sem avanço.
- ASER 2024: 27,1% do 3º ano leem texto do 2º ano (23,4% na rede pública).
- Hiragana: ≥ 40/45 antes do 1º ano.
- Iqra/Emirados: KG privado com 200 min/semana de árabe (~40 min/dia), subindo para 300 até 2027–28.
- BSLA: 10 semanas de Tier 1; >3.000 professores (2020–23); Tier 2 com ~3.700 crianças.

### (d) Riscos, limites e pendências
- A evidência dos programas é em grande parte **autorrelatada** (Read Along, BSLA, INOVASI, RAMP, Iqra 2020).
- NV1–NV6: tamanho do efeito do RCT do Iqra; ano da mudança "caracteres antes do pinyin"; revisão turca de 2024 (fonte única); política do Irã; programa saudita; avaliações independentes de Hồ Ngọc Đại e INOVASI.
- Ler na íntegra [1], [2], [6], [14], [49], [95], [97] quando os domínios forem liberados.
- Modelos de ASR sugeridos aqui (Whisper tiny/base quantizado, Vosk, Web Speech API) **conflitam** com a recomendação do rel. 22 (ver Conflitos).

---

## 19 — África e organismos globais

**Base:** 108 entradas. Validação: 25 verificadas, 83 não checáveis. Verificados: Escueta et al. (JEL 2020), Angrist & Meager, Fazzio et al. (Guiné-Bissau, 2021), Lee, Moussa & Zuilkowski (2026), Piper & Miksic, Brunette, Piper et al. (Tusome), Azevedo (2020), Chimbutane, Breazeal et al. (2016), entre outros. **Não checáveis:** GEEAP Smart Buys, UNESCO GEM 2023, todos os dados onebillion/Imagine/XPRIZE, Learning Passport e Feed the Monster (Koval-Saifi & Plass).

### (a) Achados mais fortes
1. **Edtech funciona quando é software adaptativo com ritmo individualizado; distribuir hardware sem pedagogia tem efeito ~0.** CAL tem efeitos mais fortes, sobretudo em matemática. Nível A. Ref.: Escueta, Nickow, Oreopoulos & Quan (2020), *JEL* 58(4), DOI 10.1257/jel.20191507. O GEEAP 2023 classifica hardware como "Bad Buy", TaRL como "Great Buy" e pedagogia estruturada como "Good Buy" (C).
2. **App fônico com voz para pré-leitores (onecourse, Malawi):** 0,42 DP em alfabetização (14 semanas); 0,34 DP num RCT de 8 meses (581 crianças, AEARCTR-0003882); +4,2 meses de leitura num RCT de 2 anos. Co-vencedor do Global Learning XPRIZE. Nível C (RCTs, mas não checáveis e ligados ao desenvolvedor).
3. **Pedagogia estruturada em escala (Tusome, Quênia):** guias roteirizados + livros + coaches com tablet (o tablet era do coach). Avaliação externa: ganho ≈ 1 ano extra de escolaridade em inglês no 2º ano; "emergentes ou fluentes" de 34% para 53%; fração no benchmark triplicou. Nível B (Piper et al. 2018 verificado; NORC não checável).
4. **Melhor evidência causal em português na África:** RCT por clusters na Guiné-Bissau (Fazzio, Eble, Lumsdaine & Boone, *J. Public Econ.* 2021), ensino todo em português L2, medido com EGRA/EGMA: ganhos "grandes" (resumo J-PAL: +65,7 p.p. no teste final de leitura). Nível A (artigo verificado; o número vem do resumo J-PAL).
5. **Implementação importa:** ajustes baratos no agrupamento do TaRL (Botsuana) somaram ~0,22 DP sobre a implementação padrão. Nível B (Angrist & Meager verificado).
6. **Língua materna:** a discordância entre a língua da criança e a de instrução modera os efeitos da intervenção bilíngue em Gana. Nível A/B. Ref.: Lee, Moussa & Zuilkowski (2026, *JREE*). PIRLS 2021 na África do Sul: 81% sem ler com compreensão (C).
7. **Ceticismo da UNESCO (GEM 2023):** evidência escassa, muitas vezes do fornecedor; investimento inicial ≈ 25% do custo total; só 16% dos países garantem por lei a privacidade de dados educacionais. Nível C.

### (b) Regras de design/produto
- Ser **"pedagogia estruturada digital"**, não jogo educativo genérico.
- **Interface 100% voz + imagem**: nenhum botão depende de ler.
- **Adaptatividade tipo TaRL** (diagnóstico, agrupamento por nível, progressão por domínio).
- **Sessões curtas e diárias**; meta de dose explícita no painel do professor.
- ASR para **PCPM e pseudopalavras**, espelhando os subtestes do EGRA.
- **Professor no centro**: relatório por criança e sugestão de agrupamento.
- **Custo total transparente**: modo compartilhado (1 tablet para vários alunos), celular do responsável, offline.
- Reportar impacto em **"learning poverty"** e equivalência a anos de escolaridade.
- **Registrar o RCT** (AEA RCT Registry) e buscar avaliação independente.
- Medir com **EGRA adaptado** e alinhar ao Indicador Criança Alfabetizada.
- Atenção a crianças indígenas, surdas e imigrantes (haitianas, venezuelanas).
- **PALOP (futuro):** motor fônico **parametrizável por variante como arquivo de configuração**, não código (pt-BR → pt-PT/PALOP → pt-TL); vozes e ASR com sotaques africanos; modo bilíngue (língua local → português); offline-first; VOC do IILP como fonte lexical; piloto pequeno randomizado (STP ou Cabo Verde); cultura local ("ônibus" × "machimbombo/autocarro").

### (c) Números operacionais
- Learning poverty no Brasil: **48%** (SAEB 2017, nota de 2019); ~70% em países de renda baixa e média (2022) vs. 57% (2019).
- PIRLS 2021: Brasil **61%** no nível básico vs. 19% na África do Sul.
- ODS 4.1.1a / EGRA: corte de PCPM definido pelo país, **tipicamente ~45 PCPM**.
- Feed the Monster (Azraq, ~900 crianças): **~22 h de jogo em 8 semanas ≈ 30 h** de instrução melhorada.
- XPRIZE: 15 meses, ~2.700–3.000 crianças, ~30% leem uma frase completa ao fim.
- GEEAP 2023: >550 avaliações consideradas; só 96 de ~400 estudos com dados de custo.
- PALOP: Moçambique 6,3% (2014) / 4,9% (2016) com competência básica no 3º ano; Guiné-Bissau 17% (MICS); STP 2 em 3 sem habilidade básica no fim do 2º ano; Timor-Leste >70% sem ler texto básico no fim do 1º ano (EGRA 2009).

### (d) Riscos, limites e pendências
- A maioria dos números vem de trechos de busca, com dados do implementador (onebillion, Room to Read, Curious Learning, UNICEF).
- [NV]: 43% de proficiência no Vamos Ler!; "dez vezes mais palavras por minuto" em Gana; 3–4× da Room to Read; escala do Feed the Monster.
- Pendências: learning poverty de Angola, Cabo Verde, Guiné-Bissau, STP e Timor-Leste; relatório final do Vamos Ler!; Soma Umenye, READ TA, NEI+; MICS STP; Avaliação Nacional de Angola 2024; existência de Feed the Monster em pt; avaliação independente do Learning Passport offline; resultados do RCT da Zâmbia (AEARCTR-0014922).
- A continuidade da USAID como financiadora deve ser reavaliada (observação do próprio relatório).

---

## 20 — Avaliação, diagnóstico e personalização adaptativa

**Base:** 50 entradas. Validação: 26 verificadas, 1 corrigida (Doble et al., ALEKS), 23 não checáveis, 10 DOIs. Estão verificados os modelos (Pelánek, Corbett & Anderson, Klinkenberg, KST, Shute, Mislevy, Bloom, Kulik, Fuchs, Hasbrouck & Tindal via ERIC, Black & Wiliam, Verbert, Gough & Tunmer, Ehri). **Não checáveis:** Saeb/ICA/Alfabetiza Brasil (gov.br), DIBELS, PSC (gov.uk), CONFIAS, TCLPP, TDE-II, PROLEC-BR. Dois PDFs do MEC (#16, #17) deram **404**.

### (a) Achados mais fortes
1. **O núcleo do que medir é consensual:** consciência fonológica/fonêmica, letra-som, decodificação de palavras e **pseudopalavras**, fluência oral (PCPM) e compreensão (EGRA, DIBELS 8, Acadience, aimsweb). A PCPM é indicador robusto da competência leitora geral. Nível B/C. Ref.: Fuchs et al. (2001, verificada); EGRA/DIBELS (C).
2. **Pseudopalavras isolam a decodificação da memória visual** (PSC: 40 itens, metade pseudopalavras, corte 32/40 de 2012 a 2025, reportadamente 31 em 2026; NWF do DIBELS 8 pontua sons corretos e palavra inteira). Nível C.
3. **O Elo é simples, robusto e quase tão preciso quanto modelos mais caros**; modelos logísticos/Elo costumam ser preferíveis a BKT em sistemas práticos. O Math Garden estima aluno e item "on the fly", com tempo de resposta. Nível B. Ref.: Pelánek (2016, 2017); Klinkenberg et al. (2011). DKT (Piech et al., 2015) exige muito dado: fase 2.
4. **Mastery learning só funciona com critério exigente (80–90%) e reteste**; os efeitos são maiores com critérios mais altos. Nível A. Ref.: Kulik, Kulik & Bangert-Drowns (1990); Bloom (1984).
5. **Pré-requisitos (KST/ALEKS)** permitem diagnóstico rápido: ~20–30 perguntas adaptativas no ALEKS, com confiabilidade estudada em >700 mil avaliações. Nível B. Ref.: Doignon & Falmagne; Doble et al. (2019, corrigida).
6. **Avaliação invisível (stealth) + Evidence-Centered Design:** definir antes o que cada ação de jogo prova. Nível B. Ref.: Shute (2011); Shute & Ventura (2013); Mislevy, Steinberg & Almond (2003).
7. **Alvo brasileiro: 743 pontos na escala Saeb do 2º ano** ("criança alfabetizada", Inep 2023). ICA: ~56% (2023) → 59,2% (2024, meta 60%; Ceará 85,3%) → 66% reportado para 2025; meta de 80% em 2030. **O Brasil não tem normas nacionais públicas de PCPM.** Nível C.
8. **Normas EUA (Hasbrouck & Tindal, 2017, P50):** ≈ 60 PCPM no fim do 1º ano, ≈ 100 no fim do 2º, ≈ 112 no fim do 3º; atenção abaixo de ~P40 (≈ 10 PCPM abaixo da mediana); ler sempre junto com a precisão. Nível B (ERIC ED605146; "conferir no PDF antes de publicar").

### (b) Regras de design/produto
- **Diagnosticar para ensinar, não rotular**: nenhuma "nota" individual; mostrar "o que já sabe / o que vem a seguir" (herança da Provinha Brasil).
- Cada mecânica declara qual habilidade gera evidência e com que peso (ECD).
- **Duas camadas de medida:** precisão e **automaticidade** (latência).
- **Pseudopalavras obrigatórias** em toda checagem de decodificação, com personagem "alienígena" ("palavras do planeta da Sofia"), sempre fonotaticamente possíveis, sem formar palavra real ou palavrão, revisadas por fonoaudiólogo.
- **ASR com humildade:** baixa confiança nunca conta como erro; vira item "não pontuado" e, se repetido, pede confirmação por toque ou pelo adulto.
- Áudio processado preferencialmente no dispositivo (LGPD art. 14).
- **Mapa de ~70 habilidades em 7 domínios** (A. consciência fonológica; B. letra-som; C. decodificação silábica; D. dígrafos e regras contextuais; E. palavras frequentes irregulares/ambíguas; F. fluência e compreensão; G. escrita), com grafo de pré-requisitos (vogais → contínuas → oclusivas → CV → dígrafos → CCV/CVC → regras contextuais).
- **Diagnóstico inicial** ("Missão de boas-vindas da Sofia"): multiestágio + KST; termina com fase de entrada, priors por habilidade e até 3 bandeiras (*precisa de mais CF*; *lê por memória visual* — acerta palavras e erra pseudopalavras; *sinais de risco* → sugerir avaliação, nunca diagnosticar).
- **Modelo de aluno:** Elo hierárquico (θ global + θ por habilidade + dificuldade por item), com acerto ao acaso c_i; **P(domínio)** derivado do Elo (semântica do BKT); decaimento após inatividade; seleção do próximo item restrita à "franja externa" do grafo.
- **CAT multiestágio** (blocos de 4–6 itens) para 5–7 anos; no futuro, ancorar à escala Saeb via TRI com itens de ligação.
- Registrar **sílabas corretas por minuto** internamente (palavras do português são mais longas).
- Diferencial diagnóstico do português nas **regras contextuais** (c/qu, g/gu, r/rr, s/ss/ç, m/n antes de consoante, nasalização, x): mais itens aí.
- Reprovação na provinha **nunca bloqueia o jogo**: abre trilha de reforço curta.
- **Relatório para pais:** semanal, 1 tela, sem comparação com outras crianças, com 1 atividade de 5 min sem tela.
- **Painel do professor:** mapa de calor criança × habilidade; 3–5 grupos automáticos; risco em 3 faixas (no alvo / atenção / intervenção intensiva); erros por categoria; tradução para psicogênese, BNCC e padrão Saeb/ICA; cada indicador com "o que fazer agora" (Verbert).
- **Nunca afirmar equivalência numérica** com os 743 pontos antes da ancoragem psicométrica: usar "no caminho para o padrão nacional".

### (c) Números operacionais
- **Diagnóstico inicial:** 3 sessões de 4–6 min (**12–15 min** no total). CF: 6–10 itens (~4 min); letras: 10–16 (para após 3 erros seguidos no bloco, ~2 min); decodificação: 8–14 (~5 min); **RAN**: 20 figuras/cores (~1 min); escrita: 4–6 palavras (~3 min); fluência: 1 texto, 1 min + 3 perguntas (~2–3 min).
- **Benchmark trimestral:** versão paralela de ~8 min.
- **Elo:** P(acerto) = c_i + (1 − c_i)·σ(θ_s + θ_{s,k} − d_i); K(n) = a/(1 + b·n), ex.: a = 0,8, b = 0,05; c_i = 0,25 para 4 figuras e 0 para leitura oral; acerto lento = 0,7; autocorreção = 0,5.
- **Alvo de seleção:** P(acerto) ≈ **0,75 na prática**, ≈ **0,5 no diagnóstico**.
- **Esquecimento:** decaimento após > 14 dias sem prática; revisão espaçada em **1, 3, 7, 21 dias**.
- **Domínio de habilidade (todos juntos):** P(domínio) ≥ **0,95**; ≥ **8 tentativas em ≥ 2 sessões**; últimas 5 com ≥ 4 acertos, incluindo ≥ 2 pseudopalavras; latência mediana no alvo (**letra-som ≤ 2 s; palavra CV ≤ 3 s**).
- **Retenção:** 3–5 itens de checagem entre **24 h e 7 dias** depois; se falhar, volta a "em consolidação" **sem rebaixar a fase**.
- **Provinha de letra:** ~2–3 min, 10 itens (2 som→letra, 1 letra→som, 2 sílabas, 2 palavras, **2 pseudopalavras**, 1 escrita); critério **≥ 8/10** com ≥ 1 pseudopalavra correta e sem troca surda/sonora sistemática.
- **Provinha de fase** (a cada 4–6 unidades, ~6–8 min): 20 itens de leitura (10 palavras + 10 pseudopalavras) + 4 de escrita + 1 texto (a partir das sílabas complexas); critério **≥ 85% leitura, ≥ 75% escrita**.
- **Metas provisórias de PCPM (hipóteses):** meio do 1º ano 20–30 (precisão ≥ 90%); fim do 1º ano **50–60** (≥ 95%); meio do 2º 60–75; fim do 2º **80–90** + compreensão literal ≥ 70%; fim do 3º **100–110** (≥ 97%). Precisão de decodificação ≥ 90–95% em palavras regulares até o fim do 1º ano.
- **Sinais de alerta:** precisão < 90%; PCPM < 50% da meta da série; estagnação por 6 semanas; risco após **8–10 semanas** sem evolução (RAN lento + baixa CF).
- **Escala FONEMA provisória 0–1000**, com 6 níveis descritivos (nível 5 ≈ padrão 743).
- **Validação:** 200–300 crianças com instrumento externo (meta de correlação **≥ 0,6**); coorte-piloto de **≥ 500 crianças por série** para calibrar as metas; ASR só entra no cálculo com acurácia **≥ 90%** vs. juízes humanos; auditoria de DIF; recalibração trimestral.

### (d) Riscos, limites e pendências
- Instrumentos clínicos brasileiros (CONFIAS, Capovilla, TCLPP, TDE-II, PROLEC-BR) são de uso restrito/pago: servem só como **referência de construto e validação externa**, não para copiar.
- Os números do Saeb/ICA e o corte do PSC em 2026 precisam ser conferidos na fonte oficial; os PDFs do MEC #16/#17 deram 404.
- A data e o ato de fim da Provinha Brasil não foram confirmados; a nomenclatura do CAEd/SPAECE-Alfa também.
- A tabela de Hasbrouck & Tindal deve ser conferida no PDF antes de publicar.
- **Conflito de escalas** com a Decisão 004 (ver Conflitos).

---

## 21 — IA na educação infantil e na alfabetização

**Base:** 48 entradas. Validação: 15 verificadas, 33 não checáveis, 11 DOIs. Verificados: VanLehn, Kulik & Fletcher, estudos do Project LISTEN, Xu et al., estudo da Amira no ERIC (Shah & Scanlan, 2025), Barone et al. (registro do ECR Lalilo, AEA), US DoE/OET 2023 (ERIC). **Não checáveis:** UNICEF 3.0, UNESCO 2023, páginas de Read Along, Microsoft, Ello, Lalilo e Renaissance.

### (a) Achados mais fortes
1. **Tutoria inteligente por passos chega perto da tutoria humana:** d ≈ 0,76 (STI step-based) vs. d ≈ 0,79 (humana); sistemas que só avaliam a resposta final rendem bem menos; há platô de granularidade. Kulik & Fletcher: mediana +0,66 DP em 50 avaliações, muito dependente da implementação. Nível A. Ref.: VanLehn (2011); Kulik & Fletcher (2016).
2. **Um tutor que escuta a leitura oral traz ganhos mesmo com ASR imperfeito**; a lição central é **não punir a criança por erro do reconhecedor** e usar o ASR como dado de fluência (PCPM, latência). Nível B. Ref.: Mostow et al. (2003, 2013); Banerjee, Beck & Mostow (2003); Aist & Mostow (2009).
3. **Um agente com leitura dialógica replica os benefícios do adulto:** 117 crianças de 3–6 anos, desenho 2×2; compreensão semelhante, mas fala da criança menos elaborada com o agente; perguntas contingentes (~10 por episódio) melhoram a compreensão de ciências. Nível A/B. Ref.: Xu et al. (2021, *Child Development*; 2021, *Computers & Education*; 2024, *J. Educ. Psych.*).
4. **Produtos comerciais (Amira, Read Along, Reading Coach, Ello, Lalilo) convergem para leitura em voz alta + ASR + feedback imediato + painel do professor**, mas a evidência é sobretudo encomendada e quase-experimental. Amira: estudo de Louisiana com ~79 mil alunos (não revisado por pares); "Promising" no Evidence for ESSA (+0,64). Lalilo: ~6 semanas extras para leitores com dificuldade "com fidelidade" (não randomizado); ECR francês registrado em 2025, sem resultado. Nível C (Amira e Barone no ERIC/Crossref).
5. **Diretrizes:** UNICEF 3.0 (dez/2025: 10 requisitos, atenção nova a *AI companions*); UNESCO 2023 sugere considerar **13 anos** como idade mínima para IA generativa em sala; US DoE 2023: humanos no circuito. O ITIF critica o "humano no circuito" como burocracia. Nível C (US DoE verificado no ERIC).

### (b) Regras de design/produto
- **A criança nunca conversa com um LLM aberto.** Arquitetura em 4 camadas: (1) roteiro determinístico 100% revisado (instrução → dica 1 → dica 2 → modelagem → celebração → transição); (2) percepção restrita no dispositivo (ASR contra alvo conhecido → {correto, erro típico, incerto, silêncio}; classificador de intenção mínimo; a saída é sempre um **rótulo**); (3) decisão pedagógica pelo modelo do aluno; (4) conteúdo gerado offline nos bastidores, publicado como estático.
- **Feedback por passo** (cada fonema, sílaba, palavra), não só "acertou/errou a fase".
- **Onde usar IA:** ASR restrito no dispositivo; métricas de fluência (só as métricas vão à nuvem); modelo do aluno; LLM só no pipeline editorial de histórias; TTS pré-renderizado e revisado; apoio ao professor com dados pseudonimizados.
- **Onde não usar:** chat livre; TTS em tempo real para fonemas isolados (gravar com fonoaudióloga); diagnóstico; avaliação punitiva por ASR; amizade simulada ("fico triste se você sair").
- **Pipeline de histórias decodificáveis:** entrada (grafemas ensinados, palavras liberadas, tema) → LLM com temperatura baixa e few-shot → **validador bloqueante** (decomposição em grafemas pt-BR, incluindo dígrafos, nasalização e x) → filtros de segurança e cultura → **revisão humana** → publicação estática → medição da leitura por história.
- **Guard-rails:** sem chat, sem texto livre da criança, **sem câmera**; áudio no dispositivo, upload só com consentimento parental específico e revogável; Sofia se apresenta como personagem de computador; sem *streaks* punitivos; painel com o que foi gravado e botão de apagar; checklist UNICEF 3.0; red team com fala infantil real; monitorar o "falso erro" do ASR por região.
- **Professor decide, IA sugere:** escuta gravações por amostragem e pode corrigir o veredito do ASR (vira dado de melhoria); aprova histórias da turma.
- **Plano de evidência:** A/B embutido, ECR com universidade, pré-registro e publicação aberta da precisão do ASR em fala infantil brasileira.

### (c) Números operacionais
- d ≈ 0,76 (STI) vs. 0,79 (humano); mediana +0,66 DP.
- Decodificabilidade das histórias geradas: **≥ 95%** (ajustável).
- Idade de referência UNESCO para IA generativa: 13 anos (público do FONEMA: 4–8).
- Read Along/Sattva: ~3.500 crianças, 45–60 dias.

### (d) Riscos, limites e pendências
- Alucinação, viés cultural em texto gerado, apego a AI companions, falso "errou" do ASR, evidência fraca de produto (viés de seleção por uso).
- Lacunas: ASR em fala infantil pt-BR; LLM gerando decodificáveis com vocabulário controlado; guard-rails do Khanmigo; OCDE Digital Education Outlook; base legal brasileira (LGPD art. 14, ECA, ANPD) e ICO Code (delegados à frente jurídica/rel. 05); ferramentas de IA do MEC.
- A tabela de uso de IA cita "rastreamento de conhecimento bayesiano" como exemplo de modelo do aluno; o rel. 20 recomenda Elo (ver Conflitos).

---

## 22 — Reconhecimento de fala infantil (ASR) e avaliação automática de leitura/pronúncia

**Base:** 29 entradas. Validação: 21 verificadas, 8 não checáveis, 20 DOIs (a melhor taxa do bloco junto com o 25). Vários autores foram completados na Etapa 2 (ex.: Cao, Fan, Svendsen & Salvi; Sancinetti et al.; Ng et al.; Marx, Matassoni & Brutti). Muitos números estão marcados **"(conferir no PDF)"**.

### (a) Achados mais fortes
1. **Fala infantil é difícil para o ASR:** com modelos adultos, o WER infantil fica **~2–5×** maior e piora quanto menor a idade; normalização e adaptação reduzem a distância, mas não a eliminam. Nível B. Ref.: Potamianos & Narayanan (2003); Shivakumar & Georgiou (2020).
2. **Modelos de fundação ajudam se tiverem fine-tuning;** o **wav2vec2 ajustado superou o Whisper ajustado** (Jain et al., 2023). Benchmark (Fan et al., 2024): Whisper-large-v3 com WER ~1,4% no OGI (leitura), WavLM-large ~10,4% no MyST (espontânea) (conferir no PDF). PEFT empata com fine-tuning completo só nos modelos grandes. Nível B.
3. **Whisper e outros seq2seq alucinam e normalizam** (transformam a produção da criança na palavra correta → falso acerto). Para julgar pronúncia, usar **CTC fonêmico** (wav2vec2/WavLM/XLS-R). Nível B/D (coerente com [5] e [9]; parte é leitura crítica do relatório).
4. **PB infantil quase não tem dados:** Rodrigues & Ribeiro (PROPOR 2026) usaram 5.400 palavras isoladas lidas por crianças do 2º–3º ano; modelos **fonêmicos** ajustados acompanham melhor a pronúncia real. Em PE: **LetsRead** (284 crianças de 6–10 anos, ~20 h, com pseudopalavras). Corpora PB abertos (CORAA etc.) são adultos. Nível B.
5. **Verificar contra alvo conhecido** (uma frase por vez, texto esperado) é o que fez o Project LISTEN funcionar; a **latência entre palavras** foi validada como medida de fluência. Nível B. Ref.: Mostow; Beck, Jia & Mostow.
6. **Detecção de distúrbios dos sons da fala:** UAR de 89% no nível do falante (cantonês), 73,9% (coreano, 92 crianças). Isso vale para agregados de muitas produções, não para um enunciado. **Não é diagnóstico.** Nível B. Ref.: PolyU (2024); Sung et al. (2024); Marx et al. (2025).
7. **Classificadores dedicados a contrastes previstos superam o GOP genérico**; GOP sem segmentação (CTC) evita o alinhamento forçado frágil em crianças. Nível B. Ref.: Strik et al. (2007); Witt & Young (2000).

### (b) Regras de design/produto
- **Verificar, não transcrever:** "a criança produziu o alvo?".
- **Modelo acústico CTC fonêmico** ajustado com saída de fonemas pt-BR (SAMPA/IPA). **Não usar Whisper como juiz de pronúncia**; ele pode servir em tarefas abertas ("diga o nome da figura").
- Pontuação: GOP sobre posteriores CTC + **classificadores binários** dos contrastes da lição (/r/–/l/, /s/–/ʃ/, /p/–/b/, /t/–/d/, /f/–/v/, encontros, rótico); **limiar por fonema e por faixa etária**.
- **Normas desenvolvimentais:** usar a tabela de idade de aquisição dos fonemas do PB (da frente de fonoaudiologia); ex.: substituição de rótico aos 4 anos não gera correção.
- **Feedback articulatório pelo tipo de erro** (vozeamento, ponto, modo), ex.: "Ponha a mão na garganta: no /v/ ela vibra!".
- **On-device**, modelo pequeno e quantizado.
- **Política de tolerância assimétrica:** três faixas (aceita / incerta → "vamos ouvir de novo e falar juntos?" / erro provável → dica, nunca "errado!"); **nunca bloquear a progressão só pelo ASR**; agregar evidências entre sessões antes de sinalizar dificuldade; detectar ruído/silêncio/clipping e pedir nova gravação sem culpar a criança; humano revisa com áudio (se houver consentimento).
- **Corpus próprio pt-BR** como ativo estratégico, coletado com CEP/CONEP, TCLE + TALE e consentimento LGPD art. 14 com opções separadas (produto / pesquisa / corpus aberto anonimizado).

### (c) Números operacionais
- **Meta de produto: FRR ≤ 5%** em produções corretas (aceitar FAR maior).
- Após **2 tentativas incertas**, avançar e registrar.
- **Coleta fase 1:** 300–500 crianças de 4–8 anos, estratificadas por idade, sexo, **5 regiões** e rede pública/privada; inclui crianças com SSD (clínicas-escola).
- Material: 30–35 fonemas do PB em CV, CCV, CVC, palavras do currículo, pseudopalavras, frases curtas.
- Gravação: aparelhos reais, sala real, **16 kHz mono**, sem compressão com perdas no treino.
- Anotação fonética estreita por fonoaudiólogos; **dupla anotação em 10–20%** (kappa).
- Volume: meta inicial de **30–50 h anotadas** (referências: 91 h em [3]; 5.400 palavras em [9]).
- Métricas: WER e **PER** por idade e região; precisão/recall/F1; FRR e FAR por fonema e idade; kappa vs. teto entre fonoaudiólogos; diferença máxima de FRR entre regiões, sexos e redes.
- Expectativas: palavras isoladas de 6–8 anos → WER de um dígito com dado próprio; fonemas/sílabas isolados de 4–5 anos → decisões ruidosas, várias tentativas agregadas por sessão.

### (d) Riscos, limites e pendências
- Nenhum corpus público grande de fala infantil PB nem de pré-leitores (4–6 anos) produzindo fonemas isolados.
- Sotaques regionais (rótico, /s/ em coda, palatalização de /t, d/) ausentes dos corpora: **risco de equidade**.
- Voz é potencialmente dado sensível (LGPD art. 5º, II); não foi achada literatura acadêmica sobre privacidade da voz infantil.
- Não verificados: CSLU Kids, CMU Kids, PF-STAR, JIBO Kids (só indiretos), CHILDES-pt, "Projeto ALIP"; disponibilidade pública de LetsRead e do corpus de Rodrigues & Ribeiro.
- Vários WER e ganhos precisam ser conferidos no PDF.

---

## 23 — Agente pedagógico Sofia

**Base:** 44 entradas. Validação: 29 verificadas, 4 corrigidas (Matsuzoe/Kuzuoka/Tanaka 2014; Fiorella & Mayer 2021; DOI de Brunick et al.; DOI de Lauricella et al.), 11 não checáveis, 19 DOIs. As obras da Tabela B (Picard, Brink et al., Kahn et al., Baylor, Gordon, Park) foram **verificadas**. Ficaram não checáveis UNICEF 2021, ECA Digital, IBGE e fontes de mercado de TTS.

### (a) Achados mais fortes
1. **Personagem pedagógica ajuda pouco, mas de forma significativa:** 43 estudos, N = 3.088 (Schroeder et al., 2013); **g+ = 0,20** (Castro-Alonso et al., 2021). Sofia amplifica motivação e atenção; não substitui o método. Nível A.
2. **2D > 3D:** g+ = **0,38** vs. **0,11** (carga cognitiva e redundância). Nível A. Ref.: Castro-Alonso et al. (2021).
3. **Voz:** TTS moderno ≈ voz humana em aprendizagem e credibilidade (o TTS antigo é pior); com pré-escolares (45), **voz expressiva > voz plana** em identificação de palavras, reconto e retenção após **4–6 semanas**, com preferência igual pelas duas. Nível B. Ref.: Craig & Schroeder (2017); Kory Westlund et al. (2017).
4. **Gestos:** o **apontar** melhora retenção e fixação nos elementos relevantes; o olhar para a figura sozinho não ajuda; o contato visual tende a ajudar; gestos icônicos de robô não trouxeram ganho de vocabulário. Nível B. Ref.: Li, Wang & Mayer (2023); Vogt et al. (2019).
5. **Vínculo parassocial:** crianças aprendem mais com personagens com quem têm vínculo; o vínculo cresce com exposição repetida, brinquedos e mediação dos pais. Nível B. Ref.: Gola et al. (2013); Bond & Calvert (2014); Calvert et al. (2020).
6. **Efeito protegido / aprender ensinando:** alunos se esforçam mais para o agente aprender; um robô "que precisa de cuidado" e erra de propósito ensinou vocabulário melhor que um robô especialista. Nível B. Ref.: Chase et al. (2009); Tanaka & Matsuzoe (2012); Matsuzoe, Kuzuoka & Tanaka (2014, corrigida).
7. **Robô não supera tablet:** L2TOR (~194 crianças de 5 anos) achou robô = tablet. A presença física não é necessária para os efeitos que importam. Nível B. Ref.: Vogt et al. (2019); Belpaeme et al. (2018).

### (b) Regras de design/produto (Bíblia da Sofia)
- **Aparência:** ilustração **2D** vetorial, fundo neutro na aula; menina humana em estilo cartoon (sem fotorrealismo, para evitar o vale da estranheza); boca grande e legível (lábios, dentes, língua nos visemas) com **modo "Boquinha"** em close frontal e lateral; pele **parda**; cabelo cacheado volumoso (3C/4A); camiseta com a letra da semana; corujinha-broche ou caderno amarelo; sotaque e cenário neutros por padrão, com "pacotes de lugar" opcionais; elenco diverso (óculos, aparelho auditivo, cadeira de rodas, famílias diversas).
- **Idade aparente ~9–10 anos** ("prima que já sabe ler").
- **Personalidade:** calorosa, curiosa, paciente, brincalhona; elogia **esforço e estratégia**, não inteligência; contingente.
- **Voz:** TTS neural pt-BR expressivo, de preferência voz própria com contrato de cessão; **fonemas isolados gravados por humano**; botão "fala de novo"; transparência para os pais ("voz gerada por computador").
- **Não verbal:** Boquinha sincronizada com a letra destacada (gesto central); apontar; olhar para a criança ao perguntar e para a tarefa ao explicar; nunca tristeza ou decepção; sem animação de fundo durante a tarefa.
- **Falas proibidas:** "Fiquei triste porque você saiu", "Não me deixa sozinha", "Só mais uma!" em loop, "Você é muito inteligente!", qualquer comparação com outras crianças.
- **Companheiro aprendiz "Bolota"** (filhote de tatu-bola, *Tolypeutes tricinctus*): erra de forma planejada (surda/sonora, inversão de sílaba, omissão do fonema final, b/d); a criança corrige; Bolota "aprende" e tem um caderninho do que a criança ensinou. **Nunca erra o que a criança ainda não domina.** Erros nunca são piadas humilhantes.
- **Fading em 5 fases:** Sofia muito presente na CF → modela letra-som (Bolota começa a errar) → andaime decrescente na decodificação → leitura dialógica em frases/textos ("ler para o Bolota dormir") → autonomia (Sofia aparece pouco; ritual de passagem com a família).
- **Ética:** sem manipulação emocional, FOMO ou sequências punitivas; transparência adequada à idade; **sem câmera nem biometria afetiva** (adaptação só por desempenho e comportamento); Sofia incentiva a pausa; **sem IA generativa livre** nas falas; Sofia nunca vende nem aparece em anúncio; revisão de representatividade por pessoas negras e pardas, educadores de regiões diversas e pessoas com deficiência.

### (c) Números operacionais
- g+ = 0,20 (geral); 0,38 (2D) vs. 0,11 (3D).
- Voz: **10–15% mais lenta** que a fala adulta nas instruções; **15–30 variações** por tipo de fala.
- **Tempo de espera de 3–5 s** "ouvindo" antes da dica.
- Validação visual: crianças de 4–7 anos de **≥ 3 regiões**.
- **Hipóteses A/B:** H1 voz expressiva × neutra (retenção em 1 e 4 semanas); H2 com × sem Bolota (pares mínimos, tempo voluntário); H3 Boquinha em close × plano médio; H4 rituais de vínculo × sem (retorno diário).

### (d) Riscos, limites e pendências
- Os efeitos são **pequenos** e às vezes **nulos** frente a alternativas simples: não vender a Sofia como "a professora".
- Riscos: apego, confusão pessoa/máquina, dados afetivos, *dark patterns*, vale da estranheza; pais e professores são mais cautelosos que as crianças.
- No resumo de Schroeder et al., agentes com texto superaram os narrados, mas os estudos usavam TTS antigo: ler com cautela.
- A "boca grande com língua visível" e a recomendação de gravar fonemas isolados são **recomendações de projeto**, sem estudo específico citado.
- Não checáveis: UNICEF 2021, ECA Digital, Censo IBGE 2022 (tom de pele).

---

## 24 — UX/UI para crianças de 4 a 8 anos

**Base:** 44 entradas. Validação: 18 verificadas, 1 corrigida (capítulo de Nacher & Jaen, 2015), 25 não checáveis. Verificados: Vatavu et al., Hourcade, Shaw & Anthony, Hiniker et al., Read & MacFarlane, Druin, Fails et al., páginas Apple e Android (HTTP 200), estudo de arrastar × tocar (PubMed 38889478). **Não checáveis:** NN/g (alvo ≥ 2 cm), Sesame Workshop, Seesaw, ClassDojo, Cloudwise, WCAG 2.2; Google Play Families e LGPD marcados NV.

### (a) Achados mais fortes
1. **Crianças precisam de alvos maiores:** NN/g recomenda **≥ 2 × 2 cm** (4× a área do mínimo adulto); até crianças de 7 anos falharam ao tocar no "X" de um anúncio. Os mínimos de plataforma (48 dp Android, 44 pt iOS, 24 px WCAG AA) são pensados para adultos. Nível C (NN/g não checável; Android/Apple verificados).
2. **A precisão do toque melhora muito dos 3 aos 6 anos** (89 crianças vs. 30 adultos); toque, toque duplo e arrastar com uma mão vão bem; arrastar com duas mãos é difícil. O toque infantil é tão diferente que permite inferir a faixa etária, então os limiares de gesto precisam ser calibrados para crianças. Nível B. Ref.: Vatavu, Cramariuc & Schipor (2015); Vatavu, Anthony & Brown (2015).
3. **Arrastar que combina com a ação pode melhorar o desempenho:** ECR com 70 crianças de 5–6 anos; nas tarefas difíceis, o grupo que arrastou foi mais preciso. Nível B. Ref.: PubMed 38889478 (2024).
4. **Símbolos informais adultos (☰, setas abstratas, indicador de página) atrapalham pré-escolares.** Nível B. Ref.: Hiniker et al. ("Hidden Symbols"). Toque simples é o gesto mais intuitivo; pinça e *flick* são difíceis; aceitar conclusão parcial; palma apoiada na borda inferior; uso em paisagem (Sesame Workshop, síntese de >50 estudos, C).
5. **Teste com crianças exige método próprio:** Fun Toolkit (5–10 anos), com viés de satisfação (marcam "super legal" em tudo); observar comportamento e Again-Again vale mais que a nota. Co-design via Cooperative Inquiry. Nível B. Ref.: Read & MacFarlane (2006); Read (2008); Druin (2002); Fails, Guha & Druin (2013).
6. **Login sem texto é padrão de mercado** (QR de turma no Seesaw/ClassDojo, senha de figuras Cloudwise, crachá QR Clever); a WCAG 2.2 (3.3.8) aceita reconhecimento de figuras e QR como alternativa a teste cognitivo. Nível C.
7. **Lojas:** a Apple Kids exige porteira de nível adulto para links, compras e "distrações", sem analytics nem anúncios de terceiros; **a porteira não equivale a consentimento parental**; para pré-leitores, sugere aviso falado. Nível C/B (páginas Apple verificadas).

### (b) Regras de design/produto (Guia de UX)
- **Gestos:** toque simples para tudo (aceitar toques "sujos"; ignorar a palma); arrastar curto com uma mão (≤ ⅓ da tela), com ímã de encaixe, conclusão parcial e **sempre alternativa toque-toque**; traçar letra a partir de 5 anos, com setas e pontos animados e traçado em partes; deslizar só para virar página, com seta visível. **Proibidos para a criança:** toque duplo, pressionar e segurar (reservado à porteira), pinça, *flick*, multitoque, sacudir; rolagem evitada (telas fixas).
- **Web/desktop:** só clique simples, nada de arrastar com mouse antes dos 9 anos; teclado: Espaço = ouvir de novo; setas = escolher.
- **Navegação sem texto:** Sofia é o menu falado; ícones concretos (casa, porta com seta, ouvido, estrela/baú); nada de ☰, ⋮ ou engrenagem na área infantil; todo alvo fala ao ser tocado (o **som** da letra, /m/, não "eme"); mapa de fases **linear** com no máximo 1 escolha por nível; sem pop-ups modais; saída com confirmação falada (✔ verde / ✖ vermelho).
- **Login por figuras:** QR da turma → grade de avatares (máx. 30) → senha de 3 figuras entre 9 (ordem obrigatória opcional para 6–8 anos); "chama a professora" após 3 erros, sem bloqueio; o professor pode desativar a senha em turmas de 4 anos; em casa, QR individual impresso (o QR da turma não vai para casa).
- **Porteira:** ícone discreto no canto superior direito; pressionar e segurar 3 s **+** tarefa que depende de leitura (sorteada; não usar só uma conta simples); aviso falado da Sofia; atrás dela ficam relatórios, configurações, links, consentimento LGPD, compras e mensagens; área adulta com UI padrão e linguagem simples; logout automático.
- **Feedback:** erro **sem X vermelho nem buzina**; erro repetido (2×) → a resposta certa pulsa + "vamos juntos?"; **sem vidas, cronômetro ou ranking visível para 4–6 anos**; recompensas intrínsecas (mapa, histórias).
- **Acessibilidade:** meta WCAG 2.2 AA + ajustes infantis; nunca só cor para certo/errado; legendas e transcrição da Sofia, Libras em vídeo nas instruções-chave; tempo sem limite por padrão; leitor de tela não bloqueado; opção "menos movimento"; volumes separados para música e voz.
- **Desempenho:** offline-first (baixar trilhas no Wi-Fi, fila local, sincronizar depois; PWA com service worker); vários perfis por aparelho; dados locais criptografados; **sem SDK de terceiros** de analytics/anúncio na área infantil.

### (c) Números operacionais
- **Alvos:** botão principal ≥ **96 dp** (recomendado 112–128); alternativas ≥ **88 dp** (120+); ícones de navegação ≥ **72 dp** (80), nos cantos **superiores**; nenhum alvo infantil < 72 dp; espaço entre alvos 16 dp (recomendado **24 dp**); faixa inferior "morta" de 48–64 dp; área tocável 8–12 dp além da arte; ímã ≥ 48 dp; corredor de traçado ≥ 40 dp.
- **Alternativas por tela:** máx. **3–4 para 4–5 anos**; até **6 para 7–8 anos**.
- **Texto-alvo:** ≥ 32 sp (recomendado 48–72 sp), "a" e "g" de forma escolar; **contraste ≥ 4,5:1** (texto) e ≥ 3:1 (ícones).
- **Instrução da Sofia ≤ 6 s**; **dica temporizada: 5 s** (aponta) → **10 s** (repete) → **20 s** (mostra a resposta); configurável.
- Profundidade máx. de **2 toques** entre o mapa e a atividade.
- Feedback visual **< 100 ms**; áudio **< 300 ms**; acerto ≤ 1,5 s; vibração de 10–20 ms (opcional).
- Porteira: segurar **3 s**; logout da área adulta após **2 min** sem uso.
- **Aparelho mínimo:** Android 8.1+, **2 GB RAM**, tela de 5"; instalação inicial **≤ 40 MB**; pacote de lição **≤ 5 MB**; RAM em uso **≤ 250 MB**; abertura a frio **≤ 3 s**; ≥ 30 fps estáveis (60 fps em aparelho bom); áudio Opus/AAC mono 32–48 kbps; até **40 crianças** por tablet; troca de perfil em ≤ 2 toques.
- **Teste de usabilidade:** 5–8 crianças por faixa (4–5, 6–7, 7–8) por rodada; sessão ≤ 20 min (4–5 anos) e ≤ 30 min (6–8); aprovação com **≥ 80% de sucesso sem ajuda**, **< 15% de toques fora do alvo** e nenhuma saída acidental; co-design com 6–8 crianças de 7–8 anos, sessões mensais; área adulta com 5 professoras + 5 responsáveis.

### (d) Riscos, limites e pendências
- A recomendação háptica é prudencial (não foi achada evidência).
- Lacunas: Epic e Khan Academy Kids (perfis), dados Cetic.br (TIC Educação, TIC Kids Online), IHC/SBC brasileiro, regras do Google Play Families, WCAG 2.2 conferida.
- O relatório cita o ícone "estrela/baú" para recompensas; com a Decisão 002 (proibição de baú aleatório), o ícone pode sugerir loot box (ver Conflitos).
- O dado de "27% das crianças de 2–3 anos" vem de fonte secundária.

---

## 25 — Conteúdo: decodificáveis, vocabulário, fluência, compreensão e escrita

**Base:** 51 entradas. O relatório foi escrito **sem nenhuma busca** (de memória, tudo "(verificar)"); a Etapa 2 depois **verificou 40** e deixou 11 não checáveis, com 32 DOIs. Não checáveis incluem Pinheiro (1996), Morais, PNA/RENABE, Tempo de Aprender, Instituto Alfa e Beto e as avaliações de fluência das redes. As marcas "(verificar — incerto)" do corpo **continuam valendo** para os números (a validação confirma a obra, não a magnitude).

### (a) Achados mais fortes
1. **Textos decodificáveis ajudam a aplicar a decodificação no início, mas a evidência é modesta e de qualidade limitada**; repetição de palavras e controle de vocabulário também pesam. Nível A/B. Ref.: Cheatham & Allor (2012); Mesmer (2001, 2005); Juel & Roper-Schneider (1985). Price-Mohr & Price (2020) não favoreceram de forma simples os textos mais decodificáveis ("verificar — incerto").
2. **Decodificabilidade é relativa ao currículo**: deve ser calculada contra o estado de cada criança. Nível B. Ref.: Mesmer (2001).
3. **Fônica sistemática no início, depois muita leitura variada** (o decodificável é ponte, não destino); a autoaprendizagem constrói o léxico ortográfico. Nível A/B. Ref.: Castles, Rastle & Nation (2018); Share (1995); Ehri (2014).
4. **Leitura oral repetida e guiada, com feedback, melhora reconhecimento, fluência e compreensão**; o mais eficaz é modelo adulto antes, feedback corretivo e **critério de desempenho** (não número fixo de repetições). Nível A. Ref.: NRP (2000); Kuhn & Stahl (2003); Therrien (2004).
5. **Karaokê (destaque sincronizado):** apoio auditivo deu ganhos em iniciantes; o destaque ajuda a manter o olhar no texto; risco de escuta passiva. TTS/leitura em voz alta ajuda a **compreensão** de alunos com dificuldade como **acesso**, não como treino de decodificação. Nível B. Ref.: Reitsma (1988); Gerbier, Bailly & Bosse (2018) (magnitude incerta); Wood et al. (2018).
6. **Compreensão = decodificação × linguagem;** conhecimento prévio pesou mais que habilidade leitora (Recht & Leslie); ensino explícito de estratégias e estrutura de texto (IES/WWC). Nível A/B. Ref.: Gough & Tunmer (1986); Recht & Leslie (1988); Shanahan et al. (2010); Beck & McKeown (camada 2).
7. **A escrita reforça a leitura:** escrita inventada com feedback de grafia um pouco mais avançada > treino só fonológico; no jardim, prediz leitura e escrita no 1º ano (Ouellette & Sénéchal, 2008, 2017); escrever melhora a leitura (Graham & Hebert). **Escrever à mão > digitar** para reconhecer letras (Longcamp et al., 2005; James & Engelhardt, 2012; Kiefer et al., 2015); ensinar caligrafia melhora legibilidade e textos (Santangelo & Graham, 2016). Nível A/B.

### (b) Regras de design/produto
- **Dois tipos de texto:** decodificáveis (a criança lê; controlados, curtos, com repetição das CGF novas) e **textos ricos para escuta** (a voz lê; vocabulário de camada 2, conjuntos temáticos como "animais do cerrado" e "festas juninas" *(atualizado pela D012: "feira da colheita")*, com versões decodificáveis curtas para o vocabulário reaparecer).
- **Regras contextuais e reduções vocálicas do PB são conteúdo ensinado** (e/o átonos finais [i]/[u], "de" [dʒi], nasalização, r/s posicionais).
- **Não transpor sight words do inglês:** no PB, o conjunto "irregular" é pequeno ("que", "não", "muito", "também", "homem"), ensinado por mapeamento (ler a parte regular e marcar a parte ainda não ensinada), sem memorização visual pura.
- **Progressão F1–F5** (proposta a validar): F1 vogais + m p b t l v (V, CV) → F2 + d f n s j c g (CVCV) → F3 + vogal átona final, r intervocálico, til → F4 + dígrafos e codas → F5 + CCV, regras de c/ç/s/ss/z/x, h, acentos (textos de 80–150 palavras).
- **Pipeline:** léxico-base (LexPorBR + Pinheiro + ESCOLEX mapeado + CHILDES-pt) com G2P próprio (variante regional configurável), divisão silábica, CGF e **"índice de fase"**; **corpus próprio** de textos infantis brasileiros; LLM com restrição dura; **linter de decodificabilidade**; revisão humana obrigatória (pedagoga + revisor); validação com dados; metadados por texto (fase, CGF-foco, tema, gênero, áudio com timestamps).
- **Fluência em 4 passos:** ouvir (destaque palavra a palavra; por sílaba em F1–F2) → ler junto (eco/coral) → **ler sozinho com o destaque seguindo a criança** via ASR (ajuda graduada: sílaba → som da letra → palavra) → reler até o critério. Palavra destacada tocável e micro-checagens contra a escuta passiva; **passos 2 e 3 obrigatórios para avançar de fase**. Prosódia por rubrica simplificada (Zutell & Rasinski), marcada como experimental.
- **Vocabulário:** 3–5 palavras de camada 2 por texto de escuta, com definição amigável, imagem e 2–3 contextos, revisitadas com espaçamento; perguntas antes, durante e depois; reconto oral gravado; organizador de estrutura narrativa.
- **Escrita:** traçado com stylus/dedo + versão para imprimir; **bastão → minúscula de imprensa logo em seguida → cursiva opcional**; mostrar direção e ordem dos traços; preferir traçado livre a cobrir pontilhado; **sem teclado como produção principal em F1–F2**. Escrita inventada com grafia "um passo mais avançada", sem marcar erro na educação infantil. **Ditado diagnóstico** (a partir do 1º ano) com erros classificados pelas categorias de Morais (regular direta, contextual, morfológica, irregular) e pelos erros típicos do rel. 02.

### (c) Números operacionais
- **Decodificabilidade (proposta de produto, não da literatura):** ≥ **95% em F1–F2**, ≥ **90% em F3–F4**, F5 livre com palavras novas sinalizadas.
- Cada CGF nova aparece **≥ 4 vezes** por texto (exemplo de N).
- Textos com **acurácia mediana < 90%** na fase-alvo voltam para revisão.
- Releitura até **≥ 95% de acurácia** e PCPM acima da meta da fase, com teto de **3–4 releituras** por sessão.
- Com vogais + ~8–10 consoantes em CV já se escrevem frases inteiras.
- ESCOLEX: ~48 mil palavras (1º–6º ano, PE); childLex: ~500 livros.
- **Não usar Hasbrouck & Tindal como meta**; normas pt-BR a obter.

### (d) Riscos, limites e pendências
- Texto decodificável artificial ("O boi viu a uva do boi"): mitigar com revisão humana e histórias com sentido.
- Variação regional (vogais átonas, s em coda, r, t/d antes de [i]): ASR e validador não podem marcar variante como erro.
- Ficar tempo demais nos decodificáveis: sair da fase por desempenho e oferecer textos livres cedo.
- Licenciamento de bases lexicais e textos infantis (uso comercial).
- Verificar: Tempo de Aprender (livros próprios?), Instituto Alfa e Beto (coleções e licença), o que é o "Ensino Estruturado", disponibilidade/licença de LexPorBR, ESCOLEX e Pinheiro, normas brasileiras de fluência e quem as aplica, stylus × lápis, karaokê com lusófonos, redação da BNCC sobre cursiva, caso finlandês.
- Não há corpus público de decodificáveis pt-BR com metadados de CGF: é **oportunidade e risco** (a biblioteca terá de ser produzida pelo projeto).

---

## Auditorias de validação (Etapa 2)

### Totais

| Bloco | Entradas | Verificadas | Corrigidas | Não encontradas | Não checáveis | DOIs acrescentados |
|---|---|---|---|---|---|---|
| Relatórios 01–15 | 775 | 516 | 9 | 5 | 245 | 303 |
| Relatórios 16–25 | 580 | 230 | 8 | 1 | 341 | 121 |
| **Total 01–25** | **1.355** | **746** | **17** | **6** | **586** | **424** |

Por relatório (16–25): 16 → 3/1/1/44; 17 → 19/0/0/29; 18 → 34/1/0/74; 19 → 25/0/0/83; 20 → 26/1/0/23; 21 → 15/0/0/33; 22 → 21/0/0/8; 23 → 29/4/0/11; 24 → 18/1/0/25; 25 → 40/0/0/11 (verificadas/corrigidas/não encontradas/não checáveis).

Leitura: em 16–25, 41% das entradas foram verificadas ou corrigidas, incluindo praticamente todos os artigos indexados. Os "não checáveis" são, quase sempre, páginas de governos, ONGs, imprensa e empresas em domínios bloqueados (HTTP 000/403), **o que não indica fonte falsa**. Em 01–15, das verificadas, 15 foram confirmadas só por URL ativa, 9 são "indiretas" (livro confirmado por resenha) e 7 pelo ERIC.

### Referências não encontradas (6)
- 07 #46 Leitner (1972); 07 #60 Bjork & Bjork (2011, capítulo); 09 #56 Dias & Seabra (2013, PIAF); 11 #56 Capovilla & Capovilla (2004, *Alfabetização: método fônico*); 11 #57 Capellini, Smythe & Silva (2012) — o Crossref traz outro protocolo dos autores (2008); 16 — revisão espanhola (2024) de apps para dislexia.
- Todas, menos a última, são livros ou capítulos. A ausência nas bases não prova que a obra é falsa, e as afirmações foram marcadas "(fonte não confirmada)".

### Correções relevantes (DOIs/autorias trocados)
- 01–15: Park & Fine (2024) no rel. 06; Mayer *Multimedia Learning* 3ª ed. = 2020; Goswami (2011) DOI correto 10.1016/j.tics.2010.10.001 (rels. 11 e 14); Shaywitz et al. (2004); preprint GraphoGame Brasil = Dos Santos Konkewicz et al., **2026** (não ~2023); Dehaene & Cohen (2011); títulos de Kohls et al. (2012) e Bul et al. (2016).
- 16–25: Gillon et al. → 2022 (*Reading and Writing*); Doble et al. (ALEKS); Matsuzoe, Kuzuoka & Tanaka (2014); Fiorella & Mayer (2021); DOIs de Brunick et al. e Lauricella et al.; Nacher & Jaen (2015); Herrera & Defior (2005, *Psykhe*) completada como "provável correspondência".

### O que precisa ser conferido à mão
1. **Leis** (LGPD art. 14, ECA Digital/Lei 15.211/2025, LBI, Lei 12.764, Lei 14.254, decretos da PNA e do CNCA): o Planalto não respondeu (TLS/empty reply). Conferir em outra rede.
2. **PDFs do MEC** (rel. 20, nº 16 e 17): 404, depois 429. Procurar no portal do MEC.
3. **Livros e testes brasileiros** fora das bases (CONFIAS, TCLPP, TDE-II, PROLEC, Morais 1998/2012, Pinheiro 1996, Capovilla & Capovilla): catálogos de editoras ou bibliotecas (Dedalus/USP, Sophia).
4. **Candidatos não aceitos** (semelhança insuficiente): 02 #28 (Método das Boquinhas), 02 #41 (curva de aquisição segmental), 02 #42 (encontros consonantais), 02 #51 (GraphoGame no SBIE), 01 #14 (Clackmannanshire, 7 anos), 04 #73 (Haebig et al. 2021).
5. **Herrera & Defior (2005):** conferir se o conteúdo bate com a afirmação de bidirecionalidade.
6. **Links trocados** já corrigidos: PMC3704307 (Dehaene 2013) e PMC4224062 (Goswami 2014).
7. **Domínios a liberar e script a rodar de novo** (`verif.py` com cache): eduscol, education.gouv.fr, dge.mec.pt, repositórios .pt, education.nsw.gov.au, education.sa.gov.au, worldbank.org, unesco.org, unicef.org, rti.org, povertyactionlab.org, imagineworldwide.org, blog.google, nngroup.com, arxiv.org, aclanthology.org, isca-archive.org, ri.cmu.edu (e, nos rels. 18/19, pirls2021.org, asercentre.org, readalong.google, frontiersin.org).
8. **Números ≠ referências:** as marcas "conferir no PDF", "[NV]" e "(verificar — incerto)" continuam valendo mesmo nas referências verificadas.
9. Os scripts e dados brutos estão no scratchpad da sessão, **fora do repositório**.

---

## Consensos e conflitos entre relatórios

### Consensos fortes (aparecem em 3 ou mais relatórios)
1. **Pseudopalavras obrigatórias** na avaliação da decodificação (16, 18, 20, 22; Decisão 003).
2. **ASR verifica contra alvo conhecido, não transcreve** (17, 18, 21, 22, 25), e **nunca pune a criança por erro do sistema** (20, 21, 22, 24).
3. **ASR e áudio no dispositivo, offline, sem enviar voz por padrão** (18, 20, 21, 22, 23, 24; Decisão 004).
4. **PCPM + precisão como métrica central de fluência**, sem importar normas do inglês como meta (16, 17, 19, 20, 25).
5. **Ortografia transparente:** decodificação cedo (~1 ano); depois o gargalo é fluência, vocabulário, morfologia e **escrita/ortografia como trilha própria** (17, 18, 20, 25).
6. **Agrupar e progredir por nível/domínio** (TaRL, RtI, BSLA, KST) com **Tier 2 automático** e alerta ao professor (16, 18, 19, 20).
7. **Professor e família no circuito**; edtech sem mediação rende menos (17, 19, 21, 23).
8. **Evidência própria desde o início:** pré/pós, grupo de comparação, ECR registrado e avaliação externa, porque quase toda a evidência de produto é do fornecedor (16, 18, 19, 21).
9. **Decodificáveis gerados e validados por algoritmo + revisão humana**, com % de decodificabilidade transparente (17, 18, 21, 25).
10. **Sem LLM livre diante da criança; sem câmera; sem manipulação emocional** (21, 23, 24; Decisão 002).
11. **Escrita inventada mediada e ditado** reforçam a leitura, com evidência que inclui crianças brasileiras (17, 25; Decisão 003).
12. **Variação regional do PB não é erro** (18, 22, 25).
13. **Interface por voz + imagem, sem depender de leitura** (19, 23, 24).

### Conflitos e tensões a decidir
| # | Tema | Posições | Sugestão de encaminhamento |
|---|---|---|---|
| C1 | **Taxa de acerto-alvo** | ~80% (GraphoGame, rel. 17); P ≈ 0,75 na prática e 0,5 no diagnóstico (rel. 20); ~85% no modo infinito de revisão (Decisão 001) | Definir por modo (prática nova, revisão, diagnóstico) e calibrar no piloto |
| C2 | **Escala de níveis** | Rel. 20: escala 0–1000 com 6 níveis (nível 5 ≈ 743); Decisão 004: níveis 0–10 (nível 10 = referência 743, "não equivalência") | Adotar a Decisão 004 (aprovada) e remapear os descritores e a escala interna do rel. 20 |
| C3 | **Modelo de ASR** | Rel. 18 sugere avaliar Whisper tiny/base quantizado, Vosk e Web Speech API; rel. 22 desaconselha Whisper como juiz de pronúncia (normaliza → falso acerto) e recomenda CTC fonêmico | Seguir o rel. 22 para pronúncia/decodificação; Whisper e Web Speech só para tarefas abertas ou plano B |
| C4 | **Modelo do aluno** | Rel. 20: Elo hierárquico com semântica de domínio do BKT; rel. 21 cita "rastreamento bayesiano" como exemplo | Elo (rel. 20) é a proposta detalhada; o BKT fica como semântica |
| C5 | **Duração do diagnóstico inicial** | ASER: 5–10 min oral (rel. 18); FONEMA: 12–15 min em 3 sessões (rel. 20) | Versão curta (triagem) + versão completa em 3 sessões |
| C6 | **Dose diária** | 10–15 min/sessão (rel. 16); horário escolar fixo de 15–20 min (rel. 18); Victoria ≥ 25 min/dia (rel. 18); "sessões curtas com fim natural" (Decisão 001) | Fixar a dose-alvo no piloto; TaRL só funcionou com tempo dedicado |
| C7 | **Mapa linear × mundo aberto** | Rel. 24: mapa linear com no máximo 1 escolha por nível e 2 toques de profundidade; Decisão 001: mundo aberto com regiões, missões paralelas e vila | Trilha principal linear para 4–6 anos dentro do mundo aberto; validar a navegação com o protocolo do rel. 24 |
| C8 | **Tempo visível × automaticidade** | Rel. 24: sem cronômetro nem ranking visível para 4–6 anos; rels. 18/20: tarefas cronometradas (Iqra, RAN, latência, PCPM) | Medir o tempo de forma invisível; nenhum relógio na tela para a criança |
| C9 | **Ícone "baú" de recompensas** | Rel. 24 lista "estrela/baú"; Decisão 002 proíbe baú aleatório/loot box | Trocar o ícone ou garantir que nunca haja conteúdo aleatório |
| C10 | **Uso em casa (B2C)** | Rel. 17: GraphoGame rende mais na escola que em casa; mediação adulta aumenta o efeito; Decisão 001 prevê plano família | "Missões para fazer junto" e relatório semanal com atividade sem tela (rels. 17, 20, 23) |
| C11 | **Limiar de decodificabilidade** | Rel. 21: ≥ 95% (ajustável); rel. 25: ≥ 95% F1–F2, ≥ 90% F3–F4, F5 livre; ambos dizem que é proposta, não literatura | Adotar a versão por fase do rel. 25 e calibrar com acurácia (< 90% → revisão) |
| C12 | **Normas de fluência** | Rel. 20 propõe metas provisórias ancoradas em Hasbrouck & Tindal como ordem de grandeza; rel. 25: "não usar H&T como meta" | Usar as metas do rel. 20 só como hipótese interna, nunca no relatório aos pais como norma; calibrar com ≥ 500 crianças/série |
| C13 | **Critério de domínio** | Rel. 20: P ≥ 0,95 + 8 tentativas/2 sessões + pseudopalavras + latência + retenção 24 h–7 d; Decisão 004: provinha + **transferência** + retenção após dias; Decisão 003: domínio só conta com aplicação fora do formato treinado | Acrescentar ao critério do rel. 20 um item de transferência |
| C14 | **Prazo de alerta/Tier 2** | Tier 2 após 6–10 semanas (rel. 18); bandeira de risco após 8–10 semanas (rel. 20); estagnação de 6 semanas (rel. 20); freemium de 4–8 semanas (Decisão 001) | Uniformizar a janela; o relatório antes/depois do freemium não deve prometer resultado (Decisão 002) |
| C15 | **Espera antes da dica** | Rel. 23: 3–5 s de silêncio; rel. 24: dica em 5 s → 10 s → 20 s | Compatíveis: 3–5 s de escuta, primeira dica aos 5 s |
| C16 | **Sofia: dose de presença** | Rel. 23: fading até a Sofia aparecer pouco na fase 5; rel. 24: a Sofia é o menu falado em toda tela | Manter a Sofia como voz da interface e reduzir só o andaime pedagógico |

---

## Pendências de verificação (consolidadas)

### Dados brasileiros críticos
- Saeb/ICA: 743 pontos; 56% (2023), 59,2% (2024), 66% (2025, nota técnica do Todos pela Educação), meta de 80% em 2030 — conferir em fonte oficial (gov.br com 404/429).
- Learning poverty no Brasil (48%, SAEB 2017) e PIRLS 2021 (61% no nível básico): conferir no Banco Mundial/IEA.
- Normas brasileiras de PCPM por ano e quem aplica avaliação de fluência (CAEd/redes; nomenclatura SPAECE-Alfa).
- Data e ato de fim da Provinha Brasil.
- Instrumentos clínicos (CONFIAS, TCLPP, TDE-II, PROLEC-BR): edição, normas e restrição de uso.
- Tempo de Aprender, Instituto Alfa e Beto, "Ensino Estruturado".
- LexPorBR, ESCOLEX, Pinheiro (1996): disponibilidade e licença.
- Redação da BNCC sobre cursiva.
- Dados Cetic.br (aparelhos e conectividade na escola pública).

### Normas e leis
- LGPD art. 14, LGPD art. 5º II (voz como dado sensível), ECA Digital (Lei 15.211/2025), orientações da ANPD, Google Play Families, WCAG 2.2, ICO Code: conferência direta pendente (frente jurídica, rel. 05).

### Números internacionais "conferir no PDF" ou [NV]
- Hasbrouck & Tindal (tabela P50); corte do PSC em 2026 (31?).
- WERs de Fan et al. (2024) e ganhos de Potamianos et al.
- Read Along (64%, 40%, Sattva); Amira (+0,64, ~0,70 do fornecedor); Lalilo (~6 semanas).
- onebillion (0,34/0,42 DP, +4,2 meses); Tusome (≈ 1 ano); Guiné-Bissau (+65,7 p.p.); Feed the Monster (22 h ≈ 30 h); Vamos Ler! (43%); Gana ("dez vezes"); Room to Read (3–4×); Learning Passport (>10 mi usuários).
- Iqra (tamanho do efeito, NV1); BSLA (só estudos internos); Gerbier et al. e karaokê (magnitude); Price-Mohr & Price (desenho).
- ERCE 2019 por país; Leo Primero; ATAL (85%).

### Lacunas de cobertura
- Equador, ECE/Peru, SIMCE/Chile; Itália, Espanha, Grécia, Polônia (políticas); PIRLS 2021 europeu; Alemanha/"Lesen durch Schreiben"; Irã e Arábia Saudita (NV4/NV5); avaliações independentes de Hồ Ngọc Đại e INOVASI (NV6).
- Learning poverty de Angola, Cabo Verde, Guiné-Bissau, STP e Timor-Leste; MICS STP; Avaliação Nacional de Angola 2024; resultados de Soma Umenye, READ TA, NEI+ e do RCT da Zâmbia.
- Feed the Monster em pt; Aprenderia (CF/ASR, licença).
- ASR: corpora infantis PB públicos; CHILDES-pt, "Projeto ALIP"; disponibilidade do LetsRead e do corpus de Rodrigues & Ribeiro; privacidade da voz infantil.
- IA: LLM gerando decodificáveis com vocabulário controlado; guard-rails do Khanmigo; OCDE Digital Education Outlook.
- UX: Epic, Khan Academy Kids; evidência háptica; estudos de stylus × lápis.
- Tabela de idade de aquisição dos fonemas do PB (dependência da frente de fonoaudiologia, rel. 29), necessária para o ASR (rel. 22) e para o Bolota (rel. 23).

### Itens a validar no piloto (propostas sem base empírica própria)
- Limiares de domínio, provinhas (8/10; 85%/75%), metas de PCPM, latências-alvo (2 s / 3 s), parâmetros do Elo (a = 0,8; b = 0,05), intervalos de revisão (1, 3, 7, 21 dias).
- Limiares de decodificabilidade (95%/90%) e N de repetições (≥ 4).
- FRR ≤ 5% e as três faixas de confiança do ASR.
- Tamanhos de alvo (96/88/72 dp), tempos de dica (5/10/20 s) e orçamentos de desempenho.
- Bíblia da Sofia (visual validado com crianças de ≥ 3 regiões; hipóteses A/B H1–H4).
- Correlação ≥ 0,6 com instrumento externo; coorte ≥ 500 por série; ASR ≥ 90% vs. juízes humanos.
