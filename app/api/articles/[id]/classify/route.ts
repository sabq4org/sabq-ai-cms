/**
 * API endpoint لتطبيق التصنيف الذكي على المقال
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    const body = await request.json();
    
    const {
      categoryId,
      mainCategory,
      subCategory,
      qualityScore,
      regionRelevance,
      confidence,
      suggestions
    } = body;

    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }

    // تحديث المقال بنتائج التصنيف (استخدام الحقول الموجودة)
    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: {
        category_id: categoryId.toString(),
        // حفظ بيانات التصنيف في الحقول الموجودة
        metadata: {
          ai_classification: {
            mainCategory,
            subCategory,
            qualityScore,
            regionRelevance,
            confidence,
            suggestions,
            classifiedAt: new Date().toISOString()
          }
        },
        updated_at: new Date(),
      }
    });

    // إنشاء سجل في الملاحظات لحفظ بيانات التصنيف
    const classificationData = {
      mainCategory,
      subCategory,
      qualityScore,
      regionRelevance,
      confidence,
      suggestions,
      classifiedAt: new Date().toISOString()
    };

    // يمكن حفظ البيانات في جدول منفصل أو في ملف
    console.log('🤖 بيانات التصنيف الذكي:', classificationData);

    return NextResponse.json({
      success: true,
      message: 'تم تطبيق التصنيف بنجاح',
      article: {
        id: updatedArticle.id,
        category_id: updatedArticle.category_id,
        classification: classificationData
      }
    });

  } catch (error) {
    console.error('خطأ في تطبيق التصنيف:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// GET: جلب نتائج التصنيف للمقال
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;

    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }

    // جلب بيانات المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        category_id: true,
        metadata: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    // تحضير النتيجة (بيانات بسيطة)
    const classificationData = {
      hasClassification: !!article.category_id,
      categoryId: article.category_id,
      metadata: article.metadata,
      lastUpdated: article.updated_at,
    };

    return NextResponse.json({
      success: true,
      classification: classificationData
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات التصنيف:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
