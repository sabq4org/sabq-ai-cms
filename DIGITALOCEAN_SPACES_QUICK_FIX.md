# حل سريع - مشكلة NoSuchKey في DigitalOcean Spaces

## المشكلة
خطأ `NoSuchKey` عند محاولة الوصول لسجلات البناء في `appbuild-logs`

## الحل السريع (10 دقائق)

### 1. إنشاء Space (من لوحة تحكم DigitalOcean)
- اسم: `sabq-ai-spaces`
- منطقة: `FRA1`
- نوع: Private

### 2. إنشاء Access Keys
```
API → Spaces Keys → Generate New Key
احفظ: Access Key و Secret Key
```

### 3. إضافة المتغيرات في App Platform
```env
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_REGION=fra1
DO_SPACES_BUCKET=sabq-ai-spaces
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
```

### 4. نشر التحديثات
```bash
git add .
git commit -m "Add DigitalOcean Spaces support for build logs"
git push origin main
```

## اختبار محلي (اختياري)

### 1. إعداد سريع
```bash
./scripts/setup-do-spaces.sh
```

### 2. اختبار الاتصال
```bash
node scripts/test-spaces-connection.js
```

### 3. اختبار رفع السجلات
```bash
npm run build
# سيتم رفع السجلات تلقائياً بعد البناء
```

## الملفات الجديدة المضافة
- `scripts/test-spaces-connection.js` - اختبار الاتصال
- `scripts/upload-build-logs.js` - رفع السجلات
- `app/api/admin/build-logs/route.ts` - API عرض السجلات
- `DIGITALOCEAN_SPACES_SETUP.md` - دليل شامل

## رابط صفحة السجلات
بعد النشر: `/dashboard/build-logs`

## ملاحظات مهمة
- لا يفشل البناء إذا فشل رفع السجلات
- يحتفظ بآخر 10 سجلات فقط
- السجلات خاصة وتحتاج صلاحيات admin 