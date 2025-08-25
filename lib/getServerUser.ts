import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAuthenticatedUser } from './getAuthenticatedUser';

export interface ServerUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_admin?: boolean;
  avatar?: string;
  partial?: boolean;
}

/**
 * جلب المستخدم من جهة الخادم باستخدام الكوكيز مباشرة
 * للاستخدام في Server Components وSSR
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    
    // البحث عن التوكن في الكوكيز المختلفة
    const tokenCookieNames = [
      '__Host-sabq-access-token',
      'sabq-access-token',
      'sabq_at',
      'access_token'
    ];
    
    let accessToken: string | null = null;
    for (const cookieName of tokenCookieNames) {
      const cookie = cookieStore.get(cookieName);
      if (cookie?.value) {
        accessToken = cookie.value;
        break;
      }
    }
    
    if (!accessToken) {
      console.log('🔍 [getServerUser] لا يوجد access token في الكوكيز');
      return null;
    }
    
    // محاولة فك التوكن للحصول على معلومات أساسية
    let tokenPayload: any = null;
    try {
      tokenPayload = jwt.decode(accessToken) as any;
      if (!tokenPayload) {
        console.log('⚠️ [getServerUser] فشل في فك التوكن');
        return null;
      }
    } catch (error) {
      console.log('❌ [getServerUser] خطأ في فك التوكن:', error);
      return null;
    }
    
    // إنشاء كائن Request مؤقت للاستفادة من getAuthenticatedUser
    const mockRequest = {
      headers: new Headers(),
      cookies: cookieStore,
      url: '/server-side'
    } as any;
    
    // إضافة Authorization header
    mockRequest.headers.set('Authorization', `Bearer ${accessToken}`);
    
    try {
      // محاولة الحصول على المستخدم الكامل من قاعدة البيانات
      const result = await getAuthenticatedUser(mockRequest);
      
      if (result.reason === 'ok' && result.user) {
        console.log('✅ [getServerUser] تم جلب المستخدم من قاعدة البيانات:', result.user.email);
        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role || 'user',
          is_admin: result.user.is_admin || false,
          avatar: result.user.avatar
        };
      }
    } catch (dbError) {
      console.warn('⚠️ [getServerUser] فشل جلب من قاعدة البيانات، استخدام fallback:', dbError);
    }
    
    // Fallback: استخدام بيانات التوكن
    console.log('🔄 [getServerUser] استخدام fallback من التوكن');
    const userId = tokenPayload.user_id || tokenPayload.userId || tokenPayload.sub || tokenPayload.id;
    
    if (!userId) {
      console.log('❌ [getServerUser] لا يوجد user ID في التوكن');
      return null;
    }
    
    return {
      id: userId,
      email: tokenPayload.email || tokenPayload.userEmail || 'unknown@sabq.io',
      name: tokenPayload.name || tokenPayload.userName || 'مستخدم سبق',
      role: tokenPayload.role || 'user',
      is_admin: tokenPayload.is_admin || tokenPayload.isAdmin || false,
      avatar: tokenPayload.avatar,
      partial: true // علامة أن هذا fallback
    };
    
  } catch (error) {
    console.error('❌ [getServerUser] خطأ عام:', error);
    return null;
  }
}
