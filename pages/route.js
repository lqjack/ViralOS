import Head from 'next/head'
import { useState } from 'react'

export default function RoutePage() {
  const [output, setOutput] = useState('')

  const handleClick = async () => {
    setOutput('Loading...')
    try {
      const response = await fetch('/api/route')
      const data = await response.json()
      setOutput(JSON.stringify(data, null, 2))
    } catch (error) {
      setOutput('Error: ' + error.message)
    }
  }

  return (
    <div>
      <Head>
        <title>Route API - ViralOS</title>
        <meta name="description" content="Route API endpoint" />
      </Head>

      <main style={{ padding: '5rem 0' }}>
        <h1 className={{ textAlign: 'center', marginBottom: '3rem' }}>
          Route API Endpoint
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
            Test Route API
          </button>

          {output && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2>Response:</h2>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}