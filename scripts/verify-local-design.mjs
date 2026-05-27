#!/usr/bin/env node
/**
 * Local design verification (no Ubuntu / no cross-public-network required).
 * - verify:no-mock + unit tests (always)
 * - optional: streamCampaign CLI smoke when ANTHROPIC_API_KEY is set
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, env, stdio: 'inherit', shell: false })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
  })
}

async function main() {
  console.log('==> verify:local-design (LAN / Ubuntu ops deferred)\n')

  await run('npm', ['run', 'verify:func'])

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\n==> CLI streamCampaign (real Anthropic, no server)')
    await run('node', ['examples/basic-campaign.js', 'Local Design Verify'], {
      ...process.env,
      PLATFORMS: 'twitter'
    })
  } else {
    console.log('\nSKIP CLI real LLM (set ANTHROPIC_API_KEY to run examples/basic-campaign.js)')
  }

  console.log('\nverify:local-design PASSED')
  console.log('Deferred until LAN: deploy:ubuntu:sync, verify:ubuntu:all, verify:cross-repo-live')
}

main().catch((err) => {
  console.error('\nverify:local-design FAILED:', err.message)
  process.exit(1)
})
