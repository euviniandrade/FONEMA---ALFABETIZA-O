# 07 · Fontes, direitos e quadro de concordâncias

Só entram aqui os materiais enviados pelo dono para a D030 e os documentos que já existiam no repositório. **Nenhuma outra referência
foi acrescentada.** Os dados de cada material são os que aparecem no próprio arquivo, conforme as fichas em [`fontes/`](fontes/);
quando o arquivo não traz o dado, está escrito "não encontrado".

## 1. Materiais

| Sigla | Material, como aparece no arquivo | Como as páginas são citadas | Ficha |
|---|---|---|---|
| **ABC** | *Alfabetização Baseada na Ciência: Manual do Curso ABC*. Editores: Rui A. Alves (Universidade do Porto) e Isabel Leite (Universidade de Évora); coordenador: Carlos Nadalim (Sealf/MEC); cerca de 30 autores. Brasília: MEC/Capes, 2021. ISBN 978-65-87026-86-2. 557 p. | página do PDF (a impressa é a do PDF menos 26) | [fontes/02](fontes/02-manual-curso-abc.md) |
| **VT-PE** | *Vamos Todos Aprender a Ler: Guia do Professor — Pré-escola*. Renan de Almeida Sargiani e Ana Luiza Navas (autores e adaptadores). Banco Interamericano de Desenvolvimento (BID); editoração do Instituto Edube; © 2021. ISBN 978-1-59782-490-3. Adaptação do programa colombiano "Aprendamos Todos a Leer". | página do PDF | [fontes/03](fontes/03-manual-pratico-e-vamos-todos.md) |
| **VT-1A** | *Vamos Todos Aprender a Ler: Guia do Professor — Primeiro Ano*. Mesmos autores e instituição; © 2021. ISBN 978-1-59782-492-7. (A página de créditos diz "Pré-escola", aparentemente por erro.) | página do PDF | [fontes/03](fontes/03-manual-pratico-e-vamos-todos.md) |
| **MP** | *Manual Prático da Consciência Fonológica*. Sandra Puliezi. Instituto Ler Mais; 1ª ed., São Paulo, 2024. ISBN 978-65-982341-2-6. Cada atividade é assinada por uma professora. | página do PDF | [fontes/03](fontes/03-manual-pratico-e-vamos-todos.md) |
| **AO** | Alfabeto de sala com onomatopeias (36 cartazes). Título, autoria, instituição e ano: **não encontrados** (o arquivo só tem os metadados "Apresentação do PowerPoint", 2023). | página do PDF | [fontes/04](fontes/04-alfabeto-onomatopeias-e-morais.md) |
| **MOR** | *Consciência fonológica na educação infantil e no ciclo de alfabetização*. Artur Gomes de Morais. Belo Horizonte: Autêntica Editora, 1ª ed., 2019. ISBN 978-85-513-0518-8. | página do PDF (conversão de livro digital, sem a paginação do impresso) | [fontes/04](fontes/04-alfabeto-onomatopeias-e-morais.md) |
| **SOA** | *Alfaletrar: toda criança pode aprender a ler e a escrever*. Magda Soares. Editora Contexto. Ano e ISBN: **não encontrados** no arquivo (sem página de créditos; o dado mais recente citado no texto é de outubro de 2019). | página **impressa** (a do PDF é menor; ver a ficha) | [fontes/05](fontes/05-soares-alfaletrar.md) |
| **DIAG** | Diagnóstico pedagógico do código do FONEMA, feito em 2026-11-15 (documento interno). | seção (§) | [fontes/01](fontes/01-diagnostico-do-codigo.md) |

Limites de leitura, ditos nas fichas: do ABC, alguns capítulos foram lidos só por resumo e busca, e algumas figuras são imagem; do
Vamos Todos e do Manual Prático, parte das sequências foi conferida pela estrutura; o Alfaletrar foi lido como imagem e **as citações
foram transcritas a olho — conferir antes de publicar qualquer uma fora do repositório**.

## 2. Documentos do próprio repositório usados

