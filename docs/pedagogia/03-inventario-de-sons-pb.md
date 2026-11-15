# 03 · Inventário de sons do português brasileiro

Siglas e páginas: ver [README](README.md). **[DP]** = decisão do projeto.

Fontes do inventário: quadro de 19 consoantes (ABC p. 117) e 7 vogais orais + 5 nasais (ABC p. 118; MOR nota 27, p. 255–256, com a
ressalva de que a existência de vogais nasais como fonemas é discutida). O Vamos Todos fala em 31 a 34 fonemas (VT-PE p. 27), contando
também variantes como [tʃ] e [dʒ] (VT-PE p. 18).

**Atenção:** partes do Manual ABC descrevem o português de Portugal (18 vogais, vogais átonas reduzidas, transcrições como /ɐ/ e /pə/,
"fio" com /u/ final, metas de fluência portuguesas; ABC p. 316, 330, 351, 379, 407, 416–417). **Nada disso é usado aqui.** Vale o
capítulo 5 do ABC, escrito sobre o português brasileiro (ABC p. 113–132).

**Situação no app** = estado do clipe de som puro em `app/web/public/audio/sons/mapa.json` e em `app/docs/auditoria-sons-letras.md`:
- **aprovado** = passou nas medidas do sinal; **duvidoso** = está no ar, mas pede conferência de ouvido; **reprovado** = fora do ar;
  **sem clipe** = só existe como dado em `app/packages/conteudo/src/sons.ts`.
- **Nenhum clipe foi ouvido por pessoa.** "Aprovado" é aprovado por medida automática. A validação de ouvido, de preferência por
  fonoaudióloga, é pendência do dono (D030).

Regularidade: **direta** (uma letra, um som, nos dois sentidos), **contextual** (depende da posição ou da letra vizinha, mas tem regra)
e **irregular** (não tem regra; memoriza-se a palavra). Classificação conforme ABC p. 122–123, 409, 416–417 e SOA p. 145, 151, 160, 164.

## 1. Vogais orais (7)

| Som | Chave no código | Letras | Regularidade | Particularidades | Unidade | Situação no app |
|---|---|---|---|---|---|---|
| /a/ | `a` | a, á | direta | Antes de M ou N costuma soar nasalizado (cama, banana; DIAG §4) | TF-01 | aprovado |
| /e/ (ê) | `e` | e, ê | contextual | No fim da palavra, sem acento, soa /i/ (ABC p. 115, 121; VT-PE p. 133; SOA p. 168) | TF-02, TF-12 | aprovado |
| /ɛ/ (é) | `E` | é, e | irregular na leitura sem acento | Com acento agudo é sempre aberto (VT-1A p. 117); sem acento não há regra para saber se é aberto ou fechado **[DP]** | TF-23, TF-24 | aprovado |
| /i/ | `i` | i, í, y; "e" final | contextual | Y soa igual (AO p. 32). Aparece sem ser escrito em "pneu", "advogado" (ABC p. 119–120) | TF-03 | aprovado |
| /o/ (ô) | `o` | o, ô | contextual | No fim da palavra, sem acento, soa /u/ (ABC p. 115, 121; VT-PE p. 72; SOA p. 168) | TF-04, TF-12 | aprovado |
| /ɔ/ (ó) | `O` | ó, o | irregular na leitura sem acento | Como o /ɛ/ (VT-1A p. 117; MP p. 84) | TF-23, TF-24 | aprovado |
| /u/ | `u` | u, ú, w; "o" final; "l" final | contextual | W em alguns nomes (AO p. 29). L no fim da sílaba soa /u/ (SOA p. 158; VT-1A p. 259–267). Mudo em "que, qui, gue, gui" (VT-1A p. 232, 236) | TF-05 | aprovado |

Os nomes das vogais coincidem com seus sons (MOR p. 23), o que ajuda no começo.

## 2. Vogais nasais (5)

| Som | Chave no código | Letras | Regularidade | Particularidades | Unidade | Situação no app |
|---|---|---|---|---|---|---|
| /ã/ | `a~` | ã, am, an | contextual | "anjo" começa com este som, não com /a/ (VT-PE p. 51; MP p. 69) | TF-25 | **duvidoso** (a nasalidade não é medida) |
| /ẽ/ | `e~` | em, en | contextual | "-em" final soa como ditongo (tem, bem) **[DP]** | TF-26, TF-30 | sem clipe |
| /ĩ/ | `i~` | im, in | contextual | "im" antes de P e B (VT-1A p. 183) | TF-27 | sem clipe |
| /õ/ | `o~` | om, on, õ | contextual | — | TF-28 | sem clipe |
| /ũ/ | `u~` | um, un | contextual | — | TF-29 | sem clipe |

