# 🚢 دليل AWS Lightsail - الحل الأسهل

## لماذا Lightsail؟
- ✅ من Amazon (تبقى في AWS)
- ✅ أسهل بكثير من EC2
- ✅ سعر ثابت شهري ($10-$20)
- ✅ يشمل كل شيء (IP, SSL, Storage)
- ✅ مثل DigitalOcean لكن من Amazon

## 📋 خطوات النشر (20 دقيقة):

### 1️⃣ **إنشاء Instance:**
1. اذهب إلى https://lightsail.aws.amazon.com
2. اضغط "Create instance"
3. اختر:
   - Platform: **Linux/Unix**
   - Blueprint: **Node.js**
   - Instance plan: **$10 شهرياً** (2GB RAM كافي)
   - Instance name: **sabq-ai-cms**
4. اضغط "Create instance"

### 2️⃣ **الاتصال بالسيرفر:**
1. انتظر دقيقة حتى يعمل
2. اضغط على "Connect using SSH" في المتصفح
3. أو استخدم SSH key للاتصال من Terminal

### 3️⃣ **إعداد المشروع:**
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# Clone المشروع
cd /home/bitnami
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms

# تثبيت التبعيات
npm install

# إنشاء ملف .env
cat > .env << EOL
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=http://YOUR-LIGHTSAIL-IP:3000
EOL

# البناء
npm run build

# التشغيل
pm2 start npm --name sabq-ai-cms -- start
pm2 save
pm2 startup
```

### 4️⃣ **فتح المنافذ:**
1. في Lightsail Console
2. اضغط على instance
3. اذهب إلى "Networking"
4. أضف rule:
   - Application: **Custom**
   - Protocol: **TCP**
   - Port: **3000**

### 5️⃣ **الوصول للموقع:**
```
http://YOUR-LIGHTSAIL-IP:3000
```

### 6️⃣ **إضافة Domain (اختياري):**
1. في Lightsail → Networking → Create static IP
2. Attach للـ instance
3. في Lightsail → Domains → Create DNS zone
4. أضف A record يشير للـ static IP

### 7️⃣ **إضافة SSL (اختياري):**
```bash
# تثبيت Nginx
sudo apt install nginx -y

# تثبيت Certbot
sudo snap install certbot --classic

# إعداد Nginx
sudo nano /etc/nginx/sites-available/sabq

# أضف:
server {
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sabq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# الحصول على SSL
sudo certbot --nginx -d your-domain.com
```

## 🎯 المزايا:
- ✅ سهل جداً (أسهل من EC2)
- ✅ رخيص ($10 شهرياً)
- ✅ من Amazon
- ✅ يدعم Prisma 100%
- ✅ لوحة تحكم بسيطة
- ✅ Snapshots تلقائية

## 📊 مقارنة Lightsail مع الباقي:
- **أسهل من**: EC2, Elastic Beanstalk
- **أرخص من**: App Runner, Elastic Beanstalk
- **أقوى من**: Amplify (لـ Prisma)
- **مثل**: DigitalOcean Droplet

## ⚡ نصيحة أخيرة:
Lightsail = EC2 مبسط + سعر ثابت + كل شيء جاهز
مثالي لمشروعك! 