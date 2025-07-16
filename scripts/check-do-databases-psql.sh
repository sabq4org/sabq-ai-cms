#!/bin/bash

echo "التحقق من قواعد البيانات في DigitalOcean..."

# Connection Pool (defaultdb)
echo -e "\n============================================================"
echo "التحقق من: Connection Pool (defaultdb)"
echo "============================================================"

export PGPASSWORD='AVNS_Br4uKMaWR6wxTIpZ7xj'

psql -h db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com \
     -p 25060 \
     -U doadmin \
     -d defaultdb \
     --set=sslmode=require \
     -c "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null || echo "❌ فشل الاتصال بـ defaultdb"

psql -h db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com \
     -p 25060 \
     -U doadmin \
     -d defaultdb \
     --set=sslmode=require \
     -c "SELECT COUNT(*) as article_count FROM articles;" 2>/dev/null

psql -h db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com \
     -p 25060 \
     -U doadmin \
     -d defaultdb \
     --set=sslmode=require \
     -c "SELECT email, name FROM users LIMIT 5;" 2>/dev/null

# Private connection (sabq_app_pool)
echo -e "\n============================================================"
echo "التحقق من: Private (sabq_app_pool)"
echo "============================================================"

# محاولة الاتصال بـ sabq_app_pool
psql -h private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com \
     -p 25061 \
     -U doadmin \
     -d sabq_app_pool \
     --set=sslmode=require \
     -c "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null || echo "❌ فشل الاتصال بـ sabq_app_pool (متوقع - اتصال خاص)"

# محاولة سرد قواعد البيانات المتاحة
echo -e "\n============================================================"
echo "قواعد البيانات المتاحة:"
echo "============================================================"

psql -h db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com \
     -p 25060 \
     -U doadmin \
     -d defaultdb \
     --set=sslmode=require \
     -c "\l" 2>/dev/null | grep -E "sabq|defaultdb|Name" 