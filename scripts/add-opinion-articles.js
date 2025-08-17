const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

const opinionArticles = [
  {
    title: 'رؤية 2030: نحو مستقبل رقمي مستدام',
    content: 'في ظل التحولات الرقمية المتسارعة، تبرز رؤية المملكة 2030 كخارطة طريق واضحة نحو مستقبل يجمع بين التقدم التقني والاستدامة البيئية. هذا التحول ليس مجرد تطور تقني، بل ثورة حقيقية في طريقة تفكيرنا وعملنا...',
    excerpt: 'تحليل عميق لدور التحول الرقمي في تحقيق أهداف رؤية 2030 وبناء مستقبل مستدام للأجيال القادمة',
    author_name: 'د. محمد الأحمد',
    author_id: '1',
    ai_summary: 'يناقش المقال كيف تساهم التقنيات الرقمية في تحقيق أهداف رؤية 2030، مع التركيز على الاستدامة والابتكار في القطاعات الحيوية.',
    topic_tags: ['رؤية 2030', 'التحول الرقمي', 'الاستدامة', 'الابتكار'],
    reading_time: 7,
    sentiment: 'positive',
    is_featured: true
  },
  {
    title: 'ريادة الأعمال النسائية: قوة التغيير في الاقتصاد السعودي',
    content: 'شهدت السنوات الأخيرة طفرة ملحوظة في ريادة الأعمال النسائية بالمملكة، حيث أثبتت المرأة السعودية قدرتها على القيادة والابتكار في مختلف القطاعات...',
    excerpt: 'قصص نجاح ملهمة لرائدات أعمال سعوديات يقدن التغيير ويساهمن في نمو الاقتصاد الوطني',
    author_name: 'أ. فاطمة النصر',
    author_id: 'fatima-alnasr',
    ai_summary: 'استعراض لإنجازات رائدات الأعمال السعوديات ودورهن في تنويع الاقتصاد وخلق فرص عمل جديدة.',
    topic_tags: ['ريادة الأعمال', 'تمكين المرأة', 'الاقتصاد السعودي', 'الابتكار'],
    reading_time: 5,
    sentiment: 'positive',
    podcast_duration: 12
  },
  {
    title: 'التوازنات الجيوسياسية الجديدة: أين تقف المملكة؟',
    content: 'في عالم متغير تتشكل فيه تحالفات جديدة وتنهار أخرى قديمة، تبرز المملكة العربية السعودية كلاعب محوري في رسم ملامح النظام العالمي الجديد...',
    excerpt: 'تحليل استراتيجي لموقع المملكة في خريطة التوازنات الدولية الجديدة ودورها في صياغة مستقبل المنطقة',
    author_name: 'د. عمر الحربي',
    author_id: 'omar-alharbi',
    ai_summary: 'يحلل المقال الدور المتنامي للمملكة في السياسة الدولية وكيف تستثمر موقعها الاستراتيجي لتعزيز مكانتها العالمية.',
    topic_tags: ['السياسة الدولية', 'الجيوسياسية', 'الشرق الأوسط', 'الدبلوماسية'],
    reading_time: 10,
    sentiment: 'analytical',
    is_trending: true
  },
  {
    title: 'المدن الذكية: بين الطموح والواقع',
    content: 'مع إطلاق مشاريع ضخمة مثل نيوم والقدية، تتجه المملكة نحو بناء مدن المستقبل. لكن ما هي التحديات الحقيقية التي تواجه هذه المشاريع الطموحة؟...',
    excerpt: 'نظرة نقدية على مشاريع المدن الذكية في المملكة والتحديات التقنية والبيئية التي تواجهها',
    author_name: 'م. خالد العتيبي',
    author_id: '3',
    ai_summary: 'يستعرض المقال التحديات والفرص في بناء المدن الذكية، مع التركيز على الجوانب التقنية والبيئية والاجتماعية.',
    topic_tags: ['المدن الذكية', 'نيوم', 'التخطيط العمراني', 'الاستدامة'],
    reading_time: 8,
    sentiment: 'mixed'
  },
  {
    title: 'الهوية الثقافية في عصر العولمة: كيف نحافظ على تراثنا؟',
    content: 'في زمن تذوب فيه الحدود الثقافية، يصبح السؤال الأكثر إلحاحاً: كيف نحافظ على هويتنا الثقافية دون أن ننعزل عن العالم؟...',
    excerpt: 'تأملات في التحديات التي تواجه الهوية الثقافية السعودية وسبل الحفاظ عليها في عصر العولمة',
    author_name: 'د. نورا السديري',
    author_id: '4',
    ai_summary: 'يناقش المقال التوازن بين الحفاظ على التراث والانفتاح على العالم، مع تقديم رؤى عملية للحفاظ على الهوية الثقافية.',
    topic_tags: ['الثقافة', 'الهوية', 'العولمة', 'التراث'],
    reading_time: 6,
    sentiment: 'neutral',
    audio_url: 'dummy-audio-url'
  }
];

async function addOpinionArticles() {
  try {
    console.log('🚀 بدء إضافة مقالات الرأي...');
    
    // الحصول على تصنيف الرأي
    let opinionCategory = await prisma.categories.findFirst({
      where: {
        OR: [
          { slug: 'opinion' },
          { name: 'رأي' }
        ]
      }
    });

    // إذا لم يكن موجوداً، قم بإنشائه
    if (!opinionCategory) {
      console.log('📝 إنشاء تصنيف الرأي...');
      opinionCategory = await prisma.categories.create({
        data: {
          id: crypto.randomUUID(),
          name: 'رأي',
          slug: 'opinion',
          description: 'مقالات الرأي والتحليلات من كبار الكتاب والمفكرين',
          color: '#8B5CF6',
          icon: '💭',
          display_order: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log('✅ تصنيف الرأي جاهز:', opinionCategory.id);

    // إضافة المقالات
    for (const article of opinionArticles) {
      const articleId = crypto.randomUUID();
      const slug = article.title.toLowerCase()
        .replace(/[^\u0600-\u06FF\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const newArticle = await prisma.articles.create({
        data: {
          id: articleId,
          title: article.title,
          slug: slug,
          content: article.content,
          excerpt: article.excerpt,
          category_id: opinionCategory.id,
          status: 'published',
          author_id: article.author_id || 'default-author',
          featured_image: `https://source.unsplash.com/800x400/?${encodeURIComponent(article.topic_tags[0])},arabic`,
          metadata: {
            author_name: article.author_name,
            ai_summary: article.ai_summary,
            topic_tags: article.topic_tags,
            sentiment: article.sentiment,
            podcast_duration: article.podcast_duration,
            audio_url: article.audio_url
          },
          reading_time: article.reading_time,
          views: Math.floor(Math.random() * 10000) + 1000,
          featured: article.is_featured || false,
          published_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // آخر 7 أيام
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ تم إضافة مقال: ${article.title}`);
    }

    console.log('🎉 تم إضافة جميع مقالات الرأي بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في إضافة مقالات الرأي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
addOpinionArticles(); 