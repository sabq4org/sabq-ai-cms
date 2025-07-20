import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    
    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // جلب المقال الحالي
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { id: true, metadata: true }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // قراءة metadata الحالي
    const currentMetadata = article.metadata as any || {};
    const currentBreakingStatus = currentMetadata.isBreakingNews || 
                                 currentMetadata.breaking || 
                                 currentMetadata.is_breaking || 
                                 false;

    // تبديل الحالة
    const newBreakingStatus = !currentBreakingStatus;

    // إذا كان سيصبح خبر عاجل، قم بإلغاء تفعيل الأخبار العاجلة الأخرى أولاً
    if (newBreakingStatus) {
      await prisma.articles.updateMany({
        where: {
          AND: [
            { status: 'published' },
            {
              OR: [
                { metadata: { path: ['isBreakingNews'], equals: true } },
                { metadata: { path: ['breaking'], equals: true } },
                { metadata: { path: ['is_breaking'], equals: true } }
              ]
            }
          ]
        },
        data: {
          metadata: {
            ...currentMetadata,
            isBreakingNews: false,
            breaking: false,
            is_breaking: false
          }
        }
      });
    }

    // تحديث المقال المحدد
    const updatedMetadata = {
      ...currentMetadata,
      isBreakingNews: newBreakingStatus,
      breaking: newBreakingStatus,
      is_breaking: newBreakingStatus,
      breakingNewsUpdatedAt: new Date().toISOString()
    };

    await prisma.articles.update({
      where: { id: articleId },
      data: {
        metadata: updatedMetadata,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        articleId,
        isBreakingNews: newBreakingStatus,
        message: newBreakingStatus ? 'تم تفعيل الخبر العاجل' : 'تم إلغاء تفعيل الخبر العاجل'
      }
    });

  } catch (error) {
    console.error('Error toggling breaking news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to toggle breaking news status' 
      },
      { status: 500 }
    );
  }
}
