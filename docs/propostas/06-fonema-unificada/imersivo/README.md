# FONEMA · Experiências imersivas "4D" e "5D"

> **Frente:** Proposta Unificada (Decisão 005) · **Data:** 13/11/2026 · **Status:** proposta para aprovação do dono
> **Pedido do dono:** ir além do 3D, com tecnologia de ponta e real.
> **Resposta desta frente:** "4D" quer dizer **tempo e movimento** e "5D" quer dizer **outros sentidos** (audição espacial, tato, corpo, câmera e realidade aumentada). Toda experiência precisa **ensinar a ler** e respeitar os limites da pesquisa.

Imagens e vídeo desta pasta (mockups próprios em HTML/CSS/SVG e Three.js; fontes em `fontes/`):

| Arquivo | O que mostra |
|---|---|
| `clima-e-dia-noite.png` | A mesma ilha da vila em 4 momentos: manhã (também o visual do modo calmo), chuva leve, pôr do sol com vento e noite em modo dormir. Render Three.js real. |
| `palavra-vira-objeto.png` | Storyboard em 6 quadros: BO → LA → BOLA → as letras se recolhem → a bola cai e quica → celebração de 1 s. |
| `demo-palavra-vira-objeto.mp4` | Vídeo de 13 s, 1280×720, 30 qps (≈ 0,25 MB). Quadros determinísticos do mesmo `fontes/bola.html`, com física simples. Sem áudio: a fala da Sofia aparece como legenda. |
| `ritmo-haptico-silabas.png` | Linha do tempo voz × destaque × vibração (1 sílaba = 1 pulso), suporte por plataforma e pulso visual como alternativa. |
| `espelho-boca-rastreada.png` | Espelho do Som: boca da Sofia ao lado do contorno de 40 pontos dos lábios da criança, com o selo "processado só no aparelho". |
| `ar-sofia-na-mesa.png` | Celular em realidade aumentada (RA): a Sofia em pé numa mesa de verdade propõe uma caça ao som /m/. |
| `ar-letras-no-chao.png` | Tablet em RA: um M do tamanho de um tapete no chão da sala, com a ordem dos traços; a criança percorre a letra a pé. |

---

## 1. Princípios que valem para todas as experiências

Cada regra vem da pesquisa do projeto e serve de filtro: experiência que fere uma delas não entra.

1. **Toda experiência precisa ensinar um destes alvos:** som, letra, sílaba, palavra, significado ou transferência para o mundo real. Efeito que só enfeita é "detalhe sedutor" e reduz a aprendizagem (g ≈ −0,33; rel. 09 §1.5).
2. **Os sentidos precisam ser congruentes:** som, boca, letra, gesto e vibração marcam a **mesma unidade no mesmo instante** (rel. 10 §1.5, Kim, Seitz e Shams 2008). Estímulo fora de sincronia atrapalha.
3. **Uma coisa por vez durante a tarefa:** no máximo 1 evento animado durante a decodificação e nenhuma música sob tarefa fonológica (rel. 09 §3.2). O mundo 4D **congela e esmaece** quando a lição 2D abre.
4. **Pico de estímulo só depois do acerto,** durando no máximo 1–2 s (rel. 42 R18). Celebração longa só no fim do bloco.
5. **Câmera só com processamento local:** nada é gravado, enviado ou usado para identificar alguém, e o app **nunca infere emoção** (rel. 05 §6.6; ECA Digital art. 22; LGPD art. 11). A câmera fica **desligada por padrão**, só o responsável liga, o indicador fica sempre visível e sempre existe alternativa sem câmera.
6. **Modo calmo é um único botão** (rel. 05 §5): sem música, animação mínima, cores suaves, sem confete e ritmo lento. Cada experiência abaixo diz o que o modo calmo muda nela.
7. **Sofia continua 2D** (Decisão 005): o 3D fica para o mundo, os objetos e a RA. Na RA, a Sofia é um recorte ilustrado em pé, com sombra.
8. **Tudo tem fim e um adulto por perto:** RA e câmera só com o responsável presente, em sessões de no máximo 3 min, e nada roda à noite (rel. 42 R7).
9. **Aparelho simples também joga:** cada experiência tem um modo leve (2D, pré-renderizado ou só visual) com o mesmo valor pedagógico (Decisão 005, modo leve).

---

## 2. Regras de intensidade (valores padrão de engenharia)

Estes números são **heurísticas de design coerentes com a pesquisa**, não resultados de um estudo único. Calibrar com telemetria agregada (erro, abandono e pedidos de pausa) e com testes com crianças, inclusive com TEA e TDAH.

