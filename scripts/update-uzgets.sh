#!/usr/bin/env bash
# Serverda: ~/uzgets_frontend repo ildizi (package.json yonida)
#   chmod +x scripts/update-uzgets.sh && ./scripts/update-uzgets.sh
#
# Ketma-ketlik: git pull → npm ci|install → npm run build → /var/www/stars.uzgets.uz + nginx reload

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') — uzgets_frontend: $ROOT_DIR ==="

echo ">>> git pull"
git pull

echo ">>> npm dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo ">>> npm run build"
npm run build

echo ">>> statik: /var/www/stars.uzgets.uz + nginx reload"
sudo bash "$SCRIPT_DIR/deploy-www-uzgets.sh" "$ROOT_DIR/dist"

echo "=== Tugadi. Tekshirish:"
echo "    curl -sS -o /dev/null -w '%{http_code}\\n' https://stars.uzgets.uz/"
echo "    curl -sS -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:7001/api/maintenance"
