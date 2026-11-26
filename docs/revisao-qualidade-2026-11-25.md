# Revisão de qualidade — olhando o app como usuário (25/11/2026)

Pedido do dono (fila nº 23, 18/11): "tem muita coisa ruim ainda; muito amador, profissionalizar".
Como foi feito: cópia limpa do ramo (git worktree, build de produção servido localmente), percorrida com Playwright em
**celular 390×844**, **tablet 820×1180** e **PC 1440×900** (deviceScaleFactor 1), como um adulto novo: entrada → primeira vez
(conta + PIN) → cadastro da criança em 3 passos → boneco → tutorial → vila → mapa → 3 primeiras missões (Letra A, O som do A ×2)
→ Trilha A–Z → Trilha dos Sons → Brincar e cada jogo → Lojinha → Álbum → Cantinho da Leitura → Fichas → Memória → passeio 3D
(entrar/voltar) → Área da Família (lista, painel, configurações) → Área do Professor → cartões dos alunos → #/admin.
Cada captura foi olhada; uma medida automática listou botões < 44 px, botões fora da tela, texto cortado e rolagem para o lado.
Nenhum erro de JavaScript nem erro no console em nenhum dos três tamanhos.

Capturas: ANTES em `app/docs/capturas/v16-revisao-antes-*.jpg`, DEPOIS em `app/docs/capturas/v16-revisao-depois-*.jpg`.

Gravidade: **A** = parece quebrado / atrapalha; **M** = parece amador; **B** = detalhe.

## 1. Corrigido nesta revisão

| # | O que estava errado | Onde | Grav. | Correção |
|---|---|---|---|---|
| 1 | Mapa da vila fora do lugar: metade da tela azul vazia | vila no **tablet em pé**, ao voltar do passeio 3D | A | `MapaNavegavel` recentra também quando só a largura muda (no tablet em pé a base do mapa só dependia da altura) |
| 2 | Capa "Família e corpo" das Fichas sem figura (estrela num círculo branco) | Fichas de leitura, todos os tamanhos | A | `caminhoFigura`: o hífen de `vovo-f` era apagado antes de procurar a figura (vale para todo nome com hífen: alto-falante, bola-vermelha…) |
| 3 | Letras "MmAaSs" saindo dos círculos e encavaladas | capa do Corre-Som (e de todo jogo de sons) | M | letra menor dentro do círculo |
| 4 | "Trilha do Alfabeto / Letra A" amarelo/branco sobre a foto clara, difícil de ler | entrada da fase no celular | M | véu escuro também em cima da foto no celular + sombra no rótulo |
| 5 | Botão "Continuar/Começar" do painel guia com o texto encostando/estourando | vila e trilhas no PC | M | a regra de tamanho perdia para `.btn.enorme`; agora vale (ícone e margens menores) |
| 6 | Tela de jogo trancado só com título e botão apagado, sem explicar e sem "Outros jogos" | Carteiro, Casa do Som, Estrada e Rio | M | mostra o que o jogo treina e sempre tem "Outros jogos" (como Corre-Som e Memória) |
| 7 | "falta mais 2 tentativa(s); treinar em mais 1 sessão(ões)" | painel da família/professor | M | plural certo ("2 tentativas", "1 sessão"), também em pseudopalavras, palavras, tipos |
| 8 | Chip "Sons e letras com mais erro" com a legenda por cima do chip | painel da família (tablet/celular, depois de abrir a Trilha dos Sons) | M | a classe `.ficha` do painel batia com a ficha amarela da Trilha dos Sons; renomeada |
| 9 | "Tchau!Voltar para a vila", "Carteiro daVila" (espaço quase sumindo antes do V na fonte Fredoka) | fim da missão, títulos | M | um pouco mais de espaço entre palavras em títulos e botões |
| 10 | Primeiro item do menu ("Turma") cortado/colado na marca | Área do Professor a 1440 px | M | menu não centraliza mais "para fora"; itens um pouco mais compactos entre 900 e 1600 px |
| 11 | Letra sozinha sem o par: "a", "e", "m"… nos discos | Trilha dos Sons | M | disco mostra "Aa", "Ee", "Mm" (só na tela; o rótulo do conteúdo, "ai", "é·ó" e ★ ficam iguais). **Decisão de julgamento** pela regra do dono "Aa em todo o site" |
| 12 | Letra sozinha "A" grande em "Qual é o som desta letra?" | missão Letra A (e as outras letras) | M | mostra "Aa"; as respostas são botões de som, nada é entregue (regra 3) |
| 13 | Letra sozinha "A" no chip de erro do painel | painel da família | B | "Aa" quando o item é letra |
| 14 | Botões de ouvir das figuras 38 px; passos do boneco 37×38 px | missão (3 figuras) e montar o boneco, no celular | B | 44 px de altura (a largura dos 8 passos do boneco não cabe em 44 px num celular de 390 px) |
| 15 | "impressão digital dela (PBKDF2)" e "gravação(ões)" | #/admin | B | texto sem jargão; plural certo |

Nenhuma palavra, fase, fala gravada ou regra de domínio mudou (o texto do domínio mudou só no plural; os testes do motor
continuam passando).

## 2. Visto e NÃO corrigido (com o porquê)

