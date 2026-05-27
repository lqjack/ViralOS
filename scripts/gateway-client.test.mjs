import test from 'node:test'
import assert from 'node:assert/strict'
import {
  fetchRouteCatalog,
  fetchCampaignSchema,
  ingestCampaign,
  searchCampaigns
} from '../lib/gateway-client.js'
import { getProxyBaseUrl } from '../lib/proxy.js'

const GATEWAY = 'http://gateway.test'

function withMockFetch(handler, fn) {
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const out = await handler(String(url), init || {})
    if (out instanceof Response) return out
    const status = out.status ?? 200
    const body = typeof out.body === 'string' ? out.body : JSON.stringify(out.body ?? {})
    return new Response(body, {
      status,
      headers: out.headers || { 'content-type': 'application/json' }
    })
  }
  return fn().finally(() => {
    globalThis.fetch = original
  })
}

test('getProxyBaseUrl strips trailing slash', () => {
  const prev = process.env.API_PROXY_BASE_URL
  process.env.API_PROXY_BASE_URL = 'http://localhost:8001/'
  assert.equal(getProxyBaseUrl(), 'http://localhost:8001')
  if (prev === undefined) delete process.env.API_PROXY_BASE_URL
  else process.env.API_PROXY_BASE_URL = prev
})

test('fetchRouteCatalog GETs /api/routes', async () => {
  await withMockFetch((url, init) => {
    assert.equal(url, `${GATEWAY}/api/routes`)
    assert.equal(init.method, 'GET')
    return { body: { viralos_proxy_mappings: [{ path: '/api/integrations/viralos' }] } }
  }, async () => {
    const catalog = await fetchRouteCatalog(GATEWAY)
    assert.equal(catalog.viralos_proxy_mappings.length, 1)
  })
})

test('fetchCampaignSchema GETs campaigns schema', async () => {
  await withMockFetch((url) => {
    assert.ok(url.endsWith('/api/integrations/viralos/campaigns/schema'))
    return { body: { schema_version: 'viralos-campaign-v1' } }
  }, async () => {
    const schema = await fetchCampaignSchema(GATEWAY)
    assert.equal(schema.schema_version, 'viralos-campaign-v1')
  })
})

test('ingestCampaign POSTs viralos-campaign-v1 body', async () => {
  await withMockFetch((url, init) => {
    assert.equal(url, `${GATEWAY}/api/integrations/viralos/campaigns`)
    assert.equal(init.method, 'POST')
    const posted = JSON.parse(init.body)
    assert.equal(posted.schema_version, 'viralos-campaign-v1')
    assert.equal(posted.product, 'Tea')
    return { body: { ok: true, id: 'camp-42', path: '/data/camp-42.json' } }
  }, async () => {
    const result = await ingestCampaign({ product: 'Tea', viralScore: 90 }, GATEWAY)
    assert.equal(result.id, 'camp-42')
    assert.equal(result.ok, true)
  })
})

test('ingestCampaign sends x-viralos-ingest-token when set', async () => {
  const prev = process.env.VIRALOS_INGEST_TOKEN
  process.env.VIRALOS_INGEST_TOKEN = 'test-ingest-secret'
  await withMockFetch((url, init) => {
    assert.equal(init.headers['x-viralos-ingest-token'], 'test-ingest-secret')
    return { body: { ok: true, id: 'x' } }
  }, async () => {
    await ingestCampaign({ product: 'X' }, GATEWAY)
  }).finally(() => {
    if (prev === undefined) delete process.env.VIRALOS_INGEST_TOKEN
    else process.env.VIRALOS_INGEST_TOKEN = prev
  })
})

test('searchCampaigns passes query params', async () => {
  await withMockFetch((url) => {
    assert.match(url, /\/campaigns\/search\?q=Tea&limit=5/)
    return { body: { hits: [{ id: '1', product: 'Tea' }] } }
  }, async () => {
    const out = await searchCampaigns('Tea', { limit: 5, baseUrl: GATEWAY })
    assert.equal(out.hits.length, 1)
  })
})
