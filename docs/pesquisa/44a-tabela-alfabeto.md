# 44a — Tabela A–Z para a Trilha do Alfabeto (som, fala, palavra-chave, gesto, boca)

> Anexo do relatório [44 — Cursos, livros e programas do método fônico](44-cursos-livros-metodo-fonico.md) · Projeto FONEMA · novembro/2026.
> Atende à [Decisão 027](../decisoes/027-alfabeto-primeiro-personagens-vivos.md) (alfabeto primeiro, A–Z) e respeita a [D012](../decisoes/012-valores-cristaos.md) (sem bruxa, fada, magia, festa junina), a D008 (sem joias) e a D009 (sem arco-íris).
> **Para quem está montando o app:** a tabela 2 é a que alimenta `app/packages/conteudo/src/alfabeto.ts`. A seção 6 compara esta tabela com o que já está no arquivo e lista só o que eu mudaria.

**Como ler as marcas**
- **[L]** = vem de relatório do próprio repositório (fonte entre parênteses).
- **[S]** = fonte secundária lida nesta sessão (resumo de busca na web). Detalhes no relatório 44.
- **[NV]** = conhecimento corrente de fonética e de sala de aula, **não conferido em fonte nesta sessão**. Precisa de fonoaudióloga ou linguista antes de gravar.
- A escolha das palavras é **proposta de projeto** [NV], feita com os critérios da seção 1. Nenhum programa publicado foi copiado.

---

## 1. Critérios usados para escolher a palavra-chave

1. **Começa com a letra e com o som principal da letra.** Sem exceção.
2. **O som inicial é o mesmo em todo o Brasil.** Fora: "tia" e "dia" (viram "tchia" e "djia" em boa parte do país), "escada" (vira "iscada"), vogal antes de M ou N (fica nasal: "anjo", "onça", "índio", "umbigo") [L: rel. 02 §5.2; rel. 29 §4.2].
3. **Começa com sílaba simples** (consoante + vogal, ou só vogal). Fora: encontros como BR, PR, TR, GR no começo ("bruxa", "prato", "trem", "grilo").
4. **Concreta e fácil de desenhar**, e o desenho só tem um nome. Fora: "pipa" (em cada região tem um nome: pipa, papagaio, pandorga, raia), "égua" (a criança diz "cavalo"), "zero" (parece a letra O).
5. **Do mundo da criança brasileira**, com 2 ou 3 sílabas quando dá.
6. **Dentro dos valores do projeto** (D012). Fora: bruxa, fada, mago, dragão, vampiro, gnomo, fogueira de festa junina, yoga.
7. **De preferência, uma palavra que a criança vai conseguir ler sozinha mais tarde** (sílabas simples e regulares).
8. **Não disputa com outra letra.** Fora: "girafa" para o som do J; "chave" para o som do X; "cebola" para o C.

Os melhores programas usam a mesma lógica: uma figura fixa por som, com som inicial claro, e de preferência uma figura cujo desenho lembra a forma da letra [S: Ehri, Deffner e Wilce 1984; Shmidman e Ehri 2010; ver rel. 44].

---

## 2. Como a dupla fala o som (regra geral)

A criança precisa aprender **três coisas diferentes** sobre cada letra: o **desenho**, o **nome** e o **som**. O erro mais comum das cartilhas é misturar nome e som ("o B faz bê").

**Frase-modelo, sempre igual:**

> "Esta é a letra **B**. O nome dela é **bê**. O som dela é **/b/**. **B** de **bola**."

Regras de fala:
- **Sons que esticam** (vogais, F, J, L, M, N, R, S, V, X, Z): esticar por 1 a 2 segundos. "mmmm", "ssss".
- **Sons que estouram** (B, C/K/Q, D, G, P, T): não dá para esticar. Falar **curto e leve**, sem colar uma vogal forte. Nunca "bê", "bá" ou "bã" como se fosse o som. Na dúvida, repetir três vezes, curtinho ("b, b, b"), e colar logo na palavra: "b, b, **bo**la".
- **Depois do som, sempre a palavra**: som → palavra → som de novo.
- **Nome da letra** só entra na frase "o nome dela é…". Nas atividades de som, a dupla **não** diz o nome.
- **Voz sintética erra som puro de consoante.** Os sons isolados precisam ser gravados por fonoaudióloga [L: D020; nota em `alfabeto.ts`]. Até lá, usar "B, de bola" e o Espelho do Som.

