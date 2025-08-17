// Middleware للمصادقة والتحقق من الصلاحيات - نظام سبق الذكية
import { NextRequest } from 'next/server';
import { UserManagementService, User } from './user-management';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Middleware للتحقق من المصادقة
 */
export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    // الحصول على access token من headers أو cookies
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      accessToken = request.cookies.get('access_token')?.value;
    }

    if (!accessToken) {
      return {
        success: false,
        error: 'رمز الوصول مطلوب'
      };
    }

    // التحقق من صحة الرمز
    const user = await UserManagementService.verifyAccessToken(accessToken);

    if (!user) {
      return {
        success: false,
        error: 'رمز الوصول غير صحيح أو منتهي الصلاحية'
      };
    }

    return {
      success: true,
      user: user
    };

  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      error: 'خطأ في التحقق من المصادقة'
    };
  }
}

/**
 * Middleware للتحقق من الصلاحيات الإدارية
 */
export async function adminMiddleware(request: NextRequest): Promise<AuthResult> {
  const authResult = await authMiddleware(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!authResult.user?.is_admin) {
    return {
      success: false,
      error: 'صلاحيات إدارية مطلوبة'
    };
  }

  return authResult;
}

/**
 * Middleware للتحقق من الأدوار المحددة
 */
export async function roleMiddleware(
  request: NextRequest, 
  allowedRoles: string[]
): Promise<AuthResult> {
  const authResult = await authMiddleware(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user?.role || '')) {
    return {
      success: false,
      error: 'لا تملك الصلاحية للوصول إلى هذا المورد'
    };
  }

  return authResult;
}

/**
 * Middleware للتحقق من التحقق من البريد الإلكتروني
 */
export async function verifiedMiddleware(request: NextRequest): Promise<AuthResult> {
  const authResult = await authMiddleware(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!authResult.user?.is_verified) {
    return {
      success: false,
      error: 'يجب التحقق من البريد الإلكتروني أولاً'
    };
  }

  return authResult;
}

/**
 * دالة مساعدة لاستخراج معلومات المستخدم من طلب HTTP
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authResult = await authMiddleware(request);
  return authResult.success ? authResult.user || null : null;
}

/**
 * دالة للتحقق من ملكية المورد
 */
export async function ownershipMiddleware(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthResult> {
  const authResult = await authMiddleware(request);

  if (!authResult.success) {
    return authResult;
  }

  // المشرفون يمكنهم الوصول إلى أي مورد
  if (authResult.user?.is_admin) {
    return authResult;
  }

  // التحقق من ملكية المورد
  if (authResult.user?.id !== resourceUserId) {
    return {
      success: false,
      error: 'لا تملك الصلاحية للوصول إلى هذا المورد'
    };
  }

  return authResult;
}

/**
 * دالة لتطبيق Rate Limiting بسيط
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  identifier: string,
  maxRequests: number = 10,
  windowMinutes: number = 15
): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const current = requestCounts.get(identifier);
  
  if (!current || now > current.resetTime) {
    // نافذة جديدة
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false; // تم تجاوز الحد المسموح
  }
  
  current.count++;
  return true;
}

/**
 * دالة للتحقق من IP المحظورة (بسيط)
 */
const blockedIPs = new Set<string>();

export function ipBlockMiddleware(ipAddress: string): boolean {
  return !blockedIPs.has(ipAddress);
}

/**
 * دالة لحظر IP
 */
export function blockIP(ipAddress: string): void {
  blockedIPs.add(ipAddress);
}

/**
 * دالة لإلغاء حظر IP
 */
export function unblockIP(ipAddress: string): void {
  blockedIPs.delete(ipAddress);
}

export default {
  authMiddleware,
  adminMiddleware,
  roleMiddleware,
  verifiedMiddleware,
  ownershipMiddleware,
  getCurrentUser,
  rateLimitMiddleware,
  ipBlockMiddleware,
  blockIP,
  unblockIP
};
