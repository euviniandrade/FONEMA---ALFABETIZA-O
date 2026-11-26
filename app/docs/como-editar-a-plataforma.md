# Como editar a plataforma FONEMA (passo a passo para o dono)

Pela **Área do administrador** (`#/admin`) dá para mudar quase tudo sem programar: **textos e falas** da Sofia, do
Tales e do Bolota, **missões** (títulos, palavras das atividades, ordem das cenas, ligar/desligar cenas, criar uma fase
nova a partir de outra), **personagens**, **peças da Lojinha**, **selos**, **histórias**, **textos para ler sozinho**,
**fichas de leitura**, **figuras e modelos 3D**, **recursos** (ligar/desligar) e os **textos da entrada**. E, como antes,
trocar **qualquer áudio** pela sua voz ou a da Agatha (o áudio novo toca **exatamente onde o antigo tocava**).
Novo: o **Estúdio criativo** (passo 1-A) junta **jogos** (nome, ligar/desligar, ordem, palavras), **personagens**,
**vozes** e o **robô de voz** (a sua voz transformada em voz de adulto, cômica ou de personagem, pelo ElevenLabs).

Como o FONEMA ainda não tem servidor (decisão D032), tudo o que você muda vale primeiro **só no aparelho** onde você
mudou. Para valer para todo mundo, você gera um **pacote** e quem cuida do repositório o aplica (passo 12).

> **A regra que o sistema não deixa quebrar:** a criança só lê palavra com sons que ela já aprendeu (regra 2). Toda
> palavra que você coloca numa atividade de ler ou escrever passa pelo **verificador** na hora. Se a criança ainda não
> sabe algum som dela, aparece **"Bloqueado pelo verificador"** com o motivo em linguagem simples, e o botão Guardar
> fica apagado. Palavra que o sistema ainda não conhece pede a **pronúncia** (perguntas simples: o "e" é aberto ou
> fechado? o "o" do fim soa "u"?).

> **Autorização:** gravar a voz de uma pessoa para o produto pede **autorização por escrito** dela (e do responsável,
> se for criança). Guarde esse papel. Na tela há um quadrinho "A pessoa autorizou por escrito": marque só se for verdade.

## 1. Entrar na Área do administrador

1. Abra o FONEMA e entre na Área da Família ou do Professor › **Configurações**. No fim da página tem o link pequeno
   **"Área do administrador"** (ou digite no endereço `#/admin`, por exemplo `https://fonema.vercel.app/#/admin`).
2. Na primeira vez, escolha **o seu nome e uma senha** (pelo menos 8 caracteres, com letras). A senha não fica guardada:
   só uma "impressão digital" dela. Anote a senha num lugar seguro.
3. Esqueceu a senha? Em "Esqueci a senha" dá para **zerar** o acesso (pede o PIN de um adulto do aparelho). Zerar apaga
   os áudios trocados e as mudanças que ainda não foram publicados.

Sem servidor, o acesso e os áudios trocados ficam **só no aparelho e no navegador** onde você fez.

## 1-A. Estúdio criativo: jogos, personagens, vozes e robô de voz (novo, 26/11)

Aba **Estúdio criativo** (`#/admin/estudio`). São quatro cartões grandes no topo. Tudo o que você muda aqui vale na hora
**neste aparelho** e vai no **mesmo pacote** do Publicar (passo 12). As outras abas continuam iguais.

**Jogos** — cada jogo do Parque aparece com a **prévia do cartão** (como a criança vê).
1. **Subir / Descer** muda a ordem dos cartões no Parque.
2. **Editar** abre: *Jogo ligado* (desmarque para desligar), *Nome do jogo* e *O que treina* (a linha do cartão). Toque
   em **Guardar** em cada campo.
3. Desligar um jogo tira o cartão do Parque, o "Novo!" e o convite do fim da missão. O jogo que faz parte de uma
   **lição** continua (é parte da lição). As regras do jogo não mudam por aqui.
4. **Casa do Som — palavras que a criança escreve:** cada palavra aparece com a figura e **a lição a partir da qual a
   criança consegue escrevê-la** (ex.: "a partir da TF-17"). Para pôr uma palavra, escreva em *Palavra nova* › **Pôr na
   lista** › **Guardar a lista**. O verificador confere na hora e **bloqueia** palavra sem pronúncia anotada (abre as
   perguntas de pronúncia), sem figura, sem a voz da Sofia gravada ou com vogal que muda na fala (como em "cama"). No
   jogo, cada criança só recebe a palavra depois da lição dela. **Voltar à lista original** desfaz.
