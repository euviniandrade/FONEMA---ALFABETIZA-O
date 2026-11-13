# Catálogo de conquistas: 2 anos de selos, medalhas, troféus e títulos

> Catálogo completo, organizado **pela linha do tempo da jornada**: o que é liberado no Maternal, em cada região (R0–R10, com as semanas da [jornada](../jornada/README.md)) e nos eventos recorrentes. As regras gerais (tipos, níveis, liberação gradual, salvaguardas, animações) estão no [README](README.md). Os mesmos dados estão em [`catalogo.json`](catalogo.json); o resumo numérico abaixo foi gerado por [`tools/conquistas/resumo.py`](../../../../tools/conquistas/resumo.py).
>
> **Base:** D002, D008, D009, D012, D014, D017, D018, D019, D021 e **D022** (nomes neutros pela ação: "Caça às Sílabas", "Leitura Gentil", "Maestria do Som M"). Tudo aqui é **[proposta de conquistas]**: quantidades, semanas e limiares são hipóteses a calibrar no piloto. O avanço é **por domínio, nunca por tempo**; a semana indica quando o item **costuma** ser liberado para uma criança no ritmo previsto.

## Como ler

- **Código:** `S` selo · `M` medalha · `T` troféu · `TI` título · `C` emblema de coleção · `V` selo do professor/família · `S-SOM-…` Maestria do Som (gerado). Depois vem a região (`MAT`, `R0`…`R10`, `EV`) e o número.
- **Nomes neutros (D022):** todo nome descreve **a ação ou a conquista** ("Pesca de Vogais", "Guarda do Meio Ambiente"), nunca a pessoa ("pescador", "guardião"). A frase da dupla também é neutra: "Você conquistou **Caça às Sílabas II**, [NOME]!"
- **Critério observável:** cada linha diz o que a criança **faz** e o sistema **registra** (evento de aprendizagem). Quando há números do tipo "10/20/40", eles são bronze/prata/ouro; o diamante segue a regra geral (ouro + retenção de 60 dias + validação do professor ou da família).
- **Visibilidade antes de ganhar:** só vale **depois** que a região ou o evento é liberado. Antes disso, o item não aparece em lugar nenhum (liberação gradual).

## 1. Números do catálogo

- Itens no JSON: **523** = 379 conquistas fixas + 56 selos gerados 'Maestria do Som' + 88 patentes (11 áreas × 8 degraus, D023)
- Degraus (níveis) entregáveis nos itens fixos: **953**
- Itens fixos da jornada R0–R10 + eventos (sem o Maternal): **367**
- Itens liberáveis pela Trilha Expressa: 146
- Visibilidade antes de ganhar (fixos): visível 128, mistério 229, oculto 22

|            tipo | qtd (fixos) |
|-----------------|-------------|
|            selo |         289 |
|         medalha |          23 |
|          trofeu |          13 |
|          titulo |           7 |
| emblema_colecao |          14 |
|  selo_validacao |          33 |
|           total |         379 |

## 2. Região × categoria (itens fixos)

| região | fon | síl | pal | lei | comp | val | esp | amb | conh | fin | emo | pc | fam/prof | const | col | seg | total |
|--------|-----|-----|-----|-----|------|-----|-----|-----|------|-----|-----|----|----------|-------|-----|-----|-------|
|    MAT |   5 |   · |   · |   · |    · |   1 |   · |   · |    1 |   · |   1 |  1 |        1 |     1 |   1 |   · |    12 |
|     R0 |   5 |   1 |   · |   3 |    · |   2 |   1 |   1 |    1 |   1 |   1 |  1 |        1 |     1 |   1 |   1 |    21 |
|     R1 |   6 |   · |   · |   2 |    · |   1 |   3 |   2 |    1 |   1 |   1 |  1 |        2 |     1 |   1 |   1 |    23 |
|    R2a |   2 |   2 |   4 |   3 |    1 |   1 |   1 |   1 |    1 |   1 |   1 |  2 |        2 |     1 |   · |   1 |    24 |
|    R2b |   2 |   1 |   2 |   2 |    2 |   1 |   1 |   1 |    1 |   1 |   1 |  1 |        2 |     1 |   2 |   1 |    22 |
|     R3 |   2 |   · |   2 |   5 |    · |   1 |   4 |   1 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    27 |
|     R4 |   3 |   · |   2 |   3 |    2 |   2 |   3 |   1 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    28 |
|     R5 |   5 |   · |   1 |   3 |    1 |   1 |   4 |   2 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   1 |    28 |
|     R6 |   3 |   · |   2 |   5 |    1 |   1 |   2 |   1 |    2 |   1 |   1 |  2 |        3 |     1 |   1 |   2 |    28 |
|     R7 |   1 |   1 |   2 |   3 |    1 |   2 |   2 |   1 |    3 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    26 |
|     R8 |   · |   2 |   1 |   5 |    1 |   1 |   3 |   1 |    3 |   1 |   1 |  2 |        2 |     · |   3 |   2 |    28 |
|     R9 |   1 |   · |   5 |   3 |    1 |   1 |   7 |   1 |    6 |   1 |   1 |  2 |        2 |     · |   1 |   2 |    34 |
|    R10 |   · |   · |   1 |   6 |    3 |   1 |   1 |   2 |    4 |   1 |   1 |  2 |        2 |     1 |   2 |   2 |    29 |
|     EV |   · |   · |   1 |  15 |    · |   5 |   6 |   2 |    3 |   2 |   2 |  1 |        8 |     1 |   · |   3 |    49 |
|  total |  35 |   7 |  23 |  58 |   13 |  21 |  38 |  17 |   32 |  14 |  15 | 23 |       33 |    12 |  16 |  22 |   379 |

Gerados (Maestria do Som) por região: R1 5, R2a 3, R2b 3, R3 4, R4 6, R5 8, R6 7, R7 4, R8 13, R9 3

## 3. Curva acumulada de liberação (semana da jornada)

Semana 0 = módulo Maternal. Eventos entram na semana mínima em que podem aparecer. Conta selos, medalhas, troféus, títulos, coleções, vistos e Maestria do Som (sem as patentes).

| semana até | novos itens | itens acumulados | novos degraus | degraus acumulados |
|------------|-------------|------------------|---------------|--------------------|
|          0 |          12 |               12 |            26 |                 26 |
|          4 |          35 |               47 |           111 |                137 |
|          8 |          40 |               87 |           108 |                245 |
|         12 |          35 |              122 |            93 |                338 |
|         16 |          22 |              144 |            54 |                392 |
|         20 |          23 |              167 |            55 |                447 |
|         24 |          12 |              179 |            32 |                479 |
|         28 |           9 |              188 |            27 |                506 |
|         32 |          21 |              209 |            68 |                574 |
|         36 |          12 |              221 |            26 |                600 |
|         40 |          15 |              236 |            54 |                654 |
|         44 |          11 |              247 |            34 |                688 |
|         48 |          11 |              258 |            20 |                708 |
|         52 |          16 |              274 |            51 |                759 |
|         56 |          10 |              284 |            25 |                784 |
|         60 |          12 |              296 |            26 |                810 |
|         64 |          15 |              311 |            47 |                857 |
|         68 |           9 |              320 |            22 |                879 |
|         72 |           5 |              325 |            14 |                893 |
|         76 |          23 |              348 |            78 |                971 |
|         80 |          12 |              360 |            27 |                998 |
|         84 |           8 |              368 |            22 |               1020 |
|         88 |          17 |              385 |            50 |               1070 |
|         92 |          15 |              400 |            31 |               1101 |
|         96 |           7 |              407 |            17 |               1118 |
|        100 |          11 |              418 |            27 |               1145 |
|        104 |          17 |              435 |            32 |               1177 |

### Escadas de patentes (D023): degraus de conquistas da área para chegar ao nível I

Cada célula: degraus somados na área para o nível I (semana em que a patente aparece).

|                área | Aprendiz | Ajudante | Sentinela |   Guarda |     Guia | Especialista |     Líder |      Lenda | degraus no catálogo |
|---------------------|----------|----------|-----------|----------|----------|--------------|-----------|------------|---------------------|
|             Leitura |   3 (s2) |   9 (s8) |  18 (s18) | 25 (s32) | 34 (s50) |     40 (s68) |  49 (s86) |  69 (s100) |                 151 |
|             Escrita |   3 (s2) |   6 (s8) |  11 (s18) | 14 (s32) | 18 (s50) |     24 (s68) |  30 (s86) |  44 (s100) |                  96 |
|                Sons |   3 (s2) |  38 (s8) |  48 (s18) | 72 (s32) | 94 (s50) |    115 (s68) | 145 (s86) | 167 (s100) |                 362 |
|            Natureza |   3 (s2) |   7 (s8) |  10 (s18) | 13 (s32) | 16 (s50) |     19 (s68) |  22 (s86) |  25 (s100) |                  44 |
| Esporte e Fair Play |   3 (s2) |   7 (s8) |  12 (s18) | 16 (s32) | 20 (s50) |     25 (s68) |  29 (s86) |  40 (s100) |                  87 |
|  Amizade e Respeito |   3 (s2) |   8 (s8) |  17 (s18) | 22 (s32) | 26 (s50) |     32 (s68) |  35 (s86) |  42 (s100) |                  91 |
|            Dinheiro |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  34 |
|            Ciências |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  27 |
|          Tecnologia |   3 (s2) |   6 (s8) |   9 (s18) | 14 (s32) | 17 (s50) |     22 (s68) |  25 (s86) |  31 (s100) |                  68 |
|           Cidadania |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  27 |
|               Artes |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  31 |

### Checagens do script

- OK: nenhum problema encontrado.


---

## 4. Catálogo por fase do tempo

Legenda: **Sem.** = semana da jornada em que o item é **liberado** (aparece no Álbum). **Níveis**: B·P·O·D = bronze, prata, ouro, diamante. **⚡** = pode ser liberado pela Trilha Expressa (D021). **Antes de ganhar**: *visível* (apagado, com cadeado e a dica), *mistério* (só silhueta e dica), *oculto* (segredo: só aparece quando ganho). A arte de cada linha segue o padrão do tipo (§5 do [README](README.md)) com as cores da região indicadas no título.


### MAT · Maternal · Primeiros Sons (2–3 anos, D021) — módulo à parte, antes de R0

Cores da região: madeira clara, verde-folha, amarelo-ipê. **12 conquistas** (10 selo, 1 selo do professor/família, 1 troféu).

