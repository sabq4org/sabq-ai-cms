const Redis = require('ioredis');
require('dotenv').config();

// إنشاء اتصال Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function cleanupAndMigrateRedis() {
  console.log('🧹 بدء تنظيف وترحيل مفاتيح Redis...\n');

  try {
    // 1. إحصائيات أولية
    console.log('📊 جمع الإحصائيات...');
    const allKeys = await redis.keys('*');
    console.log(`إجمالي المفاتيح: ${allKeys.length}`);

    const articleKeys = await redis.keys('article:*');
    const newsKeys = await redis.keys('news:*');
    const articlesKeys = await redis.keys('articles:*');
    
    console.log(`مفاتيح article:*  : ${articleKeys.length}`);
    console.log(`مفاتيح news:*     : ${newsKeys.length}`);
    console.log(`مفاتيح articles:* : ${articlesKeys.length}\n`);

    // 2. ترحيل مفاتيح article:* إلى news:* للأخبار
    console.log('🔄 ترحيل مفاتيح الأخبار...');
    let migratedCount = 0;
    let opinionCount = 0;
    let errorCount = 0;

    for (const oldKey of articleKeys) {
      try {
        const data = await redis.get(oldKey);
        if (!data) continue;

        const article = JSON.parse(data);
        
        // تحديد نوع المحتوى
        const contentType = article.content_type || 
                          (article.article_type === 'news' ? 'NEWS' : 'OPINION');

        if (contentType === 'NEWS') {
          // ترحيل إلى news:*
          const newKey = oldKey.replace('article:', 'news:');
          await redis.set(newKey, data);
          await redis.del(oldKey);
          migratedCount++;
          
          if (migratedCount % 100 === 0) {
            console.log(`  ✅ تم ترحيل ${migratedCount} خبر...`);
          }
        } else {
          // الإبقاء على article:* للمقالات
          opinionCount++;
        }
      } catch (error) {
        console.error(`  ❌ خطأ في معالجة ${oldKey}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ تم ترحيل ${migratedCount} خبر من article:* إلى news:*`);
    console.log(`📝 تم الإبقاء على ${opinionCount} مقال رأي في article:*`);
    console.log(`❌ فشل في معالجة ${errorCount} مفتاح\n`);

    // 3. تنظيف المفاتيح القديمة والمكررة
    console.log('🗑️  تنظيف المفاتيح القديمة...');
    
    // حذف مفاتيح قديمة جداً (أكثر من 30 يوم)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let deletedOld = 0;

    for (const key of allKeys) {
      try {
        const ttl = await redis.ttl(key);
        // إذا لا يوجد TTL، تحقق من محتوى المفتاح
        if (ttl === -1) {
          const data = await redis.get(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const timestamp = parsed.timestamp || parsed.created_at || parsed.updated_at;
              if (timestamp && new Date(timestamp).getTime() < thirtyDaysAgo) {
                await redis.del(key);
                deletedOld++;
              }
            } catch (e) {
              // ليس JSON، تجاهل
            }
          }
        }
      } catch (error) {
        // تجاهل الأخطاء
      }
    }

    console.log(`✅ تم حذف ${deletedOld} مفتاح قديم\n`);

    // 4. تحسين TTL للمفاتيح الحالية
    console.log('⏰ تحسين أوقات انتهاء الصلاحية...');
    
    const ttlSettings = {
      'news:*': 3600,        // ساعة للأخبار
      'article:*': 7200,     // ساعتين للمقالات
      'articles:*': 600,     // 10 دقائق للقوائم
      'categories:*': 86400, // يوم للتصنيفات
      'stats:*': 300,        // 5 دقائق للإحصائيات
    };

    for (const [pattern, ttl] of Object.entries(ttlSettings)) {
      const keys = await redis.keys(pattern);
      for (const key of keys) {
        const currentTTL = await redis.ttl(key);
        if (currentTTL === -1 || currentTTL > ttl) {
          await redis.expire(key, ttl);
        }
      }
      console.log(`  ✅ تم تحديث TTL لـ ${keys.length} مفتاح من نوع ${pattern}`);
    }

    // 5. إحصائيات نهائية
    console.log('\n📊 الإحصائيات النهائية:');
    const finalKeys = await redis.keys('*');
    const finalNewsKeys = await redis.keys('news:*');
    const finalArticleKeys = await redis.keys('article:*');
    
    console.log(`إجمالي المفاتيح: ${finalKeys.length}`);
    console.log(`مفاتيح news:*   : ${finalNewsKeys.length}`);
    console.log(`مفاتيح article:*: ${finalArticleKeys.length}`);

    // 6. معلومات الذاكرة
    const info = await redis.info('memory');
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    if (memoryMatch) {
      console.log(`\n💾 استخدام الذاكرة: ${memoryMatch[1]}`);
    }

    console.log('\n✅ اكتمل التنظيف والترحيل بنجاح!');

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    redis.disconnect();
  }
}

// تشغيل السكريبت
cleanupAndMigrateRedis();
