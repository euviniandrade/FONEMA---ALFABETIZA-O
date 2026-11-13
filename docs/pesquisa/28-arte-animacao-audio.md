# 28 — Produção de arte, animação, vídeo, áudio e música

> Frente 28 de 30 · Projeto FONEMA (alfabetização fônica, pt-BR) · Pesquisa de produção
> Data: 2026-11-13

**Nota de método (transparência).** Este documento **complementa** e não repete as frentes 03 (stack técnica e lip-sync, §6), 04 (direção de arte e som, §5), 10 (fala audiovisual e vídeos da boquinha, §2.3–3.1), 23 (bíblia da Sofia) e 02/05 (Método das Boquinhas, fonte Andika). Quando um ponto já foi coberto, aparece só a remissão "(ver 10 §3.1)".

- **[V]** = conferido nesta sessão: DOI resolvido via API Crossref, metadados de repositório via API de busca do GitHub, página lida por `curl` (learn.microsoft.com, developer.apple.com) ou resultado de busca na web com o conteúdo citado.
- **[NV]** = existe e é citado, mas não foi conferido nesta sessão.

A rede da sessão bloqueou a maioria dos sites de produto (kenney.nl, rive.app, esotericsoftware.com, who.int, w3.org, planalto.gov.br, fonts.google.com). Por isso, várias páginas oficiais foram conferidas pelo conteúdo que a busca retornou, e não por leitura direta. Isso está indicado na tabela. **Os custos em R$ são estimativas próprias de ordem de grandeza** e não vêm de fonte. Peça orçamento antes de decidir.

---

## 1. Resumo executivo

1. **Vídeo real de rosto para o modelo articulatório e animação 2D para o que não se vê.** O modelo por vídeo (*video modeling*) tem base sólida para ensinar imitação: na meta-análise de Bellini & Akullian (2007), em crianças com TEA, o vídeo foi tão eficaz quanto o modelo ao vivo, ou mais [V]. A pista que a criança imita (lábios, dentes, abertura) é melhor mostrada por um **rosto humano real**. O que fica dentro da boca (língua, palato, véu, vibração da garganta) só aparece num **corte lateral animado em 2D**, na linha das "articulation pictures" de Boyer & Ehri (2011) [V], do rosto translúcido de Massaro [V] e da eficácia clínica da realimentação visual da língua por ultrassom [V]. Rosto 3D realista não é recomendado: é caro e corre o risco do vale da estranheza, e 2D tende a render mais que 3D (ver 23 §3.1).
2. **Quem grava: uma fonoaudióloga adulta como modelo principal e 2–3 crianças como modelos secundários.** A adulta garante precisão articulatória e consistência. As crianças, com etnias e regiões diversas e autorização dos responsáveis (ECA/LGPD), entram em versões de "agora é a vez do amigo". Isso dá variabilidade de falantes, que favorece a generalização [V, preprint], e funciona como modelo de pares. A gravação deve ser em **60 fps com áudio de 48 kHz**: a sincronia labial precisa ser de quadro, porque a janela de integração audiovisual das crianças é parecida com a dos adultos (Hillock-Dunn et al., 2016) [V].
3. **Atenção à marca "Boquinhas".** O Método das Boquinhas foi registrado no INPI em 2008 [V] (ver 02). Para não infringir a marca, o recurso deve ter nome próprio, como "Boca da Sofia" ou "Espelho do Som", e arte original.
4. **Sofia em Rive, com 10–12 bocas acionadas pelos visemas do Azure.** O Azure TTS **suporta pt-BR com Viseme ID e blend shapes** (55 posições faciais a 60 fps) [V, página lida]. O Duolingo anima os personagens do app com Rive e visemas, porque animar lábios à mão seria inviável na escala de mais de 40 idiomas [V]. A documentação atual do Rive recomenda **Data Binding** em vez de *inputs* para projetos novos [V]. O Rive Cadet custa US$ 9–17 por assento/mês, com no máximo 3 assentos [V]. Spine (US$ 369–439, licença perpétua, limite de receita de US$ 500 mil) [V] e Live2D (limite de ¥10 milhões e licença de publicação) [V] ficam como alternativas e não são necessários.
5. **Áudio seguro.** A norma OMS-ITU H.870 define um "modo criança" de **75 dB(A) por 40 h/semana**, contra 80 dB no modo adulto [V]. Diretrizes de produção: normalizar falas em **−16 LUFS integrados, com pico real ≤ −1 dBTP** (faixa AES TD1004/TD1008 [V]), música 12–15 dB abaixo da voz, *ducking* automático da música e música zerada quando o microfone estiver ligado (ver 04 §5.3).
6. **Música original, com contrato de cessão de direitos.** Streaming é tratado como execução pública pelo STJ e sujeito ao ECAD [V, via cobertura jurídica]. Para não depender de licença do ECAD, as canções das letras devem ser **encomendadas com cessão total de direitos patrimoniais**, e os compositores não devem registrá-las em associações. Esse arranjo precisa de validação por advogado. Efeitos sonoros: Kenney (CC0) [V] e Freesound **filtrado para CC0/CC-BY**, porque BY-NC é proibido em produto comercial [V]. No OpenGameArt, evitar GPL e CC-BY-SA em material sincronizado [V].
7. **Voz: dubladora humana para fonemas e falas-chave, TTS neural para o resto.** Clonar a voz de dubladora exige consentimento expresso e remuneração. Os PLs 3392/2024 e 4041/2025 caminham nessa direção [V, tramitação não confirmada].
8. **Direção de arte: 2D "feito à mão", calmo, fundo limpo.** O Pok Pok anima tudo à mão, a 24 desenhos por segundo, e usa paleta minimalista para acalmar [V]. Salas muito decoradas reduzem a atenção e a aprendizagem de crianças pequenas (Fisher et al., 2014) [V]. O guia (§3.4) traz paleta HEX com contraste conferido por cálculo WCAG e tipografia livre: **Andika** para letra bastão e imprensa [V] e **Playwrite BR** (TypeTogether/Primarium, OFL) para a cursiva escolar brasileira [V].
9. **Custo e equipe.** O pacote do MVP (≈ 33 vídeos de fonema, Sofia em Rive com ~40 animações, 26–30 canções curtas e cerca de 300 efeitos sonoros) foi estimado em **R$ 350 mil a R$ 700 mil e 6 a 9 meses**, com núcleo de 6 a 8 pessoas (§3.5). A estimativa é própria e precisa de orçamento.

---

## 2. Achados

### 2.1 Vídeo real × 2D × 3D para a "boquinha"

