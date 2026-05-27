import { proxyRequest } from '../../../../lib/proxy'

/** BFF → invest-ai gateway native ViralOS integration routes (Phase 5.2). */
export default async function handler(req, res) {
  return proxyRequest(req, res, '/api/integrations/viralos')
}

export const config = {
  api: {
    bodyParser: true
  }
}
