# Revisão de qualidade — 18/11/2026 (fila do dono nº 23)

Pedido do dono: "tem muita coisa ruim ainda". Revisão **só de leitura** (nenhum código mudou), feita olhando o app como uma criança
nova de 5 anos que não lê e como um adulto.

**Como foi feito.** Cópia separada do repositório no commit `921d9ed`, `npm run build`, `web/dist` servido em `127.0.0.1:4640`.
Chromium (Playwright) **sem o modo de teste rápido** (voz real, esperando cada fala acabar), em **1850×980** e **390×844**. Um
registro em cada página anotou todo áudio que começava a tocar e se havia outro áudio tocando ao mesmo tempo, além de erros do console.
Percurso: entrada → primeira vez (conta + PIN) → cadastro (3 passos) → boneco → tutorial inteiro → Letra A → vila e painel guia →
Lição "O som /a/" (2 vezes, até liberar) → Letra E (no celular, com 1 erro de propósito) → Trilha A–Z e Trilha dos Sons → segunda
criança "Já lê palavras" → Cantinho da Leitura (história "O Bolota e a chuva", fichas "Animais") → Brincar (4 brincadeiras de escutar
e os 6 jogos, com fases semeadas como concluídas só para abrir os jogos) → Lojinha → Álbum → "Mais" → Passeio 3D → Área da Família
(lista, painel, configurações) → Área do Professor → `#/admin` (visão geral, Escola, Áudios). Capturas em
`docs/revisoes/capturas-2026-11-18/` (o número do arquivo vem antes do nome).

**Limites honestos.** Chromium sem placa de vídeo (o 3D fica mais lento que num aparelho de verdade; não julguei FPS). Áudio tocado
em placa falsa: medi *quando* cada clipe começa e se havia outro tocando, não ouvi a qualidade. Os jogos foram abertos com fases
marcadas como concluídas direto no banco do aparelho (como o E2E faz), então a ordem de desbloqueio deles não foi testada.

**Frentes que já estão em andamento** (anotei o que vi, mas não é o foco): desbloqueio progressivo/cadeados, passeio 3D
(andar/nadar), avatar (cabelos/olhos) e gerenciador de conteúdo (admin).

**Console:** nenhum erro de JavaScript em todo o percurso. Só um `404 /audio/pacote.json` em toda página (item 39) e avisos do WebGL
do próprio Chromium sem placa de vídeo.

---

## Situação dos itens — frente das telas e do visual (18/11, à tarde)

Feito e conferido pela checagem automática nova (`app/web/e2e/trecho-telas.mjs`: em 390×844 e 1850×980, nenhuma rolagem para o
lado, todas as respostas inteiras sem rolar e sem nada por cima, "Voltar para a vila" à vista no fim da missão, nada de "/a/",
"domínio", "para o adulto" ou "+0 moedinhas" na tela da criança) e por capturas olhadas uma a uma.

- ✅ **8** Celular: as 3 respostas lado a lado em toda tela com 3 opções (lições, brincadeiras de escutar, história; cartões que
  crescem com a altura da tela; 4 respostas em 2×2 menores); a frase "Toque no alto-falante…" sai da lição no celular.
  Espelho do Som no celular: "De frente" e "Por dentro" empilhadas e inteiras acima do rodapé fixo (a checagem mede o quadro inteiro).
- ✅ **11** Entrada da fase sem "(o avanço é por domínio)", sem o objetivo escrito e sem "Em casa (para o adulto)" (continua na Área
  da Família); no lugar, o botão de ouvir a fala de novo. Títulos na tela da criança sem barras de fonética: "O som /a/" aparece
  "O som do A" (a voz continua com o texto original); vale para sessão, vila, alfinetes, painel guia, álbum e selos.
- ✅ **12** Fim da missão: sem moedas no dia, some a linha e aparece um elogio (nunca "+0"); as moedinhas voam logo no começo e o
  contador sobe de uma em uma na hora; "Próximo objetivo" só quando é outra missão de verdade (e com o título sem fonética); a
  fileira de botões fica presa embaixo no computador (com "Tchau! Voltar para a vila" primeiro) e o "Voltar" fica preso embaixo no
  celular. A "medalha genérica" do celular era o VERSO do selo (estrela e data) quando ele abre de costas: o selo de letra agora tem
  a letra também no verso.
- ✅ **13** Corre-Som: no celular a câmera ficou mais perto e mais fechada (letras dos arcos ~60 px em vez de ~40, os três arcos
  ocupam ~70 % da largura e as faixas de toque, que seguem a posição de cada arco na tela, ficaram largas); céu e morros pintados atrás
  da pista. (Placas HTML repetidas e terços iguais foram testados e desfeitos: repetiam a letra e erravam a pista no celular.)
  ⏸ a demonstração longa e os dois botões de som do celular; o boneco "todo branco" é a roupa inicial do avatar.
- ✅ **15** O convite "Dar comida ao Bolota" mostra o Bolota; no celular vira um botão redondo no canto, sem texto. ⏸ fala ao aparecer.
- ✅ **16** (parte) Palmas: as lâmpadas acendem sem a sílaba escrita. A troca de narrador é da frente de som.
- ✅ **18** (parte) "Falta 1 som" (singular). Cadeado e fala são da frente de desbloqueio.
- ✅ **21** (parte) Fundos borrados sem a Sofia e o Tales quando a dupla já está na frente: arte nova só de cenário
  (`arte/paisagem-sem-dupla.webp`) na chegada, fim da missão, tutorial, alunos, PIN e painel guia. ⏸ o retrato 2D no balão ao lado
  da dupla 3D: resolvido também — onde a dupla 3D está na tela (chegada, telas do cadastro com a dupla), o balão não repete o retrato
  2D (fica o nome de quem fala).
