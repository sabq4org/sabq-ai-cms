import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tag: string }> }
) {
  try {
    const params = await context.params;
    const tag = decodeURIComponent(params.tag);
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log(`🏷️ جلب المقالات للكلمة المفتاحية: ${tag}`);

    // جلب جميع المقالات أولاً
    const allArticles = await prisma.articles.findMany({
      where: { status: 'published' },
      orderBy: { published_at: 'desc' }
    });

    // فلترة المقالات بناءً على الكلمة المفتاحية
    const filteredArticles = allArticles.filter((article: any) => {
      // البحث في seo_keywords
      if (article.seo_keywords) {
        const keywords = article.seo_keywords.split(',').map((k: string) => k.trim());
        if (keywords.some((k: string) => k.toLowerCase() === tag.toLowerCase())) {
          return true;
        }
      }
      
      // البحث في metadata.keywords
      if (article.metadata && typeof article.metadata === 'object') {
        const metadata = article.metadata as any;
        if (Array.isArray(metadata.keywords)) {
          if (metadata.keywords.some((k: string) => k.toLowerCase() === tag.toLowerCase())) {
            return true;
          }
        }
      }
      
      return false;
    });

    // تطبيق pagination على النتائج المفلترة
    const paginatedArticles = filteredArticles.slice(skip, skip + limit);
    const total = filteredArticles.length;

    // جلب معلومات التصنيفات
    const categoryIds = [...new Set(paginatedArticles.map((a: any) => a.category_id).filter((id: any) => id !== null))] as string[];
    const categories = categoryIds.length > 0 ? await prisma.categories.findMany({
      where: { id: { in: categoryIds } }
    }) : [];

    // إنشاء خريطة للتصنيفات
    const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));

    // تنسيق البيانات
    const formattedArticles = paginatedArticles.map((article: any) => {
      const category = article.category_id ? categoryMap.get(article.category_id) : null;
      
      // استخراج الكلمات المفتاحية من كلا المصدرين
      let keywords: string[] = [];
      
      // من seo_keywords
      if (article.seo_keywords) {
        keywords = article.seo_keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k);
      }
      
      // من metadata.keywords
      if (article.metadata && typeof article.metadata === 'object') {
        const metadataKeywords = (article.metadata as any).keywords;
        if (Array.isArray(metadataKeywords)) {
          // دمج الكلمات المفتاحية من كلا المصدرين وإزالة المكررات
          keywords = [...new Set([...keywords, ...metadataKeywords])];
        }
      }
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: article.featured_image,
        author: {
          id: article.author_id,
          name: 'فريق التحرير',
          email: ''
        },
        category: category ? {
          id: (category as any).id,
          name: (category as any).name,
          slug: (category as any).slug,
          color: (category as any).color,
          icon: (category as any).icon
        } : null,
        category_id: article.category_id ? parseInt(article.category_id) : 0,
        views: article.views,
        reading_time: article.reading_time,
        published_at: article.published_at?.toISOString() || null,
        created_at: article.created_at.toISOString(),
        featured: article.featured,
        breaking: article.breaking,
        keywords: keywords
      };
    });

    console.log(`✅ تم العثور على ${total} مقال للكلمة المفتاحية: ${tag}`);

    return NextResponse.json({
      articles: formattedArticles,
      keyword: tag,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('خطأ في جلب المقالات للكلمة المفتاحية:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المقالات' },
      { status: 500 }
    );
  }
} 