/**
 * أدوات التشخيص المتقدمة لنظام المصادقة
 * Advanced Authentication Diagnostics Tools
 * 
 * نظام شامل لتشخيص مشاكل 400 Bad Request و 401 Unauthorized
 */

interface CookieAnalysis {
  exists: boolean;
  value?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expires?: Date;
}

interface RefreshDiagnosticResult {
  success: boolean;
  status: number;
  statusText: string;
  error?: string;
  cookiesBefore: Record<string, CookieAnalysis>;
  cookiesAfter: Record<string, CookieAnalysis>;
  csrfToken?: string;
  responseBody?: any;
  headers: Record<string, string>;
  diagnosis: string[];
  recommendations: string[];
}

/**
 * تشخيص شامل لنقطة تجديد التوكن
 * Comprehensive refresh endpoint diagnostics
 */
export async function runComprehensiveRefreshDiagnostics(): Promise<RefreshDiagnosticResult> {
  console.log('🔬 [ComprehensiveDx] بدء التشخيص الشامل...');
  console.log('================================================');
  
  const result: RefreshDiagnosticResult = {
    success: false,
    status: 0,
    statusText: '',
    cookiesBefore: {},
    cookiesAfter: {},
    headers: {},
    diagnosis: [],
    recommendations: []
  };
  
  try {
    // 1. تحليل الحالة قبل الطلب
    result.cookiesBefore = await analyzeCookiesDetailed();
    result.csrfToken = getCookieValue('sabq-csrf-token') || undefined;
    
    console.log('📊 المرحلة 1: حالة ما قبل الطلب');
    console.log('==============================');
    console.table(result.cookiesBefore);
    console.log(`🔐 CSRF Token: ${result.csrfToken ? '✅' : '❌'}`);
    
    // 2. إعداد headers للطلب
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Debug-Session': Date.now().toString(),
      'X-User-Agent': typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Server'
    };
    
    if (result.csrfToken) {
      headers['X-CSRF-Token'] = result.csrfToken;
    }
    
    console.log('📤 المرحلة 2: إعداد الطلب');
    console.log('==========================');
    console.log('Headers:', headers);
    
    // 3. إرسال الطلب
    console.log('⏳ المرحلة 3: إرسال طلب التجديد...');
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers,
      credentials: 'include',
      // إضافة معاملات إضافية للتشخيص
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    // 4. تحليل الاستجابة
    result.status = response.status;
    result.statusText = response.statusText;
    result.success = response.ok;
    
    console.log(`📨 المرحلة 4: تحليل الاستجابة (${result.status})`);
    console.log('===============================================');
    
    // جمع جميع headers
    response.headers.forEach((value, key) => {
      result.headers[key] = value;
    });
    
    // قراءة المحتوى
    try {
      const responseText = await response.text();
      if (responseText) {
        try {
          result.responseBody = JSON.parse(responseText);
        } catch {
          result.responseBody = { rawText: responseText };
        }
      }
    } catch (e) {
      result.error = `Failed to read response: ${e}`;
    }
    
    console.log('Response Headers:', result.headers);
    console.log('Response Body:', result.responseBody);
    
    // 5. تحليل الكوكيز بعد الطلب
    result.cookiesAfter = await analyzeCookiesDetailed();
    
    console.log('📊 المرحلة 5: حالة ما بعد الطلب');
    console.log('===============================');
    console.table(result.cookiesAfter);
    
    // 6. تشخيص الأخطاء
    await performErrorDiagnosis(result);
    
    // 7. إنتاج التوصيات
    generateRecommendations(result);
    
    console.log('🎯 التشخيص النهائي:');
    console.log('==================');
    result.diagnosis.forEach((d, i) => console.log(`${i + 1}. ${d}`));
    
    console.log('🛠️  التوصيات:');
    console.log('=============');
    result.recommendations.forEach((r, i) => console.log(`${i + 1}. ${r}`));
    
    return result;
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.diagnosis.push(`خطأ في التشخيص: ${result.error}`);
    console.error('💥 خطأ في التشخيص الشامل:', error);
    return result;
  }
}

