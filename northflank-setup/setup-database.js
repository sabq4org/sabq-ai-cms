const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// معلومات الاتصال من Northflank
const DATABASE_URL = 'postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7';

console.log('🚀 بدء إعداد قاعدة البيانات على Northflank...\n');

// إنشاء ملف .env مؤقت
const envContent = `DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DATABASE_URL}"`;

const envPath = path.join(__dirname, '..', '.env.northflank-temp');
fs.writeFileSync(envPath, envContent);

try {
  // 1. توليد Prisma Client
  console.log('📦 توليد Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });

  // 2. تشغيل Migrations
  console.log('\n🔄 تشغيل Database Migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });

  // 3. إدخال البيانات الأساسية (اختياري)
  console.log('\n🌱 إدخال البيانات الأساسية...');
  execSync('npx prisma db seed', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });

  console.log('\n✅ تم إعداد قاعدة البيانات بنجاح!');

} catch (error) {
  console.error('\n❌ خطأ في إعداد قاعدة البيانات:', error.message);
  
  // محاولة إعادة تعيين قاعدة البيانات إذا فشلت Migrations
  console.log('\n🔧 محاولة إعادة تعيين قاعدة البيانات...');
  try {
    execSync('npx prisma migrate reset --force', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL }
    });
    console.log('✅ تم إعادة تعيين قاعدة البيانات بنجاح!');
  } catch (resetError) {
    console.error('❌ فشل إعادة تعيين قاعدة البيانات:', resetError.message);
  }
} finally {
  // حذف ملف .env المؤقت
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
}
