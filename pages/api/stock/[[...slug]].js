import { proxyRequest } from '../../../lib/proxy'

export default async function handler(req, res) {
  return proxyRequest(req, res, '/api/stock')
}

export const config = {
  api: {
    bodyParser: true
  }
}
