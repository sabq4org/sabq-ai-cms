#!/usr/bin/env node

/**
 * سكريبت حذف المقال التجريبي
 * يحذف المقال بالـ slug: 4ihzpplc
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteTestArticle() {
  try {
    console.log('🔍 البحث عن المقال التجريبي...');
    
    // البحث عن المقال بالـ slug
    const article = await prisma.articles.findFirst({
      where: {
        slug: '4ihzpplc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        created_at: true
      }
    });

    if (!article) {
      console.log('❌ لم يتم العثور على المقال بالـ slug: 4ihzpplc');
      return;
    }

    console.log('✅ تم العثور على المقال:');
    console.log(`   - ID: ${article.id}`);
    console.log(`   - العنوان: ${article.title}`);
    console.log(`   - الـ slug: ${article.slug}`);
    console.log(`   - الحالة: ${article.status}`);
    console.log(`   - تاريخ الإنشاء: ${article.created_at}`);

    // حذف التعليقات المرتبطة بالمقال أولاً (إن وجدت)
    console.log('🗑️ حذف التعليقات المرتبطة بالمقال...');
    const deletedComments = await prisma.comments.deleteMany({
      where: {
        article_id: article.id
      }
    });
    console.log(`✅ تم حذف ${deletedComments.count} تعليق`);

    // حذف المقال
    console.log('🗑️ حذف المقال...');
    await prisma.articles.delete({
      where: {
        id: article.id
      }
    });

    console.log('✅ تم حذف المقال التجريبي بنجاح');
    console.log('🎯 المقال المحذوف:', article.title);

  } catch (error) {
    console.error('❌ خطأ في حذف المقال:', error);
    
    if (error.code === 'P2025') {
      console.log('ℹ️ المقال غير موجود أو تم حذفه مسبقاً');
    } else {
      console.error('تفاصيل الخطأ:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  deleteTestArticle()
    .then(() => {
      console.log('🏁 انتهى السكريبت');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { deleteTestArticle };
