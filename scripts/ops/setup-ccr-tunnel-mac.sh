#!/usr/bin/env bash
# Mac: expose CCR :3456 via Cloudflare Tunnel (optional; Ubuntu should prefer LiteLLM :4000).
set -euo pipefail

CONFIG="${CLOUDFLARED_CONFIG:-$HOME/.cloudflared/config.yml}"
HOSTNAME="${CCR_TUNNEL_HOST:-ccr.datapro.asia}"
CCR_PORT="${CCR_PORT:-3456}"
SERVICE="http://127.0.0.1:${CCR_PORT}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[setup-ccr-tunnel] install cloudflared on Mac first" >&2
  exit 1
fi

if ! command -v ccr >/dev/null 2>&1; then
  echo "[setup-ccr-tunnel] ccr not in PATH" >&2
  exit 1
fi

if ! curl -sf "http://127.0.0.1:${CCR_PORT}/health" >/dev/null 2>&1; then
  ccr start || ccr restart
fi

if [[ ! -f "$CONFIG" ]]; then
  echo "[setup-ccr-tunnel] missing $CONFIG — run: cloudflared tunnel login" >&2
  exit 1
fi

if grep -q "hostname: ${HOSTNAME}" "$CONFIG" 2>/dev/null; then
  echo "[setup-ccr-tunnel] ingress already has ${HOSTNAME}"
else
  cp -a "$CONFIG" "${CONFIG}.bak.$(date +%Y%m%d%H%M%S)"
  python3 - <<'PY' "$CONFIG" "$HOSTNAME" "$SERVICE"
import sys
from pathlib import Path
path = Path(sys.argv[1])
host, service = sys.argv[2], sys.argv[3]
lines = path.read_text().splitlines()
out, inserted = [], False
for line in lines:
    out.append(line)
    if not inserted and line.strip() == "ingress:":
        out.append(f"  - hostname: {host}")
        out.append(f"    service: {service}")
        inserted = True
if not inserted:
    raise SystemExit("ingress: block not found")
path.write_text("\n".join(out) + "\n")
print(f"added {host} -> {service}")
PY
fi

TUNNEL_ID="$(grep -E '^tunnel:' "$CONFIG" | awk '{print $2}' | head -1)"
if [[ -n "$TUNNEL_ID" ]]; then
  cloudflared tunnel route dns "$TUNNEL_ID" "$HOSTNAME" 2>&1 || true
fi

if [[ "${APPLY_RESTART:-}" == "1" ]]; then
  pkill -f 'cloudflared.*tunnel run' 2>/dev/null || true
  sleep 2
  nohup cloudflared --config "$CONFIG" tunnel run >> /tmp/cloudflared-ccr.log 2>&1 &
  sleep 5
  curl -sf "https://${HOSTNAME}/health" && echo " OK"
fi

echo "Mac CCR public: https://${HOSTNAME} (apply: APPLY_RESTART=1 $0)"
