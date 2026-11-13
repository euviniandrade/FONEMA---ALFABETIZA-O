# Voz da Sofia: opções geradas no ElevenLabs

**Data:** 13/11/2026 · Conta do dono (plano Creator), via API com chave guardada no ambiente (nunca no código).

## Texto usado nas amostras
> "Oi! Eu sou a Sofia, e este é o Bolota. Hoje a gente vai descobrir um som novo juntos. Olha a minha boca: os lábios se fecham bem juntinhos, e o som sai pelo nariz. Agora é a sua vez! Pode tentar sem pressa. Muito bem, você conseguiu!"

## Opções (pasta `opcoes/`)
| Arquivo | Origem | Descrição |
|---|---|---|
| `A-professora-jovem-1.mp3` / `-2` | Voz **desenhada** (Voice Design) | Mulher jovem, timbre leve, articulação de professora de educação infantil |
| `B-contadora-de-historias-1.mp3` / `-2` | Voz **desenhada** (Voice Design) | Mulher jovem, doce e expressiva, contadora de histórias |
| `C-biblioteca-Roberta.mp3` | Voz da biblioteca da conta | "Roberta", pt-BR, casual |
| `D-biblioteca-Will.mp3` | Voz da biblioteca da conta | "Will", pt-BR, feminina, casual |

As vozes desenhadas (A e B) ainda **não foram salvas** na conta. Os IDs temporários estão registrados fora do repositório. Quando o dono escolher uma, ela é salva com o nome "Sofia — FONEMA" e passa a ser usada em todas as falas.

## Limites importantes
- **O ElevenLabs bloqueia a criação de vozes infantis sintéticas** (política de segurança da plataforma; a tentativa com "menina de ~10 anos" foi recusada). Não contornamos isso. A Sofia usa **voz de mulher jovem**, como as dubladoras fazem com personagens crianças em animação. Se o projeto quiser uma voz infantil real, o caminho é uma **dubladora mirim contratada**, com autorização dos responsáveis e contrato de cessão de voz (ver rel. 28: PLs sobre clonagem de voz).
- **Sons isolados** ("mmm", "fff") continuam gravados por **fonoaudióloga** (rels. 03, 10 e 28). O ElevenLabs entra em falas, histórias, instruções, vídeos e mensagens para famílias.
- O texto que vai para a voz sintética **nunca** contém dados de crianças. Os roteiros são fixos, revisados e gerados uma vez (TTS pré-gerado), não em tempo real.

## Próximos passos (após a escolha)
1. Salvar a voz escolhida na conta e fixar os ajustes (estabilidade, estilo, velocidade ~0,9 para crianças).
2. Narrar os 3 vídeos de amostra com a voz escolhida.
3. Criar o script do projeto que gera todas as falas a partir dos roteiros, com marcação de tempo para sincronizar a boca da Sofia (o ElevenLabs devolve o tempo de cada caractere).

## Rodada 2: estilo desenho animado (pasta `opcoes-desenho/`)
O dono não aprovou a 1ª rodada ("tem que ser mais desenho animado, lúdico, divertido e 100% pedagógico"). Esta rodada usa o modelo **Eleven v3** (o mais expressivo, com marcações de emoção como risadinha, curiosidade e comemoração) e vozes **desenhadas como dubladora de animação** brasileira:

| Arquivo | Estilo |
|---|---|
| `E-desenho-alegre-1/2.mp3` | Protagonista de animação: aguda, brilhante, energética, sorridente |
| `F-desenho-aventureira-1/2.mp3` | Heroína aventureira: curiosa, surpresa, risadinhas naturais |
| `G-desenho-doce-1/2.mp3` | Doce e engraçada: fofa, cantada, encorajadora |

A biblioteca pública do ElevenLabs não tem voz "cartoon" com sotaque brasileiro (as que existem são americanas ou latinas). Por isso as vozes foram criadas do zero.

**Verificação por transcrição automática (Scribe):** as marcações de emoção viraram atuação (risada), não texto falado. O "mmmm" saiu como "Hum", o que **confirma que os fonemas isolados precisam ser gravados por fonoaudióloga**.

## Rodada 3: vozes infantis de desenho, Sofia e Tales (pasta `rodada-3-infantil/`)
O dono pediu vozes "lúdicas, infantis de desenho" para os dois. Esta rodada usa o Eleven v3, com vozes desenhadas como **dubladora adulta fazendo voz de personagem infantil de animação**. Cada voz tem 2 tomadas.

| Arquivo | Personagem | Estilo |
|---|---|---|
| `H-sofia-desenho-fofa-1/2.mp3` | Sofia | Muito aguda, fofa, saltitante, risonha |
| `J-sofia-desenho-meiga-1/2.mp3` | Sofia | Aguda, suave, cantadinha, acolhedora |
| `K-tales-desenho-moleque-1/2.mp3` | Tales | Aguda, levemente rouca, moleque, corajosa |
| `L-tales-desenho-curioso-1/2.mp3` | Tales | Clara, entusiasmada, inventor curioso |
| `M-tales-desenho-gentil-1/2.mp3` | Tales | Calorosa, simpática, melhor amigo |

Um quarto estilo da Sofia ("esperta, nasalada") foi **bloqueado pelo filtro de segurança** do ElevenLabs e não foi insistido. As vozes ainda não foram salvas na conta; os IDs temporários ficam fora do repositório. As amostras E/F/G da rodada 2 continuam valendo como opção.

## Escolha do Tales
O dono escolheu **`K-tales-desenho-moleque-1`**. A voz foi salva na conta com o nome **"Tales — FONEMA"**.

## Rodada 4: Sofia mais natural (pasta `rodada-4-sofia-natural/`)
O dono achou as vozes H e J "forçadas, pouco naturais". Esta rodada pede uma voz de menina de desenho **espontânea, de conversa, sem exagero**, como a do Tales escolhido. O texto quase não usa marcações de emoção e a geração foi mais contida (guidance 3). São 3 estilos, com 3 tomadas cada:
- **N:** natural e sorridente;
- **O:** doce e tranquila;
- **P:** esperta e levemente rouquinha.
