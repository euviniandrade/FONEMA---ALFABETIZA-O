# FONEMA Unificada · Integração com WhatsApp (famílias e escola)

> Frente da Proposta Unificada (Decisão 005, requisito 4: "WhatsApp integrado: famílias e escola, com consentimento e LGPD").
> Base: rel. 26 (família, professores e escolas: WhatsApp como canal, baixa escolaridade, áudio, READY4K), rel. 05 (LGPD art. 14, ECA Digital), Proposta 5 (FONEMA Escola, seção "WhatsApp" e `tela-pais.png`), Decisões 001–005.
> Data: 13/11/2026. **⚖️** = precisa de parecer jurídico. **[conferir]** = não confirmado nesta sessão (a rede bloqueou `developers.facebook.com`; o que veio de busca na web aparece com a fonte no fim).

**Imagens desta pasta**

| Arquivo | O que mostra |
|---|---|
| `conversa-familia.png` | 3 telas de celular (mensageiro genérico, sem marca): resumo semanal com cartão e botões, missão em áudio + imagem com lembrete gentil, resposta por botão, menu e pedido de ajuda por áudio |
| `cartao-resumo-semanal.png` | A imagem enviada aos pais: "Nível 6 de 10", termômetro, o que já sabe, o que está aprendendo, missão da semana, Sofia |
| `conversa-professora.png` | Painel da professora para escrever/gravar o recado da turma + celular da família recebendo pelo canal oficial da escola |
| `fluxo-whatsapp.png` | Arquitetura (eventos, regras, outbox, filas, envio, webhook, atendimento), consentimento por categoria e papéis na LGPD |

As telas usam um **mensageiro genérico** (cores e ícones do FONEMA). Não usam logotipo, ícone nem as cores da marca WhatsApp. Material público deve seguir as regras de marca da Meta **[conferir]**.

---

## 1. Princípios (o que não muda)

1. **O canal fala só com adultos.** O destinatário é sempre o responsável que deu o consentimento no app. Nada de grupos de turma, de número da criança ou de mensagem para a criança. A criança continua no app, atrás da porteira parental (Decisão 002).
2. **Canal oficial, nunca o número pessoal da professora.** O remetente é "EM Rio Claro · FONEMA" (ou "Secretaria de X · FONEMA", ou "FONEMA" no plano família). A professora escreve e grava no painel, e as respostas chegam na caixa de atendimento da plataforma (rel. 26, §3.2).
3. **Áudio primeiro, botões grandes, no máximo 2 toques.** Cerca de 29% dos adultos de 15 a 64 anos são analfabetos funcionais (Inaf 2024, rel. 26). Toda mensagem tem botão "Ouvir" e a resposta é por botão ou por áudio. O texto é curto, com frases de até cerca de 15 palavras.
4. **Pouco e útil (formato READY4K).** Fato, dica e reforço: até **3 mensagens automáticas por semana**, ligadas ao nível real da criança. A versão diferenciada pelo nível foi a que funcionou melhor (rel. 26, [14][15]). Repetir o tema em dias diferentes dá saliência (Lichand et al., rel. 26 [22]).
5. **Dados mínimos fora da plataforma.** No mensageiro vão só o primeiro nome (ou apelido escolhido pelo responsável), o nível 0–10 e o texto da missão. **Não vão** nome completo, foto, voz da criança, nota, laudo, hipótese de diagnóstico, dados socioemocionais nem comparação com colegas.
6. **Nenhum áudio ou imagem da criança é enviado.** O "ouça seu filho ler" da Proposta 5 continua **dentro do app** (consentimento específico, rel. 05). O mensageiro só convida a abrir o app. Se um adulto mandar mídia da criança, o sistema responde com um aviso gentil e apaga a mídia em até 30 dias, ou antes, quando o atendimento termina.
7. **Nunca diagnóstico.** "Dificuldade persistente" vira **convite para conversar**, revisado e aprovado pela professora antes do envio, sem rótulos ("dislexia", "atraso", "abaixo da média").
8. **Sem pressão de venda para quem não pediu.** Aviso de assinatura (B2C) só para o adulto pagante, em categoria própria e com opt-in separado. Nenhuma mensagem fala de moedinhas ou da lojinha como oferta.

---

## 2. Como a plataforma do WhatsApp funciona (resumo para o produto)

