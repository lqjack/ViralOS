#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:3000'
const env = { ...process.env, ANTHROPIC_API_KEY: '' }

async function waitForServer(url, attempts = 45) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${url}/api/campaign`)
      if (res.status === 200) return
    } catch {
      // retry
    }
    await delay(1000)
  }
  throw new Error(`Server not ready at ${url} after ${attempts}s`)
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...env, SMOKE_TEST_URL: BASE_URL },
      ...options
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

let server

try {
  server = spawn('npm', ['run', 'start'], {
    env,
    stdio: 'ignore',
    detached: true
  })
  server.unref()

  console.log(`Waiting for ${BASE_URL} ...`)
  await waitForServer(BASE_URL)
  await run('npm', ['run', 'smoke-test'])
  console.log('\nSmoke tests completed successfully.')
} finally {
  if (server?.pid) {
    try {
      process.kill(-server.pid)
    } catch {
      try {
        process.kill(server.pid)
      } catch {
        // already stopped
      }
    }
  }
}
