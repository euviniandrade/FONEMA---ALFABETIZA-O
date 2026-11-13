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