**Nomes das letras no Brasil.** Há dois jeitos, os dois certos [NV — validar com linguista]: o mais comum no Sul e Sudeste ("efe, gê, jota, ele, eme, ene, erre, esse") e o comum em parte do Nordeste ("fê, guê, ji, lê, mê, nê, rê, si"). O E e o O também mudam de nome ("é/ê", "ó/ô"). O app deve aceitar os dois e avisar o adulto.

---

## 3. Tabela 1 — Som e fala de cada letra

| Letra | Nome | Som para ensinar primeiro (IPA) | Em palavras simples | Como a dupla fala (sem trocar nome por som) | Estica? |
|---|---|---|---|---|---|
| **A** | á | /a/ | Boca bem aberta | "O som do A é **aaaa**. A de abelha." | Sim |
| **B** | bê | /b/ | Lábios fecham e estouram, com voz | "O som do B é **b, b, b**, curtinho. B de **bo**la." | Não |
| **C** | cê | /k/ (antes de A, O, U) | Estouro no fundo da boca, sem voz | "O som do C é **c, c, c**, lá no fundo. C de **ca**sa." | Não |
| **D** | dê | /d/ (antes de A, E, O, U) | Ponta da língua bate atrás dos dentes, com voz | "O som do D é **d, d, d**. D de **da**do." | Não |
| **E** | é (ou ê) | /e/ "ê" primeiro; /ɛ/ "é" logo em seguida | Sorriso meio aberto (ê) ou mais aberto (é) | "O E tem duas vozes: **êêê**, de elefante, e **ééé**, de pé." | Sim |
| **F** | efe (ou fê) | /f/ | Dentes de cima no lábio de baixo, só vento | "O som do F é **ffff**, um ventinho. F de foca." | Sim |
| **G** | gê (ou guê) | /g/ (antes de A, O, U) | Estouro no fundo da boca, com voz | "O som do G é **g, g, g**, lá no gogó. G de **ga**to." | Não |
| **H** | agá | não tem som | Letra que não faz som sozinha | "O H não faz som. A gente escreve H e fala **i**popótamo." | — |
| **I** | i | /i/ | Sorriso grande | "O som do I é **iiii**. I de ilha." | Sim |
| **J** | jota (ou ji) | /ʒ/ | Biquinho, o ar passa, com voz | "O som do J é **jjjj**. J de jacaré." | Sim |
| **K** | cá | /k/ | Igual ao C de casa | "O K tem o mesmo som do C de casa: **c, c**. K de kiwi. O K aparece em nomes." | Não |
| **L** | ele (ou lê) | /l/ (começo de sílaba) | Ponta da língua sobe e fica | "O som do L é **llll**. L de lua." | Sim |
| **M** | eme (ou mê) | /m/ | Lábios fechados, som pelo nariz | "O som do M é **mmmm**. M de macaco." | Sim |
| **N** | ene (ou nê) | /n/ | Língua atrás dos dentes, som pelo nariz | "O som do N é **nnnn**. N de navio." | Sim |
| **O** | ó (ou ô) | /o/ "ô" primeiro; /ɔ/ "ó" logo em seguida | Boca redonda (ô) ou redonda e mais aberta (ó) | "O O tem duas vozes: **ôôô**, de ovo, e **óóó**, de vovó." | Sim |
| **P** | pê | /p/ | Lábios fecham e estouram, sem voz | "O som do P é **p, p, p**, um soprinho. P de **pa**to." | Não |
| **Q** | quê | /k/ (QU antes de E, I) | Igual ao C de casa; anda sempre com o U | "O Q nunca anda sozinho: vem com o U. Juntos fazem **c, c**. Q de queijo." | Não |
| **R** | erre (ou rê) | R forte do começo da palavra: /ʁ/ (varia: [h], [x], [r]) | Som "raspado" no fundo da garganta ou língua tremendo | "O som do R no começo é **rrrr**. R de rato. Cada lugar do Brasil fala de um jeito, e todos valem." | Sim |
| **S** | esse (ou si) | /s/ (começo de palavra) | Dentes quase fechados, ar fininho, sem voz | "O som do S é **ssss**. S de sapo." | Sim |
| **T** | tê | /t/ (antes de A, E, O, U) | Ponta da língua bate atrás dos dentes, sem voz | "O som do T é **t, t, t**. T de **ta**tu." | Não |
| **U** | u | /u/ | Biquinho | "O som do U é **uuuu**. U de uva." | Sim |
| **V** | vê | /v/ | Dentes no lábio, com voz (zumbido) | "O som do V é **vvvv**. V de vaca." | Sim |
| **W** | dáblio | /w/ (som de U) na maioria; /v/ em alguns nomes | Letra de nomes | "O W aparece em nomes. Em **W**esley e em ki**w**i soa como U. Em **W**agner soa como V." | Sim |
| **X** | xis | /ʃ/ (começo de palavra) | Biquinho de pedir silêncio, sem voz | "O som do X é **xxxx**. X de xícara." | Sim |
| **Y** | ípsilon | /i/ | Igual ao I | "O Y tem o som do I: **iiii**. Y de **Y**asmin. O Y aparece em nomes." | Sim |
| **Z** | zê | /z/ | Igual ao S, com voz (zumbido) | "O som do Z é **zzzz**. Z de zebra." | Sim |

