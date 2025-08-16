import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  is_admin?: boolean;
}

/**
 * استخراج المستخدم من التوكن في الطلب
 */
export async function getUserFromToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. محاولة جلب التوكن من Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. محاولة جلب التوكن من cookies كـ fallback
    if (!token) {
      token = request.cookies.get('auth-token')?.value || request.cookies.get('auth_token')?.value;
    }

    // 3. للتطوير: التحقق من demo user
    const userIdHeader = request.headers.get('user-id');
    if (!token && userIdHeader) {
      console.log('🔧 وضع التطوير: استخدام user-id من header');
      return {
        id: userIdHeader,
        email: 'demo@sabq.ai',
        name: 'مستخدم تجريبي',
        role: 'user'
      };
    }

    if (!token) {
      return null;
    }

    // 4. للتطوير: التحقق من التوكن التجريبي
    if (token === 'dev-session-token') {
      return {
        id: 'dev-user-id',
        email: 'dev@sabq.org',
        name: 'مطور المحتوى',
        role: 'admin',
        is_admin: true
      };
    }

    // 5. فك تشفير التوكن الحقيقي
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret';
    const decoded = jwt.verify(token, jwtSecret) as any;

    return {
      id: decoded.id || decoded.sub || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
      is_admin: decoded.is_admin || decoded.role === 'admin'
    };

  } catch (error) {
    console.error('خطأ في استخراج المستخدم من التوكن:', error);
    return null;
  }
}

/**
 * التحقق من صحة معرف المقال
 */
export function validateArticleId(articleId: string): boolean {
  return typeof articleId === 'string' && articleId.length > 0;
}

/**
 * تنظيف معرف المستخدم للأمان
 */
export function sanitizeUserId(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * إنشاء معرف فريد للتفاعل
 */
export function generateInteractionId(type: string, articleId: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${articleId}_${userId}_${timestamp}_${random}`;
}

/**
 * تحديد نقاط الولاء حسب نوع التفاعل
 */
export function getLoyaltyPoints(interactionType: string): number {
  const pointsMap: Record<string, number> = {
    like: 1,
    save: 2,
    share: 3,
    comment: 5,
    reading_session: 10
  };

  return pointsMap[interactionType] || 0;
}

/**
 * التحقق من صلاحيات المستخدم
 */
export function checkUserPermissions(user: AuthUser | null, requiredRole?: string): boolean {
  if (!user) return false;
  
  if (!requiredRole) return true; // أي مستخدم مسجل
  
  if (requiredRole === 'admin') {
    return user.is_admin === true || user.role === 'admin';
  }
  
  return user.role === requiredRole;
}

/**
 * إنشاء رسالة خطأ موحدة
 */
export function createErrorResponse(message: string, status: number = 400) {
  return {
    error: message,
    timestamp: new Date().toISOString(),
    status
  };
}

/**
 * إنشاء رسالة نجاح موحدة
 */
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };
}
