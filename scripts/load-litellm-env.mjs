#!/usr/bin/env node
/**
 * ViralOS env for Ubuntu LiteLLM (:4000) — Anthropic SDK → LiteLLM /v1/messages.
 * OpenRouter key stays in LiteLLM container (from ~/.claude-code-router/config.json).
 *
 * Usage:
 *   node scripts/load-litellm-env.mjs --print-env-file
 *   node scripts/load-litellm-env.mjs --write-env-local
 *   eval "$(node scripts/load-litellm-env.mjs)"
 */

import { writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

const litellmBase = (process.env.LITELLM_BASE_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')
const masterKey = process.env.LITELLM_MASTER_KEY || 'sk-gateway-master-key'
const campaignModel = process.env.CAMPAIGN_MODEL || 'ccr-mac'
const cfHost = process.env.LITELLM_TUNNEL_HOST || 'litellm.datapro.asia'

function lines(baseUrl) {
  return [
    `ANTHROPIC_API_KEY=${masterKey}`,
    `ANTHROPIC_BASE_URL=${baseUrl}`,
    `CAMPAIGN_MODEL=${campaignModel}`,
    `LITELLM_BASE_URL=${baseUrl}`,
    `LITELLM_MASTER_KEY=${masterKey}`
  ]
}

function writeEnvLocal(baseUrl) {
  const target = join(process.cwd(), '.env.local')
  writeFileSync(target, `${lines(baseUrl).join('\n')}\n`, { mode: 0o600 })
  chmodSync(target, 0o600)
  console.error(`Wrote ${target} (LiteLLM ${baseUrl}, model ${campaignModel})`)
}

if (process.argv.includes('--print-env-file')) {
  const useCf = process.argv.includes('--public')
  const base = useCf ? `https://${cfHost}` : litellmBase
  process.stdout.write(`${lines(base).join('\n')}\n`)
  process.exit(0)
}

if (process.argv.includes('--write-env-local')) {
  const useCf = process.argv.includes('--public')
  writeEnvLocal(useCf ? `https://${cfHost}` : litellmBase)
  process.exit(0)
}

const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`
for (const line of lines(litellmBase)) {
  const eq = line.indexOf('=')
  console.log(`export ${line.slice(0, eq)}=${q(line.slice(eq + 1))}`)
}
