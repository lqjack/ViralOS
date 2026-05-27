/**
 * Runtime guards: production campaign path must use real Anthropic usage, not mock text.
 * Unit tests inject createClient with requireRealUsage: false.
 */

const MOCK_MARKERS = [
  /lorem ipsum/i,
  /\bmock campaign\b/i,
  /\bdev mock\b/i,
  /\bplaceholder response\b/i,
  /\bfake viral score\b/i,
  /\bstub (response|output)\b/i
]

export function hasRealTokenUsage(usage) {
  if (!usage || typeof usage !== 'object') return false
  const input = Number(usage.input_tokens ?? usage.inputTokens ?? 0)
  const output = Number(usage.output_tokens ?? usage.outputTokens ?? 0)
  return input + output > 0
}

export function assertRealAgentUsage(usage, agentName) {
  if (!hasRealTokenUsage(usage)) {
    throw new Error(
      `Real Anthropic completion required for ${agentName} (missing token usage — no mock fallback)`
    )
  }
}

export function assertNoMockContent(value, label = 'agent output') {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '')
  for (const pattern of MOCK_MARKERS) {
    if (pattern.test(text)) {
      throw new Error(`Mock-like content in ${label}: matched ${pattern}`)
    }
  }
}

export function assertRealCampaignUsage(usageBundle) {
  if (!usageBundle || typeof usageBundle !== 'object') {
    throw new Error('Missing usage metadata on campaign result')
  }
  for (const agent of ['marketAnalyst', 'contentWriter', 'growthOptimizer']) {
    assertRealAgentUsage(usageBundle[agent], agent)
  }
}