Fontes da tabela 1: pontos e modos de articulação [L: rel. 02 §5.2]; variação regional do R, do T/D antes de I e do S de fim de sílaba [L: rel. 29 §4.2]; frases da dupla [proposta].

---

## 4. Tabela 2 — Palavras-chave: candidatas, escolha e o que evitar

| Letra | Candidatas (3–5) | **Melhor escolha** e por quê | Evitar (e por quê) |
|---|---|---|---|
| **A** | abelha, avião, árvore, anel, asa | **ABELHA.** Já é o exemplo da D027; bicho querido; A oral claro. Reserva: **árvore** (A forte, na sílaba tônica) | anjo, anta, âncora, antena (A nasal, som de "ã"); arco-íris (D009); amarelo (cor, não desenhável) |
| **B** | bola, bota, boca, bebê, banana | **BOLA.** Duas sílabas simples; a criança vai ler cedo. Bônus: **B de Bolota** (o mascote) | bruxa (D012 e encontro BR); braço, brinquedo (BR); balão de festa junina (D012) |
| **C** | casa, cavalo, copo, coco, coelho | **CASA.** A palavra mais conhecida; som /k/ claro. Reserva para a etapa de leitura: **cavalo** e **copo** (totalmente regulares) | cebola, cinema, cenoura, cesta, circo (C com som de S); chave, chuva, chapéu (dígrafo CH); cruz, criança (encontro CR) |
| **D** | dado, dedo, doce, dama, dente | **DADO.** Dois D com o mesmo som em todo o Brasil; a criança vai ler cedo. Reserva: **dedo** (parte do corpo: dá para mostrar) | dia, dinossauro, dinheiro, disco (DI vira "dji" em boa parte do Brasil); dragão (encontro DR e fantasia) |
| **E** | elefante, ema, ele, ela, égua | **ELEFANTE** para o "ê". Para o "é", usar **PÉ** (som no fim, parte do corpo) ou o par **ELA** ("é") × **ELE** ("ê"), com a Sofia e o Tales | escada, escola, escova, estrela, esquilo (viram "is…" em boa parte do Brasil); enxada, envelope (E nasal); égua como figura (a criança diz "cavalo") |
| **F** | foca, fita, figo, folha, faca | **FOCA.** Duas sílabas simples; bicho; fácil de ler depois. **Faca** só no jogo do par faca × vaca | fada (D012); festa, fogueira (festa junina, D012); flor, fruta (encontros FL, FR); fogo como figura principal (perigo) |
| **G** | gato, galo, gota, gola, goiaba | **GATO.** Duas sílabas simples; todo mundo conhece | gelo, girafa, gema, gigante, gente (G com som de J); guitarra, guerra (GU); grilo, gruta (encontro GR); gnomo (D012) |
| **H** | hipopótamo, horta, harpa, hora, hino | **HIPOPÓTAMO** (apelido "Hipo"). Figura sem dúvida, as crianças gostam. Reserva: **horta** (combina com a "colheita da horta" da D012) e **harpa** | hélice (rara, difícil de desenhar); homem (a criança diz "moço" ou "papai"); hora (a criança diz "relógio"); Halloween (D012); falar o H "soprado" como no inglês |
| **I** | ilha, igreja, ímã, iguana | **ILHA.** O mundo do FONEMA é um arquipélago; I oral claro. Reserva: **igreja** (combina com a D012) | índio, inseto, injeção (I nasal; e "índio" pede cuidado cultural, D012 §4); iglu (encontro GL e fora do universo brasileiro); ioiô, iogurte (o I vira som rápido, quase "y") |
| **J** | jacaré, janela, jabuti, jaca, jipe | **JACARÉ.** Bicho brasileiro, três sílabas simples, figura sem dúvida. **Janela** também serve (já tem arte) | girafa, gelo (som de J, mas letra G); joia como figura (D008, sem joias); joaninha (longa, com NH) |
| **K** | kiwi, karatê, Kauã, Kátia | **KIWI.** Fruta, fácil de desenhar, e ainda mostra o W. Junto: um **crachá de nome** (Kauã, Kátia) | ketchup (TCH e som final estranho); koala (em português se escreve **coala**); kart (termina em RT) |
| **L** | lua, lata, luva, lobo, leão | **LUA.** Duas sílabas, a segunda só com vogal; fácil de desenhar e de ler | sol, anel, papel como exemplo de L (no fim da sílaba o L soa "u"); lhama (dígrafo LH); lula como figura principal (pode puxar assunto de política; fica só na lista de leitura) |
| **M** | macaco, mala, mapa, moto, meia | **MACACO.** Bicho, três sílabas simples, figura sem dúvida. Reservas boas de ler: **mala**, **mapa** | mão, maçã (têm "ão" e "ã": guardar para depois); mágico, monstro (D012 e encontro) |
| **N** | navio, nariz, ninho, nuvem, nove | **NAVIO.** Figura clara; combina com o arquipélago. **Nariz** é a palavra do gesto (o N é som que sai pelo nariz) | neve (fora do dia a dia brasileiro); noite (difícil de desenhar); ninho como principal (tem NH no meio) |
| **O** | ovo, olho, ovelha, osso, óculos | **OVO** para o "ô". Para o "ó", **ÓCULOS** ou **VOVÓ** (som no fim). Bônus: vov**ó** × vov**ô** mostra as duas vozes | onça, ônibus, onda, onze (O nasal, som de "õ"); ouro, ouvido (ditongo OU); orelha como principal (a criança pode dizer "ouvido") |
| **P** | pato, pé, pipoca, panela, pera | **PATO.** Duas sílabas simples; forma par com **gato** e **rato** para brincar de rima | pipa (nome muda por região); prato, praia, princesa (encontro PR); pneu; palhaço como principal (LH e Ç) |
| **Q** | queijo, quiabo, quibe, quilo, quati | **QUEIJO.** Todo mundo conhece; QU com som de /k/, que é o caso mais comum (que, quem, aqui, quero) | quatro, quadro (U falado e encontro TR/DR: ensinar depois); quente (não desenhável); mostrar o Q sem o U |
| **R** | rato, roda, rua, rede, rei | **RATO.** Duas sílabas simples; R forte de começo de palavra. Reserva: **roda** e **rei** | arara, barata, cara como exemplo de R (ali é o R fraco, outro som: ensinar depois); relógio (longa, com som de J); ensinar um único sotaque como "o certo" |
| **S** | sapo, sol, sino, suco, sopa | **SAPO.** Duas sílabas simples. Reservas: **sol** (figura ótima) e **sino** (sino da igreja) | casa, mesa, rosa como exemplo de S (ali o S soa Z); cebola, cinema (som de S sem a letra S); escola (S de fim de sílaba muda por região) |
| **T** | tatu, tomate, teto, tucano, tapete | **TATU.** Dois T com o mesmo som em todo o Brasil; é o bicho do Bolota (tatu-bola) | tia, tigre, time, tijolo (TI vira "tchi" em boa parte do Brasil); trem, três (encontro TR) |
| **U** | uva, urubu, urso | **UVA.** Duas sílabas simples; a criança vai ler cedo | um, umbigo, unha (U nasal); unicórnio (fantasia, D012); urso como principal (R no fim da sílaba) |
| **V** | vaca, vovó, vela, vaso, violão | **VACA.** Duas sílabas simples; forma o par **faca × vaca**. Reserva afetiva: **vovó** | vassoura de bruxa, vampiro (D012); vidro (encontro DR); vento (difícil de desenhar) |
| **W** | Wesley, William, Wagner, kiwi, web | **Crachá de nome: WESLEY** (som de U) e **WAGNER** (som de V), mais o **kiWi**. É letra de nomes; não precisa de figura de objeto | waffle (escrita estranha, FF e LE; fala "uófou"); wi-fi (fala "uai-fai": o I não soa I); dizer que o W "tem som de dáblio" |
| **X** | xícara, xale, xarope, xilofone | **XÍCARA.** A mais conhecida; X com som de "ch", que é o som do X no começo de toda palavra. Reserva: **xilofone** (combina com música, D024) | xadrez (encontro DR, Z no fim, e a figura confunde com "quadradinhos"); táxi, boxe (som "ks"); exame, exemplo (som de Z); próximo (som de S); chave, chuva (som igual, letra diferente) |
| **Y** | Yasmin, Yuri, Yara, Yago | **Crachá de nome: YASMIN** e **YURI.** É letra de nomes; som de I. Se precisar de objeto: **yakisoba** (longa) | yoga (D012: prática ligada a outra religião — confirmar com o dono); yeti (fantasia); ioiô (em português é com I) |
| **Z** | zebra, zíper, zangão, zero | **ZEBRA.** Figura sem dúvida; o encontro BR fica na segunda sílaba e não atrapalha o som inicial. Som de apoio: o **zzz** da abelha | zero como figura (parece a letra O); casa, mesa (som de Z sem a letra Z); zumbi (D012) |

