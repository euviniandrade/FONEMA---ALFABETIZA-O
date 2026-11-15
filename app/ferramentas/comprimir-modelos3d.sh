#!/usr/bin/env bash
# FONEMA · comprime os modelos 3D para a web (meta: ≤ 1 MB por personagem).
# Textura em 1024 px e WebP, malha com meshopt (o carregador do app usa MeshoptDecoder; Draco NÃO é carregado).
# Os originais ficam guardados em docs/ (nunca são sobrescritos); a saída vai para app/web/public/assets/modelos3d/.
#
# Uso (na raiz do repositório):
#   app/ferramentas/comprimir-modelos3d.sh                       # avatares padrão + Sofia e Tales
#   app/ferramentas/comprimir-modelos3d.sh caminho/modelo.glb    # só um arquivo (saída com o mesmo nome)
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
SAIDA="$RAIZ/app/web/public/assets/modelos3d"
AVATARES="$RAIZ/docs/propostas/06-fonema-unificada/avatar-3d/padrao/modelos"
ELENCO="$RAIZ/docs/propostas/06-fonema-unificada/personagens-3d/modelos"

comprimir() {
  local origem="$1" destino="$SAIDA/$(basename "$1")"
  # --simplify false: não mexe na malha (as máscaras de cor dos avatares dependem dos mesmos UVs)
  npx --yes @gltf-transform/cli@4.5.1 optimize "$origem" "$destino" \
    --texture-size 1024 --texture-compress webp --compress meshopt --simplify false --flatten false --join false --palette false >/dev/null
  printf '%-28s %8s → %8s bytes\n' "$(basename "$1")" "$(stat -c %s "$origem")" "$(stat -c %s "$destino")"
}

if [ $# -gt 0 ]; then for f in "$@"; do comprimir "$f"; done; exit 0; fi
for f in "$AVATARES"/avatar-*.glb "$ELENCO"/sofia.glb "$ELENCO"/tales.glb; do [ -f "$f" ] && comprimir "$f"; done
