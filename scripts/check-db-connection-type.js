// التحقق من نوع اتصال قاعدة البيانات
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || '';

console.log('🔍 فحص نوع اتصال قاعدة البيانات');
console.log('=====================================\n');

if (dbUrl.includes('private-')) {
  console.log('✅ أنت تستخدم الاتصال الخاص (Private)');
  console.log('   - سريع جداً (< 1ms)');
  console.log('   - مجاني (لا يحسب من البيانات)');
  console.log('   - يعمل فقط من داخل DigitalOcean');
} else if (dbUrl.includes('db-sabq-ai')) {
  console.log('📡 أنت تستخدم الاتصال العام (Public)');
  console.log('   - يعمل من أي مكان');
  console.log('   - أبطأ نسبياً');
  console.log('   - يحسب من حصة البيانات');
} else {
  console.log('❌ عنوان قاعدة البيانات غير صحيح أو غير موجود');
}

console.log('\n📝 نصيحة:');
console.log('- للتطوير المحلي: استخدم العنوان بدون private-');
console.log('- للإنتاج في DigitalOcean: استخدم العنوان مع private-');

// عرض العنوان المخفي
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log('\n🔗 العنوان الحالي:', maskedUrl); 