### 2.1 Imagem e movimento
| Item | Padrão | Teto | Modo calmo |
|---|---|---|---|
| Animação que ensina (fusão, letra→objeto, boca) | 0,5–4 s | 4 s por evento | mesma duração, sem achatamento ou quique |
| Celebração após acerto | 1 s | 2 s; ≤ 12 partículas; nada em tela cheia | sem partículas; Sofia sorri e diz a frase |
| Celebração de fim de bloco/capítulo | 2–3 s | 4 s | 1 s, sem partículas |
| Transição de cena | ≥ 1 s, com fade | sem cortes secos | ≥ 1,5 s |
| Mudança de luz/clima no mundo | 20–40 s | nunca durante a tarefa | céu fixo de manhã |
| Eventos animados simultâneos durante a tarefa | 1 | 1 | 0 a 1 |
| Clarões / piscar | **nunca mais de 3 por segundo** (WCAG 2.3.1); sem flash em tela cheia, sem tremor de tela, sem raio | — | nenhum |
| Velocidade de câmera 3D | ≤ 45°/s, com aceleração suave | — | trocas de ponto de vista por fade |

### 2.2 Som
| Item | Padrão |
|---|---|
| Referência | a voz da Sofia (0 dB relativo) |
| Efeitos de acerto | −12 dB em relação à voz, ≤ 600 ms, sem som de erro punitivo (rel. 13) |
| Ambiente (chuva, vento, pássaros) | −24 dB; **silencia** quando a tarefa fonológica começa |
| Música | só em menu, abertura e celebração; nunca sob tarefa fonológica (rel. 09 §3.2) |
| Áudio espacial | panorâmica suave (até 70% para um lado); nada surge "atrás da cabeça" de repente |
| Limite de saída | normalizar para −16 LUFS e limitar picos em −1 dBTP; recomendar aos pais fone com limitador |
| Volumes separados | voz e efeitos com controles próprios no perfil sensorial (rel. 05 §5) |

### 2.3 Vibração (háptico)
| Item | Padrão |
|---|---|
| Pulso de sílaba | 30–50 ms, intensidade ≤ 40% (iOS Core Haptics 0,35; Android amplitude ≈ 90/255) |
| Intervalo mínimo | 250 ms entre pulsos; no máximo 6 pulsos por palavra |
| Exceção "garganta vibra" | 1 vibração suave de ≤ 400 ms a ≤ 25%, só junto do som sonoro (exp. 17) |
| Proibido | vibração contínua, vibração para erro, vibração como notificação ou para chamar a criança |
| Média | ≤ 40 pulsos por minuto de atividade |
| Modo calmo | vibração desligada; fica o pulso visual (anel que cresce 1 vez em 300 ms) |

### 2.4 Câmera, RA e corpo
| Item | Padrão |
|---|---|
| Uso por vez | ≤ 3 min; depois a câmera desliga sozinha e a Sofia propõe outra atividade |
| Indicador | selo verde "câmera · só neste aparelho" sempre visível, com botão "desligar" |
| Consentimento | o responsável liga, uma vez por finalidade (espelho, RA, corpo), em tela própria com linguagem simples |
| RA | adulto segurando ou por perto; área livre conferida; aviso sobre escadas, móveis e janelas |
| Corpo | movimentos pequenos (passo ou pulo leve); nunca pede velocidade; sempre há opção sentada (toque) |

---

## 3. Catálogo: 23 experiências

Legenda de custo (estimativa própria de ordem de grandeza, a validar com orçamento): **P** ≈ até 3 semanas-dev · **M** ≈ 4–8 · **G** ≈ 9–16 · **GG** > 16, incluindo arte, teste com crianças e QA.
Fases: **MVP** · **V1** (6–12 meses após o MVP) · **V2** (após piloto, RIPD/DPIA e validação).

### Visão geral

| # | Experiência | Tipo | Fase | Custo |
|---|---|---|---|---|
| 1 | Dia e noite do mundo | 4D | MVP (leve) / V1 (dinâmico) | P→M |
| 2 | Clima por bioma | 4D | V1 | M |
| 3 | A vila cresce quando a criança lê | 4D | MVP | M |
| 4 | Palavra vira objeto (BOLA quica) | 4D | MVP | M |
| 5 | Fusão animada de sons | 4D | MVP | P |
| 6 | Celebração curta com partículas | 4D | MVP | P |
| 7 | Água e vento estilizados | 4D | V1 | M |
| 8 | Sofia em Rive com lip-sync por fonema | 4D | MVP | G |
| 9 | Bolota aprende com a criança | 4D | V1 | M |
| 10 | Árvore das Palavras que cresce | 4D | V1 | M |
| 11 | Livro que ganha vida depois da leitura | 4D | V1 | M |
| 12 | Áudio espacial no mapa | 5D | MVP (estéreo) / V1 (3D) | P→M |
| 13 | De onde vem o som? | 5D | V1 | P |
| 14 | Ritmo háptico das sílabas | 5D | MVP | P |
| 15 | Bater a sílaba (palmas digitais) | 5D | MVP | P |
| 16 | Traçado de letra com o dedo e retorno háptico | 5D | MVP | M |
| 17 | Garganta vibra (pares surdo/sonoro) | 5D | V1 | P |
| 18 | Gestos de articulação com a Sofia | 5D | MVP | P |
| 19 | RA: Sofia na sua mesa | 5D | V1 | G |
| 20 | RA: letras gigantes no chão | 5D | V1 (toque) / V2 (pés) | G |
| 21 | RA: a palavra lida aparece na sala | 5D | V2 | M |
| 22 | Espelho do Som com rastreamento local | 5D | V2 | G |
| 23 | Ler com o corpo (pular na sílaba certa) | 5D | V2 | G |