Entregues **sempre junto com o adulto** (ele toca e celebra com a criança). Sessões de 5–10 min, muito áudio, muitas propostas fora da tela. Não há leitura cobrada. Ao concluir, o Troféuzinho abre o Quintal (R0) sem prova.

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-MAT-01` | **Orelhinha Atenta** | selo | fonema | 0 | Com o adulto, ouvir 3 sons da casa (porta, água, panela) e apontar a figura de cada um. | B·P·O | giro 3D | orelha estilizada e três ondinhas de som | mistério |
| `S-MAT-02` | **Bicho que Fala** | selo | fonema | 0 | Imitar o som de 5 bichos (au-au, miau, muu...) junto com o adulto e a Sofia. | B·P·O | giro 3D | cachorro e gato da vila com ondinhas de som | mistério |
| `S-MAT-03` | **Cantiga Junto** | selo | fonema | 0 | Cantar uma cantiga de roda com o adulto, batendo palmas no ritmo (fora da tela vale, adulto confirma). | B·P·O | giro 3D | duas mãos batendo palma e notas musicais | mistério |
| `S-MAT-04` | **Rima Boba** | selo | fonema | 0 | Ouvir 3 rimas engraçadas do Bolota e completar a última palavra falando ou apontando. | B·P·O | giro 3D | tatu-bola Bolota sorrindo com balão de fala | mistério |
| `S-MAT-05` | **Meu Nominho** | selo | fonema | 0 | Reconhecer o próprio nome falado pela Sofia entre 3 nomes e responder 'sou eu!'. | único | giro 3D | estrelinha com a inicial do nome da criança | visível |
| `S-MAT-06` | **Palavra Nova** | selo | conhecimento de base (D017) | 0 | Apontar 10 figuras novas do dia a dia quando o adulto ou a Sofia diz o nome. | B·P·O | giro 3D | livro de figuras aberto com bola, copo e sapato | mistério |
| `S-MAT-07` | **Encaixa Certinho** | selo | pensamento computacional | 0 | Encaixar 4 formas no lugar certo (toque ou brinquedo real, adulto confirma). | B·P·O | giro 3D | blocos de madeira redondo, quadrado e triângulo | mistério |
| `S-MAT-08` | **Carinha que Sente** | selo | emocional | 0 | Mostrar a carinha alegre e a triste quando o adulto pede, imitando o Bolota. | único | giro 3D | duas carinhas de madeira, alegre e triste | mistério |
| `S-MAT-09` | **Minha Vez, Sua Vez** | selo | valores e atitudes | 0 | Brincar de passar a bola com o adulto esperando a vez, 5 passes. | único | giro 3D | bola de pano azul passando entre duas mãozinhas | mistério |
| `S-MAT-10` | **Hora de Guardar** | selo | constância saudável | 0 | Terminar a sessão curta na despedida da Sofia e 'guardar a tela' com o adulto, 3 vezes. | único | giro 3D | bauzinho de brinquedos de madeira fechando | mistério |
| `T-MAT-01` | **Trofeuzinho dos Primeiros Sons** | troféu | colecionador | 0 | Concluir as 10 brincadeiras do módulo com o adulto; abre o portão do Quintal (R0) sem prova. | único | troféu no pedestal | troféu pequeno de madeira com uma nota musical | visível |
| `V-MAT-01` | **Brincamos Juntos** | selo do professor/família | família/professor | 0 | O adulto confirma com 1 toque que fez a brincadeira fora da tela da semana (cantiga, caça ao som, livro de figuras). | B·P·O | carimbo + voz | carimbo terracota com duas mãos dadas | visível |

### R0 · Quintal da Sofia — semanas 1–3

Cores da região: madeira, verde-folha, amarelo-ipê. **21 conquistas** (16 selo, 2 título, 1 medalha, 1 selo do professor/família, 1 emblema de coleção).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R0-01` | **Meu Nome** | selo | fonema | 1 | Bronze: fazer o som inicial real do próprio nome e tocar a letra real (D019 §3). Prata: achar esse som em 5 palavras ouvidas. Ouro: reconhecer a letra do nome em 3 lugares da vila após 7 dias. | B·P·O·D | giro 3D | estrela dourada, livro aberto e a letra inicial da criança saltando | visível ⚡ |
| `S-R0-02` | **Caça às Rimas** | selo | fonema | 1 | Achar 5 pares que rimam entre figuras faladas (2–3 opções). | B·P·O·D | giro 3D | dois balões de fala encaixados como peças | visível ⚡ |
| `S-R0-08` | **Rosto que Fala** | selo | emocional | 1 | Nomear 4 emoções (alegre, triste, bravo, medo) no rosto do Bolota. | B·P·O | giro 3D | rosto do Bolota com quatro expressões em mosaico | mistério |
| `S-R0-11` | **Cuidado com os Animais** | selo | valores e atitudes | 1 | Bronze (R0): dar água e comida ao cachorro e ao gato da vila seguindo ícones. Prata (R4): ajudar no resgate do Pantanal lendo instruções. Ouro: missão de cuidado em casa confirmada pelo adulto. | B·P·O·D | giro 3D | pata de cachorro e tigela de água | mistério |
| `S-R0-15` | **Hora de Descansar** | selo | constância saudável | 1 | Encerrar a sessão no ritual de fim, sem pedir mais, 3/10/25 vezes ('a tela descansa e eu também'). | B·P·O | giro 3D | lua em quarto crescente sobre telhado | mistério |
| `TI-R0-01` | **Primeiros Sons** | título | leitura | 1 | Terminar a primeira missão (som do próprio nome). Sub-níveis I-II-III pelos níveis 1–6 da jornada (D019). | I·II·III | placa de título | placa com orelha e boca estilizadas; item: boné da vila | visível |
| `S-R0-03` | **Bate-Sílaba** | selo | sílaba | 2 | Bater palmas nas sílabas de 8 palavras faladas, em 2 sessões. | B·P·O·D | giro 3D | duas mãos e três pontinhos de ritmo | visível ⚡ |
| `S-R0-04` | **Primeiro Som** | selo | fonema | 2 | Dizer ou tocar o som inicial de 6 figuras (som, não nome da letra). | B·P·O·D | giro 3D | boca da Sofia em perfil com onda sonora | visível ⚡ |
| `S-R0-05` | **Junta-Junta** | selo | fonema | 2 | Síntese oral: ouvir sons separados e tocar a figura certa, 6 vezes. | B·P·O·D | giro 3D | peças de quebra-cabeça de madeira se juntando | mistério ⚡ |
| `S-R0-09` | **Rotina em Ordem** | selo | pensamento computacional | 2 | Ordenar 3 passos da rotina (acordar, escovar, comer) e explicar com a Sofia. | B·P·O | giro 3D | três cartões em fila com seta | mistério |
| `S-R0-10` | **Cofrinho Novo** | selo | financeiro | 2 | Guardar as primeiras moedinhas no cofrinho-tatu e escolher uma meta. | único | giro 3D | cofrinho-tatu com moedinha F | mistério |
| `S-R0-12` | **Ensinar o Bolota** | selo | valores e atitudes | 2 | Ensinar o Bolota quando ele erra, com gentileza, 5 vezes (mecânica ENSINAR). | B·P·O | giro 3D | Bolota com chapeuzinho de aluno e quadro | mistério |
| `S-R0-13` | **Amarelinha das Sílabas** | selo | esporte e fair play | 2 | Pular a amarelinha batendo as sílabas (opção sentada com toque). | B·P·O | giro 3D | amarelinha de giz em tons de areia e azul | mistério |
| `S-R0-14` | **Quintal Limpo** | selo | meio ambiente | 2 | Missão 'lixo no lugar': guardar 6 objetos no lugar certo; ouro com a separação seco/molhado em casa (adulto confirma). | B·P·O | giro 3D | cesto de madeira e folhas verdes | mistério |
| `S-R0-16` | **Rima do Bolota** | selo | segredo | 2 | Quando o Bolota pede uma rima na vila, inventar uma rima falada (sinal de ASR ou toque). | único | revela segredo | Bolota rindo com nota de rima | oculto |
| `V-R0-01` | **Mostrei em Casa** | selo do professor/família | família/professor | 2 | Mostrar a rima do dia para alguém da família; o adulto toca ✓. | B·P·O | carimbo + voz | carimbo terracota com casinha | visível |
| `C-R0-01` | **Coleção Quintal da Sofia** | emblema de coleção | colecionador | 3 | Completar as figurinhas do quintal (compradas ou ganhas por domínio). | B·P·O | encaixe na coleção | moldura com 6 encaixes: cachorro, gato, árvore, varal, bola, casa | visível |
| `M-R0-01` | **Medalha da Festa das Rimas** | medalha | fonema | 3 | Vencer o chefe de R0 (Festa das Rimas, oral). Não passou: trilha curta de reforço, nada se perde. | único | medalha com fita | bandeirola lisa e dois balões de rima no metal | visível ⚡ |
| `S-R0-06` | **Leitura do Quintal** | selo | leitura | 3 | Bronze: vencer a Festa das Rimas. Prata: completar o Álbum da Minha Família. Ouro: rever as rimas no Jardim da Revisão após 7 dias. | B·P·O·D | giro 3D | casinha do quintal com livro na janela | visível ⚡ |
| `S-R0-07` | **Álbum da Minha Família** | selo | conhecimento de base (D017) | 3 | Montar o álbum com nomes e rimas de quem mora com a criança (fala gravada só no aparelho). | B·P·O | giro 3D | álbum de capa de madeira com coração liso | mistério |
| `TI-R0-02` | **Caça às Sílabas** | título | leitura | 3 | Portão: vencer a Festa das Rimas (R0-F06). I-II-III pelos níveis 7–15. | I·II·III | placa de título | placa com lupa de exploração | visível |

### R1 · Ilha das Vogais — semanas 3–6

Cores da região: azul-claro, branco, areia. **23 conquistas** (19 selo, 2 selo do professor/família, 1 medalha, 1 emblema de coleção) + **5 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R1-02` | **Espelho da Ilha** | selo | fonema | 3 | Imitar a boca da Sofia em 5 vogais no Espelho do Som (fala ou toque). | B·P·O·D | giro 3D | espelho de moldura de madeira com boca aberta | visível ⚡ |
| `S-R1-01` | **Cinco Sinais** | selo | fonema | 4 | Reconhecer as 5 vogais pelo som (ouvir → tocar a letra) em 2 sessões. | B·P·O·D | giro 3D | cinco boias com as vogais | visível ⚡ |
| `S-R1-05` | **Mão na Areia** | selo | fonema | 4 | Traçar as 5 vogais com o dedo na ordem do traço. | B·P·O | giro 3D | dedo traçando A na areia molhada | mistério ⚡ |
| `S-R1-08` | **Classifica-Som** | selo | pensamento computacional | 4 | Classificar 8 figuras pelo som inicial em cestos. | B·P·O | giro 3D | dois cestos de vime com figuras | mistério |
| `S-R1-09` | **Meta no Cofrinho** | selo | financeiro | 4 | Escolher um item da lista de desejos e acompanhar a barra do cofrinho até a metade. | único | giro 3D | cofrinho-tatu com barra de meta | mistério |
| `S-R1-10` | **Errei, e Agora?** | selo | emocional | 4 | Depois de errar, tentar de novo com a dica da Sofia: 5/15/40 vezes (processo, não acerto). | B·P·O | giro 3D | pegada na areia que recomeça | mistério |
| `S-R1-18` | **Cultivo da Revisão** | selo | constância saudável | 4 | Abrir flores no Jardim da Revisão lendo antes de ouvir: 25/60/120/250 flores (revisão espacada, nunca dias seguidos). | B·P·O·D | giro 3D | regador de madeira e três flores | mistério |
| `S-R1-03` | **E aberto, E fechado** | selo | fonema | 5 | Distinguir é e ê em 8 palavras ouvidas. | B·P·O·D | giro 3D | duas conchas, uma aberta e uma fechada | visível ⚡ |
| `S-R1-04` | **O de Bolinha** | selo | fonema | 5 | Distinguir ó e ô em 8 palavras ouvidas. | B·P·O·D | giro 3D | bolinha aberta e bolinha redondinha | visível ⚡ |
| `S-R1-06` | **Pesca de Vogais** | selo | fonema | 5 | Achar a vogal inicial em 10 palavras ouvidas no cais. | B·P·O | giro 3D | vara de pesca com letra A no anzol de madeira | mistério ⚡ |
| `S-R1-11` | **Guarda do Meio Ambiente** | selo | meio ambiente | 5 | Bronze: 3 missões ambientais de região. Prata: 6. Ouro: 9 missões + 3 ações em casa confirmadas pelo adulto. | B·P·O·D | giro 3D | folha e gota sobre globo (arte já existente em recompensas-3d) | mistério |
| `S-R1-12` | **Praia Limpa** | selo | meio ambiente | 5 | Tirar 8 plásticos da areia para a tartaruga voltar; ouro: levar sacola ao passeio (adulto confirma). | B·P·O | giro 3D | tartaruga marinha sorrindo | mistério |
| `S-R1-13` | **Cesta das Vogais** | selo | esporte e fair play | 5 | Arremessar na cesta da vogal ouvida, 10 arremessos (sem tempo). | B·P·O | giro 3D | cesta de basquete com bola azul-marinho | mistério |
| `S-R1-15` | **Água com Cuidado** | selo | esporte e fair play | 5 | Ouvir 3 regras de segurança na água e escolher a certa em 3 cenas (natação segura). | único | giro 3D | boia de salvamento branca e azul | mistério |
| `S-R1-16` | **Amizade com o Peixe-Boi** | selo | conhecimento de base (D017) | 5 | Assiste e Faz sobre o peixe-boi + 3 perguntas. | único | giro 3D | peixe-boi nadando | mistério |
| `S-R1-17` | **Espera a Vez** | selo | valores e atitudes | 5 | Esperar a vez e passar a bola ao colega em 3 situações ouvidas. | B·P·O | giro 3D | duas crianças e uma bola em arco | mistério |
| `V-R1-02` | **Vogal no Mercado** | selo do professor/família | família/professor | 5 | Roteiro de família: caçar vogais no mercado, 5 min; adulto confirma. | único | carimbo + voz | carimbo terracota com cestinha | visível |
| `C-R1-01` | **Coleção Ilha das Vogais** | emblema de coleção | colecionador | 6 | Completar as figurinhas da ilha (peixe-boi, jangada, farol...). | B·P·O | encaixe na coleção | moldura com 6 encaixes de figurinhas do mar | visível |
| `M-R1-01` | **Medalha do Farol Aceso** | medalha | leitura | 6 | Vencer o chefe de R1 (O Farol Apagado), lendo vogais. | único | medalha com fita | farol branco e azul com feixe de luz | visível ⚡ |
| `S-R1-07` | **Leitura da Ilha** | selo | leitura | 6 | Bronze: vencer o Farol Apagado. Prata: ler as 5 vogais em 3 placas da ilha. Ouro: rever as vogais após 14 dias. | B·P·O·D | giro 3D | ilha com farol e livro aberto na areia | visível ⚡ |
| `S-R1-14` | **Vôlei da Ilha** | selo | esporte e fair play | 6 | Manter a bola no ar com o Tales lendo 10 vogais (cooperativo). | B·P·O | giro 3D | bola de vôlei azul e branca sobre rede | mistério |
| `S-R1-19` | **Concha que Canta** | selo | segredo | 6 | Achar a concha escondida na praia que só abre quando a criança diz a vogal certa. | único | revela segredo | concha branca com nota musical | oculto |
| `V-R1-01` | **Visto do Professor: Vogais** | selo do professor/família | família/professor | 6 | Mostra pro professor: ler as 5 vogais; professor toca ✓ (sem resposta em 72 h, vale o critério de domínio). | único | carimbo + voz | carimbo azul-marinho com vogais | visível |

### R2a · Mata Atlântica · Vale do M-L-F — semanas 6–10

Cores da região: verde-mata, madeira, amarelo-ipê. **24 conquistas** (19 selo, 2 medalha, 2 selo do professor/família, 1 título) + **3 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R2a-01` | **Som Comprido** | selo | fonema | 6 | Prolongar /mmm/, /lll/ e /fff/ junto com a Sofia e tocar a letra. | B·P·O·D | giro 3D | onda longa saindo de uma boca | visível ⚡ |
| `S-R2a-02` | **Ouvido Atento** | selo | fonema | 6 | Achar /m/, /l/ ou /f/ no começo de 10 palavras ouvidas. | B·P·O | giro 3D | orelha e folhas da mata | visível ⚡ |
| `S-R2a-03` | **Junta-Som** | selo | sílaba | 7 | Juntar consoante e vogal em 10 sílabas (MA, LO, FU...) com o alfabeto móvel. | B·P·O·D | giro 3D | duas peças de madeira M + A encaixando | visível ⚡ |
| `S-R2a-04` | **Tábua de Sílabas** | selo | sílaba | 7 | Montar 8 sílabas na tabua de sílabas. | B·P·O | giro 3D | tabua de madeira com sílabas | visível ⚡ |
| `S-R2a-11` | **Pequeno, Médio, Grande** | selo | pensamento computacional | 7 | Seriar 5 objetos do menor ao maior. | B·P·O | giro 3D | três troncos em escada | mistério |
| `S-R2a-12` | **Respira com a Sofia** | selo | emocional | 7 | Usar o 'respira com a Sofia' quando a mata escurece e nomear o medo. | único | giro 3D | vaga-lume calmo sobre folha | mistério |
| `S-R2a-18` | **Dormiu e Lembrou** | selo | constância saudável | 7 | Passar na checagem de retenção (24 h a 7 dias) de 1/5/10/20 sons. | B·P·O·D | giro 3D | travesseiro com estrela e livro | mistério ⚡ |
| `M-R2a-01` | **Medalha da Primeira Palavra** | medalha | palavra | 8 | Ler sozinho a primeira palavra decodificada (MALA, MEL, LUA ou FALA) e ver a coisa acontecer. | único | medalha com fita | mala de viagem aberta com a palavra MALA | visível ⚡ |
| `S-R2a-10` | **Comandos do Mico** | selo | pensamento computacional | 8 | Sequência de 3 cartas de comando lidas para o mico chegar à fruta. | B·P·O | giro 3D | mico e três setas de madeira | mistério |
| `S-R2a-13` | **Muda na Mata** | selo | meio ambiente | 8 | Plantar 5 mudas onde a mata foi cortada; ouro: semente no copo em casa (adulto confirma). | B·P·O | giro 3D | muda brotando em copo reaproveitado | mistério |
| `S-R2a-15` | **Revezamento da Trilha** | selo | esporte e fair play | 8 | Corrida de revezamento cooperativa lendo as placas da trilha (opção sentada). | B·P·O | giro 3D | bastão de madeira e tênis | mistério |
| `S-R2a-05` | **Palavras da Mata** | selo | palavra | 9 | Ler 10/20/40 palavras CV da mata, em 2 dias diferentes. | B·P·O·D | giro 3D | folha grande com MEL escrito | visível ⚡ |
| `S-R2a-06` | **Palavra que Faz** | selo | palavra | 9 | Ler a palavra e ver a coisa acontecer no mundo (LUA acende, MALA abre) 3 vezes. | B·P·O | giro 3D | lua acendendo sobre a mata | mistério ⚡ |
| `S-R2a-07` | **Ditado da Mata** | selo | palavra | 9 | Escrever 5 palavras ditadas com letras móveis ('assim você escreveu / assim os adultos escrevem'). | B·P·O | giro 3D | letras móveis de madeira | mistério ⚡ |
| `S-R2a-14` | **Guarda ou Gasta?** | selo | financeiro | 9 | Pensar com a Sofia: 1 figurinha agora ou 2 amanhã, e dizer por que (vale qualquer escolha explicada). | único | giro 3D | duas pilhas de figurinhas, uma maior | mistério |
| `S-R2a-16` | **Exploração do Ambiente** | selo | conhecimento de base (D017) | 9 | Assiste e Faz: quem mora na mata e do que precisa + 3 perguntas. | B·P·O | giro 3D | chapéu de guarda-parque e binóculo | mistério |
| `S-R2a-17` | **Amizade que Inclui** | selo | valores e atitudes | 9 | Chamar o colega sozinho para a brincadeira em 3 situações; ouro: missão real com a família ou turma. | B·P·O·D | giro 3D | mãos dadas em roda (arte já existente) | mistério |
| `S-R2a-19` | **Beija-Flor da Trilha** | selo | segredo | 9 | Achar as 3 placas escondidas na trilha e ler cada uma. | único | revela segredo | beija-flor verde sobre flor amarela | oculto |
| `V-R2a-01` | **Visto do Professor: Primeira Palavra** | selo do professor/família | família/professor | 9 | Mostra pro professor: ler MALA e LUA; professor toca ✓. | único | carimbo + voz | carimbo azul-marinho com mala | visível |
| `M-R2a-02` | **Medalha da Cachoeira das Sílabas** | medalha | leitura | 10 | Vencer o chefe de R2a (Cachoeira das Sílabas). | único | medalha com fita | cachoeira com sílabas nas pedras | visível ⚡ |
| `S-R2a-08` | **Leitura da Mata** | selo | leitura | 10 | Bronze: vencer a Cachoeira (R2a). Prata: vencer o Ninho do Tucano (R2b). Ouro: recontar 2 histórias da mata para a família. | B·P·O·D | giro 3D | mico-leão-dourado lendo sob a árvore | visível ⚡ |
| `S-R2a-09` | **Guia da Mata** | selo | compreensão | 10 | Completar o 'Guia da mata para o Bolota': 6 figurinhas, 1 palavra lida cada. | B·P·O | giro 3D | caderninho de campo com folha prensada | mistério |
| `TI-R2a-01` | **Exploração das Palavras** | título | leitura | 10 | Portão: vencer a Cachoeira das Sílabas (R2a-F05). I-II-III pelos níveis 16–24. | I·II·III | placa de título | placa com mochila de explorador | visível |
| `V-R2a-02` | **Leu pra Mim** | selo do professor/família | família/professor | 10 | Ler 3 palavras para alguém da família; adulto confirma. | único | carimbo + voz | carimbo terracota com livrinho | visível |

