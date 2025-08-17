import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for subscriptions
  return NextResponse.json({ 
    subscriptions: [],
    message: 'Subscriptions feature coming soon'
  });
}