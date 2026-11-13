# Proposta 1 — "Quintal Brasil" (caminho equilibrado)

> **📦 Proposta histórica.** Esta proposta foi uma das 5 opções de 13/11/2026. A [Decisão 005](../../decisoes/005-proposta-unificada.md) juntou o melhor das cinco na **[proposta 06 (FONEMA Unificada)](../06-fonema-unificada/README.md)**, que é a que vale. Decisões posteriores também mudaram pontos daqui: dupla Sofia e Tales em 3D (D007), sem adornos (D008), sem arco-íris (D009), Academia (D011), **sem festa junina, carnaval ou folclore como entidade (D012)** e linguagem de **plataforma**, não "jogo" (D014). Ver o [índice de decisões](../../decisoes/README.md).

> **Uma frase:** um livro ilustrado brasileiro que vira mundo. A criança atravessa 11 biomas com a Sofia e o Bolota, lendo de verdade para fazer o mundo acontecer, num app e numa web calmos e feitos à mão, construídos com uma stack madura, barata de operar e que respeita a privacidade.

| | |
|---|---|
| **Perfil da proposta** | Equilibrada / recomendável: risco técnico baixo, custo de operação baixo, qualidade visual alta sem 3D |
| **Base** | `docs/sintese/00-documento-mestre.md` (especificação v1), Decisões 001–004, rels. 03, 24, 28, 31, 37, 38 |
| **Visual** | 2D ilustrado, aconchegante, papel e texturas suaves, cores quentes; mapa aéreo 2D com as 11 regiões |
| **Stack** | Turborepo + pnpm · Expo/React Native (app) · Next.js (web) · PixiJS (jogos) · Rive (Sofia) · Supabase (São Paulo) · TTS Azure pré-gerado · fala no aparelho com sherpa-onnx |
| **Foco inicial** | B2C famílias (freemium por conquista, sempre mensal) + pilotos em escolas |
| **Documentos** | [arquitetura.md](arquitetura.md) · [esqueleto.md](esqueleto.md) · [infra.md](infra.md) · [design.md](design.md) |
| **Imagens** | `tela-mapa.png`, `tela-licao.png`, `tela-lojinha.png`, `tela-pais.png`, `tela-professor.png`, `estilo.png`, `arquitetura.png`, `infra.png` (fontes HTML/SVG em `fontes/`) |

---

## 1. Conceito e "elevator pitch"

**Pitch (30 segundos).** O FONEMA Quintal Brasil ensina crianças de 4 a 8 anos a ler pelo método fônico, do zero à alfabetização plena, em cerca de 2 anos. A criança mora num quintal que cresce até virar uma vila e viaja por 11 regiões brasileiras: da Ilha das Vogais ao Arquipélago dos Livros, passando pela Mata Atlântica, Pampa, Pantanal, Cerrado, Caatinga, Amazônia, Litoral e Cidade das Letras. Cada região é um bloco de sons. A Sofia mostra como o som nasce na boca (o **Espelho do Som**), o Bolota aprende junto, e tudo o que a criança lê muda o mundo: acende o farol, faz a ponte, enche a estante. Os pais veem toda semana "Nível 3 de 10: faltam 7"; a professora vê quem precisa dela amanhã. Sem anúncios, sem sorteio, sem dinheiro de verdade no jogo, e a voz da criança nunca sai do aparelho.

**Por que "Quintal".** O quintal é o lugar seguro de onde a criança brasileira sai para explorar e para onde volta. É também o nome do design system proposto no rel. 31 e o nome da região R0. A estética é a de um **livro infantil brasileiro**: papel, guache, formas arredondadas, sem preto puro (rel. 28). A calma vem de referências como Pok Pok (poucos estímulos, nada piscando, fim natural), mas a linguagem visual é **original e brasileira**: ipê, mandacaru, tuiuiú, coqueiro, chita.

**Princípios que guiam a proposta**
1. **Ciência primeiro, embalagem depois.** Fônica sistemática, domínio antes de avançar, revisão espaçada, erro como pista (documento mestre §3).
2. **Mundo rico, tarefa calma.** O mapa e a vila têm 6–10 elementos; a tela da tarefa tem no máximo 3 além do alvo (rel. 28).
3. **Tecnologia madura e aberta.** Tudo com licenças MIT/Apache, sem motor proprietário de jogo, sem 3D (rel. 03).
4. **Privacidade por arquitetura.** Fala no aparelho, TTS pré-gerado, analytics só próprios, RLS por papel (documento mestre §4.15).
5. **Custo que fecha também no B2G.** Custo variável de voz ≈ R$ 0 por aluno, porque nada de voz roda na nuvem por padrão (documento mestre §4.16).

