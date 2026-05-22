import Head from 'next/head'
import { useState } from 'react'

export default function SocialMediaContentPage() {
  const [content, setContent] = useState('')

  const handleClick = async () => {
    setContent('Generating...')
    try {
      const response = await fetch('/api/social-media-content')
      const data = await response.json()
      setContent(JSON.stringify(data, null, 2))
    } catch (error) {
      setContent('Error: ' + error.message)
    }
  }

  return (
    <div>
      <Head>
        <title>Social Media Content - ViralOS</title>
        <meta name="description" content="Generate social media content" />
      </Head>

      <main style={{ padding: '5rem 0' }}>
        <h1 className={{ textAlign: 'center', marginBottom: '3rem' }}>
          Social Media Content Generator
        </h1>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          <button onClick={handleClick} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Generate Content
          </button>

          {content && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2>Generated Content:</h2>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {content}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}