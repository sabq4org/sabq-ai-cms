const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addArticlesForAli() {
  try {
    console.log('📰 إضافة مقالات إضافية للمراسل علي الحازمي...\n');
    
    // البحث عن المراسل
    const reporter = await prisma.reporters.findFirst({
      where: { slug: 'ali-alhazmi-389657' }
    });
    
    if (!reporter) {
      console.log('❌ لا يوجد مراسل بهذا الـ slug');
      return;
    }
    
    // البحث عن أول تصنيف متاح
    const category = await prisma.categories.findFirst({
      where: { is_active: true }
    });
    
    const categoryId = category?.id || '1';
    console.log(`📁 استخدام التصنيف: ${category?.name || 'افتراضي'}`);
    
    // مقالات واقعية للمراسل
    const articlesToAdd = [
      {
        title: 'السعودية تؤكد دعمها للحل السلمي في الشرق الأوسط',
        content: `أكدت المملكة العربية السعودية مجدداً التزامها بدعم الحلول السلمية والدبلوماسية لحل النزاعات في منطقة الشرق الأوسط، وذلك خلال كلمة ألقاها مسؤول سعودي رفيع المستوى في منتدى دولي للسلام.

وشدد المسؤول على أن المملكة تسعى دائماً إلى تعزيز الاستقرار والأمن في المنطقة من خلال الحوار البناء والتعاون الإقليمي والدولي.

كما أشار إلى الجهود السعودية المستمرة في دعم المبادرات الدولية الرامية إلى تحقيق السلام والاستقرار، والدور المحوري الذي تلعبه المملكة في الوساطة وحل النزاعات.

وأكد المسؤول أن السعودية ستواصل العمل مع الشركاء الدوليين لإيجاد حلول مستدامة للتحديات الأمنية والسياسية في المنطقة.`,
        excerpt: 'المملكة العربية السعودية تؤكد التزامها بدعم الحلول السلمية والدبلوماسية لحل النزاعات في منطقة الشرق الأوسط',
        views: 156,
        likes: 23,
        shares: 8
      },
      {
        title: 'انطلاق مؤتمر الاستثمار السعودي بمشاركة دولية واسعة',
        content: `انطلقت فعاليات مؤتمر الاستثمار السعودي السنوي في الرياض بمشاركة واسعة من ممثلي القطاع الخاص والمستثمرين من أكثر من 50 دولة حول العالم.

ويهدف المؤتمر إلى استعراض الفرص الاستثمارية المتاحة في المملكة ضمن رؤية 2030، وتعزيز الشراكات الاقتصادية مع الدول والشركات الدولية.

وتشمل فعاليات المؤتمر جلسات حوارية متخصصة في قطاعات متنوعة منها الطاقة والتقنية والصحة والسياحة والصناعات التحويلية.

كما يستعرض المؤتمر المشاريع الضخمة الجاري تنفيذها في المملكة مثل مشروع نيوم ومشروع القدية ومشروع البحر الأحمر.`,
        excerpt: 'مؤتمر الاستثمار السعودي ينطلق بمشاركة دولية واسعة لاستعراض الفرص الاستثمارية ضمن رؤية 2030',
        views: 234,
        likes: 31,
        shares: 15
      },
      {
        title: 'السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية',
        content: `تستضيف المملكة العربية السعودية قمة إقليمية مهمة لمناقشة التحديات البيئية والمناخية في منطقة الشرق الأوسط، بمشاركة وزراء البيئة من دول المنطقة.

وتأتي هذه القمة في إطار الجهود السعودية لتعزيز التعاون الإقليمي في مجال حماية البيئة ومواجهة التغير المناخي، وتنفيذ المبادرات البيئية الطموحة.

وستناقش القمة عدة محاور رئيسية منها الطاقة المتجددة، وحماية التنوع البيولوجي، ومكافحة التصحر، وإدارة المياه بشكل مستدام.

كما ستستعرض القمة المبادرات السعودية الرائدة في هذا المجال مثل مبادرة السعودية الخضراء ومبادرة الشرق الأوسط الأخضر.`,
        excerpt: 'السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية والمناخية بمشاركة وزراء البيئة من دول المنطقة',
        views: 189,
        likes: 28,
        shares: 12
      }
    ];
    
    console.log(`📝 إضافة ${articlesToAdd.length} مقالات جديدة...\n`);
    
    let addedCount = 0;
    
    for (const articleData of articlesToAdd) {
      const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const slug = articleData.title
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
      
      try {
        await prisma.articles.create({
          data: {
            id: articleId,
            title: articleData.title,
            slug: `${slug}-${Date.now()}`,
            content: articleData.content,
            excerpt: articleData.excerpt,
            author_id: reporter.user_id,
            category_id: categoryId,
            status: 'published',
            featured: false,
            breaking: false,
            featured_image: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            published_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            views: articleData.views,
            likes: articleData.likes,
            shares: articleData.shares,
            reading_time: Math.ceil(articleData.content.length / 1000 * 2),
            allow_comments: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        addedCount++;
        console.log(`   ✅ تم إضافة: ${articleData.title}`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`   ❌ فشل في إضافة: ${articleData.title.substring(0, 50)}... - ${error.message}`);
      }
    }
    
    // تحديث إحصائيات المراسل
    const allArticles = await prisma.articles.findMany({
      where: {
        author_id: reporter.user_id,
        status: 'published'
      },
      select: {
        views: true,
        likes: true,
        shares: true
      }
    });
    
    const newStats = {
      total_articles: allArticles.length,
      total_views: allArticles.reduce((sum, article) => sum + (article.views || 0), 0),
      total_likes: allArticles.reduce((sum, article) => sum + (article.likes || 0), 0),
      total_shares: allArticles.reduce((sum, article) => sum + (article.shares || 0), 0)
    };
    
    await prisma.reporters.update({
      where: { id: reporter.id },
      data: {
        total_articles: newStats.total_articles,
        total_views: newStats.total_views,
        total_likes: newStats.total_likes,
        total_shares: newStats.total_shares,
        engagement_rate: newStats.total_views > 0 ? 
          ((newStats.total_likes + newStats.total_shares) / newStats.total_views * 100) : 0
      }
    });
    
    console.log(`\n✅ تم إضافة ${addedCount} مقالات بنجاح!`);
    console.log('\n📊 الإحصائيات المحدثة:');
    console.log(`   📰 إجمالي المقالات: ${newStats.total_articles}`);
    console.log(`   👁️ إجمالي المشاهدات: ${newStats.total_views}`);
    console.log(`   ❤️ إجمالي الإعجابات: ${newStats.total_likes}`);
    console.log(`   📤 إجمالي المشاركات: ${newStats.total_shares}`);
    console.log(`   📊 معدل التفاعل: ${newStats.total_views > 0 ? ((newStats.total_likes + newStats.total_shares) / newStats.total_views * 100).toFixed(2) : 0}%`);
    
    console.log('\n🔗 يمكنك الآن زيارة الصفحة:');
    console.log('   https://sabq.me/reporter/ali-alhazmi-389657');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addArticlesForAli();