---

## 2. Experiência da criança — um dia típico

**Lia, 6 anos, 1º ano, Recife. Terça-feira, 18h40, tablet da família.** (Ela está na região R2b, Trilha do V-S-N; Termômetro da Leitura no nível 3.)

| Momento | O que acontece | Por quê |
|---|---|---|
| **Abertura (≤ 3 s)** | A mãe já tinha deixado o perfil da Lia selecionado. O app abre direto no **mapa** ([tela-mapa.png](tela-mapa.png)). A Sofia acena: "Olha, Lia! O Bolota achou uma trilha nova na mata. Vamos ler juntos?" O termômetro à esquerda está um pouco mais cheio do que ontem. | Sem login de texto para a criança; no máximo 2 toques até a atividade (rel. 24) |
| **Acolhida (≤ 6 s)** | Lia toca no botão grande (play). A Sofia pergunta "Como você está hoje?" com 4 rostinhos. Lia escolhe "animada". A resposta não vai para nenhum relatório. | Autorrelato efêmero (rel. 33) |
| **Aquecimento (2 min)** | "Rima ou não rima?" com palavras de regiões já vencidas (MALA rima com FALA?), só com sons já ensinados. Três acertos rápidos. | Recuperação ativa e intercalação (rel. 07) |
| **Som novo: /v/ (3 min)** | Tela da lição ([tela-licao.png](tela-licao.png)). O **Espelho do Som** mostra a boca real fazendo "vvvv", o corte lateral com a garganta vibrando e a letra V aparecendo no instante do som. "Encoste a mão no pescoço… sentiu?" Lia toca no espelho (câmera frontal local, nada gravado) e depois no microfone: diz "VA". O modelo no tablet reconhece; a Sofia elogia o processo: "Você juntou o V com o A!" | Som + boca + letra + significado juntos (Ehri; rel. 10, 28). Fala verificada no aparelho, nunca juiz (rel. 22) |
| **Prática (4 min)** | "Alimente o Bolota": o Bolota quer comer só coisas com V. Lia arrasta a VELA e a UVA (ou toca-toca, se preferir). Erra a FACA; a peça balança de leve e a Sofia diz "Quase! Ouve: fffaca. É o ventinho sem vibrar." | Feedback imediato sem vermelho (rel. 13, 24) |
| **Pausa ativa (30 s)** | "Vamos voar como o tucano?" Lia abre os braços. | Pausa de movimento (rel. 09, 12) |
| **Contraste (2 min)** | Pares F × V ("FACA × VACA"), com pseudopalavra "VOFA" para conferir se ela decodifica. | Pseudopalavras verificam decodificação real (D003) |
| **Ensinar o Bolota (1 min)** | O Bolota lê "FALA" como "VALA". Lia corrige e explica com a mão no pescoço. | Efeito protégé (rel. 23) |
| **Ritual de fim (1 min)** | A trilha ganha mais um trecho iluminado, uma figurinha falante da VACA entra no álbum, e **as moedinhas da sessão chegam todas juntas** (8). A Sofia diz: "Amanhã a gente descobre o S. Tchau!" O app volta para o mapa e **não puxa outra fase** (sem autoplay). | Fim natural; moeda entregue em bloco, depois do fato (documento mestre §4.9) |
| **Depois (fora do app)** | Lia vai à lojinha pela vila ([tela-lojinha.png](tela-lojinha.png)). Lê "SAIA" (12 moedas) e "VIOLA" no cofrinho. A Sofia avisa: "Se comprar a SAIA agora, a VIOLA demora mais um pouquinho. Você decide!" Lia decide guardar. | Educação financeira leve; etiqueta = palavra decodificável (D002) |
| **À noite (mãe)** | A mãe recebe o resumo semanal no domingo ([tela-pais.png](tela-pais.png)): "Nível 3 de 10 · faltam 7 níveis", com áudio de 1 minuto e a missão sem tela: procurar coisas com /v/ na cozinha. | Adulto faz parte da intervenção (rel. 26) |
| **Na escola (quarta)** | A professora vê no painel ([tela-professor.png](tela-professor.png)) que a Lia está no Grupo 2 (sílabas com S e N) e recebe a atividade de 10 minutos para amanhã. | Painel do professor é parte da intervenção (rel. 31) |

