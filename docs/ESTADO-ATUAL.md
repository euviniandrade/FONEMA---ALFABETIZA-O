# FONEMA — Estado atual e passagem de bastão

Atualizado em 2026-11-17 (seção 0: Trilha dos Sons, blocos 4 e 5). **Leia este arquivo primeiro ao retomar o trabalho em qualquer sessão ou modelo.**
Tudo o que foi feito está neste repositório, no ramo `claude/eager-brahmagupta-3d2lhr` (commit e push a cada mudança). Nada depende
da memória da conversa anterior.

## 0. Situação agora (15/11/2026, 23h UTC) — leia isto primeiro

O dono vai continuar o trabalho com outro modelo (Opus). Tudo está no ramo `claude/eager-brahmagupta-3d2lhr`, com commit e push.
**Nenhum agente está rodando**; não há trabalho pela metade fora do repositório.

**Passeio 3D em terceira pessoa (D032 item 3; 17–18/11; NÃO publicado ainda):** o botão "Passear 3D" (no "Mais") abre
`public/mundo3d/passeio.html` (fonte: `docs/propostas/06-fonema-unificada/mundo-3d-v2`, copiado no build; fora do precache).
- **O próprio boneco:** o app monta o avatar com as cores/cabelo/roupa salvos (mesmo código da Lojinha, `avatar3d/pacote.ts`) e manda
  as malhas + textura ao iframe por postMessage (`telas/crianca/Passeio3D.tsx`). Sofia, Tales e Bolota vêm dos GLB deles; duas crianças
  da vila são o avatar padrão recolorido. Antes de chegar, aparece um bonequinho de reserva.
- **Controles:** PC = setinhas/WASD (Shift corre), arrastar gira, roda = zoom, espaço pula, T acena, Enter entra. Celular/tablet =
  dedo à esquerda vira joystick onde encosta, dedo à direita gira, pinça = zoom, botões Pular (92–104 px), Tchau (76–84 px) e
  Entrar/Conversar. Tocar/clicar no chão, numa porta ou num boneco = o boneco vai sozinho. Botão 🦅 "ver do alto" e ❔ "como mexer".
- **Animação procedural** (os GLB são malha inteira, sem esqueleto): passos com quique e balanço, inclina ao correr, respira parado,
  pulo com antecipação e "amassadinho" na queda, tchau = pulinhos virado para a câmera + mãozinha 👋 flutuando, nado deitado na beira.
  **Com modelos riggados** (esqueleto + clipes andar/correr/pular/acenar) daria braços e pernas de verdade e o aceno com a mão.
- **Área:** colisão por grade montada das peças da vila (`js/colisao.js`): prédios, muros, cercas, bancos, postes, troncos, arbustos.
  Cerca de madeira baixa no limite (a mata fica do lado de fora, com aviso "A mata fica para outro dia!", só visual). Rio: beirinha
  rasa onde o boneco nada; meio fundo bloqueado. Barquinho com cadeado "Em breve na Lojinha".
- **Portas** (`js/passeio.js › LUGARES`, destinos em `Passeio3D.tsx`): Escola → missão de agora; Biblioteca → Cantinho da Leitura;
  Campinho → Brincar com sons; Padaria → Lojinha; Casa da Sofia → Escrever do seu jeito (trancada até haver palavras para escrever,
  fala já gravada `escTrancada`); Coreto → Ler mais ligeiro (trancada pela mesma regra da fluência, fala `fluTrancada`). Botão grande
  "Entrar" na porta; trancada mostra cadeado e o que falta.
- **Bonecos** (`js/npcs.js`): rotas simples, param e olham para a criança, devolvem o tchau; "Conversar" com falas roteirizadas JÁ
  gravadas: Sofia "Oi, [NOME]!" (+ "Tudo pronto para a primeira missão?…" na 1ª vez) e botão Missão; Tales "Oi, [NOME]!" + "Vamos
  brincar com os sons das palavras!" e botão Brincar; Bolota (voz do Tales) "Pula com a gente, [NOME]!" e pula junto; as crianças só
  acenam. Sem IA, sem chat (D032). Encaixe pronto: `npcs.definirCerebro()` (IA no futuro) e `npcs.remoto.entrar/mover/sair` (multijogador).
- **Desempenho:** lotes da vila em blocos de 24 m no passeio (câmera e sombra só desenham o que veem), sem reflexo do rio fora do "alto",
  densidade de pixels limitada (1,25 no celular), sombra só perto, bonecos longe sem sombra, qualidade cai sozinha (o medidor agora usa o
  tempo real, antes um aparelho muito lento levava minutos para baixar). "Menos movimento" desliga balanços, câmera que segue e pulsos.
- **Verificado:** typecheck, lint, 366 testes; E2E `node e2e/fluxo.e2e.mjs --mundo3d` (também no `--sem-jornada`; `--capturas-mundo3d`
  salva `app/docs/capturas/mundo3d-*.png`). **Limite honesto:** o Chromium de teste desenha sem placa de vídeo (0,3–0,9 quadro/s nesta
  vila), por isso o FPS mínimo do teste é 0,3 (`FPS_MINIMO=30` num PC de verdade). Nenhum aparelho real foi medido. A vila tem ~500 mil
  triângulos (prédios arredondados): se o celular sofrer, o próximo passo é simplificar os prédios para o passeio.
- A vista aérea antiga continua em `mundo3d/index.html` (não removida; o app agora abre o passeio).

**Cenas do som com a Sofia (pedido do dono, fila nº 13; 17/11, noite; NÃO publicado ainda):** a figura do faz de conta de
A, E, I/Y, L, V e X (`CENAS_DO_SOM` em `conteudo/src/alfabeto.ts`) agora é a Sofia fazendo a ação (no médico com a boca aberta, erguendo
o troféu, mão na testa "iii!", lambendo o sorvete, voando o aviãozinho, dedo nos lábios), com o "A" azul no peito em A, I, L, V e X.
As figuras antigas continuam em `web/public/assets/figuras` (regra 7); falas e vozes não mudaram. Prontas como **proposta** (não
ligadas): Ó (surpresa), Ã (mão no queixo, olhando para cima) e R fraco (gato ronronando) — trocar em `CENA_DO_GRAFEMA` (`fases/tf.ts`)
se o dono aprovar. **Não saíram** (ficou a figura atual): O, U, N, M, F, H, S, Z, J e É — o gerador (MiniMax `image-01`) não fez o gesto
ou trocou a menina. 180 imagens geradas; folha antes × depois, tentativas, ferramentas e capturas em
`docs/propostas/06-fonema-unificada/cenas-do-som-sofia/`. **Verificado** (cópia separada, commit 2fc0d4b): typecheck, lint, testes,
relatório de decodificabilidade (0 erros) e capturas de AL-A, AL-X, TF-03 e TF-10 em 1850×980 e 390×844 (olhadas: cena aparece certa).

**Memória dos Sons (pedido do dono, fila nº 17; pesquisa 46 item 2; 18/11; NÃO publicado ainda):**
- **O jogo** (`web/src/mecanicas/jogos/MemoriaSons.tsx`, tela `telas/crianca/MemoriaDosSons.tsx`, regras `motor/src/memoria-sons.ts`):
  duas grades de cartas viradas (verso marinho/verde com bolinhas e selo, com volume): em cima a **cena do som** (`CENAS_DO_SOM`: a
  Sofia em A, E, I, L, V, X; a cena atual nas outras), embaixo a **letra**. A cena **toca o som puro** ao virar (regra 1).
  Níveis: **1 Olhar e lembrar** (3 pares abertos para olhar e ouvir antes de virar; tudo exposição), **2 Memória** (3–4 pares),
  **3 Memória grande** (5–6 pares; aqui podem entrar sons parecidos), **4 Só ouvindo** (carta de som × letra, sem figura).
  Alvos ≥ 60 px; cabe em 390×844; "menos movimento" troca a face sem giro 3D. Moedinhas que pulam são só enfeite (nada é dado).
- **Decisão do projeto (regra 3), diferente do pedido literal:** a carta da LETRA só toca o som no nível 1. Nos níveis 2–4 ela é muda
  até o par fechar (aí toca, confirmando). Se as duas tocassem, o par se faria comparando dois sons iguais, sem ler a letra.
