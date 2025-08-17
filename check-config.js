#!/usr/bin/env node

/**
 * 🔍 مدقق الإعدادات والتكوين
 * يتحقق من جميع متغيرات البيئة المطلوبة ويقدم تقريراً شاملاً
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 بدء فحص الإعدادات...\n');

// قراءة متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

const checks = {
  required: {
    'DATABASE_URL': process.env.DATABASE_URL,
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    'JWT_SECRET': process.env.JWT_SECRET,
  },
  
  cloudinary: {
    'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
    'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET,
  },
  
  supabase: {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
  },
  
  optional: {
    'REDIS_ENABLED': process.env.REDIS_ENABLED || 'false',
    'SMTP_ENABLED': process.env.SMTP_ENABLED || 'false',
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? 'محدد' : 'غير محدد',
  }
};

function checkSection(title, vars, isRequired = false) {
  console.log(`\n📋 ${title}:`);
  console.log('━'.repeat(50));
  
  let allValid = true;
  
  for (const [key, value] of Object.entries(vars)) {
    const status = value && value.trim() !== '' ? '✅' : '❌';
    const statusText = value && value.trim() !== '' ? 'محدد' : 'غير محدد';
    
    if (!value && isRequired) {
      allValid = false;
    }
    
    console.log(`${status} ${key}: ${statusText}`);
  }
  
  return allValid;
}

// فحص الأقسام
const requiredValid = checkSection('المتغيرات المطلوبة', checks.required, true);
const cloudinaryValid = checkSection('إعدادات Cloudinary', checks.cloudinary);
const supabaseValid = checkSection('إعدادات Supabase', checks.supabase);
checkSection('الإعدادات الاختيارية', checks.optional);

// التحقق من ملفات التكوين
console.log('\n🗂️ ملفات التكوين:');
console.log('━'.repeat(50));

const configFiles = [
  '.env.local',
  'next.config.js',
  'package.json',
  'prisma/schema.prisma'
];

configFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}: ${exists ? 'موجود' : 'غير موجود'}`);
});

// ملخص النتائج
console.log('\n📊 ملخص النتائج:');
console.log('━'.repeat(50));

if (requiredValid) {
  console.log('✅ جميع المتغيرات المطلوبة محددة بشكل صحيح');
} else {
  console.log('❌ بعض المتغيرات المطلوبة غير محددة');
}

// التحقق من Cloudinary
if (!checks.cloudinary.CLOUDINARY_CLOUD_NAME) {
  console.log('⚠️ Cloudinary غير مُكوَّن - قد تواجه مشاكل في رفع الصور');
}

// التحقق من Supabase
if (!checks.supabase.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('⚠️ Supabase غير مُكوَّن - قد تواجه مشاكل في المصادقة');
}

// التحقق من Redis
if (process.env.REDIS_ENABLED === 'false' || process.env.ENABLE_REDIS === 'false') {
  console.log('ℹ️ Redis معطل - سيعمل النظام بدون تخزين مؤقت');
} else if (process.env.REDIS_URL) {
  console.log('✅ Redis مُكوَّن');
} else {
  console.log('⚠️ Redis غير مُكوَّن - سيعمل النظام بدون تخزين مؤقت');
}

console.log('\n🚀 توصيات:');
console.log('━'.repeat(50));

const recommendations = [];

if (!checks.cloudinary.CLOUDINARY_CLOUD_NAME) {
  recommendations.push('• قم بتكوين Cloudinary لرفع الصور');
}

if (!checks.supabase.NEXT_PUBLIC_SUPABASE_URL) {
  recommendations.push('• قم بتكوين Supabase للمصادقة والبيانات');
}

if (!checks.optional.OPENAI_API_KEY || checks.optional.OPENAI_API_KEY === 'غير محدد') {
  recommendations.push('• أضف مفتاح OpenAI لتفعيل ميزات الذكاء الاصطناعي');
}

if (recommendations.length === 0) {
  console.log('✅ جميع الإعدادات محددة بشكل صحيح!');
} else {
  recommendations.forEach(rec => console.log(rec));
}

console.log('\n✨ انتهى الفحص!\n');
