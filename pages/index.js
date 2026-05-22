import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>ViralOS - AI-Native Growth Operating System</title>
        <meta name="description" content="Turn any product into a viral campaign" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1 className={{ marginBottom: '2rem', fontSize: '3rem', fontWeight: 'bold' }}>
          ViralOS
        </h1>
        <p className={{ marginBottom: '3rem', fontSize: '1.25rem', color: '#666' }}>
          AI-Native Growth Operating System — Turn any product into a viral campaign
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/route" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500'
          }}>
            Route API
          </a>

          <a href="/social-media-content" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500'
          }}>
            Social Media Content
          </a>
        </div>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '2rem 0',
        borderTop: '1px solid #eee',
        color: '#666',
        fontSize: '0.875rem'
      }}>
        Copyright © {new Date().getFullYear()} ViralOS. All rights reserved.
      </footer>
    </div>
  )
}