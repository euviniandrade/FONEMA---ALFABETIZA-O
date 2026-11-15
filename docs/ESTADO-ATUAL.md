# FONEMA — Estado atual e passagem de bastão

Atualizado em 2026-11-15 (seção 4b, D030). **Leia este arquivo primeiro ao retomar o trabalho em qualquer sessão ou modelo.**
Tudo o que foi feito está neste repositório, no ramo `claude/eager-brahmagupta-3d2lhr` (commit e push a cada mudança). Nada depende
da memória da conversa anterior.

## 0. Situação agora (15/11/2026, 23h UTC) — leia isto primeiro

O dono vai continuar o trabalho com outro modelo (Opus). Tudo está no ramo `claude/eager-brahmagupta-3d2lhr`, com commit e push.
**Nenhum agente está rodando**; não há trabalho pela metade fora do repositório.

**No ar:** https://fonema.vercel.app = commit `841c099` (publicado em 15/11, 21h50 UTC). Verificado antes de publicar: typecheck, lint,
144 testes, build e E2E completo (na 2ª rodada passou inclusive o troféu da Festa do Alfabeto; a 1ª rodada falhou só nesse ponto,
por ordem de tentativas do próprio teste).

**O que entrou nesta versão (tudo feito em 15/11):**
- D030: `docs/pedagogia/` (princípios, trilha fônica em 53 unidades TF-01…TF-53, matriz de habilidades, inventário de sons, tipos de
  atividade, decodificabilidade, avaliação, fontes) e regras pedagógicas no `CLAUDE.md`. Etapas 1 a 5 do plano feitas; 9 parcial.
- Motor: registro detalhado da tentativa, concluído × dominado, matriz de confusão, reforço recomendado, sondagem agendada, painel do adulto novo.
- Mecânicas: som da letra como estímulo, letra → som, correção contrastiva, sorteio, pares e letras parecidos, montar sem modelo,
  jogo **Liga o som** (cenas em `assets/figuras/`), verificador de conteúdo mais rígido.
- Avatar: **modelos 3D reais** (GLB) menino/menina padrão (roupa branca com o A azul, D029 §7), recoloração por máscaras (pele em 10 tons,
  olhos, cabelo, camiseta, calça, calçado), Lojinha, miniaturas. Prêmios 3D reais (porquinho, troféu, baú) girando 360°. Selos 3D.
- Modelos 3D gerados no Higgsfield (Tripo, imagem → GLB): `app/web/public/assets/modelos3d/` (comprimidos) e originais em
  `docs/propostas/06-fonema-unificada/{recompensas-3d,personagens-3d,avatar-3d/padrao}/modelos/`. Ferramenta de prévia:
  `recompensas-3d/ferramentas/capturar-glb.mjs`. (Sofia, Tales e Bolota em 3D nas telas: ver o bloco abaixo.)
- 24 figuras novas das letras + 17 cenas de som pela MiniMax (`app/ferramentas/gerar-figura-minimax.py`, recorte por rembg).

**Avaliação, reforço e personagens 3D (15/11, noite; NÃO publicado ainda; capturas `app/docs/capturas/v7-*.png`):**
- **Sondagem periódica em 5 placas** (`web/src/telas/crianca/Sondagem.tsx`, itens em `motor/src/sondagem-itens.ts`): sons das letras
  (som puro → letra), leitura de palavras (palavra → figura), pseudopalavras conferidas (vê o "nome de bichinho", ouve 3 leituras, escolhe),
  quantos sons (com exemplo feito pela Sofia) e ditado com letras móveis. Só entram letras de fases concluídas e valores sonoros de regiões
  concluídas (teste em `motor/test/etapa9.test.ts`). Sem dica, nota ou "errado" para a criança. A 1ª sondagem continua a Missão das Placas.
- **Treino rápido com a Sofia** (`Treino.tsx`, `motor/src/reforco-treino.ts`): botão na vila e no fim da missão quando há algo a reforçar
  (1 vez por dia); rodada de 3 a 5 perguntas do par confundido, com volta ao pré-requisito; respostas avaliadas no contexto "reforço"; sem moedinhas.
