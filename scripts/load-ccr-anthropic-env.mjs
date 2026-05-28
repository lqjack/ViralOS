#!/usr/bin/env node
/**
 * Load Anthropic-compatible env from ~/.claude-code-router/config.json (CCR + OpenRouter).
 * Usage: eval "$(node scripts/load-ccr-anthropic-env.mjs)"
 *    or: node scripts/load-ccr-anthropic-env.mjs --print-env-file
 */

import { writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { openRouterApiKeyFromCcr, ccrServerPort, readCcrConfig } from './read-ccr-config.mjs'

let cfg
try {
  cfg = readCcrConfig()
} catch (e) {
  console.error(e.message)
  process.exit(1)
}

const apiKey = openRouterApiKeyFromCcr()
const port = ccrServerPort(cfg)
const lanHost = process.argv.includes('--export-for-ubuntu')
  ? process.argv[process.argv.indexOf('--export-for-ubuntu') + 1]
  : null
const host = lanHost || '127.0.0.1'
const baseUrl = `http://${host}:${port}`

if (process.argv.includes('--print-env-file')) {
  process.stdout.write(
    `ANTHROPIC_API_KEY=${apiKey}\nANTHROPIC_BASE_URL=${baseUrl}\n`
  )
  process.exit(0)
}

if (process.argv.includes('--write-env-local')) {
  const target = join(process.cwd(), '.env.local')
  writeFileSync(target, `ANTHROPIC_API_KEY=${apiKey}\nANTHROPIC_BASE_URL=${baseUrl}\n`, { mode: 0o600 })
  chmodSync(target, 0o600)
  console.error(`Wrote ${target} (ANTHROPIC_BASE_URL=${baseUrl})`)
  process.exit(0)
}

const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`
console.log(`export ANTHROPIC_API_KEY=${q(apiKey)}`)
console.log(`export ANTHROPIC_BASE_URL=${q(baseUrl)}`)