### 4D · tempo e movimento

**1. Dia e noite do mundo** (imagem `clima-e-dia-noite.png`)
- **Objetivo:** dar começo, meio e fim à sessão (stopping cues, rel. 42 R10–R13) e trabalhar vocabulário de tempo (MANHÃ, TARDE, NOITE, SOL, LUA).
- **Mecânica:** a sessão começa de manhã e termina no pôr do sol, num ritual de 1 min. Depois do horário de dormir, a ilha está de noite e a Sofia está de pijama: **sem lição nova**, só um ritual de 2–3 min (rel. 42 R7, R22).
- **Tecnologia:** Three.js/Babylon (web) ou Unity (app); luz direcional + hemisférica, céu em gradiente, janelas emissivas. MVP: 4 estados pré-renderizados.
- **Custo:** P (pré-renderizado) → M (dinâmico).
- **Aparelhos e alternativa:** todos; no modo leve, 4 imagens com troca por fade.
- **Riscos sensoriais e modo calmo:** a noite escura não pode virar "convite" ao uso noturno; o bloqueio é por horário, não por cor. O modo calmo fixa o céu de manhã.
- **Privacidade:** usa só o relógio do aparelho e o horário de dormir cadastrado pelo responsável.

**2. Clima por bioma**
- **Objetivo:** conhecimento de mundo (rel. 25, 39) e vocabulário (CHUVA, CHEIA, SECA, VENTO), com missões que exigem ler a palavra do clima.
- **Mecânica:** cada ilha tem o seu clima: chuva fina na Mata Atlântica, cheia e seca no Pantanal, vento e cata-ventos no Pampa, seca e rebrota no Cerrado e na Caatinga. O clima muda **entre** atividades e vira assunto da Sofia ("Choveu! Lê a placa: CHUVA").
- **Tecnologia:** chuva em traços 2D sobre o 3D, névoa, inclinação das árvores, bandeira em vertex shader; áudio de ambiente em loop curto.
- **Custo:** M.
- **Aparelhos e alternativa:** todos; no modo leve, ilustrações estáticas por clima.
- **Riscos sensoriais e modo calmo:** nada de trovão, raio, tempestade ou "susto"; a chuva é lenta. O modo calmo desliga clima, partículas e som de ambiente.
- **Privacidade:** nenhum dado novo.

**3. A vila cresce quando a criança lê**
- **Objetivo:** competência visível. As palavras lidas "constroem" a vila (rel. 08, 42 §3.7; Proposta 3).
- **Mecânica:** no fim do bloco (nunca no meio), a casa nova sobe numa animação de 3–4 s: andaime → paredes → telhado → placa com a palavra lida (PADARIA). A criança lê a placa: transferência.
- **Tecnologia:** peças modulares low-poly com "build-up" por escala/posição; placa em textura dinâmica com a fonte Andika.
- **Custo:** M.
- **Aparelhos e alternativa:** todos; no modo leve, sequência de 3 imagens.
- **Riscos sensoriais e modo calmo:** sem poeira nem tremor de tela. O modo calmo mostra a casa pronta com um fade de 0,5 s.
- **Privacidade:** progresso pedagógico já previsto na arquitetura.