| Tema | O que vale | Status |
|---|---|---|
| **API** | WhatsApp Business Platform. **Cloud API** hospedada pela Meta, direta ou por um provedor (BSP). A API "On-Premises" foi descontinuada | conferir |
| **Categorias de modelo** | **Utilidade** (ligada a uma transação ou conta: resumo, missão combinada, reunião, recado), **Marketing** (promoção, reengajamento, oferta), **Autenticação** (código de acesso), **Serviço** (respostas livres dentro da janela) | busca web [S1][S2] |
| **Quem decide a categoria** | A Meta revisa e pode **recategorizar** um modelo de utilidade como marketing se o texto parecer promocional. Dica pedagógica genérica pode virar marketing. Por isso os modelos abaixo sempre citam algo concreto da conta (a missão da semana **da Ana**, o nível **dela**) | conferir |
| **Janela de atendimento (24 h)** | Abre quando o **adulto** manda uma mensagem ou toca num botão, e renova a cada nova mensagem dele. Dentro dela a empresa manda texto, **áudio**, vídeo, imagem e menus livres, sem modelo. Fora dela, só modelos aprovados | busca web [S2] |
| **Preço** | Por mensagem de modelo entregue (desde 01/07/2025). **Serviço é gratuito.** **Modelos de utilidade dentro da janela aberta são gratuitos.** Marketing é sempre cobrado. Há faixas de volume por mercado e categoria | busca web [S1][S2] |
| **Cabeçalho do modelo** | Texto, imagem, vídeo, documento (e localização). **Áudio não pode ir no cabeçalho do modelo**: o áudio vai como mensagem de mídia **depois** que o adulto toca em "Ouvir" (abre a janela). Esse é o padrão "envelope + abrir" usado em todo este desenho | busca web [S3] |
| **Botões** | Modelos aceitam respostas rápidas e botões de link. Mensagens interativas dentro da janela: até 3 botões ou lista de até 10 itens (título curto, cerca de 20 caracteres) | conferir limites |
| **Opt-in** | A política da Meta exige opt-in **antes** do primeiro contato, com aviso claro de que as mensagens vêm por esse canal e em nome de quem, e exige **honrar o opt-out**. Pede opt-in separado por tipo de mensagem e instruções claras para sair | busca web [S4] |
| **Qualidade e limites** | Bloqueios e denúncias derrubam a "nota de qualidade" do número e os limites diários de envio para novas pessoas. A frequência baixa é também proteção técnica | conferir |
| **Robôs de IA** | Desde 15/01/2026, os termos proíbem **chatbots de IA de uso geral** na API. Bots da própria empresa para atendimento e avisos continuam permitidos. O FONEMA usa **menus fixos + atendimento humano**, sem IA conversacional aberta | busca web [S5] |
| **Menores** | A política de mensageria não traz regra específica sobre empresas que falam com responsáveis de crianças. Os Termos do WhatsApp têm idade mínima para usuários. **O FONEMA não depende disso: o destinatário é sempre um adulto identificado** | busca web [S4], conferir |
| **Conteúdo proibido** | A política comercial da Meta veda certos produtos e conteúdos e o envio de dados sensíveis desnecessários. Os modelos do FONEMA não pedem nem enviam documento, dado de saúde ou senha | conferir |

### 2.1 Provedores (BSPs) com atuação no Brasil

A escolha entre a **Cloud API direta** (menos custo, mais engenharia) e um **BSP** (painel, suporte em português, contrato no Brasil, às vezes SMS de reserva no mesmo contrato) fica para a licitação ou cotação. Candidatos citados no mercado, **todos [conferir] status de parceiro Meta, preço e onde guardam os dados**:

| Provedor | Por que olhar |
|---|---|
| Zenvia | Empresa brasileira, WhatsApp + SMS + voz no mesmo contrato, atende governo |
| Blip (Take Blip) | Brasileira, muito usada por grandes marcas, construtor de fluxos |
| Infobip | Global com operação no Brasil, WhatsApp + SMS + voz |
| Twilio | API muito documentada, bom para equipe de engenharia |
| Sinch, Gupshup, 360dialog | Alternativas globais. A 360dialog repassa a API quase "crua" e costuma cobrar taxa fixa por número |
| Meta Cloud API direta | Sem intermediário. Exige a Business Verification da Meta e equipe que mantenha a integração |

**Critérios de escolha:** contrato de operador LGPD (art. 39) com proibição de uso secundário, apagamento e cláusulas de transferência internacional (arts. 33–36 ⚖️); armazenamento mínimo no BSP (sem guardar o conteúdo); webhook assinado; suporte a mídia (áudio OGG/Opus, imagem, vídeo); SMS de reserva; preço em BRL e nota fiscal no Brasil; atendimento de requisitos de contratação pública (rede).

**Arquitetura sem dependência de fornecedor:** o módulo de mensageria fala com uma interface `ProvedorMensagens` (enviar modelo, enviar mídia, receber webhook). Trocar de BSP, ou ir para a Cloud API direta, não muda o resto do sistema.

---

## 3. Casos de uso

