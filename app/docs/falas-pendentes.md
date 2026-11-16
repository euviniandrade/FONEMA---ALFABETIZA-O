# Falas pendentes de voz

Atualizado em 2026-11-15, depois da rodada de vozes da D030 (mecânicas fônicas, falas das telas, boneco, dicas dos cadeados e regravações).
Vozes: Sofia (`eleven_multilingual_v2`) e Tales (`eleven_v3`). Gerador: `scripts/gerar-vozes.ts`; auditoria: `ferramentas/auditar-audio.py`
(relatório em `docs/auditoria-audio.md`).

**Situação:** todas as falas fixas listadas em `packages/conteudo/src/falas.json` (851 falas, 974 clipes no ar) têm clipe. O que segue
abaixo é o que **continua sem voz ou com voz ruim**, para a próxima recarga ou para gravação por pessoa.

**16/11 (Cantinho da Leitura e Brincar com sons):** 144 clipes novos, 4.904 caracteres enviados — as 2 histórias (narração, perguntas,
vocabulário), os 3 textos decodificáveis (frases e texto corrido para o coro), as perguntas, as molduras de fluência, eco/coro, escrita
própria e jogos de escuta, os nomes de figuras novas (luva, girassol, poça, besouro, piquenique…). Entraram junto as falas pendentes da
revisão de 16/11 ("Monte a palavra som por som…", "Cada peça faz um som.", "O macaco viu a jaca.", "O que o macaco viu?"). Nada do
Cantinho ficou sem voz. Masterizado e auditado (ver `docs/auditoria-audio.md`).

## 1. Sem clipe (a tela fica em silêncio e o texto aparece no balão)

| O quê | Onde aparece | Por que não foi gerado |
|---|---|---|
| Palavras-exemplo `olho` e `unha` | Tela da letra O e da letra U (ficam só escritas: `PALAVRAS_SEM_VOZ` em `alfabeto.ts`) | Regravadas 3 vezes; a auditoria ainda ouve "óleo" e "punga" |
| Sequências de sons "MMMM… eeee… llll", "LLLL… uuuu… aaaa", "SSSS… oooo… llll" | Síntese de fonemas (R0/R2a) | A voz sintética não faz sons isolados em sequência; quando os três sons existem em `public/audio/sons`, o app toca os clipes de som |
| Sons puros do R fraco (/ɾ/), LH (/ʎ/) e NH (/ɲ/) | Peças do Montar (R entre vogais fica calado), dígrafos futuros | Reprovados em `docs/auditoria-sons-letras.md`; pedem gravação no Estúdio de sons |
| "Faltam [N] moedinhas para: [ITEM]. Quer juntar?" (`FALAS.lojinhaFalta`) | Lojinha | Frase montada com número e nome do item: precisa de um clipe por combinação ou de frase nova sem variáveis |
| Sílabas do nome da criança nas palmas | Missão do nome (R0) | Uma gravação por nome; só os 145 nomes comuns têm o nome inteiro gravado |
| Nome da criança fora da lista de 145 nomes comuns | Todas as falas com [NOME] | A fala toca sem o nome (o nome fica escrito) |
| "Quantos sons tem a palavra? Escuta comigo." (Sofia) | Placa dos pedacinhos de som da sondagem periódica (`Sondagem.tsx`) | Fala nova de 15/11; até ter voz, o exemplo com os sons puros (l-u-a acendendo bolinhas) mostra a ideia |
| Resumo do termômetro lido em voz alta | Área do adulto | Texto montado na hora (é tela de adulto) |
| "Agora as vogais vão mostrar os outros sons delas!" (Sofia) | Gancho da Festa do Alfabeto (`FALAS_ALFABETO.festaGancho`) | D031 (16/11): depois da Festa vêm é/ê e ó/ô, não mais as sílabas; a fala antiga ("Agora a gente vai juntar as letras e fazer sílabas!") continua gravada e saiu de uso. Texto novo; **voz gerada em 16/11** (auditada, ninguém ouviu) |
| "Faltam só algumas letras para a Festa do Alfabeto!" e "Agora as vogais vão mostrar os outros sons delas!" | `ganchoProxima` das regiões TF e AL (`regioes.ts`) | D031: texto ajustado à ordem alternada. Hoje nenhuma tela fala esses ganchos; se passarem a ser falados, precisam de voz |

