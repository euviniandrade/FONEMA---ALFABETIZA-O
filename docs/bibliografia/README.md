# Bibliografia acadêmica validada — FONEMA

**16847 trabalhos validados** de **56 países**, sobre método fônico, aquisição da leitura e neurociência da aprendizagem.

Arquivos: [`bibliografia_fonema.xlsx`](bibliografia_fonema.xlsx) (uma aba por país, com filtros e links), [`bibliografia_fonema.csv`](bibliografia_fonema.csv), listas por país em [`paises/`](paises/) e a **base completa validada** (todos os aprovados no filtro, sem o corte de 500) em [`base_completa_validada.csv.gz`](base_completa_validada.csv.gz).

## Como foi feito (3 etapas)

1. **Coleta** (`tools/bibliografia/coletar.py`): PubMed (filtro pelo país da afiliação dos autores) e Crossref (afiliação + consultas em inglês, português e espanhol) em 8 eixos temáticos, por país.
2. **Validação e 1º filtro**: registro existe na base (PMID/DOI); país confirmado no texto de afiliação; exclusão de retratações, erratas, comentários, cartas e editoriais; relevância temática por palavras-chave no título/resumo; deduplicação; classificação por nível de evidência; corte de até 500 por país (garantindo os 40 melhores de cada eixo).
3. **Entrega** (`tools/bibliografia/exportar.py`): planilha, CSV e listas.

**Limites honestos:** a coleta usa bases indexadas (forte em saúde, psicologia e neurociência; mais fraca em livros e literatura cinzenta de educação). Países com pouca produção indexada nesses temas ficam abaixo de 500 — o número mostra a produção real encontrada, sem enchimento. O filtro é automático (1º filtro); a curadoria final das obras-chave está nos relatórios temáticos em `docs/pesquisa/`.

## Por país

