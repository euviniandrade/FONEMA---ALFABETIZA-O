# FONEMA Unificada — Esqueleto do monorepo e regras de engenharia

> Complementa o [README](README.md) (arquitetura) e o [seguranca-privacidade.md](seguranca-privacidade.md). Tudo aqui é a **referência para criar o repositório**: estrutura, convenções, fluxo de Git, versões, testes e definição de pronto.

**Base técnica:** monorepo **pnpm workspaces + Turborepo** (cache remoto), **Node 22 LTS**, **TypeScript `strict`** em todo o produto; **Python 3.12** só em `ml/` e em scripts de mídia; **HCL (Terraform)** em `infra/`. Gerenciador de versões de ferramentas: `mise` (arquivo `.mise.toml`) para Node, pnpm, Python, Terraform e Java (Keycloak).

---

## 1. Árvore completa

```
fonema/
├── apps/                                   # produtos que o usuário final ou a equipe abre
│   ├── app/                                # Expo universal: Android, iOS e Web (PWA da criança)
│   │   ├── app/                            # Expo Router (rotas = arquivos)
│   │   │   ├── _layout.tsx                 # provedores: tema, sessão, sync, flags, áudio, i18n
│   │   │   ├── index.tsx                   # escolha de perfil (figuras) ou entrada da sala
│   │   │   ├── (crianca)/                  # área infantil: sem texto de navegação, sem rolagem
│   │   │   │   ├── mundo.tsx               # arquipélago 3D (ou Modo Leve 2,5D)
│   │   │   │   ├── vila/[id].tsx           # entrar na vila: ângulos, zoom por botões, construção
│   │   │   │   ├── licao/[id].tsx          # sessão: Sofia, Espelho do Som, jogos 2D
│   │   │   │   ├── desafio/[regiao].tsx    # desafio-chefe (provinha disfarçada)
│   │   │   │   ├── lojinha.tsx             # lojinha com propósito + cofrinho
│   │   │   │   ├── colecoes.tsx            # álbum, coleções e emblemas
│   │   │   │   ├── videos.tsx              # biblioteca infantil (offline, sem autoplay em série)
│   │   │   │   └── termometro.tsx          # termômetro que enche (sem números)
│   │   │   ├── (sala)/                     # modo sala de aula
│   │   │   │   ├── turma.tsx               # leitura do QR da turma
│   │   │   │   ├── avatares.tsx            # grade de avatares (≤ 30)
│   │   │   │   ├── senha-figuras.tsx       # 3 figuras entre 9
│   │   │   │   ├── dupla.tsx               # 2 crianças por tablet, turnos
│   │   │   │   └── estacao.tsx             # modo estação 10–15 min
│   │   │   └── (adulto)/                   # atrás da porteira (segurar 3 s + leitura)
│   │   │       ├── porteira.tsx
│   │   │       ├── familia/                # resumo semanal, missão da semana, vídeos para pais
│   │   │       ├── professor/              # modo professor no tablet, modo ao vivo (hub local)
│   │   │       ├── privacidade/            # consentimentos, exportar, apagar
│   │   │       ├── ajustes/                # perfil sensorial, perfil de aparelho, economia on/off
│   │   │       └── assinatura.tsx          # plano mensal (IAP) — só adulto
│   │   ├── modules/                        # módulos nativos Expo (Kotlin/Swift)
│   │   │   ├── fonema-fala/                # ponte para sherpa-onnx (VAD + verificador)
│   │   │   ├── fonema-dispositivo/         # chave no Keystore/Secure Enclave, atestação
│   │   │   └── fonema-perfil-aparelho/     # benchmark de 5 s, RAM/GPU → perfil A/B/C
│   │   ├── src/
│   │   │   ├── armazenamento/              # SQLite cifrado, índice de pacotes, arquivos de mídia
│   │   │   ├── pacotes/                    # download, verificação Ed25519/SHA-256, limpeza
│   │   │   ├── audio/                      # sessões, ducking, limitador, mudo com microfone
│   │   │   ├── hub-local/                  # V1: modo ao vivo sem internet (mDNS + HTTPS fixado)
│   │   │   └── ota/                        # política de atualização (canal, janela 19h–6h)
│   │   ├── e2e/                            # Maestro (fluxos da criança, sala, adulto)
│   │   ├── assets/                         # só o mínimo do binário (orçamento ≤ 40 MB)
│   │   ├── app.config.ts                   # configuração por ambiente (dev/homolog/staging/prod)
│   │   └── eas.json                        # perfis de build e canais
│   │
│   ├── web/                                # Next.js (App Router): site + áreas adultas
│   │   ├── app/
│   │   │   ├── (site)/                     # público, preços, central de privacidade, ciência
│   │   │   ├── (familia)/                  # painel do responsável (áudio-primeiro)
│   │   │   ├── (escola)/professor/         # turma, mapa de calor, grupos, alertas, fila de escuta
│   │   │   ├── (escola)/gestao/            # visão da escola, dose, fidelidade, aparelhos
│   │   │   ├── (rede)/secretaria/          # agregados n ≥ 10, distribuição 0–10, medição
│   │   │   ├── (parceiros)/                # integração de redes (roster, SSO)
│   │   │   ├── conta/                      # login, assinatura web, privacidade
│   │   │   └── api/                        # só BFF fino (nada de regra de negócio)
│   │   ├── components/                     # composições de página
│   │   ├── e2e/                            # Playwright + axe
│   │   └── next.config.ts                  # CSP estrita, headers de segurança
│   │
│   ├── estudio/                            # estúdio editorial: Payload CMS + revisão
│   │   ├── src/colecoes/                   # palavras, frases, livrinhos, missões, falas, itens, emblemas, vídeos
│   │   ├── src/fluxos/                     # autor → validação → fono → pedagogia → cultura → publicar
│   │   ├── src/publicacao/                 # snapshot JSON → PR no repositório (bot)
│   │   └── src/mundo/                      # visualizador de cenas 3D (usa packages/mundo-3d)
│   │
│   └── suporte/                            # back-office interno (dados mascarados, acesso JIT)
│
├── packages/                               # código compartilhado (sem efeitos colaterais na importação)
│   ├── pedagogia/                          # REGRAS DE ENSINO — TS puro, 100 % testado
│   │   ├── src/dominio/                    # 4 critérios (precisão, pseudopalavra, transferência, retenção)
│   │   ├── src/escala/                     # Escala 0–10; nunca desce visível
│   │   ├── src/agendador/                  # revisão espaçada (Leitner + estabilidade → FSRS)
│   │   ├── src/sessao/                     # montagem da sessão e ritual de fim
│   │   ├── src/gerador/                    # missões procedurais (semente determinística, 60/30/10)
│   │   ├── src/adaptacao/                  # alvo ~85 %, escada de ajuda 5/10/20 s
│   │   ├── src/transversais/               # termômetros por etapa das 5 competências
│   │   └── vetores/                        # vetores de teste compartilhados (app = servidor)
│   ├── economia/                           # moedinhas, teto diário, antifarming, cofrinho, vila, lojinha
│   ├── mundo-3d/                           # cena (R3F/Three.js), câmera, renderizadores A/B/C, ativos
│   │   ├── src/cena/  src/camera/  src/render/{r3f-native,r3f-web,leve-2d,filament}/  src/ativos/
│   │   └── bench/                          # cenas de benchmark para PoC e CI
│   ├── licoes/                             # telas e jogos 2D (Skia + Reanimated)
│   ├── espelho-do-som/                     # clipe + corte lateral + letra sincronizados
│   ├── personagens/                        # Sofia e Bolota (Rive), visemas, fila de falas
│   ├── videos/                             # player, catálogo, regras (sem autoplay em série)
│   ├── fala/                               # interface única: native | wasm (| cloud desligado)
│   ├── sync/                               # fila de eventos, cliente PowerSync, regras de conflito
│   ├── contratos/                          # schemas zod, tipos de eventos, cliente OpenAPI gerado
│   ├── telemetria/                         # eventos first-party tipados (sem PII), OTel na web
│   ├── porteira/                           # porteira parental (lógica + UI)
│   ├── graficos/                           # ECharts/echarts-gl + tabela acessível obrigatória
│   ├── ui-crianca/                         # componentes lúdicos (Andika, alvos ≥ 96 dp)
│   ├── ui-painel/                          # componentes institucionais (Atkinson/Lexend, WCAG 2.2 AA)
│   ├── design-tokens/                      # cores, tipografia, espaços → RN, CSS e Rive
│   ├── validador-conteudo/                 # decodificabilidade, segurança, cultura, acessibilidade
│   ├── i18n/                               # textos pt-BR e variantes regionais de áudio
│   ├── logger/                             # logger com lista permitida de campos
│   └── config/                             # eslint, tsconfig, prettier, vitest, dependency-cruiser
│
├── services/                               # serviços implantados no backend
│   ├── api/                                # NestJS monólito modular
│   │   ├── src/main-api.ts                 # entrypoint HTTP
│   │   ├── src/main-worker.ts              # entrypoint de filas (SQS) e workflows
│   │   ├── src/modulos/
│   │   │   ├── identidade/  tenancy/  familias/  consentimentos/  sync/  progresso/
│   │   │   ├── provinhas/  economia/  vila/  lojinha/  conteudo/  midia/  fala-modelos/
│   │   │   ├── recomendacao/  relatorios/  mensageria/  assinaturas/  privacidade/
│   │   │   ├── dispositivos/  experimentos/  auditoria/  suporte/
│   │   │   └── <modulo>/{api,aplicacao,dominio,infra,index.ts}   # index = única interface pública
│   │   ├── src/compartilhado/              # outbox, RLS (variáveis de sessão), erros, paginação
│   │   ├── db/
│   │   │   ├── migracoes/                  # SQL versionado (expand → migrate → contract)
│   │   │   ├── rls/                        # políticas por schema (revisadas por segurança)
│   │   │   ├── seeds-sinteticos/           # fábrica de dados fictícios
│   │   │   └── testes/                     # pgTAP: um teste por papel × tabela
│   │   └── test/                           # integração (Testcontainers) e contrato
│   ├── powersync/                          # configuração e regras de sincronização por balde
│   ├── ota/                                # servidor de atualizações (protocolo expo-updates)
│   ├── keycloak/                           # temas, autenticadores (OTP WhatsApp, dispositivo), realms
│   └── webhooks/                           # adaptadores de entrada (Meta, lojas, gateway) → SQS
│
├── pipelines/                              # fábricas que rodam no CI, nunca no caminho da criança
│   ├── conteudo/                           # snapshot → validação → TTS → empacotar → assinar → publicar
│   │   ├── tts/                            # Azure/Polly, cache por hash, visemas
│   │   ├── gerador-llm/                    # candidatos via Bedrock (sem dado de criança)
│   │   └── empacotador/                    # pacotes por região/lição, manifesto Ed25519
│   └── midia/                              # vídeo (MediaConvert), áudio (ffmpeg), 3D (gltf-transform), Rive
│
├── content/                                # CONTEÚDO como dado (snapshot do estúdio, revisado por PR)
│   ├── curriculo/                          # etapas 0–10, ordem dos sons, descritores
│   ├── palavras/  pseudopalavras/  frases/  livrinhos/  missoes/
│   ├── sofia/                              # falas roteirizadas (sem LLM livre)
│   ├── lojinha/  emblemas/  colecoes/  vila/
│   ├── videos/                             # roteiros, legendas, metadados
│   └── regioes/                            # metadados das 11 regiões e cenas
│
├── assets/                                 # fontes de mídia (Git LFS)
│   ├── 3d/                                 # .blend e glTF por região/vila
│   ├── rive/                               # .riv de Sofia, Bolota, corte lateral
│   ├── ilustracoes/  audio-gravado/  video-masters/   # masters grandes ficam no S3; aqui só referência
│
├── ml/                                     # ML de fala (Python)
│   ├── dados/                              # DVC: ponteiros para o corpus consentido (conta ml-dados)
│   ├── treino/                             # ajuste fino CTC fonêmico, destilação
│   ├── avaliacao/                          # FRR/FAR por região, idade, sexo, rede, perfil; cartão do modelo
│   ├── exportacao/                         # ONNX int8, testes de paridade
│   └── regressao/                          # conjunto fixo usado no CI
│
├── infra/
│   ├── terraform/
│   │   ├── modulos/                        # vpc, ecs-servico, aurora, valkey, cdn, waf, keycloak, powersync,
│   │   │                                   # lake, backup, observabilidade, guardrails, conta-base, siem
│   │   ├── organizacao/                    # contas, SCPs, Identity Center
│   │   └── ambientes/{dev,homolog,staging,prod,shared-services,security,log-archive,backup,ml-dados}/
│   ├── mdm/                                # políticas Android Enterprise, managed config (JSON)
│   ├── observabilidade/                    # dashboards Grafana, alertas, SLOs como código
│   └── docker/                             # compose de desenvolvimento local
│
├── tools/                                  # utilitários do repositório
│   ├── orcamento/                          # tamanho do app/pacotes, triângulos, memória de textura
│   ├── auditoria-rede/                     # lista de domínios permitidos do app infantil
│   ├── fabrica-dados/                      # perfis e turmas fictícias para dev/homolog/staging
│   └── geradores/                          # plop: novo módulo NestJS, novo pacote, novo ADR
│
├── docs/
│   ├── adr/                                # 0001… (formato MADR)
│   ├── arquitetura/                        # C4 (contexto, contêiner, componente), diagramas
│   ├── runbooks/                           # incidentes, restauração, chave vazada, release com defeito
│   ├── privacidade/                        # RIPD, ROPA, mapa de dados, contratos-modelo, retenção
│   ├── seguranca/                          # modelo de ameaças, política de acesso, pentests
│   ├── experimentos/                       # registro de experimentos e pareceres do comitê
│   ├── lojas/                              # checklists Apple Kids / Google Famílias por release
│   ├── glossario.md                        # termos de domínio (português sem acento no código)
│   └── guia-contribuicao.md
│
├── .github/
│   ├── workflows/                          # ci, seguranca, app, conteudo, midia, fala, infra, deploy,
│   │                                       # release-app, ota, privacidade
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md            # inclui checklist de privacidade, acessibilidade e criança
│   ├── ISSUE_TEMPLATE/                     # bug, funcionalidade, conteúdo, incidente de privacidade
│   ├── dependabot.yml  (ou renovate.json)
│   └── SECURITY.md                         # política de divulgação responsável
│
├── .changeset/                             # versionamento de pacotes e changelog
├── .mise.toml  .nvmrc  pnpm-workspace.yaml  turbo.json  tsconfig.base.json
├── commitlint.config.cjs  lefthook.yml     # hooks: lint, format, gitleaks, commitlint
├── LICENSE  README.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md
```

