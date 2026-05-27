import { test } from 'node:test'
import assert from 'node:assert/strict'
import { streamCampaign, CAMPAIGN_API_INFO } from '../lib/campaign.js'

function mockClient() {
  let call = 0
  return {
    messages: {
      create: async () => {
        call += 1
        if (call === 1) {
          return {
            content: [{
              text: '{"persona":{"name":"Alex","age":"28","traits":["busy"],"painPoint":"time"},"emotionalDrivers":["convenience"],"competitorGap":"price"}'
            }]
          }
        }
        if (call === 2) {
          return {
            content: [{ text: '{"twitter":{"hook":"Hello world","thread":["t1"],"hashtags":["#test"]}}' }]
          }
        }
        return {
          content: [{
            text: '{"viralScore":82,"scoreBreakdown":{"hook":80,"shareability":85,"emotion":81},"growthStrategy":"post early","boostTips":["use video"],"timing":{"best_days":["Tue"],"best_hours":"9am"}}'
          }]
        }
      }
    }
  }
}

test('CAMPAIGN_API_INFO exposes POST endpoint', () => {
  assert.equal(CAMPAIGN_API_INFO.name, 'ViralOS Campaign API')
  assert.ok(CAMPAIGN_API_INFO.endpoints['POST /api/campaign'])
})

test('streamCampaign emits agent lifecycle and complete event', async () => {
  const events = []

  await streamCampaign(
    { product: 'Test Product', tone: 'viral', platforms: ['twitter'] },
    (event) => events.push(event),
    { createClient: mockClient }
  )

  assert.equal(events.filter((e) => e.type === 'agent_start').length, 3)
  assert.equal(events.filter((e) => e.type === 'agent_done').length, 3)

  const complete = events.find((e) => e.type === 'complete')
  assert.ok(complete)
  assert.equal(complete.result.product, 'Test Product')
  assert.equal(complete.result.viralScore, 82)
  assert.ok(complete.result.content.twitter)
})