| Formato | O que mostra bem | Evidência | Custo/risco | Uso no FONEMA |
|---|---|---|---|---|
| **Vídeo real, rosto frontal** | Lábios, dentes, abertura da mandíbula, arredondamento, sopro (/p/, /f/) | Modelo por vídeo ≥ modelo ao vivo para imitação, com aquisição mais rápida (Charlop-Christy et al., 2000) [V]; meta-análise de VM/VSM (Bellini & Akullian, 2007) [V]. A informação útil está em baixas frequências espaciais (ver 10 §2.3) | Baixo a médio. Exige direção fonoaudiológica e consentimento de imagem | **Principal.** É o que a criança imita no espelho |
| **Vídeo real, perfil** | Protrusão labial (/u/, /ʃ/), avanço da mandíbula | Pouca evidência específica | Baixo | Opcional, só onde o perfil acrescenta: /u/, /o/, /ʃ/, /ʒ/ |
| **Corte sagital animado em 2D** | Ponta da língua (dentes × alvéolo), dorso (/k/, /g/), véu (nasais), vibração laríngea (sonoras) | "Articulation pictures" de Boyer & Ehri (2011) [V]; fonema + articulação foi a condição mais eficaz no Brasil (Sargiani et al., 2018) [V]; rosto translúcido de Massaro & Light (2004) [V]; realimentação visual da língua por ultrassom (Preston et al., 2014; Bernhardt et al., 2008) [V] | Médio, com animação 2D reutilizável | **Obrigatório** para pares que não se distinguem pelo rosto (/t/×/k/, /s/×/ʃ/, surdo×sonoro, oral×nasal) |
| **Rosto 3D realista ou "talking head"** | Tudo, em tese | Agentes 2D tendem a superar 3D (ver 23 §3.1). Massaro relata ganhos com 3D, mas em amostras clínicas pequenas [V] | Alto, com risco de vale da estranheza e de visemas imprecisos | **Não usar** no MVP |
| **Sofia estilizada (Rive)** | Forma geral da boca no contexto do jogo | Agente animado: efeito pequeno e motivacional (ver 23) | Já incluído no pipeline | Reforço lúdico. **Nunca substitui** o vídeo real na introdução do fonema |

**Déficit de vídeo.** Bebês e crianças de até ~3 anos aprendem menos por tela do que ao vivo (Barr & Hayne, 1999; Strouse & Troseth, 2014) [V]. O déficit diminui com a idade e com contingência, isto é, quando a tela "responde" à criança. A Sofia deve **reagir** à tentativa da criança: espelho, pausa e "sua vez". O vídeo não deve rodar passivo.

**O que a literatura não mostra.** Não foram encontrados estudos controlados com o vídeo da boca como **única** intervenção em alfabetização típica. As evidências são de imitação por vídeo (sobretudo TEA), de figuras articulatórias com letras e de realimentação visual em clínica. O vídeo da boquinha do FONEMA deve, portanto, ser testado em A/B (vídeo + corte + letra × só letra + som).

### 2.2 Sincronia e taxa de quadros
- A janela de integração temporal audiovisual na fala das crianças é parecida com a do adulto (Hillock-Dunn et al., 2016) [V], embora outros paradigmas mostrem amadurecimento até a adolescência (Hillock-Dunn & Wallace, 2012) [V]. Na prática, o vídeo tolera erro de dezenas de ms, mas **áudio adiantado ao vídeo é percebido mais cedo**.
  - **Regra:** desvio de áudio entre −10 ms e +30 ms (áudio pode atrasar levemente). Gravar em 60 fps, com claquete ou palma no início de cada take.
- No app, o Howler/Web Audio tem latência variável no Android. O vídeo deve sair com **áudio embutido (mux)**, e não com áudio tocado em paralelo.

### 2.3 Animação da Sofia: comparação de ferramentas
| Ferramenta | Runtime web/app | Licença / preço | Lip-sync | Prós | Contras |
|---|---|---|---|---|---|
| **Rive** | rive-wasm (1.021★, MIT), rive-runtime C++ (1.254★), rive-react, rive-flutter (1.540★) [V] | Editor: Free; Cadet US$ 9–17/assento/mês (máx. 3); Voyager US$ 32–39; Enterprise US$ 120 [V, fontes divergem] | State machine + Data Binding (inputs viraram legado) [V]; caso Duolingo [V] | Arquivo pequeno, interativo, um só asset com estados (idle, ouvir, comemorar, boca) | Editor proprietário e na nuvem, com dependência do fornecedor |
| **Lottie / dotLottie** | lottie-web (32,4k★, MIT); dotlottie-web (944★, MIT, Rust+WASM) [V] | Gratuito, exportado do After Effects | Precisa trocar segmentos por código. Não tem state machine nativa no Lottie clássico; o dotLottie tem state machines, mas não foram verificadas | Ótimo para efeitos, recompensas e transições, com muitos animadores no mercado | Fraco para personagem com dezenas de estados |
| **Spine** | spine-runtimes (5.361★; licença própria) [V] | Professional US$ 369–439 perpétuo; empresa com receita > US$ 500 mil precisa do Enterprise [V] | Por slots/attachments de boca | Padrão da indústria de jogos 2D, malha deformável | Custo de licença ao escalar; runtime não é MIT |
| **Live2D Cubism** | pixi-live2d-display (1.517★, MIT, parado desde 2024); CubismWebFramework (238★) [V] | Licença de publicação acima de ¥10 milhões de receita; apps "expansíveis" exigem acordo especial [V] | Parâmetro de abertura da boca | Ilusão 2,5D de rosto | Estética de anime/VTuber, licenciamento complexo |
| **DragonBones** | DragonBonesJS (862★, MIT) [V] | Gratuito | Slots | Alternativa livre ao Spine | Ecossistema pouco ativo |
| **3D (TalkingHead/three.js)** | ver 03 §6 | — | Blend shapes do Azure (55 a 60 fps) [V] | Lip-sync automático rico | Custo alto, vale da estranheza (ver 23) |

**Decisão:** usar **Rive para a Sofia e o parceiro** e **Lottie/dotLottie para efeitos e microinterações**. Não comprar Spine ou Live2D.

### 2.4 Visemas pt-BR
- O Azure tem 22 Viseme IDs, com várias correspondências fonema→visema. **pt-BR suporta Viseme ID e blend shapes**, e a saída SVG só existe para en-US [V].
  - Há relato de vozes sem blend shapes, sem documentação [V, Q&A Microsoft]. **Testar a voz escolhida antes de fechar o contrato.**
- Duolingo: mapeamento fala → fonemas → visemas → state machine Rive [V]. Fontes secundárias citam mais de 20 bocas por personagem [NV].
- Para a Sofia, **12 bocas** (agrupando os 22 IDs) é um bom equilíbrio. Ver a tabela em §3.2.

### 2.5 Áudio, segurança auditiva e loudness
- **OMS-ITU H.870 (2019):** dispositivos de escuta segura com modo adulto de 80 dB(A) e modo criança de **75 dB(A)**, ambos para 40 h/semana, com aviso de "cota sonora" [V]. A norma posterior ITU-T H.872, para videogames, adota 75 dBA no modo criança e redução automática [V, fonte secundária].
  - O app **não controla o volume do fone**, mas pode: (a) mixar sem picos (limitador); (b) mostrar aos pais a dica de usar fone com limitador; (c) não exigir volume alto para entender, com fala clara e música baixa.
- **Loudness:** a AES TD1004 recomendava uma janela de −20 a −16 LUFS para streaming, e a TD1008 (2021) atualizou a recomendação [V, via comentários técnicos]. Alvo FONEMA: **−16 LUFS integrados para fala**, **−1 dBTP**, e efeitos sonoros curtos normalizados por pico (−6 dBFS) com loudness de curto prazo coerente com a fala.
- **Perda auditiva induzida por ruído em crianças:** o uso de dispositivos pessoais de escuta é fator de risco e a prevenção é viável (Taljaard et al., 2013; Fligor, 2009) [V].

