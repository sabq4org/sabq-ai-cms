// 🚀 استخدام فوري لأدوات التشخيص - انسخ والصق في console المتصفح

console.log('🔧 تحميل أدوات التشخيص المتقدمة...');

// ==========================================
// الطريقة 1: التشخيص السريع (موصى به)
// ==========================================
(async () => {
  try {
    // استيراد أدوات التشخيص
    const { debugRefreshDirect, analyzeCookies } = await import('./lib/loyalty-debug.js');
    
    console.log('🎯 تشغيل التشخيص السريع لمشكلة 400 Bad Request...');
    console.log('=======================================================');
    
    // تحليل الكوكيز أولاً
    console.log('📊 1. تحليل الكوكيز الحالية:');
    await analyzeCookies();
    
    console.log('\n📡 2. اختبار مباشر لـ refresh endpoint:');
    await debugRefreshDirect();
    
    console.log('\n✅ انتهى التشخيص السريع!');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
    console.log('💡 تأكد من أن الملف متوفر: lib/loyalty-debug.js');
  }
})();

// ==========================================  
// الطريقة 2: التشخيص الشامل (للتحليل المتقدم)
// ==========================================
/*
(async () => {
  try {
    const { runComprehensiveRefreshDiagnostics } = await import('./lib/advanced-auth-diagnostics.js');
    
    console.log('🔬 تشغيل التشخيص الشامل...');
    const result = await runComprehensiveRefreshDiagnostics();
    
    console.log('📋 تقرير التشخيص الشامل:');
    console.log('==========================');
    console.table({
      'الحالة': result.success ? '✅ نجح' : '❌ فشل',
      'كود الحالة': result.status,
      'وصف الحالة': result.statusText,
      'CSRF Token': result.csrfToken ? '✅ موجود' : '❌ مفقود',
      'عدد التشخيصات': result.diagnosis.length,
      'عدد التوصيات': result.recommendations.length
    });
    
    if (result.diagnosis.length > 0) {
      console.log('\n🎯 التشخيصات:');
      result.diagnosis.forEach((d, i) => console.log(`${i + 1}. ${d}`));
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n🛠️ التوصيات:');
      result.recommendations.forEach((r, i) => console.log(`${i + 1}. ${r}`));
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص الشامل:', error);
  }
})();
*/

// ==========================================
// الطريقة 3: اختبار سريع فقط
// ==========================================
/*
(async () => {
  try {
    const { runQuickRefreshTest } = await import('./lib/advanced-auth-diagnostics.js');
    await runQuickRefreshTest();
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
})();
*/

// ==========================================
// معلومات إضافية
// ==========================================
console.log(`
🔍 نصائح للاستخدام:
===================

1️⃣ للتشخيص السريع: انسخ الكود أعلاه والصقه في console المتصفح
2️⃣ لمراقبة Network tab: افتح DevTools > Network قبل تشغيل التشخيص  
3️⃣ لفحص الكوكيز: DevTools > Application > Cookies
4️⃣ للاختبار الخارجي: شغّل ./test-refresh.sh في Terminal

📋 الأخطاء الشائعة وحلولها:
===========================

🚨 400 Bad Request:
   → CSRF token مفقود: اذهب إلى /api/auth/csrf أولاً
   → Refresh token مفقود: سجّل دخول جديد
   → __Host- cookies: تأكد من HTTPS

🔐 401 Unauthorized:  
   → Refresh token منتهي: سجّل دخول جديد
   → Access token منتهي: طبيعي - سيتم التجديد تلقائياً

🌐 خطأ شبكة:
   → تحقق من الخادم والاتصال
   → راجع إعدادات CORS

💡 للمساعدة الفورية: اكتب help() في console
`);

// دالة مساعدة سريعة
window.help = function() {
  console.log(`
🆘 دليل المساعدة السريع
========================

📞 الأوامر المتاحة:
• help() - عرض هذا الدليل
• debugNow() - تشخيص سريع فوري  
• analyzeCookies() - فحص الكوكيز
• testRefresh() - اختبار refresh endpoint

📱 استخدام الأوامر:
debugNow()      // للتشخيص الفوري
help()          // للمساعدة
  `);
};

// دالة تشخيص سريعة
window.debugNow = async function() {
  try {
    const { debugRefreshDirect } = await import('./lib/loyalty-debug.js');
    await debugRefreshDirect();
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

console.log('✅ تم تحميل أدوات التشخيص بنجاح!');
console.log('💡 اكتب debugNow() للبدء فوراً أو help() للمساعدة');
