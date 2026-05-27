# ViralOS — Design → Implementation Map

> Traceability: design trilogy ↔ shipped code. Updated 2026-05-27.

Use this when reviewing whether the **full design** is implemented (not Cognitive OS vision docs).

---

## Core pipeline (P1)

| Design (doc) | Implementation | Verified by |
|--------------|----------------|-------------|
| 4-step agent pipeline | `lib/campaign.js`, `lib/campaign-agents.js` | `campaign-lib.test.mjs` |
| Campaign Director packages result | `campaignDirector` agent_start/done | same |
| Real Anthropic only (no mock) | `lib/real-ai-guard.js`, `requireRealUsage` | `real-ai-guard.test.mjs`, `verify:no-mock` |
| Per-agent JSON validation | `lib/campaign-validate.js` | `campaign-validate.test.mjs` |
| SSE event bus | `lib/sse-parse.js`, `pages/api/campaign.js` | `sse-parse.test.mjs`, smoke |
| Structured campaign UI | `pages/campaign.js`, `lib/campaign-ui-state.js` | manual `/campaign` |
| Gateway ingest (optional) | `lib/campaign-ingest.js`, `lib/gateway-client.js` | `campaign-ingest.test.mjs` |

---

## API & interaction (P1)

| Design | Code | Test |
|--------|------|------|
| `GET /api/campaign` metadata | `CAMPAIGN_API_INFO` v1.1 + `agents[]` | smoke |
| `POST` SSE stream | `pages/api/campaign.js` | `verify:e2e-real` |
| 400 / 405 / 503 errors | route handler branches | smoke |
| `ingest_done` / `ingest_error` events | post-`complete` in API route | cross-repo-live |

---

## Deployment (P1)

| Design | Code / doc |
|--------|------------|
| Ubuntu build (not macOS OOM) | `scripts/ubuntu/deploy-viralos.sh` |
| macOS rsync deploy | `scripts/deploy-ubuntu-sync.sh` |
| PORT 3010 | `VIRALOS_PORT` env |
| Ops guide | [deploy-ubuntu.md](./deploy-ubuntu.md) |

---

## Verification gates (priority order)

| Priority | Command | Purpose |
|----------|---------|---------|
| P1 | `npm run verify:func` | no-mock + 16 unit tests |
| P1 | `npm run verify:full` | build + smoke (CI) |
| P1 | `npm run deploy:ubuntu:sync` | deploy to Ubuntu |
| P1 | `npm run verify:ubuntu:all` | Ubuntu func + smoke + real E2E |
| P2 | `npm run verify:cross-repo-live` | gateway ingest live |

---

## Document index

| Doc | Scope |
|-----|--------|
| [DESIGN.md](./DESIGN.md) | Index |
| [system-design-architecture.md](./system-design-architecture.md) | Layers, components |
| [system-interaction-design.md](./system-interaction-design.md) | APIs, SSE, journeys |
| [system-control-data-flow.md](./system-control-data-flow.md) | Control/data inside components |
| [todo.md](./todo.md) | Task status |
| [issue.md](./issue.md) | Retro + acceptance |

**Out of scope (vision):** `docs/hci-*.md`, `pgco.md`, etc.
