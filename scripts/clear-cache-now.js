#!/usr/bin/env node

/**
 * سكريبت مسح الكاش الفوري
 * يستخدم لمسح جميع بيانات الكاش المتعلقة بالمقالات
 */

require('dotenv').config();
const { Redis } = require('ioredis');

async function clearCache() {
  console.log('🚀 بدء مسح الكاش...\n');
  
  // إنشاء اتصال Redis
  let redis;
  
  // في بيئة التطوير، استخدم Redis المحلي دائماً
  if (process.env.NODE_ENV === 'development' || !process.env.REDIS_URL) {
    console.log('🏠 الاتصال بـ Redis المحلي...');
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 500);
      }
    });
  } else {
    console.log('📡 الاتصال بـ Redis Cloud...');
    redis = new Redis(process.env.REDIS_URL, {
      tls: {},
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      }
    });
  }
  
  try {
    // اختبار الاتصال
    await redis.ping();
    console.log('✅ تم الاتصال بـ Redis بنجاح\n');
    
    // مسح أنماط الكاش المختلفة
    const patterns = [
      'articles:*',
      'article:*',
      'categories:*',
      'category:*',
      'stats:*',
      'search:*',
      'news:*'
    ];
    
    let totalDeleted = 0;
    
    for (const pattern of patterns) {
      console.log(`🔍 البحث عن النمط: ${pattern}`);
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        console.log(`📝 وجدت ${keys.length} مفتاح`);
        
        // حذف على دفعات
        const batchSize = 100;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          await redis.del(...batch);
          console.log(`  ✅ تم حذف ${batch.length} مفتاح`);
        }
        
        totalDeleted += keys.length;
      } else {
        console.log(`  ⚪ لا توجد مفاتيح`);
      }
      console.log('');
    }
    
    console.log(`\n✨ تم مسح ${totalDeleted} مفتاح من الكاش بنجاح!`);
    
    // عرض معلومات Redis
    const info = await redis.info('memory');
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    if (memoryMatch) {
      console.log(`💾 استخدام الذاكرة الحالي: ${memoryMatch[1]}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    redis.disconnect();
  }
}

// تشغيل السكريبت
clearCache()
  .then(() => {
    console.log('\n✅ اكتمل مسح الكاش');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ فشل مسح الكاش:', error);
    process.exit(1);
  }); 