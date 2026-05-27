import { test } from 'node:test'
import assert from 'node:assert/strict'
import { streamCampaign, CAMPAIGN_API_INFO } from '../lib/campaign.js'

function mockClient() {
  let call = 0
  return {
    messages: {
      create: async () => {
        call += 1
        const usage = { input_tokens: 100, output_tokens: 50 }
        if (call === 1) {
          return {
            content: [{
              text: '{"persona":{"name":"Alex","age":"28","traits":["busy"],"painPoint":"time"},"emotionalDrivers":["convenience"],"competitorGap":"price"}'
            }],
            usage
          }
        }
        if (call === 2) {
          return {
            content: [{ text: '{"twitter":{"hook":"Hello world","thread":["t1"],"hashtags":["#test"]}}' }],
            usage
          }
        }
        return {
          content: [{
            text: '{"viralScore":82,"scoreBreakdown":{"hook":80,"shareability":85,"emotion":81},"growthStrategy":"post early","boostTips":["use video"],"timing":{"best_days":["Tue"],"best_hours":"9am"}}'
          }],
          usage
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
    { createClient: mockClient, requireRealUsage: false }
  )

  assert.equal(events.filter((e) => e.type === 'agent_start').length, 4)
  assert.equal(events.filter((e) => e.type === 'agent_done').length, 4)

  const director = events.find((e) => e.agent === 'campaignDirector' && e.type === 'agent_done')
  assert.ok(director)
  assert.equal(director.data.status, 'packaged')

  const complete = events.find((e) => e.type === 'complete')
  assert.ok(complete)
  assert.equal(complete.result.product, 'Test Product')
  assert.equal(complete.result.viralScore, 82)
  assert.ok(complete.result.content.twitter)

  const marketDone = events.find((e) => e.agent === 'marketAnalyst' && e.type === 'agent_done')
  assert.equal(marketDone.validation.ok, true)
})

test('streamCampaign stops on validation failure', async () => {
  const events = []
  const badClient = () => ({
    messages: {
      create: async () => ({
        content: [{ text: 'not json at all' }]
      })
    }
  })

  await streamCampaign(
    { product: 'Bad', platforms: ['twitter'] },
    (event) => events.push(event),
    { createClient: badClient, requireRealUsage: false }
  )

  assert.ok(events.some((e) => e.type === 'error'))
  assert.equal(events.find((e) => e.type === 'complete'), undefined)
})
