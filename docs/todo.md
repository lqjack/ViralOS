# ViralOS — Task Tracker

**Product decision:** Option A — **ViralOS-first** (shipped product is campaign generator; `docs/` holds Cognitive OS vision archive).

**Canonical issue log:** [issue.md](./issue.md)

---

## P0 — Product boundary

- [x] Choose ViralOS-first vs Cognitive OS-first vs split repos → **ViralOS-first**
- [x] Record decision in `docs/README.md`
- [x] Add README “Relationship to docs/” section

## P1 — ViralOS hardening

- [x] Remove legacy `/route` and `/social-media-content` from landing nav
- [x] Bump Next.js past 14.2.0 security advisory → `14.2.35`
- [x] Add unit test for campaign stream (`lib/campaign.js` mock)
- [x] Extend smoke tests (400 missing product, 405 method)
- [x] CI runs unit tests + smoke tests (no API key in CI env)

## P2 — Docs hygiene

- [x] `docs/README.md` index with status column
- [x] `docs/issue.md` canonical issue + gap analysis
- [x] Cross-link shipped code (`/campaign`, `/api/campaign`, `lib/campaign.js`)
- [x] Dedupe hci-mvp / hci-mcp-target / hci-abstract → [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md)
- [x] English summary for international contributors → [COGNITIVE-OS-EN.md](./COGNITIVE-OS-EN.md)

## Infrastructure (from Part A — closed)

- [x] Pages Router API handlers at `pages/api/`
- [x] `/api/campaign` SSE streaming
- [x] Env-based proxy (`API_PROXY_BASE_URL`)
- [x] `.env.example`, `.gitignore`, CI workflow
- [x] `npm run build` + `npm run smoke-test`

## Verification checklist

```bash
npm run verify          # build + unit tests (2 tests)
npm run verify:full     # build + tests + smoke (8 checks, server auto-started)
# Or manually:
npm run start &         # production server (unset ANTHROPIC_API_KEY for smoke)
ANTHROPIC_API_KEY= npm run smoke-test
```

**Last verified:** 2026-05-27 — `verify` pass · smoke **8/8** (with empty API key)

---

## Deferred (Cognitive OS — not in this repo scope)

- WeChat import pipeline
- FastAPI + PostgreSQL + pgvector
- Dashboard / Timeline / Insight pages
- Stripe subscription
- wx-cli / MCP integration

See [issue.md](./issue.md) Part C for full gap matrix.
