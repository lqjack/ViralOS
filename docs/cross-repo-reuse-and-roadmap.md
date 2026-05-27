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

- **Optional proxies:** `pages/api/stock`, `dataproai`, `social-media-content` forward to invest-ai gateway when `API_PROXY_BASE_URL` is set — prefer **one** gateway base URL (see canonical doc Phase 2).
- Do **not** duplicate dataproai crawlers or stock backend inside ViralOS.

## Reuse from llm-gateway

- Future: register campaign tools as MCP/skills via NeuraDesk — not shipped; use canonical doc Phase 2 before coding.
- Tunnel/SSH: if ViralOS needs private admin APIs, use existing Ubuntu tunnel on **gateway** host (llm-gateway ops), not a new tunnel name.

## Product boundary

See [README.md](./README.md) — **Cognitive OS** docs in `docs/hci-*` are vision-only; shipped product is ViralOS campaigns.

## Local docs

- [issue.md](./issue.md) — retro  
- [todo.md](./todo.md) — tasks  