/**
 * تحليل مفصل للكوكيز
 */
async function analyzeCookiesDetailed(): Promise<Record<string, CookieAnalysis>> {
  const analysis: Record<string, CookieAnalysis> = {};
  
  if (typeof document === 'undefined') {
    return analysis;
  }
  
  const authCookies = [
    'sabq_rft',
    '__Host-sabq-refresh',
    '__Host-sabq-access-token', 
    'sabq-csrf-token',
    'sabq-access-token'
  ];
  
  authCookies.forEach(cookieName => {
    const value = getCookieValue(cookieName);
    analysis[cookieName] = {
      exists: !!value,
      value: value?.substring(0, 20) + (value && value.length > 20 ? '...' : ''),
    };
    
    // محاولة تحليل خصائص الكوكي (محدود في browser)
    if (value) {
      analysis[cookieName].secure = cookieName.includes('__Host-') || window.location.protocol === 'https:';
      analysis[cookieName].domain = window.location.hostname;
    }
  });
  
  return analysis;
}

/**
 * تشخيص الأخطاء المتقدم
 */
async function performErrorDiagnosis(result: RefreshDiagnosticResult): Promise<void> {
  const { status, responseBody, cookiesBefore, csrfToken } = result;
  
  if (status === 400) {
    result.diagnosis.push('❌ 400 Bad Request - طلب غير صالح');
    
    // فحص CSRF
    if (!csrfToken) {
      result.diagnosis.push('🔐 CSRF Token مفقود من الكوكيز');
    } else {
      result.diagnosis.push('🔐 CSRF Token موجود في الكوكيز');
    }
    
    // فحص Refresh Token
    const hasRefreshToken = cookiesBefore['sabq_rft']?.exists || 
                           cookiesBefore['__Host-sabq-refresh']?.exists;
    
    if (!hasRefreshToken) {
      result.diagnosis.push('🍪 Refresh Token مفقود من الكوكيز');
    } else {
      result.diagnosis.push('🍪 Refresh Token موجود في الكوكيز');
    }
    
    // تحليل محتوى الخطأ
    const errorText = JSON.stringify(responseBody || '').toLowerCase();
    if (errorText.includes('csrf')) {
      result.diagnosis.push('📋 الخطأ يشير إلى مشكلة CSRF');
    }
    if (errorText.includes('refresh')) {
      result.diagnosis.push('📋 الخطأ يشير إلى مشكلة Refresh Token');
    }
    if (errorText.includes('cookie')) {
      result.diagnosis.push('📋 الخطأ يشير إلى مشكلة الكوكيز');
    }
    
    // فحص HTTPS للـ __Host- cookies
    if (window.location.protocol !== 'https:' && 
        (cookiesBefore['__Host-sabq-refresh']?.exists || cookiesBefore['__Host-sabq-access-token']?.exists)) {
      result.diagnosis.push('🔒 __Host- cookies تتطلب HTTPS');
    }
    
  } else if (status === 401) {
    result.diagnosis.push('🔑 401 Unauthorized - مشكلة في المصادقة');
    result.diagnosis.push('📝 Refresh Token منتهي أو غير صالح');
    
  } else if (status === 200) {
    result.diagnosis.push('✅ نجح التجديد بشكل طبيعي');
    
    // فحص ما إذا كانت الكوكيز الجديدة تم تعيينها
    const newAccessToken = result.cookiesAfter['__Host-sabq-access-token']?.exists ||
                          result.cookiesAfter['sabq-access-token']?.exists;
    
    if (newAccessToken) {
      result.diagnosis.push('🎉 تم تعيين Access Token جديد');
    } else {
      result.diagnosis.push('⚠️  لم يتم تعيين Access Token جديد');
    }
    
  } else {
    result.diagnosis.push(`❓ حالة غير متوقعة: ${status} ${result.statusText}`);
  }
}

