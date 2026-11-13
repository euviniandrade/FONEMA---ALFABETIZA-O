# Sistema de Conquistas: selos, medalhas, troféus, títulos e patentes para 2 anos de jornada

> **Pedido do dono:** "Tem que ter selos, troféus, medalhas, todo tipo de premiação, animados. Selo até o final da jornada; quero MUITOS selos, que eles sempre tenham mais à medida que avançam. Se soltar tudo de uma vez perde a graça. Pense na estrutura organizada de selos para 2 anos de uso da plataforma. Selo para tudo."
>
> **Resposta desta pasta:** um sistema único de conquistas com **7 tipos**, **4 níveis** (bronze → prata → ouro → diamante), **11 escadas de patentes por área** e uma regra de **liberação gradual** que revela famílias novas a cada região, mês e evento. São **379 conquistas fixas** (12 do Maternal, 318 das regiões R0–R10 e 49 de eventos recorrentes), **56 selos gerados de Maestria do Som** (um por som, com estrelas de revisão sem fim) e **88 patentes** (11 áreas × 8 degraus). Isso soma **953 degraus** nos itens fixos, liberados aos poucos ao longo de ~104 semanas.
>
> **Base (não contradiz):** [D002](../../../decisoes/002-economia-virtual-avatar-educacao-financeira.md) (sem sorte, sem compra, nada se perde), [D008](../../../decisoes/008-avatar-3d-da-crianca.md) (sem joias: medalha não fica no pescoço do avatar), [D009](../../../decisoes/009-paleta-sem-arco-iris.md) (sem arco-íris), [D012](../../../decisoes/012-valores-cristaos.md) (celebrações neutras; Natal só se a escola quiser), [D014](../../../decisoes/014-plataforma-educativa-completa.md) (toda conquista tem objetivo de aprendizagem), [D017](../../../decisoes/017-roteiro-de-expansao-educativa.md) (conhecimento de base), [D018](../../../decisoes/018-professor-familia-selos-online.md) (selos infinitos, selo do professor/família, competição saudável), [D019](../../../decisoes/019-progressao-vilao-familia.md) (metas visíveis, títulos), [D021](../../../decisoes/021-lojinha-conquistas-nivelamento-maternal.md) (Minhas Conquistas por fase, sem pular fases, Trilha Expressa, Maternal), [D022](../../../decisoes/022-titulos-neutros-curva.md) (nomes neutros pela ação, curva de desafios) e [D023](../../../decisoes/023-escadas-de-patentes-por-area.md) (escadas de patentes). Também: [jornada](../jornada/README.md), [jogo completo](../jogo-completo/README.md) (tabela-mestre e [parte 07](../jogo-completo/07-progressao-niveis-e-titulos.md)), [recompensas 3D](../recompensas-3d/README.md), [esporte, respeito e ambiente](../esporte-respeito-ambiente/README.md) e [lojinha e emblemas](../lojinha-emblemas/README.md).
>
> Tudo aqui é **[proposta de conquistas]**. Quantidades, semanas e limiares são hipóteses para calibrar no piloto. O avanço é **por domínio, nunca por tempo**.

## Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| **README.md** (este) | Regras do sistema: tipos, níveis, liberação gradual, tela Minhas Conquistas, Trilha Expressa, curva de 2 anos, patentes, salvaguardas, animações, onde aparece, Maternal, dados e pendências |
| [catalogo.md](catalogo.md) | Catálogo completo pela linha do tempo: Maternal, R0–R10, eventos recorrentes, Maestria do Som e escadas de patentes, com tabelas-resumo e curva acumulada |
| [catalogo.json](catalogo.json) | Os mesmos dados estruturados (523 objetos), validados com `python -m json.tool` |
| [prompts-arte.md](prompts-arte.md) | 20 prompts em inglês para gerar as próximas famílias de selos, medalhas, troféus e brasões em lote |
| [`tools/conquistas/resumo.py`](../../../../tools/conquistas/resumo.py) | Lê o JSON, confere os campos e imprime contagens por região, categoria, semana e patente (saída no §13) |

---

## 1. Os tipos de conquista

