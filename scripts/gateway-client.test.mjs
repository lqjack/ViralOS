import test from 'node:test'
import assert from 'node:assert/strict'
import { getProxyBaseUrl } from '../lib/proxy.js'

test('getProxyBaseUrl strips trailing slash', () => {
  const prev = process.env.API_PROXY_BASE_URL
  process.env.API_PROXY_BASE_URL = 'http://localhost:8001/'
  assert.equal(getProxyBaseUrl(), 'http://localhost:8001')
  if (prev === undefined) delete process.env.API_PROXY_BASE_URL
  else process.env.API_PROXY_BASE_URL = prev
})
