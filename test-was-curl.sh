#!/bin/bash

# بيانات المصادقة
API_KEY="owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP"
CUSTOMER_KEY="olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
BASE_URL="https://nwdistapi.spa.gov.sa"

echo "🚀 اختبار API وكالة الأنباء السعودية"
echo "============================================================"
echo "⏰ الوقت: $(date)"
echo "============================================================"

# 1. اختبار GetStatus - بنفس الطريقة التي نجحت في Python
echo -e "\n1️⃣ اختبار GetStatus..."
echo "📍 GET $BASE_URL/ClientAppV1/GetStatus"

curl -X GET "$BASE_URL/ClientAppV1/GetStatus" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "User-Agent: SPA-API-Tester/2.0" \
  -H "Accept: application/json" \
  -H "Accept-Language: ar,en" \
  -H "Accept-Encoding: gzip, deflate" \
  -w "\n📊 Status Code: %{http_code}\n⏱️ Time: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "📄 Response: $(cat)"

# 2. اختبار GetStatus مع بيانات JSON في body (قد يكون هذا المطلوب)
echo -e "\n2️⃣ اختبار GetStatus مع body..."
echo "📍 GET $BASE_URL/ClientAppV1/GetStatus (with JSON body)"

curl -X GET "$BASE_URL/ClientAppV1/GetStatus" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "User-Agent: SPA-API-Tester/2.0" \
  -d '{
    "clientName": "TestClient",
    "clientKey": "TestKey123",
    "languageId": 1
  }' \
  -w "\n📊 Status Code: %{http_code}\n⏱️ Time: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "📄 Response: $(cat)"

# 3. اختبار GetBaskets
echo -e "\n3️⃣ اختبار GetBaskets..."
echo "📍 GET $BASE_URL/ClientAppV1/GetBaskets"

curl -X GET "$BASE_URL/ClientAppV1/GetBaskets" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "User-Agent: SPA-API-Tester/2.0" \
  -d '{
    "clientName": "TestClient",
    "clientKey": "TestKey123",
    "languageId": 1
  }' \
  -w "\n📊 Status Code: %{http_code}\n⏱️ Time: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "📄 Response: $(cat)"

# 4. اختبار GetNextNews
echo -e "\n4️⃣ اختبار GetNextNews..."
echo "📍 GET $BASE_URL/ClientAppV1/GetNextNews"

curl -X GET "$BASE_URL/ClientAppV1/GetNextNews" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "User-Agent: SPA-API-Tester/2.0" \
  -d '{
    "Client": {
      "ClientName": "TestClient",
      "ClientKey": "TestKey123",
      "LanguageId": 1
    },
    "LastNewsId": 0,
    "BasketId": 1,
    "IsRecived": false,
    "LoadMedia": false
  }' \
  -w "\n📊 Status Code: %{http_code}\n⏱️ Time: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "📄 Response: $(cat)"

echo -e "\n============================================================"
echo "✅ انتهى الاختبار"
echo "============================================================" 