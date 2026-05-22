import { NextResponse } from 'next/server'

export async function GET(request) {
  // This is a catch-all route that will be rewritten by vercel.json
  // The actual proxying is handled by the vercel.json rewrites
  return NextResponse.json({ message: 'API endpoint' })
}

export async function POST(request) {
  return NextResponse.json({ message: 'API endpoint' })
}

// Handle other HTTP methods
export const PUT = POST
export const DELETE = POST
export const PATCH = POST