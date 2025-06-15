// 🌱 ملف البيانات الأولية لقاعدة بيانات صحيفة سبق
const { createClient } = require('@supabase/supabase-js');

// إعدادات Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 👥 بيانات المستخدمين
const users = [
  {
    name: 'أحمد محمد الشهري',
    email: 'ahmed.admin@sabq.org',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
    preferences: { politics: 0.8, economy: 0.6, sports: 0.4 }
  },
  {
    name: 'فاطمة عبدالله السالم',
    email: 'fatima.editor@sabq.org',
    role: 'editor',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    preferences: { culture: 0.9, tech: 0.7, health: 0.5 }
  },
  {
    name: 'خالد إبراهيم العتيبي',
    email: 'khalid.editor@sabq.org',
    role: 'editor',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khalid',
    preferences: { sports: 0.9, economy: 0.5, politics: 0.3 }
  },
  {
    name: 'نورا سعد الحربي',
    email: 'nora.viewer@gmail.com',
    role: 'viewer',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nora',
    preferences: { health: 0.8, society: 0.7, education: 0.6 }
  }
];

// 🏷️ بيانات التصنيفات
const categories = [
  { name: 'سياسة', slug: 'politics', icon: '🏛️', color: '#3b82f6', position: 1 },
  { name: 'اقتصاد', slug: 'economy', icon: '💰', color: '#10b981', position: 2 },
  { name: 'تقنية', slug: 'technology', icon: '💻', color: '#8b5cf6', position: 3 },
  { name: 'ثقافة', slug: 'culture', icon: '🎭', color: '#ec4899', position: 4 },
  { name: 'رياضة', slug: 'sports', icon: '⚽', color: '#f59e0b', position: 5 },
  { name: 'صحة', slug: 'health', icon: '🏥', color: '#ef4444', position: 6 },
  { name: 'مجتمع', slug: 'society', icon: '👥', color: '#14b8a6', position: 7 },
  { name: 'تعليم', slug: 'education', icon: '🎓', color: '#6366f1', position: 8 }
];

