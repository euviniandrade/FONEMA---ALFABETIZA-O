# Espelho do Som — conceitos de direção de arte (15/11)

O dono rejeitou a boca modelada em código ("essas bocas estão horríveis"). Antes de construir outra versão, geramos conceitos
pela MiniMax (`image-01`) para ele escolher. Folha: `00-folha-conceitos.jpg`.

| Direção | Arquivos | Avaliação |
|---|---|---|
| **A · Professora** (adulta original, 3D de filme) | `A-professora-frente.jpg`, `A-professora-lado.jpg` | De frente é a mais bonita. O lado em corte saiu errado. |
| **B · Mascote** (boca-personagem) | `B-mascote-frente.jpg` | Mais estranha do que simpática. |
| **C · Massinha** (brinquedo educativo) | `C-massinha-frente.jpg`, `C-massinha-lado.jpg` | Frente limpa; lado feio. |

## Teste: a mesma personagem em outras bocas (`01-teste-mesma-personagem.jpg`)

Com referência de personagem, o rosto se mantém parecido, **mas o gerador não obedece à posição da boca**: pedimos boca bem aberta (A),
lábios fechados (M) e biquinho (U) e saíram três sorrisos; no M ainda apareceram brincos (proibido pela D008) e um dedo na boca.
Conclusão: **gerador de imagem sozinho não faz as ~30 bocas fiéis.** A vista de lado em corte também não sai bem por geração.

## Caminho recomendado (com o pacote Adobe do dono)

1. **Arte-base**: a personagem escolhida, de frente e de perfil, gerada e aprovada (uma imagem de cada).
2. **Bocas desenhadas à mão sobre a arte-base** no Photoshop (ou preenchimento generativo do Firefly só na região da boca),
   uma por visema, conferidas contra `docs/pesquisa/45-video-alfabeto-fonetico-referencia.md`.
3. **Adobe Character Animator**: boneco com o grupo `Mouth` nas 14 bocas padrão (Neutral, Ah, D, Ee, F, L, M, Oh, R, S, Uh, W-Oo, Smile, Surprised)
   → sincronização labial automática com o áudio → exportar um vídeo curto por som (fundo transparente) e as bocas avulsas.
4. **Vista de lado**: perfil da mesma personagem + língua, dentes, céu da boca e ar desenhados em camadas no Illustrator/Photoshop
   (uma posição por som), animados no After Effects ou no próprio app.
5. No app, o Espelho do Som passa a tocar esses vídeos/quadros, com frente e lado na mesma tela.

O que o conector Adobe desta sessão faz: remover fundo, ajustes, expandir imagem, vetorizar, vídeo (redimensionar/converter), fontes,
Express, PDF e Adobe Stock. **Não gera imagem nem opera os programas do computador do dono** (Photoshop, Character Animator, After Effects, Substance 3D).
