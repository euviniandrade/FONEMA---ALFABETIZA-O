# Painéis do FONEMA · versão 2 (4 painéis completos)

A v1 (`../paineis/`) foi aprovada e continua **intacta**. A v2 copia o mesmo código (`base.css`, `comum.js`, ECharts/ECharts GL e three.js locais em `vendor/`) e o evolui para os **4 painéis completos** que o dono pediu: criança, professora, família e gestão da unidade. O painel da secretaria da v1 foi mantido aqui como **referência de rede** (`painel-secretaria.html`, sem alterações).

> Todos os dados são **fictícios** e vêm de **uma única fonte** (`dados-escola.js`), então batem entre os painéis. Exemplos: a **Iris N.** (2º B) está no nível 6, na região Caatinga, no grupo G2 (R forte/fraco) e trava em **carro → “caro”** nos painéis da criança, da professora (lista, detalhe e mapa de palavras) e da família. O **2º B** tem 24 crianças com a mesma distribuição (3 no nível 10) na professora e na gestão. O **2º ano** da EM Jardim das Flores tem 21 de 88 crianças no nível 10 (24%), mediana 7, o mesmo número da secretaria.

## O que mudou da v1
| Tema | v1 | v2 |
|---|---|---|
| Criança | Uma ilha com trilha em espiral | **Arquipélago 3D com as 11 regiões** (nível n ↔ região n), pontes nas regiões feitas, a “Ponte do R forte” em obras saindo da região atual (Caatinga, com anel de luz e bandeira ipê), boias brancas para as próximas (**sem cadeado**). HUD com missões do dia, coleção de bichos da região, emblemas, vila com cachorro e gato, vídeos da Academia, “O que vem aí?” e termômetro **sem números**. Versão de celular em **modo leve 2D** |
| Sofia | Desenho simplificado com fivela de flor | **Sofia v2 de uniforme escolar e sem adornos** (sem brincos, pulseira ou fivela), gerada da fonte oficial `../personagens-v2/fonte/` por `ferramentas/gerar-personagens.js` → `img/*.svg` |
| Professora | Mapa de calor + terreno 3D | **Lista da turma com nível 0–10** e **onde cada criança está travada** (habilidade, som e a palavra exata: pato → “bato”, carro → “caro”, “bopa” → “popa”); padrão de erros por categoria; plano de amanhã por grupo; modo sala; mensagens de WhatsApp. Duas telas novas: **detalhe da criança** (drill-down) e **mapa de palavras e sons com mais erro** |
| Família | Tela de celular | Celular + **versão web** em 3 colunas. Previsão em **faixa sombreada** no próprio gráfico, palavras que leu na semana, recado da professora, próximo degrau, “além da leitura” (sem socioemocional como nota), vídeo da Academia com Sofia de uniforme |
| Gestão | Painel da escola | **Painel da unidade completo**: 7 KPIs (com projeção rotulada como ESTIMATIVA), **barras 3D turma × nível com o número exato em cada barra** e a tabela exata ao lado, leitura em 3 frases, evolução, antes/depois, faixas fev × nov, dose, fidelidade, turmas que precisam de apoio, habilidades mais difíceis, **formação das professoras na Academia**, trilhas sugeridas e exportação (PDF ao Conselho, CSV, PPT). Tema claro e escuro |
| Dados | Gerados por fórmula | **Contagens reais por turma** (soma = n), coerentes entre todos os painéis |

## Catálogo de telas
| Painel | HTML | Capturas (deviceScaleFactor 2) |
|---|---|---|
| 1 · Criança (tablet) | `crianca-aventura.html` | `crianca-aventura.png` (2560×1600) |
| 1 · Criança (celular, modo leve) | `crianca-celular.html` | `crianca-celular.png` (780×1688 = 390×844) · `crianca-celular-completo.png` (rolagem inteira) |
| 2 · Professora: turma | `professor-turma.html` | `professor-turma.png` · `professor-turma-escuro.png` (2560×1600) |
| 2 · Professora: detalhe da criança | `professor-crianca.html` | `professor-crianca-detalhe.png` (2560×1600) |
| 2 · Professora: palavras e sons | `professor-palavras.html` | `professor-palavras-dificuldade.png` (2560×1600) |
| 3 · Família | `pais.html` (responsivo) | `pais-celular.png` (390×844) · `pais-celular-completo.png` · `pais-web.png` (2560×1600) |
| 4 · Gestão da unidade | `gestor-unidade.html` | `gestor-unidade.png` · `gestor-unidade-escuro.png` (2880 × altura da página) |
| Referência de rede (v1) | `painel-secretaria.html` | `painel-secretaria.png` |

