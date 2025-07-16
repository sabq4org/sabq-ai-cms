#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleInteractions() {
  console.log('🎯 إضافة تفاعلات تجريبية للتصنيفات...\n');
  
  try {
    // 1. جلب التصنيفات النشطة
    const categories = await prisma.categories.findMany({
      where: { is_active: true }
    });
    
    console.log(`📊 عدد التصنيفات: ${categories.length}\n`);
    
    // 2. جلب مستخدم تجريبي
    const testUser = await prisma.users.findFirst({
      where: { email: 'admin@sabq.ai' }
    });
    
    if (!testUser) {
      console.error('❌ لم يتم العثور على مستخدم تجريبي');
      return;
    }
    
    console.log(`👤 المستخدم التجريبي: ${testUser.name}\n`);
    
    // 3. معالجة كل تصنيف
    for (const category of categories) {
      console.log(`\n📁 معالجة التصنيف: ${category.name} (${category.id})`);
      
      // جلب أول 3 مقالات في التصنيف
      const articles = await prisma.articles.findMany({
        where: {
          category_id: category.id,
          status: 'published'
        },
        take: 3,
        orderBy: { created_at: 'desc' }
      });
      
      if (articles.length === 0) {
        console.log('   ⚠️ لا توجد مقالات في هذا التصنيف');
        continue;
      }
      
      console.log(`   📰 عدد المقالات: ${articles.length}`);
      
      // إضافة تفاعلات لكل مقال
      for (const article of articles) {
        console.log(`   - معالجة المقال: ${article.title.substring(0, 50)}...`);
        
        // التحقق من وجود تفاعلات سابقة
        const existingLike = await prisma.interactions.findFirst({
          where: {
            article_id: article.id,
            user_id: testUser.id,
            type: 'like'
          }
        });
        
        if (!existingLike) {
          // إضافة إعجاب
          await prisma.interactions.create({
            data: {
              article_id: article.id,
              user_id: testUser.id,
              type: 'like'
            }
          });
          console.log('     ✅ تم إضافة إعجاب');
        }
        
        // إضافة حفظ للمقال الأول فقط
        if (articles.indexOf(article) === 0) {
          const existingSave = await prisma.interactions.findFirst({
            where: {
              article_id: article.id,
              user_id: testUser.id,
              type: 'save'
            }
          });
          
          if (!existingSave) {
            await prisma.interactions.create({
              data: {
                article_id: article.id,
                user_id: testUser.id,
                type: 'save'
              }
            });
            console.log('     ✅ تم إضافة حفظ');
          }
        }
        
        // زيادة المشاهدات
        await prisma.articles.update({
          where: { id: article.id },
          data: { views: { increment: 5 } }
        });
        console.log('     ✅ تم زيادة المشاهدات بـ 5');
      }
    }
    
    // 4. ملخص الإحصائيات
    console.log('\n\n📊 ملخص الإحصائيات الجديدة:');
    
    for (const category of categories.slice(0, 3)) { // أول 3 تصنيفات فقط
      const articleIds = await prisma.articles.findMany({
        where: {
          category_id: category.id,
          status: 'published'
        },
        select: { id: true }
      }).then(articles => articles.map(a => a.id));
      
      if (articleIds.length === 0) continue;
      
      const [totalLikes, totalSaves, totalViews] = await Promise.all([
        prisma.interactions.count({
          where: {
            type: 'like',
            article_id: { in: articleIds }
          }
        }),
        prisma.interactions.count({
          where: {
            type: 'save',
            article_id: { in: articleIds }
          }
        }),
        prisma.articles.aggregate({
          _sum: { views: true },
          where: {
            id: { in: articleIds }
          }
        })
      ]);
      
      console.log(`\n📁 ${category.name}:`);
      console.log(`   - إعجابات: ${totalLikes}`);
      console.log(`   - حفظ: ${totalSaves}`);
      console.log(`   - مشاهدات: ${totalViews._sum.views || 0}`);
    }
    
    console.log('\n✅ تمت إضافة التفاعلات التجريبية بنجاح!');
    console.log('💡 نصيحة: امسح الكاش لرؤية التحديثات فوراً');
    console.log('   curl -X POST http://localhost:3000/api/cache/clear');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
addSampleInteractions(); 