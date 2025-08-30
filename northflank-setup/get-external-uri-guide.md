# 🔗 كيفية الحصول على External Database URI من Northflank

## خطوات بسيطة بالصور:

### 1️⃣ سجّل دخولك إلى Northflank
- اذهب إلى: https://app.northflank.com
- سجّل دخولك بحسابك

### 2️⃣ افتح مشروعك
- اضغط على مشروع **sabq-ai**

### 3️⃣ افتح قاعدة البيانات
- ابحث عن **sabq-database** (أو اسم قاعدة بياناتك)
- اضغط عليها لفتحها

### 4️⃣ اذهب إلى Connection Details
- ستجد تبويبات في الأعلى
- اضغط على **Connection**

### 5️⃣ ابحث عن External Connection
ستجد قسمين:
- **Internal connection** (للاستخدام داخل Northflank)
- **External connection** (للاستخدام من الخارج) ⬅️ هذا ما تحتاجه

### 6️⃣ انسخ External URI
يجب أن يكون بهذا الشكل:
```
postgresql://username:password@external-host.northflank.com:5432/database_name
```

⚠️ **ملاحظة**: قد يكون الـ host مختلف عن Internal URI

### 7️⃣ أضف IP في Whitelist
1. في نفس الصفحة، ابحث عن **IP Whitelist** أو **Allowed IPs**
2. اضغط على **Edit** أو **Add IP**
3. أضف واحد من هذه:
   - `0.0.0.0/0` - للسماح من أي مكان (للاختبار فقط!)
   - `YOUR_IP/32` - عنوان IP الخاص بك فقط (أكثر أماناً)

### 8️⃣ احفظ التغييرات
- اضغط **Save** أو **Update**
- انتظر 30 ثانية

## 🧪 اختبر الاتصال

```bash
# 1. احفظ External URI في متغير
export EXTERNAL_DB_URL="postgresql://..."

# 2. اختبر بـ psql
psql $EXTERNAL_DB_URL -c "SELECT NOW();"

# 3. أو استخدم السكريبت
DATABASE_URL=$EXTERNAL_DB_URL node northflank-setup/test-db-connection.js
```

## 🔒 نصائح أمنية

1. **لا تشارك** External URI مع أحد
2. **استخدمه** فقط للتطوير والاختبار
3. **أزل** IP من whitelist بعد الانتهاء
4. **للإنتاج** استخدم Internal URI دائماً

## ❓ أسئلة شائعة

**س: لماذا لا أجد External Connection؟**
ج: تأكد من أن قاعدة البيانات تسمح بالاتصالات الخارجية في الإعدادات

**س: الاتصال مازال يفشل بعد إضافة IP؟**
ج: انتظر دقيقة كاملة، وتأكد من أن IP صحيح

**س: هل يمكنني استخدام External URI في الإنتاج؟**
ج: لا يُنصح بذلك، استخدم Internal URI للأمان والأداء
