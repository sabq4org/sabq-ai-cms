#!/usr/bin/env node

/**
 * سكريبت مسح كاش الإنتاج
 * يستخدم لمسح الكاش في الموقع اللايف فوراً
 */

const fetch = require('node-fetch').default || require('node-fetch');

async function clearProductionCache() {
  console.log('🚀 بدء مسح كاش الإنتاج...\n');

  // URLs الإنتاج المحتملة
  const productionUrls = [
    'https://sabq-ai-cms.vercel.app', // Vercel
    'https://sabq.me',                // Domain مخصص
    'https://sabq.ai',                // Domain بديل
    'https://your-production-url.com' // غيّر هذا للرابط الصحيح
  ];

  const token = process.env.CACHE_CLEAR_SECRET || 'sabq-cache-clear-2025';

  for (const baseUrl of productionUrls) {
    try {
      console.log(`🔍 محاولة مسح الكاش من: ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/api/cache/production-clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'all',
          url: '/'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ نجح مسح الكاش من:', baseUrl);
        console.log('📋 الإجراءات المنفذة:', result.actions);
        console.log('⏰ الوقت:', result.timestamp);
        console.log('');
        break; // نجح، توقف عن المحاولة
      } else {
        console.log(`❌ فشل من ${baseUrl}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ خطأ في الاتصال بـ ${baseUrl}:`, error.message);
    }
  }

  console.log('\n🎯 **كيفية الاختبار:**');
  console.log('1. افتح الموقع في نافذة تصفح خاصة');
  console.log('2. اضغط Ctrl+F5 للتحديث القسري');
  console.log('3. تحقق من ظهور الخبر الجديد');
  console.log('\n📝 **إذا لم يظهر الخبر:**');
  console.log('- أضف ?v=' + Date.now() + ' في نهاية الرابط');
  console.log('- أو استخدم وضع التطوير للمطورين');
}

// إضافة طرق مختلفة للاستخدام
async function clearSpecificUrl(url) {
  console.log(`🎯 مسح كاش رابط محدد: ${url}`);
  
  const baseUrl = 'https://sabq.me'; // غيّر للرابط الصحيح
  const token = process.env.CACHE_CLEAR_SECRET || 'sabq-cache-clear-2025';

  try {
    const response = await fetch(`${baseUrl}/api/cache/production-clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'specific',
        url: url
      })
    });

    const result = await response.json();
    console.log('✅ نتيجة مسح الكاش:', result);
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

// معالجة arguments من command line
const args = process.argv.slice(2);

if (args.length > 0) {
  if (args[0] === '--url' && args[1]) {
    clearSpecificUrl(args[1]);
  } else if (args[0] === '--help') {
    console.log(`
🚀 استخدام سكريبت مسح كاش الإنتاج:

الاستخدامات:
  node scripts/clear-production-cache.js           # مسح كامل الكاش
  node scripts/clear-production-cache.js --url /   # مسح الصفحة الرئيسية
  node scripts/clear-production-cache.js --help    # عرض هذه المساعدة

أمثلة:
  # مسح كامل الكاش
  npm run clear:production

  # مسح كاش مقال محدد
  node scripts/clear-production-cache.js --url /article/my-article-slug

  # مسح مع token مخصص
  CACHE_CLEAR_SECRET=your-token node scripts/clear-production-cache.js
    `);
  } else {
    console.log('❌ استخدام خاطئ. استخدم --help للمساعدة');
  }
} else {
  clearProductionCache()
    .then(() => {
      console.log('\n✅ انتهى مسح كاش الإنتاج');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ فشل مسح كاش الإنتاج:', error);
      process.exit(1);
    });
} 