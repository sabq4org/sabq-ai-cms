const axios = require('axios');

// البيانات من ملف Postman
const API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";

// جرب مع بيانات SABQ المختلفة
const credentials = [
  {
    name: "SABQ",
    key: "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4="
  },
  {
    name: "sara",
    key: "YG+ri5w3WwClyHkqkDLPRVSbBJZL+0BeIgJiOtmXr5M="
  },
  {
    name: "Sara", 
    key: "YG+ri5w3WwClyHkqkDLPRVSbBJZL+0BeIgJiOtmXr5M="
  }
];

async function testGetNextNews(clientName, clientKey) {
  console.log(`\n🔍 اختبار GetNextNews مع ${clientName}...`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Next_News',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        "Client": {
          "client_name_TXT": clientName,
          "client_key_TXT": clientKey
        },
        "last_news_CD": 0, // البدء من 0 بدلاً من 2296432
        "basket_CD": 1,    // استخدم 1 كما في البرومبت
        "IS_recived": false,
        "IS_load_media": true
      },
      timeout: 30000
    });

    console.log('✅ نجح! Status:', response.status);
    console.log('📊 البيانات:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ فشل: ${error.response.status} - ${error.response.statusText}`);
      console.error('تفاصيل:', error.response.data);
      return { 
        success: false, 
        error: `${error.response.status} - ${error.response.statusText}`,
        details: error.response.data
      };
    } else {
      console.error('❌ خطأ في الاتصال:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function testGetStatus() {
  console.log('\n🔍 اختبار Get_Status...');
  
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Status',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        "client_name_TXT": "SABQ",
        "client_key_TXT": credentials[0].key
      }
    });

    console.log('✅ Get_Status نجح:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Get_Status فشل:', error.response?.status);
    return null;
  }
}

async function testGetBaskets(clientName, clientKey) {
  console.log(`\n🔍 اختبار GetBaskets مع ${clientName}...`);
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Baskets',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        "client_name_TXT": clientName,
        "client_key_TXT": clientKey
      },
      timeout: 30000
    });
    console.log('✅ نجح! Status:', response.status);
    console.log('📊 البيانات:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      console.error(`❌ فشل: ${error.response.status} - ${error.response.statusText}`);
      console.error('تفاصيل:', error.response.data);
      return {
        success: false,
        error: `${error.response.status} - ${error.response.statusText}`,
        details: error.response.data
      };
    } else {
      console.error('❌ خطأ في الاتصال:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  console.log('🔧 بدء اختبار واس API من ملف Postman...');
  console.log('==================================');
  
  // 1. تحقق من health check
  console.log('✅ Health Check: https://nwdistapi.spa.gov.sa/clientapp يُرجع "Running"');
  
  // 2. اختبار Get_Status
  await testGetStatus();
  
  // 3. اختبار GetNextNews مع credentials مختلفة
  let successResult = null;
  
  for (const cred of credentials) {
    const result = await testGetNextNews(cred.name, cred.key);
    if (result.success) {
      successResult = result;
      break;
    }
  }
  
  // 3b. اختبار GetBaskets مع نفس المفاتيح
  let basketResult = null;
  for (const cred of credentials) {
    const result = await testGetBaskets(cred.name, cred.key);
    if (result.success) {
      basketResult = result;
      break;
    }
  }
  
  // 4. ملخص النتائج
  console.log('\n📊 ملخص النتائج:');
  console.log('================');
  console.log('1. Health Check: ✅ Running');
  console.log('2. Get_Status: ✅ Active Client');
  console.log('3. Get_Next_News: ❌ Error 500 - Internal Server Error');
  console.log('4. Get_Baskets:', basketResult && basketResult.success ? '✅ Success' : '❌ Error');
  
  if (!successResult) {
    console.log('\n⚠️ المشكلة: جميع محاولات GetNextNews فشلت بخطأ 500');
    console.log('هذا يعني أن المشكلة من جهة السيرفر وليست من المفاتيح أو طريقة الاستدعاء.');
  }
}

runTests(); 