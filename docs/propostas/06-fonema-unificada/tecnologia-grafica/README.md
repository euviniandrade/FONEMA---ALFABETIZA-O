# Radar de tecnologia gráfica e imersiva do FONEMA

> Frente: tecnologia gráfica e imersiva (3D, "4D", "5D"), com foco no GitHub
> Data da coleta: 13/11/2026 · Complementa e atualiza a [pesquisa 03](../../../pesquisa/03-github-tecnologia.md) (sem repetir voz, ASR e backend) e segue a [Decisão 005](../../../decisoes/005-proposta-unificada.md).
> **Método.** As estrelas, licenças e datas de último push vêm de `gh api -X GET search/repositories` (consulta `repo:dono/nome`) na data da coleta, arredondadas. O endpoint `repos/` estava bloqueado nesta sessão. Fatos que não estão no GitHub (licenças de modelos de IA, suporte a WebGPU, 8th Wall, Unity, Godot, Live2D, Rive) vieram de buscas na web e estão nas fontes (seção 9).
> **Convenções.** **[nv]** = não verificado em fonte primária. "Parado" = sem push há mais de 12 meses. "NOASSERTION" = o GitHub não reconheceu a licença. A coluna **2 GB** responde se a peça roda num Android de entrada (2 GB de RAM, GPU Mali-G52/Adreno 50x ou similar): **sim**, **modo leve** (só com cortes), **não**, ou **n/a** (ferramenta de produção, não roda no aparelho). Essa coluna é estimativa de engenharia, ainda **sem medição em aparelho real** (ver seção 8).

---

## 1. Resumo executivo

1. **"3D, 4D, 5D" com honestidade.** Não existe "gráfico 5D". Para o FONEMA, o pedido do dono vira três camadas reais:
   - **3D**: mundo em tempo real (arquipélago, vila, zoom, ângulos);
   - **"4D"**: o tempo e o movimento (animação, física, partículas, água, vento, ciclo dia/noite, clima);
   - **"5D"**: os outros sentidos e a interação (áudio espacial, vibração, câmera que lê a boca, a Sofia que imita a criança, realidade aumentada opcional).

   Tudo isso existe hoje em código aberto e roda no navegador e no app. O limite não é a tecnologia, e sim o **celular de 2 GB**. Por isso a peça central desta proposta é a **qualidade adaptativa** (seção 6).
2. **O "estado da arte" que cabe no FONEMA é Three.js com WebGPU e TSL.** O `WebGPURenderer` cai sozinho para WebGL2 quando o aparelho não tem WebGPU. Os shaders escritos em TSL valem para os dois. Em 03/2026 o Chrome 146 lançou o **modo de compatibilidade do WebGPU** (OpenGL ES 3.1) para Android. Segundo o Chrome, 23% dos Androids não têm Vulkan 1.1. O mesmo código, portanto, atende do topo de linha ao aparelho simples. O protótipo do mundo 3D já usa Three.js r187 (`mundo-3d/vendor/`).
3. **Engines de "jogo grande" (Unity 6, Godot 4, Bevy) não servem para o núcleo web.** Elas têm download pesado e WebAssembly no navegador do celular. A Godot não tem WebGPU na web, e C# não exporta para web. O Unity mantém WebGL2 como padrão na web, e o WebGPU dele é opt-in. **Babylon.js** e **PlayCanvas** são alternativas sérias, mas não superam o ecossistema React do projeto (r3f + drei + Next.js + Expo).
4. **Personagens: Rive continua a escolha, agora com *data binding*.** A novidade importante é que as **inputs de state machine estão sendo descontinuadas** no runtime React Native (lançam erro a partir do `@rive-app/react-native` 0.5.0) e foram substituídas por **View Models / data binding**. A boca da Sofia, os olhos, a emoção e o "imitar a criança" devem nascer como propriedades de View Model. Avatar 3D (VRM, TalkingHead) **não** entra para a Sofia, porque a salvaguarda pedagógica (agente 2D ensina melhor) vale.
5. **"A Sofia imita você" não precisa de avatar 3D.** Os 52 blendshapes do **MediaPipe Face Landmarker** (`jawOpen`, `mouthPucker`…) podem ir direto para as propriedades da boca da Sofia no Rive. O resultado é um espelho mágico 2D, leve e 100% no aparelho.
6. **Gaussian Splatting é a tecnologia "uau" de 2026, mas fica como experimento.** O **Spark 2.0** (MIT, World Labs) trouxe LoD contínuo, streaming (`.RAD`) e paginação de memória, e afirma rodar em Android. Serve para **cenários-vitrine** (ex.: uma praia ou feira real "escaneada") no nível alto. Não serve para o mundo principal no aparelho de 2 GB.
7. **IA que gera 3D é útil só no estúdio, e as licenças pedem cuidado.** TRELLIS/TRELLIS.2 e TripoSR são MIT, mas o pipeline de referência do TRELLIS usa o **nvdiffrast (licença NVIDIA não comercial)**. O Hunyuan3D 2.x **exclui UE, Reino Unido e Coreia do Sul** e exige licença acima de 1 milhão de usuários ativos por mês. O Stable Fast 3D é grátis só abaixo de US$ 1 milhão/ano de receita. Uso recomendado: **rascunho e blockout**, sempre retopologizado e pintado no Blender por artista, nunca como asset final direto.
8. **Realidade aumentada é opcional e não pode ser promessa central.** A WebXR AR e o ARCore exigem aparelho certificado, e boa parte dos Androids de entrada não é certificada **[nv: lista exata por modelo]**. O 8th Wall virou open source (MIT) em 02/2026, mas **sem SLAM** no código aberto. A rota barata é o `<model-viewer>`, que abre o Scene Viewer ou o Quick Look do próprio sistema: "levar a Bolota para a sala", só onde houver suporte.
9. **Pipeline de assets é o que faz caber.** Blender → glTF → **glTF-Transform** (Meshopt + KTX2/Basis + redimensionamento por nível) → CDN. Isso reduz de 5 a 10 vezes o peso e a memória de GPU **[nv: medir no nosso asset]**, e é o que viabiliza o modo leve.

---

## 2. O que mudou desde a pesquisa 03

| Item | Antes (pesquisa 03) | Agora (13/11/2026) |
|---|---|---|
| Rive | inputs de state machine (`mouthShape` numérico) | **data binding / View Models**; inputs descontinuadas no runtime RN 0.5+. Há um runtime novo `rive-nitro-react-native` (push hoje) |
| React Native Skia | `Shopify/react-native-skia` | o repositório responde como **`wcandillon/react-native-skia`** (8,8k ⭐) |
| Vision Camera | `mrousavy/react-native-vision-camera` | agora **`margelo/react-native-vision-camera`** (9,7k ⭐) |
| WebGPU no RN | — | **`wcandillon/react-native-webgpu`** (1,3k ⭐, MIT): Three.js/TypeGPU nativos no app |
| WebGPU no Android | Chrome 121+ (Android 12+) | + **modo de compatibilidade** no Chrome 146 (GLES 3.1) para aparelhos sem Vulkan |
| Rapier JS | `dimforge/rapier.js` | repositório **arquivado** em 07/2026 **[nv: provável fusão no monorepo `dimforge/rapier`]** |
| Resonance Audio | — | SDK web e núcleo **arquivados** (2022). Não adotar |
| 8th Wall | produto pago | **open source (MIT)** desde 28/02/2026, sem SLAM; o binário com SLAM tem licença limitada |
| Splats | — | **Spark 2.0** (LoD + streaming `.RAD`); SuperSplat (editor, 10,6k ⭐) |

---

## 3. Tabelas por categoria

Legenda das colunas: **⭐** estrelas no GitHub · **Lic.** licença · **Mat.** maturidade (A = madura e ativa; B = ativa, jovem ou nicho; C = parada ou experimental) · **2 GB** roda no Android de 2 GB?

