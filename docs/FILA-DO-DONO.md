# Fila do dono — tudo o que foi pedido e o estado de cada item

Regra (pedido do dono, 17/11/2026): **"Não deixe nada passar; tudo que eu pedir entra na fila e tudo deve ser implementado."**
Todo pedido novo entra aqui no mesmo dia, com a data e as palavras do dono resumidas. Só sai de "Em andamento"/"Na fila" quando
estiver no ar e verificado. Itens que dependem de decisão ou de algo do dono ficam em "Aguardando o dono", nunca somem.

Legenda: ✅ no ar · 🔧 em andamento · ⏳ na fila · ⏸ aguardando o dono

## Em andamento / na fila
| # | Pedido (data) | Estado | Onde |
|---|---|---|---|
| 1 | Tutorial de boas-vindas: panorama, como mexer, tudo o que tem, o que vai aprender e em que ordem, o que ganha; levar à 1ª missão (17/11) | 🔧 | D032 §1 |
| 2 | Painel guia ao lado: nível, desempenho, próxima fase, barra da missão, "você está aqui" (17/11) | 🔧 (corrigir painel cobrindo a letra A) | D032 §2 |
| 3 | Mundo 3D em 3ª pessoa com o próprio boneco: andar (mouse, toque, setinhas), câmera, pular, tchau, entrar em lugares, área limitada, outros bonecos (17/11) | 🔧 | D032 §3 |
| 4 | Nadar no rio, barco, carro, "construir uma vida", profissões (17/11) | ⏳ (parte nos jogos 3–5; mundo 3D preparado) | D032 §3 |
| 5 | Pesquisa dos jogos mais jogados e adaptação à fonética (17/11) | ✅ pesquisa 47 | docs/pesquisa/47 |
| 6 | Jogos: Corre-Som e Bichinho Come-Som (17/11) | 🔧 | pesquisa 47 |
| 7 | Jogos: Estrada e Rio dos Pares, Carteiro da Vila, Casa do Som (17/11) | ✅ pronto no repositório (falta publicar; testar o botão de desafio no fim da missão e o arrastar no celular real) | pesquisa 47 |
| 8 | Jogos primeiro dentro dos desafios; depois livres no Parque de Jogos, mostrando os tipos de jogo (17/11) | 🔧 | D032 §4 |
| 9 | Página do administrador (login do dono, aba à parte; admin da escola; configurar o site) (17/11) | ✅ pronto no repositório (#/admin; falta publicar) | D032 §5 |
| 10 | Áudios: texto ao lado de cada áudio (letra, palavra, sílaba, frase), subir/gravar áudio que entra no lugar certo; "Gravar o alfabeto" com a Agatha (17/11) | ✅ pronto no repositório (1.708 áudios listados; pacote .zip + importador; falta publicar) | app/docs/como-trocar-audios.md |
| 11 | Lições depois da TF-22 (é/ó, vogais misturadas, nasais, R…) (17/11, "faça tudo") | 🔧 | pedagogia/01 |
| 12 | Testes automáticos no GitHub (recomendação aceita) (17/11) | ✅ criado; 1ª execução completa a confirmar | .github/workflows/ci.yml |
| 13 | Sofia nas cenas do som segurando coisas / fazendo a ação (médico "aaa", silêncio "xiii"…) (17/11) | ✅ pronto no repositório: A, E, I/Y, L, V e X trocadas (falta publicar). Ó, Ã e R fraco prontos como proposta para as lições TF; O, U, N, M, F, H, S, Z, J e É não saíram bons e ficaram como estavam | docs/propostas/06-fonema-unificada/cenas-do-som-sofia |
| 14 | Fichas de leitura por campo semântico, boquinha em cima de cada letra, 4 níveis (17/11) | 🔧 | D033 |
| 15 | Mais agentes para ir mais rápido e com mais qualidade (17/11) | ✅ em uso | — |
| 16 | Revisão final de qualidade de tudo o que entrou nesta rodada + teste completo + publicar (17/11) | ⏳ | — |

## Aguardando o dono
| # | Pedido | O que falta |
|---|---|---|
| A1 | Boca do Espelho do Som bonita (desenho estilo Sofia/Tales ou vídeo) (17/11) | Escolher: vídeo da boca da Agatha (recomendado) e/ou autorizar a Cloudinary para editar só a boca, ou ilustrador. Tentativa com IA: docs/propostas/06-fonema-unificada/espelho-do-som-desenho |
| A2 | Áudios da Agatha: sons de cada letra, palavras, frases (17/11) | Gravar pela página do administrador e enviar o pacote (como-trocar-audios.md); autorização por escrito dela |
| A3 | Vídeo do YouTube com palavras (17/11): https://www.youtube.com/watch?v=FXylvtji5uM | É o mesmo vídeo do canal Kidspace Tv já estudado (pesquisa 45): de terceiros, então não copiamos o áudio. Já usado como referência (faz de conta, ordem, palavras). Se o dono tiver autorização por escrito do canal, revemos |
| A4 | IA conversando com os bonecos; sala de aula online com vários alunos (17/11) | Servidor (dono: "sem dinheiro por enquanto"), moderação e LGPD |
| A5 | Validar os sons puros e as listas de palavras (fonoaudióloga/alfabetizadora); conferir E/O duvidosos e vozes novas de ouvido | Pessoa para ouvir |
| A6 | LGPD/termos com advogado antes de piloto com crianças | Advogado |
| A7 | Créditos: ElevenLabs (~8,8 mil caracteres) e Higgsfield (1 crédito) | Recarga quando der |

## Concluídos recentes (no ar)
- D031 alternar letras e leitura; portão do nível 7 na TF-R2; nomes com "Sons"; app leve (2 MB); barra da vila com 5 botões;
  pares mínimos com 3 opções e 8 de 10; Bolota consistente; 1º texto; fluência, histórias, Brincar com sons, escrita própria;
  correções da revisão da metodologia; trava da voz; restaurar cópia.