**4. Palavra vira objeto** (imagem `palavra-vira-objeto.png`, vídeo `demo-palavra-vira-objeto.mp4`)
- **Objetivo:** ligar decodificação e **significado** (mapeamento ortográfico: som + letra + significado, Decisão 003 §2.2) e recompensar a leitura com o sentido da própria palavra.
- **Mecânica:** a criança lê BO-LA; cada sílaba acende no momento da leitura (com pulso háptico, exp. 14); a palavra se junta, as letras se recolhem e nasce uma bola 3D que cai e quica por cerca de 3 s; a palavra BOLA volta no alto e fica visível junto do objeto. Banco: substantivos concretos com ação típica (BOLA quica, SAPO pula, PATO nada, BOLHA estoura, FOCA bate palma).
- **Tecnologia:** Three.js com integrador de física próprio (gravidade, restituição 0,62, achatamento ≤ 24%); no app, o mesmo em Unity/Filament. Cada objeto tem 1 animação de ≤ 4 s.
- **Custo:** M (motor + 10 palavras); cada palavra nova custa P.
- **Aparelhos e alternativa:** todos; no modo leve, sprite 2D pré-renderizado com o mesmo ritmo.
- **Riscos sensoriais e modo calmo:** a animação só começa **depois** da leitura (nunca durante). O modo calmo usa fade de 0,5 s e a bola rola devagar, sem quique, brilho ou vibração.
- **Privacidade:** se a leitura for por voz, vale a regra do reconhecimento de fala no aparelho (rel. 05 §6.6).

**5. Fusão animada de sons**
- **Objetivo:** síntese fonêmica: M + A = MA (a animação "que ensina" do rel. 09 §3.2).
- **Mecânica:** as letras deslizam uma em direção à outra enquanto a Sofia estica os sons ("mmmm-aaaa → ma"); a velocidade do deslize acompanha a fala.
- **Tecnologia:** 2D (CSS/Canvas/Rive), sincronizada com as marcas de tempo do áudio.
- **Custo:** P.
- **Aparelhos e alternativa:** todos.
- **Riscos sensoriais e modo calmo:** é o próprio conteúdo, então fica sempre ligada; no modo calmo, sem brilho e com movimento 30% mais lento.
- **Privacidade:** nenhum dado.

**6. Celebração curta com partículas**
- **Objetivo:** feedback imediato de acerto, sem roubar a atenção da próxima tarefa (rel. 09 §3.2, 42 R18).
- **Mecânica:** de 6 a 12 brilhos ao redor do item certo, durando 1 s, mais a frase falada e específica da Sofia ("Você juntou /b/ e /o/!"). Nada de confete em tela cheia, roleta ou "combo".
- **Tecnologia:** sistema de partículas 2D simples, com seed fixo para ser previsível.
- **Custo:** P.
- **Aparelhos e alternativa:** todos.
- **Riscos sensoriais e modo calmo:** sem flash, sem tremor de tela; o volume do efeito fica 12 dB abaixo da voz. No modo calmo não há partículas, só a frase.
- **Privacidade:** nenhum dado.

**7. Água e vento estilizados**
- **Objetivo:** dar vida ao mundo **fora** das tarefas e apoiar a orientação no mapa (rios, portos, rotas de barco).
- **Mecânica:** ondas lentas low-poly, espuma na praia, bandeiras e copas balançando. Quando a criança entra numa lição, tudo para.
- **Tecnologia:** vertex shader com 2 senos; vento em uniform global. Para economizar bateria, pausa sempre que não há interação.
- **Custo:** M.
- **Aparelhos e alternativa:** médios e bons; no modo leve, água parada com textura.
- **Riscos sensoriais e modo calmo:** ondas lentas (período ≥ 3 s), sem reflexos que piscam. O modo calmo deixa a água parada.
- **Privacidade:** nenhum dado.

**8. Sofia em Rive com lip-sync por fonema**
- **Objetivo:** modelo articulatório **correto** e caloroso. Os visemas precisam corresponder ao fonema dito, senão a Sofia vira estímulo incongruente (rel. 10 §3.1.6).
- **Mecânica:** a Sofia tem estados (ouvindo, falando, apontando, comemorando, pensando) e bocas acionadas pelos visemas do TTS (Azure pt-BR fornece Viseme ID) ou por alinhamento fonético do áudio gravado. Enquanto a criança pensa, ela fica parada e discreta (rel. 09 §3.1.8).
- **Tecnologia:** Rive (state machine + data binding), runtimes web, iOS, Android e Flutter (rel. 28).
- **Custo:** G (arte + pipeline de visemas + revisão fonoaudiológica).
- **Aparelhos e alternativa:** todos; o arquivo é pequeno. No modo leve, a Sofia aparece como ilustração estática + vídeo da boca real.
- **Riscos sensoriais e modo calmo:** sem caretas exageradas nem movimentos rápidos de câmera. No modo calmo, gestos menores e fala mais lenta. A Sofia nunca implora para a criança ficar (rel. 42 R14).
- **Privacidade:** nenhum dado da criança.
- **Observação:** a boca real em vídeo continua sendo a referência na introdução de cada fonema; a Sofia reforça, não substitui (rel. 28).