| # | Caso | Quem dispara | Quando | Categoria (prevista) | Detalhes e salvaguardas |
|---|---|---|---|---|---|
| U1 | **Resumo semanal** com "Nível X de 10" e cartão-imagem | automático | segunda, 18h (ajustável pelo adulto) | utilidade | Cartão (`cartao-resumo-semanal.png`) no cabeçalho + 3 botões: **Ouvir resumo**, **Ver a missão**, **Mais opções**. Ao tocar, abre a janela e a Sofia manda o resumo em áudio (cerca de 35 s), de graça. O nível nunca desce na mensagem (Decisão 004, §1.4) |
| U2 | **Missão da semana em áudio** (Sofia ou professora) | automático, com áudio da professora para a turma quando houver | dentro da janela aberta pelo U1, ou como modelo próprio na terça | serviço (na janela) / utilidade | Áudio de 20–40 s + imagem da palavra + botões **Fizemos!**, **Ouvir de novo**, **Esta semana não dá**. A professora pode gravar uma vez para a turma toda, e o sistema escolhe a missão pelo nível de cada criança |
| U3 | **Vídeo curto da semana** | automático | quinta, dentro da janela ou como modelo com cabeçalho de vídeo | utilidade | Até 60 s, menos de 5 MB (dados móveis: rel. 26 §3.1-8). Vem da biblioteca de vídeos da Proposta Unificada. O adulto pode desligar só os vídeos |
| U4 | **Lembrete gentil** | automático | quarta, só se a missão **não** foi marcada | utilidade | No máximo 1 por semana. Tom sem culpa ("se a semana está corrida, tudo bem"). Não sai se a família tocou em "Esta semana não dá" |
| U5 | **Reforço / conquista** | automático | sexta, ou quando o nível sobe | utilidade | Elogia o **processo** (rel. 13): "ela tentou de novo e conseguiu". Botão **Mandar parabéns**: a mensagem aparece para a criança no app, falada pela Sofia |
| U6 | **Aviso de reunião** | escola/professora | ao agendar + lembrete na véspera | utilidade | Botões **Vou**, **Não posso**, **Ouvir o convite**. A presença confirmada vai para o painel da professora |
| U7 | **Resposta dos pais por áudio ou botão** | adulto | a qualquer hora | serviço | Os botões resolvem 90% (Fizemos!, Vou, Ouvir). Áudio ou texto livre vai para a **caixa de atendimento humano** com prazo visível. Não há transcrição automática nem identificação de voz. Fora do horário, o aviso diz quando alguém responde |
| U8 | **Pedido de ajuda → atendimento humano** | adulto (menu "Pedir ajuda à escola" ou palavra AJUDA) | a qualquer hora | serviço | Abre um chamado para a escola (professora ou secretaria escolar), ou para o suporte FONEMA no plano família. Resposta pela plataforma, nunca de celular pessoal. Prazo padrão: até 1 dia útil |
| U9 | **Comunicado da escola/turma** sem expor o número da professora | professora, coordenação, direção | agendado, respeitando o horário silencioso | utilidade | Padrão envelope: o modelo `recado_turma` avisa "a prof.ª Márcia mandou um recado", e o texto completo e o áudio chegam quando o adulto toca (`conversa-professora.png`). O painel confere: sem nome de criança, sem foto de criança, teto semanal |
| U10 | **Alerta de dificuldade persistente** | sistema **sugere**, professora **revisa e aprova** | dia útil, horário escolar | utilidade | Regra (exemplo): sem avanço de nível em 8 semanas de uso regular, ou 3 tentativas de passagem sem sucesso. O alerta chega primeiro ao painel da professora, que decide se convida. A mensagem é acolhedora, sem detalhes nem rótulos, e oferece conversa (escola, ligação ou áudio). Os detalhes só aparecem no app ou na conversa presencial |
| U11 | **Código de acesso** (login do responsável) | sistema | quando pedido | autenticação | Alternativa ao SMS para o código de entrada. Não leva o nome da criança |
| U12 | **Assinatura** (só plano família) | sistema | vencimento ou falha de pagamento | utilidade | Só para o adulto pagante, opt-in próprio. Nunca menciona conteúdo bloqueado para a criança como pressão |
| U13 | **Pausa de férias e retorno** | sistema/escola | início e fim das férias | utilidade (risco de marketing) | Por padrão, o envio pausa nas férias. O adulto pode escolher receber 1 brincadeira de leitura por semana |
| U14 | **Renovação anual do consentimento** | sistema | 12 meses após o opt-in | utilidade | Pergunta se quer continuar. Sem resposta em 30 dias, o envio para (opt-in "vencido") |
| U15 | **Experimento A/B** (SMS × texto × áudio) | pesquisa (rel. 26, Proposta 5) | ano letivo do estudo | — | Só para quem marcou "estudo A/B". Sorteio por turma (conglomerado). Medida principal: missão feita e nível, não "abertura" |

---

## 4. Fluxos e menus por botões (para quem lê pouco)

### 4.1 Consentimento (opt-in) — ver `fluxo-whatsapp.png`, faixa 1

1. O adulto entra no app (conta própria ou criada pela escola). O celular é confirmado por código.
2. Tela **"Quer receber as novidades da leitura no celular?"**, com botão "Ouvir esta tela" e 4 caixas **desmarcadas e separadas**:
   - ☐ Resumo da semana e missão (até 3 por semana)
   - ☐ Recados e reuniões da escola
   - ☐ Lembretes (missão pendente, reunião amanhã)
   - ☐ Participar do estudo sobre mensagens (opcional, não muda nada no ensino)

   Abaixo aparece, em linguagem simples: quem manda (a escola/rede, com o FONEMA como operador), o que vai pelo mensageiro (primeiro nome e nível, nunca foto ou voz), que a Meta e o provedor processam a mensagem e podem estar fora do Brasil, e como parar ("mande PARAR").
3. O sistema grava o **registro de consentimento**: quem, quando, versão do texto, categorias, canal e controlador.
4. O sistema manda o modelo `boas_vindas` com **[Quero receber] [Não quero]**. Só depois do "Quero receber" a família entra nas filas (duplo opt-in). Esse primeiro toque também abre a janela de 24 h.
5. Na escola pública, se o responsável não tem o app, a secretaria pode registrar o consentimento em papel (termo assinado e digitalizado). A política da Meta aceita opt-in em papel **[conferir]**, e o duplo opt-in no mensageiro continua obrigatório.

