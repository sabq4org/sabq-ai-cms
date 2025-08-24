/**
 * ملف فحص متخصص للـ 401 المستمر على /profile/me/loyalty
 * البرومنت النصي التنفيذي - الإصدار المتقدم
 */

import { getAccessToken } from './authClient';
import { performTokenRefresh } from './authClient';

/**
 * فحص شامل متقدم لنقطة /profile/me/loyalty المشكلة
 */
export async function diagnoseLoyaltyEndpoint(): Promise<void> {
  console.log('🎯 بدء تشخيص متقدم لـ /profile/me/loyalty...');
  
  const endpoint = '/api/profile/me/loyalty';
  
  // 1. فحص التوكن الحالي
  console.log('🔍 1. فحص التوكن الحالي...');
  const currentToken = getAccessToken();
  
  if (!currentToken) {
    console.error('❌ لا يوجد توكن في الذاكرة');
    return;
  }
  
  // تحليل التوكن
  try {
    const payload = JSON.parse(atob(currentToken.split('.')[1]));
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    const remaining = exp.getTime() - now.getTime();
    
    console.log('📋 تفاصيل التوكن:');
    console.log(`  - معرف المستخدم: ${payload.id || payload.sub}`);
    console.log(`  - البريد: ${payload.email}`);
    console.log(`  - ينتهي في: ${exp.toISOString()}`);
    console.log(`  - متبقي: ${Math.floor(remaining / 1000)} ثانية`);
    console.log(`  - صالح: ${remaining > 0 ? 'نعم' : 'لا'}`);
  } catch (e) {
    console.error('❌ فشل تحليل التوكن:', e);
    return;
  }
  
  // 2. محاولة مباشرة بالتوكن الحالي
  console.log('🧪 2. اختبار مباشر بالتوكن الحالي...');
  
  try {
    const response1 = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        'X-Debug': 'loyalty-test-1'
      },
      credentials: 'include'
    });
    
    console.log(`📡 المحاولة المباشرة: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data = await response1.json();
      console.log('✅ نجحت المحاولة المباشرة:', data);
      return; // انتهى، لا توجد مشكلة
    }
    
    if (response1.status === 401) {
      console.log('🔄 3. المحاولة المباشرة فشلت بـ 401، جاري تحديث التوكن...');
      
      // 3. تحديث التوكن بشكل صريح
      const refreshResult = await performTokenRefresh();
      
      if (!refreshResult.success || !refreshResult.token) {
        console.error('❌ فشل تحديث التوكن:', refreshResult.error);
        return;
      }
      
      console.log('✅ تم تحديث التوكن، اختبار المحاولة الثانية...');
      
      // 4. محاولة ثانية بالتوكن الجديد
      const response2 = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${refreshResult.token}`,
          'Content-Type': 'application/json',
          'X-Debug': 'loyalty-test-2-after-refresh'
        },
        credentials: 'include'
      });
      
      console.log(`📡 المحاولة الثانية: ${response2.status} ${response2.statusText}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ نجحت المحاولة الثانية:', data2);
      } else if (response2.status === 401) {
        console.error('🚨 401 مستمر حتى بعد تحديث التوكن! هذا يؤكد وجود مشكلة في الخادم');
        
        // فحص متقدم للكوكيز
        console.log('🍪 فحص الكوكيز الحالية:');
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';').map(c => c.trim());
          const authCookies = cookies.filter(c => 
            c.includes('sabq') || c.includes('auth') || c.includes('Host-sabq')
          );
          console.log('  - كوكيز المصادقة:', authCookies);
        }
        
        // فحص headers الاستجابة
        console.log('📋 Headers الاستجابة:');
        response2.headers.forEach((value, key) => {
          console.log(`  - ${key}: ${value}`);
        });
        
      } else {
        console.error(`❌ خطأ آخر في المحاولة الثانية: ${response2.status}`);
        const errorText = await response2.text().catch(() => 'لا يوجد نص خطأ');
        console.log('📄 نص الخطأ:', errorText);
      }
    } else {
      console.error(`❌ خطأ غير متوقع في المحاولة المباشرة: ${response1.status}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الشبكة:', error);
  }
  
  console.log('🏁 انتهى التشخيص المتقدم');
}

/**
 * اختبار سريع للتوكن مع عدة endpoints
 */
export async function quickTokenTest(): Promise<void> {
  console.log('⚡ اختبار سريع للتوكن...');
  
  const token = getAccessToken();
  if (!token) {
    console.error('❌ لا يوجد توكن');
    return;
  }
  
  const endpoints = [
    '/api/auth/me',
    '/api/profile/me', 
    '/api/profile/me/loyalty'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const status = response.ok ? '✅' : response.status === 401 ? '🔐' : '❌';
      console.log(`${status} ${endpoint}: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ ${endpoint}: شبكة خطأ`);
    }
  }
}

