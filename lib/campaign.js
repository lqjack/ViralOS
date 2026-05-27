import Anthropic from '@anthropic-ai/sdk'

const AGENTS = {
  marketAnalyst: {
    name: 'Market Analyst Agent',
    systemPrompt: `You are a world-class market analyst specializing in viral product marketing.
    Analyze the product and identify precise audience segments.
    Output ONLY valid JSON, no markdown, no explanation.`
  },
  contentWriter: {
    name: 'Content Writer Agent',
    systemPrompt: `You are an expert viral content writer for all major platforms.
    Write platform-native content that feels authentic.
    小红书: personal, emoji-heavy, lifestyle. Twitter: punchy, thread-format.
    TikTok: hook/body/CTA script. Instagram: aspirational captions.
    LinkedIn: professional narrative. SEO: keyword-rich.
    Output ONLY valid JSON, no markdown.`
  },
  growthOptimizer: {
    name: 'Growth Optimizer Agent',
    systemPrompt: `You are a growth hacker who has driven millions in revenue.
    Score content virality (Hook 30%, Shareability 25%, Emotion 25%, Trends 20%).
    Build actionable distribution strategies.
    Output ONLY valid JSON, no markdown.`
  }
}

async function runAgent(client, systemPrompt, userPrompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content.map((b) => b.text || '').join('')
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { error: 'Parse failed', raw: text }
  }
}

export async function streamCampaign(
  { product, description, audience, tone, platforms },
  send,
  { createClient = () => new Anthropic() } = {}
) {
  const client = createClient()

  send({ type: 'agent_start', agent: 'marketAnalyst', name: AGENTS.marketAnalyst.name })
  const marketData = await runAgent(
    client,
    AGENTS.marketAnalyst.systemPrompt,
    `Product: ${product}\nDescription: ${description || 'N/A'}\nAudience: ${audience || 'general'}\n\nReturn JSON: {"persona": {"name": "string", "age": "string", "traits": ["..."], "painPoint": "..."}, "emotionalDrivers": ["..."], "competitorGap": "..."}`
  )
  send({ type: 'agent_done', agent: 'marketAnalyst', data: marketData })

  send({ type: 'agent_start', agent: 'contentWriter', name: AGENTS.contentWriter.name })
  const contentData = await runAgent(
    client,
    AGENTS.contentWriter.systemPrompt,
    `Write content for: ${product}\nDescription: ${description || 'N/A'}\nAudience: ${JSON.stringify(marketData.persona || {})}\nTone: ${tone || 'viral'}\nPlatforms: ${(platforms || ['twitter', 'tiktok']).join(', ')}\n\nReturn JSON with keys for each requested platform only.`
  )
  send({ type: 'agent_done', agent: 'contentWriter', data: contentData })

  send({ type: 'agent_start', agent: 'growthOptimizer', name: AGENTS.growthOptimizer.name })
  const growthData = await runAgent(
    client,
    AGENTS.growthOptimizer.systemPrompt,
    `Score this campaign:\nProduct: ${product}\nPlatforms: ${(platforms || []).join(', ')}\nContent preview: ${JSON.stringify(contentData).slice(0, 600)}\n\nReturn JSON: {"viralScore": 85, "scoreBreakdown": {"hook": 88, "shareability": 82, "emotion": 90}, "growthStrategy": "...", "boostTips": ["..."], "timing": {"best_days": ["..."], "best_hours": "..."}}`
  )
  send({ type: 'agent_done', agent: 'growthOptimizer', data: growthData })

  send({
    type: 'complete',
    result: {
      product,
      persona: marketData.persona,
      emotionalDrivers: marketData.emotionalDrivers,
      content: contentData,
      viralScore: growthData.viralScore,
      scoreBreakdown: growthData.scoreBreakdown,
      growthStrategy: growthData.growthStrategy,
      boostTips: growthData.boostTips,
      timing: growthData.timing
    }
  })
}

export const CAMPAIGN_API_INFO = {
  name: 'ViralOS Campaign API',
  version: '1.0.0',
  endpoints: { 'POST /api/campaign': 'Generate viral campaign via streaming SSE' }
}
