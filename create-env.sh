#!/bin/bash

# إنشاء ملف .env.local مع المتغيرات المطلوبة

cat > .env.local << 'EOF'
# قاعدة البيانات
DATABASE_URL="postgresql://postgres.ogmzxtfxmuztpvlvxuzr:Ali17072024@@17072024@@.0@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15&connection_limit=1"
DIRECT_URL="postgresql://postgres.ogmzxtfxmuztpvlvxuzr:Ali17072024@@17072024@@.0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://ogmzxtfxmuztpvlvxuzr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbXp4dGZ4bXV6dHB2bHZ4dXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDczNzEsImV4cCI6MjA0ODEyMzM3MX0.FRoabsFqJiH-dXfQU-LLdCrUurmJu5y-b9gV6xJxyQ0"

# JWT
JWT_SECRET="your-secret-key-here-sabq-ai-cms-2024"

# إعدادات التطبيق
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Cloudinary (مؤقت - يمكنك استبدالها بقيمك الحقيقية)
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-cloudinary-api-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# البريد الإلكتروني (اختياري)
EMAIL_SERVER=""
EMAIL_FROM="noreply@sabq.org"
EOF

echo "✅ تم إنشاء ملف .env.local بنجاح!" 