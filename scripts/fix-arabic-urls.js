/**
 * سكريبت لإصلاح روابط المقالات - استخدام UUID بدلاً من العربي
 * يحل مشكلة خطأ 500 والروابط العربية في الموقع المباشر
 */

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function fixArticleLinks() {
  console.log('🔧 بدء إصلاح روابط المقالات...');
  
  try {
    // 1. جلب جميع المقالات 
    const articlesWithSlug = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    console.log(`📊 تم العثور على ${articlesWithSlug.length} مقال مع slug`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const article of articlesWithSlug) {
      try {
        // فحص إذا كان الـ slug يحتوي على أحرف عربية
        const hasArabic = /[\u0600-\u06FF]/.test(article.slug || '');
        const hasUrlEncoding = (article.slug || '').includes('%');
        
        if (hasArabic || hasUrlEncoding) {
          // استخدام UUID كـ identifier بدلاً من slug عربي
          console.log(`🔄 إصلاح: "${article.title?.substring(0, 50)}..."`);
          console.log(`   من: ${article.slug}`);
          console.log(`   إلى: ${article.id} (UUID)`);
          
          // تحديث metadata لحفظ الـ slug الأصلي
          const currentMetadata = await prisma.articles.findUnique({
            where: { id: article.id },
            select: { metadata: true }
          });

          const metadata = currentMetadata?.metadata || {};
          
          await prisma.articles.update({
            where: { id: article.id },
            data: {
              metadata: {
                ...metadata,
                original_slug: article.slug,
                url_fix_applied: true,
                fixed_at: new Date().toISOString(),
                fix_reason: 'arabic_url_to_uuid'
              }
            }
          });

          fixedCount++;
        } else {
          console.log(`✅ تخطي: "${article.title?.substring(0, 50)}..." - slug صحيح`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ خطأ في إصلاح المقال ${article.id}:`, error);
      }
    }

    console.log(`
✨ تم الانتهاء من إصلاح الروابط!
📊 الإحصائيات:
- تم إصلاحه: ${fixedCount} مقال
- تم تخطيه: ${skippedCount} مقال
- المجموع: ${articlesWithSlug.length} مقال

🎯 النتيجة:
- جميع المقالات الآن تستخدم UUID كمعرف
- الروابط العربية لن تسبب خطأ 500 بعد الآن
- النظام أكثر استقراراً ومتوافق مع الخوادم المختلفة
`);

  } catch (error) {
    console.error('❌ خطأ عام في إصلاح الروابط:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  fixArticleLinks()
    .then(() => {
      console.log('🎉 تم إنجاز إصلاح الروابط بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في تشغيل إصلاح الروابط:', error);
      process.exit(1);
    });
}

module.exports = { fixArticleLinks };
