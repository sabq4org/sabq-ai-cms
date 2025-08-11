// بيانات تجريبية للكلمات المفتاحية
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTags = [
  {
    name: "السياسة السعودية",
    slug: "saudi-politics", 
    description: "أخبار ومقالات متعلقة بالسياسة في المملكة العربية السعودية",
    color: "#3B82F6",
    category: "سياسة",
    priority: 9,
    synonyms: ["السياسة", "الحكومة", "الوزراء", "القيادة"]
  },
  {
    name: "رؤية 2030",
    slug: "vision-2030",
    description: "مشاريع وأخبار رؤية المملكة 2030",
    color: "#10B981", 
    category: "اقتصاد",
    priority: 10,
    synonyms: ["الرؤية", "التحول الوطني", "نيوم", "القدية"]
  },
  {
    name: "الذكاء الاصطناعي",
    slug: "artificial-intelligence",
    description: "تطورات وأخبار الذكاء الاصطناعي والتكنولوجيا",
    color: "#8B5CF6",
    category: "تقنية", 
    priority: 8,
    synonyms: ["AI", "التعلم الآلي", "الروبوت", "التكنولوجيا"]
  },
  {
    name: "كأس العالم",
    slug: "world-cup",
    description: "أخبار كأس العالم والمنتخبات",
    color: "#F59E0B",
    category: "رياضة",
    priority: 7,
    synonyms: ["المونديال", "كرة القدم", "المنتخبات", "فيفا"]
  },
  {
    name: "الاقتصاد السعودي",
    slug: "saudi-economy",
    description: "أخبار الاقتصاد والاستثمار في السعودية",
    color: "#EF4444", 
    category: "اقتصاد",
    priority: 9,
    synonyms: ["البورصة", "الاستثمار", "النفط", "الريال"]
  },
  {
    name: "التعليم",
    slug: "education",
    description: "أخبار التعليم والجامعات",
    color: "#06B6D4",
    category: "تعليم",
    priority: 6,
    synonyms: ["الجامعات", "المدارس", "الطلاب", "المنح"]
  },
  {
    name: "الصحة",
    slug: "health",
    description: "أخبار الصحة والطب",
    color: "#84CC16",
    category: "صحة",
    priority: 7,
    synonyms: ["الطب", "المستشفيات", "الأدوية", "الوباء"]
  },
  {
    name: "السفر والسياحة",
    slug: "travel-tourism",
    description: "أخبار السفر والسياحة في السعودية",
    color: "#F97316",
    category: "سياحة",
    priority: 5,
    synonyms: ["الحج", "العمرة", "المناطق", "الآثار"]
  },
  {
    name: "الترفيه",
    slug: "entertainment",
    description: "أخبار الترفيه والثقافة",
    color: "#EC4899",
    category: "ترفيه",
    priority: 4,
    synonyms: ["السينما", "المسرح", "الحفلات", "الفعاليات"]
  },
  {
    name: "البيئة",
    slug: "environment",
    description: "أخبار البيئة والاستدامة",
    color: "#22C55E",
    category: "بيئة", 
    priority: 6,
    synonyms: ["التلوث", "المناخ", "الطاقة المتجددة", "الغابات"]
  }
];

async function main() {
  console.log('🚀 بدء إنشاء بيانات تجريبية للكلمات المفتاحية...');

  try {
    // حذف البيانات الموجودة
    await prisma.article_tags.deleteMany({});
    await prisma.tags.deleteMany({});
    
    console.log('✅ تم حذف البيانات القديمة');

    // إنشاء الكلمات المفتاحية الجديدة
    const createdTags = [];
    for (const tag of sampleTags) {
      const created = await prisma.tags.create({
        data: tag
      });
      createdTags.push(created);
      console.log(`✅ تم إنشاء الكلمة المفتاحية: ${created.name}`);
    }

    // ربط الكلمات المفتاحية ببعض المقالات الموجودة
    const articles = await prisma.articles.findMany({
      take: 10,
      select: { id: true, title: true }
    });

    if (articles.length > 0) {
      console.log(`\n🔗 ربط الكلمات المفتاحية بـ ${articles.length} مقال...`);
      
      for (const article of articles) {
        // ربط عشوائي بين 2-5 كلمات مفتاحية لكل مقال
        const randomTagCount = Math.floor(Math.random() * 4) + 2;
        const shuffledTags = createdTags.sort(() => 0.5 - Math.random());
        const selectedTags = shuffledTags.slice(0, randomTagCount);
        
        for (const tag of selectedTags) {
          try {
            await prisma.article_tags.create({
              data: {
                article_id: article.id,
                tag_id: tag.id
              }
            });
          } catch (error) {
            // تجاهل الأخطاء المكررة
          }
        }
        
        console.log(`   ✅ ربط ${selectedTags.length} كلمة مفتاحية مع: ${article.title}`);
      }
    }

    console.log('\n📊 إحصائيات النتائج:');
    const totalTags = await prisma.tags.count();
    const totalConnections = await prisma.article_tags.count();
    
    console.log(`   📌 إجمالي الكلمات المفتاحية: ${totalTags}`);
    console.log(`   🔗 إجمالي الروابط: ${totalConnections}`);
    console.log('\n🎉 تم إنشاء البيانات التجريبية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