- **Painel**: sondagens lado a lado (até 3), "subiu/caiu", o que a criança escreveu no ditado, queda vira alerta com "voltar uma fase",
  quanta ajuda precisou, sinal de chute, treinos feitos.
- **Selos**: os de habilidade só contam resposta conferida, certa e sem ajuda ("Ler a primeira palavra" deixou de valer pelo "Li!";
  ditado conta palavras certas); selos de participação marcados como "participação" no Álbum; nada já ganho é tirado.
- **Contrato do motor** (campos opcionais novos em `DetalheTentativa`, para as mecânicas passarem a gravar): `nivelAjuda`
  ('nenhuma' | 'repetiu' | 'contraste' | 'caminho' | 'resposta-mostrada'), `ouviuDeNovo`, `posicaoCerta`, `posicaoEscolhida`, `nOpcoes`,
  `contexto` ('trilha' | 'revisao' | 'sondagem' | 'reforco'). Sem eles o motor deduz o nível de ajuda pelo nº da tentativa.
- **Sofia, Tales e Bolota em 3D girável** (arrastar gira, balanço/giro lento, luz de estúdio, sombra de contato, respiração por escala;
  three.js só sob demanda; imagem parada sem WebGL; "menos movimento" respeitado): Álbum ("Conheça a Sofia e o Tales"), Chegada,
  sondagem e treino (`componentes/Personagem3D.tsx`, `premio3d.ts`). O busto que fala no balão continua onde a boca importa. As poses do
  cadastro (acenando, apontando, pensando) continuam em imagem: os modelos não têm esqueleto. De perto, os dedos dos modelos são "grudados"
  (tipo luva): por isso o enquadramento é sempre de corpo inteiro.
- Figuras `cena-o` (chamando de longe, mãos em concha, boca em O) e `cena-n` (boca fechada, "não" com a cabeça; os arcos de movimento
  foram desenhados por cima) refeitas; estrela da Fase concluída sem o halo claro.
- **Pendente**: voz para "Quantos sons tem a palavra? Escuta comigo." (hoje só escrita; o exemplo com sons puros mostra a ideia);
  mecânicas gravarem os campos novos; ditado de frases, leitura cronometrada e compreensão na sondagem; calibrar os números (queda de
  25 pontos, chute < 1,2 s).

**Trilha dos Sons — a trilha fônica que ensina a ler (D030 etapas 6–8; 15/11, noite; NÃO publicado ainda):**
- **24 fases novas** (região `TF`, `app/packages/conteudo/src/fases/tf.ts`): TF-01…TF-22 (vogais; sons que esticam M F V L S, regra
  "O/E no fim soam U/I", N Z J; sons que estouram P T B C D G, regra TI/DI) + revisões TF-R2 e TF-R3. Jornada: Alfabeto → **Trilha dos
  Sons** → Ilha das Vogais (é/ê, ó/ô = TF-23/24) → Vale do M-L-F (vira revisão/chefe) → Meu nome. "Já conhece as letras e os sons" começa
  em TF-06. Tela própria `#/c/:id/sons` (botão "Sons" na vila; ilha nova no arquipélago): verde = concluída, dourado = dominada.
- **Lição (7–8 cenas):** revisão cumulativa → **som novo** (faz de conta → som real com a boca → só depois a letra) → som → letra →
  **síntese** com sons emendados (eu faço, nós fazemos, você faz) → ler palavras (figura e leituras faladas) + **2 palavras inventadas
  conferidas** → **caixas de sons** (segmentar e escrever) → um desafio (**frase** com pergunta, **pares mínimos** ou **troca-letras**).
  Traçado fica na Trilha A–Z; letra → som e leitura em **eco** ficam nas revisões. Mecânicas em `app/web/src/mecanicas/` (`SomNovo`,
  `Sintese` + `sons-emendados.ts`, `Caixas`, `ParMinimo`, `Troca`, `Frase`, `tf-comum.tsx`); gravam o contrato completo do motor.
