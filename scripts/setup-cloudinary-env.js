/**
 * تكوين متغيرات بيئة Cloudinary للبيئة المحلية
 */

console.log("🔧 إعداد متغيرات بيئة Cloudinary...\n");

const fs = require("fs");
const path = require("path");

// قراءة الملف الحالي
const envPath = path.join(process.cwd(), ".env.local");
let envContent = "";

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
  console.log("📄 ملف .env.local موجود");
} else {
  console.log("📄 إنشاء ملف .env.local جديد");
}

// إعدادات Cloudinary للمشروع
const cloudinarySettings = `
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=sabq-ai-cms
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_UPLOAD_PRESET=muqtarab_covers
`;

// التحقق من وجود الإعدادات
if (!envContent.includes("CLOUDINARY_CLOUD_NAME")) {
  envContent += cloudinarySettings;

  // كتابة الملف
  fs.writeFileSync(envPath, envContent);

  console.log("✅ تم إضافة إعدادات Cloudinary إلى .env.local");
  console.log("\n📝 ملاحظة مهمة:");
  console.log(
    "   1. احصل على API credentials من https://cloudinary.com/console"
  );
  console.log(
    '   2. استبدل "your_api_key_here" و "your_api_secret_here" بالقيم الحقيقية'
  );
  console.log("   3. أعد تشغيل الخادم بعد التحديث");
  console.log("\n🔄 بديل سريع: استخدم المتغيرات الموجودة في production");
} else {
  console.log("⚠️ إعدادات Cloudinary موجودة مسبقاً");
  console.log("   تحقق من أن القيم صحيحة");
}

console.log('\n💡 نصائح لحل مشكلة "حفظ محلي":');
console.log("   • تأكد من صحة CLOUDINARY_API_KEY");
console.log("   • تحقق من CLOUDINARY_CLOUD_NAME");
console.log("   • أعد تشغيل الخادم بعد التغيير");
console.log("   • في production: تحقق من متغيرات Vercel");
