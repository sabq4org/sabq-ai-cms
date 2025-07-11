const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('🔍 فحص اتصال Cloudinary...\n');
  
  // التحقق من الإعدادات
  console.log('⚙️ فحص الإعدادات:');
  console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ موجود' : '❌ مفقود'}`);
  console.log(`  API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ مفقود'}`);
  console.log(`  API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ مفقود'}\n`);
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ الإعدادات غير مكتملة! تحقق من ملف .env.local');
    return;
  }
  
  try {
    console.log('📤 اختبار رفع صورة صغيرة...');
    
    // صورة اختبارية 1x1 pixel
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testImage, {
      folder: 'sabq-cms/test',
      public_id: `test_${Date.now()}`
    });
    
    console.log('\n✅ نجح الاختبار! Cloudinary يعمل بشكل صحيح');
    console.log('📋 تفاصيل الرفع:');
    console.log(`  - URL: ${result.secure_url}`);
    console.log(`  - Public ID: ${result.public_id}`);
    console.log(`  - الحجم: ${result.bytes} bytes`);
    
    // حذف الصورة الاختبارية
    console.log('\n🗑️ تنظيف: حذف الصورة الاختبارية...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ تم الحذف بنجاح');
    
  } catch (error) {
    console.error('\n❌ فشل الاختبار!');
    console.error('🔴 رسالة الخطأ:', error.message);
    
    // تحليل نوع الخطأ
    if (error.message.includes('Invalid')) {
      console.log('\n💡 السبب المحتمل: مفاتيح API غير صحيحة');
      console.log('   الحل: تحقق من صحة المفاتيح في حساب Cloudinary');
    } else if (error.message.includes('limit') || error.message.includes('quota')) {
      console.log('\n💡 السبب المحتمل: تجاوزت حد الاستخدام الشهري');
      console.log('   الحل: راجع حسابك في Cloudinary أو قم بالترقية');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 السبب المحتمل: مشكلة في الاتصال بالإنترنت');
      console.log('   الحل: تحقق من اتصال الإنترنت أو جدار الحماية');
    }
    
    console.log('\n📝 للمزيد من المساعدة:');
    console.log('   - تحقق من لوحة تحكم Cloudinary: https://cloudinary.com/console');
    console.log('   - راجع سجل الأخطاء في: Dashboard > Logs');
  }
}

// تشغيل الاختبار
console.log('============================================');
console.log('      اختبار اتصال Cloudinary');
console.log('============================================\n');

testCloudinary(); 