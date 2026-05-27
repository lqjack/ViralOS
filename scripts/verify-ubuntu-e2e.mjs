#!/usr/bin/env node
/**
 * E2E against Ubuntu-deployed ViralOS (not localhost dev machine).
 *
 * Usage:
 *   # On Ubuntu after deploy:
 *   SMOKE_TEST_URL=http://127.0.0.1:3010 npm run verify:ubuntu
 *
 *   # From macOS against LAN:
 *   VIRALOS_URL=http://192.168.1.4:3010 npm run verify:ubuntu
 *
 *   # Real Anthropic pipeline (requires key on server .env; hits remote URL only):
 *   VIRALOS_URL=http://192.168.1.4:3010 ANTHROPIC_API_KEY=sk-... npm run verify:ubuntu:real
 */

import { postCampaignAndCollectEvents, assertCampaignE2eEvents } from './sse-campaign-e2e.mjs'

const BASE_URL = (
  process.env.VIRALOS_URL ||
  process.env.SMOKE_TEST_URL ||
  'http://127.0.0.1:3010'
).replace(/\/$/, '')

const RUN_REAL = process.argv.includes('--real') || process.env.VERIFY_UBUNTU_REAL === '1'

async function json(path, init) {
  const response = await fetch(`${BASE_URL}${path}`, init)
  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { response, body }
}

async function runSmoke() {
  const checks = []

  async function check(name, fn) {
    try {
      await fn()
      console.log(`✓ ${name}`)
      checks.push(true)
    } catch (e) {
      console.error(`✗ ${name}`)
      console.error(`  ${e.message}`)
      checks.push(false)
    }
  }

  console.log(`Ubuntu E2E smoke → ${BASE_URL}\n`)

  await check('GET /api/campaign metadata', async () => {
    const { response, body } = await json('/api/campaign')
    if (response.status !== 200) throw new Error(`status ${response.status}`)
    if (!body?.agents?.length) throw new Error('missing agents list')
  })

  await check('POST /api/campaign 503 without key (if server has no key)', async () => {
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('  (skip: ANTHROPIC_API_KEY set in client env)')
      return
    }
    const { response } = await json('/api/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'Ubuntu smoke' })
    })
    if (response.status !== 503 && response.status !== 200) {
      throw new Error(`expected 503 or 200, got ${response.status}`)
    }
  })

  await check('GET /', async () => {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    if (!html.includes('ViralOS')) throw new Error('missing landing')
  })

  const passed = checks.filter(Boolean).length
  console.log(`\n${passed}/${checks.length} smoke checks`)
  if (passed !== checks.length) process.exit(1)
}

async function runReal() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY required for --real (must match server .env on Ubuntu)')
    process.exit(1)
  }
  console.log(`Ubuntu REAL E2E → ${BASE_URL}\n`)
  const events = await postCampaignAndCollectEvents(BASE_URL, {
    product: 'Ubuntu Real E2E Tea',
    description: 'Deployed on Ubuntu, verified from client',
    audience: 'operators',
    tone: 'viral',
    platforms: ['twitter']
  })
  const result = assertCampaignE2eEvents(events, { requireUsage: true })
  console.log(`✓ Real pipeline complete — Viral Score ${result.viralScore}`)
}

async function main() {
  await runSmoke()
  if (RUN_REAL) await runReal()
  console.log('\nverify:ubuntu PASSED')
}

main().catch((err) => {
  console.error('\nverify:ubuntu FAILED:', err.message)
  process.exit(1)
})
