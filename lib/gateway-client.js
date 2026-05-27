/**
 * Typed-ish client for invest-ai gateway (Phase 2.1).
 * Discovery: GET {API_PROXY_BASE_URL}/api/routes
 */

import { fetchWithRetry, getProxyBaseUrl } from './proxy.js'

export function getGatewayBaseUrl() {
  return getProxyBaseUrl()
}

export async function fetchRouteCatalog(baseUrl = getGatewayBaseUrl()) {
  if (!baseUrl) {
    throw new Error('API_PROXY_BASE_URL is not set')
  }
  const response = await fetchWithRetry(`${baseUrl}/api/routes`, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`GET /api/routes failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchCampaignSchema(baseUrl = getGatewayBaseUrl()) {
  if (!baseUrl) {
    throw new Error('API_PROXY_BASE_URL is not set')
  }
  const response = await fetchWithRetry(
    `${baseUrl}/api/integrations/viralos/campaigns/schema`,
    { method: 'GET' }
  )
  if (!response.ok) {
    throw new Error(`GET campaign schema failed: ${response.status}`)
  }
  return response.json()
}

/**
 * POST a ViralOS campaign result to invest-ai file-drop ingest.
 * @param {object} campaign - complete campaign payload (see viralos-campaign-v1 schema)
 */
export async function searchCampaigns(query, { limit = 10, baseUrl = getGatewayBaseUrl() } = {}) {
  if (!baseUrl) {
    throw new Error('API_PROXY_BASE_URL is not set')
  }
  const params = new URLSearchParams({ q: String(query), limit: String(limit) })
  const response = await fetchWithRetry(
    `${baseUrl}/api/integrations/viralos/campaigns/search?${params}`,
    { method: 'GET' }
  )
  if (!response.ok) {
    throw new Error(`Campaign search failed: ${response.status}`)
  }
  return response.json()
}

export async function ingestCampaign(campaign, baseUrl = getGatewayBaseUrl()) {
  if (!baseUrl) {
    throw new Error('API_PROXY_BASE_URL is not set')
  }
  const body = {
    schema_version: 'viralos-campaign-v1',
    ...campaign
  }
  const headers = { 'content-type': 'application/json' }
  const token = process.env.VIRALOS_INGEST_TOKEN
  if (token) {
    headers['x-viralos-ingest-token'] = token
  }

  const response = await fetchWithRetry(
    `${baseUrl}/api/integrations/viralos/campaigns`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }
  )
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Campaign ingest failed: ${response.status} ${JSON.stringify(payload)}`)
  }
  return payload
}
