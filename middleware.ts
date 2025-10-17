import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// المضيف الموحد - يمكن تغييره حسب التفضيل
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'www.sabq.io';
const PRODUCTION_DOMAINS = ['sabq.io', 'www.sabq.io'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  // تجاهل query parameters عند التحقق من مسارات المصادقة
  const isAdminAuthRoute = pathname === '/admin/login' || pathname.startsWith('/admin/login/') || pathname === '/login' || pathname.startsWith('/login/');
  
  // تخطي في بيئة التطوير مع إضافة قاتل الكاش
  if (process.env.NODE_ENV !== 'production') {
    // حماية مسارات الإدارة في التطوير أيضاً (تحقق وجود توكن فقط)
    if (isAdminRoute && !isAdminAuthRoute) {
      const hasToken = Boolean(
        req.cookies.get('__Host-sabq-access-token')?.value ||
        req.cookies.get('sabq-access-token')?.value ||
        req.cookies.get('sabq_at')?.value ||
        req.cookies.get('access_token')?.value ||
        req.cookies.get('auth-token')?.value
      );
      if (!hasToken) {
        const loginUrl = new URL(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}` , req.url);
        return NextResponse.redirect(loginUrl, 307);
      }
    }
    const response = NextResponse.next();
    
    // قاتل الكاش للصفحات الحساسة حتى في التطوير
    if (url.pathname.startsWith('/news') || 
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/api/news') ||
        url.pathname.startsWith('/api/dashboard')) {
      
      // Headers قوية لمنع الكاش في التطوير
      const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date(0).toUTCString(),
        'ETag': `"no-cache-${Date.now()}"`,
        'X-Cache-Killer': Date.now().toString(),
        'X-Force-No-Cache': 'true',
        'Clear-Site-Data': '"cache", "storage"'
      };
      
      Object.entries(noCacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } else if (url.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    }
    return response;
  }
  // حماية مسارات الإدارة في الإنتاج (تحقق وجود توكن فقط من جهة الحافة)
  if (isAdminRoute && !isAdminAuthRoute) {
    const hasToken = Boolean(
      req.cookies.get('__Host-sabq-access-token')?.value ||
      req.cookies.get('sabq-access-token')?.value ||
      req.cookies.get('sabq_at')?.value ||
      req.cookies.get('access_token')?.value ||
      req.cookies.get('auth-token')?.value
    );
    if (!hasToken) {
      const loginUrl = new URL(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}` , req.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }
  
  // تخطي طلبات API و static files مع إضافة قاتل الكاش للمناسب
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|js|css|woff|woff2|ttf|eot)$/i)
  ) {
    const response = NextResponse.next();
    
    // قاتل الكاش للـ APIs الحساسة في الإنتاج
    if (url.pathname.startsWith('/api/news') || 
        url.pathname.startsWith('/api/dashboard') ||
        url.pathname.startsWith('/api/cache')) {
      
      const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Killer': Date.now().toString(),
        'X-Force-No-Cache': 'true',
        'Surrogate-Control': 'no-store'
      };
      
      Object.entries(noCacheHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } else if (url.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
    }
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
  
  // قاتل الكاش للصفحات الحساسة
  const response = NextResponse.next();
  
  if (url.pathname.startsWith('/news') || 
      url.pathname.startsWith('/dashboard')) {
    
    const noCacheHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, no-transform',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date(0).toUTCString(),
      'ETag': `"no-cache-${Date.now()}"`,
      'Vary': '*',
      'X-Cache-Killer': Date.now().toString(),
      'X-Force-No-Cache': 'true',
      'X-Random-ID': Math.random().toString(36).substr(2, 15),
      'Clear-Site-Data': '"cache", "storage"'
    };
    
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
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