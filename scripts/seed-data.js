const { PrismaClient } = require('@prisma/client');

async function seedData() {
  console.log('🌱 بدء إضافة البيانات الأساسية...');
  
  try {
    const prisma = new PrismaClient();
    
    // إنشاء الأقسام الأساسية
    const categories = await Promise.all([
      prisma.categories.upsert({
        where: { slug: 'local-news' },
        update: {},
        create: {
          name: 'أخبار محلية',
          slug: 'local-news',
          description: 'آخر الأخبار المحلية والمستجدات',
          color: '#FF6B6B',
          icon: 'news',
          is_active: true
        }
      }),
      prisma.categories.upsert({
        where: { slug: 'world-news' },
        update: {},
        create: {
          name: 'أخبار عالمية',
          slug: 'world-news',
          description: 'أهم الأخبار العالمية والدولية',
          color: '#4ECDC4',
          icon: 'globe',
          is_active: true
        }
      }),
      prisma.categories.upsert({
        where: { slug: 'sports' },
        update: {},
        create: {
          name: 'رياضة',
          slug: 'sports',
          description: 'أخبار الرياضة والبطولات',
          color: '#45B7D1',
          icon: 'sports',
          is_active: true
        }
      }),
      prisma.categories.upsert({
        where: { slug: 'technology' },
        update: {},
        create: {
          name: 'تقنية',
          slug: 'technology',
          description: 'آخر أخبار التقنية والابتكار',
          color: '#96CEB4',
          icon: 'tech',
          is_active: true
        }
      })
    ]);
    
    console.log(`✅ تم إنشاء ${categories.length} قسم`);
    
    // إنشاء مقالات تجريبية
    const articles = await Promise.all([
      prisma.articles.upsert({
        where: { slug: 'welcome-to-sabq' },
        update: {},
        create: {
          title: 'مرحباً بكم في صحيفة سبق الذكية',
          slug: 'welcome-to-sabq',
          excerpt: 'نرحب بكم في النسخة الجديدة من صحيفة سبق المدعومة بالذكاء الاصطناعي',
          content: '<p>هذا المحتوى التجريبي لاختبار النظام. صحيفة سبق تقدم أحدث الأخبار والمعلومات باستخدام تقنيات الذكاء الاصطناعي المتطورة.</p><p>نسعى لتقديم تجربة قراءة مميزة ومحتوى عالي الجودة لقرائنا الكرام.</p>',
          status: 'published',
          featured: true,
          breaking: false,
          category_id: categories[0].id,
          author_id: 'system',
          published_at: new Date(),
          views: 150,
          reading_time: 2,
          seo_title: 'مرحباً بكم في صحيفة سبق الذكية',
          seo_description: 'نرحب بكم في النسخة الجديدة من صحيفة سبق المدعومة بالذكاء الاصطناعي'
        }
      }),
      prisma.articles.upsert({
        where: { slug: 'ai-powered-news' },
        update: {},
        create: {
          title: 'الأخبار المدعومة بالذكاء الاصطناعي تغير مستقبل الصحافة',
          slug: 'ai-powered-news',
          excerpt: 'كيف يغير الذكاء الاصطناعي مستقبل الصحافة والإعلام الرقمي',
          content: '<p>يشهد عالم الصحافة والإعلام تطوراً مذهلاً مع دخول تقنيات الذكاء الاصطناعي.</p><p>من تحليل البيانات إلى إنتاج المحتوى، تساعد هذه التقنيات في تقديم أخبار أكثر دقة وسرعة.</p><p>صحيفة سبق تستخدم أحدث هذه التقنيات لخدمة قرائها.</p>',
          status: 'published',
          featured: false,
          breaking: false,
          category_id: categories[3].id,
          author_id: 'system',
          published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // يوم واحد في الماضي
          views: 89,
          reading_time: 3,
          seo_title: 'الذكاء الاصطناعي في الصحافة',
          seo_description: 'كيف يغير الذكاء الاصطناعي مستقبل الصحافة والإعلام الرقمي'
        }
      }),
      prisma.articles.upsert({
        where: { slug: 'sports-update' },
        update: {},
        create: {
          title: 'أحدث الأخبار الرياضية والبطولات العربية',
          slug: 'sports-update',
          excerpt: 'تغطية شاملة لأهم الأحداث الرياضية والمباريات المهمة',
          content: '<p>نقدم لكم أحدث الأخبار الرياضية من البطولات المحلية والعربية والعالمية.</p><p>تابعوا معنا النتائج والتحليلات الرياضية المتخصصة.</p>',
          status: 'published',
          featured: true,
          breaking: false,
          category_id: categories[2].id,
          author_id: 'system',
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // ساعتان في الماضي
          views: 234,
          reading_time: 4,
          seo_title: 'أحدث الأخبار الرياضية',
          seo_description: 'تغطية شاملة لأهم الأحداث الرياضية والبطولات العربية'
        }
      })
    ]);
    
    console.log(`✅ تم إنشاء ${articles.length} مقال`);
    
    await prisma.$disconnect();
    console.log('🎉 تم إنشاء البيانات الأساسية بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error.message);
    process.exit(1);
  }
}

seedData();
