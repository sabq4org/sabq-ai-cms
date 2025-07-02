const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function addSampleArticles() {
  try {
    console.log('🚀 بدء إضافة المقالات التجريبية...\n');

    // جلب أول مستخدم وأول تصنيف
    const firstUser = await prisma.user.findFirst();
    const firstCategory = await prisma.category.findFirst();

    if (!firstUser) {
      console.log('❌ لا يوجد مستخدمين في قاعدة البيانات');
      return;
    }

    if (!firstCategory) {
      console.log('❌ لا يوجد تصنيفات في قاعدة البيانات');
      return;
    }

    const articles = [
      {
        title: 'الأمير محمد بن سلمان يطلق مشروع نيوم الجديد',
        content: 'أعلن صاحب السمو الملكي الأمير محمد بن سلمان، ولي العهد رئيس مجلس الوزراء، عن إطلاق مشروع جديد ضمن مدينة نيوم يهدف إلى تعزيز الاقتصاد الرقمي في المملكة. يأتي هذا المشروع ضمن رؤية 2030 التي تسعى لتنويع مصادر الدخل وتطوير القطاعات غير النفطية.',
        excerpt: 'إطلاق مشروع جديد ضمن مدينة نيوم لتعزيز الاقتصاد الرقمي',
        status: 'published',
        featured: true,
        breaking: true
      },
      {
        title: 'المملكة تحقق إنجازاً جديداً في مجال الطاقة المتجددة',
        content: 'حققت المملكة العربية السعودية إنجازاً جديداً في مجال الطاقة المتجددة بافتتاح أكبر محطة للطاقة الشمسية في الشرق الأوسط. تبلغ قدرة المحطة 2 جيجاوات وستوفر الطاقة النظيفة لأكثر من مليون منزل.',
        excerpt: 'افتتاح أكبر محطة للطاقة الشمسية في الشرق الأوسط',
        status: 'published',
        featured: false,
        breaking: false
      },
      {
        title: 'انطلاق موسم الرياض 2025 بفعاليات مميزة',
        content: 'انطلق موسم الرياض 2025 بفعاليات ترفيهية وثقافية متنوعة تستمر لمدة 5 أشهر. يتضمن الموسم أكثر من 500 فعالية في مختلف أنحاء العاصمة، مع مشاركة نجوم عالميين وعروض حصرية.',
        excerpt: 'موسم الرياض يعود بـ 500 فعالية ترفيهية وثقافية',
        status: 'published',
        featured: true,
        breaking: false
      },
      {
        title: 'الهلال يتأهل لنهائي كأس العالم للأندية',
        content: 'تأهل نادي الهلال السعودي إلى نهائي كأس العالم للأندية بعد فوزه على ريال مدريد بنتيجة 2-1 في مباراة مثيرة. سجل للهلال كل من سالم الدوسري ونيمار في الدقائق الأخيرة من المباراة.',
        excerpt: 'الهلال يحقق إنجازاً تاريخياً بالتأهل لنهائي كأس العالم للأندية',
        status: 'published',
        featured: true,
        breaking: true
      },
      {
        title: 'وزارة التعليم تعلن عن برنامج جديد للابتعاث',
        content: 'أعلنت وزارة التعليم عن إطلاق برنامج جديد للابتعاث الخارجي يستهدف 10 آلاف طالب وطالبة في تخصصات التقنية والذكاء الاصطناعي. يهدف البرنامج إلى تأهيل الكوادر الوطنية في المجالات المستقبلية.',
        excerpt: 'برنامج ابتعاث جديد لـ 10 آلاف طالب في مجال التقنية',
        status: 'published',
        featured: false,
        breaking: false
      }
    ];

    console.log(`📝 سيتم إضافة ${articles.length} مقالات...\n`);

    for (const articleData of articles) {
      try {
        const article = await prisma.article.create({
          data: {
            title: articleData.title,
            slug: generateSlug(articleData.title),
            content: articleData.content,
            excerpt: articleData.excerpt,
            authorId: firstUser.id,
            categoryId: firstCategory.id,
            status: articleData.status,
            featured: articleData.featured,
            breaking: articleData.breaking,
            publishedAt: new Date(),
            views: Math.floor(Math.random() * 1000),
            readingTime: Math.ceil(articleData.content.split(' ').length / 200),
            featuredImage: `https://picsum.photos/800/600?random=${Date.now()}`,
            metadata: {
              seo_title: articleData.title,
              seo_description: articleData.excerpt,
              tags: ['أخبار', 'السعودية', 'محلية']
            }
          }
        });

        console.log(`✅ تم إضافة: ${article.title}`);
      } catch (error) {
        console.error(`❌ فشل في إضافة المقال: ${articleData.title}`, error.message);
      }
    }

    console.log('\n✨ تمت إضافة المقالات التجريبية بنجاح!');
    console.log('🔄 قم بتحديث الصفحة الرئيسية لرؤية المقالات');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

addSampleArticles(); 