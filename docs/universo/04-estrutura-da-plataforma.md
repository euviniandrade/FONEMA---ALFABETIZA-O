# 04 · Estrutura da plataforma

> Resumo em linguagem simples. Os detalhes moram nos documentos indicados em cada linha. A referência técnica principal é o [Documento Mestre](../sintese/00-documento-mestre.md) e as frentes de [`propostas/06-fonema-unificada/`](../propostas/06-fonema-unificada/).

## 1. O que é
O **FONEMA** é uma **plataforma educativa completa de alfabetização pelo método fônico** para crianças de **4 a 8 anos** (e 8+ não alfabetizadas, trilha "Recomeço"), em web e app com a mesma conta ([D014](../decisoes/014-plataforma-educativa-completa.md)). Quem cria a conta, consente e paga é **sempre um adulto ou uma instituição**; a criança nunca paga nem vê oferta ([D002](../decisoes/002-economia-virtual-avatar-educacao-financeira.md)). Assinatura **sempre mensal**: família, escola privada e rede pública ([D001](../decisoes/001-jornada-e-modelo-de-precos.md)).

## 2. Mapa da plataforma

| Peça | O que é, em poucas palavras | Detalhes |
|---|---|---|
| **Jornada de 2 anos** | Mundo de 11 regiões (R0–R10). Trilha principal liberada **por domínio, nunca por tempo**; missões paralelas, vila para construir, colecionáveis, desafios de fim de região, temporadas. Sessões curtas (10–20 min) com fim natural | [D001](../decisoes/001-jornada-e-modelo-de-precos.md), [Jornada](../propostas/06-fonema-unificada/jornada/README.md), Mestre §4.2 e §4.4, arquivo [03](03-mundo-e-lugares.md) |
| **Sequência fônica** | Consciência fonológica → vogais → contínuas M L F V S N → P T B D → J Z X CH NH LH → contextuais → nasais → CVC/ditongos → encontros → concorrências → fluência. Sons, não nomes de letra | Mestre §4.3 |
| **Lição "eu faço → nós fazemos → você faz"** | Aquecimento, modelo da Sofia no **Espelho do Som** (boca + corte lateral + letra), prática guiada, mini-jogo, verificação com pseudopalavras, fechamento | Mestre §4.4 e §4.7, [Personagens v2 §6](../propostas/06-fonema-unificada/personagens-v2/README.md) |
| **Termômetro da Leitura 0–10** | Escala por critério: "nível 6 de 10, faltam 4". Sobe só com domínio, nunca desce para a criança, previsão em faixa | [D004](../decisoes/004-termometro-alfabetizacao-e-proxima-fase.md), Mestre §4.5 |
| **Painéis** | Criança (sem números), família, professora, gestão da escola e secretaria; cada um vê só o que precisa (secretaria só agregados) | [Painéis v2](../propostas/06-fonema-unificada/paineis-v2/README.md), Mestre §4.12 |
| **Academia FONEMA** | Vídeos e trilhas curtas com 3 portas: crianças, famílias e professores (formação continuada com certificado) | [D006](../decisoes/006-academia-uniforme-elenco-voz.md), [D011](../decisoes/011-academia-pintura-vozes.md), [Academia](../propostas/06-fonema-unificada/academia/README.md) |
| **Vídeos "Assiste e Faz"** | Vídeo curto da dupla → "Agora é a sua vez, [NOME]!" → atividade de 1–3 min → comemoração → registro no painel | [D015](../decisoes/015-video-sempre-com-atividade.md), [Vídeos](../propostas/06-fonema-unificada/videos/README.md), [Série](../propostas/06-fonema-unificada/serie-sofia-e-tales/README.md) |
| **WhatsApp** | Canal oficial **só com adultos**: até 3 mensagens/semana, áudio primeiro, botões, missões em família; dados mínimos | [WhatsApp](../propostas/06-fonema-unificada/whatsapp/README.md) |
| **Moedinhas e lojinha** | Moedas fictícias ganhas **só aprendendo**; lojinha com propósito (coleções, emblemas, ajudar a vila, presentes); cofrinho com meta; sem dinheiro real, sem sorte, sem vantagem | [D002](../decisoes/002-economia-virtual-avatar-educacao-financeira.md), [Lojinha](../propostas/06-fonema-unificada/lojinha-emblemas/README.md) |
| **Avatar** | Personagem da criança no estilo 3D da dupla, montado por peças, nunca por foto | [D008](../decisoes/008-avatar-3d-da-crianca.md), [Avatar 3D](../propostas/06-fonema-unificada/avatar-3d/README.md) |
| **Seis competências** | Alfabetização como espinha dorsal + pensamento computacional, lógica, inteligência emocional, tecnologia e educação financeira **por dentro** da leitura | [D003](../decisoes/003-formacao-integral-e-aprendizagem-profunda.md) |
| **Esporte, respeito e ambiente** | 20 modalidades em que o jogo anda pela leitura, Copa das Letras cooperativa, antibullying em espiral, uma missão ambiental por região | [D010](../decisoes/010-esporte-respeito-meio-ambiente.md), [Módulo](../propostas/06-fonema-unificada/esporte-respeito-ambiente/README.md) |
| **Cadastro e nome falado** | Gênero só para concordância (masc., fem., prefiro não informar); o adulto grava o nome; Sofia e Tales chamam a criança **pelo nome** com a pronúncia certa; só o primeiro nome vai ao serviço de voz | [D013](../decisoes/013-cadastro-nome-falado.md) |
| **Vozes** | "Sofia — FONEMA" e "Tales — FONEMA" (ElevenLabs); fonemas isolados gravados por fonoaudióloga | [D011](../decisoes/011-academia-pintura-vozes.md), [Voz](../propostas/06-fonema-unificada/voz/README.md) |
| **Mundo 3D e imersivo** | Arquipélago e vila navegáveis, modo leve para celular simples | [Mundo 3D](../propostas/06-fonema-unificada/mundo-3d/README.md), [Imersivo](../propostas/06-fonema-unificada/imersivo/README.md), [Tecnologia gráfica](../propostas/06-fonema-unificada/tecnologia-grafica/README.md) |
| **Privacidade e segurança** | LGPD art. 14, ECA Digital (Lei 15.211/2025); voz no aparelho, sem câmera no MVP, sem anúncios, sem chat entre crianças | Mestre §4.15, [Arquitetura](../propostas/06-fonema-unificada/arquitetura-infra/README.md) |

