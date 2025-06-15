# 📁 الملفات المهمة - صحيفة سبق AI CMS

## 📚 ملفات التوثيق
```
📄 USER_GUIDE.md                    # دليل المستخدم الشامل
📄 DESIGN_SYSTEM.md                 # نظام التصميم والأنماط
📄 COLOR_PALETTE.md                 # لوحة الألوان المستخدمة
📄 TEMPLATES_DOCUMENTATION.md       # توثيق نظام القوالب
📄 PROJECT_SETUP.md                 # دليل إعداد وتشغيل المشروع
📄 PROJECT_SUMMARY.md               # ملخص شامل للمشروع
📄 ISSUES_LOG.md                    # سجل المشاكل والحلول
📄 QUICK_COMMANDS.md                # الأوامر السريعة
📄 CSS_STYLES.md                    # أكواد CSS المستخدمة
📄 IMPORTANT_FILES.md               # هذا الملف - قائمة الملفات المهمة
```

## 🎨 ملفات التصميم والأنماط
```
frontend/
├── app/globals.css                 # أنماط CSS الرئيسية
├── tailwind.config.js              # إعدادات Tailwind CSS
├── app/layout.tsx                  # التخطيط الرئيسي
└── components/
    ├── dashboard/
    │   ├── DashboardNavbar.tsx    # شريط التنقل العلوي
    │   └── DashboardSidebar.tsx   # الشريط الجانبي
    └── ui/                        # مكونات واجهة المستخدم
```

## 🏗️ قاعدة البيانات
```
database/
├── migrations/
│   ├── 001_initial_schema.sql     # المخطط الأساسي
│   ├── 002_create_users_table.sql # جدول المستخدمين
│   ├── 003_create_roles_table.sql # جدول الأدوار
│   ├── 005_ai_console_tables.sql  # جداول لوحة التحكم الذكية
│   └── 006_create_templates_table.sql # جدول القوالب
└── seeders/                       # البيانات الأولية
```

## 📱 الصفحات الرئيسية
```
frontend/app/
├── dashboard/
│   ├── page.tsx                   # الصفحة الرئيسية للوحة التحكم
│   ├── console/
│   │   ├── page.tsx              # لوحة سبق الذكية
│   │   └── components/           # مكونات لوحة التحكم
│   │       ├── LiveKPIs.tsx      # مؤشرات الأداء الحية
│   │       ├── ActivityTimeline.tsx # سجل النشاطات
│   │       ├── AIInsights.tsx    # توصيات AI
│   │       ├── SystemAlerts.tsx  # تنبيهات النظام
│   │       ├── ContentMonitor.tsx # مراقبة المحتوى
│   │       └── EditorBehavior.tsx # سلوك المحررين
│   ├── templates/
│   │   ├── page.tsx              # صفحة القوالب
│   │   └── components/
│   │       ├── TemplatesList.tsx # قائمة القوالب
│   │       ├── TemplateEditor.tsx # محرر القوالب
│   │       └── editors/
│   │           ├── HeaderEditor.tsx # محرر الهيدر
│   │           └── FooterEditor.tsx # محرر الفوتر
│   ├── team/
│   │   └── page.tsx              # إدارة الفريق
│   └── roles/
│       └── page.tsx              # الأدوار والصلاحيات
├── api/                          # واجهات API
│   ├── console/
│   │   ├── live-kpis/route.ts   # API مؤشرات الأداء
│   │   └── activities/route.ts   # API النشاطات
│   └── templates/
│       ├── route.ts              # API القوالب
│       └── [id]/
│           ├── route.ts          # API قالب محدد
│           └── set-default/route.ts # API تعيين افتراضي
├── not-found.tsx                 # صفحة 404
└── error.tsx                     # صفحة الأخطاء
```

## ⚙️ ملفات الإعدادات
```
frontend/
├── package.json                   # تبعيات المشروع
├── tsconfig.json                 # إعدادات TypeScript
├── next.config.mjs               # إعدادات Next.js
├── postcss.config.js             # إعدادات PostCSS
├── .env.local                    # متغيرات البيئة (غير موجود في Git)
└── .gitignore                    # الملفات المتجاهلة

backend/
├── package.json                  # تبعيات الخادم
├── .env                         # متغيرات البيئة (غير موجود في Git)
└── src/
    ├── index.js                 # نقطة دخول الخادم
    └── config/
        └── database.js          # إعدادات قاعدة البيانات
```

## 🔐 ملفات الأمان والصلاحيات
```
frontend/
├── app/lib/auth.ts              # مساعدات المصادقة
├── middleware.ts                # حماية المسارات
└── app/providers.tsx            # مزود السياق

backend/src/
├── middleware/
│   └── auth.js                  # middleware المصادقة
└── utils/
    └── jwt.js                   # أدوات JWT
```

## 📊 مكونات لوحة التحكم
```
frontend/app/dashboard/console/components/
├── LiveKPIs.tsx                 # 8 مؤشرات أداء حية
├── ActivityTimeline.tsx         # سجل نشاطات مباشر
├── AIInsights.tsx              # توصيات ذكية
├── SystemAlerts.tsx            # تنبيهات مصنفة
├── ContentMonitor.tsx          # مراقبة المحتوى
└── EditorBehavior.tsx          # تحليل سلوك المحررين
```

## 🎨 مكونات القوالب
```
frontend/app/dashboard/templates/components/
├── TemplatesList.tsx           # عرض وإدارة القوالب
├── TemplateEditor.tsx          # المحرر الرئيسي
└── editors/
    ├── HeaderEditor.tsx        # محرر الهيدر (5 أقسام)
    └── FooterEditor.tsx        # محرر الفوتر (4 أقسام)
```

## 🔧 ملفات مساعدة
```
frontend/
├── lib/
│   ├── utils.ts               # دوال مساعدة عامة
│   └── api.ts                 # دوال API
└── types/
    └── index.ts               # تعريفات TypeScript
```

## 📱 ملفات الجوال (مستقبلية)
```
mobile/
├── App.tsx                    # التطبيق الرئيسي
├── package.json               # تبعيات React Native
└── src/
    ├── screens/              # شاشات التطبيق
    └── components/           # مكونات مشتركة
```

## 🔍 ملفات يجب مراجعتها دورياً
1. **ISSUES_LOG.md** - للتحقق من المشاكل المحلولة والجديدة
2. **package.json** - للتحقق من التحديثات
3. **globals.css** - للحفاظ على تناسق التصميم
4. **database/migrations/** - للتأكد من تطبيق كل التحديثات

## 🚫 ملفات لا تُرفع على GitHub
```
.env
.env.local
node_modules/
.next/
.DS_Store
*.log
uploads/
build/
dist/
```

---

📅 آخر تحديث: ديسمبر 2024
🏢 صحيفة سبق الإلكترونية 