### 3.1 Renderização 3D (web e mobile)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Three.js** | Motor 3D web, padrão de fato | https://github.com/mrdoob/three.js | 118,3k | MIT | A (push hoje) | modo leve | **Base do mundo 3D** (arquipélago + vila) | API muda a cada release; fixar versão (r187 no protótipo) |
| 2 | **WebGPURenderer + TSL** (no Three.js) | Renderer WebGPU com fallback WebGL2; TSL = shaders em JS que compilam para WGSL e GLSL | https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer | (no three) | MIT | B | modo leve (cai p/ WebGL2) | Escrever água, céu, toon e vento **uma vez** para todos os níveis | Alguns addons ainda só WebGL; testar fallback no Mali |
| 3 | **react-three-fiber** | Three.js declarativo em React | https://github.com/pmndrs/react-three-fiber | 33,7k | MIT | A | modo leve | Mundo dentro do Next.js e do app (via DOM component/WebView) | Overhead de React em cenas com muitos objetos (usar instancing) |
| 4 | **drei** | ~150 utilitários r3f (câmeras, LOD, `PerformanceMonitor`, `Detailed`, `useKTX2`…) | https://github.com/pmndrs/drei | 10,2k | MIT | A | sim | Zoom e ângulos da vila, LOD, ajuste dinâmico de qualidade | Importar só o que usa (tree-shaking) |
| 5 | three-stdlib | Addons do Three em pacote ES | https://github.com/pmndrs/three-stdlib | 0,9k | MIT | B | sim | Dependência indireta do drei | Defasa do Three upstream |
| 6 | Babylon.js | Engine 3D completa web (WebGPU, física, inspector, GUI) | https://github.com/BabylonJS/Babylon.js | 26,3k | Apache-2.0 | A | modo leve | **Alternativa** ao Three se quisermos uma engine com tudo integrado | Bundle maior; ecossistema React menor |
| 7 | BabylonReactNative | Babylon nativo no React Native | https://github.com/BabylonJS/BabylonReactNative | 0,4k | MIT | B | modo leve | Alternativa nativa ao WebView | Pouca adoção |
| 8 | PlayCanvas engine | Engine web leve, forte em mobile, com editor online | https://github.com/playcanvas/engine | 17,3k | MIT (o editor é SaaS) | A | **sim** (histórico mobile) | Alternativa se a equipe preferir editor visual | Editor pago para times; `@playcanvas/react` é novo (0,6k) |
| 9 | Filament (Google) | Renderizador PBR nativo (Android/iOS/WASM) | https://github.com/google/filament | 20,7k | Apache-2.0 | A | sim (nativo) | Referência de qualidade; base do SceneView | Integração web/RN trabalhosa |
| 10 | react-native-filament | Filament no RN | https://github.com/margelo/react-native-filament | 1,4k | MIT | B (push 05/2026) | sim | Cena 3D nativa no app (avaliar) | Mantenedor pequeno |
| 11 | **react-native-webgpu** | WebGPU nativo no RN (roda Three.js/TypeGPU) | https://github.com/wcandillon/react-native-webgpu | 1,3k | MIT | B | modo leve **[nv]** | **Fase 2**: mundo 3D nativo no app, sem WebView | Jovem; depende de Vulkan no aparelho |
| 12 | React Native Skia | Desenho 2D GPU no RN (shaders, atlas) | https://github.com/wcandillon/react-native-skia | 8,8k | MIT | A | sim | Traçado de letras, efeitos 2D na UI do app, mapa 2,5D | — |
| 13 | expo-gl / expo-three | Contexto GL no Expo / ponte Three | https://github.com/expo/expo (expo-gl) · https://github.com/expo/expo-three | 53,5k / 0,9k | MIT | expo-gl A; **expo-three parado (07/2024)** | modo leve | Só se o WebView falhar | expo-three abandonado; GL ES limitado |
| 14 | TypeGPU | WebGPU tipado em TS (Software Mansion), web e RN | https://github.com/software-mansion/TypeGPU | 3,3k | MIT | B | modo leve | Partículas e efeitos compute no app (fase 2) | Exige WebGPU |
| 15 | wgpu | Implementação WebGPU em Rust (base de Firefox/Deno) | https://github.com/gfx-rs/wgpu | 18,5k | Apache-2.0/MIT | A | n/a | Indireto | — |
| 16 | OGL | WebGL minimalista (~30 kB) | https://github.com/oframe/ogl | 4,8k | sem licença detectada **[nv: Unlicense?]** | C (push 04/2025) | sim | Efeitos 2,5D leves em telas de lição | Licença a conferir |
| 17 | A-Frame | Framework WebXR declarativo (HTML) | https://github.com/aframevr/aframe | 17,7k | MIT | B | modo leve | Protótipos rápidos de AR/VR | Pouca performance fina |
| 18 | Needle Engine | Exporta cenas Unity/Blender para Three.js web | https://github.com/needle-tools/needle-engine-support | 0,6k | **licença própria [nv]** | B | modo leve | Fluxo Blender→web com componentes | Licença comercial paga acima de certo porte **[nv]** |
| 19 | Godot 4 | Engine 2D/3D aberta | https://github.com/godotengine/godot | 120,1k | MIT | A | nativo: sim · web: **não** | Só se houver app-jogo separado | Web sem WebGPU; C# não exporta para web; WASM pesado no celular |
| 20 | Unity 6 | Engine comercial líder | https://unity.com (ref.: https://github.com/Unity-Technologies/UnityCsReference, 13,1k) | — | Proprietária (Personal grátis até um teto de receita **[nv: valor atual]**) | A | nativo: sim · web: **não** | Não recomendado | WebGL2 é o padrão na web; WebGPU opt-in; build web grande |
| 21 | Bevy | Engine ECS em Rust | https://github.com/bevyengine/bevy | 49,7k | MIT/Apache-2.0 | B (pré-1.0) | não (web) | Não | API instável, ecossistema mobile imaturo |
| 22 | PixiJS | 2D WebGL/WebGPU | https://github.com/pixijs/pixijs | 48,7k | MIT | A | **sim** | **Plano B do mapa** (2,5D ilustrado) e minijogos | — |

