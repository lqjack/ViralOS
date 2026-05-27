import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateMarketData,
  validateContentData,
  validateGrowthData,
  validateCompleteResult
} from '../lib/campaign-validate.js'

test('validateMarketData rejects parse failure', () => {
  const r = validateMarketData({ error: 'Parse failed', raw: 'x' })
  assert.equal(r.ok, false)
})

test('validateContentData requires platform keys', () => {
  const ok = validateContentData({ twitter: { hook: 'hi' } }, ['twitter'])
  assert.equal(ok.ok, true)
  const bad = validateContentData({ linkedin: {} }, ['twitter'])
  assert.equal(bad.ok, false)
})

test('validateCompleteResult accepts full package', () => {
  const r = validateCompleteResult({
    product: 'Tea',
    persona: { name: 'A', age: '30', traits: [], painPoint: 'time' },
    content: { twitter: { hook: 'x' } },
    viralScore: 80,
    scoreBreakdown: { hook: 80 }
  })
  assert.equal(r.ok, true)
})
