#!/usr/bin/env bash
# Serverda ishga tushiring (sudo bilan).
# Nginx: root /var/www/starspaymee; SPA uchun try_files $uri $uri/ /index.html;

set -euo pipefail

SITE_ROOT="/var/www/starspaymee"
DIST_DIR="${1:-$(dirname "$0")/../dist}"

DIST_DIR="$(cd "$DIST_DIR" && pwd)"

if [[ ! -d "$DIST_DIR" ]] || [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "Xato: dist topilmadi yoki index.html yo'q: $DIST_DIR"
  echo "Avval: npm run build"
  exit 1
fi

mkdir -p "$SITE_ROOT"
find "$SITE_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

cp -a "$DIST_DIR"/. "$SITE_ROOT"/

chown -R www-data:www-data "$SITE_ROOT"
find "$SITE_ROOT" -type d -exec chmod 755 {} \;
find "$SITE_ROOT" -type f -exec chmod 644 {} \;

nginx -t
systemctl reload nginx

echo "OK: $SITE_ROOT yangilandi (nginx reload)."