**Duração total:** 12–15 minutos. A sessão sempre termina. Não há sequência de dias que "quebra", vidas, cronômetro nem ranking.

---

## 3. Jornada de 2 anos

O mapa segue a **proposta única de 11 regiões** do documento mestre (§4.2), uma por etapa da ordem de ensino. A trilha principal é **liberada por domínio**; o ritmo abaixo é indicativo para uma criança de 5–6 anos com 4–5 sessões por semana.

| Ano | Região | Sons | O que a vila ganha (proposta) | Nível típico ao sair |
|---|---|---|---|---|
| **1** | R0 Quintal da Sofia | Consciência fonológica oral | Casa do avatar, quintal, Bolota | 0 |
| | R1 Ilha das Vogais | A E I O U | Farol aceso, barco e cais | 1 |
| | R2a Mata Atlântica — Vale do M-L-F | M, L, F + CV | Horta e Árvore das Palavras | 2 |
| | **Fim da parte gratuita** | Relatório antes/depois ao adulto; "ponte em obras" para a criança, sem cadeado e sem oferta | | |
| | R2b Mata Atlântica — Trilha do V-S-N | V, S, N + CV.CV | Correio da vila (bilhetes dos moradores) | 3 |
| | R3 Pampa | P, T → B, D | Moinho e padaria | 4 |
| | R4 Pantanal | J, Z, X/CH, NH, LH + frases | Viveiro de bichos | 5 (parcial) |
| | R5 Cerrado | C/QU, G/GU, R/RR, S/SS, Ç | Biblioteca (estante de livrinhos) | 6 (parcial) |
| | R6 Caatinga — chefe do Ano 1 | Nasalidade | Mercado e coreto (cordel) | 5 (completo) |
| **2** | R7 Amazônia | CVC + ditongos | Barco-escola e observatório | 5–7 |
| | R8 Litoral e Mar | CCV (PR, BR, PL…) | Estação e cais grande | 6–7 |
| | R9 Cidade das Letras | S/Z/X, CH/X, J/G, H; morfologia | Jornal, teatro e praça | 8 |
| | R10 Arquipélago dos Livros — chefe final | Fluência, textos, escrita autoral | Editora da vila: "Livro da minha jornada" | 9–10 |

**Camadas do mundo aberto (como a jornada fica "quase infinita")**
- **Trilha principal** linear dentro do mundo aberto para 4–6 anos; o mapa abre mais para 7–8 anos.
- **Missões paralelas procedurais** geradas por regras (só grafemas já ensinados, linter de decodificabilidade, semente determinística): ~60% alvo, ~30% revisão, ~10% transferência. Toda missão termina.
- **Vila do Bolota**: construir e decorar com escolhas simples ("a horta gosta de ficar perto da água").
- **Colecionáveis que ensinam**: álbum de figurinhas que falam, livros na estante (por domínio, nunca por moeda).
- **Desafio-chefe** por região (provinha disfarçada; falhar não tira nada; nova chance sempre).
- **Temporadas** como festas na vila (Dia das Crianças e outras); itens voltam todo ano. *Atualizado pela D012: no lugar de Carnaval, Festa Junina e Folclore, entram Feira de Leitura e Colheita, Dia da Família, Copa das Letras e formatura.*
- **Regiões antigas viram revisão espaçada**: os moradores continuam pedindo ajuda com palavras daquele bloco.
- **Seis competências por dentro da leitura**: cartas de comando para o Bolota (pensamento computacional), enigmas de classificar sons (lógica), bilhete triste de um morador (emoções), "como o app me ouve" (tecnologia), cofrinho (finanças).

---

## 4. Diferenciais desta proposta

