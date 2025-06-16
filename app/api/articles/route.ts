import { NextRequest, NextResponse } from 'next/server';

// ===============================
// أنواع البيانات
// ===============================

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  author_id: string;
  editor_id?: string;
  category_id?: number;
  section_id?: number;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  featured_image?: string;
  featured_image_caption?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_breaking: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  publish_at?: string;
  published_at?: string;
  views_count: number;
  reading_time?: number;
  content_blocks?: any[];
  created_at: string;
  updated_at: string;
}

interface CreateArticleRequest {
  title: string;
  content: string;
  summary?: string;
  category_id?: number;
  section_id?: number;
  status?: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  is_breaking?: boolean;
  is_featured?: boolean;
  publish_at?: string;
  content_blocks?: any[];
}

// بيانات وهمية للمقالات
let articles: Article[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'رؤية 2030 تحقق إنجازات جديدة في قطاع التقنية',
    slug: 'vision-2030-tech-achievements',
    content: 'حققت رؤية المملكة 2030 إنجازات متميزة في قطاع التقنية والتحول الرقمي خلال العام الحالي، حيث شهدت المملكة نمواً كبيراً في الشركات التقنية الناشئة...',
    summary: 'تقرير شامل عن أحدث إنجازات رؤية 2030 في مجال التقنية والابتكار والتحول الرقمي',
    author_id: 'author-1',
    category_id: 3,
    section_id: 4,
    status: 'published',
    featured_image: '/images/articles/vision-2030-tech.jpg',
    seo_title: 'رؤية 2030 والتقنية: إنجازات جديدة ونقلة نوعية',
    seo_description: 'اكتشف أحدث إنجازات رؤية المملكة 2030 في قطاع التقنية والتحول الرقمي',
    is_breaking: false,
    is_featured: true,
    is_pinned: false,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    views_count: 1523,
    reading_time: 5,
    content_blocks: [
      {
        id: '1',
        type: 'paragraph',
        content: { text: 'شهدت المملكة العربية السعودية نمواً ملحوظاً في قطاع التقنية...' },
        order: 0
      }
    ],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    title: 'الهلال يحجز مقعده في نهائي دوري أبطال آسيا',
    slug: 'alhilal-afc-champions-league-final',
    content: 'تأهل نادي الهلال السعودي إلى نهائي دوري أبطال آسيا للمرة الخامسة في تاريخه، بعد فوزه الكبير على ضيفه...',
    summary: 'الهلال يتأهل لنهائي البطولة الآسيوية بفوز مستحق ويواصل مشواره نحو تحقيق اللقب',
    author_id: 'author-2',
    category_id: 4,
    section_id: 2,
    status: 'published',
    featured_image: '/images/articles/alhilal-afc.jpg',
    is_breaking: true,
    is_featured: true,
    is_pinned: true,
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    views_count: 3421,
    reading_time: 3,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    title: 'ارتفاع أسعار النفط عالمياً يدعم الاقتصاد السعودي',
    slug: 'oil-prices-rise-saudi-economy',
    content: 'شهدت أسعار النفط ارتفاعاً ملحوظاً في الأسواق العالمية، مما يعزز الآفاق الاقتصادية للمملكة...',
    summary: 'تحليل تأثير ارتفاع أسعار النفط على الاقتصاد السعودي والتوقعات المستقبلية',
    author_id: 'author-3',
    category_id: 7,
    section_id: 3,
    status: 'published',
    is_breaking: false,
    is_featured: false,
    is_pinned: false,
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    views_count: 892,
    reading_time: 4,
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    title: 'مؤتمر الرياض للذكاء الاصطناعي يستقطب خبراء عالميين',
    slug: 'riyadh-ai-conference-global-experts',
    content: 'ينطلق غداً مؤتمر الرياض للذكاء الاصطناعي بمشاركة نخبة من الخبراء والمختصين...',
    summary: 'مؤتمر الرياض للذكاء الاصطناعي يجمع خبراء من حول العالم لمناقشة مستقبل التقنية',
    author_id: 'author-1',
    category_id: 9,
    section_id: 4,
    status: 'scheduled',
    publish_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    is_breaking: false,
    is_featured: true,
    is_pinned: false,
    views_count: 0,
    reading_time: 6,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    title: 'إطلاق مشروع نيوم الجديد للطاقة المتجددة',
    slug: 'neom-renewable-energy-project',
    content: 'أعلن مشروع نيوم عن إطلاق مبادرة جديدة للطاقة المتجددة تهدف إلى تحقيق الحياد الكربوني...',
    summary: 'مشروع نيوم يكشف عن خطط طموحة للطاقة المتجددة ضمن رؤية مستدامة للمستقبل',
    author_id: 'author-2',
    category_id: 3,
    section_id: 1,
    status: 'draft',
    is_breaking: false,
    is_featured: false,
    is_pinned: false,
    views_count: 0,
    reading_time: 7,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

// ===============================
// وظائف مساعدة
// ===============================

// توليد slug من العنوان
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// حساب وقت القراءة (بناء على 200 كلمة في الدقيقة)
function calculateReadingTime(content: string): number {
  const wordsCount = content.split(/\s+/).length;
  return Math.ceil(wordsCount / 200);
}

// فلترة المقالات حسب المعايير
function filterArticles(query: URLSearchParams) {
  let filteredArticles = [...articles];

  // فلترة حسب الحالة
  const status = query.get('status');
  if (status) {
    filteredArticles = filteredArticles.filter(article => article.status === status);
  }

  // فلترة حسب القسم
  const section = query.get('section_id');
  if (section) {
    filteredArticles = filteredArticles.filter(article => article.section_id === parseInt(section));
  }

  // فلترة حسب المؤلف
  const author = query.get('author_id');
  if (author) {
    filteredArticles = filteredArticles.filter(article => article.author_id === author);
  }

  // البحث في العنوان والمحتوى
  const search = query.get('search');
  if (search) {
    filteredArticles = filteredArticles.filter(article => 
      article.title.includes(search) || 
      article.content.includes(search) ||
      article.summary?.includes(search)
    );
  }

  // فلترة المقالات المميزة
  const featured = query.get('featured');
  if (featured === 'true') {
    filteredArticles = filteredArticles.filter(article => article.is_featured);
  }

  // فلترة الأخبار العاجلة
  const breaking = query.get('breaking');
  if (breaking === 'true') {
    filteredArticles = filteredArticles.filter(article => article.is_breaking);
  }

  return filteredArticles;
}

// ترتيب المقالات
function sortArticles(articles: Article[], sortBy: string = 'created_at', order: string = 'desc') {
  return articles.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'views':
        aValue = a.views_count;
        bValue = b.views_count;
        break;
      case 'published_at':
        aValue = a.published_at || a.created_at;
        bValue = b.published_at || b.created_at;
        break;
      default:
        aValue = a.created_at;
        bValue = b.created_at;
    }

    if (order === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });
}

