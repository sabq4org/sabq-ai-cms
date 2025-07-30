#!/usr/bin/env node

/**
 * 🔍 فحص حالة الصور على موقع الإنتاج
 */

const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function checkImages() {
  console.log('🔍 فحص حالة الصور على موقع الإنتاج...\n');
  
  try {
    // 1. فحص API المقالات
    console.log('📰 فحص صور المقالات...');
    const articlesRes = await fetchUrl('https://sabq.me/api/articles?limit=5');
    const articles = JSON.parse(articlesRes.data);
    
    if (articles.success && articles.articles) {
      for (const article of articles.articles) {
        if (article.featured_image) {
          console.log(`\n📄 ${article.title.substring(0, 50)}...`);
          console.log(`   🔗 ${article.featured_image.substring(0, 80)}...`);
          
          // فحص الصورة
          try {
            const imageRes = await fetchUrl(article.featured_image);
            if (imageRes.status === 200) {
              console.log(`   ✅ الصورة تعمل`);
            } else {
              console.log(`   ❌ خطأ: ${imageRes.status}`);
            }
          } catch (error) {
            console.log(`   ❌ فشل الوصول للصورة: ${error.message}`);
          }
        }
      }
    }
    
    // 2. فحص صور التصنيفات
    console.log('\n\n📁 فحص صور التصنيفات...');
    const categoriesRes = await fetchUrl('https://sabq.me/api/categories');
    const categories = JSON.parse(categoriesRes.data);
    
    if (categories.success && categories.categories) {
      for (const category of categories.categories) {
        const imageUrl = category.metadata?.image_url || category.metadata?.cover_image;
        if (imageUrl) {
          console.log(`\n📂 ${category.name}`);
          console.log(`   🔗 ${imageUrl.substring(0, 80)}...`);
          
          // فحص الصورة
          try {
            const imageRes = await fetchUrl(imageUrl);
            if (imageRes.status === 200) {
              console.log(`   ✅ الصورة تعمل`);
            } else {
              console.log(`   ❌ خطأ: ${imageRes.status}`);
            }
          } catch (error) {
            console.log(`   ❌ فشل الوصول للصورة: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n\n📊 ملخص الفحص:');
    console.log('  - إذا ظهرت أخطاء 403: مشكلة في صلاحيات S3');
    console.log('  - إذا ظهرت أخطاء 404: الصورة غير موجودة');
    console.log('  - إذا ظهرت رسائل "فشل الوصول": مشكلة في الرابط أو CORS');
    
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  }
}

// تشغيل الفحص
checkImages(); 