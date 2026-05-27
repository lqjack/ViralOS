#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const env = { ...process.env, ANTHROPIC_API_KEY: '' }

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
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

  await delay(5000)
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
