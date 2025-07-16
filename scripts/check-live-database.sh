#!/bin/bash

echo "🔍 فحص قاعدة البيانات على الموقع اللايف sabq.io..."
echo "================================================="

# فحص المقالات
echo -e "\n📰 فحص المقالات:"
curl -s https://sabq.io/api/articles | jq '.data | length' 2>/dev/null || echo "لا يمكن الوصول للـ API"

# فحص التصنيفات  
echo -e "\n📁 فحص التصنيفات:"
curl -s https://sabq.io/api/categories | jq '.data | length' 2>/dev/null || echo "لا يمكن الوصول للـ API"

# فحص المستخدمين (إذا كان متاحاً)
echo -e "\n👥 فحص المستخدمين:"
curl -s https://sabq.io/api/users | jq '.data | length' 2>/dev/null || echo "لا يمكن الوصول للـ API"

echo -e "\n================================================="
echo "✅ انتهى الفحص" 