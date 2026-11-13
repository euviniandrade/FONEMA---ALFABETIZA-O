# 31 — Catálogo de funcionalidades, gráficos e design do FONEMA

> Projeto: plataforma web + app (mesma conta) de alfabetização pelo método fônico em pt-BR, para crianças de 4 a 8 anos, com a guia "Sofia" e o aprendiz "Bolota".
> Fase: síntese de pesquisa → backlog. Data: novembro/2026. Frente 31.
> Pergunta do dono do projeto: *"quero saber dos principais GRÁFICOS, FUNCIONALIDADES e DESIGNS para serem implementados"*.

## Como ler este documento (nota de método)

- **A base são os documentos internos 01–25** desta pasta. Cada decisão traz a evidência entre colchetes, no formato **[doc NN §x]**. Exemplo: [doc 20 §3.8] = documento 20, seção 3.8. Os números, limiares e preços citados vêm desses documentos. Quando um número é **hipótese de produto** (e não achado de estudo), isso está escrito.
- **Fontes externas desta rodada:**
  - uma busca web sobre painéis de professor com mapa de calor em alfabetização (§3.1);
  - buscas na API do GitHub (`gh api search/repositories`) para bibliotecas de gráficos, fontes e ferramentas de design system. As estrelas (⭐) e as licenças foram lidas da API em 13/11/2026 e mudam com o tempo.
- **Contraste de cores:** todas as razões da paleta (§6.2) foram **calculadas** com a fórmula de luminância relativa do WCAG 2.x, com um script local. Não são estimativas.
- **Nada aqui é especificação final.** É um catálogo **priorizado e rastreável**, pronto para virar épicos e histórias. As escolhas de arte (paleta, fontes, personagem) **precisam passar por teste com crianças** (protocolo em [doc 24 §3.9]).
- **Convenções:**
  - complexidade **P/M/G** = pequena (≤ 2 semanas de 1 dev), média (2–6 semanas) e grande (> 6 semanas ou várias disciplinas);
  - "dp" = pixel independente de densidade (app); na web, 1 dp ≈ 1 px CSS.

---

## 1. Resumo executivo