| Documento | Para quê |
|---|---|
| [D030](../decisoes/030-arquitetura-pedagogica-fonica-todos-os-metodos.md), D004, D020, D021, D026, D027, D029 | decisões do dono |
| [pesquisa/44](../pesquisa/44-cursos-livros-metodo-fonico.md) e [44a](../pesquisa/44a-tabela-alfabeto.md) | método fônico e tabela do alfabeto |
| [pesquisa/45](../pesquisa/45-video-alfabeto-fonetico-referencia.md) | vídeo de referência dos sons das letras |
| [pesquisa/02](../pesquisa/02-brasil-bncc-fonetica-pb.md), [20](../pesquisa/20-avaliacao-adaptativa.md), [25](../pesquisa/25-conteudo-decodificaveis-fluencia.md), [29](../pesquisa/29-fonoaudiologia-articulacao.md) | fonética do português, avaliação, decodificáveis, limites de fonoaudiologia |
| `app/docs/auditoria-sons-letras.md`, `app/web/public/audio/sons/mapa.json` | situação dos sons |
| `app/packages/conteudo/src/habilidades.ts`, `app/packages/motor/src/dominio.ts`, `estado.ts` | habilidades e critério de domínio existentes |

## 3. Direitos: o que pode e o que não pode

Regra geral do projeto (D030): **os materiais são fundamento, não fonte de cópia.** O app usa ideias, princípios e tipos de
exercício — que não pertencem a ninguém — com textos, palavras, figuras, personagens, vozes e nomes próprios do FONEMA. Dúvidas de
direito: "verificar com advogado".

| Material | Situação declarada | Pode | Não pode |
|---|---|---|---|
| ABC | **Licença não encontrada.** Só há menção a "recursos abertos" e oferta "gratuita" do curso (ABC p. 12–13) | Citar com referência; usar princípios, critérios de ordem e tipos de exercício | Copiar textos, figuras, quadros ou lições; tratar como obra de uso livre |
| VT-PE, VT-1A | **CC BY-NC-ND 3.0 IGO**: reprodução com atribuição ao BID, para fim não comercial; "nenhum trabalho derivado é permitido"; nome e logotipo do BID exigem contrato (VT-PE p. 2; VT-1A p. 2) | Citar; seguir a **ordem** de ensino e os princípios (ideias) | Copiar ou **adaptar** histórias, personagens, sequências, cadernos, cartazes; usar em produto comercial; usar nome ou logotipo do BID |
| MP | ISBN e ficha catalográfica; **declaração de licença não encontrada** → direitos reservados | Citar; usar tipos de jogo como inspiração | Copiar atividades, textos, fotos, moldes; usar o nome "Método das Onomatopeias" como se fosse nosso |
| AO | **Sem autoria e sem aviso de uso** | Usar a ideia geral de ligar letra a um som do dia a dia | Copiar cartazes, cenas, fotos de boca; como não há autor, não há a quem pedir licença: tratar como protegido |
| MOR | "Todos os direitos reservados pela Autêntica Editora. Nenhuma parte desta publicação poderá ser reproduzida… sem a autorização prévia da Editora" (MOR p. 5) | Citar trechos curtos com referência; usar tipos de jogo | Copiar quadros, listas de palavras, textos; usar os nomes dos jogos do livro |
| SOA | Página de direitos **não encontrada** no arquivo; obra de editora comercial → direitos reservados. **O arquivo recebido é cópia de origem não oficial** (o nome traz "z-lib.org") | Citar trechos curtos com referência, depois de conferidos num exemplar regular | Copiar quadros, textos, o gráfico das fases; usar "Alfaletrar" como nome de recurso; guardar o PDF no repositório |

Nenhum PDF dos materiais é guardado no repositório; só as fichas de leitura. O áudio do vídeo de referência também não é copiado
(D029; `ESTADO-ATUAL.md` §6). "Boquinhas" é marca de terceiros; o nosso é "Espelho do Som".

## 4. Onde os materiais concordam e onde discordam

✔ = defende · ✘ = rejeita · — = não trata ("não encontrado" na ficha) · ± = com ressalva.

