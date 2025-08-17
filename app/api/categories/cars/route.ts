import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to main categories
  return NextResponse.redirect(new URL('/categories', process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io'));
}