### R2b · Mata Atlântica · Trilha do V-S-N — semanas 10–16

Cores da região: verde-mata, madeira, azul-claro. **22 conquistas** (17 selo, 2 selo do professor/família, 2 emblema de coleção, 1 medalha) + **3 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R2b-01` | **Duas Sílabas** | selo | sílaba | 11 | Ler 10/20/40 palavras CV.CV (VELA, SINO, NAVE...). | B·P·O·D | giro 3D | vela de barco branca e azul com sílabas | visível ⚡ |
| `S-R2b-02` | **Trava-Língua do Vento** | selo | fonema | 11 | Repetir 3 trava-línguas curtos com /v/ e /f/. | B·P·O | giro 3D | folhas voando em espiral | mistério ⚡ |
| `S-R2b-11` | **Nascente Viva** | selo | meio ambiente | 11 | Missão da nascente + fechar a torneira ao escovar (adulto confirma). | B·P·O | giro 3D | gota de água sobre pedras e folhas | mistério |
| `S-R2b-15` | **De Onde Vem a Água?** | selo | conhecimento de base (D017) | 11 | Assiste e Faz sobre a nascente + 3 perguntas. | único | giro 3D | nascente entre pedras | mistério |
| `S-R2b-04` | **Nomes de Criaturas** | selo | palavra | 12 | Ler 5/10/20 pseudopalavras ('nomes de criaturas da mata'). | B·P·O·D | giro 3D | criaturinha de folhas sorrindo, sem traço mágico | mistério ⚡ |
| `S-R2b-05` | **Primeira Historinha** | selo | leitura | 12 | Ler uma historinha decodificável de 3 frases: com apoio (bronze), sozinho (prata), recontar (ouro). | B·P·O·D | giro 3D | livrinho aberto com tucano na capa | visível ⚡ |
| `S-R2b-09` | **Achei o Caminho** | selo | pensamento computacional | 12 | Programar o caminho com 4 cartas de comando com palavras V/S/N e achar 1 erro. | B·P·O | giro 3D | trilha com quatro setas | mistério |
| `S-R2b-13` | **Amarelinha das Palavras** | selo | esporte e fair play | 12 | Amarelinha lendo palavras CV.CV (opção sentada). | B·P·O | giro 3D | amarelinha com palavras | mistério |
| `S-R2b-16` | **Volta Boa** | selo | constância saudável | 12 | Voltar depois de uma pausa de 7 dias ou mais e abrir o Jardim da Revisão. Acolhida, nunca cobrança. | único | giro 3D | porta da casa aberta com tapete de boas-vindas | mistério |
| `V-R2b-02` | **Caça ao Som no Mercado** | selo do professor/família | família/professor | 12 | Roteiro de família de 5 min; adulto confirma. | único | carimbo + voz | carimbo terracota com sacola | visível |
| `S-R2b-03` | **Vibra ou Não Vibra?** | selo | fonema | 13 | Contraste F × V com a mão na garganta: 10/20/40 itens (só depois de os dois firmarem). | B·P·O·D | giro 3D | mão na garganta com ondinhas | visível ⚡ |
| `S-R2b-07` | **Bilhete Lido, Ajuda Dada** | selo | compreensão | 13 | Ler o bilhete triste de um morador e escolher como ajudar. | B·P·O | giro 3D | envelope com coração liso | mistério |
| `S-R2b-14` | **Leitura Gentil** | selo | valores e atitudes | 13 | Ler para o Bolota com paciência, ajudando sem rir quando ele erra: 5/15/30 vezes. | B·P·O·D | giro 3D | livro aberto com coração (arte já existente) | mistério |
| `S-R2b-06` | **Primeiros Ditados** | selo | palavra | 14 | Escrever 5 palavras CV.CV ditadas. | B·P·O | giro 3D | lápis de madeira e folha | mistério ⚡ |
| `S-R2b-10` | **Sei o que Sinto** | selo | emocional | 14 | Nomear alegre, triste, bravo e medo em 4 cenas (MEDO lido). | B·P·O | giro 3D | quatro carinhas de madeira | mistério |
| `S-R2b-12` | **Poupança e Planejamento** | selo | financeiro | 14 | Bronze: concluir 1 meta do cofrinho. Prata: 3 metas. Ouro: uma meta grande planejada na lista de desejos. | B·P·O·D | giro 3D | cofrinho-tatu com bandeirinha de meta | mistério |
| `S-R2b-17` | **Sino da Trilha** | selo | segredo | 14 | Achar a placa escondida, ler SINO e tocar o sino. | único | revela segredo | sino de bronze pendurado no galho | oculto |
| `V-R2b-01` | **Visto do Professor: F ou V** | selo do professor/família | família/professor | 14 | Mostra pro professor: ler FACA e VACA explicando a diferença; ✓. | único | carimbo + voz | carimbo azul-marinho com F e V | visível |
| `C-R2b-01` | **Coleção Mata Atlântica** | emblema de coleção | colecionador | 15 | Completar a coleção da mata (mico, tucano, beija-flor...). | B·P·O | encaixe na coleção | moldura com 6 encaixes de bichos da mata | visível |
| `C-R2b-02` | **Coleções da Vila** | emblema de coleção | colecionador | 15 | Bronze: 1 coleção completa. Prata: 3. Ouro: 5. Diamante: 8 + mostrar o álbum à família. | B·P·O·D | encaixe na coleção | álbum de capa verde com cantoneiras de madeira | visível |
| `S-R2b-08` | **Correio da Mata** | selo | compreensão | 15 | Entregar 4 cartas lendo o nome de quem recebe. | B·P·O | giro 3D | bolsa de carteiro e cartas | mistério |
| `M-R2b-01` | **Medalha do Ninho do Tucano** | medalha | leitura | 16 | Vencer o chefe de R2b (Ninho do Tucano). | único | medalha com fita | tucano no ninho | visível ⚡ |

### R3 · Pampa — semanas 16–26

Cores da região: verde-claro, azul-céu, branco. **27 conquistas** (20 selo, 2 medalha, 2 selo do professor/família, 1 troféu, 1 título, 1 emblema de coleção) + **4 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R3-08` | **Dia e Noite** | selo | conhecimento de base (D017) | 17 | Assiste e Faz: o que muda do dia para a noite + 3 perguntas. | único | giro 3D | metade sol, metade lua sobre o campo | mistério |
| `S-R3-15` | **Fair Play** | selo | esporte e fair play | 17 | Escolher o gesto de fair play em 3/8/15 situações lidas; ouro: cumprimento real numa partida (adulto confirma). | B·P·O·D | giro 3D | duas chuteiras e aperto de mão (arte já existente) | mistério |
| `M-R3-02` | **Medalha do Campinho** | medalha | esporte e fair play | 18 | Completar 5 partidas cooperativas de futebol-leitura lendo o placar. | único | medalha com fita | bola de futebol marinho e branca | visível |
| `S-R3-01` | **Palavras do Pampa** | selo | palavra | 18 | Ler 15/30/60 palavras com P e T (PATO, BOTA, TATU...). | B·P·O·D | giro 3D | pato e bota sobre campo verde | visível ⚡ |
| `S-R3-09` | **Achei o Bug** | selo | pensamento computacional | 19 | Achar o erro numa sequência de dia e noite (o bug é para consertar, não punir). | B·P·O | giro 3D | joaninha simpática sobre fileira de cartões | mistério |
| `S-R3-14` | **Campo Nativo** | selo | meio ambiente | 19 | Missão do campo e do vento + desligar a luz ao sair do quarto (adulto confirma). | B·P·O | giro 3D | cata-vento e lâmpada apagada | mistério |
| `S-R3-19` | **Casinha do João-de-Barro** | selo | segredo | 19 | Ler as 4 placas de material e ajudar o joão-de-barro a montar a casinha escondida no moinho. | único | revela segredo | joão-de-barro e casinha de barro | oculto |
| `S-R3-02` | **Frase Inteira** | selo | leitura | 20 | Ler a primeira frase de 4 palavras e fazer a ação pedida. | B·P·O·D | giro 3D | faixa de papel com frase e seta | visível ⚡ |
| `S-R3-10` | **Causa e Efeito** | selo | pensamento computacional | 20 | Prever 5 vezes o que acontece (vento → cata-vento gira). | B·P·O | giro 3D | cata-vento girando | mistério |
| `S-R3-16` | **Pipa sem Cerol** | selo | esporte e fair play | 20 | Ler 3 regras de segurança da pipa e escolher o lugar certo para soltar. | único | giro 3D | pipa lisa azul e branca com linha simples | mistério |
| `S-R3-07` | **Diário do Tempo** | selo | conhecimento de base (D017) | 21 | Registrar 5 dias de sol, chuva e vento com rótulo lido. | B·P·O | giro 3D | caderno com sol, nuvem e vento desenhados | mistério |
| `S-R3-11` | **Caiu, Tento de Novo** | selo | emocional | 21 | Reconstruir depois que a construção cai, usando 'respira e tenta', 3/8/15 vezes. | B·P·O | giro 3D | torre de blocos sendo reerguida | mistério |
| `V-R3-02` | **Diário em Casa** | selo do professor/família | família/professor | 21 | Anotar o tempo 3 dias com a família; adulto confirma. | único | carimbo + voz | carimbo terracota com sol | visível |
| `S-R3-03` | **Vento Troca-Troca** | selo | fonema | 22 | Contraste P × B: 12/25/50 itens. | B·P·O·D | giro 3D | cata-vento com P e B nas pás | visível ⚡ |
| `S-R3-12` | **Pede Desculpas** | selo | valores e atitudes | 22 | Escolher o pedido de desculpas certo em 3 situações; ouro: missão em família confirmada. | B·P·O·D | giro 3D | duas mãos em aperto | mistério |
| `S-R3-17` | **Salto do Pampa** | selo | esporte e fair play | 22 | Salto em distância: cada palavra lida é um salto; 10 saltos. | B·P·O | giro 3D | caixa de areia com marca de salto | mistério |
| `S-R3-04` | **Língua que Bate** | selo | fonema | 23 | Contraste T × D: 12/25/50 itens. | B·P·O·D | giro 3D | dois tambores pequenos com T e D | visível ⚡ |
| `S-R3-13` | **Troca Justa** | selo | financeiro | 23 | Fazer 3 trocas justas lendo o nome dos itens (escambo com os moradores). | B·P·O | giro 3D | duas cestas trocando de mão | mistério |
| `V-R3-01` | **Visto do Professor: P e B** | selo do professor/família | família/professor | 23 | Mostra pro professor: ler PATO e BOTA explicando o que vibra; ✓. | único | carimbo + voz | carimbo azul-marinho com pato | visível |
| `S-R3-20` | **Moinho Falante** | selo | segredo | 24 | Tocar o moinho e ler as 3 palavras que ele mostra. | único | revela segredo | moinho de madeira com pás brancas | oculto |
| `T-R3-01` | **Troféu da Biblioteca** | troféu | leitura | 24 | Entregar à biblioteca os selos Maestria do Som P, T, B e D (bronze): a biblioteca da vila abre. | único | troféu no pedestal | troféu em forma de estante com livros | visível ⚡ |
| `C-R3-01` | **Coleção Pampa** | emblema de coleção | colecionador | 25 | Completar a coleção do Pampa (joão-de-barro, tatu, cata-vento...). | B·P·O | encaixe na coleção | moldura com 6 encaixes do campo | visível |
| `S-R3-05` | **Espelho do B e do D** | selo | palavra | 25 | Distinguir b e d escritos em 10 palavras (nunca na mesma semana em que foram ensinados). | B·P·O·D | giro 3D | espelho com b e d virados | mistério ⚡ |
| `S-R3-18` | **Lembrei de Longe** | selo | constância saudável | 25 | Lembrar na revisão de 32 dias ou mais: 1/5/10/20 sons de regiões anteriores. | B·P·O·D | giro 3D | luneta de madeira apontando para tras | mistério ⚡ |
| `M-R3-01` | **Medalha da Ventania** | medalha | leitura | 26 | Vencer o chefe de R3 (Ventania que Embaralha), lendo pares mínimos. | único | medalha com fita | redemoinho de vento com letras voltando ao lugar | visível ⚡ |
| `S-R3-06` | **Leitura do Pampa** | selo | leitura | 26 | Bronze: vencer a Ventania. Prata: completar o Diário do Tempo. Ouro: recontar 2 histórias do vento. | B·P·O·D | giro 3D | moinho e campo com livro | visível ⚡ |
| `TI-R3-01` | **Leitura da Vila** | título | leitura | 26 | Portão: vencer a Ventania que Embaralha (R3-F10). I-II-III pelos níveis 25–33. | I·II·III | placa de título | placa com crachá da leitura da vila | visível |

