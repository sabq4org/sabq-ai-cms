const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestAuthor() {
  try {
    console.log('🚀 إنشاء مؤلف تجريبي...');
    
    // إنشاء مؤلف في جدول article_authors
    const author = await prisma.article_authors.upsert({
      where: { id: 'author_1754256527658_j845ab0fp' },
      update: {},
      create: {
        id: 'author_1754256527658_j845ab0fp',
        full_name: 'مؤلف تجريبي',
        slug: 'test-author',
        email: 'test@example.com',
        bio: 'كاتب ومؤلف تجريبي',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء المؤلف:', author);
    
    // إنشاء مستخدم مطابق في جدول users للتوافق
    try {
      const user = await prisma.users.upsert({
        where: { id: author.id },
        update: {},
        create: {
          id: author.id,
          name: author.full_name,
          email: author.email,
          role: 'editor',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ تم التأكد من المستخدم المطابق:', user);
    } catch (userError) {
      console.log('ℹ️ خطأ في المستخدم:', userError.message);
    }
    
    // إنشاء تصنيف إذا لم يكن موجوداً
    const category = await prisma.categories.upsert({
      where: { id: 'cat-001' },
      update: {},
      create: {
        id: 'cat-001',
        name: 'أخبار عامة',
        slug: 'general-news',
        description: 'تصنيف للأخبار العامة',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم التأكد من وجود التصنيف:', category);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAuthor();
