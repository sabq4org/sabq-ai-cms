// سكريبت لإعادة تعيين خبر مميز
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');

// معرف المقال المراد تعيينه كمميز
// يمكن تغيير هذا المعرف حسب الحاجة
const ARTICLE_ID = process.argv[2] || 'article_1753871540813_vlvief9dk';

async function setFeaturedArticle(articleId) {
  try {
    console.log(`🔍 جاري البحث عن المقال: ${articleId}...`);
    
    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, status: true }
    });
    
    if (!article) {
      console.error(`❌ المقال غير موجود: ${articleId}`);
      return;
    }
    
    console.log(`✅ تم العثور على المقال: ${article.title}`);
    
    // إلغاء تمييز جميع المقالات الأخرى
    console.log('🔄 جاري إلغاء تمييز جميع المقالات الأخرى...');
    await prisma.articles.updateMany({
      where: {
        featured: true,
        id: { not: articleId }
      },
      data: {
        featured: false
      }
    });
    
    // تعيين المقال كمميز
    console.log(`🔄 جاري تعيين المقال كمميز: ${article.title}...`);
    await prisma.articles.update({
      where: { id: articleId },
      data: {
        featured: true,
        updated_at: new Date() // تحديث وقت التعديل لضمان ظهوره كأحدث خبر مميز
      }
    });
    
    console.log('✅ تم تعيين المقال كمميز بنجاح');
    
    // إعادة تحقق صحة الصفحة الرئيسية
    console.log('🔄 جاري إعادة تحقق صحة الصفحة الرئيسية...');
    try {
      const response = await fetch('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/',
          secret: process.env.REVALIDATION_SECRET || 'sabq-revalidation-secret'
        })
      });
      
      const data = await response.json();
      
      if (data.revalidated) {
        console.log('✅ تم إعادة تحقق صحة الصفحة الرئيسية بنجاح');
      } else {
        console.warn('⚠️ فشل في إعادة تحقق صحة الصفحة الرئيسية:', data.message || 'خطأ غير معروف');
      }
    } catch (error) {
      console.warn('⚠️ فشل في إعادة تحقق صحة الصفحة الرئيسية:', error.message);
    }
    
    // إعادة تحقق صحة API الخبر المميز
    console.log('🔄 جاري إعادة تحقق صحة API الخبر المميز...');
    try {
      const response = await fetch('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/api/featured-news',
          secret: process.env.REVALIDATION_SECRET || 'sabq-revalidation-secret'
        })
      });
      
      const data = await response.json();
      
      if (data.revalidated) {
        console.log('✅ تم إعادة تحقق صحة API الخبر المميز بنجاح');
      } else {
        console.warn('⚠️ فشل في إعادة تحقق صحة API الخبر المميز:', data.message || 'خطأ غير معروف');
      }
    } catch (error) {
      console.warn('⚠️ فشل في إعادة تحقق صحة API الخبر المميز:', error.message);
    }
    
    // التحقق من الخبر المميز الحالي
    const currentFeatured = await prisma.articles.findFirst({
      where: {
        featured: true,
        status: 'published',
        published_at: {
          lte: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        featured: true,
        published_at: true,
        updated_at: true
      },
      orderBy: [
        { updated_at: 'desc' },
        { published_at: 'desc' }
      ]
    });
    
    if (currentFeatured) {
      console.log('✅ الخبر المميز الحالي:');
      console.log(JSON.stringify(currentFeatured, null, 2));
    } else {
      console.log('❌ لا يوجد خبر مميز مؤهل للظهور في الواجهة');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تنفيذ السكريبت
setFeaturedArticle(ARTICLE_ID);

// طريقة الاستخدام:
// node scripts/set-featured-article.js [معرف_المقال]
// مثال:
// node scripts/set-featured-article.js article_1753871540813_vlvief9dk