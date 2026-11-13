# FONEMA · Personagens e ambientes (proposta unificada)

Esta pasta traz a **bíblia visual atualizada** da Sofia, do Bolota e do elenco da vila, com 3 ambientes ilustrados e a nova tela do **Espelho do Som**. Ela atende ao requisito 1 da [Decisão 005](../../../decisoes/005-proposta-unificada.md), "Personagens e ambiente melhores", e continua os documentos [23](../../../pesquisa/23-agente-pedagogico-sofia.md) (bíblia da Sofia), [28](../../../pesquisa/28-arte-animacao-audio.md) (arte, animação e áudio) e [10](../../../pesquisa/10-neuro-fala-multissensorial.md) (fala audiovisual).

> **O que é isto.** É **arte de referência** vetorial, feita em SVG à mão (código em `fonte/`) e renderizada em PNG pelo Playwright com escala 2×. Ela fixa proporções, paleta, personalidade, regras de uso e camadas de animação. **Não é a arte final.** A versão de produção será redesenhada por ilustradora profissional e animada em Rive (§5).

## 1. Arquivos

| Arquivo | Conteúdo |
|---|---|
| `sofia-folha-modelo.png` | Turnaround da Sofia (frente, ¾, perfil, costas), grade de altura em cabeças, paleta HEX |
| `sofia-expressoes.png` | 12 expressões, todas sem chantagem emocional |
| `sofia-poses.png` | 8 poses de ensino: apontar, mão no pescoço, dedo no nariz, ouvir, celebrar, explicar, convidar, despedir |
| `bolota-folha-modelo.png` | Bolota em vista lateral, frente e costas; virando bola em 3 tempos; escala com a Sofia; paleta |
| `bolota-expressoes.png` | 12 expressões e estados do Bolota, entre eles "errou (oops)", "aprendeu!", "tímido" e "rolando como bola" |
| `bocas-visemas.png` | As 12 bocas (visemas) de lip-sync e, para /m/ /f/ /v/ /s/ /l/ /a/, a boca de frente e o **corte lateral** (lábios, dentes, língua, véu palatino, ar, garganta vibrando) |
| `tela-espelho-do-som.png` | Tela de lição 2560×1600: Sofia, Espelho do Som (boca, corte animável com linha do tempo, espelho local da criança), letra, palavra com imagem, botão falar e Bolota |
| `ambiente-casa-sofia.png` | Interior da casa da Sofia: janela com ipê, cortinas de chita, rede, filtro de barro, estante, varal de letras e Bolota no tapete |
| `ambiente-praca-vila.png` | Praça da vila: casario, coreto, ipê, calçada de ondas, barraca e letreiros decodificáveis (PÃO, BOLO, LIVRO, SUCO) com os 6 moradores |
| `ambiente-bioma-cerrado.png` | Cerrado: chapada, vereda de buritis, ipê-amarelo e ipê-roxo, cupinzeiros, lobo-guará ao fundo e trilha de terra |
| `elenco-vila.png` | 6 moradores: Dona Cida (idosa), Davi (cadeirante), Tito (aparelho auditivo), Seu Kenji (padeiro), Jaci (bibliotecária) e Lia (inventora de robôs, com o robô Tec) |
| `fonte/` | Código-fonte das ilustrações. Gere tudo de novo com `node fonte/render.js` (ou `node fonte/render.js sofia-poses` para uma só) |

**Fontes tipográficas:** Andika em todo texto que a criança lê e Fredoka só em títulos, ambas sob licença OFL e guardadas em `fonte/fonts/`.

## 2. Sofia: bíblia atualizada

### 2.1 Quem é
- **Sofia, entre 9 e 10 anos, parda**, com cabelo **cacheado volumoso 3C/4A**. Funciona como a "prima que já sabe ler": mais velha que o público (4 a 7 anos), mas sem ser adulta.
- **Acessórios de identidade, que nunca mudam:**
  - **fivela de flor de ipê-amarelo**, um cacho de 3 flores sobre presilha de couro;
  - **mochila de exploradora** verde-mar com caderno amarelo e lupa;
  - pulseira de miçangas e brincos de bolinha.
