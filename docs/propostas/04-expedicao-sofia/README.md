# Proposta 4 — EXPEDIÇÃO SOFIA

> **📦 Proposta histórica.** Esta proposta foi uma das 5 opções de 13/11/2026. A [Decisão 005](../../decisoes/005-proposta-unificada.md) juntou o melhor das cinco na **[proposta 06 (FONEMA Unificada)](../06-fonema-unificada/README.md)**, que é a que vale. Decisões posteriores também mudaram pontos daqui: dupla Sofia e Tales em 3D (D007), sem adornos (D008), sem arco-íris (D009), Academia (D011), **sem festa junina, carnaval ou folclore como entidade (D012)** e linguagem de **plataforma**, não "jogo" (D014). Ver o [índice de decisões](../../decisoes/README.md).

> **Em uma frase:** a jornada de 2 anos vira uma **série animada interativa em 11 temporadas**, uma por região do mapa. Em cada episódio de 10–15 min, a criança **destrava a história lendo**. A pilha técnica é a mais enxuta e barata das cinco: uma **PWA web-first** (Next.js + PixiJS + Rive) empacotada para as lojas com **Capacitor**, offline-first e com backend gerenciado.

| Item | Resumo |
|---|---|
| Conceito | Série de desenho animado 2D em que a criança é coprotagonista: Sofia guia, Bolota aprende, a criança lê para a história andar |
| Ênfase pedagógica | Código explícito (fônico) **+** linguagem oral, histórias, conhecimento de mundo e **criação de histórias pela criança** |
| Público-alvo inicial | **B2C** (famílias) em **celulares Android de entrada**; escola entra pelo "modo sala" e pelo painel simples |
| Stack | Next.js (export estático) · PixiJS v8 · Rive · Capacitor 7 · IndexedDB + service worker · Supabase (São Paulo) · Cloudflare R2/Pages · TTS pré-gerado · fala no navegador (ONNX/Transformers.js, WASM) com alternativa por toque |
| MVP | ~6 meses, equipe núcleo de 6–7 pessoas, **R$ 0,55–0,85 mi** |
| Custo de infraestrutura | ~R$ 0,45 / R$ 0,15 / R$ 0,07 por aluno/mês (1 mil / 10 mil / 100 mil alunos ativos) |
| Preço | Grátis por conquista (R0 + R1 + R2a) → **Família R$ 24,90/mês** (até 3 crianças) |

Arquivos desta proposta: [arquitetura.md](arquitetura.md) · [esqueleto.md](esqueleto.md) · [infra.md](infra.md) · [design.md](design.md) · imagens `estilo.png`, `tela-*.png`, `arquitetura.png`, `infra.png`.

---

## 1. Conceito

**"Expedição Sofia"** é uma série de aventura. Sofia (≈ 9–10 anos, parda, cabelo cacheado, "a prima que já sabe ler") e Bolota (filhote de tatu-bola, curioso e trapalhão) percorrem os biomas do Brasil. Cada região do mapa único do Documento Mestre (§4.2) vira uma **temporada**. A criança não assiste: **a história só anda quando ela age**. Ela lê o bilhete, a placa ou a receita; corrige o Bolota; escolhe o que acontece e inventa o final.

Por que série animada?
- **Vínculo parassocial** com personagens recorrentes aumenta o aprendizado com agentes (rel. 23). Uma série com ganchos e personagens fixos é o formato que a criança já conhece da TV.
- **Contingência:** o déficit de aprendizagem por vídeo some quando a tela **reage** à criança (rel. 28). Por isso não há vídeo passivo: a cena espera a leitura.
- **Linguagem e conhecimento de mundo:** compreensão = decodificação × linguagem (rel. 41). Cada temporada responde a uma pergunta-guia de ciência e cultura (rel. 39), com histórias **acima** do nível de decodificação para ouvir e recontar.
- **Produção barata e escalável:** personagens em Rive e cenários vetoriais reaproveitáveis custam menos do que um mundo 3D ou do que vídeo animado frame a frame. A mesma "bíblia" visual serve para 200 episódios.

### O que a criança faz num episódio (10–15 min)

