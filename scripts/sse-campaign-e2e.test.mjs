import test from 'node:test'
import assert from 'node:assert/strict'
import { assertCampaignE2eEvents } from './sse-campaign-e2e.mjs'

function validPipelineEvents() {
  const market = { persona: { name: 'A', age: '30', traits: ['x'], painPoint: 'time' }, emotionalDrivers: ['fomo'] }
  const content = { twitter: { hook: 'hi', body: 'post' } }
  const growth = { viralScore: 82, scoreBreakdown: { hook: 80 }, growthStrategy: 'ads', boostTips: ['tip'], timing: '9am' }
  return [
    { type: 'agent_start', agent: 'marketAnalyst', name: 'Market Analyst' },
    { type: 'agent_done', agent: 'marketAnalyst', data: market, validation: { ok: true } },
    { type: 'agent_start', agent: 'contentWriter', name: 'Content Writer' },
    { type: 'agent_done', agent: 'contentWriter', data: content, validation: { ok: true } },
    { type: 'agent_start', agent: 'growthOptimizer', name: 'Growth Optimizer' },
    { type: 'agent_done', agent: 'growthOptimizer', data: growth, validation: { ok: true } },
    { type: 'agent_start', agent: 'campaignDirector', name: 'Campaign Director' },
    { type: 'agent_done', agent: 'campaignDirector', data: { status: 'packaged' } },
    {
      type: 'complete',
      result: {
        product: 'Tea',
        persona: market.persona,
        emotionalDrivers: market.emotionalDrivers,
        content,
        viralScore: growth.viralScore,
        scoreBreakdown: growth.scoreBreakdown,
        growthStrategy: growth.growthStrategy,
        boostTips: growth.boostTips,
        timing: growth.timing,
        platforms: ['twitter']
      }
    }
  ]
}

test('assertCampaignE2eEvents accepts full 4-agent pipeline', () => {
  const result = assertCampaignE2eEvents(validPipelineEvents())
  assert.equal(result.product, 'Tea')
  assert.equal(result.viralScore, 82)
})

test('assertCampaignE2eEvents rejects missing complete', () => {
  const events = validPipelineEvents().filter((e) => e.type !== 'complete')
  assert.throws(
    () => assertCampaignE2eEvents(events),
    /Missing complete event/
  )
})

test('assertCampaignE2eEvents rejects validation failure', () => {
  const events = validPipelineEvents()
  const idx = events.findIndex((e) => e.agent === 'contentWriter' && e.type === 'agent_done')
  events[idx] = { ...events[idx], validation: { ok: false, reason: 'missing platform' } }
  assert.throws(
    () => assertCampaignE2eEvents(events),
    /contentWriter validation failed/
  )
})
