#!/usr/bin/env node
/**
 * LIVE cross-repo E2E from ViralOS — real HTTP to invest-ai gateway (no mock).
 *
 * Requires: API_PROXY_BASE_URL=http://127.0.0.1:8001 and gateway running
 * (run invest-ai/scripts/cross_repo_live_e2e.py first).
 */

import { fetchRouteCatalog, ingestCampaign } from '../lib/gateway-client.js'

const base = process.env.API_PROXY_BASE_URL
if (!base) {
  console.error('FAIL: set API_PROXY_BASE_URL (e.g. http://127.0.0.1:8001)')
  process.exit(1)
}

async function main() {
  const catalog = await fetchRouteCatalog()
  if (!catalog?.viralos_proxy_mappings?.length) {
    throw new Error('empty viralos_proxy_mappings')
  }
  console.log('OK: fetchRouteCatalog', catalog.viralos_proxy_mappings.length, 'mappings')

  const result = await ingestCampaign({
    product: 'ViralOS Live E2E',
    content: { twitter: 'from viralos live e2e' },
    viralScore: 87,
    platforms: ['twitter']
  })
  if (!result?.ok || !result?.id) {
    throw new Error(`ingest failed: ${JSON.stringify(result)}`)
  }
  console.log('OK: ingestCampaign', result.id, result.path)
}

main().catch((err) => {
  console.error('FAIL:', err.message)
  process.exit(1)
})