### 4.2 Menu principal (palavra **MENU**, ou botão "Mais opções")

Lista interativa, um ícone por linha, frase curta. Cada item também tem número ("mande 1"):

| Item | O que faz |
|---|---|
| ▶ Ouvir o resumo de novo | manda o áudio da Sofia |
| ★ Ver a missão | áudio + imagem da missão + botões Fizemos!/Depois |
| ? Pedir ajuda à escola | abre um chamado humano. Pede um áudio ou texto curto |
| 📅 Reuniões | próximas reuniões, com Vou/Não posso |
| ⚙ Mudar dia e horário | 3 botões: segunda 18h / sábado 10h / outro (abre o app) |
| 🔈 Só áudio / só texto | preferência de formato |
| ■ Parar as mensagens | pergunta "parar tudo ou só lembretes?", com 2 botões |

**Palavras reconhecidas** (sem diferenciar maiúsculas, acentos ou erros comuns): MENU, AJUDA, PARAR / SAIR / CANCELAR / NÃO QUERO, VOLTAR, OUVIR, FIZEMOS. Qualquer outra coisa vai para atendimento humano, com o aviso do prazo.

### 4.3 Semana típica (formato READY4K, ver `conversa-familia.png`)

```
SEG 18h  modelo resumo_semanal (cartão + 3 botões) ──tocou──► áudio da Sofia (grátis, janela)
                                                    └─ Ver a missão ► áudio da professora + imagem + [Fizemos!][Ouvir de novo][Esta semana não dá]
QUA 18h30 (só se a missão não foi marcada) modelo lembrete_gentil ── [Ouvir a missão][Fizemos!]
SEX 18h  modelo reforco_semana ("ela tentou e conseguiu") ── [Mandar parabéns]
```
Teto: 3 automáticas por semana + até 2 da escola. **1 por dia**, no máximo. Respostas a quem escreveu não contam.

### 4.4 Pedido de ajuda → humano

```
adulto: "AJUDA" ou áudio  ─►  "Recebemos. Uma pessoa da escola responde até amanhã, 12h."
                           ─►  chamado na caixa de atendimento (professora/secretaria) com: primeiro nome, turma, último resumo
professora responde no painel (texto ou áudio) ─► se a janela de 24 h fechou: modelo atendimento_retorno [Ver resposta]
chamado fechado ─► mídia apagada (no máximo 30 dias)
```

### 4.5 Dificuldade persistente (cuidado redobrado)

1. O sistema marca "sem avanço" no painel da professora, com os dados do app (nunca no mensageiro).
2. A professora revisa (pode haver falta, mudança na família, problema de visão ou audição), escolhe "convidar para conversar" e, se quiser, grava um áudio próprio.
3. A família recebe `convite_conversa`: sem nível, sem "dificuldade", sem comparação. Os botões oferecem o formato da conversa.
4. Sem resposta, **não** há lembrete automático: a professora decide o próximo passo.
5. Encaminhamentos de saúde (fono, avaliação) só **na conversa humana**, com o protocolo da rede. Nunca por mensagem automática.

---

## 5. Catálogo de modelos (pt-BR)

Convenções: `{{n}}` = variável. Botões entre colchetes, com até 20 caracteres. Texto para leitura fácil e frases curtas. Todo modelo de utilidade cita algo concreto da conta da família. A categoria é a **nossa proposta**: a Meta pode recategorizar. Os nomes de modelo usam `snake_case` em minúsculas.

