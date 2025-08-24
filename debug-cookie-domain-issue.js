/**
 * تشخيص مشكلة الكوكيز المرفوضة - Invalid Domain
 * انسخ والصق هذا الكود في console المتصفح
 */

console.log('🔍 تشخيص مشكلة الكوكيز المرفوضة - Invalid Domain');
console.log('=====================================================');

// 1. فحص الدومين الحالي
console.log('🌐 معلومات الدومين:');
console.log(`  - الدومين الحالي: ${window.location.hostname}`);
console.log(`  - البروتوكول: ${window.location.protocol}`);
console.log(`  - المنفذ: ${window.location.port}`);
console.log(`  - الرابط الكامل: ${window.location.href}`);

// 2. فحص الكوكيز الحالية
console.log('\n🍪 الكوكيز الحالية:');
const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
console.log(`  - عدد الكوكيز: ${cookies.length}`);
cookies.forEach(cookie => {
  const [name, value] = cookie.split('=');
  console.log(`  - ${name}: ${value?.substring(0, 20)}...`);
});

// 3. تحليل مشكلة __Host- cookies
console.log('\n🔒 تحليل __Host- cookies:');
console.log('متطلبات __Host- cookies:');
console.log('  1. يجب أن يكون البروتوكول HTTPS');
console.log('  2. لا يمكن تحديد Domain attribute');
console.log('  3. يجب أن يكون Path=/');
console.log('  4. يجب أن يكون Secure=true');

const isHTTPS = window.location.protocol === 'https:';
console.log(`\n✅ فحص البروتوكول: ${isHTTPS ? 'HTTPS ✓' : 'HTTP ❌ - مشكلة!'}`);

if (!isHTTPS) {
  console.error('🚨 المشكلة الرئيسية: __Host- cookies تتطلب HTTPS');
  console.log('💡 الحلول المقترحة:');
  console.log('  1. استخدم HTTPS في الإنتاج');
  console.log('  2. في التطوير: استخدم كوكيز عادية بدلاً من __Host-');
  console.log('  3. أو شغّل التطوير على localhost مع HTTPS');
}

// 4. فحص إعدادات التطوير
console.log('\n⚙️ إعدادات التطوير:');
const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
console.log(`  - بيئة التطوير: ${isDev ? 'نعم' : 'لا'}`);

if (isDev && !isHTTPS) {
  console.log('\n💡 توصيات للتطوير:');
  console.log('  1. غيّر الكوكيز من __Host- إلى أسماء عادية');
  console.log('  2. أو استخدم HTTPS في التطوير');
  console.log('  3. تأكد من Domain attribute صحيح أو محذوف');
}

// 5. اختبار إنشاء كوكي
console.log('\n🧪 اختبار إنشاء كوكي:');
try {
  // محاولة إنشاء كوكي عادي
  document.cookie = 'test-cookie=test-value; path=/; SameSite=Lax';
  console.log('✅ كوكي عادي: نجح');
  
  // محاولة إنشاء __Host- cookie
  if (isHTTPS) {
    document.cookie = '__Host-test-cookie=test-value; path=/; Secure; SameSite=Lax';
    console.log('✅ __Host- cookie: نجح');
  } else {
    console.log('❌ __Host- cookie: فشل - يحتاج HTTPS');
  }
} catch (error) {
  console.error('❌ خطأ في إنشاء الكوكي:', error);
}

// 6. فحص Network requests
console.log('\n📡 فحص طلبات الشبكة:');
console.log('افتح DevTools > Network وراقب:');
console.log('  - طلبات تسجيل الدخول');  
console.log('  - Set-Cookie headers في الاستجابة');
console.log('  - Cookie headers في الطلبات');

// 7. إرشادات الإصلاح
console.log('\n🛠️ خطوات الإصلاح:');
console.log('1. تحقق من الخادم - هل يرسل Domain attribute؟');
console.log('2. في التطوير: استخدم كوكيز عادية');
console.log('3. في الإنتاج: تأكد من HTTPS');
console.log('4. تحقق من إعدادات SameSite وSecure');

// دالة لفحص استجابة تسجيل الدخول
window.checkLoginResponse = function() {
  console.log('📋 لفحص استجابة تسجيل الدخول:');
  console.log('1. افتح Network tab');
  console.log('2. قم بتسجيل الدخول');
  console.log('3. ابحث عن طلب /auth/login أو /login');
  console.log('4. تحقق من Set-Cookie headers في Response');
  console.log('5. تحقق من وجود Domain attribute');
};

console.log('\n✅ انتهى التشخيص');
console.log('💡 اكتب checkLoginResponse() لفحص طلب تسجيل الدخول');
