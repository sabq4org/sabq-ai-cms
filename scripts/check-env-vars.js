#!/usr/bin/env node

console.log('🔍 فحص متغيرات البيئة المطلوبة لـ DigitalOcean...\n');

const requiredVars = {
  // متغيرات أساسية
  'DATABASE_URL': 'اتصال قاعدة البيانات PostgreSQL',
  'JWT_SECRET': 'مفتاح التشفير للمصادقة',
  'NEXTAUTH_SECRET': 'مفتاح NextAuth.js',
  
  // متغيرات Supabase (مطلوبة للبناء)
  'NEXT_PUBLIC_SUPABASE_URL': 'عنوان Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'مفتاح Supabase العام',
  'SUPABASE_SERVICE_KEY': 'مفتاح Supabase الخاص',
};

const optionalVars = {
  // Cloudinary
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': 'اسم حساب Cloudinary',
  'CLOUDINARY_API_KEY': 'مفتاح Cloudinary API',
  'CLOUDINARY_API_SECRET': 'سر Cloudinary API',
  
  // البريد الإلكتروني
  'EMAIL_HOST': 'خادم البريد الإلكتروني',
  'EMAIL_USER': 'مستخدم البريد',
  'EMAIL_PASSWORD': 'كلمة مرور البريد',
  
  // الذكاء الاصطناعي
  'OPENAI_API_KEY': 'مفتاح OpenAI',
  'ELEVENLABS_API_KEY': 'مفتاح ElevenLabs',
};

console.log('✅ متغيرات مطلوبة:');
console.log('================\n');

let missingRequired = [];
for (const [key, description] of Object.entries(requiredVars)) {
  if (process.env[key]) {
    console.log(`✅ ${key} - ${description}`);
    console.log(`   القيمة: [محددة - ${process.env[key].length} حرف]\n`);
  } else {
    console.log(`❌ ${key} - ${description}`);
    console.log(`   القيمة: [غير محددة]\n`);
    missingRequired.push(key);
  }
}

console.log('\n📌 متغيرات اختيارية:');
console.log('==================\n');

let missingOptional = [];
for (const [key, description] of Object.entries(optionalVars)) {
  if (process.env[key]) {
    console.log(`✅ ${key} - ${description}`);
    console.log(`   القيمة: [محددة - ${process.env[key].length} حرف]\n`);
  } else {
    console.log(`⚠️  ${key} - ${description}`);
    console.log(`   القيمة: [غير محددة]\n`);
    missingOptional.push(key);
  }
}

console.log('\n📊 الملخص:');
console.log('=========\n');

if (missingRequired.length === 0) {
  console.log('✅ جميع المتغيرات المطلوبة محددة!');
} else {
  console.log(`❌ ${missingRequired.length} متغيرات مطلوبة مفقودة:`);
  missingRequired.forEach(v => console.log(`   - ${v}`));
}

if (missingOptional.length > 0) {
  console.log(`\n⚠️  ${missingOptional.length} متغيرات اختيارية مفقودة`);
}

// نصائح لـ DigitalOcean
if (missingRequired.length > 0) {
  console.log('\n💡 لإضافة المتغيرات في DigitalOcean:');
  console.log('1. افتح https://cloud.digitalocean.com');
  console.log('2. اختر تطبيقك');
  console.log('3. Settings > App-Level Environment Variables');
  console.log('4. أضف المتغيرات المفقودة');
  console.log('5. احفظ وأعد النشر');
}

// التحقق من البيئة الحالية
console.log('\n🌍 البيئة الحالية:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'غير محدد'}`);
console.log(`PWD: ${process.cwd()}`);

process.exit(missingRequired.length > 0 ? 1 : 0); 