| Tipo | O que significa | Quando aparece | Onde fica | No catálogo |
|---|---|---|---|---|
| **Selo** | Uma habilidade ou atitude específica que a criança **mostrou** (um som, uma regra, uma missão ambiental, um gesto de fair play) | Depois do fato, no ritual de fim da sessão (C9) | Álbum de Conquistas, página da fase | 289 fixos + 56 Maestria do Som |
| **Medalha** | Um **marco** vencido: chefe de região, primeira palavra, torneio cooperativo, festival | No fim do chefe ou do evento, numa comemoração curta com a dupla | **Estante** da casa da vila (gancho com fita) e Álbum. **Nunca no pescoço do avatar** (D008) | 23 |
| **Troféu** | Um **projeto grande** concluído ou um ano fechado (biblioteca, horta, cordel, Ano 1, formatura). Em projetos coletivos, **todos** recebem o mesmo troféu | No fim do projeto, com a família convidada a ver | **Estante de troféus** na casa da vila; o painel da família mostra a estante | 13 |
| **Título** (D019, nomes da D022) | A etapa da jornada de leitura: **Primeiros Sons → Caça às Sílabas → Exploração das Palavras → Leitura da Vila → Contação de Histórias → Guarda dos Livros → Maestria da Leitura**, cada um com I, II e III | Só ao passar um **portão de domínio** (chefe de região) | Placa no perfil e na porta da casa; item de avatar; área nova do mundo | 7 |
| **Patente** (D023) | O quanto a criança cresceu numa **área** (Natureza, Esporte e Fair Play, Dinheiro…): Aprendiz → Ajudante → Sentinela → Guarda → Guia → Especialista → Líder → Lenda | Quando a soma de conquistas da área passa o limiar e o portão de domínio (§6) | Brasão no perfil e na aba "Por área" do Álbum | 88 |
| **Estrela de fase** | Até 3 estrelas por fase: 1 domínio prático, 2 transferência fora do formato, 3 retenção de 7 dias | No mapa, ao fechar a fase e ao passar na retenção | Mapa e tela Minhas Conquistas da fase | 89 fases × 3 = 267 (geradas, fora do JSON) |
| **Emblema de coleção** | Completar uma coleção (figurinhas de bioma, instrumentos, livros). Completa-se comprando **ou** por domínio (lojinha §2.2) | Quando a última peça encaixa | Painel de coleções do Álbum | 14 |
| **Selo do professor/família** (D018) | O "✓ Aprendeu!" do professor no "Mostra pro professor", ou a confirmação do adulto numa missão em casa | Quando o adulto toca ✓ (sem resposta do professor em 72 h, vale o critério de domínio) | Álbum, com moldura azul-marinho (professor) ou terracota (família) e o parabéns gravado | 33 |

**Selo para tudo, mas sempre com aprendizagem:** cada linha do catálogo tem um **critério observável** ligado a um evento de aprendizagem (`dominio_confirmado`, leitura feita, missão concluída, validação do adulto). Não existe selo por abrir o app, por tempo de tela, por dias seguidos, por gastar moedas ou por sorte.

**Categorias** (cada item tem uma): fonema · sílaba · palavra · leitura · compreensão · valores e atitudes · esporte e fair play · meio ambiente · conhecimento de base (D017) · financeiro · emocional · pensamento computacional · família/professor · constância saudável · colecionador · segredo. A tabela região × categoria está no §13.

**Nomes neutros (D022):** todo nome descreve **a ação ou a conquista**, nunca a pessoa: "Caça às Rimas", "Pesca de Vogais", "Guarda do Meio Ambiente", "Amizade que Inclui", "Leitura Gentil", "Cuidado com os Animais", "Fair Play", "Maestria do Som M". A frase da dupla também é neutra: "Você conquistou **Leitura Gentil**, [NOME]!"

---

## 2. Níveis: bronze → prata → ouro → diamante

| Nível | Ideia | Regra geral (cada linha do catálogo detalha) | Moldura 3D |
|---|---|---|---|
| **Bronze** | Começou e conseguiu | Primeira vez que o critério é cumprido (ex.: domínio prático de um som) | Bronze quente, borda grossa |
| **Prata** | Consolidou | Mais casos, em **2 dias diferentes**, ou generalização com item novo e transferência fora do formato | Prata clara |
| **Ouro** | Domina e mantém | Retenção entre 24 h e 7 dias **e** uso real (ler uma história, recontar, missão em casa) | Ouro com brilho |
| **Diamante** | Domina, mantém por muito tempo e alguém viu | **Ouro + retenção depois de 60 dias + validação do professor ou da família** (resposta ao "Mostra pro professor" ou confirmação em 1 toque) | Moldura facetada azul-gelo translúcida (material de troféu, nunca pedra engastada nem adorno de corpo) |
| **Estrelas** | Para nunca acabar | Só em Maestria do Som, Maestria da Leitura e Lenda: 1 estrela a cada revisão de longo prazo bem-sucedida ou a cada 6 novos degraus da área | Estrelinhas douradas na faixa |

Regras fixas:
1. **Nada se perde.** Nível conquistado nunca desce. Faltar dias não rebaixa nada (D002, D018).
2. **Sem diamante por tempo.** Os 60 dias são de **retenção** (a criança lembra depois de 60 dias), não de uso contínuo.
3. **Validação simples:** se o professor não responder em 72 h, a família pode validar; sem nenhum adulto, o diamante fica "esperando um adulto ver" (aparece com a frase "Mostre para alguém!"), nunca bloqueia o resto.
4. **Itens únicos** (medalhas, troféus, vários selos de valores) têm um nível só. Medalhas e troféus de eventos que **voltam todo ano** mostram ×2, ×3 na estante.