- **Acessório pedagógico:** a camiseta Manga leva a **"letra da semana"** dentro de um círculo branco e muda a cada fase.
- **Personalidade:** calorosa, curiosa, paciente e brincalhona, com humor leve e sem sarcasmo. Tem **mentalidade de crescimento**: elogia o esforço e a estratégia, nunca o "ser inteligente". É humilde e às vezes diz "hmm, deixa eu pensar". É **contingente**: reage ao que a criança fez de fato.

### 2.2 Voz
- Usar TTS neural pt-BR **expressivo**, com variação de altura e pausa antes da resposta. Nas instruções, falar de 10% a 15% mais devagar.
- **Gravar com voz humana os fonemas isolados.** Uma fonoaudióloga ou a dubladora grava /fff/, /mmm/ e /sss/, porque o TTS erra esses sons.
- Ter de 15 a 30 variações para cada tipo de fala.
- Ser transparente com as famílias: "a voz da Sofia é gerada por computador".
- Sotaque neutro por padrão. Os "pacotes de lugar" regionais ficam só nas histórias.

### 2.3 Regras de uso
1. **A Sofia nunca diz** "fiquei triste porque você saiu", "não me deixa sozinha" ou "só mais uma!", nem "você é muito inteligente!". Também nunca compara a criança com outras crianças.
2. **A Sofia nunca vende.** Ela não aparece na lojinha pedindo compra nem em anúncio, e a monetização fica separada da personagem.
3. **Ela fica parada e atenta enquanto a criança responde.** Espera de 3 a 5 segundos ouvindo e não tem animação de fundo durante a tarefa.
4. **O gesto aponta para o que importa** (sinalização). Ela olha para a criança ao perguntar e elogiar, e olha para a tarefa ao explicar.
5. A expressão **"empática"** acolhe a dificuldade da *tarefa* ("esse som é difícil mesmo") e nunca a culpa da criança. Na tela de erro não existe tristeza nem decepção.
6. A Sofia **comemora grande** só no fim do bloco, com brilho de até 1,5 s e sem flash acima de 3 Hz.
7. Quando perguntam, a Sofia explica que é "uma personagem do jogo, que foi desenhada e fala com voz de computador".

### 2.4 Proporção e construção
- Altura de **4 cabeças**, com os olhos na metade da cabeça e o rosto redondo com bochechas.
- Mãos de 4 dedos arredondadas. O contorno tem de 3,5 a 4 px numa figura de 1000 px, sempre em `#3A2218`, nunca preto puro.
- Luz de cima à esquerda, sombras suaves com 20% a 45% de opacidade e cachos com reflexos `#6B4130`.

### 2.5 Paleta
| Papel | HEX |
|---|---|
| Pele / sombra / luz | `#A86B47` / `#7E4E33` / `#C48A62` |
| Cabelo / brilho | `#2E1B12` / `#6B4130` |
| Camiseta Manga (acento, nunca texto) | `#F28C28` |
| Bermuda jeans | `#2F5DA8` |
| Mochila / alças | `#1F7A70` / `#C77B2C` |
| Ipê (fivela, brincos) | `#F4B400` |
| Tênis (sola e cadarço Mata) | `#2F7D4F` |
| Contorno | `#3A2218` |
| Letra: vogal / consoante | Urucum `#C2410C` / Anil `#1D4ED8` |