**Como abrir e recapturar:** dentro desta pasta, `python3 -m http.server 8765` e acesse `http://localhost:8765/gestor-unidade.html` (tema escuro: `?tema=escuro`). Para regenerar todas as capturas: `node ferramentas/capturar.js` (ou só algumas: `node ferramentas/capturar.js pais-web gestor-unidade`). Para regenerar a Sofia e o Bolota: `node ferramentas/gerar-personagens.js`.

## Catálogo de gráficos e blocos
| ID | Painel | Gráfico / bloco | Pergunta que responde | Cuidados | 3D/2D |
|---|---|---|---|---|---|
| C1 | Criança | **Arquipélago das 11 regiões** (three.js, sombras suaves, mar em gradiente, pontes, anel de luz na região atual, pino “Você está aqui!”) | Onde estou na aventura? O que vem depois? | Sem número, sem cadeado, sem comparação. O feito nunca some. Sofia em 2D sobre o 3D (Decisão 005) | **3D** |
| C2 | Criança | Termômetro horizontal que enche (marcas sem número, ✓ na posição atual, estrela na meta) | Quanto já andei? | Nunca desce para a criança (Decisão 004 §1.4) | ilustrado |
| C3 | Criança | Missões do dia (pontinhos de progresso), coleção da região (encontrados × “?”), emblemas, vila, vídeos, “O que vem aí?” | O que faço hoje? O que ganhei? | Itens com propósito, sem sorte nem dinheiro real (Decisões 002 e 005) | UI |
| C4 | Criança (celular) | Trilha vertical 2D das 11 ilhas, centrada na atual | Idem C1 | Modo leve automático no celular | 2D |
| P1 | Professora | **Lista da turma**: grupo, trilha 0–10 com marcador, habilidade travada, som, **palavra alvo → leitura** e sinal | Onde cada criança está travada? | Ordenada por grupo, nunca por nota; sinal sempre com ícone + rótulo | 2D |
| P2 | Professora | Quem precisa de mim hoje (4 cartões com ação) | Por onde começo? | Sinal só com 2+ semanas e dose adequada; não é diagnóstico | cartões |
| P3 | Professora | Padrão de erros por categoria (barra + nº exato + nº de crianças) | Que tipo de erro domina a turma? | Categorias do rel. 20 §3.8 (surda/sonora, contextual, encontros, leitura “de memória”) | 2D |
| P4 | Professora | Plano de amanhã por grupo (horário, estação, atividade) + modo sala + mensagens de WhatsApp | O que faço amanhã? O que mando às famílias? | Modo sala sem nomes; mensagens revisadas antes de enviar | UI |
| P5 | Detalhe | Termômetro 0–10 em degraus, trajetória mês a mês, mapa de habilidades (5 estados), prática da semana | Como a Iris está andando? | Só ela com ela mesma | 2D |
| P6 | Detalhe | **Palavras-problema** (palavra, leitura, tipo de erro, erros/tentativas, tendência) e **últimas tentativas** com latência e áudio | Em que palavras exatamente ela erra? | Voz incerta fica fora do cálculo até a professora ouvir (rel. 20 §3.1) | tabela |
| P7 | Detalhe | Acerto em RR por semana (linha de domínio em 80%) + **sugestão de intervenção** e atividade | Está melhorando? O que faço? | A professora pode discordar e registrar | 2D |
| P8 | Palavras | **Mapa de sons da turma** (% de erro em cada som, por família, escala de um matiz âmbar + nº de crianças) | Que sons a turma mais erra? | Cor + número sempre; faixas explícitas na legenda | 2D |
| P9 | Palavras | **Matriz de trocas** surdo/sonoro (alvo × lido) | A troca é sistemática? | 32 de 46 trocas vão do surdo para o sonoro | 2D |
| P10 | Palavras | Palavras com mais erro (ordenadas por % de erro, com quem errou pela cor do grupo) | Que palavras retomar? | Ordena **palavras**, nunca crianças | 2D |
| P11 | Palavras | Palavras reais × pseudopalavras por grupo + pseudopalavras com mais erro | Quem lê “de memória”? | Pseudopalavras obrigatórias (rel. 20 §3.1) | 2D |
| F1 | Família | Termômetro de vidro “Nível 6 de 10 · faltam 4” + áudio do resumo | Em que nível está e quanto falta? | Sem gauge; áudio para pais com baixa escolaridade | ilustrado |
| F2 | Família | Caminho mês a mês + **faixa provável** sombreada até o nível 10 | Está avançando? Quando chega? | Faixa (“entre 4 e 7 meses”), “não é promessa” | 2D |
| F3 | Família | Já sabe / está aprendendo, além da leitura, palavras lidas na semana (som novo sublinhado), missão, vídeo, dias de leitura | O que fazer em casa? | Sem ranking nem percentil; dias de leitura não zeram | UI |
| G1 | Gestão | KPIs + **projeção em caixa ESTIMATIVA** | Vamos chegar à meta? | Não é resultado oficial nem Saeb | 2D |
| G2 | Gestão | **Barras 3D turma × nível** (ECharts GL, ortográfica, sombra, chanfro) com **rótulo do nº exato em cada barra** | Onde a escola se concentra? Qual o degrau entre 1º e 2º ano? | Ortográfica elimina distorção; vista calibrada; alternador 3D/2D/Tabela | **3D** |
| G3 | Gestão | **Números exatos** (tabela turma × nível, totais por ano e escola, mediana, nível 10) + leitura em 3 frases | Quanto exatamente? | Decisões pela tabela; mesma escala de cor do 3D | 2D |
| G4 | Gestão | Evolução mensal (rótulo direto), antes/depois por turma (halteres), 2º ano por faixa fev × nov | A escola está subindo? | Séries com marcadores distintos (● ◆ ▲) | 2D |
| G5 | Gestão | Dose (faixa-alvo 45–60), fidelidade (5 critérios), turmas que precisam de apoio | O programa está rodando? Onde agir? | Fidelidade mede o programa, não pessoas | 2D |
| G6 | Gestão | Habilidades mais difíceis da escola, formação das professoras (8 módulos da Academia), trilhas sugeridas, exportar | O que formar e o que levar ao Conselho? | Agregado da escola; sem ranking de professoras | 2D |

