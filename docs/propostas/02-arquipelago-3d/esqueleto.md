# Esqueleto do repositório — Proposta 2 "Arquipélago 3D"

Um monorepo com o projeto Unity, a web, o backend e o pipeline de conteúdo. Ferramentas: **pnpm + Turborepo** para TS, **Unity 6 LTS** para o jogo, **uv** para Python, **Git LFS** para binários.

## 1. Estrutura de pastas

```
fonema/
├─ apps/
│  ├─ jogo-unity/                      # projeto Unity 6 (iOS, Android, WebGL)
│  │  ├─ Assets/
│  │  │  ├─ _Fonema/
│  │  │  │  ├─ Core/                   # Fonema.Core.asmdef — tipos, contratos gerados, util
│  │  │  │  ├─ Pedagogia/              # Fonema.Pedagogia.asmdef — C# puro, sem UnityEngine
│  │  │  │  ├─ Conteudo/               # leitura do language pack
│  │  │  │  ├─ Fala/                   # Sentis/ONNX, VAD, tolerância
│  │  │  │  ├─ Sofia/                  # roteiro, áudio, visemas → Rive
│  │  │  │  ├─ Licoes/                 # UI Toolkit (UXML/USS) + jogos 2D
│  │  │  │  │  └─ EspelhoDoSom/
│  │  │  │  ├─ Mundo/                  # ilhas, navegação, câmera guiada (URP)
│  │  │  │  ├─ ModoLeve/               # mapa 2D com impostores
│  │  │  │  ├─ Avatar/  Vila/  Economia/  Termometro/
│  │  │  │  ├─ Dados/                  # SQLite criptografado, fila de sync, cliente Firebase
│  │  │  │  ├─ Porteira/               # gate adulto + IAP
│  │  │  │  └─ Bootstrap/              # cena inicial, perfil de aparelho, DI
│  │  │  ├─ Arte/                      # FBX/glTF low-poly, materiais (sem texturas de foto)
│  │  │  │  ├─ Ilhas/R00_Quintal/ … R10_ArquipelagoLivros/
│  │  │  │  └─ Impostores/             # sprites gerados para o Modo Leve (não editar à mão)
│  │  │  ├─ AddressableAssetsData/     # grupos por ilha + "nucleo"
│  │  │  └─ Tests/
│  │  │     ├─ EditMode/               # motor pedagógico, economia, gerador (rápidos)
│  │  │     └─ PlayMode/               # fluxos de sessão, orçamento de desempenho
│  │  ├─ Packages/manifest.json
│  │  └─ ProjectSettings/
│  └─ web/                             # Next.js (App Router)
│     ├─ app/
│     │  ├─ (publico)/                 # site, preços, privacidade
│     │  ├─ (adulto)/responsavel/      # painel dos pais
│     │  ├─ (adulto)/professor/        # turma, mapa de calor, grupos
│     │  ├─ (adulto)/rede/             # secretaria: só agregados
│     │  ├─ (interno)/editorial/       # revisão de conteúdo, fila de escuta
│     │  └─ jogar/                     # host do build WebGL / Modo Leve web
│     ├─ components/  lib/  tests/
├─ services/
│  ├─ functions/                       # Cloud Functions 2ª geração (TypeScript)
│  │  ├─ src/sync/  src/dominio/  src/relatorios/  src/assinaturas/  src/lgpd/  src/tokens/
│  │  └─ test/                         # com emulador do Firebase
│  ├─ conteudo-pipeline/               # Node/Python: TTS Azure, visemas, linter, empacotamento
│  └─ fala-ml/                         # Python: treino, destilação, export ONNX, regressão
├─ packages/
│  ├─ contratos/                       # JSON Schema = fonte única → gera C# (Core) e TS/Zod
│  ├─ curriculo/                       # language pack pt-BR: etapas 0–10, grafemas, palavras, textos
│  ├─ ui-web/                          # componentes das áreas adultas
│  └─ config/                          # eslint, tsconfig, prettier
├─ infra/
│  ├─ terraform/ (modulos/, ambientes/dev|hml|prd)
│  └─ firebase/ (firestore.rules, firestore.indexes.json, storage.rules)
├─ .github/ (workflows/, PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE/, CODEOWNERS)
├─ docs/ (decisoes/ = ADRs, sintese/, pesquisa/, propostas/)
├─ .gitattributes  .editorconfig  turbo.json  pnpm-workspace.yaml
```

## 2. Convenções

**Código**
- Pastas e conceitos de domínio em **pt-BR** (`Economia`, `Cofrinho`, `Termometro`); termos técnicos podem ficar em inglês (`Repository`, `Service`).
- C#: namespaces `Fonema.<Modulo>`, um **asmdef por módulo**, dependências só para baixo (`Core ← Pedagogia ← Licoes`). `Fonema.Pedagogia` e `Fonema.Economia` **não referenciam UnityEngine**: são testáveis em EditMode e portáveis.
- `MonoBehaviour` só como "cola" de apresentação. Dados de design em `ScriptableObject`; dados pedagógicos em JSON vindo de `packages/curriculo`.
- TypeScript estrito; validação com Zod gerado de `packages/contratos`. Nenhum tipo de domínio escrito duas vezes à mão.
- Formatação: `dotnet format` + `.editorconfig` (C#); Prettier + ESLint (TS); Ruff (Python).

**Unity**
- **Git LFS** para `*.fbx, *.glb, *.png, *.psd, *.wav, *.mp4, *.onnx`; *Force Text* serialization; **UnityYAMLMerge** configurado; cenas pequenas e *prefabs* aninhados para evitar conflito.
- Nomes de ilha com prefixo de região: `R02a_MataVale`, `R03_Pampa`.
- Orçamento por ilha, checado no CI: triângulos, materiais, MB do bundle 3D e do Leve, RAM em PlayMode.
- Sem pacotes Unity de analytics/ads; `com.unity.analytics` e Cloud Diagnostics removidos/desligados (checagem no CI).

**Conteúdo**
- Toda palavra/texto passa pelo **linter de decodificabilidade** (bloqueia o merge).
- Áudios e visemas são **versionados** (`sofia/v{n}/…`); nunca se sobrescreve um arquivo publicado.
- Clipes do Espelho do Som exigem duas aprovações de fonoaudiólogas (campo no manifesto).

**Git**
- `main` protegida; branches `feat/`, `fix/`, `conteudo/`, `infra/`, `docs/`.
- Commits convencionais em pt-BR (`feat(economia): cofrinho com meta`).
- PR com template (o quê, por quê, risco à criança, privacidade, desempenho em 2 GB) e 1–2 revisões; `CODEOWNERS` exige pedagogia em `packages/curriculo/` e `Licoes/`.
- Decisões de arquitetura viram ADR em `docs/decisoes/`.
