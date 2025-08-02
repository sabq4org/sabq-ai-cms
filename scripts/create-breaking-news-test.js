const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBreakingNewsTest() {
  console.log('🔴 إنشاء خبر عاجل للاختبار...\n');
  
  try {
    // البحث عن مقال مميز موجود لتحويله إلى خبر عاجل
    const existingFeatured = await prisma.articles.findFirst({
      where: {
        featured: true,
        status: 'published'
      },
      orderBy: {
        published_at: 'desc'
      }
    });
    
    if (existingFeatured) {
      console.log(`📰 وجدت مقال مميز موجود: "${existingFeatured.title}"`);
      console.log(`   🆔 معرف المقال: ${existingFeatured.id}`);
      console.log(`   🌟 مميز: ${existingFeatured.featured}`);
      console.log(`   🔴 عاجل: ${existingFeatured.breaking}`);
      
      // تحويله إلى خبر عاجل
      const updatedArticle = await prisma.articles.update({
        where: { id: existingFeatured.id },
        data: {
          breaking: true,
          title: existingFeatured.title.includes('عاجل') 
            ? existingFeatured.title 
            : `🔴 عاجل: ${existingFeatured.title}`,
          updated_at: new Date()
        }
      });
      
      console.log('\n✅ تم تحديث المقال إلى خبر عاجل:');
      console.log(`   📰 العنوان الجديد: "${updatedArticle.title}"`);
      console.log(`   🔴 عاجل: ${updatedArticle.breaking}`);
      console.log(`   🌟 مميز: ${updatedArticle.featured}`);
      
    } else {
      // إنشاء خبر عاجل جديد
      console.log('📝 لا يوجد مقال مميز، سأقوم بإنشاء خبر عاجل جديد...');
      
      // الحصول على مؤلف افتراضي
      const defaultAuthor = await prisma.users.findFirst({
        where: {
          role: { in: ['admin', 'editor'] }
        }
      });
      
      if (!defaultAuthor) {
        throw new Error('لا يوجد مؤلف متاح لإنشاء المقال');
      }
      
      // الحصول على تصنيف افتراضي
      const defaultCategory = await prisma.categories.findFirst({
        where: {
          status: 'active'
        }
      });
      
      const breakingNewsArticle = await prisma.articles.create({
        data: {
          id: `article_${Date.now()}_breaking_test`,
          title: '🔴 عاجل: انفجار قرب السفارة في بيروت - تقارير أولية عن وقوع إصابات',
          slug: `breaking-news-test-${Date.now()}`,
          content: `
            <h2>تفاصيل الحادث العاجل</h2>
            <p>وردت تقارير أولية عن وقوع انفجار قرب المنطقة الدبلوماسية في بيروت، حيث تشير المعلومات الأولية إلى:</p>
            
            <ul>
              <li>وقوع الانفجار في تمام الساعة 14:30 بالتوقيت المحلي</li>
              <li>سماع دوي الانفجار في عدة أحياء مجاورة</li>
              <li>وصول فرق الإسعاف والأمن إلى المكان</li>
              <li>إغلاق الطرق المؤدية إلى المنطقة</li>
            </ul>
            
            <h3>التحديثات المباشرة</h3>
            <p>نتابع الوضع عن كثب ونقدم لكم آخر التطورات أولاً بأول.</p>
            
            <blockquote>
              <p>"نحن نراقب الوضع ونتواصل مع السلطات المختصة"</p>
              <cite>- مصدر أمني مسؤول</cite>
            </blockquote>
            
            <p><strong>تحديث:</strong> تؤكد المصادر الأولية عدم تسجيل إصابات خطيرة حتى الآن.</p>
          `,
          excerpt: 'تقارير أولية عن وقوع انفجار قرب المنطقة الدبلوماسية في بيروت مع وصول فرق الإسعاف إلى المكان',
          author_id: defaultAuthor.id,
          category_id: defaultCategory?.id || null,
          status: 'published',
          featured: true,
          breaking: true, // الأهم: جعله خبر عاجل
          featured_image: '/images/breaking-news-placeholder.jpg',
          published_at: new Date(),
          reading_time: 3,
          views: 0,
          likes: 0,
          shares: 0,
          allow_comments: true,
          article_type: 'news',
          seo_title: 'عاجل: انفجار قرب السفارة في بيروت - آخر التطورات',
          seo_description: 'تابع آخر تطورات الانفجار الذي وقع قرب المنطقة الدبلوماسية في بيروت مع التحديثات المباشرة',
          seo_keywords: 'عاجل، انفجار، بيروت، سفارة، أخبار عاجلة',
          metadata: {
            isBreaking: true,
            breaking: true,
            urgency: 'high',
            location: 'بيروت، لبنان',
            source: 'تقارير ميدانية'
          },
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log('\n✅ تم إنشاء خبر عاجل جديد:');
      console.log(`   🆔 معرف المقال: ${breakingNewsArticle.id}`);
      console.log(`   📰 العنوان: "${breakingNewsArticle.title}"`);
      console.log(`   🔴 عاجل: ${breakingNewsArticle.breaking}`);
      console.log(`   🌟 مميز: ${breakingNewsArticle.featured}`);
      console.log(`   📅 تاريخ النشر: ${breakingNewsArticle.published_at}`);
    }
    
    // فحص النتيجة النهائية
    console.log('\n🔍 فحص الأخبار المميزة والعاجلة:');
    
    const featuredBreaking = await prisma.articles.findMany({
      where: {
        featured: true,
        breaking: true,
        status: 'published'
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 3,
      select: {
        id: true,
        title: true,
        featured: true,
        breaking: true,
        published_at: true
      }
    });
    
    console.log(`📊 عدد الأخبار المميزة والعاجلة: ${featuredBreaking.length}`);
    
    if (featuredBreaking.length > 0) {
      console.log('\n📋 قائمة الأخبار العاجلة المميزة:');
      featuredBreaking.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      🆔 ${article.id}`);
        console.log(`      🔴 عاجل: ${article.breaking} | 🌟 مميز: ${article.featured}`);
        console.log(`      📅 ${article.published_at}\n`);
      });
    }
    
    console.log('\n💡 للاختبار:');
    console.log('   1. تشغيل الموقع: npm run dev');
    console.log('   2. زيارة الصفحة الرئيسية');
    console.log('   3. البحث عن مستطيل الخبر العاجل فوق الصورة المميزة');
    console.log('   4. التأكد من ظهور الخبر بالتصميم الجديد');
    
    console.log('\n✅ انتهى إنشاء اختبار الخبر العاجل');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء اختبار الخبر العاجل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
createBreakingNewsTest()
  .then(() => {
    console.log('\n🎉 تم الانتهاء من إنشاء اختبار الخبر العاجل');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  });