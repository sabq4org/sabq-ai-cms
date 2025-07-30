#!/usr/bin/env node

/**
 * فحص المشاكل على الموقع المباشر
 */

const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://sabq.me';

async function checkAPI(endpoint, description) {
  console.log(`\n🔍 فحص ${description}...`);
  
  try {
    const response = await fetch(`${PRODUCTION_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SabqChecker/1.0)'
      }
    });
    
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    console.log(`   📊 الحالة: ${status}`);
    console.log(`   📄 نوع المحتوى: ${contentType}`);
    
    if (status === 200 && contentType?.includes('application/json')) {
      const data = await response.json();
      
      if (Array.isArray(data)) {
        console.log(`   ✅ عدد العناصر: ${data.length}`);
        
        // فحص الصور في أول 3 عناصر
        if (data.length > 0 && endpoint.includes('articles')) {
          console.log(`   🖼️ فحص الصور:`);
          data.slice(0, 3).forEach((item, index) => {
            const imageUrl = item.featured_image || item.image || item.metadata?.image;
            console.log(`      ${index + 1}. ${imageUrl ? imageUrl.substring(0, 80) + '...' : '❌ لا توجد صورة'}`);
          });
        }
      } else {
        console.log(`   ℹ️ نوع البيانات: ${typeof data}`);
      }
    } else {
      console.log(`   ❌ فشل الطلب`);
    }
  } catch (error) {
    console.log(`   ❌ خطأ: ${error.message}`);
  }
}

async function checkProductionSite() {
  console.log('🔍 فحص الموقع المباشر: ' + PRODUCTION_URL);
  console.log('=' .repeat(60));
  
  // فحص الصفحة الرئيسية
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    // فحص وجود رسائل الخطأ
    if (html.includes('لا توجد تصنيفات متاحة')) {
      console.log('\n⚠️ تحذير: رسالة "لا توجد تصنيفات متاحة" موجودة على الصفحة');
    }
    
    // فحص عدد الصور
    const imageMatches = html.match(/<img[^>]+src="([^"]+)"/g) || [];
    console.log(`\n📸 عدد الصور على الصفحة: ${imageMatches.length}`);
    
    // فحص أنواع الصور
    const placeholderImages = imageMatches.filter(img => 
      img.includes('placeholder') || 
      img.includes('default') ||
      img.includes('fallback')
    );
    
    console.log(`   🖼️ صور placeholder: ${placeholderImages.length}`);
    console.log(`   📷 صور حقيقية: ${imageMatches.length - placeholderImages.length}`);
    
    // فحص البطاقات المخصصة
    const smartCards = html.match(/smart-content-news-card/g) || [];
    console.log(`\n🎯 عدد البطاقات المخصصة: ${smartCards.length}`);
    
  } catch (error) {
    console.log(`\n❌ خطأ في فحص الصفحة الرئيسية: ${error.message}`);
  }
  
  // فحص APIs
  await checkAPI('/api/categories?is_active=true', 'API التصنيفات');
  await checkAPI('/api/articles?status=published&limit=10', 'API المقالات');
  await checkAPI('/api/smart-recommendations', 'API التوصيات الذكية');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ اكتمل الفحص\n');
}

// تشغيل الفحص
checkProductionSite().catch(console.error); 