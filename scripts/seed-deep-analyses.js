const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const sampleAnalyses = [
  {
    id: 'analysis-sample-1',
    article_id: 'article-sample-1',
    ai_summary: 'تحليل عميق لتأثير التحول الرقمي على الاقتصاد السعودي في ضوء رؤية 2030',
    key_topics: ['التحول الرقمي', 'رؤية 2030', 'الاقتصاد السعودي', 'التقنية المالية'],
    tags: ['اقتصاد', 'تقنية', 'رؤية 2030'],
    sentiment: 'positive',
    engagement_score: 85,
    metadata: {
      title: 'التحول الرقمي والاقتصاد السعودي: رؤية مستقبلية',
      summary: 'دراسة تحليلية شاملة لتأثير التحول الرقمي على مختلف قطاعات الاقتصاد السعودي',
      authorName: 'د. محمد السعيد',
      categories: ['الاقتصاد', 'التقنية'],
      sourceType: 'original',
      status: 'published',
      qualityScore: 92,
      views: 1250,
      likes: 45,
      readingTime: 8,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
    }
  },
  {
    id: 'analysis-sample-2',
    article_id: 'article-sample-2',
    ai_summary: 'دراسة تحليلية لمستقبل الطاقة المتجددة في المملكة العربية السعودية وأثرها على الاستدامة البيئية',
    key_topics: ['الطاقة المتجددة', 'الاستدامة', 'نيوم', 'الطاقة الشمسية'],
    tags: ['طاقة', 'بيئة', 'استدامة'],
    sentiment: 'positive',
    engagement_score: 78,
    metadata: {
      title: 'مستقبل الطاقة المتجددة في المملكة',
      summary: 'تحليل شامل لمشاريع الطاقة المتجددة وأثرها على تحقيق أهداف الاستدامة',
      authorName: 'م. فاطمة الأحمد',
      categories: ['الطاقة', 'البيئة'],
      sourceType: 'article',
      status: 'published',
      qualityScore: 88,
      views: 890,
      likes: 32,
      readingTime: 6,
      featuredImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80'
    }
  },
  {
    id: 'analysis-sample-3',
    article_id: 'article-sample-3',
    ai_summary: 'تحليل استراتيجي لتطور قطاع السياحة السعودي ودوره في تنويع مصادر الدخل الوطني',
    key_topics: ['السياحة', 'التنويع الاقتصادي', 'العلا', 'البحر الأحمر'],
    tags: ['سياحة', 'اقتصاد', 'ترفيه'],
    sentiment: 'positive',
    engagement_score: 82,
    metadata: {
      title: 'السياحة السعودية: محرك جديد للنمو الاقتصادي',
      summary: 'دراسة معمقة لإستراتيجية تطوير القطاع السياحي وأثره على الاقتصاد الوطني',
      authorName: 'أ. سارة القحطاني',
      categories: ['السياحة', 'الاقتصاد'],
      sourceType: 'gpt',
      status: 'published',
      qualityScore: 90,
      views: 1560,
      likes: 58,
      readingTime: 10,
      featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
    }
  },
  {
    id: 'analysis-sample-4',
    article_id: 'article-sample-4',
    ai_summary: 'تحليل شامل لتأثير الذكاء الاصطناعي على سوق العمل السعودي والمهارات المطلوبة للمستقبل',
    key_topics: ['الذكاء الاصطناعي', 'سوق العمل', 'التعليم', 'المهارات الرقمية'],
    tags: ['تقنية', 'تعليم', 'وظائف'],
    sentiment: 'neutral',
    engagement_score: 75,
    metadata: {
      title: 'الذكاء الاصطناعي وتحولات سوق العمل السعودي',
      summary: 'دراسة تحليلية لتأثير تقنيات الذكاء الاصطناعي على الوظائف والمهارات المستقبلية',
      authorName: 'د. عبدالله الشمري',
      categories: ['التقنية', 'التعليم'],
      sourceType: 'mixed',
      status: 'published',
      qualityScore: 86,
      views: 2100,
      likes: 72,
      readingTime: 12,
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'
    }
  }
];

async function seedDeepAnalyses() {
  console.log('🌱 بدء إضافة التحليلات العميقة...\n');

  try {
    // حذف التحليلات القديمة التجريبية
    console.log('🗑️  حذف التحليلات التجريبية القديمة...');
    await prisma.deep_analyses.deleteMany({
      where: {
        id: {
          startsWith: 'analysis-sample-'
        }
      }
    });

    // إضافة التحليلات الجديدة
    console.log('➕ إضافة التحليلات الجديدة...');
    
    for (const analysis of sampleAnalyses) {
      try {
        await prisma.deep_analyses.create({
          data: {
            ...analysis,
            analyzed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // آخر 7 أيام
            updated_at: new Date()
          }
        });
        console.log(`✅ تم إضافة: ${analysis.metadata.title}`);
      } catch (error) {
        console.error(`❌ فشل إضافة: ${analysis.metadata.title}`, error.message);
      }
    }

    // عرض الإحصائيات
    const totalCount = await prisma.deep_analyses.count();
    console.log(`\n📊 إجمالي التحليلات في قاعدة البيانات: ${totalCount}`);
    
    console.log('\n✨ تمت إضافة البيانات التجريبية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
seedDeepAnalyses().catch(console.error); 