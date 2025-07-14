import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export const runtime = 'nodejs';

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // محاولة جلب من Redis cache أولاً
    const cacheKey = `article:${id}`;
    const cachedArticle = await cache.get(cacheKey);
    
    if (cachedArticle) {
      console.log(`✅ تم جلب المقال ${id} من Redis cache`);
      
      // زيادة عدد المشاهدات بشكل غير متزامن
      prisma.articles.updateMany({
        where: { 
          OR: [
            { id },
            { slug: id }
          ]
        },
        data: { views: { increment: 1 } }
      }).catch(err => console.error('خطأ في تحديث المشاهدات:', err));
      
      return NextResponse.json(cachedArticle);
    }
    
    // استخدام include لجلب جميع البيانات المطلوبة في استعلام واحد
    const dbArticle = await prisma.articles.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            name_en: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      }
    });
    
    if (!dbArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // جلب بيانات المؤلف
    const author = dbArticle.author_id 
      ? await prisma.users.findUnique({
          where: { id: dbArticle.author_id },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        })
      : null;
    
    // استخراج الكلمات المفتاحية من metadata
    let keywords: string[] = [];
    if (dbArticle.metadata && typeof dbArticle.metadata === 'object') {
      const metadata = dbArticle.metadata as any;
      if (metadata.keywords) {
        keywords = Array.isArray(metadata.keywords) ? metadata.keywords : [];
      }
    }
    
    // دمج الكلمات المفتاحية من seo_keywords إذا كانت موجودة
    if (dbArticle.seo_keywords) {
      if (typeof dbArticle.seo_keywords === 'string') {
        const seoKeywords = dbArticle.seo_keywords.split(',').map(k => k.trim()).filter(k => k);
        keywords = [...new Set([...keywords, ...seoKeywords])];
      }
    }
    
    // استخراج شرح الصورة من metadata
    let imageCaption = '';
    if (dbArticle.metadata && typeof dbArticle.metadata === 'object') {
      const metadata = dbArticle.metadata as any;
      imageCaption = metadata.image_caption || '';
    }

    // إضافة views_count من حقل views والكلمات المفتاحية
    const articleWithEnhancedData = {
      ...dbArticle,
      views_count: dbArticle.views || 0,
      seo_keywords: keywords.length > 0 ? keywords : dbArticle.seo_keywords,
      // إضافة حقول للتوافق مع صفحة التعديل
      description: dbArticle.excerpt || dbArticle.seo_description || '',
      summary: dbArticle.excerpt || '',
      image_caption: imageCaption,
      featured_image_caption: imageCaption,
      // إضافة بيانات المؤلف
      author: author || {
        id: dbArticle.author_id,
        name: (dbArticle.metadata as any)?.author_name || 'غير محدد',
        email: null
      },
      author_name: author?.name || (dbArticle.metadata as any)?.author_name || 'غير محدد',
      // إضافة بيانات التصنيف
      category: dbArticle.categories || null,
      category_name: dbArticle.categories?.name || 'غير مصنف',
      category_color: dbArticle.categories?.color || '#6B7280'
    };
    
    // زيادة عدد المشاهدات بشكل غير متزامن
    prisma.articles.update({
      where: { id: dbArticle.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('خطأ في تحديث المشاهدات:', err));
    
    // حفظ في Redis cache
    await cache.set(cacheKey, articleWithEnhancedData, CACHE_TTL.ARTICLES);
    console.log(`💾 تم حفظ المقال ${id} في Redis cache`);
    
    return NextResponse.json(articleWithEnhancedData);
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

    // معالجة الكلمات المفتاحية
    let keywordsToSave = null;
    if (updates.keywords) {
      keywordsToSave = updates.keywords;
      // حفظ الكلمات في seo_keywords كنص
      updates.seo_keywords = Array.isArray(updates.keywords) 
        ? updates.keywords.join(', ') 
        : updates.keywords;
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

    // إضافة الكلمات المفتاحية إلى metadata
    if (keywordsToSave) {
      dataToUpdate.metadata = {
        ...(updateData.metadata || {}),
        keywords: keywordsToSave
      };
    }

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
    const is_breaking = body.is_breaking === true || (metadata as any).is_breaking === true || false;
    
    // معالجة is_featured
    const is_featured = body.is_featured === true || (metadata as any).is_featured === true || false;
    
    // تحديث metadata بالقيم الصحيحة
    (metadata as any).is_breaking = is_breaking;
    (metadata as any).is_featured = is_featured;
    
    // إذا كان هناك كلمات مفتاحية في body
    if (body.keywords) {
      (metadata as any).keywords = body.keywords;
    }
    
    // إذا كان هناك اسم مؤلف
    if (body.author_name) {
      (metadata as any).author_name = body.author_name;
    }

    // إضافة شرح الصورة إلى metadata
    if (body.image_caption || body.featured_image_caption) {
      (metadata as any).image_caption = body.image_caption || body.featured_image_caption;
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
      seo_keywords: body.keywords ? (Array.isArray(body.keywords) ? body.keywords.join(', ') : body.keywords) : body.seo_keywords || null,
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
      metadata: updatedArticle.metadata
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