### R4 · Pantanal — semanas 26–36

Cores da região: azul-água, verde-oliva, terracota. **28 conquistas** (23 selo, 2 medalha, 2 selo do professor/família, 1 emblema de coleção) + **6 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R4-01` | **Zzz do Zum-Zum** | selo | fonema | 27 | Ler 10/20/40 palavras com /z/; o Zum-Zum vira amigo (R4-F02). | B·P·O·D | giro 3D | besouro Zum-Zum verde-musgo e amarelo-ipê sorrindo | visível ⚡ |
| `S-R4-10` | **Ciclo em 4 Passos** | selo | pensamento computacional | 28 | Decompor o ciclo da cheia em 4 passos. | B·P·O | giro 3D | quatro setas em circulo com gotas | mistério |
| `S-R4-18` | **Natação Segura** | selo | esporte e fair play | 28 | Natação segura: ler 5 regras do rio e escolher a certa. | único | giro 3D | colete salva-vidas azul | mistério |
| `S-R4-02` | **Cobrinha ou Abelha?** | selo | fonema | 29 | Contraste S × Z: 12/25/50 itens. | B·P·O·D | giro 3D | cobrinha e abelha lado a lado | visível ⚡ |
| `S-R4-16` | **Rio sem Lixo** | selo | meio ambiente | 29 | Missão da cheia e da seca + garrafa reaproveitável (adulto confirma). | B·P·O | giro 3D | garrafa reaproveitável e rio limpo | mistério |
| `V-R4-02` | **Pergunte no Jantar** | selo do professor/família | família/professor | 29 | Roteiro 'pergunte isso no jantar' sobre o filhote; adulto confirma. | único | carimbo + voz | carimbo terracota com prato e colher | visível |
| `S-R4-04` | **Duas Letras, Um Som** | selo | palavra | 30 | Ler 15/30/60 palavras com dígrafos (CH, NH, LH). | B·P·O·D | giro 3D | duas peças de madeira unidas por um laço | visível ⚡ |
| `S-R4-11` | **Onde Vive?** | selo | pensamento computacional | 30 | Classificar 12 bichos por onde vivem (água, terra, ar). | B·P·O | giro 3D | três caixas: onda, folha, nuvem | mistério |
| `S-R4-17` | **Canoa em Dupla** | selo | esporte e fair play | 30 | Canoagem cooperativa: remar lendo comandos com o Tales. | B·P·O | giro 3D | canoa de madeira com dois remos | mistério |
| `S-R4-21` | **Combinado Cumprido** | selo | constância saudável | 30 | A família combina os dias de sessão da semana e a criança cumpre o combinado em 2/4/8 semanas (não precisam ser seguidas; nada se perde). | B·P·O | giro 3D | calendário de madeira com três marquinhas | mistério |
| `S-R4-03` | **Xiii ou Jjj?** | selo | fonema | 31 | Contraste CH × J: 12/25/50 itens. | B·P·O·D | giro 3D | dedo em biquinho e onda | visível ⚡ |
| `S-R4-12` | **Peço Ajuda** | selo | emocional | 31 | Na história do filhote perdido, escolher pedir ajuda e dizer a quem: 3 cenas. | B·P·O | giro 3D | filhote de capivara e mão estendida | mistério |
| `S-R4-13` | **Generosidade** | selo | valores e atitudes | 31 | Bronze: dar 1 presente ou bilhete. Prata: presentear 5 moradores diferentes. Ouro: 3 projetos coletivos (conta atos, não valor). | B·P·O·D | giro 3D | caixinha de presente lisa com laço de barbante | mistério |
| `S-R4-22` | **Tuiuiú de Pernas Longas** | selo | segredo | 31 | Seguir as pegadas do tuiuiú lendo 4 placas e achar o ninho. | único | revela segredo | tuiuiú de pernas longas | oculto |
| `S-R4-07` | **Pergunta da Cheia** | selo | compreensão | 32 | Responder 3 perguntas sobre uma história da cheia. | B·P·O | giro 3D | capivara com balão de pergunta | mistério |
| `S-R4-19` | **Resgate e Cuidado** | selo | conhecimento de base (D017) | 32 | Assiste e Faz sobre o resgate de bichos + 3 perguntas. | B·P·O | giro 3D | maleta de veterinária e curativo em pata | mistério |
| `S-R4-05` | **Ninho do NH** | selo | palavra | 33 | Ler e escrever 8 palavras com NH (NINHO, MINHOCA...). | B·P·O | giro 3D | ninho com três ovinhos | mistério ⚡ |
| `S-R4-15` | **Precisa ou Quer?** | selo | financeiro | 33 | Escolher o que levar na canoa: necessidade antes do desejo, 5 situações. | B·P·O | giro 3D | mochila com água e pão, chapéu ao lado | mistério |
| `S-R4-20` | **Câmera da Mata** | selo | conhecimento de base (D017) | 33 | Como a armadilha fotográfica vê os bichos: 3 perguntas. | único | giro 3D | câmera de madeira presa no tronco | mistério |
| `V-R4-01` | **Visto do Professor: Dígrafos** | selo do professor/família | família/professor | 33 | Mostra pro professor: ler NINHO, BICHO e OLHO; ✓. | único | carimbo + voz | carimbo azul-marinho com ninho | visível |
| `M-R4-02` | **Medalha da Regata da Amizade** | medalha | esporte e fair play | 34 | Completar a regata cooperativa do Pantanal lendo as boias. | único | medalha com fita | duas canoas lado a lado | visível |
| `S-R4-06` | **Frases do Resgate** | selo | leitura | 34 | Ler 10/20/40 instruções de uma frase e agir no resgate. | B·P·O·D | giro 3D | canoa com placa de instrução | visível ⚡ |
| `S-R4-23` | **A Onça Tímida** | selo | segredo | 34 | Ler 3 pegadas-palavras na trilha certa e ver a onça de longe. | único | revela segredo | onça pintada espiando entre folhas | oculto |
| `C-R4-01` | **Coleção Pantanal** | emblema de coleção | colecionador | 35 | Completar a coleção do Pantanal (os bichos resgatados visitam a vila). | B·P·O | encaixe na coleção | moldura com 6 encaixes de bichos do Pantanal | visível |
| `S-R4-08` | **Mapa da Cheia** | selo | compreensão | 35 | Completar o projeto 'Mapa da cheia' com rótulos lidos. | B·P·O | giro 3D | mapa de papel com rio e setas | mistério |
| `M-R4-01` | **Medalha da Cheia** | medalha | leitura | 36 | Vencer o chefe de R4 (A Cheia). | único | medalha com fita | tuiuiú sobre água com livro | visível ⚡ |
| `S-R4-09` | **Leitura do Pantanal** | selo | leitura | 36 | Bronze: vencer A Cheia. Prata: Mapa da Cheia. Ouro: recontar 2 histórias do Pantanal para a família. | B·P·O·D | giro 3D | tuiuiú e jacaré lendo | visível ⚡ |
| `S-R4-14` | **Segunda Chance do Zum-Zum** | selo | valores e atitudes | 36 | No fim da região, escolher a frase de perdão lida para o Zum-Zum (segunda chance). | único | giro 3D | Zum-Zum e Bolota abraçados | mistério |

### R5 · Cerrado — semanas 36–48

Cores da região: amarelo-ipê, terracota, verde-cerrado. **28 conquistas** (22 selo, 2 medalha, 2 selo do professor/família, 1 troféu, 1 emblema de coleção) + **8 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R5-02` | **QU de Queijo** | selo | fonema | 37 | C × QU: ler 12/25/50 palavras. | B·P·O·D | giro 3D | queijo e lupa | visível ⚡ |
| `S-R5-03` | **GU de Guará** | selo | fonema | 38 | G × GU: ler 12/25/50 palavras. | B·P·O·D | giro 3D | lobo-guará de perfil | visível ⚡ |
| `S-R5-10` | **Algoritmo de Plantio** | selo | pensamento computacional | 39 | Ordenar 5 passos do plantio e depurar 'o que faltou?'. | B·P·O | giro 3D | semente, regador e setas | mistério |
| `S-R5-15` | **Queimada Cooperativa** | selo | esporte e fair play | 39 | Queimada cooperativa com regras lidas, 3 partidas. | B·P·O | giro 3D | bola leve terracota | mistério |
| `S-R5-01` | **Investigação das Regras** | selo | palavra | 40 | Descobrir a regra (ver casos → achar o padrão → a Sofia nomeia) em 1/3/6 regras contextuais. | B·P·O·D | giro 3D | lupa sobre letras C e QU | visível ⚡ |
| `S-R5-12` | **Paciência de Semente** | selo | emocional | 40 | Cuidar da planta da horta em 3 dias diferentes até ela crescer. | B·P·O | giro 3D | broto saindo da terra | mistério |
| `S-R5-04` | **R Forte, R Fraco** | selo | fonema | 41 | R inicial, RR e R entre vogais: 12/25/50 itens. | B·P·O·D | giro 3D | rato e arara | visível ⚡ |
| `S-R5-11` | **Se... Então** | selo | pensamento computacional | 41 | 5 deduções com pistas lidas. | B·P·O | giro 3D | duas placas ligadas por seta | mistério |
| `S-R5-20` | **Ajuda Quem Caiu** | selo | valores e atitudes | 41 | Escolher ajudar quem caiu no jogo, 3 situações; ouro: gesto real confirmado. | B·P·O | giro 3D | mão ajudando a levantar | mistério |
| `S-R5-07` | **Leitura de Parágrafo** | selo | leitura | 42 | Ler um texto de 5 frases com regras contextuais: com apoio, sozinho, recontando. | B·P·O·D | giro 3D | página com parágrafo e ipê florido | visível ⚡ |
| `S-R5-14` | **Brigada do Cerrado** | selo | meio ambiente | 42 | Missão do fogo no Cerrado + conversa em família (adulto confirma). | B·P·O | giro 3D | capacete de brigadista e folha verde | mistério |
| `V-R5-01` | **Visto do Professor: Regras do R** | selo do professor/família | família/professor | 42 | Mostra pro professor: ler CARRO e CARO explicando; ✓. | único | carimbo + voz | carimbo azul-marinho com R | visível |
| `S-R5-05` | **S que Vira Z** | selo | fonema | 43 | S entre vogais: ler 12/25/50 palavras (CASA, ROSA...). | B·P·O·D | giro 3D | casinha com rosa na janela | visível ⚡ |
| `S-R5-16` | **Peteca no Ar** | selo | esporte e fair play | 43 | Peteca cooperativa: 10 toques lendo sílabas. | B·P·O | giro 3D | peteca de palha com penas brancas | mistério |
| `S-R5-06` | **Cedilha Curiosa** | selo | fonema | 44 | Ler e escrever 10 palavras com Ç. | B·P·O | giro 3D | letra C com cedilha de madeira | mistério ⚡ |
| `S-R5-13` | **Compara Preço** | selo | financeiro | 44 | Comparar o mesmo item em duas lojinhas e explicar a escolha, 3 vezes. | B·P·O | giro 3D | duas etiquetas de preço de papel | mistério |
| `S-R5-21` | **Leitura por Gosto** | selo | constância saudável | 44 | Ler histórias da estante livre (sem moeda): 3/10/25. | B·P·O | giro 3D | estante com livro saindo | mistério |
| `S-R5-08` | **Pergunta do Ipê** | selo | compreensão | 45 | Responder 3 perguntas inferenciais simples (por que o ipê floresce na seca?). | B·P·O | giro 3D | ipê amarelo florido | mistério |
| `S-R5-18` | **A Máquina Pode Errar** | selo | conhecimento de base (D017) | 45 | Assiste e Faz: o app pode errar; o que fazer quando 'não ouviu bem'. | único | giro 3D | tablet com orelhinha e ponto de interrogação | mistério |
| `V-R5-02` | **Receita Lida** | selo do professor/família | família/professor | 45 | Ler uma receita simples com a família; adulto confirma. | único | carimbo + voz | carimbo terracota com colher de pau | visível |
| `C-R5-01` | **Coleção Cerrado** | emblema de coleção | colecionador | 46 | Completar a coleção do Cerrado (o ipê floresce). | B·P·O | encaixe na coleção | moldura com 6 encaixes do Cerrado | visível |
| `M-R5-02` | **Medalha dos Jogos do Cerrado** | medalha | esporte e fair play | 46 | Participar das 3 modalidades do Cerrado (queimada, peteca, salto) com fair play. | único | medalha com fita | três ícones esportivos no metal | visível |
| `S-R5-17` | **Salto de Obstáculo** | selo | esporte e fair play | 46 | Saltar 8 obstáculos lendo a palavra de cada um. | B·P·O | giro 3D | barreira baixa de madeira | mistério |
| `S-R5-19` | **Gente do Cerrado** | selo | conhecimento de base (D017) | 46 | Assiste e Faz: agricultora e comunidades do Cerrado (validar) + 3 perguntas. | único | giro 3D | chapéu de palha e enxada pequena | mistério |
| `S-R5-22` | **A Noite do Lobo** | selo | segredo | 47 | Ler a história 'A NOITE DO LOBO' inteira na estante livre. | único | revela segredo | lobo-guará sob lua cheia | oculto |
| `T-R5-01` | **Troféu da Horta da Vila** | troféu | meio ambiente | 47 | Concluir o projeto 'Horta da vila' lendo as placas e o algoritmo de plantio. | único | troféu no pedestal | troféu em forma de regador sobre canteiro | mistério |
| `M-R5-01` | **Medalha do Ipê Florido** | medalha | leitura | 48 | Vencer o chefe de R5 (Ipê sem Flores). | único | medalha com fita | galho de ipê amarelo | visível ⚡ |
| `S-R5-09` | **Leitura do Cerrado** | selo | leitura | 48 | Bronze: vencer o Ipê sem Flores. Prata: Horta da vila. Ouro: recontar 2 histórias do Cerrado. | B·P·O·D | giro 3D | cupinzeiro e livro aberto | visível ⚡ |