- ✅ **22** (parte) Carteiro: três casinhas pintadas novas (`arte/jogos/casa-carteiro-1..3.webp`, olhadas uma a uma, com a placa em
  branco onde entra a figura) numa rua da vila pintada (`arte/jogos/rua-vila.webp`). Estrada: campo pintado visto de cima
  (`arte/jogos/campo-estrada.webp`); Corre-Som: céu e morros pintados (`arte/jogos/ceu-corre-som.webp`); Casa do Som: sala pintada
  sem a dupla (`arte/jogos/sala-casa-som.webp`) e letras numa fileira só no celular; fundos dos jogos da vila sem a Sofia e o Tales.
- ✅ **23** (parte) Barraca da Lojinha sem "SHOP" (placa com duas moedinhas); ícones 3D novos para "Meu boneco" (camiseta no
  cabide) e "Passear 3D" (vilinha); no tutorial, cada brincadeira com a figura 3D da capa. Troféu: arte nova sem texto
  (`modelos3d/trofeu.webp`); o modelo 3D antigo tem "MESTRE LEITOR" EM RELEVO na malha (apagar a pintura não basta), então o troféu
  conquistado abre o selo em 360° até haver um troféu 3D sem texto (pode ser feito na Área do administrador › Foto → 3D com a arte
  nova). A moeda-fantasma do porquinho no tutorial também saiu (a 2ª moedinha não fica parada antes de voar).
- ✅ **24** Caminho da leitura: etapas futuras com cor, nome legível e cadeado pequeno.
- ✅ **25** Tutorial: a mãozinha aponta o "Brincar" de cima, sem cobrir a palavra; no último passo só o "Vamos!".
- ✅ **26** Vila no computador: os selos do "Última missão" sem o nome vazando; um botão grande só para a missão (o "Continuar" do
  painel guia; o "Missão" da barra de baixo só aparece onde o painel fica fechado, no celular e tablet; a estrela do mapa marca o lugar).
- ✅ **27** (parte) Vila no celular: sem rótulos cortados na borda (no celular os alfinetes mostram só a figura, menos a missão).
- ✅ **28** (parte) Lojinha no celular: roupas logo abaixo do boneco (porquinho grande e frase do adulto saem; abas numa linha;
  tipos de peça numa fileira); nenhuma tela rola para o lado. O carregamento cinza do boneco é da frente do avatar.
- ✅ **31** "A letra A": o cartão do exemplo aparece apagado desde o começo e acende com a fala.
- ✅ **33** Estrada: as cores à venda aparecem (uma classe "loja" colidia com o layout da Lojinha). ⏸ fala de apresentação.
- ✅ **34** Come-Som: o pedido é um balão de fala saindo da boca do Bolota.
- ✅ **37** Números sem o zero cortado (os algarismos vêm da Andika).
- ✅ (achados extras da frente de desbloqueio) Os textos de "Ler sozinho" trancados não mostram mais as primeiras linhas; no painel
  guia, com a missão de hoje feita, a barra cheia fica sob "Missão de hoje: feita!" e o nome embaixo vem como "Próxima: …".

## Situação dos itens — frente de som, espera e lógica (18/11, à tarde)

Conferido por testes unitários novos (`web/src/servicos/canal-audio.test.ts`, histórias, lições de vogal) e pelo E2E com **voz real**
(`node web/e2e/fluxo.e2e.mjs --voz-real`, trecho `web/e2e/trecho-voz-real.mjs`): a criança erra 250 ms depois de o som-estímulo começar
e um medidor anota cada áudio que soa de verdade (elementos `<audio>` e Web Audio). Resultado: **29 áudios, nenhuma sobreposição
maior que 50 ms**; pausa de 669 e 925 ms depois de cada som comparado; "Eu fiz o som!" nunca apagado.

- ✅ **1** Vozes se atropelando: **fila única de áudio** (`web/src/servicos/canal-audio.ts`). Toda fala, som de letra e som emendado
  espera o anterior acabar de verdade. Se a criança tocou na tela há pouco (≤ 0,9 s), o que tocava sai com fade de 90 ms (um som ou o
  fim de frase de menos de 1 s termina inteiro: a correção espera o som da escolha); sem toque, o novo espera (a pergunta não
  atropela a Sofia). "Cadeia" de falas (`voz.cadeia()`): quando a criança responde no meio do enunciado, o estímulo antigo não entra
  por cima da correção (era a causa do registro `sofia-f7nnu8` + `e-fechado` + `b.mp3`). Pausa de 450 ms entre os sons comparados em
  todas as correções (Escolher, jogos, Caixas, Troca, Ligar, Memória). "Ver de novo"/"Ouvir de novo" recomeçam limpo (não rodam duas
  apresentações juntas).
- ✅ **2** Fichas: a rodada é sorteada uma vez e guardada até a ficha acabar; a palavra da abertura é a que é lida.
- ✅ **3** (parte) Fichas: letras já lidas em azul; verde só depois do acerto; a pergunta não aparece duas vezes. ⏸ desenho da boquinha
  parada (visual).
- ✅ **4** História: a pergunta "Olhe a capa…" mostra a capa junto das opções (campo `mostraCapa`; teste: pergunta que cita a capa tem
  que mostrá-la). Revisadas as 8 perguntas e 6 de vocabulário das duas histórias contra as páginas.
