#!/usr/bin/env bash
# macOS → Ubuntu: rsync sources, then remote build + start on Ubuntu (not localhost).
set -euo pipefail

REMOTE="${REMOTE:-jack@ssh.datapro.asia}"
REMOTE_DIR="${REMOTE_DIR:-~/ViralOS}"
VIRALOS_PORT="${VIRALOS_PORT:-3010}"

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=25)
if [[ -n "${DATAPRO_SSH_IDENTITY:-}" && -f "${DATAPRO_SSH_IDENTITY}" ]]; then
  SSH_OPTS+=(-i "${DATAPRO_SSH_IDENTITY}")
fi

echo "==> Sync ViralOS → ${REMOTE}:${REMOTE_DIR}"
rsync -avz --delete "${SSH_OPTS[@]}" \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env' \
  --exclude '.env.local' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo "==> Deploy on Ubuntu (build + start PORT=${VIRALOS_PORT})"
ssh "${SSH_OPTS[@]}" "$REMOTE" \
  "cd ${REMOTE_DIR} && chmod +x scripts/ubuntu/*.sh && VIRALOS_DIR=${REMOTE_DIR} VIRALOS_PORT=${VIRALOS_PORT} ./scripts/ubuntu/deploy-viralos.sh"

echo ""
echo "Done. Remote base: http://127.0.0.1:${VIRALOS_PORT} (on Ubuntu)"
echo "From mac (LAN):   VIRALOS_URL=http://192.168.1.4:${VIRALOS_PORT} npm run verify:ubuntu"
