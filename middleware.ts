import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// المضيف الموحد - يمكن تغييره حسب التفضيل
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'www.sabq.io';
const PRODUCTION_DOMAINS = ['sabq.io', 'www.sabq.io'];

// Advanced cache configurations
const CACHE_POLICIES = {
  static: 'public, max-age=31536000, immutable',
  html: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
  api: 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
  images: 'public, max-age=2592000, s-maxage=2592000',
  fonts: 'public, max-age=31536000, immutable',
  json: 'public, max-age=600, s-maxage=1800'
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const userAgent = req.headers.get('user-agent') || '';
  const startTime = Date.now();
  
  // تخطي في بيئة التطوير
  if (process.env.NODE_ENV !== 'production') {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', CACHE_POLICIES.html);
    response.headers.set('X-Environment', 'development');
    return response;
  }
  
  // Handle static assets with optimal caching
  const staticExtensions = /\.(ico|png|jpg|jpeg|svg|gif|webp|avif|js|css|woff|woff2|ttf|eot|pdf|txt|xml|json)$/i;
  if (url.pathname.match(staticExtensions)) {
    const response = NextResponse.next();
    
    // Different cache policies for different asset types
    if (url.pathname.match(/\.(js|css)$/)) {
      response.headers.set('Cache-Control', CACHE_POLICIES.static);
      // إصلاح MIME type للـ CSS
      if (url.pathname.endsWith('.css')) {
        response.headers.set('Content-Type', 'text/css');
      }
    } else if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
      response.headers.set('Cache-Control', CACHE_POLICIES.fonts);
    } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif)$/)) {
      response.headers.set('Cache-Control', CACHE_POLICIES.images);
    } else if (url.pathname.match(/\.(json|xml)$/)) {
      response.headers.set('Cache-Control', CACHE_POLICIES.json);
    }
    
    // Add performance headers - تم إزالة X-Content-Type-Options للـ CSS
    if (!url.pathname.endsWith('.css')) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  }
  
  // Handle API routes with optimized caching
  if (url.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', CACHE_POLICIES.api);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Robots-Tag', 'noindex');
    
    // Add timing information
    const processingTime = Date.now() - startTime;
    response.headers.set('Server-Timing', `middleware;dur=${processingTime}`);
    
    return response;
  }
  
  // اكتشاف أجهزة الموبايل وإظهار النسخة الخفيفة لصفحة الأخبار مع الحفاظ على الرابط
  // يتم استخدام rewrite وليس redirect حتى يبقى المسار /news ظاهرًا للمستخدم
  const isMobileUA = (ua: string) => {
    const pattern = /(iphone|ipod|ipad|android(?!.*tablet)|windows phone|blackberry|bb10|mobile|opera mini|opera mobi)/i;
    return pattern.test(ua);
  };

  if (url.pathname === '/news' && isMobileUA(userAgent)) {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = '/news/light';
    return NextResponse.rewrite(rewriteUrl);
  }

  // Skip Next.js internal routes
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/')
  ) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', CACHE_POLICIES.static);
    return response;
  }
  
  // إجبار التوجيه إلى المضيف الموحد
  if (hostname === 'sabq.io' && CANONICAL_HOST === 'www.sabq.io') {
    console.log(`🔄 Redirecting from ${hostname} to ${CANONICAL_HOST}`);
    url.host = CANONICAL_HOST;
    url.hostname = CANONICAL_HOST;
    
    // استخدام 308 Permanent Redirect للحفاظ على الـ method
    return NextResponse.redirect(url, 308);
  }
  
  // أو العكس - إذا أردت sabq.io بدون www
  if (hostname === 'www.sabq.io' && CANONICAL_HOST === 'sabq.io') {
    console.log(`🔄 Redirecting from ${hostname} to ${CANONICAL_HOST}`);
    url.host = CANONICAL_HOST;
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }
  
  // توجيه الدومينات الأخرى إذا لزم الأمر
  const otherDomains = ['sabq.me', 'www.sabq.me', 'sabq.org', 'www.sabq.org', 'sabq.ai', 'www.sabq.ai'];
  if (otherDomains.some(domain => hostname.includes(domain))) {
    console.log(`🔄 Redirecting from ${hostname} to ${CANONICAL_HOST}`);
    url.host = CANONICAL_HOST;
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }
  
  // Handle main content with optimized headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add performance headers for HTML pages
  response.headers.set('Cache-Control', CACHE_POLICIES.html);
  
  // Add timing information
  const processingTime = Date.now() - startTime;
  response.headers.set('Server-Timing', `middleware;dur=${processingTime}`);
  
  // Add resource hints for critical resources (removed non-existent font preload)
  response.headers.set('Link', 
    '</api/articles/recent>; rel=prefetch'
  );
  
  return response;
}

export const config = {
  // تطبيق middleware على جميع المسارات ما عدا المستثناة
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot)$).*)',
  ],
};