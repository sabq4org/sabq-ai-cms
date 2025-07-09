#!/usr/bin/env node
/**
 * اختبار سريع لـ API وكالة الأنباء السعودية
 * يمكن تشغيله مباشرة: node test-was-api.js
 */

const https = require('https');

// بيانات المصادقة
const API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";
const CUSTOMER_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=";

// دالة لإجراء طلب HTTPS
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nwdistapi.spa.gov.sa',
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`\n📍 ${method} ${path}`);
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📄 Headers:`, res.headers);
        
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log(`✅ Response:`, JSON.stringify(jsonResponse, null, 2));
          resolve({ status: res.statusCode, data: jsonResponse });
        } catch (e) {
          console.log(`📄 Response (text):`, responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error:`, error);
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبار API وكالة الأنباء السعودية');
  console.log('=' .repeat(60));
  console.log(`⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`);
  console.log('=' .repeat(60));

  // 1. اختبار GetStatus
  console.log('\n1️⃣ اختبار GetStatus...');
  await makeRequest('/ClientAppV1/GetStatus');

  // 2. اختبار GetBaskets
  console.log('\n2️⃣ اختبار GetBaskets...');
  await makeRequest('/ClientAppV1/GetBaskets');

  // 3. اختبار GetNextNews مع GET
  console.log('\n3️⃣ اختبار GetNextNews (GET)...');
  await makeRequest('/ClientAppV1/GetNextNews?lastNewsId=0&basketId=1');

  // 4. اختبار GetNextNews مع POST
  console.log('\n4️⃣ اختبار GetNextNews (POST)...');
  await makeRequest('/ClientAppV1/GetNextNews', 'POST', {
    LastNewsId: 0,
    BasketId: 1,
    IsRecived: false,
    LoadMedia: true
  });

  // 5. اختبار GetNextNews مع Client object
  console.log('\n5️⃣ اختبار GetNextNews (POST مع Client)...');
  await makeRequest('/ClientAppV1/GetNextNews', 'POST', {
    Client: {
      ClientName: "SABQ",
      ClientKey: CUSTOMER_KEY,
      LanguageId: 1
    },
    LastNewsId: 0,
    BasketId: 1,
    IsRecived: false,
    LoadMedia: true
  });

  console.log('\n' + '=' .repeat(60));
  console.log('✅ انتهى الاختبار');
  console.log('=' .repeat(60));
}

// تشغيل الاختبارات
runTests().catch(console.error); 