### 3.2 Efeitos visuais ("4D": luz, água, partículas, pós-processamento)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 23 | **postprocessing (pmndrs)** | Pós otimizado: bloom, DOF, SMAA, tone mapping, LUT, vinheta | https://github.com/pmndrs/postprocessing | 3,0k | Zlib | A | **não** (só LUT barata) | Bloom do "brilho de letra conquistada", DOF no zoom da vila (nível alto) | Custo por pixel; desligar no leve |
| 24 | react-postprocessing | Wrapper r3f | https://github.com/pmndrs/react-postprocessing | 1,6k | MIT | A | não | idem | — |
| 25 | Nós de pós em TSL (Three) | Bloom, DOF, AO, outline em nós WebGPU | https://threejs.org/examples/?q=webgpu%20postprocessing | (no three) | MIT | B | não | Rota futura, quando o WebGPURenderer for o padrão | Ainda muda entre versões |
| 26 | N8AO | Oclusão de ambiente (SSAO) de qualidade | https://github.com/N8python/n8ao | 0,5k | CC0 | B | não | Profundidade na vila (alto, meia resolução) | Caro em mobile |
| 27 | realism-effects | SSGI, SSR, TRAA | https://github.com/0beqz/realism-effects | 1,8k | MIT | **C (parado 02/2024)** | não | — | Abandonado |
| 28 | three-good-godrays | Raios de luz volumétricos | https://github.com/Ameobea/three-good-godrays | 0,2k | NOASSERTION | B | não | Amanhecer na ilha (alto) | Licença a conferir |
| 29 | **MeshToonMaterial + gradientMap** (core) | Cel/toon shading nativo | https://threejs.org/docs/#api/en/materials/MeshToonMaterial | (no three) | MIT | A | **sim** | **Estilo "ilustrado quente"** (Proposta 1) no 3D | — |
| 30 | THREE-CustomShaderMaterial | Estende materiais padrão com shader próprio | https://github.com/FarazzShaikh/THREE-CustomShaderMaterial | 1,4k | MIT | A | sim | Vento em folhagem, brilho de fonema | — |
| 31 | tsl-textures | Texturas procedurais em TSL | https://github.com/boytchev/tsl-textures | 0,3k | MIT | B | modo leve | Areia, água e pedra sem baixar textura | Exige TSL |
| 32 | three-stylized-water | Exemplo de água estilizada | https://github.com/norio/three-stylized-water | 0,1k | MIT | C (exemplo) | modo leve | Referência para a água toon (espuma na costa por profundidade) | Pequeno; reescrever em TSL |
| 33 | Water/Water2 (exemplos Three) | Reflexo e refração | https://threejs.org/examples/?q=water | (no three) | MIT | A | **não** (reflexo = 2º render) | Lagoa da ilha no alto | Dobra o custo de render |
| 34 | Sky (exemplo Three) | Céu atmosférico físico (Preetham) | https://threejs.org/examples/#webgl_shaders_sky | (no three) | MIT | A | sim | **Ciclo dia/noite** (sol, cor do céu) | Fazer versão "gradiente" no leve |
| 35 | **three.quarks** | Sistema de partículas (com editor) | https://github.com/Alchemist0823/three.quarks | 1,2k | MIT | B (push 05/2026) | modo leve | Confete, faíscas de letra, chuva, vaga-lumes | Mantenedor único |
| 36 | Three-VFX | VFX para r3f/WebGPU | https://github.com/mustache-dev/Three-VFX | 0,2k | MIT | C | não | Referência | Novo e pequeno |
| 37 | three-mesh-bvh | Raycast e colisão rápidos | https://github.com/gkjohnson/three-mesh-bvh | 3,6k | MIT | A | **sim** | Toque em objetos da vila, câmera sem atravessar casas | — |
| 38 | three-gpu-pathtracer | Path tracing no navegador | https://github.com/gkjohnson/three-gpu-pathtracer | 2,0k | MIT | A | não | **Imagens de marketing** e capas de vídeo (offline) | Não é tempo real |
| 39 | troika-three-text | Texto SDF nítido em 3D | https://github.com/protectwise/troika | 2,0k | MIT | A | sim | Placas da vila, letras flutuantes (fonte Andika) | — |
| 40 | THREE.MeshLine | Linhas grossas | https://github.com/spite/THREE.MeshLine | 2,3k | MIT | B | sim | Trilhas no mapa entre ilhas | — |
| 41 | **detect-gpu** | Classifica a GPU em tiers (0–3) por benchmark | https://github.com/pmndrs/detect-gpu | 1,2k | MIT | A | sim | **Escolha inicial do nível de qualidade** | Base de benchmarks pode não ter GPUs novas |
| 42 | r3f-perf / stats.js | Medidores de FPS, draw calls e memória | https://github.com/utsuboco/r3f-perf · https://github.com/mrdoob/stats.js | 0,8k / 9,2k | MIT | C (parados) | sim | Debug e laboratório de aparelhos | Só desenvolvimento |
| 43 | leva | Painel de ajustes ao vivo | https://github.com/pmndrs/leva | 6,3k | MIT | B | n/a | Artistas ajustam luz e cor no navegador | Só desenvolvimento |

### 3.3 Física

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 44 | **Rapier** | Física 2D/3D em Rust/WASM, determinística | https://github.com/dimforge/rapier | 6,1k | Apache-2.0 | A | modo leve (poucos corpos) | Objetos que quicam na vila, letras-blocos empilháveis | `rapier.js` arquivado: confirmar o pacote npm atual **[nv]** |
| 45 | react-three-rapier | Rapier em r3f | https://github.com/pmndrs/react-three-rapier | 1,6k | MIT | A | modo leve | idem | — |
| 46 | cannon-es | Física JS pura | https://github.com/pmndrs/cannon-es | **não capturado** (a busca devolveu 422) | MIT **[nv]** | C **[nv]** | sim | Não | Manutenção baixa; preferir Rapier |
| 47 | Jolt Physics | Física de AAA (Horizon Forbidden West) | https://github.com/jrouwe/JoltPhysics | 12,3k | MIT | A | modo leve | Não precisa agora | WASM maior (~1 MB+ **[nv]**) |
| 48 | JoltPhysics.js | Jolt em WASM | https://github.com/jrouwe/JoltPhysics.js | 0,6k | MIT | B | modo leve | Reserva | — |

> Física "de verdade" quase não é necessária para crianças de 4–8 anos. A maior parte do "movimento vivo" sai mais barata com **animação procedural** (molas, `maath`/`react-spring`) do que com simulação.

### 3.4 Animação e movimento (UI, câmera, cinemática)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 49 | GSAP | Timeline de animação (agora grátis, plugins incluídos) | https://github.com/greensock/GSAP | 30,6k | **licença própria "no charge"** (não OSI) **[nv: termos atuais]** | A | sim | Voo de câmera entre ilhas, entradas de tela | Licença não-OSI; ler termos |
| 50 | Motion (ex-Framer Motion) | Animação de UI React | https://github.com/motiondivision/motion | 35,1k | MIT | A | sim | Transições web | — |
| 51 | react-spring | Animação por molas (física de UI) | https://github.com/pmndrs/react-spring | 29,3k | MIT | A | sim | "Elasticidade" nos objetos 3D (r3f) | — |
| 52 | Theatre.js | Editor de sequências/cinemáticas para Three | https://github.com/theatre-js/theatre | 13,0k | Apache-2.0 (estúdio AGPL **[nv]**) | **C (parado 08/2024)** | sim | Cutscenes de chegada à ilha | Parado; conferir licença do estúdio |
| 53 | Reanimated | Animação nativa 60 fps no RN | https://github.com/software-mansion/react-native-reanimated | 11,1k | MIT | A | sim | UI do app | — |
| 54 | Gesture Handler | Gestos nativos | https://github.com/software-mansion/react-native-gesture-handler | 6,8k | MIT | A | sim | Pinça para zoom na vila, arrastar | — |