// ===============================
// معالجات API
// ===============================

// GET: استرجاع المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // تطبيق الفلاتر
    let filteredArticles = filterArticles(searchParams);
    
    // تطبيق الترتيب
    const sortBy = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    filteredArticles = sortArticles(filteredArticles, sortBy, order);
    
    // تطبيق التقسيم (Pagination)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
    
    // إحصائيات إضافية
    const stats = {
      total: filteredArticles.length,
      page,
      limit,
      totalPages: Math.ceil(filteredArticles.length / limit),
      hasNext: endIndex < filteredArticles.length,
      hasPrev: page > 1
    };

    return NextResponse.json({
      success: true,
      data: paginatedArticles,
      pagination: stats,
      filters: {
        status: searchParams.get('status'),
        section_id: searchParams.get('section_id'),
        search: searchParams.get('search'),
        featured: searchParams.get('featured'),
        breaking: searchParams.get('breaking')
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// POST: إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const body: CreateArticleRequest = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.content) {
      return NextResponse.json({
        success: false,
        error: 'العنوان والمحتوى مطلوبان'
      }, { status: 400 });
    }

    // إنشاء المقال الجديد
    const newArticle: Article = {
      id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title.trim(),
      slug: body.title ? generateSlug(body.title) : `article-${Date.now()}`,
      content: body.content,
      summary: body.summary?.trim(),
      author_id: 'current-user-id', // سيتم استبداله بالمستخدم الحالي
      category_id: body.category_id,
      section_id: body.section_id,
      status: (body.status as any) || 'draft',
      featured_image: body.featured_image,
      seo_title: body.seo_title?.trim(),
      seo_description: body.seo_description?.trim(),
      is_breaking: body.is_breaking || false,
      is_featured: body.is_featured || false,
      is_pinned: false,
      publish_at: body.publish_at,
      views_count: 0,
      reading_time: calculateReadingTime(body.content),
      content_blocks: body.content_blocks || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // التحقق من عدم تكرار الـ slug
    let finalSlug = newArticle.slug;
    let counter = 1;
    while (articles.some(article => article.slug === finalSlug)) {
      finalSlug = `${newArticle.slug}-${counter}`;
      counter++;
    }
    newArticle.slug = finalSlug;

    // إضافة المقال
    articles.unshift(newArticle);

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'تم إنشاء المقال بنجاح'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// PUT: تحديث مقال (سيتم تنفيذه في route منفصل)
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'استخدم /api/articles/[id] لتحديث مقال معين'
  }, { status: 405 });
}

// DELETE: حذف متعدد (سيتم تنفيذه حسب الحاجة)
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'قائمة معرفات المقالات مطلوبة'
      }, { status: 400 });
    }

    // حذف المقالات
    const deletedCount = articles.length;
    articles = articles.filter(article => !ids.includes(article.id));
    const actualDeletedCount = deletedCount - articles.length;

    return NextResponse.json({
      success: true,
      message: `تم حذف ${actualDeletedCount} مقال`,
      deletedCount: actualDeletedCount
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 