| # | Nome | Categoria | Cabeçalho | Texto | Botões |
|---|---|---|---|---|---|
| 1 | `boas_vindas` | utilidade | texto: "Canal da escola {{1}}" | Olá, {{2}}! Você pediu no app do FONEMA para receber aqui as novidades da leitura de {{3}}. Mandamos no máximo 3 mensagens por semana, das 8h às 20h. Para parar, é só mandar PARAR. | [Quero receber] [Não quero] |
| 2 | `resumo_semanal` | utilidade | imagem: cartão | Oi, {{1}}! O resumo da semana de {{2}} chegou: nível {{3}} de 10. Esta semana: {{4}}. | [Ouvir resumo] [Ver a missão] [Mais opções] |
| 3 | `missao_semana` | utilidade | imagem: palavra da missão | A missão desta semana de {{1}} leva 5 minutos: {{2}}. Toque em Ouvir para escutar a explicação. Você não precisa saber ensinar. | [Ouvir a missão] [Fizemos!] [Esta semana não dá] |
| 4 | `video_semana` | utilidade | vídeo (até 60 s) | Vídeo de 1 minuto sobre o que {{1}} está aprendendo: {{2}}. Dá para assistir junto. | [Assistimos!] [Não quero vídeos] |
| 5 | `lembrete_gentil` | utilidade | — | Oi, {{1}}. A missão de {{2}} ainda está esperando. Se a semana está corrida, tudo bem: dá para fazer em 5 minutos, até no caminho de casa. | [Ouvir a missão] [Fizemos!] [Esta semana não dá] |
| 6 | `reforco_semana` | utilidade | — | {{1}} treinou {{2}} esta semana. Diga para {{1}}: "você tentou e conseguiu!". Elogiar o esforço ajuda a criança a continuar. | [Mandar parabéns] [Ouvir] |
| 7 | `nivel_conquistado` | utilidade | imagem: cartão do novo nível | Novidade boa: {{1}} chegou ao nível {{2}} de 10 da leitura. Obrigado por acompanhar em casa. | [Ver o cartão] [Mandar parabéns] |
| 8 | `convite_reuniao` | utilidade | — | A escola {{1}} convida você para {{2}} no dia {{3}}, às {{4}}, em {{5}}. | [Vou] [Não posso] [Ouvir o convite] |
| 9 | `lembrete_reuniao` | utilidade | — | Lembrete: amanhã, às {{1}}, tem {{2}} na escola {{3}}. Esperamos você! | [Vou] [Não posso mais] |
| 10 | `recado_turma` | utilidade | — | A prof.ª {{1}} mandou um recado para as famílias da turma {{2}}. Toque para ouvir ou ler. | [Ouvir recado] [Ler recado] |
| 11 | `aviso_escola` | utilidade | texto: "Aviso da escola {{1}}" | A direção mandou um aviso sobre {{2}} (ex.: "mudança de horário na sexta"). Toque para saber mais. | [Ouvir aviso] [Ler aviso] |
| 12 | `convite_conversa` | utilidade | — | Oi, {{1}}. A prof.ª {{2}} gostaria de conversar com você sobre como apoiar {{3}} na leitura. Cada criança tem seu tempo, e juntos a gente encontra o melhor caminho. Qual jeito fica melhor? | [Na escola] [Por ligação] [Me mande um áudio] |
| 13 | `atendimento_retorno` | utilidade | — | Oi, {{1}}. A equipe da escola {{2}} respondeu seu pedido de ajuda. Toque para ver ou ouvir. | [Ver resposta] [Ouvir resposta] |
| 14 | `codigo_acesso` | autenticação | — | {{1}} é o seu código para entrar no FONEMA. Não mostre para ninguém. Ele vale por 10 minutos. | [Copiar código] |
| 15 | `parar_confirmado` | utilidade | — | Pronto: você não vai mais receber {{1}} por aqui. Se mudar de ideia, toque abaixo ou mande VOLTAR. | [Voltar a receber] |
| 16 | `pausa_ferias` | utilidade (risco de marketing) | — | Boas férias! As mensagens da leitura de {{1}} param até {{2}}. Quer receber 1 brincadeira de leitura por semana nas férias? | [Quero] [Não, obrigado] |
| 17 | `renovar_consentimento` | utilidade | — | Faz 1 ano que você recebe aqui as novidades da leitura de {{1}}. Quer continuar? Se não responder em 30 dias, paramos de mandar. | [Continuar] [Parar] |
| 18 | `ouvir_no_app` | utilidade | — | {{1}} gravou uma leitura no app para você ouvir. Por segurança, a gravação fica só no app. | [Abrir o app] |
| 19 | `assinatura_vence` (só B2C) | utilidade | — | Sua assinatura do FONEMA vence em {{1}}. Para continuar, abra a área do responsável no app. | [Abrir o app] [Falar com suporte] |
| 20 | `missao_marcada` | utilidade | — | Missão de {{1}} marcada como feita. Ela vai ver uma surpresa da Sofia no app. Até segunda! | [Ouvir a Sofia] |

**Mensagens de serviço (dentro da janela, sem modelo, texto livre aprovado internamente):**
- "Recebemos seu áudio. Uma pessoa da escola vai ouvir e responder até {{prazo}}."
- "Por segurança, não mande fotos nem áudios da criança por aqui. A leitura dela fica guardada só no app."
- "Não entendi. Mande MENU para ver as opções, ou AJUDA para falar com uma pessoa."
- "Agora é fora do horário da escola. Sua mensagem foi guardada e será respondida até {{prazo}}."

**Regras de redação:** sem "!!!", sem caixa alta, sem urgência falsa ("última chance"), sem comparação ("abaixo da turma"), sem promessa ("vai aprender em X meses"), sem neuromitos (rel. 15). Primeiro nome da criança, nunca o sobrenome. Cada modelo tem a versão **áudio** gravada (voz da Sofia) para o botão "Ouvir".

---

## 6. Arquitetura

Ver `fluxo-whatsapp.png`. É um **módulo de mensageria** dentro do monólito modular (NestJS + PostgreSQL + AWS São Paulo, Proposta 5), com interface própria para trocar de provedor.

