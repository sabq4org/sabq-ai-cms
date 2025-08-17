#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔧 إعداد البيئة المحلية...');

const envContent = `# Database - استخدم SQLite للتطوير المحلي
DATABASE_URL="file:./dev.db"

# أو استخدم PostgreSQL المحلي إذا كان مثبت
# DATABASE_URL="postgresql://postgres:password@localhost:5432/sabq_dev"

# JWT & Auth
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Node Environment
NODE_ENV=development

# Supabase (اختياري)
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_KEY=your-supabase-service-key

# Cloudinary (اختياري)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key  
# CLOUDINARY_API_SECRET=your-api-secret

# Email (اختياري)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# OpenAI (اختياري)
# OPENAI_API_KEY=sk-your-openai-api-key

# Redis (اختياري للإنتاج)
# REDIS_URL=redis://localhost:6379
`;

const envPath = path.join(__dirname, '..', '.env.local');

// تحقق من وجود الملف
if (fs.existsSync(envPath)) {
  console.log('⚠️  ملف .env.local موجود بالفعل!');
  console.log('هل تريد استبداله؟ (اضغط Ctrl+C للإلغاء)');
  // يمكنك إضافة منطق للسؤال هنا
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ تم إنشاء .env.local بنجاح!');
  console.log('📝 تذكر تحديث قيم المتغيرات حسب بيئتك');
}

// إنشاء قاعدة بيانات SQLite إذا لم تكن موجودة
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
if (!fs.existsSync(dbPath)) {
  console.log('📊 إنشاء قاعدة بيانات SQLite...');
  // سيتم إنشاؤها تلقائياً عند تشغيل Prisma
}

console.log('\n🚀 الخطوات التالية:');
console.log('1. قم بتحديث قيم المتغيرات في .env.local');
console.log('2. شغل: npx prisma generate');
console.log('3. شغل: npx prisma db push');
console.log('4. شغل: npm run dev'); 