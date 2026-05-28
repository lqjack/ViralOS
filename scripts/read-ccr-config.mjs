/**
 * Read OpenRouter api_key from ~/.claude-code-router/config.json (shared by CCR + LiteLLM).
 */

import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function readCcrConfig() {
  const configPath = join(homedir(), '.claude-code-router', 'config.json')
  if (!existsSync(configPath)) {
    throw new Error(`Missing ${configPath}`)
  }
  return JSON.parse(readFileSync(configPath, 'utf8'))
}

export function openRouterApiKeyFromCcr() {
  const cfg = readCcrConfig()
  const provider = cfg.providers?.find((p) => p.api_key) || cfg.providers?.[0]
  const apiKey = provider?.api_key?.trim()
  if (!apiKey) throw new Error('No providers[].api_key in CCR config')
  return apiKey
}

export function ccrServerPort(cfg = readCcrConfig()) {
  return cfg.server?.port ?? 3456
}
