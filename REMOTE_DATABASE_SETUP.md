# إعداد قاعدة البيانات البعيدة

## 🔍 تحديد موقع قاعدة البيانات

### احتمال 1: قاعدة البيانات على خادم الاستضافة
إذا كانت قاعدة البيانات على نفس خادم الموقع (jur3a.ai):

```env
# في .env.local
DB_HOST=localhost  # للتطوير المحلي مع SSH tunnel
DB_PORT=3306
DB_NAME=j3uar_sabq_db
DB_USER=j3uar_sabq_user
DB_PASSWORD=hugsiP-tiswaf-vitte2

# في .env.production
DB_HOST=localhost  # على الخادم نفسه
```

### احتمال 2: قاعدة البيانات على خادم منفصل
احصل على معلومات الخادم من شركة الاستضافة:

```env
DB_HOST=mysql.yourhost.com  # أو IP مثل 192.168.1.100
DB_PORT=3306
DB_NAME=j3uar_sabq_db
DB_USER=j3uar_sabq_user
DB_PASSWORD=hugsiP-tiswaf-vitte2
```

## 🌐 للتطوير المحلي مع قاعدة بيانات بعيدة

### الخيار 1: SSH Tunnel (الأكثر أماناً)
```bash
# افتح SSH tunnel إلى الخادم
ssh -L 3306:localhost:3306 user@jur3a.ai

# اترك النافذة مفتوحة واستخدم localhost في .env.local
```

### الخيار 2: الاتصال المباشر
1. اطلب من الاستضافة السماح بالاتصال الخارجي
2. أضف IP جهازك إلى whitelist
3. استخدم عنوان الخادم الحقيقي في DB_HOST

## 📝 معلومات مطلوبة من شركة الاستضافة

أرسل هذا للدعم الفني:

```
مرحباً،

أحتاج المعلومات التالية لقاعدة البيانات MySQL:

1. Database Host/Server (العنوان الكامل أو IP)
2. Port Number (إذا كان غير 3306)
3. هل يُسمح بالاتصال الخارجي؟
4. هل أحتاج إضافة IP للـ whitelist؟
5. هل يتوفر phpMyAdmin أو أداة إدارة؟

قاعدة البيانات: j3uar_sabq_db
المستخدم: j3uar_sabq_user

شكراً لكم
```

## 🛠️ البدائل للتطوير المحلي

### 1. استخدام قاعدة بيانات محلية للتطوير
```bash
# تثبيت MySQL محلياً
brew install mysql  # على macOS

# إنشاء قاعدة بيانات محلية
mysql -u root -p
CREATE DATABASE sabq_dev;
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL ON sabq_dev.* TO 'dev_user'@'localhost';
```

### 2. استخدام Docker
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: sabq_dev
      MYSQL_USER: dev_user
      MYSQL_PASSWORD: dev_password
      MYSQL_ROOT_PASSWORD: root_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

```bash
# تشغيل MySQL في Docker
docker-compose up -d
```

## 🔐 الأمان

### نصائح مهمة:
1. **لا تستخدم** قاعدة البيانات الإنتاجية للتطوير
2. **استخدم** SSH tunnel عند الاتصال بخوادم بعيدة
3. **احم** بيانات الاتصال ولا تشاركها
4. **فعّل** SSL/TLS للاتصالات الإنتاجية

## 📊 اختبار الاتصال بعد الإعداد

```bash
# مع المعلومات الصحيحة
node scripts/test-db-connection.js

# أو استخدم mysql CLI
mysql -h [HOST] -P [PORT] -u j3uar_sabq_user -p j3uar_sabq_db
```

---

*ملاحظة: تحتاج معرفة موقع قاعدة البيانات الحقيقي من شركة الاستضافة* 