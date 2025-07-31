import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * تعيين خبر كمميز وإلغاء التمييز عن الأخبار الأخرى
 * POST /api/articles/set-featured
 * Body: { articleId: string, featured: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, featured = true } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { id: true, title: true }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    // إذا كان المطلوب هو تعيين المقال كمميز
    if (featured) {
      // إلغاء تمييز جميع المقالات الأخرى أولاً
      await prisma.articles.updateMany({
        where: {
          featured: true,
          id: { not: articleId }
        },
        data: {
          featured: false
        }
      });

      // تعيين المقال الحالي كمميز
      await prisma.articles.update({
        where: { id: articleId },
        data: {
          featured: true,
          updated_at: new Date() // تحديث وقت التعديل لضمان ظهوره كأحدث خبر مميز
        }
      });

      // إعادة التحقق من صحة مسار الصفحة الرئيسية
      revalidatePath('/');
      
      return NextResponse.json({
        success: true,
        message: `تم تعيين "${article.title}" كخبر مميز وإلغاء التمييز عن الأخبار الأخرى`
      });
    } else {
      // إلغاء تمييز المقال المحدد فقط
      await prisma.articles.update({
        where: { id: articleId },
        data: {
          featured: false
        }
      });

      // إعادة التحقق من صحة مسار الصفحة الرئيسية
      revalidatePath('/');
      
      return NextResponse.json({
        success: true,
        message: `تم إلغاء تمييز "${article.title}"`
      });
    }
  } catch (error: any) {
    console.error('❌ خطأ في تعيين الخبر المميز:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تعيين الخبر المميز',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}