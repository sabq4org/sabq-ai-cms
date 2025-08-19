import { NextRequest, NextResponse } from 'next/server';

// دالة مساعدة لإضافة CORS headers
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Cookie, user-id, x-user-id, User-Id, X-User-Id, x-device-id, X-Device-Id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  return response;
}

// Origins المسموحة (قابلة للتوسع)
function getAllowedOrigins(): string[] {
  const envOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.APP_URL,
    process.env.WEB_URL,
  ].filter(Boolean) as string[];
  const baseOrigins = [
    'https://www.sabq.io',
    'https://sabq.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  // Vercel
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  if (vercelUrl) baseOrigins.push(vercelUrl);
  return [...new Set([...baseOrigins, ...envOrigins])];
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    // اسمح بأي vercel.app فرعي
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {}
  return false;
}

function setCorsForOrigin(response: NextResponse, origin: string | null): NextResponse {
  const allowed = isOriginAllowed(origin);
  const value = allowed ? (origin as string) : (getAllowedOrigins()[0] || '*');
  response.headers.set('Access-Control-Allow-Origin', value);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Cookie, user-id, x-user-id, User-Id, X-User-Id, x-device-id, X-Device-Id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  return response;
}

// دالة لإنشاء response مع CORS headers
export function corsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

// دالة لمعالجة طلبات OPTIONS
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept, Cookie, user-id, x-user-id, User-Id, X-User-Id, x-device-id, X-Device-Id',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}

// إصدارات تعتمد على الطلب لضبط Origin بدقة
export function corsResponseFromRequest(request: NextRequest, data: any, status: number = 200): NextResponse {
  const origin = request.headers.get('origin');
  const response = NextResponse.json(data, { status });
  return setCorsForOrigin(response, origin);
}

export function handleOptionsForRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return setCorsForOrigin(response, origin);
}