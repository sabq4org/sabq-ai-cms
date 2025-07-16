#!/bin/bash

# سكريبت إعداد ملف البيئة للعمل مع قاعدة بيانات DigitalOcean و Cloudinary

echo "🚀 إعداد ملف البيئة لمشروع سبق..."

# إنشاء ملف .env.local مع الإعدادات المناسبة
cat > .env.local << EOF
# قاعدة البيانات - DigitalOcean PostgreSQL
DATABASE_URL=postgres://doadmin:REPLACE_WITH_PASSWORD@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_production?sslmode=require&connection_limit=50

# Redis للكاش (اختياري)
REDIS_URL=redis://localhost:6379

# إعدادات Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dybhezmvb

# إعدادات حرجة
SEED_FAKE_DATA=false
USE_MOCK_DATA=false
NODE_ENV=development

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-key-replace-in-production

# البريد الإلكتروني
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@example.com
EMAIL_SERVER_PASSWORD=app-specific-password
EMAIL_FROM=Sabq <noreply@example.com>

# API 
API_SECRET_KEY=local-development-secret
RATE_LIMIT_ENABLED=false
EOF

echo "✅ تم إنشاء ملف .env.local بنجاح"
echo "⚠️ يرجى فتح الملف وتعديل كلمة المرور الخاصة بقاعدة البيانات"
echo "📝 بعد تعديل كلمة المرور، قم بتشغيل المشروع باستخدام: npm run dev" 