- **Verificador completo** (`conteudo/src/decodificabilidade.ts`, `fases/verificar-fases.ts`, banco com pronúncia anotada `fases/tf-banco.ts`):
  valores sonoros por unidade (53), erro × aviso, frases/textos, palavras inventadas, todas as trilhas; falha o build. Relatório:
  `app/docs/relatorio-decodificabilidade.md` (`npx tsx scripts/relatorio-decodificabilidade.ts`).
- Sons "duvidosos" (L, V, J e os de estouro) nunca são o único estímulo de item que conta: ali a Sofia fala a sílaba ("pa", "la").
- **Vozes:** 237 clipes novos da Sofia (molduras genéricas, palavras, palavras inventadas, 9 frases) + 4 regravações; masterizado,
  auditado (sobram 2 graves da trilha: a dica "O som do U" e "Vamos conferir…" marcado como curto, que soa certo) e `bocas.json` refeito.
  ElevenLabs: ≈ 11,2 mil caracteres restantes. Figura nova: `bala` (MiniMax).
- **Pendente:** ouvir as palavras inventadas e "tia/dia" (voz sintética); selos para as consoantes novas (regra fica no motor);
  sincronia real das palavras no eco; revisão das listas por alfabetizadora; blocos 4 a 8 (TF-23…TF-53).

**Próximos passos, em ordem:**
1. **Trilha fônica, blocos 4 a 8** (TF-23…TF-53: abertas e nasais, R e H, dígrafos, regras de posição, encontros), textos
   decodificáveis e fluência; jogos dos materiais (batalha de palavras, palavra dentro de palavra, rimas). Blocos 1–3 prontos (bloco acima).
2. **Etapa 9**: feito o essencial (bloco acima); falta as mecânicas gravarem os campos novos e a voz da instrução de segmentação.
3. **Boca (Espelho do Som)**: o dono reprovou a versão em código ("horríveis"). Conceitos em
   `docs/propostas/06-fonema-unificada/espelho-do-som-conceitos/` (A professora / B mascote / C massinha) — **aguardando a escolha dele**
   e quem opera o pacote Adobe (Character Animator). Gerador de imagem não obedece à posição da boca.
4. **Avatar**: tipos de cabelo e modelos-base de pele morena/negra pelo fluxo que funcionou — editar a arte padrão no Higgsfield
   (`generate_image`, modelo `nano_banana_2`, com a imagem de referência; 1,5 crédito) e converter em 3D (`generate_3d`,
   `tripo_h3_1_image_to_3d`, 9 créditos; 18 no detalhado). Depois registrar em `avatares.json` (ver `app/docs/avatar-3d-contrato.md`).
   Refazer a menina com o "A" maior; modelo sentado para a cadeira de rodas; troféu sem o texto "Mestre Leitor".
5. Sofia, Tales e Bolota 3D já estão no Álbum, na Chegada, na sondagem e no treino; esqueleto/animação (Meshy no Higgsfield, ~38 créditos por personagem) se o dono quiser.
6. Falas pendentes (`app/docs/falas-pendentes.md`).

**Decisões que o dono ainda não respondeu:** direção de arte da boca; quem valida/regrava os sons puros (nenhum foi ouvido por pessoa:
13 "aprovados" por medição, 11 duvidosos, R fraco/LH/NH sem clipe); LH/NH/CH depois do R ou antes; "cama/banana" (nasal antes de M/N)
avisa ou bloqueia; números de alerta/reforço/sondagem (definidos pelo projeto, ver relatório do motor em 4b); servidor/banco para login
em qualquer aparelho; lista em `docs/pedagogia/07-fontes.md` §5.

