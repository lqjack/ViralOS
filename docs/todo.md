# ViralOS — Task Tracker

**Product decision:** Option A — **ViralOS-first** (shipped product is campaign generator; `docs/` holds Cognitive OS vision archive).

**Canonical issue log:** [issue.md](./issue.md) (open ops items: [issue.md § Part G](./issue.md#part-g--open-issues--operator-backlog-2026-05-27))

**Shipped summary:** [SHIPPED.md](./SHIPPED.md) · **Design traceability:** [implementation-map.md](./implementation-map.md)

---

## P3 — Operator verification (OPEN)

> Application code for the shipped design is **complete**. These items require a reachable **Ubuntu** host.

- [ ] **OPS-1** Deploy on Ubuntu: `npm run deploy:ubuntu:sync` (from Mac) or `./scripts/ubuntu/deploy-viralos.sh` (on host)
- [ ] **OPS-1** Run `npm run verify:ubuntu:all` on Ubuntu with `ANTHROPIC_API_KEY` in `.env` (func + smoke + `verify:e2e-real`)
- [ ] **OPS-3** If SSH fails: recover tunnel on Ubuntu (`llm-gateway`: `bun run recover:remote-ssh`) — see [issue.md](./issue.md) Part G
- [ ] **OPS-2** Avoid full `verify:full` on memory-constrained Mac; use `verify:func` locally
- [ ] Start invest-ai gateway on Ubuntu: `~/dataproaiset/dataproaiset/scripts/ubuntu/start-core-gateway.sh`
- [ ] **Cross-repo live:** `API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live` (on Ubuntu)
- [ ] **OPS-4** Vercel: set `ANTHROPIC_API_KEY`; only set `API_PROXY_BASE_URL` if `:8001` is publicly reachable (not `gateway.datapro.asia` :3000)
- [ ] **OPS-5** Document chosen proxy URL in Vercel env after tunnel/LAN decision

---

## P4 — Optional enhancements (backlog)

- [ ] Public Cloudflare ingress for invest-ai gateway `:8001` (enables Vercel proxy + auto-ingest from internet)
- [ ] Align or deprecate `examples/basic-campaign.js` vs `lib/campaign.js` pipeline
- [ ] NeuraDesk MCP plugin for campaigns (llm-gateway stub; cross-repo Phase 2+)
- [ ] Persistent campaign history DB (out of current design scope)

---

## P0 — Product boundary (done)

- [x] Choose ViralOS-first vs Cognitive OS-first vs split repos → **ViralOS-first**
- [x] Record decision in `docs/README.md`
- [x] Add README “Relationship to docs/” section

## P1 — ViralOS hardening (done)

- [x] Remove legacy `/route` and `/social-media-content` from landing nav
- [x] Bump Next.js past 14.2.0 security advisory → `14.2.35`
- [x] Unit tests for campaign stream (`requireRealUsage: false` inject only in tests)
- [x] Extend smoke tests (400 missing product, 405 method, health, integrations proxy)
- [x] CI runs `verify` + smoke tests (no API key in CI env)

## P1 — No mock + real E2E + Ubuntu deploy (done — code)

- [x] `lib/real-ai-guard.js` — token usage + mock phrase guards on production path
- [x] `verify:no-mock` + `verify:func` (16 tests, no API key)
- [x] 4-agent pipeline (incl. Campaign Director) + validation
- [x] `verify:e2e-real` — real Anthropic SSE (run on **Ubuntu**)
- [x] `deploy:ubuntu` / `deploy:ubuntu:sync` — build on Ubuntu `:3010`
- [x] Gateway ingest (`campaign-ingest` + SSE `ingest_done` / `ingest_error`)
- [x] `verify:ubuntu:all` — `scripts/ubuntu/verify-all-on-ubuntu.sh`
- [x] [implementation-map.md](./implementation-map.md) · [SHIPPED.md](./SHIPPED.md)
- [x] `GET /api/health` + smoke 9/9
- [x] `pages/api/integrations/viralos/` BFF proxy

## P2 — Docs hygiene (done)

- [x] `docs/README.md` index with status column
- [x] `docs/issue.md` canonical issue + gap analysis + **Part G open ops**
- [x] Cross-link shipped code (`/campaign`, `/api/campaign`, `lib/campaign.js`)
- [x] Dedupe hci-mvp / hci-mcp-target / hci-abstract → [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md)
- [x] English summary → [COGNITIVE-OS-EN.md](./COGNITIVE-OS-EN.md)
- [x] Design trilogy: [DESIGN.md](./DESIGN.md) · [system-design-architecture.md](./system-design-architecture.md) · [system-interaction-design.md](./system-interaction-design.md) · [system-control-data-flow.md](./system-control-data-flow.md)
- [x] [deploy-ubuntu.md](./deploy-ubuntu.md)

## Infrastructure (closed)

- [x] Pages Router API handlers at `pages/api/`
- [x] `/api/campaign` SSE streaming
- [x] Env-based proxy (`API_PROXY_BASE_URL`)
- [x] `.env.example`, `.gitignore`, CI workflow
- [x] `npm run build` + `npm run smoke-test`

---

## Verification checklist

```bash
# macOS — lightweight (no full build)
npm run verify:func

# macOS / CI — full
npm run verify:full

# Ubuntu (after deploy) — required for ops sign-off
npm run deploy:ubuntu:sync
npm run verify:ubuntu:all

# Ubuntu + invest-ai gateway
API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live
```

**Last verified (local):** 2026-05-27 — `verify:func` **16/16** · CI smoke **9/9**  
**Pending (operator):** `verify:ubuntu:all` on production Ubuntu — see P3 above

---

## Deferred (Cognitive OS — not in this repo scope)

- WeChat import pipeline
- FastAPI + PostgreSQL + pgvector
- Dashboard / Timeline / Insight pages
- Stripe subscription
- wx-cli / MCP integration

See [issue.md](./issue.md) Part C for full gap matrix.