// 📰 بيانات المقالات
const articles = [
  {
    title: 'ولي العهد يستقبل وزير الخارجية الأمريكي لبحث التعاون الثنائي',
    slug: 'crown-prince-meets-us-secretary',
    content: `استقبل صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز آل سعود، ولي العهد رئيس مجلس الوزراء، اليوم في قصر اليمامة بالرياض، وزير الخارجية الأمريكي.

    وجرى خلال الاستقبال، بحث العلاقات الثنائية بين البلدين الصديقين وسبل تعزيزها في مختلف المجالات، إضافة إلى مناقشة آخر التطورات على الساحتين الإقليمية والدولية.
    
    حضر الاستقبال صاحب السمو الأمير فيصل بن فرحان بن عبدالله وزير الخارجية، ومعالي وزير الدولة عضو مجلس الوزراء مستشار الأمن الوطني الدكتور مساعد بن محمد العيبان.`,
    excerpt: 'استقبل ولي العهد وزير الخارجية الأمريكي لبحث العلاقات الثنائية وآخر التطورات الإقليمية والدولية',
    category: 'سياسة',
    is_breaking: true,
    is_featured: true,
    status: 'published',
    reading_time: 3,
    tags: ['السعودية', 'أمريكا', 'العلاقات الدولية']
  },
  {
    title: 'صندوق الاستثمارات العامة يعلن عن مشروع "نيوم" الجديد بقيمة 500 مليار دولار',
    slug: 'pif-announces-new-neom-project',
    content: `أعلن صندوق الاستثمارات العامة السعودي عن إطلاق مشروع جديد ضمن مدينة نيوم المستقبلية، باستثمارات تصل إلى 500 مليار دولار.

    يهدف المشروع إلى تطوير منطقة صناعية متقدمة تركز على الصناعات المستدامة والتقنيات النظيفة، ومن المتوقع أن يوفر أكثر من 200 ألف وظيفة بحلول عام 2030.
    
    وصرح معالي محافظ صندوق الاستثمارات العامة أن هذا المشروع يأتي ضمن رؤية المملكة 2030 لتنويع مصادر الدخل وبناء اقتصاد مستدام.`,
    excerpt: 'صندوق الاستثمارات يطلق مشروعاً جديداً في نيوم بقيمة 500 مليار دولار لتطوير الصناعات المستدامة',
    category: 'اقتصاد',
    is_featured: true,
    status: 'published',
    reading_time: 4,
    tags: ['نيوم', 'صندوق الاستثمارات', 'رؤية 2030', 'الاقتصاد السعودي']
  },
  {
    title: 'أبل تكشف عن نظارات الواقع المعزز الجديدة في مؤتمرها السنوي',
    slug: 'apple-reveals-new-ar-glasses',
    content: `كشفت شركة أبل اليوم عن نظارات الواقع المعزز الجديدة "Apple Vision Pro 2" في مؤتمرها السنوي للمطورين WWDC 2024.

    تتميز النظارات الجديدة بشاشة عرض بدقة 8K لكل عين، ومعالج M4 الجديد، وبطارية تدوم حتى 8 ساعات من الاستخدام المتواصل. كما تدعم النظارات تقنيات الذكاء الاصطناعي المتقدمة لتحسين تجربة المستخدم.
    
    من المتوقع أن تطرح النظارات في الأسواق العالمية بداية العام المقبل بسعر يبدأ من 2999 دولار.`,
    excerpt: 'أبل تعلن عن نظارات Vision Pro 2 بمواصفات متقدمة وسعر يبدأ من 2999 دولار',
    category: 'تقنية',
    status: 'published',
    reading_time: 3,
    tags: ['أبل', 'الواقع المعزز', 'التقنية', 'WWDC']
  },
  {
    title: 'انطلاق مهرجان الرياض الثقافي بمشاركة 50 دولة',
    slug: 'riyadh-cultural-festival-launches',
    content: `انطلقت اليوم فعاليات مهرجان الرياض الثقافي في نسخته الخامسة، بمشاركة أكثر من 50 دولة من مختلف قارات العالم.

    يضم المهرجان أكثر من 200 فعالية ثقافية وفنية، تشمل العروض المسرحية والحفلات الموسيقية والمعارض الفنية وورش العمل التفاعلية.
    
    وأكد معالي وزير الثقافة أن المهرجان يهدف إلى تعزيز التبادل الثقافي وإبراز التنوع الثقافي في المملكة، مشيراً إلى أن الفعاليات ستستمر لمدة شهر كامل.`,
    excerpt: 'مهرجان الرياض الثقافي ينطلق بـ200 فعالية ومشاركة 50 دولة على مدى شهر كامل',
    category: 'ثقافة',
    status: 'published',
    reading_time: 3,
    tags: ['الرياض', 'المهرجانات', 'الثقافة', 'الفعاليات']
  },
  {
    title: 'المنتخب السعودي يتأهل لنهائيات كأس العالم 2026',
    slug: 'saudi-qualifies-world-cup-2026',
    content: `حقق المنتخب السعودي لكرة القدم إنجازاً تاريخياً بتأهله إلى نهائيات كأس العالم 2026 التي ستقام في أمريكا وكندا والمكسيك.

    جاء التأهل بعد فوز الأخضر على المنتخب الياباني بهدفين مقابل هدف في المباراة الحاسمة التي أقيمت على ملعب الملك فهد الدولي بالرياض أمام أكثر من 68 ألف متفرج.
    
    وسجل للمنتخب السعودي كل من سالم الدوسري وفيصل الغامدي، ليضمن المنتخب بطاقة التأهل المباشر كمتصدر للمجموعة.`,
    excerpt: 'الأخضر السعودي يحقق التأهل التاريخي لكأس العالم 2026 بعد الفوز على اليابان',
    category: 'رياضة',
    is_breaking: true,
    status: 'published',
    reading_time: 3,
    tags: ['كرة القدم', 'المنتخب السعودي', 'كأس العالم', 'الرياضة السعودية']
  },
  {
    title: 'وزارة الصحة تطلق حملة التطعيم الشاملة ضد الإنفلونزا الموسمية',
    slug: 'health-ministry-flu-vaccination-campaign',
    content: `أطلقت وزارة الصحة اليوم الحملة الوطنية للتطعيم ضد الإنفلونزا الموسمية لعام 2024، والتي تستهدف تطعيم أكثر من 10 ملايين شخص.

    تشمل الحملة جميع المراكز الصحية والمستشفيات الحكومية في جميع مناطق المملكة، مع إعطاء الأولوية لكبار السن والأطفال وأصحاب الأمراض المزمنة.
    
    وأوضح معالي وزير الصحة أن اللقاح متوفر مجاناً لجميع المواطنين والمقيمين، مؤكداً على أهمية التطعيم في الوقاية من مضاعفات الإنفلونزا.`,
    excerpt: 'وزارة الصحة تستهدف تطعيم 10 ملايين شخص ضد الإنفلونزا الموسمية مجاناً',
    category: 'صحة',
    status: 'published',
    reading_time: 3,
    tags: ['الصحة', 'التطعيم', 'الإنفلونزا', 'الوقاية']
  },
  {
    title: 'إطلاق برنامج دعم الأسر المنتجة بميزانية 2 مليار ريال',
    slug: 'productive-families-support-program',
    content: `أعلنت وزارة الموارد البشرية والتنمية الاجتماعية عن إطلاق برنامج جديد لدعم الأسر المنتجة بميزانية تصل إلى 2 مليار ريال.

    يهدف البرنامج إلى دعم أكثر من 50 ألف أسرة منتجة من خلال توفير التمويل والتدريب والتسويق لمنتجاتهم، بالإضافة إلى ربطهم بمنصات البيع الإلكترونية.
    
    وأكد معالي الوزير أن البرنامج يأتي ضمن جهود الوزارة لتمكين الأسر وتحسين مستوى دخلها، مشيراً إلى أن التسجيل سيبدأ الأسبوع المقبل عبر البوابة الإلكترونية.`,
    excerpt: 'برنامج حكومي بـ2 مليار ريال لدعم 50 ألف أسرة منتجة بالتمويل والتدريب',
    category: 'مجتمع',
    status: 'published',
    reading_time: 3,
    tags: ['الأسر المنتجة', 'الدعم الحكومي', 'التنمية الاجتماعية']
  },
  {
    title: 'جامعة الملك سعود تحتل المرتبة الأولى عربياً في تصنيف QS العالمي',
    slug: 'ksu-tops-arab-universities-qs-ranking',
    content: `حققت جامعة الملك سعود إنجازاً أكاديمياً متميزاً بحصولها على المرتبة الأولى عربياً والمرتبة 150 عالمياً في تصنيف QS العالمي للجامعات لعام 2024.

    جاء هذا الإنجاز نتيجة للتطور الملحوظ في مجالات البحث العلمي والنشر الأكاديمي والشراكات الدولية، حيث نشرت الجامعة أكثر من 8000 بحث علمي محكم خلال العام الماضي.
    
    وأعرب معالي رئيس الجامعة عن فخره بهذا الإنجاز، مؤكداً أن الجامعة ستواصل جهودها لتحقيق المزيد من التقدم في التصنيفات العالمية.`,
    excerpt: 'جامعة الملك سعود تتصدر الجامعات العربية وتحتل المرتبة 150 عالمياً في تصنيف QS',
    category: 'تعليم',
    is_featured: true,
    status: 'published',
    reading_time: 3,
    tags: ['التعليم العالي', 'جامعة الملك سعود', 'التصنيفات العالمية', 'البحث العلمي']
  }
];

