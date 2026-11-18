# D035 — Corre-Som em corrida: a pista não para, pontos, tempo, meta e níveis

Data: 2026-11-18. Origem: **pedido do dono** (fila nº 27, ponto 3), com as palavras dele: "O jogo não pode ficar parando:
automático, rápido e instantâneo; ela tem que identificar. Entrou pela porta errada: um xizinho e perde ponto. Tempo para cada
atividade, com objetivo e premiação, para alcançar, para vencer. Alcançar o máximo de pontos na corrida: moedinha conta ponto,
detalhes contam ponto, letra certa ganha bastante ponto, letra errada perde ponto. E vamos elevando o nível. Bem dinâmico, sem
ficar parando, e sem ficar falando a letra o tempo inteiro. E letras sempre em maiúscula e minúscula (Aa), nunca só a grande."
O mecanismo e os números são **decisão do projeto [DP]**, a calibrar com uso real.

**Substitui:** o "antes do arco o mundo desacelera; sem resposta = repete, não é erro; brilho após 2 erros" da pesquisa 47 (G1) e
da D032 §4, e o "sem cronômetro, sem placar" do Corre-Som. O Bichinho Come-Som e os outros jogos não mudam.

## O que foi decidido
1. **Corrida contínua.** O boneco corre sem parar; os arcos vêm em **ondas**. No começo da onda o **som puro** da letra-alvo toca
   **uma vez** (regra 1); os arcos da onda só são lançados depois de o som tocar inteiro (o tempo de resposta conta daí). Botão
   "Ouvir" repete o som (fica gravado em `ouviuDeNovo`). Passar pelo arco = escolher a pista em que o boneco está.
2. **Retorno curto, sem parar.** Certo: brilho, som curto, "+N". Errado: ✖, som curto, "−5" e a letra certa por 1 s no canto. A
   correção contrastiva completa (o som que era × o som em que passou, com botões de ouvir) fica para a **tela do fim**.
3. **Pontos [DP]:** moedinha da pista +1; pulo por cima de almofada +2; a cada 3 acertos seguidos +2; letra certa +10 × (1, 2 a
   partir de 3 seguidos, 3 a partir de 6); letra errada −5; nunca abaixo de zero. Placar sempre à vista.
4. **Tempo, meta e prêmio (Brincar) [DP]:** nível 1 = 60 s, meta 80; até o nível 5 = 45 s, meta 200. Estrelas: 1 com metade da
   meta, 2 ao bater a meta (selo "Selo da corrida · Nível N" e o próximo nível abre), 3 com 1,5 × a meta. **Moedinhas da Lojinha:**
   uma por estrela, teto 3 por corrida, pelo `creditarEmBloco` (teto do dia da D002; nunca tira). Isto muda o "jogo livre sem
   moedinhas" da D032 §4 só para a corrida do Corre-Som.
5. **Níveis [DP]:** sobem a velocidade (tempo de chegada do arco 4,7 s → 2,7 s), os arcos por onda (2 → 3), a semelhança dos
   distratores (nível 1 sem distrator parecido; do 2 em diante um parecido quando existe, R7) e a meta; o tempo diminui. O nível
   sobe ao bater a meta e nunca desce. Só letras/sons já ensinados (regra 2); a posição da certa é sorteada em cada arco e nunca
   repete a do arco anterior (R5); 3 opções sempre (R8).
6. **Na fase** (desafio, revisão e lições de vogal TF-01…05, em que o jogo é obrigatório): os itens da fase em sequência, um arco
   por item, sem relógio e sem meta; acaba quando os itens acabam e mostra a tela do fim com "Continuar".
7. **Figuras (R10):** sem parar não dá para a guia dizer o nome de cada figura antes do som. O alto-falante em cima de cada pista
   continua: tocar nele diz o nome da figura, sem marcar resposta.
8. **Aa:** as placas e a correção mostram a letra em maiúscula e minúscula (`componentes/LetraAa.tsx`); o id gravado continua a letra.

## Registro e domínio (regra 4)
Cada passagem pelo arco é **uma tentativa avaliada** (`mecanica: 'corre-som'`, alvo, escolhido, tempoMs, nOpcoes, posições,
contexto) com **`formato: 'corrida'`** e o estado da corrida antes dela (`corrida: { acertosSeguidos, errosSeguidos, mexeu, nivel }`).
Pontos, moedas, estrelas e tempo **nunca** viram tentativa. Como não há pausa antes da escolha, a passagem pesa menos [DP]
(`tentativas.ts › chuteDeCorrida`, usado na firmeza, no nº de tentativas, nas últimas certas e nas provas):
- **passar sem mexer não conta** (a criança não trocou de pista nem tocou numa pista enquanto o arco vinha: é ficar parada,
  e parada ela acerta 1 em 3);
- **acerto isolado logo depois de 2 erros seguidos não conta** (padrão de chute; erro E-CHU de docs/pedagogia/06 §1);
- depois de um ✖ a letra certa aparece no canto: os arcos seguintes **da mesma onda** valem "com ajuda" (R4);
- acerto em sequência e erro com escolha contam normalmente. Tudo continua gravado para o painel e a matriz de confusão.
Testes: `app/packages/motor/test/corre-som-corrida.test.ts` (inclui: a TF-01 continua concluindo quando a criança acerta com escolha;
passar sem mexer nunca conclui).

## Limites conhecidos
Números a calibrar com crianças de verdade; ninguém jogou num celular de verdade; 60 qps foi medido só no navegador sem tela do
servidor (ver ESTADO §0).
