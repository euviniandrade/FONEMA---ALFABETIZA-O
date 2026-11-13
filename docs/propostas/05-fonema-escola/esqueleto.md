# Esqueleto do repositório — FONEMA Escola

Monorepo **pnpm + Turborepo**, TypeScript estrito em tudo, Node 22 LTS.

```
fonema/
├── apps/
│   ├── app/                    # React Native + Expo (criança, família, modo sala, modo professor)
│   │   ├── app/                # rotas (expo-router)
│   │   │   ├── (sala)/         # troca de perfil, duplas, estação
│   │   │   ├── (crianca)/      # mapa, lição, missões, vila, lojinha
│   │   │   ├── (familia)/      # área do responsável (porteira parental)
│   │   │   └── (professor)/    # modo professor no tablet (porteira)
│   │   ├── src/
│   │   │   ├── db/             # WatermelonDB: modelos, migrações locais
│   │   │   ├── sync/           # cliente do protocolo pull/push
│   │   │   ├── fala/           # ponte nativa para VAD/verificador
│   │   │   └── espelho/        # Espelho do Som (vídeo + espelho local)
│   │   └── e2e/                # Maestro
│   ├── paineis/                # Next.js: professor, escola, secretaria, conteúdo, suporte
│   │   ├── app/(professor)/  app/(escola)/  app/(secretaria)/  app/(conteudo)/
│   │   └── e2e/                # Playwright
│   ├── api/                    # NestJS
│   │   ├── src/modulos/
│   │   │   ├── identidade/  tenancy/  roster/  sync/  progresso/  provinhas/
│   │   │   ├── recomendacao/  conteudo/  familia/  mensagens/  relatorios/
│   │   │   ├── formacao/  medicao/  consentimentos/  auditoria/
│   │   ├── src/workers/        # consumidores SQS (mesma base de código, outro entrypoint)
│   │   ├── prisma/ ou migrations/   # migrações SQL versionadas + políticas RLS
│   │   └── test/               # integração com Postgres real (Testcontainers)
│   └── ota/                    # servidor de atualizações (protocolo expo-updates)
├── packages/
│   ├── dominio/                # regras puras: escala 0–10, domínio, agendador, grupos (roda no app e na API)
│   ├── contratos/              # schemas zod + tipos OpenAPI gerados
│   ├── sync-protocolo/         # formato de eventos e cursores, compartilhado
│   ├── ui-crianca/             # componentes RN lúdicos (Andika, alvos ≥ 96 dp)
│   ├── ui-painel/              # componentes React institucionais (Atkinson Hyperlegible)
│   ├── design-tokens/          # cores, tipografia, espaçamentos (fonte única → RN e CSS)
│   ├── jogos/                  # atividades 2D (PixiJS)
│   ├── personagens/            # Sofia e Bolota (Rive), visemas
│   ├── i18n/                   # textos pt-BR (e variantes regionais de áudio)
│   └── config/                 # eslint, tsconfig, prettier, jest/vitest
├── conteudo/                   # lições, palavras, histórias (YAML) + linter de decodificabilidade
├── infra/
│   ├── terraform/
│   │   ├── modulos/            # vpc, ecs-servico, rds, keycloak, cdn, backup, observabilidade
│   │   ├── contas/             # organization, security, shared-services
│   │   └── ambientes/{dev,hml,prod}/
│   └── mdm/                    # políticas de dispositivo e configuração gerenciada (JSON)
├── docs/
│   ├── adr/                    # registros de decisão (0001…)
│   ├── runbooks/               # incidentes, restauração, rotação de chaves
│   ├── privacidade/            # RIPD, mapa de dados, contratos-modelo
│   └── guia-professor/         # fonte do guia e do kit impresso
└── .github/
    ├── workflows/              # ci.yml, infra.yml, app-build.yml, deploy.yml
    ├── CODEOWNERS
    └── PULL_REQUEST_TEMPLATE.md
```

## Convenções

**Código**
- TypeScript `strict`; proibido `any` sem justificativa em comentário.
- **Termos de domínio em português sem acento** (`turma`, `aluno`, `nivelFonema`, `provinha`), termos técnicos em inglês (`controller`, `repository`). Glossário em `docs/glossario.md`.
- Regras pedagógicas só em `packages/dominio` (funções puras, 100% testadas). App e API importam a mesma implementação.
- Validação de entrada com zod em `packages/contratos`; a API gera o OpenAPI e os painéis consomem o cliente gerado.
- Nenhum dado pessoal em log: logger com lista de campos permitidos; teste de CI que falha se encontrar nome/telefone em log.

**Banco**
- Migrações SQL versionadas e revisadas; toda tabela nova com `rede_id` e política RLS no mesmo PR (verificado no CI).
- Migrações **expand/contract** (nunca quebrar a versão anterior do app que ainda está offline).

**Git**
- `main` protegido; branches curtos `tipo/descricao-curta` (`feat/troca-perfil-qr`).
- **Conventional Commits** (`feat:`, `fix:`, `chore:`…); changelog gerado.
- PR com revisão obrigatória (2 aprovações em `infra/`, `api/src/modulos/identidade`, `tenancy`, `consentimentos`), CI verde, checklist de privacidade.

**Testes**
- Unidade (Vitest/Jest), integração da API com Postgres real e RLS ativa, E2E web (Playwright), E2E app (Maestro) em Android de entrada.
- Teste obrigatório de **sync offline**: 40 perfis, 30 dias de eventos, reconexão.
- Critério de "pronto" de tela infantil: teste com 5–8 crianças (≥ 80% de sucesso sem ajuda).

**Conteúdo**
- Toda lição passa pelo linter de decodificabilidade e por revisão pedagógica; clipes do Espelho do Som aprovados por 2 fonoaudiólogas.

**Versões**
- App: versão semântica + `runtimeVersion` do Expo; o servidor de sync aceita as 2 últimas versões de protocolo.
- API: versionamento por cabeçalho; mudanças incompatíveis só com nova versão do protocolo de sync.