5. **Ver o jogo como** (uma criança deste aparelho) › **Abrir o jogo**: abre o jogo com o progresso dela (o que ela
   jogar conta para ela).

**Personagens** — a **prévia do elenco** (figura, nome e cor de cada um) e, logo abaixo, o editor de sempre: nome, cor,
quem é, como se apresenta, figuras e "Trocar o nome nas falas". Atalhos para **Imagens** (trocar figura ou modelo 3D: o
arquivo novo entra no mesmo lugar) e **Foto → 3D**. A roupa da Sofia, do Tales e do Bolota é a do desenho/modelo: para
mudar, troque a figura ou o modelo. As roupas e cores do boneco **da criança** são escolhas dela na Lojinha.

**Vozes** — escolha **Sofia, Tales, Bolota ou Sons das letras** e aparecem todos os áudios daquela voz, com o texto ao
lado: **Ouvir**, **Subir áudio** (gravar de novo ou subir arquivo), **Voltar ao original**. É a mesma lista da aba
Áudios, já filtrada.

**Robô de voz** — você grava a sua fala e a inteligência artificial do **ElevenLabs** devolve a **mesma fala, com o seu
jeito de falar (emoção, pausas, ritmo)**, em outra voz: **Adulto (narrador)**, **Cômica (personagem)** ou **Personagem
infantil (desenho)**. Quem troca a voz é a IA; o FONEMA não mexe no tom nem na velocidade.
1. **A chave do ElevenLabs (uma vez só):** entre em **elevenlabs.io** com a sua conta › clique no seu perfil (canto de
   baixo) › **API Keys** › **Create API key** (deixe marcado *Speech to Speech* e *Voices*) › copie a chave (começa com
   `sk_`). No Estúdio, passo 1, cole e toque em **Guardar neste aparelho**. Ela aparece escondida (só os 4 últimos
   caracteres), fica **só neste aparelho**, não vai no pacote, nem no código. **Apagar a chave deste aparelho** tira.
2. **Custos:** cada toque em **Transformar** é uma conversão e **gasta créditos da sua conta do ElevenLabs** (mais ou
   menos pelo tamanho do áudio; o plano grátis tem pouco). O sistema **não repete sozinho**. Buscar as vozes não gasta.
3. **Vozes e cenários (passo 2):** toque em **Buscar minhas vozes**. Para cada cenário escolha uma voz da sua
   biblioteca (o sistema sugere pelo nome, ex.: "Sofia — FONEMA" para o personagem infantil). Não tem uma voz cômica ou
   de narrador? Crie no ElevenLabs (Voice Design) e toque em **Atualizar minhas vozes**.
4. **Voz de criança:** o ElevenLabs **não faz voz de criança de verdade**, e o FONEMA não tenta contornar isso. O
   "Personagem infantil" é uma voz de desenho animado **feita por adulto**, como a Sofia e o Tales (decisão D011).
5. **Grave (passo 3):** marque *"A voz gravada é minha, ou a pessoa me deu autorização por escrito"* (sem isso o botão
   não liga), escreva quem grava e toque em **Gravar agora** (até 30 s) ou **Subir um arquivo**.
6. **Transformar (passo 4):** escolha o cenário (ou outra voz da biblioteca) e toque em **Transformar**.
7. **Usar (passo 5):** **Ouvir**, **Comparar** (toca a sua voz e depois a transformada), **Baixar** (mp3) ou **Salvar
   numa fala**: procure a fala, palavra ou nome e toque nela; o áudio passa a tocar ali **neste aparelho**. Os sons
   puros das letras não aparecem (esses só com voz humana gravada). No pacote, esse áudio vai marcado como **voz
   sintética (robô)**, com a voz e o modelo usados, nunca como voz humana.
8. **Se der erro:** a tela diz o motivo em palavras simples — sem chave, chave recusada, **sem créditos**, muitos
   pedidos, sem internet, áudio ruim. Nada é gasto de novo sem você tocar outra vez.

