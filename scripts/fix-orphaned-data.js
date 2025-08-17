/**
 * سكريبت إصلاح البيانات المهجورة
 * 
 * هذا السكريبت يصلح:
 * 1. المقالات بدون مؤلف
 * 2. المقالات بدون تصنيف  
 * 3. المقالات المرتبطة بمؤلفين محذوفين
 * 4. المقالات المرتبطة بتصنيفات محذوفة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 بدء إصلاح البيانات المهجورة...\n');
  
  try {
    // 1. إنشاء مؤلف افتراضي إذا لم يكن موجوداً
    console.log('📝 التحقق من وجود المؤلف الافتراضي...');
    
    let defaultAuthor = await prisma.users.findFirst({
      where: { email: 'editor@sabq.io' }
    });
    
    if (!defaultAuthor) {
      defaultAuthor = await prisma.users.create({
        data: {
          name: 'محرر سبق',
          email: 'editor@sabq.io',
          role: 'editor',
          is_active: true
        }
      });
      console.log('✅ تم إنشاء المؤلف الافتراضي:', defaultAuthor.id);
    } else {
      console.log('✅ المؤلف الافتراضي موجود:', defaultAuthor.id);
    }

    // 2. إنشاء تصنيف افتراضي إذا لم يكن موجوداً
    console.log('\n📂 التحقق من وجود التصنيف الافتراضي...');
    
    let defaultCategory = await prisma.categories.findFirst({
      where: { slug: 'general' }
    });
    
    if (!defaultCategory) {
      defaultCategory = await prisma.categories.create({
        data: {
          name: 'عام',
          name_en: 'General',
          slug: 'general',
          description: 'تصنيف عام للمقالات',
          color: '#6B7280',
          is_active: true,
          display_order: 999
        }
      });
      console.log('✅ تم إنشاء التصنيف الافتراضي:', defaultCategory.id);
    } else {
      console.log('✅ التصنيف الافتراضي موجود:', defaultCategory.id);
    }

    // 3. إصلاح المقالات بدون مؤلف
    console.log('\n👤 إصلاح المقالات بدون مؤلف...');
    
    const articlesWithoutAuthor = await prisma.$executeRaw`
      UPDATE articles 
      SET author_id = ${defaultAuthor.id}
      WHERE author_id IS NULL AND status != 'deleted'
    `;
    
    console.log(`✅ تم إصلاح ${articlesWithoutAuthor} مقال بدون مؤلف`);

    // 4. إصلاح المقالات بدون تصنيف  
    console.log('\n📁 إصلاح المقالات بدون تصنيف...');
    
    const articlesWithoutCategory = await prisma.$executeRaw`
      UPDATE articles 
      SET category_id = ${defaultCategory.id}
      WHERE category_id IS NULL AND status != 'deleted'
    `;
    
    console.log(`✅ تم إصلاح ${articlesWithoutCategory} مقال بدون تصنيف`);

    // 5. البحث عن المؤلفين المحذوفين وإصلاح مقالاتهم
    console.log('\n🔍 البحث عن المؤلفين المحذوفين...');
    
    const orphanedByAuthor = await prisma.$queryRaw`
      SELECT a.id, a.title, a.author_id 
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      WHERE a.author_id IS NOT NULL 
        AND u.id IS NULL 
        AND a.status != 'deleted'
      LIMIT 100
    `;
    
    if (orphanedByAuthor.length > 0) {
      const orphanedIds = orphanedByAuthor.map(a => a.id);
      
      const fixedOrphanedByAuthor = await prisma.articles.updateMany({
        where: { id: { in: orphanedIds } },
        data: { author_id: defaultAuthor.id }
      });
      
      console.log(`✅ تم إصلاح ${fixedOrphanedByAuthor.count} مقال مرتبط بمؤلفين محذوفين`);
      
      // عرض بعض المقالات المصلحة
      orphanedByAuthor.slice(0, 5).forEach(article => {
        console.log(`   - ${article.title} (${article.id})`);
      });
    } else {
      console.log('✅ لا توجد مقالات مرتبطة بمؤلفين محذوفين');
    }

    // 6. البحث عن التصنيفات المحذوفة وإصلاح مقالاتها
    console.log('\n🔍 البحث عن التصنيفات المحذوفة...');
    
    const orphanedByCategory = await prisma.$queryRaw`
      SELECT a.id, a.title, a.category_id 
      FROM articles a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.category_id IS NOT NULL 
        AND c.id IS NULL 
        AND a.status != 'deleted'
      LIMIT 100
    `;
    
    if (orphanedByCategory.length > 0) {
      const orphanedIds = orphanedByCategory.map(a => a.id);
      
      const fixedOrphanedByCategory = await prisma.articles.updateMany({
        where: { id: { in: orphanedIds } },
        data: { category_id: defaultCategory.id }
      });
      
      console.log(`✅ تم إصلاح ${fixedOrphanedByCategory.count} مقال مرتبط بتصنيفات محذوفة`);
      
      // عرض بعض المقالات المصلحة
      orphanedByCategory.slice(0, 5).forEach(article => {
        console.log(`   - ${article.title} (${article.id})`);
      });
    } else {
      console.log('✅ لا توجد مقالات مرتبطة بتصنيفات محذوفة');
    }

    // 7. تحديث إحصائيات المقالات
    console.log('\n📊 تحديث الإحصائيات...');
    
    const stats = await prisma.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count
      FROM articles 
      GROUP BY status
    `;
    
    console.log('\n📈 الإحصائيات النهائية:');
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} مقال`);
    });

    // 8. فحص نهائي للتأكد من الإصلاح
    console.log('\n🔍 فحص نهائي...');
    
    const finalCheck = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM articles WHERE author_id IS NULL AND status != 'deleted') as without_author,
        (SELECT COUNT(*) FROM articles WHERE category_id IS NULL AND status != 'deleted') as without_category
    `;
    
    const check = finalCheck[0];
    
    if (check.without_author === 0 && check.without_category === 0) {
      console.log('✅ تم إصلاح جميع البيانات المهجورة بنجاح!');
    } else {
      console.log(`⚠️  ما زال هناك: ${check.without_author} مقال بدون مؤلف، ${check.without_category} مقال بدون تصنيف`);
    }

    console.log('\n🎉 انتهى إصلاح البيانات المهجورة!');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ خطأ فادح:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 