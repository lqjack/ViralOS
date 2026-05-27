# Cursor hooks (ViralOS)

## Pipeline (on Agent `stop`, `status: completed`)

| Order | Script | Purpose |
|-------|--------|---------|
| 1 | [auto-commit-push.sh](./auto-commit-push.sh) | Stage (skip secrets) → commit → push → `.session-committed` |
| 2 | [retro-review-sync.sh](./retro-review-sync.sh) | `verify:func` → gap scan → `docs/issue.md` + `docs/todo.md` |

Retro engine: **llm-gateway** `plugins/_hooks/retro_review_sync.py` (set `CURSOR_LLMAGATEWAY_ROOT` if not `~/Desktop/llm-gateway`).

## Opt-out

| File / env | Effect |
|------------|--------|
| `.cursor/no-auto-commit` | Skip commit |
| `.cursor/no-auto-retro` | Skip retro |
| `CURSOR_AUTO_COMMIT=0` | Skip commit |
| `CURSOR_RETRO_ALWAYS=1` | Retro even without commit marker |

## Logs

- `.cursor/hooks/auto-commit.log`
- `.cursor/hooks/retro-review.log`

## Off-LAN default

Hook runs `npm run verify:func` (24 tests). For optional real LLM: `npm run verify:local-design` manually.

**Practices:** [docs/PROJECT-STATUS.md](../../docs/PROJECT-STATUS.md) · llm-gateway [plugins/_hooks/BEST-PRACTICES.md](file:///Users/liu/Desktop/llm-gateway/plugins/_hooks/BEST-PRACTICES.md)