> Conferido sem gastar créditos: os testes usam um ElevenLabs **falso**. O formato da API (endereço
> `api.elevenlabs.io/v1/speech-to-speech/<voz>`, campos `audio` e `model_id`, modelo `eleven_multilingual_sts_v2`) segue a
> documentação pública, mas **não foi conferido ao vivo** (o site estava fora da rede desta sessão). Se a primeira
> conversão de verdade der erro "outro", avise: o ajuste fica num lugar só (`web/src/servicos/robo-voz.ts`, bloco `ELEVEN`).

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

## 4. Textos e falas

Aba **Textos e falas**: todas as falas (Sofia, Tales, Bolota), títulos, dicas, perguntas e textos de tela, com o lugar
onde aparecem (ex.: "TF-10 › acolhida"). Procure por uma palavra ou pela missão (TF-10), mude o texto e toque em
**Guardar**.

- Ao mudar uma **fala**, o áudio dela fica **desatualizado**: aparece o aviso amarelo com **Gravar ou subir**, para pôr a
  voz certa ali mesmo. Enquanto não tiver voz, a fala aparece escrita no balão (a dupla fica calada nela).
- `[NOME]` vira o nome da criança. `{pronto|pronta|Tudo pronto}` = jeito de menino | de menina | neutro.
- **Desfazer** volta um passo; **Voltar ao original** volta ao texto de antes de qualquer mudança.

## 5. Missões

Aba **Missões**: a jornada inteira, na ordem em que a criança faz. Toque numa missão para abrir.

- **Título, objetivo, fala de abertura e fala do fim**: mude e guarde, como nos textos.
- **Cenas**: as setas ↑ ↓ mudam a ordem; o quadrinho **ligada** liga ou desliga a cena (desligada não aparece para a
  criança, mas não é apagada: é só ligar de novo).