/**
 * فحص شامل لحالة الكوكيز
 */
export function analyzeCookies(): void {
  console.log('🍪 تحليل الكوكيز...');
  
  if (typeof document === 'undefined') {
    console.log('❌ لا يمكن فحص الكوكيز في بيئة الخادم');
    return;
  }
  
  const allCookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  console.log(`📊 إجمالي الكوكيز: ${allCookies.length}`);
  
  // كوكيز المصادقة المتوقعة
  const expectedAuth = [
    '__Host-sabq-access-token',
    'sabq_rft',
    '__Host-sabq-user-session'
  ];
  
  // كوكيز المصادقة القديمة
  const legacyAuth = [
    'sabq_at',
    'sabq_rt', 
    'auth-token',
    'user'
  ];
  
  console.log('🆕 الكوكيز الموحدة الجديدة:');
  expectedAuth.forEach(name => {
    const exists = allCookies.some(c => c.startsWith(name));
    console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  });
  
  console.log('🗂️ الكوكيز القديمة:');
  legacyAuth.forEach(name => {
    const exists = allCookies.some(c => c.startsWith(name));
    if (exists) {
      console.log(`  ⚠️ ${name} (يجب حذفها)`);
    }
  });
  
  console.log('🔍 جميع كوكيز المصادقة:');
  allCookies
    .filter(c => c.includes('sabq') || c.includes('auth') || c.includes('user'))
    .forEach(cookie => {
      const [name] = cookie.split('=');
      console.log(`  🍪 ${name}`);
    });
}

/**
 * إعادة تعيين شاملة للمصادقة (للطوارئ)
 */