### 1.1 Regras de dependência (verificadas no CI com dependency-cruiser)

| Camada | Pode importar | Não pode importar |
|---|---|---|
| `packages/pedagogia`, `economia`, `contratos` | só utilitários puros | React, RN, Node APIs, banco, rede |
| `packages/*` de UI | `pedagogia`, `economia`, `contratos`, `design-tokens` | `services/*`, `apps/*` |
| `apps/*` | qualquer `packages/*` | outro `apps/*`, `services/*` |
| `services/api` | `pedagogia`, `economia`, `contratos`, `logger` | `packages` de UI |
| Módulo NestJS A | `index.ts` público do módulo B | pastas internas de B |
| Área infantil (`(crianca)`, `(sala)`) | — | qualquer SDK fora da lista permitida |

---

## 2. Convenções de código

- **TypeScript `strict`**, `noUncheckedIndexedAccess`, proibido `any` sem comentário `// motivo:`; ESLint + Prettier; `import type` obrigatório.
- **Nomes:** termos de domínio em **português sem acento** (`crianca`, `turma`, `nivelEscala`, `provinha`, `moedinhas`); termos técnicos do ecossistema em inglês (`controller`, `repository`, `hook`). Glossário em `docs/glossario.md`.
- **Regra pedagógica só em `packages/pedagogia`/`economia`**, com funções puras e **vetores de teste compartilhados** pelo app e pelo servidor.
- **Entrada validada com zod** nas bordas; respostas tipadas pelo cliente OpenAPI gerado.
- **Logs:** só via `packages/logger`, com lista permitida de campos; proibido logar corpo de requisição, telefone, e-mail, apelido ou texto livre. Teste de CI falha se detectar PII em log.
- **Erros:** códigos estáveis (`FONEMA-SYNC-002`), mensagens para criança só pela Sofia (nunca "erro" ou "falhou").
- **Acessibilidade:** componentes de `ui-painel` com rótulos, foco e contraste testados; `ui-crianca` com alvos ≥ 96 dp e áudio em todo alvo.
- **Banco:** toda migração nova com `rede_id`/`escola_id` quando aplicável **e** política RLS no mesmo PR; nenhuma migração destrutiva sem plano expand/contract aprovado.
- **Feature flags:** toda flag de `release` tem dono e data de remoção (≤ 60 dias).
- **Documentação viva:** decisões relevantes viram ADR; diagramas C4 atualizados no mesmo PR que muda a arquitetura.

