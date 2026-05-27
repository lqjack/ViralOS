export function isParseError(data) {
  return Boolean(data && typeof data === 'object' && data.error === 'Parse failed')
}

export function validateMarketData(data) {
  if (isParseError(data)) return { ok: false, reason: 'market_analyst_parse_failed' }
  if (!data?.persona || typeof data.persona !== 'object') {
    return { ok: false, reason: 'missing_persona' }
  }
  return { ok: true }
}

export function validateContentData(data, platforms = []) {
  if (isParseError(data)) return { ok: false, reason: 'content_writer_parse_failed' }
  const keys = Object.keys(data || {}).filter((k) => k !== 'error' && k !== 'raw')
  if (keys.length === 0) return { ok: false, reason: 'empty_content' }
  if (platforms.length > 0) {
    const hit = platforms.some((p) => keys.includes(p))
    if (!hit) return { ok: false, reason: 'no_platform_content', keys }
  }
  return { ok: true, keys }
}

export function validateGrowthData(data) {
  if (isParseError(data)) return { ok: false, reason: 'growth_optimizer_parse_failed' }
  if (typeof data?.viralScore !== 'number') {
    return { ok: false, reason: 'missing_viral_score' }
  }
  return { ok: true }
}

export function validateCompleteResult(result) {
  if (!result?.product) return { ok: false, reason: 'missing_product' }
  const market = validateMarketData({ persona: result.persona, emotionalDrivers: result.emotionalDrivers })
  if (!market.ok) return market
  const content = validateContentData(result.content)
  if (!content.ok) return content
  const growth = validateGrowthData({
    viralScore: result.viralScore,
    scoreBreakdown: result.scoreBreakdown
  })
  if (!growth.ok) return growth
  return { ok: true }
}
