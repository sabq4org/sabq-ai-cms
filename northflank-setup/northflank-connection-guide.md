# 🔌 دليل الاتصال بقاعدة البيانات في Northflank

## الفرق بين Internal و External URIs

### 1. POSTGRES_URI_INTERNAL (الداخلي)
```
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7
```
- ✅ يعمل **فقط** من داخل Northflank (بين الخدمات)
- ✅ أسرع وأكثر أماناً
- ✅ لا يحتاج IP whitelist
- ❌ لا يعمل من جهازك المحلي

### 2. POSTGRES_URI_EXTERNAL (الخارجي)
- ✅ يعمل من أي مكان (مع IP whitelist)
- ✅ للتطوير المحلي والإدارة
- ❌ يحتاج إضافة IP في whitelist
- ❌ أبطأ قليلاً

## 🎯 الحل الصحيح

### للتطبيق على Northflank:
استخدم الـ **INTERNAL URI** في متغيرات البيئة:

```env
# في Northflank Environment Variables
DATABASE_URL="${{addons.DATABASE_ID.POSTGRES_URI_INTERNAL}}"
DIRECT_URL="${{addons.DATABASE_ID.POSTGRES_URI_INTERNAL}}"
```

### للتطوير المحلي:
تحتاج للحصول على **EXTERNAL URI** من Northflank:

1. افتح قاعدة البيانات في Northflank
2. اذهب إلى `Connection Details`
3. انسخ `External Connection String`
4. أضف IP الخاص بك في whitelist

## 📝 تحديث إعدادات المشروع

### 1. في Northflank Service (sabq-app):
```json
{
  "env": {
    "DATABASE_URL": {
      "value": "${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"
    },
    "DIRECT_URL": {
      "value": "${{addons.sabq-database.POSTGRES_URI_INTERNAL}}"
    }
  }
}
```

### 2. للتطوير المحلي (.env.local):
```env
# احصل على External URI من Northflank
DATABASE_URL="postgresql://user:pass@external-host.northflank.com:5432/db"
DIRECT_URL="postgresql://user:pass@external-host.northflank.com:5432/db"
```

## 🚀 خطوات النشر الصحيحة

1. **لا تضع** URI في الكود مباشرة
2. **استخدم** متغيرات البيئة في Northflank
3. **الرجوع** للمتغيرات الديناميكية:
   ```
   ${{addons.sabq-database.POSTGRES_URI_INTERNAL}}
   ```

## 🔧 اختبار الاتصال من داخل Northflank

أنشئ Job بسيط للاختبار:

```javascript
// test-internal-connection.js
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Connected:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
```

ثم شغّله كـ Job في Northflank للتأكد من عمل الاتصال الداخلي.