| Componente | Responsabilidade | Tecnologia (proposta) |
|---|---|---|
| **Eventos do produto** | `resumo.pronto`, `missao.nova`, `missao.pendente`, `nivel.subiu`, `recado.criado`, `reuniao.agendada`, `conversa.aprovada` (dificuldade persistente, só após aprovação da professora) | eventos de domínio no monólito |
| **Motor de regras** | Antes de enfileirar, verifica: consentimento ativo **na categoria**; horário silencioso (8h–20h, dias úteis, fuso da escola); teto semanal e diário; pausa (férias, "esta semana não dá"); minimização (lista branca de variáveis); modelo aprovado; grupo do estudo A/B | serviço puro, testado por unidade |
| **Outbox** | Grava a intenção de envio na **mesma transação** do evento. Chave de idempotência `família+modelo+semana` | tabela PostgreSQL |
| **Fila de saída** | Ordem por família (FIFO agrupada), reenvio com espera crescente, fila de mensagens mortas com alerta | SQS FIFO |
| **Gerador de mídia** | Cartão PNG (renderização de HTML no servidor, sem metadados EXIF), áudios pré-gravados ou TTS de qualidade revisado. Upload para a mídia do provedor ou URL assinada de curta duração | worker + S3 (São Paulo) |
| **Worker de envio** | Chama `ProvedorMensagens.enviarModelo()` / `enviarMidia()`, respeita o limite de taxa e grava só `id_mensagem_provedor` + status | worker |
| **Webhook** | Endpoint HTTPS público. **Verificação de cadastro** (desafio `hub.challenge` com token de verificação) e **assinatura de cada chamada** (`X-Hub-Signature-256`: HMAC-SHA256 do corpo bruto com o segredo do app, comparação em tempo constante). Responde 200 rápido e enfileira. Rejeita repetição pelo id do evento | API Gateway/ALB → handler leve |
| **Processador de entrada** | Status (enviado/entregue/lido/falhou), botões (payload assinado com o id interno, nunca com dados da criança), palavras-chave, texto/áudio livre → caixa de atendimento | worker |
| **Caixa de atendimento** | Chamados por escola/turma, com prazo e responsável. Resposta em texto ou áudio pela plataforma. Mídia baixada **só** para chamados, cifrada e apagada ao fechar (máx. 30 dias) | módulo web do painel |
| **Cofre de telefones** | Telefone do adulto cifrado (KMS), **separado** do perfil da criança. Índice por HMAC do telefone para casar mensagens recebidas | tabela própria + KMS |
| **Registro de consentimento** | Append-only: versão do texto, categorias, data, canal, controlador, revogações | tabela + trilha de auditoria imutável |
| **SMS de reserva** | Para quem não usa o mensageiro, ou quando a entrega falha 2 vezes | mesmo BSP ou provedor SMS |
| **Observabilidade** | Logs estruturados **sem conteúdo**: id do modelo, hash do telefone, id interno da família, status, latência. Painéis: entrega, falha, opt-out, qualidade do número | CloudWatch/OpenTelemetry |

**Números e contas.** Recomendação: (a) um número **FONEMA** para o plano família e escolas privadas pequenas; (b) para redes públicas, a opção de **número próprio da secretaria** ("Secretaria de Educação de X · FONEMA") numa conta comercial verificada da própria rede, com o FONEMA como provedor de tecnologia. Isso reforça o papel da rede como controladora e a confiança das famílias. **[conferir]** o processo de verificação de órgão público na Meta.

**Armazenamento mínimo:** o conteúdo enviado **não** é guardado (fica só o modelo + hash das variáveis); status de entrega por 90 dias; métricas agregadas por turma por 13 meses; mídia recebida por até 30 dias; consentimento e opt-out guardados como prova enquanto durar o vínculo + prazo legal ⚖️; telefone apagado quando a família sai.

**Opt-out em todas as camadas:** "PARAR" (e variações), botão no menu ou no app → revogação gravada → **todas** as filas daquela família são esvaziadas na hora → modelo `parar_confirmado`. Bloqueio do número pelo adulto também é tratado como opt-out.

**Testes obrigatórios:** motor de regras (horário, teto, consentimento, minimização) com testes de unidade e propriedade; webhook com assinatura inválida, repetida e fora de ordem; simulador do provedor no CI; checagem automática de que nenhuma variável de modelo contém campo fora da lista branca.

---

## 7. Custos estimados por família/mês

**Base de preço (conferir tabela vigente na Meta e no BSP antes de qualquer proposta comercial).** Desde 01/07/2025, a cobrança é por modelo entregue. Mensagens de serviço e modelos de utilidade **dentro da janela aberta** não são cobrados [S2]. Para o Brasil, as estimativas de terceiros em 2026 ficam em torno de **R$ 0,04–0,05 por utilidade**, **R$ 0,15–0,19 por autenticação** e **R$ 0,31–0,38 por marketing** [S1]. Outras fontes dão, em dólar, cerca de US$ 0,007–0,008 por utilidade e US$ 0,06–0,07 por marketing. A Meta passou a publicar as tarifas em BRL em 2026 **[conferir tabela vigente]**. BSPs cobram por cima: taxa por mensagem, mensalidade ou ambos **[conferir]**.

| Cenário (por família, 4,3 semanas/mês) | Modelos cobrados/mês | Custo Meta (estimado) | Comentário |
|---|---|---|---|
| **Enxuto** (o desenho acima: 1 modelo na segunda + lembrete só para quem não fez + reforço dentro da janela) | cerca de 6 utilidade | **≈ R$ 0,25–0,30** | áudio, vídeo e missão vão de graça dentro da janela aberta pelo toque |
| **Típico** (3 modelos/semana fora da janela + 2 recados da escola/mês) | cerca de 15 utilidade | **≈ R$ 0,60–0,75** | |
| **Pior caso** (Meta recategoriza missão e lembrete como marketing) | 9 marketing + 6 utilidade | **≈ R$ 3,10–3,70** | por isso os modelos citam a conta da família, e há monitoramento da categoria |
| **+ BSP** | — | **+ R$ 0,10–0,60** (estimativa) | depende de contrato e volume **[conferir]** |
| **+ SMS de reserva** (≈10% das famílias, 3 SMS/semana) | — | ≈ R$ 0,10–0,20 na média | o preço do SMS no Brasil varia muito por volume **[conferir]** |

