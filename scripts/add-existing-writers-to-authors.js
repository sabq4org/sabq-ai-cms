const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addExistingWritersToAuthors() {
  console.log('📝 إضافة الكتاب الموجودين من team_members إلى article_authors...\n');
  
  try {
    // جلب الكتاب من team_members
    const teamWriters = await prisma.team_members.findMany({
      where: { role: 'writer' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        department: true,
        bio: true,
        avatar: true,
        social_links: true,
        created_at: true
      }
    });
    
    console.log(`📊 تم العثور على ${teamWriters.length} كاتب في team_members:`);
    teamWriters.forEach((writer, index) => {
      console.log(`   ${index + 1}. ${writer.name} (${writer.email || 'لا يوجد بريد'}) - ${writer.department || 'لا يوجد قسم'}`);
    });
    
    console.log('\n🔄 نقل الكتاب إلى article_authors...\n');
    
    for (const writer of teamWriters) {
      try {
        // التحقق من وجود الكاتب في article_authors
        const existingAuthor = await prisma.article_authors.findFirst({
          where: {
            OR: [
              { email: writer.email },
              { full_name: writer.name }
            ]
          }
        });
        
        if (existingAuthor) {
          console.log(`⚠️ الكاتب موجود بالفعل في article_authors: ${writer.name}`);
          continue;
        }
        
        // إنشاء slug من الاسم
        const slug = writer.name
          ?.toLowerCase()
          .replace(/[^\w\s\u0600-\u06FF]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '') || 
          `writer-${Date.now()}`;
        
        // إضافة الكاتب إلى article_authors
        const newAuthor = await prisma.article_authors.create({
          data: {
            id: `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            full_name: writer.name,
            slug: slug,
            title: writer.department || 'كاتب',
            bio: writer.bio || `كاتب متخصص في ${writer.department || 'المحتوى العام'}`,
            email: writer.email,
            avatar_url: writer.avatar,
            social_links: writer.social_links || {},
            specializations: writer.department ? [writer.department] : ['كتابة عامة'],
            is_active: true,
            role: 'writer',
            total_articles: 0,
            total_views: 0,
            total_likes: 0,
            total_shares: 0,
            ai_score: 0.0,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        console.log(`✅ تم إضافة الكاتب: ${writer.name} (${newAuthor.id})`);
        
        // تأخير صغير لتجنب تضارب المعرفات
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (writerError) {
        console.error(`❌ خطأ في معالجة الكاتب ${writer.name}:`, writerError.message);
      }
    }
    
    // عرض النتيجة النهائية
    console.log('\n📊 ملخص النتائج النهائية:');
    const totalAuthors = await prisma.article_authors.count({
      where: { is_active: true }
    });
    
    console.log(`✅ إجمالي المؤلفين النشطين: ${totalAuthors}`);
    
    const allAuthors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: { full_name: true, title: true, email: true },
      orderBy: { full_name: 'asc' }
    });
    
    console.log('\n📋 قائمة جميع المؤلفين النشطين:');
    allAuthors.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.full_name} - ${author.title || 'مؤلف'} (${author.email || 'لا يوجد بريد'})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في نقل الكتاب:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addExistingWritersToAuthors();
}

module.exports = { addExistingWritersToAuthors };