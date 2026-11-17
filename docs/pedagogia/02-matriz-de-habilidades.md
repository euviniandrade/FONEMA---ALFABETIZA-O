# 02 · Matriz de habilidades

Siglas e páginas: ver [README](README.md). **[DP]** = decisão do projeto.

## 1. Como ler

- **ID** é o identificador estável desta documentação (não muda quando o texto muda).
- **No código** é o `id` que já existe em `app/packages/conteudo/src/habilidades.ts` (para não criar nomes paralelos). Quando está
  escrito "a criar", o nome sugerido segue o padrão que o código já usa (`gpc-<letra>`, `leitura-…`, `escrita-…`).
- **Atividades**: nomes do catálogo em [04](04-tipos-de-atividade.md).
- **Critério de domínio**: todos os critérios numéricos são **[DP]**. Os materiais não dão número de domínio (VT: "não encontrado";
  o único número é 95% de precisão como leitura independente, VT-PE p. 31, e ≥ 95% antes do treino de fluência, ABC p. 375–376).
  O ponto de partida é o que o motor já faz (`app/packages/motor/src/dominio.ts`): firmeza ≥ 0,95, ao menos 8 tentativas em ao menos
  2 sessões, 4 das últimas 5 certas sem ajuda e, em leitura, 2 palavras inventadas certas.
- **Regra geral [DP]:** só entram na conta tentativas em que a criança **respondeu algo que pode estar errado**. Ver, ouvir, tocar em
  "Já conheci!", "Eu fiz o som!" e "Eu falei!" não contam (DIAG §4).

## 2. Eixo 1 — Consciência fonológica (escuta; jogos livres)

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| CF-PAL-01 | a criar (`palavra-frase`) | conta as palavras de uma frase curta ouvida | — | Contar palavras (MP p. 10–12; VT-PE p. 54, 96) | 4 de 5 em 2 dias | toque por palavra, conferido |
| CF-SIL-01 | `silaba` | separa e conta as sílabas (palmas) | — | Palmas (MP p. 19–23; MOR p. 160–161; SOA p. 85–86) | 4 de 5 em 2 dias | número de palmas conferido |
| CF-SIL-02 | `nome-silabas` | bate as sílabas do próprio nome | CF-SIL-01 | Palmas no nome (ABC p. 126) | 2 acertos em 2 dias | idem |
| CF-SIL-03 | a criar (`palavra-maior`) | diz qual de duas palavras é maior | CF-SIL-01 | Batalha de palavras (MOR p. 141, 149, 192) | 4 de 5 | escolha entre 2 figuras |
| CF-SIL-04 | a criar (`silaba-inicial`) | acha palavras que começam com a mesma sílaba | CF-SIL-01 | Barquinho, intruso, bingo (MOR p. 139, 189, 192–193; SOA p. 80–82) | 4 de 5, com 3 opções | escolha |
| CF-SIL-05 | `sintese` (parte silábica) | junta sílabas ouvidas e descobre a palavra | CF-SIL-01 | Fala de tatu (ABC p. 257–259) | 4 de 5 | escolha entre 3 figuras |
| CF-RIM-01 | `rima` | reconhece palavras que rimam | CF-SIL-01 | Rimas e intruso (MOR p. 191–192, 204–205; MP p. 24–27; VT-PE p. 85) | 4 de 5, com 3 opções | escolha |
| CF-RIM-02 | a criar (`rima-produzir`) | diz uma palavra que rima | CF-RIM-01 | Produzir rima (MOR p. 129–130; VT-PE p. 85) | não entra em domínio automático | adulto marca ("Mostra pro professor") |
| CF-PDP-01 | a criar (`palavra-dentro`) | acha a palavra escondida dentro de outra | CF-SIL-01 | Palavra dentro de palavra (MOR p. 196, 200, 203) | 4 de 5 | escolha |