export async function resetAuthCompletely(): Promise<void> {
  console.log('🆘 إعادة تعيين شاملة للمصادقة...');
  
  // 1. حذف من authClient
  const { clearSession } = await import('./authClient');
  clearSession();
  
  // 2. حذف جميع البيانات المحلية
  if (typeof window !== 'undefined') {
    // localStorage
    const keysToRemove = [
      'auth-token', 'user', 'user_preferences', 'sabq_user',
      'access_token', 'refresh_token', '__Host-sabq-access-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // محاولة حذف الكوكيز
    const cookiesToDelete = [
      '__Host-sabq-access-token', 'sabq_rft', '__Host-sabq-user-session',
      'sabq_at', 'sabq_rt', 'auth-token', 'user'
    ];
    
    cookiesToDelete.forEach(name => {
      document.cookie = `${name}=; path=/; domain=.sabq.me; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    });
  }
  
  console.log('✅ تم إعادة التعيين الشاملة');
}

/**
 * تصدير للاستخدام في وحدة التحكم
 */
if (typeof window !== 'undefined') {
  (window as any).debugLoyalty = {
    diagnoseLoyaltyEndpoint,
    quickTokenTest,
    analyzeCookies,
    resetAuthCompletely,
    inspectRefreshRequest,
    debugRefreshDirect
  };
  
  console.log('🔧 تم تحميل أدوات تشخيص Loyalty:');
  console.log('  - debugLoyalty.diagnoseLoyaltyEndpoint()');
  console.log('  - debugLoyalty.quickTokenTest()');
  console.log('  - debugLoyalty.analyzeCookies()');
  console.log('  - debugLoyalty.resetAuthCompletely()');
  console.log('  - debugLoyalty.inspectRefreshRequest()');
  console.log('  - debugLoyalty.debugRefreshDirect()');
}

/**
 * فحص طلب التجديد في Network tab
 */
export function inspectRefreshRequest(): void {
  console.log('🔍 كيفية فحص طلب التجديد في Network tab:');
  console.log('');
  console.log('1️⃣ افتح DevTools (F12)');
  console.log('2️⃣ اذهب لتبويب Network');
  console.log('3️⃣ فلتر البحث: "refresh" أو "/api/auth/refresh"');
  console.log('4️⃣ قم بعمل إجراء يسبب 401 (مثل زيارة /profile/me/loyalty)');
  console.log('5️⃣ ستظهر طلبات refresh، انقر على الطلب');
  console.log('');
  console.log('🔍 ما تبحث عنه:');
  console.log('');
  console.log('📤 في Request Headers:');
  console.log('  ✅ Cookie: sabq_rft=...');
  console.log('  ✅ X-CSRF-Token: ... (إذا مطلوب)');
  console.log('  ✅ credentials: include');
  console.log('');
  console.log('📥 في Response:');
  console.log('  - إذا 200: تحقق من Set-Cookie في Response Headers');
  console.log('  - إذا 400: تحقق من Response body لمعرفة السبب');
  console.log('  - إذا 401: التوكن منتهي أو غير صالح');
  console.log('');
  console.log('🚨 علامات المشاكل الشائعة:');
  console.log('  ❌ لا يوجد Cookie في Request Headers → credentials مشكلة');
  console.log('  ❌ Set-Cookie في Response لكن الكوكيز لا تُحفظ → __Host- attributes');
  console.log('  ❌ 400 مع "CSRF" في Response → CSRF token مفقود');
  console.log('  ❌ 400 مع "refresh" في Response → sabq_rft مفقود أو غير صالح');
}

/**
 * اختبار طلب refresh مباشر للتشخيص (الكود المحسن من المستخدم)
 */
export async function debugRefreshDirect(): Promise<Response | null> {
  console.log('🧪 [debugRefresh] اختبار طلب التجديد مباشرة...');
  
  if (typeof document === 'undefined') {
    console.error('❌ يعمل فقط في المتصفح');
    return null;
  }
  
  // 1. فحص الكوكيز المتاحة قبل الإرسال
  console.log('🍪 [debugRefresh] فحص الكوكيز قبل الإرسال:');
  const cookies = document.cookie;
  console.log('  - جميع الكوكيز:', cookies);
  
  const refreshCookie = cookies.split('; ').find(c => c.startsWith('sabq_rft='))?.split('=')[1] ||
                       cookies.split('; ').find(c => c.startsWith('__Host-sabq-refresh='))?.split('=')[1];
  const csrf = cookies.split('; ').find(c => c.startsWith('sabq-csrf-token='))?.split('=')[1];
  
  console.log('  - sabq_rft:', refreshCookie ? '✅ موجود' : '❌ مفقود');
  console.log('  - CSRF Token:', csrf ? '✅ موجود' : '❌ مفقود');
  
  if (!refreshCookie) {
    console.error('❌ [debugRefresh] لا يوجد refresh cookie - لا يمكن المتابعة');
    console.log('💡 تحقق من تسجيل الدخول أولاً أو من أن الخادم يرسل sabq_rft');
    return null;
  }
  
  try {
    console.log('📡 [debugRefresh] إرسال طلب التجديد مع credentials...');
    
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // حتمي لإرسال cookies مثل sabq_rft أو __Host-...
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf || '',
        'X-Debug': 'direct-refresh-test' // لتمييز هذا الطلب في logs الخادم
      },
      body: JSON.stringify({ debug: true }), // إن كان الخادم يتوقع body
    });
    
    console.log('📊 [debugRefresh] النتيجة:', res.status, res.statusText);
    
    // قراءة نص الاستجابة
    const text = await res.text();
    console.log('📄 [debugRefresh] Response Body Length:', text.length);
    
    try {
      const json = JSON.parse(text);
      console.log('📋 [debugRefresh] Response JSON:', json);
    } catch (err) {
      console.log('� [debugRefresh] Response Text:', text);
    }
    
    // فحص Set-Cookie في الاستجابة
    const setCookieHeader = res.headers.get('set-cookie');
    console.log('🍪 [debugRefresh] Set-Cookie من الخادم:', setCookieHeader || 'لا توجد');
    
    // فحص جميع headers المهمة
    console.log('📋 [debugRefresh] Response Headers المهمة:');
    ['set-cookie', 'content-type', 'x-csrf-token', 'cache-control'].forEach(header => {
      const value = res.headers.get(header);
      console.log(`  - ${header}: ${value || 'غير موجود'}`);
    });
    
    // تحليل أخطاء 400 المحددة
    if (res.status === 400) {
      console.error('🚨 [debugRefresh] تحليل 400 Bad Request:');
      
      if (text.toLowerCase().includes('csrf')) {
        console.error('  🎯 السبب المحتمل: CSRF token مفقود أو غير مطابق');
        console.error(`    - تم إرسال: "${csrf || 'لا شيء'}"`);
        console.error('    - تحقق من أن الخادم يرسل نفس القيمة في كوكي sabq-csrf-token');
      }
      
      if (text.toLowerCase().includes('refresh') || text.toLowerCase().includes('token')) {
        console.error('  🎯 السبب المحتمل: refresh token غير صالح أو منتهي');
        console.error('    - تحقق من صلاحية sabq_rft في الخادم');
      }
      
      if (text.toLowerCase().includes('cookie') || text.toLowerCase().includes('credential')) {
        console.error('  🎯 السبب المحتمل: الكوكيز لم تُرسل للخادم');
        console.error('    - تأكد من credentials: "include" في جميع طلبات fetch');
      }
      
      if (!csrf) {
        console.error('  🎯 ملاحظة: CSRF Token مفقود من الكوكيز');
        console.error('    - قد يكون السبب الرئيسي إذا كان الخادم يطلبه');
      }
    }
    
    return res;
    
  } catch (error) {
    console.error('❌ [debugRefresh] خطأ في الشبكة:', error);
    return null;
  }
}
