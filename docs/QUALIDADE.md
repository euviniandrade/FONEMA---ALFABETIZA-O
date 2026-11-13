# Qualidade do FONEMA

Documento permanente do **agente de organização e qualidade** ([Decisão 018 §5](decisoes/018-professor-familia-selos-online.md)). Tem três partes: (1) o checklist que todo material novo deve passar, (2) como rodar as verificações automáticas e (3) o relatório de cada rodada, do mais novo para o mais antigo.

---

## 1. Checklist permanente

### 1.1 Arte (imagens, telas, vídeos, avatar, lojinha)
- [ ] **D008 — sem joias nem adornos**: nada de brinco, colar, pulseira, anel, tiara, fivela, miçanga, piercing, maquiagem ou enfeite de cabelo, em **ninguém** (Sofia, Tales, elenco, avatar, animais). Permitido: utensílios e itens de função (mochila, lupa, binóculo, cantil, capacete, óculos de grau, aparelho auditivo, cadeira de rodas, muleta).
- [ ] **D009 — sem arco-íris**: nenhuma sequência de várias cores em faixas ou listras (velas, pipas, xilofones, roupas, fundos, gráficos). Máximo de 2–3 cores harmônicas por objeto; gráficos em escala de um tom. Cores de bandeiras são permitidas.
- [ ] **D007 — dupla oficial**: Sofia (morena, cachos volumosos soltos) e Tales (loiro), em 3D alegre, com o uniforme da D007. Arte de referência: `propostas/06-fonema-unificada/personagens-3d/dupla-opcao-1.png` e a [ficha canônica](universo/02-personagens-canonicos.md). **Tela de lição com fundo limpo**.
- [ ] **D012 — valores**: sem festa junina, carnaval, Halloween, magia, bruxaria, feitiços, poções, amuletos, "sorte", signos, entidades do folclore (Saci, Curupira, Iara-entidade, Boitatá, Mula sem cabeça). Celebrações só neutras ou cristãs.
- [ ] **D010** — camisas esportivas só com cores, sem escudos, nomes ou patrocínios.
- [ ] **D019 §4** — capoeira só como esporte e expressão corporal (sem cantigas religiosas, rituais ou política).
- [ ] Sem marcas ou personagens de terceiros (Disney etc.); emblema do uniforme genérico.

### 1.2 Texto e roteiro
- [ ] **D014 — plataforma**: o FONEMA é **plataforma educativa completa**. Em títulos e aberturas, falar em plataforma, jornada, missões e atividades; "jogo" só para mecânicas específicas.
- [ ] **D011 — Academia** é o nome oficial (não "Roda da Sofia", que pode ser só a seção de conversas mediadas).
- [ ] **Espelho do Som** é o nosso recurso de boca. **"Boquinhas"** é marca registrada de terceiro: só aparece para dizer que não usamos.
- [ ] **D015** — todo vídeo termina numa atividade ("Assiste e Faz").
- [ ] **D013** — a criança é chamada pelo **nome**, nunca por apelido; gênero só masculino, feminino ou prefiro não informar.
- [ ] **D019** — vilão leve é o **Zum-Zum** (distração), não a "Nuvem Bagunceira"; primeiras fases no cotidiano universal.
- [ ] Personagem novo só com ficha na [Bíblia do Universo](universo/02-personagens-canonicos.md); sem nomes repetidos no elenco.

### 1.3 Privacidade e segurança
- [ ] **Nada de segredo** no repositório (chaves de API, tokens, senhas). Use `.env`/`.env.local` (no `.gitignore`).
- [ ] **Nenhum dado de criança real** (nome, voz, foto, escola); dados de exemplo fictícios.
- [ ] Sem chat livre entre crianças (D010, D018); oferta de compra só para o adulto (D001, D002).
- [ ] Itens jurídicos marcados com ⚖️.

