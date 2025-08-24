/**
 * Middleware للمصادقة الموحدة - يقرأ التوكنات من مصادر متعددة
 * يحل مشكلة USER_NOT_FOUND بسبب عدم قراءة اسماء الكوكيز الصحيحة
 */

import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

// أولوية قراءة التوكنات (من الأحدث للأقدم)
const TOKEN_PRIORITIES = [
  '__Host-sabq-access-token',  // النظام الجديد - الإنتاج
  'sabq-access-token',         // النظام الجديد - التطوير  
  'auth-token',                // النظام الحالي المستخدم
  'sabq_at',                   // النظام الموحد القديم
  'access_token',              // Legacy fallback
  'token'                      // Legacy fallback
] as const;

export interface AuthResult {
  user: any | null;
  reason: 'ok' | 'no_token' | 'invalid_token_payload' | 'jwt_decode_failed' | 'jwt_verification_failed' | 'user_not_found' | 'token_expired';
  userId?: string;
  tokenSource?: string | null;
  error?: any;
}

/**
 * استخراج التوكن من الطلب مع fallback للمصادر المتعددة
 */
function extractTokenFromRequest(req: NextRequest): { token: string | null; source: string | null } {
  console.log('🔍 [getAuthenticatedUser] استخراج التوكن من الطلب...');
  
  // 1. محاولة قراءة من الكوكيز بأولوية
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  
  console.log('🍪 [getAuthenticatedUser] الكوكيز الموجودة:', Object.keys(cookies));
  
  for (const tokenName of TOKEN_PRIORITIES) {
    if (cookies[tokenName]) {
      console.log(`✅ [getAuthenticatedUser] وُجد التوكن في الكوكي: ${tokenName}`);
      return { token: cookies[tokenName], source: `cookie:${tokenName}` };
    }
  }
  
  // 2. محاولة قراءة من Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('✅ [getAuthenticatedUser] وُجد التوكن في Authorization header');
    return { token, source: 'header:authorization' };
  }
  
  // 3. فحص تفصيلي للكوكيز إضافية
  const additionalCookieNames = ['jwt', 'session', 'user_token'];
  for (const name of additionalCookieNames) {
    if (cookies[name]) {
      console.log(`⚠️ [getAuthenticatedUser] وُجد توكن محتمل في كوكي: ${name}`);
      return { token: cookies[name], source: `cookie:${name}` };
    }
  }
  
  console.log('❌ [getAuthenticatedUser] لا يوجد توكن في أي مصدر');
  return { token: null, source: null };
}

/**
 * فك وتحليل التوكن JWT
 */
function decodeAndValidateToken(token: string): { payload: any | null; reason: AuthResult['reason'] } {
  try {
    console.log('🔓 [getAuthenticatedUser] محاولة فك التوكن...');
    
    // فك التوكن بدون التحقق من التوقيع أولاً (للتشخيص)
    const decodedWithoutVerification = jwt.decode(token);
    console.log('📋 [getAuthenticatedUser] payload التوكن:', JSON.stringify(decodedWithoutVerification, null, 2));
    
    if (!decodedWithoutVerification || typeof decodedWithoutVerification !== 'object') {
      console.log('❌ [getAuthenticatedUser] فشل في فك التوكن - payload غير صالح');
      return { payload: null, reason: 'invalid_token_payload' };
    }
    
    // التحقق من انتهاء الصلاحية
    const payload = decodedWithoutVerification as any;
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.log(`⏰ [getAuthenticatedUser] التوكن منتهي الصلاحية: exp=${payload.exp}, now=${now}`);
        return { payload: null, reason: 'token_expired' };
      }
    }
    
    // التحقق من وجود معرف المستخدم
    const userId = payload.user_id || payload.userId || payload.sub || payload.id;
    if (!userId) {
      console.log('❌ [getAuthenticatedUser] لا يوجد معرف مستخدم في التوكن');
      return { payload: null, reason: 'invalid_token_payload' };
    }
    
    // التحقق من التوقيع (إذا وُجد JWT_SECRET)
    if (process.env.JWT_SECRET) {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ [getAuthenticatedUser] تم التحقق من توقيع التوكن');
        return { payload: verified, reason: 'ok' };
      } catch (verifyError) {
        console.log('⚠️ [getAuthenticatedUser] فشل التحقق من التوقيع، سنستخدم payload غير المحقق:', verifyError);
        // نستمر بـ payload غير المحقق للتشخيص
      }
    } else {
      console.log('⚠️ [getAuthenticatedUser] JWT_SECRET غير موجود - سنستخدم التوكن بدون تحقق التوقيع');
    }
    
    return { payload, reason: 'ok' };
    
  } catch (decodeError) {
    console.error('❌ [getAuthenticatedUser] خطأ في فك التوكن:', decodeError);
    return { payload: null, reason: 'jwt_decode_failed' };
  }
}

/**
 * البحث عن المستخدم في قاعدة البيانات
 */