---

## 3. Liberação gradual: sempre mais, nunca tudo de uma vez

O catálogo inteiro **nunca** é mostrado. A criança vê o que é dela agora e só uma pontinha do que vem depois.

| Regra | Como funciona |
|---|---|
| **1. Cada região revela as suas famílias** | Ao chegar numa região, uma cena curta da dupla "abre a página" nova do Álbum. Antes disso, os selos da região não aparecem em lugar nenhum |
| **2. Cada mês e cada evento revelam mais** | Desafio do Mês, Livro do Mês, eventos semanais (Esporte, Horta, Zum-Zum, Biblioteca…) e anuais (Copa das Letras, Feira de Leitura, Festival de Talentos) trazem famílias próprias quando começam |
| **3. Três estados antes de ganhar** | **Visível:** apagado, com cadeado e a dica ("Leia 5 palavras com M para desbloquear"). **Mistério:** só a silhueta e uma dica de como ganhar ("Tem a ver com a praia… e com uma tartaruga"). **Oculto:** os segredos (22), que só aparecem quando ganhos, com animação própria |
| **4. Sempre há um próximo visível** | Na vila, no mapa e no ritual de fim aparece **um** próximo objetivo com quanto falta: "Faltam 3 palavras para **Palavras da Mata** prata". A plataforma escolhe o mais perto de acontecer e ligado ao que a criança está aprendendo |
| **5. Poucos de cada vez** | Na tela da fase, no máximo 6–8 conquistas da fase + os 2–3 "em breve" da próxima. Para 4–5 anos, bolinhas para preencher em vez de números |
| **6. Nada some** | Selos de eventos que passaram continuam disponíveis na próxima edição; não existe "só hoje" nem contagem regressiva (lojinha L4) |

Distribuição atual do catálogo fixo: **128 visíveis**, **229 mistério** e **22 ocultos**.

---

## 4. Tela "Minhas Conquistas" por fase, sequência e Trilha Expressa (D021)

### 4.1 Ao entrar na fase
Toda fase tem dois botões grandes: **Lojinha** e **Minhas Conquistas**.

| Estado | Como aparece | Som e movimento |
|---|---|---|
| **Conquistado** | Brilhante, em cor plena, girando devagar em 3D; toque = a Sofia lê o nome e diz o que a criança fez ("Você leu 10 palavras com M!") | Brilho que passa a cada 4–6 s; parado no modo calmo |
| **Não conquistado (visível)** | Apagado, com **cadeado** pequeno de madeira e a **dica do desafio** lida pela Sofia: "Leia 5 palavras com M para desbloquear" | Sem movimento; o cadeado balança de leve ao toque |
| **Mistério** | Só a **silhueta** azul-marinho com "?" dourado e a dica curta | Sem movimento |
| **Oculto (segredo)** | Não aparece. Quando ganho, entra com a animação "revela segredo" | — |
| **Em progresso** | Apagado com barra **real** ("3 de 5") | — |

A tela tem três abas: **Esta fase** (padrão), **Por área** (patentes e brasões, §6) e **Coleções**. Não existe aba "todos os selos do jogo".

### 4.2 Um desafio por vez, sem pular fases
A progressão é **sequencial**: as conquistas de uma fase só são liberadas quando a criança chega nela, e as dicas falam só do desafio atual. Não existe atalho que pule fase nem selo que adiante conteúdo. Isso preserva a base do método fônico (cada som apoia o próximo).

### 4.3 Trilha Expressa: como os selos aparecem
Quem já sabe passa pelas fases iniciais em **provas-relâmpago**, uma fase por vez (D021 §3). **Recomendação: o selo é exatamente igual** ao de quem fez a fase no ritmo completo, **sem marca "Expresso"**.

| Ponto | Decisão proposta | Por quê |
|---|---|---|
| Aparência | Igual: mesma arte, mesmo nível, mesma animação | Manter a magia; o selo diz **o que a criança sabe**, não por onde ela passou. Marca diferente criaria duas classes de selo |
| Nível | A prova-relâmpago vale o **bronze** (domínio prático). Prata e ouro chegam depois, pela generalização e pela retenção, como para todos | O ouro pede retenção; ninguém pula isso |
| Ritmo de entrega | Os selos da fase entram **um a um no ritual de fim da própria fase**, nunca em avalanche; no máximo 3 animações completas por sessão e o resto na "colheita da semana" (§5) | Evita inflação e mantém cada selo especial |
| Fala | "Você já sabia isso, [NOME]! Olha o seu selo." | Reconhece o que a criança traz |
| O que não vem pela Trilha Expressa | Selos de valores, esporte, ambiente, família, coleções e segredos: ficam disponíveis para fazer quando quiser, sem pressa e sem perder nada | Eles medem atitudes e vivências, não provas |
| Registro | Só o painel do adulto e do professor mostra "conquistado via Trilha Expressa", para leitura pedagógica | A criança nunca vê diferença |
| Errou na prova-relâmpago | A Trilha desacelera ali e ensina com calma; o selo chega no ritmo normal | Ninguém se sente reprovado |

