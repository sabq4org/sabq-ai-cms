const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncTeamWithAuthors() {
  console.log('🔄 مزامنة أعضاء الفريق مع جدول المؤلفين...\n');
  
  try {
    // 1. جلب أعضاء الفريق الذين يكتبون (writers, reporters, editors)
    console.log('📋 1. جلب الكتاب والمراسلين من team_members:');
    const teamWriters = await prisma.team_members.findMany({
      where: { 
        role: { in: ['writer', 'reporter', 'editor', 'chief_editor'] },
        is_active: true
      },
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
    
    console.log(`   ✅ وجدت ${teamWriters.length} كاتب/مراسل نشط في الفريق`);
    
    // 2. جلب المؤلفين الحاليين
    const existingAuthors = await prisma.article_authors.findMany({
      select: { 
        id: true, 
        full_name: true, 
        email: true 
      }
    });
    
    console.log(`   📊 المؤلفين الحاليين في article_authors: ${existingAuthors.length}`);
    
    // 3. تحديد من يحتاج إضافة
    const toAdd = teamWriters.filter(member => 
      !existingAuthors.some(author => 
        author.full_name === member.name || 
        (author.email && member.email && author.email === member.email)
      )
    );
    
    console.log(`\n📝 2. أعضاء الفريق المطلوب إضافتهم (${toAdd.length}):`);
    toAdd.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.role}) - ${member.email || 'لا يوجد بريد'}`);
    });
    
    // 4. إضافة الأعضاء المفقودين
    if (toAdd.length > 0) {
      console.log('\n🔄 3. إضافة الأعضاء المفقودين...');
      
      for (const member of toAdd) {
        try {
          // إنشاء slug من الاسم
          const slug = member.name
            ?.toLowerCase()
            .replace(/[^\w\s\u0600-\u06FF]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '') || 
            `author-${Date.now()}`;
          
          // تحديد العنوان الوظيفي
          const titleMap = {
            'writer': 'كاتب',
            'reporter': 'مراسل',
            'editor': 'محرر',
            'chief_editor': 'رئيس التحرير'
          };
          
          const title = titleMap[member.role] || member.department || 'كاتب';
          
          // إنشاء المؤلف الجديد
          const newAuthor = await prisma.article_authors.create({
            data: {
              id: `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              full_name: member.name,
              slug: slug,
              title: title,
              bio: member.bio || `${title} متخصص في ${member.department || 'المحتوى العام'}`,
              email: member.email,
              avatar_url: member.avatar,
              social_links: member.social_links || {},
              specializations: member.department ? [member.department] : ['كتابة عامة'],
              is_active: true,
              role: member.role,
              total_articles: 0,
              total_views: 0,
              total_likes: 0,
              total_shares: 0,
              ai_score: 0.0,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          
          console.log(`   ✅ تم إضافة: ${member.name} (${newAuthor.id})`);
          
          // تأخير صغير لتجنب تضارب المعرفات
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`   ❌ خطأ في إضافة ${member.name}:`, error.message);
        }
      }
    }
    
    // 5. فحص البيانات المحدثة
    console.log('\n📊 4. فحص النتائج النهائية:');
    const finalAuthors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: { 
        id: true, 
        full_name: true, 
        role: true,
        email: true
      }
    });
    
    console.log(`   📊 إجمالي المؤلفين النشطين الآن: ${finalAuthors.length}`);
    
    // 6. تحقق من التطابق
    const stillMissing = teamWriters.filter(member => 
      !finalAuthors.some(author => 
        author.full_name === member.name || 
        (author.email && member.email && author.email === member.email)
      )
    );
    
    if (stillMissing.length === 0) {
      console.log('   ✅ جميع أعضاء الفريق موجودين الآن في article_authors');
    } else {
      console.log(`   ⚠️ لا يزال هناك ${stillMissing.length} عضو مفقود:`);
      stillMissing.forEach(member => {
        console.log(`      - ${member.name} (${member.role})`);
      });
    }
    
    // 7. اقتراحات إضافية
    console.log('\n💡 5. اقتراحات للتحسين:');
    console.log('   1. تحديث المقالات الموجودة لربطها بالمؤلفين الصحيحين');
    console.log('   2. إنشاء نظام مزامنة تلقائي بين team_members و article_authors');
    console.log('   3. إضافة validation في النموذج للتأكد من وجود المؤلف');
    
    console.log('\n✅ تمت المزامنة بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في المزامنة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
syncTeamWithAuthors()
  .then(() => {
    console.log('\n🎉 تم الانتهاء من المزامنة');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  });