1. **O produto tem cinco públicos e cada um precisa de uma "pergunta respondida" diferente.** A criança quer saber se está indo bem e o que vem agora, mas sem números. O responsável quer saber o que o filho aprendeu esta semana e o que fazer em casa. O professor quer saber quem precisa da mesma aula amanhã. O gestor quer saber quantas crianças estão no caminho de "criança alfabetizada". O time editorial quer saber se o conteúdo e o reconhecimento de fala estão funcionando. O mapa de telas (§2) e os gráficos (§3) estão organizados por essas perguntas.
2. **Para a criança, não há gráfico.** O progresso aparece como **mundo que muda**: a trilha que se colore, o jardim que cresce (e nunca morre), o álbum de figurinhas que falam e o caderninho do Bolota [doc 04 #26–29; doc 08 §3.4]. Números, rankings e cronômetros ficam fora da área infantil [doc 13 §3.5; doc 24 §3.6].
3. **O gráfico mais importante do produto é o mapa de calor aluno × habilidade fônica do professor,** com agrupamento automático de 3 a 5 grupos ("quem precisa da mesma aula amanhã") [doc 20 §3.8]. A evidência mostra que o efeito de jogos de alfabetização depende do **adulto** [doc 04 §1, item 4]. O painel do adulto é, portanto, parte da intervenção, e não um extra.
4. **Para o gestor ou secretaria,** o indicador é a **distribuição por 6 níveis FONEMA** e a proporção "no caminho do padrão Saeb 743". O texto deve sempre dizer que é **estimativa**, e não nota Saeb, até haver ancoragem psicométrica por itens de ligação [doc 20 §3.8; doc 02 §3.3].
5. **MVP enxuto e defensável (§4):**
   - login por figuras;
   - diagnóstico lúdico de 12–15 min;
   - trilha com sessão estruturada;
   - agendador de revisão espaçada;
   - Sofia roteirizada com fonemas gravados por humano;
   - vídeos da boquinha;
   - cerca de 14 jogos-núcleo;
   - provinhas sem ansiedade;
   - ~30 livrinhos decodificáveis validados por linter;
   - perfil sensorial e modo calmo;
   - offline-first;
   - relatório semanal para família;
   - painel do professor com mapa de calor.

   O "Eu leio, a Sofia escuta" (reconhecimento de fala avaliando a leitura) entra como **beta controlado** no MVP e vira funcionalidade plena na V1, depois de medir o falso erro com voz infantil brasileira [doc 22; doc 03 §10].
6. **Catálogo de 42 jogos e atividades** em 8 fases, mais 5 mecânicas transversais (§5). Todos têm alternativa sem arrastar e sem fala, e trazem ajustes para TEA, TDAH e dislexia [doc 05 §4; doc 12 §3].
7. **Design system "Quintal"** (§6):
   - letra bastão em **Andika** (OFL, "a" e "g" escolares);
   - paleta quente com fundo creme e todos os pares de texto ≥ 4,5:1 (calculados);
   - alvos de 96–128 dp;
   - três modos: padrão, **calmo** e **alto contraste**, mais o ajuste tipográfico de "modo reforço/dislexia";
   - feedback sem vermelho e sem buzina.
8. **Diferenciais que não encontramos em pt-BR** (§7):
   - fônica sistemática do zero ao texto com acabamento de estúdio;
   - leitura em voz alta escutada por reconhecimento de fala infantil pt-BR;
   - boquinha humana + vista lateral + espelho local;
   - aprendiz Bolota que a criança ensina;
   - linter aberto de decodificabilidade em pt-BR;
   - painel acionável alinhado à BNCC e ao ICA;
   - ética anti-dark-pattern como marca.

---

## 2. Mapa de telas e fluxos

### 2.1 Perfis e permissões

| Perfil | Onde usa | Entra por | Vê | Não vê / não faz |
|---|---|---|---|---|
| **Criança** (4–8) | app (tablet/celular) e web | avatar + senha de 3 figuras, QR da turma ou "entrega" do responsável [doc 24 §3.4] | mundo, lições, jogos, livrinhos, álbum, jardim | números, notas, ranking, loja, links externos, configurações [doc 24 §3.5] |
| **Responsável** | app (atrás da porteira) e web | e-mail/magic link; consentimento LGPD art. 14 [doc 05 §6] | relatório semanal, perfil sensorial, limites de tempo, consentimentos, sinais de atenção | dados de outras crianças |
| **Professor** | web (portal) e app (modo turma) | conta institucional criada pela escola | turma, mapa de calor, grupos, risco, provinhas, escuta por amostragem, biblioteca | dados de crianças de outras turmas |
| **Coordenação / escola** | web | conta institucional | painel por turma, uso, distribuição por nível, relatórios | identificação individual fora das suas turmas (configurável) |
| **Secretaria / rede** | web | conta institucional (contrato) | painel agregado por escola/turma, nível FONEMA, "no caminho do 743" | **dados individuais nominais** (só agregados, com n mínimo) |
| **Admin / editorial / pesquisa** | web interno | SSO interno | currículo, itens, calibração, histórias, ASR, A/B, métricas éticas | dados identificáveis (só pseudonimizados) |

Regra técnica: papéis implementados com **Row Level Security** no Postgres/Supabase [doc 03 §7, §9].

### 2.2 Árvore de navegação

```
CRIANÇA (paisagem, sem texto de navegação)
  Seletor de perfil (avatares) → Senha de figuras
  └─ MUNDO (mapa/trilha) ──────────────────────────────── [casa]
       ├─ Atividade do dia (Sofia sugere; criança escolhe 1 de 2–3) [doc 08 P6]
       │    ├─ Lição (Sofia + boquinha) → Jogo(s) → Mini-livro
       │    └─ Fim de sessão (ritual) → volta ao Mundo
       ├─ Desafio da Sofia (provinha) — aparece no mapa como "ponte"
       ├─ Biblioteca de livrinhos (só os já decodificáveis)
       ├─ Álbum de figurinhas / Caderninho do Bolota
       └─ Jardim da Revisão
  [cadeado adulto] → Porteira (segurar 3 s + tarefa escrita) → ÁREA ADULTA

RESPONSÁVEL
  Início (resumo da semana) · Progresso · Atividades em casa · Perfil sensorial
  · Tempo e rotina · Privacidade e dados · Filhos/perfis · Ajuda

PROFESSOR (web)
  Turmas → Visão da turma (mapa de calor + grupos + alertas)
         → Aluno (relatório individual) · Provinhas/benchmark · Escuta de leituras
         → Biblioteca de histórias (aprovar/pedir) · Atividades sugeridas · Exportar
  Configurações da turma (senha de figuras on/off, tempos de dica, QR)

ESCOLA / SECRETARIA (web)
  Visão geral (níveis, tendência) → Escola → Turma (sem nominal, para a rede)
  Uso e dose · Benchmark trimestral · Relatórios exportáveis (formato ICA)

ADMIN / EDITORIAL
  Currículo & itens · Calibração · Histórias (pipeline + linter) · Áudio/visemas
  · ASR qualidade · Experimentos A/B · Métricas éticas · Auditoria LGPD
```

**Profundidade máxima** de 2 toques entre o mapa e a atividade. **Sem rolagem** na área infantil [doc 24 §3.2–3.3].

### 2.3 Fluxos principais

**F-A. Primeira vez em casa (responsável → criança)**
1. O responsável baixa o app ou abre a web, cria a conta e lê o consentimento em linguagem simples, com opções separadas para microfone e câmera. A câmera fica **desligada** por padrão [doc 05 §6.6].
2. Cadastra a criança: só primeiro nome ou apelido, faixa etária e interesses (opcional). As perguntas opcionais sobre histórico familiar de dificuldade de leitura **pedem consentimento destacado**, porque são dado sensível [doc 11 §3.2; doc 05 §7].
3. Escolhe um preset de perfil sensorial (padrão, calmo, reforço etc.), sempre editável [doc 05 §2.4].
4. Entrega o aparelho. A Sofia se apresenta e a criança escolhe o avatar e a "senha de figuras" (opcional em casa).
5. **Missão de boas-vindas** (diagnóstico em 3 sessões curtas) [doc 20 §3.3]. Cada sessão já termina com o ritual de despedida.
6. Ao fim da 3ª sessão, o responsável recebe a primeira "foto": o que a criança já sabe e por onde ela vai começar.

**F-B. Escola (professor → turma)**
1. A escola cria a turma e importa a lista de alunos (nomes ou apelidos).
2. O sistema gera o **cartaz QR da turma** e os QR individuais para casa [doc 24 §3.4].
3. No tablet compartilhado, a criança toca no seu avatar e depois na senha de figuras.
4. O professor vê o mapa de calor preenchendo-se ao longo da 1ª semana (diagnóstico).
5. O professor recebe a sugestão de grupos com uma atividade de sala para cada grupo, e decide [doc 21 §3.6].

**F-C. Sessão diária da criança** [doc 07 §3.2C; doc 09 §3.3]
```
Sofia acolhe (≤ 6 s) → aquecimento com itens dominados (1–2 min)
→ revisões vencidas (60–70%) intercaladas com 1–2 itens novos
→ pausa ativa (20–90 s) entre blocos
→ bloco de contraste (par confuso)
→ fechamento: palavra/frase "vitoriosa" + recapitulação
→ ritual: Sofia recapitula, o mapa se ilumina, curiosidade plantada para amanhã, ponte para o mundo real
→ volta ao mapa com a atividade "dormindo" (fim natural; sem autoplay)
```

**F-D. Erro e ajuda** [doc 13 §3.3–3.4; doc 24 §3.3]
```
Tentativa errada → "Quase!" + pista localizada (prompt)
→ 2ª errada → modelo (recast) + boquinha + "agora você"
→ 3ª errada na mesma habilidade → muda a estratégia (menos opções, outra modalidade, item fácil)
→ registra "precisa de reforço" no painel do adulto (nunca para a criança)
Inatividade: 5 s → Sofia aponta | 10 s → repete a instrução | 20 s → "vamos juntos?"
ASR incerto → "Não ouvi direitinho, fala de novo?" (nunca "errou")
```

**F-E. Desafio da Sofia (provinha)** [doc 20 §3.6; doc 13 §3.5]
```
Aparece como uma "ponte" no mapa → ritual de entrada ("se não souber, tudo bem, a gente pula")
→ itens fáceis primeiro → feedback neutro-positivo ("Anotado!")
→ sem cronômetro visível (o tempo é registrado nos bastidores)
→ final: progresso da própria criança ("Você já sabe 12 sons!")
→ não passou: abre uma trilha de reforço curta; a ponte reaparece depois
```

**F-F. Relatório semanal → ação em casa** [doc 20 §3.8; doc 14 §3.5]
```
Domingo à noite: notificação PARA O ADULTO (opcional)
→ 1 tela: aprendeu / está praticando / dias de leitura na semana / 1 atividade sem tela (5 min)
→ botão "fizemos!" (registra o vínculo e alimenta a métrica de mediação adulta)
```

### 2.4 Wireframes ASCII das 12 telas principais

> Convenções: telas infantis em **paisagem** (proporção ~16:10). `[ ]` = alvo tocável; `((·))` = fala/áudio; `▓` = arte e cenário; `☺S` = Sofia; `◔B` = Bolota. Os números entre parênteses indicam tamanhos mínimos em dp.

#### W1 — Login por figuras (aparelho compartilhado da turma)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ((·)) [👂 ouvir]                     ☺S "Toca no seu rostinho!"   [🔒]48dp│
│                                                                          │
│   [🐱 ANA ]  [🦊 BIA ]  [🐸 CAU ]  [🦁 DUDA]  [🐢 ENZO]  [🐝 GABI]        │
│    96dp       ((nome falado ao tocar))                                   │
│   [🦜 IAGO]  [🐻 JOÃO]  [🐞 LARA]  [🐬 LEO ]  [🦋 MAYA]  [🐘 NINA]        │
│                                                                          │
│   [🐔 PEDRO] [🐙 RAFA]  [🦒 SARA]  [🐳 TÉO ]   ...até 30 (6–8 por linha) │
│                                                                          │
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ faixa inferior sem alvos (48–64dp) ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
└──────────────────────────────────────────────────────────────────────────┘
            ↓ toca no próprio avatar
┌──────────────────────────────────────────────────────────────────────────┐
│ [⟵🚪]  🐸 CAU                    ☺S "Agora a sua senha de figuras!"      │
│                                                                          │
│        ┌──────┐ ┌──────┐ ┌──────┐        Senha:  ( ● )( ○ )( ○ )         │
│        │ caju │ │ sapo │ │ bola │        (3 figuras; ordem obrigatória   │
│        └──────┘ └──────┘ └──────┘         para 6–8 anos, livre para 4–5) │
│        ┌──────┐ ┌──────┐ ┌──────┐                                        │
│        │ pipa │ │ peixe│ │ lua  │        Errou: "quase! tenta de novo"   │
│        └──────┘ └──────┘ └──────┘        3 erros: "chama a professora"   │
│        ┌──────┐ ┌──────┐ ┌──────┐        (sem bloqueio punitivo)         │
│        │ casa │ │ uva  │ │ sol  │                                        │
│        └──────┘ └──────┘ └──────┘   alvos 96dp, espaço 24dp              │
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência: [doc 24 §3.4]. Variante em casa: QR individual ou "entrega" do responsável. O professor pode desligar a senha para turmas de 4 anos e deve registrar essa decisão.

#### W2 — Mundo / mapa de fases (trilha)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [👂]  [🏠]                                  [🌱 jardim] [📒 álbum] [🔒]   │
│  ▓▓▓▓ ILHA DAS VOGAIS ▓▓▓▓      ▓▓▓ BAIRRO DO M-L-F ▓▓▓     ▓ PRAIA P-T ▓  │
│   (a)━(e)━(i)━(o)━(u)━━━━━━(M)━━(L)━━[ ☺S F ]━ ┄ (V) ┄ (S) ┄ ┄ ┄ (P) ┄    │
│    ✔   ✔   ✔   ✔   ✔        ✔    ✔    ↑ AQUI    ○     ○        ○         │
│   colorido = conquistado     brilha = atividade do dia     cinza-claro   │
│                                         = ainda vem (sem cadeado)        │
│                    ╭───── ponte = Desafio da Sofia (provinha) ─────╮     │
│                                                                          │
│  Hoje:  [ 🎮 Fábrica de sílabas ]   [ 📖 Livrinho "A fila" ]   ← 2 opções│
│          120dp                       120dp         (autonomia [doc 08])  │
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
│  barra da sessão:  ● ● ◐ ○ ○   ("mais 2 atividades")  — sem relógio      │
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- trilha linear com 1 escolha por nível [doc 24 §3.3];
- regiões por família de sons [doc 04 #28];
- contador visual de progresso da sessão [doc 09 §3.3];
- os nós futuros ficam **visíveis e sem cadeado** (curiosidade, não bloqueio) [doc 08 P2].

No **modo TEA** aparece a "trilha da sessão" fixa no topo (aquecer → som novo → jogo → história) [doc 12 §3.1].

#### W3 — Lição com a Sofia (apresentação de fonema)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [👂 de novo]                                          [🚪 sair]          │
│                                                                          │
│     ┌─────────────────┐                  ┌──────────────────────────┐    │
│     │      ☺S         │                  │                          │    │
│     │   (Sofia 2D,    │   ((· "Esse é    │          M   m           │    │
│     │   olha p/ letra │      o som /m/.  │      (72sp, Andika,      │    │
│     │   e aponta)     │      Fecha os    │       destaque aceso     │    │
│     └─────────────────┘      lábios…     │       sincronizado)      │    │
│                              mmmm"·))    │      [🖼 MACACO]          │    │
│                                          └──────────────────────────┘    │
│                                                                          │
│     [ 👄 ver a boquinha ]           [ 🎤 agora você! ]  ← 112dp          │
│                                                                          │
│ ▁▁▁▁▁▁▁▁ fundo calmo, sem música, 1 elemento animado por vez ▁▁▁▁▁▁▁▁▁▁▁▁▁│
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- um foco por tela, sinalização sincronizada, contiguidade imagem-palavra e instrução falada [doc 09 §3.1];
- letra = forma + som + boca + imagem [doc 07 §3.1];
- som e não nome da letra [doc 06 §3A].

O botão 🎤 sempre tem alternativa por toque [doc 05 §4].

#### W4 — Boquinha + espelho

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [👂]                                                    [🚪]             │
│  ┌──────────────────────┐ ┌───────────────────┐ ┌──────────────────────┐ │
│  │  VÍDEO REAL (frontal)│ │  VISTA LATERAL    │ │  ESPELHO (opcional)  │ │
│  │   close dos lábios   │ │  (desenho)        │ │  câmera LOCAL,       │ │
│  │   /p/ → /pa/ → PATO  │ │  língua·dentes·   │ │  sem gravar/enviar   │ │
│  │   3–5 s, em loop     │ │  ícone 🖐 garganta │ │  [ligar espelho]     │ │
│  │  [▶ de novo] [🐢 lento]│ │  vibra? ar sai?   │ │  (só se o adulto     │ │
│  └──────────────────────┘ └───────────────────┘ │   permitiu)          │ │
│                                                  └──────────────────────┘ │
│        ◀ par mínimo lado a lado:  [ /p/ sem vibrar ]  [ /b/ vibra 🖐 ] ▶  │
│                                                                          │
│            P  (a letra aparece no instante do som)     [🎤 eu tento]     │
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- 1 vídeo por **fonema**, frontal real + lateral esquemática, sempre terminando na letra [doc 10 §3.1];
- espelho **local** e sem nota por câmera no MVP [doc 10 §3.2; doc 05 §6.6];
- a câmera não vê a língua [doc 03 §5.1].

No V2, a câmera com blendshapes pode dar **dica** ("junte os lábios!") só para /p b m f v a o u ʃ ʒ/ [doc 03 §10.2].

#### W5 — Jogo (exemplo: "Fábrica de Sílabas")

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [👂]  ☺S((· "Junta o /m/ com o /a/!" ·))              ● ● ◐ ○  [🚪]      │
│                                                                          │
│     ┌─────┐            ╔═════════════════╗                               │
│     │  M  │ ──arrasta─▶║  ⚙ MÁQUINA ⚙    ║──▶  [  MA  ] ((· "mmmaaa" ·)) │
│     └─────┘   ou toca  ║   ímã ≥ 48dp    ║       a sílaba sai e toca     │
│     ┌─────┐  M depois  ╚═════════════════╝                               │
│     │  A  │  a máquina                                                   │
│     └─────┘  (toque-toque, WCAG 2.5.7)                                   │
│                                                                          │
│   ◔B Bolota observa (não se mexe durante a decodificação)                │
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
└──────────────────────────────────────────────────────────────────────────┘
 Acerto: brilho + som ascendente + fala específica (≤ 1,5 s)
 Erro: balanço leve da peça + "hum, escuta de novo…" (sem X, sem buzina)
```
Evidência:
- mecânica #9 [doc 04 §3];
- arrastar curto com alternativa de toque [doc 24 §3.2];
- celebração depois da resposta, ≤ 2–3 s [doc 09 §3.2];
- estados de feedback [doc 24 §3.6].

#### W6 — Recompensa / fim de sessão (ritual)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ☺S ((· "Hoje você leu MALA e LAMA! Juntou o /m/ com o /a/ sozinha." ·))│
│                                                                          │
│     ┌──────────────── HOJE ────────────────┐   mapa: o nó "M" acende ✔   │
│     │  [🃏 figurinha nova: MACACO ((fala))] │   jardim: 2 plantinhas      │
│     │  [📖 palavras que eu sei: +2]         │   regadas 🌱🌱               │
│     └──────────────────────────────────────┘                             │
│                                                                          │
│   ☺S ((· "Amanhã vamos descobrir o som da cobra… sss! ·))  ← curiosidade │
│   ☺S ((· "Procura em casa uma coisa que começa com /m/!" ·)) ← mundo real│
│                                                                          │
│   ◔B boceja e vira bolinha 💤  (fim natural)                             │
│                                                                          │
│                       [ 🏠 voltar ao mapa ]   (sem "só mais uma")        │
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- ritual de 30–60 s com recapitulação específica, curiosidade para amanhã e ponte com o mundo real [doc 08 §3.6];
- o tatu-bola vira bola na hora de dormir [doc 04 §5.4];
- recompensa simbólica e informativa, sem moedas [doc 08 §3.4].

Fica **proibido**: autoplay, "Sofia triste", "não perca sua sequência" [doc 08 §3.5; doc 23 §3.6].

#### W7 — Álbum de figurinhas / Caderninho do Bolota

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [👂] [🏠]          ÁLBUM DOS SONS          [ 📒 caderninho do Bolota ]    │
│  página: ILHA DAS VOGAIS ✔   BAIRRO M-L-F ◐   PRAIA P-T ○   ◀ ▶ (setas)  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ 🐒 /m/  │ │ 🦁 /l/  │ │ 🦭 /f/  │ │ ░░░░░░ │ │ ░░░░░░ │ │ ░░░░░░ │       │
│  │ MACACO │ │ LEÃO   │ │ FOCA   │ │ (/v/   │ │ (/s/   │ │ (/n/   │       │
│  │((toca))│ │((toca))│ │((toca))│ │ silhueta│ │silhueta│ │silhueta│       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│   cada figurinha = 1 som DOMINADO (não comprável, não aleatória)         │
│                                                                          │
│  Caderninho do Bolota: "Você me ensinou: P não é B ✔ · PATO ✔ · BOLA ✔"  │
└──────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- álbum ligado a **domínio** [doc 04 #26; doc 08 §3.2];
- caderninho de registro metacognitivo [doc 23 §3.7];
- sem raridade, aleatoriedade ou compra [doc 08 §3.5; doc 04 §4.2, ECA Digital].

#### W8 — Painel do responsável (1 tela, celular em retrato)

```
┌─────────────────────────────────────┐
│ ≡  Ana · semana 9–15/nov      [⚙]   │
├─────────────────────────────────────┤
│ ✔ APRENDEU esta semana              │
│   [lh] [nh]                          │
│ ◐ ESTÁ PRATICANDO                   │
│   palavras com "qu"                  │
│                                     │
│ Dias de leitura nesta semana        │
│   S  T  Q  Q  S  S  D               │
│   ●  ●  ○  ●  ●  ○  ●   5 de 7 ✿    │
│   (sem "sequência que zera")        │
│                                     │
│ Sons que já moram na memória        │
│   ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  18 de ~30      │
│                                     │
│ Leitura em voz alta (1º ano em diante)│
│   42 palavras/min  ╱╲╱‾  (só ela    │
│   vs. ela mesma; faixa da série     │
│   como referência: 50–60)           │
├─────────────────────────────────────┤
│ 🏠 PARA FAZER EM CASA (5 min, sem tela)│
│ "No mercado, procurem 3 coisas com  │
│  o som /k/ de QUEIJO."  [▶ áudio]   │
│            [ ✔ Fizemos! ]           │
├─────────────────────────────────────┤
│ ⓘ Errar na revisão é normal e ajuda │
│   a memória.  [ver mais detalhes ▸] │
└─────────────────────────────────────┘
```
Evidência:
- formato de 1 tela, sem comparação com outras crianças e com 1 atividade em casa [doc 20 §3.8];
- "dias de leitura" em vez de streak [doc 04 §4.3; doc 08 §3.5];
- "letras que moram na memória" (nível ≥ 5) [doc 07 §3.3];
- tarefas com áudio para famílias com pouca leitura [doc 14 §3.5].

O gráfico de fluência **só aparece** a partir da fase de frases/textos [doc 06 §3C, item 12].

#### W9 — Painel do professor: visão da turma com mapa de calor

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ FONEMA · Prof. ___ · 1º ano B (24)   Semana 12  ▾     [Exportar] [Provinhas] [⚙]       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ RESUMO: 15 no alvo ●  6 atenção ◆  3 intervenção intensiva ▲   │ dose média: 52 min/sem │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ MAPA DE CALOR  (linhas = alunos, ordenadas por grupo; colunas = habilidades por domínio)  │
│               │ A·CF        │ B·Letra-som            │ C·Sílabas    │ D·Dígrafos/regras │
│               │rim sil fon  │ a e i o u m l f v s p t│ CV  V  CVC CCV│ ch lh nh qu rr  │
│ GRUPO 1 ──────┼─────────────┼────────────────────────┼──────────────┼─────────────────│
│  Ana          │ ██  ██  ██  │ ██ ██ ██ ██ ██ ██ ██ ▓▓ ▓▓ ▒▒ ░░ ░░│ ██  ██ ▒▒  ░░ │ ░░ ░░ ░░ ░░ ░░ │
│  Caio ▲       │ ▓▓  ▒▒  ░░  │ ██ ▓▓ ▒▒ ▒▒ ░░ ▒▒⚑ ░░ ░░ ░░ ░░ ░░ ░░│ ▒▒  ░░ ░░  ░░ │ ░░ ░░ ░░ ░░ ░░ │
│  ...          │             │                        │              │                 │
│ GRUPO 2 ...   │ legenda: ░░ não iniciado ▒▒ adquirindo ▓▓ consolidando ██ dominado     │
│               │          ⚑ precisa de apoio (3 lapsos/14 dias)  ⧗ automatizando (lento) │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ GRUPOS SUGERIDOS PARA AMANHÃ (você decide)                                             │
│  G1 (6) síntese CV com L/F  → [atividade de sala: "trem de sílabas" 10 min] [mover ▸] │
│  G2 (5) contraste P/B       → [mão na garganta + pares mínimos]                       │
│  G3 (3) CF: fonema inicial  → [caça ao primeiro som com objetos]                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ALERTAS (com motivo): ▲ Caio — pouca evolução em 8 sem. com dose adequada; RAN lento.  │
│   Não é diagnóstico. [ver relatório] [sugestão de conversa com a família]              │
│ 🎧 4 leituras com ASR incerto aguardam sua escuta  [ouvir agora]                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- mapa de calor + 3 a 5 grupos + risco em 3 faixas + erros por categoria [doc 20 §3.8];
- "sanguessuga" (3 lapsos em 14 dias) [doc 07 §3.2B];
- o professor decide e escuta por amostragem [doc 21 §3.6];
- risco só com persistência e dose adequada [doc 11 §3.2].

Os estados usam **cor + textura + ícone**, nunca só cor [doc 24 §3.7].

#### W10 — Relatório individual (professor; versão resumida para a família)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Caio · 6a 3m · 1º ano B · na plataforma desde 02/09 · dose: 38 min/sem (baixa)│
├──────────────────────────────────────────────────────────────────────────────┤
│ NÍVEL FONEMA: 2 — Leitor de sílabas   ●●○○○○  "em direção ao padrão 743*"     │
│ *estimativa interna; não é nota Saeb                                          │
├────────────────────────────────┬─────────────────────────────────────────────┤
│ CURVA DE DOMÍNIO (habilidades) │ FLUÊNCIA (quando aplicável)                  │
│ 30┤            ╭── faixa típica│ PCPM  60┤        ░░░ meta da série ░░░       │
│ 20┤        ╭───╯  (coorte)     │       30┤   •─•─•                            │
│ 10┤  •─•─•─╯  Caio             │        0┼────────── semanas                │
│  0┼──────────────── semanas    │ precisão: 82% ⚠ (< 90% = decodificação)     │
├────────────────────────────────┼─────────────────────────────────────────────┤
│ ERROS POR CATEGORIA (últ. 4 sem)│ HIPÓTESE DE ESCRITA (psicogênese)          │
│ surda/sonora  ████████ 11       │ pré-sil · silábica · sil-alf ◆ · alfabética│
│ omissão coda  ███ 4             │                                             │
│ espelhamento  ██ 3              │ BNCC em foco: EF01LP07, EF01LP08, EF12LP01  │
├────────────────────────────────┴─────────────────────────────────────────────┤
│ SINAIS DE ATENÇÃO (persistentes, não diagnósticos): CF fonema inicial; RAN.   │
│ Próximo passo sugerido: aumentar a dose para 15 min/dia por 6 sem., reavaliar │
│ no benchmark de fevereiro; conversar com a família [modelo de mensagem ▸]     │
│ [Exportar PDF]  [Ouvir 3 leituras gravadas (com consentimento)]               │
└──────────────────────────────────────────────────────────────────────────────┘
```
Evidência:
- níveis 1–6 e linguagem "no caminho" [doc 20 §3.8];
- sinal de alerta de precisão < 90% [doc 20 §3.7];
- categorias de erro e psicogênese [doc 25 §3.4; doc 20 §3.8];
- tags BNCC [doc 02 §2];
- triagem sem diagnóstico, citando a Lei 14.254/2021 [doc 05 §7; doc 11 §3.1].

#### W11 — Configurações sensoriais e de aprendizagem (responsável/professor)

```
┌─────────────────────────────────────────────────────────────┐
│ ⟵  Perfil de Ana                                           │
│ Presets: (•) Padrão ( ) Calmo ( ) Reforço de leitura        │
│          ( ) Foco curto ( ) Personalizado    ← sem rótulos  │
│ [🌙 MODO CALMO — 1 toque]: sem música, animação mínima,      │
│    cores suaves, sem confete, ritmo lento                   │
├─────────────────────────────────────────────────────────────┤
│ SOM     Voz da Sofia ━━━━●━━ 80%   Efeitos ━━●━━━━ 40%      │
│         Música de fundo [ off ]   Sons súbitos [ off ]      │
│ VOZ     Velocidade 0,75× ━━━●━━━ 1,25×   Legendas [ on ]    │
│ MOVIMENTO  ( ) completo (•) reduzido ( ) nenhum  (segue SO) │
│ VISUAL  Contraste: (•) normal ( ) alto ( ) suave/creme       │
│         Letra: Aa ━━━●━━ AA   Espaçamento: [+ entre letras] │
│         Fonte: (•) Andika ( ) Lexend ( ) OpenDyslexic ⓘ     │
│ TEMPO   Sessão: 10 ▾ min   Limite diário: 1 sessão ▾        │
│         Timer visual [ off ]   Tempo de resposta: sem limite│
│ FALA    Microfone: (•) avalia ( ) só incentiva ( ) desligado │
│ COMUNICAÇÃO  Responder por figuras/CAA [ off ]  Libras [V2] │
│ FEEDBACK  Celebração: ( ) intensa (•) discreta ( ) neutra   │
├─────────────────────────────────────────────────────────────┤
│ ⓘ As mudanças ficam registradas para você e o terapeuta.    │
└─────────────────────────────────────────────────────────────┘
```
Evidência:
- painel de perfil sensorial e modo calmo [doc 05 §2.4];
- fontes sem promessa terapêutica [doc 05 §5; doc 11 §3.3];
- avaliação de pronúncia desligável e desligada por padrão para TDL/apraxia [doc 05 §4];
- registro de mudanças [doc 12 §3.3].

#### W12 — Editor / biblioteca de histórias decodificáveis (editorial; professor aprova)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BIBLIOTECA · filtros: Fase [F2 ▾]  CGF-foco [v ▾]  Tema [cerrado ▾]  Status [todos ▾]│
├───────────────────────────────┬────────────────────────────────────────────────────┤
│ ▸ "A vovó viu a uva"  F2 ✔pub  │ EDITOR: "O pato e a bola"           Fase alvo: F2   │
│ ▸ "O pato e a bola"   F2 ◐rev  │ ┌────────────────────────────────────────────────┐ │
│ ▸ "Lili e o leite"    F3 ○rasc │ │ O pato bebe. A bola é da vovó.                  │ │
│ ▸ ...                          │ │ O pato vê a bola. ⟦ CACHORRO ⟧ ← fora da fase  │ │
│ [+ nova]  [✨ gerar rascunho]   │ └────────────────────────────────────────────────┘ │
│  (LLM nos bastidores; nunca vai │ LINTER DE DECODIFICABILIDADE                      │
│   direto à criança)             │  decodificável na fase: 94% ⚠ (meta ≥ 95% F1–F2)  │
│                                 │  fora da fase: CACHORRO (ch, rr) → [substituir ▾] │
│                                 │  palavras-ferramenta: a, é, da, o                  │
│                                 │  repetição da CGF-foco /b/: 4× ✔ (mín. 4)          │
│                                 │  palavras: 18 · por frase: 4,5 · novas/100: 6      │
│                                 │  segurança/estereótipo: ✔  revisão humana: ☐       │
│                                 │ ÁUDIO: [gerar TTS] [timestamps por palavra ✔]       │
│                                 │ ILUSTRAÇÃO: [anexar]   METADADOS: tema, gênero…     │
│                                 │ [Enviar p/ revisão pedagógica] [Publicar]           │
│                                 │ Dados de uso (pós-publicação): acurácia mediana 93% │
│                                 │   PCPM mediano 31 · pedidos de ajuda/100 pal.: 4    │
└───────────────────────────────┴────────────────────────────────────────────────────┘
```
Evidência:
- pipeline com linter, metas ≥ 95% (F1–F2) e ≥ 90% (F3–F4) como **proposta de produto**, repetição mínima da CGF e revisão humana obrigatória [doc 25 §3.1];
- LLM só offline, com validador bloqueante e publicação estática [doc 21 §3.4];
- o professor aprova ou pede histórias com tema local [doc 21 §3.6].

#### (Extra) W13 — Painel da rede / secretaria

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Rede ___ · 2º ano · benchmark: fim do 1º trimestre ▾   escolas: 42 · n=3.118  │
├──────────────────────────────────────────────────────────────────────────────┤
│ DISTRIBUIÇÃO POR NÍVEL FONEMA (barras 100%, uma por escola, ordenáveis)        │
│ Esc. A │▓1▓│▓▓2▓▓│▒▒▒3▒▒▒│░░░4░░░│████5████│█6█│  "no caminho do 743*": 41%  │
│ Esc. B │▓▓1▓▓│▓▓▓2▓▓▓│▒▒3▒▒│░░4░░│███5███│█6│               33%              │
│ ...    (escolas com n < 10 aparecem agregadas)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ TENDÊNCIA (benchmarks trimestrais): % níveis 5–6  ── 2026 T1 ─ T2 ─ T3         │
│ MAPA ESCOLA × HABILIDADE-NÚCLEO (% de domínio)   │ USO/DOSE: min/aluno/sem       │
│ *estimativa interna; NÃO é nota Saeb nem ICA oficial                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---
## 3. Gráficos e visualizações de dados

### 3.1 Princípios de visualização do FONEMA

1. **Cada gráfico responde a uma pergunta e leva a uma ação.** Dashboard "acionável" é princípio do doc 20 [doc 20 §2.7, §3.8]. Um gráfico que não muda nenhuma decisão do adulto não entra.
2. **Criança comparada consigo mesma.** Nos relatórios para família não há comparação com outras crianças [doc 20 §3.8; doc 13 §3.2]. No painel do professor, a comparação com a coorte aparece só como **faixa de referência de fundo**, nunca como ranking.
3. **Precisão antes de velocidade.** Toda visualização de fluência mostra a precisão junto, porque precisão < 90% indica problema de decodificação e não de velocidade [doc 20 §3.7]. Em português, a dislexia aparece mais como lentidão [doc 11 §3.2].
4. **Incerteza visível.** As métricas que dependem do reconhecimento de fala trazem um selo de confiança. Itens com ASR incerto ficam **fora do cálculo** [doc 20 §3.1, item 5; doc 22 §3.5].
5. **Persistência antes de alerta.** Nenhum "sinal de atenção" aparece com base em um dia ou uma semana. Ele exige várias semanas **com dose adequada** [doc 11 §3.2; doc 05 §7]. Por isso a **dose** (minutos de prática fônica) aparece ao lado de todo indicador de risco.
6. **Linguagem de "caminho", não de nota.** A escala FONEMA (0–1000, provisória) e os níveis 1–6 **não equivalem numericamente** ao Saeb até haver itens de ligação [doc 20 §3.8].
7. **Acessível e daltônico-seguro.** Cor + forma + textura + rótulo. Escala sequencial de um só matiz no mapa de calor. Contraste ≥ 3:1 em marcas gráficas e ≥ 4,5:1 em texto [doc 24 §3.7]. Toda visualização tem tabela equivalente (botão "ver como tabela") para leitores de tela.
8. **Privacidade nos agregados.** Nos painéis de rede, grupos com n < 10 são agregados ou suprimidos. É uma decisão de produto (minimização) alinhada ao espírito da LGPD art. 14 [doc 05 §6]. ⚖️ Confirmar o limiar com o jurídico.

**O que o mercado faz (busca web desta rodada; a eficácia desses layouts não foi avaliada):**
- O **95 Literacy Intervention System** oferece aos gestores um mapa de calor de aquisição de habilidades, filtrável por escola, série e data ([95 Percent Group](https://www.95percentgroup.com/?p=26956)).
- O **Amplify Boost** tem a visão "Trouble Spots" por habilidade e/ou por aluno, com círculos coloridos de domínio ([Amplify Boost](https://amplify.com/program-highlights/boost/)).
- O painel do **GraphoGame** agrupa alunos automaticamente por progresso e sinaliza erros que podem indicar dificuldade precoce ([GraphoGame](https://group.graphogame.com/?p=1450)).
- O **Renaissance Star Early Literacy** mostra o domínio por domínio de habilidades ([Renaissance](https://star-help.zendesk.com/hc/en-us/articles/11761508617243)).
- Uma dissertação da Univ. de Groningen sobre painéis de professor em tutores inteligentes concluiu que os professores preferem "instantâneos" a explorar dados sozinhos. Conclui também que o painel deve apoiar a decisão e a interação professor-aluno ([Blankestijn 2021](https://fse.studenttheses.ub.rug.nl/26434/1/mHMC_2021_BlankestijnJA.pdf)).

Lição: o padrão de mercado é a grade colorida habilidade × aluno e o agrupamento automático. O FONEMA deve acrescentar a **ação sugerida por grupo** e o **contexto de dose**, que o mercado não destaca.

### 3.2 Bibliotecas sugeridas (dados do GitHub em 13/11/2026)

| Biblioteca | ⭐ | Licença | Plataforma | Uso no FONEMA |
|---|---|---|---|---|
| [apache/echarts](https://github.com/apache/echarts) | ~67,7k | Apache-2.0 | web (canvas/SVG) | **Mapa de calor grande** (24–35 alunos × 70 habilidades), zoom, tooltip, exportar imagem. Boa performance com muitas células. |
| [wuba/react-native-echarts](https://github.com/wuba/react-native-echarts) | ~1k | Apache-2.0 | app (RN, Skia/SVG) | Mesmas opções do ECharts no app (professor em tablet). |
| [recharts/recharts](https://github.com/recharts/recharts) | ~27,7k | MIT | web (React/SVG) | Linhas e barras simples nos portais do responsável e do professor (fluência, dose, curva de domínio). Fácil de estilizar com tokens. |
| [plouc/nivo](https://github.com/plouc/nivo) | ~14,1k | MIT | web (React; SVG/canvas) | Alternativa com `HeatMap`, `Bump`, `Calendar` prontos. Bom para os relatórios em PDF (renderização no servidor). |
| [airbnb/visx](https://github.com/airbnb/visx) | ~21,1k | MIT | web (primitivas D3) | Visualizações sob medida (ex.: "ponte de níveis", dot plot de decodificação × compreensão). |
| [observablehq/plot](https://github.com/observablehq/plot) | ~5,4k | ISC | web | Exploração interna (time de dados/pesquisa, calibração de itens). Não precisa ir ao usuário final. |
| [tremorlabs/tremor-npm](https://github.com/tremorlabs/tremor-npm) | ~16,5k | Apache-2.0 | web | Cartões de KPI e layout do painel da rede (opcional; sobre Recharts). |
| [FormidableLabs/victory-native-xl](https://github.com/FormidableLabs/victory-native-xl) | ~1,2k | **sem SPDX na API — conferir** | app (Skia + Reanimated) | Gráficos performáticos no app do responsável. Antes de adotar, confirmar a licença no repositório. |
| [margelo/react-native-graph](https://github.com/margelo/react-native-graph) | ~2,6k | MIT | app (Skia) | Linha animada simples (fluência no celular do responsável). |
| [chart-kit/react-native-chart-kit](https://github.com/chart-kit/react-native-chart-kit) | ~3,1k | MIT | app | Inclui um "contribution graph" (calendário). Opção leve para "dias de leitura". |
| [kevinsqi/react-calendar-heatmap](https://github.com/kevinsqi/react-calendar-heatmap) | ~1,3k | MIT | web | Calendário de dias de prática (portal web). Cuidado: **não** transformar em streak. |
| **Rive** / **Lottie** / **React Native Skia** | ver [doc 03 §2] | MIT / Apache | app e web | **Visuais da criança** (trilha, jardim, álbum). Não são gráficos: são ilustrações animadas dirigidas por dados. |

**Recomendação:**
- **Web (portais):** ECharts para o mapa de calor e as grades grandes, e Recharts para linhas e barras do dia a dia. Os dois leem os mesmos tokens de cor do design system (§6).
- **App:** react-native-echarts no professor e Skia (react-native-graph ou Victory Native XL, depois de conferir a licença) no responsável.
- **Criança:** Rive (state machines dirigidas por dados) e Lottie [doc 03 §2, §9].
- **PDF:** renderização no servidor (Nivo ou ECharts SSR → SVG → PDF).

### 3.3 Fichas dos gráficos

Legenda das colunas: **Pergunta** = a dúvida do usuário que o gráfico resolve. **Cuidados** = riscos de interpretação.

#### 3.3.1 Para a criança: progresso não numérico

| ID | Visual | Dados | Pergunta que responde | Cuidados | Implementação |
|---|---|---|---|---|---|
| C1 | **Trilha/mapa que se colore** (W2) | habilidades dominadas por região; atividade do dia; próxima ponte | "Onde estou? O que vem agora?" | Nós futuros visíveis e sem cadeado. Sem contagem de "% completo". Nunca "descolorir" o que já foi conquistado, mesmo se a habilidade voltar a "em consolidação" [doc 20 §3.5] | Rive/Skia; estado vem do modelo do aluno |
| C2 | **Jardim da Revisão** | itens com revisão vencida (R = exp(−t/S)) [doc 07 §3.2]; regas feitas | "Tem alguma plantinha precisando de mim?" | Plantas **murcham levemente, nunca morrem** [doc 04 #29]. Máximo de 3–5 plantas "com sede" visíveis (sem dívida desmotivadora: nunca "120 revisões atrasadas") [doc 07 §3.2C]. No modo TEA, avisar antes das mudanças | Rive com input numérico "sede" 0–1 por planta |
| C3 | **Álbum de figurinhas que falam** (W7) | sons dominados (nível ≥ 5) | "Quantos sons eu já sei?" | Figurinha = domínio, não tempo de uso. Sem raridade nem sorteio [doc 08 §3.5; ECA Digital, doc 04 §4.2] | Grade fixa por região; áudio ao tocar |
| C4 | **Caderninho do Bolota** | correções que a criança fez (pares mínimos ensinados) | "O que eu ensinei?" | Erros do Bolota sempre dentro do que a criança já domina [doc 23 §3.7] | Lista ilustrada com áudio |
| C5 | **Barra da sessão** (● ● ◐ ○) | atividades feitas/restantes na sessão | "Falta muito?" | Sem relógio. Previsibilidade (TEA) e meta curta visível (TDAH) [doc 12 §3.1–3.2] | Componente simples |
| C6 | **"Potinho de palavras que eu sei ler"** | palavras lidas com fluência | "Eu já leio!" | Mostrar palavras (tocáveis, com áudio), e não um número. Para 7–8 anos, opcional "você já leu 3 livrinhos" | Lista/pote animado |
| C7 | **Tabela de sons** (modo TEA) | grafemas por estado | "Quais regras já sei?" | Visual sistemático, de baixa saturação, para quem gosta de sistemas [doc 12 §3.1] | Grade estática |

#### 3.3.2 Para o responsável: progresso semanal simples e sem ansiedade

| ID | Tipo | Dados | Pergunta | Cuidados | Biblioteca |
|---|---|---|---|---|---|
| R1 | **Chips "aprendeu / praticando"** | habilidades que mudaram de estado na semana | "O que meu filho aprendeu esta semana?" | Linguagem simples ("o som do LH"), sem jargão. No máximo 3 chips por estado [doc 20 §3.8] | componente UI |
| R2 | **7 pontos da semana** ("dias de leitura") | dias com sessão concluída | "Ele está praticando com regularidade?" | **Não é streak:** não zera, não envia alerta de perda, não usa a palavra "sequência" [doc 04 §4.3; doc 08 §3.5] | componente UI / chart-kit |
| R3 | **Barra de sons "na memória de longo prazo"** | nº de CGF com nível ≥ 5, em relação ao total do currículo da fase | "Está consolidando?" | Explicar que errar na revisão é normal [doc 07 §3.3]. Não mostrar o percentual da turma | Recharts/Skia |
| R4 | **Linha de fluência pessoal** (PCPM) + precisão | PCPM por semana; precisão %; faixa provisória da série como fundo | "Ele está lendo mais rápido?" | Só a partir das fases de frase/texto [doc 06 §3C]. As metas são **hipóteses provisórias** [doc 20 §3.7]. Esconder quando o ASR está em beta ou com baixa confiança. Nunca cronômetro para a criança | Recharts / react-native-graph |
| R5 | **Tempo de prática fônica acumulado** | minutos/semana (barra) | "Estamos dando a dose certa?" | Mostrar **meta de dose** (ex.: 10–15 min/dia, 5×/semana) [doc 11 §3.4], e não "mais é melhor". Não premiar tempo de tela [doc 08 §3.7] | Recharts |
| R6 | **Cartão "sinal de atenção"** (raro) | indicadores persistentes (CF, RAN, taxa de aprendizagem) | "Devo procurar ajuda?" | Texto padronizado, não diagnóstico, com ação concreta e Lei 14.254/2021 [doc 05 §7]. Consentimento para dado sensível. Nunca usar para vender plano [doc 05 §7] | texto, sem gráfico |

#### 3.3.3 Para o professor

| ID | Tipo | Dados | Pergunta | Cuidados | Biblioteca |
|---|---|---|---|---|---|
| P1 | **Mapa de calor aluno × habilidade** (W9) | estado por nó do mapa de habilidades (~70 nós em 7 domínios [doc 20 §3.2]): não iniciado / adquirindo / consolidando / dominado / automatizado; marcadores ⚑ (sanguessuga) e ⧗ (lento) | "Onde a turma está? Quem está travado em quê?" | (a) Escala sequencial de 1 matiz + ícones. (b) Colunas agrupadas por domínio e recolhíveis (por padrão, só as da fase atual). (c) "Dominado" segue o critério de 4 condições [doc 20 §3.5], explicado em tooltip. (d) Linhas ordenadas por grupo, nunca por "nota". (e) Células com ASR incerto ganham hachura | ECharts (`heatmap` + `visualMap` por peças) |
| P2 | **Grupos automáticos** (3–5) | clusterização pela "franja externa" do grafo (próxima habilidade a ensinar) | "Quem precisa da mesma aula amanhã?" | É sugestão e o professor arrasta para mudar [doc 21 §3.6]. Grupos de 2–8 alunos. Mostrar o **motivo** do agrupamento e uma atividade de sala sugerida | lista UI + algoritmo |
| P3 | **Curva de domínio** (individual e da turma) | nº acumulado de habilidades dominadas × semanas; faixa interquartil da coorte FONEMA como fundo | "O ritmo de aprendizagem está bom?" | É o melhor sinal de RTI (resposta à intervenção) [doc 11 §3.2]. Normalizar por **semanas com dose adequada**, e não por semanas de calendário. A faixa só aparece com coorte ≥ 30 | Recharts (linha + área) |
| P4 | **Curva de aprendizagem por habilidade** | taxa de erro × nº de oportunidades, por habilidade (curva clássica de tutores inteligentes) | "Esta habilidade está sendo aprendida ou o item está ruim?" | Uso avançado/editorial. Uma curva plana pode indicar item mal calibrado, e não aluno com dificuldade | Recharts / Plot |
| P5 | **Fluência ao longo do tempo** | PCPM (texto equivalente calibrado), precisão %, sílabas corretas/min [doc 20 §3.7] | "Ele lê mais rápido e com precisão?" | Duas linhas com eixos separados, ou precisão como cor do ponto. Faixa-meta **provisória** e editável pela rede. Só textos equivalentes. Marcar pontos de ASR em beta | Recharts (ComposedChart) |
| P6 | **Faixas de risco** (3) | no alvo / atenção / intervenção intensiva, a partir de PCPM, precisão, ritmo de domínio, RAN [doc 20 §3.8] | "Quem precisa de intervenção intensiva?" | Formas distintas (● ◆ ▲) + texto. Sempre exibir o **motivo** e a **dose**. Linguagem "não é diagnóstico" [doc 05 §7]. Pontos de corte a validar com dados brasileiros [doc 11 §3.2] | lista + badge |
| P7 | **Erros por categoria** | troca surda/sonora, regra contextual, omissão de coda/CCV, espelhamento, leitura logográfica (acerta palavras, erra pseudopalavras) [doc 20 §3.8; doc 25 §3.4] | "Que tipo de erro predomina?" | Barras horizontais ordenadas. Trocas surda/sonora são comuns no início e só preocupam se persistirem [doc 11 §3.2] | Recharts (BarChart) |
| P8 | **Decodificação × compreensão** (dispersão) | eixo X = precisão de decodificação; eixo Y = compreensão literal; um ponto por aluno | "Alguém decodifica bem e não entende (perfil hiperléxico)? Ou entende e não decodifica?" | Alerta de perfil hiperléxico (TEA) [doc 12 §3.1]. Quadrantes rotulados em linguagem de ação. Sem nomes por padrão na projeção em sala | visx / ECharts |
| P9 | **Hipótese de escrita** (barra empilhada) | pré-silábica / silábica / silábico-alfabética / alfabética [doc 20 §3.3] | "Em que hipótese de escrita está a turma?" | Tradução para a linguagem escolar brasileira, a partir do ditado. Mostrar a palavra escrita de exemplo | Recharts |
| P10 | **Pseudopalavras × palavras reais** | acerto em cada tipo, por aluno | "Ele decodifica ou memoriza?" | Diferença grande = rota logográfica [doc 20 §3.3] | barras pareadas |
| P11 | **Fila de escuta** | leituras com ASR incerto ou discordante (com consentimento) | "Quais leituras preciso ouvir?" | Amostragem limitada (ex.: ≤ 10/semana). A correção do professor vira dado de melhoria [doc 21 §3.6] | lista + player |
| P12 | **Dose e uso** | min/semana por aluno; sessões concluídas pelo ritual × abandonadas | "Quem não está praticando o suficiente?" | Separar "não pratica" de "pratica e não avança" antes de qualquer alerta | Recharts |

#### 3.3.4 Para a escola e a secretaria (gestor)

| ID | Tipo | Dados | Pergunta | Cuidados | Biblioteca |
|---|---|---|---|---|---|
| G1 | **Barras 100% por nível FONEMA (1–6)**, uma por turma ou escola | distribuição por nível no benchmark trimestral [doc 20 §3.3, §3.8] | "Como estão as turmas/escolas?" | Níveis 5–6 = "no caminho do padrão Saeb 743". Rodapé fixo: "estimativa interna, não é nota Saeb nem ICA". Suprimir n < 10 | ECharts / Nivo |
| G2 | **Indicador "no caminho do 743"** (KPI + linha de tendência por trimestre) | % no nível ≥ 5 no fim do 2º ano; projeção para o 1º ano | "Vamos chegar à meta do Compromisso?" | O ICA oficial usa avaliações estaduais equalizadas ao Saeb [doc 02 §3.3]. A ancoragem por TRI só vale depois de itens de ligação [doc 20 §3.8]. Contexto: ICA nacional de 56% (2023), 59,2% (2024) e 66% (2025) e meta de 80% em 2030 [doc 02; doc 04 §1] | Tremor/Recharts |
| G3 | **Mapa de calor escola × habilidade-núcleo** | % de alunos com domínio por habilidade | "Que conteúdo a rede precisa reforçar na formação?" | Agregado, sem nominal. Útil para formação de professores | ECharts |
| G4 | **Funil de benchmark** (início → meio → fim) | migração entre níveis (Sankey ou barras deslizantes) | "As crianças estão subindo de nível?" | O Sankey é difícil para leigos: oferecer a versão em tabela de "subiu/manteve/desceu" | ECharts Sankey |
| G5 | **Uso e dose por escola** | % de alunos com dose ≥ meta; aparelhos offline sincronizando | "O programa está sendo implementado?" | A fidelidade de implementação explica resultado. Separar o problema de **acesso** (aparelho, rede) do pedagógico | Recharts |
| G6 | **Equidade** (opcional) | níveis por região/rede/sexo; taxa de falso erro do ASR por região | "Há viés?" | Auditoria de viés/DIF [doc 20 §3.9; doc 21 §3.5]. Visível para a gestão de dados, com cautela na interpretação | Plot / ECharts |

#### 3.3.5 Admin, editorial e pesquisa (interno)

| ID | Gráfico | Para quê |
|---|---|---|
| A1 | Distribuição de dificuldade dos itens (Elo d_i) por habilidade; deriva trimestral | Recalibração [doc 20 §3.4, §3.9] |
| A2 | Acurácia do ASR × juízes humanos, por idade, região e tipo de item; taxa de "falso errado" | Liberar itens só com ≥ 90% de acordo [doc 20 §3.9]; equidade [doc 21 §3.5] |
| A3 | Linter: % decodificável e acurácia mediana real por história | Ciclo editorial [doc 25 §3.1] |
| A4 | Retenção em 30 dias por braço de A/B (v0 × FSRS etc.) | Métrica principal do agendador [doc 07 §3.2E] |
| A5 | **Métricas éticas:** % de sessões encerradas pelo ritual × abandonadas; retorno voluntário; tempo médio dentro do alvo (não "mais é melhor") | [doc 08 §3.7] |
| A6 | Taxa de aquisição individual (retidos no dia seguinte / novos) | Ajuste do nº de itens novos [doc 07 §3.2C] |

### 3.4 Anti-padrões de visualização (não fazer)

- Ranking da turma, "aluno destaque", pódio ou cor vermelha associada a nomes.
- Velocímetro/gauge de "nível de leitura" para a família. Ele induz ansiedade e falsa precisão.
- Mostrar "nota 743" ou "nota Saeb" individual.
- Gráfico de "minutos de tela" como sucesso.
- Percentis de crianças pequenas sem norma brasileira validada [doc 20 §3.7; doc 11 §3.2].
- Calendário de streak com dias "quebrados" em vermelho.
- Alertas push de desempenho para a criança (só para o adulto, opcional) [doc 04 §4.3].

---
## 4. Funcionalidades priorizadas (MoSCoW → MVP / V1 / V2 / Futuro)

Legenda:
- **Comp.** = complexidade (P ≤ 2 sem., M 2–6 sem., G > 6 sem. ou várias disciplinas);
- **Risco** = principal risco (técnico, pedagógico, legal ⚖️ ou de produção);
- as evidências remetem aos documentos internos.

### 4.1 MVP — "Must have" (lançamento piloto: casa + escolas parceiras)

| ID | Funcionalidade | Descrição | Evidência | Comp. | Risco |
|---|---|---|---|---|---|
| F01 | Contas, papéis e vínculos | Responsável, criança (perfil sem e-mail), professor, escola. RLS por papel. Vários perfis por aparelho (até 40 em tablet de turma) | [doc 03 §7, §9; doc 24 §3.8] | M | Modelo de dados multi-escola mal desenhado |
| F02 | Consentimento parental e porteira adulta | Consentimento LGPD art. 14 em linguagem simples, granular (microfone/câmera/pesquisa). Porteira = segurar 3 s + tarefa escrita sorteada | [doc 05 §6, §8; doc 24 §3.5] | M | ⚖️ ECA Digital + Decreto 12.880/2026 e verificação de idade: parecer jurídico obrigatório |
| F03 | Login por figuras + QR | Grade de avatares, senha de 3 figuras (ordem configurável), QR da turma e QR individual para casa | [doc 24 §3.4] | M | Troca de perfis em aparelho compartilhado |
| F04 | Currículo fônico em dados | "Language pack" JSON: etapas 0–10, CGF, sílabas, palavras, pseudopalavras, tags BNCC canônicas + aliases estaduais | [doc 02 §5.5, §7.1; doc 03 §7.1] | M | Sequência sem validação de pedagoga/fono |
| F05 | Missão de boas-vindas (diagnóstico) | 3 sessões de 4–6 min, roteamento multiestágio. Define fase de entrada, priors e bandeiras | [doc 20 §3.3] | G | Itens sem calibração inicial; ASR no item oral |
| F06 | Mundo/trilha (W2) | Mapa linear por regiões de sons, 2–3 escolhas por dia, ponte do desafio | [doc 24 §3.3; doc 04 #28; doc 08 P6] | M | Arte cara |
| F07 | Sessão estruturada e ritual | Aquecimento → revisões → novos → contraste → fechamento → ritual de despedida. Limite diário configurável | [doc 07 §3.2C; doc 08 §3.6; doc 09 §3.3] | M | — |
| F08 | Motor de aprendizagem v0 | Agendador Leitner + estabilidade, modelo Elo por habilidade, gate de domínio (4 critérios), regras de bloqueio de novos | [doc 07 §3.2; doc 20 §3.4–3.5] | G | Limiares de latência sem norma BR (hipóteses a recalibrar) |
| F09 | Sofia roteirizada | Rive com state machine (idle, falando, apontando, ouvindo, comemorando), falas pré-geradas por TTS neural + visemas, banco de 15–30 variações por tipo de fala | [doc 23 §3.4–3.6; doc 21 §3.3; doc 03 §6] | G | Visual (marca "Sofia" ⚖️ INPI; distância da "Princesinha Sofia") [doc 04 §1, item 6] |
| F10 | Inventário de fonemas gravado por humano | Fonemas e sílabas do PB gravados com fonoaudióloga/locutora, sprites de áudio | [doc 23 §3.4; doc 04 §5.3; doc 21 §3.2] | M | Produção e direção de voz |
| F11 | Vídeos da boquinha (W4) | 1 vídeo por fonema: frontal real + lateral esquemática + letra no instante do som; versões leves | [doc 10 §3.1; doc 03 §6] | M | Produção (iluminação, sincronia no nível de quadro) |
| F12 | 14 jogos-núcleo | Ver §5: #1, #2, #3, #6, #9, #10, #11, #16, #18, #20, #21, #23, #28, #32 (todos com alternativa de toque e sem fala) | [doc 04 §3] | G | Escopo: manter as mecânicas parametrizáveis (mesmo motor) |
| F13 | Escada de ajuda e feedback | Dica temporizada 5/10/20 s, prompt→recast→leitura conjunta, mudança de estratégia após 3 erros, microcopy da Sofia | [doc 13 §3.1–3.4; doc 24 §3.3] | M | Roteiro extenso |
| F14 | Recompensas intrínsecas | Trilha que se colore, álbum (domínio), "palavras que eu sei", celebração ≤ 1,5–3 s | [doc 08 §3.1–3.4; doc 09 §3.2] | M | Escorregar para "economia de moedas" |
| F15 | Desafio da Sofia (provinhas) | Provinha de letra (10 itens, ≥ 8/10 com pseudopalavra) e de fase (20+4+texto), sem cronômetro visível, trilha de reforço | [doc 20 §3.6; doc 13 §3.5] | M | Pseudopalavras precisam de revisão por fono |
| F16 | Livrinhos decodificáveis (~30) + leitura sob demanda | Biblioteca inicial F1–F3, palavra tocável, destaque sincronizado, cena anima ao terminar. Sem hotspots | [doc 25 §3.1; doc 09 §3.4; doc 04 #21] | G | Escrever textos naturais com poucas CGF |
| F17 | Linter de decodificabilidade (interno) | Decomposição em grafemas PB, % decodificável, repetição de CGF, fora-da-fase | [doc 25 §3.1; doc 21 §3.4] | M | G2P do PB (x, s, r, nasais) |
| F18 | Perfil sensorial + modo calmo (W11) | Presets editáveis, volumes separados, menos movimento, contraste, velocidade da voz, legendas | [doc 05 §2.4; doc 12 §3] | M | — |
| F19 | Acessibilidade base | WCAG 2.2 AA, alternativa de toque para arrastar, legendas das falas, leitor de tela na área adulta, `prefers-reduced-motion` | [doc 05 §2.2; doc 24 §3.7] | M | Testes com usuários com deficiência |
| F20 | Offline-first e aparelhos fracos | Pacotes de lição ≤ 5 MB, instalação ≤ 40 MB, fila de sincronização, Android 8.1/2 GB | [doc 24 §3.8; doc 03 §7] | G | Sincronização de conflitos (PowerSync/WatermelonDB) |
| F21 | Relatório semanal da família (W8) | 1 tela + 1 atividade sem tela com áudio + botão "fizemos!" | [doc 20 §3.8; doc 14 §3.5] | P | Notificação vira pressão: opcional e só para o adulto |
| F22 | Painel do professor v1 (W9, W10) | Turma, mapa de calor, grupos sugeridos, relatório individual, exportar PDF | [doc 20 §3.8; doc 21 §3.6] | G | Sobrecarga de informação: começar só com P1, P2, P3, P7 e P12 |
| F23 | Analytics first-party e privacidade | Eventos pedagógicos próprios, sem SDK de terceiros, sem AD_ID, retenção e exclusão | [doc 05 §6.6; doc 04 §4.2] | M | ⚖️ |
| F24 | ASR camada 1 (VAD) + modo "só incentiva" | Detecta que a criança falou (energia/duração) e celebra a tentativa. Sem nota | [doc 03 §10.2] | P | — |
| F25 | **Beta "Eu leio, a Sofia escuta"** (escolas-piloto) | ASR restrito a alvo conhecido, on-device quando possível. Com baixa confiança, o item não é pontuado. Coleta de corpus **só** com consentimento específico | [doc 22 §3; doc 03 §10; doc 21 §3.1; doc 05 §6.6] | G | Falso "errado" com voz infantil; ⚖️ dado de voz |

### 4.2 V1 — "Should have" (3–6 meses após o MVP)

| ID | Funcionalidade | Descrição | Evidência | Comp. | Risco |
|---|---|---|---|---|---|
| F30 | "Eu leio, a Sofia escuta" (geral) | Verificação de leitura de sílabas, palavras e frases (camada 2), ajuda graduada (sílaba → som → palavra), autocorreção conta como meio acerto | [doc 03 §10.2; doc 25 §3.2; doc 20 §3.4] | G | Precisão por região/sotaque; liberar só itens com ≥ 90% de acordo com juízes |
| F31 | Karaokê em 4 passos (fluência) | Ouvir (destaque palavra/sílaba) → eco/coral → ler sozinho (destaque segue a criança) → reler até o critério | [doc 25 §3.2; doc 04 #19] | G | Alinhamento em tempo real |
| F32 | Medição de PCPM e precisão | Textos equivalentes calibrados, sílabas corretas/min, gráficos R4/P5 | [doc 20 §3.7] | M | Metas provisórias sem norma BR |
| F33 | Bolota, o aprendiz que a criança ensina | Erros planejados alinhados à lição (p/b, t/d, b/d...), caderninho, "ler para o Bolota dormir" | [doc 23 §3.7–3.8] | M | Bolota errar o que a criança não domina gera frustração |
| F34 | Jardim da Revisão | Visual C2 ligado ao agendador | [doc 04 #29; doc 07] | M | No modo TEA, mudanças precisam de aviso |
| F35 | Traçado de letras | Demonstração → trilho → mão livre → reconhecer; Skia; corredor ≥ 40 dp; aceitar traço em partes | [doc 24 §3.2; doc 10 §3.4; doc 25 §3.4] | M | Desempenho em aparelho fraco |
| F36 | Ditado e escrita inventada | Montagem com letras móveis e teclado grande; feedback "um passo à frente"; classificação de erros (Morais) | [doc 25 §3.4; doc 02 §2] | M | Classificador de erros |
| F37 | Presets de apoio (TEA / foco curto / reforço) | Parâmetros do agendador e da interface por perfil, combináveis, com a previsibilidade com prioridade | [doc 07 §3.2D; doc 12 §3; doc 11 §3.3] | M | Rótulos visíveis: nunca mostrar para a criança |
| F38 | Benchmark trimestral | Versão paralela de ~8 min do diagnóstico | [doc 20 §3.3] | M | Equivalência das versões |
| F39 | Faixas de risco e sinais de atenção | P6 e R6 com persistência e dose; textos padronizados | [doc 20 §3.8; doc 11 §3.2; doc 05 §7] | M | ⚖️ dado sensível de saúde; falso positivo |
| F40 | Painel escola/rede (W13) | G1–G5, exportação no formato do ICA, supressão de n pequeno | [doc 20 §3.8; doc 02 §3.3] | G | Interpretação como "nota Saeb" |
| F41 | Modo "Ler junto" (família) | Revezamento adulto-criança, perguntas CROWD/PEER para o adulto, dicas em áudio | [doc 04 #30; doc 14 §3.5; doc 09 §3.4] | M | — |
| F42 | Fila de escuta do professor | O professor ouve leituras incertas e corrige o veredito (vira dado) | [doc 21 §3.6] | M | ⚖️ armazenamento temporário de áudio só com consentimento |
| F43 | Espelho local | Câmera frontal só como espelho, sem análise, sem gravação; opt-in do adulto | [doc 10 §3.2; doc 05 §6.6] | P | Permissão de câmera em apps infantis (lojas) |
| F44 | Pausas ativas da Sofia | 20–90 s com função fonológica ("pula quando ouvir /p/") | [doc 09 §3.3; doc 14 §3.3] | P | — |
| F45 | Canções e parlendas | Canção por fonema, "Bate a Sílaba", parlendas de domínio público | [doc 14 §3.2] | M | Direitos musicais (preferir domínio público ou produção própria) |
| F46 | Trilha "Recomeço" (8+) | Mesmo núcleo fônico com estética "mais velha" | [doc 14 §3.1] | M | Infantilização |
| F47 | Importação de turmas e PDF | CSV/planilha, QR em lote, relatórios em PDF | [doc 24 §3.4] | P | — |
| F48 | Biblioteca ampliada (100+) | Conjuntos temáticos e textos ricos para escuta (vocabulário de camada 2) | [doc 25 §3.1c, §3.3] | G | Produção editorial |

### 4.3 V2 — "Could have" (6–12 meses)

| ID | Funcionalidade | Descrição | Evidência | Comp. | Risco |
|---|---|---|---|---|---|
| F50 | Dica articulatória por câmera | MediaPipe Face Landmarker, blendshapes por grupo visível (/p b m/, /f v/, /a/, /o u/, /ʃ ʒ/), calibração neutra, só local, só "dica" | [doc 03 §5, §10] | G | Sem evidência de ganho de aprendizagem [doc 10 §3.2]; ⚖️ imagem de criança. Fazer A/B antes de escalar |
| F51 | Pipeline de histórias com LLM | Rascunho por LLM → linter → filtros → revisão humana → publicação estática; o professor pede tema local | [doc 21 §3.4; doc 25 §3.1] | G | Qualidade e estereótipos; nunca ao vivo para a criança |
| F52 | Estúdio de Histórias | A criança monta frases com palavras dominadas e grava a própria voz | [doc 04 #32] | M | ⚖️ gravação da voz da criança (local; compartilhar só com a família) |
| F53 | Mundo da cursiva | Traçado cursivo como região própria, configurável pela escola | [doc 04 §5.2; doc 02 EF02LP07] | M | Debate pedagógico |
| F54 | Rubrica de prosódia (experimental) | Pausa em pontuação, entonação de pergunta | [doc 25 §3.2] | G | Experimental: não mostrar à família |
| F55 | Assistente do professor (LLM, lado adulto) | Resumo da turma, rascunho de devolutiva para a família; dados pseudonimizados | [doc 21 §3.1, §3.6] | M | Alucinação; ⚖️ dados no prompt |
| F56 | Libras e CAA | Vídeos em Libras nas instruções-chave; resposta por pictogramas; importar prancha de CAA | [doc 05 §4; doc 24 §3.7] | G | Produção com intérpretes surdos |
| F57 | Pacotes regionais | Cenários e histórias de fundo (sertão, Amazônia, litoral, periferia, sul), sotaque neutro por padrão | [doc 23 §3.1] | M | Estereótipo; revisão de diversidade |
| F58 | Integração com redes | SSO institucional, exportação para sistemas de gestão escolar das redes | [doc 20 §3.8] | G | Heterogeneidade dos sistemas |
| F59 | Publicação aberta da acurácia do ASR infantil pt-BR | Relatório técnico e benchmark | [doc 21 §3.8; doc 22] | M | Expor fraquezas (mas gera credibilidade) |

### 4.4 Futuro (pesquisa ou dependente de dados)

| ID | Funcionalidade | Por que esperar | Evidência |
|---|---|---|---|
| F70 | Agendador FSRS/HLR treinado com dados próprios | Precisa de milhares de crianças-mês; A/B com retenção em 30 dias | [doc 07 §3.2E] |
| F71 | DKT/transformers para risco e ordem ótima | O Elo segue como camada interpretável | [doc 20 §3.4] |
| F72 | Ancoragem psicométrica à escala Saeb (itens de ligação, TRI) | Exige parceria e dados | [doc 20 §3.8] |
| F73 | Perguntas dialógicas com LLM **classificando** respostas orais | Só respostas pré-aprovadas e com estudo | [doc 21 §3.3] |
| F74 | Diagnóstico automático de erro fonêmico (MDD) em pares mínimos | Tecnologia ainda em pesquisa com voz infantil | [doc 03 §10.1; doc 22 §2.5] |
| F75 | Trilha EJA (jovens e adultos) | Mesmo núcleo, outra estética | [doc 06 §3E] |
| F76 | Estudo de efeito randomizado e pré-registrado | Base para B2G | [doc 21 §3.8; doc 04 §6, item 7] |

### 4.5 "Won't" — lista vermelha permanente

Não entra em nenhuma versão:
- anúncios e SDKs de terceiros no app infantil;
- loot boxes, baús e sorteios;
- moedas compráveis e loja para a criança;
- vidas, "game over" e cronômetros de pressão;
- streak que zera e push para a criança;
- Sofia triste ou carente;
- autoplay e "só mais uma";
- ranking entre crianças;
- chat livre com LLM;
- TTS ao vivo para fonemas isolados;
- inferência de emoção por câmera;
- reconhecimento facial e voiceprint;
- uso do sinal de risco para vender plano.

Fontes: [doc 04 §4.3; doc 08 §3.5; doc 21 §3.2; doc 23 §3.9; doc 05 §6.6–§7].

### 4.6 Ordem sugerida de épicos (para o backlog)

1. **Fundação:** F01, F02, F04, F20, F23 (dados, contas, consentimento, offline).
2. **Núcleo da criança:** F03, F06, F07, F09, F10, F11, F13, F14, F18, F19.
3. **Motor:** F05, F08, F15.
4. **Conteúdo:** F12 (jogos em motor parametrizável), F16, F17.
5. **Adultos:** F21, F22.
6. **Fala:** F24, F25 → F30, F31, F32.
7. **Expansão:** os demais itens da V1, em seguida a V2.

**Critério de "pronto" de cada jogo:** passa no checklist de tela [doc 09 §3.1], tem alternativa de toque e sem fala, declara a evidência gerada (ECD) e o peso [doc 20 §3.1] e passa no protocolo de teste com crianças (≥ 80% de sucesso sem ajuda, < 15% de toques fora do alvo) [doc 24 §3.9].

---
## 5. Catálogo de jogos e atividades (42 + 5 transversais)

**Fases do FONEMA:** (1) consciência fonológica → (2) letra-som → (3) sílabas → (4) palavras → (5) frases → (6) textos decodificáveis → (7) fluência e compreensão → (8) escrita.

A sequência de conteúdo segue a ordem de ensino do doc 02, em 11 etapas (0–10): vogais → contínuas M L F V S N → oclusivas P T B D, com separação no tempo → J Z X CH NH LH → contextuais → nasais → CVC → CCV → arbitrárias → fluência [doc 02 §5.5]. Quando uma mecânica é a mesma do catálogo do doc 04, a referência aparece como "d04#n".

**Colunas:**
- **Voz/câm.** 🔊 = só ouve; 🎤 = usa microfone (sempre com alternativa por toque); 📷 = câmera opcional.
- **Adaptações:** **TEA** (previsibilidade, sensorial, compreensão literal), **TDAH** (blocos curtos, feedback < 300 ms, movimento), **DIS** (dislexia: mais repetição, espaçamento, sem pressa) [doc 05 §4; doc 07 §3.2D; doc 11 §3.3; doc 12 §3].

**Regras globais de todos os jogos:**
- sem tempo-limite;
- arrastar ⇄ toque-toque;
- fala ⇄ toque;
- 2–3 alternativas aos 4–5 anos e 3–4 aos 6–8;
- erro tratado como pista;
- celebração depois da resposta.

[doc 09 §3.1; doc 24 §3.1–3.6]

### Fase 1 — Consciência fonológica (oral, sem letras)

| # | Nome | Mecânica | Habilidade fônica / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 1 | **Rima ou Não Rima?** (d04#1) | Dois objetos aparecem e a criança puxa para a cesta "par" ou "não par" | rima; EI03EF02, EF01LP13, EF12LP19 | 🔊 | TEA: objetos concretos e literais, sem trocadilho · TDAH: série de 5 itens com baú visível no fim · DIS: rimas com contraste máximo primeiro, depois as próximas |
| 2 | **Bate a Sílaba** (d04#2 + doc 14) | A Sofia canta a palavra sobre uma batida estável; a criança toca o tambor 1× por sílaba. A sincronia é registrada como dado de triagem rítmica, **não** como nota | segmentação silábica; EF01LP06 | 🔊 (🎤 opcional: falar silabando) | TEA: batida sem sons súbitos e volume moderado · TDAH: versão "pula/bate o pé" com o corpo · DIS: módulo extra de ritmo [doc 14 §3.2] |
| 3 | **Caça ao Primeiro Som** (d04#3) | Cenário de esconde-esconde: "ache tudo que começa com /mmm/" | fonema inicial; EF01LP09, EF01LP07 | 🔊 | TEA: cenário fixo e anunciado · TDAH: 3 objetos por rodada · DIS: fonemas contínuos alongados, uma consoante por vez |
| 4 | **Termina Igual?** | Dois trens chegam; a criança decide se o último vagão (sílaba final) "faz o mesmo som" | sílaba final/medial; EF01LP13 | 🔊 | TEA: pergunta sempre igual · TDAH: feedback imediato · DIS: começar com sílabas longas e contrastantes |
| 5 | **A Sílaba Sumiu** | O Bolota "come" uma sílaba (SAPATO → PATO) e a criança escolhe a figura que sobrou | supressão/substituição silábica; EF02LP02 | 🔊 | TEA: animação de "comer" suave, sem susto · TDAH: humor curto · DIS: só supressão inicial no começo |
| 6 | **Robô Fala-Picado** | O robozinho fala /g/…/a/…/t/…/o/ e a criança toca a figura certa (síntese oral) | síntese fonêmica oral; EF01LP05/07 | 🔊 | TEA: voz do robô calma e não metálica · TDAH: 3 opções · DIS: 2–3 fonemas primeiro, depois 4 |
| 7 | **Cantiga Completa** | Parlenda de domínio público com rima faltando; a criança toca a figura que completa a rima ou canta junto | rima e prosódia; EI03EF02, EF12LP19 | 🔊 🎤 opcional | TEA: música opcional e letra visível (legenda) · TDAH: canção curta (≤ 30 s) · DIS: repetir 3× com eco |

### Fase 2 — Letra-som (grafema ↔ fonema)

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 8 | **Boquinha no Espelho** (d04#8, W4) | Vídeo da boca real + vista lateral + letra; a criança imita olhando no espelho local; pares mínimos lado a lado com 🖐 na garganta | articulação + CGF; EF01LP07 | 🔊 🎤 📷 (espelho, opt-in) | TEA: opção de Sofia sem rosto / só vídeo, sem contato visual forçado [doc 12 §3.1] · TDAH: vídeo de 3–5 s · DIS: padrão na introdução e em toda correção [doc 10 §3.1] |
| 9 | **Alimente o Bolota** (d04#4) | O Bolota pede um som; a criança leva a letra até a boca dele (arrastar ou toque-toque) | som → letra; EF01LP07, EF01LP08 | 🔊 | TEA: o Bolota mastiga sem barulho súbito · TDAH: rodadas de 5 · DIS: só 2 letras visualmente distintas no início (nada de b/d juntos) [doc 06 §3A] |
| 10 | **Memória Som-Letra** (d04#6) | Jogo da memória: um lado tem o ícone de som, o outro a letra | CGF; EF01LP08 | 🔊 | TEA: 4–6 cartas, posição fixa · TDAH: 3 pares · DIS: o par é dito em voz alta ao virar |
| 11 | **Balões de Letras** (d04#5) | Balões sobem devagar; estourar os do som pedido. **Sem cronômetro**: os balões voltam | reconhecimento rápido; automaticidade | 🔊 | TEA: estouro sem som alto (som "pop" suave) · TDAH: ótimo como jogo de ação · DIS: velocidade adaptativa e latência registrada nos bastidores |
| 12 | **Traço Mágico** (d04#7) | Ver o traçado animado → traçar com guia → traçar livre → reconhecer entre distratores; a Sofia diz o **som** enquanto a criança traça | grafia + CGF; EF01LP11 | 🔊 | TEA: setas e ordem sempre iguais · TDAH: 1 letra por rodada · DIS: letras espelhadas com âncora ("barriga pra frente"), traçado em partes aceito [doc 24 §3.2; doc 10 §3.4] |
| 13 | **É Letra ou Não É?** | Separar letras de números, símbolos e desenhos | EF01LP04 | 🔊 | TEA: regra explícita · TDAH: rápido e curto · DIS: aceita para 4–5 anos |
| 14 | **Barriga pra Frente** | Escolher qual b/d/p/q está "virado certo" e completar a palavra-âncora (b de BOLA) | discriminação de orientação; EF01LP07 | 🔊 | TEA: regra visual fixa · TDAH: 3 itens · DIS: introduzir **b** e só semanas depois **d** [doc 06 §3A, item 5] |
| 15 | **Nome ou Som?** | Dois botões, "nome da letra" (bê) e "som da letra" (/b/); a Sofia pergunta "o nome começa com o som?" | princípio acrofônico; EF01LP10, EF02LP06 | 🔊 | TEA: distinção nome/som sempre com os mesmos ícones [doc 02 §7.3, item 13] · TDAH: curto · DIS: ênfase no som |

### Fase 3 — Sílabas (síntese e decodificação silábica)

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 16 | **Fábrica de Sílabas** (d04#9, W5) | Esteira junta consoante + vogal; a máquina "cospe" MA e toca o som da fusão | síntese CV; EF02LP04, EF01LP08 | 🔊 🎤 opcional (ler a sílaba) | TEA: máquina previsível, sempre igual · TDAH: a máquina pode "acelerar" (variação do *quê*, não do *como*) · DIS: começar com contínuas (M, L, F, S) [doc 02 §5.5] |
| 17 | **Escorregador de Sons** (d04#11) | Letras no escorregador; ao deslizar o dedo, os sons se fundem ("sssooool") | blending contínuo | 🔊 | TEA: movimento lento · TDAH: usa o corpo (dedo) · DIS: excelente para fusão com som prolongado |
| 18 | **Ouça e Toque** (d04#12) | A Sofia diz a sílaba e a criança toca entre 2–4 opções (dificuldade adaptativa, estilo GraphoGame) | discriminação sílaba → escrita | 🔊 | TEA: layout fixo · TDAH: feedback < 300 ms · DIS: distratores fonologicamente distantes primeiro, depois pares mínimos |
| 19 | **Trem das Sílabas** (d04#10) | Montar os vagões na ordem para formar a palavra; o trem lê ao partir | sequência silábica; EF02LP04 | 🔊 | TEA: 2–3 vagões, sempre da esquerda para a direita (EF01LP01) · TDAH: partida curta como prêmio · DIS: vagões com cor de vogal (muleta removida aos poucos) [doc 04 §5.1] |
| 20 | **Planeta das Palavras de Mentirinha** | Um alienígena do "planeta da Sofia" fala palavras inventadas (FAPO, LUPI); a criança lê ou escolhe a escrita | decodificação pura (pseudopalavras) | 🔊 🎤 | TEA: explicar a regra "palavra de mentirinha não tem significado" · TDAH: personagem engraçado · DIS: medir sem pressa. Sempre fonotáticas e revisadas por fono [doc 20 §3.6] |

### Fase 4 — Palavras

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 21 | **Monta-Palavra com Silhueta** (d04#13) | O sagui espalhou as letras; recolocar nas silhuetas; a palavra é lida com animação | decodificação/codificação; EF01LP02, EF12LP01 | 🔊 | TEA: "travessura" anunciada, sem susto · TDAH: palavras curtas · DIS: silhueta mostra o formato e as letras ficam espaçadas |
| 22 | **Palavra Viva** (d04#14) | Ao ler GATO, o gato ganha vida no cenário (a leitura é a recompensa, P1) | significado; EF12LP01 | 🔊 🎤 | TEA: animação congruente e curta · TDAH: recompensa funcional imediata · DIS: leitura em eco permitida |
| 23 | **Troca-Letra Mágica** (d04#16) | Trocar 1 letra transforma o objeto: PATO → GATO → GALO | consciência fonêmica, substituição; EF02LP02/03 | 🔊 | TEA: cadeia sempre visível · TDAH: "mágica" rápida · DIS: só trocas na posição inicial no começo |
| 24 | **Lojinha de Palavras** (d04#18) | Atender clientes: ler o pedido escrito e entregar o objeto (faz de conta) | leitura funcional | 🔊 🎤 | TEA: cliente com fala literal e sem ironia · TDAH: fila de 3 clientes · DIS: pedido tocável para ouvir **depois** de tentar ler |
| 25 | **O Bolota Leu Errado** | O Bolota lê com erro planejado (BATO por PATO); a criança corrige tocando, falando ou arrastando; o Bolota agradece e anota no caderninho | pares mínimos, espelhamento, omissão; efeito protegido | 🔊 🎤 | TEA: erro sinalizado de forma explícita ("o Bolota trocou um som!") · TDAH: alto engajamento · DIS: erros só no que a criança já domina [doc 23 §3.7] |
| 26 | **Caça-Palavras Falado** (d04#15) | A Sofia diz a palavra e a criança acha na grade pequena (3×3 a 4×4, letra grande) | leitura de palavras | 🔊 | TEA: grade fixa · TDAH: 2 palavras por grade · DIS: grade 3×3, espaçamento ampliado |
| 27 | **Fala Rápido (RAN)** | Nomear uma grade de 5 itens repetidos (cores/objetos; depois letras). O app cronometra **nos bastidores** e registra hesitações | RAN: sinal de risco, não define fase [doc 20 §3.3; doc 11 §3.2] | 🎤 (alternativa: o adulto marca) | TEA: aceita prosódia atípica · TDAH: curto (~1 min) · DIS: é um indicador. Sem feedback de velocidade para a criança. Para TDL/apraxia, não usar como sinal [doc 05 §7] |

### Fase 5 — Frases

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 28 | **Frase-Quebra-Cabeça** (d04#22) | Ordenar palavras para formar uma frase que vira cena animada | sintaxe, leitura de frase; EF01LP01 | 🔊 | TEA: frases concretas · TDAH: 3–4 palavras · DIS: palavras grandes e bem separadas |
| 29 | **Verdadeiro ou Bobagem?** (d04#23) | Ler "O PEIXE VOA" e decidir se é verdade (humor) | compreensão literal | 🔊 | TEA: **atenção ao humor absurdo**; oferecer a versão "certo/errado" sem piada · TDAH: risada como recompensa · DIS: frase tocável depois da tentativa |
| 30 | **Separa as Palavras** | Frase colada (OMENINOCORRE); a criança toca onde vai o espaço; também conserta "derepente" e "a gora" | segmentação; EF01LP12, EF02LP08 | 🔊 | TEA: regra explícita do espaço · TDAH: 1 frase por vez · DIS: destaque de sílabas como apoio |
| 31 | **Frase-Ação** | Ler a frase e fazer a ação na cena ("o gato pula na caixa") | compreensão de frase | 🔊 | TEA: checagem de significado ao fim de cada unidade [doc 12 §3.1] · TDAH: interativo · DIS: frase curta |

### Fase 6 — Textos decodificáveis

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 32 | **Livrinho Decodificável Interativo** (d04#21) | História só com as CGF já ensinadas (linter ≥ 95% em F1–F2); a palavra tocada é lida; a cena anima **ao terminar**; sem hotspots | decodificação em contexto; EF12LP01 | 🔊 🎤 | TEA: temas de interesse cadastrados · TDAH: 4–6 páginas · DIS: poucas palavras por linha e espaçamento ampliado [doc 11 §3.3] |
| 33 | **Lê pro Bolota Dormir** | A criança lê o livrinho em voz alta para o Bolota; o app escuta, marca acertos e ajuda gentilmente; o Bolota adormece no fim | leitura oral (fluência inicial) | 🎤 (alternativa: adulto confirma) | TEA: rotina idêntica · TDAH: páginas curtas · DIS: tolerante à hesitação, sem tempo [doc 05 §4] |
| 34 | **Leitura com a Família** (d04#30) | Revezamento: adulto lê uma página, a criança lê a próxima; perguntas CROWD aparecem **para o adulto** | mediação adulta, leitura dialógica | 🔊 | TEA: perguntas literais primeiro · TDAH: turnos curtos · DIS: o adulto lê mais no início |

### Fase 7 — Fluência e compreensão

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 35 | **Karaokê da Sofia** (d04#19 + doc 25 §3.2) | 4 passos: ouvir com destaque → eco/coral → ler sozinho (destaque segue a criança) → reler até o critério (máx. 3–4 releituras) | fluência (PCPM, precisão); EF12LP01 | 🔊 🎤 | TEA: velocidade da voz ajustável · TDAH: micro-checagens ("toque em BOLA") contra escuta passiva · DIS: destaque por **sílaba** opcional; metas pessoais |
| 36 | **Detetive do Texto** (d04#24) | Depois da história, achar no texto a palavra que responde a pergunta | compreensão literal/inferencial | 🔊 | TEA: perguntas literais antes das de estado mental [doc 12 §3.1] · TDAH: 3 perguntas · DIS: texto ouvível depois da tentativa |
| 37 | **Reconto com Figuras** | Ordenar 3–4 cenas e recontar em voz alta (gravação local) com o organizador "quem, onde, problema, solução" | reconto; EI03EF04, compreensão | 🎤 opcional | TEA: organizador gráfico fixo · TDAH: 3 cenas · DIS: sem leitura exigida |
| 38 | **Palavra Curiosa** | Em textos de **escuta**: 3–5 palavras de camada 2 com definição amigável, imagem e 2 contextos; reaparecem com espaçamento | vocabulário [doc 25 §3.3] | 🔊 | TEA: definições literais · TDAH: 1 palavra por vez · DIS: acesso por áudio |

### Fase 8 — Escrita

| # | Nome | Mecânica | Habilidade / BNCC | Voz/câm. | Adaptações TEA / TDAH / DIS |
|---|---|---|---|---|---|
| 39 | **Ditado do Bolota** (d04#17) | O Bolota "fala" uma palavra e a criança escreve com letras móveis (F1–F2) ou teclado grande (depois). Os erros são classificados (Morais) | codificação; EF01LP02, EF02LP03–05 | 🔊 | TEA: repetição a pedido · TDAH: 3 palavras · DIS: letras móveis espaçadas; ouvir de novo ilimitado |
| 40 | **Escrevo do Meu Jeito** | Escrita inventada; o sistema mostra uma grafia **um passo mais avançada** e compara com a da Sofia, sem "errado" | EI03EF09, EF01LP03 | 🔊 | TEA: comparação lado a lado e explícita · TDAH: curto · DIS: celebra o progresso de hipótese |
| 41 | **Estúdio de Histórias** (d04#32) | Escolher cenário e personagens, montar frases com palavras dominadas e gravar a própria leitura (local) | produção; EF02LP01, EI03EF06 | 🎤 | TEA: modelos de frase · TDAH: liberdade criativa · DIS: banco de palavras clicável |
| 42 | **Bilhete pra Família** | Montar um bilhete ou convite curto (função social) e enviar para a área do responsável | escrita com função social (o padrão 743 inclui "escrever bilhetes ou convites simples" [doc 02 §3.3]) | 🔊 | TEA: modelo fixo de bilhete · TDAH: 1 frase · DIS: frase com palavras já dominadas |

### Mecânicas transversais (estrutura, motivação e avaliação)

| # | Nome | O que faz | Evidência |
|---|---|---|---|
| T1 | **Mundo/Mapa de regiões** | Estrutura de progressão por família de sons | d04#28; [doc 24 §3.3] |
| T2 | **Jardim da Revisão** | Repetição espaçada visível; regar = minirrevisão de 1 min; nunca morre | d04#29; [doc 07] |
| T3 | **Álbum de figurinhas que falam** | Um som dominado = uma figurinha | d04#26; [doc 08 §3.4] |
| T4 | **Desafio da Sofia / Mini-chefão de região** | Provinha lúdica; a "nuvem bagunceira" apagou as letras e a criança restaura lendo; falhar só dá nova chance | d04#25, d04#31; [doc 20 §3.6; doc 13 §3.5] |
| T5 | **Parceiro que evolui** | O Bolota ganha acessórios por **marcos de leitura**, nunca por tempo | d04#27; [doc 08 §3.4] |

**MVP:** os 14 jogos de F12 cobrem as fases 1 a 6. A escrita (fase 8) entra pela codificação do #21 (Monta-Palavra). A fluência (fase 7) chega na V1, com o Karaokê (F31). O #8 (Boquinha) entra como parte da lição (F11) e o #12 (Traço Mágico) na V1 (F35).

---
## 6. Design system inicial — "Quintal"

> Nome provisório. O nome remete a um lugar seguro, brasileiro, de brincar e de aprender, sem apelo de princesa ou tecnologia fria. Este design system cobre a área infantil (app/web em paisagem) e a área adulta (portais e área do responsável).

### 6.1 Princípios (com evidência)

1. **Um foco por tela.** Uma letra, sílaba ou palavra-alvo por vez, centralizada e grande. Fundo calmo [doc 09 §3.1].
2. **O que é tocável se destaca do fundo.** Fundos claros dessaturados, elementos interativos saturados e com contorno [doc 04 §5.1].
3. **A Sofia é o menu falado.** Na área infantil, nada de texto de navegação. Todo alvo fala ao ser tocado (o som, não o nome da letra) [doc 24 §3.3].
4. **Animação só quando ensina:** boca articulando, letras deslizando para fundir, segmentação. Nunca decoração durante a decodificação [doc 09 §3.2].
5. **Erro é pista, não drama:** sem vermelho, sem X, sem buzina, sem tremor de tela [doc 13 §3.1].
6. **Previsível nas regras, surpreendente no conteúdo** [doc 08 P3]. Mesmos ícones, posições e gestos em todas as fases, o que economiza memória de trabalho [doc 09 §3.4].
7. **Ajustável por padrão:** o usuário (adulto) manda nos estímulos. Modos calmo e alto contraste são cidadãos de primeira classe [doc 05 §2.4].
8. **Leve:** feito para Android de entrada, offline, com pacotes pequenos [doc 24 §3.8].
9. **Brasileiro e plural, sem estereótipo:** cenários de feira, quintal, praia, mata e bairro; Sofia parda, de cabelo cacheado; elenco diverso [doc 23 §3.1; doc 04 §5.1].
10. **Ético por design:** nenhum componente de loja, timer de pressão ou streak existe na biblioteca da área infantil. Se não existe no design system, não entra no produto.

### 6.2 Paleta (HEX) e contraste calculado (WCAG 2.x)

Base quente e acolhedora, com fundo creme. As razões abaixo foram **calculadas**. Os pares de texto atingem ≥ 4,5:1 (AA para texto normal). As cores decorativas (marcadas) não devem levar texto.

**Neutros e base**

| Token | HEX | Uso | Contraste medido |
|---|---|---|---|
| `color.bg.papel` | `#FFF8EC` | fundo padrão (creme) | — |
| `color.bg.superficie` | `#FFFFFF` | cartões, peças de letra | — |
| `color.text.tinta` | `#1F2A44` | texto principal, letras-alvo | 13,5:1 sobre papel; 14,26:1 sobre branco |
| `color.text.suave` | `#4A5568` | texto secundário (área adulta) | 7,13:1 sobre papel |
| `color.text.apoio` | `#6B7280` | legenda/rodapé (adulto) | 4,83:1 sobre branco |
| `color.border.inativo` | `#8A94A6` | **só contorno/decorativo** | 2,90:1 sobre papel (< 3:1: não usar para informação) |

**Cores de marca e ação**

| Token | HEX | Uso | Contraste medido |
|---|---|---|---|
| `color.acao.ceu` (primária) | `#1E5FD6` | botões principais, foco, links adultos | branco sobre ela: 5,73:1; ela sobre papel: 5,43:1 |
| `color.marca.urucum` (Sofia/coral) | `#C4452F` | destaques da marca, camiseta da Sofia | branco sobre ela: 4,95:1; ela sobre papel: 4,69:1 |
| `color.acerto.mata` | `#1F7A4D` | acerto e "dominado" (sempre com ícone ✔) | branco sobre ela: 5,32:1; ela sobre papel: 5,04:1 |
| `color.alerta.caju` | `#C2410C` | atenção (área adulta), com ícone ◆ | branco sobre ela: 5,18:1; ela sobre papel: 4,90:1 |
| `color.acento.jabuticaba` | `#6B3FA0` | itens especiais (ponte/desafio, histórias) | branco sobre ela: 7,38:1 |
| `color.acento.ipe` | `#F5B700` | **decorativo/fundo de destaque** (estrelas, brilho) | tinta sobre ipê: 7,91:1 ✔; ipê sobre papel: 1,71:1 ✘ (nunca texto amarelo) |
| `color.acento.urucum.claro` | `#E2553F` | decorativo (ilustração) | 3,55:1 sobre papel: só texto **grande** (≥ 24 px) ou forma |

**Codificação pedagógica (opcional, proposta a validar)** [doc 04 §5.1]
- `color.letra.vogal` = `#B8322A` (5,64:1 sobre papel; 5,95:1 sobre branco).
- `color.letra.consoante` = `#1F2A44` (tinta).
- Sempre **redundante**: vogal também com sublinhado ondulado. Removida aos poucos para não virar muleta.

**Escala do mapa de calor** (1 matiz, segura para daltonismo, com ícone e rótulo)

| Estado | Token | Fundo | Texto na célula | Contraste do texto | Ícone/textura |
|---|---|---|---|---|---|
| não iniciado | `heat.0` | `#EEF3FA` | tinta | 12,79:1 | vazio |
| adquirindo | `heat.1` | `#C6DBF3` | tinta | 10,07:1 | ponto · |
| consolidando | `heat.2` | `#5B95DD` | tinta | 4,61:1 | hachura ╱ |
| dominado | `heat.3` | `#2E6BC0` | branco | 5,28:1 | ✔ |
| automatizado | `heat.4` | `#0B3A75` | branco | 11,19:1 | ✔✔ |
| precisa de apoio (marcador) | `heat.flag` | contorno `#C2410C` 2 px | — | — | ⚑ |

> As células claras (`heat.0` e `heat.1`) têm baixo contraste com o fundo branco (`#C6DBF3`/branco = 1,42:1). Por isso a grade precisa de **contorno de 1 px `#8A94A6`** entre as células, e os estados são distinguidos também por ícone (WCAG 1.4.11 / 1.4.1).

**Faixas de risco** (sempre com forma)
- no alvo `#0F766E` ● (branco 5,47:1);
- atenção `#B45309` ◆ (branco 5,02:1);
- intervenção intensiva `#9D174D` ▲ (branco 7,88:1).

Não usar o par vermelho/verde.

**Modo calmo** (baixa saturação [doc 12 §3.1]): fundo `#F4F1EA`, texto `#2E3A4F` (10,15:1), primária `#4F6D8A` (branco sobre ela: 5,40:1; ela sobre o fundo: 4,79:1). Sem `ipe` e sem `urucum.claro`. Celebração apenas com forma.

**Modo alto contraste:** fundo `#FFFFFF` com texto `#000000` (21:1), ou fundo `#000000` com destaque/foco `#FFD400` (14,67:1). Contorno de 3 px em todos os alvos.

### 6.3 Tipografia

| Papel | Fonte (livre) | Repositório / licença | Uso |
|---|---|---|---|
| **Conteúdo de leitura** (letras, sílabas, palavras, livrinhos) | **Andika** | [silnrsi/font-andika](https://github.com/silnrsi/font-andika) — OFL-1.1, ~86 ⭐, feita para alfabetização | "a" e "g" de um andar; I/l/1 distintos [doc 03 §7.1; doc 24 §3.1] |
| Alternativa de leitura (configurável) | **Lexend** | [googlefonts/lexend](https://github.com/googlefonts/lexend) — OFL-1.1, ~322 ⭐ | opção no perfil, **sem promessa terapêutica** [doc 05 §5] |
| Opção estética | **OpenDyslexic** | OFL-1.1 [doc 03 §7.1] | apenas se a família preferir; a evidência de eficácia é discutida [doc 11 §3.3] |
| **Interface adulta** (portais, relatórios, gráficos) | **Atkinson Hyperlegible** | [googlefonts/atkinson-hyperlegible](https://github.com/googlefonts/atkinson-hyperlegible) — OFL-1.1, ~326 ⭐ | alta legibilidade para adultos com baixa escolaridade ou baixa visão. Conferir algarismos tabulares nas tabelas; se faltarem, usar Andika ou Lexend nos números |
| Títulos lúdicos (marca) | a definir no branding | — | **nunca** nas letras-alvo |

**Letra bastão primeiro:** a trilha principal começa em **caixa alta**. O par maiúscula/minúscula aparece a partir das sílabas, no "modo descobrir", e a cursiva é um mundo próprio (V2) [doc 04 §5.2; doc 25 §3.4]. A minúscula de imprensa vem logo, porque é a que aparece nos textos.

**Escala (área infantil; sp/px)**

| Token | Tamanho | Altura de linha | Espaçamento entre letras | Uso |
|---|---|---|---|---|
| `type.alvo.letra` | 72 | 1,0 | +0,04 em | letra isolada (mín. 48) [doc 24 §3.1] |
| `type.alvo.silaba` | 64 | 1,0 | +0,06 em | sílaba |
| `type.alvo.palavra` | 48 | 1,1 | +0,06 em | palavra |
| `type.frase` | 40 | 1,5 | +0,04 em; palavra +0,3 em | frases |
| `type.livro` | 32–36 | 1,6 | +0,04 em | livrinhos (≤ 7 palavras por linha) |
| `type.reforco` (modo) | +15% | 1,8 | +0,12 em; palavra +0,5 em | modo reforço/dislexia: espaçamento importa mais que a fonte [doc 04 §5.2; doc 11 §3.3] |
| `type.legenda` | 20 | 1,4 | 0 | legendas das falas da Sofia |

**Escala adulta:** 14 (rodapé) · 16 (corpo) · 20 · 24 · 32, com altura de linha 1,5 e alvo de toque de 48 dp.

### 6.4 Grid, tamanhos de toque e layout

Unidade base de **8 dp**. Valores de toque do [doc 24 §3.1]:

| Elemento | Mín. | Recomendado |
|---|---|---|
| Botão principal (ouvir, próximo, resposta) | 96 dp | 112–128 dp |
| Alternativa de resposta | 88 dp | 120 dp+ |
| Ícone de navegação infantil (topo) | 72 dp | 80 dp |
| Espaço entre alvos | 16 dp | 24 dp |
| Área tocável além da arte | +8–12 dp | — |
| Ímã de encaixe (arrastar) | raio 48 dp | — |
| Corredor de traçado | 40 dp | — |
| Faixa inferior sem alvos | 48 dp | 64 dp |
| Porteira adulta | 48 dp | — |

**Layout da tela infantil (paisagem, rotação travada nas atividades):**
```
┌────────────────────────────────────────────────────────────┐
│ ZONA TOPO 80dp: [👂 ouvir] (esq., fixo)   [🏠/🚪]   [🔒] (dir.)│
├────────────────────────────────────────────────────────────┤
│ ZONA SOFIA (≤ 25% da largura)  │  PALCO (alvo único, centro) │
│ fica parada enquanto a criança │                             │
│ pensa                          │                             │
├────────────────────────────────────────────────────────────┤
│ ZONA DE RESPOSTA: 2–4 alternativas, 88–128 dp, gap 24 dp     │
├────────────────────────────────────────────────────────────┤
│ FAIXA MORTA 48–64 dp (apoio da palma)                        │
└────────────────────────────────────────────────────────────┘
```
- Em celular < 5,5": **reduzir o nº de alternativas, nunca o tamanho** [doc 24 §3.1].
- Margem lateral de 24 dp.
- Barras fixas não cobrem o foco (WCAG 2.4.11) [doc 05 §2.2].

**Área adulta:** grade de 12 colunas na web (breakpoints 360/768/1024/1440) e 4 colunas no celular. O painel do professor é otimizado para notebook/desktop e tablet em paisagem.

### 6.5 Componentes

**Área infantil** (pacote `packages/ui-kids`)

| Componente | Variantes/estados | Regras |
|---|---|---|
| `BotaoOuvir` (👂) | normal, tocando, desativado durante a fala | fixo no canto superior esquerdo; repete a última instrução [doc 24 §3.3] |
| `BotaoGrande` | primário, secundário, confirmação ✔ / cancelar ✖ | escala 0,95 no toque em < 100 ms; fala ao tocar |
| `PecaLetra` / `PecaSilaba` | repouso, tocada, arrastando, encaixada, dica (pulsa), desabilitada | som do fonema ao tocar; arrastar ⇄ toque-toque |
| `AlvoEncaixe` (silhueta, vagão, boca do Bolota) | vazio, realçado (peça próxima), preenchido | ímã ≥ 48 dp |
| `CartaFigura` | frente, verso, virando | imagem + palavra falada |
| `TrilhoTraçado` | demonstração, guia, livre, concluído | setas animadas; tolerância; aceita partes |
| `Microfone` | inativo, ouvindo (onda visível), processando, "não ouvi" | indicador visível de escuta; a criança controla [doc 05 §6.6] |
| `Sofia` (Rive) | idle, falando (visemas), apontando, ouvindo, pensando, comemorando, bocejo | sem animação de fundo durante a tarefa; nunca triste [doc 23 §3.5] |
| `Bolota` (Rive) | observando, errando, agradecendo, dormindo | erros dentro do domínio da criança |
| `PlayerBoquinha` | frontal, lateral, par mínimo, lento | sincronia no nível de quadro [doc 10 §3.1] |
| `TextoLeitura` | normal, palavra tocada, destaque (palavra/sílaba), lida | destaque sincronizado; sem hotspots [doc 09 §3.4] |
| `BarraSessao` | ● ◐ ○ | sem relógio |
| `NoTrilha` | futuro (visível), do dia (brilha), conquistado, ponte | sem cadeado |
| `Figurinha`, `Planta` | silhueta/conquistada; "com sede"/regada | sem raridade; nunca morre |
| `TrilhaDaSessao` (TEA) | 4 ícones agora → depois | aviso 10 s antes da transição [doc 12 §3.1] |
| `ConfirmarSaida` | ✔ verde grande / ✖ grande + fala | evita saída acidental [doc 24 §3.3] |

**Área adulta** (pacote `packages/ui-adult`; na web, sobre [radix-ui/primitives](https://github.com/radix-ui/primitives), ~19,5k ⭐, MIT, para acessibilidade de menus, diálogos e abas)
- Cartões de resumo, `ChipHabilidade`, `CelulaCalor`, `BadgeRisco` (● ◆ ▲ + texto), `CartaoSinalAtencao` (texto padronizado);
- `PlayerLeitura` (fila de escuta), `TabelaEquivalente` (alternativa a todo gráfico);
- `Porteira` (segurar 3 s + tarefa escrita);
- `SeletorPreset`, `Slider` com rótulos, `Toggle` com texto.

**Ferramentas:**
- [Storybook](https://github.com/storybookjs/storybook) (~91,5k ⭐, MIT) para documentar e testar os componentes (inclui addon de acessibilidade);
- [Style Dictionary](https://github.com/style-dictionary/style-dictionary) (~4,9k ⭐, Apache-2.0) para gerar tokens em CSS, TS e RN a partir de um único JSON;
- [tokens-studio/sd-transforms](https://github.com/tokens-studio/sd-transforms) (MIT) se o design for feito no Figma com Tokens Studio.

Exemplo de token (fonte única):
```json
{
  "color": { "acao": { "ceu": { "value": "#1E5FD6" } },
             "bg": { "papel": { "value": "#FFF8EC" } } },
  "touch": { "primario": { "value": "112dp" }, "minimo": { "value": "96dp" } },
  "motion": { "toque": { "value": "100ms" }, "celebracao": { "value": "1500ms" } },
  "mode": { "calmo": { "bg": { "value": "#F4F1EA" } } }
}
```

### 6.6 Estados de feedback

Base: [doc 24 §3.6; doc 13 §3.6; doc 12 §3.2].

| Estado | Visual | Som | Háptico | Fala (exemplo) |
|---|---|---|---|---|
| Toque registrado | botão afunda (0,95) < 100 ms | clique suave | 10–20 ms (desligável) | o alvo diz o som |
| Acerto fácil | brilho curto (≤ 1,5 s) | som ascendente curto | 1 pulso | "Isso!" / "Leu certinho!" |
| Acerto difícil | brilho + gesto da Sofia | idem | 1 pulso | "Essa era difícil e você foi devagar!" |
| Autocorreção | brilho + ✔ | idem | — | "Você percebeu e arrumou sozinho!" |
| 1º erro | balanço leve da peça (sem X, sem vermelho) | neutro curto (sem buzina) | nenhum | "Quase! Olha a primeira letra de novo." |
| 2º erro | resposta certa pulsa + boquinha | — | nenhum | "Escuta: GA-TO. Agora você." |
| 3º erro | muda a estratégia (menos opções) | — | nenhum | "Vamos ler juntos? … Depois a gente treina mais." |
| ASR incerto | ícone do microfone com "?" | — | nenhum | "Não ouvi direitinho. Fala de novo?" |
| Inatividade | 5 s: Sofia aponta · 10 s: repete · 20 s: "vamos juntos?" | — | — | tempos configuráveis |
| Frustração detectada | Sofia oferece pausa | — | — | "Tá cansativo? Vamos fazer uma pausa rapidinha." |
| Carregando | Sofia faz algo engraçado e leve | — | — | — |
| Offline | nada na área infantil; nuvem "zzz" na área adulta | — | — | — |
| Fim da sessão | ritual (W6) | jingle curto | — | recapitulação + curiosidade |

No **modo calmo** e no **TEA**, a celebração fica "discreta" ou "neutra", sem confete. No **TDAH**, o feedback chega em < 300 ms em toda ação [doc 12 §3.2].

### 6.7 Animação e som

**Tokens de movimento** (heurísticas de design a calibrar com telemetria [doc 09 §3.3])

| Token | Valor | Regra |
|---|---|---|
| `motion.toque` | ≤ 100 ms | resposta visual imediata |
| `motion.audio.latencia` | ≤ 300 ms | áudio depois do toque |
| `motion.celebracao` | ≤ 1,5 s (micro); ≤ 2–3 s (fim de bloco) | sempre **depois** da resposta |
| `motion.transicao.cena` | ≥ 1 s, suave | sem cortes rápidos [doc 09 §3.2] |
| `motion.simultaneo.max` | 1 evento animado por vez durante a tarefa | — |
| `motion.flash` | nenhum (nunca > 3 flashes/s) | WCAG [doc 12 §3.1] |
| `motion.reduzido` | troca o movimento por fade/sem animação | segue `prefers-reduced-motion` e o toggle próprio |
| `easing.padrao` | ease-out suave; *squash & stretch* só em personagens | [doc 04 §5.1] |

**Som** (camadas e prioridades):
- **Voz da Sofia > som-alvo (fonema) > efeito > música.**
- Instruções 10–15% mais lentas que a fala adulta; velocidade ajustável de 0,75× a 1,25× [doc 23 §3.4; doc 05 §2.4].
- **Silêncio musical** em toda tarefa de discriminação fonológica e com o microfone aberto (*ducking* automático) [doc 09 §3.2; doc 04 §5.3].
- Música só em menu, abertura, canções e celebração.
- Fonemas isolados **gravados por humano**; TTS neural pré-renderizado para frases e histórias [doc 23 §3.4; doc 21 §3.2].
- Formatos: Opus/AAC mono de 32–48 kbps; sprites de áudio (Howler.js) [doc 24 §3.8; doc 03 §2].
- Volumes separados: voz, efeitos e música [doc 05 §2.4].
- Nenhum som súbito ou agudo no modo calmo/TEA [doc 12 §3.1].
- Banco de 15–30 variações por tipo de fala, contra a repetição robótica [doc 23 §3.4].

### 6.8 Modos

| Modo | Ativação | O que muda |
|---|---|---|
| **Padrão** | — | paleta quente, celebração média, música em menus |
| **Calmo** | 1 toque (W11) | sem música, animação mínima, cores suaves (§6.2), sem confete, ritmo lento [doc 05 §2.4] |
| **Alto contraste** | perfil visual | preto/branco ou preto/amarelo, contorno de 3 px, sem fundos ilustrados atrás do texto [doc 05 §4, baixa visão] |
| **Reforço de leitura** (dislexia, sem rótulo) | perfil/sugestão | `type.reforco`, poucas palavras por linha, fundo creme, mais repetições, sem tempo [doc 11 §3.3] |
| **Foco curto** (TDAH, sem rótulo) | perfil | blocos de 3–5 min, meta curta visível, pausa ativa, feedback < 300 ms [doc 12 §3.2] |
| **Previsível** (TEA, sem rótulo) | perfil | trilha da sessão, aviso de transição, sem surpresas, Sofia sem rosto (opcional), linguagem literal [doc 12 §3.1] |
| **Noturno** | horário (opcional) | após ~19h30, só "história para dormir" com adulto ou modo áudio [doc 14 §3.4; doc 07 §3.3] |

Quando TEA e TDAH estão ativos juntos, a **previsibilidade vence a novidade** [doc 12 §3.3].

### 6.9 Iconografia

- **Concretos, consistentes e falados** [doc 24 §3.3]:
  - 👂 ouvir de novo;
  - 🏠 casa/mapa;
  - 🚪 porta com seta (sair);
  - 🎤 microfone;
  - ⭐/baú de conquistas (sem loot);
  - 🌱 jardim;
  - 📒 álbum;
  - 🖐 "mão na garganta" (sonoridade);
  - 👃 nariz (nasal);
  - 💨 sopro (ar do /p/).
- **Proibidos na área infantil:** ☰, ⋮, engrenagem, "<" abstrato, X vermelho [doc 24 §3.3].
- **Gestos articulatórios próprios para o PB** (não copiar as ações do Jolly Phonics, que são do inglês e marca registrada) [doc 10 §3.3].
- Estilo:
  - 2D vetorial com textura leve de "feito à mão";
  - formas arredondadas e contorno irregular;
  - traço mínimo de 3 px nos ícones da criança;
  - contraste ≥ 3:1 com o fundo [doc 04 §5.1; doc 24 §3.7].
- Área adulta: ícone **+ texto** sempre (letramento digital variado) [doc 24 §3.5].

### 6.10 Personagens no design system

- **Sofia:**
  - menina de ~9–10 anos, parda, cabelo cacheado 3C/4A;
  - camiseta com a letra da semana;
  - objeto-assinatura (caderno amarelo/broche);
  - **sem coroa, tiara ou vestido de princesa** [doc 23 §3.1–3.2; doc 04 §5.4].
- **Bolota:**
  - filhote de tatu-bola, menor e mais novo que a criança;
  - vira bolinha no fim da sessão [doc 23 §3.7; doc 04 §5.4].
- **Validação obrigatória:**
  - teste de preferência com crianças de 4–7 anos em 3 regiões;
  - revisão de diversidade;
  - ⚖️ busca no INPI (classes 9, 41, 28) para "Sofia" [doc 04 §5.4; doc 23 §3.1].

---
## 7. Diferenciais inovadores e o "momento uau" de cada perfil

### 7.1 O que não encontramos em pt-BR

Base: benchmark do [doc 04 §2, §6]. "Não encontrado" ≠ "não existe": é preciso revalidar antes de usar em material comercial.

| # | Diferencial | Por que é pioneiro em pt-BR | Evidência / viabilidade |
|---|---|---|---|
| D1 | **Fônica sistemática do zero ao texto, com acabamento de estúdio** | Quem tem evidência no Brasil (GraphoGame, Escribo) tem visual modesto. Quem tem escala (Elefante Letrado, Árvore) é biblioteca para quem já lê | [doc 04 §1, §6] |
| D2 | **"Eu leio, a Sofia escuta"**: leitura em voz alta avaliada por reconhecimento de fala **infantil** pt-BR, com política de não punir na dúvida | Ello e Amira fazem em inglês; não achamos equivalente brasileiro para o zero até o texto | [doc 04 §6, item 2; doc 22; doc 03 §10] |
| D3 | **Boquinha em três camadas:** vídeo humano por **fonema** + vista lateral do invisível (língua, vibração, nariz) + espelho local, e no V2 a dica por câmera só para os sons visíveis | Une a evidência de articulação + letra (Boyer & Ehri) com privacidade by design | [doc 10 §3.1–3.2; doc 03 §5, §10] |
| D4 | **Bolota, o aprendiz que a criança ensina**, com erros planejados no nível exato da criança | Efeito protegido aplicado aos pares mínimos do PB (p/b, t/d, f/v, b/d) | [doc 23 §3.7] |
| D5 | **Linter aberto de decodificabilidade em português** + biblioteca de livrinhos decodificáveis | Não encontramos biblioteca decodificável pt-BR em escala; o validador de grafemas do PB (x, s, r, nasais, dígrafos) é ativo técnico | [doc 25 §3.1; doc 21 §3.4] |
| D6 | **Painel acionável alinhado à BNCC e ao ICA:** mapa de calor + grupos para amanhã + atividade de sala + risco com dose + "no caminho do 743" (como estimativa) | Os painéis de mercado são em inglês e não traduzem para psicogênese, BNCC e Saeb | [doc 20 §3.8; doc 02 §3.3] |
| D7 | **Motor de memória explícito** (Leitner + estabilidade + revisão indireta hierárquica + Jardim que nunca morre) | Repetição espaçada visível e ética para crianças pequenas | [doc 07 §3.2] |
| D8 | **Perfil sensorial completo + modos sem rótulo** (calmo, previsível, foco curto, reforço) | A acessibilidade cognitiva (COGA/DUA 3.0) vira configuração, não promessa terapêutica | [doc 05 §2; doc 12 §3] |
| D9 | **Ética como marca:** sem anúncios, sem loot box, sem streak, ritual de fim, métricas éticas publicadas | Cerca de 80% dos apps para 3–5 anos têm design manipulativo; alinhado ao ECA Digital | [doc 04 §4; doc 08 §3.7] |
| D10 | **Offline e aparelho fraco como requisito**, com aparelho compartilhado de turma (até 40 perfis) | Acesso real em escola pública | [doc 24 §3.8; doc 14 §3.6] |
| D11 | **Evidência aberta:** publicar a acurácia do ASR infantil pt-BR e fazer estudo de efeito pré-registrado | O setor tem pouca evidência independente | [doc 21 §3.8; doc 04 §6, item 7] |

### 7.2 O "momento uau" por perfil

| Perfil | Momento uau | Quando acontece | Como desenhar | Base |
|---|---|---|---|---|
| **Criança (4–5)** | O Bolota troca "BATO" por "PATO", ela corrige e o Bolota aprende: **"eu ensinei!"** | 1ª semana na fase letra-som | Erro planejado engraçado e gentil; caderninho registra; Sofia elogia a estratégia | [doc 23 §3.7] |
| **Criança (6–8)** | Ela lê a frase **em voz alta** e a cena ganha vida enquanto as palavras acendem com a voz dela: **"o app me ouviu ler!"** | 1º livrinho com o "Eu leio" | Destaque seguindo a voz; a palavra lida vira ação (P1: a leitura é a recompensa) | [doc 25 §3.2; doc 08 P1] |
| **Criança (todas)** | A figurinha nova **fala** o som que ela acabou de dominar, e o mapa acende | fim da sessão | Ritual curto e específico, sem confete exagerado | [doc 08 §3.6] |
| **Responsável** | No domingo, recebe: "Esta semana a Ana aprendeu LH e NH" + (opcional) um áudio de 10 s **dela lendo**, guardado só no aparelho da família e com consentimento específico + uma brincadeira de 5 min no mercado | 1º relatório semanal | 1 tela, linguagem simples, botão "fizemos!" | [doc 20 §3.8; doc 14 §3.5] |
| **Responsável (criança com dificuldade)** | Recebe um sinal **cuidadoso e acionável** ("não é diagnóstico; o que fazer agora"), com dose sugerida, e não um rótulo | após semanas de dados persistentes | Texto padronizado + Lei 14.254/2021 + orientação de profissional | [doc 05 §7; doc 11 §3.1] |
| **Professor** | Abre o painel na segunda-feira e vê **3 grupos prontos com uma atividade de 10 min para cada**: "quem precisa da mesma aula amanhã" | 1ª semana após o diagnóstico | Mapa de calor + grupos sugeridos e editáveis + fila de escuta curta | [doc 20 §3.8; doc 21 §3.6] |
| **Professor** | Pede "uma história com a festa junina da nossa escola, só com os sons que a turma já sabe" e recebe um rascunho validado para aprovar | V2 | Pipeline LLM → linter → revisão humana | [doc 21 §3.4, §3.6] |
| **Coordenação/escola** | Vê em 1 tela a migração de níveis entre o benchmark de início e o de meio do ano, por turma | 2º benchmark | Barras 100% + tabela "subiu/manteve/desceu" | [doc 20 §3.3] |
| **Secretaria/rede** | Exporta um relatório no formato do ICA mostrando a fração "no caminho do 743" por escola, com dose e uso ao lado, sabendo onde investir formação | fim do 1º semestre | Painel agregado, n mínimo, rodapé "estimativa" | [doc 02 §3.3; doc 20 §3.8] |
| **Editorial/pesquisa** | O linter reprova "CACHORRO" num livrinho da F2 e sugere uma troca; depois, os dados mostram a acurácia real daquele texto | todo dia | W12 + A3 | [doc 25 §3.1] |

---

## 8. Riscos, pendências e decisões em aberto

| Tema | Risco / pendência | Ação |
|---|---|---|
| ⚖️ Legal | LGPD art. 14/11, ECA Digital + Decreto 12.880/2026, voz e imagem de criança, sinal de risco como dado de saúde, limiar de n mínimo nos agregados | Parecer jurídico antes do piloto [doc 05 §8–9] |
| Marca | "Sofia" × "Princesinha Sofia"/Disney; apps "Sofia" existentes | Busca no INPI; marca composta [doc 04 §1, §5.4] |
| ASR infantil | Falso "errado"; sotaques; falta de corpus pt-BR infantil aberto | Beta com não pontuação na dúvida; coleta consentida de 20–50 h; acordo ≥ 90% com juízes [doc 03 §8; doc 20 §3.9; doc 22 §3.3] |
| Normas | PCPM, latências e pontos de corte sem norma brasileira | Tratar como hipótese; recalibrar com a coorte-piloto (≥ 500 por série) [doc 20 §3.7] |
| Escala FONEMA × Saeb | Interpretação indevida como nota oficial | Rodapé fixo; ancoragem só via TRI com itens de ligação [doc 20 §3.8] |
| Arte e paleta | Paleta e personagens propostos sem teste | Teste com crianças (Fun Toolkit adaptado) e revisão de diversidade [doc 24 §3.9; doc 23 §3.1] |
| Licenças | Victory Native XL sem SPDX na API; Rhubarb "Other"; editor Rive pago; Spine exige licença | Conferir antes de adotar [doc 03 §2, §6] |
| Câmera | Benefício sem evidência; privacidade | Fora do MVP; espelho local na V1; análise só no V2 com A/B [doc 10 §3.2; doc 05 §6.6] |
| Sobrecarga do professor | Painel com informação demais | Começar com 5 visualizações (P1, P2, P3, P7, P12) e testar com 5 professoras [doc 24 §3.9] |
| Dependência de tela | "Vício positivo" mal interpretado | Métricas éticas (A5) como OKR do produto [doc 08 §3.7] |

---

## 9. Referências

### 9.1 Documentos internos (base deste catálogo)

| Doc | Tema | Seções mais usadas |
|---|---|---|
| 02 | BNCC, fonética do PB, ICA/Saeb | §2 (habilidades), §3.3 (743), §5.5 (sequência), §7 (implicações) |
| 03 | Tecnologia, GitHub, stack | §2 (engines), §5 (câmera), §6 (lip-sync), §7, §9 (arquitetura), §10 (boquinha) |
| 04 | Mercado, 32 mecânicas, engajamento ético, arte | §2, §3, §4, §5, §6 |
| 05 | Inclusão, acessibilidade, legal | §2.4 (perfil sensorial), §4 (matriz), §6.6, §7 (triagem), §8 |
| 06 | Cérebro leitor | §3 (regras de design) |
| 07 | Memória e algoritmo | §3.1, §3.2 (Agendador v0), §3.3 |
| 08 | Dopamina e recompensas | §3.1–3.7 |
| 09 | Atenção e carga cognitiva | §3.1–3.4 |
| 10 | Fala multissensorial | §3.1–3.6 |
| 11 | Dislexia | §3.1–3.4 |
| 12 | TEA e TDAH | §3.1–3.3 |
| 13 | Emoção, erro e falas da Sofia | §3.1–3.6 |
| 14 | Desenvolvimento e música | §3.1–3.6 |
| 20 | Avaliação adaptativa e relatórios | §3.1–3.9 |
| 21 | IA na educação infantil | §3.1–3.8 |
| 22 | ASR infantil | §3 |
| 23 | Agente pedagógico Sofia | §3 (bíblia da personagem) |
| 24 | UX/UI para crianças | §3.1–3.9 |
| 25 | Decodificáveis, fluência e escrita | §3.1–3.4 |

### 9.2 Fontes externas consultadas nesta rodada

**Busca web** (painéis de alfabetização; usadas só como benchmark de padrão de interface):
- 95 Percent Group — 95 Literacy Intervention System: https://www.95percentgroup.com/?p=26956
- Amplify Boost (Trouble Spots): https://amplify.com/program-highlights/boost/
- GraphoGame — "See inside the literacy learning process": https://group.graphogame.com/?p=1450
- Renaissance Star Early Literacy (ajuda): https://star-help.zendesk.com/hc/en-us/articles/11761508617243
- McGraw Hill Wonders Data Dashboard: https://www.mheducation.com/prek-12/support/knowledge/wonders-data-dashboard-overview
- Blankestijn, J. A. (2021). Dissertação de mestrado, Univ. de Groningen, sobre painéis de professor em tutores inteligentes: https://fse.studenttheses.ub.rug.nl/26434/1/mHMC_2021_BlankestijnJA.pdf

**GitHub** (API de busca, 13/11/2026; ⭐ aproximadas):

| Repositório | ⭐ | Licença |
|---|---|---|
| apache/echarts | 67,7k | Apache-2.0 |
| recharts/recharts | 27,7k | MIT |
| airbnb/visx | 21,1k | MIT |
| tremorlabs/tremor-npm | 16,5k | Apache-2.0 |
| plouc/nivo | 14,1k | MIT |
| observablehq/plot | 5,4k | ISC |
| chart-kit/react-native-chart-kit | 3,1k | MIT |
| margelo/react-native-graph | 2,6k | MIT |
| kevinsqi/react-calendar-heatmap | 1,3k | MIT |
| FormidableLabs/victory-native-xl | 1,2k | sem SPDX na API |
| wuba/react-native-echarts | 1k | Apache-2.0 |
| storybookjs/storybook | 91,5k | MIT |
| radix-ui/primitives | 19,5k | MIT |
| style-dictionary/style-dictionary | 4,9k | Apache-2.0 |
| tokens-studio/sd-transforms | 251 | MIT |
| googlefonts/atkinson-hyperlegible | 326 | OFL-1.1 |
| googlefonts/lexend | 322 | OFL-1.1 |
| silnrsi/font-andika | 86 | OFL-1.1 |

Projetos de alfabetização open source já listados no [doc 03 §7.1]: FeedTheMonsterJS (MIT), Litera (MIT), Alfabetizando (GPL-3.0), buzzphonics (MIT).

**Contraste de cores:** cálculo próprio com a fórmula de luminância relativa do WCAG 2.x (script local); os valores estão em §6.2.