Regra de escrita: M antes de P e B e no fim da palavra; N nos outros casos; til (ABC p. 122, 409; MOR p. 213–216). Erro típico: omitir
a nasal ("lido" por "lindo"; ABC p. 418–420). Ditongos nasais (ão, ãe, õe) não aparecem nas fichas de leitura: tratamento **[DP]** (TF-30).

## 3. Consoantes (19)

| Som | Chave no código | Letras | Regularidade | Particularidades | Unidade | Situação no app |
|---|---|---|---|---|---|---|
| /m/ | `m` | m | direta no início de sílaba | No fim de sílaba marca vogal nasal (seção 2) | TF-07 | aprovado |
| /n/ | `n` | n | direta no início de sílaba | Idem | TF-13 | aprovado |
| /ɲ/ | `nh` | nh | direta (ABC p. 123; SOA p. 145) | Só no meio da palavra (VT-1A p. 215; ABC p. 120) | TF-37 | **reprovado** (fora do ar) |
| /f/ | `f` | f | direta (ABC p. 123) | Pode ser prolongado (ABC p. 127) | TF-08 | aprovado |
| /v/ | `v` | v, w | direta (ABC p. 123) | W em alguns nomes (AO p. 30). Par de /f/ | TF-09 | **duvidoso** (fricção fraca) |
| /s/ | `s` | s, ss, c (e, i), ç, sc, sç, x, z final | irregular na escrita (ABC p. 417; SOA p. 160) | Leitura contextual: S inicial; SS entre vogais; C antes de E, I; Ç antes de A, O, U (VT-1A p. 246, 253) | TF-11, 45, 46, 50 | aprovado |
| /z/ | `z` | z, s entre vogais, x | irregular na escrita (ABC p. 417) | S entre vogais soa /z/ (VT-1A p. 225; ABC p. 122) | TF-14, TF-47 | aprovado |
| /ʃ/ | `x` | x, ch | irregular na escrita (ABC p. 417; SOA p. 160) | X tem quatro valores (ABC p. 122) | TF-38, TF-39 | aprovado |
| /ʒ/ | `j` | j, g (e, i) | irregular na escrita (ABC p. 417) | G antes de E, I (VT-1A p. 225) | TF-15, TF-44 | **duvidoso** (chiado fraco) |
| /l/ | `l` | l | direta no início de sílaba | No fim de sílaba soa /u/ (SOA p. 158) | TF-10, TF-49 | **duvidoso** (parece N nas medidas) |
| /ʎ/ | `lh` | lh | direta (ABC p. 123; SOA p. 145) | Não inicia palavra (ABC p. 120) | TF-36 | **reprovado** (fora do ar) |
| R fraco /ɾ/ | `r` | r entre vogais e em encontros | contextual (SOA p. 151) | Não inicia palavra (ABC p. 120). No fim de sílaba varia por região (MP p. 87–88) e some na fala (SOA p. 166) | TF-32, TF-33 | **reprovado** (fora do ar) |
| R forte | `rr` | r inicial, rr | contextual (ABC p. 122; SOA p. 151) | Pronúncia varia por região: garganta ou língua vibrando (MP p. 87–88). O material usa os símbolos /X/ (VT, MP); o código usa /ʁ/ | TF-31, TF-34 | **duvidoso** (muda com o sotaque) |
| /p/ | `p` | p | direta (ABC p. 123) | Não se prolonga (ABC p. 127) | TF-16 | **duvidoso** (recorte de "Pá") |
| /b/ | `b` | b | direta (ABC p. 123) | Par de /p/ | TF-18 | **duvidoso** |
| /t/ | `t` | t | direta (ABC p. 123), com variante | Antes do som /i/ soa "tchi" em muitas regiões (ABC p. 114; MOR p. 61; VT-PE p. 18) | TF-17, TF-22 | **duvidoso** |
| /d/ | `d` | d | direta (ABC p. 123), com variante | Antes do som /i/ soa "dji" em muitas regiões (VT-PE p. 18) | TF-20, TF-22 | **duvidoso** (pode soar como T) |
| /k/ | `k` | c (a, o, u), qu (e, i), k | contextual (SOA p. 151) | Q sempre com U (MP p. 86) | TF-19, TF-40 | **duvidoso** |
| /g/ | `g` | g (a, o, u), gu (e, i) | contextual (SOA p. 151) | — | TF-21, TF-42 | **duvidoso** |

