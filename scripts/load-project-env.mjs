/**
 * Load .env.local / .env into a plain object (no dependency on dotenv).
 * Project files override existing process.env keys when mergeProjectEnv is used.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function parseEnvFile(content) {
  const out = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

/** Read env files from project root (later files do not override earlier in this list). */
export function readProjectEnvFiles(root, files = ['.env', '.env.local']) {
  const merged = {}
  for (const name of files) {
    const path = join(root, name)
    if (!existsSync(path)) continue
    Object.assign(merged, parseEnvFile(readFileSync(path, 'utf8')))
  }
  return merged
}

/** process.env with project .env.local / .env taking precedence over shell. */
export function mergeProjectEnv(root, base = process.env) {
  return { ...base, ...readProjectEnvFiles(root) }
}
