const fs = require('fs');
const path = require('path');

// قراءة البيانات الحالية
const dataPath = path.join(__dirname, '../data/articles.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// مقالات عينة لكل تصنيف
const sampleArticles = [
  {
    id: `article-${Date.now()}-tech1`,
    title: "الذكاء الاصطناعي يحدث ثورة في قطاع الصحة السعودي",
    slug: "ai-revolution-saudi-healthcare",
    content: "يشهد قطاع الصحة في المملكة العربية السعودية تحولاً رقمياً كبيراً بفضل تطبيقات الذكاء الاصطناعي...",
    summary: "تطبيقات الذكاء الاصطناعي تساهم في تحسين التشخيص الطبي وتقليل أوقات الانتظار في المستشفيات السعودية",
    author_id: "author-1",
    author_name: "د. محمد الأحمد",
    category_id: 1,
    category_name: "تقنية",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    is_featured: true,
    is_breaking: false,
    views_count: 1250,
    reading_time: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  },
  {
    id: `article-${Date.now()}-sports1`,
    title: "الهلال يحقق فوزاً مثيراً في دوري أبطال آسيا",
    slug: "alhilal-wins-asian-champions",
    content: "حقق نادي الهلال السعودي فوزاً مثيراً على نظيره الياباني في دوري أبطال آسيا...",
    summary: "الهلال يتأهل لدور الثمانية بعد فوز درامي بثلاثة أهداف مقابل هدفين",
    author_id: "author-2",
    author_name: "عبدالله الرياضي",
    category_id: 2,
    category_name: "رياضة",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    is_featured: false,
    is_breaking: true,
    views_count: 3420,
    reading_time: 3,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  },
  {
    id: `article-${Date.now()}-economy1`,
    title: "أرامكو تعلن عن أرباح قياسية في الربع الأول",
    slug: "aramco-record-profits-q1",
    content: "أعلنت شركة أرامكو السعودية عن تحقيق أرباح قياسية في الربع الأول من العام...",
    summary: "أرباح أرامكو تتجاوز التوقعات بنسبة 15% مدعومة بارتفاع أسعار النفط",
    author_id: "author-3",
    author_name: "سارة الاقتصادي",
    category_id: 3,
    category_name: "اقتصاد",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    is_featured: true,
    is_breaking: false,
    views_count: 2890,
    reading_time: 4,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  },
  {
    id: `article-${Date.now()}-politics1`,
    title: "المملكة تستضيف القمة العربية الاستثنائية الأسبوع المقبل",
    slug: "saudi-hosts-arab-summit",
    content: "تستضيف المملكة العربية السعودية القمة العربية الاستثنائية الأسبوع المقبل...",
    summary: "القمة ستناقش التطورات الإقليمية وسبل تعزيز التعاون العربي المشترك",
    author_id: "author-4",
    author_name: "أحمد السياسي",
    category_id: 4,
    category_name: "سياسة",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800",
    is_featured: false,
    is_breaking: false,
    views_count: 1567,
    reading_time: 6,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  },
  {
    id: `article-${Date.now()}-local1`,
    title: "افتتاح أكبر مجمع ترفيهي في الرياض",
    slug: "largest-entertainment-complex-riyadh",
    content: "شهدت العاصمة الرياض افتتاح أكبر مجمع ترفيهي متكامل في المنطقة...",
    summary: "المجمع يضم 50 مرفقاً ترفيهياً ويستهدف استقبال 10 ملايين زائر سنوياً",
    author_id: "author-5",
    author_name: "فاطمة المحلية",
    category_id: 5,
    category_name: "محليات",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=800",
    is_featured: true,
    is_breaking: false,
    views_count: 2134,
    reading_time: 3,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  },
  {
    id: `article-${Date.now()}-culture1`,
    title: "مهرجان الجنادرية يعود بحلة جديدة",
    slug: "janadriyah-festival-returns",
    content: "يعود مهرجان الجنادرية الثقافي بحلة جديدة وفعاليات متنوعة...",
    summary: "المهرجان يضم أكثر من 100 فعالية ثقافية وتراثية على مدى أسبوعين",
    author_id: "author-6",
    author_name: "نورا الثقافية",
    category_id: 6,
    category_name: "ثقافة ومجتمع",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1569163139394-de4798aa4e7e?w=800",
    is_featured: false,
    is_breaking: false,
    views_count: 987,
    reading_time: 4,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  }
];

// إضافة المقالات الجديدة
data.articles = [...sampleArticles, ...data.articles];

// حفظ البيانات
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`تمت إضافة ${sampleArticles.length} مقالات عينة بنجاح!`); 