## 3. Decisões que definem a identidade (mais recentes)
- **[D014](../decisoes/014-plataforma-educativa-completa.md)** · plataforma educativa completa, não só um jogo; falar em "plataforma, jornada, missões, atividades".
- **[D015](../decisoes/015-video-sempre-com-atividade.md)** · vídeo nunca sozinho: formato "Assiste e Faz"; vídeos para redes e YouTube no futuro, com cuidados.
- **[D016](../decisoes/016-universo-infantil.md)** · o FONEMA é a base de um **universo infantil** (desenhos, livros, canais, perfis, WhatsApp); esta bíblia é o registro canônico.
- **[D017](../decisoes/017-roteiro-de-expansao-educativa.md)** · depois da alfabetização, **novas áreas do conhecimento e novos idiomas**, cada um como uma série; conhecimento de base para a vida e educação cívica apartidária (§5).

Todas as decisões: [`docs/decisoes/`](../decisoes/) (001–017).

## 4. Plataforma × universo
| | Plataforma FONEMA | Universo (nome a definir, arquivo 07) |
|---|---|---|
| Para quem | Criança com o adulto, escola e rede | Família, criança acompanhada, escolas, público geral |
| O quê | Jornada completa, medida, painéis | Série animada, livros, canais, perfis, produtos |
| Regra comum | Mesmos personagens, valores, regras de arte e "assistir pouco, fazer muito" | idem |
| Ponte | Todo conteúdo do universo convida a família a **praticar**; a plataforma é o caminho completo | — |
