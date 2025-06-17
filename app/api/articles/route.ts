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
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'deleted';
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
  is_deleted: boolean;
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

// TODO: استبدال بقاعدة البيانات الحقيقية (Prisma/MongoDB/MySQL)
// يجب ربط هذا الـ API بقاعدة البيانات الفعلية
export let articles: Article[] = [];

// TODO: تنفيذ دوال قاعدة البيانات الحقيقية
const fetchArticlesFromDatabase = async (filters: any = {}) => {
  // يجب تنفيذ استدعاء قاعدة البيانات هنا
  // مثال: return await prisma.articles.findMany({ where: filters });
  return [];
};

const createArticleInDatabase = async (articleData: CreateArticleRequest) => {
  // يجب تنفيذ إنشاء المقال في قاعدة البيانات
  // مثال: return await prisma.articles.create({ data: articleData });
  return null;
};

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
      // للإبقاء على التوافق العكسي مع الواجهات القديمة
      articles: paginatedArticles,
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
      updated_at: new Date().toISOString(),
      is_deleted: false
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

    // حذف ناعم (تغيير الحالة إلى deleted)
    let affected = 0;
    articles = articles.map(a => {
      if (ids.includes(a.id)) {
        affected++;
        return { ...a, status: 'deleted', is_deleted: true, updated_at: new Date().toISOString() } as Article;
      }
      return a;
    });

    return NextResponse.json({
      success: true,
      message: `تم نقل ${affected} مقال إلى سلة المحذوفات`,
      affected
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 