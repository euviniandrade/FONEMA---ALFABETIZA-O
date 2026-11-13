# Esqueleto do repositório — Expedição Sofia

Monorepo **pnpm + Turborepo**, TypeScript estrito em tudo. Um único app web (`apps/web`) vira PWA e, via Capacitor, apps Android e iOS (`apps/native`).

## 1. Estrutura de pastas

```text
fonema/
├─ apps/
│  ├─ web/                      # Next.js 15 (output: 'export') — PWA da criança e dos adultos
│  │  ├─ app/
│  │  │  ├─ (crianca)/          # rotas da área infantil: sem texto de navegação, sem links externos
│  │  │  │  ├─ temporadas/      # tela de temporadas + termômetro sem números
│  │  │  │  ├─ episodio/[id]/   # monta o Player de Episódios
│  │  │  │  ├─ espelho/[fonema]/
│  │  │  │  ├─ lojinha/
│  │  │  │  ├─ vila/
│  │  │  │  └─ livro/           # "Livro da minha jornada" (produções da criança)
│  │  │  ├─ (adulto)/           # atrás da porteira parental
│  │  │  │  ├─ familia/         # "Nível X de 10", missão da semana, assinatura
│  │  │  │  ├─ professor/       # turma, grupos, modo sala
│  │  │  │  └─ conta/           # consentimentos, exportar/apagar dados
│  │  │  └─ sala/[turma]/       # modo sala (projeção)
│  │  ├─ public/                # ícones, manifest, fontes (Andika, Fredoka — OFL)
│  │  ├─ sw/                    # service worker (Workbox): precache do shell, rotas de pacote
│  │  └─ next.config.ts
│  └─ native/                   # Capacitor 7
│     ├─ capacitor.config.ts
│     ├─ android/               # projeto Gradle gerado + ajustes (Families, sem AD_ID)
│     ├─ ios/                   # projeto Xcode gerado + ajustes (Kids)
│     └─ fastlane/              # builds e envio às lojas
├─ packages/
│  ├─ player/                   # motor de episódios sobre PixiJS (cenas, camadas, falas, legendas, destraves)
│  ├─ sofia/                    # wrapper Rive: estados, visemas, gestos de apontar
│  ├─ jogos/                    # mini-jogos (letras móveis, pares mínimos, sequências, Estúdio de Histórias)
│  ├─ fala/                     # Web Worker: VAD + verificador CTC (ONNX Runtime Web), teste de capacidade
│  ├─ adaptativo/               # domínio por grafema, revisão espaçada, sobrecarga, termômetro local
│  ├─ curtas/                   # gerador procedural de missões + banco de palavras
│  ├─ conteudo-schema/          # esquemas Zod do roteiro, do manifesto e dos itens da lojinha
│  ├─ decodificavel/            # linter: grafemas por temporada, lista de alta frequência, pseudopalavras
│  ├─ dados/                    # Dexie (IndexedDB), fila de eventos, cliente de sync, cifragem local
│  ├─ economia/                 # carteira, cofrinho, preços fixos, regras anti-sorte
│  ├─ ui/                       # componentes React com o design system (tokens, botões, balões, termômetros)
│  └─ config/                   # eslint, tsconfig, prettier, vitest compartilhados
├─ supabase/
│  ├─ migrations/               # SQL versionado (tabelas, RLS, funções)
│  ├─ functions/                # Edge Functions: sync, nivel, pagamentos, relatorios
│  ├─ seed/                     # dados fictícios para dev
│  └─ tests/                    # testes de RLS (pgTAP)
├─ conteudo/
│  ├─ temporadas/
│  │  ├─ t01-quintal/
│  │  │  ├─ temporada.yaml      # grafemas, pergunta-guia, cores, itens da lojinha
│  │  │  └─ episodios/
│  │  │     └─ e01-o-bolota-chegou.yaml
│  │  └─ t06-cerrado/ …
│  ├─ palavras/                 # banco validado: palavra, grafemas, sílabas, imagem, temporada mínima
│  ├─ espelho/                  # metadados dos clipes por fonema (vídeo fica no armazenamento de mídia)
│  ├─ cenarios/                 # fontes vetoriais (SVG) e .riv por temporada
│  └─ vozes/                    # roteiros de fala; áudios gerados NÃO entram no git
├─ ferramentas/
│  ├─ estudio/                  # CLI: validar → gerar voz/visemas → empacotar → publicar no R2
│  └─ dispositivos/             # scripts de teste de desempenho em Android real
├─ docs/                        # ADRs, guias, este esqueleto
├─ .github/
│  ├─ workflows/                # ci.yml, conteudo.yml, release-web.yml, release-android.yml, release-ios.yml
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ ISSUE_TEMPLATE/
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

## 2. Convenções

**Código**
- TypeScript `strict`; ESLint + Prettier; nada de `any` sem comentário.
- Pacotes de domínio (`adaptativo`, `curtas`, `economia`, `decodificavel`) são **puros** (sem DOM, sem rede) e testados com Vitest, com cobertura mínima de 90%.
- Componentes da área infantil **não podem** importar módulos de rede de terceiros. Uma regra de lint (`no-restricted-imports`) e um teste de bundle bloqueiam SDKs de analytics/anúncios.
- Nomes de domínio em português (`temporada`, `episodio`, `grafema`, `moedinha`), nomes técnicos em inglês quando forem do framework.
- Acessibilidade: todo alvo tocável da criança tem ≥ 72 dp, rótulo falado e `aria-label`; testes automáticos com axe nas áreas de adulto.

**Git**
- Branch principal `main` protegida; trabalho em `feat/…`, `fix/…`, `conteudo/t06-e04`.
- Commits convencionais (`feat:`, `fix:`, `conteudo:`, `docs:`); PR com revisão obrigatória e CI verde.
- Conteúdo pedagógico pede **2 revisões**: uma técnica e uma pedagógica (e fonoaudiológica nos clipes do Espelho do Som).
- Decisões de arquitetura registradas como ADR em `docs/adr/NNN-titulo.md`.

**Conteúdo**
- Um arquivo YAML por episódio, com `id` no formato `tNN-eNN`.
- Toda palavra para a criança ler passa no linter; exceções só pela lista de alta frequência versionada.
- Imagens e áudios gerados ficam fora do git (armazenamento de mídia versionado por hash); o repositório guarda as fontes (roteiro, SVG, `.riv`).
- Licenças de cada ativo em `conteudo/LICENCAS.csv` (sem CC-BY-NC, GPL ou CC-BY-SA em material sincronizado).

**Versões**
- App: SemVer (`1.4.0`); conteúdo: versão por temporada (`t06@3`). O app declara qual versão do esquema de conteúdo entende; pacotes incompatíveis não são baixados.
