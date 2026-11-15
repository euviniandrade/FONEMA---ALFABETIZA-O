# 06 · Avaliação e intervenção

Siglas e páginas: ver [README](README.md). **[DP]** = decisão do projeto. Habilidades: [02](02-matriz-de-habilidades.md).

Avaliar aqui serve para **decidir o que ensinar em seguida**, nunca para punir ou classificar (VT-PE p. 136–137; SOA p. 309–310).
Limite do app: ele não substitui a professora nem faz diagnóstico de dislexia ou de qualquer transtorno (ABC p. 147; pesquisa 29).

## 1. O que registrar em cada tentativa

Hoje (`app/packages/motor/src/estado.ts`, DIAG §6): hora, sessão, habilidade, acertou, com ajuda, palavra inventada, cena.
Falta o que permite entender o erro. Registro proposto **[DP]** (etapa 2 da D030):

| Campo | Para quê |
|---|---|
| item (palavra, som ou letra-alvo) | saber **qual** palavra é difícil, não só o título da cena |
| tipo de atividade | separar reconhecer de produzir |
| resposta dada (opção tocada, letras montadas, número de palmas) | ver com o que a criança confundiu |
| opções mostradas e posição da certa | conferir sorteio e chute |
| tipo de erro (tabela abaixo) | escolher o reforço |
| par confundido (ex.: p→b) | pares mínimos dirigidos |
| número da tentativa no item e nível de ajuda (nenhuma, repetir, dica, resposta mostrada) | "com ajuda" deixa de ser sim/não |
| tempo de resposta | fluência; monitorar exatidão **e** tempo (ABC p. 333–334) |
| quantas vezes ouviu de novo | sinal de dúvida |
| contexto: trilha, revisão, sondagem ou reforço | não misturar treino com medida (ABC p. 511) |
| conta para domínio? (sim/não) | exposição e autorrelato ficam registrados, mas com "não" |

Tipos de erro **[DP]**, com os erros típicos do português brasileiro (ABC p. 418–420; SOA p. 147, 158, 166, 168, 186):

| Código | Erro | Exemplo |
|---|---|---|
| E-VOZ | troca surda/sonora | p/b, t/d, f/v, c/g, s/z, x/j |
| E-NAS | nasal omitida ou trocada | "lido" por lindo; m/n |
| E-VOG | vogal trocada; aberta × fechada | é/ê, ó/ô |
| E-FIM | escreve como fala no fim | "sorveti", "lobu", "papeu" |
| E-OMI | letra ou som omitido | "pexe", "foresta", R final |
| E-ACR | letra a mais | — |
| E-ORD | ordem trocada | "tataruga" |
| E-CTX | regra de posição | r/rr, c/qu, g/gu, s/ss |
| E-IRR | escolha sem regra | j/g, ch/x, s/c/ç |
| E-VIS | letra de forma parecida | b/d, p/q |
| E-NOM | usou o nome da letra no lugar do som | "K" por "ca" (SOA p. 118) |
| E-CHU | resposta muito rápida ou padrão de posição | sempre a da esquerda |

Dados de criança: tudo fica no aparelho, com o mínimo necessário (regras de `ESTADO-ATUAL.md` §6).

## 2. Critérios de domínio

Os materiais **não dão critério numérico** (Vamos Todos: "não encontrado"; Morais usa "+" domina e "+/-" oscila, MOR p. 217–218).
O que dão: 95% de precisão como nível de leitura independente (VT-PE p. 31) e como condição para treinar fluência (ABC p. 375–376).
Tudo abaixo é **[DP]**, partindo do que o motor já faz (`dominio.ts`):

1. Firmeza ≥ 0,95, com ao menos 8 tentativas, em ao menos 2 sessões, e 4 das últimas 5 certas sem ajuda (já existe).
2. Em leitura, ao menos 2 palavras inventadas certas (já existe; ABC p. 333) — **por resposta conferida**, não por "Eu falei!".
3. Só contam tentativas marcadas "conta para domínio": nada de Letra, Espelho, Traçar, Falar sem conferência (DIAG §4).
4. Só contam itens com 3 opções ou mais, ou pares mínimos com 8 de 10 ([04 §1](04-tipos-de-atividade.md), R8).
5. Itens **diferentes** dos usados no treino (ABC p. 511) e em mais de um tipo de atividade (reconhecer e produzir).
6. Retenção: acertar de novo na revisão espaçada (1, 2, 4, 8… dias; já existe em `revisao.ts`) antes de a habilidade ser dada como firme.
7. Toda fase da trilha fônica conclui por domínio; fase "missão", que conclui só por participação (32 de 41 hoje; DIAG §4), fica
   restrita a exposição e à Trilha A–Z.

## 3. Sondagem periódica

Hoje há uma sondagem única de 10 placas, só para 6 anos ou mais (DIAG §6). Proposta **[DP]**, montada com o que os materiais pedem:

