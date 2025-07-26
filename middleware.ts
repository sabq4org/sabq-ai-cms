import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // تحسين الأداء للصفحات الثابتة
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
  
  // تحسين الأداء للصور
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=86400');
    return response;
  }
  
  // معالجة CORS لطلبات API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // معالجة OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept, Cookie',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    
    // إضافة CORS headers للطلبات العادية
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Cookie')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // تحسين الأداء لـ API
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response
  }
  
  // تحسين headers للصفحات
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // ضغط المحتوى
  if (!response.headers.get('Content-Encoding')) {
    response.headers.set('Accept-Encoding', 'gzip, deflate, br');
  }
  
  return response;
}

// تحديد المسارات التي يعمل عليها middleware
export const config = {
  matcher: [
    '/api/:path*', // جميع طلبات API
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 