| Momento | Duração | O que acontece | Base |
|---|---|---|---|
| **Abertura + "Anteriormente…"** | ~1 min | Vinheta curta. A Sofia faz 3–5 perguntas-relâmpago do que já foi aprendido (prática de recuperação) | Doc. Mestre §4.4 (aquecimento e revisão); rel. 07 |
| **Ato 1 — A história** | 2–4 min | Cena narrada com 2–3 pausas CROWD ("o que você acha que o lobo vai fazer?") e 1 palavra nova de vocabulário | Slot "Hora da História" / "Papo com a Sofia"; rel. 41 |
| **Ato 2 — O som do episódio** | 3–4 min | **Espelho do Som** + "eu faço → nós fazemos → você faz" com letras móveis. O Bolota erra de propósito e a criança corrige | Doc. Mestre §4.4 e §4.7; rel. 23 (efeito protegido) |
| **Ato 3 — Destrave** | 2–3 min | Para abrir a trilha, a criança lê uma frase decodificável (voz ou toque) e responde a 1 pergunta de compreensão. Inclui ≥ 1 pseudopalavra "mágica" | Verificação fora do formato do jogo (§4.5) |
| **Ato 4 — Criar** | 2–3 min | "E depois?": a criança escolhe entre 3 continuações decodificáveis, **dita** (4–5 anos) ou monta com letras móveis (6–8) o final, ou legenda um quadrinho de 3 quadros | Rel. 40 (escrita inventada, autoria) |
| **Encerramento** | 30–60 s | Recapitula, mostra o termômetro enchendo, entrega moedinhas em bloco, deixa um **gancho** para amanhã. **Sem botão "próximo episódio"** | Ritual de encerramento (§4.4); rel. 42 |

Para 4–5 anos, o episódio é dividido em **duas partes de 6–7 min**. Cada parte é uma sessão completa e termina em alta.

---

## 2. Um dia típico (Lia, 6 anos, Temporada 6 — Cerrado)

| Hora | O que acontece |
|---|---|
| **7h40, café da manhã** | (opcional, 3 min) "Curta de revisão": 6 palavras do Jardim da Revisão escolhidas pelo motor de revisão espaçada, no celular da mãe, offline |
| **17h30, depois da escola** | Lia abre o app. A tela **Temporadas** mostra o Cerrado, o termômetro sem números e o botão grande "continuar a história" (ver `tela-temporadas.png`) |
| 17h31 | **Ep. 4, "O lobo-guará e a trilha"**: "Anteriormente…" com 4 palavras. A Sofia conta por que o lobo-guará come a fruta-do-lobo. Pausa: "Por que ele anda de noite?" |
| 17h35 | Som do episódio: **r × rr** (caro/carro). Espelho do Som e corte lateral; o Bolota lê "core" e Lia corrige (ver `tela-episodio.png`) |
| 17h39 | **Destrave**: lê "o lobo corre na terra seca" em voz alta. A verificação no aparelho aceita; a porteira de cipó abre. Pergunta: "Onde o lobo corre?" |
| 17h41 | **Criar**: escolhe o final ("o lobo bebe na vereda") e monta "o lobo bebe" com letras móveis. O quadrinho vai para o "Livro da minha jornada" |
| 17h43 | Encerramento: moedinhas por dominar o "rr", gancho ("amanhã: a festa do ipê!"). A sessão termina. |
| 17h44 | Lia leva 2 minutos na **Lojinha**: decide guardar no cofrinho para o patinete (ver `tela-lojinha.png`). Brincar livre na vila só se o responsável liberou |
| **20h00** | Janela noturna: só "história para dormir" em áudio |
| **Domingo** | A mãe abre a **Área da família** (porteira de 3 s + tarefa de leitura): "Nível 6 de 10 — faltam 4", missão da semana e áudio de 1 min (ver `tela-pais.png`) |

Na escola, a professora projeta o Ep. 4 no **modo sala**: a turma lê em coro para abrir a trilha, e o painel mostra os grupos sugeridos (ver `tela-professor.png`).

---

## 3. Jornada de 2 anos — temporadas e episódios

A jornada usa exatamente o **mapa único de 11 regiões** do Documento Mestre (§4.2). Ritmo-alvo: **5 sessões/semana**, das quais **2 são episódios novos** e as outras 3 são **Curtas** (missões procedurais de revisão e transferência, com fim definido) ou reprises com nova pergunta. O avanço é **por domínio**; as semanas são indicativas.

