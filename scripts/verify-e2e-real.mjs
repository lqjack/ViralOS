#!/usr/bin/env node

/**
 * Real end-to-end: POST /api/campaign → SSE → Anthropic-backed agents.
 * Requires ANTHROPIC_API_KEY and a running server (or auto-start via smoke-with-server pattern).
 */

import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { postCampaignAndCollectEvents, assertCampaignE2eEvents } from './sse-campaign-e2e.mjs'

const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:3000'
const AUTO_START = process.env.E2E_AUTO_START !== '0'

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${url}/api/campaign`)
      if (res.ok) return
    } catch {
      // retry
    }
    await delay(1000)
  }
  throw new Error(`Server not ready at ${url}`)
}

function startServer() {
  return spawn('npm', ['run', 'start'], {
    stdio: 'ignore',
    detached: true,
    env: process.env
  })
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required for verify:e2e-real')
    process.exit(1)
  }

  let server
  if (AUTO_START) {
    console.log('Starting production server...')
    server = startServer()
    server.unref()
    await delay(4000)
  }

  try {
    await waitForServer(BASE_URL)
    console.log(`POST /api/campaign (real LLM) → ${BASE_URL}`)

    const events = await postCampaignAndCollectEvents(BASE_URL, {
      product: 'E2E Verify Tea Infuser',
      description: 'One-click loose leaf brewing for office desks',
      audience: 'busy professionals',
      tone: 'viral',
      platforms: ['twitter']
    })

    const result = assertCampaignE2eEvents(events, { requireUsage: true })

    console.log('✓ SSE pipeline: 4 agents + complete')
    console.log(`✓ Viral Score: ${result.viralScore}`)
    console.log(`✓ Platforms in content: ${Object.keys(result.content).join(', ')}`)
    console.log('✓ Real usage tokens present on result.usage')
    console.log('\nverify:e2e-real PASSED')
  } finally {
    if (server?.pid) {
      try {
        process.kill(-server.pid)
      } catch {
        try {
          process.kill(server.pid)
        } catch {
          // stopped
        }
      }
    }
  }
}

main().catch((err) => {
  console.error('\nverify:e2e-real FAILED')
  console.error(err.message)
  process.exit(1)
})
