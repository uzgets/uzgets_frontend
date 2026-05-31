#!/usr/bin/env bash
# Serverda: loyiha ildizidan (xpremfrontend — package.json yonida)
#   bash scripts/update-starsx.sh
# yoki:
#   chmod +x scripts/update-starsx.sh && ./scripts/update-starsx.sh
#
# Ketma-ketlik: git pull → npm install → npm run build → /var/www/starsx + nginx reload

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') — yangilash: $ROOT_DIR ==="

echo ">>> git pull"
git pull

echo ">>> npm install"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo ">>> npm run build"
npm run build

echo ">>> statik: /var/www/starsx + nginx reload"
sudo bash "$SCRIPT_DIR/deploy-www-starsx.sh" "$ROOT_DIR/dist"

echo "=== Tugadi. Tekshirish: curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:7001/api/status ==="
