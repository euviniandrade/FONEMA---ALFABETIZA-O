# Fonte 1 — Diagnóstico pedagógico do código do FONEMA

> Ficha de leitura do projeto FONEMA, feita em 2026-11-15 para a decisão D030 e guardada na íntegra, como foi entregue.
> É um resumo nosso com citações curtas; não é cópia do material. Caminhos em `/tmp/...` e `/root/...` citados no texto eram
> arquivos temporários da sessão de leitura e não existem no repositório. Referência completa e direitos: [`../07-fontes.md`](../07-fontes.md).

---

# Diagnóstico pedagógico do FONEMA (fiel ao código)

Nada foi alterado. Caminhos a partir de `/home/user/FONEMA---ALFABETIZA-O/app/`. Os números de fases, cenas e itens vêm de um script que importou o conteúdo real. O áudio foi conferido nos manifestos; não ouvi nenhum clipe nem rodei o app no navegador.

## 1. Inventário
A jornada (`packages/conteudo/src/regioes.ts`) tem **41 fases, 212 cenas e 443 itens**: Alfabeto 31, Ilha das Vogais 4 (R1-F02, F03, F06, F07), M-L-F 5 e "Meu nome" 1. Outras 8 fases existem no banco mas estão fora da jornada (R0-F02 a F06, R1-F01, F04, F05). São 9 mecânicas em `web/src/mecanicas/`, todas funcionais.

| Mecânica | O que a criança faz | Cenas / itens / fases |
|---|---|---|
| Escolher (tocar, caçar, ensinar, síntese, revisão) | toca 1 de 2 a 4 opções | 92 / 251 / 40 |
| Espelho | vê a boca, ouve o som, toca "Eu fiz o som!" | 31 / 31 / 31 |
| Letra | assiste à apresentação, toca "Já conheci!" | 26 / 26 / 26 |
| Traçar | traça maiúscula e minúscula | 26 / 52 / 26 |
| Montar | toca peças na ordem (22 "palavrinhas", 3 por letras, 2 por sílabas) | 27 / 54 / 27 |
| Falar | vê a palavra, toca "Eu falei!" | 4 / 11 / 3 |
| Palmas | uma palma por sílaba | 3 / 5 / 3 |
| Pausa | mexe no som-alvo, sem acerto ou erro | 2 / 9 / 2 |
| Ditado | escreve com 8 letras móveis | 1 / 4 / 1 |

Fora da sessão há a Sondagem (10 placas) e o "Mostra pro professor", ambos em `web/src/telas/crianca/Extras.tsx`.

## 2 e 3. Habilidade e "é fônica de verdade?"

| Atividade | Habilidade | Fônica? | Evidência |
|---|---|---|---|
| Ouça e toque na letra (Alfabeto, 103 itens) | nome da letra → forma | **Não** | O estímulo é `falaNomeLetra` = "Letra B." (`fases/alfabeto.ts`). Nunca toca o fonema. |
| Qual figura começa com o som (67 itens) | som inicial + letra | **Parcial** | Mostra "B b" e toca "Letra B."; a figura certa é a palavra-chave recém-apresentada. No 1º erro a dica "B, de bola." diz a resposta. Só 16 letras têm segunda palavra. |
| Com qual letra começa (26 itens) | som inicial → letra | **Parcial** | Ouve a palavra e vê a figura já pareada com a letra. Em W e Y a figura é um crachá com o nome escrito. |
| Letra | forma, nome, som | Exposição | Sempre registra acerto. |
| Espelho | articulação | Exposição | Autorrelato; sempre registra acerto. |
| Qual letra faz /mmm/ (R1, R2a; 51 itens) | som → letra | **Parcial** | É o único som→letra real. Em R2a-F01 os 4 itens têm resposta M e os distratores são vogais. |
| Vovó ou vovô (4 itens) | discriminar ó/ô | Sim | Par mínimo, mas com 2 opções. |
| Montar "palavrinhas" (43 palavras) | cópia | **Não** | `mostrarModelo: true`, `semSomDasPecas: true`; a palavra inteira é dita antes; a peça certa brilha após 2 erros. |
| Montar MA/MO/MU, LUA, MALA | síntese CV | **Parcial** | As peças tocam o som real, mas o modelo fica na tela. |
| Montar por sílaba; "qual sílaba falta" | sílaba | **Não** (silábica) | Peças FI-LA; a pista "__LA (FALA)" mostra a palavra inteira. |
| Ler e tocar a figura (14 itens) | decodificação CVCV | **Parcial** | 2 opções. LUA×mala resolve pela 1ª letra; MULA×LULA e FILA×FOFO são bons. |
| "O Bolota leu errado" (R2a-F02) | leitura | **Não** | As opções aparecem escritas ("mala", "lala"): basta comparar com MALA. |
| Falar (inclui LUFO, FOLU, MUFE) | leitura em voz alta | **Não verificável** | "Eu falei!" vale como acerto sem conferência. |
| Ditado (LUA, MALA, FILA, MOLA) | codificação | **Sim** | Sem modelo; é a única atividade assim. |
| Palmas | sílaba | Fonológica | Confere o número de palmas. |
| Fala de tatu (bo… la) | síntese silábica | Fonológica | 3 itens, só como aquecimento. |
| Traçar | traçado | Não se aplica | Confere ordem e direção, mas 60% de cobertura libera e sempre registra acerto. |

