#!/usr/bin/env bash
# Start CCR on Mac and SSH reverse tunnel so Ubuntu can reach http://127.0.0.1:3456
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REMOTE="${REMOTE:-jack@192.168.1.4}"
CCR_PORT="${CCR_PORT:-3456}"
LOCAL_CCR="127.0.0.1:${CCR_PORT}"
REMOTE_BIND="127.0.0.1:${CCR_PORT}"
PID_DIR="${HOME}/.viralos"
PID_FILE="${PID_DIR}/ccr-tunnel.pid"

SSH_OPTS=(
  -o BatchMode=yes
  -o ConnectTimeout=15
  -o ExitOnForwardFailure=yes
  -o ServerAliveInterval=30
  -o ServerAliveCountMax=3
)

mkdir -p "$PID_DIR"

tunnel_pattern() {
  echo "ssh.*-R.*${CCR_PORT}:127.0.0.1:${CCR_PORT}"
}

wait_ccr_local() {
  for _ in $(seq 1 20); do
    if curl -sf "http://${LOCAL_CCR}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

ensure_ccr() {
  if ! command -v ccr >/dev/null 2>&1; then
    echo "[error] ccr not in PATH — install Claude Code Router first"
    exit 1
  fi
  if wait_ccr_local; then
    echo "OK: CCR already healthy at http://${LOCAL_CCR}"
    return 0
  fi
  echo "==> Starting CCR..."
  if ccr status >/dev/null 2>&1; then
    ccr restart || ccr start
  else
    ccr start
  fi
  if ! wait_ccr_local; then
    echo "[error] CCR did not become healthy on http://${LOCAL_CCR}"
    ccr status || true
    exit 1
  fi
  echo "OK: CCR running at http://${LOCAL_CCR}"
}

stop_tunnel() {
  local pid pattern
  pattern="$(tunnel_pattern)"
  if [[ -f "$PID_FILE" ]]; then
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      echo "Stopped tunnel pid $pid"
    fi
    rm -f "$PID_FILE"
  fi
  pgrep -f "$pattern" 2>/dev/null | while read -r pid; do
    kill "$pid" 2>/dev/null || true
    echo "Stopped stale tunnel pid $pid"
  done || true
}

start_tunnel() {
  local pattern pid
  pattern="$(tunnel_pattern)"
  if ssh "${SSH_OPTS[@]}" "$REMOTE" "curl -sf http://${REMOTE_BIND}/health" >/dev/null 2>&1; then
    echo "OK: SSH tunnel already forwarding ${REMOTE_BIND} → Mac CCR"
    pgrep -f "$pattern" 2>/dev/null | head -1 >"$PID_FILE" || true
    return 0
  fi
  stop_tunnel
  echo "==> SSH reverse tunnel: ${REMOTE} ${REMOTE_BIND} → Mac ${LOCAL_CCR}"
  ssh -f -N "${SSH_OPTS[@]}" -R "${REMOTE_BIND}:127.0.0.1:${CCR_PORT}" "$REMOTE"
  sleep 1
  pid="$(pgrep -f "$pattern" 2>/dev/null | head -1 || true)"
  if [[ -z "$pid" ]]; then
    echo "[error] SSH tunnel process not found after start"
    exit 1
  fi
  echo "$pid" >"$PID_FILE"
  if ! ssh "${SSH_OPTS[@]}" "$REMOTE" "curl -sf http://${REMOTE_BIND}/health" >/dev/null 2>&1; then
    echo "[error] Ubuntu cannot reach http://${REMOTE_BIND} through tunnel"
    exit 1
  fi
  echo "OK: tunnel pid $pid — Ubuntu http://${REMOTE_BIND}/health"
}

sync_ubuntu_env() {
  echo "==> Sync ANTHROPIC_* from ~/.claude-code-router/config.json → ${REMOTE}:~/ViralOS/.env"
  node "${ROOT}/scripts/load-ccr-anthropic-env.mjs" --print-env-file |
    ssh "${SSH_OPTS[@]}" "$REMOTE" 'cd ~/ViralOS && grep -v "^ANTHROPIC_" .env 2>/dev/null > .env.tmp || cp .env.example .env.tmp; cat >> .env.tmp; mv .env.tmp .env && cp .env .env.local && chmod 600 .env .env.local && echo OK: .env + .env.local updated'
}

status() {
  echo "── CCR + tunnel status ──"
  if wait_ccr_local; then
    curl -sf "http://${LOCAL_CCR}/health" | head -c 120 || true
    echo ""
  else
    echo "CCR: down (http://${LOCAL_CCR})"
  fi
  if [[ -f "$PID_FILE" ]]; then
    echo "Tunnel pid file: $(cat "$PID_FILE")"
  fi
  pgrep -fl "$(tunnel_pattern)" 2>/dev/null || echo "Tunnel: no matching ssh process"
  if ssh "${SSH_OPTS[@]}" "$REMOTE" "curl -sf http://${REMOTE_BIND}/health" >/dev/null 2>&1; then
    echo "Ubuntu ${REMOTE_BIND}: OK"
  else
    echo "Ubuntu ${REMOTE_BIND}: unreachable"
  fi
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  start         Start CCR + SSH reverse tunnel + sync Ubuntu .env (default)
  stop          Stop tunnel (CCR left running)
  restart       stop + start
  status        Show CCR and tunnel health
  sync-env      Push ANTHROPIC_* to Ubuntu only (no tunnel restart)
  ccr-only      Start CCR only

Env:
  REMOTE=jack@192.168.1.4   Ubuntu SSH target
  CCR_PORT=3456             CCR listen port (from ~/.claude-code-router/config.json)
EOF
}

cmd="${1:-start}"
case "$cmd" in
  start)
    ensure_ccr
    start_tunnel
    sync_ubuntu_env
    echo ""
    echo "Ready. Ubuntu ViralOS uses ANTHROPIC_BASE_URL=http://127.0.0.1:${CCR_PORT}"
    echo "  VIRALOS_URL=http://192.168.1.4:3010 npm run verify:e2e-real"
    ;;
  stop) stop_tunnel ;;
  restart) stop_tunnel; ensure_ccr; start_tunnel; sync_ubuntu_env ;;
  status) status ;;
  sync-env) sync_ubuntu_env ;;
  ccr-only) ensure_ccr ;;
  -h | --help | help) usage ;;
  *)
    echo "Unknown command: $cmd"
    usage
    exit 1
    ;;
esac
