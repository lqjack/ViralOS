# Issue: Vercel Deployment, Product Identity Drift & docs/ Design Gap

**Status:** Shipped (code complete) · **Open:** operator verification on Ubuntu  
**Severity:** High (deploy) — **closed** · Medium (ops sign-off) — **open**  
**Reported:** 2026-05-22  
**Last reviewed:** 2026-05-28 (local verification pass; P3 LAN still blocked)  
**Last updated:** 2026-05-28  
**Code HEAD:** see [PROJECT-STATUS.md](./PROJECT-STATUS.md) · `git log -1`

<!-- CURSOR_HOOK_RETRO:START -->
## Hook retro (auto) — 2026-05-28 14:03 UTC

| Field | Value |
|-------|-------|
| Profile | `viralos` |
| Root | `/Users/liu/Desktop/ViralOS` |
| HEAD | `6f7cf95` |
| Verify | `npm run verify:func` → **PASS** |

**Practices:** [docs/PROJECT-STATUS.md](./PROJECT-STATUS.md) · off-LAN `verify:local-design`

### Session changes (last commit)

- `docs/PROJECT-STATUS.md`
- `docs/issue.md`
- `docs/todo.md`
- `scripts/deploy-ubuntu-sync.sh`
- `scripts/smoke-test.mjs`
- `scripts/ubuntu/deploy-viralos.sh`
- `scripts/ubuntu/verify-all-on-ubuntu.sh`

### Design vs implementation gaps

- **P3** — (existing backlog) (existing backlog) **OPS-1** Deploy on Ubuntu (`deploy:ubuntu:sync` or `deploy-viralos.sh`)
- **P3** — (existing backlog) (existing backlog) **OPS-1** `npm run verify:ubuntu:all` passes (func + smoke + real E2E)
- **P3** — (existing backlog) (existing backlog) **OPS-3** SSH/tunnel stable (until then use `verify:local-design` on Mac)
- **P3** — (existing backlog) (existing backlog) **OPS-4** Vercel `ANTHROPIC_API_KEY` set; proxy URL documented only if reachable
- **P3** — (existing backlog) (existing backlog) `verify:cross-repo-live` passes on Ubuntu
- **P3** — (existing backlog) (existing backlog) invest-ai gateway running on `:8001`

### Verify output (tail)

```
btest: ingestCampaign POSTs viralos-campaign-v1 body
ok 13 - ingestCampaign POSTs viralos-campaign-v1 body
  ---
  duration_ms: 0.99237
  type: 'test'
  ...
# Subtest: ingestCampaign sends x-viralos-ingest-token when set
ok 14 - ingestCampaign sends x-viralos-ingest-token when set
  ---
  duration_ms: 1.256141
  type: 'test'
  ...
# Subtest: searchCampaigns passes query params
ok 15 - searchCampaigns passes query params
  ---
  duration_ms: 1.043114
  type: 'test'
  ...
# Subtest: hasRealTokenUsage requires tokens
ok 16 - hasRealTokenUsage requires tokens
  ---
  duration_ms: 8.301722
  type: 'test'
  ...
# Subtest: assertRealAgentUsage throws without usage
ok 17 - assertRealAgentUsage throws without usage
  ---
  duration_ms: 0.565589
  type: 'test'
  ...
# Subtest: assertNoMockContent rejects mock phrases
ok 18 - assertNoMockContent rejects mock phrases
  ---
  duration_ms: 0.390664
  type: 'test'
  ...
# Subtest: assertRealCampaignUsage requires all three agents
ok 19 - assertRealCampaignUsage requires all three agents
  ---
  duration_ms: 0.552409
  type: 'test'
  ...
# Subtest: assertCampaignE2eEvents accepts full 4-agent pipeline
ok 20 - assertCampaignE2eEvents accepts full 4-agent pipeline
  ---
  duration_ms: 1.63296
  type: 'test'
  ...
# Subtest: assertCampaignE2eEvents rejects missing complete
ok 21 - assertCampaignE2eEvents rejects missing complete
  ---
  duration_ms: 0.651351
  type: 'test'
  ...
# Subtest: assertCampaignE2eEvents rejects validation failure
ok 22 - assertCampaignE2eEvents rejects validation failure
  ---
  duration_ms: 5.916012
  type: 'test'
  ...
# Subtest: parseSseBuffer extracts JSON events
ok 23 - parseSseBuffer extracts JSON events
  ---
  duration_ms: 1.272
  type: 'test'
  ...
# Subtest: parseSseBuffer keeps partial remainder
ok 24 - parseSseBuffer keeps partial remainder
  ---
  duration_ms: 0.281895
  type: 'test'
  ...
1..24
# tests 24
# suites 0
# pass 24
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 781.809282
```