### 2.6 Música e canções
- **Evidência:** o treino musical tem efeito pequeno a moderado sobre a consciência fonológica (meta-análise de Gordon et al., 2015) [V]. Cantar ajuda a memorizar frases numa língua nova (Ludke et al., 2013) [V]. Melodia e mensagem se ajudam na memória infantil (Thiessen & Saffran, 2009) [V]. A canção é **veículo de memória e de motivação**, não substituta da instrução fônica explícita (ver 14).
- **Formato recomendado:** uma canção curta por fonema (20–40 s), com refrão que **isola e prolonga o som** (ex.: "Mmmm, a vaca faz mmmu") e com a palavra-âncora da letra. A versão karaokê acende a letra quando o som soa (congruência).
  - Andamento de 90–110 bpm e tessitura infantil (aprox. Dó3–Dó4, faixa confortável de voz infantil, recomendação prática [NV]).
  - Arranjo acústico e brasileiro (violão, percussão leve, sanfona, cavaquinho), sem sintetizadores agudos agressivos.
- **Direitos:** o STJ entende o streaming como execução pública sujeita ao ECAD [V, cobertura jurídica; o número do processo não foi conferido]. A Lei 9.610/1998 é a base dos direitos autorais [NV]. Ver o plano em §3.3.

### 2.7 Voz: neural × dubladora
- A comparação de aprendizagem entre voz neural e humana já foi feita (ver 23 §2.2): o TTS moderno fica próximo da voz humana, mas os fonemas isolados devem ser gravados por humano (ver 04 §5.3).
- **Ambiente legal:** o setor de dublagem pede proteção contra clonagem. O PL 3392/2024 exige consentimento prévio, expresso e formal para replicar a voz [V]. O PL 4041/2025 veda criar voz sintética sem consentimento específico e remunerado [V, via imprensa]. Audiência pública na Câmara em 2024 [V]. **Mesmo que nenhum PL seja aprovado**, o contrato de voz própria da Sofia deve prever finalidade, prazo, território, remuneração por uso sintético, direito de revogação e proibição de usar a voz fora do FONEMA.

### 2.8 Direção de arte: referências verificáveis
- **Pok Pok:** tudo desenhado e animado à mão ("not vector art"), a 24 desenhos por segundo, com variáveis de cor para manter o minimalismo calmo [V].
- **Toca Boca, Sago Mini, Khan Academy Kids:** ver 04 §5.1, já referenciados.
- **Ambiente visual:** a decoração excessiva da sala reduziu o tempo na tarefa e a aprendizagem em crianças de 5–6 anos (Fisher, Godwin & Seltman, 2014) [V]. Exposição repetida atenua, mas não elimina o efeito (Godwin et al., 2022) [V]. **Cenário rico na "ilha" e fundo dessaturado e quase vazio na hora da tarefa.**
- **Fotossensibilidade:** WCAG 2.3.1 proíbe conteúdo que pisque mais de 3 vezes por segundo, salvo abaixo dos limiares [V]. Isso vale para confetes e flashes de recompensa.
- **Daltonismo:** pares de cores universais (Ichihara et al., 2008) [V]. Nunca codificar só por cor; vogal e consoante também diferem por forma (§3.4).
- **Representatividade:** pardos são 45,3% da população no Censo 2022, e pretos 10,2% [V]. Isso apoia a Sofia parda (ver 23 §3.1) e um elenco secundário com pretos, indígenas, amarelos, brancos e pessoas com deficiência.

### 2.9 Tipografia escolar brasileira (fontes livres)
| Uso | Fonte | Licença | Status | Observação |
|---|---|---|---|---|
| Letra bastão (caixa alta) e imprensa minúscula | **Andika** (SIL) | OFL-1.1 [V] | Ativa (2026) | "a" e "g" de um andar, feita para alfabetização (ver 05) |
| Alternativa de interface e títulos | **Lexend** | OFL-1.1 [V] | — | Opção do responsável (ver 05) |
| Legibilidade para baixa visão | **Atkinson Hyperlegible** | OFL-1.1 [V] | — | Para textos dos pais e configurações |
| **Cursiva escolar** | **Playwrite BR** + **Playwrite BR Guides** (pautas) | OFL [V, via Fontsource/Google Fonts] | — | Família da TypeTogether com modelos por país (projeto Primarium, com página sobre o Brasil). Pesos Thin–Regular. **Não se confirmou** aderência a um modelo oficial do MEC [V] |
| Títulos lúdicos | Fredoka / Nunito | OFL [NV] | — | Só em logotipo e títulos, nunca no texto de leitura |

**Traçado:** a fonte não serve de guia de traçado. As animações de "como escrever" (ordem e direção dos traços, bastão e cursiva) devem ser desenhadas como caminhos SVG próprios, revisados pela equipe pedagógica. As fontes Playwrite com guias podem servir de referência visual.

---

## 3. PLANO DE PRODUÇÃO

### 3.1 Vídeos da boca por fonema do PB

#### 3.1.1 Nome e identidade
- **Nome do recurso:** "Boca da Sofia" ou "Espelho do Som". **Não usar "boquinhas"** como nome de produto (marca de terceiros; ver 02).
- Vinheta visual própria: moldura arredondada e ícone de espelho.

#### 3.1.2 Especificação técnica
| Item | Especificação |
|---|---|
| Câmera | Mirrorless/cinema com saída 4K, **60 fps**, 10-bit se possível. Lente 85–105 mm equivalente (sem distorção de nariz), f/4–f/5.6 para profundidade de campo que cubra lábios e dentes |
| Enquadramentos | **A) Rosto inteiro frontal** (olhos visíveis, contato visual, 1:1); **B) Close da boca** (do nariz ao queixo, 1:1); **C) Perfil** só para /u o ɔ ʃ ʒ/. Gravar A e B simultaneamente com duas câmeras ou recortar B de A em 4K |
| Iluminação | Três pontos suaves, 5600 K, CRI ≥ 95. Luz principal grande (softbox de 90 cm) a 30°, preenchimento a 1:2, luz de fundo suave. **Sem sombra no interior da boca**: luz baixa de preenchimento para ver língua e dentes |
| Fundo | Liso, cor da paleta "Céu" `#E8EEFB` ou "Creme" `#FFF8EC`, sem textura, a 1,5 m do modelo |
| Figurino e maquiagem | Camiseta lisa sem estampa (cor sólida média). Lábios **naturais com hidratante fosco**, sem batom chamativo nem brilho. Sem barba ou bigode no modelo principal. Unhas curtas se a mão aparecer na garganta |
| Áudio | 48 kHz/24-bit. Microfone shotgun ou supercardioide a 30–50 cm, fora do quadro, mais lapela de segurança. Sala tratada (RT60 < 0,3 s), ruído de fundo < 30 dBA |
| Sincronia | Claquete por take e timecode comum. Tolerância final de −10 a +30 ms (§2.2) |
| Entrega | Master ProRes/DNxHR. Distribuição: **H.264 720×720 a 30 fps** (~1–1,5 Mbps) e **480×480 "leve"** (~500 kbps), com AV1/WebM opcional. Áudio AAC 128 kbps embutido, −16 LUFS. Poster frame PNG |
| Legendas | Arquivo WebVTT com o **grafema** e a palavra, para acessibilidade (surdez) e busca. A letra é animada na arte, não queimada no master |
| Duração | **Clipe base de 4–8 s** (som isolado ×2 → sílaba → palavra-âncora). Clipe de pares mínimos de 6–10 s. Clipe "sua vez" com 3 s de pausa e espelho |

