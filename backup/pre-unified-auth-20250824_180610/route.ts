import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { 
  getUnifiedAuthTokens, 
  setCORSHeaders, 
  setNoCache 
} from "@/lib/auth-cookies-unified";

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS(request: NextRequest) {
  console.log('🌐 معالجة طلب OPTIONS للـ CORS في /auth/me');
  
  const response = new NextResponse(null, { status: 200 });
  setCORSHeaders(response, request.headers.get('origin') || undefined);
  return response;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 بدء التحقق من هوية المستخدم...");

    // الحصول على التوكن من الكوكيز الموحدة أو Authorization header
    const { accessToken, userSession } = getUnifiedAuthTokens(request);
    let token = accessToken;

    console.log('🔑 التوكن المستخرج:', token ? `...${token.slice(-4)}` : 'غير موجود');

    if (!token) {
      // محاولة من Authorization header كـ fallback
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log('🔑 تم العثور على التوكن في Header');
      }
    }

    if (!token) {
      console.log('❌ لا يوجد توكن - إرجاع 401');
      
      const response = NextResponse.json({
        success: false,
        error: "No authentication token found",
        code: "NO_TOKEN",
        debug: process.env.NODE_ENV === 'development' ? {
          cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
          headers: {
            authorization: !!request.headers.get("authorization"),
            cookieHeader: !!request.headers.get("cookie"),
            host: request.headers.get("host"),
            referer: request.headers.get("referer"),
          }
        } : undefined
      }, { status: 401 });
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    // التحقق من صحة التوكن (جرب عدة مفاتيح)
    let decoded: any;
    const keys = [
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_SECRET,
      JWT_SECRET,
    ].filter(Boolean) as string[];
    
    for (const key of keys) {
      try {
        decoded = jwt.verify(token, key);
        console.log('✅ تم التحقق من التوكن بنجاح');
        break;
      } catch (err) {
        console.log(`⚠️ فشل التحقق بالمفتاح: ${key.slice(0, 10)}...`);
      }
    }
    
    if (!decoded) {
      console.log('❌ فشل التحقق من جميع مفاتيح JWT');
      
      const response = NextResponse.json({ 
        success: false, 
        error: "جلسة غير صالحة", 
        code: "INVALID_TOKEN" 
      }, { status: 401 });
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    // استخراج معرف المستخدم من payload (يدعم sub أو id)
    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
    if (!userId || typeof userId !== "string") {
      console.log('❌ معرف المستخدم غير صالح في التوكن');
      
      const response = NextResponse.json({ 
        success: false, 
        error: "جلسة غير صالحة", 
        code: "INVALID_USER_ID" 
      }, { status: 401 });
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    // البحث عن المستخدم في قاعدة البيانات
    let user: any = null;
    try {
      user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_verified: true,
          created_at: true,
          updated_at: true,
          avatar: true,
          is_admin: true,
          status: true,
          loyalty_points: true,
        },
      });
      
      console.log('🔍 نتيجة البحث عن المستخدم:', user ? 'موجود' : 'غير موجود');
    } catch (dbErr) {
      console.warn('⚠️ خطأ في قاعدة البيانات، استخدام بيانات الكوكيز...');
      
      // في حال فشل قاعدة البيانات، استخدم fallback من userSession
      if (userSession && userSession.id === userId) {
        user = {
          id: userSession.id,
          email: userSession.email || '',
          name: userSession.name || 'مستخدم',
          role: userSession.role || 'user',
          is_verified: !!userSession.is_verified,
          created_at: null,
          updated_at: null,
          avatar: userSession.avatar || null,
          is_admin: !!userSession.isAdmin,
          status: 'active',
          loyalty_points: 0,
        };
      }
    }

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      
      const response = NextResponse.json({ 
        success: false, 
        error: "المستخدم غير موجود", 
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    // التحقق من حالة المستخدم
    if (user.status && user.status !== 'active') {
      console.log('⚠️ حساب المستخدم غير نشط:', user.status);
      
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

    console.log('✅ تم العثور على المستخدم:', user.email, 'Admin:', isAdmin);

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
      },
    });
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    
    return response;
    
  } catch (error: any) {
    console.error("❌ خطأ في جلب بيانات المستخدم:", error);
    
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