### 3.5 Animação de personagem e lip-sync

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 55 | **Rive runtime (C++)** | Vetores animados com state machines + **data binding** | https://github.com/rive-app/rive-runtime | 1,3k | MIT (editor SaaS) | A | **sim** | **Sofia e Bolota** (todas as telas) | Editor pago; migrar de inputs para View Models |
| 56 | Rive web (WASM) / React | Runtime web | https://github.com/rive-app/rive-wasm · https://github.com/rive-app/rive-react | 1,0k / 1,2k | MIT | A | sim | Sofia no Next.js; **Sofia como textura dentro do 3D** (canvas → `CanvasTexture`) | Custo de upload de textura por frame: limitar FPS da textura |
| 57 | Rive React Native (+ Nitro) | Runtime no app | https://github.com/rive-app/rive-react-native · https://github.com/rive-app/rive-nitro-react-native | 0,8k / 0,2k | MIT | A / B | sim | Sofia no app | Transição para o runtime Nitro **[nv: qual será o oficial]** |
| 58 | **dotLottie web / dotlottie-rs** | Player .lottie moderno (state machines, temas) | https://github.com/LottieFiles/dotlottie-web · https://github.com/LottieFiles/dotlottie-rs | 0,9k / 0,3k | MIT | A | sim | Celebrações, emblemas da lojinha, ícones animados | — |
| 59 | Lottie web | Player clássico After Effects | https://github.com/airbnb/lottie-web | 32,4k | MIT | B (push 09/2025) | sim | Legado; preferir dotLottie | Ritmo de manutenção caindo |
| 60 | lottie-react-native / lottie-android | Lottie nativo | https://github.com/lottie-react-native/lottie-react-native · https://github.com/airbnb/lottie-android | 17,2k / 35,8k | Apache-2.0 | A | sim | Celebrações no app | — |
| 61 | Spine runtimes | Animação esquelética 2D profissional | https://github.com/EsotericSoftware/spine-runtimes | 5,4k | **Spine Runtimes License** (exige licença do editor) | A | sim | Só se contratarmos animador Spine | Custo por licença; não é aberta |
| 62 | pixi-spine | Spine no PixiJS | https://github.com/pixijs-userland/spine | 0,6k | NOASSERTION | C (03/2025) | sim | idem | — |
| 63 | Live2D Cubism Web | Ilustração 2D "viva" (estilo VTuber) | https://github.com/Live2D/CubismWebFramework | 0,2k | **licença Live2D**: grátis abaixo de ¥10 mi/ano; acima, Publication License | A | modo leve | Sofia com "respiração" e parallax de ilustração | Custo e licença; overlap com Rive |
| 64 | pixi-live2d-display | Live2D no Pixi | https://github.com/guansss/pixi-live2d-display | 1,5k | MIT | C (08/2024) | modo leve | — | Parado |
| 65 | three-vrm | Avatares VRM 3D | https://github.com/pixiv/three-vrm | 2,3k | MIT | A | modo leve | **Não para a Sofia** (salvaguarda 2D). Talvez figurantes na vila | Pesado; risco pedagógico |
| 66 | TalkingHead | Avatar 3D falante com lip-sync | https://github.com/met4citizen/TalkingHead | 1,7k | MIT | B | não | Referência técnica de visemas | 3D pesado |
| 67 | Rhubarb Lip Sync | Áudio → formas de boca A–H/X | https://github.com/DanielSWolf/rhubarb-lip-sync | 2,8k | "Other" (**conferir LICENSE.md**) | B (push 06/2026) | n/a (offline) | Bocas das falas gravadas por humanos (`--recognizer phonetic`) | Licença a confirmar |
| 68 | wawa-lipsync / HeadAudio | Visemas em tempo real a partir do áudio | https://github.com/wass08/wawa-lipsync · https://github.com/met4citizen/HeadAudio | 0,2k / 0,1k | MIT | B | sim | Fallback para falas dinâmicas | Precisão modesta |

### 3.6 Captura de rosto, mãos e corpo (Espelho do Som, "a Sofia imita você")

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 69 | **MediaPipe Face Landmarker** | 478 pontos + 52 blendshapes, on-device | https://github.com/google-ai-edge/mediapipe | 37,7k | Apache-2.0 | A | **modo leve** (vídeo 256–320 px, 15 fps, delegate CPU se a GPU falhar) **[nv: medir]** | **Espelho do Som** (forma da boca) e **Sofia imita você** (blendshapes → Rive) | Dados biométricos de criança: opt-in, nada sai do aparelho |
| 70 | MediaPipe Hand/Pose Landmarker | Mãos (21 pontos) e corpo (33 pontos) | (mesmo repo) | — | Apache-2.0 | A | modo leve (Hand) · não (Pose + Face juntos) | "Desenhar a letra no ar", gestos de "oi" para a Bolota | Dois modelos simultâneos estouram o 2 GB |
| 71 | Kalidokit | Landmarks → rotações e blendshapes de avatar | https://github.com/yeemachine/kalidokit | 5,7k | MIT | C (push 08/2025, pouco ativo) | sim | Suavização e mapeamento para a Sofia 2D | Pouca manutenção; lógica é pequena, dá para internalizar |
| 72 | Vision Camera | Câmera RN com frame processors | https://github.com/margelo/react-native-vision-camera | 9,7k | MIT | A | modo leve | MediaPipe nativo no app | Plugins de face de terceiros |
| 73 | vision-camera-face-detector | ML Kit face no Vision Camera | https://github.com/luicfrr/react-native-vision-camera-face-detector | 0,3k | MIT | B | sim | Fallback leve (contornos da boca, sem blendshapes) | Menos rico que o MediaPipe |
| 74 | ONNX Runtime (web/mobile) | Inferência de modelos próprios | https://github.com/microsoft/onnxruntime | 22,3k | MIT | A | modo leve | Classificador próprio de forma de boca, se os blendshapes não bastarem | — |
| 75 | TF.js models | Modelos de visão prontos | https://github.com/tensorflow/tfjs-models | 14,8k | Apache-2.0 | B | modo leve | Reserva | TF.js com menos investimento |

### 3.7 Gaussian Splatting e NeRF (captura fotorrealista)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 76 | **Spark (World Labs)** | Splats em Three.js; v2 com LoD contínuo, streaming `.RAD` e paginação de memória | https://github.com/sparkjsdev/spark | 3,9k | MIT | B | **não** (alegação de rodar em Android sem benchmark independente) | Cenário-vitrine fotorreal (nível alto), mistura splat + malha | Ordenação de splats pesa em GPU fraca; estilo fotorreal destoa do ilustrado |
| 77 | GaussianSplats3D (mkkellogg) | Visualizador de splats para Three | https://github.com/mkkellogg/GaussianSplats3D | 3,0k | MIT | C (push 10/2025) | não | — | Desacelerou; preferir Spark |
| 78 | gsplat.js (Hugging Face) | Biblioteca de splats web | https://github.com/huggingface/gsplat.js | 1,7k | MIT | B | não | — | — |
| 79 | antimatter15/splat | Visualizador WebGL mínimo | https://github.com/antimatter15/splat | 3,1k | MIT | C | não | Referência | — |
| 80 | **SuperSplat (PlayCanvas)** | Editor de splats no navegador (limpar, cortar, comprimir) | https://github.com/playcanvas/supersplat | 10,6k | MIT | A | n/a | Limpar capturas antes de publicar | — |
| 81 | gaussian-splatting (Inria) | Treino original 3DGS | https://github.com/graphdeco-inria/gaussian-splatting | 24,5k | **Inria, não comercial** | B | n/a | **Não usar** para produto | Licença |
| 82 | gsplat (nerfstudio) | Treino de splats CUDA | https://github.com/nerfstudio-project/gsplat | 5,9k | Apache-2.0 | A | n/a | **Rota comercial** para treinar capturas | Exige GPU NVIDIA |
| 83 | nerfstudio | Framework NeRF | https://github.com/nerfstudio-project/nerfstudio | 12,2k | Apache-2.0 | C (push 07/2025) | não | Não (NeRF superado por splats para tempo real) | Parado |

### 3.8 Geração de 3D por IA (estúdio, não roda no aparelho)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Uso comercial? | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|
| 84 | TRELLIS | Imagem/texto → malha 3D texturizada | https://github.com/microsoft/TRELLIS | 14,3k | MIT | **Código e pesos sim; o pipeline usa nvdiffrast (NVIDIA, não comercial)** | Blockout de props (cerca, barco, barraca) | Trocar o rasterizador ou usar a integração ComfyUI sem nvdiffrast **[nv]** |
| 85 | TRELLIS.2 | Versão 4B com PBR | https://github.com/microsoft/TRELLIS.2 | 12,9k | MIT | idem | idem, com mais qualidade | idem |
| 86 | Hunyuan3D-2 / 2.1 | Forma + textura PBR | https://github.com/Tencent-Hunyuan/Hunyuan3D-2 · https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 | 15,4k / 4,4k | Tencent Community | **Sim, fora de UE/UK/Coreia do Sul e abaixo de 1 mi MAU** | Concept 3D rápido | Território e MAU; jurídico deve ler |
| 87 | TripoSR | Imagem → malha em menos de 1 s | https://github.com/VAST-AI-Research/TripoSR | 7,4k | MIT | **Sim** | Rascunho rápido | Qualidade de topologia baixa |
| 88 | Stable Fast 3D / SPAR3D | Imagem → malha UV-mapeada | https://github.com/Stability-AI/stable-fast-3d · https://github.com/Stability-AI/stable-point-aware-3d | 1,9k / 1,1k | Stability Community | **Só abaixo de US$ 1 mi/ano de receita** (texto ambíguo) | Rascunho | Licença muda com o porte |
| 89 | Wonder3D | Multi-view → malha (pesquisa) | https://github.com/xxlong0/Wonder3D | 5,5k | MIT | Sim (código) **[nv: pesos]** | Não | Pesquisa, parado |