#### 3.1.3 Estrutura de cada clipe (padrão fixo)
1. 0,0–0,5 s: Sofia aponta para a moldura (transição).
2. Close B: **som isolado ×2**. Contínuos prolongados por 1,0–1,5 s (/mmm/, /fff/, /sss/). Oclusivos curtos e **sem vogal de apoio exagerada**: /p/, não "pê".
3. Corte lateral 2D (1,5–2 s) sincronizado com o mesmo áudio, com destaque de cor no articulador (língua, lábios, véu, laringe).
4. Rosto A: sílaba (ex.: "ma") e palavra-âncora ("mala").
5. A **letra aparece no momento do som** (bastão; minúscula a partir da fase 2), na cor de vogal ou consoante.
6. Tela "sua vez": espelho local ligado (sem gravação; ver 10 §3.2) e a Sofia esperando.

#### 3.1.4 Quem grava
- **Modelo principal:** fonoaudióloga com registro no CRFa, fala de **sotaque "neutro" de telejornal**, para o padrão.
  - Gravar as variantes regionais relevantes **como pacotes opcionais**: /t, d/ antes de /i/ ([tʃ, dʒ] × [t, d]); /s/ em coda ([s] × [ʃ]); "r" em coda e "r forte" ([h, x, χ] × [ɾ] × retroflexo). Ver 02.
- **Modelos secundários:** 3 crianças de 6–9 anos de regiões e etnias diferentes, só nos clipes de palavra e "sua vez". Exige termo dos responsáveis, cachê e cessão de imagem com prazo, conforme ECA e LGPD (ver 05).
- **Revisão:** cada clipe aprovado por 2 fonoaudiólogas independentes, com checklist articulatório.
- **Corte lateral:** um animador 2D a partir de pranchas de referência fonética revisadas pela fonoaudióloga. É um *template* reaproveitável: só língua, lábios, véu e indicador de vibração são animados.

#### 3.1.5 Inventário de clipes (PB, ~33 clipes base + pares)
Legenda da coluna "Pista": **F** = visível no rosto frontal, **L** = depende do corte lateral, **G** = mão na garganta (vibração).

| # | Fonema | Tipo | Grafemas mostrados (fase inicial) | Palavra-âncora (sugestão) | Pista principal | Prolongar? | Par mínimo do clipe |
|---|---|---|---|---|---|---|---|
| 1 | /a/ | vogal oral aberta | A a | abelha | F: boca bem aberta | sim | — |
| 2 | /ɛ/ | vogal média aberta | É é / E | elefante (é) | F: aberta e espalhada | sim | /e/ |
| 3 | /e/ | vogal média fechada | Ê ê / E | ema (ê) | F: meio aberta, lábios estirados | sim | /ɛ/ |
| 4 | /i/ | vogal alta | I i | igreja / ilha | F: sorriso, dentes próximos | sim | — |
| 5 | /ɔ/ | vogal média aberta arredondada | Ó ó / O | ovo (ó, no plural "óvos") / bola | F+C: arredondada aberta | sim | /o/ |
| 6 | /o/ | vogal média fechada arredondada | Ô ô / O | ovo (ô) | F+C: arredondada | sim | /ɔ/ |
| 7 | /u/ | vogal alta arredondada | U u | uva | F+C: biquinho | sim | — |
| 8–12 | /ã ẽ ĩ õ ũ/ | vogais nasais | AN/AM/Ã, EN/EM, IN/IM, ON/OM/Õ, UN/UM | anjo, dente, índio, onça, um | L: véu baixo, ar pelo nariz (ícone) | sim | oral × nasal (lá × lã) |
| 13 | /p/ | oclusiva bilabial surda | P p | pato | F: lábios fecham e estouram (papel na frente da boca) | não | /b/ |
| 14 | /b/ | oclusiva bilabial sonora | B b | bola | F+G | não | /p/ |
| 15 | /t/ | oclusiva dental surda | T t | tatu | L: ponta da língua atrás dos dentes | não | /d/, /k/ |
| 16 | /d/ | oclusiva dental sonora | D d | dado | L+G | não | /t/ |
| 17 | /k/ | oclusiva velar surda | C (a,o,u), QU | casa | L: dorso da língua no palato mole | não | /g/, /t/ |
| 18 | /g/ | oclusiva velar sonora | G (a,o,u), GU | gato | L+G | não | /k/ |
| 19 | /f/ | fricativa labiodental surda | F f | faca | F: dentes de cima no lábio de baixo | sim | /v/ |
| 20 | /v/ | fricativa labiodental sonora | V v | vaca | F+G | sim | /f/ |
| 21 | /s/ | fricativa alveolar surda | S, SS, Ç, C (e,i) | sapo | F (dentes juntos) + L | sim | /z/, /ʃ/ |
| 22 | /z/ | fricativa alveolar sonora | Z, S (entre vogais) | zebra | F+L+G | sim | /s/ |
| 23 | /ʃ/ | fricativa pós-alveolar surda | CH, X | chave | F+C: biquinho com dentes juntos | sim | /ʒ/, /s/ |
| 24 | /ʒ/ | fricativa pós-alveolar sonora | J, G (e,i) | janela | F+C+G | sim | /ʃ/ |
| 25 | /m/ | nasal bilabial | M m | mala | F: lábios fechados + L: ar no nariz | sim | /b/, /n/ |
| 26 | /n/ | nasal alveolar | N n | navio | L: ponta da língua no alvéolo + nariz | sim | /m/, /d/ |
| 27 | /ɲ/ | nasal palatal | NH | ninho | L: dorso no palato duro + nariz | sim | /n/ |
| 28 | /l/ | lateral alveolar | L l | lua | L: ponta no alvéolo, ar pelos lados | sim | /ɾ/ |
| 29 | /ʎ/ | lateral palatal | LH | palha | L: dorso no palato | sim | /l/ |
| 30 | /ɾ/ | tepe ("r fraco") | R entre vogais | arara | L: toque rápido da ponta | não (repetir "ara") | /l/, /ʁ/ |
| 31 | /ʁ/ ~ [h, x] ("r forte") | fricativa posterior | R inicial, RR | rato, carro | L: parte de trás da boca/garganta (variante regional) | sim | /ɾ/ (caro × carro) |
| 32 | [tʃ] | alofone de /t/ antes de [i] | TI, TE final | tia, leite | F+L | — | pacote regional |
| 33 | [dʒ] | alofone de /d/ antes de [i] | DI, DE final | dia, cidade | F+L+G | — | pacote regional |

> Os grafemas complexos (X com vários valores, H mudo, S final etc.) seguem a progressão da frente 02/25. Esta tabela é de **produção**: diz o que filmar e animar. A sequência de ensino não é definida aqui.

**Clipes adicionais:** 8 clipes de pares mínimos lado a lado (p/b, t/d, k/g, f/v, s/z, ʃ/ʒ, oral/nasal, ɾ/ʁ) e 7 clipes de vogais em contraste (a-é-ê-i, ó-ô-u). **Total: ≈ 48 clipes no master.**

### 3.2 Pipeline da Sofia (Rive)

**Arquivos:** `sofia.riv` (corpo, rosto, 12 bocas, olhos, mãos) e `parceiro.riv`. Efeitos e recompensas em `.lottie`.

**State machine (camadas paralelas):**
1. **Corpo:** idle-respira (sutil, sem loop chamativo), ouvir (mão na orelha), pensar, apontar-esq/dir/baixo, comemorar-pequeno, comemorar-grande (só ao fim do bloco), "vamos de novo" (encorajando, nunca triste), bocejo de fim de sessão.
2. **Olhar:** para a criança (perguntas e elogios) ou para o alvo (explicação), com alvo controlado por coordenada (ver 23 §3.5).
3. **Boca (12 visemas)**, propriedade `viseme` (número) via **Data Binding** [V]:

