#!/usr/bin/env node

const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:3000'

async function check(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
    return true
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error.message}`)
    return false
  }
}

async function json(path, init) {
  const response = await fetch(`${BASE_URL}${path}`, init)
  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { response, body }
}

async function main() {
  console.log(`Running smoke tests against ${BASE_URL}`)

  const results = []

  results.push(await check('GET /api/campaign returns metadata', async () => {
    const { response, body } = await json('/api/campaign')
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`)
    if (!body?.endpoints?.['POST /api/campaign']) throw new Error('Missing POST /api/campaign metadata')
  }))

  results.push(await check('GET /api/route returns status', async () => {
    const { response, body } = await json('/api/route')
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`)
    if (body?.status !== 'ok') throw new Error('Expected status ok')
  }))

  results.push(await check('GET /api/social-media-content handles missing proxy config', async () => {
    const { response, body } = await json('/api/social-media-content')
    if (response.status !== 503) throw new Error(`Expected 503, got ${response.status}`)
    if (!body?.hint) throw new Error('Expected proxy configuration hint')
  }))

  results.push(await check('POST /api/campaign requires ANTHROPIC_API_KEY when unset', async () => {
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('  (skipped: ANTHROPIC_API_KEY is set in this environment)')
      return
    }

    const { response, body } = await json('/api/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'Smoke Test Product' })
    })

    if (response.status !== 503) throw new Error(`Expected 503, got ${response.status}`)
    if (!body?.error) throw new Error('Expected configuration error message')
  }))

  results.push(await check('GET /api/unknown returns 404 with available routes', async () => {
    const { response, body } = await json('/api/unknown-endpoint')
    if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`)
    if (!Array.isArray(body?.available)) throw new Error('Expected available routes list')
  }))

  results.push(await check('POST /api/campaign rejects missing product', async () => {
    const { response, body } = await json('/api/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'no product field' })
    })
    if (response.status !== 400) throw new Error(`Expected 400, got ${response.status}`)
    if (!body?.error) throw new Error('Expected validation error message')
  }))

  results.push(await check('PUT /api/campaign returns 405', async () => {
    const { response, body } = await json('/api/campaign', { method: 'PUT' })
    if (response.status !== 405) throw new Error(`Expected 405, got ${response.status}`)
    if (!body?.error) throw new Error('Expected method not allowed message')
  }))

  results.push(await check('GET / returns landing page', async () => {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`)
    if (!html.includes('ViralOS')) throw new Error('Expected ViralOS landing content')
  }))

  const passed = results.filter(Boolean).length
  const total = results.length

  console.log(`\n${passed}/${total} checks passed`)

  if (passed !== total) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
