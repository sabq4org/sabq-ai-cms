#!/bin/bash

# سكريبت اختبار API بعد النشر على الإنتاج
# يجب تشغيله بعد النشر للتأكد من أن كل شيء يعمل

# ألوان للإخراج
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# متغيرات
if [ -z "$1" ]; then
    echo "استخدام: ./test-production-api.sh https://your-app.ondigitalocean.app"
    exit 1
fi

API_URL="$1"
echo -e "${YELLOW}🔍 اختبار API على: $API_URL${NC}"
echo "========================================="

# 1. اختبار Health Check
echo -e "\n${YELLOW}1. اختبار Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health")
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

# 2. اختبار جلب التصنيفات
echo -e "\n${YELLOW}2. اختبار جلب التصنيفات...${NC}"
CATEGORIES_RESPONSE=$(curl -s "$API_URL/api/categories")
echo "Response preview: $(echo $CATEGORIES_RESPONSE | head -c 200)..."

if echo "$CATEGORIES_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Categories API working${NC}"
else
    echo -e "${RED}❌ Categories API failed${NC}"
fi

# 3. اختبار تسجيل مستخدم جديد (اختياري)
echo -e "\n${YELLOW}3. اختبار تسجيل مستخدم جديد...${NC}"
RANDOM_EMAIL="test_$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123456\"}")

echo "Response: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Registration API working${NC}"
    
    # 4. اختبار تسجيل الدخول
    echo -e "\n${YELLOW}4. اختبار تسجيل الدخول...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123456\"}" \
      -v 2>&1)
    
    if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Login API working${NC}"
    else
        echo -e "${RED}❌ Login API failed${NC}"
        echo "Full response:"
        echo "$LOGIN_RESPONSE"
    fi
else
    echo -e "${RED}❌ Registration API failed${NC}"
fi

# 5. اختبار CORS headers
echo -e "\n${YELLOW}5. اختبار CORS headers...${NC}"
CORS_TEST=$(curl -s -I -X OPTIONS "$API_URL/api/categories" | grep -i "access-control")
echo "$CORS_TEST"

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

# 6. ملخص النتائج
echo -e "\n${YELLOW}=========================================${NC}"
echo -e "${YELLOW}📊 ملخص النتائج:${NC}"
echo -e "${YELLOW}=========================================${NC}"

# عد الاختبارات الناجحة
PASSED=$(echo -e "$0" | grep -c "✅")
FAILED=$(echo -e "$0" | grep -c "❌")

echo -e "الاختبارات الناجحة: ${GREEN}$PASSED${NC}"
echo -e "الاختبارات الفاشلة: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 جميع الاختبارات نجحت!${NC}"
else
    echo -e "\n${RED}⚠️  بعض الاختبارات فشلت. يرجى مراجعة السجلات.${NC}"
fi 