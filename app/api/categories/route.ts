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

interface CreateCategoryRequest {
  name_ar: string;
  name_en?: string;
  description?: string;
  slug: string;
  color_hex: string;
  icon?: string;
  parent_id?: number;
  position?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
}

// ===============================
// بيانات وهمية للتطوير
// ===============================

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

// التحقق من صحة slug
function validateSlug(slug: string, excludeId?: number): boolean {
  return !categories.some(cat => cat.slug === slug && cat.id !== excludeId);
}

// توليد ID جديد
function generateNewId(): number {
  return Math.max(...categories.map(cat => cat.id), 0) + 1;
}

// ===============================
// معالجات API
// ===============================

// GET: استرجاع جميع التصنيفات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active_only = searchParams.get('active_only') === 'true';
    const search = searchParams.get('search');

    let result = [...categories];

    // تطبيق الفلاتر
    if (active_only) {
      result = result.filter(cat => cat.is_active);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(cat => 
        cat.name_ar.toLowerCase().includes(searchLower) ||
        cat.name_en?.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        total: result.length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع التصنيفات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// POST: إنشاء تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();

    // التحقق من صحة البيانات المطلوبة
    if (!body.name_ar?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'اسم التصنيف بالعربية مطلوب'
      }, { status: 400 });
    }

    if (!body.slug?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'مسار URL (slug) مطلوب'
      }, { status: 400 });
    }

    // التحقق من عدم تكرار slug
    if (!validateSlug(body.slug)) {
      return NextResponse.json({
        success: false,
        error: 'مسار URL موجود بالفعل'
      }, { status: 400 });
    }

    // إنشاء التصنيف الجديد
    const newCategory: Category = {
      id: generateNewId(),
      name_ar: body.name_ar.trim(),
      name_en: body.name_en?.trim(),
      description: body.description?.trim(),
      slug: body.slug.trim(),
      color_hex: body.color_hex || '#E5F1FA',
      icon: body.icon || '📰',
      parent_id: body.parent_id,
      position: body.position || 0,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      article_count: 0,
      meta_title: body.meta_title?.trim(),
      meta_description: body.meta_description?.trim(),
      can_delete: true
    };

    categories.push(newCategory);

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'تم إنشاء التصنيف بنجاح'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 