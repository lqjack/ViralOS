/**
 * Optional post-campaign ingest into invest-ai gateway (Phase 4.3).
 * Runs when API_PROXY_BASE_URL is set; disable with VIRALOS_AUTO_INGEST=0.
 */

import { ingestCampaign } from './gateway-client.js'

export function campaignPayloadForIngest(result) {
  const { usage, ...payload } = result || {}
  return payload
}

export async function ingestCampaignIfConfigured(result) {
  if (process.env.VIRALOS_AUTO_INGEST === '0') {
    return null
  }
  if (!process.env.API_PROXY_BASE_URL?.trim()) {
    return null
  }
  return ingestCampaign(campaignPayloadForIngest(result))
}
