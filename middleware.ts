import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// قائمة المسارات المحمية
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/api/dashboard',
  '/api/admin',
  '/api/users',
  '/api/roles',
  '/api/team-members',
  '/api/permissions',
  '/api/templates',
  '/api/smart-blocks',
  '/api/deep-analyses',
  '/api/analytics',
  '/api/ai/settings',
  '/api/messages'
];

// قائمة المسارات المحمية للمدراء فقط
const adminOnlyPaths = [
  '/dashboard/users',
  '/dashboard/roles',
  '/dashboard/team',
  '/dashboard/console',
  '/dashboard/system',
  '/dashboard/analytics',
  '/api/users',
  '/api/roles',
  '/api/team-members',
  '/api/permissions',
  '/api/analytics/activity-logs'
];

// قائمة المسارات العامة (لا تحتاج تسجيل دخول)
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/contact',
  '/news',
  '/categories',
  '/article',
  '/author',
  '/search',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/articles',
  '/api/categories',
  '/api/templates/active-header',
  '/api/smart-blocks',
  '/api/deep-insights',
  '/api/content/personalized',
  '/api/interactions/track',
  '/api/interactions/track-activity'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // التحقق من ملفات الأصول الثابتة
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/_next')
  ) {
    return NextResponse.next();
  }

  // التحقق من المسارات العامة
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // التحقق من المسارات المحمية
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // التحقق من المسارات الخاصة بالمدراء
  const isAdminOnlyPath = adminOnlyPaths.some(path => 
    pathname.startsWith(path)
  );

  // إذا كان المسار عام، السماح بالوصول
  if (isPublicPath && !isProtectedPath) {
    return NextResponse.next();
  }

  // الحصول على معلومات المستخدم من الكوكيز
  const userCookie = request.cookies.get('user');
  const tokenCookie = request.cookies.get('auth-token');
  
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (e) {
      // كوكيز غير صالحة
    }
  }

  // التحقق من تسجيل الدخول للمسارات المحمية
  if (isProtectedPath) {
    // إذا لم يكن المستخدم مسجل دخول
    if (!user && !tokenCookie) {
      // حفظ الصفحة المطلوبة للعودة إليها بعد تسجيل الدخول
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // التحقق من صلاحيات المدير للمسارات الخاصة
    if (isAdminOnlyPath && user) {
      const isAdmin = user.is_admin === true || 
                     user.role === 'admin' || 
                     user.role === 'super_admin';
      
      if (!isAdmin) {
        // توجيه إلى صفحة عدم الصلاحية
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // إضافة headers للأمان
  const response = NextResponse.next();
  
  // حماية ضد Clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // حماية ضد XSS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // إضافة CSP للحماية مع السماح بمصادر Next.js
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob: http://localhost:*; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' http://localhost:* ws://localhost:* https://api.openai.com https://images.unsplash.com; " +
    "frame-src https://platform.twitter.com; " +
    "media-src 'self' blob: data:;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 