import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      isConfigured: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET'
    },
    timestamp: new Date().toISOString()
  });
} 