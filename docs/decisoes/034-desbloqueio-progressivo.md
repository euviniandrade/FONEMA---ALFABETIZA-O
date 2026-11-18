# D034 — Desbloqueio progressivo: cada missão abre algo novo e visível

Data: 2026-11-18. Origem: pedido do dono (fila nº 22), testando o app publicado: "as tarefas e funções estão bloqueadas, mesmo
quando o aluno terminou uma atividade. Vamos liberar conforme ele for realizando e terminando as demais atividades, para que ele
não canse nem desanime." **Decisão do projeto**, tomada a partir desse pedido (não houve pergunta de volta ao dono).

## O que foi encontrado (antes)
Mapa completo dos cadeados, com uma criança nova concluindo as fases na ordem da jornada (simulação no motor e E2E):

| Cadeado | Abria com | 1ª missão em que abria |
|---|---|---|
| Fases da jornada (Trilha A–Z e Trilha dos Sons) | fase anterior concluída (D021) | — (continua igual) |
| Corre-Som e Bichinho Come-Som | 3 sons ensinados | 5ª (Letra I) |
| Bichinho "Termina com" | A, I e U ensinados | 9ª (Letra U) |
| Memória dos Sons | 3 sons sem par parecido | 7ª (Letra O) |
| Estrada dos Pares / Carteiro / Casa do Som | palavras decodificáveis (regra 2) | 18ª / 20ª / 23ª |
| Sons L, V, J, P, T, B, C, D, G nos jogos | nunca (filtro "duvidosos da auditoria") | nunca |
| Peças da Lojinha (cores, coque, topete) | Letras B, C, D, F, G, I, L | 5ª a 40ª (Letra B e C: 36ª e 38ª, por causa da ordem alternada de D031) |
| Ler sozinho (textos) | fim de cada bloco | 11ª |
| Escrever do meu jeito / porta da Casa no passeio | depois do som do M | 14ª |
| Fichas de leitura | 1ª palavra legível | 18ª |
| Ler em eco / coro | 1ª frase da trilha | 20ª |
| Ler mais ligeiro / porta do Coreto | precisão ≥ 95% e 6 palavras lidas | depende da leitura |

Nas quatro primeiras missões **nada** abria fora da trilha. Os cartões trancados diziam "Abre com os primeiros sons da trilha", sem
dizer quanto falta; as peças diziam "Abre na Letra B", que ficava 35 missões à frente. Não foi achado caso de "concluiu e não
destrancou" nem "só destrava ao recarregar": a tela relê o progresso ao entrar (o E2E novo confere isso navegando sem recarregar).

## O que foi decidido
1. **A trilha continua por domínio e sequência** (D021, D030): nada pula fase.
2. **Os extras abrem cedo e crescem.** Um só catálogo (`motor/src/desbloqueio.ts`) diz, para cada extra, se está aberto, o que
   falta e quantas missões faltam. Cada uma das 11 primeiras missões abre pelo menos uma coisa nova (teste do motor).
3. **Jogos de escuta abrem com 1 som.** Corre-Som "Figuras", Bichinho "Começa com" e "Termina com" abrem na 1ª missão. Com
   menos de 3 sons é **aquecimento**: o som pedido é sempre um som já ensinado; as outras figuras começam (ou terminam) com sons
   ainda não ensinados, mas são só **ouvidas** (05 §3: palavra só ouvida é livre, com o som-alvo na posição pedida); as
   escolhas gravam **exposição**, não domínio (regra 4). Corre-Som "Letras" continua com 3 letras ensinadas (letra mostrada é
   coisa de ler; regra 2). A Memória abre o nível 1 (só olhar e lembrar, tudo exposição) com 2 pares.
4. **Sons "duvidosos" nos jogos livres.** L, V, J, P, T, B, C, D, G entram no Brincar quando a letra já foi ensinada: o clipe
   tocado é o mesmo que a trilha usa na apresentação e na correção desses sons. Nos desafios dentro da fase continuam de fora
   (`duvidosos: false`). Chave para voltar atrás: `DUVIDOSOS_NOS_JOGOS_LIVRES` (`jogos-fonicos.ts`).
5. **Jogos de ler e escrever** (Estrada, Carteiro, Casa do Som), textos, fichas, eco/coro e escrita continuam esperando palavras
   decodificáveis (regra 2), mas agora dizem **quantas missões faltam** (bolinhas) e o que abre.
6. **Fluência** continua com o critério de leitura (ABC p. 375–376), agora com **barrinha** do que falta (palavras lidas ou
   acertos em 20).
7. **Lojinha:** as 12 peças especiais abrem uma por missão nas 11 primeiras (a moedinha continua sendo a troca). O cadeado diz
   "Abre na próxima missão" / "Abre em 3 missões".
8. **Passeio 3D:** Casa e Coreto não ficam trancados. Enquanto a escrita e a fluência não abrem, a Casa leva ao "Meu boneco" e o
   Coreto às palmas; depois, à escrita e à fluência, como antes. O barco segue "Em breve na Lojinha" (não existe ainda).
9. **"Abriu!" e "Novo!"** No fim da missão, o painel "Abriu!" mostra o que abriu, com animação, e o Tales diz a fala já gravada
   "Olha só o que chegou para você, [NOME]!". O botão da barra (Brincar, Leitura, Lojinha) e o cartão ganham o selo "Novo!" até a
   criança visitar. O "visto" fica no aparelho.

## O que NÃO mudou (regras)
- Regra 2: nenhuma palavra para ler/escrever com valor sonoro não ensinado; letra só aparece escrita se já foi ensinada.
- Regra 3: posições sorteadas; nada no "Novo!" aponta resposta. Regra 4: aquecimento e Memória nível 1 são exposição.
- Regra 7: nada foi removido; os critérios antigos ficam nos mesmos lugares, só mais cedo ou mais claros.

## Falas
Nenhuma voz foi gerada. O "Abriu!" usa a fala do Tales já gravada (`FALAS.surpresa`). Falas novas sugeridas para o "o que falta"
(sem clipe) estão em `app/docs/falas-pendentes.md` §1h.