| Quando | O quê | Fonte |
|---|---|---|
| **Na entrada** | Nível inicial: letras, som inicial, leitura de palavras | sondagem inicial recomendada (VT-PE p. 137); D021/D026 |
| **Ao fim de cada bloco** da trilha fônica | Itens novos do bloco + amostra dos anteriores | "avaliação formativa em toda sequência" (VT-PE p. 52); cumulativo (ABC p. 510) |
| **Três vezes por ano** (início, meio e fim do ano letivo) ou a cada ~12 semanas de uso | Sondagem completa, **repetindo as mesmas tarefas** para comparar | triagem universal 3×/ano (ABC p. 157, 146); três diagnósticos por ano, com as mesmas palavras meses depois (SOA p. 312, 59, 123); protocolo ao fim de cada semestre (VT-1A p. 165–169, 274–279) |
| **Mensal ou semanal** para quem está em reforço | Só as habilidades em reforço | monitoramento mensal no nível 2 e semanal no nível 3 (ABC p. 160–162) |

Conteúdo da sondagem completa (curta, em forma de brincadeira, com figuras: MOR p. 217–218):

| Parte | Tarefa | Fonte |
|---|---|---|
| Letras | som de cada letra ensinada (letra → som e som → letra); nome das letras | ABC p. 333–334, 167–168 |
| Escuta | contar sílabas; mesma sílaba inicial; rima; som inicial | VT-1A p. 165–169; MOR p. 129–130, 217 |
| Leitura | palavras novas e inventadas, com acerto e tempo | ABC p. 333–334 |
| Escrita | ditado de palavras (8) e de frases | VT-1A p. 165–169; MOR p. 77, 216–217; SOA p. 59, 123 |
| Texto (quando já lê) | leitura em voz alta por 60 s, gravada só no aparelho, + perguntas | VT-1A p. 165–169 |
| Vocabulário e compreensão ouvida | perguntas sobre história ouvida | ABC p. 167–168, 397–398 |

Regras: a sondagem não dá dica nem ajuda; não tira moedas nem trava nada; a criança vê só "missão cumprida"; o resultado vai para o adulto.

## 4. Correção explícita do erro

Hoje: o 1º erro repete o estímulo com dica genérica e o 2º faz a resposta brilhar (DIAG §6). Passa a ser **[DP]**, com base em
"correção imediata, para evitar a consolidação de erros" (VT-PE p. 40), "sempre valorizando cada tentativa" (VT-PE p. 96), retorno
claro de certo ou errado (ABC p. 257, 331) e "diante do erro, decodificar da esquerda para a direita, não adivinhar" (ABC p. 329):

| Passo | O que o app faz | Conta como |
|---|---|---|
| 1º erro | Diz o que a criança escolheu e o que foi pedido, lado a lado: "Você tocou no B, que faz b. Eu pedi ffff." Toca os dois sons. Tenta de novo | tentativa errada |
| 2º erro | Mostra **como** achar: na leitura, aponta letra por letra e junta os sons devagar; na escrita, compara som por som (N10) | errada |
| 3º erro | Mostra a resposta, faz junto, e o item **volta** mais tarde na mesma sessão | "resposta mostrada"; não conta como acerto |
| Depois | O erro alimenta o reforço (§5) | — |

A fala de correção nunca humilha e sempre nomeia o que a criança fez certo. Falas de correção precisam existir em áudio (hoje três
ficam em silêncio; DIAG §5).

## 5. Reforço dirigido e volta ao pré-requisito

| Sinal | O que o app faz [DP] | Fonte |
|---|---|---|
| Mesmo par confundido 3 vezes (ex.: p→b) | Abre uma rodada curta de pares mínimos desse par (N3) | SOA p. 147; MOR p. 214 |
| Erro repetido de regra (E-CTX) | Rodada de comparação de pares (muro × murro) | SOA p. 154–155 |
| Não domina a unidade depois de 3 sessões | Volta ao pré-requisito indicado na matriz (ex.: de DEC-PAL-01 para SIN-CV-01, de FG para CFN-INI-01) e oferece a versão mais fácil do mesmo jogo | retomar antes de avançar (VT-1A p. 115); versões mais fáceis e mais difíceis (MOR p. 203); mapear o que falta (MOR p. 218) |
| Erra na revisão espaçada | A habilidade volta para "em treino" | cumulativo (ABC p. 510, 513) |
| Sondagem mostra queda | Oferece "voltar de fase" ao adulto (prometido na D026 §3; não existe hoje) | DIAG §6 |
| Vai muito bem na sondagem | Acelera, inclusive na Trilha A–Z | D021/D026 |

O reforço é curto (minutos), usa itens novos, e não tira nada que a criança já ganhou.

## 6. Fluência: medir sem inventar meta

- Mede-se: palavras lidas certas em 60 segundos e a precisão (VT-1A p. 167; ABC p. 363), com gráfico de progresso da própria criança
  (ABC p. 515).
- **Não há meta brasileira nos materiais.** As metas de 55 e 90 palavras por minuto do ABC são do currículo de Portugal (ABC p. 379)
  e Soares não dá meta (SOA: "não encontrado"). **[DP]:** o app mostra a evolução da criança em relação a ela mesma e não usa número de
  corte até haver referência brasileira validada (pesquisas 20 e 25 trazem o que o projeto já levantou).

