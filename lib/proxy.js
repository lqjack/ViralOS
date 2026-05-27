const DEFAULT_TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS || 30_000)
const DEFAULT_RETRIES = Number(process.env.API_PROXY_RETRIES || 2)
const RETRY_DELAY_MS = Number(process.env.API_PROXY_RETRY_DELAY_MS || 500)

export function getProxyBaseUrl() {
  const base = process.env.API_PROXY_BASE_URL
  if (!base) return null
  return base.replace(/\/$/, '')
}

export function getSlugPath(query) {
  const slug = query.slug
  if (!slug) return ''
  return Array.isArray(slug) ? slug.join('/') : String(slug)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500
}

/**
 * Fetch with timeout and retries (Phase 1.3 cross-repo alignment).
 */
export async function fetchWithRetry(url, init = {}, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retries = options.retries ?? DEFAULT_RETRIES
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS

  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timer)
      if (isRetryableStatus(response.status) && attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1))
        continue
      }
      return response
    } catch (error) {
      clearTimeout(timer)
      lastError = error
      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1))
        continue
      }
      throw lastError
    }
  }
  throw lastError || new Error('fetch failed')
}

export async function proxyRequest(req, res, upstreamPath) {
  const baseUrl = getProxyBaseUrl()
  if (!baseUrl) {
    return res.status(503).json({
      error: 'Proxy backend not configured',
      hint: 'Set API_PROXY_BASE_URL to the invest-ai gateway root (e.g. http://localhost:8001)'
    })
  }

  const slug = getSlugPath(req.query)
  const pathSuffix = slug ? `/${slug}` : ''
  const url = `${baseUrl}${upstreamPath}${pathSuffix}`

  try {
    const headers = {}
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type']
    }
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization
    }

    const init = {
      method: req.method,
      headers
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
      headers['content-type'] = headers['content-type'] || 'application/json'
    }

    const response = await fetchWithRetry(url, init)
    const contentType = response.headers.get('content-type') || 'application/json'
    const body = await response.text()

    res.status(response.status)
    res.setHeader('content-type', contentType)
    return res.send(body)
  } catch (error) {
    const aborted = error?.name === 'AbortError'
    return res.status(502).json({
      error: 'Upstream proxy request failed',
      details: aborted ? 'timeout' : error.message
    })
  }
}
