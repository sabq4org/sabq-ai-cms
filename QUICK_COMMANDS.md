# ⚡ الأوامر السريعة - صحيفة سبق AI CMS

## 🚀 تشغيل المشروع

### الأمر الصحيح لتشغيل Frontend
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend && npm run dev
```

### إذا كان Port 3000 مشغول
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend && npm run dev -- -p 3001
```

### تشغيل مع حذف الكاش
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend && rm -rf .next && npm run dev
```

## 🛠️ أوامر الصيانة

### حذف node_modules وإعادة التثبيت
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
rm -rf node_modules package-lock.json
npm install
```

### تحديث المكتبات
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npm update
```

### فحص المشاكل
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npm audit fix
```

## 📦 البناء والإنتاج

### بناء للإنتاج
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npm run build
```

### تشغيل نسخة الإنتاج
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npm start
```

## 🔍 استكشاف الأخطاء

### قتل العمليات على Port معين
```bash
# Port 3000
lsof -ti:3000 | xargs kill -9

# Port 3001
lsof -ti:3001 | xargs kill -9
```

### عرض العمليات النشطة
```bash
ps aux | grep node
```

### عرض المنافذ المستخدمة
```bash
lsof -i -P | grep LISTEN
```

## 📊 قاعدة البيانات

### الدخول إلى PostgreSQL
```bash
psql -U postgres -d sabq_cms
```

### تشغيل migration
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/database/migrations
psql -U postgres -d sabq_cms -f 006_create_templates_table.sql
```

### نسخ احتياطي لقاعدة البيانات
```bash
pg_dump -U postgres sabq_cms > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🐙 Git Commands

### حفظ التغييرات
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms
git add .
git commit -m "تحديث: إضافة نظام القوالب"
git push origin main
```

### سحب آخر التحديثات
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms
git pull origin main
```

### عرض الحالة
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms
git status
```

## 🔧 أوامر TypeScript

### فحص الأخطاء
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npx tsc --noEmit
```

### تشغيل ESLint
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms/frontend
npm run lint
```

## 📱 أوامر مفيدة أخرى

### فتح المشروع في VS Code
```bash
code /Users/alialhazmi/Projects/sabq-ai-cms
```

### عرض حجم المجلدات
```bash
du -sh /Users/alialhazmi/Projects/sabq-ai-cms/*
```

### البحث عن نص في المشروع
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms
grep -r "القوالب" --include="*.tsx" --include="*.ts"
```

## 🌐 روابط سريعة

- **Frontend Dev**: http://localhost:3000
- **Frontend Alt Port**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **Database**: postgresql://localhost:5432/sabq_cms

## 📝 ملاحظات مهمة

1. **دائماً تأكد من المجلد**: يجب أن تكون في `/Users/alialhazmi/Projects/sabq-ai-cms/frontend` قبل تشغيل `npm run dev`

2. **المنافذ المستخدمة**:
   - Frontend: 3000 (أو 3001 إذا كان 3000 مشغول)
   - Backend: 5000
   - Database: 5432

3. **ترتيب التشغيل**:
   1. PostgreSQL أولاً
   2. Backend ثانياً
   3. Frontend أخيراً

---

📅 آخر تحديث: ديسمبر 2024
⚡ للنسخ السريع: اضغط على الكود واختر "Copy" 