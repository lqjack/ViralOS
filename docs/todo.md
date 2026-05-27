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
- [x] Shipped product design trilogy: [DESIGN.md](./DESIGN.md) · [system-design-architecture.md](./system-design-architecture.md) · [system-interaction-design.md](./system-interaction-design.md) · [system-control-data-flow.md](./system-control-data-flow.md)
- [x] Root `README.md` links to design trilogy + cross-repo roadmap

## Infrastructure (from Part A — closed)

- [x] Pages Router API handlers at `pages/api/`
- [x] `/api/campaign` SSE streaming
- [x] Env-based proxy (`API_PROXY_BASE_URL`)
- [x] `.env.example`, `.gitignore`, CI workflow
- [x] `npm run build` + `npm run smoke-test`

## P1 — No mock + real E2E + Ubuntu deploy

- [x] `lib/real-ai-guard.js` — token usage + mock phrase guards on production path
- [x] `verify:no-mock` + `verify:func` (13 tests, no API key)
- [x] 4-agent pipeline (incl. Campaign Director package step) + validation
- [x] `verify:e2e-real` — real Anthropic SSE (run on **Ubuntu**, not OOM macOS)
- [x] `deploy:ubuntu` / `deploy:ubuntu:sync` — build on Ubuntu :3010
- [x] [deploy-ubuntu.md](./deploy-ubuntu.md) — ops guide

## Verification checklist

```bash
# macOS — lightweight (no build)
npm run verify:func

# macOS — full build + smoke (heavy; prefer Ubuntu)
npm run verify:full

# Ubuntu (after deploy) — recommended
npm run deploy:ubuntu:sync          # from mac
npm run verify:ubuntu               # smoke vs VIRALOS_URL
ANTHROPIC_API_KEY=... npm run verify:ubuntu:real   # real LLM E2E

# On Ubuntu host
SMOKE_TEST_URL=http://127.0.0.1:3010 npm run verify:e2e-real
```

**Last verified:** 2026-05-27 — `verify:func` 13/13 · deploy target **Ubuntu :3010**

---

## Deferred (Cognitive OS — not in this repo scope)

- WeChat import pipeline
- FastAPI + PostgreSQL + pgvector
- Dashboard / Timeline / Insight pages
- Stripe subscription
- wx-cli / MCP integration

See [issue.md](./issue.md) Part C for full gap matrix.
