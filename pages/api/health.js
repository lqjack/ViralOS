/** Liveness probe for Ubuntu deploy / canary (see docs/deploy-ubuntu.md). */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    service: 'viralOS',
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0'
  })
}
