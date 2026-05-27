# ViralOS — Shipped Implementation Status

> **HEAD**: see latest `main` · **Product**: viral campaign generator (not Cognitive OS vision)

## Summary

**Design implementation for the shipped product is complete** per [implementation-map.md](./implementation-map.md). All P0/P1 items in [todo.md](./todo.md) are checked off.

What remains is **operator work on Ubuntu** (deploy + real API key), not missing application code. Track open items in [issue.md § Part G](./issue.md#part-g--open-issues--operator-backlog-2026-05-27) and [todo.md § P3](./todo.md#p3--operator-verification-open).

---

## Implemented (code)

| Area | Location |
|------|----------|
| 4-agent pipeline + validation | `lib/campaign.js`, `lib/campaign-agents.js`, `lib/campaign-validate.js` |
| No mock / real usage guards | `lib/real-ai-guard.js`, `scripts/verify-no-mock.sh` |
| SSE API + optional ingest | `pages/api/campaign.js`, `lib/campaign-ingest.js` |
| Campaign UI (stepper + result) | `pages/campaign.js` |
| Gateway BFF proxy | `pages/api/integrations/viralos/` |
| Gateway client tests (offline) | `scripts/gateway-client.test.mjs` |
| SSE contract tests | `scripts/sse-campaign-e2e.test.mjs` |
| Health probe | `pages/api/health.js` |
| Ubuntu deploy | `scripts/ubuntu/deploy-viralos.sh`, `deploy-ubuntu-sync.sh` |

---

## Verification (by priority)

| Step | Where | Command |
|------|-------|---------|
| 1 | macOS / CI | `npm run verify:func` |
| 2 | macOS / CI | `npm run verify:full` |
| 3 | Ubuntu deploy | `npm run deploy:ubuntu:sync` |
| 4 | Ubuntu | `npm run verify:ubuntu:all` |
| 5 | Ubuntu + gateway | `API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live` |

---

## Not in scope (deferred)

Cognitive OS (`docs/hci-*`), NeuraDesk MCP registration, persistent campaign DB — see [todo.md](./todo.md) §Deferred.

---

## Design docs

1. [DESIGN.md](./DESIGN.md)  
2. [system-design-architecture.md](./system-design-architecture.md)  
3. [system-interaction-design.md](./system-interaction-design.md)  
4. [system-control-data-flow.md](./system-control-data-flow.md)  
5. [implementation-map.md](./implementation-map.md)  
6. [deploy-ubuntu.md](./deploy-ubuntu.md)
