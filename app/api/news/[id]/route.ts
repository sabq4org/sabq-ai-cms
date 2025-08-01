import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب خبر واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف الخبر مطلوب'
      }, { status: 400 });
    }

    console.log(`🔍 جلب تفاصيل الخبر: ${id}`);

    // جلب الخبر مع التأكد أنه من نوع news
    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        // التأكد أنه خبر وليس مقال رأي
        OR: [
          { article_type: 'news' },
          { article_type: { equals: null } }, // الأخبار القديمة قد لا تحتوي على نوع
          { article_type: { not: 'opinion' } },
          { article_type: { not: 'analysis' } },
          { article_type: { not: 'interview' } }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        featured_image: true,
        views: true,
        reading_time: true,
        status: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'الخبر غير موجود'
      }, { status: 404 });
    }

    // التحقق من حالة النشر
    if (article.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: 'الخبر غير منشور'
      }, { status: 403 });
    }

    // تحويل البيانات للصيغة المطلوبة
    const formattedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      slug: article.slug,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at,
      featured_image: article.featured_image,
      views: article.views || 0,
      reading_time: article.reading_time || 5,
      status: article.status,
      category: article.categories ? {
        id: article.categories.id,
        name: article.categories.name,
        color: article.categories.color
      } : null
    };

    return NextResponse.json({
      success: true,
      article: formattedArticle
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الخبر:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب بيانات الخبر'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}