### 1.4 Organização
- [ ] Links relativos funcionando (`verificar_links.py` sem erro).
- [ ] Nomes de arquivo conforme [CONVENCOES.md](CONVENCOES.md) (minúsculas, hífen, sem acento ou espaço).
- [ ] Sem arquivo > 20 MB no Git; dados gerados fora do Git.
- [ ] Toda pasta com `README.md`; decisão nova na tabela de [decisoes/README.md](decisoes/README.md).

---

## 2. Como rodar as verificações (`tools/qualidade/`)

```bash
# da raiz do repositório
python3 tools/qualidade/verificar_links.py          # links e imagens relativos quebrados (.md e .html)
python3 tools/qualidade/verificar_arquivos.py       # duplicados (hash), > 20 MB e nomes problemáticos
python3 tools/qualidade/verificar_termos.py         # triagem de termos que contradizem decisões
python3 tools/qualidade/verificar_termos.py --todos --regra D012   # inclui linhas com negação

# checagem técnica
find . -path ./.git -prune -o -path '*/vendor' -prune -o -name '*.js' -print | xargs -n1 node --check
find tools -name '*.py' | xargs -n1 python3 -m py_compile
```

- Todos aceitam `--pasta <caminho>` e `--help`. Saem com código 1 quando acham algo (útil para CI).
- `verificar_termos.py` é **triagem**: cada ocorrência precisa de leitura humana (ex.: "anel" geométrico, "colar no prompt").
- Para abrir os HTML no navegador e pegar erros de console, sirva `docs/` com `python3 -m http.server` e use Playwright (`chromium.launch()`, eventos `pageerror`, `console` e respostas ≥ 400). Não salve capturas no repositório.

---

## 3. Relatórios

### Rodada 1 — 13/11/2026

#### 3.1 O que foi verificado
| Verificação | Alcance | Resultado |
|---|---|---|
| Links e imagens relativos | 965 links em todos os `.md`/`.html` (menos `vendor/`) | **0 quebrados** depois das correções (os 4 restantes apontavam para este arquivo, criado agora) |
| Arquivos duplicados (SHA-256) | todo o repositório | 10 grupos fora de `vendor/`/`fonts/` (ver 3.3) + 14 grupos esperados em `vendor/`/`fonts/` |
| Arquivos > 20 MB | todo o repositório | **0 no Git**. Fora do Git (ignorados): `tools/bibliografia/data/validos_todos.jsonl` 83 MB, `validado_rodada1.jsonl` 64 MB, `validado.jsonl` 51 MB — ok, ficam fora |
| Nomes de arquivo | todo o repositório | **0 com espaço, acento ou caractere especial**. Maiúsculas só em siglas/códigos aceitos (ISO de país, letras de rodada de voz, `P1-`, `R0`) |
| `node --check` | 78 `.js` próprios (sem `vendor/`) | **todos ok** |
| `python3 -m py_compile` | todos os `.py` | **todos ok** |
| HTML no navegador (Playwright) | 105 `.html` de `docs/propostas/` | 103 sem erro; 1 bug corrigido; 2 avisos esperados (ver 3.3) |
| Termos × decisões | `docs/` (menos pesquisa, bibliografia e decisões) | ver 3.2 |
| Revisão visual por amostragem | avatar-3d, série, esporte | ver 3.4 |