- **Editar esta cena**: mostra uma **pré-visualização** (o que a criança vê e ouve) e os campos da cena:
  - **Palavra para ler**: escreva a palavra nova e toque em **Trocar**. A figura certa muda junto. O verificador confere
    na hora (ex.: na TF-10, "lama" passa; "pato" é bloqueada porque o som do P só vem na TF-16). Palavra sem figura: o
    quadro de **subir a figura** aparece ali mesmo (a imagem é recortada no tamanho das figuras do app).
  - **Juntar os sons**: a palavra que os sons formam e pelo menos 2 outras opções (3 no total).
  - **Caixas de sons**: a palavra (as letras para montar vêm sozinhas, com uma a mais).
  - **Pares mínimos**: a palavra certa, a outra do par (precisa mudar UM som só, como faca × vaca) e a 3ª opção. A
    habilidade do par (o que aparece no painel) acompanha os sons que mudam; par de sons ainda sem habilidade é recusado.
    No "ouvir e tocar a figura", as três precisam de figura.
  - **Troca-letras**: a palavra de antes e a nova (uma letra trocada ou uma a mais); a letra, o som e as opções vêm sozinhos.
  - **Frases**: a frase, a resposta certa e as 3 figuras da pergunta.
  - **Ditado**: as palavras, com vírgula (as letras para montar se ajustam).
  - **Palavras** (montar, palmas): separadas por vírgula.
  - Em todas: os sons de cada letra saem do banco de palavras; palavra nova pede a **pronúncia** antes; som ainda não
    ensinado é **bloqueado**.
  - As falas da cena (enunciado, dicas, roteiro da dupla). Se a mesma fala aparece em outras missões (ex.: "Leia a
    palavra e toque na figura."), aparece a escolha **só aqui** ou **em todos**.
- **Abrir a lição (aba nova)**: escolha uma criança do aparelho e veja a missão como ela vê (a missão precisa estar aberta
  para ela).
- **Criar fase nova a partir desta**: copia a missão inteira com outro nome. Escolha **rascunho** (fora da jornada, só você
  abre) ou **na jornada, logo depois desta** (quem já passou dali vai encontrar a fase nova como a próxima). Depois, edite
  a fase nova como qualquer outra. "Apagar esta fase nova" tira a fase (nada do progresso some). A fase nova aparece
  também no caminho do tutorial e do painel guia (na mesma etapa da fase de onde foi copiada).
- **Voltar esta missão ao original**: tira todas as mudanças da missão.

## 6. Personagens e prêmios

Aba **Personagens e prêmios**:
- **Personagens**: nome, cor, quem é, fala de apresentação e as figuras/modelo 3D (toque em "trocar" ao lado de cada
  figura). **Trocar o nome nas falas**: escreva o nome novo, veja cada fala com o antes → depois, desmarque o que não
  deve mudar e toque em Trocar. As falas mudadas ficam com o áudio desatualizado (regrave em Textos e falas ou Áudios).
- **Peças da Lojinha**: nome, preço em moedinhas, a frase "Por que guardar?" e a figura.
- **Prêmios surpresa**: nome, nível em que chegam e figura.
- **Selos e conquistas**: nome, desenho do selo (emoji ou letra) e a dica do cadeado.

## 7. Histórias, textos e fichas

Aba **Histórias e leitura**:
- **Textos para ler sozinho**: título, frases e perguntas. Cada frase passa pelo verificador (ex.: "A ema viu o rato."
  é bloqueada no texto da TF-15, porque o R ainda não foi ensinado).
- **Histórias (ouvir)**: título, texto de cada página (e a figura dela), perguntas e vocabulário.
- **Fichas de leitura**: título e palavras de cada campo (a palavra precisa ter a pronúncia anotada e figura).

## 8. Imagens e modelos 3D

Aba **Imagens**: todas as figuras do app, por pasta. Toque numa figura › **Escolher imagem** › escolha **Inteira** ou
**Cortar para preencher** › veja o antes e o depois › **Guardar**. A figura nova sai no mesmo tamanho e formato da
original (webp), recortada no próprio navegador, e aparece em todas as telas que usam aquela figura. Modelos 3D (.glb,
pasta modelos3d) entram como vieram. **Voltar ao original** desfaz.

## 9. Configurações (aba Site)

- **Recursos ligados para todos**: Passear 3D, Brincar, Leitura e Jogos. Desligar só esconde o botão (nada é apagado).
- **Textos da entrada**: "Quem vai entrar?", os botões e a nota do rodapé.

## 10. Histórico (desfazer)

Aba **Histórico**: tudo o que foi mudado neste aparelho, do mais novo para o mais velho, com quem mudou e quando. Cada
item tem **Desfazer** (volta um passo) e **Voltar ao original**; **Voltar tudo ao original** limpa tudo deste aparelho. Se o conteúdo do repositório mudou e uma edição antiga
perdeu o lugar, ela aparece em "Edições sem efeito" (nada quebra).

## 11. Transformar foto em 3D

Aba **Foto → 3D**: o lugar da ferramenta que transforma uma foto em modelo 3D (está sendo feita em outra frente). Até lá,
um modelo .glb pronto entra pela aba Imagens (pasta modelos3d).

## 12. Publicar para todos

1. Aba **Publicar** › **Gerar pacote com tudo**. Baixa um arquivo `fonema-pacote-AAAAMMDD-HHMM.zip` com as mudanças do
   conteúdo, as figuras e os áudios trocados.
2. Mande esse arquivo para quem cuida do repositório (Drive, e-mail ou WhatsApp).
3. Quem cuida do repositório, na pasta `app/`:
   ```
   npx tsx scripts/importar-pacote.ts caminho/do/pacote.zip --seco    # só confere e mostra o que vai fazer
   npx tsx scripts/importar-pacote.ts caminho/do/pacote.zip           # aplica
   ```
   O importador junta as mudanças às já publicadas (`packages/conteudo/src/edicao/publicadas.json`), **roda o verificador
   de decodificabilidade e os testes** e, se algo quebrar, **não aplica nada** e diz por quê. As figuras vão para
   `web/public/assets/...` (no lugar das antigas) e os áudios seguem o caminho de sempre (abaixo).
4. Commit e publicação de uma versão nova do site. A partir daí, todo mundo vê as mudanças.

O botão antigo **Gerar pacote de áudios** continua lá, só com os áudios (passo 13).

## 13. Só os áudios (pacote antigo)

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
- **As mudanças somem se eu apagar os dados do aparelho?** "Apagar todos os dados" das Configurações não mexe nelas.
  Limpar os dados do site no navegador apaga. Publique (passo 12) para não perder.
- **Mudar uma missão estraga o progresso das crianças?** Não. As missões e cenas guardam o mesmo nome por dentro; cena
  desligada não é apagada; fase nova ganha um nome novo.