> **Regra para IA 3D:** nenhum personagem principal (Sofia, Bolota) é gerado por IA. Para props, a IA faz o rascunho e um artista no Blender retopologiza, pinta no estilo FONEMA e otimiza. Cada asset registra o modelo e a licença usados (planilha de proveniência).

### 3.9 Realidade aumentada

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 90 | **`<model-viewer>`** | Visualizador glTF web; botão AR abre Scene Viewer (Android) e Quick Look (iOS) | https://github.com/google/model-viewer | 8,3k | Apache-2.0 | A | visualizar: sim · AR: **só aparelho ARCore** | "Leve a Bolota/o emblema para a sua sala" | Cobertura baixa em aparelhos de entrada |
| 91 | WebXR Device API | Padrão de AR/VR web (`immersive-ar`) | https://github.com/immersive-web/webxr | 3,2k | W3C | A (Chrome Android) | só com ARCore | Base do AR web | iOS Safari sem WebXR AR **[nv: status 2026]** |
| 92 | pmndrs/xr | WebXR para r3f | https://github.com/pmndrs/xr | 2,6k | NOASSERTION **[nv: MIT]** | A | só com ARCore | AR dentro do nosso r3f | — |
| 93 | ARCore SDK | AR nativo Android | https://github.com/google-ar/arcore-android-sdk | 5,3k | licença Google **[nv]** | A | **lista de aparelhos certificados** | App nativo | Muitos 2 GB fora da lista |
| 94 | ViroReact | AR/VR em React Native (ARCore/ARKit), mantido pela ReactVision | https://github.com/ReactVision/viro | 1,8k | MIT | B (push hoje) | só com ARCore | AR no app Expo (dev build) | Comunidade pequena |
| 95 | SceneView | 3D/AR Android (Filament + ARCore) | https://github.com/sceneview/sceneview | 1,4k | Apache-2.0 | A | só com ARCore | Alternativa nativa | Kotlin, fora do stack JS |
| 96 | 8th Wall (open source) | WebAR sem app: face, image targets, céu | https://github.com/8thwall/engine | 0,2k | **MIT (framework); binário com SLAM sob licença limitada** | B (recém-aberto) | modo leve (face/imagem) | Image target: apontar a câmera para o **cartaz da sala** e a Sofia aparece | Sem SLAM no aberto; comunidade em formação |
| 97 | AR.js (org) | AR por marcadores e localização | https://github.com/AR-js-org/AR.js | 6,0k | MIT | B | sim (marcador) | Marcador impresso no caderno → letra 3D (funciona sem ARCore) | Qualidade de rastreio modesta |
| 98 | MindAR | Image/face tracking web | https://github.com/hiukim/mind-ar-js | 2,8k | MIT | **C (parado 06/2024)** | modo leve | — | Parado |

### 3.10 Áudio espacial

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 99 | **Web Audio `PannerNode` (HRTF)** | Som 3D nativo do navegador | https://developer.mozilla.org/docs/Web/API/PannerNode | padrão | — | A | sim (`equalpower` no leve) | Sons da vila vindo de onde estão (galo, mar, feira) | HRTF custa CPU; limitar fontes |
| 100 | **Howler.js (plugin spatial)** | Áudio web com sprites + posição 3D | https://github.com/goldfire/howler.js | 25,4k | MIT | B (push 11/2025) | sim | Já adotado; usar `pos()`/`orientation()` | Manutenção lenta |
| 101 | THREE.PositionalAudio | Áudio preso a objetos 3D | https://threejs.org/docs/#api/en/audio/PositionalAudio | (no three) | MIT | A | sim | Som acompanha a câmera da vila | — |
| 102 | Omnitone | Áudio ambisônico/binaural | https://github.com/GoogleChrome/omnitone | 0,9k | Apache-2.0 | B | modo leve | Ambiente 360° gravado de cada bioma (nível alto) | Assets ambisônicos maiores |
| 103 | Resonance Audio (web/núcleo) | Acústica de sala | https://github.com/resonance-audio/resonance-audio-web-sdk | 0,2k / 0,5k | Apache-2.0 | **arquivado** | — | **Não** | Abandonado |
| 104 | Tone.js | Síntese e música procedural | https://github.com/Tonejs/Tone.js | 14,9k | MIT | A | sim | Trilha que muda com o dia/noite e a ilha | — |

### 3.11 Háptico (vibração)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 105 | Vibration API (`navigator.vibrate`) | Padrões de vibração na web | https://developer.mozilla.org/docs/Web/API/Vibration_API | padrão | — | A no Android · **sem suporte no iOS Safari** | sim | "Toc" ao encaixar sílaba, ritmo de sílabas (pa-ta-ca) | Desligável pelo responsável; não usar como único feedback |
| 106 | **expo-haptics** | Háptico iOS/Android no Expo | https://github.com/expo/expo (packages/expo-haptics) | 53,5k (monorepo) | MIT | A | sim (motor simples) | Feedback de acerto, contagem de sílabas | Motores baratos são "zumbido" pouco expressivo |
| 107 | react-native-haptic-feedback | Háptico com tipos nativos | https://github.com/mkuczera/react-native-haptic-feedback | 1,0k | MIT | A | sim | Alternativa | — |
| 108 | react-native-nitro-haptics | Háptico via Nitro (baixa latência) | https://github.com/oblador/react-native-nitro-haptics | 0,2k | MIT | B | sim | Alternativa de latência mínima | Jovem |

### 3.12 Gráficos de dados (painéis 3D elegantes)

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 109 | **Apache ECharts** | Gráficos web completos (canvas/SVG) | https://github.com/apache/echarts | 67,7k | Apache-2.0 | A | sim | Base dos painéis (já em `paineis/vendor/`) | Bundle grande: importar módulos |
| 110 | **ECharts GL** | Barras 3D, superfícies, globo, mapas 3D | https://github.com/ecomfe/echarts-gl | 2,7k | BSD-3-Clause | A | modo leve | "Relevo" da rede (secretaria), mapa 3D de escolas | 3D distorce leitura: **sempre** número visível |
| 111 | deck.gl | Camadas geoespaciais WebGL/WebGPU | https://github.com/visgl/deck.gl | 14,8k | MIT | A | modo leve | Mapa da rede municipal (colunas 3D por escola) | Precisa de basemap (MapLibre) |
| 112 | Plotly.js | Gráficos científicos, 3D | https://github.com/plotly/plotly.js | 18,4k | MIT | A | **não** (bundle ~3 MB+) | Só análises internas | Pesado |
| 113 | visx | Primitivas D3 + React | https://github.com/airbnb/visx | 21,1k | MIT | A | sim | Gráficos 2D sob medida (curvas de progresso) | Mais código |
| 114 | Nivo | Gráficos React prontos | https://github.com/plouc/nivo | 14,1k | MIT | A | sim | Alternativa rápida | — |
| 115 | Recharts | Gráficos React simples | https://github.com/recharts/recharts | 27,7k | MIT | A | sim | Painel da família (leve) | Visual básico |
| 116 | react-native-echarts | ECharts no app (Skia/SVG) | https://github.com/wuba/react-native-echarts | 1,0k | Apache-2.0 | B | sim | Painel do professor no app | — |
| 117 | react-native-graph | Linha animada com Skia | https://github.com/margelo/react-native-graph | 2,6k | MIT | A | sim | Mini-gráfico de evolução da criança | — |
| 118 | vtk.js | Visualização científica 3D | https://github.com/Kitware/vtk-js | 1,5k | BSD-3-Clause | A | não | **Não** (excesso) | — |