Resumo da situação (DIAG §5): 24 sons publicados — 13 aprovados e 11 duvidosos; 3 reprovados (R fraco, LH, NH); 4 vogais nasais sem clipe.
Cobertura: 16 de 19 consoantes, 7 de 7 vogais orais, 1 de 5 nasais.

Letras sem som próprio: **H** inicial é mudo (VT-1A p. 205; MP p. 76; AO p. 12) e forma CH, LH, NH. **K, W, Y** repetem sons de outras
letras (AO p. 15, 29–30, 32). **Q** vale /k/ (MP p. 86). **X** como /ks/ (táxi) é dois sons seguidos.

## 4. Particularidades que mudam a leitura e a escrita

| Caso | O que acontece | Fonte | Como o app trata |
|---|---|---|---|
| E e O no fim | Soam /i/ e /u/ ("sorveti", "lobu") | ABC p. 115, 121, 418; SOA p. 168; VT-PE p. 72, 133 | Unidade TF-12; antes dela, palavras assim não aparecem para ler |
| E e O abertos ou fechados | Sem acento não há pista | VT-1A p. 117; MP p. 73, 84 | TF-23 e TF-24; verificador marca a palavra ([05](05-regras-de-decodificabilidade.md)) |
| Vogal antes de M ou N da sílaba seguinte | Soa nasalizada (cama, banana, menina) | DIAG §4 | Aviso no verificador **[DP]**; o Vamos Todos usa "ama" cedo (VT-PE p. 96) |
| "ti", "di", "te" e "de" finais | "tchi", "dji" em muitas regiões | ABC p. 114; MOR p. 61; VT-PE p. 18 | TF-22; **as duas pronúncias são aceitas [DP]**; a voz da dupla usa uma só, de forma constante |
| R | Dois sons; o forte e o de fim de sílaba variam por região; o final some na fala | VT-1A p. 201–202; MP p. 87–88; SOA p. 166 | Bloco 5; "todo sotaque vale" (já está em `alfabeto.ts`) |
| L no fim da sílaba | Soa /u/ (papel = "papéu") | SOA p. 158; VT-1A p. 259–267 | TF-49 |
| Ditongo reduzido na fala | "caxa", "pexe" | SOA p. 186; ABC p. 418–420 | Escrita: ditado com correção ativa mostra a letra que faltou |
| Sílaba | Consoante-vogal domina; encontros só com R e L; fins de sílaba em /s/ e R | ABC p. 119–120; MOR p. 69–71; SOA p. 177 | Ordem das sílabas em 01 §2 |
| Trocas entre sons parecidos | p/b, t/d, f/v, c/g | SOA p. 147; MOR p. 214 | Pares mínimos (04) |

O português brasileiro é bem mais regular para ler do que para escrever: 64% × 41% de correspondências fixas (ABC p. 410);
consistência 0,717 (letra → som) e 0,754 (som → letra) num corpus de Belo Horizonte (ABC p. 124).

## 5. Sons que não se prolongam

As seis consoantes de estouro (/p b t d k g/) e os três sons curtos (R fraco, LH, NH) não podem ser esticados (ABC p. 127; MOR p. 53, 80,
139). Regras **[DP]**:
- o clipe é curto e repetido ("p, p, p"), nunca "pê" nem "pâ" longo;
- na síntese, vêm colados à vogal seguinte ("p-aaa");
- LH, NH e R fraco são apresentados dentro de uma palavra curta entre vogais (olho, unha, cara), porque não iniciam palavra (ABC p. 120);
- enquanto um som estiver reprovado ou duvidoso, ele não é usado como **único** estímulo de item que conta para domínio.

## 6. Onomatopeias como apoio de memória

Os cartazes ligam cada letra a um som do dia a dia (AO p. 1–36) e o Manual Prático chama isso de "Método das Onomatopeias" (MP p. 47).
Só as letras de som contínuo e as vogais aparecem ali como som puro repetido (F, V, S, Z, J, X, M, R); as outras trazem sons a mais junto
(BOOM, PLOC, TOC-TOC, QUÁ; AO, ressalva da ficha). No app a onomatopeia pode servir de **gancho de memória**, com cenas próprias e
originais, mas o estímulo da atividade é o som puro (pesquisa 45; D029). Os cartazes não têm autoria nem licença: não são copiados.
