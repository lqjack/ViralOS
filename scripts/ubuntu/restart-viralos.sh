#!/usr/bin/env bash
# Quick restart ViralOS on Ubuntu (no rebuild). Run on Ubuntu or via deploy:ubuntu:sync host.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

APP_DIR="${VIRALOS_DIR:-${REMOTE_DIR:-$HOME/ViralOS}}"
PORT="${VIRALOS_PORT:-3010}"
PID_FILE="${APP_DIR}/viralos.pid"
LOG_FILE="${APP_DIR}/viralos.log"

cd "$APP_DIR"
test -d .next || { echo "[restart-viralos] missing .next — run deploy-viralos.sh first" >&2; exit 1; }
test -f .env.local || cp .env .env.local

if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
  echo "[restart-viralos] already up http://127.0.0.1:${PORT}"
  exit 0
fi

if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE")"
  kill "$old_pid" 2>/dev/null || true
fi
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
fi
pkill -f "${APP_DIR}/.*next-server" 2>/dev/null || true
sleep 1

set -a
# shellcheck disable=SC1091
source .env.local
set +a
nohup npx next start -p "$PORT" -H 0.0.0.0 >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
sleep 4

curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null \
  && echo "[restart-viralos] OK http://127.0.0.1:${PORT}/campaign" \
  || { tail -20 "$LOG_FILE"; exit 1; }
