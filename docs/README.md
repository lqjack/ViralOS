# Documentation Index

## Product boundary

| Product | Status in this repo | Where |
|---------|---------------------|-------|
| **ViralOS** — viral marketing campaign generator | **Shipped** | `README.md`, `pages/campaign.js`, `lib/campaign.js` |
| **Personal Cognitive OS** — WeChat life reports, cognitive mirror | **Vision only** | `docs/hci-*.md`, `docs/wechat-*.md` |
| **Legacy dataproai proxies** | **Optional** | `pages/api/stock`, `dataproai`, `social-media-content` (needs `API_PROXY_BASE_URL`) |

**Decision (2026-05-27):** ViralOS-first. Cognitive OS docs are design archive for a future phase or separate repo.

**Shipped surfaces to implement against:**

- UI: `/campaign`
- API: `GET|POST /api/campaign` (SSE)
- Code: `lib/campaign.js`, `pages/api/campaign.js`

**Issue & gap analysis:** [issue.md](./issue.md) · **Tasks:** [todo.md](./todo.md)

### Ubuntu deploy (build on server, not localhost)

| Doc | Command |
|-----|---------|
| [deploy-ubuntu.md](./deploy-ubuntu.md) | `npm run deploy:ubuntu:sync` · `npm run verify:ubuntu` |

### Ubuntu deploy & verification

| Doc | Purpose |
|-----|---------|
| [deploy-ubuntu.md](./deploy-ubuntu.md) | Build/run on Ubuntu `:3010`, real E2E, rsync from macOS |

### Shipped product — system design trilogy

| # | Document | Focus |
|---|----------|-------|
| 0 | **[DESIGN.md](./DESIGN.md)** | Design index |
| 1 | [system-design-architecture.md](./system-design-architecture.md) | **系统设计** — 分层、组件、部署、边界 |
| 2 | [system-interaction-design.md](./system-interaction-design.md) | **系统交互** — 用户旅程、API/SSE 契约、序列图 |
| 3 | [system-control-data-flow.md](./system-control-data-flow.md) | **控制流与数据流** — 四步编排、SSE 总线、数据变形 |
| 4 | [implementation-map.md](./implementation-map.md) | **设计 ↔ 代码** 可追溯矩阵 + 验证门禁 |

**Cross-repo planning (invest-ai · llm-gateway · viralos):** [cross-repo-reuse-and-roadmap.md](./cross-repo-reuse-and-roadmap.md) (canonical matrix in invest-ai `docs/architecture/`)

**English / canonical Cognitive OS summary:** [COGNITIVE-OS-EN.md](./COGNITIVE-OS-EN.md) · [cognitive-os-mvp-canonical.md](./cognitive-os-mvp-canonical.md)

---

## Reading order (Cognitive OS vision)

| # | File | Focus | Status |
|---|------|-------|--------|
| 1 | [hci-mvp.md](./hci-mvp.md) | MVP wedge — weekly cognitive report | Vision |
| 2 | [hci-mcp-target.md](./hci-mcp-target.md) | 30-day execution plan | Spec |
| 3 | [hci-abstract.md](./hci-abstract.md) | Cognitive Insight Engine + paywall | Vision |
| 4 | [hci-landingpage.md](./hci-landingpage.md) | Landing page spec (not built) | Spec |
| 5 | [hci-bussines.md](./hci-bussines.md) | Pricing & B2C/B2B model | Business |
| 6 | [wechat-based-hci-clean-data.md](./wechat-based-hci-clean-data.md) | Data cleaning pipeline | Spec |
| 7 | [wechat-based-hci.md](./wechat-based-hci.md) | WeChat as life time-series | Philosophy |
| 8 | [wxcli-arch.md](./wxcli-arch.md) | wx-cli local DB access | Integration ref |
| 9 | [pgco.md](./pgco.md) | Cognitive object model | Domain model |
| 10 | [pg-os.md](./pg-os.md) | Personal Growth OS monorepo | Target architecture |
| 11 | [hci-cog-storage-eng.md](./hci-cog-storage-eng.md) | Temporal cognitive compression | Data engine |
| 12 | [hci-arch.md](./hci-arch.md) | Microservices / K8s overview | Architecture stub |
| 13 | [hci-Universal-Human-Cognitive-OS.md](./hci-Universal-Human-Cognitive-OS.md) | Unified Cognitive Event | Platform vision |
| 14 | [hci-Multi-Human-Cognitive-Infrastructure.md](./hci-Multi-Human-Cognitive-Infrastructure.md) | Group / family infra | Phase 3+ |
| 15 | [cpn.md](./cpn.md) | GitHub Cognitive Production Network | Extension |
| 16 | [hci.md](./hci.md) | Scope note | Meta |
| 17 | [wx-whole.md](./wx-whole.md) | WeChat ecosystem context | Reference |

**Status key:** Vision = north star · Spec = implementable design · Shipped = in codebase (none of the Cognitive OS docs are shipped yet).

---

## Language

Most Cognitive OS docs are in Chinese. The shipped ViralOS app and root `README.md` are in English.
