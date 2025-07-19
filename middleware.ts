import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // تسجيل المسارات فقط للصفحات، وليس للملفات الثابتة
  const pathname = request.nextUrl.pathname;
  
  // تسجيل الطلبات للصفحات فقط
  if (!pathname.includes('.') && !pathname.startsWith('/_next')) {
    console.log(`Middleware processing: ${pathname}`);
  }
  
  return NextResponse.next();
}

// تكوين أبسط وأكثر وضوحاً
export const config = {
  matcher: [
    // تطابق الصفحات فقط، استثناء جميع الملفات الثابتة
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/api/:path*',
  ],
}; 