# Cross-repo reuse & roadmap (ViralOS view)

**Canonical document** (full retro, reuse matrix, phased plan):  
`~/codes/python/invest-ai/docs/architecture/cross-repo-reuse-and-roadmap.md`  
(same content in GitHub `lqjack/dataproaiset` when pushed)

This repo is **ViralOS** — **growth / viral campaign** generation (`/campaign`, `POST /api/campaign` SSE).

## ViralOS responsibilities

| Layer | Own here |
|-------|----------|
| **Infra** | Vercel deploy, `ANTHROPIC_API_KEY`, optional `API_PROXY_BASE_URL` |
| **Application** | `lib/campaign.js`, multi-agent marketing pipeline, platform-specific copy |
| **Business flow** | Product → persona → multi-platform content → Viral Score™ |

## Reuse from invest-ai

- **Optional proxies:** `pages/api/stock`, `dataproai`, `social-media-content` → invest-ai gateway when `API_PROXY_BASE_URL` is set (see canonical doc).
- **Gateway runs on Ubuntu**, not Mac localhost: invest-ai [ubuntu-production-deploy.md](https://github.com/lqjack/dataproaiset/blob/main/docs/operations/ubuntu-production-deploy.md) — `API_PROXY_BASE_URL=http://192.168.1.4:8001` (LAN), not `gateway.datapro.asia` (:3000).
- **Client:** `lib/gateway-client.js` — `fetchRouteCatalog()`, `ingestCampaign()`.
- **Proxy:** `lib/proxy.js` — timeouts/retries via `API_PROXY_*` env vars (`.env.example`).
- **Ingest:** POST campaign exports to gateway `/api/integrations/viralos/campaigns`.
- Do **not** duplicate dataproai crawlers or stock backend inside ViralOS.

## Reuse from llm-gateway

- Future: register campaign tools as MCP/skills via NeuraDesk — not shipped; use canonical doc Phase 2 before coding.
- Tunnel/SSH: if ViralOS needs private admin APIs, use existing Ubuntu tunnel on **gateway** host (llm-gateway ops), not a new tunnel name.

## Product boundary

See [README.md](./README.md) — **Cognitive OS** docs in `docs/hci-*` are vision-only; shipped product is ViralOS campaigns.

## Local docs

### Shipped ViralOS design trilogy

- [DESIGN.md](./DESIGN.md) — index  
- [system-design-architecture.md](./system-design-architecture.md)  
- [system-interaction-design.md](./system-interaction-design.md)  
- [system-control-data-flow.md](./system-control-data-flow.md)  

### Ops & vision

- [PROJECT-STATUS.md](./PROJECT-STATUS.md) — on-disk status snapshot (2026-05-27)  
- [lan-resume-checklist.md](./lan-resume-checklist.md) — Ubuntu ops when on LAN  
- [README.md](./README.md) — doc index  
- [issue.md](./issue.md) — retro  
- [todo.md](./todo.md) — tasks  