**Saldos (15/11, 22h UTC):** Higgsfield ≈ 8,5 créditos (plano Lite, sem ilimitado); ElevenLabs ≈ 12,6 mil caracteres (recarga prometida
ainda não entrou); MiniMax (chave do plano, `api.minimax.io`) funcionando para imagem `image-01`; Google AI Studio e Cloudinary sem cota.
Rede liberada no ambiente para: `upload.higgsfield.ai`, `d2ol7oe51mr4n9.cloudfront.net`, `d8j0ntlcm91z4.cloudfront.net`,
`upload-us-east-1.cloudinary.com`, `res.cloudinary.com`. Chaves só pelo proxy (nunca em código).

**Como os agentes trabalharam (vale manter):** frentes paralelas com dono de arquivos, `git pull --rebase --autostash` antes de cada commit,
commit por caminho, capturas olhadas antes de relatar, relatório honesto do que não ficou bom. E2E completo leva ~20 min
(`npm run e2e` em `app/`); o curto é `timeout 300 node web/e2e/fluxo.e2e.mjs --sem-jornada`.

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

### 4.1 Avatar 3D de verdade + Lojinha (D029 §1 e §7 — estrutura pronta e verificada em 15/11)
O boneco agora é um **modelo 3D pronto** (GLB de plataforma, estilo filme de animação): `avatar-menino-padrao` e `avatar-menina-padrao`
em `app/web/public/assets/modelos3d/` (≈0,33 MB cada, comprimidos). **Começa no padrão completo** (roupa toda branca com o "A" azul) e a
criança **personaliza por cor, na hora**: pele (10 tons, da clara à negra retinta, em ordem neutra), olhos, cabelo e sobrancelhas, camiseta,
calça e calçado. Nada é obrigatório. Cores especiais têm cadeado por fase + moedas; a personalização termina na vitrine da Lojinha.
- **Como funciona a cor:** `app/ferramentas/avatar-mascaras.py` gera, por modelo, uma máscara de regiões (pele, cabelo, íris, camiseta,
  calça, calçado; a letra A, o branco dos olhos e a sola ficam fora) e o `avatares.json`; o app recompõe a textura
  (`app/web/src/avatar3d/avatarGlb.ts`). Compressão: `app/ferramentas/comprimir-modelos3d.sh` (também Sofia e Tales: ≈9 MB → ≈0,5 MB).
- **Só menino ou menina** no cadastro; cadastro antigo "prefiro não informar" pergunta uma vez; avatares antigos (recorte e boneco de peças)
  migram para o novo formato (`app/packages/motor/src/avatar.ts`).
- **Lojinha:** abas Meu boneco (cores com cadeado), Acessibilidade (óculos e pintura no rosto, grátis) e Utensílios.
- **Reserva:** se o GLB não carregar, aparece o boneco provisório feito em código; sem WebGL, um desenho 2D.
- Contrato e passo a passo para incluir modelos: `app/docs/avatar-3d-contrato.md`. Capturas: `app/docs/capturas/v6-avatar-*.png`
  (`node web/e2e/capturas-avatar.mjs`).
**Falta (depende de modelos novos, ver contrato §5):** tipos de cabelo (artes em `docs/.../avatar-3d/padrao/variacoes/`; o passo "Penteado"
aparece sozinho quando o GLB entra no `avatares.json`); **cadeira de rodas** (precisa de modelo sentado) e **aparelho auditivo** (orelha à
mostra) — estão fora da tela, com o dado preservado; rosto/boca/sorriso (kit de peças). Faltam também os áudios das falas da personalização
(`FALAS.avatar`, `avatarSexo`, `avatarLojinha`, perguntas de `PASSOS_AVATAR`). Os recortes antigos em `public/assets/avatar/` não são mais usados.

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
   `migracao.ts`), matriz de confusão e tempo (`confusao.ts`). As mecânicas já passam os campos (15/11); faltam "ouviu de novo" e a
   posição da resposta certa, que o contrato ainda não tem.
3. Som no lugar do nome da letra — **entregue na Trilha A–Z** (15/11): em 22 letras o estímulo é o som real (2 vezes), nos dois sentidos
   (som → letra; letra → som com botões de som), e o nome da letra só entra depois do acerto. **Ficam no comportamento antigo:** H (sem
   som), K, W e Y (letras de nomes); R fraco, LH e NH não têm clipe. Código: `conteudo/src/fases/alfabeto.ts`, `web/src/mecanicas/Escolher.tsx`.
