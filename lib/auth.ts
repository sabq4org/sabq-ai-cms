/**
 * دوال مساعدة للمصادقة والتحقق من الصلاحيات
 * Authentication and Authorization Helper Functions
 */

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/getAuthenticatedUser';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  avatar?: string | null;
}

/**
 * الحصول على المستخدم الحالي من الجلسة
 * يتطلب NextRequest للتحقق من التوكن
 */
export async function getCurrentUser(request?: NextRequest): Promise<CurrentUser | null> {
  try {
    // إذا لم يتم تمرير request، نحاول الحصول عليه من السياق
    if (!request) {
      // في بيئة Next.js 15 App Router، يمكن استخدام headers()
      const { headers } = await import('next/headers');
      const headersList = await headers();
      
      // إنشاء request وهمي من الهيدرات
      const url = headersList.get('x-forwarded-proto') 
        ? `${headersList.get('x-forwarded-proto')}://${headersList.get('host')}`
        : 'http://localhost:3000';
      
      request = new NextRequest(url, {
        headers: headersList as any
      });
    }

    const result = await getAuthenticatedUser(request);
    
    if (result.reason !== 'ok' || !result.user) {
      return null;
    }

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role || 'user',
      avatar: result.user.avatar,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * التحقق من صلاحية إنشاء إعلان
 */
export function canCreateAnnouncement(user: CurrentUser): boolean {
  return ['admin', 'system_admin', 'editor'].includes(user.role);
}

/**
 * التحقق من صلاحية عرض إعلان
 */
export function canViewAnnouncement(
  user: CurrentUser,
  announcement: { 
    audienceRoles: string[]; 
    audienceUsers: string[] 
  }
): boolean {
  // Admins يرون كل شيء
  if (user.role === 'admin') return true;

  // إعلانات عامة (بدون جمهور محدد)
  if (
    announcement.audienceRoles.length === 0 &&
    announcement.audienceUsers.length === 0
  ) {
    return true;
  }

  // موجه للدور
  if (announcement.audienceRoles.includes(user.role)) {
    return true;
  }

  // موجه للمستخدم مباشرة
  if (announcement.audienceUsers.includes(user.id)) {
    return true;
  }

  return false;
}

/**
 * التحقق من صلاحية تعديل إعلان
 */
export function canEditAnnouncement(
  user: CurrentUser,
  announcement: { authorId: string }
): boolean {
  // Admins يعدلون كل شيء
  if (user.role === 'admin') return true;

  // System admins and editors يعدلون ما كتبوه
  if (
    ['system_admin', 'editor'].includes(user.role) &&
    announcement.authorId === user.id
  ) {
    return true;
  }

  return false;
}

/**
 * التحقق من صلاحية حذف إعلان
 */
export function canDeleteAnnouncement(
  user: CurrentUser,
  announcement: { authorId: string }
): boolean {
  // فقط admins وصاحب الإعلان (system_admin)
  if (user.role === 'admin') return true;
  
  if (user.role === 'system_admin' && announcement.authorId === user.id) {
    return true;
  }

  return false;
}