Outros pontos sobre as opções de resposta:
- Tocar numa opção não fala a palavra dela (`Opcao.falar` não é usado em `Escolher.tsx`).
- `PARES_CONFUSOS` (`sons.ts`) não é usado em lugar nenhum.
- No Alfabeto, os distratores evitam letras e sons parecidos (`LETRAS_PARECIDAS`, `SONS_PARECIDOS`). Isso facilita no primeiro contato, mas o contraste fino (p/b, f/v, t/d) nunca é treinado depois.
- Itens e posições são fixos (`posiciona` é determinístico). Repetir a fase mostra a mesma tela, o que permite decorar a posição.

## 4. Progressão
- **Ordem real:** A–Z alfabética, com revisão a cada 5 letras e a Festa; depois é/ê e ó/ô e as 5 vogais; depois M, L, F, palavras CVCV e chefe; por fim o nome. Não há contínuas antes de oclusivas: B, C e D vêm antes de F, M e S. Essa ordem é a D027, contra a recomendação da pesquisa 44.
- **Não existe no código:** CVC, CCV, dígrafos, c/g brandos, r fraco, s entre vogais, nasalização e os outros sons do x. Depois das 26 letras, só M, L e F são usadas para ler.
- **Famílias silábicas:** aparecem em R2a (MA/MO/MU, peças-sílaba, "qual sílaba falta", e o "em casa" com MA-ME-MI-MO-MU).
- **Critério de avanço** (`motor/src/jornada.ts`): 32 fases são do tipo "missão", que conclui só por terminar as atividades, sem exigir acerto. Isso inclui todo o Alfabeto. 7 fases exigem domínio e 2 são chefe (80% e 85% leitura / 75% escrita).
- **Domínio** (`dominio.ts`): firmeza ≥ 0,95, ≥ 8 tentativas, ≥ 2 sessões, 4 das últimas 5 certas, e 2 pseudopalavras na leitura. Letra, Espelho, Traçar e Falar entram sempre como acerto, o que infla a conta. As pseudopalavras só existem no Falar, então esse critério é cumprido por autorrelato.
- **Revisão espaçada** (`revisao.ts`): 1, 2, 4, 8, 16, 32 e 60 dias, até 4 itens por sessão, só de habilidades dominadas e só itens de Escolher. As revisões do Alfabeto cobrem apenas o grupo de 5 letras; só a Festa mistura tudo.
- **Nível inicial** (`nivel-inicial.ts`): "letras-e-sons" começa em R2a-F01 e pula também as vogais é/ê e ó/ô. "le-palavras" começa em R2a-F04; a D026 prometia frases, fluência e compreensão.
- **Decodificabilidade.** O linter (`conteudo/test/conteudo.test.ts`) libera as 26 letras na região do Alfabeto, então lá passa sempre. Conferi 15 fases: AL-B, E, I, M, N, O, P, R, S, X, Z, AL-R1, R2a-F02, R2a-F04 e R0-F01.
  - R2a está limpa: só M, L, F e vogais.
  - Nas palavrinhas, todas as letras já foram vistas, mas com valores sonoros não ensinados:
    - E final com som de i: BIFE, DOZE, PEIXE.
    - O final com som de u: DADO, COPO, GATO, PATO, SAPO.
    - Ó aberto: BOLA, COPO, RODA, SOPA.
    - Ditongo: REI, PEIXE.
    - Vogal nasalizada: BANANA, CAMA, MENINA.
  - R0-F01 monta o nome da criança, com qualquer grafema (dígrafos, H).

