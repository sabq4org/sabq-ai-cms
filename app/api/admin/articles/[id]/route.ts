import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

// حذف مقال
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من الصلاحيات
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const articleId = params.id;
    console.log(`🗑️ طلب حذف المقال: ${articleId}`);

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    console.log(`📄 حذف المقال: ${article.title}`);

    // حذف التعليقات المرتبطة أولاً
    await prisma.comments.deleteMany({
      where: { article_id: articleId }
    });

    // حذف التفاعلات المرتبطة
    await prisma.interactions.deleteMany({
      where: { article_id: articleId }
    });

    // حذف الإشعارات المرتبطة
    await prisma.smartNotifications.deleteMany({
      where: {
        OR: [
          { data: { path: ['articleId'], equals: articleId } },
          { data: { path: ['entityId'], equals: articleId } }
        ]
      }
    });

    // حذف المقال
    await prisma.articles.delete({
      where: { id: articleId }
    });

    console.log(`✅ تم حذف المقال بنجاح: ${article.title}`);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المقال بنجاح',
      deletedArticle: {
        id: article.id,
        title: article.title,
        slug: article.slug
      }
    });

  } catch (error) {
    console.error('❌ خطأ في حذف المقال:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في حذف المقال',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