#### 3.2 O que foi corrigido
- **Índices e navegação:** `README.md` na raiz, [`docs/INDICE.md`](INDICE.md), [`docs/decisoes/README.md`](decisoes/README.md) (tabela 001–019 + quadro de conflitos), [`propostas/06-fonema-unificada/README.md`](propostas/06-fonema-unificada/README.md), [`CONVENCOES.md`](CONVENCOES.md).
- **Notas "Atualizado pela D0xx"** (sem reescrever decisões): D001 (eventos → D012), D002 (acessórios → D008; linguagem → D014), D005 (Sofia 2D → D007), D006 (nome → D011; vozes → D011/D015), D018 (Nuvem Bagunceira → Zum-Zum, D019). Documento mestre: quadro de atualizações no topo e notas em §1 e §4.6 (Sofia 2D → dupla 3D, tela de lição com fundo limpo).
- **D011 "Roda da Sofia" → "Academia":** `academia/README.md` (título, abertura, sub-portas, §1 marcado como histórico) e as fontes `academia/fonte/*.js` e `_*.html`; `esporte-respeito-ambiente/README.md`.
- **D008 lojinha:** FIVELA → TOUCA, TIARA DE IPÊ → MUDA DE IPÊ, MIÇANGA → BINÓCULO, FAIXA → CANTIL, COLAR DE SEMENTE → CADERNO DE SEMENTES; nova coleção "Kit do Explorador"; moradores, coleções, faixas de preço e `jornada/README.md` ajustados; desenhos SVG novos em `lojinha-emblemas/fontes/base.js` e referências nas telas fonte. Regiões de entrada revistas pela regra das letras.
- **D008 personagens v1:** `personagens/README.md` marcado como **histórico** (Sofia com fivela, pulseira e brincos); comentários dos `sofia.js` esclarecidos (na v2 e na academia o adorno está desligado).
- **D012:** propostas 01, 02, 04 e 05 (festa junina, carnaval, folclore nas temporadas → feira da colheita, Copa das Letras); síntese (bloco B "festas juninas"; blocos C e D: mecânicas com "mágico/feitiço" marcadas para renomear).
- **D014:** títulos "pós-jogo" → "pós-jornada" (ambientes, jornada), "resto do jogo" → "resto da plataforma" (esporte).
- **"Boquinha(s)" como nome do nosso recurso** → "Espelho do Som" na síntese (blocos A, B, C). As demais menções a "Boquinhas" já eram sobre a marca de terceiro (corretas).
- **D019:** notas na jornada e no módulo de esporte (Zum-Zum no lugar da Nuvem Bagunceira; capoeira sem cantigas religiosas).
- **Propostas 00–05** marcadas como históricas (vale a 06, D005).
- **Bug técnico:** `ambientes/fonte/interiores.js` gerava `<path d="MNaN,...">` quando `planks: 0` (padaria). Corrigido no gerador e no `_int-padaria.html`.
- **Scripts novos:** `tools/qualidade/verificar_links.py`, `verificar_arquivos.py`, `verificar_termos.py`.

#### 3.3 Pendências (e por quê)

**Imagens a refazer (não foram alteradas; só listadas):**

| Imagem(ns) | Problema | Regra | Como resolver |
|---|---|---|---|
| `propostas/06-fonema-unificada/academia/academia-{inicio,criancas,familias,professores,aula,certificado}.png` | Logotipo e títulos "Roda da Sofia / Roda das …" | D011 | Regerar com `node academia/fonte/capturar.js` (fontes já corrigidas) |
| `propostas/06-fonema-unificada/lojinha-emblemas/{catalogo-itens,tela-lojinha,tela-colecoes,tela-casa-decorada}.png` | FIVELA, TIARA, MIÇANGA desenhadas | D008 | Regerar com `lojinha-emblemas/fontes/shot.js` (fontes já corrigidas); conferir se a coleção nova cabe na tela de coleções |
| `propostas/06-fonema-unificada/personagens/{sofia-folha-modelo,sofia-expressoes,sofia-poses,tela-espelho-do-som}.png` e as demais desta pasta em que a Sofia aparece | Sofia v1 com fivela de flor, pulseira de miçangas e brincos | D006/D008 | Não usar (pasta histórica); referência atual é a dupla 3D |
| `propostas/06-fonema-unificada/personagens-v2/sofia-uniforme-*.png`, `tela-espelho-do-som-v2.png` | Uniforme anterior à D007 (polo laranja, bermuda) | D007 | Redesenhar com o uniforme D007 (Bíblia, inconsistência nº 1) |
| `propostas/06-fonema-unificada/avatar-3d/utensilios-b.png` | Xilofone com teclas arco-íris e pipa multicolorida (conferido visualmente) | D009 | Refazer como em `utensilios-a.png`. (`roupas-b.png` foi conferida e está ok) |
| `propostas/06-fonema-unificada/avatar-3d/cabelos-a.png` (e similares) | Fundos dos cartões em sequência de tons pastel variados | D009 (atenção) | Avaliar: usar um ou dois tons de fundo |
| `propostas/01-quintal-brasil/tela-lojinha.png` (e `fontes/tela-lojinha.html`) | Item FIVELA | D008 | Proposta histórica: não usar |
| Telas das propostas 01–05 em geral | Anteriores às decisões 006–019 | várias | Históricas: não usar no produto |