| Temp. | Região (etapa) | Sons | Pergunta-guia / arco da história | Episódios | Especial de fim de temporada |
|---|---|---|---|---|---|
| T1 | **Quintal da Sofia** (0) | consciência fonológica oral | "Quem sou eu e quem vive comigo?" — Bolota chega ao quintal | 6 | "A festa dos sons" |
| T2 | **Ilha das Vogais** (1) | A E I O U | praia: o mapa da expedição aparece numa garrafa | 8 | "A maré das vogais" |
| T3a | **Mata Atlântica — Vale do M-L-F** (2) | M, L, F + CV | "Quem mora na mata?" — mico-leão-dourado | 10 | **fim da parte gratuita**: "ponte em obras" |
| T3b | **Mata Atlântica — Trilha do V-S-N** (2) | V, S, N | a cachoeira e a onça-pintada | 12 | "O ninho perdido" |
| T4 | **Pampa** (3) | P, T → B, D | dia e noite, estações | 18 | "A tropeada do vento" |
| T5 | **Pantanal** (4) | J, Z, X/CH, NH, LH + frases | "Por que a água sobe e desce?" | 18 | "A cheia" |
| T6 | **Cerrado** (5) | C/QU, G/GU, R/RR, S/SS, Ç | "Como as plantas vivem com seca e fogo?" | 22 | "O fogo bom e o fogo ruim" |
| T7 | **Caatinga / Sertão** (6) — **chefe do Ano 1** | nasalidade | "Como se vive bem com pouca água?" (cordel) | 18 | **"O grande cordel"** (desafio do Ano 1) |
| T8 | **Amazônia** (7) — abre o Ano 2 | CVC + ditongos | povos da floresta e o rio | 22 | "A canoa" |
| T9 | **Litoral e Mar** (8) | CCV (pr, br, tr… pl, bl…) | "O que o mar traz e leva?" (África–Brasil) | 22 | "O navio-biblioteca" |
| T10 | **Cidade das Letras** (9) | S/Z/X, CH/X, J/G, H; -ou, -ão, -inho | "Quem faz a cidade funcionar?" (a ponte da vila) | 22 | "A ponte" |
| T11 | **Arquipélago dos Livros** (10) — **chefe final** | fluência, textos | "O que o céu e o tempo contam?" | 20 + pós-jogo | **"O livro da minha jornada"** (ritual com a família) |
| | **Total** | | | **≈ 200 episódios principais** | + Curtas infinitas + **eventos sazonais** (feira da colheita, Dia das Crianças, Copa das Letras; D012) que voltam todo ano |

**O que torna a série "quase infinita" sem perder eficácia** (D001):
1. **Curtas procedurais**: 3–10 min, geradas do banco de palavras validadas, com semente determinística, linter de decodificabilidade e fim definido (60% alvo, 30% revisão, 10% transferência).
2. **Reprises ativas**: rever um episódio antigo traz uma pergunta nova e conta como revisão espaçada.
3. **Estúdio de Histórias**: a criança cria seus episódios-gibi com os personagens e as palavras que já domina, e eles vão para a estante.
4. **Vila do Bolota** e **Lojinha**, onde a criança gasta o que conquistou lendo.
5. **Temporadas futuras visíveis e sem cadeado** ("em obras", com placa); voltar às antigas é sempre permitido.

**As 6 competências entram por dentro dos episódios** (D003): pensamento computacional (programar o caminho do tatu com cartas de comando que precisam ser lidas), lógica (enigmas cuja chave é uma palavra), emoções (personagens nomeiam o que sentem; "respirar com a Sofia" antes do desafio), tecnologia (episódio "Como o app me ouve?") e educação financeira (cofrinho, escolhas e a horta comunitária da vila). Há no máximo **1 missão transversal por sessão**.

---

## 4. Diferenciais

