export default function handler(req, res) {
  return res.status(404).json({
    error: 'API route not found',
    path: req.url,
    available: [
      'GET /api/campaign',
      'POST /api/campaign',
      'GET /api/route',
      'GET /api/social-media-content',
      'GET /api/stock/*',
      'GET /api/dataproai/*'
    ]
  })
}
