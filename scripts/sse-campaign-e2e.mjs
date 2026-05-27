import { readSseEventsFromResponse } from '../lib/sse-parse.js'
import { validateCompleteResult } from '../lib/campaign-validate.js'
import { assertNoMockContent, assertRealCampaignUsage } from '../lib/real-ai-guard.js'

export async function postCampaignAndCollectEvents(baseUrl, body, { apiKey } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-e2e-internal'] = '1'

  const response = await fetch(`${baseUrl}/api/campaign`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    let err
    try {
      err = JSON.parse(text)
    } catch {
      err = { error: text }
    }
    const msg = err.error || err.hint || `HTTP ${response.status}`
    throw new Error(msg)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream')) {
    throw new Error(`Expected SSE, got ${contentType}`)
  }

  return readSseEventsFromResponse(response)
}

export function assertCampaignE2eEvents(events, { requireUsage = false } = {}) {
  const starts = events.filter((e) => e.type === 'agent_start')
  const dones = events.filter((e) => e.type === 'agent_done')
  const complete = events.find((e) => e.type === 'complete')
  const err = events.find((e) => e.type === 'error')

  if (err) throw new Error(`Pipeline error event: ${err.message}`)
  if (!complete) throw new Error('Missing complete event')

  if (starts.length < 4) {
    throw new Error(`Expected 4 agent_start events, got ${starts.length}`)
  }
  if (dones.length < 4) {
    throw new Error(`Expected 4 agent_done events, got ${dones.length}`)
  }

  for (const agent of ['marketAnalyst', 'contentWriter', 'growthOptimizer']) {
    const done = dones.find((e) => e.agent === agent)
    if (!done) throw new Error(`Missing agent_done for ${agent}`)
    if (done.validation && !done.validation.ok) {
      throw new Error(`${agent} validation failed: ${done.validation.reason}`)
    }
    if (done.data?.error === 'Parse failed') {
      throw new Error(`${agent} returned parse failure`)
    }
  }

  const check = validateCompleteResult(complete.result)
  if (!check.ok) throw new Error(`Invalid complete.result: ${check.reason}`)

  if (requireUsage) {
    assertRealCampaignUsage(complete.result.usage)
    assertNoMockContent(complete.result, 'complete.result')
  }

  return complete.result
}
