#!/usr/bin/env node

/**
 * سكريبت للتحقق من مشكلة المقال 500
 * Article 500 Error Debug Script
 */

const https = require('https');

const ARTICLE_ID = '46594dc4-f022-40c9-bfc8-2e92005c29e1';
const PRODUCTION_URL = 'https://sabq.io';

async function checkArticle() {
  console.log('\n🔍 فحص المقال:', ARTICLE_ID);
  console.log('═'.repeat(60) + '\n');

  const checks = [
    {
      name: 'واجهة API المقال',
      url: `${PRODUCTION_URL}/api/articles/${ARTICLE_ID}`,
    },
    {
      name: 'صفحة المقال',
      url: `${PRODUCTION_URL}/article/${ARTICLE_ID}`,
    },
    {
      name: 'البحث عن المقال',
      url: `${PRODUCTION_URL}/api/articles?id=${ARTICLE_ID}`,
    }
  ];

  for (const check of checks) {
    console.log(`⏳ فحص ${check.name}...`);
    
    try {
      const result = await fetchUrl(check.url);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${check.name}: نجح (${result.status})`);
        
        // عرض بعض البيانات إذا كانت JSON
        if (result.headers['content-type']?.includes('application/json')) {
          try {
            const data = JSON.parse(result.body);
            if (data.id || data.article) {
              console.log('   - العنوان:', data.title || data.article?.title || 'غير متوفر');
              console.log('   - الحالة:', data.status || data.article?.status || 'غير متوفر');
            }
          } catch (e) {
            // ليس JSON
          }
        }
      } else {
        console.log(`❌ ${check.name}: فشل (${result.status})`);
        console.log('   - الخطأ:', result.body.substring(0, 200));
      }
    } catch (error) {
      console.log(`❌ ${check.name}: خطأ في الاتصال`);
      console.log('   - الخطأ:', error.message);
    }
    
    console.log();
  }

  // التوصيات
  console.log('═'.repeat(60));
  console.log('\n💡 التوصيات:\n');
  console.log('1. تحقق من وجود المقال في قاعدة البيانات');
  console.log('2. تحقق من حالة المقال (published/draft)');
  console.log('3. تحقق من سجلات الخطأ في السيرفر');
  console.log('4. تحقق من متغيرات البيئة DATABASE_URL');
  console.log('\n✨ انتهى الفحص!\n');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on('error', reject);
  });
}

// تشغيل السكريبت
checkArticle().catch(console.error); 