/**
 * CSRF Protection Middleware
 * يستخدم نمط Double Submit Cookie للحماية من هجمات CSRF
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// قائمة بالطرق التي تحتاج حماية CSRF
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// قائمة بالمسارات المستثناة (مثل APIs الخارجية)
const EXCLUDED_PATHS = [
  '/api/auth/login', // تسجيل الدخول يتم قبل وجود CSRF token
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/webhooks', // webhooks من خدمات خارجية
];

/**
 * توليد CSRF token جديد
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * التحقق من CSRF token
 */
export async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  // تخطي الطرق الآمنة
  if (!PROTECTED_METHODS.includes(request.method)) {
    return true;
  }

  // تخطي المسارات المستثناة
  const pathname = new URL(request.url).pathname;
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return true;
  }

  // الحصول على CSRF token من الكوكي
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (!cookieToken) {
    return false;
  }

  // الحصول على CSRF token من الـ header أو body
  const headerToken = request.headers.get('X-CSRF-Token') || 
                     request.headers.get('X-XSRF-Token');

  // للطلبات التي تحتوي على body، حاول الحصول على التوكن من الـ body
  let bodyToken: string | undefined;
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.clone().json();
      bodyToken = body.csrf_token || body.csrfToken;
    } catch {
      // تجاهل الأخطاء في قراءة الـ body
    }
  }

  const requestToken = headerToken || bodyToken;

  // المقارنة الآمنة للتوكنات
  return cookieToken === requestToken && cookieToken.length > 0;
}

/**
 * Middleware للتحقق من CSRF
 */
export async function csrfMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const isValid = await verifyCSRFToken(request);

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_ERROR'
      },
      { status: 403 }
    );
  }

  return handler();
}

/**
 * Helper function لإضافة CSRF token للاستجابة
 */
export function addCSRFTokenToResponse(response: NextResponse): void {
  // تحقق إذا كان هناك token موجود بالفعل
  const existingToken = response.cookies.get('csrf-token');
  if (!existingToken) {
    const newToken = generateCSRFToken();
    response.cookies.set('csrf-token', newToken, {
      httpOnly: false, // يجب أن يكون قابل للقراءة من JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 ساعة
      path: '/'
    });
  }
}
