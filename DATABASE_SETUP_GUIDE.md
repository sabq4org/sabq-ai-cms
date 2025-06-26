# دليل إعداد قاعدة البيانات

## الخيار 1: SQLite للتطوير المحلي (سريع وسهل)

### 1. تحديث .env
```env
# للتطوير المحلي
DATABASE_URL="file:./dev.db"
```

### 2. تحديث prisma/schema.prisma
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. توليد وإنشاء قاعدة البيانات
```bash
npx prisma generate
npx prisma db push
```

## الخيار 2: MySQL على خادم بعيد (للإنتاج)

### 1. احصل على معلومات الاتصال من cPanel
- Host: عادة اسم النطاق أو IP الخادم
- Username: j3uar_sabq_user
- Password: كلمة المرور الصحيحة
- Database: j3uar_sabq_db
- Port: عادة 3306

### 2. تحديث .env
```env
# استبدل your-server.com بعنوان الخادم الفعلي
DATABASE_URL="mysql://j3uar_sabq_user:password@your-server.com:3306/j3uar_sabq_db"
```

### 3. السماح بالاتصال عن بُعد
- تأكد من أن الخادم يسمح بالاتصالات الخارجية
- أضف IP جهازك في whitelist إذا لزم الأمر

## الخيار 3: تثبيت MySQL محلياً

### على macOS:
```bash
# تثبيت MySQL
brew install mysql

# تشغيل MySQL
brew services start mysql

# إنشاء قاعدة البيانات والمستخدم
mysql -u root -e "
CREATE DATABASE j3uar_sabq_db;
CREATE USER 'j3uar_sabq_user'@'localhost' IDENTIFIED BY 'hugsiP-tiswaf-vitte2';
GRANT ALL PRIVILEGES ON j3uar_sabq_db.* TO 'j3uar_sabq_user'@'localhost';
FLUSH PRIVILEGES;
"
```

## نصائح مهمة

### للتطوير:
- استخدم SQLite - سريع وبسيط
- لا يحتاج تثبيت أو إعداد

### للإنتاج:
- استخدم MySQL/PostgreSQL على خادم حقيقي
- Supabase أو PlanetScale خيارات ممتازة

### للاختبار:
- يمكنك استخدام Docker:
```bash
docker run -d \
  --name mysql-sabq \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=j3uar_sabq_db \
  -e MYSQL_USER=j3uar_sabq_user \
  -e MYSQL_PASSWORD=hugsiP-tiswaf-vitte2 \
  -p 3306:3306 \
  mysql:8.0
``` 