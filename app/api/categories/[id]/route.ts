import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';
import { categoryCache } from '@/lib/category-cache';

// Helper: detect missing icon_url column errors
function isIconUrlColumnMissing(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('icon_url') && msg.includes('does not exist');
}

const safeCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  display_order: true,
  is_active: true,
  color: true,
  icon: true,
  // omit icon_url to avoid DBs missing the column
  metadata: true,
  created_at: true,
  updated_at: true,
} as const;

// PUT & PATCH: تحديث التصنيف
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    console.log('📝 تحديث التصنيف:', id);
    console.log('📊 البيانات المستلمة:', {
      name: body.name?.substring(0, 50),
      has_icon_url: !!body.icon_url,
      icon_url_length: body.icon_url?.length,
      has_metadata: !!body.metadata,
      metadata_size: JSON.stringify(body.metadata)?.length,
    });
    
    // دعم كلا الصيغتين: name/slug أو name/icon_url
    const updateBase: any = {
      updated_at: new Date(),
    };

    // إضافة الحقول الموجودة فقط
    if (body.name) updateBase.name = body.name;
    if (body.slug) updateBase.slug = body.slug;
    if (body.description !== undefined) updateBase.description = body.description;
    if (body.color) updateBase.color = body.color;

    // توحيد الصورة الهدف
    const targetIcon: string | null = body.icon_url || body.icon || null;
    if (targetIcon) {
      console.log('🖼️  تحديث صورة التصنيف - الطول:', targetIcon.length);
      // دائماً نحدث حقل icon للتوافق الخلفي
      updateBase.icon = targetIcon;
    }
    
    if (body.display_order !== undefined) updateBase.display_order = body.display_order;
    if (body.is_active !== undefined) updateBase.is_active = body.is_active;
    
    // معالجة metadata بحذر لتجنب تجاوز الحد الأقصى
    if (body.metadata) {
      const metadata = typeof body.metadata === 'string' 
        ? JSON.parse(body.metadata) 
        : body.metadata;
      
      // عدم تكرار icon_url داخل metadata إذا كان موجوداً بالفعل
      if (metadata.icon_url && targetIcon && metadata.icon_url === targetIcon) {
        delete metadata.icon_url;
      }
      
      updateBase.metadata = Object.keys(metadata).length > 0 ? metadata : null;
    }

    console.log('✅ حجم البيانات المرسلة:', JSON.stringify(updateBase).length, 'bytes');

    // حاول أولاً التحديث مع icon_url، وإذا فشل لأن العمود غير موجود، أعد المحاولة بدون icon_url
    const updateWithIconUrl = targetIcon ? { ...updateBase, icon_url: targetIcon } : updateBase;

    let updatedCategory = await dbConnectionManager.executeWithConnection(async () => {
      try {
        // First attempt: with icon_url, but return only safe columns
        return await prisma.categories.update({
          where: { id },
          data: updateWithIconUrl,
          select: safeCategorySelect,
        });
      } catch (err: any) {
        if (isIconUrlColumnMissing(err) && targetIcon) {
          console.warn('⚠️ icon_url غير موجود في قاعدة البيانات، سيتم التحديث بدون هذا الحقل');
          // Retry: without icon_url and still select safe columns
          return await prisma.categories.update({
            where: { id },
            data: updateBase,
            select: safeCategorySelect,
          });
        }
        throw err;
      }
    });

    console.log('✅ تم تحديث التصنيف بنجاح');
    
    // مسح كاش التصنيفات لضمان جلب البيانات المحدثة
    categoryCache.clear();

    return NextResponse.json({
      success: true,
      data: { ...updatedCategory, icon_url: targetIcon ?? updatedCategory.icon ?? null },
      message: 'تم تحديث التصنيف بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في تحديث التصنيف:', error);
    
    // معالجة خاصة لأخطاء طول البيانات
    if (error.message?.includes('too long') || error.message?.includes('character')) {
      return NextResponse.json({
        success: false,
        error: 'خطأ في حفظ بيانات التصنيف',
        details: 'البيانات المرسلة تتجاوز الحد الأقصى. تأكد من أن صورة التصنيف ليست طويلة جداً.',
        field: 'icon_url'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// GET: جلب تصنيف واحد (توافق خلفي إذا لم يتوفر عمود icon_url)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log('🔍 جلب التصنيف:', id);
    
    const category = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.findUnique({
        where: { id },
        select: safeCategorySelect,
      });
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    // احسب عدد المقالات المنشورة لهذا التصنيف
    const articlesCount = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.count({
        where: { category_id: id, status: 'published' }
      });
    });

    // أعد icon_url كـ fallback من icon لموافقة الواجهة
    const icon_url = (category as any).icon_url ?? category.icon ?? null;

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        icon_url,
        articles_count: articlesCount
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// PATCH: تحديث التصنيف (نفس PUT)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

// DELETE: حذف التصنيف
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log('🗑️ حذف التصنيف:', id);
    
    // التحقق من عدم وجود مقالات مرتبطة
    const articlesCount = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.count({
        where: { category_id: id }
      });
    });

    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: `لا يمكن حذف التصنيف لوجود ${articlesCount} مقال مرتبط به`
      }, { status: 400 });
    }

    // حذف التصنيف
    await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.delete({
        where: { id }
      });
    });

    console.log('✅ تم حذف التصنيف بنجاح');
    
    // مسح كاش التصنيفات لضمان جلب البيانات المحدثة
    categoryCache.clear();

    return NextResponse.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في حذف التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}