- ✅ **5** História: a resposta certa é a bola **vermelha** da história (figura nova `figuras/bola-vermelha.webp`, feita a partir das
  cores da página 1; diz "bola", clipe já gravado). Notado e mantido: a uva da Fia é um cacho na figura e uma uva só na página.
- ✅ **6** Estrada dos Pares: a vez da criança começa limpa (sem a placa verde da demonstração, carro no começo da estrada). Mesmo
  padrão corrigido no Carteiro, Corre-Som, Come-Som e nos jogos de escuta. Memória e Casa do Som não têm demonstração com resposta marcada.
- ✅ **7** Botões apagados: onde ESCUTAR é a atividade ("Já conheci!", "Eu fiz o som!", "Continuar" do Som novo, "Virar a página",
  "Terminar" da história, "Agora é a minha vez!"), o botão fica com a cor normal, uma ondinha animada e "Ouvindo…"
  (`componentes/BotaoOuvindo.tsx`). "Ouvir o som", "Ver de novo" e "Ouvir de novo" nunca ficam apagados: tocar corta a fala com fade.
  ⏸ "Pronto, desenhei!" continua esperando o desenho (não é a voz).
- ✅ **10** Lições de vogal (TF-01…05): não repetem o "Som novo" (a fase da letra, logo antes, já apresenta o som) e fazem as mesmas
  perguntas como **Corre-Som** e **Bichinho Come-Som** (mesmos itens e registro; `comoJogo`). Letra = conhecer e traçar; lição = o som
  em jogo. Verificador e testes passam (o teste do roteiro foi ajustado e registra a decisão) [DP].
- ✅ **32** Figuras das respostas pré-carregadas; as opções só aparecem quando as figuras do item estão prontas (máx. 2,5 s).
- ⏸ **14** e **17** (falas novas) e a troca de narrador do **16**: pedem voz nova; registradas em `app/docs/falas-pendentes.md` §1i.

## Lista priorizada

Esforço: **P** = pequeno (horas), **M** = médio (1–2 dias), **G** = grande (semana ou arte nova).
"Frente" = frente de trabalho em andamento que já cobre o problema (— = nenhuma).

### A. Quebra a aula ou ensina errado (resolver primeiro)

**1. Falas e sons tocam por cima uns dos outros na correção e no começo da pergunta**
- Captura: `01-20-cel-ale-erro-al-e-c2b.jpg`, `02-11-ala-06-al-a-c4.jpg`
- Tela: lições da Trilha A–Z e da Trilha dos Sons ("Ouça o som e ache a letra", "Qual começa com o som?").
- O que está ruim: quando a criança erra logo (antes do estímulo acabar), a correção "Essa letra faz o som…" começa, o /e/ do
  estímulo toca junto e o /b/ entra 100 ms depois (registro: `sofia-f7nnu8` 76 720 ms, `e-fechado` 76 721 ms tocando junto,
  `b.mp3` 76 827 ms; o mesmo na Letra A com /a/ e /b/). Em "Qual figura começa com este som?" o som /a/ e o /e/ começam enquanto a
  frase da Sofia ainda toca (registro: `sons/a` com `SOBRE: sofia-127bx4o`). No fim da missão, duas falas seguidas com 0,8 s de
  diferença (a primeira é cortada).
- Por que importa: a correção contrastiva é o coração do método (escutar os dois sons separados). Encavalada, a criança ouve um
  "borrão" e não aprende a diferença; quem toca rápido (toda criança de 5 anos) sempre cai nisso.
- Sugestão: uma fila única de áudio por tela; ao responder, **parar** o estímulo em curso e só então começar a correção; ignorar
  novos toques enquanto a correção toca; a promessa de "terminou de falar" só resolver no `ended` do clipe (hoje parece resolver
  antes, quando outro áudio corta o atual). Teste E2E com voz real que erra em < 1 s.
- Esforço: **M** · Frente: —

**2. Fichas de leitura: a palavra muda na hora de ler (MACACO vira LOBO)**
- Captura: `03-47-ficha-ler-3s.jpg` → `04-48-ficha-lendo-2.jpg`
- Tela: Cantinho da Leitura › Fichas › Animais › nível 1 "Vamos ler juntos?".
- O que está ruim: a tela de abertura mostra **MACACO** com 6 boquinhas; ao tocar "Vamos ler juntos?" a palavra lida é **LOBO**.
- Por que importa: a criança se prepara para uma palavra e recebe outra; parece erro e quebra a confiança ("eu li errado?").
- Sugestão: a abertura mostrar a mesma palavra que vai ser lida (ou mostrar só o tema, sem palavra).
- Esforço: **P** · Frente: —

**3. Fichas: a palavra fica verde (sinal de acerto) antes de a criança responder; boquinhas parecem rostos sem olhos**
- Captura: `05-48-ficha-20s.jpg`
- Tela: ficha, depois de "Agora junte os sons" / "Mais rápido!".
- O que está ruim: LOBO fica toda verde enquanto a pergunta "Que palavra os sons formaram?" ainda espera a resposta. As 4 boquinhas
  paradas são círculos marrons iguais com lábios e dois pontinhos (nariz) — lembram cabeças sem olhos. A pergunta aparece duas vezes
  (no balão e embaixo da palavra).
- Por que importa: verde em todo o app quer dizer "acertou"; aqui confunde. A boquinha parada não ensina nada (D033 pede a boca do
  som de cada letra).
- Sugestão: usar a cor neutra/"lida" (azul) até a resposta; boquinha parada com o rosto inteiro da Sofia em miniatura ou só a boca,
  sem os pontinhos; tirar a pergunta repetida.