- **Filtro:** só sons de letras com fase concluída (o mesmo `sonsEnsinados` do Corre-Som: som real, com clipe, sem os duvidosos L, V,
  J, P, T, B, C, D, G, R); nunca duas letras que podem fazer o mesmo som (C/K/Q, S/Z/X, C/S, G/J, I/Y, U/W, E/I, O/U: `MESMO_SOM`);
  sem sons parecidos nos níveis 1, 2 e 4; posições sorteadas e nunca todas as letras embaixo das suas cenas. Hoje, na prática, entram
  A, E ou I, O ou U, M, N, F, S ou Z ou X.
- **Registro:** um par é **decisão** quando a segunda carta virada já tinha sido vista. Par fechado com decisão = tentativa
  **avaliada** (`mecanica 'memoria-sons'`, alvo, escolhido, respostas, tempo, nOpcoes = cartas de letra na mesa, posições, formato
  `memoria-cena-letra`/`memoria-som-letra`, contexto `livre` ou `desafio`); par errado com decisão = erro do alvo (confusão letra × som)
  com correção "Essa letra faz este som: … Essa cena faz este som: …"; virar carta nunca vista é palpite e não conta; par achado por
  palpite = exposição. Depois de 2 erros no mesmo som a letra certa brilha (com ajuda).
- **Onde:** Brincar › Jogos (cartão "Memória dos Sons", trancado até haver 3 sons; `#/c/:id/memoria`) e **desafio opcional no Ritual**
  das fases AL-X concluídas cujo som entra no jogo (`#/c/:id/memoria/AL-X`, nível 2 com a letra X).
- **Voz:** nenhuma gerada; 2 falas sem clipe em `app/docs/falas-pendentes.md` §1g.
- **Verificado (18/11, cópia separada, porta 4590):** typecheck, lint, 375 testes (novo `motor/test/memoria-sons.test.ts`), build e
  E2E `node web/e2e/fluxo.e2e.mjs --memoria` (24 checagens: níveis 1, 2 e 4, palpite × erro com decisão, registro, desafio da AL-M;
  também no completo e no `--sem-jornada`, não rodados inteiros). Capturas `--capturas-memoria` em `app/docs/capturas/v12-memoria-*`
  (1850×980 e 390×844, olhadas). **Não testado:** o botão do Ritual de verdade (só a rota do desafio) e o toque num celular real.

**Jogos fônicos 1 e 2: Corre-Som e Bichinho Come-Som (D032 §4, pesquisa 47 G1/G5; 17/11, noite; NÃO publicado ainda):**
- **Corre-Som** (`web/src/mecanicas/jogos/CorreSom.tsx` + pista 3D `corre-som-3d.ts`, three.js sob demanda, avatar 3D da criança de
  costas): rua de 3 pistas no campo, árvores, cerquinhas, moedinhas de enfeite e almofadas fofas para pular (sem castigo: só um tropeço).
  Toca o som puro; vêm 3 arcos com placa (letra ou figura) em pistas sorteadas; a rua **para** antes de cada escolha. Escolhe tocando na
  pista, deslizando, setas/A-D (+ ↑/Espaço/Enter ou parar 1,4 s na pista) ou "Passar"; ficar parado não responde; sem resposta em 9 s o som
  toca de novo (ajuda "repetiu", não erro). Variações: **Letras** (som → letra) e **Figuras** (som → figura que começa com ele). Sem WebGL:
  arcos em 2D. "Menos movimento": a rua não corre.
- **Bichinho Come-Som** (`ComeSom.tsx`): o **Bolota** pede um som (bolha que pulsa) e a criança dá, entre 3 pratinhos sorteados, a
  comida/figura que **começa** (ou **termina**: a, i, u — pato termina com /u/) com o som. Alto-falante em cada pratinho (R10). Errou: o
  Bolota cheira, faz "?" e devolve; nunca fica triste. Prefere figuras de comida; sem comida para o som, vale outra figura com voz.
