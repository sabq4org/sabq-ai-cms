# 🚀 دليل النشر السريع - نظام الإعلانات
## Quick Deployment Guide - Announcements System

**آخر تحديث:** 5 أكتوبر 2025  
**الكوميت:** `267f6957`

---

## ✅ قائمة التحقق السريعة

قبل النشر، تأكد من تنفيذ هذه الخطوات:

### 1. تثبيت التبعيات ✓
```bash
npm install
```
**المتوقع:** تثبيت `swr@^2.3.0` والتبعيات الأخرى

### 2. توليد Prisma Client ✓
```bash
npx prisma generate
```
**المتوقع:** توليد types لـ `AdminAnnouncement` و `AnnouncementAttachment`

### 3. تطبيق تغييرات قاعدة البيانات ✓
```bash
# الخيار 1: Push مباشر (للتطوير/التجربة)
npx prisma db push

# الخيار 2: Migration (للإنتاج - موصى به)
npx prisma migrate dev --name add_announcements_system
```

**المتوقع:** 
- إنشاء جدولين: `admin_announcements` و `announcement_attachments`
- إنشاء 4 enums: `AnnouncementType`, `AnnouncementPriority`, `AnnouncementStatus`, `AttachmentKind`
- إضافة علاقة (relation) مع جدول `users`

### 4. اختبار البناء محلياً (اختياري) ⚠️
```bash
npm run build
```
**المتوقع:** البناء ينجح بدون أخطاء

### 5. ملء بيانات تجريبية (اختياري) 📊
```bash
npm run announcements:seed
```
**المتوقع:** إنشاء 8 إعلانات تجريبية

---

## 🔧 متغيرات البيئة المطلوبة

تأكد من وجود المتغيرات التالية في `.env.local` أو Vercel Environment Variables:

### أساسية (موجودة مسبقاً)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
```

### خاصة بالإعلانات (جديدة)
```env
# لحماية Cron Jobs
CRON_SECRET="generate-a-random-secure-string-here"

# (اختياري) لتفعيل سجلات التدقيق
ENABLE_ACTIVITY_LOGS="true"
```

**توليد CRON_SECRET:**
```bash
# طريقة 1: OpenSSL
openssl rand -base64 32

# طريقة 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📁 الملفات الجديدة

تم إضافة/تعديل 23 ملف في النظام:

### Models & Database
- ✅ `prisma/schema.prisma` - نماذج الإعلانات (129 سطر جديد)
- ℹ️ `prisma/announcement_models.prisma` - نسخة احتياطية (ليست مطلوبة للتشغيل)

### API Routes (4 ملفات)
- ✅ `app/api/admin/announcements/route.ts` - GET (list) + POST (create)
- ✅ `app/api/admin/announcements/[id]/route.ts` - GET + PATCH + DELETE
- ✅ `app/api/admin/announcements/timeline/route.ts` - Timeline view
- ✅ `app/api/internal/cron/announcements/route.ts` - Cron job (automated)

### Components (3 ملفات)
- ✅ `components/admin/AdminAnnouncementsBanner.tsx` - Top banner
- ✅ `components/admin/AdminAnnouncementsTimeline.tsx` - Sidebar timeline
- ✅ `components/admin/AdminAnnouncementsList.tsx` - Main list

### Hooks & Utils (2 ملفات)
- ✅ `hooks/useAnnouncements.ts` - SWR hook
- ✅ `lib/auth.ts` - Authentication helpers (محدّث)

### Pages (1 ملف)
- ✅ `app/admin/announcements/page.tsx` - Main page

### Scripts (1 ملف)
- ✅ `scripts/seed-announcements.js` - Seed data

### Configuration (3 ملفات)
- ✅ `vercel.json` - Cron jobs config
- ✅ `package.json` - Scripts + swr dependency
- ✅ `.env.announcements.example` - Environment template

### Documentation (3 ملفات)
- ✅ `ANNOUNCEMENTS_QUICKSTART.md` - Quick start
- ✅ `ANNOUNCEMENTS_BUILD_FIX_REPORT.md` - Build fix report
- ✅ `docs/admin-announcements-system.md` - Full docs (من جلسة سابقة)

**المجموع:** 23 ملف (17 جديد + 6 معدّل)

---

## 🎯 اختبار ما بعد النشر

بعد النشر على Vercel، اختبر:

### 1. API Endpoints
```bash
# التحقق من التوكن أولاً
curl https://your-domain.vercel.app/api/auth/me

# List announcements
curl https://your-domain.vercel.app/api/admin/announcements

# Timeline
curl https://your-domain.vercel.app/api/admin/announcements/timeline
```