## 3. Bolota
- **Quem é:** filhote de **tatu-bola** (*Tolypeutes tricinctus*), espécie ameaçada da Caatinga e do Cerrado. É claramente menor que a criança e chega à altura do joelho da Sofia, o que inverte a hierarquia. A pesquisa chama isso de **efeito protegido**.
- **Papel:** lê e fala **com erros planejados**, como trocar p/b, f/v e t/d, inverter sílabas ou espelhar b/d. A criança corrige e o Bolota **melhora de verdade** ao longo da sessão. No **caderninho amarelo** ele guarda o que aprendeu com a criança.
- **Regras:**
  - Ele nunca erra o que a criança ainda não domina.
  - O erro nunca vira piada humilhante: o "oops" é leve e logo vira "aprendeu!".
  - **Rolar como bola** é o jeito dele de pensar ou de se acalmar, nunca castigo nem sinal de medo.
  - Na tela, ele fica num canto e não disputa a atenção com a letra.
- **Anatomia estilizada:**
  - 3 cintas móveis, escudo da cabeça em forma de "chapéu" e escudo da cauda;
  - quando vira bola, os escudos da cabeça e da cauda **se encaixam**, como no animal real;
  - cabeça grande, olhos de filhote e orelhas que baixam no susto.

## 4. Espelho do Som (evolução da proposta 2)
Componentes da tela (`tela-espelho-do-som.png`):
1. **Boca da Sofia** em close frontal. É o que a criança consegue imitar. Na introdução do fonema, esse quadro mostra o **vídeo real da fonoaudióloga** e, na prática, a Sofia em Rive (ver 28 §3.1).
2. **"Por dentro"**: corte lateral esquemático em **camadas separadas** (mandíbula, lábios, língua, véu palatino, fluxo de ar e vibração da garganta). Uma **linha do tempo** com velocidade ½× deixa a criança percorrer o gesto, por exemplo "lábios fecham → ar pelo nariz → abre: MA".
3. **Seu espelho**: a câmera frontal **local** funciona como espelho. Nada é gravado nem enviado e não existe classificação automática da boca. O consentimento parental segue a LGPD, art. 14.
4. A **letra** aparece com o som (/m/), e a **palavra com imagem** (MALA) é colorida por vogal e consoante.
5. **Botão falar**, com a alternativa de **tocar** e o aviso "sua voz fica no aparelho". O Bolota fica no canto.

**Princípios:**
- Som, boca e letra são sempre **congruentes e simultâneos** (ver 10 §3.1).
- A tarefa fica em fundo dessaturado, com no máximo 3 elementos além do alvo (Fisher et al., 2014).
- O corte lateral usa legenda infantil fixa: "lábios fechados", "ar sai pelo nariz", "garganta vibra / quieta".
- O nome do recurso é **"Espelho do Som"** ou "Boca da Sofia", nunca "boquinhas", que é marca de terceiros.

## 5. Especificação para a produção final

### 5.1 Ilustração (diretora de arte ou ilustradora sênior)
- Redesenhar Sofia, Bolota e o elenco a partir destas folhas, mantendo silhueta, paleta, acessórios de identidade e proporções.
- Acrescentar o acabamento "feito à mão" previsto no guia do documento 28: contorno com leve variação de espessura e textura de lápis ou guache em multiply, com 5% a 8% de opacidade.
- **Entregáveis:**
  - turnaround final;
  - 12 expressões;
  - 12 bocas e 33 "modo boca" (um por fonema);
  - folha de mãos (6);
  - 3 trocas de roupa por fase;
  - silhueta para ícones;
  - 6 cenários (casa, praça, cerrado, mais litoral, caatinga e Amazônia), cada um com versão "tarefa" dessaturada.
- O corte lateral final de cada fonema tem **revisão de 2 fonoaudiólogas** com checklist articulatório.