**9. Bolota aprende com a criança**
- **Objetivo:** efeito protégé, porque explicar ao Bolota obriga a criança a ensinar (Decisão 003 §2.6, rel. 23).
- **Mecânica:** o Bolota (tatu-bola) tenta ler e erra de propósito ("BO-PA?"); a criança corrige tocando a sílaba certa ou falando. O Bolota se desenrola feliz, numa animação de 1,5 s.
- **Tecnologia:** Rive, com os mesmos estados da Sofia.
- **Custo:** M.
- **Aparelhos e alternativa:** todos.
- **Riscos sensoriais e modo calmo:** o erro do Bolota é engraçado e gentil, nunca triste. No modo calmo, a animação dura metade e não tem som.
- **Privacidade:** nenhum dado novo.

**10. Árvore das Palavras que cresce**
- **Objetivo:** mostrar conexões entre palavras (família, rima, categoria), como pede a Decisão 003 §2.4.
- **Mecânica:** cada palavra dominada vira uma folha; galhos ligam palavras parentes (BOLA–BOLO–BOLHA). Uma vez por semana, a árvore cresce numa animação de 3 s, que a criança pode rever devagar, galho por galho, ouvindo as palavras.
- **Tecnologia:** grafo com crescimento procedural em 2,5D (SVG/Canvas ou Three.js leve).
- **Custo:** M.
- **Aparelhos e alternativa:** todos; no modo leve, árvore estática.
- **Riscos sensoriais e modo calmo:** sem brilho contínuo. No modo calmo, só a árvore final, sem animação.
- **Privacidade:** dados de progresso já previstos.

**11. Livro que ganha vida depois da leitura**
- **Objetivo:** compreensão. A cena só se anima depois que a criança lê a frase, então a animação confirma o sentido lido (animação congruente com o texto, rel. 09 §1.7).
- **Mecânica:** a criança lê "O SAPO PULA NA LAGOA"; só então o sapo pula, em 2 s. Não existem hotspots nem "toque no passarinho" (rel. 09 §3.1.7).
- **Tecnologia:** Rive ou sprites 2D sobre cenário ilustrado.
- **Custo:** M (pipeline); cada livro, P.
- **Aparelhos e alternativa:** todos.
- **Riscos sensoriais e modo calmo:** uma animação por página. No modo calmo, a ilustração muda por fade.
- **Privacidade:** nenhum dado novo.

### 5D · sentidos, corpo e realidade aumentada

**12. Áudio espacial no mapa**
- **Objetivo:** orientação e acessibilidade (baixa visão), além de atenção auditiva. O som do pássaro vem da direita porque a missão está à direita.
- **Mecânica:** cada missão disponível "chama" com um som curto e característico vindo da sua direção no mapa; ao girar a câmera, o som acompanha.
- **Tecnologia:** Web Audio API (PannerNode HRTF) no web; Resonance Audio ou Steam Audio no app. MVP: só panorâmica estéreo.
- **Custo:** P (estéreo) → M (HRTF + fone).
- **Aparelhos e alternativa:** todos; o efeito 3D completo só com fone de ouvido. Sem fone, panorâmica simples + seta visual.
- **Riscos sensoriais e modo calmo:** ambiente a −24 dB, sem sons súbitos nem "atrás da cabeça". No modo calmo, ambiente desligado e só um "toc" ao tocar.
- **Privacidade:** nenhum dado.

**13. De onde vem o som?**
- **Objetivo:** discriminação auditiva de fonemas. A criança identifica qual de dois "bichos" disse /f/ e qual disse /v/.
- **Mecânica:** dois personagens à esquerda e à direita dizem sílabas de um par mínimo; a criança toca no que disse o som-alvo. Depois, a mesma tarefa sem a pista espacial (a pista some, como andaime).
- **Tecnologia:** Web Audio com panorâmica.
- **Custo:** P.
- **Aparelhos e alternativa:** todos; para crianças com perda auditiva unilateral, o responsável desliga a espacialização no perfil.
- **Riscos sensoriais e modo calmo:** volume baixo e sem tempo limite. No modo calmo, sem animação dos personagens.
- **Privacidade:** nenhum dado.

**14. Ritmo háptico das sílabas** (imagem `ritmo-haptico-silabas.png`)
- **Objetivo:** consciência silábica com um sinal tátil congruente: 1 sílaba = 1 pulso, no mesmo instante da voz e do destaque.
- **Mecânica:** a Sofia lê BOR-BO-LE-TA e o aparelho bate 4 vezes; a criança "sente" quantas partes a palavra tem. A palavra inteira não vibra.
- **Tecnologia:** iOS Core Haptics (transient, intensidade 0,35); Android VibrationEffect (40 ms, amplitude ≈ 90/255); web Android `navigator.vibrate(40)`; iPhone na web não tem API.
- **Custo:** P.
- **Aparelhos e alternativa:** celulares no app; tablets e PCs costumam não vibrar → pulso visual (anel de 300 ms) e "toc" suave opcional.
- **Riscos sensoriais e modo calmo:** limites da seção 2.3. O modo calmo desliga a vibração e mantém o anel visual. Há também uma chave própria "vibração" no perfil.
- **Privacidade:** nenhum dado.

