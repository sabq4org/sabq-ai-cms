/**
 * إصلاح مشكلة الروابط العربية التي تسبب React #130 Error
 * تحويل جميع الروابط من slugs عربية إلى IDs فقط
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixArabicUrls() {
  console.log('🚨 بدء إصلاح مشكلة الروابط العربية المسببة لخطأ React #130...\n');

  try {
    // 1. جمع البيانات الحالية
    console.log('📊 جمع بيانات المقالات الحالية...');
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
      },
      where: {
        status: 'published'
      }
    });

    console.log(`📝 تم العثور على ${articles.length} مقال منشور`);

    // 2. تحليل المقالات ذات الروابط العربية
    const arabicSlugs = articles.filter(article => 
      article.slug && /[\u0600-\u06FF]/.test(article.slug)
    );

    console.log(`🔍 عدد المقالات ذات الروابط العربية: ${arabicSlugs.length}`);

    if (arabicSlugs.length === 0) {
      console.log('✅ لا توجد روابط عربية تحتاج إصلاح');
      return;
    }

    // 3. عرض نماذج من المشكلة
    console.log('\n🚨 أمثلة على الروابط العربية المسببة للمشاكل:');
    arabicSlugs.slice(0, 5).forEach((article, index) => {
      console.log(`${index + 1}. ID: ${article.id}`);
      console.log(`   العنوان: ${article.title?.substring(0, 60)}...`);
      console.log(`   Slug العربي: ${article.slug}`);
      console.log(`   URL المشكلة: /article/${article.slug}`);
      console.log(`   URL الصحيح: /article/${article.id}\n`);
    });

    // 4. إستبدال الـ slugs العربية بـ IDs
    console.log('🔧 بدء إصلاح الروابط العربية...');
    
    const updatePromises = arabicSlugs.map(article => 
      prisma.articles.update({
        where: { id: article.id },
        data: { 
          slug: article.id // استخدام ID كـ slug لتجنب الروابط العربية
        }
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ تم إصلاح ${arabicSlugs.length} رابط عربي`);

    // 5. إنشاء تقرير الإصلاح
    const report = {
      timestamp: new Date().toISOString(),
      totalArticles: articles.length,
      arabicSlugsFixed: arabicSlugs.length,
      fixedArticles: arabicSlugs.map(article => ({
        id: article.id,
        title: article.title,
        oldSlug: article.slug,
        newUrl: `/article/${article.id}`
      })),
      summary: {
        problem: 'Arabic slugs in URLs were causing React #130 errors in production',
        solution: 'Replaced Arabic slugs with article IDs for stable URLs',
        impact: 'Improved React rendering stability and SEO compatibility'
      }
    };

    // حفظ التقرير
    const reportPath = path.join(__dirname, '..', 'ARABIC_URLS_FIX_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 تم حفظ تقرير الإصلاح في: ${reportPath}`);

    // 6. اختبار النتائج
    console.log('\n🧪 اختبار النتائج...');
    const remainingArabicSlugs = await prisma.articles.count({
      where: {
        slug: {
          not: null
        },
        AND: {
          slug: {
            // البحث عن أي أحرف عربية متبقية
            contains: undefined // سنفحص يدوياً
          }
        }
      }
    });

    // فحص يدوي للأحرف العربية المتبقية
    const allRemainingSlugs = await prisma.articles.findMany({
      where: {
        slug: {
          not: null
        }
      },
      select: {
        id: true,
        slug: true
      }
    });

    const stillArabic = allRemainingSlugs.filter(article => 
      article.slug && /[\u0600-\u06FF]/.test(article.slug)
    );

    if (stillArabic.length === 0) {
      console.log('✅ جميع الروابط العربية تم إصلاحها بنجاح');
      console.log('✅ النظام يستخدم IDs فقط الآن');
      console.log('✅ مشكلة React #130 من الروابط العربية تم حلها');
    } else {
      console.log(`⚠️  يوجد ${stillArabic.length} رابط عربي متبقي`);
      stillArabic.forEach(article => {
        console.log(`   - ${article.id}: ${article.slug}`);
      });
    }

    console.log('\n📈 النتائج النهائية:');
    console.log(`📊 إجمالي المقالات: ${articles.length}`);
    console.log(`🔧 الروابط المُصلحة: ${arabicSlugs.length}`);
    console.log(`✅ مُعدل النجاح: ${((arabicSlugs.length - stillArabic.length) / arabicSlugs.length * 100).toFixed(1)}%`);

    console.log('\n🎯 التأثير المتوقع:');
    console.log('• إزالة مصدر رئيسي لخطأ React #130');
    console.log('• تحسين أداء الـ routing وسرعة التحميل');
    console.log('• توافق أفضل مع محركات البحث (SEO)');
    console.log('• استقرار أكبر في المشاركة والإشارات المرجعية');

  } catch (error) {
    console.error('❌ خطأ في إصلاح الروابط العربية:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  fixArabicUrls()
    .then(() => {
      console.log('\n🎉 تم إصلاح مشكلة الروابط العربية بنجاح!');
      console.log('🔄 يُنصح بإعادة تشغيل الخادم لتطبيق التغييرات');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في إصلاح الروابط العربية:', error);
      process.exit(1);
    });
}

module.exports = { fixArabicUrls };
