const { PrismaClient } = require('../lib/generated/prisma')
const prisma = new PrismaClient()

async function addTestArticle() {
  try {
    console.log('🔍 فحص المقالات الموجودة...')
    
    // التحقق من وجود مقال بـ ID 1
    const existingArticle = await prisma.articles.findUnique({
      where: { id: '1' }
    })
    
    if (existingArticle) {
      console.log('✅ المقال موجود بالفعل:')
      console.log(`- العنوان: ${existingArticle.title}`)
      console.log(`- الرابط: /article/1`)
      console.log(`- المشاهدات: ${existingArticle.views}`)
      console.log(`- الإعجابات: ${existingArticle.likes || 0}`)
      console.log(`- المشاركات: ${existingArticle.shares || 0}`)
      console.log(`- الحفظ: ${existingArticle.saves || 0}`)
      return
    }
    
    // التحقق من وجود تصنيف أو إنشاء واحد
    console.log('🔍 فحص التصنيفات...')
    let category = await prisma.categories.findFirst()
    
    if (!category) {
      console.log('📁 إنشاء تصنيف تجريبي...')
      category = await prisma.categories.create({
        data: {
          id: '1',
          name: 'تقنية',
          slug: 'technology',
          description: 'أخبار التقنية والذكاء الاصطناعي',
          color: '#3B82F6',
          icon: '💻'
        }
      })
    }
    
    console.log(`✅ استخدام التصنيف: ${category.name}`)
    
    // إنشاء مقال تجريبي
    console.log('📝 إنشاء مقال تجريبي...')
    
    const testArticle = await prisma.articles.create({
      data: {
        id: '1',
        title: 'الذكاء الاصطناعي يحدث ثورة في صناعة الإعلام',
        slug: 'ai-revolution-in-media-industry',
        content: `<p>شهدت صناعة الإعلام تحولاً جذرياً مع دخول تقنيات الذكاء الاصطناعي، حيث أصبحت هذه التقنيات جزءاً لا يتجزأ من العملية الإعلامية الحديثة.</p>
        
        <h2>التحول الرقمي في غرف الأخبار</h2>
        <p>تستخدم المؤسسات الإعلامية الكبرى اليوم أدوات الذكاء الاصطناعي في مختلف جوانب العمل الصحفي، من جمع الأخبار وتحليل البيانات إلى كتابة التقارير ونشر المحتوى.</p>
        
        <h2>فوائد الذكاء الاصطناعي في الإعلام</h2>
        <ul>
        <li>تسريع عملية إنتاج المحتوى</li>
        <li>تحسين دقة التحليلات والتقارير</li>
        <li>تخصيص المحتوى حسب اهتمامات القراء</li>
        <li>اكتشاف الأخبار العاجلة بشكل أسرع</li>
        </ul>
        
        <h2>التحديات والاعتبارات الأخلاقية</h2>
        <p>مع كل هذه الفوائد، تواجه الصناعة تحديات مهمة تتعلق بالموثوقية والشفافية والحفاظ على المعايير الصحفية التقليدية.</p>`,
        excerpt: 'تحليل شامل لتأثير تقنيات الذكاء الاصطناعي على صناعة الإعلام وكيف تغير طريقة إنتاج وتوزيع المحتوى الإخباري',
        author_id: '1',
        category_id: category.id,
        status: 'published',
        featured: true,
        published_at: new Date(),
        views: 1250,
        likes: 87,
        shares: 45,
        saves: 23,
        reading_time: 5,
        seo_title: 'الذكاء الاصطناعي يحدث ثورة في صناعة الإعلام - تحليل شامل',
        seo_description: 'اكتشف كيف يغير الذكاء الاصطناعي صناعة الإعلام وما هي الفرص والتحديات التي تواجه المؤسسات الإعلامية',
        allow_comments: true,
        updated_at: new Date()
      }
    })
    
    console.log('✅ تم إنشاء المقال بنجاح!')
    console.log(`- العنوان: ${testArticle.title}`)
    console.log(`- الرابط: /article/${testArticle.id}`)
    console.log(`- المشاهدات: ${testArticle.views}`)
    console.log(`- الإعجابات: ${testArticle.likes}`)
    console.log(`- المشاركات: ${testArticle.shares}`)
    console.log(`- الحفظ: ${testArticle.saves}`)
    
  } catch (error) {
    console.error('❌ خطأ:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addTestArticle() 