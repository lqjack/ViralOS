export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    name: 'ViralOS Route API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      'GET /api/campaign': 'Campaign API metadata',
      'POST /api/campaign': 'Generate viral campaign via streaming SSE'
    }
  })
}
