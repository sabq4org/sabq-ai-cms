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
    
    // البحث عن تصنيف السياسة أو إنشاؤه
    let politicsCategory = await prisma.categories.findFirst({
      where: { slug: 'politics' }
    });
    
    if (!politicsCategory) {
      politicsCategory = await prisma.categories.findFirst({
        where: { name_ar: { contains: 'سياس' } }
      });
    }
    
    const categoryId = politicsCategory?.id || '1';
    
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

كما يستعرض المؤتمر المشاريع الضخمة الجاري تنفيذها في المملكة مثل مشروع نيوم ومشروع القدية ومشروع البحر الأحمر.

ومن المتوقع أن يشهد المؤتمر توقيع عدد من الاتفاقيات الاستثمارية المهمة التي ستساهم في تنويع الاقتصاد السعودي.`,
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

كما ستستعرض القمة المبادرات السعودية الرائدة في هذا المجال مثل مبادرة السعودية الخضراء ومبادرة الشرق الأوسط الأخضر.

ومن المتوقع أن تخرج القمة بإعلان مشترك يتضمن خطة عمل إقليمية شاملة لمواجهة التحديات البيئية.`,
        excerpt: 'السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية والمناخية بمشاركة وزراء البيئة من دول المنطقة',
        views: 189,
        likes: 28,
        shares: 12
      },
      {
        title: 'تطوير البنية التحتية الرقمية يحقق قفزة نوعية في المملكة',
        content: `حققت المملكة العربية السعودية تقدماً ملحوظاً في تطوير البنية التحتية الرقمية، حيث تصدرت المراتب المتقدمة في عدة مؤشرات دولية متخصصة في التقنية والاتصالات.

وأظهرت التقارير الحديثة تحسناً كبيراً في سرعة الإنترنت وتغطية الشبكات في جميع أنحاء المملكة، بالإضافة إلى زيادة معدلات استخدام الخدمات الرقمية الحكومية.

وساهمت الاستثمارات الضخمة في قطاع التقنية والاتصالات في تعزيز موقع المملكة كمركز تقني إقليمي رائد.

كما شهدت المملكة إطلاق عدة مبادرات تقنية طموحة تهدف إلى رقمنة القطاعات الحكومية والخاصة وتحسين جودة الخدمات المقدمة للمواطنين والمقيمين.

ويأتي هذا التطور في إطار تحقيق أهداف رؤية السعودية 2030 في التحول الرقمي وبناء اقتصاد رقمي متطور.`,
        excerpt: 'المملكة تحقق تقدماً ملحوظاً في البنية التحتية الرقمية وتتصدر مؤشرات التقنية والاتصالات إقليمياً',
        views: 198,
        likes: 35,
        shares: 18
      }
    ];
    
    console.log(`📝 إضافة ${articlesToAdd.length} مقالات جديدة...\n`);
    
    let addedCount = 0;
    
    for (const articleData of articlesToAdd) {
      const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const slug = articleData.title
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
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
            featured_image: `https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            published_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // خلال الأسبوع الماضي
            views: articleData.views,
            likes: articleData.likes,
            shares: articleData.shares,
            reading_time: Math.ceil(articleData.content.length / 1000 * 2), // تقدير وقت القراءة
            allow_comments: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        addedCount++;
        console.log(`   ✅ تم إضافة: ${articleData.title}`);
        
        // تأخير قصير لتجنب التكرار في التواريخ
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ فشل في إضافة: ${articleData.title} - ${error.message}`);
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
    console.log(`   📊 معدل التفاعل: ${((newStats.total_likes + newStats.total_shares) / newStats.total_views * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ خطأ في إضافة المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addArticlesForAli();