**15. Bater a sílaba (palmas digitais)**
- **Objetivo:** segmentação silábica ativa: a criança produz o ritmo, não só recebe.
- **Mecânica:** a criança ouve a palavra e toca a tela 1 vez por sílaba; cada toque certo devolve 1 pulso e acende a sílaba. Toque a mais não vibra e não tem som de erro: a Sofia repete a palavra devagar.
- **Tecnologia:** a mesma da exp. 14, com detecção de toques sem limite de tempo.
- **Custo:** P.
- **Aparelhos e alternativa:** todos; no web sem vibração, só visual. Opção "bater palmas de verdade" com o adulto, sem microfone.
- **Riscos sensoriais e modo calmo:** sem cronômetro. No modo calmo, sem vibração.
- **Privacidade:** nenhum dado.

**16. Traçado de letra com o dedo e retorno háptico**
- **Objetivo:** forma e direção da letra, unidas ao som. A escrita à mão melhora o reconhecimento de letras mais que digitar (rel. 10 §3.4).
- **Mecânica:** a sequência é: ver o traçado animado → traçar com guia → traçar sem guia → reconhecer entre distratores. Um "tic" háptico leve marca cada ponto de controle e o início de cada traço; a Sofia diz o **som** (não o nome da letra) enquanto a criança traça. A correção é tolerante: só atua quando direção ou forma atrapalham a leitura.
- **Tecnologia:** Canvas/Pointer Events com comparação de traço por pontos de controle (tipo $P), mais o háptico da exp. 14.
- **Custo:** M.
- **Aparelhos e alternativa:** todos; no PC funciona com mouse ou caneta e sem vibração.
- **Riscos sensoriais e modo calmo:** nada de vibrar "fora da linha" (seria vibração de erro). No modo calmo, sem tic e sem brilho no traço.
- **Privacidade:** o traçado não é guardado como imagem, só o resultado pedagógico.

**17. Garganta vibra (pares surdo/sonoro)**
- **Objetivo:** tornar perceptível a diferença entre /p/ e /b/, /t/ e /d/, /f/ e /v/, /s/ e /z/, que é invisível na boca e exige a pista da mão na garganta (rel. 10 §3.1.4).
- **Mecânica:** a Sofia põe a mão na garganta: no /b/, o aparelho vibra suavemente durante o som (≤ 400 ms, ≤ 25%); no /p/, não vibra. A criança repete com a mão na própria garganta e diz qual "vibrou".
- **Tecnologia:** iOS Core Haptics (continuous) e Android waveform; o tempo vem das marcas do áudio.
- **Custo:** P.
- **Aparelhos e alternativa:** app no celular; nos demais, ícone de "garganta vibrando" animado + o gesto físico.
- **Riscos sensoriais e modo calmo:** é a única vibração longa permitida, sempre fraca. No modo calmo, só o ícone.
- **Privacidade:** nenhum dado.

**18. Gestos de articulação com a Sofia**
- **Objetivo:** gancho de memória **com informação fonética real** (rel. 10 §3.3): mão na garganta (sonoridade), dedo no nariz (nasais), palma diante da boca (o ar do /p/).
- **Mecânica:** a Sofia faz o gesto e a criança imita com o próprio corpo. O app não verifica nada, porque o gesto é para a criança sentir.
- **Tecnologia:** só animação Rive; gestos próprios para o português brasileiro (não importar os do Jolly Phonics).
- **Custo:** P.
- **Aparelhos e alternativa:** todos.
- **Riscos sensoriais e modo calmo:** sem risco. No modo calmo, o gesto aparece mais lento.
- **Privacidade:** nenhuma câmera envolvida.

**19. RA: Sofia na sua mesa** (imagem `ar-sofia-na-mesa.png`)
- **Objetivo:** **transferência** do som para o mundo real ("o que tem na sua mesa que começa com /mmm/?": MESA, MAÇÃ, MÃO) e atenção conjunta com o adulto (rel. 09 §1.8).
- **Mecânica:** o adulto aponta a câmera traseira para a mesa; a superfície é detectada em cerca de 1 s; a Sofia "pousa" (recorte 2D com sombra), fala 1 frase e espera. A criança diz a palavra, o adulto toca **✓ Achei** e, depois de 3 rodadas, a atividade termina.
- **Tecnologia:** ARKit e ARCore no app (hit-test de plano); WebXR `immersive-ar` no Chrome Android; AR Quick Look (USDZ, Sofia parada) no iPhone pela web.
- **Custo:** G.
- **Aparelhos e alternativa:** celulares compatíveis com ARCore/ARKit. Sem RA, a Sofia aparece sobre uma mesa ilustrada e a caça ao som continua igual, "de olho na casa".
- **Riscos sensoriais e modo calmo:** RA pode cansar e desorientar; por isso a sessão tem ≤ 3 min e a câmera fica parada. No modo calmo, a Sofia fica parada, sem grade animada e sem brilho.
- **Privacidade:** câmera traseira; nada gravado, enviado ou analisado; **sem botão de foto e sem reconhecimento de objetos** (o adulto confirma). O consentimento é dado pelo responsável.