## Regras mantidas e reforçadas
- **3D sempre com número exato legível**: no gestor, cada barra 3D tem o nº de crianças e a tabela exata fica ao lado; na criança, o 3D é cenário, não medida.
- **Sem ranking, pódio ou percentil de crianças** em nenhum painel. Listas são ordenadas por grupo (professora) ou por palavra/habilidade (nunca por criança).
- **Socioemocional nunca chega à gestão nem à secretaria** (rodapé fixo). Na família, aparece só como o que a criança fez, sem nota (rel. 43 §5).
- **Acessibilidade de cor**: escala 0–10 de um matiz (petróleo), erro em escala âmbar de um matiz, grupos G1–G4 com paleta validada e rótulo sempre visível, status com ícone + texto. Tema escuro com contraste crescente.
- **Sofia sempre de uniforme e sem adornos**; elenco sem adornos; animais na vila (cachorro caramelo, gato, tatu-bola, tuiuiú).

## Arquivos de apoio
- `dados-escola.js`: fonte única dos dados fictícios (regiões, turmas, crianças do 2º B, erros, palavras, sons, Iris, escola).
- `v2.css`: componentes novos sobre `base.css` (barra compacta, trilha 0–10, palavra alvo → leitura, miniatura de vídeo, Fredoka).
- `img/`: Sofia (5 poses + 2 bustos) e Bolota em SVG, gerados da fonte dos personagens v2.
- `ferramentas/capturar.js` e `ferramentas/gerar-personagens.js`.
