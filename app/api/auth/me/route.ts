import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createAuthErrorResponse } from "@/lib/getAuthenticatedUser";
import { setCORSHeaders, setNoCache } from "@/lib/auth-cookies-unified";

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
    console.log(`📊 [/api/auth/me] URL: ${request.url}`);
    console.log(`🔗 [/api/auth/me] Method: ${request.method}`);

    // استخدام النظام الجديد للمصادقة
    const result = await getAuthenticatedUser(request);
    
    if (result.reason !== 'ok' || !result.user) {
      console.log(`❌ [/api/auth/me] فشل المصادقة: ${result.reason}`);
      
      const errorResponse = createAuthErrorResponse(result, process.env.NODE_ENV === 'development');
      const response = NextResponse.json(errorResponse.body, { status: errorResponse.status });
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    const user = result.user;
    console.log(`✅ [/api/auth/me] نجحت المصادقة للمستخدم: ${user.email}`);

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

    const isAdmin =
      user.is_admin === true ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin";

    console.log(`📊 [/api/auth/me] معلومات المستخدم: ${user.email}, Admin: ${isAdmin}, المصدر: ${result.tokenSource}`);

    // إرجاع استجابة متوافقة مع النظام
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        is_admin: isAdmin,
        isAdmin: isAdmin, // للتوافق مع الواجهة القديمة
        is_verified: user.is_verified || false,
        isVerified: user.is_verified || false, // للتوافق
        avatar: user.avatar,
        created_at: user.created_at,
        updated_at: user.updated_at,
        status: user.status || "active",
        loyaltyPoints: user.loyalty_points || 0,
        interests: [],
        
        // معلومات إضافية للتشخيص
        debug: process.env.NODE_ENV === 'development' ? {
          tokenSource: result.tokenSource,
          userId: result.userId
        } : undefined
      },
    });
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    
    return response;
    
  } catch (error: any) {
    console.error("❌ [/api/auth/me] خطأ في جلب بيانات المستخدم:", error);
    
    const response = NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب بيانات المستخدم",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
    
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    return response;
  }
}
