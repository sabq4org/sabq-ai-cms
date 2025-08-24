import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// استخراج التوكنز من النظام الموحد
function getUnifiedTokensFromRequest(request: NextRequest): { accessToken: string | null; refreshToken: string | null } {
  // ترتيب الأولوية للكوكيز
  const cookieOptions = [
    '__Host-sabq-access-token',  // أولوية عالية - الكوكيز الآمن
    'sabq_at',                   // النظام الحالي
    'access_token',              // الاحتياطي
    'auth-token'                 // القديم
  ];

  const refreshCookieOptions = [
    '__Host-sabq-refresh-token', // أولوية عالية - الكوكيز الآمن
    'sabq_rt',                   // النظام الحالي
    'refresh_token'              // الاحتياطي
  ];

  // محاولة الحصول على access token
  let accessToken = null;
  for (const cookieName of cookieOptions) {
    const token = request.cookies.get(cookieName)?.value;
    if (token) {
      accessToken = token;
      break;
    }
  }

  // محاولة الحصول على refresh token
  let refreshToken = null;
  for (const cookieName of refreshCookieOptions) {
    const token = request.cookies.get(cookieName)?.value;
    if (token) {
      refreshToken = token;
      break;
    }
  }

  return { accessToken, refreshToken };
}

// التحقق من صحة التوكن مع دعم عدة مفاتيح
function verifyTokenWithFallback(token: string): any {
  const secrets = [
    process.env.JWT_SECRET,
    process.env.JWT_ACCESS_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.JWT_REFRESH_SECRET
  ].filter(Boolean);

  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret!);
    } catch {
      continue;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isAPIRoute = url.pathname.startsWith('/api');
  
  // التحقق من المصادقة للطرق المحمية
  const protectedPaths = [
    '/admin/',
    '/profile/',
    '/settings/',
    '/dashboard/'
  ];
  
  const isProtectedPath = protectedPaths.some(path => url.pathname.startsWith(path));
  
  if (isProtectedPath && !isAPIRoute) {
    const { accessToken, refreshToken } = getUnifiedTokensFromRequest(request);
    
    // إذا لم يوجد أي توكن، وجه لصفحة تسجيل الدخول
    if (!accessToken && !refreshToken) {
      console.log('🔒 مسار محمي بدون توكن:', url.pathname);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', url.pathname); // حفظ الصفحة المطلوبة للعودة إليها
      return NextResponse.redirect(loginUrl);
    }
    
    // التحقق من صحة access token إذا وُجد
    if (accessToken) {
      const decoded = verifyTokenWithFallback(accessToken);
      if (!decoded) {
        console.log('❌ توكن الوصول غير صالح:', url.pathname);
        // سنحاول refresh token إذا وُجد
        if (!refreshToken || !verifyTokenWithFallback(refreshToken)) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('next', url.pathname);
          return NextResponse.redirect(loginUrl);
        }
      } else {
        // التحقق من انتهاء الصلاحية
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          console.log('⏰ انتهت صلاحية توكن الوصول:', url.pathname);
          // سنحاول refresh token
          if (!refreshToken || !verifyTokenWithFallback(refreshToken)) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('next', url.pathname);
            return NextResponse.redirect(loginUrl);
          }
        }
      }
    }
    
    // التحقق من صلاحيات المسئول للمسارات الإدارية
    if (isAdminRoute && accessToken) {
      const decoded = verifyTokenWithFallback(accessToken);
      if (decoded && !decoded.is_admin && decoded.role !== 'admin' && decoded.role !== 'super_admin' && decoded.role !== 'system_admin') {
        console.log('🚫 محاولة وصول غير مخولة للوحة الإدارية:', decoded.email || decoded.id);
        // إرجاع للصفحة الرئيسية مع رسالة خطأ
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(homeUrl);
      }
    }
  }
  
  // Enhanced Rate limiting for critical APIs
  const criticalPaths = [
    '/api/ai/', 
    '/api/auth/', 
    '/api/upload/',
    '/api/upload-image/',
    '/api/upload-production/',
    '/api/deep-analyses/',
    '/api/news/ai-generate/',
    '/api/admin/articles/generate-ai-content/',
    '/api/generate-podcast/',
    '/api/audio/generate/'
  ];
  const isCriticalAPI = criticalPaths.some(path => url.pathname.startsWith(path));
  
  if (isCriticalAPI) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const key = `${ip}:${url.pathname}:${userAgent.slice(0, 50)}`; // Include user agent for better tracking
    const now = Date.now();
    
    // Get or create rate limit data
    let data = rateLimitStore.get(key);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + 60000 }; // 1 minute window
    }
    
    data.count++;
    rateLimitStore.set(key, data);
    
    // Define stricter limits based on path and resource intensity
    let limit = 30; // Default reduced from 60
    let windowMinutes = 1;
    
    // AI-related endpoints (most resource intensive)
    if (url.pathname.startsWith('/api/ai/') || 
        url.pathname.startsWith('/api/deep-analyses/') ||
        url.pathname.startsWith('/api/news/ai-generate/') ||
        url.pathname.startsWith('/api/admin/articles/generate-ai-content/') ||
        url.pathname.startsWith('/api/generate-podcast/') ||
        url.pathname.startsWith('/api/audio/generate/')) {
      limit = 5; // Very strict for AI
      windowMinutes = 1;
    }
    
    // Authentication endpoints - زيادة حدود المصادقة لدعم النظام الموحد
    else if (url.pathname.startsWith('/api/auth/')) {
      limit = 20; // Increased for unified system
      windowMinutes = 1;
    }
    
    // Upload endpoints (resource intensive)
    else if (url.pathname.startsWith('/api/upload')) {
      limit = 15; // Reduced from 20
      windowMinutes = 1;
    }
    
    // Check if limit exceeded
    if (data.count > limit) {
      // Log potential abuse
      console.warn(`🚨 Rate limit exceeded: ${ip} on ${url.pathname} (${data.count}/${limit})`);
      
      return NextResponse.json(
        { 
          error: 'تم تجاوز عدد الطلبات المسموح به. حاول مرة أخرى لاحقاً.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: windowMinutes * 60
        },
        { 
          status: 429,
          headers: {
            'Retry-After': (windowMinutes * 60).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(data.resetTime).toISOString(),
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', (limit - data.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString());
    
    // Clean up old entries periodically (every 100 requests)
    if (Math.random() < 0.01) {
      const cutoff = now - 300000; // 5 minutes ago
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < cutoff) {
          rateLimitStore.delete(key);
        }
      }
    }
  }
  
  // Content Security Policy - متكيفة حسب البيئة (أقل صرامة محلياً لتجنّب أخطاء SSL)
  const isProd = process.env.NODE_ENV === 'production';
  const baseCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com https://apis.google.com https://www.google.com https://www.gstatic.com https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    // في التطوير: السماح بالـ http: و ws: لتعمل الموارد وHMR بدون ترقية قسرية
    isProd
      ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.google-analytics.com https://*.googletagmanager.com https://apis.google.com"
      : "connect-src 'self' http: ws: wss: https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.google-analytics.com https://*.googletagmanager.com https://apis.google.com",
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "frame-src 'self' https://www.google.com https://accounts.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    // هذه التوجيهات فقط للإنتاج كي لا تُرقي http→https محلياً
    ...(isProd ? [
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ] : [])
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