---

## 3. Branches e revisão

- **`main` protegida** (regra de proteção ou *ruleset*): sem push direto, **PR obrigatório**, **CI verde obrigatório** (todos os checks marcados como required), branch atualizada antes do merge, histórico linear (**squash merge**), commits assinados (GPG/SSH ou *sigstore gitsign*), conversa resolvida.
- **Revisões:** 1 aprovação de CODEOWNER no padrão; **2 aprovações** em `infra/`, `services/api/src/modulos/{identidade,tenancy,consentimentos,privacidade,auditoria,assinaturas}`, `services/api/db/rls/`, `packages/fala`, `ml/`, `.github/workflows/`, `services/keycloak/`; **pedagogia** obrigatória em `content/` e `packages/pedagogia`; **segurança** obrigatória em tudo que toca dados de criança.
- **Branches curtas** a partir da `main`: `tipo/descricao-curta` (`feat/vila-zoom-botoes`, `fix/sync-lote-duplicado`, `content/regiao-r3-palavras`). Vida máxima recomendada: 3 dias.
- **Releases:** tags na `main` (`api-v1.4.0`, `app-v2.3.0`, `content-r3-v1.2.0`). Correção urgente: `hotfix/*` a partir da tag, PR para a `main`, nova tag.
- **Ambientes do GitHub** (`dev`, `homolog`, `staging`, `prod`) com segredos próprios, revisores obrigatórios em `staging` e `prod` e janela de implantação de produção (19h–6h).
- **Antes de começar:** criar a branch `main` no repositório e aplicar as regras (D004).