| País | Selecionados | Válidos únicos | A | B | C | D |
|---|---|---|---|---|---|---|
| [Brasil](paises/BR.md) | 500 | 876 | 38 | 26 | 17 | 419 |
| [Estados Unidos](paises/US.md) | 500 | 2616 | 50 | 218 | 129 | 103 |
| [Reino Unido](paises/GB.md) | 500 | 1926 | 75 | 187 | 92 | 146 |
| [Canadá](paises/CA.md) | 500 | 1687 | 40 | 122 | 80 | 258 |
| [Austrália](paises/AU.md) | 500 | 1586 | 90 | 158 | 80 | 172 |
| [França](paises/FR.md) | 500 | 936 | 20 | 51 | 34 | 395 |
| [Bélgica](paises/BE.md) | 500 | 657 | 23 | 38 | 17 | 422 |
| [Suíça](paises/CH.md) | 500 | 582 | 7 | 51 | 25 | 417 |
| [Alemanha](paises/DE.md) | 500 | 1221 | 32 | 88 | 37 | 343 |
| [Países Baixos](paises/NL.md) | 500 | 1241 | 42 | 104 | 30 | 324 |
| [Itália](paises/IT.md) | 500 | 1292 | 71 | 68 | 51 | 310 |
| [Espanha](paises/ES.md) | 500 | 1120 | 79 | 61 | 22 | 338 |
| [Finlândia](paises/FI.md) | 500 | 580 | 14 | 30 | 14 | 442 |
| [Suécia](paises/SE.md) | 500 | 738 | 12 | 53 | 19 | 416 |
| [Noruega](paises/NO.md) | 500 | 534 | 22 | 33 | 9 | 436 |
| [Turquia](paises/TR.md) | 500 | 537 | 13 | 23 | 8 | 456 |
| [Israel](paises/IL.md) | 500 | 694 | 9 | 30 | 26 | 435 |
| [China](paises/CN.md) | 500 | 1552 | 82 | 92 | 20 | 306 |
| [Hong Kong](paises/HK.md) | 500 | 701 | 33 | 37 | 11 | 419 |
| [Japão](paises/JP.md) | 442 | 442 | 5 | 17 | 19 | 401 |
| [Irã](paises/IR.md) | 428 | 428 | 16 | 63 | 5 | 344 |
| [Portugal](paises/PT.md) | 420 | 420 | 28 | 22 | 12 | 358 |
| [Grécia](paises/GR.md) | 415 | 415 | 12 | 3 | 26 | 374 |
| [Coreia do Sul](paises/KR.md) | 357 | 357 | 18 | 13 | 5 | 321 |
| [Índia](paises/IN.md) | 354 | 354 | 11 | 15 | 8 | 320 |
| [Taiwan](paises/TW.md) | 351 | 351 | 4 | 17 | 5 | 325 |
| [México](paises/MX.md) | 307 | 307 | 6 | 18 | 9 | 274 |
| [Nova Zelândia](paises/NZ.md) | 301 | 301 | 7 | 22 | 12 | 260 |
| [Dinamarca](paises/DK.md) | 291 | 291 | 17 | 28 | 8 | 238 |
| [Irlanda](paises/IE.md) | 280 | 280 | 23 | 15 | 11 | 231 |
| [Malásia](paises/MY.md) | 280 | 280 | 15 | 4 | 17 | 244 |
| [Chile](paises/CL.md) | 272 | 272 | 16 | 10 | 11 | 235 |
| [África do Sul](paises/ZA.md) | 265 | 265 | 8 | 13 | 6 | 238 |
| [Filipinas](paises/PH.md) | 261 | 261 | 1 | 0 | 1 | 259 |
| [Polônia](paises/PL.md) | 251 | 251 | 5 | 15 | 7 | 224 |
| [Indonésia](paises/ID.md) | 243 | 243 | 6 | 4 | 14 | 219 |
| [Áustria](paises/AT.md) | 226 | 226 | 10 | 9 | 8 | 199 |
| [Singapura](paises/SG.md) | 205 | 205 | 12 | 12 | 7 | 174 |
| [Hungria](paises/HU.md) | 162 | 162 | 9 | 1 | 5 | 147 |
| [Arábia Saudita](paises/SA.md) | 158 | 158 | 13 | 5 | 5 | 135 |
| [Romênia](paises/RO.md) | 145 | 145 | 7 | 5 | 4 | 129 |
| [Colômbia](paises/CO.md) | 132 | 132 | 11 | 6 | 3 | 112 |
| [Tailândia](paises/TH.md) | 116 | 116 | 4 | 7 | 4 | 101 |
| [Argentina](paises/AR.md) | 110 | 110 | 5 | 4 | 5 | 96 |
| [Rússia](paises/RU.md) | 104 | 104 | 2 | 1 | 7 | 94 |
| [Egito](paises/EG.md) | 93 | 93 | 2 | 6 | 2 | 83 |
| [Nigéria](paises/NG.md) | 80 | 80 | 0 | 3 | 3 | 74 |
| [Quênia](paises/KE.md) | 57 | 57 | 1 | 3 | 1 | 52 |
| [Islândia](paises/IS.md) | 54 | 54 | 5 | 2 | 0 | 47 |
| [Gana](paises/GH.md) | 52 | 52 | 0 | 2 | 3 | 47 |
| [Peru](paises/PE.md) | 37 | 37 | 4 | 1 | 1 | 31 |
| [Uruguai](paises/UY.md) | 36 | 36 | 2 | 1 | 2 | 31 |
| [Tchéquia](paises/CZ.md) | 34 | 34 | 0 | 2 | 1 | 31 |
| [Vietnã](paises/VN.md) | 23 | 23 | 0 | 0 | 6 | 17 |
| [Moçambique](paises/MZ.md) | 3 | 3 | 0 | 0 | 0 | 3 |
| [Angola](paises/AO.md) | 2 | 2 | 0 | 0 | 0 | 2 |

## Por eixo temático

| Eixo | Trabalhos |
|---|---|
| Método fônico e aquisição da leitura | 2253 |
| Dislexia e dificuldades de leitura | 1657 |
| Neurociência da leitura | 926 |
| Neurociência da aprendizagem (memória, atenção, funções executivas) | 4029 |
| Motivação, recompensa, dopamina e engajamento | 1505 |
| Fala, fonologia, articulação e percepção da fala | 2351 |
| Tecnologia, jogos digitais e reconhecimento de fala para alfabetização | 763 |
| Neurodivergência (TEA, TDAH, Down, TDL) e leitura | 853 |
| Pensamento computacional na infância | 270 |
| Competências socioemocionais e inteligência emocional | 3158 |
| Raciocínio lógico e matemática inicial | 780 |
| Educação financeira infantil | 204 |
| Aprendizagem profunda, compreensão e transferência | 1190 |

## Por nível de evidência

| Nível | Trabalhos |
|---|---|
| A — meta-análise / revisão sistemática | 1037 |
| B — ensaio randomizado/controlado | 1819 |
| C — revisão narrativa | 964 |
| D — estudo primário | 13027 |

## Rejeitados no 1º filtro

| Motivo | Registros |
|---|---|
| fora do tema | 163287 |
| não é sobre crianças/escola | 38284 |
| país não confirmado na afiliação | 5710 |
| tipo excluído/retratado | 1241 |
