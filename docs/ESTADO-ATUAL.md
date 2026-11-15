# FONEMA — Estado atual e passagem de bastão

Atualizado em 2026-11-15 (seção 4b, D030). **Leia este arquivo primeiro ao retomar o trabalho em qualquer sessão ou modelo.**
Tudo o que foi feito está neste repositório, no ramo `claude/eager-brahmagupta-3d2lhr` (commit e push a cada mudança). Nada depende
da memória da conversa anterior.

## 1. O que é o projeto

Plataforma educativa completa (web + app) de alfabetização pelo **método fônico** para crianças brasileiras (Maternal → 2º ano), com a
dupla **Sofia e Tales** (+ Bolota, o tatu; vilão leve Zum-Zum), em estilo de **filme de animação 3D**. Depois vira um universo infantil
(série, livros, YouTube, idiomas, profissões). O dono escreve em português e quer respostas em linguagem simples.

## 2. Onde está cada coisa

| O quê | Onde |
|---|---|
| Decisões do dono (valem como lei) | `docs/decisoes/001…030` — **a 030 é a mais recente** (arquitetura pedagógica); a 029 continua em execução |
| **Pedagogia (ler antes de mexer em conteúdo ou mecânica)** | `docs/pedagogia/` — princípios, trilha fônica, habilidades, sons, atividades, decodificabilidade, avaliação, fontes |
| Pesquisa (45 arquivos) e síntese | `docs/pesquisa/`, `docs/sintese/` — a 44 é o método fônico; a **45 é o vídeo de referência dos sons das letras** |
| Proposta unificada, artes, voz, músicas, universo | `docs/propostas/06-fonema-unificada/`, `docs/universo/` |
| Revisão geral e 10 perguntas ao dono (sem resposta) | `docs/revisao/` |
| Aplicativo | `app/` (npm workspaces: `packages/conteudo`, `packages/motor`, `web`) — ver `app/README.md` |
| Capturas de tela | `app/docs/capturas/` (`v3-*` entrada/cadastro; `alfabeto-*`; `v4-*` em andamento) |
| Auditoria de áudio | `app/docs/auditoria-audio.md`, `app/docs/auditoria-sons-letras.md` |

Comandos (em `app/`): `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run e2e` (≈20 min; curto:
`timeout 300 node web/e2e/fluxo.e2e.mjs --sem-jornada`).

## 3. O que está NO AR

- **https://fonema.vercel.app** (Vercel, time `team_CmFlTITpS6SX1kFvlvHHb2xL`, projeto `fonema`, raiz `app`, saída `web/dist`;
  publicar = criar deployment de produção a partir do ramo). Tem proteção de acesso: só o dono entra com o login dele. Não desligar sem ele pedir.
- Versão publicada = commit `147b0fd`: entrada "Quem vai entrar?" (aluno / família / professor / primeira vez), cadastro em 3 passos,
  configurações por cima, **Trilha do Alfabeto** (26 letras + revisões), áudio auditado, personagens "vivos" (vídeo recortado + boca no balão).
- O link antigo de prévia no claude.ai (artefato `98c0711b-…`) está desatualizado; o endereço oficial é o do Vercel.

## 4. O que o dono pediu por último (D029) e em que pé está

O dono testou o site em 14/11 e pediu as correções abaixo. Quatro frentes começaram e **pararam no meio por limite de uso do modelo**.
O código de todas está salvo e o `typecheck` passa, mas **nada foi revisado, testado de ponta a ponta nem publicado**.

