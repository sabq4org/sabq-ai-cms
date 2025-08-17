#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// المتغيرات المطلوبة
const requiredVars = {
  'DATABASE_URL': '🔗 اتصال قاعدة البيانات',
  'DIRECT_URL': '🔗 اتصال مباشر لقاعدة البيانات', 
  'NEXT_PUBLIC_SUPABASE_URL': '🌐 رابط Supabase',
  'NEXTAUTH_SECRET': '🔐 مفتاح المصادقة',
  'NEXTAUTH_URL': '🌐 رابط المصادقة',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': '☁️ اسم سحابة Cloudinary',
  'CLOUDINARY_CLOUD_NAME': '☁️ اسم Cloudinary',
  'CLOUDINARY_API_KEY': '🔑 مفتاح Cloudinary API',
  'CLOUDINARY_API_SECRET': '🔒 مفتاح Cloudinary السري'
};

// المتغيرات الاختيارية
const optionalVars = {
  'SUPABASE_SERVICE_KEY': '🔑 مفتاح خدمة Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': '🔑 مفتاح دور خدمة Supabase',
  'NEXT_PUBLIC_SITE_URL': '🌐 رابط الموقع',
  'NODE_ENV': '⚙️ بيئة التشغيل',
  'AWS_ACCESS_KEY_ID': '🔑 مفتاح AWS',
  'AWS_SECRET_ACCESS_KEY': '🔒 مفتاح AWS السري',
  'AWS_REGION': '🌍 منطقة AWS',
  'AWS_S3_BUCKET_NAME': '🪣 اسم S3 Bucket',
  'OPENAI_API_KEY': '🤖 مفتاح OpenAI',
  'ELEVENLABS_API_KEY': '🎙️ مفتاح ElevenLabs'
};

console.log('🔍 فحص متغيرات البيئة...\n');

// فحص وجود ملف .env
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ ملف .env غير موجود!');
  console.log('   استخدم: node scripts/create-env-file.js');
  process.exit(1);
}

// قراءة متغيرات البيئة
require('dotenv').config();

let missingRequired = 0;
let missingOptional = 0;

console.log('📋 المتغيرات المطلوبة:');
console.log('━'.repeat(60));

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  if (!value || value === '' || value === '""') {
    console.log(`❌ ${key.padEnd(35)} - ${description} (مفقود)`);
    missingRequired++;
  } else {
    const displayValue = key.includes('SECRET') || key.includes('PASSWORD') 
      ? '***' 
      : value.substring(0, 20) + (value.length > 20 ? '...' : '');
    console.log(`✅ ${key.padEnd(35)} - ${description}`);
  }
}

console.log('\n📋 المتغيرات الاختيارية:');
console.log('━'.repeat(60));

for (const [key, description] of Object.entries(optionalVars)) {
  const value = process.env[key];
  if (!value || value === '' || value === '""') {
    console.log(`⚠️  ${key.padEnd(35)} - ${description} (غير محدد)`);
    missingOptional++;
  } else {
    console.log(`✅ ${key.padEnd(35)} - ${description}`);
  }
}

console.log('\n📊 الملخص:');
console.log('━'.repeat(60));

if (missingRequired > 0) {
  console.log(`❌ متغيرات مطلوبة مفقودة: ${missingRequired}`);
  console.log('   يجب تحديد هذه المتغيرات لتشغيل التطبيق');
} else {
  console.log('✅ جميع المتغيرات المطلوبة موجودة');
}

if (missingOptional > 0) {
  console.log(`⚠️  متغيرات اختيارية مفقودة: ${missingOptional}`);
  console.log('   قد تحتاج لتحديدها حسب الميزات المستخدمة');
}

if (missingRequired === 0) {
  console.log('\n✨ التطبيق جاهز للتشغيل!');
} else {
  console.log('\n❌ يجب إصلاح المتغيرات المفقودة أولاً');
  process.exit(1);
} 