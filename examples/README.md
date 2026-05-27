# Examples — CLI vs HTTP API

Both paths use the **same** `streamCampaign` pipeline in `lib/campaign.js` (real Anthropic, `requireRealUsage: true`, no mock).

| Path | When to use | Command |
|------|-------------|---------|
| **CLI** | Local debug, CI optional real LLM, no Next server | `ANTHROPIC_API_KEY=... npm run demo` |
| **HTTP + UI** | Production, Vercel, Ubuntu `:3010` | `npm run dev` → `/campaign` or `POST /api/campaign` |

## CLI (`basic-campaign.js`)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export PLATFORMS=twitter,tiktok
npm run demo
# or: node examples/basic-campaign.js "My Product Name"
```

Output: one JSON line per SSE event (`agent_start`, `agent_done`, `complete`), same shapes as the HTTP API stream.

## HTTP API

```bash
curl -N -X POST http://localhost:3000/api/campaign \
  -H 'Content-Type: application/json' \
  -d '{"product":"Tea","platforms":["twitter"]}'
```

Requires `ANTHROPIC_API_KEY` in server env. Optional gateway ingest after `complete` when `API_PROXY_BASE_URL` is set.

## Verification

```bash
npm run verify:local-design   # runs verify:func + optional CLI when key is set
```

See [../docs/PROJECT-STATUS.md](../docs/PROJECT-STATUS.md).