**Next:** Fix [todo.md](./todo.md) § Hook priorities (auto-sync), P0→P1 first, re-run verify.

<!-- CURSOR_HOOK_RETRO:END -->

---

## Executive Conclusion

Three separate problems were folded into one repo:

| Layer | Problem | Status |
|-------|---------|--------|
| **Infrastructure** | Wrong `vercel.json`, API in `/api/` not `/pages/api/`, App Router syntax in Pages Router | **Resolved** (2026-05-27) |
| **Product identity** | README/code ship **ViralOS**; `docs/` = Cognitive OS vision archive | **Resolved** — ViralOS-first (2026-05-27) |
| **Documentation** | 17 design docs without index or code links | **Resolved** — `docs/README.md`, design trilogy ([DESIGN.md](./DESIGN.md)), `docs/todo.md`, this file |

The May 2026 deploy incident was a **symptom**, not the root strategic issue. Inherited `dataproai-set` Vercel config and proxy tunnels suggest the repo absorbed artifacts from prior projects (dataproai, Cognitive OS, ViralOS) without a single product boundary or docs-to-code traceability gate.

**Verdict:** ViralOS campaign path is **implemented and documented** ([SHIPPED.md](./SHIPPED.md), [implementation-map.md](./implementation-map.md)). Cognitive OS remains a **deferred vision** in `docs/` — not current implementation spec.

**Remaining work is operator-side:** deploy on Ubuntu, run real Anthropic E2E, and optional cross-repo gateway ingest — not missing application code for the shipped product.

**Task tracker:** [todo.md](./todo.md)

---

# Part G — Open Issues & Operator Backlog (2026-05-27)

> **LAN deferral (2026-05-27):** Remote Ubuntu / cross-public-network access is **unreliable**. All **OPS-*** items below are **paused until same-LAN** access to `192.168.1.4` or physical console. Until then, use `npm run verify:local-design` on macOS.

## Active issues (not code blockers)

