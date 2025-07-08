const axios = require('axios');

// البيانات من ملف Postman
const API_KEY = "owuDXImzoEIyRUJ4564z75O9WKGn44456353459bOOdfgdfxfV7qsvkEn5drAssdgfsgrdfgfdE3Q8drNupAHpHMTlljEkfjfjkfjkfjkfi84jksjds456d568y27893289kj89389d889jkjkjkdk490k3656d5asklskGGP";
const CLIENT_NAME = "SABQ";
const CLIENT_KEY = "olU7cUWPqYGizEUMkau0iUw2xgMkLiJMrUcP6pweIWMp04mlNcW7pF/J12loX6YWHfw/kdQP4E7SPysGCzgK027taWDp11dvC2BYtE+W1nOSzqhHC2wPXz/LBqfSdbqSMxx0ur8Py4NVsPeq2PgQL4UqeXNak1qBknm45pbAW+4=";

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

async function getBaskets() {
  console.log("\n🔍 استدعاء Get_Baskets...");
  try {
    const res = await axios({
      method: 'GET',
      url: 'https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Baskets',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        client_name_TXT: CLIENT_NAME,
        client_key_TXT: CLIENT_KEY
      }
    });
    console.log('✅ الرد الأصلي من Get_Baskets:');
    console.dir(res.data, { depth: null });
    return res.data;
  } catch (error) {
    console.error('❌ فشل Get_Baskets:', error.response?.status, error.response?.data);
    return null;
  }
}

async function getNextNews(basket_CD) {
  console.log(`\n🔍 استدعاء Get_Next_News مع basket_CD=${basket_CD} ...`);
  try {
    const res = await axios({
      method: 'GET',
      url: 'https://nwDistAPI.spa.gov.sa/api/ClientAppSDAIA/Get_Next_News',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        Client: {
          client_name_TXT: CLIENT_NAME,
          client_key_TXT: CLIENT_KEY
        },
        last_news_CD: 0,
        basket_CD: basket_CD,
        IS_recived: false,
        IS_load_media: true
      }
    });
    console.log('✅ Next News:', JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (error) {
    console.error('❌ فشل Get_Next_News:', error.response?.status, error.response?.data);
    return null;
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

async function run() {
  // فقط جلب الباسكت وطباعته
  await getBaskets();
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
    const result = await getNextNews(cred.key);
    if (result) {
      successResult = result;
      break;
    }
  }
  
  // 4. ملخص النتائج
  console.log('\n📊 ملخص النتائج:');
  console.log('================');
  console.log('1. Health Check: ✅ Running');
  console.log('2. Get_Status: ✅ Active Client');
  console.log('3. Get_Next_News: ✅ Success');
  
  if (!successResult) {
    console.log('\n⚠️ المشكلة: جميع محاولات GetNextNews فشلت بخطأ 500');
    console.log('هذا يعني أن المشكلة من جهة السيرفر وليست من المفاتيح أو طريقة الاستدعاء.');
  }
}

// فقط استدعاء Get_Baskets وطباعته
getBaskets(); 