- **Regras** (`motor/src/jogos-fonicos.ts`, teste `motor/test/jogos-fonicos.test.ts`): só sons de letras com fase concluída
  (`letrasComSomVisto`), sem H/K/W/Y e **sem os sons "duvidosos" da auditoria** (L, V, J, P, T, B, C, D, G: na trilha eles nunca são o
  único estímulo, então no jogo também ficam fora até a gravação conferida [DP]); 3 opções; posição da certa sorteada sem repetir; um
  distrator parecido quando os dois sons foram ensinados (s/z, m/n); cada som entra antes de repetir; rodada de 6. Variações abrem com 3 sons
  (Letras/Figuras/Começa) e com A, I e U (Termina). Correção contrastiva só com falas gravadas ("Você escolheu este som:" / "Essa letra faz
  este som:" + som, pares de voz, "Eu pedi este som:" + som); 3º arco/prato: a certa brilha e vale "com ajuda". R12: na 1ª vez de cada
  variação no Brincar, a Sofia faz um exemplo ("Olha como eu faço.") que não vale.
- **Registro:** cada escolha = tentativa `avaliada`, mecânica `corre-som`/`come-som`, alvo/escolhido (letra; ou o SOM, nas figuras),
  respostas, distratores, tempo, 3 opções, posição certa e escolhida, formato; contexto **`livre`** no Brincar e **`desafio`** (novo em
  `ContextoTentativa`) dentro da fase. Moedas e distância não viram tentativa; porquinho não muda. Habilidade nova **`som-final`** (R0).
- **Onde:** Brincar › seção **"Jogos"** (cartões trancados até haver sons; `#/c/:id/brincar/corre-som` e `/come-som`) e, como **desafio
  opcional**, nas cenas de fase em que TODOS os itens são "som → letra" com som real (vira Corre-Som; item de 4 opções perde um distrator
  distante) ou "som → figura" (vira Bichinho): botão "Jogar no Corre-Som"/"Dar comida ao Bolota" no canto da cena, antes da 1ª resposta;
  mesmos itens da fase (`desafioDaCena`). Ex.: Letra A C3 e C4, lições TF de vogais/M/F/S/N/Z. Sem o toque, a cena segue igual (E2E).
- **Falta voz** de 8 falas próprias (enunciado do "termina com", entrada dos jogos, reações do Bolota…): `app/docs/falas-pendentes.md` §1c.
- **Verificado (17/11, cópia separada, porta 4530):** typecheck, lint, 366 testes, relatório de decodificabilidade (0 erros), build,
  E2E `node web/e2e/fluxo.e2e.mjs --jogos` (trecho `web/e2e/trecho-jogos.mjs`, também dentro do `--sem-jornada`) e capturas
  `--capturas-jogos` (`app/docs/capturas/v10-jogos-*`, 1850×980 e 390×844, olhadas). `--sem-jornada` (commit 0f73b27): todos os trechos
  até J (jogos fônicos), J2 (jogos da vila) e F (fichas) passaram; **falhou no trecho M (Passeio 3D, outra frente)**: "clicar no chão leva o
  boneco até lá", com o passeio a 0,8 quadro/s no Chromium sem placa de vídeo. Ninguém jogou no celular de verdade nem ouviu a rodada inteira.

**Fichas de leitura por campo semântico (D033, pedido do dono; 17/11, noite; NÃO publicado ainda):**
- **Onde:** Cantinho da Leitura › "Fichas de leitura" (`#/c/:id/leitura/fichas`), 6 cartões: Animais, Comidas, Coisas da casa,
  Brinquedos, Família e corpo, Natureza. Também como **desafio opcional no fim das lições da Trilha dos Sons** (botão "Ficha de
  leitura: …" no Ritual, `campoDoDesafio`; grava contexto `desafio`). Nada trava a trilha nem dá moedinhas.
- **Só o que a criança já lê:** palavra entra para LER só com todos os valores sonoros ensinados numa unidade concluída (verificador),
  sem aviso de nasalização e com todos os sons puros publicados (`motor/src/fichas.ts › legivelNaFicha`). As outras aparecem só como
  figura apagada com cadeado, "em breve", nunca escritas. 36 palavras novas no FIM do `tf-banco.ts` (`PALAVRAS_FICHAS`; peixe e pia só
  ganharam figura). **Duvidosas:** leão (E átono), formiga (O átono), estrela ("es-" = "is-"), tambor/sorvete/porta/urso (R de fim de
  sílaba), poça e olho (O fechado), mel e sol (L final = U).
- **Níveis** (destrancam com 3 acertos sozinho no anterior, em qualquer campo [DP]; nada fecha de novo):
  1 **"Vamos ler juntos?"**: palavra grande, sem figura; em cima de cada letra (ou dígrafo) uma **boquinha** faz o som daquela posição
  (o O final de "pato" faz /u/) enquanto a letra acende e o som puro toca, um por um; depois emendados devagar e ligeiro; "o que
  ficou?" → 3 figuras; a certa aparece com festa. Ler junto = **exposição**; a escolha = **leitura avaliada** (`leitura-cvcv`).
  2 **Só o som** (bolinhas acendem, sem letras nem boca) → 3 figuras (`sintese`); degrau **som → palavra escrita** entre 3 palavras
  todas legíveis (`leitura-cvcv`). 3 **Letra e boquinha**: 3–4 letras soltas × bocas paradas, sem som; toca a letra e depois a boca;
  só vale como medida com ≥ 3 bocas na tela. 4 **Só a boquinha**: a sequência de bocas, sem som nem letras → 3 figuras.
  Correção: 1º erro = toca a escolhida e de novo a certa (sons ou bocas), sem dizer a resposta; 2º = a certa brilha (com ajuda).
- **Habilidade nova `boca-som`** (consciência articulatória; habilidades.ts) para os níveis 3 e 4. **Bocas distinguíveis**
  (`conteudo/src/fichas.ts › CLASSE_DA_BOCA`, conservador [DP]): p/b/m · f/v · t/d/n/l/r · s/z/i/e/é · u/ch/j · o/ó · a/k/g/rr —
  nunca duas da mesma classe na rodada (nível 3) nem palavras com a mesma sequência de bocas entre as opções (nível 4).
- **Boquinha** (`componentes/Boquinha.tsx`): vista de frente do Espelho do Som em SVG, com a MESMA tabela de poses do 3D
  (`fonemas.js`; um teste compara os números). Escolhida no lugar de 1 cena 3D por letra (pesado no celular) e das bocas desenhadas
  (só 5–7 sons servem e a Sofia muda de imagem para imagem). "Menos movimento": troca a pose sem animar. Validar com fonoaudióloga.
- **Voz:** nenhuma gerada. "Vamos ler juntos?" e "O que ficou?" usam clipes parecidos; 3 falas e os nomes das palavras novas sem
  clipe em `app/docs/falas-pendentes.md` §1f (o nome da palavra cai nos sons emendados).
- **Registro:** mecânica `ficha`, `formato` `ficha-ler`/`ficha-ler-junto`/`ficha-ouvir`/`ficha-ouvir-palavra`/`ficha-bocas`/
  `ficha-bocas-palavra`, com alvo, escolhido, respostas, distratores, tempo, nOpcoes, posições e contexto; resumo em `biblioteca.jogos`.
- **Verificado:** typecheck, lint, 366 testes (novos: `motor/test/fichas.test.ts`, `web/src/componentes/boquinha.test.ts`),
  verificador (0 erros), build numa cópia (worktree, porta 4580) e E2E **`node web/e2e/fluxo.e2e.mjs --fichas`** (32 checagens, os 4
  níveis e o desafio; também no completo e no `--sem-jornada`). Capturas `--capturas-fichas` (1850×980 e 390×844) olhadas; 15 guardadas
  em `app/docs/capturas/v11-fichas-*`. Depois delas: boquinha mais de perto (linha dos lábios fechados, ponta da língua só com dentes
  abertos) e a palavra do nível 1 cabendo numa linha no celular pelo número de letras — conferidos com o `--fichas` de novo (passou).
  **O `--sem-jornada` inteiro NÃO passou nesta rodada:** parou no trecho 12 (Cantinho) esperando o boneco ficar pronto (máquina
  carregada, antes do trecho das fichas); o `--cantinho` sozinho passou em seguida. Não investigado a fundo.
- **Falta:** ninguém usou com criança; poses da boca a validar com fonoaudióloga; a captura da "festa" sai já na tela de fim (modo
  rápido do teste); vozes pendentes (§1f).

**Trilha dos Sons, blocos 4 e 5: TF-23…TF-32 e TF-R4 (17/11, noite; NÃO publicado ainda):**
- **Na jornada** (depois da revisão P…G, antes de R…W e da Festa): **TF-23** é e ó com acento (faz de conta: nojo ao pisar na lama;
  surpresa), **TF-24** E/O abertos sem acento e ê/ô (regra "leia fechado; se não virar palavra, tente o aberto"; item avaliado = qual
  acento falta: VOV_ vovó × vovô), **TF-25** ã e AN antes de consoante (faz de conta: pensando; frase "A anta viu a lua.").
- **Escritas, conferidas e EM ESPERA** (fora da jornada): TF-26 EN, TF-27 IM/IN, TF-28 OM/ON, TF-29 UM/UN, TF-30 M antes de P/B e
  ão/ãe/õe/-em, TF-R4 (revisão com frase e eco), TF-31 R do começo, TF-32 R fraco (gatinho ronronando, MP p. 88). Regra automática
  em `conteudo/src/fases/tf.ts`: entra na jornada a lição cujos sons puros estão no mapa (`SONS_PUBLICADOS` = `mapa.json`, testado)
  e cujas anteriores entraram (a trilha não se pula). **Faltam os sons puros /ẽ/, /ĩ/, /õ/, /ũ/ e /ɾ/** (Estúdio de sons ou
  fonoaudióloga); TF-31 (R forte, que tem som) espera só por vir depois das nasais. Quando entrar, a letra R vai sozinha para logo
  antes de TF-31 (`regioes.ts › montarLetrasESons`, D031 §3). Progresso salvo: **versão 4** (`reordenarJornada`; quem já estava
  nas letras R…W volta para TF-23, nada concluído se perde; teste `motor/test/trilha-blocos-4-5.test.ts`).
- **Voz: nenhuma gerada.** ~39 falas da jornada (≈ 590 caracteres) e ~140 das lições em espera estão em `app/docs/falas-pendentes.md`
  §1e. Ponte: leitura falada sem clipe toca os sons puros emendados (`LEITURAS_EM_SONS` → `web/src/servicos/voz.ts`); funciona, mas
  **gerar as 39 falas antes de publicar**. Frases e falas de apresentação novas ficam só no balão até lá.
- **Palavras** no fim de `fases/tf-banco.ts` (`PALAVRAS_BLOCOS_4_5`, pronúncia anotada); verificador aceita inventadas com acento e
  nasal; relatório refeito (386 itens na jornada, 0 erros; 137 nas lições em espera, 0 erros). Duvidosas para alfabetizadora em
  `docs/pedagogia/00 §7` (pera/pela, coro, boba, boné, copo, moto, veto, cota; tato, veto, mito, nuca nos pares; ninja).
- **Figuras novas** (MiniMax, olhadas): `cena-e-aberto`, `cena-o-aberto`, `cena-a-nasal`, `cena-r-fraco`, `panda`, `novelo-la`.
  A anta saiu 3 vezes como javali/porco e foi descartada (TF-25 lê "anta" sem figura).
- Mecânicas: `SomNovo` aceita `cena`; `Troca` e `Caixas` aceitam os grafemas novos (`fonemaDoGrafema`); tela da trilha mostra os
  blocos 4 e 5 quando têm lição na jornada.
- **Pergunta ao dono:** a Ilha das Vogais (R1, é/ê e ó/ô) continua depois da Festa como revisão, e o gancho da Festa ("Agora as
  vogais vão mostrar os outros sons delas!") ficou menos exato, porque TF-23/24 já ensinam esses sons. Manter, mudar o texto ou tirar
  R1 do caminho (sem apagar, regra 7)?

**Jogos da vila: Estrada e Rio dos Pares, Carteiro da Vila e Casa do Som (D032 §4; pesquisa 47 G6, G10, G3; 17/11, noite; NÃO publicado ainda):**
- **Regras puras** em `motor/src/jogos-vila.ts` (testes `motor/test/jogos-vila.test.ts`, 14). Telas em `web/src/mecanicas/jogos/`
  (`EstradaPares.tsx`, `Carteiro.tsx`, `CasaDoSom.tsx`, `vila-comum.tsx`, `estilos-jogos-vila.css`) e `web/src/telas/crianca/JogosVila.tsx`
  (rota `#/c/:id/jogo[/:jogo[/:faseId]]`); cartões e rotas sem as telas em `telas/crianca/jogos-vila-cartoes.ts`. Aparecem na área
  **Jogos** do Brincar, ao lado do Corre-Som e do Bichinho (trancados com o motivo até a trilha chegar lá).
- **Estrada e Rio dos Pares:** o carrinho ou o barco do avatar para em cada bifurcação; 3 placas com figura (par mínimo + distrator,
  lado sorteado). "Ouvir": a Sofia diz a palavra. "Ler": a palavra vem escrita no barco/carro e ninguém a diz antes. Itens = os
  pares das lições JÁ CONCLUÍDAS da Trilha dos Sons (faca/vaca/foca, vaca/faca/jaca, mala/bala/mula, dado/dedo/pato; o "ler" só com
  palavra liberada pelo verificador). Grava na habilidade do contraste (`par-minimo-*`): conta para o 8 de 10. Cores do carro na
  garagem: 2 grátis, 4 compradas com moedinhas da jornada (`CORES_VEICULO`, `comprar`); nada de dinheiro.
- **Carteiro da Vila:** envelope com a palavra escrita, 3 casas com a placa de figura (nomes de escrita parecida: FACA × VACA × JACA).
  Banco = itens "leia e toque na figura" das lições concluídas + palavras com figura que o verificador libera (sem vogal nasalizada).
  Errou: "Você tocou em:" + nome da casa, "Leia de novo, letra por letra." e a letra que muda sobe no envelope com o som dela.
  **Gancho do mundo 3D:** abrir `#/c/:id/jogo/carteiro` (ou `#/c/:id/jogo` para os três); `rotaDoJogoDaVila()` em
  `jogos-vila-cartoes.ts`. Nada no `public/mundo3d` nem no `mundo-3d-v2` foi mexido.
- **Casa do Som:** encomenda = escrever o nome do móvel com letras móveis (palavra dita, sem modelo; bandeja = letras da palavra +
  distratoras já ensinadas: par confundível, U do O final, vogal). Confronto letra a letra como no Escrever do meu jeito, sem "errado";
  pode reescrever sem o modelo. Só a 1ª escrita conta. O móvel chega sempre e a criança arrasta na casinha (lugar salvo em
  `Progresso.jogosVila`). 16 móveis (uva, ovo, mala, pia, lupa, mapa, sapato, pato, bule, bolo, suco, jaca, dado, gato, tapete, tomate);
  figuras novas **pia, bule e mapa** (MiniMax; o 1º mapa saiu em forma de nuvem e foi refeito; olhadas).
- **Na jornada:** no fim de uma missão da Trilha dos Sons concluída, o Ritual mostra um botão opcional "Desafio: …" (`desafioDaFase`:
  pares → Estrada com os pares daquela fase; ditado → Casa; leitura com figura → Carteiro); grava contexto **'desafio'**
  (`registrarLivre` agora mantém 'desafio'). Não troca nenhuma cena da fase (E2E e verificador intactos).
- Regra 4: jogar não dá nem tira moedinhas; casinha, cor e cartas entregues não viram tentativa. Sem cronômetro (o carro espera),
  sem ranking, sem caixa surpresa. Primeira vez de cada jogo: 1 exemplo feito pela Sofia (não vale).
- **Voz:** nenhuma gerada; usa só clipes existentes. O que faria falta: `app/docs/falas-pendentes.md` §1d.
- **Verificado (cópia separada, commit 93d6245):** typecheck, lint, 338 testes, relatório de decodificabilidade (341 itens, 0 erros),
  build e E2E novo `node web/e2e/fluxo.e2e.mjs --jogos2` (26 checagens, todas verdes; também ligado no E2E completo e no `--sem-jornada`, que não
  rodei inteiros). Capturas `--capturas-jogos2` em `app/docs/capturas/v10-vila-*` (1850×980 e 390×844). **Não visto:** o botão de
  desafio dentro de um Ritual real (testado só pela regra e pela rota); o arrastar com o dedo num celular de verdade.

**Tutorial "A grande aventura" e painel guia (D032 itens 1 e 2; 17/11, noite; NÃO publicado ainda):**
- **Tutorial** (`web/src/telas/crianca/Tutorial.tsx`, rota `#/c/:id/tutorial`; reaberto em `#/c/:id/tutorial/de-novo`): abre
  sozinho na primeira vez, logo depois do boneco (antes ia para a Chegada). 6 passos, tudo falado e animado, a criança toca na
  seta para seguir: (1) o mundo — arquipélago com a câmera passeando, Sofia e Tales; (2) **o caminho do que vai aprender** em
  9 etapas (Letras e sons → Ler palavras → Frases → Historinhas → Outros sons das vogais; trancadas com cadeado: Sons pelo nariz,
  R e H, Letras em dupla, Encontros), acesas uma a uma enquanto a Sofia fala, com "Você está aqui" e o rostinho da criança;
  (3) como mexer — tocar na estrela e arrastar a moedinha até o porquinho (também dá para tocar na moeda e depois no porquinho),
  botão do som e setinha de voltar; (4) moedinhas, Lojinha (roupas do boneco; barco e carro aparecem trancados, "um dia"),
  selos/álbum e nível; (5) Brincar e alguns jogos; (6) a primeira missão com a barrinha enchendo → "Vamos!" leva direto à
  sessão da primeira fase. "Pular (para o adulto)" leva à Chegada; reaberto, o botão vira "Fechar".
- **Etapas do caminho:** `packages/conteudo/src/caminho.ts` (agrupamento da jornada D031, cortes [DP]: até TF-05, TF-09, TF-15,
  Festa do Alfabeto, fim). **Motor:** `packages/motor/src/guia.ts` (`tutorialPendente`, `tutorialNovo`, `passoParaRetomar`,
  `marcarTutorial`, `estadoDoCaminho`, `missaoDeHoje`, `estrelasDaMissao`). Progresso ganhou os campos opcionais `tutorial`
  (passo/vistoEm/puladoEm/vezes) e `ultimaMissao` (estrelinhas 1–3 pelas respostas conferidas sem ajuda, selos ganhos;
  gravado em `fecharSessao`). Sem mudança de versão: progresso antigo sem o campo = nunca viu; **quem já fez missão não é
  interrompido** (o "Como jogar?" fica marcado com uma estrelinha até ver). O tutorial NÃO grava tentativa, desafio nem moedinha
  (regra 4; conferido no E2E). Retoma no passo em que parou (a vila manda de volta ao tutorial enquanto ele estiver pendente).
  Testes: `packages/motor/test/guia.test.ts` (12).
- **Painel guia** (`web/src/componentes/Guia.tsx`, `estilos-guia.css`): nível e bolinhas até o próximo, estrelinhas e selos da
  última missão, missão de hoje com a barrinha e o botão grande "Começar/Continuar", o caminho compacto com "Você está aqui"
  (toque fala a etapa) e "Como jogar?". Vila no PC/tablet deitado (≥ 900 px): **coluna própria à esquerda e o mapa começa depois
  dela** (nada do mapa fica escondido). Trilhas (Alfabeto e Sons) ≥ 1200 px: duas colunas na página (painel "grudado" ao rolar).
  Celular e telas menores: faixa recolhida no topo (nível, etapa, barrinha) que abre ao tocar. Correção de 17/11: a 1ª versão
  usava `position: fixed` e, com a animação de entrada da página, cobria a letra A na Trilha do Alfabeto (achado pelo E2E
  `--sem-jornada`); o E2E agora confere em 1850×980, 1366×768, 1280×800, 768×1024 e 390×844 que nenhum alvo tocável fica
  debaixo do painel.
- **Sessão:** a trilha de números no topo virou a **barrinha da missão** (pontinhos com check, estrela no passo de agora, baú no
  fim); o nome do método continua só em `data-metodo`.
- **Vozes:** 25 clipes novos (Sofia multilingual_v2, Tales v3), 1.151 caracteres enviados (a fala da Lojinha foi refeita uma vez:
  "E, mais para a frente" saiu engolido → "Um dia, até barco e carro!"); auditoria: todos ok; bocas.json refeito. Ninguém
  ouviu os clipes ainda. O botão "Você está aqui" reusa as falas das etapas.
- **E2E:** `node web/e2e/fluxo.e2e.mjs --tutorial` (percorre tudo) e `--capturas-tutorial` (capturas `v10-tutorial-*.png`);
  os outros trechos pulam o tutorial dentro de `montarAvatar`. O completo e o `--sem-jornada` também rodam o trecho.

**Área do administrador e troca de áudios (D032 item 5; 17/11, noite; NÃO publicado ainda):**
- **Rota própria `#/admin`** (link discreto no fim das Configurações da família/professor). Senha do administrador criada no
  primeiro uso (mín. 8 caracteres, com letras), guardada só como hash PBKDF2-SHA-256 (150 mil iterações, salt) no banco
  IndexedDB **`fonema-admin`** (separado do `fonema`; "Apagar todos os dados" não mexe nele). 5 erros = 60 s de espera.
  "Esqueci a senha" zera o acesso (contas, escola e áudios trocados) e pede o PIN de um adulto do aparelho, se houver.
  Papéis: **geral** (dono, todas as abas) e **escola** (criado pelo geral; só Visão geral e Escola). `servicos/admin-conta.ts`.
- **Abas:** Visão geral (crianças, turmas, sessões 7/30 dias, tempo de uso estimado pelos registros, verificador de
  decodificabilidade rodando no navegador, falas sem áudio, clipes da auditoria via `telas/admin/auditoria-resumo.json`
  — refazer com `npx tsx scripts/resumo-auditoria-audio.ts`); Escola (cadastro formal, turmas, professores, turma de cada
  criança, CSV e impressão/PDF, acesso da escola); **Áudios**; Publicar; Site (só os liga/desliga que já existem; Mundo 3D,
  Brincar, Leitura e textos da entrada listados como "sem ponto de configuração"; o resto como "precisa de servidor").
- **Áudios:** catálogo de 1.708 áudios (`servicos/catalogo-audios.ts`: 27 sons puros, nome da letra, palavras, sílabas,
  frases, sons ditos pela dupla, 290 nomes, o diálogo do Assiste e Faz e as falas do conteúdo ainda SEM clipe), com o texto
  ao lado, busca e filtros (tipo, voz/Bolota, letra, fase, trocados/sem áudio/auditoria). Ouvir o atual, subir arquivo ou
  gravar (contagem 3-2-1, medidor, ouvir antes de salvar), aparar silêncio e igualar volume no navegador
  (`servicos/audio-edicao.ts`; sem as duas opções guarda o arquivo byte a byte), "Voltar ao original". Modo **Gravar o
  alfabeto**: letra por letra com faz de conta, palavras-exemplo, boca e os dois sons quando há; no fim LH, NH e ã.
  Aviso de autorização por escrito + "quem grava" + marca de autorização (vão para o pacote).
- **Camada de substituição** (`servicos/substituicoes.ts`): ids lógicos `som:<fonema>`, `fala:<voz>|<trecho>`,
  `nome:<voz>|<chave>`, `arquivo:<caminho>`; consultada por `voz.ts` (falas e nomes; fala sem clipe oficial também toca se
  tiver substituto), `sons-letras.ts` (antes da gravação do Estúdio e do mapa publicado) e `AssisteEFaz` (`useUrlDeAudio`).
  Toca por endereço `blob:` — não passa pelo service worker, o cache não muda. Registro do que tocou em
  `window.__fonemaAudiosTocados` (também no modo rápido; usado no E2E). A boca da dupla acompanha o texto, não a gravação.
- **Publicar sem servidor:** pacote `.zip` (`servicos/pacote-audios.ts`: pacote.json + LEIA-ME + audios/) e
  **`scripts/importar-pacote-audios.ts`** (sons → `public/audio/sons/<f>-humana-<hash>.mp3` + mapa "voz humana"; falas e
  nomes → `audio-fontes/` + masterização; `audio-fontes/voz-humana.json`; marca na `docs/auditoria-audio.json` e seção em
  `docs/auditoria-sons-letras.md`; `--seco`, `--sem-masterizar`, exige `--confirmo-autorizacao` se faltar a marca).
  Testado de verdade numa cópia com ffmpeg + masterização (diffs limpos). `servicos/provedor-audios.ts`: lugar do provedor
  remoto (Vercel Blob/DB) sem implementação nem credencial. Passo a passo do dono: **`app/docs/como-trocar-audios.md`**.
- **Verificado:** typecheck, lint, 338 testes (novos: substituições, pacote/zip, catálogo, edição de áudio, conta do admin,
  resumo, importador; `vitest.config.ts` passou a incluir `scripts/**/*.test.ts`), build numa cópia (worktree, porta 4520) e
  E2E **`node web/e2e/fluxo.e2e.mjs --admin`** (também dentro do completo e do `--sem-jornada`; `--capturas-admin` tira
  capturas 1850×980 e 390×844): senha, troca do /m/, a lição AL-M toca exatamente os bytes subidos, gravação pelo microfone
  falso do Chromium, pacote, volta ao original (toca `audio/sons/m.mp3`), CSV da escola. Ninguém gravou voz real ainda.
  **O `--sem-jornada` inteiro NÃO chegou ao trecho do administrador** nas duas tentativas (17/11, build de `aacda48`+): a 1ª
  morreu no trecho 11 (Trilha dos Sons, navegador fechado ao meio); a 2ª falhou antes, em "sem pular fases: a revisão das
  vogais só abre depois das vogais" — partes mexidas por outras frentes ao mesmo tempo, não investigadas aqui.

**Espelho do Som: boca em desenho (17/11; proposta, NÃO integrada):** pedido D032 §6 (boca "como desenho, igual a Sofia, com a
língua, o dente"). Geradas 102 imagens na MiniMax com a arte da Sofia como referência (7 formas de pedir). Servem A, I, U, M/B/P, S/Z;
E e K/G mais ou menos; **F/V, L, T/D/N, R e X/J não saíram** (o gerador não põe dente no lábio nem a ponta da língua para cima) e a
Sofia muda de imagem para imagem, então não dá para trocar quadro a quadro. Por isso o app ficou como está (3D). Folha atual × proposta
e o que falta: `docs/propostas/06-fonema-unificada/espelho-do-som-desenho/README.md`. **Pergunta ao dono:** usar um editor de imagem
que mexe só na boca (Higgsfield sem crédito; Cloudinary tem cota grátis mas o uso foi barrado sem autorização dele), um artista, ou o
vídeo da boca da Agatha.

**Pares mínimos com 3 opções, Bolota igual nas páginas e 1º texto (16/11, tarde; NÃO publicado ainda):**
- **Pares mínimos:** todo item avaliado tem 3 opções: o par + um distrator do banco que muda OUTRO som (pato × bato × pata,
  pule × bule × pula, galo × calo × gato…; no modo ouvir, com figura: faca × vaca × foca). No modo ler o distrator passa pelo
  verificador (`verificar-fases.ts`); palavras novas no banco: `voa`, `cada`, `foca` (só ouvida). `bule/pule` virou `pule/bule`.
  Teste `conteudo/test/pares-minimos.test.ts`. Errar no distrator: a Sofia toca a escolhida e a certa (sem a explicação do par).
- **"8 de 10" no motor** (06 §2 item 4; `motor/src/dominio.ts` › `criterioPares`, config `dominio.paresMinimos`): habilidade
  `par-minimo-*` só fica dominada com 8 certas e sem ajuda nas últimas 10 tentativas avaliadas do contraste. **Regra para não
  travar** [DP]: com menos de 10 tentativas vale a mesma proporção arredondada para cima (8 → 7, 9 → 8), somada ao mínimo geral de 8
  tentativas; e a fase só segura o "8 de 10" se ela mesma oferecer ≥ 10 itens do contraste (nenhuma oferece: 2 a 5), senão conclui e
  a habilidade segue para revisão, treino e painel sem ficar dominada (`jornada.ts` › `itensDeParDaFase`). Teste `motor/test/pares-minimos.test.ts`.
- **O Bolota e a chuva:** as 6 páginas (capa + 5) refeitas no Higgsfield (`nano_banana_2`) com a imagem oficial do Bolota como
  referência (`app/ferramentas/referencia-bolota.jpg`, tirada de `personagens-vivos/fontes/base-bolota.png`): mesma cara, escamas,
  orelhas e rabo em todas; a página 3 antiga tinha um arco-íris (D009) e saiu. A capa é a página 2 recortada (chuva começando, para
  a pergunta de previsão). O `subject_reference` da MiniMax foi testado e não segurou o personagem. Créditos Higgsfield: 7,5 (saldo 1).
- **1º texto ("Oi!", bloco 1):** virou um mini enredo de 4 falas, só com palavras de TF-06: Sofia "Ei!" · Tales "Ai! Ui!" (clipe já existente) ·
  Sofia "Eu! Oi!" · Tales "Oi, oi!" (susto e alegria). Pergunta 1 agora tem resposta única (o que a Sofia falou: "ei"); a 2 (como o
  Tales ficou) passou a "feliz". Vozes: 8 clipes, 129 caracteres enviados (inclui o gancho pendente da Festa "Agora as vogais vão mostrar os
  outros sons delas!" e as leituras "voa" e "cada"); o texto corrido foi refeito uma vez porque o transcritor ouviu "oi" no
  lugar de "ui" na 1ª ordem ("Ui! Ai!"); a fala do Tales voltou a usar o clipe "Ai! Ui!", já auditado. Ninguém ouviu os clipes novos.
- **Verificado (16/11, cópia separada no commit 3b728cb):** typecheck, lint, 259 testes, relatório de decodificabilidade (341 itens,
  0 erros, 21 avisos), E2E `--trilha-sons` (19 lições, passou) e `--cantinho` (passou). Capturas `--capturas-trilha` no computador:
  pares com 3 figuras e 3 leituras conferidos; a rodada do celular parou numa lição (TF-07, sem par mínimo) com "a sessão não chegou
  ao ritual de fim" e não foi investigada. Falta ouvir "Voa." (transcrito "Vou, ah?").

**Barra da vila, lâmpadas das Palmas e regra 6 (16/11, tarde; NÃO publicado ainda):**
- **Barra da vila** (`web/src/telas/crianca/DocaVila.tsx`, `estilos-doca.css`): eram 8–9 botões (no celular de 25 a 48 px de largura).
  Agora são 5 portas grandes: **Missão** (larga, em cima no celular), **Leitura** (livrinho com a capa de uma história), **Brincar**
  (pandeiro 3D), **Lojinha** (ou "Meu boneco" quando a Lojinha está fora da vila) e **Mais**. Celular 390×844: 82×92 px cada; PC: 112×112.
  O **Mais** abre um painel grande (folha que sobe no celular, 2 colunas; cartão no PC, 3 colunas) com Alfabeto, Sons, Álbum, Ilhas,
  Meu boneco, Passear 3D e o **Treino rápido** quando houver (o "Mais" ganha o rostinho da Sofia piscando). Nada saiu (regra 7). Toque
  com "toc" (`efeitos.toque`); não há fala gravada para os rótulos. Fecha no X, tocando fora ou com Esc. `data-testid` mantidos
  (`ir-missao`, `ir-leitura`, `ir-brincar`, `ir-treino`); novos `ir-mais`, `painel-mais`, `fechar-mais`, `ir-lojinha`. E2E
  `capturas-etapa9.mjs` abre o "Mais" antes do Treino. Capturas antes/depois: `app/docs/capturas/v9-barra-*` e `v9-palmas-lampadas*`.
- **Palmas:** a Sofia diz "olha as lâmpadas" e a tela mostrava formas que pareciam casinhas. Agora é um **varal de lâmpadas** de verdade
  (bocal em cima, bulbo de vidro com filamento, fio caído entre elas; a palma acende o bulbo e mostra o pedacinho). Na amarelinha
  (fase antiga R0-F03, hoje fora da jornada) cada casa ganhou a sua lâmpada em cima. Nenhuma voz gerada. As outras falas da mecânica
  ("Cada palma acendeu uma lâmpada!", "Olha eu batendo devagar.") combinam com a tela; na amarelinha a comemoração padrão diz "palma"
  enquanto o botão diz "Pular" (pequeno; fica como está).
- **Regra 6:** R2a-F04 virou "**Juntar sons**: primeiras palavras" e a cena "Ponte das Sílabas" virou "Ponte das **Palavras**" (IDs
  iguais); na família, "junta consoante e vogal em sílabas" virou "junta o som da consoante com o som da vogal (MA, LU, FI)". A entrada
  falada da fase (o clipe dizia "Juntar sílabas…") passou a usar a acolhida já gravada. Falas gravadas que ainda dizem "sílaba" estão
  em `app/docs/falas-pendentes.md` §1b. **Sugestões ao dono (D022, não mudadas):** "Caça às Sílabas" (`motor/src/nivel.ts`,
  `bancada-selos.tsx`, Lupa da Lojinha), "Cachoeira das Sílabas" (chefe R2a-F05, título do nível 16, selos), selos "Bate-Sílaba",
  "Tábua de Sílabas" e "Montar sílabas na tábua" — nomes que podem vender a sílaba como peça de leitura.
- **Verificado (16/11):** typecheck, lint, 259 testes, verificador de decodificabilidade (0 erros), `capturas-etapa9.mjs` inteiro
  ("Tudo certo": Treino rápido pelo "Mais", rostinho da Sofia corrigido — antes saía um círculo vazio por causa do `max-width` global
  das imagens, também na Lojinha/Ritual) e E2E `--sem-jornada` em build separado: trechos 1 a 12 e Voz em tempo real passaram
  (115 checagens, inclui o Cantinho entrando pelo botão Leitura); **o trecho C (cópia dos dados) falhou** esperando o botão
  "Restaurar uma cópia" nas Configurações (30 s). Não tem relação com a barra; não foi investigado (pode vir das telas sob demanda).

**Primeiro acesso leve (16/11, noite; NÃO publicado ainda):**
- **Antes:** o service worker baixava no primeiro acesso 2.099 arquivos (58 MB: todas as vozes, sons, figuras, vídeos dos
  personagens, Mundo 3D, Espelho); JS inicial 886 KB (275 KB gzip) + CSS 43 KB gzip; a entrada baixava as duas artes e o vídeo de 1,1 MB.
- **Agora:** precache = 56 arquivos (~2,0 MB: HTML, JS/CSS, ícones, fontes, manifestos da voz); JS inicial ~560 KB (~180 KB gzip)
  + CSS 35 KB gzip. Service worker próprio (`app/web/sw/sw.ts`, regras em `sw/regras.ts`, estratégia injectManifest):
  vozes, sons, figuras, vídeos, modelos 3D, Mundo 3D e Espelho entram no aparelho **quando usados** (primeiro o aparelho,
  com teto de arquivos e versão por grupo calculada no build; pedido com Range é respondido do cache, também sem internet).
  Quem já tinha a versão antiga não perde nada: na instalação a mídia do precache antigo que não mudou passa para os caches
  novos (confere o md5 em `midia-revisoes.json`, só lido nessa hora). No primeiro acesso, o que carregou antes do service worker
  assumir é pedido de novo através dele (`servicos/cache-inicial.ts`); ao abrir uma criança, as falas comuns (acerto, quase,
  vamos juntos, fim da missão, voltou) ficam no aparelho com o nome dela (`servicos/sem-internet.ts`), para a dupla não ficar
  muda sem internet num erro que ainda não tinha acontecido.
- Telas sob demanda (React.lazy no `App.tsx`; só a entrada no JS inicial); three.js já vinha separado. `@fonema/conteudo` e
  `@fonema/motor` marcados `sideEffects: false`. Entrada: só a arte da orientação atual; vídeo só em tela deitada e depois de a página carregar.
- **Limite conhecido:** sem internet só abre o que foi usado com internet (falas sorteadas que nunca tocaram ficam mudas, figuras
  de telas nunca abertas não aparecem). Não há pré-carga da próxima fase (ficou de fora).
- **Correções depois (17/11):** (1) tela sob demanda cujo pedaço sumiu (versão nova publicada com a página aberta, ou `dist`
  refeito durante um E2E) deixava a tela em branco; agora recarrega a página uma vez (`App.tsx`, reproduzido trocando o `dist`
  com a página aberta). (2) A falha do trecho da cópia dos dados no E2E era o avatar puxando de volta para a Chegada depois da fala
  "Ficou a sua cara!" quando já se tinha trocado de tela; agora só navega se ninguém trocou (`Avatar.tsx`).
- Verificado em `d4de656` numa cópia (worktree, porta 4490, com service worker): typecheck (inclui `tsc -p web/sw`), lint,
  259 testes (+5 em `web/sw/regras.test.ts`), build, **E2E completo, `--sem-jornada` e `--capturas-trilha` (PC e 390×844) verdes**.
  Teste Playwright sem internet: joga a Letra A com voz real online, desliga a rede, reabre o app e joga a Letra A de novo até o
  fim com voz e sem nenhum arquivo faltando (a fala do fim da missão e a de "voltou" vêm das falas comuns guardadas).

**Trava da voz, celular, cópia dos dados e textos (16/11, tarde; NÃO publicado ainda):**
- **Trava da voz (grave):** Trilha dos Sons → Lojinha (fala de boas-vindas tocando) → Letra A deixava a voz muda e o "Já conheci!"
  preso para sempre (o clipe acabava sem o navegador avisar o fim e toda fala seguinte esperava por ele). Agora: a espera de cada clipe
  sempre termina (`web/src/servicos/midia.ts`: fim, erro, pausa, vigia a cada 250 ms e tempo-limite = duração + 1,5 s; teste
  `midia.test.ts`), a troca de tela cancela a fala (`rotas.ts`), uma sequência cancelada para, e os botões de avanço de Letra, Espelho,
  Som novo e "Minha vez" têm rede de segurança (`servicos/destravar.ts`: 6 s sem fala soltam o botão). E2E com a voz real, sem o modo
  rápido: `node web/e2e/fluxo.e2e.mjs --voz-real` (simula o defeito; também rodado sem a simulação: "Já conheci!" libera em ~26 s,
  o tempo natural da apresentação da letra). Verificado: typecheck, lint, 244 testes e E2E `--sem-jornada` inteiro verde (com voz real e cópia).
- **Celular (390×844):** botão de avanço da lição preso no rodapé em todas as mecânicas com `.linha-botoes`, nas Palmas e no "Vamos!"
  do começo da lição (`estilos-mecanicas.css`); conferido no E2E da Trilha dos Sons em 390×844 (todos os botões de avanço dentro da tela).
  "Continuar" inteiro na criação da conta, título do mapa sem o cofrinho por cima, cadeado pequeno sem cobrir a letra na Trilha dos Sons,
  abas do adulto em duas linhas.
- **Cópia dos dados:** `navigator.storage.persist()` na abertura (`main.tsx`); "Restaurar uma cópia dos dados" em Configurações
  (`dados/copia.ts` valida; mostra de quem é a cópia e pede confirmação; contas dos adultos e sons gravados ficam). Testes: `copia.test.ts`
  e E2E `--copia` (também dentro do `--sem-jornada`).
- **Textos:** a criança não vê mais "Eu faço / Nós fazemos / Você faz / Desafio" (o nome do método fica em `data-metodo`); cadastro sem
  "juntando letras em sílabas"; vila com estrela no marcador (combina com "Toque na estrela"); fala do R1-F06 que citava botões que
  não existem virou "Agora é a sua vez, [NOME]!" (clipe já existente); painel da família sem "0%" sem dados e sem citação bibliográfica
  na tela dos pais (a fonte fica no código). Espelho do Som busca o three.js só no caminho que existe (sem 404).
- ~~Pendente: fala das Palmas e título silábico do R2a~~ → resolvido no bloco "Barra da vila, lâmpadas e regra 6" acima.

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
  "O/E no fim soam U/I", N Z J; sons que estouram P T B C D G, regra TI/DI) + revisões TF-R2 e TF-R3. Jornada (até 16/11; desde a D031 é
  alternada, ver bloco D031 abaixo): Alfabeto → **Trilha dos Sons** → Ilha das Vogais (é/ê, ó/ô = TF-23/24) → Vale do M-L-F (vira revisão/chefe) → Meu nome. "Já conhece as letras e os sons" começa
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
- **Verificado (15/11, build próprio):** typecheck, lint, 206 testes; E2E `--trilha-sons` (TF-01, TF-06 → TF-22 em sequência, sem pular:
  19 lições concluídas, 2 já douradas — dourada pede TODAS as habilidades firmes, o que leva mais sessões) e E2E `--sem-jornada` inteiro
  (98 checagens, inclui o trecho da trilha). Capturas `app/docs/capturas/v7-trilha-*.png` (1850×980 e 390×844), olhadas e corrigidas
  (`node web/e2e/fluxo.e2e.mjs --capturas-trilha`). O E2E completo (com a jornada inteira, ≈25 min) não foi rodado.
- **Pendente:** ouvir as palavras inventadas e "tia/dia" (voz sintética); selos para as consoantes novas (regra fica no motor);
  sincronia real das palavras no eco; revisão das listas por alfabetizadora; blocos 4 a 8 (TF-23…TF-53).

**Revisão independente da metodologia, dos PDFs e do código (16/11; NÃO publicado ainda):** corrigido no ramo (detalhe em
`docs/pedagogia/00-principios.md` §7):
- **Pronúncia anotada** (`fases/tf-banco.ts`): "veja" /ˈvɛʒɐ/ e "come" /ˈkɔmi/ (E/O abertos, só depois de TF-24) e "fofa" /ˈfofɐ/.
  TF-15 usa "seja" no lugar de "veja"; a frase de TF-19 virou "O macaco viu a jaca." (voz pendente em `app/docs/falas-pendentes.md`).
  **E/O tônicos que pedem ouvido de alfabetizadora:** `selo` e `zelo` (anotados como substantivo, /e/; como verbo seriam /ɛ/), `jogo`
  (substantivo /o/; "eu jogo" é /ɔ/), `zoa` e `soa` (/o/; há quem fale aberto), a palavra inventada `femo` (o E tônico pode ser lido
  aberto), `copo` /ɔ/, `mola` /ɔ/, `sopa` /o/, `boca` /o/, `gota` /o/, `doze` /o/. As outras anotações de E/O conferem com a fala comum.
- **Sílaba não é domínio de letra nem de leitura** (regra 6): no Vale do M-L-F, "qual sílaba falta" e montar por sílaba gravam a
  habilidade `silaba` como exposição; entrou "Gol letra por letra" (R2a-F04-C4c) e o verificador passou a conferir essas palavras.
- **Domínio numa sessão só acabou**: chefe vencido e prova-relâmpago liberam o avanço, mas deixam as habilidades "a confirmar" (sem subir a
  firmeza nem dar moedinha de marco) até o critério de 06 §2; prova só de autorrelato vale 0; critério 5 de 06 §2 (palavras diferentes e
  mais de um tipo de atividade, quando o conteúdo oferece); selos de som só com domínio de verdade. Consequência: menos lições ficam
  douradas na primeira passada (E2E: 1 de 19).
- **Pares mínimos** gravam a habilidade do contraste (mala/bala = M × B, dado/dedo = vogal), com teste.
- **Verificador da Trilha A–Z** acumula só as letras já vistas na jornada (usado pela D031, que mudou a ordem: ver bloco abaixo).
- **Tipos de erro**: os 12 de 06 §1, quando os dados permitem, no painel ("Que tipo de erro aparece mais").
- **Sondagem** também para 4–5 anos (só escuta, som inicial e letras); toda placa com 3 opções.
- **Documentos**: ABC p. 334 (Quadro 3); todos os ajustes de ordem em relação ao Vamos Todos; Soares p. 146; convenção do R do MP p. 88
  (o app não usa gato para o R: nada trocado); "eu faço, nós fazemos, você faz" como extensão do projeto. As páginas novas citadas pela
  revisão **não foram conferidas** (os PDFs não estão no repositório).
- Verificado: typecheck, lint, 231 testes, relatório de decodificabilidade (325 itens, 0 erros), E2E `--trilha-sons` (passou) e
  `--sem-jornada` (trechos 1 a 11 passaram, 100 checagens; o trecho 12, Cantinho da Leitura, da outra frente, não terminou dentro do
  limite de 10 min do teste e não foi conferido).

**Cantinho da Leitura e Brincar com sons (16/11; NÃO publicado ainda; capturas `app/docs/capturas/v8-*.png`):** a revisão apontou
que fluência, compreensão, vocabulário e jogos de escuta estavam só no papel. Agora existem (dados em `conteudo/src/biblioteca/`, regras
em `motor/src/biblioteca.ts`, telas `Biblioteca.tsx` e `BrincarSons.tsx`, botões "Leitura" e "Brincar" na vila):
- **Hora da história** (aberta desde o começo, para quem ainda não lê): "O Bolota e a chuva" e "O piquenique da Fia" (histórias do
  projeto), 5 páginas ilustradas (MiniMax, `ferramentas/gerar-ilustracao-minimax.py`), narração da Sofia; perguntas antes (previsão,
  sem nota), durante (direta) e depois (direta e de dedução) respondidas por figura; no 1º erro a Sofia relê o trecho; 3 palavras de
  vocabulário por história (Tales apresenta, Sofia explica e usa numa frase, conferência por figura).
- **Ler sozinho**: um texto decodificável no fim de cada bloco ("Oi!" até TF-06; "A ema suja" até TF-15; "O bolo da tia" até TF-22),
  passando no verificador (teste `conteudo/test/biblioteca.test.ts`; palavras novas de, da, no, caiu no fim de `tf-banco.ts`).
  Tocar numa palavra toca os sons; perguntas com o texto à vista; leitura em coro no fim. Livrinho no fim de cada bloco da Trilha dos Sons.
- **Ler mais ligeiro** (fluência): só abre com precisão de leitura ≥ 95% nas últimas 20 respostas conferidas (ABC p. 375–376); lista
  de 8 palavras que a criança JÁ leu certo, relida até 3 vezes firme; cada palavra conferida pela escolha da figura (o microfone é
  opcional e só apoio). Criança vê um caminho de pedrinhas com estrelas; adulto vê palavras certas por minuto e precisão por leitura,
  **sem meta** (as do ABC p. 379 são de Portugal; meta brasileira = decisão do projeto a calibrar).
- **Ler em eco e em coro** frases já estudadas (autorrelato: fica fora do domínio). **Escrever do meu jeito** (N13): letras móveis
  livres, depois confronto letra a letra com a forma certa, a Sofia aponta o som que faltou com o som real da letra, reescrita sem modelo;
  guardado para o adulto, sem nota.
- **Brincar com sons** (sempre aberto, não trava nada): palavra comprida, palavra escondida (sapato/pato, luva/uva…), achar a rima,
  quem não rima, mesmo começo, palmas. Exemplo da Sofia na 1ª vez, posições sorteadas, correção contrastiva, a parte escrita só depois.
- **Registro**: respostas conferidas vão ao motor com `contexto: 'livre'` (habilidades novas: palavra-maior, silaba-inicial,
  palavra-dentro, compreensao-ouvida, vocabulario, leitura-texto, fluencia-palavras); previsão, eco, coro e escrita própria só no
  resumo `Progresso.biblioteca`. Painel do adulto: gráfico de fluência, tabela da escrita própria, histórias, textos e jogos.
- **Vozes**: 144 clipes novos (4.904 caracteres), masterizados, auditados e `bocas.json` refeito. A auditoria (só Scribe) marcou alguns
  clipes novos como graves com transcrição absurda ("[som de transição]") e sinal normal: provável erro do transcritor, mas **ninguém
  ouviu**; e "Dividir", "Poça", "A ema sai suja, suja!" a conferir de ouvido (lista em `app/docs/falas-pendentes.md`).
- **Verificado:** typecheck, lint, testes (novos em `conteudo/test/biblioteca.test.ts` e `motor/test/biblioteca.test.ts`), E2E
  `--cantinho` (13 checagens; o progresso da trilha é SEMEADO no banco do aparelho para chegar aos textos e à fluência) e capturas
  v8 olhadas e corrigidas. O E2E `--sem-jornada` inteiro NÃO chegou ao trecho do Cantinho: parou antes, na checagem da D031 ("o botão
  leva à jornada…"), que é da outra frente em andamento. ElevenLabs depois desta rodada: 122.141 de 131.000 (≈ 8,9 mil restantes;
  enviados 4.904 caracteres, o contador subiu 2.314). **Não ficou bom** (corrigido em 16/11, ver bloco dos pares mínimos): o tatu mudava de cara de página para página;
  o texto do bloco 1 era só um diálogo de interjeições. **Não feito**: jogo da memória letra × cena e roleta de
  sons (referência Wordwall, pesquisa 46), mais histórias, textos dos blocos 4–8, leitura cronometrada de TEXTO.

**D031 — letras e sons alternados na jornada (16/11; NÃO publicado ainda; decisão do dono "B"):**
- **Nova ordem** (`conteudo/src/regioes.ts` › `FASES_LETRAS_E_SONS`; dados em `conteudo/src/alfabeto.ts` › `LICAO_DA_LETRA`,
  `BLOCOS_ALFABETO`): A TF-01 · E TF-02 · I TF-03 · O TF-04 · U TF-05 · TF-06 · **revisão das vogais (AL-RV1)** · M TF-07 · F TF-08 ·
  V TF-09 · L TF-10 · S TF-11 · TF-12 · N TF-13 · Z TF-14 · J TF-15 · TF-R2 · **revisão M…J (AL-RV2)** · P TF-16 · T TF-17 · B TF-18 ·
  C TF-19 · D TF-20 · G TF-21 · TF-22 · TF-R3 · **revisão P…G (AL-RV3)** · R · H · X · Q · K · Y · W · Festa do Alfabeto · R1 · R2a · R0.
- **Mapa (regra 7):** a Trilha A–Z continua inteira, em ordem alfabética, com as 3 revisões novas e a Festa no fim. As revisões antigas
  AL-R1…AL-R4 (grupos alfabéticos) ficam no banco (`FASES_ALFABETO_REVISOES_ANTIGAS`), fora da jornada. Os botões "Continuar" da
  Trilha A–Z e da Trilha dos Sons levam sempre à fase de agora, mesmo quando ela está na outra trilha.
- **Palavrinhas** da fase da letra: só as que usam letras já vistas NA NOVA ORDEM (`palavrinhasDaLetra`); várias letras ficaram sem
  (E, F, I, J, M, O, S, U, Z…), porque a lição TF logo depois já lê com a letra.
- **Ganchos:** a fase da letra que tem lição termina com "Amanhã tem mais um som!" (já gravada); o gancho da Festa virou "Agora as
  vogais vão mostrar os outros sons delas!" (**sem voz**, em `app/docs/falas-pendentes.md`).
- **Nível "já conhece as letras e os sons":** começa em TF-06 e agora deixa a Trilha A–Z INTEIRA liberada para revisar (as letras que
  vêm depois de TF-06 não entram no caminho dessa criança). Revisar uma fase liberada não abre a seguinte.
- **Progresso salvo:** versão 3 (`motor/src/migracao.ts` › `reordenarJornada`): nada concluído se desfaz; a fase atual é a primeira
  que falta na nova ordem e é a única aberta; fases novas entram trancadas. `concluirFase` abre a próxima pendente mesmo quando a
  seguinte já estava concluída (dado antigo). Teste: `motor/test/d031.test.ts`.
- **E2E completo:** a falha antiga em "fase TF-01/TF-06 jogada e concluída" era do próprio teste: entre uma tentativa e outra ele
  voltava para a MESMA rota da sessão, que não recarrega; a 2ª e a 3ª tentativa só reliam o ritual. Agora passa por outra tela antes.
- **Verificado (16/11):** typecheck, lint, 242 testes, relatório de decodificabilidade (323 itens, 0 erros, 21 avisos) e **E2E completo
  sem flags** (build próprio, 177 checagens, "E2E OK"; a jornada inteira na ordem alternada, Festa com troféu, nível inicial, Trilha dos
  Sons e Cantinho). **Não verificado:** capturas `--capturas` (as do trecho de revisão A–E foram retiradas) e uso real por criança.
- **Decidido (dono: opção B):** o portão do nível 7 passou da Festa do Alfabeto para a TF-R2 "Revisão: sons que esticam"
  (fase 30), perto de onde a Festa ficava antes da D031 (`motor/src/nivel.ts`; complemento na D031).

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
