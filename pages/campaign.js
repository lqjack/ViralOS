import Head from 'next/head'
import { useState } from 'react'

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
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || ''

        for (const chunk of chunks) {
          const line = chunk.trim()
          if (!line.startsWith('data:')) continue

          const payload = JSON.parse(line.slice(5).trim())
          setEvents((prev) => [...prev, payload])

          if (payload.type === 'complete') {
            setResult(payload.result)
          }
          if (payload.type === 'error') {
            throw new Error(payload.message)
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          Three AI agents stream progress in real time. Requires <code>ANTHROPIC_API_KEY</code>.
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

        {events.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Agent Progress</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {events.map((event, index) => (
                <div
                  key={`${event.type}-${event.agent || index}`}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #eee'
                  }}
                >
                  <strong>{event.type}</strong>
                  {event.name ? ` — ${event.name}` : ''}
                  {event.agent ? ` (${event.agent})` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Campaign Result {result.viralScore != null ? `(Viral Score: ${result.viralScore})` : ''}
            </h2>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