## 1b. Falas gravadas que dizem "sílaba" como peça de leitura (regra 6; registradas em 16/11, NADA regravado)

Na revisão da regra 6 os **títulos** da fase antiga R2a-F04 mudaram ("Juntar sílabas: primeiras palavras" → "Juntar sons: primeiras
palavras"; cena "Ponte das Sílabas" → "Ponte das Palavras"). As falas abaixo já têm clipe e continuam como estão; ficam aqui para a
próxima rodada de voz ou para decisão do dono.

| Voz | Fala gravada | Onde | Sugestão |
|---|---|---|---|
| Sofia | "Juntar sílabas: primeiras palavras. Ler sozinho as primeiras palavras (MALA, LUA, FALA)." | Entrada da fase R2a-F04 (era "título. objetivo.") | Saiu de uso: a entrada agora fala a acolhida já gravada ("Oi, [NOME]! Hoje você vai ler uma palavra inteirinha."), que se repete ao começar a missão. Gravar "Juntar sons: primeiras palavras. Ler sozinho as primeiras palavras (MALA, LUA, FALA)." e tirar o `falaEntrada` de `fases/r2a.ts` |
| Tales | "A cachoeira tem pedras com sílabas… Amanhã a gente atravessa!" | Gancho de R2a-F04 | "A cachoeira tem pedras com palavras…" |
| Sofia | "A cachoeira tem pedras com sílabas, [NOME]. Uma pedra de cada vez." | Acolhida do chefe R2a-F05 | "…pedras com palavras…" (as pedras são palavras lidas letra por letra) |
| Tales | "Gooool! Você leu!" | R2a-F04-C4b "Futebol de Sílabas" (montar por sílaba = exposição) | Nessa cena a criança monta por sílaba, não lê: "Gooool! Você montou!" |
| Sofia | "Montar sílabas na tábua" | Dica do selo S-R2a-04 | Decisão do dono (selos, D022) |
| Sofia | "Chefe: Cachoeira das Sílabas…", "Atravessar/Vencer a Cachoeira das Sílabas" | Chefe R2a-F05, selos e título do nível 16 | Nome de título/selo (D022): **não mudado**; sugestão ao dono |

## 2. Com clipe, mas a auditoria pede regravação ou conferência de ouvido

| Voz | Fala | O que a transcrição ouviu | Situação |
|---|---|---|---|
| Sofia | "Como o Tales ficou no fim?", "A ema foi na lama.", "Monte a palavra som por som," | "[som de carro]" / "[som de transição]" | 16/11: só o Scribe transcreveu; duração e volume normais. Provável erro do transcritor; conferir de ouvido |
| Sofia | "A ema sai suja, suja!" | "Aê, mas sai suja, suja?" | 16/11: "ema" é palavra rara para o transcritor; conferir de ouvido |
| Sofia/Tales | "Dividir.", "Poça." | "Divigil", "Pode, sá?" / "Possa" | 16/11: palavra solta; conferir de ouvido |
| Sofia | "U ou O," (antes do nome, em "U ou O, [NOME]? Olha minha boca.") | "U? Ô" | 4 versões; continua sem o "ou" claro |
| Sofia | "O D tem voz:" | "O detém voz" | Provável engano da transcrição; conferir de ouvido |
| Sofia | "Os sons /é/ e /ê/ da letra E" e "Ouvir a diferença entre é e ê" (dicas de cadeado) | "os sons E e I", "a diferença entre e" | A voz sintética não separa bem é × ê em frase |
| Tales | "Olha a Lojinha! A cada letra abrem coisas novas para o seu boneco." | "Olhe a lojinha…" | Diferença pequena; conferir de ouvido |
| Sofia | Pseudopalavras `folu`, `lufo`, `fuli`, `fulu`, `fali` e a palavra `FOFA` (maiúscula) | "follow", "lofo", "foli", jingle, "fale", "fafa" | Não são usadas em atividade conferida (as atividades usam `lifu`, `mifa`, `mufa`, `lifa`, `fofa`, aprovadas) |
| Sofia e Tales | Sílabas e sons curtos (`bo`, `co`, `lo`, `mo`, `pe`, `po`, `te`, `tá`, `ja`, `gá`, vogais esticadas) e palavras curtas (`ilha`, `rei`, `iglu`, `bife`, `mapa`, `babá`, `cama`, `sol`, `avião` e `peteca` do Tales) | transcrições sem sentido | Clipe curto demais para a transcrição automática decidir: **precisam ser ouvidos por pessoa** (72 clipes "a conferir" no relatório) |
| Sofia | Falas com som entre barras lidas como "F, de foca" ("Tenho um fio que faz /ffff/!", "llll", "nnnn", "vvvv", "xxxx", "rrrrá") | "F de foca", "L de lua"… | É o texto enviado de propósito (a voz sintética não faz o som puro); no app, o som isolado toca pelo clipe de `public/audio/sons` |

A lista completa, com medidas de cada clipe, está em `docs/auditoria-audio.md` (graves e "a conferir").

## 3. O que só pessoa resolve

- **Nenhum som puro das letras foi ouvido por pessoa.** Os das oclusivas (p, b, t, d, c/k, g) e os de L, V, J e R forte estão como
  "duvidoso" nas medidas. Eles agora são o estímulo principal das atividades de som: a validação por fonoaudióloga ficou mais urgente.
- As frases de correção por par dizem o nome da letra ("O P não tem voz:"): conferir se a voz sintética fala "pê", "bê", "tê"… com clareza.

## 4. Saldo

Rodada de 15/11: 2.330 caracteres gastos (de 116.029 para 118.359 usados, de 131.000). **Saldo: 12.641 caracteres.** Sobrou porque
todas as falas fixas do conteúdo já têm clipe; o que falta acima não se resolve gerando de novo com a mesma voz.

## 4. Trilha dos Sons (D030, 15/11)

Gerado nesta rodada: 231 clipes da Sofia (frases-moldura da trilha, palavras soltas, palavras inventadas e as leituras
erradas que aparecem como opção, 9 frases e 7 perguntas). Nenhuma fala nova do Tales (as molduras são todas da Sofia; a
voz do Tales entra nos clipes que já existiam: faz de conta, "Repita comigo!", "Ouça e toque na letra.").

O que continua sem voz própria ou pede escuta humana:
- **Palavras inventadas e leituras erradas** (amu, umi, fami, lagu, tifa, dimu… e "fazio", "movo", "mave", "poi"): a
  voz sintética pode pôr a força na sílaba errada ou ler "ti" como "te". Precisam ser ouvidas por pessoa antes de valerem
  como leitura certa; o ideal é gravar no Estúdio de sons.
- **"tia", "dia", "tomate", "bate", "leite"**: a voz da Sofia usa um jeito só de falar (TI = "tchi"). As duas pronúncias
  valem (docs/pedagogia/03 §4), mas só uma está gravada.
- **Sons emendados ("mmmaaalll…")**: não são voz da dupla; o app emenda os clipes de som de `public/audio/sons` (ou as
  gravações do Estúdio). Os sons de estouro, L, V e J continuam "duvidosos" (ninguém ouviu).

**Conferir de ouvido (16/11):** a leitura "Voa." (par mínimo zoa × soa × voa, TF-14) foi transcrita como "Vou, ah?" e a auditoria
aceitou; se soar como "vou", regravar (ajustes.json).
