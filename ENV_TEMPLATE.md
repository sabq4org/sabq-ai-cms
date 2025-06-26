# قالب متغيرات البيئة

## أنشئ ملف `.env.local` بالمحتوى التالي:

```env
# قاعدة البيانات MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=j3uar_sabq_db
DB_USER=j3uar_sabq_user
DB_PASSWORD=hugsiP-tiswaf-vitte2

# Database URL (لـ Prisma أو TypeORM)
DATABASE_URL="mysql://j3uar_sabq_user:hugsiP-tiswaf-vitte2@localhost:3306/j3uar_sabq_db"

# إعدادات البريد الإلكتروني
EMAIL_HOST=mail.jur3a.ai
EMAIL_PORT=587
EMAIL_USER=noreplay@jur3a.ai
EMAIL_PASS=your_email_password
EMAIL_FROM=noreplay@jur3a.ai

# مفاتيح API
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# إعدادات الجلسة والأمان
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# إعدادات التطبيق
NEXT_PUBLIC_APP_NAME="سبق AI CMS"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# إعدادات الوسائط
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp,avif

# إعدادات التطوير
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# إعدادات Supabase (اختياري)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# إعدادات أخرى
ANALYZE=false
PORT=3000
```

## ⚠️ تنبيهات مهمة:

1. **لا تشارك** ملف `.env.local` في GitHub
2. **استبدل** جميع القيم التي تحتوي على `your_` بالقيم الحقيقية
3. **احم** كلمة مرور قاعدة البيانات
4. **استخدم** مفاتيح قوية لـ NEXTAUTH_SECRET و JWT_SECRET

## 🔧 توليد مفاتيح آمنة:

```bash
# لتوليد NEXTAUTH_SECRET
openssl rand -base64 32

# لتوليد JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 للإنتاج:

أنشئ ملف `.env.production` بنفس المتغيرات مع تحديث:
- `DB_HOST` - عنوان خادم قاعدة البيانات الحقيقي
- `NEXTAUTH_URL` - https://jur3a.ai
- `NODE_ENV` - production
- جميع الروابط لتستخدم HTTPS 