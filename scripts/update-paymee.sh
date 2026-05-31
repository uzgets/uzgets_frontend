#!/usr/bin/env bash
# Serverda: repo ildizidan (package.json yonida), masalan ~/paymee_frontend
#   chmod +x scripts/update-paymee.sh && ./scripts/update-paymee.sh
#
# Ketma-ketlik: git pull → npm install/ci → npm run build → /var/www/starspaymee + nginx reload

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') — paymee frontend: $ROOT_DIR ==="

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

echo ">>> statik: /var/www/starspaymee + nginx reload"
sudo bash "$SCRIPT_DIR/deploy-www-starspaymee.sh" "$ROOT_DIR/dist"

echo "=== Tugadi. Tekshirish:"
echo "    curl -sS -o /dev/null -w '%{http_code}\\n' https://starspaymee.starstg.uz/"
echo "    curl -sS http://127.0.0.1:7001/api/status"
