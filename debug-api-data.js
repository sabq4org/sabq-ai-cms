#!/usr/bin/env node

/**
 * أداة فحص البيانات الفعلية من API الأخبار المميزة
 * Featured News API Data Inspector Tool
 */

const https = require('https');
const http = require('http');

console.log('🔍 فحص بيانات API الأخبار المميزة...\n');

// قراءة متغيرات البيئة
require('dotenv').config();

// URLs للفحص
const apiUrls = [
  'http://localhost:3000/api/featured-news',
  'https://sabq.io/api/featured-news',
  // يمكن إضافة URLs أخرى حسب البيئة
];

// فحص URL
function checkAPI(url) {
  return new Promise((resolve) => {
    console.log(`🌐 فحص: ${url}`);
    
    const protocol = url.startsWith('https:') ? https : http;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            url,
            status: res.statusCode,
            success: res.statusCode === 200,
            data: jsonData,
            error: null
          });
        } catch (parseError) {
          resolve({
            url,
            status: res.statusCode,
            success: false,
            data: null,
            error: 'Parse Error: ' + parseError.message,
            rawData: data.substring(0, 500) // أول 500 حرف للتشخيص
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        success: false,
        error: error.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        success: false,
        error: 'Request timeout',
        data: null
      });
    });
  });
}

// تحليل البيانات
function analyzeData(result) {
  if (!result.success) {
    console.log(`   ❌ فشل: ${result.error}`);
    if (result.rawData) {
      console.log(`   📄 البيانات الخام: ${result.rawData}`);
    }
    return;
  }

  console.log(`   ✅ نجح (${result.status})`);
  
  if (!result.data) {
    console.log('   ⚠️ لا توجد بيانات');
    return;
  }

  // تحليل هيكل البيانات
  if (Array.isArray(result.data)) {
    console.log(`   📊 نوع البيانات: مصفوفة من ${result.data.length} عنصر`);
    
    if (result.data.length > 0) {
      const firstArticle = result.data[0];
      console.log(`   🏷️ خصائص المقال الأول:`, Object.keys(firstArticle));
      
      // فحص featured_image
      if (firstArticle.featured_image) {
        console.log(`   🖼️ صورة المقال الأول: ${firstArticle.featured_image}`);
        console.log(`   📏 طول URL: ${firstArticle.featured_image.length} حرف`);
        
        // فحص نوع الصورة
        const imageUrl = firstArticle.featured_image;
        if (imageUrl.includes('cloudinary.com')) {
          console.log(`   ☁️ نوع الصورة: Cloudinary`);
        } else if (imageUrl.includes('s3.amazonaws.com')) {
          console.log(`   📦 نوع الصورة: AWS S3`);
        } else if (imageUrl.includes('ui-avatars.com')) {
          console.log(`   👤 نوع الصورة: UI Avatars (Fallback)`);
        } else if (imageUrl.startsWith('/')) {
          console.log(`   🏠 نوع الصورة: محلية`);
        } else if (imageUrl.includes('http')) {
          console.log(`   🌐 نوع الصورة: خارجية`);
        } else {
          console.log(`   ❓ نوع الصورة: غير معروف`);
        }
        
        // فحص صحة URL
        try {
          new URL(imageUrl.startsWith('/') ? `https://sabq.io${imageUrl}` : imageUrl);
          console.log(`   ✅ URL الصورة صحيح`);
        } catch {
          console.log(`   ❌ URL الصورة غير صحيح`);
        }
      } else {
        console.log(`   ❌ لا توجد featured_image في المقال الأول`);
      }

      // فحص العنوان
      if (firstArticle.title) {
        console.log(`   📰 عنوان المقال الأول: "${firstArticle.title.substring(0, 50)}..."`);
      } else {
        console.log(`   ❌ لا يوجد عنوان في المقال الأول`);
      }
    }
  } else if (typeof result.data === 'object') {
    console.log(`   📊 نوع البيانات: كائن`);
    console.log(`   🏷️ خصائص الكائن:`, Object.keys(result.data));
    
    // فحص إذا كان هناك خاصية articles أو data
    if (result.data.articles && Array.isArray(result.data.articles)) {
      console.log(`   📚 مقالات في الكائن: ${result.data.articles.length}`);
    } else if (result.data.data && Array.isArray(result.data.data)) {
      console.log(`   📚 مقالات في data: ${result.data.data.length}`);
    }
  } else {
    console.log(`   ❓ نوع البيانات غير متوقع: ${typeof result.data}`);
  }
}

// تشغيل الفحص
async function runInspection() {
  console.log('🚀 بدء فحص APIs...\n');
  
  for (const url of apiUrls) {
    const result = await checkAPI(url);
    analyzeData(result);
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  console.log('📝 توصيات للإصلاح:');
  console.log('='.repeat(50));
  console.log('1. تأكد من أن الخادم المحلي يعمل (npm run dev)');
  console.log('2. تحقق من أن API يعيد بيانات صحيحة');
  console.log('3. فحص featured_image URLs في قاعدة البيانات');
  console.log('4. تأكد من أن Cloudinary يعمل بشكل صحيح');
  console.log('5. فحص console.log في المتصفح للأخطاء');
  console.log('\n✅ انتهى الفحص');
}

// تشغيل الأداة
runInspection().catch(console.error);
