#!/usr/bin/env bash
# Ubuntu: ensure LiteLLM :4000 with OPENROUTER_API_KEY from Mac ~/.claude-code-router/config.json
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=require-linux.sh
source "${SCRIPT_DIR}/require-linux.sh"

LLM_GATEWAY_DIR="${LLM_GATEWAY_DIR:-$HOME/llm-gateway}"
CCR_CONFIG="${CCR_CONFIG:-$HOME/.claude-code-router/config.json}"
REMOTE_CCR="${REMOTE_CCR:-jack@192.168.1.6}"

read_openrouter_key() {
  if [[ -f "$CCR_CONFIG" ]]; then
    python3 - <<'PY' "$CCR_CONFIG"
import json, sys
cfg = json.load(open(sys.argv[1]))
for p in cfg.get("providers", []):
    k = (p.get("api_key") or "").strip()
    if k:
        print(k)
        break
PY
    return
  fi
  if [[ -n "${REMOTE_CCR:-}" ]]; then
    ssh -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE_CCR" \
      "python3 -c \"import json; c=json.load(open('$HOME/.claude-code-router/config.json')); print(next(p['api_key'] for p in c['providers'] if p.get('api_key')))\"" 2>/dev/null || true
  fi
}

OR_KEY="${OPENROUTER_API_KEY:-$(read_openrouter_key | head -1)}"
if [[ -z "$OR_KEY" ]]; then
  echo "[ensure-litellm] cannot read OpenRouter api_key (set OPENROUTER_API_KEY or CCR config)" >&2
  exit 1
fi

start_ccr_relay() {
  local relay_script="${ROOT}/scripts/ubuntu/ccr-docker-relay.py"
  local relay_port=3457 tunnel_port=3456
  if ss -tlnp 2>/dev/null | grep -q ":${relay_port} "; then
    echo "[ensure-litellm] relay :${relay_port} already listening"
    return 0
  fi
  if [[ ! -f "$relay_script" ]]; then
    echo "[ensure-litellm] missing relay script $relay_script" >&2
    return 1
  fi
  nohup python3 -u "$relay_script" "$relay_port" "$tunnel_port" >> /tmp/ccr-relay.log 2>&1 &
  sleep 1
  if curl -sf "http://127.0.0.1:${relay_port}/health" >/dev/null 2>&1; then
    echo "[ensure-litellm] relay 0.0.0.0:${relay_port} → 127.0.0.1:${tunnel_port}"
  else
    echo "[ensure-litellm] WARN: relay :${relay_port} not up (need Mac SSH -R ${tunnel_port})" >&2
  fi
}

start_ccr_relay || true

if [[ ! -d "$LLM_GATEWAY_DIR" ]]; then
  echo "[ensure-litellm] missing $LLM_GATEWAY_DIR — clone llm-gateway on Ubuntu" >&2
  exit 1
fi

export OPENROUTER_API_KEY="$OR_KEY"
cd "$LLM_GATEWAY_DIR"

if [[ -x ./scripts/start-litellm.sh ]]; then
  ./scripts/start-litellm.sh
else
  echo "[ensure-litellm] start-litellm.sh not found" >&2
  exit 1
fi

# Patch running container if key drifted
if docker ps --format '{{.Names}}' | grep -qx gateway-litellm; then
  docker inspect gateway-litellm --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -q "^OPENROUTER_API_KEY=${OR_KEY}$" || {
    echo "[ensure-litellm] refreshing OPENROUTER_API_KEY in gateway-litellm"
    docker compose -f docker-compose.litellm.yml up -d --force-recreate
  }
fi

MASTER="${LITELLM_MASTER_KEY:-sk-gateway-master-key}"
for _ in $(seq 1 45); do
  if curl -sf "http://127.0.0.1:4000/health" -H "Authorization: Bearer ${MASTER}" >/dev/null; then
    echo "[ensure-litellm] OK http://127.0.0.1:4000"
    break
  fi
  sleep 2
done
if ! curl -sf "http://127.0.0.1:4000/health" -H "Authorization: Bearer ${MASTER}" >/dev/null; then
  echo "[ensure-litellm] health check failed" >&2
  exit 1
fi

# Route ccr-mac → Mac CCR (LAN default; socat :3457 fallback when SSH tunnel only)
LITELLM_CFG="${LLM_GATEWAY_DIR}/docker/litellm/config-local.yaml"
SNIPPET="${SCRIPT_DIR}/litellm-ccr-model.yaml"
MAC_CCR_BASE="${MAC_CCR_BASE:-http://host.docker.internal:3457}"

if [[ -f "$LITELLM_CFG" && -f "$SNIPPET" ]]; then
  python3 - <<'PY' "$LITELLM_CFG" "$SNIPPET" "$MAC_CCR_BASE"
import sys
from pathlib import Path

path = Path(sys.argv[1])
snippet = Path(sys.argv[2]).read_text()
api_base = sys.argv[3]
text = path.read_text()

# Drop duplicate ccr-mac blocks (keep first)
while text.count("model_name: ccr-mac") > 1:
    first = text.index("model_name: ccr-mac")
    second = text.index("model_name: ccr-mac", first + 1)
    start = text.rfind("\n", 0, second)
    end = text.find("\n  - model_name:", second + 1)
    if end == -1:
        end = len(text)
    text = text[: start + 1] + text[end + 1 :]

if "model_name: ccr-mac" not in text:
    anchors = [
        "  # ── END OpenRouter free pool ──",
        "  # ── Miromind",
        "  - model_name: miromind:claude",
    ]
    inserted = False
    snippet = snippet.replace("http://host.docker.internal:3457", api_base)
    for anchor in anchors:
        if anchor in text:
            text = text.replace(anchor, snippet + anchor, 1)
            inserted = True
            break
    if not inserted:
        text = text.rstrip() + "\n" + snippet
    path.write_text(text)
    print("[ensure-litellm] inserted ccr-mac into model_list")
else:
    import re
    new_text, n = re.subn(
        r"(model_name: ccr-mac\n(?:.*\n)*?      api_base: )http://[^\n]+",
        rf"\g<1>{api_base}",
        text,
        count=1,
    )
    if n:
        path.write_text(new_text)
        print(f"[ensure-litellm] updated ccr-mac api_base → {api_base}")
    else:
        print("[ensure-litellm] ccr-mac already in config (api_base unchanged)")
PY
  docker compose -f docker-compose.litellm.yml up -d --force-recreate
  echo "[ensure-litellm] waiting for LiteLLM…"
  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:4000/health" -H "Authorization: Bearer ${MASTER}" >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
fi

curl -sf -X POST "http://127.0.0.1:4000/v1/messages" \
  -H "Authorization: Bearer ${MASTER}" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"ccr-mac","max_tokens":8,"messages":[{"role":"user","content":"ok"}]}' >/dev/null \
  && echo "[ensure-litellm] anthropic passthrough model ccr-mac OK" \
  || echo "[ensure-litellm] WARN: ccr-mac probe failed — run npm run ops:ccr:start on Mac for SSH -R 3456"
