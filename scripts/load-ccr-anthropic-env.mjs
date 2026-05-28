#!/usr/bin/env node
/**
 * Load Anthropic-compatible env from ~/.claude-code-router/config.json (CCR + OpenRouter).
 * Usage: eval "$(node scripts/load-ccr-anthropic-env.mjs)"
 *    or: node scripts/load-ccr-anthropic-env.mjs --export-for-ubuntu 192.168.1.6
 */

import { readFileSync, existsSync, writeFileSync, chmodSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const configPath = join(homedir(), '.claude-code-router', 'config.json')
if (!existsSync(configPath)) {
  console.error(`Missing ${configPath}`)
  process.exit(1)
}

const cfg = JSON.parse(readFileSync(configPath, 'utf8'))
const provider = cfg.providers?.find((p) => p.api_key) || cfg.providers?.[0]
const apiKey = provider?.api_key
if (!apiKey) {
  console.error('No api_key in CCR config providers[]')
  process.exit(1)
}

const port = cfg.server?.port ?? 3456
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

// shell-safe export lines for eval
const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`
console.log(`export ANTHROPIC_API_KEY=${q(apiKey)}`)
console.log(`export ANTHROPIC_BASE_URL=${q(baseUrl)}`)
