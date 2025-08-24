/**
 * نموذج handler للخادم مع logging مفصل
 * استخدم هذا كمرجع لتحسين /api/auth/refresh endpoint
 */

// مثال Express/Next.js handler
export default async function refreshHandler(req: any, res: any) {
  console.log('🔄 [SERVER] طلب تجديد التوكن وارد...');
  
  try {
    // 1. تسجيل تفاصيل الطلب
    console.log('📋 [SERVER] تفاصيل الطلب:');
    console.log('  - Method:', req.method);
    console.log('  - URL:', req.url);
    console.log('  - User-Agent:', req.headers['user-agent']?.substring(0, 50) + '...');
    console.log('  - Origin:', req.headers.origin);
    console.log('  - Referer:', req.headers.referer);
    
    // 2. فحص Headers المهمة
    console.log('🔍 [SERVER] Headers المهمة:');
    const importantHeaders = [
      'content-type',
      'x-requested-with', 
      'x-csrf-token',
      'cookie',
      'authorization'
    ];
    
    importantHeaders.forEach(header => {
      const value = req.headers[header];
      if (value) {
        if (header === 'cookie') {
          console.log(`  - ${header}: ${value.length} characters`);
        } else {
          console.log(`  - ${header}: ${value}`);
        }
      } else {
        console.log(`  - ${header}: ❌ مفقود`);
      }
    });
    
    // 3. فحص الكوكيز المحددة
    console.log('🍪 [SERVER] الكوكيز المستلمة:');
    const cookiesToCheck = [
      'sabq_rft', 
      '__Host-sabq-refresh', 
      '__Host-sabq-access-token',
      'sabq-csrf-token',
      // إضافة أي أسماء أخرى تستخدمها
    ];
    
    cookiesToCheck.forEach(name => {
      const value = req.cookies?.[name];
      if (value) {
        console.log(`  ✅ ${name}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`  ❌ ${name}: مفقود`);
      }
    });
    
    // 4. التحقق من الطلب الأساسي
    if (req.method !== 'POST') {
      console.log('❌ [SERVER] Method غير مدعوم:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'method_not_allowed',
        message: 'Only POST allowed' 
      });
    }
    
    // 5. التحقق من CSRF إذا مطلوب
    const csrfFromHeader = req.headers['x-csrf-token'];
    const csrfFromCookie = req.cookies?.['sabq-csrf-token'];
    
    console.log('🔐 [SERVER] CSRF Token Check:');
    console.log(`  - من Header: ${csrfFromHeader ? 'موجود' : 'مفقود'}`);
    console.log(`  - من Cookie: ${csrfFromCookie ? 'موجود' : 'مفقود'}`);
    
    // قم بتفعيل هذا إذا كان CSRF مطلوب
    /*
    if (!csrfFromHeader || csrfFromHeader !== csrfFromCookie) {
      console.log('❌ [SERVER] CSRF Token مفقود أو غير مطابق');
      return res.status(400).json({ 
        success: false, 
        error: 'csrf_invalid',
        message: 'CSRF token required or invalid' 
      });
    }
    */
    
    // 6. البحث عن refresh token
    const refreshToken = req.cookies?.['sabq_rft'] || 
                        req.cookies?.['__Host-sabq-refresh'] ||
                        req.headers?.['x-refresh-token']; // fallback
    
    if (!refreshToken) {
      console.log('❌ [SERVER] Refresh token مفقود من جميع المصادر');
      return res.status(400).json({ 
        success: false, 
        error: 'refresh_token_missing',
        message: 'Refresh token not found in cookies or headers' 
      });
    }
    
    console.log('✅ [SERVER] Refresh token موجود:', refreshToken.substring(0, 20) + '...');
    
    // 7. التحقق من صحة refresh token (مثال)
    let decoded;
    try {
      // استبدل هذا بآلية التحقق الخاصة بك
      decoded = verifyRefreshToken(refreshToken);
      console.log('✅ [SERVER] Refresh token صالح للمستخدم:', decoded.userId);
    } catch (tokenError) {
      console.log('❌ [SERVER] Refresh token غير صالح:', tokenError.message);
      return res.status(401).json({ 
        success: false, 
        error: 'refresh_token_invalid',
        message: 'Refresh token expired or invalid' 
      });
    }
    
    // 8. إنشاء access token جديد
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId); // اختياري
    
    console.log('✅ [SERVER] تم إنشاء توكن جديد للمستخدم:', decoded.userId);
    
    // 9. ضبط الكوكيز الجديدة (تأكد من السمات الصحيحة)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only في production
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 دقيقة للـ access token
    };
    
    // ⚠️ تجنب Domain مع __Host- prefix
    const accessTokenCookieName = '__Host-sabq-access-token';
    const refreshTokenCookieName = 'sabq_rft'; // أو __Host-sabq-refresh بدون domain
    
    // تعيين الكوكيز
    res.setHeader('Set-Cookie', [
      `${accessTokenCookieName}=${newAccessToken}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${15 * 60}`,
      `${refreshTokenCookieName}=${newRefreshToken}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}` // 7 أيام
    ]);
    
    console.log('✅ [SERVER] تم ضبط الكوكيز الجديدة');
    
    // 10. إرجاع الاستجابة
    return res.status(200).json({ 
      success: true, 
      accessToken: newAccessToken, // للـ frontend إذا احتاج
      message: 'Token refreshed successfully',
      userVersion: Date.now() // للـ cache invalidation
    });
    
  } catch (error) {
    console.error('❌ [SERVER] خطأ غير متوقع في التجديد:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'internal_error',
      message: 'Internal server error' 
    });
  }
}

// وظائف مساعدة (استبدلها بالتطبيق الخاص بك)
function verifyRefreshToken(token: string) {
  // مثال: استخدام jsonwebtoken
  // return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  throw new Error('تحتاج تطبيق آلية التحقق');
}

function generateAccessToken(userId: string) {
  // مثال: إنشاء JWT
  // return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  return 'new-access-token-' + userId + '-' + Date.now();
}

function generateRefreshToken(userId: string) {
  // مثال: إنشاء JWT
  // return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return 'new-refresh-token-' + userId + '-' + Date.now();
}

/**
 * دليل استكشاف الأخطاء للخادم
 */
export const SERVER_DEBUGGING_GUIDE = {
  common_400_causes: [
    'CSRF token مفقود أو غير مطابق',
    'Refresh token مفقود من cookies',
    'Content-Type header غير صحيح',
    'Credentials غير مرسل من العميل'
  ],
  
  common_401_causes: [
    'Refresh token منتهي الصلاحية',
    'Refresh token غير صحيح أو معطوب',
    'مفتاح التوقيع تغير',
    'المستخدم محذوف أو محظور'
  ],
  
  cookie_issues: [
    '__Host- prefix مع Domain attribute (محظور)',
    'Secure attribute مفقود في HTTPS',
    'SameSite attribute غير صحيح',
    'Path attribute غير مطابق'
  ],
  
  debugging_steps: [
    '1. فعل console.log في handler بدء الطلب',
    '2. اطبع req.cookies و req.headers',
    '3. تحقق من Set-Cookie في الاستجابة',
    '4. استخدم curl لاختبار بدون متصفح',
    '5. فحص Network tab للتأكد من إرسال الكوكيز'
  ]
};
