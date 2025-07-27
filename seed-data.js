const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  console.log('🌱 إضافة بيانات تجريبية...');

  try {
    // فحص التصنيفات الموجودة
    console.log('📂 فحص التصنيفات الموجودة...');
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { display_order: 'asc' }
    });
    console.log(`✅ وُجد ${categories.length} تصنيف موجود مسبقاً`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

    if (categories.length === 0) {
      console.log('❌ لا توجد تصنيفات في قاعدة البيانات');
      return;
    }

    // إضافة مؤلف
    console.log('✍️ إضافة مؤلف...');
    const author = await prisma.users.upsert({
      where: { email: 'admin@sabq.com' },
      update: {},
      create: {
        id: 'user-admin-001',
        email: 'admin@sabq.com',
        name: 'محرر سبق',
        role: 'admin',
        is_admin: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ تم إضافة المؤلف');

    // إضافة مقالات تجريبية
    console.log('📰 إضافة مقالات...');
    const articles = [];
    
    // قائمة مقالات حقيقية متنوعة حسب التصنيفات الموجودة
    const articleTemplates = [
      {
        title: 'تطورات جديدة في الذكاء الاصطناعي تغير مشهد التقنية',
        category: 'technology',
        content: 'شهدت تقنيات الذكاء الاصطناعي تطورات مذهلة في الآونة الأخيرة، حيث أعلنت شركات عالمية عن إنجازات جديدة في مجال التعلم الآلي والذكاء الاصطناعي التوليدي.',
        excerpt: 'تطورات مهمة في مجال الذكاء الاصطناعي تفتح آفاقاً جديدة'
      },
      {
        title: 'فوز الأهلي على الهلال في الديربي السعودي',
        category: 'sports',
        content: 'حقق فريق الأهلي فوزاً مهماً على الهلال في المباراة التي جمعتهما أمس في الدوري السعودي، بهدفين مقابل هدف واحد في مباراة مثيرة.',
        excerpt: 'انتصار مهم للأهلي على الهلال في الديربي السعودي'
      },
      {
        title: 'نمو اقتصادي قوي في السعودية خلال الربع الأول',
        category: 'business',
        content: 'أظهرت البيانات الرسمية نمواً اقتصادياً قوياً في المملكة العربية السعودية خلال الربع الأول من العام، مدفوعاً بالاستثمارات الجديدة.',
        excerpt: 'نمو اقتصادي إيجابي يعكس قوة الاقتصاد السعودي'
      },
      {
        title: 'افتتاح مشروع سياحي جديد في نيوم',
        category: 'tourism',
        content: 'تم افتتاح مشروع سياحي متطور في مدينة نيوم، يوفر تجارب فريدة للزوار ويعكس رؤية السعودية 2030 في تطوير القطاع السياحي.',
        excerpt: 'مشروع سياحي رائد في نيوم يجذب الزوار من العالم'
      },
      {
        title: 'تطوير شبكة النقل العام في الرياض',
        category: 'local',
        content: 'أعلنت أمانة منطقة الرياض عن خطط لتطوير شبكة النقل العام في العاصمة، تشمل خطوط جديدة للمترو والحافلات لتحسين التنقل.',
        excerpt: 'خطط طموحة لتطوير النقل العام في الرياض'
      }
    ];
    
    for (let i = 0; i < articleTemplates.length; i++) {
      const template = articleTemplates[i];
      const category = categories.find(cat => cat.slug === template.category) || categories[0];
      
      const article = await prisma.articles.create({
        data: {
          id: `art-test-${Date.now()}-${i}`,
          title: template.title,
          slug: `article-${Date.now()}-${i}`,
          content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"${template.content} تم إنشاء هذا المحتوى كبيانات تجريبية لاختبار النظام."}]}]}`,
          excerpt: template.excerpt,
          author_id: author.id,
          category_id: category.id,
          status: 'published',
          featured: i < 2,
          breaking: false,
          published_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // مقالات في أيام مختلفة
          views: Math.floor(Math.random() * 1000) + 100,
          reading_time: Math.floor(Math.random() * 10) + 3,
          seo_title: template.title + ' - سبق',
          seo_description: template.excerpt,
          allow_comments: true,
          metadata: {
            aiEditor: false,
            createdAt: new Date().toISOString(),
            author_name: author.name,
            isSmartDraft: false
          },
          created_at: new Date(),
          updated_at: new Date(),
          likes: 0,
          saves: 0,
          shares: 0
        }
      });
      articles.push(article);
      console.log(`  ✅ ${article.title} (تصنيف: ${category.name})`);
    }

    console.log(`✅ تم إضافة ${articles.length} مقالات`);

    // إحصائيات
    const totalCategories = await prisma.categories.count();
    const totalArticles = await prisma.articles.count();
    const publishedArticles = await prisma.articles.count({
      where: { status: 'published' }
    });

    console.log('\n📊 إحصائيات البيانات:');
    console.log(`- التصنيفات: ${totalCategories}`);
    console.log(`- إجمالي المقالات: ${totalArticles}`);
    console.log(`- المقالات المنشورة: ${publishedArticles}`);

    console.log('\n✅ تم إنجاز إضافة البيانات التجريبية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData().catch((error) => {
  console.error('❌ فشل في إضافة البيانات:', error);
  process.exit(1);
});
