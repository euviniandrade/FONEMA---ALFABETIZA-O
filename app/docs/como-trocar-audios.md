# Como trocar os áudios do FONEMA (passo a passo para o dono)

Isto serve para colocar a sua voz, ou a da Agatha, no lugar de qualquer áudio da plataforma: o som de cada letra,
o nome da letra, as palavras, as sílabas e as falas da Sofia, do Tales e do Bolota. O áudio novo toca **exatamente
onde o antigo tocava**.

> **Autorização:** gravar a voz de uma pessoa para o produto pede **autorização por escrito** dela (e do responsável,
> se for criança). Guarde esse papel. Na tela há um quadrinho "A pessoa autorizou por escrito": marque só se for verdade.

## 1. Entrar na Área do administrador

1. Abra o FONEMA e entre na Área da Família ou do Professor › **Configurações**. No fim da página tem o link pequeno
   **"Área do administrador"** (ou digite no endereço `#/admin`, por exemplo `https://fonema.vercel.app/#/admin`).
2. Na primeira vez, escolha **o seu nome e uma senha** (pelo menos 8 caracteres, com letras). A senha não fica guardada:
   só uma "impressão digital" dela. Anote a senha num lugar seguro.
3. Esqueceu a senha? Em "Esqueci a senha" dá para **zerar** o acesso (pede o PIN de um adulto do aparelho). Zerar apaga
   os áudios trocados que ainda não foram publicados.

Sem servidor, o acesso e os áudios trocados ficam **só no aparelho e no navegador** onde você fez.

## 2. Gravar o alfabeto (o mais importante)

1. Aba **Áudios** › botão **Gravar o alfabeto**.
2. Escreva quem está gravando (ex.: Agatha) e marque a autorização.
3. Para cada letra aparece: a letra grande, o **faz de conta**, as **palavras-exemplo** e a dica de boca. Quando a letra
   tem dois sons (E, O, C, G, R, S, W), aparecem os dois.
4. Toque em **Gravar** › **Gravar agora**. O navegador pede o microfone (permita). Conta 3, 2, 1 e grava.
   Diga só o **som** ("mmm"), nunca o nome da letra ("eme"). Consoantes que estouram (p, b, t, d, k, g): curtinho, sem vogal depois.
5. Toque em **Parar**, depois **Ouvir antes de salvar**. Gostou? **Salvar no lugar do original**. Não gostou? **Outro**.
   "Aparar o silêncio" e "Igualar o volume" já vêm ligados (deixe assim).
6. Quando os sons da letra estão gravados, passa sozinho para a próxima. As letras feitas ficam verdes no alto.

Dica: grave num lugar quieto, com o celular ou computador a um palmo da boca.

## 3. Trocar qualquer outro áudio

Na aba **Áudios** está a lista de **todos** os áudios, cada um com o texto ao lado. Procure pelo texto (ex.: "bola")
ou filtre por tipo (som da letra, nome da letra, palavra, sílaba, frase), voz (Sofia, Tales, Bolota), letra ou fase.

- **Ouvir**: toca o que a criança ouve hoje.
- **Subir áudio**: escolha um arquivo do computador/celular (mp3, wav, m4a…) **ou** grave na hora.
- **Voltar ao original**: desfaz a troca.
- "Mostrar › Sem áudio" lista as falas que ainda não têm voz: elas também podem ganhar um áudio.

Depois de salvar, abra a lição (ex.: Letra M) e confira: já toca o novo **neste aparelho**.

## 4. Publicar para todos

1. Aba **Publicar** › **Gerar pacote de áudios**. Baixa um arquivo `fonema-pacote-audios-AAAAMMDD-HHMM.zip`.
2. Mande esse arquivo para quem cuida do repositório (Drive, e-mail ou WhatsApp).
3. Quem cuida do repositório, na pasta `app/`:
   ```
   npx tsx scripts/importar-pacote-audios.ts caminho/do/pacote.zip --seco    # só mostra o que vai fazer
   npx tsx scripts/importar-pacote-audios.ts caminho/do/pacote.zip           # aplica
   npm test
   ```
   O script coloca cada áudio no lugar certo (`web/public/audio/...`), atualiza os manifestos, roda a masterização
   (volume igual ao das outras falas) e marca na auditoria como **voz humana**. Se alguma gravação veio sem a marca de
   autorização, ele para e pede `--confirmo-autorizacao` (só use depois de conferir o papel assinado).
4. Commit e publicação de uma versão nova do site. A partir daí, todo mundo ouve os áudios novos (os arquivos ganham
   nome novo, então nenhum aparelho fica com o áudio antigo guardado).

## Perguntas rápidas

- **Os áudios trocados somem se eu apagar os dados do aparelho?** "Apagar todos os dados" das Configurações não mexe
  neles. Limpar os dados do site no navegador apaga. Publique (passo 4) para não perder.
- **Dá para publicar direto, sem mandar o arquivo?** Ainda não: precisa de servidor. O lugar já está pronto no código
  (`web/src/servicos/provedor-audios.ts`), sem nenhuma senha ou chave guardada.
- **A boca da Sofia/Tales acompanha a voz nova?** Acompanha o texto (balbucia), não a gravação exata; as bocas
  pré-calculadas são das vozes antigas.