### 3.13 Pipeline de assets, compressão e streaming

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 119 | **glTF 2.0** | Formato padrão de cena 3D | https://github.com/KhronosGroup/glTF | 7,9k | Khronos (spec) | A | sim | Formato único de todos os modelos | — |
| 120 | **glTF-Transform** | CLI/SDK: prune, dedup, weld, simplify, Meshopt/Draco, KTX2, resize | https://github.com/donmccurdy/glTF-Transform | 2,1k | MIT | A | n/a | **Coração do pipeline**: gera as variantes alto/médio/leve | — |
| 121 | **meshoptimizer** | Simplificação, quantização e compressão de malha | https://github.com/zeux/meshoptimizer | 8,8k | MIT | A | sim (decoder rápido) | Compressão padrão de geometria | — |
| 122 | Draco | Compressão de geometria | https://github.com/google/draco | 7,6k | Apache-2.0 | A | sim (decoder WASM) | Alternativa; Meshopt decodifica mais rápido **[nv: no nosso asset]** | Decoder WASM extra |
| 123 | **KTX-Software / KTX2** | Contêiner de textura GPU | https://github.com/KhronosGroup/KTX-Software | 1,4k | NOASSERTION (Apache-2.0 na maior parte **[nv]**) | A | **sim, e essencial** | Texturas ficam comprimidas **na GPU** (ETC1S/UASTC), poupando RAM | — |
| 124 | Basis Universal | Supercompressão transcodificada para ETC/ASTC/BC | https://github.com/BinomialLLC/basis_universal | 3,1k | Apache-2.0 | A | sim | Codificador do KTX2 | — |
| 125 | gltf-pipeline | Otimização glTF (Cesium) | https://github.com/CesiumGS/gltf-pipeline | 2,1k | Apache-2.0 | B | n/a | Reserva | — |
| 126 | gltfjsx | glTF → componente React | https://github.com/pmndrs/gltfjsx | 5,9k | MIT | C (11/2024) | n/a | Gerar componentes da vila | Parado; ainda funcional |
| 127 | glTF Sample Viewer | Visualizador de referência | https://github.com/KhronosGroup/glTF-Sample-Viewer | 1,5k | Apache-2.0 | A | n/a | QA de assets | — |
| 128 | 3D Tiles + 3DTilesRendererJS | Streaming hierárquico de cenas enormes | https://github.com/CesiumGS/3d-tiles · https://github.com/NASA-AMMOS/3DTilesRendererJS | 2,6k / 2,5k | spec / Apache-2.0 | A | modo leve | **Não precisa agora** (11 ilhas pequenas cabem em glTF por ilha); reavaliar se o mundo crescer | Complexidade |
| 129 | CesiumJS | Globo 3D / geoespacial | https://github.com/CesiumGS/cesium | 15,9k | Apache-2.0 | A | não | Não | Excesso |

### 3.14 Ferramentas de criação

| # | Tecnologia | O que faz | URL | ⭐ | Lic. | Mat. | 2 GB | Uso no FONEMA | Risco |
|---|---|---|---|---|---|---|---|---|---|
| 130 | **Blender** | Modelagem, rig, bake de luz, export glTF | https://github.com/blender/blender | 21,9k | GPL (os arquivos produzidos são do autor) | A | n/a | **Ferramenta principal**: ilhas, vila, lightmaps (bake do dia e da noite) | — |
| 131 | Spline | Editor 3D web colaborativo | https://spline.design · https://github.com/splinetool/react-spline | 1,4k (wrapper) | wrapper MIT; **runtime e editor proprietários** | A | modo leve | Protótipos de UI 3D (botões da lojinha) | Lock-in; runtime pesado **[nv]** |
| 132 | Womp | Modelagem 3D por SDF no navegador | https://womp.com | — | SaaS proprietário | B | n/a | Ideação rápida de objetos fofos | **Sem GitHub**; termos de export a conferir |
| 133 | Rive Editor / LottieFiles Creator | Editores das animações 2D | https://rive.app · https://lottiefiles.com | — | SaaS | A | n/a | Sofia, Bolota, emblemas | Assinatura |
| 134 | Godot/Unity como editor de cena | Montar a vila e exportar glTF | (ver 3.1) | — | — | A | n/a | Opcional para level design | Duplicidade de ferramentas |

**Total: 134 entradas** (algumas linhas agrupam pacotes irmãos).

---

## 4. RADAR

Anéis: **ADOTAR** (usar desde o MVP) · **EXPERIMENTAR** (protótipo com orçamento e prazo) · **AVALIAR** (acompanhar e testar em spike) · **EVITAR** (não usar no produto). Veja também a imagem [`radar-tecnologia.png`](radar-tecnologia.png) (fonte editável: [`radar-tecnologia.html`](radar-tecnologia.html), capturada com Playwright em escala 2x).

| Setor | ADOTAR | EXPERIMENTAR | AVALIAR | EVITAR |
|---|---|---|---|---|
| **Mundo 3D** | Three.js · WebGPURenderer + TSL (com fallback WebGL2) · r3f + drei · three-mesh-bvh · troika-text · detect-gpu | react-native-webgpu (fase 2) · PixiJS 2,5D (plano B) | Babylon.js · PlayCanvas · react-native-filament · TypeGPU | Unity 6 web · Godot web · Bevy · expo-three |
| **Personagens** | Rive (data binding) · dotLottie | Rive como textura no 3D · Rhubarb · wawa-lipsync | Live2D · Spine | three-vrm/TalkingHead para a Sofia · Lottie web legado |
| **Efeitos "4D"** | MeshToonMaterial · céu e dia/noite · postprocessing (só nível alto) · react-spring/GSAP | three.quarks · Rapier · água toon em TSL · N8AO | Theatre.js · Jolt · god rays | realism-effects · cannon-es · Water2 reflexivo no leve |
| **Sentidos "5D"** | Web Audio/Howler espacial · expo-haptics + Vibration API · MediaPipe Face (opt-in) | Sofia imita você (blendshapes → Rive) · `<model-viewer>` AR · AR.js com marcador no caderno | 8th Wall OSS · ViroReact · Omnitone · MediaPipe Hand | Resonance Audio · MindAR · enviar vídeo à nuvem |
| **Dados** | ECharts · ECharts GL (com números visíveis) · Recharts/visx | deck.gl (mapa da rede) · react-native-echarts | Nivo | Plotly 3D · vtk.js · barras 3D sem rótulo |
| **Assets e IA** | Blender · glTF · glTF-Transform · Meshopt · KTX2/Basis | Spark (cenário-vitrine) · SuperSplat · TripoSR | TRELLIS.2 · Hunyuan3D · SF3D · Spline · 3D Tiles | NeRF · Inria 3DGS (licença) · asset de IA direto sem retopologia |

---

## 5. Stack gráfica recomendada