1. **Acabamento de livro ilustrado brasileiro** com custo de produção 2D (ilustração + Rive), sem a conta e o risco de 3D.
2. **Espelho do Som**: vídeo real da boca + corte lateral 2D + letra sincronizada, com pistas lúdicas ("mão na garganta: vibra!"). Recurso próprio, sem usar a marca registrada "Boquinhas".
3. **Fala no aparelho desde o MVP** (sherpa-onnx + modelo CTC fonêmico): privacidade forte e custo variável ≈ R$ 0, o que torna o preço B2G viável.
4. **Uma conta, dois clientes**: app (Expo) e web (Next.js) compartilham lógica pedagógica, jogos e design system no mesmo monorepo; a escola usa a web/PWA no laboratório e a família usa o app.
5. **Painéis que geram ação**: mapa de calor com grupos sugeridos e atividade para amanhã (professor); 1 tela por semana com áudio (pais).
6. **Economia ética de ponta a ponta**: lojinha onde comprar é ler, cofrinho com meta, zero aleatoriedade, nenhuma moeda comprável, entrega em bloco no fim da sessão.
7. **Dados no Brasil**: banco, autenticação, arquivos e funções na região São Paulo.

---

## 5. O que entra no MVP

O MVP vai até o **beta fechado** (200–500 famílias + 3–5 turmas) e ao **lançamento B2C**. Os IDs seguem o rel. 31 / documento mestre.

| Bloco | Entra no MVP | Fica para V1/V2 |
|---|---|---|
| **Contas e conformidade** | Conta do adulto (F01), consentimento granular + porteira (F02), perfis infantis, login por figuras e QR da turma (F03), painel de privacidade com "apagar" | SSO de redes (F58) |
| **Mundo** | Mapa das 11 regiões (todas visíveis; **conteúdo jogável R0 → R3** no lançamento, ~6 meses de uso), vila básica, álbum, desafio-chefe | Temporadas completas, vila com estratégia avançada |
| **Ensino** | Currículo em dados (F04), diagnóstico em 3 sessões (F05), sessão estruturada + ritual (F07), motor v0 de domínio e revisão (F08), escada de ajuda (F13), provinhas (F15) | Agendador FSRS treinado (F70), benchmark trimestral (F38) |
| **Conteúdo** | 14 jogos-núcleo (F12), ~30 livrinhos decodificáveis (F16), linter (F17), fonemas gravados por humano (F10), **Espelho do Som** para os sons até R3 (~20 dos ~48 clipes) | Restante dos clipes (por região), 100+ livros (F48), canções (F45) |
| **Personagens** | Sofia em Rive com 12 bocas e ~20 estados; Bolota com ~10 estados | Repertório completo (~40 estados) |
| **Fala** | VAD + modo "só incentiva" (F24) para todos; **beta "Eu leio, a Sofia escuta"** no aparelho em escolas-piloto (F25) | Leitura oral geral, karaokê, PCPM (F30–F32) |
| **Economia** | Moedinhas (entrega em bloco), lojinha com etiquetas decodificáveis, cofrinho com meta, modo "só estrelas" | Duas lojinhas (comparar preços), presentes, projeto coletivo |
| **Adultos** | Relatório semanal da família com áudio (F21), painel do professor v1 com 5 visualizações (F22) | Painel escola/rede (F40), fila de escuta (F42), PDF e importação de turmas (F47) |
| **Plataforma** | Offline-first (F20), acessibilidade WCAG 2.2 AA (F19), perfil sensorial e modo calmo (F18), analytics first-party (F23), assinatura mensal (web + lojas) | Espelho local por câmera (F43, V1); dica por câmera (F50, só após A/B e parecer) |

**Critério de "pronto" do MVP:** cada jogo e tela com ≥ 80% de sucesso sem ajuda e < 15% de toques fora do alvo em 5–8 crianças por faixa; FRR da fala ≤ 5% nos itens liberados; abertura a frio ≤ 3 s e ≥ 30 fps num Android de 2 GB; parecer jurídico assinado.

---

## 6. Cronograma (fases e meses)

Supõe início em **fevereiro de 2027 (M1)**, depois do fim da coleta e da síntese (D001) e da criação do branch `main` (D004). Meses são do projeto.

