import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertNoMockContent,
  assertRealAgentUsage,
  assertRealCampaignUsage,
  hasRealTokenUsage
} from '../lib/real-ai-guard.js'

test('hasRealTokenUsage requires tokens', () => {
  assert.equal(hasRealTokenUsage({ input_tokens: 1, output_tokens: 2 }), true)
  assert.equal(hasRealTokenUsage({}), false)
})

test('assertRealAgentUsage throws without usage', () => {
  assert.throws(() => assertRealAgentUsage(null, 'test'), /Real Anthropic/)
})

test('assertNoMockContent rejects mock phrases', () => {
  assert.throws(() => assertNoMockContent('this is a mock campaign'), /Mock-like/)
})

test('assertRealCampaignUsage requires all three agents', () => {
  assert.throws(() => assertRealCampaignUsage({}), /Real Anthropic|Missing/)
  assert.doesNotThrow(() =>
    assertRealCampaignUsage({
      marketAnalyst: { input_tokens: 1, output_tokens: 1 },
      contentWriter: { input_tokens: 1, output_tokens: 1 },
      growthOptimizer: { input_tokens: 1, output_tokens: 1 }
    })
  )
})
