import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createAuthErrorResponse } from "@/lib/getAuthenticatedUser";
import { setCORSHeaders, setNoCache, getUnifiedAuthTokens, updateAccessToken } from "@/lib/auth-cookies-unified";
import { UserManagementService } from "@/lib/auth/user-management";
import { serialize } from 'cookie';
import prisma from "@/lib/prisma";
import { ensureDbConnected, isPrismaNotConnectedError, retryWithConnection } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

// تعيين runtime كـ nodejs لـ Prisma
export const runtime = 'nodejs';

// دالة لاستخراج بيانات المستخدم من التوكن كـ fallback
function getUserFromToken(token: string): any | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;
    
    // استخرج معرف المستخدم من مختلف المواضع المحتملة
    const userId = decoded.user_id || decoded.userId || decoded.sub || decoded.id;
    if (!userId) return null;
    
    return {
      id: userId,
      email: decoded.email || decoded.userEmail || 'unknown@sabq.io',
      name: decoded.name || decoded.userName || 'مستخدم سبق',
      role: decoded.role || 'user',
      is_admin: decoded.is_admin || decoded.isAdmin || false,
      // بيانات جزئية من التوكن
      __fromToken: true,
      __partial: true
    };
  } catch (error) {
    console.error('❌ فشل استخراج بيانات المستخدم من التوكن:', error);
    return null;
  }
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS(request: NextRequest) {
  console.log('🌐 معالجة طلب OPTIONS للـ CORS في /auth/me');
  
  const response = new NextResponse(null, { status: 200 });
  setCORSHeaders(response, request.headers.get('origin') || undefined);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [/api/auth/me] بدء التحقق من هوية المستخدم...");
    console.log(`📊 [/api/auth/me] Host: ${request.headers.get('host')}`);
    console.log(`🔗 [/api/auth/me] Origin: ${request.headers.get('origin')}`);

    // محاولة المصادقة بالطريقة العادية أولاً
    const result = await getAuthenticatedUser(request);
    
    // إذا نجحت المصادقة، أرجع النتيجة
    if (result.reason === 'ok' && result.user) {
      console.log(`✅ [/api/auth/me] نجحت المصادقة للمستخدم: ${result.user.email}`);
      
      const user = result.user;
      
      // التحقق من حالة المستخدم
      if (user.status && user.status !== 'active') {
        console.log(`⚠️ [/api/auth/me] حساب المستخدم غير نشط: ${user.status}`);
        
        const response = NextResponse.json({ 
          success: false, 
          error: "حساب المستخدم معطل", 
          code: "ACCOUNT_DISABLED" 
        }, { status: 403 });
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }

      // إنشاء الاستجابة الناجحة
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role || "user",
          avatar: user.avatar,
          is_admin: user.is_admin || false,
          is_verified: user.is_verified || false,
          created_at: user.created_at,
          loyalty_points: user.loyalty_points || 0,
          preferences: user.preferences || {},
          bio: user.bio,
          location: user.location,
          website: user.website,
          social_links: user.social_links || {},
          notification_preferences: user.notification_preferences || {
            email: true,
            push: true,
            marketing: false
          }
        }
      });

      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    // إذا فشلت المصادقة بسبب عدم وجود access token، جرب refresh
    console.log(`❌ [/api/auth/me] فشل المصادقة: ${result.reason}`);
    
    // محاولة استخراج معلومات من التوكن كـ fallback أولاً
    const { accessToken: currentAccessToken } = getUnifiedAuthTokens(request);
    if (currentAccessToken && result.reason === 'user_not_found') {
      // المستخدم غير موجود في DB لكن التوكن صالح
      const tokenUser = getUserFromToken(currentAccessToken);
      if (tokenUser) {
        console.log('⚠️ [/api/auth/me] استخدام بيانات التوكن كـ fallback (DB غير متاح)');
        const response = NextResponse.json({
          success: true,
          user: tokenUser,
          partial: true,
          reason: 'db_fallback'
        });
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }
    }
    
    // Auto-refresh: إذا كان السبب no_token أو token_expired، حاول استخدام refresh token
    if (result.reason === 'no_token' || result.reason === 'token_expired' || result.reason === 'jwt_verification_failed') {
      console.log('🔄 [/api/auth/me] محاولة تجديد التوكن تلقائياً...');
      
      // الحصول على refresh token
      const { refreshToken } = getUnifiedAuthTokens(request);
      
      // أيضاً حاول من legacy cookies
      let finalRefreshToken = refreshToken;
      if (!finalRefreshToken) {
        const legacyTokens = ['sabq_rt', 'refresh_token', 'sabq-refresh-token'];
        for (const cookieName of legacyTokens) {
          const value = request.cookies.get(cookieName)?.value;
          if (value) {
            console.log(`🔄 [/api/auth/me] وُجد refresh token في ${cookieName}`);
            finalRefreshToken = value;
            break;
          }
        }
      }
      
      if (finalRefreshToken) {
        console.log('✅ [/api/auth/me] وُجد refresh token، محاولة التجديد...');
        
        try {
          // تجديد التوكن
          const refreshResult = await UserManagementService.refreshAccessToken(finalRefreshToken);
          
          if (refreshResult.access_token && refreshResult.user) {
            console.log('✅ [/api/auth/me] نجح تجديد التوكن تلقائياً');
            
            // جلب بيانات المستخدم الكاملة مع retry
            let fullUser;
            try {
              fullUser = await retryWithConnection(async () => {
                await ensureDbConnected();
                return await prisma.users.findUnique({
                  where: { id: refreshResult.user.id },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                    avatar: true,
                    is_admin: true,
                    is_verified: true,
                    created_at: true,
                    loyalty_points: true,
                    preferences: true,
                    bio: true,
                    location: true,
                    website: true,
                    social_links: true,
                    notification_preferences: true,
                    status: true
                  }
                });
              });
            } catch (dbError) {
              console.warn('⚠️ [/api/auth/me] فشل جلب بيانات المستخدم من DB، استخدام بيانات التوكن:', dbError);
              // استخدم بيانات من refresh result كـ fallback
              fullUser = refreshResult.user;
            }
            
            if (!fullUser || fullUser.status !== 'active') {
              console.log('❌ [/api/auth/me] المستخدم غير موجود أو غير نشط');
              const response = NextResponse.json({ 
                success: false, 
                error: "حساب المستخدم غير موجود أو معطل", 
                code: "ACCOUNT_INVALID" 
              }, { status: 403 });
              
              setCORSHeaders(response, request.headers.get('origin') || undefined);
              setNoCache(response);
              return response;
            }
            
            // إنشاء الاستجابة مع تحديث access token
            const response = NextResponse.json({
              success: true,
              refreshed: true, // علامة أن التوكن تم تجديده
              user: {
                id: fullUser.id,
                email: fullUser.email,
                name: fullUser.name,
                username: fullUser.username,
                role: fullUser.role || "user",
                avatar: fullUser.avatar,
                is_admin: fullUser.is_admin || false,
                is_verified: fullUser.is_verified || false,
                created_at: fullUser.created_at,
                loyalty_points: fullUser.loyalty_points || 0,
                preferences: fullUser.preferences || {},
                bio: fullUser.bio,
                location: fullUser.location,
                website: fullUser.website,
                social_links: fullUser.social_links || {},
                notification_preferences: fullUser.notification_preferences || {
                  email: true,
                  push: true,
                  marketing: false
                }
              }
            });
            
            // تحديث access token في الكوكيز
            const host = request.headers.get('host') || '';
            const isProduction = process.env.NODE_ENV === 'production';
            const useHostPrefix = isProduction && host.includes('sabq.io');
            
            // تعيين access token جديد على المضيف الحالي
            const accessTokenName = useHostPrefix ? '__Host-sabq-access-token' : 'sabq-access-token';
            response.headers.append(
              'Set-Cookie',
              serialize(accessTokenName, refreshResult.access_token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60 // 24 ساعة
                // لا نضع Domain مع __Host-
              })
            );
            
            // أيضاً حدث legacy cookies للتوافقية
            response.headers.append(
              'Set-Cookie',
              serialize('sabq_at', refreshResult.access_token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                path: '/',
                domain: isProduction ? '.sabq.io' : undefined,
                maxAge: 24 * 60 * 60
              })
            );
            
            console.log(`✅ [/api/auth/me] تم تعيين ${accessTokenName} على ${host}`);
            
            setCORSHeaders(response, request.headers.get('origin') || undefined);
            setNoCache(response);
            return response;
          }
        } catch (refreshError: any) {
          console.error('❌ [/api/auth/me] فشل تجديد التوكن:', refreshError.message);
        }
      }
    }
    
    // إذا فشل كل شيء، أرجع خطأ المصادقة
    const errorResponse = createAuthErrorResponse(result, process.env.NODE_ENV === 'development');
    const response = NextResponse.json(errorResponse.body, { status: errorResponse.status });
    
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    return response;

  } catch (error: any) {
    console.error('❌ [/api/auth/me] خطأ عام:', error);
    
    // في حالة أخطاء قاعدة البيانات، حاول استخدام التوكن كـ fallback
    const { accessToken: fallbackToken } = getUnifiedAuthTokens(request);
    if (fallbackToken && (error.message?.includes('Prisma') || error.message?.includes('database'))) {
      const tokenUser = getUserFromToken(fallbackToken);
      if (tokenUser) {
        console.log('⚠️ [/api/auth/me] استخدام fallback للتوكن بسبب خطأ قاعدة البيانات');
        const response = NextResponse.json({
          success: true,
          user: tokenUser,
          partial: true,
          reason: 'db_error_fallback'
        });
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }
    }
    
    const response = NextResponse.json({ 
      success: false, 
      error: "خطأ داخلي في الخادم", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
    
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    return response;
  }
}