Ordem: identificar antes de produzir; sílaba e rima antes de fonema (MOR p. 131–132). Em português a aliteração é mais fácil que a rima (MOR p. 51).

## 3. Eixo 2 — Consciência fonêmica

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| CFN-INI-01 | `som-inicial` | acha o primeiro som de uma palavra ouvida | CF-SIL-01 | Som inicial com figuras (ABC p. 257, 354; VT-PE p. 50; MOR p. 130) | 4 das últimas 5, 3 opções, 2 sessões | escolha; guarda a opção errada |
| CFN-INI-02 | `som-do-nome` | sabe o primeiro som do próprio nome | CFN-INI-01 | Primeiro som do nome (ABC p. 126) | 2 acertos em 2 dias | escolha |
| CFN-FIM-01 | a criar (`som-final`) | acha o último som | CFN-INI-01 | Som final (VT-PE p. 51) | 4 de 5 | escolha |
| CFN-MEI-01 | a criar (`som-medial`) | acha o som do meio | CFN-FIM-01 | Onde está o som (VT-1A p. 202) | 4 de 5 | escolha |
| CFN-PAR-01 | a criar (`par-minimo-<a>-<b>`) | ouve a diferença entre sons parecidos (p/b, t/d, f/v, c/g, s/z, x/j, m/n, é/ê, ó/ô) | os dois sons ensinados | Pares mínimos (MOR p. 214; SOA p. 147; VT-PE p. 53–54) | 8 de 10 em cada par | escolha entre 2 palavras escritas ou figuras; guarda qual par errou |
| CFN-SIN-01 | `sintese` (parte fonêmica) | junta sons ditos devagar e descobre a palavra | CFN-INI-01 + letras da unidade | Síntese com som prolongado (ABC p. 327, 331–332, 354) | 4 de 5, 3 opções | escolha ou fala conferida por adulto |
| CFN-SEG-01 | a criar (`segmentacao`) | separa a palavra em sons | CFN-SIN-01 | Caixas de sons (ABC p. 332–333, 335; MP p. 36–37, 40) | 4 de 5 palavras de 2 a 4 sons | número de fichas e letra em cada caixa |
| CFN-MAN-01 | a criar (`troca-de-som`) | tira, põe ou troca um som e diz a palavra nova | CFN-SEG-01 | Troca-letras, mais-uma-letra (ABC p. 354–356; MOR p. 212; SOA p. 126–130) | 4 de 5 | montagem conferida |

`o-aberto-fechado` (já existe) é um caso de CFN-PAR-01 (ó × ô). O par é × ê entra do mesmo jeito.

Divergência: Morais e Soares não trabalham síntese, segmentação nem troca de fonemas (MOR nota 40, p. 259; SOA p. 121, 125); Morais
também exclui o som do meio e do fim (MOR nota 42, p. 260). No app elas existem, sempre com letras (ABC p. 352–353; MP p. 8), e os
dados de Morais (segmentar fonemas: 12–14% de acerto no 1º ano, MOR p. 81) servem de aviso: são difíceis e não devem travar a trilha
sozinhas **[DP]**.

## 4. Eixo 3 — Relação fonema-grafema

