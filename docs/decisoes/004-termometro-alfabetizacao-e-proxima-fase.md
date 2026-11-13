# Decisão 004 — Termômetro rumo à alfabetização plena + próxima fase (organização e infraestrutura)

**Data:** 13/11/2026 · **Status:** aprovada pelo dono do projeto

## 1. Termômetro da alfabetização
**Objetivo:** todos os envolvidos (criança, responsável, professor, escola e secretaria) sabem **em que nível a criança está** da alfabetização e **quantos níveis faltam** para chegar à alfabetização plena. A jornada é divertida e transformadora.

### 1.1 Escala FONEMA de Alfabetização (proposta inicial, a validar)
Escala **por critério** (o que a criança já sabe fazer), **não por comparação** com outras crianças. Cada nível tem descritores observáveis, provinha de passagem e correspondência com a região do mapa.

| Nível | Nome (para adultos) | A criança consegue… | Região do mapa (rel. 37) |
|---|---|---|---|
| 0 | Ponto de partida | Ouvir e brincar com sons e rimas | Quintal |
| 1 | Sons e vogais | Identificar vogais e primeiros sons iniciais | Ilha das Vogais |
| 2 | Primeiras letras | Ligar letra ↔ som das consoantes mais regulares | 1º bioma |
| 3 | Juntando sons | Ler sílabas simples (CV) e palavras curtas | … |
| 4 | Primeiras palavras | Ler e escrever palavras regulares, inclusive inventadas (pseudopalavras) | … |
| 5 | Sílabas complexas | Ler sílabas CVC, nasais e dígrafos | … |
| 6 | Encontros e casos especiais | Ler encontros (pr, bl…) e grafias contextuais | … |
| 7 | Frases | Ler e compreender frases; escrever frases simples | … |
| 8 | Pequenos textos | Ler textos curtos com compreensão literal | … |
| 9 | Leitor fluente | Ler com fluência e entonação; inferências simples | … |
| 10 | **Alfabetizado pleno** | Ler e compreender textos do 2º ano, produzir textos curtos com ortografia regular; equivalente à meta do indicador Criança Alfabetizada (Saeb 743) como **referência, não equivalência oficial** | Arquipélago dos Livros |

*Os descritores, a ordem dos sons e os critérios de passagem vêm dos rels. 02, 20, 29 e 35 e serão validados com especialistas e no piloto.*

### 1.2 Como cada um vê
| Quem | O que vê | Formato |
|---|---|---|
| **Criança** | A trilha no mapa, o **termômetro que enche** a cada som dominado e a próxima região a desbloquear | Visual e falado pela Sofia, **sem números nem comparação** com colegas (rels. 13, 31, 43) |
| **Responsável** | "Nível **6 de 10**: faltam **4 níveis**", o que já sabe, o que está aprendendo, previsão de chegada (faixa) e missão da semana | Uma tela simples por semana, com áudio para pais com baixa escolaridade (rel. 26) |
| **Professor** | Nível de cada aluno, distância até o nível 10, mapa de calor por habilidade e grupos sugeridos | Painel da turma (rel. 31) |
| **Escola/Secretaria** | Distribuição dos alunos pelos níveis 0–10 e % no nível 10 por turma/escola | Painel agregado, com a referência Saeb sempre rotulada como estimativa (rel. 20) |

### 1.3 Termômetros das competências transversais
Cada uma das 5 competências transversais (Decisão 003) tem o seu termômetro de **etapas** (rel. 43): pensamento computacional, lógica, emoções, tecnologia e educação financeira. Mostram o **que a criança fez**, nunca nota, rótulo ou traço de personalidade. O socioemocional nunca vai para a secretaria.

### 1.4 Regras de honestidade
- O nível só sobe com **domínio comprovado** (provinha + transferência + retenção após dias, rel. 20/35). Não sobe por tempo de uso.
- O nível **nunca desce visivelmente** para a criança. Se houver esquecimento, o sistema agenda revisões em silêncio.
- A previsão de chegada é mostrada como faixa ("entre 3 e 5 meses") e recalculada, sem promessa (Decisão 002, "sem prometer nada").

## 2. Próxima fase: organização e infraestrutura
Assim que a coleta e a síntese terminarem, começa a fase de **organização e infraestrutura**, com o requisito de ser **muito organizada, segura, 100% funcional e profissional**. Escopo previsto (detalhado na síntese):
1. **Organização do repositório:** monorepo (app + web + pacotes compartilhados), padrões de código, convenções de branch/commit, templates de PR/issue, documentação viva e registros de decisão (ADRs, como esta pasta).
2. **Qualidade:** testes automatizados (unidade, integração, ponta a ponta), lint/format, revisão obrigatória, CI em todo PR.
3. **Segurança e privacidade por padrão** (LGPD art. 14, ECA Digital): autenticação forte para adultos, perfis infantis sem dados desnecessários, RLS/controle de acesso por papel, criptografia, segredos fora do código, varredura de dependências e de segredos, logs sem dados pessoais, voz/câmera processadas no aparelho.
4. **Ambientes:** desenvolvimento, homologação e produção separados; infraestrutura como código; backups e plano de recuperação.
5. **Observabilidade:** monitoramento, alertas e métricas de saúde (incluindo as métricas éticas de engajamento).
6. **Entrega:** pipelines de publicação para web e lojas (Apple Kids / Google Families), versionamento e rollback.
7. **Governança:** checklist de conformidade, papéis e acessos, parecer jurídico e conselho pedagógico/fonoaudiológico.

Antes de iniciar, é necessário criar o branch principal (`main`) no repositório para permitir pull requests e regras de proteção.
