#!/usr/bin/env bash
# Comprime os modelos 3D dos prêmios para a web (D029): textura 1024 em WebP + malha em meshopt, sem simplificar.
# Originais (3–4 MB, da plataforma de 3D): docs/propostas/06-fonema-unificada/recompensas-3d/modelos/
# Saída (≈0,3–0,5 MB cada):                app/web/public/assets/modelos3d/
# Uso (em app/web):  bash scripts/comprimir-modelos.sh [porquinho trofeu bau bolota]
# Depois: node scripts/gerar-miniaturas-modelos.mjs   (as imagens paradas saem do próprio modelo)
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
ORIGEM="$AQUI/../../../docs/propostas/06-fonema-unificada/recompensas-3d/modelos"
SAIDA="$AQUI/../public/assets/modelos3d"
MODELOS=("$@"); [ ${#MODELOS[@]} -gt 0 ] || MODELOS=(porquinho trofeu bau bolota)
for m in "${MODELOS[@]}"; do
  npx -y @gltf-transform/cli@4 optimize "$ORIGEM/$m.glb" "$SAIDA/$m.glb" --compress meshopt --texture-compress webp --texture-size 1024 --simplify false
done
ls -la "$SAIDA"