| ID | Issue | Impact | Mitigation |
|----|--------|--------|------------|
| **OPS-1** | **Ubuntu deploy + real E2E not signed off** | Cannot claim production-ready until `verify:ubuntu:all` on host | **Deferred off-LAN.** On LAN: `deploy:ubuntu:sync` → `verify:ubuntu:all` |
| **OPS-2** | **macOS insufficient CPU/RAM** for full `next build` / long LLM runs | Local `verify:full` / `verify:e2e-real` OOM or timeout | `npm run verify:local-design` or `verify:func` on Mac; `verify:full` on CI/Ubuntu ([deploy-ubuntu.md](./deploy-ubuntu.md)) |
| **OPS-3** | **SSH / tunnel to Ubuntu** may be down (`frpc`, cloudflared linux connector) | `deploy:ubuntu:sync` fails from Mac over public internet | **Now:** `npm run verify:local-design`. **LAN/console:** `recover:remote-ssh` — [cloudflared-tunnel-stability](https://github.com/lqjack/dataproaiset/blob/main/docs/operations/cloudflared-tunnel-stability.md) |
| **OPS-4** | **`API_PROXY_BASE_URL` on Vercel** cannot reach LAN `:8001` | Proxy routes + auto-ingest fail on public deploy | Campaign LLM still works via `ANTHROPIC_API_KEY`; set proxy only when invest-ai gateway is **publicly reachable** (dedicated tunnel hostname → `:8001`, not `gateway.datapro.asia` :3000) |
| **OPS-5** | **Hostname confusion** `gateway.datapro.asia` vs invest-ai gateway | Wrong proxy target | `gateway.datapro.asia` → llm-gateway **:3000**; ViralOS proxy/ingest → invest-ai **:8001** (`http://127.0.0.1:8001` on Ubuntu, `http://192.168.1.4:8001` from LAN) |

## Pending updates (tracked in [todo.md](./todo.md))

| Priority | Item | Owner |
|----------|------|--------|
| P3 *(LAN only)* | Ubuntu: `verify:ubuntu:all` + `verify:e2e-real` with live `ANTHROPIC_API_KEY` | Operator |
| P3 *(LAN only)* | Ubuntu: invest-ai `start-core-gateway.sh` + `verify:cross-repo-live` | Operator |
| P3 | Off-LAN now: `npm run verify:local-design` (func + optional CLI LLM) | Dev |
| P3 | Vercel project env: `ANTHROPIC_API_KEY` (required); `API_PROXY_BASE_URL` only if public :8001 | Operator |
| P4 | Optional: Cloudflare ingress for invest-ai `:8001` (Vercel proxy + ingest from internet) | Infra |
| P4 | `examples/basic-campaign.js` align with `streamCampaign` / document as CLI alternative | Dev |
| — | Cognitive OS MVP (Option B) | **Deferred** — see Part E |

## Resolved since last issue sync (local, off-LAN)

- [x] `examples/basic-campaign.js` — CLI `streamCampaign` (real Anthropic, no mock)  
- [x] `npm run verify:local-design` — func + optional CLI while Ubuntu ops deferred  
- [x] Gateway client search/ingest/schema + mock-fetch unit tests  

## Resolved (earlier)

- [x] Design trilogy + [implementation-map.md](./implementation-map.md) traceability  
- [x] No-mock production path (`real-ai-guard`, `verify:no-mock`)  
- [x] 4-agent pipeline, validation, gateway ingest SSE (`ingest_done` / `ingest_error`)  
- [x] Ubuntu deploy scripts + [deploy-ubuntu.md](./deploy-ubuntu.md)  
- [x] `GET /api/health` for canary (smoke **10/10**)  
- [x] `pages/api/integrations/viralos/` BFF proxy  
- [x] Gateway client offline tests (`gateway-client.test.mjs`) — catalog, schema, ingest, search  
- [x] SSE contract tests (`sse-campaign-e2e.test.mjs`) — 4-agent `assertCampaignE2eEvents`  
- [x] [SHIPPED.md](./SHIPPED.md) — shipped vs operator backlog  
- [x] CI: `verify:func` **24/24** (no API key)

## Retro → open work mapping

| Retro finding | Open item | Doc |
|---------------|-----------|-----|
| Code matches design trilogy for ViralOS | — | [SHIPPED.md](./SHIPPED.md) |
| No production mock path | — | `verify:no-mock` |
| Ubuntu not signed off in dev env | **OPS-1** | [todo.md § P3](./todo.md#p3--operator-verification-open) |
| Mac OOM on `next build` | **OPS-2** | [deploy-ubuntu.md](./deploy-ubuntu.md) |
| `deploy:ubuntu:sync` SSH timeout | **OPS-3** | invest-ai tunnel docs |
| Vercel cannot hit LAN `:8001` | **OPS-4** | Part G below |
| Wrong hostname for proxy | **OPS-5** | [cross-repo-reuse-and-roadmap.md](./cross-repo-reuse-and-roadmap.md) |

---

# Part H — Engineering Retrospective (2026-05-27)

## What we set out to fix

1. **Deploy incident** — Vercel 404s from wrong router paths and inherited `vercel.json`.  
2. **Product drift** — Cognitive OS vision docs vs shipped ViralOS campaign generator in one repo.  
3. **Design without traceability** — No map from trilogy docs → `lib/` / `pages/api/`.  
4. **“Mock” risk** — Campaign path must use real Anthropic usage in production.  
5. **Wrong dev machine** — macOS OOM; build and real LLM E2E belong on **Ubuntu :3010**.

## What shipped (this cycle)

| Deliverable | Evidence |
|-------------|----------|
| ViralOS-first boundary | `docs/README.md`, README, Part D closed |
| 4-agent pipeline + director package step | `lib/campaign.js`, `AGENT_ORDER` |
| Real-AI guards | `lib/real-ai-guard.js`, `requireRealUsage` default `true` |
| Campaign UI (stepper + structured result) | `pages/campaign.js` |
| Design trilogy + implementation map | `docs/DESIGN.md`, `system-design-*.md`, `implementation-map.md` |
| Gateway ingest + BFF | `campaign-ingest.js`, `integrations/viralos` proxy |
| Verification ladder | `verify:func` → `verify:full` → `verify:ubuntu:*` → `verify:cross-repo-live` |
| Health + expanded tests | `/api/health`, **24** unit tests, **10** smoke checks |

## What went well

- **Single product decision** (Option A) stopped scope creep into Cognitive OS for this repo.  
- **Traceability matrix** (`implementation-map.md`) makes “is the design implemented?” answerable.  
- **No-mock gate** catches hardcoded AI text and missing token usage before merge.  
- **Tests without API keys** — inject `createClient` only in `campaign-lib.test.mjs`; production path unchanged.  
- **Env-gated proxies** — legacy dataproai routes return 503 with hint instead of silent failure.

## What did not go well

| Problem | Root cause | Lesson |
|---------|------------|--------|
| Ubuntu deploy unverified | SSH/tunnel to `ssh.datapro.asia` intermittent | Treat **OPS sign-off** as release gate, not optional |
| Mac `verify:full` heavy | RAM for `next build` + dev server | CI on GitHub Ubuntu; local Mac uses `verify:func` or `verify:local-design` |
| SSH to Ubuntu down | Tunnel/frp intermittent | `verify:local-design` until LAN; defer `deploy:ubuntu:sync` |
| docs/ still large | 17 hci files unchanged in scope | Vision archive OK; **do not** implement from hci-* without new decision |
| Cross-repo ingest untested live | invest-ai `:8001` not running in agent session | Run `verify:cross-repo-live` on Ubuntu after `start-core-gateway.sh` |

## Metrics (local, 2026-05-28)

| Gate | Result | Notes |
|------|--------|-------|
| `npm run verify:no-mock` | PASS | `lib/`, `pages/`, `.next/` scan |
| `npm run verify:func` | **24/24** | incl. gateway + SSE contract tests |
| `npm run verify:local-design` | **PASS** | func always; CLI skipped without `.env.local` `sk-ant-*` |
| `npm run verify:full` | build + **10/10** smoke | after `npm run build` |
| `verify:ubuntu:all` | **PASS** (func + smoke) | Ubuntu `192.168.1.4:3010`; real E2E pending `.env` key |
| `verify:cross-repo-live` | **PASS** | LAN gateway `:8001` + ingest |
| `deploy:ubuntu:sync` | **PASS** | `REMOTE=jack@192.168.1.4` (rsync `-e ssh` fix) |

## Decisions (record)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | ViralOS-first; Cognitive OS deferred | Shipped code is campaign generator only |
| D2 | Real Anthropic only in production | `real-ai-guard` + `verify:no-mock` |
| D3 | Ubuntu for build + real E2E | Mac OOM; PORT **3010** |
| D4 | Proxy optional, 503 when unset | Vercel may not reach LAN gateway |
| D5 | `gateway.datapro.asia` ≠ invest-ai ingest | :3000 llm-gateway vs :8001 invest-ai |

## Action items (synced to [todo.md](./todo.md))

All open work is **P3 operator** or **P4 optional** — no P0–P2 code gaps for the shipped product.

---

# Part A — Deployment & API Issue (Resolved)

## Summary

ViralOS failed to deploy and serve API endpoints on Vercel. Root causes: inherited wrong `vercel.json`, API routes in `/api/` instead of `/pages/api/`, App Router handler syntax in a Pages Router app, and hardcoded ephemeral Cloudflare tunnel URLs.

## Timeline

| Commit | Time (UTC+8) | Action |
|--------|--------------|--------|
| `77bd90d` | 08:08 | Initial commit. `vercel.json` for **dataproai-set** (static build + Cloudflare rewrites). |
| `62049ff` | 08:22 | Next.js pages + API under wrong `/api/` path. |
| `8cedbc7` | 08:31 | social-media-content route + rewrite for 404. |
| `62a4e65` | 09:00 | Moved routes to `/pages/api/`. |
| `ff1f277` | 09:09 | Stripped `vercel.json` rewrites. |

## Fix Log (2026-05-27)

### Phase 1–2 — API & routing

| Change | File(s) |
|--------|---------|
| Campaign SSE logic → shared module | `lib/campaign.js` |
| Pages Router `/api/campaign` | `pages/api/campaign.js` |
| Real `/api/route` handler | `pages/api/route.js` |
| Env-based proxy (`API_PROXY_BASE_URL`) | `lib/proxy.js`, `pages/api/*/[[...slug]].js` |
| Removed App Router syntax | all `pages/api/**` |
| Env template + gitignore | `.env.example`, `.gitignore` |
| Fixed invalid `className` → `style` | `pages/*.js` |

### Phase 3 — UI, README, CI

| Change | File(s) |
|--------|---------|
| Campaign generator UI (SSE) | `pages/campaign.js` |
| Landing CTA → `/campaign` | `pages/index.js` |
| README aligned to Pages Router reality | `README.md` |
| Smoke tests + GitHub Actions | `scripts/smoke-test.mjs`, `.github/workflows/ci.yml` |

### Phase 4 — System design trilogy (2026-05-27)

| Change | File(s) |
|--------|---------|
| Design index + architecture / interaction / control-flow docs | `docs/DESIGN.md`, `docs/system-design-*.md`, `docs/system-control-data-flow.md` |
| README + doc index + cross-repo links | `README.md`, `docs/README.md`, `docs/cross-repo-reuse-and-roadmap.md`, `docs/todo.md` |
| Campaign engine aligned to documented pipeline (validation, exports) | `lib/campaign.js`, `lib/campaign-validate.js`, `lib/sse-parse.js` |
| Gateway auto-ingest after `complete` (Phase 4.3) | `lib/campaign-ingest.js`, `lib/gateway-client.js`, SSE `ingest_done` / `ingest_error` |
| No-mock production guards + Ubuntu deploy/verify | `lib/real-ai-guard.js`, `scripts/verify-no-mock.sh`, `docs/deploy-ubuntu.md`, `scripts/ubuntu/deploy-viralos.sh` |

### Phase 5 — Shipped status sync (2026-05-27)

| Change | File(s) |
|--------|---------|
| Design ↔ code map + shipped summary | `docs/implementation-map.md`, `docs/SHIPPED.md` |
| Health probe | `pages/api/health.js` |
| SSE E2E assertion tests | `scripts/sse-campaign-e2e.test.mjs` |
| Integrations BFF route | `pages/api/integrations/viralos/[[...slug]].js` |
| Open issues / operator backlog | `docs/issue.md` Part G, `docs/todo.md` P3 |

## Deployment Acceptance Criteria

- [x] `npm run build` succeeds locally and on Vercel
- [x] `GET /` serves ViralOS landing page
- [x] `POST /api/campaign` streams SSE when `ANTHROPIC_API_KEY` is set
- [x] No hardcoded tunnel URLs in source
- [x] README matches router model and layout
- [x] Proxy routes return 503 with hint when `API_PROXY_BASE_URL` unset
- [x] CI: `verify:func` (16 tests) + build + smoke (9/9)
- [x] Ubuntu deploy + `verify:ubuntu:all` documented
- [ ] **Operator sign-off:** `verify:ubuntu:all` on production Ubuntu host (see Part G OPS-1)
- [ ] **Operator sign-off:** `verify:cross-repo-live` with gateway on Ubuntu (see Part G)

## Lessons (infra)

1. Audit inherited `vercel.json` before first deploy.
2. One router model per repo (Pages vs App).
3. Verify production after every routing change.
4. Never hardcode Cloudflare quick-tunnel URLs.
5. Wire the hero API (`/api/campaign`) before proxy/stub routes.

---

# Part B — docs/ Retro & Review

## Inventory (17 files)

| File | Stated focus | Maturity |
|------|--------------|----------|
| `hci-abstract.md` | Cognitive Insight Engine — paywall, episode builder, behavioral state machine | Vision / business |
| `hci-mvp.md` | Personal Cognitive Mirror v0.1 — WeChat weekly life report | MVP spec |
| `hci-mcp-target.md` | 30-day paid MVP — import → classify → explain → Stripe | Execution plan |
| `hci-landingpage.md` | Personal Cognitive OS landing (Tailwind, WeChat upload CTA) | UI spec (not built) |
| `hci-arch.md` | Monorepo, microservices, K8s, memory engine | Architecture stub |
| `hci.md` | Index note — Human Cognitive Infrastructure scope | Meta only |
| `hci-Universal-Human-Cognitive-OS.md` | Unified Cognitive Event abstraction (beyond WeChat) | Platform vision |
| `hci-Multi-Human-Cognitive-Infrastructure.md` | Group/family cognitive infra, identity isolation | Phase 3+ vision |
| `hci-cog-storage-eng.md` | Temporal cognitive compression, episode storage | Data engine spec |
| `hci-bussines.md` | B2C/B2B pricing, Cognitive Intelligence Infrastructure | Business model |
| `wechat-based-hci.md` | 10-year WeChat as life time-series DB | Data philosophy |
| `wechat-based-hci-clean-data.md` | WeChat data cleaning pipeline | Pipeline spec |
| `wxcli-arch.md` | wx-cli local daemon for encrypted WeChat DB access | Integration reference |
| `wx-whole.md` | (WeChat ecosystem — full stack context) | Ecosystem note |
| `pg-os.md` | Personal Growth OS — cognitive object runtime, monorepo skeleton | Code architecture |
| `pgco.md` | Personal Growth Cognitive Objects (PGCO) object model | Domain model |
| `cpn.md` | GitHub as Cognitive Production Network integration | Platform extension |

## What docs/ do well

- **Clear north star:** “制造人第一次看见自己的认知冲击” — cognitive shock, not generic AI chat.
- **MVP discipline (on paper):** `hci-mvp.md` and `hci-mcp-target.md` correctly converge on one wedge: **weekly cognitive report from WeChat batch import**.
- **Commercial logic:** Free preview vs paid “why / trend / action” (`hci-abstract.md`, `hci-bussines.md`).
- **Technical depth:** Episode builder, behavioral state machine, PGCO object model, cleaning pipeline — enough for engineering kickoff **if scoped to a separate repo or phase**.

## What docs/ do poorly

| Gap | Impact |
|-----|--------|
| **No `docs/README.md` or index** | 17 files, no entry point, no reading order |
| **No link to repo code** | Zero references to `pages/`, `lib/`, or `/api/campaign` |
| **No status labels** (vision / spec / implemented) | Readers cannot tell design from shipped |
| **Language split** | Docs mostly Chinese; README English — onboarding friction |
| **Stack assumes FastAPI + PostgreSQL + pgvector** | Repo is Next.js Pages Router only, no Python, no DB |
| **Landing spec unused** | `hci-landingpage.md` Tailwind page ≠ `pages/index.js` inline styles |
| **Duplicate / overlapping scope** | hci-mvp, hci-mcp-target, hci-abstract repeat same MVP with different emphasis |
| **No test or acceptance matrix for docs** | Design cannot be verified against code |

## docs/ Retro Summary

```
Design maturity:  ████████░░  Strong product thinking, weak engineering traceability
Code alignment:   █░░░░░░░░░  ~5% overlap (Next.js mentioned; agents concept only)
Deploy relevance: ██░░░░░░░░  Explains why proxy/tunnel routes existed (legacy backends)
```

The docs read like a **pre-code design archive** for “Personal Cognitive OS.” They were never reconciled with the **ViralOS campaign generator** that actually shipped.

---

# Part C — Design vs Implementation Gap

## Two products in one repository

| Dimension | `docs/` design (Cognitive OS) | Shipped code (ViralOS) |
|-----------|------------------------------|-------------------------|
| **Job to be done** | “Understand my behavior / life changes” | “Generate viral marketing campaign for a product” |
| **Primary input** | WeChat export, GitHub, browser history | Product name + description (form) |
| **Core output** | Weekly cognitive report, episode, paywall split | Multi-platform marketing copy + Viral Score™ |
| **Agents** | State interpreter, pattern detector, narrative generator | Market Analyst, Content Writer, Growth Optimizer, Campaign Director |
| **Backend** | FastAPI, PostgreSQL, pgvector, S3, batch pipeline | Next.js API routes, Anthropic SDK, no DB |
| **Frontend** | Dashboard, Timeline, Insight, Pricing, WeChat upload | Landing, `/campaign`, debug pages for legacy proxies |
| **Monetization** | Subscription tiers ($9–$99/mo), cognitive paywall | Not implemented (hackathon / OSS demo) |
| **Data moat** | Life time-series, episodes, personality trajectory | None (stateless per request) |
| **MCP / wx-cli** | Central to ingestion (`wxcli-arch.md`, `hci-mcp-target.md`) | Not present |
| **Landing page** | WeChat upload CTA, pricing, demo report | “Generate Campaign” + legacy Route/Social links |

## Feature-level gap matrix

| docs/ requirement | Implemented? | Notes |
|-------------------|-------------|-------|
| WeChat batch import | No | No upload UI, no parser, no pipeline |
| Episode builder (7d window) | No | |
| Behavioral state machine | No | |
| Insight ranking + paywall split | No | |
| Dashboard / Timeline / Insight pages | No | Only `/`, `/campaign`, `/route`, `/social-media-content` |
| Cognitive weekly report prompt system | No | Different prompts in `lib/campaign.js` |
| PostgreSQL + pgvector | No | |
| FastAPI backend | No | |
| Stripe / subscription | No | |
| wx-cli / MCP integration | No | |
| GitHub CPN integration (`cpn.md`) | No | |
| PGCO cognitive objects (`pgco.md`) | No | |
| Personal Growth monorepo (`pg-os.md`) | No | Flat Next.js app |
| Landing per `hci-landingpage.md` | No | Different copy, layout, and CTA |
| Multi-agent orchestration | **Partial** | 3 agents for **marketing**, not cognition |
| Next.js frontend | **Partial** | Pages Router JS, not App Router TS + Tailwind per docs |
| SSE streaming | **Yes** | `/api/campaign` |
| Vercel deploy | **Yes** | After fix |
| CI smoke tests | **Yes** | API metadata + proxy 503 checks |

**Overlap estimate:** ~5–10% (Next.js, multi-agent LLM pattern, SSE). **Strategic overlap:** low — different user, input, output, and moat.

## Why the deployment issue happened (connecting the dots)

```text
docs/ vision ──► not implemented
       │
       ▼
Legacy backends (dataproai, Cloudflare tunnel) ──► proxy routes + vercel.json rewrites
       │
       ▼
ViralOS README + campaign code added on top ──► third product layer
       │
       ▼
No single source of truth ──► wrong paths, wrong router syntax, 404s
```

The repo became a **stack of unmerged intents** without a docs-to-code gate or deploy smoke test (now added for ViralOS API only).

---

# Part D — Unified Issue Conclusion

## Issue 1: Vercel deployment & API routing

**Status: CLOSED**

Infrastructure fixes are complete. ViralOS campaign path (`/` → `/campaign` → `POST /api/campaign`) is the supported product surface. Legacy proxy routes are optional and env-gated.

## Issue 2: Product identity drift (docs vs code vs README)

**Status: CLOSED** (2026-05-27 — Option A: ViralOS-first)

**Decision:** ViralOS is the shipped product. Cognitive OS docs are a **deferred vision archive**, not current implementation spec. Legacy proxy pages remain env-gated behind `API_PROXY_BASE_URL`.

| Layer | Resolution |
|-------|------------|
| **ViralOS** | Primary product — README, `/campaign`, `lib/campaign.js`, landing CTAs |
| **Cognitive OS (`docs/`)** | Vision archive — indexed in `docs/README.md`, status labels, gap cross-links |
| **Legacy dataproai proxies** | Optional debug surfaces — 503 when proxy env unset; not in primary nav |

## Issue 3: docs/ engineering debt

**Status: CLOSED** (2026-05-27)

Completed:

1. [x] `docs/README.md` — index, product boundary, status column (vision / spec / deferred)
2. [x] Doc status via `docs/README.md` table + frontmatter on canonical English docs
3. [x] Cross-links to implemented surfaces: `/campaign`, `/api/campaign`, `lib/campaign.js`
4. [x] Gap appendix in `docs/README.md` pointing to this `issue.md` section C
5. [x] Stack docs labeled as target architecture (deferred); shipped stack documented in README

---

# Part E — Recommended Next Steps (priority order)

### P0 — Product boundary (1 decision)

- [x] Choose ViralOS-first vs Cognitive OS-first vs split repos — **ViralOS-first (Option A)**
- [x] Record decision in `docs/README.md` and README “Relationship to docs/” section

### P1 — ViralOS hardening (if Option A)

- [x] Remove or deprecate `/route`, `/social-media-content` from nav unless `API_PROXY_BASE_URL` documented
- [x] Bump Next.js past 14.2.0 security advisory (14.2.35)
- [x] Add integration test for SSE `/api/campaign` (mock Anthropic) — `scripts/campaign-lib.test.mjs`

### P1 — Cognitive MVP (if Option B)

- [ ] Implement Week 1 from `hci-mcp-target.md`: WeChat import → normalized event JSON
- [ ] FastAPI service or Next.js API route dedicated to cognitive pipeline (separate from campaign)
- [ ] Landing per `hci-landingpage.md` or merge into single product story

### P2 — docs hygiene

- [x] `docs/README.md` index
- [x] Dedupe hci-mvp / hci-mcp-target / hci-abstract → `docs/cognitive-os-mvp-canonical.md`
- [x] English summary → `docs/COGNITIVE-OS-EN.md`

### P3 — Operator verification (open)

- [ ] Ubuntu deploy: `npm run deploy:ubuntu:sync` or `./scripts/ubuntu/deploy-viralos.sh`
- [ ] Ubuntu gates: `npm run verify:ubuntu:all` (func + smoke + real E2E when key set)
- [ ] invest-ai on Ubuntu: `./scripts/ubuntu/start-core-gateway.sh` (invest-ai repo)
- [ ] Cross-repo: `API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live`
- [ ] Vercel: set `ANTHROPIC_API_KEY`; document proxy limitation (Part G OPS-4)

### P4 — Optional enhancements

- [ ] Public tunnel / hostname for invest-ai `:8001` (Vercel `API_PROXY_BASE_URL`)
- [x] `examples/basic-campaign.js` calls `streamCampaign` — [examples/README.md](../examples/README.md)
- [ ] NeuraDesk MCP plugin registration (llm-gateway stub exists; see cross-repo roadmap)

---

# Part F — Review Verdict

| Area | Verdict |
|------|---------|
| Vercel / API deploy issue | **RESOLVED** |
| ViralOS campaign product path | **SHIPPABLE** (with `ANTHROPIC_API_KEY`) |
| docs/ as implementation spec | **NOT VALID** — design-only, deferred vision archive |
| Repo strategic coherence | **RESOLVED** — ViralOS-first; Cognitive OS deferred |
| Overall issue | **CLOSED** (product) · **OPEN** (Ubuntu ops sign-off — Part G) |
| Design implementation (shipped product) | **COMPLETE** — [SHIPPED.md](./SHIPPED.md) |

---

# Appendix — Related Commits

```
77bd90d Initial commit: ViralOS project with Vercel configuration
62049ff Fix Vercel deployment: Add Next.js pages, API routes, and update vercel.json
8cedbc7 Add social-media-content API route and vercel.json rewrite to fix 404
62a4e65 Fix: Move API routes to correct Next.js location (/pages/api/)
ff1f277 Simplify vercel.json per README: Focus on core Next.js landing page experience
(2026-05-27) Phases 1–4: campaign API, design trilogy, no-mock, Ubuntu deploy
1e20b37 Complete design implementation: no-mock, Ubuntu deploy, gateway ingest
617f3f8 docs: implementation-map + interaction sync
dcacb71 P2: health probe, gateway/SSE tests, SHIPPED + issue/todo ops backlog
```

---

# Appendix — Reproduction (current)

```bash
git clone https://github.com/lqjack/ViralOS.git
cd ViralOS
cp .env.example .env.local   # ANTHROPIC_API_KEY required for campaign
npm install

# macOS — lightweight (no full build)
npm run verify:func          # 16 tests + no-mock scan

# macOS — full CI parity (heavy; prefer Ubuntu)
npm run verify:full          # build + smoke 9/9

# Ubuntu (recommended for build + real LLM)
npm run deploy:ubuntu:sync
ssh ubuntu 'cd ~/ViralOS && npm run verify:ubuntu:all'

open http://localhost:3000/campaign          # ViralOS — implemented
# docs/hci-landingpage.md WeChat upload CTA  # Cognitive OS — not implemented
```

**Key commits:** `1e20b37` (no-mock + Ubuntu + ingest) · `617f3f8` (implementation map) · `dcacb71` (health + P2 tests + ops sync)
