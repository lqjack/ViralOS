import { CAMPAIGN_API_INFO, streamCampaign } from '../../lib/campaign'
import { ingestCampaignIfConfigured } from '../../lib/campaign-ingest.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(CAMPAIGN_API_INFO)
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { product, description, audience, tone, platforms } = req.body || {}

  if (!product) {
    return res.status(400).json({ error: 'Product name required' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY is not configured',
      hint: 'Add ANTHROPIC_API_KEY to .env.local or your Vercel project settings'
    })
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  let completeResult = null

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    if (data.type === 'complete') {
      completeResult = data.result
    }
  }

  try {
    await streamCampaign({ product, description, audience, tone, platforms }, send)
    if (completeResult) {
      try {
        const ingest = await ingestCampaignIfConfigured(completeResult)
        if (ingest) {
          send({ type: 'ingest_done', ingest })
        }
      } catch (ingestError) {
        send({ type: 'ingest_error', message: ingestError.message })
      }
    }
  } catch (error) {
    send({ type: 'error', message: error.message })
  } finally {
    res.end()
  }
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false
  }
}
