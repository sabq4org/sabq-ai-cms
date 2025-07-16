#!/bin/bash

# حفظ نسخة احتياطية
cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)

# تحديث DATABASE_URL إلى Supabase
sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres"|' .env.local

echo "✅ تم تحديث DATABASE_URL إلى Supabase"
echo "📋 القيمة الجديدة:"
grep DATABASE_URL .env.local | head -1 