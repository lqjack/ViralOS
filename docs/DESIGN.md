# ViralOS — Design & Architecture Index

> **Code HEAD**: `f104bfe` · Updated 2026-05-27  
> **Shipped product**: viral campaign generator (`/campaign`, `POST /api/campaign`)

This page is the **entry point** for ViralOS system design. Three companion documents cover architecture, interaction, and internal control/data flow:

| Document | Question it answers |
|----------|-------------------|
| **[system-design-architecture.md](./system-design-architecture.md)** | **What** is the system? Layers, components, deployment, boundaries |
| **[system-interaction-design.md](./system-interaction-design.md)** | **How** do parts interact? Journeys, sequences, API contracts |
| **[system-control-data-flow.md](./system-control-data-flow.md)** | **How** does control & data move inside each component? Agent pipeline, SSE events, transforms |

**Vision-only (not shipped):** Personal Cognitive OS — see [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md) and hci-* docs.

---

## 1. One-line summary

**ViralOS** runs a **sequential four-step pipeline** (Market Analyst → Content Writer → Growth Optimizer → Campaign Director) on the server with **real Anthropic calls only** (`real-ai-guard`), streams progress over **SSE**, optionally ingests results to invest-ai gateway, and returns a unified campaign package with Viral Score™.

---

## 2. Component map

```mermaid
flowchart LR
  subgraph UI["Campaign UI"]
    P["pages/campaign.js"]
  end
  subgraph API["Campaign API"]
    R["pages/api/campaign.js"]
  end
  subgraph Core["Campaign engine"]
    C["lib/campaign.js streamCampaign"]
  end
  subgraph Ext["External"]
    CL[Anthropic Claude API]
  end
  P -->|POST JSON| R
  R --> C
  C --> CL
  R -->|SSE| P
```

| Component | Responsibility | Primary path |
|-----------|----------------|--------------|
| **Campaign UI** | Form input, SSE consumer, result display | `pages/campaign.js` |
| **Campaign API** | Auth env check, SSE framing, error envelope | `pages/api/campaign.js` |
| **Campaign engine** | Agent orchestration, JSON parse, aggregation | `lib/campaign.js` |
| **Proxy layer** (optional) | Forward to DataproAI / stock backends | `lib/proxy.js`, `pages/api/*` |
| **Anthropic** | LLM inference | `@anthropic-ai/sdk` |

---

## 3. Layered architecture (summary)

```text
┌────────────────────────────────────────────────────────────┐
│ Presentation — React (Pages Router) · / · /campaign        │
├────────────────────────────────────────────────────────────┤
│ API — pages/api/campaign.js (GET info · POST SSE)          │
├────────────────────────────────────────────────────────────┤
│ Domain — lib/campaign.js (4-step pipeline + validation)   │
│          lib/real-ai-guard.js · lib/campaign-ingest.js     │
├────────────────────────────────────────────────────────────┤
│ External — Anthropic Messages API (claude-sonnet-4-…)      │
└────────────────────────────────────────────────────────────┘
```

Optional proxy routes sit beside the campaign stack and require `API_PROXY_BASE_URL`.

---

## 4. Primary user flow

| Flow | Entry | Doc section |
|------|-------|-------------|
| Generate campaign (UI) | `/campaign` | [interaction §3](./system-interaction-design.md#3-user-journey-generate-campaign) |
| Generate campaign (API) | `POST /api/campaign` | [interaction §4](./system-interaction-design.md#4-api-contracts) |
| SDK / script | `@viralOS/sdk` / `examples/` | README · out of repo core path |

Control and data detail: [control/data §2](./system-control-data-flow.md#2-端到端主路径-product--campaign-package).

---

## 5. Deployment

| Target | Stack | Notes |
|--------|-------|-------|
| **Ubuntu (recommended)** | `npm run deploy:ubuntu` · PORT **3010** | Build on server — [deploy-ubuntu.md](./deploy-ubuntu.md) |
| Vercel | Next.js 14 Pages Router | `ANTHROPIC_API_KEY` in project env |
| Self-host | `npm run build && npm start` | Same env contract |

Details: [architecture §6](./system-design-architecture.md#6-deployment).

---

## 6. Verification

| Priority | Command | Where |
|----------|---------|--------|
| P1 | `npm run verify:func` | macOS / CI — no-mock scan + unit tests (no API key) |
| P1 | `npm run deploy:ubuntu:sync` | macOS → rsync + build on Ubuntu |
| P1 | `npm run verify:ubuntu` | Client → Ubuntu `:3010` smoke |
| P1 | `npm run verify:ubuntu:real` | Real Anthropic SSE (key on Ubuntu `.env`) |
| P2 | `npm run verify:cross-repo-live` | Ubuntu — gateway ingest (`API_PROXY_BASE_URL`) |

```bash
npm run verify:func          # preferred on macOS (avoid local next build OOM)
SMOKE_TEST_URL=http://127.0.0.1:3010 npm run verify:e2e-real   # on Ubuntu
```

Deploy: [deploy-ubuntu.md](./deploy-ubuntu.md) · invest-ai [ubuntu-production-deploy](https://github.com/lqjack/dataproaiset/blob/main/docs/operations/ubuntu-production-deploy.md).

Issues and gaps: [issue.md](./issue.md) · [todo.md](./todo.md).

---

## 7. Related documents

### Core trilogy (onboarding order)

1. [system-design-architecture.md](./system-design-architecture.md)
2. [system-interaction-design.md](./system-interaction-design.md)
3. [system-control-data-flow.md](./system-control-data-flow.md)
4. [implementation-map.md](./implementation-map.md) — design ↔ code traceability

### Product boundary & vision

| Topic | Document |
|-------|----------|
| Shipped vs Cognitive OS vision | [README.md](./README.md) |
| Cognitive OS canonical (future) | [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md) |
| English overview | [COGNITIVE-OS-EN.md](./COGNITIVE-OS-EN.md) |
