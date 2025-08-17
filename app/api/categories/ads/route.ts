import { NextResponse } from 'next/server';

export async function GET() {
  // Empty response for ads (handled by ad provider)
  return NextResponse.json({ ads: [] });
}