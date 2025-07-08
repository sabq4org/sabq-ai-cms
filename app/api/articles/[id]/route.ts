import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

// تهيئة Prisma Client بشكل آمن
const getPrismaInstance = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  // في بيئة التطوير، نستخدم متغيرًا عامًا لتجنب إنشاء اتصالات متعددة
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['warn', 'error', 'query', 'info'],
      errorFormat: 'pretty',
    });
  }
  return (global as any).prisma;
};

const prisma = getPrismaInstance();

export const runtime = 'nodejs';

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbArticle = await prisma.articles.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });
    if (!dbArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(dbArticle);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - تحديث مقال
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const updates = await request.json();

    console.log('🔄 [API] محاولة تحديث المقال:', id);
    
    // معالجة عدم تطابق اسم الحقل: تحويل summary إلى excerpt
    if (updates.summary) {
      updates.excerpt = updates.summary;
      delete updates.summary;
    }
    
    // معالجة عدم تطابق أسماء الحقول البوليانية
    if (typeof updates.is_featured !== 'undefined') {
      updates.featured = updates.is_featured;
      delete updates.is_featured;
    }
    if (typeof updates.is_breaking !== 'undefined') {
      updates.breaking = updates.is_breaking;
      delete updates.is_breaking;
    }

    // تجاهل الكلمات المفتاحية مؤقتاً لتجنب الخطأ
    if (updates.keywords) {
      delete updates.keywords;
    }

    // فصل category_id للتعامل معه كعلاقة
    const { category_id, ...otherUpdates } = updates;
    
    // إزالة الحقول التي لا يجب تحديثها مباشرة
    const { id: _, created_at, updated_at, ...updateData } = otherUpdates;

    const dataToUpdate: any = {
      ...updateData,
      updated_at: new Date(),
    };

    if (category_id) {
      dataToUpdate.categories = {
        connect: { id: category_id },
      };
    }

    // تحديث المقال وتعيين updated_at تلقائياً
    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log('✅ [API] تم تحديث المقال بنجاح:', id);
    return NextResponse.json(updatedArticle);

  } catch (error: any) {
    console.error('❌ [API] خطأ فادح في تحديث المقال:', {
      id: context.params.id,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          error: 'فشل التحديث: المقال غير موجود.',
          details: 'لم يتم العثور على سجل بالمُعرّف المحدد.',
          code: error.code 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'فشل تحديث المقال.',
        details: error.message || 'خطأ غير معروف في الخادم.',
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    // في بيئات غير الإنتاج، لا يتم قطع الاتصال للسماح بإعادة الاستخدام
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

// DELETE - حذف مقال
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.articles.delete({ where: { id } });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
} 