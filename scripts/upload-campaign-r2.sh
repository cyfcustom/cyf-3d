#!/usr/bin/env bash
# Sube los assets de la campaña Juntos a Seúl a Cloudflare R2.
#
# Requisitos:
#   1. wrangler autenticado:  wrangler login
#   2. Bucket creado:          wrangler r2 bucket create cyf-campaign
#   3. Ejecutar:               ./scripts/upload-campaign-r2.sh
#
# Tras subir, define VITE_CAMPAIGN_ASSET_BASE en Vercel apuntando al dominio
# público del bucket, p.ej. https://cdn.cyfcustom.site (Custom Domain en R2).
set -euo pipefail

BUCKET="${R2_CAMPAIGN_BUCKET:-cyf-campaign}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/public/campaign"

command -v wrangler >/dev/null 2>&1 || {
  echo "wrangler no está instalado. Instálalo con: npm i -g wrangler" >&2
  exit 1
}

[ -f "$DIR/model.glb" ] || { echo "Falta $DIR/model.glb" >&2; exit 1; }
[ -f "$DIR/logo.png" ] || { echo "Falta $DIR/logo.png" >&2; exit 1; }

echo "Subiendo assets a r2://$BUCKET ..."

wrangler r2 object put "$BUCKET/model.glb" \
  --file "$DIR/model.glb" \
  --content-type model/gltf-binary \
  --cache-control "public, max-age=604800"

wrangler r2 object put "$BUCKET/logo.png" \
  --file "$DIR/logo.png" \
  --content-type image/png \
  --cache-control "public, max-age=604800"

echo "Listo. Luego configura VITE_CAMPAIGN_ASSET_BASE en Vercel."