// 📦 بيانات بلوكات الأخبار
const newsBlocks = [
  {
    title: 'الأخبار العاجلة',
    slug: 'breaking-news',
    description: 'آخر الأخبار العاجلة والمستجدات',
    position: 1,
    component_type: 'breaking',
    layout: { columns: 1, showImage: true, showExcerpt: false },
    articles_filter: { is_breaking: true, limit: 5 },
    max_articles: 5
  },
  {
    title: 'الأخبار الرئيسية',
    slug: 'hero-news',
    description: 'أهم الأخبار والتقارير',
    position: 2,
    component_type: 'hero',
    layout: { style: 'large-image', showMeta: true },
    articles_filter: { is_featured: true, limit: 1 },
    max_articles: 1
  },
  {
    title: 'آخر الأخبار',
    slug: 'latest-news',
    description: 'جميع الأخبار مرتبة حسب الأحدث',
    position: 3,
    component_type: 'grid',
    layout: { columns: 3, showImage: true, showExcerpt: true },
    articles_filter: { status: 'published', orderBy: 'published_at' },
    max_articles: 12
  },
  {
    title: 'الأكثر قراءة',
    slug: 'most-read',
    description: 'المقالات الأكثر مشاهدة',
    position: 4,
    component_type: 'list',
    layout: { style: 'numbered', showThumbnail: true },
    articles_filter: { orderBy: 'view_count', limit: 10 },
    max_articles: 10
  }
];

