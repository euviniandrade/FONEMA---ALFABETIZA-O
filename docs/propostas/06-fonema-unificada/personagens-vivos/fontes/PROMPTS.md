# Prompts usados (para repetir quando a cota da API voltar)

Imagem: `python3 ../../arte-chave/g.py saida.png 16:9 "<prompt>" <referências>` · Vídeo: `python3 ../../musicas-e-sentidos/clipes/ferramentas/gerar_cena_video.py base.png saida.mp4 "<prompt>"`.

## Artes-base (imagem)
- **Fundo comum:** `Background: perfectly flat uniform pure chroma-key green (#00B140), a single solid color with no gradient, no floor line, no vignette.` (Zum-Zum: `pure magenta (#FF00FF)`.)
- **Estilo comum:** `3D animated feature film style (Pixar-like render), soft studio lighting, even illumination, no cast shadow on the background, no text, no jewelry, no rainbow.`
- **Dupla** (refs `personagens-3d/dupla-opcao-1.png`, `01-folha-modelo.png`): `render the same two children Sofia … and Tales … with the exact same faces, hair and uniform … Full body, standing side by side facing the camera, a small gap between them, relaxed neutral pose with arms down at their sides, friendly smiles, centered, whole bodies visible from head to shoes…`
- **Sofia e Tales sozinhos:** recortados da imagem da dupla (pedir cada um sozinho com as duas referências deixou "fantasmas" da folha-modelo no fundo).
- **Bolota** (ref: recorte do tatu em `serie-sofia-e-tales/imagens/P1-07-ensinando-o-bolota.png`): `Character render of Bolota, exactly the same small cute three-banded armadillo cub from the reference image…, without any book or object. He stands upright on his hind legs, front three-quarter view, friendly smile, full body with feet and tail visible…`
- **Zum-Zum** (sem referência; ficha do `docs/universo/02-personagens-canonicos.md` §4.1): `friendly cute cartoon beetle the size of a child's hand: round smooth body, big head with large expressive cartoon eyes, short antennae, moss-green matte shell with one ipe-yellow stripe, small transparent slightly bluish wings… No accessories, no metallic shine, not scary. Hovering, front three-quarter view…`

## Vídeos
- **Giro:** `3D character turntable for a model sheet. The character stays in the exact same spot and same relaxed standing pose, and rotates smoothly in place one full 360-degree turn around the vertical axis at constant speed (front, right side, back, left side, front again), like a figure on a slowly rotating display platform. Static locked camera, no zoom, no camera movement, full body always fully visible. The background stays the same perfectly flat solid green with no floor, no shadow, no platform visible. Same face, same hair, same outfit all the time. No talking, no other movement, no text, silent.`
- **Estados (final comum):** `Static locked camera, no zoom, no cuts. Both children stay in the same place with feet planted, full bodies always fully visible inside the frame. The background stays the same perfectly flat solid green, no floor, no shadows, no particles. Same faces, hair and uniforms all the time. Mouths closed or smiling, no talking. They begin and end in the same neutral standing pose with arms down. No text. Silent.`
  - parado: `stand relaxed and alive: gentle breathing, natural blinking, tiny weight shifts and small head tilts, soft smiles, a quick friendly glance at each other and back to the camera.`
  - acenando: `raise one hand and wave hello to the camera energetically with big happy smiles for a few seconds, then lower their arms.`
  - palmas: `clap their hands happily in front of their chests several times with big smiles, bouncing slightly on their heels, then lower their arms.`
  - pensando: `the girl puts a finger on her chin and looks up, the boy scratches his head and looks up to the side… then they lower their arms.`
  - comemorando: `they jump once, raise both fists in the air, then give each other a high five, laughing, then return to standing.`
  - apontando: `point with one arm stretched out toward the right side of the screen, looking there with excited smiles… then look back at the camera and lower their arms.`

## Ainda por gerar (barrado pela cota)
- **Folha de visemas** (4:3, grade 4×3, mesmo busto em todas as células; só a boca muda): descanso · M/P/B · A · É · I · O · U · F/V · L/T/D/N · S/Z · olhos fechados · olhos meio fechados.
- **Folha ortográfica com pose em A** (frente, lado, costas, 3/4, fundo branco) de Sofia, Tales, Bolota e Zum-Zum.
- **Paçoca** (cachorro caramelo vira-lata) e **gato**: arte-base em fundo verde + giro + 1 estado.
