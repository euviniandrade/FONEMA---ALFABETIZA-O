# Vila Leitora — Esqueleto do repositório e convenções

Monorepo único (`fonema/`) com **Melos** para os pacotes Dart/Flutter e **pnpm + Turborepo** para TypeScript (painéis, Lambdas, infraestrutura). O app segue **feature-first**: cada funcionalidade tem suas camadas `data / domain / presentation` e, quando é jogo, uma pasta `game/` com os componentes Flame.

## 1. Estrutura de pastas
```
fonema/
├── apps/
│   ├── jogo/                         # App Flutter: iOS, Android e Web
│   │   ├── lib/
│   │   │   ├── main_dev.dart · main_hml.dart · main_prod.dart
│   │   │   ├── app/                  # bootstrap, roteador (go_router), tema, injeção (Riverpod)
│   │   │   ├── core/
│   │   │   │   ├── audio/            # player, ducking com microfone aberto, limitador
│   │   │   │   ├── armazenamento/    # Drift + SQLCipher, migrações
│   │   │   │   ├── sincronizacao/    # fila de eventos, cliente AppSync, idempotência
│   │   │   │   ├── conteudo/         # download e verificação de pacotes assinados
│   │   │   │   ├── porteira/         # porteira parental
│   │   │   │   ├── acessibilidade/   # Semantics, tamanhos de alvo, movimento reduzido
│   │   │   │   └── telemetria/       # eventos pedagógicos, sem dado pessoal
│   │   │   └── features/
│   │   │       ├── perfis/           # escolha de perfil (até 40 por aparelho)
│   │   │       ├── vila/
│   │   │       │   ├── data/         # repositório da vila (Drift + sync)
│   │   │       │   ├── domain/       # Predio, Planta, Material, OperacaoVila
│   │   │       │   ├── presentation/ # HUD em Flutter (termômetro, missões, barra)
│   │   │       │   └── game/         # VilaGame (Flame): mapa iso, predios, camera
│   │   │       ├── licao/            # 3 fases, tipos de atividade, ritual de fim
│   │   │       ├── espelho_do_som/   # clipes por fonema, espelho local opcional
│   │   │       ├── fala/             # integração com packages/fala (sherpa-onnx)
│   │   │       ├── expedicao/        # mapa das 11 regiões, missões de bioma
│   │   │       ├── lojinha/          # catálogo, etiquetas decodificáveis
│   │   │       ├── cofrinho/         # meta, bônus de paciência, lista de desejos
│   │   │       ├── oficina_robos/    # cartas de comando (pensamento computacional)
│   │   │       ├── praca_emocoes/    # termômetro de como estou, respirar
│   │   │       ├── album/            # figurinhas falantes, Álbum de Dias de Leitura
│   │   │       └── avatar/
│   │   ├── assets/                   # só o mínimo do instalador (fontes Andika, Sofia base)
│   │   ├── test/ · integration_test/ # unidade, widget, golden e Patrol (E2E)
│   │   └── android/ · ios/ · web/
│   └── paineis/                      # Next.js (App Router) para adultos
│       ├── app/(familia)/ · app/(professora)/ · app/(escola)/ · app/(publico)/
│       ├── components/ · lib/graphql/ · lib/auth/ (Cognito)
│       └── tests/ (Playwright + axe)
├── packages/
│   ├── dominio/                      # Dart puro: motor de domínio, agendador, Escala 0–10, economia
│   │   └── test/vetores/             # vetores JSON compartilhados com o backend
│   ├── flame_iso/                    # utilidades isométricas: projeção, ordenação, seleção de tile
│   ├── ui_kit/                       # design system Flutter (botões, chips, termômetro, painéis)
│   ├── fala/                         # plugin FFI do sherpa-onnx + VAD + palavra-alvo
│   ├── conteudo_schema/              # JSON Schema de pacotes → tipos Dart e TS gerados
│   └── graphql_schema/               # schema.graphql + codegen (Dart e TS)
├── servicos/
│   ├── api/                          # Lambdas TypeScript por domínio
│   │   ├── familia-conta/ · turma-escola/ · conteudo-catalogo/
│   │   ├── relatorios/ · assinatura/
│   │   └── comum/                    # Powertools, validação (zod), erros
│   ├── dominio-lambda/               # Lambdas Dart AOT: progresso-termometro, vila-economia
│   └── banco/
│       ├── migracoes/                # SQL versionado (dbmate)
│       └── politicas-rls/            # políticas por papel e instituição + testes
├── conteudo/                         # fábrica de conteúdo
│   ├── palavras/ · textos/ · regioes/R00..R10/
│   ├── predios/ · lojinha/           # plantas e itens (YAML) validados pelo schema
│   ├── linter/                       # linter de decodificabilidade (bloqueante no CI)
│   ├── gerador/                      # missões procedurais com semente
│   ├── tts/                          # lote Azure → Opus + visemas, com versão de voz
│   └── espelho-do-som/               # manifesto dos clipes e aprovação das 2 fonoaudiólogas
├── infra/                            # AWS CDK (TypeScript)
│   ├── bin/app.ts
│   ├── lib/stacks/
│   │   ├── fundacao.ts               # KMS, logs, alarmes base, orçamento
│   │   ├── rede.ts                   # VPC privada para o Aurora (sem NAT; endpoints)
│   │   ├── identidade.ts             # Cognito (pools de adulto), grupos e MFA
│   │   ├── dados.ts                  # Aurora Serverless v2, DynamoDB, backups
│   │   ├── api.ts                    # AppSync, API Gateway, Lambdas
│   │   ├── borda.ts                  # CloudFront, WAF, Route 53, certificados
│   │   ├── conteudo.ts               # buckets versionados, Object Lock, MediaConvert
│   │   ├── analitica.ts              # data lake, Glue, Athena
│   │   └── observabilidade.ts        # painéis, alarmes, SLOs
│   ├── config/dev.ts · hml.ts · prod.ts
│   └── test/                         # snapshot + cdk-nag
├── ferramentas/                      # scripts de dev, seed sintético, geração de código
├── docs/adr/                         # 0001-flutter-flame.md, 0002-nextjs-paineis.md...
├── .github/
│   ├── workflows/ ci.yml · deploy.yml · mobile-release.yml · conteudo.yml
│   ├── PULL_REQUEST_TEMPLATE.md      # inclui checklist LGPD/ECA Digital
│   └── CODEOWNERS
├── melos.yaml · pnpm-workspace.yaml · turbo.json
└── README.md
```