| Fase | Meses | Entregas principais | Marco de saída |
|---|---|---|---|
| **0 · Fundação e PoCs** | M1–M2 | Monorepo, CI, 3 ambientes, ADRs, design tokens; **PoC de fala** no aparelho (Android de entrada, 30–50 crianças); **PoC Rive** (12 bocas + visemas Azure); piloto do Espelho do Som com /m/ /a/ /p/ e **A/B** (vídeo+corte+letra × só letra+som); contratação da fono e da dubladora; pedido de parecer jurídico | PoCs aprovadas ou plano B definido (ex.: fala "só incentiva" no lançamento) |
| **1 · Núcleo da criança** | M3–M5 | Contas/consentimento/porteira, mapa, sessão completa, 8 primeiros jogos, motor v0, R0–R2a jogáveis, offline, Sofia e Bolota animados | Teste de usabilidade com 15–24 crianças (3 faixas) |
| **2 · Adultos, economia e conteúdo** | M5–M7 | Relatório da família, painel do professor v1, lojinha/cofrinho/vila, 14 jogos, R2b–R3, ~30 livrinhos, assinatura (web + lojas), estúdio editorial | Homolog completo; revisão de segurança e LGPD |
| **3 · Beta fechado** | M7–M9 | 200–500 famílias + 3–5 turmas; publicação em Apple Kids e Google Play Famílias (faixa fechada/interna); medição de dose, FRR por região, funil freemium; **braço de controle da economia** | Métricas de aprendizagem e engajamento saudável dentro das metas |
| **4 · Lançamento B2C** | M9–M10 | Lançamento público com R0–R3 (≈ 6 meses de jornada) | Lojas aprovadas; suporte ativo |
| **5 · Cadência de regiões + V1** | M10–M18 | **1 região nova a cada 6–8 semanas** (sempre à frente das crianças mais rápidas); V1: leitura oral geral, karaokê, Jardim da Revisão, traçado, painel escola/rede, 5–20 escolas privadas | R4–R6 no ar até M15; R7–R10 até M24 |
| **6 · B2G** | M12–M24 | 2–4 municípios via CPSI; preparação do RCT (ano letivo 2028/2029) | Contrato CPSI assinado |

O rel. 27 previa o beta no 1º semestre de 2027; com o início em fevereiro, o beta desta proposta cai no 2º semestre de 2027. Para antecipar, dá para reduzir o MVP a R0–R2a (só a parte gratuita) e lançar em M7.

---

## 7. Equipe

**Núcleo do MVP (≈ 11 FTE)**

| Papel | FTE | Observação |
|---|---|---|
| Líder técnico / arquiteto (TypeScript, Supabase) | 1 | dono do monorepo, segurança e ADRs |
| Dev React Native / Expo | 2 | app, offline, módulos nativos |
| Dev web (Next.js) | 1 | painéis, PWA, checkout |
| Dev de jogos (PixiJS) | 1 | motor e 14 jogos |
| Engenheiro(a) de fala / ML | 1 | sherpa-onnx, modelo CTC, corpus, regressão |
| Product designer (UX infantil + adulto) | 1 | design system Quintal, testes com crianças |
| Ilustrador(a) + animador(a) Rive | 1,5 | cenários das regiões, Sofia, Bolota |
| Designer pedagógico / editor de conteúdo | 1 | currículo em dados, livrinhos |
| Fonoaudióloga (CRFa) | 0,5 | Espelho do Som, matriz de tolerância |
| QA (manual + automação) | 0,5 | aparelhos reais de entrada |
| Produto (PM/PO) | 0,5 | o dono pode acumular |

**Externos:** dubladora, compositor (cessão total), estúdio de vídeo, 2ª fonoaudióloga revisora, advogado(a) de privacidade/ECA Digital e de licitações, consultoria de conteúdo (ERER, cultura indígena, biologia).

**Sustentação após o lançamento (≈ 7–8 FTE):** 3 devs, 1 fala/ML, 1 design/arte, 1 conteúdo, 0,5 fono, 1 suporte/sucesso do cliente.

---

## 8. Custo estimado

> **Tudo nesta seção é ESTIMATIVA** desta proposta, sem orçamento de fornecedor. Câmbio de referência: **US$ 1 = R$ 5,50** (hipótese). Salários com encargos (CLT ou PJ equivalente), mercado de 2026.

### 8.1 Construção (até o lançamento, M1–M10)

