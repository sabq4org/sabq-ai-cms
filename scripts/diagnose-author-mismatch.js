const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseAuthorMismatch() {
  console.log('🔍 تشخيص شامل لمشكلة عدم تطابق المراسلين/المؤلفين...\n');
  
  try {
    // 1. فحص جدول team_members
    console.log('📋 1. فحص أعضاء الفريق في team_members:');
    const teamMembers = await prisma.team_members.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        department: true,
        is_active: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`   📊 إجمالي أعضاء الفريق: ${teamMembers.length}`);
    
    const writerMembers = teamMembers.filter(m => m.role === 'writer');
    const reporterMembers = teamMembers.filter(m => m.role === 'reporter');
    const editorMembers = teamMembers.filter(m => m.role === 'editor');
    const otherMembers = teamMembers.filter(m => !['writer', 'reporter', 'editor'].includes(m.role));
    
    console.log(`   ✍️ كتاب: ${writerMembers.length}`);
    console.log(`   📰 مراسلين: ${reporterMembers.length}`);
    console.log(`   ✏️ محررين: ${editorMembers.length}`);
    console.log(`   👥 أخرى: ${otherMembers.length}`);
    
    if (teamMembers.length > 0) {
      console.log('\n   📝 قائمة جميع أعضاء الفريق:');
      teamMembers.forEach((member, index) => {
        const activeStatus = member.is_active ? '✅' : '❌';
        console.log(`      ${index + 1}. ${member.name} (${member.role}) ${activeStatus} - ${member.email || 'لا يوجد بريد'}`);
      });
    }
    
    // 2. فحص جدول article_authors
    console.log('\n📋 2. فحص المؤلفين في article_authors:');
    try {
      const articleAuthors = await prisma.article_authors.findMany({
        select: { 
          id: true, 
          full_name: true, 
          email: true, 
          role: true,
          title: true,
          is_active: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' }
      });
      
      console.log(`   📊 إجمالي المؤلفين: ${articleAuthors.length}`);
      
      const activeAuthors = articleAuthors.filter(a => a.is_active);
      const inactiveAuthors = articleAuthors.filter(a => !a.is_active);
      
      console.log(`   ✅ نشط: ${activeAuthors.length}`);
      console.log(`   ❌ غير نشط: ${inactiveAuthors.length}`);
      
      if (articleAuthors.length > 0) {
        console.log('\n   📝 قائمة جميع المؤلفين:');
        articleAuthors.forEach((author, index) => {
          const activeStatus = author.is_active ? '✅' : '❌';
          console.log(`      ${index + 1}. ${author.full_name} (${author.role || 'غير محدد'}) ${activeStatus} - ${author.email || 'لا يوجد بريد'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ جدول article_authors غير موجود أو يحتوي أخطاء:', error.message);
    }
    
    // 3. فحص جدول users  
    console.log('\n📋 3. فحص المستخدمين في users:');
    const users = await prisma.users.findMany({
      where: {
        role: { not: 'user' } // استثناء المستخدمين العاديين
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`   📊 إجمالي المستخدمين (غير العاديين): ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n   📝 قائمة المستخدمين:');
      users.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.name} (${user.role}) - ${user.email}`);
      });
    }
    
    // 4. فحص جدول reporters
    console.log('\n📋 4. فحص المراسلين في reporters:');
    try {
      const reporters = await prisma.reporters.findMany({
        select: { 
          id: true, 
          user_id: true,
          full_name: true, 
          slug: true,
          title: true,
          is_verified: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' }
      });
      
      console.log(`   📊 إجمالي المراسلين: ${reporters.length}`);
      
      if (reporters.length > 0) {
        console.log('\n   📝 قائمة المراسلين:');
        reporters.forEach((reporter, index) => {
          const verifiedStatus = reporter.is_verified ? '✅' : '❌';
          console.log(`      ${index + 1}. ${reporter.full_name} (${reporter.title || 'غير محدد'}) ${verifiedStatus} - user_id: ${reporter.user_id || 'غير مربوط'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ جدول reporters غير موجود أو يحتوي أخطاء:', error.message);
    }
    
    // 5. تحليل التطابق والاختلافات
    console.log('\n🔍 5. تحليل التطابق والاختلافات:');
    
    // مقارنة team_members مع article_authors
    if (teamMembers.length > 0) {
      console.log('\n   🔄 مقارنة team_members مع article_authors:');
      
      try {
        const articleAuthors = await prisma.article_authors.findMany({
          select: { full_name: true, email: true, is_active: true }
        });
        
        const teamWriters = teamMembers.filter(m => ['writer', 'reporter', 'editor'].includes(m.role));
        
        console.log(`   📊 كتاب/مراسلين في الفريق: ${teamWriters.length}`);
        console.log(`   📊 مؤلفين في article_authors: ${articleAuthors.length}`);
        
        // البحث عن المفقودين
        const missingInAuthors = teamWriters.filter(member => 
          !articleAuthors.some(author => 
            author.full_name === member.name || author.email === member.email
          )
        );
        
        const extraInAuthors = articleAuthors.filter(author => 
          !teamWriters.some(member => 
            member.name === author.full_name || member.email === author.email
          )
        );
        
        if (missingInAuthors.length > 0) {
          console.log('\n   ❌ موجود في team_members لكن مفقود في article_authors:');
          missingInAuthors.forEach((member, index) => {
            console.log(`      ${index + 1}. ${member.name} (${member.role}) - ${member.email || 'لا يوجد بريد'}`);
          });
        }
        
        if (extraInAuthors.length > 0) {
          console.log('\n   ❌ موجود في article_authors لكن مفقود في team_members:');
          extraInAuthors.forEach((author, index) => {
            console.log(`      ${index + 1}. ${author.full_name} - ${author.email || 'لا يوجد بريد'}`);
          });
        }
        
        if (missingInAuthors.length === 0 && extraInAuthors.length === 0) {
          console.log('   ✅ البيانات متطابقة بين team_members و article_authors');
        }
        
      } catch (error) {
        console.log('   ❌ خطأ في مقارنة البيانات:', error.message);
      }
    }
    
    // 6. فحص المقالات الأخيرة وauthors المرتبطين
    console.log('\n📋 6. فحص آخر 5 مقالات و author_id المرتبط:');
    const recentArticles = await prisma.articles.findMany({
      select: { 
        id: true, 
        title: true, 
        author_id: true,
        status: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    if (recentArticles.length > 0) {
      recentArticles.forEach((article, index) => {
        console.log(`   ${index + 1}. "${article.title.substring(0, 50)}..." - author_id: ${article.author_id || 'غير محدد'} - ${article.status}`);
      });
    } else {
      console.log('   ❌ لا توجد مقالات في قاعدة البيانات');
    }
    
    console.log('\n✅ انتهى التشخيص الشامل');
    
    // 7. اقتراحات للإصلاح
    console.log('\n💡 اقتراحات للإصلاح:');
    console.log('   1. تشغيل سكريبت لمزامنة team_members مع article_authors');
    console.log('   2. التأكد من أن API /api/admin/article-authors يجلب البيانات الصحيحة');
    console.log('   3. فحص أن صفحات إنشاء المقالات تستخدم الـ API الصحيح');
    console.log('   4. إضافة validation للتأكد من وجود المؤلف قبل حفظ المقال');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
diagnoseAuthorMismatch()
  .then(() => {
    console.log('\n🎉 تم الانتهاء من التشخيص');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  });