1. **Narrativa episódica com ganchos**: a vontade de voltar vem da história ("o que acontece com o lobo?"), não de streak, vida ou ranking. Isso é compatível com o rel. 42 e com o ECA Digital.
2. **Ler é o controle remoto**: toda leitura muda algo na cena (abre uma porteira, acorda o Bolota, faz a canoa andar). Isso é **integração intrínseca** (rel. 30).
3. **Mais forte em linguagem oral e criação** do que as outras propostas: Hora da História com CROWD, reconto ("Conta de novo!"), "E depois?" e Estúdio de Histórias desde a T1.
4. **Modo sala**: o mesmo episódio projetado para a turma ler em coro. É uma porta barata para a escola sem exigir 1 aparelho por aluno.
5. **A pilha mais barata e rápida**: um código só (web) para navegador, Android e iOS; nenhum servidor de fala; backend gerenciado. O custo variável de voz é **≈ R$ 0**, o que é requisito do unit economics (Doc. Mestre §4.16).
6. **Funciona em Android de entrada e offline**: os pacotes de episódio (≤ 8 MB) são baixados no Wi-Fi; o app abre em ≤ 3 s; o progresso fica na fila local até sincronizar.
7. **Conteúdo como código**: roteiros versionados, linter de decodificabilidade no CI e vozes geradas automaticamente. Um episódio novo é publicado **sem nova versão na loja**.

---

## 5. MVP (≈ 6 meses)

**Escopo do MVP** = toda a **parte gratuita** + a primeira temporada paga, para medir conversão:

| Bloco | Inclui |
|---|---|
| Conteúdo | T1 Quintal (6 ep.), T2 Ilha das Vogais (8 ep.), T3a Mata Atlântica M-L-F (10 ep.), T3b V-S-N (12 ep.) = **36 episódios** + Curtas procedurais + ~16 clipes do Espelho do Som (vogais + M L F V S N) |
| Criança | Temporadas com termômetro sem números, Player de Episódios, Espelho do Som (vídeo + espelho local opcional, sem gravação nem avaliação), leitura por voz em modo **"só incentiva"** + **toque como caminho completo**, Lojinha com cofrinho, avatar básico (com tons de pele, cabelos, óculos e aparelho auditivo gratuitos), Livro da minha jornada |
| Adultos | Conta do responsável (Supabase Auth), até 3 perfis de criança, porteira parental, **relatório antes/depois**, "Nível X de 10", missão da semana com áudio, assinatura mensal (Play Billing / App Store / web) |
| Escola (mínimo) | Turma por QR + senha de figuras, **painel simples do professor** e **modo sala** |
| Plataformas | Web/PWA e Android (Google Play, Programa Famílias) no M6; iOS (Kids) no M7–M8 |
| Fora do MVP | Vila completa, verificação de leitura por voz "valendo" (vira beta em escolas-piloto), câmera com dica articulatória, painel da secretaria, modo fonoaudiólogo |

**Critérios de saída do MVP**: ≥ 80% de sucesso sem ajuda nos testes com crianças (rel. 24); abertura a frio ≤ 3 s e ≥ 30 fps num aparelho de 2 GB; FRR ≤ 5% no modo de voz (ou voz desligada); 0 SDK de terceiros na área infantil; parecer jurídico LGPD/ECA Digital aprovado.

---

## 6. Cronograma

| Mês | Produto/tecnologia | Conteúdo | Validação |
|---|---|---|---|
| **M0** (4 sem.) | 3 PoCs: (a) Pixi + Rive num Android de 2 GB via Capacitor; (b) verificação de fala WASM no aparelho (latência, RAM, FRR); (c) formato do pacote offline | Bíblia da série, roteiro-piloto, model sheets | 5–8 crianças testam o protótipo em papel e o piloto animado |
| **M1–M2** | Player de Episódios, DSL de roteiro, linter, pipeline de voz, auth, perfis, sync | T1 completa; vozes; 7 clipes de vogais | A/B do Espelho do Som (vídeo + corte + letra × só letra + som) |
| **M3–M4** | Lojinha, cofrinho, termômetro, Curtas, área da família, porteira, pagamentos | T2 + T3a | **Alfa** com 30 famílias |
| **M5** | Painel do professor, modo sala, QR de turma, observabilidade | T3b | **Beta fechado**: 200–500 famílias + 3–5 turmas (Fase 0 do rel. 27) |
| **M6** | Endurecimento, LGPD, loja Android/web | T4 (Pampa) em produção | **Lançamento** web + Google Play |
| **M7–M8** | iOS (Kids), vila v1 | T4 publicada | Revisão Apple; métricas de conversão |
| **M9–M24** | voz "valendo" após PoC com 30–50 crianças, vila, secretaria | **1 temporada a cada 6–8 semanas** (T5→T11), sempre **2 temporadas à frente** da criança mais rápida | Estudo de impacto com avaliador externo (rel. 27) |

---

## 7. Equipe