### 5.2 Animação em Rive
- Arquivos: `sofia.riv`, `bolota.riv` e `espelho-corte.riv`. Efeitos e recompensas ficam em `.lottie`.
- **State machines da Sofia (camadas paralelas):**
  - `corpo`: idle-respira (sutil), ouvir, pensar, apontar-esq/dir/baixo, mão-no-pescoço, dedo-no-nariz, explicar, convidar, comemorar-pequeno, comemorar-grande, despedir, "vamos de novo";
  - `olhar`: alvo em x/y (criança ou tarefa);
  - `rosto`: as 12 expressões;
  - `boca`: propriedade numérica **`viseme` 0–11 via Data Binding**, alimentada pelos Viseme IDs do Azure pt-BR. O JSON é compactado em `[t_ms, boca]` e a boca é adiantada de 40 a 60 ms;
  - `letra-camiseta`: texto trocável.
- **State machines do Bolota:** `corpo` (andar, pular, sentar-ler, meio-enrolar, **bola** com rolagem e "abrir de novo"), `rosto` (12 estados) e `orelhas` (em pé ou baixas).
- **Corte lateral:** um osso para a mandíbula (rotação em torno da ATM) e para os lábios. A língua tem malha com 4 pontos (raiz, dorso, lâmina, ponta). O véu palatino tem 2 estados, e ar e vibração são camadas com *trim path*. Para cada fonema há um *timeline* feito à mão (33 no total) e um controle de velocidade (½×, 1×).
- **Regras técnicas:**
  - 24 fps;
  - squash & stretch leve;
  - nada se move durante a resposta da criança;
  - `prefers-reduced-motion` respeitado;
  - nenhum flash acima de 3 Hz.

### 5.3 Testes com crianças (antes de fechar o visual)
- Teste de **preferência e identificação** com crianças de 4 a 7 anos de pelo menos 3 regiões, comparando 2 ou 3 variações de cabelo, roupa e cor da Sofia. Exemplo de pergunta: "quem você quer que te ensine?". A pergunta vale também para o Bolota: "ele é seu amigo? você quer ensinar ele?".
- Teste de **compreensão do corte lateral**: a criança aponta "onde está a língua?" e diz "o ar sai por onde?".
- **Teste A/B do Espelho do Som**, com e sem o corte, medindo a discriminação de pares mínimos (p/b, f/v, oral/nasal).
- Pesquisa com famílias e professoras sobre como percebem a representatividade de cada personagem.

## 6. Cuidados: representatividade sem estereótipo
- **A Sofia é parda**, a maior parcela da população no Censo 2022 (45,3%). O elenco inclui pessoas pretas, indígenas, amarelas e brancas, com idades e corpos variados.
- **Cabelo crespo e cacheado aparece com volume e textura, nunca "alisado" no traço.** A pele tem tons próprios (`#A86B47`, `#5C3A26`, `#3B2419`, `#8D5A3B`, `#B07A50`, `#EBC39C`, `#F1C9A5`) e não usa o "laranja genérico".
- **Deficiência como parte da vida.** Davi é professor de música e usa cadeira esportiva. O aparelho auditivo do Tito é **azul e visível**, e ele mostra que "ver a boca ajuda todo mundo". Nenhum dos dois serve de "lição de superação".
- **Jaci (Guarani) é bibliotecária contemporânea**, sem cocar nem "fantasia". Seu Kenji é padeiro sem caricatura de olhos ou sotaque. Dona Cida é avó ativa, que conta histórias.
- **Regionalidade sem caricatura.** Chita, rede, filtro de barro, ipê, coreto e calçada de ondas são elementos de afeto, sem folclorizar nenhuma região.
- **Revisão obrigatória** por consultoria de diversidade, com pessoas negras e pardas, indígenas, pessoas com deficiência e educadoras de regiões diferentes, **antes** da ilustração final. Cada personagem secundário recebe a validação da sua comunidade.
- **Fauna real e respeitosa.** O tatu-bola e o lobo-guará aparecem como espécies a proteger, nunca como "bichos perigosos". Quando couber, os episódios explicam o bioma.
- **Ética:** sem câmera ou biometria por padrão, espelho só local, falas roteirizadas e aprovadas (sem IA generativa livre para a criança) e uma personagem que não manipula.