### R6 · Caatinga / Sertão (fecha o Ano 1) — semanas 48–58

Cores da região: terracota, areia, azul-céu. **28 conquistas** (20 selo, 3 selo do professor/família, 2 troféu, 1 medalha, 1 título, 1 emblema de coleção) + **7 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R6-01` | **Som pelo Nariz** | selo | fonema | 49 | Oral × nasal: 12/25/50 itens (ícone 'nariz'). | B·P·O·D | giro 3D | nariz estilizado com ondinha | visível ⚡ |
| `S-R6-02` | **A com Til** | selo | fonema | 50 | Ler 12/25/50 palavras com Ã (PÃO, MÃO, CHÃO). | B·P·O·D | giro 3D | pão de forma com til de madeira | visível ⚡ |
| `S-R6-11` | **Cada Gota Conta** | selo | meio ambiente | 50 | Missão da cisterna + reaproveitar água com adulto (confirma). | B·P·O | giro 3D | cisterna com gota | mistério |
| `S-R6-20` | **Bolota Visita a Família** | selo | segredo | 50 | Achar e ler o bilhete do Bolota escondido no açude. | único | revela segredo | Bolota e tatu-bola parente | oculto |
| `S-R6-05` | **Verso que Rima** | selo | fonema | 51 | Completar 5 versos rimados do cordel. | B·P·O | giro 3D | folheto de cordel pendurado no barbante | mistério ⚡ |
| `S-R6-15` | **Viver com Pouca Água** | selo | conhecimento de base (D017) | 51 | Assiste e Faz: como se vive bem no Sertão + 3 perguntas. | único | giro 3D | açude e mandacaru | mistério |
| `S-R6-08` | **Rima e Regra** | selo | pensamento computacional | 52 | Achar a regra da rima e aplicar em 5 versos. | B·P·O | giro 3D | duas linhas de verso com setas | mistério |
| `S-R6-13` | **Corrida de Saco da Colheita** | selo | esporte e fair play | 52 | Corrida de saco das sílabas nasais na feira da colheita (opção sentada). | B·P·O | giro 3D | saco de juta | mistério |
| `S-R6-03` | **M antes de P e B** | selo | palavra | 53 | Escrever 6 palavras com a regra (CAMPO, TAMPA, TAMBOR). | B·P·O·D | giro 3D | tambor de madeira | mistério ⚡ |
| `S-R6-09` | **Sequência Nasal** | selo | pensamento computacional | 53 | Completar 5 sequências de sílabas nasais. | B·P·O | giro 3D | sílabas em fila com nariz | mistério |
| `V-R6-02` | **Visto do Professor: Nasais** | selo do professor/família | família/professor | 53 | Mostra pro professor: ler PÃO, CAMPO e CANÇÃO; ✓. | único | carimbo + voz | carimbo azul-marinho com til | visível |
| `S-R6-14` | **Pião Certeiro** | selo | esporte e fair play | 54 | Lançar o pião na casa da palavra ouvida (habilidade, nunca sorte). | B·P·O | giro 3D | pião de madeira com cordão | mistério |
| `V-R6-01` | **Li para a Família** | selo do professor/família | família/professor | 54 | Ler um texto curto para alguém da família (público real); adulto confirma. | B·P·O | carimbo + voz | carimbo terracota com sofá e livro | visível |
| `S-R6-04` | **-ÃO ou -AM?** | selo | palavra | 55 | Distinguir -ÃO e -AM em 10 palavras. | B·P·O | giro 3D | canção e cantam em duas placas | mistério ⚡ |
| `S-R6-10` | **Coragem de Apresentar** | selo | emocional | 55 | Gravar e ouvir a própria leitura e escolher se quer mostrar à família (cuidado com o que se compartilha). | B·P·O | giro 3D | microfone de madeira e coração | mistério |
| `S-R6-19` | **Asa-Branca Voltou** | selo | segredo | 55 | Ler as 4 placas do açude e ver a asa-branca voltar. | único | revela segredo | asa-branca em voo | oculto |
| `S-R6-16` | **Sanfona das Sílabas** | selo | conhecimento de base (D017) | 56 | Tocar a sanfona lendo as sílabas da música (artes e música). | B·P·O | giro 3D | sanfona marrom e branca | mistério |
| `T-R6-01` | **Troféu do Meu Cordel** | troféu | leitura | 56 | Completar e ilustrar em xilogravura o 'Meu cordel' (projeto da região). | único | troféu no pedestal | troféu com folheto de cordel e xilogravura de asa-branca | mistério |
| `C-R6-01` | **Coleção Sertão** | emblema de coleção | colecionador | 57 | Completar a coleção do Sertão (noite de cordel no coreto). | B·P·O | encaixe na coleção | moldura com 6 encaixes do Sertão | visível |
| `S-R6-06` | **Reconto da Feira** | selo | compreensão | 57 | Recontar uma história em 4 cartões, na ordem. | B·P·O | giro 3D | quatro cartões com números | mistério |
| `S-R6-12` | **Meta do Ano 1** | selo | financeiro | 57 | Completar a meta de poupança do Ano 1 planejada na lista de desejos. | único | giro 3D | cofrinho-tatu com bandeirinha 1 | mistério |
| `S-R6-17` | **Gratidão da Colheita** | selo | valores e atitudes | 57 | Escolher e enviar um bilhete lido de agradecimento a um morador. | B·P·O | giro 3D | cesta de colheita com bilhete | mistério |
| `M-R6-01` | **Medalha da Feira do Cordel** | medalha | leitura | 58 | Vencer o chefe do Ano 1 (Feira do Cordel). | único | medalha com fita | cordel e sanfona no metal | visível ⚡ |
| `S-R6-07` | **Leitura do Sertão** | selo | leitura | 58 | Bronze: vencer a Feira do Cordel. Prata: Meu cordel. Ouro: ler o cordel para a família. | B·P·O·D | giro 3D | mandacaru e livro aberto | visível ⚡ |
| `S-R6-18` | **Revisão do Ano** | selo | constância saudável | 58 | Completar a Trilha de Revisão do Ano 1 (todos os biomas), no seu ritmo, em quantas sessões quiser. | único | giro 3D | mapa do Ano 1 com trilha pontilhada | mistério ⚡ |
| `T-R6-02` | **Troféu Ano 1 Completo** | troféu | leitura | 58 | Concluir R6: Feira do Cordel + revisão de retenção dos sons do ano. Vai para a estante da casa com plaquinha do ano. | único | troféu no pedestal | troféu grande dourado com o número 1 e livro | visível |
| `TI-R6-01` | **Contação de Histórias** | título | leitura | 58 | Portão: vencer a Feira do Cordel (R6-F08). I-II-III pelos níveis 34–42. | I·II·III | placa de título | placa com caderno de histórias | visível |
| `V-R6-03` | **Visto do Professor: Ano 1** | selo do professor/família | família/professor | 58 | Mostra pro professor: minha leitura do Ano 1 (texto curto); ✓ com parabéns gravado. | único | carimbo + voz | carimbo azul-marinho com estrela e 1 | visível |

### R7 · Amazônia (abre o Ano 2) — semanas 58–70

Cores da região: verde-mata, azul-rio, madeira. **26 conquistas** (22 selo, 2 selo do professor/família, 1 medalha, 1 emblema de coleção) + **4 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R7-20` | **Começo do Ano 2** | selo | constância saudável | 58 | Voltar para o Ano 2 e passar na revisão de abertura (sons do Ano 1). | único | giro 3D | porta do barco-escola com número 2 | mistério ⚡ |
| `S-R7-01` | **Sílaba Fechada** | selo | sílaba | 60 | Ler 15/30/60 palavras CVC (MAR, SOL, PAZ...). | B·P·O·D | giro 3D | sol sobre o rio | visível ⚡ |
| `S-R7-08` | **Mapa do Rio** | selo | pensamento computacional | 61 | Seguir rota no mapa com 5 comandos lidos. | B·P·O | giro 3D | mapa do rio com barquinho | mistério |
| `S-R7-18` | **Remada Sincronizada** | selo | esporte e fair play | 61 | Canoagem: ler 10 comandos de remada com a turma do barco. | B·P·O | giro 3D | dois remos cruzados | mistério |
| `S-R7-02` | **Ditongo Dançante** | selo | fonema | 62 | Ler 12/25/50 palavras com ditongos. | B·P·O·D | giro 3D | duas vogais de mãos dadas | visível ⚡ |
| `S-R7-14` | **Amizade sem Fronteiras** | selo | valores e atitudes | 62 | Respeitar outros modos de vida: 3 situações com a Iara. | B·P·O | giro 3D | duas crianças na canoa | mistério |
| `S-R7-21` | **Boto do Igarapé** | selo | segredo | 62 | Seguir as bolhas do boto lendo 4 palavras. | único | revela segredo | boto cor-de-rosa claro saltando | oculto |
| `S-R7-03` | **L ou U no Fim?** | selo | palavra | 63 | Distinguir L e U no fim (MAL, MAU) em 10/20/40 itens. | B·P·O·D | giro 3D | placa com mal e mau | mistério ⚡ |
| `S-R7-17` | **Igarapé Limpo** | selo | meio ambiente | 63 | Missão 'o rio é de todos' + cartaz para a escola (adulto confirma). | B·P·O | giro 3D | igarapé com peixe | mistério |
| `V-R7-01` | **Visto do Professor: Sílaba Fechada** | selo do professor/família | família/professor | 63 | Mostra pro professor: ler MAR, SOL e FLORESTA; ✓. | único | carimbo + voz | carimbo azul-marinho com sol | visível |
| `S-R7-04` | **Vogal Escondida** | selo | palavra | 64 | Escrever com E e O as vogais átonas finais (LEITE, BOLO) em 10 palavras. | B·P·O | giro 3D | copo de leite e bolo | mistério ⚡ |
| `S-R7-10` | **Ciclo da Água** | selo | conhecimento de base (D017) | 64 | Assiste e Faz do ciclo da água (R7-F05) + 3/6/10 perguntas. | B·P·O | giro 3D | nuvem, chuva e rio em circulo | mistério |
| `S-R7-13` | **Sentimento tem Nome** | selo | emocional | 64 | Nomear vergonha, chateado, preocupado e frustrado em 4 cenas. | B·P·O | giro 3D | quatro rostos de madeira | mistério |
| `S-R7-09` | **Quem Come Quem** | selo | pensamento computacional | 65 | Montar 3 cadeias alimentares com nomes lidos. | B·P·O | giro 3D | setas ligando folha, peixe e garça | mistério |
| `S-R7-11` | **Satélite que Vê** | selo | conhecimento de base (D017) | 65 | Como o satélite vê a floresta: 3 perguntas. | único | giro 3D | satélite branco sobre floresta | mistério |
| `S-R7-05` | **Leitura do Texto do Rio** | selo | leitura | 66 | Ler texto de 2 parágrafos: com apoio, sozinho, recontando. | B·P·O·D | giro 3D | barco-escola com livro | visível ⚡ |
| `S-R7-15` | **Ajuda de Quem Vê** | selo | valores e atitudes | 66 | Ficar ao lado de quem está sendo deixado de fora: 3/6/10 situações. | B·P·O | giro 3D | três crianças, uma de braços abertos | mistério |
| `S-R7-16` | **Cuida do que é de Todos** | selo | financeiro | 66 | Decidir com a vila o uso de um recurso comum (o rio) em 3 situações. | B·P·O | giro 3D | rio e três casinhas | mistério |
| `S-R7-19` | **Damas da Praça** | selo | esporte e fair play | 67 | Ler as regras e jogar 3 partidas de damas com fair play. | B·P·O | giro 3D | tabuleiro de damas madeira clara e escura | mistério |
| `S-R7-22` | **Leitura da Arara** | selo | segredo | 67 | Ler as 5 palavras que a arara mostra no alto da árvore. | único | revela segredo | arara azul e amarela | oculto |
| `S-R7-12` | **Ritmo de Sílabas** | selo | conhecimento de base (D017) | 68 | Tocar o berimbau no ritmo das sílabas lidas (música, sem cantigas). | B·P·O | giro 3D | berimbau de madeira com cabaça | mistério |
| `V-R7-02` | **Conto do Rio** | selo do professor/família | família/professor | 68 | Contar à família uma história do rio; adulto confirma. | único | carimbo + voz | carimbo terracota com barquinho | visível |
| `C-R7-01` | **Coleção Amazônia** | emblema de coleção | colecionador | 69 | Completar a coleção da Amazônia (rio de palavras no barco-escola). | B·P·O | encaixe na coleção | moldura com 6 encaixes da Amazônia | visível |
| `S-R7-06` | **Livro do Rio** | selo | compreensão | 69 | Completar o 'Livro do rio' (página com palavra de língua indígena validada por consultor). | B·P·O | giro 3D | livro artesanal com peixe na capa | mistério |
| `M-R7-01` | **Medalha do Rio que Lembra** | medalha | leitura | 70 | Vencer o chefe de R7 (Rio que Esqueceu as Palavras). | único | medalha com fita | rio sinuoso com letras boiando | visível ⚡ |
| `S-R7-07` | **Leitura da Amazônia** | selo | leitura | 70 | Bronze: vencer o Rio. Prata: Livro do rio. Ouro: recontar 2 histórias do rio. | B·P·O·D | giro 3D | arara e livro aberto | visível ⚡ |

### R8 · Litoral e Mar — semanas 70–82

