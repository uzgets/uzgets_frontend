#!/usr/bin/env bash
# stars.uzgets.uz statik fayllarni yangilash (serverda sudo bilan).
# Ishlatish: bash scripts/deploy-www-uzgets.sh [/path/to/dist]
set -euo pipefail

SITE_ROOT="/var/www/stars.uzgets.uz"
DIST_DIR="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/dist}"
DIST_DIR="$(cd "$DIST_DIR" && pwd)"

if [[ ! -d "$DIST_DIR" ]] || [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "Xato: dist topilmadi. Avval loyiha ildizida: npm ci && npm run build"
  exit 1
fi

mkdir -p "$SITE_ROOT"
find "$SITE_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

cp -a "$DIST_DIR"/. "$SITE_ROOT"/

chown -R www-data:www-data "$SITE_ROOT" 2>/dev/null || chown -R nginx:nginx "$SITE_ROOT" 2>/dev/null || true
find "$SITE_ROOT" -type d -exec chmod 755 {} \;
find "$SITE_ROOT" -type f -exec chmod 644 {} \;

nginx -t
systemctl reload nginx

echo "OK: $SITE_ROOT yangilandi."