| Papel | Dedicação | Observação |
|---|---|---|
| Líder técnico full-stack (TS, Next.js, Supabase) | integral | dono da arquitetura e da LGPD técnica |
| Dev de jogos/front (PixiJS, Capacitor, desempenho Android) | integral | |
| Animador(a) Rive + ilustrador(a) 2D | integral + 1 PJ por demanda | bíblia visual, rigs da Sofia e do Bolota |
| Roteirista-pedagoga (alfabetização) | integral | escreve os episódios no DSL, cuida da decodificabilidade |
| Designer de produto/UX infantil | meio período | testes com crianças, áreas de adultos |
| Fonoaudióloga consultora (CRFa) | por demanda (~20 h/mês) | Espelho do Som, matriz de tolerância |
| Engenheiro(a) de ML de fala | 3–4 meses | PoC e modelo de verificação no aparelho |
| Produção de som e voz | por demanda | dubladora (fonemas, falas-chave), canções com cessão total |
| Jurídico (LGPD/ECA Digital, lojas, INPI) | por demanda | |

A partir do M9, a escala de conteúdo pede +1 roteirista e +1 animador.

---

## 8. Custos

> **Premissas:** câmbio de R$ 5,50/US$; preços públicos de nov./2026 a confirmar; salários CLT/PJ de mercado brasileiro. **Todos os valores são estimativas para comparação entre propostas, não orçamentos.**

### 8.1 Custo de construção

| Item | Faixa |
|---|---|
| Equipe núcleo, 6 meses (≈ R$ 85–115 mil/mês) | R$ 510–690 mil |
| Produção: voz humana, canções com cessão, ~16 clipes do Espelho do Som, TTS | R$ 50–110 mil |
| Jurídico, INPI, testes com crianças, aparelhos de teste | R$ 25–50 mil |
| **MVP (M0–M6)** | **≈ R$ 0,55–0,85 mi** |
| Temporadas 4–11 (~165 episódios a R$ 6–9 mil cada, reaproveitando rigs e cenários) + equipe de manutenção (M7–M24) | R$ 2,0–2,9 mi |
| **Jornada completa de 2 anos (24 meses)** | **≈ R$ 2,6–3,8 mi** |

### 8.2 Custo mensal de infraestrutura (estimativa)

Premissas: aluno ativo com 20 sessões/mês; ~60 MB/mês de pacotes baixados (servidos pelo R2, **sem tarifa de saída**); ~10 eventos resumidos por sessão; **fala e TTS = R$ 0 por aluno** (verificação no aparelho, áudio pré-gerado).

| Componente | 1 mil alunos | 10 mil alunos | 100 mil alunos |
|---|---|---|---|
| Supabase (Pro + computação + disco) | US$ 25–35 | US$ 110–200 | US$ 600–1.100 |
| Cloudflare R2 + Pages (armazenamento e operações) | US$ 5 | US$ 15–30 | US$ 80–150 |
| GlitchTip (VPS) + uptime + e-mail transacional | US$ 15–25 | US$ 30–50 | US$ 80–150 |
| Backups fora do provedor, domínio, logs | US$ 5–10 | US$ 10–20 | US$ 30–60 |
| Fala na nuvem só para QA amostral (opcional) | US$ 10 | US$ 20 | US$ 50 |
| **Total/mês** | **≈ US$ 60–85 → R$ 330–470** | **≈ US$ 185–320 → R$ 1,0–1,8 mil** | **≈ US$ 840–1.510 → R$ 4,6–8,3 mil** |
| **Por aluno/mês** | **≈ R$ 0,33–0,47** | **≈ R$ 0,10–0,18** | **≈ R$ 0,05–0,08** |

Fora da infraestrutura: as **taxas de loja e de pagamento** (15% no Google Play e na App Store para assinaturas de pequenos desenvolvedores; ~2–5% em Pix/cartão na web) e as **ferramentas** (Rive, GitHub, Apple/Google developer, Azure TTS para gerar vozes: ~US$ 100–300/mês no total).

### 8.3 Preço mensal (sempre mensal — D001)

