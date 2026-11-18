# Animações de captura de movimento do passeio 3D

`ual.json` é gerado por `ferramentas/animacoes-ual.mjs` a partir da **Universal Animation Library (versão Standard,
gratuita)**, de **Quaternius** (https://quaternius.com), licença **CC0 1.0 Universal** (domínio público: uso livre,
inclusive comercial, sem obrigação de crédito). Cópia em glTF usada: https://github.com/J-Ponzo/gltf-universal-animation-library
(arquivo `LICENSE` = texto da CC0 1.0; o README diz que é o pacote do itch.io do autor, baixado em 2025-06-10).
Baixado aqui em 18/11/2026 (commit raiz do repositório, `git clone --depth 1`).

Animações usadas (nome no arquivo → uso no passeio): Idle_Loop (parado), Walk_Loop (andar), Jog_Fwd_Loop (trotar),
Sprint_Loop (correr), Jump_Start / Jump_Loop / Jump_Land (pulo), Swim_Fwd_Loop (nadar), Swim_Idle_Loop (boiar),
Idle_Talking_Loop (conversar). O tchau é feito em código por cima da pose (o pacote gratuito não tem aceno).

O arquivo guarda só a posição das juntas e a rotação do tronco, quadro a quadro (30/s); não há malha nem textura do
manequim. O passeio reaplica o movimento no esqueleto automático de cada boneco (`js/esqueleto.js`, `js/animacoes.js`).
Crédito (não obrigatório pela CC0, mas registrado): animações de Quaternius.