Uma habilidade por unidade da trilha fônica ([01](01-escopo-e-sequencia.md)). Cada uma tem **dois sentidos**, medidos separadamente **[DP]**:
ouvir o som e achar a letra (som → letra) e ver a letra e dizer ou escolher o som (letra → som).

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| FG-V-01 a 05 | `vogal-a`, `vogal-e`, `vogal-i`, `vogal-o`, `vogal-u` | liga cada vogal ao seu som | CFN-INI-01 | Som → letra; letra → som | 4 das últimas 5 em cada sentido, 2 sessões | escolha com 3 ou 4 opções; distratores incluem a vogal mais parecida |
| FG-V-06 | `vogais` | reconhece as 5 vogais misturadas | FG-V-01 a 05 | idem | 8 de 10 | idem |
| FG-C-xx | `gpc-m`, `gpc-l`, `gpc-f` (existem); `gpc-<letra>` a criar para as demais | liga a consoante da unidade ao seu som | unidade anterior | Som → letra; letra → som; completar a letra que falta (ABC p. 330–331; VT-1A p. 78; SOA p. 126–130) | idem FG-V | idem; depois do 1º contato, os distratores **incluem o par confundível** (p/b, t/d, f/v…) |
| FG-AB-01 | `o-aberto-fechado`, `e-aberto-fechado` (TF-23); `regra-vogal-aberta` (TF-24, E/O abertos sem acento e ê/ô) | lê é/ê e ó/ô | Bloco 3 | Pares (vovó × vovô); qual acento falta (VOV_) | 8 de 10 | escolha |
| FG-NAS-01 a 05 | `gpc-nasal-a` … `gpc-nasal-u`; `regra-m-n` (TF-30) | lê e escreve as vogais nasais | TF-24 | Unidades TF-25 a TF-30 | idem FG-V | idem |
| FG-DIG-xx | a criar (`gpc-lh`, `gpc-nh`, `gpc-ch`, `gpc-rr`, `gpc-ss`, `gpc-qu`, `gpc-gu`) | lê o dígrafo como um som só | unidade anterior | idem | idem | idem |
| FG-CTX-xx | `regra-vogal-final`, `regra-ti-di`, `regra-m-n`, `regra-r` (R fraco, TF-32) e `gpc-r` (R do começo, TF-31) existem; a criar `regra-c`, `regra-g`, `regra-s`, `regra-l-final` | aplica a regra de posição | letras envolvidas | Comparar pares (MURO × MURRO; SOA p. 154–155), cruzadinhas CA/QUE/CE (MOR p. 212) | 8 de 10, com palavras novas | leitura e escrita de pares |
| LET-xx | `letra-a` … `letra-z` (existem, Trilha A–Z) | conhece nome, forma e traçado da letra | — | Letra, Traçar, Ouça e toque na letra | **não libera leitura**; conclui por participação (como hoje) | — |

Importante: `letra-<x>` (Trilha A–Z) e `gpc-<x>` (trilha fônica) são habilidades **diferentes**. Dominar `letra-b` não prova que a
criança liga B ao som /b/ (DIAG §2: hoje o estímulo é o nome da letra).

## 5. Eixos 4, 5 e 6 — Síntese, segmentação e decodificação com letras

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| SIN-CV-01 | `silaba-cv` | junta consoante + vogal escritas e diz a sílaba | 1 consoante + vogais | Síntese com som prolongado; Montar por letras sem modelo | 4 das últimas 5 | escolha da sílaba ouvida ou fala conferida |
| DEC-PAL-01 | `leitura-cvcv` | lê palavras de sílabas simples com as letras ensinadas | SIN-CV-01 | Ler e tocar a figura; "Dizer a palavra" (ABC p. 331–332) | critério do motor **com** 2 palavras inventadas, 3 opções ou mais | escolha; distratores trocam 1 letra |
| DEC-PSE-01 | (dentro de `leitura-…`, campo `pseudo`) | lê palavras inventadas | DEC-PAL-01 | Palavras inventadas (ABC p. 333; VT-1A p. 62, 78) | 2 certas **por resposta conferida**, não por "Eu falei!" | escolha entre figuras-som ou microfone/adulto |
| DEC-PAL-02 | a criar (`leitura-cvc`) | lê palavras com fim de sílaba em consoante (sol, mar, pasta) | TF-33, TF-49, TF-50 | idem | idem | idem |
| DEC-PAL-03 | a criar (`leitura-ccv`) | lê palavras com encontros (prato, flor) | Bloco 8 | idem; mais-uma-letra | idem | idem |
| DEC-FRA-01 | a criar (`leitura-frase`) | lê frase decodificável e mostra que entendeu | DEC-PAL-01 | Frase → figura (VT-1A p. 148; SOA p. 197–200) | 4 de 5 frases novas | escolha entre 3 figuras |
| DEC-TXT-01 | a criar (`leitura-texto`) | lê texto curto decodificável | DEC-FRA-01 | Texto + perguntas | ver COMP-LEI-01 | perguntas |

