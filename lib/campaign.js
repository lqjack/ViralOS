import Anthropic from '@anthropic-ai/sdk'
import { AGENTS, AGENT_ORDER } from './campaign-agents.js'
import {
  validateContentData,
  validateGrowthData,
  validateMarketData
} from './campaign-validate.js'

export { AGENTS, AGENT_ORDER } from './campaign-agents.js'

export const CAMPAIGN_MODEL = 'claude-sonnet-4-20250514'

async function runAgent(client, systemPrompt, userPrompt, { retry = true } = {}) {
  const attempt = async (suffix = '') => {
    const response = await client.messages.create({
      model: CAMPAIGN_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt + suffix }]
    })

    const text = response.content.map((b) => b.text || '').join('')
    try {
      return { data: JSON.parse(text.replace(/```json|```/g, '').trim()), usage: response.usage }
    } catch {
      return { data: { error: 'Parse failed', raw: text }, usage: response.usage }
    }
  }

  let result = await attempt()
  if (result.data?.error === 'Parse failed' && retry) {
    result = await attempt('\n\nReturn ONLY minified valid JSON. No markdown fences.')
  }
  return result
}

export async function streamCampaign(
  { product, description, audience, tone, platforms },
  send,
  { createClient = () => new Anthropic() } = {}
) {
  const client = createClient()
  const platformList = platforms || ['twitter', 'tiktok']

  send({ type: 'agent_start', agent: 'marketAnalyst', name: AGENTS.marketAnalyst.name })
  const marketResult = await runAgent(
    client,
    AGENTS.marketAnalyst.systemPrompt,
    `Product: ${product}\nDescription: ${description || 'N/A'}\nAudience: ${audience || 'general'}\n\nReturn JSON: {"persona": {"name": "string", "age": "string", "traits": ["..."], "painPoint": "..."}, "emotionalDrivers": ["..."], "competitorGap": "..."}`
  )
  const marketData = marketResult.data
  const marketCheck = validateMarketData(marketData)
  send({
    type: 'agent_done',
    agent: 'marketAnalyst',
    data: marketData,
    validation: marketCheck
  })
  if (!marketCheck.ok) {
    send({ type: 'error', message: `Market Analyst validation failed: ${marketCheck.reason}` })
    return
  }

  send({ type: 'agent_start', agent: 'contentWriter', name: AGENTS.contentWriter.name })
  const contentResult = await runAgent(
    client,
    AGENTS.contentWriter.systemPrompt,
    `Write content for: ${product}\nDescription: ${description || 'N/A'}\nAudience: ${JSON.stringify(marketData.persona || {})}\nTone: ${tone || 'viral'}\nPlatforms: ${platformList.join(', ')}\n\nReturn JSON with keys for each requested platform only.`
  )
  const contentData = contentResult.data
  const contentCheck = validateContentData(contentData, platformList)
  send({
    type: 'agent_done',
    agent: 'contentWriter',
    data: contentData,
    validation: contentCheck
  })
  if (!contentCheck.ok) {
    send({ type: 'error', message: `Content Writer validation failed: ${contentCheck.reason}` })
    return
  }

  send({ type: 'agent_start', agent: 'growthOptimizer', name: AGENTS.growthOptimizer.name })
  const growthResult = await runAgent(
    client,
    AGENTS.growthOptimizer.systemPrompt,
    `Score this campaign:\nProduct: ${product}\nPlatforms: ${platformList.join(', ')}\nContent preview: ${JSON.stringify(contentData).slice(0, 600)}\n\nReturn JSON: {"viralScore": 85, "scoreBreakdown": {"hook": 88, "shareability": 82, "emotion": 90}, "growthStrategy": "...", "boostTips": ["..."], "timing": {"best_days": ["..."], "best_hours": "..."}}`
  )
  const growthData = growthResult.data
  const growthCheck = validateGrowthData(growthData)
  send({
    type: 'agent_done',
    agent: 'growthOptimizer',
    data: growthData,
    validation: growthCheck
  })
  if (!growthCheck.ok) {
    send({ type: 'error', message: `Growth Optimizer validation failed: ${growthCheck.reason}` })
    return
  }

  send({ type: 'agent_start', agent: 'campaignDirector', name: AGENTS.campaignDirector.name })
  const result = {
    product,
    persona: marketData.persona,
    emotionalDrivers: marketData.emotionalDrivers,
    competitorGap: marketData.competitorGap,
    content: contentData,
    viralScore: growthData.viralScore,
    scoreBreakdown: growthData.scoreBreakdown,
    growthStrategy: growthData.growthStrategy,
    boostTips: growthData.boostTips,
    timing: growthData.timing,
    platforms: platformList,
    usage: {
      marketAnalyst: marketResult.usage,
      contentWriter: contentResult.usage,
      growthOptimizer: growthResult.usage
    }
  }
  send({
    type: 'agent_done',
    agent: 'campaignDirector',
    data: { status: 'packaged', agentCount: 3, platformCount: contentCheck.keys?.length ?? 0 }
  })

  send({ type: 'complete', result })
}

export const CAMPAIGN_API_INFO = {
  name: 'ViralOS Campaign API',
  version: '1.1.0',
  agents: AGENT_ORDER.map((id) => ({ id, name: AGENTS[id].name })),
  endpoints: { 'POST /api/campaign': 'Generate viral campaign via streaming SSE' }
}
