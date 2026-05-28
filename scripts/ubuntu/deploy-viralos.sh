#!/usr/bin/env bash
# Run ON Ubuntu: build + start ViralOS (no local macOS build — saves CPU/RAM on dev machine).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

APP_DIR="${VIRALOS_DIR:-${REMOTE_DIR:-$HOME/ViralOS}}"
PORT="${VIRALOS_PORT:-3010}"
cd "$APP_DIR"

echo "==> ViralOS deploy @ ${APP_DIR} (PORT=${PORT})"

if ! command -v node >/dev/null 2>&1; then
  echo "[error] Node.js required (Node 20+). Install: https://nodejs.org/ or nvm"
  exit 1
fi
node --version
npm --version

test -f .env || cp .env.example .env
if ! grep -q '^ANTHROPIC_API_KEY=.' .env 2>/dev/null; then
  echo "[warn] ANTHROPIC_API_KEY not set in .env — POST /api/campaign will return 503 until set"
fi

grep -q '^API_PROXY_BASE_URL=' .env \
  || echo 'API_PROXY_BASE_URL=http://127.0.0.1:8001' >> .env

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"

echo "==> npm ci"
if ! npm ci; then
  echo "[warn] npm ci failed (lock drift?) — falling back to npm install"
  npm install
fi

echo "==> npm run build (on Ubuntu)"
npm run build

PID_FILE="${APP_DIR}/viralos.pid"
LOG_FILE="${APP_DIR}/viralos.log"

stop_old() {
  if [[ -f "$PID_FILE" ]]; then
    old_pid="$(cat "$PID_FILE")"
    if kill -0 "$old_pid" 2>/dev/null; then
      echo "==> Stopping pid $old_pid"
      kill "$old_pid" || true
      sleep 2
    fi
  fi
  pkill -f "${APP_DIR}.*next start" 2>/dev/null || true
}

stop_old

echo "==> Starting ViralOS on 0.0.0.0:${PORT}"
(
  cd "$APP_DIR"
  PORT="$PORT" HOSTNAME=0.0.0.0 nohup npm run start >> "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
)

sleep 5
if curl -sf "http://127.0.0.1:${PORT}/api/campaign" >/dev/null; then
  echo "Health check OK — GET /api/campaign"
else
  echo "Health check FAILED — tail ${LOG_FILE}"
  tail -40 "$LOG_FILE" || true
  exit 1
fi

echo ""
echo "Deployed. Local: http://127.0.0.1:${PORT}/campaign"
echo "Verify:  SMOKE_TEST_URL=http://127.0.0.1:${PORT} npm run smoke-test"
echo "Full verify: npm run verify:ubuntu:all"