### 4.1 Avatar montável em 3D + Lojinha (em andamento)
Pedido: fim dos 17 personagens em recorte de foto. Boneco 3D de verdade, 360°, que começa limpo e a criança monta (pele, rosto, olhos,
cabelo, camisa, calça/short, calçado). A montagem ensina a Lojinha (liberado × cadeado por fase + moedas). **Só masculino/feminino**
(sai "Prefiro não informar"); cada sexo vê só os seus itens. Óculos, aparelho auditivo, cadeira de rodas e pintura no rosto vão para a
seção **"Acessibilidade"** da Lojinha (grátis, opcional).
Feito até agora: `app/packages/conteudo/src/avatar.ts`, `app/packages/motor/src/avatar.ts` (+ testes),
`app/web/src/avatar3d/` (`glb.ts`, `modelo.ts`, `motor3d.ts`, `procedural.ts`), `componentes/Boneco3D.tsx`, `telas/crianca/Avatar.tsx`,
`telas/crianca/Lojinha.tsx`, `estilos-avatar.css`, `public/assets/avatar3d/manifesto.json`, `e2e/capturas-avatar.mjs`.
**Estrutura concluída e verificada (15/11):** montagem em 7 passos obrigatórios + vitrine da Lojinha, só menino/menina no cadastro,
migração dos cadastros antigos (sexo "n" → pergunta uma vez; recorte → boneco equivalente), Lojinha com cadeados por fase + moedas e
seção Acessibilidade, miniaturas em imagem (um WebGL fora da tela, com cache), carregador de GLB provado com arquivo de teste,
contrato em `app/docs/avatar-3d-contrato.md`, E2E (`--sem-jornada`) e capturas `app/docs/capturas/v4-avatar-*.png`.
Falta: os modelos GLB de verdade (70 arquivos, lista no contrato) e os áudios das 3 falas novas da montagem
(`FALAS.avatar`, `avatarSexo`, `avatarLojinha` e as perguntas de `PASSOS_AVATAR`). Os recortes antigos em `public/assets/avatar/` não são mais usados.
**Decisão do dono:** boneco desenhado em código "fica ruim" → os modelos devem vir de **plataforma de 3D** (Meshy/Tripo) ou artista;
o código só monta, gira e ilumina. O boneco procedural é reserva provisória. Aguardando o dono criar a conta e informar.

### 4.2 Espelho do Som (boca) novo em 3D (em andamento)
Pedido: refazer do zero em 3D animado, bonito; **frente e lado (raio-x) na mesma tela**.
Feito até agora: `docs/propostas/06-fonema-unificada/espelho-do-som-3d-v3/` (`espelho3d.js`, `modelo.js`, `fonemas.js`, `ar.js`,
`embed.html/js`, `reserva2d.js`, `ferramentas/capturar.mjs`), `app/web/src/mecanicas/Espelho.tsx`.
Falta: capturas de todos os fonemas, revisão de beleza e de fidelidade (usar a tabela da pesquisa 45), marcador "o som nasce aqui",
ligação com os sons puros, sincronização no script `web/scripts/sincronizar-espelho.mjs`, testes. A versão antiga (`espelho-do-som-3d/`) continua lá.

### 4.3 Sons reais das letras, vozes só da dupla, traçado com setas (em andamento)
Pedidos: (a) na fala dos personagens **só Sofia e Tales** (acabam as vozes com tom alterado de Bolota, Dona Cida etc.);
(b) **som real (fonema) de cada letra**, como no vídeo de referência — outra voz é permitida só para o som da letra;
(c) **setas numeradas e ponto de início** no traçado.
Feito até agora: `app/ferramentas/gerar-sons-letras.py`, 24 clipes em `app/web/public/audio/sons/`, `app/docs/auditoria-sons-letras.md`,
`web/src/servicos/sons-letras.ts` (+ teste), `servicos/estudio-sons.ts` e `telas/adulto/EstudioSons.tsx` (**estúdio para o adulto gravar
os sons pelo microfone**), `packages/conteudo/src/tracos.ts` (+ teste), `mecanicas/Tracar.tsx`, `mecanicas/Letra.tsx`, mudanças em `voz.ts`,
falas e fases.
Parou em: nova auditoria de áudio e capturas do traçado/estúdio. Falta: confirmar quais sons foram aprovados/reprovados, a brincadeira
de faz de conta por letra (pesquisa 45), trocar "cofrinho-tatu" por "porquinho" nas falas e regravar, regenerar `bocas.json`, E2E.
**Não copiamos o áudio do vídeo do YouTube** (direito autoral); o método vem do "Abecedário" do MEC, que é público.

