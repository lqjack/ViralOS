import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || ''

  try {
    const response = await fetch(
      `https://practitioners-nurse-continuing-dancing.trycloudflare.com/api/stock/${slug}`,
      {
        headers: request.headers
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock data', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || ''

  try {
    const requestData = await request.json()
    const response = await fetch(
      `https://practitioners-nurse-continuing-dancing.trycloudflare.com/api/stock/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: JSON.stringify(requestData)
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock data', details: error.message },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export const PUT = POST
export const DELETE = POST
export const PATCH = POST