| Plano | Preço proposto | Observação |
|---|---|---|
| **Grátis por conquista** | R$ 0 até o fim da **T3a** (Quintal + Ilha das Vogais + Vale do M-L-F, ~24 episódios, 4–8 semanas) | relatório antes/depois completo; a próxima temporada aparece como "ponte em obras"; a oferta vai **só para o adulto**, atrás da porteira |
| **Família** | **R$ 24,90/mês**, até 3 crianças | piso da faixa do rel. 27, pelo foco em renda média e baixa; testar R$ 29,90 por van Westendorp |
| Escola privada | R$ 7/aluno/mês (mín. 1 turma) | inclui painel e modo sala |
| Rede pública | R$ 2,50–3,50/aluno/mês | via CPSI/ARP; não é o foco desta proposta |

Margem bruta na família (Android): R$ 24,90 − 15% de loja ≈ R$ 21,17, contra < R$ 0,50 de infraestrutura por criança.

---

## 9. Riscos e mitigação

| Risco | Prob./impacto | Mitigação |
|---|---|---|
| **Verificação de fala no navegador** lenta ou imprecisa em aparelhos de 2 GB (sem corpus infantil pt-BR) | alta / médio | voz **nunca é portão**: o toque é caminho completo; modelo pequeno quantizado baixado só no Wi-Fi e só se o aparelho aguentar; MVP em "só incentiva"; PoC no M0 e coleta de corpus com consentimento separado |
| **Desempenho do WebView** (Pixi + Rive) em Android Go/2 GB | média / alto | orçamento de 250 MB de RAM e 30 fps verificado no CI com aparelho real; fallback Canvas; cenas com poucas camadas; Rive só nos personagens |
| **Revisão da Apple** para app "embrulhado" (diretriz 4.2) e regras Kids | média / médio | recursos nativos reais (offline, arquivos, microfone, IAP), nada de link externo para a criança, lançar primeiro no Android |
| **Esteira de conteúdo**: a criança rápida alcança a produção | média / alto | começar a escala com 2 temporadas de folga; Curtas infinitas; reprises ativas; DSL + vozes automáticas reduzem o custo por episódio |
| **Tempo de tela passivo** (série vira TV) | média / alto | regra: no máximo 45 s de animação sem ação da criança; ritual de fim; teto diário; janela noturna; métricas éticas |
| **iOS Safari apaga dados de PWA** sem uso | alta (web) / médio | no app (Capacitor) os pacotes ficam no Filesystem; na web, sync frequente e o progresso oficial no servidor |
| **Dependência do Rive** (editor proprietário) | baixa / médio | arquivos `.riv` exportados e versionados; runtime aberto (MIT); fallback de sprites para falas simples |
| **Foco B2C** reduz o alcance em escala pública | média / médio | modo sala + painel simples como porta de entrada; a arquitetura aceita o painel da secretaria depois |
| **Marca e direitos** ("Sofia", "Espelho do Som", canções, voz) | média / alto | busca no INPI antes do lançamento; cessão total de música e voz; nada do Método das Boquinhas |

---

## 10. Prós e contras

**Prós**
- Menor custo de construção e de operação; MVP mais rápido (~6 meses).
- Um código só para web, Android e iOS; atualização de conteúdo sem passar pela loja.
- Narrativa forte e personagens fixos favorecem vínculo, linguagem oral e conhecimento de mundo.
- Unit economics folgado para B2C, mesmo com preço baixo.
- Privacidade simples de explicar: voz e câmera ficam no aparelho; não há servidor de fala.

**Contras**
- O WebView limita efeitos e desempenho em comparação com motores nativos (Unity/Godot).
- A verificação de fala no navegador é a parte mais incerta tecnicamente; no começo, a voz quase só incentiva.
- Exige **produção contínua de roteiro e animação** por 2 anos (risco de esteira).
- Menos "mundo aberto" que uma proposta de exploração livre: a exploração é guiada pela história.
- Venda pública e painel de secretaria ficam para depois.

## 11. Quando escolher esta proposta

Escolha a **Expedição Sofia** se:
- o orçamento inicial é **≤ R$ 1 mi** e é preciso lançar e aprender com famílias **em ~6 meses**;
- a prioridade é o **B2C** em celulares simples e o freemium por conquista;
- o dono quer uma marca de **personagens e histórias** (série, livros, canções) que possa crescer para fora do app;
- a equipe é pequena e de perfil web/TypeScript.

Prefira outra proposta se a meta imediata for **contrato com redes públicas** e painel de secretaria, ou se o diferencial desejado for um **mundo 3D aberto** e explorável.