### 4.4 Selos 3D, prêmios em 360° e porquinho (em andamento)
Pedidos: os selos planos estão errados — valem os **3D aprovados** (`recompensas-3d/capturas/01-todas-as-recompensas.png`);
**todo prêmio gira 360°**; o cofrinho passa a ser um **porquinho**.
Feito até agora: porquinho gerado e no app (`assets/recompensas/cofrinho-porquinho.webp`); quatro bases 3D em branco
(`assets/recompensas/bases/{estrela,escudo,medalha,hexagono}` + variantes bronze/prata/diamante/bloqueado/verso),
`web/scripts/gerar-selos.py`, `componentes/premio3d.ts`, `selo-pintura.ts`, `selos-geometria.json`, `recompensas.tsx`,
`estilos-recompensas.css`, `bancada-selos.html`.
Falta: conferir as capturas (4 formatos × 4 metais, nomes longos, giro em 5 ângulos), tela "Fase concluída", Álbum, testes.
O porquinho só balança; 360° real dele precisa de modelo 3D.

## 4b. D030 — arquitetura pedagógica fônica e a pasta `docs/pedagogia/`

Em 15/11 o dono pediu um diagnóstico pedagógico, enviou sete materiais de alfabetização e aprovou ("Sim, vamos implementar tudo") a
decisão [D030](decisoes/030-arquitetura-pedagogica-fonica-todos-os-metodos.md): o núcleo do FONEMA é **instrução fônica explícita e
sistemática**, somando em camadas os métodos de todos os materiais; **nada é removido**.

**O diagnóstico achou** (resumo; íntegra em `docs/pedagogia/fontes/01-diagnostico-do-codigo.md`): as atividades do Alfabeto tocam o
nome da letra e não o som; figura, dica, brilho e posição fixa entregam a resposta; 32 de 41 fases concluem só por participação e o
domínio conta autorrelato; a ordem é alfabética e só M, L e F são usados para ler; o verificador de decodificabilidade só confere
letras e não vale para o Alfabeto; não há frases, textos, fluência nem compreensão; a sondagem é única e não há reforço dirigido.

**Pasta `docs/pedagogia/` (etapa 1, entregue):** `README.md` (índice e regras), `00-principios`, `01-escopo-e-sequencia` (trilha fônica
em 53 unidades, TF-01 a TF-53), `02-matriz-de-habilidades`, `03-inventario-de-sons-pb`, `04-tipos-de-atividade`,
`05-regras-de-decodificabilidade`, `06-avaliacao-e-intervencao`, `07-fontes` e `fontes/` (cinco fichas de leitura na íntegra).
As regras permanentes estão no `CLAUDE.md` da raiz.

**Como fica o app:** a Trilha A–Z continua como "conhecer as letras"; ao lado entra a **trilha fônica** (vogais → consoantes que se
prolongam → oclusivas → abertas e nasais → R e H → dígrafos → regras de posição → encontros), que é a que libera leitura e escrita.

**Plano em 9 etapas** (estado em 15/11; detalhes em `docs/pedagogia/00-principios.md` §7):
1. Documentos e regras — **entregue**.
2. Registro detalhado de erros — **motor e painel entregues** (15/11): contrato `DetalheTentativa` em `app/packages/motor/src/estado.ts`
   (alvo, escolhido, respostas, distratores, tempoMs, tentativaNumero, tipo, mecanica, categoria), migração dos dados salvos (versão 1 → 2,
   `migracao.ts`), matriz de confusão e tempo (`confusao.ts`). Depende das mecânicas passarem os campos (frente de `web/src/mecanicas`).
