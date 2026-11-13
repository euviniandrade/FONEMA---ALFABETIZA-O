# Convenções do repositório FONEMA

Regras para manter o projeto organizado enquanto ele cresce (plataforma, universo, novas áreas e idiomas). Em dúvida, siga o que já existe e registre a exceção em [`QUALIDADE.md`](QUALIDADE.md).

## 1. Nomes de pastas e arquivos
- **Minúsculas, sem acento, sem espaço, palavras com hífen**: `esporte-respeito-ambiente/`, `tela-lojinha.png`, `regras-som.js`.
- **Prefixo numérico** quando a ordem de leitura importa: `01-ideia-e-missao.md`, `02-regioes-R0-R2.md`. Use 2 dígitos (3 nas decisões: `019-...`).
- **Exceções aceitas:**
  - `README.md` em toda pasta (é a porta de entrada) e os arquivos-guia em maiúsculas na raiz de `docs/` (`INDICE.md`, `QUALIDADE.md`, `CONVENCOES.md`);
  - siglas e códigos: países em ISO (`BR.md`), regiões (`R0`–`R10`), letras de opção em rodadas (`K-tales-desenho-moleque-1.mp3`), séries (`P1-01-...png`);
  - `_` inicial = **fonte HTML de uma arte** que gera um PNG (`fonte/_sofia-poses.html` → `sofia-poses.png`).
- **Versões**: sufixo `-v2`, `-v3` na pasta ou no arquivo (`personagens-v2/`). A versão antiga recebe um aviso "histórico" no README e **não é apagada** sem decisão do dono.
- Nada de `final`, `novo`, `copia`, `teste2` no nome: use versão (`-v2`) ou data no histórico do Git.

## 2. Onde colocar cada coisa

| Material | Onde | Observação |
|---|---|---|
| Decisão do dono | `docs/decisoes/NNN-titulo-curto.md` | Ver §3. Atualizar a tabela em `docs/decisoes/README.md` |
| Pesquisa (relatórios) | `docs/pesquisa/NN-tema.md` | Registro: não reescrever; correções viram nota |
| Bibliografia | `docs/bibliografia/` (dados gerados por `tools/bibliografia/`) | Registro: não editar à mão |
| Síntese da pesquisa | `docs/sintese/` | Documento mestre + blocos |
| Proposta de produto | `docs/propostas/NN-nome/` | 01–05 históricas; **06 vale** |
| Frente da proposta 06 | `docs/propostas/06-fonema-unificada/<frente>/` | Cada frente com `README.md`; fontes de arte em `fonte/` ou `fontes/` |
| Universo (personagens, mundo, marca) | `docs/universo/` | **Bíblia canônica** (D016). Personagem novo só existe com ficha no arquivo 02 |
| Imagens de uma frente | Na própria pasta da frente (`.png` 2× ou `.jpg`), com a fonte em `fonte/` | Toda imagem passa pelo checklist de arte (QUALIDADE §1) |
| Áudio e voz | `docs/propostas/06-fonema-unificada/voz/<rodada>/` | Nunca voz de criança real sem autorização |
| Vídeos | `.../videos/` (`.mp4` + `.vtt` de legenda + `thumb-*.png`) | Todo vídeo com atividade depois (D015) |
| Roteiros | `roteiros.md` dentro da frente (vídeos, série) | Mesmo checklist de valores (D012) |
| Protótipos HTML/JS | Pasta da frente, com `index.html`; bibliotecas de terceiros em `vendor/`, fontes tipográficas em `fonts/` | Sem CDN; tudo local |
| Scripts do projeto | `tools/<assunto>/` (`tools/bibliografia/`, `tools/qualidade/`) | Python 3 ou Node, com docstring de uso |
| Dados grandes gerados | `tools/<assunto>/data/` | **Fora do Git** (`.gitignore`) |

### 2.1 Futuras áreas, idiomas e séries (D017)
Quando começar uma área ou idioma novo, use **a mesma estrutura** para todos:

```
docs/areas/<area>/                 # ex.: matematica, ciencias, ingles
  README.md                        # visão, BNCC, ordem, link para decisões
  jornada/  videos/  roteiros/  impressos/  professor-familia/
docs/universo/                     # personagens continuam únicos (Sofia, Tales, Bolota)
docs/series/<serie>/               # séries de vídeo/livro fora da plataforma (D016)
  README.md  episodios/  roteiros/  imagens/
```
- Código de idioma em pastas e arquivos de texto/voz: `pt-BR`, `en`, `es` (ex.: `voz/en/`, `textos.pt-BR.json`).
- A alfabetização em português vem primeiro (D017 §4); nada de área nova sem decisão registrada.

## 3. Decisões
1. Nome: `docs/decisoes/NNN-titulo-curto.md`, com o próximo número livre.
2. Cabeçalho: `# Decisão NNN: título` + `**Data:** dd/mm/aaaa · **Status:** ...`.
3. Uma decisão **não é reescrita**. Se uma nova muda uma antiga, a antiga ganha a nota `*Atualizado pela [D0xx](...)...*` no ponto afetado.
4. Atualize a tabela e o quadro de conflitos em [`decisoes/README.md`](decisoes/README.md) e, se mexer em personagem, mundo ou valores, a [Bíblia do Universo](universo/README.md).

## 4. Textos
- Português do Brasil, frases curtas, linguagem simples.
- Falar em **plataforma, jornada, missões e atividades**; "jogo" só para mecânicas ("jogo da memória dos sons") (D014).
- Nomes oficiais: **FONEMA**, **Sofia**, **Tales**, **Bolota**, **Academia** (D011), **Espelho do Som** (nunca "Boquinhas", que é marca de terceiro).
- Links sempre **relativos** (`../decisoes/README.md`), para funcionarem no GitHub e localmente.
- Itens não decididos: marcar `🟡 a decidir`; itens jurídicos: `⚖️`; sugestões: `[proposta]`.

## 5. Commits
- Mensagem em **pt-BR**, no imperativo ou no formato `Área: o que mudou` (ex.: `Lojinha: troca adornos por utensílios (D008)`).
- Commits **pequenos e frequentes**, só com os arquivos que você mexeu (`git add <arquivos>`; evite `git add -A` com outros agentes trabalhando).
- Cite a decisão quando a mudança vier de uma (`(D012)`).
- Antes de commitar, rode as verificações (QUALIDADE §3). Se o push falhar por corrida, `git pull --rebase` e tente de novo.

## 6. Segredos e dados pessoais
- **Nada de segredo no repositório:** chaves de API (ElevenLabs etc.), senhas, tokens. Ficam no ambiente ou em `.env` / `.env.local`, que estão no `.gitignore`. Se um segredo for commitado por engano, **troque a chave** (apagar o commit não basta).
- **Nenhum dado de criança real**: nome, voz, foto, escola. Dados de exemplo são fictícios e marcados como tal.
- Vozes geradas: só vozes desenhadas (dubladora adulta fazendo voz de personagem); nunca clonar voz de criança real (D011).
