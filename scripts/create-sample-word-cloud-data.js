const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleData() {
  console.log('🌱 إنشاء بيانات تجريبية لسحابة الكلمات...');

  try {
    // إنشاء علامات تجريبية
    const sampleTags = [
      {
        name: 'السعودية',
        slug: 'saudi-arabia',
        description: 'أخبار المملكة العربية السعودية',
        color: '#1E40AF',
        category: 'دول',
        priority: 1,
        total_usage_count: 150,
        views_count: 45000,
        clicks_count: 1200,
        growth_rate: 25.5,
        popularity_score: 67.8
      },
      {
        name: 'الرياض',
        slug: 'riyadh',
        description: 'أخبار العاصمة الرياض',
        color: '#DC2626',
        category: 'مدن',
        priority: 2,
        total_usage_count: 89,
        views_count: 32000,
        clicks_count: 850,
        growth_rate: 18.2,
        popularity_score: 42.3
      },
      {
        name: 'رؤية 2030',
        slug: 'vision-2030',
        description: 'رؤية المملكة 2030',
        color: '#059669',
        category: 'مشاريع',
        priority: 1,
        total_usage_count: 76,
        views_count: 28000,
        clicks_count: 720,
        growth_rate: 35.7,
        popularity_score: 39.1
      },
      {
        name: 'الذكي الاصطناعي',
        slug: 'artificial-intelligence',
        description: 'تقنيات الذكاء الاصطناعي',
        color: '#7C3AED',
        category: 'تقنية',
        priority: 3,
        total_usage_count: 45,
        views_count: 18000,
        clicks_count: 420,
        growth_rate: 67.3,
        popularity_score: 28.9
      },
      {
        name: 'نيوم',
        slug: 'neom',
        description: 'مشروع نيوم المستقبلي',
        color: '#EA580C',
        category: 'مشاريع',
        priority: 2,
        total_usage_count: 62,
        views_count: 22000,
        clicks_count: 580,
        growth_rate: 42.1,
        popularity_score: 35.6
      },
      {
        name: 'الاقتصاد',
        slug: 'economy',
        description: 'الأخبار الاقتصادية',
        color: '#0891B2',
        category: 'اقتصاد',
        priority: 2,
        total_usage_count: 98,
        views_count: 35000,
        clicks_count: 920,
        growth_rate: 12.8,
        popularity_score: 48.7
      },
      {
        name: 'كأس العالم',
        slug: 'world-cup',
        description: 'كأس العالم قطر 2022',
        color: '#BE185D',
        category: 'رياضة',
        priority: 4,
        total_usage_count: 34,
        views_count: 15000,
        clicks_count: 380,
        growth_rate: -5.2,
        popularity_score: 19.4
      },
      {
        name: 'التعليم',
        slug: 'education',
        description: 'أخبار التعليم والجامعات',
        color: '#16A34A',
        category: 'تعليم',
        priority: 3,
        total_usage_count: 67,
        views_count: 24000,
        clicks_count: 640,
        growth_rate: 23.9,
        popularity_score: 32.1
      },
      {
        name: 'الصحة',
        slug: 'health',
        description: 'الأخبار الصحية والطبية',
        color: '#DC2626',
        category: 'صحة',
        priority: 2,
        total_usage_count: 81,
        views_count: 29000,
        clicks_count: 750,
        growth_rate: 15.6,
        popularity_score: 38.4
      },
      {
        name: 'المناخ',
        slug: 'climate',
        description: 'أخبار المناخ والبيئة',
        color: '#059669',
        category: 'بيئة',
        priority: 3,
        total_usage_count: 52,
        views_count: 19000,
        clicks_count: 490,
        growth_rate: 28.7,
        popularity_score: 26.8
      }
    ];

    console.log('📝 إنشاء العلامات...');
    
    for (const tagData of sampleTags) {
      try {
        await prisma.tags.create({
          data: {
            ...tagData,
            last_used_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
          }
        });
        console.log(`✅ تم إنشاء العلامة: ${tagData.name}`);
      } catch (error) {
        console.log(`⚠️ العلامة ${tagData.name} موجودة مسبقاً`);
      }
    }

    // إنشاء بيانات تحليلية تجريبية
    console.log('📊 إنشاء البيانات التحليلية...');
    
    const tags = await prisma.tags.findMany({
      where: { is_active: true }
    });

    for (const tag of tags) {
      // إنشاء بيانات تحليلية لآخر 7 أيام
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        try {
          await prisma.tag_analytics.create({
            data: {
              tag_id: tag.id,
              date: date,
              usage_count: Math.floor(Math.random() * 20) + 1,
              article_count: Math.floor(Math.random() * 15) + 1,
              views_count: Math.floor(Math.random() * 5000) + 500,
              clicks_count: Math.floor(Math.random() * 100) + 10,
              interactions: Math.floor(Math.random() * 50) + 5,
              growth_factor: (Math.random() - 0.5) * 50, // -25 إلى +25
              popularity_score: Math.random() * 100
            }
          });
        } catch (error) {
          // تجاهل الأخطاء إذا كانت البيانات موجودة
        }
      }
    }

    console.log('✅ تم إنشاء البيانات التجريبية بنجاح!');
    console.log(`📈 تم إنشاء ${tags.length} علامة مع بيانات تحليلية`);

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