## 4. Commits convencionais

- Formato **Conventional Commits**: `tipo(escopo): resumo no imperativo` — tipos `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `revert`, `content`, `infra`, `sec`.
- Escopos = pastas (`app`, `web`, `api`, `pedagogia`, `mundo-3d`, `fala`, `infra`, `content`…). `BREAKING CHANGE:` no rodapé quando quebrar contrato.
- `commitlint` no hook local (lefthook) e no CI; `gitleaks` e formatação no pre-commit.
- Mensagem nunca contém dado pessoal, nome de criança, escola real ou segredo.

## 5. Versionamento

| Artefato | Esquema | Regra |
|---|---|---|
| Pacotes internos (`packages/*`) | SemVer via **Changesets** | changelog gerado; mudança incompatível = major |
| API | SemVer + versão de contrato no cabeçalho (`Fonema-Api: 2026-11`) | API aceita as 2 últimas versões de contrato |
| Protocolo de sync | inteiro (`sync-v3`) | servidor aceita as **2 últimas**; app offline por 30 dias não quebra |
| App (lojas) | SemVer (`2.3.0`) + `buildNumber`/`versionCode` crescente + **`runtimeVersion`** do Expo | OTA só para a mesma `runtimeVersion` |
| OTA | `ota-v<runtime>-<n>` | só JS/assets; assinado; rollback por canal |
| Conteúdo | SemVer por pacote de região (`r3-v1.2.0`) + manifesto assinado | correção de texto = patch; nova lição = minor; mudança de formato = major (exige app compatível) |
| Modelo de fala | `fala-ctc-v4.1` + cartão do modelo | liberação por flag e modo sombra |
| Infra | módulos Terraform com SemVer e tags | ambientes fixam versão de módulo |
| Imagens | digest + tag SemVer, assinadas (cosign) | produção usa só digest |

---

## 6. Testes

| Tipo | Ferramentas | Onde | Obrigatório |
|---|---|---|---|
| **Unidade** | Vitest (TS), Jest (RN quando necessário), pytest (`ml/`) | todo pacote | cobertura ≥ 90 % em `pedagogia`/`economia`/`sync`; ≥ 80 % no restante do backend |
| **Propriedade** | fast-check | `pedagogia`, `economia`, `sync` | invariantes: nível nunca desce visível, saldo nunca negativo, idempotência |
| **Integração** | Testcontainers (Postgres com RLS, Valkey, Keycloak, LocalStack para SQS/S3) | `services/api` | todo módulo |
| **Banco/RLS** | pgTAP | `services/api/db/testes` | **um teste por papel × tabela**; isolamento entre redes |
| **Contrato** | OpenAPI diff + testes de consumidor | API ↔ app/web | quebra exige major |
| **Sync** | simulador de 40 perfis × 30 dias offline, reconexão, aparelhos concorrentes | `packages/sync` + API | todo PR que toca sync |
| **E2E web** | Playwright | `apps/web` | fluxos críticos: login, painel da turma, consentimento, exclusão |
| **E2E app** | **Maestro** em emulador e em **aparelho real Android 8.1 / 2 GB** (laboratório) | `apps/app` | porteira, sala (QR + figuras), lição, compra virtual, offline |
| **Acessibilidade** | axe-core (web), checagens de rótulo/alvo (RN), revisão manual com leitor de tela | web e app | WCAG 2.2 AA; zero violação crítica |
| **Visual** | capturas Playwright/Maestro com comparação | telas e gráficos | gráficos 3D sempre com número exato visível |
| **Desempenho** | orçamento de tamanho (`tools/orcamento`), benchmark 3D (fps p90, RAM), abertura a frio, k6 (carga da API e do sync), Lighthouse CI (painéis) | CI + semanal em aparelho real | Perfil C ≤ 250 MB e ≥ 30 fps; abertura ≤ 3 s; API p95 < 300 ms |
| **Fala** | regressão FRR/FAR por grupo | `ml/regressao` | nenhum grupo piora além da tolerância |
| **Conteúdo** | validador de decodificabilidade, segurança e cultura | `content/` | bloqueante |
| **Segurança** | CodeQL, Semgrep, OSV, gitleaks, Trivy, Checkov, ZAP (staging), MobSF, pentest | CI + calendário | ver [seguranca-privacidade.md](seguranca-privacidade.md) |
| **Privacidade** | teste de log sem PII, auditoria de domínios do app infantil, verificação de RLS em migração nova | CI | bloqueante |
| **Caos e recuperação** | falha de AZ simulada (FIS), restauração de PITR, perda de fila | staging | mensal/trimestral |
| **Testes com crianças** | protocolo de usabilidade do rel. 24: 5–8 crianças por faixa etária, ≥ 3 regiões, termo dos responsáveis, observador treinado, sem gravação de imagem sem consentimento ⚖️ | homolog com contas de teste | toda tela ou jogo infantil novo ou alterado de forma relevante |
| **Testes com adultos** | 5 professoras + 5 responsáveis (incluindo baixa escolaridade) | homolog | toda tela adulta nova |

## 7. Definição de pronto (DoD)

Uma história só está **pronta** quando:

1. Código revisado e aprovado pelos CODEOWNERS exigidos; **CI verde** (todos os checks obrigatórios).
2. Testes de unidade/integração escritos; cobertura mínima mantida; vetores de `pedagogia` atualizados se a regra mudou.
3. **Privacidade:** nenhum dado novo de criança sem justificativa no PR; se houver, mapa de dados, RIPD e retenção atualizados; RLS e teste pgTAP no mesmo PR; logs sem PII.
4. **Segurança:** sem achado alto/crítico aberto de SAST/SCA/segredos; dependência nova com licença permitida e mantida.
5. **Acessibilidade:** WCAG 2.2 AA (adulto) e regras infantis (alvos, gestos, áudio em todo alvo, sem flash > 3/s, `prefers-reduced-motion`).
6. **Desempenho:** orçamentos respeitados (tamanho, RAM, fps, latência); testado no Perfil C quando for tela infantil.
7. **Offline:** funciona sem rede quando é fluxo infantil; sync testado.
8. **Conteúdo:** passou no validador e na revisão humana (pedagogia, fonoaudiologia, cultura quando aplicável).
9. **Tela infantil:** teste com 5–8 crianças com **≥ 80 % de sucesso sem ajuda** e **< 15 % de toques fora do alvo**; nenhuma fala proibida da Sofia; sem oferta de compra, link externo ou pressão.
10. **Observabilidade:** métricas, traces e alertas relevantes criados; métricas éticas afetadas mapeadas.
11. **Documentação:** ADR (se for decisão), runbook (se for operação), changelog (Changeset), glossário atualizado.
12. **Flag:** funcionalidade nova atrás de flag com plano de rollout e de remoção.
13. **Lojas:** se muda binário, checklist Kids/Famílias revisado.
14. Implantado em **homolog** e validado por produto + pedagogia; em **staging** quando for release.

## 8. Templates obrigatórios

- **PR:** objetivo, tipo, risco, como testar, capturas (app e web), checklist (privacidade, segurança, acessibilidade, desempenho, offline, conteúdo, crianças, lojas, flag), link para issue/ADR.
- **Issue:** bug (passos, aparelho/perfil, versão, sem dado pessoal), funcionalidade (problema, hipótese, métrica de aprendizagem/bem-estar), conteúdo (região, etapa, grafemas), **incidente de privacidade** (fluxo privado, aciona o encarregado).
- **ADR (MADR):** contexto, decisão, alternativas, consequências, status, data, revisores.
