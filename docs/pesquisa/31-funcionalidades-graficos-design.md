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
