# FONEMA

**Plataforma educativa completa de alfabetização pelo método fônico** para crianças brasileiras de 4 a 8 anos, do zero à leitura fluente com compreensão, numa jornada de cerca de 2 anos ([Decisão 014](docs/decisoes/014-plataforma-educativa-completa.md)).

- **Para a criança:** jornada com a dupla **Sofia e Tales** (e o tatu-bola **Bolota**) por um arquipélago de 11 regiões, com missões, atividades, vila, lojinha de moedinhas e o **Espelho do Som**, que mostra a boca fazendo cada som.
- **Para acompanhar:** termômetro de leitura de 0 a 10 e painéis da família, do professor, da escola e da secretaria, com WhatsApp.
- **Para formar:** a **Academia** para crianças, famílias e professores e a formação integral em 6 competências.
- **Base:** ciência da leitura e neurociência da aprendizagem, privacidade (LGPD art. 14, ECA Digital) e valores cristãos apresentados de forma sutil ([D012](docs/decisoes/012-valores-cristaos.md)).
- **Futuro:** um **universo infantil educativo** (série, livros, canais) e novas áreas e idiomas ([D016](docs/decisoes/016-universo-infantil.md), [D017](docs/decisoes/017-roteiro-de-expansao-educativa.md)).

> Estado atual: **pesquisa, especificação, direção de arte e protótipos**. O código de produção ainda não começou.

## Por onde começar a ler
1. **[Decisões do dono](docs/decisoes/README.md)**: a fonte de verdade (001–019). Em caso de conflito, vale a decisão mais recente.
2. **[Bíblia do Universo](docs/universo/README.md)**: ideia, missão, personagens canônicos, mundo, estrutura da plataforma e expansão.
3. **[Proposta 06 · FONEMA Unificada](docs/propostas/06-fonema-unificada/README.md)**: a proposta que vale, com todas as frentes.
4. **[Jornada completa, cena a cena](docs/propostas/06-fonema-unificada/jogo-completo/README.md)**: como a criança, a família e a escola vivem a plataforma.
5. **[Protótipo jogável](docs/propostas/06-fonema-unificada/prototipo-jogavel/README.md)**: a 1ª missão "Meu Nome" no navegador.
6. **[Documento mestre](docs/sintese/00-documento-mestre.md)**: a especificação consolidada a partir dos 43 relatórios de pesquisa.

## Como o repositório está organizado

```
docs/
  decisoes/       decisões do dono (fonte de verdade) + README com tabela e conflitos
  universo/       Bíblia do Universo (cânone de personagens, mundo e marca)
  propostas/      00 comparativo, 01–05 históricas, 06-fonema-unificada (a que vale)
  sintese/        documento mestre + blocos A–D da síntese da pesquisa
  pesquisa/       43 relatórios de pesquisa + validações (registro)
  bibliografia/   bibliografia validada (16.847 trabalhos, 56 países)
  INDICE.md       índice navegável de tudo
  CONVENCOES.md   como nomear, onde guardar, commits, segredos
  QUALIDADE.md    checklist de regras, verificações e relatórios
tools/
  bibliografia/   coleta e exportação da bibliografia (dados fora do Git)
  qualidade/      verificação de links, arquivos e termos
```

Índice completo: **[docs/INDICE.md](docs/INDICE.md)**.

## Como abrir os protótipos
Os protótipos HTML usam módulos ES e não abrem direto do disco (`file://`). Sirva a pasta com um servidor estático:

```bash
cd docs/propostas/06-fonema-unificada
python3 -m http.server 8000
# http://localhost:8000/prototipo-jogavel/   ·   http://localhost:8000/mundo-3d/
```

## Qualidade
Antes de commitar, rode as verificações (detalhes em [docs/QUALIDADE.md](docs/QUALIDADE.md)):

```bash
python3 tools/qualidade/verificar_links.py
python3 tools/qualidade/verificar_arquivos.py
python3 tools/qualidade/verificar_termos.py
```

**Nunca** coloque chaves de API, senhas ou dados de crianças reais no repositório ([CONVENCOES §6](docs/CONVENCOES.md)).