**Ordem de grandeza para planejamento: R$ 0,50 a R$ 1,50 por família/mês** no cenário típico, com teto de cerca de R$ 4 no pior caso. Numa rede com 10 mil crianças: cerca de R$ 5–15 mil/mês. O valor entra no preço por aluno/mês (Decisão 001) como custo variável. Para reduzir: dia e horário escolhidos pela família (aumenta o toque, que abre a janela), missão dentro da janela, nada de marketing e A/B com a notificação do próprio app.

---

## 8. Métricas

| Métrica | Definição | Uso |
|---|---|---|
| Entrega | entregues / enviados | saúde técnica (meta > 97%) |
| Leitura (proxy) | "lido" / entregues | **subestimada**: quem desliga o aviso de leitura não aparece. Nunca usar para cobrar família |
| **Toque** | adultos que tocaram em algum botão / entregues | principal sinal de engajamento (abre a janela) |
| Áudio ouvido | pedidos de "Ouvir" / entregues | adequação ao público de baixa escolaridade |
| **Missão feita** | "Fizemos!" no mensageiro **ou** no app / famílias ativas na semana | **métrica-alvo** (dose em casa, rel. 26) |
| Nível ao longo do tempo | progresso no termômetro, por grupo do estudo | efeito (o RCT usa medida externa, não o jogo) |
| Opt-out | paradas / famílias ativas por mês | alerta se > 2%/mês; motivo opcional ("muitas mensagens", "não uso") |
| Bloqueio/denúncia e nota de qualidade | sinais do provedor | alerta imediato; pausa do modelo que gerou bloqueios |
| Atendimento | tempo até a 1ª resposta humana; % dentro do prazo | carga da escola |
| Reunião | "Vou" / convidados; presença real (lançada pela escola) | |
| Custo | R$ por família ativa/mês; % de mensagens grátis (na janela) | |

As métricas são **agregadas por turma e escola**. A professora vê "missão feita" por família só da própria turma. A secretaria vê agregados, nunca a conversa.

---

## 9. Riscos e salvaguardas

| Risco | Salvaguarda |
|---|---|
| Excesso de dados da criança fora da plataforma | Lista branca de variáveis (primeiro nome ou apelido, nível 0–10, texto da missão). Sobrenome, escola completa, foto, nota, laudo e socioemocional ficam bloqueados por código. O cartão-imagem é gerado com os mesmos campos. Teste automático no CI |
| Áudio ou foto da criança circulando | O FONEMA **nunca envia** mídia da criança. "Ouça seu filho ler" fica no app. Mídia recebida: aviso gentil, sem reencaminhar, apagada em até 30 dias |
| Criança usando o celular do adulto | Conteúdo pensado para adulto, sem oferta nem pressão. Nada que exponha a criança se ela ler. O botão "Mandar parabéns" entrega a mensagem para a criança **no app**, mediada pela Sofia |
| Mensagens demais / incômodo | 3 automáticas + 2 da escola por semana, 1 por dia, **8h–20h em dias úteis**, nada em domingo e feriado, pausa nas férias, dia e hora escolhidos pelo adulto, botão "Esta semana não dá" |
| Rótulo ou diagnóstico indevido | Alerta de dificuldade só com aprovação da professora, texto acolhedor sem detalhes, encaminhamento só na conversa humana |
| Sobrecarga da professora | Comunicado em 1 tela, áudio gravado uma vez para a turma, caixa de atendimento compartilhada com a secretaria escolar, prazos realistas, respostas prontas |
| Exposição do número pessoal da professora | Remetente sempre institucional. Política da rede orienta não criar grupos paralelos (rel. 26 [75]) |
| Recategorização como marketing (custo e regras) | Texto ligado à conta, revisão trimestral das categorias, alerta de custo, troca do modelo |
| Queda do número ou bloqueio da conta comercial | SMS de reserva, notificação no app, segundo número de contingência **[conferir política]**, monitoramento da nota de qualidade |
| Fraude ou golpe usando o nome da escola | Número verificado, aviso fixo "nunca pedimos dinheiro, senha ou documento por aqui", educação das famílias na reunião |
| Transferência internacional (Meta/BSP) | Informada no consentimento. Cláusulas contratuais (arts. 33–36 ⚖️). Dados mínimos reduzem o impacto |
| Família sem o mensageiro ou sem plano de dados | SMS, notificação no app e bilhete impresso gerado pela plataforma. Ninguém fica de fora da comunicação da escola |
| Desigualdade no estudo A/B | O grupo de controle recebe as mesmas informações no app. Nenhum grupo fica sem aviso de reunião ou recado da escola |
| Políticas da Meta mudarem (preço, IA, categorias) | Interface `ProvedorMensagens`, contratos curtos, canal do app como plano B, acompanhamento do changelog |

---

## 10. LGPD e ECA Digital (resumo para o parecer ⚖️)

