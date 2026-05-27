import Head from 'next/head'
import { useMemo, useState } from 'react'
import { buildAgentSteps } from '../lib/campaign-ui-state.js'
import { parseSseBuffer } from '../lib/sse-parse.js'

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  fontWeight: '500',
  cursor: 'pointer'
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '0.375rem',
  fontSize: '1rem'
}

const statusColors = {
  pending: { bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' },
  running: { bg: '#eff6ff', border: '#93c5fd', dot: '#2563eb' },
  done: { bg: '#f0fdf4', border: '#86efac', dot: '#16a34a' },
  error: { bg: '#fef2f2', border: '#fca5a5', dot: '#dc2626' }
}

function AgentStepper({ steps }) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {steps.map((step) => {
        const colors = statusColors[step.status] || statusColors.pending
        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem'
            }}
          >
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: colors.dot,
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{step.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', textTransform: 'capitalize' }}>
                {step.status}
                {step.validation && !step.validation.ok ? ` — ${step.validation.reason}` : ''}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CampaignResult({ result }) {
  if (!result) return null
  const platforms = Object.keys(result.content || {})

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {result.viralScore != null && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: '#111',
          color: '#fff',
          borderRadius: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 700
        }}>
          Viral Score™ {result.viralScore}
        </div>
      )}

      {result.persona && (
        <section>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Persona</h3>
          <p><strong>{result.persona.name}</strong> · {result.persona.age}</p>
          <p style={{ color: '#555' }}>{result.persona.painPoint}</p>
        </section>
      )}

      {platforms.length > 0 && (
        <section>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Platform content</h3>
          {platforms.map((platform) => (
            <details key={platform} style={{ marginBottom: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{platform}</summary>
              <pre style={{
                marginTop: '0.5rem',
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '0.375rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem'
              }}>
                {JSON.stringify(result.content[platform], null, 2)}
              </pre>
            </details>
          ))}
        </section>
      )}

      {result.growthStrategy && (
        <section>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Growth strategy</h3>
          <p style={{ lineHeight: 1.6 }}>{result.growthStrategy}</p>
          {Array.isArray(result.boostTips) && result.boostTips.length > 0 && (
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              {result.boostTips.map((tip) => (
                <li key={tip} style={{ marginBottom: '0.25rem' }}>{tip}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <details>
        <summary style={{ cursor: 'pointer', color: '#666' }}>Raw JSON</summary>
        <pre style={{
          marginTop: '0.5rem',
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '0.375rem',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          fontSize: '0.75rem'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default function CampaignPage() {
  const [product, setProduct] = useState('Portable Espresso Machine')
  const [description, setDescription] = useState('Barista-quality coffee anywhere, under 2 minutes')
  const [audience, setAudience] = useState('remote workers and travelers')
  const [tone, setTone] = useState('viral')
  const [platforms, setPlatforms] = useState('twitter,tiktok,xiaohongshu')
  const [events, setEvents] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const agentSteps = useMemo(() => buildAgentSteps(events), [events])

  const handleGenerate = async () => {
    setLoading(true)
    setEvents([])
    setResult(null)
    setError('')

    try {
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          description,
          audience,
          tone,
          platforms: platforms.split(',').map((p) => p.trim()).filter(Boolean)
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.hint || `Request failed (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parsed = parseSseBuffer(buffer)
        buffer = parsed.remainder

        if (parsed.events.length > 0) {
          setEvents((prev) => [...prev, ...parsed.events])
          for (const payload of parsed.events) {
            if (payload.type === 'complete') setResult(payload.result)
            if (payload.type === 'error') throw new Error(payload.message)
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `viralos-campaign-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Head>
        <title>Generate Campaign - ViralOS</title>
        <meta name="description" content="Generate a viral marketing campaign with AI agents" />
      </Head>

      <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <a href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to home</a>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Generate Campaign
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Four agents (3 LLM + Campaign Director) stream progress in real time. Requires{' '}
          <code>ANTHROPIC_API_KEY</code>.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Product</div>
            <input
              style={inputStyle}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Product name"
            />
          </label>

          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Description</div>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does it do?"
            />
          </label>

          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Audience</div>
            <input
              style={inputStyle}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Target audience"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Tone</div>
              <select
                style={inputStyle}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="viral">viral</option>
                <option value="professional">professional</option>
                <option value="educational">educational</option>
                <option value="humorous">humorous</option>
                <option value="lifestyle">lifestyle</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Platforms</div>
              <input
                style={inputStyle}
                value={platforms}
                onChange={(e) => setPlatforms(e.target.value)}
                placeholder="twitter,tiktok,xiaohongshu"
              />
            </label>
          </div>
        </div>

        <button
          style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
          onClick={handleGenerate}
          disabled={loading || !product.trim()}
        >
          {loading ? 'Generating...' : 'Generate Campaign'}
        </button>

        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            borderRadius: '0.5rem'
          }}>
            {error}
          </div>
        )}

        {(loading || events.length > 0) && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Agent pipeline
            </h2>
            <AgentStepper steps={agentSteps} />
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                Campaign package
              </h2>
              <button
                type="button"
                onClick={downloadJson}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#fff',
                  color: '#111',
                  border: '1px solid #ddd'
                }}
              >
                Export JSON
              </button>
            </div>
            <CampaignResult result={result} />
          </div>
        )}
      </main>
    </div>
  )
}