- Esforço: **P** (cor e texto) / **M** (desenho da boquinha) · Frente: —

**4. História: "Olhe a capa" sem a capa na tela**
- Captura: `06-24-historia-2.jpg`
- Tela: Hora da história › O Bolota e a chuva › "Antes da história".
- O que está ruim: Sofia diz "Olhe a capa. Que tempo você acha que vai fazer nesta história?", mas a capa sumiu; só aparecem sol,
  nuvem com chuva e estrela.
- Por que importa: a pergunta de previsão (antecipar pela capa) fica impossível; a criança chuta.
- Sugestão: manter a capa pequena acima das três figuras nesta pergunta.
- Esforço: **P** · Frente: —

**5. História: a resposta certa não é a bola da história**
- Captura: `07-25-hist-01.jpg` e `08-25-hist-05.jpg`
- Tela: "No meio da história" › "O que o Bolota levou quando saiu de casa?".
- O que está ruim: o texto e a ilustração mostram uma **bola vermelha**; a opção certa é uma **bola de futebol preta e branca**
  (as outras: mala e sacola).
- Por que importa: a criança atenta procura a bola vermelha e não acha; quem compreendeu a história é quem mais se confunde.
- Sugestão: figura de bola vermelha (já existe arte do Bolota com ela) como resposta.
- Esforço: **P** · Frente: —

**6. Estrada e Rio dos Pares: a resposta da demonstração continua marcada de verde**
- Captura: `09-31-estrada-pares-2.jpg`
- Tela: Brincar › Estrada e Rio dos Pares › "Ouvir e escolher", logo após "Olha como eu faço" → "Agora é com você!".
- O que está ruim: a placa da **faca** (resposta da demonstração) fica com borda verde quando a vez passa para a criança; a resposta
  certa agora é outra (vaca). O carrinho fica parado na grama, fora da estrada, com um balãozinho de som solto em cima.
- Por que importa: regra 3 (nada na tela entrega ou sugere resposta). Aqui a tela sugere a resposta **errada**.
- Sugestão: limpar destaque e posição do carro ao terminar a demonstração; carro sempre no início da estrada.
- Esforço: **P** · Frente: —

**7. Botões principais ficam "apagados" por vários segundos, sem explicar por quê**
- Captura: `14-11-ala-03-al-a-c2b.jpg`, `15-13-tf01-02-tf-01-c2.jpg`
- Tela: "Já conheci!", "Eu fiz o som!", "Continuar", "Ouvir o som", "Ver de novo", "Pronto, desenhei!", "Virar a página".
- O que está ruim: o botão fica verde-claro lavado (parece quebrado) enquanto a fala toca — 4 a 10 s. Em "Som novo" os **três**
  botões ficam apagados ao mesmo tempo.
- Por que importa: a criança toca, nada acontece, toca de novo, desiste ou chama o adulto. Não há sinal de "espera a Sofia".
- Sugestão: deixar o botão com a cor normal e uma animação de "ouvindo" (ondinha ou relógio de areia em volta), ou liberar assim que
  o estímulo principal acabar; nunca apagar "Ouvir o som".
- Esforço: **M** · Frente: —

**8. Celular: respostas e partes da tela escondidas embaixo**
- Captura: `11-20-cel-ale-06-al-e-c4.jpg`, `12-20-cel-ale-03-al-e-c2b.jpg`
- Tela: lições no celular (390×844).
- O que está ruim: em "Qual começa com o som?" as três figuras ficam em duas colunas e a 3ª (avião) fica cortada embaixo; no
  Espelho do Som a vista "Por dentro" some atrás da barra fixa de botões.
- Por que importa: a criança que não sabe rolar a tela nunca vê a terceira opção — e a resposta certa pode estar justamente lá.
- Sugestão: 3 opções lado a lado (cartões menores) ou em coluna sem a barra fixa por cima; Espelho com as duas vistas lado a lado.
- Esforço: **M** · Frente: —

**9. Repetir a mesma lição sem avisar ("Missão de hoje: feita!" + "Continuar" volta para ela)**
- Captura: `18-12-vila.jpg`, `51-14-vila-2.jpg`, `43-16-trilha-sons.jpg`
- Tela: vila, painel guia e Trilha dos Sons depois da lição "O som /a/".
- O que está ruim: o painel diz "MISSÃO DE HOJE: FEITA!" e, embaixo, "O som /a/ · Continuar" leva **à mesma lição** que acabou;
  a Letra E aberta pela rota volta para a vila; a Trilha dos Sons diz "0 de 27 lições · 0 dominadas". Só na 2ª vez a Letra E abriu.
- Por que importa: a criança acha que não fez nada; é o "cansar e desanimar" do pedido 22.
- Sugestão: já em andamento; quando a lição precisar ser repetida, dizer por voz ("Vamos treinar mais uma vez o /a/!").
- Esforço: **M** · Frente: **desbloqueio progressivo**

**10. TF-01 repete a Letra A quase igual, logo em seguida**
- Captura: `02-11-ala-06-al-a-c4.jpg` × `27-13-tf01-04-tf-01-c3c.jpg`
- Tela: Letra A → O som /a/.
- O que está ruim: as duas missões seguidas têm "Ouça o som e ache a letra" e "Qual começa com o som?" com as mesmas figuras
  (abelha) e o mesmo Espelho; "Som novo" de um som que acabou de ser apresentado.
- Por que importa: sensação de "já fiz isso" já no primeiro dia.
- Sugestão: na TF-01 trocar por mecânicas diferentes (Liga o Som, Memória nível 1, Pesca de Vogais) mantendo o mesmo alvo; revisar
  com `docs/pedagogia/04`.