| Tema | Proposta |
|---|---|
| **Titulares** | O adulto (telefone, preferências) e a criança (primeiro nome e nível que aparecem na mensagem) |
| **Controlador** | **Rede/escola** na comunicação escola–família contratada. **FONEMA** no plano família (B2C) |
| **Operador** | FONEMA, nos contratos com escolas e redes (contrato de operador, art. 39). BSP e Meta como **suboperadores** autorizados no contrato |
| **Base legal** | Dados da criança: art. 14 (melhor interesse) + Enunciado CD/ANPD nº 1/2023 (permite bases dos arts. 7º e 11). Para o **canal**, a proposta conservadora é o **consentimento específico e destacado** do responsável, por categoria e revogável. Isso também atende à exigência de opt-in da Meta. Na rede pública, avaliar a execução de políticas públicas (art. 7º, III) para comunicados essenciais, **mantendo o opt-in do mensageiro** ⚖️ |
| **Finalidade** | Acompanhar a alfabetização da criança e a comunicação escola–família. **Vedado:** marketing de terceiros, perfilamento comercial, publicidade para a criança (ECA Digital), venda de dados, treino de modelos com conversas |
| **Necessidade** | Lista branca de variáveis; conteúdo não armazenado; mídia apagada |
| **Transparência** | Tela de consentimento com áudio, política em linguagem simples, aviso de transferência internacional, canal do encarregado |
| **Direitos** | Pelo app ou pela palavra AJUDA: acesso, correção, revogação, exclusão. Exportação do histórico de consentimento |
| **Segurança** | Cifragem do telefone (KMS), webhook assinado, segredos em cofre, logs sem conteúdo, acesso por papel (RLS), auditoria |
| **RIPD** | Relatório de impacto específico do canal antes do piloto |
| **ECA Digital** | O canal não fala com a criança, não tem publicidade nem mecânica de engajamento compulsivo, tem supervisão parental (o adulto controla tudo) e privacidade por padrão (tudo desmarcado) |

---

## 11. Próximos passos

1. Abrir a conta comercial e a Business Verification do FONEMA na Meta. Cotar 3 BSPs (Zenvia, Blip, Infobip ou Twilio) e a Cloud API direta, com a **tabela de preços vigente em BRL**.
2. Submeter os 20 modelos para aprovação e registrar a categoria atribuída pela Meta a cada um.
3. Gravar os áudios da Sofia (resumo e missões por nível) e o roteiro do áudio semanal da professora.
4. Teste de usabilidade com 10–15 responsáveis de baixa escolaridade (rel. 26): entender o cartão, tocar o botão certo, pedir ajuda.
5. Parecer jurídico (⚖️ base legal na rede pública, transferência internacional, retenção, número próprio de secretaria).
6. Piloto com 2 turmas: medir toque, missão feita, opt-out e custo real por família. Depois, o desenho A/B do RCT de 2028 (Proposta 5).

---

## Fontes desta frente (busca na web, 13/11/2026)

O site de desenvolvedores da Meta não abriu nesta sessão (bloqueio de rede). Os pontos abaixo vieram de busca, com páginas da Meta citadas nos resultados e confirmadas por provedores. **Conferir na documentação oficial antes de contratar.**

- [S1] Preços por mensagem, faixas e estimativas para o Brasil: Meta, "Pricing on the WhatsApp Business Platform" (https://developers.facebook.com/docs/whatsapp/pricing); estimativas em BRL de terceiros: https://talkall.com.br/en/novidades/tarifas-whatsapp-2026 ; https://www.messagecentral.com/blog/whatsapp-business-api-pricing-brazil ; https://newbyte.net.br/en/blog/precificacao-do-whatsapp-business-api
- [S2] Mudança para cobrança por mensagem (01/07/2025), utilidade grátis dentro da janela, serviço grátis: https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing ; https://support.twilio.com/hc/en-us/articles/30304057900699-Notice-Changes-to-WhatsApp-s-Pricing-July-2025 ; https://www.ycloud.com/blog/whatsapp-api-pricing-update
- [S3] Componentes de modelo (cabeçalho com texto, imagem, vídeo, documento e localização, sem áudio): https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components ; https://docs.360dialog.com/docs/resources/templates/template-elements
- [S4] Opt-in (antes do contato, por categoria, opt-out honrado, métodos aceitos inclusive papel): https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in ; https://www.infobip.com/en/blog/how-to-collect-whatsapp-business-opt-ins
- [S5] Proibição de chatbots de IA de uso geral na API desde 15/01/2026 (bots de atendimento da empresa permitidos): https://respond.io/blog/whatsapp-general-purpose-chatbots-ban ; https://techradar.com/ai-platforms-assistants/meta-will-ban-rival-ai-chatbots-from-whatsapp
- Assinatura do webhook (`X-Hub-Signature-256`, HMAC-SHA256) e desafio de verificação (`hub.challenge`): padrão dos webhooks da Meta, citado de memória **[conferir]**.
- Projeto: rel. 26 (READY4K [14], diferenciação [15], Lichand et al. [22], WhatsApp na pandemia [75], Inaf [80]); rel. 05 (LGPD art. 14, Enunciado ANPD 1/2023, ECA Digital e Decreto 12.880/2026); Proposta 5 (`../../05-fonema-escola/README.md`).
