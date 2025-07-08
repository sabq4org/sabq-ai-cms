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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
  context: { params: Promise<{ id: string }> }
) {
  let articleId = '';
  try {
    const { id: idFromParams } = await context.params;
    articleId = idFromParams;
    const updates = await request.json();

    console.log('🔄 [API] محاولة تحديث المقال:', articleId);
    
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
      where: { id: articleId },
      data: dataToUpdate,
    });

    console.log('✅ [API] تم تحديث المقال بنجاح:', articleId);
    return NextResponse.json(updatedArticle);

  } catch (error: any) {
    console.error('❌ [API] خطأ فادح في تحديث المقال:', {
      id: articleId,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.articles.delete({ where: { id } });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}

// PUT - تحديث كامل للمقال
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let articleId = '';
  try {
    const { id: idFromParams } = await context.params;
    articleId = idFromParams;
    const body = await request.json();

    console.log('🔄 [API PUT] محاولة تحديث المقال:', articleId);
    
    // معالجة الموجز
    const excerpt = body.excerpt || body.summary || '';
    
    // معالجة metadata مع الحقول المهمة
    const metadata = body.metadata || {};
    
    // معالجة is_breaking - إعطاء الأولوية للقيمة المباشرة ثم metadata
    const is_breaking = body.is_breaking === true || metadata.is_breaking === true || false;
    
    // معالجة is_featured
    const is_featured = body.is_featured === true || metadata.is_featured === true || false;
    
    // تحديث metadata بالقيم الصحيحة
    metadata.is_breaking = is_breaking;
    metadata.is_featured = is_featured;
    
    // إذا كان هناك كلمات مفتاحية في body
    if (body.keywords) {
      metadata.keywords = body.keywords;
    }
    
    // إذا كان هناك اسم مؤلف
    if (body.author_name) {
      metadata.author_name = body.author_name;
    }

    const updateData: any = {
      title: body.title,
      content: body.content || '',
      excerpt: excerpt,
      status: body.status || 'draft',
      featured_image: body.featured_image || null,
      featured_image_alt: body.featured_image_alt || null,
      seo_title: body.seo_title || body.title,
      seo_description: body.seo_description || excerpt,
      metadata: metadata,
      breaking: is_breaking,
      featured: is_featured,
      updated_at: new Date()
    };

    // معالجة content_blocks إذا كان موجوداً
    if (body.content_blocks) {
      updateData.content_blocks = body.content_blocks;
    }

    // معالجة category_id
    if (body.category_id) {
      updateData.categories = {
        connect: { id: body.category_id }
      };
    }

    // معالجة publish_at
    if (body.publish_at) {
      updateData.published_at = new Date(body.publish_at);
    }

    // تحديث المقال
    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: updateData
    });

    console.log('✅ [API PUT] تم تحديث المقال بنجاح:', {
      id: articleId,
      is_breaking: updatedArticle.breaking,
      metadata_is_breaking: updatedArticle.metadata?.is_breaking
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: 'تم تحديث المقال بنجاح'
    });

  } catch (error: any) {
    console.error('❌ [API PUT] خطأ في تحديث المقال:', {
      id: articleId,
      message: error.message,
      code: error.code
    });

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'المقال غير موجود',
          code: error.code 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'فشل تحديث المقال',
        details: error.message || 'خطأ غير معروف',
        code: error.code
      },
      { status: 500 }
    );
  }
} 