- Esforço: **M** · Frente: —

### B. Confunde a criança ou o adulto

**11. Texto de adulto e símbolos de fonética nas telas da criança**
- Captura: `16-13-tf01-entrada.jpg`, `17-20-cel-ale-01.jpg`, `18-12-vila.jpg`
- Tela: entrada da fase, mapa da vila, painel guia, ritual.
- O que está ruim: "TRILHA DOS SONS · 1 LIÇÃO (O AVANÇO É POR DOMÍNIO)", "Em casa (para o adulto): …", "Próximo objetivo: Ouvir,
  dizer e achar o som /a/ e a letra A", "Depois: O som /ê/". A tela de entrada tem uma fala só e muito texto; a Letra A entra
  direto na sessão, as outras passam por essa tela (inconsistente).
- Por que importa: a criança não lê; "/a/" e "domínio" não dizem nada a ela; a página parece de adulto.
- Sugestão: na tela da criança, título com o desenho (a letra grande e a cena da Sofia) e uma fala; mover "Em casa" e "objetivo"
  para a Área da Família; trocar "/a/" por "o som do A" com o botão de ouvir.
- Esforço: **P** · Frente: —

**12. Fim da missão: "+0 moedinhas", contador atrasado, objetivo repetido, botões escondidos**
- Captura: `19-13-tf01-ritual.jpg`, `20-11-ala-ritual.jpg`, `21-20-cel-ale-ritual.jpg`
- Tela: ritual de fim.
- O que está ruim: na Letra E aparece "+0 moedinhas no cofrinho" e "Hoje o cofrinho já está cheio" (o limite do dia chegou com 12
  moedas); depois da TF-01 o cofrinho mostra 6 com "+3" ao lado (só vira 9 na próxima tela); "Próximo objetivo" repete o que acabou
  de ser feito; no PC (1850×980) o botão "Tchau! Voltar para a vila" fica abaixo da dobra; no celular abre por cima uma medalha 3D
  genérica (estrela sem letra) enquanto o selo 2D tem o "E".
- Por que importa: a recompensa é o que faz voltar no dia seguinte; "+0" depois de esforço é desmotivante.
- Sugestão: esconder a linha de moedas quando der 0 e trocar por um elogio ou selo; animar o contador somando; mostrar o próximo de
  verdade; ritual em uma tela só (sem rolar); medalha 3D com a letra.
- Esforço: **M** · Frente: —

**13. Corre-Som: letras minúsculas nos arcos e área de toque desigual**
- Captura: `22-31-corre-som-3.jpg`, `23-45-cel-corre-som.jpg`
- Tela: Brincar › Corre-Som › Letras.
- O que está ruim: as letras X, E, I nos arcos têm ~15 px no PC e ~10 px no celular, longe no horizonte; a "demonstração" passa de
  8 s sem os arcos chegarem perto; as áreas de toque das pistas medem 505, 95 e 505 px (a do meio é estreita). No celular há dois
  botões de som iguais lado a lado.
- Por que importa: o jogo é "ouvir e correr para a letra" — se a letra não dá para ver, vira sorte.
- Sugestão: placa grande com a letra sobre cada pista, perto do boneco, desde o começo; pistas com área de toque igual; um botão de
  som só.
- Esforço: **M** · Frente: —

**14. Memória dos Sons: a instrução fala de "ligar", o jogo é de virar cartas**
- Captura: `26-30-memoria-sons-c.jpg`
- Tela: Memória dos Sons (nível Memória grande).
- O que está ruim: Tales diz "Ligue cada letra à cena que faz o som dela" numa mesa de cartas viradas.
- Por que importa: a criança procura linhas para ligar.
- Sugestão: "Vire duas cartas: a cena e a letra do mesmo som" (fala nova a gravar).
- Esforço: **P** (texto) + gravação · Frente: —

**15. Botão de texto "Dar comida ao Bolota" no meio da atividade**
- Captura: `27-13-tf01-04-tf-01-c3c.jpg`
- Tela: "Qual começa com o som?" (Letra E e TF-01).
- O que está ruim: um botão amarelo com coração e só texto aparece sobre a pergunta, sem fala.
- Por que importa: a criança não lê, toca por curiosidade e sai da atividade (ou não sabe o que é).
- Sugestão: figura do Bolota com prato + fala ao aparecer, e só depois de responder.
- Esforço: **P** · Frente: —

**16. Brincadeiras de escutar: a voz troca no meio e a Palmas mostra sílabas escritas**
- Captura: `41-28-escuta-palmas-resp.jpg`, `42-28-escuta-rimas.jpg`
- Tela: Brincar › Palavra comprida, Achar a rima, Palavra escondida, Palmas.
- O que está ruim: Tales apresenta, e a Sofia conduz o resto do jogo (o Brincar é a área do Tales). A Palmas mostra "pipoca" e as
  lâmpadas "pi · po · ca" escritas num jogo de escuta. Em Achar a rima, o botão de som da figura-alvo fica colado na borda do cartão.
- Por que importa: troca de voz sem motivo confunde; sílaba escrita em jogo de escutar vai contra a regra 6 (a sílaba vale na
  escuta; para ler, a peça é a letra).
- Sugestão: um narrador por jogo; lâmpadas acendendo sem texto (ou com a figura).
- Esforço: **P** · Frente: —

