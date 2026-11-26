# D036 — Várias missões no mesmo dia, com o jogo levando à próxima

Data: 2026-11-26. Origem: **pedido do dono** (fila nº 31), com as palavras dele: "Eu preciso que ela consiga fazer mais missões,
não só uma missão. Quero que ela consiga fazer mais missões no mesmo dia e avance ali no processo. Acho que é importante."
Antes ele também tinha pedido (fila nº 30) que o jogo sempre leve a criança à próxima missão.

O que segue é **decisão do dono** (várias missões no dia, botão para a próxima) e **decisão do projeto [DP]** (os detalhes: o número
3 da pausa, as falas escolhidas, onde fica o botão). Nada aqui é afirmação de pesquisa nova.

**Substitui:** a regra "fim da missão sem botão de começar (C9/R13)" usada na fila nº 30 (`Ritual.tsx`, `Guia.tsx`) e o "Missão de
hoje: feita!" do painel guia (D032). As decisões antigas não foram reescritas.

## O que foi decidido
1. **A criança pode fazer quantas missões quiser no mesmo dia.** Nada bloqueia a próxima (o app já não bloqueava; o que faltava
   era o caminho na tela e o texto não mandar voltar amanhã).
2. **Fim da missão (C9):** botão grande **"Próxima missão"** com o nome dela, ao lado de **"Voltar para a vila"**, os dois presos
   embaixo da tela. O botão leva à **entrada** da missão seguinte (a criança toca em "Começar"); nada começa sozinho.
   A próxima é a fase atual da jornada: outra fase, ou a mesma de novo quando ela ainda precisa de mais uma sessão.
3. **Vila e trilhas:** depois de uma missão o painel guia mostra a próxima **disponível** ("Missão 2 de hoje", nome, barra vazia e
   "Continuar") e embaixo "Hoje: 1 missão feita". A pílula dourada das outras telas diz "Próxima missão".
4. **Nada de "amanhã" quando há outra missão agora.** As falas de fim são áudios gravados ("Amanhã a gente lembra!", "Amanhã tem
   mais um som!", "Amanhã a tartaruga precisa da nossa ajuda!"…). Não se gerou áudio novo e não se usa voz do navegador. Regra
   (`motor/src/guia.ts › fimDaMissao`): fica o gancho da fase quando ele não fala em amanhã; senão toca a fala **já gravada** do
   Tales **"Vamos continuar a missão?"**; não toca o "Tchau… a tela vai descansar". O balão mostra a fala que tocou. Os textos das
   fases não mudaram (o painel do administrador continua editando os mesmos).
5. **Pausa sugerida [DP]:** a partir da **3ª missão do dia** o fim mostra "Que tal uma pausa? Você já fez 3 missões hoje. Se quiser,
   a próxima espera por você." e volta ao fim de antes, com as falas gravadas ("Amanhã a gente lembra!" ou o gancho da fase, e
   "Tchau… a tela vai descansar e você também."). **Não bloqueia:** o botão "Próxima missão" continua lá, sem brilhar.
6. **Chefe que não passou:** a fala gravada diz "Vamos treinar mais um pouquinho e tentar de novo outro dia". Para não contradizer,
   nesse fim **não** aparece o botão "Próxima missão" (fica o "Tchau! Voltar para a vila"); da vila a criança pode tentar de novo.
7. **Painel da família:** "Esta semana" conta **missões** (eram "sessões", o mesmo número) e ganhou **"missões hoje"**.

## O que NÃO muda (regras 4 e 5 do CLAUDE.md)
- **Domínio:** o critério de `docs/pedagogia/06-avaliacao-e-intervencao.md` §2 [DP] continua igual (≥ 8 tentativas avaliadas, em
  ≥ 2 **sessões**, 4 das últimas 5 certas sem ajuda, firmeza ≥ 0,95). Exposição e autorrelato continuam não contando.
- **Revisão espaçada** (1, 2, 4, 8… dias; `revisao.ts`): a revisão de uma habilidade dominada hoje vence em outro dia; fazer mais
  missões hoje não antecipa a revisão.
- **Moedinhas:** o teto do dia (D002, `tetoDia` = 12) continua: depois dele o fim mostra só o elogio, sem "+0".
- O contador novo (`Progresso.missoesDoDia`) é só contagem; domínio, revisão e moedinhas não olham para ele.

## Conflito registrado (pesquisa × decisão do dono)
- `docs/pesquisa/42-neuro-jogo-telas.md` §3.3 **R13**: "Tela de encerramento sem botão 'continuar'… Nunca autoplay do próximo
  capítulo nem 'só mais um'". **R2** (mesmo arquivo, tabela de tempo): teto diário padrão de 15 min (1 sessão) aos 4–5 anos e
  2 sessões / 30 min aos 6–8. `docs/sintese/bloco-D-32-43.md` (conflito 7) registra 1 sessão por dia (máx. 2 com adulto) no rel. 37.
- **Vale a decisão do dono** (D036). Como o projeto respeita o que dá desses relatórios: nada começa sozinho (o botão leva à entrada,
  sem autoplay); a Sofia não implora nem fica triste (R14); "Voltar para a vila" fica sempre à vista ao lado (R15); a pausa é
  sugerida a partir da 3ª missão [DP]; o teto de moedinhas do dia não sobe (não há prêmio por jogar mais).
- O limite de tempo de tela diário do responsável (R3, "até 20/40 min") **não existe no app hoje**; fica como pergunta ao dono.

## Perguntas abertas ao dono
1. O critério de domínio pede 2 **sessões**, não 2 dias. Com várias missões no dia, a lição de um som de domínio (ex.: TF-01, som /a/)
   pode concluir no mesmo dia, em duas missões seguidas (testado). Manter assim, ou exigir 2 dias diferentes?
2. Pausa a partir da 3ª missão: o número está bom? Quer um limite diário que o adulto liga (com PIN), como a pesquisa 42 R3 sugere?

## Testes
`app/packages/motor/test/d036.test.ts` (três missões no mesmo dia: contador 1-2-3, AL-A conclui, TF-01 conclui na 2ª sessão, AL-E
abre; revisão em outro dia; só exposição não domina; teto de moedinhas; contador zera no dia seguinte; em toda fase o fim com
próxima missão não diz "amanhã" e a fala tem clipe gravado no manifesto; pausa; chefe). E2E `app/web/e2e/trecho-missoes.mjs`
(`--missoes`, também no `--sem-jornada`).
