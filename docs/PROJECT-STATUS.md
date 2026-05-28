# ViralOS — Project status (on-disk snapshot)

> **Updated:** 2026-05-28 · **Branch:** `main` · **Product:** viral campaign generator (ViralOS-first)  
> **Sync:** This file is the single operational snapshot; keep [todo.md](./todo.md) and [issue.md](./issue.md) in sync when status changes.

---

## 1. Executive status

| Dimension | Status |
|-----------|--------|
| Shipped design (trilogy + code) | **Complete** — [implementation-map.md](./implementation-map.md) |
| Application code gaps | **None** for P0–P2 |
| Local verification (macOS, off-LAN) | **Passing** — `verify:func` 24/24 |
| Ubuntu / LAN ops | **Partial** — deployed `192.168.1.4:3010`; real E2E needs `ANTHROPIC_API_KEY` in `~/ViralOS/.env` |
| Cognitive OS (`docs/hci-*`) | **Deferred** — vision archive only |

---

## 2. Priority queue

| Pri | Work | Status | Where |
|-----|------|--------|-------|
| P0 | Product boundary (ViralOS-first) | Done | [issue.md](./issue.md) Part D |
| P1 | Campaign pipeline, SSE API, no-mock, tests | Done | `lib/`, `pages/` |
| P1 | Ubuntu deploy scripts (code) | Done | [deploy-ubuntu.md](./deploy-ubuntu.md) |
| P2 | Local off-LAN gates | Done | `verify:local-design`, [examples/README.md](../examples/README.md) |
| P3 | Ubuntu deploy + cross-repo live | **Done on LAN** | `REMOTE=jack@192.168.1.4` |
| P3 | Real LLM E2E on Ubuntu | **Open** | Set `ANTHROPIC_API_KEY` in `~/ViralOS/.env` → `verify:e2e-real` |
| P4 | Public `:8001` ingress, MCP plugin, campaign DB | Backlog | [todo.md](./todo.md) § P4 |

---

## 3. Verification matrix

| Command | Needs Ubuntu | Needs API key | Last known |
|---------|--------------|---------------|------------|
| `npm run verify:func` | No | No | **24/24 PASS** (2026-05-28) |
| `npm run verify:local-design` | No | Optional (CLI) | **PASS** — func; CLI skipped without `.env.local` sk-ant key |
| `npm run verify:full` | No (CI OK) | No | **10/10 PASS** (2026-05-28) |
| `npm run deploy:ubuntu:sync` | Yes (LAN) | No | **PASS** — `REMOTE=jack@192.168.1.4` |
| `npm run verify:ubuntu:all` | Yes | Yes (`.env`) | **PASS** smoke; SKIP real E2E until key in `.env` |
| `npm run verify:cross-repo-live` | Yes + gateway | No | **PASS** — `API_PROXY_BASE_URL=http://192.168.1.4:8001` |

**Default gate while off-LAN:** `npm run verify:all` → `verify:local-design`

---

## 4. Environment (copy to `.env.local`)

| Variable | Required | Notes |
|----------|----------|-------|
| `ANTHROPIC_API_KEY` | Yes (campaign) | Vercel + Ubuntu `.env`; no mock fallback |
| `API_PROXY_BASE_URL` | No | Ubuntu/LAN: `http://192.168.1.4:8001` or `http://127.0.0.1:8001` on host |
| `VIRALOS_AUTO_INGEST` | No | Set `0` to disable post-`complete` gateway ingest |
| `VIRALOS_INGEST_TOKEN` | No | Must match gateway when ingest auth enabled |

**Do not** set `API_PROXY_BASE_URL=https://gateway.datapro.asia` — that is llm-gateway **:3000**, not invest-ai **:8001**.

---

## 5. Cross-repo (invest-ai · llm-gateway)

| Repo | Role | Ubuntu doc |
|------|------|------------|
| **ViralOS** (this) | Campaign UI + SSE API | [deploy-ubuntu.md](./deploy-ubuntu.md) |
| **invest-ai** | Gateway `:8001`, ingest, stock proxy | [ubuntu-production-deploy](https://github.com/lqjack/dataproaiset/blob/main/docs/operations/ubuntu-production-deploy.md) |
| **llm-gateway** | NeuraDesk `:3000`, tunnel SSH | `docs/datapro-network.md` |

ViralOS pointer: [cross-repo-reuse-and-roadmap.md](./cross-repo-reuse-and-roadmap.md)

---

## 6. Document map

| Read first | Purpose |
|------------|---------|
| [SHIPPED.md](./SHIPPED.md) | What is implemented |
| [DESIGN.md](./DESIGN.md) | Design index |
| [todo.md](./todo.md) | Task checklist |
| [issue.md](./issue.md) | Retro + OPS-1–5 |
| [lan-resume-checklist.md](./lan-resume-checklist.md) | When LAN is available |

---

## 7. Changelog (status file)

| Date | Change |
|------|--------|
| 2026-05-27 | Initial snapshot: design complete, P3 LAN-deferred, local gates documented |
| 2026-05-28 | Re-verified: `verify:func` 24/24, `verify:full` 10/10, `verify:local-design` PASS; P3 still blocked off-LAN |
| 2026-05-28 | LAN: deploy to `192.168.1.4:3010`, `verify:cross-repo-live` PASS, `verify:ubuntu:all` func+smoke; smoke-test proxy-aware |
