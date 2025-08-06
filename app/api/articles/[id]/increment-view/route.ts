import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود المقال أولاً
    const existingArticle = await prisma.articles.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    // تحديث عدد المشاهدات
    const updatedArticle = await prisma.articles.update({
      where: { id: existingArticle.id },
      data: {
        views: {
          increment: 1
        },
        updated_at: new Date()
      },
      select: {
        id: true,
        views: true
      }
    });

    // إضافة إحصائية عرض (اختياري للتحليلات)
    try {
      await prisma.$executeRaw`
        INSERT INTO article_views (article_id, view_date, view_count)
        VALUES (${existingArticle.id}, CURRENT_DATE, 1)
        ON CONFLICT (article_id, view_date)
        DO UPDATE SET view_count = article_views.view_count + 1
      `;
    } catch (statsError) {
      // تجاهل خطأ الإحصائيات إذا لم يكن الجدول موجود
      console.warn('خطأ في تحديث إحصائيات المشاهدات:', statsError);
    }

    return NextResponse.json({
      success: true,
      views_count: updatedArticle.views,
      message: 'تم تحديث عدد المشاهدات بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تحديث المشاهدات:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// معالج GET للحصول على عدد المشاهدات الحالي
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      select: {
        id: true,
        views: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      views_count: article.views || 0
    });

  } catch (error) {
    console.error('خطأ في جلب المشاهدات:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}