**20. RA: letras gigantes no chão** (imagem `ar-letras-no-chao.png`)
- **Objetivo:** forma e direção da letra com o corpo inteiro, junto com o som. Depois vem o traçado com o dedo (exp. 16) e, por fim, a escrita sem guia.
- **Mecânica:** um M de cerca de 2 × 1,6 m se fixa no piso, com pontos numerados no início de cada traço. A criança caminha sobre o traço dizendo /mmm/; o traço feito fica verde. V1: o adulto toca "próximo traço". V2 (opcional): o aparelho percebe os pés no fim do traço por estimativa de pose local.
- **Tecnologia:** ARCore e ARKit (plano horizontal); WebXR no Android. A letra é um "adesivo" 3D no chão. V2: MediaPipe Pose no aparelho.
- **Custo:** G (V1) + M (V2).
- **Aparelhos e alternativa:** celular ou tablet com RA. Sem RA, a Sofia ensina a montar a letra com **fita crepe** no chão e só narra os traços.
- **Riscos sensoriais e modo calmo:** risco físico (tropeçar), então a área livre de 2 × 2 m é conferida pelo adulto e há aviso sobre móveis e escadas. Nunca há corrida nem tempo. No modo calmo, letra estática, sem pegadas animadas.
- **Privacidade:** a câmera traseira aponta para o chão e a criança pode aparecer na imagem: nada é gravado, e na V1 não há rastreamento do corpo. Na V2, a pose é calculada e descartada no aparelho, com consentimento próprio.

**21. RA: a palavra lida aparece na sala**
- **Objetivo:** mesmo objetivo da exp. 4 (significado), agora no espaço real da criança.
- **Mecânica:** depois de ler BOLA, a bola 3D pode ser "solta" no chão da sala e quica 3 vezes. Funciona só com palavras do banco revisado.
- **Tecnologia:** a mesma da exp. 19, mais a física da exp. 4.
- **Custo:** M (reaproveita 4 e 19).
- **Aparelhos e alternativa:** os mesmos da exp. 19; sem RA, o objeto aparece na tela (exp. 4).
- **Riscos sensoriais e modo calmo:** o risco é virar "prêmio" que concorre com a leitura. Por isso só aparece no fim do bloco e no máximo 1 vez por sessão. O modo calmo desliga a experiência.
- **Privacidade:** a mesma da exp. 19.

**22. Espelho do Som com rastreamento local** (imagem `espelho-boca-rastreada.png`)
- **Objetivo:** comparar a própria boca com a da Sofia, como no treino articulatório com letras (Sargiani, Ehri e Maluf 2018, rel. 10 §1.3).
- **Mecânica:** a boca da Sofia aparece de um lado e, do outro, **só um contorno de 40 pontos dos lábios** da criança (nunca a foto do rosto), com a forma da Sofia tracejada como guia. A Sofia pergunta "a sua ficou parecida?" e **a criança julga**. O app não dá nota.
- **Tecnologia:** MediaPipe Face Landmarker (WASM/GPU no web, Tasks no app), cerca de 30 qps, usando só os índices dos lábios. Cada quadro é apagado depois de calculado.
- **Custo:** G (inclui RIPD/DPIA, testes de viés com tons de pele, aparelhos e iluminação, além de piloto).
- **Aparelhos e alternativa:** celulares e tablets médios com câmera frontal. Sem câmera, a alternativa é um espelho de verdade + a boca da Sofia; segundo o rel. 05 §6.6, isso "entrega boa parte do valor sem coletar nada".
- **Riscos sensoriais e modo calmo:** ver o próprio rosto pode incomodar algumas crianças (TEA); o contorno abstrato reduz isso. O modo calmo desliga a câmera e oferece o espelho de verdade.
- **Privacidade:** **desligado por padrão**; consentimento específico do responsável (LGPD art. 11, dado potencialmente biométrico); processamento só local; nada gravado ou enviado; sem identificação; **sem inferência de emoção**; os pontos não são guardados; selo verde e botão "desligar" sempre visíveis.
- **Por que só V2:** o rel. 05 deixa a câmera fora do MVP, e o rel. 10 §3.2 não encontrou evidência de que pontuar a boca por visão computacional ajude. Por isso esta versão **não pontua** e entra só depois de piloto e avaliação de risco.

