# 🚀 سبق الذكية - نظام إدارة المحتوى الذكي

<div align="center">

![Sabq AI CMS](https://img.shields.io/badge/سبق_الذكية-CMS-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![AI Powered](https://img.shields.io/badge/🤖_AI-Powered-brightgreen?style=for-the-badge)

**نظام إدارة محتوى ذكي متطور مبني بأحدث التقنيات لموقع سبق الإخباري**

[🌐 الموقع المباشر](https://sabq.org) • [📚 التوثيق](./docs) • [🎙️ البودكاست](./PODCAST_README.md) • [🐛 الإبلاغ عن خطأ](https://github.com/sabq4org/sabq-ai-cms/issues)

</div>

---

## 🌟 نظرة عامة

**سبق الذكية** هو نظام إدارة محتوى متطور يجمع بين قوة الذكاء الاصطناعي وأحدث تقنيات الويب لتوفير تجربة إعلامية استثنائية. يتميز النظام بواجهة عصرية، أداء محسن، ومميزات ذكية للكتاب والقراء.

### ✨ المميزات الرئيسية

- 🤖 **ذكاء اصطناعي متقدم**: تحليل المحتوى، اقتراحات ذكية، وتصنيف تلقائي
- 🎙️ **نظام بودكاست متكامل**: مشغل ذكي مع موجات صوتية وتحليلات
- 📱 **تجاوب كامل**: تصميم متجاوب يعمل على جميع الأجهزة
- 🌙 **الوضع المظلم**: دعم كامل للوضع المظلم والفاتح
- ⚡ **أداء فائق**: تحسينات متقدمة للسرعة والأداء
- 🔐 **أمان محسن**: مصادقة ثنائية وحماية متقدمة
- 📊 **تحليلات ذكية**: إحصائيات مفصلة وتقارير تفاعلية
- 🎯 **تخصيص المحتوى**: اقتراحات مخصصة لكل مستخدم

---

## 🏗️ التقنيات المستخدمة

### Frontend
```bash
Next.js 14           # إطار العمل الرئيسي
TypeScript           # لغة البرمجة المطورة
Tailwind CSS         # إطار التصميم
Radix UI             # مكونات واجهة المستخدم
Framer Motion        # الحركات والانتقالات
React Hook Form      # إدارة النماذج
Zustand              # إدارة الحالة
```

### Backend & Database
```bash
Prisma ORM           # قاعدة البيانات
PostgreSQL           # قاعدة البيانات الرئيسية
NextAuth.js          # المصادقة والجلسات
Zod                  # التحقق من البيانات
tRPC                 # API Type-Safe
Redis                # التخزين المؤقت
```

### AI & Analytics
```bash
OpenAI GPT-4         # الذكاء الاصطناعي
Vercel AI SDK        # أدوات الذكاء الاصطناعي
Langchain            # معالجة اللغة
Google Analytics     # تحليلات الويب
Mixpanel             # تحليلات المستخدمين
```

### DevOps & Infrastructure
```bash
Vercel               # الاستضافة والنشر
Docker               # الحاويات
GitHub Actions       # CI/CD
Cloudinary           # إدارة الملفات
AWS S3               # التخزين السحابي
```

---

## 🚀 التثبيت والإعداد

### متطلبات النظام
- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL 14+
- Redis (اختياري)

### 1. استنساخ المشروع
```bash
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms
```

### 2. تثبيت التبعيات
```bash
npm install
# أو
yarn install
# أو
pnpm install
```

### 3. إعداد متغيرات البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env.local

# تحرير المتغيرات
vim .env.local
```

### 4. إعداد قاعدة البيانات
```bash
# تشغيل Prisma migrations
npx prisma generate
npx prisma db push

# إدراج البيانات الأولية
npx prisma db seed
```

### 5. تشغيل التطوير
```bash
npm run dev
```

🌐 افتح http://localhost:3000 لرؤية النتيجة

---

## 📂 هيكل المشروع

```
sabq-ai-cms/
├── 📱 app/                    # صفحات Next.js App Router
│   ├── admin/                # لوحة التحكم
│   ├── api/                  # API Routes
│   ├── auth/                 # صفحات المصادقة
│   ├── podcast/              # نظام البودكاست
│   └── (routes)/             # الصفحات العامة
├── 🧩 components/            # مكونات React
│   ├── ui/                   # مكونات واجهة المستخدم
│   ├── home/                 # مكونات الصفحة الرئيسية
│   ├── admin/                # مكونات لوحة التحكم
│   └── podcast/              # مكونات البودكاست
├── 🎨 styles/                # ملفات الأنماط
├── 🗃️ prisma/                # مخططات قاعدة البيانات
├── 📚 lib/                   # مكتبات مساعدة
├── 🔧 utils/                 # أدوات مساعدة
├── 🌐 public/                # الملفات العامة
└── 📖 docs/                  # التوثيق
```

---

## 🎙️ نظام البودكاست

النظام يتضمن نظام بودكاست متكامل ومتطور:

### المميزات
- 🎵 مشغل صوت ذكي مع تحكم كامل
- 📊 موجات صوتية متحركة أثناء التشغيل
- 📱 مشغل مصغر ثابت أثناء التنقل
- 🎯 تصنيف الحلقات بفئات ملونة
- 🔍 بحث وتصفية متقدمة
- 📈 تحليلات مفصلة للاستماع

### الاستخدام
```bash
# تشغيل نظام البودكاست
./podcast-start.sh

# أو يدوياً
npm run podcast:dev
```

📖 [التوثيق الكامل للبودكاست](./PODCAST_README.md)

---

## 🛠️ أوامر التطوير

```bash
# التطوير
npm run dev              # تشغيل خادم التطوير
npm run build            # بناء للإنتاج
npm run start            # تشغيل الإنتاج
npm run lint             # فحص الكود
npm run type-check       # فحص TypeScript

# قاعدة البيانات
npm run db:generate      # توليد Prisma Client
npm run db:push          # دفع التغييرات لقاعدة البيانات
npm run db:migrate       # تشغيل migrations
npm run db:seed          # إدراج البيانات الأولية
npm run db:studio        # فتح Prisma Studio

# البودكاست
npm run podcast:dev      # تطوير البودكاست
npm run podcast:build    # بناء البودكاست
npm run podcast:test     # اختبار البودكاست

# الاختبارات
npm run test             # تشغيل الاختبارات
npm run test:coverage    # تشغيل مع تقرير التغطية
npm run test:e2e         # اختبارات End-to-End
```

---

## 🔧 التكوين والتخصيص

### إعدادات البيئة
```env
# قاعدة البيانات
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# المصادقة
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# الذكاء الاصطناعي
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# التخزين
CLOUDINARY_URL="cloudinary://..."
AWS_S3_BUCKET="your-bucket"

# التحليلات
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
MIXPANEL_TOKEN="your-mixpanel-token"
```

### تخصيص الألوان والتصميم
```css
/* في tailwind.config.js */
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```

---

## 📊 الأداء والمراقبة

### مقاييس الأداء الرئيسية
- ⚡ **Core Web Vitals**: محسن لتجربة المستخدم
- 🚀 **Loading Speed**: < 2 ثانية لتحميل الصفحة
- 📱 **Mobile Performance**: نقاط 95+ على Lighthouse
- 🔍 **SEO Score**: محسن لمحركات البحث

### أدوات المراقبة
- Vercel Analytics للأداء
- Sentry لمراقبة الأخطاء
- LogRocket لتسجيل جلسات المستخدمين
- Uptime Robot لمراقبة التوفر

---

## 🔐 الأمان والخصوصية

### ميزات الأمان
- 🔒 مصادقة ثنائية العامل
- 🛡️ حماية من CSRF وXSS
- 🔐 تشفير البيانات الحساسة
- 🚫 حماية من القوة الغاشمة
- 📝 سجلات تدقيق شاملة

### الامتثال
- 📋 متوافق مع GDPR
- 🇸🇦 يتبع لوائح الخصوصية السعودية
- 🔒 شهادة SSL/TLS
- 🛡️ فحص أمني دوري

---

## 🤝 المساهمة في المشروع

نرحب بمساهماتكم في تطوير النظام!

### خطوات المساهمة
1. **Fork** المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/amazing-feature`)
3. تنفيذ التغييرات (`git commit -m 'Add some amazing feature'`)
4. دفع للفرع (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### إرشادات المساهمة
- 📝 اتباع معايير الكود المحددة
- 🧪 كتابة اختبارات للميزات الجديدة
- 📖 تحديث التوثيق عند الحاجة
- 🐛 الإبلاغ عن الأخطاء بوضوح

---

## 📈 خارطة الطريق

### الإصدار القادم (v2.0)
- [ ] **محرر المحتوى بالذكاء الاصطناعي**
- [ ] **نظام إشعارات متقدم**
- [ ] **دعم البث المباشر**
- [ ] **تطبيق الهاتف المحمول**
- [ ] **نظام المكافآت والولاء**

### المميزات المستقبلية
- [ ] **دعم الواقع المعزز للأخبار**
- [ ] **ترجمة فورية متعددة اللغات**
- [ ] **تحليل المشاعر في الوقت الفعلي**
- [ ] **نظام توصيات متقدم بالذكاء الاصطناعي**

---

## 📞 الدعم والتواصل

### طرق التواصل
- 📧 **البريد الإلكتروني**: [tech@sabq.org](mailto:tech@sabq.org)
- 💬 **تيليجرام**: [@sabq_tech](https://t.me/sabq_tech)
- 🐛 **الإبلاغ عن الأخطاء**: [GitHub Issues](https://github.com/sabq4org/sabq-ai-cms/issues)
- 💡 **اقتراح ميزة**: [Feature Requests](https://github.com/sabq4org/sabq-ai-cms/discussions)

### المجتمع
- 👥 [Discord Server](https://discord.gg/sabq)
- 🗨️ [GitHub Discussions](https://github.com/sabq4org/sabq-ai-cms/discussions)
- 📱 [LinkedIn](https://linkedin.com/company/sabq)

---

## 📄 الترخيص

هذا المشروع مرخص تحت **MIT License** - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🙏 شكر وتقدير

### المساهمون الرئيسيون
- 👨‍💻 **فريق التطوير في سبق**
- 🎨 **فريق التصميم**
- 🧪 **فريق ضمان الجودة**
- 📊 **فريق التحليلات**

### التقنيات المستخدمة
شكر خاص لمطوري هذه المكتبات والأدوات الرائعة:
- [Next.js](https://nextjs.org) - إطار العمل الرئيسي
- [Prisma](https://prisma.io) - ORM متطور
- [Tailwind CSS](https://tailwindcss.com) - إطار التصميم
- [Radix UI](https://radix-ui.com) - مكونات UI
- [OpenAI](https://openai.com) - الذكاء الاصطناعي

---

<div align="center">

**صنع بـ ❤️ في المملكة العربية السعودية**

![Made in Saudi Arabia](https://img.shields.io/badge/صنع_في-🇸🇦_السعودية-green?style=for-the-badge)

© 2024 سبق. جميع الحقوق محفوظة.

⭐ **لا تنس إعطاء النجمة للمشروع إذا أعجبك!**

</div>