| Boca Sofia | Visemas Azure agrupados (IDs) [NV quanto ao agrupamento exato; validar com a tabela oficial] | Fonemas PB típicos |
|---|---|---|
| 0 Repouso | 0 (silêncio) | pausa |
| 1 Aberta | 1, 2 | a, ã |
| 2 Média espalhada | 4 | e, ɛ, ẽ |
| 3 Sorriso fechado | 6 | i, ĩ |
| 4 Arredondada aberta | 3, 9 | ɔ, o |
| 5 Biquinho | 7, 8 | u, ũ, õ |
| 6 Lábios fechados | 21 | p, b, m |
| 7 Dentes no lábio | 18 | f, v |
| 8 Dentes juntos | 15 | s, z |
| 9 Biquinho com dentes | 16 | ʃ, ʒ, tʃ, dʒ |
| 10 Língua no alvéolo (ponta visível) | 19, 14 | t, d, n, l, ɾ |
| 11 Dorso, boca entreaberta | 20, 12 | k, g, ʁ/h, ɲ, ʎ |

**Fluxos de lip-sync** (complementa 03 §6):
- **(a) Falas roteirizadas:** Azure TTS gera MP3 e JSON de visemas no build. O JSON é compactado em trilha `[t_ms, boca]` e tocado em sincronia com `currentTime`. Adiantar a boca 40–60 ms (antecipação natural, prática de animação [NV]).
- **(b) Fonemas gravados pela dubladora:** Rhubarb `phonetic` faz o primeiro passe e o animador corrige (ver 03).
- **(c) "Modo boca" da Sofia** dentro do clipe de fonema: animação **feita à mão** por fonema, sem automação, porque precisa ser exata. São 33 mini-animações.

**Regras de animação:**
- 24 fps no Rive (interpolado).
- Squash & stretch leve.
- Nada se move durante a resposta da criança (ver 23 §3.5).
- Nenhum flash acima de 3 Hz (WCAG 2.3.1).

**Entregáveis de arte da Sofia:**
- Turnaround (frente, ¾, perfil, costas).
- Folha de expressões (12).
- Folha de bocas (12 + 33 "modo boca").
- Folha de mãos (6).
- 3 trocas de roupa por fase (camiseta com a letra; ver 23).
- Versão em silhueta para ícones.

### 3.3 Guia de áudio e música

**Mix e loudness**

| Camada | Alvo | Observação |
|---|---|---|
| Fala (Sofia/TTS e dubladora) | −16 LUFS integrados, −1 dBTP, compressão leve (2:1) | Voz sempre inteligível sem precisar subir o volume |
| Fonemas isolados | Pico −3 dBFS, sem compressão que achate o ataque das oclusivas | Fade de 5 ms; nunca cortar a soltura do /p t k/ |
| Música de fundo | −28 a −32 LUFS (12–15 dB abaixo da fala) | *Ducking* de −10 dB quando há fala; **mudo com microfone ligado e em som-alvo** |
| Canções (tela própria) | −16 LUFS | Volume igual ao da fala, para não "estourar" ao entrar |
| Efeitos de UI | Pico −6 dBFS, 50–300 ms | Faixa média de 500 Hz a 4 kHz; evitar agudos > 8 kHz estridentes e graves "de susto" |
| Erro | Som neutro e curto (madeira, "plim" grave), ≤ 200 ms | Nunca buzina (ver 04) |

**Implementação:**
- Limitador master no app (Web Audio `DynamicsCompressorNode` como limiter a −1 dBFS).
- Normalização no pipeline de assets com `ffmpeg-normalize` (1.540★) [V] ou `loudnorm`.
- Seção "Cuidando dos ouvidos" para os pais, com o modo infantil de 75 dB da OMS-ITU [V], recomendação de fone com limitador e pausas.

**Bibliotecas de efeitos (ordem de preferência):**
1. **Gravação própria e Foley** de objetos brasileiros (sementes, chocalho, panela, berimbau), que dá identidade.
2. **Kenney**: CC0, uso comercial livre, crédito opcional [V].
3. **Freesound**: só **CC0** ou **CC-BY**, com crédito numa planilha de atribuições. **Excluir BY-NC** e o legado Sampling+ [V].
4. **OpenGameArt**: só CC0, CC-BY ou OGA-BY. **Excluir GPL e CC-BY-SA** em áudio sincronizado a vídeo ou animação, por risco de "contaminar" a licença [V].

Manter um registro (CSV) com arquivo, fonte, URL, licença, autor e data do download, para auditoria.

**Canções das letras:**
- **Quantidade:** 26 canções de letra/fonema (20–40 s), mais o tema da Sofia com variações por ilha, uma canção de "tchau" (fim de sessão calmo) e 4–6 trilhas instrumentais em loop (60–90 s) para mapas.
- **Composição:** compositor brasileiro contratado por **encomenda com cessão total e definitiva dos direitos patrimoniais**, incluindo sincronização, execução e adaptações. A gravação deve ter cessão de direitos conexos dos intérpretes e músicos.
  - **Avaliar com advogado** se os autores filiados a associações (UBC, Abramus etc.) devem deixar de cadastrar essas obras, e como o ECAD trata streaming em app educacional [V: streaming é execução pública segundo o STJ; enquadramento do app NV].
- **Não usar** músicas folclóricas em gravação de terceiros nem paródias de sucessos. A melodia folclórica é de domínio público, mas o **arranjo e a gravação não são** [NV, princípio geral de direito autoral].
- **Voz das canções:** dubladora da Sofia ou coral infantil contratado, com autorização dos responsáveis.

**Voz:**
- **Dubladora humana (DRT):**
  - todos os fonemas isolados e pares mínimos;
  - 150–300 falas-chave (elogios, instruções recorrentes, nomes das letras);
  - canções.
- **TTS neural (Azure pt-BR, com visemas)** para histórias, frases dinâmicas e personalizadas.
- **Clonagem da voz da dubladora:** só com contrato específico (§2.7) e aviso aos pais (ver 23 §3.4).
- **Sessão de gravação:** 48 kHz/24-bit, microfone condensador de diafragma largo, cabine; 2–3 takes por item; direção fonoaudiológica presente nas sessões de fonemas.

### 3.4 Guia de estilo visual

**Estilo:**
- Ilustração 2D com contorno irregular e textura leve de lápis/guache.
- Formas arredondadas, sem preto puro e sem branco estourado.
- Cenários brasileiros (ver 04 §5.1).
- Densidade visual em dois níveis:
  - **"Mundo"** (mapas, ilhas, recompensas): rico, com 6–10 elementos.
  - **"Tarefa"**: fundo dessaturado, ≤ 3 elementos além do alvo (Fisher et al., 2014 [V]).

**Paleta.** Contrastes calculados nesta sessão pela fórmula de luminância relativa da WCAG 2.x. Texto normal exige ≥ 4,5:1 e texto grande ≥ 3:1.

