# 03 — Pesquisa técnica: GitHub, open source e stack

> Frente: GitHub / open source / stack técnica
> Data da coleta: 13/11/2026
> Método: busca na API do GitHub (`search/repositories`) para estrelas, licença e data do último push, mais buscas na web para preços, idiomas suportados e licenças de modelos.
> As estrelas (⭐) são as que o GitHub mostrava na data da coleta, arredondadas. "NOASSERTION/Other" quer dizer que o GitHub não reconheceu a licença automaticamente; nesses casos a licença real foi conferida na web ou fica marcada como **a conferir**.
> Itens marcados com **[não verificado]** não puderam ser confirmados em fonte primária. O Hugging Face e o learn.microsoft.com estavam bloqueados na rede desta sessão, então os dados de modelos HF e de documentação Azure vêm de resultados de busca.

---

## 1. Resumo executivo

1. **Dá para construir tudo com componentes maduros.** Jogos 2D web (PixiJS, Phaser), animação de personagem (Rive, Lottie), app + web com uma só base de código (Expo/React Native + Next.js em monorepo Turborepo) e backend com login e perfis (Supabase) são peças consolidadas, com milhares de estrelas e licenças permissivas (MIT/Apache).
2. **Voz da Sofia:** para uso comercial, a escolha segura é **TTS em nuvem** (Azure Neural pt-BR: Francisca, Thalita, Antonio etc.), que também devolve **visemas** para o lip-sync. Também servem Amazon Polly (Camila/Vitória/Thiago, com "speech marks" de visema) e Google. Quase todo o texto da Sofia é fixo, então o melhor é **pré-gerar os áudios** e servir como arquivo; assim o custo por aluno fica perto de zero. Entre os modelos abertos, **Kokoro-82M (Apache-2.0, 3 vozes pt-BR)** é comercialmente utilizável. **XTTS-v2 (CPML)** e **F5-TTS pt-BR (CC-BY-NC)** são **não comerciais**. Piper exige checar a licença de cada voz.
3. **Avaliação de pronúncia em pt-BR:** **o Azure Pronunciation Assessment suporta pt-BR** (consta na lista de cerca de 33 locales) e dá nota por palavra, sílaba e fonema. Mas as respostas fonéticas foram desenhadas para inglês, e não há validação pública com voz infantil brasileira. O SpeechSuper **não** lista português. A rota aberta usa **wav2vec2/XLS-R reconhecedor de fonemas** (ex.: `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, Apache-2.0) mais **alinhamento forçado** (Montreal Forced Aligner com `portuguese_mfa` + dicionário `portuguese_brazil_mfa`), com uma pontuação tipo GOP. Exige pesquisa e um **corpus próprio de fala infantil** (não achamos dataset aberto de crianças brasileiras para ASR).
4. **"Corrigir a boquinha":** a abordagem realista é em **camadas**. (a) O áudio verifica *se* o som saiu certo, com tarefas fechadas (escolher entre poucas alternativas) e não transcrição livre. (b) A câmera, via **MediaPipe Face Landmarker** (52 blendshapes estilo ARKit: `jawOpen`, `mouthClose`, `mouthPucker`, `mouthFunnel`…), verifica *a forma visível* da boca, o suficiente para "abra mais", "feche os lábios" e "faça biquinho". A câmera **não vê a língua**, então /t d n l r s/ não são corrigíveis visualmente. Tudo deve rodar **no dispositivo**, sem enviar vídeo (LGPD art. 14, dados de crianças).
5. **Custo estimado por aluno ativo:** TTS pré-gerado custa centavos por mês. Avaliação de pronúncia em nuvem (Azure: cerca de US$ 1/h de STT em tempo real + cerca de US$ 0,30/h do add-on) fica em **cerca de US$ 1–1,5/aluno/mês**, supondo cerca de 1 h de áudio de tentativas por mês. Rodar o modelo no aparelho zera esse custo variável.

---

## 2. Engines e bibliotecas de jogos, animação e som

| Nome | URL | ⭐ | Licença | Uso na plataforma |
|---|---|---|---|---|
| Godot | https://github.com/godotengine/godot | ~120k | MIT | Engine completa 2D/3D com export web (WASM) e mobile. Boa se os jogos forem um produto separado. O export web é pesado para um app educacional leve. |
| PixiJS | https://github.com/pixijs/pixijs | ~48,7k | MIT | Renderizador 2D WebGL/WebGPU rápido. **Recomendado** como base dos minijogos (arrastar letras, cartas, sílabas). |
| Phaser | https://github.com/phaserjs/phaser | ~40,7k | MIT | Framework de jogo 2D completo (cenas, física, input, áudio). **Alternativa principal** ao PixiJS se a equipe quiser engine pronta. |
| Cocos Engine | https://github.com/cocos/cocos-engine | ~9,9k | Licença própria Cocos (a conferir) | Engine 2D/3D com editor, popular em jogos casuais mobile. Exige editor Cocos Creator. |
| Excalibur | https://github.com/excaliburjs/Excalibur | ~2,4k | BSD-2-Clause | Engine 2D em TypeScript, bem tipada. Opção menor. |
| KAPLAY (ex-Kaboom) | https://github.com/kaplayjs/kaplay | ~1,8k | MIT | Prototipagem rápida de minijogos. Bom para protótipos, menos para produção. |
| react-native-game-engine | https://github.com/bberak/react-native-game-engine | ~3,1k | MIT | Loop de jogo nativo em RN. **Sem push desde 12/2024**, então é arriscado. |
| Flame (Flutter) | https://github.com/flame-engine/flame | ~10,8k | MIT | Engine 2D para Flutter, caso a stack escolhida seja Flutter. |
| react-three-fiber | https://github.com/pmndrs/react-three-fiber | ~33,7k | MIT | 3D em React, caso a Sofia seja 3D (avatar com blendshapes). |
| React Native Skia | https://github.com/Shopify/react-native-skia | (não capturado) | MIT | Desenho 2D de alta performance no RN (traçado de letras). |
| Reanimated | https://github.com/software-mansion/react-native-reanimated | ~11k | MIT | Animações fluidas de UI no app. |
| Gesture Handler | https://github.com/software-mansion/react-native-gesture-handler | ~6,8k | MIT | Arrastar e soltar, traçado com o dedo. |
| **Rive** (runtime) | https://github.com/rive-app/rive-runtime | ~1,3k | MIT | Runtime C++ do Rive. **Recomendado para a Sofia**: state machines (idle, falando, comemorando) e input de "boca" controlável por código para lip-sync. |
| Rive Web/WASM | https://github.com/rive-app/rive-wasm | ~1k | MIT | Runtime para web. |
| Rive React | https://github.com/rive-app/rive-react | ~1,2k | MIT | Componente React (Next.js). |
| Rive React Native | https://github.com/rive-app/rive-react-native | ~0,8k | MIT | Componente RN (Expo com dev build). |
| Rive Flutter | https://github.com/rive-app/rive-flutter | ~1,5k | MIT | Se a stack for Flutter. *Obs.: o editor Rive é SaaS pago; os runtimes são MIT.* |
| Lottie Web | https://github.com/airbnb/lottie-web | ~32,4k | MIT | Animações After Effects exportadas (recompensas, transições). Último push 09/2025. |
| lottie-react-native | https://github.com/lottie-react-native/lottie-react-native | ~17,2k | Apache-2.0 | Lottie no app. |
| dotLottie Web | https://github.com/LottieFiles/dotlottie-web | ~0,9k | MIT | Player .lottie moderno (com state machines). |
| Spine runtimes | https://github.com/EsotericSoftware/spine-runtimes | ~5,4k | Spine Runtimes License | Animação esquelética 2D profissional. **O uso dos runtimes exige licença do editor Spine.** Opção para animador que já domina Spine. |
| Howler.js | https://github.com/goldfire/howler.js | ~25,4k | MIT | **Recomendado para áudio web**: sprites de áudio (todos os fonemas num arquivo), cache, desbloqueio de áudio no iOS. |
| Tone.js | https://github.com/Tonejs/Tone.js | ~14,9k | MIT | Síntese e música procedural (efeitos, jingles dinâmicos). Opcional. |

**Recomendação:** minijogos em **PixiJS** (ou Phaser) escritos em TypeScript num pacote compartilhado. Na web rodam direto. No app rodam via **Expo DOM components / react-native-webview** ([react-native-webview](https://github.com/react-native-webview/react-native-webview), ~7,2k ⭐, MIT), o que garante um só código de jogo para web e mobile. A Sofia fica em **Rive**, as celebrações em **Lottie** e o áudio em **Howler.js**.

---

## 3. Voz neural (TTS) em pt-BR

### 3.1 Serviços em nuvem

| Serviço | Vozes pt-BR (verificadas) | Visemas / marcas | Preço de referência | Observações |
|---|---|---|---|---|
| **Azure AI Speech (Neural)** | FranciscaNeural (desde 03/2020, com estilos como *cheerful* e *calm*), AntonioNeural, ThalitaNeural, ThalitaMultilingualNeural, BrendaNeural, DonatoNeural, FabioNeural, YaraNeural e outras (cerca de 20) | **Evento de viseme ID** durante a síntese. Blend shapes (55 posições, 60 fps) são documentados com foco em en-US/zh-CN. SVG só en-US. Suporte a SSML e `<phoneme>` | ~US$ 15 por 1M caracteres (neural). Free tier de 0,5M caracteres/mês | Melhor opção pela combinação voz + visemas + avaliação de pronúncia no mesmo fornecedor. **Atenção:** a Microsoft não fixa versão das vozes neurais e o timbre pode mudar sem aviso. Isso reforça a ideia de pré-gerar e versionar os áudios. |
| **Amazon Polly (Neural)** | Camila (F), Vitória (F, neural desde 01/2023), Thiago (M, neural desde 05/2023). Ricardo é só voz padrão | **Speech Marks**: sentence, word, **viseme**, SSML | US$ 16 por 1M caracteres (neural; o mesmo valor para speech marks). Free tier de 1M caracteres/mês por 12 meses | Lip-sync exige uma segunda chamada para obter os speech marks. |
| **Google Cloud TTS** | Há vozes pt-BR (lista por tier **[não verificado]**) | Sem visemas nativos (usa timepoints via SSML `<mark>`) | Standard/WaveNet ~US$ 4/1M; Neural2 ~US$ 16/1M (legado); **Chirp 3 HD ~US$ 30/1M** | Boa qualidade, mas sem visema. |
| **ElevenLabs** | Modelos multilíngues incluem português | Timestamps por caractere (sem visemas prontos **[não verificado]**) | Flash/Turbo ~US$ 0,05/1k caracteres (= US$ 50/1M); Multilingual ~US$ 0,10/1k (= US$ 100/1M) | A voz mais expressiva. Viável para **pré-gerar** falas da Sofia com voz exclusiva (voice design). Caro para geração dinâmica em escala. |
| **edge-tts** | https://github.com/rany2/edge-tts (~12,5k ⭐, licença LGPL/GPL **a conferir**) | Word boundaries | "Grátis" | Usa o endpoint do Read Aloud do Edge. **Não usar em produção comercial**: não é API oficial e pode violar os termos. Serve só para protótipos. |

### 3.2 Modelos abertos (self-hosted / on-device)

| Nome | URL | ⭐ | Licença (código / modelo) | pt-BR? | Uso comercial? |
|---|---|---|---|---|---|
| Piper (original, arquivado) | https://github.com/rhasspy/piper | ~11,3k | MIT | Vozes `pt_BR`: **faber** (dataset CC0, fine-tune da voz lessac), **edresson**, **jeff**, entre outras | O repositório de vozes é MIT, mas **cada voz herda a licença do dataset**. Faber (CC0) parece OK. Para as demais, conferir o MODEL_CARD. |
| Piper (continuação OHF) | https://github.com/OHF-Voice/piper1-gpl | ~6,3k | **GPL-3.0** | Mesmas vozes | A nova versão é GPL (por usar espeak-ng). Para o produto, preferir rodar como serviço separado. |
| eSpeak NG | https://github.com/espeak-ng/espeak-ng | ~7k | GPL-3.0 | Sim (fonemizador) | Usado como fonemizador (texto → IPA). Útil também para gerar a sequência de fonemas *esperada* na avaliação. GPL: isolar como serviço. |
| Kokoro-82M | https://github.com/hexgrad/kokoro | ~10,1k | Apache-2.0 (código e pesos) | **Sim**: `pf_dora` (F), `pm_alex` (M), `pm_santa` (M), lang_code `p` | **Sim.** Leve (82M parâmetros), roda em CPU e até no browser. Qualidade pt-BR inferior à do Azure (avaliação de terceiros dá "C" para pf_dora). |
| HeadTTS (Kokoro + visemas) | https://github.com/met4citizen/HeadTTS | ~184 | MIT | Via Kokoro | Gera áudio **com timestamps e visemas** para lip-sync, no navegador (WebGPU) ou Node. Muito relevante para a Sofia. |
| Coqui TTS | https://github.com/coqui-ai/TTS | ~46,2k | MPL-2.0 (código) | XTTS-v2 fala `pt` | Empresa encerrada; repositório sem push desde 08/2024. **Pesos do XTTS-v2 sob CPML = não comercial.** Não usar no produto. |
| F5-TTS | https://github.com/SWivid/F5-TTS | ~15,6k | MIT (código); pesos oficiais CC-BY-NC | Fine-tune `firstpixel/F5-TTS-pt-br` (~130 h, CC-BY-NC-4.0) | **Não comercial.** |
| Chatterbox | https://github.com/resemble-ai/chatterbox | ~27,8k | MIT | Há fine-tune comunitário pt (HF `gorack/Chatterbox-TTS-Portuguese`, **[não verificado]**) | Possível; avaliar a qualidade. |
| Fish Speech | https://github.com/fishaudio/fish-speech | ~33,7k | Licença própria (pesos com restrição; **a conferir**) | Multilíngue | A conferir. |
| MeloTTS | https://github.com/myshell-ai/MeloTTS | ~7,7k | MIT | Sem pt-BR oficial **[não verificado]** | — |
| ChatTTS | https://github.com/2noise/ChatTTS | ~40k | AGPL-3.0 | Foco zh/en | Não recomendado (AGPL). |
| sherpa-onnx | https://github.com/k2-fsa/sherpa-onnx | ~15,9k | Apache-2.0 | Roda Piper/Kokoro/VITS e também ASR **offline em Android/iOS/WASM** | **Peça-chave para on-device**: TTS, ASR e VAD num só runtime. |

**Recomendação de voz:** a Sofia deve ter **uma voz única e consistente**. Gerar todas as falas roteirizadas (instruções, nomes de letras, sons de fonemas, elogios) com **Azure Neural** (ou ElevenLabs, se a voz exclusiva for prioridade), guardando junto **a timeline de visemas** num JSON. Versionar esses assets no CDN. Para falas dinâmicas (nome da criança, frases geradas), usar Azure em tempo real, com fallback no Kokoro local.

> **Fonemas isolados** ("o som do M: mmmm") **não devem ser sintetizados**. TTS pronuncia mal fonemas isolados e sons prolongados. Grave os sons de fonemas e as "boquinhas" com **fonoaudióloga/locutora humana**, e use TTS para o restante.

---

## 4. Reconhecimento de fala e avaliação de pronúncia

### 4.1 ASR (fala → texto)

| Nome | URL | ⭐ | Licença | pt-BR | Roda no navegador / celular? | Uso |
|---|---|---|---|---|---|---|
| OpenAI Whisper | https://github.com/openai/whisper | ~112,6k | MIT | Sim (multilíngue) | Não direto | Referência de qualidade. Para o nosso caso tem um problema: **"corrige" a fala para palavras reais** (forte modelo de linguagem), o que **esconde erros de pronúncia**. |
| faster-whisper | https://github.com/SYSTRAN/faster-whisper | ~26,7k | MIT | Sim | Servidor (CTranslate2) | Transcrição barata em servidor GPU/CPU. |
| whisper.cpp | https://github.com/ggml-org/whisper.cpp | ~55,1k | MIT | Sim | **Sim**: exemplo `whisper.wasm` no navegador (exige SIMD; áudio até 120 s), além de iOS/Android nativos | On-device. Modelos tiny/base cabem no celular. |
| Transformers.js | https://github.com/huggingface/transformers.js | ~16,4k | Apache-2.0 | Roda Whisper **e wav2vec2** | **Sim** (WASM/WebGPU) | **Importante:** permite rodar o reconhecedor de **fonemas** wav2vec2 no browser. |
| whisper-web | https://github.com/xenova/whisper-web | ~3,3k | (sem licença declarada) | Sim | Demo no browser | Referência de implementação. |
| distil-whisper | https://github.com/huggingface/distil-whisper | ~4,1k | MIT | Foco en | — | Pouco útil para pt. |
| Vosk API | https://github.com/alphacep/vosk-api | ~15,3k | Apache-2.0 | `vosk-model-small-pt-0.3` (31 MB, Apache-2.0; WER 32,6% Common Voice / 68,9% CORAA) e `vosk-model-pt-fb-v0.1.1` (1,6 GB, **GPL-3.0**, FalaBrazil; WER 27,7% / 54,3%) | **Sim** (Android/iOS; há builds WASM de terceiros) | **Reconhecimento com gramática restrita**: dá para limitar o vocabulário à palavra-alvo e a distratores. Ótimo para "a criança disse BOLA ou BOCA?". |
| Vosk Server | https://github.com/alphacep/vosk-server | ~1,3k | Apache-2.0 | — | Servidor | — |
| Moonshine | https://github.com/moonshine-ai/moonshine | ~11,5k | licença a conferir | Foco en **[não verificado para pt]** | Edge | Monitorar. |
| Kaldi | https://github.com/kaldi-asr/kaldi | ~15,5k | Apache-2.0 | Receitas | Servidor | Base clássica para GOP (ver 4.3). Push mais recente em 09/2025, pouco ativo. |
| fairseq | https://github.com/facebookresearch/fairseq | ~32,2k | MIT | — | — | Origem do wav2vec2/XLS-R. |
| wav2vec4bp | https://github.com/lucasgris/wav2vec4bp | ~37 | MIT | **Recursos wav2vec2 para PT-BR** | — | Referência brasileira de fine-tune. |
| Silero VAD | https://github.com/snakers4/silero-vad | ~10,7k | MIT | Independe de idioma | Sim (ONNX) | Detectar início e fim da fala da criança, cortar silêncio e economizar ASR. |
| @ricky0123/vad | https://github.com/ricky0123/vad | ~2,1k | licença a conferir (ISC segundo o npm **[não verificado]**) | — | **Browser** | VAD Silero pronto para web. |
| Azure Speech SDK (JS) | https://github.com/microsoft/cognitive-services-speech-sdk-js | ~0,3k | MIT (pacote) | Sim | Browser/RN | SDK para STT, TTS com visemas e Pronunciation Assessment. |
| Azure samples | https://github.com/Azure-Samples/cognitive-services-speech-sdk | ~3,5k | MIT | — | — | Exemplos de Pronunciation Assessment e viseme. |

### 4.2 Reconhecimento de **fonemas** e MDD (detecção de erros de pronúncia)

| Nome | URL | ⭐ | Licença | Utilidade |
|---|---|---|---|---|
| `facebook/wav2vec2-xlsr-53-espeak-cv-ft` (HF) | https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft | (modelo HF) | Apache-2.0 | XLS-R-53 com fine-tune no Common Voice para **reconhecer rótulos fonéticos (IPA estilo espeak) em vários idiomas**, a 16 kHz. Paper: *Simple and Effective Zero-shot Cross-lingual Phoneme Recognition* (arXiv 2109.11680). **Melhor ponto de partida aberto** para dizer quais fonemas a criança produziu. |
| `jonatasgrosman/wav2vec2-large-xlsr-53-portuguese` (HF) | https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese | (modelo HF) | licença a conferir | ASR pt baseado em XLS-R. Base para fine-tune. |
| Allosaurus | https://github.com/xinjli/allosaurus | ~0,75k | **GPL-3.0** | Reconhecedor universal de fones (2000+ idiomas). Bom para prototipar; GPL e sem push desde 04/2024. |
| Multilingual-PR | https://github.com/ASR-project/Multilingual-PR | ~270 | (sem licença) | Comparação de wav2vec2/HuBERT/WavLM para reconhecimento de fonemas. Referência de código. |
| MDD wav2vec2 + LLM | https://github.com/crazycloud/mispronunciation-detection-diagnosis-wav2vec2-and-llm | ~61 | Apache-2.0 | Pipeline MDD com wav2vec2 de fonemas + LLM gerando feedback em linguagem natural. **Muito próximo do que queremos.** |
| wav2vec2mdd | https://github.com/vocaliodmiku/wav2vec2mdd | ~52 | (sem licença) | MDD fim a fim com wav2vec2 (pesquisa). |
| mpl-mdd | https://github.com/Mu-Y/mpl-mdd | ~38 | MIT | MDD com pseudo-rótulos (Interspeech 2022). |
| joint-apa-mdd-mtl | https://github.com/rhss10/joint-apa-mdd-mtl | ~25 | MIT | Avaliação de pronúncia + MDD multitarefa (Interspeech 2023). |
| CTC-Attention-Mispronunciation | https://github.com/cageyoko/CTC-Attention-Mispronunciation | ~63 | (sem licença) | MDD dependente de texto. |
| OpenPronounce | https://github.com/Halleck45/OpenPronounce | ~209 | MIT | Avaliação fonema a fonema **(inglês)** com Wav2Vec2 + DTW, self-hosted. **Arquitetura replicável para pt-BR.** |
| GOPT | https://github.com/YuanGongND/gopt | ~233 | BSD-3-Clause | Transformer multi-aspecto e multigranular (ICASSP 2022) sobre features GOP. |
| CTC-based-GOP | https://github.com/frank613/CTC-based-GOP | ~44 | (sem licença) | **GOP calculado a partir de modelos CTC** (wav2vec2), sem precisar de Kaldi. Caminho moderno. |
| kaldi-dnn-ali-gop | https://github.com/tbright17/kaldi-dnn-ali-gop | ~237 | (a conferir) | Alinhamento forçado + GOP com DNN em Kaldi. |
| kaldi-gop | https://github.com/jimbozhang/kaldi-gop | ~163 | (a conferir) | GOP clássico em Kaldi. |
| goparrot | https://github.com/tzyll/goparrot | ~56 | (sem licença) | **GOP para avaliação de leitura oral**, o mesmo caso de uso (leitura em voz alta). |
| dysarthria-gop | https://github.com/juice500ml/dysarthria-gop | ~29 | MIT | GOP para inteligibilidade de fala atípica. Útil se houver crianças com transtorno de fala. |
| Montreal Forced Aligner | https://github.com/MontrealCorpusTools/Montreal-Forced-Aligner | ~1,9k | MIT | Alinhamento forçado texto↔áudio no nível de fonema. Modelo acústico **`portuguese_mfa`** (Brasil + Portugal, CC BY 4.0) + dicionário **`portuguese_brazil_mfa`** (`mfa model download dictionary portuguese_brazil_mfa`). Ótimo **offline** para anotar o corpus e calibrar notas. Pesado demais para tempo real no celular. |

### 4.3 APIs comerciais de avaliação de pronúncia

| Serviço | pt-BR? | Granularidade | Observações |
|---|---|---|---|
| **Azure Pronunciation Assessment** | **Sim, pt-BR consta** entre os ~33 locales (as notas de versão citam atualização de modelos para pt-BR) | Texto completo, palavra, sílaba e **fonema** (accuracy, fluency, completeness, prosody) | Add-on de ~US$ 0,30/h sobre o STT (~US$ 1/h em tempo real). **Riscos:** (1) relatos de que os símbolos de fonema retornados seguem o conjunto do inglês americano, então é preciso testar a saída em pt-BR; (2) modelo treinado com adultos, sem validação pública para criança de 5–7 anos; (3) relatos no Microsoft Q&A de imprecisões no nível de palavra/fonema. **Fazer uma prova de conceito com 30–50 crianças antes de decidir.** |
| SpeechSuper | **Não**: lista 8 idiomas (en, zh, fr, de, es, ja, ko, ru) | Fonema | Samples: https://github.com/speechsuper/SpeechSuper-API-Samples (~73 ⭐, MIT). Fora para pt-BR. |
| ELSA | API de inglês | — | Foco no inglês L2. Fora. |
| OpenAI / ElevenLabs Scribe (STT) | Sim (transcrição) | Só texto | gpt-4o-mini-transcribe ~US$ 0,003/min (relato de depreciação prevista para 02/2027; conferir). Scribe ~US$ 0,22/h. Servem para transcrição, **não** para avaliar fonemas. |

### 4.4 Viabilidade com voz infantil

- **ASR em fala infantil continua mais difícil.** Estudos de 2024 com Whisper em inglês: o Kid-Whisper (AAAI/AIES 2024) reduziu o WER no corpus MyST de 13,9% para 9,1% (Whisper-Small) com fine-tune; Jain et al. (IEEE Access 2024) obtiveram ganhos relativos de 29–89% com fine-tune; em sala de aula, sistemas prontos chegaram a ~84% de WER. Conclusão: **fine-tune com fala infantil é decisivo**, e o desempenho cai muito com ruído e sotaque.
- **Não há corpus aberto de fala infantil pt-BR para ASR.** Achamos o CHILDES Florianópolis (uma criança, transcrição fonética, pesquisa) e o BIPODE_BR (acesso restrito). Em português europeu há o CNG (21 h, 510 crianças de 3–10 anos) e o PhonoDis (crianças com transtornos de fala). **O projeto vai precisar coletar o próprio corpus** (com consentimento dos pais e anotação por fonoaudiólogas), o que vira um ativo estratégico.
- **Desenho de tarefa que torna o problema viável:** como o sistema sempre **sabe a resposta esperada** (texto-dependente), não precisamos de ASR aberto. Basta (a) verificar o alinhamento com a sequência esperada (GOP) ou (b) classificar entre o alvo e 2–4 distratores com gramática fechada (Vosk) ou com scoring de log-probabilidades CTC. Isso tolera muito melhor a voz infantil.
- **Avaliar fonemas isolados** (/m/, /s/ prolongados) é o caso mais difícil para modelos treinados em fala contínua. Na fase inicial, vale avaliar **sílabas e palavras** e tratar fonemas isolados com feedback mais generoso (presença de som, duração, energia em faixa de frequência, por exemplo /s/ = ruído de alta frequência).

---

## 5. Rastreamento da boca pela câmera

| Nome | URL | ⭐ | Licença | Uso |
|---|---|---|---|---|
| **MediaPipe** (Face Landmarker) | https://github.com/google-ai-edge/mediapipe | ~37,7k | Apache-2.0 | **Recomendado.** Pacote `@mediapipe/tasks-vision` (web) e SDKs Android/iOS. 478 landmarks e **52 blendshapes** (com `outputFaceBlendshapes: true`), cada um com nota de 0 a 1. *Left/Right referem-se ao rosto do sujeito; a imagem espelhada inverte os lados.* |
| Kalidokit | https://github.com/yeemachine/kalidokit | ~5,7k | MIT | Converte landmarks do MediaPipe em blendshapes e rotações para avatar. Útil para a **Sofia imitar a criança** (espelho mágico). |
| Human (vladmandic) | https://github.com/vladmandic/human | ~3,4k | MIT | Suíte TF.js (rosto, malha, emoção, íris). Alternativa ao MediaPipe. |
| face-api.js | https://github.com/justadudewhohacks/face-api.js | ~18k | MIT | 68 landmarks. **Abandonado** (último push 01/2024). Não usar. |
| TensorFlow.js | https://github.com/tensorflow/tfjs | ~19,2k | Apache-2.0 | Base para modelos próprios no browser. |
| react-native-vision-camera | https://github.com/mrousavy/react-native-vision-camera | (não capturado na busca) | MIT **[não verificado]** | Câmera com *frame processors* no RN, para rodar o MediaPipe nativo no app. |

### 5.1 Como usar os blendshapes para checar a forma da boca

Blendshapes relevantes do MediaPipe (nomenclatura ARKit): `jawOpen`, `mouthClose`, `mouthFunnel`, `mouthPucker`, `mouthPressLeft/Right`, `mouthRollLower/Upper`, `mouthShrugLower/Upper`, `mouthStretchLeft/Right`, `mouthSmileLeft/Right`, `mouthUpperUpLeft/Right`, `mouthLowerDownLeft/Right`, `cheekPuff`.

| Grupo de fonemas (pt-BR) | Forma visível esperada | Regra (exemplo; limiares a calibrar por criança) | Feedback da Sofia |
|---|---|---|---|
| /a/ | boca bem aberta | `jawOpen` > 0,5 | "Abra bem a boca, como um jacaré!" |
| /ɛ e/, /i/ | lábios esticados, abertura média ou pequena | `mouthStretch`/`mouthSmile` altos, `jawOpen` médio (e) ou baixo (i) | "Faça um sorriso!" |
| /o ɔ/, /u/ | lábios arredondados | `mouthFunnel` e/ou `mouthPucker` > 0,4; `jawOpen` médio (o) ou baixo (u) | "Faça um biquinho!" |
| /p b m/ | lábios fechados (oclusão) | pico de `mouthClose`/`mouthPress` com `jawOpen` ≈ 0 **no início** da sílaba | "Junte os lábios… e solte!" |
| /f v/ | lábio inferior encostado nos dentes de cima | `mouthRollLower` alto e `mouthLowerDown` baixo (sinal mais fraco) | "Morda de leve o lábio de baixo." |
| /ʃ ʒ/ (x, ch, j) | lábios projetados | `mouthFunnel` alto | "Bico pra frente: chhh" |
| /t d n l r s z/, /k g/ | **língua (não visível)** | **Não avaliar pela câmera**; só pelo áudio | Mostrar o vídeo da boquinha e dar dica tátil/verbal |

Boas práticas:
- **Calibração individual:** 3 s de "rosto neutro" no início de cada sessão; avaliar a *variação* em relação a esse neutro, não valores absolutos.
- **Sincronizar com o áudio:** usar o VAD para achar o trecho de fala e analisar só os frames dessa janela (a 30 fps, um /pa/ dura poucos frames, então é preciso analisar o pico, não a média).
- **Feedback positivo e tolerante:** a câmera serve como "dica", nunca como reprovação. Errar o diagnóstico frustra a criança.
- **Leitura labial (lip-reading) completa** (ex.: *Visual Speech Recognition for Multiple Languages*) é pesquisa pesada, sem modelo pt-BR infantil pronto. **Não é necessária**: basta classificar poucas formas de boca.

---

## 6. Lip-sync da personagem Sofia

| Nome | URL | ⭐ | Licença | Uso |
|---|---|---|---|---|
| Rhubarb Lip Sync | https://github.com/DanielSWolf/rhubarb-lip-sync | ~2,8k | "Other" no GitHub (mirrors indicam MIT; **conferir LICENSE.md**) | Gera a timeline de 6–9 formas de boca (A–H/X, padrão de desenho animado) a partir do áudio. **Para português, usar `--recognizer phonetic`** (desde a v1.9.0; menos preciso que o modo inglês). Roda offline no pipeline de assets. |
| Visemas Azure | (API) | — | Comercial | 22 viseme IDs com offset em ms, recebidos durante a síntese. **Mais preciso**, porque vêm da própria pronúncia sintetizada. |
| Polly Speech Marks | (API) | — | Comercial | Visemas no formato JSON-lines com tempo. |
| Visemas Oculus/Meta | (padrão de 15 visemas: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou) | — | — | Conjunto de referência usado por TalkingHead e outros. Bom para mapear os 22 IDs do Azure em 8–10 desenhos de boca. |
| wawa-lipsync | https://github.com/wass08/wawa-lipsync | ~215 | MIT | Lip-sync em tempo real a partir do áudio no browser (análise de frequência → visemas). Leve, para falas dinâmicas. |
| HeadAudio | https://github.com/met4citizen/HeadAudio | ~58 | MIT | AudioWorklet que detecta visemas em tempo real a partir do áudio. |
| TalkingHead | https://github.com/met4citizen/TalkingHead | ~1,7k | MIT | Avatar 3D falante no browser com lip-sync multilíngue (referência se a Sofia for 3D). |
| lipsync-engine | https://github.com/Amoner/lipsync-engine | ~68 | MIT | Lip-sync streaming sem dependências, para animação 2D no browser. |
| OpenFaceFX | https://github.com/OpenFaceFX/OpenFaceFX | ~23 | MIT | Áudio + transcrição → curvas de visemas (estilo FaceFX). |

**Pipeline recomendado:**
1. Falas roteirizadas: Azure TTS → MP3 + JSON de visemas (offset_ms, viseme_id) → mapeamento para 8–10 bocas da Sofia → no app, o Rive recebe `mouthShape` (input numérico da state machine), sincronizado com o `currentTime` do Howler.
2. Falas humanas gravadas (fonemas da fonoaudióloga): Rhubarb `phonetic` + ajuste manual pelo animador.
3. Falas dinâmicas: visemas do Azure em streaming, com fallback no wawa-lipsync/HeadAudio a partir do áudio.

Os **vídeos da "boquinha"** de cada fonema devem ser **filmados com pessoa real** (close frontal e de perfil). A Sofia (animada) serve de reforço lúdico, e o vídeo real serve de modelo articulatório.

---

## 7. Stack app + web conectados, backend e offline

| Nome | URL | ⭐ | Licença | Uso |
|---|---|---|---|---|
| React Native | https://github.com/react/react-native | ~126,9k | MIT | Base mobile. |
| **Expo** | https://github.com/expo/expo | ~53,5k | MIT | **Recomendado**: Expo Router (universal iOS/Android/web), EAS Build/Update (OTA), câmera, áudio, DOM components. |
| **Next.js** | https://github.com/vercel/next.js | ~143,5k | MIT | Site público, portal do professor e do responsável (SSR/SEO), versão web do aluno. |
| **Turborepo** | https://github.com/vercel/turborepo | ~31,3k | MIT | Monorepo: `apps/web`, `apps/mobile`, `packages/ui`, `packages/games`, `packages/core`. |
| Solito | https://github.com/nandorojo/solito | ~4,1k | MIT | Navegação compartilhada entre Next.js e React Native. |
| Flutter | https://github.com/flutter/flutter | ~181k | BSD-3-Clause | **Alternativa**: um código para iOS/Android/web com ótima performance de animação. Contras: a web do Flutter é pesada (canvas) e pior para SEO/portal. |
| Capacitor | https://github.com/ionic-team/capacitor | ~17,1k | MIT | **Alternativa simples**: empacotar a web app (Next.js/Vite + PixiJS) como app nativo. Bom se o jogo web for o núcleo. |
| **Supabase** | https://github.com/supabase/supabase | ~114,9k | Apache-2.0 | **Recomendado**: Postgres, Auth (e-mail/senha, magic link), **Row Level Security** para os papéis aluno/responsável/professor, Storage (áudios), Edge Functions (proxy para Azure com tokens de curta duração). Self-hostable. |
| Firebase JS SDK | https://github.com/firebase/firebase-js-sdk | ~5,2k | Apache-2.0 (SDK) | Alternativa gerenciada (Auth, Firestore offline nativo). Lock-in no Google. |
| Appwrite | https://github.com/appwrite/appwrite | ~58,1k | BSD-3-Clause | Alternativa self-hosted completa. |
| PocketBase | https://github.com/pocketbase/pocketbase | ~61,6k | MIT | Backend em um binário. Ótimo para MVP; menos indicado em escala multi-escola. |
| PowerSync (JS) | https://github.com/powersync-ja/powersync-js | ~0,7k | Apache-2.0 | **Offline-first** com SQLite local sincronizado com Postgres/Supabase. |
| WatermelonDB | https://github.com/Nozbe/WatermelonDB | ~11,8k | MIT | Banco reativo offline para RN. |
| Legend-State | https://github.com/LegendApp/legend-state | ~4,2k | MIT | Estado com persistência/sync (tem plugin Supabase). |
| capacitor-community/sqlite | https://github.com/capacitor-community/sqlite | ~0,7k | MIT | SQLite se a rota for Capacitor. |
| TanStack Query | https://github.com/TanStack/query | ~50,6k | MIT | Cache de dados do servidor (web e RN). |
| Zustand | https://github.com/pmndrs/zustand | ~58,9k | MIT | Estado local de jogo e sessão. |
| Drizzle ORM | https://github.com/drizzle-team/drizzle-orm | ~36,3k | Apache-2.0 | Schema e migrations TypeScript sobre Postgres. |

### 7.1 Projetos de referência em educação infantil e alfabetização

| Nome | URL | ⭐ | Licença | Por que olhar |
|---|---|---|---|---|
| Kolibri (Learning Equality) | https://github.com/learningequality/kolibri | ~1,2k | MIT | Plataforma de aprendizagem **offline-first** com papéis aluno/professor/admin e sincronização P2P. Referência de modelo de dados e de uso em escola sem internet. |
| GCompris (KDE) | https://github.com/KDE/gcompris (mirror; repo oficial em invent.kde.org) | ~62 no mirror | GPL (copyleft; **a conferir**) | 100+ atividades educativas para 2–10 anos, com atividades de leitura. Referência de game design pedagógico. GPL impede reaproveitar código num produto fechado. |
| Feed the Monster (Curious Learning) | https://github.com/curiouslearning/FeedTheMonster | ~7 | NOASSERTION (a conferir) | Jogo de alfabetização **fônica** (originalmente Unity, Android), localizado em dezenas de idiomas. Referência direta de mecânica letra→som. |
| FeedTheMonsterJS | https://github.com/curiouslearning/FeedTheMonsterJS | ~5 | MIT | Versão **web (JS + canvas)** do Feed the Monster. Código reaproveitável (MIT). |
| ftm-languagepacks | https://github.com/curiouslearning/ftm-languagepacks | ~2 | BSD-2-Clause | Formato de "pacote de idioma" (letras, sons, níveis). Bom modelo para o currículo fônico em dados. |
| buzzphonics | https://github.com/hellodeborahuk/buzzphonics | ~63 | MIT | App de phonics (fases 2–3 do método inglês *Letters and Sounds*), para pais e crianças. |
| Brainy-Phonics | https://github.com/calda/Brainy-Phonics | ~18 | (sem licença) | Jogo iOS de fônica publicado. |
| Litera (Etec) | https://github.com/Illumi-Etec/litera | ~6 | MIT | Suíte brasileira de jogos de alfabetização. |
| Alfabetizando | https://github.com/so-tha/Alfabetizando | ~6 | GPL-3.0 | App de alfabetização para crianças autistas não verbais (BR). |
| ArBC (UnB/FGA) | https://github.com/fga-eps-mds/2019.2-ArBC | ~15 | GPL-3.0 | Alfabetização com realidade aumentada (BR). |
| OpenDyslexic | https://github.com/antijingoist/opendyslexic | ~0,8k | OFL-1.1 | Fonte opcional para dislexia (a evidência de eficácia é discutida; oferecer como opção, não como padrão). |
| Andika (SIL) | https://github.com/silnrsi/font-andika | ~86 | OFL-1.1 | **Fonte recomendada para alfabetização**: letras de forma "escolares" ("a" e "g" de um andar, I/l/1 bem distintos). |

---

## 8. Datasets de fala (pt-BR e infantil)

| Dataset | Link | Tamanho (verificado) | Licença | Uso |
|---|---|---|---|---|
| Common Voice (Mozilla) — pt | https://github.com/common-voice/common-voice (plataforma; ~3,5k ⭐, MPL-2.0) | v7.0: 84 h validadas (versões atuais maiores; número atual não verificado) | CC0 | Adultos, leitura. Fine-tune base. |
| CORAA ASR v1 | https://github.com/nilc-nlp/CORAA (~68 ⭐) | **290,77 h** validadas PT-BR (+4,69 h PT-PT) | **CC BY-NC-ND 4.0** | Fala espontânea/preparada adulta. **Não comercial e sem derivados**: só pesquisa/benchmark. |
| MLS (Multilingual LibriSpeech) — pt | (OpenSLR) | ~169 h | CC BY 4.0 **[licença não verificada]** | Audiolivros, adultos. |
| MuPe-Diversidades | https://github.com/nilc-nlp/MuPe-Diversidades | amostra | a conferir | Diversidade de sotaques PT-BR. |
| CHILDES — Florianópolis | https://talkbank.org/childes/access/Romance/Portuguese/Florianopolis.html | 1 criança, 5.530 enunciados | Termos TalkBank | Fonologia infantil PT-BR (pesquisa). |
| CNG (PT-PT infantil) | (citado na literatura) | 21 h, 510 crianças de 3–10 anos | a conferir | Único corpus infantil grande em português achado, mas **europeu**. |
| On Top of Pasketti (desafio DrivenData) | https://github.com/drivendataorg/on-top-of-pasketti (~20 ⭐, MIT) | — | MIT (código) | Soluções vencedoras de ASR infantil (inglês). Técnicas reaproveitáveis. |

**Conclusão:** para fala infantil PT-BR **será preciso coletar dados próprios**. Sugestão: começar com um programa-piloto em escolas parceiras (TCLE dos responsáveis, anonimização, anotação por fonoaudiólogas), com meta de 20–50 h de crianças de 5–8 anos lendo os itens do próprio currículo.

---

## 9. Arquitetura recomendada

```
┌───────────────────────── Monorepo (Turborepo + pnpm, TypeScript) ─────────────────────────┐
│ apps/mobile   Expo (React Native) + Expo Router  → iOS/Android (aluno, offline-first)     │
│ apps/web      Next.js                            → aluno (web), responsável, professor    │
│ packages/games    minijogos PixiJS (ou Phaser) + Howler.js  (web direto; app via DOM/WebView)│
│ packages/sofia    Rive (state machine: idle/falando/feliz/pensando) + player de visemas   │
│ packages/speech   VAD (Silero) · captura 16 kHz · cliente Azure PA · modelo local (ONNX)  │
│ packages/vision   MediaPipe Face Landmarker → regras de blendshapes por grupo de fonemas  │
│ packages/core     currículo fônico (JSON tipo "language pack"), progresso, tipos, i18n    │
│ packages/ui       design system (fonte Andika), acessibilidade                            │
└───────────────────────────────────────────────────────────────────────────────────────────┘
           │                                   │
           ▼                                   ▼
   Supabase (Postgres + RLS + Auth + Storage + Edge Functions)      CDN (áudios/visemas/vídeos)
   - papéis: aluno / responsável / professor / escola               - falas da Sofia pré-geradas
   - turmas, progresso, tentativas (só métricas, não áudio)         - vídeos da boquinha (HLS/MP4)
   - Edge Function emite token curto do Azure Speech                - sprites de áudio de fonemas
           │
           ▼
   Azure AI Speech (TTS neural + visemas, Pronunciation Assessment pt-BR)
   + serviço próprio opcional (Python: wav2vec2 de fonemas + GOP; MFA para anotar o corpus)
```

**Justificativas:**
- **Expo + Next.js em monorepo:** a equipe usa uma linguagem só (TypeScript), compartilha currículo, lógica, jogos e componentes, e tem OTA updates (EAS) para corrigir conteúdo sem passar pela loja. É a stack com maior ecossistema e mais mão de obra no Brasil.
- **Jogos em PixiJS/Phaser (web) num pacote compartilhado:** o mesmo jogo roda no navegador e no app, e é mais fácil contratar desenvolvedores e artistas com experiência em HTML5 games.
- **Rive para a Sofia:** state machines e inputs controláveis por código (boca, olhos, emoção) com arquivos pequenos e runtimes MIT em web, RN e Flutter. O lip-sync vira só "setar o input `mouth` no tempo certo".
- **Supabase:** auth com papéis via RLS no Postgres (relatórios de professor = SQL), open source e self-hostable (útil para contratos com redes públicas e residência de dados).
- **Azure:** um só fornecedor para voz neural pt-BR, visemas e avaliação de pronúncia pt-BR. O resto (jogos, câmera, VAD) é local.

**Alternativas:**
- *Flutter + Flame + Rive Flutter + Supabase*: excelente para o app, mas a web fica mais fraca e o portal precisaria ser outro projeto.
- *Web app (Vite/Next) + Capacitor*: o menor custo inicial, com tudo em web, mas a performance de câmera/ML no WebView do iOS é mais limitada.
- *Godot para os jogos*: qualidade de "jogo de verdade", mas integração com login/progresso e tamanho de download são piores.
- *Firebase* no lugar do Supabase: offline do Firestore pronto, mas NoSQL é pior para relatórios pedagógicos.

---

## 10. Viabilidade do recurso "corrigir a boquinha"

### 10.1 O que é realista hoje

| Capacidade | Realista? | Como |
|---|---|---|
| Saber se a criança **disse a palavra/sílaba certa** entre poucas opções | **Sim** (com fine-tune e testes) | Tarefa fechada: alvo + distratores (Vosk com gramática, ou scoring CTC do wav2vec2), ou Azure PA com texto de referência |
| Dar **nota por fonema** numa palavra | **Parcialmente** | Azure PA pt-BR (validar com crianças) ou wav2vec2 de fonemas + GOP. Calibrar limiares com dados infantis rotulados |
| Diagnosticar **qual erro** (troca de /p/ por /b/, omissão de /r/ em encontro) | **Em pesquisa** | MDD comparando a sequência IPA reconhecida com a esperada. Começar com poucos pares mínimos frequentes na alfabetização (p/b, t/d, f/v, s/z, ch/j, r/l) |
| Ver se a **boca está aberta, fechada ou arredondada** | **Sim** | MediaPipe blendshapes no dispositivo, com calibração por criança |
| Ver **posição da língua** | **Não** (pela câmera) | Apenas inferir pelo áudio |
| Feedback de articulação ("lábios juntos") **gerado do erro** | **Sim, com regras** | Tabela "fonema-alvo × sintoma detectado → dica + vídeo da boquinha". Não precisa de IA generativa |

### 10.2 Abordagem em camadas (proposta)

1. **Camada 0 — Modelo:** vídeo da boquinha (pessoa real) + Sofia demonstrando. Sem avaliação. Disponível em 100% dos dispositivos.
2. **Camada 1 — Áudio leve, local:** VAD detecta se a criança falou, e por quanto tempo e com que energia. Já dá feedback motivacional ("Não ouvi! Fale mais alto").
3. **Camada 2 — Áudio, verificação:** "disse o alvo?" (local, wav2vec2/Vosk via sherpa-onnx ou Transformers.js; ou Azure PA na nuvem). Resultado: acertou / quase / tente de novo.
4. **Camada 3 — Câmera (opcional, opt-in do responsável):** para fonemas com articulação visível (/p b m/, /f v/, /a/, /o u/, /ʃ ʒ/), checar a forma da boca no momento da fala e gerar a dica específica.
5. **Camada 4 — Professor/fonoaudióloga:** gravações marcadas como "duvidosas" (com consentimento) vão para revisão humana. Isso também alimenta o corpus.

A **decisão final do feedback combina áudio e câmera**: se o áudio indica erro e a câmera mostra "lábios não fecharam" num /b/, a Sofia diz "Junte os lábios!". Se só o áudio indica erro num fonema não visível, a Sofia mostra o vídeo e pede para repetir.

### 10.3 Riscos com voz infantil

- Modelos treinados em adultos: frequência fundamental alta, articulação em desenvolvimento e trocas fonológicas *normais para a idade* (ex.: /r/ em encontros consonantais) podem ser marcadas como erro. **Não penalizar processos fonológicos esperados para a faixa etária.** Definir isso com fonoaudióloga.
- Ruído (sala de aula, TV) e microfones de celulares baratos: exigir modo "ambiente silencioso" e calibrar o ganho.
- Falsos negativos frustram: começar com **limiares tolerantes** e só elogiar/encorajar. Nunca mostrar "errado" em vermelho para fala.
- Variação regional do português brasileiro (ex.: /t d/ palatalizados antes de /i/, /s/ chiado no Rio, /r/ retroflexo no interior): o "alvo" deve aceitar variantes regionais.
- O Azure não permite fixar versão do modelo, então o comportamento pode mudar. Manter um conjunto de teste de regressão.

### 10.4 Privacidade (crianças)

- **LGPD art. 14:** dados de crianças exigem consentimento específico e em destaque de pelo menos um dos pais/responsável e tratamento no **melhor interesse** da criança. Voz e imagem do rosto podem configurar **dado biométrico (sensível)**. Também é preciso conferir com o jurídico as obrigações do **ECA Digital (Lei 15.211/2025)** para produtos digitais voltados a crianças.
- **Câmera 100% no dispositivo**: nenhum frame de vídeo sai do aparelho; só métricas agregadas (ex.: "lábios fecharam: sim").
- **Áudio:** processar localmente quando possível. Se for para a nuvem (Azure), usar região com contrato adequado, sem retenção e sem uso para treino, e **não gravar** por padrão. Gravação para melhorar modelos só com opt-in separado, retenção limitada e anonimização.
- Painel do responsável para ver e apagar dados. Sem anúncios nem rastreadores de terceiros no app infantil.

---

## 11. Custos estimados de TTS/ASR por aluno

Premissas (ajustáveis): aluno ativo usa **20 min/dia, 20 dias/mês**; faz **~60 tentativas de fala por dia** de ~3 s cada, ou seja ~3 min de áudio/dia, **~1 h/mês**. Preços de lista em US$ (fontes na seção 12; conferir na contratação).

| Item | Estratégia | Cálculo | Custo/aluno/mês |
|---|---|---|---|
| TTS das falas roteirizadas | Pré-gerar uma vez (custo fixo, não por aluno) | ex.: 3.000 falas × 80 caracteres = 240k caracteres → ~US$ 3,60 no Azure, **uma vez** (ou ~US$ 24 no ElevenLabs Multilingual) | ~US$ 0 |
| TTS dinâmico (nome, frases variáveis) | Azure Neural em tempo real | ~5.000 caracteres/mês × US$ 15/1M | ~US$ 0,08 |
| ASR + Pronunciation Assessment | Azure em tempo real | 1 h × (~US$ 1 STT + ~US$ 0,30 PA) | **~US$ 1,30** |
| ASR alternativo (só transcrição, sem nota de fonema) | gpt-4o-mini-transcribe | 60 min × US$ 0,003 | ~US$ 0,18 |
| ASR/avaliação **on-device** | wav2vec2/Vosk via sherpa-onnx ou Transformers.js | custo variável zero (só desenvolvimento e download do modelo) | **US$ 0** |
| Câmera (MediaPipe) | on-device | — | US$ 0 |

**Leitura:** com Azure para tudo, o custo variável fica em **~US$ 1,3–1,5 por aluno ativo/mês** (aprox. R$ 7–8, câmbio não verificado), dominado pela avaliação de pronúncia. A estratégia **híbrida** (avaliação local para o grosso das tentativas e Azure só para casos duvidosos ou amostragem) pode reduzir isso em mais de 80%. Os free tiers (Azure: 5 h STT e 0,5M caracteres TTS/mês; Polly: 1M caracteres neural/mês por 12 meses) cobrem o piloto.

---

## 12. Fontes consultadas (web)

- Azure — suporte de idiomas (pronunciation assessment pt-BR): https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support ; release notes: https://docs.azure.cn/en-us/ai-services/speech-service/releasenotes ; GitHub docs: https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-services/speech-service/includes/language-support/pronunciation-assessment.md — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Azure — visemas: https://learn.microsoft.com/azure/ai-services/speech-service/how-to-speech-synthesis-viseme ; Q&A blend shapes: https://learn.microsoft.com/en-us/answers/questions/1644812/when-will-new-voices-support-blendshape-output — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Azure — fonemas na saída do PA: https://learn.microsoft.com/en-us/answers/questions/1434363/pronunciation-assessment-the-phoneme-level-feedbac ; imprecisões: https://learn.microsoft.com/en-us/answers/questions/5707709/azure-speech-pronunciation-assessment-word-and-pho — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Azure — preços: https://azure.microsoft.com/pricing/details/cognitive-services/speech-services ; https://www.developersdigest.tech/models/speech/azure — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- Azure — vozes pt-BR: https://techcommunity.microsoft.com/t5/azure-ai/cognitive-services-adds-brazilian-portuguese-to-neural-text-to/ba-p/1210471 ; https://docs.signalwire.com/voice/tts/azure ; versão das vozes: https://learn.microsoft.com/en-us/answers/questions/5771581/change-in-tts-voice — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Amazon Polly — vozes neurais: https://docs.aws.amazon.com/polly/latest/dg/neural-voices.html ; preços: https://aws.amazon.com/polly/pricing/ ; histórico: https://docs.aws.amazon.com/polly/latest/dg/doc-history.html — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- Google TTS — preços: https://cloud.google.com/text-to-speech/pricing — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- ElevenLabs — preços: https://elevenlabs.io/pricing/api ; https://developer.puter.com/tutorials/elevenlabs-api-pricing/ — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- OpenAI transcrição — preço: https://www.neowin.net/news/openai-announces-next-generation-audio-models-to-power-voice-agents/ ; https://costbench.com/software/ai-transcription-apis/openai-whisper/ — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- XTTS-v2 (CPML): https://huggingface.co/coqui/XTTS-v2 ; https://coqui-tts.readthedocs.io/en/latest/models/xtts.html — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Kokoro pt-BR: https://huggingface.co/msgflux/Kokoro-82M-streaming-onnx ; https://thomazrb.github.io/posts/python-tts-kokoro — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- F5-TTS pt-BR: https://huggingface.co/firstpixel/F5-TTS-pt-br — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Piper vozes pt_BR: https://huggingface.co/rhasspy/piper-voices (pasta pt/pt_BR) ; MODEL_CARD faber: https://huggingface.co/rhasspy/piper-voices/blob/refs%2Fpr%2F11/pt/pt_BR/faber/medium/MODEL_CARD — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- wav2vec2 espeak: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- MFA português: https://huggingface.co/MontrealCorpusTools/portuguese_mfa ; https://mfa-models.readthedocs.io/en/latest/dictionary/Portuguese/Portuguese%20(Brazil)%20MFA%20dictionary%20v2_0_0a.html — *Validação E2: VERIFICADA — URL ativa, HTTP 200*
- Vosk modelos: https://alphacephei.com/vosk/models — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- whisper.cpp WASM: https://github.com/ggml-org/whisper.cpp/tree/master/examples/whisper.wasm — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 403*
- MediaPipe Face Landmarker (web): https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- Rhubarb (recognizer phonetic): https://github.com/DanielSWolf/rhubarb-lip-sync — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 403*
- SpeechSuper (8 idiomas): https://github.com/speechsuper/SpeechSuper-API-Samples — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 403*
- Feed the Monster: https://backlog.digitalpublicgoods.net/curiouslearning/ ; https://norad.no/en/front/thematic-areas/education/innovation/eduapp4syria/feed-the-monster-available-in-25-languages — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- ASR infantil: https://ojs.aaai.org/index.php/AIES/article/view/31618 (Kid-Whisper) ; https://doaj.org/article/0511c1c47cad47ab8ad278b14388fd9e (Jain et al.) ; https://arxiv.org/html/2404.17394v2 — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*
- Corpora: https://arxiv.org/abs/2110.15731 (CORAA) ; https://talkbank.org/childes/access/Romance/Portuguese/Florianopolis.html — *Validação E2: NÃO CHECÁVEL — site fora da rede liberada, HTTP 000*

---

## 13. Pendências e próximos passos técnicos

1. **PoC de avaliação de pronúncia (2–3 semanas):** gravar 30–50 crianças (5–7 anos, com TCLE) lendo 40 itens (sílabas e palavras com pares mínimos). Comparar (a) Azure PA pt-BR, (b) wav2vec2-espeak + GOP/CTC, (c) Vosk com gramática fechada, usando a anotação de fonoaudióloga como referência.
2. **PoC de câmera:** MediaPipe no browser e no Expo; medir separação de /p b m/ vs /a/ vs /u/ em crianças, além de FPS e bateria em aparelhos Android de entrada.
3. **PoC da Sofia:** um arquivo Rive com 9 bocas + falas pré-geradas no Azure com visemas, rodando em Next.js e Expo.
4. Conferir licenças marcadas como "a conferir" (Rhubarb, Spine, Cocos, Fish Speech, vozes Piper individuais, GCompris, ricky0123/vad) antes de adotar.
5. Validação jurídica: LGPD art. 14, ECA Digital, contrato de processamento de dados com Azure (região, retenção).
