#!/usr/bin/env bash
# Add LiteLLM :4000 to Cloudflare Tunnel (alphaplus). Run on Ubuntu.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

CONFIG="${CLOUDFLARED_CONFIG:-$HOME/.cloudflared/config.yml}"
SERVICE_URL="${LITELLM_TUNNEL_SERVICE:-http://127.0.0.1:4000}"
HOSTNAME="${LITELLM_TUNNEL_HOST:-litellm.datapro.asia}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[setup-litellm-tunnel] cloudflared not found" >&2
  exit 1
fi

if [[ ! -f "$CONFIG" ]]; then
  echo "[setup-litellm-tunnel] missing $CONFIG" >&2
  exit 1
fi

if grep -q "hostname: ${HOSTNAME}" "$CONFIG" 2>/dev/null; then
  echo "[setup-litellm-tunnel] ingress already has ${HOSTNAME}"
else
  cp -a "$CONFIG" "${CONFIG}.bak.$(date +%Y%m%d%H%M%S)"
  python3 - <<'PY' "$CONFIG" "$HOSTNAME" "$SERVICE_URL"
import sys
from pathlib import Path

path = Path(sys.argv[1])
host = sys.argv[2]
service = sys.argv[3]
lines = path.read_text().splitlines()
out = []
inserted = False
for line in lines:
    out.append(line)
    if not inserted and line.strip() == "ingress:":
        out.append(f"  - hostname: {host}")
        out.append(f"    service: {service}")
        inserted = True
if not inserted:
    raise SystemExit("ingress: block not found")
path.write_text("\n".join(out) + "\n")
print(f"[setup-litellm-tunnel] added {host} -> {service}")
PY
fi

TUNNEL_ID="$(grep -E '^tunnel:' "$CONFIG" | awk '{print $2}' | head -1)"
if [[ -n "$TUNNEL_ID" ]]; then
  echo "[setup-litellm-tunnel] DNS route:"
  cloudflared tunnel route dns "$TUNNEL_ID" "$HOSTNAME" 2>&1 || true
fi

_restart() {
  if systemctl --user is-active cloudflared-tunnel.service >/dev/null 2>&1; then
    systemctl --user restart cloudflared-tunnel.service
  else
    pkill -f 'cloudflared.*tunnel run' 2>/dev/null || true
    sleep 2
    nohup cloudflared --config "$CONFIG" tunnel run >> "${HOME}/.cloudflared/tunnel.log" 2>&1 &
    disown 2>/dev/null || true
    sleep 5
  fi
}

if [[ "${APPLY_RESTART:-}" == "1" ]]; then
  echo "[setup-litellm-tunnel] restarting cloudflared…"
  _restart
  for _ in $(seq 1 12); do
    if curl -sf -m 15 "https://${HOSTNAME}/health" -H "Authorization: Bearer ${LITELLM_MASTER_KEY:-sk-gateway-master-key}" >/dev/null 2>&1; then
      echo "[setup-litellm-tunnel] https://${HOSTNAME}/health OK"
      exit 0
    fi
    sleep 5
  done
  echo "[setup-litellm-tunnel] WARN: https://${HOSTNAME}/health not ready yet (DNS/SSL may need minutes)" >&2
  echo "[setup-litellm-tunnel] Local OK: curl http://127.0.0.1:4000/health" >&2
  exit 0
else
  echo ""
  echo "Apply on Ubuntu console/LAN: APPLY_RESTART=1 $0"
fi
