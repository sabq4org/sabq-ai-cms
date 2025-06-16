import { NextRequest, NextResponse } from 'next/server';

// ===============================
// أنواع البيانات
// ===============================

interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  description?: string;
  slug: string;
  color_hex: string;
  icon?: string;
  parent_id?: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  children?: Category[];
  article_count?: number;
  meta_title?: string;
  meta_description?: string;
  can_delete?: boolean;
}

interface UpdateCategoryRequest {
  name_ar?: string;
  name_en?: string;
  description?: string;
  slug?: string;
  color_hex?: string;
  icon?: string;
  parent_id?: number;
  position?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
}

// بيانات وهمية مطابقة لـ route.ts الرئيسي
let categories: Category[] = [
  {
    id: 1,
    name_ar: 'السياسة',
    name_en: 'Politics',
    description: 'أخبار سياسية محلية ودولية',
    slug: 'politics',
    color_hex: '#E5F1FA',
    icon: '🏛️',
    position: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T12:00:00Z',
    article_count: 45,
    meta_title: 'أخبار السياسة - صحيفة سبق',
    meta_description: 'تابع آخر الأخبار السياسية المحلية والدولية مع صحيفة سبق',
    can_delete: false
  },
  {
    id: 4,
    name_ar: 'الاقتصاد',
    name_en: 'Economy',
    description: 'أخبار اقتصادية ومالية',
    slug: 'economy',
    color_hex: '#E3FCEF',
    icon: '💰',
    position: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-14T14:15:00Z',
    article_count: 38,
    meta_title: 'الأخبار الاقتصادية - صحيفة سبق',
    meta_description: 'تابع آخر الأخبار الاقتصادية والمالية والاستثمارية',
    can_delete: false
  }
];

// ===============================
// وظائف مساعدة
// ===============================

// البحث عن تصنيف بالـ ID
function findCategoryById(id: number): Category | undefined {
  return categories.find(cat => cat.id === id);
}

// التحقق من صحة slug
function validateSlug(slug: string, excludeId?: number): boolean {
  return !categories.some(cat => cat.slug === slug && cat.id !== excludeId);
}

// ===============================
// معالجات API
// ===============================

// GET: استرجاع تصنيف واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'معرف التصنيف غير صحيح'
      }, { status: 400 });
    }

    const category = findCategoryById(categoryId);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// PUT: تحديث تصنيف
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'معرف التصنيف غير صحيح'
      }, { status: 400 });
    }

    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    const body: UpdateCategoryRequest = await request.json();
    const currentCategory = categories[categoryIndex];

    // التحقق من صحة البيانات
    if (body.slug && !validateSlug(body.slug, categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'مسار URL موجود بالفعل'
      }, { status: 400 });
    }

    // تحديث التصنيف
    const updatedCategory: Category = {
      ...currentCategory,
      name_ar: body.name_ar?.trim() || currentCategory.name_ar,
      name_en: body.name_en?.trim() || currentCategory.name_en,
      description: body.description?.trim() || currentCategory.description,
      slug: body.slug?.trim() || currentCategory.slug,
      color_hex: body.color_hex || currentCategory.color_hex,
      icon: body.icon || currentCategory.icon,
      parent_id: body.parent_id !== undefined ? body.parent_id : currentCategory.parent_id,
      position: body.position !== undefined ? body.position : currentCategory.position,
      is_active: body.is_active !== undefined ? body.is_active : currentCategory.is_active,
      meta_title: body.meta_title?.trim() || currentCategory.meta_title,
      meta_description: body.meta_description?.trim() || currentCategory.meta_description,
      updated_at: new Date().toISOString()
    };

    categories[categoryIndex] = updatedCategory;

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'تم تحديث التصنيف بنجاح'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE: حذف تصنيف
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'معرف التصنيف غير صحيح'
      }, { status: 400 });
    }

    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    const category = categories[categoryIndex];

    // التحقق من إمكانية الحذف
    if (!category.can_delete) {
      return NextResponse.json({
        success: false,
        error: 'لا يمكن حذف هذا التصنيف'
      }, { status: 403 });
    }

    // التحقق من وجود مقالات مرتبطة
    if (category.article_count && category.article_count > 0) {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get('force') === 'true';
      
      if (!force) {
        return NextResponse.json({
          success: false,
          error: 'لا يمكن حذف تصنيف يحتوي على مقالات. استخدم force=true للحذف القسري',
          meta: {
            article_count: category.article_count,
            can_force_delete: true
          }
        }, { status: 409 });
      }
    }

    // حذف التصنيف
    categories.splice(categoryIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح',
      data: {
        deleted_category_id: categoryId,
        deleted_category_name: category.name_ar
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// PATCH: تحديث جزئي (مثل تفعيل/تعطيل)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        error: 'معرف التصنيف غير صحيح'
      }, { status: 400 });
    }

    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    const body = await request.json();
    const { action, data } = body;

    if (action === 'toggle_status') {
      // تبديل حالة التفعيل
      categories[categoryIndex] = {
        ...categories[categoryIndex],
        is_active: !categories[categoryIndex].is_active,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: categories[categoryIndex],
        message: `تم ${categories[categoryIndex].is_active ? 'تفعيل' : 'إلغاء تفعيل'} التصنيف`
      });
    }

    if (action === 'update_position') {
      // تحديث الموضع
      const { position } = data;
      
      categories[categoryIndex] = {
        ...categories[categoryIndex],
        position: position,
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: categories[categoryIndex],
        message: 'تم تحديث موضع التصنيف'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'نوع العملية غير مدعوم'
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 