| Tema | ABC | VT | MP | MOR | SOA | No FONEMA (D030) |
|---|---|---|---|---|---|---|
| Ensino explícito e sistemático das relações entre som e letra | ✔ p. 320 | ✔ PE p. 8, 30 | ✔ p. 8 | ✔ p. 21, 24, 211–213 | ✔ a partir de certa fase, p. 119, 130 | Sim |
| Consciência fonológica é necessária, mas não basta | — | — | — | ✔ p. 50, 85, 120, 222 | — | Sim: o treino de escuta nunca vem sozinho |
| Sons sempre ligados às letras | ✔ p. 352–353 | ✔ PE p. 30 | ✔ p. 8 | ✔ p. 137–139 | ✔ p. 126–130 | Sim |
| Do simples ao complexo (sílaba simples antes de encontros) | ✔ p. 320–321 | ✔ PE p. 10–11 | — | ✔ p. 212–213 | ✔ p. 179–185 | Sim |
| Sons que se prolongam são mais fáceis que os de estouro | ✔ p. 127, 356 | ✔ PE p. 15 | — | ✔ p. 53, 80 | — | Contínuas antes |
| Brincadeira, figuras, jogos | ✔ p. 257–259 | ✔ (síntese da ficha) | ✔ p. 10–31 | ✔ p. 135 | ✔ p. 307 | Sim |
| Pares de sons parecidos (p/b, f/v) | — | ± PE p. 53–54 | — | ✔ p. 214 | ✔ p. 147 | Sim |
| Chamar o método de "fônico" | ✔ p. 314–342 | ✔ "explícita, estruturada e sequencial", PE p. 8, 10 | — | ✘ p. 24, 26, 225 | ✘ p. 113, 285–287 | Fônico, somando as práticas dos outros |
| Pronunciar o som isolado da letra | ✔ p. 324, 330 | ✔ PE p. 46–48 | ✔ p. 47 | ✘ p. 122 | ✘ p. 121, 125 | **As duas**: som puro + jogos de sílaba e rima |
| Boca e articulação | ✔ p. 326 | ✔ PE p. 46–48 | — (os cartazes AO trazem foto da boca) | ✘ p. 137 | ± usa o ponto de articulação para explicar os pares surdo/sonoro, p. 146 | Espelho do Som como apoio (D020) |
| Juntar e separar fonemas | ✔ p. 331 | ✔ PE p. 29, 40 | ✔ p. 36–40 | ✘ nota 40, p. 259 | ✘ p. 121, 125 | Sim, com letras |
| Tirar, pôr e trocar fonemas | ✔ p. 354–356 | ± só na teoria | — | ✘ (mas troca **letras**, p. 212) | ± troca **letras**, p. 126–130 | Com letras (troca-letras, mais-uma-letra) |
| Unidade de entrada | fonema, p. 315 | fonema, PE p. 30 | da palavra ao fonema, p. 4 | sílaba e rima, p. 73, 132 | sílaba, p. 121 | Sílaba e rima na escuta; fonema na trilha fônica |
| Ordem fixa das letras | ✔ p. 320–321 | ✔ PE p. 10–11 | ordem alfabética, sem critério declarado, p. 4–6 | ✘ p. 134, 225 | ✘ p. 174 | **As duas**: trilha com ordem fixa + jogos livres |
| Ordem alfabética para ensinar | — | ✘ PE p. 15, 26 | usa, p. 4–6 | — | — | Só na Trilha A–Z ("conhecer as letras") |
| Vogais primeiro | ✔ p. 320–321 | ✔ PE p. 45 | ✔ p. 4–6 | ✘ p. 24 | ✔ p. 97 | Sim |
| Nome da letra | ajuda a chegar ao som, p. 123, 126 | — | — | — | ✔ ensina o nome, p. 64, 141 | Nome na Trilha A–Z; som na trilha fônica |
| E/O abertos e nasais | — | adia, PE p. 11; 1A p. 117, 171 | junto da letra, p. 69, 73, 84 | — | nasalidade depois, p. 170–172 | Adia (trilha fônica); apresenta (Trilha A–Z) |
| Dígrafos | depois (p. 320) **e** "não deixar para o fim" (p. 513) | depois, 1A p. 171 | no fim | — | junto das sílabas simples, p. 134 | Depois (ponto em aberto, §5) |
| Texto decodificável para ler sozinha | ✔ p. 334–335, 376 | ± listas e frases, 1A p. 148, 197 | — | — (só textos reais) | ✘ frases artificiais, p. 290; ± livros com controle, p. 230 | **As duas**: decodificável para ler; real para ouvir |
| Texto real como eixo | ± variados "pouco depois", p. 334–335 | ✔ histórias ouvidas, PE p. 46–48 | — | ✔ p. 149–186 | ✔ p. 34 | Texto real ouvido desde o início |
| Palavras inventadas | ✔ p. 333 | ✔ 1A p. 62, 78 | — | ✘ p. 141–142 | ✘ só brincadeira, p. 129 | Sim, na leitura |
| Escrita do jeito da criança | ± com confronto, p. 262 | ✘ corrigir logo, PE p. 40 | — | ✔ p. 22 | ✔ p. 122–123, 194–196 | Como atividade com confronto; não como método |
| Regras de escrita | ensinar e descobrir, p. 421–423 | ensina, 1A p. 246 | — | jogos, p. 213–216 | descobrir por comparação, p. 154–155 | Comparar pares **e** dizer a regra |
| Treino de escuta antes de ler | ✘ cap. 6, p. 140, 145 × ✔ caps. 11, 15, 22 | ✔ PE p. 12 | ✔ p. 10–31 | ✔ p. 129–133 | ✔ p. 77–90 | Curto, ligado às letras |
| Fonemas na pré-escola | só o inicial, p. 257, 261 | vogais e 7 consoantes, PE p. 45, 89 | ✔ p. 8 | só o inicial; sem ensino sistemático de letras, p. 126–127, 131–132 | nome das letras; sílabas, p. 141 | Maternal e Pré: escuta + som inicial |
| Avaliar com testes de fonemas e nota | ✔ p. 333–334 | ± protocolo semestral, 1A p. 165–169 | — | ✘ p. 218–219 | ✘ p. 314–315 | Mede sem nota global ([06 §9](06-avaliacao-e-intervencao.md)) |
| Meta de fluência | portuguesa, p. 379 | conta palavras em 60 s, sem meta, 1A p. 167 | — | — | sem meta, p. 246–248 | Sem meta numérica |
| Famílias silábicas | "não encontrado"; "família do in" como mau exemplo, p. 329 | usa ma-me-mi como junção, PE p. 92 | — | ✘ métodos silábicos, p. 24 | grade de sílabas para sistematizar, p. 130–135 | Não é método ([00 §5](00-principios.md)) |

