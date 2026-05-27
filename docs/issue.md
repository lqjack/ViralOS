# Issue: Vercel Deployment, Product Identity Drift & docs/ Design Gap

**Status:** Resolved (infra + docs alignment)  
**Severity:** High (deploy) · Medium (strategy/docs drift) — **closed**  
**Reported:** 2026-05-22  
**Last reviewed:** 2026-05-27  
**Last updated:** 2026-05-27 (ViralOS-first decision + P0–P2 fixes)

---

## Executive Conclusion

Three separate problems were folded into one repo:

| Layer | Problem | Status |
|-------|---------|--------|
| **Infrastructure** | Wrong `vercel.json`, API in `/api/` not `/pages/api/`, App Router syntax in Pages Router | **Resolved** (2026-05-27) |
| **Product identity** | README/code ship **ViralOS**; `docs/` = Cognitive OS vision archive | **Resolved** — ViralOS-first (2026-05-27) |
| **Documentation** | 17 design docs without index or code links | **Resolved** — `docs/README.md`, design trilogy ([DESIGN.md](./DESIGN.md)), `docs/todo.md`, this file |

The May 2026 deploy incident was a **symptom**, not the root strategic issue. Inherited `dataproai-set` Vercel config and proxy tunnels suggest the repo absorbed artifacts from prior projects (dataproai, Cognitive OS, ViralOS) without a single product boundary or docs-to-code traceability gate.

**Verdict:** ViralOS campaign path is fixed and documented. Cognitive OS remains a **deferred vision** in `docs/` — not current implementation spec.

**Task tracker:** [todo.md](./todo.md)

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

## Deployment Acceptance Criteria

- [x] `npm run build` succeeds locally and on Vercel
- [x] `GET /` serves ViralOS landing page
- [x] `POST /api/campaign` streams SSE when `ANTHROPIC_API_KEY` is set
- [x] No hardcoded tunnel URLs in source
- [x] README matches router model and layout
- [x] Proxy routes return 503 with hint when `API_PROXY_BASE_URL` unset
- [x] CI smoke tests pass (5/5)

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
| **Agents** | State interpreter, pattern detector, narrative generator | Market Analyst, Content Writer, Growth Optimizer |
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

---

# Part F — Review Verdict

| Area | Verdict |
|------|---------|
| Vercel / API deploy issue | **RESOLVED** |
| ViralOS campaign product path | **SHIPPABLE** (with `ANTHROPIC_API_KEY`) |
| docs/ as implementation spec | **NOT VALID** — design-only, deferred vision archive |
| Repo strategic coherence | **RESOLVED** — ViralOS-first; Cognitive OS deferred |
| Overall issue | **CLOSED** |

---

# Appendix — Related Commits

```
77bd90d Initial commit: ViralOS project with Vercel configuration
62049ff Fix Vercel deployment: Add Next.js pages, API routes, and update vercel.json
8cedbc7 Add social-media-content API route and vercel.json rewrite to fix 404
62a4e65 Fix: Move API routes to correct Next.js location (/pages/api/)
ff1f277 Simplify vercel.json per README: Focus on core Next.js landing page experience
(2026-05-27) Phases 1–3: campaign API, UI, README, CI, ViralOS-first docs alignment
```

---

# Appendix — Reproduction (current)

```bash
git clone https://github.com/viralOS/viralOS
cd viralOS
cp .env.example .env.local   # ANTHROPIC_API_KEY required for campaign
npm install && npm run dev

open http://localhost:3000/campaign          # ViralOS — implemented
# docs/hci-landingpage.md WeChat upload CTA  # Cognitive OS — not implemented

npm run verify                               # build + 2 unit tests
npm run verify:full                          # verify + 8 smoke checks (recommended)

# Or manually:
npm run build && npm run start &
ANTHROPIC_API_KEY= npm run smoke-test        # 8/8 expected
```

**Resolution commits:** `44e6c03` (deploy/API/docs) · `4fbf599` (verify:full + ESM)
