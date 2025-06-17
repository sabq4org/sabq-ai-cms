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
    name_ar: 'تقنية',
    name_en: 'Technology',
    description: 'أخبار وتطورات التقنية والذكاء الاصطناعي',
    slug: 'technology',
    color_hex: '#8B5CF6',
    icon: '💻',
    position: 1,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'أخبار التقنية والذكاء الاصطناعي - صحيفة سبق',
    meta_description: 'تابع آخر أخبار التقنية والذكاء الاصطناعي والابتكارات التكنولوجية',
    can_delete: false
  },
  {
    id: 2,
    name_ar: 'رياضة',
    name_en: 'Sports',
    description: 'أخبار رياضية محلية وعالمية',
    slug: 'sports',
    color_hex: '#F59E0B',
    icon: '⚽',
    position: 2,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'الأخبار الرياضية - صحيفة سبق',
    meta_description: 'تابع آخر الأخبار الرياضية المحلية والعالمية وأحدث النتائج',
    can_delete: false
  },
  {
    id: 3,
    name_ar: 'اقتصاد',
    name_en: 'Economy',
    description: 'تقارير السوق والمال والأعمال والطاقة',
    slug: 'economy',
    color_hex: '#10B981',
    icon: '💰',
    position: 3,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'الأخبار الاقتصادية - صحيفة سبق',
    meta_description: 'تابع آخر أخبار الاقتصاد والأسواق المالية والاستثمار والطاقة',
    can_delete: false
  },
  {
    id: 4,
    name_ar: 'سياسة',
    name_en: 'Politics',
    description: 'مستجدات السياسة المحلية والدولية وتحليلاتها',
    slug: 'politics',
    color_hex: '#EF4444',
    icon: '🏛️',
    position: 4,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'الأخبار السياسية - صحيفة سبق',
    meta_description: 'تابع آخر المستجدات السياسية المحلية والدولية والتحليلات السياسية',
    can_delete: false
  },
  {
    id: 5,
    name_ar: 'محليات',
    name_en: 'Local',
    description: 'أخبار المناطق والمدن السعودية',
    slug: 'local',
    color_hex: '#3B82F6',
    icon: '🗺️',
    position: 5,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'الأخبار المحلية - صحيفة سبق',
    meta_description: 'تابع آخر أخبار المناطق والمدن السعودية والأحداث المحلية',
    can_delete: false
  },
  {
    id: 6,
    name_ar: 'ثقافة ومجتمع',
    name_en: 'Culture',
    description: 'فعاليات ثقافية، مناسبات، قضايا اجتماعية',
    slug: 'culture',
    color_hex: '#EC4899',
    icon: '🎭',
    position: 6,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'الثقافة والمجتمع - صحيفة سبق',
    meta_description: 'تابع الفعاليات الثقافية والمناسبات والقضايا الاجتماعية المهمة',
    can_delete: false
  },
  {
    id: 7,
    name_ar: 'مقالات رأي',
    name_en: 'Opinion',
    description: 'تحليلات ووجهات نظر كتاب الرأي',
    slug: 'opinion',
    color_hex: '#7C3AED',
    icon: '✍️',
    position: 7,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'مقالات الرأي - صحيفة سبق',
    meta_description: 'اقرأ مقالات الرأي والتحليلات ووجهات النظر من كتاب صحيفة سبق',
    can_delete: false
  },
  {
    id: 8,
    name_ar: 'منوعات',
    name_en: 'Misc',
    description: 'أخبار خفيفة، لقطات، طرائف وأحداث غير تقليدية',
    slug: 'misc',
    color_hex: '#6B7280',
    icon: '🎉',
    position: 8,
    is_active: true,
    created_at: '2024-06-17T10:00:00Z',
    updated_at: '2024-06-17T10:00:00Z',
    article_count: 0,
    meta_title: 'المنوعات - صحيفة سبق',
    meta_description: 'تابع الأخبار الخفيفة والطريفة واللقطات والأحداث غير التقليدية',
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