| Item | Faixa |
|---|---|
| Equipe núcleo (≈ 11 FTE × 10 meses × R$ 20–28 mil) | R$ 2,2 – 3,1 mi |
| Produção audiovisual (vídeos do Espelho do Som, dubladora, fonemas, efeitos, música encomendada; rel. 28) | R$ 330 – 750 mil |
| Jurídico (parecer LGPD/ECA Digital, contratos de voz/imagem, busca INPI) | R$ 80 – 150 mil |
| Pesquisa com crianças, PoCs, corpus inicial de fala (CEP, recrutamento, anotação) | R$ 120 – 250 mil |
| Ferramentas e nuvem durante a construção (Rive, EAS, Supabase, Vercel, Azure, aparelhos de teste) | R$ 40 – 80 mil |
| **Total até o lançamento** | **≈ R$ 2,8 – 4,3 mi** |
| V1 + regiões R4–R10 (M10–M24, equipe de sustentação + produção de conteúdo) | + R$ 2,0 – 3,0 mi |

### 8.2 Operação mensal por número de alunos ativos (só infraestrutura e serviços)

Premissas: fala 100% no aparelho; TTS pré-gerado; pacotes de conteúdo via CDN sem custo de saída (ex.: Cloudflare R2); ~60 MB baixados por aluno/mês; relatório por e-mail e push (WhatsApp opcional, não incluído).

| Item (estimativa, R$/mês) | 1 mil alunos | 10 mil alunos | 100 mil alunos |
|---|---|---|---|
| Supabase (plano + computação + PITR) | 400 – 700 | 1.500 – 2.500 | 7.000 – 12.000 |
| CDN / armazenamento de pacotes | 50 – 150 | 200 – 500 | 1.500 – 3.000 |
| Web (Vercel ou similar) | 300 – 500 | 600 – 1.200 | 2.500 – 5.000 |
| Expo EAS (builds, atualizações OTA) | 550 | 550 – 1.100 | 1.100 – 3.000 |
| Fala na nuvem (fallback opcional, só escolas-piloto) | 0 – 300 | 500 – 1.500 | 3.000 – 8.000 |
| TTS de conteúdo novo (build) | 100 – 300 | 100 – 300 | 200 – 500 |
| E-mail transacional + push | 50 – 100 | 150 – 300 | 800 – 1.500 |
| Observabilidade (Sentry, Grafana, uptime) | 300 – 500 | 600 – 1.200 | 2.500 – 5.000 |
| Outros (GitHub, backup externo, domínios, Rive) | 400 – 600 | 600 – 1.000 | 1.500 – 3.000 |
| **Total infraestrutura** | **≈ R$ 2,2 – 4 mil** | **≈ R$ 4,8 – 9,6 mil** | **≈ R$ 20 – 41 mil** |
| **Por aluno/mês** | ≈ R$ 2,20 – 4,00 | ≈ R$ 0,50 – 0,95 | ≈ R$ 0,20 – 0,41 |

Fora da tabela: equipe de sustentação (≈ R$ 160–220 mil/mês), taxas de pagamento (lojas 15–30%; Pix/cartão na web 1–5%) e RevenueCat (1% da receita acima da faixa gratuita). Com **Azure para toda a fala** o custo seria ≈ US$ 1,3–1,5 por aluno/mês (rel. 03), ou seja, **R$ 7–8 por aluno/mês**, inviável para o B2G; por isso a fala no aparelho é requisito.

---

## 9. Modelo de preço (sempre mensal)

Segue a Decisão 001 e o documento mestre §4.16: **só assinatura mensal, nenhum plano anual**, freemium por conquista, oferta **só para o adulto**, atrás da porteira.

| Plano | Preço proposto (hipótese a validar) | O que inclui |
|---|---|---|
| **Gratuito por conquista** | R$ 0 | R0 + R1 + R2a completas (~4–10 semanas), relatório antes/depois completo, painel da turma para a escola. A criança vê a próxima região como "ponte em obras", sem cadeado e sem oferta |
| **Família** | **R$ 27,90/mês** (faixa 24,90–29,90) | até 3 crianças, app + web, todas as regiões, relatório semanal |
| **Escola privada** | **R$ 7,90 por aluno/mês** (faixa 5–10), mínimo de 20 alunos, faturado mensalmente | painel do professor, grupos, PDF, suporte; família do aluno ganha acesso em casa |
| **Rede pública** | **R$ 2,90–3,90 por aluno/mês** via CPSI ou pregão com ARP ⚖️ | painel agregado da secretaria (sem dado nominal), formação cobrada à parte |

