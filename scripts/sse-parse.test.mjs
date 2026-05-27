import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseSseBuffer } from '../lib/sse-parse.js'

test('parseSseBuffer extracts JSON events', () => {
  const chunk = 'data: {"type":"agent_start","agent":"a"}\n\n'
  const { events, remainder } = parseSseBuffer(chunk)
  assert.equal(events.length, 1)
  assert.equal(events[0].agent, 'a')
  assert.equal(remainder, '')
})

test('parseSseBuffer keeps partial remainder', () => {
  const { events, remainder } = parseSseBuffer('data: {"type":')
  assert.equal(events.length, 0)
  assert.ok(remainder.includes('data:'))
})
