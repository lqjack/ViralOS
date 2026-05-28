#!/usr/bin/env bash
# Ubuntu LiteLLM + Cloudflare + ViralOS env (replaces SSH -R 3456 for production LLM path).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REMOTE="${REMOTE:-jack@192.168.1.4}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=20)

cmd="${1:-start}"

openrouter_from_mac() {
  (cd "$ROOT" && node --input-type=module -e "import { openRouterApiKeyFromCcr } from './scripts/read-ccr-config.mjs'; console.log(openRouterApiKeyFromCcr())")
}

sync_viralos_env() {
  local use_public="${1:-0}"
  echo "==> Sync ViralOS .env (LiteLLM)"
  if [[ "$use_public" == "1" ]]; then
    node "${ROOT}/scripts/load-litellm-env.mjs" --print-env-file --public
  else
    node "${ROOT}/scripts/load-litellm-env.mjs" --print-env-file
  fi | ssh "${SSH_OPTS[@]}" "$REMOTE" \
    'cd ~/ViralOS && grep -vE "^(ANTHROPIC_|CAMPAIGN_MODEL|LITELLM_)" .env 2>/dev/null > .env.tmp || cp .env.example .env.tmp; cat >> .env.tmp; mv .env.tmp .env && cp .env .env.local && chmod 600 .env .env.local && echo OK'
}

case "$cmd" in
  start)
    OR_KEY="$(openrouter_from_mac || true)"
    if [[ -z "$OR_KEY" ]]; then
      echo "[litellm-stack] missing OpenRouter key in ~/.claude-code-router/config.json" >&2
      exit 1
    fi
    echo "==> Mac CCR + SSH -R 3456 (Ubuntu → Mac OpenRouter path)"
    CCR_SKIP_ENV_SYNC=1 bash "${ROOT}/scripts/ops/ccr-tunnel.sh" start
    echo "==> Ensure LiteLLM on Ubuntu (OPENROUTER from CCR config)"
    ssh "${SSH_OPTS[@]}" "$REMOTE" "chmod +x ~/ViralOS/scripts/ubuntu/*.sh && OPENROUTER_API_KEY='${OR_KEY}' ~/ViralOS/scripts/ubuntu/ensure-litellm-ccr.sh"
    echo "==> Cloudflare ingress litellm.datapro.asia → :4000"
    ssh "${SSH_OPTS[@]}" "$REMOTE" "APPLY_RESTART=1 ~/ViralOS/scripts/ubuntu/setup-litellm-tunnel.sh"
    sync_viralos_env 0
    echo ""
    echo "LiteLLM stack ready."
    echo "  Ubuntu ViralOS: ANTHROPIC_BASE_URL=http://127.0.0.1:4000  CAMPAIGN_MODEL=ccr-mac"
    echo "  Public (Vercel):  https://litellm.datapro.asia  (npm run ops:litellm:env-public)"
    ;;
  sync-env)
    sync_viralos_env "${2:-0}"
    ;;
  tunnel-only)
    ssh "${SSH_OPTS[@]}" "$REMOTE" "APPLY_RESTART=1 ~/ViralOS/scripts/ubuntu/setup-litellm-tunnel.sh"
    ;;
  litellm-only)
    OR_KEY="$(openrouter_from_mac || true)"
    ssh "${SSH_OPTS[@]}" "$REMOTE" "OPENROUTER_API_KEY='${OR_KEY}' ~/ViralOS/scripts/ubuntu/ensure-litellm-ccr.sh"
    ;;
  status)
    ssh "${SSH_OPTS[@]}" "$REMOTE" 'curl -sf http://127.0.0.1:4000/health -H "Authorization: Bearer sk-gateway-master-key" && echo " litellm:4000 OK" || echo " litellm:4000 DOWN"'
    if curl -sf -m 20 "https://litellm.datapro.asia/health" -H "Authorization: Bearer sk-gateway-master-key" >/dev/null 2>&1; then
      echo " litellm.datapro.asia OK"
    elif curl -sk -m 20 "https://litellm.datapro.asia/health" -H "Authorization: Bearer sk-gateway-master-key" >/dev/null 2>&1; then
      echo " litellm.datapro.asia OK (TLS verify skipped on this host)"
    else
      echo " litellm.datapro.asia unreachable"
    fi
    ssh "${SSH_OPTS[@]}" "$REMOTE" 'systemctl --user is-active cloudflared-litellm.service 2>/dev/null && echo " cloudflared-litellm: active" || pgrep -af "config-litellm.yml" | head -1 || echo " cloudflared-litellm: down"'
    ;;
  *)
    echo "Usage: $0 {start|sync-env|tunnel-only|litellm-only|status}"
    exit 1
    ;;
esac
