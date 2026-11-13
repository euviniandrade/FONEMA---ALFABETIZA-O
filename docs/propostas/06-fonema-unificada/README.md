# Proposta 06 · FONEMA Unificada (a proposta que vale)

> **O que é.** A [Decisão 005](../../decisoes/005-proposta-unificada.md) juntou o melhor das propostas 01–05 numa só. Esta pasta reúne todas as **frentes** dessa proposta: jornada, mundo 3D, personagens, ambientes, Academia, lojinha, painéis, vídeos, voz, WhatsApp, arquitetura e o protótipo jogável.
> **Regra.** Quando algo aqui conflitar com uma decisão do dono, **vale a decisão** ([índice de decisões](../../decisoes/README.md)). O cânone de personagens, mundo e valores é a [Bíblia do Universo](../../universo/README.md).

## Por onde começar
1. [`jogo-completo/`](jogo-completo/README.md): a **jornada completa da plataforma, cena a cena** (primeira experiência, regiões R0–R10, imersão, família e escola).
2. [`prototipo-jogavel/`](prototipo-jogavel/README.md): a primeira missão **"Meu Nome"**, jogável no navegador.
3. [`jornada/`](jornada/README.md): o mapa de 2 anos com a neurociência embutida.
4. [`serie-sofia-e-tales/`](serie-sofia-e-tales/README.md): bíblia de roteiro e imagem da dupla.

## Frentes (pastas)

| Pasta | O que tem | Estado |
|---|---|---|
| [`jogo-completo/`](jogo-completo/README.md) | Jornada da plataforma cena a cena (6 capítulos) | Em produção |
| [`prototipo-jogavel/`](prototipo-jogavel/README.md) | Protótipo HTML/JS da missão "Meu Nome", com testes | Em produção |
| [`jornada/`](jornada/README.md) | Mapa de 2 anos, anatomia da sessão, semana típica, grafo de habilidades | Referência |
| [`serie-sofia-e-tales/`](serie-sofia-e-tales/README.md) | Bíblia da série (episódios, cenas, prompts de imagem) | Referência |
| [`personagens-3d/`](personagens-3d/README.md) | Dupla Sofia e Tales em 3D alegre (arte oficial da D007) | **Referência visual oficial** |
| [`personagens-v2/`](personagens-v2/README.md) | Sofia de uniforme sem adornos, elenco, animais, zoom na boca (vetorial) | Referência (uniforme anterior à D007) |
| [`personagens/`](personagens/README.md) | Sofia e Bolota v1 (vetorial) | **Histórico**: tem adornos, não usar |
| [`avatar-3d/`](avatar-3d/README.md) | Banco de peças do avatar da criança e telas do criador | Referência |
| [`ambientes/`](ambientes/README.md) | 11 regiões + interiores para desbravar | Referência |
| [`mundo-3d/`](mundo-3d/README.md) | Protótipo Three.js do arquipélago e da vila navegáveis | Protótipo |
| [`imersivo/`](imersivo/README.md) | Experiências "4D/5D" (AR, háptico, clima) | Proposta |
| [`tecnologia-grafica/`](tecnologia-grafica/README.md) | Radar de tecnologia gráfica | Referência |
| [`academia/`](academia/README.md) | **Academia** (D011) para crianças, famílias e professores | Referência (PNGs a regerar) |
| [`videos/`](videos/README.md) | Biblioteca de vídeos curtos, roteiros e amostras | Referência |
| [`voz/`](voz/README.md) | Rodadas de voz no ElevenLabs ("Sofia — FONEMA", "Tales — FONEMA") | Decidido (D011) |
| [`lojinha-emblemas/`](lojinha-emblemas/README.md) | Lojinha com propósito, coleções e emblemas | Referência (PNGs a regerar) |
| [`esporte-respeito-ambiente/`](esporte-respeito-ambiente/README.md) | Esporte, antibullying e meio ambiente (D010) | Referência |
| [`paineis/`](paineis/README.md) | Painéis v1 (criança, família, professor, escola, secretaria) | Versão anterior (ver v2) |
| [`paineis-v2/`](paineis-v2/README.md) | Painéis v2 com dados fictícios coerentes | Referência |
| [`whatsapp/`](whatsapp/README.md) | Integração com WhatsApp (famílias e escola) | Referência |
| [`arquitetura-infra/`](arquitetura-infra/README.md) | Arquitetura, infraestrutura, segurança e privacidade | Referência v1 |

## Como abrir os protótipos HTML
Os protótipos com módulos ES (ex.: `mundo-3d/`) não abrem em `file://`. Sirva a pasta com um servidor estático:

```bash
cd docs/propostas/06-fonema-unificada
python3 -m http.server 8000
# abra http://localhost:8000/mundo-3d/  ou  http://localhost:8000/prototipo-jogavel/
```

Qualidade, pendências e imagens a refazer: [`docs/QUALIDADE.md`](../../QUALIDADE.md).