## 5. Sons
- **Fonemas publicados** (`web/public/audio/sons/mapa.json`): 24. São 13 "aprovados" nas medidas e 11 "duvidosos" (ã, l, v, j, rr e as seis oclusivas, estas com 0,2 a 0,3 s recortados de "Pá", "Bá" etc.). `docs/auditoria-sons-letras.md` registra que nenhum clipe foi ouvido por pessoa.
- **Reprovados e fora do ar:** r fraco, lh e nh.
- **Cobertura do português brasileiro:** 16 de 19 consoantes, 7 de 7 vogais orais, 1 de 5 nasais. ẽ, ĩ, õ e ũ existem só como dado em `sons.ts`.
- **Onde o fonema toca:** em Letra (3 vezes, mais "Repita comigo"), no Espelho, nos itens "mmmm" e nas peças de M, L, F e vogais.
- **Onde toca o nome da letra:** "Letra B." em todos os itens de escolha do Alfabeto. No Montar, `SOM_LETRA` traz 'pê', 'tê', 'bê', 'cê', 'gê', 'agá', 'quê' para as oclusivas; esses clipes não existem, então as peças ficam mudas (afeta a montagem do nome).
- **Tratamento dos casos:** é/ê e ó/ô têm clipe e fase própria. C=K=Q usam /k/; I=Y; U=W. O "segundo som" (g→j, s→z, c→s, w→v) é só tocado uma vez na apresentação, sem atividade; o do R nem toca, porque o clipe foi reprovado. CH, LH, NH, RR, SS, QU e GU não têm nenhuma atividade.
- **Síntese com áudio real:** `voz.dizer` toca "sss… ooo… lll" com os clipes, mas esses itens estão em R0-F05 e F06, fora da jornada. Na jornada a junção é uma frase gravada ("mmm-aaa… MA!").
- **Palavra inteira no lugar de fonemas:** Montar e Ditado dizem a palavra toda.
- **Reconhecimento de fala:** real (Web Speech, `servicos/microfone.ts`), opcional, e só compara as 3 primeiras letras. Nunca julga.
- **Falas sem clipe:** "Escuta de novo.", "Olha, a peça certa está brilhando." e a correção do ditado ficam em silêncio (conferi essas três).

## 6. Avaliação e intervenção
- **O que é registrado** (`estado.ts`): por tentativa, a hora, a sessão, a habilidade, acertou, com ajuda, pseudo e a cena. Por cena, acertos e total.
- **O que não é registrado:** a opção escolhida, o tipo de erro, o fonema ou grafema confundido, o tempo de resposta.
- **Sondagem:** 10 placas de 2 a 3 opções, oferecida uma única vez (após a 1ª sessão, para 6 anos ou mais). Só acelera R1 e R2a; o Alfabeto nunca é acelerado. Não há sondagem periódica.
- **Painel do adulto** (`telas/adulto/Adulto.tsx`): termômetro, "já sabe / está aprendendo", mapa de habilidades da turma, fila do "Mostra pro professor". "Palavras difíceis" lista títulos de cena, não palavras.
- **Termômetro:** o máximo alcançável hoje é 2 de 10.
- **No erro:** 1º erro repete o estímulo com uma dica genérica; 2º erro faz a resposta certa brilhar.
- **O que não existe:** explicação do erro, contraste entre o som escolhido e o certo, volta ao pré-requisito, prática extra dirigida ao erro, oferta de "voltar de fase" (D026 §3), variação de itens e alerta de risco.

## 7. Fluência, compreensão e escrita
- Não há frases, textos, leitura cronometrada, perguntas de compreensão nem vocabulário. A região seguinte diz "Em breve".
- A leitura se resume a cerca de 10 palavras e 5 pseudopalavras com M, L e F.
- Escrita: um ditado de 4 palavras, a montagem do nome com modelo e o traçado de 52 letras.

## 8. Inconsistências
1. A D029 diz que "M, de macaco" não basta, mas os 196 itens de escolha do Alfabeto usam o nome da letra como estímulo.
2. A D004 exige domínio comprovado, mas 32 de 41 fases concluem por participação e o domínio conta autorrelato.
3. "Decodificável" é garantido por um linter que não vale para o Alfabeto; as palavrinhas são cópia com modelo.
4. `sons.ts` diz que "escada" e "estrela" saíram, mas estão em R1-F03-C4 e R1-F06-C5; "escada" é pedida como "ééé", o que é foneticamente errado.
5. A jornada documentada vai de R0 a R10 e o termômetro a 10; o código vai até M, L, F.
6. A escuta fonológica (rima, som inicial, síntese fonêmica) virou 5 aquecimentos curtos; a síntese fonêmica saiu da jornada.
7. `PARES_CONFUSOS`, `config.voz.provedor` e os comentários sobre "voz do navegador" são restos sem efeito.
8. O `docs/ESTADO-ATUAL.md` fala em 25 clipes; são 24.
9. A instrução não é sistemática em três pontos: ordem alfabética, 23 letras sem prática de leitura e nenhum contraste entre pares confundíveis.
10. A instrução não é explícita em dois pontos: correção genérica e resposta entregue por dica ou brilho.
