# دليل النشر على Vercel 🚀

## الخطوات السريعة للنشر

### 1. متغيرات البيئة المطلوبة في Vercel

افتح إعدادات المشروع في Vercel وأضف هذه المتغيرات:

```bash
# قاعدة البيانات (إجباري)
DATABASE_URL="mysql://username:password@host:3306/database"

# JWT والأمان (إجباري)
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# OpenAI (اختياري - للذكاء الاصطناعي)
OPENAI_API_KEY="sk-..."

# Cloudinary (اختياري - لرفع الصور)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 2. إعدادات Build في Vercel

في إعدادات Build & Development Settings:

- **Build Command**: `npm run build` أو `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `npm install` أو `pnpm install`

### 3. قواعد البيانات المتوافقة

يمكنك استخدام أي من:
- **Vercel Storage** (PostgreSQL)
- **PlanetScale** (MySQL) - موصى به
- **Supabase** (PostgreSQL)
- **Neon** (PostgreSQL)

### 4. حل المشاكل الشائعة

#### خطأ "Module not found"
```bash
# تأكد من وجود جميع الحزم المطلوبة
npm install @radix-ui/react-scroll-area js-cookie jwt-decode
```

#### خطأ Prisma
```bash
# أضف postinstall script في package.json
"postinstall": "prisma generate"
```

#### خطأ في قاعدة البيانات
- تأكد من صحة DATABASE_URL
- تأكد من أن قاعدة البيانات تقبل الاتصالات الخارجية
- استخدم SSL إذا كانت مطلوبة: `?sslmode=require`

### 5. البناء المحلي للتجربة

```bash
# تجربة البناء محلياً قبل النشر
npm run build

# أو مع متغيرات البيئة
DATABASE_URL="..." npm run build
```

### 6. النشر التلقائي

بمجرد دمج الكود في الفرع الرئيسي (main/master)، سيقوم Vercel بالنشر تلقائياً.

## ملاحظات مهمة

1. **الأمان**: لا تضع أي معلومات حساسة في الكود
2. **SSL**: تأكد من تفعيل SSL لقاعدة البيانات في الإنتاج
3. **البيئة**: استخدم متغيرات بيئة مختلفة للتطوير والإنتاج
4. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من قاعدة البيانات

## للمساعدة

إذا واجهت أي مشاكل:
1. تحقق من Vercel Function Logs
2. تأكد من صحة متغيرات البيئة
3. جرب البناء محلياً أولاً 