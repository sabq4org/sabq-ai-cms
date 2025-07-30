import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect to homepage or return empty response
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://www.sabq.io'))
}