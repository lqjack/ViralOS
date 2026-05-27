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

export async function proxyRequest(req, res, upstreamPath) {
  const baseUrl = getProxyBaseUrl()
  if (!baseUrl) {
    return res.status(503).json({
      error: 'Proxy backend not configured',
      hint: 'Set API_PROXY_BASE_URL in your environment to enable this endpoint'
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

    const response = await fetch(url, init)
    const contentType = response.headers.get('content-type') || 'application/json'
    const body = await response.text()

    res.status(response.status)
    res.setHeader('content-type', contentType)
    return res.send(body)
  } catch (error) {
    return res.status(502).json({
      error: 'Upstream proxy request failed',
      details: error.message
    })
  }
}
