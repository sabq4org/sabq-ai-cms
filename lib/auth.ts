/**
 * دوال مساعدة للمصادقة والتحقق من الصلاحيات
 * Authentication and Authorization Helper Functions
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  avatar?: string | null;
}

/**
 * الحصول على المستخدم الحالي من الجلسة
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role || 'user',
      avatar: session.user.image,
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
