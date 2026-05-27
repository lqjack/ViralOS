# Cognitive OS MVP — Canonical Spec (English)

**Product:** Personal Cognitive OS (vision — not shipped in this repo)  
**Implements:** none  
**Status:** Target architecture / deferred phase  
**Supersedes (summary of):** `hci-mvp.md`, `hci-mcp-target.md`, `hci-abstract.md`

---

## One-line wedge

> Show users **what changed in their behavior this week and why** — not generic AI chat.

## MVP scope (v0.1)

| In scope | Out of scope |
|----------|--------------|
| WeChat chat export (batch import) | Real-time sync |
| 7-day behavioral episodes | Full 10-year pipeline |
| AI state explanation (structured report) | Psychological diagnosis |
| Free preview + paid “why / trend / action” | Family / enterprise tiers |

## Pipeline

```text
Import (WeChat) → Normalize events → Build weekly episode → Detect state patterns → LLM narrative → Paywall split
```

## Success metric

User says: *“This system understands my current state better than I do.”*

## Shipped in this repo instead

**ViralOS** — viral marketing campaigns. See root [README.md](../README.md), `/campaign`, `POST /api/campaign`.

## Source docs (Chinese, detailed)

| Doc | Role |
|-----|------|
| [hci-mvp.md](./hci-mvp.md) | MVP product shape |
| [hci-mcp-target.md](./hci-mcp-target.md) | 30-day execution plan |
| [hci-abstract.md](./hci-abstract.md) | Cognitive Insight Engine + monetization |

---

*Last updated: 2026-05-27*