/**
 * إنتاج التوصيات بناءً على التشخيص
 */
function generateRecommendations(result: RefreshDiagnosticResult): void {
  const { status, diagnosis, cookiesBefore, csrfToken } = result;
  
  if (status === 400) {
    if (!csrfToken) {
      result.recommendations.push('احصل على CSRF token من /api/auth/csrf أولاً');
    }
    
    const hasRefreshToken = cookiesBefore['sabq_rft']?.exists || 
                           cookiesBefore['__Host-sabq-refresh']?.exists;
    if (!hasRefreshToken) {
      result.recommendations.push('قم بتسجيل الدخول لإنشاء Refresh Token');
    }
    
    if (window.location.protocol !== 'https:') {
      result.recommendations.push('استخدم HTTPS للـ __Host- cookies');
    }
    
    result.recommendations.push('تحقق من إعدادات CORS في الخادم');
    result.recommendations.push('تأكد من أن credentials: "include" في جميع طلبات fetch');
    
  } else if (status === 401) {
    result.recommendations.push('سجّل دخول جديد - Refresh Token منتهي');
    result.recommendations.push('امسح الجلسة الحالية قبل تسجيل الدخول');
    
  } else if (status === 200) {
    result.recommendations.push('النظام يعمل بشكل طبيعي');
    result.recommendations.push('تحقق من استخدام التوكن الجديد في الطلبات');
    
  } else {
    result.recommendations.push('تحقق من سجلات الخادم للتفاصيل');
    result.recommendations.push('تأكد من أن endpoint /api/auth/refresh متاح');
  }
}

/**
 * الحصول على قيمة كوكي محدد
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * اختبار سريع للاتصال بـ refresh endpoint
 */
export async function runQuickRefreshTest(): Promise<void> {
  console.log('⚡ اختبار سريع لـ refresh endpoint...');
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    const status = response.status;
    const icon = status === 200 ? '✅' : status === 400 ? '🚨' : status === 401 ? '🔐' : '❓';
    console.log(`${icon} /api/auth/refresh: ${status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text().catch(() => 'لا يمكن قراءة الاستجابة');
      console.log(`📄 Response: ${text}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الشبكة:', error);
  }
}

/**
 * عرض دليل استخدام الأدوات
 */
export function displayDiagnosticsHelp(): void {
  console.log(`
🔧 دليل أدوات التشخيص المتقدمة
================================

📋 الأدوات المتاحة:
1. comprehensiveRefreshDiagnostics() - تشخيص شامل لـ refresh endpoint
2. quickRefreshTest() - اختبار سريع للاتصال
3. showDiagnosticsHelp() - عرض هذا الدليل

💡 أمثلة للاستخدام:
// في console المتصفح
import * as advancedDx from './lib/advanced-auth-diagnostics';
await advancedDx.runComprehensiveRefreshDiagnostics();

// أو استخدم الأدوات من loyalty-debug
import * as debugTools from './lib/loyalty-debug';
await debugTools.debugRefreshDirect();

🎯 نصائح التشخيص:
• إذا كان Status 400: تحقق من CSRF token والكوكيز
• إذا كان Status 401: Refresh token منتهي - سجّل دخول جديد  
• إذا كان Status 200: النظام يعمل - تحقق من باقي التطبيق
• إذا كان خطأ شبكة: تحقق من الخادم وإعدادات CORS

📚 معلومات إضافية:
- استخدم Network tab في DevTools لمراقبة الطلبات
- تحقق من Application tab للكوكيز المحفوظة
- راجع Console للـ logs المفصلة
`);
}

// تصدير الأدوات للاستخدام العام
export { 
  runComprehensiveRefreshDiagnostics as comprehensiveRefreshDiagnostics, 
  runQuickRefreshTest as quickRefreshTest, 
  displayDiagnosticsHelp as showDiagnosticsHelp 
};
