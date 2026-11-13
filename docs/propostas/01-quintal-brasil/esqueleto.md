# Quintal Brasil — Esqueleto do monorepo

Monorepo **Turborepo + pnpm workspaces + TypeScript estrito**. Nomes de pastas de domínio em português (como o produto); nomes técnicos padrão do ecossistema em inglês (`apps`, `packages`, `src`).

## 1. Árvore completa

```
fonema/
├── apps/
│   ├── mobile/                      # App Expo (iOS, Android, tablets)
│   │   ├── app/                     # Expo Router (rotas = arquivos)
│   │   │   ├── _layout.tsx          # provedores: tema Quintal, sessão, i18n, fila de sync
│   │   │   ├── index.tsx            # escolha de perfil (figuras/QR)
│   │   │   ├── (crianca)/           # área infantil: sem texto de navegação, sem rolagem
│   │   │   │   ├── mapa.tsx         # mapa das 11 regiões + Termômetro da Leitura
│   │   │   │   ├── licao/[id].tsx   # sessão: Sofia, Espelho do Som, jogos
│   │   │   │   ├── vila.tsx         # vila do Bolota (construção)
│   │   │   │   ├── lojinha.tsx      # lojinha + cofrinho (entra pela vila)
│   │   │   │   ├── album.tsx        # figurinhas que falam, estante
│   │   │   │   └── desafio/[regiao].tsx  # desafio-chefe (provinha)
│   │   │   └── (adulto)/            # atrás da porteira (3 s + leitura)
│   │   │       ├── porteira.tsx
│   │   │       ├── resumo.tsx       # nível X de 10, missão da semana
│   │   │       ├── ajustes/         # perfil sensorial, modo calmo, economia on/off
│   │   │       ├── privacidade/     # consentimentos, apagar dados
│   │   │       └── assinatura.tsx   # plano mensal (RevenueCat)
│   │   ├── modules/
│   │   │   └── fonema-speech/       # módulo nativo Expo: ponte para sherpa-onnx (Kotlin/Swift)
│   │   ├── src/
│   │   │   ├── sync/                # fila local, envio em lote, reconciliação
│   │   │   ├── storage/             # SQLite (SQLCipher), índice de pacotes, mídia
│   │   │   ├── audio/               # expo-audio, ducking, limitador, volumes separados
│   │   │   └── porteira/            # lógica da porteira parental
│   │   ├── assets/                  # só o mínimo do binário (≤ 40 MB no total)
│   │   ├── app.config.ts            # config por ambiente (dev/homolog/prod)
│   │   └── eas.json                 # perfis de build e canais OTA
│   │
│   ├── web/                         # Next.js (App Router)
│   │   ├── app/
│   │   │   ├── (site)/              # site público, preços, central de privacidade
│   │   │   ├── (pais)/              # painel do responsável
│   │   │   ├── (escola)/professor/  # turma, mapa de calor, grupos de amanhã, fila de escuta
│   │   │   ├── (escola)/gestor/     # visão da escola
│   │   │   ├── (rede)/secretaria/   # agregados (n ≥ 10), sem dado nominal
│   │   │   ├── (crianca)/           # PWA para PC/Chromebook da escola
│   │   │   └── conta/               # login, assinatura (checkout web)
│   │   ├── components/              # componentes de painel (ECharts, tabelas)
│   │   └── public/sw.js             # service worker (offline da PWA)
│   │
│   └── studio/                      # Estúdio editorial interno (Next.js, SSO + 2FA)
│       └── app/                     # palavras, livrinhos, missões, revisão fono, publicar
│
├── packages/
│   ├── pedagogy/                    # REGRAS DE ENSINO (TS puro, sem UI)
│   │   ├── src/dominio/             # critérios de domínio (4 critérios)
│   │   ├── src/escala/              # Termômetro da Leitura 0–10 (nunca desce visível)
│   │   ├── src/agendador/           # revisão espaçada (Leitner → FSRS)
│   │   ├── src/sessao/              # montagem da sessão e ritual de fim
│   │   ├── src/gerador/             # missões procedurais (semente determinística)
│   │   ├── src/economia/            # moedas, teto diário, antifarming, cofrinho
│   │   └── src/adaptacao/           # dificuldade ~85%, escada de ajuda 5/10/20 s
│   ├── games/                       # MOTOR DE JOGOS 2D (PixiJS v8)
│   │   ├── src/motor/               # cena, entrada (toque/clique), ímã, alternativa toque-toque
│   │   ├── src/bridge/              # mensagens tipadas app ⇄ WebView/DOM
│   │   └── src/jogos/               # 1 pasta por jogo (rima-ou-nao, bate-a-silaba, ...)
│   ├── sofia/                       # Sofia e Bolota (Rive) + Espelho do Som
│   │   ├── rive/                    # .riv versionados (12 bocas, estados)
│   │   ├── src/visemas/             # leitor do JSON de visemas → Data Binding
│   │   └── src/espelho-do-som/      # player do clipe (vídeo mux + corte lateral + letra)
│   ├── speech/                      # FALA (interface única)
│   │   ├── src/politica/            # tolerância assimétrica, variantes regionais, matriz por idade
│   │   ├── src/adaptadores/native/  # sherpa-onnx no app
│   │   ├── src/adaptadores/wasm/    # sherpa-onnx na web
│   │   ├── src/adaptadores/cloud/   # fallback opcional (desligado por padrão)
│   │   └── regressao/               # manifesto do conjunto de regressão (áudios fora do git)
│   ├── content/                     # CONTEÚDO EM DADOS
│   │   ├── schemas/                 # zod: palavra, pseudopalavra, livro, missão, fala
│   │   ├── regioes/r0-quintal/ … r10-arquipelago/   # YAML por região
│   │   ├── linter/                  # decodificabilidade, lista "evitar", repetição mínima
│   │   └── build/                   # gera áudio (Azure TTS), visemas, empacota e assina
│   ├── ui/                          # DESIGN SYSTEM "QUINTAL"
│   │   ├── tokens/                  # cores, tipografia, espaçamento, movimento (JSON → TS/CSS)
│   │   ├── native/                  # componentes RN da criança (BotaoPrincipal, Alternativa…)
│   │   └── web/                     # componentes dos painéis adultos
│   ├── db/                          # tipos gerados do Supabase, cliente, consultas tipadas
│   ├── analytics/                   # esquema de eventos first-party (sem PII)
│   ├── i18n/                        # textos pt-BR (adulto) e roteiro de falas (criança)
│   └── config/                      # eslint, tsconfig, prettier, vitest compartilhados
│
├── supabase/
│   ├── migrations/                  # SQL versionado (única forma de mudar o banco)
│   ├── functions/                   # Edge Functions (sync, relatorio-semanal, pagamentos-webhook,
│   │                                #   exclusao-lgpd, token-fala, publicar-pacote, exportar-dados)
│   ├── tests/                       # pgTAP: RLS por papel × tabela
│   ├── seed/                        # dados 100% sintéticos
│   └── config.toml
│
├── infra/
│   ├── terraform/                   # Cloudflare (CDN/R2, DNS), Vercel, Supabase (projetos), alertas
│   └── runbooks/                    # incidentes, restauração de backup, rotação de chaves
│
├── tools/
│   ├── scripts/                     # utilitários de dev (criar região, gerar tipos)
│   └── maestro/                     # fluxos e2e do app (Android/iOS)
│
├── docs/                            # já existe: pesquisa, síntese, decisões
│   ├── adr/                         # registros de decisão (0001-monorepo.md, …)
│   └── propostas/
│
├── .github/
│   ├── workflows/                   # ci.yml, release.yml, conteudo.yml, seguranca.yml
│   ├── CODEOWNERS
│   ├── pull_request_template.md     # checklist LGPD/acessibilidade/criança
│   └── ISSUE_TEMPLATE/
├── .changeset/                      # versionamento dos pacotes e changelog
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## 2. O que cada parte faz (resumo)

| Pasta | Dono | Pode depender de | Não pode |
|---|---|---|---|
| `packages/pedagogy` | pedagogia + líder técnico | `content` (tipos) | importar React, rede ou armazenamento |
| `packages/games` | dev de jogos | `ui/tokens`, `pedagogy` (tipos) | chamar a rede; guardar dados |
| `packages/speech` | fala/ML | — | enviar áudio para fora (exceto adaptador `cloud`, desligado e auditado) |
| `packages/content` | editorial + fono | `pedagogy` (linter) | conter texto que não passou no linter |
| `packages/ui` | design | — | introduzir componente fora do design system |
| `apps/*` | times de produto | todos os pacotes | conter regra pedagógica (vai para `pedagogy`) |
| `supabase/` | backend | — | mudar banco sem migration e sem teste de RLS |

Os limites são verificados no CI com regras de importação (`eslint-plugin-boundaries`).

## 3. Convenções

### 3.1 Branches
- **`main` protegida** (criar antes de tudo, D004): sem push direto, PR obrigatório, CI verde, histórico linear.
- Fluxo **trunk-based** com branches curtas (≤ 3 dias): `feat/…`, `fix/…`, `conteudo/r3-pampa-…`, `docs/…`, `chore/…`, `seg/…` (segurança).
- Releases por **tag** `vX.Y.Z` a partir da `main`; correções urgentes em `hotfix/…` com o mesmo CI.

### 3.2 Commits
- **Conventional Commits**, tipo em inglês e descrição em português: `feat(pedagogy): regra de retenção após 3 dias`, `fix(mobile): áudio cortado no Android 9`, `content(r2b): 12 palavras com V`.
- `commitlint` no pre-commit; merge por **squash** com título no mesmo padrão.
- Mudanças em pacotes publicáveis exigem um **changeset**.

### 3.3 Revisão
- 1 aprovação obrigatória; **2** quando toca auth, RLS, consentimento, pagamentos ou dados de criança.
- `CODEOWNERS`: fono revisa `content/` com fonemas; pedagogia revisa `pedagogy/`; segurança revisa `supabase/` e `speech/adaptadores/cloud`.
- Template de PR com checklist: dado novo de criança? consentimento? RLS? acessibilidade (alvo ≥ 72 dp, contraste, alternativa por toque)? texto infantil passou no linter?

### 3.4 Testes

| Nível | Ferramenta | Meta |
|---|---|---|
| Unidade | Vitest (pacotes), Jest (RN) | `pedagogy` ≥ 90% de cobertura; `speech/politica` ≥ 90% |
| Banco | pgTAP | 1 teste por papel × tabela com RLS |
| Integração | Vitest + Supabase local | sync, relatório, exclusão LGPD |
| E2E web | Playwright | fluxos de pais, professor, checkout |
| E2E app | Maestro (emulador Android de entrada no CI; iOS no release) | escolher perfil → lição → ritual → mapa |
| Visual | Playwright screenshots dos componentes do design system | sem regressão visual não aprovada |
| Desempenho | orçamento no CI: binário ≤ 40 MB, pacote ≤ 5 MB, abertura a frio ≤ 3 s (Android de referência) | falha o PR se estourar |
| Acessibilidade | axe (web), verificação de tamanho de alvo e contraste dos tokens | 0 violações AA |
| Fala | conjunto de regressão (FRR por idade/região) | release falha se piorar |
| Conteúdo | linter de decodificabilidade | bloqueante |

### 3.5 CI (GitHub Actions)
- `ci.yml` (todo PR): instalar com cache pnpm → `turbo run lint typecheck test build --filter=...[origin/main]` (só o que mudou) → Supabase local + pgTAP → Playwright → Maestro (Android) → orçamento de tamanho.
- `seguranca.yml`: CodeQL, OSV-Scanner/Dependabot, gitleaks, verificação de licenças (bloqueia GPL/AGPL no código fechado), SBOM (CycloneDX).
- `conteudo.yml`: linter, geração de áudio com cache, empacotamento e assinatura; publica em homolog.
- `release.yml`: na tag, migrations em prod com backup prévio, deploy web, EAS build/submit, publicação de pacotes, notas de versão.

### 3.6 Código
- TypeScript `strict`, sem `any` em `pedagogy` e `speech`; ESLint + Prettier; nomes de domínio em português (`dominio`, `cofrinho`), APIs técnicas em inglês.
- Nenhum segredo no repositório (gitleaks); `.env.example` documentado; variáveis por ambiente no GitHub Environments.
- Logs sem dado pessoal: o `logger` compartilhado só aceita campos de uma lista permitida.
- Toda decisão relevante vira um ADR em `docs/adr/`.