**17. Chegada errada para quem "já lê palavras"**
- Captura: `33-22-davi-pos-pular.jpg`
- Tela: Chegada (depois de pular o tutorial) da criança cadastrada como "Já lê palavras".
- O que está ruim: Sofia pergunta "Você está pronto para conhecer as letras?"; o nome "Davi" é falado duas vezes.
- Sugestão: fala da chegada pelo nível inicial ("Você já lê! Vamos ler juntos?").
- Esforço: **P** + gravação · Frente: —

**18. Jogos trancados sem cadeado e sem voz; "Faltam 1 som"**
- Captura: `39-26b-brincar-full.jpg`, `40-27-jogo-trancado.jpg`
- Tela: Brincar e a tela de um jogo trancado.
- O que está ruim: os 6 jogos trancados parecem só "desbotados", sem cadeado; ao abrir, nenhuma fala diz por que não dá; o texto
  diz "Faltam 1 som da trilha para abrir" (concordância); o cartão do Corre-Som trancado mostra F e V, letras que a criança ainda
  não conhece. Ao rolar o Brincar no PC, o fundo acaba no meio e vira azul liso.
- Sugestão: cadeado + fala curta ("Esse abre depois do som do M!"); "Falta 1 som"; fundo fixo cobrindo a página.
- Esforço: **P** · Frente: **desbloqueio progressivo** (parte do cadeado)

**19. Cantinho da Leitura todo trancado para quem já lê**
- Captura: `45-23-leitura.jpg`
- Tela: Cantinho da Leitura da criança "Já lê palavras" recém-cadastrada.
- O que está ruim: Ler sozinho (3 textos), Fichas, Ler em eco, Ler em coro, Escrever e Ler mais ligeiro: tudo trancado. Só as 2
  histórias para ouvir abrem.
- Esforço: **M** · Frente: **desbloqueio progressivo**

**20. Painel da Família com texto técnico e dois "níveis"**
- Captura: `46-39-painel-familia.jpg`
- Tela: Área da Família › painel da criança.
- O que está ruim: "Nível 4 da jornada" ao lado de "Termômetro: Nível 0 de 10"; "(mais 2 tentativa(s); treinar em mais 1
  sessão(ões))"; "o conteúdo publicado hoje leva até 2"; "Agora: O som /ê/" e "Missão em casa: o som /e/" (duas grafias).
- Por que importa: a família é quem decide continuar; parece relatório de sistema.
- Sugestão: plural certo ("mais 2 tentativas"), um nome para cada medida ("Jornada" e "Leitura"), tirar a frase do "conteúdo
  publicado", uma grafia só do som.
- Esforço: **P** · Frente: —

### C. Fora do padrão visual 3D (D025) ou com cara de rascunho

**21. Personagens em dois estilos na mesma tela e "fantasmas" no fundo**
- Captura: `33-22-davi-pos-pular.jpg`, `34-03b-cadastro-1-preenchido.jpg`
- Tela: Chegada, cadastro, tutorial, vários fundos.
- O que está ruim: a Sofia e o Tales 3D (boneco) ao lado do retrato 2D (ilustração) da Sofia no balão; o fundo desfocado é a arte da
  entrada com a dupla, então aparecem duas Sofias e dois Tales (um nítido, outro borrado atrás).
- Sugestão: fundos sem a dupla (só cenário) quando ela já está em primeiro plano; escolher um estilo por tela.
- Esforço: **M** (fundos novos) · Frente: —

**22. Jogos com cara de protótipo: Carteiro, Estrada, Corre-Som, Casa do Som**
- Captura: `24-31-carteiro-3.jpg`, `09-31-estrada-pares-2.jpg`, `22-31-corre-som-3.jpg`, `53-31-casa-som-2.jpg`
- Tela: os jogos novos.
- O que está ruim: casas do Carteiro feitas de triângulos e retângulos chapados com "caixas de correio" azuis de rascunho; Estrada
  com estrada cinza e grama lisa; Corre-Som com árvores poligonais, moedas marrons e boneco todo branco; Casa do Som num cômodo
  borrado com o tapete enrolado (difícil reconhecer "tapete").
- Por que importa: D025 §4: "tela com cara de rascunho não é publicada". A diferença com a vila pintada e as figuras 3D é grande.
- Sugestão: cenários pintados (como a vila) atrás dos jogos 2D; casas do Carteiro com a arte das casas da vila; no Corre-Som, o
  mesmo material/iluminação do passeio.
- Esforço: **G** · Frente: —

**23. Ícones misturados (chapados × 3D) e "SHOP" em inglês**
- Captura: `29-10-tut-3.jpg`, `30-10-tut-4.jpg`, `32-34-mais.jpg`
- Tela: tutorial, menu "Mais", lista do Brincar no tutorial.
- O que está ruim: a barraca da Lojinha tem a placa **"SHOP"** (em inglês); o troféu "MESTRE LEITOR" é ilegível; no passo dos
  jogos os ícones são chapados (barras, olho, nota, alvo, coração); "Passear 3D" usa um cubo de linha; "Meu boneco" usa o ícone de
  casa; o porquinho do passo de moedas tem uma moeda-fantasma ao lado.
- Sugestão: refazer a barraca sem texto; ícones 3D do mesmo kit para todos os itens; ícone de boneco para "Meu boneco".
- Esforço: **M** · Frente: —

**24. Tutorial: o "caminho da leitura" parece todo desligado**
- Captura: `28-10-tut-1.jpg`, `52-45-cel-tutorial-caminho.jpg`
- Tela: tutorial, passo 2.
- O que está ruim: 8 das 9 etapas em cinza-claro sobre fundo claro, rótulos quase invisíveis, figuras miúdas; só "Letras e sons"
  tem cor. O "pé" de "Outros sons das vogais" não se explica.