| # | O que se vê | Onde | Grav. | Por que ficou |
|---|---|---|---|---|
| a | Cartão de ajuda do passeio espremido em 4 colunas estreitas ("Dedo à / esquerda: / andar…") | passeio 3D no celular | M | passeio é de outra frente (não mexer); só listado |
| b | Pílula "Mariana" do topo cobre a placa do Coreto | passeio 3D no celular | B | idem |
| c | Captura do passeio no PC sem placa de vídeo demora > 30 s (o carregamento mostra "Preparando a Vila das Letras…") | passeio 3D | B | idem; no tablet/celular abriu e voltou sem erro |
| d | 5 ilhas do mapa com "Em breve" | Arquipélago | M | é conteúdo ainda não feito (D027/D030), não defeito de tela |
| e | "em breve" nos campos das Fichas quando a criança ainda não tem as letras (parece "não pronto") | Fichas | M | **Resolvido depois (26/11, fila nº 30):** o dono escolheu "abre com as missões"; o texto trocou no cartão do campo, na palavra trancada e na frase do campo vazio (`Fichas.tsx`). A palavra trancada continua sem aparecer escrita (regra 2) |
| f | Fim da 1ª missão abre já rolado até o painel "Abriu!" (título da fase fica fora da tela) | ritual de fim | B | é de propósito (`Desbloqueio.tsx` rola até o que abriu) |
| g | Fala de fim igual em todas as missões ("Hoje você trabalhou com muita atenção, [NOME].") | fim de missão | M | **precisa de voz nova**: 3–5 variantes gravadas (Sofia e Tales) para revezar |
| h | "Letra A", "Próxima: Letra E", "Fase concluída: Letra A!" — o nome da fase tem a letra só maiúscula | títulos de fase, painel guia, ritual | B | é título de conteúdo (e também falado); pergunta ao dono se vira "Letra Aa" |
| i | Peça da Lojinha que abriu chamada só "Verde" / "Amarelo" no painel "Abriu!" | fim de missão | B | o nome vem do catálogo; sugerir "Camiseta verde" — fica para a rodada do catálogo |
| j | Bolinha vazia solitária embaixo de "Começando" | painel guia/topo da vila antes do 1º nível | B | é a barra de nível com 0 de 3 (só há uma bolinha porque o nível 0 tem 1 passo) |
| k | Texto de adulto no Brincar ("Os jogos de escutar ficam sempre abertos e não travam a trilha…") | Brincar | B | inofensivo; sugerir mover para a Área da Família |
| l | "A dupla fala como" quebra em 3 linhas no resumo do cadastro | cadastro, passo 3, celular | B | cabe; só feio |
| m | Links de adulto pequenos ("mudar" 47×36, "ver detalhes de privacidade" 20 px, "Área do administrador" 21 px, "Saiba mais") | cadastro, configurações, painel | B | são links de texto para adulto, não alvo da criança |
| n | Locais da vila parcialmente fora da tela no celular (ex.: "Minha casa") | vila | B | o mapa arrasta; é o desenho do mapa |
| o | Um teste do motor ("toda fase de domínio é alcançável…", 4 s) falhou 1 vez com a máquina carregada e passou nas outras | `npm test` | B | provável tempo-limite sob carga (E2E rodando junto) |

## 3. Precisa de voz nova (não gerada aqui)
- Variantes da fala de fim de missão (item g).
- Se o dono aprovar "Letra Aa" nos títulos (item h), as falas que leem o título continuam iguais (o som não muda), só o texto.

## 4. Verificação
- `npm run typecheck`, `npm run lint` e `npm test` (484/484) verdes antes de cada commit.
- Capturas DEPOIS olhadas nos três tamanhos: Fichas com a vovó, capa do Corre-Som, entrada da fase no celular, guia no PC,
  Carteiro/Casa do Som trancados com descrição e "Outros jogos", Trilha dos Sons com "Aa", mapa da vila no tablet depois de
  mudar a largura, menu do professor a 1440 px (medido: largura do menu = largura visível, nada escondido).
- Nome da criança na fala (E2E `--nome-falado`, voz real): lição da Letra A com o nome dito 2× em atividades diferentes
  (no máximo 1× por atividade ✓); jogo "Achar a rima" com o nome 1× ✓.
- E2E `--sem-jornada` no build com tudo (d64e39c, inclui o passeio da outra frente): **468 ✓ 0 ✗, E2E OK**. Antes das
  correções, o mesmo E2E no build sem mudanças parou em 155 ✓ no 1º ✗ ("Letra A: … Corre-Som … Bichinho … jogados"), com a máquina
  carregada pelas capturas rodando junto; depois não se repetiu (provável tempo, não defeito).

## 5. Como refazer
Os roteiros desta revisão ficaram fora do repositório (eram descartáveis). Para repetir: build, servidor estático, e um
Playwright que cadastra (helpers `cadastrar`/`montarAvatar`/`jogarSessao` do `e2e/fluxo.e2e.mjs`), joga as 3 primeiras missões
com uma captura por cena e visita cada rota da criança e do adulto, medindo botões < 44 px, elementos fora da largura e texto cortado.
O E2E `--telas` já cobre "nada passa da largura" e "respostas à vista".