3. Som no lugar do nome da letra — a fazer / em andamento.
4. Distratores, sorteio e fim do modelo permanente — a fazer / em andamento.
5. Exposição fora do domínio — **entregue no motor** (15/11): só tentativa avaliada conta (`tentativas.ts`, `dominio.ts`); Letra, Espelho,
   Traçar e Falar ficam como participação; fases marcam concluída × dominada; domínio antigo sem resposta conferida vira "a confirmar".
6. Trilha fônica — a fazer (sequência definida).
7. Verificador de decodificabilidade em tudo — a fazer (regras definidas).
8. Frases, textos, fluência e compreensão — a fazer.
9. Sondagem periódica e reforço dirigido — **parcial** (15/11): o motor agenda a sondagem (a cada 8 fases ou 30 dias, em `config.ts`),
   guarda o resultado por área (`sondagem.ts`), calcula a próxima prática recomendada, a volta ao pré-requisito e o alerta ao adulto
   (`reforco.ts`), e o painel do adulto mostra tudo (capturas `app/docs/capturas/v5-painel-*.png`, script `web/e2e/capturas-painel.mjs`).
   **Falta:** a tela da sondagem ainda é a Missão das Placas (mede sons das letras, leitura e segmentação; pseudopalavras e ditado sem
   placas); a prática recomendada ainda não vira rodada jogável para a criança; os números do alerta são decisão do projeto, sem calibragem.
Quem concluir uma etapa atualiza esta lista e a tabela de `00-principios.md` §7.

**Limites ditos com honestidade:** a sequência e as palavras de exemplo foram montadas pelo projeto a partir dos materiais e ainda não
foram revistas por alfabetizadora; vários pontos estão marcados "decisão do projeto" porque os materiais não dão base (lista em
`01-escopo-e-sequencia.md` §5); nenhum som puro foi ouvido por pessoa; as citações do *Alfaletrar* foram transcritas a olho.

**Pendências do dono (D030):** validar de ouvido os sons puros (de preferência fonoaudióloga); créditos de voz para as falas novas;
e as decisões listadas em `docs/pedagogia/07-fontes.md` §5 (posição dos dígrafos, pronúncia de "ti/di" e do R na voz da dupla,
palavras como "cama" antes das nasais, lista de palavras frequentes, exemplar regular do *Alfaletrar*, revisão por especialista).

## 5. Como retomar (passo a passo)

1. `git pull` no ramo `claude/eager-brahmagupta-3d2lhr`; em `app/`: `npm install`, `npm run typecheck`, `npm test`.
2. Para cada frente da seção 4: ler os arquivos listados, rodar a bancada/capturas, **olhar as imagens** e completar o que falta.
   Uma frente por vez, ou em paralelo com donos de arquivo separados (os arquivos de cada frente estão listados acima).
3. Quando as quatro estiverem prontas: `typecheck`, `lint`, `test`, `build`, E2E completo, conferir capturas em 1850x980 e 390x844,
   rodar a auditoria de áudio, e só então publicar no Vercel e avisar o dono **com os limites ditos com honestidade**.
4. O dono pediu: "só me envie quando estiver tudo 100%".

## 6. Regras que não podem ser quebradas

- **Segredos**: chaves só pelo proxy do ambiente (ElevenLabs: cabeçalho `xi-api-key: proxy-injected`; Google AI Studio:
  `x-goog-api-key: placeholder`). Nunca em código nem no chat. `.env*` fora do git.
- **Vozes**: Sofia `nlRJzw7MAFZF6truVWij` (modelo `eleven_multilingual_v2`); Tales `HUKUk1tOcZ0szNQgemif` (**sempre `eleven_v3`**; em v2 soa adulto).
  Nunca voz do navegador. Nenhum áudio vai ao ar sem auditoria. O ElevenLabs bloqueia voz infantil sintética: não contornar.
