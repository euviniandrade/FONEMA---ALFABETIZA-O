# Parte 5 · Ritmo de imersão: transições, áudio, câmera, momentos uau e proteção contra sobrecarga

> Base: [imersivo](../imersivo/README.md) (regras de intensidade), D005 e D007 item 7 (tela de lição com fundo limpo, rel. 23), D009 (sem arco-íris), D012. A regra de ouro: **o mundo encanta entre as tarefas; durante a tarefa só existem a boca, a letra e a palavra.**

## 1. As três camadas da tela

| Camada | Quando aparece | Como é | Regra |
|---|---|---|---|
| **Mundo 3D** (mapa, vila, biomas) | Chegada, deslocamentos, momentos uau, tempo livre na vila | 3D alegre de animação, luz do dia, clima por bioma, música da região | Nunca durante a resposta da criança |
| **Cena de missão** (2,5D) | Você faz, esporte-leitura, chefe | Cenário do bioma **simplificado**: fundo com profundidade suave, 1 objeto animado por vez | Máximo 1 evento animado durante a decodificação |
| **Tela de lição** (fundo limpo) | Espelho do Som, Nós fazemos, verificação, ditado | Fundo claro liso (creme ou azul-claro), Sofia e/ou Tales enquadrados, boca em close, letra no centro em Andika | Mundo congela e esmaece (fade 1 s); sem música; quem não fala fica parado |

## 2. Transições (sempre ≥ 1 s, com fade, sem corte seco)

| Transição | Uso | Duração | Modo calmo |
|---|---|---|---|
| **Voo sobre o mapa** | Entre regiões e na abertura do dia | 3–5 s, câmera ≤ 45°/s | Fade direto |
| **Barco do Bolota** | Quintal → Ilha; Amazônia → Mar | 4 s; o mar balança devagar | Imagem fixa |
| **Canoa / trem** | Pantanal (canoa), Litoral → Cidade (trem) | 3–4 s | Fade |
| **Entrar no livro** | Hora da História; entrada no Arquipélago | O livro abre, a câmera entra na ilustração (2 s) | Fade |
| **Esmaecer para a lição** | Mundo → tela de lição | 1 s | 1,5 s |
| **Dia → entardecer** | Ritual de fim | 20–40 s de luz mudando enquanto a Sofia recapitula | Céu fixo |

## 3. Música e áudio

| Região | Tema musical (só em menu, abertura, transição e celebração) | Ambiente (−24 dB, silencia na tarefa) |
|---|---|---|
| R0 Quintal | Violão e assobio | Passarinhos, cachorro ao longe |
| R1 Ilha | Violão e percussão leve | Ondas lentas |
| R2 Mata | Flauta e cordas | Pássaros, água corrente |
| R3 Pampa | Acordeão suave | Vento leve |
| R4 Pantanal | Viola | Água, tuiuiús |
| R5 Cerrado | Viola caipira | Cigarras ao longe |
| R6 Sertão | Sanfona, zabumba, triângulo | Vento seco |
| R7 Amazônia | Flauta e chocalho | Rio, araras |
| R8 Litoral | Violão e pandeiro | Mar e gaivotas |
| R9 Cidade | Piano e percussão de oficina | Cidade tranquila |
| R10 Arquipélago | Cordas e piano | Páginas, vento suave |

Regras: voz da Sofia e do Tales a 0 dB de referência; efeito de acerto −12 dB, ≤ 600 ms; **nunca música sob tarefa fonológica**; nenhum som de erro punitivo; saída normalizada (−16 LUFS).

## 4. Câmera e micro-animações
- **Câmera:** planos médios no mundo; close na boca só na tela de lição; nada de tremor de tela, flash ou zoom brusco; piscar ≤ 3 vezes por segundo (WCAG 2.3.1).
- **Micro-animações que ensinam:** fusão de sons (as letras deslizam no ritmo da fala), sílaba que acende no instante da leitura, palavra que vira objeto (BOLA quica, VELA acende), dígrafo que "dá as mãos", R que "gruda" no encontro.
- **Celebração:** acerto = 1 s, 6–12 brilhos e frase específica; fim de bloco = 2–3 s; nada em tela cheia.
- **Personagens:** Sofia e Tales respiram e piscam devagar enquanto esperam; **ficam parados** enquanto a criança responde; nunca tristes.

## 5. Momentos uau (um por região, sempre **depois** do acerto e fora da tarefa)

| Região | Momento uau | Cena |
|---|---|---|
| R0 | A letra do próprio nome acende na placa da casa | R0-F01-C5 |
| R1 | O farol acende e a luz varre o mar até a mata | R1-F07-C9 |
| R2a | A primeira palavra lida (MALA) aparece e se abre | R2a-F04-C9 |
| R2b | A criança lê SOFIA e a Sofia comemora | R2b-F02-C9 |
| R3 | O céu do Pampa vai do dia para a noite e os cata-ventos giram | R3-F09-C9 |
| R4 | A cheia sobe e os bichos salvos chegam à vila | R4-F08-C9 |
| R5 | O ipê floresce inteiro de amarelo | R5-F07-C9 |
| R6 | Noite de cordel: a xilogravura da criança vira painel no coreto | R6-F08-C9 |
| R7 | O barco chega à foz e o rio encontra o mar | R7-F07-C9 |
| R8 | O trem dos encontros é inaugurado com vagões de palavras | R8-F07-C4 |
| R9 | A ponte testada fica de pé e o jornal sai com a manchete da criança | R9-F06-C4, R9-F08-C7 |
| R10 | O livro da criança entra na estante da vila e cada morador lê uma página | R10-F09-C9 |

## 6. Como a plataforma evita sobrecarga
1. **Fundo limpo na lição** (rel. 23; D007 item 7): um foco por tela, instrução ≤ 1 frase de ~10 palavras, 2–4 alternativas.
2. **Detalhe sedutor proibido:** efeito que não ensina não entra (g ≈ −0,33).
3. **Sinais de sobrecarga** (3 erros seguidos, salto no tempo de resposta, toques aleatórios, inatividade > 20–30 s): a Sofia reduz alternativas, muda de modalidade (falar → tocar) ou propõe pausa, e a sessão **fecha com êxito**.
4. **Modo calmo** (um botão): sem música, sem partículas, céu fixo, animações curtas.
5. **Aviso de fim em 2 etapas** e **sem botão continuar**; janela noturna bloqueada.
6. **Aparelho simples:** modo leve com imagens pré-renderizadas e o mesmo valor pedagógico.
7. **Zum-Zum, o vilão leve da distração** ([README §6.1](README.md), D019): aparece só na cena de missão, **antes e entre** os itens; nunca na tela de lição, durante a decodificação ou enquanto a dupla fala. O zumbido é curto e suave (≤ 1 s, −24 dB, sem susto); ele embaralha letras com animação lenta, e a criança vence prestando atenção. No modo calmo e no Previsível, ele aparece parado e é anunciado antes.
8. **Comemoração de nível e de título** ([07](07-progressao-niveis-e-titulos.md)): só no ritual de fim ou na vila, nunca no meio da tarefa; nível comum = 2–3 s; título novo = 5–10 s com a dupla, sem tela cheia de partículas.
