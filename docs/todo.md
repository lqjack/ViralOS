# ViralOS — Task Tracker

**Product decision:** Option A — **ViralOS-first** (shipped product is campaign generator; `docs/` holds Cognitive OS vision archive).

**Canonical issue log:** [issue.md](./issue.md) · **Retro:** [issue.md § Part H](./issue.md#part-h--engineering-retrospective-2026-05-27)

**Status snapshot:** [PROJECT-STATUS.md](./PROJECT-STATUS.md) · **Shipped:** [SHIPPED.md](./SHIPPED.md) · **Traceability:** [implementation-map.md](./implementation-map.md)

**Code HEAD:** `5296ec8` (update on each status sync commit)

<!-- CURSOR_HOOK_TODO:START -->
<!-- Hook priorities — updated by retro-review-sync after auto-commit -->
<!-- CURSOR_HOOK_TODO:END -->

---

## Retro summary (2026-05-27)

| Area | Status |
|------|--------|
| P0–P2 application + docs for shipped design | **Done** — see [SHIPPED.md](./SHIPPED.md) |
| Design trilogy ↔ code traceability | **Done** — [implementation-map.md](./implementation-map.md) |
| No-mock production path | **Done** — `verify:no-mock` + `real-ai-guard` |
| Local verification | **Done** — `verify:func` **24/24**; off-LAN: `verify:local-design` |
| CI smoke | **10/10** (after `npm run build`) |
| Ubuntu ops sign-off | **Open** — [issue.md Part G](./issue.md#part-g--open-issues--operator-backlog-2026-05-27) OPS-1–5 |
| Cognitive OS MVP | **Deferred** — not this repo |

---

## P3 — Operator verification (OPEN · LAN-deferred)

> **LAN deferral (2026-05-27):** Ubuntu deploy/E2E paused until same-LAN or console access. **Until then:** `npm run verify:local-design` on macOS.

| ID | Task | Command / action |
|----|------|------------------|
| **OPS-1** | Deploy ViralOS on Ubuntu | `npm run deploy:ubuntu:sync` (Mac) or `./scripts/ubuntu/deploy-viralos.sh` (host) |
| **OPS-1** | Sign off real LLM E2E | `ANTHROPIC_API_KEY` in `~/ViralOS/.env` → `npm run verify:ubuntu:all` |
| **OPS-2** | Do not rely on Mac for full build | `verify:func` or `verify:local-design` on Mac; `verify:full` on CI/Ubuntu |
| **OPS-3** | Fix SSH if sync fails | **Now:** `npm run verify:local-design`. **LAN:** `recover:remote-ssh` then `deploy:ubuntu:sync` |
| **OPS-4** | Vercel env | Set `ANTHROPIC_API_KEY` (required). `API_PROXY_BASE_URL` only if `:8001` is public |
| **OPS-5** | Correct proxy target | Ubuntu/LAN: `http://127.0.0.1:8001` or `http://192.168.1.4:8001` — not `gateway.datapro.asia:3000` |
| — | Start invest-ai gateway | `~/dataproaiset/dataproaiset/scripts/ubuntu/start-core-gateway.sh` |
| — | Cross-repo live ingest | `API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live` |

Checklist:

- [ ] **OPS-1** Deploy on Ubuntu (`deploy:ubuntu:sync` or `deploy-viralos.sh`)
- [ ] **OPS-1** `npm run verify:ubuntu:all` passes (func + smoke + real E2E)
- [ ] **OPS-3** SSH/tunnel stable (until then use `verify:local-design` on Mac)
- [ ] invest-ai gateway running on `:8001`
- [ ] `verify:cross-repo-live` passes on Ubuntu
- [ ] **OPS-4** Vercel `ANTHROPIC_API_KEY` set; proxy URL documented only if reachable

**LAN resume:** [lan-resume-checklist.md](./lan-resume-checklist.md) · `npm run verify:lan-resume`

---

## P2 — Local design (off-LAN) ✅

- [x] `examples/basic-campaign.js` + `npm run demo` (real `streamCampaign`)
- [x] `npm run verify:local-design` / `verify:all` (default gate)
- [x] [lan-resume-checklist.md](./lan-resume-checklist.md) for post-LAN ops

---

## P4 — Optional enhancements (backlog)

- [ ] Public Cloudflare ingress for invest-ai gateway `:8001` (enables Vercel proxy + auto-ingest from internet)
- [x] `examples/basic-campaign.js` wired to `streamCampaign` (used by `verify:local-design` CLI path)
- [x] Document CLI vs HTTP API — [examples/README.md](../examples/README.md) + README programmatic access table
- [ ] NeuraDesk MCP plugin for campaigns (llm-gateway stub; cross-repo Phase 2+)
- [ ] Persistent campaign history DB (out of current design scope)

---

## P0 — Product boundary ✅

- [x] Choose ViralOS-first vs Cognitive OS-first vs split repos → **ViralOS-first**
- [x] Record decision in `docs/README.md`
- [x] Add README “Relationship to docs/” section

---

## P1 — ViralOS hardening ✅

- [x] Remove legacy `/route` and `/social-media-content` from landing nav
- [x] Bump Next.js past 14.2.0 security advisory → `14.2.35`
- [x] Unit tests for campaign stream (`requireRealUsage: false` inject only in tests)
- [x] Smoke: 400/405, health, integrations proxy, campaign metadata with `agents[]`
- [x] CI: `verify:func` + build + smoke (no API key)

---

## P1 — No mock + real E2E + Ubuntu deploy ✅ (code)

- [x] `lib/real-ai-guard.js` — token usage + mock phrase guards
- [x] `verify:no-mock` + `verify:func`
- [x] 4-agent pipeline (incl. Campaign Director) + validation
- [x] `verify:e2e-real` — real Anthropic SSE (run on **Ubuntu**)
- [x] `deploy:ubuntu` / `deploy:ubuntu:sync` — PORT **3010**
- [x] Gateway ingest + SSE `ingest_done` / `ingest_error`
- [x] `verify:ubuntu:all` script
- [x] [implementation-map.md](./implementation-map.md) · [SHIPPED.md](./SHIPPED.md)
- [x] `pages/api/integrations/viralos/` BFF proxy

---

## P2 — Cross-repo client & quality ✅

- [x] Gateway client unit tests (`fetchRouteCatalog`, `ingestCampaign`, `searchCampaigns`, schema)
- [x] SSE pipeline contract tests (`sse-campaign-e2e.test.mjs`)
- [x] `GET /api/health` liveness + smoke
- [ ] `verify:cross-repo-live` on Ubuntu with gateway running → **moved to P3**

---

## P2 — Docs hygiene ✅

- [x] `docs/README.md` index with status column
- [x] `docs/issue.md` retro (Part H) + gap analysis + Part G ops backlog
- [x] Cross-link shipped code (`/campaign`, `/api/campaign`, `lib/campaign.js`)
- [x] [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md) · [COGNITIVE-OS-EN.md](./COGNITIVE-OS-EN.md)
- [x] Design trilogy + [deploy-ubuntu.md](./deploy-ubuntu.md)

---

## Infrastructure ✅

- [x] Pages Router API at `pages/api/`
- [x] `/api/campaign` SSE streaming
- [x] Env-based proxy (`API_PROXY_BASE_URL`)
- [x] `.env.example`, `.gitignore`, CI workflow
- [x] `npm run build` + smoke-test

---

## Verification checklist

```bash
# macOS — off-LAN default (no Ubuntu, no full build)
npm run verify:local-design  # verify:func + optional CLI real LLM

# macOS — unit tests only
npm run verify:func          # 24/24 + no-mock

# macOS / CI — full
npm run verify:full          # build + smoke 10/10

# Ubuntu — ops sign-off (required for production claim)
npm run deploy:ubuntu:sync
npm run verify:ubuntu:all

# Ubuntu + invest-ai gateway
API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live
```

| Gate | Last run (2026-05-27) | Where |
|------|------------------------|-------|
| `verify:func` | **24/24** PASS | macOS |
| `verify:local-design` | func PASS; CLI LLM if key set | macOS (OPS-3 workaround) |
| `verify:full` | **10/10** smoke (after build) | macOS / CI |
| `verify:ubuntu:all` | Not run | Ubuntu — **P3** |
| `verify:cross-repo-live` | Not run | Ubuntu + gateway — **P3** |

---

## Deferred (Cognitive OS — not in this repo scope)

- WeChat import pipeline
- FastAPI + PostgreSQL + pgvector
- Dashboard / Timeline / Insight pages
- Stripe subscription
- wx-cli / MCP integration

See [issue.md](./issue.md) Part C for full gap matrix.
