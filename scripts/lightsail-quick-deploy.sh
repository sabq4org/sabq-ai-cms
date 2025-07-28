#!/bin/bash

# سكريبت النشر السريع على AWS Lightsail
echo "🚀 بدء النشر السريع على AWS Lightsail..."

# الأوامر للنسخ واللصق في Lightsail SSH
cat << 'EOF'
# ========================================
# نسخ هذه الأوامر والصقها في Lightsail SSH
# ========================================

# 1. تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. تثبيت PM2
sudo npm install -g pm2

# 3. Clone المشروع
cd ~
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms
git checkout production-branch

# 4. تثبيت التبعيات
npm install

# 5. إنشاء ملف البيئة
cat > .env << 'ENV_END'
DATABASE_URL=postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms
NEXTAUTH_SECRET=sabq-ai-cms-secret-key-2025
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=production
ENV_END

# 6. البناء
npm run build

# 7. التشغيل
pm2 start npm --name sabq-ai-cms -- start

# 8. حفظ PM2
pm2 save
pm2 startup

# 9. فتح المنفذ 3000
echo "✅ تم! الموقع يعمل على http://YOUR-LIGHTSAIL-IP:3000"
echo "🔧 لا تنسَ فتح المنفذ 3000 من Lightsail Console"

# ========================================
EOF 