Cores da região: azul-marinho, branco, areia. **28 conquistas** (20 selo, 2 medalha, 2 selo do professor/família, 2 emblema de coleção, 1 título, 1 troféu) + **13 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R8-13` | **Capoeira na Areia** | selo | esporte e fair play | 72 | Ginga e palmas no ritmo das sílabas, roda de respeito (sem cantigas nem rituais). | B·P·O | giro 3D | duas crianças em ginga na areia, roupa branca | mistério |
| `S-R8-01` | **Encontro com R** | selo | sílaba | 73 | Ler 20/40/80 palavras com PR, BR, TR, DR, CR, GR, FR, VR. | B·P·O·D | giro 3D | trem com vagões PR e BR | visível ⚡ |
| `S-R8-20` | **Farol Revisitado** | selo | segredo | 73 | Voltar à Ilha das Vogais (R1) e ler a placa nova do farol (espiral). | único | revela segredo | farol com placa de frase | oculto |
| `S-R8-08` | **Programa a Batida** | selo | pensamento computacional | 74 | Programar uma batida com sequência e repetição. | B·P·O | giro 3D | tambor e cartas de ritmo | mistério |
| `S-R8-14` | **Vôlei de Praia em Dupla** | selo | esporte e fair play | 74 | Vôlei cooperativo lendo palavras CCV, 3 partidas. | B·P·O | giro 3D | bola de vôlei sobre areia | mistério |
| `S-R8-06` | **Pergunta do Mangue** | selo | compreensão | 75 | Responder 3/6/10 perguntas sobre textos do mangue. | B·P·O | giro 3D | caranguejo com balão de pergunta | mistério |
| `S-R8-12` | **Mangue sem Plástico** | selo | meio ambiente | 75 | Missão do mangue + desafio do canudo (adulto confirma). | B·P·O | giro 3D | caranguejo e lama limpa | mistério |
| `S-R8-19` | **Caranguejo do Mangue** | selo | segredo | 75 | Achar as tocas do caranguejo lendo 4 placas. | único | revela segredo | caranguejo saindo da toca | oculto |
| `S-R8-02` | **Encontro com L** | selo | sílaba | 76 | Ler 20/40/80 palavras com PL, BL, CL, GL, FL. | B·P·O·D | giro 3D | trem com vagões PL e FL | visível ⚡ |
| `S-R8-09` | **Padrão no Tecido** | selo | pensamento computacional | 76 | Completar 4 padrões simétricos de tecido. | B·P·O | giro 3D | tecido com padrão geométrico em 2 cores | mistério |
| `S-R8-16` | **Como o Som Viaja** | selo | conhecimento de base (D017) | 76 | Assiste e Faz: vibração e som + 3 perguntas. | único | giro 3D | ondas saindo de um tambor | mistério |
| `M-R8-02` | **Medalha da Roda de Respeito** | medalha | esporte e fair play | 77 | Completar a roda de capoeira-esporte lendo os comandos e cumprimentando todos. | único | medalha com fita | roda de palmas estilizada | visível |
| `S-R8-10` | **Minha História** | selo | emocional | 77 | Escolher 3 frases lidas sobre si (cor, cabelo, história) para o álbum. | único | giro 3D | espelho e livro | mistério |
| `S-R8-18` | **Peço Ajuda pelo Outro** | selo | valores e atitudes | 77 | Pedir ajuda ao adulto por um colega ('meu colega precisa'): 3 situações. | B·P·O | giro 3D | criança apontando para colega e adulto | mistério |
| `S-R8-03` | **Fluência na Praia** | selo | leitura | 78 | Leitura repetida: ler o mesmo texto 3 vezes, cada vez com menos ajuda. | B·P·O·D | giro 3D | onda com livro surfando | visível ⚡ |
| `S-R8-11` | **Feira do Peixe** | selo | financeiro | 78 | Preço e troco simples em 5 compras na feira. | B·P·O | giro 3D | balança de feira e moedinhas | mistério |
| `V-R8-01` | **Visto do Professor: Encontros** | selo do professor/família | família/professor | 78 | Mostra pro professor: ler PRAIA, TREM e FLOR; ✓. | único | carimbo + voz | carimbo azul-marinho com trem | visível |
| `S-R8-04` | **Recorde Pessoal** | selo | leitura | 79 | Ler um texto com menos ajudas que na semana anterior (comparado só consigo; sem cronômetro). | B·P·O | giro 3D | seta para cima sobre livro | mistério |
| `S-R8-15` | **Da Casa ao Planeta** | selo | conhecimento de base (D017) | 79 | Ordenar casa, cidade, estado, país e planeta (R8-F04) + 3 perguntas. | B·P·O | giro 3D | circulos concêntricos com casinha no centro | mistério |
| `C-R8-02` | **Coleção Litoral e Mar** | emblema de coleção | colecionador | 80 | Completar a coleção do Litoral. | B·P·O | encaixe na coleção | moldura com 6 encaixes do mar | visível |
| `S-R8-05` | **Maiúscula e Ponto** | selo | palavra | 80 | Usar maiúscula e ponto final em 5 frases (R8-F05). | B·P·O | giro 3D | letra maiúscula e ponto grande | mistério |
| `S-R8-17` | **O Mar que Liga** | selo | conhecimento de base (D017) | 80 | Brasil e África ligados pelo Atlântico (revisão ERER) + 3 perguntas. | único | giro 3D | mapa do Atlântico com barco | mistério |
| `T-R8-01` | **Troféu da Estação** | troféu | colecionador | 80 | Participar do projeto coletivo da Estação de Trem (ler a planta ou doar); todos recebem o mesmo agradecimento. | único | troféu no pedestal | troféu em forma de estação com relógio sem ponteiros | mistério |
| `C-R8-01` | **Coleção Instrumentos do Brasil** | emblema de coleção | colecionador | 81 | Completar a coleção de instrumentos (banda da vila). | B·P·O | encaixe na coleção | moldura com 6 encaixes de instrumentos | visível |
| `V-R8-02` | **Roda de Música em Casa** | selo do professor/família | família/professor | 81 | Ler nomes de instrumentos e tocar com panela e colher com a família; adulto confirma. | único | carimbo + voz | carimbo terracota com colher e panela | visível |
| `M-R8-01` | **Medalha do Trem dos Encontros** | medalha | leitura | 82 | Vencer o chefe de R8 (Trem dos Encontros). | único | medalha com fita | locomotiva de frente | visível ⚡ |
| `S-R8-07` | **Leitura do Litoral** | selo | leitura | 82 | Bronze: vencer o Trem. Prata: Festa da vila. Ouro: recontar 2 histórias do mar. | B·P·O·D | giro 3D | jangada de madeira com vela branca | visível ⚡ |
| `TI-R8-01` | **Guarda dos Livros** | título | leitura | 82 | Portão: vencer o Trem dos Encontros (R8-F07). I-II-III pelos níveis 43–51. | I·II·III | placa de título | placa com capa lisa da guarda da biblioteca | visível |

### R9 · Cidade das Letras — semanas 82–94

Cores da região: azul-marinho, amarelo-ipê, cinza-claro. **34 conquistas** (28 selo, 2 medalha, 2 selo do professor/família, 1 troféu, 1 emblema de coleção) + **3 Maestria do Som** (§5).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R9-04` | **H Silencioso** | selo | fonema | 83 | Ler 10 palavras com H inicial mudo (HORA, HOJE). | B·P·O | giro 3D | relógio de parede sem ponteiros de jogo | visível ⚡ |
| `S-R9-01` | **Investigação do X** | selo | palavra | 84 | Ler 15/30/60 palavras com os vários sons do X. | B·P·O·D | giro 3D | caixa com X na tampa | visível ⚡ |
| `S-R9-19` | **Futsal da Escola** | selo | esporte e fair play | 84 | Futsal cooperativo lendo o placar, 3 partidas. | B·P·O | giro 3D | bola de futsal | mistério |
| `S-R9-02` | **CH ou X?** | selo | palavra | 85 | Escolher CH ou X em 10/20/40 palavras. | B·P·O·D | giro 3D | chave e xícara | mistério ⚡ |
| `S-R9-15` | **Quem Faz a Cidade Funcionar** | selo | conhecimento de base (D017) | 85 | Profissões (R9-F06): ligar 8 profissionais às ferramentas lidas. | B·P·O | giro 3D | capacete, estetoscópio e livro | mistério |
| `S-R9-20` | **Cesta Inclusiva** | selo | esporte e fair play | 85 | Basquete em cadeira com o Davi, lendo as palavras da cesta. | B·P·O | giro 3D | cadeira esportiva e cesta | mistério |
| `S-R9-03` | **J ou G?** | selo | palavra | 86 | Escolher J ou G em 10/20/40 palavras. | B·P·O·D | giro 3D | girafa e janela | mistério ⚡ |
| `S-R9-13` | **Como Funciona por Dentro** | selo | conhecimento de base (D017) | 86 | Assiste e Faz: tela, alto-falante e internet + 3 perguntas. | único | giro 3D | alto-falante aberto mostrando peça | mistério |
| `S-R9-18` | **Coleta Seletiva** | selo | meio ambiente | 86 | Separar papel, plástico, vidro, metal e orgânico + achar 3 símbolos de reciclagem em casa. | B·P·O | giro 3D | símbolo de reciclagem em verde | mistério |
| `S-R9-06` | **Fala Assim, Escreve Assado** | selo | palavra | 87 | -OU, -ÃO/-AM: 10 palavras ('a gente fala assim, escreve assado'). | B·P·O | giro 3D | balão de fala e lápis | mistério ⚡ |
| `S-R9-14` | **Mercadinho** | selo | financeiro | 87 | Orçamento e troco: 3/6/10 compras planejadas. | B·P·O | giro 3D | carrinho de feira e lista | mistério |
| `S-R9-21` | **Handebol de Equipe** | selo | esporte e fair play | 87 | Handebol cooperativo, passes lendo nomes. | B·P·O | giro 3D | bola de handebol | mistério |
| `S-R9-27` | **Robô Tec Conserta** | selo | segredo | 87 | Ler o manual do robô Tec e ajudar a consertá-lo. | único | revela segredo | robô Tec com chave inglesa | oculto |
| `S-R9-05` | **Inho e Zinho** | selo | palavra | 88 | Morfologia -INHO / -ZINHO em 10 palavras. | B·P·O | giro 3D | casinha e cafezinho | mistério ⚡ |
| `S-R9-11` | **Depura a Construção** | selo | pensamento computacional | 88 | Achar e consertar 3 erros na construção que cai. | B·P·O | giro 3D | blocos e chave de fenda | mistério |
| `S-R9-23` | **Bicicleta Segura** | selo | esporte e fair play | 88 | Ler 6 placas de trânsito e escolher o caminho seguro. | único | giro 3D | bicicleta e capacete | mistério |
| `S-R9-26` | **Persisto** | selo | emocional | 88 | Voltar a uma atividade difícil e concluí-la depois do erro: 3/8/15 vezes. | B·P·O | giro 3D | montanha com bandeirinha | mistério |
| `S-R9-08` | **Lê a Instrução** | selo | compreensão | 89 | Seguir instruções escritas de 5 passos (construir a ponte). | B·P·O | giro 3D | folha de instruções com chave inglesa | mistério |
| `S-R9-16` | **Votação da Praça** | selo | conhecimento de base (D017) | 89 | O que é votar (R9-F07): ler as opções e votar na nova praça. | único | giro 3D | urna de papel e praça | mistério |
| `S-R9-22` | **Ouvido de Goalball** | selo | esporte e fair play | 89 | Goalball e bocha: localizar a bola pelo som e ler as regras. | B·P·O | giro 3D | bola de goalball com guizo | mistério |
| `S-R9-07` | **Reportagem da Vila** | selo | leitura | 90 | Ler e escrever notícia curta para o Jornal da Cidade: 1/3/6 notícias. | B·P·O·D | giro 3D | jornal dobrado e lápis | visível |
| `S-R9-12` | **Senha Guardada** | selo | conhecimento de base (D017) | 90 | Ler 3 regras de privacidade e senha e escolher a atitude certa. | único | giro 3D | cadeado aberto com chave de madeira | mistério |
| `S-R9-25` | **Repara o Dano** | selo | valores e atitudes | 90 | Desmentir o boato ou convidar de novo: 3 situações; ouro: gesto real confirmado. | B·P·O | giro 3D | duas crianças fazendo as pazes | mistério |
| `V-R9-01` | **Visto do Professor: Concorrências** | selo do professor/família | família/professor | 90 | Mostra pro professor: explicar por que se escreve CAIXA e CHAVE; ✓. | único | carimbo + voz | carimbo azul-marinho com X | visível |
| `S-R9-17` | **Direitos e Deveres** | selo | conhecimento de base (D017) | 91 | Separar 6 direitos e deveres lidos. | único | giro 3D | balança de pratos equilibrada | mistério |
| `S-R9-28` | **Planta Escondida** | selo | segredo | 91 | Achar e ler a planta escondida no 2o andar da oficina. | único | revela segredo | rolo de planta azul | oculto |
| `T-R9-01` | **Troféu da Ponte da Vila** | troféu | pensamento computacional | 91 | Ponte da vila (STEAM): ler instruções, construir, testar, consertar. | único | troféu no pedestal | troféu em forma de ponte de madeira | mistério |
| `V-R9-02` | **Notícia em Casa** | selo do professor/família | família/professor | 91 | Ler para a família a notícia que escreveu; adulto confirma. | único | carimbo + voz | carimbo terracota com jornal | visível |
| `C-R9-01` | **Coleção Cidade das Letras** | emblema de coleção | colecionador | 92 | Completar a coleção da cidade. | B·P·O | encaixe na coleção | moldura com 6 encaixes da cidade | visível |
| `M-R9-02` | **Medalha dos Jogos da Escola** | medalha | esporte e fair play | 92 | Participar de 4 modalidades da quadra com fair play. | único | medalha com fita | quadra estilizada | visível |
| `S-R9-09` | **Cidadania na Vila** | selo | conhecimento de base (D017) | 92 | Bronze: votação da praça. Prata: direitos e deveres. Ouro: propor uma regra justa para o jogo da turma (apartidário). | B·P·O·D | giro 3D | praça com coreto e urna de papel | visível |
| `S-R9-24` | **Primeiros Lances** | selo | esporte e fair play | 92 | Xadrez: ler o nome das peças e fazer 3 lances corretos. | B·P·O | giro 3D | cavalo de xadrez de madeira | mistério |
| `S-R9-10` | **Criação de Histórias** | selo | leitura | 93 | Bronze: escrever 1 história curta. Prata: 3. Ouro: publicar no 'livro da vila' (R10). | B·P·O·D | giro 3D | livro aberto com lápis e estrela | mistério |
| `M-R9-01` | **Medalha do Jornal da Cidade** | medalha | leitura | 94 | Vencer o chefe de R9 (Jornal da Cidade). | único | medalha com fita | jornal com manchete | visível ⚡ |