Divergências **dentro** de um mesmo material: ABC cap. 6 × caps. 11, 15, 22 (treino fonológico); ABC cap. 14 × cap. 22 (dígrafos);
ABC cap. 6 × cap. 22 (tecnologia). Erro apontado na ficha: SOA p. 146 chama P, T, F de "sonoras" e B, D, V de "surdas" (está invertido).

**Correção de 16/11 (revisão independente):** Soares **trata** a boca nos pares surdo/sonoro: em SOA p. 146 explica a diferença pelo
ponto de articulação e pela vibração (a tabela acima dizia "não trata"; a troca de rótulos "sonoras/surdas" apontada na ficha continua
registrada). **A conferir no PDF** (o PDF não está no repositório).

**O som do R no faz de conta — duas convenções que se contradizem.** O Manual Prático (MP p. 88) associa o **gato ronronando ao R fraco**
e o **cachorro rosnando ao R forte**; a pesquisa 45 (vídeo de referência, `docs/pesquisa/45-video-alfabeto-fonetico-referencia.md`) usa "o gato arranhando" para o **RR
forte**. No app, a cena do R (`app/packages/conteudo/src/alfabeto.ts`: `BRINCADEIRAS.R` = motor de carrinho; `CENAS_DO_SOM.R` =
carrinho) **não usa gato nem cachorro**, então nada está trocado. **Regra para o conteúdo futuro [DP]:** se o R fraco ganhar cena
(Bloco 5, TF-32), não usar o gato para o R forte; seguir MP p. 88 (gato ronronando = R fraco; cachorro rosnando = R forte) ou ficar
com o motor para o R forte. Página de MP citada pela revisão de 16/11; **a conferir no PDF**.

## 5. Pontos que pedem decisão do dono

1. **Sons puros**: quem ouve e valida os 24 clipes (e grava R fraco, LH, NH e as nasais) antes de virarem estímulo principal — pendência da D030.
2. **Dígrafos LH, NH, CH**: ficam depois do R, como no Vamos Todos, ou sobem para logo depois das oclusivas (ABC p. 513; SOA p. 134)?
3. **"ti/di" e R**: qual pronúncia a voz da dupla usa (o app aceita todas na resposta da criança).
4. **Vogal nasalizada antes de M/N** (cama, banana): o verificador só avisa, ou bloqueia até as nasais?
5. **Lista de palavras frequentes** ensinadas à parte ([05 §5](05-regras-de-decodificabilidade.md)): aprovar a lista.
6. **Alfaletrar**: o arquivo recebido não é de origem oficial; convém ter um exemplar regular para conferir as citações.
7. **Revisão por especialista**: a sequência (01) e as palavras de exemplo foram montadas pelo projeto; convém uma alfabetizadora ou
   fonoaudióloga revisar antes de virar conteúdo.
