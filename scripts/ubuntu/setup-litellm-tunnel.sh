#!/usr/bin/env bash
# Expose LiteLLM :4000 at https://litellm.datapro.asia via a dedicated locally-managed tunnel.
# alphaplus is remotely-managed (dashboard config overrides ~/.cloudflared/config.yml ingress).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

CLOUDFLARED_DIR="${CLOUDFLARED_DIR:-$HOME/.cloudflared}"
CONFIG="${LITELLM_TUNNEL_CONFIG:-${CLOUDFLARED_DIR}/config-litellm.yml}"
SERVICE_URL="${LITELLM_TUNNEL_SERVICE:-http://127.0.0.1:4000}"
HOSTNAME="${LITELLM_TUNNEL_HOST:-litellm.datapro.asia}"
TUNNEL_NAME="${LITELLM_TUNNEL_NAME:-viralos-litellm}"
MASTER="${LITELLM_MASTER_KEY:-sk-gateway-master-key}"
UNIT="${CLOUDFLARED_LITELLM_UNIT:-cloudflared-litellm.service}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[setup-litellm-tunnel] cloudflared not found" >&2
  exit 1
fi

mkdir -p "$CLOUDFLARED_DIR"

ensure_tunnel() {
  if cloudflared tunnel list 2>/dev/null | awk '{print $2}' | grep -qx "$TUNNEL_NAME"; then
    TUNNEL_ID="$(cloudflared tunnel list 2>/dev/null | awk -v n="$TUNNEL_NAME" '$2 == n {print $1; exit}')"
    echo "[setup-litellm-tunnel] reuse tunnel ${TUNNEL_NAME} (${TUNNEL_ID})"
  else
    echo "[setup-litellm-tunnel] creating tunnel ${TUNNEL_NAME}…"
    cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID="$(cloudflared tunnel list 2>/dev/null | awk -v n="$TUNNEL_NAME" '$2 == n {print $1; exit}')"
  fi
  if [[ -z "${TUNNEL_ID:-}" ]]; then
    echo "[setup-litellm-tunnel] could not resolve tunnel id for ${TUNNEL_NAME}" >&2
    exit 1
  fi
  CRED_FILE="${CLOUDFLARED_DIR}/${TUNNEL_ID}.json"
  if [[ ! -f "$CRED_FILE" ]]; then
    echo "[setup-litellm-tunnel] missing credentials ${CRED_FILE}" >&2
    exit 1
  fi
}

write_config() {
  cat >"$CONFIG" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CRED_FILE}

ingress:
  - hostname: ${HOSTNAME}
    service: ${SERVICE_URL}
  - service: http_status:404
EOF
  cloudflared --config "$CONFIG" tunnel ingress validate
  echo "[setup-litellm-tunnel] wrote ${CONFIG}"
}

route_dns() {
  echo "[setup-litellm-tunnel] DNS route ${HOSTNAME} → ${TUNNEL_NAME} (overwrite if needed)"
  cloudflared tunnel route dns -f "$TUNNEL_ID" "$HOSTNAME" 2>&1 || true
}

install_systemd() {
  local unit_path="${HOME}/.config/systemd/user/${UNIT}"
  mkdir -p "$(dirname "$unit_path")"
  cat >"$unit_path" <<EOF
[Unit]
Description=Cloudflare Tunnel (${HOSTNAME} → LiteLLM)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared --config ${CONFIG} tunnel run ${TUNNEL_NAME}
Restart=on-failure
RestartSec=10
StandardOutput=append:${CLOUDFLARED_DIR}/tunnel-litellm.log
StandardError=append:${CLOUDFLARED_DIR}/tunnel-litellm.log

[Install]
WantedBy=default.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable "$UNIT" >/dev/null
  echo "[setup-litellm-tunnel] installed ${unit_path}"
}

_restart() {
  install_systemd
  systemctl --user restart "$UNIT"
  sleep 4
}

verify_public() {
  for _ in $(seq 1 12); do
    if curl -sf -m 20 "https://${HOSTNAME}/health" -H "Authorization: Bearer ${MASTER}" >/dev/null 2>&1; then
      echo "[setup-litellm-tunnel] https://${HOSTNAME}/health OK"
      return 0
    fi
    sleep 5
  done
  echo "[setup-litellm-tunnel] WARN: https://${HOSTNAME}/health not ready yet" >&2
  echo "[setup-litellm-tunnel] Local: curl http://127.0.0.1:4000/health -H \"Authorization: Bearer ${MASTER}\"" >&2
  return 1
}

ensure_tunnel
write_config
route_dns

if [[ "${APPLY_RESTART:-}" == "1" ]]; then
  echo "[setup-litellm-tunnel] starting tunnel…"
  _restart
  verify_public || exit 0
else
  echo ""
  echo "Apply: APPLY_RESTART=1 $0"
fi
