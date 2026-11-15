# Teste: gerar por IA as peças de um boneco montável (15/11)

Pedido do dono: criador de personagem como The Sims / GTA / Habbo, em 3D estilo filme de animação (escolher olho, sorriso, boca, cabelo…).

Teste feito: pedir ao gerador de imagem (MiniMax image-01) peças soltas para depois virar 3D — cabeça com cabelo e rosto em branco,
corpo sem cabeça com roupa. Resultado em `00-folha-pecas.jpg`:
- a "cabeça de cabelo cacheado e rosto em branco" veio com cabelo liso, sobrancelhas, nariz e boca;
- o "corpo sem cabeça" veio com cabeça careca (um deles com rosto, outro sem);
- proporção, estilo e tom de pele mudam de uma peça para outra.

Conclusão: **geração por IA não entrega um kit de peças que encaixam** (mesmo esqueleto, mesma escala, mesmo estilo). Ela entrega muito bem
**personagens inteiros** (ver `personagens-3d/modelos/sofia.glb` e `tales.glb`). Um criador no nível de The Sims é um kit de jogo:
corpo-base com esqueleto e expressões (blendshapes), cabelos e roupas modelados para aquele corpo. Caminhos: comprar um kit pronto com
licença comercial, contratar artista 3D, ou — de imediato — galeria de personagens inteiros em 3D com troca de cores.
O carregador de peças GLB do app já está pronto para receber um kit (`app/docs/avatar-3d-contrato.md`).