| Papel | Nome | HEX | Contraste conferido |
|---|---|---|---|
| Fundo principal | Creme | `#FFF8EC` | — |
| Fundo de tarefa A | Céu | `#E8EEFB` | — |
| Fundo de tarefa B | Menta | `#E6F4F1` | — |
| Fundo quente | Pêssego | `#FDE8D7` | — |
| Texto principal | Tinta | `#2B2A4C` | 12,9:1 sobre Creme; 11,5:1 sobre Pêssego ✔ |
| Texto secundário | Ardósia | `#5B5A72` | 6,3:1 sobre Creme ✔ |
| **Vogal** (codificação inicial) | Urucum | `#C2410C` | 4,9:1 sobre Creme; 5,2:1 sobre branco ✔ (sobre Pêssego, 4,4:1: usar só em letra grande) |
| **Consoante** (codificação inicial) | Anil | `#1D4ED8` | 6,4:1 sobre Creme ✔ |
| Acerto / progresso | Mata | `#2F7D4F` | 4,8:1 sobre Creme ✔ |
| Destaque / foco | Jabuticaba | `#6D3FC0` | 6,4:1 sobre Creme; texto branco 6,7:1 ✔ |
| Acento da Sofia (só preenchimento, **nunca texto**) | Manga | `#F28C28` | 2,3:1 sobre Creme ✘ para texto; com texto Tinta por cima, 5,6:1 ✔ |
| Brilho / estrela (só preenchimento) | Ipê | `#F4B400` | com texto Tinta por cima, 7,4:1 ✔ |

**Codificação vogal × consoante:**
- Urucum × Anil é um par laranja-avermelhado × azul, distinguível nos daltonismos protan e deutan (princípio de cor universal [V]).
- **Sempre redundante com forma:** vogal sobre "gota" arredondada, consoante sobre "bloco" quadrado.
- A cor é retirada gradualmente (ver 04 §5.1).

**Tons de pele do elenco (referência inicial, a validar com a consultoria de diversidade):**
- Sofia parda `#A86B47`, sombra `#7E4E33`.
- Cabelo `#2E1B12`.
- Outros personagens: `#F1C9A5`, `#D9A27A`, `#8D5A3B`, `#5C3A26`, `#3B2419`.
- Evitar "pele genérica" laranja.

**Tipografia:**
- **Leitura:** Andika, mínimo de 32 px para palavras isoladas na fase inicial e 24 px em frases. Entreletra +2 a +4%, entrelinha 1,5.
- **Letra-alvo** em destaque: Andika Bold, 96–160 px.
- **Cursiva:** Playwrite BR, com Playwrite BR Guides para pautas.
- **Interface dos pais:** Atkinson Hyperlegible ou Lexend, 16–18 px.
- **Logotipo e títulos:** fonte lúdica OFL (Fredoka/Nunito [NV]), nunca em texto de leitura.

**Movimento:**
- Duração padrão de 200–400 ms com *ease-out*.
- Recompensas ≤ 1,5 s.
- Respeitar `prefers-reduced-motion`: trocar por fade e manter o som.
- Sem flashes acima de 3/s [V].

**Iconografia:**
- Ícones com rótulo falado ao tocar.
- Alvo de toque ≥ 64 dp para crianças (ver 24).

### 3.5 Estimativa de custos e equipe (ordem de grandeza, estimativa própria, sem fonte)

| Item | Escopo MVP | Estimativa (R$) | Prazo |
|---|---|---|---|
| Diretor(a) de arte / ilustrador(a) sênior | Bíblia visual, Sofia, parceiro, 6 cenários, UI kit | 60–120 mil | 3–4 meses |
| Animador(a) Rive | Sofia (≈ 40 estados), parceiro (≈ 20), 33 "modo boca" | 50–110 mil | 3–5 meses |
| Animador(a) 2D / motion | Corte sagital (template + 33 variações), Lottie de efeitos (≈ 60) | 35–70 mil | 2–3 meses |
| Produção de vídeo da boca | 2–3 diárias de estúdio, equipe de 4, 48 clipes, edição, cor, legendas | 40–90 mil | 1–2 meses |
| Fonoaudiólogas (modelo + 2 revisoras) | Gravação e revisão de todos os clipes e fonemas | 15–35 mil | contínuo |
| Modelos infantis (3) | Cachê, cessão de imagem, acompanhante | 6–15 mil | 1 semana |
| Dubladora da Sofia | Fonemas, ~300 falas, canções, contrato de voz sintética | 25–60 mil | 2–4 semanas |
| Compositor(a) / produtor(a) musical | 26 canções + tema + 6 trilhas, gravação e mix | 60–150 mil | 3–4 meses |
| Sound designer | ≈ 300 efeitos, foley, mix e normalização | 20–45 mil | 2 meses |
| Licenças de software | Rive Cadet/Voyager (3 assentos), Adobe/Affinity, DAW | 5–15 mil/ano | — |
| Jurídico (cessões, ECAD, voz, imagem) | Contratos-modelo e parecer | 15–40 mil | — |
| **Total MVP** | | **≈ R$ 330–750 mil** | **6–9 meses** |

**Equipe mínima:** 1 diretor(a) de arte, 1 animador(a) Rive, 1 motion/2D, 1 sound designer/compositor (ou 2), 1 produtor(a) de vídeo freelancer e 1 fonoaudióloga-consultora. A equipe pedagógica aprova todos os assets de conteúdo.

**Como baratear:**
- Gravar os vídeos em uma única maratona de estúdio.
- Usar o template de corte sagital para todos os fonemas.
- Usar efeitos Kenney/Freesound CC0 nos protótipos.
- Gerar a fala da Sofia por TTS até validar a personagem e só então contratar a dubladora.
- Encomendar 10 canções no MVP e as demais depois.

**Cronograma sugerido:**
- **M1–M2:** bíblia visual + piloto (3 fonemas completos: /m/, /a/, /p/), com teste de usabilidade com 10–15 crianças.
- **M3–M5:** produção em lote.
- **M6:** mix, QA de sincronia (script que mede o desvio áudio/vídeo por clipe), acessibilidade (contraste, flashes, `reduced-motion`) e revisão fonoaudiológica final.

**QA obrigatório por asset:**
- Checklist fonoaudiológico.
- Sincronia ≤ 30 ms.
- Loudness dentro do alvo.
- Licença registrada.
- Teste de flash (WCAG 2.3.1).
- Contraste ≥ 4,5:1 em textos.

---

## 4. Referências

