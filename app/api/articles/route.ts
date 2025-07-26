import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Article {
  id: string;
  title: string;
  content?: string | null;
  status: string;
  category_id?: string | null;
  author_id?: string | null;
  created_at: Date;
  updated_at: Date;
  published_at?: Date | null;
  category?: {
    name: string;
    color?: string | null;
  } | null;
  author?: {
    name: string;
    email: string;
  } | null;
}

// GET: جلب المقالات
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const where = {
      ...(status && status !== 'all' ? { status } : {})
    };

    // تأكد من الاتصال قبل تنفيذ الاستعلام
    await prisma.$connect();

    const articles = await prisma.articles.findMany({
      where,
      take: limit,
      orderBy: {
        [sort]: order
      },
      include: {
        categories: {
          select: {
            name: true,
            color: true
          }
        }
      }
    });

    // تحويل أسماء الحقول لتتوافق مع الواجهة الأمامية
    const transformedArticles = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status,
      slug: article.slug || article.id,
      featured_image: article.featured_image, // إضافة حقل الصورة المميزة
      excerpt: article.excerpt,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
      saves: article.saves,
      reading_time: article.reading_time,
      breaking: article.breaking,
      featured: article.featured,
      metadata: article.metadata,
      category: article.categories || null,
      author: article.author_id ? { id: article.author_id, name: 'كاتب' } : null, // مؤقت حتى نضيف العلاقة
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      publishedAt: article.published_at
    }));

    return NextResponse.json({
      success: true,
      articles: transformedArticles
    });
  } catch (error: any) {
    console.error('خطأ في جلب المقالات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب المقالات',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// POST: إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // تأكد من الاتصال قبل تنفيذ الاستعلام
    await prisma.$connect();

    // توليد slug من العنوان
    const slug = body.title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const article = await prisma.articles.create({
      data: {
        id: Math.random().toString(36).substr(2, 9), // توليد ID فريد
        title: body.title,
        content: body.content,
        slug: slug || body.title.replace(/\s+/g, '-'),
        status: body.status || 'draft',
        category_id: body.category_id,
        author_id: body.author_id,
        published_at: body.status === 'published' ? new Date() : null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: article
    });
  } catch (error: any) {
    console.error('خطأ في إنشاء المقال:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إنشاء المقال',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