No JSON, o campo `trilha_expressa: true` marca os **146 itens** que a prova-relâmpago pode liberar.

---

## 5. Curva de 2 anos: muitas conquistas, sem inflação

O catálogo **oferece** bastante (veja a curva acumulada no §13: 137 degraus liberados até a semana 4, 708 até a 48, 1.177 até a 104). O que a criança **sente** é controlado por uma meta de frequência saudável de **entregas celebradas** (animação completa):

| Período | Semanas | Entregas celebradas por semana (meta) | Teto por sessão / semana | Grandes marcos do período |
|---|---|---|---|---|
| Maternal | antes de R0 | 1–2, sempre com o adulto | 1 / 2 | Troféuzinho dos Primeiros Sons |
| Arranque (R0–R1) | 1–6 | **2–4** (vitórias rápidas, D019) | 1 / 4 | Meu Nome, títulos Primeiros Sons e Caça às Sílabas, Medalha do Farol Aceso |
| Primeiras letras (R2a–R2b) | 6–16 | 2–3 | 1 / 4 | Medalha da Primeira Palavra, Primeira Historinha |
| Consolidação do Ano 1 (R3–R6) | 16–58 | **1–3** | 1 / 3 | Troféu da Biblioteca, Troféu Ano 1 Completo, título Contação de Histórias |
| Ano 2 (R7–R10) | 58–104 | 1–3, com marcos maiores e mais raros | 1 / 3 | Troféu da Estação, Troféu Livro da Minha Jornada, Formatura |
| Pós-jornada | 104+ | 1–2 | 1 / 2 | Estrelas de Maestria da Leitura e Lenda |

**Como o sistema respeita a meta (fila de entregas):**
1. **Uma entrega celebrada por sessão**, sempre no ritual de fim (C9), nunca no meio da tarefa.
2. O que passar do teto vai para a **Colheita da semana** (sexta-feira, "segunda planta, sexta colhe"): uma única cena em que os selos menores entram juntos no Álbum, com a Sofia lendo os nomes.
3. **Subidas de nível** (bronze → prata), **estrelas** e **sub-níveis de patente** (I → II → III) são "atualizações": um "tinc" e a moldura muda, sem animação completa.
4. **Sem inflação:** cada conquista pede um **evento de aprendizagem novo** (repetir o que já está dominado não dá nada, como as moedas: partida dominada rende 0 depois de 2 vezes no dia); os critérios crescem com a jornada (D022: 2–6 desafios por nível no começo, 8–14 no meio, até 24 no fim); medalhas e troféus ficam mais raros e maiores no Ano 2.
5. **Escalonamento por idade:** 4–5 anos, teto de 3 por semana e bolinhas no lugar de números; TDAH (Foco curto), micro-reconhecimento visual a cada 30–60 s **sem** contar como conquista; TEA (Previsível), as conquistas da sessão são anunciadas antes ("hoje você pode ganhar o selo X").

---

## 6. Escadas de patentes por área (D023)

Cada **área** tem a sua escada de 8 patentes neutras, cada uma com I, II e III; **Lenda** tem estrelas sem fim. Frase: "Parabéns, [NOME]! Agora você é **Sentinela da Natureza II**!"

| Degrau | Patente | Ideia | Aparece (semana-alvo) | Portão de domínio | Brasão 3D |
|---|---|---|---|---|---|
| 1 | **Aprendiz** | começando | 2 | qualquer região | madeira clara lisa |
| 2 | **Ajudante** | já ajuda | 8 | 1 conquista da área em R1 ou depois | madeira escura com friso de bronze |
| 3 | **Sentinela** | fica atento e protege | 18 | R2b ou depois | bronze polido com moldura de madeira |
| 4 | **Guarda** | cuida e defende | 32 | R3 ou depois | bronze e prata, duas folhas laterais |
| 5 | **Guia** | já ensina os outros | 50 | R5 ou depois | prata com faixa azul-marinho |
| 6 | **Especialista** | domina a área | 68 | R7 ou depois | prata e ouro, moldura dupla |
| 7 | **Líder** | inspira a turma | 86 | R9 ou depois | ouro com relevo e duas faixas |
| 8 | **Lenda** | alto escalão, estrelas sem fim | 100 | R10 (ou eventos do Ano 2) **e** validação do professor ou da família | cristal azul-gelo sobre base de ouro, com estrelas |

**As 11 áreas** e o que conta para cada uma: **Leitura** (leitura e compreensão) · **Escrita** (palavras, ditados, criação de histórias) · **Sons** (fonema, sílaba e Maestria do Som) · **Natureza** (meio ambiente) · **Esporte e Fair Play** · **Amizade e Respeito** (valores e emocional) · **Dinheiro** (financeiro) · **Ciências**, **Cidadania** e **Artes** (conhecimento de base, separados pelo tema) · **Tecnologia** (pensamento computacional e tecnologia). Selos de família/professor, constância, colecionador, segredos e títulos não entram em escada.

