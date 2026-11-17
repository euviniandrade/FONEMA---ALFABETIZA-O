# Verificação automática no GitHub (CI)

O GitHub confere o app sozinho a cada mudança enviada. Não custa nada: usa os minutos gratuitos do GitHub Actions.
O arquivo que manda nisso é `.github/workflows/ci.yml` (na raiz do repositório).

## O que roda e quando

**A cada push ou pull request** no ramo de trabalho (`claude/eager-brahmagupta-3d2lhr`) ou no `main`:

1. **Typecheck, lint, testes e build** (uns 3 minutos). Os testes já incluem o **verificador de decodificabilidade**
   (`packages/conteudo/test/decodificabilidade.test.ts`): se uma palavra tiver um som ainda não ensinado, o teste falha e o CI fica
   vermelho. O passo "Resumo do verificador" só mostra a contagem (itens, erros, avisos).
2. **E2E rápido** (`--sem-jornada`): só roda se o passo 1 passar. Abre o app de verdade num Chromium, servido a partir do `dist`
   (o mesmo que vai ao ar), e percorre cadastro, letra A, painel, Trilha dos Sons, Cantinho, **voz em tempo real**, cópia dos dados,
   jogos, mundo 3D, administrador e tutorial. Leva de 10 a 40 minutos; o limite é 45.

**Uma vez por semana** (domingo, 03:17 de Brasília) e **quando você mandar**: o **E2E completo**, com a jornada inteira (até 100 minutos).

Pushes só de textos `.md` ou de capturas (`app/docs/capturas/`) não disparam o CI. Se chegarem vários pushes seguidos, só o último roda
(os anteriores são cancelados), para não gastar minutos à toa.

## Onde ver

- No GitHub, aba **Actions** do repositório. Cada execução tem bolinha verde (passou), vermelha (falhou) ou amarela (rodando).
- Cada commit também ganha um ✓ verde ou ✗ vermelho ao lado, na lista de commits.
- Para rodar o E2E completo na hora: **Actions → CI → Run workflow**. No campo "modo" dá para pôr só um trecho
  (ex.: `--trilha-sons`, `--cantinho`, `--sem-jornada`); vazio = completo.

## Quando fica vermelho

1. Abra a execução vermelha e clique no passo com ✗. As últimas linhas dizem o que quebrou.
   - **Typecheck / Lint**: erro de código; a mensagem aponta arquivo e linha.
   - **Testes**: o nome do teste que falhou aparece com ✗. Se for `decodificabilidade`, alguma palavra nova usa um som que a
     criança ainda não aprendeu naquela fase (regra 2 do `CLAUDE.md`): troque a palavra ou mude a fase de lugar.
   - **Build**: o app não compila.
   - **E2E**: a última linha com ✓ mostra até onde o teste foi; logo depois vem o erro (geralmente "esperando tal botão aparecer").
2. Se foi o E2E, desça até **Artifacts** na página da execução e baixe `e2e-falha-…`. Dentro tem:
   - `e2e.log`: tudo o que o teste escreveu;
   - `capturas/pagina-NN.png`: como estava cada tela no momento da falha, e `capturas/paginas.txt` com o endereço de cada uma;
   - `servidor.log`: o servidor que serviu o app.
   Os arquivos ficam guardados por 14 dias.
3. Para repetir no computador (dentro de `app/`): `npm ci`, `npm run build` e `cd web && node e2e/fluxo.e2e.mjs --sem-jornada`.
4. Se o erro for do próprio GitHub (falta de rede, instalação do Chromium, "runner" que caiu) e não do app, clique em
   **Re-run jobs**. Se repetir, o problema é no `ci.yml`.

## Detalhes técnicos

- Node 22, `npm ci` com cache do npm (pelo `app/package-lock.json`).
- No CI o Chromium vem de `npx playwright install --with-deps chromium` (no ambiente de desenvolvimento ele já existe em
  `/opt/pw-browsers`); o caminho vai para a variável `CHROMIUM`, que o `fluxo.e2e.mjs` já lê.
- O `dist` é servido por `vite preview` na porta 4180 e o teste recebe `BASE_URL`.
- As capturas da falha vêm de `.github/ci/capturas-na-falha.mjs`, carregado com `node --import` antes do teste. Ele não muda o
  teste: só guarda os navegadores abertos e, quando o teste escreve o erro, fotografa cada página e fecha tudo.
- O build não precisa de nada fora do git: os modelos 3D (`.glb`) estão no repositório sem Git LFS, e as demos de
  `docs/propostas/06-fonema-unificada/` são copiadas para `web/public/` pelo próprio build.
- O E2E liga o "modo rápido" (`fonema-teste-rapido`), que encurta as falas. Por isso existe o trecho **voz em tempo real**
  (`e2e/trecho-voz-real.mjs`), que roda sem esse modo dentro do `--sem-jornada`. Problemas de voz fora desse trecho ainda
  podem passar despercebidos; ouvir o app continua necessário.
- Agendamento e o botão "Run workflow" só funcionam a partir do ramo padrão do repositório (hoje é o ramo de trabalho).
