#!/usr/bin/env node

const https = require('https');

// URL الموقع في الإنتاج
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://sabq-ai-cms-fkfn8.ondigitalocean.app';

// ألوان للطرفية
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// دالة لإجراء طلب HTTP
async function makeRequest(path) {
  return new Promise((resolve) => {
    const url = `${PRODUCTION_URL}${path}`;
    console.log(`${colors.blue}🔍 اختبار: ${url}${colors.reset}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 0,
        error: err.message
      });
    });
  });
}

// دالة لتحليل JSON بأمان
function tryParseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// دالة رئيسية
async function checkProductionAPIs() {
  console.log(`${colors.cyan}🚀 فحص APIs في الإنتاج${colors.reset}`);
  console.log(`${colors.cyan}📍 URL: ${PRODUCTION_URL}${colors.reset}`);
  console.log('='.repeat(60));
  
  // قائمة APIs للفحص
  const endpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/articles?status=published&limit=5', name: 'Articles API' },
    { path: '/api/news/latest?limit=5', name: 'Latest News API' },
    { path: '/api/categories', name: 'Categories API' },
    { path: '/api/check-env', name: 'Environment Check' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n${colors.yellow}📋 ${endpoint.name}${colors.reset}`);
    
    const result = await makeRequest(endpoint.path);
    
    if (result.error) {
      console.log(`${colors.red}❌ خطأ في الاتصال: ${result.error}${colors.reset}`);
      continue;
    }
    
    console.log(`${colors.blue}📊 الحالة: ${result.statusCode}${colors.reset}`);
    
    if (result.statusCode === 200) {
      console.log(`${colors.green}✅ نجح${colors.reset}`);
      
      const json = tryParseJSON(result.data);
      if (json) {
        // عرض معلومات مفيدة
        if (json.articles) {
          console.log(`${colors.cyan}   - عدد المقالات: ${json.articles.length}${colors.reset}`);
        }
        if (json.data && Array.isArray(json.data)) {
          console.log(`${colors.cyan}   - عدد العناصر: ${json.data.length}${colors.reset}`);
        }
        if (json.categories) {
          console.log(`${colors.cyan}   - عدد التصنيفات: ${json.categories.length}${colors.reset}`);
        }
        if (json.database) {
          console.log(`${colors.cyan}   - قاعدة البيانات: ${json.database}${colors.reset}`);
        }
      } else if (result.headers['content-type']?.includes('text/html')) {
        console.log(`${colors.yellow}   ⚠️  الاستجابة HTML (قد يكون خطأ 404)${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ فشل${colors.reset}`);
      
      // محاولة عرض رسالة الخطأ
      const json = tryParseJSON(result.data);
      if (json && json.error) {
        console.log(`${colors.red}   - الخطأ: ${json.error}${colors.reset}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // فحص إضافي للصفحة الرئيسية
  console.log(`\n${colors.yellow}🏠 فحص الصفحة الرئيسية${colors.reset}`);
  const homePage = await makeRequest('/');
  
  if (homePage.statusCode === 200) {
    console.log(`${colors.green}✅ الصفحة الرئيسية تعمل${colors.reset}`);
    
    // البحث عن مؤشرات المشاكل
    if (homePage.data.includes('جاري تحميل المقالات')) {
      console.log(`${colors.yellow}   ⚠️  رسالة "جاري تحميل المقالات" موجودة${colors.reset}`);
    }
    if (homePage.data.includes('500') || homePage.data.includes('Internal Server Error')) {
      console.log(`${colors.red}   ❌ خطأ خادم داخلي${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ الصفحة الرئيسية لا تعمل${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}✨ اكتمل الفحص${colors.reset}`);
}

// تشغيل الفحص
checkProductionAPIs().catch(console.error); 