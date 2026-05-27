#!/usr/bin/env bash
# Print (and optionally run) Ubuntu ops sign-off steps — use on same LAN as datapro-ubuntu.
set -euo pipefail

LAN_HOST="${LAN_UBUNTU_HOST:-192.168.1.4}"
VIRALOS_PORT="${VIRALOS_PORT:-3010}"
GATEWAY_URL="${API_PROXY_BASE_URL:-http://${LAN_HOST}:8001}"
VIRALOS_URL="${VIRALOS_URL:-http://${LAN_HOST}:${VIRALOS_PORT}}"
RUN="${LAN_RESUME_RUN:-0}"

steps() {
  cat <<EOF
ViralOS LAN resume checklist (cross-public-network ops deferred until now)

1. invest-ai gateway on Ubuntu:
   cd ~/dataproaiset/dataproaiset && ./scripts/ubuntu/start-core-gateway.sh

2. Deploy ViralOS (from Mac on LAN):
   REMOTE=ubuntu@${LAN_HOST} npm run deploy:ubuntu:sync

3. Sign-off on Ubuntu:
   cd ~/ViralOS && npm run verify:ubuntu:all

4. Cross-repo ingest (on Ubuntu):
   API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live

5. From Mac against LAN:
   VIRALOS_URL=${VIRALOS_URL} npm run verify:ubuntu
   VIRALOS_URL=${VIRALOS_URL} ANTHROPIC_API_KEY=... npm run verify:ubuntu:real

See docs/deploy-ubuntu.md and invest-ai docs/operations/ubuntu-production-deploy.md
EOF
}

steps

if [[ "$RUN" != "1" ]]; then
  echo ""
  echo "Dry-run only. To execute remote checks when VIRALOS_URL is reachable:"
  echo "  LAN_RESUME_RUN=1 VIRALOS_URL=${VIRALOS_URL} $0"
  exit 0
fi

if curl -sf "${VIRALOS_URL}/api/health" >/dev/null 2>&1; then
  echo ""
  echo "==> VIRALOS_URL reachable — running verify:ubuntu"
  VIRALOS_URL="$VIRALOS_URL" npm run verify:ubuntu
else
  echo ""
  echo "WARN: ${VIRALOS_URL}/api/health not reachable — run deploy on Ubuntu first."
  exit 1
fi