---

## 5. Tabela 3 — Gesto, dica de boca, confusões e o que vem depois

Os gestos são **originais do FONEMA** [proposta]. A ideia de um gesto por som vem do Jolly Phonics e do Zoo-phonics, e a de mostrar a boca vem do estudo de Sargiani, Ehri e Maluf (2018) com crianças brasileiras [S: ver rel. 44]. Não copiar os gestos desses programas: são material protegido.

Regra: **cada gesto é diferente dos outros** e imita o som ou a boca, não a figura.

| Letra | Gesto sugerido | Dica de boca (lábios, língua, voz, ar) | Confusões comuns | Depois (etapa das sílabas) |
|---|---|---|---|---|
| **A** | Abrir os braços bem grande, junto com a boca | Boca bem aberta, língua deitada; garganta vibra | A × "ã" (nasal) | Ã, AM, AN; Á, À, Â |
| **B** | Quicar uma bola de mentira: b, b, b | Lábios fecham e abrem; **garganta vibra**; quase não sai vento | **B × P** (som); **b × d × p × q** (desenho) | BR, BL; M antes de B |
| **C** | Bater à porta da casa: c, c, c (toc-toc) | Fundo da língua sobe e solta; **sem voz**; boca aberta | **C × G** (som); C × K × Q (mesmo som); c × o × e (desenho) | CE, CI (som de S); Ç; CH; CR, CL |
| **D** | Chacoalhar e jogar o dado: d, d, d | Ponta da língua atrás dos dentes de cima; **garganta vibra** | **D × T** (som); **d × b** (desenho) | DI = "dji" em muitas regiões; DR |
| **E** | Braço esticado como tromba: êêê. Apontar para o pé: ééé | "ê": sorriso meio aberto. "é": abre mais | ê × é; E × I no fim da palavra ("leite" → "leiti") | EM, EN; É, Ê; E final com som de I |
| **F** | Soprar a palma da mão e sentir o ventinho | Dentes de cima no lábio de baixo; **sem voz**; sai vento | **F × V** | FR, FL |
| **G** | Dedo no gogó: g, g, g | Fundo da língua sobe e solta; **garganta vibra** | **G × C/K** (som); G × J (GE, GI); g × q (desenho) | GE, GI (som de J); GU; GR, GL |
| **H** | Mão aberta cobrindo a boca (letra calada) | Não tem boca própria: a boca já faz a vogal seguinte | H × A (desenho); achar que H tem som de "agá" ou de R | CH, LH, NH |
| **I** | Dedo desenha o pingo do i no ar, com sorriso | Sorriso grande, dentes quase juntos | I × E; i × l × j (desenho) | IM, IN; I em ditongo (pai, lei) |
| **J** | Braços abrindo e fechando como a boca do jacaré: jjj | Biquinho para frente; **garganta vibra**; ar contínuo | **J × X/CH** (com voz × sem voz); J × G | GE, GI escrevem o mesmo som |
| **K** | O mesmo do C (bater à porta) | Igual ao C | K × C × Q; k × x (desenho) | Só nomes e palavras de fora |
| **L** | Reger com o dedo: lá, lá, lá | Ponta da língua sobe atrás dos dentes e **fica**; o ar sai pelos lados | **L × R** (fala: "pranta"); l × I × i (desenho) | L no fim da sílaba (sol = "sou"); LH; BL, CL, FL, PL |
| **M** | Mão na barriga: mmm, que gostoso! | **Lábios fechados**; som sai pelo nariz | **M × N**; m × n × w (desenho) | AM, EM, IM, OM, UM; M antes de P e B |
| **N** | Dedo encostado no nariz, sentindo vibrar | Boca entreaberta, ponta da língua atrás dos dentes; som pelo nariz | **N × M**; n × u × h (desenho) | AN, EN, IN, ON, UN; NH |
| **O** | Mãos formando um ovo; abrir as mãos para o "ó" | "ô": boca redonda e fechadinha. "ó": redonda e mais aberta | ô × ó; O × U no fim da palavra ("pato" → "patu") | OM, ON; Ó, Ô, Õ; O final com som de U |
| **P** | Estourar uma bolha com o dedo: p! | Lábios fecham e estouram; **sem voz**; sai um soprinho (o papel mexe) | **P × B** (som); **p × q × b × d** (desenho) | PR, PL |
| **Q** | Dois dedos enganchados: o Q e o U de mãos dadas | Igual ao C | Q × C × K; q × p × g (desenho); esquecer o U | QUA, QUO (U falado); QUE, QUI (U calado) |
| **R** | Girar as mãos como uma roda: rrr | Som no fundo da garganta (ou língua tremendo). **Todo sotaque vale** | R forte × R fraco; **R × L**; R × H; R × P × B (desenho) | R fraco entre vogais (arara); RR; R no fim da sílaba (porta); PR, BR, TR… |
| **S** | Mão deslizando em zigue-zague, como ar saindo do balão: sss | Dentes quase fechados, **língua escondida**; sem voz | **S × Z**; S × X/CH; s × z (desenho) | S entre vogais (som de Z); SS; S no fim; CE, CI, Ç |
| **T** | Bater a ponta do dedo na palma: t, t, t | Ponta da língua atrás dos dentes de cima; **sem voz** | **T × D** (som); t × f × l (desenho) | TI = "tchi" em muitas regiões; TR |
| **U** | Mãos em concha em volta do biquinho: uuu | Biquinho bem para frente | U × O; u × n × v (desenho) | UM, UN; U em ditongo (pau, céu); U calado em QUE, GUE |
| **V** | Braços como asas de avião que treme: vvv | Dentes de cima no lábio de baixo; **garganta vibra** | **V × F**; V × B; v × u × y (desenho) | VR (livro) |
| **W** | Desenhar duas ondas no ar com as mãos | Biquinho do U (ou boca do V, em alguns nomes) | W × V × U; w × m (desenho) | Só nomes e palavras de fora |
| **X** | Dedo na frente dos lábios: xxx (silêncio) | Biquinho; ar contínuo; **sem voz** | **X × J**; X × S; X × CH (mesmo som) | X com som de KS, Z e S; CH |
| **Y** | Braços para cima em forma de Y | Igual ao I | Y × I; y × v (desenho) | Só nomes e palavras de fora |
| **Z** | Dedo voando como abelha: zzz | Igual ao S, mas a **garganta vibra** | **Z × S**; z × s (desenho) | S entre vogais; Z no fim (luz, nariz) |

