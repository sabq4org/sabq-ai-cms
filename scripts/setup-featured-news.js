const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupFeaturedNews() {
  try {
    console.log('🚀 بدء إعداد الأخبار المميزة...');

    // أولاً، إلغاء تفعيل جميع الأخبار المميزة الحالية
    await prisma.articles.updateMany({
      where: {
        featured: true
      },
      data: {
        featured: false
      }
    });

    console.log('✅ تم إلغاء تفعيل جميع الأخبار المميزة الحالية');

    // العثور على أحدث الأخبار المنشورة مع الصور
    const eligibleArticles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured_image: {
          not: null
        },
        published_at: {
          not: null,
          lte: new Date()
        }
      },
      include: {
        categories: {
          select: {
            name: true,
            icon: true
          }
        },
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 5
    });

    if (eligibleArticles.length === 0) {
      console.log('❌ لا توجد أخبار مؤهلة لتكون مميزة (منشورة، مع صورة)');
      return;
    }

    // اختيار أحدث خبر وتفعيله كخبر مميز
    const selectedArticle = eligibleArticles[0];
    
    await prisma.articles.update({
      where: {
        id: selectedArticle.id
      },
      data: {
        featured: true
      }
    });

    console.log('✨ تم تفعيل خبر مميز:');
    console.log(`📰 العنوان: ${selectedArticle.title}`);
    console.log(`🗂️ التصنيف: ${selectedArticle.categories?.name || 'بدون تصنيف'}`);
    console.log(`✍️ الكاتب: ${selectedArticle.author?.name || 'غير محدد'}`);
    console.log(`📅 تاريخ النشر: ${selectedArticle.published_at?.toLocaleDateString('ar-SA') || 'غير محدد'}`);
    console.log(`🖼️ يحتوي على صورة: ${selectedArticle.featured_image ? 'نعم' : 'لا'}`);

    console.log('\n📋 قائمة الأخبار المؤهلة للتفعيل:');
    eligibleArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`   📅 ${article.published_at?.toLocaleDateString('ar-SA')}`);
      console.log(`   🗂️ ${article.categories?.name || 'بدون تصنيف'}`);
      console.log('');
    });

    console.log('🎉 تم إعداد الأخبار المميزة بنجاح!');
    console.log('💡 يمكنك تغيير الخبر المميز من لوحة التحكم أو تشغيل هذا السكريبت مرة أخرى');

  } catch (error) {
    console.error('❌ خطأ في إعداد الأخبار المميزة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
setupFeaturedNews();