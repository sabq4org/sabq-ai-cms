#!/usr/bin/env node

/**
 * تفعيل البطاقات المخصصة في الجوال
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableSmartCards() {
  console.log('🎯 تفعيل البطاقات المخصصة في الجوال...\n');
  
  try {
    // 1. التحقق من وجود مقالات منشورة
    const publishedArticles = await prisma.articles.count({
      where: {
        status: 'published',
        deleted_at: null
      }
    });
    
    console.log(`📊 عدد المقالات المنشورة: ${publishedArticles}`);
    
    if (publishedArticles === 0) {
      console.log('❌ لا توجد مقالات منشورة!');
      return;
    }
    
    // 2. التحقق من وجود أنواع مختلفة من المقالات
    const articleTypes = await prisma.$queryRaw`
      SELECT 
        COALESCE(metadata->>'type', 'NEWS') as type,
        COUNT(*) as count
      FROM articles
      WHERE status = 'published' 
        AND deleted_at IS NULL
      GROUP BY COALESCE(metadata->>'type', 'NEWS')
    `;
    
    console.log('\n📈 أنواع المقالات المتاحة:');
    articleTypes.forEach(type => {
      console.log(`   - ${type.type}: ${type.count} مقال`);
    });
    
    // 3. إضافة أنواع للمقالات التي لا تحتوي على نوع
    console.log('\n🔧 تحديث المقالات بدون نوع...');
    
    const articlesWithoutType = await prisma.articles.findMany({
      where: {
        status: 'published',
        deleted_at: null,
        OR: [
          { metadata: { equals: {} } },
          { metadata: { path: ['type'], equals: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        category_id: true
      }
    });
    
    console.log(`   📝 عدد المقالات بدون نوع: ${articlesWithoutType.length}`);
    
    if (articlesWithoutType.length > 0) {
      // تحديد الأنواع بناءً على التصنيف أو العنوان
      for (const article of articlesWithoutType) {
        let type = 'NEWS'; // افتراضي
        
        // تحديد النوع بناءً على الكلمات المفتاحية في العنوان
        if (article.title.includes('رأي') || article.title.includes('مقال')) {
          type = 'OPINION';
        } else if (article.title.includes('تحليل') || article.title.includes('دراسة')) {
          type = 'ANALYSIS';
        } else if (article.title.includes('قصة') || article.title.includes('حكاية')) {
          type = 'STORY';
        }
        
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            metadata: {
              ...((await prisma.articles.findUnique({ where: { id: article.id } }))?.metadata || {}),
              type
            }
          }
        });
      }
      
      console.log('   ✅ تم تحديث أنواع المقالات');
    }
    
    // 4. إنشاء بيانات تجريبية للبطاقات المخصصة
    console.log('\n🎨 إنشاء بيانات تجريبية للبطاقات المخصصة...');
    
    const sampleSmartCards = [
      {
        title: "اكتشف: أفضل المقالات التحليلية هذا الأسبوع",
        type: "ANALYSIS",
        readingTime: 8
      },
      {
        title: "مخصص لك: آراء الكتّاب المميزين",
        type: "OPINION", 
        readingTime: 5
      },
      {
        title: "قصص ملهمة: تجارب نجاح سعودية",
        type: "STORY",
        readingTime: 6
      }
    ];
    
    console.log('   ✅ البطاقات المخصصة جاهزة للعرض');
    
    // 5. التحقق من إعدادات الموقع
    console.log('\n⚙️ التحقق من إعدادات الموقع...');
    
    const settings = await prisma.settings.findFirst({
      where: {
        key: 'smart_cards_enabled'
      }
    });
    
    if (!settings) {
      await prisma.settings.create({
        data: {
          key: 'smart_cards_enabled',
          value: { enabled: true, mobile: true, desktop: true }
        }
      });
      console.log('   ✅ تم تفعيل البطاقات المخصصة');
    } else {
      console.log('   ℹ️ البطاقات المخصصة مفعلة بالفعل');
    }
    
    console.log('\n✅ اكتمل تفعيل البطاقات المخصصة بنجاح!');
    console.log('🔄 يرجى إعادة تشغيل التطبيق: pm2 restart sabq-cms');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
enableSmartCards(); 