Fontes da tabela 3: dicas de boca e pares surdo-sonoros [L: rel. 02 §5.2; rel. 29 §4.3]; pares "com voz × sem voz" têm a mesma boca, e a diferença só se sente com a mão na garganta [L: rel. 02 §5.2]; língua escondida no S, contra o ceceio [L: rel. 29 §4.3]; confusões de desenho b/d/p/q [L: rel. 01 §5]; gestos [proposta].

**Ajuda para as trocas "com voz × sem voz"** (P/B, T/D, C/G, F/V, S/Z, X/J): a criança põe a mão na garganta. "Treme? É o B. Não treme? É o P." [L: rel. 29 §4.3]

---

## 6. Diferenças em relação ao `alfabeto.ts` que já está no app

O arquivo `app/packages/conteudo/src/alfabeto.ts` (em construção) já segue quase tudo. O que eu mudaria:

| Letra | Hoje no arquivo | Sugestão | Motivo |
|---|---|---|---|
| **H** e **X** | Os dois usam o gesto "dedo na frente da boca" | **H:** mão aberta cobrindo a boca. **X:** dedo na frente dos lábios | Dois gestos iguais para letras diferentes confundem |
| **R** e **V** | Os dois usam "mão na garganta" | **R:** girar as mãos como roda. **V:** braços de avião tremendo | Mesmo motivo. A mão na garganta fica como teste geral de "com voz × sem voz" |
| **I** | `outraPalavra: 'iglu'` | **igreja** ou **ímã** | "Iglu" tem encontro GL e não é do mundo da criança brasileira |
| **W** | `palavra: 'waffle'` | **Wesley** (crachá de nome) + **kiwi** | "Waffle" se fala "uófou" e tem FF e LE: atrapalha mais do que ajuda |
| **Y** | `palavra: 'yakisoba'` | **Yasmin** ou **Yuri** (crachá de nome); yakisoba pode ficar como segunda figura | Cinco sílabas; nem toda criança conhece. Y é, antes de tudo, letra de nomes |
| **J** | `palavra: 'janela'` | **jacaré** (se houver arte); janela pode ficar | Figura de janela pode ser lida como "casa" ou "porta" |
| **E** | Só o "ê"; "é" fica para depois | Apresentar as **duas vozes** já na missão do E (ê de elefante, é de pé) | O nome da letra na maior parte do Brasil é "é". Se a criança só ouvir "ê", estranha |
| **O** | Só o "ô"; "ó" fica para depois | Apresentar as **duas vozes** (ô de ovo, ó de vovó) | Mesmo motivo |
| **C** | `outraPalavra: 'caneca'` | manter; para leitura, preferir **cavalo** e **copo** | "Caneca" e "xícara" têm figuras parecidas |
| **F** | `outraPalavra: 'fogo'` | **fita** ou **figo** | Fogo é figura de perigo |
| **S** e **Z** | "cobrinha" e "abelhinha" | manter; alternativa neutra para o S: "ar saindo do balão" | Só uma opção, caso a figura da cobra incomode alguma família |
| `sons.ts` | `E` → "escada"; `e` → "estrela"; `j` → "girafa"; `x` → "chave", "chuva"; `i` → "iglu", "ioiô"; `a~`, `o~` etc. | Tirar "escada" e "estrela" (viram "is…"); "girafa", "chave" e "chuva" valem para o **som**, mas não como exemplo da **letra** J e X | Critérios 2 e 8 da seção 1 |

---

## 7. Pontos que precisam de especialista antes de gravar

1. **Sons puros das consoantes que estouram** (B, C, D, G, P, T): como gravar sem vogal de apoio. Fonoaudióloga.
2. **R do começo da palavra:** qual variante vira o áudio-modelo e quais são aceitas. Linguista e fonoaudióloga [L: rel. 29 §4.2].
3. **E e O com duas vozes:** confirmar a ordem (ê primeiro ou é primeiro) e os exemplos. A escolha do "ê" e do "ô" como primeiros segue o que o app já tem; o nome da letra, na maior parte do país, é "é" e "ó".
4. **Nomes regionais das letras** (fê, guê, ji, lê, mê, nê, rê, si): confirmar onde se usam.
5. **W e Y:** confirmar com o dono se bastam os nomes próprios como exemplo.
6. **Yoga** e outras palavras de fronteira com a D012: confirmar com o dono.
7. **Gestos:** testar com crianças de 4 e 5 anos. Gesto que a criança não consegue fazer sozinha sai.
