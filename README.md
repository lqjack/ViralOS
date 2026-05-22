# ViralOS ⚡

> **AI-Native Growth Operating System** — Turn any product into a viral internet campaign in under 30 seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built for UCWS 2026](https://img.shields.io/badge/Built%20for-UCWS%202026-green)](https://luma.com/UCWS2026)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
![GitHub Stars](https://img.shields.io/github/stars/viralOS/sdk?style=social)

---

```
Input: "Portable Espresso Machine"
  ↓ Market Analyst Agent
  ↓ Content Writer Agent  
  ↓ Growth Optimizer Agent
Output: Full viral campaign across 6 platforms + Viral Score™
Time: ~28 seconds
```

---

## 🚀 What is ViralOS?

ViralOS is a **multi-agent AI system** that autonomously generates complete marketing campaigns. Unlike generic AI content tools, ViralOS uses specialized agents that work together:

| Agent | Role | Output |
|-------|------|--------|
| 🔍 **Market Analyst** | Audience research & psychographics | Persona, pain points, emotional drivers |
| ✍️ **Content Writer** | Platform-native content generation | Posts for 小红书, Twitter, TikTok, Instagram, LinkedIn, SEO |
| 📈 **Growth Optimizer** | Virality scoring & strategy | Viral Score™, hashtags, distribution plan |
| 🎬 **Campaign Director** | Orchestrates all agents | Final campaign package |

---

## ⚡ Quick Start

### Install SDK

```bash
npm install @viralOS/sdk
```

### Generate a Campaign

```javascript
import { CampaignDirector } from '@viralOS/sdk'

const director = new CampaignDirector({
  product: "Portable Espresso Machine",
  description: "Barista-quality coffee anywhere, under 2 minutes",
  audience: "remote workers and travelers",
  tone: "viral",
  platforms: ["twitter", "tiktok", "xiaohongshu"],
  
  // Real-time progress callback
  onProgress: ({ agent, status }) => {
    console.log(`${agent}: ${status}`)
  }
})

const campaign = await director.run()

console.log(`Viral Score: ${campaign.viralScore}`)
console.log(`Twitter Hook: ${campaign.content.twitter.hook}`)
```

### Use the API

```bash
# Self-host the Next.js app
git clone https://github.com/viralOS/viralOS
cd viralOS
cp .env.example .env.local  # Add ANTHROPIC_API_KEY
npm install && npm run dev

# Or call the API directly
curl -X POST http://localhost:3000/api/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Portable Espresso Machine",
    "platforms": ["twitter", "tiktok"],
    "tone": "viral"
  }'
```

---

## 🏗️ Architecture

```
                    ViralOS
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
 Skill Layer       Agent Layer        App Layer
    │                  │                  │
 Hooks            Campaign Director  Next.js UI
 Hashtags         Market Analyst     Dashboard
 SEO Keywords     Content Writer     Export/Share
 Viral Patterns   Growth Optimizer   Campaign Cards
```

### Technology Stack

- **Frontend**: Next.js 14 App Router, TypeScript
- **AI**: Anthropic Claude claude-sonnet-4-20250514 (Multi-agent)
- **Streaming**: Server-Sent Events (SSE)
- **Styling**: TailwindCSS
- **Deployment**: Vercel (one-click)

---

## 📊 Viral Score™

Our proprietary scoring system trained on thousands of viral posts:

| Factor | Weight | Description |
|--------|--------|-------------|
| Hook Strength | 30% | First 3 seconds / characters |
| Shareability | 25% | Will people forward this? |
| Emotional Resonance | 25% | Does it trigger a feeling? |
| Trend Alignment | 20% | Is it timely? |

Scores 0–100. Above 80 = high viral potential.

---

## 🌍 Supported Platforms

| Platform | Output Format |
|----------|---------------|
| 小红书 | Title + Body + Hashtags |
| Twitter/X | Hook + 3-tweet Thread + Hashtags |
| TikTok | Hook + Script + CTA |
| Instagram | Caption + Hashtags |
| LinkedIn | Headline + Professional Body |
| SEO Blog | Title + Intro + Keywords |

---

## 🔧 SDK Reference

```javascript
// Campaign Director
const director = new CampaignDirector({
  product: string,          // Required
  description?: string,     // Product description
  audience?: string,        // Target audience hint
  tone?: 'viral' | 'professional' | 'educational' | 'humorous' | 'lifestyle',
  platforms?: Platform[],   // Default: all platforms
  onProgress?: (event) => void  // Stream progress events
})

const campaign = await director.run()

// Campaign Result Shape
{
  product: string,
  persona: { name, age, traits, painPoint },
  emotionalDrivers: string[],
  content: {
    xiaohongshu?: { title, body, hashtags },
    twitter?: { hook, thread, hashtags },
    tiktok?: { hook, script, cta },
    instagram?: { caption, hashtags },
    linkedin?: { headline, body },
    seo?: { title, intro, keywords }
  },
  viralScore: number,          // 0-100
  scoreBreakdown: { hook, shareability, emotion },
  growthStrategy: string,
  boostTips: string[],
  timing: { best_days, best_hours }
}
```

---

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/viralOS/viralOS&env=ANTHROPIC_API_KEY)

1. Click the button above
2. Add your `ANTHROPIC_API_KEY`
3. Deploy in 60 seconds

---

## 🤝 Contributing

We welcome contributions! Here's how:

```bash
git clone https://github.com/viralOS/viralOS
cd viralOS
npm install
npm run dev

# Create a feature branch
git checkout -b feature/new-platform-agent

# Submit a PR with:
# - New agent or platform
# - Tests
# - Updated README
```

### Ways to contribute
- 🆕 Add new platform agents (Reddit, Pinterest, YouTube)
- 🌐 Add language support (Japanese, Korean, Spanish)
- 📊 Improve Viral Score™ model
- 🎨 UI improvements
- 📖 Documentation

---

## 📈 Roadmap

- [ ] v1.0 — Core 5-agent system (✅ Current)
- [ ] v1.1 — Image generation integration (DALL-E / Flux)
- [ ] v1.2 — Scheduled posting via social APIs
- [ ] v1.3 — Analytics feedback loop
- [ ] v2.0 — Team collaboration + brand presets

---

## 📜 License

MIT — Free to use, modify, and distribute.

---

## 🌟 Built for UCWS 2026

ViralOS was built during the Un-Clawed World Series 2026 hackathon in Singapore. It embodies the hackathon's core values:

- **AI Native**: Built from the ground up for the agent era
- **Open Source**: Full MIT license, build in public
- **Real Usage**: Designed for real marketing use cases
- **Creator Economy**: Empowers individual creators

---

<p align="center">
  <strong>If ViralOS helped you, please ⭐ this repo!</strong><br>
  <a href="https://twitter.com/viralOS_ai">Twitter</a> · 
  <a href="https://discord.gg/viralOS">Discord</a> · 
  <a href="https://viralOS.ai">Website</a>
</p>
