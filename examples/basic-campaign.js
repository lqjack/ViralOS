#!/usr/bin/env node
/**
 * CLI: run the same streamCampaign pipeline as POST /api/campaign (real Anthropic, no HTTP server).
 * Usage: ANTHROPIC_API_KEY=sk-ant-... node examples/basic-campaign.js "Product name"
 */

import { streamCampaign } from '../lib/campaign.js'

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required (no mock fallback).')
    process.exit(1)
  }

  const product = process.argv[2] || 'ViralOS CLI Demo'
  const platforms = (process.env.PLATFORMS || 'twitter').split(',').map((p) => p.trim()).filter(Boolean)

  console.error(`Generating campaign for: ${product} (platforms: ${platforms.join(', ')})`)

  let complete = null

  await streamCampaign(
    {
      product,
      description: process.env.DESCRIPTION || 'Generated from examples/basic-campaign.js',
      audience: process.env.AUDIENCE || 'early adopters',
      tone: process.env.TONE || 'viral',
      platforms
    },
    (event) => {
      console.log(JSON.stringify(event))
      if (event.type === 'complete') complete = event.result
      if (event.type === 'error') throw new Error(event.message)
    }
  )

  if (!complete?.viralScore) {
    console.error('Pipeline finished without viralScore')
    process.exit(1)
  }

  console.error(`\nDone. Viral Score: ${complete.viralScore}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