4. Distratores, sorteio e fim do modelo permanente — **entregue** (15/11): posições e itens sorteados (fixos só no modo de teste);
   pares confundíveis e letras em espelho nas revisões; correção contrastiva no 1º erro (toca o som escolhido e o certo e diz o que
   muda), resposta só brilha na 3ª tentativa; "qual figura começa com o som" sem a letra e com outras figuras; Montar com demonstração
   na 1ª vez e depois sem modelo, peças tocando o fonema; "O Bolota leu errado" e pseudopalavras por áudio; "qual som falta"; jogo
   **"Liga o som"** (`mecanicas/Ligar.tsx`, cenas em `CENAS_DO_SOM`). Falas novas genéricas em `FALAS_FONICAS` (`sons.ts`), gravadas e
   auditadas. Capturas: `app/docs/capturas/v5-mecanicas-*.png` e `v5-liga-o-som-*.png` (`node web/e2e/fluxo.e2e.mjs --mecanicas`).
   **Limites:** nenhum som puro foi ouvido por pessoa (os das oclusivas estão como "duvidoso"); itens de R0 e R1 com figura e o
   gerador do som do nome (motor) ainda usam a escada antiga; pares mínimos de palavras (faca × vaca) não foram feitos; a cena de
   pseudopalavras conferidas (R2a-F04-C5b) ainda não é exigida para concluir a fase.
5. Exposição fora do domínio — **entregue no motor** (15/11): só tentativa avaliada conta (`tentativas.ts`, `dominio.ts`); Letra, Espelho,
   Traçar e Falar ficam como participação; fases marcam concluída × dominada; domínio antigo sem resposta conferida vira "a confirmar".
6. Trilha fônica — **blocos 1 a 3 entregues** (15/11): TF-01…TF-22 + revisões TF-R2/TF-R3 na jornada, depois da Trilha A–Z (ver seção 0).
   Faltam os blocos 4 a 8 (TF-23…TF-53).
7. Verificador de decodificabilidade em tudo — **entregue** (15/11): formato de 05 §6 completo — banco com pronúncia anotada som a som,
   valores por unidade TF, erro × aviso, frases e textos, palavras inventadas, todas as trilhas, relatório por fase; falha o build.
8. Frases, textos, fluência e compreensão — **parcial** (15/11): frases decodificáveis com pergunta literal (figura) a partir de TF-10 e
   leitura em eco nas revisões (autorrelato, sem nota). Faltam textos, fluência medida e perguntas de dedução.
9. Sondagem periódica e reforço dirigido — **essencial entregue** (15/11): o motor agenda a sondagem (a cada 8 fases ou 30 dias, em `config.ts`),
   guarda o resultado por área (`sondagem.ts`), calcula a próxima prática recomendada, a volta ao pré-requisito e o alerta ao adulto
   (`reforco.ts`), e o painel do adulto mostra tudo (capturas `app/docs/capturas/v5-painel-*.png`, script `web/e2e/capturas-painel.mjs`).
   **Feito em 15/11 (noite):** tela própria da sondagem em 5 placas (inclui pseudopalavras conferidas e ditado), treino rápido jogável,
   selos só com resposta conferida, ajuda graduada/posição/chute/queda no contrato e no painel (ver seção 0). **Falta:** mecânicas
   gravarem os campos novos; números do alerta, da queda e do chute são decisão do projeto, sem calibragem.
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
- **ElevenLabs** (15/11, depois das vozes da D030): 118.359 de 131.000 caracteres usados; **sobram 12.641**. A rodada das mecânicas
  gastou 2.330 (falas fônicas, falas das telas e do boneco, dicas dos cadeados, apoio por letra, regravações). O que continua sem voz
  está em `app/docs/falas-pendentes.md`.
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