**Como se sobe:** soma de **degraus de conquistas da área** (cada bronze, prata, ouro, diamante ou conquista única conta 1; cada edição concluída de evento semanal ou mensal da área também conta 1, para a escada nunca travar). Os limiares foram calculados a partir do próprio catálogo (cerca de 40% dos degraus da área já liberados na semana-alvo) e estão em [catalogo.md §6](catalogo.md#6-escadas-de-patentes-por-área-d023) e no §13. **Alto escalão (Líder e Lenda) só perto do fim dos 2 anos**, porque os portões pedem conquistas de R9 e R10.

As patentes **convivem** com os títulos da jornada de leitura: o título mede o caminho principal (portões de chefe); a patente mostra em que a criança está crescendo em cada área. **Sem ranking** de patentes entre crianças (D018).

---

## 7. Salvaguardas

| # | Regra | Base |
|---|---|---|
| C1 | Conquista **só por esforço e aprendizagem**: cada critério lê um evento de aprendizagem. A camada de conquistas só **lê** eventos; nunca altera o modelo do aluno, o agendador ou o termômetro ("mão única") | jornada §6.4, D014 |
| C2 | **Sem sorte:** nada de sorteio, baú, roleta, carta surpresa. A surpresa está no conteúdo (segredos que se acham explorando e lendo), nunca em chance | D002, ECA Digital |
| C3 | **Sem compra:** nenhuma conquista se compra com dinheiro real nem com moedinhas; conquistas não dão vantagem de aprendizagem | D002, D018 |
| C4 | **Sem perda:** nada desce, nada expira, nada some; sem streak, sem "volte amanhã ou perde" | D002, D019 |
| C5 | **Constância saudável** mede **revisão espaçada e retenção** (Cultivo da Revisão, Dormiu e Lembrou, Lembrei de Longe) e hábitos bons (Hora de Descansar, Combinado Cumprido), nunca dias seguidos nem número de sessões | rel. 38, lojinha §2.1 |
| C6 | **Sem ranking por nível de leitura** e sem expor quem está com dificuldade. Comparação só consigo mesmo ("Recorde Pessoal" sem cronômetro). Metas coletivas (turma contra o Zum-Zum, Copa das Letras) mostram só o avanço da turma | D018 §3 |
| C7 | **Limites de tela:** teto diário e janela noturna valem; o ritual de fim não tem botão "continuar"; nenhuma conquista pede mais tempo de tela. Maternal: sessões de 5–10 min mediadas pelo adulto | D019, D021 |
| C8 | **Anúncio depois do fato** e elogio ao processo ("você leu o M em três histórias!"); os critérios ficam visíveis para quem quiser olhar, mas a sessão não diz "faça X para ganhar Y" no meio da tarefa | rel. 08 |
| C9 | **Valores e arte:** sem joias, sem arco-íris, sem magia, amuletos ou sorte; celebrações neutras; Natal só se a escola ativar; capoeira só como esporte | D008, D009, D012, D019 |
| C10 | **Privacidade:** gravações de voz ficam no aparelho; o adulto confirma sem foto da criança; a mensagem de WhatsApp não leva imagem do rosto | LGPD art. 14, ECA Digital |
| C11 | **Competição desligável** por criança (TEA, ansiedade) pelo professor ou pela família | D018 |

---

## 8. Animações de entrega por tipo

Todas em 3D, no padrão de [recompensas-3d](../recompensas-3d/README.md): borda grossa arredondada, brilho suave, paleta da marca. **Confete da marca:** pedacinhos de papel azul-marinho, amarelo-ipê e branco (nunca multicolorido em sequência de arco-íris). Duração curta e sempre **fora da tarefa**.

| Animação | Tipo | O que acontece | Duração | Som |
|---|---|---|---|---|
| **Giro 3D** | Selo | Entra girando em 3D, para de frente, um brilho passa da esquerda para a direita, partículas leves; a Sofia lê o nome; o selo voa para a página da fase no Álbum | 1,5–2 s | "tlim" de conquista + nome lido |
| **Medalha com fita** | Medalha | A medalha **desce pendurada na fita** lisa de 2 cores, balança, gira uma vez e **voa para o gancho da estante** (ou para o Álbum). **A fita não é colar: a medalha nunca fica no pescoço do avatar** (D008) | 2–3 s | sino suave + palmas curtas |
| **Troféu no pedestal** | Troféu | Um pedestal de madeira sobe, o troféu aparece girando, confete da marca cai, a dupla comemora; corte para a **estante de troféus da casa**, onde ele ganha lugar com plaquinha | 3–5 s | fanfarra curta de madeira e metais |
| **Placa de título** | Título | Placa de madeira entalhada desce presa por cordas, com o título; a Sofia e o Tales comemoram com o nome da criança; aparece o item de avatar e a área nova | 5–10 s | tema musical da região |
| **Brasão cresce** | Patente | O brasão do degrau anterior **se transforma** no novo (madeira → bronze → prata → ouro → cristal), ganhando detalhes; a faixa mostra o nome e o I/II/III | 2–3 s | acorde ascendente |
| **Encaixe na coleção** | Emblema de coleção | A última peça voa e encaixa; a moldura acende de dentro para fora | 1,5 s | "clac" de madeira |
| **Carimbo + voz** | Selo do professor/família | O carimbo desce no Álbum com um "toc", e toca o **parabéns gravado** pelo professor ou adulto (ou a frase pronta) com o nome da criança | 1,5 s + áudio | "toc" + voz |
| **Revela segredo** | Segredo | A silhueta (ou um envelope azul-marinho) se ilumina de baixo para cima e vira, revelando o selo | 2 s | "uau" curto da dupla |
| **Estrelinha** | Estrela de fase / estrela de nível | Estrela voa até o ponto da fase no mapa ou até a faixa do selo | 1 s | "tinc" |
| **Atualização** | Subida de nível ou sub-nível | A moldura troca de metal com um "tinc", sem cena | 0,5 s | "tinc" |

**Modos de inclusão:** modo calmo = fade e fala, sem confete nem partículas; Previsível (TEA) = aviso antes ("agora vai aparecer o seu selo") e animação sempre igual; Foco curto (TDAH) = versão de 1 s; leitor de tela e legendas em todas as falas.

---

## 9. Onde as conquistas aparecem

| Lugar | O que mostra | Regra |
|---|---|---|
| **Álbum de Conquistas** (antigo "Álbum de Selos") | Abas **Esta fase**, **Por área** (patentes) e **Coleções**; páginas por região, abertas só quando a região é liberada | Nunca mostra o catálogo inteiro (§3) |
| **Tela "Minhas Conquistas" da fase** | As conquistas da fase em 4 estados (§4.1) | Botão grande na entrada de cada fase (D021) |
| **Estante de troféus na casa da vila** | Troféus e medalhas (no gancho, com fita), com plaquinha lida; ×2, ×3 para eventos anuais | A criança escolhe o destaque; nada some |
| **Perfil e porta da casa** | Título atual (ex.: Caça às Sílabas II), até 3 conquistas em destaque e o brasão da área preferida | A criança escolhe o que mostrar |
| **Painel da família** | Conquistas da semana, nível e título, patentes, o que falta para o próximo, e **como conversar sobre isso em casa** | Explica a diferença entre nível/título (caminho) e termômetro (leitura) |
| **Painel do professor** | Fila de "Mostra pro professor" para validar em lote (10 em ~2 min), conquistas da turma em conjunto, origem Trilha Expressa | Sem ranking por leitura |
| **Mensagem de WhatsApp** (família) | Uma vez por semana, na colheita: "Esta semana, [NOME] conquistou **Palavras da Mata** (prata): leu 20 palavras com M, L e F em dias diferentes. Peça para [NOME] ler MALA e LUA para você!" + link para o painel | Sem foto da criança; texto com o critério; nada de "não esqueça de jogar" |

---

## 10. Bloco Maternal "Primeiros Sons" (D021)

Para crianças de cerca de 2–3 anos: **12 conquistas** simples, sem leitura, sempre **entregues junto com o adulto** (ele toca e comemora com a criança). Escuta (Orelhinha Atenta), sons dos bichos (Bicho que Fala), cantigas e ritmo (Cantiga Junto), rimas (Rima Boba), nome próprio (Meu Nominho), vocabulário, encaixe, emoções, esperar a vez, "hora de guardar" a tela e o carimbo "Brincamos Juntos" para atividades **fora da tela**. Ao completar o módulo, o **Troféuzinho dos Primeiros Sons** abre o Quintal (R0) sem prova. Animações mais lentas e sem confete; teto de 2 entregas por semana. ⚖️ Validar com pediatra e pedagoga de educação infantil (tempo de tela de 2 a 5 anos).

---

## 11. Dados e integração

Cada objeto do [catalogo.json](catalogo.json) tem: `id`, `nome`, `tipo` (selo, medalha, trofeu, titulo, patente, emblema_colecao, selo_validacao), `categoria`, `area` (escada de patente, ou `null`), `regiao` (MAT, R0…R10, EV), `semana_liberacao`, `criterio`, `niveis`, `animacao`, `descricao_arte`, `visivel_antes` (visivel, misterio, oculto), `trilha_expressa`, `gerado` (Maestria do Som e patentes). Eventos têm também `evento`, `recorrencia`, `calendario` e, no Natal, `opcional_escola`. Patentes têm `limiar_degraus` ([I, II, III]) e `degraus_totais_da_area`.

Para a arquitetura: a camada de conquistas é um **leitor de eventos** (`dominio_confirmado`, `retencao_confirmada`, `missao_concluida`, `validacao_adulto`, `chefe_vencido`, `evento_concluido`). Ela calcula o estado de cada conquista, aplica a fila de entregas (§5) e publica para o Álbum, a estante, os painéis e a mensagem semanal. Nenhuma conquista escreve no modelo do aluno.

---

## 12. Pendências para o dono decidir

1. **Trilha Expressa:** aprovar a recomendação de selo **igual**, sem marca "Expresso" (§4.3).
2. **Nome repetido:** "Primeiros Sons" é ao mesmo tempo o módulo Maternal (D021) e o 1º título da jornada (D022). Sugestão: manter o título e chamar o módulo de **"Maternal · Primeiros Sons"** nos documentos, ou renomear o módulo para "Primeiras Escutas".
3. **Diamante:** confirmar a regra "ouro + retenção de 60 dias + validação do professor ou da família" (pendência 9 do jogo completo).
4. **Metas de entrega** (§5): aprovar 2–4 por semana no começo e 1–3 depois, com a Colheita da semana para o excedente.
5. **Patentes:** confirmar os nomes lúdicos finais (D023 diz "a confirmar") e o limiar de ~40% dos degraus da área.
6. **Natal:** os 2 itens só aparecem se a escola ativar; confirmar se a família também pode ativar no uso em casa.
7. **Consultorias:** itens com conteúdo indígena (Livro do Rio), ERER (O Mar que Liga), cidadania (R9–R10) e biologia (fogo no Cerrado) seguem a validação já prevista na jornada.

---

## 13. Saída do `tools/conquistas/resumo.py`

Gerada com `python3 tools/conquistas/resumo.py` (use `--semanal` para a curva semana a semana).

### 13.1 Totais

- Itens no JSON: **523** = 379 conquistas fixas + 56 selos gerados 'Maestria do Som' + 88 patentes (11 áreas × 8 degraus, D023)
- Degraus (níveis) entregáveis nos itens fixos: **953**
- Itens fixos da jornada R0–R10 + eventos (sem o Maternal): **367**
- Itens liberáveis pela Trilha Expressa: 146
- Visibilidade antes de ganhar (fixos): visível 128, mistério 229, oculto 22

|            tipo | qtd (fixos) |
|-----------------|-------------|
|            selo |         289 |
|         medalha |          23 |
|          trofeu |          13 |
|          titulo |           7 |
| emblema_colecao |          14 |
|  selo_validacao |          33 |
|           total |         379 |

### 13.2 Região × categoria (itens fixos)

| região | fon | síl | pal | lei | comp | val | esp | amb | conh | fin | emo | pc | fam/prof | const | col | seg | total |
|--------|-----|-----|-----|-----|------|-----|-----|-----|------|-----|-----|----|----------|-------|-----|-----|-------|
|    MAT |   5 |   · |   · |   · |    · |   1 |   · |   · |    1 |   · |   1 |  1 |        1 |     1 |   1 |   · |    12 |
|     R0 |   5 |   1 |   · |   3 |    · |   2 |   1 |   1 |    1 |   1 |   1 |  1 |        1 |     1 |   1 |   1 |    21 |
|     R1 |   6 |   · |   · |   2 |    · |   1 |   3 |   2 |    1 |   1 |   1 |  1 |        2 |     1 |   1 |   1 |    23 |
|    R2a |   2 |   2 |   4 |   3 |    1 |   1 |   1 |   1 |    1 |   1 |   1 |  2 |        2 |     1 |   · |   1 |    24 |
|    R2b |   2 |   1 |   2 |   2 |    2 |   1 |   1 |   1 |    1 |   1 |   1 |  1 |        2 |     1 |   2 |   1 |    22 |
|     R3 |   2 |   · |   2 |   5 |    · |   1 |   4 |   1 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    27 |
|     R4 |   3 |   · |   2 |   3 |    2 |   2 |   3 |   1 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    28 |
|     R5 |   5 |   · |   1 |   3 |    1 |   1 |   4 |   2 |    2 |   1 |   1 |  2 |        2 |     1 |   1 |   1 |    28 |
|     R6 |   3 |   · |   2 |   5 |    1 |   1 |   2 |   1 |    2 |   1 |   1 |  2 |        3 |     1 |   1 |   2 |    28 |
|     R7 |   1 |   1 |   2 |   3 |    1 |   2 |   2 |   1 |    3 |   1 |   1 |  2 |        2 |     1 |   1 |   2 |    26 |
|     R8 |   · |   2 |   1 |   5 |    1 |   1 |   3 |   1 |    3 |   1 |   1 |  2 |        2 |     · |   3 |   2 |    28 |
|     R9 |   1 |   · |   5 |   3 |    1 |   1 |   7 |   1 |    6 |   1 |   1 |  2 |        2 |     · |   1 |   2 |    34 |
|    R10 |   · |   · |   1 |   6 |    3 |   1 |   1 |   2 |    4 |   1 |   1 |  2 |        2 |     1 |   2 |   2 |    29 |
|     EV |   · |   · |   1 |  15 |    · |   5 |   6 |   2 |    3 |   2 |   2 |  1 |        8 |     1 |   · |   3 |    49 |
|  total |  35 |   7 |  23 |  58 |   13 |  21 |  38 |  17 |   32 |  14 |  15 | 23 |       33 |    12 |  16 |  22 |   379 |

Gerados (Maestria do Som) por região: R1 5, R2a 3, R2b 3, R3 4, R4 6, R5 8, R6 7, R7 4, R8 13, R9 3

### 13.3 Curva acumulada de liberação (semana da jornada)

Semana 0 = módulo Maternal. Eventos entram na semana mínima em que podem aparecer. Conta selos, medalhas, troféus, títulos, coleções, vistos e Maestria do Som (sem as patentes).

| semana até | novos itens | itens acumulados | novos degraus | degraus acumulados |
|------------|-------------|------------------|---------------|--------------------|
|          0 |          12 |               12 |            26 |                 26 |
|          4 |          35 |               47 |           111 |                137 |
|          8 |          40 |               87 |           108 |                245 |
|         12 |          35 |              122 |            93 |                338 |
|         16 |          22 |              144 |            54 |                392 |
|         20 |          23 |              167 |            55 |                447 |
|         24 |          12 |              179 |            32 |                479 |
|         28 |           9 |              188 |            27 |                506 |
|         32 |          21 |              209 |            68 |                574 |
|         36 |          12 |              221 |            26 |                600 |
|         40 |          15 |              236 |            54 |                654 |
|         44 |          11 |              247 |            34 |                688 |
|         48 |          11 |              258 |            20 |                708 |
|         52 |          16 |              274 |            51 |                759 |
|         56 |          10 |              284 |            25 |                784 |
|         60 |          12 |              296 |            26 |                810 |
|         64 |          15 |              311 |            47 |                857 |
|         68 |           9 |              320 |            22 |                879 |
|         72 |           5 |              325 |            14 |                893 |
|         76 |          23 |              348 |            78 |                971 |
|         80 |          12 |              360 |            27 |                998 |
|         84 |           8 |              368 |            22 |               1020 |
|         88 |          17 |              385 |            50 |               1070 |
|         92 |          15 |              400 |            31 |               1101 |
|         96 |           7 |              407 |            17 |               1118 |
|        100 |          11 |              418 |            27 |               1145 |
|        104 |          17 |              435 |            32 |               1177 |

### 13.4 Escadas de patentes (D023): degraus de conquistas da área para chegar ao nível I

Cada célula: degraus somados na área para o nível I (semana em que a patente aparece).

|                área | Aprendiz | Ajudante | Sentinela |   Guarda |     Guia | Especialista |     Líder |      Lenda | degraus no catálogo |
|---------------------|----------|----------|-----------|----------|----------|--------------|-----------|------------|---------------------|
|             Leitura |   3 (s2) |   9 (s8) |  18 (s18) | 25 (s32) | 34 (s50) |     40 (s68) |  49 (s86) |  69 (s100) |                 151 |
|             Escrita |   3 (s2) |   6 (s8) |  11 (s18) | 14 (s32) | 18 (s50) |     24 (s68) |  30 (s86) |  44 (s100) |                  96 |
|                Sons |   3 (s2) |  38 (s8) |  48 (s18) | 72 (s32) | 94 (s50) |    115 (s68) | 145 (s86) | 167 (s100) |                 362 |
|            Natureza |   3 (s2) |   7 (s8) |  10 (s18) | 13 (s32) | 16 (s50) |     19 (s68) |  22 (s86) |  25 (s100) |                  44 |
| Esporte e Fair Play |   3 (s2) |   7 (s8) |  12 (s18) | 16 (s32) | 20 (s50) |     25 (s68) |  29 (s86) |  40 (s100) |                  87 |
|  Amizade e Respeito |   3 (s2) |   8 (s8) |  17 (s18) | 22 (s32) | 26 (s50) |     32 (s68) |  35 (s86) |  42 (s100) |                  91 |
|            Dinheiro |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  34 |
|            Ciências |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  27 |
|          Tecnologia |   3 (s2) |   6 (s8) |   9 (s18) | 14 (s32) | 17 (s50) |     22 (s68) |  25 (s86) |  31 (s100) |                  68 |
|           Cidadania |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  27 |
|               Artes |   3 (s2) |   6 (s8) |   9 (s18) | 12 (s32) | 15 (s50) |     18 (s68) |  21 (s86) |  24 (s100) |                  31 |

### 13.5 Checagens

- OK: nenhum problema encontrado.