Regras: nenhum item da lojinha é exclusivo de assinante; a representatividade do avatar é sempre grátis; cancelamento em 2 toques na área adulta; preço igual na web e nas lojas sempre que a taxa da loja permitir (senão, a diferença é explicada ao adulto). Pesquisa van Westendorp com 300+ pais em base mensal antes do lançamento.

---

## 10. Riscos e mitigação

| Risco | Prob. | Impacto | Mitigação nesta proposta |
|---|---|---|---|
| Fala no aparelho com acurácia baixa em crianças de 4–5 anos ou em Android fraco | Alta | Alto | PoC na Fase 0; MVP com "só incentiva" para todos e verificação só no beta de escolas; toda tarefa tem caminho por toque; fala nunca bloqueia progresso |
| Jogos PixiJS dentro do React Native (Expo DOM/WebView) pesados em aparelho de 2 GB | Média | Alto | Orçamento de desempenho no CI; atlas de texturas; 30 fps como piso; plano B: jogos simples reimplementados com React Native Skia |
| Conteúdo não acompanhar o ritmo das crianças (1 região a cada 6–8 semanas) | Média | Alto | Estúdio editorial + linter + geração procedural; produção de arte 2 regiões à frente; lançar com R0–R3 |
| Rejeição ou atraso nas lojas (Kids/Families) | Média | Médio | Sem SDK de terceiros na área infantil, porteira de nível adulto, compra só na área adulta; revisão de política no CI de release |
| Questões jurídicas (ECA Digital, voz, economia fictícia, contratação "por aluno/mês") | Média | Alto | Parecer antes do beta; consentimentos separados; economia desligável; nada aleatório |
| Dependência de fornecedores (Supabase, Rive, Azure) | Baixa | Médio | Supabase é Postgres padrão (migração possível); Rive com exportação dos arquivos; TTS pré-gerado e versionado (troca de voz sem quebrar) |
| Efeito da economia na motivação intrínseca (superjustificação) | Média | Médio | Entrega em bloco, piloto com 3 braços, sentinela E8, modo "só estrelas" |
| App sozinho rende pouco (GraphoGame) | Alta | Alto | Missão da família, painel do professor e grupos de amanhã são parte do MVP |
| Custo de equipe acima do previsto | Média | Médio | Escopo do MVP cortável (R0–R2a), contratação por fases |

---

## 11. Prós e contras

**Prós**
- Menor risco técnico entre as opções: stack popular, muita gente sabe React/TypeScript, tudo com licença permissiva.
- Um só código para app e web; mesma conta e mesma lógica pedagógica nos dois.
- Visual de alta qualidade e acolhedor, com custo de produção 2D e arquivos leves (cabe no Android de entrada e no limite de 40 MB).
- Custo de operação muito baixo por aluno (centavos em escala) e dados no Brasil.
- Privacidade forte por desenho: voz não sai do aparelho; atende melhor LGPD, ECA Digital e regras das lojas.
- Bom equilíbrio para começar no B2C e depois vender para escolas e redes.

**Contras**
- Menos "uau" que uma proposta 3D ou com mundo contínuo explorável: o mundo aberto é um mapa ilustrado com camadas, não um personagem andando livremente.
- Jogos em WebView dentro do app exigem cuidado de desempenho e de integração (áudio, toques).
- Fala no aparelho exige especialista em ML e corpus próprio; nos primeiros meses a verificação de leitura fica restrita ao beta.
- Supabase concentra muita coisa num fornecedor (mitigado por ser Postgres padrão).
- Equipe de ~11 pessoas: não é a opção mais barata para validar só a ideia.

---

## 12. Quando escolher esta proposta

Escolha o **Quintal Brasil** se:
- o objetivo é chegar a um produto **profissional e seguro em cerca de 9–10 meses**, com risco controlado;
- o primeiro mercado é **famílias (B2C)**, com pilotos em escolas e porta aberta para redes públicas;
- é importante ter **app e web com a mesma conta** desde o início;
- a privacidade (voz no aparelho, dados no Brasil) e o **custo baixo por aluno** pesam na decisão;
- o dono prefere um visual **calmo, brasileiro e de livro ilustrado** a um visual de videogame 3D.

Prefira outra proposta se o objetivo principal for um protótipo mínimo e muito barato para testar a ideia em poucas semanas, ou, no outro extremo, um mundo 3D de exploração livre com orçamento e prazo maiores.