- Sugestão: etapas futuras com cor e cadeado pequeno (não lavadas), rótulo com contraste, fala apontando cada uma.
- Esforço: **P** · Frente: —

**25. Tutorial: mãozinha em cima do "Brincar" e dois "Vamos!"**
- Captura: `30-10-tut-4.jpg`, `31-10-tut-5.jpg`
- O que está ruim: a mão que aponta cobre metade da palavra "Brincar"; no último passo há "Vamos!" no centro e outro botão de play
  amarelo no canto, fazendo a mesma coisa.
- Esforço: **P** · Frente: —

**26. Vila (PC): rótulos vazando, três botões para a mesma missão**
- Captura: `18-12-vila.jpg`
- O que está ruim: no cartão "Última missão" os nomes "Letra A" e "Cofrinho Novo" saem do cartão e invadem o de baixo; estrela no
  mapa, "Continuar" no painel e "Missão" na barra levam ao mesmo lugar; "Lojinha" aparece no mapa e na barra; a faixa branca do
  painel ocupa a lateral esquerda até embaixo, e o balão da Sofia fica metade sobre o painel e metade sobre o mapa.
- Sugestão: um botão principal; rótulos dentro do cartão; balão alinhado.
- Esforço: **P** · Frente: —

**27. Vila (celular): rótulos cortados e balão em cima da dupla**
- Captura: `38-19-cel-vila.jpg`
- O que está ruim: "Conheça seu corpo" vira "orpo" na borda; o balão da Sofia cobre a Sofia e o Tales; um alfinete de cadeado meio
  escondido atrás do balão.
- Sugestão: no celular, centralizar o mapa no que importa e esconder os alfinetes fora da tela (ou setinha na borda).
- Esforço: **P** · Frente: —

**28. Lojinha: boneco "fantasma" 2D enquanto o 3D carrega; no celular não mostra nada para comprar e rola para o lado**
- Captura: `35-32-lojinha.jpg` (4 s), `50-35-lojinha-12s.jpg` (12 s), `13-45-cel-lojinha.jpg`
- O que está ruim: por 5–10 s aparece um boneco cinza chapado, transparente, sem nada a ver com o 3D; os cartões das roupas também
  começam chapados. No celular a primeira tela é só o boneco, o porquinho e o texto "Moedinhas só se ganham aprendendo…" — nenhuma
  roupa; a página tem 445 px de largura em tela de 390 (rola para o lado).
- Sugestão: silhueta do próprio boneco 3D (ou girando "carregando") em vez do 2D; no celular, porquinho pequeno no topo e roupas
  logo abaixo do boneco; corrigir a largura.
- Esforço: **M** · Frente: **avatar** (só em parte: o carregamento do 3D)

**29. Boneco começa todo branco**
- Captura: `36-07-avatar-inicio.jpg`
- O que está ruim: camiseta, calça e tênis brancos, em fundo claro: parece "sem pintar", ao lado da Sofia e do Tales de uniforme.
- Sugestão: começar com o uniforme da dupla (camiseta branca com mangas azuis, calça azul).
- Esforço: **P** · Frente: **avatar** (parcial)

**30. Montar o boneco: metade da tela vazia e olhos longe demais**
- Captura: `37-08-avatar-olhos.jpg`
- O que está ruim: o painel das cores ocupa só o topo; abaixo, 60 % em branco. No passo "Olhos" o boneco continua de corpo
  inteiro: a troca de cor do olho quase não se vê.
- Sugestão: aproximar a câmera no rosto no passo dos olhos e do cabelo; cartões de cor maiores.
- Esforço: **M** · Frente: **avatar**

**31. "A letra A": metade da tela vazia no começo**
- Captura: `49-11-ala-02-al-a-c2.jpg`
- O que está ruim: a letra grande e pequena ficam à esquerda; a direita (onde vêm abelha, avião, abacaxi) fica branca por vários
  segundos.
- Sugestão: mostrar as figuras apagadas desde o início e acender uma a uma com a fala, ou centralizar as letras até elas entrarem.
- Esforço: **P** · Frente: —

**32. Figura de resposta aparece em branco na primeira vez**
- Captura: `02-11-ala-06-al-a-c4.jpg`
- Tela: "Qual começa com o som?" da Letra A, primeira vez no aparelho.
- O que está ruim: um dos três cartões ficou branco quase 2 s (a figura ainda baixando). Na segunda vez, com cache, apareceu certo.
- Por que importa: a criança escolhe entre duas e acha que a branca é "nenhuma".
- Sugestão: pré-carregar as figuras da sessão na tela "Vamos!"; só mostrar as opções quando todas estiverem prontas.
- Esforço: **P** · Frente: —

**33. Estrada e Rio: cores à venda invisíveis**
- Captura: `10-30-estrada-pares-a.jpg`
- O que está ruim: 4 das 6 cores aparecem como círculos brancos vazios com o preço; uma bolinha laranja fica solta fora da fileira;
  nenhuma fala explica o que é escolher carro/barco e cor.
- Sugestão: mostrar a cor com cadeado por cima; alinhar; fala de apresentação.
- Esforço: **P** · Frente: —

**34. Bichinho Come-Som: o som pedido é um quadradinho solto**
- Captura: `25-31-come-som-2.jpg`
- O que está ruim: o "pedido" do Bolota é um botão de som num quadrado amarelo flutuando entre o Bolota e a mesa, sem balão de fala.
- Sugestão: balão saindo da boca do Bolota com o alto-falante.
- Esforço: **P** · Frente: —