### R10 · Arquipélago dos Livros — semanas 94–104+

Cores da região: azul-marinho, amarelo-ipê, branco. **29 conquistas** (22 selo, 2 selo do professor/família, 2 emblema de coleção, 1 troféu, 1 medalha, 1 título).

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-R10-01` | **Palavras de Toda Hora** | selo | palavra | 95 | Ler 30/60/100 palavras de alta frequência por mapeamento (QUE, NÃO, MUITO, TAMBÉM, HOMEM). | B·P·O·D | giro 3D | nuvem de palavras em placas de madeira | visível ⚡ |
| `S-R10-14` | **Sol e Sombra** | selo | conhecimento de base (D017) | 95 | Dia e noite, sombra (R10-F03) + 3/6/10 perguntas. | B·P·O | giro 3D | relógio de sol de madeira | mistério |
| `S-R10-08` | **Linha do Tempo** | selo | pensamento computacional | 96 | Ordenar 6 acontecimentos numa linha do tempo. | B·P·O | giro 3D | linha do tempo com marcos | mistério |
| `S-R10-12` | **Céu Escuro** | selo | meio ambiente | 96 | Missão 'apagar as luzes para ver as estrelas' (adulto confirma). | único | giro 3D | céu estrelado sobre casinha apagada | mistério |
| `S-R10-21` | **Estrela-Mapa** | selo | segredo | 96 | Ler as 5 pistas do observatório e achar a estrela-mapa. | único | revela segredo | estrela de 5 pontas com mapa dentro | oculto |
| `S-R10-02` | **Leitura Fluente** | selo | leitura | 97 | Ler o texto da fase com fluência, comparado só consigo. | B·P·O·D | giro 3D | livro com fita marcadora | visível ⚡ |
| `S-R10-09` | **Antes e Depois** | selo | pensamento computacional | 97 | 10 pares de antes e depois. | B·P·O | giro 3D | ampulheta de madeira | mistério |
| `S-R10-17` | **Relógio do Céu** | selo | conhecimento de base (D017) | 97 | Relógio digital × relógio do céu: 3 perguntas. | único | giro 3D | lua e relógio | mistério |
| `S-R10-03` | **O que Acontece Depois?** | selo | compreensão | 98 | Inferir o que acontece depois em 3/6/10 histórias. | B·P·O·D | giro 3D | página virando com seta | visível |
| `S-R10-15` | **Coisas de Antigamente** | selo | conhecimento de base (D017) | 98 | Linha do tempo da família, objetos de antigamente (R10-F04). | B·P·O | giro 3D | rádio antigo e foto | mistério |
| `S-R10-18` | **Xadrez Pensante** | selo | esporte e fair play | 98 | Jogar 3 partidas de xadrez lendo os lances, com cumprimento final. | B·P·O | giro 3D | rei de xadrez de madeira | mistério |
| `S-R10-10` | **Olha Quanto Cresci** | selo | emocional | 99 | Ouvir a própria gravação de R1 e a de agora e dizer o que mudou. | único | giro 3D | duas fotos do avatar, pequeno e maior | mistério |
| `S-R10-16` | **País e Cidadania** | selo | conhecimento de base (D017) | 99 | Presidente, governador, prefeito, leis e símbolos nacionais (R10-F05; apartidário, sem políticos reais). | B·P·O | giro 3D | prédio público estilizado e livro de leis | mistério |
| `S-R10-04` | **Ler nas Entrelinhas** | selo | compreensão | 100 | Responder 5 perguntas inferenciais de um texto. | B·P·O | giro 3D | lupa entre duas linhas de texto | mistério |
| `S-R10-11` | **Meta Longa** | selo | financeiro | 100 | Concluir uma meta de longo prazo planejada e celebrá-la. | único | giro 3D | cofrinho com estrela | mistério |
| `S-R10-22` | **Dona Coruja Conta Tudo** | selo | segredo | 100 | Ler o livro da Dona Coruja até o fim. | único | revela segredo | coruja de óculos lendo | oculto |
| `S-R10-05` | **Reconto Completo** | selo | compreensão | 101 | Recontar uma história longa com começo, meio e fim. | B·P·O | giro 3D | três livrinhos em fila | mistério |
| `S-R10-13` | **Livro Verde da Vila** | selo | meio ambiente | 101 | Escrever frases do que aprendeu sobre cuidar de cada lugar e ler para a família. | B·P·O | giro 3D | livro de capa verde com folha | mistério |
| `C-R10-01` | **Coleção Arquipélago** | emblema de coleção | colecionador | 102 | Completar a coleção do Arquipélago dos Livros. | B·P·O | encaixe na coleção | moldura com 6 encaixes de livros-ilha | visível |
| `T-R10-01` | **Troféu Livro da Minha Jornada** | troféu | leitura | 102 | Ler para a família o 'Livro da minha jornada' (frases sobre cada região). | único | troféu no pedestal | troféu com livro aberto e mapa da jornada | visível |
| `C-R10-02` | **Estante Completa** | emblema de coleção | colecionador | 103 | Ter um livro de cada região na estante da casa. | único | encaixe na coleção | estante com 11 lombadas lisas | visível |
| `S-R10-19` | **Recado de Incentivo** | selo | valores e atitudes | 103 | Escolher frases prontas de incentivo para quem está começando (cartão aprovado pelo adulto). | único | giro 3D | cartão com estrela e coração liso | mistério |
| `V-R10-01` | **Visto do Professor: Leitura Plena** | selo do professor/família | família/professor | 103 | Mostra pro professor: leitura e reconto finais; ✓ com parabéns gravado. | único | carimbo + voz | carimbo azul-marinho com capelo | visível |
| `M-R10-01` | **Medalha do Festival de Leitura** | medalha | leitura | 104 | Vencer o chefe final (Festival de Leitura, reconto para a família). | único | medalha com fita | palco com livro e cortina | visível ⚡ |
| `S-R10-06` | **Leitura do Arquipélago** | selo | leitura | 104 | Bronze: Festival de Leitura. Prata: Livro da minha jornada. Ouro: 5 livros da estante livre. | B·P·O·D | giro 3D | ilhas com estantes | visível |
| `S-R10-07` | **Alfabetização Plena** | selo | leitura | 104 | Concluir a jornada com o termômetro em 9–10 e o Festival de Leitura (texto da tela: 'Alfabetizado', 'Alfabetizada' ou 'Chegou a alfabetização plena', D013). | único | giro 3D | diploma enrolado com fita lisa e livro | visível |
| `S-R10-20` | **Leitura para a Vida** | selo | constância saudável | 104 | Pós-jornada: ler livros da estante livre em 1/3/6/12 meses diferentes (sem perda se parar). | B·P·O·D | giro 3D | livro com folha brotando | mistério |
| `TI-R10-01` | **Maestria da Leitura** | título | leitura | 104 | Portão: vencer o Festival de Leitura (R10-F09). I-II-III e depois estrelas sem fim (níveis 52+). | I·II·III + ★ | placa de título | placa com capa dourada da leitura | visível |
| `V-R10-02` | **Ritual de Passagem** | selo do professor/família | família/professor | 104 | Ritual de passagem com a família (doc. mestre §4.6); adulto confirma. | único | carimbo + voz | carimbo terracota com porta e luz | visível |

### EV · Eventos recorrentes

Cores: azul-marinho e amarelo-ipê (com o tema do evento). Eventos **voltam todo ano**; os itens que repetem por edição mostram ×2, ×3 na estante. Nada é "só hoje": quem não participou de uma edição participa da próxima (lojinha L4). **Sem** festa junina, carnaval, Halloween ou festas de outras religiões (D012); **Natal só se a escola ativar**.


#### Eventos semanais · semanal (rodizio de temas a cada 6–8 semanas) · toda segunda-feira, para quem já tem as habilidades

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-01` | **Semana do Esporte** | selo | esporte e fair play | 8 | Concluir os desafios de leitura da Semana do Esporte: 1/3/6/10 edições. | B·P·O·D | giro 3D | medalhinha de bola sobre faixa da semana | mistério |
| `S-EV-02` | **Semana da Horta** | selo | meio ambiente | 8 | Concluir os desafios da Semana da Horta: 1/3/6/10 edições. | B·P·O·D | giro 3D | canteiro com placa | mistério |
| `S-EV-03` | **Atenção Total** | selo | emocional | 10 | Semana do Zum-Zum: terminar as tarefas sem se distrair (meta pessoal): 1/3/6/10 edições. | B·P·O·D | giro 3D | Zum-Zum parado olhando um livro | mistério |
| `M-EV-01` | **Medalha da Turma Atenta** | medalha | emocional | 10 | Turma contra o Zum-Zum: a meta coletiva de atenção foi atingida (medalha repete por edição: x2, x3...). | único, repete (×N) | medalha com fita | lâmpada acesa e besouro amigo | mistério |
| `S-EV-04` | **Semana da Biblioteca** | selo | leitura | 12 | Ler 3 livros da estante livre na semana temática: 1/3/6/10 edições. | B·P·O·D | giro 3D | fachada da biblioteca da vila | mistério |
| `S-EV-05` | **Semana dos Bichos** | selo | conhecimento de base (D017) | 14 | Assiste e Faz + leitura sobre um bicho brasileiro: 1/3/6/10 edições. | B·P·O·D | giro 3D | pegadas de vários bichos | mistério |
| `S-EV-06` | **Semana da Gentileza** | selo | valores e atitudes | 16 | Cumprir 3 gestos de gentileza lidos (1 real, confirmado pelo adulto): 1/3/6/10 edições. | B·P·O·D | giro 3D | coração liso com mãos | mistério |
| `S-EV-07` | **Semana da Música** | selo | conhecimento de base (D017) | 20 | Ler nomes e tocar instrumentos da banda da vila: 1/3/6/10 edições. | B·P·O·D | giro 3D | notas musicais e flauta | mistério |
| `S-EV-08` | **Semana do Inventor** | selo | pensamento computacional | 30 | Construir e depurar 1 invenção lendo instruções: 1/3/6/10 edições. | B·P·O·D | giro 3D | engrenagens de madeira | mistério |
| `S-EV-09` | **Semana da Cidadania** | selo | conhecimento de base (D017) | 24 | Combinados da turma, votação de brincadeira e direitos e deveres lidos: 1/3/6/10 edições (apartidário). | B·P·O·D | giro 3D | coreto e urna de papel | mistério |
| `S-EV-10` | **Semana da Feirinha** | selo | financeiro | 12 | Feirinha da vila: ler preços, planejar e poupar: 1/3/6/10 edições. | B·P·O·D | giro 3D | barraca com etiquetas e cofrinho | mistério |
| `S-EV-11` | **Semana Surpresa** | selo | segredo | 16 | Achar a pista escondida da semana e ler a mensagem. | único | revela segredo | envelope lacrado azul-marinho | oculto |

#### Eventos mensais · mensal · 1a semana de cada mês

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-12` | **Desafio do Mês** | selo | leitura | 5 | Concluir o desafio temático do mês (12 temas): 1/4/8/12 meses (não precisam ser seguidos). | B·P·O·D | giro 3D | calendário de madeira com estrela | visível |
| `S-EV-13` | **Livro do Mês** | selo | leitura | 8 | Ler o livro do mês e responder 3 perguntas: 1/4/8/12 livros. | B·P·O·D | giro 3D | livro em pé com fita | mistério |
| `V-EV-01` | **Leitura em Família** | selo do professor/família | família/professor | 4 | Missão do mês em família confirmada pelo adulto: 1/4/8/12 missões. | B·P·O·D | carimbo + voz | carimbo terracota com casa e livro | visível |
| `V-EV-02` | **Turma que Lê** | selo do professor/família | família/professor | 6 | O professor valida a meta coletiva do mês da turma (sem ranking individual). | único, repete (×N) | carimbo + voz | carimbo azul-marinho com carteiras | mistério |

#### Copa das Letras · anual (~4 semanas) · temporada definida pela escola/plataforma

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-14` | **Torcida Leitora** | selo | esporte e fair play | 16 | Copa das Letras: completar a 1a partida cooperativa lendo o placar. | único | giro 3D | camisa lisa 2 cores da seleção escolhida | mistério |
| `S-EV-15` | **Placar de Palavras** | selo | palavra | 16 | Reconstruir 3/6/10 palavras do placar com a dupla de seleções. | B·P·O | giro 3D | placar de madeira com letras | mistério |
| `S-EV-16` | **Cartão Verde** | selo | esporte e fair play | 16 | Escolher o gesto de fair play no cartão de fair play em 3/6/10 situações. | B·P·O | giro 3D | cartão verde-mata com aperto de mão | mistério |
| `M-EV-02` | **Medalha da Copa das Letras** | medalha | esporte e fair play | 16 | Concluir a fase de visitas da Copa (repete por edição). | único, repete (×N) | medalha com fita | bola e fita marinho e amarelo-ipê | mistério |
| `T-EV-01` | **Taça da Amizade** | troféu | esporte e fair play | 18 | Final: Festival da Copa: todas as seleções completam o Grande Placar da Vila; todos recebem a mesma taça (sem campeão). | único, repete (×N) | troféu no pedestal | taça lisa original com duas alças em forma de mãos (nunca formato de taça conhecida) | mistério |
| `V-EV-03` | **Copa no Quintal** | selo do professor/família | família/professor | 16 | Copa no quintal com a família (5 min); adulto confirma. | único | carimbo + voz | carimbo terracota com bola | mistério |
| `V-EV-04` | **Copa na Quadra** | selo do professor/família | família/professor | 16 | Plano 'Copa na quadra' feito pela turma; professor confirma. | único | carimbo + voz | carimbo azul-marinho com quadra | mistério |
| `S-EV-17` | **Gol de Letra** | selo | segredo | 20 | Na final, ler a frase escondida no placar antes de todos. | único | revela segredo | bola com letra no centro | oculto |