// دالة البذر
async function seed() {
  console.log('🌱 بدء عملية بذر البيانات...');

  try {
    // إدراج المستخدمين
    console.log('👥 إدراج المستخدمين...');
    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (usersError) throw usersError;
    console.log(`✅ تم إدراج ${insertedUsers.length} مستخدمين`);

    // إدراج التصنيفات
    console.log('🏷️ إدراج التصنيفات...');
    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ تم إدراج ${insertedCategories.length} تصنيفات`);

    // إدراج المقالات مع ربطها بالمؤلفين
    console.log('📰 إدراج المقالات...');
    const articlesWithAuthors = articles.map((article, index) => ({
      ...article,
      author_id: insertedUsers[index % insertedUsers.length].id,
      published_at: new Date(Date.now() - index * 3600000).toISOString(),
      view_count: Math.floor(Math.random() * 10000) + 1000,
      share_count: Math.floor(Math.random() * 1000) + 100
    }));

    const { data: insertedArticles, error: articlesError } = await supabase
      .from('articles')
      .insert(articlesWithAuthors)
      .select();

    if (articlesError) throw articlesError;
    console.log(`✅ تم إدراج ${insertedArticles.length} مقالات`);

    // إدراج بلوكات الأخبار
    console.log('📦 إدراج بلوكات الأخبار...');
    const { data: insertedBlocks, error: blocksError } = await supabase
      .from('news_blocks')
      .insert(newsBlocks)
      .select();

    if (blocksError) throw blocksError;
    console.log(`✅ تم إدراج ${insertedBlocks.length} بلوكات أخبار`);

    // إدراج بعض التفاعلات العشوائية
    console.log('📊 إدراج تفاعلات المستخدمين...');
    const interactions = [];
    const actions = ['VIEW', 'READ', 'SHARE', 'SAVE', 'LIKE'];
    
    // إنشاء تفاعلات عشوائية
    for (let i = 0; i < 100; i++) {
      interactions.push({
        user_id: insertedUsers[Math.floor(Math.random() * insertedUsers.length)].id,
        article_id: insertedArticles[Math.floor(Math.random() * insertedArticles.length)].id,
        action: actions[Math.floor(Math.random() * actions.length)],
        duration: Math.floor(Math.random() * 300) + 30,
        scroll_depth: Math.random() * 100,
        device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    const { error: interactionsError } = await supabase
      .from('user_article_interactions')
      .insert(interactions);

    if (interactionsError) throw interactionsError;
    console.log(`✅ تم إدراج ${interactions.length} تفاعل`);

    // إدراج بعض التعليقات
    console.log('💬 إدراج التعليقات...');
    const comments = [
      {
        article_id: insertedArticles[0].id,
        user_id: insertedUsers[3].id,
        content: 'خبر مهم جداً، شكراً لكم على التغطية المميزة',
        is_approved: true,
        likes_count: 15
      },
      {
        article_id: insertedArticles[1].id,
        user_id: insertedUsers[3].id,
        content: 'مشروع طموح يعكس رؤية المملكة 2030',
        is_approved: true,
        likes_count: 23
      }
    ];

    const { error: commentsError } = await supabase
      .from('comments')
      .insert(comments);

    if (commentsError) throw commentsError;
    console.log(`✅ تم إدراج ${comments.length} تعليقات`);

    console.log('\n🎉 تمت عملية بذر البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في بذر البيانات:', error);
    process.exit(1);
  }
}

// تشغيل عملية البذر
seed(); 