## 6. Eixo 7 — Escrita

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| ESC-TRA-01 | (parte de `letra-<x>`) | traça a letra na ordem e direção certas | — | Traçar (ABC p. 434–435; VT-PE p. 52) | não entra em domínio de leitura | ordem, direção e cobertura do traço |
| ESC-PAL-01 | `escrita-cvcv` | escreve palavra ditada com letras móveis, sem modelo | DEC-PAL-01 | Ditado com correção ativa (ABC p. 515; VT-1A p. 158) | 4 das últimas 5 palavras certas na 1ª tentativa | letra por letra; guarda cada troca |
| ESC-PAL-02 | a criar (`escrita-regras`) | escreve palavras com regra de posição | FG-CTX | Ditado; completar a letra que falta | 8 de 10 | idem |
| ESC-FRA-01 | a criar (`escrita-frase`) | escreve frase ditada | ESC-PAL-01 | Ditado de frases (VT-1A p. 165–169) | 3 de 4 frases | idem |
| ESC-PRO-01 | a criar (`escrita-propria`) | escreve do seu jeito e compara com a forma certa | FG de ao menos 5 letras | Escrita própria com confronto (ABC p. 262, 421–423; SOA p. 122–123) | não entra em domínio; mostra o nível | o que escreveu fica guardado para o adulto |

## 7. Eixo 8 — Fluência

Só depois de decodificar com precisão (≥ 95%; ABC p. 375–376).

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| FLU-PAL-01 | a criar (`fluencia-palavras`) | lê lista de palavras conhecidas sem soletrar | DEC-PAL-01 | Releitura de listas (VT-1A p. 197, 202) | tempo por palavra cai entre sessões, com precisão mantida | tempo de resposta + acerto |
| FLU-TXT-01 | a criar (`fluencia-texto`) | lê texto curto com ritmo | DEC-TXT-01 | Leitura em eco e repetida (SOA p. 246–248; ABC p. 375–376) | palavras certas em 60 s, acompanhadas no tempo (VT-1A p. 167) | microfone ou adulto; sem meta numérica (ver 06 §6) |

## 8. Eixo 9 — Compreensão e vocabulário

| ID | No código | A criança… | Pré | Atividades | Critério de domínio [DP] | Como se mede |
|---|---|---|---|---|---|---|
| COMP-OUV-01 | a criar (`compreensao-ouvida`) | responde sobre uma história ouvida | — | Perguntas de compreensão (VT-PE p. 41, 83; SOA p. 232–246; ABC p. 397–398) | acompanhamento, sem travar fase | perguntas literais e de dedução, 3 opções |
| COMP-LEI-01 | a criar (`compreensao-lida`) | responde sobre o que leu sozinha | DEC-FRA-01 | idem, com texto decodificável (VT-1A p. 167) | 3 de 4 perguntas em 2 textos novos | idem |
| VOC-01 | a criar (`vocabulario`) | usa palavras novas das histórias | — | Três palavras por história (VT-PE p. 48, 92; ABC p. 230–233; SOA p. 237–240) | acompanhamento | escolha de figura ou de frase |

## 9. Pré-requisitos em uma linha

Escuta (CF) → som inicial (CFN-INI) → vogais (FG-V) → primeira consoante (FG-C) + juntar (SIN-CV) → ler e escrever palavras
(DEC-PAL, ESC-PAL) → novas letras, uma a uma, sempre voltando a ler e escrever → frases → textos → fluência. Compreensão ouvida e
vocabulário correm ao lado desde o início (SOA p. 27; ABC p. 286–289).
