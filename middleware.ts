import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// المضيف الموحد - يمكن تغييره حسب التفضيل
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'www.sabq.io';
const PRODUCTION_DOMAINS = ['sabq.io', 'www.sabq.io'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  
  // تخطي في بيئة التطوير
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }
  
  // تخطي طلبات API و static files
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|js|css|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
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
  
  return NextResponse.next();
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