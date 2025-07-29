#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// محتوى ملف .env بناءً على الذاكرة والإعدادات
const envContent = `# قاعدة بيانات Supabase
DATABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"

# إعدادات Supabase
NEXT_PUBLIC_SUPABASE_URL="https://uopckyrdhlvsxnvcobbw.supabase.co"
SUPABASE_SERVICE_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# إعدادات المصادقة
NEXTAUTH_SECRET="sabq-ai-cms-secret-key-2025"
NEXTAUTH_URL="http://localhost:3002"

# إعدادات Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dybhezmvb"
CLOUDINARY_CLOUD_NAME="dybhezmvb"
CLOUDINARY_API_KEY="559894124915114"
CLOUDINARY_API_SECRET="vuiA8rLNm7d1U-UAOTED6FyC4hY"
CLOUDINARY_URL="cloudinary://559894124915114:vuiA8rLNm7d1U-UAOTED6FyC4hY@dybhezmvb"

# إعدادات الموقع
NEXT_PUBLIC_SITE_URL="http://localhost:3002"

# بيئة التطوير
NODE_ENV="development"

# إعدادات AWS S3 (اختياري)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="sabq-cms-content"

# إعدادات OpenAI (اختياري)
OPENAI_API_KEY=""

# إعدادات ElevenLabs (اختياري)
ELEVENLABS_API_KEY=""

# إعدادات Gmail (اختياري)
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
`;

const envPath = path.join(process.cwd(), '.env');

// التحقق من وجود ملف .env
if (fs.existsSync(envPath)) {
  console.log('⚠️  تحذير: ملف .env موجود بالفعل');
  console.log('   استخدم --force لاستبداله');
  
  if (process.argv.includes('--force')) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ تم استبدال ملف .env بنجاح');
  } else {
    console.log('❌ لم يتم إنشاء الملف. استخدم --force لاستبدال الملف الموجود');
    process.exit(1);
  }
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ تم إنشاء ملف .env بنجاح');
}

console.log('\n📝 الخطوات التالية:');
console.log('1. افتح ملف .env وأضف المفاتيح المفقودة:');
console.log('   - SUPABASE_SERVICE_KEY من لوحة تحكم Supabase');
console.log('   - AWS keys إذا كنت تستخدم S3');
console.log('   - OpenAI و ElevenLabs keys إذا كنت تستخدمها');
console.log('\n2. أعد تشغيل خادم التطوير:');
console.log('   npm run dev');
console.log('\n⚠️  تذكير: لا تشارك ملف .env مع أي شخص!'); 