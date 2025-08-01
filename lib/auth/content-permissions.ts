import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserPermissions {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  canEditArticles: boolean;
  canManageContent: boolean;
  canViewReporters: boolean;
}

export interface AuthError {
  error: string;
  code: string;
  details?: string;
}

/**
 * استخراج التوكن من headers وفك تشفيره
 */
export function extractTokenFromHeaders(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    
    // البحث عن Bearer token
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch) {
      return bearerMatch[1];
    }
    
    // إذا لم يوجد Bearer، استخدم القيمة كاملة
    return authHeader;
  } catch (error) {
    console.error('خطأ في استخراج التوكن:', error);
    return null;
  }
}

/**
 * التحقق من صحة JWT وإرجاع بيانات المستخدم
 */
export function verifyJWTToken(token: string): UserPermissions | AuthError {
  try {
    if (!token) {
      return {
        error: 'التوكن مطلوب',
        code: 'TOKEN_REQUIRED'
      };
    }
    
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      return {
        error: 'إعدادات التوكن غير صحيحة',
        code: 'JWT_CONFIG_ERROR'
      };
    }
    
    // فك تشفير التوكن
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.id) {
      return {
        error: 'التوكن غير صالح',
        code: 'INVALID_TOKEN'
      };
    }
    
    // تحديد الصلاحيات حسب الدور
    const permissions = getPermissionsByRole(decoded.role || 'user');
    
    return {
      id: decoded.id,
      email: decoded.email || '',
      role: decoded.role || 'user',
      permissions: permissions,
      canEditArticles: permissions.includes('edit_articles') || permissions.includes('content_management'),
      canManageContent: permissions.includes('content_management') || permissions.includes('admin_access'),
      canViewReporters: permissions.includes('view_reporters') || permissions.includes('content_management')
    };
    
  } catch (error: any) {
    console.error('خطأ في فك تشفير التوكن:', error);
    
    if (error.name === 'TokenExpiredError') {
      return {
        error: 'التوكن منتهي الصلاحية',
        code: 'TOKEN_EXPIRED'
      };
    }
    
    if (error.name === 'JsonWebTokenError') {
      return {
        error: 'التوكن غير صالح',
        code: 'INVALID_TOKEN'
      };
    }
    
    return {
      error: 'خطأ في التحقق من التوكن',
      code: 'TOKEN_VERIFICATION_ERROR',
      details: error.message
    };
  }
}

/**
 * تحديد الصلاحيات حسب دور المستخدم
 */
function getPermissionsByRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    'admin': [
      'admin_access',
      'content_management', 
      'edit_articles',
      'delete_articles',
      'manage_users',
      'view_reporters',
      'manage_reporters',
      'system_settings'
    ],
    'system_admin': [
      'admin_access',
      'content_management', 
      'edit_articles',
      'delete_articles',
      'manage_users',
      'view_reporters',
      'manage_reporters',
      'system_settings'
    ],
    'editor': [
      'content_management',
      'edit_articles',
      'view_reporters',
      'manage_content'
    ],
    'chief_editor': [
      'content_management',
      'edit_articles',
      'delete_articles',
      'view_reporters',
      'manage_reporters',
      'manage_content'
    ],
    'reporter': [
      'edit_articles',
      'view_reporters',
      'manage_own_content'
    ],
    'content_manager': [
      'content_management',
      'edit_articles',
      'view_reporters'
    ],
    'user': [
      'view_content'
    ]
  };
  
  return rolePermissions[role] || rolePermissions['user'];
}

/**
 * التحقق من صلاحية محددة
 */
export function hasPermission(userPermissions: UserPermissions, requiredPermission: string): boolean {
  return userPermissions.permissions.includes(requiredPermission) ||
         userPermissions.permissions.includes('admin_access');
}

/**
 * التحقق من صلاحيات متعددة (يجب توفر جميعها)
 */
export function hasAllPermissions(userPermissions: UserPermissions, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}

/**
 * التحقق من صلاحيات متعددة (يكفي توفر واحدة منها)
 */
export function hasAnyPermission(userPermissions: UserPermissions, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

/**
 * middleware سريع للتحقق من صلاحيات تعديل المحتوى
 */
export function requireContentEditPermission(request: NextRequest): UserPermissions | AuthError {
  const token = extractTokenFromHeaders(request);
  if (!token) {
    return {
      error: 'مطلوب تسجيل الدخول للوصول لهذه الصفحة',
      code: 'AUTH_REQUIRED'
    };
  }
  
  const userPermissions = verifyJWTToken(token);
  if ('error' in userPermissions) {
    return userPermissions;
  }
  
  if (!userPermissions.canEditArticles) {
    return {
      error: 'ليس لديك صلاحية تعديل المحتوى',
      code: 'INSUFFICIENT_PERMISSIONS'
    };
  }
  
  return userPermissions;
}

/**
 * إنشاء رسالة خطأ موحدة للصلاحيات
 */
export function createPermissionErrorResponse(authError: AuthError, statusCode: number = 403) {
  const errorMessages: Record<string, string> = {
    'TOKEN_REQUIRED': 'مطلوب تسجيل الدخول',
    'TOKEN_EXPIRED': 'انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى',
    'INVALID_TOKEN': 'جلسة عمل غير صالحة، يرجى تسجيل الدخول مرة أخرى',
    'INSUFFICIENT_PERMISSIONS': 'ليس لديك صلاحية للوصول لهذه الميزة',
    'JWT_CONFIG_ERROR': 'خطأ في إعدادات النظام'
  };
  
  return {
    success: false,
    error: authError.error,
    message: errorMessages[authError.code] || authError.error,
    code: authError.code,
    statusCode
  };
}