#### Feira de Leitura e Colheita · anual · jun–jul

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-18` | **Leitura na Feira** | selo | leitura | 6 | Feira de Leitura: ler 3/6/10 cartazes e histórias das barracas. | B·P·O | giro 3D | barraca de feira com livros | mistério |
| `S-EV-19` | **Barraca de Palavras** | selo | financeiro | 10 | Montar a barraquinha: ler preços e vender 5 itens de brincadeirinha. | B·P·O | giro 3D | barraca com etiquetas de preço | mistério |
| `S-EV-20` | **Colheita com Gratidão** | selo | valores e atitudes | 6 | Escolher e ler uma frase de agradecimento pela colheita. | único | giro 3D | cesta com milho e abóbora | mistério |
| `M-EV-03` | **Medalha da Feira de Leitura** | medalha | leitura | 6 | Concluir a Feira de Leitura (repete por edição). | único, repete (×N) | medalha com fita | livro aberto e espiga de milho | mistério |
| `T-EV-02` | **Troféu da Feira de Leitura** | troféu | leitura | 20 | Modo escola: ler um texto para a turma na feira; professor confirma. | único, repete (×N) | troféu no pedestal | troféu com livro e cesta de colheita | mistério |
| `V-EV-05` | **Feira em Família** | selo do professor/família | família/professor | 6 | Visitar com a família a feira (na tela ou na escola) e ler 3 cartazes juntos. | único | carimbo + voz | carimbo terracota com barraca | mistério |
| `S-EV-21` | **Barraca Escondida** | selo | segredo | 20 | Achar a barraca escondida da feira e ler o convite. | único | revela segredo | barraca pequena atrás de uma árvore | oculto |

#### Festival de Talentos · anual · set–out

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-22` | **Talento no Palco** | selo | leitura | 10 | Festival de Talentos: ler ou declamar um texto curto (gravado só no aparelho). | B·P·O | giro 3D | palco de madeira e microfone | mistério |
| `S-EV-23` | **Plateia Gentil** | selo | valores e atitudes | 10 | Aplaudir e escolher elogios prontos para 3 colegas. | único | giro 3D | mãos aplaudindo | mistério |
| `M-EV-04` | **Medalha do Festival de Talentos** | medalha | leitura | 10 | Participar do Festival de Talentos (repete por edição). | único, repete (×N) | medalha com fita | estrela e cortina no metal | mistério |
| `T-EV-03` | **Troféu do Festival de Talentos** | troféu | leitura | 20 | A turma apresenta junto (cada um do seu jeito); todos recebem o mesmo troféu. | único, repete (×N) | troféu no pedestal | troféu com cortina e estrela | mistério |
| `V-EV-06` | **Talento em Casa** | selo do professor/família | família/professor | 10 | Apresentar o talento para a família; adulto confirma. | único | carimbo + voz | carimbo terracota com palco | mistério |

#### Dia da Família e Mutirão da Vila · anual · data escolhida pela escola

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `V-EV-07` | **Dia da Família** | selo do professor/família | família/professor | 3 | Dia da Família: missão de 5 min com quem mora com a criança; adulto confirma. | único, repete (×N) | carimbo + voz | carimbo terracota com família de mãos dadas | mistério |
| `S-EV-24` | **Piquenique das Palavras** | selo | leitura | 8 | Ler a lista do piquenique e montar a cesta (5 itens). | único | giro 3D | toalha xadrez azul e branca e cesta | mistério |
| `T-EV-04` | **Troféu do Mutirão** | troféu | meio ambiente | 30 | Mutirão da Vila: ajudar a construção coletiva lendo a planta; todos recebem o mesmo troféu. | único, repete (×N) | troféu no pedestal | troféu com pa e muda de árvore | mistério |

#### Marcos do ano · anual · volta às aulas, férias, Dia das Crianças

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-25` | **De Volta a Vila** | selo | constância saudável | 20 | Volta às aulas: passar na revisão de boas-vindas do Jardim (nunca cobrança por ter parado). | único, repete (×N) | giro 3D | portão da vila aberto | mistério |
| `S-EV-26` | **Leitura de Férias** | selo | leitura | 20 | Férias: ler 3/6/10 livros da estante livre com a família. | B·P·O | giro 3D | chapéu de sol e livro | mistério |
| `S-EV-27` | **Brincadeiras do Dia das Crianças** | selo | esporte e fair play | 20 | Dia das Crianças: completar 3 brincadeiras antigas lendo as regras (pião, peteca, amarelinha). | único, repete (×N) | giro 3D | pião, peteca e giz | mistério |
| `S-EV-28` | **Um Ano Lendo** | selo | leitura | 52 | Aniversário de leitura: ler para a família o 'Livro do meu ano' (não conta tempo; conta a leitura). | único | giro 3D | bolo simples com livro em cima | mistério |

#### Formatura da Alfabetização · uma vez (fim da jornada) · fim do Ano 2

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `T-EV-05` | **Troféu da Formatura** | troféu | leitura | 104 | Formatura da alfabetização com a família; vai para o lugar de honra da estante. | único | troféu no pedestal | troféu grande com capelo e livro | mistério |
| `M-EV-05` | **Medalha da Formatura** | medalha | leitura | 104 | Recebida na cerimônia: desce com a fita e vai para a estante, ao lado do troféu (não fica no pescoço do avatar). | único | medalha com fita | capelo e livro com fita marinho e amarelo-ipê | mistério |
| `S-EV-29` | **Diploma de Leitura** | selo | leitura | 104 | Ler em voz alta o próprio diploma na formatura. | único | giro 3D | diploma enrolado com laço de fita lisa | mistério |
| `V-EV-08` | **Formatura em Família** | selo do professor/família | família/professor | 104 | A família grava (no aparelho) o parabéns da formatura; adulto confirma. | único | carimbo + voz | carimbo terracota com capelo | mistério |

#### Natal (opcional por escola) · anual, só se a escola ativar · dezembro

| Código | Nome | Tipo | Categoria | Sem. | Como ganhar (critério observável) | Níveis | Animação | Arte 3D (motivo) | Antes de ganhar |
|---|---|---|---|---|---|---|---|---|---|
| `S-EV-30` | **Cartão de Natal** | selo | valores e atitudes | 14 | Só se a escola ativar: ler e escrever um cartão de gratidão para alguém. | único | giro 3D | cartão com estrela de Natal lisa amarelo-ipê | mistério |
| `S-EV-31` | **Natal Solidário** | selo | valores e atitudes | 40 | Só se a escola ativar: contribuir com o projeto coletivo de Natal da vila (doação de moedinhas ou missão lida). | único | giro 3D | caixa de doação de madeira com estrela | mistério |

---

## 5. Família gerada: Maestria do Som (selos infinitos de revisão)

Um selo por correspondência grafema-fonema (ou padrão) da sequência fônica. **Mesmo critério para todos**, ligado ao domínio do doc. mestre §4.5:

- Bronze: domínio prático (P>=0,95, >=8 tentativas em >=2 sessões, 4 das 5 últimas certas com >=2 pseudopalavras). Prata: generalização com item novo + transferência fora do formato. Ouro: retenção 24 h–7 d + ler uma história com o som. Diamante: ouro + retenção após 60 dias + validação do professor ou da família. Depois: 1 estrela a cada revisão de longo prazo bem-sucedida (sem fim).
- Animação: giro 3D; a moldura troca de metal a cada nível. Arte: letra de madeira no centro + boca do Espelho do Som em perfil, nas cores da região.
- **Por que é infinito:** depois do diamante, cada revisão de longo prazo bem-sucedida (Jardim da Revisão, intervalos de 32–60+ dias) acrescenta **uma estrela** ao selo (Maestria do Som M ★3). Quem mantém, sempre tem um próximo degrau.

| Região | Semana de liberação | Selos gerados ("Maestria do Som …") | Qtd |
|---|---|---|---|
| R1 | 4 | A, E (é/ê), I, O (ó/ô), U | 5 |
| R2a | 7 | M, L, F | 3 |
| R2b | 12 | V, S inicial, N | 3 |
| R3 | 19 | P, T, B, D | 4 |
| R4 | 29 | J, Z, CH, X (som de CH), NH, LH | 6 |
| R5 | 40 | C/QU, G/GU, CE/CI, GE/GI, R forte (R/RR), R entre vogais, SS, Ç | 8 |
| R6 | 51 | Ã, AM/AN, EM/EN, IM/IN, OM/ON, UM/UN, ÃO | 7 |
| R7 | 62 | R final, S final, L final, Ditongos | 4 |
| R8 | 75 | PR, BR, TR, DR, CR, GR, FR, VR, PL, BL, CL, GL, FL | 13 |
| R9 | 86 | H inicial, X (vários sons), S com som de Z | 3 |
| **Total** | | | **56** (× 4 níveis = 224 degraus, + estrelas sem fim) |

**Estrelas de fase** (também geradas, fora do JSON): cada uma das 89 fases da tabela-mestre dá até 3 estrelas (1: domínio prático; 2: transferência fora do formato; 3: retenção de 7 dias). São 267 estrelas possíveis, mostradas no mapa e na tela Minhas Conquistas da fase; não contam como selo.


---

## 6. Escadas de patentes por área (D023)

Oito degraus neutros por área (**Aprendiz → Ajudante → Sentinela → Guarda → Guia → Especialista → Líder → Lenda**), cada um com I, II e III; Lenda ganha estrelas sem fim. A criança sobe somando **degraus de conquistas da área** (cada bronze, prata, ouro, diamante ou conquista única conta 1; cada edição de evento semanal ou mensal da área também conta 1). Cada degrau tem um **portão de domínio**: precisa de pelo menos 1 conquista nova da área ganha numa região indicada, por isso o alto escalão (Líder e Lenda) só chega no fim do Ano 2. Os limiares foram calculados a partir do próprio catálogo: cerca de 40% dos degraus da área já liberados na semana-alvo. Áreas e categorias: Sons = fonema, sílaba e Maestria do Som; Escrita = palavra, ditados e criação; Leitura = leitura e compreensão; Natureza = meio ambiente; Esporte e Fair Play; Amizade e Respeito = valores e emocional; Dinheiro = financeiro; Tecnologia = pensamento computacional e tecnologia; Ciências, Cidadania e Artes = conhecimento de base (D017), separados pelo tema. Família/professor, constância, colecionador, segredos e títulos não entram em escada (contam para o Álbum e os títulos da jornada).

| Área | Aprendiz | Ajudante | Sentinela | Guarda | Guia | Especialista | Líder | Lenda |
|---|---|---|---|---|---|---|---|---|
| **Leitura** (`P-LEITURA-1…8`) | 3/5/7 · s2 | 9/12/15 · s8 | 18/20/23 · s18 | 25/28/31 · s32 | 34/36/38 · s50 | 40/43/46 · s68 | 49/54/58 · s86 | 69/73/77 · s100 |
| **Escrita** (`P-ESCRITA-1…8`) | 3/4/5 · s2 | 6/8/9 · s8 | 11/12/13 · s18 | 14/15/17 · s32 | 18/20/22 · s50 | 24/26/28 · s68 | 30/34/39 · s86 | 44/48/52 · s100 |
| **Sons** (`P-SONS-1…8`) | 3/15/26 · s2 | 38/41/45 · s8 | 48/56/64 · s18 | 72/79/87 · s32 | 94/101/108 · s50 | 115/125/135 · s68 | 145/152/160 · s86 | 167/171/175 · s100 |
| **Natureza** (`P-NATUREZA-1…8`) | 3/4/6 · s2 | 7/8/9 · s8 | 10/11/12 · s18 | 13/14/15 · s32 | 16/17/18 · s50 | 19/20/21 · s68 | 22/23/24 · s86 | 25/29/33 · s100 |
| **Esporte e Fair Play** (`P-ESPORTE-1…8`) | 3/4/6 · s2 | 7/9/10 · s8 | 12/13/15 · s18 | 16/17/19 · s32 | 20/22/23 · s50 | 25/26/28 · s68 | 29/33/36 · s86 | 40/44/48 · s100 |
| **Amizade e Respeito** (`P-AMIZADE-1…8`) | 3/5/6 · s2 | 8/11/14 · s8 | 17/19/20 · s18 | 22/23/25 · s32 | 26/28/30 · s50 | 32/33/34 · s68 | 35/37/39 · s86 | 42/46/50 · s100 |
| **Dinheiro** (`P-DINHEIRO-1…8`) | 3/4/5 · s2 | 6/7/8 · s8 | 9/10/11 · s18 | 12/13/14 · s32 | 15/16/17 · s50 | 18/19/20 · s68 | 21/22/23 · s86 | 24/28/32 · s100 |
| **Ciências** (`P-CIENCIAS-1…8`) | 3/4/5 · s2 | 6/7/8 · s8 | 9/10/11 · s18 | 12/13/14 · s32 | 15/16/17 · s50 | 18/19/20 · s68 | 21/22/23 · s86 | 24/28/32 · s100 |
| **Tecnologia** (`P-TECNOLOGIA-1…8`) | 3/4/5 · s2 | 6/7/8 · s8 | 9/11/12 · s18 | 14/15/16 · s32 | 17/19/20 · s50 | 22/23/24 · s68 | 25/27/29 · s86 | 31/35/39 · s100 |
| **Cidadania** (`P-CIDADANIA-1…8`) | 3/4/5 · s2 | 6/7/8 · s8 | 9/10/11 · s18 | 12/13/14 · s32 | 15/16/17 · s50 | 18/19/20 · s68 | 21/22/23 · s86 | 24/28/32 · s100 |
| **Artes** (`P-ARTES-1…8`) | 3/4/5 · s2 | 6/7/8 · s8 | 9/10/11 · s18 | 12/13/14 · s32 | 15/16/17 · s50 | 18/19/20 · s68 | 21/22/23 · s86 | 24/28/32 · s100 |

Célula = degraus para I / II / III · semana em que a patente aparece no Álbum (Aprendiz e Ajudante visíveis; do Sentinela em diante, mistério com a dica). Portões: Ajudante R1+, Sentinela R2b+, Guarda R3+, Guia R5+, Especialista R7+, Líder R9+, Lenda R10 (ou eventos do Ano 2) com validação do professor ou da família. Exemplo de critério completo (`P-NATUREZA-3`): Somar 10 / 11 / 12 degraus de conquistas da área Natureza (cada bronze, prata, ouro, diamante ou único conta 1) para os degraus I / II / III. Portão de domínio: pelo menos 1 conquista nova da área ganha em R2b ou depois. Cada edição concluída de um evento semanal ou mensal da área também soma 1 degrau, para a escada nunca travar.

**Brasão por degrau** (arte, ver [prompts-arte.md](prompts-arte.md)): Aprendiz madeira clara → Ajudante madeira escura com friso de bronze → Sentinela bronze → Guarda bronze e prata → Guia prata com faixa azul-marinho → Especialista prata e ouro → Líder ouro com relevo → Lenda cristal azul-gelo sobre base de ouro, com estrelas. O símbolo central é o da área (livro, lápis, boca do Espelho do Som, folha e gota, bola e aperto de mão, mãos dadas, cofrinho-tatu, lupa, engrenagem, coreto, nota musical e pincel). Frase: "Parabéns, [NOME]! Agora você é **Sentinela da Natureza II**!"

