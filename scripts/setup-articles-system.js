const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * إعداد نظام المقالات والكتّاب الجديد
 * - تشغيل migrations
 * - إنشاء كتّاب تجريبيين
 * - إنشاء مقالات تجريبية
 * - ربط البيانات وتحديث الإحصائيات
 */

async function setupArticlesSystem() {
  try {
    console.log('🚀 بدء إعداد نظام المقالات والكتّاب...\n');
    
    // 1. التحقق من وجود الجداول
    console.log('📊 التحقق من قاعدة البيانات...');
    
    try {
      await prisma.article_authors.findFirst();
      console.log('✅ جدول article_authors موجود');
    } catch (error) {
      console.log('❌ جدول article_authors غير موجود - يجب تشغيل migration أولاً');
      console.log('💡 قم بتشغيل: npx prisma db push');
      return;
    }
    
    // 2. إنشاء كتّاب تجريبيين
    console.log('\n👥 إنشاء كتّاب تجريبيين...');
    
    const authorsData = [
      {
        id: `author_${Date.now()}_1`,
        full_name: 'د. أحمد السعيد',
        slug: 'ahmed-alsaeed-expert',
        title: 'خبير اقتصادي',
        bio: 'خبير في الاقتصاد والتنمية المستدامة، حاصل على درجة الدكتوراه في الاقتصاد من جامعة هارفارد. له خبرة أكثر من 15 عاماً في التحليل الاقتصادي والاستشارات المالية.',
        email: 'ahmed.saeed@sabq.io',
        avatar_url: '/images/writers/ahmed-saeed.jpg',
        social_links: {
          twitter: 'https://twitter.com/ahmed_saeed_eco',
          linkedin: 'https://linkedin.com/in/ahmed-saeed',
          website: 'https://ahmed-saeed.com'
        },
        specializations: ['الاقتصاد', 'التنمية المستدامة', 'الأسواق المالية'],
        is_active: true
      },
      {
        id: `author_${Date.now()}_2`,
        full_name: 'فاطمة الزهراني',
        slug: 'fatima-alzahrani-tech',
        title: 'محللة تقنية',
        bio: 'محللة تقنية متخصصة في الذكاء الاصطناعي وتقنيات المستقبل. تعمل في مجال التقنية منذ أكثر من 10 سنوات وتكتب عن التطورات التقنية وتأثيرها على المجتمع.',
        email: 'fatima.zahrani@sabq.io',
        avatar_url: '/images/writers/fatima-zahrani.jpg',
        social_links: {
          twitter: 'https://twitter.com/fatima_tech',
          linkedin: 'https://linkedin.com/in/fatima-zahrani'
        },
        specializations: ['التقنية', 'الذكاء الاصطناعي', 'الابتكار'],
        is_active: true
      },
      {
        id: `author_${Date.now()}_3`,
        full_name: 'محمد العتيبي',
        slug: 'mohammed-alotaibi-politics',
        title: 'محلل سياسي',
        bio: 'محلل سياسي ومتخصص في الشؤون الإقليمية والدولية. حاصل على ماجستير في العلوم السياسية ويكتب في الصحف والمجلات المتخصصة منذ أكثر من 12 عاماً.',
        email: 'mohammed.otaibi@sabq.io',
        avatar_url: '/images/writers/mohammed-otaibi.jpg',
        social_links: {
          twitter: 'https://twitter.com/mohammed_politics',
          website: 'https://mohammed-analysis.com'
        },
        specializations: ['السياسة', 'الشؤون الدولية', 'التحليل الإستراتيجي'],
        is_active: true
      }
    ];
    
    const createdAuthors = [];
    
    for (const authorData of authorsData) {
      try {
        const existingAuthor = await prisma.article_authors.findUnique({
          where: { slug: authorData.slug }
        });
        
        if (!existingAuthor) {
          const author = await prisma.article_authors.create({
            data: authorData
          });
          createdAuthors.push(author);
          console.log(`✅ تم إنشاء الكاتب: ${author.full_name}`);
        } else {
          console.log(`⚠️ الكاتب موجود مسبقاً: ${authorData.full_name}`);
          createdAuthors.push(existingAuthor);
        }
      } catch (error) {
        console.log(`❌ خطأ في إنشاء الكاتب ${authorData.full_name}:`, error.message);
      }
    }
    
    // 3. إنشاء مقالات تجريبية
    console.log('\n📝 إنشاء مقالات تجريبية...');
    
    const articlesData = [
      {
        title: 'مستقبل الاقتصاد السعودي في ظل رؤية 2030',
        content: `يشهد الاقتصاد السعودي تحولاً جذرياً في إطار رؤية المملكة 2030، التي تهدف إلى تنويع مصادر الدخل وتقليل الاعتماد على النفط.

تركز الرؤية على ثلاثة محاور أساسية: مجتمع حيوي واقتصاد مزدهر ووطن طموح. وفي المحور الاقتصادي، تسعى المملكة إلى زيادة مساهمة القطاع الخاص في الناتج المحلي الإجمالي من 40% إلى 65%.

من أبرز المشاريع الطموحة مشروع نيوم الذي يمثل نموذجاً للمدن الذكية المستقبلية، ومشروع القدية الذي سيكون أكبر مدينة ترفيهية في العالم.

كما تركز الرؤية على تطوير القطاعات الواعدة مثل السياحة والطاقة المتجددة والتقنية المالية والذكاء الاصطناعي.

التحديات التي تواجه هذا التحول تشمل الحاجة إلى تطوير المهارات البشرية وجذب الاستثمارات الأجنبية وبناء بيئة تنظيمية محفزة للابتكار.`,
        article_type: 'analysis',
        author_id: createdAuthors[0]?.id || authorsData[0].id,
        tags: ['اقتصاد', 'رؤية 2030', 'تنويع الاقتصاد', 'نيوم'],
        status: 'published'
      },
      {
        title: 'الذكاء الاصطناعي وتحول مستقبل العمل',
        content: `يعيد الذكاء الاصطناعي تشكيل مشهد العمل العالمي بشكل جذري، مما يطرح تساؤلات مهمة حول مستقبل الوظائف والمهارات المطلوبة.

وفقاً لدراسات حديثة، قد يؤثر الذكاء الاصطناعي على حوالي 47% من الوظائف الحالية في العقدين القادمين. لكن هذا لا يعني بالضرورة اختفاء هذه الوظائف، بل تطورها وتغير طبيعتها.

الوظائف التي تتطلب الإبداع والتفكير النقدي والتفاعل الإنساني ستبقى أقل تأثراً، بينما الوظائف الروتينية ستشهد أتمتة أكبر.

من المهم أن تستثمر الشركات والحكومات في إعادة تأهيل العمالة وتطوير المهارات الرقمية. كما يجب وضع سياسات تضمن توزيعاً عادلاً لفوائد التقنية.

المملكة العربية السعودية تسعى لتكون رائدة في هذا المجال من خلال مبادرات مثل الهيئة السعودية للذكاء الاصطناعي ومشاريع المدن الذكية.`,
        article_type: 'opinion',
        author_id: createdAuthors[1]?.id || authorsData[1].id,
        tags: ['ذكاء اصطناعي', 'مستقبل العمل', 'تقنية', 'رقمنة'],
        status: 'published'
      },
      {
        title: 'التحولات الجيوسياسية في الشرق الأوسط',
        content: `يشهد الشرق الأوسط تحولات جيوسياسية مهمة تعيد تشكيل خريطة التحالفات والنفوذ في المنطقة.

من أبرز هذه التحولات اتفاقيات إبراهيم التي أدت إلى تطبيع العلاقات بين إسرائيل وعدد من الدول العربية، مما غير المعادلات التقليدية.

كما تلعب المملكة العربية السعودية دوراً محورياً في إعادة تشكيل المنطقة من خلال رؤيتها الإصلاحية ومبادراتها الدبلوماسية الجديدة.

التحديات الرئيسية تشمل الصراعات المستمرة في سوريا واليمن وليبيا، والتنافس الإقليمي بين القوى الكبرى، والحاجة إلى التوصل لحلول سياسية مستدامة.

من جانب آخر، تبرز أهمية التعاون الاقتصادي والتكامل الإقليمي كعوامل استقرار، خاصة في مجالات الطاقة والتجارة والاستثمار.

المستقبل يتطلب نهجاً أكثر براغماتية يركز على المصالح المشتركة والتنمية المستدامة بدلاً من الصراعات الأيديولوجية.`,
        article_type: 'analysis',
        author_id: createdAuthors[2]?.id || authorsData[2].id,
        tags: ['سياسة', 'جيوسياسة', 'شرق أوسط', 'دبلوماسية'],
        status: 'published'
      }
    ];
    
    const createdArticles = [];
    
    for (let i = 0; i < articlesData.length; i++) {
      const articleData = articlesData[i];
      
      try {
        const articleId = `article_${Date.now()}_${i}`;
        const slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100);
        
        // حساب وقت القراءة
        const wordCount = articleData.content.split(' ').length;
        const readingTime = Math.ceil(wordCount / 225);
        
        const article = await prisma.articles.create({
          data: {
            id: articleId,
            title: articleData.title,
            slug: `${slug}-${Date.now()}`,
            content: articleData.content,
            article_author_id: articleData.author_id,
            article_type: articleData.article_type,
            status: articleData.status,
            published_at: new Date(),
            reading_time: readingTime,
            tags: articleData.tags,
            views: Math.floor(Math.random() * 1000) + 100,
            likes: Math.floor(Math.random() * 50) + 10,
            shares: Math.floor(Math.random() * 20) + 5,
            // الحقول المطلوبة الحالية  
            author_id: '84a37981-3a15-4810-90e1-e17baa3550d7', // مدير النظام
            updated_at: new Date(),
          }
        });
        
        createdArticles.push(article);
        console.log(`✅ تم إنشاء المقال: ${article.title}`);
        
      } catch (error) {
        console.log(`❌ خطأ في إنشاء المقال "${articleData.title}":`, error.message);
      }
    }
    
    // 4. توليد المحتوى الذكي للمقالات
    console.log('\n🤖 توليد المحتوى الذكي...');
    
    for (const article of createdArticles) {
      try {
        // توليد ملخص بسيط
        const summary = article.content.substring(0, 200) + '...';
        
        // اقتباسات بسيطة (عادة ستأتي من AI)
        const sentences = article.content.split('.');
        const quotes = sentences
          .filter(s => s.length > 50 && s.length < 150)
          .slice(0, 3)
          .map(s => s.trim());
        
        // تحديث المقال بالمحتوى الذكي
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            summary: summary,
            ai_quotes: quotes
          }
        });
        
        // إنشاء اقتباسات منفصلة
        for (let i = 0; i < quotes.length; i++) {
          await prisma.article_quotes.create({
            data: {
              id: `quote_${Date.now()}_${article.id}_${i}`,
              article_id: article.id,
              quote_text: quotes[i],
              quote_order: i + 1,
              ai_confidence: 0.8,
              is_featured: i === 0
            }
          });
        }
        
        console.log(`🤖 تم توليد محتوى ذكي للمقال: ${article.title}`);
        
      } catch (error) {
        console.log(`❌ خطأ في توليد المحتوى الذكي للمقال "${article.title}":`, error.message);
      }
    }
    
    // 5. تحديث إحصائيات الكتّاب
    console.log('\n📊 تحديث إحصائيات الكتّاب...');
    
    for (const author of createdAuthors) {
      try {
        // حساب إحصائيات المؤلف
        const authorArticles = await prisma.articles.findMany({
          where: {
            article_author_id: author.id,
            status: 'published'
          }
        });
        
        const totalArticles = authorArticles.length;
        const totalViews = authorArticles.reduce((sum, article) => sum + article.views, 0);
        const totalLikes = authorArticles.reduce((sum, article) => sum + article.likes, 0);
        const totalShares = authorArticles.reduce((sum, article) => sum + article.shares, 0);
        const avgReadingTime = authorArticles.length > 0 
          ? authorArticles.reduce((sum, article) => sum + (article.reading_time || 5), 0) / authorArticles.length
          : 0;
        
        // AI Score بسيط (عادة سيحسب بطريقة أكثر تعقيداً)
        const aiScore = Math.min(100, Math.max(0, 
          (totalArticles * 10) + 
          (totalViews / 10) + 
          (totalLikes * 2) + 
          (totalShares * 3)
        ));
        
        // تحديث إحصائيات المؤلف
        await prisma.article_authors.update({
          where: { id: author.id },
          data: {
            total_articles: totalArticles,
            total_views: totalViews,
            total_likes: totalLikes,
            total_shares: totalShares,
            ai_score: aiScore,
            last_article_at: authorArticles.length > 0 
              ? new Date(Math.max(...authorArticles.map(a => new Date(a.published_at || a.created_at).getTime())))
              : null
          }
        });
        
        console.log(`📊 تم تحديث إحصائيات: ${author.full_name} (${totalArticles} مقال، ${totalViews} مشاهدة)`);
        
      } catch (error) {
        console.log(`❌ خطأ في تحديث إحصائيات ${author.full_name}:`, error.message);
      }
    }
    
    // 6. إنشاء تحليلات يومية تجريبية
    console.log('\n📈 إنشاء تحليلات يومية...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const author of createdAuthors) {
      try {
        const existingAnalytics = await prisma.author_analytics.findUnique({
          where: {
            author_id_date: {
              author_id: author.id,
              date: today
            }
          }
        });
        
        if (!existingAnalytics) {
          await prisma.author_analytics.create({
            data: {
              id: `analytics_${Date.now()}_${author.id}`,
              author_id: author.id,
              date: today,
              articles_published: Math.floor(Math.random() * 3),
              total_views: Math.floor(Math.random() * 500) + 100,
              total_likes: Math.floor(Math.random() * 50) + 10,
              total_shares: Math.floor(Math.random() * 20) + 5,
              engagement_rate: Math.random() * 10 + 5,
              reading_time_avg: Math.random() * 5 + 3
            }
          });
          
          console.log(`📈 تم إنشاء تحليلات يومية للكاتب: ${author.full_name}`);
        }
      } catch (error) {
        console.log(`❌ خطأ في إنشاء التحليلات للكاتب ${author.full_name}:`, error.message);
      }
    }
    
    // 7. تقرير النتائج
    console.log('\n🎉 تم إعداد نظام المقالات بنجاح!');
    console.log('\n📋 ملخص الإعداد:');
    console.log(`👥 الكتّاب: ${createdAuthors.length} كاتب`);
    console.log(`📝 المقالات: ${createdArticles.length} مقال`);
    
    console.log('\n🔗 روابط مفيدة:');
    console.log('📊 لوحة التحكم: /admin/articles');
    console.log('➕ مقال جديد: /admin/articles/new');
    
    createdAuthors.forEach(author => {
      console.log(`👤 ${author.full_name}: /writer/${author.slug}`);
    });
    
    console.log('\n✅ النظام جاهز للاستخدام!');
    
  } catch (error) {
    console.error('❌ خطأ عام في إعداد النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupArticlesSystem();