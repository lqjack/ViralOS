#!/usr/bin/env bash
# Fail if mock AI placeholders exist in shipped paths (lib/, pages/).
# Tests/scripts may use injected clients — excluded from scan.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PATTERN='mock campaign|dev mock|placeholder response|fake viral score|VIRALOS_MOCK|createMockClient|MOCK_AI_RESPONSE|lorem ipsum dolor'

echo "── verify no mock / hardcoded AI (ViralOS) ──"

SCAN_PATHS=(lib pages)
for dir in "${SCAN_PATHS[@]}"; do
  if [[ ! -d "$dir" ]]; then continue; fi
  if rg -q "$PATTERN" "$dir" \
    --glob '!**/*.test.*' \
    --glob '!**/real-ai-guard.js' \
    2>/dev/null; then
    echo "FAIL: mock/hardcoded AI strings under $dir/"
    rg "$PATTERN" "$dir" --glob '!**/*.test.*' --glob '!**/real-ai-guard.js' || true
    exit 1
  fi
  echo "OK: $dir/ clean"
done

if [[ -d .next ]]; then
  # Only flags that indicate a mock *implementation*, not real-ai-guard regex literals in bundles
  STALE='VIRALOS_MOCK|createMockClient|MOCK_AI_RESPONSE|Local dev mock'
  if rg -q "$STALE" .next --glob '*.js' 2>/dev/null; then
    echo "FAIL: stale .next bundles mock implementation — run: rm -rf .next && npm run build"
    exit 1
  fi
  echo "OK: .next/ bundles clean (no mock implementation)"
else
  echo "SKIP: no .next (optional after build)"
fi

echo "PASS: no mock / hardcoded AI in active paths"
