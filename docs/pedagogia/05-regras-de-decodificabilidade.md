# 05 · Regras de decodificabilidade

Siglas e páginas: ver [README](README.md). **[DP]** = decisão do projeto.

## 1. O que é e por que existe

Uma palavra é **decodificável numa fase** quando a criança consegue lê-la usando só o que já lhe foi ensinado até ali.
- Textos para ler sozinha devem trazer os padrões já ensinados: "primeiro apenas decodificáveis e, pouco depois" variados (ABC p. 334–335);
  textos iniciais com palavras regulares e grafemas simples e frequentes (ABC p. 376); livros com "controle progressivo" para leitura
  independente (SOA p. 230).
- Posição contrária, registrada: Soares rejeita "frases artificiais apenas para prática" (SOA p. 290) e Morais só propõe textos reais
  (MOR p. 149–186). Por isso a regra vale **só para o que a criança lê ou escreve sozinha**; o que ela ouve é livre (D030 §3).

## 2. A regra central: valores sonoros, não só letras

Não basta a letra já ter sido apresentada. Cada letra da palavra precisa estar sendo usada com um **valor sonoro já ensinado, naquela
posição**. O verificador atual só confere letras por região e libera as 26 no Alfabeto (DIAG §4); foi assim que passaram BIFE, DADO,
BOLA, PEIXE e BANANA, que usam sons ainda não ensinados.

Exemplo: "gato" e "gelo" usam a letra G, mas com valores diferentes (TF-21 e TF-44). "sapo" e "casa" usam S com valores diferentes
(TF-11 e TF-47).

## 3. Quando cada coisa pode aparecer

| Onde aparece | Regra | Fonte ou [DP] |
|---|---|---|
| Palavra para **ler** (ler e tocar, síntese, frase, texto) | Todos os valores sonoros ensinados em unidade já **concluída** | ABC p. 334–335 |
| Palavra para **escrever** (ditado, caixas de sons, completar) | Idem, e sem escolha de letra que não tenha regra, até a unidade que trata dela (ex.: /s/ de "cedo" antes de TF-45) | ABC p. 417; SOA p. 160 |
| Palavra **inventada** | Só letras e valores ensinados; sílabas que existem no português; não pode ser palavra real nem parecer palavrão | ABC p. 333; **[DP]** |
| Palavra só **ouvida** (figura, rima, som inicial, história) | Livre. Mas o **som-alvo** precisa estar na posição pedida e com o valor certo (ex.: não usar "escada" para /e/; "anjo" para /a/; "girafa" para a letra G) | VT-PE p. 51; DIAG §8.4; comentário em `sons.ts` |
| Palavra **mostrada escrita como apoio** de jogo de escuta | Livre, marcada como "para ouvir"; não conta como leitura | MOR p. 137–139 |
| **Frase** para ler | Todas as palavras decodificáveis, **ou** no máximo 1 palavra de uso frequente já ensinada à parte (lista em §5) | ABC p. 319, 377–378; **[DP]** o limite |
| **Texto** para ler sozinha | Idem à frase; ao menos 95% das palavras decodificáveis e o resto da lista de frequentes | 95% como leitura independente (VT-PE p. 31); **[DP]** a aplicação |
| **Nome da criança** | Exceção permitida: qualquer letra; não conta para domínio de leitura | ABC p. 126 (partir do nome); **[DP]** |
| Trilha A–Z ("conhecer as letras") | A palavra-figura de cada letra é **ouvida**, não lida. Palavras para montar ou copiar ali seguem a regra de leitura ou viram "para ouvir" | **[DP]** |

## 4. Casos-armadilha do português brasileiro

A palavra parece simples pelas letras, mas tem um valor sonoro que só é ensinado mais tarde. Unidades: ver [01](01-escopo-e-sequencia.md).

| # | Armadilha | Exemplos | Liberada a partir de | Fonte |
|---|---|---|---|---|
| A1 | "o" final soa /u/ | dado, gato, sapo | TF-12 | ABC p. 115, 121; VT-PE p. 72; SOA p. 168 |
| A2 | "e" final soa /i/ | bife, doze, nave | TF-12 | ABC p. 115, 121; VT-PE p. 133 |
| A3 | E ou O aberto com acento | pé, vovó | TF-23 | VT-1A p. 117 |
| A4 | E ou O aberto sem acento; circunflexo | bola, roda, vela, sete; vovô | TF-24 | MP p. 73, 84; **[DP]** |
| A5 | Vogal nasalizada pela consoante seguinte | cama, banana, menina, nome | **aviso**, não bloqueio (§6) | DIAG §4; **[DP]** |
| A6 | Vogal nasal com M ou N no fim da sílaba; til | anta, tempo, lã | TF-25 a TF-29 | VT-1A p. 171–192 |
| A7 | Ditongo nasal | pão, mãe, tem, põe | TF-30 | **[DP]** |
| A8 | "ti", "di", "te" e "de" finais | tia, dia, leite, tarde | TF-22 | ABC p. 114; VT-PE p. 18 |
| A9 | S entre vogais soa /z/ | casa, mesa | TF-47 | VT-1A p. 225; ABC p. 122 |
| A10 | S, Z no fim da sílaba; plural | pasta, luz, patos | TF-50 | ABC p. 119–120 |
| A11 | C e G antes de E, I | cedo, gelo, girafa | TF-44, TF-45 | VT-1A p. 246; AO p. 5, 11 |
| A12 | "qu" e "gu" (U mudo); "qua" (U falado) | queijo, guia; quatro | TF-40 a TF-42 | VT-1A p. 232, 236 |
| A13 | R: inicial, entre vogais, fim de sílaba, RR | rato, cara, porta, carro | TF-31 a TF-34 | VT-1A p. 201–202 |
| A14 | L no fim da sílaba soa /u/ | sol, papel, alto | TF-49 | SOA p. 158 |
| A15 | H mudo; dígrafos CH, LH, NH | hora, chuva, olho, unha | TF-35 a TF-38 | VT-1A p. 205, 208–222 |
| A16 | X | xale (TF-39); táxi, exame, máximo (TF-51) | TF-39, TF-51 | ABC p. 122; VT-1A p. 229 |
| A17 | Ditongos orais | rei, peixe, pai, boi | TF-06 (ai, ei, oi, ui); "ou", "au", "eu", "iu" **[DP]**: liberados com TF-06 quando as duas vogais mantêm o som ensinado; "ou" fica para depois de TF-24, porque costuma soar "ô" | VT-PE p. 82–85; SOA p. 186 |
| A18 | Encontros de consoantes | prato, flor, pneu | TF-52, TF-53 | ABC p. 119–120 |
| A19 | "es-" inicial soa "is-" | escada, estrela | não usar como exemplo de /e/ | DIAG §8.4 |
| A20 | Acentos e sílaba forte | sabia × sabiá | acento agudo e circunflexo em TF-23 e TF-24; fora isso, só palavras com a sílaba forte na penúltima **[DP]** | — |

