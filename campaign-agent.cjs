/**
 * ViralOS Campaign Agent System
 * Multi-agent orchestration for viral content generation
 * 
 * Architecture:
 * CampaignDirector → [MarketAnalyst, ContentWriter, GrowthOptimizer]
 * 
 * Open Source: MIT License
 * GitHub: github.com/viralOS/sdk
 */

const Anthropic = require('@anthropic/sdk');

const client = new Anthropic();

// ─────────────────────────────────────────────
// AGENT DEFINITIONS
// ─────────────────────────────────────────────

const AGENTS = {
  marketAnalyst: {
    name: 'Market Analyst Agent',
    systemPrompt: `You are a world-class market analyst specializing in viral product marketing.
Your job: Analyze a product and identify the exact audience segments most likely to share and buy.
Output ONLY valid JSON with: persona, painPoints, emotionalDrivers, competitorGap.`
  },

  contentWriter: {
    name: 'Content Writer Agent',
    systemPrompt: `You are a viral content writer who has written content for 1M+ view posts across every platform.
Your job: Write platform-native content that feels authentic, not AI-generated.
Each platform has its own voice:
- 小红书: Personal, detailed, emoji-heavy, lifestyle focus
- Twitter/X: Punchy hooks, thread format, data-driven
- TikTok: Script format with hook/conflict/resolution/CTA
- Instagram: Visual storytelling, aspirational
- LinkedIn: Professional narrative, data + insight
- SEO Blog: Long-form, keyword-rich, helpful
Output ONLY valid JSON.`
  },

  growthOptimizer: {
    name: 'Growth Optimizer Agent',
    systemPrompt: `You are a growth hacker who has driven millions in e-commerce revenue.
Your job: Score content for virality and build a distribution strategy.
Viral Score factors: Hook strength (30%), Shareability (25%), Emotional resonance (25%), Trend alignment (20%).
Output ONLY valid JSON with: viralScore, scoreBreakdown, hashtags, growthStrategy, timing.`
  }
};

// ─────────────────────────────────────────────
// CORE AGENT CLASS
// ─────────────────────────────────────────────

class Agent {
  constructor(config) {
    this.name = config.name;
    this.systemPrompt = config.systemPrompt;
  }

  async run(userPrompt) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: this.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content.map(b => b.text || '').join('');
    
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return { raw: text, error: 'Parse failed' };
    }
  }
}

// ─────────────────────────────────────────────
// CAMPAIGN DIRECTOR (ORCHESTRATOR)
// ─────────────────────────────────────────────

class CampaignDirector {
  constructor({ product, description, audience, tone, platforms, onProgress }) {
    this.product = product;
    this.description = description;
    this.audience = audience;
    this.tone = tone;
    this.platforms = platforms || ['xiaohongshu', 'twitter', 'tiktok', 'instagram'];
    this.onProgress = onProgress || (() => {});
    
    this.analysts = {
      market: new Agent(AGENTS.marketAnalyst),
      content: new Agent(AGENTS.contentWriter),
      growth: new Agent(AGENTS.growthOptimizer)
    };
  }

  async run() {
    const results = { product: this.product, timestamp: new Date().toISOString() };

    // Step 1: Market Analysis
    this.onProgress({ step: 0, agent: 'Market Analyst Agent', status: 'running' });
    const marketData = await this.analysts.market.run(
      `Analyze this product for viral marketing potential:
      Product: ${this.product}
      Description: ${this.description}
      Target Audience Hint: ${this.audience}
      
      Return JSON: { "persona": { "name": "...", "age": "...", "traits": [], "painPoint": "..." }, "emotionalDrivers": [], "competitorGap": "..." }`
    );
    results.persona = marketData.persona;
    results.emotionalDrivers = marketData.emotionalDrivers;
    this.onProgress({ step: 0, agent: 'Market Analyst Agent', status: 'done' });

    // Step 2: Content Generation
    this.onProgress({ step: 1, agent: 'Content Writer Agent', status: 'running' });
    const contentData = await this.analysts.content.run(
      `Write viral content for this product on these platforms: ${this.platforms.join(', ')}
      
      Product: ${this.product}
      Description: ${this.description}
      Audience: ${JSON.stringify(marketData.persona || {})}
      Emotional Drivers: ${JSON.stringify(marketData.emotionalDrivers || [])}
      Tone: ${this.tone}
      
      Return JSON: {
        "xiaohongshu": { "title": "...", "body": "...", "hashtags": [] },
        "twitter": { "hook": "...", "thread": [], "hashtags": [] },
        "tiktok": { "hook": "...", "script": "...", "cta": "..." },
        "instagram": { "caption": "...", "hashtags": [] },
        "linkedin": { "headline": "...", "body": "..." },
        "seo": { "title": "...", "intro": "...", "keywords": [] }
      }
      Only include the requested platforms.`
    );
    results.content = contentData;
    this.onProgress({ step: 1, agent: 'Content Writer Agent', status: 'done' });

    // Step 3: Growth Optimization
    this.onProgress({ step: 2, agent: 'Growth Optimizer Agent', status: 'running' });
    const growthData = await this.analysts.growth.run(
      `Score this marketing campaign for virality and build a distribution strategy:
      
      Product: ${this.product}
      Content Sample: ${JSON.stringify(contentData).slice(0, 800)}
      Platforms: ${this.platforms.join(', ')}
      
      Return JSON: {
        "viralScore": 85,
        "scoreBreakdown": { "hook": 88, "shareability": 82, "emotion": 90 },
        "growthStrategy": "...",
        "timing": { "best_days": ["..."], "best_hours": "..." },
        "boostTips": []
      }`
    );
    results.viralScore = growthData.viralScore;
    results.scoreBreakdown = growthData.scoreBreakdown;
    results.growthStrategy = growthData.growthStrategy;
    results.timing = growthData.timing;
    results.boostTips = growthData.boostTips;
    this.onProgress({ step: 2, agent: 'Growth Optimizer Agent', status: 'done' });

    return results;
  }
}

module.exports = { CampaignDirector, Agent, AGENTS };