**23. Ler com o corpo (pular na sílaba certa)**
- **Objetivo:** pausa ativa que **exige ler**: as sílabas aparecem no chão virtual e a criança pula na que completa a palavra (BO + ? = BOLA).
- **Mecânica:** de 2 a 3 sílabas grandes na tela; a criança dá um passo ou pulo leve para a esquerda, o centro ou a direita. A câmera frontal estima só a posição dos quadris (esquerda, centro ou direita). Sempre existe a opção sentada, por toque.
- **Tecnologia:** MediaPipe Pose Landmarker local, com poucos pontos; nenhuma imagem exibida (só um "avatar" de pontos ou o ícone da criança).
- **Custo:** G.
- **Aparelhos e alternativa:** tablet ou notebook apoiado a cerca de 2 m; sem câmera, toque ou teclado.
- **Riscos sensoriais e modo calmo:** risco físico e de excitação. Por isso a atividade dura ≤ 2 min, nunca pede velocidade e tem aviso de espaço livre. O modo calmo a substitui pela versão sentada.
- **Privacidade:** as mesmas regras da exp. 22: local, sem gravação, sem identificação, sem emoção e com consentimento próprio.

---

## 4. Fases de entrega

| Fase | Entra | Por quê |
|---|---|---|
| **MVP** | 1 (dia e noite pré-renderizado), 3, 4 (10 palavras), 5, 6, 8, 12 (estéreo), 14, 15, 16, 18 | Ensinam diretamente, são baratas e funcionam em todo aparelho. Nenhuma usa câmera (rel. 05: câmera fora do MVP). |
| **V1** | 1 dinâmico, 2, 7, 9, 10, 11, 12 (HRTF), 13, 17, 19, 20 (avanço por toque) | Enriquecem o mundo e trazem RA **sem analisar a criança** (câmera traseira, nada processado sobre a pessoa). |
| **V2** | 20 (pés por pose), 21, 22, 23 | Usam câmera sobre a criança ou viram recompensa: só depois de RIPD/DPIA, piloto com famílias e escolas, teste de viés e evidência de benefício. |

**Critério para passar de fase:** o piloto mostra ganho ou, no mínimo, nenhuma perda em acerto e tempo-em-tarefa; não aumenta pedidos de pausa nem abandono; e os responsáveis entendem o aviso de privacidade (teste de compreensão).

## 5. O que fica de fora de propósito

- **Óculos de realidade virtual:** os fabricantes indicam uso a partir de 10–13 anos; além disso, isolam a criança do adulto, o oposto da atenção conjunta.
- **Inferir emoção, atenção ou "engajamento" pela câmera ou pela voz:** vetado por cautela legal (ECA Digital art. 22; rel. 05) e sem base pedagógica.
- **Reconhecimento facial, login por rosto ou por voz:** dado biométrico sensível, sem necessidade.
- **Fotos e vídeos da criança dentro do app**, inclusive "foto com a Sofia em RA": geram dado de imagem de criança e incentivam compartilhar.
- **Efeitos de "cinema 4D"** (tremor de tela, flashes, sustos, sons fortes) e **música contínua** sob tarefas.
- **Cheiro e temperatura:** não há hardware doméstico confiável e não haveria ganho pedagógico.

## 6. Como regenerar as imagens e o vídeo

```bash
cd docs/propostas/06-fonema-unificada
python3 -m http.server 8931 &              # serve mundo-3d/vendor (Three.js r187) e imersivo/fontes
cd imersivo/fontes
for p in clima-e-dia-noite ritmo-haptico-silabas espelho-boca-rastreada ar-sofia-na-mesa ar-letras-no-chao; do
  node shot.js http://localhost:8931/imersivo/fontes/$p.html ../$p.png; done
node quadros.js tmpq 1 1.3,3.5,5.8,7.35,8.32,12            # quadros do storyboard
node shot.js http://localhost:8931/imersivo/fontes/palavra-vira-objeto.html ../palavra-vira-objeto.png
node quadros.js /tmp/quadros 1 video                       # 390 quadros (13 s × 30 qps)
ffmpeg -framerate 30 -i /tmp/quadros/f%04d.jpg -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart ../demo-palavra-vira-objeto.mp4
```

Playwright (Chromium, `deviceScaleFactor: 2` → 2560×1600 nas imagens); WebGL via SwiftShader. As cenas são determinísticas (sem `Math.random`): o quadro de um instante *t* é sempre igual. Fontes OFL (Andika, Fredoka, Atkinson Hyperlegible) em `fontes/fonts/`; Sofia e Bolota em `fontes/chars.js` (traço de referência; a arte final será feita em Rive).
