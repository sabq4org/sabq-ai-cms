# صحيفة سبق الذكية - Sabq AI CMS 🚀

<div align="center">
  <img src="public/logo.png" alt="سبق الذكية" width="200" />
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?logo=prisma)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/License-Private-red)](LICENSE)
  
  **نظام إدارة محتوى متطور مدعوم بالذكاء الاصطناعي لصحيفة سبق الإلكترونية**
</div>

---

## 📖 نظرة عامة

صحيفة سبق الذكية هو نظام إدارة محتوى (CMS) حديث ومتطور، مصمم خصيصاً لتلبية احتياجات الصحافة الرقمية في العصر الحديث. يجمع النظام بين قوة Next.js 14 وذكاء الـ AI لتقديم تجربة صحفية متميزة.

### ✨ المميزات الرئيسية

- 🤖 **ذكاء اصطناعي متقدم**: تلخيص تلقائي، استخراج كلمات مفتاحية، اقتراحات محتوى
- ⚡ **أداء فائق**: Server-Side Rendering، تحميل تدريجي، تخزين مؤقت ذكي
- 📱 **تصميم متجاوب**: تجربة مثالية على جميع الأجهزة
- 🌙 **الوضع الليلي**: حماية العيون مع تصميم داكن أنيق
- 🔐 **أمان متقدم**: مصادقة متعددة العوامل، تشفير البيانات
- 📊 **تحليلات شاملة**: رؤى عميقة حول الأداء والمحتوى
- 🚀 **سرعة فائقة**: تحسينات الأداء وتقنيات التحميل الذكي

## 🛠️ التقنيات المستخدمة

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Email**: SendGrid
- **Cache**: Redis (Optional)

### AI & Services
- **AI Provider**: OpenAI GPT-4
- **Search**: Algolia
- **Analytics**: Google Analytics + Custom
- **Monitoring**: Sentry
- **CDN**: Cloudflare

## 📁 هيكل المشروع

```
sabq-ai-cms/
├── app/                    # Next.js App Router
│   ├── (public)/          # الصفحات العامة
│   ├── admin/             # لوحة التحكم
│   ├── api/               # API Routes
│   └── dashboard/         # لوحة المستخدم
├── components/            # React Components
│   ├── admin/            # مكونات الإدارة
│   ├── mobile/           # مكونات الجوال
│   ├── ui/               # مكونات واجهة المستخدم
│   └── design-system/    # نظام التصميم
├── lib/                   # المكتبات والأدوات
│   ├── api/              # API Clients
│   ├── db/               # Database Utilities
│   ├── services/         # Business Logic
│   └── utils/            # Helper Functions
├── prisma/               # Database Schema
├── public/               # Static Assets
├── styles/               # Global Styles
└── types/                # TypeScript Types
```

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL (للإنتاج) أو SQLite (للتطوير)
- حساب Cloudinary (لرفع الصور)
- مفتاح OpenAI API (للذكاء الاصطناعي)

### التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms
```

2. **تثبيت المكتبات**
```bash
npm install
# أو
yarn install
# أو
pnpm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env.local
```

قم بتعديل `.env.local` وأضف:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sabq_db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OpenAI
OPENAI_API_KEY="your-openai-key"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-key"
```

4. **إعداد قاعدة البيانات**
```bash
# تشغيل migrations
npx prisma migrate dev

# إضافة بيانات تجريبية (اختياري)
npx prisma db seed
```

5. **تشغيل المشروع**
```bash
npm run dev
# أو
yarn dev
# أو
pnpm dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📱 الصفحات الرئيسية

### الواجهة العامة
- `/` - الصفحة الرئيسية
- `/news` - الأخبار
- `/moment-by-moment` - لحظة بلحظة
- `/opinion` - مقالات الرأي
- `/article/[id]` - صفحة المقال
- `/author/[slug]` - صفحة الكاتب
- `/category/[slug]` - صفحة التصنيف

### لوحة التحكم
- `/admin` - الرئيسية
- `/admin/articles` - إدارة المقالات
- `/admin/categories` - إدارة التصنيفات
- `/admin/users` - إدارة المستخدمين
- `/admin/settings` - الإعدادات

### لوحة المستخدم
- `/dashboard` - نظرة عامة
- `/dashboard/articles` - مقالاتي
- `/dashboard/profile` - الملف الشخصي
- `/dashboard/stats` - الإحصائيات

## 🤖 ميزات الذكاء الاصطناعي

### التلخيص التلقائي
```typescript
const summary = await generateSummary(articleContent);
```

### استخراج الكلمات المفتاحية
```typescript
const keywords = await extractKeywords(articleContent);
```

### اقتراحات العناوين
```typescript
const titles = await suggestTitles(articleContent);
```

### تحسين SEO
```typescript
const seoData = await optimizeSEO(article);
```

## 🔧 الأوامر المفيدة

```bash
# التطوير
npm run dev          # تشغيل خادم التطوير
npm run build        # بناء للإنتاج
npm start           # تشغيل الإنتاج
npm run lint        # فحص الكود
npm run format      # تنسيق الكود

# قاعدة البيانات
npx prisma studio   # واجهة قاعدة البيانات
npx prisma migrate dev  # تشغيل migrations
npx prisma generate    # توليد Prisma Client
npx prisma db push     # مزامنة السكيما

# الاختبارات
npm test            # تشغيل الاختبارات
npm run test:watch  # مراقبة الاختبارات
npm run test:coverage  # تقرير التغطية
```

## 📊 الأداء

- **Lighthouse Score**: 95+ (الأداء، إمكانية الوصول، أفضل الممارسات، SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Core Web Vitals**: ✅ جميعها في النطاق الأخضر

## 🔐 الأمان

- تشفير HTTPS إلزامي
- حماية CSRF
- تنظيف المدخلات (XSS Protection)
- Rate Limiting
- Content Security Policy
- مصادقة متعددة العوامل

## 🌍 التوطين

النظام يدعم حالياً:
- 🇸🇦 العربية (الافتراضية)
- 🇬🇧 English (قريباً)

## 👥 الفريق

- **قائد المشروع**: [اسم القائد]
- **المطور الرئيسي**: [اسم المطور]
- **مصمم UI/UX**: [اسم المصمم]
- **مهندس DevOps**: [اسم المهندس]

## 📄 الترخيص

هذا المشروع خاص ومحمي بحقوق الطبع والنشر. جميع الحقوق محفوظة لصحيفة سبق الإلكترونية © 2024

## 🤝 المساهمة

للمساهمة في المشروع:

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📞 الدعم

- 📧 Email: tech@sabq.org
- 💬 Slack: sabq-tech.slack.com
- 📱 WhatsApp: +966XXXXXXXXX

## 🙏 شكر خاص

شكر خاص لجميع المساهمين والمكتبات مفتوحة المصدر التي جعلت هذا المشروع ممكناً.

---

<div align="center">
  صُنع بـ ❤️ في المملكة العربية السعودية 🇸🇦
  
  **[sabq.org](https://www.sabq.org)** | **[GitHub](https://github.com/sabq4org)** | **[Twitter](https://twitter.com/sabqorg)**
</div>