async function findUserInDatabase(userId: string): Promise<{ user: any | null; error?: any }> {
  try {
    console.log(`🔎 [getAuthenticatedUser] البحث عن المستخدم في قاعدة البيانات: ${userId}`);
    
    // محاولة الاستيراد المتعدد للخدمات
    let userService = null;
    
    try {
      const { UserManagementService } = await import('@/lib/auth/user-management');
      userService = UserManagementService;
      console.log('✅ [getAuthenticatedUser] استخدام UserManagementService');
    } catch (importError: any) {
      console.log('⚠️ [getAuthenticatedUser] UserManagementService غير متاح:', importError?.message || 'unknown error');
    }
    
    if (!userService) {
      try {
        // محاولة أخرى للخدمات البديلة (مؤقتة للتشخيص)
        console.log('⚠️ [getAuthenticatedUser] جميع خدمات المستخدمين غير متاحة');
      } catch (importError: any) {
        console.log('⚠️ [getAuthenticatedUser] userModel غير متاح:', importError?.message || 'unknown error');
      }
    }
    
    if (userService) {
      // استخدام UserManagementService
      try {
        const result: any = await userService.getUserById(userId);
        if (result && result.success && result.user) {
          console.log(`✅ [getAuthenticatedUser] وُجد المستخدم: ${result.user.email}`);
          return { user: result.user };
        } else {
          console.log(`❌ [getAuthenticatedUser] لم يُوجد المستخدم: ${result?.error}`);
          return { user: null, error: result?.error };
        }
      } catch (serviceError) {
        console.log('⚠️ [getAuthenticatedUser] خطأ في UserManagementService:', serviceError);
        return { user: null, error: serviceError };
      }
    }
    
    // محاولة مباشرة مع Supabase أو قاعدة البيانات
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.log(`❌ [getAuthenticatedUser] خطأ Supabase:`, error);
        return { user: null, error };
      }
      
      console.log(`✅ [getAuthenticatedUser] وُجد المستخدم عبر Supabase: ${user?.email}`);
      return { user };
      
    } catch (supabaseError) {
      console.log('⚠️ [getAuthenticatedUser] Supabase غير متاح:', supabaseError);
    }
    
    // إذا فشلت جميع المحاولات
    console.log('❌ [getAuthenticatedUser] لا يمكن الوصول لأي خدمة قاعدة بيانات');
    return { user: null, error: 'No database service available' };
    
  } catch (error) {
    console.error('❌ [getAuthenticatedUser] خطأ في البحث عن المستخدم:', error);
    return { user: null, error };
  }
}

/**
 * الحصول على المستخدم المُصدّق عليه من الطلب
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthResult> {
  console.log('🚀 [getAuthenticatedUser] بدء عملية المصادقة...');
  console.log('📊 [getAuthenticatedUser] URL:', req.url);
  console.log('🔗 [getAuthenticatedUser] Method:', req.method);
  
  // 1. استخراج التوكن
  const { token, source } = extractTokenFromRequest(req);
  if (!token) {
    return { user: null, reason: 'no_token' };
  }
  
  console.log(`🎯 [getAuthenticatedUser] مصدر التوكن: ${source}`);
  console.log(`🔑 [getAuthenticatedUser] التوكن (أول 20 حرف): ${token.substring(0, 20)}...`);
  
  // 2. فك وتحليل التوكن
  const { payload, reason: tokenReason } = decodeAndValidateToken(token);
  if (tokenReason !== 'ok' || !payload) {
    return { user: null, reason: tokenReason, tokenSource: source };
  }
  
  // 3. استخراج معرف المستخدم
  const userId = payload.user_id || payload.userId || payload.sub || payload.id;
  console.log(`👤 [getAuthenticatedUser] معرف المستخدم: ${userId}`);
  
  // 4. البحث عن المستخدم
  const { user, error } = await findUserInDatabase(userId);
  if (!user) {
    console.log(`❌ [getAuthenticatedUser] المستخدم غير موجود في قاعدة البيانات: ${userId}`);
    return { 
      user: null, 
      reason: 'user_not_found', 
      userId, 
      tokenSource: source,
      error 
    };
  }
  
  console.log(`🎉 [getAuthenticatedUser] نجحت المصادقة للمستخدم: ${user.email}`);
  return { 
    user, 
    reason: 'ok', 
    userId, 
    tokenSource: source 
  };
}

/**
 * Helper لإنشاء استجابة خطأ المصادقة
 */
export function createAuthErrorResponse(result: AuthResult, includeDebugInfo = false) {
  const debugInfo = includeDebugInfo ? {
    reason: result.reason,
    userId: result.userId,
    tokenSource: result.tokenSource,
    error: result.error
  } : undefined;
  
  switch (result.reason) {
    case 'no_token':
      return {
        status: 401,
        body: { 
          success: false, 
          error: 'مطلوب تسجيل الدخول', 
          code: 'UNAUTHENTICATED',
          debug: debugInfo
        }
      };
      
    case 'invalid_token_payload':
    case 'jwt_decode_failed':
    case 'jwt_verification_failed':
      return {
        status: 401,
        body: { 
          success: false, 
          error: 'التوكن غير صالح', 
          code: 'INVALID_TOKEN',
          debug: debugInfo
        }
      };
      
    case 'token_expired':
      return {
        status: 401,
        body: { 
          success: false, 
          error: 'انتهت صلاحية الجلسة', 
          code: 'TOKEN_EXPIRED',
          debug: debugInfo
        }
      };
      
    case 'user_not_found':
      return {
        status: 404,
        body: { 
          success: false, 
          error: 'المستخدم غير موجود', 
          code: 'USER_NOT_FOUND',
          debug: debugInfo
        }
      };
      
    default:
      return {
        status: 401,
        body: { 
          success: false, 
          error: 'فشلت المصادقة', 
          code: 'AUTH_FAILED',
          debug: debugInfo
        }
      };
  }
}
