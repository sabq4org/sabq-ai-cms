const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function addMoreData() {
  console.log('📝 إضافة المزيد من البيانات التجريبية...');

  // إضافة المزيد من المقالات
  const articles = [
    {
      id: 'article-002',
      title: 'أحدث التطورات في عالم التقنية',
      slug: 'tech-updates-2025',
      content: 'تطورات مثيرة في عالم التقنية لعام 2025...',
      excerpt: 'أحدث التطورات التقنية',
      category_id: 'cat-004', // تقنية
      status: 'published',
      featured: true
    },
    {
      id: 'article-003', 
      title: 'نتائج الدوري السعودي الأسبوع الماضي',
      slug: 'saudi-league-results',
      content: 'نتائج مثيرة في الدوري السعودي...',
      excerpt: 'نتائج الدوري السعودي',
      category_id: 'cat-003', // رياضة
      status: 'published',
      featured: false
    },
    {
      id: 'article-004',
      title: 'أخبار عاجلة من العالم',
      slug: 'breaking-world-news',
      content: 'أخبار عاجلة ومهمة من حول العالم...',
      excerpt: 'أخبار عاجلة عالمية',
      category_id: 'cat-002', // العالم
      status: 'published',
      breaking: true
    }
  ];

  for (const articleData of articles) {
    await prisma.articles.upsert({
      where: { id: articleData.id },
      update: {},
      create: {
        ...articleData,
        author_id: 'user-admin-001',
        featured: articleData.featured || false,
        breaking: articleData.breaking || false,
        views: Math.floor(Math.random() * 1000),
        allow_comments: true,
        likes: Math.floor(Math.random() * 50),
        saves: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 30),
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ تم إنشاء المقال: ${articleData.title}`);
  }

  // إضافة تعليقات تجريبية
  const comments = [
    {
      id: 'comment-001',
      article_id: 'article-001',
      user_id: 'user-admin-001',
      content: 'مقال ممتاز ومفيد!',
      status: 'approved',
      likes: 5
    },
    {
      id: 'comment-002', 
      article_id: 'article-002',
      user_id: 'user-admin-001',
      content: 'معلومات قيمة عن التقنية',
      status: 'approved',
      likes: 3
    }
  ];

  for (const commentData of comments) {
    await prisma.comments.upsert({
      where: { id: commentData.id },
      update: {},
      create: {
        ...commentData,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`✅ تم إنشاء التعليق على: ${commentData.article_id}`);
  }

  console.log('🎉 تم الانتهاء من إضافة البيانات الإضافية');
}

addMoreData()
  .catch((e) => {
    console.error('❌ خطأ في إضافة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 