| # | Nome / autoria | Ano | Título | País | Tipo | URL / DOI | V/NV | O que aproveitar |
|---|---|---|---|---|---|---|---|---|
| 1 | Bellini, S.; Akullian, J. | 2007 | A Meta-Analysis of Video Modeling and Video Self-Modeling Interventions for Children and Adolescents with ASD | EUA | Meta-análise | 10.1177/001440290707300301 | V | Base do modelo por vídeo para imitação |
| 2 | Charlop-Christy, M. H. et al. | 2000 | A Comparison of Video Modeling with In Vivo Modeling for Teaching Children with Autism | EUA | Experimento | 10.1023/a:1005635326276 | V | Vídeo ≥ ao vivo na aquisição |
| 3 | Boyer, N.; Ehri, L. C. | 2011 | Contribution of Phonemic Segmentation Instruction With Letters and Articulation Pictures… | EUA | Experimento | 10.1080/10888438.2010.520778 | V | Figuras articulatórias + letras (corte lateral) |
| 4 | Sargiani, R.; Ehri, L.; Maluf, M. R. | 2018 | Orthographic mapping instruction to facilitate reading and spelling in Brazilian emergent readers | Brasil | Experimento | 10.1017/s0142716418000371 | V | Fonema + articulação no PB |
| 5 | Castiglioni-Spalten, M.; Ehri, L. | 2003 | Phonemic Awareness Instruction: Contribution of Articulatory Segmentation… | EUA | Experimento | 10.1207/s1532799xssr0701_03 | V | Atenção aos gestos articulatórios |
| 6 | Massaro, D.; Light, J. | 2004 | Using Visible Speech to Train Perception and Production of Speech for Individuals With Hearing Loss | EUA | Experimento | 10.1044/1092-4388(2004/025) | V | Rosto translúcido mostra a língua |
| 7 | Bosseler, A.; Massaro, D. | 2003 | Development and Evaluation of a Computer-Animated Tutor for Vocabulary and Language Learning in Children with Autism | EUA | Experimento | 10.1023/b:jadd.0000006002.82367.4f | V | Tutor animado com boca visível |
| 8 | Preston, J. et al. | 2014 | Ultrasound Visual Feedback Treatment and Practice Variability for Residual Speech Sound Errors | EUA | Experimento | 10.1044/2014_jslhr-s-14-0031 | V | Ver a língua ajuda a corrigir |
| 9 | Bernhardt, B. et al. | 2008 | Ultrasound as visual feedback in speech habilitation… rural British Columbia | Canadá | Estudo clínico | 10.1080/02699200701801225 | V | Idem, aplicação a distância |
| 10 | Hillock-Dunn, A. et al. | 2016 | The temporal binding window for audiovisual speech: Children are like little adults | EUA | Experimento | 10.1016/j.neuropsychologia.2016.02.017 | V | Tolerância de sincronia |
| 11 | Hillock-Dunn, A.; Wallace, M. | 2012 | Developmental changes in the multisensory temporal binding window persist into adolescence | EUA | Experimento | 10.1111/j.1467-7687.2012.01171.x | V | Cautela: a janela amadurece |
| 12 | Barr, R.; Hayne, H. | 1999 | Developmental Changes in Imitation from Television during Infancy | EUA/NZ | Experimento | 10.1111/1467-8624.00079 | V | Déficit de vídeo |
| 13 | Strouse, G.; Troseth, G. | 2014 | Supporting toddlers' transfer of word learning from video | EUA | Experimento | 10.1016/j.cogdev.2014.01.002 | V | Contingência reduz o déficit |
| 14 | Kartushina, N. et al. | 2025 | Talker-variability in visual feedback articulatory training… | Noruega | Preprint | 10.31234/osf.io/yc3r8_v1 | V (preprint) | Vários falantes para generalizar |
| 15 | Fisher, A.; Godwin, K.; Seltman, H. | 2014 | Visual Environment, Attention Allocation, and Learning in Young Children | EUA | Experimento | 10.1177/0956797614533801 | V | Fundo limpo na tarefa |
| 16 | Godwin, K. et al. | 2022 | Effect of Repeated Exposure to the Visual Environment on Young Children's Attention | EUA | Experimento | 10.1111/cogs.13093 | V | O efeito persiste com exposição |
| 17 | Gordon, R.; Fehd, H.; McCandliss, B. | 2015 | Does Music Training Enhance Literacy Skills? A Meta-Analysis | EUA | Meta-análise | 10.3389/fpsyg.2015.01777 | V | Música: efeito modesto em consciência fonológica |
| 18 | Ludke, K.; Ferreira, F.; Overy, K. | 2013 | Singing can facilitate foreign language learning | Reino Unido | Experimento | 10.3758/s13421-013-0342-5 | V | Canção como memória |
| 19 | Thiessen, E.; Saffran, J. | 2009 | How the Melody Facilitates the Message and Vice Versa in Infant Learning and Memory | EUA | Revisão/experimentos | 10.1111/j.1749-6632.2009.04547.x | V | Melodia + palavra |
| 20 | Taljaard, D. et al. | 2013 | Personal listening devices and the prevention of NIHL in children: Cheers for Ears | Austrália | Intervenção | 10.4103/1463-1741.113523 | V | Prevenção auditiva infantil |
| 21 | Fligor, B. | 2009 | Personal listening devices and hearing loss… | EUA | Artigo | 10.4103/1463-1741.53356 | V | Risco de fones |
| 22 | Ichihara, Y. et al. | 2008 | Color universal design: selection of four easily distinguishable colors for all color vision types | Japão | Artigo técnico | 10.1117/12.765420 | V | Paleta segura para daltonismo |
| 23 | OMS / ITU | 2019 | Safe listening devices and systems: a WHO-ITU standard (H.870) | Internacional | Norma | https://who.int/publications/i/item/9789241515276 | V (conteúdo via busca) | 75 dB modo criança, 40 h/semana |
| 24 | AES | 2015/2021 | TD1004 / TD1008 — Loudness para streaming | Internacional | Recomendação técnica | https://www.pro-tools-expert.com/production-expert-1/aes-update-loudness-recommendations-for-audio-only-streaming | V (secundária) | −16 LUFS / −1 dBTP |
| 25 | W3C | 2018/2023 | WCAG 2.1/2.2 — SC 2.3.1 Three Flashes or Below Threshold | Internacional | Norma | https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold | V (via busca) | Sem flashes > 3/s |
| 26 | Microsoft | 2026 | Get facial position with viseme (Azure Speech) | EUA | Documentação | https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme | V (lida) | 22 visemas; 55 blend shapes a 60 fps; SVG só en-US |
| 27 | Microsoft | 2026 | Language support — Visemes table | EUA | Documentação | https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts | V (lida) | **pt-BR: Viseme ID + Blend shapes** |
| 28 | Microsoft Q&A | 2023 | Azure Speech — poor viseme blendshape quality / voices without blendshapes | EUA | Fórum oficial | https://learn.microsoft.com/en-us/answers/questions/1185396/azure-speech-poor-viseme-blendshape-quality | V (via busca) | Testar voz por voz |
| 29 | Duolingo | s.d. | World character visemes (blog) | EUA | Relato de caso | https://blog.duolingo.com/world-character-visemes | V (trecho via busca) | Pipeline visema → Rive em escala |
| 30 | Rive | 2026 | Runtimes — Inputs (legado) / Data Binding | EUA | Documentação | https://rive.app/docs/runtimes/inputs | V (via busca) | Usar Data Binding |
| 31 | Rive | 2026 | Pricing | EUA | Documentação comercial | https://rive.app/docs/account-admin/pricing | V (via busca; valores divergem) | Custo por assento |
| 32 | rive-app/rive-wasm; rive-runtime; rive-react; rive-flutter | 2026 | Runtimes Rive (MIT) | EUA | Software | https://github.com/rive-app/rive-wasm | V | Runtime web/app |
| 33 | airbnb/lottie-web | 2025 | Lottie web (32,4k★, MIT) | EUA | Software | https://github.com/airbnb/lottie-web | V | Efeitos/UI |
| 34 | LottieFiles/dotlottie-web | 2026 | dotLottie web player (MIT) | EUA | Software | https://github.com/LottieFiles/dotlottie-web | V | Player leve |
| 35 | Esoteric Software | 2026 | Spine — Purchase / license | Dinamarca/EUA | Página comercial | https://esotericsoftware.com/spine-purchase | V (via busca) | US$ 369–439; limite de US$ 500 mil |
| 36 | EsotericSoftware/spine-runtimes | 2026 | Spine runtimes | — | Software | https://github.com/EsotericSoftware/spine-runtimes | V | Alternativa |
| 37 | Live2D | 2026 | SDK / Publication license (help + EULA) | Japão | Licença | https://help.live2d.com/en/?p=2172 | V (via busca) | Limiar de ¥10 milhões; apps expansíveis |
| 38 | guansss/pixi-live2d-display | 2024 | Plugin PixiJS para Live2D (MIT) | — | Software | https://github.com/guansss/pixi-live2d-display | V | Parado desde 2024 |
| 39 | DragonBones/DragonBonesJS | 2026 | Runtime JS (MIT) | China | Software | https://github.com/DragonBones/DragonBonesJS | V | Alternativa livre |
| 40 | DanielSWolf/rhubarb-lip-sync | 2026 | Rhubarb Lip Sync | — | Software | https://github.com/DanielSWolf/rhubarb-lip-sync | V | Primeiro passe nas gravações humanas |
| 41 | slhck/ffmpeg-normalize | 2026 | Normalização de loudness | — | Software | https://github.com/slhck/ffmpeg-normalize | V | Pipeline de áudio |
| 42 | goldfire/howler.js; Tonejs/Tone.js | 2025/2026 | Áudio web (MIT) | — | Software | https://github.com/goldfire/howler.js | V | Playback, música interativa |
| 43 | Kenney | 2026 | Support / License (CC0) | Países Baixos | Banco de assets | https://kenney.nl/support | V (via busca) | Efeitos/UI CC0 |
| 44 | Freesound (MTG-UPF) | 2026 | FAQ — licenças CC0/BY/BY-NC | Espanha | Banco de sons | https://freesound.org/help/faq | V (via busca) | Usar só CC0/BY |
| 45 | OpenGameArt | 2026 | FAQ — licenças (CC0, CC-BY, OGA-BY, GPL, CC-BY-SA) | Internacional | Banco de assets | https://opengameart.org/content/faq | V (via busca) | Evitar GPL/SA em sincronização |
| 46 | MTG/freesound | 2026 | Código do site Freesound (AGPL) | Espanha | Software | https://github.com/MTG/freesound | V | API para busca filtrada por licença |
| 47 | Apple Developer | 2021 | Behind the Design: Pok Pok Playroom | EUA | Entrevista | https://developer.apple.com/news/?id=5bcex7xf | V (lida) | Tudo desenhado à mão |
| 48 | Mom's Choice Awards / SuperParent / Sketch | 2021 | Entrevistas Pok Pok (24 desenhos/s; variáveis de cor) | EUA | Entrevista | https://superparent.com/?p=8504 ; https://www.sketch.com/blog/pok-pok/ | V (via busca) | Animação e paleta calmas |
| 49 | SIL / silnrsi/font-andika | 2026 | Andika (OFL-1.1) | Internacional | Fonte | https://github.com/silnrsi/font-andika | V | Letra bastão/imprensa |
| 50 | googlefonts/lexend | 2023 | Lexend (OFL-1.1) | EUA | Fonte | https://github.com/googlefonts/lexend | V | Opção de leitura |
| 51 | googlefonts/atkinson-hyperlegible | 2021 | Atkinson Hyperlegible (OFL-1.1) | EUA | Fonte | https://github.com/googlefonts/atkinson-hyperlegible | V | Interface dos pais |
| 52 | TypeTogether / Google Fonts | 2024 | Playwrite BR e Playwrite BR Guides (projeto Primarium) | Internacional/Brasil | Fonte | https://fonts.google.com/specimen/Playwrite+BR/about ; https://fontsource.org/fonts/playwrite-br/about | V (via busca) | Cursiva escolar brasileira |
| 53 | Jardini, R. et al. (Pró-Fono; Rev. Ibero-Am. Estudos Educ.) | 2011/2023 | Método das Boquinhas (fonovisuoarticulatório); registro INPI de 2008 | Brasil | Artigos | https://scielo.br/j/pfono/a/RKycsLVJxjDsFwkxP6zLbQp/?lang=en | V (via busca) | Evitar o nome; inspiração conceitual |
| 54 | IBGE / Agência Gov | 2023 | Censo 2022: 45,3% pardos, 10,2% pretos | Brasil | Estatística oficial | https://agenciagov.ebc.com.br/noticias/202312/censo-2022-mostra-que-45-da-populacao-brasileira-e-pardos-e-43-5-branca | V (via busca) | Representatividade do elenco |
| 55 | Câmara dos Deputados — PL 3392/2024 | 2024 | Diretrizes para replicação de vozes por IA (consentimento) | Brasil | Projeto de lei | https://internetlab.org.br/wp-content/uploads/2024/09/PL-3392-2024.pdf | V (texto via busca; tramitação NV) | Contrato de voz da Sofia |
| 56 | Agência Câmara | 2024 | Segmento de dublagem pede proteção legal contra voz gerada por IA | Brasil | Notícia oficial | https://www.camara.leg.br/noticias/1092791-segmento-de-dublagem-pede-protecao- | V (via busca) | Contexto setorial |
| 57 | Exame | 2026 | Quando usar o rosto/voz de alguém com IA é legal (cita PL 4041/2025) | Brasil | Imprensa | https://exame.com/inteligencia-artificial/quando-usar-o-rosto-de-alguem-com-ia-e-legal-entenda-a-lei-e-o-uso-de-deepfakes/ | V (secundária) | Tendência regulatória |
| 58 | Dizer o Direito / Rev. Humanidades e Inovação | 2017/s.d. | STJ: streaming é execução pública (ECAD) | Brasil | Comentário jurídico | https://www.dizerodireito.com.br/2017/04/servicos-de-streaming-como-spotify-e.html | V (secundária; nº do REsp NV) | Risco ECAD → música própria com cessão |
| 59 | Lei 9.610/1998 (Direitos Autorais) | 1998 | — | Brasil | Lei | https://www.planalto.gov.br/ccivil_03/leis/l9610.htm | NV (site bloqueado) | Cessão de direitos patrimoniais |
| 60 | ITU-T H.872 | 2024–2025 | Safe listening para videogames | Internacional | Norma | https://www.aiha.org/news/250313-new-standard-sets-sound-level-guidelines-for-video-game-consoles | V (secundária) | 75 dBA no modo criança |
| 61 | Mapeamento exato visemas Azure → 12 bocas da Sofia | — | Agrupamento proposto na §3.2 | — | Proposta própria | — | NV | Validar com a tabela oficial de IDs |
| 62 | Fontes lúdicas Fredoka / Nunito | — | Licença OFL | — | Fonte | — | NV | Só títulos |

**Contagem:** 59 entradas marcadas V (38 conferidas diretamente por DOI/Crossref, API do GitHub ou leitura da página, e 21 conferidas pelo conteúdo retornado na busca, algumas por fonte secundária, como indicado) e 3 NV (#59, #61, #62), sem contar os itens NV citados no corpo (custos, tessitura, antecipação da boca).

### Pendências
1. Confirmar a tabela oficial dos 22 Viseme IDs × fonemas pt-BR e testar a voz pt-BR escolhida (Viseme ID e blend shapes) num protótipo Rive.
2. Ler as páginas oficiais bloqueadas nesta sessão (Rive pricing, Spine, Kenney, Freesound, OpenGameArt, WHO H.870, WCAG) e liberar esses hosts na rede da sessão.
3. Parecer jurídico: cessão musical × ECAD em app educacional; contrato de voz sintética; cessão de imagem de crianças.
4. Busca INPI: "Boca da Sofia", "Espelho do Som" e similares (classes 9, 41, 28).
5. Piloto de 3 fonemas com A/B (vídeo + corte + letra × letra + som) antes da produção em lote.
6. Orçamentos reais com 3 estúdios ou freelancers por linha da §3.5.
