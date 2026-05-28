#!/usr/bin/env node
/**
 * Local design verification (no Ubuntu / no cross-public-network required).
 * - verify:no-mock + unit tests (always)
 * - optional: streamCampaign CLI smoke when project ANTHROPIC_API_KEY is set and API reachable
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { mergeProjectEnv, readProjectEnvFiles } from './load-project-env.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, env, stdio: 'inherit', shell: false })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
  })
}

function projectAnthropicKey(env) {
  const fromFile = readProjectEnvFiles(root).ANTHROPIC_API_KEY?.trim()
  if (fromFile) return fromFile
  const fromShell = env.ANTHROPIC_API_KEY?.trim()
  if (!fromShell) return null
  // sk-ant-* (Anthropic) or sk-or-* (OpenRouter via CCR config)
  if (/^sk-(ant|or)-/i.test(fromShell)) return fromShell
  return null
}

async function anthropicPreflight(env) {
  const key = projectAnthropicKey(env)
  if (!key) return { ok: false, reason: 'no project ANTHROPIC_API_KEY (.env.local or sk-ant-* in shell)' }

  const clientEnv = { ...env, ANTHROPIC_API_KEY: key }
  delete clientEnv.ANTHROPIC_AUTH_TOKEN

  const base = clientEnv.ANTHROPIC_BASE_URL?.replace(/\/$/, '')
  if (base?.includes('127.0.0.1') || base?.includes('localhost')) {
    try {
      const probe = await fetch(`${base}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }]
        }),
        signal: AbortSignal.timeout(8000)
      })
      if (probe.ok || probe.status === 400 || probe.status === 401) {
        return { ok: true, env: clientEnv }
      }
    } catch {
      return {
        ok: false,
        reason: `ANTHROPIC_BASE_URL unreachable (${base}) — fix proxy or unset for direct api.anthropic.com`
      }
    }
  }

  try {
    const client = new Anthropic({ apiKey: key, baseURL: base || undefined })
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }]
    })
    return { ok: true, env: clientEnv }
  } catch (err) {
    return { ok: false, reason: err.message || String(err) }
  }
}

async function main() {
  console.log('==> verify:local-design (LAN / Ubuntu ops deferred)\n')

  await run('npm', ['run', 'verify:func'])

  const projectEnv = mergeProjectEnv(root)
  const preflight = await anthropicPreflight(projectEnv)

  if (preflight.ok) {
    console.log('\n==> CLI streamCampaign (real LLM via CCR or Anthropic, no server)')
    await run('node', ['examples/basic-campaign.js', 'Local Design Verify'], {
      ...preflight.env,
      PLATFORMS: 'twitter'
    })
  } else {
    console.log(`\nSKIP CLI real LLM: ${preflight.reason}`)
    if (preflight.reason.includes('unreachable') || preflight.reason.includes('ECONNREFUSED')) {
      console.log('  Fix: npm run ops:ccr:start   # CCR + SSH tunnel + .env.local from config')
    } else {
      console.log('  Fix: npm run ops:ccr:env-local   # write .env.local from ~/.claude-code-router/config.json')
    }
  }

  console.log('\nverify:local-design PASSED')
  console.log('Deferred until LAN: deploy:ubuntu:sync, verify:ubuntu:all, verify:cross-repo-live')
}

main().catch((err) => {
  console.error('\nverify:local-design FAILED:', err.message)
  process.exit(1)
})
