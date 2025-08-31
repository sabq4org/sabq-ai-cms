# 🚨 نسخ احتياطي الآن - 3 خطوات فقط

## 1️⃣ احصل على رابط قاعدة البيانات

### من Supabase:
Settings > Database > Connection string > انسخ

### من PlanetScale:
Connect > Create password > انسخ

### من DigitalOcean:
Connection Details > Connection string > انسخ

## 2️⃣ انسخ والصق هذا الأمر

### الطريقة السهلة:
```bash
./northflank-setup/simple-backup.sh 'الصق_رابط_قاعدة_البيانات_هنا'
```

### أو الطريقة الكاملة:
```bash
DATABASE_URL='الصق_رابط_قاعدة_البيانات_هنا' ./northflank-setup/create-backup.sh
```

## 3️⃣ احفظ النسخة

ستجد النسخة في مجلد: `database-backups/`

**مهم**: ارفعها فوراً إلى:
- Google Drive
- Dropbox  
- أي مكان آمن

---

## ❓ مشاكل؟

### إذا ظهر خطأ "command not found":
```bash
# ثبّت PostgreSQL أولاً
brew install postgresql
```

### إذا لم تستطع:
- استخدم **TablePlus** أو **pgAdmin**
- أو اطلب من دعم المنصة الحالية

## 🎯 المهم: احصل على نسخة بأي طريقة!

حتى لو كانت:
- صور للشاشة
- ملفات CSV
- أي شيء أفضل من لا شيء

---

**النسخ الاحتياطي مهم جداً!** لا تتخطى هذه الخطوة 🙏


