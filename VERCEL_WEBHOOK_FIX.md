# حل مشكلة Vercel Webhook النهائي

## المشكلة الأساسية
Vercel لا يكتشف التغييرات من GitHub بسبب عدم وجود Git metadata صحيحة.

## الحل المطبق (✅ تم التنفيذ)

### 1. إصلاح Git Metadata
```bash
git config --global user.name "Ali Alhazmi"
git config --global user.email "ali@sabq.ai"
```

**مهم**: يجب أن يكون البريد الإلكتروني **نفسه** المستخدم في:
- GitHub account
- Vercel account
- Git commits

### 2. التحقق من الإعدادات
```bash
# التحقق من Git config
git config user.name
git config user.email

# التحقق من آخر commit
git log -1 --pretty=format:"%an <%ae>"
```

## خطوات إضافية إذا استمرت المشكلة

### أ) في Vercel Dashboard:
1. اذهب إلى **Project Settings** → **Git**
2. اضغط **Disconnect** لفصل GitHub
3. انتظر 30 ثانية
4. اضغط **Connect Git Repository**
5. اختر `sabq4org/sabq-ai-cms`
6. تأكد من اختيار **main** branch

### ب) في GitHub:
1. اذهب إلى **Settings** → **Webhooks**
2. يجب أن تجد webhook من Vercel
3. إذا لم تجده، قم بالخطوة (أ) مرة أخرى

### ج) إعادة تثبيت Vercel GitHub App:
1. GitHub → **Settings** → **Applications** → **Installed GitHub Apps**
2. ابحث عن **Vercel** واضغط **Configure**
3. اضغط **Uninstall**
4. ارجع لـ Vercel وأعد ربط المشروع

### د) تحقق من البريد في GitHub:
1. GitHub → **Settings** → **Emails**
2. تأكد أن `ali@sabq.ai` مضاف ومُفعّل (verified)
3. يمكنك جعله Primary email

## اختبار الحل

### طريقة 1: Commit فارغ
```bash
git commit --allow-empty -m "Test Vercel webhook"
git push origin main
```

### طريقة 2: تحديث ملف الـ trigger
```bash
echo "Build: $(date)" >> vercel-deploy-trigger.txt
git add vercel-deploy-trigger.txt
git commit -m "Trigger Vercel build - $(date)"
git push origin main
```

## مؤشرات النجاح
- ✅ ظهور deployment جديد في Vercel Dashboard تلقائياً
- ✅ رسالة "Deployment created" في GitHub commit
- ✅ ظهور webhook في GitHub settings

## معلومات إضافية
- Commit SHA الذي تم إصلاحه: `4c1c706`
- تاريخ الإصلاح: ${new Date().toISOString()}
- Git config تم تعيينها بشكل global

## موارد مفيدة
- [Vercel Troubleshooting Guide](https://vercel.com/guides/why-arent-commits-triggering-deployments)
- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

---
**ملاحظة**: إذا استمرت المشكلة، تواصل مع دعم Vercel مع ذكر أن Git metadata تم إصلاحها. 