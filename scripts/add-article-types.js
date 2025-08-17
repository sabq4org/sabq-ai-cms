#!/usr/bin/env node

/**
 * 🏷️ إضافة أنواع المقالات إلى metadata
 * يضيف حقل type للمقالات الموجودة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// قائمة الأنواع المتاحة
const articleTypes = ['تحليل', 'رأي', 'عاجل', 'ملخص', 'تقرير', 'مقالة'];

async function addArticleTypes() {
  console.log('🏷️ بدء إضافة أنواع المقالات...\n');

  try {
    // جلب جميع المقالات
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        metadata: true,
        categories: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 وجدت ${articles.length} مقال للمعالجة\n`);

    let updatedCount = 0;

    for (const article of articles) {
      // التحقق من وجود type مسبقاً
      const metadata = article.metadata || {};
      
      if (!metadata.type) {
        // تحديد النوع بناءً على العنوان أو التصنيف
        let type = 'مقالة'; // النوع الافتراضي
        
        const title = article.title.toLowerCase();
        
        // تحديد النوع بناءً على الكلمات المفتاحية في العنوان
        if (title.includes('عاجل') || title.includes('خبر عاجل') || title.includes('الآن')) {
          type = 'عاجل';
        } else if (title.includes('تحليل') || title.includes('دراسة') || title.includes('تفسير')) {
          type = 'تحليل';
        } else if (title.includes('رأي') || title.includes('وجهة نظر') || title.includes('تعليق')) {
          type = 'رأي';
        } else if (title.includes('ملخص') || title.includes('خلاصة') || title.includes('موجز')) {
          type = 'ملخص';
        } else if (title.includes('تقرير') || title.includes('تغطية') || title.includes('رصد')) {
          type = 'تقرير';
        } else if (article.categories?.name) {
          // تحديد بناءً على التصنيف
          const categoryName = article.categories.name.toLowerCase();
          if (categoryName.includes('رأي') || categoryName.includes('مقالات')) {
            type = 'رأي';
          } else if (categoryName.includes('تحليل')) {
            type = 'تحليل';
          } else if (categoryName.includes('أخبار')) {
            type = Math.random() > 0.7 ? 'عاجل' : 'تقرير';
          }
        }
        
        // توزيع عشوائي للتنوع
        if (type === 'مقالة' && Math.random() > 0.5) {
          type = articleTypes[Math.floor(Math.random() * articleTypes.length)];
        }
        
        // تحديث metadata
        metadata.type = type;
        
        await prisma.articles.update({
          where: { id: article.id },
          data: { 
            metadata: metadata 
          }
        });
        
        updatedCount++;
        console.log(`✅ ${article.title.substring(0, 50)}... => ${type}`);
      } else {
        console.log(`⏭️  ${article.title.substring(0, 50)}... (لديه نوع مسبقاً: ${metadata.type})`);
      }
    }

    console.log(`\n✅ تم تحديث ${updatedCount} مقال بنجاح!`);
    
    // إحصائيات النهائية
    console.log('\n📊 إحصائيات الأنواع:');
    const stats = await prisma.$queryRaw`
      SELECT 
        metadata->>'type' as type, 
        COUNT(*) as count 
      FROM articles 
      WHERE metadata->>'type' IS NOT NULL 
      GROUP BY metadata->>'type'
      ORDER BY count DESC
    `;
    
    stats.forEach(stat => {
      console.log(`  ${stat.type}: ${stat.count} مقال`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
addArticleTypes(); 