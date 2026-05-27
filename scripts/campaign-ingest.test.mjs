import test from 'node:test'
import assert from 'node:assert/strict'
import { campaignPayloadForIngest, ingestCampaignIfConfigured } from '../lib/campaign-ingest.js'

test('campaignPayloadForIngest strips usage metadata', () => {
  const payload = campaignPayloadForIngest({
    product: 'Tea',
    viralScore: 90,
    usage: { marketAnalyst: { input_tokens: 1, output_tokens: 2 } }
  })
  assert.equal(payload.product, 'Tea')
  assert.equal(payload.usage, undefined)
})

test('ingestCampaignIfConfigured skips when VIRALOS_AUTO_INGEST=0', async () => {
  const prevIngest = process.env.VIRALOS_AUTO_INGEST
  const prevProxy = process.env.API_PROXY_BASE_URL
  process.env.VIRALOS_AUTO_INGEST = '0'
  process.env.API_PROXY_BASE_URL = 'http://127.0.0.1:8001'
  const out = await ingestCampaignIfConfigured({ product: 'X', content: { twitter: {} }, viralScore: 1 })
  assert.equal(out, null)
  if (prevIngest === undefined) delete process.env.VIRALOS_AUTO_INGEST
  else process.env.VIRALOS_AUTO_INGEST = prevIngest
  if (prevProxy === undefined) delete process.env.API_PROXY_BASE_URL
  else process.env.API_PROXY_BASE_URL = prevProxy
})

test('ingestCampaignIfConfigured skips when API_PROXY_BASE_URL unset', async () => {
  const prevIngest = process.env.VIRALOS_AUTO_INGEST
  const prevProxy = process.env.API_PROXY_BASE_URL
  delete process.env.API_PROXY_BASE_URL
  delete process.env.VIRALOS_AUTO_INGEST
  const out = await ingestCampaignIfConfigured({ product: 'X', content: { twitter: {} }, viralScore: 1 })
  assert.equal(out, null)
  if (prevIngest !== undefined) process.env.VIRALOS_AUTO_INGEST = prevIngest
  if (prevProxy !== undefined) process.env.API_PROXY_BASE_URL = prevProxy
})
