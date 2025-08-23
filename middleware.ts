import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const isAdminRoute = url.pathname.startsWith('/admin');
  
  // Rate limiting for AI and critical APIs
  const criticalPaths = ['/api/ai/', '/api/auth/', '/api/upload/'];
  const isCriticalAPI = criticalPaths.some(path => url.pathname.startsWith(path));
  
  if (isCriticalAPI) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${url.pathname}`;
    const now = Date.now();
    
    // Get or create rate limit data
    let data = rateLimitStore.get(key);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + 60000 }; // 1 minute window
    }
    
    data.count++;
    rateLimitStore.set(key, data);
    
    // Define limits based on path
    let limit = 60; // Default
    if (url.pathname.startsWith('/api/ai/')) limit = 10;
    if (url.pathname.startsWith('/api/auth/')) limit = 5;
    if (url.pathname.startsWith('/api/upload/')) limit = 20;
    
    // Check if limit exceeded
    if (data.count > limit) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد الطلبات المسموح به. حاول مرة أخرى لاحقاً.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', (limit - data.count).toString());
  }
  
  // Content Security Policy - أكثر صرامة للصفحات الإدارية
  const baseCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com https://apis.google.com https://www.google.com https://www.gstatic.com https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.google-analytics.com https://*.googletagmanager.com https://apis.google.com",
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "frame-src 'self' https://www.google.com https://accounts.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ];
  
  // إضافة قيود إضافية للصفحات الإدارية
  if (isAdminRoute) {
    // منع تضمين الصفحة في إطارات خارجية تماماً
    baseCsp[baseCsp.indexOf("frame-ancestors 'self'")] = "frame-ancestors 'none'";
  }
  
  const csp = baseCsp.join('; ');
  
  // تطبيق Security Headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Headers إضافية للصفحات الإدارية
  if (isAdminRoute) {
    // منع التخزين المؤقت للصفحات الإدارية
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Headers أمان إضافية
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  }
  
  // HSTS للإنتاج فقط
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    
    // إضافة header لحل مشاكل SSL
    response.headers.set('X-Forwarded-Proto', 'https');
  }

  return response;
}

// تطبيق الـ middleware على جميع الصفحات ما عدا الملفات الثابتة
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - ملفات ثابتة أخرى
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};