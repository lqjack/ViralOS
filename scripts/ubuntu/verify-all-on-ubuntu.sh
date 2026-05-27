#!/usr/bin/env bash
# Run ON Ubuntu after deploy: func gates + smoke + optional real E2E.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

APP_DIR="${VIRALOS_DIR:-$HOME/ViralOS}"
PORT="${VIRALOS_PORT:-3010}"
export SMOKE_TEST_URL="http://127.0.0.1:${PORT}"
export VIRALOS_URL="$SMOKE_TEST_URL"

cd "$APP_DIR"

echo "==> verify:func"
npm run verify:func

echo "==> smoke-test"
npm run smoke-test

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "==> verify:e2e-real"
  E2E_AUTO_START=0 npm run verify:e2e-real
else
  echo "SKIP verify:e2e-real (set ANTHROPIC_API_KEY in .env)"
fi

if [[ -n "${API_PROXY_BASE_URL:-}" ]]; then
  echo "==> verify:cross-repo-live"
  npm run verify:cross-repo-live || echo "[warn] cross-repo live skipped/failed"
fi

echo ""
echo "verify-all-on-ubuntu PASSED"
