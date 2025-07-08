#!/bin/bash

# سكريبت لمراقبة حالة واس API
# يمكن تشغيله دورياً للتحقق من عودة الخدمة

echo "🔍 مراقبة حالة واس API..."
echo "اضغط Ctrl+C للإيقاف"
echo ""

API_KEY="owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
CLIENT_NAME="SABQ"
CLIENT_KEY="olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="

check_api() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - جاري الفحص..."
    
    # فحص Get_Status
    STATUS_RESPONSE=$(curl -s -X GET "https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Status" \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"client_name_TXT\": \"$CLIENT_NAME\", \"client_key_TXT\": \"$CLIENT_KEY\"}")
    
    if echo "$STATUS_RESPONSE" | grep -q "Active Client"; then
        echo "✅ Get_Status: نشط"
    else
        echo "❌ Get_Status: فشل"
    fi
    
    # فحص Get_Next_News
    NEWS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Next_News" \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"Client\": {
                \"client_name_TXT\": \"$CLIENT_NAME\",
                \"client_key_TXT\": \"$CLIENT_KEY\"
            },
            \"last_news_CD\": 0,
            \"basket_CD\": 4,
            \"IS_recived\": false,
            \"IS_load_media\": true
        }")
    
    if [ "$NEWS_STATUS" = "200" ]; then
        echo "✅ Get_Next_News: يعمل!"
        echo "🎉 واس API يعمل الآن!"
        # يمكن إضافة تنبيه صوتي هنا
        say "واس API يعمل الآن" 2>/dev/null || echo -e "\a"
        exit 0
    else
        echo "❌ Get_Next_News: خطأ $NEWS_STATUS"
    fi
    
    echo "---"
}

# فحص كل 5 دقائق
while true; do
    check_api
    sleep 300  # 5 دقائق
done 