- **Crianças**: só adulto cadastra; avatar sem foto de criança; criança nunca digita senha; dados mínimos (LGPD art. 14, ECA Digital);
  itens legais "verificar com advogado". Não enviar foto de criança real a serviços externos.
- **Valores (D008, D009, D012, D013)**: sem joias/adornos, sem arco-íris, sem festa junina/carnaval/halloween/magia/folclore;
  criança chamada sempre pelo nome; família com pai e mãe nas primeiras fases.
- **Qualidade (D025)**: padrão visual de animação 3D em tudo; sem emojis como ícones.
- **Direitos**: personagens originais; nada de logotipos/brasões oficiais; "Boquinhas" é marca de terceiros (o nosso é "Espelho do Som");
  não copiar áudio/imagem de vídeos de terceiros.
- **Servidor/banco de dados real com contas**: só com confirmação explícita do dono (ainda não deu). Hoje a conta e o PIN ficam no aparelho.
- **Git**: commit e push no ramo a cada mudança; sem nome de modelo em commits/código.
- **Pedagogia (D030)**: as nove regras permanentes do `CLAUDE.md` (som antes do nome da letra; nenhuma palavra com valor sonoro não
  ensinado; figura, dica e posição não entregam a resposta; exposição não é domínio; verificador e testes sempre; sem famílias silábicas
  como método; não remover funcionalidades; não inventar referências; materiais de terceiros não são copiados).

## 7. Recursos e cotas (situação em 14/11)

- **Google AI Studio** (imagem `gemini-3-pro-image`, vídeo, música, transcrição): **cota mensal esgotada** (429/402). O dono precisa aumentar o limite.
- **Cloudinary** (geração de imagem pela conta do dono): restam **27 de 50** (≈1–2 imagens). Download liberado pelo dono em
  `upload-us-east-1.cloudinary.com` e `res.cloudinary.com`.
- **ElevenLabs**: ≈115 mil de 131 mil caracteres usados; sobra pouco (≈16 mil).
- **vidIQ**: usado para assistir o vídeo de referência (transcrição + análise visual).
- **Plataforma de 3D**: nenhuma conectada. Recomendação: Meshy (ou Tripo). O dono também citou "Muse AI" (1 bilhão de tokens) —
  **falta ele dizer o site e o que gera**; se gerar imagem ou 3D, resolve selos/figuras/boneco.

## 8. Perguntas abertas com o dono

1. Conta na plataforma de 3D (Meshy/Tripo) e o que é exatamente o "Muse AI".
2. Aumentar a cota do Google AI Studio ou do Cloudinary para o resto das artes.
3. Quem grava os sons puros das letras no estúdio (o dono, uma professora, uma fonoaudióloga)? Ou pedir autorização ao canal do vídeo?
4. Servidor e banco de dados para login em qualquer aparelho (precisa de confirmação + LGPD).
5. Decisões pedagógicas da D030: lista em `docs/pedagogia/07-fontes.md` §5.
6. As 10 perguntas de `docs/revisao/`; nome do universo; idade da Sofia; emblema próprio; nomes repetidos de personagens.

## 9. Pendências menores conhecidas

- Figura do jacaré (J), poses mais nítidas da dupla no cadastro, Paçoca e gato, mais estados dos personagens vivos (dependem de cota de imagem).
- Áudio: "I, de ilha" com gravação antiga; "U ou O," e uma fala do Tales ruins; 66 clipes curtos a conferir de ouvido;
  sílabas do nome nas palmas sem voz para quase todos os nomes.
- Personagens vivos: boca aproximada, só o rosto do balão fala, balões sem expressões, Safari/iPad não testado.
- Conferir no site se o painel de configurações ainda aparece atrás do cartão (no teste local abre por cima).
- Área da Família vazia em tela grande com uma criança só; CSS antigo sem uso em `estilos.css`.