## 2. Convenções

### Código
- **Idioma:** termos de domínio em português e sem acento nos identificadores (`Predio`, `Licao`, `Moedinha`, `nivelEscala`); termos técnicos em inglês quando forem do framework (`Repository`, `Provider`). Textos de interface sempre em arquivos `.arb` (pt-BR), nunca no código.
- **Dart:** `very_good_analysis`, `dart format`, Riverpod (sem `setState` em features), `freezed` para modelos imutáveis, `go_router` com rotas tipadas. Nenhuma feature importa outra diretamente: a comunicação passa por `core/` ou por eventos.
- **Flame:** um `World` por cena (vila, expedição, minijogo); componentes pequenos (`PredioComponent`, `TileComponent`); prioridade de desenho pela profundidade isométrica `x + y`; sem lógica de negócio dentro de componente (ela fica em `domain/`).
- **TypeScript:** `strict`, ESLint + Prettier, `zod` na borda de toda Lambda, Lambda Powertools (logger sem dado pessoal, tracer, métricas).
- **SQL:** migrações só para frente; toda tabela com dado de criança tem política RLS e teste.

### Git e revisão
- Branch principal `main` protegida; branches `feat/…`, `fix/…`, `conteudo/…`, `infra/…`.
- **Conventional Commits** em português (`feat(vila): construir padaria pela planta lida`).
- PR pequeno, com CI verde e 1 revisão (2 para `infra/`, `servicos/banco/` e `dominio/`). CODEOWNERS por pasta: pedagogia aprova `conteudo/`, fonoaudiologia aprova `conteudo/espelho-do-som/`.
- Versão do app: SemVer a partir da tag; pacotes de conteúdo com versão própria (`R05@2027.03.1`).

### Testes
| Camada | Ferramenta | Meta |
|---|---|---|
| Regras de domínio | `package:test` + vetores JSON | 100% das regras de nível e economia |
| Widgets e telas | `flutter_test` + golden tests | Toda tela infantil com golden em 3 tamanhos |
| Jogo | testes de componente Flame | Ordenação isométrica, construção, colisão de toque |
| E2E móvel | Patrol em Android de entrada (2 GB) | Fluxos: primeira lição, construir, comprar, sync offline |
| Painéis | Playwright + axe | Zero violação AA nas telas principais |
| Backend | Vitest + DynamoDB local + Postgres em contêiner | Contratos GraphQL e políticas RLS |
| Infra | snapshot + `cdk-nag` | Nenhuma regra crítica suprimida sem ADR |

### Conteúdo
- Toda palavra visível pela criança passa pelo **linter de decodificabilidade** da etapa dela. O PR falha se não passar.
- Itens de lojinha e plantas de prédio são YAML validados pelo `conteudo_schema`.
- Áudio só entra com loudness medido e versão da voz registrada.

### Nomes de recursos AWS
`fonema-{ambiente}-{dominio}-{recurso}` (ex.: `fonema-prod-vila-economia-fn`). Tags obrigatórias: `ambiente`, `dominio`, `dados-pessoais` (`nenhum|pseudonimo|pessoal`), `custo`.
