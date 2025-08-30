const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// توليد مفتاح سري آمن
const generateSecret = () => crypto.randomBytes(32).toString('hex');

// قالب متغيرات البيئة
const envTemplate = `# Northflank Production Environment
# تم إنشاؤه بتاريخ: ${new Date().toISOString()}

# ==========================================
# قاعدة البيانات PostgreSQL
# ==========================================
DATABASE_URL="postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7"
DIRECT_URL="postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7"

# ==========================================
# NextAuth - المصادقة
# ==========================================
NEXTAUTH_SECRET="${generateSecret()}"
NEXTAUTH_URL="https://sabq.me"

# ==========================================
# بيئة التطبيق
# ==========================================
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"

# ==========================================
# AWS S3 - تخزين الملفات
# ==========================================
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="sabq-cms-content"

# ==========================================
# Cloudinary - معالجة الصور (بديل)
# ==========================================
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# ==========================================
# البريد الإلكتروني
# ==========================================
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="Sabq AI <noreply@sabq.me>"

# ==========================================
# OpenAI - الذكاء الاصطناعي
# ==========================================
OPENAI_API_KEY=""

# ==========================================
# ElevenLabs - تحويل النص لصوت
# ==========================================
ELEVENLABS_API_KEY=""

# ==========================================
# Google Analytics
# ==========================================
NEXT_PUBLIC_GA_ID=""
GOOGLE_ANALYTICS_ID=""

# ==========================================
# حماية API
# ==========================================
API_SECRET_KEY="${generateSecret()}"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# ==========================================
# إعدادات إضافية
# ==========================================
# تفعيل وضع التطوير للـ AI
AI_DEVELOPMENT_MODE="false"

# حد الرفع الأقصى (بالميجابايت)
MAX_UPLOAD_SIZE="10"

# مدة الجلسة (بالثواني)
SESSION_DURATION="86400"

# تفعيل التخزين المؤقت
ENABLE_CACHE="true"
CACHE_TTL="3600"

# ==========================================
# ملاحظات مهمة:
# ==========================================
# 1. احرص على ملء جميع المتغيرات الفارغة
# 2. لا تشارك هذا الملف مع أي شخص
# 3. احتفظ بنسخة احتياطية آمنة
# 4. قم بتحديث NEXTAUTH_SECRET بانتظام
# ==========================================
`;

// إنشاء الملف
const envPath = path.join(__dirname, '..', '.env.production');

console.log('📝 إنشاء ملف البيئة للإنتاج...\n');

// التحقق من وجود ملف سابق
if (fs.existsSync(envPath)) {
  console.log('⚠️  تحذير: يوجد ملف .env.production بالفعل!');
  console.log('   سيتم إنشاء نسخة احتياطية...');
  
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.copyFileSync(envPath, backupPath);
  console.log(`✅ تم حفظ نسخة احتياطية في: ${backupPath}\n`);
}

// كتابة الملف الجديد
fs.writeFileSync(envPath, envTemplate);

console.log('✅ تم إنشاء ملف .env.production بنجاح!');
console.log('\n📋 الخطوات التالية:');
console.log('   1. افتح الملف وأكمل المتغيرات الفارغة');
console.log('   2. احصل على مفاتيح API من الخدمات المختلفة');
console.log('   3. ارفع المتغيرات إلى Northflank');
console.log('\n🔒 تذكير: لا تضع هذا الملف في Git!');

// إنشاء ملف مثال آمن للـ Git
const exampleEnvPath = path.join(__dirname, '..', '.env.production.example');
const exampleContent = envTemplate.replace(/=".+"/g, '=""').replace(/="${generateSecret\(\)}"/g, '="your-secret-here"');
fs.writeFileSync(exampleEnvPath, exampleContent);

console.log('📄 تم أيضاً إنشاء .env.production.example للمشاركة الآمنة');