## 5. Palavras de uso frequente ensinadas à parte

Os materiais não trazem lista (ABC: "sem lista"). O que dizem: palavras sem regra devem ser mostradas e fixadas de forma controlada
(ABC p. 319), e ensinar o fônico antes das irregulares rende mais (ABC p. 377–378); as irregulares frequentes são memorizadas
(SOA p. 160, 164). **[DP]:** o projeto mantém uma lista curta, em arquivo de dados, com cada palavra amarrada à unidade a partir da qual
pode aparecer em frases (candidatas: o, a, e, é, um, uma, de, do, da, que, não, com). A lista precisa de aprovação humana e não nasce
de nenhum material.

## 6. Como o verificador automático deve checar

Hoje: `app/packages/conteudo/test/conteudo.test.ts` compara letra por letra com `GRAFEMAS_DA_REGIAO`. Passa a ser assim **[DP]**:

1. **Dados de entrada.** Cada unidade da trilha declara os valores que ensina, no formato *grafema + contexto → som*
   (ex.: `c` antes de `a/o/u` → `/k/`; `o` átono final → `/u/`). Cada fase declara a unidade em que está.
2. **Análise da palavra.** O verificador divide a palavra em grafemas (dígrafos primeiro: ch, lh, nh, rr, ss, qu, gu; depois vogal +
   m/n em fim de sílaba; depois letras) e dá a cada um o valor sonoro pela posição, usando as regras de [03](03-inventario-de-sons-pb.md).
3. **O que a ortografia não mostra.** E/O abertos sem acento, a sílaba forte e os outros sons do X não se deduzem das letras. Por
   isso cada palavra do banco (`palavras.ts`) guarda a **pronúncia anotada à mão** (sons em ordem). O verificador confere se a anotação
   bate com as letras e acusa palavra sem anotação. Nenhuma palavra entra em atividade de leitura sem estar no banco.
4. **Resultado por palavra.**
   - **erro** (o teste falha): algum valor sonoro ainda não ensinado na unidade da fase; palavra fora do banco; palavra inventada que
     é palavra real;
   - **aviso** (o teste passa, mas lista): armadilha A5 (nasalização pela consoante seguinte); pronúncia que varia por região
     (R de fim de sílaba, ti/di já ensinados); palavra-figura cujo som-alvo não está na posição pedida.
5. **Onde roda.** Em **todas** as regiões e trilhas, inclusive o Alfabeto, e em **todos** os lugares onde há texto para ler: opções
   escritas, peças de montar, ditado, frases, textos, dicas escritas, tarefas "em casa". Falas só ouvidas ficam de fora, mas as
   palavras-estímulo delas passam pela checagem de som-alvo.
6. **Frases e textos.** Divide em palavras, aplica 1–4 a cada uma, aceita as da lista de frequentes (§5) dentro do limite, e calcula
   a porcentagem decodificável.
7. **Testes do próprio verificador.** Uma tabela de casos fixos, com ao menos um exemplo de cada armadilha A1–A20, que deve falhar
   antes da unidade e passar depois dela.
8. **Relatório.** Lista por fase: palavras lidas, valor que barrou cada uma e a unidade que a libera — para quem escreve conteúdo
   saber o que trocar.

Regra permanente (também no `CLAUDE.md`): toda mudança de conteúdo passa pelo verificador e pelos testes antes de ir ao ar.

## 7. O que o verificador não garante

- Que a palavra é conhecida da criança (preferir palavras familiares: MOR p. 141–142).
- Que a figura é clara e não entrega a resposta ([04 §1](04-tipos-de-atividade.md)).
- Que o som gravado está certo ([03](03-inventario-de-sons-pb.md): nenhum clipe foi ouvido por pessoa).
- Que a pronúncia anotada vale para todas as regiões do Brasil.
Esses pontos pedem revisão humana.