### 2. Cron Job (تلقائي)
Vercel ستشغل الـ Cron كل دقيقة. تحقق من Logs:
```
Vercel Dashboard > Your Project > Logs > Filter by "cron"
```

**ما يجب أن تراه:**
- `✅ Activated X scheduled announcements`
- `✅ Expired X active announcements`
- `✅ Archived X expired announcements`

### 3. UI Components
افتح المتصفح:
```
https://your-domain.vercel.app/admin/announcements
```

**ما يجب أن تراه:**
- Banner في الأعلى (إذا كان هناك إعلانات CRITICAL)
- Timeline في الجانب (آخر 10 إعلانات)
- List في الوسط (مع بحث وفلترة)

---

## 🐛 استكشاف الأخطاء

### خطأ: `Property 'adminAnnouncement' does not exist`
**السبب:** Prisma Client لم يتم توليده بعد التحديث  
**الحل:**
```bash
npx prisma generate
npm run build
```

### خطأ: `Module not found: Can't resolve 'swr'`
**السبب:** التبعيات لم يتم تثبيتها  
**الحل:**
```bash
npm install
npm run build
```

### خطأ: `Foreign key constraint failed`
**السبب:** جدول `users` فارغ أو المستخدم غير موجود  
**الحل:**
```bash
# 1. تأكد من وجود مستخدمين في قاعدة البيانات
npx prisma studio
# افتح جدول users وتأكد من وجود سجلات

# 2. أنشئ مستخدم admin إذا لزم الأمر
node scripts/create-admin-user.js
```

### خطأ: `Unauthorized` عند استدعاء API
**السبب:** لم يتم تسجيل الدخول أو التوكن منتهي  
**الحل:**
```bash
# 1. تحقق من حالة المصادقة
curl https://your-domain.vercel.app/api/auth/me

# 2. سجل دخول جديد
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sabq.io","password":"your-password"}'
```

### Cron Job لا يعمل
**السبب:** `CRON_SECRET` غير محدد أو خاطئ  
**الحل:**
```bash
# في Vercel Dashboard:
# Settings > Environment Variables > Add
# Name: CRON_SECRET
# Value: your-generated-secret

# ثم إعادة النشر (Redeploy)
```

---

## 📊 الأداء المتوقع

### Database Queries
- **List (20 items):** ~50-100ms
- **Timeline (10 items):** ~30-50ms
- **Single item:** ~20-30ms
- **Create/Update/Delete:** ~40-60ms

### API Response Times
- **GET /announcements:** 100-200ms
- **POST /announcements:** 150-250ms
- **PATCH /announcements/[id]:** 120-220ms

### Bundle Size Impact
- **Page JS:** +15 KB (gzipped)
- **SWR Library:** ~4 KB (gzipped)
- **Total overhead:** ~19 KB

---

## 🔄 التحديثات المستقبلية

### إذا أردت تحديث النظام لاحقاً:

1. **سحب آخر تحديثات:**
```bash
git pull origin main
```

2. **تثبيت التبعيات الجديدة:**
```bash
npm install
```

3. **تطبيق migrations جديدة:**
```bash
npx prisma migrate deploy
```

4. **إعادة بناء:**
```bash
npm run build
```

---

## 📞 الدعم

إذا واجهت مشاكل:

1. **راجع التوثيق:**
   - [ANNOUNCEMENTS_BUILD_FIX_REPORT.md](./ANNOUNCEMENTS_BUILD_FIX_REPORT.md)
   - [docs/admin-announcements-system.md](./docs/admin-announcements-system.md)

2. **تحقق من Logs:**
   ```bash
   # محلياً
   npm run dev
   
   # على Vercel
   Vercel Dashboard > Logs
   ```

3. **راجع Git History:**
   ```bash
   git log --oneline --grep="announce"
   ```

4. **اتصل بفريق التطوير:**
   - tech@sabq.org
   - GitHub Issues

---

## ✅ النشر النهائي

بعد تنفيذ جميع الخطوات:

```bash
# محلياً - التحقق النهائي
npm install
npx prisma generate
npx prisma db push
npm run build
npm start

# Vercel - سيعمل تلقائياً
git push origin main
```

**🎉 تم! النظام جاهز للاستخدام.**

---

**آخر فحص:** ✅ الكوميت `267f6957` مدفوع بنجاح  
**الحالة:** 🟢 جاهز للنشر على Vercel  
**الوقت المتوقع للنشر:** 3-5 دقائق