**Outras pendências:**
1. **Nomes duplicados de personagens** (decisão do dono; nada foi renomeado): dois **Davis** (professor de música × colega cadeirante), duas **Iaras** (guarda-parque × menina indígena), duas **Ninas** (gata da biblioteca × menina com aparelho auditivo), dois padeiros (**Seu Kenji** × **Seu Zé**), duas bibliotecárias (**Jaci** × **Dona Coruja**), **Lia** cientista × **Vó Lia** × avatar Lia, **Bento** bombeiro × **Tio Bento** barqueiro; **Léo** (colega que provoca) aparece só no módulo de esporte. Ver [Bíblia, §7](universo/02-personagens-canonicos.md). Nina e Léo **não** aparecem como protagonistas em lugar nenhum.
2. **Duplicados por cópia** (mantidos: cada protótipo é autocontido e abre sozinho): `paineis/` × `paineis-v2/` (`base.css`, `comum.js`, `dados-rede.js`, `painel-secretaria.html`); `personagens/fonte` × `personagens-v2/fonte` × `academia/fonte` (`bolota.js`, `corte.js`, `mouth.js`); `01-quintal-brasil/fontes` × `imersivo/fontes` (`chars.js`, `common.css`); `voz/rodada-5-sofia-final/N1-original.mp3` = `voz/rodada-4-sofia-natural/N-sofia-natural-sorridente-1.mp3` (cópia intencional da referência). Unificar só quando houver código de produção.
3. **Avisos esperados no navegador:** `videos/fonte/grade.html` usa `fonte/out/` (saída de render, fora do Git) e `videos/fonte/thumb.html` espera parâmetros na URL. Não são erros do material publicado.
4. **Sintese:** mecânicas "Traço Mágico", "laço mágico", "feitiço com nome", "Palavras Inventadas Mágicas" precisam de nome novo sem magia (D012) quando forem para o produto.
5. **Tamanho do repositório:** `.git` ≈ 530 MB; maiores pastas de arte: ambientes (68 MB), avatar-3d (39 MB), mundo-3d (38 MB, com um vídeo de 12 MB), protótipo (26 MB). Nenhum arquivo > 20 MB. Para o futuro: considerar Git LFS para PNG/MP4.
6. **Uniforme e cores** (HEX do azul-claro, cores do Tales e do Bolota) e **idade da Sofia** (8 × 9–10): decisões do dono (Bíblia §7).

#### 3.4 Problemas vistos nas pastas em produção por outros agentes (só leitura)
- `propostas/06-fonema-unificada/jogo-completo/`: ainda usa **"Nuvem Bagunceira"** (`README.md` l. 175 e 218; `02-regioes-R0-R2.md` l. 16 e 91), que a **D019** trocou pelo **Zum-Zum**. O próprio nome da pasta (`jogo-completo`) contraria a linguagem da **D014** (o título interno já diz "Jornada completa da plataforma"); renomear para `jornada-completa/` exigiria atualizar links, então fica para quando a pasta estiver estável. Links internos ok.
- `propostas/06-fonema-unificada/prototipo-jogavel/`: JS passa no `node --check` e o `index.html` abriu sem erros de console; 26 MB por causa das capturas (ok, < 20 MB por arquivo).
- `universo/`: links ok; nenhuma contradição encontrada. A lista de inconsistências (§7 do arquivo 02) pode marcar como **resolvidos** os itens 12 (adornos da lojinha) e 13 ("Roda da Sofia"), corrigidos nesta rodada; e o item 4 (Sofia 2D × 3D) já tem nota na D005 e no documento mestre.