**35. Trilha A–Z: 25 bolinhas iguais e a última fileira desbotando**
- Captura: `44-15-trilha-az.jpg`
- O que está ruim: todas as letras trancadas são a mesma bolinha cinza com cadeado; X, W, V aparecem quase transparentes (parecem
  sumindo); só o A tem figura.
- Sugestão: cada letra com a sua cena miniatura (já existem) em tom apagado; sem a transparência da última fileira.
- Esforço: **P** · Frente: **desbloqueio progressivo** (parcial)

### D. Detalhes do adulto e técnicos

**36. Vozes ainda marcadas como ruins na auditoria**
- Captura: `47-43-admin-home.jpg`
- Tela: `#/admin` › Visão geral › "Clipes marcados na auditoria".
- O que está ruim: **49 clipes graves e 132 para conferir** continuam no ar (74 palavras, 53 frases, 24 sílabas, 20 sons ditos pela
  dupla, 9 nomes). Mais 4 falas e 3 sons de letra sem clipe.
- Por que importa: D025 §3 (vozes oficiais em todas as falas) e a revisão de áudio tela por tela. A criança aprende o som pelo que
  ouve.
- Sugestão: regravar primeiro os 49 graves (lista em `docs/auditoria-audio.md`) com a gravação do dono e da Agatha pela aba Áudios.
- Esforço: **G** · Frente: **gerenciador de conteúdo** (a ferramenta; a gravação é do dono)

**37. Zero cortado ("Ø") nos números**
- Captura: `46-39-painel-familia.jpg`, `47-43-admin-home.jpg`
- O que está ruim: a fonte dos números mostra o zero com risco: "Nível Ø de 1Ø", "2Ø26", "3Ø dias".
- Por que importa: para família e criança o "Ø" parece outra letra.
- Sugestão: desligar o recurso de zero cortado da fonte (`font-variant-numeric: normal` / `font-feature-settings: "zero" 0`).
- Esforço: **P** · Frente: —

**38. Área do Professor começa como "Primeira vez aqui", com a fala de boas-vindas da criança**
- Captura: `54-40-professor.jpg`
- Tela: `#/professor` num aparelho que já tem a conta da família.
- O que está ruim: abre a tela "Primeira vez aqui" com a Sofia dizendo "Que bom que você chegou! Primeiro, a conta do adulto."; o
  aviso de que falta a conta de professor fica num texto pequeno.
- Sugestão: título e texto próprios ("Criar a conta de professor(a) neste aparelho"), sem a fala pensada para a família.
- Esforço: **P** · Frente: —

**39. Erro 404 de `/audio/pacote.json` em toda página**
- Captura: — (console: `Failed to load resource: 404 … /audio/pacote.json`)
- O que está ruim: o app procura o pacote de áudios trocados e o servidor responde 404 em todas as telas; único erro do console.
- Sugestão: publicar um `pacote.json` vazio ou tratar o "não existe" sem pedir o arquivo (ex.: lista no manifesto).
- Esforço: **P** · Frente: **gerenciador de conteúdo**

**40. Passeio 3D: rótulos cortados no topo e "pedras" roxas espalhadas**
- Captura: `48-36-passeio-25s.jpg`
- O que está ruim: as placas "Biblioteca" e "…ria" ficam cortadas atrás da barra de cima; poliedros roxos e brancos soltos pela grama
  e pela calçada; o estilo (bonecos e prédios simples) fica bem abaixo da vila pintada do mapa.
- Esforço: **M** · Frente: **passeio 3D**

---

## Resumo para o dono (os 10 piores, em linguagem simples)

1. **As vozes se atropelam.** Quando a criança erra rápido, a correção da Sofia e os sons das letras tocam juntos; ela não consegue
   ouvir a diferença entre os dois sons, que é justamente o que a correção quer ensinar. (item 1)
2. **Nas fichas, a palavra troca na hora de ler** (aparece MACACO, lê LOBO) e fica verde antes de a criança responder. (itens 2 e 3)
3. **Na história do Bolota**, a Sofia pede "olhe a capa" sem a capa na tela, e a resposta certa é uma bola de futebol, mas a
   história fala de uma bola vermelha. (itens 4 e 5)
4. **No jogo da Estrada**, a resposta da demonstração continua marcada de verde quando chega a vez da criança. (item 6)
5. **Botões apagados sem explicação**: enquanto a Sofia fala, "Continuar", "Eu fiz o som!" e outros ficam desbotados por até 10
   segundos; parece que o app travou. (item 7)
6. **No celular, a terceira resposta fica escondida embaixo da tela**, e a Lojinha não mostra nenhuma roupa na primeira tela e
   escorrega para o lado. (itens 8 e 28)
7. **A criança faz a missão, o app diz "feita!" e manda fazer a mesma de novo**; a lição do som /a/ repete quase igual a da Letra A.
   (itens 9 e 10; o desbloqueio já está sendo corrigido)
8. **Texto de adulto na tela da criança**: "o avanço é por domínio", "Em casa (para o adulto)", "/a/", "/ê/". A criança não lê e
   isso não diz nada para ela. (item 11)
9. **O fim da missão desanima**: "+0 moedinhas", contador que não soma na hora e o "próximo objetivo" igual ao que acabou de fazer.
   (item 12)
10. **Partes com cara de rascunho**, fora do padrão de filme 3D: casas do Carteiro feitas de triângulos, Corre-Som com letras
    minúsculas e boneco branco, ícones chapados misturados com 3D, a placa "SHOP" em inglês na Lojinha e a Sofia e o Tales
    aparecendo duas vezes (nítidos na frente e borrados no fundo). (itens 13, 21, 22, 23)