## 7. Alerta ao adulto

"Esperar para ver nunca é uma boa opção" (ABC p. 518). Preditores de dificuldade: consciência fonêmica, letra-som e nomeação rápida
(ABC p. 509). Alertas **[DP]**, em linguagem simples e sem rótulo:

| Situação | Mensagem ao adulto |
|---|---|
| 3 sessões sem dominar a mesma unidade, mesmo com reforço | "Fulano está precisando de ajuda com o som do P. Veja como ajudar em casa." |
| Mesmo tipo de erro persistente por 2 semanas | mostra o erro e uma atividade para fazer junto |
| Queda entre duas sondagens | sugere voltar de fase |
| Dificuldade ampla e persistente (várias habilidades de som e letra, por 12 semanas de uso regular) | "Vale conversar com a professora e, se ela achar necessário, procurar avaliação com profissional." Nunca a palavra "dislexia" |
| Muitos chutes (E-CHU) ou sessões muito curtas | sugere jogar junto |

O prazo de 12 semanas vem do tempo mínimo de intervenção citado no ABC (20–40 min, 3–5 dias por semana, ≥ 12 semanas; ABC p. 511).
Texto legal dos alertas: "verificar com advogado" (regra de `ESTADO-ATUAL.md` §6).

## 8. O que o painel do adulto mostra

Hoje: termômetro, "já sabe / está aprendendo", mapa da turma, fila do "Mostra pro professor"; "palavras difíceis" lista títulos de
cena (DIAG §6). Passa a mostrar **[DP]**:

1. **Onde está** na trilha fônica (unidade) e na Trilha A–Z, separadas.
2. **Sons e letras**: firme / em treino / ainda não visto, nos dois sentidos (som → letra, letra → som).
3. **Palavras e sons difíceis de verdade** (itens, não cenas) e **com o que confundiu** (p com b).
4. **Tipos de erro** mais frequentes, em linguagem simples.
5. **Leitura**: palavras reais × inventadas; tempo médio; evolução da fluência (sem meta).
6. **Escrita**: o que a criança escreveu no ditado e na escrita própria, ao lado da forma certa.
7. **Sondagens**: uma ao lado da outra, com data.
8. **O que conta e o que não conta**: tempo de exposição (vídeos, Espelho, traçado) aparece separado e **não** entra no termômetro.
9. **Alertas** e uma sugestão do que fazer em casa ou na sala.
10. Para a professora: lista da turma por habilidade que falta, para montar grupos (MOR p. 194, 201, 218; ABC p. 160–162).

O termômetro (D004) só sobe com domínio comprovado; hoje o máximo alcançável é 2 de 10 (DIAG §6).

## 9. Posições divergentes dos materiais sobre avaliação

| Tema | Posição 1 | Posição 2 | No app |
|---|---|---|---|
| Testar fonemas (segmentar, juntar, trocar) | Monitorar contagem e identificação de fonemas (ABC p. 333–334) | Rejeita tarefas fonêmicas e baterias com nota global: viram novo "teste de prontidão" e levam a rótulos (MOR p. 218–219) | Mede, mas **sem nota global**, sem travar a trilha só por isso e sem rótulo |
| Palavras inventadas | Indispensáveis (ABC p. 333) | Fora da matriz de diagnóstico (SOA p. 314–315); não usar (MOR p. 141–142) | Usa na leitura; apresentadas como brincadeira ("nome de bichinho") |
| Som isolado da letra | Avaliar sons de grafemas (ABC p. 333–334) | Não avalia som isolado (SOA p. 314–315) | Avalia nos dois sentidos |
| Velocidade | Exatidão **e** tempo; palavras por minuto (ABC p. 333–334, 379; VT-1A p. 167) | Sem medida de velocidade (SOA p. 314–315) | Mede tempo, sem meta |
| Como classificar a criança | Por habilidades dominadas (ABC; VT) | Por fase de escrita (garatuja → silábica → alfabética), via ditado de figuras (SOA p. 59, 123, 137; MOR p. 77, 216–217) | Progressão por habilidades; a escrita própria (N13) é guardada e mostrada ao adulto como informação, não como critério |
| Forma | Triagem e instrumentos com ponto de corte (ABC p. 167–168, instrumento espanhol) | Observação contínua em brincadeira, registro "+" e "+/-" (MOR p. 217–218); "diagnóstico", não avaliação (SOA p. 309–310) | Sondagem em forma de brincadeira; sem ponto de corte importado |
| Autoavaliação | Carinha feliz ou triste ao fim do caderno (VT-PE p. 86, 134) | — | Pode existir como conversa sobre a lição; nunca conta como domínio |
| Tecnologia | Professor não é substituível por "artefatos tecnológicos" (ABC p. 147) | Programas de computador com eficácia demonstrada servem como ferramenta adicional (ABC p. 511) | O app é ferramenta de apoio; o painel existe para devolver a decisão ao adulto |
