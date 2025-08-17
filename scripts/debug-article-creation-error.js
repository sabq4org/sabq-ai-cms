const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugArticleCreationError() {
  console.log('🔍 تشخيص خطأ إنشاء المقال "المؤلف غير موجود"...\n');
  
  try {
    // 1. فحص API articles وما يتوقعه
    console.log('📋 1. فحص ملف API articles للتحقق من validation:');
    
    // قراءة API articles للفهم
    const fs = require('fs');
    const path = require('path');
    
    const apiPath = path.join(process.cwd(), 'app/api/articles/route.ts');
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // البحث عن validation المؤلف
      const authorValidationMatch = apiContent.match(/findUnique.*where.*id.*authorId/s);
      if (authorValidationMatch) {
        console.log('   ✅ وجدت validation للمؤلف في API');
        
        // البحث عن أي جدول يتم فحصه
        const tableMatches = apiContent.match(/prisma\.(\w+)\.findUnique/g);
        if (tableMatches) {
          console.log('   📋 الجداول المفحوصة:', tableMatches.map(m => m.replace('prisma.', '').replace('.findUnique', '')));
        }
      } else {
        console.log('   ❌ لم أجد validation للمؤلف في API');
      }
    }
    
    // 2. فحص البيانات الحالية في قاعدة البيانات
    console.log('\n📋 2. فحص البيانات في قاعدة البيانات:');
    
    // فحص جدول users
    const usersCount = await prisma.users.count();
    const users = await prisma.users.findMany({
      where: { role: { not: 'user' } },
      select: { id: true, name: true, role: true, email: true },
      take: 10
    });
    
    console.log(`   👤 users (غير العاديين): ${users.length} من ${usersCount}`);
    if (users.length > 0) {
      console.log('   📝 عينة من المستخدمين:');
      users.slice(0, 5).forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.name} (${user.id}) - ${user.role}`);
      });
    }
    
    // فحص جدول article_authors
    const authorsCount = await prisma.article_authors.count();
    const authors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: { id: true, full_name: true, role: true, email: true },
      take: 10
    });
    
    console.log(`\n   📝 article_authors (نشط): ${authors.length} من ${authorsCount}`);
    if (authors.length > 0) {
      console.log('   📝 عينة من المؤلفين:');
      authors.slice(0, 5).forEach((author, index) => {
        console.log(`      ${index + 1}. ${author.full_name} (${author.id}) - ${author.role || 'غير محدد'}`);
      });
    }
    
    // فحص جدول reporters
    try {
      const reportersCount = await prisma.reporters.count();
      const reporters = await prisma.reporters.findMany({
        select: { id: true, full_name: true, user_id: true },
        take: 5
      });
      
      console.log(`\n   📰 reporters: ${reporters.length} من ${reportersCount}`);
      if (reporters.length > 0) {
        console.log('   📝 عينة من المراسلين:');
        reporters.forEach((reporter, index) => {
          console.log(`      ${index + 1}. ${reporter.full_name} (${reporter.id}) - user_id: ${reporter.user_id}`);
        });
      }
    } catch (error) {
      console.log('   ❌ جدول reporters غير متاح أو يحتوي أخطاء');
    }
    
    // 3. محاولة فهم المعرف المُرسل في الطلب
    console.log('\n📋 3. تحليل المعرفات المحتملة:');
    
    // فحص آخر المقالات لمعرفة نمط author_id
    const recentArticles = await prisma.articles.findMany({
      select: { id: true, title: true, author_id: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    if (recentArticles.length > 0) {
      console.log('   📰 آخر المقالات وauthor_id المستخدم:');
      recentArticles.forEach((article, index) => {
        console.log(`      ${index + 1}. "${article.title.substring(0, 30)}..." - author_id: ${article.author_id || 'NULL'}`);
      });
      
      // تحليل أنماط author_id
      const authorIds = recentArticles.map(a => a.author_id).filter(Boolean);
      const uniquePatterns = [...new Set(authorIds.map(id => {
        if (id.startsWith('user-')) return 'user-*';
        if (id.startsWith('author_')) return 'author_*';
        if (id.includes('-')) return 'uuid-like';
        return 'other';
      }))];
      
      console.log(`   🔍 أنماط author_id المستخدمة: ${uniquePatterns.join(', ')}`);
    }
    
    // 4. فحص أي معرف author_id يطابق البيانات الموجودة
    console.log('\n📋 4. فحص تطابق author_id مع الجداول:');
    
    if (recentArticles.length > 0) {
      const sampleAuthorId = recentArticles[0].author_id;
      if (sampleAuthorId) {
        console.log(`   🧪 اختبار author_id عينة: ${sampleAuthorId}`);
        
        // فحص في users
        const userMatch = await prisma.users.findUnique({
          where: { id: sampleAuthorId },
          select: { id: true, name: true, role: true }
        });
        
        if (userMatch) {
          console.log(`   ✅ موجود في users: ${userMatch.name} (${userMatch.role})`);
        } else {
          console.log(`   ❌ غير موجود في users`);
        }
        
        // فحص في article_authors
        const authorMatch = await prisma.article_authors.findUnique({
          where: { id: sampleAuthorId },
          select: { id: true, full_name: true, role: true }
        });
        
        if (authorMatch) {
          console.log(`   ✅ موجود في article_authors: ${authorMatch.full_name} (${authorMatch.role || 'غير محدد'})`);
        } else {
          console.log(`   ❌ غير موجود في article_authors`);
        }
        
        // فحص في reporters
        try {
          const reporterMatch = await prisma.reporters.findFirst({
            where: { 
              OR: [
                { id: sampleAuthorId },
                { user_id: sampleAuthorId }
              ]
            },
            select: { id: true, full_name: true, user_id: true }
          });
          
          if (reporterMatch) {
            console.log(`   ✅ موجود في reporters: ${reporterMatch.full_name}`);
          } else {
            console.log(`   ❌ غير موجود في reporters`);
          }
        } catch (error) {
          console.log(`   ❌ خطأ في فحص reporters: ${error.message}`);
        }
      }
    }
    
    // 5. توصيات للإصلاح
    console.log('\n💡 5. توصيات للإصلاح:');
    console.log('   1. تحديد أي جدول يفحصه API articles للمؤلف');
    console.log('   2. التأكد من أن النموذج يرسل author_id من الجدول الصحيح');
    console.log('   3. إضافة logging في API articles لمعرفة author_id المُرسل');
    console.log('   4. التأكد من أن validation API يفحص الجدول المناسب');
    
    console.log('\n✅ انتهى التشخيص');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
debugArticleCreationError()
  .then(() => {
    console.log('\n🎉 تم الانتهاء من التشخيص');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  });