#!/usr/bin/env bash
# Cursor stop hook — retro + doc sync (canonical engine in llm-gateway/plugins/_hooks)

set -u

json_field() {
  local field="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r "$field // empty" 2>/dev/null || true
  fi
}

main() {
  local input
  input=$(cat)
  local status
  status=$(printf '%s' "$input" | json_field '.status')
  if [[ "$status" != "completed" ]]; then
    exit 0
  fi

  local gw="${CURSOR_LLMAGATEWAY_ROOT:-$HOME/Desktop/llm-gateway}"
  local canonical="$gw/plugins/_hooks/retro_review_sync.py"
  if [[ -f "$canonical" ]]; then
    python3 "$canonical" <<<"$input"
    exit 0
  fi

  local script_dir
  script_dir="$(cd "$(dirname "$0")" && pwd)"
  if [[ -f "$script_dir/retro-review-sync.py" ]]; then
    python3 "$script_dir/retro-review-sync.py" <<<"$input"
  fi
  exit 0
}

main "$@"