```
┌────────────────────────── FONEMA — pilha gráfica em camadas ──────────────────────────┐
│ 6 · DADOS        ECharts (+GL)  ·  Recharts/visx  ·  deck.gl (mapa da rede)             │
│ 5 · SENTIDOS     Howler/WebAudio espacial · expo-haptics/vibrate · MediaPipe Face (opt-in)│
│                  · <model-viewer> AR (onde houver ARCore/Quick Look)                   │
│ 4 · EFEITOS 4D   céu+sol (dia/noite) · toon + lightmaps · three.quarks · molas/GSAP    │
│                  · pós (bloom/DOF/AO) só no ALTO · Rapier sob demanda                   │
│ 3 · PERSONAGENS  Rive (View Models: boca, olhar, emoção, imitar) · dotLottie (festa)   │
│ 2 · MUNDO 3D     Three.js r18x · WebGPURenderer→WebGL2 · TSL · r3f + drei              │
│                  web: Next.js │ app: Expo DOM component/WebView (fase 1)                │
│                                     → react-native-webgpu (fase 2, se medir melhor)     │
│ 1 · ASSETS       Blender → glTF → glTF-Transform (Meshopt + KTX2 + LOD por nível) → CDN │
│ 0 · QUALIDADE    detect-gpu + deviceMemory + FPS ao vivo → nível ALTO/MÉDIO/LEVE/2,5D   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Mundo 3D
- **Three.js + r3f + drei** dentro de um pacote `packages/world` compartilhado por web e app. O WebGPU é usado quando disponível e estável; senão, WebGL2. Os shaders próprios (água, céu, vento, brilho de letra) são escritos **em TSL**, para não manter duas versões.
- **Arquipélago:** cada uma das 11 ilhas é um glTF independente, carregado sob demanda. Ilhas distantes viram **impostores** (sprite pré-renderizado). Na vila, o zoom usa `drei/Detailed` (LOD) com 3 malhas por prédio.
- **No app:** fase 1 roda o mesmo mundo num Expo DOM component/WebView (uma só base de código, como já previa a pesquisa 03). Fase 2 testa `react-native-webgpu` só se o laboratório de aparelhos mostrar ganho real de FPS e memória.
- **Plano B (sem 3D):** um mapa 2,5D em PixiJS, renderizado a partir das **mesmas cenas do Blender** (imagens em camadas com parallax). A criança nunca fica sem acesso ao conteúdo.

### 5.2 Personagens (2D de alta qualidade sobre o 3D)
- **Sofia e Bolota em Rive**, com um View Model padronizado:

  | Propriedade | Tipo | Exemplo de uso |
  |---|---|---|
  | `boca` | enum (9 visemas) | Lip-sync das falas |
  | `aberturaMandibula` | número | Valor vindo do MediaPipe no modo "imitar" |
  | `bico` | número | Valor vindo do MediaPipe no modo "imitar" |
  | `sorriso` | número | Valor vindo do MediaPipe no modo "imitar" |
  | `olharX`, `olharY` | números | Direção do olhar |
  | `emocao` | enum | Estado emocional |
  | `roupa` | imagem | Item ganho na lojinha (data binding de imagens) |

- **Dentro do mundo 3D**, os personagens aparecem como **"recorte de papel"**: o canvas do Rive vira `CanvasTexture` num plano voltado para a câmera, com sombra de contato. É 2D bonito integrado ao 3D, sem violar a salvaguarda pedagógica.
- **Celebrações e emblemas** ficam em dotLottie, com temas de cor por ilha.

### 5.3 Efeitos "4D" (tempo e movimento)
- **Dia/noite e clima:** um único relógio do mundo controla a direção e a cor do sol, o gradiente do céu, a névoa, as luzes das casas e a mistura entre dois lightmaps (dia e noite, com bake no Blender). No nível leve só mudam cor e gradiente, sem sombra dinâmica.
- **Água estilizada:** shader TSL com faixa de espuma pela profundidade e ondas por vértice. Reflexo real só no alto.
- **Partículas:** three.quarks (confete, faíscas, vaga-lumes, chuva), com orçamento por nível.
- **Movimento vivo:** molas (react-spring) e balanço de vegetação por vertex shader. Rapier só em atividades específicas (empilhar blocos de sílaba), carregado sob demanda.
- **Câmera cinematográfica:** voos entre ilhas com GSAP ou Theatre.js, sempre curtos (≤ 2 s) e puláveis.

### 5.4 Sentidos "5D"
- **Áudio espacial:** cada fonte da vila (mar, feira, animais) é uma `PositionalAudio`. Usa HRTF no alto e `equalpower` no médio e no leve. **A voz da Sofia nunca é espacializada**: fica sempre centralizada e clara.
- **Háptico:** padrões curtos e consistentes:

  | Padrão | Duração | Quando |
  |---|---|---|
  | Acerto | 1 toque de 20 ms | Resposta certa |
  | Ritmo de sílabas | 1 toque por sílaba | Contar sílabas |
  | Conquista | Padrão longo | Emblema ganho |

  Pode ser desligado no painel da família. No iOS web não há vibração; o app nativo cobre esse caso.
- **Câmera (opt-in do responsável):**
  - **Espelho do Som:** MediaPipe Face (forma da boca) mais o corte lateral animado.
  - **A Sofia imita você:** blendshapes → View Model do Rive, a 15–30 fps. Nenhum frame sai do aparelho.
- **AR (bônus, não essencial):**
  - "Leve a Bolota para casa" com `<model-viewer>` (Scene Viewer/Quick Look);
  - nas escolas, cartaz da sala com image target (8th Wall OSS ou AR.js), que funciona sem ARCore.

### 5.5 Gráficos de dados
- ECharts como base. O 3D (ECharts GL, deck.gl) é usado **só onde o espaço importa**, como o mapa da rede, o relevo de habilidades por turma e a evolução no tempo, e sempre com **rótulo numérico** e alternativa 2D com um toque (Decisão 005). No celular do professor, os painéis abrem em 2D por padrão.

### 5.6 Pipeline de assets
1. **Blender**: modelagem low-poly estilizada, UVs, bake de AO e luz (dia e noite), export glTF.
2. **glTF-Transform** (CI): `prune → dedup → weld → simplify (por nível) → meshopt → ktx2 (ETC1S para cor, UASTC para normal/UI) → resize (2048/1024/512)`. Gera `ilha-X.alto.glb`, `ilha-X.medio.glb` e `ilha-X.leve.glb`.
3. **Orçamento automático no CI:** o build falha se um asset passar do orçamento do nível (tabela 6.1).
4. **CDN** com cache imutável (hash no nome). Service Worker pré-carrega a ilha atual e a próxima.
5. **IA 3D** só em `assets/rascunhos/`, com proveniência registrada. Nada entra em `assets/final/` sem passar pelo artista.

---

## 6. Qualidade adaptativa por aparelho

### 6.1 Níveis e orçamentos (valores iniciais, a calibrar no laboratório de aparelhos)

| Item | **ALTO** | **MÉDIO** | **LEVE** (alvo: Android 2 GB) | **2,5D** (sem 3D) |
|---|---|---|---|---|
| Perfil típico | ≥ 6 GB, GPU tier 3, WebGPU | 3–4 GB, tier 2, WebGL2 | ≤ 2–3 GB, tier 0–1, WebGL2 | WebGL indisponível ou FPS < 20 sustentado |
| Renderer | WebGPU (fallback WebGL2) | WebGL2 | WebGL2 | PixiJS/Canvas |
| Resolução (DPR) | até 2,0 | 1,5 | 1,0 com escala dinâmica 0,7–1,0 | 1,0 |
| Meta de FPS | 60 | 45–60 | 30 (travado) | 30 |
| Triângulos visíveis | ≤ 500 mil | ≤ 200 mil | ≤ 80 mil | — |
| Draw calls | ≤ 300 | ≤ 120 | ≤ 60 (instancing e atlas) | — |
| Memória de textura (GPU) | ≤ 256 MB | ≤ 128 MB | ≤ 48 MB (KTX2 ETC1S, máx. 1024 px) | ≤ 32 MB |
| Download por ilha | ≤ 15 MB | ≤ 8 MB | ≤ 3 MB | ≤ 1,5 MB |
| Sombras | dinâmicas suaves (2048, PCF) | só sol, 1024 | **baked** + sombra-bolha | pintadas |
| Pós-processamento | bloom, DOF no zoom, AO meia-res, LUT | bloom meia-res, LUT | nenhum (cor "assada" nas texturas) | — |
| Água | toon + reflexo + espuma | toon + espuma | cor por vértice + UV animado | sprite animado |
| Partículas | até 20 mil | até 3 mil | até 300 | Lottie |
| Dia/noite | sol dinâmico + 2 lightmaps + estrelas | gradiente + 2 lightmaps | gradiente + troca de lightmap | 2 ilustrações |
| Splats / vitrine | permitido | não | não | não |
| Áudio | HRTF, até 16 fontes | equalpower, 8 fontes | estéreo, 4 fontes | estéreo |
| Câmera (MediaPipe) | 30 fps, 640 px | 20 fps, 320 px | 15 fps, 256 px, só no Espelho | idem leve |
| AR | sim, se houver suporte | sim, se houver suporte | não oferecido | não |
| Ilhas em memória | atual + vizinhas | atual + 1 | **só a atual** | — |

### 6.2 Como o nível é escolhido
1. **Na primeira abertura (estático):** `detect-gpu` (tier), mais `navigator.deviceMemory`, `hardwareConcurrency`, existência de `navigator.gpu`, `Save-Data` e o tipo de rede, mais uma cena de teste de 3 s. Resultado: nível inicial, salvo no aparelho.
2. **Durante o uso (dinâmico):** o `PerformanceMonitor` (drei) ou um medidor próprio olha o tempo médio de frame:
   - acima de 40 ms por 3 s: **desce** um degrau (primeiro a escala de resolução, depois os efeitos, depois o nível);
   - abaixo de 14 ms por 10 s: sobe, com histerese para não ficar oscilando.
3. **Sinais de memória:** perda de contexto WebGL (`webglcontextlost`) ou erro de alocação forçam o nível leve e recarregam a ilha.
4. **Escolha humana:** o painel da família e o modo sala têm a opção "Economia de bateria e dados", que fixa o nível leve. O professor pode fixar o nível da turma no laboratório da escola.
5. **Telemetria agregada** (sem dado pessoal): nível final por modelo de aparelho, para recalibrar os limites a cada versão.

### 6.3 Regra de ouro pedagógica
**Nenhum conteúdo de aprendizagem depende do nível gráfico.** Lições, sons, Sofia, Espelho do Som e lojinha funcionam iguais nos quatro níveis. Muda só a "pintura" do mundo.

---

## 7. Riscos principais e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Mundo 3D trava ou fecha em aparelhos de 2 GB | Criança perde a sessão | Nível leve com só uma ilha carregada, KTX2 obrigatório, 2,5D automático, testes em aparelhos reais desde o sprint 1 |
| WebGPU instável em drivers Mali/Adreno antigos | Artefatos visuais | WebGL2 como padrão no médio e no leve; WebGPU só em lista de permissão por GPU |
| Rive: migração de inputs para data binding | Retrabalho | Começar já em View Models; fixar versão dos runtimes |
| Licenças de IA 3D (nvdiffrast, Tencent, Stability) | Problema jurídico | IA só para rascunho; planilha de proveniência; revisão jurídica antes de qualquer asset final |
| Câmera e dados biométricos (LGPD art. 14, ECA Digital) | Problema jurídico e de confiança | Opt-in do responsável, processamento 100% local, só métricas agregadas, recurso desligável |
| "Efeito uau" atrapalhar o aprendizado | Distração | Efeitos fortes só no mundo, nunca dentro da lição; animações de transição ≤ 2 s e puláveis |
| Gráfico 3D enganoso nos painéis | Decisão errada da escola | Número sempre visível, alternativa 2D, 3D desligado por padrão no celular |
| Dependências paradas (Theatre.js, gltfjsx, Kalidokit, Lottie web) | Falta de manutenção | Isolar atrás de interfaces próprias; código pequeno pode ser internalizado |

---

## 8. Próximos passos (PoCs)

1. **Laboratório de aparelhos (sprint 1):** comprar ou alugar 4–6 Androids reais (2 GB Mali-G52, 3 GB Adreno 610, 4 GB, intermediário recente) e um iPhone antigo. Medir FPS, memória e temperatura da ilha-modelo nos quatro níveis. Isso confirma ou corrige toda a coluna **2 GB** deste documento.
2. **PoC "ilha-modelo":** uma ilha em Blender passando pelo pipeline glTF-Transform → 3 variantes, com toon, água TSL, dia/noite e three.quarks. Rodar no web (Next.js) e no app (Expo WebView).
3. **PoC "Sofia imita você":** MediaPipe Face → View Model do Rive no navegador do Android de 2 GB. Meta: ≥ 15 fps e latência < 150 ms.
4. **PoC "recorte de papel":** Rive como textura num plano dentro do Three.js. Medir o custo de upload por frame.
5. **Spike AR:** `<model-viewer>` com a Bolota (Scene Viewer) e AR.js com marcador impresso no caderno. Medir quantos aparelhos das escolas-piloto suportam cada um.
6. **Revisão jurídica:** Rhubarb, GSAP, Needle, 8th Wall (binário), Live2D, Spine e modelos de IA 3D.

---

## 9. Fontes (web)

- WebGPU no Android e modo de compatibilidade: https://developer.chrome.com/blog/new-in-webgpu-146 ; https://groups.google.com/a/chromium.org/g/blink-dev/c/N3RlLGCOTJ4 ; https://enterno.io/en/s/research-webgpu-adoption-browsers-2026
- Rive data binding e descontinuação das inputs no RN: https://rive.app/docs/runtimes/web/data-binding ; https://rive.app/docs/runtimes/react-native/migration-guide ; https://rive.app/docs/editor/data-binding/migration-guide ; https://rive.app/blog/data-binding-supercharged-lists-images-and-artboards
- Spark 2.0: https://github.com/sparkjsdev/spark ; https://radiancefields.com/world-labs-previews-spark-2.0 ; https://cgworld.jp/flashnews/01-202603-Spark2.html
- 8th Wall open source: https://8thwall.org/docs/open-source ; https://8thwall.org/docs/migration/faq ; https://roadtovr.com/niantic-webar-platform-8th-wall-open-source/
- Unity 6 na web: https://unity.com/blog/engine-platform/web-runtime-updates-enhance-browser-experience ; https://discussions.unity.com/t/public-access-to-webgpu-experimental-in-unity-6-1/1572462 ; https://app.cinevva.com/news/2026-09-01-unity-6-6-webgpu-production
- Godot na web: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html ; https://docs.godotengine.org/en/4.6/tutorials/export/exporting_for_web.html
- TRELLIS.2 e nvdiffrast: https://huggingface.co/microsoft/TRELLIS.2-4B/blob/main/README.md ; https://blog.comfy.org/p/trellis2-and-pixal3d-are-now-native ; https://github.com/microsoft/TRELLIS/issues/298
- Hunyuan3D 2.1 (licença): https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE ; https://gitserver.onethingai.com/ai-models/Hunyuan3D-2.1/raw/branch/main/LICENSE (espelho de terceiros)
- Stable Fast 3D (licença): https://stability.ai/license ; https://huggingface.co/stabilityai/stable-fast-3d
- Live2D (licença): https://www.live2d.com/en/sdk/license/ ; https://help.live2d.com/en/?p=2558
- Dados do GitHub: `gh api -X GET search/repositories -f q='repo:<dono>/<nome>'`, coletados em 13/11/2026.
